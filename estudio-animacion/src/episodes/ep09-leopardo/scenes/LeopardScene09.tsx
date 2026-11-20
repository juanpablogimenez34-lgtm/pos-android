// ESCENA 9 (120–135 s) — UNA MADRE PROTECTORA. Entre rocas y vegetación: dos cachorros juegan (uno
// salta sobre el otro, persiguen la cola de la madre), la madre los vigila, acerca la cabeza a uno
// con cariño y al final los tres se alejan juntos.
import React from 'react';
import {clamp, hash1, lerp, smoothstep} from '../../../engine/math';
import {advance, idle, interact, jump, look, walk, WALK} from '../animation/LeopardMotion';
import {Cam, drift, layerT} from '../animation/CameraSystem';
import {leopardPose} from '../animation/LeopardRig';
import {Dust, FallingLeaves} from '../animation/ParticleSystem';
import {Leopard} from '../characters/Leopard';
import {Grass, SavannahBack} from '../environments/Savannah';
import {Caption, Grade, SceneOut, win} from './common';

const Rocks: React.FC = () => (
  <g>
    {[[-700, 260, 220], [-260, 180, 140], [520, 300, 260], [980, 200, 160]].map(([x, w, h], i) => (
      <g key={i}>
        <path d={`M${x - w},10 Q${x - w * 0.9},${-h} ${x},${-h * 1.1} Q${x + w * 0.8},${-h} ${x + w},10Z`} fill={['#9a8a74', '#8a7a64', '#a89a84', '#928270'][i]} />
        <path d={`M${x - w * 0.6},${-h * 0.6} Q${x},${-h * 0.95} ${x + w * 0.5},${-h * 0.7}`} stroke="#c8baa4" strokeWidth={8} fill="none" opacity={0.5} />
      </g>
    ))}
    {Array.from({length: 14}, (_, i) => (
      <ellipse key={i} cx={-1000 + i * 160 + hash1(i) * 60} cy={12} rx={40 + hash1(i * 2) * 30} ry={14} fill="#5a7a3a" opacity={0.8} />
    ))}
  </g>
);

export function scene09(t: number): SceneOut {
  const lt = t - 120;
  const go = smoothstep(130, 131, t);
  const mCyc = Math.max(0, t - 130.4) / WALK.period;
  const mx = 40 + mCyc * advance(WALK);
  const nuzzle = win(t, 125.6, 129.4, 0.6);
  const mother = leopardPose({x: mx, y: 40, scale: 1.1, t, ...(t < 130.4 ? (nuzzle > 0.01 ? interact(t, nuzzle) : look(idle(t, 1), -0.6, 0.1)) : walk(t, mCyc, 2))});
  if (t < 130.4) mother.facing = -1;
  if (t < 130.4) mother.x = 120;
  // cachorro A: salta sobre B (pulsos de juego)
  const hopU = ((lt % 2.4) / 1.2);
  const a = leopardPose({x: lerp(-260, -120, clamp(hopU)), y: 40, scale: 0.5, cub: 1, t, ...(hopU < 1 ? jump(t, hopU, 70) : idle(t, 5)), facing: 1});
  const b = leopardPose({x: -60 + Math.sin(t * 1.3) * 30, y: 46, scale: 0.47, cub: 1, t, ...walk(t, t * 1.4, 6), rot: hopU > 0.4 && hopU < 0.9 ? -0.25 * Math.sin((hopU - 0.4) * Math.PI * 2) : 0, facing: Math.sin(t * 0.8) > 0 ? 1 : -1});
  if (t >= 130.4) {
    const cyc = (t - 130.4) / WALK.period;
    a.x = mx - 260 - Math.sin(t * 2) * 10;
    b.x = mx - 400;
    Object.assign(a, walk(t, cyc * 1.6, 5), {facing: 1});
    Object.assign(b, walk(t, cyc * 1.7, 6), {facing: 1, rot: 0});
  }
  const cam: Cam = drift({x: lerp(-40, mx - 100, go), y: -200, zoom: lerp(1.75, 1.45, go), roll: 0}, t, 1);
  return {
    svg: (
      <g>
        <SavannahBack cam={cam} t={t} hour={0.6} />
        <Grass cam={cam} t={t} hour={0.6} d={0.75} y={-30} n={100} h={90} seed={12} />
        <g transform={layerT(cam, 1)}>
          <rect x={-3000} y={-4} width={6000} height={1600} fill="#a8905a" />
          <Rocks />
          <Leopard uid="m9" p={mother} />
          <Leopard uid="ca" p={a} />
          <Leopard uid="cb" p={b} />
        </g>
        <FallingLeaves cam={cam} t={t} n={8} x0={-900} x1={900} />
        <Dust cam={cam} t={t} n={26} color="#fff0c8" />
      </g>
    ),
    overlay: (
      <>
        <Grade warm={0.8} vignette={0.85} />
        <Caption text="La madre esconde y enseña" k={win(t, 124.4, 129.4, 0.4)} top={250} />
        <Caption text="Cada juego es una lección" k={win(t, 129.8, 134.6, 0.4)} top={250} color="#ffe2a0" />
      </>
    ),
  };
}
