// ESTUDIO 2.0 · ESCENARIO POR PROFUNDIDAD. Cada capa declara su profundidad (fondo < 1 < primer
// plano) y recibe automáticamente: parallax, bruma atmosférica según la distancia al plano de
// enfoque y atenuación de contraste (profundidad de campo simulada sin filtros de desenfoque).
import React from 'react';
import {Cam, layerT} from './camera';

export type Layer = {depth: number; node: React.ReactNode; fog?: number; key?: string};

export const DepthStage: React.FC<{cam: Cam; layers: Layer[]; fogColor: string; focus?: number; children?: React.ReactNode}> = ({cam, layers, fogColor, focus = 1, children}) => (
  <g>
    {[...layers]
      .sort((a, b) => a.depth - b.depth)
      .map((l, i) => {
        const away = Math.abs(l.depth - focus);
        const fog = l.fog ?? Math.min(0.75, away * 0.9);
        return (
          <g key={l.key ?? i}>
            <g transform={layerT(cam, l.depth)}>{l.node}</g>
            {fog > 0.01 && l.depth < focus && <rect width={1080} height={1920} fill={fogColor} opacity={fog * 0.5} />}
          </g>
        );
      })}
    {children}
  </g>
);
