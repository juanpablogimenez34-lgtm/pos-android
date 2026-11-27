// RIG DEL LEOPARDO (Panthera pardus): tipos, pose por defecto, IK y utilidades geométricas.
// El cuerpo se construye a partir de puntos de control (cadera, hombros, cuello, cabeza) que se
// deforman con la pose; las patas usan IK de dos segmentos (traseras con corvejón) hacia objetivos
// en el suelo, de modo que los apoyos son reales y no hay deslizamiento.
import {clamp, hash1, lerp} from '../../../engine/math';

export type Vec = {x: number; y: number};
export const V = (x: number, y: number): Vec => ({x, y});
export const add = (a: Vec, b: Vec): Vec => ({x: a.x + b.x, y: a.y + b.y});
export const mix = (a: Vec, b: Vec, k: number): Vec => ({x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k)});
export const rot = (p: Vec, a: number, c: Vec = {x: 0, y: 0}): Vec => {
  const s = Math.sin(a);
  const co = Math.cos(a);
  return {x: c.x + (p.x - c.x) * co - (p.y - c.y) * s, y: c.y + (p.x - c.x) * s + (p.y - c.y) * co};
};
export const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

/** IK de dos segmentos (coordenadas SVG, y hacia abajo); `bend` elige el lado de la articulación. */
export function ik(o: Vec, p: Vec, l1: number, l2: number, bend: number): {joint: Vec; end: Vec} {
  const dx = p.x - o.x;
  const dy = p.y - o.y;
  const d0 = Math.hypot(dx, dy) || 1e-3;
  const d = clamp(d0, Math.abs(l1 - l2) + 0.5, l1 + l2 - 0.5);
  const a = Math.atan2(dy, dx);
  const al = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const ja = a + bend * al;
  return {joint: {x: o.x + Math.cos(ja) * l1, y: o.y + Math.sin(ja) * l1}, end: {x: o.x + (dx / d0) * d, y: o.y + (dy / d0) * d}};
}

/** Curva suave por puntos (cuadráticas por puntos medios). */
export function smooth(pts: Vec[], close = false): string {
  const P = close ? [...pts, pts[0], pts[1]] : pts;
  let d = `M${f1(P[0].x)},${f1(P[0].y)}`;
  for (let i = 1; i < P.length - 1; i++) {
    const m = mix(P[i], P[i + 1], 0.5);
    d += ` Q${f1(P[i].x)},${f1(P[i].y)} ${f1(m.x)},${f1(m.y)}`;
  }
  if (!close) d += ` L${f1(P[P.length - 1].x)},${f1(P[P.length - 1].y)}`;
  return d + (close ? 'Z' : '');
}

export type PawKey = 'FN' | 'FF' | 'HN' | 'HF';
export const PAW0: Record<PawKey, Vec> = {FN: V(70, 0), FF: V(54, 0), HN: V(-74, 0), HF: V(-90, 0)};

export type LeopardPose = {
  x: number;
  y: number;
  scale: number;
  facing: 1 | -1;
  rot: number; // giro de todo el cuerpo (trepar)
  opacity: number;
  t: number;
  bodyY: number; // hundimiento del tronco (+ abajo)
  pitch: number; // inclinación del tronco (+ morro abajo)
  stretch: number; // flexión de la columna: −0.15 recogido · +0.15 estirado
  breathe: number; // 0–1
  neck: number; // 0 cabeza alta · 1 cabeza baja y adelantada (acecho)
  head: {pitch: number; tilt: number; turn: number};
  ears: number; // −1 aplastadas · 0 · 1 orientadas al frente
  eye: {blink: number; look: Vec; pupil: number; shine: number};
  jaw: number;
  tail: {base: number; amp: number; speed: number; curl: number};
  paws: Record<PawKey, Vec>;
  muscle: number; // 0–1 marcado muscular (esfuerzo, carrera)
  cub: number; // 0 adulto · 1 cachorro (proporciones y pelaje)
  night: number; // 0 día · 1 noche (tinte azulado)
  rim: string; // color de la luz de contorno
  rimK: number;
};

export const leopardPose = (o: Partial<LeopardPose> = {}): LeopardPose => ({
  x: 0,
  y: 0,
  scale: 1,
  facing: 1,
  rot: 0,
  opacity: 1,
  t: 0,
  bodyY: 0,
  pitch: 0,
  stretch: 0,
  breathe: 0.5,
  neck: 0,
  head: {pitch: 0, tilt: 0, turn: 0},
  ears: 0,
  eye: {blink: 0, look: V(0.3, 0), pupil: 0.45, shine: 0},
  jaw: 0,
  tail: {base: 0, amp: 0.4, speed: 1.2, curl: 0.5},
  paws: {...PAW0},
  muscle: 0.2,
  cub: 0,
  night: 0,
  rim: '#ffe2a8',
  rimK: 0.35,
  ...o,
});

/** Rosetas: posiciones fijas en el espacio del tronco (u a lo largo, v de lomo a vientre). */
export const ROSETTES = Array.from({length: 46}, (_, i) => {
  const row = i % 5;
  const col = Math.floor(i / 5);
  const u = 0.05 + (col / 9.2) * 0.9 + (hash1(i * 3.1) - 0.5) * 0.06 + (row % 2) * 0.05;
  const v = 0.12 + row * 0.16 + (hash1(i * 7.7) - 0.5) * 0.06;
  return {u: clamp(u, 0.03, 0.97), v, r: 9 + hash1(i * 1.9) * 5, rot: hash1(i * 5.3) * 360, gap: 0.7 + hash1(i * 2.2) * 0.9};
});
