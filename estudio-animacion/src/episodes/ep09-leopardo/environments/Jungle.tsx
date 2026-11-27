// SELVA (día o noche, `night` 0…1): profundidad atmosférica en capas — troncos lejanos entre la
// niebla, árboles medios con lianas, follaje de hojas grandes que se mecen, suelo con helechos y
// primer plano oscuro de hojas que barre el encuadre. Incluye la luz moteada que se desplaza.
import React from 'react';
import {hash1, mixColor} from '../../../engine/math';
import {Cam, layerT} from '../animation/CameraSystem';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
const nightC = (c: string, night: number, k = 0.75) => mixColor(c, '#0a1430', night * k);

/** Hoja grande lanceolada (platanera / Monstera estilizada). */
export const BigLeaf: React.FC<{x: number; y: number; s: number; rot: number; c: string; vein?: string}> = ({x, y, s, rot, c, vein}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${f1(s)})`}>
    <path d="M0,0 Q40,-30 120,-20 Q180,-6 220,0 Q180,8 120,22 Q40,32 0,0Z" fill={c} />
    <path d="M0,0 L216,0" stroke={vein ?? mixColor(c, '#ffffff', 0.25)} strokeWidth={3} opacity={0.6} />
    {[40, 80, 120, 160].map((k) => (
      <path key={k} d={`M${k},0 l20,-16 M${k},0 l20,16`} stroke={vein ?? mixColor(c, '#ffffff', 0.2)} strokeWidth={2} opacity={0.45} />
    ))}
  </g>
);

const Fern: React.FC<{x: number; s: number; c: string; t: number; seed: number}> = ({x, s, c, t, seed}) => (
  <g transform={`translate(${f1(x)} 0) scale(${f1(s)})`}>
    {[-1.1, -0.6, -0.15, 0.3, 0.8].map((a, i) => {
      const sw = Math.sin(t * 0.9 + seed + i) * 0.06;
      return (
        <g key={i} transform={`rotate(${f1(((a + sw) * 180) / Math.PI)})`}>
          <path d="M0,0 Q10,-60 0,-120" stroke={c} strokeWidth={4} fill="none" />
          {Array.from({length: 8}, (_, k) => (
            <ellipse key={k} cx={(k % 2 ? 9 : -9) + 2} cy={-14 - k * 13} rx={12 - k} ry={4} fill={c} transform={`rotate(${k % 2 ? -25 : 25} ${(k % 2 ? 9 : -9) + 2} ${-14 - k * 13})`} />
          ))}
        </g>
      );
    })}
  </g>
);

export const JungleBack: React.FC<{cam: Cam; t: number; night: number}> = ({cam, t, night}) => {
  const sky = nightC('#cfe8c8', night, 0.92);
  const fog = nightC('#9cc4a0', night, 0.85);
  return (
    <g>
      <defs>
        <linearGradient id="jg9sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={nightC('#e8f4d8', night, 0.95)} />
          <stop offset="1" stopColor={sky} />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#jg9sky)" />
      {/* troncos lejanos entre la niebla */}
      <g transform={layerT(cam, 0.25)}>
        {Array.from({length: 22}, (_, i) => {
          const x = -2600 + i * 250 + hash1(i) * 120;
          const w = 30 + hash1(i * 3) * 50;
          return <rect key={i} x={x} y={-2400} width={w} height={2600} fill={mixColor(fog, '#2a3a2a', 0.25)} opacity={0.55} />;
        })}
        <rect x={-4000} y={-200} width={8000} height={1200} fill={fog} opacity={0.6} />
      </g>
      {/* árboles medios con lianas y copas */}
      <g transform={layerT(cam, 0.5)}>
        {Array.from({length: 12}, (_, i) => {
          const x = -2400 + i * 440 + hash1(i * 5) * 160;
          const w = 70 + hash1(i * 7) * 70;
          const c = nightC(mixColor('#4a3a24', '#2a4a2a', hash1(i)), night);
          return (
            <g key={i}>
              <path d={`M${x},200 L${x + w * 0.15},-2400 L${x + w * 0.85},-2400 L${x + w},200Z`} fill={c} />
              <path d={`M${x + w * 0.5},-1600 Q${f1(x + w * 0.5 + 60 + Math.sin(t * 0.5 + i) * 20)},-900 ${f1(x + w * 0.5 + 20)},-200`} stroke={nightC('#3a5a2a', night)} strokeWidth={6} fill="none" />
            </g>
          );
        })}
        {Array.from({length: 26}, (_, i) => (
          <circle key={`c${i}`} cx={-2600 + i * 210 + hash1(i * 2) * 100} cy={-1500 + hash1(i * 4) * 300} r={180 + hash1(i * 6) * 120} fill={nightC(['#3f7a3a', '#2f6a34', '#4a8a40'][i % 3], night)} />
        ))}
        <rect x={-4000} y={100} width={8000} height={1500} fill={nightC('#3a5a2a', night)} />
      </g>
    </g>
  );
};

/** Suelo de la selva (plano del personaje) con helechos y follaje bajo. */
export const JungleGround: React.FC<{cam: Cam; t: number; night: number; children?: React.ReactNode}> = ({cam, t, night, children}) => (
  <g transform={layerT(cam, 1)}>
    <rect x={-4000} y={-6} width={8000} height={2000} fill={nightC('#4a5a2a', night)} />
    <path d="M-4000,30 L4000,30" stroke={nightC('#5a6a34', night)} strokeWidth={30} opacity={0.6} />
    {Array.from({length: 30}, (_, i) => (
      <Fern key={i} x={-2600 + i * 180 + hash1(i * 3) * 80} s={0.8 + hash1(i) * 0.7} c={nightC(['#4a8a3a', '#3a7a34', '#5a9a40'][i % 3], night)} t={t} seed={i} />
    ))}
    {Array.from({length: 18}, (_, i) => {
      const sw = Math.sin(t * 0.8 + i) * 5;
      return <BigLeaf key={`l${i}`} x={-2500 + i * 300 + hash1(i * 7) * 120} y={-10} s={0.9 + hash1(i * 2) * 0.6} rot={-150 + hash1(i * 5) * 120 + sw} c={nightC(['#3f8a3a', '#2f7a30', '#4a9a44'][i % 3], night)} />;
    })}
    {children}
  </g>
);

/** Primer plano: hojas grandes oscuras que pasan delante de la cámara (parallax rápido). */
export const JungleFront: React.FC<{cam: Cam; t: number; night: number; k?: number}> = ({cam, t, night, k = 1}) => (
  <g transform={layerT(cam, 1.5)} opacity={k}>
    {Array.from({length: 10}, (_, i) => {
      const x = -2600 + i * 560 + hash1(i) * 200;
      const sw = Math.sin(t * 0.7 + i * 1.3) * 6;
      return (
        <g key={i}>
          {[0, 1, 2].map((j) => (
            <BigLeaf key={j} x={x} y={260 + j * 40} s={2.2 + hash1(i * 3 + j) * 0.8} rot={-120 + j * 30 + sw} c={nightC(mixColor('#1f4a20', '#0a1a0a', 0.3), night, 0.6)} vein={nightC('#2f5a2a', night, 0.6)} />
          ))}
        </g>
      );
    })}
  </g>
);

/** Luz moteada que se desplaza sobre el plano del personaje (sombras del dosel). */
export const Dapple: React.FC<{cam: Cam; t: number; k: number; x0: number; x1: number; y0: number; y1: number}> = ({cam, t, k, x0, x1, y0, y1}) =>
  k > 0.01 ? (
    <g transform={layerT(cam, 1)} opacity={k} style={{mixBlendMode: 'multiply'}}>
      {Array.from({length: 26}, (_, i) => {
        const x = x0 + hash1(i * 3) * (x1 - x0) + Math.sin(t * 0.35 + i) * 50 + t * 6;
        const y = y0 + hash1(i * 7) * (y1 - y0) + Math.cos(t * 0.3 + i) * 20;
        return <ellipse key={i} cx={f1(x)} cy={f1(y)} rx={40 + hash1(i) * 60} ry={20 + hash1(i * 2) * 26} fill="#2a2a10" opacity={0.28} />;
      })}
    </g>
  ) : null;
