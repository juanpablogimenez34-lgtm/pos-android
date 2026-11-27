// Fauna secundaria vista de lado: bacalao ártico (Boreogadus saida), fletán negro (Reinhardtius hippoglossoides)
// y calamar. El pez golpeado por el colmillo solo se aturde y gira (sin heridas ni sangre).
import React from 'react';
import {clamp, lerp} from '../../../engine/math';

const f1 = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);

/** Bacalao ártico de lado; `stun` 0–1 detiene la natación y lo hace girar sobre sí mismo. */
export const Cod: React.FC<{x: number; y: number; dir?: 1 | -1; s?: number; t: number; stun?: number; spin?: number; op?: number; alert?: number}> = ({x, y, dir = 1, s = 1, t, stun = 0, spin = 0, op = 1, alert = 0}) => {
  const w = Math.sin(t * (10 + alert * 10)) * (1 - stun);
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(spin)}) scale(${f1(dir * s * 100) / 100} ${f1(s * 100) / 100})`} opacity={op}>
      <path d={`M-34 0L${f1(-50)} ${f1(-12 + w * 5)}L-47 0L-50 ${f1(12 + w * 5)}Z`} fill="#8c9a92" stroke="#3a4640" strokeWidth={1.2} />
      <path d="M36 0C30 -11 6 -13 -12 -9C-24 -6 -32 -3 -36 0C-32 3 -24 6 -12 8C6 12 30 10 36 0Z" fill="#a6b2a6" stroke="#3a4640" strokeWidth={1.4} />
      <path d="M36 0C30 -11 6 -13 -12 -9C-24 -6 -32 -3 -36 0C-20 -1 10 -2 36 0Z" fill="#6a786e" opacity={0.7} />
      <path d="M-6 -10L2 -16L10 -11Z M-22 -7L-16 -12L-10 -9Z M-6 9L4 14L10 9Z" fill="#7a887e" />
      <path d="M30 4L18 6" stroke="#3a4640" strokeWidth={1.2} />
      <path d="M33 5L35 11" stroke="#7a887e" strokeWidth={1.5} />
      <circle cx={24} cy={-2} r={3.4} fill="#e8eee8" />
      <circle cx={24.6} cy={-2} r={2} fill="#121a16" />
      <path d="M-30 0C-10 1 10 1 30 -1" stroke="#dfe8de" strokeWidth={1.4} opacity={0.6} />
      {stun > 0.05 && <g opacity={stun * 0.8}>{[0, 1, 2].map((i) => <circle key={i} cx={f1(24 + Math.cos(t * 6 + i * 2.1) * 14)} cy={f1(-22 + Math.sin(t * 6 + i * 2.1) * 4)} r={2.2} fill="#ffe9a0" />)}</g>}
    </g>
  );
};

/** Calamar de aguas profundas (manto, aletas, brazos que ondulan). */
export const Squid: React.FC<{x: number; y: number; dir?: 1 | -1; s?: number; t: number; op?: number; glow?: number}> = ({x, y, dir = 1, s = 1, t, op = 1, glow = 0}) => {
  const pulse = Math.sin(t * 3) * 0.08;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(dir * s * (1 + pulse) * 100) / 100} ${f1(s * (1 - pulse) * 100) / 100})`} opacity={op}>
      {Array.from({length: 8}, (_, i) => {
        const a = (i - 3.5) * 0.09;
        const l = i === 2 || i === 5 ? 80 : 58;
        const wv = Math.sin(t * 3 + i) * 8;
        return <path key={i} d={`M-30 ${f1(a * 40)}Q${f1(-30 - l * 0.5)} ${f1(a * 90 + wv)} ${f1(-30 - l)} ${f1(a * 150 - wv)}`} stroke="#c8786e" strokeWidth={i === 2 || i === 5 ? 3 : 4.5} fill="none" strokeLinecap="round" />;
      })}
      <path d="M-34 -10C-10 -14 30 -12 62 0C30 12 -10 14 -34 10Z" fill="#d88a7a" stroke="#6a2e28" strokeWidth={1.4} />
      <path d={`M48 -4L${f1(70 + pulse * 30)} ${f1(-18)}L66 0L${f1(70 + pulse * 30)} 18L48 4Z`} fill="#c87868" stroke="#6a2e28" strokeWidth={1.2} />
      {Array.from({length: 9}, (_, i) => <circle key={i} cx={-20 + i * 8} cy={-5 + (i % 3) * 4} r={2} fill="#8a3a32" opacity={0.6} />)}
      <circle cx={-26} cy={-2} r={5} fill="#f4e8d0" />
      <circle cx={-26} cy={-2} r={3} fill="#101418" />
      {glow > 0 && <circle cx={0} cy={0} r={60} fill="#9ff0ff" opacity={glow * 0.15} />}
    </g>
  );
};

/** Fletán negro (pez plano de fondo) nadando cerca del lecho. */
export const Halibut: React.FC<{x: number; y: number; dir?: 1 | -1; s?: number; t: number; op?: number}> = ({x, y, dir = 1, s = 1, t, op = 1}) => {
  const w = Math.sin(t * 4);
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(dir * s * 100) / 100} ${f1(s * 100) / 100})`} opacity={op}>
      <path d={`M-70 0L-96 ${f1(-20 + w * 6)}L-90 0L-96 ${f1(20 + w * 6)}Z`} fill="#3a3c40" />
      <path d={`M70 0C60 -26 10 -34 -40 -24C-56 -18 -66 -8 -72 0C-66 8 -56 18 -40 24C10 34 60 26 70 0Z`} fill="#4a4c52" stroke="#1a1c20" strokeWidth={1.6} />
      <path d={`M-60 ${f1(-12 + w * 2)}C-20 -36 40 -34 66 -6`} stroke="#5a5c62" strokeWidth={6} fill="none" />
      <path d={`M-60 ${f1(12 - w * 2)}C-20 36 40 34 66 6`} stroke="#5a5c62" strokeWidth={6} fill="none" />
      <circle cx={52} cy={-8} r={4} fill="#d8d0b0" />
      <circle cx={52} cy={-8} r={2.4} fill="#101010" />
      <path d="M66 4L56 8" stroke="#1a1c20" strokeWidth={1.4} />
    </g>
  );
};

/** Destello suave de contacto (sin sangre): anillo de presión en el agua. */
export const Contact: React.FC<{x: number; y: number; k: number; s?: number}> = ({x, y, k, s = 1}) =>
  k > 0.01 ? (
    <g opacity={k}>
      <circle cx={f1(x)} cy={f1(y)} r={f1(lerp(70, 18, k) * s)} fill="none" stroke="#e8fcff" strokeWidth={5 * s} />
      <circle cx={f1(x)} cy={f1(y)} r={f1(lerp(110, 30, k) * s)} fill="none" stroke="#9fe8ff" strokeWidth={3 * s} opacity={0.6} />
      <circle cx={f1(x)} cy={f1(y)} r={f1(16 * s * k)} fill="#ffffff" opacity={0.5} />
    </g>
  ) : null;
export const _k = {clamp};
