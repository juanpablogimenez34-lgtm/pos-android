// ESCENARIO — MANGLAR DEL INDO-PACÍFICO EN TOMA PARTIDA (aire arriba, agua abajo; superficie en y = 0).
// AIRE: fondo de selva desenfocado (bokeh dorado), troncos de mangle con raíces zancudas, ramas con
// hojas que se mecen, rayos de sol. AGUA: verde translúcido, raíces sumergidas (desplazadas en la
// línea de agua para sugerir la refracción), sedimento con hojas y rocas, peces pequeños, partículas,
// cáusticas y rayos; bajo la superficie, el reflejo interno ondulante. La línea de agua está animada.
// Parallax en ambos mundos; desenfoques en coordenadas de pantalla.
import React from 'react';
import {clamp, hash1} from '../../../engine/math';
import {Cam, layerT, toScreen} from '../../../studio2';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
export const BED = 820;

const Blur: React.FC<{id: string; r: number}> = ({id, r}) => (
  <filter id={id} filterUnits="userSpaceOnUse" x={-200} y={-200} width={1480} height={2320}>
    <feGaussianBlur stdDeviation={r} />
  </filter>
);

/** Raíz zancuda de mangle: arco desde el tronco (aire) hasta el fondo; bajo el agua se desplaza `shift`. */
const rootPath = (x: number, top: number, span: number, shift: number) => `M${f1(x)},${f1(top)} C${f1(x + span * 0.2)},${f1(top + 120)} ${f1(x + span * 0.7 + shift)},${f1(-40)} ${f1(x + span + shift)},${BED + 20}`;

export const MangroveTree: React.FC<{x: number; top: number; t: number; side: 'above' | 'below'; c?: string}> = ({x, top, t, side, c = '#4a3a28'}) => {
  const shift = side === 'below' ? 14 : 0;
  return (
    <g>
      {side === 'above' && <path d={`M${f1(x - 26)},-2400 L${f1(x + 26)},-2400 L${f1(x + 30)},${f1(top)} L${f1(x - 30)},${f1(top)}Z`} fill={c} />}
      {side === 'above' && Array.from({length: 8}, (_, i) => <path key={`bk${i}`} d={`M${f1(x - 20 + (i % 3) * 14)},${f1(-2300 + i * 260)} l6,90`} stroke="#2a2016" strokeWidth={3} opacity={0.6} />)}
      {[-260, -150, -40, 90, 200, 300].map((sp, i) => (
        <g key={i}>
          <path d={rootPath(x + (i - 2.5) * 8, top - 10 + Math.abs(i - 2.5) * 30, sp, shift)} stroke={c} strokeWidth={16 - Math.abs(i - 2.5) * 2} fill="none" strokeLinecap="round" />
          <path d={rootPath(x + (i - 2.5) * 8 - 4, top - 14 + Math.abs(i - 2.5) * 30, sp, shift)} stroke="#8a7050" strokeWidth={3} fill="none" opacity={0.4} />
          {side === 'below' && <path d={rootPath(x + (i - 2.5) * 8, top - 10 + Math.abs(i - 2.5) * 30, sp, shift)} stroke="#3a6a3a" strokeWidth={20 - Math.abs(i - 2.5) * 2} strokeDasharray="2 30" fill="none" opacity={0.55} strokeDashoffset={f1(t * 4)} />}
        </g>
      ))}
    </g>
  );
};

