// Elementos 3D del sotobosque (proyectados con la misma vista que las hormigas):
// hojarasca y musgo del suelo, rama con corteza, musgo y líquenes, hoja ancha baja,
// tallo de una planta joven y la hoja elevada (vista por su envés) con gotas de agua.
import React from 'react';
import {hash1, mixColor, smoothPath, Vec} from '../../../engine/math';
import {project, V3, View} from '../Animation/proj';
import {f1, Item} from '../Animation/render';
import {BRANCH, BRANCH_R, BRANCH_X0, BRANCH_X1, BRANCH_Y, LEAF1_LEN, leaf1HalfW, leaf1Point, LEAF2_LEN, leaf2HalfW, leaf2Top, STEM, STEM_H, STEM_R, STEM_X, STEM_Z} from './surfaces';

const P = (view: View, p: V3) => project(view, p);

/** Silueta de un cilindro (secciones circulares) en proyección ortográfica. */
function tube(view: View, centers: V3[], a: V3, b: V3, r: (i: number) => number) {
  const C = centers.map((c) => P(view, c));
  const L: Vec[] = [];
  const R: Vec[] = [];
  centers.forEach((c, i) => {
    const pa = P(view, [c[0] + a[0] * r(i), c[1] + a[1] * r(i), c[2] + a[2] * r(i)]);
    const pb = P(view, [c[0] + b[0] * r(i), c[1] + b[1] * r(i), c[2] + b[2] * r(i)]);
    const a2 = {x: pa.x - C[i].x, y: pa.y - C[i].y};
    const b2 = {x: pb.x - C[i].x, y: pb.y - C[i].y};
    const pv = C[Math.max(0, i - 1)];
    const nx = C[Math.min(C.length - 1, i + 1)];
    let tx = nx.x - pv.x;
    let ty = nx.y - pv.y;
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const n = {x: -ty, y: tx};
    const hA = a2.x * n.x + a2.y * n.y;
    const hB = b2.x * n.x + b2.y * n.y;
    const hn = Math.hypot(hA, hB) || 1e-6;
    const e = {x: (a2.x * hA + b2.x * hB) / hn, y: (a2.y * hA + b2.y * hB) / hn};
    L.push({x: C[i].x + e.x, y: C[i].y + e.y});
    R.push({x: C[i].x - e.x, y: C[i].y - e.y});
  });
  return {outline: [...L, ...R.reverse()], C};
}

