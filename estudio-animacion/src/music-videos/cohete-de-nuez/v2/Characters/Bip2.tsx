// BIP 2.0 — el mismo robot (amarillo y azul, pantalla, antena, panel de luces) con pinzas que
// AGARRAN (el objeto se dibuja dentro de la pinza y la sigue), más caras en la pantalla (risa,
// dormido, visor de cámara, radar, estrellas), tornillos, juntas y luz de contorno.
import React from 'react';
import {mixColor} from '../../../../engine/math';
import {f1, Helmet, LimbShape, SoftShade, Vec2} from '../../Characters/parts';
import {BIP_COLORS} from '../../Characters/Bip';
import {Hold, limbEnd, Pose2, PropInHand, Rim} from '../rig';
import {Body} from './common';

export type BipFace2 = 'happy' | 'wow' | 'wink' | 'love' | 'focus' | 'oops' | 'laugh' | 'sleep' | 'stars';
export type BipScreen2 = {mode: 'face' | 'number' | 'text' | 'heart' | 'camera' | 'radar' | 'photo'; value: string; face: BipFace2};
export type Bip2Pose = Pose2 & {screen: BipScreen2; lights: number; antenna: number};
const C = BIP_COLORS;

const Screen2: React.FC<{c: Vec2; w: number; h: number; s: BipScreen2; blink: number; t: number; facing: number}> = ({c, w, h, s, blink, t, facing}) => {
  const ey = c.y - 4;
  const ex = w * 0.2;
  const eye = (x: number, side: number) => {
    switch (s.face) {
      case 'wow':
        return <circle cx={x} cy={ey} r={13} fill="none" stroke={C.glow} strokeWidth={5} />;
      case 'love':
        return <path transform={`translate(${f1(x)} ${f1(ey)}) scale(0.9)`} d="M0,10 C-18,-4 -10,-18 0,-8 C10,-18 18,-4 0,10Z" fill="#ff7ab0" />;
      case 'wink':
        return side > 0 ? <path d={`M${f1(x - 12)},${f1(ey)} q12,-10 24,0`} stroke={C.glow} strokeWidth={5} fill="none" strokeLinecap="round" /> : <ellipse cx={x} cy={ey} rx={10} ry={13} fill={C.glow} />;
      case 'focus':
        return <rect x={x - 12} y={ey - 4} width={24} height={8} rx={4} fill={C.glow} />;
      case 'oops':
        return <path d={`M${f1(x - 9)},${f1(ey - 9)} l18,18 M${f1(x + 9)},${f1(ey - 9)} l-18,18`} stroke={C.glow} strokeWidth={5} strokeLinecap="round" />;
      case 'laugh':
        return <path d={`M${f1(x - 12)},${f1(ey + 4)} q12,-16 24,0`} stroke={C.glow} strokeWidth={5} fill="none" strokeLinecap="round" />;
      case 'sleep':
        return <path d={`M${f1(x - 12)},${f1(ey)} q12,10 24,0`} stroke={C.glow} strokeWidth={4} fill="none" strokeLinecap="round" />;
      case 'stars':
        return <path transform={`translate(${f1(x)} ${f1(ey)}) rotate(${f1(t * 90)}) scale(0.7)`} d="M0,-18 L5,-5 L19,-5 L8,3 L12,17 L0,9 L-12,17 L-8,3 L-19,-5 L-5,-5Z" fill="#ffd23f" />;
      default:
        return <ellipse cx={x} cy={ey} rx={10} ry={13 * (1 - blink * 0.9)} fill={C.glow} />;
    }
  };
  const mouth =
    s.face === 'wow' || s.face === 'oops' ? (
      <ellipse cx={c.x} cy={c.y + 20} rx={8} ry={6} fill="none" stroke={C.glow} strokeWidth={4} />
    ) : s.face === 'laugh' || s.face === 'stars' ? (
      <path d={`M${f1(c.x - 16)},${f1(c.y + 13)} q16,18 32,0Z`} fill={C.glow} />
    ) : s.face === 'sleep' ? (
      <ellipse cx={c.x} cy={c.y + 18} rx={5} ry={3} fill={C.glow} />
    ) : (
      <path d={`M${f1(c.x - 16)},${f1(c.y + 16)} q16,${s.face === 'focus' ? 0 : 12} 32,0`} stroke={C.glow} strokeWidth={4} fill="none" strokeLinecap="round" />
    );
  const unflip = `translate(${f1(c.x)} 0) scale(${facing} 1) translate(${f1(-c.x)} 0)`;
  return (
    <g>
      <rect x={c.x - w / 2} y={c.y - h / 2} width={w} height={h} rx={22} fill={C.screen} stroke={C.outline} strokeWidth={4} />
      <rect x={c.x - w / 2 + 6} y={c.y - h / 2 + 6} width={w - 12} height={h * 0.3} rx={14} fill="#ffffff" opacity={0.08} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const y = c.y - h / 2 + 10 + ((i * 14 + t * 30) % (h - 16));
        return <line key={i} x1={c.x - w / 2 + 8} x2={c.x + w / 2 - 8} y1={y} y2={y} stroke={C.glow} strokeOpacity={0.06} strokeWidth={2} />;
      })}
      {s.mode === 'face' && (
        <g>
          {eye(c.x - ex, -1)}
          {eye(c.x + ex, 1)}
          {mouth}
          {s.face === 'sleep' && (
            <text x={c.x + 30} y={c.y - 14} fontFamily="Montserrat" fontWeight={900} fontSize={16} fill={C.glow} transform={unflip}>
              z
            </text>
          )}
        </g>
      )}
      {s.mode === 'heart' && <path transform={`translate(${f1(c.x)} ${f1(c.y)}) scale(${f1(2 + 0.2 * Math.sin(t * 8))})`} d="M0,10 C-18,-4 -10,-18 0,-8 C10,-18 18,-4 0,10Z" fill="#ff7ab0" />}
      {s.mode === 'camera' && (
        <g stroke={C.glow} strokeWidth={4} fill="none">
          <path d={`M${f1(c.x - 34)},${f1(c.y - 14)} v-10 h12 M${f1(c.x + 34)},${f1(c.y - 14)} v-10 h-12 M${f1(c.x - 34)},${f1(c.y + 14)} v10 h12 M${f1(c.x + 34)},${f1(c.y + 14)} v10 h-12`} />
          <circle cx={c.x} cy={c.y} r={8} />
          <circle cx={c.x + 30} cy={c.y - 20} r={3} fill="#ff5d73" stroke="none" opacity={Math.sin(t * 8) > 0 ? 1 : 0.2} />
        </g>
      )}
      {s.mode === 'photo' && (
        <g>
          <rect x={c.x - 32} y={c.y - 22} width={64} height={44} rx={4} fill="#fff2b0" />
          <circle cx={c.x + 6} cy={c.y - 2} r={14} fill="#ffe07a" stroke="#d09a32" strokeWidth={2} />
          <circle cx={c.x} cy={c.y - 6} r={3} fill="#e8b448" />
          <circle cx={c.x + 10} cy={c.y + 4} r={2.5} fill="#e8b448" />
        </g>
      )}
      {s.mode === 'radar' && (
        <g>
          {[10, 20, 30].map((r) => (
            <circle key={r} cx={c.x} cy={c.y} r={r} fill="none" stroke={C.glow} strokeWidth={2} opacity={0.5} />
          ))}
          <path d={`M${f1(c.x)},${f1(c.y)} L${f1(c.x + Math.cos(t * 5) * 30)},${f1(c.y + Math.sin(t * 5) * 30)}`} stroke={C.glow} strokeWidth={3} />
          <circle cx={c.x + 16} cy={c.y - 10} r={5} fill="#7fe0b8" opacity={0.5 + 0.5 * Math.sin(t * 10)} />
        </g>
      )}
      <g transform={unflip}>
        {s.mode === 'number' && (
          <text x={c.x} y={c.y + 22} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={62} fill={C.glow}>
            {s.value}
          </text>
        )}
        {s.mode === 'text' && (
          <text x={c.x} y={c.y + 10} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={s.value.length > 5 ? 20 : 28} fill={C.glow}>
            {s.value}
          </text>
        )}
      </g>
    </g>
  );
};

