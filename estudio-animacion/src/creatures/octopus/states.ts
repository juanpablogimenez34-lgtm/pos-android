// Estados de comportamiento del pulpo. Cada estado es un conjunto de
// parámetros continuos; las transiciones mezclan parámetros (no imágenes),
// por eso cualquier estado puede pasar suavemente a cualquier otro.

import {lerp, smoothstep} from '../../engine/math';

export type OctopusStateName =
  | 'RESTING'
  | 'CRAWLING'
  | 'EXPLORING'
  | 'SWIMMING'
  | 'CAMOUFLAGING'
  | 'THREATENED'
  | 'INK_ESCAPE'
  | 'HIDING';

export type StateParams = {
  armAmp: number; // amplitud de la onda de curvatura (rad totales)
  armFreq: number; // Hz de la onda
  armWaveK: number; // nº de ondas a lo largo del brazo
  curl: number; // enrollado de la punta
  spread: number; // 0 brazos recogidos … 1 abiertos
  droop: number; // tendencia de los brazos a caer al sustrato
  gait: number; // peso del sistema de pasos con apoyos en el suelo
  reach: number; // extensión de los brazos (0.5 contraídos … 1 extendidos)
  streamline: number; // brazos alineados detrás del manto (natación)
  breath: number; // amplitud de las contracciones del manto
  breathRate: number; // Hz de ventilación / chorro
  bob: number; // oscilación vertical del cuerpo (px)
  flatten: number; // aplastamiento contra el sustrato
  hover: number; // altura de la corona de brazos sobre el suelo
  camo: number; // mezcla de color hacia el entorno
  papillae: number; // relieve de la piel (papilas)
  pattern: number; // contraste del moteado
  pale: number; // palidez
  dark: number; // oscurecimiento (amenaza)
  pupil: number; // dilatación de pupila
  eyeOpen: number; // apertura del párpado
  alert: number; // reacción ante estímulos
  ink: number; // emisión de tinta
};

const base: StateParams = {
  armAmp: 0.4,
  armFreq: 0.3,
  armWaveK: 0.8,
  curl: 0.6,
  spread: 0.9,
  droop: 0.3,
  gait: 0,
  reach: 0.85,
  streamline: 0,
  breath: 0.035,
  breathRate: 0.4,
  bob: 3,
  flatten: 0.2,
  hover: 50,
  camo: 0,
  papillae: 0.25,
  pattern: 0.5,
  pale: 0,
  dark: 0,
  pupil: 0.5,
  eyeOpen: 0.8,
  alert: 0,
  ink: 0,
};

export const STATE_PRESETS: Record<OctopusStateName, StateParams> = {
  RESTING: {...base, armAmp: 0.5, armFreq: 0.2, armWaveK: 0.7, curl: 1.0, droop: 0.25, reach: 0.78, flatten: 0.35, hover: 40, bob: 2, eyeOpen: 0.72},
  CRAWLING: {...base, armAmp: 0.3, armFreq: 0.5, curl: 0.6, spread: 1, droop: 0.2, gait: 1, reach: 1, breathRate: 0.55, bob: 5, flatten: 0.1, hover: 66, pattern: 0.55, eyeOpen: 0.86, alert: 0.2},
  EXPLORING: {...base, armAmp: 0.85, armFreq: 0.34, armWaveK: 1, curl: 0.9, spread: 0.95, droop: 0.1, gait: 0.25, reach: 1, breathRate: 0.5, bob: 4, flatten: 0.15, hover: 55, pattern: 0.6, eyeOpen: 0.92, pupil: 0.6, alert: 0.45},
  SWIMMING: {...base, armAmp: 0.22, armFreq: 0.9, armWaveK: 1.4, curl: 0.2, spread: 0.2, droop: 0, reach: 1, streamline: 1, breath: 0.12, breathRate: 1.6, bob: 0, flatten: 0, hover: 120, pale: 0.4, pattern: 0.15, eyeOpen: 0.9, alert: 0.5},
  CAMOUFLAGING: {...base, armAmp: 0.18, armFreq: 0.15, curl: 0.7, spread: 0.85, droop: 0.5, reach: 0.8, breath: 0.025, breathRate: 0.3, bob: 1, flatten: 0.45, hover: 30, camo: 1, papillae: 1, pattern: 1, eyeOpen: 0.6, pupil: 0.3},
  THREATENED: {...base, armAmp: 0.6, armFreq: 0.8, curl: 1.1, spread: 1.15, droop: 0, reach: 0.9, breath: 0.07, breathRate: 1.1, bob: 3, flatten: 0, hover: 78, dark: 0.8, pattern: 0.2, eyeOpen: 1, pupil: 0.9, alert: 1},
  INK_ESCAPE: {...base, armAmp: 0.3, armFreq: 1.2, armWaveK: 1.3, curl: 0.1, spread: 0.1, droop: 0, reach: 1, streamline: 1, breath: 0.18, breathRate: 2.2, bob: 0, flatten: 0, hover: 140, pale: 0.7, pattern: 0, eyeOpen: 1, pupil: 1, alert: 1, ink: 1},
  HIDING: {...base, armAmp: 0.15, armFreq: 0.12, curl: 2.2, spread: 0.35, droop: 0.3, reach: 0.45, breath: 0.03, breathRate: 0.3, bob: 1, flatten: 0.5, hover: 24, camo: 0.35, papillae: 0.5, pattern: 0.6, eyeOpen: 0.55, pupil: 0.85},
};

export type StateKey = {t: number; state: OctopusStateName; blend?: number};

const lerpParams = (a: StateParams, b: StateParams, k: number): StateParams => {
  const out = {} as StateParams;
  (Object.keys(a) as (keyof StateParams)[]).forEach((key) => {
    out[key] = lerp(a[key], b[key], k);
  });
  return out;
};

/** Parámetros en el instante t a partir de una línea de tiempo de estados. */
export function stateAt(timeline: StateKey[], t: number, overrides?: (t: number) => Partial<StateParams>): StateParams {
  let p = STATE_PRESETS[timeline[0].state];
  for (let i = 1; i < timeline.length; i++) {
    const k = timeline[i];
    if (t < k.t) break;
    p = lerpParams(p, STATE_PRESETS[k.state], smoothstep(k.t, k.t + (k.blend ?? 0.6), t));
  }
  return overrides ? {...p, ...overrides(t)} : p;
}

/** Estado dominante (para depuración / rótulos). */
export function stateNameAt(timeline: StateKey[], t: number): OctopusStateName {
  let s = timeline[0].state;
  for (const k of timeline) if (t >= k.t) s = k.state;
  return s;
}
