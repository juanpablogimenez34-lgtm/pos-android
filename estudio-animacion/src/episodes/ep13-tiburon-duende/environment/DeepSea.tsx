// ESCENARIO DE PROFUNDIDAD (procedural, determinista, ligero):
//  · color del agua según la profundidad (turquesa iluminado → azul petróleo → azul abisal → negro
//    azulado, con un velo violeta tenue);
//  · rayos de sol que se desvanecen al descender;
//  · capas con parallax: talud continental lejano, rocas medias, fondo con sedimento (opcional);
//  · nieve marina en dos capas (lenta y lejana / más rápida y cercana), destellos bioluminiscentes;
//  · siluetas de peces lejanos.
// El mundo usa metros "ilustrativos": y = profundidad × M (M unidades por metro) para el descenso.
import React from 'react';
import {clamp, hash1, mixColor} from '../../../engine/math';
import {Cam, layerT} from '../../../studio2';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export type Deep = {top: string; bottom: string; haze: string; ray: number; snow: number};
/** Paleta del agua para una profundidad normalizada d (0 superficie … 1 abismo). */
export function deepPal(d: number): Deep {
  const k = clamp(d);
  const stops = ['#1aa0c0', '#0d5a7a', '#0a2c4a', '#071a30', '#030a16'];
  const pick = (u: number) => {
    const f = clamp(u) * (stops.length - 1);
    const i = Math.min(stops.length - 2, Math.floor(f));
    return mixColor(stops[i], stops[i + 1], f - i);
  };
  return {top: pick(k * 0.92), bottom: pick(Math.min(1, k + 0.18)), haze: mixColor(pick(k), '#3a2a6a', 0.18), ray: clamp(1 - k * 2.2), snow: clamp(0.3 + k)};
}

const Silhouettes: React.FC<{t: number; c: string; n?: number; y?: number; spread?: number}> = ({t, c, n = 7, y = -300, spread = 500}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const x = ((hash1(i * 5) * 3600 + t * (20 + hash1(i) * 30)) % 3600) - 1800;
      const yy = y + (hash1(i * 7) - 0.5) * spread;
      const s = 0.8 + hash1(i * 3) * 1.4;
      return <path key={i} transform={`translate(${f1(x)} ${f1(yy)}) scale(${f1(s)})`} d={`M-30,0 Q-6,-12 22,-4 Q30,0 22,4 Q-6,12 -30,0 L-44,${f1(-9 + Math.sin(t * 6 + i) * 4)} L-44,${f1(9 + Math.sin(t * 6 + i) * 4)}Z`} fill={c} />;
    })}
  </g>
);

const Rocks: React.FC<{c: string; base: number; seed: number; h: number; n?: number}> = ({c, base, seed, h, n = 9}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const x = -2600 + i * 620 + hash1(i + seed) * 200;
      const w = 360 + hash1(i * 3 + seed) * 380;
      const hh = h * (0.5 + hash1(i * 5 + seed));
      return <path key={i} d={`M${f1(x - w / 2)},${base} Q${f1(x - w * 0.3)},${f1(base - hh * 0.7)} ${f1(x - w * 0.05)},${f1(base - hh)} Q${f1(x + w * 0.25)},${f1(base - hh * 0.9)} ${f1(x + w / 2)},${base}Z`} fill={c} />;
    })}
    <rect x={-4000} y={base} width={8000} height={3000} fill={c} />
  </g>
);

