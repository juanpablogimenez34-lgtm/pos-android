// SISTEMA DE PECES REUTILIZABLE (vista lateral, mira hacia +x):
//  · Flexión corporal: columna de 28 puntos con onda que crece hacia la cola (la propulsión lateral real se ve,
//    de perfil, como un batido de la aleta caudal: su cuerda aparente se acorta y se inclina al pasar de lado).
//  · Aletas: cada una con puntos de control propios, curvatura animada, desfase temporal, extensión/plegado e
//    inclinación coordinada con el cuerpo (dorsales y anales ondulan; pectorales y pélvicas giran en su base).
//  · Ojos con mirada hacia un objetivo; mandíbula articulada; fotóforos; capa de detalles por especie.
import React from 'react';
import {clamp, lerp, mixColor, smoothPath} from '../../../engine/math';

export type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);
export type Prof = [number, number][];
export type FinSpec = {kind: 'dorsal' | 'anal' | 'pectoral' | 'pelvic' | 'caudal' | 'adipose'; u0: number; u1?: number; h: number; v?: number; rays?: number; color?: string; phase?: number; shape?: 'round' | 'pointed' | 'fork' | 'lunate' | 'fan' | 'hetero'; fold?: number; op?: number; sweep?: number};
export type FishSpec = {
  L: number; top: Prof; bot: Prof;
  colors: {back: string; belly: string; mid?: string; fin: string; line: string; eye?: string};
  fins: FinSpec[];
  eye: {u: number; v: number; r: number; iris?: string; ring?: string};
  mouth?: {u: number; v: number; jaw?: number; lip?: string};
  photophores?: {u: number; v: number; r: number}[];
  wave?: number; // amplitud de la flexión corporal
  bodyOp?: number; // translucidez
  lateral?: boolean; // línea lateral
};
export type FishPose = {x: number; y: number; angle?: number; facing?: 1 | -1; scale: number; t: number; phase: number; amp?: number; jaw?: number; look?: V; glow?: number; tone?: number; rim?: number; fold?: number};

const prof = (tab: Prof, u: number) => {
  if (u <= tab[0][0]) return tab[0][1];
  for (let i = 1; i < tab.length; i++) {
    if (u <= tab[i][0]) {
      const k = (u - tab[i - 1][0]) / (tab[i][0] - tab[i - 1][0]);
      const s = k * k * (3 - 2 * k);
      return lerp(tab[i - 1][1], tab[i][1], s);
    }
  }
  return tab[tab.length - 1][1];
};
const N = 28;
export type Body = {pts: V[]; nrm: V[]; U: (u: number, v: number) => V; L: number};
/** Columna deformada y función de superficie U(u, v): u 0 hocico … 1 cola; v +1 dorso … −1 vientre. */
export function fishBody(S: FishSpec, P: FishPose): Body {
  const L = S.L;
  const amp = (P.amp ?? 1) * (S.wave ?? 0.06);
  const pts: V[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const env = Math.pow(Math.max(0, u - 0.25) / 0.75, 1.5);
    const y = Math.sin(P.phase - u * 4.2) * env * amp * L * 0.5 + Math.sin(P.phase + 1) * amp * L * 0.03 * (1 - u);
    pts.push({x: -u * L, y});
  }
  const nrm = pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(N, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    const n = {x: dy / l, y: -dx / l};
    return n.y > 0 ? {x: -n.x, y: -n.y} : n;
  });
  const U = (u: number, v: number) => {
    const f = clamp(u) * N;
    const i = Math.min(N - 1, Math.floor(f));
    const k = f - i;
    const p = {x: lerp(pts[i].x, pts[i + 1].x, k), y: lerp(pts[i].y, pts[i + 1].y, k)};
    const n = {x: lerp(nrm[i].x, nrm[i + 1].x, k), y: lerp(nrm[i].y, nrm[i + 1].y, k)};
    const h = (v >= 0 ? v * prof(S.top, u) : v * prof(S.bot, u)) * L;
    return {x: p.x + n.x * h, y: p.y + n.y * h};
  };
  return {pts, nrm, U, L};
}

