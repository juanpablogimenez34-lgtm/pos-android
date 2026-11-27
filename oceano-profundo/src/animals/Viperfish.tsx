// PEZ VÍBORA (Chauliodus sloani) — rig original en SVG, vista lateral, hocico en el origen y cuerpo hacia −x
// (longitud L = 600 u). Rasgos de la especie:
//  · cuerpo largo, comprimido y oscuro con brillo metálico azulado;
//  · cabeza grande con ojo grande; mandíbula inferior larga cuyos COLMILLOS sobresalen por delante y por encima del
//    hocico con la boca cerrada (no caben dentro), y colmillos superiores que cuelgan por fuera;
//  · al atacar, el NEUROCRÁNEO SE LEVANTA y la mandíbula baja: apertura muy amplia;
//  · PRIMER RADIO DORSAL muy alargado, situado justo detrás de la cabeza, con un FOTÓFORO en la punta (señuelo);
//  · HILERAS DE FOTÓFOROS ventrales (contrailuminación) y aleta adiposa; aletas pélvica, anal y caudal pequeña.
// Movimiento: onda que crece hacia la cola, aleta caudal que bate con retraso, aletas pectorales que vibran,
// leve giro (`yaw`) para cambios de dirección.
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../utils/math';
import {closedSpline, f1, path} from '../utils/spline';

type V = {x: number; y: number};
export const VIPER_L = 600;

export type ViperPose = {
  t: number;
  phase: number; // fase de natación acumulada (rad)
  amp?: number; // amplitud de la onda 0…1.4
  jaw?: number; // 0 cerrada … 1 abierta del todo (≈ 100°)
  glow?: number; // fotóforos 0…1
  lure?: number; // balanceo del radio dorsal
  yaw?: number; // 0 de perfil … 0,5 escorzo
  tone?: number; // oscurecimiento por profundidad
  rim?: number; // luz de contorno
  gulp?: number; // vientre distendido tras tragar
};

const COL = {back: '#141a24', side: '#26323e', belly: '#3a4652', sheen: '#7a9ab4', fin: '#1e2630', photo: '#58d8ff', fang: '#e8eef0'};
// semialturas del perfil (u: 0 hocico … 1 cola)
const TOP: [number, number][] = [[0, 0.02], [0.06, 0.07], [0.14, 0.088], [0.22, 0.08], [0.4, 0.068], [0.6, 0.056], [0.8, 0.036], [0.92, 0.02], [1, 0.012]];
const BOT: [number, number][] = [[0, 0.014], [0.06, 0.055], [0.14, 0.078], [0.25, 0.076], [0.45, 0.066], [0.65, 0.052], [0.82, 0.032], [0.92, 0.018], [1, 0.012]];
const prof = (tab: [number, number][], u: number) => {
  for (let i = 1; i < tab.length; i++)
    if (u <= tab[i][0]) {
      const k = (u - tab[i - 1][0]) / (tab[i][0] - tab[i - 1][0]);
      return lerp(tab[i - 1][1], tab[i][1], k * k * (3 - 2 * k));
    }
  return tab[tab.length - 1][1];
};
const rot = (p: V, a: number, c: V = {x: 0, y: 0}): V => ({x: c.x + (p.x - c.x) * Math.cos(a) - (p.y - c.y) * Math.sin(a), y: c.y + (p.x - c.x) * Math.sin(a) + (p.y - c.y) * Math.cos(a)});

/** Columna: y(u) con la onda de natación (crece hacia la cola) y la cabeza que se levanta al abrir la boca. */
function spineY(p: ViperPose, u: number) {
  const amp = p.amp ?? 0.8;
  return Math.sin(p.phase - u * 5.2) * VIPER_L * 0.022 * amp * Math.pow(u, 1.3);
}

export function viperPoint(p: ViperPose, u: number, side = 0): V {
  const y = spineY(p, u);
  const h = side < 0 ? -prof(TOP, u) : prof(BOT, u);
  return {x: -u * VIPER_L, y: y + Math.abs(side) * h * VIPER_L};
}

