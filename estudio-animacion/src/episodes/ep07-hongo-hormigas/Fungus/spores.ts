// Liberación de esporas (158–173 s): desde la estructura fértil caen al ambiente como una
// nube tenue que la corriente de aire desvía; no "persiguen" a nadie. Posiciones deterministas.
import {fbm1, hash1} from '../../../engine/math';
import {V3} from '../Animation/proj';
import {EV} from '../Timeline/timeline';

export const SPORE_COUNT = 60;

/** Posición de la espora i en el instante t (null si aún no ha salido). */
export function sporeAt(i: number, t: number, src: V3): V3 | null {
  const t0 = EV.sporeRelease + hash1(i * 3.1) * 7.5;
  if (t < t0) return null;
  const u = t - t0;
  // salida breve y luego caída lenta con deriva lateral
  const out = 1 - Math.exp(-u * 3);
  const dirA = hash1(i * 5.7) * Math.PI * 2;
  return [
    src[0] + Math.cos(dirA) * 26 * out + u * 18 + fbm1(u * 0.6, i) * 60,
    src[1] - 14 * out - u * u * 10 - u * 38,
    src[2] + Math.sin(dirA) * 26 * out + fbm1(u * 0.5, i + 50) * 50,
  ];
}
