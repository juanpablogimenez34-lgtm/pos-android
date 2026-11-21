// Utilidades de las secuencias: tipo de salida, ventanas de tiempo, rótulos en zona segura,
// gran título, etiquetas anatómicas con línea guía (ancladas al cuerpo mediante la cámara).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, easeInOut, smoothstep} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {Cam, toScreen} from '../camera/CameraSystem';
import {MantisPose} from '../characters/MantisShrimp';

export type SceneOut = {svg: React.ReactNode; overlay?: React.ReactNode};
export const win = (t: number, a: number, b: number, r = 0.5) => smoothstep(a, a + r, t) * (1 - smoothstep(b - r, b, t));
export const seg = (t: number, a: number, b: number) => easeInOut(clamp((t - a) / (b - a)));

/** Rótulo (zona segura superior: lejos de la interfaz de Shorts/TikTok/Reels y de los bordes). */
export const Caption: React.FC<{text: string; k: number; top?: number; color?: string; size?: number; sub?: string}> = ({text, k, top = 250, color = '#ffffff', size = 42, sub}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: 80, right: 110, top, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${((1 - k) * 18).toFixed(1)}px)`}}>
      <span style={{display: 'inline-block', background: 'rgba(3,16,30,0.66)', borderRadius: 18, padding: '12px 26px', color, fontSize: size, fontWeight: 800, lineHeight: 1.25, textShadow: '0 2px 8px rgba(0,0,0,0.6)'}}>{text}</span>
      {sub && <div style={{marginTop: 10, color: '#bff6ff', fontSize: size * 0.66, fontWeight: 700, fontStyle: 'italic', textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>{sub}</div>}
    </div>
  ) : null;

export const BigTitle: React.FC<{lines: string[]; k: number; top?: number; size?: number; color?: string}> = ({lines, k, top = 330, size = 92, color = '#9ff4ff'}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: 60, right: 60, top, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k}}>
      {lines.map((l, i) => (
        <div key={i} style={{fontWeight: 900, fontSize: i === 0 ? size * 0.42 : size, letterSpacing: i === 0 ? 10 : 2, color: i === 0 ? '#ffffff' : color, lineHeight: 1.08, marginBottom: i === 0 ? 14 : 0, textShadow: '0 0 30px rgba(90,220,255,0.5), 0 4px 16px rgba(0,0,0,0.8)', transform: `scale(${(0.93 + 0.07 * k).toFixed(3)})`}}>
          {l}
        </div>
      ))}
    </div>
  ) : null;

/** Puntos anatómicos en coordenadas locales del modelo (mirando a la derecha, escala 1). */
export const ANATOMY = {
  eyes: [150, -118],
  antennae: [205, -96],
  raptor: [128, -14],
  legs: [30, -6],
  abdomen: [-70, -88],
  tail: [-190, -44],
} as const;

export const anatomyScreen = (cam: Cam, m: MantisPose, key: keyof typeof ANATOMY) => {
  const [lx, ly] = ANATOMY[key];
  const sx = m.facing * Math.sign(Math.cos(m.yaw) || 1) * Math.max(0.25, Math.abs(Math.cos(m.yaw)));
  return toScreen(cam, m.x + lx * m.scale * sx, m.y + (ly + m.bodyY) * m.scale);
};

/** Etiqueta con línea guía desde el rótulo hasta el punto del cuerpo. */
export const Callouts: React.FC<{items: {p: {x: number; y: number}; label: string; lx: number; ly: number; k: number}[]}> = ({items}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <svg width={1080} height={1920}>
      {items.map((it) =>
        it.k > 0.01 ? (
          <g key={it.label} opacity={it.k}>
            <path d={`M${it.lx.toFixed(1)},${(it.ly + 12).toFixed(1)} L${(it.lx + (it.p.x - it.lx) * it.k).toFixed(1)},${(it.ly + 12 + (it.p.y - it.ly - 12) * it.k).toFixed(1)}`} stroke="#ffd27a" strokeWidth={3} />
            <circle cx={it.p.x} cy={it.p.y} r={9 * it.k} fill="none" stroke="#ffd27a" strokeWidth={3} />
            <circle cx={it.p.x} cy={it.p.y} r={3} fill="#ffd27a" />
            <rect x={it.lx - 150} y={it.ly - 30} width={300} height={56} rx={16} fill="rgba(3,16,30,0.78)" stroke="rgba(255,210,122,0.6)" strokeWidth={2} />
            <text x={it.lx} y={it.ly + 8} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={28} fill="#ffffff">
              {it.label}
            </text>
          </g>
        ) : null,
      )}
    </svg>
  </AbsoluteFill>
);
