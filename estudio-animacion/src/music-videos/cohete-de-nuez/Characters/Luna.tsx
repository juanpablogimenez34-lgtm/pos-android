// FICHA — LUNA, la conejita exploradora.
// Pelaje blanco con detalles crema, orejas largas y flexibles (cada una con su propio ángulo y
// flexión), ojos grandes violeta, nariz rosada, mejillas suaves, jardinera violeta, camiseta
// amarilla, botitas y casco espacial con detalles lilas.
import React from 'react';
import {mixColor} from '../../../engine/math';
import {BasePose, Eye, f1, GroundShadow, Helmet, LimbShape, Mouth, SoftShade, Vec2} from './parts';

export const LUNA_COLORS = {fur: '#f8f6f2', cream: '#f1e1c6', overalls: '#8a5cc8', shirt: '#ffd23f', boots: '#d65a8a', eye: '#8b5cf0', nose: '#ff8fb0', outline: '#4a3050', inner: '#ffc2d4'};

export type LunaPose = BasePose & {
  earL: {a: number; bend: number}; // ángulo (rad, 0 = hacia arriba) y flexión de la punta
  earR: {a: number; bend: number};
  prop: 'none' | 'paper' | 'tape' | 'star' | 'tool';
};

const C = LUNA_COLORS;

const Ear: React.FC<{base: Vec2; a: number; bend: number; id: string; len?: number}> = ({base, a, bend, id, len = 1}) => {
  const L = 118 * len;
  const mid = {x: base.x + Math.sin(a) * L * 0.55, y: base.y - Math.cos(a) * L * 0.55};
  const a2 = a + bend;
  const tip = {x: mid.x + Math.sin(a2) * L * 0.45, y: mid.y - Math.cos(a2) * L * 0.45};
  const w = 22;
  const nx = (pp: Vec2, q: Vec2, k: number) => {
    const dx = q.x - pp.x;
    const dy = q.y - pp.y;
    const l = Math.hypot(dx, dy) || 1;
    return {x: (-dy / l) * k, y: (dx / l) * k};
  };
  const n1 = nx(base, mid, w);
  const n2 = nx(mid, tip, w * 0.8);
  const outer = `M${f1(base.x + n1.x)},${f1(base.y + n1.y)} Q${f1(mid.x + n1.x * 1.1)},${f1(mid.y + n1.y * 1.1)} ${f1(tip.x + n2.x * 0.4)},${f1(tip.y + n2.y * 0.4)} Q${f1(tip.x)},${f1(tip.y - 10)} ${f1(tip.x - n2.x * 0.4)},${f1(tip.y - n2.y * 0.4)} Q${f1(mid.x - n1.x * 1.1)},${f1(mid.y - n1.y * 1.1)} ${f1(base.x - n1.x)},${f1(base.y - n1.y)}Z`;
  const inner = `M${f1(base.x + n1.x * 0.45)},${f1(base.y + n1.y * 0.45)} Q${f1(mid.x + n1.x * 0.5)},${f1(mid.y + n1.y * 0.5)} ${f1(tip.x)},${f1(tip.y + 4)} Q${f1(mid.x - n1.x * 0.5)},${f1(mid.y - n1.y * 0.5)} ${f1(base.x - n1.x * 0.45)},${f1(base.y - n1.y * 0.45)}Z`;
  return (
    <g>
      <path d={outer} fill={`url(#${id}-fur)`} stroke={C.outline} strokeWidth={4} strokeLinejoin="round" />
      <path d={inner} fill={C.inner} />
    </g>
  );
};

