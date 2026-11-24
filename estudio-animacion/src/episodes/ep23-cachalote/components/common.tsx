// Piezas compartidas del episodio: 14 estados del cachalote con mezcla suave y fase integrada
// (el batido nunca salta al cambiar de frecuencia), rótulos, etiqueta de reconstrucción, marca y viñeta.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {WhalePose} from '../character/SpermWhale';
import {SCENES} from '../data/timeline';

export {seg, win, Callout, Wash, BigTitle} from '../../ep18-mixino/components/common';
export {toWorld, toLocal} from '../../ep22-calamar-gigante/components/common';

export type WState =
  | 'SURFACE_REST' | 'SURFACE_BREATHING' | 'DIVE_PREPARATION' | 'TAIL_LIFT' | 'DEEP_DESCENT' | 'SLOW_SWIM' | 'ECHOLOCATION'
  | 'PREY_DETECTION' | 'HUNTING' | 'SQUID_ENCOUNTER' | 'ASCENT' | 'SOCIAL_SWIMMING' | 'CALF_PROTECTION' | 'FINAL_RETREAT';
type SP = {amp: number; freq: number; flip: number; arch: number; jaw: number};
// amp: amplitud del batido · freq: batidos por segundo · flip: aletas · arch: postura · jaw: mandíbula
const P: Record<WState, SP> = {
  SURFACE_REST: {amp: 0.12, freq: 0.12, flip: 0.2, arch: 0, jaw: 0},
  SURFACE_BREATHING: {amp: 0.18, freq: 0.16, flip: 0.25, arch: 0.15, jaw: 0},
  DIVE_PREPARATION: {amp: 0.35, freq: 0.22, flip: 0.4, arch: 0.85, jaw: 0},
  TAIL_LIFT: {amp: 0.25, freq: 0.15, flip: 0.3, arch: 1.0, jaw: 0},
  DEEP_DESCENT: {amp: 0.55, freq: 0.3, flip: 0.25, arch: -0.1, jaw: 0},
  SLOW_SWIM: {amp: 0.5, freq: 0.26, flip: 0.35, arch: 0, jaw: 0},
  ECHOLOCATION: {amp: 0.38, freq: 0.22, flip: 0.3, arch: 0.05, jaw: 0},
  PREY_DETECTION: {amp: 0.45, freq: 0.3, flip: 0.5, arch: -0.05, jaw: 0},
  HUNTING: {amp: 0.85, freq: 0.48, flip: 0.6, arch: -0.1, jaw: 0.35},
  SQUID_ENCOUNTER: {amp: 0.6, freq: 0.36, flip: 0.7, arch: 0.1, jaw: 0.25},
  ASCENT: {amp: 0.6, freq: 0.32, flip: 0.3, arch: -0.05, jaw: 0},
  SOCIAL_SWIMMING: {amp: 0.42, freq: 0.24, flip: 0.45, arch: 0.05, jaw: 0},
  CALF_PROTECTION: {amp: 0.35, freq: 0.22, flip: 0.55, arch: 0.1, jaw: 0},
  FINAL_RETREAT: {amp: 0.5, freq: 0.24, flip: 0.3, arch: 0.2, jaw: 0},
};
export type WTrack = [number, WState][];
const BLEND = 1.0;

function mix(track: WTrack, t: number) {
  let i = 0;
  while (i < track.length - 1 && track[i + 1][0] <= t) i++;
  const a = P[i > 0 ? track[i - 1][1] : track[i][1]];
  const b = P[track[i][1]];
  const u = clamp((t - track[i][0]) / BLEND);
  const e = u * u * (3 - 2 * u);
  const m = (k: keyof SP) => a[k] + (b[k] - a[k]) * e;
  return {state: track[i][1], amp: m('amp'), freq: m('freq'), flip: m('flip'), arch: m('arch'), jaw: m('jaw')};
}

