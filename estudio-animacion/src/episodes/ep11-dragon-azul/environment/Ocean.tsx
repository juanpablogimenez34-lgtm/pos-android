// ESCENARIOS OCEÁNICOS (procedurales, deterministas, sin filtros costosos):
//  · TopOcean     — océano visto desde arriba: crestas que se desplazan, destellos solares, espuma,
//                   red de cáusticas y plancton en una capa profunda (parallax), corrientes luminosas.
//  · SurfaceSplit — plano partido en la superficie: cielo y sol, mar lejano, línea de olas con
//                   espuma, cara inferior de la superficie, rayos, partículas y burbujas bajo el agua.
//  · UnderSurface — mirar hacia arriba desde abajo: ventana de luz brillante con ondas.
//  · Beach        — arena mojada con lenguas de espuma (vista cenital).
// Paletas: noche (gancho), día, atardecer; mezclables.
import React from 'react';
import {clamp, hash1, mixColor} from '../../../engine/math';
import {Cam, layerT} from '../../ep10-camaron-mantis/camera/CameraSystem';
import {OceanParticles} from '../../ep08-medusa-inmortal/Environments/OceanParticles';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export type Pal = {deep: string; mid: string; shallow: string; crest: string; glint: string; foam: string; sky0: string; sky1: string; sun: string; under0: string; under1: string; ray: string};
export const NIGHT: Pal = {deep: '#00030a', mid: '#020a1c', shallow: '#06183a', crest: '#0e2a5a', glint: '#4a7ab8', foam: '#3a5a8a', sky0: '#00020a', sky1: '#04102a', sun: '#8aa8ff', under0: '#020a1a', under1: '#000206', ray: '#2a4a8a'};
export const DAY: Pal = {deep: '#063a6e', mid: '#0a6aa8', shallow: '#18a6c8', crest: '#5ad8ec', glint: '#ffffff', foam: '#eafcff', sky0: '#5ab8ec', sky1: '#d8f4ff', sun: '#fffbe8', under0: '#1690b8', under1: '#06305a', ray: '#d8fbff'};
export const SUNSET: Pal = {deep: '#14204a', mid: '#283a7a', shallow: '#5a5a9a', crest: '#ffb07a', glint: '#ffe0a0', foam: '#ffd8c0', sky0: '#2a2a6a', sky1: '#ff9a5a', sun: '#ffe8a0', under0: '#3a4a8a', under1: '#0a0e2a', ray: '#ffc890'};
export const mixPal = (a: Pal, b: Pal, k: number): Pal => {
  const o = {} as Pal;
  (Object.keys(a) as (keyof Pal)[]).forEach((key) => (o[key] = mixColor(a[key], b[key], clamp(k))));
  return o;
};

const visible = (cam: Cam, d = 1) => {
  const r = 1150 / Math.pow(cam.zoom, d);
  return {x0: cam.x * d - r, x1: cam.x * d + r, y0: cam.y * d - r, y1: cam.y * d + r, r};
};

