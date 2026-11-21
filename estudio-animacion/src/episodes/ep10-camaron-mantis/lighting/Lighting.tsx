// ILUMINACIÓN: etalonaje submarino (turquesa en altas luces, azul profundo en sombras), luz que
// envuelve al sujeto, rayos volumétricos en pantalla, bruma de profundidad, viñeta y fundidos.
// Solo gradientes CSS (sin filtros de desenfoque costosos: más rápido en Android/Termux).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {hash1} from '../../../engine/math';

export const SubjectLight: React.FC<{x: number; y: number; r: number; k: number; color?: string}> = ({x, y, r, k, color = 'rgba(160,240,255,0.30)'}) =>
  k > 0.01 ? <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(circle ${Math.round(r)}px at ${Math.round(x)}px ${Math.round(y)}px, ${color} 0%, rgba(0,0,0,0) 100%)`, opacity: k, mixBlendMode: 'screen'}} /> : null;

export const ScreenRays: React.FC<{t: number; k: number}> = ({t, k}) =>
  k > 0.01 ? (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: k, mixBlendMode: 'screen'}}>
      <svg width={1080} height={1920}>
        <defs>
          <linearGradient id="ep10ray" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d8fbff" stopOpacity={0.35} />
            <stop offset="1" stopColor="#d8fbff" stopOpacity={0} />
          </linearGradient>
        </defs>
        {Array.from({length: 6}, (_, i) => {
          const x = 80 + i * 190 + Math.sin(t * 0.3 + i) * 40;
          const w = 50 + hash1(i * 3) * 80;
          return <path key={i} d={`M${x.toFixed(1)},-40 L${(x + w).toFixed(1)},-40 L${(x + w + 380).toFixed(1)},1500 L${(x + 240).toFixed(1)},1500Z`} fill="url(#ep10ray)" opacity={0.3 + 0.3 * Math.sin(t * 0.7 + i * 1.9)} />;
        })}
      </svg>
    </AbsoluteFill>
  ) : null;

export const Grade: React.FC<{depth?: number; vignette?: number; dark?: number; warm?: number}> = ({depth = 0.4, vignette = 0.8, dark = 0, warm = 0}) => (
  <>
    <AbsoluteFill style={{pointerEvents: 'none', background: `linear-gradient(180deg, rgba(120,240,255,${(0.1 * (1 - depth)).toFixed(3)}) 0%, rgba(10,30,90,${(0.25 * depth).toFixed(3)}) 100%)`, mixBlendMode: 'soft-light'}} />
    {warm > 0.01 && <AbsoluteFill style={{pointerEvents: 'none', background: `rgba(255,200,140,${(0.12 * warm).toFixed(3)})`, mixBlendMode: 'soft-light'}} />}
    <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse 85% 70% at 50% 44%, rgba(0,0,0,0) 55%, rgba(1,6,18,0.75) 100%)', opacity: vignette}} />
    {dark > 0.001 && <AbsoluteFill style={{pointerEvents: 'none', background: '#01040a', opacity: Math.min(1, dark)}} />}
  </>
);

/** Atenuado del fondo para paneles científicos (simula foco sobre el gráfico). */
export const Dim: React.FC<{k: number}> = ({k}) => (k > 0.01 ? <AbsoluteFill style={{pointerEvents: 'none', background: 'rgba(2,8,20,0.6)', opacity: k}} /> : null);
