// Ficha interna: hormiga negra y roja caminando (trípode), mandíbulas abiertas, gáster flexionado, aguijón y spray.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {AntSide, AntPose} from '../ant/AntSide';
import {BLACK, RED, scaleFor} from '../ant/species';

export const HormigasFicha: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const g1 = 620;
  const g2 = 1250;
  const g3 = 1800;
  const ground1 = (x: number) => g1 + Math.sin(x * 0.01) * 12;
  const b = (o: Partial<AntPose>): AntPose => ({x: 0, y: 0, angle: 0, facing: 1, scale: scaleFor(BLACK), t, dist: t * 900, speed: 1, ...o});
  const sb = scaleFor(BLACK) * 1.4;
  const sr = scaleFor(RED) * 1.4;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#d8c890,#6a5030)'}}>
      <svg width={1080} height={1920}>
        <rect y={g1} width={1080} height={20} fill="#5a3a20" />
        <AntSide spec={BLACK} uid="b1" ground={ground1} p={b({x: 420 + ((t * 900 * sb) % 300), y: g1 - BLACK.ground * sb, scale: sb})} />
        <rect y={g2} width={1080} height={20} fill="#5a3a20" />
        <AntSide spec={BLACK} uid="b2" ground={() => g2} p={b({x: 300, y: g2 - BLACK.ground * sb, scale: sb, dist: 0, mand: 1, gaster: 1.9, spray: 1, stance: 1})} />
        <AntSide spec={RED} uid="r1" ground={() => g2} p={b({x: 900, y: g2 - RED.ground * sr, scale: sr, facing: -1, dist: t * 900, mand: 0.8})} />
        <rect y={g3} width={1080} height={20} fill="#5a3a20" />
        <AntSide spec={RED} uid="r2" ground={() => g3} p={b({x: 640, y: g3 - RED.ground * sr * 2, scale: sr * 2, dist: 0, gaster: 0.9, sting: 1, mand: 1})} />
      </svg>
    </AbsoluteFill>
  );
};
