// OCÉANO ILUSTRADO por capas (amanecer, día, aguas polares, atardecer, profundidad).
// Mundo: superficie en y = 0 (con olas), agua hacia +y. Capas: cielo con sol y nubes · horizonte con costas o
// icebergs · mar con degradado por profundidad · rayos de luz · fondo lejano (rocas, bosques de algas, cardúmenes)
// · lecho marino con rocas y algas que oscilan · personajes · capa de agua sobre lo sumergido (lo emergido queda
// nítido) · línea de superficie con espuma, destellos y hielo flotante · burbujas y partículas en primer plano.
// Efectos deterministas: salpicaduras con gotas suspendidas, soplo del espiráculo, estelas de burbujas.
import React from 'react';
import {clamp, hash1, lerp, mixColor, smoothPath} from '../../../engine/math';
import {Cam, layerT, toScreen} from '../../../studio2';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);
const memo = new Map<string, unknown>();
const cached = <T,>(k: string, fn: () => T): T => {
  if (!memo.has(k)) memo.set(k, fn());
  return memo.get(k) as T;
};

export type Mood = 'dawn' | 'day' | 'polar' | 'sunset' | 'deep';
export const MOOD: Record<Mood, {sky0: string; sky1: string; sky2: string; sun: string; sea0: string; sea1: string; sea2: string; tint: string; ray: string; rock: string; kelp: string; fog: string; rim: string}> = {
  dawn: {sky0: '#2a3a6a', sky1: '#e8907a', sky2: '#ffd8a8', sun: '#fff0c8', sea0: '#2a7ab0', sea1: '#11466e', sea2: '#06172e', tint: '#14608e', ray: '#ffe8c8', rock: '#2a3a48', kelp: '#3a6a3a', fog: '#0e3a5a', rim: '#ffe2c0'},
  day: {sky0: '#2f7cc0', sky1: '#8cc6ea', sky2: '#d8eef8', sun: '#fffbe8', sea0: '#2a9ac8', sea1: '#0f5a8a', sea2: '#06203a', tint: '#1a6a9e', ray: '#d8f4ff', rock: '#2a4250', kelp: '#3e7a3a', fog: '#0f4a6a', rim: '#d8f4ff'},
  polar: {sky0: '#5a7aa8', sky1: '#bcd4e8', sky2: '#eef6fc', sun: '#ffffff', sea0: '#3a8aa8', sea1: '#14506e', sea2: '#071c30', tint: '#2a6a88', ray: '#e8f8ff', rock: '#34485a', kelp: '#2e5a48', fog: '#16465e', rim: '#e8fbff'},
  sunset: {sky0: '#2a1e48', sky1: '#c85a4a', sky2: '#ffb468', sun: '#ffe0a0', sea0: '#3a6a98', sea1: '#1a3a62', sea2: '#0a1430', tint: '#2a4a78', ray: '#ffc890', rock: '#2a2a40', kelp: '#3a4a3a', fog: '#1a2a4a', rim: '#ffc890'},
  deep: {sky0: '#0a1a30', sky1: '#0e2a48', sky2: '#14385a', sun: '#a8d8ff', sea0: '#0f4a78', sea1: '#082c52', sea2: '#040e22', tint: '#0c3a64', ray: '#9ad4ff', rock: '#1a2a3a', kelp: '#24463a', fog: '#06203a', rim: '#9ad4ff'},
};

export const waveY = (wx: number, t: number) => Math.sin(wx * 0.004 + t * 1.1) * 14 + Math.sin(wx * 0.011 - t * 1.7) * 6 + Math.sin(wx * 0.0017 + t * 0.4) * 10;

