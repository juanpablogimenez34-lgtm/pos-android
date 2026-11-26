// Plataforma de hielo marino vista de lado: parte emergida baja con nieve, cara inferior irregular (y = 0 es la
// línea del agua), haces de luz que atraviesan el hielo y bordes verticales. Geometría memorizada por tramo.
import React from 'react';
import {hash1, smoothPath} from '../../../engine/math';

type V = {x: number; y: number};
const memo = new Map<string, {body: string; under: V[]}>();
const f1 = (n: number) => Math.round(n * 10) / 10;

export const IceShelf: React.FC<{t: number; x0: number; x1: number; seed?: number; rays?: number; thick?: number}> = ({t, x0, x1, seed = 1, rays = 1, thick = 1}) => {
  const key = `${x0}|${x1}|${seed}|${thick}`;
  let g = memo.get(key);
  if (!g) {
    const n = Math.max(6, Math.round((x1 - x0) / 150));
    const top: V[] = [];
    const under: V[] = [];
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      top.push({x, y: -34 - hash1(seed + i * 1.7) * 18});
      under.push({x, y: (50 + hash1(seed + i * 3.1) * 80 + Math.sin(i * 1.3 + seed) * 25) * thick});
    }
    const body = smoothPath([{x: x0 + 6, y: 10}, ...top.slice(1, -1), {x: x1 - 6, y: 10}, ...[...under].reverse().slice(1, -1)], true);
    g = {body, under};
    memo.set(key, g);
  }
  const id = `ish-${seed}`;
  const nr = Math.max(2, Math.round((x1 - x0) / 520));
  const rayXs = Array.from({length: nr}, (_, i) => x0 + ((i + 0.5) / nr) * (x1 - x0) + (hash1(seed + i) - 0.5) * 120);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-g`} gradientUnits="userSpaceOnUse" x1="0" y1={-50} x2="0" y2={150 * thick}>
          <stop offset="0" stopColor="#f6fcff" />
          <stop offset="0.3" stopColor="#c4e2ee" />
          <stop offset="0.65" stopColor="#7ab4cc" />
          <stop offset="1" stopColor="#4a88a4" />
        </linearGradient>
        <linearGradient id={`${id}-r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e4f6ff" stopOpacity={0.45} />
          <stop offset="1" stopColor="#e4f6ff" stopOpacity={0} />
        </linearGradient>
      </defs>
      {rays > 0 && rayXs.map((cx, i) => <path key={i} d={`M${f1(cx - 40)} 90L${f1(cx - 300)} 1900L${f1(cx + 240)} 1900L${f1(cx + 40)} 90Z`} fill={`url(#${id}-r)`} opacity={rays * (0.3 + 0.2 * Math.sin(t * 0.6 + i * 2))} />)}
      <path d={g.body} fill={`url(#${id}-g)`} stroke="#9cc8da" strokeWidth={2} />
      <path d={smoothPath(g.under.slice(1, -1).map((p) => ({x: p.x, y: p.y - 14})))} stroke="#dff4fc" strokeWidth={6} fill="none" opacity={0.35} />
      <path d={`M${x0 + 20} -40L${x1 - 20} -40`} stroke="#ffffff" strokeWidth={10} opacity={0.85} strokeLinecap="round" />
      {g.under.slice(1, -1).filter((_, i) => i % 2 === 0).map((p, i) => <ellipse key={i} cx={p.x + 30} cy={p.y - 26} rx={34} ry={7} fill="#eef9ff" opacity={0.3} />)}
    </g>
  );
};
/** Lecho marino propio (sin capa de paralaje), para tomas profundas. */
export const Seabed: React.FC<{x: number; y: number; w?: number; col?: string}> = ({x, y, w = 6000, col = '#0b1c28'}) => (
  <g>
    <rect x={x - w / 2} y={y} width={w} height={3000} fill={col} />
    {Array.from({length: 18}, (_, i) => {
      const rx = x - w / 2 + (i + hash1(i * 3)) * (w / 18);
      const h = 60 + hash1(i * 7) * 140;
      return <path key={i} d={`M${f1(rx - 160)} ${y + 4}Q${f1(rx - 90)} ${f1(y - h)} ${f1(rx)} ${f1(y - h * 0.9)}Q${f1(rx + 110)} ${f1(y - h * 0.7)} ${f1(rx + 170)} ${y + 4}Z`} fill="#13283a" stroke="#23405a" strokeWidth={2} />;
    })}
  </g>
);
