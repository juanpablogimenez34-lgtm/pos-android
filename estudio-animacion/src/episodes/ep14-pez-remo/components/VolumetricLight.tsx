// LUZ VOLUMÉTRICA SIMULADA: haz de luz con bordes suaves, motas que lo atraviesan y respiración
// lenta de intensidad (sin parpadeos fuertes). Coordenadas de pantalla.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {hash1} from '../../../engine/math';

export const LightBeam: React.FC<{x: number; w: number; t: number; k: number; tilt?: number; color?: string}> = ({x, w, t, k, tilt = 0.12, color = '220,245,255'}) =>
  k > 0.01 ? (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      <svg width={1080} height={1920}>
        <defs>
          <linearGradient id="ep14beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={`rgba(${color},0.5)`} />
            <stop offset="1" stopColor={`rgba(${color},0)`} />
          </linearGradient>
          <linearGradient id="ep14beamx" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity={0} />
            <stop offset="0.5" stopColor="#fff" stopOpacity={1} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <mask id="ep14beamm">
            <rect x={x - w} y={-100} width={w * 2 + 1920 * tilt} height={2200} fill="url(#ep14beamx)" />
          </mask>
        </defs>
        <g opacity={k * (0.85 + 0.15 * Math.sin(t * 0.6))} mask="url(#ep14beamm)">
          <path d={`M${x - w * 0.5},-50 L${x + w * 0.5},-50 L${x + w + 1920 * tilt},1980 L${x - w + 1920 * tilt},1980Z`} fill="url(#ep14beam)" />
          {Array.from({length: 26}, (_, i) => {
            const yy = ((hash1(i * 3) * 1900 + t * 22) % 1900);
            const xx = x + (hash1(i * 7) - 0.5) * w * 1.4 + yy * tilt;
            return <circle key={i} cx={xx} cy={yy} r={1.5 + hash1(i) * 2.5} fill="#ffffff" opacity={0.6} />;
          })}
        </g>
      </svg>
    </AbsoluteFill>
  ) : null;
