// INTRODUCCIÓN Y CONSTRUCCIÓN (0 → 30,999 s): planos cortados en pulsos medidos.
// I1 habitación · I2 Luna trae la caja · I3 Bip enciende su pantalla
// B1 Nico observa los materiales · B2 Luna levanta un cartón · B3 detalle: manos pegando cinta
// B4 Bip lleva una herramienta · B5 Nico instala una aleta · B6 Bip ajusta la aleta frontal
// B7 Nico recorta la punta · B8 Luna coloca la ventana · B9 Bip pone la punta
// B10 Nico y el colador · B11 el colador se vuelve casco (reacciones) · B12 empujan el cohete
// B13 plano general: admiran su creación.
import React from 'react';
import {clamp, lerp, smoothstep} from '../../../../engine/math';
import {Cam, camAt, CamKey, pulsed} from '../../Camera/cam2d';
import {RoomState} from '../../Environments/Room';
import {Burst} from '../../Effects/Fx';
import {beatPhase, BEATS} from '../../MusicSync/songMap';
import {bip2, cheer, crouchK, ease, ex, hold, jump, keyed, L, luna2, nico2, PK, pointAt, walkCycle, waveArm} from '../Animation/acting';
import {Bip2} from '../Characters/Bip2';
import {Luna2} from '../Characters/Luna2';
import {Nico2} from '../Characters/Nico2';
import {NICO_COLORS} from '../../Characters/Nico';
import {LUNA_COLORS} from '../../Characters/Luna';
import {at, Shot, snap} from '../Shots/shot';
import {RocketBuild2, NutRocket2} from '../Stages/Rocket2';
import {ALL_MATERIALS, Cart, CloseArm, Materials, reachLimb, Room2, SHOULDERS} from '../Stages/Sets2';

// ---------------------------------------------------------------- tiempos (pulsos reales)
export const T = {
  I1: 0,
  I2: snap(2.8),
  I3: snap(4.3),
  B1: at('verse1'),
  B2: at('verse1', 1),
  B3: at('verse1', 2),
  B4: at('verse1', 3),
  B5: at('verse1', 4),
  B6: at('verse1', 5),
  B7: at('verse1', 6),
  B7b: at('verse1', 6.75),
  B8: at('verse1b'),
  B9: at('verse1b', 1),
  B10: at('verse1b', 2),
  B11: snap(25.4),
  B12: at('verse1b', 3.5),
  B13: at('verse1b', 4.5),
};
/** Instantes de contacto: la pieza pasa de la mano al cohete. */
export const EV = {
  boxDown: T.I2 + 0.95,
  cardGrab: T.B2 + 0.62,
  fin0: T.B3,
  tape0: T.B3 + 1.05,
  fin1: T.B5 + 1.12,
  tape1: T.B5 + 1.55,
  fin2: T.B6 + 0.78,
  coneReady: at('verse1', 6.75) + 0.45,
  window: T.B8 + 0.92,
  tape45: T.B8 + 1.35,
  nose: T.B9 + 1.25,
  tape23: T.B9 + 1.6,
  colGrab: T.B10 + 0.55,
  colOn: T.B10 + 1.45,
  helmet: T.B11,
  pushA: T.B12 + 0.25,
  pushB: T.B12 + 1.55,
  star: T.B13 + 0.55,
  lights: snap(T.B13 + 0.95),
  turn: snap(T.B13 + 2.2),
};

export const RX0 = 60;
export const RX1 = -260;
export const CART_Y = 60;
export const RY = CART_Y - 40;

const step = (t: number, a: number) => (t >= a ? 1 : 0);
export function buildAt(t: number): RocketBuild2 {
  return {shell: 1, fins: [step(t, EV.fin0), step(t, EV.fin1), step(t, EV.fin2)], windowK: step(t, EV.window), nose: step(t, EV.nose), tape: 0, lights: smoothstep(EV.lights, EV.lights + 0.25, t), stars: step(t, EV.star)};
}
export const rocketX = (t: number) => lerp(RX0, RX1, ease('io', (t - EV.pushA) / (EV.pushB - EV.pushA)));
/** Tiras de cinta pegadas a mano (mismas posiciones que el cohete terminado). */
const STRIPS: [number, number, number, number][] = [
  [-118, -150, -30, EV.tape0],
  [112, -150, 30, EV.tape1],
  [-54, -228, -70, EV.tape45],
  [52, -232, 66, EV.tape45 + 0.2],
  [-80, -414, -10, EV.tape23],
  [76, -414, 12, EV.tape23 + 0.2],
];
const Strips: React.FC<{t: number; x: number; y: number}> = ({t, x, y}) => (
  <g transform={`translate(${x} ${y})`} opacity={0.85}>
    {STRIPS.map(([sx, sy, r, ta], i) => (t >= ta ? <rect key={i} x={sx - 30} y={sy - 9} width={60 * Math.min(1, (t - ta) / 0.12)} height={18} fill="#f6ecc4" opacity={0.75} stroke="#d8c48a" strokeWidth={1.5} transform={`rotate(${r} ${sx} ${sy})`} /> : null))}
  </g>
);

const materialsAt = (t: number): Materials => ({...ALL_MATERIALS, box: step(t, EV.boxDown), cards: t >= EV.cardGrab ? 2 : 3, scissors: t >= T.B7 ? 0 : 1, colander: t >= EV.colGrab ? 0 : 1});

