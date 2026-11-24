// HÁBITATS (multicapa con parallax; el suelo es y = 0 en coordenadas de mundo).
//  · LandScene: selva asiática, sabana, zona árida australiana, hojarasca de bosque africano, desierto
//    norteamericano, desierto rocoso del Sahara, troncos y rocas de Arizona, bosque húmedo australiano,
//    vegetación tropical sudamericana, suelo de bosque tropical. Capas: fondo, lejano (0,35), medio (0,65),
//    suelo (1), personajes, primer plano (1,35), rayos de luz y partículas (humedad o polvo).
//  · SeaScene: arrecife rocoso, arrecife de coral, fondo arenoso, aguas abiertas (sobre DeepOcean del EP23,
//    importado sin modificarlo): rocas, corales, algas, gorgonias, ondulaciones de arena.
//  · WebRefuge: refugio oscuro con tela irregular cuyos hilos se desplazan con la araña y las vibraciones.
//  · LeafWipe / DustWipe: transiciones con elementos naturales que cruzan la cámara.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, hash1, mixColor} from '../../../engine/math';
import {Cam, layerT, toScreen} from '../../../studio2';
import {DeepOcean} from '../../ep23-cachalote/environment/Ocean';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export type LandKind = 'asiaForest' | 'savanna' | 'aridAU' | 'leafLitter' | 'desertNA' | 'rockDesert' | 'logsAZ' | 'humidAU' | 'tropicalSA' | 'forestFloorSA';
type Pal = {sky0: string; sky1: string; far: string; mid: string; ground: string; ground2: string; fg: string; light: string; dust: boolean};
const PAL: Record<LandKind, Pal> = {
  asiaForest: {sky0: '#2a4a2a', sky1: '#7a9a6a', far: '#3a5a3a', mid: '#2a4628', ground: '#4a3a24', ground2: '#2e2414', fg: '#1e3a1a', light: '#f0f8d0', dust: false},
  savanna: {sky0: '#e8c890', sky1: '#f8e8c0', far: '#a89060', mid: '#7a6a3a', ground: '#b89a60', ground2: '#8a6e40', fg: '#9a8040', light: '#fff4d0', dust: true},
  aridAU: {sky0: '#e8a070', sky1: '#f8d8a8', far: '#b0603a', mid: '#9a5030', ground: '#c0703e', ground2: '#8a4a26', fg: '#a8a050', light: '#fff0c8', dust: true},
  leafLitter: {sky0: '#1e2a18', sky1: '#4a5a34', far: '#2a3420', mid: '#3a3a22', ground: '#6a4a2a', ground2: '#3a2a16', fg: '#5a3a1e', light: '#e8f0c0', dust: false},
  desertNA: {sky0: '#e8b080', sky1: '#fae0b8', far: '#c08a5a', mid: '#a87a4a', ground: '#d8b47e', ground2: '#a88456', fg: '#6a7a4a', light: '#fff4d8', dust: true},
  rockDesert: {sky0: '#e0b878', sky1: '#f6e2b8', far: '#c89a60', mid: '#a07a48', ground: '#d4b070', ground2: '#a8844c', fg: '#8a6a40', light: '#fff6dc', dust: true},
  logsAZ: {sky0: '#5a4a6a', sky1: '#e8b890', far: '#8a6a6a', mid: '#6a5040', ground: '#b89068', ground2: '#7a5a3e', fg: '#5a6a3a', light: '#ffe8c8', dust: true},
  humidAU: {sky0: '#1a2a20', sky1: '#4a6048', far: '#2a3a2a', mid: '#24301e', ground: '#4a3622', ground2: '#2a1e12', fg: '#2a4a24', light: '#e0f0d0', dust: false},
  tropicalSA: {sky0: '#1e3a24', sky1: '#6a9a5a', far: '#2e5a30', mid: '#24482a', ground: '#3a4a22', ground2: '#22301a', fg: '#2a5a26', light: '#f4ffd8', dust: false},
  forestFloorSA: {sky0: '#1a2814', sky1: '#4a6a3a', far: '#24361e', mid: '#2a3a1c', ground: '#5a3e22', ground2: '#2e2010', fg: '#3a5a22', light: '#eef8cc', dust: false},
};

