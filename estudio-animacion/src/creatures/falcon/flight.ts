// Estados de vuelo del halcón. Cada estado es un conjunto de parámetros continuos;
// las transiciones mezclan parámetros. El batido usa una fase INTEGRADA (la frecuencia
// puede cambiar sin saltos) y una carrera descendente más rápida que la ascendente.

import {clamp, lerp, smoothstep, TAU} from '../../engine/math';

export type FlightState =
  | 'PERCHED'
  | 'TAKEOFF'
  | 'SOARING'
  | 'FLAPPING'
  | 'GLIDING'
  | 'STOOP_PREPARATION'
  | 'HIGH_SPEED_DIVE'
  | 'PURSUIT'
  | 'BRAKING'
  | 'LANDING';

export type FlightParams = {
  flapAmp: number;
  flapFreq: number;
  flapBias: number;
  fold: number;
  sweep: number;
  tail: number;
  tailPitch: number;
  legs: number;
  nict: number;
  bodyPitch: number; // inclinación extra del cuerpo (rad)
};

const base: FlightParams = {flapAmp: 0, flapFreq: 0, flapBias: 0.05, fold: 0, sweep: 0, tail: 0.3, tailPitch: 0, legs: 0, nict: 0, bodyPitch: 0};

export const FLIGHT_PRESETS: Record<FlightState, FlightParams> = {
  PERCHED: {...base, fold: 1, tail: 0.05, legs: 1, bodyPitch: 0.85, flapBias: -0.2},
  TAKEOFF: {...base, flapAmp: 1.05, flapFreq: 4.4, flapBias: 0.15, tail: 0.75, legs: 0.6, bodyPitch: 0.45, tailPitch: 0.1},
  SOARING: {...base, flapAmp: 0.025, flapFreq: 0.6, flapBias: 0.08, tail: 0.95, sweep: 0},
  FLAPPING: {...base, flapAmp: 0.85, flapFreq: 3.8, flapBias: 0.1, tail: 0.35},
  GLIDING: {...base, flapAmp: 0.02, flapFreq: 0.5, flapBias: 0.04, sweep: 0.22, tail: 0.2, bodyPitch: -0.04},
  STOOP_PREPARATION: {...base, flapAmp: 0.08, flapFreq: 1.2, flapBias: 0.12, sweep: 0.55, fold: 0.12, tail: 0.1, bodyPitch: -0.5},
  HIGH_SPEED_DIVE: {...base, flapAmp: 0, flapFreq: 0, flapBias: 0.02, sweep: 0.92, fold: 0.38, tail: 0.0, nict: 1, bodyPitch: 0},
  PURSUIT: {...base, flapAmp: 0.6, flapFreq: 4.8, flapBias: 0.05, sweep: 0.45, tail: 0.5, tailPitch: 0.05},
  BRAKING: {...base, flapAmp: 0.55, flapFreq: 3.0, flapBias: 0.25, sweep: 0, tail: 1, tailPitch: -0.35, legs: 0.35, bodyPitch: 0.5},
  LANDING: {...base, flapAmp: 0.8, flapFreq: 3.4, flapBias: 0.3, tail: 1, tailPitch: -0.4, legs: 1, bodyPitch: 0.6},
};

export type FlightKey = {t: number; state: FlightState; blend?: number};

const lerpP = (a: FlightParams, b: FlightParams, k: number): FlightParams => {
  const o = {} as FlightParams;
  (Object.keys(a) as (keyof FlightParams)[]).forEach((key) => (o[key] = lerp(a[key], b[key], k)));
  return o;
};

export function flightAt(keys: FlightKey[], t: number): FlightParams {
  let p = FLIGHT_PRESETS[keys[0].state];
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (t < k.t) break;
    p = lerpP(p, FLIGHT_PRESETS[k.state], smoothstep(k.t, k.t + (k.blend ?? 0.6), t));
  }
  return p;
}

export function flightStateAt(keys: FlightKey[], t: number): FlightState {
  let s = keys[0].state;
  for (const k of keys) if (t >= k.t) s = k.state;
  return s;
}

/** Fase del batido integrada numéricamente (paso 1/20 s): sin saltos al cambiar la frecuencia. */
export function flapPhase(keys: FlightKey[], t: number, timeScale: (t: number) => number = () => 1) {
  const dt = 0.05;
  let ph = 0;
  for (let u = 0; u < t; u += dt) ph += flightAt(keys, u).flapFreq * timeScale(u) * Math.min(dt, t - u);
  return ph;
}

/** Ángulo de las alas: la bajada ocupa ~40 % del ciclo (más potente que la subida). */
export function flapAngle(p: FlightParams, phase: number) {
  const f = ((phase % 1) + 1) % 1;
  const w = f < 0.4 ? Math.cos((f / 0.4) * Math.PI) : -Math.cos(((f - 0.4) / 0.6) * Math.PI);
  return p.flapBias + p.flapAmp * w * 0.9;
}

export const unit = (x: number) => clamp(x);
export const tau = TAU;
