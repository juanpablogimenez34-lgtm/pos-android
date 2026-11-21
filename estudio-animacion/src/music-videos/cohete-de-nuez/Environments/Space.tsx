// Universo infantil: cielo con nubes, espacio con estrellas que brillan al ritmo, nebulosas
// estilizadas, planetas, la Tierra, la Luna de queso, cometas, estrellas fugaces, partículas
// brillantes, satélite de juguete y la navecita de Zumi.
import React from 'react';
import {hash1, mixColor} from '../../../engine/math';
import {beatPulse} from '../MusicSync/songMap';
import {Cam, layerT} from '../Camera/cam2d';

const Star5: React.FC<{x: number; y: number; r: number; c: string; rot?: number}> = ({x, y, r, c, rot = 0}) => (
  <path transform={`translate(${x} ${y}) rotate(${rot}) scale(${r / 20})`} d="M0,-20 L6,-6 L21,-6 L9,3 L13,18 L0,9 L-13,18 L-9,3 L-21,-6 L-6,-6Z" fill={c} />
);

/** Fondo del espacio. `sky` 0 = espacio · 1 = cielo azul (transición del despegue y el regreso). */
export const SpaceBack: React.FC<{cam: Cam; t: number; sky: number; hue?: number}> = ({cam, t, sky, hue = 0}) => {
  const bp = beatPulse(t, 5);
  const top = mixColor(mixColor('#1a1050', '#3a1a6a', hue), '#5db8ff', sky);
  const bot = mixColor(mixColor('#2a2a8a', '#6a2a8a', hue), '#bfe6ff', sky);
  return (
    <g>
      <defs>
        <linearGradient id="sp-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bot} />
        </linearGradient>
        <radialGradient id="sp-neb1" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff7ab0" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ff7ab0" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="sp-neb2" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#7ff3ff" stopOpacity={0.45} />
          <stop offset="1" stopColor="#7ff3ff" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="sp-neb3" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#c38aff" stopOpacity={0.5} />
          <stop offset="1" stopColor="#c38aff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={1080} height={1920} fill="url(#sp-bg)" />
      <g opacity={1 - sky}>
        <g transform={layerT(cam, 0.08)}>
          <ellipse cx={-500} cy={-600} rx={900} ry={600} fill="url(#sp-neb1)" />
          <ellipse cx={700} cy={300} rx={1000} ry={700} fill="url(#sp-neb2)" />
          <ellipse cx={-200} cy={1100} rx={900} ry={600} fill="url(#sp-neb3)" />
        </g>
        <g transform={layerT(cam, 0.15)}>
          {Array.from({length: 220}, (_, i) => {
            const x = -4000 + hash1(i * 1.3) * 8000;
            const y = -4000 + hash1(i * 2.7) * 8000;
            const r = 1.5 + hash1(i * 5.1) * 3.5;
            const tw = 0.5 + 0.5 * Math.sin(t * (1 + hash1(i) * 2) + i);
            return <circle key={i} cx={x} cy={y} r={r * (1 + (i % 7 === 0 ? bp * 0.8 : 0))} fill="#ffffff" opacity={0.35 + 0.6 * tw} />;
          })}
          {Array.from({length: 26}, (_, i) => (
            <Star5 key={`s${i}`} x={-3500 + hash1(i * 9.1) * 7000} y={-3500 + hash1(i * 4.3) * 7000} r={8 + hash1(i) * 10 + bp * 4} c={['#ffd23f', '#ffffff', '#ff9ad5', '#7ff3ff'][i % 4]} rot={t * 20 + i * 30} />
          ))}
        </g>
      </g>
    </g>
  );
};

export const Planet: React.FC<{x: number; y: number; r: number; c1: string; c2: string; ring?: string; t: number; tilt?: number}> = ({x, y, r, c1, c2, ring, t, tilt = -0.25}) => {
  const id = `pl${Math.round(x)}${Math.round(y)}${Math.round(r)}`.replace(/-/g, 'm');
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={id} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor={mixColor(c1, '#ffffff', 0.35)} />
          <stop offset="0.6" stopColor={c1} />
          <stop offset="1" stopColor={mixColor(c1, '#1a1040', 0.45)} />
        </radialGradient>
        <clipPath id={`${id}c`}>
          <circle r={r} />
        </clipPath>
      </defs>
      {ring && <ellipse rx={r * 1.8} ry={r * 0.45} transform={`rotate(${(tilt * 180) / Math.PI})`} fill="none" stroke={ring} strokeWidth={r * 0.18} opacity={0.6} />}
      <circle r={r} fill={`url(#${id})`} />
      <g clipPath={`url(#${id}c)`}>
        {[-0.4, 0.05, 0.45].map((k, i) => (
          <ellipse key={i} cx={Math.sin(t * 0.2 + i) * r * 0.1} cy={k * r} rx={r * 1.1} ry={r * 0.12} fill={c2} opacity={0.45} />
        ))}
      </g>
      {ring && (
        <path d={`M${-r * 1.8},0 A${r * 1.8},${r * 0.45} 0 0 0 ${r * 1.8},0`} transform={`rotate(${(tilt * 180) / Math.PI})`} fill="none" stroke={ring} strokeWidth={r * 0.18} />
      )}
    </g>
  );
};

