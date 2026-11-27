// Fondo del humedal (sabana húmeda soleada): cielo, pinos lejanos, pastizal, charcos y
// hierbas cercanas en capas de parallax. En los planos macro el fondo se desenfoca (bokeh).
import React, {useMemo} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ParallaxLayer} from '../../../engine/camera';
import {clamp, hash1, mixColor, rng, Vec} from '../../../engine/math';
import {useTime} from '../../../engine/useTime';

export type Light = {top: string; hor: string; sun: string; haze: string; warm: number; dark: number};

/** Luz del día; `night` (0–1) oscurece durante el salto temporal de varios días. */
export function lightAt(night: number): Light {
  return {
    top: mixColor('#6fb2e3', '#0d1a33', night),
    hor: mixColor('#f4e7b9', '#28324a', night),
    sun: mixColor('#fff6d6', '#cfd8ff', night),
    haze: mixColor('#cfe3d0', '#2a3446', night),
    warm: 1 - night,
    dark: night,
  };
}

const Pines: React.FC<{seed: number; y: number; n: number; color: string; h: number}> = React.memo(({seed, y, n, color, h}) => {
  const r = rng(seed);
  const trees = Array.from({length: n}, () => ({x: -2600 + r() * 5200, s: 0.6 + r() * 0.7, lean: (r() - 0.5) * 0.08}));
  const dark = mixColor(color, '#000000', 0.18);
  return (
    <g>
      {trees.map((t, i) => {
        const H = h * t.s;
        const top = {x: t.x + t.lean * H, y: y - H};
        // pino de hoja larga: tronco recto y fino, ramas cortas y copa abierta e irregular
        const clumps: React.ReactNode[] = [];
        const nb = 4 + Math.floor(hash1(seed + i) * 3);
        for (let b = 0; b < nb; b++) {
          const fy = 0.02 + (b / nb) * 0.22;
          const side = b % 2 ? 1 : -1;
          const bx = top.x - t.lean * H * fy + side * (18 + hash1(i * 5 + b) * 46) * t.s;
          const by = top.y + fy * H;
          const rr = (34 + hash1(i * 3 + b) * 26) * t.s;
          clumps.push(<path key={`br${b}`} d={`M${top.x - t.lean * H * fy},${by + 6} L${bx},${by}`} stroke={color} strokeWidth={2.4 * t.s} />);
          for (let c = 0; c < 4; c++) {
            const a = hash1(i * 11 + b * 7 + c) * Math.PI * 2;
            clumps.push(<ellipse key={`c${b}${c}`} cx={bx + Math.cos(a) * rr * 0.7} cy={by + Math.sin(a) * rr * 0.35} rx={rr * 0.75} ry={rr * 0.42} fill={c % 2 ? color : dark} />);
          }
        }
        return (
          <g key={i}>
            <path d={`M${t.x - 3 * t.s},${y} L${top.x - 1.2},${top.y + 12} L${top.x + 1.2},${top.y + 12} L${t.x + 3 * t.s},${y}Z`} fill={dark} />
            {clumps}
          </g>
        );
      })}
    </g>
  );
});

const GrassBand: React.FC<{seed: number; y: number; color: string; tip: string; n: number; h: number; w: number}> = React.memo(({seed, y, color, tip, n, h, w}) => {
  const r = rng(seed);
  const blades: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + r() * w;
    const hh = h * (0.5 + r() * 0.8);
    const bend = (r() - 0.5) * hh * 0.5;
    blades.push(`M${(x - 2.5).toFixed(0)},${y} Q${(x + bend * 0.4).toFixed(0)},${(y - hh * 0.6).toFixed(0)} ${(x + bend).toFixed(0)},${(y - hh).toFixed(0)} Q${(x + bend * 0.4 + 2).toFixed(0)},${(y - hh * 0.55).toFixed(0)} ${(x + 2.5).toFixed(0)},${y}Z`);
  }
  return (
    <g>
      <rect x={-w / 2} y={y - 2} width={w} height={1600} fill={color} />
      <path d={blades.join('')} fill={color} />
      <path d={blades.filter((_, i) => i % 3 === 0).join('')} fill={tip} opacity={0.5} />
    </g>
  );
});

