// ESCENARIO — ARRECIFE TROPICAL. Planos: (1) agua azul profundo/turquesa con rayos y reflejos de
// superficie; (2) arrecife lejano en bruma violeta (parallax 0,3); (3) corales medios: ramificados,
// redondeados (cerebro), abanicos y rocas (0,6) con cardúmenes; (4) plano del personaje: arena con
// ondulaciones, rocas, corales naranja, algas que ondean, peces pequeños; (5) ReefFront: partículas y
// coral desenfocado. Desenfoques en coordenadas de pantalla (sin recortes al hacer zoom). Determinista.
import React from 'react';
import {hash1, mixColor} from '../../../engine/math';
import {Cam, layerT} from '../../../studio2';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
export const SAND = 520;

const Blur: React.FC<{id: string; r: number}> = ({id, r}) => (
  <filter id={id} filterUnits="userSpaceOnUse" x={-200} y={-200} width={1480} height={2320}>
    <feGaussianBlur stdDeviation={r} />
  </filter>
);

/** Coral ramificado (ramas recursivas deterministas que ondean apenas). */
export const BranchCoral: React.FC<{x: number; y: number; s: number; seed: number; c: string; t: number}> = ({x, y, s, seed, c, t}) => {
  const segs: string[] = [];
  const tips: {x: number; y: number}[] = [];
  const grow = (px: number, py: number, ang: number, len: number, depth: number, k: number) => {
    const sway = Math.sin(t * 0.6 + seed + k) * 0.03 * (4 - depth);
    const nx = px + Math.cos(ang + sway) * len;
    const ny = py + Math.sin(ang + sway) * len;
    segs.push(`M${f1(px)},${f1(py)} L${f1(nx)},${f1(ny)}`);
    if (depth >= 3) {
      tips.push({x: nx, y: ny});
      return;
    }
    const spread = 0.35 + 0.25 * hash1(seed * 7 + k);
    grow(nx, ny, ang - spread, len * 0.72, depth + 1, k * 2 + 1);
    grow(nx, ny, ang + spread * 0.9, len * 0.7, depth + 1, k * 2 + 2);
  };
  grow(x, y, -Math.PI / 2 + (hash1(seed) - 0.5) * 0.3, 70 * s, 0, 1);
  return (
    <g>
      <path d={segs.join(' ')} stroke={mixColor(c, '#000', 0.25)} strokeWidth={14 * s} strokeLinecap="round" />
      <path d={segs.join(' ')} stroke={c} strokeWidth={10 * s} strokeLinecap="round" />
      {tips.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={6 * s} fill={mixColor(c, '#fff', 0.35)} />)}
    </g>
  );
};

/** Coral cerebro / redondeado con surcos. */
export const DomeCoral: React.FC<{x: number; y: number; w: number; h: number; c: string; seed: number}> = ({x, y, w, h, c, seed}) => (
  <g>
    <path d={`M${f1(x - w / 2)},${f1(y)} C${f1(x - w / 2)},${f1(y - h * 1.3)} ${f1(x + w / 2)},${f1(y - h * 1.3)} ${f1(x + w / 2)},${f1(y)}Z`} fill={c} />
    {Array.from({length: 6}, (_, i) => {
      const yy = y - h * (0.15 + i * 0.14);
      const ww = w * 0.45 * Math.sqrt(1 - ((i * 0.14 + 0.15) / 1.05) ** 2);
      return <path key={i} d={`M${f1(x - ww)},${f1(yy)} q${f1(ww * 0.5)},${f1(-8 + hash1(seed + i) * 6)} ${f1(ww)},0 t${f1(ww)},0`} stroke={mixColor(c, '#000', 0.3)} strokeWidth={3} fill="none" />;
    })}
    <path d={`M${f1(x - w * 0.3)},${f1(y - h * 0.9)} q${f1(w * 0.3)},${f1(-h * 0.2)} ${f1(w * 0.5)},${f1(-h * 0.05)}`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.25} strokeLinecap="round" />
  </g>
);

