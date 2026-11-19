// Suelo del humedal en 3D proyectado: lecho de musgo (esfagno), arena húmeda, guijarros,
// gotas de rocío, la hoja caída y juncos/hierbas que se elevan alrededor de la planta.
import React from 'react';
import {clamp, hash1, mixColor, smoothPath, Vec} from '../../../engine/math';
import {project, V3, View} from '../anatomy/proj';
import {f1, Item} from '../anatomy/render';
import {DROP} from '../animation/spiderStates';
import {LEAF, LEAF_LEN, leafHalfW} from './leaf';
import {Light} from './Wetland';

const P = (view: View, p: V3) => project(view, p);

export function groundItems(view: View, t: number, light: Light, detail: number, soilK: number): Item[] {
  const items: Item[] = [];
  const sp = Math.sin(view.pitch);
  // ---------------- lecho de musgo
  const decor: React.ReactNode[] = [];
  const c = P(view, [0, 0, 0]);
  decor.push(
    <defs key="d">
      <radialGradient id="gr-moss" gradientUnits="userSpaceOnUse" cx={f1(c.x)} cy={f1(c.y)} r={2400}>
        <stop offset="0" stopColor={mixColor('#3f5f22', light.haze, 0.05)} stopOpacity={1} />
        <stop offset="0.45" stopColor={mixColor('#4f6f2b', light.haze, 0.12)} stopOpacity={1} />
        <stop offset="0.8" stopColor={mixColor('#5f7b36', light.haze, 0.3)} stopOpacity={0.7} />
        <stop offset="1" stopColor={mixColor('#6f8a45', light.haze, 0.5)} stopOpacity={0} />
      </radialGradient>
      {['#a99868', '#2f4a1a', '#86a243'].map((cc, j) => (
        <radialGradient key={j} id={`gr-soft${j}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={cc} stopOpacity={1} />
          <stop offset="1" stopColor={cc} stopOpacity={0} />
        </radialGradient>
      ))}
    </defs>,
  );
  decor.push(<ellipse key="bed" cx={f1(c.x)} cy={f1(c.y)} rx={3200} ry={Math.max(8, 3200 * sp)} fill="url(#gr-moss)" />);
  // manchas de color del musgo y claros de arena húmeda (bordes difusos)
  for (let i = 0; i < 14; i++) {
    const a = hash1(i * 5.1) * Math.PI * 2;
    const r = 250 + hash1(i * 2.3) * 1600;
    const q = P(view, [Math.cos(a) * r, 0, Math.sin(a) * r * 0.8]);
    const rr = 120 + hash1(i) * 260;
    const j = i % 4 === 0 ? 0 : i % 2 ? 1 : 2;
    decor.push(<ellipse key={`s${i}`} cx={f1(q.x)} cy={f1(q.y)} rx={rr} ry={Math.max(3, rr * sp * 0.7)} fill={`url(#gr-soft${j})`} opacity={0.35} />);
  }
  // acículas de pino caídas (sabana de pinos)
  for (let i = 0; i < Math.round(60 * detail); i++) {
    const a = hash1(i * 9.7) * Math.PI * 2;
    const r = 200 + Math.sqrt(hash1(i * 4.9)) * 1700;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const ang = hash1(i * 2.2) * Math.PI;
    const L = 90 + hash1(i * 3.1) * 120;
    const p0 = P(view, [x, 1, z]);
    const p1 = P(view, [x + Math.cos(ang) * L, 1, z + Math.sin(ang) * L]);
    decor.push(<path key={`nd${i}`} d={`M${f1(p0.x)},${f1(p0.y)}L${f1(p1.x)},${f1(p1.y)}`} stroke={i % 3 ? '#8a6a3a' : '#a8844c'} strokeWidth={2.2} opacity={0.75} strokeLinecap="round" />);
  }
  // matas de esfagno: cabezuelas estrelladas
  const N = Math.round(150 * detail);
  for (let i = 0; i < N; i++) {
    const a = hash1(i * 1.37) * Math.PI * 2;
    const r = 70 + Math.pow(hash1(i * 2.71), 0.8) * 1900;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const q = P(view, [x, 0, z]);
    const s = 9 + hash1(i * 3.3) * 12;
    const col = mixColor(i % 3 ? '#7f9e3c' : '#9aae4a', '#c7c06a', hash1(i * 4.4) * 0.35);
    const arms: string[] = [];
    for (let k = 0; k < 5; k++) {
      const ang = (k / 5) * Math.PI * 2 + i;
      arms.push(`M${f1(q.x)},${f1(q.y)} L${f1(q.x + Math.cos(ang) * s)},${f1(q.y + Math.sin(ang) * s * Math.max(0.25, sp))}`);
    }
    decor.push(<path key={`m${i}`} d={arms.join('')} stroke={col} strokeWidth={3.2} strokeLinecap="round" opacity={0.9} />);
  }
  // guijarros
  for (let i = 0; i < 9; i++) {
    const a = hash1(i * 7.7) * Math.PI * 2;
    const r = 450 + hash1(i * 8.1) * 1300;
    const q = P(view, [Math.cos(a) * r, 0, Math.sin(a) * r]);
    const rr = 18 + hash1(i * 9.9) * 30;
    if (Math.cos(a) * r < -350 && Math.sin(a) * r > 150) continue; // lejos de la hoja caída
    decor.push(<ellipse key={`p${i}`} cx={f1(q.x)} cy={f1(q.y - rr * 0.3)} rx={rr} ry={rr * Math.max(0.45, sp)} fill="#8d8a7e" stroke="#5e5b52" strokeWidth={1} />);
    decor.push(<ellipse key={`ph${i}`} cx={f1(q.x - rr * 0.3)} cy={f1(q.y - rr * 0.55)} rx={rr * 0.35} ry={rr * 0.18} fill="#ffffff" opacity={0.25} />);
  }
  // gotas de rocío sobre el musgo
  for (let i = 0; i < Math.round(40 * detail); i++) {
    const a = hash1(i * 6.1) * Math.PI * 2;
    const r = 120 + hash1(i * 3.9) * 1400;
    const q = P(view, [Math.cos(a) * r, 6, Math.sin(a) * r]);
    const rr = 4 + hash1(i * 5.5) * 6;
    decor.push(
      <g key={`dw${i}`}>
        <circle cx={f1(q.x)} cy={f1(q.y)} r={rr} fill="#dff1ff" opacity={0.45} />
        <circle cx={f1(q.x - rr * 0.35)} cy={f1(q.y - rr * 0.35)} r={rr * 0.3} fill="#ffffff" opacity={0.9} />
      </g>,
    );
  }
  items.push({z: -1e5, key: 'ground', node: <g key="ground" opacity={1 - 0.6 * soilK}>{decor}</g>});

  // ---------------- hoja caída
  const NL = 18;
  const left: Vec[] = [];
  const right: Vec[] = [];
  const mid: Vec[] = [];
  for (let i = 0; i <= NL; i++) {
    const a = (i / NL) * LEAF_LEN;
    const w = leafHalfW(a);
    left.push(P(view, LEAF.point(a, w)));
    right.push(P(view, LEAF.point(a, -w)));
    mid.push(P(view, LEAF.point(a, 0)));
  }
  const lz = P(view, LEAF.point(LEAF_LEN / 2, 0)).z;
  const veins: React.ReactNode[] = [];
  for (let i = 2; i < NL - 1; i += 2) {
    const a = (i / NL) * LEAF_LEN;
    for (const sg of [1, -1]) {
      const w = leafHalfW(a);
      const p0 = P(view, LEAF.point(a, 0));
      const p1 = P(view, LEAF.point(a + 40, sg * w * 0.85));
      veins.push(<path key={`${i}${sg}`} d={`M${f1(p0.x)},${f1(p0.y)} L${f1(p1.x)},${f1(p1.y)}`} stroke="#8a6e3a" strokeWidth={1} opacity={0.5} />);
    }
  }
  const l0 = mid[0];
  const l1 = mid[NL];
  items.push({
    z: lz - 60,
    key: 'leaf',
    node: (
      <g key="leaf">
        <defs>
          <linearGradient id="gr-leaf" gradientUnits="userSpaceOnUse" x1={f1(l0.x)} y1={f1(l0.y)} x2={f1(l1.x)} y2={f1(l1.y)}>
            <stop offset="0" stopColor="#8b6b34" />
            <stop offset="0.5" stopColor="#a8884a" />
            <stop offset="1" stopColor="#7d6a36" />
          </linearGradient>
        </defs>
        <path d={smoothPath([...left, ...right.reverse()], true, 0.7)} fill="url(#gr-leaf)" stroke="#5a4320" strokeWidth={1.2} />
        <path d={smoothPath(mid)} stroke="#d6bf86" strokeWidth={2} fill="none" opacity={0.7} />
        {veins}
        <path d={smoothPath(left)} stroke="#f2e2b0" strokeWidth={1.2} fill="none" opacity={0.35} />
      </g>
    ),
  });
  // gota que cae sobre la hoja (hace vibrar la hoja: la araña reacciona)
  if (t > DROP.fall && t < DROP.hit + 0.8) {
    const hit = LEAF.point(DROP.a, DROP.b);
    const u = clamp((t - DROP.fall) / (DROP.hit - DROP.fall));
    const y = 320 * (1 - u * u);
    const q = P(view, [hit[0], hit[1] + y, hit[2]]);
    const after = clamp((t - DROP.hit) / 0.8);
    items.push({
      z: lz + 5,
      key: 'drop',
      node: (
        <g key="drop">
          {u < 1 && <ellipse cx={f1(q.x)} cy={f1(q.y)} rx={5} ry={7} fill="#e6f6ff" opacity={0.85} />}
          {after > 0 && (
            <>
              <ellipse cx={f1(q.x)} cy={f1(q.y)} rx={10 + 50 * after} ry={(10 + 50 * after) * Math.max(0.3, sp)} fill="none" stroke="#e6f6ff" strokeWidth={2} opacity={0.8 * (1 - after)} />
              <circle cx={f1(q.x)} cy={f1(q.y - 2)} r={6} fill="#dff1ff" opacity={0.7} />
            </>
          )}
        </g>
      ),
    });
  }
  // ---------------- juncos y hierbas alrededor (se elevan en 3D)
  const NB = Math.round(34 * detail);
  for (let i = 0; i < NB; i++) {
    const a = -Math.PI * 0.95 + hash1(i * 4.13) * Math.PI * 1.9 - Math.PI / 2; // sobre todo detrás y a los lados
    const r = 650 + hash1(i * 2.9) * 1300;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (z > 200 && Math.abs(x) < 900) continue; // no tapar el plano frontal de la planta
    const H = 420 + hash1(i * 7.3) * 900;
    const lean = (hash1(i * 1.9) - 0.5) * 0.5;
    const sway = Math.sin(t * 0.9 + i) * 10 + Math.sin(t * 2.3 + i * 3) * 3;
    const pts: Vec[] = [];
    for (let k = 0; k <= 6; k++) {
      const u = k / 6;
      pts.push(P(view, [x + (lean * H + sway) * u * u, H * u, z]));
    }
    const wB = 9 + hash1(i) * 6;
    const L: Vec[] = [];
    const R: Vec[] = [];
    for (let k = 0; k < pts.length; k++) {
      const p = pts[k];
      const nx = k < pts.length - 1 ? pts[k + 1] : pts[k - 1];
      const dx = nx.x - p.x;
      const dy = nx.y - p.y;
      const l = Math.hypot(dx, dy) || 1;
      const ww = wB * (1 - k / pts.length);
      L.push({x: p.x - (dy / l) * ww, y: p.y + (dx / l) * ww});
      R.push({x: p.x + (dy / l) * ww, y: p.y - (dx / l) * ww});
    }
    const bz = P(view, [x, 0, z]).z;
    const col = mixColor(i % 2 ? '#5d8a2f' : '#79a03c', light.haze, 0.1 + 0.25 * clamp(-z / 1800));
    items.push({z: bz, key: `bl${i}`, node: <path key={`bl${i}`} d={smoothPath([...L, ...R.reverse()], true, 0.8)} fill={col} stroke={mixColor(col, '#000000', 0.25)} strokeWidth={0.8} />});
  }
  return items;
}
