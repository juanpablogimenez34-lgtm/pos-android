// OCÉANO POR PROFUNDIDAD (1920×1080). Todo lo que cambia con la profundidad sale de aquí: color del agua,
// rayos de sol (solo donde llega la luz), superficie con olas vista desde arriba y desde abajo, vida lejana,
// paredes de la fosa con parallax, lecho de sedimentos y conos de luz del sumergible.
// Geometría estática memorizada; animación determinista por tiempo.
import React from 'react';
import {clamp, hash1, lerp, mixColor, smoothPath, smoothstep} from '../../../engine/math';
import {Camera, ParallaxLayer} from '../../../engine/camera';
import {sunlight} from '../data/depth';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);
const memo = new Map<string, string>();
const cached = (k: string, fn: () => string) => {
  let v = memo.get(k);
  if (v === undefined) {
    v = fn();
    memo.set(k, v);
  }
  return v;
};
export const W = 1920;
export const H = 1080;

// ------------------------------------------------------------------ paleta por profundidad
const RAMP: [number, string, string][] = [
  [0, '#45c4dc', '#1a86b6'], [80, '#2aa4c8', '#126ea2'], [200, '#13689a', '#0a3f6c'], [450, '#0b4270', '#06264a'],
  [750, '#072748', '#041530'], [1000, '#04142c', '#020a18'], [2000, '#030b1c', '#01050e'], [4000, '#06061a', '#02020a'],
  [6000, '#04040f', '#010106'], [11000, '#020208', '#000003'],
];
export function waterColors(d: number) {
  let i = 0;
  while (i < RAMP.length - 2 && d > RAMP[i + 1][0]) i++;
  const k = smoothstep(RAMP[i][0], RAMP[i + 1][0], d);
  return {top: mixColor(RAMP[i][1], RAMP[i + 1][1], k), bot: mixColor(RAMP[i][2], RAMP[i + 1][2], k)};
}
/** Fondo de agua en pantalla. `lift` aclara la parte superior (mirando hacia la superficie). */
export const WaterBG: React.FC<{d: number; lift?: number}> = ({d, lift = 0}) => {
  const c = waterColors(d);
  const id = `wbg${Math.round(d / 25)}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mixColor(c.top, '#bff4ff', lift * 0.35)} />
          <stop offset="1" stopColor={c.bot} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id})`} />
    </g>
  );
};
/** Rayos de sol (pantalla); se desvanecen con la profundidad y desaparecen en la oscuridad total. */
export const SunRays: React.FC<{d: number; t: number; k?: number; skew?: number}> = ({d, t, k = 1, skew = 0.18}) => {
  const a = sunlight(d) * k;
  if (a < 0.01) return null;
  return (
    <g opacity={a}>
      <defs>
        <linearGradient id="sun-ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8fbff" stopOpacity={0.42} />
          <stop offset="1" stopColor="#e8fbff" stopOpacity={0} />
        </linearGradient>
      </defs>
      {Array.from({length: 9}, (_, i) => {
        const x0 = 120 + i * 210 + Math.sin(t * 0.25 + i * 1.7) * 50;
        const w0 = 30 + hash1(i * 3) * 50;
        const w1 = 160 + hash1(i * 5) * 160;
        const len = 900 + hash1(i * 7) * 500;
        return <path key={i} d={`M${f1(x0)} -20L${f1(x0 + w0)} -20L${f1(x0 + w0 + len * skew + w1 / 2)} ${f1(len)}L${f1(x0 + len * skew - w1 / 2)} ${f1(len)}Z`} fill="url(#sun-ray)" opacity={0.35 + 0.4 * Math.sin(t * 0.6 + i * 2.1) ** 2} />;
      })}
    </g>
  );
};

