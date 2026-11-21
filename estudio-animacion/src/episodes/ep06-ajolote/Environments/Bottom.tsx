// Fondo del canal en 3D proyectado: sedimento, rocas pequeñas, hojas y ramitas caídas,
// plantas sumergidas (tallos con verticilos de hojas) que ondulan con la corriente,
// raíces de ahuejote en la orilla y raíces colgantes del lirio acuático bajo la superficie.
import React from 'react';
import {clamp, hash1, mixColor, smoothPath} from '../../../engine/math';
import {project, V3, View} from '../Animation/proj';
import {f1, Item} from '../Animation/render';
import {SURF} from './Water';

const P = (view: View, p: V3) => project(view, p);

/** Turbidez: lo lejano (z negativo) se funde con el color del agua. */
const fog = (c: string, z: number, dim: number) => mixColor(mixColor(c, '#5b7a5e', clamp((-z + 300) / 3200) * 0.75), '#0b1611', dim);

export function bottomItems(view: View, t: number, detail: number, dim: number, current: number): Item[] {
  const items: Item[] = [];
  const sp = Math.sin(view.pitch);
  // ---------------- sedimento
  const floor: React.ReactNode[] = [];
  const c0 = P(view, [-2500, 0, 0]);
  floor.push(
    <defs key="d">
      <radialGradient id="bt-mud" gradientUnits="userSpaceOnUse" cx={f1(c0.x)} cy={f1(c0.y)} r={9000}>
        <stop offset="0" stopColor={mixColor('#5a5236', '#0b1611', dim)} />
        <stop offset="0.6" stopColor={mixColor('#4a4630', '#0b1611', dim)} />
        <stop offset="1" stopColor={mixColor('#3d4a34', '#0b1611', dim)} />
      </radialGradient>
    </defs>,
  );
  floor.push(<ellipse key="mud" cx={f1(c0.x)} cy={f1(c0.y)} rx={9000} ry={Math.max(10, 9000 * sp)} fill="url(#bt-mud)" />);
  // ondulaciones y manchas del limo
  for (let i = 0; i < Math.round(70 * detail); i++) {
    const x = -8000 + hash1(i * 1.7) * 10500;
    const z = -2600 + hash1(i * 2.3) * 3600;
    const q = P(view, [x, 0, z]);
    const r = 60 + hash1(i * 3.1) * 220;
    floor.push(<ellipse key={`m${i}`} cx={f1(q.x)} cy={f1(q.y)} rx={f1(r)} ry={f1(Math.max(2, r * sp * 0.6))} fill={fog(i % 3 ? '#3c3826' : '#6a6244', z, dim)} opacity={0.35} />);
  }
  // hojas y ramitas caídas
  for (let i = 0; i < Math.round(36 * detail); i++) {
    const x = -7000 + hash1(i * 4.7) * 9000;
    const z = -1800 + hash1(i * 5.9) * 2600;
    const a = hash1(i * 6.1) * Math.PI;
    const Lx = 60 + hash1(i * 7.3) * 120;
    const p0 = P(view, [x, 2, z]);
    const p1 = P(view, [x + Math.cos(a) * Lx, 2, z + Math.sin(a) * Lx]);
    floor.push(<path key={`tw${i}`} d={`M${f1(p0.x)},${f1(p0.y)}L${f1(p1.x)},${f1(p1.y)}`} stroke={fog(i % 2 ? '#6b4e2c' : '#8a7448', z, dim)} strokeWidth={i % 2 ? 5 : 9} strokeLinecap="round" opacity={0.8} />);
  }
  items.push({z: -1e5, key: 'floor', node: <g key="floor">{floor}</g>});
  // ---------------- rocas pequeñas
  for (let i = 0; i < Math.round(22 * detail); i++) {
    const x = -7200 + hash1(i * 8.3) * 9600;
    const z = -900 + hash1(i * 9.1) * 1700;
    if (Math.abs(x + 3100) < 260 && Math.abs(z - 150) < 260) continue; // deja libre el sitio de reposo
    const r = 26 + hash1(i * 2.9) * 60;
    const q = P(view, [x, r * 0.35, z]);
    const col = fog('#7c7a68', z, dim);
    items.push({
      z: q.z - 200,
      key: `rk${i}`,
      node: (
        <g key={`rk${i}`}>
          <ellipse cx={f1(q.x)} cy={f1(q.y)} rx={f1(r)} ry={f1(r * (0.45 + 0.35 * sp))} fill={col} stroke={mixColor(col, '#000000', 0.3)} strokeWidth={1.5} />
          <ellipse cx={f1(q.x - r * 0.3)} cy={f1(q.y - r * 0.25)} rx={f1(r * 0.4)} ry={f1(r * 0.18)} fill="#ffffff" opacity={0.12} />
          <ellipse cx={f1(q.x + r * 0.2)} cy={f1(q.y - r * 0.1)} rx={f1(r * 0.5)} ry={f1(r * 0.22)} fill="#5f7a3a" opacity={0.35} />
        </g>
      ),
    });
  }
  // ---------------- plantas sumergidas (tallos con verticilos de hojas)
  const NP = Math.round(46 * detail);
  for (let i = 0; i < NP; i++) {
    const cluster = i % 4;
    const cx = [-2900, -3500, 600, -1400][cluster] + (hash1(i * 3.3) - 0.5) * 1400;
    const cz = [-500, 420, -900, -1300][cluster] + (hash1(i * 4.1) - 0.5) * 900;
    const H = 500 + hash1(i * 5.7) * 1100;
    if (Math.abs(cx + 3100) < 750 && cz > -350) continue; // despeja el sitio de reposo (planos de la regeneración)
    const ph = hash1(i) * 6;
    const pts: V3[] = [];
    for (let k = 0; k <= 10; k++) {
      const u = k / 10;
      const sw = (Math.sin(t * 0.8 + ph + u * 2.2) * 40 + current * 60) * u * u;
      pts.push([cx + sw, H * u, cz + Math.cos(t * 0.6 + ph) * 15 * u]);
    }
    const p2 = pts.map((p) => P(view, p));
    const zc = P(view, [cx, 0, cz]).z;
    const col = fog(cluster === 2 ? '#5f8a3a' : '#4e7a34', cz, dim);
    const leaves: React.ReactNode[] = [];
    for (let k = 2; k <= 10; k++) {
      const q = p2[k];
      const ll = 26 + (1 - k / 10) * 22;
      for (const sg of [-1, 1]) {
        const a = sg * (0.9 + 0.3 * Math.sin(t + k + i)) - Math.PI / 2;
        leaves.push(<path key={`${k}${sg}`} d={`M${f1(q.x)},${f1(q.y)} q${f1(Math.cos(a) * ll * 0.5)},${f1(Math.sin(a) * ll * 0.2)} ${f1(Math.cos(a) * ll)},${f1(Math.sin(a) * ll)}`} stroke={col} strokeWidth={5} strokeLinecap="round" fill="none" />);
      }
    }
    items.push({z: zc, key: `pl${i}`, node: <g key={`pl${i}`}><path d={smoothPath(p2)} stroke={mixColor(col, '#000000', 0.15)} strokeWidth={6} fill="none" />{leaves}</g>});
  }
  // ---------------- raíces de ahuejote en la orilla (zona 52–59 s) y raíces colgantes del lirio
  const roots: {x: number; z: number; top: number; bot: number; w: number; hang: boolean}[] = [];
  for (let i = 0; i < 9; i++) roots.push({x: -3300 - hash1(i * 2.1) * 900, z: -350 + hash1(i * 3.7) * 700, top: 1600 + hash1(i) * 600, bot: 0, w: 22 + hash1(i * 5) * 26, hang: false});
  for (let i = 0; i < Math.round(26 * detail); i++) roots.push({x: -4200 + hash1(i * 6.3) * 5600, z: -1400 + hash1(i * 7.7) * 2000, top: SURF, bot: SURF - 500 - hash1(i * 8.9) * 900, w: 4 + hash1(i) * 4, hang: true});
  roots.forEach((r, i) => {
    if (!r.hang && Math.abs(r.x + 3100) < 650) return; // no tapar la pata en regeneración
    const pts: V3[] = [];
    for (let k = 0; k <= 8; k++) {
      const u = k / 8;
      const y = r.top + (r.bot - r.top) * u;
      const sw = (r.hang ? Math.sin(t * 0.7 + i + u * 3) * 30 * u : Math.sin(i + u * 4) * 60) + current * 40 * u * (r.hang ? 1 : 0.2);
      pts.push([r.x + sw + (r.hang ? 0 : u * u * 220 * (i % 2 ? 1 : -1)), y, r.z]);
    }
    const p2 = pts.map((p) => P(view, p));
    const zc = P(view, [r.x, 0, r.z]).z;
    const col = fog(r.hang ? '#3a3024' : '#4d3b28', r.z, dim);
    const fib: React.ReactNode[] = [];
    if (r.hang)
      for (let k = 2; k < 8; k++) {
        const q = p2[k];
        fib.push(<path key={k} d={`M${f1(q.x)},${f1(q.y)}l${f1(-14 + 28 * hash1(i + k))},${f1(30 + 20 * hash1(i * k))}`} stroke={col} strokeWidth={1.4} opacity={0.8} />);
      }
    items.push({z: zc + (r.hang ? -50 : 0), key: `rt${i}`, node: <g key={`rt${i}`}><path d={smoothPath(p2)} stroke={col} strokeWidth={r.w} strokeLinecap="round" fill="none" />{fib}</g>});
  });
  return items;
}

