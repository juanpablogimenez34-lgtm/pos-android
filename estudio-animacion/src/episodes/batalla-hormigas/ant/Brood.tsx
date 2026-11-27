// CRÍA Y REINAS. Diferencias por especie y etapa:
//  · huevos (pequeños, ovalados, brillantes) · larvas (cuerpo en "C" segmentado, sin patas)
//  · pupas: Camponotus teje CAPULLOS de seda (ocres); Solenopsis tiene pupas DESNUDAS con la forma del adulto.
//  · reinas: misma especie, más grandes, con mesosoma más voluminoso (inserción de las alas, ya caídas) y gáster mayor.
import React from 'react';
import {hash1} from '../../../engine/math';
import {AntSpec, BLACK, RED} from './species';

const f1 = (n: number) => Math.round(n * 10) / 10;
export const QUEEN_RED: AntSpec = {...RED, mm: 7, gaster: {...RED.gaster, c: {x: -540, y: 10}, rx: 290, ry: 215}, meso: {...RED.meso, top: -120, hump: 50}};
export const QUEEN_BLACK: AntSpec = {...BLACK, mm: 15, gaster: {...BLACK.gaster, c: {x: -520, y: 5}, rx: 300, ry: 220}, meso: {...BLACK.meso, top: -150, hump: 70}};

export const Egg: React.FC<{x: number; y: number; s: number; a?: number}> = ({x, y, s, a = 0}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(a)}) scale(${s})`}>
    <ellipse rx={14} ry={9} fill="#f4f0e4" stroke="#c8c0a8" strokeWidth={1.2} />
    <ellipse cx={-4} cy={-3} rx={5} ry={2.5} fill="#ffffff" opacity={0.9} />
  </g>
);
export const Larva: React.FC<{x: number; y: number; s: number; t: number; seed: number}> = ({x, y, s, t, seed}) => {
  const w = Math.sin(t * 1.4 + seed) * 0.12;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(w * 57)}) scale(${s})`}>
      <path d="M-26 -6C-30 -30 0 -40 22 -26C38 -14 34 14 16 22C4 28 -10 20 -8 8C-6 0 4 -2 8 4" stroke="#f0e8d8" strokeWidth={22} fill="none" strokeLinecap="round" />
      {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M${-20 + k * 10} ${-24 + Math.abs(k - 2) * 4}l4 10`} stroke="#c8bca0" strokeWidth={1.5} />)}
      <circle cx={10} cy={6} r={4} fill="#d8a878" />
    </g>
  );
};
export const Pupa: React.FC<{x: number; y: number; s: number; cocoon: boolean; a?: number}> = ({x, y, s, cocoon, a = 0}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(a)}) scale(${s})`}>
    {cocoon ? (
      <g>
        <ellipse rx={34} ry={16} fill="#d8b878" stroke="#8a6a3a" strokeWidth={1.5} />
        <ellipse cx={-26} cy={0} rx={6} ry={8} fill="#5a3a1a" opacity={0.6} />
        <path d="M-20 -12Q0 -16 22 -10" stroke="#f4e0b0" strokeWidth={3} fill="none" opacity={0.7} />
      </g>
    ) : (
      <g fill="#f4e8d8" stroke="#c8b8a0" strokeWidth={1.2}>
        <ellipse cx={-14} cy={0} rx={14} ry={11} />
        <ellipse cx={6} cy={0} rx={9} ry={7} />
        <ellipse cx={22} cy={0} rx={8} ry={8} />
        <path d="M2 6L-2 16M8 6L10 16M14 6L18 15" strokeWidth={2.5} />
        <circle cx={26} cy={-2} r={2.4} fill="#8a6a5a" stroke="none" />
      </g>
    )}
  </g>
);
/** Grupo de cría en una cámara. */
export const BroodPile: React.FC<{x: number; y: number; t: number; cocoon: boolean; s?: number}> = ({x, y, t, cocoon, s = 1}) => (
  <g>
    {Array.from({length: 10}, (_, i) => <Egg key={`e${i}`} x={x + (-150 + hash1(i) * 90) * s} y={y - hash1(i * 3) * 30 * s} s={s * 1.2} a={hash1(i * 5) * 90} />)}
    {Array.from({length: 5}, (_, i) => <Larva key={`l${i}`} x={x + (-20 + i * 45) * s} y={y + (-14 - (i % 2) * 14) * s} s={s * 1.3} t={t} seed={i} />)}
    {Array.from({length: 4}, (_, i) => <Pupa key={`p${i}`} x={x + (220 + i * 70) * s} y={y + (-10 - (i % 2) * 18) * s} s={s * 1.5} cocoon={cocoon} a={(i % 2) * 14} />)}
  </g>
);