export const Earth: React.FC<{x: number; y: number; r: number; t: number}> = ({x, y, r, t}) => (
  <g transform={`translate(${x} ${y})`}>
    <defs>
      <radialGradient id="earth-g" cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#8fd8ff" />
        <stop offset="0.6" stopColor="#2f86e0" />
        <stop offset="1" stopColor="#123a7a" />
      </radialGradient>
      <clipPath id="earth-c">
        <circle r={r} />
      </clipPath>
      <radialGradient id="earth-at" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0.85" stopColor="#bfe6ff" stopOpacity={0} />
        <stop offset="0.95" stopColor="#bfe6ff" stopOpacity={0.5} />
        <stop offset="1" stopColor="#bfe6ff" stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle r={r * 1.12} fill="url(#earth-at)" />
    <circle r={r} fill="url(#earth-g)" />
    <g clipPath="url(#earth-c)">
      {[[-0.4, -0.2, 0.45, 0.3], [0.3, 0.25, 0.35, 0.4], [-0.1, 0.55, 0.3, 0.18], [0.45, -0.45, 0.25, 0.18]].map(([cx, cy, rx, ry], i) => (
        <ellipse key={i} cx={(cx + ((t * 0.02) % 1)) * r} cy={cy * r} rx={rx * r} ry={ry * r} fill="#5fbf5a" />
      ))}
      {[-0.55, 0.1, 0.6].map((k, i) => (
        <ellipse key={`c${i}`} cx={(Math.sin(t * 0.1 + i) * 0.3) * r} cy={k * r} rx={r * 0.7} ry={r * 0.08} fill="#ffffff" opacity={0.7} />
      ))}
    </g>
  </g>
);

/** Luna de queso: amarillo crema, cráteres redondeados y textura suave (claramente fantástica). */
export const CheeseMoon: React.FC<{x: number; y: number; r: number; t: number}> = ({x, y, r, t}) => (
  <g transform={`translate(${x} ${y})`}>
    <defs>
      <radialGradient id="moon-g" cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#fff7c8" />
        <stop offset="0.6" stopColor="#ffe07a" />
        <stop offset="1" stopColor="#e0a83a" />
      </radialGradient>
    </defs>
    <circle r={r * 1.2} fill="#fff2a0" opacity={0.15} />
    <circle r={r} fill="url(#moon-g)" stroke="#d09a32" strokeWidth={6} />
    {[[-0.35, -0.3, 0.2], [0.3, -0.1, 0.14], [-0.05, 0.35, 0.24], [0.42, 0.42, 0.1], [-0.55, 0.25, 0.1], [0.1, -0.55, 0.09]].map(([cx, cy, rr], i) => (
      <g key={i}>
        <circle cx={cx * r} cy={cy * r} r={rr * r} fill="#f0c45a" />
        <circle cx={cx * r + rr * r * 0.15} cy={cy * r + rr * r * 0.15} r={rr * r * 0.8} fill="#e8b448" />
      </g>
    ))}
    {Array.from({length: 8}, (_, i) => (
      <Star5 key={i} x={Math.cos(i * 0.8 + t * 0.2) * r * 1.45} y={Math.sin(i * 0.8 + t * 0.2) * r * 1.3} r={10 + (i % 3) * 4} c="#fff6c8" rot={t * 30 + i * 40} />
    ))}
  </g>
);

export const Clouds: React.FC<{cam: Cam; t: number; scroll: number; op: number}> = ({cam, t, scroll, op}) => (
  <g opacity={op}>
    {[0.3, 0.6, 1.2].map((d, li) => (
      <g key={li} transform={layerT(cam, d)}>
        {Array.from({length: 9}, (_, i) => {
          const x = -1400 + hash1(i * 3 + li) * 2800;
          const y = ((hash1(i * 7 + li) * 4000 + scroll * (0.6 + li * 0.5)) % 4000) - 2000;
          const s = 1 + hash1(i + li) * 1.4 + li * 0.4;
          return (
            <g key={i} transform={`translate(${x + Math.sin(t * 0.3 + i) * 20} ${y}) scale(${s})`} opacity={0.75 + 0.25 * (li / 2)}>
              <ellipse cx={0} cy={0} rx={160} ry={60} fill="#ffffff" />
              <ellipse cx={-60} cy={-30} rx={90} ry={62} fill="#ffffff" />
              <ellipse cx={60} cy={-24} rx={80} ry={52} fill="#ffffff" />
              <ellipse cx={0} cy={20} rx={150} ry={30} fill="#e2f0ff" />
            </g>
          );
        })}
      </g>
    ))}
  </g>
);

