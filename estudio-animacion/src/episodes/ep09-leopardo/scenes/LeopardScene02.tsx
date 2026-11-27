// ESCENA 2 (15–30 s) — CAMUFLAJE PERFECTO. Selva de día: el leopardo avanza entre vegetación con
// luz moteada que se desplaza sobre su cuerpo; acercamiento a las rosetas; al final se detiene
// tras el follaje y casi desaparece.
import {lerp, smoothstep} from '../../../engine/math';
import {advance, idle, look, walk, WALK} from '../animation/LeopardMotion';
import {Cam, camAt, drift} from '../animation/CameraSystem';
import {leopardPose} from '../animation/LeopardRig';
import {Dust, FallingLeaves, LightRays} from '../animation/ParticleSystem';
import {Leopard} from '../characters/Leopard';
import {Dapple, JungleBack, JungleFront, JungleGround} from '../environments/Jungle';
import {Caption, Grade, SceneOut, win} from './common';

export function scene02(t: number): SceneOut {
  const walkEnd = 25.4;
  const cyc = (Math.min(t, walkEnd) - 15) / WALK.period;
  const x = -360 + cyc * advance(WALK);
  const st = t < walkEnd ? walk(t, cyc, 1) : look(idle(t, 2), 0.6, 0.05);
  const p = leopardPose({x, y: 40, scale: 1.2, rim: '#fff0c0', rimK: 0.45, t, ...st});
  const cam0 = camAt([[15, x - 40, -170, 1.9], [21, x, -170, 2.0], [22.6, x + 10, -150, 3.6], [25.4, x + 10, -150, 3.6], [27.2, x + 60, -210, 1.5], [30, x + 60, -220, 1.4]], t);
  const cam: Cam = drift({...cam0, x: t < 25.4 ? lerp(cam0.x, p.x + 20, 0.9) : cam0.x}, t, 1);
  const hide = smoothstep(25.6, 27.6, t);
  return {
    svg: (
      <g>
        <JungleBack cam={cam} t={t} night={0} />
        <LightRays cam={cam} t={t} color="#fff2c0" k={0.9} x0={-1200} />
        <JungleGround cam={cam} t={t} night={0}>
          <Leopard uid="l2" p={p} />
        </JungleGround>
        <Dapple cam={cam} t={t} k={0.9} x0={x - 500} x1={x + 500} y0={-280} y1={10} />
        <Dust cam={cam} t={t} n={36} color="#fff4d0" />
        <FallingLeaves cam={cam} t={t} n={10} x0={x - 900} x1={x + 900} />
        <JungleFront cam={{...cam, x: cam.x - 120 + hide * 160}} t={t} night={0} k={0.65 + 0.35 * hide} />
      </g>
    ),
    overlay: (
      <>
        <Grade warm={0.7} vignette={0.8} />
        <Caption text="Rosetas" sub="rompen el contorno del cuerpo" k={win(t, 22.6, 25.3, 0.4)} top={240} />
        <Caption text="¿Puedes verlo?" k={win(t, 26.8, 29.8, 0.4)} top={250} color="#ffe2a0" />
      </>
    ),
  };
}
