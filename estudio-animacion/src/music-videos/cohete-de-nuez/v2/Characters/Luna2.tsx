// LUNA 2.0 — la misma conejita exploradora (colores, jardinera, botitas, casco lila) con el rig
// nuevo: manos que agarran, ojos expresivos y cejas independientes, orejas con degradado interior
// y mechón en la punta, pliegues y costuras de la jardinera, volumen y luz de contorno.
import React from 'react';
import {mixColor} from '../../../../engine/math';
import {f1, Helmet, LimbShape, SoftShade, Vec2} from '../../Characters/parts';
import {LUNA_COLORS} from '../../Characters/Luna';
import {Eye2, FurTufts, Mouth2, Pose2, Rim} from '../rig';
import {Arm, Body, NeckShade} from './common';

export type Ear2 = {a: number; bend: number};
export type Luna2Pose = Pose2 & {earL: Ear2; earR: Ear2};
const C = LUNA_COLORS;

const Ear: React.FC<{base: Vec2; a: number; bend: number; id: string; len?: number}> = ({base, a, bend, id, len = 1}) => {
  const L = 122 * len;
  const mid = {x: base.x + Math.sin(a) * L * 0.55, y: base.y - Math.cos(a) * L * 0.55};
  const a2 = a + bend;
  const tip = {x: mid.x + Math.sin(a2) * L * 0.45, y: mid.y - Math.cos(a2) * L * 0.45};
  const w = 23;
  const nx = (pp: Vec2, q: Vec2, k: number) => {
    const dx = q.x - pp.x;
    const dy = q.y - pp.y;
    const l = Math.hypot(dx, dy) || 1;
    return {x: (-dy / l) * k, y: (dx / l) * k};
  };
  const n1 = nx(base, mid, w);
  const n2 = nx(mid, tip, w * 0.8);
  const outer = `M${f1(base.x + n1.x)},${f1(base.y + n1.y)} Q${f1(mid.x + n1.x * 1.1)},${f1(mid.y + n1.y * 1.1)} ${f1(tip.x + n2.x * 0.4)},${f1(tip.y + n2.y * 0.4)} Q${f1(tip.x)},${f1(tip.y - 10)} ${f1(tip.x - n2.x * 0.4)},${f1(tip.y - n2.y * 0.4)} Q${f1(mid.x - n1.x * 1.1)},${f1(mid.y - n1.y * 1.1)} ${f1(base.x - n1.x)},${f1(base.y - n1.y)}Z`;
  const inner = `M${f1(base.x + n1.x * 0.45)},${f1(base.y + n1.y * 0.45)} Q${f1(mid.x + n1.x * 0.5)},${f1(mid.y + n1.y * 0.5)} ${f1(tip.x)},${f1(tip.y + 6)} Q${f1(mid.x - n1.x * 0.5)},${f1(mid.y - n1.y * 0.5)} ${f1(base.x - n1.x * 0.45)},${f1(base.y - n1.y * 0.45)}Z`;
  return (
    <g>
      <path d={outer} fill={`url(#${id}-fur)`} stroke={C.outline} strokeWidth={4} strokeLinejoin="round" />
      <path d={inner} fill={`url(#${id}-inner)`} />
      <path d={`M${f1(mid.x + n1.x * 0.8)},${f1(mid.y + n1.y * 0.8)} q${f1(-n1.x * 0.2)},${f1(-12)} ${f1(-n1.x * 0.1 + (tip.x - mid.x) * 0.3)},${f1((tip.y - mid.y) * 0.3)}`} stroke="#ffffff" strokeWidth={4} fill="none" opacity={0.5} strokeLinecap="round" />
    </g>
  );
};

