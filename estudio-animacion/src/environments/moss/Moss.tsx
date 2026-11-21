// Entornos del Ep. 03: bosque húmedo (A, G) y mundo microscópico del musgo (B, C).
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ParallaxLayer, useCamera, worldToScreen} from '../../engine/camera';
import {clamp, fbm1, hash1, mixColor, rng, smoothPath, Vec} from '../../engine/math';
import {useQuality} from '../../engine/quality';
import {useTime} from '../../engine/useTime';

// ------------------------------------------------------------------ partículas
/** Motas en suspensión (esporas/polvo o partículas microscópicas), canvas con parallax. */
export const Motes: React.FC<{color: string; count?: number; size?: number; drift?: Vec; seed?: number; opacity?: number}> = ({
  color,
  count = 90,
  size = 2,
  drift = {x: 6, y: -4},
  seed = 3,
  opacity = 1,
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const t = useTime();
  const cam = useCamera();
  const q = useQuality();
  const {width, height} = useVideoConfig();
  const n = Math.round(count * (q.name === 'draft' ? 0.5 : 1));
  const motes = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: n}, () => ({x: r() * 3000 - 1500, y: r() * 3000 - 1500, d: 0.4 + r() * 1.1, s: 0.6 + r() * 1.6, ph: r() * 10}));
  }, [n, seed]);
  useLayoutEffect(() => {
    const c = ref.current;
    const g = c?.getContext('2d');
    if (!c || !g) return;
    g.clearRect(0, 0, width, height);
    g.fillStyle = color;
    for (const m of motes) {
      const s = worldToScreen(cam, m.d, {x: m.x + drift.x * t + Math.sin(t * 0.4 + m.ph) * 14, y: m.y + drift.y * t + Math.cos(t * 0.35 + m.ph) * 10});
      const sx = ((((s.x + 80) % (width + 160)) + width + 160) % (width + 160)) - 80;
      const sy = ((((s.y + 80) % (height + 160)) + height + 160) % (height + 160)) - 80;
      g.globalAlpha = opacity * (0.25 + 0.45 * m.d) * (0.6 + 0.4 * Math.sin(t * 2 + m.ph));
      g.beginPath();
      g.arc(sx, sy, m.s * size * Math.min(3, s.scale), 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
  }, [t, cam, motes, width, height, color, drift.x, drift.y, size, opacity]);
  return (
    <AbsoluteFill>
      <canvas ref={ref} width={width} height={height} style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ gota de agua
/** Gota esférica: transparente, borde brillante, refracción invertida y reflejo especular. */
export const Droplet: React.FC<{x: number; y: number; r: number; id: string; wobble?: number; tint?: string; opacity?: number}> = ({x, y, r, id, wobble = 0, tint = '#bfe8d0', opacity = 1}) => {
  if (r <= 0.5) return null;
  const sx = 1 + wobble * 0.05;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${sx.toFixed(3)} ${(2 - sx).toFixed(3)})`} opacity={opacity}>
      <defs>
        <radialGradient id={`${id}-d`} cx="0.5" cy="0.62" r="0.55">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.05} />
          <stop offset="0.7" stopColor={tint} stopOpacity={0.18} />
          <stop offset="0.93" stopColor="#ffffff" stopOpacity={0.55} />
          <stop offset="1" stopColor={tint} stopOpacity={0.2} />
        </radialGradient>
      </defs>
      <ellipse cx={0} cy={r * 0.98} rx={r * 0.8} ry={r * 0.14} fill="#0a1a0c" opacity={0.25} />
      <circle r={r} fill={`url(#${id}-d)`} />
      <path d={`M${-r * 0.7},${r * 0.25} Q0,${r * 0.75} ${r * 0.7},${r * 0.25}`} stroke="#203a1c" strokeOpacity={0.25} strokeWidth={r * 0.12} fill="none" />
      <ellipse cx={-r * 0.35} cy={-r * 0.42} rx={r * 0.28} ry={r * 0.16} fill="#ffffff" opacity={0.85} transform={`rotate(-30 ${-r * 0.35} ${-r * 0.42})`} />
      <circle cx={r * 0.38} cy={r * 0.4} r={r * 0.07} fill="#ffffff" opacity={0.7} />
    </g>
  );
};

// ------------------------------------------------------------------ A · BOSQUE
const Moss: React.FC<{x: number; y: number; w: number; seed: number}> = React.memo(({x, y, w, seed}) => {
  const t = useTime();
  const tufts = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: Math.round(w / 6)}, () => ({x: (r() - 0.5) * w, h: 10 + r() * 26, lean: (r() - 0.5) * 10, c: r()}));
  }, [w, seed]);
  const spores = useMemo(() => {
    const r = rng(seed + 1);
    return Array.from({length: Math.round(w / 60)}, () => ({x: (r() - 0.5) * w * 0.9, h: 50 + r() * 50, ph: r() * 6}));
  }, [w, seed]);
  const cols = ['#3f7a2a', '#5f9a34', '#8bbd45', '#2c5a22'];
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={6} rx={w * 0.52} ry={26} fill="#2a4a1c" />
      {tufts.map((tf, i) => (
        <path key={i} d={`M${tf.x},0 q${tf.lean * 0.4},${-tf.h * 0.6} ${tf.lean},${-tf.h}`} stroke={cols[Math.floor(tf.c * 4)]} strokeWidth={4} strokeLinecap="round" fill="none" />
      ))}
      {/* esporófitos (seta + cápsula) que se mecen */}
      {spores.map((sp, i) => {
        const sw = Math.sin(t * 1.2 + sp.ph) * 5;
        return (
          <g key={`s${i}`}>
            <path d={`M${sp.x},0 q${sw * 0.5},${-sp.h * 0.6} ${sw},${-sp.h}`} stroke="#a3742c" strokeWidth={1.6} fill="none" />
            <ellipse cx={sp.x + sw} cy={-sp.h - 4} rx={3} ry={6} fill="#7a4e1c" transform={`rotate(${sw * 3} ${sp.x + sw} ${-sp.h - 4})`} />
          </g>
        );
      })}
    </g>
  );
});

