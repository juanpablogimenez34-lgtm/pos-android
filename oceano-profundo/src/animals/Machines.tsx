// VEHÍCULO CIENTÍFICO (ROV) y SILUETA HUMANA de referencia (1,75 m).
//  · ROV: bastidor, flotación amarilla de espuma sintáctica, propulsores con hélices que giran, focos con conos de
//    luz volumétrica, cámara, brazo manipulador articulado (hombro–codo–pinza) y cable umbilical.
import React from 'react';
import {clamp, lerp} from '../utils/math';
import {f1, openSpline} from '../utils/spline';

type V = {x: number; y: number};

export const ROV: React.FC<{x: number; y: number; s?: number; t: number; dir?: 1 | -1; lights?: number; beamAng?: number; arm?: number; grab?: number; tether?: V; uid: string}> = ({x, y, s = 1, t, dir = 1, lights = 1, beamAng = 0.35, arm = 0, grab = 0, tether, uid}) => {
  const prop = (t * 40) % (Math.PI * 2);
  // brazo: hombro en el frente inferior
  const sh = {x: 120, y: 70};
  const a1 = lerp(1.2, 0.35, clamp(arm));
  const a2 = lerp(1.9, 0.5, clamp(arm));
  const el = {x: sh.x + Math.cos(a1) * 70, y: sh.y + Math.sin(a1) * 70};
  const wr = {x: el.x + Math.cos(a1 + a2 - 1.0) * 60, y: el.y + Math.sin(a1 + a2 - 1.0) * 60};
  const g = 0.5 - clamp(grab) * 0.4;
  return (
    <g>
      {tether && <path d={openSpline([{x: x - 60 * dir * s, y: y - 90 * s}, {x: (x + tether.x) / 2 + Math.sin(t * 0.4) * 40, y: (y + tether.y) / 2 + 80}, tether])} stroke="#e8c84a" strokeWidth={5} fill="none" opacity={0.8} />}
      {/* conos de luz */}
      {lights > 0.01 && (
        <g style={{mixBlendMode: 'screen'}} opacity={lights}>
          <defs>
            <linearGradient id={`beam${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff6dc" stopOpacity={0.55} />
              <stop offset="1" stopColor="#fff6dc" stopOpacity={0} />
            </linearGradient>
            <filter id={`beamB${uid}`}><feGaussianBlur stdDeviation={10} /></filter>
          </defs>
          {[-1, 1].map((k) => {
            const ox = x + 150 * dir * s;
            const oy = y + (k < 0 ? -40 : 30) * s;
            const ang = (dir > 0 ? 0 : Math.PI) + beamAng * dir + k * 0.12 * dir;
            const L = 1400 * s;
            const sp = 0.22;
            return (
              <path key={k} filter={`url(#beamB${uid})`} transform={`rotate(${f1((ang * 180) / Math.PI)} ${f1(ox)} ${f1(oy)})`} d={`M${f1(ox)},${f1(oy - 10 * s)} L${f1(ox + L)},${f1(oy - L * sp)} L${f1(ox + L)},${f1(oy + L * sp)} L${f1(ox)},${f1(oy + 10 * s)}Z`} fill={`url(#beam${uid})`} />
            );
          })}
        </g>
      )}
      <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s * dir)} ${f1(s)})`}>
        {/* bastidor */}
        <rect x={-150} y={-20} width={290} height={110} rx={8} fill="#2a2e34" stroke="#0e1014" strokeWidth={3} />
        {[-110, -40, 30, 100].map((xx) => <rect key={xx} x={xx} y={-16} width={8} height={102} fill="#4a5058" />)}
        <rect x={-140} y={40} width={270} height={8} fill="#5a6068" />
        {/* flotación */}
        <path d="M-160,-24 L150,-24 Q170,-24 172,-48 L172,-90 Q160,-110 120,-110 L-150,-110 Q-170,-104 -168,-80 L-166,-40Z" fill="#f0c020" stroke="#8a6a08" strokeWidth={3} />
        <path d="M-150,-96 L150,-96" stroke="#ffe680" strokeWidth={5} opacity={0.6} />
        <text x={-20} y={-58} fontSize={26} fontWeight={800} fill="#3a2a08" textAnchor="middle" fontFamily="Montserrat">ROV</text>
        {/* propulsores */}
        {[[-150, 10], [-150, 70], [70, -110]].map(([px, py], i) => (
          <g key={i} transform={`translate(${px} ${py})`}>
            <rect x={-26} y={-16} width={36} height={32} rx={6} fill="#1a1c20" stroke="#4a4e54" strokeWidth={2} />
            <ellipse cx={-28} cy={0} rx={4} ry={14 * Math.abs(Math.cos(prop + i))} fill="#8a9098" />
          </g>
        ))}
        {/* cámara y focos */}
        <rect x={128} y={-6} width={36} height={30} rx={6} fill="#14161a" stroke="#6a7078" strokeWidth={2} />
        <circle cx={160} cy={9} r={10} fill="#2a4a7a" stroke="#9ac8ff" strokeWidth={2} />
        {[-40, 30].map((yy) => <circle key={yy} cx={150} cy={yy} r={9} fill={lights > 0.01 ? '#fffbe8' : '#5a5e64'} stroke="#c8c8c0" strokeWidth={2} />)}
        {/* brazo manipulador */}
        <path d={`M${sh.x},${sh.y} L${f1(el.x)},${f1(el.y)} L${f1(wr.x)},${f1(wr.y)}`} stroke="#b8bec6" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={sh.x} cy={sh.y} r={9} fill="#6a7078" />
        <circle cx={el.x} cy={el.y} r={7} fill="#6a7078" />
        {[-1, 1].map((k) => <path key={k} d={`M${f1(wr.x)},${f1(wr.y)} l${f1(Math.cos(k * g) * 22)},${f1(Math.sin(k * g) * 22 + 8)}`} stroke="#d8dee6" strokeWidth={5} strokeLinecap="round" />)}
      </g>
    </g>
  );
};

/** Silueta humana (buzo de referencia) de altura h (u del mundo). */
export const Human: React.FC<{x: number; y: number; h: number; t: number; color?: string; label?: string}> = ({x, y, h, t, color = '#cfe6f2', label}) => {
  const s = h / 175;
  const sw = Math.sin(t * 1.4) * 6;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s)})`} opacity={0.9}>
      <circle cx={0} cy={-162} r={12} fill={color} />
      <path d="M-14,-148 L14,-148 L16,-80 L8,-80 L6,-20 L-6,-20 L-8,-80 L-16,-80Z" fill={color} />
      <path d={`M-14,-144 L-30,${f1(-100 + sw)} M14,-144 L30,${f1(-100 - sw)}`} stroke={color} strokeWidth={8} strokeLinecap="round" />
      <path d={`M-4,-82 L${f1(-10 + sw * 0.5)},0 M4,-82 L${f1(10 - sw * 0.5)},0`} stroke={color} strokeWidth={10} strokeLinecap="round" />
      {label && <text x={0} y={22} textAnchor="middle" fontSize={20} fontWeight={800} fill={color} fontFamily="Montserrat">{label}</text>}
    </g>
  );
};
