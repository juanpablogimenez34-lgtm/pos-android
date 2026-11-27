// ESCENARIO — FONDO MARINO PROFUNDO (luz azul verdosa que se apaga hacia abajo).
// Capas: agua con gradiente y haz de luz difusa → rocas lejanas en bruma (parallax 0,3) → rocas
// medias (0,6) → nieve marina → fondo de sedimento del personaje (1,0) con guijarros, restos
// orgánicos (conchas, fragmentos), ondulaciones del sedimento y rocas con brillo → (delante) nieve
// marina cercana y rocas desenfocadas (componente aparte, DeepFront).
// Suelo del personaje en y = 0. Todo determinista (hash1), sin filtros costosos salvo dos desenfoques.
import React from 'react';
import {hash1} from '../../../engine/math';
import {Cam, layerT} from '../../../studio2';
import {SoftFilter} from '../../oarfish-cinematic-v2/character/filters';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
export const FLOOR = 0;

export const Rock: React.FC<{x: number; y: number; w: number; h: number; seed: number; c?: string; hi?: number}> = ({x, y, w, h, seed, c = '#1e2e30', hi = 0.25}) => {
  const pts = Array.from({length: 14}, (_, i) => {
    const a = Math.PI + (i / 13) * Math.PI;
    const r = 0.78 + 0.32 * hash1(seed * 11 + i);
    return {x: x + Math.cos(a) * w * 0.5 * r, y: y + Math.sin(a) * h * r};
  });
  const d = `M${pts.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')}Z`;
  return (
    <g>
      <path d={d} fill={c} />
      <path d={`M${pts.slice(3, 11).map((p) => `${f1(p.x)},${f1(p.y + 3)}`).join(' L')}`} stroke="#9ad8d0" strokeWidth={3} fill="none" opacity={hi} strokeLinecap="round" />
      {Array.from({length: 5}, (_, i) => (
        <ellipse key={i} cx={x - w * 0.3 + hash1(seed + i * 7) * w * 0.6} cy={y - h * (0.3 + 0.4 * hash1(seed * 3 + i))} rx={4 + hash1(i + seed) * 8} ry={2 + hash1(i * 2 + seed) * 3} fill="#0a1416" opacity={0.4} />
      ))}
    </g>
  );
};

export type DeepOpts = {light?: number; extent?: [number, number]};

