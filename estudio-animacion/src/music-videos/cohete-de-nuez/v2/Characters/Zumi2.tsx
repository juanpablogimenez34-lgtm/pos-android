// ZUMI 2.0 — el mismo extraterrestre amigable (verde menta, dos antenas, tres dedos) con manos de
// tres dedos que agarran, ojos expresivos, cejas, mejillas, manchitas en la piel y luz de contorno.
import React from 'react';
import {f1, LimbShape, SoftShade, Vec2} from '../../Characters/parts';
import {ZUMI_COLORS} from '../../Characters/Zumi';
import {Eye2, Mouth2, Pose2, Rim} from '../rig';
import {Arm, Body} from './common';

export type Zumi2Pose = Pose2 & {antL: {a: number; bend: number}; antR: {a: number; bend: number}};
const C = ZUMI_COLORS;

const Antenna: React.FC<{base: Vec2; a: number; bend: number; t: number}> = ({base, a, bend, t}) => {
  const L = 58;
  const mid = {x: base.x + Math.sin(a) * L * 0.5, y: base.y - Math.cos(a) * L * 0.5};
  const tip = {x: mid.x + Math.sin(a + bend) * L * 0.5, y: mid.y - Math.cos(a + bend) * L * 0.5};
  return (
    <g>
      <path d={`M${f1(base.x)},${f1(base.y)} Q${f1(mid.x)},${f1(mid.y)} ${f1(tip.x)},${f1(tip.y)}`} stroke={C.outline} strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d={`M${f1(base.x)},${f1(base.y)} Q${f1(mid.x)},${f1(mid.y)} ${f1(tip.x)},${f1(tip.y)}`} stroke={C.skin} strokeWidth={4} fill="none" strokeLinecap="round" />
      <circle cx={tip.x} cy={tip.y} r={20} fill={C.antenna} opacity={0.18 + 0.12 * Math.sin(t * 4)} />
      <circle cx={tip.x} cy={tip.y} r={10} fill={C.antenna} stroke={C.outline} strokeWidth={3} />
      <circle cx={tip.x - 3} cy={tip.y - 3} r={3} fill="#ffffff" />
    </g>
  );
};

export const Zumi2: React.FC<{p: Zumi2Pose; id?: string}> = ({p, id = 'zumi2'}) => {
  const turn = p.headTurn;
  const head: Vec2 = {x: 5 * turn, y: -140};
  const e = p.expr;
  const fx = 12 * turn;
  const foot = (pp: Vec2) => <ellipse cx={pp.x + 4} cy={pp.y + 1} rx={14} ry={8} fill={C.skin} stroke={C.outline} strokeWidth={3} />;
  return (
    <Body p={p} pivot={-40} shadowW={50}>
      <defs>
        <SoftShade id={`${id}-skin`} base={C.skin} />
      </defs>
      <LimbShape o={{x: -12, y: -34}} limb={p.legL} l1={16} l2={16} w1={15} w2={13} color={C.skin} outline={C.outline} end={foot} />
      <LimbShape o={{x: 12, y: -34}} limb={p.legR} l1={16} l2={16} w1={15} w2={13} color={C.skin} outline={C.outline} end={foot} />
      <Arm o={{x: -30, y: -70}} limb={p.armL} l1={18} l2={16} w1={13} w2={12} color={C.skin} outline={C.outline} grip={p.gripL} hold={p.holdL} side={-1} fingers={3} handR={9} />
      <ellipse cx={0} cy={-58} rx={36} ry={34} fill={`url(#${id}-skin)`} stroke={C.outline} strokeWidth={4} />
      <ellipse cx={2} cy={-52} rx={22} ry={20} fill={C.belly} opacity={0.8} />
      <Rim c={{x: 0, y: -58}} r={35} k={p.rimK} color={p.rimColor} />
      <g transform={`rotate(${f1((p.headTilt * 180) / Math.PI)} 0 -88)`}>
        <Antenna base={{x: head.x - 22, y: head.y - 50}} a={p.antL.a} bend={p.antL.bend} t={p.t} />
        <Antenna base={{x: head.x + 22, y: head.y - 50}} a={p.antR.a} bend={p.antR.bend} t={p.t + 1} />
        <ellipse cx={head.x} cy={head.y} rx={62} ry={56} fill={`url(#${id}-skin)`} stroke={C.outline} strokeWidth={4} />
        {[[-40, -26, 5], [-30, -38, 3.5], [44, -20, 4]].map(([x, y, r], i) => (
          <circle key={i} cx={head.x + x} cy={head.y + y} r={r} fill="#5cc89e" opacity={0.6} />
        ))}
        <Rim c={head} r={58} k={p.rimK} color={p.rimColor} />
        <ellipse cx={head.x - 36 + 10 * turn} cy={head.y + 18} rx={11} ry={7} fill="#ff9ab8" opacity={0.3 + 0.35 * e.cheeks} />
        <ellipse cx={head.x + 36 + 10 * turn} cy={head.y + 18} rx={11} ry={7} fill="#ff9ab8" opacity={0.3 + 0.35 * e.cheeks} />
        <Eye2 c={{x: head.x - 21 + fx, y: head.y - 4}} r={23} iris={C.eye} look={e.look} blink={e.blink} lid={C.skin} outline={C.outline} brow={e.brow + e.browL} mode={e.eyes} side={-1} />
        <Eye2 c={{x: head.x + 21 + fx, y: head.y - 4}} r={23} iris={C.eye} look={e.look} blink={e.blink} lid={C.skin} outline={C.outline} brow={e.brow + e.browR} mode={e.eyes} side={1} />
        <Mouth2 c={{x: head.x + fx * 1.15, y: head.y + 30}} w={22} kind={e.mouth} open={e.mouthOpen} outline={C.outline} />
      </g>
      <Arm o={{x: 30, y: -70}} limb={p.armR} l1={18} l2={16} w1={13} w2={12} color={C.skin} outline={C.outline} grip={p.gripR} hold={p.holdR} side={1} fingers={3} handR={9} />
    </Body>
  );
};
