// PERSONAJE 01 — DELFÍN TORNILLO (Stenella longirostris), frecuente alrededor de Guam y las Marianas.
// Técnica del motor de cetáceos (orca/narval): columna de 30 puntos con onda VERTICAL (propulsión con la cola
// horizontal), perfil con hocico largo y melón, aleta dorsal falcada, pectorales independientes, caudal vista de
// canto con giro según el batido, espiráculo y coloración en tres tonos (capa oscura, flanco gris, vientre claro).
import React from 'react';
import {clamp, lerp, mixColor, smoothPath} from '../../../engine/math';

type V = {x: number; y: number};
const f1 = (n: number) => Math.round(n * 10) / 10;
export type DolphinPose = {x: number; y: number; angle: number; scale: number; facing: 1 | -1; t: number; phase: number; amp: number; flipN?: number; flipF?: number; blow?: number; tone?: number; look?: V};
const L = 600;
const N = 30;
const TOP: [number, number][] = [[0, 0.012], [0.07, 0.022], [0.1, 0.05], [0.14, 0.085], [0.25, 0.105], [0.4, 0.105], [0.55, 0.085], [0.7, 0.055], [0.85, 0.028], [0.95, 0.016], [1, 0.012]];
const BOT: [number, number][] = [[0, 0.01], [0.07, 0.016], [0.11, 0.05], [0.2, 0.09], [0.38, 0.1], [0.55, 0.08], [0.72, 0.045], [0.86, 0.024], [0.96, 0.014], [1, 0.012]];
const pr = (tab: [number, number][], u: number) => {
  for (let i = 1; i < tab.length; i++) {
    if (u <= tab[i][0]) {
      const k = (u - tab[i - 1][0]) / (tab[i][0] - tab[i - 1][0]);
      return lerp(tab[i - 1][1], tab[i][1], k * k * (3 - 2 * k));
    }
  }
  return tab[tab.length - 1][1];
};
function spine(P: DolphinPose) {
  const pts: V[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const env = Math.pow(Math.max(0, u - 0.3) / 0.7, 1.6);
    pts.push({x: -u * L, y: (Math.sin(P.phase - u * 2.8) * env * 0.08 * P.amp - Math.sin(P.phase + 0.5) * 0.006 * P.amp * (1 - u)) * L});
  }
  const nrm = pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(N, i + 1)];
    const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const n = {x: (b.y - a.y) / l, y: -(b.x - a.x) / l};
    return n.y > 0 ? {x: -n.x, y: -n.y} : n;
  });
  const U = (u: number, v: number) => {
    const f = clamp(u) * N;
    const i = Math.min(N - 1, Math.floor(f));
    const k = f - i;
    const p = {x: lerp(pts[i].x, pts[i + 1].x, k), y: lerp(pts[i].y, pts[i + 1].y, k)};
    const n = {x: lerp(nrm[i].x, nrm[i + 1].x, k), y: lerp(nrm[i].y, nrm[i + 1].y, k)};
    const h = (v >= 0 ? v * pr(TOP, u) : v * pr(BOT, u)) * L;
    return {x: p.x + n.x * h, y: p.y + n.y * h};
  };
  return {pts, U};
}
export const Dolphin: React.FC<{p: DolphinPose; uid: string}> = ({p, uid}) => {
  const S = spine(p);
  const top: V[] = [];
  const bot: V[] = [];
  for (let i = 0; i <= N; i++) {
    top.push(S.U(i / N, 1));
    bot.push(S.U(i / N, -1));
  }
  const body = smoothPath([...top, ...[...bot].reverse()], true);
  const tone = clamp(p.tone ?? 0);
  const dk = (c: string) => mixColor(c, '#04101c', tone * 0.6);
  const id = `dol-${uid}`;
  // dorsal falcada
  const d0 = S.U(0.42, 0.98);
  const d1 = S.U(0.56, 0.95);
  const tipD = {x: d1.x - 0.03 * L, y: d0.y - 0.12 * L};
  const dorsal = `M${f1(d0.x)} ${f1(d0.y)}C${f1(d0.x - 0.02 * L)} ${f1(d0.y - 0.08 * L)} ${f1(tipD.x + 0.02 * L)} ${f1(tipD.y)} ${f1(tipD.x)} ${f1(tipD.y)}C${f1(tipD.x + 0.01 * L)} ${f1(tipD.y + 0.05 * L)} ${f1(d1.x + 0.01 * L)} ${f1(d1.y - 0.02 * L)} ${f1(d1.x)} ${f1(d1.y)}Z`;
  // pectorales independientes
  const pec = (far: boolean) => {
    const b = S.U(far ? 0.21 : 0.2, far ? -0.4 : -0.55);
    const a = 2.45 + (far ? p.flipF ?? 0 : p.flipN ?? 0) + Math.sin(p.t * (far ? 1.7 : 1.4) + (far ? 1.6 : 0)) * 0.12;
    const l = 0.13 * L;
    const d = {x: Math.cos(a), y: Math.sin(a)};
    const s = {x: -d.y, y: d.x};
    const tip = {x: b.x + d.x * l, y: b.y + d.y * l};
    return `M${f1(b.x - s.x * 9)} ${f1(b.y - s.y * 9)}Q${f1(b.x + d.x * l * 0.5 - s.x * 18)} ${f1(b.y + d.y * l * 0.5 - s.y * 18)} ${f1(tip.x)} ${f1(tip.y)}Q${f1(b.x + d.x * l * 0.55 + s.x * 6)} ${f1(b.y + d.y * l * 0.55 + s.y * 6)} ${f1(b.x + s.x * 9)} ${f1(b.y + s.y * 9)}Z`;
  };
  // caudal horizontal vista de canto, inclinada por el batido vertical
  const e = S.pts[N];
  const q = S.pts[N - 2];
  const fa = Math.atan2(e.y - q.y, e.x - q.x) + Math.sin(p.phase - 2.8) * 0.4 * p.amp;
  const fd = {x: Math.cos(fa), y: Math.sin(fa)};
  const fs = {x: -fd.y, y: fd.x};
  const ch = 0.09 * L;
  const sp = 0.05 * L;
  const lobe = (sg: number) => `M${f1(e.x - fd.x * 6)} ${f1(e.y - fd.y * 6)}Q${f1(e.x + fd.x * ch * 0.3 + fs.x * sp * sg)} ${f1(e.y + fd.y * ch * 0.3 + fs.y * sp * sg)} ${f1(e.x + fd.x * ch + fs.x * sp * 1.2 * sg)} ${f1(e.y + fd.y * ch + fs.y * sp * 1.2 * sg)}Q${f1(e.x + fd.x * ch * 0.75)} ${f1(e.y + fd.y * ch * 0.75)} ${f1(e.x + fd.x * ch * 0.6)} ${f1(e.y + fd.y * ch * 0.6)}Z`;
  const eye = S.U(0.12, 0.05);
  const look = p.look ?? {x: 1, y: 0};
  const blowP = S.U(0.15, 1);
  const tr = `translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1((p.angle * 180) / Math.PI)}) scale(${f1(p.facing * p.scale * 1000) / 1000} ${f1(p.scale * 1000) / 1000})`;
  return (
    <g transform={tr}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dk('#3a4654')} />
          <stop offset="0.42" stopColor={dk('#6a7a88')} />
          <stop offset="0.62" stopColor={dk('#a8b4bc')} />
          <stop offset="1" stopColor={dk('#eef2f2')} />
        </linearGradient>
        <clipPath id={`${id}-c`}><path d={body} /></clipPath>
      </defs>
      <path d={pec(true)} fill={dk('#3a4654')} />
      <path d={lobe(1)} fill={dk('#3a4654')} stroke="#141c24" strokeWidth={1.5} />
      <path d={lobe(-1)} fill={dk('#2a343e')} stroke="#141c24" strokeWidth={1.5} />
      <path d={dorsal} fill={dk('#3a4654')} stroke="#141c24" strokeWidth={1.5} />
      <path d={body} fill={`url(#${id}-g)`} stroke="#141c24" strokeWidth={2} />
      <g clipPath={`url(#${id}-c)`}>
        {/* capa dorsal oscura (cape) y banda del ojo a la aleta */}
        <path d={smoothPath([S.U(0.1, 0.55), S.U(0.3, 0.35), S.U(0.55, 0.45), S.U(0.8, 0.9), S.U(0.8, 1.3), S.U(0.1, 1.3)], true)} fill={dk('#2a343e')} opacity={0.6} />
        <path d={smoothPath([S.U(0.12, 0.0), S.U(0.17, -0.25), S.U(0.21, -0.45)])} stroke={dk('#3a4654')} strokeWidth={5} fill="none" opacity={0.6} />
        <path d={smoothPath(Array.from({length: 12}, (_, i) => S.U(0.1 + i * 0.065, 0.62)))} stroke="#ffffff" strokeWidth={10} fill="none" opacity={0.18 * (1 - tone)} strokeLinecap="round" />
      </g>
      {/* hocico, comisura y melón */}
      <path d={smoothPath([S.U(0.0, -0.4), S.U(0.06, -0.55), S.U(0.1, -0.2)])} stroke="#141c24" strokeWidth={1.8} fill="none" />
      <path d={smoothPath([S.U(0.075, 1.0), S.U(0.1, 0.9), S.U(0.13, 0.98)])} stroke="#2a343e" strokeWidth={1.5} fill="none" opacity={0.6} />
      <ellipse cx={f1(eye.x)} cy={f1(eye.y)} rx={5} ry={4} fill="#0a0e12" />
      <circle cx={f1(eye.x + look.x * 1.2)} cy={f1(eye.y + look.y * 1.2 - 0.5)} r={1.6} fill="#ffffff" opacity={0.8} />
      <ellipse cx={f1(blowP.x)} cy={f1(blowP.y + 1)} rx={f1(3 + (p.blow ?? 0) * 5)} ry={1.6} fill="#141c24" />
      <path d={pec(false)} fill={`url(#${id}-g)`} stroke="#141c24" strokeWidth={1.5} />
    </g>
  );
};
