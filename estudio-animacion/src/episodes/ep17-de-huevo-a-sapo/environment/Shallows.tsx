// AMBIENTE DE TRANSICIÓN — LA ORILLA EN TOMA PARTIDA (medio bajo el agua, medio en el aire).
// Superficie del agua en y = 0. El fondo sube en pendiente hasta la orilla (x ≈ 550 cruza la
// superficie). Bajo el agua: verde esmeralda, cáusticas y juncos; sobre el agua: bosque húmedo en
// ámbar. El personaje que queda por debajo de la superficie recibe el tinte del agua; al cruzarla
// aparecen ondas concéntricas.
import React from 'react';
import {clamp, hash1, lerp} from '../../../engine/math';
import {Cam, layerT, toScreen} from '../../../studio2';
import {SoftFilter} from '../../oarfish-cinematic-v2/character/filters';
import {Fern, Leaf, Moss} from './Forest';
import {Elodea, Stone} from './Pond';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

/** Perfil del fondo/orilla (y del suelo en función de x). */
export const edgeGround = (x: number) => {
  if (x < -200) return 520;
  if (x < 700) {
    const u = (x + 200) / 900;
    return lerp(520, -30, u * u * (3 - 2 * u));
  }
  return -30 - (x - 700) * 0.05;
};
export const edgeSlope = (x: number) => Math.atan2(edgeGround(x + 4) - edgeGround(x - 4), 8);

const groundPath = () => {
  const pts: string[] = [];
  for (let x = -2600; x <= 2600; x += 40) pts.push(`${x},${f1(edgeGround(x))}`);
  return `M${pts.join(' L')} L2600,1600 L-2600,1600Z`;
};
const GROUND = groundPath();

