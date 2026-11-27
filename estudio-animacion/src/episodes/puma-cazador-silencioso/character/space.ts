// ESPACIO 2.5D DEL PUMA (sin WebGL): el esqueleto vive en 3D (metros, Y arriba) y se proyecta
// a SVG con la orientación del animal (yaw) y una leve elevación de cámara. Cada volumen anatómico es
// un elipsoide cuya proyección ortográfica exacta es una elipse: la unión de elipses forma la silueta
// en CUALQUIER vista (perfil, 3/4, frente, espalda) sin comprimir ni girar una ilustración plana.
export type V3 = {x: number; y: number; z: number};
export const v3 = (x = 0, y = 0, z = 0): V3 => ({x, y, z});
export const add3 = (a: V3, b: V3): V3 => ({x: a.x + b.x, y: a.y + b.y, z: a.z + b.z});
export const sub3 = (a: V3, b: V3): V3 => ({x: a.x - b.x, y: a.y - b.y, z: a.z - b.z});
export const mul3 = (a: V3, k: number): V3 => ({x: a.x * k, y: a.y * k, z: a.z * k});
export const dot3 = (a: V3, b: V3) => a.x * b.x + a.y * b.y + a.z * b.z;
export const cross3 = (a: V3, b: V3): V3 => ({x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x});
export const len3 = (a: V3) => Math.hypot(a.x, a.y, a.z);
export const norm3 = (a: V3): V3 => mul3(a, 1 / (len3(a) || 1));
export const lerp3 = (a: V3, b: V3, t: number): V3 => ({x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t});
/** Giro alrededor del eje vertical (yaw, + = de +x hacia −z). */
export const yawV = (p: V3, a: number): V3 => ({x: p.x * Math.cos(a) + p.z * Math.sin(a), y: p.y, z: -p.x * Math.sin(a) + p.z * Math.cos(a)});
/** Giro en el plano sagital (pitch, + = morro arriba). */
export const pitchV = (p: V3, a: number): V3 => ({x: p.x * Math.cos(a) - p.y * Math.sin(a), y: p.x * Math.sin(a) + p.y * Math.cos(a), z: p.z});

export type View = {
  yaw: number; // 0 = perfil mirando a la derecha · π/2 = de frente · π = perfil izquierdo · −π/2 = de espaldas
  elev: number; // elevación de cámara (rad, + = cámara por encima)
  S: number; // píxeles por metro
  ox: number; // ancla en pantalla (mundo SVG)
  oy: number;
};

export type P2 = {x: number; y: number; d: number}; // d = profundidad (+ hacia la cámara)

/** Rota un vector local del animal al espacio de cámara (sin traslación). */
export function camDir(v: V3, w: View): V3 {
  const c = Math.cos(w.yaw);
  const s = Math.sin(w.yaw);
  // con yaw = π/2 el +x del animal apunta a la cámara (+z de cámara)
  const x1 = v.x * c - v.z * s;
  const z1 = v.x * s + v.z * c;
  const ce = Math.cos(w.elev);
  const se = Math.sin(w.elev);
  return {x: x1, y: v.y * ce - z1 * se, z: z1 * ce + v.y * se};
}
export function proj(p: V3, w: View): P2 {
  const q = camDir(p, w);
  return {x: w.ox + q.x * w.S, y: w.oy - q.y * w.S, d: q.z};
}
/** Vector proyectado (2D, píxeles; y hacia abajo). */
export function projV(v: V3, w: View) {
  const q = camDir(v, w);
  return {x: q.x * w.S, y: -q.y * w.S, d: q.z};
}
/** Hacia la cámara en coordenadas del animal se mide con camDir(n).z > 0. */
export const facing = (n: V3, w: View) => camDir(n, w).z;

export type Ell = {cx: number; cy: number; rx: number; ry: number; rot: number; d: number};
/**
 * Proyección exacta de un elipsoide de semiejes vectoriales A, B, C (ortogonales) centrado en c.
 * Matriz de forma 2D: M = a aᵀ + b bᵀ + c cᵀ con a, b, c proyectados; sus autovalores dan los semiejes.
 */
export function ellipsoid(c: V3, A: V3, B: V3, C: V3, w: View): Ell {
  const p = proj(c, w);
  const a = projV(A, w);
  const b = projV(B, w);
  const k = projV(C, w);
  const m11 = a.x * a.x + b.x * b.x + k.x * k.x;
  const m22 = a.y * a.y + b.y * b.y + k.y * k.y;
  const m12 = a.x * a.y + b.x * b.y + k.x * k.y;
  const tr = m11 + m22;
  const det = m11 * m22 - m12 * m12;
  const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det));
  const l1 = tr / 2 + disc;
  const l2 = Math.max(0, tr / 2 - disc);
  const ang = Math.abs(m12) < 1e-9 ? (m11 >= m22 ? 0 : Math.PI / 2) : Math.atan2(l1 - m11, m12);
  return {cx: p.x, cy: p.y, rx: Math.sqrt(l1), ry: Math.sqrt(l2), rot: (ang * 180) / Math.PI, d: p.d};
}
export const f1 = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);
