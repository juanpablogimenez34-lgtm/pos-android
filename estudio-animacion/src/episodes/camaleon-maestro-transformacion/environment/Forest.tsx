// BOSQUE TROPICAL DE MADAGASCAR — biblioteca de escenario (geometría memorizada, animación determinista).
// Capas: cielo y dosel lejano en bruma · rayos de luz · troncos con corteza, contrafuertes, musgo y lianas ·
// palmas del viajero (Ravenala, emblema de Madagascar) · helechos · hojas tropicales con nervaduras que oscilan ·
// rama principal con corteza, líquenes, musgo y flores · gotas que resbalan por las hojas · partículas.
// Todo se dibuja en coordenadas de mundo dentro de capas con parallax (DepthStage del Estudio 2.0).
import React from 'react';
import {clamp, hash1, lerp, mixColor, noise1, smoothPath} from '../../../engine/math';
import {Branch, branchAt} from '../character/motion';

type V = {x: number; y: number};
const f1 = (n: number) => Math.round(n * 10) / 10;
const memo = new Map<string, unknown>();
function cached<T>(key: string, fn: () => T): T {
  if (!memo.has(key)) memo.set(key, fn());
  return memo.get(key) as T;
}

export type Light = 'day' | 'golden' | 'sunset' | 'dusk';
export const SKY: Record<Light, {top: string; mid: string; low: string; fog: string; leaf: string; leafDark: string; ray: string; trunk: string; rim: string}> = {
  day: {top: '#0f3a34', mid: '#2f7a5c', low: '#a8c97a', fog: '#6fa884', leaf: '#3f8a3e', leafDark: '#1d4a26', ray: '#fff4c4', trunk: '#4a3a2a', rim: '#fff2c0'},
  golden: {top: '#123a30', mid: '#4d7a46', low: '#e6c46a', fog: '#9aa86a', leaf: '#4c8a36', leafDark: '#20441e', ray: '#ffe6a0', trunk: '#4e3c28', rim: '#ffe0a0'},
  sunset: {top: '#2a2244', mid: '#a4523a', low: '#f2a24a', fog: '#c27a52', leaf: '#3e6a2e', leafDark: '#1a2c16', ray: '#ffc078', trunk: '#3a2a1e', rim: '#ffb468'},
  dusk: {top: '#0a1424', mid: '#1c3a4a', low: '#4a6a5a', fog: '#2c4a4c', leaf: '#284a30', leafDark: '#0e1e14', ray: '#c8e0ff', trunk: '#2a221a', rim: '#a8c8ff'},
};

// ---------------------------------------------------------------- cielo y dosel lejano (capa de fondo)
export const SkyBack: React.FC<{light: Light; t: number}> = ({light, t}) => {
  const P = SKY[light];
  return (
    <g>
      <defs>
        <linearGradient id={`sky-${light}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.top} />
          <stop offset="0.55" stopColor={P.mid} />
          <stop offset="1" stopColor={P.low} />
        </linearGradient>
        <radialGradient id={`sun-${light}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={P.ray} stopOpacity={0.9} />
          <stop offset="1" stopColor={P.ray} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill={`url(#sky-${light})`} />
      <circle cx={760 + Math.sin(t * 0.05) * 10} cy={light === 'sunset' ? 1080 : 380} r={light === 'sunset' ? 520 : 600} fill={`url(#sun-${light})`} opacity={light === 'dusk' ? 0.25 : 0.65} />
    </g>
  );
};
/** Copas lejanas: masas de dosel en bruma (memorizadas). */
export const CanopyFar: React.FC<{light: Light; y: number; x0?: number; w?: number; seed?: number; k?: number}> = ({light, y, x0 = -1400, w = 4200, seed = 1, k = 0.6}) => {
  const P = SKY[light];
  const d = cached(`can-${seed}-${y}-${x0}-${w}`, () => {
    const pts: V[] = [{x: x0, y: y + 900}];
    for (let x = x0; x <= x0 + w; x += 70) pts.push({x, y: y - 120 - hash1(x * 0.013 + seed) * 220 - Math.sin(x * 0.004 + seed) * 90});
    pts.push({x: x0 + w, y: y + 900});
    return smoothPath(pts, true);
  });
  const c = mixColor(P.leafDark, P.fog, k);
  return <path d={d} fill={c} />;
};

// ---------------------------------------------------------------- rayos de luz (pantalla)
export const LightRays: React.FC<{light: Light; t: number; k?: number}> = ({light, t, k = 1}) => {
  const P = SKY[light];
  return (
    <g style={{mixBlendMode: 'screen'}} opacity={k}>
      <defs>
        <linearGradient id={`ray-${light}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.ray} stopOpacity={0.4} />
          <stop offset="1" stopColor={P.ray} stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 180 + i * 210 + Math.sin(t * 0.13 + i) * 30;
        const wd = 70 + hash1(i * 3) * 90;
        const a = 0.35 + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.4 + i * 1.7));
        return <path key={i} d={`M${x} -40 L${x + wd} -40 L${x + wd * 3.2 - 420} 2000 L${x - 420} 2000Z`} fill={`url(#ray-${light})`} opacity={a} />;
      })}
    </g>
  );
};