/** Abanico de mar (gorgonia) con retícula, ondea con la corriente. */
export const SeaFan: React.FC<{x: number; y: number; s: number; c: string; t: number; seed: number}> = ({x, y, s, c, t, seed}) => {
  const sw = Math.sin(t * 0.7 + seed) * 10 * s;
  const ribs = Array.from({length: 9}, (_, i) => {
    const a = -Math.PI / 2 + (i - 4) * 0.17;
    const L = 160 * s * (0.8 + 0.2 * Math.cos((i - 4) * 0.4));
    return `M${f1(x)},${f1(y)} Q${f1(x + Math.cos(a) * L * 0.5 + sw * 0.3)},${f1(y + Math.sin(a) * L * 0.5)} ${f1(x + Math.cos(a) * L + sw)},${f1(y + Math.sin(a) * L)}`;
  });
  const arcs = [0.4, 0.6, 0.8, 0.95].map((k) => {
    const pts = Array.from({length: 9}, (_, i) => {
      const a = -Math.PI / 2 + (i - 4) * 0.17;
      const L = 160 * s * k * (0.8 + 0.2 * Math.cos((i - 4) * 0.4));
      return `${f1(x + Math.cos(a) * L + sw * k)},${f1(y + Math.sin(a) * L)}`;
    });
    return `M${pts.join(' L')}`;
  });
  return <path d={[...ribs, ...arcs].join(' ')} stroke={c} strokeWidth={3 * s + 1} fill="none" opacity={0.9} />;
};

export const Algae: React.FC<{x: number; base: number; h: number; t: number; seed: number; c: string}> = ({x, base, h, t, seed, c}) => (
  <g>
    {Array.from({length: 5}, (_, i) => {
      const x0 = x + (i - 2) * 9;
      const sw = Math.sin(t * 1.0 + seed + i * 0.8) * 22;
      const hh = h * (0.65 + 0.35 * hash1(seed + i * 3));
      return <path key={i} d={`M${f1(x0)},${base} C${f1(x0 + sw * 0.2)},${f1(base - hh * 0.35)} ${f1(x0 - sw * 0.3)},${f1(base - hh * 0.7)} ${f1(x0 + sw)},${f1(base - hh)}`} stroke={c} strokeWidth={8 - i} fill="none" strokeLinecap="round" />;
    })}
  </g>
);

export const Rock: React.FC<{x: number; y: number; w: number; h: number; seed: number; c?: string}> = ({x, y, w, h, seed, c = '#3a4a5a'}) => {
  const pts = Array.from({length: 13}, (_, i) => {
    const a = Math.PI + (i / 12) * Math.PI;
    const r = 0.8 + 0.3 * hash1(seed * 13 + i);
    return {x: x + Math.cos(a) * w * 0.5 * r, y: y + Math.sin(a) * h * r};
  });
  return (
    <g>
      <path d={`M${pts.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')}Z`} fill={c} />
      <path d={`M${pts.slice(3, 10).map((p) => `${f1(p.x)},${f1(p.y + 4)}`).join(' L')}`} stroke="#9ad8e8" strokeWidth={3} fill="none" opacity={0.25} strokeLinecap="round" />
      {Array.from({length: 6}, (_, i) => <ellipse key={i} cx={x - w * 0.35 + hash1(seed + i * 5) * w * 0.7} cy={y - h * (0.3 + 0.5 * hash1(seed * 3 + i))} rx={6 + hash1(i + seed) * 10} ry={3 + hash1(i * 2 + seed) * 4} fill={['#c86a8a', '#6a8a3a', '#d89a3a'][i % 3]} opacity={0.6} />)}
    </g>
  );
};

