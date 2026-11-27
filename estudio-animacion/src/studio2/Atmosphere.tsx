// ESTUDIO 2.0 · ATMÓSFERA: bokeh de primer plano (partículas grandes y difusas que pasan cerca de
// la lente), polvo/plancton de plano medio y destellos de luz. Deterministas y ligeros.
import React from 'react';
import {hash1} from '../engine/math';

export const Bokeh: React.FC<{t: number; n?: number; color?: string; k?: number; speed?: number}> = ({t, n = 10, color = '#dff8ff', k = 1, speed = 1}) =>
  k > 0.01 ? (
    <g opacity={k} style={{mixBlendMode: 'screen'}}>
      {Array.from({length: n}, (_, i) => {
        const r = 28 + hash1(i * 3) * 60;
        const x = ((hash1(i * 7) * 1400 + t * (10 + hash1(i) * 26) * speed) % 1400) - 160;
        const y = ((hash1(i * 11) * 2200 - t * (8 + hash1(i * 5) * 12) * speed) % 2200 + 2200) % 2200 - 140;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill={color} opacity={0.06 + 0.05 * hash1(i * 13)} />
            <circle cx={x} cy={y} r={r * 0.92} fill="none" stroke={color} strokeWidth={2} opacity={0.08} />
          </g>
        );
      })}
    </g>
  ) : null;

export const Motes: React.FC<{t: number; n?: number; color?: string; k?: number}> = ({t, n = 50, color = '#ffffff', k = 1}) => (
  <g opacity={k}>
    {Array.from({length: n}, (_, i) => {
      const x = ((hash1(i * 3.3) * 1200 + t * (6 + 10 * hash1(i))) % 1200) - 60;
      const y = ((hash1(i * 5.1) * 2000 + Math.sin(t * 0.7 + i) * 30 - t * 4) % 2000 + 2000) % 2000;
      return <circle key={i} cx={x} cy={y} r={1.2 + hash1(i * 9) * 2.2} fill={color} opacity={0.2 + 0.35 * Math.abs(Math.sin(t * 1.3 + i))} />;
    })}
  </g>
);
