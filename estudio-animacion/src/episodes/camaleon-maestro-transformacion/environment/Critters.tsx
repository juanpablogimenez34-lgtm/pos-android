// INSECTOS Y AVE con movimiento propio (deterministas): mosca con alas batiendo, grillo con patas y antenas,
// mariposa, y un ave del bosque (cúa azul estilizada) que cruza entre los árboles.
import React from 'react';
import {clamp, hash1, lerp, noise1} from '../../../engine/math';

type V = {x: number; y: number};
const f1 = (n: number) => Math.round(n * 10) / 10;

/** Trayectoria errática de vuelo alrededor de un punto (o hacia él). */
export function flyPath(t: number, c: V, r: number, seed = 1): V {
  return {x: c.x + noise1(t * 0.9, seed) * r + Math.sin(t * 1.7 + seed) * r * 0.3, y: c.y + noise1(t * 0.8, seed + 7) * r * 0.7 + Math.cos(t * 2.3 + seed) * r * 0.2};
}

export const Fly: React.FC<{x: number; y: number; t: number; s?: number; ang?: number; still?: boolean}> = ({x, y, t, s = 1, ang = 0, still}) => {
  const flap = still ? 0.2 : Math.sin(t * 90);
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((ang * 180) / Math.PI)}) scale(${s})`}>
      {/* alas translúcidas (desenfoque de movimiento con dos posiciones) */}
      {[flap, -flap * 0.6].map((fl, i) => (
        <ellipse key={i} cx={-2} cy={-6 - fl * 3} rx={9} ry={4} transform={`rotate(${-20 + fl * 25} -2 -6)`} fill="#e6f2ff" opacity={still ? 0.7 : 0.35} stroke="#9ab0c8" strokeWidth={0.6} />
      ))}
      <ellipse cx={0} cy={0} rx={8} ry={4.5} fill="#2a3a44" />
      <ellipse cx={-5} cy={0} rx={5} ry={3.6} fill="#3e5a4a" />
      <circle cx={7} cy={-0.5} r={3.4} fill="#7a2a1c" />
      <path d="M-2 3l-3 5M1 3l0 6M4 3l3 5" stroke="#1a1a1a" strokeWidth={0.9} />
    </g>
  );
};

export const Cricket: React.FC<{x: number; y: number; t: number; s?: number; facing?: 1 | -1; walk?: number; caught?: boolean}> = ({x, y, t, s = 1, facing = 1, walk = 0, caught}) => {
  const ph = t * 8 * walk;
  const leg = (bx: number, a: number, l1: number, l2: number, off: number) => {
    const sw = Math.sin(ph + off) * 0.35 * walk;
    const j = {x: bx + Math.cos(a + sw) * l1, y: Math.sin(a + sw) * l1};
    const e = {x: j.x + Math.cos(a + 1.2 + sw) * l2, y: j.y + Math.sin(a + 1.2 + sw) * l2};
    return `M${f1(bx)} 0L${f1(j.x)} ${f1(j.y)}L${f1(e.x)} ${f1(e.y)}`;
  };
  const ant = Math.sin(t * 3) * 0.2 + noise1(t, 3) * 0.15;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${facing * s} ${s})`}>
      <path d={[leg(-6, -2.2, 16, 18, 0), leg(2, 2.1, 8, 9, 1.5), leg(8, 1.4, 7, 8, 3)].join('')} stroke="#4a3418" strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M-18 -2C-14 -10 6 -11 14 -6C18 -3 18 2 12 4C2 6 -14 5 -18 -2Z" fill="#7a5a2a" stroke="#3a2610" strokeWidth={1.2} />
      <path d="M-16 -4C-8 -9 4 -9 12 -5" stroke="#a88648" strokeWidth={1.6} fill="none" />
      <circle cx={13} cy={-3} r={4.6} fill="#5a3e1c" stroke="#3a2610" strokeWidth={1} />
      <circle cx={15} cy={-4} r={1.2} fill="#111" />
      <path d={`M16 -6Q${f1(30 + Math.cos(ant) * 6)} ${f1(-26 + Math.sin(ant) * 6)} ${f1(42 + ant * 10)} ${f1(-20)}M15 -6Q${f1(26)} ${f1(-30)} ${f1(30 + ant * 12)} ${f1(-34)}`} stroke="#3a2610" strokeWidth={1} fill="none" />
      {caught ? null : <path d={[leg(-8, 1.9, 7, 8, 2), leg(4, 1.7, 7, 8, 4)].join('')} stroke="#3a2610" strokeWidth={1.6} fill="none" opacity={0.7} />}
    </g>
  );
};

