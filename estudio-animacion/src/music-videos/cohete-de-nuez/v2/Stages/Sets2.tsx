// DECORADOS 2.0 (sobre los de la v1, que no se modifican):
//  · Room2: habitación con más profundidad (haces de luz de la ventana, sombras de contacto,
//    primer plano desenfocado por tamaño y color, montón de materiales de construcción).
//  · Cockpit2: cabina con asientos de cartón, pegatinas, juguete colgante y luz de color.
//  · CloseArm: brazo que entra desde fuera de cuadro en los planos detalle de manos.
import React from 'react';
import {hash1, mixColor} from '../../../../engine/math';
import {Cam, layerT} from '../../Camera/cam2d';
import {f1, Limb, LimbShape, Vec2} from '../../Characters/parts';
import {CockpitBack, CockpitPanel} from '../../Environments/Cockpit';
import {RoomBack, RoomFloor, RoomState} from '../../Environments/Room';
import {Hand, Hold, PropInHand} from '../rig';

export const World: React.FC<{cam: Cam; d?: number; children: React.ReactNode}> = ({cam, d = 1, children}) => <g transform={layerT(cam, d)}>{children}</g>;

export type Materials = {cards: number; colander: number; rolls: number; tapes: number; scissors: number; box: number};
export const ALL_MATERIALS: Materials = {cards: 3, colander: 1, rolls: 1, tapes: 1, scissors: 1, box: 1};

/** Montón de materiales en el suelo, junto a la mesa (x ≈ 380). */
export const MaterialPile: React.FC<{m: Materials; x?: number; y?: number}> = ({m, x = 400, y = 70}) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={18} rx={190} ry={26} fill="#2a1630" opacity={0.18} />
    {m.box > 0.01 && (
      <g opacity={m.box} transform="translate(90 0)">
        <rect x={-70} y={-90} width={140} height={100} rx={6} fill="#c79a5e" stroke="#7a5428" strokeWidth={5} />
        <path d="M-70,-90 L-90,-120 L40,-120 L70,-90" fill="#d9ad72" stroke="#7a5428" strokeWidth={5} strokeLinejoin="round" />
        <rect x={-30} y={-60} width={60} height={24} rx={4} fill="#f6ecc4" opacity={0.8} />
      </g>
    )}
    {Array.from({length: Math.round(m.cards)}, (_, i) => (
      <g key={i} transform={`translate(${-80 + i * 6} ${-8 - i * 12}) rotate(${-4 + i * 3})`}>
        <rect x={-80} y={-10} width={160} height={14} rx={2} fill={mixColor('#c79a5e', '#a87a42', i * 0.3)} stroke="#7a5428" strokeWidth={3} />
        <path d="M-74,-3 L74,-3" stroke="#7a5428" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.6} />
      </g>
    ))}
    {m.rolls > 0.01 && (
      <g opacity={m.rolls} transform="translate(-150 -10) rotate(-12)">
        <rect x={-14} y={-60} width={28} height={70} rx={10} fill="#ff9ad5" stroke="#b0457e" strokeWidth={3} />
        <rect x={10} y={-50} width={26} height={60} rx={10} fill="#7ec8ff" stroke="#2a5a8a" strokeWidth={3} />
      </g>
    )}
    {m.colander > 0.01 && (
      <g opacity={m.colander} transform="translate(-20 -46)">
        <PropInHand h={{kind: 'colander', rot: Math.PI}} />
      </g>
    )}
    {m.tapes > 0.01 && (
      <g opacity={m.tapes} transform="translate(30 0)">
        <circle cx={0} cy={-8} r={18} fill="#f2e2a8" stroke="#8a7a4a" strokeWidth={4} />
        <circle cx={0} cy={-8} r={8} fill="#ffffff" />
      </g>
    )}
    {m.scissors > 0.01 && (
      <g opacity={m.scissors} transform="translate(-90 6) rotate(70)">
        <PropInHand h={{kind: 'scissors'}} />
      </g>
    )}
  </g>
);