// ---------------------------------------------------------------- tronco con corteza
export const Trunk: React.FC<{x: number; top: number; bottom: number; w: number; light: Light; seed?: number; tone?: number; moss?: boolean}> = ({x, top, bottom, w, light, seed = 1, tone = 0, moss = true}) => {
  const P = SKY[light];
  const g = cached(`tr-${x}-${top}-${bottom}-${w}-${seed}`, () => {
    const L: V[] = [];
    const R: V[] = [];
    const n = 16;
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const y = lerp(top, bottom, u);
      const flare = Math.pow(u, 6) * w * 1.3; // contrafuertes en la base
      const wob = noise1(u * 6, seed) * w * 0.06;
      L.push({x: x - w / 2 - flare + wob, y});
      R.push({x: x + w / 2 + flare * 0.8 + wob, y});
    }
    const bark: string[] = [];
    for (let i = 0; i < Math.round((bottom - top) / 14); i++) {
      const y = top + hash1(i * 3.7 + seed) * (bottom - top);
      const xx = x + (hash1(i * 5.3 + seed) - 0.5) * w * 0.85;
      const h = 30 + hash1(i * 1.3 + seed) * 70;
      bark.push(`M${f1(xx)} ${f1(y)}q${f1((hash1(i + seed) - 0.5) * 8)} ${f1(h / 2)} ${f1((hash1(i * 2 + seed) - 0.5) * 6)} ${f1(h)}`);
    }
    const mossP: string[] = [];
    for (let i = 0; i < 10; i++) {
      const y = top + hash1(i * 9.1 + seed) * (bottom - top);
      mossP.push(`M${f1(x - w / 2)} ${f1(y)}q${f1(w * 0.3)} ${f1(-14 - hash1(i) * 10)} ${f1(w * 0.55)} ${f1(-4)}q${f1(-w * 0.2)} ${f1(14)} ${f1(-w * 0.55)} ${f1(10)}Z`);
    }
    return {d: smoothPath([...L, ...R.reverse()], true), bark: bark.join(''), moss: mossP.join('')};
  });
  const base = mixColor(P.trunk, '#000000', tone);
  return (
    <g>
      <defs>
        <linearGradient id={`trg-${seed}-${light}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={mixColor(base, '#000000', 0.35)} />
          <stop offset="0.45" stopColor={mixColor(base, P.rim, 0.12)} />
          <stop offset="1" stopColor={mixColor(base, '#000000', 0.5)} />
        </linearGradient>
      </defs>
      <path d={g.d} fill={`url(#trg-${seed}-${light})`} />
      <path d={g.bark} stroke={mixColor(base, '#000000', 0.5)} strokeWidth={2.2} fill="none" opacity={0.6} />
      {moss && <path d={g.moss} fill={mixColor(P.leaf, '#b8d870', 0.25)} opacity={0.8} />}
    </g>
  );
};

/** Liana colgante con hojitas; oscila. */
export const Liana: React.FC<{x: number; y: number; len: number; t: number; light: Light; seed?: number}> = ({x, y, len, t, light, seed = 1}) => {
  const P = SKY[light];
  const pts: V[] = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    pts.push({x: x + Math.sin(u * 3 + seed) * 30 * u + Math.sin(t * 0.6 + seed) * 18 * u * u, y: y + u * len});
  }
  return (
    <g>
      <path d={smoothPath(pts)} stroke={mixColor(P.trunk, P.leafDark, 0.4)} strokeWidth={5} fill="none" />
      {pts.slice(2).map((p, i) => (i % 2 === 0 ? <ellipse key={i} cx={f1(p.x + 8)} cy={f1(p.y)} rx={10} ry={4.5} transform={`rotate(${f1(30 + hash1(i + seed) * 40)} ${f1(p.x + 8)} ${f1(p.y)})`} fill={P.leaf} opacity={0.9} /> : null))}
    </g>
  );
};

