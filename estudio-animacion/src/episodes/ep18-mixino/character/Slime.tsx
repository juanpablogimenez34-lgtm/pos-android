// MUCOSIDAD DEFENSIVA: no es humo. Se compone de
//  · masas translúcidas (gel) que se hinchan al hidratarse, con borde de membrana apenas visible;
//  · filamentos finos (las fibras proteicas) que se estiran entre las masas y desde los poros;
//  · un velo común que une el conjunto y partículas atrapadas.
// Cada liberación es determinista: origen(es), instante, dirección y escala. El volumen crece con
// una curva de hidratación rápida (≈ 1 − e^(−t/τ)) y la nube deriva con la corriente.
import React from 'react';
import {clamp, hash1} from '../../../engine/math';
import {SoftFilter} from '../../oarfish-cinematic-v2/character/filters';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export type SlimeBurst = {
  t0: number;
  sources: {x: number; y: number}[]; // poros que liberan (en mundo)
  dir: number; // dirección media de expansión (rad)
  spread?: number; // apertura (rad)
  size?: number; // radio final aproximado
  seed?: number;
  drift?: {x: number; y: number}; // deriva por segundo
  life?: number; // segundos antes de empezar a disiparse
  pull?: {x: number; y: number; k: number}; // la nube es arrastrada hacia un punto (boca/branquias)
};

const grow = (age: number, tau: number) => (age <= 0 ? 0 : 1 - Math.exp(-age / tau));

export const SlimeDefs: React.FC = () => (
  <defs>
    <SoftFilter id="slimeSoft" radius={7} />
    <radialGradient id="slimeGel" cx="0.45" cy="0.4" r="0.6">
      <stop offset="0" stopColor="#f2fbf6" stopOpacity={0.34} />
      <stop offset="0.55" stopColor="#d4ece6" stopOpacity={0.2} />
      <stop offset="0.9" stopColor="#c8e4dc" stopOpacity={0.1} />
      <stop offset="1" stopColor="#c8e4dc" stopOpacity={0} />
    </radialGradient>
  </defs>
);

