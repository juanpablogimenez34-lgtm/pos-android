// ESCENA 4 (45–60 s) — EL ATAQUE. Tensión final del acecho, explosión de velocidad (galope),
// salto a cámara lenta con polvo, aterrizaje… y el impala escapa. Sin escenas gráficas.
import React from 'react';
import {clamp, hash1, lerp, smoothstep} from '../../../engine/math';
import {advance, idle, jump, look, RUN, run, speedOf, stalk} from '../animation/LeopardMotion';
import {Cam, drift, layerT} from '../animation/CameraSystem';
import {leopardPose} from '../animation/LeopardRig';
import {Dust} from '../animation/ParticleSystem';
import {Leopard} from '../characters/Leopard';
import {Impala} from '../characters/Prey';
import {Grass, SavannahBack} from '../environments/Savannah';
import {EV} from '../config/episode';
import {Caption, Grade, SceneOut, seg, win} from './common';
import {IMPALA_X, STALK_X0, stalkCycles} from './LeopardScene03';
import {STALK} from '../animation/LeopardMotion';

const START_X = STALK_X0 + stalkCycles(45) * advance(STALK);
const RUN_V = speedOf(RUN);
const JUMP_D = 1.6; // dura más: cámara lenta
const JUMP_LEN = 520;
const takeoffX = START_X + RUN_V * (EV.jump - EV.runStart);

/** Nube de polvo que se expande (despegue y aterrizaje). */
const DustBurst: React.FC<{x: number; u: number; s?: number}> = ({x, u, s = 1}) =>
  u > 0 && u < 1.6 ? (
    <g opacity={clamp(1.4 - u)}>
      {Array.from({length: 14}, (_, i) => {
        const a = (i / 14) * Math.PI;
        const d = (40 + 220 * Math.sqrt(clamp(u))) * s;
        return <circle key={i} cx={x + Math.cos(a) * d * (i % 2 ? 1 : -1)} cy={-Math.sin(a) * d * 0.25 - 10} r={(26 + 40 * u) * s * (0.7 + hash1(i) * 0.6)} fill="#e8cfa0" opacity={0.55} />;
      })}
    </g>
  ) : null;

export function leopardAttack(t: number) {
  if (t < EV.runStart) {
    return leopardPose({x: START_X, y: 40, scale: 1.15, t, ...stalk(t, stalkCycles(45), 1), tail: {base: -0.25, amp: 0.15, speed: 4, curl: 1.1 + 0.3 * Math.sin(t * 7)}, bodyY: 30 + 4 * Math.sin(t * 9)});
  }
  if (t < EV.jump) {
    const cyc = (t - EV.runStart) / RUN.period;
    const ramp = smoothstep(EV.runStart, EV.runStart + 0.6, t);
    return leopardPose({x: START_X + RUN_V * (t - EV.runStart) - (1 - ramp) * 40, y: 40, scale: 1.15, t, ...run(t, cyc)});
  }
  if (t < EV.jump + JUMP_D) {
    const u = (t - EV.jump) / JUMP_D;
    const st = jump(t, 0.28 + u * 0.72, 190);
    return leopardPose({x: takeoffX + JUMP_LEN * st.travel, y: 40, scale: 1.15, t, ...st});
  }
  const lt = t - (EV.jump + JUMP_D);
  const st = lt < 1.2 ? jump(t, 1, 190) : look(idle(t, 4), 0.8, 0.1);
  return leopardPose({x: takeoffX + JUMP_LEN + Math.min(lt, 0.6) * 60, y: 40, scale: 1.15, t, ...st, breathe: 0.5 + 0.5 * Math.sin(t * 6), jaw: lt > 1 ? 0.35 : 0, muscle: 0.8});
}

export function scene04(t: number): SceneOut {
  const p = leopardAttack(t);
  // el impala se alarma y huye a saltos (más rápido que el leopardo al final)
  const flee = t > 46.6;
  const ix = flee ? IMPALA_X + 900 * (t - 46.6) + 120 * Math.max(0, t - EV.jump) : IMPALA_X;
  const slow = win(t, EV.jump, EV.jump + JUMP_D, 0.2);
  const tension = t < EV.runStart;
  const cam: Cam = drift(
    tension
      ? {x: p.x + 90, y: -150, zoom: 2.8, roll: 0}
      : {x: t > EV.land + 0.8 ? lerp((p.x + Math.min(ix, p.x + 700)) / 2, p.x + 80, seg(t, 55, 57.5)) : (p.x + Math.min(ix, p.x + 700)) / 2, y: lerp(-200, -240, slow), zoom: lerp(1.1, 1.25, slow) * (t > EV.land + 0.6 ? lerp(1, 1.5, seg(t, 55, 57.5)) : 1), roll: 0},
    t,
    tension ? 0.6 : 1.4,
  );
  return {
    svg: (
      <g>
        <SavannahBack cam={cam} t={t} hour={0.8} />
        <Grass cam={cam} t={t} hour={0.8} d={0.8} y={-30} n={120} h={70} seed={4} />
        <Grass cam={cam} t={t} hour={0.8} d={1} y={0} n={170} h={120} partX={p.x} partK={1.2} seed={5} />
        <g transform={layerT(cam, 1)}>
          <Impala x={ix} y={10} s={1.0} t={t} state={flee ? 'run' : t > 45.5 ? 'alert' : 'graze'} facing={flee ? 1 : -1} />
          <DustBurst x={takeoffX} u={(t - EV.jump) / 1.2} />
          <DustBurst x={takeoffX + JUMP_LEN} u={(t - EV.land) / 1.2} s={1.2} />
          <Leopard uid="l4" p={p} />
        </g>
        <Grass cam={cam} t={t} hour={0.8} d={1.3} y={60} n={80} h={140} partX={p.x * 1.3} partK={0.6} seed={6} />
        <Dust cam={cam} t={t} n={44} color="#f8e0b0" k={0.6 + 0.4 * slow} />
      </g>
    ),
    overlay: (
      <>
        <Grade warm={1} vignette={0.9} />
        {slow > 0.01 && <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 55% at 50% 45%, rgba(0,0,0,0) 50%, rgba(30,15,0,0.45) 100%)', opacity: slow}} />}
        <Caption text="La presa escapa" sub="muchas cacerías fracasan" k={win(t, 55.4, 59.6, 0.4)} top={250} />
      </>
    ),
  };
}
