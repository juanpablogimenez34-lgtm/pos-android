// CUENTA REGRESIVA Y DESPEGUE (30,999 → 42,3 s). Un corte en cada número (pulsos medidos):
// K1 se sientan · K2 Luna se ajusta el casco · K3 "5" pantalla de Bip · K4 "4" primer plano de Nico
// K5 "3" manos en los controles · K6 "2" el cohete vibra en la habitación · K7 "1" reacciones
// L1 "¡cero!" anticipación, vibración, luz y nubes de fantasía · L1b sube entre nubes
// L2 cabina: aceleración · L3 atraviesa las nubes · L4 la Tierra queda abajo.
import React from 'react';
import {clamp, hash1, lerp, smoothstep} from '../../../../engine/math';
import {Cam, layerT, pulsed} from '../../Camera/cam2d';
import {LUNA_COLORS} from '../../Characters/Luna';
import {NICO_COLORS} from '../../Characters/Nico';
import {Burst, Flash} from '../../Effects/Fx';
import {Earth} from '../../Environments/Space';
import {COUNT_TIMES, LIFTOFF} from '../../Timeline/timeline';
import {bip2, ex, L} from '../Animation/acting';
import {Bip2} from '../Characters/Bip2';
import {Luna2} from '../Characters/Luna2';
import {Nico2} from '../Characters/Nico2';
import {at, Shot, snap} from '../Shots/shot';
import {CockpitCrew, crewPoses, CrewInWindow, WinView} from '../Stages/Crew2';
import {NutRocket2, BUILT2} from '../Stages/Rocket2';
import {Cart, CloseArm, Cockpit2, Room2, World} from '../Stages/Sets2';
import {LOOKS, SpaceStage} from '../Stages/Space2';
import {CART_Y, RX1, RY} from './Build';

const CD = at('countdown');
export const CT = {
  K1: CD,
  K2: snap(CD + 0.93),
  K3: COUNT_TIMES[0],
  K4: COUNT_TIMES[1],
  K5: COUNT_TIMES[2],
  K6: COUNT_TIMES[3],
  K7: COUNT_TIMES[4],
  L1: LIFTOFF,
  L1b: snap(LIFTOFF + 0.93),
  L2: at('chorus1', 1),
  L3: at('chorus1', 2),
  L4: at('chorus1', 3),
};

/** Número grande de la cuenta (aparece con rebote en su pulso). */
export const CountNum: React.FC<{n: string; since: number; x?: number; y?: number}> = ({n, since, x = 870, y = 330}) => {
  const k = clamp(since / 0.18);
  const s = 0.4 + 0.75 * (1 - Math.pow(1 - k, 3)) - 0.15 * Math.max(0, Math.sin(clamp((since - 0.18) / 0.2) * Math.PI));
  return (
    <g transform={`translate(${x} ${y}) scale(${s.toFixed(3)})`} opacity={clamp(1.6 - since * 2.2)}>
      <text textAnchor="middle" y={70} fontFamily="Montserrat" fontWeight={900} fontSize={190} fill="#ffd23f" stroke="#4a2a7a" strokeWidth={16} paintOrder="stroke">
        {n}
      </text>
    </g>
  );
};

const cockpitView = (t: number, kind: Parameters<typeof WinView>[0]['kind'], lt: number, speed = 1) => <WinView t={t} kind={kind} local={lt} speed={speed} />;
const COCK: Cam = {x: 0, y: 120, zoom: 0.72, roll: 0};

/** Cohete en la habitación (despegue). */
const RoomLaunch: React.FC<{t: number; cam: Cam; y: number; vib: number; engine: number; squash: number; glow: number}> = ({t, cam, y, vib, engine, squash, glow}) => (
  <Room2 cam={cam} s={{night: 0, materials: 1, nutOnTable: 0, t, tidy: 0, zumiStar: 0}} fg={1}>
    <Cart x={RX1} y={CART_Y} wheel={0} />
    <NutRocket2 id="lr" p={{x: RX1, y: RY + y, scale: 1, rot: 0, build: BUILT2, vibrate: vib, engine, glow, t, squash}} windowContent={<CrewInWindow t={t} mode="pilot" uid="lrc" />} />
  </Room2>
);

