// LUNA DE QUESO (65,20 → 76,46 s) y ENCUENTRO CON ZUMI (76,46 → 85,38 s).
// M1 acercamiento · M2 la Luna de queso, grande y con volumen · M3 Luna en la ventana
// M4 Nico señala los cráteres · M5 Bip hace una foto · M6 reacción feliz
// Z1 se acerca una nave · Z2 Nico la descubre · Z3 Luna se sorprende · Z4 Bip activa su pantalla
// Z5 primer plano de Zumi · Z6 Zumi saluda · Z7 los protagonistas responden · Z8 viajan juntos.
import React from 'react';
import {clamp, lerp} from '../../../../engine/math';
import {Cam, pulsed} from '../../Camera/cam2d';
import {Burst, Flash, HeartTrail} from '../../Effects/Fx';
import {ZumiShip} from '../../Environments/Space';
import {ease, ex, L, waveArm, zumi2} from '../Animation/acting';
import {Bip2} from '../Characters/Bip2';
import {Luna2} from '../Characters/Luna2';
import {Nico2} from '../Characters/Nico2';
import {Zumi2} from '../Characters/Zumi2';
import {at, Shot, snap} from '../Shots/shot';
import {crewPoses, WinView} from '../Stages/Crew2';
import {Cockpit2, World} from '../Stages/Sets2';
import {CheeseMoon2, LOOKS} from '../Stages/Space2';
import {CockpitClose, Sky, SpaceRocket} from './Flight';

const DB = (t: number) => {
  // primer tiempo de compás más cercano (desde la pausa)
  return snap(t);
};
const M0 = at('break');
const V2 = at('verse2');
export const MT = {M1: M0, M2: DB(V2 + 0.93), M3: DB(V2 + 2.81), M4: DB(V2 + 4.69), M5: DB(V2 + 6.57), M6: DB(V2 + 8.43)};
const Z0 = at('zumi');
const BEAT = 60 / 129.2;
const zb = (n: number) => snap(Z0 + n * BEAT);
export const ZT = {Z1: Z0, Z2: zb(3), Z3: zb(5), Z4: zb(7), Z5: zb(9), Z6: zb(12), Z7: zb(15), Z8: zb(17)};

/** Zumi dentro de su nave (cúpula), con saludo de tres dedos opcional. */
const ZumiInDome: React.FC<{t: number; wave: number; shy?: number; uid: string}> = ({t, wave, shy = 0, uid}) => (
  <g transform="translate(0 -10)">
    <Zumi2
      id={uid}
      p={zumi2(t, {y: 18, scale: 0.6, headTilt: shy * 0.2, ...(wave > 0 ? waveArm(t, 1, 11) : {armR: L(0.5 + shy, -1.6 * shy), gripR: 0.6}), expr: ex(t, 9, shy > 0.5 ? {mouth: 'smile', look: {x: -0.6, y: 0.3}, cheeks: 1} : {mouth: wave > 0 ? 'laugh' : 'grin', eyes: wave > 0 ? 'happy' : 'normal', cheeks: 0.8})})}
    />
  </g>
);

