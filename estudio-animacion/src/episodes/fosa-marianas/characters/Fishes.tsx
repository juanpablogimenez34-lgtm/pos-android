// ESPECIES DE PECES construidas sobre el sistema reutilizable (FishRig) con detalles propios:
//  02 tiburón gris de arrecife · atún aleta amarilla · 04 pez linterna · 05 pez de cabeza transparente
//  08 pez dragón negro del Pacífico · 16 pez caracol de las Marianas · presa pequeña (genérica).
import React from 'react';
import {clamp, lerp, smoothPath} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {Body, Fish, FishPose, FishSpec} from './FishRig';

const f1 = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);

// ------------------------------------------------------------------ tiburón gris de arrecife
export const SHARK: FishSpec = {
  L: 900,
  top: [[0, 0.01], [0.04, 0.05], [0.12, 0.085], [0.28, 0.1], [0.45, 0.09], [0.62, 0.06], [0.78, 0.035], [0.9, 0.022], [1, 0.016]],
  bot: [[0, 0.01], [0.05, 0.04], [0.15, 0.075], [0.32, 0.09], [0.5, 0.075], [0.65, 0.05], [0.8, 0.03], [0.92, 0.02], [1, 0.016]],
  colors: {back: '#5a6c7c', mid: '#8a9aa6', belly: '#e8eef0', fin: '#5a6c7c', line: '#1e2830'},
  fins: [
    {kind: 'dorsal', u0: 0.3, u1: 0.44, h: 0.14, shape: 'pointed', rays: 8, sweep: 0.9},
    {kind: 'dorsal', u0: 0.7, u1: 0.74, h: 0.03, shape: 'pointed', rays: 4},
    {kind: 'anal', u0: 0.72, u1: 0.76, h: 0.03, shape: 'pointed', rays: 4},
    {kind: 'pectoral', u0: 0.24, v: -0.6, h: 0.2, phase: 0.3},
    {kind: 'pelvic', u0: 0.56, v: -0.85, h: 0.06, phase: 1.1},
    {kind: 'caudal', u0: 1, h: 0.17, shape: 'hetero'},
  ],
  eye: {u: 0.075, v: 0.15, r: 0.009, ring: '#d8c890', iris: '#3a2a10'},
  mouth: {u: 0.12, v: -0.55, jaw: 0.45},
  wave: 0.08, lateral: false,
};
export const sharkDetail = (B: Body) => (
  <g>
    {[0, 1, 2, 3, 4].map((i) => {
      const a = B.U(0.17 + i * 0.016, 0.25);
      const b = B.U(0.165 + i * 0.016, -0.45);
      return <path key={i} d={`M${f1(a.x)} ${f1(a.y)}Q${f1((a.x + b.x) / 2 - 4)} ${f1((a.y + b.y) / 2)} ${f1(b.x)} ${f1(b.y)}`} stroke="#2a3640" strokeWidth={2} fill="none" />;
    })}
    <path d={smoothPath([B.U(0.01, -0.2), B.U(0.06, -0.55), B.U(0.12, -0.5)])} stroke="#1e2830" strokeWidth={2} fill="none" />
    <circle cx={f1(B.U(0.025, 0.1).x)} cy={f1(B.U(0.025, 0.1).y)} r={2.5} fill="#1e2830" />
  </g>
);

