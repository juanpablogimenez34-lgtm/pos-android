// SEGUNDO ESTRIBILLO (85,38 → 115,36 s): las dos naves aterrizan en un planeta pequeño de
// caramelo y los cuatro bailan. Un plano por compás: coreografía de cada personaje, pasos en
// grupo, choque de manos, giros, planos de planeta y de acción, despegue y despedida.
import React from 'react';
import {clamp, hash1, lerp} from '../../../../engine/math';
import {Cam, layerT, pulsed} from '../../Camera/cam2d';
import {Burst} from '../../Effects/Fx';
import {ZumiShip} from '../../Environments/Space';
import {beatPhase} from '../../MusicSync/songMap';
import {bip2, bipDance, ease, ex, L, luna2, lunaDance, nico2, nicoDance, PK, unison, waveArm, zumi2} from '../Animation/acting';
import {Bip2} from '../Characters/Bip2';
import {Luna2} from '../Characters/Luna2';
import {Nico2} from '../Characters/Nico2';
import {Zumi2} from '../Characters/Zumi2';
import {at, Shot} from '../Shots/shot';
import {zumiDancing, CockpitCrew, CrewInWindow, WinView} from '../Stages/Crew2';
import {BUILT2, NutRocket2} from '../Stages/Rocket2';
import {Cockpit2, reachLimb, SHOULDERS, World} from '../Stages/Sets2';
import {Comet2, LOOKS, Planet2, SpaceStage} from '../Stages/Space2';
import {Sky, SpaceRocket} from './Flight';

const bar = (n: number) => at('chorus2', n);
const RIM = '#ffb0e0';
const POS = {bip: -300, nico: -100, luna: 110, zumi: 300};

/** Planeta pequeño de caramelo: suelo curvo con rayas, cristales de azúcar y flores-estrella. */
const Planetoid: React.FC<{cam: Cam; t: number}> = ({cam, t}) => (
  <g>
    <SpaceStage cam={cam} t={t} look={LOOKS.rose} />
    <g transform={layerT(cam, 0.3)}>
      <Planet2 x={-700} y={-1500} r={260} c1="#7fb8ff" c2="#c38aff" ring="#ffe7b0" t={t} uid="dp" />
    </g>
    <g transform={layerT(cam, 1)}>
      <defs>
        <radialGradient id="dpg" cx="0.5" cy="0.08" r="0.6">
          <stop offset="0" stopColor="#ffc2e6" />
          <stop offset="1" stopColor="#c0569a" />
        </radialGradient>
        <clipPath id="dpc">
          <circle cx={0} cy={2600} r={2620} />
        </clipPath>
      </defs>
      <circle cx={0} cy={2600} r={2620} fill="url(#dpg)" stroke="#8a2a6a" strokeWidth={8} />
      <g clipPath="url(#dpc)">
        {Array.from({length: 18}, (_, i) => (
          <path key={i} d={`M${-2600 + i * 300},-40 q150,120 300,500`} stroke="#ffffff" strokeWidth={40} opacity={0.18} fill="none" />
        ))}
        {Array.from({length: 22}, (_, i) => {
          const x = -1800 + hash1(i * 3) * 3600;
          const y = 30 + hash1(i * 5) * 300;
          return <ellipse key={`c${i}`} cx={x} cy={y} rx={20 + hash1(i) * 26} ry={10 + hash1(i) * 10} fill="#a8407e" opacity={0.4} />;
        })}
      </g>
      {Array.from({length: 9}, (_, i) => {
        const x = -1300 + i * 330 + hash1(i) * 80;
        const s = 0.6 + hash1(i * 2) * 0.6;
        return (
          <g key={`f${i}`} transform={`translate(${x} ${-6 + Math.abs(x) * 0.002}) scale(${s})`}>
            <path d="M0,0 L0,-60" stroke="#4dd88a" strokeWidth={8} />
            <path transform={`translate(0 -76) rotate(${(t * 40 + i * 30) % 360})`} d="M0,-20 L6,-6 L21,-6 L9,3 L13,18 L0,9 L-13,18 L-9,3 L-21,-6 L-6,-6Z" fill={['#ffd23f', '#7ff3ff', '#ffffff'][i % 3]} />
          </g>
        );
      })}
    </g>
  </g>
);

