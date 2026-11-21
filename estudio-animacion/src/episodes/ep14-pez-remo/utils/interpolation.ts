// Interpolación por claves (valor en función del tiempo, con suavizado cinematográfico).
import {clamp, lerp} from '../../../engine/math';
export function keys(t: number, k: [number, number][]): number {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) {
    if (t <= k[i + 1][0]) {
      const u = clamp((t - k[i][0]) / (k[i + 1][0] - k[i][0]));
      return lerp(k[i][1], k[i + 1][1], u * u * (3 - 2 * u));
    }
  }
  return k[k.length - 1][1];
}
