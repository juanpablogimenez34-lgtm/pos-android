// Ficha interna de personajes (control de anatomía y movimiento).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Submersible} from '../characters/Submersible';
import {Fish} from '../characters/FishRig';
import {BARRELEYE, barreleyeDetail, DRAGON, dragonDetail, LANTERN, SHARK, sharkDetail, SMALLFISH, SNAILFISH, snailDetail, TUNA, tunaDetail} from '../characters/Fishes';

export const FosaFicha: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const ph = t * 6;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#1a6a9a,#06223f)'}}>
      <svg width={1920} height={1080}>
        <Submersible uid="s" p={{x: 420, y: 200, s: 0.55, t, lights: 1, thrustH: 0.5, arm: 0.6}} />
        <Fish spec={SHARK} uid="sh" pose={{x: 1300, y: 160, scale: 0.6, t, phase: ph * 0.5, jaw: 0.3}} detail={sharkDetail} />
        <Fish spec={TUNA} uid="tu" pose={{x: 1820, y: 330, scale: 0.6, t, phase: ph}} detail={tunaDetail} />
        <Fish spec={LANTERN} uid="la" pose={{x: 400, y: 520, scale: 1.4, t, phase: ph, glow: 1}} />
        <Fish spec={BARRELEYE} uid="ba" pose={{x: 900, y: 560, scale: 1.4, t, phase: ph * 0.4}} detail={barreleyeDetail(Math.sin(t) * 0.5 + 0.5, 1)} />
        <Fish spec={DRAGON} uid="dr" pose={{x: 1850, y: 600, scale: 0.85, t, phase: ph * 0.6, jaw: 0.6, glow: 1}} detail={dragonDetail(1, t)} />
        <Fish spec={SNAILFISH} uid="sn" pose={{x: 700, y: 900, scale: 1.4, t, phase: ph * 0.5}} detail={snailDetail(1)} />
        <Fish spec={SMALLFISH} uid="sm" pose={{x: 1500, y: 900, scale: 1.5, t, phase: ph}} />
      </svg>
    </AbsoluteFill>
  );
};
