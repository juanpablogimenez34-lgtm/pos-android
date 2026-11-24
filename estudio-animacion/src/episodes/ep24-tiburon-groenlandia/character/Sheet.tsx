// Ficha del personaje: crecimiento (recién nacido, juvenil, adulto, muy longevo), boca abierta y vista superior.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {poseFrom} from '../components/common';
import {GreenlandShark} from './GreenlandShark';

export const SharkSheet: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const P = (st: Parameters<typeof poseFrom>[0], ex = {}) => poseFrom(st, t + 1, ex);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#1a4a5a,#061a24)'}}>
      <svg width={1080} height={1920}>
        <GreenlandShark uid="n" pose={P([[0, 'NEWBORN_SWIM']], {age: 0})} x={700} y={200} scale={0.12} />
        <GreenlandShark uid="j" pose={P([[0, 'JUVENILE_EXPLORATION']], {age: 0.3})} x={850} y={400} scale={0.35} />
        <GreenlandShark uid="a" pose={P([[0, 'SLOW_SWIM']], {age: 0.75})} x={1000} y={700} scale={0.85} />
        <GreenlandShark uid="o" pose={P([[0, 'FEEDING']], {age: 1, parasite: true})} x={1000} y={1080} scale={0.9} />
        <GreenlandShark uid="t" pose={P([[0, 'SLOW_SWIM']], {age: 0.9, view: 'top'})} x={950} y={1550} scale={0.8} />
      </svg>
    </AbsoluteFill>
  );
};