export const MOON_SHOTS: Shot[] = [
  {
    t0: MT.M1,
    id: 'M1',
    kind: 'exterior',
    what: 'acercamiento: la Luna de queso crece y el cohete se dirige hacia ella',
    r: (t, lt, dur) => {
      const k = ease('io', lt / dur);
      return (
        <g>
          <Sky t={t} look={LOOKS.gold} />
          <CheeseMoon2 x={540} y={lerp(700, 820, k)} r={lerp(260, 620, k)} t={t} rot={lt * 3} />
          <SpaceRocket t={t} uid="m1" crew="wow" p={{x: lerp(300, 520, k), y: lerp(1600, 1450, k), scale: lerp(0.62, 0.42, k), rot: 0.15}} />
        </g>
      );
    },
  },
  {
    t0: MT.M2,
    id: 'M2',
    kind: 'planet',
    what: 'plano general de la Luna de queso, con volumen; el cohete pasa pequeño por delante',
    r: (t, lt) => (
      <g>
        <Sky t={t} cam={{x: lt * 20, y: 0, zoom: 1, roll: 0}} look={LOOKS.gold} />
        <CheeseMoon2 x={560} y={980} r={760} t={t} rot={lt * 2} />
        <SpaceRocket t={t} uid="m2" crew="cheer" p={{x: lerp(-60, 1140, lt / 1.9), y: lerp(330, 260, lt / 1.9), scale: 0.3, rot: 1.45}} />
      </g>
    ),
  },
  {
    t0: MT.M3,
    id: 'M3',
    kind: 'close',
    what: 'primer plano: Luna, flotando junto a la ventana, mira la Luna con los ojos brillantes',
    r: (t, lt) => {
      const c = crewPoses(t, 'float', lt, '#ffe48a');
      c.luna = {...c.luna, x: 170, y: -40 + Math.sin(t * 1.4) * 8, spin: 0, lean: -0.05, facing: -1, headTurn: -0.2, armL: L(-2.4, -0.5), armR: L(2.6, 0.6), gripL: 0, gripR: 0, expr: ex(t, 4, {eyes: 'wide', mouth: 'o', brow: 0.9, look: {x: 0.5, y: -0.8}, cheeks: 1})};
      const cam: Cam = {x: 120, y: -330, zoom: 2.0 + lt * 0.12, roll: 0};
      return (
        <Cockpit2 cam={cam} t={t} view={<WinView t={t} kind="moon" local={lt} />} glow="#ffe48a" glowK={0.16}>
          <Luna2 id="m3l" p={c.luna} />
        </Cockpit2>
      );
    },
  },
  {t0: MT.M4, id: 'M4', kind: 'cockpit', what: 'Nico señala los cráteres de queso por la ventana', r: (t, lt) => <CockpitClose t={t} lt={lt} who="nico" mode="point" view="moon" zoom={1.35} dy={-120} glow="#ffe48a" />},
  {
    t0: MT.M5,
    id: 'M5',
    kind: 'close',
    what: 'Bip hace una foto: destello y la foto aparece en su pantalla',
    r: (t, lt) => {
      const flashAt = 0.6;
      return (
        <g>
          <CockpitClose t={t} lt={lt} who="bip" mode="photo" view="moon" zoom={2.2} dy={-20} glow="#ffe48a" />
          <Flash k={lt > flashAt ? 0.8 * Math.exp(-(lt - flashAt) * 7) : 0} />
        </g>
      );
    },
  },
  {
    t0: MT.M6,
    id: 'M6',
    kind: 'reaction',
    what: 'reacción feliz: celebran y mandan corazones a la Luna',
    r: (t, lt) => (
      <g>
        <Cockpit2 cam={pulsed({x: 0, y: 40, zoom: 1.0, roll: 0}, t, 1)} t={t} view={<WinView t={t} kind="moon" local={3} />} glow="#ffe48a" glowK={0.14}>
          {(() => {
            const c = crewPoses(t, 'cheer', lt, '#ffe48a');
            return (
              <>
                <Bip2 id="m6b" p={c.bip} />
                <Luna2 id="m6l" p={c.luna} />
                <Nico2 id="m6n" p={c.nico} />
              </>
            );
          })()}
        </Cockpit2>
        <HeartTrail t={t} t0={MT.M6 + 0.2} t1={MT.M6 + 1.4} x0={540} y0={1000} x1={540} y1={420} n={6} />
      </g>
    ),
  },
];

