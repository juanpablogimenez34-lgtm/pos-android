// FAUNA SECUNDARIA: impala (pasta, se alarma y huye a saltos), silueta de presa a contraluz
// para el transporte al árbol (sin detalle gráfico) y silueta de hiena (competidora).
import React from 'react';
import {clamp, mixColor} from '../../../engine/math';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export type ImpalaState = 'graze' | 'alert' | 'run';
export const Impala: React.FC<{x: number; y: number; s: number; t: number; state: ImpalaState; facing?: 1 | -1; male?: boolean; night?: number}> = ({x, y, s, t, state, facing = -1, male = true, night = 0}) => {
  const body = mixColor('#c8784a', '#1a2040', night * 0.6);
  const back = mixColor('#9a5a34', '#1a2040', night * 0.6);
  const belly = mixColor('#f4e8d8', '#1a2040', night * 0.6);
  const ph = state === 'run' ? (t * 2.4) % 1 : (t * 0.3) % 1;
  const leap = state === 'run' ? Math.max(0, Math.sin(ph * Math.PI * 2)) * 60 : 0;
  const tuck = state === 'run' ? Math.sin(ph * Math.PI * 2) : 0;
  const headDown = state === 'graze' ? 1 : 0;
  const leg = (hx: number, ph2: number, front: boolean) => {
    const sw = state === 'run' ? Math.sin(ph * Math.PI * 2 + ph2) * 0.9 : Math.sin(t * 0.5 + ph2) * 0.05;
    const a1 = (front ? 0.1 : -0.1) + sw * 0.6 - (state === 'run' ? tuck * (front ? -0.5 : 0.5) : 0);
    const k = {x: hx + Math.sin(a1) * 38, y: -78 + Math.cos(a1) * 38};
    const a2 = a1 + (front ? -0.4 : 0.5) * (state === 'run' ? Math.abs(tuck) + 0.3 : 0.2);
    const e = {x: k.x + Math.sin(a2) * 42, y: k.y + Math.cos(a2) * 42};
    return (
      <g>
        <path d={`M${hx},-90 L${f1(k.x)},${f1(k.y)} L${f1(e.x)},${f1(e.y)}`} stroke={back} strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d={`M${f1(e.x)},${f1(e.y)} l2,6`} stroke="#2a1a10" strokeWidth={7} strokeLinecap="round" />
      </g>
    );
  };
  const hx = 70;
  const hy = headDown ? -50 : -170;
  return (
    <g transform={`translate(${f1(x)} ${f1(y - leap)}) scale(${f1(s * facing)} ${f1(s)}) rotate(${f1(state === 'run' ? -tuck * 8 : 0)})`}>
      <ellipse cx={0} cy={leap / s + 4} rx={80} ry={10} fill="#000" opacity={0.2 * clamp(1 - leap / 80)} />
      {leg(-40, Math.PI, false)}
      {leg(42, 0, true)}
      <ellipse cx={0} cy={-104} rx={74} ry={32} fill={body} />
      <path d="M-70,-100 Q0,-80 70,-100 L64,-84 Q0,-70 -64,-84Z" fill={belly} />
      <path d="M-72,-110 Q-10,-138 64,-120" stroke={back} strokeWidth={8} fill="none" opacity={0.5} />
      <path d={`M50,-120 Q${hx},${(hy - 120) / 2 - 20} ${hx},${hy}`} stroke={body} strokeWidth={26} fill="none" strokeLinecap="round" />
      <ellipse cx={hx + 12} cy={hy + 4} rx={24} ry={13} fill={body} transform={`rotate(${headDown ? 60 : 20} ${hx + 12} ${hy + 4})`} />
      <circle cx={hx + 10} cy={hy - 2} r={3} fill="#1a1010" />
      <ellipse cx={hx - 8} cy={hy - 14} rx={6} ry={13} fill={body} transform={`rotate(-30 ${hx - 8} ${hy - 14})`} />
      {male && <path d={`M${hx},${hy - 14} q-10,-40 6,-70 q-4,24 10,40`} stroke="#2a1a10" strokeWidth={5} fill="none" strokeLinecap="round" />}
      <path d="M-74,-108 q-12,6 -10,20" stroke="#2a1a10" strokeWidth={6} fill="none" strokeLinecap="round" />
      {leg(-56, 0.6, false)}
      {leg(58, Math.PI + 0.6, true)}
    </g>
  );
};

/** Presa a contraluz (silueta sin detalle) colgando de la boca del leopardo. */
export const PreySilhouette: React.FC<{x: number; y: number; s: number; rot: number; color?: string}> = ({x, y, s, rot, color = '#2a1a14'}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${f1(s)})`}>
    <ellipse cx={0} cy={60} rx={34} ry={70} fill={color} />
    <path d="M-10,120 L-20,200 M12,120 L20,196 M-18,10 L-40,-30 M14,8 L34,-28" stroke={color} strokeWidth={9} strokeLinecap="round" />
  </g>
);

export const Hyena: React.FC<{x: number; y: number; s: number; t: number; facing?: 1 | -1; color?: string}> = ({x, y, s, t, facing = 1, color = '#3a3028'}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s * facing)} ${f1(s)})`}>
    <path d="M-80,-60 Q-40,-120 40,-110 Q70,-108 80,-80 L76,-60Z" fill={color} />
    <path d={`M60,-100 Q100,${f1(-150 + Math.sin(t * 2) * 6)} 130,${f1(-140 + Math.sin(t * 2) * 6)}`} stroke={color} strokeWidth={30} fill="none" strokeLinecap="round" />
    <ellipse cx={150} cy={-140 + Math.sin(t * 2) * 6} rx={30} ry={20} fill={color} />
    <circle cx={140} cy={-164 + Math.sin(t * 2) * 6} r={9} fill={color} />
    {[-60, -40, 50, 66].map((lx, i) => (
      <path key={i} d={`M${lx},-70 L${lx + Math.sin(t * 4 + i) * 4},0`} stroke={color} strokeWidth={11} strokeLinecap="round" />
    ))}
  </g>
);
