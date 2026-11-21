// Copia de ep05-planta-carnivora/anatomy/proj.ts (los episodios anteriores no se modifican).
// Proyección 2.5D del Ep. 05 (sin Three.js): mundo 3D (X derecha, Y arriba, Z hacia la
// cámara) visto con una "vista" (guiñada + inclinación) y proyectado ortográficamente.
// La cámara del motor (zoom, encuadre, parallax) actúa después sobre el plano 2D resultante.
// Unidad del mundo: 0,1 mm (una mosca común mide unos 70 u; una trampa, unos 250 u).
import {Vec} from '../../../engine/math';

export type V3 = [number, number, number];
export type M3 = [V3, V3, V3]; // filas

export const v3 = (x: number, y: number, z: number): V3 => [x, y, z];
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scl = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const norm = (a: V3): V3 => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

export const mul = (m: M3, v: V3): V3 => [dot(m[0], v), dot(m[1], v), dot(m[2], v)];
export const mm = (a: M3, b: M3): M3 => {
  const c = (j: number): V3 => [b[0][j], b[1][j], b[2][j]];
  return [
    [dot(a[0], c(0)), dot(a[0], c(1)), dot(a[0], c(2))],
    [dot(a[1], c(0)), dot(a[1], c(1)), dot(a[1], c(2))],
    [dot(a[2], c(0)), dot(a[2], c(1)), dot(a[2], c(2))],
  ];
};
/** Rotación alrededor de X (inclinar hacia/desde la cámara). */
export const Rx = (a: number): M3 => [
  [1, 0, 0],
  [0, Math.cos(a), -Math.sin(a)],
  [0, Math.sin(a), Math.cos(a)],
];
/** Rotación alrededor de Y (guiñada sobre el suelo). */
export const Ry = (a: number): M3 => [
  [Math.cos(a), 0, Math.sin(a)],
  [0, 1, 0],
  [-Math.sin(a), 0, Math.cos(a)],
];
/** Rotación alrededor de Z (alabeo / cabeceo en el plano de la imagen). */
export const Rz = (a: number): M3 => [
  [Math.cos(a), -Math.sin(a), 0],
  [Math.sin(a), Math.cos(a), 0],
  [0, 0, 1],
];
export const I3: M3 = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
/** Matriz cuyas columnas son los ejes dados (marco local → mundo). */
export const frame = (x: V3, y: V3, z: V3): M3 => [
  [x[0], y[0], z[0]],
  [x[1], y[1], z[1]],
  [x[2], y[2], z[2]],
];

/** Vista de la escena: guiñada (yaw) y elevación de la cámara (pitch, 0 = de lado, π/2 = cenital). */
export type View = {yaw: number; pitch: number; M: M3};
export const makeView = (yaw: number, pitch: number): View => ({yaw, pitch, M: mm(Rx(pitch), Ry(yaw))});

/** Punto del mundo → plano 2D (y hacia abajo) + profundidad (mayor = más cerca de la cámara). */
export const project = (view: View, p: V3): Vec & {z: number} => {
  const q = mul(view.M, p);
  return {x: q[0], y: -q[1], z: q[2]};
};
/** Dirección del mundo → dirección en la vista (z > 0: apunta a la cámara). */
export const viewDir = (view: View, d: V3): V3 => mul(view.M, d);

/**
 * Silueta EXACTA de un elipsoide en proyección ortográfica: el elipsoide {c + A u, |u| ≤ 1}
 * se proyecta en la elipse de matriz (PA)(PA)ᵀ. Devuelve centro, semiejes y ángulo (grados).
 */
export function ellipsoidSilhouette(view: View, c: V3, axes: [V3, V3, V3]) {
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (const a of axes) {
    const q = mul(view.M, a);
    const x = q[0];
    const y = -q[1];
    sxx += x * x;
    sxy += x * y;
    syy += y * y;
  }
  const tr = sxx + syy;
  const det = sxx * syy - sxy * sxy;
  const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det));
  const l1 = tr / 2 + disc;
  const l2 = Math.max(1e-6, tr / 2 - disc);
  const ang = Math.abs(sxy) < 1e-9 ? (sxx >= syy ? 0 : Math.PI / 2) : Math.atan2(l1 - sxx, sxy);
  const pc = project(view, c);
  return {cx: pc.x, cy: pc.y, rx: Math.sqrt(l1), ry: Math.sqrt(l2), deg: (ang * 180) / Math.PI, z: pc.z};
}

/** IK de dos segmentos en 2D (rodilla hacia el lado `bend`): devuelve la articulación media. */
export function ik2(a: Vec, b: Vec, l1: number, l2: number, bend: 1 | -1): Vec {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.min(Math.hypot(dx, dy), l1 + l2 - 1e-3);
  const ux = dx / (Math.hypot(dx, dy) || 1);
  const uy = dy / (Math.hypot(dx, dy) || 1);
  const x = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  return {x: a.x + ux * x - uy * h * bend, y: a.y + uy * x + ux * h * bend};
}

/** IK de dos segmentos en 3D con un vector "polo" que fija hacia dónde se dobla la rodilla. */
export function ik3(a: V3, b: V3, l1: number, l2: number, pole: V3): V3 {
  const ab = sub(b, a);
  const dRaw = len(ab);
  const d = Math.min(dRaw, l1 + l2 - 1e-3);
  const u = norm(ab);
  const x = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  // componente del polo perpendicular al eje
  const pp = sub(pole, scl(u, dot(pole, u)));
  const n = len(pp) < 1e-6 ? norm(cross(u, [0, 0, 1])) : norm(pp);
  return add(add(a, scl(u, x)), scl(n, h));
}

/** Polígono de un SVG a partir de puntos 2D. */
export const pts2d = (l: Vec[]) => l.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
