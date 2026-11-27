import React, {useMemo} from 'react';
import {fbm1, rng, smoothPath, Vec} from '../../engine/math';
import {useQuality} from '../../engine/quality';
import {useTime} from '../../engine/useTime';
import {makeBranchCoral, makeFanCoral, makeUrchin} from './geometry';
import {fog, UW} from './palette';

// ---------------------------------------------------------------------------
// Algas: cintas afiladas cuya columna se curva con una onda que sube por el tallo
// (la punta se mueve más y con retraso respecto a la base).
// ---------------------------------------------------------------------------
type KelpProps = {
  id: string;
  x: number;
  y: number;
  height: number;
  width?: number;
  seed: number;
  strands?: number;
  fogAmt?: number;
  colorA?: string; // base
  colorB?: string; // punta
  sway?: number;
};

function strandPath(baseX: number, baseY: number, h: number, w: number, t: number, seed: number, sway: number, segs: number) {
  const left: Vec[] = [];
  const right: Vec[] = [];
  let x = baseX;
  let y = baseY;
  let ang = -Math.PI / 2 + fbm1(seed, seed) * 0.25;
  const seg = h / segs;
  for (let i = 0; i <= segs; i++) {
    const s = i / segs;
    const wave = Math.sin(t * 1.1 + seed * 1.7 - s * 2.6) * 0.09 + fbm1(t * 0.25 + seed + s * 0.8, seed) * 0.07;
    ang += wave * sway * (0.4 + s);
    const ww = w * (1 - s * 0.85) * (0.75 + 0.25 * Math.sin(s * 9 + seed));
    const nx = -Math.sin(ang);
    const ny = Math.cos(ang);
    left.push({x: x + nx * ww, y: y + ny * ww});
    right.push({x: x - nx * ww, y: y - ny * ww});
    x += Math.cos(ang) * seg;
    y += Math.sin(ang) * seg;
  }
  return {body: smoothPath([...left, {x, y}, ...right.reverse()], true), tip: {x, y}};
}

