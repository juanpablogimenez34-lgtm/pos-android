// Ficha del personaje: vistas (lateral caminando y nadando, superior, frontal), etapas (huevo, recién nacido,
// juvenil, adulto) y macho con espolón.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Egg, Platypus} from './Platypus';

export const PlatypusSheet: React.FC = () => {
  const t = useCurrentFrame() / 30 + 0.3;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#3a5a4a,#14261e)'}}>
      <svg width={1080} height={1920}>
        <Platypus uid="a" pose={{t, mode: 'walk', walkDist: t * 120, male: true, spurHi: 1}} x={600} y={260} scale={1.1} />
        <Platypus uid="b" pose={{t, mode: 'swim', swimPhase: t * 1.2, eyes: 0, wet: 1}} x={640} y={620} scale={1.1} />
        <Platypus uid="c" pose={{t, mode: 'rest', curl: 0.6}} x={360} y={930} scale={0.8} />
        <Platypus uid="d" pose={{t, mode: 'swim', swimPhase: t * 1.2}} x={900} y={980} scale={0.75} view="top" angle={-Math.PI / 2} />
        <Platypus uid="e" pose={{t, mode: 'rest', wet: 1}} x={260} y={1260} scale={0.9} view="front" />
        <Platypus uid="f" pose={{t, mode: 'rest', baby: 1}} x={700} y={1250} scale={0.35} />
        <Platypus uid="g" pose={{t, mode: 'walk', walkDist: t * 80, baby: 0.45}} x={1000} y={1260} scale={0.55} />
        <Egg x={200} y={1650} t={t} hatch={0} />
        <Egg x={420} y={1650} t={t} hatch={0.7} wobble={1} />
        <Platypus uid="h" pose={{t, mode: 'rest', baby: 1, curl: 0.5}} x={800} y={1640} scale={0.3} />
      </svg>
    </AbsoluteFill>
  );
};
