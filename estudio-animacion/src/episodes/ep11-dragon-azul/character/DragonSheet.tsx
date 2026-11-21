// Ficha de control del modelo (anatomía, giro 3D simulado, escorzo, alimentación).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ensureFonts} from '../../../engine/fonts';
import {useTime} from '../../../engine/useTime';
import {BlueDragon, dragonPose} from './BlueDragon';

export const DragonSheet: React.FC = () => {
  ensureFonts();
  const t = useTime() + 0.3;
  const rows: [string, Parameters<typeof dragonPose>[0]][] = [
    ['cara azul (vista desde arriba)', {}],
    ['giro 3D (roll 1,1)', {roll: 1.1}],
    ['cara plateada (desde abajo)', {roll: Math.PI}],
    ['escorzo · tilt 0,4', {tilt: 0.4, roll: 0.3, heading: -0.2}],
    ['alimentación', {feed: 1, bite: t * 1.5, spread: 0.6}],
  ];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0a3a6a, #1a7aa8)'}}>
      <svg width={1080} height={1920}>
        {rows.map(([name, o], i) => (
          <g key={name}>
            <BlueDragon uid={`s${i}`} p={dragonPose({x: 560, y: 220 + i * 370, scale: 1.25, t: t + i, ...o})} />
            <text x={40} y={110 + i * 370} fontFamily="Montserrat" fontWeight={800} fontSize={30} fill="#ffffff">{name}</text>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
