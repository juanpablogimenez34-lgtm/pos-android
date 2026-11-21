// ESCENA 7 (90–105 s) — LOS OJOS DE LA NOCHE. El atardecer se vuelve noche sobre el leopardo que
// descansa en la rama; primer plano de los ojos: las pupilas se dilatan al bajar la luz y aparece
// el brillo ocular; esquema del tapetum lucidum (la luz atraviesa la retina, se refleja y vuelve a
// atravesarla); insectos nocturnos y luciérnagas.
import React from 'react';
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {blink, rest} from '../animation/LeopardMotion';
import {Cam, drift, layerT} from '../animation/CameraSystem';
import {leopardPose} from '../animation/LeopardRig';
import {Insects} from '../animation/ParticleSystem';
import {Leopard} from '../characters/Leopard';
import {LeopardFace} from '../characters/LeopardFace';
import {Grass, SavannahBack} from '../environments/Savannah';
import {GiantTree} from '../environments/Tree';
import {Caption, Grade, SceneOut, win} from './common';

const BR = -700;

/** Esquema del tapetum lucidum (sección del ojo). */
const Tapetum: React.FC<{t: number; k: number}> = ({t, k}) => {
  const u = (t * 0.7) % 1;
  return (
    <g transform="translate(540 470)" opacity={k}>
      <rect x={-330} y={-170} width={660} height={330} rx={26} fill="rgba(6,10,24,0.78)" stroke="rgba(216,255,138,0.5)" strokeWidth={2} />
      <circle cx={60} cy={0} r={120} fill="#1a2440" stroke="#bfe6ff" strokeWidth={4} />
      <ellipse cx={-50} cy={0} rx={22} ry={60} fill="#bfe6ff" opacity={0.5} />
      <path d="M150,-80 A120,120 0 0 1 150,80" stroke="#ff9a6a" strokeWidth={10} fill="none" />
      <path d="M164,-80 A134,134 0 0 1 164,80" stroke="#d8ff8a" strokeWidth={8} fill="none" />
      {/* rayo de luz que entra, atraviesa la retina, se refleja y sale */}
      <path d={`M-300,-20 L${lerp(-300, 160, Math.min(1, u * 2))},${lerp(-20, -6, Math.min(1, u * 2))}`} stroke="#fff6c0" strokeWidth={5} />
      {u > 0.5 && <path d={`M160,-6 L${lerp(160, -300, (u - 0.5) * 2)},${lerp(-6, 30, (u - 0.5) * 2)}`} stroke="#d8ff8a" strokeWidth={5} strokeDasharray="12 8" />}
      <text x={-300} y={-120} fontFamily="Montserrat" fontWeight={800} fontSize={34} fill="#ffffff">
        tapetum lucidum
      </text>
      <text x={-300} y={140} fontFamily="Montserrat" fontWeight={600} fontSize={24} fill="#d8ff8a">
        capa reflectante tras la retina
      </text>
      <text x={196} y={-96} fontFamily="Montserrat" fontWeight={700} fontSize={22} fill="#ffb08a">
        retina
      </text>
    </g>
  );
};

export function scene07(t: number): SceneOut {
  const hour = lerp(1.6, 3, smoothstep(90, 97, t));
  const night = smoothstep(93, 99, t);
  const close = t >= 95.2;
  if (!close) {
    const p = leopardPose({x: 520, y: BR - 26, scale: 1.05, t, night: night * 0.8, rim: '#ffb070', rimK: 0.6 * (1 - night), ...rest(t), head: {pitch: -0.15, tilt: 0.04, turn: 0.5 * smoothstep(92, 94, t)}});
    const cam: Cam = drift({x: 420, y: BR - 120, zoom: lerp(1.5, 2.2, smoothstep(90, 95, t)), roll: 0}, t, 0.8);
    return {
      svg: (
        <g>
          <SavannahBack cam={cam} t={t} hour={hour} stars={smoothstep(94, 97, t)} />
          <Grass cam={cam} t={t} hour={hour} d={0.75} y={-20} n={90} h={90} seed={9} />
          <g transform={layerT(cam, 1)}>
            <rect x={-3000} y={0} width={6000} height={1600} fill="#3a2a20" />
            <GiantTree x={0} t={t} branchY={BR} color="#3a2818" tint={night} />
            <Leopard uid="l7" p={p} />
          </g>
          <Insects cam={cam} t={t} night={night} n={18} cx={420} cy={BR - 200} spread={900} />
        </g>
      ),
      overlay: <Grade warm={1 - night} night={night} vignette={0.9} />,
    };
  }
  // primer plano de los ojos: la pupila se dilata y aparece el brillo
  const lt = t - 95.2;
  const pupil = lerp(0.3, 1.0, smoothstep(95.4, 99.5, t));
  const shine = smoothstep(99.8, 101.6, t);
  const s = lerp(1.9, 2.35, clamp(lt / 9));
  const diagram = win(t, 96.4, 100.4, 0.5);
  return {
    svg: (
      <g>
        <rect width={1080} height={1920} fill="#05070f" />
        <g transform={`translate(540 ${(980 - 60 * diagram).toFixed(1)}) scale(${s.toFixed(3)})`}>
          <g opacity={1 - 0.75 * shine}>
            <LeopardFace t={t} blink={blink(t, 3)} pupil={pupil} shine={0} look={{x: 0.2 * Math.sin(t * 0.7), y: 0}} ears={0.3} night={0.85} breathe={Math.sin(t * 1.4)} />
          </g>
          {shine > 0.01 && (
            <g opacity={shine}>
              <LeopardFace t={t} blink={blink(t, 3)} pupil={pupil} shine={1} look={{x: 0.2 * Math.sin(t * 0.7), y: 0}} ears={0} night={1} eyesOnly />
            </g>
          )}
        </g>
        <Insects cam={{x: 0, y: 0, zoom: 1, roll: 0}} t={t} night={1} n={22} cx={540} cy={900} spread={1100} />
        <Tapetum t={t} k={diagram} />
      </g>
    ),
    overlay: (
      <>
        <Grade night={1} vignette={1} />
        <Caption text="Las pupilas se dilatan" sub="para captar más luz" k={win(t, 100.6, 104.6, 0.4)} top={250} />
      </>
    ),
  };
}
