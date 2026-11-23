// Ficha de control del inflado: el mismo pez con inflation = 0; 0,25; 0,5; 0,75; 1 y el corte anatómico.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {cam} from '../../../studio2';
import {ReefBack} from '../environment/Reef';
import {PorcupineFish} from './PorcupineFish';

export const PufferSheet: React.FC = () => {
  const t = useCurrentFrame() / 30 + 1;
  const vals = [0, 0.25, 0.5, 0.75, 1];
  return (
    <AbsoluteFill style={{background: '#0a2a52'}}>
      <svg width={1080} height={1920}>
        <ReefBack cam={cam(0, 0, 1)} t={t}>
          {vals.map((v, i) => (
            <PorcupineFish key={i} uid={`f${i}`} x={i % 2 ? 260 : -230} y={-760 + i * 330} scale={1.15} look={{inflation: v, t, swim: 1 - v * 0.5, mouth: v > 0 && v < 1 ? 0.6 : 0.1}} />
          ))}
          <PorcupineFish uid="an" x={260} y={-760 + 5 * 330 - 330 * 4 + 0} scale={0.01} look={{inflation: 0, t}} />
        </ReefBack>
      </svg>
    </AbsoluteFill>
  );
};
