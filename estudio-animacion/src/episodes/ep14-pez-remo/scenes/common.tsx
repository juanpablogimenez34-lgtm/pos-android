// Utilidades compartidas por las 12 escenas.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONT_FAMILY} from '../../../engine/fonts';
export {Grade, ScreenRays, SubjectLight, Dim} from '../../ep10-camaron-mantis/lighting/Lighting';
export {Callouts, Caption} from '../../ep10-camaron-mantis/sequences/common';
export {PunchWord} from '../../../studio2';
export type {SceneOut} from '../../../studio2';
export {breathe, cam, shot, toScreen} from '../components/CinematicCamera';
export type {Cam} from '../components/CinematicCamera';
export {win, seg, clamp, lerp} from '../utils/animation';
export {Oarfish, oarPose, oarPoint} from '../components/Oarfish';
export {OceanEnvironment, PaletteGrade} from '../components/OceanEnvironment';
export {OS} from '../data/timeline';

/** Rótulo de tipo de contenido (RECREACIÓN, LEYENDA…), discreto, en la franja superior segura. */
export const Tag: React.FC<{text: string; k: number; color?: string; top?: number}> = ({text, k, color = '#e8b86d', top = 300}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k}}>
      <span style={{display: 'inline-block', padding: '8px 22px', border: `2px solid ${color}`, borderRadius: 30, color, fontWeight: 800, fontSize: 28, letterSpacing: 4, background: 'rgba(6,20,39,0.55)'}}>{text}</span>
    </div>
  ) : null;

/** Texto documental grande (dorado o turquesa), poco usado. */
export const DocTitle: React.FC<{text: string; k: number; top?: number; color?: string; size?: number}> = ({text, k, top = 250, color = '#e8b86d', size = 64}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: 70, right: 70, top, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${((1 - k) * 16).toFixed(1)}px)`}}>
      <div style={{fontWeight: 900, fontSize: size, lineHeight: 1.08, color, letterSpacing: 1, textShadow: '0 0 26px rgba(59,203,214,0.35), 0 4px 16px rgba(0,0,0,0.85)'}}>{text}</div>
    </div>
  ) : null;

export const Fade: React.FC<{k: number; color?: string}> = ({k, color = '#020610'}) => (k > 0.001 ? <AbsoluteFill style={{background: color, opacity: Math.min(1, k)}} /> : null);