const Tree: React.FC<{x: number; h: number; c: string; k: LandKind; i: number}> = ({x, h, c, k, i}) => {
  if (k === 'savanna') {
    return (
      <g>
        <path d={`M${x},0 l-6,${-h * 0.6} l-40,-30 M${x - 6},${-h * 0.6} l30,-40`} stroke={c} strokeWidth={10} fill="none" />
        <ellipse cx={x} cy={-h * 0.78} rx={h * 0.6} ry={h * 0.13} fill={c} />
      </g>
    );
  }
  if (k === 'desertNA' || k === 'logsAZ') {
    return (
      <g>
        <rect x={x - 14} y={-h} width={28} height={h} rx={14} fill={c} />
        <path d={`M${x - 14},${-h * 0.5} h-30 v${-h * 0.25}`} stroke={c} strokeWidth={22} strokeLinecap="round" fill="none" />
        {i % 2 === 0 && <path d={`M${x + 14},${-h * 0.62} h26 v${-h * 0.2}`} stroke={c} strokeWidth={20} strokeLinecap="round" fill="none" />}
      </g>
    );
  }
  if (k === 'rockDesert' || k === 'aridAU') {
    return <path d={`M${x - h},0 Q${x - h * 0.6},${-h * 0.5} ${x},${-h * 0.55} Q${x + h * 0.7},${-h * 0.45} ${x + h},0Z`} fill={c} />;
  }
  return (
    <g>
      <rect x={x - h * 0.05} y={-h} width={h * 0.1} height={h} fill={c} />
      <ellipse cx={x} cy={-h} rx={h * 0.35} ry={h * 0.22} fill={c} />
      <ellipse cx={x - h * 0.2} cy={-h * 0.85} rx={h * 0.25} ry={h * 0.15} fill={c} />
      {(k === 'asiaForest' || k === 'tropicalSA') && <path d={`M${x + h * 0.2},${-h * 0.9} q10,${h * 0.3} -4,${h * 0.6}`} stroke={c} strokeWidth={4} fill="none" />}
    </g>
  );
};