/** Océano visto desde arriba. `current` 0…1 dibuja corrientes luminosas. */
export const TopOcean: React.FC<{cam: Cam; t: number; pal: Pal; current?: number; foam?: number; children?: React.ReactNode; flow?: number}> = ({cam, t, pal, current = 0, foam = 1, children, flow = 1}) => {
  const v = visible(cam, 1);
  const sp = Math.max(70, 64 / Math.sqrt(cam.zoom));
  const rows = Math.min(70, Math.ceil((v.y1 - v.y0) / sp));
  const ry0 = Math.floor(v.y0 / sp) * sp;
  const step = Math.max(40, 36 / Math.sqrt(cam.zoom));
  const vd = visible(cam, 0.6);
  const cell = 150;
  const gx0 = Math.floor(v.x0 / cell);
  const gy0 = Math.floor(v.y0 / cell);
  const gw = Math.min(26, Math.ceil((v.x1 - v.x0) / cell));
  const gh = Math.min(26, Math.ceil((v.y1 - v.y0) / cell));
  return (
    <g>
      <defs>
        <radialGradient id="ep11top" cx="0.5" cy="0.42" r="0.75">
          <stop offset="0" stopColor={pal.shallow} />
          <stop offset="0.55" stopColor={pal.mid} />
          <stop offset="1" stopColor={pal.deep} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#ep11top)" />
      {/* capa profunda: red de cáusticas y plancton (se mueve más lento: parallax) */}
      <g transform={layerT(cam, 0.6)} opacity={0.5}>
        {Array.from({length: 18}, (_, i) => {
          const y = Math.floor(vd.y0 / 160) * 160 + i * 160;
          const d = Array.from({length: 16}, (_, k) => {
            const x = Math.floor(vd.x0 / 200) * 200 + k * 200;
            return `${k ? 'Q' : 'M'}${k ? `${f1(x - 100)},${f1(y + Math.sin(t * 0.8 + k * 1.7 + i) * 50) } ` : ''}${f1(x)},${f1(y + Math.sin(t * 0.6 + k + i * 2) * 30)}`;
          }).join(' ');
          return <path key={i} d={d} stroke={pal.crest} strokeWidth={3} fill="none" opacity={0.35} />;
        })}
        {Array.from({length: 70}, (_, i) => (
          <circle key={`p${i}`} cx={vd.x0 + ((hash1(i * 3) * 2 * vd.r + t * 6 * flow) % (2 * vd.r))} cy={vd.y0 + hash1(i * 7) * 2 * vd.r} r={1.5 + hash1(i) * 2.5} fill={pal.glint} opacity={0.25} />
        ))}
      </g>
      {/* superficie */}
      <g transform={layerT(cam, 1)}>
        {Array.from({length: rows}, (_, i) => {
          const y = ry0 + i * sp;
          const seed = Math.round(y / sp);
          const n = Math.min(60, Math.ceil((v.x1 - v.x0) / step) + 2);
          const x0 = Math.floor(v.x0 / step) * step;
          const d = Array.from({length: n}, (_, k) => {
            const x = x0 + k * step;
            const yy = y + Math.sin(x * 0.006 + t * 0.9 * flow + seed * 1.3) * 22 + Math.sin(x * 0.017 - t * 1.4 * flow + seed) * 8;
            return `${k ? 'L' : 'M'}${f1(x)},${f1(yy)}`;
          }).join(' ');
          return <path key={i} d={d} stroke={i % 2 ? pal.crest : pal.shallow} strokeWidth={i % 3 === 0 ? 5 : 3} fill="none" opacity={0.42} />;
        })}
        {/* destellos solares */}
        {Array.from({length: gw * gh}, (_, i) => {
          const gx = gx0 + (i % gw);
          const gy = gy0 + Math.floor(i / gw);
          const h = hash1(gx * 7.1 + gy * 13.3);
          if (h < 0.55) return null;
          const k = Math.pow(Math.max(0, Math.sin(t * 2.6 + h * 40)), 10);
          if (k < 0.05) return null;
          const x = gx * cell + hash1(gx + gy * 3) * cell;
          const y = gy * cell + hash1(gx * 5 + gy) * cell;
          const r = (6 + 10 * h) * k;
          return <path key={i} d={`M${f1(x - r * 2)},${f1(y)} L${f1(x)},${f1(y - r * 0.5)} L${f1(x + r * 2)},${f1(y)} L${f1(x)},${f1(y + r * 0.5)}Z`} fill={pal.glint} opacity={0.85 * k} />;
        })}
        {/* espuma a la deriva */}
        {foam > 0.01 &&
          Array.from({length: 16}, (_, i) => {
            const x = v.x0 + ((hash1(i * 11) * 2 * v.r + t * 14 * flow) % (2 * v.r));
            const y = v.y0 + hash1(i * 17) * 2 * v.r;
            return (
              <g key={`f${i}`} opacity={0.35 * foam}>
                {[0, 1, 2].map((k) => (
                  <ellipse key={k} cx={x + k * 26 - 26} cy={y + Math.sin(k + i) * 8} rx={18 + hash1(i + k) * 22} ry={4 + hash1(i * 2 + k) * 4} fill={pal.foam} />
                ))}
              </g>
            );
          })}
        {current > 0.01 &&
          Array.from({length: 9}, (_, i) => {
            const y = -1400 + i * 340;
            const d = Array.from({length: 26}, (_, k) => `${k ? 'L' : 'M'}${f1(-3200 + k * 260)},${f1(y + Math.sin(k * 0.45 + i) * 140)}`).join(' ');
            const dash = 260;
            return <path key={`c${i}`} d={d} stroke="#9ff8ff" strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={`${dash} ${dash * 2.5}`} strokeDashoffset={f1(-t * 120 - i * 90)} opacity={0.45 * current} />;
          })}
        {children}
      </g>
    </g>
  );
};

