// ANIMACIÓN MANDIBULAR Y DE NATACIÓN (determinista).
// Ataque en 5 fases: ANTICIPACIÓN (la boca empieza a abrirse) → ACELERACIÓN/EXTENSIÓN (las
// mandíbulas avanzan y la inferior baja) → CAPTURA (se cierran sobre la presa) → RECUPERACIÓN (las
// mandíbulas vuelven bajo el cráneo). El cráneo NO se traslada: solo se mueven las mandíbulas.
// `rate` < 1 estira el ataque (cámara lenta) sin cambiar la forma de la curva.
import {clamp, easeInOut, lerp} from '../../../engine/math';
import {SharkPose} from '../character/GoblinShark';

export type StrikePhase = 'idle' | 'anticipation' | 'extension' | 'capture' | 'recovery';
export const STRIKE_TIMES = {anticipation: 0.45, extension: 0.12, capture: 0.12, recovery: 0.75};

export function strike(t: number, ts: number, rate = 1): {jaw: number; open: number; phase: StrikePhase; u: number} {
  const A = STRIKE_TIMES.anticipation / rate;
  const E = STRIKE_TIMES.extension / rate;
  const C = STRIKE_TIMES.capture / rate;
  const R = STRIKE_TIMES.recovery / rate;
  const t0 = ts - E; // ts = instante de máxima extensión
  if (t < t0 - A) return {jaw: 0, open: 0, phase: 'idle', u: 0};
  if (t < t0) {
    const u = easeInOut((t - (t0 - A)) / A);
    return {jaw: 0.05 * u, open: 0.3 * u, phase: 'anticipation', u};
  }
  if (t < ts) {
    const u = (t - t0) / E;
    const k = u * u * (3 - 2 * u);
    return {jaw: lerp(0.05, 1, k), open: lerp(0.3, 1, Math.min(1, u * 1.4)), phase: 'extension', u};
  }
  if (t < ts + C) {
    const u = (t - ts) / C;
    return {jaw: 1, open: lerp(1, 0.12, easeInOut(u)), phase: 'capture', u};
  }
  if (t < ts + C + R) {
    const u = easeInOut((t - ts - C) / R);
    return {jaw: 1 - u, open: 0.12 * (1 - u), phase: 'recovery', u};
  }
  return {jaw: 0, open: 0, phase: 'idle', u: 1};
}

/** Natación lenta y controlada: fase de batido, ligera ondulación y avance. */
export const swim = (t: number, speed = 1, seed = 0): Partial<SharkPose> => ({t, beat: t * 2.1 * speed + seed, swim: 0.8 + 0.2 * Math.sin(t * 0.3 + seed)});

/** Avance horizontal con salida y frenada suaves. */
export const glide = (t: number, a: number, b: number, x0: number, x1: number) => lerp(x0, x1, easeInOut(clamp((t - a) / (b - a))));

/** Tiempo efectivo para una repetición a cámara lenta: [a, b] reproduce [ra, rb] más despacio. */
export const replay = (t: number, a: number, b: number, ra: number, rb: number) => (t < a || t >= b ? t : lerp(ra, rb, (t - a) / (b - a)));
