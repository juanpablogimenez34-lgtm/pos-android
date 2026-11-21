// ENTORNO SUBMARINO multicapa (parallax): agua con degradado según la profundidad y el tono de la
// escena, rayos de sol que oscilan, cáusticas bajo la superficie y sobre el fondo, siluetas lejanas
// de roca y arrecife, corales blandos y gorgonias que se mecen con la corriente, anémonas, fondo
// arenoso y bancos de peces con aleta caudal animada.
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';
import {Cam, layerT} from '../Camera/cam';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

/** Paleta del agua: tone 0 = aguas someras iluminadas · 1 = profundidad oscura (violeta-azul). */
export function water(tone: number) {
  const k = clamp(tone);
  return {
    top: mixColor('#2fb8d8', '#0a1240', k),
    mid: mixColor('#1679a8', '#070a2a', k),
    bottom: mixColor('#0d3f6e', '#03041a', k),
    fog: mixColor('#3aa6c8', '#10123a', k),
    light: mixColor('#d8fbff', '#8a9cff', k),
  };
}
export type WaterLook = ReturnType<typeof water>;
const haze = (c: string, w: WaterLook, k: number) => mixColor(c, w.fog, k);

// ---------------------------------------------------------------- piezas
export const Fish: React.FC<{x: number; y: number; s: number; t: number; seed: number; dir: 1 | -1; c1: string; c2: string; op?: number}> = ({x, y, s, t, seed, dir, c1, c2, op = 1}) => {
  const tail = Math.sin(t * 9 + seed) * 0.35;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s * dir)} ${f1(s)})`} opacity={op}>
      <path d={`M-30,0 L${f1(-52)},${f1(-14 + tail * 20)} L${f1(-50)},${f1(14 + tail * 20)}Z`} fill={c2} />
      <ellipse cx={0} cy={0} rx={34} ry={14} fill={c1} />
      <path d="M-6,-12 Q4,-24 16,-12" fill={c2} />
      <path d="M-14,4 Q4,12 20,4" stroke="#ffffff" strokeWidth={2} opacity={0.35} fill="none" />
      <circle cx={20} cy={-3} r={3} fill="#0a0a1a" />
      <circle cx={21} cy={-4} r={1} fill="#ffffff" />
    </g>
  );
};

/** Banco de peces que cruza el plano (posición determinista en función del tiempo). */
export const School: React.FC<{t: number; n: number; x0: number; x1: number; y: number; spread: number; speed: number; s: number; c1: string; c2: string; seed: number; op?: number}> = ({t, n, x0, x1, y, spread, speed, s, c1, c2, seed, op = 1}) => {
  const span = x1 - x0;
  const dir: 1 | -1 = speed > 0 ? 1 : -1;
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const off = hash1(i * 3.1 + seed) * span;
        const x = x0 + ((((off + t * speed) % span) + span) % span);
        const yy = y + (hash1(i * 5.7 + seed) - 0.5) * spread + Math.sin(t * 1.4 + i) * 10;
        return <Fish key={i} x={x} y={yy} s={s * (0.8 + 0.4 * hash1(i))} t={t} seed={i + seed} dir={dir} c1={c1} c2={c2} op={op} />;
      })}
    </g>
  );
};

const SoftCoral: React.FC<{x: number; h: number; c: string; t: number; seed: number; w: WaterLook; k: number}> = ({x, h, c, t, seed, w, k}) => {
  const col = haze(c, w, k);
  const branches = 5;
  return (
    <g transform={`translate(${f1(x)} 0)`}>
      {Array.from({length: branches}, (_, i) => {
        const a = -0.7 + (1.4 * i) / (branches - 1);
        const sway = Math.sin(t * 0.9 + seed + i * 0.6) * 0.12;
        const tipX = Math.sin(a + sway) * h * 0.6;
        const tipY = -Math.cos(a * 0.6 + sway) * h;
        return (
          <g key={i}>
            <path d={`M0,0 Q${f1(tipX * 0.3)},${f1(tipY * 0.55)} ${f1(tipX)},${f1(tipY)}`} stroke={col} strokeWidth={h * 0.09} fill="none" strokeLinecap="round" />
            {Array.from({length: 4}, (_, k2) => {
              const u = 0.45 + k2 * 0.18;
              return <circle key={k2} cx={tipX * u} cy={tipY * u} r={h * 0.05} fill={mixColor(col, '#ffffff', 0.25)} />;
            })}
          </g>
        );
      })}
    </g>
  );
};

const SeaFan: React.FC<{x: number; h: number; c: string; t: number; seed: number; w: WaterLook; k: number}> = ({x, h, c, t, seed, w, k}) => {
  const col = haze(c, w, k);
  const sway = Math.sin(t * 0.6 + seed) * 0.08;
  return (
    <g transform={`translate(${f1(x)} 0) rotate(${f1((sway * 180) / Math.PI)})`}>
      {Array.from({length: 9}, (_, i) => {
        const a = -1.0 + (2.0 * i) / 8;
        return <path key={i} d={`M0,0 Q${f1(Math.sin(a) * h * 0.4)},${f1(-h * 0.5)} ${f1(Math.sin(a) * h * 0.75)},${f1(-h * (0.75 + 0.2 * Math.cos(a)))}`} stroke={col} strokeWidth={4} fill="none" />;
      })}
      {Array.from({length: 6}, (_, i) => (
        <path key={`m${i}`} d={`M${f1(-h * 0.5 * (1 - i / 7))},${f1(-h * (0.3 + i * 0.1))} Q0,${f1(-h * (0.38 + i * 0.1))} ${f1(h * 0.5 * (1 - i / 7))},${f1(-h * (0.3 + i * 0.1))}`} stroke={col} strokeWidth={2} fill="none" opacity={0.7} />
      ))}
    </g>
  );
};

const Anemone: React.FC<{x: number; s: number; c: string; t: number; seed: number; w: WaterLook; k: number}> = ({x, s, c, t, seed, w, k}) => {
  const col = haze(c, w, k);
  return (
    <g transform={`translate(${f1(x)} 0) scale(${f1(s)})`}>
      <path d="M-26,0 Q-30,-40 -22,-50 L22,-50 Q30,-40 26,0Z" fill={haze('#c86a8a', w, k)} />
      {Array.from({length: 14}, (_, i) => {
        const a = -1.3 + (2.6 * i) / 13;
        const sw = Math.sin(t * 1.3 + seed + i * 0.5) * 10;
        const tx = Math.sin(a) * 50 + sw;
        const ty = -50 - Math.cos(a) * 55;
        return <path key={i} d={`M${f1(Math.sin(a) * 18)},-48 Q${f1(Math.sin(a) * 40 + sw * 0.5)},${f1(ty + 20)} ${f1(tx)},${f1(ty)}`} stroke={col} strokeWidth={7} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};

const Rock: React.FC<{x: number; w0: number; h: number; c: string; seed: number}> = ({x, w0, h, c, seed}) => {
  const pts = Array.from({length: 9}, (_, i) => {
    const u = i / 8;
    return `${f1(x - w0 / 2 + u * w0)},${f1(-h * Math.sin(u * Math.PI) * (0.75 + 0.35 * hash1(seed + i)))}`;
  });
  return <polygon points={`${f1(x - w0 / 2)},40 ${pts.join(' ')} ${f1(x + w0 / 2)},40`} fill={c} />;
};

// ---------------------------------------------------------------- composición
export type EnvOpts = {cam: Cam; t: number; tone: number; reef?: number; fish?: number; rays?: number; floorY?: number; current?: number};

/** Fondo: agua, rayos de sol, cáusticas superficiales y siluetas lejanas. */
export const WaterBack: React.FC<EnvOpts> = ({cam, t, tone, rays = 1, floorY = 900}) => {
  const w = water(tone);
  return (
    <g>
      <defs>
        <linearGradient id="e8w" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={w.top} />
          <stop offset="0.5" stopColor={w.mid} />
          <stop offset="1" stopColor={w.bottom} />
        </linearGradient>
        <linearGradient id="e8ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={w.light} stopOpacity={0.4} />
          <stop offset="1" stopColor={w.light} stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#e8w)" />
      {/* rayos de sol oscilantes (capa lejana) */}
      {rays > 0.01 && (
        <g transform={layerT(cam, 0.12)} opacity={rays * (1 - tone)}>
          {Array.from({length: 9}, (_, i) => {
            const x = -1600 + i * 420 + Math.sin(t * 0.25 + i) * 60;
            const wd = 90 + hash1(i) * 120;
            return <path key={i} d={`M${f1(x)},-2400 L${f1(x + wd)},-2400 L${f1(x + wd * 3 + 260)},1200 L${f1(x + 200)},1200Z`} fill="url(#e8ray)" opacity={0.35 + 0.35 * Math.sin(t * 0.6 + i * 1.7)} />;
          })}
        </g>
      )}
      {/* cáusticas bajo la superficie */}
      <g transform={layerT(cam, 0.2)} opacity={0.5 * (1 - tone)}>
        {Array.from({length: 7}, (_, i) => (
          <path key={i} d={`M-2500,${f1(-1900 + i * 60)} ${Array.from({length: 12}, (_, k) => `Q${f1(-2300 + k * 420)},${f1(-1900 + i * 60 + Math.sin(t * 1.2 + k + i) * 40)} ${f1(-2100 + k * 420)},${f1(-1900 + i * 60)}`).join(' ')}`} stroke={w.light} strokeWidth={3} fill="none" opacity={0.4} />
        ))}
      </g>
      {/* siluetas lejanas de roca y arrecife (se difuminan en la profundidad) */}
      <defs>
        <linearGradient id="e8base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={haze('#1a4a6a', w, 0.75)} stopOpacity={0} />
          <stop offset="0.25" stopColor={haze('#1a4a6a', w, 0.75)} stopOpacity={1} />
        </linearGradient>
        <linearGradient id="e8sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={haze('#d8b888', w, 0.3)} />
          <stop offset="0.35" stopColor={haze('#9a8060', w, 0.45)} />
          <stop offset="1" stopColor={haze('#3a3a4a', w, 0.6)} />
        </linearGradient>
      </defs>
      <g transform={layerT(cam, 0.3)} opacity={1 - 0.85 * tone}>
        {Array.from({length: 10}, (_, i) => (
          <Rock key={i} x={-2400 + i * 560 + hash1(i) * 200} w0={500 + hash1(i * 3) * 400} h={(300 + hash1(i * 5) * 600) * 1} c={haze('#1a4a6a', w, 0.75)} seed={i} />
        ))}
        <rect x={-4000} y={floorY * 0.3 - 300} width={8000} height={2400} fill="url(#e8base)" />
      </g>
    </g>
  );
};

/** Arrecife medio y fondo cercano con vida (corales, gorgonias, anémonas, peces). */
export const Reef: React.FC<EnvOpts & {children?: React.ReactNode}> = ({cam, t, tone, reef = 1, fish = 1, floorY = 900, children}) => {
  const w = water(tone);
  const coralC = ['#ff7a9a', '#ffb35a', '#c38aff', '#5ae0c8', '#ff5a6a'];
  return (
    <g>
      {fish > 0.01 && (
        <g transform={layerT(cam, 0.45)} opacity={fish}>
          <School t={t} n={22} x0={-2400} x1={2400} y={-500} spread={300} speed={55} s={1.1} c1={haze('#7ec8e8', w, 0.5)} c2={haze('#4a8ab8', w, 0.5)} seed={1} />
          <School t={t} n={14} x0={-2400} x1={2400} y={-1100} spread={300} speed={-40} s={0.9} c1={haze('#9ad8f0', w, 0.55)} c2={haze('#5a9ac0', w, 0.55)} seed={7} />
        </g>
      )}
      {reef > 0.01 && (
        <g transform={layerT(cam, 0.62)} opacity={reef}>
          <g transform={`translate(0 ${f1(floorY * 0.62)})`}>
            {Array.from({length: 12}, (_, i) => (
              <Rock key={i} x={-2000 + i * 380 + hash1(i * 9) * 100} w0={300 + hash1(i) * 200} h={140 + hash1(i * 2) * 160} c={haze('#2a5a6a', w, 0.45)} seed={i + 20} />
            ))}
            {Array.from({length: 26}, (_, i) =>
              i % 3 === 0 ? (
                <SeaFan key={i} x={-2000 + i * 160 + hash1(i * 4) * 80} h={220 + hash1(i) * 160} c={coralC[i % 5]} t={t} seed={i} w={w} k={0.4} />
              ) : (
                <SoftCoral key={i} x={-2000 + i * 160 + hash1(i * 4) * 80} h={160 + hash1(i * 6) * 160} c={coralC[(i + 2) % 5]} t={t} seed={i} w={w} k={0.38} />
              ),
            )}
            <rect x={-4000} y={0} width={8000} height={1400} fill={haze('#9a8a6a', w, 0.55)} />
          </g>
          <School t={t} n={9} x0={-1800} x1={1800} y={floorY * 0.62 - 280} spread={200} speed={70} s={1.5} c1={haze('#ffb35a', w, 0.3)} c2={haze('#ff7a3a', w, 0.3)} seed={13} />
        </g>
      )}
      {children}
      {reef > 0.01 && (
        <g transform={layerT(cam, 1)} opacity={reef}>
          <g transform={`translate(0 ${floorY})`}>
            {Array.from({length: 10}, (_, i) => (
              <Rock key={i} x={-1800 + i * 420 + hash1(i * 11) * 120} w0={260 + hash1(i * 4) * 160} h={90 + hash1(i * 3) * 110} c={haze('#3a6a72', w, 0.25)} seed={i + 40} />
            ))}
            {Array.from({length: 18}, (_, i) =>
              i % 2 ? (
                <Anemone key={i} x={-1800 + i * 220 + hash1(i * 13) * 90} s={1.1 + hash1(i) * 0.6} c={coralC[(i + 1) % 5]} t={t} seed={i} w={w} k={0.2} />
              ) : (
                <SoftCoral key={i} x={-1800 + i * 220 + hash1(i * 13) * 90} h={200 + hash1(i * 5) * 160} c={coralC[i % 5]} t={t} seed={i + 30} w={w} k={0.18} />
              ),
            )}
            <rect x={-4000} y={20} width={8000} height={1400} fill="url(#e8sand)" />
            {/* cáusticas sobre la arena */}
            {Array.from({length: 18}, (_, i) => (
              <path key={`c${i}`} d={`M${f1(-1800 + i * 220)},${f1(60 + (i % 3) * 30)} q60,${f1(-20 + Math.sin(t * 1.4 + i) * 16)} 120,0 t120,0`} stroke={w.light} strokeWidth={4} fill="none" opacity={0.25 * (1 - tone)} />
            ))}
          </g>
        </g>
      )}
    </g>
  );
};
export const lerpTone = lerp;
