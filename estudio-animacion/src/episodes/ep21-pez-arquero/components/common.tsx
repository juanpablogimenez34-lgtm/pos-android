// Piezas compartidas: estados del pez arquero, marca, viñeta, rótulo de escena y helpers de dibujo.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {SCENES} from '../data/timeline';

export {seg, win, Callout, Wash, BigTitle} from '../../ep18-mixino/components/common';

/** Los 12 estados del personaje (los devuelve el motor de caza o las escenas de natación). */
export const STATES = ['IDLE', 'SLOW_SWIM', 'SEARCHING', 'TARGET_TRACKING', 'AIMING', 'WATER_SHOT', 'SHOT_RECOVERY', 'PREY_FALLING', 'PREY_CHASE', 'PREY_CAPTURE', 'SURFACE_PATROL', 'RESTING'] as const;
export type ArcherState = (typeof STATES)[number];

export const Vignette: React.FC<{k?: number}> = ({k = 1}) => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity: k, background: 'radial-gradient(ellipse 84% 68% at 50% 46%, rgba(0,0,0,0) 55%, rgba(4,20,14,0.65) 100%)'}} />
);

export const Brand: React.FC<{k?: number}> = ({k = 1}) => (
  <div style={{position: 'absolute', left: 54, top: 70, fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 22, letterSpacing: 4, color: '#f6fff4', opacity: 0.4 * k, textShadow: '0 2px 6px rgba(0,0,0,0.6)'}}>MUNDO INSÓLITO</div>
);

export const SceneTag: React.FC<{t: number}> = ({t}) => {
  const s = SCENES.find((x) => t >= x.start && t < x.end);
  if (!s || s.n === 1 || s.n === 12) return null;
  const k = clamp((t - s.start - 0.4) / 0.5) * clamp((s.start + 3.6 - t) / 0.5);
  if (k <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${((1 - k) * -10).toFixed(1)}px)`}}>
      <div style={{color: '#ffe27a', fontWeight: 800, fontSize: 24, letterSpacing: 6}}>ESCENA {s.n}</div>
      <div style={{color: '#f8fff4', fontWeight: 900, fontSize: 42, letterSpacing: 1, textShadow: '0 3px 12px rgba(0,0,0,0.8)'}}>{s.title.toUpperCase()}</div>
    </div>
  );
};

/** Trayectoria real de la luz desde un objeto en el aire hasta el ojo bajo el agua (ley de Snell). */
export function refraction(obj: {x: number; y: number}, eye: {x: number; y: number}, n = 1.33) {
  // busca el punto P de la superficie (y = 0) que cumple sen(i)·1 = sen(r)·n
  let lo = Math.min(obj.x, eye.x);
  let hi = Math.max(obj.x, eye.x);
  const f = (px: number) => {
    const si = (px - obj.x) / Math.hypot(px - obj.x, obj.y);
    const sr = (eye.x - px) / Math.hypot(eye.x - px, eye.y);
    return si - n * sr;
  };
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    if (f(lo) * f(mid) <= 0) hi = mid;
    else lo = mid;
  }
  const P = {x: (lo + hi) / 2, y: 0};
  // posición aparente: prolongación recta del rayo que llega al ojo, a la misma distancia que el objeto
  const d = Math.hypot(obj.x - P.x, obj.y);
  const ux = (P.x - eye.x) / Math.hypot(P.x - eye.x, P.y - eye.y);
  const uy = (P.y - eye.y) / Math.hypot(P.x - eye.x, P.y - eye.y);
  return {P, apparent: {x: P.x + ux * d, y: P.y + uy * d}};
}