// ---------------------------------------------------------------- hoja tropical con nervaduras
export const TropicalLeaf: React.FC<{x: number; y: number; len: number; ang: number; t: number; light: Light; seed?: number; dark?: number; width?: number}> = ({x, y, len, ang, t, light, seed = 1, dark = 0, width = 0.38}) => {
  const P = SKY[light];
  const sway = Math.sin(t * (0.8 + hash1(seed) * 0.6) + seed * 3) * 0.06 + noise1(t * 0.5, seed) * 0.04;
  const g = cached(`leaf-${len}-${width}`, () => {
    const W = len * width;
    const d = `M0 0 C${f1(len * 0.25)} ${f1(-W)} ${f1(len * 0.75)} ${f1(-W * 0.9)} ${f1(len)} 0 C${f1(len * 0.75)} ${f1(W * 0.9)} ${f1(len * 0.25)} ${f1(W)} 0 0Z`;
    const veins: string[] = [];
    for (let i = 1; i < 8; i++) {
      const u = i / 8;
      const vx = u * len;
      const vw = Math.sin(u * Math.PI) * W * 0.85;
      veins.push(`M${f1(vx)} 0 Q${f1(vx + len * 0.06)} ${f1(-vw * 0.6)} ${f1(vx + len * 0.12)} ${f1(-vw)}`);
      veins.push(`M${f1(vx)} 0 Q${f1(vx + len * 0.06)} ${f1(vw * 0.6)} ${f1(vx + len * 0.12)} ${f1(vw)}`);
    }
    return {d, veins: veins.join('')};
  });
  const c = mixColor(P.leaf, '#000000', dark);
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(((ang + sway) * 180) / Math.PI)})`}>
      <defs>
        <linearGradient id={`lg-${light}-${Math.round(dark * 10)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mixColor(c, P.rim, 0.25)} />
          <stop offset="0.5" stopColor={c} />
          <stop offset="1" stopColor={mixColor(c, '#000000', 0.35)} />
        </linearGradient>
      </defs>
      <path d={g.d} fill={`url(#lg-${light}-${Math.round(dark * 10)})`} stroke={mixColor(c, '#000000', 0.45)} strokeWidth={1.2} />
      <path d={`M0 0L${len} 0`} stroke={mixColor(c, '#f0f0a0', 0.4)} strokeWidth={2.2} />
      <path d={g.veins} stroke={mixColor(c, '#f0f0a0', 0.25)} strokeWidth={1.1} fill="none" opacity={0.7} />
    </g>
  );
};
/** Ramillete de hojas tropicales. */
export const LeafCluster: React.FC<{x: number; y: number; t: number; light: Light; n?: number; size?: number; seed?: number; dark?: number; spread?: number; base?: number}> = ({x, y, t, light, n = 6, size = 160, seed = 1, dark = 0, spread = 2.4, base = -Math.PI / 2}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const a = base + (i / Math.max(1, n - 1) - 0.5) * spread + (hash1(i + seed) - 0.5) * 0.3;
      return <TropicalLeaf key={i} x={x} y={y} len={size * (0.7 + hash1(i * 3 + seed) * 0.5)} ang={a} t={t} light={light} seed={seed * 10 + i} dark={dark + hash1(i * 5 + seed) * 0.15} />;
    })}
  </g>
);

/** Palma del viajero (Ravenala madagascariensis): abanico de hojas sobre un tronco. */
export const Ravenala: React.FC<{x: number; y: number; h: number; t: number; light: Light; k?: number}> = ({x, y, h, t, light, k = 0.5}) => {
  const P = SKY[light];
  const c = mixColor(P.leafDark, P.fog, k);
  return (
    <g>
      <path d={`M${x - 14} ${y}L${x - 9} ${y - h}L${x + 9} ${y - h}L${x + 14} ${y}Z`} fill={mixColor(P.trunk, P.fog, k)} />
      {Array.from({length: 11}, (_, i) => {
        const a = -Math.PI / 2 + (i / 10 - 0.5) * 2.6 + Math.sin(t * 0.4 + i) * 0.02;
        const L = h * 0.75;
        const ex = x + Math.cos(a) * L;
        const ey = y - h + Math.sin(a) * L * 0.95;
        return <path key={i} d={`M${x} ${y - h}Q${f1((x + ex) / 2 + Math.cos(a + 1.4) * 20)} ${f1((y - h + ey) / 2)} ${f1(ex)} ${f1(ey)}Q${f1((x + ex) / 2 - Math.cos(a + 1.4) * 26)} ${f1((y - h + ey) / 2 + 8)} ${x} ${y - h}Z`} fill={c} />;
      })}
    </g>
  );
};

