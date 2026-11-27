// MOVIMIENTO PROCEDURAL del camarón mantis: ojos con movimientos sacádicos INDEPENDIENTES, antenas
// que exploran, pleópodos que baten, marcha con avance ligado a los ciclos de patas, giro, asomarse,
// carga del apéndice (anticipación), golpe (ejecución en ~3 fotogramas reales), recuperación,
// manipulación de la presa y regreso al refugio. Todo depende solo del tiempo (determinista).
import {clamp, easeInOut, hash1, lerp} from '../../../engine/math';
import {EyePose, MantisPose} from '../characters/MantisShrimp';

export type MP = Partial<MantisPose>;
export const STEP = 26 / 0.6; // avance por ciclo de patas (los apoyos no resbalan)

/** Ojo con sacadas: cambia de objetivo cada ~1–1,8 s con una transición rápida. */
export function eyeAt(t: number, seed: number, range = 1): EyePose {
  const per = 1.0 + hash1(seed) * 0.8;
  const i = Math.floor(t / per);
  const ph = t / per - i;
  const tgt = (k: number) => ({pitch: (hash1(k * 3.7 + seed) - 0.5) * 0.9 * range, yaw: (hash1(k * 5.3 + seed * 2) - 0.5) * 2 * range});
  const a = tgt(i);
  const b = tgt(i + 1);
  const u = easeInOut(clamp((ph - 0.8) / 0.2));
  return {pitch: lerp(a.pitch, b.pitch, u) + Math.sin(t * 7 + seed) * 0.02, yaw: lerp(a.yaw, b.yaw, u)};
}

/** Animación secundaria común (siempre vivo). */
export function alive(t: number, o: {eyes?: number; ant?: number} = {}): MP {
  return {
    t,
    eyeN: eyeAt(t, 1, o.eyes ?? 1),
    eyeF: eyeAt(t + 0.37, 7, o.eyes ?? 1),
    antennae: (o.ant ?? 0) + 0.3 * Math.sin(t * 0.7),
    pleopods: t * 1.4,
    bodyY: 1.5 * Math.sin(t * 1.6),
    fan: 0.45 + 0.1 * Math.sin(t * 0.9),
  };
}

/** Marcha entre dos puntos en [t0, t1] con anticipación y frenada suaves. */
export function walkBetween(t: number, t0: number, t1: number, x0: number, x1: number): MP & {x: number} {
  const u = clamp((t - t0) / (t1 - t0));
  const e = easeInOut(u);
  const x = lerp(x0, x1, e);
  const moving = u > 0 && u < 1 ? 1 : 0;
  return {...alive(t), x, walk: Math.abs(x - x0) / STEP, walking: moving * clamp(Math.min(u, 1 - u) * 8), pitch: 0.02 * moving * Math.sin(t * 6), facing: x1 >= x0 ? 1 : -1};
}

/** Golpe: carga (anticipación) → golpe (ejecución) → recuperación.
 *  `ts` = instante del impacto; `speed` < 1 = cámara lenta (la duración se estira). */
export function strikeAt(t: number, ts: number, speed = 1): MP['raptor'] & {impact: number} {
  const cockT = 0.7 / speed;
  const hitT = 0.09 / speed;
  const recT = 0.8 / speed;
  const a = ts - hitT;
  if (t < a - cockT) return {cock: 0, strike: 0, hold: 0, impact: 0};
  if (t < a) return {cock: easeInOut((t - (a - cockT)) / cockT), strike: 0, hold: 0, impact: 0};
  if (t < ts) return {cock: 1, strike: Math.pow((t - a) / hitT, 0.6), hold: 0, impact: 0};
  if (t < ts + recT) {
    const u = (t - ts) / recT;
    return {cock: 1 - u, strike: 1 - easeInOut(u), hold: 0, impact: Math.exp(-u * 6)};
  }
  return {cock: 0, strike: 0, hold: 0, impact: 0};
}

/** Postura de acecho: cuerpo quieto y bajo, ojos fijos en la presa, antenas adelante. */
export function focusOn(t: number, look = 0.3): MP {
  return {...alive(t, {eyes: 0.15, ant: 0.8}), eyeN: {pitch: 0.25, yaw: look}, eyeF: {pitch: 0.22, yaw: look * 0.8}, bodyY: 6 + Math.sin(t * 2) * 0.6, pitch: 0.05};
}

/** Manipular la presa con los apéndices (oscila sujetando). */
export function manipulate(t: number, k = 1): MP {
  return {...alive(t, {eyes: 0.4}), raptor: {cock: 0, strike: 0, hold: k * (0.75 + 0.25 * Math.sin(t * 4))}, curl: 0.12 * k, pitch: 0.08 * k};
}
