// PRESA: pez pequeño de río (tipo carácido, diseño original). Estados: nadar, ocultarse (quieto,
// aletas en abanico, temblor leve), aturdido (contracción muscular involuntaria: el cuerpo se
// arquea y vibra rígido, aletas extendidas, deriva) y capturado (es arrastrado hacia la boca).
import React from 'react';
import {clamp, lerp} from '../../../engine/math';
import {closedSpline} from '../../../lifecycle/stages';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export type PreyPose = {x: number; y: number; t: number; s?: number; dir?: 1 | -1; angle?: number; swim?: number; stun?: number; hide?: number; opacity?: number; hue?: 'silver' | 'red'};

export const Prey: React.FC<{p: PreyPose; uid: string}> = ({p, uid}) => {
  const s = p.s ?? 1;
  const stun = clamp(p.stun ?? 0);
  const swim = clamp(p.swim ?? 1) * (1 - stun);
  const ph = p.t * 14;
  const quiver = stun * Math.sin(p.t * 60) * 1.6;
  const tailBend = Math.sin(ph) * 9 * swim + stun * 10 + (p.hide ?? 0) * Math.sin(p.t * 3) * 2;
  // espina corta (hocico x=34 → cola x=-30)
  const sp = [0, 1, 2, 3, 4].map((i) => {
    const u = i / 4;
    return {x: lerp(34, -28, u), y: (tailBend * u * u) + stun * -8 * Math.sin(u * Math.PI) + quiver * u};
  });
  const H = (u: number) => (u < 0.3 ? lerp(9, 16, u / 0.3) : lerp(16, 5, (u - 0.3) / 0.7));
  const top = sp.map((q, i) => ({x: q.x, y: q.y - H(i / 4)}));
  const bot = sp.map((q, i) => ({x: q.x, y: q.y + H(i / 4) * 0.85}));
  const body = closedSpline([{x: 40, y: sp[0].y + 1}, ...top, {x: -30, y: sp[4].y}, ...[...bot].reverse()], 1);
  const tl = sp[4];
  const flare = 1 + stun * 0.5;
  const red = p.hue === 'red';
  return (
    <g transform={`translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(((p.angle ?? 0) + stun * 0.4 * Math.sin(p.t * 2)) * 57.3)}) scale(${f1(s * (p.dir ?? 1))} ${f1(s)})`} opacity={p.opacity ?? 1}>
      <defs>
        <linearGradient id={`pg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a6a5a" />
          <stop offset="0.5" stopColor={red ? '#c86a4a' : '#b8c8b8'} />
          <stop offset="1" stopColor="#e8eee0" />
        </linearGradient>
      </defs>
      <path d={`M${f1(tl.x + 2)},${f1(tl.y)} L${f1(tl.x - 16)},${f1(tl.y - 12 * flare + tailBend * 0.3)} L${f1(tl.x - 10)},${f1(tl.y)} L${f1(tl.x - 16)},${f1(tl.y + 12 * flare + tailBend * 0.3)}Z`} fill={red ? '#d85a3a' : '#9aaea0'} opacity={0.85} />
      <path d={`M2,${f1(sp[2].y - 15)} l-8,${f1(-10 * flare)} l-8,${f1(10 * flare)}Z`} fill="#8a9a8a" opacity={0.8} />
      <path d={`M-4,${f1(sp[2].y + 13)} l-6,${f1(8 * flare)} l-10,${f1(-6 * flare)}Z`} fill="#8a9a8a" opacity={0.8} />
      <path d={body} fill={`url(#pg-${uid})`} stroke="#1a2a22" strokeWidth={1.2} />
      <path d={`M30,${f1(sp[0].y - 2)} Q0,${f1(sp[2].y - 4)} -22,${f1(sp[4].y - 1)}`} stroke={red ? '#ff8a60' : '#9ae8e0'} strokeWidth={2.4} fill="none" opacity={0.7} />
      <path d={`M14,${f1(sp[1].y - 10)} q-2,8 0,16`} stroke="#2a3a32" strokeWidth={1.2} fill="none" />
      <circle cx={26} cy={sp[0].y - 3} r={3.6} fill="#e8e0b0" />
      <circle cx={27} cy={sp[0].y - 3} r={2.1} fill="#050505" />
    </g>
  );
};