// ------------------------------------------------------------------ atún aleta amarilla
export const TUNA: FishSpec = {
  L: 520,
  top: [[0, 0.02], [0.05, 0.07], [0.18, 0.12], [0.35, 0.13], [0.55, 0.1], [0.75, 0.05], [0.88, 0.025], [1, 0.02]],
  bot: [[0, 0.02], [0.06, 0.07], [0.2, 0.12], [0.38, 0.125], [0.58, 0.09], [0.76, 0.045], [0.9, 0.022], [1, 0.02]],
  colors: {back: '#1a2a5a', mid: '#8aa0c0', belly: '#f0f4f8', fin: '#f0c020', line: '#0e1630'},
  fins: [
    {kind: 'dorsal', u0: 0.25, u1: 0.36, h: 0.08, shape: 'pointed', color: '#3a4a7a', rays: 6},
    {kind: 'dorsal', u0: 0.5, u1: 0.56, h: 0.17, shape: 'pointed', rays: 5, sweep: 1.4},
    {kind: 'anal', u0: 0.54, u1: 0.6, h: 0.16, shape: 'pointed', rays: 5, sweep: 1.4},
    {kind: 'pectoral', u0: 0.25, v: 0.0, h: 0.2, phase: 0.6, color: '#2a3a6a'},
    {kind: 'pelvic', u0: 0.32, v: -0.9, h: 0.05},
    {kind: 'caudal', u0: 1, h: 0.2, shape: 'lunate', color: '#3a4a6a'},
  ],
  eye: {u: 0.07, v: 0.15, r: 0.022, ring: '#c8c0a0'},
  mouth: {u: 0.07, v: -0.3, jaw: 0.3},
  wave: 0.05,
};
export const tunaDetail = (B: Body) => (
  <g>
    {/* banda dorada y pínnulas amarillas */}
    <path d={smoothPath(Array.from({length: 10}, (_, i) => B.U(0.1 + i * 0.07, 0.3)))} stroke="#f0c040" strokeWidth={6} fill="none" opacity={0.55} />
    {Array.from({length: 8}, (_, i) => {
      const u = 0.66 + i * 0.035;
      const a = B.U(u, 0.98);
      const b = B.U(u, -0.98);
      return <g key={i}><path d={`M${f1(a.x)} ${f1(a.y)}l-8 -10l-4 10Z`} fill="#f0c020" /><path d={`M${f1(b.x)} ${f1(b.y)}l-8 10l-4 -10Z`} fill="#f0c020" /></g>;
    })}
  </g>
);

// ------------------------------------------------------------------ pez linterna (Myctophidae)
export const LANTERN: FishSpec = {
  L: 170,
  top: [[0, 0.04], [0.06, 0.1], [0.2, 0.13], [0.45, 0.11], [0.7, 0.07], [0.88, 0.045], [1, 0.035]],
  bot: [[0, 0.04], [0.08, 0.1], [0.22, 0.13], [0.45, 0.1], [0.7, 0.06], [0.9, 0.04], [1, 0.035]],
  colors: {back: '#1e3a5a', mid: '#6a8aa8', belly: '#c8d8e4', fin: '#7a9ab4', line: '#0a1624'},
  fins: [
    {kind: 'dorsal', u0: 0.38, u1: 0.5, h: 0.09, shape: 'round', rays: 7, op: 0.75},
    {kind: 'adipose', u0: 0.78, u1: 0.82, h: 0.03, shape: 'round', rays: 4},
    {kind: 'anal', u0: 0.55, u1: 0.72, h: 0.07, shape: 'round', rays: 8, op: 0.75},
    {kind: 'pectoral', u0: 0.24, v: -0.2, h: 0.14, phase: 1.3, op: 0.7},
    {kind: 'pelvic', u0: 0.4, v: -0.9, h: 0.07, phase: 0.4},
    {kind: 'caudal', u0: 1, h: 0.16, shape: 'fork'},
  ],
  eye: {u: 0.08, v: 0.15, r: 0.055, ring: '#b8c8c8', iris: '#1a2a2a'},
  mouth: {u: 0.12, v: -0.3, jaw: 0.4},
  photophores: [
    ...Array.from({length: 9}, (_, i) => ({u: 0.18 + i * 0.065, v: -0.78, r: 0.013})),
    ...Array.from({length: 6}, (_, i) => ({u: 0.24 + i * 0.07, v: -0.45, r: 0.011})),
    {u: 0.03, v: 0.05, r: 0.016},
  ],
  wave: 0.09,
};

