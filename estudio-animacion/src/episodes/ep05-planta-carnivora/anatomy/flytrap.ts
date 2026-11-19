// Anatomía de Dionaea muscipula (venus atrapamoscas) en 3D ligero.
// Cada hoja = pecíolo aplanado (alado) + trampa de dos lóbulos unidos por la nervadura central.
// Los lóbulos giran alrededor de la nervadura (bisagra) y su curvatura cambia de signo al
// cerrarse (de convexa a cóncava vista desde dentro), como describe el mecanismo de
// pandeo rápido. Bordes con cilios ("dientes"), 3 pelos sensitivos por lóbulo y glándulas.
import {clamp, fbm1, lerp, Vec} from '../../../engine/math';
import {add, cross, dot, norm, project, scl, sub, V3, View, viewDir} from './proj';

export type TrapSpec = {
  id: string;
  angle: number; // dirección radial sobre el suelo (rad; 0 = +X, π/2 = hacia la cámara)
  petiole: number; // longitud del pecíolo
  petioleW: number; // anchura máxima del pecíolo alado
  rise: number; // altura de la base de la trampa
  elev: number; // elevación de la nervadura (rad)
  tilt: number; // giro de la abertura alrededor de la nervadura (rad)
  L: number; // longitud de la trampa (nervadura)
  W: number; // anchura de cada lóbulo
  red: number; // pigmentación interior (0 verde – 1 rojo intenso)
  seed: number;
};

/** Estado articulado de una trampa (lo produce la línea de tiempo). */
export type TrapState = {
  open: number; // 1 abierta · 0 cerrada
  curv: number; // curvatura de los lóbulos: −1 convexa hacia dentro (abierta) · +1 cóncava (cerrada)
  cilia: number; // ángulo de los cilios: +1 hacia fuera · −1 hacia dentro (entrecruzados)
  seal: number; // 0–1 sellado (bordes apretados)
  hairs: number[]; // flexión de cada pelo sensitivo (6: 3 por lóbulo)
  glow: number; // 0–1 visualización de secreción digestiva
  signal: number; // 0–1 frente de la señal eléctrica (visualización)
  signalOn: number; // intensidad de la visualización de la señal
  husk: number; // 0–1 restos secos de la presa (tras la digestión)
  sway: number; // intensidad del vaivén ambiental
};

export const OPEN_STATE: TrapState = {open: 1, curv: -1, cilia: 1, seal: 0, hairs: [0, 0, 0, 0, 0, 0], glow: 0, signal: 0, signalOn: 0, husk: 0, sway: 1};

/** Posiciones (u, v) de los pelos sensitivos: 3 por lóbulo, en triángulo. */
export const HAIR_UV: [number, number][] = [
  [-0.42, 0.42],
  [0.08, 0.6],
  [0.46, 0.38],
];

export type TrapGeo = {
  spec: TrapSpec;
  st: TrapState;
  base: V3; // base de la trampa (fin del pecíolo)
  C: V3; // centro de la nervadura
  X: V3; // eje de la nervadura
  Y: V3; // bisectriz de la abertura
  Z: V3; // transversal
  phi: number; // semiapertura de cada lóbulo
  w: (u: number) => number;
  point: (s: 1 | -1, u: number, v: number) => V3;
  normal: (s: 1 | -1) => V3; // normal exterior de cada lóbulo
  lobeDir: (s: 1 | -1) => V3;
};

const PHI_OPEN = 0.66; // ≈ 38° por lóbulo (unos 75° entre lóbulos)
const PHI_CLOSED = 0.05;

export function trapGeo(spec: TrapSpec, st: TrapState, t: number, origin: V3 = [0, 0, 0]): TrapGeo {
  // vaivén ambiental muy sutil (viento) — determinista
  const sw = st.sway * (fbm1(t * 0.35, spec.seed) * 0.05 + Math.sin(t * 1.3 + spec.seed) * 0.012);
  const ang = spec.angle + sw * 0.6;
  const d: V3 = [Math.cos(ang), 0, Math.sin(ang)];
  const base = add(origin, add(scl(d, spec.petiole), [0, spec.rise, 0]));
  const el = spec.elev + sw;
  const X = norm(add(scl(d, Math.cos(el)), [0, Math.sin(el), 0]));
  const up: V3 = [0, 1, 0];
  let Y0 = norm(sub(up, scl(X, dot(up, X))));
  let Z0 = cross(X, Y0);
  const tl = spec.tilt + sw * 0.5;
  const Y = norm(add(scl(Y0, Math.cos(tl)), scl(Z0, Math.sin(tl))));
  const Z = cross(X, Y);
  Y0 = Y;
  Z0 = Z;
  const phi = lerp(PHI_CLOSED, PHI_OPEN, clamp(st.open));
  const C = add(base, scl(X, spec.L * 0.5 + 6));
  const w = (u: number) => spec.W * Math.pow(Math.max(0, 1 - u * u), 0.55);
  const lobeDir = (s: 1 | -1): V3 => add(scl(Y0, Math.cos(phi)), scl(Z0, s * Math.sin(phi)));
  const normal = (s: 1 | -1): V3 => add(scl(Y0, -Math.sin(phi)), scl(Z0, s * Math.cos(phi)));
  // sellado: los bordes se aprietan y la trampa se aplana ligeramente
  const kappa = lerp(-0.13, 0.2, (clamp(st.curv, -1, 1) + 1) / 2) * (1 - 0.35 * st.seal);
  const point = (s: 1 | -1, u: number, v: number): V3 => {
    const e = lobeDir(s);
    const n = normal(s);
    const ww = w(u);
    const bulge = spec.W * kappa * Math.sin(Math.PI * clamp(v)) * (1 - u * u);
    // margen ligeramente curvado hacia fuera en la trampa abierta
    const curl = spec.W * 0.07 * clamp(st.open) * Math.pow(clamp(v), 4) * (1 - u * u);
    return add(add(add(C, scl(X, (u * spec.L) / 2)), scl(e, v * ww)), scl(n, bulge + curl));
  };
  return {spec, st, base, C, X, Y: Y0, Z: Z0, phi, w, point, normal, lobeDir};
}

