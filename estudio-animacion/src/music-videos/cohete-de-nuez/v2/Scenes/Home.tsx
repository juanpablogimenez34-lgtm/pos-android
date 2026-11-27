// REGRESO Y FINAL (115,36 → 142,58 s).
// R1 rumbo a la Tierra · R2 bajan entre nubes · H1 aterrizan en la alfombra
// H2 se quitan los cascos (las orejas de Luna saltan) · H3 chocan las manos y se ríen
// H4 recogen (cada uno lleva algo en las manos) · H5 anochece: Nico bosteza
// H6 Bip apaga la luz · H7 Nico y Luna, sentados, miran la ventana
// O1 Zumi aparece como estrella y guiña · O2 primer plano: se duermen apoyados · O3 plano final.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, hash1, lerp, smoothstep} from '../../../../engine/math';
import {Cam, pulsed} from '../../Camera/cam2d';
import {RoomState} from '../../Environments/Room';
import {Burst} from '../../Effects/Fx';
import {Earth} from '../../Environments/Space';
import {bip2, cheer, crouchK, ease, ex, hold, jump, keyed, L, luna2, nico2, walkCycle} from '../Animation/acting';
import {Bip2} from '../Characters/Bip2';
import {Luna2} from '../Characters/Luna2';
import {Nico2} from '../Characters/Nico2';
import {at, Shot, snap} from '../Shots/shot';
import {CrewInWindow} from '../Stages/Crew2';
import {BUILT2, NutRocket2} from '../Stages/Rocket2';
import {ALL_MATERIALS, Cart, Room2, reachLimb, SHOULDERS} from '../Stages/Sets2';
import {LOOKS} from '../Stages/Space2';
import {Sky, SpaceRocket} from './Flight';
import {CART_Y, RX1, RY} from './Build';

export const HT = {
  R1: at('interlude'),
  R2: snap(117.725),
  H1: at('verse3'),
  H2: at('verse3', 1),
  H3: at('verse3', 2),
  H4: at('verse3', 3),
  H5: at('verse3', 4),
  H6: at('verse3', 5),
  H7: at('verse3', 6),
  O1: at('outro'),
  O2: snap(138.275),
  O3: snap(140.132),
};
const LIGHTS_OFF = HT.H6 + 0.7;
const nightAt = (t: number) => smoothstep(HT.H5, HT.H5 + 1.6, t);
const room = (t: number): RoomState => ({night: nightAt(t), materials: 1, nutOnTable: 0, t, tidy: 0, zumiStar: smoothstep(HT.O1 + 0.8, HT.O1 + 1.8, t)});
const pileAt = (t: number) => {
  const k = smoothstep(HT.H4 + 0.3, HT.H4 + 1.6, t);
  return {...ALL_MATERIALS, box: 0, cards: k > 0.5 ? 0 : 2, colander: 0, scissors: 0, rolls: 1 - k, tapes: 1 - k};
};

const HomeRoom: React.FC<{t: number; cam: Cam; children: React.ReactNode; landY?: number; engine?: number; squash?: number; fg?: number}> = ({t, cam, children, landY = 0, engine = 0, squash = 0, fg = 1}) => {
  const off = smoothstep(LIGHTS_OFF, LIGHTS_OFF + 0.3, t);
  return (
    <g>
      <Room2 cam={pulsed(cam, t, 0.2)} s={room(t)} fg={fg} pile={pileAt(t)}>
        <Cart x={RX1} y={CART_Y} wheel={0} />
        <NutRocket2 id="hr" p={{x: RX1, y: RY + landY, scale: 1, rot: 0, build: {...BUILT2, lights: 1 - 0.6 * off}, vibrate: 0, engine, glow: 0.15 + 0.35 * off, t, squash}} windowContent={landY < -10 ? <CrewInWindow t={t} mode="cheer" uid="hrc" /> : undefined} />
        {children}
      </Room2>
      <rect width={1080} height={1920} fill="#0a0628" opacity={0.38 * off} />
    </g>
  );
};

