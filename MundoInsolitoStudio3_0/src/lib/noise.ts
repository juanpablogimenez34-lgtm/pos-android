// Ruido determinista (semilla fija): valor 2D/3D con interpolación quíntica y fbm. Base de texturas y variaciones.
export function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
}
const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const h2 = (x: number, y: number, seed: number) => hash(x * 157.31 + y * 113.77 + seed * 1.618);
export function noise2(x: number, y: number, seed = 0) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = fade(xf);
  const v = fade(yf);
  const a = h2(xi, yi, seed);
  const b = h2(xi + 1, yi, seed);
  const c = h2(xi, yi + 1, seed);
  const d = h2(xi + 1, yi + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
/** fbm periódico en x (p = periodo) para texturas que envuelven el cuerpo sin costura. */
export function fbm2(x: number, y: number, oct = 4, seed = 0, periodY = 0) {
  let s = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    let yy = y * f;
    if (periodY > 0) {
      const P = periodY * f;
      // mezcla entre dos muestras desplazadas para que la textura sea continua alrededor del cuerpo
      const t = (yy % P) / P;
      const n1 = noise2(x * f, yy % P, seed + i);
      const n2 = noise2(x * f, (yy % P) - P, seed + i);
      s += a * (n1 * (1 - t) + n2 * t);
    } else s += a * noise2(x * f, yy, seed + i);
    a *= 0.5;
    f *= 2.03;
  }
  return s;
}
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
