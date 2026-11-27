// Utilidades compartidas por las 12 escenas: tipo de salida, ventanas de tiempo, rótulos y
// la capa de iluminación cinematográfica (viñeta, etalonaje y oscurecido de transición).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, easeInOut, smoothstep} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';

export type SceneOut = {svg: React.ReactNode; overlay?: React.ReactNode};
export const win = (t: number, a: number, b: number, r = 0.5) => smoothstep(a, a + r, t) * (1 - smoothstep(b - r, b, t));
export const seg = (t: number, a: number, b: number) => easeInOut(clamp((t - a) / (b - a)));

/** Rótulo destacado (zona segura superior, fuera de la interfaz de TikTok/Reels/Shorts). */
export const Caption: React.FC<{text: string; k: number; top?: number; color?: string; size?: number; sub?: string}> = ({text, k, top = 250, color = '#ffffff', size = 40, sub}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: 70, right: 70, top, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${((1 - k) * 18).toFixed(1)}px)`}}>
      <span style={{display: 'inline-block', background: 'rgba(14,10,4,0.62)', borderRadius: 18, padding: '12px 26px', color, fontSize: size, fontWeight: 800, lineHeight: 1.25, textShadow: '0 2px 8px rgba(0,0,0,0.6)'}}>{text}</span>
      {sub && <div style={{marginTop: 10, color: '#ffe7a8', fontSize: size * 0.68, fontWeight: 700, textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>{sub}</div>}
    </div>
  ) : null;

/** Gran título (escena 1 y cierre). */
export const BigTitle: React.FC<{lines: string[]; k: number; top?: number; color?: string; size?: number}> = ({lines, k, top = 300, color = '#ffe2a0', size = 96}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k}}>
      {lines.map((l, i) => (
        <div key={i} style={{fontWeight: 900, fontSize: i === 0 ? size * 0.55 : size, letterSpacing: i === 0 ? 10 : 3, color: i === 0 ? '#ffffff' : color, lineHeight: 1.05, textShadow: '0 0 28px rgba(255,190,90,0.55), 0 4px 16px rgba(0,0,0,0.8)', transform: `scale(${(0.92 + 0.08 * k).toFixed(3)})`}}>
          {l}
        </div>
      ))}
    </div>
  ) : null;

export const Grade: React.FC<{warm?: number; dark?: number; vignette?: number; night?: number}> = ({warm = 0.5, dark = 0, vignette = 0.85, night = 0}) => (
  <>
    <AbsoluteFill style={{pointerEvents: 'none', background: `linear-gradient(180deg, rgba(255,200,120,${(0.08 * warm * (1 - night)).toFixed(3)}) 0%, rgba(40,60,120,${(0.18 * night).toFixed(3)}) 100%)`, mixBlendMode: 'soft-light'}} />
    <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse 85% 70% at 50% 42%, rgba(0,0,0,0) 55%, rgba(8,5,2,0.72) 100%)', opacity: vignette}} />
    {dark > 0.001 && <AbsoluteFill style={{pointerEvents: 'none', background: '#030202', opacity: dark}} />}
  </>
);
