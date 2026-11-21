// PRESA: caracol marino de concha cónica (tipo turbante). `crack` 0…1 dibuja las grietas y los
// fragmentos de la concha tras los golpes (resultado plausible y sin detalle gráfico); `shake`
// la desplaza con cada impacto; `hide` recoge el pie dentro de la concha.
import React from 'react';
import {clamp, hash1, mixColor} from '../../../engine/math';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export const Snail: React.FC<{x: number; y: number; s: number; t: number; crack?: number; shake?: number; hide?: number; facing?: 1 | -1}> = ({x, y, s, t, crack = 0, shake = 0, hide = 0, facing = -1}) => {
  const k = clamp(crack);
  const shell = '#c8a070';
  const out = '#4a2a14';
  return (
    <g transform={`translate(${f1(x + Math.sin(t * 60) * 4 * shake)} ${f1(y)}) scale(${f1(s * facing)} ${f1(s)})`}>
      <ellipse cx={0} cy={4} rx={56} ry={8} fill="#06121a" opacity={0.3} />
      {/* pie y tentáculos (se recogen) */}
      <g opacity={1 - hide}>
        <path d="M-40,0 Q0,-10 46,0 Q50,6 40,8 L-44,8Z" fill="#d8b8a0" stroke={out} strokeWidth={2} />
        <path d={`M38,-4 q12,${f1(-14 + Math.sin(t * 2) * 3)} 22,-20 M30,-4 q8,-12 12,-22`} stroke="#c8a890" strokeWidth={3} fill="none" strokeLinecap="round" />
      </g>
      {/* concha con espiral */}
      <path d="M-46,0 Q-50,-40 -14,-62 Q12,-78 22,-56 Q40,-30 34,0Z" fill={shell} stroke={out} strokeWidth={3} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${-44 + i * 6},${-6 - i * 14} Q${-6 + i * 4},${-24 - i * 12} ${30 - i * 6},${-6 - i * 12}`} stroke={mixColor(shell, out, 0.5)} strokeWidth={2.5} fill="none" />
      ))}
      {Array.from({length: 10}, (_, i) => (
        <circle key={`d${i}`} cx={-30 + hash1(i * 3) * 56} cy={-8 - hash1(i * 5) * 46} r={2.4} fill="#8a5a3a" opacity={0.7} />
      ))}
      <path d="M-30,-40 Q-12,-60 6,-62" stroke="#ffffff" strokeWidth={4} fill="none" opacity={0.35} strokeLinecap="round" />
      {/* grietas y fragmentos */}
      {k > 0.02 && (
        <g>
          <path d={`M8,-60 L0,-44 L10,-34 L-2,-20 L6,-6`} stroke="#2a1408" strokeWidth={2.5} fill="none" strokeDasharray={`${f1(80 * k)} 100`} />
          <path d={`M0,-44 L-16,-40 L-22,-26`} stroke="#2a1408" strokeWidth={2} fill="none" strokeDasharray={`${f1(40 * clamp(k * 1.5 - 0.4))} 60`} />
          {k > 0.7 &&
            [0, 1, 2, 3].map((i) => {
              const u = clamp((k - 0.7) / 0.3);
              return <path key={i} d="M0,0 l8,-3 l2,7Z" fill={shell} stroke={out} strokeWidth={1} transform={`translate(${f1(10 + i * 8 + u * (10 + i * 12))} ${f1(-40 + i * 6 - u * 10 + u * u * 30)}) rotate(${f1(u * 200 + i * 40)})`} />;
            })}
        </g>
      )}
    </g>
  );
};