const Leaf: React.FC<{x: number; y: number; len: number; ang: number; color: string; seed: number; drop?: number}> = ({x, y, len, ang, color, seed, drop = 0}) => {
  const t = useTime();
  const a = ang + Math.sin(t * 0.8 + seed) * 0.05 + fbm1(t * 0.3, seed) * 0.04;
  const w = len * 0.28;
  const d = `M0,0 C${len * 0.3},${-w} ${len * 0.75},${-w * 0.8} ${len},0 C${len * 0.75},${w * 0.8} ${len * 0.3},${w} 0,0Z`;
  // gota que se forma en la punta, cae y se repite
  const cyc = ((t + seed * 1.3) % 3.4) / 3.4;
  const dr = drop ? 6 + 6 * Math.min(1, cyc / 0.7) : 0;
  const fall = cyc > 0.7 ? ((cyc - 0.7) / 0.3) ** 2 * 420 : 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${((a * 180) / Math.PI).toFixed(2)})`}>
      <path d={d} fill={color} />
      <path d={`M0,0 L${len},0`} stroke={mixColor(color, '#ffffff', 0.25)} strokeOpacity={0.5} strokeWidth={2} />
      <path d={d} fill="none" stroke="#e9ffd0" strokeOpacity={0.2} strokeWidth={1.5} />
      {drop > 0 && <circle cx={len + 2} cy={dr * 0.6 + fall} r={dr * (cyc > 0.7 ? 0.8 : 1)} fill="#d9f3ff" opacity={0.75} />}
    </g>
  );
};

export const Forest: React.FC = () => {
  const {width, height} = useVideoConfig();
  const t = useTime();
  const trunks = useMemo(() => {
    const r = rng(41);
    return Array.from({length: 9}, () => ({x: -1600 + r() * 3200, w: 60 + r() * 120}));
  }, []);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #c9e2a0 0%, #7fae5c 28%, #2f5a2a 62%, #142a14 100%)'}} />
      <AbsoluteFill>
      <svg width={width} height={height}>
        <defs>
          <linearGradient id="fr-ray" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff6c8" stopOpacity={0.9} />
            <stop offset="1" stopColor="#fff6c8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="fr-bark" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3a2a1a" />
            <stop offset="0.5" stopColor="#5a432a" />
            <stop offset="1" stopColor="#2a1c10" />
          </linearGradient>
        </defs>
        <ParallaxLayer depth={0.12}>
          {trunks.map((tr, i) => (
            <rect key={i} x={tr.x} y={-1600} width={tr.w * 0.6} height={3200} fill="#6f9a5a" opacity={0.45} />
          ))}
        </ParallaxLayer>
        <ParallaxLayer depth={0.25}>
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M${-500 + i * 260 + Math.sin(t * 0.2 + i) * 20},-1500 l80,0 l${300 + i * 30},3000 l-260,0Z`} fill="url(#fr-ray)" opacity={0.12 + 0.05 * Math.sin(t * 0.6 + i)} />
          ))}
        </ParallaxLayer>
        <ParallaxLayer depth={0.45}>
          {trunks.slice(0, 5).map((tr, i) => (
            <rect key={i} x={tr.x * 0.7 - 300} y={-1600} width={tr.w * 1.3} height={3200} fill="url(#fr-bark)" opacity={0.85} />
          ))}
          <Leaf x={-520} y={-200} len={260} ang={0.3} color="#3f7a2a" seed={2} />
          <Leaf x={420} y={-380} len={300} ang={2.8} color="#4f8a2e" seed={3} drop={1} />
        </ParallaxLayer>
        <ParallaxLayer depth={1}>
          {/* tronco caído cubierto de musgo */}
          <path d="M-1400,520 C-700,380 300,360 1400,470 L1400,1400 L-1400,1400Z" fill="url(#fr-bark)" />
          <path d="M-1400,520 C-700,380 300,360 1400,470" stroke="#7a5a36" strokeWidth={6} fill="none" opacity={0.6} />
          {Array.from({length: 26}, (_, i) => {
            const x = -1350 + i * 108;
            return <path key={`bk${i}`} d={`M${x},${560 - Math.abs(x) * 0.05} q${30},${260} ${-10},${700}`} stroke="#22160c" strokeOpacity={0.45} strokeWidth={5} fill="none" />;
          })}
          {/* cojín de musgo sobre el tronco */}
          {Array.from({length: 22}, (_, i) => {
            const x = -1300 + i * 125;
            const y = 470 - 90 * Math.exp(-((x / 900) ** 2)) + 10;
            return <ellipse key={`cu${i}`} cx={x} cy={y} rx={110} ry={44} fill={i % 2 ? '#4f8a2e' : '#3f7a28'} />;
          })}
          {Array.from({length: 22}, (_, i) => {
            const x = -1300 + i * 125 + 40;
            const y = 470 - 90 * Math.exp(-((x / 900) ** 2)) - 6;
            return <ellipse key={`ch${i}`} cx={x} cy={y} rx={60} ry={16} fill="#9fd05a" opacity={0.35} />;
          })}
          <Moss x={0} y={430} w={900} seed={5} />
          <Moss x={-700} y={470} w={600} seed={6} />
          <Moss x={720} y={455} w={600} seed={7} />
          {[-120, 60, 200, -300].map((dx, i) => (
            <Droplet key={i} id={`fd${i}`} x={dx} y={392 - (i % 2) * 8} r={7 + (i % 3) * 3} wobble={Math.sin(t * 2 + i)} />
          ))}
        </ParallaxLayer>
        <ParallaxLayer depth={1.6}>
          <Leaf x={-900} y={900} len={520} ang={-0.5} color="#1d3a14" seed={8} />
          <Leaf x={900} y={-900} len={560} ang={2.2} color="#22441a" seed={9} drop={1} />
        </ParallaxLayer>
      </svg>
      </AbsoluteFill>
      <Motes color="#fff4c8" count={70} size={2.2} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ B/C · MUNDO MICROSCÓPICO
