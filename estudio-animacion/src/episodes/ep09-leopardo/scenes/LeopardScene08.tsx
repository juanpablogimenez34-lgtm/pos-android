// ESCENA 8 (105–120 s) — UN FELINO SOLITARIO. Plano panorámico de la sabana inmensa con el leopardo
// pequeño caminando; después, más cerca, se alza contra un tronco y deja arañazos (marca
// territorial), frota la mejilla y sigue su camino.
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {advance, alive, walk, WALK} from '../animation/LeopardMotion';
import {Cam, camAt, drift, layerT} from '../animation/CameraSystem';
import {leopardPose, LeopardPose, PAW0, V} from '../animation/LeopardRig';
import {Dust} from '../animation/ParticleSystem';
import {Leopard} from '../characters/Leopard';
import {Grass, SavannahBack} from '../environments/Savannah';
import {GiantTree, TRUNK_W} from '../environments/Tree';
import {Caption, Grade, SceneOut, win} from './common';

const TX = 900;
const ARRIVE = 110.6;
const LEAVE = 115.6;

export function scene08(t: number): SceneOut {
  let p: LeopardPose;
  const v = advance(WALK) / WALK.period;
  const x0 = TX - TRUNK_W / 2 - 150 - v * (ARRIVE - 105);
  if (t < ARRIVE) {
    const cyc = (t - 105) / WALK.period;
    p = leopardPose({x: x0 + cyc * advance(WALK), y: 40, scale: 1.0, t, ...walk(t, cyc, 8)});
  } else if (t < LEAVE) {
    // se alza contra el tronco: el cuerpo gira hacia atrás y las zarpas delanteras arañan
    const up = smoothstep(ARRIVE, ARRIVE + 0.6, t) * (1 - smoothstep(LEAVE - 0.6, LEAVE, t));
    const scr = Math.sin((t - ARRIVE) * 7);
    p = leopardPose({
      x: TX - TRUNK_W / 2 - 150,
      y: 40,
      scale: 1.0,
      t,
      ...alive(t, 8, 0.6),
      rot: -0.75 * up,
      bodyY: 0,
      paws: {FN: V(lerp(PAW0.FN.x, 150, up), lerp(0, -30 - 25 * scr, up)), FF: V(lerp(PAW0.FF.x, 140, up), lerp(0, -40 + 25 * scr, up)), HN: PAW0.HN, HF: PAW0.HF},
      head: {pitch: -0.2 * up, tilt: 0.1 * Math.sin(t * 2), turn: t > LEAVE - 2 ? 0.8 : 0.2},
      muscle: 0.9,
    });
  } else {
    const cyc = (t - LEAVE) / WALK.period;
    p = leopardPose({x: TX - TRUNK_W / 2 - 150 + cyc * advance(WALK) + 260 * clamp((t - LEAVE) / 1), y: 40, scale: 1.0, t, ...walk(t, cyc, 9)});
  }
  const scratches = smoothstep(ARRIVE + 0.8, ARRIVE + 3.4, t);
  const cam: Cam = drift(camAt([[105, TX - 300, -500, 0.62], [108.6, TX - 260, -380, 0.9], [110.6, TX - 140, -260, 1.55], [115.6, TX - 120, -260, 1.6], [120, TX + 140, -260, 1.3]], t), t, 1);
  return {
    svg: (
      <g>
        <SavannahBack cam={cam} t={t} hour={0.95} />
        <Grass cam={cam} t={t} hour={0.95} d={0.7} y={-20} n={120} h={70} seed={10} />
        <g transform={layerT(cam, 1)}>
          <rect x={-3000} y={-4} width={6000} height={1600} fill="#b88a50" />
          <GiantTree x={TX} t={t} branchY={-1300} color="#5a4030" scratches={scratches} />
          <Leopard uid="l8" p={p} />
        </g>
        <Grass cam={cam} t={t} hour={0.95} d={1} y={0} n={160} h={60} partX={p.x} partK={0.8} seed={11} />
        <Dust cam={cam} t={t} n={34} color="#fff0c8" />
      </g>
    ),
    overlay: (
      <>
        <Grade warm={0.9} vignette={0.85} />
        <Caption text="Vida solitaria" k={win(t, 105.8, 108.6, 0.4)} top={250} />
        <Caption text="olores · arañazos · vocalizaciones" k={win(t, 109.2, 114.8, 0.4)} top={250} color="#ffe2a0" />
      </>
    ),
  };
}
