// Piezas compartidas del episodio: estados del pez, curvas de inflado, rótulos, marca y viñeta.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {SCENES} from '../data/timeline';

export {seg, win, Callout, Wash, BigTitle} from '../../ep18-mixino/components/common';

/** ESTADOS del personaje (mezcla suave): determinan aletas, bombeo, mirada y movilidad. */
export type FishState = 'NORMAL_SWIM' | 'CURIOUS' | 'ALERT' | 'THREATENED' | 'INFLATING' | 'FULLY_INFLATED' | 'DEFENSIVE_FLOAT' | 'DEFLATING' | 'RECOVERING' | 'RELAXED_SWIM';
type FP = {swim: number; finFreq: number; pump: number; eye: number; bob: number};
const P: Record<FishState, FP> = {
  NORMAL_SWIM: {swim: 1, finFreq: 2.2, pump: 0, eye: 0.2, bob: 6},
  CURIOUS: {swim: 0.6, finFreq: 1.6, pump: 0, eye: 0.8, bob: 4},
  ALERT: {swim: 0.5, finFreq: 3.2, pump: 0, eye: -0.6, bob: 2},
  THREATENED: {swim: 0.35, finFreq: 3.6, pump: 0.6, eye: -0.9, bob: 1},
  INFLATING: {swim: 0.3, finFreq: 3.0, pump: 1, eye: -0.8, bob: 1},
  FULLY_INFLATED: {swim: 0.25, finFreq: 1.8, pump: 0, eye: -0.4, bob: 3},
  DEFENSIVE_FLOAT: {swim: 0.2, finFreq: 1.4, pump: 0, eye: 0, bob: 5},
  DEFLATING: {swim: 0.35, finFreq: 2.0, pump: 0.5, eye: 0.2, bob: 3},
  RECOVERING: {swim: 0.6, finFreq: 2.2, pump: 0.1, eye: 0.3, bob: 4},
  RELAXED_SWIM: {swim: 0.9, finFreq: 1.9, pump: 0, eye: 0.4, bob: 6},
};
export type FTrack = [number, FishState][];
export function fishState(track: FTrack, t: number) {
  let i = 0;
  while (i < track.length - 1 && track[i + 1][0] <= t) i++;
  const a = P[i > 0 ? track[i - 1][1] : track[i][1]];
  const b = P[track[i][1]];
  const u = clamp((t - track[i][0]) / 0.6);
  const e = u * u * (3 - 2 * u);
  const m = (k: keyof FP) => a[k] + (b[k] - a[k]) * e;
  const pump = m('pump');
  return {state: track[i][1], swim: m('swim'), finFreq: m('finFreq'), eye: m('eye'), bob: m('bob'), mouth: pump * (0.5 + 0.5 * Math.sin(t * 13)) + 0.08};
}

/** Curva de inflado con arranque y frenado suaves (no lineal: el agua entra a bocanadas). */
export function inflateCurve(t: number, a: number, b: number, pulses = 5) {
  const u = clamp((t - a) / (b - a));
  const base = u * u * (3 - 2 * u);
  const steps = Math.sin(u * Math.PI * 2 * pulses) * 0.02 * Math.sin(u * Math.PI);
  return clamp(base + steps);
}

export const Vignette: React.FC<{k?: number}> = ({k = 1}) => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity: k, background: 'radial-gradient(ellipse 82% 66% at 50% 46%, rgba(0,0,0,0) 52%, rgba(2,14,34,0.7) 100%)'}} />
);

export const Brand: React.FC<{k?: number}> = ({k = 1}) => (
  <div style={{position: 'absolute', left: 54, top: 70, fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 22, letterSpacing: 4, color: '#f2fdff', opacity: 0.4 * k, textShadow: '0 2px 6px rgba(0,0,0,0.6)'}}>MUNDO INSÓLITO</div>
);

export const SceneTag: React.FC<{t: number}> = ({t}) => {
  const s = SCENES.find((x) => t >= x.start && t < x.end);
  if (!s || s.n === 1 || s.n === 12) return null;
  const k = clamp((t - s.start - 0.4) / 0.5) * clamp((s.start + 3.6 - t) / 0.5);
  if (k <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${((1 - k) * -10).toFixed(1)}px)`}}>
      <div style={{color: '#ffd27a', fontWeight: 800, fontSize: 24, letterSpacing: 6}}>ESCENA {s.n}</div>
      <div style={{color: '#f6ffff', fontWeight: 900, fontSize: 42, letterSpacing: 1, textShadow: '0 3px 12px rgba(0,0,0,0.8)'}}>{s.title.toUpperCase()}</div>
    </div>
  );
};
