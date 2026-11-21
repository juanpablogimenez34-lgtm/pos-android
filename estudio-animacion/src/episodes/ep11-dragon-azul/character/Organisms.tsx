// OTROS ORGANISMOS: carabela portuguesa (Physalia physalis: flotador con cresta, tentáculos
// largos con baterías de nematocistos), velela (Velella velella: disco con vela) y cadenas de
// huevos del dragón azul. Vistas lateral (en la superficie) y cenital.
import React from 'react';
import {hash1, mixColor} from '../../../engine/math';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

/** Carabela portuguesa vista de lado: flotador sobre la línea de agua (y = 0), tentáculos bajo ella. */
export const ManOWarSide: React.FC<{x: number; y: number; s: number; t: number; uid: string; tentLen?: number; reach?: number}> = ({x, y, s, t, uid, tentLen = 900, reach = 0}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s)})`}>
    <defs>
      <linearGradient id={`mw-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e8a0ff" stopOpacity={0.9} />
        <stop offset="0.5" stopColor="#8a8cff" stopOpacity={0.75} />
        <stop offset="1" stopColor="#4ac8ff" stopOpacity={0.7} />
      </linearGradient>
    </defs>
    {/* tentáculos (detrás): largos, con cuentas de nematocistos */}
    {Array.from({length: 11}, (_, i) => {
      const x0 = -70 + i * 14;
      const L = tentLen * (0.45 + 0.55 * hash1(i * 3));
      const pts = Array.from({length: 14}, (_, k) => {
        const u = k / 13;
        return {x: x0 + Math.sin(t * 0.9 + i + u * 5) * 30 * u + reach * u * u * (i % 3 === 0 ? 120 : 40), y: 20 + u * L};
      });
      const d = pts.map((q, k) => `${k ? 'L' : 'M'}${f1(q.x)},${f1(q.y)}`).join(' ');
      return (
        <g key={i} opacity={0.85}>
          <path d={d} stroke="#3a6aff" strokeWidth={i % 3 === 0 ? 5 : 2.5} fill="none" opacity={0.75} />
          {pts.filter((_, k) => k % 2 === 1).map((q, k) => (
            <circle key={k} cx={q.x} cy={q.y} r={i % 3 === 0 ? 5 : 3} fill="#6a5aff" opacity={0.85} />
          ))}
        </g>
      );
    })}
    {/* gastrozooides y gonozooides bajo el flotador */}
    {Array.from({length: 9}, (_, i) => (
      <path key={`g${i}`} d={`M${-60 + i * 15},14 q${f1(4 * Math.sin(t * 2 + i))},20 ${f1(-2 + Math.sin(t + i) * 4)},${f1(34 + hash1(i) * 20)}`} stroke={['#ff8ac8', '#c88aff', '#8ab8ff'][i % 3]} strokeWidth={6} strokeLinecap="round" fill="none" />
    ))}
    {/* flotador (neumatóforo) con cresta */}
    <path d="M-110,10 Q-130,-40 -60,-62 Q20,-80 90,-48 Q130,-28 116,6 Q20,26 -110,10Z" fill={`url(#mw-${uid})`} stroke="#c8b0ff" strokeWidth={3} />
    <path d={`M-70,-60 Q-30,${f1(-118 + Math.sin(t * 1.2) * 4)} 20,-112 Q60,-104 84,-52`} fill="#ff8ad8" opacity={0.55} stroke="#ffb0e8" strokeWidth={3} />
    {Array.from({length: 7}, (_, i) => (
      <path key={`c${i}`} d={`M${-56 + i * 20},-62 Q${-50 + i * 20},-92 ${-40 + i * 20},-108`} stroke="#ffd0f0" strokeWidth={2} fill="none" opacity={0.6} />
    ))}
    <ellipse cx={-30} cy={-40} rx={46} ry={10} fill="#ffffff" opacity={0.45} />
  </g>
);

/** Carabela vista desde arriba (flotador ovalado con cresta y tentáculos difuminados bajo el agua). */
export const ManOWarTop: React.FC<{x: number; y: number; s: number; t: number; rot?: number; op?: number}> = ({x, y, s, t, rot = 0, op = 1}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${f1(s)})`} opacity={op}>
    {Array.from({length: 8}, (_, i) => {
      const d = Array.from({length: 10}, (_, k) => `${k ? 'L' : 'M'}${f1(-20 - k * 46)},${f1((i - 3.5) * 9 + Math.sin(t * 1.1 + k * 0.6 + i) * 10 * (k / 9))}`).join(' ');
      return <path key={i} d={d} stroke="#5a6aff" strokeWidth={5} fill="none" opacity={0.6} strokeDasharray="14 6" />;
    })}
    <path d="M-110,0 Q-90,-46 0,-44 Q90,-42 112,-4 Q96,40 0,44 Q-96,42 -110,0Z" fill="#8a8cff" opacity={0.8} stroke="#e0d0ff" strokeWidth={3} />
    <path d={`M-84,2 ${Array.from({length: 8}, (_, i) => `Q${-74 + i * 21},${i % 2 ? -14 : 14} ${-63 + i * 21},2`).join(' ')}`} stroke="#ff8ad8" strokeWidth={8} fill="none" strokeLinecap="round" />
    <ellipse cx={-30} cy={22} rx={40} ry={10} fill="#4ac8ff" opacity={0.5} />
    <ellipse cx={-20} cy={-18} rx={50} ry={9} fill="#ffffff" opacity={0.45} />
  </g>
);

/** Velela vista desde arriba: disco azul con anillos concéntricos y vela en diagonal. */
export const VelellaTop: React.FC<{x: number; y: number; s: number; t: number; rot?: number}> = ({x, y, s, t, rot = 0}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(rot + Math.sin(t * 0.7) * 4)}) scale(${f1(s)})`}>
    <ellipse rx={60} ry={40} fill="#2a4aff" opacity={0.85} stroke="#7aa8ff" strokeWidth={3} />
    {[0.75, 0.5, 0.28].map((k) => (
      <ellipse key={k} rx={60 * k} ry={40 * k} fill="none" stroke="#9ac0ff" strokeWidth={2} opacity={0.7} />
    ))}
    <path d="M-44,26 L44,-26" stroke="#e8f4ff" strokeWidth={6} strokeLinecap="round" opacity={0.85} />
  </g>
);

/** Cadena de huevos (cordón fino con cuentas) que deriva. */
export const EggString: React.FC<{x: number; y: number; s: number; t: number; seed: number; k?: number}> = ({x, y, s, t, seed, k = 1}) => {
  const n = Math.max(2, Math.round(18 * k));
  const pts = Array.from({length: n}, (_, i) => ({x: i * 14, y: Math.sin(i * 0.5 + t * 0.8 + seed) * 10}));
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(seed * 37)}) scale(${f1(s)})`}>
      <path d={pts.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y)}`).join(' ')} stroke="#e8f0ff" strokeWidth={2} fill="none" opacity={0.6} />
      {pts.map((q, i) => (
        <circle key={i} cx={q.x} cy={q.y} r={4.5} fill={mixColor('#f4f8ff', '#bcd4ff', hash1(i + seed))} stroke="#8aa8d8" strokeWidth={1} />
      ))}
    </g>
  );
};
