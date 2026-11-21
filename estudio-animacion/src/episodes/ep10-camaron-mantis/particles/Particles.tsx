// PARTÍCULAS deterministas: fragmentos de concha en el fondo tras la caza, sedimento en suspensión
// cerca del suelo y "nieve marina" de primer plano (desenfocada por tamaño y opacidad).
import React from 'react';
import {hash1} from '../../../engine/math';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export const ShellBits: React.FC<{x: number; n?: number}> = ({x, n = 9}) => (
  <g>
    {Array.from({length: n}, (_, i) => (
      <path key={i} d="M0,0 l10,-4 l3,9Z" fill={['#c8a070', '#e0c090', '#a87a50'][i % 3]} stroke="#4a2a14" strokeWidth={1.2} transform={`translate(${f1(x + (hash1(i * 3) - 0.5) * 120)} ${f1(-2 - hash1(i * 5) * 10)}) rotate(${f1(hash1(i) * 360)})`} />
    ))}
  </g>
);

export const NearSediment: React.FC<{t: number; x0: number; x1: number; k?: number}> = ({t, x0, x1, k = 1}) => (
  <g opacity={k}>
    {Array.from({length: 40}, (_, i) => {
      const x = x0 + ((hash1(i * 3) * (x1 - x0) + t * (8 + hash1(i) * 14)) % (x1 - x0));
      const y = -10 - hash1(i * 7) * 160 + Math.sin(t * 0.8 + i) * 10;
      return <circle key={i} cx={x} cy={y} r={1.2 + hash1(i * 9) * 2.4} fill="#e8dcc0" opacity={0.35 + 0.3 * hash1(i * 11)} />;
    })}
  </g>
);

export const ForegroundSnow: React.FC<{t: number; k?: number}> = ({t, k = 1}) => (
  <g opacity={k}>
    {Array.from({length: 14}, (_, i) => {
      const x = (hash1(i * 13) * 1300 + t * (14 + 10 * hash1(i))) % 1300 - 110;
      const y = (hash1(i * 17) * 2100 - t * (6 + 6 * hash1(i * 2))) % 2100;
      return <circle key={i} cx={x} cy={y < 0 ? y + 2100 : y} r={6 + hash1(i * 19) * 10} fill="#dff8ff" opacity={0.08 + 0.08 * hash1(i)} />;
    })}
  </g>
);
