// Fondos del Ep. 06 inspirados en los canales de Xochimilco (sin arrecife tropical):
// - sobre el agua: cielo, chinampas con ahuejotes (sauces columnares), trajinera y lirio acuático
// - bajo el agua: agua verde algo turbia, plantas lejanas desenfocadas, rayos de luz filtrada
// El plano de la superficie está en y = SURF (mundo); la cámara la cruza en la escena 1.
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ParallaxLayer, useCamera, worldToScreen} from '../../../engine/camera';
import {clamp, hash1, mixColor, rng} from '../../../engine/math';
import {useTime} from '../../../engine/useTime';

export const SURF = 2600;

/** Ahuejote: sauce de copa estrecha y alta, típico de las orillas de las chinampas. */
const Ahuejotes: React.FC<{seed: number; y: number; n: number; h: number; color: string; w: number}> = React.memo(({seed, y, n, h, color, w}) => {
  const r = rng(seed);
  const trees = Array.from({length: n}, (_, i) => ({x: -w / 2 + (i + r() * 0.6) * (w / n), s: 0.75 + r() * 0.5}));
  const dark = mixColor(color, '#000000', 0.2);
  return (
    <g>
      {trees.map((t, i) => {
        const H = h * t.s;
        const W = H * 0.17;
        const pts: string[] = [];
        for (let k = 0; k <= 16; k++) {
          const u = k / 16;
          const a = u * Math.PI * 2;
          const yy = y - H * 0.55 - Math.cos(a) * H * 0.45;
          const wob = 1 + 0.12 * Math.sin(a * 5 + i);
          pts.push(`${(t.x + Math.sin(a) * W * wob * (0.55 + 0.45 * Math.sin(Math.PI * (1 - Math.cos(a)) / 2))).toFixed(0)},${yy.toFixed(0)}`);
        }
        return (
          <g key={i}>
            <rect x={t.x - 4 * t.s} y={y - H * 0.18} width={8 * t.s} height={H * 0.18} fill={dark} />
            <polygon points={pts.join(' ')} fill={color} />
            <polygon points={pts.join(' ')} fill={dark} opacity={0.35} transform={`translate(${W * 0.25} 0)`} />
          </g>
        );
      })}
    </g>
  );
});

/** Trajinera (embarcación tradicional) con arco de colores. */
const Trajinera: React.FC<{x: number; y: number; s: number; bob: number}> = ({x, y, s, bob}) => (
  <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
    <path d="M-260,0 L260,0 L230,40 L-230,40Z" fill="#2d5a8a" />
    <rect x={-250} y={-10} width={500} height={14} fill="#e6c13a" />
    <rect x={-200} y={-130} width={14} height={124} fill="#7a4a2a" />
    <rect x={186} y={-130} width={14} height={124} fill="#7a4a2a" />
    <path d="M-220,-120 Q0,-190 220,-120 L220,-96 Q0,-160 -220,-96Z" fill="#d43c5c" />
    {['#e6c13a', '#3aa36e', '#3a7ad4', '#e67a2a'].map((c, i) => (
      <rect key={i} x={-150 + i * 80} y={-150 - (i % 2) * 10} width={64} height={30} rx={6} fill={c} />
    ))}
    <rect x={-210} y={-96} width={420} height={70} fill="#f2e2c0" opacity={0.35} />
  </g>
);

export const AboveWater: React.FC<{k: number}> = ({k}) => {
  const {width, height} = useVideoConfig();
  const t = useTime();
  const ctx = useCamera();
  if (k <= 0.01) return null;
  // la superficie (plano del protagonista) recorta todo lo que está por encima del agua
  const wl = worldToScreen(ctx, 1, {x: 0, y: -SURF}).y;
  if (wl <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: k}}>
      <svg width={width} height={height}>
        <defs>
          <clipPath id="aw-clip">
            <rect x={0} y={0} width={width} height={Math.max(0, wl)} />
          </clipPath>
          <linearGradient id="aw-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7fb6e2" />
            <stop offset="1" stopColor="#f2e6c4" />
          </linearGradient>
          <linearGradient id="aw-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7d9a72" />
            <stop offset="1" stopColor="#4a6a4c" />
          </linearGradient>
        </defs>
        <g clipPath="url(#aw-clip)">
          <rect width={width} height={height} fill="url(#aw-sky)" />
          <ParallaxLayer depth={0.08}>
            <Ahuejotes seed={3} y={-SURF} n={26} h={520} color="#7f9a7a" w={9000} />
          </ParallaxLayer>
          <ParallaxLayer depth={0.18}>
            <rect x={-6000} y={-SURF - 40} width={12000} height={60} fill="#6f8a4c" />
            <Ahuejotes seed={7} y={-SURF - 20} n={20} h={900} color="#5d7f4c" w={9000} />
          </ParallaxLayer>
          <ParallaxLayer depth={0.32}>
            {/* agua del canal con reflejos y lirio acuático */}
            <rect x={-8000} y={-SURF} width={16000} height={2600} fill="url(#aw-water)" />
            {Array.from({length: 26}, (_, i) => (
              <rect key={i} x={-4000 + hash1(i) * 8000 + Math.sin(t * 0.6 + i) * 30} y={-SURF + 30 + hash1(i * 3) * 900} width={180 + hash1(i * 5) * 400} height={6} fill="#e8f2e0" opacity={0.25} />
            ))}
            <Trajinera x={-900} y={-SURF + 8} s={2.2} bob={Math.sin(t * 1.1) * 6} />
          </ParallaxLayer>
          <ParallaxLayer depth={0.55}>
            {Array.from({length: 18}, (_, i) => {
              const x = -3800 + hash1(i * 9) * 7600;
              const y = -SURF + 40 + hash1(i * 4) * 500;
              return (
                <g key={i}>
                  <ellipse cx={x} cy={y} rx={120 + hash1(i) * 120} ry={24} fill="#3f6e2e" />
                  <ellipse cx={x - 30} cy={y - 14} rx={40} ry={26} fill="#5f9a3a" />
                  {i % 3 === 0 && <ellipse cx={x + 20} cy={y - 34} rx={14} ry={18} fill="#b48ad6" />}
                </g>
              );
            })}
          </ParallaxLayer>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Fondo bajo el agua: color turbio por profundidad, plantas lejanas y rayos de luz. */