export const STEM = {y0: 250, amp: 60, k: 0.0022, r: 26};
export const stemY = (x: number) => STEM.y0 + Math.sin(x * STEM.k + 0.8) * STEM.amp;
export const stemTop = (x: number) => stemY(x) - STEM.r;
export const stemSlope = (x: number) => Math.atan(Math.cos(x * STEM.k + 0.8) * STEM.amp * STEM.k);

type LeafSpec = {x: number; side: 1 | -1; len: number; ang: number; seed: number};

const MossLeaflet: React.FC<{spec: LeafSpec; dry: number; t: number; color: string; cells: string; front?: boolean}> = ({spec, dry, t, color, cells}) => {
  const curl = dry * 0.75;
  const base = {x: spec.x, y: stemY(spec.x) + spec.side * STEM.r * 0.6};
  const a = spec.ang * (1 - curl * 0.6) + Math.sin(t * 0.7 + spec.seed) * 0.03 * (1 - dry);
  const L = spec.len * (1 - dry * 0.15);
  const W = spec.len * 0.22 * (1 - dry * 0.45);
  const d = `M0,0 C${L * 0.25},${-W} ${L * 0.7},${-W * 0.8} ${L},${-curl * 30} C${L * 0.7},${W * 0.7} ${L * 0.25},${W} 0,0Z`;
  const fill = mixColor(color, '#8a6a34', dry);
  return (
    <g transform={`translate(${base.x.toFixed(1)} ${base.y.toFixed(1)}) rotate(${((a * 180) / Math.PI).toFixed(2)})`}>
      <path d={d} fill={fill} opacity={0.92} />
      <path d={d} fill={`url(#${cells})`} opacity={0.55 * (1 - dry * 0.5)} />
      <path d={`M0,0 Q${L * 0.5},${-curl * 10} ${L * 0.95},${-curl * 28}`} stroke={mixColor(fill, '#ffffff', 0.3)} strokeOpacity={0.6} strokeWidth={3} fill="none" />
      <path d={d} fill="none" stroke={mixColor(fill, '#fff8d8', 0.5)} strokeOpacity={0.5} strokeWidth={2} />
    </g>
  );
};