/** Altura de la línea de agua (vista lateral). `big`: ola grande (centro, anchura, altura). */
export function waveY(x: number, t: number, big?: {c: number; w: number; h: number}) {
  let y = Math.sin(x * 0.006 + t * 1.3) * 16 + Math.sin(x * 0.015 - t * 2.1) * 6 + Math.sin(x * 0.0021 + t * 0.5) * 22;
  if (big) y -= big.h * Math.exp(-Math.pow((x - big.c) / big.w, 2));
  return y;
}

/** Plano partido en la superficie (vista lateral). `children` va bajo el agua; `above` sobre ella. */
export const SurfaceSplit: React.FC<{cam: Cam; t: number; pal: Pal; big?: {c: number; w: number; h: number}; children?: React.ReactNode; above?: React.ReactNode; rays?: number}> = ({cam, t, pal, big, children, above, rays = 1}) => {
  const v = visible(cam, 1);
  const n = 70;
  const xs = Array.from({length: n}, (_, i) => v.x0 + (i / (n - 1)) * (v.x1 - v.x0));
  const line = xs.map((x, i) => `${i ? 'L' : 'M'}${f1(x)},${f1(waveY(x, t, big))}`).join(' ');
  const water = `${line} L${f1(v.x1)},${f1(v.y1 + 3000)} L${f1(v.x0)},${f1(v.y1 + 3000)}Z`;
  return (
    <g>
      <defs>
        <linearGradient id="ep11sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={pal.sky0} />
          <stop offset="1" stopColor={pal.sky1} />
        </linearGradient>
        <linearGradient id="ep11uw" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={pal.under0} />
          <stop offset="1" stopColor={pal.under1} />
        </linearGradient>
        <linearGradient id="ep11far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={pal.mid} />
          <stop offset="1" stopColor={pal.shallow} />
        </linearGradient>
        <linearGradient id="ep11ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={pal.ray} stopOpacity={0.45} />
          <stop offset="1" stopColor={pal.ray} stopOpacity={0} />
        </linearGradient>
        <radialGradient id="ep11sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={pal.sun} stopOpacity={1} />
          <stop offset="0.25" stopColor={pal.sun} stopOpacity={0.6} />
          <stop offset="1" stopColor={pal.sun} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#ep11sky)" />
      <g transform={layerT(cam, 0.05)}>
        <circle cx={260} cy={-700} r={520} fill="url(#ep11sun)" />
        <circle cx={260} cy={-700} r={70} fill={pal.sun} />
      </g>
      {/* nubes lejanas */}
      <g transform={layerT(cam, 0.12)} opacity={0.5}>
        {Array.from({length: 6}, (_, i) => (
          <ellipse key={i} cx={-1600 + i * 640 + t * 4} cy={-900 + hash1(i) * 300} rx={260 + hash1(i * 3) * 200} ry={40 + hash1(i * 5) * 30} fill={mixColor(pal.sky1, '#ffffff', 0.4)} />
        ))}
      </g>
      {/* mar lejano hasta el horizonte, con destellos */}
      <g transform={layerT(cam, 0.3)}>
        <rect x={-6000} y={-36} width={12000} height={6000} fill="url(#ep11far)" />
        {Array.from({length: 40}, (_, i) => {
          const k = Math.pow(Math.max(0, Math.sin(t * 2 + i * 1.7)), 6);
          return <rect key={i} x={-1800 + hash1(i * 3) * 3600} y={-30 + hash1(i * 7) * 60} width={20 + 30 * k} height={2.5} fill={pal.glint} opacity={0.7 * k} />;
        })}
      </g>
      <g transform={layerT(cam, 1)}>
        {above}
        <path d={water} fill="url(#ep11uw)" />
        {/* cara inferior de la superficie: banda clara con reflejos ondulantes */}
        <path d={line} transform="translate(0 14)" stroke={mixColor(pal.under0, '#ffffff', 0.45)} strokeWidth={26} fill="none" opacity={0.5} />
        {Array.from({length: 24}, (_, i) => {
          const x = v.x0 + ((hash1(i * 5) * (v.x1 - v.x0) + t * 20) % (v.x1 - v.x0));
          const y = waveY(x, t, big) + 30 + hash1(i * 9) * 50;
          return <path key={i} d={`M${f1(x - 30)},${f1(y)} q30,${f1(-8 + Math.sin(t * 2 + i) * 6)} 60,0`} stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.3} />;
        })}
        {/* rayos de luz */}
        {rays > 0.01 &&
          Array.from({length: 10}, (_, i) => {
            const x = v.x0 + (i + 0.5) * ((v.x1 - v.x0) / 10) + Math.sin(t * 0.3 + i) * 40;
            const y = waveY(x, t, big);
            const w = 40 + hash1(i) * 70;
            return <path key={`r${i}`} d={`M${f1(x)},${f1(y)} L${f1(x + w)},${f1(y)} L${f1(x + w * 2 + 300)},${f1(y + 1600)} L${f1(x + 140)},${f1(y + 1600)}Z`} fill="url(#ep11ray)" opacity={rays * (0.35 + 0.35 * Math.sin(t * 0.7 + i * 1.9))} />;
          })}
        {children}
        {/* espuma y brillo de la línea de agua */}
        <path d={line} stroke={pal.foam} strokeWidth={5} fill="none" opacity={0.85} />
        {xs.filter((_, i) => i % 3 === 0).map((x, i) => (
          <ellipse key={`fo${i}`} cx={x} cy={waveY(x, t, big) - 2} rx={10 + hash1(i) * 18} ry={3} fill={pal.foam} opacity={0.6} />
        ))}
      </g>
      <OceanParticles cam={cam} t={t} current={0.3} density={0.6} tint={mixColor(pal.foam, '#ffffff', 0.4)} />
    </g>
  );
};