// ---------------------------------------------------------------- piezas del escenario (mundo)
/** Roca ilustrada con facetas, grietas y algas incrustantes. */
export const Rock: React.FC<{x: number; y: number; w: number; h: number; seed: number; col: string; light?: string}> = ({x, y, w, h, seed, col, light = '#8ab0c8'}) => {
  const g = cached(`rk-${x}-${y}-${w}-${h}-${seed}`, () => {
    const pts: V[] = [];
    const n = 11;
    for (let i = 0; i <= n; i++) {
      const a = Math.PI + (i / n) * Math.PI;
      const r = 0.75 + hash1(seed + i * 3.1) * 0.35;
      pts.push({x: x + Math.cos(a) * w * 0.5 * r, y: y + Math.sin(a) * h * r});
    }
    const cr: string[] = [];
    for (let i = 0; i < 5; i++) {
      const cx = x + (hash1(seed + i * 7) - 0.5) * w * 0.7;
      const cy = y - hash1(seed + i * 5) * h * 0.7;
      cr.push(`M${f1(cx)} ${f1(cy)}l${f1((hash1(seed + i) - 0.5) * 30)} ${f1(20 + hash1(i + seed) * 30)}l${f1((hash1(seed * 2 + i) - 0.5) * 20)} ${f1(20)}`);
    }
    return {d: smoothPath(pts, true), cr: cr.join('')};
  });
  return (
    <g>
      <path d={g.d} fill={col} stroke={mixColor(col, '#000', 0.45)} strokeWidth={2} />
      <path d={g.d} fill={light} opacity={0.12} transform={`translate(${f1(-w * 0.05)} ${f1(-h * 0.07)})`} />
      <path d={g.cr} stroke={mixColor(col, '#000', 0.5)} strokeWidth={2} fill="none" opacity={0.6} />
    </g>
  );
};
/** Alga gigante (kelp): tallo con flotadores y frondas que oscilan con la corriente. */
export const Kelp: React.FC<{x: number; y: number; h: number; t: number; col: string; seed: number}> = ({x, y, h, t, col, seed}) => {
  const n = 14;
  const pts: V[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    pts.push({x: x + Math.sin(t * 0.6 + seed + u * 2.2) * 40 * u + Math.sin(u * 5 + seed) * 10, y: y - u * h});
  }
  return (
    <g>
      <path d={smoothPath(pts)} stroke={mixColor(col, '#000', 0.25)} strokeWidth={6} fill="none" />
      {pts.slice(2).map((p, i) => {
        const side = i % 2 ? 1 : -1;
        const a = side * (0.9 + Math.sin(t * 0.9 + i + seed) * 0.25);
        const len = 46 + hash1(seed + i) * 30;
        return <path key={i} d={`M${f1(p.x)} ${f1(p.y)}q${f1(Math.sin(a) * len * 0.5 + side * 8)} ${f1(-len * 0.3)} ${f1(Math.sin(a) * len)} ${f1(-Math.cos(a) * len * 0.4)}q${f1(-side * 6)} ${f1(len * 0.3)} ${f1(-Math.sin(a) * len)} ${f1(Math.cos(a) * len * 0.4)}Z`} fill={col} opacity={0.92} />;
      })}
      {pts.slice(3).map((p, i) => (i % 3 === 0 ? <circle key={`b${i}`} cx={f1(p.x)} cy={f1(p.y)} r={5} fill={mixColor(col, '#e0d080', 0.3)} /> : null))}
    </g>
  );
};
/** Cardumen: cada pez con su propio movimiento; `scatter` los dispersa desde una amenaza. */
export const School: React.FC<{t: number; c: V; n: number; r: number; seed: number; dir?: 1 | -1; scatter?: number; threat?: V; s?: number; tone?: string}> = ({t, c, n, r, seed, dir = 1, scatter = 0, threat, s = 1, tone = '#b8d0dc'}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const a = hash1(seed + i * 3.7) * Math.PI * 2;
      const rr = Math.sqrt(hash1(seed + i * 1.3)) * r;
      let x = c.x + Math.cos(a + t * 0.2) * rr * 1.6 + Math.sin(t * 1.3 + i) * 8;
      let y = c.y + Math.sin(a + t * 0.2) * rr * 0.7 + Math.cos(t * 1.1 + i) * 6;
      if (scatter > 0 && threat) {
        const dx = x - threat.x;
        const dy = y - threat.y;
        const d = Math.hypot(dx, dy) || 1;
        x += (dx / d) * scatter * 240;
        y += (dy / d) * scatter * 240;
      }
      const ang = Math.sin(t * 2 + i) * 0.15;
      const sc = s * (0.8 + hash1(i + seed) * 0.4);
      return (
        <g key={i} transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((ang * 180) / Math.PI)}) scale(${f1(dir * sc * 100) / 100} ${f1(sc * 100) / 100})`}>
          <path d="M14 0C8 -6 -6 -6 -12 0C-6 6 8 6 14 0ZM-12 0L-20 -6L-18 0L-20 6Z" fill={tone} stroke="#3a5868" strokeWidth={0.8} />
          <path d="M12 -1C6 -3 -4 -3 -10 -1" stroke="#ffffff" strokeWidth={1.2} opacity={0.6} fill="none" />
          <circle cx={9} cy={-1} r={1.2} fill="#102030" />
        </g>
      );
    })}
  </g>
);

/** Témpano de hielo flotante; `tilt` lo inclina (ola) y `heave` lo eleva. */
export const IceFloe: React.FC<{x: number; w: number; t: number; tilt?: number; heave?: number; seed: number; children?: React.ReactNode}> = ({x, w, t, tilt = 0, heave = 0, seed, children}) => {
  const g = cached(`ice-${w}-${seed}`, () => {
    const top: V[] = [];
    for (let i = 0; i <= 10; i++) top.push({x: -w / 2 + (i / 10) * w, y: -14 - hash1(seed + i) * 10});
    const bot: V[] = [];
    for (let i = 10; i >= 0; i--) bot.push({x: -w / 2 + (i / 10) * w * 0.98 + w * 0.01, y: 40 + hash1(seed + i * 2) * 26});
    return smoothPath([...top, ...bot], true);
  });
  const y = waveY(x, t) * 0.6 - heave;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((tilt * 180) / Math.PI)})`}>
      <path d={g} fill="#e8f6fc" stroke="#7aa8c0" strokeWidth={2} />
      <path d={`M${-w / 2 + 10} -12L${w / 2 - 10} -12`} stroke="#ffffff" strokeWidth={6} opacity={0.9} />
      <path d={`M${-w / 2 + 6} 6L${w / 2 - 6} 10`} stroke="#9ac8dc" strokeWidth={10} opacity={0.5} />
      {children}
    </g>
  );
};
/** Iceberg del horizonte (polar). */
export const Iceberg: React.FC<{x: number; s: number; seed: number}> = ({x, s, seed}) => {
  const d = cached(`berg-${seed}`, () => smoothPath([{x: -220, y: 0}, {x: -150, y: -120}, {x: -60, y: -160 - hash1(seed) * 60}, {x: 20, y: -110}, {x: 110, y: -190}, {x: 200, y: -60}, {x: 240, y: 0}], true));
  return (
    <g transform={`translate(${x} 0) scale(${s})`}>
      <path d={d} fill="#eef8fc" stroke="#a8c8d8" strokeWidth={2} />
      <path d={d} fill="#9ac0d4" opacity={0.35} transform="translate(30 0) scale(0.8 1)" />
    </g>
  );
};
/** Costa rocosa lejana (dawn/sunset/day). */
export const Coast: React.FC<{col: string}> = ({col}) => {
  const d = cached('coast', () => {
    const pts: V[] = [{x: -3000, y: 10}];
    for (let x = -3000; x <= 3000; x += 120) pts.push({x, y: -30 - hash1(x * 0.01) * 80 - Math.max(0, Math.sin(x * 0.001)) * 120});
    pts.push({x: 3000, y: 10});
    return smoothPath(pts, true);
  });
  return <path d={d} fill={col} />;
};

