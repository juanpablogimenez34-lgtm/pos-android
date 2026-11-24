// Ficha de personajes (revisión de anatomía y movimiento).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {anglerPose, Anglerfish, AnglerGlow} from '../animals/Anglerfish';
import {ColossalSquid} from '../animals/ColossalSquid';
import {Atolla, CombJelly, Hatchetfish, Jellyfish, RedShrimp, Siphonophore} from '../animals/Fauna';
import {GiantSquid} from '../animals/GiantSquid';
import {Human, ROV} from '../animals/Machines';
import {SpermWhale} from '../animals/SpermWhale';
import {Viperfish} from '../animals/Viperfish';
import {ensureFonts} from '../utils/fonts';

export const Sheet: React.FC = () => {
  ensureFonts();
  const t = useCurrentFrame() / 30 + 0.5;
  const ap = anglerPose({t, x: 260, y: 230, scale: 1.1, facing: 1, pitch: 0, yaw: 0, jaw: 0.5, lureSway: 1, lureJig: 0.3, glow: 1, finRate: 1.5, gulp: 0});
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0e3a5a,#041222)'}}>
      <svg width={1920} height={1080}>
        <Anglerfish id="a" pose={ap} />
        <AnglerGlow id="a" pose={ap} zoom={1} />
        <Viperfish uid="v" pose={{t, phase: t * 4, amp: 0.9, jaw: 0.0, glow: 1}} x={1000} y={160} scale={0.9} />
        <Viperfish uid="v2" pose={{t, phase: t * 4, amp: 0.6, jaw: 1, glow: 1}} x={1820} y={200} scale={1.0} />
        <GiantSquid uid="g" pose={{t, pulse: 0.3, spread: 0.3, wave: 0.6, tentacles: [{tip: {x: 500, y: 40}, ext: 0.3}, {tip: {x: 500, y: -40}, ext: 0.2}]}} x={720} y={520} scale={0.55} />
        <ColossalSquid uid="c" pose={{t, spread: 0.4, hooks: 0.8}} x={1500} y={540} scale={0.62} />
        <SpermWhale uid="w" pose={{t, phase: t * 1.5, amp: 0.8, flip: 0.5, jaw: 0.2, fv: 0.2}} x={760} y={860} scale={0.42} />
        <Jellyfish x={1080} y={800} s={0.8} t={t} />
        <Atolla x={1240} y={820} s={0.8} t={t} alarm={1} />
        <CombJelly x={1380} y={830} s={1} t={t} />
        <Siphonophore x={1900} y={1010} s={0.8} t={t} len={600} />
        <Hatchetfish x={1480} y={760} s={1.4} t={t} />
        <RedShrimp x={1600} y={800} s={1.4} t={t} />
        <ROV uid="r" x={1700} y={880} s={0.6} t={t} lights={1} arm={0.6} />
        <Human x={960} y={1060} h={175 * 0.42} t={t} />
      </svg>
    </AbsoluteFill>
  );
};
