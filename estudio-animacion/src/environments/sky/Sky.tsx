// Escenario de montaña y cielo (Ep. 04): bóveda según la hora del día, sol,
// cordilleras en capas, valle con río, acantilado, nubes volumétricas estilizadas
// en mosaico infinito (sólo se dibujan las visibles) y corrientes de aire discretas.
import React, {useMemo} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ParallaxLayer, screenToWorld, useCamera} from '../../engine/camera';
import {clamp, fbm1, hash1, mixColor, rng, smoothPath, Vec} from '../../engine/math';
import {useTime} from '../../engine/useTime';

/** Paleta según la hora: 0 amanecer · 1 día · 2 atardecer. */
export function skyPalette(tod: number) {
  const P = [
    {top: '#2f3a72', mid: '#d9837a', hor: '#ffd2a2', far: '#7a6a98', mid2: '#5a4a78', near: '#3a3150', ground: '#4a4a52', cloud: '#ffd8c8', shade: '#8a6a8a', light: '#ffb68a', sun: '#fff0d0'},
    {top: '#2f74c6', mid: '#7fb6e8', hor: '#e2f2ff', far: '#9ab2cc', mid2: '#6f8aa6', near: '#4a6250', ground: '#6a8a52', cloud: '#ffffff', shade: '#a8b8cc', light: '#ffffff', sun: '#fffbe8'},
    {top: '#2a3570', mid: '#ea8a4a', hor: '#ffd27a', far: '#9a6a6a', mid2: '#6a4458', near: '#3a2a3a', ground: '#5a4a3a', cloud: '#ffd2a0', shade: '#a26a6a', light: '#ffb050', sun: '#fff0c0'},
  ];
  const i = Math.min(1, Math.floor(clamp(tod, 0, 1.999)));
  const k = clamp(tod - i);
  const a = P[i];
  const b = P[i + 1];
  const o = {} as typeof a;
  (Object.keys(a) as (keyof typeof a)[]).forEach((key) => (o[key] = mixColor(a[key], b[key], k)));
  return o;
}
export type SkyPal = ReturnType<typeof skyPalette>;

export const SkyDome: React.FC<{pal: SkyPal}> = ({pal}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, ${pal.top} 0%, ${pal.mid} 52%, ${pal.hor} 78%, ${pal.hor} 100%)`}} />
);

const ridge = (seed: number, x0: number, x1: number, y: number, amp: number, step = 60) => {
  const pts: Vec[] = [];
  for (let x = x0; x <= x1; x += step) pts.push({x, y: y - Math.abs(fbm1(x * 0.0016, seed, 4)) * amp * 2.2 - fbm1(x * 0.008, seed + 3, 2) * amp * 0.2});
  return pts;
};

export const Mountains: React.FC<{seed: number; y: number; amp: number; color: string; snow?: string; haze: string; hazeK: number}> = React.memo(({seed, y, amp, color, snow, haze, hazeK}) => {
  const pts = useMemo(() => ridge(seed, -6000, 9000, y, amp), [seed, y, amp]);
  const d = smoothPath(pts) + `L9000,${y + 4000}L-6000,${y + 4000}Z`;
  const c = mixColor(color, haze, hazeK);
  const gid = `mt-${seed}`;
  const streaks = useMemo(() => {
    const r = rng(seed + 50);
    return pts.filter((_, i) => i % 3 === 0).map((p) => ({x: p.x, y: p.y, l: 60 + r() * amp * 0.9, a: (r() - 0.5) * 0.6}));
  }, [pts, seed, amp]);
  const snowPaths = useMemo(() => {
    if (!snow) return [];
    return pts
      .map((p, i) => ({p, i}))
      .filter(({p}) => p.y < y - amp * 1.4)
      .map(({p}) => `M${p.x - 40},${p.y + 50} L${p.x},${p.y} L${p.x + 40},${p.y + 46} L${p.x + 14},${p.y + 32} L${p.x - 8},${p.y + 44}Z`);
  }, [pts, snow, y, amp]);
  return (
    <g>
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="0" y1={y - amp * 2.2} x2="0" y2={y + 300}>
          <stop offset="0" stopColor={mixColor(c, '#ffffff', 0.12)} />
          <stop offset="0.55" stopColor={c} />
          <stop offset="1" stopColor={mixColor(c, haze, 0.45)} />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#${gid})`} />
      {streaks.map((st, i) => (
        <path key={`s${i}`} d={`M${st.x},${st.y + 8} q${st.l * st.a},${st.l * 0.5} ${st.l * st.a * 1.6},${st.l}`} stroke={mixColor(c, '#000000', 0.2)} strokeOpacity={0.25} strokeWidth={6} fill="none" strokeLinecap="round" />
      ))}
      {snowPaths.map((sp, i) => (
        <path key={i} d={sp} fill={mixColor(snow!, haze, hazeK * 0.6)} opacity={0.85} />
      ))}
    </g>
  );
});

