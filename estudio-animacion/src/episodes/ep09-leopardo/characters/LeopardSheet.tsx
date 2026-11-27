// Ficha de control del leopardo y los cachorros (verificación interna de los estados del rig).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ensureFonts} from '../../../engine/fonts';
import {useTime} from '../../../engine/useTime';
import {climb, idle, interact, jump, rest, run, stalk, walk} from '../animation/LeopardMotion';
import {leopardPose} from '../animation/LeopardRig';
import {Leopard} from './Leopard';
import {LeopardFace} from './LeopardFace';

export const LeopardSheet: React.FC = () => {
  ensureFonts();
  const t = useTime() + 0.5;
  const cell = (i: number) => ({x: 270 + (i % 2) * 540, y: 330 + Math.floor(i / 2) * 330});
  const states = [
    ['IDLE', idle(t)],
    ['WALK', walk(t, 0.3)],
    ['STALK', stalk(t, 0.4)],
    ['RUN', run(t, 0.78)],
    ['JUMP', jump(t, 0.55)],
    ['REST', rest(t)],
    ['INTERACT', interact(t, 1)],
  ] as const;
  return (
    <AbsoluteFill style={{background: '#efe4cc'}}>
      <svg width={1080} height={1920}>
        {states.map(([name, st], i) => {
          const c = cell(i);
          return (
            <g key={name}>
              <Leopard uid={`s${i}`} p={leopardPose({x: c.x - 10, y: c.y, scale: 1.05, ...st})} />
              <text x={c.x} y={c.y + 40} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={28} fill="#3a2410">
                {name}
              </text>
            </g>
          );
        })}
        <Leopard uid="cl" p={leopardPose({x: 810, y: 1300, scale: 0.9, rot: -1.25, ...climb(t, 0.3)})} />
        <Leopard uid="cb" p={leopardPose({x: 200, y: 1600, scale: 0.55, cub: 1, ...walk(t, 0.6)})} />
        <Leopard uid="cb2" p={leopardPose({x: 420, y: 1600, scale: 0.5, cub: 1, facing: -1, ...jump(t, 0.5, 60)})} />
        <g transform="translate(790 1650) scale(0.9)">
          <LeopardFace t={t} blink={0} pupil={0.5} shine={0} look={{x: 0, y: 0}} ears={0} night={0} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
