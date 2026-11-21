// EFECTOS DEL ATAQUE Y DE LA EDICIÓN:
//  · WaterBurst  — partículas desplazadas por la proyección de las mandíbulas (empuje radial).
//  · RevealFlash — destello azul breve que revela la anatomía en el instante de máxima extensión.
//  · Shockwave   — onda sutil de desplazamiento del agua.
//  · LightSweep  — haz de luz azul que recorre la cabeza en la oscuridad (gancho).
// Se reutiliza SlowMoFrame (marco de cámara lenta) del EP04 sin modificarlo.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, hash1} from '../../../engine/math';
export {SlowMoFrame} from '../../ep10-camaron-mantis/effects/Effects';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

/** u = segundos desde el impacto. */
export const WaterBurst: React.FC<{x: number; y: number; u: number; s?: number}> = ({x, y, u, s = 1}) => {
  if (u < 0 || u > 1.6) return null;
  const k = 1 - u / 1.6;
  return (
    <g>
      {Array.from({length: 26}, (_, i) => {
        const a = -0.9 + (i / 25) * 1.8 + (hash1(i) - 0.5) * 0.3;
        const d = (30 + 220 * (1 - Math.exp(-u * 4))) * (0.5 + hash1(i * 3)) * s;
        return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d * 0.7} r={(1.5 + hash1(i * 5) * 3) * s} fill="#dff4ff" opacity={0.7 * k} />;
      })}
    </g>
  );
};

export const Shockwave: React.FC<{x: number; y: number; u: number; s?: number}> = ({x, y, u, s = 1}) =>
  u > 0 && u < 0.9 ? <ellipse cx={x} cy={y} rx={(40 + 300 * u) * s} ry={(30 + 200 * u) * s} fill="none" stroke="#bfe8ff" strokeWidth={4 * (1 - u)} opacity={0.6 * (1 - u / 0.9)} /> : null;

export const RevealFlash: React.FC<{u: number}> = ({u}) =>
  u > 0 && u < 0.5 ? <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(circle at 60% 45%, rgba(170,230,255,0.75), rgba(40,90,160,0.2) 60%, rgba(0,0,0,0) 100%)', opacity: Math.sin((u / 0.5) * Math.PI)}} /> : null;

export const LightSweep: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) =>
  k > 0.01 ? <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(ellipse 420px 300px at ${Math.round(x)}px ${Math.round(y)}px, rgba(110,200,255,0.42), rgba(40,80,160,0.12) 55%, rgba(0,0,0,0) 100%)`, opacity: clamp(k), mixBlendMode: 'screen'}} /> : null;

export const _f = f1;