/** Valle: praderas, bosques y un río sinuoso. */
export const Valley: React.FC<{y: number; pal: SkyPal; hazeK: number}> = React.memo(({y, pal, hazeK}) => {
  const geo = useMemo(() => {
    const r = rng(77);
    const river: Vec[] = [];
    for (let k = 0; k <= 40; k++) river.push({x: -5000 + k * 350, y: y + 260 + Math.sin(k * 0.7) * 120 + r() * 30});
    const trees = Array.from({length: 160}, () => ({x: -5000 + r() * 14000, y: y + 20 + r() * 900, s: 0.6 + r() * 1.2}));
    const fields = Array.from({length: 40}, () => ({x: -5000 + r() * 14000, y: y + 60 + r() * 700, w: 200 + r() * 500, h: 40 + r() * 80, c: r()}));
    return {river, trees, fields};
  }, [y]);
  const g = mixColor(pal.ground, pal.hor, hazeK);
  return (
    <g>
      <rect x={-6000} y={y} width={16000} height={6000} fill={g} />
      {geo.fields.map((f, i) => (
        <ellipse key={i} cx={f.x} cy={f.y} rx={f.w} ry={f.h} fill={mixColor(f.c < 0.5 ? '#8aa65a' : '#b0a65a', pal.hor, hazeK + 0.1)} opacity={0.5} />
      ))}
      <path d={smoothPath(geo.river)} stroke={mixColor('#8fc8e8', pal.light, 0.3)} strokeWidth={50} fill="none" opacity={0.8} strokeLinecap="round" />
      {geo.trees.map((tr, i) => (
        <path key={`t${i}`} d={`M${tr.x},${tr.y} l${-14 * tr.s},${30 * tr.s} l${28 * tr.s},0Z`} fill={mixColor('#2f4a2a', pal.hor, hazeK * 0.8)} />
      ))}
    </g>
  );
});

/** Acantilado del primer plano (cara rocosa con repisa, grietas y arbustos). */
export const Cliff: React.FC<{pal: SkyPal}> = React.memo(({pal}) => {
  const geo = useMemo(() => {
    const r = rng(88);
    const edge: Vec[] = [
      {x: -1600, y: -60},
      {x: -700, y: -70},
      {x: -420, y: -40},
      {x: -330, y: 0},
      {x: -200, y: 6},
      {x: -150, y: 60},
      {x: -180, y: 260},
      {x: -120, y: 520},
      {x: -200, y: 900},
      {x: -120, y: 1400},
      {x: -220, y: 2200},
      {x: -160, y: 3400},
    ];
    const cracks = Array.from({length: 14}, () => {
      const x = -1100 + r() * 900;
      const y = 80 + r() * 2600;
      return smoothPath([{x, y}, {x: x + (r() - 0.5) * 60, y: y + 120}, {x: x + (r() - 0.5) * 80, y: y + 260}]);
    });
    const bushes = Array.from({length: 18}, () => ({x: -1500 + r() * 1150, y: -60 + r() * 20, s: 0.6 + r()}));
    return {edge, cracks, bushes};
  }, []);
  const d = smoothPath(geo.edge) + 'L-1600,3400Z';
  return (
    <g>
      <defs>
        <linearGradient id="cl-rock" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor={mixColor('#3a3430', pal.near, 0.3)} />
          <stop offset="0.75" stopColor={mixColor('#6a5e52', pal.light, 0.15)} />
          <stop offset="1" stopColor={mixColor('#8a7a66', pal.light, 0.3)} />
        </linearGradient>
      </defs>
      <path d={d} fill="url(#cl-rock)" />
      <path d={smoothPath(geo.edge.slice(2))} stroke={pal.light} strokeOpacity={0.35} strokeWidth={6} fill="none" />
      {geo.cracks.map((c, i) => (
        <path key={i} d={c} stroke="#241e1a" strokeOpacity={0.5} strokeWidth={5} fill="none" />
      ))}
      {geo.bushes.map((b, i) => (
        <ellipse key={`b${i}`} cx={b.x} cy={b.y} rx={34 * b.s} ry={20 * b.s} fill={mixColor('#3f5a2a', pal.near, 0.3)} />
      ))}
      {/* repisa donde se posa el halcón */}
      <path d="M-420,-40 Q-330,-14 -200,6 L-190,24 Q-320,14 -430,-12Z" fill={mixColor('#8a7a66', pal.light, 0.25)} />
    </g>
  );
});

