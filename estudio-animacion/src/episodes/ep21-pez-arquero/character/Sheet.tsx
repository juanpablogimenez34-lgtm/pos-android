// Ficha de control: pez arquero apuntando, chorro en vuelo, hoja-posadero e insectos.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {cam} from '../../../studio2';
import {WaterJet} from '../effects/WaterJet';
import {MangroveBack} from '../environment/Mangrove';
import {ArcherFish, archerMouth} from './ArcherFish';
import {Insect, PerchLeaf, perchPoint} from './Insects';

export const ArcherSheet: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const fx = -60;
  const fy = 150;
  const ang = -0.75;
  const m = archerMouth(fx, fy, ang);
  const perch = {pivot: {x: 120, y: -640}, len: 150, base: 0.35, seed: 2};
  const pp = perchPoint(perch, t);
  return (
    <AbsoluteFill style={{background: '#0e3a3a'}}>
      <svg width={1080} height={1920}>
        <MangroveBack cam={cam(0, -150, 1)} t={t} above={<PerchLeaf p={perch} t={t} />} free={<>
          <Insect x={pp.x} y={pp.y} ang={pp.ang} s={1.6} t={t} kind="fly" />
          <Insect x={-300} y={-500} s={1.6} t={t} kind="beetle" state="falling" />
          <Insect x={-300} y={-300} s={1.6} t={t} kind="cricket" state="flying" />
          <WaterJet t={t + 0.2} sh={{t0: 0, mouth: m, target: {x: pp.x, y: pp.y + 4}, tau: 0.34}} />
        </>}>
          <ArcherFish uid="a" x={fx} y={fy} angle={ang} scale={1.1} look={{t, mouth: 0.8, lookAt: {x: 300, y: -100}, squeeze: 0.6}} />
          <ArcherFish uid="b" x={150} y={500} scale={1} look={{t, swim: 1}} />
        </MangroveBack>
      </svg>
    </AbsoluteFill>
  );
};