/** Pinza que se abre y se cierra; el objeto va entre las dos mitades. */
const Claw: React.FC<{p: Vec2; a: number; grip: number; hold: Hold}> = ({p, a, grip, hold}) => {
  const open = 1 - grip;
  const spread = 4 + 10 * open;
  return (
    <g transform={`translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1((-a * 180) / Math.PI)})`}>
      <g transform="translate(0 12)">
        <PropInHand h={hold} />
      </g>
      <circle r={9} fill={C.blue} stroke={C.outline} strokeWidth={3} />
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M${s * 5},5 Q${s * (spread + 6)},16 ${s * (spread - 2)},24`} stroke={C.outline} strokeWidth={7} strokeLinecap="round" fill="none" />
          <path d={`M${s * 5},5 Q${s * (spread + 6)},16 ${s * (spread - 2)},24`} stroke="#9fb4d8" strokeWidth={3.5} strokeLinecap="round" fill="none" />
        </g>
      ))}
      <circle r={3} fill="#ffffff" opacity={0.5} />
    </g>
  );
};

export const Bip2: React.FC<{p: Bip2Pose; id?: string}> = ({p, id = 'bip2'}) => {
  const turn = p.headTurn;
  const head: Vec2 = {x: 4 * turn, y: -176};
  const glowK = 0.5 + 0.5 * p.antenna;
  const foot = (pp: Vec2) => <rect x={pp.x - 16} y={pp.y - 6} width={34} height={14} rx={7} fill={C.blue} stroke={C.outline} strokeWidth={3} />;
  const tw = p.twist * 8;
  const eL = limbEnd({x: -44 - tw, y: -104}, p.armL, 24, 24);
  const eR = limbEnd({x: 44 - tw, y: -104}, p.armR, 24, 24);
  const antTip = {x: head.x + 4 + Math.sin(p.t * 3) * 3, y: head.y - 76};
  return (
    <Body p={p} pivot={-40} shadowW={58}>
      <defs>
        <SoftShade id={`${id}-body`} base={C.body} />
        <SoftShade id={`${id}-blue`} base={C.blue} />
      </defs>
      <LimbShape o={{x: -16, y: -36}} limb={p.legL} l1={18} l2={16} w1={12} w2={11} color="#9fb4d8" outline={C.outline} end={foot} />
      <LimbShape o={{x: 16, y: -36}} limb={p.legR} l1={18} l2={16} w1={12} w2={11} color="#9fb4d8" outline={C.outline} end={foot} />
      <LimbShape o={{x: -44 - tw, y: -104}} limb={p.armL} l1={24} l2={24} w1={11} w2={10} color="#9fb4d8" outline={C.outline} />
      <circle cx={eL.knee.x} cy={eL.knee.y} r={6} fill={C.blue} stroke={C.outline} strokeWidth={2.5} />
      <Claw p={eL.p} a={eL.a} grip={p.gripL} hold={p.holdL} />
      <ellipse cx={0} cy={-88} rx={52} ry={56} fill={`url(#${id}-body)`} stroke={C.outline} strokeWidth={4} />
      <Rim c={{x: 0, y: -88}} r={54} k={p.rimK} color={p.rimColor} />
      {[[-40, -120], [40, -120], [-42, -58], [42, -58]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={4} fill="#c98a1a" stroke={C.outline} strokeWidth={1.5} />
          <path d={`M${x - 2},${y} l4,0`} stroke={C.outline} strokeWidth={1.5} />
        </g>
      ))}
      <rect x={-30 - tw * 0.5} y={-104} width={60} height={42} rx={12} fill={`url(#${id}-blue)`} stroke={C.outline} strokeWidth={3} />
      {C.light.map((c, i) => {
        const on = 0.35 + 0.65 * Math.max(0, Math.sin(p.t * 6 + i * 2.1)) * p.lights;
        const x = -16 + i * 16 - tw * 0.5;
        return (
          <g key={i}>
            <circle cx={x} cy={-90} r={6} fill={mixColor('#333344', c, on)} stroke={C.outline} strokeWidth={2} />
            {on > 0.6 && <circle cx={x} cy={-90} r={12} fill={c} opacity={0.3 * on} />}
          </g>
        );
      })}
      <rect x={-18 - tw * 0.5} y={-76} width={36} height={6} rx={3} fill={C.glow} opacity={0.4 + 0.5 * p.lights} />
      <rect x={-10} y={-148} width={20} height={14} rx={4} fill="#9fb4d8" stroke={C.outline} strokeWidth={3} />
      <path d="M-8,-142 L8,-142" stroke={C.outline} strokeWidth={2} opacity={0.5} />
      <g transform={`rotate(${f1((p.headTilt * 180) / Math.PI)} 0 -140)`}>
        <path d={`M${f1(head.x)},${f1(head.y - 42)} Q${f1(head.x - 4)},${f1(head.y - 60)} ${f1(antTip.x)},${f1(antTip.y)}`} stroke={C.outline} strokeWidth={5} fill="none" />
        <circle cx={antTip.x} cy={antTip.y} r={9} fill={mixColor('#ff9a3c', '#ffe8a0', glowK)} stroke={C.outline} strokeWidth={3} />
        <circle cx={antTip.x} cy={antTip.y} r={22} fill="#ffd27a" opacity={0.35 * glowK} />
        <rect x={head.x - 58} y={head.y - 44} width={116} height={88} rx={30} fill={`url(#${id}-body)`} stroke={C.outline} strokeWidth={4} />
        <path d={`M${f1(head.x - 46)},${f1(head.y - 36)} Q${f1(head.x)},${f1(head.y - 46)} ${f1(head.x + 30)},${f1(head.y - 38)}`} stroke={p.rimColor} strokeWidth={5} fill="none" opacity={p.rimK} strokeLinecap="round" />
        <rect x={head.x - 64} y={head.y - 12} width={12} height={26} rx={5} fill={C.blue} stroke={C.outline} strokeWidth={3} />
        <rect x={head.x + 52} y={head.y - 12} width={12} height={26} rx={5} fill={C.blue} stroke={C.outline} strokeWidth={3} />
        <Screen2 c={{x: head.x + 6 * turn, y: head.y + 2}} w={92} h={64} s={p.screen} blink={p.expr.blink} t={p.t} facing={p.facing * Math.sign(Math.cos(p.spin) || 1)} />
        <Helmet c={{x: head.x, y: head.y - 4}} r={82} ring="#2f6fd6" k={p.helmet} />
      </g>
      <LimbShape o={{x: 44 - tw, y: -104}} limb={p.armR} l1={24} l2={24} w1={11} w2={10} color="#9fb4d8" outline={C.outline} />
      <circle cx={eR.knee.x} cy={eR.knee.y} r={6} fill={C.blue} stroke={C.outline} strokeWidth={2.5} />
      <Claw p={eR.p} a={eR.a} grip={p.gripR} hold={p.holdR} />
    </Body>
  );
};