// ------------------------------------------------------------------ pez de cabeza transparente (Macropinna microstoma)
export const BARRELEYE: FishSpec = {
  L: 240,
  top: [[0, 0.06], [0.05, 0.12], [0.18, 0.15], [0.4, 0.14], [0.65, 0.1], [0.85, 0.06], [1, 0.045]],
  bot: [[0, 0.04], [0.06, 0.1], [0.2, 0.14], [0.4, 0.14], [0.65, 0.09], [0.86, 0.055], [1, 0.045]],
  colors: {back: '#3a2a26', mid: '#5a4038', belly: '#6a4c40', fin: '#2a201c', line: '#140c0a'},
  fins: [
    {kind: 'dorsal', u0: 0.52, u1: 0.62, h: 0.08, shape: 'round', rays: 6, op: 0.7},
    {kind: 'anal', u0: 0.6, u1: 0.72, h: 0.07, shape: 'round', rays: 6, op: 0.7},
    {kind: 'pectoral', u0: 0.22, v: -0.55, h: 0.28, shape: 'fan', phase: 0.2, op: 0.65},
    {kind: 'pelvic', u0: 0.46, v: -0.9, h: 0.22, shape: 'fan', phase: 1.9, op: 0.65},
    {kind: 'caudal', u0: 1, h: 0.16, shape: 'fork', op: 0.85},
  ],
  eye: {u: 0.03, v: -0.05, r: 0.012, ring: '#1a1210', iris: '#0a0606'}, // órgano olfativo visible (parece un "ojo")
  mouth: {u: 0.03, v: -0.4, jaw: 0.25},
  wave: 0.04,
};
/** Escudo transparente con ojos tubulares (giro 0 = hacia arriba … 1 = hacia delante). */
export const barreleyeDetail = (eyeRot: number, labels = 0) => (B: Body) => {
  const c = B.U(0.13, 0.55);
  const rDome = B.L * 0.17;
  const a = lerp(-Math.PI / 2, -0.15, clamp(eyeRot));
  const e0 = B.U(0.1, 0.55);
  const e1 = {x: e0.x + Math.cos(a) * B.L * 0.07, y: e0.y + Math.sin(a) * B.L * 0.07};
  const nar = B.U(0.03, -0.05);
  return (
    <g>
      {/* escudo transparente lleno de líquido */}
      <path d={`M${f1(c.x - rDome * 1.2)} ${f1(c.y + rDome * 0.55)}C${f1(c.x - rDome * 1.3)} ${f1(c.y - rDome * 1.1)} ${f1(c.x + rDome * 1.2)} ${f1(c.y - rDome * 1.25)} ${f1(c.x + rDome * 1.15)} ${f1(c.y + rDome * 0.6)}Z`} fill="#bff4ff" opacity={0.18} stroke="#dffaff" strokeWidth={1.6} />
      <path d={`M${f1(c.x - rDome * 0.6)} ${f1(c.y - rDome * 0.65)}q${f1(rDome * 0.5)} ${f1(-rDome * 0.35)} ${f1(rDome * 1.1)} ${f1(-rDome * 0.05)}`} stroke="#ffffff" strokeWidth={2.5} fill="none" opacity={0.55} />
      {/* ojos tubulares con lente verde */}
      <path d={`M${f1(e0.x)} ${f1(e0.y)}L${f1(e1.x)} ${f1(e1.y)}`} stroke="#1a3a2a" strokeWidth={B.L * 0.05} strokeLinecap="round" />
      <path d={`M${f1(e0.x)} ${f1(e0.y)}L${f1(e1.x)} ${f1(e1.y)}`} stroke="#2a6a4a" strokeWidth={B.L * 0.035} strokeLinecap="round" opacity={0.9} />
      <circle cx={f1(e1.x)} cy={f1(e1.y)} r={f1(B.L * 0.028)} fill="#5aff9a" opacity={0.9} />
      <circle cx={f1(e1.x - 2)} cy={f1(e1.y - 2)} r={f1(B.L * 0.01)} fill="#ffffff" opacity={0.9} />
      {/* cerebro visible tras los ojos */}
      <ellipse cx={f1(B.U(0.19, 0.5).x)} cy={f1(B.U(0.19, 0.5).y)} rx={B.L * 0.03} ry={B.L * 0.02} fill="#e8b8a8" opacity={0.55} />
      {labels > 0.01 && (
        <g opacity={labels} fontFamily={FONT_FAMILY} fontWeight={800} fontSize={B.L * 0.045} fill="#ffffff">
          <path d={`M${f1(e1.x)} ${f1(e1.y)}L${f1(e1.x + B.L * 0.12)} ${f1(e1.y - B.L * 0.14)}`} stroke="#5aff9a" strokeWidth={1.5} />
          <text x={f1(e1.x + B.L * 0.13)} y={f1(e1.y - B.L * 0.15)} fill="#5aff9a">ojos tubulares</text>
          <path d={`M${f1(nar.x)} ${f1(nar.y)}L${f1(nar.x + B.L * 0.15)} ${f1(nar.y + B.L * 0.16)}`} stroke="#ffd23f" strokeWidth={1.5} />
          <text x={f1(nar.x + B.L * 0.16)} y={f1(nar.y + B.L * 0.19)} fill="#ffd23f">órganos olfativos (no son ojos)</text>
          <path d={`M${f1(c.x)} ${f1(c.y - rDome)}L${f1(c.x - B.L * 0.1)} ${f1(c.y - rDome - B.L * 0.12)}`} stroke="#bff4ff" strokeWidth={1.5} />
          <text x={f1(c.x - B.L * 0.36)} y={f1(c.y - rDome - B.L * 0.13)} fill="#bff4ff">escudo transparente</text>
        </g>
      )}
    </g>
  );
};