/** Helecho (frondas pinnadas). */
export const Fern: React.FC<{x: number; y: number; size: number; t: number; light: Light; seed?: number; dark?: number}> = ({x, y, size, t, light, seed = 1, dark = 0}) => {
  const P = SKY[light];
  const c = mixColor(mixColor(P.leaf, '#7ab04a', 0.3), '#000000', dark);
  return (
    <g>
      {Array.from({length: 6}, (_, i) => {
        const a = -Math.PI / 2 + (i / 5 - 0.5) * 2.2 + Math.sin(t * 0.7 + i + seed) * 0.04;
        const L = size * (0.7 + hash1(i + seed) * 0.4);
        const pts: V[] = [];
        for (let k = 0; k <= 8; k++) {
          const u = k / 8;
          pts.push({x: x + Math.cos(a + u * 0.5) * L * u, y: y + Math.sin(a + u * 0.5) * L * u});
        }
        const pinnae: string[] = [];
        for (let k = 1; k < 8; k++) {
          const p = pts[k];
          const w = (1 - k / 9) * size * 0.16;
          const na = a + (k / 8) * 0.5 + Math.PI / 2;
          pinnae.push(`M${f1(p.x)} ${f1(p.y)}l${f1(Math.cos(na) * w)} ${f1(Math.sin(na) * w - w * 0.3)}M${f1(p.x)} ${f1(p.y)}l${f1(-Math.cos(na) * w)} ${f1(-Math.sin(na) * w - w * 0.3)}`);
        }
        return (
          <g key={i}>
            <path d={smoothPath(pts)} stroke={c} strokeWidth={2.4} fill="none" />
            <path d={pinnae.join('')} stroke={c} strokeWidth={5} strokeLinecap="round" fill="none" />
          </g>
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------- rama principal con corteza
export const BranchArt: React.FC<{b: Branch; light: Light; seed?: number; twigs?: boolean; flowers?: boolean; dip?: number; xMin?: number; xMax?: number}> = ({b, light, seed = 1, twigs = true, flowers = true, dip = 0, xMin, xMax}) => {
  const P = SKY[light];
  const x0 = xMin ?? b.pts[0].x;
  const x1 = xMax ?? b.pts[b.pts.length - 1].x;
  const g = cached(`br-${seed}-${x0}-${x1}-${b.r}-${b.pts.map((p) => `${p.x},${p.y}`).join(';')}`, () => {
    const top: V[] = [];
    const bot: V[] = [];
    const center: V[] = [];
    for (let x = x0; x <= x1; x += 24) {
      const c = branchAt(b, x);
      const taper = 1 - 0.25 * ((x - x0) / Math.max(1, x1 - x0));
      const r = b.r * taper * (1 + noise1(x * 0.01, seed) * 0.08);
      top.push({x, y: c.y - r});
      bot.push({x, y: c.y + r});
      center.push({x, y: c.y});
    }
    const bark: string[] = [];
    for (let i = 0; i < (x1 - x0) / 9; i++) {
      const x = x0 + hash1(i * 3.3 + seed) * (x1 - x0);
      const c = branchAt(b, x);
      const off = (hash1(i * 7.7 + seed) - 0.5) * b.r * 1.6;
      const l = 14 + hash1(i * 1.1 + seed) * 30;
      bark.push(`M${f1(x)} ${f1(c.y + off)}q${f1(l / 2)} ${f1((hash1(i + seed) - 0.5) * 6)} ${f1(l)} ${f1((hash1(i * 2 + seed) - 0.5) * 4)}`);
    }
    const lichen: {x: number; y: number; r: number}[] = [];
    for (let i = 0; i < (x1 - x0) / 60; i++) {
      const x = x0 + hash1(i * 5.9 + seed) * (x1 - x0);
      const c = branchAt(b, x);
      lichen.push({x, y: c.y + (hash1(i * 2.3 + seed) - 0.3) * b.r, r: 3 + hash1(i * 4.1 + seed) * 6});
    }
    const tw: {x: number; a: number; l: number}[] = [];
    for (let i = 0; i < (x1 - x0) / 260; i++) tw.push({x: x0 + 80 + hash1(i * 8.3 + seed) * (x1 - x0 - 160), a: -0.9 - hash1(i * 2.9 + seed) * 1.3, l: 60 + hash1(i * 6.1 + seed) * 90});
    return {d: smoothPath([...top, ...bot.reverse()], true), hi: smoothPath(top.map((p) => ({x: p.x, y: p.y + b.r * 0.35}))), bark: bark.join(''), lichen, tw};
  });
  const base = P.trunk;
  return (
    <g transform={dip ? `translate(0 ${dip})` : undefined}>
      <defs>
        <linearGradient id={`brg-${light}-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mixColor(base, P.rim, 0.25)} />
          <stop offset="0.45" stopColor={base} />
          <stop offset="1" stopColor={mixColor(base, '#000000', 0.55)} />
        </linearGradient>
      </defs>
      {twigs && g.tw.map((w, i) => {
        const c = branchAt(b, w.x);
        const ex = w.x + Math.cos(w.a) * w.l;
        const ey = c.y + Math.sin(w.a) * w.l;
        return (
          <g key={i}>
            <path d={`M${f1(w.x)} ${f1(c.y)}Q${f1((w.x + ex) / 2 + 12)} ${f1((c.y + ey) / 2)} ${f1(ex)} ${f1(ey)}`} stroke={base} strokeWidth={7} fill="none" strokeLinecap="round" />
            <TropicalLeaf x={ex} y={ey} len={70} ang={w.a - 0.4} t={0} light={light} seed={i + seed} />
          </g>
        );
      })}
      <path d={g.d} fill={`url(#brg-${light}-${seed})`} stroke={mixColor(base, '#000000', 0.6)} strokeWidth={1.5} />
      <path d={g.bark} stroke={mixColor(base, '#000000', 0.55)} strokeWidth={1.8} fill="none" opacity={0.65} />
      <path d={g.hi} stroke={mixColor(base, P.rim, 0.5)} strokeWidth={3} fill="none" opacity={0.5} />
      {g.lichen.map((l, i) => (
        <circle key={i} cx={f1(l.x)} cy={f1(l.y)} r={f1(l.r)} fill={i % 3 ? '#9ab478' : '#c8cfa0'} opacity={0.55} />
      ))}
      {flowers && g.tw.map((w, i) => {
        const c = branchAt(b, w.x + 30);
        return (
          <g key={`f${i}`} transform={`translate(${f1(w.x + 30)} ${f1(c.y - b.r)})`}>
            {[0, 1, 2, 3, 4].map((k) => (
              <ellipse key={k} cx={Math.cos((k / 5) * Math.PI * 2) * 7} cy={-8 + Math.sin((k / 5) * Math.PI * 2) * 7} rx={6} ry={3.6} transform={`rotate(${k * 72} ${Math.cos((k / 5) * Math.PI * 2) * 7} ${-8 + Math.sin((k / 5) * Math.PI * 2) * 7})`} fill={i % 2 ? '#f2a8c8' : '#ffe2a0'} />
            ))}
            <circle cy={-8} r={3.4} fill="#e8a020" />
          </g>
        );
      })}
    </g>
  );
};

/** Gota de agua que resbala por una hoja (posición local de la hoja → mundo ya calculado por la escena). */
export const Drop: React.FC<{x: number; y: number; r?: number; k?: number}> = ({x, y, r = 5, k = 1}) => (
  <g opacity={k}>
    <ellipse cx={x} cy={y} rx={r} ry={r * 1.2} fill="#d8f4ff" opacity={0.5} stroke="#ffffff" strokeWidth={1} />
    <ellipse cx={x - r * 0.3} cy={y - r * 0.4} rx={r * 0.3} ry={r * 0.22} fill="#ffffff" opacity={0.9} />
  </g>
);

/** Viñeta y etalonaje de pantalla. */
export const Grade: React.FC<{light: Light; k?: number}> = ({light, k = 1}) => (
  <g pointerEvents="none">
    <defs>
      <radialGradient id={`vig-${light}`} cx="0.5" cy="0.45" r="0.75">
        <stop offset="0.55" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={0.55 * k} />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill={`url(#vig-${light})`} />
    {light === 'sunset' && <rect width={1080} height={1920} fill="#ff9a40" opacity={0.08 * k} style={{mixBlendMode: 'soft-light'}} />}
  </g>
);
export const _keep = {clamp};