/** Cometas y estrellas fugaces (trayectorias deterministas). */
export const Comets: React.FC<{t: number; n: number}> = ({t, n}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const per = 3 + hash1(i * 4) * 3;
      const ph = ((t + hash1(i) * per) % per) / per;
      const x0 = hash1(i * 7) * 1300 - 100;
      const y0 = hash1(i * 9) * 900;
      const x = x0 - ph * 900;
      const y = y0 + ph * 600;
      return (
        <g key={i} opacity={Math.sin(Math.PI * ph)}>
          <path d={`M${x},${y} L${x + 220},${y - 146}`} stroke="url(#cometTail)" strokeWidth={7} strokeLinecap="round" />
          <circle cx={x} cy={y} r={9} fill="#ffffff" />
          <circle cx={x} cy={y} r={20} fill="#fff6c8" opacity={0.4} />
        </g>
      );
    })}
    <defs>
      <linearGradient id="cometTail" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#ffffff" stopOpacity={0.9} />
        <stop offset="1" stopColor="#7ff3ff" stopOpacity={0} />
      </linearGradient>
    </defs>
  </g>
);

/** Partículas luminosas (nube brillante que atraviesa la nave). */
export const Sparkles: React.FC<{t: number; n: number; k: number; speed?: number}> = ({t, n, k, speed = 1}) =>
  k > 0.01 ? (
    <g opacity={k}>
      {Array.from({length: n}, (_, i) => {
        const x = ((hash1(i) * 1300 - t * 120 * speed * (0.5 + hash1(i * 3))) % 1300 + 1300) % 1300 - 110;
        const y = hash1(i * 5) * 1920 + Math.sin(t * 2 + i) * 20;
        const r = 3 + hash1(i * 7) * 7;
        const c = ['#ffd23f', '#ff9ad5', '#7ff3ff', '#ffffff', '#c38aff'][i % 5];
        return i % 4 === 0 ? <Star5 key={i} x={x} y={y} r={r * 1.6} c={c} rot={t * 90 + i} /> : <circle key={i} cx={x} cy={y} r={r} fill={c} opacity={0.8} />;
      })}
    </g>
  ) : null;

/** Satélite de juguete (imaginario). */
export const ToySatellite: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => (
  <g transform={`translate(${x} ${y}) rotate(${(t * 20).toFixed(1)})`}>
    <rect x={-90} y={-22} width={60} height={44} fill="#5db8ff" stroke="#1d3a6a" strokeWidth={4} />
    <rect x={30} y={-22} width={60} height={44} fill="#5db8ff" stroke="#1d3a6a" strokeWidth={4} />
    <circle r={28} fill="#ffd23f" stroke="#8a6a1a" strokeWidth={4} />
    <path d="M0,-28 L0,-56" stroke="#8a6a1a" strokeWidth={4} />
    <circle cx={0} cy={-60} r={7} fill="#ff5d73" />
  </g>
);

/** Navecita de Zumi (platillo redondo con cúpula y luces). `inside` = Zumi dentro de la cúpula. */
export const ZumiShip: React.FC<{x: number; y: number; s: number; rot: number; t: number; inside?: React.ReactNode}> = ({x, y, s, rot, t, inside}) => (
  <g transform={`translate(${x} ${y}) rotate(${((rot * 180) / Math.PI).toFixed(2)}) scale(${s})`}>
    <defs>
      <clipPath id="zs-dome">
        <path d="M-90,-10 A90,95 0 0 1 90,-10Z" />
      </clipPath>
    </defs>
    <ellipse cx={0} cy={40} rx={120} ry={40} fill="#7ff3ff" opacity={0.18 + 0.1 * Math.sin(t * 5)} />
    <path d="M-90,-10 A90,95 0 0 1 90,-10Z" fill="#bff6ff" opacity={0.35} />
    <g clipPath="url(#zs-dome)">{inside}</g>
    <path d="M-90,-10 A90,95 0 0 1 90,-10Z" fill="none" stroke="#e6fbff" strokeWidth={6} />
    <path d="M-62,-62 A70,70 0 0 1 -10,-88" stroke="#ffffff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.7} />
    <ellipse cx={0} cy={0} rx={170} ry={46} fill="#c38aff" stroke="#4a2a7a" strokeWidth={6} />
    <ellipse cx={0} cy={-8} rx={150} ry={22} fill="#e0c6ff" />
    {Array.from({length: 7}, (_, i) => {
      const a = -1.2 + i * 0.4;
      const on = 0.5 + 0.5 * Math.sin(t * 6 + i);
      return <circle key={i} cx={Math.sin(a) * 140} cy={14 + Math.cos(a) * 8} r={9} fill={['#ffd23f', '#7ff3ff', '#ff9ad5'][i % 3]} opacity={0.5 + 0.5 * on} />;
    })}
  </g>
);