export const Viperfish: React.FC<{pose: ViperPose; uid: string; x: number; y: number; scale?: number; dir?: 1 | -1; angle?: number}> = ({pose, uid, x, y, scale = 1, dir = 1, angle = 0}) => {
  const p = pose;
  const t = p.t;
  const tone = clamp(p.tone ?? 0);
  const C = (c: string) => mixColor(c, '#03060c', tone * 0.7);
  const jaw = clamp(p.jaw ?? 0);
  const glow = clamp(p.glow ?? 0.8);
  const gulp = clamp(p.gulp ?? 0);
  const L = VIPER_L;
  const yawK = 1 - 0.5 * clamp(p.yaw ?? 0);
  // cuerpo (desde el cuello u=0,1 hasta la cola); la cabeza se dibuja aparte para poder levantarla
  const us = Array.from({length: 26}, (_, i) => 0.12 + (i / 25) * 0.88);
  const belly = (u: number) => 1 + gulp * 0.45 * Math.exp(-((u - 0.3) ** 2) / 0.01);
  const top = us.map((u) => ({x: -u * L, y: spineY(p, u) - prof(TOP, u) * L}));
  const bot = us.map((u) => ({x: -u * L, y: spineY(p, u) + prof(BOT, u) * L * belly(u)}));
  const body = closedSpline([...top, ...[...bot].reverse()], 0.9);
  // cabeza: rota alrededor del cuello (levantamiento del neurocráneo al abrir la boca)
  const lift = -jaw * 0.38;
  const neck = {x: -0.13 * L, y: spineY(p, 0.13) - 14};
  const H = (q: V) => rot(q, lift, neck);
  const head = closedSpline([{x: -0.145 * L, y: -0.088 * L}, {x: -0.08 * L, y: -0.08 * L}, {x: -0.03 * L, y: -0.05 * L}, {x: 6, y: -10}, {x: 4, y: 6}, {x: -0.06 * L, y: 0.02 * L}, {x: -0.13 * L, y: 0.045 * L}].map(H), 0.85);
  const eye = H({x: -0.065 * L, y: -0.034 * L});
  // mandíbula inferior: bisagra bajo el ojo, baja al abrir (en el marco de la cabeza)
  const hinge = H({x: -0.11 * L, y: 0.03 * L});
  const ja = jaw * 1.45 + lift;
  const J = (q: V) => rot({x: hinge.x + q.x, y: hinge.y + q.y}, ja, hinge);
  const jawLen = 0.122 * L;
  const lowerJaw = closedSpline([J({x: 0, y: -6}), J({x: jawLen * 0.6, y: -3}), J({x: jawLen + 6, y: -8}), J({x: jawLen + 3, y: 6}), J({x: jawLen * 0.5, y: 17}), J({x: 0, y: 20})], 0.9);
  // colmillos inferiores: salen de la punta y suben por delante del hocico (por fuera)
  const lowFang = (k: number) => {
    const b = {x: jawLen - 2 - k * 14, y: -6};
    const len = k === 0 ? 74 : k === 1 ? 50 : 34;
    return [J(b), J({x: b.x + 6, y: b.y - len * 0.5}), J({x: b.x - 2, y: b.y - len})];
  };
  const upFang = (k: number) => {
    const b = H({x: -8 - k * 20, y: -2});
    const len = (k === 0 ? 50 : k === 1 ? 34 : 24) * (1 - jaw * 0.1);
    const a = lift;
    return [b, rot({x: b.x + 4, y: b.y + len * 0.55}, a, b), rot({x: b.x - 3, y: b.y + len}, a, b)];
  };
  const fangPath = (q: V[], w: number) => `M${f1(q[0].x - w)},${f1(q[0].y)} Q${f1(q[1].x)},${f1(q[1].y)} ${f1(q[2].x)},${f1(q[2].y)} Q${f1(q[1].x + w * 0.6)},${f1(q[1].y)} ${f1(q[0].x + w)},${f1(q[0].y)}Z`;
  // radio dorsal alargado con fotóforo en la punta
  const dBase = viperPoint(p, 0.19, -1);
  const sway = Math.sin(t * 1.3) * 0.18 * (p.lure ?? 1) + Math.sin(t * 3.1) * 0.05;
  const ray: V[] = [dBase];
  let a = -1.75 + sway;
  for (let k = 0; k < 8; k++) {
    a += 0.2 + sway * 0.06;
    const q = ray[ray.length - 1];
    ray.push({x: q.x + Math.cos(a) * 24, y: q.y + Math.sin(a) * 24});
  }
  const lureP = ray[ray.length - 1];
  // aletas
  const tail = viperPoint(p, 1);
  const tailA = Math.atan2(viperPoint(p, 1).y - viperPoint(p, 0.94).y, -0.06 * L);
  const flap = Math.sin(p.phase - 5.2 - 0.6) * 0.35 * (p.amp ?? 0.8);
  const pect = Math.sin(t * 9) * 0.25;
  const fins = {
    pelvic: viperPoint(p, 0.42, 1),
    anal: viperPoint(p, 0.8, 1),
    adipose: viperPoint(p, 0.82, -1),
    dorsal2: viperPoint(p, 0.86, -1),
    pect: viperPoint(p, 0.17, 1),
  };
  // fotóforos ventrales (dos hileras)
  const photos: V[] = [];
  for (let u = 0.12; u < 0.86; u += 0.026) {
    const b = viperPoint(p, u, 1);
    photos.push({x: b.x, y: b.y - 4});
    if (u < 0.6) photos.push({x: b.x, y: b.y - 13});
  }
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((angle * 180) / Math.PI)}) scale(${f1(scale * dir * yawK)} ${f1(scale)})`}>
      <defs>
        <linearGradient id={`vpB${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C(COL.back)} />
          <stop offset="0.45" stopColor={C(COL.side)} />
          <stop offset="0.7" stopColor={C(COL.sheen)} />
          <stop offset="1" stopColor={C(COL.belly)} />
        </linearGradient>
        <radialGradient id={`vpG${uid}`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity={1} />
          <stop offset="0.25" stopColor={COL.photo} stopOpacity={0.8} />
          <stop offset="1" stopColor={COL.photo} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* aleta caudal (bifurcada, pequeña) */}
      <g transform={`translate(${f1(tail.x)} ${f1(tail.y)}) rotate(${f1(((tailA + flap) * 180) / Math.PI)})`}>
        <path d="M4,0 Q-20,-10 -46,-28 Q-36,-6 -40,0 Q-36,6 -46,28 Q-20,10 4,0Z" fill={C(COL.fin)} stroke={C('#0a0e14')} strokeWidth={1.4} opacity={0.95} />
      </g>
      {/* aletas impares traseras */}
      <path d={`M${f1(fins.anal.x + 24)},${f1(fins.anal.y - 2)} q-20,${f1(22 + flap * 10)} -48,${f1(18 + flap * 12)} l18,-18z`} fill={C(COL.fin)} opacity={0.9} />
      <path d={`M${f1(fins.dorsal2.x + 16)},${f1(fins.dorsal2.y + 2)} q-14,-24 -36,-22 l16,20z`} fill={C(COL.fin)} opacity={0.9} />
      <ellipse cx={fins.adipose.x + 40} cy={fins.adipose.y - 4} rx={10} ry={5} fill={C(COL.fin)} opacity={0.9} />
      {/* cuerpo */}
      <path d={body} fill={`url(#vpB${uid})`} stroke={C('#06090e')} strokeWidth={1.6} />
      {/* escamas/brillo iridiscente */}
      {Array.from({length: 40}, (_, i) => {
        const u = 0.12 + (i / 40) * 0.8;
        const q = viperPoint(p, u, 0);
        return <path key={i} d={`M${f1(q.x)},${f1(q.y - 10)} q-6,10 0,20`} stroke={C('#8ab0d0')} strokeWidth={1} fill="none" opacity={0.18 + 0.12 * Math.sin(t * 2 + i)} />;
      })}
      <path d={path(us.map((u) => ({x: -u * L, y: spineY(p, u) - prof(TOP, u) * L * 0.55})))} stroke="#b8d8f0" strokeWidth={3} fill="none" opacity={0.18 * (1 - tone)} />
      {(p.rim ?? 0) > 0.01 && <path d={path(top)} stroke="#8ad0ff" strokeWidth={3} fill="none" opacity={(p.rim ?? 0) * 0.6} transform="translate(0 -2)" />}
      {/* aleta pélvica y pectoral */}
      <path d={`M${f1(fins.pelvic.x + 10)},${f1(fins.pelvic.y - 3)} q-16,18 -36,16 l14,-14z`} fill={C(COL.fin)} opacity={0.85} />
      {/* interior de la boca (oscuro) visible al abrir */}
      {jaw > 0.03 && <path d={`M${f1(hinge.x)},${f1(hinge.y)} L${f1(H({x: 2, y: 2}).x)},${f1(H({x: 2, y: 2}).y)} L${f1(J({x: jawLen, y: 0}).x)},${f1(J({x: jawLen, y: 0}).y)}Z`} fill="#05060a" opacity={0.95} />}
      {/* membrana de la garganta */}
      {jaw > 0.03 && <path d={`M${f1(hinge.x)},${f1(hinge.y + 6)} Q${f1(hinge.x - 10)},${f1(hinge.y + 30 * jaw)} ${f1(J({x: jawLen * 0.5, y: 12}).x)},${f1(J({x: jawLen * 0.5, y: 12}).y)}`} stroke={C('#3a2a34')} strokeWidth={6} fill="none" opacity={0.7} />}
      {/* mandíbula inferior y sus colmillos */}
      <path d={lowerJaw} fill={C('#2a343e')} stroke={C('#06090e')} strokeWidth={1.4} />
      {[0, 1, 2].map((k) => <path key={`lf${k}`} d={fangPath(lowFang(k), k === 0 ? 4.6 : 3.2)} fill={COL.fang} stroke="#8a9aa4" strokeWidth={0.6} opacity={0.95} />)}
      {/* cabeza */}
      <path d={head} fill={`url(#vpB${uid})`} stroke={C('#06090e')} strokeWidth={1.6} />
      {/* opérculo */}
      <path d={`M${f1(H({x: -0.13 * L, y: -0.05 * L}).x)},${f1(H({x: -0.13 * L, y: -0.05 * L}).y)} Q${f1(H({x: -0.15 * L, y: 0}).x)},${f1(H({x: -0.15 * L, y: 0}).y)} ${f1(H({x: -0.13 * L, y: 0.035 * L}).x)},${f1(H({x: -0.13 * L, y: 0.035 * L}).y)}`} stroke={C('#0a0e14')} strokeWidth={2} fill="none" />
      {/* aleta pectoral (vibra) */}
      <path d={`M${f1(fins.pect.x)},${f1(fins.pect.y - 8)} q-20,${f1(8 + pect * 20)} -34,${f1(14 + pect * 26)} l10,-16z`} fill={C('#2e3a46')} opacity={0.9} />
      {/* colmillos superiores (por fuera de la mandíbula) */}
      {[0, 1, 2].map((k) => <path key={`uf${k}`} d={fangPath(upFang(k), k === 0 ? 4 : 2.8)} fill={COL.fang} stroke="#8a9aa4" strokeWidth={0.6} />)}
      {/* ojo grande */}
      <circle cx={eye.x} cy={eye.y} r={17} fill="#0a0c12" stroke={C('#9ab0c0')} strokeWidth={2.8} />
      <circle cx={eye.x + 2} cy={eye.y} r={9} fill="#000" />
      <circle cx={eye.x - 3} cy={eye.y - 4} r={3} fill="#e8f4ff" opacity={0.8} />
      {/* fotóforo bajo el ojo */}
      <ellipse cx={eye.x + 2} cy={eye.y + 18} rx={5} ry={3} fill={COL.photo} opacity={0.6 * glow} />
      {/* radio dorsal y señuelo */}
      <path d={path(ray)} stroke={C('#4a5a6a')} strokeWidth={2.2} fill="none" />
      <circle cx={lureP.x} cy={lureP.y} r={18 * glow + 4} fill={`url(#vpG${uid})`} style={{mixBlendMode: 'screen'}} />
      <circle cx={lureP.x} cy={lureP.y} r={3.5} fill="#e8ffff" />
      {/* fotóforos ventrales */}
      <g style={{mixBlendMode: 'screen'}}>
        {photos.map((q, i) => (
          <g key={i} opacity={glow * (0.75 + 0.25 * Math.sin(t * 1.7 + hash1(i) * 6))}>
            <circle cx={q.x} cy={q.y} r={7} fill={`url(#vpG${uid})`} />
            <circle cx={q.x} cy={q.y} r={1.8} fill="#dfffff" />
          </g>
        ))}
      </g>
    </g>
  );
};

/** Posición local de la boca (para encadenar la captura). */
export const VIPER_MOUTH: V = {x: 10, y: 4};