// ------------------------------------------------------------------ pez dragón negro del Pacífico (Idiacanthus antrostomus, hembra)
export const DRAGON: FishSpec = {
  L: 760,
  top: [[0, 0.015], [0.03, 0.04], [0.07, 0.052], [0.2, 0.045], [0.5, 0.04], [0.8, 0.03], [0.95, 0.02], [1, 0.014]],
  bot: [[0, 0.02], [0.03, 0.045], [0.07, 0.055], [0.2, 0.045], [0.5, 0.04], [0.8, 0.03], [0.95, 0.02], [1, 0.014]],
  colors: {back: '#1a1824', mid: '#262434', belly: '#34303f', fin: '#22202e', line: '#5a5670'},
  fins: [
    {kind: 'dorsal', u0: 0.48, u1: 0.93, h: 0.022, shape: 'round', rays: 16, op: 0.85},
    {kind: 'anal', u0: 0.62, u1: 0.93, h: 0.02, shape: 'round', rays: 12, op: 0.85},
    {kind: 'caudal', u0: 1, h: 0.05, shape: 'fork'},
  ],
  eye: {u: 0.035, v: 0.2, r: 0.012, ring: '#2a2a3a', iris: '#0a0a14'},
  mouth: {u: 0.07, v: -0.15, jaw: 0.9},
  photophores: Array.from({length: 26}, (_, i) => ({u: 0.08 + i * 0.033, v: -0.75, r: 0.0045})),
  wave: 0.14, lateral: false,
};
/** Dientes en colmillo, barbilla luminosa y fotóforo postorbital. */
export const dragonDetail = (glow: number, t: number) => (B: Body, P: FishPose) => {
  const jaw = clamp(P.jaw ?? 0) * 0.9;
  const piv = B.U(0.07, -0.15);
  const rot = (q: {x: number; y: number}) => ({x: piv.x + (q.x - piv.x) * Math.cos(jaw) - (q.y - piv.y) * Math.sin(jaw), y: piv.y + (q.x - piv.x) * Math.sin(jaw) + (q.y - piv.y) * Math.cos(jaw)});
  const chin = rot(B.U(0.03, -0.9));
  const sway = Math.sin(t * 1.6) * 0.3;
  const bulb = {x: chin.x - B.L * 0.02 + Math.sin(sway) * B.L * 0.05, y: chin.y + B.L * 0.14};
  const teethU = [0.015, 0.025, 0.037, 0.05];
  return (
    <g>
      {teethU.map((u, i) => {
        const up = B.U(u, -0.12);
        const lo = rot(B.U(u + 0.004, -0.4));
        return <g key={i}><path d={`M${f1(up.x - 2)} ${f1(up.y)}l2 ${f1(B.L * (0.012 + (i % 2) * 0.008))}l2 ${f1(-B.L * (0.012 + (i % 2) * 0.008))}Z`} fill="#e8e4d8" /><path d={`M${f1(lo.x - 2)} ${f1(lo.y)}l2 ${f1(-B.L * (0.014 + ((i + 1) % 2) * 0.008))}l2 ${f1(B.L * (0.014 + ((i + 1) % 2) * 0.008))}Z`} fill="#e8e4d8" /></g>;
      })}
      <path d={`M${f1(chin.x)} ${f1(chin.y)}Q${f1(chin.x + B.L * 0.02)} ${f1(chin.y + B.L * 0.07)} ${f1(bulb.x)} ${f1(bulb.y)}`} stroke="#2a2a3a" strokeWidth={2} fill="none" />
      <circle cx={f1(bulb.x)} cy={f1(bulb.y)} r={B.L * 0.008} fill="#bff8ff" opacity={0.6 + 0.4 * glow} />
      <ellipse cx={f1(B.U(0.05, 0.05).x)} cy={f1(B.U(0.05, 0.05).y)} rx={B.L * 0.006} ry={B.L * 0.004} fill="#9ff0ff" opacity={0.5 + 0.5 * glow} />
    </g>
  );
};
export function dragonBulb(B: Body, P: FishPose, t: number) {
  const jaw = clamp(P.jaw ?? 0) * 0.9;
  const piv = B.U(0.07, -0.15);
  const q = B.U(0.03, -0.9);
  const chin = {x: piv.x + (q.x - piv.x) * Math.cos(jaw) - (q.y - piv.y) * Math.sin(jaw), y: piv.y + (q.x - piv.x) * Math.sin(jaw) + (q.y - piv.y) * Math.cos(jaw)};
  const sway = Math.sin(t * 1.6) * 0.3;
  return {x: chin.x - B.L * 0.02 + Math.sin(sway) * B.L * 0.05, y: chin.y + B.L * 0.14};
}