const Leaf: React.FC<{x: number; y: number; s: number; a: number; c: string}> = ({x, y, s, a, c}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(a)}) scale(${f1(s)})`}>
    <path d="M0,0 Q30,-22 70,0 Q30,22 0,0Z" fill={c} />
    <path d="M2,0 L66,0" stroke="#000" strokeWidth={1.5} opacity={0.25} />
  </g>
);

export const LandScene: React.FC<{cam: Cam; t: number; kind: LandKind; children?: React.ReactNode; fgK?: number}> = ({cam, t, kind, children, fgK = 1}) => {
  const p = PAL[kind];
  const gy = toScreen(cam, cam.x, 0).y;
  const lush = kind === 'asiaForest' || kind === 'tropicalSA' || kind === 'humidAU' || kind === 'forestFloorSA' || kind === 'leafLitter';
  return (
    <g>
      <defs>
        <linearGradient id={`sky-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky0} />
          <stop offset="1" stopColor={p.sky1} />
        </linearGradient>
        <linearGradient id={`gr-${kind}`} gradientUnits="userSpaceOnUse" x1="0" y1={gy - 40} x2="0" y2={gy + 900}>
          <stop offset="0" stopColor={p.ground} />
          <stop offset="1" stopColor={p.ground2} />
        </linearGradient>
        <linearGradient id={`ray-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.light} stopOpacity={0.35} />
          <stop offset="1" stopColor={p.light} stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={-40} y={-40} width={1160} height={2000} fill={`url(#sky-${kind})`} />
      {/* capa lejana */}
      <g transform={layerT(cam, 0.35)} opacity={0.75}>
        {Array.from({length: 14}, (_, i) => <Tree key={i} x={cam.x * 0.35 + (i - 7) * 420 + hash1(i) * 120} h={lush ? 900 + hash1(i * 3) * 400 : 260 + hash1(i * 3) * 200} c={p.far} k={kind} i={i} />)}
        <rect x={cam.x * 0.35 - 4000} y={-6} width={8000} height={3000} fill={p.far} />
      </g>
      {/* rayos de luz */}
      {Array.from({length: 5}, (_, i) => {
        const x0 = 100 + i * 220 + Math.sin(t * 0.2 + i) * 30;
        return <path key={`r${i}`} d={`M${f1(x0)},-40 l${f1(-160)},${f1(gy + 200)} l120,0Z`} fill={`url(#ray-${kind})`} opacity={lush ? 0.5 + 0.3 * Math.sin(t * 0.5 + i) : 0.25} />;
      })}
      {/* capa media */}
      <g transform={layerT(cam, 0.65)} opacity={0.9}>
        {Array.from({length: 16}, (_, i) => {
          const x = cam.x * 0.65 + (i - 8) * 300 + hash1(i * 5) * 140;
          return lush ? (
            <g key={i}>
              {Array.from({length: 6}, (_, j) => <Leaf key={j} x={x} y={-20 - j * 18} s={1.6 + hash1(i * 7 + j) * 0.8} a={-150 + j * 50 + Math.sin(t * 0.8 + i + j) * 4} c={p.mid} />)}
            </g>
          ) : (
            <path key={i} d={`M${f1(x - 90)},0 Q${f1(x - 50)},${f1(-70 - hash1(i) * 60)} ${f1(x + 10)},${f1(-60 - hash1(i * 2) * 40)} Q${f1(x + 80)},-40 ${f1(x + 100)},0Z`} fill={p.mid} />
          );
        })}
        <rect x={cam.x * 0.65 - 4000} y={-2} width={8000} height={3000} fill={p.mid} />
      </g>
      {/* suelo */}
      <g transform={layerT(cam, 1)}>
        <rect x={cam.x - 4000} y={-8} width={8000} height={3000} fill={`url(#gr-${kind})`} />
        {Array.from({length: 60}, (_, i) => {
          const x = Math.floor(cam.x / 2000) * 2000 + (hash1(i * 11) - 0.5) * 4000;
          const y = 10 + hash1(i * 13) * 700;
          return lush ? <Leaf key={i} x={x} y={y} s={0.6 + hash1(i) * 0.6} a={hash1(i * 3) * 360} c={i % 3 ? '#6a4a24' : '#8a6a30'} /> : <ellipse key={i} cx={x} cy={y} rx={6 + hash1(i) * 16} ry={3 + hash1(i * 2) * 6} fill={i % 2 ? p.ground2 : '#e8d0a0'} opacity={0.45} />;
        })}
        {!lush && Array.from({length: 18}, (_, i) => <path key={`w${i}`} d={`M${f1(cam.x - 1500 + i * 180)},${f1(40 + (i % 5) * 60)} q60,-10 120,0 t120,0`} stroke={p.ground2} strokeWidth={3} fill="none" opacity={0.4} />)}
        {children}
      </g>
      {/* primer plano */}
      <g transform={layerT(cam, 1.35)} opacity={0.85 * fgK}>
        {Array.from({length: 6}, (_, i) => {
          const x = cam.x * 1.35 + (i - 3) * 520 + hash1(i * 17) * 200;
          return lush ? (
            <g key={i}>{Array.from({length: 4}, (_, j) => <Leaf key={j} x={x} y={260} s={3 + j * 0.5} a={-120 + j * 30 + Math.sin(t * 0.6 + i) * 3} c={p.fg} />)}</g>
          ) : (
            <g key={i}>{Array.from({length: 7}, (_, j) => <path key={j} d={`M${f1(x + j * 10)},300 q${f1(-10 + j * 4 + Math.sin(t + j) * 4)},-80 ${f1(-20 + j * 6)},-150`} stroke={p.fg} strokeWidth={5} fill="none" />)}</g>
          );
        })}
      </g>
      {/* partículas: polvo o humedad */}
      {Array.from({length: 26}, (_, i) => {
        const x = (hash1(i * 19) * 1200 + t * (p.dust ? 40 : 8) * (0.5 + hash1(i))) % 1160 - 40;
        const y = (hash1(i * 23) * 1900 + Math.sin(t * 0.6 + i) * 30 - (p.dust ? 0 : t * 12)) % 1920;
        return <circle key={`p${i}`} cx={x} cy={(y + 1920) % 1920} r={1.5 + hash1(i) * 2.5} fill={p.dust ? '#f0d8a8' : '#e8f8e0'} opacity={0.35} />;
      })}
    </g>
  );
};

