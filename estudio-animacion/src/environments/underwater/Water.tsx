import React, {useMemo} from 'react';
import {fbm1, noise1, rng, smoothPath, Vec} from '../../engine/math';
import {useQuality} from '../../engine/quality';
import {useTime} from '../../engine/useTime';
import {fog, UW} from './palette';

/** Columna de agua: degradado de profundidad + resplandor dorado de la superficie. */
export const WaterBackground: React.FC<{sunX: number}> = ({sunX}) => {
  const t = useTime();
  const shimmer = 0.85 + 0.15 * Math.sin(t * 0.9) * Math.sin(t * 0.37 + 1);
  return (
    <g>
      <defs>
        <linearGradient id="uw-water" gradientUnits="userSpaceOnUse" x1="0" y1="-300" x2="0" y2="2400">
          <stop offset="0" stopColor={UW.shallow} />
          <stop offset="0.16" stopColor={UW.mid} />
          <stop offset="0.42" stopColor={UW.deep} />
          <stop offset="0.7" stopColor={UW.abyss} />
          <stop offset="1" stopColor={UW.violetDeep} />
        </linearGradient>
        <radialGradient id="uw-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6dc" stopOpacity={0.95} />
          <stop offset="0.25" stopColor={UW.gold} stopOpacity={0.55} />
          <stop offset="0.6" stopColor={UW.turquoise} stopOpacity={0.18} />
          <stop offset="1" stopColor={UW.turquoise} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="uw-violet" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={UW.violet} stopOpacity={0.6} />
          <stop offset="1" stopColor={UW.violet} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={-3000} y={-1200} width={8000} height={4600} fill="url(#uw-water)" />
      <ellipse cx={-200} cy={1500} rx={1400} ry={700} fill="url(#uw-violet)" />
      <ellipse cx={sunX} cy={-120} rx={1100 * shimmer} ry={460} fill="url(#uw-sun)" />
      {/* ondulación de la superficie vista desde abajo */}
      {Array.from({length: 7}, (_, i) => {
        const y = -260 + i * 34;
        const pts: Vec[] = [];
        for (let x = -1200; x <= 3200; x += 160) {
          pts.push({x, y: y + Math.sin(x * 0.006 + t * 0.8 + i) * 10 + fbm1(x * 0.002 + t * 0.1, i) * 14});
        }
        return <path key={i} d={smoothPath(pts)} stroke="#e8fff8" strokeOpacity={0.1 - i * 0.012} strokeWidth={6 - i * 0.6} fill="none" />;
      })}
    </g>
  );
};

/** Rayos de luz (god rays) con intensidad y anchura que varían suavemente. */
export const LightRays: React.FC<{originX: number; count?: number; seed?: number}> = ({originX, count = 8, seed = 3}) => {
  const t = useTime();
  const rays = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: count}, (_, i) => ({
      x: originX + (i - count / 2) * 150 + (r() - 0.5) * 80,
      spread: 0.12 + r() * 0.2,
      w: 40 + r() * 90,
      len: 1700 + r() * 600,
      o: 0.1 + r() * 0.14,
      ph: r() * 10,
    }));
  }, [originX, count, seed]);
  return (
    <g>
      <defs>
        <linearGradient id="uw-ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={UW.goldSoft} stopOpacity={1} />
          <stop offset="0.45" stopColor={UW.turquoise} stopOpacity={0.35} />
          <stop offset="1" stopColor={UW.turquoise} stopOpacity={0} />
        </linearGradient>
      </defs>
      {rays.map((ry, i) => {
        const flick = 0.55 + 0.45 * (0.5 + 0.5 * noise1(t * 0.35 + ry.ph, i));
        const sway = Math.sin(t * 0.18 + ry.ph) * 30;
        const dir = (ry.x - originX) * 0.0016 + ry.spread * 0.2;
        const x0 = ry.x + sway;
        const top = -260;
        const bx = x0 + dir * ry.len;
        const w0 = ry.w * 0.35;
        const w1 = ry.w * (1.6 + 0.4 * Math.sin(t * 0.3 + ry.ph));
        return (
          <path
            key={i}
            d={`M${x0 - w0},${top} L${x0 + w0},${top} L${bx + w1},${top + ry.len} L${bx - w1},${top + ry.len}Z`}
            fill="url(#uw-ray)"
            opacity={ry.o * flick}
          />
        );
      })}
    </g>
  );
};