// ------------------------------------------------------------------ superficie (mundo: y = 0 es el nivel del mar)
export const waveY = (x: number, t: number) => Math.sin(x * 0.0035 + t * 1.1) * 16 + Math.sin(x * 0.009 - t * 1.6) * 7 + Math.sin(x * 0.0013 + t * 0.4) * 12;
export const Surface: React.FC<{t: number; cam: Camera}> = ({t, cam}) => {
  const x0 = cam.x - 1400 / cam.zoom;
  const x1 = cam.x + 1400 / cam.zoom;
  const pts: V[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = lerp(x0, x1, i / 60);
    pts.push({x, y: waveY(x, t)});
  }
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${f1(p.x)} ${f1(p.y)}`).join('');
  return (
    <g>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b78b8" />
          <stop offset="0.6" stopColor="#8fc4e6" />
          <stop offset="1" stopColor="#f4dca8" />
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6d8" stopOpacity={1} />
          <stop offset="0.25" stopColor="#ffd890" stopOpacity={0.6} />
          <stop offset="1" stopColor="#ffd890" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="seaTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a8fc0" />
          <stop offset="1" stopColor="#0d5f94" />
        </linearGradient>
      </defs>
      {/* cielo con horizonte cálido */}
      <rect x={x0} y={-1600} width={x1 - x0} height={1600} fill="url(#sky)" />
      <circle cx={cam.x + 380} cy={-260} r={260} fill="url(#sun)" />
      {Array.from({length: 7}, (_, i) => (
        <ellipse key={i} cx={x0 + ((hash1(i * 4) * (x1 - x0) + t * 8) % (x1 - x0))} cy={-380 - hash1(i * 9) * 500} rx={220 + hash1(i) * 260} ry={34 + hash1(i * 2) * 26} fill="#ffffff" opacity={0.5} />
      ))}
      {/* islas lejanas (Marianas) en el horizonte */}
      <path d={`M${f1(cam.x - 900)} 0Q${f1(cam.x - 760)} -70 ${f1(cam.x - 600)} -22Q${f1(cam.x - 540)} -40 ${f1(cam.x - 470)} 0Z`} fill="#3c6a6a" opacity={0.7} />
      <path d={`M${f1(cam.x + 620)} 0Q${f1(cam.x + 700)} -36 ${f1(cam.x + 820)} -10L${f1(cam.x + 900)} 0Z`} fill="#4a7676" opacity={0.6} />
      {/* agua: superficie y cuerpo */}
      <path d={`${line}L${f1(x1)} 2400L${f1(x0)} 2400Z`} fill="url(#seaTop)" />
      {/* brillos del sol sobre las olas */}
      {Array.from({length: 26}, (_, i) => {
        const x = cam.x + 380 - 420 + hash1(i * 6) * 840;
        const k = Math.max(0, Math.sin(t * 3 + i * 2.3));
        return <rect key={i} x={f1(x)} y={f1(waveY(x, t) + 4 + hash1(i * 3) * 30)} width={20 + hash1(i) * 40} height={3} fill="#fff4d0" opacity={0.8 * k} />;
      })}
      {/* cara inferior de la superficie: ondas brillantes vistas desde abajo */}
      <path d={line} stroke="#e8fbff" strokeWidth={4} fill="none" opacity={0.9} />
      {Array.from({length: 22}, (_, i) => {
        const x = x0 + ((hash1(i * 5) * (x1 - x0) + t * 30) % (x1 - x0));
        return <path key={i} d={`M${f1(x)} ${f1(waveY(x, t) + 18 + hash1(i) * 40)}q40 ${f1(-8 + Math.sin(t * 2 + i) * 5)} 80 0t80 0`} stroke="#c8f6ff" strokeWidth={2.5} fill="none" opacity={0.45} />;
      })}
    </g>
  );
};

// ------------------------------------------------------------------ vida lejana (siluetas en bruma)
export const FarSchool: React.FC<{x: number; y: number; t: number; n?: number; s?: number; col?: string; dir?: 1 | -1; seed?: number}> = ({x, y, t, n = 30, s = 1, col = '#0d4a72', dir = 1, seed = 1}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const a = hash1(seed + i) * Math.PI * 2;
      const r = Math.sqrt(hash1(seed + i * 3)) * 160;
      const fx = x + Math.cos(a + t * 0.2) * r * 1.6 + t * 40 * dir;
      const fy = y + Math.sin(a + t * 0.2) * r * 0.5 + Math.sin(t * 2 + i) * 4;
      return <path key={i} d={`M${f1(fx)} ${f1(fy)}l${-14 * dir * s} -4l${-6 * dir * s} -5l0 18l${6 * dir * s} -5l${14 * dir * s} -4Z`} fill={col} />;
    })}
  </g>
);

// ------------------------------------------------------------------ paredes de la fosa (parallax por capas)
/** Pared rocosa vertical con perfil irregular, repetida en mosaico vertical; `climb` desplaza al descender. */
export const Cliff: React.FC<{side: -1 | 1; edge: number; climb: number; tone: string; seed: number; light?: number; detail?: boolean}> = ({side, edge, climb, tone, seed, light = 0, detail = true}) => {
  const TILE = 1400;
  const prof = cached(`cliff-${seed}`, () => {
    const pts: V[] = [];
    for (let i = 0; i <= 20; i++) pts.push({x: (hash1(seed + i * 1.3) - 0.5) * 120 + Math.sin(i * 0.9 + seed) * 70, y: (i / 20) * TILE});
    pts[20] = {...pts[0], y: TILE};
    return JSON.stringify(pts);
  });
  const pts: V[] = JSON.parse(prof);
  const off = ((climb % TILE) + TILE) % TILE;
  const tiles = [-1, 0, 1];
  const outer = side < 0 ? -400 : W + 400;
  return (
    <g>
      {tiles.map((k) => {
        const yo = k * TILE - off;
        const edgePts = pts.map((p) => ({x: edge + p.x * side * -1, y: p.y + yo}));
        const d = `M${outer} ${f1(yo)}${edgePts.map((p) => `L${f1(p.x)} ${f1(p.y)}`).join('')}L${outer} ${f1(yo + TILE)}Z`;
        return (
          <g key={k}>
            <path d={d} fill={tone} />
            {detail && edgePts.slice(0, -1).map((p, i) => (
              <path key={i} d={`M${f1(p.x)} ${f1(p.y)}l${f1(side * (80 + hash1(seed + i * 7) * 160))} ${f1(30 + hash1(i + seed) * 40)}`} stroke={mixColor(tone, '#7aa0c0', 0.18 + light * 0.3)} strokeWidth={3} opacity={0.6} />
            ))}
            {detail && edgePts.slice(0, -1).filter((_, i) => i % 3 === 0).map((p, i) => (
              <ellipse key={`l${i}`} cx={f1(p.x + side * 40)} cy={f1(p.y)} rx={60} ry={14} fill={mixColor(tone, '#000', 0.4)} opacity={0.5} />
            ))}
          </g>
        );
      })}
      {light > 0 && <rect x={side < 0 ? edge - 260 : edge} y={0} width={260} height={H} fill="#9fd8ff" opacity={0} />}
    </g>
  );
};

// ------------------------------------------------------------------ lecho marino (mundo)
export const Seabed: React.FC<{y: number; x0: number; x1: number; t: number; seed?: number; col?: string; slope?: number; mounds?: boolean}> = ({y, x0, x1, t, seed = 1, col = '#3a3a44', slope = 0, mounds = true}) => {
  const key = `bed-${seed}-${Math.round(x0)}-${Math.round(x1)}-${slope}`;
  const d = cached(key, () => {
    const pts: V[] = [];
    const n = 40;
    for (let i = 0; i <= n; i++) {
      const x = lerp(x0, x1, i / n);
      pts.push({x, y: y + (x - x0) * slope + Math.sin(i * 0.7 + seed) * 18 + hash1(seed + i) * 14});
    }
    return smoothPath([...pts, {x: x1, y: y + 3000}, {x: x0, y: y + 3000}], true);
  });
  return (
    <g>
      <defs>
        <linearGradient id={`bedg-${seed}`} x1="0" y1={y - 40} x2="0" y2={y + 600} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={mixColor(col, '#c8c0b0', 0.25)} />
          <stop offset="1" stopColor={mixColor(col, '#000', 0.6)} />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#bedg-${seed})`} />
      {mounds && Array.from({length: 18}, (_, i) => {
        const x = lerp(x0, x1, hash1(seed + i * 2.1));
        const yy = y + (x - x0) * slope + 10 + hash1(i * 5 + seed) * 40;
        return <ellipse key={i} cx={f1(x)} cy={f1(yy)} rx={30 + hash1(i * 3) * 50} ry={6 + hash1(i * 4) * 6} fill={mixColor(col, '#e8e0d0', 0.18)} opacity={0.5} />;
      })}
      {mounds && Array.from({length: 12}, (_, i) => {
        const x = lerp(x0, x1, hash1(seed + i * 7.3));
        const yy = y + (x - x0) * slope + 26 + hash1(i * 9 + seed) * 50;
        return <circle key={`b${i}`} cx={f1(x)} cy={f1(yy)} r={3 + hash1(i) * 3} fill="#0a0a10" opacity={0.6} />;
      })}
      <path d={smoothPath(Array.from({length: 14}, (_, i) => ({x: lerp(x0, x1, i / 13), y: y + (lerp(x0, x1, i / 13) - x0) * slope + 4 + Math.sin(i + t * 0.05) * 3})))} stroke={mixColor(col, '#ffffff', 0.25)} strokeWidth={3} fill="none" opacity={0.4} />
    </g>
  );
};
/** Nube de sedimento levantada (se dispersa con el tiempo desde t0). */
export const SedimentPuff: React.FC<{x: number; y: number; t: number; t0: number; s?: number; col?: string}> = ({x, y, t, t0, s = 1, col = '#b8b0a0'}) => {
  const dt = t - t0;
  if (dt < 0 || dt > 6) return null;
  const k = dt / 6;
  return (
    <g opacity={0.5 * (1 - k)}>
      {Array.from({length: 7}, (_, i) => (
        <ellipse key={i} cx={f1(x + (hash1(i) - 0.5) * 140 * s * (0.3 + k))} cy={f1(y - 20 * s - dt * 10 * hash1(i * 2))} rx={f1((30 + 60 * k) * s * (0.6 + hash1(i * 3)))} ry={f1((14 + 30 * k) * s)} fill={col} />
      ))}
    </g>
  );
};
/** Cono de luz de un foco (mundo). */
export const Beam: React.FC<{x: number; y: number; ang: number; len: number; spread?: number; k?: number; id: string; col?: string}> = ({x, y, ang, len, spread = 0.32, k = 1, id, col = '#dff6ff'}) => {
  if (k <= 0.01) return null;
  const a1 = ang - spread;
  const a2 = ang + spread;
  return (
    <g opacity={k}>
      <defs>
        <radialGradient id={id} cx={x} cy={y} r={len} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={col} stopOpacity={0.5} />
          <stop offset="0.5" stopColor={col} stopOpacity={0.16} />
          <stop offset="1" stopColor={col} stopOpacity={0} />
        </radialGradient>
      </defs>
      <path d={`M${f1(x)} ${f1(y)}L${f1(x + Math.cos(a1) * len)} ${f1(y + Math.sin(a1) * len)}Q${f1(x + Math.cos(ang) * len * 1.12)} ${f1(y + Math.sin(ang) * len * 1.12)} ${f1(x + Math.cos(a2) * len)} ${f1(y + Math.sin(a2) * len)}Z`} fill={`url(#${id})`} />
    </g>
  );
};
/** Capa de parallax lejana con vida tenue según la zona. */
export const FarLife: React.FC<{d: number; t: number}> = ({d, t}) => {
  const epi = 1 - smoothstep(150, 400, d);
  const meso = smoothstep(150, 400, d) * (1 - smoothstep(1500, 3000, d));
  return (
    <ParallaxLayer depth={0.35}>
      {epi > 0.01 && <g opacity={epi * 0.55}><FarSchool x={-600} y={300} t={t} n={40} col="#0e5a86" /><FarSchool x={900} y={-200} t={t * 0.8} n={30} col="#0e5a86" dir={-1} seed={9} /></g>}
      {meso > 0.01 && (
        <g opacity={meso}>
          {Array.from({length: 7}, (_, i) => {
            const x = -1200 + hash1(i * 3) * 2600 + Math.sin(t * 0.1 + i) * 40;
            const y = -600 + hash1(i * 5) * 1400 - t * 3;
            const p = 0.5 + 0.5 * Math.sin(t * 1.2 + i);
            return (
              <g key={i} transform={`translate(${f1(x)} ${f1(((y % 1600) + 1600) % 1600 - 700)})`} opacity={0.25 + 0.3 * p}>
                <path d="M-22 0Q0 -26 22 0Z" fill="#6fd8ff" opacity={0.35} />
                {[-12, -4, 4, 12].map((tx, k) => <path key={k} d={`M${tx} 0q${f1(Math.sin(t + k) * 5)} 22 ${f1(Math.sin(t * 1.3 + k) * 3)} 44`} stroke="#6fd8ff" strokeWidth={1} opacity={0.4} fill="none" />)}
              </g>
            );
          })}
        </g>
      )}
    </ParallaxLayer>
  );
};
export const _k = {clamp};
