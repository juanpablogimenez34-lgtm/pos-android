// Utilidades de animación deterministas (dependen solo del tiempo del fotograma).
import {clamp} from '../../../engine/math';
export {clamp, lerp, easeInOut, smoothstep, hash1} from '../../../engine/math';
/** Ventana con entrada y salida suaves. */
export const win = (t: number, a: number, b: number, r = 0.4) => clamp((t - a) / r) * clamp((b - t) / r);
/** Progreso suavizado (quintic) entre a y b. */
export const seg = (t: number, a: number, b: number) => {
  const u = clamp((t - a) / (b - a));
  return u * u * u * (u * (u * 6 - 15) + 10);
};