export function forestItems(view: View, t: number, detail: number, dark: number): Item[] {
  const items: Item[] = [];
  const d = (c: string) => mixColor(c, '#050a06', dark);
  const sp = Math.sin(Math.abs(view.pitch));
  // ---------------- suelo: tierra húmeda, hojarasca y musgo
  const floor: React.ReactNode[] = [];
  const c0 = P(view, [0, 0, 0]);
  floor.push(
    <defs key="fd">
      <radialGradient id="fl-g" gradientUnits="userSpaceOnUse" cx={f1(c0.x)} cy={f1(c0.y)} r={4200}>
        <stop offset="0" stopColor={d('#3a2c1c')} stopOpacity={1} />
        <stop offset="0.7" stopColor={d('#33281a')} stopOpacity={0.9} />
        <stop offset="1" stopColor={d('#2c2416')} stopOpacity={0} />
      </radialGradient>
    </defs>,
  );
  floor.push(<ellipse key="soil" cx={f1(c0.x)} cy={f1(c0.y)} rx={4200} ry={Math.max(20, 4200 * sp)} fill="url(#fl-g)" />);
  for (let i = 0; i < Math.round(110 * detail); i++) {
    const x = -4200 + hash1(i * 1.9) * 7000;
    const z = -450 + hash1(i * 2.7) * 1750;
    const q = P(view, [x, 1, z]);
    const s = 40 + hash1(i * 3.3) * 90;
    const a = hash1(i * 4.1) * 180;
    const col = d(['#6b4a26', '#8a6232', '#5a3c1e', '#7a5a2a', '#4f6a2c'][i % 5]);
    floor.push(<ellipse key={`l${i}`} cx={f1(q.x)} cy={f1(q.y)} rx={f1(s)} ry={f1(Math.max(2, s * 0.4 * Math.max(0.2, sp)))} transform={`rotate(${a.toFixed(0)} ${f1(q.x)} ${f1(q.y)})`} fill={col} opacity={0.85} />);
  }
  items.push({z: -1e5, key: 'floor', node: <g key="floor">{floor}</g>});

  // ---------------- rama con corteza
  {
    const N = 26;
    const centers: V3[] = Array.from({length: N + 1}, (_, i) => [BRANCH_X0 + ((BRANCH_X1 - BRANCH_X0) * i) / N, BRANCH_Y, 0]);
    const {outline} = tube(view, centers, [0, 1, 0], [0, 0, 1], () => BRANCH_R);
    const top = P(view, [0, BRANCH_Y + BRANCH_R, 0]);
    const bot = P(view, [0, BRANCH_Y - BRANCH_R, 0]);
    const tex: React.ReactNode[] = [];
    // grietas longitudinales de la corteza (solo en la cara visible)
    for (let j = 0; j < 16; j++) {
      const th = -1.3 + (j / 15) * 2.6;
      const nrm: V3 = [0, Math.cos(th), Math.sin(th)];
      if (view.M[2][1] * nrm[1] + view.M[2][2] * nrm[2] < 0.05) continue;
      let x = BRANCH_X0 + hash1(j * 3.1) * 300;
      while (x < BRANCH_X1 - 200) {
        const L = 180 + hash1(x * 0.01 + j) * 420;
        const pts = [0, 0.5, 1].map((u) => P(view, BRANCH.point(x + L * u, th * BRANCH_R + Math.sin(u * 3 + j) * 6)));
        tex.push(<path key={`${j}-${x.toFixed(0)}`} d={smoothPath(pts)} stroke={d('#2a1c12')} strokeWidth={2.4} fill="none" opacity={0.7} />);
        x += L + 60 + hash1(x + j) * 200;
      }
    }
    // musgo y líquenes
    for (let i = 0; i < Math.round(40 * detail); i++) {
      const x = BRANCH_X0 + 100 + hash1(i * 7.3) * (BRANCH_X1 - BRANCH_X0 - 200);
      const th = (hash1(i * 5.9) - 0.5) * 2.2;
      const nrm: V3 = [0, Math.cos(th), Math.sin(th)];
      if (view.M[2][1] * nrm[1] + view.M[2][2] * nrm[2] < 0.1) continue;
      const q = P(view, BRANCH.point(x, th * BRANCH_R));
      const r = 20 + hash1(i * 2.1) * 50;
      const lichen = i % 4 === 0;
      tex.push(<ellipse key={`m${i}`} cx={f1(q.x)} cy={f1(q.y)} rx={f1(r)} ry={f1(r * 0.55)} fill={d(lichen ? '#a8b49a' : '#4f7a2e')} opacity={lichen ? 0.55 : 0.75} />);
      if (!lichen) for (let m = 0; m < 5; m++) tex.push(<circle key={`m${i}-${m}`} cx={f1(q.x + (hash1(i + m) - 0.5) * r * 1.4)} cy={f1(q.y + (hash1(i * m + 1) - 0.5) * r * 0.6)} r={4} fill={d('#7aa848')} />);
    }
    items.push({
      z: P(view, [0, BRANCH_Y, 0]).z - 60,
      key: 'branch',
      node: (
        <g key="branch">
          <defs>
            <linearGradient id="br-g" gradientUnits="userSpaceOnUse" x1={f1(top.x)} y1={f1(top.y)} x2={f1(bot.x)} y2={f1(bot.y)}>
              <stop offset="0" stopColor={d('#7a6450')} />
              <stop offset="0.45" stopColor={d('#5a4532')} />
              <stop offset="1" stopColor={d('#2a1e14')} />
            </linearGradient>
          </defs>
          <path d={smoothPath(outline, true, 0.4)} fill="url(#br-g)" stroke={d('#1e150d')} strokeWidth={2} />
          {tex}
        </g>
      ),
    });
  }

  // ---------------- hoja baja (LEAF1)
  items.push(...leafItem(view, 'leaf1', LEAF1_LEN, leaf1HalfW, leaf1Point, false, d, t));

  // ---------------- tallo y hoja elevada
  {
    const N = 16;
    const centers: V3[] = Array.from({length: N + 1}, (_, i) => [STEM_X + Math.sin(i * 0.5) * 4, (STEM_H * i) / N, STEM_Z]);
    const {outline} = tube(view, centers, [1, 0, 0], [0, 0, 1], (i) => STEM_R * (1.15 - 0.25 * (i / N)));
    const l = P(view, STEM.point(STEM_H / 2, -STEM_R * 1.2));
    const r = P(view, STEM.point(STEM_H / 2, STEM_R * 1.2));
    items.push({
      z: P(view, [STEM_X, 0, STEM_Z]).z - 10,
      key: 'stem',
      node: (
        <g key="stem">
          <defs>
            <linearGradient id="st-g" gradientUnits="userSpaceOnUse" x1={f1(l.x)} y1={f1(l.y)} x2={f1(r.x)} y2={f1(r.y)}>
              <stop offset="0" stopColor={d('#2e5a22')} />
              <stop offset="0.4" stopColor={d('#6a9a3e')} />
              <stop offset="1" stopColor={d('#1f3d18')} />
            </linearGradient>
          </defs>
          <path d={smoothPath(outline, true, 0.4)} fill="url(#st-g)" stroke={d('#173012')} strokeWidth={1.5} />
        </g>
      ),
    });
  }
  items.push(...leafItem(view, 'leaf2', LEAF2_LEN, leaf2HalfW, leaf2Top, true, d, t));
  return items;
}