/** Fondo completo. `zoom` controla el desenfoque macro; `light` la hora/salto temporal. */
export const Wetland: React.FC<{light: Light; zoom: number}> = ({light, zoom}) => {
  const {width, height} = useVideoConfig();
  const t = useTime();
  const blur = clamp((zoom - 0.45) * 3.2, 0, 14);
  // insectos lejanos (puntos que revolotean)
  const bugs = useMemo(() => Array.from({length: 7}, (_, i) => ({x0: -1500 + hash1(i * 9) * 3000, y0: -420 + hash1(i * 4) * 300, f: 0.6 + hash1(i) * 0.8})), []);
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${light.top} 0%, ${mixColor(light.top, light.hor, 0.6)} 38%, ${light.hor} 62%, ${mixColor(light.hor, '#5e7a3a', 0.6)} 100%)`}} />
      <AbsoluteFill style={blur > 0.3 ? {filter: `blur(${blur.toFixed(1)}px)`} : undefined}>
        <svg width={width} height={height}>
          <defs>
            <radialGradient id="wl-sun" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={light.sun} stopOpacity={1} />
              <stop offset="0.3" stopColor={light.sun} stopOpacity={0.5} />
              <stop offset="1" stopColor={light.sun} stopOpacity={0} />
            </radialGradient>
            <linearGradient id="wl-water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={mixColor(light.top, '#ffffff', 0.4)} />
              <stop offset="1" stopColor={mixColor(light.top, '#3a5a40', 0.5)} />
            </linearGradient>
          </defs>
          <ParallaxLayer depth={0.02}>
            <circle cx={900} cy={-1500} r={900} fill="url(#wl-sun)" opacity={0.8 * light.warm + 0.2} />
            <circle cx={900} cy={-1500} r={110} fill={light.sun} opacity={0.9} />
          </ParallaxLayer>
          <ParallaxLayer depth={0.06}>
            <Pines seed={5} y={-260} n={44} color={mixColor('#6f8f86', light.haze, 0.55)} h={520} />
            <rect x={-3000} y={-262} width={6000} height={1400} fill={mixColor('#8aa27a', light.haze, 0.5)} />
          </ParallaxLayer>
          <ParallaxLayer depth={0.12}>
            <Pines seed={9} y={-180} n={20} color={mixColor('#4f6f5a', light.haze, 0.35)} h={640} />
            <GrassBand seed={3} y={-180} color={mixColor('#7f9a52', light.haze, 0.3)} tip="#c9d38a" n={260} h={60} w={6000} />
          </ParallaxLayer>
          <ParallaxLayer depth={0.22}>
            <GrassBand seed={7} y={-40} color={mixColor('#6a8a3e', light.haze, 0.2)} tip="#d7dc8c" n={260} h={130} w={5200} />
            {/* charcos del humedal con reflejos */}
            {[-1400, -300, 900, 1900].map((x, i) => (
              <ellipse key={i} cx={x} cy={40 + i * 18} rx={260 + i * 40} ry={26} fill="url(#wl-water)" opacity={0.85} />
            ))}
          </ParallaxLayer>
          <ParallaxLayer depth={0.3}>
            {bugs.map((b, i) => (
              <circle key={i} cx={b.x0 + Math.sin(t * b.f * 2 + i) * 120 + t * 12 * (i % 2 ? 1 : -1)} cy={b.y0 + Math.sin(t * b.f * 5.3 + i * 2) * 26} r={3} fill="#2a2a22" opacity={0.6} />
            ))}
          </ParallaxLayer>
          <ParallaxLayer depth={0.4}>
            <GrassBand seed={11} y={120} color={mixColor('#4f7a2e', light.haze, 0.12)} tip="#b9cf6a" n={220} h={260} w={4200} />
          </ParallaxLayer>
        </svg>
      </AbsoluteFill>
    </>
  );
};

/** Rayos de sol filtrados + partículas ambientales (polen, polvo) en primer plano. */
export const SunRays: React.FC<{light: Light; k: number}> = ({light, k}) => {
  const {width, height} = useVideoConfig();
  const t = useTime();
  if (k <= 0.01) return null;
  const rays = [0, 1, 2, 3, 4].map((i) => {
    const x = width * (0.55 + i * 0.12) + Math.sin(t * 0.15 + i) * 30;
    const w = 60 + 40 * hash1(i);
    return `M${x},-50 L${x + w},-50 L${x - 700 + w * 3},${height} L${x - 700},${height}Z`;
  });
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
      <svg width={width} height={height}>
        <defs>
          <linearGradient id="ray-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={light.sun} stopOpacity={0.35} />
            <stop offset="1" stopColor={light.sun} stopOpacity={0} />
          </linearGradient>
        </defs>
        {rays.map((d, i) => (
          <path key={i} d={d} fill="url(#ray-g)" opacity={k * light.warm * (0.35 + 0.25 * Math.sin(t * 0.4 + i * 1.7))} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

export const Particles: React.FC<{n: number; light: Light}> = ({n, light}) => {
  const {width, height} = useVideoConfig();
  const t = useTime();
  const pts: (Vec & {r: number; o: number})[] = [];
  for (let i = 0; i < n; i++) {
    const sp = 8 + hash1(i * 3) * 20;
    const x = ((hash1(i) * width + Math.sin(t * 0.3 + i) * 40 + t * sp * 0.6) % (width + 40)) - 20;
    const y = ((hash1(i * 7) * height - t * sp + 4000) % (height + 40)) - 20;
    pts.push({x, y, r: 1.2 + hash1(i * 11) * 2.6, o: 0.25 + 0.4 * hash1(i * 13)});
  }
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={width} height={height}>
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={mixColor('#fff4cf', light.sun, 0.5)} opacity={p.o * (0.4 + 0.6 * light.warm)} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};


/** Primer plano desenfocado (macro): briznas y bokeh muy cerca de la cámara. */
export const ForegroundBlur: React.FC<{zoom: number; light: Light}> = ({zoom, light}) => {
  const {width, height} = useVideoConfig();
  const t = useTime();
  const k = clamp((zoom - 1.2) / 1.2);
  if (k <= 0.01) return null;
  const blades = Array.from({length: 9}, (_, i) => {
    const x = -1500 + i * 300 + hash1(i * 3) * 140;
    const y = 260 + hash1(i * 5) * 120;
    const h = 500 + hash1(i * 7) * 500;
    const bend = (hash1(i * 11) - 0.5) * 200 + Math.sin(t * 0.8 + i) * 12;
    const w = 26 + hash1(i) * 22;
    return `M${x - w},${y} Q${x + bend * 0.4},${y - h * 0.6} ${x + bend},${y - h} Q${x + bend * 0.4 + w * 0.4},${y - h * 0.55} ${x + w},${y}Z`;
  });
  return (
    <AbsoluteFill style={{filter: 'blur(9px)', opacity: 0.6 * k, pointerEvents: 'none', WebkitMaskImage: 'radial-gradient(ellipse 48% 42% at 50% 45%, transparent 55%, black 100%)', maskImage: 'radial-gradient(ellipse 48% 42% at 50% 45%, transparent 55%, black 100%)'}}>
      <svg width={width} height={height}>
        <ParallaxLayer depth={1.6}>
          {blades.map((d, i) => (
            <path key={i} d={d} fill={mixColor(i % 2 ? '#2f5a1c' : '#3f6e22', light.haze, 0.1)} />
          ))}
          {Array.from({length: 8}, (_, i) => (
            <circle key={`b${i}`} cx={-1400 + hash1(i * 13) * 2400} cy={-500 + hash1(i * 17) * 700} r={22 + hash1(i) * 30} fill={light.sun} opacity={0.25} />
          ))}
        </ParallaxLayer>
      </svg>
    </AbsoluteFill>
  );
};