export const DeepBack: React.FC<{cam: Cam; t: number; children?: React.ReactNode} & DeepOpts> = ({cam, t, children, light = 1, extent = [-2500, 4500]}) => (
  <g>
    <defs>
      <linearGradient id="deepWater" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1a5a62" />
        <stop offset="0.45" stopColor="#0c3440" />
        <stop offset="1" stopColor="#04141c" />
      </linearGradient>
      <radialGradient id="deepGlow" cx="0.5" cy="0.15" r="0.75">
        <stop offset="0" stopColor="#7ad8c8" stopOpacity={0.35} />
        <stop offset="0.6" stopColor="#2a8a8a" stopOpacity={0.08} />
        <stop offset="1" stopColor="#2a8a8a" stopOpacity={0} />
      </radialGradient>
      <linearGradient id="deepSed" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3a4a44" />
        <stop offset="0.25" stopColor="#24302c" />
        <stop offset="1" stopColor="#0c1412" />
      </linearGradient>
      <linearGradient id="deepRay" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#a8f0e0" stopOpacity={0.3} />
        <stop offset="1" stopColor="#a8f0e0" stopOpacity={0} />
      </linearGradient>
      <SoftFilter id="deepFar" radius={8} />
      <SoftFilter id="deepRays" radius={26} />
    </defs>
    <rect width={1080} height={1920} fill="url(#deepWater)" />
    <rect width={1080} height={1920} fill="url(#deepGlow)" opacity={light} />
    {/* haces de luz muy tenues */}
    <g transform={layerT(cam, 0.15)} filter="url(#deepRays)" opacity={0.55 * light}>
      {Array.from({length: 5}, (_, i) => {
        const x = cam.x * 0.15 - 500 + i * 260 + Math.sin(t * 0.2 + i) * 30;
        return <path key={i} d={`M${f1(x + 200)},-1600 L${f1(x + 300)},-1600 L${f1(x - 80)},700 L${f1(x - 260)},700Z`} fill="url(#deepRay)" opacity={0.4 + 0.25 * Math.sin(t * 0.4 + i * 1.9)} />;
      })}
    </g>
    {/* rocas lejanas en bruma */}
    <g transform={layerT(cam, 0.3)} filter="url(#deepFar)" opacity={0.55}>
      {Array.from({length: 9}, (_, i) => (
        <Rock key={i} x={cam.x * 0.3 - 1300 + i * 330 + hash1(i) * 80} y={FLOOR * 0.3 + 260} w={260 + hash1(i * 3) * 260} h={140 + hash1(i * 5) * 240} seed={i + 40} c="#0e2a30" hi={0.08} />
      ))}
      <rect x={cam.x * 0.3 - 2400} y={FLOOR * 0.3 + 255} width={4800} height={1600} fill="#0a1e22" />
    </g>
    {/* rocas medias */}
    <g transform={layerT(cam, 0.6)} opacity={0.85}>
      <rect x={cam.x * 0.6 - 2400} y={FLOOR * 0.6 + 110} width={4800} height={1600} fill="#14221f" />
      {Array.from({length: 10}, (_, i) => (
        <Rock key={i} x={cam.x * 0.6 - 1400 + i * 300 + hash1(i * 9) * 90} y={FLOOR * 0.6 + 114} w={160 + hash1(i * 2) * 160} h={70 + hash1(i * 4) * 110} seed={i + 60} c="#162a2a" hi={0.12} />
      ))}
    </g>
    {/* nieve marina lejana */}
    <g transform={layerT(cam, 0.5)} opacity={0.55}>
      {Array.from({length: 45}, (_, i) => (
        <circle key={i} cx={cam.x * 0.5 + ((hash1(i * 3) * 2600 + Math.sin(t * 0.3 + i) * 20) % 2600) - 1300} cy={cam.y * 0.5 + (((hash1(i * 7) * 3000 + t * (6 + hash1(i) * 6)) % 3000) - 1500)} r={0.8 + hash1(i) * 1.4} fill="#cfeee6" opacity={0.5} />
      ))}
    </g>
    {/* plano del personaje: sedimento */}
    <g transform={layerT(cam, 1)}>
      <path d={`M${extent[0]},${FLOOR} ${Array.from({length: Math.ceil((extent[1] - extent[0]) / 160)}, (_, i) => `Q${extent[0] + i * 160 + 80},${FLOOR - 8 + Math.sin(i * 1.9) * 7} ${extent[0] + (i + 1) * 160},${FLOOR}`).join(' ')} L${extent[1]},1800 L${extent[0]},1800Z`} fill="url(#deepSed)" />
      {/* ondulaciones del sedimento */}
      {Array.from({length: 40}, (_, i) => {
        const x = extent[0] + hash1(i * 5.1) * (extent[1] - extent[0]);
        const y = FLOOR + 20 + hash1(i * 3.3) * 380;
        return <path key={`r${i}`} d={`M${f1(x)},${f1(y)} q30,-6 60,0 q30,6 60,0`} stroke="#4a5a52" strokeWidth={2} fill="none" opacity={0.35} />;
      })}
      {/* guijarros y restos orgánicos */}
      {Array.from({length: 120}, (_, i) => {
        const x = extent[0] + hash1(i * 7.7) * (extent[1] - extent[0]);
        const y = FLOOR + 6 + Math.pow(hash1(i * 2.9), 0.8) * 420;
        const r = 2 + hash1(i * 4.1) * 6;
        return <ellipse key={`p${i}`} cx={x} cy={y} rx={r * 1.3} ry={r * 0.7} fill={['#4a564e', '#2c3632', '#5e6a5e', '#3a4440'][i % 4]} opacity={0.9} />;
      })}
      {Array.from({length: 26}, (_, i) => {
        const x = extent[0] + hash1(i * 13.3) * (extent[1] - extent[0]);
        const y = FLOOR + 10 + hash1(i * 6.1) * 300;
        const s = 0.7 + hash1(i * 9) * 0.8;
        return i % 3 === 0 ? (
          <path key={`c${i}`} d={`M${f1(x - 10 * s)},${f1(y)} q${f1(10 * s)},${f1(-14 * s)} ${f1(20 * s)},0 Z`} fill="#b8b0a0" opacity={0.6} />
        ) : (
          <path key={`c${i}`} d={`M${f1(x)},${f1(y)} l${f1(14 * s)},${f1(-3 * s)} l${f1(4 * s)},${f1(4 * s)}`} stroke="#8a8270" strokeWidth={2 * s} fill="none" opacity={0.55} strokeLinecap="round" />
        );
      })}
      {children}
    </g>
  </g>
);

export const DeepFront: React.FC<{cam: Cam; t: number}> = ({cam, t}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <defs>
      <SoftFilter id="deepFg" radius={10} />
    </defs>
    <g transform={layerT(cam, 1.15)}>
      {Array.from({length: 26}, (_, i) => (
        <circle key={i} cx={cam.x * 1.15 + ((hash1(i * 11) * 1600 + Math.sin(t * 0.5 + i) * 30) % 1600) - 800} cy={cam.y * 1.15 + (((hash1(i * 13) * 2200 + t * (12 + hash1(i * 2) * 10)) % 2200) - 1100)} r={1.2 + hash1(i * 5) * 2.2} fill="#e0f6f0" opacity={0.55} />
      ))}
    </g>
    <g transform={layerT(cam, 1.5)} filter="url(#deepFg)" opacity={Math.max(0, Math.min(1, (2.8 - cam.zoom) / 0.9)) * 0.9}>
      <Rock x={cam.x * 1.5 - 640} y={FLOOR * 1.5 + 520} w={520} h={260} seed={91} c="#060e10" hi={0.05} />
      <Rock x={cam.x * 1.5 + 700} y={FLOOR * 1.5 + 560} w={460} h={220} seed={93} c="#050c0e" hi={0.05} />
    </g>
  </svg>
);