export const Luna: React.FC<{p: LunaPose; id?: string}> = ({p, id = 'luna'}) => {
  const turn = p.headTurn;
  const hip: Vec2 = {x: 0, y: -64};
  const head: Vec2 = {x: 6 * turn, y: -210};
  const hand = (pp: Vec2) => <circle cx={pp.x} cy={pp.y} r={10} fill={C.fur} stroke={C.outline} strokeWidth={3} />;
  const boot = (pp: Vec2) => (
    <g>
      <ellipse cx={pp.x + 6} cy={pp.y + 1} rx={18} ry={10} fill={C.boots} stroke={C.outline} strokeWidth={3} />
      <path d={`M${f1(pp.x - 9)},${f1(pp.y - 6)} L${f1(pp.x + 9)},${f1(pp.y - 6)}`} stroke="#ffffff" strokeWidth={3} opacity={0.6} />
    </g>
  );
  const sx = 1 + p.squash;
  const sy = 1 - p.squash;
  const handR = {x: 36 + Math.sin(p.armR.a) * 29 + Math.sin(p.armR.a + p.armR.b) * 27, y: -138 + Math.cos(p.armR.a) * 29 + Math.cos(p.armR.a + p.armR.b) * 27};
  const prop =
    p.prop === 'paper' ? (
      <g transform={`translate(${f1(handR.x)} ${f1(handR.y)}) rotate(-15)`}>
        <rect x={-4} y={-40} width={44} height={52} fill="#ff9ad5" stroke="#b0457e" strokeWidth={3} />
        <path d="M6,-28 L30,-28 M6,-16 L26,-16" stroke="#ffffff" strokeWidth={3} strokeDasharray="5 4" />
      </g>
    ) : p.prop === 'tape' ? (
      <g transform={`translate(${f1(handR.x)} ${f1(handR.y)})`}>
        <circle r={13} fill="#f2e2a8" stroke={C.outline} strokeWidth={3} />
        <circle r={6} fill="#ffffff" stroke={C.outline} strokeWidth={2} />
        <path d="M10,-4 L40,-16" stroke="#f2e2a8" strokeWidth={10} opacity={0.8} />
      </g>
    ) : p.prop === 'star' ? (
      <path transform={`translate(${f1(handR.x)} ${f1(handR.y - 10)})`} d="M0,-18 L5,-5 L19,-5 L8,3 L12,17 L0,9 L-12,17 L-8,3 L-19,-5 L-5,-5Z" fill="#ffd23f" stroke="#c98a1a" strokeWidth={2.5} />
    ) : p.prop === 'tool' ? (
      <g transform={`translate(${f1(handR.x)} ${f1(handR.y)}) rotate(-35)`}>
        <rect x={-4} y={-36} width={8} height={36} rx={3} fill="#7a8a9a" />
        <rect x={-7} y={-2} width={14} height={20} rx={4} fill="#e8463c" stroke={C.outline} strokeWidth={2} />
      </g>
    ) : null;
  return (
    <g transform={`translate(${f1(p.x)} ${f1(p.y)}) scale(${f1(p.scale * p.facing)} ${f1(p.scale)})`} opacity={p.opacity}>
      <defs>
        <SoftShade id={`${id}-fur`} base={C.fur} light={0.2} dark={0.18} />
        <SoftShade id={`${id}-ov`} base={C.overalls} />
      </defs>
      <GroundShadow w={66} />
      <g transform={`translate(0 ${f1(p.bob)}) rotate(${f1((p.lean * 180) / Math.PI)} 0 -64) scale(${f1(sx)} ${f1(sy)})`}>
        {/* colita redonda */}
        <circle cx={-46} cy={-78} r={18} fill={`url(#${id}-fur)`} stroke={C.outline} strokeWidth={3.5} />
        <LimbShape o={{x: -15, y: hip.y}} limb={p.legL} l1={32} l2={30} w1={20} w2={17} color={C.fur} outline={C.outline} end={boot} sleeve={{color: C.overalls, len: 20}} />
        <LimbShape o={{x: 15, y: hip.y}} limb={p.legR} l1={32} l2={30} w1={20} w2={17} color={C.fur} outline={C.outline} end={boot} sleeve={{color: C.overalls, len: 20}} />
        <LimbShape o={{x: -36, y: -138}} limb={p.armL} l1={29} l2={27} w1={16} w2={14} color={C.fur} outline={C.outline} end={hand} sleeve={{color: C.shirt, len: 14}} />
        {/* camiseta amarilla y jardinera violeta */}
        <ellipse cx={0} cy={-112} rx={47} ry={52} fill={C.shirt} stroke={C.outline} strokeWidth={4} />
        <path d="M-40,-118 L40,-118 L44,-80 Q46,-58 20,-56 L-20,-56 Q-46,-58 -44,-80Z" fill={`url(#${id}-ov)`} stroke={C.outline} strokeWidth={4} strokeLinejoin="round" />
        <path d="M-28,-118 L-22,-158 M28,-118 L22,-158" stroke={C.overalls} strokeWidth={9} strokeLinecap="round" />
        <circle cx={-26} cy={-118} r={5} fill="#ffd23f" stroke={C.outline} strokeWidth={2} />
        <circle cx={26} cy={-118} r={5} fill="#ffd23f" stroke={C.outline} strokeWidth={2} />
        <rect x={-14} y={-108} width={28} height={20} rx={5} fill={mixColor(C.overalls, '#ffffff', 0.2)} stroke={C.outline} strokeWidth={2.5} />
        <path d="M-6,-100 L0,-94 L8,-104" stroke="#ffd23f" strokeWidth={3} fill="none" />
        {/* cabeza con orejas independientes */}
        <g transform={`rotate(${f1((p.headTilt * 180) / Math.PI)} 0 -160)`}>
          {/* con el casco puesto, las orejas se pliegan hacia atrás dentro de la burbuja */}
          <Ear base={{x: head.x - 26, y: head.y - 48}} a={p.earL.a * (1 - p.helmet) - 1.0 * p.helmet} bend={p.earL.bend * (1 - p.helmet) - 1.2 * p.helmet} id={id} len={1 - 0.45 * p.helmet} />
          <Ear base={{x: head.x + 26, y: head.y - 48}} a={p.earR.a * (1 - p.helmet) + 1.0 * p.helmet} bend={p.earR.bend * (1 - p.helmet) + 1.2 * p.helmet} id={id} len={1 - 0.45 * p.helmet} />
          <circle cx={head.x} cy={head.y} r={62} fill={`url(#${id}-fur)`} stroke={C.outline} strokeWidth={4} />
          <ellipse cx={head.x + 12 * turn} cy={head.y + 24} rx={36} ry={26} fill={C.cream} opacity={0.7} />
          <ellipse cx={head.x - 38 + 10 * turn} cy={head.y + 14} rx={12} ry={7} fill="#ff9ab8" opacity={0.5 * p.expr.cheeks + 0.15} />
          <ellipse cx={head.x + 38 + 10 * turn} cy={head.y + 14} rx={12} ry={7} fill="#ff9ab8" opacity={0.5 * p.expr.cheeks + 0.15} />
          <Eye c={{x: head.x - 23 + 13 * turn, y: head.y - 8}} r={20} iris={C.eye} look={p.expr.look} blink={p.expr.blink} lid={C.fur} outline={C.outline} brow={p.expr.brow} side={-1} />
          <Eye c={{x: head.x + 23 + 13 * turn, y: head.y - 8}} r={20} iris={C.eye} look={p.expr.look} blink={p.expr.blink} lid={C.fur} outline={C.outline} brow={p.expr.brow} side={1} />
          <ellipse cx={head.x + 15 * turn} cy={head.y + 15} rx={8} ry={6} fill={C.nose} stroke={C.outline} strokeWidth={2.5} />
          <Mouth c={{x: head.x + 15 * turn, y: head.y + 30}} w={28} kind={p.expr.mouth} open={p.expr.mouthOpen} outline={C.outline} />
          <Helmet c={{x: head.x, y: head.y - 8}} r={96} ring="#b98ae8" k={p.helmet} />
        </g>
        <LimbShape o={{x: 36, y: -138}} limb={p.armR} l1={29} l2={27} w1={16} w2={14} color={C.fur} outline={C.outline} end={hand} sleeve={{color: C.shirt, len: 14}} />
        {prop}
      </g>
    </g>
  );
};
