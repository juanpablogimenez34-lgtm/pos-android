// Ficha de control del modelo del pez remo (anatomía, ondas de la aleta, perspectiva, vertical).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ensureFonts} from '../../../engine/fonts';
import {useTime} from '../../../engine/useTime';
import {Oarfish, oarPose} from './Oarfish';

export const OarfishSheet: React.FC = () => {
  ensureFonts();
  const t = useTime() + 0.3;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0b3458, #061427)'}}>
      <svg width={1080} height={1920}>
        <Oarfish uid="a" p={oarPose({x: 900, y: 260, scale: 0.42, t})} />
        <Oarfish uid="b" p={oarPose({x: 820, y: 640, scale: 1.25, t, length: 1900})} />
        <Oarfish uid="c" p={oarPose({x: 980, y: 1020, scale: 0.9, t, persp: 2.5, fade: 0.8, sCurve: 70})} />
        <Oarfish uid="d" p={oarPose({x: 540, y: 1300, scale: 0.35, t, angle: -Math.PI / 2 + 0.1, mouth: 1})} />
        <text x={40} y={120} fontFamily="Montserrat" fontWeight={800} fontSize={28} fill="#fff">cuerpo completo</text>
        <text x={40} y={520} fontFamily="Montserrat" fontWeight={800} fontSize={28} fill="#fff">cabeza, cresta, pélvicas</text>
        <text x={40} y={900} fontFamily="Montserrat" fontWeight={800} fontSize={28} fill="#fff">perspectiva + niebla</text>
        <text x={40} y={1320} fontFamily="Montserrat" fontWeight={800} fontSize={28} fill="#fff">vertical · boca</text>
      </svg>
    </AbsoluteFill>
  );
};