export type SeaKind = 'rockReef' | 'coralReef' | 'sandFloor' | 'openWater';
export const SeaScene: React.FC<{cam: Cam; t: number; kind: SeaKind; children?: React.ReactNode; floorY?: number}> = ({cam, t, kind, children, floorY = 500}) => (
  <DeepOcean cam={cam} t={t} depth={kind === 'openWater' ? 0.32 : 0.18} glow={0} violet={0.05}>
    {kind !== 'openWater' && (
      <g>
        <path d={`M${cam.x - 4000},${floorY + 3000} L${cam.x - 4000},${floorY} ${Array.from({length: 40}, (_, i) => `L${f1(cam.x - 4000 + i * 205)},${f1(floorY - (kind === 'rockReef' ? 60 + hash1(i * 3) * 160 : 10 + hash1(i * 3) * 30))}`).join(' ')} L${cam.x + 4200},${floorY} L${cam.x + 4200},${floorY + 3000}Z`} fill={kind === 'sandFloor' ? '#c8b088' : '#8a7a62'} />
        <rect x={cam.x - 4000} y={floorY + 30} width={8200} height={3000} fill={kind === 'sandFloor' ? '#d8c49a' : '#a8946e'} />
        {Array.from({length: 20}, (_, i) => <path key={`sr${i}`} d={`M${f1(cam.x - 1600 + i * 170)},${f1(floorY + 60 + (i % 4) * 50)} q50,-10 100,0 t100,0`} stroke="#b8a078" strokeWidth={3} fill="none" opacity={0.5} />)}
        {kind !== 'sandFloor' && Array.from({length: 14}, (_, i) => {
          const x = cam.x - 1800 + i * 280 + hash1(i * 7) * 100;
          const h = 120 + hash1(i * 9) * 160;
          return kind === 'coralReef' ? (
            <g key={i}>
              {Array.from({length: 5}, (_, j) => <path key={j} d={`M${f1(x)},${f1(floorY)} q${f1((j - 2) * 20)},${f1(-h * 0.5)} ${f1((j - 2) * 34 + Math.sin(t * 0.8 + i + j) * 4)},${f1(-h)}`} stroke={['#e87a6a', '#e8b06a', '#a86ac8', '#6ac8b8'][i % 4]} strokeWidth={12 - j} strokeLinecap="round" fill="none" />)}
              <ellipse cx={x + 90} cy={floorY - 20} rx={46} ry={32} fill="#c8a870" />
            </g>
          ) : (
            <g key={i}>
              <path d={`M${f1(x - 80)},${f1(floorY + 10)} Q${f1(x - 60)},${f1(floorY - h * 0.8)} ${f1(x + 10)},${f1(floorY - h)} Q${f1(x + 90)},${f1(floorY - h * 0.6)} ${f1(x + 100)},${f1(floorY + 10)}Z`} fill={i % 2 ? '#6a6252' : '#7a705e'} stroke="#4a4234" strokeWidth={3} />
              {Array.from({length: 4}, (_, j) => <path key={j} d={`M${f1(x - 40 + j * 24)},${f1(floorY - h * 0.7)} q${f1(Math.sin(t + i + j) * 8)},-30 ${f1(Math.sin(t * 1.2 + i + j) * 10)},-60`} stroke="#5a8a4a" strokeWidth={6} fill="none" strokeLinecap="round" />)}
            </g>
          );
        })}
      </g>
    )}
    {children}
  </DeepOcean>
);

