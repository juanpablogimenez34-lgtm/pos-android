// MOTOR DE INFLADO / DESINFLADO del pez erizo (Diodon holocanthus).
//
// Todo el personaje se define en coordenadas del cuerpo NORMAL (pez mirando a +x, centro en 0,0).
// La deformación es una MALLA POLAR continua: cada punto (x, y) del cuerpo normal se expresa como
// (ángulo θ, fracción radial s = r / R_normal(θ)) y se lleva a  s · R_def(θ, inflado)  en la misma
// dirección. R_def interpola, para cada dirección, entre el contorno normal (ovalado, con hocico romo y
// pedúnculo caudal) y el contorno inflado (casi esférico pero no geométrico). Así, silueta, manchas,
// textura, ojos, boca, aletas y anclajes de espinas se deforman de forma coherente y continua: el
// personaje puede pausarse en cualquier valor de inflado sin saltos ni reemplazos de dibujo.
//
// Cada dirección se infla con un pequeño retraso: el vientre primero, después los flancos y por
// último el dorso y la cabeza (que apenas cambia), lo que da una expansión orgánica.
import {clamp} from '../../../engine/math';

export type V = {x: number; y: number};

const A = 128; // semieje delantero (hocico)
const AR = 112; // semieje trasero
const B = 66; // semieje vertical
export const SPHERE = 150; // radio medio inflado

/** Radio del contorno NORMAL en la dirección θ (y hacia abajo = vientre). */
export function rNormal(th: number): number {
  const c = Math.cos(th);
  const s = Math.sin(th);
  const a = c >= 0 ? A : AR;
  let r = (a * B) / Math.sqrt((B * c) ** 2 + (a * s) ** 2);
  // hocico algo romo y frente alta (cabeza ancha integrada en el cuerpo)
  r *= 1 - 0.06 * Math.pow(Math.max(0, c), 6);
  // vientre ligeramente más lleno que el dorso
  r *= 1 + 0.04 * Math.max(0, s);
  return r;
}

/** Radio del contorno INFLADO: casi esfera, con la boca algo aplanada y el vientre más bajo. */
export function rInflated(th: number): number {
  const c = Math.cos(th);
  const s = Math.sin(th);
  let r = SPHERE * (1 + 0.035 * s + 0.02 * Math.cos(2 * th));
  r *= 1 - 0.07 * Math.pow(Math.max(0, c), 10); // zona de la boca
  r *= 1 - 0.18 * Math.pow(Math.max(0, -c), 14); // el pedúnculo caudal no se infla
  return r;
}

const smooth = (u: number) => {
  const v = clamp(u);
  return v * v * (3 - 2 * v);
};

/** Inflado local en la dirección θ para un inflado global `inf` (vientre primero). */
export function localInflation(th: number, inf: number): number {
  const s = Math.sin(th); // +1 vientre … −1 dorso
  const c = Math.cos(th);
  const lag = 0.22 * (0.5 - 0.5 * s) + 0.1 * Math.max(0, c); // dorso y cabeza más tarde
  return smooth((inf - lag) / (1 - lag));
}

export function rDef(th: number, inf: number): number {
  const k = localInflation(th, inf);
  return rNormal(th) + (rInflated(th) - rNormal(th)) * k;
}

/** Lleva un punto del cuerpo normal a su posición deformada. */
export function deform(p: V, inf: number): V {
  const th = Math.atan2(p.y, p.x);
  const r = Math.hypot(p.x, p.y);
  if (r < 1e-6) return {x: 0, y: 0};
  const s = r / rNormal(th);
  const R = rDef(th, inf) * s;
  return {x: Math.cos(th) * R, y: Math.sin(th) * R};
}

/** Factor de escala local (para el tamaño de manchas y marcas) en la dirección del punto. */
export function localScale(p: V, inf: number): number {
  const th = Math.atan2(p.y, p.x);
  return rDef(th, inf) / rNormal(th);
}

/** Contorno deformado (N puntos) para dibujar la silueta. */
export function outline(inf: number, n = 72): V[] {
  return Array.from({length: n}, (_, i) => {
    const th = -Math.PI + (i / n) * Math.PI * 2;
    const R = rDef(th, inf);
    return {x: Math.cos(th) * R, y: Math.sin(th) * R};
  });
}

/** Normal exterior aproximada del contorno deformado en la dirección θ. */
export function outward(th: number, inf: number): V {
  const e = 0.02;
  const p0 = {x: Math.cos(th - e) * rDef(th - e, inf), y: Math.sin(th - e) * rDef(th - e, inf)};
  const p1 = {x: Math.cos(th + e) * rDef(th + e, inf), y: Math.sin(th + e) * rDef(th + e, inf)};
  const tx = p1.x - p0.x;
  const ty = p1.y - p0.y;
  const l = Math.hypot(tx, ty) || 1;
  return {x: ty / l, y: -tx / l};
}
