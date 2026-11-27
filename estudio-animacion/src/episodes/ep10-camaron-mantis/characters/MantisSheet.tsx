// Ficha de control del modelo (verificación interna de anatomía y estados).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ensureFonts} from '../../../engine/fonts';
import {useTime} from '../../../engine/useTime';
import {mantisPose, MantisShrimp} from './MantisShrimp';
import {Snail} from './Snail';

export const MantisSheet: React.FC = () => {
  ensureFonts();
  const t = useTime() + 0.4;
  const rows = [
    ['reposo', {}],
    ['caminando', {walk: t * 1.2, walking: 1}],
    ['cargando el golpe', {raptor: {cock: 1, strike: 0, hold: 0}, pitch: 0.06, eyeN: {pitch: 0.3, yaw: 0.4}, eyeF: {pitch: 0.3, yaw: 0.3}}],
    ['golpe', {raptor: {cock: 1, strike: 1, hold: 0}}],
    ['sujetando', {raptor: {cock: 0, strike: 0, hold: 1}, curl: 0.2}],
  ] as const;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0e3a5a, #1a6a7a)'}}>
      <svg width={1080} height={1920}>
        {rows.map(([name, o], i) => (
          <g key={name}>
            <MantisShrimp uid={`m${i}`} p={mantisPose({x: 560, y: 300 + i * 340, scale: 1.7, t, eyeN: {pitch: 0.2 * Math.sin(t), yaw: Math.sin(t * 0.7)}, eyeF: {pitch: -0.2 * Math.sin(t * 1.3), yaw: -Math.sin(t * 0.9)}, ...o})} />
            <text x={80} y={300 + i * 340 + 50} fontFamily="Montserrat" fontWeight={800} fontSize={30} fill="#ffffff">
              {name}
            </text>
          </g>
        ))}
        <Snail x={940} y={1660} s={1.2} t={t} crack={0.6} />
      </svg>
    </AbsoluteFill>
  );
};
