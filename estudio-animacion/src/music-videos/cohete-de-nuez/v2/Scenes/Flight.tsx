// PRIMER ESTRIBILLO EN EL ESPACIO (42,26 → 65,20 s). Un plano por compás, alternando:
// exterior (A) · cabina (B) · primeros planos (C) · planetas (D) · reacciones (E) · acción (F).
import React from 'react';
import {clamp, lerp} from '../../../../engine/math';
import {Cam, layerT, pulsed} from '../../Camera/cam2d';
import {Burst} from '../../Effects/Fx';
import {beatPulse} from '../../MusicSync/songMap';
import {ex, lunaDance, nicoDance} from '../Animation/acting';
import {Bip2} from '../Characters/Bip2';
import {Luna2} from '../Characters/Luna2';
import {Nico2} from '../Characters/Nico2';
import {at, Shot} from '../Shots/shot';
import {CockpitCrew, crewPoses, CrewInWindow, WinView} from '../Stages/Crew2';
import {NutRocket2, BUILT2, RocketPose2} from '../Stages/Rocket2';
import {Cockpit2, World} from '../Stages/Sets2';
import {Asteroids, CheeseMoon2, Comet2, LOOKS, Planet2, SpaceLook, SpaceStage} from '../Stages/Space2';

const bar = (n: number) => at('chorus1', n);

/** Cohete exterior con la tripulación en la ventana y estela de chispas. */
export const SpaceRocket: React.FC<{t: number; p: Partial<RocketPose2>; crew: 'pilot' | 'wave' | 'wow' | 'dance' | 'cheer'; uid: string; trail?: number}> = ({t, p, crew, uid, trail = 1}) => {
  const x = p.x ?? 540;
  const y = p.y ?? 960;
  const s = p.scale ?? 0.6;
  const rot = p.rot ?? 0;
  return (
    <g>
      {trail > 0 &&
        Array.from({length: 14}, (_, i) => {
          const k = i / 14;
          const d = 120 + k * 520;
          const px = x - Math.sin(rot) * d * s * 1.6 + Math.sin(t * 6 + i) * 10 * k;
          const py = y + Math.cos(rot) * d * s * 1.6;
          return <circle key={i} cx={px} cy={py} r={(18 - k * 14) * s * 1.6} fill={['#ffd23f', '#ff9ad5', '#7ff3ff'][i % 3]} opacity={trail * (0.6 - k * 0.55)} />;
        })}
      <NutRocket2 id={`sr${uid}`} p={{x, y, scale: s, rot, build: BUILT2, vibrate: 0.05, engine: 1, glow: 0.3 + 0.2 * beatPulse(t, 6), t, rim: '#c38aff', rimK: 0.55, ...p}} windowContent={<CrewInWindow t={t} mode={crew} uid={`${uid}c`} />} />
    </g>
  );
};

const FIXED: Cam = {x: 0, y: 0, zoom: 1, roll: 0};
export const Sky: React.FC<{t: number; cam?: Cam; look?: SpaceLook; ast?: number}> = ({t, cam = FIXED, look = LOOKS.violet, ast = 0}) => <SpaceStage cam={cam} t={t} look={look} asteroids={ast} />;

/** Cabina con zoom en un tripulante (primer plano) y modo de actuación. */
export const CockpitClose: React.FC<{t: number; lt: number; who: 'nico' | 'luna' | 'bip' | 'all'; mode: Parameters<typeof crewPoses>[1]; view?: Parameters<typeof WinView>[0]['kind']; zoom?: number; dy?: number; glow?: string}> = ({t, lt, who, mode, view = 'stars', zoom = 2.6, dy = 0, glow = '#c38aff'}) => {
  const c = crewPoses(t, mode, lt, '#d8b0ff');
  const target = who === 'nico' ? c.nico : who === 'luna' ? c.luna : who === 'bip' ? c.bip : c.nico;
  const headY = target.y + target.bob - (who === 'bip' ? 170 : 215) * target.scale;
  const cam: Cam = who === 'all' ? {x: 0, y: 100, zoom: 0.8, roll: 0} : {x: target.x, y: headY + 40 + dy, zoom: zoom + lt * 0.12, roll: 0};
  return (
    <Cockpit2 cam={pulsed(cam, t, 0.6)} t={t} view={<WinView t={t} kind={view} local={lt} />} glow={glow} glowK={0.14}>
      <Bip2 id="ccb" p={c.bip} />
      <Luna2 id="ccl" p={c.luna} />
      <Nico2 id="ccn" p={c.nico} />
    </Cockpit2>
  );
};

