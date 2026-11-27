// Ficha interna: macho adulto con colmillo, hembra sin colmillo, cría, juvenil, giro de cabeza y vista aérea.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {cam} from '../../../studio2';
import {Narwhal, NarwhalPose} from '../character/Narwhal';
import {AerialSea, CodTop, NarwhalTop} from '../environment/Aerial';

const base = (o: Partial<NarwhalPose>): NarwhalPose => ({x: 0, y: 0, angle: 0, scale: 0.6, facing: 1, kind: 'male', t: 0, phase: 0, amp: 0.8, under: 0, age: 1, ...o});
export const NarvalFicha: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const ph = t * 4;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#d8ecf4,#7aaac4)'}}>
      <svg width={1080} height={1920}>
        <Narwhal uid="m" pose={base({x: 900, y: 230, t, phase: ph, tusk: 0.55})} />
        <Narwhal uid="f" pose={base({x: 760, y: 470, kind: 'female', scale: 0.55, t, phase: ph + 1, jaw: 0.7})} />
        <Narwhal uid="c" pose={base({x: 430, y: 660, kind: 'calf', scale: 0.32, t, phase: ph + 2, age: 0})} />
        <Narwhal uid="j" pose={base({x: 1000, y: 660, kind: 'male', scale: 0.45, t, phase: ph + 2.5, age: 0.5, tusk: 0.18})} />
        <Narwhal uid="y" pose={base({x: 900, y: 900, t, phase: ph, tusk: 0.55, headYaw: 0.9})} />
        <clipPath id="fic"><rect y={1000} width={1080} height={920} /></clipPath>
        <g clipPath="url(#fic)"><g transform="translate(0 600)">
          <AerialSea cam={cam(540, 860, 1)} t={t} floes={[{x: 200, y: 900, r: 120, seed: 3}, {x: 900, y: 1150, r: 90, seed: 5}]}>
            <NarwhalTop uid="top" p={{x: 640, y: 780, heading: -0.3, scale: 0.42, phase: ph, amp: 0.9, headYaw: Math.sin(t * 2) * 0.4, tusk: 0.55, depth: 0.2}} />
            <CodTop x={820} y={680} a={0} t={t} s={1.6} />
          </AerialSea>
        </g></g>
      </svg>
    </AbsoluteFill>
  );
};