/** Carrito de madera con ruedas sobre el que se monta el cohete. */
export const Cart: React.FC<{x: number; y: number; wheel: number}> = ({x, y, wheel}) => (
  <g transform={`translate(${f1(x)} ${f1(y)})`}>
    <ellipse cx={0} cy={34} rx={190} ry={22} fill="#2a1630" opacity={0.22} />
    <rect x={-170} y={-6} width={340} height={26} rx={8} fill="#c98a5a" stroke="#6a3a1a" strokeWidth={5} />
    <path d="M-160,4 L160,4" stroke="#e8b07a" strokeWidth={3} opacity={0.6} />
    {[-120, 120].map((wx) => (
      <g key={wx} transform={`translate(${wx} 26) rotate(${f1((wheel * 180) / Math.PI)})`}>
        <circle r={18} fill="#e8463c" stroke="#6a1a1a" strokeWidth={4} />
        <path d="M-12,0 L12,0 M0,-12 L0,12" stroke="#ffffff" strokeWidth={3} />
      </g>
    ))}
  </g>
);

export const Room2: React.FC<{cam: Cam; s: RoomState; fg?: number; children?: React.ReactNode; pile?: Materials | null}> = ({cam, s, fg = 1, children, pile = null}) => {
  const day = 1 - s.night;
  return (
    <g>
      <RoomBack cam={cam} s={s} />
      {/* haces de luz que entran por la ventana */}
      {day > 0.02 && (
        <g transform={layerT(cam, 0.88)} opacity={day}>
          <defs>
            <linearGradient id="r2beam" x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0" stopColor="#fff6d8" stopOpacity={0.32} />
              <stop offset="1" stopColor="#fff6d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d="M-640,-1420 L-200,-1420 L520,240 L-260,240Z" fill="url(#r2beam)" />
          {Array.from({length: 14}, (_, i) => (
            <circle key={i} cx={-380 + hash1(i * 3) * 600 + Math.sin(s.t * 0.4 + i) * 30} cy={-1200 + ((hash1(i * 7) * 1300 + s.t * 18) % 1300)} r={2 + hash1(i) * 3} fill="#fff6d8" opacity={0.5} />
          ))}
        </g>
      )}
      <RoomFloor cam={cam} s={s} />
      <g transform={layerT(cam, 1)}>
        {pile && <MaterialPile m={pile} />}
        {children}
      </g>
      {/* primer plano (más cerca de la cámara: se mueve y crece más) */}
      {fg > 0.01 && (
        <g transform={layerT(cam, 1.35)} opacity={fg}>
          <g transform="translate(-1120 260)">
            <rect x={-90} y={-150} width={130} height={130} rx={14} fill={mixColor('#ff5d73', '#2a1630', 0.35)} />
            <rect x={-40} y={-260} width={120} height={120} rx={14} fill={mixColor('#5db8ff', '#2a1630', 0.35)} />
            <rect x={40} y={-140} width={110} height={110} rx={14} fill={mixColor('#ffd23f', '#2a1630', 0.35)} />
          </g>
          <g transform="translate(1180 300)">
            <path d="M-60,0 L60,0 L48,-120 L-48,-120Z" fill={mixColor('#c9702a', '#2a1630', 0.4)} />
            {[-1.0, -0.5, 0, 0.5, 1.0].map((a, i) => (
              <ellipse key={i} cx={Math.sin(a) * 120} cy={-160 - Math.cos(a) * 120} rx={36} ry={110} transform={`rotate(${f1((a * 180) / Math.PI)} ${f1(Math.sin(a) * 120)} ${f1(-160 - Math.cos(a) * 120)})`} fill={mixColor('#4dd88a', '#1a3a2a', 0.45)} />
            ))}
          </g>
        </g>
      )}
    </g>
  );
};

/** Cabina 2.0: fondo de la v1 + asientos de cartón, juguete colgante, tripulación y panel. */
export const Cockpit2: React.FC<{cam: Cam; t: number; view: React.ReactNode; shake?: number; lever?: number; wheel?: number; glow?: string; glowK?: number; children?: React.ReactNode}> = ({cam, t, view, shake = 0, lever = 1, wheel = 0, glow = '#7ff3ff', glowK = 0.12, children}) => (
  <g>
    <CockpitBack cam={cam} t={t} view={view} shake={shake} />
    <g transform={layerT({...cam, x: cam.x + shake * Math.sin(t * 61) * 4}, 0.96)}>
      {/* juguete colgante (estrella de fieltro) */}
      <g transform={`translate(420 -980) rotate(${f1(Math.sin(t * 1.6) * 10 + shake * Math.sin(t * 40) * 8)})`}>
        <path d="M0,0 L0,170" stroke="#5a3a1a" strokeWidth={4} />
        <path transform="translate(0 210) scale(2.4)" d="M0,-20 L6,-6 L21,-6 L9,3 L13,18 L0,9 L-13,18 L-9,3 L-21,-6 L-6,-6Z" fill="#ffd23f" stroke="#8a5a1a" strokeWidth={2} />
      </g>
      {/* pegatinas */}
      <circle cx={-560} cy={-200} r={44} fill="#ff9ad5" stroke="#b0457e" strokeWidth={5} />
      <path transform="translate(-560 -200) scale(1.3)" d="M0,12 C-22,-4 -12,-22 0,-10 C12,-22 22,-4 0,12Z" fill="#ffffff" />
      <rect x={480} y={-300} width={120} height={80} rx={12} fill="#7ec8ff" stroke="#2a5a8a" strokeWidth={5} transform="rotate(8 540 -260)" />
      {/* asientos de cartón */}
      {[-380, 0, 380].map((x) => (
        <g key={x}>
          <rect x={x - 130} y={-60} width={260} height={360} rx={60} fill="#b07a3a" stroke="#3e2412" strokeWidth={7} />
          <rect x={x - 100} y={-30} width={200} height={300} rx={46} fill="#c98f52" />
          <path d={`M${x - 90},40 L${x + 90},40 M${x - 90},120 L${x + 90},120`} stroke="#9a6a32" strokeWidth={4} strokeDasharray="10 8" />
        </g>
      ))}
    </g>
    <g transform={layerT({...cam, x: cam.x + shake * Math.sin(t * 61) * 4}, 1)}>{children}</g>
    <CockpitPanel cam={cam} t={t} lever={lever} wheel={wheel} shake={shake} />
    <rect x={0} y={0} width={1080} height={1920} fill={glow} opacity={glowK} style={{mixBlendMode: 'soft-light'}} />
  </g>
);

/** Brazo que entra desde fuera de cuadro (plano detalle): hombro `o` fuera, mano en `p`. */
export const CloseArm: React.FC<{o: Vec2; p: Vec2; color: string; outline: string; sleeve: string; w: number; grip: number; hold: Hold; side: 1 | -1; bend?: number; fingers?: 3 | 4; handR?: number}> = ({o, p, color, outline, sleeve, w, grip, hold, side, bend = 1, fingers, handR}) => {
  const d = Math.hypot(p.x - o.x, p.y - o.y);
  const l = d * 0.56;
  const lim = ik2(o, p, l, l, bend);
  const a2 = lim.a + lim.b;
  return (
    <g>
      <LimbShape o={o} limb={lim} l1={l} l2={l} w1={w} w2={w * 0.88} color={color} outline={outline} sleeve={{color: sleeve, len: l * 0.8}} />
      <Hand p={p} a={a2} grip={grip} color={color} outline={outline} hold={hold} side={side} fingers={fingers} r={handR ?? w * 0.75} />
    </g>
  );
};

/** IK de dos segmentos (0 = hacia abajo): ángulos para que el extremo alcance `p`. */
export function ik2(o: Vec2, p: Vec2, l1: number, l2: number, s = 1): Limb {
  const dx = p.x - o.x;
  const dy = p.y - o.y;
  const d = Math.min(l1 + l2 - 0.01, Math.max(Math.abs(l1 - l2) + 0.01, Math.hypot(dx, dy)));
  const th = Math.atan2(dx, dy);
  const al = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d));
  const be = Math.acos((l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2));
  return {a: th + s * al, b: -s * (Math.PI - be)};
}

/** IK en coordenadas del mundo para un personaje colocado en (x, y) con escala y orientación. */
export function reachLimb(c: {x: number; y: number; scale: number; facing: 1 | -1}, shoulder: Vec2, l1: number, l2: number, target: Vec2, s = 1): Limb {
  const local = {x: ((target.x - c.x) / c.scale) * c.facing, y: (target.y - c.y) / c.scale};
  return ik2(shoulder, local, l1, l2, s);
}
export const SHOULDERS = {
  nico: {L: {x: -38, y: -142}, R: {x: 38, y: -142}, l1: 30, l2: 28},
  luna: {L: {x: -36, y: -138}, R: {x: 36, y: -138}, l1: 29, l2: 27},
  bip: {L: {x: -44, y: -104}, R: {x: 44, y: -104}, l1: 24, l2: 24},
  zumi: {L: {x: -30, y: -70}, R: {x: 30, y: -70}, l1: 18, l2: 16},
};
