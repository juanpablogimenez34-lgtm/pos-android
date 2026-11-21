// SISTEMA DE CÁMARA virtual (basado en el del Ep. 08, que no se modifica): (x, y) = punto del
// mundo en el centro del cuadro; zoom = dolly; roll; profundidad d para el parallax multicapa.
import {clamp, easeInOut, lerp} from '../../../engine/math';

export type Cam = {x: number; y: number; zoom: number; roll: number};
export const W = 1080;
export const H = 1920;

export const layerT = (c: Cam, d = 1) => {
  const z = Math.pow(c.zoom, d);
  return `translate(${W / 2} ${H / 2}) rotate(${((c.roll * d * 180) / Math.PI).toFixed(3)}) scale(${z.toFixed(4)}) translate(${(-c.x * d).toFixed(1)} ${(-c.y * d).toFixed(1)})`;
};
/** Punto del mundo (plano d) → pantalla. */
export const toScreen = (c: Cam, x: number, y: number, d = 1) => {
  const z = Math.pow(c.zoom, d);
  const dx = (x - c.x * d) * z;
  const dy = (y - c.y * d) * z;
  const co = Math.cos(c.roll * d);
  const s = Math.sin(c.roll * d);
  return {x: W / 2 + dx * co - dy * s, y: H / 2 + dx * s + dy * co};
};

export type CamKey = [number, number, number, number, number?];
export function camAt(keys: CamKey[], t: number): Cam {
  if (t <= keys[0][0]) return {x: keys[0][1], y: keys[0][2], zoom: keys[0][3], roll: keys[0][4] ?? 0};
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t <= b[0]) {
      const u = easeInOut(clamp((t - a[0]) / (b[0] - a[0])));
      return {x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), zoom: Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u)), roll: lerp(a[4] ?? 0, b[4] ?? 0, u)};
    }
  }
  const l = keys[keys.length - 1];
  return {x: l[1], y: l[2], zoom: l[3], roll: l[4] ?? 0};
}

/** Movimiento de cámara en mano, muy leve (deriva orgánica, no temblor). */
export const drift = (c: Cam, t: number, k = 1): Cam => ({...c, x: c.x + Math.sin(t * 0.37) * 6 * k, y: c.y + Math.sin(t * 0.29 + 1) * 5 * k, roll: c.roll + Math.sin(t * 0.21) * 0.004 * k});

/** Enfoque simulado: desenfoque por capas mediante opacidad y tinte (sin filtros costosos). */
export const focusFade = (depth: number, focus: number, k = 1) => Math.max(0.35, 1 - Math.abs(depth - focus) * 0.6 * k);