export const ZUMI_SHOTS: Shot[] = [
  {
    t0: ZT.Z1,
    id: 'Z1',
    kind: 'exterior',
    what: 'una nave redonda con luces se acerca desde lejos',
    r: (t, lt, dur) => {
      const k = ease('io', lt / dur);
      return (
        <g>
          <Sky t={t} look={LOOKS.teal} />
          <ZumiShip x={lerp(780, 620, k)} y={lerp(520, 700, k)} s={lerp(0.25, 0.8, k)} rot={Math.sin(t * 2) * 0.1} t={t} inside={<ZumiInDome t={t} wave={0} uid="z1z" />} />
          <SpaceRocket t={t} uid="z1" crew="pilot" p={{x: 300, y: 1450, scale: 0.75, rot: 0.25}} />
        </g>
      );
    },
  },
  {t0: ZT.Z2, id: 'Z2', kind: 'close', what: 'Nico descubre la nave y la señala', r: (t, lt) => <CockpitClose t={t} lt={lt} who="nico" mode="point" view="zumi" zoom={2.5} glow="#7ff3ff" />},
  {t0: ZT.Z3, id: 'Z3', kind: 'reaction', what: 'Luna, sorprendida: orejas arriba y boca en "o"', r: (t, lt) => <CockpitClose t={t} lt={lt} who="luna" mode="wow" view="zumi" zoom={2.6} glow="#7ff3ff" />},
  {
    t0: ZT.Z4,
    id: 'Z4',
    kind: 'close',
    what: 'Bip activa su pantalla: radar y luego "¡HOLA!"',
    r: (t, lt) => {
      const c = crewPoses(t, 'pilot', lt, '#7ff3ff');
      c.bip.screen = lt < 0.5 ? {mode: 'radar', value: '', face: 'focus'} : {mode: 'text', value: '¡HOLA!', face: 'happy'};
      c.bip.armR = L(2.3, 1.2);
      c.bip.gripR = 0.9;
      return (
        <Cockpit2 cam={{x: -380, y: 60, zoom: 3.2, roll: 0}} t={t} view={<WinView t={t} kind="zumi" local={lt} />} glow="#7ff3ff" glowK={0.12}>
          <Bip2 id="z4b" p={c.bip} />
        </Cockpit2>
      );
    },
  },
  {
    t0: ZT.Z5,
    id: 'Z5',
    kind: 'close',
    what: 'primer plano de Zumi en su cúpula: tímido, y después sonríe',
    r: (t, lt) => {
      const shy = lt < 0.7 ? 1 : 1 - clamp((lt - 0.7) / 0.3);
      return (
        <g>
          <Sky t={t} look={LOOKS.teal} />
          <World cam={{x: 0, y: -55, zoom: 4.0 + lt * 0.15, roll: 0}}>
            <ZumiShip x={0} y={0} s={1} rot={Math.sin(t * 2) * 0.03} t={t} inside={<ZumiInDome t={t} wave={0} shy={shy} uid="z5z" />} />
          </World>
        </g>
      );
    },
  },
  {
    t0: ZT.Z6,
    id: 'Z6',
    kind: 'close',
    what: 'Zumi saluda con su mano de tres dedos',
    r: (t, lt) => (
      <g>
        <Sky t={t} look={LOOKS.teal} />
        <World cam={{x: 10, y: -55, zoom: 3.5 - lt * 0.15, roll: 0}}>
          <ZumiShip x={0} y={0} s={1} rot={Math.sin(t * 2) * 0.04} t={t} inside={<ZumiInDome t={t} wave={1} uid="z6z" />} />
          <Burst x={40} y={-70} u={lt / 0.7} r={110} />
        </World>
      </g>
    ),
  },
  {
    t0: ZT.Z7,
    id: 'Z7',
    kind: 'cockpit',
    what: 'los tres responden al saludo desde la cabina',
    r: (t, lt) => (
      <Cockpit2 cam={pulsed({x: 0, y: 0, zoom: 1.0, roll: 0}, t, 0.6)} t={t} view={<WinView t={t} kind="zumi" local={2} zumiWave={1} />} glow="#7ff3ff" glowK={0.12}>
        {(() => {
          const c = crewPoses(t, 'wave', lt, '#7ff3ff');
          return (
            <>
              <Bip2 id="z7b" p={c.bip} />
              <Luna2 id="z7l" p={c.luna} />
              <Nico2 id="z7n" p={c.nico} />
            </>
          );
        })()}
      </Cockpit2>
    ),
  },
  {
    t0: ZT.Z8,
    id: 'Z8',
    kind: 'exterior',
    what: 'las dos naves viajan juntas, una al lado de la otra',
    r: (t, lt) => {
      const sway = Math.sin(t * 1.6);
      return (
        <g>
          <Sky t={t} cam={{x: lt * 160, y: 0, zoom: 1, roll: 0}} look={LOOKS.violet} />
          <SpaceRocket t={t} uid="z8" crew="wave" p={{x: 380 + sway * 20, y: 1150, scale: 0.6, rot: 0.9}} />
          <ZumiShip x={760 - sway * 20} y={760 + Math.sin(t * 2.2) * 20} s={0.85} rot={0.12 + sway * 0.05} t={t} inside={<ZumiInDome t={t} wave={1} uid="z8z" />} />
        </g>
      );
    },
  },
];
