// Ficha interna: tiburón nadando, boca abierta con protrusión, sentidos, calor, y lobo marino.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FurSeal, WhiteShark, SharkPose} from '../character/WhiteShark';

const base = (o: Partial<SharkPose>): SharkPose => ({x: 0, y: 0, angle: 0, scale: 0.85, facing: 1, t: 0, phase: 0, amp: 1, ...o});
export const TiburonFicha: React.FC = () => {
  const t = useCurrentFrame() / 30;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#2a8fc0,#062a4a)'}}>
      <svg width={1080} height={1920}>
        <WhiteShark uid="a" p={base({x: 960, y: 300, t, phase: t * 3})} />
        <WhiteShark uid="b" p={base({x: 960, y: 720, t, phase: t * 3, jaw: 1, protrude: 1})} />
        <WhiteShark uid="c" p={base({x: 960, y: 1140, t, phase: t * 3, sense: 1})} />
        <WhiteShark uid="d" p={base({x: 960, y: 1560, t, phase: t * 3, heat: 1})} />
        <FurSeal x={200} y={1820} s={0.9} t={t} />
      </svg>
    </AbsoluteFill>
  );
};
