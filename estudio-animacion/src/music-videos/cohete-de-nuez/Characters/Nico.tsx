// FICHA — NICO, la ardilla inventora.
// Pelaje marrón anaranjado, vientre crema, cabeza redondeada, ojos grandes color avellana,
// orejas pequeñas, nariz triangular, cola grande y esponjosa (animación secundaria propia),
// camiseta turquesa, pantalón corto, cinturón de herramientas (construcción) y casco (viaje).
import React from 'react';
import {mixColor} from '../../../engine/math';
import {BasePose, Eye, f1, GroundShadow, Helmet, LimbShape, Mouth, SoftShade, Vec2} from './parts';

export const NICO_COLORS = {fur: '#d9772b', furDark: '#a8531a', cream: '#f6e2c0', shirt: '#22b8b0', shorts: '#3d5a8a', eye: '#9a6a2a', outline: '#4a2412', nose: '#4a2412'};

export type NicoPose = BasePose & {
  tail: {sway: number; curl: number}; // −1…1 balanceo y enroscado (animación secundaria)
  belt: number; // 0–1 cinturón de herramientas
  prop: 'none' | 'scissors' | 'tape' | 'cardboard' | 'star';
};

const C = NICO_COLORS;

export const Nico: React.FC<{p: NicoPose; id?: string}> = ({p, id = 'nico'}) => {
  const turn = p.headTurn;
  const hip: Vec2 = {x: 0, y: -66};
  const shoulderL: Vec2 = {x: -38, y: -142};
  const shoulderR: Vec2 = {x: 38, y: -142};
  const head: Vec2 = {x: 6 * turn, y: -218};
  const paw = (pp: Vec2, a: number) => (
    <g>
      <ellipse cx={pp.x} cy={pp.y} rx={11} ry={10} fill={C.fur} stroke={C.outline} strokeWidth={3} transform={`rotate(${f1((-a * 180) / Math.PI)} ${f1(pp.x)} ${f1(pp.y)})`} />
      <circle cx={pp.x + Math.cos(a) * 9} cy={pp.y - Math.sin(a) * 9 - 2} r={4.5} fill={C.fur} stroke={C.outline} strokeWidth={2.5} />
    </g>
  );
  const foot = (pp: Vec2) => <ellipse cx={pp.x + 8} cy={pp.y + 2} rx={18} ry={9} fill={C.furDark} stroke={C.outline} strokeWidth={3} />;
  // cola: curva en S de círculos esponjosos (balanceo con retraso y enroscado)
  const tailPts: Vec2[] = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    const sway = p.tail.sway * Math.sin(u * 2.2) * 40;
    const curl = p.tail.curl * Math.max(0, u - 0.6) * 90;
    tailPts.push({x: -40 - u * 45 + Math.sin(u * Math.PI * 1.1) * -30 + sway + curl, y: -70 - u * 190 + Math.sin(u * Math.PI) * 10});
  }
  const sx = 1 + p.squash;
  const sy = 1 - p.squash;
  const prop = (() => {
    const hand = {x: 38 + Math.sin(p.armR.a) * 30 + Math.sin(p.armR.a + p.armR.b) * 28, y: -142 + Math.cos(p.armR.a) * 30 + Math.cos(p.armR.a + p.armR.b) * 28};
    if (p.prop === 'scissors')
      return (
        <g transform={`translate(${f1(hand.x)} ${f1(hand.y)}) rotate(-30)`}>
          <circle cx={-8} cy={6} r={7} fill="none" stroke="#e8463c" strokeWidth={4} />
          <circle cx={8} cy={6} r={7} fill="none" stroke="#e8463c" strokeWidth={4} />
          <path d="M-4,0 L6,-30 M4,0 L-2,-30" stroke="#b8c4d0" strokeWidth={5} strokeLinecap="round" />
        </g>
      );
    if (p.prop === 'tape') return <g transform={`translate(${f1(hand.x)} ${f1(hand.y)})`}><circle r={13} fill="#f2e2a8" stroke={C.outline} strokeWidth={3} /><circle r={6} fill="#ffffff" stroke={C.outline} strokeWidth={2} /></g>;
    if (p.prop === 'cardboard') return <rect x={hand.x - 6} y={hand.y - 46} width={58} height={62} rx={4} fill="#c79a5e" stroke="#7a5428" strokeWidth={3} transform={`rotate(12 ${f1(hand.x)} ${f1(hand.y)})`} />;
    if (p.prop === 'star') return <path transform={`translate(${f1(hand.x)} ${f1(hand.y - 10)}) scale(0.9)`} d="M0,-18 L5,-5 L19,-5 L8,3 L12,17 L0,9 L-12,17 L-8,3 L-19,-5 L-5,-5Z" fill="#ffd23f" stroke="#c98a1a" strokeWidth={2.5} />;
    return null;
  })();
  return (
    <g transform={`translate(${f1(p.x)} ${f1(p.y)}) scale(${f1(p.scale * p.facing)} ${f1(p.scale)})`} opacity={p.opacity}>
      <defs>
        <SoftShade id={`${id}-fur`} base={C.fur} />
        <SoftShade id={`${id}-shirt`} base={C.shirt} />
        <linearGradient id={`${id}-tail`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={C.furDark} />
          <stop offset="0.7" stopColor={C.fur} />
          <stop offset="1" stopColor={mixColor(C.fur, C.cream, 0.6)} />
        </linearGradient>
      </defs>
      <GroundShadow w={70} />
      <g transform={`translate(0 ${f1(p.bob)}) rotate(${f1((p.lean * 180) / Math.PI)} 0 -66) scale(${f1(sx)} ${f1(sy)})`}>
        {/* cola grande y esponjosa (detrás del cuerpo) */}
        <g>
          {tailPts.map((q, i) => (
            <circle key={`o${i}`} cx={q.x} cy={q.y} r={30 + Math.sin((i / 12) * Math.PI) * 26} fill={C.outline} />
          ))}
          {tailPts.map((q, i) => (
            <circle key={`f${i}`} cx={q.x} cy={q.y} r={27 + Math.sin((i / 12) * Math.PI) * 26} fill={`url(#${id}-tail)`} />
          ))}
          {tailPts.slice(3).map((q, i) => (
            <path key={`s${i}`} d={`M${f1(q.x - 14)},${f1(q.y + 6)} q10,-8 22,-2`} stroke={C.furDark} strokeWidth={3} fill="none" opacity={0.45} />
          ))}
        </g>
        {/* piernas y brazo trasero */}
        <LimbShape o={{x: -16, y: hip.y}} limb={p.legL} l1={34} l2={32} w1={22} w2={18} color={C.fur} outline={C.outline} end={(pp) => foot(pp)} sleeve={{color: C.shorts, len: 22}} />
        <LimbShape o={{x: 16, y: hip.y}} limb={p.legR} l1={34} l2={32} w1={22} w2={18} color={C.fur} outline={C.outline} end={(pp) => foot(pp)} sleeve={{color: C.shorts, len: 22}} />
        <LimbShape o={shoulderL} limb={p.armL} l1={30} l2={28} w1={17} w2={15} color={C.fur} outline={C.outline} end={paw} sleeve={{color: C.shirt, len: 16}} />
        {/* cuerpo: pantalón corto, camiseta turquesa y vientre crema */}
        <path d="M-44,-80 Q-46,-56 -20,-54 L20,-54 Q46,-56 44,-80Z" fill={C.shorts} stroke={C.outline} strokeWidth={4} />
        <clipPath id={`${id}-shirtclip`}>
          <rect x={-60} y={-180} width={120} height={84} />
        </clipPath>
        {/* vientre crema que asoma bajo la camiseta */}
        <ellipse cx={0} cy={-116} rx={50} ry={54} fill={C.cream} stroke={C.outline} strokeWidth={4} />
        <ellipse cx={0} cy={-116} rx={50} ry={54} fill={`url(#${id}-shirt)`} clipPath={`url(#${id}-shirtclip)`} />
        <path d="M-47,-96 Q0,-90 47,-96" stroke={C.outline} strokeWidth={4} fill="none" />
        <ellipse cx={0} cy={-116} rx={50} ry={54} fill="none" stroke={C.outline} strokeWidth={4} />
        <path d="M-20,-160 Q0,-146 20,-160" stroke={mixColor(C.shirt, '#000000', 0.25)} strokeWidth={4} fill="none" />
        <path d="M-10,-120 L0,-110 L14,-128" stroke="#ffffff" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.5} />
        {/* cinturón de herramientas */}
        {p.belt > 0.01 && (
          <g opacity={p.belt}>
            <rect x={-48} y={-84} width={96} height={14} rx={6} fill="#8a5a2a" stroke={C.outline} strokeWidth={3} />
            <rect x={14} y={-82} width={22} height={26} rx={4} fill="#a8743a" stroke={C.outline} strokeWidth={3} />
            <rect x={-34} y={-82} width={18} height={22} rx={4} fill="#a8743a" stroke={C.outline} strokeWidth={3} />
            <path d="M-26,-84 L-26,-98" stroke="#7a8a9a" strokeWidth={5} strokeLinecap="round" />
            <circle cx={25} cy={-90} r={6} fill="#f2e2a8" stroke={C.outline} strokeWidth={2} />
          </g>
        )}
        {/* cabeza */}
        <g transform={`rotate(${f1((p.headTilt * 180) / Math.PI)} 0 -168)`}>
          <ellipse cx={head.x - 40} cy={head.y - 58} rx={15} ry={20} fill={`url(#${id}-fur)`} stroke={C.outline} strokeWidth={4} />
          <ellipse cx={head.x + 40} cy={head.y - 58} rx={15} ry={20} fill={`url(#${id}-fur)`} stroke={C.outline} strokeWidth={4} />
          <ellipse cx={head.x - 40} cy={head.y - 56} rx={7} ry={11} fill="#f2a98a" />
          <ellipse cx={head.x + 40} cy={head.y - 56} rx={7} ry={11} fill="#f2a98a" />
          <circle cx={head.x} cy={head.y} r={66} fill={`url(#${id}-fur)`} stroke={C.outline} strokeWidth={4} />
          <path d={`M${f1(head.x - 8)},${f1(head.y - 66)} q6,-16 18,-8 q-4,6 -2,12`} fill={C.fur} stroke={C.outline} strokeWidth={3} />
          {/* hocico y mejillas crema */}
          <ellipse cx={head.x + 14 * turn} cy={head.y + 26} rx={40} ry={30} fill={C.cream} />
          {p.expr.cheeks > 0.01 && (
            <>
              <ellipse cx={head.x - 40 + 10 * turn} cy={head.y + 14} rx={12} ry={7} fill="#ff8a8a" opacity={0.45 * p.expr.cheeks} />
              <ellipse cx={head.x + 40 + 10 * turn} cy={head.y + 14} rx={12} ry={7} fill="#ff8a8a" opacity={0.45 * p.expr.cheeks} />
            </>
          )}
          <Eye c={{x: head.x - 24 + 14 * turn, y: head.y - 8}} r={20} iris={C.eye} look={p.expr.look} blink={p.expr.blink} lid={C.fur} outline={C.outline} brow={p.expr.brow} side={-1} />
          <Eye c={{x: head.x + 24 + 14 * turn, y: head.y - 8}} r={20} iris={C.eye} look={p.expr.look} blink={p.expr.blink} lid={C.fur} outline={C.outline} brow={p.expr.brow} side={1} />
          <path d={`M${f1(head.x + 16 * turn - 8)},${f1(head.y + 14)} L${f1(head.x + 16 * turn + 8)},${f1(head.y + 14)} L${f1(head.x + 16 * turn)},${f1(head.y + 24)}Z`} fill={C.nose} stroke={C.outline} strokeWidth={2.5} strokeLinejoin="round" />
          <Mouth c={{x: head.x + 16 * turn, y: head.y + 34}} w={30} kind={p.expr.mouth} open={p.expr.mouthOpen} outline={C.outline} />
          <Helmet c={{x: head.x, y: head.y - 6}} r={92} ring="#22b8b0" k={p.helmet} />
        </g>
        {/* brazo delantero y objeto */}
        <LimbShape o={shoulderR} limb={p.armR} l1={30} l2={28} w1={17} w2={15} color={C.fur} outline={C.outline} end={paw} sleeve={{color: C.shirt, len: 16}} />
        {prop}
      </g>
    </g>
  );
};
