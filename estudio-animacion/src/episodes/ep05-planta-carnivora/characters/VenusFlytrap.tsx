// Render SVG de la venus atrapamoscas: roseta basal, pecíolos alados y trampas articuladas.
import React from 'react';
import {clamp, hash1, lerp, mixColor, smoothPath, Vec} from '../../../engine/math';
import {hairTip, HAIR_UV, hull, innerVisible, lobeSurface, petioleGeo, TrapGeo, trapGeo, TrapSpec, TrapState} from '../anatomy/flytrap';
import {add, norm, project, scl, V3, View} from '../anatomy/proj';
import {f1, Item} from '../anatomy/render';

const P = (view: View, p: V3) => project(view, p);
const path = (pts: Vec[]) => 'M' + pts.map((p) => `${f1(p.x)},${f1(p.y)}`).join('L') + 'Z';

export type TrapMeta = {geo: TrapGeo; back: {s: 1 | -1; z: number}; front: {s: 1 | -1; z: number}};

type Detail = {veins: number; glands: number; cilia: number};

/** Lóbulo: superficie, nervaduras, glándulas, pelos sensitivos, señal eléctrica y cilios. */
function lobe(view: View, g: TrapGeo, s: 1 | -1, uid: string, det: Detail, light: string): {body: React.ReactNode; cilia: React.ReactNode; z: number} {
  const {spec, st} = g;
  const inner = innerVisible(view, g, s);
  const samples: Vec[] = [];
  for (let i = 0; i <= 16; i++) {
    const u = -1 + (2 * i) / 16;
    for (const v of [0, 0.3, 0.6, 0.85, 1]) samples.push(P(view, g.point(s, u, v)));
  }
  const outline = hull(samples);
  const rim: Vec[] = Array.from({length: 25}, (_, i) => P(view, g.point(s, -1 + (2 * i) / 24, 1)));
  const M = P(view, g.point(s, 0, 0));
  const R = P(view, g.point(s, 0, 1));
  const zc = P(view, g.point(s, 0, 0.5)).z;
  const gid = `${uid}-g${s}`;
  const cid = `${uid}-c${s}`;
  const redIn = mixColor('#9e2a22', '#c23b2f', spec.red);
  const deep = mixColor('#6f8f2a', redIn, 0.35 + 0.65 * spec.red);
  const outerA = '#3f7424';
  const outerB = mixColor('#86b23e', light, 0.15);
  const els: React.ReactNode[] = [];
  els.push(
    <defs key="d">
      <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={f1(M.x)} y1={f1(M.y)} x2={f1(R.x)} y2={f1(R.y)}>
        {inner ? (
          <>
            <stop offset="0" stopColor={mixColor(deep, '#4a1410', 0.25)} />
            <stop offset="0.55" stopColor={deep} />
            <stop offset="0.8" stopColor={mixColor(deep, '#9bbd3c', 0.55)} />
            <stop offset="0.92" stopColor="#a9c94a" />
            <stop offset="1" stopColor="#7da535" />
          </>
        ) : (
          <>
            <stop offset="0" stopColor={outerA} />
            <stop offset="0.7" stopColor={mixColor(outerA, outerB, 0.75)} />
            <stop offset="1" stopColor={outerB} />
          </>
        )}
      </linearGradient>
      <clipPath id={cid}>
        <path d={path(outline)} />
      </clipPath>
    </defs>,
  );
  els.push(<path key="f" d={smoothPath(outline, true, 0.5)} fill={`url(#${gid})`} stroke={mixColor(inner ? deep : outerA, '#000000', 0.35)} strokeWidth={0.8} />);
  const detail: React.ReactNode[] = [];
  // nervaduras: del nervio central hacia el margen
  for (let i = 0; i < det.veins; i++) {
    const u0 = -0.85 + (1.7 * i) / Math.max(1, det.veins - 1);
    const pts: Vec[] = [];
    for (let k = 0; k <= 6; k++) {
      const v = 0.04 + (0.9 * k) / 6;
      pts.push(P(view, g.point(s, clamp(u0 * (1 + 0.25 * v), -0.97, 0.97), v)));
    }
    detail.push(<path key={`v${i}`} d={smoothPath(pts)} fill="none" stroke={inner ? mixColor(deep, '#2a0806', 0.35) : mixColor(outerA, '#c8e07a', 0.35)} strokeWidth={0.7} opacity={0.45} />);
  }
  if (inner) {
    // glándulas digestivas: punteado rojizo
    for (let i = 0; i < det.glands; i++) {
      const u = (hash1(i * 3.1 + spec.seed + s) * 2 - 1) * 0.92;
      const v = 0.08 + hash1(i * 7.7 + spec.seed - s) * 0.68;
      const q = P(view, g.point(s, u, v));
      detail.push(<circle key={`gl${i}`} cx={f1(q.x)} cy={f1(q.y)} r={0.9} fill={mixColor(deep, '#3a0a08', 0.45)} opacity={0.5} />);
    }
    // secreción digestiva (visualización acelerada)
    if (st.glow > 0.01) {
      for (let i = 0; i < 26; i++) {
        const u = (hash1(i * 5.3 + spec.seed) * 2 - 1) * 0.8;
        const v = 0.15 + hash1(i * 2.9 + spec.seed) * 0.55;
        const q = P(view, g.point(s, u, v));
        detail.push(<circle key={`dr${i}`} cx={f1(q.x)} cy={f1(q.y)} r={2.2 + 1.5 * hash1(i)} fill="#ffe08a" opacity={0.55 * st.glow} />);
      }
    }
    // reflejo húmedo
    const hl = [0.15, 0.35, 0.55].map((v, k) => P(view, g.point(s, -0.55 + k * 0.15, v)));
    detail.push(<path key="hl" d={smoothPath(hl)} stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.18} />);
  }
  // señal eléctrica (visualización): frente que se expande desde el pelo tocado
  if (st.signalOn > 0.01) {
    const src = HAIR_UV[0];
    for (let ring = 0; ring < 3; ring++) {
      const r = clamp(st.signal - ring * 0.12) * 2.4;
      if (r <= 0.02) continue;
      const pts: Vec[] = [];
      for (let k = 0; k <= 40; k++) {
        const a = (k / 40) * Math.PI * 2;
        const u = clamp(src[0] * (s === 1 ? 1 : -1) + Math.cos(a) * r * 0.55, -0.99, 0.99);
        const v = clamp(src[1] + Math.sin(a) * r * 0.5, 0, 1);
        pts.push(P(view, g.point(s, u, v)));
      }
      detail.push(<path key={`sg${ring}`} d={smoothPath(pts, true)} fill="none" stroke="#7ff3ff" strokeWidth={2.4 - ring * 0.6} opacity={st.signalOn * (1 - clamp(st.signal - ring * 0.12)) * 0.9} />);
    }
  }
  els.push(
    <g key="det" clipPath={`url(#${cid})`}>
      {detail}
    </g>,
  );
  // nervio central (bisagra)
  if (inner) {
    const m0 = P(view, g.point(s, -0.98, 0));
    const m1 = P(view, g.point(s, 0.98, 0));
    els.push(<path key="mr" d={`M${f1(m0.x)},${f1(m0.y)} L${f1(m1.x)},${f1(m1.y)}`} stroke="#3a0f0a" strokeWidth={1.6} opacity={0.55} />);
  }
  // margen (borde) con un fino filo rojizo
  els.push(<path key="rim" d={smoothPath(rim)} fill="none" stroke={mixColor('#7d2a1c', '#a8c94a', 0.25)} strokeWidth={1.4} opacity={0.85} />);
  // pelos sensitivos (en la cara interna)
  if (inner) {
    for (let k = 0; k < 3; k++) {
      const idx = s === 1 ? k : k + 3;
      const h = hairTip(g, idx);
      const b = P(view, h.base);
      const tp = P(view, h.tip);
      const mid = {x: lerp(b.x, tp.x, 0.22), y: lerp(b.y, tp.y, 0.22)};
      const touched = (st.hairs[idx] ?? 0) > 0.05;
      els.push(
        <g key={`h${k}`}>
          <circle cx={f1(b.x)} cy={f1(b.y)} r={1.6} fill={mixColor(deep, '#ffffff', 0.25)} />
          <path d={`M${f1(b.x)},${f1(b.y)} L${f1(mid.x)},${f1(mid.y)} L${f1(tp.x)},${f1(tp.y)}`} stroke={touched ? '#fff3c4' : '#f2d9cf'} strokeWidth={1.3} strokeLinecap="round" fill="none" opacity={0.95} />
          <circle cx={f1(mid.x)} cy={f1(mid.y)} r={0.9} fill="#e6b7a8" />
        </g>,
      );
    }
  }
  // cilios marginales ("dientes"): láminas finas y afiladas que continúan el borde
  const cil: React.ReactNode[] = [];
  const n = det.cilia;
  const ang = st.cilia >= 0 ? lerp(0, 0.42, st.cilia) : lerp(0, -0.95, -st.cilia);
  for (let i = 0; i < n; i++) {
    const u = -0.9 + (1.8 * (i + (s === 1 ? 0 : 0.5))) / n;
    const base = g.point(s, u, 1);
    const e = g.lobeDir(s);
    const nn = g.normal(s);
    const dir = norm(add(scl(e, Math.cos(ang)), scl(nn, Math.sin(ang))));
    const Lc = spec.W * 0.5 * Math.pow(1 - u * u, 0.25) * (0.9 + 0.2 * hash1(i + spec.seed));
    const curl = scl(nn, -Lc * 0.12 * (st.cilia < 0 ? 1.6 : 0.6));
    const tip = add(add(base, scl(dir, Lc)), curl);
    const midp = add(base, scl(dir, Lc * 0.5));
    const b2 = P(view, base);
    const m2 = P(view, midp);
    const t2 = P(view, tip);
    const dx = t2.x - b2.x;
    const dy = t2.y - b2.y;
    const l = Math.hypot(dx, dy) || 1;
    const wx = (-dy / l) * 1.4;
    const wy = (dx / l) * 1.4;
    cil.push(
      <path
        key={`c${i}`}
        d={`M${f1(b2.x + wx)},${f1(b2.y + wy)} Q${f1(m2.x + wx * 0.6)},${f1(m2.y + wy * 0.6)} ${f1(t2.x)},${f1(t2.y)} Q${f1(m2.x - wx * 0.6)},${f1(m2.y - wy * 0.6)} ${f1(b2.x - wx)},${f1(b2.y - wy)}Z`}
        fill={i % 2 ? '#a7c64a' : '#98ba40'}
        stroke="#5d7f22"
        strokeWidth={0.35}
      />,
    );
  }
  return {body: <g>{els}</g>, cilia: <g>{cil}</g>, z: zc};
}

