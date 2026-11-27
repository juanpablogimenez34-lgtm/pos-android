// ESCENARIOS
//  · SurfaceWorld: superficie del océano vista a ras del agua — cielo con nubes lejanas, sol, horizonte,
//    olas con espuma moderada y reflejos; bajo la línea del agua, azul intenso con rayos de luz. Lo que
//    queda sumergido se tiñe de azul (capa de agua sobre los personajes), lo emergido queda nítido.
//  · DeepOcean: océano abierto por profundidad (reutiliza OceanBack del episodio del calamar sin
//    modificarlo) + bruma violeta tenue, plancton bioluminiscente discreto (nunca en los calamares).
//  · ClickWaves: VISUALIZACIÓN EDUCATIVA de clics y ecos (arcos que se expanden); el sonido no es visible.
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';
import {Cam, layerT, toScreen} from '../../../studio2';
import {OceanBack, OceanFront} from '../../ep22-calamar-gigante/environment/OpenOcean';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export {OceanFront};

const waveY = (wx: number, t: number) => Math.sin(wx * 0.004 + t * 1.1) * 14 + Math.sin(wx * 0.011 - t * 1.7) * 6 + Math.sin(wx * 0.0017 + t * 0.4) * 10;

export const SurfaceWorld: React.FC<{cam: Cam; t: number; children?: React.ReactNode; light?: number; tint?: number}> = ({cam, t, children, light = 1, tint = 0.42}) => {
  // la línea del agua en pantalla (mundo y = 0)
  const pts: V[] = [];
  for (let i = 0; i <= 36; i++) {
    const sx = -40 + (i / 36) * 1160;
    const wx = cam.x + (sx - 540) / cam.zoom;
    const s = toScreen(cam, wx, waveY(wx, t));
    pts.push({x: sx, y: s.y});
  }
  const sy = toScreen(cam, cam.x, 0).y;
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${f1(p.x)},${f1(p.y)}`).join(' ');
  const below = `${line} L1120,2100 L-40,2100Z`;
  const above = `${line} L1120,-200 L-40,-200Z`;
  const sun = {x: 760, y: Math.min(sy - 260, 420)};
  return (
    <g>
      <defs>
        <linearGradient id="sfSky2" gradientUnits="userSpaceOnUse" x1="0" y1={sy - 1400} x2="0" y2={sy}>
          <stop offset="0" stopColor="#2f7cc0" />
          <stop offset="0.75" stopColor="#8cc6ea" />
          <stop offset="1" stopColor="#d8eef8" />
        </linearGradient>
        <linearGradient id="sfSea" gradientUnits="userSpaceOnUse" x1="0" y1={sy} x2="0" y2={sy + 1500}>
          <stop offset="0" stopColor={mixColor('#2a90c8', '#123a5a', 1 - light)} />
          <stop offset="0.5" stopColor={mixColor('#11578a', '#0a243a', 1 - light)} />
          <stop offset="1" stopColor="#06213a" />
        </linearGradient>
        <radialGradient id="sfSun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fffbe8" stopOpacity={0.95} />
          <stop offset="0.25" stopColor="#fff2c0" stopOpacity={0.5} />
          <stop offset="1" stopColor="#fff2c0" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="sfRay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d8f2ff" stopOpacity={0.32} />
          <stop offset="1" stopColor="#d8f2ff" stopOpacity={0} />
        </linearGradient>
        <clipPath id="sfBelow">
          <path d={below} />
        </clipPath>
        <filter id="sfBlur" filterUnits="userSpaceOnUse" x={-200} y={-200} width={1480} height={2320}>
          <feGaussianBlur stdDeviation={10} />
        </filter>
      </defs>
      {/* cielo y mar de fondo */}
      <rect x={-40} y={-200} width={1160} height={Math.max(0, sy + 220)} fill="url(#sfSky2)" />
      <rect x={-40} y={sy - 20} width={1160} height={2200} fill="url(#sfSea)" />
      {sy > -100 && (
        <g>
          <circle cx={sun.x} cy={sun.y} r={240} fill="url(#sfSun)" />
          <g filter="url(#sfBlur)" opacity={0.85}>
            {Array.from({length: 6}, (_, i) => {
              const cx = ((hash1(i * 7) * 1600 + t * 6 * (0.5 + hash1(i))) % 1600) - 260;
              const cy = sy - 180 - hash1(i * 3) * 420;
              const w = 160 + hash1(i * 5) * 220;
              return <ellipse key={i} cx={cx} cy={cy} rx={w} ry={w * 0.16} fill="#f4f8fc" opacity={0.6} />;
            })}
          </g>
          {/* horizonte lejano */}
          <rect x={-40} y={sy - 6} width={1160} height={8} fill="#5aa8d8" opacity={0.5} />
        </g>
      )}
      {/* rayos de luz bajo el agua */}
      <g clipPath="url(#sfBelow)" opacity={light}>
        {Array.from({length: 7}, (_, i) => {
          const x0 = 80 + i * 150 + Math.sin(t * 0.3 + i) * 40;
          return <path key={i} d={`M${f1(x0)},${f1(sy)} l${f1(-140 + i * 6)},1500 l${f1(90 + hash1(i) * 60)},0 Z`} fill="url(#sfRay)" opacity={0.5 + 0.5 * Math.sin(t * 0.7 + i * 1.7)} />;
        })}
      </g>
      {/* personajes */}
      <g transform={layerT(cam, 1)}>{children}</g>
      {/* agua sobre lo sumergido */}
      <g clipPath="url(#sfBelow)">
        <rect x={-40} y={sy - 40} width={1160} height={2200} fill="#1a6a9e" opacity={tint} />
        {/* cáusticas bajo la superficie */}
        {Array.from({length: 14}, (_, i) => {
          const x = (hash1(i * 9) * 1200 + Math.sin(t * 0.8 + i) * 30) % 1160 - 40;
          return <path key={`c${i}`} d={`M${f1(x)},${f1(sy + 30 + hash1(i) * 90)} q30,${f1(-8 + Math.sin(t * 2 + i) * 6)} 60,0 t60,0`} stroke="#d8f4ff" strokeWidth={2} fill="none" opacity={0.25 * light} />;
        })}
      </g>
      {/* línea del agua: brillo, espuma y destellos del sol */}
      <path d={line} stroke="#e8f8ff" strokeWidth={4} fill="none" opacity={0.85} />
      <path d={above} fill="none" />
      {pts.map((p, i) =>
        i % 2 === 0 ? <path key={`f${i}`} d={`M${f1(p.x - 14)},${f1(p.y + 2)} q14,${f1(-5 - hash1(i) * 4)} 28,0`} stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.35 + 0.3 * Math.sin(t * 2 + i)} /> : null,
      )}
      {Array.from({length: 16}, (_, i) => {
        const x = sun.x - 300 + hash1(i * 4) * 600;
        const y = sy + 4 + hash1(i * 6) * 40;
        const k = Math.max(0, Math.sin(t * 3 + i * 2.3));
        return <rect key={`g${i}`} x={x} y={y} width={18 + hash1(i) * 26} height={2.5} fill="#fffbe8" opacity={0.7 * k} />;
      })}
    </g>
  );
};

/** Océano abierto por profundidad + bruma violeta + plancton bioluminiscente discreto. */
export const DeepOcean: React.FC<{cam: Cam; t: number; depth: number; children?: React.ReactNode; violet?: number; glow?: number}> = ({cam, t, depth, children, violet = 0.25, glow = 0.5}) => (
  <g>
    <OceanBack cam={cam} t={t} depth={depth}>
      {children}
    </OceanBack>
    <rect width={1080} height={1920} fill="#3a1a6a" opacity={violet * clamp(depth) * 0.35} style={{mixBlendMode: 'screen'}} />
    {glow > 0.01 && depth > 0.6 && (
      <g transform={layerT(cam, 0.75)} opacity={glow * clamp((depth - 0.6) / 0.3)}>
        {Array.from({length: 22}, (_, i) => {
          const x = cam.x * 0.75 + ((hash1(i * 17) * 2600 + Math.sin(t * 0.3 + i) * 40) % 2600) - 1300;
          const y = cam.y * 0.75 + ((hash1(i * 19) * 3400 + t * 8) % 3400) - 1700;
          const blink = Math.max(0, Math.sin(t * (0.6 + hash1(i) * 0.8) + i * 2.1));
          return <circle key={i} cx={x} cy={y} r={2 + hash1(i * 3) * 3} fill={i % 3 ? '#7ae8ff' : '#a890ff'} opacity={0.75 * blink} />;
        })}
      </g>
    )}
  </g>
);

/** Arcos de clics (desde el origen, en dirección `dir`) y de ecos (desde los blancos hacia el emisor). */
export const ClickWaves: React.FC<{t: number; origin: V; dir: number; clicks: number[]; speed?: number; maxR?: number; targets?: V[]; spread?: number; k?: number}> = ({t, origin, dir, clicks, speed = 1500, maxR = 1500, targets = [], spread = 0.45, k = 1}) => {
  const arc = (c: V, r: number, a0: number, a1: number) => `M${f1(c.x + Math.cos(a0) * r)},${f1(c.y + Math.sin(a0) * r)} A${f1(r)},${f1(r)} 0 0 1 ${f1(c.x + Math.cos(a1) * r)},${f1(c.y + Math.sin(a1) * r)}`;
  const out: React.ReactNode[] = [];
  clicks.forEach((tc, i) => {
    if (t < tc) return;
    const r = (t - tc) * speed;
    if (r < maxR && r > 2) out.push(<path key={`c${i}`} d={arc(origin, r, dir - spread, dir + spread)} stroke="#9ff0ff" strokeWidth={6} fill="none" opacity={0.7 * (1 - r / maxR) * k} strokeLinecap="round" />);
    targets.forEach((tg, j) => {
      const d = Math.hypot(tg.x - origin.x, tg.y - origin.y);
      const back = Math.atan2(origin.y - tg.y, origin.x - tg.x);
      const ang = Math.atan2(tg.y - origin.y, tg.x - origin.x);
      if (Math.abs(((ang - dir + Math.PI * 3) % (Math.PI * 2)) - Math.PI) > spread + 0.1) return;
      const te = tc + d / speed;
      if (t < te) return;
      const re = (t - te) * speed * 0.9;
      if (re < d && re > 2) out.push(<path key={`e${i}-${j}`} d={arc(tg, re, back - 0.35, back + 0.35)} stroke="#ffc870" strokeWidth={4} fill="none" opacity={0.75 * (1 - re / d) * k} strokeLinecap="round" />);
    });
  });
  return <g>{out}</g>;
};

/** Pulso de clic visible en el origen (destello suave en la frente al emitir). */
export const ClickFlash: React.FC<{t: number; origin: V; clicks: number[]; k?: number}> = ({t, origin, clicks, k = 1}) => {
  const near = clicks.reduce((a, c) => Math.max(a, clamp(1 - Math.abs(t - c - 0.04) / 0.1)), 0);
  return near > 0.01 ? <circle cx={origin.x} cy={origin.y} r={lerp(20, 60, near)} fill="#bff4ff" opacity={0.35 * near * k} /> : null;
};
