// ESTUDIO 2.0 · TRANSICIONES MOTIVADAS POR EL ESCENARIO (no cortes en negro):
//  · BubbleCurtain — una cortina de burbujas cruza el cuadro y oculta el cambio de plano.
//  · FoamWipe      — una lengua de espuma barre la pantalla (superficie ↔ fondo, playa).
//  · DepthDive     — la cámara "atraviesa" la superficie: banda de luz y ondulación.
// u = progreso 0…1 de la transición; el cambio de escena debe hacerse en u ≈ 0,5.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {hash1} from '../engine/math';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export const BubbleCurtain: React.FC<{u: number; color?: string}> = ({u, color = '#e8fbff'}) => {
  if (u <= 0 || u >= 1) return null;
  const front = -300 + u * 2600; // borde ascendente de la cortina (de abajo hacia arriba)
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1080} height={1920}>
        {Array.from({length: 140}, (_, i) => {
          const x = hash1(i * 3) * 1080;
          const y = 1920 - front + hash1(i * 7) * 900 + Math.sin(i + u * 10) * 20;
          const r = 8 + hash1(i * 11) * 46;
          return (
            <g key={i}>
              <circle cx={x + Math.sin(u * 8 + i) * 18} cy={y} r={r} fill={color} opacity={0.22} />
              <circle cx={x + Math.sin(u * 8 + i) * 18} cy={y} r={r} fill="none" stroke={color} strokeWidth={3} opacity={0.75} />
              <circle cx={x + Math.sin(u * 8 + i) * 18 - r * 0.35} cy={y - r * 0.35} r={r * 0.22} fill="#ffffff" opacity={0.8} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const FoamWipe: React.FC<{u: number}> = ({u}) => {
  if (u <= 0 || u >= 1) return null;
  const x = -400 + u * 1900;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1080} height={1920}>
        <path d={`M${f1(x)},0 ${Array.from({length: 12}, (_, i) => `Q${f1(x + 80 + Math.sin(i + u * 6) * 60)},${f1(i * 160 + 80)} ${f1(x + Math.sin(i * 1.7) * 40)},${f1((i + 1) * 160)}`).join(' ')} L${f1(x - 900)},1920 L${f1(x - 900)},0Z`} fill="#f2fdff" opacity={0.96} />
        {Array.from({length: 40}, (_, i) => (
          <circle key={i} cx={x + 40 + hash1(i * 3) * 120} cy={hash1(i * 5) * 1920} r={6 + hash1(i) * 20} fill="#ffffff" opacity={0.8} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

export const DepthDive: React.FC<{u: number}> = ({u}) => {
  if (u <= 0 || u >= 1) return null;
  const y = 2100 - u * 2500;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1080} height={1920}>
        <rect x={0} y={y} width={1080} height={140} fill="#e8fbff" opacity={0.85} />
        <path d={`M0,${f1(y)} ${Array.from({length: 10}, (_, i) => `Q${f1(i * 108 + 54)},${f1(y - 30 + Math.sin(i + u * 9) * 18)} ${f1((i + 1) * 108)},${f1(y)}`).join(' ')}`} stroke="#ffffff" strokeWidth={10} fill="none" />
      </svg>
    </AbsoluteFill>
  );
};