/** Rama que entra en el encuadre con hojas que se mecen. */
export const Branch: React.FC<{x: number; y: number; len: number; ang: number; t: number; seed: number; n?: number}> = ({x, y, len, ang, t, seed, n = 9}) => {
  const sway = Math.sin(t * 0.9 + seed) * 0.02;
  const a = ang + sway;
  const x2 = x + Math.cos(a) * len;
  const y2 = y + Math.sin(a) * len;
  return (
    <g>
      <path d={`M${f1(x)},${f1(y)} Q${f1((x + x2) / 2)},${f1((y + y2) / 2 + 30)} ${f1(x2)},${f1(y2)}`} stroke="#4a3a24" strokeWidth={14} fill="none" strokeLinecap="round" />
      {Array.from({length: n}, (_, i) => {
        const u = (i + 0.6) / (n + 0.4);
        const bx = x + (x2 - x) * u;
        const by = y + (y2 - y) * u + Math.sin(u * Math.PI) * 30 * 0.5;
        const la = a + (i % 2 ? 0.9 : -0.9) + Math.sin(t * 1.4 + seed + i) * 0.08 + (i % 2 ? 0.5 : 0);
        const L = 70 + hash1(seed + i) * 40;
        const tx = bx + Math.cos(la) * L;
        const ty = by + Math.sin(la) * L;
        const nx = -Math.sin(la) * L * 0.3;
        const ny = Math.cos(la) * L * 0.3;
        return (
          <g key={i}>
            <path d={`M${f1(bx)},${f1(by)} Q${f1((bx + tx) / 2 + nx)},${f1((by + ty) / 2 + ny)} ${f1(tx)},${f1(ty)} Q${f1((bx + tx) / 2 - nx)},${f1((by + ty) / 2 - ny)} ${f1(bx)},${f1(by)}Z`} fill={i % 3 ? '#3a8a3a' : '#4a9a40'} stroke="#1e4a1e" strokeWidth={1} />
            <path d={`M${f1(bx)},${f1(by)} L${f1(tx)},${f1(ty)}`} stroke="#9ad878" strokeWidth={1} opacity={0.6} />
          </g>
        );
      })}
    </g>
  );
};

export type MangroveOpts = {light?: number; trees?: number[]};

