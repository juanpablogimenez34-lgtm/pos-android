// PRIMER PLANO FRONTAL del leopardo (mirada al espectador, ojos de la noche).
// Cara ancha con manchas macizas pequeñas en frente y mejillas, ojos de iris dorado con pupila
// redonda que se dilata o se contrae, brillo ocular nocturno (tapetum lucidum), almohadillas de
// bigotes, nariz, mentón blanco y orejas redondeadas con dorso negro y mancha blanca.
import React from 'react';
import {clamp, hash1, mixColor} from '../../../engine/math';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export const LeopardFace: React.FC<{t: number; blink: number; pupil: number; shine: number; look: {x: number; y: number}; ears: number; night: number; tilt?: number; breathe?: number; eyesOnly?: boolean}> = ({t, blink, pupil, shine, look, ears, night, tilt = 0, breathe = 0, eyesOnly = false}) => {
  const n = (c: string) => mixColor(c, '#141c38', night * 0.62);
  const fur = n('#d9a24a');
  const dark = n('#a86c26');
  const cream = n('#f4e3c0');
  const spot = '#22160a';
  const b = clamp(blink);
  const eye = (sx: number) => {
    const cx = sx * 58;
    const cy = -18;
    const open = 1 - b;
    const iris = shine > 0.05 ? mixColor('#d8b23a', '#d6ff8a', shine) : '#d8b23a';
    return (
      <g>
        <path d={`M${f1(cx - 34)},${f1(cy + 4)} Q${f1(cx)},${f1(cy - 26 * open)} ${f1(cx + 34)},${f1(cy - 4 * sx)} Q${f1(cx)},${f1(cy + 22 * open)} ${f1(cx - 34)},${f1(cy + 4)}Z`} fill={iris} stroke="#1a0e06" strokeWidth={5} />
        {open > 0.15 && (
          <g>
            <circle cx={cx + look.x * 8} cy={cy + look.y * 5} r={(6 + 12 * pupil) * open} fill="#0e0804" />
            <circle cx={cx - 9} cy={cy - 8} r={4.5 * open} fill="#ffffff" opacity={0.9} />
            <circle cx={cx + 8} cy={cy + 6} r={2 * open} fill="#ffffff" opacity={0.6} />
          </g>
        )}
        {shine > 0.05 && open > 0.2 && <ellipse cx={cx} cy={cy} rx={48} ry={34} fill="#c8ff8a" opacity={0.28 * shine} />}
        {/* línea oscura del lagrimal (corta, no la "lágrima" larga del guepardo) */}
        <path d={`M${f1(cx - sx * 30)},${f1(cy + 8)} q${f1(-sx * 6)},10 ${f1(-sx * 4)},18`} stroke="#1a0e06" strokeWidth={4} fill="none" />
      </g>
    );
  };
  const ear = (sx: number) => (
    <g transform={`rotate(${f1(sx * (14 - ears * 12))} ${f1(sx * 110)} -110)`}>
      <ellipse cx={sx * 116} cy={-128} rx={42} ry={48} fill="#1a0e06" />
      <ellipse cx={sx * 116} cy={-124} rx={34} ry={40} fill={dark} />
      <ellipse cx={sx * 112} cy={-118} rx={20} ry={26} fill={n('#f0d6b8')} />
    </g>
  );
  if (eyesOnly)
    return (
      <g transform={`rotate(${f1(tilt * 57)}) scale(${f1(1 + 0.01 * breathe)})`}>
        {eye(-1)}
        {eye(1)}
      </g>
    );
  return (
    <g transform={`rotate(${f1(tilt * 57)}) scale(${f1(1 + 0.01 * breathe)})`}>
      {ear(-1)}
      {ear(1)}
      {/* cabeza */}
      <path d="M-150,-40 Q-160,-150 0,-160 Q160,-150 150,-40 Q150,70 90,120 Q40,160 0,162 Q-40,160 -90,120 Q-150,70 -150,-40Z" fill="#1a0e06" />
      <path d="M-144,-40 Q-152,-144 0,-152 Q152,-144 144,-40 Q144,66 86,114 Q38,152 0,154 Q-38,152 -86,114 Q-144,66 -144,-40Z" fill={fur} />
      {/* sombra lateral y luz de frente */}
      <path d="M-144,-40 Q-150,40 -100,100" stroke={dark} strokeWidth={30} fill="none" opacity={0.4} />
      <path d="M144,-40 Q150,40 100,100" stroke={dark} strokeWidth={30} fill="none" opacity={0.4} />
      <ellipse cx={0} cy={-90} rx={60} ry={34} fill="#ffffff" opacity={0.08} />
      {/* manchas de la frente y mejillas */}
      {Array.from({length: 26}, (_, i) => {
        const a = hash1(i * 3.1) * Math.PI - Math.PI;
        const r = 50 + hash1(i * 7.3) * 80;
        const x = Math.cos(a) * r * 1.1;
        const y = -60 + Math.sin(a) * r * 0.7;
        if (Math.abs(x) < 30 && y > -90) return null;
        return <ellipse key={i} cx={x} cy={y} rx={4 + hash1(i) * 4} ry={3.5 + hash1(i * 2) * 3} fill={spot} opacity={0.85} />;
      })}
      {[-1, 1].map((sx) => (
        <g key={sx}>
          {[0, 1, 2].map((k) => (
            <ellipse key={k} cx={sx * (96 + k * 10)} cy={10 + k * 18} rx={6} ry={4} fill={spot} opacity={0.85} />
          ))}
        </g>
      ))}
      {/* frente y puente nasal claros */}
      <path d="M-24,-40 Q0,-60 24,-40 L18,30 Q0,40 -18,30Z" fill={mixColor(fur, cream, 0.35)} />
      {eye(-1)}
      {eye(1)}
      {/* hocico */}
      <ellipse cx={-34} cy={62} rx={42} ry={32} fill={cream} />
      <ellipse cx={34} cy={62} rx={42} ry={32} fill={cream} />
      <ellipse cx={0} cy={104} rx={40} ry={24} fill={cream} stroke="#1a0e06" strokeWidth={3} />
      {[-1, 1].map((sx) =>
        [0, 1, 2, 3, 4].map((k) => <circle key={`${sx}${k}`} cx={sx * (22 + (k % 3) * 12)} cy={56 + Math.floor(k / 3) * 12 + (k % 3) * 2} r={2.4} fill={spot} />),
      )}
      <path d="M-26,24 Q0,16 26,24 Q20,46 0,50 Q-20,46 -26,24Z" fill={n('#b8746a')} stroke="#1a0e06" strokeWidth={3} />
      <path d="M0,50 L0,66 M0,66 Q-20,82 -36,76 M0,66 Q20,82 36,76" stroke="#1a0e06" strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* bigotes (vibran levemente) */}
      {[-1, 1].map((sx) =>
        [0, 1, 2, 3].map((k) => <path key={`w${sx}${k}`} d={`M${sx * 46},${60 + k * 7} q${sx * 70},${-10 + k * 6 + Math.sin(t * 2 + k) * 2} ${sx * 150},${-6 + k * 16}`} stroke="#fff8e8" strokeWidth={2} fill="none" opacity={0.85} />),
      )}
    </g>
  );
};
