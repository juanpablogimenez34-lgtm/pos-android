// ESTADOS DE ANIMACIÓN del dragón azul (deterministas, dependen solo del tiempo):
//  1 flotación natural · 2 giro 3D simulado · 3 apéndices independientes (en el modelo) ·
//  4 deriva por corrientes · 5 reacción a las olas · 6 aproximación a la presa · 7 alimentación ·
//  8 rotación lenta que revela el camuflaje · 9 interacción con otro individuo · 10 alejamiento.
import {clamp, easeInOut, lerp} from '../../../engine/math';
import {DragonPose} from '../character/BlueDragon';
import {DS} from '../config/episode';
import {waveY} from '../environment/Ocean';

export type DP = Partial<DragonPose>;
const ramp = (t: number, a: number, b: number) => easeInOut(clamp((t - a) / (b - a)));

/** 1 · Flotación natural: ondulación suave, respiración de las ceratas, leve balanceo. */
export const float = (t: number, seed = 0): DP => ({t: t + seed, scale: DS, bend: 1, sway: 1, spread: 0.92 + 0.08 * Math.sin(t * 0.8 + seed), heading: 0.05 * Math.sin(t * 0.35 + seed)});

/** 2 / 8 · Giro 3D simulado entre dos valores de roll. */
export const turn = (t: number, a: number, b: number, r0: number, r1: number): DP => ({roll: lerp(r0, r1, ramp(t, a, b)), spread: 1 - 0.3 * Math.sin(Math.PI * clamp((t - a) / (b - a)))});

/** 4 · Deriva por corrientes: desplazamiento lento con ligero serpenteo. */
export const drift = (t: number, t0: number, x0: number, y0: number, vx: number, vy = 0) => ({x: x0 + (t - t0) * vx + Math.sin(t * 0.4) * 10, y: y0 + (t - t0) * vy + Math.sin(t * 0.3 + 1) * 8});

/** 5 · Reacción a las olas (vista lateral): sigue la línea de agua y se inclina con la pendiente. */
export function onWave(t: number, x: number, below = 26, big?: {c: number; w: number; h: number}): DP & {x: number; y: number} {
  const y = waveY(x, t, big) + below;
  const slope = (waveY(x + 20, t, big) - waveY(x - 20, t, big)) / 40;
  return {x, y, heading: Math.atan(slope) * 0.9, bend: 1 + Math.abs(slope) * 2};
}

/** 6 / 7 · Aproximación y alimentación: la cabeza se adelanta y muerde de forma rítmica. */
export const feeding = (t: number, a: number, b: number): DP => {
  const k = ramp(t, a, a + 1.2) * (1 - ramp(t, b - 0.8, b));
  return {feed: k, bite: (t - a) * 1.4, spread: 1 - 0.25 * k, bend: 1 + 0.6 * k};
};

/** 9 · Interacción: dos individuos se acercan y se alinean costado con costado. */
export function pair(t: number, a: number, b: number, side: 1 | -1) {
  const u = ramp(t, a, b);
  return {x: side * lerp(520, 40, u), y: side * lerp(-300, -135, u), heading: side > 0 ? Math.PI + lerp(0.6, 0, u) : lerp(0.6, 0, u)};
}

/** 10 · Alejamiento: avanza mientras la cámara se retira. */
export const depart = (t: number, a: number): DP => ({spread: 0.9, bend: 1.3, sway: 1.2, opacity: 1 - 0.0 * (t - a)});