/** Cohete con carrito, tiras y destellos de contacto. */
const RocketOnCart: React.FC<{t: number; x?: number}> = ({t, x}) => {
  const rx = x ?? rocketX(t);
  const b = buildAt(t);
  const hits = [EV.fin1, EV.fin2, EV.window, EV.nose];
  const bounce = hits.reduce((a, h) => a + (t > h && t < h + 0.4 ? Math.sin(((t - h) / 0.4) * Math.PI * 2) * Math.exp(-(t - h) * 6) * 0.05 : 0), 0);
  return (
    <g>
      <Cart x={rx} y={CART_Y} wheel={(rx - RX0) / 18} />
      <NutRocket2 id="r2b" p={{x: rx, y: RY, scale: 1, rot: 0, build: b, vibrate: 0, engine: 0, glow: 0.25 * b.lights, t, squash: bounce}} />
      <Strips t={t} x={rx} y={RY} />
      <Burst x={rx + 150} y={RY - 90} u={(t - EV.fin1) / 0.6} r={140} />
      <Burst x={rx} y={RY - 60} u={(t - EV.fin2) / 0.6} r={120} />
      <Burst x={rx} y={RY - 280} u={(t - EV.window) / 0.7} r={200} />
      <Burst x={rx} y={RY - 520} u={(t - EV.nose) / 0.7} r={180} />
      <Burst x={rx} y={RY - 300} u={(t - EV.lights) / 0.8} r={320} />
    </g>
  );
};

const room = (t: number): RoomState => ({night: 0, materials: 1, nutOnTable: 0, t, tidy: 0, zumiStar: 0});
const ck = (keys: CamKey[], lt: number): Cam => camAt(keys, lt);

/** Escena de habitación: decorado + cohete + personajes (ordenados por profundidad). */
const RoomShot: React.FC<{t: number; cam: Cam; fg?: number; chars: React.ReactNode; front?: React.ReactNode; rocket?: boolean}> = ({t, cam, fg = 1, chars, front, rocket = true}) => (
  <Room2 cam={pulsed(cam, t, 0.25)} s={room(t)} fg={fg} pile={materialsAt(t)}>
    {rocket && <RocketOnCart t={t} />}
    {chars}
    {front}
  </Room2>
);

// ---------------------------------------------------------------- planos
const ENTRY = BEATS.filter((b) => b >= 1.0).slice(0, 4);

