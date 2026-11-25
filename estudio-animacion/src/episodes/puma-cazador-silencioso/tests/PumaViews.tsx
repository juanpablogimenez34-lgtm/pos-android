// FICHA DE VISTAS: el MISMO puma (esqueleto y volúmenes) desde perfil, 3/4, frente, espalda y 3/4 posterior.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Puma} from '../character/Puma';
import {ADULT, CUB, grow, solve, standPose} from '../character/rig';

const VIEWS: {yaw: number; label: string}[] = [
  {yaw: 0, label: 'Perfil derecho'},
  {yaw: Math.PI, label: 'Perfil izquierdo'},
  {yaw: 0.65, label: 'Tres cuartos frontal'},
  {yaw: -0.75, label: 'Tres cuartos posterior'},
  {yaw: Math.PI / 2, label: 'Frente'},
  {yaw: -Math.PI / 2, label: 'Espalda'},
];
export const PumaViews: React.FC = () => {
  const pose = standPose(ADULT);
  pose.tailBase = -1.15;
  pose.tailCurl = 1.4;
  const sk = solve(ADULT, pose);
  const cub = solve(CUB, Object.assign(standPose(CUB), {tailBase: -0.6, tailCurl: 1.0}));
  const nb = grow(0);
  const nbs = solve(nb, standPose(nb));
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#cdbf9e, #8a7a5c)'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {VIEWS.map((v, i) => {
          const cx = 270 + (i % 2) * 540;
          const cy = 470 + Math.floor(i / 2) * 520;
          return (
            <g key={i}>
              <ellipse cx={cx} cy={cy + 6} rx={200} ry={22} fill="#3a2e1c" opacity={0.25} />
              <Puma sk={sk} uid={`v${i}`} view={{yaw: v.yaw, elev: 0.16, S: 250, ox: cx - Math.cos(v.yaw) * 70, oy: cy}} />
              <text x={cx} y={cy + 60} textAnchor="middle" fontFamily="sans-serif" fontSize={26} fill="#2a2014">{v.label}</text>
            </g>
          );
        })}
        <g>
          <Puma sk={cub} uid="cub" view={{yaw: 0.45, elev: 0.16, S: 520, ox: 300, oy: 1840}} />
          <Puma sk={nbs} uid="nb" view={{yaw: 0.3, elev: 0.2, S: 900, ox: 760, oy: 1840}} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
