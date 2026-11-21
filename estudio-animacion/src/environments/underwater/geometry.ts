// Generadores de geometría ESTÁTICA (se calculan una vez y se memorizan).
import {fbm1, rng, smoothPath, TAU, Vec} from '../../engine/math';

export type RockGeom = {
  path: string;
  outline: Vec[];
  pores: {x: number; y: number; rx: number; ry: number; rot: number; o: number}[];
  cracks: string[];
  encrust: {x: number; y: number; r: number; kind: number}[];
  topEdge: string;
};

/** Roca orgánica con base aplanada, facetas suaves, poros, grietas e incrustaciones. */
export function makeRock(seed: number, w: number, h: number, rough = 0.18): RockGeom {
  const r = rng(seed);
  const n = 30;
  const pts: Vec[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const nz = fbm1(i * 0.42 + seed * 3.1, seed, 3);
    const facet = (r() - 0.5) * 0.08;
    const k = 1 + nz * rough * 2 + facet;
    let x = Math.cos(a) * (w / 2) * k;
    let y = Math.sin(a) * (h / 2) * k;
    const flatLine = h * 0.3;
    if (y > flatLine) y = flatLine + (y - flatLine) * 0.25;
    // hombros algo más altos que una elipse: siluetas de roca, no de piedra de río
    if (y < 0) y *= 1 + 0.12 * Math.abs(Math.cos(a));
    x *= 1 + 0.06 * Math.sin(a * 3 + seed);
    pts.push({x, y});
  }
  const pores: RockGeom['pores'] = [];
  const count = Math.round((w * h) / 2600);
  for (let i = 0; i < count; i++) {
    const a = r() * TAU;
    const d = Math.sqrt(r()) * 0.72;
    const s = 2 + r() * Math.min(w, h) * 0.035;
    pores.push({
      x: Math.cos(a) * d * w * 0.5,
      y: Math.sin(a) * d * h * 0.42 + h * 0.02,
      rx: s * (1 + r()),
      ry: s * (0.5 + r() * 0.5),
      rot: r() * 180,
      o: 0.18 + r() * 0.3,
    });
  }
  const cracks: string[] = [];
  const nc = 2 + Math.floor(r() * 3);
  for (let i = 0; i < nc; i++) {
    let x = (r() - 0.5) * w * 0.6;
    let y = -h * 0.2 + r() * h * 0.3;
    const cp: Vec[] = [{x, y}];
    const steps = 4 + Math.floor(r() * 3);
    const dir = r() < 0.5 ? -1 : 1;
    for (let s = 0; s < steps; s++) {
      x += dir * (r() * w * 0.06);
      y += r() * h * 0.09;
      cp.push({x, y});
    }
    cracks.push(smoothPath(cp));
  }
  const encrust: RockGeom['encrust'] = [];
  const top = pts.filter((p) => p.y < -h * 0.15);
  for (let i = 0; i < Math.round(w / 45); i++) {
    const p = top[Math.floor(r() * top.length)];
    if (!p) break;
    encrust.push({x: p.x * 0.92, y: p.y * 0.9 + 3, r: 3 + r() * w * 0.025, kind: Math.floor(r() * 4)});
  }
  // borde superior (para el realce de luz cenital)
  const topPts = pts
    .map((p, i) => ({...p, a: (i / n) * TAU}))
    .filter((p) => p.a > Math.PI * 1.08 && p.a < Math.PI * 1.92);
  return {path: smoothPath(pts, true), outline: pts, pores, cracks, encrust, topEdge: smoothPath(topPts)};
}

export type Branch = {d: string; w: number; depth: number};

/** Coral ramificado (tipo Acropora/gorgonia) por recursión determinista. */
export function makeBranchCoral(seed: number, height: number, spread = 0.55, levels = 5): Branch[] {
  const r = rng(seed);
  const out: Branch[] = [];
  const grow = (x: number, y: number, ang: number, len: number, w: number, lvl: number) => {
    const pts: Vec[] = [{x, y}];
    let cx = x;
    let cy = y;
    let a = ang;
    const steps = 4;
    for (let s = 0; s < steps; s++) {
      a += (r() - 0.5) * 0.35;
      cx += Math.cos(a) * (len / steps);
      cy += Math.sin(a) * (len / steps);
      pts.push({x: cx, y: cy});
    }
    out.push({d: smoothPath(pts), w, depth: levels - lvl});
    if (lvl <= 0) return;
    const kids = 2 + (r() < 0.35 ? 1 : 0);
    for (let k = 0; k < kids; k++) {
      const da = (k / (kids - 1 || 1) - 0.5) * spread * 2 + (r() - 0.5) * 0.3;
      grow(cx, cy, a + da, len * (0.62 + r() * 0.18), w * 0.68, lvl - 1);
    }
  };
  grow(0, 0, -Math.PI / 2, height * 0.32, Math.max(3, height * 0.06), levels);
  return out;
}

/** Gorgonia en abanico: ramas finas + retícula. */
export function makeFanCoral(seed: number, w: number, h: number) {
  const r = rng(seed);
  const branches: string[] = [];
  const nodes: Vec[][] = [];
  const nb = 9;
  for (let i = 0; i < nb; i++) {
    const a = -Math.PI / 2 + (i / (nb - 1) - 0.5) * 1.7;
    const pts: Vec[] = [{x: 0, y: 0}];
    let x = 0;
    let y = 0;
    for (let s = 1; s <= 7; s++) {
      const rad = (s / 7) * (h * 0.95);
      x = Math.cos(a) * rad * (w / h) * 0.6 + (r() - 0.5) * 12;
      y = Math.sin(a) * rad + (r() - 0.5) * 10;
      pts.push({x, y});
    }
    nodes.push(pts);
    branches.push(smoothPath(pts));
  }
  const lattice: string[] = [];
  for (let s = 2; s <= 7; s++) {
    const row = nodes.map((b) => b[s]);
    lattice.push(smoothPath(row));
  }
  return {branches, lattice};
}

/** Erizo: espinas estáticas. */
export function makeUrchin(seed: number, radius: number) {
  const r = rng(seed);
  const spikes: {x1: number; y1: number; x2: number; y2: number}[] = [];
  for (let i = 0; i < 46; i++) {
    const a = Math.PI + r() * Math.PI + (r() - 0.5) * 0.4;
    const len = radius * (1.4 + r() * 1.3);
    spikes.push({
      x1: Math.cos(a) * radius * 0.7,
      y1: Math.sin(a) * radius * 0.55,
      x2: Math.cos(a) * len,
      y2: Math.sin(a) * len * 0.9,
    });
  }
  return spikes;
}