/** Naves aparcadas en el planeta. */
const Parked: React.FC<{t: number; lift?: number}> = ({t, lift = 0}) => (
  <g>
    <NutRocket2 id="dpr" p={{x: -440, y: -lift * 900, scale: 0.75, rot: 0, build: BUILT2, vibrate: lift > 0 ? 0.3 : 0, engine: lift > 0 ? 1 : 0, glow: 0.2, t, rim: RIM, rimK: 0.5}} windowContent={lift > 0 ? <CrewInWindow t={t} mode="wave" uid="dprc" /> : undefined} />
    <g transform={`translate(450 ${-80 - lift * 1100})`}>
      {lift === 0 && <path d="M-80,40 L-110,80 M80,40 L110,80" stroke="#4a2a7a" strokeWidth={10} strokeLinecap="round" />}
      <ZumiShip x={0} y={0} s={0.8} rot={0} t={t} inside={lift > 0 ? <g transform="translate(0 -10)"><Zumi2 id="dpz" p={zumi2(t, {y: 46, scale: 0.6, ...waveArm(t, 1), expr: ex(t, 9, {mouth: 'laugh', eyes: 'happy'})})} /></g> : undefined} />
    </g>
  </g>
);

/** Los cuatro bailando. `mode` elige el paso del grupo. */
function dancers(t: number, mode: 'own' | 'unison'): {n: PK; l: PK; b: PK; z: PK} {
  const base = {helmet: 1, rimColor: RIM, rimK: 0.5};
  if (mode === 'unison') {
    const u = unison(t);
    return {
      n: {x: POS.nico, ...base, ...u, expr: ex(t, 1, {mouth: 'laugh', eyes: 'happy', cheeks: 1}, 0.8)},
      l: {x: POS.luna, facing: -1, ...base, ...u, expr: ex(t, 4, {mouth: 'laugh', eyes: 'happy', cheeks: 1}, 0.8)},
      b: {x: POS.bip, ...base, ...u},
      z: {x: POS.zumi, facing: -1, rimColor: RIM, rimK: 0.5, ...u, expr: ex(t, 9, {mouth: 'laugh', eyes: 'happy'})},
    };
  }
  return {
    n: {x: POS.nico, ...base, ...nicoDance(t, 1), expr: ex(t, 1, {mouth: 'grin'}, 1)},
    l: {x: POS.luna, facing: -1, ...base, ...lunaDance(t, 1), expr: ex(t, 4, {mouth: 'grin', eyes: beatPhase(t).i % 4 === 0 ? 'happy' : 'normal'}, 0.9)},
    b: {x: POS.bip, ...base, ...bipDance(t, 1)},
    z: {x: POS.zumi, facing: -1, rimColor: RIM, rimK: 0.5},
  };
}

const Stage: React.FC<{t: number; cam: Cam; mode?: 'own' | 'unison'; only?: ('n' | 'l' | 'b' | 'z')[]; over?: Partial<Record<'n' | 'l' | 'b' | 'z', PK>>; front?: React.ReactNode}> = ({t, cam, mode = 'own', only, over = {}, front}) => {
  const d = dancers(t, mode);
  const show = (k: 'n' | 'l' | 'b' | 'z') => !only || only.includes(k);
  const bd = bipDance(t, 1);
  const zp = mode === 'own' ? zumiDancing(t, {...d.z, ...over.z}) : zumi2(t, {...d.z, ...over.z});
  return (
    <g>
      <Planetoid cam={cam} t={t} />
      <World cam={cam}>
        <Parked t={t} />
        {show('b') && <Bip2 id="dsb" p={bip2(t, {...d.b, ...over.b}, {face: beatPhase(t).i % 2 ? 'happy' : 'laugh'}, {lights: 0.4 + 0.6 * (bd.lightsK ?? 0)})} />}
        {show('z') && <Zumi2 id="dsz" p={zp} />}
        {show('l') && <Luna2 id="dsl" p={luna2(t, {...d.l, ...over.l}, 0.3)} />}
        {show('n') && <Nico2 id="dsn" p={nico2(t, {...d.n, ...over.n}, {}, 1)} />}
        {front}
      </World>
    </g>
  );
};

