// Piezas compartidas: 13 estados del tiburón con mezcla suave y fase integrada (el batido nunca salta),
// rótulos, etiquetas de reconstrucción/estimación, marca y viñeta. Reutiliza piezas de otros episodios
// importándolas (sin modificarlas).
import React from 'react';
import {clamp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {SharkPose} from '../character/GreenlandShark';
import {SCENES} from '../data/timeline';

export {seg, win, Callout, Wash, BigTitle} from '../../ep18-mixino/components/common';
export {toWorld, toLocal} from '../../ep22-calamar-gigante/components/common';
export {Vignette, Brand, RecTag, Note, Diver} from '../../ep23-cachalote/components/common';

export type SState = 'NEWBORN_SWIM' | 'JUVENILE_EXPLORATION' | 'SLOW_SWIM' | 'DEEP_DESCENT' | 'SEABED_EXPLORATION' | 'FOOD_DETECTION' | 'PREY_APPROACH' | 'FEEDING' | 'TURNING' | 'UNDER_ICE_SWIM' | 'SCIENTIFIC_REVEAL' | 'AGE_TRANSITION' | 'FINAL_RETREAT';
type SP = {amp: number; freq: number; flip: number; jaw: number; gill: number};
// amp: amplitud de la onda lateral · freq: batidos/s (lentos: es un nadador muy pausado) · gill: ritmo branquial
const P: Record<SState, SP> = {
  NEWBORN_SWIM: {amp: 0.85, freq: 0.75, flip: 0.6, jaw: 0, gill: 0.9},
  JUVENILE_EXPLORATION: {amp: 0.7, freq: 0.55, flip: 0.55, jaw: 0, gill: 0.8},
  SLOW_SWIM: {amp: 0.55, freq: 0.32, flip: 0.3, jaw: 0, gill: 0.5},
  DEEP_DESCENT: {amp: 0.5, freq: 0.3, flip: 0.45, jaw: 0, gill: 0.5},
  SEABED_EXPLORATION: {amp: 0.45, freq: 0.28, flip: 0.5, jaw: 0, gill: 0.55},
  FOOD_DETECTION: {amp: 0.35, freq: 0.24, flip: 0.6, jaw: 0.05, gill: 0.65},
  PREY_APPROACH: {amp: 0.6, freq: 0.36, flip: 0.5, jaw: 0.15, gill: 0.7},
  FEEDING: {amp: 0.4, freq: 0.3, flip: 0.7, jaw: 0.8, gill: 0.8},
  TURNING: {amp: 0.75, freq: 0.36, flip: 0.8, jaw: 0, gill: 0.55},
  UNDER_ICE_SWIM: {amp: 0.5, freq: 0.3, flip: 0.35, jaw: 0, gill: 0.5},
  SCIENTIFIC_REVEAL: {amp: 0.3, freq: 0.22, flip: 0.25, jaw: 0, gill: 0.45},
  AGE_TRANSITION: {amp: 0.55, freq: 0.4, flip: 0.4, jaw: 0, gill: 0.6},
  FINAL_RETREAT: {amp: 0.5, freq: 0.28, flip: 0.3, jaw: 0, gill: 0.45},
};
export type STrack = [number, SState][];
function mix(track: STrack, t: number) {
  let i = 0;
  while (i < track.length - 1 && track[i + 1][0] <= t) i++;
  const a = P[i > 0 ? track[i - 1][1] : track[i][1]];
  const b = P[track[i][1]];
  const u = clamp((t - track[i][0]) / 1.0);
  const e = u * u * (3 - 2 * u);
  const m = (k: keyof SP) => a[k] + (b[k] - a[k]) * e;
  return {state: track[i][1], amp: m('amp'), freq: m('freq'), flip: m('flip'), jaw: m('jaw'), gill: m('gill')};
}
export function phaseAt(track: STrack, t: number, phase0 = 0) {
  let ph = phase0;
  const dt = 1 / 30;
  for (let s = track[0][0]; s < t; s += dt) ph += 2 * Math.PI * mix(track, s).freq * Math.min(dt, t - s);
  return ph;
}
export function poseFrom(track: STrack, t: number, extra: Partial<SharkPose> = {}, phase0 = 0): SharkPose {
  const s = mix(track, t);
  return {t, phase: phaseAt(track, t, phase0), amp: s.amp, flip: s.flip, jaw: s.jaw, gill: s.gill, ...extra};
}

export const Tag: React.FC<{k: number; text: string; color?: string}> = ({k, text, color = '#ffd8a8'}) =>
  k > 0.01 ? <div style={{position: 'absolute', right: 54, top: 70, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 20, letterSpacing: 3, color, opacity: 0.8 * k, textShadow: '0 2px 6px rgba(0,0,0,0.7)'}}>{text}</div> : null;
export const SceneTag: React.FC<{t: number}> = ({t}) => {
  const s = SCENES.find((x) => t >= x.start && t < x.end);
  if (!s || s.n === 1 || s.n === 12) return null;
  const k = clamp((t - s.start - 0.4) / 0.5) * clamp((s.start + 3.6 - t) / 0.5);
  if (k <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${((1 - k) * -10).toFixed(1)}px)`}}>
      <div style={{color: '#7ae0e8', fontWeight: 800, fontSize: 24, letterSpacing: 6, textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>ESCENA {s.n}</div>
      <div style={{color: '#f4f8ff', fontWeight: 900, fontSize: 42, letterSpacing: 1, textShadow: '0 3px 12px rgba(0,0,0,0.85)'}}>{s.title.toUpperCase()}</div>
    </div>
  );
};