export const Kelp: React.FC<KelpProps> = ({
  id,
  x,
  y,
  height,
  width = 16,
  seed,
  strands = 4,
  fogAmt = 0,
  colorA = UW.emeraldDark,
  colorB = UW.olive,
  sway = 1,
}) => {
  const t = useTime();
  const q = useQuality();
  const cfg = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: strands}, (_, i) => ({
      dx: (i - (strands - 1) / 2) * width * 1.3 + (r() - 0.5) * width,
      h: height * (0.6 + r() * 0.4),
      w: width * (0.7 + r() * 0.5),
      s: seed + i * 7.3,
    }));
  }, [seed, strands, width, height]);
  const a = fog(colorA, fogAmt);
  const b = fog(colorB, fogAmt);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-g`} gradientUnits="userSpaceOnUse" x1="0" y1={y} x2="0" y2={y - height}>
          <stop offset="0" stopColor={fog(UW.rockShadow, fogAmt)} />
          <stop offset="0.25" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      {cfg.map((c, i) => {
        const p = strandPath(x + c.dx, y, c.h, c.w, t, c.s, sway, q.seaweedSegments);
        return (
          <g key={i}>
            <path d={p.body} fill={`url(#${id}-g)`} />
            <path d={p.body} fill="none" stroke={fog(UW.goldSoft, fogAmt)} strokeOpacity={0.12 * (1 - fogAmt)} strokeWidth={1.5} />
          </g>
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------------------
// Anémona: columna con tentáculos que ondean (cada uno con su fase).
// ---------------------------------------------------------------------------
export const Anemone: React.FC<{x: number; y: number; size: number; seed: number; color?: string; tip?: string; fogAmt?: number}> = ({
  x,
  y,
  size,
  seed,
  color = UW.coralPink,
  tip = '#ffd0e4',
  fogAmt = 0,
}) => {
  const t = useTime();
  const n = 15;
  const c = fog(color, fogAmt);
  const tc = fog(tip, fogAmt);
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d={`M${-size * 0.35},0 C${-size * 0.4},${-size * 0.4} ${-size * 0.32},${-size * 0.62} ${-size * 0.42},${-size * 0.72} L${size * 0.42},${-size * 0.72} C${size * 0.32},${-size * 0.62} ${size * 0.4},${-size * 0.4} ${size * 0.35},0Z`}
        fill={fog('#7b2c5a', fogAmt)}
      />
      {Array.from({length: n}, (_, i) => {
        const u = i / (n - 1) - 0.5;
        const bx = u * size * 0.85;
        const by = -size * 0.72;
        const len = size * (0.55 + 0.25 * Math.cos(u * 3));
        const a = -Math.PI / 2 + u * 2.1 + Math.sin(t * 1.4 + i * 0.7 + seed) * 0.22;
        const mx = bx + Math.cos(a - 0.3) * len * 0.5;
        const my = by + Math.sin(a - 0.3) * len * 0.5;
        const ex = bx + Math.cos(a + Math.sin(t * 1.4 + i) * 0.3) * len;
        const ey = by + Math.sin(a + Math.sin(t * 1.4 + i) * 0.3) * len;
        return (
          <g key={i}>
            <path d={`M${bx},${by}Q${mx},${my} ${ex},${ey}`} stroke={c} strokeWidth={size * 0.07} strokeLinecap="round" fill="none" />
            <circle cx={ex} cy={ey} r={size * 0.045} fill={tc} />
          </g>
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------------------
// Corales con geometría memorizada; sólo se anima una ligera oscilación global.
// ---------------------------------------------------------------------------
export const BranchCoral: React.FC<{x: number; y: number; height: number; seed: number; color: string; fogAmt?: number; flip?: boolean}> =
  React.memo(({x, y, height, seed, color, fogAmt = 0, flip}) => {
    const t = useTime();
    const branches = useMemo(() => makeBranchCoral(seed, height), [seed, height]);
    const c = fog(color, fogAmt);
    const dark = fog('#3a1030', fogAmt * 0.8);
    const sway = Math.sin(t * 0.8 + seed) * 1.2;
    return (
      <g transform={`translate(${x} ${y}) rotate(${sway}) scale(${flip ? -1 : 1} 1)`}>
        {branches.map((b, i) => (
          <path key={`d${i}`} d={b.d} stroke={dark} strokeWidth={b.w + 3} strokeLinecap="round" fill="none" />
        ))}
        {branches.map((b, i) => (
          <path key={`c${i}`} d={b.d} stroke={c} strokeWidth={b.w} strokeLinecap="round" fill="none" />
        ))}
        {branches.map((b, i) => (
          <path
            key={`h${i}`}
            d={b.d}
            transform="translate(-1 -1)"
            stroke="#ffffff"
            strokeOpacity={0.22 * (1 - fogAmt)}
            strokeWidth={Math.max(1, b.w * 0.3)}
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </g>
    );
  });

export const FanCoral: React.FC<{x: number; y: number; w: number; h: number; seed: number; color: string; fogAmt?: number}> = React.memo(
  ({x, y, w, h, seed, color, fogAmt = 0}) => {
    const t = useTime();
    const geo = useMemo(() => makeFanCoral(seed, w, h), [seed, w, h]);
    const c = fog(color, fogAmt);
    return (
      <g transform={`translate(${x} ${y}) rotate(${Math.sin(t * 0.6 + seed) * 2.5}) skewX(${Math.sin(t * 0.6 + seed + 1) * 3})`}>
        {geo.lattice.map((d, i) => (
          <path key={`l${i}`} d={d} stroke={c} strokeOpacity={0.7} strokeWidth={1.6} fill="none" />
        ))}
        {geo.branches.map((d, i) => (
          <path key={`b${i}`} d={d} stroke={c} strokeWidth={4} strokeLinecap="round" fill="none" />
        ))}
      </g>
    );
  },
);

export const TubeSponges: React.FC<{x: number; y: number; scale?: number; seed: number; fogAmt?: number}> = React.memo(
  ({x, y, scale = 1, seed, fogAmt = 0}) => {
    const tubes = useMemo(() => {
      const r = rng(seed);
      return Array.from({length: 4}, (_, i) => ({
        dx: (i - 1.5) * 26 + (r() - 0.5) * 10,
        h: 70 + r() * 90,
        w: 16 + r() * 8,
        lean: (r() - 0.5) * 16,
      }));
    }, [seed]);
    const body = fog(UW.sponge, fogAmt);
    const shadow = fog('#7a4b16', fogAmt);
    return (
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        {tubes.map((tb, i) => (
          <g key={i}>
            <path
              d={`M${tb.dx - tb.w},0 Q${tb.dx - tb.w * 0.8 + tb.lean * 0.5},${-tb.h * 0.5} ${tb.dx - tb.w + tb.lean},${-tb.h} L${tb.dx + tb.w + tb.lean},${-tb.h} Q${tb.dx + tb.w * 0.8 + tb.lean * 0.5},${-tb.h * 0.5} ${tb.dx + tb.w},0Z`}
              fill={body}
            />
            <path
              d={`M${tb.dx + tb.w * 0.2},0 Q${tb.dx + tb.w * 0.3 + tb.lean * 0.5},${-tb.h * 0.5} ${tb.dx + tb.w * 0.3 + tb.lean},${-tb.h} L${tb.dx + tb.w + tb.lean},${-tb.h} Q${tb.dx + tb.w * 0.8 + tb.lean * 0.5},${-tb.h * 0.5} ${tb.dx + tb.w},0Z`}
              fill={shadow}
              opacity={0.55}
            />
            <ellipse cx={tb.dx + tb.lean} cy={-tb.h} rx={tb.w} ry={tb.w * 0.38} fill={fog('#f2c46a', fogAmt)} />
            <ellipse cx={tb.dx + tb.lean} cy={-tb.h + 1} rx={tb.w * 0.72} ry={tb.w * 0.25} fill={fog('#2b1608', fogAmt * 0.6)} />
          </g>
        ))}
      </g>
    );
  },
);

export const Urchin: React.FC<{x: number; y: number; r: number; seed: number; fogAmt?: number}> = React.memo(({x, y, r, seed, fogAmt = 0}) => {
  const spikes = useMemo(() => makeUrchin(seed, r), [seed, r]);
  const c = fog('#2a1a3c', fogAmt);
  return (
    <g transform={`translate(${x} ${y})`}>
      {spikes.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={c} strokeWidth={2} strokeLinecap="round" />
      ))}
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.7} fill={fog('#3b2352', fogAmt)} />
      <ellipse cx={-r * 0.3} cy={-r * 0.3} rx={r * 0.4} ry={r * 0.22} fill="#ffffff" opacity={0.12} />
    </g>
  );
});