export const MicroMoss: React.FC<{dry: number; front?: boolean; children?: React.ReactNode; foreground?: React.ReactNode}> = ({dry, children, foreground}) => {
  const t = useTime();
  const {width, height} = useVideoConfig();
  const leaves = useMemo(() => {
    const r = rng(61);
    const out: LeafSpec[] = [];
    for (let x = -1500; x < 1500; x += 70 + r() * 60) {
      const side = r() < 0.5 ? 1 : -1;
      // lado -1: hojas que salen hacia arriba (detrás del animal); lado +1: hacia abajo (delante)
      out.push({x, side: side as 1 | -1, len: 140 + r() * 120, ang: side < 0 ? -0.8 - r() * 0.8 : 0.45 + r() * 0.6, seed: r() * 10});
    }
    return out;
  }, []);
  const far = useMemo(() => {
    const r = rng(62);
    return Array.from({length: 14}, () => ({x: -1800 + r() * 3600, y: -600 + r() * 900, len: 300 + r() * 400, ang: -1.8 + r() * 1.2, seed: r() * 10}));
  }, []);
  const drops = useMemo(() => {
    const r = rng(63);
    return Array.from({length: 9}, (_, i) => ({x: -1300 + i * 320 + r() * 120, r: 26 + r() * 40, side: r() < 0.5 ? -1 : 1}));
  }, []);
  const bg = dry > 0 ? `linear-gradient(180deg, ${mixColor('#6f9a5a', '#c9a066', dry)} 0%, ${mixColor('#1f3a1c', '#4a3418', dry)} 70%, ${mixColor('#0c1a0c', '#24180a', dry)} 100%)` : 'linear-gradient(180deg, #6f9a5a 0%, #1f3a1c 70%, #0c1a0c 100%)';
  const green = '#4f9a3a';
  const stemPath = (() => {
    const top: Vec[] = [];
    const bot: Vec[] = [];
    for (let x = -1700; x <= 1700; x += 80) {
      top.push({x, y: stemY(x) - STEM.r});
      bot.push({x, y: stemY(x) + STEM.r});
    }
    return smoothPath([...top, ...bot.reverse()], true);
  })();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: bg}} />
      <AbsoluteFill>
      <svg width={width} height={height}>
        <defs>
          <pattern id="mm-cells" width={22} height={11} patternUnits="userSpaceOnUse" patternTransform="rotate(-20)">
            <rect width={22} height={11} fill="none" stroke="#d8f7b0" strokeOpacity={0.55} strokeWidth={1.2} />
            <circle cx={8} cy={5} r={2} fill="#7fd04a" opacity={0.6} />
          </pattern>
          <radialGradient id="mm-bokeh" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#f6ffd8" stopOpacity={0.3} />
            <stop offset="1" stopColor="#f6ffd8" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="mm-stem" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={mixColor('#8fc05a', '#b08a4a', dry)} />
            <stop offset="0.5" stopColor={mixColor('#3f7a2a', '#6a4a22', dry)} />
            <stop offset="1" stopColor={mixColor('#1f3a14', '#3a2610', dry)} />
          </linearGradient>
        </defs>
        <ParallaxLayer depth={0.3}>
          {far.map((f, i) => (
            <g key={i} transform={`translate(${f.x} ${f.y}) rotate(${(f.ang * 180) / Math.PI + Math.sin(t * 0.3 + f.seed) * 2})`} opacity={0.35}>
              <path d={`M0,0 C${f.len * 0.3},${-f.len * 0.2} ${f.len * 0.7},${-f.len * 0.16} ${f.len},0 C${f.len * 0.7},${f.len * 0.14} ${f.len * 0.3},${f.len * 0.2} 0,0Z`} fill={mixColor('#5f8f4a', '#9a7a4a', dry)} />
            </g>
          ))}
          {Array.from({length: 10}, (_, i) => (
            <circle key={`b${i}`} cx={-1500 + hash1(i) * 3000} cy={-800 + hash1(i + 5) * 1600} r={60 + hash1(i + 9) * 120} fill="url(#mm-bokeh)" />
          ))}
        </ParallaxLayer>
        <ParallaxLayer depth={0.65}>
          {leaves.filter((_, i) => i % 3 === 0).map((l, i) => (
            <g key={i} transform="translate(0 -420) scale(0.8)" opacity={0.7}>
              <MossLeaflet spec={{...l, x: l.x * 1.2}} dry={dry} t={t} color="#3f7a32" cells="mm-cells" />
            </g>
          ))}
        </ParallaxLayer>
        <ParallaxLayer depth={1}>
          {leaves.filter((l) => l.side < 0).map((l, i) => (
            <MossLeaflet key={`b${i}`} spec={l} dry={dry} t={t} color={green} cells="mm-cells" />
          ))}
          <path d={stemPath} fill="url(#mm-stem)" />
          <path d={smoothPath(Array.from({length: 43}, (_, i) => ({x: -1700 + i * 80, y: stemY(-1700 + i * 80) - STEM.r + 4})))} stroke="#eaffc8" strokeOpacity={0.4} strokeWidth={3} fill="none" />
          {drops.map((d, i) => {
            const rr = d.r * Math.pow(clamp(1 - dry * 1.15), 0.7);
            return <Droplet key={i} id={`md${i}`} x={d.x} y={stemTop(d.x) - rr * 0.92} r={rr} wobble={Math.sin(t * 1.5 + i)} />;
          })}
          {children}
          {leaves.filter((l) => l.side > 0).map((l, i) => (
            <MossLeaflet key={`f${i}`} spec={l} dry={dry} t={t} color={mixColor(green, '#7fc04a', 0.2)} cells="mm-cells" />
          ))}
        </ParallaxLayer>
        {foreground}
      </svg>
      </AbsoluteFill>
      <Motes color={dry > 0.5 ? '#f3d9a8' : '#e8ffd8'} count={80} size={2.6} drift={{x: 4 + dry * 10, y: -3}} />
      {/* viñeta circular de microscopio */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 46%, rgba(0,0,0,0) 52%, rgba(4,10,4,0.55) 80%, rgba(2,6,2,0.85) 100%)'}} />
    </AbsoluteFill>
  );
};
