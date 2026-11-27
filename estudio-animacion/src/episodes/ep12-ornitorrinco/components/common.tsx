// Estados del ornitorrinco (19) con mezcla suave de parámetros continuos, y piezas compartidas.
// Cada estado define el modo de locomoción y parámetros (ojos, pico, enroscado, cabeza, humedad); las
// transiciones mezclan los parámetros numéricos durante 0,8 s (el modo cambia en el punto medio).
import {clamp} from '../../../engine/math';
import {PlatypusPose} from '../character/Platypus';

export {seg, win, Callout, Wash, BigTitle} from '../../ep18-mixino/components/common';
export {Vignette, Brand, Note} from '../../ep23-cachalote/components/common';
export {toWorld} from '../../ep22-calamar-gigante/components/common';

export type PState =
  | 'EGG_HATCHING' | 'NEWBORN_RESTING' | 'NURSING' | 'JUVENILE_CRAWLING' | 'JUVENILE_EXPLORING' | 'ADULT_RESTING' | 'WALKING'
  | 'ENTERING_WATER' | 'SURFACE_SWIMMING' | 'DIVING' | 'UNDERWATER_SWIMMING' | 'ELECTRORECEPTION' | 'FORAGING' | 'FEEDING'
  | 'SURFACING' | 'GROOMING' | 'BURROW_DIGGING' | 'DEFENSIVE_POSTURE' | 'FINAL_RETREAT';
type SP = {mode: PlatypusPose['mode']; eyes: number; bill: number; curl: number; head: number; wet: number; swimRate: number; walkRate: number};
const P: Record<PState, SP> = {
  EGG_HATCHING: {mode: 'rest', eyes: 0, bill: 0, curl: 0.8, head: 0, wet: 0, swimRate: 0, walkRate: 0},
  NEWBORN_RESTING: {mode: 'rest', eyes: 0, bill: 0, curl: 0.5, head: 0.05, wet: 0, swimRate: 0, walkRate: 0},
  NURSING: {mode: 'rest', eyes: 0.4, bill: 0.3, curl: 0.3, head: 0.15, wet: 0, swimRate: 0, walkRate: 0},
  JUVENILE_CRAWLING: {mode: 'walk', eyes: 0.8, bill: 0.1, curl: 0, head: 0.05, wet: 0, swimRate: 0, walkRate: 60},
  JUVENILE_EXPLORING: {mode: 'walk', eyes: 1, bill: 0.3, curl: 0, head: -0.05, wet: 0, swimRate: 0, walkRate: 90},
  ADULT_RESTING: {mode: 'rest', eyes: 1, bill: 0.05, curl: 0.15, head: 0, wet: 0.2, swimRate: 0, walkRate: 0},
  WALKING: {mode: 'walk', eyes: 1, bill: 0.1, curl: 0, head: 0, wet: 0.3, swimRate: 0, walkRate: 110},
  ENTERING_WATER: {mode: 'walk', eyes: 1, bill: 0.1, curl: 0, head: -0.15, wet: 0.5, swimRate: 0, walkRate: 80},
  SURFACE_SWIMMING: {mode: 'swim', eyes: 1, bill: 0, curl: 0, head: 0, wet: 1, swimRate: 0.9, walkRate: 0},
  DIVING: {mode: 'swim', eyes: 0, bill: 0, curl: 0.25, head: -0.2, wet: 1, swimRate: 1.3, walkRate: 0},
  UNDERWATER_SWIMMING: {mode: 'swim', eyes: 0, bill: 0, curl: 0, head: 0, wet: 1, swimRate: 1.15, walkRate: 0},
  ELECTRORECEPTION: {mode: 'swim', eyes: 0, bill: 0.7, curl: 0, head: -0.1, wet: 1, swimRate: 0.5, walkRate: 0},
  FORAGING: {mode: 'swim', eyes: 0, bill: 1, curl: 0, head: -0.25, wet: 1, swimRate: 0.7, walkRate: 0},
  FEEDING: {mode: 'swim', eyes: 1, bill: 0.8, curl: 0, head: 0.05, wet: 1, swimRate: 0.35, walkRate: 0},
  SURFACING: {mode: 'swim', eyes: 0.3, bill: 0, curl: 0, head: 0.2, wet: 1, swimRate: 1.2, walkRate: 0},
  GROOMING: {mode: 'rest', eyes: 0.6, bill: 0.4, curl: 0.35, head: -0.3, wet: 0.7, swimRate: 0, walkRate: 0},
  BURROW_DIGGING: {mode: 'dig', eyes: 0.7, bill: 0.2, curl: 0, head: -0.1, wet: 0, swimRate: 0, walkRate: 0},
  DEFENSIVE_POSTURE: {mode: 'rest', eyes: 1, bill: 0, curl: 0, head: 0.15, wet: 0.3, swimRate: 0, walkRate: 0},
  FINAL_RETREAT: {mode: 'swim', eyes: 1, bill: 0, curl: 0, head: 0, wet: 1, swimRate: 0.8, walkRate: 0},
};
export type PTrack = [number, PState][];

/** Pose a partir de la pista de estados; la fase de natación y la distancia de marcha se integran. */
export function poseFrom(track: PTrack, t: number, extra: Partial<PlatypusPose> = {}): PlatypusPose {
  let i = 0;
  while (i < track.length - 1 && track[i + 1][0] <= t) i++;
  const a = P[i > 0 ? track[i - 1][1] : track[i][1]];
  const b = P[track[i][1]];
  const u = clamp((t - track[i][0]) / 0.8);
  const e = u * u * (3 - 2 * u);
  const m = (k: 'eyes' | 'bill' | 'curl' | 'head' | 'wet') => a[k] + (b[k] - a[k]) * e;
  // integración de fase y distancia (paso 1/30 s, determinista)
  let swim = 0;
  let walk = 0;
  for (let s = track[0][0]; s < t; s += 1 / 30) {
    let j = 0;
    while (j < track.length - 1 && track[j + 1][0] <= s) j++;
    swim += P[track[j][1]].swimRate / 30;
    walk += P[track[j][1]].walkRate / 30;
  }
  return {t, mode: e < 0.5 ? a.mode : b.mode, eyes: m('eyes'), bill: m('bill'), curl: m('curl'), head: m('head'), wet: m('wet'), swimPhase: swim, walkDist: walk, ...extra};
}

import React from 'react';
import {FONT_FAMILY} from '../../../engine/fonts';
import {SCENES} from '../data/timeline';
export const SceneTag: React.FC<{t: number}> = ({t}) => {
  const s = SCENES.find((x) => t >= x.start && t < x.end);
  if (!s || s.n === 1 || s.n === 12) return null;
  const k = clamp((t - s.start - 0.4) / 0.5) * clamp((s.start + 3.6 - t) / 0.5);
  if (k <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${((1 - k) * -10).toFixed(1)}px)`}}>
      <div style={{color: '#ffd870', fontWeight: 800, fontSize: 24, letterSpacing: 6, textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>ESCENA {s.n}</div>
      <div style={{color: '#f4f8ff', fontWeight: 900, fontSize: 42, letterSpacing: 1, textShadow: '0 3px 12px rgba(0,0,0,0.85)'}}>{s.title.toUpperCase()}</div>
    </div>
  );
};