/** Fase del batido: integral de 2π·freq desde el inicio de la pista (paso 1/30 s, determinista). */
export function phaseAt(track: WTrack, t: number, phase0 = 0) {
  const t0 = track[0][0];
  let ph = phase0;
  const dt = 1 / 30;
  for (let s = t0; s < t; s += dt) ph += 2 * Math.PI * mix(track, s).freq * Math.min(dt, t - s);
  return ph;
}

export function whaleState(track: WTrack, t: number) {
  return mix(track, t);
}

/** Pose completa a partir de la pista de estados (+ campos extra de la escena). */
export function poseFrom(track: WTrack, t: number, extra: Partial<WhalePose> = {}, phase0 = 0): WhalePose {
  const s = mix(track, t);
  return {t, phase: phaseAt(track, t, phase0), amp: s.amp, flip: s.flip, arch: s.arch, jaw: s.jaw, ...extra};
}

export const Vignette: React.FC<{k?: number}> = ({k = 1}) => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity: k, background: 'radial-gradient(ellipse 82% 66% at 50% 46%, rgba(0,0,0,0) 50%, rgba(1,4,10,0.78) 100%)'}} />
);
export const Brand: React.FC<{k?: number}> = ({k = 1}) => (
  <div style={{position: 'absolute', left: 54, top: 70, fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 22, letterSpacing: 4, color: '#eaf4ff', opacity: 0.4 * k, textShadow: '0 2px 6px rgba(0,0,0,0.6)'}}>MUNDO INSÓLITO</div>
);
export const RecTag: React.FC<{k: number; text?: string}> = ({k, text = 'RECONSTRUCCIÓN CINEMATOGRÁFICA'}) =>
  k > 0.01 ? <div style={{position: 'absolute', right: 54, top: 70, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 20, letterSpacing: 3, color: '#ffd8a8', opacity: 0.75 * k, textShadow: '0 2px 6px rgba(0,0,0,0.7)'}}>{text}</div> : null;
export const Note: React.FC<{k: number; text: string; top?: number}> = ({k, text, top = 1700}) =>
  k > 0.01 ? <div style={{position: 'absolute', left: 40, right: 40, top, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 22, letterSpacing: 1, color: '#cfe8ff', opacity: 0.8 * k, textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>{text}</div> : null;
export const SceneTag: React.FC<{t: number}> = ({t}) => {
  const s = SCENES.find((x) => t >= x.start && t < x.end);
  if (!s || s.n === 1 || s.n === 12) return null;
  const k = clamp((t - s.start - 0.4) / 0.5) * clamp((s.start + 3.6 - t) / 0.5);
  if (k <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${((1 - k) * -10).toFixed(1)}px)`}}>
      <div style={{color: '#7ad0ff', fontWeight: 800, fontSize: 24, letterSpacing: 6}}>ESCENA {s.n}</div>
      <div style={{color: '#f4f8ff', fontWeight: 900, fontSize: 42, letterSpacing: 1, textShadow: '0 3px 12px rgba(0,0,0,0.8)'}}>{s.title.toUpperCase()}</div>
    </div>
  );
};

/** Silueta de buceador para la escala (1,8 m). */
export const Diver: React.FC<{x: number; y: number; h: number; t: number}> = ({x, y, h, t}) => {
  const s = h / 180;
  return (
    <g transform={`translate(${x} ${y}) scale(${s.toFixed(3)})`} opacity={0.8}>
      <circle cx={0} cy={-80} r={11} fill="#9ab8d0" />
      <rect x={-9} y={-68} width={18} height={70} rx={8} fill="#9ab8d0" />
      <rect x={6} y={-64} width={9} height={40} rx={4} fill="#c8d8e8" />
      <path d={`M-6,0 l${(-6 + Math.sin(t * 3) * 4).toFixed(1)},70 M6,0 l${(6 + Math.cos(t * 3) * 4).toFixed(1)},70`} stroke="#9ab8d0" strokeWidth={9} strokeLinecap="round" />
      <path d="M-8,-58 l-22,32 M8,-58 l22,32" stroke="#9ab8d0" strokeWidth={7} strokeLinecap="round" />
    </g>
  );
};
