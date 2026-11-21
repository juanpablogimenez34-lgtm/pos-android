// FICHA — ZUMI, el extraterrestre amigable.
// Verde menta, cabeza redondeada, dos antenas flexibles (animación secundaria), ojos grandes y
// brillantes, boca pequeña y sonriente, brazos cortos con TRES dedos, piernas pequeñas y cuerpo
// suave. Nada aterrador: proporciones de bebé y colores suaves.
import React from 'react';
import {BasePose, Eye, f1, GroundShadow, LimbShape, Mouth, SoftShade, Vec2} from './parts';

export const ZUMI_COLORS = {skin: '#7fe0b8', belly: '#c6f6e2', eye: '#3a7af0', outline: '#1f4a3c', antenna: '#ff9ad5'};

export type ZumiPose = BasePose & {antL: {a: number; bend: number}; antR: {a: number; bend: number}};

const C = ZUMI_COLORS;

const Antenna: React.FC<{base: Vec2; a: number; bend: number; t: number}> = ({base, a, bend, t}) => {
  const L = 56;
  const mid = {x: base.x + Math.sin(a) * L * 0.5, y: base.y - Math.cos(a) * L * 0.5};
  const tip = {x: mid.x + Math.sin(a + bend) * L * 0.5, y: mid.y - Math.cos(a + bend) * L * 0.5};
  return (
    <g>
      <path d={`M${f1(base.x)},${f1(base.y)} Q${f1(mid.x)},${f1(mid.y)} ${f1(tip.x)},${f1(tip.y)}`} stroke={C.outline} strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d={`M${f1(base.x)},${f1(base.y)} Q${f1(mid.x)},${f1(mid.y)} ${f1(tip.x)},${f1(tip.y)}`} stroke={C.skin} strokeWidth={4} fill="none" strokeLinecap="round" />
      <circle cx={tip.x} cy={tip.y} r={10} fill={C.antenna} stroke={C.outline} strokeWidth={3} />
      <circle cx={tip.x} cy={tip.y} r={18} fill={C.antenna} opacity={0.18 + 0.12 * Math.sin(t * 4)} />
      <circle cx={tip.x - 3} cy={tip.y - 3} r={3} fill="#ffffff" />
    </g>
  );
};

export const Zumi: React.FC<{p: ZumiPose; id?: string}> = ({p, id = 'zumi'}) => {
  const turn = p.headTurn;
  const sx = 1 + p.squash;
  const sy = 1 - p.squash;
  const hand3 = (pp: Vec2, a: number) => (
    <g transform={`translate(${f1(pp.x)} ${f1(pp.y)}) rotate(${f1((-a * 180) / Math.PI)})`}>
      {[-0.6, 0, 0.6].map((d, i) => (
        <g key={i}>
          <path d={`M0,0 L${f1(Math.sin(d) * 14)},${f1(Math.cos(d) * 14)}`} stroke={C.outline} strokeWidth={9} strokeLinecap="round" />
          <path d={`M0,0 L${f1(Math.sin(d) * 14)},${f1(Math.cos(d) * 14)}`} stroke={C.skin} strokeWidth={5.5} strokeLinecap="round" />
        </g>
      ))}
      <circle r={8} fill={C.skin} stroke={C.outline} strokeWidth={3} />
    </g>
  );
  const foot = (pp: Vec2) => <ellipse cx={pp.x + 4} cy={pp.y + 1} rx={14} ry={8} fill={C.skin} stroke={C.outline} strokeWidth={3} />;
  const head: Vec2 = {x: 5 * turn, y: -140};
  return (
    <g transform={`translate(${f1(p.x)} ${f1(p.y)}) scale(${f1(p.scale * p.facing)} ${f1(p.scale)})`} opacity={p.opacity}>
      <defs>
        <SoftShade id={`${id}-skin`} base={C.skin} />
      </defs>
      <GroundShadow w={50} />
      <g transform={`translate(0 ${f1(p.bob)}) rotate(${f1((p.lean * 180) / Math.PI)} 0 -40) scale(${f1(sx)} ${f1(sy)})`}>
        <LimbShape o={{x: -12, y: -34}} limb={p.legL} l1={16} l2={16} w1={15} w2={13} color={C.skin} outline={C.outline} end={foot} />
        <LimbShape o={{x: 12, y: -34}} limb={p.legR} l1={16} l2={16} w1={15} w2={13} color={C.skin} outline={C.outline} end={foot} />
        <LimbShape o={{x: -30, y: -70}} limb={p.armL} l1={18} l2={16} w1={13} w2={12} color={C.skin} outline={C.outline} end={hand3} />
        <ellipse cx={0} cy={-58} rx={36} ry={34} fill={`url(#${id}-skin)`} stroke={C.outline} strokeWidth={4} />
        <ellipse cx={2} cy={-52} rx={22} ry={20} fill={C.belly} opacity={0.8} />
        <g transform={`rotate(${f1((p.headTilt * 180) / Math.PI)} 0 -88)`}>
          <Antenna base={{x: head.x - 22, y: head.y - 50}} a={p.antL.a} bend={p.antL.bend} t={p.t} />
          <Antenna base={{x: head.x + 22, y: head.y - 50}} a={p.antR.a} bend={p.antR.bend} t={p.t + 1} />
          <ellipse cx={head.x} cy={head.y} rx={62} ry={56} fill={`url(#${id}-skin)`} stroke={C.outline} strokeWidth={4} />
          <ellipse cx={head.x - 36 + 10 * turn} cy={head.y + 18} rx={10} ry={6} fill="#ff9ab8" opacity={0.45} />
          <ellipse cx={head.x + 36 + 10 * turn} cy={head.y + 18} rx={10} ry={6} fill="#ff9ab8" opacity={0.45} />
          <Eye c={{x: head.x - 21 + 12 * turn, y: head.y - 4}} r={22} iris={C.eye} look={p.expr.look} blink={p.expr.blink} lid={C.skin} outline={C.outline} brow={p.expr.brow} side={-1} />
          <Eye c={{x: head.x + 21 + 12 * turn, y: head.y - 4}} r={22} iris={C.eye} look={p.expr.look} blink={p.expr.blink} lid={C.skin} outline={C.outline} brow={p.expr.brow} side={1} />
          <Mouth c={{x: head.x + 14 * turn, y: head.y + 30}} w={22} kind={p.expr.mouth} open={p.expr.mouthOpen} outline={C.outline} />
        </g>
        <LimbShape o={{x: 30, y: -70}} limb={p.armR} l1={18} l2={16} w1={13} w2={12} color={C.skin} outline={C.outline} end={hand3} />
      </g>
    </g>
  );
};