// ------------------------------------------------------------------ pez caracol de las Marianas (Pseudoliparis swirei)
export const SNAILFISH: FishSpec = {
  L: 300,
  top: [[0, 0.07], [0.05, 0.14], [0.15, 0.17], [0.3, 0.14], [0.5, 0.09], [0.7, 0.055], [0.9, 0.03], [1, 0.02]],
  bot: [[0, 0.07], [0.06, 0.13], [0.16, 0.16], [0.32, 0.13], [0.5, 0.085], [0.7, 0.05], [0.9, 0.028], [1, 0.02]],
  colors: {back: '#e8b8b4', mid: '#f0ccc4', belly: '#f8e0d8', fin: '#f0c4bc', line: '#a8706a'},
  fins: [
    {kind: 'dorsal', u0: 0.3, u1: 0.98, h: 0.06, shape: 'round', rays: 18, op: 0.55, sweep: 0.1},
    {kind: 'anal', u0: 0.38, u1: 0.98, h: 0.055, shape: 'round', rays: 16, op: 0.55, sweep: 0.1},
    {kind: 'pectoral', u0: 0.17, v: -0.3, h: 0.2, shape: 'fan', phase: 0.5, op: 0.55},
    {kind: 'pectoral', u0: 0.18, v: -0.85, h: 0.13, shape: 'fan', phase: 2.1, op: 0.55},
    {kind: 'caudal', u0: 1, h: 0.06, shape: 'round', op: 0.6},
  ],
  eye: {u: 0.065, v: 0.32, r: 0.017, ring: '#1a1414', iris: '#050404'},
  mouth: {u: 0.07, v: -0.25, jaw: 0.5},
  bodyOp: 0.78, wave: 0.11, lateral: false,
};
/** Órganos internos visibles a través de la piel translúcida y piel gelatinosa. */
export const snailDetail = (labels = 0) => (B: Body) => {
  const liver = B.U(0.2, -0.25);
  const gut = B.U(0.3, -0.35);
  const spine = Array.from({length: 14}, (_, i) => B.U(0.12 + i * 0.065, 0.05));
  return (
    <g>
      <path d={smoothPath(spine)} stroke="#c88a84" strokeWidth={B.L * 0.012} fill="none" opacity={0.4} />
      <ellipse cx={f1(liver.x)} cy={f1(liver.y)} rx={B.L * 0.06} ry={B.L * 0.04} fill="#c86a5a" opacity={0.45} />
      <ellipse cx={f1(gut.x)} cy={f1(gut.y)} rx={B.L * 0.05} ry={B.L * 0.025} fill="#b85a6a" opacity={0.35} />
      {Array.from({length: 10}, (_, i) => {
        const p = B.U(0.05 + i * 0.07, 0.55 - (i % 3) * 0.3);
        return <circle key={i} cx={f1(p.x)} cy={f1(p.y)} r={B.L * 0.008} fill="#ffffff" opacity={0.25} />;
      })}
      {labels > 0.01 && (
        <g opacity={labels} fontFamily={FONT_FAMILY} fontWeight={800} fontSize={B.L * 0.045}>
          <path d={`M${f1(liver.x)} ${f1(liver.y)}L${f1(liver.x + B.L * 0.15)} ${f1(liver.y + B.L * 0.25)}`} stroke="#ffd23f" strokeWidth={1.5} />
          <text x={f1(liver.x + B.L * 0.16)} y={f1(liver.y + B.L * 0.28)} fill="#ffd23f">órganos visibles: piel translúcida</text>
          <path d={`M${f1(B.U(0.08, 0.9).x)} ${f1(B.U(0.08, 0.9).y)}L${f1(B.U(0.08, 0.9).x - B.L * 0.05)} ${f1(B.U(0.08, 0.9).y - B.L * 0.22)}`} stroke="#bff4ff" strokeWidth={1.5} />
          <text x={f1(B.U(0.08, 0.9).x - B.L * 0.3)} y={f1(B.U(0.08, 0.9).y - B.L * 0.24)} fill="#bff4ff">cráneo poco osificado</text>
          <path d={`M${f1(B.U(0.6, -0.6).x)} ${f1(B.U(0.6, -0.6).y)}L${f1(B.U(0.6, -0.6).x - B.L * 0.05)} ${f1(B.U(0.6, -0.6).y + B.L * 0.22)}`} stroke="#ffffff" strokeWidth={1.5} />
          <text x={f1(B.U(0.6, -0.6).x - B.L * 0.4)} y={f1(B.U(0.6, -0.6).y + B.L * 0.27)} fill="#ffffff">sin escamas · tejido gelatinoso</text>
        </g>
      )}
    </g>
  );
};

