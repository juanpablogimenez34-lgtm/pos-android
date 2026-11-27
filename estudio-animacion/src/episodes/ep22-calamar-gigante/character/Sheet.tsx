// Ficha de control del calamar gigante: reposo, abanico de amenaza y tentáculos extendidos.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {GiantSquid} from './GiantSquid';

export const SquidSheet: React.FC = () => {
  const t = useCurrentFrame() / 30 + 1;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0a2a4a, #02060e)'}}>
      <svg width={1080} height={1920}>
        <GiantSquid uid="a" x={700} y={300} scale={0.8} pose={{t, pulse: 0.3, spread: 0.15, wave: 0.6}} />
        <GiantSquid uid="b" x={700} y={900} scale={0.8} pose={{t, spread: 1, curl: 0.8, wave: 0.9, look: {x: 300, y: 0}, rim: 1}} />
        <GiantSquid uid="c" x={520} y={1500} scale={0.7} pose={{t, spread: 0.1, grip: 0, jet: 1, pulse: 0.8, tentacles: [{tip: {x: 700, y: -80}, ext: 1}, {tip: {x: 700, y: -40}, ext: 1}]}} />
      </svg>
    </AbsoluteFill>
  );
};
