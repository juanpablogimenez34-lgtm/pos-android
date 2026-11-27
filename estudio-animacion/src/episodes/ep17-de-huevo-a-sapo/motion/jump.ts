// SISTEMA DE SALTO del sapo: anticipación (se agacha y pliega las patas) → despegue (extensión
// explosiva de las patas posteriores, el cuerpo se inclina hacia arriba) → vuelo (parábola, patas
// estiradas, brazos hacia delante) → contacto (los brazos tocan primero) → compresión → recuperación.
import {clamp, easeInOut} from '../../../engine/math';

export type JumpPose = {dx: number; dy: number; crouch: number; fold: number; armReach: number; tilt: number; phase: string};
export const JUMP = {anticipation: 0.36, takeoff: 0.12, flight: 0.46, contact: 0.1, recovery: 0.42};

/** t0 = inicio de la anticipación; dist = distancia horizontal; h = altura del arco (unidades). */
export function jumpAt(t: number, t0: number, dist: number, h: number): JumpPose {
  const a = t0 + JUMP.anticipation;
  const b = a + JUMP.takeoff;
  const c = b + JUMP.flight;
  const d = c + JUMP.contact;
  const e = d + JUMP.recovery;
  if (t < t0) return {dx: 0, dy: 0, crouch: 0, fold: 1, armReach: 0, tilt: 0, phase: 'reposo'};
  if (t < a) {
    const u = easeInOut((t - t0) / JUMP.anticipation);
    return {dx: -2 * u, dy: 0, crouch: u, fold: 1, armReach: 0, tilt: 0.06 * u, phase: 'anticipación'};
  }
  if (t < b) {
    const u = (t - a) / JUMP.takeoff;
    return {dx: dist * 0.08 * u, dy: -h * 0.15 * u, crouch: 1 - u, fold: 1 - u, armReach: 0.3 * u, tilt: -0.35 * u, phase: 'despegue'};
  }
  if (t < c) {
    const u = (t - b) / JUMP.flight;
    const x = 0.08 + 0.84 * u;
    return {dx: dist * x, dy: -h * (0.15 + 0.85 * 4 * u * (1 - u)) * (1 - 0.15 * u), crouch: 0, fold: 0.15 * u, armReach: 0.3 + 0.7 * u, tilt: -0.35 + 0.65 * u, phase: 'vuelo'};
  }
  if (t < d) {
    const u = (t - c) / JUMP.contact;
    return {dx: dist * (0.92 + 0.08 * u), dy: 0, crouch: 0.85 * u, fold: 0.15 + 0.5 * u, armReach: 1 - 0.6 * u, tilt: 0.3 - 0.2 * u, phase: 'contacto'};
  }
  if (t < e) {
    const u = easeInOut((t - d) / JUMP.recovery);
    return {dx: dist, dy: 0, crouch: 0.85 * (1 - u), fold: 0.65 + 0.35 * u, armReach: 0.4 * (1 - u), tilt: 0.1 * (1 - u), phase: 'recuperación'};
  }
  return {dx: dist, dy: 0, crouch: 0, fold: 1, armReach: 0, tilt: 0, phase: 'reposo'};
}
export const jumpEnd = (t0: number) => t0 + JUMP.anticipation + JUMP.takeoff + JUMP.flight + JUMP.contact + JUMP.recovery;
export const _c = clamp;
