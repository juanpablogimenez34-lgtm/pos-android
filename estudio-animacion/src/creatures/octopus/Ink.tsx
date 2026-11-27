import React, {useMemo} from 'react';
import {clamp, rng} from '../../engine/math';
import {useTime} from '../../engine/useTime';

export type InkEvent = {t: number; x: number; y: number; dirX: number; dirY: number; amount?: number};

/**
 * Nube de tinta determinista: cada evento emite bocanadas que se expanden,
 * derivan y se desvanecen. Pensada para la escena del depredador (estado INK_ESCAPE).
 */
export const InkCloud: React.FC<{id: string; events: InkEvent[]; life?: number}> = ({id, events, life = 5}) => {
  const t = useTime();
  const puffs = useMemo(() => {
    const out: {t0: number; x: number; y: number; vx: number; vy: number; r: number; seed: number}[] = [];
    events.forEach((e, ei) => {
      const r = rng(1000 + ei);
      const count = Math.round(14 * (e.amount ?? 1));
      for (let i = 0; i < count; i++) {
        out.push({
          t0: e.t + i * 0.025,
          x: e.x,
          y: e.y,
          vx: e.dirX * (60 + r() * 140) + (r() - 0.5) * 60,
          vy: e.dirY * (60 + r() * 140) + (r() - 0.5) * 60,
          r: 20 + r() * 40,
          seed: r() * 10,
        });
      }
    });
    return out;
  }, [events]);
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-ink`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#05060d" stopOpacity={0.95} />
          <stop offset="0.55" stopColor="#0b0c1c" stopOpacity={0.7} />
          <stop offset="1" stopColor="#141633" stopOpacity={0} />
        </radialGradient>
      </defs>
      {puffs.map((p, i) => {
        const age = t - p.t0;
        if (age < 0 || age > life) return null;
        const k = 1 - Math.exp(-age * 1.6);
        const x = p.x + (p.vx * k) / 1.6 + Math.sin(age * 0.8 + p.seed) * 14 * age;
        const y = p.y + (p.vy * k) / 1.6 - age * 6;
        const rad = p.r * (0.4 + age * 1.3);
        const o = clamp(age / 0.15) * clamp(1 - age / life);
        return <circle key={i} cx={x} cy={y} r={rad} fill={`url(#${id}-ink)`} opacity={o} />;
      })}
    </g>
  );
};
