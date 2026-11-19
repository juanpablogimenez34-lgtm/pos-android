// ESTADOS DE LOS CONEJITOS. Mila y Toto comparten el rig pero NO las animaciones:
//  · Mila: saltos amplios y elegantes, giros sobre una pata, aplauso, orejas expresivas.
//  · Toto: saltitos rápidos, vueltas pequeñas, tropiezos cómicos suaves, sorpresa exagerada.
import {clamp, easeInOut, lerp} from '../../../engine/math';
import {BunnyPose} from '../Characters/Bunny';
import {Face, FACE} from '../Rigging/face';
import {blink} from './lobiStates';

export type BP = Partial<BunnyPose>;
export const bface = (t: number, o: Partial<Face> = {}, seed = 0): Face => ({...FACE, smile: 0.7, blink: o.mode && o.mode !== 'normal' ? 0 : blink(t, seed), ...o});
const L = (a: number, b: number) => ({a, b});

/** Orejas con retraso respecto al movimiento vertical (animación secundaria). */
export function ears(t: number, vy: number, perk = 0, seed = 0): Pick<BunnyPose, 'earN' | 'earF'> {
  return {
    earN: {a: -0.08 + 0.05 * Math.sin(t * 2.1 + seed) - perk * 0.12, bend: 0.1 * Math.sin(t * 1.7 + seed) + vy * 0.004 - perk * 0.1},
    earF: {a: 0.14 + 0.05 * Math.sin(t * 2.5 + seed + 1) + perk * 0.12, bend: 0.25 + 0.12 * Math.sin(t * 2.0 + seed) + vy * 0.005 - perk * 0.2},
  };
}

export function bIdle(t: number, seed: number, o: Partial<Face> = {}): BP {
  return {upright: 0.45 + 0.03 * Math.sin(t * 2), nose: 1, head: {tilt: 0.06 * Math.sin(t * 0.8 + seed), turn: 0.2 * Math.sin(t * 0.5 + seed), pitch: 0}, ...ears(t, 0, 0, seed), face: bface(t, o, seed)};
}

/** Salto: u 0…1. `h` altura. Anticipación, impulso con patas traseras estiradas, vuelo, caída. */
export function bHop(t: number, u: number, h: number, seed: number): BP & {travel: number} {
  const pre = u < 0.18 ? Math.sin((u / 0.18) * Math.PI * 0.5) : 0;
  const k = clamp((u - 0.18) / 0.64);
  const air = k > 0 && k < 1 ? Math.sin(k * Math.PI) : 0;
  const land = u > 0.82 ? Math.sin(((u - 0.82) / 0.18) * Math.PI) : 0;
  const vy = Math.cos(k * Math.PI) * h; // positiva al subir
  return {
    upright: lerp(0.25, 0.55, air),
    bob: h * air,
    squash: 0.14 * pre + 0.16 * land - 0.1 * air,
    hindExt: k > 0 && k < 0.6 ? Math.sin((k / 0.6) * Math.PI) : 0,
    lean: -0.2 * air + 0.15 * land,
    frontN: L(lerp(0.2, 0.9, air), 0.5),
    frontF: L(lerp(0.1, 0.8, air), 0.5),
    ...ears(t, -vy, 0, seed),
    head: {tilt: 0, turn: 0.1, pitch: -0.1 * air},
    face: bface(t, {mode: air > 0.2 ? 'happy' : 'normal', jaw: 0.25 * air, cheeks: 0.8}, seed),
    nose: 0.5,
    travel: easeInOut(k),
  };
}

/** Giro sobre sí mismo (yaw), con anticipación; Mila gira con los brazos abiertos. */
export function bSpin(t: number, u: number, seed: number, wide = true): BP {
  const k = easeInOut(clamp((u - 0.15) / 0.75));
  return {upright: 0.9, yaw: k * Math.PI * 2, bob: 12 * Math.sin(k * Math.PI), squash: u < 0.15 ? 0.1 * Math.sin((u / 0.15) * Math.PI) : 0, frontN: L(wide ? 1.9 : 0.9, wide ? 0.2 : 1.2), frontF: L(wide ? 1.7 : 0.8, wide ? 0.2 : 1.2), ...ears(t, -40 * Math.cos(k * Math.PI * 2), 0.3, seed), face: bface(t, {mode: 'happy', jaw: 0.3, cheeks: 1}, seed)};
}

/** Aplauso estilizado: erguida, patas delanteras que se juntan en cada pulso (`ph` 0…1). */
export function bClap(t: number, ph: number, seed: number): BP {
  const c = Math.exp(-ph * 7);
  return {upright: 1, bob: 4 * c, frontN: L(1.15 + 0.35 * (1 - c), 1.1 - 0.3 * c), frontF: L(1.25 + 0.3 * (1 - c), 0.9 - 0.3 * c), head: {tilt: 0.1 * Math.sin(t * 4), turn: 0.3, pitch: -0.05}, ...ears(t, 20 * c, 0.2, seed), face: bface(t, {mode: 'happy', jaw: 0.35, cheeks: 1}, seed), nose: 1};
}