export const ShallowsBack: React.FC<{cam: Cam; t: number; children?: React.ReactNode; ripple?: {x: number; t0: number}}> = ({cam, t, children, ripple}) => {
  const sy = clamp(toScreen(cam, 0, 0).y, -10, 1930); // superficie en pantalla
  return (
    <g>
      <defs>
        <linearGradient id="shAir" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a6a32" />
          <stop offset="1" stopColor="#24361c" />
        </linearGradient>
        <radialGradient id="shSun" cx="0.85" cy="0" r="0.8">
          <stop offset="0" stopColor="#ffd890" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ffd890" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="shWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5ab8a0" />
          <stop offset="0.4" stopColor="#1f7a6e" />
          <stop offset="1" stopColor="#0a3a3e" />
        </linearGradient>
        <linearGradient id="shSoil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a4a2e" />
          <stop offset="1" stopColor="#1e160c" />
        </linearGradient>
        <linearGradient id="pondStoneShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8f0c0" stopOpacity={0.18} />
          <stop offset="1" stopColor="#000" stopOpacity={0.45} />
        </linearGradient>
        <clipPath id="shAbove">
          <rect x={0} y={0} width={1080} height={Math.max(0, sy)} />
        </clipPath>
        <clipPath id="shBelow">
          <rect x={0} y={sy} width={1080} height={Math.max(0, 1920 - sy)} />
        </clipPath>
        <SoftFilter id="shFar" radius={9} />
        <SoftFilter id="shRay" radius={20} />
      </defs>
      {/* aire */}
      <g clipPath="url(#shAbove)">
        <rect width={1080} height={1920} fill="url(#shAir)" />
        <rect width={1080} height={1920} fill="url(#shSun)" />
        <g transform={layerT(cam, 0.3)} filter="url(#shFar)" opacity={0.6}>
          {Array.from({length: 8}, (_, i) => (
            <rect key={i} x={cam.x * 0.3 - 900 + i * 260 + hash1(i + 9) * 60} y={-1600} width={50 + hash1(i * 3 + 9) * 60} height={1600} fill={i % 2 ? '#1e2a16' : '#283620'} />
          ))}
        </g>
        <g transform={layerT(cam, 0.6)} opacity={0.9}>
          {Array.from({length: 10}, (_, i) => (
            <Fern key={i} x={cam.x * 0.6 - 900 + i * 210} base={-10} h={240 + hash1(i * 4 + 3) * 160} t={t} seed={i + 3} c="#2e5a24" dir={i % 2 ? 1 : -1} />
          ))}
        </g>
      </g>
      {/* agua */}
      <g clipPath="url(#shBelow)">
        <rect width={1080} height={1920} fill="url(#shWater)" />
        <g transform={layerT(cam, 0.25)} filter="url(#shRay)" opacity={0.6}>
          {Array.from({length: 7}, (_, i) => {
            const x = cam.x * 0.25 - 600 + i * 230 + Math.sin(t * 0.3 + i) * 30;
            return <path key={i} d={`M${f1(x + 120)},0 L${f1(x + 190)},0 L${f1(x - 80)},900 L${f1(x - 200)},900Z`} fill="#f8f4c0" opacity={0.25 + 0.2 * Math.sin(t * 0.7 + i * 2)} />;
          })}
        </g>
        <g transform={layerT(cam, 0.55)} filter="url(#shFar)" opacity={0.55}>
          {Array.from({length: 10}, (_, i) => (
            <Elodea key={i} x={cam.x * 0.55 - 1000 + i * 220} base={560} h={300 + hash1(i * 3) * 200} t={t} seed={i * 1.9} c="#1e5a4a" leaf={1.2} />
          ))}
        </g>
      </g>
      {/* plano del personaje */}
      <g transform={layerT(cam, 1)}>
        <path d={GROUND} fill="url(#shSoil)" />
        {/* cáusticas sobre el fondo sumergido */}
        {Array.from({length: 26}, (_, i) => {
          const x = -1200 + i * 70 + Math.sin(t * 1.1 + i) * 14;
          const g = edgeGround(x);
          if (g < 8) return null;
          return <path key={`c${i}`} d={`M${f1(x - 26)},${f1(g + 4)} q26,${f1(-6 + Math.sin(t * 2 + i) * 4)} 52,0`} stroke="#e8ffb0" strokeWidth={2} fill="none" opacity={0.28} />;
        })}
        {Array.from({length: 40}, (_, i) => {
          const x = -1200 + hash1(i * 7.3) * 2600;
          const y = edgeGround(x) + 8 + hash1(i * 3.1) * 60;
          const r = 3 + hash1(i * 5.7) * 8;
          return <ellipse key={`p${i}`} cx={x} cy={y} rx={r} ry={r * 0.6} fill={['#6a5a40', '#4a3c26', '#8a7a5a'][i % 3]} opacity={0.85} />;
        })}
        {/* banda de fango y algas sobre la pendiente sumergida */}
        {Array.from({length: 30}, (_, i) => {
          const x = -300 + i * 30;
          const g = edgeGround(x);
          if (g < 20) return null;
          return <ellipse key={`m${i}`} cx={x} cy={g + 6} rx={22} ry={7} fill={i % 2 ? '#3e5a2e' : '#4a6a34'} opacity={0.55} />;
        })}
        {[-560, -250, 30, 260].map((x, i) => <Elodea key={`ee${i}`} x={x} base={edgeGround(x) + 4} h={Math.max(120, edgeGround(x) + 40)} t={t} seed={i * 3.3 + 61} c={i % 2 ? '#2f6e3a' : '#3c8240'} />)}
        {Array.from({length: 18}, (_, i) => {
          const x = 600 + i * 60 + hash1(i * 13) * 30;
          const g = edgeGround(x);
          return <path key={`gr${i}`} d={`M${f1(x)},${f1(g)} l${f1(-4 + hash1(i) * 8)},${f1(-18 - hash1(i * 3) * 22)} M${f1(x + 5)},${f1(g)} l${f1(3 + hash1(i * 5) * 6)},${f1(-14 - hash1(i * 7) * 16)}`} stroke={i % 2 ? '#6aa03a' : '#88b84a'} strokeWidth={2.4} strokeLinecap="round" />;
        })}
        <Stone x={-480} y={530} w={240} h={90} seed={21} c="#465a4a" />
        <Stone x={1100} y={edgeGround(1100) + 6} w={200} h={50} seed={23} c="#4e5a4a" moss={0.6} />
        <Moss x={900} y={edgeGround(900)} w={180} seed={9} />
        {Array.from({length: 10}, (_, i) => {
          const x = 760 + i * 70 + hash1(i * 3) * 30;
          return <Leaf key={`l${i}`} x={x} y={edgeGround(x) - 2} s={0.8 + hash1(i * 5) * 0.4} rot={-8 + hash1(i * 7) * 16 + (edgeSlope(x) * 180) / Math.PI} c={['#8a6a2a', '#a8782a', '#6a5a24', '#9a4a1e'][i % 4]} t={t} />;
        })}
        {/* juncos que atraviesan la superficie */}
        {[-700, -380, 120, 300, 640].map((x, i) => {
          const g = edgeGround(x);
          const top = -260 - hash1(i * 11) * 200;
          const sway = Math.sin(t * 0.8 + i) * 10;
          return <path key={`j${i}`} d={`M${x},${f1(g)} Q${f1(x + sway * 0.4)},${f1((g + top) / 2)} ${f1(x + sway)},${f1(top)}`} stroke={i % 2 ? '#5a7a2a' : '#6a8a32'} strokeWidth={7} fill="none" strokeLinecap="round" />;
        })}
        {children}
      </g>
      {/* tinte del agua sobre todo lo sumergido (incluido el personaje) */}
      <rect x={0} y={sy} width={1080} height={Math.max(0, 1920 - sy)} fill="#1f7a6e" opacity={0.22} />
      {/* superficie: línea brillante, menisco y ondas */}
      <g transform={layerT(cam, 1)}>
        <path d={`M-2600,0 ${Array.from({length: 52}, (_, i) => `Q${-2550 + i * 100},${f1(-3 + Math.sin(t * 2 + i) * 3)} ${-2500 + i * 100},0`).join(' ')}`} stroke="#e8fff8" strokeWidth={3} fill="none" opacity={0.8} />
        <rect x={-2600} y={0} width={5200} height={14} fill="#c8f0e0" opacity={0.18} />
        {ripple &&
          [0, 0.45, 0.9].map((d, i) => {
            const a = t - ripple.t0 - d;
            if (a <= 0 || a > 2.2) return null;
            return <ellipse key={i} cx={ripple.x} cy={0} rx={10 + a * 90} ry={2 + a * 6} fill="none" stroke="#f0fffa" strokeWidth={2} opacity={0.8 * (1 - a / 2.2)} />;
          })}
      </g>
    </g>
  );
};

export const ShallowsFront: React.FC<{cam: Cam; t: number}> = ({cam, t}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <defs>
      <SoftFilter id="shFg" radius={11} />
    </defs>
    <g transform={layerT(cam, 1.45)} filter="url(#shFg)" opacity={0.75}>
      {[-520, 560].map((dx, i) => {
        const x = cam.x * 1.45 + dx;
        const sway = Math.sin(t * 0.7 + i * 2) * 16;
        return <path key={i} d={`M${f1(x)},900 Q${f1(x + sway * 0.4)},0 ${f1(x + sway)},-900`} stroke="#18300e" strokeWidth={22} fill="none" strokeLinecap="round" />;
      })}
    </g>
  </svg>
);
