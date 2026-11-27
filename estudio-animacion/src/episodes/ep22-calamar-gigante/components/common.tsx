// Piezas compartidas: estados del calamar (14) con mezcla suave, ataque de tentáculos, transformaciones
// de coordenadas, rótulos, etiqueta de recreación, marca y viñeta.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {SquidPose} from '../character/GiantSquid';
import {SCENES} from '../data/timeline';

export {seg, win, Callout, Wash, BigTitle} from '../../ep18-mixino/components/common';
type V = {x: number; y: number};

export type SqState = 'DEEP_IDLE' | 'SLOW_SWIM' | 'MANTLE_PULSE' | 'EXPLORING' | 'TARGET_DETECTION' | 'TENTACLE_EXTEND' | 'PREY_GRAB' | 'TENTACLE_RETRACT' | 'ARM_MANIPULATION' | 'BEAK_FEEDING' | 'JET_ESCAPE' | 'THREAT_RESPONSE' | 'DEEP_RETREAT' | 'CINEMATIC_REVEAL';
type SP = {pulseAmp: number; pulseFreq: number; finAmp: number; finFreq: number; spread: number; curl: number; wave: number; armSpeed: number; jet: number; grip: number};
const P: Record<SqState, SP> = {
  DEEP_IDLE: {pulseAmp: 0.2, pulseFreq: 0.35, finAmp: 0.35, finFreq: 0.6, spread: 0.15, curl: 0.35, wave: 0.45, armSpeed: 0.6, jet: 0, grip: 0},
  SLOW_SWIM: {pulseAmp: 0.3, pulseFreq: 0.5, finAmp: 0.8, finFreq: 0.9, spread: 0.08, curl: 0.25, wave: 0.55, armSpeed: 0.8, jet: 0, grip: 0},
  MANTLE_PULSE: {pulseAmp: 0.9, pulseFreq: 0.7, finAmp: 0.5, finFreq: 0.8, spread: 0.1, curl: 0.3, wave: 0.4, armSpeed: 0.7, jet: 0.4, grip: 0},
  EXPLORING: {pulseAmp: 0.25, pulseFreq: 0.45, finAmp: 0.6, finFreq: 0.8, spread: 0.3, curl: 0.5, wave: 0.8, armSpeed: 1.1, jet: 0, grip: 0},
  TARGET_DETECTION: {pulseAmp: 0.15, pulseFreq: 0.4, finAmp: 0.4, finFreq: 1.0, spread: 0.05, curl: 0.15, wave: 0.25, armSpeed: 0.6, jet: 0, grip: 0},
  TENTACLE_EXTEND: {pulseAmp: 0.4, pulseFreq: 0.8, finAmp: 0.6, finFreq: 1.4, spread: 0.25, curl: 0.2, wave: 0.3, armSpeed: 1.2, jet: 0.2, grip: 0},
  PREY_GRAB: {pulseAmp: 0.3, pulseFreq: 0.7, finAmp: 0.5, finFreq: 1.2, spread: 0.4, curl: 0.5, wave: 0.6, armSpeed: 1.5, jet: 0, grip: 0.2},
  TENTACLE_RETRACT: {pulseAmp: 0.3, pulseFreq: 0.6, finAmp: 0.5, finFreq: 1.0, spread: 0.45, curl: 0.55, wave: 0.6, armSpeed: 1.3, jet: 0, grip: 0.4},
  ARM_MANIPULATION: {pulseAmp: 0.2, pulseFreq: 0.5, finAmp: 0.4, finFreq: 0.8, spread: 0.2, curl: 0.7, wave: 0.7, armSpeed: 1.4, jet: 0, grip: 0.9},
  BEAK_FEEDING: {pulseAmp: 0.15, pulseFreq: 0.4, finAmp: 0.35, finFreq: 0.7, spread: 0.1, curl: 0.8, wave: 0.5, armSpeed: 1.0, jet: 0, grip: 1},
  JET_ESCAPE: {pulseAmp: 1.0, pulseFreq: 1.3, finAmp: 0.3, finFreq: 1.6, spread: 0.0, curl: 0.05, wave: 0.2, armSpeed: 1.0, jet: 1, grip: 0},
  THREAT_RESPONSE: {pulseAmp: 0.6, pulseFreq: 0.9, finAmp: 0.7, finFreq: 1.4, spread: 1.0, curl: 0.85, wave: 0.9, armSpeed: 1.6, jet: 0.3, grip: 0},
  DEEP_RETREAT: {pulseAmp: 0.7, pulseFreq: 0.9, finAmp: 0.6, finFreq: 1.2, spread: 0.1, curl: 0.2, wave: 0.4, armSpeed: 0.9, jet: 0.7, grip: 0},
  CINEMATIC_REVEAL: {pulseAmp: 0.25, pulseFreq: 0.4, finAmp: 0.5, finFreq: 0.7, spread: 0.35, curl: 0.4, wave: 0.6, armSpeed: 0.7, jet: 0, grip: 0},
};
export type SqTrack = [number, SqState][];