export const FLIGHT_SHOTS: Shot[] = [
  {t0: bar(4), id: 'F1', kind: 'close', what: 'primer plano de Nico cantando en la cabina', r: (t, lt) => <CockpitClose t={t} lt={lt} who="nico" mode="sing" zoom={2.5} />},
  {
    t0: bar(5),
    id: 'F2',
    kind: 'exterior',
    what: 'el cohete pasa junto a un planeta con anillo; cruzan cometas',
    r: (t, lt) => {
      const cam: Cam = {x: lt * 40, y: 0, zoom: 1, roll: 0};
      return (
        <g>
          <Sky t={t} cam={cam} look={LOOKS.violet} />
          <g transform={layerT(cam, 0.35)}>
            <Planet2 x={-180} y={-360} r={300} c1="#ff9a6a" c2="#ffd27a" ring="#ffe7b0" t={t} moon uid="f2" />
          </g>
          <Comet2 t={t} t0={bar(5) + 0.2} dur={1.5} x0={1200} y0={300} x1={-200} y1={900} />
          <SpaceRocket t={t} uid="f2" crew="cheer" p={{x: lerp(200, 760, lt / 1.9), y: lerp(1500, 1150, lt / 1.9), scale: 0.7, rot: 0.7}} />
        </g>
      );
    },
  },
  {
    t0: bar(6),
    id: 'F3',
    kind: 'cockpit',
    what: 'cabina: en gravedad cero se elevan de los asientos y bailan',
    r: (t, lt) => (
      <Cockpit2 cam={pulsed({x: 0, y: 20, zoom: 1.1, roll: Math.sin(t * 1.2) * 0.03}, t, 1)} t={t} view={<WinView t={t} kind="nebula" local={lt} />} glow="#ff9ad5" glowK={0.12}>
        <CockpitCrew t={t} mode="dance" lt={lt} uid="f3" rim="#ffb0e0" />
      </Cockpit2>
    ),
  },
  {
    t0: bar(7),
    id: 'F4',
    kind: 'planet',
    what: 'nebulosa, planeta detallado con su luna y asteroides lejanos; el cohete cruza pequeño',
    r: (t, lt) => {
      const cam: Cam = {x: -lt * 50, y: lt * 20, zoom: 1, roll: 0};
      return (
        <g>
          <Sky t={t} cam={cam} look={LOOKS.teal} ast={18} />
          <g transform={layerT(cam, 0.3)}>
            <Planet2 x={60} y={140} r={380} c1="#5ac8a8" c2="#2a7a8a" t={t} moon light={-2.2} uid="f4" />
          </g>
          <SpaceRocket t={t} uid="f4" crew="pilot" p={{x: lerp(-50, 1100, lt / 1.9), y: lerp(560, 420, lt / 1.9), scale: 0.26, rot: 1.35}} />
        </g>
      );
    },
  },
  {t0: bar(8), id: 'F5', kind: 'close', what: 'Luna baila flotando: saltitos, giro y orejas', r: (t, lt) => <CockpitClose t={t} lt={lt} who="luna" mode="dance" zoom={2.0} dy={120} view="nebula" glow="#ff9ad5" />},
  {
    t0: bar(9),
    id: 'F6',
    kind: 'action',
    what: 'acción: esquivan un campo de asteroides con un giro completo',
    r: (t, lt) => {
      const cam: Cam = {x: lt * 300, y: -lt * 100, zoom: 1, roll: Math.sin(lt * 2) * 0.05};
      const roll = clamp((lt - 0.5) / 0.9);
      return (
        <g>
          <Sky t={t} cam={cam} look={LOOKS.rose} ast={30} />
          <SpaceRocket t={t} uid="f6" crew="wow" p={{x: 540 + Math.sin(lt * 3) * 120, y: 980, scale: 0.55, rot: 1.2 + Math.sin(roll * Math.PI) * 0.6, squash: -0.05 * Math.sin(roll * Math.PI)}} />
          <Asteroids cam={{...cam, x: lt * 900}} t={t} n={9} depth={1.6} near />
        </g>
      );
    },
  },
  {
    t0: bar(10),
    id: 'F7',
    kind: 'reaction',
    what: 'reacción por la ventana: asombro y luego celebración',
    r: (t, lt) => {
      const cam: Cam = {x: 0, y: -270, zoom: 3.4 + lt * 0.2, roll: 0};
      return (
        <g>
          <Sky t={t} look={LOOKS.violet} />
          <World cam={cam}>
            <NutRocket2 id="f7" p={{x: 0, y: 0, scale: 1, rot: 0, build: BUILT2, vibrate: 0.05, engine: 0, glow: 0.2, t, rim: '#c38aff', rimK: 0.6}} windowContent={<CrewInWindow t={t} mode={lt < 0.9 ? 'wow' : 'cheer'} uid="f7c" />} />
            <Burst x={0} y={-280} u={(lt - 0.9) / 0.6} r={160} />
          </World>
        </g>
      );
    },
  },
  {t0: bar(11), id: 'F8', kind: 'close', what: 'Bip baila como robot: pasos secos, brazos alternos y luces al ritmo', r: (t, lt) => <CockpitClose t={t} lt={lt} who="bip" mode="dance" zoom={2.2} dy={110} view="stars" glow="#7ff3ff" />},
  {
    t0: bar(12),
    id: 'F9',
    kind: 'cockpit',
    what: 'cabina general: los tres bailan flotando y la cámara gira suavemente',
    r: (t, lt) => (
      <Cockpit2 cam={pulsed({x: Math.sin(lt * 1.5) * 60, y: 30, zoom: 1.05, roll: Math.sin(lt * 1.6) * 0.06}, t, 1)} t={t} view={<WinView t={t} kind="stars" local={lt} speed={2} />} glow="#c38aff" glowK={0.14}>
        <CockpitCrew t={t} mode="dance" lt={lt} uid="f9" rim="#d8b0ff" />
      </Cockpit2>
    ),
  },
  {
    t0: bar(13),
    id: 'F10',
    kind: 'exterior',
    what: 'el cohete persigue un cometa y deja una estela de chispas',
    r: (t, lt) => {
      const cam: Cam = {x: lt * 120, y: 0, zoom: 1, roll: 0};
      return (
        <g>
          <Sky t={t} cam={cam} look={LOOKS.gold} />
          <Comet2 t={t} t0={bar(13) - 0.3} dur={2.6} x0={1100} y0={500} x1={-120} y1={700} s={1.6} c="#ffe7b0" />
          <SpaceRocket t={t} uid="f10" crew="cheer" p={{x: lerp(1250, 420, lt / 1.9), y: lerp(1100, 1000, lt / 1.9), scale: 0.62, rot: -1.45}} />
        </g>
      );
    },
  },
  {
    t0: bar(14),
    id: 'F11',
    kind: 'close',
    what: 'Nico y Luna, flotando juntos, cantan a cámara',
    r: (t, lt) => {
      const c = crewPoses(t, 'dance', lt, '#ffd0a0');
      c.nico = {...c.nico, x: -110, y: 300, ...{lean: nicoDance(t, 0.5).lean ?? 0}, expr: ex(t, 1, {mouth: 'grin', eyes: 'normal', look: {x: 0, y: 0}}, 1)};
      c.luna = {...c.luna, x: 150, y: 290, facing: -1, spin: 0, bob: (lunaDance(t, 0.6).bob ?? 0) * 0.5, expr: ex(t, 4, {mouth: 'grin', look: {x: 0, y: 0}}, 1)};
      return (
        <Cockpit2 cam={pulsed({x: 20, y: -40, zoom: 1.55 + lt * 0.08, roll: 0}, t, 0.8)} t={t} view={<WinView t={t} kind="stars" local={lt} />} glow="#ffd27a" glowK={0.12}>
          <Luna2 id="f11l" p={c.luna} />
          <Nico2 id="f11n" p={c.nico} />
        </Cockpit2>
      );
    },
  },
  {
    t0: bar(15),
    id: 'F12',
    kind: 'planet',
    what: 'aparece la Luna de queso en el horizonte; el cohete pone rumbo hacia ella',
    r: (t, lt) => {
      const k = clamp(lt / 2.3);
      return (
        <g>
          <Sky t={t} look={LOOKS.gold} />
          <CheeseMoon2 x={lerp(760, 700, k)} y={lerp(560, 600, k)} r={lerp(170, 240, k)} t={t} />
          <SpaceRocket t={t} uid="f12" crew="wow" p={{x: lerp(240, 520, k), y: lerp(1500, 1100, k), scale: lerp(0.7, 0.5, k), rot: 0.35}} />
        </g>
      );
    },
  },
];
