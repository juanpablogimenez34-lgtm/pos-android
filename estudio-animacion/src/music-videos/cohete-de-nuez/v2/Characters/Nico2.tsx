// NICO 2.0 — misma ardilla inventora de la v1 (colores, proporciones, cola, ropa), con el rig
// nuevo: manos que agarran, ojos con modos y cejas independientes, bocas nuevas, volumen con luz
// de contorno, mechones de pelaje, pliegues de la camiseta y giro del torso.
import React from 'react';
import {mixColor} from '../../../../engine/math';
import {f1, Helmet, LimbShape, SoftShade, Vec2} from '../../Characters/parts';
import {NICO_COLORS} from '../../Characters/Nico';
import {Eye2, FurTufts, Mouth2, Pose2, Rim} from '../rig';
import {Arm, Body, NeckShade} from './common';

export type Nico2Pose = Pose2 & {tail: {sway: number; curl: number}; belt: number};
const C = NICO_COLORS;

export const Nico2: React.FC<{p: Nico2Pose; id?: string}> = ({p, id = 'nico2'}) => {
  const turn = p.headTurn;
  const tw = p.twist * 10;
  const hipY = -66;
  const head: Vec2 = {x: 6 * turn + tw * 0.4, y: -218};
  const e = p.expr;
  const foot = (pp: Vec2) => <ellipse cx={pp.x + 8} cy={pp.y + 2} rx={18} ry={9} fill={C.furDark} stroke={C.outline} strokeWidth={3} />;
  const tailPts: Vec2[] = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    const sway = p.tail.sway * Math.sin(u * 2.2) * 40;
    const curl = p.tail.curl * Math.max(0, u - 0.6) * 90;
    tailPts.push({x: -40 - u * 45 + Math.sin(u * Math.PI * 1.1) * -30 + sway + curl, y: -70 - u * 190 + Math.sin(u * Math.PI) * 10});
  }
  const fx = 14 * turn; // desplazamiento de los rasgos con el giro de la cabeza
  return (
    <Body p={p} pivot={hipY} shadowW={70}>
      <defs>
        <SoftShade id={`${id}-fur`} base={C.fur} />
        <SoftShade id={`${id}-shirt`} base={C.shirt} />
        <linearGradient id={`${id}-tail`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={C.furDark} />
          <stop offset="0.7" stopColor={C.fur} />
          <stop offset="1" stopColor={mixColor(C.fur, C.cream, 0.6)} />
        </linearGradient>
      </defs>
      {/* cola (detrás) con mechones */}
      <g>
        {tailPts.map((q, i) => (
          <circle key={`o${i}`} cx={q.x} cy={q.y} r={30 + Math.sin((i / 12) * Math.PI) * 26} fill={C.outline} />
        ))}
        {tailPts.map((q, i) => (
          <circle key={`f${i}`} cx={q.x} cy={q.y} r={27 + Math.sin((i / 12) * Math.PI) * 26} fill={`url(#${id}-tail)`} />
        ))}
        {tailPts.slice(2).map((q, i) => (
          <path key={`s${i}`} d={`M${f1(q.x - 16)},${f1(q.y + 8)} q10,-10 24,-3 M${f1(q.x + 4)},${f1(q.y + 18)} q8,-6 16,-2`} stroke={C.furDark} strokeWidth={3} fill="none" opacity={0.4} strokeLinecap="round" />
        ))}
        {tailPts.slice(6).map((q, i) => (
          <path key={`h${i}`} d={`M${f1(q.x - 20)},${f1(q.y - 10)} q14,-12 30,-4`} stroke="#ffffff" strokeWidth={4} fill="none" opacity={0.18} strokeLinecap="round" />
        ))}
      </g>
      {/* piernas y brazo trasero */}
      <LimbShape o={{x: -16, y: hipY}} limb={p.legL} l1={34} l2={32} w1={22} w2={18} color={C.fur} outline={C.outline} end={foot} sleeve={{color: C.shorts, len: 22}} />
      <LimbShape o={{x: 16, y: hipY}} limb={p.legR} l1={34} l2={32} w1={22} w2={18} color={C.fur} outline={C.outline} end={foot} sleeve={{color: C.shorts, len: 22}} />
      <Arm o={{x: -38 - tw, y: -142}} limb={p.armL} l1={30} l2={28} w1={17} w2={15} color={C.fur} outline={C.outline} sleeve={{color: C.shirt, len: 16}} grip={p.gripL} hold={p.holdL} side={-1} handR={12} />
      {/* cuerpo */}
      <path d="M-44,-80 Q-46,-56 -20,-54 L20,-54 Q46,-56 44,-80Z" fill={C.shorts} stroke={C.outline} strokeWidth={4} />
      <path d="M-30,-66 L-26,-56 M28,-66 L24,-56" stroke={mixColor(C.shorts, '#000000', 0.3)} strokeWidth={3} />
      <clipPath id={`${id}-shirtclip`}>
        <rect x={-60} y={-180} width={120} height={84} />
      </clipPath>
      <ellipse cx={0} cy={-116} rx={50} ry={54} fill={C.cream} stroke={C.outline} strokeWidth={4} />
      <ellipse cx={0} cy={-116} rx={50} ry={54} fill={`url(#${id}-shirt)`} clipPath={`url(#${id}-shirtclip)`} />
      <path d="M-47,-96 Q0,-90 47,-96" stroke={C.outline} strokeWidth={4} fill="none" />
      <ellipse cx={0} cy={-116} rx={50} ry={54} fill="none" stroke={C.outline} strokeWidth={4} />
      {/* pliegues de la camiseta (se mueven con el giro del torso) */}
      <path d={`M${f1(-36 - tw)},-150 q10,10 6,26 M${f1(34 - tw)},-148 q-10,12 -4,26 M${f1(-14 + tw)},-104 q8,-4 16,0`} stroke={mixColor(C.shirt, '#000000', 0.28)} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />
      <path d="M-20,-160 Q0,-146 20,-160" stroke={mixColor(C.shirt, '#000000', 0.25)} strokeWidth={4} fill="none" />
      <path d={`M${f1(-10 + tw)},-124 L${f1(tw)},-114 L${f1(14 + tw)},-132`} stroke="#ffffff" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.5} />
      <Rim c={{x: 0, y: -116}} r={52} k={p.rimK * 0.8} color={p.rimColor} from={-2.6} to={-1.4} />
      {p.belt > 0.01 && (
        <g opacity={p.belt}>
          <rect x={-48} y={-84} width={96} height={14} rx={6} fill="#8a5a2a" stroke={C.outline} strokeWidth={3} />
          <rect x={14} y={-82} width={22} height={26} rx={4} fill="#a8743a" stroke={C.outline} strokeWidth={3} />
          <rect x={-34} y={-82} width={18} height={22} rx={4} fill="#a8743a" stroke={C.outline} strokeWidth={3} />
          <path d="M-26,-84 L-26,-98" stroke="#7a8a9a" strokeWidth={5} strokeLinecap="round" />
          <circle cx={25} cy={-90} r={6} fill="#f2e2a8" stroke={C.outline} strokeWidth={2} />
        </g>
      )}
      <NeckShade x={head.x * 0.5} y={-158} w={40} />
      {/* cabeza */}
      <g transform={`rotate(${f1((p.headTilt * 180) / Math.PI)} 0 -168)`}>
        <ellipse cx={head.x - 40 - fx * 0.3} cy={head.y - 58} rx={15} ry={20} fill={`url(#${id}-fur)`} stroke={C.outline} strokeWidth={4} />
        <ellipse cx={head.x + 40 - fx * 0.3} cy={head.y - 58} rx={15} ry={20} fill={`url(#${id}-fur)`} stroke={C.outline} strokeWidth={4} />
        <ellipse cx={head.x - 40 - fx * 0.3} cy={head.y - 56} rx={7} ry={11} fill="#f2a98a" />
        <ellipse cx={head.x + 40 - fx * 0.3} cy={head.y - 56} rx={7} ry={11} fill="#f2a98a" />
        <FurTufts c={head} r={62} color={C.fur} n={7} from={0.2} to={1.1} />
        <FurTufts c={head} r={62} color={C.fur} n={7} from={2.05} to={2.95} />
        <circle cx={head.x} cy={head.y} r={66} fill={`url(#${id}-fur)`} stroke={C.outline} strokeWidth={4} />
        <path d={`M${f1(head.x - 8)},${f1(head.y - 66)} q6,-16 18,-8 q-4,6 -2,12`} fill={C.fur} stroke={C.outline} strokeWidth={3} />
        <Rim c={head} r={66} k={p.rimK} color={p.rimColor} />
        <Rim c={head} r={66} k={0.12} color="#2a1630" from={0.5} to={2.6} />
        <ellipse cx={head.x + fx} cy={head.y + 26} rx={40} ry={30} fill={C.cream} />
        <path d={`M${f1(head.x + fx - 34)},${f1(head.y + 18)} q-6,10 2,16 M${f1(head.x + fx + 34)},${f1(head.y + 18)} q6,10 -2,16`} stroke={mixColor(C.cream, C.fur, 0.5)} strokeWidth={3} fill="none" strokeLinecap="round" />
        <ellipse cx={head.x - 40 + 10 * turn} cy={head.y + 14} rx={13} ry={8} fill="#ff8a8a" opacity={0.2 + 0.4 * e.cheeks} />
        <ellipse cx={head.x + 40 + 10 * turn} cy={head.y + 14} rx={13} ry={8} fill="#ff8a8a" opacity={0.2 + 0.4 * e.cheeks} />
        <Eye2 c={{x: head.x - 24 + fx, y: head.y - 8}} r={21} iris={C.eye} look={e.look} blink={e.blink} lid={C.fur} outline={C.outline} brow={e.brow + e.browL} mode={e.eyes} side={-1} />
        <Eye2 c={{x: head.x + 24 + fx, y: head.y - 8}} r={21} iris={C.eye} look={e.look} blink={e.blink} lid={C.fur} outline={C.outline} brow={e.brow + e.browR} mode={e.eyes} side={1} />
        <path d={`M${f1(head.x + fx * 1.15 - 9)},${f1(head.y + 13)} Q${f1(head.x + fx * 1.15)},${f1(head.y + 10)} ${f1(head.x + fx * 1.15 + 9)},${f1(head.y + 13)} L${f1(head.x + fx * 1.15)},${f1(head.y + 24)}Z`} fill={C.nose} stroke={C.outline} strokeWidth={2.5} strokeLinejoin="round" />
        <circle cx={head.x + fx * 1.15 - 3} cy={head.y + 14} r={2.2} fill="#ffffff" opacity={0.7} />
        <Mouth2 c={{x: head.x + fx * 1.15, y: head.y + 34}} w={30} kind={e.mouth} open={e.mouthOpen} outline={C.outline} />
        <Helmet c={{x: head.x, y: head.y - 6}} r={92} ring="#22b8b0" k={p.helmet} />
      </g>
      <Arm o={{x: 38 - tw, y: -142}} limb={p.armR} l1={30} l2={28} w1={17} w2={15} color={C.fur} outline={C.outline} sleeve={{color: C.shirt, len: 16}} grip={p.gripR} hold={p.holdR} side={1} handR={12} />
    </Body>
  );
};