export function squidState(track: SqTrack, t: number) {
  let i = 0;
  while (i < track.length - 1 && track[i + 1][0] <= t) i++;
  const a = P[i > 0 ? track[i - 1][1] : track[i][1]];
  const b = P[track[i][1]];
  const u = clamp((t - track[i][0]) / 0.8);
  const e = u * u * (3 - 2 * u);
  const m = (k: keyof SP) => a[k] + (b[k] - a[k]) * e;
  return {state: track[i][1], pulseAmp: m('pulseAmp'), pulseFreq: m('pulseFreq'), finAmp: m('finAmp'), finFreq: m('finFreq'), spread: m('spread'), curl: m('curl'), wave: m('wave'), armSpeed: m('armSpeed'), jet: m('jet'), grip: m('grip')};
}

/** Pose del calamar a partir del estado mezclado (+ campos extra de la escena). */
export function poseFrom(track: SqTrack, t: number, extra: Partial<SquidPose> = {}): SquidPose {
  const s = squidState(track, t);
  return {
    t,
    pulse: s.pulseAmp * (0.5 - 0.5 * Math.cos(2 * Math.PI * s.pulseFreq * t)),
    fin: t * s.finFreq * Math.PI * 2,
    finAmp: s.finAmp,
    spread: s.spread,
    curl: s.curl,
    wave: s.wave,
    armSpeed: s.armSpeed,
    jet: s.jet * (0.5 + 0.5 * Math.max(0, Math.sin(2 * Math.PI * s.pulseFreq * t))),
    grip: s.grip,
    ...extra,
  };
}

/** Ataque de los tentáculos: anticipación → extensión rápida → contacto → retracción hacia los
 *  brazos → liberación. Devuelve la extensión, la posición local de las mazas y si llevan la presa. */
export function strike(t: number, t0: number, target: V, mouth: V = {x: 330, y: 0}, hold = 0.35, retract = 1.6) {
  const out = (u: number) => 1 - Math.pow(1 - clamp(u), 3);
  const io = (u: number) => {
    const v = clamp(u);
    return v * v * (3 - 2 * v);
  };
  const tA = t0 - 0.45;
  const tC = t0 + 0.32;
  const tR = tC + hold;
  const tE = tR + retract;
  if (t < tA) return {ext: 0, tip: target, carrying: false, phase: 'rest'};
  if (t < t0) return {ext: -0.04 * io((t - tA) / 0.45), tip: target, carrying: false, phase: 'anticipation'};
  if (t < tC) return {ext: out((t - t0) / (tC - t0)), tip: target, carrying: false, phase: 'extend'};
  if (t < tR) return {ext: 1, tip: {x: target.x + Math.sin(t * 30) * 4, y: target.y}, carrying: true, phase: 'grab'};
  if (t < tE) {
    const u = io((t - tR) / retract);
    return {ext: 1, tip: {x: lerp(target.x, mouth.x, u), y: lerp(target.y, mouth.y, u)}, carrying: true, phase: 'retract'};
  }
  const u = io((t - tE) / 1.0);
  return {ext: 1 - u, tip: mouth, carrying: false, phase: 'release'};
}