export const SlimeCloud: React.FC<{b: SlimeBurst; t: number}> = ({b, t}) => {
  const age = t - b.t0;
  if (age <= 0) return null;
  const seed = b.seed ?? 1;
  const S = b.size ?? 220;
  const spread = b.spread ?? 1.6;
  const life = b.life ?? 6;
  const fade = clamp(1 - (age - life) / 3);
  if (fade <= 0) return null;
  const g = grow(age, 0.45);
  const dx = (b.drift?.x ?? 6) * age;
  const dy = (b.drift?.y ?? -3) * age;
  const N = 22;
  const blobs = Array.from({length: N}, (_, i) => {
    const src = b.sources[i % b.sources.length];
    const a = b.dir + (hash1(seed * 31 + i) - 0.5) * spread;
    const dist = S * (0.15 + 0.85 * hash1(seed * 17 + i * 3)) * grow(age - hash1(i * 7 + seed) * 0.25, 0.55);
    let x = src.x + Math.cos(a) * dist + dx + Math.sin(t * 0.7 + i) * 6 * g;
    let y = src.y + Math.sin(a) * dist + dy + Math.cos(t * 0.6 + i * 1.3) * 5 * g;
    if (b.pull) {
      const k = clamp(b.pull.k) * (0.4 + 0.6 * hash1(i * 13 + seed));
      x += (b.pull.x - x) * k;
      y += (b.pull.y - y) * k;
    }
    const r = S * (0.12 + 0.2 * hash1(seed * 7 + i * 5)) * grow(age - hash1(i * 11 + seed) * 0.3, 0.5);
    return {x, y, r, rot: hash1(i * 19 + seed) * 180, e: 0.65 + 0.5 * hash1(i * 23 + seed)};
  });
  // velo común (envolvente suavizada de las masas)
  const cx = blobs.reduce((s, p) => s + p.x, 0) / N;
  const cy = blobs.reduce((s, p) => s + p.y, 0) / N;
  const hull = blobs
    .map((p) => ({a: Math.atan2(p.y - cy, p.x - cx), d: Math.hypot(p.x - cx, p.y - cy) + p.r * 0.8}))
    .sort((p, q) => p.a - q.a)
    .map((p) => ({x: cx + Math.cos(p.a) * p.d, y: cy + Math.sin(p.a) * p.d}));
  const veil = hull.length > 2 ? `M${hull.map((p, i) => {
    const q = hull[(i + 1) % hull.length];
    return `${f1(p.x)},${f1(p.y)} Q${f1(p.x)},${f1(p.y)} ${f1((p.x + q.x) / 2)},${f1((p.y + q.y) / 2)}`;
  }).join(' ')}Z` : '';
  // filamentos: entre masas y desde los poros hacia la nube
  const threads: string[] = [];
  for (let i = 0; i < 40; i++) {
    const a = blobs[Math.floor(hash1(i * 3 + seed) * N)];
    const c = blobs[Math.floor(hash1(i * 5 + seed * 2) * N)];
    const mx = (a.x + c.x) / 2 + Math.sin(t * 1.1 + i) * 18 * g;
    const my = (a.y + c.y) / 2 + Math.cos(t * 0.9 + i) * 18 * g;
    threads.push(`M${f1(a.x)},${f1(a.y)} Q${f1(mx)},${f1(my)} ${f1(c.x)},${f1(c.y)}`);
  }
  b.sources.forEach((s, i) => {
    const c = blobs[i % N];
    threads.push(`M${f1(s.x)},${f1(s.y)} C${f1(s.x + (c.x - s.x) * 0.3)},${f1(s.y + Math.sin(t * 2 + i) * 10)} ${f1(c.x - 20)},${f1(c.y + 10)} ${f1(c.x)},${f1(c.y)}`);
  });
  return (
    <g opacity={fade}>
      {veil && <path d={veil} fill="#cfe8e0" opacity={0.16 * g} filter="url(#slimeSoft)" />}
      <g filter="url(#slimeSoft)">
        {blobs.map((p, i) => (
          <g key={i} transform={`translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(p.rot)})`}>
            <path d={`M${f1(-p.r)},0 C${f1(-p.r)},${f1(-p.r * p.e * 1.2)} ${f1(p.r * 0.8)},${f1(-p.r * p.e)} ${f1(p.r * 1.1)},${f1(-p.r * 0.1)} C${f1(p.r * 1.2)},${f1(p.r * p.e * 0.9)} ${f1(-p.r * 0.5)},${f1(p.r * p.e * 1.1)} ${f1(-p.r)},0Z`} fill="url(#slimeGel)" />
          </g>
        ))}
      </g>
      {blobs.map((p, i) => (i % 3 === 0 ? <path key={`hl${i}`} d={`M${f1(p.x - p.r * 0.5)},${f1(p.y - p.r * 0.35)} q${f1(p.r * 0.3)},${f1(-p.r * 0.2)} ${f1(p.r * 0.6)},${f1(-p.r * 0.08)}`} stroke="#ffffff" strokeWidth={1.4} fill="none" opacity={0.22 * g} strokeLinecap="round" /> : null))}
      <path d={threads.join(' ')} stroke="#eefcf6" strokeWidth={0.9} fill="none" opacity={0.38 * g} />
      <path d={threads.slice(0, 14).join(' ')} stroke="#ffffff" strokeWidth={2.4} fill="none" opacity={0.08 * g} />
      {blobs.map((p, i) => (i % 2 ? <circle key={`p${i}`} cx={p.x + p.r * 0.3} cy={p.y - p.r * 0.2} r={1.6} fill="#ffffff" opacity={0.5 * g} /> : null))}
    </g>
  );
};