export function bLaugh(t: number, seed: number): BP {
  return {upright: 0.8, lean: -0.12 + 0.05 * Math.sin(t * 12), frontN: L(0.9, 1.6), frontF: L(0.8, 1.6), head: {tilt: -0.15, turn: 0.3, pitch: -0.12 + 0.04 * Math.sin(t * 12)}, ...ears(t, 0, 0.2, seed), face: bface(t, {mode: 'happy', jaw: 0.5 + 0.25 * Math.abs(Math.sin(t * 12)), cheeks: 1}, seed)};
}

/** Sorpresa (Toto): orejas tiesas, ojos muy abiertos y un respingo. */
export function bSurprise(t: number, u: number, seed: number): BP {
  const k = Math.sin(clamp(u / 0.4) * Math.PI);
  return {upright: 0.9, bob: 16 * k, squash: -0.08 * k, frontN: L(1.4, 1.0), frontF: L(1.3, 1.0), earN: {a: -0.05, bend: -0.05}, earF: {a: 0.08, bend: 0}, head: {tilt: 0, turn: 0.4, pitch: -0.08}, face: bface(t, {mode: 'wide', jaw: 0.55, browL: 1, browR: 1, smile: 0}, seed)};
}

/** Tropiezo cómico suave (Toto): se inclina, casi cae, rebota y sonríe. u 0…1. */
export function bStumble(t: number, u: number, seed: number): BP & {travel: number} {
  const a = u < 0.4 ? easeInOut(u / 0.4) : u < 0.7 ? 1 : 1 - easeInOut((u - 0.7) / 0.3);
  return {upright: 0.3 - 0.2 * a, lean: 0.55 * a, bob: u > 0.4 && u < 0.7 ? 6 * Math.sin(((u - 0.4) / 0.3) * Math.PI * 2) : 0, squash: 0.1 * a, frontN: L(0.9 * a + 0.2, -0.2), frontF: L(1.1 * a + 0.1, -0.3), ...ears(t, 60 * a, 0, seed), head: {tilt: 0.25 * a, turn: 0.4, pitch: 0.1 * a}, face: bface(t, u < 0.7 ? {mode: 'wide', jaw: 0.4, browL: 0.8, browR: 0.6, smile: -0.2} : {mode: 'happy', jaw: 0.3, cheeks: 1}, seed), travel: easeInOut(clamp(u / 0.5))};
}

/** Baile de Mila: balanceo elegante, saltito y giro cada 8 pulsos (beat decimal). */
export function milaDance(t: number, beat: number): BP & {dx: number} {
  const i = Math.floor(beat);
  const ph = beat - i;
  if (i % 8 === 6 || i % 8 === 7) return {...bSpin(t, ((i % 8) - 6 + ph) / 2, 4), dx: 0};
  const sway = Math.sin(((i % 2) + ph) * Math.PI);
  const hop = i % 4 === 3 ? Math.sin(ph * Math.PI) : 0;
  return {upright: 0.85, lean: 0.1 * sway, bob: 26 * hop + 4 * Math.abs(Math.sin(ph * Math.PI)), hindExt: hop * 0.6, frontN: L(1.3 + 0.5 * sway, 0.6), frontF: L(1.1 - 0.4 * sway, 0.6), head: {tilt: -0.14 * sway, turn: 0.3, pitch: 0}, ...ears(t, 40 * Math.cos(ph * Math.PI * 2), 0.1, 4), face: bface(t, {mode: i % 4 === 0 ? 'happy' : 'normal', jaw: 0.25, cheeks: 0.9}, 4), dx: 14 * sway};
}

/** Baile de Toto: saltitos rápidos en cada medio pulso y vuelta pequeña cada 4 pulsos. */
export function totoDance(t: number, beat: number): BP & {dx: number} {
  const i = Math.floor(beat);
  const ph = beat - i;
  if (i % 4 === 3) return {...bSpin(t, ph, 7, false), dx: 0};
  const hp = (ph * 2) % 1;
  const air = Math.sin(hp * Math.PI);
  return {upright: 0.6, bob: 18 * air, squash: hp > 0.85 ? 0.1 : -0.05 * air, hindExt: air * 0.8, frontN: L(0.6 + 0.8 * air, 0.8), frontF: L(0.5 + 0.7 * air, 0.8), head: {tilt: (i % 2 ? 0.12 : -0.12), turn: 0.4, pitch: 0}, ...ears(t, -60 * Math.cos(hp * Math.PI), 0, 7), face: bface(t, {mode: 'happy', jaw: 0.35 * air, cheeks: 1}, 7), dx: (i % 2 ? 10 : -10) * easeInOut(ph)};
}

/** Dormitar: se le cierran los ojos y cabecea. */
export function bDoze(t: number, k: number, seed: number): BP {
  const e = easeInOut(clamp(k));
  return {upright: lerp(0.45, 0.2, e), head: {tilt: 0.15 * e, turn: 0.1, pitch: 0.2 * e + 0.08 * e * Math.sin(t * 0.9)}, earN: {a: 0.3 * e, bend: 0.5 * e}, earF: {a: 0.45 * e, bend: 0.7 * e}, face: bface(t, {mode: e > 0.6 ? 'closed' : e > 0.2 ? 'half' : 'normal', smile: 0.5}, seed)};
}