export const UnderWater: React.FC<{zoom: number; dim: number}> = ({zoom, dim}) => {
  const {width, height} = useVideoConfig();
  const t = useTime();
  const ctx = useCamera();
  const wl = worldToScreen(ctx, 1, {x: 0, y: -SURF}).y;
  const top = clamp(wl, 0, height);
  const blur = clamp((zoom - 0.5) * 2.6, 0, 10);
  const far = (seed: number, y: number, n: number, h: number, col: string) => {
    const r = rng(seed);
    return Array.from({length: n}, (_, i) => {
      const x = -5000 + r() * 10000;
      const hh = h * (0.5 + r());
      const sw = Math.sin(t * 0.5 + i) * hh * 0.04;
      return <path key={i} d={`M${x - 26},${y} Q${x + sw},${y - hh * 0.6} ${x + sw * 2},${y - hh} Q${x + sw + 30},${y - hh * 0.5} ${x + 26},${y}Z`} fill={col} />;
    });
  };
  return (
    <AbsoluteFill>
      <svg width={width} height={height}>
        <defs>
          <linearGradient id="uw-g" gradientUnits="userSpaceOnUse" x1={0} y1={top} x2={0} y2={height + 400}>
            <stop offset="0" stopColor={mixColor('#7fa37a', '#0d1a14', dim)} />
            <stop offset="0.45" stopColor={mixColor('#4f7458', '#0b1611', dim)} />
            <stop offset="1" stopColor={mixColor('#25392c', '#050b08', dim)} />
          </linearGradient>
          <linearGradient id="uw-ray" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f4f2c8" stopOpacity={0.35} />
            <stop offset="1" stopColor="#f4f2c8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect x={0} y={top} width={width} height={height - top + 2} fill="url(#uw-g)" />
        <g style={blur > 0.3 ? {filter: `blur(${blur.toFixed(1)}px)`} : undefined}>
          <ParallaxLayer depth={0.25}>
            <rect x={-8000} y={-40} width={16000} height={3000} fill={mixColor('#3d5640', '#0b1611', dim)} />
            {far(5, 0, 40, 900, mixColor('#4d6a4c', '#0b1611', dim))}
          </ParallaxLayer>
          <ParallaxLayer depth={0.45}>
            {far(9, 20, 30, 1100, mixColor('#3f5c3c', '#0b1611', dim))}
            <rect x={-8000} y={10} width={16000} height={3000} fill={mixColor('#4a4a34', '#0b1611', dim)} />
          </ParallaxLayer>
        </g>
        {/* rayos de sol filtrados desde la superficie */}
        <g style={{mixBlendMode: 'screen'}}>
          {[0, 1, 2, 3, 4].map((i) => {
            const x = width * (0.15 + i * 0.2) + Math.sin(t * 0.2 + i * 1.7) * 60;
            const w = 70 + 50 * hash1(i);
            return <path key={i} d={`M${x},${top} L${x + w},${top} L${x + w * 2.5 - 260},${height} L${x - 260},${height}Z`} fill="url(#uw-ray)" opacity={(0.5 + 0.3 * Math.sin(t * 0.5 + i)) * (1 - dim)} />;
          })}
        </g>
        {/* superficie vista desde abajo */}
        {wl > -20 && wl < height + 20 && (
          <g>
            <rect x={0} y={wl - 3} width={width} height={6} fill="#e9f4e8" opacity={0.8} />
            <path d={Array.from({length: 24}, (_, i) => `M${i * 48 + Math.sin(t * 2 + i) * 6},${wl + 8} q24,${8 + 4 * Math.sin(t * 3 + i)} 48,0`).join('')} stroke="#d8ecd8" strokeWidth={2} fill="none" opacity={0.5} />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

/** Partículas en suspensión (agua ligeramente turbia) que derivan con la corriente. */
export const Suspended: React.FC<{n: number}> = ({n}) => {
  const {width, height} = useVideoConfig();
  const t = useTime();
  const ctx = useCamera();
  const wl = worldToScreen(ctx, 1, {x: 0, y: -SURF}).y;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={width} height={height}>
        {Array.from({length: n}, (_, i) => {
          const sp = 6 + hash1(i * 3) * 14;
          const x = (((hash1(i) * width + t * sp + Math.sin(t * 0.4 + i) * 30) % (width + 40)) + width + 40) % (width + 40) - 20;
          const y = (((hash1(i * 7) * height + Math.sin(t * 0.3 + i * 2) * 40 + t * 3) % (height + 40)) + height + 40) % (height + 40) - 20;
          if (y < wl) return null;
          const r = 1 + hash1(i * 11) * 3;
          return <circle key={i} cx={x} cy={y} r={r} fill="#e7eccd" opacity={0.18 + 0.3 * hash1(i * 13)} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
