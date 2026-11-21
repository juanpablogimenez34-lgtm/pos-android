// FICHAS Y RIG — MILA y TOTO, los conejitos.
// MILA: pelaje blanco, interior de orejas rosado, ojos violetas, nariz pequeña, cola redonda,
//       cuatro extremidades, pestañas.
// TOTO: pelaje marrón claro, vientre crema, ojos verdes, orejas largas, cola pequeña, algo más
//       pequeño que Mila, con un remolino de pelo en la cabeza.
// Rig: cuerpo que pasa de agachado (a cuatro patas) a erguido sobre las patas traseras, patas
// traseras que se estiran en el salto, patas delanteras articuladas (aplauso estilizado), cabeza
// con giro e inclinación, orejas independientes con flexión, nariz que se mueve y cola redonda.
import React from 'react';
import {clamp, mixColor} from '../../../engine/math';
import {add, Capsule, f1, furCircle, rot, Sphere, V, Vec} from '../Rigging/core';
import {AnimalMouth, Eye, Face, FACE} from '../Rigging/face';

export type BunnyLook = {name: 'mila' | 'toto'; fur: string; dark: string; belly: string; eye: string; inner: string; nose: string; outline: string; tail: number; earLen: number};
export const MILA: BunnyLook = {name: 'mila', fur: '#faf8f5', dark: '#d8d0df', belly: '#ffffff', eye: '#8b5cf0', inner: '#ffb3c8', nose: '#ff8fb0', outline: '#4a3a5a', tail: 1, earLen: 1};
export const TOTO: BunnyLook = {name: 'toto', fur: '#c9935f', dark: '#9a663a', belly: '#f4e3c3', eye: '#3fae6a', inner: '#f5b7a8', nose: '#c86a6a', outline: '#4a2a1a', tail: 0.75, earLen: 1.08};

export type Limb = {a: number; b: number}; // ángulo desde abajo (rad, + hacia delante) y flexión
export type BunnyEar = {a: number; bend: number};
export type BunnyPose = {
  x: number;
  y: number;
  scale: number;
  facing: 1 | -1;
  yaw: number;
  opacity: number;
  t: number;
  upright: number; // 0 agachado · 1 erguido
  lean: number;
  bob: number; // altura sobre el suelo (+ arriba)
  squash: number;
  hindExt: number; // 0 patas traseras plegadas · 1 estiradas (impulso)
  frontN: Limb;
  frontF: Limb;
  head: {tilt: number; turn: number; pitch: number};
  earN: BunnyEar;
  earF: BunnyEar;
  face: Face;
  nose: number; // 0–1 movimiento de nariz
};
export const bunnyPose = (o: Partial<BunnyPose> = {}): BunnyPose => ({
  x: 0,
  y: 0,
  scale: 1,
  facing: 1,
  yaw: 0,
  opacity: 1,
  t: 0,
  upright: 0.4,
  lean: 0,
  bob: 0,
  squash: 0,
  hindExt: 0,
  frontN: {a: 0.2, b: 0.2},
  frontF: {a: 0.1, b: 0.2},
  head: {tilt: 0, turn: 0, pitch: 0},
  earN: {a: -0.08, bend: 0},
  earF: {a: 0.12, bend: 0.1},
  face: FACE,
  nose: 0,
  ...o,
});

const seg = (o: Vec, a: number, l: number): Vec => V(o.x + Math.sin(a) * l, o.y + Math.cos(a) * l);

const Ear: React.FC<{base: Vec; a: number; bend: number; len: number; L: BunnyLook; uid: string; far?: boolean}> = ({base, a, bend, len, L, uid, far}) => {
  const H = 92 * len;
  const mid = V(base.x + Math.sin(a) * H * 0.55, base.y - Math.cos(a) * H * 0.55);
  const tip = V(mid.x + Math.sin(a + bend) * H * 0.45, mid.y - Math.cos(a + bend) * H * 0.45);
  const w = 15;
  const n = (p: Vec, q: Vec, k: number) => {
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const l = Math.hypot(dx, dy) || 1;
    return V((-dy / l) * k, (dx / l) * k);
  };
  const n1 = n(base, mid, w);
  const n2 = n(mid, tip, w * 0.85);
  const out = `M${f1(base.x + n1.x)},${f1(base.y + n1.y)} Q${f1(mid.x + n1.x * 1.15)},${f1(mid.y + n1.y * 1.15)} ${f1(tip.x + n2.x * 0.5)},${f1(tip.y + n2.y * 0.5)} Q${f1(tip.x)},${f1(tip.y - 9)} ${f1(tip.x - n2.x * 0.5)},${f1(tip.y - n2.y * 0.5)} Q${f1(mid.x - n1.x * 1.15)},${f1(mid.y - n1.y * 1.15)} ${f1(base.x - n1.x)},${f1(base.y - n1.y)}Z`;
  const inn = `M${f1(base.x + n1.x * 0.45)},${f1(base.y + n1.y * 0.45)} Q${f1(mid.x + n1.x * 0.55)},${f1(mid.y + n1.y * 0.55)} ${f1(tip.x)},${f1(tip.y + 7)} Q${f1(mid.x - n1.x * 0.55)},${f1(mid.y - n1.y * 0.55)} ${f1(base.x - n1.x * 0.45)},${f1(base.y - n1.y * 0.45)}Z`;
  return (
    <g>
      <path d={out} fill={far ? L.dark : `url(#${uid}fur)`} stroke={L.outline} strokeWidth={3.5} strokeLinejoin="round" />
      <path d={inn} fill={far ? mixColor(L.inner, L.dark, 0.35) : L.inner} />
    </g>
  );
};

