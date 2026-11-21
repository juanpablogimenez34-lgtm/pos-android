// MOTOR DE ARTICULACIONES: vectores, cadenas de segmentos por ángulos absolutos, interpolación de
// ángulos y curvas suaves. Coordenadas SVG (y hacia abajo); ángulos en radianes desde +x.
import {clamp, easeInOut, lerp} from '../../../engine/math';

export type Vec = {x: number; y: number};
export const V = (x: number, y: number): Vec => ({x, y});
export const add = (a: Vec, b: Vec): Vec => ({x: a.x + b.x, y: a.y + b.y});
export const sub = (a: Vec, b: Vec): Vec => ({x: a.x - b.x, y: a.y - b.y});
export const mul = (a: Vec, k: number): Vec => ({x: a.x * k, y: a.y * k});
export const mix = (a: Vec, b: Vec, k: number): Vec => ({x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k)});
export const polar = (a: number, l: number): Vec => ({x: Math.cos(a) * l, y: Math.sin(a) * l});
export const rot = (p: Vec, a: number, c: Vec = V(0, 0)): Vec => {
  const s = Math.sin(a);
  const co = Math.cos(a);
  return {x: c.x + (p.x - c.x) * co - (p.y - c.y) * s, y: c.y + (p.x - c.x) * s + (p.y - c.y) * co};
};
export const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
export const deg = (r: number) => (r * 180) / Math.PI;
export const rad = (d: number) => (d * Math.PI) / 180;

/** Cadena de segmentos con ángulos ABSOLUTOS: devuelve las articulaciones. */
export function chain(o: Vec, segs: {a: number; l: number}[]): Vec[] {
  const pts = [o];
  segs.forEach((s) => pts.push(add(pts[pts.length - 1], polar(s.a, s.l))));
  return pts;
}

/** Interpolación por tramos entre poses clave de ángulos (en grados) con suavizado. */
export function angleKeys(k: number, keys: [number, number[]][]): number[] {
  if (k <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [ka, a] = keys[i];
    const [kb, b] = keys[i + 1];
    if (k <= kb) {
      const u = easeInOut(clamp((k - ka) / (kb - ka)));
      return a.map((v, j) => lerp(v, b[j], u));
    }
  }
  return keys[keys.length - 1][1];
}

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
