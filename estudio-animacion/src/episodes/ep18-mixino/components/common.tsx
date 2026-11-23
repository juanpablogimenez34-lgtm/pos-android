// Piezas compartidas por las doce escenas: curvas, rótulos, etiquetas científicas y pases de color.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {SCENES} from '../data/timeline';

export const seg = (t: number, a: number, b: number) => {
  const u = clamp((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
export const win = (t: number, a: number, b: number, r = 0.35) => clamp((t - a) / r) * clamp((b - t) / r);

export const Vignette: React.FC<{k?: number}> = ({k = 1}) => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity: k, background: 'radial-gradient(ellipse 80% 65% at 50% 46%, rgba(0,0,0,0) 50%, rgba(1,8,10,0.78) 100%)'}} />
);
export const Wash: React.FC<{k: number; color?: string}> = ({k, color = '#000'}) => (k > 0.002 ? <AbsoluteFill style={{pointerEvents: 'none', background: color, opacity: k}} /> : null);

/** Rótulo de escena (escenas 2–11) durante sus primeros segundos. */
export const SceneTag: React.FC<{t: number}> = ({t}) => {
  const s = SCENES.find((x) => t >= x.start && t < x.end);
  if (!s || s.n === 1 || s.n === 12) return null;
  const k = win(t, s.start + 0.4, s.start + 3.6, 0.5);
  if (k <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${((1 - k) * -10).toFixed(1)}px)`}}>
      <div style={{color: '#7ee0d0', fontWeight: 800, fontSize: 24, letterSpacing: 6}}>ESCENA {s.n}</div>
      <div style={{color: '#f2fffb', fontWeight: 900, fontSize: 42, letterSpacing: 1, textShadow: '0 3px 12px rgba(0,0,0,0.8)'}}>{s.title.toUpperCase()}</div>
    </div>
  );
};

/** Etiqueta científica con línea guía (coordenadas de pantalla). */
export const Callout: React.FC<{x: number; y: number; tx: number; ty: number; text: string; k: number; align?: 'left' | 'right'}> = ({x, y, tx, ty, text, k, align = 'left'}) =>
  k > 0.01 ? (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: k}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <circle cx={x} cy={y} r={7} fill="none" stroke="#9ff4e4" strokeWidth={2.5} />
        <path d={`M${x},${y} L${tx},${ty}`} stroke="#9ff4e4" strokeWidth={2} strokeDasharray={`${(Math.hypot(tx - x, ty - y) * clamp(k * 1.4)).toFixed(0)} 2000`} />
      </svg>
      <div style={{position: 'absolute', top: ty - 24, ...(align === 'left' ? {left: tx + 10} : {right: 1080 - tx + 10}), fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 32, color: '#ecfffa', background: 'rgba(4,22,26,0.62)', padding: '6px 14px', borderRadius: 12, border: '1px solid rgba(159,244,228,0.4)'}}>{text}</div>
    </AbsoluteFill>
  ) : null;

export const BigTitle: React.FC<{k: number; lines: string[]; top?: number; size?: number}> = ({k, lines, top = 300, size = 84}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: 60, right: 60, top, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `scale(${(0.95 + 0.05 * k).toFixed(3)})`}}>
      {lines.map((l, i) => (
        <div key={i} style={{fontWeight: 900, fontSize: size, lineHeight: 1.05, letterSpacing: 2, color: i === lines.length - 1 ? '#bff7ea' : '#f4fffb', textShadow: '0 0 28px rgba(120,230,210,0.35), 0 6px 18px rgba(0,0,0,0.9)'}}>{l}</div>
      ))}
    </div>
  ) : null;