export const Bunny: React.FC<{p: BunnyPose; L: BunnyLook; uid: string}> = ({p, L, uid}) => {
  const cy = Math.cos(p.yaw);
  const sx = Math.sign(cy || 1) * Math.max(0.22, Math.abs(cy));
  const up = clamp(p.upright);
  const F = p.face;
  const bodyA = (1 - up) * 0.75 + p.lean; // inclinación del cuerpo hacia delante
  const hip = V(-12, -46);
  const bodyC = rot(V(-4, -86), bodyA, hip);
  const shoulder = rot(V(14, -116), bodyA, hip);
  const neck = rot(V(10, -132), bodyA, hip);
  const headC = add(neck, V(18 + 10 * (1 - up), -28 + 18 * (1 - up)));
  const ext = clamp(p.hindExt);
  const footN = V(-6 - 30 * ext, -6 + 4 * ext);
  const footRot = -40 * ext;
  const air = Math.max(0, p.bob);
  const turn = p.head.turn;
  const tx = 7 * turn;
  const tailC = rot(V(-50, -62), bodyA, hip);
  const sq = 1 + p.squash;
  const front = (o: Vec, l: Limb, far: boolean) => {
    const k = seg(o, l.a, 24);
    const e = seg(k, l.a + l.b, 22);
    return (
      <g>
        <Capsule a={o} b={k} w={13} color={far ? L.dark : L.fur} outline={L.outline} shine={far ? 0 : 0.2} />
        <Capsule a={k} b={e} w={12} color={far ? L.dark : L.fur} outline={L.outline} shine={0} />
        <ellipse cx={e.x} cy={e.y} rx={8} ry={7} fill={far ? L.dark : L.fur} stroke={L.outline} strokeWidth={2.5} />
      </g>
    );
  };
  return (
    <g transform={`translate(${f1(p.x)} ${f1(p.y)}) scale(${(p.scale * p.facing).toFixed(3)} ${p.scale.toFixed(3)})`} opacity={p.opacity}>
      <defs>
        <Sphere id={`${uid}fur`} base={L.fur} light={0.25} dark={0.22} />
        <Sphere id={`${uid}bel`} base={L.belly} light={0.2} dark={0.12} />
      </defs>
      <ellipse cx={0} cy={2} rx={58 * (1 - Math.min(0.5, air / 260))} ry={10 * (1 - Math.min(0.5, air / 260))} fill="#1a1030" opacity={0.22 * (1 - Math.min(0.6, air / 200))} />
      <g transform={`scale(${sx.toFixed(3)} 1) translate(0 ${f1(-p.bob)}) scale(${f1(sq)} ${f1(2 - sq)})`}>
        {/* pata trasera lejana y delantera lejana */}
        <g transform={`translate(${f1(footN.x - 14)} ${f1(footN.y - 2)}) rotate(${f1(footRot)})`}>
          <ellipse cx={0} cy={0} rx={30} ry={10} fill={L.dark} stroke={L.outline} strokeWidth={3} />
        </g>
        {front(add(shoulder, V(-8, 2)), p.frontF, true)}
        {/* cola redonda */}
        <path d={furCircle(tailC, 16 * L.tail, 12, 0.22, 3)} fill={L.outline} transform={`translate(0 0)`} />
        <path d={furCircle(tailC, 14 * L.tail, 12, 0.2, 3)} fill={mixColor(L.fur, '#ffffff', 0.4)} />
        {/* cuerpo (pera) */}
        <g transform={`rotate(${f1((bodyA * 180) / Math.PI)} ${f1(bodyC.x)} ${f1(bodyC.y)})`}>
          <ellipse cx={bodyC.x} cy={bodyC.y} rx={41} ry={50} fill={L.outline} />
          <ellipse cx={bodyC.x} cy={bodyC.y} rx={38} ry={47} fill={`url(#${uid}fur)`} />
          <ellipse cx={bodyC.x + 14} cy={bodyC.y + 6} rx={20} ry={32} fill={`url(#${uid}bel)`} />
          <path d={`M${f1(bodyC.x - 30)},${f1(bodyC.y - 30)} A40,48 0 0 1 ${f1(bodyC.x + 6)},${f1(bodyC.y - 46)}`} stroke="#ffffff" strokeWidth={4} fill="none" opacity={0.35} strokeLinecap="round" />
        </g>
        {/* muslo y pata trasera cercana (se estira al saltar) */}
        <circle cx={hip.x - 2} cy={hip.y + 6} r={30} fill={L.outline} />
        <path d={furCircle(V(hip.x - 2, hip.y + 6), 27, 14, 0.12, 6)} fill={`url(#${uid}fur)`} />
        <g transform={`translate(${f1(footN.x)} ${f1(footN.y)}) rotate(${f1(footRot)})`}>
          <ellipse cx={4} cy={0} rx={32} ry={11} fill={L.fur} stroke={L.outline} strokeWidth={3} />
          {ext > 0.4 && <ellipse cx={2} cy={4} rx={18} ry={4} fill={mixColor(L.inner, L.dark, 0.3)} opacity={clamp((ext - 0.4) / 0.3)} />}
          <path d="M24,-2 l0,6 M30,-1 l0,5" stroke={L.outline} strokeWidth={2} opacity={0.5} strokeLinecap="round" />
        </g>
        {/* cabeza */}
        <g transform={`rotate(${f1(((p.head.tilt + p.head.pitch) * 180) / Math.PI)} ${f1(neck.x)} ${f1(neck.y)})`}>
          <Ear base={V(headC.x + 8 + tx, headC.y - 30)} a={0.12 + p.earF.a} bend={p.earF.bend} len={L.earLen} L={L} uid={uid} far />
          <circle cx={headC.x} cy={headC.y} r={41} fill={L.outline} />
          <path d={furCircle(V(headC.x, headC.y + 2), 39, 22, 0.09, 4, 0.3, 2.9)} fill={`url(#${uid}fur)`} />
          <circle cx={headC.x} cy={headC.y} r={38} fill={`url(#${uid}fur)`} />
          {L.name === 'toto' && <path d={`M${f1(headC.x - 6)},${f1(headC.y - 38)} q4,-16 14,-12 q-8,2 -4,12 q6,-10 14,-4`} fill={L.fur} stroke={L.outline} strokeWidth={2.5} strokeLinejoin="round" />}
          <ellipse cx={headC.x + 20 + tx} cy={headC.y + 16} rx={20} ry={15} fill={L.belly} opacity={0.9} />
          <ellipse cx={headC.x + 2 + tx} cy={headC.y + 10} rx={9} ry={5} fill="#ff9ab8" opacity={0.2 + 0.45 * F.cheeks} />
          <Eye c={V(headC.x + 6 + tx, headC.y - 8)} rx={11} ry={13} iris={L.eye} f={F} brow={F.browL} lid={L.fur} outline={L.outline} side={-1} uid={`${uid}a`} />
          <Eye c={V(headC.x + 30 + tx * 0.7, headC.y - 9)} rx={8} ry={12} iris={L.eye} f={F} brow={F.browR} lid={L.fur} outline={L.outline} side={1} uid={`${uid}b`} />
          {L.name === 'mila' && F.mode !== 'closed' && F.mode !== 'happy' && <path d={`M${f1(headC.x - 6 + tx)},${f1(headC.y - 18)} l-6,-4 M${f1(headC.x - 4 + tx)},${f1(headC.y - 13)} l-7,-1`} stroke={L.outline} strokeWidth={2.5} strokeLinecap="round" />}
          {/* nariz que se mueve y bigotes */}
          <g transform={`translate(0 ${f1(Math.sin(p.t * 22) * 1.2 * p.nose)})`}>
            <path d={`M${f1(headC.x + 34 + tx)},${f1(headC.y + 7)} q5,-3 9,0 q-2,5 -4.5,5 q-3,0 -4.5,-5Z`} fill={L.nose} stroke={L.outline} strokeWidth={1.8} />
          </g>
          <path d={`M${f1(headC.x + 26 + tx)},${f1(headC.y + 14)} l-18,-4 M${f1(headC.x + 26 + tx)},${f1(headC.y + 18)} l-18,3 M${f1(headC.x + 46 + tx)},${f1(headC.y + 13)} l14,-4 M${f1(headC.x + 46 + tx)},${f1(headC.y + 17)} l14,2`} stroke={mixColor(L.outline, '#ffffff', 0.45)} strokeWidth={1.6} strokeLinecap="round" />
          <AnimalMouth c={V(headC.x + 37 + tx, headC.y + 16)} w={14} f={F} outline={L.outline} teeth={false} />
          {F.jaw > 0.1 && <rect x={headC.x + 34 + tx} y={headC.y + 16} width={6} height={5} rx={1} fill="#ffffff" stroke={L.outline} strokeWidth={1} />}
          <Ear base={V(headC.x - 12 + tx * 0.6, headC.y - 32)} a={-0.1 + p.earN.a} bend={p.earN.bend} len={L.earLen} L={L} uid={uid} />
          <path d={`M${f1(headC.x - 30)},${f1(headC.y - 20)} A38,38 0 0 1 ${f1(headC.x - 2)},${f1(headC.y - 37)}`} stroke="#ffffff" strokeWidth={3.5} fill="none" opacity={0.4} strokeLinecap="round" />
        </g>
        {front(shoulder, p.frontN, false)}
      </g>
    </g>
  );
};
