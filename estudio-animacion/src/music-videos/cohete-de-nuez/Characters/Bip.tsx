// FICHA — BIP, el robot.
// Cuerpo redondeado amarillo y azul, pantalla facial con ojos expresivos (o números),
// brazos mecánicos articulados con pinzas, dos piernas cortas, antena luminosa y panel frontal
// con luces que pueden latir al ritmo.
import React from 'react';
import {mixColor} from '../../../engine/math';
import {BasePose, f1, GroundShadow, Helmet, LimbShape, SoftShade, Vec2} from './parts';

export const BIP_COLORS = {body: '#ffc93c', blue: '#2f6fd6', screen: '#12233f', glow: '#7ff3ff', outline: '#2a2440', light: ['#ff5d73', '#4dd88a', '#ffd23f']};

export type BipScreen = {mode: 'face' | 'number' | 'text' | 'heart'; value: string; face: 'happy' | 'wow' | 'wink' | 'love' | 'focus' | 'oops'};
export type BipPose = BasePose & {screen: BipScreen; lights: number; antenna: number; prop: 'none' | 'box' | 'tape' | 'camera' | 'wrench'};

const C = BIP_COLORS;

const Screen: React.FC<{c: Vec2; w: number; h: number; s: BipScreen; blink: number; t: number}> = ({c, w, h, s, blink, t}) => {
  const eyes = () => {
    const ey = c.y - 4;
    const ex = w * 0.2;
    const shape = (x: number, side: number) => {
      if (s.face === 'wow') return <circle cx={x} cy={ey} r={13} fill="none" stroke={C.glow} strokeWidth={5} />;
      if (s.face === 'love') return <path transform={`translate(${f1(x)} ${f1(ey)}) scale(0.9)`} d="M0,10 C-18,-4 -10,-18 0,-8 C10,-18 18,-4 0,10Z" fill="#ff7ab0" />;
      if (s.face === 'wink' && side > 0) return <path d={`M${f1(x - 12)},${f1(ey)} q12,-10 24,0`} stroke={C.glow} strokeWidth={5} fill="none" strokeLinecap="round" />;
      if (s.face === 'focus') return <rect x={x - 12} y={ey - 4} width={24} height={8} rx={4} fill={C.glow} />;
      if (s.face === 'oops') return <path d={`M${f1(x - 9)},${f1(ey - 9)} l18,18 M${f1(x + 9)},${f1(ey - 9)} l-18,18`} stroke={C.glow} strokeWidth={5} strokeLinecap="round" />;
      return <ellipse cx={x} cy={ey} rx={10} ry={13 * (1 - blink * 0.9)} fill={C.glow} />;
    };
    const mouth = s.face === 'wow' || s.face === 'oops' ? <ellipse cx={c.x} cy={c.y + 20} rx={8} ry={6} fill="none" stroke={C.glow} strokeWidth={4} /> : <path d={`M${f1(c.x - 16)},${f1(c.y + 16)} q16,${s.face === 'focus' ? 0 : 12} 32,0`} stroke={C.glow} strokeWidth={4} fill="none" strokeLinecap="round" />;
    return (
      <g>
        {shape(c.x - ex, -1)}
        {shape(c.x + ex, 1)}
        {mouth}
      </g>
    );
  };
  return (
    <g>
      <rect x={c.x - w / 2} y={c.y - h / 2} width={w} height={h} rx={22} fill={C.screen} stroke={C.outline} strokeWidth={4} />
      <rect x={c.x - w / 2 + 6} y={c.y - h / 2 + 6} width={w - 12} height={h * 0.3} rx={14} fill="#ffffff" opacity={0.08} />
      {/* líneas de barrido de la pantalla */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={c.x - w / 2 + 8} x2={c.x + w / 2 - 8} y1={c.y - h / 2 + 10 + ((i * 14 + t * 30) % (h - 16))} y2={c.y - h / 2 + 10 + ((i * 14 + t * 30) % (h - 16))} stroke={C.glow} strokeOpacity={0.06} strokeWidth={2} />
      ))}
      {s.mode === 'face' && eyes()}
      {s.mode === 'number' && (
        <text x={c.x} y={c.y + 22} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={62} fill={C.glow}>
          {s.value}
        </text>
      )}
      {s.mode === 'text' && (
        <text x={c.x} y={c.y + 10} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={28} fill={C.glow}>
          {s.value}
        </text>
      )}
      {s.mode === 'heart' && <path transform={`translate(${f1(c.x)} ${f1(c.y)}) scale(2)`} d="M0,10 C-18,-4 -10,-18 0,-8 C10,-18 18,-4 0,10Z" fill="#ff7ab0" />}
    </g>
  );
};

