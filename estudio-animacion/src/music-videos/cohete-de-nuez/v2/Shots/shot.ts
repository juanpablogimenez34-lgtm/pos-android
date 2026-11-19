// SISTEMA DE PLANOS: cada plano empieza en un instante ajustado al pulso REAL más cercano
// (song-map.json) y dura hasta el siguiente. Los cortes caen así en pulsos y compases medidos.
import React from 'react';
import {BAR, BEATS, sec} from '../../MusicSync/songMap';

/** Tipos de plano (para alternar y para el informe). */
export type ShotKind = 'wide' | 'medium' | 'close' | 'detail' | 'exterior' | 'cockpit' | 'planet' | 'reaction' | 'action';
export type Shot = {t0: number; id: string; kind: ShotKind; what: string; r: (t: number, lt: number, dur: number) => React.ReactNode};

/** Pulso medido más cercano a `x` (segundos). */
export function snap(x: number): number {
  let best = BEATS[0];
  for (const b of BEATS) if (Math.abs(b - x) < Math.abs(best - x)) best = b;
  return best;
}
/** Inicio de sección + n compases, ajustado al pulso. */
export const at = (label: string, bars = 0) => (bars === 0 ? sec(label).start : snap(sec(label).start + bars * BAR));
export {BAR};
