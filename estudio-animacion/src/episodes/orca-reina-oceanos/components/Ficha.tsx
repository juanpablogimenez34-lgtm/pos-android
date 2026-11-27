// Ficha interna de control: macho, hembra, cría (recién nacida y juvenil), boca abierta, caudal vista desde arriba.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Orca, OrcaPose} from '../character/Orca';

const base = (o: Partial<OrcaPose>): OrcaPose => ({x: 0, y: 0, angle: 0, scale: 0.8, facing: 1, kind: 'male', t: 0, phase: 0, amp: 0.8, under: 0, ...o});
export const OrcaFicha: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const ph = t * 4;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#cfe4ee,#7aa8c4)'}}>
      <svg width={1080} height={1920}>
        <Orca uid="m" pose={base({x: 940, y: 300, kind: 'male', t, phase: ph})} />
        <Orca uid="f" pose={base({x: 900, y: 640, kind: 'female', scale: 0.72, t, phase: ph + 1, jaw: 0.8})} />
        <Orca uid="c0" pose={base({x: 520, y: 940, kind: 'calf', scale: 0.4, t, phase: ph + 2, age: 0})} />
        <Orca uid="c1" pose={base({x: 1000, y: 940, kind: 'calf', scale: 0.48, t, phase: ph + 2.5, age: 1})} />
        <Orca uid="top" pose={base({x: 900, y: 1300, kind: 'female', scale: 0.7, t, phase: ph, fv: 1, amp: 1.2})} />
        <Orca uid="arch" pose={base({x: 860, y: 1700, kind: 'male', scale: 0.62, t, phase: ph, arch: 1, angle: -0.4, blow: 1})} />
      </svg>
    </AbsoluteFill>
  );
};