/** Nube estilizada con volumen: racimo de esferas iluminadas desde arriba + base plana. */
const Cloud: React.FC<{x: number; y: number; s: number; seed: number; pal: SkyPal; op: number}> = ({x, y, s, seed, pal, op}) => {
  const blobs = useMemo(() => {
    const r = rng(seed);
    const n = 12 + Math.floor(r() * 5);
    const out = Array.from({length: n}, (_, i) => {
      const u = i / (n - 1);
      return {dx: (u - 0.5) * 380 + (r() - 0.5) * 60, dy: -Math.pow(Math.sin(u * Math.PI), 0.8) * (60 + r() * 50) + r() * 20, r: 45 + r() * 65 * Math.sin(u * Math.PI + 0.3)};
    });
    // racimo superior más pequeño para un perfil irregular
    for (let k = 0; k < 4; k++) out.push({dx: (r() - 0.5) * 200, dy: -90 - r() * 50, r: 35 + r() * 35});
    return out.sort((a, b) => a.dy - b.dy);
  }, [seed]);
  const gid = `cl-${seed}`;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`} opacity={op}>
      <defs>
        <radialGradient id={gid} cx="0.42" cy="0.32" r="0.62">
          <stop offset="0" stopColor={pal.cloud} stopOpacity={0.98} />
          <stop offset="0.55" stopColor={mixColor(pal.cloud, pal.shade, 0.3)} stopOpacity={0.9} />
          <stop offset="0.85" stopColor={pal.shade} stopOpacity={0.55} />
          <stop offset="1" stopColor={pal.shade} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${gid}-h`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={mixColor(pal.shade, pal.cloud, 0.4)} stopOpacity={0.5} />
          <stop offset="1" stopColor={pal.shade} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={0} cy={10} rx={260} ry={60} fill={`url(#${gid}-h)`} />
      {blobs.map((b, i) => (
        <circle key={i} cx={b.dx} cy={b.dy} r={b.r * 1.15} fill={`url(#${gid})`} />
      ))}
    </g>
  );
};

/** Capa de nubes infinita: celdas con nube (determinista por celda); sólo las visibles. */
export const CloudLayer: React.FC<{depth: number; seed: number; cell: number; density: number; scale: number; pal: SkyPal; drift?: number; op?: number; yMin?: number; yMax?: number}> = ({
  depth,
  seed,
  cell,
  density,
  scale,
  pal,
  drift = 8,
  op = 1,
  yMin = -1e9,
  yMax = 1e9,
}) => {
  const t = useTime();
  const cam = useCamera();
  const {width, height} = useVideoConfig();
  const a = screenToWorld(cam, depth, {x: -400, y: -400});
  const b = screenToWorld(cam, depth, {x: width + 400, y: height + 400});
  const shift = t * drift;
  const out: React.ReactNode[] = [];
  const cx0 = Math.floor((a.x - shift) / cell);
  const cx1 = Math.ceil((b.x - shift) / cell);
  const cy0 = Math.floor(Math.max(a.y, yMin) / cell);
  const cy1 = Math.ceil(Math.min(b.y, yMax) / cell);
  for (let i = cx0; i <= cx1; i++) {
    for (let j = cy0; j <= cy1; j++) {
      const h = hash1(i * 31.7 + j * 17.3 + seed);
      if (h > density) continue;
      const x = i * cell + shift + hash1(i + j * 7 + seed) * cell * 0.6;
      const y = j * cell + hash1(i * 3 + j + seed) * cell * 0.6;
      if (y < yMin || y > yMax) continue;
      out.push(<Cloud key={`${i}:${j}`} x={x} y={y} s={scale * (0.6 + hash1(i - j + seed) * 0.8)} seed={Math.floor(h * 1000) + seed} pal={pal} op={op} />);
    }
  }
  return <ParallaxLayer depth={depth}>{out}</ParallaxLayer>;
};

/** Corrientes de aire: trazos translúcidos que fluyen (recurso visual discreto). */
export const AirCurrents: React.FC<{intensity: number; depth?: number; seed?: number; color?: string}> = ({intensity, depth = 0.9, seed = 5, color = '#ffffff'}) => {
  const t = useTime();
  const cam = useCamera();
  const {width, height} = useVideoConfig();
  if (intensity <= 0.01) return null;
  const a = screenToWorld(cam, depth, {x: 0, y: 0});
  const b = screenToWorld(cam, depth, {x: width, y: height});
  const lines = Array.from({length: 12}, (_, i) => {
    const y = a.y + (b.y - a.y) * hash1(i + seed);
    const len = (b.x - a.x) * (0.3 + hash1(i * 3 + seed) * 0.3);
    const ph = ((t * 0.15 + hash1(i * 7 + seed)) % 1) * 1.6 - 0.3;
    const x = a.x + (b.x - a.x) * ph;
    const pts: Vec[] = Array.from({length: 8}, (_, k) => ({x: x + (k / 7) * len, y: y + Math.sin(k * 0.8 + t * 0.8 + i) * 14}));
    return {d: smoothPath(pts), o: Math.sin(Math.PI * clamp(ph + 0.3) / 1.6)};
  });
  return (
    <ParallaxLayer depth={depth}>
      {lines.map((l, i) => (
        <path key={i} d={l.d} stroke={color} strokeOpacity={0.22 * intensity * l.o} strokeWidth={3} fill="none" strokeLinecap="round" />
      ))}
    </ParallaxLayer>
  );
};
