// Ficha de control del modelo (anatomía, natación, protrusión mandibular, giro 2.5D, penumbra).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ensureFonts} from '../../../engine/fonts';
import {useTime} from '../../../engine/useTime';
import {GoblinShark, sharkPose} from './GoblinShark';

export const SharkSheet: React.FC = () => {
  ensureFonts();
  const t = useTime() + 0.2;
  const rows: [string, Parameters<typeof sharkPose>[0]][] = [
    ['natación', {}],
    ['anticipación', {open: 0.3, jaw: 0.05}],
    ['mandíbulas proyectadas', {jaw: 1, open: 1}],
    ['captura', {jaw: 1, open: 0.12}],
    ['giro 2.5D · penumbra', {yaw: 0.8, exposure: 0.4}],
  ];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0a2a44, #04101e)'}}>
      <svg width={1080} height={1920}>
        {rows.map(([name, o], i) => (
          <g key={name}>
            <GoblinShark uid={`s${i}`} p={sharkPose({x: 560, y: 250 + i * 360, scale: 1.45, t, beat: t * 2.1, ...o})} />
            <text x={40} y={130 + i * 360} fontFamily="Montserrat" fontWeight={800} fontSize={30} fill="#ffffff">{name}</text>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
