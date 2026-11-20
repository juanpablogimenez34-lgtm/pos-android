// ESCENA 6 (75–90 s) — FUERZA EXTRAORDINARIA. A contraluz de la tarde, el leopardo sube despacio
// con una presa pesada (silueta, sin detalle), esfuerzo visible, cola equilibrando; la deja sobre
// la rama y descansa; abajo, una hiena mira hacia arriba sin poder alcanzarla.
import {clamp, easeInOut, lerp} from '../../../engine/math';
import {CLIMB, climb, rest} from '../animation/LeopardMotion';
import {Cam, drift, layerT} from '../animation/CameraSystem';
import {leopardPose, LeopardPose} from '../animation/LeopardRig';
import {Dust} from '../animation/ParticleSystem';
import {Leopard} from '../characters/Leopard';
import {Hyena, PreySilhouette} from '../characters/Prey';
import {Grass, SavannahBack} from '../environments/Savannah';
import {GiantTree} from '../environments/Tree';
import {Caption, Grade, SceneOut, win} from './common';
import {BRANCH_Y, climbing, TREE_X} from './LeopardScene05';

const SLOW = CLIMB.period * 1.9;
const T0 = 75.4;
const START_Y = -500;
const UP_END = 83.2;

export function scene06(t: number): SceneOut {
  let p: LeopardPose;
  let prey = {x: 0, y: 0, rot: 0};
  if (t < UP_END) {
    const c = climbing(t, T0, START_Y, SLOW, 1);
    p = c.p;
    p.y = Math.max(p.y, BRANCH_Y + 60);
    p.muscle = 1;
    p.tail = {base: -0.2 + 0.25 * Math.sin(t * 1.1), amp: 0.8, speed: 0.9, curl: 0.2};
    p.breathe = 0.5 + 0.5 * Math.sin(t * 5);
    // la presa cuelga de la boca (debajo de la cabeza, que mira hacia arriba)
    prey = {x: p.x - 180, y: p.y - 175, rot: 8 * Math.sin(t * 1.3)};
  } else {
    const u = easeInOut(clamp((t - UP_END) / 1.4));
    p = leopardPose({x: lerp(TREE_X - 69, TREE_X + 260, u), y: lerp(BRANCH_Y + 60, BRANCH_Y - 26, u), rot: lerp(-Math.PI / 2, 0, u), scale: 1.05, t, ...(u < 1 ? climb(t, (t - T0) / SLOW, 1) : rest(t))});
    prey = {x: lerp(TREE_X - 249, TREE_X + 470, u), y: lerp(BRANCH_Y - 115, BRANCH_Y - 40, u), rot: lerp(0, 90, u)};
  }
  const hyena = clamp((t - 85.6) / 0.8);
  const down = win(t, 85.8, 89.6, 0.8);
  const cam: Cam = drift({x: TREE_X + 40, y: lerp(Math.min(-300, p.y - 40), -280, down), zoom: lerp(1.6, 1.25, down), roll: 0}, t, 1);
  return {
    svg: (
      <g>
        <SavannahBack cam={cam} t={t} hour={1.25} />
        <Grass cam={cam} t={t} hour={1.25} d={0.85} y={-20} n={100} h={110} seed={7} />
        <g transform={layerT(cam, 1)}>
          <rect x={-3000} y={0} width={6000} height={1600} fill="#8a6a40" />
          <GiantTree x={TREE_X} t={t} branchY={BRANCH_Y} color="#4a3422" leafK={0.95} />
          <PreySilhouette x={prey.x} y={prey.y} s={1.15} rot={prey.rot} />
          <Leopard uid="l6" p={p} />
          {hyena > 0 && <Hyena x={lerp(-900, -260, hyena)} y={20} s={1.1} t={t} />}
        </g>
        <Grass cam={cam} t={t} hour={1.25} d={1.25} y={50} n={70} h={130} seed={8} />
        <Dust cam={cam} t={t} n={30} color="#ffe0a8" />
      </g>
    ),
    overlay: (
      <>
        <Grade warm={1} vignette={0.9} />
        <Caption text="Presas a veces más pesadas que él" k={win(t, 80.6, 85.6, 0.4)} top={250} />
        <Caption text="lejos de leones y hienas" k={win(t, 86.2, 89.8, 0.4)} top={250} color="#ffe2a0" />
      </>
    ),
  };
}