/** Nubes de fantasía en anillo alrededor de la base al despegar. */
const PuffRing: React.FC<{x: number; y: number; u: number}> = ({x, y, u}) =>
  u > 0 && u < 1.4 ? (
    <g transform={`translate(${x} ${y})`} opacity={clamp(1.4 - u)}>
      {Array.from({length: 12}, (_, i) => {
        const a = (i / 12) * Math.PI;
        const d = 60 + 380 * (1 - Math.pow(1 - clamp(u), 2.5));
        const r = 50 + 40 * hash1(i) + 60 * u;
        return <circle key={i} cx={Math.cos(a) * d * (i % 2 ? 1 : -1)} cy={-Math.sin(a) * d * 0.25} r={r} fill={['#ffffff', '#ffe7f6', '#e8f6ff'][i % 3]} />;
      })}
    </g>
  ) : null;

export const COUNT_SHOTS: Shot[] = [
  {
    t0: CT.K1,
    id: 'K1',
    kind: 'cockpit',
    what: 'cabina: la tripulación cae en sus asientos con un rebote',
    r: (t, lt) => {
      const drop = (s: number) => {
        const u = clamp((lt - s) / 0.35);
        return {dy: -420 * (1 - u * u), squash: u >= 1 ? 0.14 * Math.exp(-(lt - s - 0.35) * 8) : -0.06};
      };
      const c = crewPoses(t, 'pilot', lt);
      const nd = drop(0.05);
      const ld = drop(0.2);
      const bd = drop(0.32);
      c.nico.y += nd.dy;
      c.nico.squash = nd.squash;
      c.luna.y += ld.dy;
      c.luna.squash = ld.squash;
      c.luna.helmet = 0;
      c.bip.y += bd.dy;
      c.bip.squash = bd.squash;
      c.bip.helmet = 0;
      return (
        <Cockpit2 cam={pulsed({x: 0, y: 110, zoom: 0.78, roll: 0}, t, 0.4)} t={t} view={cockpitView(t, 'sky', lt, 0)}>
          <Bip2 id="k1b" p={c.bip} />
          <Luna2 id="k1l" p={c.luna} />
          <Nico2 id="k1n" p={c.nico} />
        </Cockpit2>
      );
    },
  },
  {
    t0: CT.K2,
    id: 'K2',
    kind: 'close',
    what: 'primer plano: Luna se ajusta el casco (las orejas se pliegan dentro)',
    r: (t, lt) => {
      const c = crewPoses(t, 'helmet', lt);
      return (
        <Cockpit2 cam={{x: 380, y: -40 + lt * 6, zoom: 2.4, roll: 0}} t={t} view={cockpitView(t, 'sky', lt, 0)}>
          <Luna2 id="k2l" p={c.luna} />
        </Cockpit2>
      );
    },
  },
  {
    t0: CT.K3,
    id: 'K3',
    kind: 'close',
    what: '"5" — la pantalla de Bip muestra el número',
    r: (t, lt) => {
      const b = bip2(t, {x: -380, y: 320, scale: 1.3, helmet: 1, headTilt: -0.06, armR: L(0.6, -1.2)}, {mode: 'number', value: '5'});
      return (
        <g>
          <Cockpit2 cam={{x: -375, y: 95, zoom: 3.6 + lt * 0.3, roll: 0}} t={t} view={cockpitView(t, 'sky', lt, 0)}>
            <Bip2 id="k3b" p={b} />
          </Cockpit2>
          <CountNum n="5" since={lt} />
        </g>
      );
    },
  },
  {
    t0: CT.K4,
    id: 'K4',
    kind: 'close',
    what: '"4" — primer plano de Nico, decidido',
    r: (t, lt) => {
      const c = crewPoses(t, 'pilot', lt);
      c.nico.expr = ex(t, 1, {eyes: 'squint', mouth: 'grin', browL: -0.7, browR: -0.5, look: {x: 0, y: -0.2}});
      return (
        <g>
          <Cockpit2 cam={{x: 0, y: -40, zoom: 2.9 + lt * 0.4, roll: 0}} t={t} view={cockpitView(t, 'sky', lt, 0)}>
            <Nico2 id="k4n" p={c.nico} />
          </Cockpit2>
          <CountNum n="4" since={lt} />
        </g>
      );
    },
  },
  {
    t0: CT.K5,
    id: 'K5',
    kind: 'detail',
    what: '"3" — detalle: la mano de Nico agarra la palanca y Luna pulsa un botón',
    r: (t, lt) => {
      const N = NICO_COLORS;
      const Lc = LUNA_COLORS;
      const press = Math.exp(-Math.max(0, lt - 0.15) * 10) * (lt > 0.15 ? 1 : 0);
      const cam: Cam = {x: -50, y: 520, zoom: 2.3, roll: 0};
      return (
        <g>
          <Cockpit2 cam={cam} t={t} view={cockpitView(t, 'sky', lt, 0)} lever={0.1 + 0.2 * clamp(lt / 0.3)} />
          <g transform={layerT(cam, 1.08)}>
            <CloseArm o={{x: -420, y: 900}} p={{x: -243, y: 505 + lt * 10}} color={N.fur} outline={N.outline} sleeve={N.shirt} w={34} grip={1} hold={{kind: 'none'}} side={1} bend={1} />
            <CloseArm o={{x: 260, y: 920}} p={{x: 135, y: 445 + press * 8}} color={Lc.fur} outline={Lc.outline} sleeve={Lc.shirt} w={30} grip={0.85} hold={{kind: 'none'}} side={-1} bend={-1} />
          </g>
          <CountNum n="3" since={lt} />
        </g>
      );
    },
  },
  {
    t0: CT.K6,
    id: 'K6',
    kind: 'exterior',
    what: '"2" — el cohete vibra en la habitación; las luces parpadean',
    r: (t, lt) => (
      <g>
        <RoomLaunch t={t} cam={{x: RX1, y: -300, zoom: 1.75 + lt * 0.4, roll: Math.sin(t * 40) * 0.004}} y={0} vib={0.7} engine={0.15} squash={0} glow={0.4 + 0.3 * Math.sin(t * 20)} />
        <CountNum n="2" since={lt} />
      </g>
    ),
  },
  {
    t0: CT.K7,
    id: 'K7',
    kind: 'reaction',
    what: '"1" — los tres se inclinan hacia delante, emocionados',
    r: (t, lt) => {
      const c = crewPoses(t, 'pilot', lt);
      c.nico.lean = 0.12;
      c.nico.expr = ex(t, 1, {eyes: 'wide', mouth: 'grin', brow: 0.8});
      c.luna.lean = 0.12;
      c.luna.expr = ex(t, 4, {eyes: 'wide', mouth: 'o', brow: 1});
      c.bip.screen = {mode: 'number', value: '1', face: 'happy'};
      return (
        <g>
          <Cockpit2 cam={{x: 0, y: 60, zoom: 1.05 + lt * 0.3, roll: 0}} t={t} view={cockpitView(t, 'sky', lt, 0)} shake={0.4}>
            <Bip2 id="k7b" p={c.bip} />
            <Luna2 id="k7l" p={c.luna} />
            <Nico2 id="k7n" p={c.nico} />
          </Cockpit2>
          <CountNum n="1" since={lt} />
        </g>
      );
    },
  },
  {
    t0: CT.L1,
    id: 'L1',
    kind: 'exterior',
    what: '¡cero! anticipación (se aplasta), vibración, luz, nubes de fantasía y empieza a subir',
    r: (t, lt) => {
      const sq = lt < 0.22 ? 0.07 * Math.sin((lt / 0.22) * Math.PI * 0.5) : 0.07 * Math.max(0, 1 - (lt - 0.22) / 0.1) - 0.06 * clamp((lt - 0.25) / 0.2);
      const y = lt < 0.25 ? 0 : -260 * Math.pow(lt - 0.25, 2.2);
      const cam: Cam = {x: RX1, y: lerp(-300, -380, clamp(lt / 0.9)) + y * 0.6, zoom: 1.45, roll: Math.sin(t * 50) * 0.006 * (lt < 0.4 ? 1 : 0.4)};
      return (
        <g>
          <RoomLaunch t={t} cam={cam} y={y} vib={lt < 0.3 ? 1 : 0.4} engine={smoothstep(0.15, 0.35, lt)} squash={sq} glow={0.6 + 0.4 * Math.sin(t * 25)} />
          <g transform={layerT(cam, 1)}>
            <PuffRing x={RX1} y={CART_Y + 10} u={(lt - 0.2) / 0.9} />
            <Burst x={RX1} y={RY + y + 40} u={(lt - 0.2) / 0.6} r={260} />
          </g>
          <Flash k={0.55 * Math.exp(-Math.max(0, lt - 0.22) * 9) * (lt > 0.22 ? 1 : 0)} />
        </g>
      );
    },
  },
  {
    t0: CT.L1b,
    id: 'L1b',
    kind: 'action',
    what: 'el cohete sube entre nubes de fantasía, acelerando poco a poco',
    r: (t, lt) => {
      const cam: Cam = {x: 0, y: 0, zoom: 1, roll: Math.sin(t * 2) * 0.03};
      const acc = 300 + lt * 900;
      return (
        <g>
          <SpaceStage cam={cam} t={t} look={LOOKS.teal} stars={0} />
          <rect width={1080} height={1920} fill="#7ec8ff" />
          {Array.from({length: 14}, (_, i) => {
            const y = ((hash1(i * 3) * 2600 + (t - CT.L1b) * acc * (0.6 + hash1(i) * 0.8)) % 2600) - 400;
            const x = hash1(i * 7) * 1300 - 110;
            const s = 0.8 + hash1(i * 2) * 1.6;
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={0.9}>
                <ellipse rx={150} ry={56} fill="#ffffff" />
                <ellipse cx={-50} cy={-30} rx={90} ry={60} fill="#ffffff" />
                <ellipse cx={55} cy={-22} rx={80} ry={52} fill="#ffffff" />
                <ellipse cx={0} cy={22} rx={140} ry={28} fill="#e2f0ff" />
              </g>
            );
          })}
          <NutRocket2 id="l1b" p={{x: 540 + Math.sin(t * 3) * 10, y: 1260 - lt * 120, scale: 0.95, rot: Math.sin(t * 2.4) * 0.04, build: BUILT2, vibrate: 0.25, engine: 1, glow: 0.4, t}} windowContent={<CrewInWindow t={t} mode="cheer" uid="l1bc" />} />
        </g>
      );
    },
  },
  {
    t0: CT.L2,
    id: 'L2',
    kind: 'cockpit',
    what: 'cabina: la aceleración los aplasta contra el asiento, entre risas; por la ventana pasan nubes',
    r: (t, lt) => (
      <Cockpit2 cam={pulsed({...COCK, y: 100, zoom: 0.85}, t, 0.8)} t={t} view={cockpitView(t, 'clouds', lt, 1.6)} shake={0.6 * Math.exp(-lt * 0.8)} glow="#bfe6ff">
        <CockpitCrew t={t} mode="press" lt={lt} uid="l2" />
      </Cockpit2>
    ),
  },
  {
    t0: CT.L3,
    id: 'L3',
    kind: 'exterior',
    what: 'el cohete atraviesa la capa de nubes: el cielo se vuelve espacio',
    r: (t, lt) => {
      const k = clamp(lt / 1.8);
      const cam: Cam = {x: 0, y: 0, zoom: 1, roll: 0};
      return (
        <g>
          <SpaceStage cam={cam} t={t} look={LOOKS.violet} stars={k} />
          <rect width={1080} height={1920} fill="#5db8ff" opacity={1 - k} />
          <g transform={`translate(0 ${lerp(900, 2600, k)})`}>
            {Array.from({length: 12}, (_, i) => (
              <g key={i} transform={`translate(${i * 110 - 60} ${Math.sin(i * 1.7) * 40}) scale(${1.3 + hash1(i) * 0.6})`}>
                <ellipse rx={120} ry={70} fill="#ffffff" />
                <ellipse cx={0} cy={60} rx={140} ry={60} fill="#e2f0ff" />
              </g>
            ))}
          </g>
          <NutRocket2 id="l3" p={{x: 540, y: lerp(1500, 1120, k), scale: 0.8, rot: 0.05 * Math.sin(t * 2), build: BUILT2, vibrate: 0.15, engine: 1, glow: 0.4, t, rim: '#ffd27a', rimK: 0.5}} windowContent={<CrewInWindow t={t} mode="wow" uid="l3c" />} />
        </g>
      );
    },
  },
  {
    t0: CT.L4,
    id: 'L4',
    kind: 'planet',
    what: 'la Tierra queda abajo; el cohete se aleja hacia el espacio',
    r: (t, lt) => {
      const cam: Cam = {x: 0, y: -lt * 30, zoom: 1, roll: 0};
      return (
        <g>
          <SpaceStage cam={cam} t={t} look={LOOKS.violet} />
          <World cam={{x: 0, y: 0, zoom: 1, roll: 0}}>
            <Earth x={0} y={lerp(1100, 1250, lt / 1.9)} r={700} t={t} />
          </World>
          <NutRocket2 id="l4" p={{x: lerp(380, 640, lt / 1.9), y: lerp(1000, 560, lt / 1.9), scale: lerp(0.6, 0.38, lt / 1.9), rot: 0.35, build: BUILT2, vibrate: 0, engine: 1, glow: 0.3, t, rim: '#bfe6ff', rimK: 0.6}} windowContent={<CrewInWindow t={t} mode="wave" uid="l4c" />} />
        </g>
      );
    },
  },
];
