// Piezas compartidas por las siete escenas: curvas, rótulos y pases de color.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp} from '../../../../engine/math';
import {FONT_FAMILY} from '../../../../engine/fonts';
import {Cam} from '../../../../studio2';
import {SCENES} from '../data/timeline';

export const seg = (t: number, a: number, b: number) => {
  const u = clamp((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
/** Ventana 0→1→0 con rampas de `r` segundos. */
export const win = (t: number, a: number, b: number, r = 0.35) => clamp((t - a) / r) * clamp((b - t) / r);
/** Avance "a pasos": progreso monótono con `n` pausas (impulsos de natación). */
export const stair = (u: number, n: number) => clamp(u) - Math.sin(2 * Math.PI * n * clamp(u)) / (2 * Math.PI * n);
export const camLerp = (a: Cam, b: Cam, u: number): Cam => ({x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, zoom: Math.exp(Math.log(a.zoom) + (Math.log(b.zoom) - Math.log(a.zoom)) * u), roll: a.roll + (b.roll - a.roll) * u});

/** Nombre de la etapa biológica (arriba, fuera de la zona de subtítulos). */
export const StageChip: React.FC<{text: string; k: number; top?: number}> = ({text, k, top = 340}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k}}>
      <span style={{display: 'inline-block', padding: '8px 22px', borderRadius: 30, background: 'rgba(6,24,20,0.55)', color: '#f4ecd0', fontWeight: 700, fontSize: 30, letterSpacing: 1}}>{text}</span>
    </div>
  ) : null;

/** Rótulo de escena durante sus primeros segundos. */
export const SceneTag: React.FC<{t: number}> = ({t}) => {
  const s = SCENES.find((x) => t >= x.start && t < x.end);
  if (!s || s.n === 1) return null;
  const k = win(t, s.start + 0.4, s.start + 3.8, 0.5);
  if (k <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 128, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${((1 - k) * -10).toFixed(1)}px)`}}>
      <div style={{color: '#ffd890', fontWeight: 800, fontSize: 24, letterSpacing: 6}}>ESCENA {s.n}</div>
      <div style={{color: '#fff8e6', fontWeight: 900, fontSize: 40, letterSpacing: 1, textShadow: '0 3px 12px rgba(0,0,0,0.8)'}}>{s.title.toUpperCase()}</div>
    </div>
  );
};

/** Viñeta y gradación de color (agua: verde-azulada; bosque: ámbar). */
export const Vignette: React.FC<{kind: 'water' | 'forest'; k?: number}> = ({kind, k = 1}) => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity: k, background: `radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 55%, ${kind === 'water' ? 'rgba(2,16,14,0.7)' : 'rgba(8,10,4,0.72)'} 100%)`}} />
);

export const Wash: React.FC<{k: number; color?: string}> = ({k, color = '#e8fff0'}) => (k > 0.002 ? <AbsoluteFill style={{pointerEvents: 'none', background: color, opacity: k}} /> : null);
