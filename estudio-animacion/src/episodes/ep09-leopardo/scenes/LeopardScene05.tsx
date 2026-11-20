// ESCENA 5 (60–75 s) — EL REY DE LOS ÁRBOLES. Corre hasta un árbol gigantesco y trepa: garras en
// la corteza, cuerpo girado contra el tronco, marcha en salto; la cámara sube con él; hojas que
// caen; al llegar a la rama se incorpora y camina sobre ella.
import {clamp, easeInOut, lerp} from '../../../engine/math';
import {advance, CLIMB, climb, look, walk, WALK} from '../animation/LeopardMotion';
import {Cam, drift} from '../animation/CameraSystem';
import {leopardPose, LeopardPose} from '../animation/LeopardRig';
import {FallingLeaves, LightRays} from '../animation/ParticleSystem';
import {Leopard} from '../characters/Leopard';
import {JungleBack, JungleGround} from '../environments/Jungle';
import {GiantTree, TRUNK_W} from '../environments/Tree';
import {EV} from '../config/episode';
import {Caption, Grade, SceneOut, win} from './common';

export const TREE_X = 300;
export const BRANCH_Y = -1500;
const FACE_X = TREE_X - TRUNK_W / 2 + 6; // cara izquierda del tronco

/** Leopardo trepando: el tronco hace de "suelo" (cuerpo girado −90°). */
export function climbing(t: number, t0: number, y0: number, period = CLIMB.period, effort = 0.5): {p: LeopardPose; y: number} {
  const cyc = Math.max(0, t - t0) / period;
  const y = y0 - cyc * advance(CLIMB);
  return {p: leopardPose({x: FACE_X, y, rot: -Math.PI / 2, scale: 1.05, t, ...climb(t, cyc, effort)}), y};
}

export function scene05(t: number): SceneOut {
  let p: LeopardPose;
  const climbEnd = EV.branch;
  if (t < EV.climb) {
    const cyc = (t - 60) / WALK.period;
    const x = lerp(-420, FACE_X - 150, clamp((t - 60) / 1.5));
    p = leopardPose({x, y: 40, scale: 1.05, t, ...walk(t, cyc * 1.6, 3)});
  } else if (t < climbEnd) {
    p = climbing(t, EV.climb, -40).p;
    p.y = Math.max(p.y, BRANCH_Y + 60);
  } else {
    // se incorpora sobre la rama
    const u = easeInOut(clamp((t - climbEnd) / 1.2));
    const top = BRANCH_Y + 60;
    p = leopardPose({x: lerp(FACE_X, TREE_X + 220, u), y: lerp(top, BRANCH_Y - 28, u), rot: lerp(-Math.PI / 2, 0, u), scale: 1.05, t, ...(u < 1 ? climb(t, (t - EV.climb) / CLIMB.period) : look(walk(t, (t - climbEnd) / WALK.period, 3), 0.5, 0.2))});
    if (u >= 1) p.x = TREE_X + 220 + Math.min(t - climbEnd - 1.2, 1.4) * advance(WALK) / WALK.period * 0.6;
  }
  const followY = Math.min(-200, p.y - 60);
  const cam: Cam = drift({x: TREE_X - 140, y: followY, zoom: t < EV.climb ? 1.5 : 1.75, roll: 0}, t, 1);
  return {
    svg: (
      <g>
        <JungleBack cam={cam} t={t} night={0} />
        <LightRays cam={cam} t={t} color="#fff4c8" k={0.8} x0={-800} />
        <JungleGround cam={cam} t={t} night={0}>
          <GiantTree x={TREE_X} t={t} branchY={BRANCH_Y} />
          <Leopard uid="l5" p={p} />
        </JungleGround>
        <FallingLeaves cam={cam} t={t} n={16} x0={TREE_X - 900} x1={TREE_X + 900} />
      </g>
    ),
    overlay: (
      <>
        <Grade warm={0.6} vignette={0.85} />
        <Caption text="Escalador extraordinario" k={win(t, 65.8, 68.8, 0.4)} top={250} />
        <Caption text="descansar · vigilar · proteger su comida" k={win(t, 69.2, 74.6, 0.4)} top={250} color="#ffe2a0" />
      </>
    ),
  };
}