/** Silueta lejana de arrecife con corales y algas difuminados por la distancia. */
export const ReefRidge: React.FC<{y: number; amp: number; seed: number; fogAmt: number; x0?: number; x1?: number}> = React.memo(
  ({y, amp, seed, fogAmt, x0 = -1500, x1 = 3600}) => {
    const geo = useMemo(() => {
      const pts: Vec[] = [];
      for (let x = x0; x <= x1; x += 60) {
        pts.push({x, y: y - Math.abs(fbm1(x * 0.0018, seed, 4)) * amp * 2 - fbm1(x * 0.01, seed + 9, 2) * amp * 0.25});
      }
      const r = rng(seed);
      const bumps = Array.from({length: Math.round((x1 - x0) / 70)}, () => {
        const i = Math.floor(r() * pts.length);
        const p = pts[i];
        return {x: p.x, y: p.y + 4, h: 20 + r() * amp * 0.6, w: 6 + r() * 14, kind: r()};
      });
      return {d: smoothPath(pts) + `L${x1},${y + 1600}L${x0},${y + 1600}Z`, bumps};
    }, [y, amp, seed, x0, x1]);
    const c = fog(UW.rockMid, fogAmt);
    const top = fog(UW.rockLit, fogAmt);
    return (
      <g>
        <defs>
          <linearGradient id={`ridge-${seed}`} gradientUnits="userSpaceOnUse" x1="0" y1={y - amp * 2} x2="0" y2={y + 700}>
            <stop offset="0" stopColor={top} />
            <stop offset="0.3" stopColor={c} />
            <stop offset="1" stopColor={fog(UW.abyss, fogAmt * 0.5)} />
          </linearGradient>
        </defs>
        {geo.bumps.map((b, i) =>
          b.kind < 0.55 ? (
            <path
              key={i}
              d={`M${b.x - b.w},${b.y} Q${b.x - b.w * 0.6},${b.y - b.h} ${b.x},${b.y - b.h * 1.1} Q${b.x + b.w * 0.6},${b.y - b.h} ${b.x + b.w},${b.y}Z`}
              fill={fog(UW.emeraldDark, fogAmt)}
            />
          ) : (
            <ellipse key={i} cx={b.x} cy={b.y - b.h * 0.25} rx={b.w * 1.6} ry={b.h * 0.35} fill={fog(UW.coralViolet, Math.min(1, fogAmt + 0.1))} />
          ),
        )}
        <path d={geo.d} fill={`url(#ridge-${seed})`} />
      </g>
    );
  },
);

/** Lecho de arena con ondulaciones (geometría estática). */
export const SandFloor: React.FC<{y: number; x0: number; x1: number; fogAmt?: number; seed?: number}> = React.memo(
  ({y, x0, x1, fogAmt = 0, seed = 5}) => {
    const ripples = useMemo(() => {
      const r = rng(seed);
      return Array.from({length: 26}, (_, i) => {
        const yy = y + 20 + i * 26 + r() * 10;
        const pts: Vec[] = [];
        for (let x = x0; x <= x1; x += 90) pts.push({x, y: yy + Math.sin(x * 0.012 + i) * 6 + fbm1(x * 0.004, seed + i) * 10});
        return smoothPath(pts);
      });
    }, [y, x0, x1, seed]);
    return (
      <g>
        <defs>
          <linearGradient id={`sand-${seed}`} gradientUnits="userSpaceOnUse" x1="0" y1={y} x2="0" y2={y + 800}>
            <stop offset="0" stopColor={fog(UW.sandLit, fogAmt)} />
            <stop offset="0.25" stopColor={fog(UW.sand, fogAmt)} />
            <stop offset="1" stopColor={fog(UW.sandDark, fogAmt)} />
          </linearGradient>
        </defs>
        <rect x={x0} y={y} width={x1 - x0} height={1400} fill={`url(#sand-${seed})`} />
        {ripples.map((d, i) => (
          <path key={i} d={d} stroke={fog('#2c3f46', fogAmt)} strokeOpacity={0.25} strokeWidth={4} fill="none" />
        ))}
      </g>
    );
  },
);

/** Banco de peces lejano (siluetas), trayectoria determinista. */
export const FishSchool: React.FC<{x: number; y: number; fogAmt: number; speed?: number; seed?: number; scale?: number}> = ({
  x,
  y,
  fogAmt,
  speed = 40,
  seed = 2,
  scale = 1,
}) => {
  const t = useTime();
  const q = useQuality();
  const fish = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: q.fish}, () => ({dx: (r() - 0.5) * 360, dy: (r() - 0.5) * 140, ph: r() * 10, s: 0.7 + r() * 0.6}));
  }, [seed, q.fish]);
  const c = fog('#1b3a52', fogAmt);
  const cx = x + t * speed;
  return (
    <g transform={`scale(${scale})`}>
      {fish.map((f, i) => {
        const fx = cx / scale + f.dx + Math.sin(t * 0.7 + f.ph) * 18;
        const fy = y / scale + f.dy + Math.sin(t * 0.9 + f.ph * 2) * 10 + Math.sin(t * 0.3) * 20;
        const wag = Math.sin(t * 9 + f.ph) * 4;
        return (
          <g key={i} transform={`translate(${fx} ${fy}) scale(${f.s})`}>
            <path d={`M16,0 C8,-7 -8,-7 -14,0 C-8,6 8,6 16,0Z`} fill={c} />
            <path d={`M-12,0 L-24,${-7 + wag} L-22,0 L-24,${7 + wag}Z`} fill={c} />
            <circle cx={9} cy={-1.5} r={1.2} fill={fog('#cfe', fogAmt)} opacity={0.5} />
          </g>
        );
      })}
    </g>
  );
};