export const MangroveBack: React.FC<{cam: Cam; t: number; children?: React.ReactNode; above?: React.ReactNode; free?: React.ReactNode} & MangroveOpts> = ({cam, t, children, above, free, light = 1, trees = [-900, 700, 1900]}) => {
  const sy = toScreen(cam, 0, 0).y;
  const syc = clamp(sy, -2, 1922);
  return (
    <g>
      <defs>
        <linearGradient id="mgAir" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ac8a0" />
          <stop offset="0.6" stopColor="#4a8a5a" />
          <stop offset="1" stopColor="#2a5a3a" />
        </linearGradient>
        <linearGradient id="mgWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5ab89a" />
          <stop offset="0.35" stopColor="#2a8a72" />
          <stop offset="1" stopColor="#0e3a3a" />
        </linearGradient>
        <radialGradient id="mgSun" cx="0.75" cy="0" r="0.8">
          <stop offset="0" stopColor="#fff4c0" stopOpacity={0.75} />
          <stop offset="0.5" stopColor="#ffe8a0" stopOpacity={0.15} />
          <stop offset="1" stopColor="#ffe8a0" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="mgRay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffbe0" stopOpacity={0.45} />
          <stop offset="1" stopColor="#fffbe0" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="mgBed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a5a3a" />
          <stop offset="1" stopColor="#2a2414" />
        </linearGradient>
        <clipPath id="mgAbove">
          <rect x={0} y={0} width={1080} height={Math.max(0, syc)} />
        </clipPath>
        <clipPath id="mgBelow">
          <rect x={0} y={syc} width={1080} height={Math.max(0, 1920 - syc)} />
        </clipPath>
        <Blur id="mgFar" r={10} />
        <Blur id="mgRays" r={22} />
      </defs>
      {/* ===== AIRE ===== */}
      <g clipPath="url(#mgAbove)">
        <rect width={1080} height={1920} fill="url(#mgAir)" />
        <rect width={1080} height={1920} fill="url(#mgSun)" opacity={light} />
        <g filter="url(#mgFar)"><g transform={layerT(cam, 0.25)} opacity={0.75}>
          {Array.from({length: 10}, (_, i) => <rect key={`ft${i}`} x={cam.x * 0.25 - 1300 + i * 280 + hash1(i) * 60} y={-2400} width={40 + hash1(i * 3) * 50} height={2400} fill={i % 2 ? '#2a4a30' : '#34583a'} />)}
          {Array.from({length: 26}, (_, i) => <circle key={`bk${i}`} cx={cam.x * 0.25 - 1300 + hash1(i * 5) * 2600} cy={-1500 + hash1(i * 7) * 1400} r={30 + hash1(i) * 60} fill={i % 3 ? '#5a9a4a' : '#e8e0a0'} opacity={i % 3 ? 0.5 : 0.35} />)}
        </g></g>
        <g filter="url(#mgRays)"><g transform={layerT(cam, 0.2)} opacity={0.7 * light}>
          {Array.from({length: 5}, (_, i) => {
            const x = cam.x * 0.2 - 400 + i * 260 + Math.sin(t * 0.3 + i) * 20;
            return <path key={i} d={`M${f1(x + 300)},-2400 L${f1(x + 380)},-2400 L${f1(x - 100)},10 L${f1(x - 250)},10Z`} fill="url(#mgRay)" opacity={0.4 + 0.2 * Math.sin(t * 0.6 + i)} />;
          })}
        </g></g>
        <g transform={layerT(cam, 1)}>
          {trees.map((x, i) => <MangroveTree key={x} x={x} top={-330 - (i % 2) * 60} t={t} side="above" />)}
          {above}
        </g>
      </g>
      {/* ===== AGUA ===== */}
      <g clipPath="url(#mgBelow)">
        <rect width={1080} height={1920} fill="url(#mgWater)" />
        <g filter="url(#mgRays)"><g transform={layerT(cam, 0.3)} opacity={0.5 * light}>
          {Array.from({length: 6}, (_, i) => {
            const x = cam.x * 0.3 - 600 + i * 240 + Math.sin(t * 0.4 + i) * 30;
            return <path key={i} d={`M${f1(x + 120)},0 L${f1(x + 190)},0 L${f1(x - 60)},1200 L${f1(x - 200)},1200Z`} fill="#f8f4c0" opacity={0.25 + 0.2 * Math.sin(t * 0.7 + i * 2)} />;
          })}
        </g></g>
        <g filter="url(#mgFar)"><g transform={layerT(cam, 0.45)} opacity={0.55}>
          {Array.from({length: 9}, (_, i) => <path key={`fr${i}`} d={`M${f1(cam.x * 0.45 - 1300 + i * 300)},0 C${f1(cam.x * 0.45 - 1250 + i * 300)},300 ${f1(cam.x * 0.45 - 1200 + i * 300)},500 ${f1(cam.x * 0.45 - 1150 + i * 300)},${BED * 0.45 + 300}`} stroke="#1e4a3a" strokeWidth={22} fill="none" />)}
          <rect x={cam.x * 0.45 - 2600} y={BED * 0.45 + 280} width={5200} height={1600} fill="#1a3a30" />
        </g></g>
        <g transform={layerT(cam, 0.7)} opacity={0.85}>
          {Array.from({length: 12}, (_, i) => {
            const px = cam.x * 0.7 + ((hash1(i * 3) * 1700 + t * 45) % 1700) - 850;
            const py = cam.y * 0.7 + 120 + hash1(i * 7) * 260 + Math.sin(t * 1.5 + i) * 10;
            return <path key={`sf${i}`} d={`M${f1(px)},${f1(py)} q-9,-5 -18,0 q9,5 18,0 M${f1(px - 18)},${f1(py)} l-6,${f1(-4 + Math.sin(t * 12 + i) * 2)} l0,8z`} fill="#c8e0d0" opacity={0.6} />;
          })}
        </g>
        <g transform={layerT(cam, 1)}>
          <path d={`M-3000,${BED} ${Array.from({length: 36}, (_, i) => `Q${-3000 + i * 200 + 100},${BED - 10 + Math.sin(i * 1.7) * 8} ${-3000 + (i + 1) * 200},${BED}`).join(' ')} L4200,2800 L-3000,2800Z`} fill="url(#mgBed)" />
          {Array.from({length: 70}, (_, i) => {
            const x = -2500 + hash1(i * 6.7) * 6000;
            const y = BED + 14 + Math.pow(hash1(i * 3.9), 0.8) * 420;
            const s = 0.6 + hash1(i * 2.1) * 0.9;
            return <path key={`lf${i}`} d={`M${f1(x)},${f1(y)} q${f1(14 * s)},${f1(-9 * s)} ${f1(30 * s)},0 q${f1(-14 * s)},${f1(9 * s)} ${f1(-30 * s)},0Z`} fill={['#6a5a2a', '#5a4a1a', '#7a6a3a'][i % 3]} opacity={0.85} />;
          })}
          {Array.from({length: 18}, (_, i) => {
            const x = -2500 + hash1(i * 9.7) * 6000 + Math.sin(t * 0.8 + i) * 20;
            return <ellipse key={`cs${i}`} cx={x} cy={BED + 30 + hash1(i * 4.1) * 200} rx={50 + hash1(i) * 30} ry={8} fill="#fffbe0" opacity={0.12 + 0.08 * Math.sin(t * 1.4 + i * 2)} />;
          })}
          {trees.map((x, i) => <MangroveTree key={x} x={x} top={-330 - (i % 2) * 60} t={t} side="below" />)}
          {children}
        </g>
        {/* reflejo interno bajo la superficie */}
        <rect x={0} y={syc} width={1080} height={46} fill="#cfeee0" opacity={0.18} />
        {Array.from({length: 9}, (_, i) => <path key={`ti${i}`} d={`M${f1(((i * 140 + t * 25) % 1240) - 80)},${f1(syc + 18 + (i % 3) * 8)} q35,${f1(4 + Math.sin(t * 2 + i) * 3)} 70,0`} stroke="#eafff4" strokeWidth={2} fill="none" opacity={0.4} />)}
      </g>
      {/* ===== LÍNEA DE AGUA ===== */}
      <g transform={layerT(cam, 1)}>
        <path d={`M-3000,0 ${Array.from({length: 72}, (_, i) => `Q${-3000 + i * 100 + 50},${f1(-4 + Math.sin(t * 2.1 + i * 0.9) * 4)} ${-3000 + (i + 1) * 100},0`).join(' ')}`} stroke="#f4fffa" strokeWidth={3} fill="none" opacity={0.85} />
        <path d={`M-3000,4 L4200,4`} stroke="#9ad8c0" strokeWidth={4} opacity={0.4} />
        {/* elementos que cruzan la superficie (chorro, insecto que cae, ondas) */}
        {free}
      </g>
    </g>
  );
};