function finPath(S: FishSpec, B: Body, F: FinSpec, P: FishPose): string {
  const t = P.t;
  const L = B.L;
  const ph = F.phase ?? 0;
  if (F.kind === 'dorsal' || F.kind === 'anal' || F.kind === 'adipose') {
    const top = F.kind !== 'anal';
    const sg = top ? 1 : -1;
    const u0 = F.u0;
    const u1 = F.u1 ?? F.u0 + 0.1;
    const n = Math.max(4, F.rays ?? 8);
    const base: V[] = [];
    const tip: V[] = [];
    for (let i = 0; i <= n; i++) {
      const u = lerp(u0, u1, i / n);
      const b = B.U(u, sg * 0.97);
      const prof = F.shape === 'pointed' ? Math.sin(Math.PI * Math.pow(i / n, 0.55)) : F.shape === 'round' ? Math.sin(Math.PI * (i / n)) ** 0.7 : 1 - 0.6 * (i / n);
      const ripple = Math.sin(t * 5 + i * 0.7 + ph) * 0.12;
      const hh = F.h * L * prof * (1 - (F.fold ?? 0) * 0.7) * (1 + ripple);
      const sweep = (F.sweep ?? 0.35) * L * F.h;
      const k = Math.min(B.pts.length - 2, Math.floor(u * N));
      const nn = B.nrm[k];
      tip.push({x: b.x + nn.x * hh * sg - sweep * (i / n) * 0.3 - sweep * 0.3, y: b.y + nn.y * hh * sg});
      base.push(b);
    }
    return smoothPath([...base, ...tip.reverse()], true);
  }
  if (F.kind === 'caudal') {
    const e = B.pts[N];
    const p = B.pts[N - 2];
    const a = Math.atan2(e.y - p.y, e.x - p.x);
    const beat = Math.sin(P.phase - 4.2 + ph);
    const chord = F.h * L * (0.45 + 0.55 * Math.abs(Math.cos(P.phase - 4.2))) ;
    const span = F.h * L * 1.05;
    const d = {x: Math.cos(a), y: Math.sin(a)};
    const s = {x: -d.y, y: d.x};
    const skew = beat * 0.25;
    const T = (fx: number, fy: number) => ({x: e.x + d.x * fx * chord + s.x * fy * span + d.x * skew * fy * span * 0.3, y: e.y + d.y * fx * chord + s.y * fy * span});
    const fork = F.shape === 'fork' ? 0.55 : F.shape === 'lunate' ? 0.75 : F.shape === 'round' ? 1.05 : F.shape === 'fan' ? 0.95 : 0.85;
    const pts = F.shape === 'hetero'
      ? [T(-0.15, 0.22), T(0.5, 0.7), T(1.25, 1.25), T(1.1, 1.05), T(0.62, 0.15), T(0.7, -0.1), T(0.9, -0.62), T(0.75, -0.66), T(0.3, -0.4), T(-0.15, -0.2)]
      : F.shape === 'round' || F.shape === 'fan'
      ? [T(-0.1, 0.25), T(0.4, 0.7), T(1, 0.55), T(1.1, 0), T(1, -0.55), T(0.4, -0.7), T(-0.1, -0.25)]
      : [T(-0.15, 0.2), T(0.5, 0.65), T(1.05, 1), T(fork, 0.12), T(fork - 0.05, 0), T(fork, -0.12), T(1.05, -1), T(0.5, -0.65), T(-0.15, -0.2)];
    return smoothPath(pts, true, F.shape === 'lunate' || F.shape === 'fork' ? 0.6 : 1);
  }
  // pectoral / pélvica: giro en la base, extensión y curvatura propias
  const b = B.U(F.u0, F.v ?? (F.kind === 'pectoral' ? -0.35 : -0.9));
  const flap = Math.sin(t * (F.kind === 'pectoral' ? 3.2 : 2.4) + ph) * 0.35;
  const ext = 1 - (P.fold ?? 0) * 0.6 - (F.fold ?? 0) * 0.5;
  const a = (F.kind === 'pectoral' ? 2.6 : 2.2) + flap;
  const len = F.h * L * ext;
  const w = len * (F.shape === 'fan' ? 0.75 : 0.42);
  const d = {x: Math.cos(a), y: Math.sin(a)};
  const s = {x: -d.y, y: d.x};
  const curl = Math.sin(t * 3.2 + ph + 0.8) * 0.2;
  const tipP = {x: b.x + d.x * len + s.x * w * curl, y: b.y + d.y * len + s.y * w * curl};
  return `M${f1(b.x)} ${f1(b.y)}C${f1(b.x + d.x * len * 0.3 + s.x * w)} ${f1(b.y + d.y * len * 0.3 + s.y * w)} ${f1(tipP.x + s.x * w * 0.6)} ${f1(tipP.y + s.y * w * 0.6)} ${f1(tipP.x)} ${f1(tipP.y)}C${f1(tipP.x - s.x * w * 0.3)} ${f1(tipP.y - s.y * w * 0.3)} ${f1(b.x + d.x * len * 0.5 - s.x * w * 0.25)} ${f1(b.y + d.y * len * 0.5 - s.y * w * 0.25)} ${f1(b.x)} ${f1(b.y)}Z`;
}

