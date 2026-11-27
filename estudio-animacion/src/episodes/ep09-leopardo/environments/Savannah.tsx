// SABANA: cielo según la hora (`hour` 0 mediodía · 1 hora dorada · 2 crepúsculo · 3 noche), sol,
// colinas lejanas, acacias, hierba alta en tres capas que se mece con el viento y se aparta al
// paso del leopardo (`partX`), polvo y calima.
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';
import {Cam, layerT} from '../animation/CameraSystem';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

type SkyKey = {top: string; bottom: string; sun: string; land: string; grass: string; shade: number};
const SKY: SkyKey[] = [
  {top: '#7ec0e8', bottom: '#f4e6c0', sun: '#fff6d0', land: '#c8a860', grass: '#d8b860', shade: 0},
  {top: '#e8a860', bottom: '#ffe0a0', sun: '#ffd890', land: '#c89850', grass: '#e0b050', shade: 0.05},
  {top: '#5a4a8a', bottom: '#f09a6a', sun: '#ff8a50', land: '#8a6a4a', grass: '#a87a40', shade: 0.25},
  {top: '#0c1234', bottom: '#2a2a5a', sun: '#e8e8ff', land: '#2a2a3a', grass: '#3a3a40', shade: 0.6},
];
export function skyAt(hour: number): SkyKey {
  const h = clamp(hour, 0, 3);
  const i = Math.min(2, Math.floor(h));
  const k = h - i;
  const a = SKY[i];
  const b = SKY[i + 1];
  return {top: mixColor(a.top, b.top, k), bottom: mixColor(a.bottom, b.bottom, k), sun: mixColor(a.sun, b.sun, k), land: mixColor(a.land, b.land, k), grass: mixColor(a.grass, b.grass, k), shade: lerp(a.shade, b.shade, k)};
}

const Acacia: React.FC<{x: number; s: number; c: string}> = ({x, s, c}) => (
  <g transform={`translate(${f1(x)} 0) scale(${f1(s)})`}>
    <path d="M-6,0 Q-4,-60 -20,-120 M-6,0 Q0,-70 30,-130 M-12,-80 Q-40,-100 -70,-120" stroke={c} strokeWidth={9} fill="none" strokeLinecap="round" />
    <ellipse cx={0} cy={-140} rx={140} ry={26} fill={c} />
    <ellipse cx={-40} cy={-152} rx={80} ry={18} fill={c} />
    <ellipse cx={50} cy={-148} rx={70} ry={16} fill={c} />
  </g>
);

export const SavannahBack: React.FC<{cam: Cam; t: number; hour: number; stars?: number}> = ({cam, t, hour, stars = 0}) => {
  const S = skyAt(hour);
  const sunY = lerp(-1700, -500, clamp(hour / 2.3));
  return (
    <g>
      <defs>
        <linearGradient id="sv9" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={S.top} />
          <stop offset="1" stopColor={S.bottom} />
        </linearGradient>
        <radialGradient id="sv9sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={S.sun} stopOpacity={0.9} />
          <stop offset="0.3" stopColor={S.sun} stopOpacity={0.35} />
          <stop offset="1" stopColor={S.sun} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#sv9)" />
      <g transform={layerT(cam, 0.05)}>
        {stars > 0.01 &&
          Array.from({length: 90}, (_, i) => <circle key={i} cx={-2400 + hash1(i * 3.1) * 4800} cy={-2600 + hash1(i * 5.7) * 1800} r={1.2 + hash1(i) * 2} fill="#ffffff" opacity={stars * (0.4 + 0.5 * Math.sin(t * 2 + i) ** 2)} />)}
        {hour < 2.8 && (
          <g transform={`translate(400 ${f1(sunY)})`} opacity={1 - clamp((hour - 2.2) / 0.6)}>
            <circle r={500} fill="url(#sv9sun)" />
            <circle r={90} fill={S.sun} />
          </g>
        )}
      </g>
      <g transform={layerT(cam, 0.15)}>
        <path d={`M-4000,-60 ${Array.from({length: 16}, (_, i) => `Q${-3750 + i * 500},${-260 - hash1(i) * 200} ${-3500 + i * 500},-80`).join(' ')} L4000,800 L-4000,800Z`} fill={mixColor(S.land, S.bottom, 0.55)} />
      </g>
      <g transform={layerT(cam, 0.35)}>
        {Array.from({length: 9}, (_, i) => (
          <Acacia key={i} x={-2600 + i * 640 + hash1(i * 3) * 200} s={0.9 + hash1(i) * 0.6} c={mixColor(mixColor('#3a3020', S.top, 0.2), '#000000', S.shade)} />
        ))}
        <rect x={-4000} y={0} width={8000} height={1200} fill={mixColor(S.land, S.bottom, 0.3)} />
      </g>
    </g>
  );
};

/** Capa de hierba alta (profundidad `d`), con apertura alrededor de `partX` (el leopardo pasa). */
export const Grass: React.FC<{cam: Cam; t: number; hour: number; d: number; y?: number; n?: number; h?: number; partX?: number; partK?: number; seed?: number}> = ({cam, t, hour, d, y = 0, n = 140, h = 150, partX = 1e9, partK = 0, seed = 0}) => {
  const S = skyAt(hour);
  const c1 = mixColor(S.grass, '#000000', S.shade * 0.5 + (1 - d) * 0.1);
  const c2 = mixColor(c1, '#7a5a20', 0.3);
  return (
    <g transform={layerT(cam, d)}>
      {d >= 0.99 && <rect x={cam.x * d - 5000} y={y - 4} width={10000} height={2000} fill={mixColor(S.land, '#000000', S.shade * 0.4)} />}
      {Array.from({length: n}, (_, i) => {
        const c = cam.x * d;
        const base = (i / n) * 5200 + hash1(i * 3 + seed) * 40;
        const x = ((((base - c) % 5200) + 5200) % 5200) + c - 2600;
        const hh = h * (0.6 + hash1(i * 7 + seed) * 0.7);
        const dist = x - partX;
        const push = partK * Math.exp(-(dist * dist) / (2 * 90 * 90)) * Math.sign(dist || 1) * 60;
        const sw = Math.sin(t * 1.4 + x * 0.008) * 10 + push;
        return <path key={i} d={`M${f1(x)},${y} Q${f1(x + sw * 0.4)},${f1(y - hh * 0.5)} ${f1(x + sw)},${f1(y - hh)}`} stroke={i % 3 ? c1 : c2} strokeWidth={4 + (d - 0.6) * 4} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};
