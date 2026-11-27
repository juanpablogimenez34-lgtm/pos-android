// DEPREDADOR: pez óseo de fondo, robusto y genérico (diseño original), vista lateral.
// Cuerpo articulado (7 vértebras con onda), aletas dorsal, anal, pectoral y caudal que baten, boca que
// se abre (ataque o "tos"), opérculo que se dilata al bombear agua por las branquias y hebras de
// mucosidad que salen por la abertura branquial cuando queda impregnado.
import React from 'react';
import {clamp, lerp} from '../../../engine/math';
import {closedSpline} from '../../../lifecycle/stages';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export type FishPose = {x: number; y: number; scale?: number; dir?: 1 | -1; angle?: number; t: number; beat?: number; mouth?: number; gill?: number; slimed?: number; shake?: number; dead?: boolean};

/** Punto de la boca en coordenadas de mundo. */
export const predMouth = (p: FishPose) => {
  const s = (p.scale ?? 1) * (p.dir ?? 1);
  const a = p.angle ?? 0;
  return {x: p.x + Math.cos(a) * 172 * s - Math.sin(a) * 20 * (p.scale ?? 1), y: p.y + Math.sin(a) * 172 * s + Math.cos(a) * 20 * (p.scale ?? 1)};
};

export const Predator: React.FC<{p: FishPose; uid: string}> = ({p, uid}) => {
  const s = p.scale ?? 1;
  const beat = p.dead ? 0 : p.beat ?? 1;
  const ph = p.t * (4 + 4 * beat);
  const shake = (p.shake ?? 0) * Math.sin(p.t * 22) * 0.12;
  // espina: x de -170 (cola) a 150 (hocico)
  const sp = Array.from({length: 8}, (_, i) => {
    const u = i / 7; // 0 hocico … 1 cola
    const x = lerp(150, -170, u);
    const y = Math.sin(ph - u * 3) * 16 * beat * Math.pow(u, 1.6) + shake * 60 * (1 - u);
    return {x, y};
  });
  const H = (u: number) => (u < 0.25 ? lerp(34, 62, u / 0.25) : u < 0.7 ? lerp(62, 44, (u - 0.25) / 0.45) : lerp(44, 14, (u - 0.7) / 0.3));
  const top = sp.map((q, i) => ({x: q.x, y: q.y - H(i / 7)}));
  const bot = sp.map((q, i) => ({x: q.x, y: q.y + H(i / 7) * 0.9}));
  const mouth = clamp(p.mouth ?? 0);
  const nose = {x: 172, y: sp[0].y - 4 - mouth * 6};
  const jaw = {x: 166 - mouth * 20, y: sp[0].y + 18 + mouth * 34};
  const body = closedSpline([nose, ...top, {x: sp[7].x - 8, y: sp[7].y}, ...bot.reverse(), jaw], 1);
  const tail = sp[7];
  const tb = Math.sin(ph - 3) * 22 * beat;
  const gill = clamp(p.gill ?? 0);
  const slimed = clamp(p.slimed ?? 0);
  const dir = p.dir ?? 1;
  return (
    <g transform={`translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(((p.angle ?? 0) * 180) / Math.PI)}) scale(${f1(s * dir)} ${f1(s)})`}>
      <defs>
        <linearGradient id={`pf-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.dead ? '#6a6a60' : '#2a3a34'} />
          <stop offset="0.45" stopColor={p.dead ? '#8a8a7c' : '#4a5a4c'} />
          <stop offset="0.75" stopColor={p.dead ? '#b0aa98' : '#8a8a72'} />
          <stop offset="1" stopColor={p.dead ? '#d8d2c0' : '#c8c2a4'} />
        </linearGradient>
      </defs>
      {/* aleta caudal */}
      <path d={`M${f1(tail.x + 6)},${f1(tail.y)} L${f1(tail.x - 62)},${f1(tail.y - 54 + tb)} Q${f1(tail.x - 44)},${f1(tail.y + tb * 0.6)} ${f1(tail.x - 62)},${f1(tail.y + 54 + tb)}Z`} fill="#33443c" stroke="#18221c" strokeWidth={2} />
      {/* dorsal y anal */}
      <path d={`M60,${f1(top[2].y + 4)} L40,${f1(top[2].y - 52 + Math.sin(ph) * 3)} L-10,${f1(top[3].y - 60 + Math.sin(ph + 1) * 4)} L-90,${f1(top[5].y - 30)} L-110,${f1(top[5].y + 4)}Z`} fill="#33443c" opacity={0.92} />
      <path d={`M-30,${f1(bot[4].y - 4)} L-60,${f1(bot[4].y + 36)} L-120,${f1(bot[5].y + 26)} L-128,${f1(bot[5].y - 4)}Z`} fill="#3a4a40" opacity={0.92} />
      <path d={body} fill={`url(#pf-${uid})`} stroke="#141c18" strokeWidth={2.4} />
      {/* manchas y escamas sugeridas */}
      {Array.from({length: 9}, (_, i) => <ellipse key={i} cx={100 - i * 28} cy={sp[Math.min(7, Math.round(i * 0.8))].y - 14 + (i % 2) * 14} rx={9} ry={6} fill="#22302a" opacity={0.35} />)}
      <path d={`M140,${f1(sp[0].y - 30)} Q40,${f1(sp[2].y - 46)} -130,${f1(sp[6].y - 14)}`} stroke="#c8d8c0" strokeWidth={3} fill="none" opacity={0.22} />
      {/* línea lateral */}
      <path d={sp.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y - 6)}`).join(' ')} stroke="#1a2420" strokeWidth={1.6} fill="none" opacity={0.5} />
      {/* opérculo (se dilata al bombear) */}
      <path d={`M${f1(96 - gill * 10)},${f1(sp[1].y - 40)} Q${f1(70 - gill * 22)},${f1(sp[1].y)} ${f1(96 - gill * 10)},${f1(sp[1].y + 44)}`} stroke="#141c18" strokeWidth={3} fill="none" />
      {gill > 0.05 && <path d={`M${f1(94 - gill * 10)},${f1(sp[1].y - 34)} Q${f1(72 - gill * 22)},${f1(sp[1].y)} ${f1(94 - gill * 10)},${f1(sp[1].y + 38)} Q${f1(84)},${f1(sp[1].y)} ${f1(94 - gill * 10)},${f1(sp[1].y - 34)}Z`} fill="#a83a3a" opacity={0.7 * gill} />}
      {/* pectoral */}
      <path d={`M70,${f1(sp[2].y + 10)} q-36,${f1(14 + Math.sin(ph * 1.3) * 10)} -58,${f1(30 + Math.sin(ph * 1.3) * 8)} q26,-4 58,-26Z`} fill="#4a5a4c" stroke="#18221c" strokeWidth={1.4} opacity={0.95} />
      {/* boca y dientes */}
      <path d={`M${f1(nose.x)},${f1(nose.y)} Q${f1(150)},${f1(sp[0].y + 8 + mouth * 10)} ${f1(jaw.x)},${f1(jaw.y)}`} stroke="#0e1210" strokeWidth={3} fill={mouth > 0.05 ? '#1a0c0c' : 'none'} />
      {mouth > 0.1 && Array.from({length: 5}, (_, i) => <path key={i} d={`M${f1(lerp(nose.x - 4, 150, i / 4))},${f1(lerp(nose.y + 2, sp[0].y + 6, i / 4))} l-2,6`} stroke="#f0ead0" strokeWidth={2} opacity={mouth} />)}
      {/* ojo */}
      <circle cx={128} cy={sp[0].y - 18} r={11} fill={p.dead ? '#cfd4d0' : '#d8c070'} stroke="#0e1210" strokeWidth={2} />
      <circle cx={130} cy={sp[0].y - 18} r={6} fill={p.dead ? '#9aa4a2' : '#060808'} />
      <circle cx={126} cy={sp[0].y - 22} r={2.4} fill="#ffffff" opacity={0.8} />
      {/* mucosidad pegada a boca y branquias */}
      {slimed > 0.02 && (
        <g opacity={slimed}>
          {Array.from({length: 7}, (_, i) => {
            const y0 = sp[1].y - 30 + i * 10;
            const L = 30 + 40 * slimed + Math.sin(p.t * 3 + i) * 10;
            return <path key={`g${i}`} d={`M${f1(88 - gill * 10)},${f1(y0)} q${f1(-L * 0.5)},${f1(8 + Math.sin(p.t * 2 + i) * 8)} ${f1(-L)},${f1(16 + i * 2)}`} stroke="#eaf8f2" strokeWidth={2.2} fill="none" opacity={0.6} />;
          })}
          <ellipse cx={nose.x - 4} cy={(nose.y + jaw.y) / 2 + 6} rx={26 + 14 * slimed} ry={14 + 8 * slimed} fill="#dff2ea" opacity={0.3} />
          {Array.from({length: 5}, (_, i) => <path key={`m${i}`} d={`M${f1(nose.x - 6)},${f1(jaw.y - 6 + i * 3)} q${f1(18 + i * 4)},${f1(10 + i * 6)} ${f1(10 + i * 10)},${f1(30 + i * 8 + Math.sin(p.t * 2 + i) * 6)}`} stroke="#eaf8f2" strokeWidth={1.8} fill="none" opacity={0.55} />)}
        </g>
      )}
    </g>
  );
};
