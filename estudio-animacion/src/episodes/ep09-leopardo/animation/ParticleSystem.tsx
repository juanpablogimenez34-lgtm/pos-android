// PARTÍCULAS Y ATMÓSFERA: polvo en suspensión, hojas que caen, insectos (moscas de día,
// polillas y luciérnagas de noche), bancos de niebla y rayos de luz. Todo determinista y ligero.
import React from 'react';
import {clamp, hash1} from '../../../engine/math';
import {Cam, layerT} from './CameraSystem';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
const wrap = (v: number, span: number) => ((v % span) + span) % span;

export const Dust: React.FC<{cam: Cam; t: number; n?: number; color?: string; depth?: number; k?: number}> = ({cam, t, n = 40, color = '#fff2d0', depth = 0.8, k = 1}) => (
  <g transform={layerT(cam, depth)} opacity={k}>
    {Array.from({length: n}, (_, i) => {
      const sx = 2600 / depth;
      const x = wrap(hash1(i * 3.3) * sx + t * (8 + hash1(i) * 10), sx) - sx / 2 + cam.x * depth;
      const y = wrap(hash1(i * 7.1) * 2400 - t * (3 + hash1(i * 2) * 6), 2400) - 1500 + cam.y * depth;
      return <circle key={i} cx={f1(x)} cy={f1(y)} r={1.2 + hash1(i * 5) * 2.6} fill={color} opacity={0.25 + 0.4 * Math.sin(t * (0.7 + hash1(i)) + i) ** 2} />;
    })}
  </g>
);

export const FallingLeaves: React.FC<{cam: Cam; t: number; n?: number; colors?: string[]; depth?: number; x0?: number; x1?: number}> = ({cam, t, n = 12, colors = ['#7fae3a', '#c89a3a', '#a86a2a'], depth = 1.1, x0 = -1400, x1 = 1400}) => (
  <g transform={layerT(cam, depth)}>
    {Array.from({length: n}, (_, i) => {
      const fall = wrap(hash1(i * 3) * 2600 + t * (50 + hash1(i) * 40), 2600) - 1900 + cam.y;
      const x = x0 + hash1(i * 9) * (x1 - x0) + Math.sin(t * 1.3 + i) * 70 + cam.x * 0.2;
      const r = t * 120 + i * 47;
      return <path key={i} transform={`translate(${f1(x)} ${f1(fall)}) rotate(${f1(r)}) scale(${f1(1 + hash1(i * 2))} ${f1(0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i)))})`} d="M0,-9 Q7,0 0,9 Q-7,0 0,-9Z" fill={colors[i % colors.length]} />;
    })}
  </g>
);

/** Insectos: de día moscas diminutas; de noche polillas y luciérnagas que parpadean. */
export const Insects: React.FC<{cam: Cam; t: number; night: number; n?: number; cx?: number; cy?: number; spread?: number}> = ({cam, t, night, n = 18, cx = 0, cy = -300, spread = 900}) => (
  <g transform={layerT(cam, 1)}>
    {Array.from({length: n}, (_, i) => {
      const x = cx + (hash1(i * 3) - 0.5) * spread + Math.sin(t * (1.2 + hash1(i)) + i) * 60;
      const y = cy + (hash1(i * 5) - 0.5) * spread * 0.6 + Math.cos(t * (1.7 + hash1(i * 2)) + i) * 40;
      if (night > 0.5 && i % 2 === 0) {
        const on = clamp(Math.sin(t * 2.2 + i * 1.9) * 1.6 - 0.2);
        return (
          <g key={i} opacity={night * on}>
            <circle cx={x} cy={y} r={14} fill="#e8ff8a" opacity={0.3} />
            <circle cx={x} cy={y} r={3.5} fill="#f6ffc8" />
          </g>
        );
      }
      const flap = Math.abs(Math.sin(t * 40 + i));
      return (
        <g key={i} transform={`translate(${f1(x)} ${f1(y)})`} opacity={0.75}>
          <ellipse cx={-3} cy={-2} rx={4 * flap + 1} ry={2.5} fill={night > 0.5 ? '#d8d0c0' : '#ffffff'} opacity={0.6} />
          <ellipse cx={3} cy={-2} rx={4 * flap + 1} ry={2.5} fill={night > 0.5 ? '#d8d0c0' : '#ffffff'} opacity={0.6} />
          <circle r={1.8} fill="#2a2018" />
        </g>
      );
    })}
  </g>
);

export const Fog: React.FC<{cam: Cam; t: number; color: string; k: number; y?: number; depth?: number}> = ({cam, t, color, k, y = -80, depth = 0.6}) =>
  k > 0.01 ? (
    <g transform={layerT(cam, depth)} opacity={k}>
      {Array.from({length: 7}, (_, i) => (
        <ellipse key={i} cx={-2400 + i * 800 + wrap(t * 14, 800)} cy={y + Math.sin(i * 1.7) * 60} rx={700} ry={130 + 30 * Math.sin(t * 0.3 + i)} fill={color} opacity={0.35} />
      ))}
    </g>
  ) : null;

export const LightRays: React.FC<{cam: Cam; t: number; color: string; k: number; x0?: number; n?: number; depth?: number}> = ({cam, t, color, k, x0 = -900, n = 6, depth = 0.5}) =>
  k > 0.01 ? (
    <g transform={layerT(cam, depth)} opacity={k}>
      <defs>
        <linearGradient id="lr9" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={0.45} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {Array.from({length: n}, (_, i) => {
        const x = x0 + i * 340 + hash1(i) * 120;
        const w = 70 + hash1(i * 3) * 110;
        return <path key={i} d={`M${f1(x)},-2200 L${f1(x + w)},-2200 L${f1(x + w + 520)},400 L${f1(x + 300)},400Z`} fill="url(#lr9)" opacity={0.45 + 0.4 * Math.sin(t * 0.5 + i * 1.3)} />;
      })}
    </g>
  ) : null;