/** Transformaciones local ↔ mundo para una pose (x, y, ángulo, escala, dir). */
export const toWorld = (p: V, x: number, y: number, a: number, s = 1, dir = 1): V => ({x: x + Math.cos(a) * p.x * s * dir - Math.sin(a) * p.y * s, y: y + Math.sin(a) * p.x * s * dir + Math.cos(a) * p.y * s});
export const toLocal = (w: V, x: number, y: number, a: number, s = 1, dir = 1): V => {
  const dx = w.x - x;
  const dy = w.y - y;
  return {x: ((Math.cos(-a) * dx - Math.sin(-a) * dy) / s) * dir, y: (Math.sin(-a) * dx + Math.cos(-a) * dy) / s};
};

export const Vignette: React.FC<{k?: number}> = ({k = 1}) => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity: k, background: 'radial-gradient(ellipse 80% 64% at 50% 46%, rgba(0,0,0,0) 48%, rgba(1,3,8,0.8) 100%)'}} />
);
export const Brand: React.FC<{k?: number}> = ({k = 1}) => (
  <div style={{position: 'absolute', left: 54, top: 70, fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 22, letterSpacing: 4, color: '#eaf4ff', opacity: 0.4 * k, textShadow: '0 2px 6px rgba(0,0,0,0.6)'}}>MUNDO INSÓLITO</div>
);
export const RecTag: React.FC<{k: number; text?: string}> = ({k, text = 'RECREACIÓN ANIMADA'}) =>
  k > 0.01 ? <div style={{position: 'absolute', right: 54, top: 70, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 20, letterSpacing: 3, color: '#ffd8a8', opacity: 0.7 * k, textShadow: '0 2px 6px rgba(0,0,0,0.7)'}}>{text}</div> : null;
export const SceneTag: React.FC<{t: number}> = ({t}) => {
  const s = SCENES.find((x) => t >= x.start && t < x.end);
  if (!s || s.n === 1 || s.n === 12) return null;
  const k = clamp((t - s.start - 0.4) / 0.5) * clamp((s.start + 3.6 - t) / 0.5);
  if (k <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${((1 - k) * -10).toFixed(1)}px)`}}>
      <div style={{color: '#ff9a7a', fontWeight: 800, fontSize: 24, letterSpacing: 6}}>ESCENA {s.n}</div>
      <div style={{color: '#f4f8ff', fontWeight: 900, fontSize: 42, letterSpacing: 1, textShadow: '0 3px 12px rgba(0,0,0,0.8)'}}>{s.title.toUpperCase()}</div>
    </div>
  );
};

/** Silueta de buceador para la escala (1,8 m). */
export const Diver: React.FC<{x: number; y: number; h: number; t: number}> = ({x, y, h, t}) => {
  const s = h / 180;
  return (
    <g transform={`translate(${x} ${y}) scale(${s.toFixed(3)})`} opacity={0.75}>
      <circle cx={0} cy={-80} r={11} fill="#9ab8d0" />
      <rect x={-9} y={-68} width={18} height={70} rx={8} fill="#9ab8d0" />
      <rect x={6} y={-64} width={9} height={40} rx={4} fill="#c8d8e8" />
      <path d={`M-6,0 l${(-6 + Math.sin(t * 3) * 4).toFixed(1)},70 M6,0 l${(6 + Math.cos(t * 3) * 4).toFixed(1)},70`} stroke="#9ab8d0" strokeWidth={9} strokeLinecap="round" />
      <path d="M-8,-58 l-22,32 M8,-58 l22,32" stroke="#9ab8d0" strokeWidth={7} strokeLinecap="round" />
    </g>
  );
};
