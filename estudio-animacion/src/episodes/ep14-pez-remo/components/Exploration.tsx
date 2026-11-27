// EXPLORACIÓN Y ESCALA:
//  · ROV          — vehículo operado remotamente (marco, flotador, propulsores, cámara, focos con
//                   haces de luz) que se desplaza lentamente.
//  · ScaleCompare — persona (1,75 m) junto a un ejemplar ILUSTRATIVO de 5 m dibujado a la misma escala
//                   (se han documentado ejemplares de varios metros; las cifras máximas varían).
import React from 'react';
import {clamp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {HumanSilhouette} from '../../ep13-tiburon-duende/character/DeepPrey';
import {Oarfish, oarPose} from './Oarfish';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

/** ROV en coordenadas de mundo; `beam` = intensidad de los focos; `dir` 1 = mira a la derecha. */
export const ROV: React.FC<{x: number; y: number; s: number; t: number; beam: number; dir?: 1 | -1}> = ({x, y, s, t, beam, dir = 1}) => (
  <g transform={`translate(${f1(x)} ${f1(y + Math.sin(t * 0.9) * 6)}) scale(${f1(s * dir)} ${f1(s)})`}>
    <defs>
      <linearGradient id="ep14rovbeam" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fffbe8" stopOpacity={0.55} />
        <stop offset="1" stopColor="#fffbe8" stopOpacity={0} />
      </linearGradient>
    </defs>
    {beam > 0.01 && (
      <g opacity={beam}>
        <path d="M80,-30 L900,-260 L900,240 L80,10Z" fill="url(#ep14rovbeam)" />
        <path d="M80,30 L760,0 L760,380 L80,46Z" fill="url(#ep14rovbeam)" opacity={0.6} />
      </g>
    )}
    <rect x={-90} y={-70} width={170} height={46} rx={8} fill="#e8b84a" stroke="#3a2a10" strokeWidth={3} />
    <rect x={-96} y={-24} width={182} height={88} rx={6} fill="none" stroke="#c8c8c8" strokeWidth={8} />
    <line x1={-96} y1={20} x2={86} y2={20} stroke="#c8c8c8" strokeWidth={5} />
    <circle cx={60} cy={20} r={16} fill="#101418" stroke="#8a8a8a" strokeWidth={3} />
    <circle cx={64} cy={16} r={5} fill="#7fd8ff" />
    {[-20, 40].map((cx) => (
      <g key={cx}>
        <rect x={cx - 8} y={-38} width={16} height={12} fill="#ffffff" />
        <circle cx={cx} cy={-32} r={10} fill="#fffbe8" opacity={0.4 * beam} />
      </g>
    ))}
    {[-110, 100].map((tx, i) => (
      <g key={tx} transform={`translate(${tx} 0)`}>
        <rect x={-14} y={-12} width={28} height={30} rx={8} fill="#3a3a3a" />
        <path d={`M0,-12 l${f1(Math.sin(t * 30 + i) * 10)},-10 M0,18 l${f1(Math.cos(t * 30 + i) * 10)},10`} stroke="#8a8a8a" strokeWidth={3} />
      </g>
    ))}
    <path d={`M-90,-60 Q-260,${f1(-120 + Math.sin(t) * 20)} -420,-200`} stroke="#e8b84a" strokeWidth={4} fill="none" />
  </g>
);

export const ScaleCompare: React.FC<{t: number; k: number}> = ({t, k}) => {
  if (k < 0.01) return null;
  const pxm = 150; // píxeles por metro en el gráfico
  const base = 1120;
  const fishL = 5 * pxm; // ejemplar ilustrativo de 5 m
  return (
    <g opacity={k}>
      <rect x={30} y={720} width={1020} height={520} rx={28} fill="rgba(2,10,24,0.72)" stroke="rgba(220,231,236,0.35)" strokeWidth={2} />
      <line x1={70} y1={base} x2={1010} y2={base} stroke="#dce7ec" strokeWidth={2} opacity={0.5} />
      <HumanSilhouette x={100} y={base} h={1.75 * pxm} c="#bfe8ff" />
      <text x={100} y={base + 44} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={700} fontSize={22} fill="#bfe8ff">1,75 m</text>
      <g opacity={clamp(k * 1.5)}>
        <Oarfish uid="scale" p={oarPose({x: 200 + fishL - (120 * fishL) / 1960, y: base - 110, scale: fishL / 1960, t, sCurve: 10, bodyWave: 4, light: 0.95})} />
      </g>
      <line x1={200} y1={base + 18} x2={200 + fishL} y2={base + 18} stroke="#e8b86d" strokeWidth={4} />
      <text x={200 + fishL * 0.5} y={base + 56} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={24} fill="#e8b86d">ejemplar ilustrativo de 5 m</text>
      <text x={540} y={790} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={700} fontSize={22} fill="#dce7ec">se han documentado ejemplares de varios metros; las cifras máximas varían</text>
    </g>
  );
};