export const Fish: React.FC<{spec: FishSpec; pose: FishPose; uid: string; detail?: (B: Body, P: FishPose) => React.ReactNode; under?: (B: Body, P: FishPose) => React.ReactNode}> = ({spec: S, pose: P, uid, detail, under}) => {
  const B = fishBody(S, P);
  const top: V[] = [];
  const bot: V[] = [];
  for (let i = 0; i <= N; i++) {
    top.push(B.U(i / N, 1));
    bot.push(B.U(i / N, -1));
  }
  // mandíbula inferior que gira hacia abajo
  const jaw = clamp(P.jaw ?? 0) * (S.mouth?.jaw ?? 0.5);
  const mu = S.mouth?.u ?? 0.08;
  const piv = B.U(mu, S.mouth?.v ?? -0.2);
  const rot = (q: V) => {
    const dx = q.x - piv.x;
    const dy = q.y - piv.y;
    return {x: piv.x + dx * Math.cos(jaw) - dy * Math.sin(jaw), y: piv.y + dx * Math.sin(jaw) + dy * Math.cos(jaw)};
  };
  const botJ = bot.map((q, i) => (i / N < mu ? rot(q) : q));
  const outline = smoothPath([...top, ...[...botJ].reverse()], true);
  const C = S.colors;
  const tone = clamp(P.tone ?? 0);
  const dk = (c: string) => mixColor(c, '#02040a', tone * 0.75);
  const id = `fish-${uid}`;
  const fins = S.fins;
  const back = fins.filter((f) => f.kind === 'pectoral' || f.kind === 'pelvic').map((f) => ({...f, phase: (f.phase ?? 0) + 1.7}));
  const eye = B.U(S.eye.u, S.eye.v);
  const er = S.eye.r * B.L;
  const look = P.look ?? {x: 1, y: 0};
  const ll = Math.hypot(look.x, look.y) || 1;
  const tr = `translate(${f1(P.x)} ${f1(P.y)}) rotate(${f1(((P.angle ?? 0) * 180) / Math.PI)}) scale(${f1((P.facing ?? 1) * P.scale * 1000) / 1000} ${f1(P.scale * 1000) / 1000})`;
  return (
    <g transform={tr}>
      <defs>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dk(C.back)} />
          <stop offset="0.5" stopColor={dk(C.mid ?? mixColor(C.back, C.belly, 0.5))} />
          <stop offset="1" stopColor={dk(C.belly)} />
        </linearGradient>
        <clipPath id={`${id}-c`}><path d={outline} /></clipPath>
      </defs>
      {/* aletas del lado lejano (más oscuras) */}
      {back.map((f, i) => <path key={`bk${i}`} d={finPath(S, B, f, P)} fill={dk(mixColor(f.color ?? C.fin, '#000', 0.3))} opacity={(f.op ?? 0.85) * 0.8} />)}
      {fins.filter((f) => f.kind === 'caudal' || f.kind === 'dorsal' || f.kind === 'anal' || f.kind === 'adipose').map((f, i) => (
        <path key={`f${i}`} d={finPath(S, B, f, P)} fill={dk(f.color ?? C.fin)} stroke={dk(C.line)} strokeWidth={1.2} opacity={f.op ?? 0.9} />
      ))}
      {under?.(B, P)}
      <path d={outline} fill={`url(#${id}-b)`} stroke={dk(C.line)} strokeWidth={1.6} opacity={S.bodyOp ?? 1} />
      <g clipPath={`url(#${id}-c)`}>
        {S.lateral !== false && <path d={smoothPath(Array.from({length: 12}, (_, i) => B.U(0.12 + i * 0.07, 0.1)))} stroke={dk(mixColor(C.back, '#ffffff', 0.35))} strokeWidth={1.4} fill="none" opacity={0.55} />}
        <path d={smoothPath(Array.from({length: 12}, (_, i) => B.U(0.05 + i * 0.075, 0.62)))} stroke="#ffffff" strokeWidth={B.L * 0.02} fill="none" opacity={0.12 * (1 - tone) + (P.rim ?? 0) * 0.3} strokeLinecap="round" />
        <path d={smoothPath(Array.from({length: 12}, (_, i) => B.U(0.05 + i * 0.075, -0.85)))} stroke="#000" strokeWidth={B.L * 0.03} fill="none" opacity={0.15} strokeLinecap="round" />
      </g>
      {/* opérculo */}
      <path d={smoothPath([B.U(0.2, 0.55), B.U(0.235, 0), B.U(0.21, -0.6)])} stroke={dk(C.line)} strokeWidth={1.5} fill="none" opacity={0.6} />
      {S.mouth && <path d={`M${f1(B.U(0.0, -0.15).x)} ${f1(B.U(0.0, -0.15).y)}L${f1(piv.x)} ${f1(piv.y)}`} stroke={dk(S.mouth.lip ?? C.line)} strokeWidth={1.6} />}
      {/* ojo con mirada */}
      <circle cx={f1(eye.x)} cy={f1(eye.y)} r={f1(er)} fill={S.eye.ring ?? '#d8d4c0'} stroke={dk(C.line)} strokeWidth={1} />
      <circle cx={f1(eye.x + (look.x / ll) * er * 0.25)} cy={f1(eye.y + (look.y / ll) * er * 0.25)} r={f1(er * 0.68)} fill={S.eye.iris ?? '#3a3020'} />
      <circle cx={f1(eye.x + (look.x / ll) * er * 0.3)} cy={f1(eye.y + (look.y / ll) * er * 0.3)} r={f1(er * 0.42)} fill="#05070a" />
      <circle cx={f1(eye.x - er * 0.25)} cy={f1(eye.y - er * 0.3)} r={f1(er * 0.18)} fill="#ffffff" opacity={0.85} />
      {/* fotóforos */}
      {S.photophores?.map((q, i) => {
        const p = B.U(q.u, q.v);
        return <circle key={i} cx={f1(p.x)} cy={f1(p.y)} r={f1(q.r * B.L)} fill="#bff8ff" stroke="#1a3a4a" strokeWidth={0.6} opacity={0.5 + 0.5 * (P.glow ?? 0)} />;
      })}
      {/* aletas del lado cercano */}
      {fins.filter((f) => f.kind === 'pectoral' || f.kind === 'pelvic').map((f, i) => <path key={`p${i}`} d={finPath(S, B, f, P)} fill={dk(f.color ?? C.fin)} stroke={dk(C.line)} strokeWidth={1.2} opacity={f.op ?? 0.92} />)}
      {detail?.(B, P)}
    </g>
  );
};
/** Puntos de fotóforos en coordenadas del mundo (para los halos de la capa luminosa). */
export function fishWorld(S: FishSpec, P: FishPose, u: number, v: number): V {
  const B = fishBody(S, P);
  const p = B.U(u, v);
  const x = p.x * (P.facing ?? 1) * P.scale;
  const y = p.y * P.scale;
  const c = Math.cos(P.angle ?? 0);
  const s = Math.sin(P.angle ?? 0);
  return {x: P.x + x * c - y * s, y: P.y + x * s + y * c};
}
