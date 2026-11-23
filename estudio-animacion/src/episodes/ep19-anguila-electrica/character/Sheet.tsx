// Ficha de control de la anguila: nado lento, búsqueda con electrolocalización, ataque y presa.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {cam} from '../../../studio2';
import {bodyOnPath, makePath, smoothPts} from '../../ep18-mixino/motion/path';
import {FieldLines, PulseFronts} from '../effects/Electric';
import {RiverBack} from '../environment/River';
import {ElectricEel} from './ElectricEel';
import {Prey} from './Prey';
import {integrate, paramsAt, Track} from './states';

const PATH = makePath(smoothPts([{x: -900, y: -200}, {x: -400, y: -260}, {x: 100, y: -200}, {x: 600, y: -250}], 16));
const TRACK: Track = [[0, 'SLOW_SWIM']];

export const EelSheet: React.FC = () => {
  const t = useCurrentFrame() / 30 + 1;
  const p = paramsAt(TRACK, t);
  const g = integrate(TRACK, 0, t);
  const sp = bodyOnPath(PATH, PATH.total - 100 + g.dist * 0, 1100, 28, {amp: p.bodyAmp, waves: 1.2, phase: t * 4});
  const P2 = makePath(smoothPts([{x: -800, y: 500}, {x: -300, y: 460}, {x: 200, y: 520}], 16));
  const sp2 = bodyOnPath(P2, P2.total, 900, 24, {amp: 3, waves: 1, phase: t * 3});
  return (
    <AbsoluteFill style={{background: '#14302a'}}>
      <svg width={1080} height={1920}>
        <RiverBack cam={cam(0, 0, 1)} t={t}>
          <ElectricEel uid="a" spine={sp} look={{t, finPhase: g.finPhase, finAmp: p.finAmp, mouth: 0.2}} />
          <ElectricEel uid="b" spine={sp2} look={{t, finPhase: t * 12, height: 56, organs: 1, organPulse: (t % 2) / 2}} />
          <FieldLines spine={sp} k={0.8} t={t} target={{x: 600, y: 0}} pull={0.6} />
          <Prey uid="p" p={{x: 640, y: -40, t, s: 1.6, stun: 0.8}} />
          <PulseFronts spine={sp2} t={t} t0={0.5} dur={3} aim={{x: 500, y: 300}} />
        </RiverBack>
      </svg>
    </AbsoluteFill>
  );
};
