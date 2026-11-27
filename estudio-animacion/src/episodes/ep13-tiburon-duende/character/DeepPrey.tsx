// FAUNA DE PROFUNDIDAD (genérica, sin atribuir especies concretas): pez pequeño que nada con aletas,
// cefalópodo (calamar genérico) que se impulsa contrayendo el manto, crustáceo (camarón genérico)
// con patas nadadoras, y silueta humana para la comparación de tamaño.
import React from 'react';
import {mixColor} from '../../../engine/math';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export const DeepFish: React.FC<{x: number; y: number; s: number; t: number; dir?: 1 | -1; c?: string; seed?: number; op?: number; glow?: number}> = ({x, y, s, t, dir = 1, c = '#8aa6c8', seed = 0, op = 1, glow = 0}) => {
  const tail = Math.sin(t * 8 + seed) * 0.4;
  const fin = Math.sin(t * 6 + seed) * 0.3;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s * dir)} ${f1(s)})`} opacity={op}>
      {glow > 0 && <circle r={60} fill="#7fd8ff" opacity={0.12 * glow} />}
      <path d={`M-28,0 L${f1(-50)},${f1(-13 + tail * 14)} L${f1(-46)},${f1(13 + tail * 14)}Z`} fill={mixColor(c, '#000', 0.25)} />
      <path d="M-30,0 Q-10,-17 18,-9 Q34,-3 36,0 Q34,4 18,9 Q-10,16 -30,0Z" fill={c} stroke="#1a2438" strokeWidth={2} />
      <path d={`M-6,-12 Q2,${f1(-24 - fin * 6)} 10,-10`} fill={mixColor(c, '#000', 0.2)} />
      <path d={`M4,6 q-8,${f1(10 + fin * 8)} -14,10`} stroke={mixColor(c, '#fff', 0.3)} strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M-20,2 Q0,8 22,3" stroke="#ffffff" strokeWidth={1.5} opacity={0.35} fill="none" />
      <circle cx={22} cy={-3} r={4} fill="#0a0d18" />
      <circle cx={23} cy={-4} r={1.3} fill="#ffffff" />
      {/* fotóforos genéricos */}
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={-16 + i * 9} cy={8} r={1.6} fill="#9ff4ff" opacity={0.6 + 0.4 * Math.sin(t * 3 + i)} />
      ))}
    </g>
  );
};

export const Squid: React.FC<{x: number; y: number; s: number; t: number; dir?: 1 | -1; seed?: number; op?: number}> = ({x, y, s, t, dir = 1, seed = 0, op = 1}) => {
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.2 + seed); // contracción del manto
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s * dir)} ${f1(s)})`} opacity={op}>
      {Array.from({length: 8}, (_, i) => {
        const a = (i - 3.5) * 0.12;
        const L = 40 + (i % 2) * 8;
        return <path key={i} d={`M-26,${f1(a * 30)} q${f1(-L * 0.5)},${f1(a * 40 + Math.sin(t * 3 + i) * 6)} ${f1(-L)},${f1(a * 60 + Math.sin(t * 2.5 + i) * 10)}`} stroke="#c87a7a" strokeWidth={3.5 - (i % 2)} fill="none" strokeLinecap="round" />;
      })}
      <path d={`M-26,-10 Q10,${f1(-14 + pulse * 3)} 52,-4 L62,0 L52,4 Q10,${f1(14 - pulse * 3)} -26,10Z`} fill="#d88a8a" stroke="#4a1a22" strokeWidth={2} />
      <path d="M44,-4 L64,-14 L60,0 L64,14 L44,4Z" fill="#c87070" opacity={0.85} />
      {Array.from({length: 7}, (_, i) => (
        <circle key={i} cx={-10 + i * 8} cy={-2 + (i % 2) * 4} r={2} fill="#7a2a3a" opacity={0.5 + 0.4 * Math.sin(t * 4 + i)} />
      ))}
      <circle cx={-20} cy={-2} r={5} fill="#0a0d18" stroke="#e8c0c0" strokeWidth={1.5} />
    </g>
  );
};

export const Shrimp: React.FC<{x: number; y: number; s: number; t: number; dir?: 1 | -1; seed?: number; op?: number}> = ({x, y, s, t, dir = 1, seed = 0, op = 1}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s * dir)} ${f1(s)})`} opacity={op}>
    {Array.from({length: 5}, (_, i) => (
      <path key={i} d={`M${-10 + i * 7},6 l${f1(-2 + Math.sin(t * 10 + i + seed) * 3)},9`} stroke="#e8705a" strokeWidth={2} strokeLinecap="round" />
    ))}
    <path d="M-26,2 Q-20,-10 0,-10 Q20,-10 26,-2 Q20,6 0,7 Q-18,8 -26,2Z" fill="#f0806a" stroke="#5a1a10" strokeWidth={2} />
    {[0, 1, 2, 3].map((i) => (
      <path key={`s${i}`} d={`M${-16 + i * 8},-9 q2,8 0,15`} stroke="#c85a48" strokeWidth={1.5} fill="none" />
    ))}
    <path d={`M24,-4 q20,-10 ${f1(36 + Math.sin(t * 2) * 4)},-24 M24,-2 q22,-2 40,-14`} stroke="#f0a08a" strokeWidth={1.5} fill="none" />
    <circle cx={20} cy={-5} r={2.5} fill="#0a0d18" />
  </g>
);

/** Silueta humana genérica (escala de tamaño, ~1,75 m de altura). */
export const HumanSilhouette: React.FC<{x: number; y: number; h: number; c?: string}> = ({x, y, h, c = '#bfe8ff'}) => {
  const k = h / 175;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(k)})`}>
      <circle cx={0} cy={-162} r={13} fill={c} />
      <path d="M-18,-146 L18,-146 L22,-80 L14,-80 L12,-40 L8,0 L-8,0 L-12,-40 L-14,-80 L-22,-80Z" fill={c} />
      <path d="M-18,-142 L-34,-90 M18,-142 L34,-90" stroke={c} strokeWidth={9} strokeLinecap="round" />
    </g>
  );
};
