// Ficha del delfín rosado: lateral (nadando), tres cuartos, superior (giro de cuello), frontal, cría gris y boca abierta.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {PinkDolphin} from './PinkDolphin';

export const PinkDolphinSheet: React.FC = () => {
  const t = useCurrentFrame() / 30 + 0.3;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#4a5a2a,#1a2414)'}}>
      <svg width={1080} height={1920}>
        <PinkDolphin uid="a" pose={{t, phase: t * 4, amp: 0.8, pink: 1, rim: 0.6, caustics: 1}} x={1000} y={230} scale={0.9} />
        <PinkDolphin uid="b" pose={{t, phase: t * 4, amp: 0.6, pink: 1, headYaw: 0.6, flipper: 0.6}} x={1000} y={540} scale={0.85} yaw={0.45} />
        <PinkDolphin uid="c" pose={{t, phase: t * 4, amp: 0.6, pink: 0.9, headYaw: 0.75, bend: 0.4, flipper: 0.8}} x={360} y={980} scale={0.6} view="top" angle={-Math.PI / 2} />
        <PinkDolphin uid="d" pose={{t, phase: t * 4, pink: 1}} x={800} y={950} scale={1.2} view="front" />
        <PinkDolphin uid="e" pose={{t, phase: t * 5, amp: 0.8, pink: 0}} x={720} y={1350} scale={0.5} />
        <PinkDolphin uid="f" pose={{t, phase: t * 4, amp: 0.5, pink: 1, jaw: 1, headPitch: 0.15}} x={1050} y={1700} scale={1.0} />
      </svg>
    </AbsoluteFill>
  );
};
