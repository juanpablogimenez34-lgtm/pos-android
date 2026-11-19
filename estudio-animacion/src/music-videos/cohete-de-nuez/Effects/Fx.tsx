// Efectos del videoclip: corazones luminosos que viajan (beso a la Tierra), destello de foto,
// estallido mágico de chispas, transición musical (iris de estrella) y viñeta suave.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, easeInOut, hash1, lerp} from '../../../engine/math';

export const Heart: React.FC<{x: number; y: number; s: number; c?: string; op?: number}> = ({x, y, s, c = '#ff7ab0', op = 1}) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`} opacity={op}>
    <circle r={26} fill={c} opacity={0.25} />
    <path d="M0,12 C-22,-4 -12,-22 0,-10 C12,-22 22,-4 0,12Z" fill={c} stroke="#ffffff" strokeWidth={2} />
  </g>
);

/** Corazones que salen de (x0,y0) y viajan en arco hasta (x1,y1) entre t0 y t1. */
export const HeartTrail: React.FC<{t: number; t0: number; t1: number; x0: number; y0: number; x1: number; y1: number; n?: number}> = ({t, t0, t1, x0, y0, x1, y1, n = 7}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const st = t0 + i * 0.25;
      const u = clamp((t - st) / (t1 - t0));
      if (u <= 0 || u >= 1) return null;
      const e = easeInOut(u);
      const x = lerp(x0, x1, e) + Math.sin(u * 9 + i) * 26;
      const y = lerp(y0, y1, e) - Math.sin(u * Math.PI) * 180;
      return <Heart key={i} x={x} y={y} s={1.4 * (1 - 0.6 * u)} c={['#ff7ab0', '#ff9ad5', '#ffd23f'][i % 3]} op={Math.sin(Math.PI * u)} />;
    })}
  </g>
);

export const Flash: React.FC<{k: number}> = ({k}) => (k > 0.01 ? <AbsoluteFill style={{background: '#ffffff', opacity: k}} /> : null);

/** Estallido de chispas mágicas centrado en (x, y), progreso u 0–1. */
export const Burst: React.FC<{x: number; y: number; u: number; r?: number}> = ({x, y, u, r = 220}) =>
  u > 0 && u < 1 ? (
    <g transform={`translate(${x} ${y})`} opacity={Math.sin(Math.PI * u)}>
      {Array.from({length: 16}, (_, i) => {
        const a = (i / 16) * Math.PI * 2 + hash1(i) * 0.3;
        const d = r * easeInOut(u) * (0.6 + hash1(i * 3) * 0.6);
        const c = ['#ffd23f', '#ff9ad5', '#7ff3ff', '#ffffff'][i % 4];
        return (
          <path key={i} transform={`translate(${(Math.cos(a) * d).toFixed(1)} ${(Math.sin(a) * d).toFixed(1)}) rotate(${(u * 200).toFixed(0)}) scale(${(0.6 * (1 - u) + 0.3).toFixed(2)})`} d="M0,-20 L6,-6 L21,-6 L9,3 L13,18 L0,9 L-13,18 L-9,3 L-21,-6 L-6,-6Z" fill={c} />
        );
      })}
    </g>
  ) : null;

/** SCENE_TRANSITION: iris con forma de estrella que se cierra y se abre en la frontera musical. */
export const StarIris: React.FC<{t: number; at: number; d?: number; color?: string}> = ({t, at, d = 0.45, color = '#2a1a5a'}) => {
  const u = (t - (at - d)) / (2 * d);
  if (u <= 0 || u >= 1) return null;
  const k = u < 0.5 ? 1 - u * 2 : (u - 0.5) * 2; // 1 → 0 → 1
  const s = 0.02 + 3.2 * Math.pow(k, 1.6);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1080} height={1920}>
        <defs>
          <mask id={`iris${Math.round(at * 100)}`}>
            <rect width={1080} height={1920} fill="#ffffff" />
            <path transform={`translate(540 900) scale(${(s * 20).toFixed(2)}) rotate(${(u * 120).toFixed(1)})`} d="M0,-20 L6,-6 L21,-6 L9,3 L13,18 L0,9 L-13,18 L-9,3 L-21,-6 L-6,-6Z" fill="#000000" />
          </mask>
        </defs>
        <rect width={1080} height={1920} fill={color} mask={`url(#iris${Math.round(at * 100)})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{k?: number}> = ({k = 1}) => <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 60%, rgba(20,8,40,0.45) 100%)', opacity: k, pointerEvents: 'none'}} />;
