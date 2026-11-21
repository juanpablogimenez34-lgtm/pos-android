// ESCENA 3 (30–45 s) — EL CAZADOR SILENCIOSO. Sabana dorada: el leopardo acecha agachado entre
// la hierba alta (que se aparta a su paso), orejas al frente, cámara baja que lo sigue; se queda
// inmóvil cuando el impala levanta la cabeza y sigue avanzando cuando vuelve a pastar.
import {clamp, lerp} from '../../../engine/math';
import {advance, STALK, stalk} from '../animation/LeopardMotion';
import {Cam, drift, layerT} from '../animation/CameraSystem';
import {leopardPose} from '../animation/LeopardRig';
import {Dust, Insects} from '../animation/ParticleSystem';
import {Leopard} from '../characters/Leopard';
import {Impala} from '../characters/Prey';
import {Grass, SavannahBack} from '../environments/Savannah';
import {Grade, SceneOut, seg} from './common';

export const STALK_X0 = -520;
/** Avance del acecho con la pausa (35,9–37,2 s y 40,0–41,3 s): ciclos efectivos. */
export function stalkCycles(t: number) {
  const pause = (a: number, b: number) => clamp((t - a) / (b - a)) * (b - a);
  const dt = t - 30 - pause(35.9, 37.2) - pause(40.0, 41.3);
  return Math.max(0, dt) / STALK.period;
}
export const IMPALA_X = STALK_X0 + 960;

export function scene03(t: number): SceneOut {
  const cyc = stalkCycles(t);
  const frozen = (t > 35.9 && t < 37.2) || (t > 40 && t < 41.3);
  const x = STALK_X0 + cyc * advance(STALK);
  const p = leopardPose({x, y: 40, scale: 1.15, rim: '#ffd890', rimK: 0.5, t, ...stalk(t, cyc, frozen ? 1 : 0)});
  if (frozen) p.tail = {base: -0.25, amp: 0.1, speed: 3, curl: 1.0};
  const alert = (t > 35.7 && t < 37.3) || (t > 39.8 && t < 41.4);
  const wide = seg(t, 42, 44.5);
  const mid = (p.x + IMPALA_X) / 2;
  const intro = 1 - seg(t, 30, 33.5);
  const cam: Cam = drift({x: lerp(mid, p.x + 160, intro), y: lerp(-190, -140, intro), zoom: lerp(lerp(1.25, 1.15, wide), 1.9, intro), roll: 0}, t, 1.2);
  return {
    svg: (
      <g>
        <SavannahBack cam={cam} t={t} hour={0.75} />
        <Grass cam={cam} t={t} hour={0.75} d={0.8} y={-30} n={120} h={80} seed={1} />
        <Grass cam={cam} t={t} hour={0.75} d={1} y={0} n={170} h={150} partX={p.x + 40} partK={1} seed={2} />
        <g transform={layerT(cam, 1)}>
          <Impala x={IMPALA_X} y={10} s={1.0} t={t} state={alert ? 'alert' : 'graze'} facing={-1} />
          <Leopard uid="l3" p={p} />
        </g>
        <Grass cam={cam} t={t} hour={0.75} d={1.35} y={60} n={90} h={170} partX={p.x * 1.35} partK={0.6} seed={3} />
        <Dust cam={cam} t={t} n={30} color="#fff0c8" />
        <Insects cam={cam} t={t} night={0} n={8} cx={p.x + 200} cy={-260} spread={700} />
      </g>
    ),
    overlay: <Grade warm={1} vignette={0.85} />,
  };
}