const single = (x: number, lt: number, h = 150, z = 3.9): Cam => ({x, y: -h, zoom: z + lt * 0.1, roll: 0});

export const DANCE_SHOTS: Shot[] = [
  {
    t0: bar(0),
    id: 'D1',
    kind: 'exterior',
    what: 'las dos naves vuelan juntas junto a un planeta con anillo',
    r: (t, lt) => {
      const cam: Cam = {x: lt * 60, y: 0, zoom: 1, roll: 0};
      return (
        <g>
          <Sky t={t} cam={cam} look={LOOKS.rose} />
          <g transform={layerT(cam, 0.35)}>
            <Planet2 x={200} y={-300} r={330} c1="#7fb8ff" c2="#c38aff" ring="#ffe7b0" t={t} moon uid="d1" />
          </g>
          <SpaceRocket t={t} uid="d1" crew="dance" p={{x: lerp(240, 420, lt / 1.9), y: 1300, scale: 0.6, rot: 0.6}} />
          <ZumiShip x={lerp(700, 860, lt / 1.9)} y={1000 + Math.sin(t * 2) * 20} s={0.7} rot={0.2} t={t} />
        </g>
      );
    },
  },
  {
    t0: bar(1),
    id: 'D2',
    kind: 'action',
    what: 'aterrizan en un pequeño planeta de caramelo con una nube de polvo',
    r: (t, lt) => {
      const k = ease('io', clamp(lt / 1.2));
      const cam: Cam = {x: 0, y: -380, zoom: 0.95, roll: 0};
      return (
        <g>
          <Planetoid cam={cam} t={t} />
          <World cam={cam}>
            <NutRocket2 id="d2r" p={{x: -440, y: lerp(-1300, 0, k), scale: 0.75, rot: 0, build: BUILT2, vibrate: 0, engine: 1 - k * 0.8, glow: 0.2, t, squash: lt > 1.2 ? 0.08 * Math.exp(-(lt - 1.2) * 8) : 0}} windowContent={<CrewInWindow t={t} mode="cheer" uid="d2c" />} />
            <ZumiShip x={450} y={lerp(-1500, -80, ease('io', clamp((lt - 0.2) / 1.2)))} s={0.8} rot={0} t={t} />
            <Burst x={-440} y={0} u={(lt - 1.2) / 0.6} r={260} />
            <Burst x={450} y={-30} u={(lt - 1.4) / 0.5} r={220} />
          </World>
        </g>
      );
    },
  },
  {t0: bar(2), id: 'D3', kind: 'wide', what: 'los cuatro empiezan a bailar en el planeta (paso común)', r: (t, lt) => <Stage t={t} cam={pulsed({x: 0, y: -230, zoom: 1.4 + lt * 0.05, roll: 0}, t, 1)} mode="unison" />},
  {t0: bar(3), id: 'D4', kind: 'close', what: 'coreografía de Nico: balanceo lateral, brazos y cola al ritmo', r: (t, lt) => <Stage t={t} cam={pulsed(single(POS.nico, lt), t, 1)} only={['n', 'l', 'b']} />},
  {t0: bar(4), id: 'D5', kind: 'close', what: 'coreografía de Luna: saltitos, giro y orejas', r: (t, lt) => <Stage t={t} cam={pulsed(single(POS.luna, lt, 170), t, 1)} only={['l', 'n', 'z']} />},
  {t0: bar(5), id: 'D6', kind: 'close', what: 'coreografía de Bip: pasos robóticos, brazos alternos y luces', r: (t, lt) => <Stage t={t} cam={pulsed(single(POS.bip, lt, 120), t, 1)} only={['b', 'n']} />},
  {t0: bar(6), id: 'D7', kind: 'close', what: 'coreografía de Zumi: saltos, giros y antenas', r: (t, lt) => <Stage t={t} cam={pulsed(single(POS.zumi, lt, 110, 4.6), t, 1)} only={['z', 'l']} />},
  {t0: bar(7), id: 'D8', kind: 'wide', what: 'los cuatro al unísono', r: (t, lt) => <Stage t={t} cam={pulsed({x: 0, y: -220, zoom: 1.5 - lt * 0.05, roll: 0}, t, 1)} mode="unison" />},
  {
    t0: bar(8),
    id: 'D9',
    kind: 'planet',
    what: 'plano lejano: el planeta de caramelo con los bailarines diminutos, la nebulosa y un cometa',
    r: (t, lt) => (
      <g>
        <Stage t={t} cam={{x: 0, y: -700 - lt * 40, zoom: 0.55, roll: 0}} />
        <Comet2 t={t} t0={bar(8) + 0.1} dur={1.7} x0={1150} y0={250} x1={-150} y1={520} s={1.3} />
      </g>
    ),
  },
  {
    t0: bar(9),
    id: 'D10',
    kind: 'reaction',
    what: 'Nico y Zumi chocan las manos en el pulso',
    r: (t, lt) => {
      const contact = 0.93;
      const meet = {x: 20, y: -170};
      const nPos = {x: -70, y: 0, scale: 1, facing: 1 as const};
      const zPos = {x: 95, y: 0, scale: 1.1, facing: -1 as const};
      const k = ease('back', clamp((lt - 0.4) / (contact - 0.4)));
      const nArm = lt < contact + 0.3 ? reachLimb(nPos, SHOULDERS.nico.R, 30, 28, {x: lerp(-10, meet.x, k), y: lerp(-110, meet.y, k)}, -1) : L(2.4, 0.4);
      const zArm = lt < contact + 0.3 ? reachLimb(zPos, SHOULDERS.zumi.R, 18 * 1.1, 16 * 1.1, {x: lerp(60, meet.x + 4, k), y: lerp(-60, meet.y + 4, k)}, 1) : L(2.3, 0.4);
      const happy = lt > contact;
      return (
        <Stage
          t={t}
          cam={pulsed({x: 10, y: -150, zoom: 3.2, roll: 0}, t, 1)}
          only={['n', 'z']}
          over={{
            n: {...nPos, dx: 0, armR: nArm, gripR: 0, lean: 0.1, bob: happy ? -10 : 0, expr: ex(t, 1, happy ? {mouth: 'laugh', eyes: 'happy', cheeks: 1} : {mouth: 'grin', eyes: 'wide', look: {x: 0.6, y: -0.3}})},
            z: {...zPos, armR: zArm, gripR: 0, spin: 0, bob: happy ? -30 * Math.sin(clamp((lt - contact) / 0.5) * Math.PI) : lt > 0.6 ? 0 : -16, expr: ex(t, 9, happy ? {mouth: 'laugh', eyes: 'happy', cheeks: 1} : {mouth: 'grin', eyes: 'wide'})},
          }}
          front={<Burst x={meet.x} y={meet.y} u={(lt - contact) / 0.6} r={120} />}
        />
      );
    },
  },
  {
    t0: bar(10),
    id: 'D11',
    kind: 'medium',
    what: 'Luna y Bip giran juntos tomados de la mano',
    r: (t, lt) => {
      const sp = ease('back', clamp((lt - 0.3) / 1.1)) * Math.PI * 4;
      return (
        <Stage
          t={t}
          cam={pulsed({x: -95, y: -150, zoom: 3.0, roll: 0}, t, 1)}
          only={['l', 'b']}
          over={{
            l: {x: 0, facing: -1, spin: sp, bob: -10 * Math.abs(Math.sin(sp)), armR: L(1.4, -0.2), armL: L(-1.4, 0.2), gripR: 0.8, expr: ex(t, 4, {mouth: 'laugh', eyes: 'happy', cheeks: 1})},
            b: {x: -190, spin: sp, armR: L(1.5, 0), armL: L(-1.5, 0), gripR: 0.8, bob: -6 * Math.abs(Math.sin(sp))},
          }}
        />
      );
    },
  },
  {
    t0: bar(11),
    id: 'D12',
    kind: 'wide',
    what: 'todos bailan; la cámara gira alrededor del grupo',
    r: (t, lt) => <Stage t={t} cam={pulsed({x: Math.sin(lt * 1.6) * 80, y: -220, zoom: 1.45, roll: Math.sin(lt * 1.6) * 0.08}, t, 1)} />,
  },
  {
    t0: bar(12),
    id: 'D13',
    kind: 'exterior',
    what: 'las dos naves despegan del planeta de caramelo',
    r: (t, lt) => {
      const lift = Math.pow(clamp(lt / 1.9), 1.8);
      const cam: Cam = {x: 0, y: -420 - lift * 780, zoom: 0.95, roll: 0};
      return (
        <g>
          <Planetoid cam={cam} t={t} />
          <World cam={cam}>
            <Parked t={t} lift={Math.max(0.001, lift)} />
            <Burst x={-440} y={0} u={lt / 0.7} r={240} />
          </World>
        </g>
      );
    },
  },
  {
    t0: bar(13),
    id: 'D14',
    kind: 'cockpit',
    what: 'cabina: siguen bailando y Zumi los saluda desde la ventana',
    r: (t, lt) => (
      <Cockpit2 cam={pulsed({x: 0, y: 20, zoom: 1.08, roll: 0}, t, 1)} t={t} view={<WinView t={t} kind="zumi" local={2} zumiWave={1} />} glow={RIM} glowK={0.12}>
        <CockpitCrew t={t} mode="dance" lt={lt} uid="d14" rim={RIM} />
      </Cockpit2>
    ),
  },
  {
    t0: bar(14),
    id: 'D15',
    kind: 'action',
    what: 'las dos naves dan una vuelta alrededor de un cometa',
    r: (t, lt) => {
      const a = (lt / 1.9) * Math.PI * 2;
      return (
        <g>
          <Sky t={t} cam={{x: 0, y: 0, zoom: 1, roll: 0}} look={LOOKS.gold} />
          <Comet2 t={t} t0={bar(14) - 0.2} dur={2.4} x0={700} y0={760} x1={380} y1={1100} s={2} c="#ffe7b0" />
          <SpaceRocket t={t} uid="d15" crew="cheer" p={{x: 540 + Math.cos(a) * 300, y: 960 + Math.sin(a) * 420, scale: 0.5, rot: a + Math.PI}} />
          <ZumiShip x={540 + Math.cos(a + 2.4) * 300} y={960 + Math.sin(a + 2.4) * 420} s={0.55} rot={Math.sin(a) * 0.2} t={t} />
        </g>
      );
    },
  },
  {
    t0: bar(15),
    id: 'D16',
    kind: 'exterior',
    what: 'Zumi se despide y su nave se aleja dejando una estrella',
    r: (t, lt) => {
      const k = ease('io', clamp((lt - 0.5) / 1.2));
      return (
        <g>
          <Sky t={t} look={LOOKS.violet} />
          <ZumiShip x={lerp(700, 980, k)} y={lerp(860, 340, k)} s={lerp(0.85, 0.15, k)} rot={0.2} t={t} inside={<g transform="translate(0 -10)"><Zumi2 id="d16z" p={zumi2(t, {y: 46, scale: 0.6, ...waveArm(t, 1), expr: ex(t, 9, {mouth: 'laugh', eyes: 'happy', cheeks: 1})})} /></g>} />
          <Burst x={lerp(700, 980, k)} y={lerp(860, 340, k)} u={(lt - 1.5) / 0.6} r={90} />
          <SpaceRocket t={t} uid="d16" crew="wave" p={{x: 330, y: 1350, scale: 0.7, rot: 0.2}} />
        </g>
      );
    },
  },
];