// ---------------------------------------------------------------- efectos
/** Salpicadura: corona de agua + gotas suspendidas en arcos (determinista). */
export const Splash: React.FC<{x: number; t: number; t0: number; size?: number; slow?: number}> = ({x, t, t0, size = 1, slow = 1}) => {
  const dt = (t - t0) / slow;
  if (dt < 0 || dt > 2.6) return null;
  const k = clamp(dt / 2.6);
  const crown = Math.sin(clamp(dt / 0.9) * Math.PI);
  const drops: React.ReactNode[] = [];
  for (let i = 0; i < 46; i++) {
    const a = -Math.PI / 2 + (hash1(i * 3.3) - 0.5) * 2.4;
    const v = (300 + hash1(i * 7.1) * 520) * size;
    const px = x + Math.cos(a) * v * dt;
    const py = Math.sin(a) * v * dt + 0.5 * 900 * dt * dt;
    if (py > 10) continue;
    drops.push(<ellipse key={i} cx={f1(px)} cy={f1(py)} rx={f1((3 + hash1(i) * 6) * size)} ry={f1((4 + hash1(i * 2) * 7) * size)} fill="#eaf8ff" opacity={0.85 * (1 - k)} stroke="#ffffff" strokeWidth={0.8} />);
  }
  const W = 220 * size;
  return (
    <g>
      <path d={`M${f1(x - W)} 0Q${f1(x - W * 0.6)} ${f1(-160 * size * crown)} ${f1(x - W * 0.25)} ${f1(-60 * size * crown)}Q${f1(x)} ${f1(-260 * size * crown)} ${f1(x + W * 0.25)} ${f1(-60 * size * crown)}Q${f1(x + W * 0.6)} ${f1(-160 * size * crown)} ${f1(x + W)} 0Z`} fill="#e8f8ff" opacity={0.8 * crown} />
      <ellipse cx={x} cy={4} rx={f1(W * (0.8 + k * 1.4))} ry={f1(18 * size * (1 + k))} fill="#ffffff" opacity={0.55 * (1 - k)} />
      {drops}
    </g>
  );
};
/** Soplo del espiráculo: columna de aire húmedo que se abre y se disipa. */
export const Blow: React.FC<{x: number; y: number; t: number; t0: number; s?: number}> = ({x, y, t, t0, s = 1}) => {
  const dt = t - t0;
  if (dt < 0 || dt > 2.4) return null;
  const k = clamp(dt / 2.4);
  return (
    <g opacity={1 - k}>
      {Array.from({length: 18}, (_, i) => {
        const h = (160 + hash1(i) * 120) * s * Math.min(1, dt / 0.35);
        const u = i / 17;
        return <circle key={i} cx={f1(x + (hash1(i * 3) - 0.5) * 60 * s * (0.3 + u + k))} cy={f1(y - h * u)} r={f1((14 + u * 26 + k * 30) * s)} fill="#f4fbff" opacity={0.25 + 0.2 * (1 - u)} />;
      })}
    </g>
  );
};
/** Burbujas que ascienden desde un emisor (estela). */
export const Bubbles: React.FC<{t: number; src: V; n?: number; seed?: number; rate?: number; k?: number; s?: number}> = ({t, src, n = 14, seed = 1, rate = 1, k = 1, s = 1}) => (
  <g opacity={k}>
    {Array.from({length: n}, (_, i) => {
      const life = 2.6;
      const ph = ((t * rate + hash1(seed + i) * life) % life) / life;
      const x = src.x + (hash1(seed + i * 3) - 0.5) * 40 * s + Math.sin(t * 3 + i) * 8 * ph;
      const y = src.y - ph * 360 * s;
      return <circle key={i} cx={f1(x)} cy={f1(y)} r={f1((2 + hash1(i * 5) * 5) * s * (0.6 + ph))} fill="none" stroke="#e8f8ff" strokeWidth={1.4} opacity={0.75 * (1 - ph)} />;
    })}
  </g>
);

