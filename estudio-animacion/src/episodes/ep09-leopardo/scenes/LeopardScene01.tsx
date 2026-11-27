// ESCENA 1 (0–15 s) — EL FANTASMA APARECE. Selva nocturna; dos ojos brillan entre las hojas; la
// cámara avanza; el rostro se revela, mira al espectador, parpadea, respira; después se gira y
// desaparece entre la vegetación. Título «EL FANTASMA DE LA SELVA».
import {lerp, smoothstep} from '../../../engine/math';
import {blink} from '../animation/LeopardMotion';
import {walk, WALK, advance} from '../animation/LeopardMotion';
import {Cam} from '../animation/CameraSystem';
import {leopardPose} from '../animation/LeopardRig';
import {Insects} from '../animation/ParticleSystem';
import {Leopard} from '../characters/Leopard';
import {LeopardFace} from '../characters/LeopardFace';
import {BigLeaf, JungleBack, JungleFront, JungleGround} from '../environments/Jungle';
import {BigTitle, Grade, SceneOut, win} from './common';

export function scene01(t: number): SceneOut {
  const face = t < 9.6;
  if (face) {
    const push = smoothstep(0.5, 9.4, t);
    const reveal = smoothstep(4.4, 8.6, t);
    const s = lerp(0.85, 1.75, push);
    const bl = Math.max(blink(t, 1), t > 3.5 && t < 3.75 ? Math.sin(((t - 3.5) / 0.25) * Math.PI) : 0, t > 7.1 && t < 7.35 ? Math.sin(((t - 7.1) / 0.25) * Math.PI) : 0);
    const cam: Cam = {x: 0, y: 0, zoom: 1 + push * 0.4, roll: 0};
    const tilt = 0.05 * Math.sin(t * 0.6) + (t > 6 ? 0.06 * Math.sin((t - 6) * 1.2) : 0);
    const part = smoothstep(2, 9, t);
    return {
      svg: (
        <g>
          <JungleBack cam={cam} t={t} night={1} />
          <g transform={`translate(540 ${(840 - 30 * push).toFixed(1)}) scale(${s.toFixed(3)})`}>
            <g opacity={reveal}>
              <LeopardFace t={t} blink={bl} pupil={0.95} shine={0.6} look={{x: 0, y: 0}} ears={0.4 + 0.3 * Math.sin(t * 0.9)} night={1} tilt={tilt} breathe={Math.sin(t * 1.6)} />
            </g>
            <LeopardFace t={t} blink={bl} pupil={0.95} shine={1} look={{x: 0, y: 0}} ears={0} night={1} tilt={tilt} eyesOnly />
          </g>
          {/* hojas delante del rostro que se apartan al acercarse la cámara */}
          {Array.from({length: 10}, (_, i) => {
            const side = i % 2 ? 1 : -1;
            const x = 540 + side * (80 + i * 22 + part * 360);
            const y = 600 + (i % 5) * 120;
            const sw = Math.sin(t * 0.8 + i) * 6;
            return <BigLeaf key={i} x={x} y={y} s={1.8 + (i % 3) * 0.4} rot={side > 0 ? -20 + sw + i * 6 : 200 - sw - i * 6} c="#0c2414" vein="#183a20" />;
          })}
          <Insects cam={{x: 0, y: 0, zoom: 1, roll: 0}} t={t} night={1} n={14} cx={540} cy={900} spread={1000} />
        </g>
      ),
      overlay: <Grade dark={1 - smoothstep(0, 1.6, t)} night={1} vignette={1} />,
    };
  }
  // se gira y se marcha hacia la vegetación
  const lt = t - 9.6;
  const turn = lt < 1.0 ? 1 : 0;
  const cyc = Math.max(0, lt - 0.9) / WALK.period;
  const st = turn ? {} : walk(t, cyc);
  const x = -cyc * advance(WALK);
  const p = leopardPose({x, y: 40, scale: 1.25, facing: -1, night: 1, rim: '#9ab8ff', rimK: 0.45, t, ...st, ...(turn ? {head: {pitch: 0, tilt: 0.05, turn: 0.8}, eye: {blink: 0, look: {x: 1, y: 0}, pupil: 0.9, shine: 0.8}} : {})});
  const cam: Cam = {x: -120 - lt * 20, y: -150, zoom: 1.7, roll: 0};
  return {
    svg: (
      <g>
        <JungleBack cam={cam} t={t} night={1} />
        <JungleGround cam={cam} t={t} night={1}>
          <Leopard uid="l1" p={p} />
        </JungleGround>
        <Insects cam={cam} t={t} night={1} n={16} cx={-200} cy={-300} spread={1100} />
        <JungleFront cam={{...cam, x: cam.x + lt * 60}} t={t} night={1} />
      </g>
    ),
    overlay: (
      <>
        <Grade night={1} vignette={1} dark={0.15 + 0.85 * smoothstep(13.6, 15, t)} />
        <BigTitle lines={['EL LEOPARDO', 'EL FANTASMA DE LA SELVA']} k={win(t, 11.6, 14.8, 0.4)} top={320} size={88} />
      </>
    ),
  };
}