export const Bip: React.FC<{p: BipPose; id?: string}> = ({p, id = 'bip'}) => {
  const turn = p.headTurn;
  const sx = 1 + p.squash;
  const sy = 1 - p.squash;
  const claw = (pp: Vec2, a: number) => (
    <g transform={`translate(${f1(pp.x)} ${f1(pp.y)}) rotate(${f1((-a * 180) / Math.PI)})`}>
      <circle r={8} fill={C.blue} stroke={C.outline} strokeWidth={3} />
      <path d="M-6,4 Q-12,16 -4,22 M6,4 Q12,16 4,22" stroke={C.outline} strokeWidth={6} strokeLinecap="round" fill="none" />
      <path d="M-6,4 Q-12,16 -4,22 M6,4 Q12,16 4,22" stroke="#9fb4d8" strokeWidth={3} strokeLinecap="round" fill="none" />
    </g>
  );
  const foot = (pp: Vec2) => <rect x={pp.x - 16} y={pp.y - 6} width={34} height={14} rx={7} fill={C.blue} stroke={C.outline} strokeWidth={3} />;
  const head: Vec2 = {x: 4 * turn, y: -176};
  const glowK = 0.5 + 0.5 * p.antenna;
  const handR = {x: 44 + Math.sin(p.armR.a) * 24 + Math.sin(p.armR.a + p.armR.b) * 24, y: -104 + Math.cos(p.armR.a) * 24 + Math.cos(p.armR.a + p.armR.b) * 24};
  return (
    <g transform={`translate(${f1(p.x)} ${f1(p.y)}) scale(${f1(p.scale * p.facing)} ${f1(p.scale)})`} opacity={p.opacity}>
      <defs>
        <SoftShade id={`${id}-body`} base={C.body} />
        <SoftShade id={`${id}-blue`} base={C.blue} />
      </defs>
      <GroundShadow w={58} />
      <g transform={`translate(0 ${f1(p.bob)}) rotate(${f1((p.lean * 180) / Math.PI)} 0 -40) scale(${f1(sx)} ${f1(sy)})`}>
        <LimbShape o={{x: -16, y: -36}} limb={p.legL} l1={18} l2={16} w1={12} w2={11} color={'#9fb4d8'} outline={C.outline} end={foot} />
        <LimbShape o={{x: 16, y: -36}} limb={p.legR} l1={18} l2={16} w1={12} w2={11} color={'#9fb4d8'} outline={C.outline} end={foot} />
        <LimbShape o={{x: -44, y: -104}} limb={p.armL} l1={24} l2={24} w1={11} w2={10} color={'#9fb4d8'} outline={C.outline} end={claw} />
        {/* cuerpo redondeado con panel de luces */}
        <ellipse cx={0} cy={-88} rx={52} ry={56} fill={`url(#${id}-body)`} stroke={C.outline} strokeWidth={4} />
        <rect x={-30} y={-104} width={60} height={42} rx={12} fill={`url(#${id}-blue)`} stroke={C.outline} strokeWidth={3} />
        {C.light.map((c, i) => {
          const on = 0.35 + 0.65 * Math.max(0, Math.sin(p.t * 6 + i * 2.1)) * p.lights;
          return (
            <g key={i}>
              <circle cx={-16 + i * 16} cy={-90} r={6} fill={mixColor('#333344', c, on)} stroke={C.outline} strokeWidth={2} />
              {on > 0.6 && <circle cx={-16 + i * 16} cy={-90} r={12} fill={c} opacity={0.25 * on} />}
            </g>
          );
        })}
        <rect x={-18} y={-76} width={36} height={6} rx={3} fill={C.glow} opacity={0.4 + 0.5 * p.lights} />
        {/* cuello y cabeza-pantalla */}
        <rect x={-10} y={-148} width={20} height={14} rx={4} fill="#9fb4d8" stroke={C.outline} strokeWidth={3} />
        <g transform={`rotate(${f1((p.headTilt * 180) / Math.PI)} 0 -140)`}>
          <path d={`M${f1(head.x)},${f1(head.y - 42)} L${f1(head.x + 4)},${f1(head.y - 72)}`} stroke={C.outline} strokeWidth={5} />
          <circle cx={head.x + 4} cy={head.y - 76} r={9} fill={mixColor('#ff9a3c', '#ffe8a0', glowK)} stroke={C.outline} strokeWidth={3} />
          <circle cx={head.x + 4} cy={head.y - 76} r={20} fill="#ffd27a" opacity={0.35 * glowK} />
          <rect x={head.x - 58} y={head.y - 44} width={116} height={88} rx={30} fill={`url(#${id}-body)`} stroke={C.outline} strokeWidth={4} />
          <rect x={head.x - 64} y={head.y - 12} width={12} height={26} rx={5} fill={C.blue} stroke={C.outline} strokeWidth={3} />
          <rect x={head.x + 52} y={head.y - 12} width={12} height={26} rx={5} fill={C.blue} stroke={C.outline} strokeWidth={3} />
          <Screen c={{x: head.x + 6 * turn, y: head.y + 2}} w={92} h={64} s={p.screen} blink={p.expr.blink} t={p.t} />
          <Helmet c={{x: head.x, y: head.y - 4}} r={82} ring="#2f6fd6" k={p.helmet} />
        </g>
        <LimbShape o={{x: 44, y: -104}} limb={p.armR} l1={24} l2={24} w1={11} w2={10} color={'#9fb4d8'} outline={C.outline} end={claw} />
        {p.prop === 'box' && <rect x={handR.x - 20} y={handR.y - 4} width={44} height={34} rx={4} fill="#c79a5e" stroke="#7a5428" strokeWidth={3} />}
        {p.prop === 'tape' && <circle cx={handR.x} cy={handR.y + 10} r={12} fill="#f2e2a8" stroke={C.outline} strokeWidth={3} />}
        {p.prop === 'wrench' && <path transform={`translate(${f1(handR.x)} ${f1(handR.y + 8)}) rotate(30)`} d="M-3,0 L3,0 L3,-34 L8,-40 L4,-46 L0,-40 L-4,-46 L-8,-40 L-3,-34Z" fill="#9fb4d8" stroke={C.outline} strokeWidth={2.5} />}
        {p.prop === 'camera' && (
          <g transform={`translate(${f1(handR.x)} ${f1(handR.y + 4)})`}>
            <rect x={-22} y={-16} width={44} height={30} rx={6} fill="#e8463c" stroke={C.outline} strokeWidth={3} />
            <circle r={10} fill="#2a2440" stroke="#ffffff" strokeWidth={3} />
          </g>
        )}
      </g>
    </g>
  );
};
