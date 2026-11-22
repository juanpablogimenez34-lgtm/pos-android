// OCÉANO CINEMATOGRÁFICO v2 (sin fondos de solo gradiente):
//  · columna de agua con luz que entra desde arriba a la derecha (misma dirección que la luz clave del
//    personaje) y se apaga con la profundidad;
//  · rayos volumétricos suaves (desenfocados), cáusticas tenues en la parte alta;
//  · capas de agua: brumas a varias distancias con parallax;
//  · siluetas ambientales discretas y lejanas (un banco de peces, un talud) para dar escala;
//  · partículas en 3 profundidades: lejanas nítidas y pequeñas, medias, cercanas grandes y
//    desenfocadas (profundidad de campo);
//  · etalonaje azul petróleo, contraste y viñeta.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {hash1} from '../../../engine/math';
import {Cam, layerT} from '../../../studio2';
import {SoftFilter} from '../character/filters';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export const OceanV2Back: React.FC<{cam: Cam; t: number; depth: number; children?: React.ReactNode; frame?: {x: number; y: number; w: number; h: number}}> = ({cam, t, depth, children, frame = {x: 0, y: 0, w: 1080, h: 1920}}) => {
  const k = 1 - depth;
  return (
    <g>
      <defs>
        <radialGradient id="o2sky" cx="0.78" cy="-0.08" r="1.25">
          <stop offset="0" stopColor="#3f9fc0" stopOpacity={0.9 * k + 0.1} />
          <stop offset="0.28" stopColor="#14557a" />
          <stop offset="0.62" stopColor="#0a2c4c" />
          <stop offset="1" stopColor="#030b18" />
        </radialGradient>
        <linearGradient id="o2ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d6f6ff" stopOpacity={0.55} />
          <stop offset="0.7" stopColor="#d6f6ff" stopOpacity={0.05} />
          <stop offset="1" stopColor="#d6f6ff" stopOpacity={0} />
        </linearGradient>
        <SoftFilter id="o2soft" radius={26} />
        <SoftFilter id="o2haze" radius={60} />
        <SoftFilter id="o2far" radius={5} />
      </defs>
      <rect x={frame.x} y={frame.y} width={frame.w} height={frame.h} fill="url(#o2sky)" />
      {/* talud y formas muy lejanas (escala) */}
      <g transform={layerT(cam, 0.18)} opacity={0.35} filter="url(#o2far)">
        <path d={`M${f1(cam.x * 0.18 - 2200)},900 Q${f1(cam.x * 0.18 - 1400)},420 ${f1(cam.x * 0.18 - 600)},640 T${f1(cam.x * 0.18 + 900)},520 T${f1(cam.x * 0.18 + 2400)},760 L${f1(cam.x * 0.18 + 2400)},2600 L${f1(cam.x * 0.18 - 2200)},2600Z`} fill="#071a2e" />
      </g>
      {/* rayos volumétricos */}
      <g transform={layerT(cam, 0.12)} filter="url(#o2soft)" opacity={0.75 * k + 0.15}>
        {Array.from({length: 7}, (_, i) => {
          const x = cam.x * 0.12 - 500 + i * 300 + Math.sin(t * 0.22 + i * 1.7) * 40;
          const w = 60 + hash1(i * 3) * 110;
          return <path key={i} d={`M${f1(x + 300)},-1700 L${f1(x + 300 + w)},-1700 L${f1(x - 520 + w * 1.6)},1500 L${f1(x - 700)},1500Z`} fill="url(#o2ray)" opacity={0.25 + 0.3 * (0.5 + 0.5 * Math.sin(t * 0.5 + i * 2.1))} />;
        })}
      </g>
      {/* cáusticas tenues arriba */}
      <g transform={layerT(cam, 0.25)} opacity={0.18 * k}>
        {Array.from({length: 9}, (_, i) => (
          <path key={i} d={`M${f1(cam.x * 0.25 - 1500)},${f1(-1300 + i * 46)} ${Array.from({length: 14}, (_, j) => `Q${f1(cam.x * 0.25 - 1400 + j * 230)},${f1(-1300 + i * 46 + Math.sin(t * 1.1 + j + i) * 28)} ${f1(cam.x * 0.25 - 1285 + j * 230)},${f1(-1300 + i * 46)}`).join(' ')}`} stroke="#e8fbff" strokeWidth={2} fill="none" />
        ))}
      </g>
      {/* banco de peces lejano, discreto */}
      <g transform={layerT(cam, 0.35)} opacity={0.22}>
        {Array.from({length: 26}, (_, i) => {
          const x = cam.x * 0.35 + 300 + ((hash1(i * 3) * 900 + t * 22) % 900) - 450;
          const y = cam.y * 0.35 - 520 + Math.sin(i * 1.3 + t * 0.6) * 60 + hash1(i * 7) * 140;
          return <path key={i} transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(0.8 + hash1(i) * 0.6)})`} d="M-10,0 Q-2,-4 8,-1 L12,0 L8,1 Q-2,4 -10,0 L-15,-3 L-15,3Z" fill="#06182a" />;
        })}
      </g>
      {/* brumas a varias distancias */}
      {[0.4, 0.6, 0.8].map((d, j) => (
        <g key={d} transform={layerT(cam, d)} filter="url(#o2haze)" opacity={0.5}>
          {Array.from({length: 4}, (_, i) => (
            <ellipse key={i} cx={cam.x * d + ((i * 900 + j * 300 + t * (8 + j * 6)) % 3600) - 1800} cy={cam.y * d - 500 + i * 330 + j * 120} rx={700 + hash1(i + j * 5) * 500} ry={110 + hash1(i * 3 + j) * 90} fill={j === 0 ? '#1d5a7c' : '#164666'} opacity={0.3} />
          ))}
        </g>
      ))}
      {/* partículas lejanas y medias */}
      <g transform={layerT(cam, 0.55)} opacity={0.55}>
        {Array.from({length: 90}, (_, i) => (
          <circle key={i} cx={cam.x * 0.55 + ((hash1(i * 3) * 2600 + t * 7) % 2600) - 1300} cy={cam.y * 0.55 + ((hash1(i * 7) * 3200 - t * 9) % 3200 + 3200) % 3200 - 1600} r={0.8 + hash1(i) * 1.2} fill="#d8eeff" opacity={0.35 + 0.3 * hash1(i * 5)} />
        ))}
      </g>
      <g transform={layerT(cam, 0.85)} opacity={0.6}>
        {Array.from({length: 50}, (_, i) => (
          <circle key={i} cx={cam.x * 0.85 + ((hash1(i * 11) * 2400 + t * 12) % 2400) - 1200} cy={cam.y * 0.85 + ((hash1(i * 13) * 3000 - t * 14) % 3000 + 3000) % 3000 - 1500} r={1.4 + hash1(i * 2) * 2} fill="#e4f4ff" opacity={0.3 + 0.3 * hash1(i * 9)} />
        ))}
      </g>
      <g transform={layerT(cam, 1)}>{children}</g>
    </g>
  );
};

/** Capas delanteras: partículas cercanas desenfocadas, etalonaje y viñeta. */
export const OceanV2Front: React.FC<{cam: Cam; t: number; depth: number; focusK?: number}> = ({cam, t, depth, focusK = 1}) => (
  <>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <defs>
        <SoftFilter id="o2dof" radius={9} />
      </defs>
      <g transform={layerT(cam, 1.6)} filter="url(#o2dof)" opacity={0.7 * focusK}>
        {Array.from({length: 16}, (_, i) => (
          <circle key={i} cx={cam.x * 1.6 + ((hash1(i * 17) * 2000 + t * 30) % 2000) - 1000} cy={cam.y * 1.6 + ((hash1(i * 19) * 2600 - t * 22) % 2600 + 2600) % 2600 - 1300} r={6 + hash1(i * 23) * 12} fill="#dff4ff" opacity={0.18 + 0.15 * hash1(i)} />
        ))}
      </g>
    </svg>
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'soft-light', background: `linear-gradient(180deg, rgba(90,210,230,${(0.14 * (1 - depth)).toFixed(3)}) 0%, rgba(10,40,70,0.15) 55%, rgba(2,8,20,${(0.4 * depth + 0.1).toFixed(3)}) 100%)`}} />
    <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse 90% 70% at 55% 42%, rgba(0,0,0,0) 50%, rgba(1,5,14,0.78) 100%)'}} />
  </>
);