// ---------------------------------------------------------------- escena oceánica completa
export type SeaProps = {
  cam: Cam; t: number; mood: Mood; children?: React.ReactNode;
  floor?: number; // profundidad del lecho (mundo y); undefined = sin fondo visible
  kelp?: boolean; rocks?: boolean; ice?: boolean; coast?: boolean;
  schools?: {c: V; n: number; r: number; seed: number; dir?: 1 | -1; scatter?: number; threat?: V; depth?: number}[];
  extraWave?: (wx: number, t: number) => number;
  front?: React.ReactNode; // elementos de la superficie (hielo, salpicaduras) dibujados sobre la línea del agua
  depthDark?: number;
};
export const Sea: React.FC<SeaProps> = ({cam, t, mood, children, floor, kelp, rocks, ice, coast, schools = [], extraWave, front, depthDark = 1}) => {
  const M = MOOD[mood];
  const wv = (wx: number) => waveY(wx, t) + (extraWave ? extraWave(wx, t) : 0);
  const pts: V[] = [];
  for (let i = 0; i <= 40; i++) {
    const sx = -40 + (i / 40) * 1160;
    const wx = cam.x + (sx - 540) / cam.zoom;
    pts.push({x: sx, y: toScreen(cam, wx, wv(wx)).y});
  }
  const sy = toScreen(cam, cam.x, 0).y;
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${f1(p.x)},${f1(p.y)}`).join(' ');
  const below = `${line} L1120,2200 L-40,2200Z`;
  // oscurecimiento por profundidad (cámara bajo el agua)
  const camDepth = clamp((cam.y - 400) / 2600) * depthDark;
  const sun = {x: 760, y: Math.min(sy - 280, 420)};
  const id = `sea-${mood}`;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-sky`} gradientUnits="userSpaceOnUse" x1="0" y1={sy - 1500} x2="0" y2={sy}>
          <stop offset="0" stopColor={M.sky0} />
          <stop offset="0.7" stopColor={M.sky1} />
          <stop offset="1" stopColor={M.sky2} />
        </linearGradient>
        <linearGradient id={`${id}-sea`} gradientUnits="userSpaceOnUse" x1="0" y1={sy} x2="0" y2={sy + 1600 * cam.zoom}>
          <stop offset="0" stopColor={M.sea0} />
          <stop offset="0.55" stopColor={M.sea1} />
          <stop offset="1" stopColor={M.sea2} />
        </linearGradient>
        <radialGradient id={`${id}-sun`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={M.sun} stopOpacity={0.95} />
          <stop offset="0.3" stopColor={M.sun} stopOpacity={0.45} />
          <stop offset="1" stopColor={M.sun} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-ray`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={M.ray} stopOpacity={0.34} />
          <stop offset="1" stopColor={M.ray} stopOpacity={0} />
        </linearGradient>
        <clipPath id={`${id}-below`}>
          <path d={below} />
        </clipPath>
        <clipPath id={`${id}-above`}>
          <path d={`${line} L1120,-300 L-40,-300Z`} />
        </clipPath>
      </defs>
      <rect x={-40} y={-200} width={1160} height={Math.max(0, sy + 240)} fill={`url(#${id}-sky)`} />
      <rect x={-40} y={sy - 20} width={1160} height={2400} fill={`url(#${id}-sea)`} />
      {sy > -100 && (
        <g>
          <circle cx={sun.x} cy={mood === 'sunset' || mood === 'dawn' ? sy - 60 : sun.y} r={300} fill={`url(#${id}-sun)`} />
          {Array.from({length: 6}, (_, i) => {
            const cx = ((hash1(i * 7) * 1700 + t * 6 * (0.5 + hash1(i))) % 1700) - 300;
            const cy = sy - 200 - hash1(i * 3) * 480;
            const w = 170 + hash1(i * 5) * 230;
            return <ellipse key={i} cx={cx} cy={cy} rx={w} ry={w * 0.15} fill={mixColor(M.sky2, '#ffffff', 0.4)} opacity={0.45} />;
          })}
          <g clipPath={`url(#${id}-above)`}>
            <g transform={`translate(${f1(540 - cam.x * 0.15 * Math.pow(cam.zoom, 0.15))} ${f1(sy + 6)}) scale(${f1(Math.pow(cam.zoom, 0.15) * 100) / 100})`}>
              {coast && <Coast col={mixColor(M.rock, M.sky1, 0.55)} />}
              {ice && [-1300, -400, 600, 1500].map((x, i) => <Iceberg key={i} x={x} s={0.7 + hash1(i) * 0.6} seed={i + 3} />)}
            </g>
          </g>
        </g>
      )}
      {/* rayos de luz */}
      <g clipPath={`url(#${id}-below)`} opacity={1 - camDepth * 0.7}>
        {Array.from({length: 8}, (_, i) => {
          const x0 = 40 + i * 140 + Math.sin(t * 0.3 + i) * 40;
          return <path key={i} d={`M${f1(x0)},${f1(Math.max(-200, sy))} l${f1(-160 + i * 6)},1900 l${f1(100 + hash1(i) * 70)},0 Z`} fill={`url(#${id}-ray)`} opacity={0.45 + 0.45 * Math.sin(t * 0.7 + i * 1.7)} />;
        })}
      </g>
      {/* fondo lejano: siluetas de rocas y algas en bruma, cardúmenes lejanos */}
      <g clipPath={`url(#${id}-below)`}>
        <g transform={layerT(cam, 0.55)}>
          {(kelp || rocks) && floor !== undefined && Array.from({length: 14}, (_, i) => {
            const x = cam.x * 0.55 - 1600 + i * 260 + hash1(i) * 100;
            return <Rock key={i} x={x} y={floor * 0.95} w={260 + hash1(i * 3) * 220} h={120 + hash1(i * 5) * 160} seed={i + 50} col={mixColor(M.rock, M.fog, 0.55)} light={M.ray} />;
          })}
          {kelp && floor !== undefined && Array.from({length: 18}, (_, i) => <Kelp key={`k${i}`} x={cam.x * 0.55 - 1700 + i * 200 + hash1(i * 9) * 80} y={floor * 0.95} h={520 + hash1(i * 4) * 500} t={t} col={mixColor(M.kelp, M.fog, 0.5)} seed={i} />)}
          {schools.filter((s) => (s.depth ?? 0.55) < 1).map((s, i) => <School key={i} t={t} {...s} tone={mixColor('#b8d0dc', M.fog, 0.4)} />)}
        </g>
        <rect x={-40} y={-200} width={1160} height={2400} fill={M.fog} opacity={0.25 + camDepth * 0.3} />
        {/* lecho marino cercano */}
        {floor !== undefined && (
          <g transform={layerT(cam, 0.85)}>
            <rect x={cam.x * 0.85 - 2000} y={floor} width={4000} height={2000} fill={mixColor(M.rock, '#000', 0.25)} />
            {rocks && Array.from({length: 10}, (_, i) => <Rock key={i} x={cam.x * 0.85 - 1500 + i * 330 + hash1(i * 7) * 120} y={floor + 30} w={300 + hash1(i * 2) * 260} h={140 + hash1(i * 6) * 160} seed={i + 9} col={M.rock} light={M.ray} />)}
            {kelp && Array.from({length: 12}, (_, i) => <Kelp key={`k${i}`} x={cam.x * 0.85 - 1500 + i * 280 + hash1(i * 13) * 100} y={floor + 10} h={600 + hash1(i * 4) * 520} t={t} col={M.kelp} seed={i + 30} />)}
          </g>
        )}
      </g>
      {/* personajes */}
      <g transform={layerT(cam, 1)}>
        {schools.filter((s) => (s.depth ?? 0.55) >= 1).map((s, i) => <School key={i} t={t} {...s} />)}
        {children}
      </g>
      {/* agua sobre lo sumergido */}
      <g clipPath={`url(#${id}-below)`}>
        <rect x={-40} y={sy - 40} width={1160} height={2400} fill={M.tint} opacity={0.32 + camDepth * 0.25} />
        {Array.from({length: 14}, (_, i) => {
          const x = ((hash1(i * 9) * 1200 + Math.sin(t * 0.8 + i) * 30) % 1160) - 40;
          return <path key={`c${i}`} d={`M${f1(x)},${f1(sy + 30 + hash1(i) * 90)} q30,${f1(-8 + Math.sin(t * 2 + i) * 6)} 60,0 t60,0`} stroke={M.ray} strokeWidth={2} fill="none" opacity={0.25} />;
        })}
      </g>
      {/* superficie */}
      <path d={line} stroke="#eef9ff" strokeWidth={4} fill="none" opacity={0.85} />
      {pts.map((p, i) => (i % 2 === 0 ? <path key={`f${i}`} d={`M${f1(p.x - 14)},${f1(p.y + 2)} q14,${f1(-5 - hash1(i) * 4)} 28,0`} stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.3 + 0.3 * Math.sin(t * 2 + i)} /> : null))}
      {sy > -60 && sy < 2000 && Array.from({length: 16}, (_, i) => {
        const x = sun.x - 320 + hash1(i * 4) * 640;
        const y = sy + 4 + hash1(i * 6) * 40;
        const k = Math.max(0, Math.sin(t * 3 + i * 2.3));
        return <rect key={`g${i}`} x={x} y={y} width={18 + hash1(i) * 26} height={2.5} fill={M.sun} opacity={0.75 * k} />;
      })}
      <g transform={layerT(cam, 1)}>{front}</g>
      {/* partículas en suspensión */}
      <g clipPath={`url(#${id}-below)`}>
        {Array.from({length: 40}, (_, i) => {
          const x = ((hash1(i * 3.3) * 1200 + t * (5 + 8 * hash1(i))) % 1200) - 60;
          const y = ((hash1(i * 5.1) * 2000 - t * 6 + Math.sin(t * 0.7 + i) * 20) % 2000 + 2000) % 2000;
          return <circle key={i} cx={f1(x)} cy={f1(y)} r={f1(1.2 + hash1(i * 9) * 2.2)} fill={M.ray} opacity={0.18 + 0.3 * Math.abs(Math.sin(t * 1.3 + i))} />;
        })}
      </g>
      <defs>
        <radialGradient id={`${id}-vig`} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.5} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill={`url(#${id}-vig)`} />
    </g>
  );
};
export const _k = {lerp};
