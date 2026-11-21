// Pistas de animación por fotogramas clave.
// Usamos Hermite cúbico con tangentes tipo Catmull-Rom: la velocidad es
// continua entre claves (movimientos de cámara sin "frenazos"), y se puede
// forzar una parada suave en una clave con `stop: true`.

import {clamp} from './math';

export type Key = {t: number; v: number; stop?: boolean};

export function track(keys: Key[], t: number): number {
  const n = keys.length;
  if (n === 0) return 0;
  if (t <= keys[0].t) return keys[0].v;
  if (t >= keys[n - 1].t) return keys[n - 1].v;
  let i = 0;
  while (i < n - 2 && t > keys[i + 1].t) i++;
  const k0 = keys[i];
  const k1 = keys[i + 1];
  const tangent = (j: number) => {
    const k = keys[j];
    if (k.stop || j === 0 || j === n - 1) return 0;
    return (keys[j + 1].v - keys[j - 1].v) / (keys[j + 1].t - keys[j - 1].t);
  };
  const dt = k1.t - k0.t;
  const u = clamp((t - k0.t) / dt);
  const u2 = u * u;
  const u3 = u2 * u;
  const m0 = tangent(i) * dt;
  const m1 = tangent(i + 1) * dt;
  return (2 * u3 - 3 * u2 + 1) * k0.v + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * k1.v + (u3 - u2) * m1;
}

/** Atajo: claves como tuplas [t, v] o [t, v, 'stop']. */
export type KeyTuple = [number, number] | [number, number, 'stop'];
export const keys = (list: KeyTuple[]): Key[] => list.map(([t, v, s]) => ({t, v, stop: s === 'stop'}));

/** Pulso 0→1→0 entre a y b con rampas de duración r. */
export const pulse = (t: number, a: number, b: number, r: number) =>
  clamp((t - a) / r) * clamp((b - t) / r);
