// ESCENA 11 (150–165 s) — UN FUTURO INCIERTO. El leopardo observa desde una roca mientras el bosque
// se transforma poco a poco en un paisaje fragmentado (tocones, cultivos, carretera, valla); la
// cámara se aleja. Especie clasificada como Vulnerable por la UICN.
import {lerp, smoothstep} from '../../../engine/math';
import {idle, look} from '../animation/LeopardMotion';
import {Cam, drift, layerT} from '../animation/CameraSystem';
import {leopardPose} from '../animation/LeopardRig';
import {Dust} from '../animation/ParticleSystem';
import {Leopard} from '../characters/Leopard';
import {Fragmented} from '../environments/Landscapes';
import {Caption, Grade, SceneOut, win} from './common';

export function scene11(t: number): SceneOut {
  const k = smoothstep(151, 161.5, t);
  const p = leopardPose({x: 160, y: -170, scale: 1.0, facing: -1, t, ...look(idle(t, 11), 0.7 * Math.sin(t * 0.25), 0.15), tail: {base: -0.4, amp: 0.3, speed: 0.6, curl: 0.4}, rim: '#ffc890', rimK: 0.5});
  const cam: Cam = drift({x: lerp(140, 60, k), y: lerp(-290, -330, k), zoom: lerp(1.9, 1.0, smoothstep(150, 164, t)), roll: 0}, t, 0.6);
  return {
    svg: (
      <g>
        <Fragmented cam={cam} t={t} k={k} />
        <g transform={layerT(cam, 1)}>
          <path d="M-200,10 Q-160,-160 140,-180 Q380,-170 420,10Z" fill="#8a7a66" />
          <path d="M-120,-80 Q120,-170 340,-120" stroke="#b8aa94" strokeWidth={8} fill="none" opacity={0.5} />
          <Leopard uid="l11" p={p} />
        </g>
        <Dust cam={cam} t={t} n={24} color="#f0e0c0" k={0.5 + 0.5 * k} />
      </g>
    ),
    overlay: (
      <>
        <Grade warm={0.4} vignette={0.95} />
        <Caption text="pérdida de hábitat · menos presas · conflictos con personas" k={win(t, 154.8, 161.6, 0.4)} top={250} />
        <Caption text="ESPECIE VULNERABLE" sub="Lista Roja de la UICN" k={win(t, 162.0, 164.9, 0.3)} top={250} color="#ffb08a" />
      </>
    ),
  };
}