export function flytrapItems(opts: {view: View; specs: TrapSpec[]; states: Record<string, TrapState>; t: number; uid: string; light: string; detail?: Partial<Detail>; origin?: V3}) {
  const {view, specs, states, t, uid, light} = opts;
  const det: Detail = {veins: 7, glands: 60, cilia: 17, ...opts.detail};
  const origin = opts.origin ?? [0, 0, 0];
  const items: Item[] = [];
  const meta: Record<string, TrapMeta> = {};
  for (const spec of specs) {
    const st = states[spec.id];
    const g = trapGeo(spec, st, t, origin);
    const pid = `${uid}-${spec.id}`;
    // pecíolo
    const pg = petioleGeo(spec, g, origin);
    const L2 = pg.left.map((p) => P(view, p));
    const R2 = pg.right.map((p) => P(view, p));
    const M2 = pg.mid.map((p) => P(view, p));
    const outline = [...L2, ...R2.reverse()];
    const pz = M2.reduce((a, p) => a + p.z, 0) / M2.length;
    const a0 = M2[0];
    const a1 = M2[M2.length - 1];
    items.push({
      z: pz - 2,
      key: `${pid}-pet`,
      node: (
        <g key={`${pid}-pet`}>
          <defs>
            <linearGradient id={`${pid}-pg`} gradientUnits="userSpaceOnUse" x1={f1(a0.x)} y1={f1(a0.y)} x2={f1(a1.x)} y2={f1(a1.y)}>
              <stop offset="0" stopColor="#2f5b1c" />
              <stop offset="0.5" stopColor={mixColor('#5f9a2e', light, 0.1)} />
              <stop offset="1" stopColor="#7aa83a" />
            </linearGradient>
          </defs>
          <path d={smoothPath(outline, true, 0.7)} fill={`url(#${pid}-pg)`} stroke="#2c4f18" strokeWidth={0.8} />
          <path d={smoothPath(M2)} fill="none" stroke="#b9d86a" strokeWidth={1.4} opacity={0.6} />
          <path d={smoothPath(L2)} fill="none" stroke="#d8ef9a" strokeWidth={1} opacity={0.35} />
        </g>
      ),
    });
    // lóbulos ordenados por profundidad
    const A = lobe(view, g, 1, pid, det, light);
    const B = lobe(view, g, -1, pid, det, light);
    const back = A.z < B.z ? {s: 1 as const, l: A} : {s: -1 as const, l: B};
    const front = A.z < B.z ? {s: -1 as const, l: B} : {s: 1 as const, l: A};
    const closed = st.open < 0.35;
    items.push({z: back.l.z, key: `${pid}-b`, node: <g key={`${pid}-b`}>{back.l.body}{!closed && back.l.cilia}</g>});
    items.push({z: front.l.z, key: `${pid}-f`, node: <g key={`${pid}-f`}>{front.l.body}{closed && back.l.cilia}{front.l.cilia}</g>});
    // brillo cálido interior durante la digestión (trampa cerrada, visualización)
    if (st.glow > 0.01 && closed) {
      const c = P(view, add(g.C, scl(g.Y, spec.W * 0.35)));
      items.push({z: front.l.z + 0.01, key: `${pid}-glow`, node: <ellipse key={`${pid}-glow`} cx={f1(c.x)} cy={f1(c.y)} rx={spec.L * 0.42} ry={spec.W * 0.45} fill="#ffcf6a" opacity={0.22 * st.glow} style={{mixBlendMode: 'screen'}} />});
    }
    meta[spec.id] = {geo: g, back: {s: back.s, z: back.l.z}, front: {s: front.s, z: front.l.z}};
  }
  // corona de la roseta
  const c = P(view, [origin[0], origin[1] + 3, origin[2]]);
  items.push({z: c.z - 1, key: `${uid}-crown`, node: <ellipse key={`${uid}-crown`} cx={f1(c.x)} cy={f1(c.y)} rx={16} ry={9} fill="#2a4a17" />});
  return {items, meta};
}

export {lobeSurface};