/** Agua profunda con capas. `d` profundidad 0…1; `floor` muestra el fondo marino (y = floorY). */
export const DeepSea: React.FC<{cam: Cam; t: number; d: number; floor?: boolean; floorY?: number; fish?: number; children?: React.ReactNode; front?: React.ReactNode; lights?: number}> = ({cam, t, d, floor = false, floorY = 420, fish = 0.6, children, front, lights = 1}) => {
  const P = deepPal(d);
  return (
    <g>
      <defs>
        <linearGradient id="ep13w" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.top} />
          <stop offset="1" stopColor={P.bottom} />
        </linearGradient>
        <linearGradient id="ep13ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dffbff" stopOpacity={0.4} />
          <stop offset="1" stopColor="#dffbff" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="ep13floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mixColor('#3a4a5a', P.top, 0.5)} />
          <stop offset="1" stopColor={P.bottom} />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#ep13w)" />
      {/* rayos de sol (se apagan con la profundidad) */}
      {P.ray > 0.01 && (
        <g transform={layerT(cam, 0.1)} opacity={P.ray}>
          {Array.from({length: 8}, (_, i) => {
            const x = -1500 + i * 420 + Math.sin(t * 0.25 + i) * 50;
            const w = 80 + hash1(i) * 120;
            return <path key={i} d={`M${f1(x)},-3000 L${f1(x + w)},-3000 L${f1(x + w * 3 + 300)},2000 L${f1(x + 200)},2000Z`} fill="url(#ep13ray)" opacity={0.3 + 0.3 * Math.sin(t * 0.6 + i * 1.7)} />;
          })}
        </g>
      )}
      {/* talud lejano */}
      <g transform={layerT(cam, 0.3)} opacity={0.6}>
        <Rocks c={mixColor(P.haze, P.bottom, 0.5)} base={floorY * 0.3 + 300} seed={3} h={700} />
      </g>
      {fish > 0.01 && (
        <g transform={layerT(cam, 0.45)} opacity={fish * 0.6}>
          <Silhouettes t={t} c={mixColor(P.haze, '#000', 0.35)} y={-200} />
        </g>
      )}
      {/* nieve marina lejana */}
      <g transform={layerT(cam, 0.55)} opacity={P.snow * 0.7}>
        {Array.from({length: 60}, (_, i) => {
          const x = ((hash1(i * 3) * 3000 + t * 6) % 3000) - 1500;
          const y = ((hash1(i * 7) * 3000 + t * 14) % 3000) - 1500;
          return <circle key={i} cx={x + cam.x * 0.55} cy={y + cam.y * 0.55} r={1.2 + hash1(i) * 1.8} fill="#d8eaff" opacity={0.35} />;
        })}
      </g>
      {/* destellos bioluminiscentes lejanos */}
      {lights > 0.01 && d > 0.4 && (
        <g transform={layerT(cam, 0.65)} opacity={lights * clamp((d - 0.4) * 2)}>
          {Array.from({length: 14}, (_, i) => {
            const k = Math.pow(Math.max(0, Math.sin(t * 0.9 + i * 2.3)), 8);
            return <circle key={i} cx={cam.x * 0.65 + (hash1(i * 11) - 0.5) * 2400} cy={cam.y * 0.65 + (hash1(i * 13) - 0.5) * 3000} r={3 + 5 * k} fill="#7ff3ff" opacity={0.2 + 0.7 * k} />;
          })}
        </g>
      )}
      {floor && (
        <g transform={layerT(cam, 0.8)}>
          <Rocks c={mixColor(P.bottom, '#1a2a3a', 0.4)} base={floorY * 0.8 + 140} seed={11} h={260} n={10} />
        </g>
      )}
      <g transform={layerT(cam, 1)}>
        {floor && (
          <g>
            <rect x={-4000} y={floorY} width={8000} height={2000} fill="url(#ep13floor)" />
            {Array.from({length: 40}, (_, i) => (
              <ellipse key={i} cx={-2000 + hash1(i * 3) * 4000} cy={floorY + 6 + hash1(i * 5) * 80} rx={6 + hash1(i) * 30} ry={2 + hash1(i * 2) * 5} fill="#a8b8c8" opacity={0.15} />
            ))}
          </g>
        )}
        {children}
      </g>
      {/* nieve marina cercana (más rápida, más grande: parallax) */}
      <g transform={layerT(cam, 1.35)} opacity={P.snow}>
        {Array.from({length: 26}, (_, i) => {
          const x = ((hash1(i * 5) * 2400 + t * 12) % 2400) - 1200;
          const y = ((hash1(i * 9) * 2600 + t * 26) % 2600) - 1300;
          return <circle key={i} cx={x + cam.x * 1.35} cy={y + cam.y * 1.35} r={2 + hash1(i * 3) * 3} fill="#e8f4ff" opacity={0.3} />;
        })}
      </g>
      {front}
    </g>
  );
};