export const HOME_SHOTS: Shot[] = [
  {
    t0: HT.R1,
    id: 'R1',
    kind: 'planet',
    what: 'rumbo a casa: la Tierra crece en el centro',
    r: (t, lt, dur) => {
      const k = ease('io', lt / dur);
      return (
        <g>
          <Sky t={t} look={LOOKS.violet} />
          <Earth x={540} y={lerp(700, 820, k)} r={lerp(180, 520, k)} t={t} />
          <SpaceRocket t={t} uid="r1" crew="wave" p={{x: lerp(260, 520, k), y: lerp(1600, 1420, k), scale: lerp(0.7, 0.45, k), rot: 0.2}} />
        </g>
      );
    },
  },
  {
    t0: HT.R2,
    id: 'R2',
    kind: 'action',
    what: 'bajan suavemente entre nubes rosadas del atardecer',
    r: (t, lt) => (
      <g>
        <AbsoluteFill style={{background: 'linear-gradient(#ff9ab8, #ffd2a0)'}} />
        {Array.from({length: 12}, (_, i) => {
          const y = ((hash1(i * 3) * 2400 - lt * 700 * (0.6 + hash1(i))) % 2400 + 2400) % 2400 - 300;
          return (
            <g key={i} transform={`translate(${hash1(i * 7) * 1300 - 110} ${y}) scale(${0.8 + hash1(i * 2) * 1.4})`} opacity={0.92}>
              <ellipse rx={150} ry={56} fill="#fff4f0" />
              <ellipse cx={-50} cy={-30} rx={90} ry={60} fill="#fff4f0" />
              <ellipse cx={55} cy={-22} rx={80} ry={52} fill="#ffe0e8" />
            </g>
          );
        })}
        <SpaceRocket t={t} uid="r2" crew="cheer" trail={0.5} p={{x: 540 + Math.sin(t * 1.2) * 40, y: lerp(700, 1050, lt / 1.9), scale: 0.85, rot: Math.sin(t * 1.5) * 0.06, engine: 0.6}} />
      </g>
    ),
  },
  {
    t0: HT.H1,
    id: 'H1',
    kind: 'wide',
    what: 'el cohete aterriza suavemente sobre su carrito en la alfombra',
    r: (t, lt) => {
      const u = clamp(lt / 1.3);
      const y = lerp(-1700, 0, 1 - Math.pow(1 - u, 3));
      const sq = lt > 1.3 ? 0.1 * Math.exp(-(lt - 1.3) * 7) * Math.cos((lt - 1.3) * 18) : 0;
      return (
        <HomeRoom t={t} cam={{x: RX1 + 80, y: -380, zoom: 1.35, roll: 0}} landY={y} engine={1 - smoothstep(1.0, 1.5, lt)} squash={sq}>
          <Burst x={RX1} y={CART_Y} u={(lt - 1.3) / 0.6} r={300} />
        </HomeRoom>
      );
    },
  },
  {
    t0: HT.H2,
    id: 'H2',
    kind: 'medium',
    what: 'salen de un salto y se quitan los cascos; las orejas de Luna saltan hacia arriba',
    r: (t, lt) => {
      const hk = 1 - smoothstep(0.55, 0.85, lt);
      const pop = lt > 0.85 ? Math.exp(-(lt - 0.85) * 4) * Math.sin((lt - 0.85) * 16) : 0;
      const l = luna2(t, {x: RX1 + 190, y: 120, facing: -1, helmet: hk, ...jump(t, HT.H2, 0.45, 50), ...(lt > 0.45 ? {armL: L(-2.5, -0.7), armR: L(2.5, 0.7), gripL: 1, gripR: 1} : {}), ...(lt > 0.9 ? cheer(t) : {}), expr: ex(t, 4, lt > 0.85 ? {mouth: 'laugh', eyes: 'happy', cheeks: 1} : {mouth: 'grin'})}, 0, {earL: {a: -0.2 + pop * 0.3, bend: -0.3 + pop * 0.6}, earR: {a: 0.2 - pop * 0.3, bend: 0.4 - pop * 0.6}});
      const n = nico2(t, {x: RX1 + 380, y: 130, facing: -1, helmet: 1 - smoothstep(0.75, 1.05, lt), ...jump(t, HT.H2 + 0.2, 0.45, 50), ...(lt > 1.1 ? cheer(t) : {}), expr: ex(t, 1, {mouth: 'laugh', eyes: lt > 1.0 ? 'happy' : 'normal', cheeks: 1})}, {}, 0.9);
      return (
        <HomeRoom t={t} cam={{x: RX1 + 285, y: -90, zoom: 2.75, roll: 0}}>
          <Nico2 id="h2n" p={n} />
          <Luna2 id="h2l" p={l} />
        </HomeRoom>
      );
    },
  },
  {
    t0: HT.H3,
    id: 'H3',
    kind: 'medium',
    what: 'Nico y Luna chocan las manos y se ríen; Bip aplaude',
    r: (t, lt) => {
      const contact = 0.7;
      const meet = {x: RX1 + 290, y: -160};
      const nPos = {x: RX1 + 380, y: 130, scale: 1, facing: -1 as const};
      const lPos = {x: RX1 + 200, y: 120, scale: 1, facing: 1 as const};
      const k = ease('back', clamp((lt - 0.25) / (contact - 0.25)));
      const happy = lt > contact;
      const nA = lt < contact + 0.35 ? reachLimb(nPos, SHOULDERS.nico.R, 30, 28, {x: lerp(nPos.x - 40, meet.x, k), y: lerp(-80, meet.y, k)}, -1) : L(2.5, 0.4);
      const lA = lt < contact + 0.35 ? reachLimb(lPos, SHOULDERS.luna.R, 29, 27, {x: lerp(lPos.x + 40, meet.x, k), y: lerp(-80, meet.y + 6, k)}, -1) : L(2.5, 0.4);
      const n = nico2(t, {...nPos, armR: nA, gripR: 0, bob: happy ? -12 * Math.abs(Math.sin(t * 8)) : 0, expr: ex(t, 1, happy ? {mouth: 'laugh', eyes: 'happy', cheeks: 1} : {mouth: 'grin', eyes: 'wide'})}, {}, 1);
      const l = luna2(t, {...lPos, armR: lA, gripR: 0, bob: happy ? -12 * Math.abs(Math.sin(t * 8 + 1)) : 0, expr: ex(t, 4, happy ? {mouth: 'laugh', eyes: 'happy', cheeks: 1} : {mouth: 'grin', eyes: 'wide'})}, happy ? 0.6 : 0);
      const b = bip2(t, {x: RX1 + 300, y: 40, scale: 0.92, armL: L(-1.1, 1.2 + 0.4 * Math.sin(t * 16)), armR: L(1.1, -1.2 - 0.4 * Math.sin(t * 16))}, {face: happy ? 'laugh' : 'happy'});
      return (
        <HomeRoom t={t} cam={{x: meet.x, y: -110, zoom: 2.9, roll: 0}} fg={0}>
          <Bip2 id="h3b" p={b} />
          <Luna2 id="h3l" p={l} />
          <Nico2 id="h3n" p={n} />
          <Burst x={meet.x} y={meet.y} u={(lt - contact) / 0.6} r={110} />
        </HomeRoom>
      );
    },
  },
  {
    t0: HT.H4,
    id: 'H4',
    kind: 'wide',
    what: 'recogen: Luna lleva la caja, Nico las tijeras y la cinta, Bip los cartones',
    r: (t, lt) => {
      const w = lt * 1.9;
      const lx = lerp(RX1 + 200, 380, clamp(lt / 1.8));
      const nx = lerp(RX1 + 400, 520, clamp(lt / 1.8));
      const bx = lerp(RX1 + 40, 240, clamp(lt / 1.8));
      const l = luna2(t, {x: lx, y: 120, ...walkCycle(w, 0.8), armR: L(0.45, -0.1), armL: L(0.55, -0.2), gripR: 1, gripL: 1, holdR: hold('box', 0, 0.9), expr: ex(t, 4, {mouth: 'grin'}, 0.6)});
      const n = nico2(t, {x: nx, y: 140, ...walkCycle(w + 0.3, 0.8), armR: L(0.6, 0.5), armL: L(-0.4, 1.4), gripR: 1, gripL: 1, holdR: hold('scissors', 0.4, 1.2), holdL: hold('tape', 0, 1.1), expr: ex(t, 1, {mouth: 'grin'}, 0.6)}, {belt: 1}, 0.8);
      const b = bip2(t, {x: bx, y: 160, ...walkCycle(w + 0.6, 0.6), armR: L(0.9, 0.4), armL: L(0.9, 0.3), gripR: 1, gripL: 1, holdR: hold('cardboard', 1.4, 0.9)}, {face: 'happy'});
      return (
        <HomeRoom t={t} cam={{x: lerp(RX1 + 260, 300, lt / 1.9), y: -170, zoom: 1.9, roll: 0}}>
          <Luna2 id="h4l" p={l} />
          <Bip2 id="h4b" p={b} />
          <Nico2 id="h4n" p={n} />
        </HomeRoom>
      );
    },
  },
  {
    t0: HT.H5,
    id: 'H5',
    kind: 'medium',
    what: 'anochece por la ventana; Nico bosteza y se estira',
    r: (t, lt) => {
      const pose = keyed(lt, [
        [0, {expr: {mouth: 'smile'}}],
        [0.5, {armL: L(-2.6, -0.4), armR: L(2.6, 0.4), gripL: 1, gripR: 1, squash: -0.06, bob: -6, expr: {mouth: 'o', eyes: 'closed', mouthOpen: 1}}, 'io'],
        [1.3, {armL: L(-2.6, -0.4), armR: L(2.6, 0.4), gripL: 1, gripR: 1, squash: -0.06, bob: -6, expr: {mouth: 'o', eyes: 'closed', mouthOpen: 1}}],
        [1.8, {armL: L(-0.3, 0.3), armR: L(0.3, -0.3), expr: {mouth: 'smile', eyes: 'squint'}}, 'io'],
      ]);
      const n = nico2(t, {x: 300, y: 130, facing: -1, ...pose, expr: ex(t, 1, pose.expr)}, {belt: 0}, 0.3);
      return (
        <HomeRoom t={t} cam={{x: 200, y: -280, zoom: 2.3 + lt * 0.08, roll: 0}}>
          <Nico2 id="h5n" p={n} />
        </HomeRoom>
      );
    },
  },
  {
    t0: HT.H6,
    id: 'H6',
    kind: 'close',
    what: 'Bip pulsa el interruptor: se apaga la luz y su pantalla muestra cara de sueño',
    r: (t, lt) => {
      const sw = {x: 560, y: -420};
      const pos = {x: 470, y: -60, scale: 1, facing: 1 as const};
      const press = LIGHTS_OFF - HT.H6;
      const arm = keyed(lt, [
        [0, {armR: L(0.6, -0.3)}],
        [press - 0.1, {armR: reachLimb(pos, SHOULDERS.bip.R, 24 * 2.4, 24 * 2.4, sw, 1)}, 'back'],
        [press + 0.3, {armR: reachLimb(pos, SHOULDERS.bip.R, 24 * 2.4, 24 * 2.4, sw, 1)}],
        [1.9, {armR: L(0.5, -0.3)}],
      ]);
      const on = t < LIGHTS_OFF;
      const b = bip2(t, {...pos, ...arm, gripR: 0.8, headTurn: 0.4}, {face: on ? 'focus' : 'sleep'}, {armLen: lerp(1, 2.4, clamp(lt / Math.max(0.2, press - 0.1)) * (lt < press + 0.4 ? 1 : 1 - clamp((lt - press - 0.4) / 0.4))), jets: 1} as never);
      return (
        <HomeRoom t={t} cam={{x: 510, y: -300, zoom: 3.0, roll: 0}} fg={0}>
          <g transform={`translate(${sw.x} ${sw.y})`}>
            <rect x={-26} y={-40} width={52} height={80} rx={10} fill="#fff4e0" stroke="#8a6a4a" strokeWidth={4} />
            <rect x={-10} y={on ? -26 : -4} width={20} height={30} rx={5} fill="#ff9a3c" stroke="#8a4a1a" strokeWidth={3} />
          </g>
          <Bip2 id="h6b" p={b} />
        </HomeRoom>
      );
    },
  },
  {
    t0: HT.H7,
    id: 'H7',
    kind: 'medium',
    what: 'Nico y Luna, sentados en la alfombra junto al cohete, miran la ventana',
    r: (t, lt) => {
      const sit = {legL: L(1.5, 0), legR: L(1.4, -0.1), bob: 40, armL: L(0.5, -0.6), armR: L(0.6, -0.7)};
      const n = nico2(t, {x: RX1 + 300, y: 150, facing: -1, ...sit, headTurn: -0.5, headTilt: -0.08, expr: ex(t, 1, {mouth: 'smile', look: {x: 0.6, y: -0.9}})}, {}, 0.2);
      const l = luna2(t, {x: RX1 + 160, y: 150, facing: -1, ...sit, headTurn: -0.5, headTilt: 0.1, expr: ex(t, 4, {mouth: 'smile', look: {x: 0.6, y: -0.9}})});
      return (
        <HomeRoom t={t} cam={{x: RX1 + 120, y: -360, zoom: 1.55 + lt * 0.05, roll: 0}}>
          <Luna2 id="h7l" p={l} />
          <Nico2 id="h7n" p={n} />
        </HomeRoom>
      );
    },
  },
  {
    t0: HT.O1,
    id: 'O1',
    kind: 'detail',
    what: 'en la ventana de noche aparece Zumi como una estrella sonriente',
    r: (t, lt) => (
      <HomeRoom t={t} cam={{x: -460, y: -1180, zoom: 2.4 + lt * 0.05, roll: 0}} fg={0}>
        <g />
      </HomeRoom>
    ),
  },
  {
    t0: HT.O2,
    id: 'O2',
    kind: 'close',
    what: 'primer plano: Nico y Luna se duermen apoyados el uno en la otra',
    r: (t, lt) => {
      const sleepy = smoothstep(0.2, 1.2, lt);
      const sit = {legL: L(1.5, 0), legR: L(1.4, -0.1), bob: 40, armL: L(0.4, -0.6), armR: L(0.5, -0.7)};
      const n = nico2(t, {x: RX1 + 250, y: 150, facing: -1, ...sit, headTilt: -0.25 * sleepy, lean: -0.1 * sleepy, expr: ex(t, 1, {mouth: 'smile', eyes: sleepy > 0.5 ? 'closed' : 'squint'})}, {}, 0.1);
      const l = luna2(t, {x: RX1 + 160, y: 150, facing: -1, ...sit, headTilt: 0.22 * sleepy, lean: 0.1 * sleepy, expr: ex(t, 4, {mouth: 'smile', eyes: sleepy > 0.4 ? 'closed' : 'squint', cheeks: 1})});
      return (
        <HomeRoom t={t} cam={{x: RX1 + 205, y: -70, zoom: 3.1, roll: 0}} fg={0}>
          <Luna2 id="o2l" p={l} />
          <Nico2 id="o2n" p={n} />
        </HomeRoom>
      );
    },
  },
  {
    t0: HT.O3,
    id: 'O3',
    kind: 'wide',
    what: 'plano final: la habitación de noche con el cohete; la cámara se aleja',
    r: (t, lt, dur) => {
      const k = ease('io', lt / dur);
      const sit = {legL: L(1.5, 0), legR: L(1.4, -0.1), bob: 40, armL: L(0.4, -0.6), armR: L(0.5, -0.7)};
      const n = nico2(t, {x: RX1 + 250, y: 150, facing: -1, ...sit, headTilt: -0.25, lean: -0.1, expr: ex(t, 1, {mouth: 'smile', eyes: 'closed'})}, {}, 0.1);
      const l = luna2(t, {x: RX1 + 160, y: 150, facing: -1, ...sit, headTilt: 0.22, lean: 0.1, expr: ex(t, 4, {mouth: 'smile', eyes: 'closed', cheeks: 1})});
      const b = bip2(t, {x: RX1 + 400, y: 160, ...crouchK(0.3)}, {face: 'sleep'}, {lights: 0.2} as never);
      return (
        <g>
          <HomeRoom t={t} cam={{x: lerp(RX1 + 150, -200, k), y: lerp(-300, -650, k), zoom: lerp(1.6, 0.85, k), roll: 0}}>
            <Bip2 id="o3b" p={b} />
            <Luna2 id="o3l" p={l} />
            <Nico2 id="o3n" p={n} />
          </HomeRoom>
          <rect width={1080} height={1920} fill="#0a0628" opacity={smoothstep(dur - 0.9, dur, lt)} />
        </g>
      );
    },
  },
];
