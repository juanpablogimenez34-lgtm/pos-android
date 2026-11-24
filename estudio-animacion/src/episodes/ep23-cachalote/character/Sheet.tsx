// Ficha del personaje: tres poses del cachalote (natación, mandíbula y corte anatómico, cola levantada).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {poseFrom} from '../components/common';
import {SpermWhale} from './SpermWhale';

export const WhaleSheet: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const swim = poseFrom([[0, 'SLOW_SWIM']], t + 1.2);
  const jaw = {...poseFrom([[0, 'SQUID_ENCOUNTER']], t + 2), jaw: 0.9, cut: 0};
  const lift = {...poseFrom([[0, 'TAIL_LIFT']], t), fv: 0.9};
  const calf = {...poseFrom([[0, 'SOCIAL_SWIMMING']], t + 0.5), calf: true};
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#1a4a6a,#06142a)'}}>
      <svg width={1080} height={1920}>
        <SpermWhale uid="a" pose={swim} x={1000} y={330} scale={0.58} />
        <SpermWhale uid="b" pose={jaw} x={1000} y={760} scale={0.58} />
        <SpermWhale uid="c" pose={{...swim, cut: 1, amp: 0.2}} x={1000} y={1140} scale={0.58} />
        <SpermWhale uid="d" pose={lift} x={300} y={1500} scale={0.4} angle={1.35} />
        <SpermWhale uid="e" pose={calf} x={950} y={1650} scale={0.25} />
      </svg>
    </AbsoluteFill>
  );
};
