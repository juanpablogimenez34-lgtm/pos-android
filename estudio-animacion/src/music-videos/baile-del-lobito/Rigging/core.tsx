// RIG — utilidades comunes del videoclip "El baile del lobito" (independiente de los proyectos
// anteriores; solo usa el motor compartido src/engine). Todo determinista.
import React from 'react';
import {clamp, lerp, mixColor} from '../../../engine/math';

export type Vec = {x: number; y: number};
export const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
export const V = (x: number, y: number): Vec => ({x, y});
export const add = (a: Vec, b: Vec): Vec => ({x: a.x + b.x, y: a.y + b.y});
export const lerpV = (a: Vec, b: Vec, k: number): Vec => ({x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k)});
export const rot = (p: Vec, a: number, c: Vec = {x: 0, y: 0}): Vec => {
  const s = Math.sin(a);
  const co = Math.cos(a);
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return {x: c.x + dx * co - dy * s, y: c.y + dx * s + dy * co};
};

/** IK de dos segmentos en el plano: devuelve la articulación intermedia para alcanzar `p`.
 *  `bend` = +1 / −1 elige hacia qué lado se dobla (rodilla adelante o atrás). */
export function ik(o: Vec, p: Vec, l1: number, l2: number, bend: number): {joint: Vec; end: Vec} {
  const dx = p.x - o.x;
  const dy = p.y - o.y;
  const d0 = Math.hypot(dx, dy) || 1e-3;
  const d = clamp(d0, Math.abs(l1 - l2) + 0.5, l1 + l2 - 0.5);
  const a = Math.atan2(dy, dx);
  const al = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const ja = a + bend * al;
  const joint = {x: o.x + Math.cos(ja) * l1, y: o.y + Math.sin(ja) * l1};
  const end = {x: o.x + (dx / d0) * d, y: o.y + (dy / d0) * d};
  return {joint, end};
}

/** Cápsula con contorno (segmento de extremidad con volumen y brillo). */
export const Capsule: React.FC<{a: Vec; b: Vec; w: number; color: string; outline: string; shine?: number}> = ({a, b, w, color, outline, shine = 0.18}) => (
  <g>
    <path d={`M${f1(a.x)},${f1(a.y)}L${f1(b.x)},${f1(b.y)}`} stroke={outline} strokeWidth={w + 6} strokeLinecap="round" />
    <path d={`M${f1(a.x)},${f1(a.y)}L${f1(b.x)},${f1(b.y)}`} stroke={color} strokeWidth={w} strokeLinecap="round" />
    {shine > 0 && <path d={`M${f1(a.x - w * 0.2)},${f1(a.y - w * 0.1)}L${f1(b.x - w * 0.2)},${f1(b.y - w * 0.1)}`} stroke="#ffffff" strokeOpacity={shine} strokeWidth={w * 0.22} strokeLinecap="round" />}
  </g>
);

/** Degradado esférico (volumen). */
export const Sphere: React.FC<{id: string; base: string; light?: number; dark?: number; cx?: number; cy?: number}> = ({id, base, light = 0.32, dark = 0.3, cx = 0.38, cy = 0.3}) => (
  <radialGradient id={id} cx={cx} cy={cy} r="0.78">
    <stop offset="0" stopColor={mixColor(base, '#ffffff', light)} />
    <stop offset="0.55" stopColor={base} />
    <stop offset="1" stopColor={mixColor(base, '#1c1430', dark)} />
  </radialGradient>
);

/** Trazo suave a través de puntos (curva cuadrática por puntos medios). */
export function smooth(pts: Vec[], close = false): string {
  if (pts.length < 2) return '';
  const P = close ? [...pts, pts[0], pts[1]] : pts;
  let d = `M${f1(P[0].x)},${f1(P[0].y)}`;
  for (let i = 1; i < P.length - 1; i++) {
    const m = lerpV(P[i], P[i + 1], 0.5);
    d += ` Q${f1(P[i].x)},${f1(P[i].y)} ${f1(m.x)},${f1(m.y)}`;
  }
  if (!close) d += ` L${f1(P[P.length - 1].x)},${f1(P[P.length - 1].y)}`;
  return d + (close ? 'Z' : '');
}

/** Contorno peludo: círculo con mechones (pelaje sin filtros). */
export function furCircle(c: Vec, r: number, n: number, tuft: number, seed = 0, from = 0, to = Math.PI * 2): string {
  const pts: Vec[] = [];
  for (let i = 0; i <= n; i++) {
    const a = from + ((to - from) * i) / n;
    const k = i % 2 === 0 ? 1 : 1 + tuft * (0.7 + 0.3 * Math.sin(i * 2.3 + seed));
    pts.push({x: c.x + Math.cos(a) * r * k, y: c.y + Math.sin(a) * r * k});
  }
  return smooth(pts, to - from >= Math.PI * 2 - 1e-3);
}