/** Vista desde abajo, hacia la superficie luminosa (ventana de luz con ondas). */
export const UnderSurface: React.FC<{t: number; pal: Pal; k?: number}> = ({t, pal, k = 1}) => (
  <g opacity={k}>
    <defs>
      <radialGradient id="ep11win" cx="0.5" cy="0.4" r="0.7">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.35" stopColor={mixColor(pal.ray, '#ffffff', 0.5)} />
        <stop offset="0.75" stopColor={pal.under0} />
        <stop offset="1" stopColor={pal.under1} />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#ep11win)" />
    {Array.from({length: 22}, (_, i) => (
      <path key={i} d={`M-50,${f1(200 + i * 80 + Math.sin(t + i) * 20)} ${Array.from({length: 8}, (_, j) => `Q${f1(90 + j * 160)},${f1(200 + i * 80 + Math.sin(t * 1.3 + i + j) * 40)} ${f1(170 + j * 160)},${f1(200 + i * 80)}`).join(' ')}`} stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.28} />
    ))}
  </g>
);

/** Playa (vista cenital): arena mojada, lenguas de espuma que suben y bajan. */
export const Beach: React.FC<{t: number; k?: number}> = ({t, k = 1}) => {
  const surge = 0.5 + 0.5 * Math.sin(t * 0.8);
  return (
    <g opacity={k}>
      <rect width={1080} height={1920} fill="#d8c294" />
      <rect width={1080} height={1100} fill="#b8a27a" opacity={0.6} />
      {Array.from({length: 120}, (_, i) => (
        <circle key={i} cx={hash1(i * 3) * 1080} cy={hash1(i * 7) * 1920} r={1.5 + hash1(i) * 2.5} fill={i % 2 ? '#f0e0b8' : '#9a8460'} opacity={0.6} />
      ))}
      <path d={`M0,${f1(380 + surge * 220)} ${Array.from({length: 9}, (_, i) => `Q${f1(i * 135 + 67)},${f1(380 + surge * 220 + Math.sin(i * 1.3 + t) * 50)} ${f1((i + 1) * 135)},${f1(380 + surge * 220)}`).join(' ')} L1080,0 L0,0Z`} fill="#3aa8c8" opacity={0.85} />
      <path d={`M0,${f1(380 + surge * 220)} ${Array.from({length: 9}, (_, i) => `Q${f1(i * 135 + 67)},${f1(380 + surge * 220 + Math.sin(i * 1.3 + t) * 50)} ${f1((i + 1) * 135)},${f1(380 + surge * 220)}`).join(' ')}`} stroke="#ffffff" strokeWidth={14} fill="none" opacity={0.9} />
      <rect y={500} width={1080} height={500} fill="#ffffff" opacity={0.08 * surge} />
    </g>
  );
};
