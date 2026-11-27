// Utilidades matemáticas deterministas. Nada aquí depende de Math.random():
// cada fotograma se puede recalcular de forma idéntica en cualquier proceso.

export const TAU = Math.PI * 2;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const invLerp = (a: number, b: number, v: number) => clamp((v - a) / (b - a));
export const smoothstep = (a: number, b: number, v: number) => {
  const t = invLerp(a, b, v);
  return t * t * (3 - 2 * t);
};
export const easeInOut = (t: number) => {
  const c = clamp(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = (t: number) => Math.pow(clamp(t), 3);

export const lerpAngle = (a: number, b: number, t: number) => {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return a + d * t;
};

/** PRNG determinista (mulberry32). */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const hash1 = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
};

/** Ruido de valor 1D suave en [-1, 1]. */
export function noise1(x: number, seed = 0) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  const a = hash1(i + seed * 57.3);
  const b = hash1(i + 1 + seed * 57.3);
  return (a + (b - a) * u) * 2 - 1;
}

export function fbm1(x: number, seed = 0, octaves = 3) {
  let v = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    v += noise1(x * freq, seed + o * 13.1) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return v / norm;
}

// ---------- Color ----------
const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (v: number) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0');

export function mixColor(a: string, b: string, t: number) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return '#' + toHex(lerp(ca[0], cb[0], t)) + toHex(lerp(ca[1], cb[1], t)) + toHex(lerp(ca[2], cb[2], t));
}

export const shade = (c: string, amount: number) =>
  amount >= 0 ? mixColor(c, '#ffffff', amount) : mixColor(c, '#000000', -amount);

// ---------- Geometría ----------
export type Vec = {x: number; y: number};

const f1 = (n: number) => Math.round(n * 10) / 10;

/** Curva Catmull-Rom convertida a Bézier cúbicas (path SVG). */
export function smoothPath(pts: Vec[], closed = false, tension = 1): string {
  const n = pts.length;
  if (n < 2) return '';
  const get = (i: number) => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
  let d = `M${f1(pts[0].x)},${f1(pts[0].y)}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const k = tension / 6;
    d += `C${f1(p1.x + (p2.x - p0.x) * k)},${f1(p1.y + (p2.y - p0.y) * k)} ${f1(p2.x - (p3.x - p1.x) * k)},${f1(
      p2.y - (p3.y - p1.y) * k,
    )} ${f1(p2.x)},${f1(p2.y)}`;
  }
  return closed ? d + 'Z' : d;
}

export const polyPath = (pts: Vec[], closed = true) =>
  pts.map((p, i) => `${i ? 'L' : 'M'}${f1(p.x)},${f1(p.y)}`).join('') + (closed ? 'Z' : '');

/** Interpolación Catmull-Rom 1D sobre una lista ordenada de puntos (x, y). */
export function profileAt(points: [number, number][], x: number) {
  const n = points.length;
  if (x <= points[0][0]) return points[0][1];
  if (x >= points[n - 1][0]) return points[n - 1][1];
  let i = 0;
  while (i < n - 2 && x > points[i + 1][0]) i++;
  const p0 = points[Math.max(0, i - 1)][1];
  const p1 = points[i][1];
  const p2 = points[i + 1][1];
  const p3 = points[Math.min(n - 1, i + 2)][1];
  const t = (x - points[i][0]) / (points[i + 1][0] - points[i][0]);
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}