/** Punto + normal INTERIOR (hacia la abertura) sobre la cara interna de un lóbulo. */
export function lobeSurface(g: TrapGeo, s: 1 | -1, u: number, v: number) {
  const p = g.point(s, u, v);
  const du = sub(g.point(s, Math.min(0.99, u + 0.01), v), g.point(s, Math.max(-0.99, u - 0.01), v));
  const dv = sub(g.point(s, u, Math.min(1, v + 0.01)), g.point(s, u, Math.max(0, v - 0.01)));
  let n = norm(cross(du, dv));
  // orientar hacia el interior (opuesto a la normal exterior del lóbulo)
  if (dot(n, g.normal(s)) > 0) n = scl(n, -1);
  return {p, n, du: norm(du), dv: norm(dv)};
}

/** Base y punta de un pelo sensitivo (flexión hacia la nervadura cuando se toca). */
export function hairTip(g: TrapGeo, k: number) {
  const s: 1 | -1 = k < 3 ? 1 : -1;
  const [u, v] = HAIR_UV[k % 3];
  const {p, n, du} = lobeSurface(g, s, u * (s === 1 ? 1 : -1), v);
  const bend = g.st.hairs[k] ?? 0;
  const L = g.spec.W * 0.17;
  const dir = norm(add(add(scl(n, Math.cos(bend)), scl(du, Math.sin(bend))), scl(g.lobeDir(s), 0.25)));
  return {base: p, tip: add(p, scl(dir, L)), s, n};
}

/** Pecíolo alado: contorno izquierdo/derecho y nervio central (en 3D). */
export function petioleGeo(spec: TrapSpec, g: TrapGeo, origin: V3 = [0, 0, 0]) {
  const N = 14;
  const left: V3[] = [];
  const right: V3[] = [];
  const mid: V3[] = [];
  const o = add(origin, [0, 4, 0]);
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    // arco suave desde el centro de la roseta hasta la base de la trampa
    const p = add(add(scl(o, 1 - t), scl(g.base, t)), [0, Math.sin(Math.PI * t) * spec.rise * 0.25, 0]);
    const ahead = i < N ? add(add(scl(o, 1 - (t + 1 / N)), scl(g.base, t + 1 / N)), [0, Math.sin(Math.PI * (t + 1 / N)) * spec.rise * 0.25, 0]) : add(p, sub(p, mid[i - 1]));
    const tan = norm(sub(ahead, p));
    const side = norm(cross(tan, [0, 1, 0]));
    // pecíolo espatulado: estrecho en la base, ancho en el centro, cuello corto antes de la trampa
    const wp = spec.petioleW * (0.18 + 0.82 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.75)), 1.2)) * (t > 0.9 ? lerp(1, 0.25, (t - 0.9) / 0.1) : 1);
    left.push(add(p, scl(side, wp / 2)));
    right.push(add(p, scl(side, -wp / 2)));
    mid.push(p);
  }
  return {left, right, mid};
}

/** Convex hull 2D (monotone chain). */
export function hull(points: Vec[]): Vec[] {
  const p = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  if (p.length < 3) return p;
  const crossZ = (o: Vec, a: Vec, b: Vec) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: Vec[] = [];
  for (const q of p) {
    while (lower.length >= 2 && crossZ(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  const upper: Vec[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (upper.length >= 2 && crossZ(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
    upper.push(q);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

/** ¿Qué cara de un lóbulo ve la cámara? true = interior. */
export const innerVisible = (view: View, g: TrapGeo, s: 1 | -1) => viewDir(view, g.normal(s))[2] < 0;

export const P2 = (view: View, p: V3) => project(view, p);