export const BUILD_SHOTS: Shot[] = [
  {
    t0: T.I1,
    id: 'I1',
    kind: 'wide',
    what: 'habitación de mañana; Nico entra saltando',
    r: (t, lt) => {
      const cam = ck([[0, -420, -1150, 1.7], [0.9, -420, -1000, 1.6], [2.1, -330, -90, 2.7], [T.I2, -290, -90, 2.9]], lt);
      let k = 0;
      ENTRY.forEach((b, i) => (t >= b ? (k = i) : 0));
      const b0 = ENTRY[k];
      const b1 = ENTRY[Math.min(ENTRY.length - 1, k + 1)];
      const d = Math.max(0.3, b1 - b0);
      const nx = t < ENTRY[0] ? -760 : Math.min(-240 + 0, lerp(-760 + k * 160, -760 + (k + 1) * 160, clamp((t - b0) / d)));
      const n = nico2(t, {x: nx, y: 110, ...(t < ENTRY[ENTRY.length - 1] + 0.4 ? jump(t, b0, d * 0.9, 60) : {}), expr: ex(t, 1, {mouth: 'grin', eyes: t > 2.3 ? 'happy' : 'normal'}), ...(t > 2.3 ? waveArm(t, 1) : {})}, {}, 0.8);
      return <RoomShot t={t} cam={cam} chars={<Nico2 id="i1n" p={n} />} />;
    },
  },
  {
    t0: T.I2,
    id: 'I2',
    kind: 'medium',
    what: 'Luna llega con la caja de materiales y la deja',
    r: (t, lt) => {
      const cam = ck([[0, 700, -70, 3.4], [1.5, 560, -80, 3.6]], lt);
      const u = clamp(lt / 0.75);
      const lx = lerp(760, 520, ease('io', u));
      const down = ease('back', (lt - 0.7) / 0.3);
      const l = luna2(t, {x: lx, y: 80, facing: -1, ...(u < 1 ? walkCycle(lt * 1.9, 0.8) : crouchK(down * (1 - smoothstep(1.0, 1.3, lt)))), armR: L(0.45, -0.1), armL: L(0.55, -0.2), gripR: 1, gripL: 1, holdR: t < EV.boxDown ? hold('box', 0, 0.9) : hold('none'), expr: ex(t, 4, {mouth: lt > 1.0 ? 'grin' : 'smile', eyes: lt > 1.1 ? 'happy' : 'normal', look: {x: -0.4, y: 0.3}})});
      const n = nico2(t, {x: 160, y: 110, headTurn: 0.6, expr: ex(t, 1, {mouth: 'grin', look: {x: 0.8, y: 0}, brow: 0.6}), ...(lt > 1.0 ? cheer(t) : {})});
      return <RoomShot t={t} cam={cam} chars={<><Nico2 id="i2n" p={n} /><Luna2 id="i2l" p={l} /></>} />;
    },
  },
  {
    t0: T.I3,
    id: 'I3',
    kind: 'close',
    what: 'primer plano: Bip enciende su pantalla y saluda',
    r: (t, lt) => {
      const cam = ck([[0, -480, -130, 6.0], [1.4, -480, -135, 6.6]], lt);
      const power = smoothstep(0.15, 0.5, lt);
      const b = bip2(t, {x: -480, y: 30, headTilt: lt > 0.9 ? 0.12 * Math.sin(t * 6) : 0, ...(lt > 0.9 ? waveArm(t, 1, 12) : {}), headTurn: 0}, lt < 0.85 ? {mode: 'text', value: '¡HOLA!'} : {face: 'happy'}, {power, antenna: power, lights: power} as never);
      return <RoomShot t={t} cam={cam} fg={0} rocket={false} chars={<Bip2 id="i3b" p={b} />} />;
    },
  },
  {
    t0: T.B1,
    id: 'B1',
    kind: 'medium',
    what: 'Nico observa los materiales y tiene una idea',
    r: (t, lt) => {
      const cam = ck([[0, 250, -90, 4.6], [1.8, 250, -100, 5.0]], lt);
      const idea = 0.95;
      const chin = {armR: L(-2.7, 2.35), gripR: 0.7};
      const pose = keyed(lt, [
        [0, {...chin, headTilt: 0.12, expr: {look: {x: 0.3, y: 0.5}, browL: -0.3, browR: 0.2, mouth: 'flat'}}],
        [0.5, {...chin, headTilt: 0.06, expr: {look: {x: 0.9, y: 0.4}, browL: -0.4, browR: 0.3, mouth: 'flat'}}],
        [idea - 0.1, {...chin, ...crouchK(0.4), expr: {look: {x: 0.2, y: 0.2}, mouth: 'flat'}}, 'io'],
        [idea + 0.15, {armR: L(2.85, 0.25), gripR: 0.9, squash: -0.08, bob: -16, expr: {eyes: 'wide', brow: 1, mouth: 'o', look: {x: 0, y: -0.6}}}, 'over'],
        [1.6, {armR: L(2.8, 0.3), gripR: 0.9, expr: {mouth: 'laugh', eyes: 'happy', cheeks: 1}}],
      ]);
      const n = nico2(t, {x: 230, y: 110, ...pose, expr: ex(t, 1, pose.expr)}, {belt: 1}, 0.6);
      return <RoomShot t={t} cam={cam} chars={<Nico2 id="b1n" p={n} />} front={<Burst x={310} y={-230} u={(lt - idea) / 0.7} r={90} />} />;
    },
  },
  {
    t0: T.B2,
    id: 'B2',
    kind: 'medium',
    what: 'Luna se agacha y levanta un cartón',
    r: (t, lt) => {
      const cam = ck([[0, 310, -60, 4.0], [1.8, 310, -90, 3.8]], lt);
      const g = EV.cardGrab - T.B2;
      const pos = {x: 300, y: 100, scale: 1, facing: 1 as const};
      const S = SHOULDERS.luna;
      const reachR = reachLimb(pos, S.R, S.l1, S.l2, {x: 330, y: 40}, -1);
      const reachL = reachLimb(pos, S.L, S.l1, S.l2, {x: 300, y: 44}, -1);
      const pose = keyed(lt, [
        [0, {expr: {look: {x: 0.5, y: 0.8}, mouth: 'smile'}}],
        [g - 0.05, {...crouchK(1), lean: 0.25, armR: reachR, armL: reachL, gripR: 0, gripL: 0, expr: {look: {x: 0.4, y: 1}, mouth: 'flat', browL: -0.2}}, 'back'],
        [g + 0.05, {...crouchK(1.1), lean: 0.25, armR: reachR, armL: reachL, gripR: 1, gripL: 1, expr: {eyes: 'squint', mouth: 'ee'}}, 'snap'],
        [g + 0.5, {armR: L(-2.95, -0.1), armL: L(2.95, 0.1), gripR: 1, gripL: 1, bob: -10, squash: -0.07, expr: {eyes: 'wide', mouth: 'grin', look: {x: 0, y: -1}}}, 'over'],
        [1.85, {armR: L(-2.9, -0.1), armL: L(2.9, 0.1), gripR: 1, gripL: 1, expr: {eyes: 'happy', mouth: 'laugh', cheeks: 1}}],
      ]);
      const holding = lt > g;
      const l = luna2(t, {...pos, ...pose, holdR: holding ? hold('cardboard', 0, 1.1) : hold('none'), expr: ex(t, 4, pose.expr)}, lt > g + 0.4 ? 0.6 : 0);
      const n = nico2(t, {x: 80, y: 120, facing: 1, headTurn: 0.4, expr: ex(t, 1, {mouth: 'grin', look: {x: 1, y: lt > g ? -0.6 : 0.3}})});
      return <RoomShot t={t} cam={cam} chars={<><Nico2 id="b2n" p={n} /><Luna2 id="b2l" p={l} /></>} />;
    },
  },
  {
    t0: T.B3,
    id: 'B3',
    kind: 'detail',
    what: 'detalle: las manos de Luna sujetan la aleta y Nico pega la cinta',
    r: (t, lt) => {
      const rx = RX0;
      const cam = ck([[0, rx - 130, RY - 110, 3.0], [1.85, rx - 125, RY - 115, 3.2]], lt);
      const seam = {x: rx - 118, y: RY - 150};
      const pressT = EV.tape0 - T.B3;
      const tapeHand = keyed(lt, [
        [0, {dx: 220, dy: -160}],
        [pressT - 0.25, {dx: 30, dy: -24}, 'io'],
        [pressT, {dx: 0, dy: 0}, 'snap'],
        [pressT + 0.35, {dx: 4, dy: 4}],
        [1.85, {dx: 180, dy: -180}, 'io'],
      ]);
      const press = Math.exp(-Math.max(0, lt - pressT) * 8) * (lt > pressT ? 1 : 0);
      const N = NICO_COLORS;
      const Lc = LUNA_COLORS;
      return (
        <RoomShot
          t={t}
          cam={cam}
          fg={0}
          chars={
            <g>
              <CloseArm o={{x: rx - 330, y: RY + 120}} p={{x: rx - 175, y: RY - 70}} color={Lc.fur} outline={Lc.outline} sleeve={Lc.shirt} w={34} grip={1} hold={{kind: 'none'}} side={1} bend={-1} />
              <CloseArm o={{x: rx - 300, y: RY - 330}} p={{x: rx - 150, y: RY - 165}} color={Lc.fur} outline={Lc.outline} sleeve={Lc.shirt} w={34} grip={1} hold={{kind: 'none'}} side={-1} bend={1} />
              <CloseArm o={{x: rx + 120, y: RY - 420}} p={{x: seam.x + (tapeHand.dx ?? 0), y: seam.y + (tapeHand.dy ?? 0) + press * 4}} color={N.fur} outline={N.outline} sleeve={N.shirt} w={36} grip={lt < pressT + 0.1 ? 0.9 : 0.2} hold={lt < pressT ? hold('tapeStrip', 1.1) : hold('none')} side={1} bend={1} />
            </g>
          }
          front={<Burst x={seam.x} y={seam.y} u={(lt - pressT) / 0.5} r={60} />}
        />
      );
    },
  },
  {
    t0: T.B4,
    id: 'B4',
    kind: 'medium',
    what: 'Bip camina como robot llevando la llave y la aleta amarilla',
    r: (t, lt) => {
      const {i, ph} = beatPhase(t);
      const n0 = beatPhase(T.B4).i;
      const steps = i - n0 + ease('snap', clamp(ph * 3));
      const bx = -330 + steps * 85;
      const cam = ({x: bx + 30, y: 20, zoom: 4.2, roll: 0});
      const b = bip2(t, {x: bx, y: 150, scale: 1.05, armR: L(-0.55, 0.3), armL: L(0.6, -0.25), gripR: 1, gripL: 1, holdR: hold('wrench', 0), holdL: hold('fin', 0.2, 0.75), bob: -6 * Math.exp(-ph * 6), headTilt: (i % 2 ? 0.08 : -0.08) * Math.exp(-ph * 4), legL: L(i % 2 ? 0.3 * (1 - ph) : 0, 0), legR: L(i % 2 ? 0 : -0.3 * (1 - ph), 0)}, {face: lt < 1.0 ? 'focus' : 'happy'});
      b.holdL = {kind: 'fin', rot: 0.2, s: 0.75, c: '#ffd23f'};
      return <RoomShot t={t} cam={cam} chars={<Bip2 id="b4b" p={b} />} />;
    },
  },
  {
    t0: T.B5,
    id: 'B5',
    kind: 'medium',
    what: 'Nico lleva la aleta azul, toma impulso y la encaja',
    r: (t, lt) => {
      const rx = RX0;
      const cam = ck([[0, rx + 410, -60, 3.0], [1.9, rx + 260, -70, 3.1]], lt);
      const c = EV.fin1 - T.B5;
      const walkU = clamp(lt / 0.7);
      const nx = lerp(560, 345, ease('io', walkU));
      const pos = {x: nx, y: 110, scale: 1, facing: -1 as const};
      const S = SHOULDERS.nico;
      const slot = {x: rx + 175, y: RY - 95};
      const thrustR = reachLimb(pos, S.R, S.l1, S.l2, slot, 1);
      const thrustL = reachLimb(pos, S.L, S.l1, S.l2, {x: slot.x + 10, y: slot.y + 18}, 1);
      const carry = {armR: L(0.8, 0.6), armL: L(0.7, 0.6), gripR: 1, gripL: 1};
      const pose = keyed(lt, [
        [0, {...walkCycle(lt * 1.8, 0.7), ...carry, expr: {look: {x: 1, y: 0}, mouth: 'smile'}}],
        [0.7, {...carry, expr: {look: {x: 1, y: 0.2}, mouth: 'flat', browL: -0.5, browR: -0.3}}],
        [c - 0.18, {...carry, lean: -0.22, ...crouchK(0.5), armR: L(-0.3, 1.4), armL: L(-0.2, 1.3), expr: {eyes: 'squint', mouth: 'ee', browL: -0.7, browR: -0.7}}, 'back'],
        [c, {armR: thrustR, armL: thrustL, gripR: 1, gripL: 1, lean: 0.28, expr: {eyes: 'squint', mouth: 'ee'}}, 'snap'],
        [c + 0.3, {armR: thrustR, armL: thrustL, gripR: 0.3, gripL: 0.3, lean: 0.1, expr: {eyes: 'wide', mouth: 'o', brow: 1}}],
        [1.2 + 0.35, {armR: reachLimb(pos, S.R, S.l1, S.l2, {x: rx + 150, y: RY - 160}, 1), gripR: 0.2, lean: 0.12, expr: {mouth: 'grin', look: {x: 1, y: -0.2}}}],
        [1.9, {...cheer(t), lean: 0, bob: -8, expr: {eyes: 'happy', mouth: 'laugh', cheeks: 1}}],
      ]);
      const n = nico2(t, {...pos, ...pose, holdR: t < EV.fin1 ? {kind: 'fin', rot: 0.9, s: 1.05, c: '#2f6fd6'} : t < EV.tape1 ? hold('tapeStrip', 1.2) : hold('none'), expr: ex(t, 1, pose.expr)}, {belt: 1}, 0.8);
      return <RoomShot t={t} cam={cam} chars={<Nico2 id="b5n" p={n} />} />;
    },
  },
  {
    t0: T.B6,
    id: 'B6',
    kind: 'medium',
    what: 'Bip encaja la aleta amarilla y la ajusta con la llave',
    r: (t, lt) => {
      const rx = RX0;
      const cam = ck([[0, rx + 90, 0, 3.6], [1.9, rx + 80, 0, 3.9]], lt);
      const c = EV.fin2 - T.B6;
      const pos = {x: rx + 150, y: 150, scale: 1.05, facing: -1 as const};
      const S = SHOULDERS.bip;
      const slot = {x: rx + 12, y: RY - 70};
      const reachL = reachLimb(pos, S.L, S.l1, S.l2, slot, 1);
      const reachR = reachLimb(pos, S.R, S.l1, S.l2, {x: slot.x + 16, y: slot.y + 30 + Math.sin(t * 16) * 6}, 1);
      const pose = keyed(lt, [
        [0, {armL: L(0.6, -0.25), armR: L(-0.55, 0.3), gripL: 1, gripR: 1}],
        [c - 0.2, {armL: L(0.3, -1.2), armR: L(-0.55, 0.3), lean: -0.15, gripL: 1, gripR: 1}, 'back'],
        [c, {armL: reachL, armR: L(-0.55, 0.3), lean: 0.2, gripL: 1, gripR: 1}, 'snap'],
        [c + 0.3, {armL: L(0.6, -0.4), armR: reachR, lean: 0.1, gripL: 0, gripR: 1}],
      ]);
      const b = bip2(t, {...pos, ...pose, armR: lt > c + 0.3 ? reachR : pose.armR}, {face: lt < c + 0.2 ? 'focus' : lt < 1.4 ? 'focus' : 'stars'});
      b.holdL = t < EV.fin2 ? {kind: 'fin', rot: 0.2, s: 0.75, c: '#ffd23f'} : {kind: 'none'};
      b.holdR = {kind: 'wrench', rot: lt > c + 0.3 ? Math.sin(t * 16) * 0.5 : 0};
      const sparks = lt > c + 0.35 && lt < 1.5 ? <Burst x={slot.x + 10} y={slot.y + 40} u={((lt - c) * 3) % 1} r={40} /> : null;
      return <RoomShot t={t} cam={cam} chars={<Bip2 id="b6b" p={b} />} front={sparks} />;
    },
  },
  {
    t0: T.B7,
    id: 'B7a',
    kind: 'detail',
    what: 'detalle: las manos de Nico recortan el papel rosa, un corte en cada pulso',
    r: (t, lt) => {
      const cam = ck([[0, 380, -150, 3.4], [1.5, 385, -155, 3.6]], lt);
      const {i, ph} = beatPhase(t);
      const n0 = beatPhase(T.B7).i;
      const cuts = i - n0 + Math.min(1, ph * 3);
      const snip = Math.exp(-ph * 7);
      const N = NICO_COLORS;
      const px = 330;
      const py = -170;
      const cutLen = Math.min(150, cuts * 38);
      const bits = Array.from({length: 4}, (_, k) => {
        const tb = BEATS[i - k] ?? 0;
        const u = (t - tb) / 0.9;
        return u > 0 && u < 1 && i - k >= n0 ? <rect key={k} x={px + 40 + k * 9} y={py + 40 + u * 200} width={14} height={8} fill="#ff9ad5" stroke="#b0457e" strokeWidth={1.5} transform={`rotate(${(u * 400 + k * 50).toFixed(0)} ${px + 40 + k * 9} ${py + 40 + u * 200})`} /> : null;
      });
      return (
        <RoomShot
          t={t}
          cam={cam}
          fg={0}
          rocket={false}
          chars={
            <g>
              <path d={`M${px - 90},${py - 60} L${px + 70},${py - 80} L${px + 90},${py + 70} L${px - 70},${py + 90}Z`} fill="#ff9ad5" stroke="#b0457e" strokeWidth={4} strokeLinejoin="round" />
              <path d={`M${px - 60},${py - 30} l40,-6 M${px - 50},${py} l60,-8`} stroke="#ffffff" strokeWidth={4} strokeDasharray="8 6" opacity={0.7} />
              <path d={`M${px + 80},${py - 70} L${px + 80 - cutLen * 0.8},${py - 70 + cutLen}`} stroke="#b0457e" strokeWidth={3} strokeDasharray="6 4" />
              <CloseArm o={{x: px - 260, y: py + 260}} p={{x: px - 70, y: py + 70}} color={N.fur} outline={N.outline} sleeve={N.shirt} w={34} grip={1} hold={{kind: 'none'}} side={-1} bend={-1} />
              <CloseArm o={{x: px + 300, y: py + 260}} p={{x: px + 80 - cutLen * 0.8 + 30, y: py - 70 + cutLen + 40}} color={N.fur} outline={N.outline} sleeve={N.shirt} w={34} grip={1} hold={{kind: 'scissors', rot: 2.6 + 0.25 * snip, s: 2.2}} side={1} bend={1} />
              {bits}
            </g>
          }
        />
      );
    },
  },
  {
    t0: T.B7b,
    id: 'B7b',
    kind: 'medium',
    what: 'Nico enrolla el papel como punta; Luna espera con la ventana',
    r: (t, lt) => {
      const cam = ck([[0, 430, -50, 2.75], [1.4, 420, -60, 2.9]], lt);
      const {ph} = beatPhase(t);
      const snip = Math.exp(-ph * 7);
      const ready = t >= EV.coneReady;
      const n = nico2(t, {x: 330, y: 110, facing: 1, armR: L(-1.25 + 0.12 * snip, 0.75), armL: L(1.0, -1.45), gripR: 1, gripL: 1, holdR: ready ? hold('none') : hold('scissors', -0.3 - 0.25 * snip), holdL: ready ? hold('cone', 0, 1.1) : hold('paper', 0.2, 0.9), headTilt: 0.12, ...(ready ? {armL: L(2.6, 0.3), bob: -8} : {}), expr: ex(t, 1, ready ? {eyes: 'happy', mouth: 'laugh', cheeks: 1} : {look: {x: 0.5, y: 0.6}, mouth: 'flat', browL: -0.4, browR: 0.1})}, {belt: 1}, 0.5);
      const l = luna2(t, {x: 560, y: 120, facing: -1, armR: L(-1.0, 0.95), armL: L(1.0, -0.95), gripR: 1, gripL: 1, holdR: hold('window', 2.7, 0.95), bob: -6 * Math.sin(ph * Math.PI), headTilt: 0.08 * Math.sin(t * 3.4), expr: ex(t, 4, {mouth: 'grin', look: {x: -0.6, y: 0.4}, eyes: ready ? 'happy' : 'normal'})});
      const bits = Array.from({length: 6}, (_, i) => {
        const b0 = beatPhase(t).i - i;
        const tb = BEATS[b0] ?? 0;
        const u = (t - tb) / 1.2;
        return u > 0 && u < 1 && t < EV.coneReady ? <rect key={i} x={395 + i * 7 - u * 10} y={-200 + u * 300} width={10} height={6} fill="#ff9ad5" transform={`rotate(${u * 300 + i * 40} ${400 + i * 7} ${-200 + u * 300})`} /> : null;
      });
      return <RoomShot t={t} cam={cam} chars={<><Luna2 id="b7l" p={l} /><Nico2 id="b7n" p={n} /></>} front={<g>{bits}<Burst x={250} y={-270} u={(t - EV.coneReady) / 0.6} r={90} /></g>} />;
    },
  },
  {
    t0: T.B8,
    id: 'B8',
    kind: 'medium',
    what: 'Luna, subida a la caja, coloca la ventana redonda',
    r: (t, lt) => {
      const rx = RX0;
      const cam = ck([[0, rx - 60, -230, 3.2], [1.9, rx - 50, -240, 3.4]], lt);
      const c = EV.window - T.B8;
      const pos = {x: rx - 105, y: -90, scale: 1, facing: 1 as const};
      const S = SHOULDERS.luna;
      const win = {x: rx - 4, y: RY - 300};
      const pR = reachLimb(pos, S.R, S.l1, S.l2, win, -1);
      const pL = reachLimb(pos, S.L, S.l1, S.l2, {x: win.x - 14, y: win.y + 22}, -1);
      const pose = keyed(lt, [
        [0, {armR: L(-1.4, 0.6), armL: L(1.2, -1.6), gripR: 1, gripL: 1, expr: {look: {x: 0.8, y: -0.4}, eyes: 'wide', mouth: 'smile'}}],
        [c - 0.2, {armR: L(-1.2, 1.3), armL: L(1.0, -2.0), lean: -0.18, gripR: 1, gripL: 1, expr: {eyes: 'squint', mouth: 'ee'}}, 'back'],
        [c, {armR: pR, armL: pL, lean: 0.15, gripR: 1, gripL: 1, expr: {eyes: 'squint', mouth: 'ee'}}, 'snap'],
        [c + 0.25, {armR: pR, armL: pL, lean: 0.05, gripR: 0.2, gripL: 0.2, expr: {eyes: 'wide', mouth: 'o', brow: 1}}],
        [c + 0.6, {...pointAt(1, 0.4), armL: L(1.0, -1.0), expr: {eyes: 'happy', mouth: 'laugh', cheeks: 1}}],
        [1.9, {armR: L(-1.1, 1.3), armL: L(1.1, -1.3), gripR: 0.5, gripL: 0.5, bob: -6 * Math.sin(t * 9), expr: {eyes: 'happy', mouth: 'laugh', cheeks: 1}}],
      ]);
      const l = luna2(t, {...pos, ...pose, holdR: t < EV.window ? hold('window', 2.9, 1) : hold('none'), expr: ex(t, 4, pose.expr)}, lt > c ? 0.7 : 0);
      const box = (
        <g transform={`translate(${rx - 105} 0)`}>
          <rect x={-75} y={-90} width={150} height={100} rx={6} fill="#c79a5e" stroke="#7a5428" strokeWidth={5} />
          <rect x={-40} y={-60} width={80} height={24} rx={4} fill="#f6ecc4" opacity={0.8} />
        </g>
      );
      return <RoomShot t={t} cam={cam} chars={<>{box}<Luna2 id="b8l" p={l} /></>} />;
    },
  },
  {
    t0: T.B9,
    id: 'B9',
    kind: 'medium',
    what: 'Bip vuela con sus propulsores y coloca la punta de papel',
    r: (t, lt) => {
      const rx = RX0;
      const c = EV.nose - T.B9;
      const cam = ck([[0, rx + 70, 0, 2.6], [1.3, rx + 30, -420, 2.6], [1.9, rx + 20, -430, 2.7]], lt);
      const up = ease('io', clamp(lt / 1.0));
      const pos = {x: rx + lerp(170, 92, up), y: lerp(140, -300, up), scale: 1, facing: -1 as const};
      const S = SHOULDERS.bip;
      const top = {x: rx, y: RY - 445};
      const rR = reachLimb(pos, S.R, S.l1 * 1.8, S.l2 * 1.8, top, 1);
      const pose = keyed(lt, [
        [0, {armR: L(-2.8, 0), armL: L(2.8, 0), gripR: 1, gripL: 1}],
        [c - 0.2, {armR: L(-2.6, -0.4), armL: L(2.9, 0.1), lean: -0.2, gripR: 1, gripL: 1}, 'back'],
        [c, {armR: rR, armL: L(2.6, 0.3), lean: 0.2, gripR: 1, gripL: 0.5}, 'snap'],
        [c + 0.3, {armR: rR, armL: L(2.6, 0.3), gripR: 0, gripL: 0}],
        [1.9, {...cheer(t)}],
      ]);
      const b = bip2(t, {...pos, ...pose, bob: Math.sin(t * 5) * 6}, {face: lt < c ? 'focus' : 'laugh'}, {jets: up > 0.02 ? 1 : 0, armLen: lerp(1, 1.8, ease('io', (lt - c + 0.5) / 0.4))} as never);
      b.holdR = t < EV.nose ? {kind: 'cone', rot: Math.PI, s: 1.4} : {kind: 'none'};
      const n = nico2(t, {x: rx + 330, y: 110, facing: -1, headTurn: 0.3, expr: ex(t, 1, {mouth: lt > c ? 'laugh' : 'o', eyes: lt > c ? 'happy' : 'wide', look: {x: 0.6, y: -1}}), ...(lt > c ? cheer(t) : pointAt(1, 0.9))});
      return <RoomShot t={t} cam={cam} chars={<><Nico2 id="b9n" p={n} /><Bip2 id="b9b" p={b} /></>} />;
    },
  },
  {
    t0: T.B10,
    id: 'B10',
    kind: 'medium',
    what: 'Nico encuentra el colador, lo levanta y se lo pone de casco',
    r: (t, lt) => {
      const cam = ck([[0, 330, -60, 3.8], [1.9, 310, -100, 4.2]], lt);
      const g = EV.colGrab - T.B10;
      const on = EV.colOn - T.B10;
      const pos = {x: 300, y: 110, scale: 1, facing: 1 as const};
      const S = SHOULDERS.nico;
      const col = {x: 380, y: 24};
      const rR = reachLimb(pos, S.R, S.l1, S.l2, col, -1);
      const headTop = {armR: L(2.7, 0.55), armL: L(-2.7, -0.55)};
      const pose = keyed(lt, [
        [0, {expr: {look: {x: 0.8, y: 0.8}, mouth: 'o', eyes: 'wide'}}],
        [g, {...crouchK(0.9), lean: 0.3, armR: rR, gripR: 0.2, expr: {look: {x: 0.6, y: 1}, mouth: 'grin'}}, 'back'],
        [g + 0.1, {...crouchK(0.9), lean: 0.3, armR: rR, gripR: 1}],
        [g + 0.45, {armR: L(-2.7, -0.3), armL: L(2.0, 0.3), gripR: 1, bob: -6, expr: {eyes: 'wide', mouth: 'grin', look: {x: 0.2, y: -1}}}, 'over'],
        [on, {...headTop, gripR: 1, gripL: 1, expr: {eyes: 'happy', mouth: 'grin'}}],
        [on + 0.2, {...headTop, gripR: 0.2, gripL: 0.2, squash: 0.08}],
        [1.9, {armR: L(-1.4, 0.9), armL: L(1.4, -0.9), gripR: 0.8, gripL: 0.8, expr: {mouth: 'grin', eyes: 'normal', look: {x: 0, y: 0}}}],
      ]);
      const n = nico2(t, {...pos, ...pose, holdR: lt > g + 0.05 && lt < on ? hold('colander', Math.PI, 1) : hold('none'), expr: ex(t, 1, pose.expr)}, {belt: 1}, 0.7);
      const onHead = lt >= on;
      const hx = pos.x + 6 * n.headTurn * 1;
      return (
        <RoomShot
          t={t}
          cam={cam}
          chars={
            <>
              <Nico2 id="b10n" p={n} />
              {onHead && (
                <g transform={`translate(${hx} ${pos.y + n.bob - 268 + n.squash * 60}) scale(1.4)`}>
                  <g transform="translate(0 -26)">
                    <path d="M-46,20 A46,40 0 0 1 46,20Z" fill="#c8d2dc" stroke="#5a6470" strokeWidth={4} />
                    {Array.from({length: 8}, (_, i) => (
                      <circle key={i} cx={-24 + (i % 4) * 16} cy={4 + Math.floor(i / 4) * 10} r={2.6} fill="#5a6470" />
                    ))}
                    <rect x={44} y={10} width={18} height={8} rx={4} fill="#8a94a0" />
                  </g>
                </g>
              )}
            </>
          }
        />
      );
    },
  },
  {
    t0: T.B11,
    id: 'B11',
    kind: 'reaction',
    what: 'el colador se convierte en casco espacial; Luna y Bip se ríen',
    r: (t, lt) => {
      const cam = ck([[0, 325, -70, 2.8], [0.9, 320, -75, 2.95]], lt);
      const hk = smoothstep(0.05, 0.35, lt);
      const n = nico2(t, {x: 250, y: 150, scale: 1.05, helmet: hk, ...cheer(t), bob: -10 * Math.sin(Math.min(1, lt / 0.5) * Math.PI), expr: ex(t, 1, {eyes: 'wide', mouth: 'grin', brow: 0.8})}, {belt: 1}, 0.8);
      const l = luna2(t, {x: 410, y: 70, scale: 0.95, facing: -1, armR: L(-0.7, 1.9), armL: L(0.7, -1.9), gripR: 0.5, gripL: 0.5, lean: -0.08 + 0.06 * Math.sin(t * 14), expr: ex(t, 4, {eyes: 'happy', mouth: 'laugh', cheeks: 1})}, 0.5);
      const b = bip2(t, {x: 330, y: 40, scale: 0.92, facing: -1, armR: L(-2.4, -0.4), armL: L(2.4, 0.4), bob: -6 * Math.abs(Math.sin(t * 9))}, {face: 'laugh'});
      const colK = 1 - hk;
      return (
        <RoomShot
          t={t}
          cam={cam}
          chars={
            <>
              <Bip2 id="b11b" p={b} />
              <Luna2 id="b11l" p={l} />
              <Nico2 id="b11n" p={n} />
              {colK > 0.01 && (
                <g transform={`translate(${250 + 6 * n.headTurn * 1.05} ${150 + (n.bob - 268) * 1.05}) scale(1.47)`} opacity={colK}>
                  <path d="M-46,-6 A46,40 0 0 1 46,-6Z" fill="#c8d2dc" stroke="#5a6470" strokeWidth={4} />
                </g>
              )}
            </>
          }
          front={<Burst x={256} y={-130} u={lt / 0.6} r={190} />}
        />
      );
    },
  },
  {
    t0: T.B12,
    id: 'B12',
    kind: 'wide',
    what: 'los tres empujan el cohete hasta la alfombra',
    r: (t, lt) => {
      const rx = rocketX(t);
      const cam = ({x: rx + 230, y: -230, zoom: 1.6, roll: 0});
      const moving = t > EV.pushA && t < EV.pushB;
      const effort = {eyes: 'squint' as const, mouth: 'ee' as const, browL: -0.6, browR: -0.6};
      const done = t >= EV.pushB;
      const S = SHOULDERS.nico;
      const nPos = {x: rx + 265, y: 110, scale: 1, facing: -1 as const};
      const push = (pos: typeof nPos, target: {x: number; y: number}): PK => ({armR: reachLimb(pos, S.R, S.l1, S.l2, target, 1), armL: reachLimb(pos, S.L, S.l1, S.l2, {x: target.x, y: target.y + 26}, 1), gripR: 0.2, gripL: 0.2});
      const wk = moving ? walkCycle((t - EV.pushA) * 2.2, 0.8) : {};
      const nP: PK = done ? {...cheer(t), expr: {eyes: 'happy', mouth: 'laugh', cheeks: 1}} : {...push(nPos, {x: rx + 196, y: RY - 70}), lean: 0.32, ...wk, expr: effort};
      const lPos = {x: rx + 375, y: 116, scale: 1, facing: -1 as const};
      const lP: PK = done ? {armR: L(-1.0, 1.6), armL: L(1.0, -1.6), lean: -0.1, expr: {eyes: 'happy', mouth: 'grin'}} : {...push(lPos, {x: rx + 300, y: -100}), lean: 0.3, ...wk, expr: effort};
      const bPos = {x: rx + 470, y: 130, scale: 1, facing: -1 as const};
      const n = nico2(t, {...nPos, ...nP, helmet: 1, armR: done ? nP.armR : nP.armR, expr: ex(t, 1, nP.expr)}, {belt: 1}, 0.9);
      const l = luna2(t, {...lPos, ...lP, expr: ex(t, 4, lP.expr)}, done ? 0.6 : 0);
      const b = bip2(t, {...bPos, armR: L(1.57, 0), armL: L(1.4, 0.1), lean: done ? 0 : 0.25, ...(moving ? walkCycle((t - EV.pushA) * 2.2, 0.6) : {}), ...(done ? cheer(t) : {})}, {face: done ? 'stars' : 'focus'});
      const puffs = moving
        ? Array.from({length: 5}, (_, i) => {
            const u = ((t * 2 + i * 0.2) % 1);
            return <circle key={i} cx={rx + 130 + u * 80} cy={CART_Y + 30 - u * 30} r={10 + u * 24} fill="#ffffff" opacity={0.4 * (1 - u)} />;
          })
        : null;
      return <RoomShot t={t} cam={cam} chars={<><Bip2 id="b12b" p={b} /><Luna2 id="b12l" p={l} /><Nico2 id="b12n" p={n} /></>} front={puffs} />;
    },
  },
  {
    t0: T.B13,
    id: 'B13',
    kind: 'wide',
    what: 'plano general: Luna pega una estrella, se encienden las luces, admiran el cohete y miran a cámara',
    r: (t, lt) => {
      const rx = RX1;
      const cam = ck([[0, rx + 120, -330, 1.25], [2.7, rx + 100, -300, 1.4]], lt);
      const turned = t >= EV.turn;
      const look = (seed: number, face: 1 | -1) => ex(t, seed, turned ? {mouth: 'laugh', eyes: 'happy', cheeks: 1} : {mouth: 'o', eyes: 'wide', look: {x: face * 0.7, y: -0.9}, brow: 0.8});
      const n = nico2(t, {x: rx + 300, y: 140, facing: -1, helmet: 1, headTurn: turned ? 0 : 0.5, ...(turned ? cheer(t) : {}), ...(turned ? jump(t, EV.turn, 0.5, 40) : {}), expr: look(1, 1)}, {belt: 1}, 0.9);
      const S = SHOULDERS.luna;
      const lPos = {x: rx - 200, y: 130, scale: 1, facing: 1 as const};
      const starT = EV.star - T.B13;
      const lP = keyed(lt, [
        [0, {armR: L(0.9, 0.6), gripR: 1}],
        [starT - 0.1, {armR: reachLimb(lPos, S.R, S.l1, S.l2, {x: rx - 92, y: RY - 210}, -1), gripR: 1, lean: 0.15}, 'back'],
        [starT + 0.3, {armR: L(0.6, 0.4), gripR: 0.3, lean: 0}],
      ]);
      const l = luna2(t, {...lPos, ...lP, holdR: t < EV.star ? hold('star', 0, 0.9) : hold('none'), ...(turned ? {...cheer(t), ...jump(t, EV.turn + 0.1, 0.5, 40)} : {}), expr: look(4, 1)}, turned ? 0.6 : 0.3);
      const b = bip2(t, {x: rx + 450, y: 150, facing: -1, ...(turned ? cheer(t) : {armR: L(-0.6, 0.4)})}, {face: turned ? 'love' : 'wow'});
      return <RoomShot t={t} cam={cam} fg={1} chars={<><Bip2 id="b13b" p={b} /><Luna2 id="b13l" p={l} /><Nico2 id="b13n" p={n} /></>} />;
    },
  },
];
