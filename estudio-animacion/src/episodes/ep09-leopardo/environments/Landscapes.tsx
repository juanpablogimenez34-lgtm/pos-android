// PAISAJES DE ADAPTACIÓN Y AMENAZA: montaña rocosa, región árida y paisaje fragmentado
// (el bosque da paso a tocones, cultivos, una carretera y una valla de forma progresiva).
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';
import {Cam, layerT} from '../animation/CameraSystem';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export const Mountains: React.FC<{cam: Cam; t: number}> = ({cam, t}) => (
  <g>
    <defs>
      <linearGradient id="mt9" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8ab8e0" />
        <stop offset="1" stopColor="#e8eef0" />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#mt9)" />
    <g transform={layerT(cam, 0.12)}>
      {Array.from({length: 7}, (_, i) => {
        const x = -2400 + i * 760;
        const h = 900 + hash1(i) * 600;
        return (
          <g key={i}>
            <path d={`M${x - 500},200 L${x},${-h} L${x + 520},200Z`} fill="#8a9ab0" />
            <path d={`M${x - 130},${-h + 260} L${x},${-h} L${x + 140},${-h + 270} L${x + 50},${-h + 210} L${x - 30},${-h + 250}Z`} fill="#f4f8ff" />
          </g>
        );
      })}
    </g>
    <g transform={layerT(cam, 0.4)}>
      {Array.from({length: 9}, (_, i) => (
        <path key={i} d={`M${-2600 + i * 600},300 L${-2400 + i * 600},${-300 - hash1(i * 3) * 260} L${-2100 + i * 600},${-200 - hash1(i * 5) * 200} L${-1900 + i * 600},300Z`} fill="#6a7060" />
      ))}
      {Array.from({length: 30}, (_, i) => (
        <path key={`p${i}`} d={`M${-2600 + i * 180},${-40 - hash1(i) * 120} l-22,60 l44,0Z`} fill="#2f4a34" />
      ))}
      <rect x={-4000} y={60} width={8000} height={1500} fill="#7a7a66" />
    </g>
    <g transform={layerT(cam, 0.75)} opacity={0.6}>
      {Array.from({length: 5}, (_, i) => (
        <ellipse key={i} cx={-2000 + i * 900 + ((t * 20) % 900)} cy={-200} rx={600} ry={80} fill="#ffffff" opacity={0.4} />
      ))}
    </g>
  </g>
);

export const Arid: React.FC<{cam: Cam; t: number}> = ({cam}) => (
  <g>
    <defs>
      <linearGradient id="ar9" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e8b07a" />
        <stop offset="1" stopColor="#fbe2b8" />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#ar9)" />
    <g transform={layerT(cam, 0.2)}>
      {Array.from({length: 6}, (_, i) => (
        <path key={i} d={`M${-2400 + i * 900},200 L${-2300 + i * 900},${-400 - hash1(i) * 200} L${-1800 + i * 900},${-420 - hash1(i * 2) * 200} L${-1700 + i * 900},200Z`} fill="#c8805a" />
      ))}
    </g>
    <g transform={layerT(cam, 0.5)}>
      {Array.from({length: 14}, (_, i) => (
        <g key={i} transform={`translate(${-2600 + i * 380 + hash1(i) * 100} 0)`}>
          <path d="M-90,40 Q-80,-120 0,-140 Q90,-120 100,40Z" fill={['#b8603a', '#a85a34', '#c8704a'][i % 3]} />
          <path d="M-60,-60 L60,-70" stroke="#8a4a2a" strokeWidth={6} opacity={0.5} />
        </g>
      ))}
      <rect x={-4000} y={30} width={8000} height={1500} fill="#d8a070" />
      {Array.from({length: 20}, (_, i) => (
        <circle key={`s${i}`} cx={-2600 + i * 260 + hash1(i * 4) * 100} cy={60 + hash1(i * 7) * 80} r={14 + hash1(i) * 10} fill="#8a8a4a" />
      ))}
    </g>
  </g>
);

/** Bosque que se fragmenta con `k` 0…1: los árboles desaparecen dejando tocones, cultivos, carretera, valla. */
export const Fragmented: React.FC<{cam: Cam; t: number; k: number}> = ({cam, t, k}) => {
  const sky = mixColor('#a8c8d8', '#d8c8a8', k * 0.6);
  return (
    <g>
      <rect width={1080} height={1920} fill={sky} />
      <g transform={layerT(cam, 0.3)}>
        {Array.from({length: 30}, (_, i) => {
          const x = -2600 + i * 180 + hash1(i * 3) * 60;
          const gone = clamp(k * 1.4 - hash1(i * 5) * 0.6);
          const s = 1 - gone;
          return s > 0.02 ? (
            <g key={i} transform={`translate(${x} 0) scale(1 ${f1(s)})`}>
              <rect x={-14} y={-260} width={28} height={260} fill="#4a3a28" />
              <circle cx={0} cy={-320} r={110} fill={['#3f7a34', '#2f6a2c', '#4a8a3c'][i % 3]} />
            </g>
          ) : (
            <rect key={i} x={x - 16} y={-30} width={32} height={30} fill="#7a5a3a" />
          );
        })}
        <rect x={-4000} y={0} width={8000} height={1400} fill={mixColor('#5a7a3a', '#b8a060', k)} />
        {/* cultivos en franjas */}
        <g opacity={clamp(k * 1.6 - 0.3)}>
          {Array.from({length: 10}, (_, i) => (
            <path key={i} d={`M-3000,${40 + i * 30} L3000,${40 + i * 30}`} stroke={i % 2 ? '#c8b060' : '#8aa04a'} strokeWidth={14} />
          ))}
        </g>
        {/* carretera y valla */}
        <g opacity={clamp(k * 2 - 0.9)}>
          <path d="M-3000,380 L3000,320" stroke="#4a4a4a" strokeWidth={70} />
          <path d="M-3000,380 L3000,320" stroke="#e8e0a0" strokeWidth={4} strokeDasharray="40 30" />
          {Array.from({length: 40}, (_, i) => (
            <rect key={`f${i}`} x={-2600 + i * 140} y={240 - i * 1.2} width={6} height={50} fill="#5a4a3a" />
          ))}
          <path d="M-2600,250 L3000,190 M-2600,270 L3000,210" stroke="#7a6a5a" strokeWidth={2} />
        </g>
      </g>
      <g transform={layerT(cam, 0.65)} opacity={0.4 * k}>
        {Array.from({length: 4}, (_, i) => (
          <ellipse key={i} cx={-1500 + i * 900 + ((t * 30) % 900)} cy={-150} rx={500} ry={60} fill="#e8d8b8" />
        ))}
      </g>
    </g>
  );
};

export const lerpK = lerp;