// ------------------------------------------------------------------ presa pequeña genérica
export const SMALLFISH: FishSpec = {
  L: 90,
  top: [[0, 0.04], [0.1, 0.12], [0.3, 0.14], [0.6, 0.09], [0.85, 0.05], [1, 0.04]],
  bot: [[0, 0.04], [0.1, 0.11], [0.3, 0.13], [0.6, 0.08], [0.85, 0.045], [1, 0.04]],
  colors: {back: '#5a7a9a', mid: '#9ab4c8', belly: '#e0e8f0', fin: '#8aa4b8', line: '#1a2a3a'},
  fins: [
    {kind: 'dorsal', u0: 0.35, u1: 0.55, h: 0.1, shape: 'round', rays: 6},
    {kind: 'anal', u0: 0.55, u1: 0.72, h: 0.07, shape: 'round', rays: 5},
    {kind: 'pectoral', u0: 0.25, v: -0.2, h: 0.14, phase: 0.9},
    {kind: 'caudal', u0: 1, h: 0.16, shape: 'fork'},
  ],
  eye: {u: 0.08, v: 0.2, r: 0.05},
  mouth: {u: 0.08, v: -0.2},
  wave: 0.1,
};
export const FishC: React.FC<{spec: FishSpec; p: FishPose; uid: string; detail?: (B: Body, P: FishPose) => React.ReactNode}> = ({spec, p, uid, detail}) => <Fish spec={spec} pose={p} uid={uid} detail={detail} />;
