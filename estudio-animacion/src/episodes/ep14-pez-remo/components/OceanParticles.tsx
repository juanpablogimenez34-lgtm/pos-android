// PARTÍCULAS Y ORGANISMOS PEQUEÑOS: enjambre de kril (crustáceos planctónicos con patas que baten y
// antenas), con desaparición determinista de los individuos que entran en la boca del pez.
import React from 'react';
import {clamp, hash1} from '../../../engine/math';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export const Krill: React.FC<{x: number; y: number; s: number; t: number; a: number; op?: number}> = ({x, y, s, t, a, op = 1}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(a)}) scale(${f1(s)})`} opacity={op}>
    <path d="M-12,0 Q-8,-5 4,-4 Q12,-3 14,0 Q12,3 4,4 Q-8,5 -12,0Z" fill="#f2a08a" opacity={0.85} />
    <path d="M-12,0 l-6,-3 M-12,0 l-6,3" stroke="#f2a08a" strokeWidth={1.4} />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${-4 + i * 4},3 l${f1(Math.sin(t * 14 + i) * 2)},5`} stroke="#ffc0a8" strokeWidth={1} />
    ))}
    <path d={`M13,-1 q8,-6 ${f1(14 + Math.sin(t * 3) * 2)},-10`} stroke="#ffd0c0" strokeWidth={0.9} fill="none" />
    <circle cx={10} cy={-1} r={1.4} fill="#101018" />
    <circle cx={0} cy={1} r={1.2} fill="#9ff4ff" opacity={0.7} />
  </g>
);

/** Enjambre en coordenadas de mundo. `eat` = posición de la boca y tiempo desde el que traga. */
export const KrillSwarm: React.FC<{t: number; cx: number; cy: number; w: number; h: number; n?: number; mouth?: {x: number; y: number; r: number; since: number}}> = ({t, cx, cy, w, h, n = 70, mouth}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const x = cx + (hash1(i * 3.1) - 0.5) * w + Math.sin(t * 0.7 + i) * 18;
      const y = cy + (hash1(i * 5.3) - 0.5) * h + Math.sin(t * 1.1 + i * 2) * 12;
      let op = 0.85;
      let px = x;
      let py = y;
      if (mouth && t > mouth.since) {
        const d = Math.hypot(x - mouth.x, y - mouth.y);
        if (d < mouth.r) {
          const k = clamp((t - mouth.since - (d / mouth.r) * 1.6) / 0.6);
          px = x + (mouth.x - x) * k;
          py = y + (mouth.y - y) * k;
          op = 0.85 * (1 - k);
        }
      }
      return <Krill key={i} x={px} y={py} s={0.9 + hash1(i) * 0.6} t={t + i} a={-20 + hash1(i * 7) * 40} op={op} />;
    })}
  </g>
);