export const MangroveFront: React.FC<{cam: Cam; t: number}> = ({cam, t}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <defs>
      <Blur id="mgFg" r={11} />
    </defs>
    <g transform={layerT(cam, 1.12)}>
      {Array.from({length: 24}, (_, i) => {
        const y = cam.y * 1.12 + ((hash1(i * 13) * 2300 + Math.sin(t * 0.6 + i) * 30) % 2300) - 1150;
        if (y < 0) return null; // partículas solo bajo el agua
        return <circle key={i} cx={cam.x * 1.12 + ((hash1(i * 11) * 1700 + t * (10 + hash1(i) * 10)) % 1700) - 850} cy={y} r={1.2 + hash1(i * 5) * 2.2} fill="#f0f8e0" opacity={0.5} />;
      })}
    </g>
    <g filter="url(#mgFg)"><g transform={layerT(cam, 1.5)} opacity={Math.max(0, Math.min(1, (2.8 - cam.zoom) / 0.9)) * 0.8}>
      <path d={`M${f1(cam.x * 1.5 - 600)},${f1(cam.y * 1.5 - 1500)} C${f1(cam.x * 1.5 - 560)},${f1(cam.y * 1.5 - 300)} ${f1(cam.x * 1.5 - 420)},${f1(cam.y * 1.5 + 400)} ${f1(cam.x * 1.5 - 380)},${f1(cam.y * 1.5 + 1500)}`} stroke="#1a2614" strokeWidth={60} fill="none" />
    </g></g>
  </svg>
);