export const Butterfly: React.FC<{x: number; y: number; t: number; s?: number; hue?: string}> = ({x, y, t, s = 1, hue = '#f2a030'}) => {
  const flap = Math.abs(Math.sin(t * 9));
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${s})`}>
      {[1, -1].map((side) => (
        <g key={side} transform={`scale(${side * (0.25 + 0.75 * flap)} 1)`}>
          <path d="M0 0C10 -18 26 -16 24 -4C22 4 10 4 0 2Z" fill={hue} stroke="#2a1a0a" strokeWidth={1} />
          <path d="M0 2C8 6 18 12 12 18C6 22 2 12 0 4Z" fill={hue} stroke="#2a1a0a" strokeWidth={1} opacity={0.9} />
          <circle cx={16} cy={-6} r={3} fill="#2a1a0a" />
        </g>
      ))}
      <ellipse rx={1.8} ry={9} fill="#2a1a0a" />
    </g>
  );
};

/** Ave del bosque (cúa azul, Coua caerulea, estilizada) en vuelo planeado/aleteo. */
export const Bird: React.FC<{x: number; y: number; t: number; s?: number; facing?: 1 | -1; flap?: number}> = ({x, y, t, s = 1, facing = 1, flap = 1}) => {
  const w = Math.sin(t * 7) * flap;
  const wing = (k: number, op: number) => (
    <path d={`M-6 -4C${f1(-20)} ${f1(-34 - w * 30 * k)} ${f1(-60)} ${f1(-40 - w * 34 * k)} ${f1(-78)} ${f1(-26 - w * 30 * k)}C${f1(-52)} ${f1(-18 - w * 10 * k)} ${f1(-28)} ${f1(-6)} -6 6Z`} fill="#2a4a9a" stroke="#0e1a3a" strokeWidth={1.4} opacity={op} />
  );
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${facing * s} ${s})`}>
      {wing(0.8, 0.75)}
      <path d="M-70 4C-90 0 -112 6 -128 14C-110 18 -88 16 -66 12Z" fill="#26449a" stroke="#0e1a3a" strokeWidth={1.4} />
      <path d="M-70 4C-40 -14 10 -16 30 -6C40 0 40 10 26 14C0 22 -46 20 -70 12Z" fill="#3a5cb8" stroke="#0e1a3a" strokeWidth={1.6} />
      <path d="M-60 6C-30 -6 6 -8 26 -2" stroke="#7a98e0" strokeWidth={2} fill="none" />
      <circle cx={26} cy={-3} r={11} fill="#3a5cb8" stroke="#0e1a3a" strokeWidth={1.4} />
      <path d="M34 -2L50 2L34 6Z" fill="#1a1a1a" />
      <circle cx={28} cy={-5} r={4} fill="#5ab4ff" />
      <circle cx={28.5} cy={-5} r={1.8} fill="#111" />
      {wing(1, 1)}
    </g>
  );
};

/** Movimiento de un insecto que camina por una hoja: va y viene, se detiene. */
export function crawl(t: number, a: V, b: V, seed = 1) {
  const k = 0.5 + 0.5 * Math.sin(t * 0.35 + seed);
  const stop = clamp(Math.sin(t * 1.3 + seed) * 2) * 0.5 + 0.5;
  const u = lerp(0.15, 0.85, k);
  return {x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), walk: stop, facing: (Math.cos(t * 0.35 + seed) > 0 ? 1 : -1) as 1 | -1};
}
export const _k = {hash1};