/** Hoja con nervio central y nervaduras; si la cámara ve el envés, se colorea más pálida. */
function leafItem(view: View, id: string, len: number, halfW: (a: number) => number, pt: (a: number, b: number) => V3, petiole: boolean, d: (c: string) => string, t: number): Item[] {
  const N = 22;
  const L: Vec[] = [];
  const R: Vec[] = [];
  const M: Vec[] = [];
  for (let i = 0; i <= N; i++) {
    const a = (len * i) / N;
    const w = halfW(a);
    L.push(P(view, pt(a, w)));
    R.push(P(view, pt(a, -w)));
    M.push(P(view, pt(a, 0)));
  }
  const nUp = view.M[2][1]; // >0: la cámara ve la cara superior
  const under = nUp < 0;
  const base = under ? '#7fa863' : '#3f7a2e';
  const tip = under ? '#a8c888' : '#5f9a3e';
  const veins: React.ReactNode[] = [];
  for (let i = petiole ? 4 : 2; i < N - 1; i += 2) {
    const a = (len * i) / N;
    for (const sg of [1, -1]) {
      const p0 = P(view, pt(a, 0));
      const p1 = P(view, pt(a + len * 0.07, sg * halfW(a) * 0.9));
      veins.push(<path key={`${i}${sg}`} d={`M${f1(p0.x)},${f1(p0.y)} Q${f1((p0.x + p1.x) / 2)},${f1((p0.y + p1.y) / 2 - 4)} ${f1(p1.x)},${f1(p1.y)}`} stroke={d(under ? '#d6e6b8' : '#87b45a')} strokeWidth={2} fill="none" opacity={0.6} />);
    }
  }
  // gotas de agua sobre la hoja (cara superior)
  const drops: React.ReactNode[] = [];
  if (!under)
    for (let i = 0; i < 7; i++) {
      const a = len * (0.25 + hash1(i * 3.3 + id.length) * 0.6);
      const b = (hash1(i * 5.1) - 0.5) * halfW(a) * 1.2;
      const q = P(view, pt(a, b));
      const r = 9 + hash1(i) * 10;
      drops.push(
        <g key={i}>
          <circle cx={f1(q.x)} cy={f1(q.y - r * 0.5)} r={f1(r)} fill="#d9f0ff" opacity={0.4} />
          <circle cx={f1(q.x - r * 0.35)} cy={f1(q.y - r * 0.9)} r={f1(r * 0.3)} fill="#ffffff" opacity={0.85} />
        </g>,
      );
    }
  const zc = P(view, pt(len / 2, 0)).z;
  const g0 = M[0];
  const g1 = M[N];
  void t;
  return [
    {
      z: zc - 30,
      key: id,
      node: (
        <g key={id}>
          <defs>
            <linearGradient id={`${id}-g`} gradientUnits="userSpaceOnUse" x1={f1(g0.x)} y1={f1(g0.y)} x2={f1(g1.x)} y2={f1(g1.y)}>
              <stop offset="0" stopColor={d(base)} />
              <stop offset="1" stopColor={d(tip)} />
            </linearGradient>
          </defs>
          <path d={smoothPath([...L, ...[...R].reverse()], true, 0.7)} fill={`url(#${id}-g)`} stroke={d('#1f3d18')} strokeWidth={1.6} />
          <path d={smoothPath(M)} stroke={d(under ? '#e4efc9' : '#9cc46a')} strokeWidth={under ? 6 : 3.5} fill="none" opacity={0.85} />
          {veins}
          {drops}
          <path d={smoothPath(L)} stroke="#ffffff" strokeWidth={2} fill="none" opacity={under ? 0.15 : 0.25} />
        </g>
      ),
    },
  ];
}