const SmallFish: React.FC<{x: number; y: number; t: number; c: string; s?: number; dir?: number}> = ({x, y, t, c, s = 1, dir = 1}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s * dir)} ${f1(s)})`}>
    <path d={`M14,0 Q4,-8 -10,-2 L-18,${f1(-6 + Math.sin(t * 14) * 3)} L-16,0 L-18,${f1(6 + Math.sin(t * 14) * 3)} L-10,2 Q4,8 14,0Z`} fill={c} />
    <circle cx={8} cy={-1.5} r={1.6} fill="#000" />
  </g>
);

export type ReefOpts = {light?: number; extent?: [number, number]};

export const ReefBack: React.FC<{cam: Cam; t: number; children?: React.ReactNode} & ReefOpts> = ({cam, t, children, light = 1, extent = [-3000, 4000]}) => (
  <g>
    <defs>
      <linearGradient id="rfWater" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3ac8d8" />
        <stop offset="0.35" stopColor="#1a8aa8" />
        <stop offset="0.75" stopColor="#0e4a7a" />
        <stop offset="1" stopColor="#0a2a52" />
      </linearGradient>
      <radialGradient id="rfSun" cx="0.6" cy="-0.05" r="0.8">
        <stop offset="0" stopColor="#fff8d0" stopOpacity={0.55} />
        <stop offset="0.5" stopColor="#a8f0f0" stopOpacity={0.12} />
        <stop offset="1" stopColor="#a8f0f0" stopOpacity={0} />
      </radialGradient>
      <linearGradient id="rfRay" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fffbe0" stopOpacity={0.45} />
        <stop offset="1" stopColor="#fffbe0" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="rfSand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e8d8a8" />
        <stop offset="0.3" stopColor="#c8b480" />
        <stop offset="1" stopColor="#6a6040" />
      </linearGradient>
      <Blur id="rfFar" r={8} />
      <Blur id="rfRays" r={22} />
    </defs>
    <rect width={1080} height={1920} fill="url(#rfWater)" />
    <rect width={1080} height={1920} fill="url(#rfSun)" opacity={light} />
    {/* reflejos de superficie (cáusticas en lo alto) */}
    <g opacity={0.35 * light}>
      {Array.from({length: 10}, (_, i) => (
        <path key={i} d={`M${f1(((i * 137 + t * 30) % 1300) - 110)},${f1(60 + (i % 3) * 40)} q60,${f1(-14 + Math.sin(t * 1.5 + i) * 8)} 120,0`} stroke="#eaffff" strokeWidth={3} fill="none" />
      ))}
    </g>
    <g filter="url(#rfRays)"><g transform={layerT(cam, 0.12)} opacity={0.7 * light}>
      {Array.from({length: 7}, (_, i) => {
        const x = cam.x * 0.12 - 700 + i * 230 + Math.sin(t * 0.3 + i) * 30;
        return <path key={i} d={`M${f1(x + 260)},-1500 L${f1(x + 340)},-1500 L${f1(x - 60)},900 L${f1(x - 220)},900Z`} fill="url(#rfRay)" opacity={0.35 + 0.25 * Math.sin(t * 0.55 + i * 1.6)} />;
      })}
    </g></g>
    {/* 2 · arrecife lejano en bruma violeta */}
    <g filter="url(#rfFar)"><g transform={layerT(cam, 0.3)} opacity={0.6}>
      <path d={`M${f1(cam.x * 0.3 - 2400)},${SAND * 0.3 + 230} ${Array.from({length: 30}, (_, i) => `Q${f1(cam.x * 0.3 - 2400 + i * 170 + 85)},${f1(SAND * 0.3 + 120 - hash1(i) * 160)} ${f1(cam.x * 0.3 - 2400 + (i + 1) * 170)},${f1(SAND * 0.3 + 200 - hash1(i * 3) * 80)}`).join(' ')} L${f1(cam.x * 0.3 + 2700)},2000 L${f1(cam.x * 0.3 - 2400)},2000Z`} fill="#3a4a8a" />
      {Array.from({length: 10}, (_, i) => <BranchCoral key={i} x={cam.x * 0.3 - 1500 + i * 330} y={SAND * 0.3 + 150} s={0.9 + hash1(i) * 0.6} seed={i + 10} c="#5a5a9a" t={t} />)}
    </g></g>
    {/* 3 · corales medios, rocas y cardúmenes */}
    <g transform={layerT(cam, 0.6)} opacity={0.92}>
      <rect x={cam.x * 0.6 - 2600} y={SAND * 0.6 + 120} width={5200} height={1600} fill="#2a5a7a" />
      {Array.from({length: 9}, (_, i) => {
        const x = cam.x * 0.6 - 1500 + i * 360 + hash1(i * 5) * 100;
        return i % 3 === 0 ? <DomeCoral key={i} x={x} y={SAND * 0.6 + 130} w={160 + hash1(i) * 80} h={70 + hash1(i * 2) * 40} c="#7a6aa8" seed={i} /> : i % 3 === 1 ? <SeaFan key={i} x={x} y={SAND * 0.6 + 130} s={1 + hash1(i) * 0.4} c="#a85a9a" t={t} seed={i} /> : <BranchCoral key={i} x={x} y={SAND * 0.6 + 130} s={1.1} seed={i + 30} c="#c8785a" t={t} />;
      })}
      {Array.from({length: 18}, (_, i) => {
        const px = cam.x * 0.6 + ((hash1(i * 3) * 1800 + t * 50) % 1800) - 900;
        const py = cam.y * 0.6 - 260 + hash1(i * 7) * 200 + Math.sin(t * 1.4 + i) * 10;
        return <SmallFish key={`sf${i}`} x={px} y={py} t={t + i} c="#7ae0f0" s={0.8} />;
      })}
    </g>
    {/* 4 · plano del personaje */}
    <g transform={layerT(cam, 1)}>
      <path d={`M${extent[0]},${SAND} ${Array.from({length: Math.ceil((extent[1] - extent[0]) / 200)}, (_, i) => `Q${extent[0] + i * 200 + 100},${SAND - 10 + Math.sin(i * 1.7) * 8} ${extent[0] + (i + 1) * 200},${SAND}`).join(' ')} L${extent[1]},2600 L${extent[0]},2600Z`} fill="url(#rfSand)" />
      {Array.from({length: 40}, (_, i) => {
        const x = extent[0] + hash1(i * 5.1) * (extent[1] - extent[0]);
        const y = SAND + 20 + hash1(i * 3.3) * 380;
        return <path key={`rp${i}`} d={`M${f1(x)},${f1(y)} q30,-6 60,0 q30,6 60,0`} stroke="#a89060" strokeWidth={2} fill="none" opacity={0.4} />;
      })}
      {/* manchas de luz (cáusticas) sobre la arena */}
      {Array.from({length: 22}, (_, i) => {
        const x = extent[0] + hash1(i * 9.7) * (extent[1] - extent[0]) + Math.sin(t * 0.8 + i) * 20;
        const y = SAND + 30 + hash1(i * 4.1) * 300;
        return <ellipse key={`cs${i}`} cx={x} cy={y} rx={40 + hash1(i) * 30} ry={8 + hash1(i * 2) * 6} fill="#fffbe0" opacity={0.12 + 0.08 * Math.sin(t * 1.3 + i * 2)} />;
      })}
      {children}
    </g>
  </g>
);

/** Decorado cercano del plano del personaje (corales y rocas), dibujado por la escena donde convenga. */
export const ReefSet: React.FC<{t: number; xs?: number[]}> = ({t, xs = [-900, -400, 300, 900, 1500]}) => (
  <g>
    {xs.map((x, i) => (
      <g key={x}>
        <Rock x={x} y={SAND + 6} w={260 + hash1(i) * 120} h={90 + hash1(i * 3) * 60} seed={i + 3} />
        {i % 2 === 0 ? <BranchCoral x={x - 60} y={SAND - 40} s={1.3} seed={i + 50} c="#e8784a" t={t} /> : <DomeCoral x={x + 40} y={SAND - 30} w={170} h={80} c="#c8a04a" seed={i} />}
        <Algae x={x + 140} base={SAND + 4} h={200 + hash1(i * 5) * 120} t={t} seed={i * 3} c="#3a9a5a" />
        <SeaFan x={x - 150} y={SAND - 10} s={0.9} c="#d85a8a" t={t} seed={i + 7} />
      </g>
    ))}
  </g>
);

export const ReefFront: React.FC<{cam: Cam; t: number}> = ({cam, t}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <defs>
      <Blur id="rfFg" r={10} />
    </defs>
    <g transform={layerT(cam, 1.15)}>
      {Array.from({length: 30}, (_, i) => (
        <circle key={i} cx={cam.x * 1.15 + ((hash1(i * 11) * 1700 + t * (10 + hash1(i) * 10)) % 1700) - 850} cy={cam.y * 1.15 + ((hash1(i * 13) * 2300 + Math.sin(t * 0.6 + i) * 30 - t * 6) % 2300 + 2300) % 2300 - 1150} r={1.2 + hash1(i * 5) * 2.4} fill="#f4fff8" opacity={0.5} />
      ))}
    </g>
    <g filter="url(#rfFg)"><g transform={layerT(cam, 1.5)} opacity={Math.max(0, Math.min(1, (2.8 - cam.zoom) / 0.9)) * 0.85}>
      <BranchCoral x={cam.x * 1.5 - 560} y={cam.y * 1.5 + 1200} s={2.6} seed={91} c="#5a2a3a" t={t} />
      <Algae x={cam.x * 1.5 + 600} base={cam.y * 1.5 + 1200} h={700} t={t} seed={93} c="#1a4a3a" />
    </g></g>
  </svg>
);
