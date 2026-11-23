// ESCENARIO — OCÉANO ABIERTO Y PROFUNDO (sin fondo visible). La profundidad `depth` (0 superficie … 1
// zona sin luz) controla el color y la luz que llega de arriba. Capas: gradiente atmosférico, haces
// difusos (solo con poca profundidad), siluetas lejanas (medusas, cardúmenes) en bruma, nieve marina
// en tres planos de parallax, niebla de distancia y, opcionalmente, un foco de luz (equipo científico).
// Sin bioluminiscencia atribuida al calamar. Desenfoques en coordenadas de pantalla.
import React from 'react';
import {clamp, hash1, mixColor} from '../../../engine/math';
import {Cam, layerT, toScreen} from '../../../studio2';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
const Blur: React.FC<{id: string; r: number}> = ({id, r}) => (
  <filter id={id} filterUnits="userSpaceOnUse" x={-200} y={-200} width={1480} height={2320}>
    <feGaussianBlur stdDeviation={r} />
  </filter>
);

export type OceanOpts = {depth?: number; spot?: {x: number; y: number; r: number; k: number} | null; murk?: number};

export const OceanBack: React.FC<{cam: Cam; t: number; children?: React.ReactNode} & OceanOpts> = ({cam, t, children, depth = 0.8, spot = null}) => {
  const d = clamp(depth);
  const topC = mixColor('#2a7aa8', '#06142a', Math.pow(d, 0.7));
  const midC = mixColor('#0e3a5a', '#030a18', d);
  const botC = mixColor('#06142a', '#010308', d);
  const ray = clamp(1 - d * 1.6);
  const ss = spot ? toScreen(cam, spot.x, spot.y) : null;
  return (
    <g>
      <defs>
        <linearGradient id="ocW" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={topC} />
          <stop offset="0.5" stopColor={midC} />
          <stop offset="1" stopColor={botC} />
        </linearGradient>
        <linearGradient id="ocRay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfe8ff" stopOpacity={0.4} />
          <stop offset="1" stopColor="#bfe8ff" stopOpacity={0} />
        </linearGradient>
        <radialGradient id="ocSpot" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#d8ecff" stopOpacity={0.5} />
          <stop offset="0.6" stopColor="#5a9ad8" stopOpacity={0.12} />
          <stop offset="1" stopColor="#5a9ad8" stopOpacity={0} />
        </radialGradient>
        <Blur id="ocFar" r={10} />
        <Blur id="ocRays" r={26} />
      </defs>
      <rect width={1080} height={1920} fill="url(#ocW)" />
      {ray > 0.01 && (
        <g filter="url(#ocRays)"><g transform={layerT(cam, 0.12)} opacity={0.8 * ray}>
          {Array.from({length: 6}, (_, i) => {
            const x = cam.x * 0.12 - 500 + i * 220 + Math.sin(t * 0.3 + i) * 30;
            return <path key={i} d={`M${f1(x + 220)},${f1(cam.y * 0.12 - 1600)} L${f1(x + 310)},${f1(cam.y * 0.12 - 1600)} L${f1(x - 60)},${f1(cam.y * 0.12 + 1200)} L${f1(x - 220)},${f1(cam.y * 0.12 + 1200)}Z`} fill="url(#ocRay)" opacity={0.4 + 0.25 * Math.sin(t * 0.5 + i * 1.7)} />;
          })}
        </g></g>
      )}
      {/* siluetas lejanas en bruma: medusas y un cardumen difuso */}
      <g filter="url(#ocFar)"><g transform={layerT(cam, 0.25)} opacity={0.35 + 0.25 * (1 - d)}>
        {Array.from({length: 6}, (_, i) => {
          const x = cam.x * 0.25 - 900 + i * 360 + hash1(i) * 120;
          const y = cam.y * 0.25 - 800 + hash1(i * 3) * 1600 + Math.sin(t * 0.3 + i) * 20;
          return (
            <g key={`j${i}`}>
              <path d={`M${f1(x - 40)},${f1(y)} Q${f1(x)},${f1(y - 50)} ${f1(x + 40)},${f1(y)}Z`} fill="#4a7aa0" />
              {[0, 1, 2].map((k) => <path key={k} d={`M${f1(x - 20 + k * 20)},${f1(y)} q${f1(Math.sin(t + k) * 8)},40 0,90`} stroke="#4a7aa0" strokeWidth={3} fill="none" />)}
            </g>
          );
        })}
        {Array.from({length: 24}, (_, i) => {
          const x = cam.x * 0.25 + ((hash1(i * 5) * 1400 + t * 30) % 1400) - 700;
          const y = cam.y * 0.25 + 500 + hash1(i * 9) * 160 + Math.sin(t + i) * 10;
          return <path key={`f${i}`} d={`M${f1(x)},${f1(y)} q-8,-4 -16,0 q8,4 16,0`} fill="#5a8ab0" />;
        })}
      </g></g>
      {/* nieve marina (tres planos) */}
      {[0.45, 0.7, 0.9].map((k, li) => (
        <g key={`ms${li}`} transform={layerT(cam, k)} opacity={0.35 + li * 0.15}>
          {Array.from({length: 40}, (_, i) => (
            <circle key={i} cx={cam.x * k + ((hash1(i * 3 + li * 50) * 2400 + Math.sin(t * 0.3 + i) * 20) % 2400) - 1200} cy={cam.y * k + (((hash1(i * 7 + li * 50) * 3000 + t * (8 + li * 4)) % 3000) - 1500)} r={0.8 + hash1(i + li) * (1 + li)} fill="#cfe4f0" opacity={0.55} />
          ))}
        </g>
      ))}
      {/* foco de luz del equipo científico */}
      {spot && ss && spot.k > 0.01 && <ellipse cx={ss.x} cy={ss.y} rx={spot.r * cam.zoom} ry={spot.r * cam.zoom * 1.3} fill="url(#ocSpot)" opacity={spot.k} />}
      <g transform={layerT(cam, 1)}>{children}</g>
      {/* niebla de distancia (oscurece todo un poco más en profundidad) */}
      <rect width={1080} height={1920} fill="#020610" opacity={0.25 * d} />
    </g>
  );
};

export const OceanFront: React.FC<{cam: Cam; t: number}> = ({cam, t}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <g transform={layerT(cam, 1.2)}>
      {Array.from({length: 28}, (_, i) => (
        <circle key={i} cx={cam.x * 1.2 + ((hash1(i * 11) * 1800 + Math.sin(t * 0.5 + i) * 30) % 1800) - 900} cy={cam.y * 1.2 + (((hash1(i * 13) * 2400 + t * (14 + hash1(i * 2) * 10)) % 2400) - 1200)} r={1.4 + hash1(i * 5) * 2.6} fill="#e0eef8" opacity={0.45} />
      ))}
    </g>
  </svg>
);