/** Tela irregular (viuda negra): los hilos se desplazan hacia la araña y vibran con la presa. */
export const WebRefuge: React.FC<{cam: Cam; t: number; spider: V; vibe: number; children?: React.ReactNode}> = ({cam, t, spider, vibe, children}) => {
  const anchors: V[] = Array.from({length: 18}, (_, i) => ({x: (hash1(i * 3) - 0.5) * 1800, y: (hash1(i * 5) - 0.5) * 1600}));
  const pull = (q: V): V => {
    const d = Math.hypot(q.x - spider.x, q.y - spider.y);
    const k = Math.exp(-d / 260) * 12;
    return {x: q.x + (spider.x - q.x) * k * 0.01 + Math.sin(t * 40 + q.x) * vibe * 3, y: q.y + (spider.y - q.y) * k * 0.01 + Math.cos(t * 37 + q.y) * vibe * 3};
  };
  return (
    <g>
      <rect width={1080} height={1920} fill="#14100c" />
      <g transform={layerT(cam, 0.5)} opacity={0.6}>
        {Array.from({length: 8}, (_, i) => <rect key={i} x={cam.x * 0.5 - 1400 + i * 360} y={-1200} width={300} height={2600} fill={i % 2 ? '#2a2016' : '#241a12'} />)}
      </g>
      <g transform={layerT(cam, 1)}>
        {anchors.map((a, i) =>
          anchors.slice(i + 1, i + 4).map((b, j) => {
            const m = pull({x: (a.x + b.x) / 2, y: (a.y + b.y) / 2});
            return <path key={`${i}-${j}`} d={`M${f1(a.x)},${f1(a.y)} Q${f1(m.x)},${f1(m.y)} ${f1(b.x)},${f1(b.y)}`} stroke="#e8e4d8" strokeWidth={1.6} fill="none" opacity={0.45} />;
          }),
        )}
        {children}
      </g>
    </g>
  );
};

export const LeafWipe: React.FC<{u: number; c?: string}> = ({u, c = '#2e4a22'}) => {
  if (u <= 0 || u >= 1) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1080} height={1920}>
        {Array.from({length: 16}, (_, i) => {
          const x = -800 + u * 2700 + (hash1(i * 3) - 0.5) * 700;
          const y = hash1(i * 7) * 1920;
          return <Leaf key={i} x={x} y={y} s={6 + hash1(i * 11) * 5} a={-30 + hash1(i) * 60 + u * 90} c={mixColor(c, '#0a1408', hash1(i * 5) * 0.5)} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
export const DustWipe: React.FC<{u: number}> = ({u}) => {
  if (u <= 0 || u >= 1) return null;
  const k = Math.sin(Math.PI * u);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1080} height={1920}>
        {Array.from({length: 22}, (_, i) => {
          const x = -600 + u * 2300 + (hash1(i * 3) - 0.5) * 600;
          const y = hash1(i * 7) * 1920;
          return <ellipse key={i} cx={x} cy={y} rx={260 + hash1(i) * 200} ry={120 + hash1(i * 2) * 80} fill="#d8b888" opacity={0.5 * k} />;
        })}
        <rect width={1080} height={1920} fill="#d8b888" opacity={0.6 * clamp(k * 1.4 - 0.4)} />
      </svg>
    </AbsoluteFill>
  );
};
