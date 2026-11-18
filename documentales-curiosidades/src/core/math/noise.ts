/**
 * Ruido y aleatoriedad DETERMINISTAS.
 * Remotion renderiza cada fotograma de forma independiente (y en paralelo),
 * por lo que nada puede depender de Math.random() ni del fotograma anterior.
 * Todo es función pura de (semilla, posición, tiempo).
 */

/** Hash entero -> [0,1). */
export const hash2 = (x: number, y: number, seed = 0): number => {
  let h = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1) ^ Math.imul(seed | 0, 0x9e3779b9);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};

/** Generador pseudoaleatorio con semilla (mulberry32). */
export const createRng = (seed: number) => {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (min: number, max: number) => min + (max - min) * next(),
    pick: <T,>(arr: readonly T[]) => arr[Math.floor(next() * arr.length)],
  };
};

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Ruido de valor 2D suave en [0,1]. */
export const valueNoise2 = (x: number, y: number, seed = 0): number => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = fade(x - ix);
  const fy = fade(y - iy);
  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);
  return lerp(lerp(a, b, fx), lerp(c, d, fx), fy);
};

/** Fractal Brownian Motion 2D en aprox. [-0.5, 0.5]. */
export const fbm2 = (x: number, y: number, octaves = 4, seed = 0): number => {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * (valueNoise2(x * freq, y * freq, seed + i * 17) - 0.5);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm;
};

/** Ruido 1D suave (para micro-movimientos de cámara, respiración, etc.). */
export const noise1 = (t: number, seed = 0): number => valueNoise2(t, 0.5, seed) * 2 - 1;

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export { lerp };