export const Luna2: React.FC<{p: Luna2Pose; id?: string}> = ({p, id = 'luna2'}) => {
  const turn = p.headTurn;
  const tw = p.twist * 10;
  const hipY = -64;
  const head: Vec2 = {x: 6 * turn + tw * 0.4, y: -210};
  const e = p.expr;
  const fx = 13 * turn;
  const boot = (pp: Vec2) => (
    <g>
      <ellipse cx={pp.x + 6} cy={pp.y + 1} rx={18} ry={10} fill={C.boots} stroke={C.outline} strokeWidth={3} />
      <path d={`M${f1(pp.x - 9)},${f1(pp.y - 6)} L${f1(pp.x + 9)},${f1(pp.y - 6)}`} stroke="#ffffff" strokeWidth={3} opacity={0.6} />
    </g>
  );
  const hk = p.helmet;
  return (
    <Body p={p} pivot={hipY} shadowW={66}>
      <defs>
        <SoftShade id={`${id}-fur`} base={C.fur} light={0.2} dark={0.2} />
        <SoftShade id={`${id}-ov`} base={C.overalls} />
        <SoftShade id={`${id}-shirt`} base={C.shirt} />
        <linearGradient id={`${id}-inner`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff9ab8" />
          <stop offset="1" stopColor={C.inner} />
        </linearGradient>
      </defs>
      <circle cx={-46} cy={-78} r={18} fill={`url(#${id}-fur)`} stroke={C.outline} strokeWidth={3.5} />
      <FurTufts c={{x: -46, y: -78}} r={16} color={C.fur} n={5} from={2.4} to={4.2} />
      <LimbShape o={{x: -15, y: hipY}} limb={p.legL} l1={32} l2={30} w1={20} w2={17} color={C.fur} outline={C.outline} end={boot} sleeve={{color: C.overalls, len: 20}} />
      <LimbShape o={{x: 15, y: hipY}} limb={p.legR} l1={32} l2={30} w1={20} w2={17} color={C.fur} outline={C.outline} end={boot} sleeve={{color: C.overalls, len: 20}} />
      <Arm o={{x: -36 - tw, y: -138}} limb={p.armL} l1={29} l2={27} w1={16} w2={14} color={C.fur} outline={C.outline} sleeve={{color: C.shirt, len: 14}} grip={p.gripL} hold={p.holdL} side={-1} handR={11} />
      <ellipse cx={0} cy={-112} rx={47} ry={52} fill={`url(#${id}-shirt)`} stroke={C.outline} strokeWidth={4} />
      <path d={`M${f1(-34 - tw)},-146 q8,8 4,20 M${f1(32 - tw)},-146 q-8,8 -4,20`} stroke={mixColor(C.shirt, '#000000', 0.25)} strokeWidth={3} fill="none" opacity={0.7} strokeLinecap="round" />
      <path d="M-40,-118 L40,-118 L44,-80 Q46,-58 20,-56 L-20,-56 Q-46,-58 -44,-80Z" fill={`url(#${id}-ov)`} stroke={C.outline} strokeWidth={4} strokeLinejoin="round" />
      {/* costuras y pliegues de la jardinera */}
      <path d="M-36,-112 L36,-112" stroke="#ffffff" strokeWidth={2} strokeDasharray="5 4" opacity={0.45} />
      <path d={`M${f1(-18 + tw)},-74 q6,6 4,16 M${f1(18 + tw)},-74 q-6,6 -4,16`} stroke={mixColor(C.overalls, '#000000', 0.3)} strokeWidth={3} fill="none" opacity={0.7} />
      <path d="M-28,-118 L-22,-158 M28,-118 L22,-158" stroke={C.overalls} strokeWidth={9} strokeLinecap="round" />
      <circle cx={-26} cy={-118} r={5} fill="#ffd23f" stroke={C.outline} strokeWidth={2} />
      <circle cx={26} cy={-118} r={5} fill="#ffd23f" stroke={C.outline} strokeWidth={2} />
      <rect x={-14} y={-108} width={28} height={20} rx={5} fill={mixColor(C.overalls, '#ffffff', 0.2)} stroke={C.outline} strokeWidth={2.5} />
      <rect x={-11} y={-105} width={22} height={14} rx={3} fill="none" stroke="#ffffff" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.5} />
      <path d="M-6,-100 L0,-94 L8,-104" stroke="#ffd23f" strokeWidth={3} fill="none" />
      <Rim c={{x: 0, y: -110}} r={50} k={p.rimK * 0.8} color={p.rimColor} from={-2.6} to={-1.4} />
      <NeckShade x={head.x * 0.5} y={-156} w={38} />
      <g transform={`rotate(${f1((p.headTilt * 180) / Math.PI)} 0 -160)`}>
        <Ear base={{x: head.x - 26, y: head.y - 48}} a={p.earL.a * (1 - hk) - 1.0 * hk} bend={p.earL.bend * (1 - hk) - 1.2 * hk} id={id} len={1 - 0.45 * hk} />
        <Ear base={{x: head.x + 26, y: head.y - 48}} a={p.earR.a * (1 - hk) + 1.0 * hk} bend={p.earR.bend * (1 - hk) + 1.2 * hk} id={id} len={1 - 0.45 * hk} />
        <FurTufts c={head} r={58} color={C.fur} n={6} from={0.3} to={1.1} />
        <FurTufts c={head} r={58} color={C.fur} n={6} from={2.05} to={2.85} />
        <circle cx={head.x} cy={head.y} r={62} fill={`url(#${id}-fur)`} stroke={C.outline} strokeWidth={4} />
        <path d={`M${f1(head.x - 12)},${f1(head.y - 60)} q8,-12 14,-2 q6,-10 12,2`} fill={C.fur} stroke={C.outline} strokeWidth={3} />
        <Rim c={head} r={62} k={p.rimK} color={p.rimColor} />
        <Rim c={head} r={62} k={0.1} color="#4a3050" from={0.5} to={2.6} />
        <ellipse cx={head.x + fx * 0.9} cy={head.y + 24} rx={36} ry={26} fill={C.cream} opacity={0.75} />
        <ellipse cx={head.x - 38 + 10 * turn} cy={head.y + 14} rx={13} ry={8} fill="#ff9ab8" opacity={0.15 + 0.5 * e.cheeks} />
        <ellipse cx={head.x + 38 + 10 * turn} cy={head.y + 14} rx={13} ry={8} fill="#ff9ab8" opacity={0.15 + 0.5 * e.cheeks} />
        <Eye2 c={{x: head.x - 23 + fx, y: head.y - 8}} r={21} iris={C.eye} look={e.look} blink={e.blink} lid={C.fur} outline={C.outline} brow={e.brow + e.browL} mode={e.eyes} side={-1} />
        <Eye2 c={{x: head.x + 23 + fx, y: head.y - 8}} r={21} iris={C.eye} look={e.look} blink={e.blink} lid={C.fur} outline={C.outline} brow={e.brow + e.browR} mode={e.eyes} side={1} />
        {/* pestañas */}
        <path d={`M${f1(head.x - 40 + fx)},${f1(head.y - 18)} l-7,-5 M${f1(head.x + 40 + fx)},${f1(head.y - 18)} l7,-5`} stroke={C.outline} strokeWidth={3} strokeLinecap="round" opacity={e.eyes === 'happy' || e.eyes === 'closed' ? 0 : 1} />
        <ellipse cx={head.x + fx * 1.15} cy={head.y + 15} rx={8} ry={6} fill={C.nose} stroke={C.outline} strokeWidth={2.5} />
        <circle cx={head.x + fx * 1.15 - 3} cy={head.y + 13} r={2} fill="#ffffff" opacity={0.8} />
        <path d={`M${f1(head.x + fx * 1.15 - 30)},${f1(head.y + 18)} l-18,-3 M${f1(head.x + fx * 1.15 - 30)},${f1(head.y + 24)} l-18,3 M${f1(head.x + fx * 1.15 + 30)},${f1(head.y + 18)} l18,-3 M${f1(head.x + fx * 1.15 + 30)},${f1(head.y + 24)} l18,3`} stroke={mixColor(C.outline, '#ffffff', 0.4)} strokeWidth={2} strokeLinecap="round" />
        <Mouth2 c={{x: head.x + fx * 1.15, y: head.y + 30}} w={28} kind={e.mouth} open={e.mouthOpen} outline={C.outline} />
        <Helmet c={{x: head.x, y: head.y - 8}} r={96} ring="#b98ae8" k={hk} />
      </g>
      <Arm o={{x: 36 - tw, y: -138}} limb={p.armR} l1={29} l2={27} w1={16} w2={14} color={C.fur} outline={C.outline} sleeve={{color: C.shirt, len: 14}} grip={p.gripR} hold={p.holdR} side={1} handR={11} />
    </Body>
  );
};
