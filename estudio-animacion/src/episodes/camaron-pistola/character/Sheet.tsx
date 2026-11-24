// Ficha del camarón pistola: caminando, pinza armada (abierta), chasquido (cerrada con estela) y detalle de la
// pinza mayor; escala de los estados del abanico caudal y del abdomen.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Shrimp} from './Shrimp';

export const ShrimpSheet: React.FC = () => {
  const t = useCurrentFrame() / 30 + 0.3;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#1c5a6a,#0a2030)'}}>
      <svg width={1080} height={1920}>
        <Shrimp pose={{t, walkDist: t * 90, open: 0.1, alert: 0.2}} x={600} y={300} scale={1.25} />
        <Shrimp pose={{t, open: 1, aim: -0.15, alert: 0.9, antenna: -0.45, fan: 1}} x={560} y={760} scale={1.25} />
        <Shrimp pose={{t, open: 0, blur: 1, flex: 0.35, alert: 1}} x={560} y={1160} scale={1.25} />
        <Shrimp pose={{t, open: 0.7, flex: 0.9, fan: 0.2}} x={420} y={1600} scale={2.2} />
      </svg>
    </AbsoluteFill>
  );
};
