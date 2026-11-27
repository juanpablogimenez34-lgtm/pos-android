// Rig y render del ajolote (3D ligero proyectado a SVG, sin Three.js).
// - Columna de 40 segmentos: secciones elípticas (ancho/alto) → silueta exacta proyectada.
// - Ondulación lateral: onda estacionaria al caminar, onda viajera al nadar, giro de la cabeza.
// - Aleta caudal continua (dorsal desde el lomo + ventral desde la cloaca), translúcida.
// - 3 pares de branquias externas con filamentos plumosos que ondulan.
// - 4 extremidades con IK (codos hacia atrás, rodillas hacia delante): 4 dedos delante, 5 detrás.
// - Extremidad anterior izquierda (LF) del protagonista con geometría de regeneración (r 0–6).
import React from 'react';
import {clamp, hash1, lerp, mixColor, smoothPath, smoothstep, Vec} from '../../../engine/math';
import {add, cross, dot, ik3, norm, project, scl, sub, V3, View} from '../Animation/proj';
import {f1, Item} from '../Animation/render';
import {AxolotlSpec, LimbId} from './axolotlSpec';

export type LimbPose = {target: V3 | null; tuck: number}; // target = muñeca/tobillo en el mundo; tuck = 1 pegada al cuerpo (nado)

export type AxolotlPose = {
  root: V3; // punto de la columna en s = 0.36
  heading: number; // rumbo (rad) en el plano del fondo
  /** Ángulo lateral de la columna en s (rad), relativo al rumbo. */
  bend: (s: number) => number;
  /** Altura del centro de la sección en s (mundo). */
  height: (s: number) => number;
  limbs: Record<LimbId, LimbPose>;
  gillPhase: number;
  gillAmp: number;
  gillFlare: number; // 0–1 branquias abiertas (sobresalto o respiración)
  mouth: number; // 0–1 apertura de la boca
  throat: number; // 0–1 expansión de la garganta (succión)
  eyeLook: number;
  regen: {r: number; size: number} | null; // regeneración de la extremidad LF
  highlight: number; // 0–1 resaltado científico de LF
  opacity: number;
};

const N = 40;
const ROOT_S = 0.36;

export const profileAt = (tab: [number, number, number][], s: number): [number, number] => {
  if (s <= tab[0][0]) return [tab[0][1], tab[0][2]];
  for (let i = 0; i < tab.length - 1; i++) {
    const [s0, w0, h0] = tab[i];
    const [s1, w1, h1] = tab[i + 1];
    if (s <= s1) {
      const u = (s - s0) / (s1 - s0);
      const e = u * u * (3 - 2 * u);
      return [lerp(w0, w1, e), lerp(h0, h1, e)];
    }
  }
  const l = tab[tab.length - 1];
  return [l[1], l[2]];
};
const finAt = (tab: [number, number][], s: number) => {
  if (s <= tab[0][0] || s >= tab[tab.length - 1][0]) return 0;
  for (let i = 0; i < tab.length - 1; i++) {
    if (s <= tab[i + 1][0]) {
      const u = (s - tab[i][0]) / (tab[i + 1][0] - tab[i][0]);
      return lerp(tab[i][1], tab[i + 1][1], u * u * (3 - 2 * u));
    }
  }
  return 0;
};

export type Spine = {pts: V3[]; T: V3[]; U: V3[]; LEFT: V3[]; s: number[]; w: number[]; h: number[]};

/** Columna en el mundo (cabeza → cola). */
export function spineOf(spec: AxolotlSpec, pose: AxolotlPose): Spine {
  const L = spec.L;
  const ds = L / N;
  const iR = Math.round(ROOT_S * N);
  const xz: [number, number][] = new Array(N + 1);
  xz[iR] = [pose.root[0], pose.root[2]];
  const dirAt = (k: number) => pose.heading + pose.bend(k / N);
  for (let k = iR; k > 0; k--) {
    const a = dirAt(k - 0.5);
    xz[k - 1] = [xz[k][0] + Math.cos(a) * ds, xz[k][1] + Math.sin(a) * ds];
  }
  for (let k = iR; k < N; k++) {
    const a = dirAt(k + 0.5);
    xz[k + 1] = [xz[k][0] - Math.cos(a) * ds, xz[k][1] - Math.sin(a) * ds];
  }
  const pts: V3[] = xz.map(([x, z], k) => [x, pose.height(k / N), z]);
  const T: V3[] = [];
  const U: V3[] = [];
  const LEFT: V3[] = [];
  const s: number[] = [];
  const w: number[] = [];
  const h: number[] = [];
  for (let k = 0; k <= N; k++) {
    const a = pts[Math.max(0, k - 1)];
    const b = pts[Math.min(N, k + 1)];
    const t = norm(sub(a, b));
    const up0: V3 = [0, 1, 0];
    const u = norm(sub(up0, scl(t, dot(up0, t))));
    T.push(t);
    U.push(u);
    LEFT.push(cross(u, t));
    s.push(k / N);
    const [ww, hh] = profileAt(spec.profile, k / N);
    w.push(ww * L);
    h.push(hh * L);
  }
  return {pts, T, U, LEFT, s, w, h};
}

/** Punto sobre la piel: sección k, ángulo th (0 = lado izquierdo, π/2 = dorso), lado sg (+1 izq, −1 der). */
const skin = (sp: Spine, k: number, th: number, sg = 1): V3 => add(sp.pts[k], add(scl(sp.LEFT[k], sg * sp.w[k] * Math.cos(th)), scl(sp.U[k], sp.h[k] * Math.sin(th))));

export const LIMB_SIDE: Record<LimbId, 1 | -1> = {LF: 1, RF: -1, LH: 1, RH: -1};

/** Hombro / cadera de una extremidad (mundo). */
export function limbBase(spec: AxolotlSpec, sp: Spine, id: LimbId) {
  const fore = id === 'LF' || id === 'RF';
  const k = Math.round((fore ? spec.shoulderS : spec.hipS) * N);
  const sg = LIMB_SIDE[id];
  return {p: add(sp.pts[k], add(scl(sp.LEFT[k], sg * sp.w[k] * 0.78), scl(sp.U[k], -sp.h[k] * 0.38))), k, sg, fore};
}

/** Posición de reposo de la muñeca/tobillo sobre el fondo (para planos quietos y la marcha). */
export function restTarget(spec: AxolotlSpec, sp: Spine, id: LimbId, groundY = 0): V3 {
  const b = limbBase(spec, sp, id);
  const L = spec.L;
  const T = sp.T[b.k];
  const side = scl(sp.LEFT[b.k], b.sg);
  const fwd = b.fore ? 0.035 : -0.01;
  const out = b.fore ? 0.085 : 0.095;
  const q = add(b.p, add(scl(T, fwd * L), scl(side, out * L)));
  return [q[0], groundY + 0.008 * L, q[2]];
}

export function axolotlItems(view: View, spec: AxolotlSpec, pose: AxolotlPose, uid: string): {items: Item[]; spine: Spine; lfTip: V3 | null; lfElbow: V3 | null} {
  const L = spec.L;
  const C = spec.colors;
  const sp = spineOf(spec, pose);
  const P = (p: V3) => project(view, p);
  const camZ = (d: V3) => view.M[2][0] * d[0] + view.M[2][1] * d[1] + view.M[2][2] * d[2];
  const items: Item[] = [];
  const rootZ = P(pose.root).z;
  const push = (z: number, key: string, node: React.ReactNode) => items.push({z, key: `${uid}-${key}`, node: <g key={`${uid}-${key}`} opacity={pose.opacity}>{node}</g>});
  const iR = Math.round(ROOT_S * N);
  // lado visible del animal (+1 izquierdo hacia la cámara)
  const nearSide: 1 | -1 = camZ(sp.LEFT[iR]) >= 0 ? 1 : -1;
  const sideZ = (sg: number) => camZ(scl(sp.LEFT[iR], sg));
  const dorsal = camZ(sp.U[iR]); // 1 = visto desde arriba

  // ---------------- sombra de contacto sobre el fondo
  {
    const pts = sp.pts.map((p) => P([p[0], 0, p[2]]));
    const lift = clamp(1 - (pose.height(ROOT_S) - sp.h[iR]) / (0.25 * L));
    if (lift > 0.02) push(-1e5 + rootZ * 1e-3, 'shadow', <path d={smoothPath(pts)} stroke="#06120c" strokeWidth={0.1 * L} strokeLinecap="round" fill="none" opacity={0.28 * lift} style={{filter: 'blur(10px)'}} />);
  }

  // ---------------- contorno del cuerpo (silueta de las secciones)
  const left: Vec[] = [];
  const right: Vec[] = [];
  const C2: Vec[] = sp.pts.map((p) => P(p));
  for (let k = 0; k <= N; k++) {
    const c = C2[k];
    const a = P(add(sp.pts[k], scl(sp.LEFT[k], sp.w[k])));
    const b = P(add(sp.pts[k], scl(sp.U[k], sp.h[k] * (1 + (k / N < 0.13 ? 0.35 * pose.throat * smoothstep(0.02, 0.06, k / N) : 0)))));
    const a2 = {x: a.x - c.x, y: a.y - c.y};
    const b2 = {x: b.x - c.x, y: b.y - c.y};
    const prev = C2[Math.max(0, k - 1)];
    const next = C2[Math.min(N, k + 1)];
    let tx = prev.x - next.x;
    let ty = prev.y - next.y;
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const nx = -ty;
    const ny = tx;
    const hA = a2.x * nx + a2.y * ny;
    const hB = b2.x * nx + b2.y * ny;
    const hn = Math.hypot(hA, hB) || 1e-6;
    const ex = (a2.x * hA + b2.x * hB) / hn;
    const ey = (a2.y * hA + b2.y * hB) / hn;
    left.push({x: c.x + ex, y: c.y + ey});
    right.push({x: c.x - ex, y: c.y - ey});
    if (k === 0) {
      // hocico redondeado
      left.unshift({x: c.x + tx * 0.016 * L + ex * 0.5, y: c.y + ty * 0.016 * L + ey * 0.5});
      right.unshift({x: c.x + tx * 0.016 * L - ex * 0.5, y: c.y + ty * 0.016 * L - ey * 0.5});
    }
  }
  const outline = [...left, ...[...right].reverse()];
  const topC = P(add(pose.root, scl(sp.U[iR], sp.h[iR])));
  const botC = P(add(pose.root, scl(sp.U[iR], -sp.h[iR])));
  const gid = `${uid}-bg`;

  // ---------------- aletas (detrás del cuerpo)
  const finPoly = (tab: [number, number][], sgn: number) => {
    const top: Vec[] = [];
    const base: Vec[] = [];
    for (let k = 0; k <= N; k++) {
      const f = finAt(tab, k / N) * L;
      if (f <= 0.5 && !(top.length && k === N)) continue;
      top.push(P(add(sp.pts[k], scl(sp.U[k], sgn * (sp.h[k] + f)))));
      base.push(P(add(sp.pts[k], scl(sp.U[k], sgn * sp.h[k] * 0.4))));
    }
    return top.length > 2 ? [...top, ...base.reverse()] : null;
  };
  const fins = [finPoly(spec.finTop, 1), finPoly(spec.finBottom, -1)].filter(Boolean) as Vec[][];

  // ---------------- detalles sobre la piel (lado visible)
  const det: React.ReactNode[] = [];
  // brillo húmedo dorsal
  {
    const pts: Vec[] = [];
    for (let k = 1; k <= Math.round(N * 0.82); k++) pts.push(P(skin(sp, k, Math.PI / 2 - 0.35 * nearSide * (1 - Math.abs(dorsal)), nearSide)));
    det.push(<path key="hl" d={smoothPath(pts)} stroke="#ffffff" strokeWidth={0.009 * L} strokeLinecap="round" fill="none" opacity={spec.colors.spots ? 0.18 : 0.32} />);
  }
  // surcos costales en el flanco visible
  if (Math.abs(sideZ(1)) > 0.2) {
    for (let g = 0; g < 11; g++) {
      const k = Math.round((0.25 + g * 0.021) * N * 1) ;
      const kk = Math.min(N, Math.max(0, k));
      const pts = [0.75, 0.3, -0.2, -0.6].map((th) => P(skin(sp, kk, th, nearSide)));
      det.push(<path key={`cg${g}`} d={smoothPath(pts)} stroke={C.dark} strokeWidth={0.0035 * L} fill="none" opacity={0.28} />);
    }
  }
  // moteado del ajolote silvestre
  if (C.spots) {
    for (let i = 0; i < 70; i++) {
      const s = 0.03 + hash1(i * 3.7 + spec.seed) * 0.9;
      const k = Math.round(s * N);
      const th = -0.3 + hash1(i * 5.3 + spec.seed) * 2.0;
      const q = skin(sp, k, th, nearSide);
      const nrm = add(scl(sp.LEFT[k], nearSide * Math.cos(th)), scl(sp.U[k], Math.sin(th)));
      if (camZ(nrm) < 0.1) continue;
      const pq = P(q);
      const r = (0.006 + hash1(i * 7.1) * 0.01) * L * (1 - 0.6 * s);
      det.push(<ellipse key={`sp${i}`} cx={f1(pq.x)} cy={f1(pq.y)} rx={f1(r * 1.4)} ry={f1(r)} fill={C.spots} opacity={0.55} />);
      if (C.flecks && i % 3 === 0) det.push(<circle key={`fk${i}`} cx={f1(pq.x + r * 1.6)} cy={f1(pq.y - r)} r={f1(r * 0.35)} fill={C.flecks} opacity={0.6} />);
    }
  }
  // ojos pequeños y oscuros (sin párpados)
  const eyes: Vec[] = [];
  for (const sg of [1, -1] as const) {
    const k = Math.round(0.055 * N);
    const nrm = add(scl(sp.LEFT[k], sg * 0.62), scl(sp.U[k], 0.7));
    if (camZ(nrm) < -0.05) continue;
    const q = P(add(sp.pts[k], add(scl(sp.LEFT[k], sg * sp.w[k] * 0.66), scl(sp.U[k], sp.h[k] * 0.62))));
    eyes.push(q);
    const r = 0.0082 * L;
    det.push(
      <g key={`e${sg}`}>
        <circle cx={f1(q.x)} cy={f1(q.y)} r={f1(r * 1.25)} fill={mixColor(C.body, C.dark, 0.5)} opacity={0.6} />
        <circle cx={f1(q.x)} cy={f1(q.y)} r={f1(r)} fill={C.eye} />
        <circle cx={f1(q.x - r * 0.35)} cy={f1(q.y - r * 0.35)} r={f1(r * 0.28)} fill="#ffffff" opacity={0.8} />
      </g>,
    );
  }
  // boca amplia (línea lateral) y apertura para la succión
  if (Math.abs(sideZ(1)) > 0.15) {
    const up: Vec[] = [];
    const lo: Vec[] = [];
    for (let i = 0; i <= 6; i++) {
      const s = (i / 6) * 0.075;
      const k = Math.min(N, Math.round(s * N));
      const fk = s * N - Math.floor(s * N);
      void fk;
      up.push(P(skin(sp, k, -0.32, nearSide)));
      const drop = pose.mouth * (1 - i / 6) * sp.h[k] * 1.3;
      lo.push(P(add(skin(sp, k, -0.32, nearSide), scl(sp.U[k], -drop))));
    }
    if (pose.mouth > 0.05) det.push(<path key="mo" d={smoothPath([...up, ...[...lo].reverse()], true, 0.6)} fill="#5a2a30" opacity={0.85} />);
    det.push(<path key="ml" d={smoothPath(up)} stroke={mixColor(C.dark, '#000000', 0.25)} strokeWidth={0.004 * L} strokeLinecap="round" fill="none" opacity={0.75} />);
  }

  push(rootZ, 'body', (
    <>
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={f1(topC.x)} y1={f1(topC.y)} x2={f1(botC.x)} y2={f1(botC.y)}>
          <stop offset="0" stopColor={mixColor(C.body, C.dark, 0.25)} />
          <stop offset="0.45" stopColor={C.body} />
          <stop offset="1" stopColor={C.belly} />
        </linearGradient>
      </defs>
      {fins.map((f, i) => (
        <path key={`f${i}`} d={smoothPath(f, true, 0.7)} fill={C.fin} opacity={0.72} stroke={mixColor(C.fin, C.dark, 0.4)} strokeWidth={0.0025 * L} />
      ))}
      <path d={smoothPath(outline, true, 0.65)} fill={`url(#${gid})`} stroke={mixColor(C.dark, '#000000', 0.15)} strokeWidth={0.0035 * L} />
      {det}
    </>
  ));

  // ---------------- branquias externas: 3 ramas por lado con filamentos plumosos
  for (const sg of [1, -1] as const) {
    const k = Math.round(spec.gillS * N);
    const T = sp.T[k];
    const U = sp.U[k];
    const S = scl(sp.LEFT[k], sg);
    const nodes: React.ReactNode[] = [];
    spec.gills.forEach((g, j) => {
      const sway = Math.sin(pose.gillPhase + j * 0.9 + (sg > 0 ? 0 : 0.6)) * pose.gillAmp;
      const flare = pose.gillFlare * 0.35;
      const base = add(sp.pts[k], add(scl(S, sp.w[k] * 0.86), scl(U, sp.h[k] * (0.45 - j * 0.32))));
      const d = norm(add(add(scl(T, -0.8 + flare * 0.6), scl(S, g.out + flare + sway * 0.3)), scl(U, g.up + sway)));
      const len = g.len * L;
      const ram: V3[] = [];
      for (let i = 0; i <= 6; i++) {
        const u = i / 6;
        ram.push(add(add(base, scl(d, len * u)), add(scl(T, -len * 0.28 * u * u), scl(U, len * 0.06 * Math.sin(pose.gillPhase * 1.3 + u * 3) * pose.gillAmp * 3))));
      }
      const r2 = ram.map(P);
      const q = norm(cross(d, S));
      const fil: React.ReactNode[] = [];
      for (let i = 1; i <= 16; i++) {
        const u = i / 16;
        const f = Math.min(5.999, u * 6);
        const a = ram[Math.floor(f)];
        const b = ram[Math.min(6, Math.floor(f) + 1)];
        const pt = add(a, scl(sub(b, a), f - Math.floor(f)));
        const flen = (0.034 - 0.016 * u) * L * (0.8 + 0.4 * hash1(i * 3.3 + j * 7 + spec.seed));
        const flick = Math.sin(pose.gillPhase * 2.1 + i * 0.7 + j) * (0.25 + pose.gillAmp * 3);
        for (const side of [1, -1]) {
          const fd = norm(add(add(scl(q, side * 0.9), scl(d, -0.55)), scl(T, -0.15 + flick * 0.25)));
          const mid = add(add(pt, scl(fd, flen * 0.55)), scl(T, -flen * 0.25 * (1 + flick)));
          const e = add(add(pt, scl(fd, flen)), scl(T, -flen * 0.45 * (1 + flick)));
          const p0 = P(pt);
          const pm = P(mid);
          const p1 = P(e);
          fil.push(<path key={`${i}${side}`} d={`M${f1(p0.x)},${f1(p0.y)}Q${f1(pm.x)},${f1(pm.y)} ${f1(p1.x)},${f1(p1.y)}`} stroke={i % 3 === 0 ? C.gillTip : C.gill} strokeWidth={0.0036 * L} strokeLinecap="round" fill="none" opacity={0.85} />);
        }
      }
      nodes.push(
        <g key={j}>
          {fil}
          <path d={smoothPath(r2)} stroke={mixColor(C.gill, C.body, 0.35)} strokeWidth={0.009 * L} strokeLinecap="round" fill="none" />
        </g>,
      );
    });
    const z = rootZ + (sideZ(sg) > 0.12 ? 2 : -2);
    push(z, `gill${sg}`, <>{nodes}</>);
  }

  // ---------------- extremidades
  let lfTip: V3 | null = null;
  let lfElbow: V3 | null = null;
  (['LF', 'RF', 'LH', 'RH'] as LimbId[]).forEach((id) => {
    const b = limbBase(spec, sp, id);
    const seg = b.fore ? spec.fore : spec.hind;
    const l1 = seg.upper * L;
    const l2 = seg.lower * L;
    const T = sp.T[b.k];
    const U = sp.U[b.k];
    const S = scl(sp.LEFT[b.k], b.sg);
    const lp = pose.limbs[id];
    const tucked: V3 = add(b.p, add(add(scl(T, -(l1 + l2) * 0.85), scl(S, sp.w[b.k] * 0.35)), scl(U, -sp.h[b.k] * 0.1)));
    let wrist: V3 = lp.target ?? tucked;
    if (lp.target && lp.tuck > 0) wrist = add(scl(lp.target, 1 - lp.tuck), scl(tucked, lp.tuck));
    const pole = norm(add(add(scl(S, 1), scl(U, 0.7)), scl(T, b.fore ? -0.45 : 0.45)));
    const elbow = ik3(b.p, wrist, l1, l2, pole);
    // dirección de la mano: hacia delante y afuera sobre el fondo; hacia atrás al nadar
    const groundFwd = norm([T[0], 0, T[2]]);
    const groundSide = norm([S[0], 0, S[2]]);
    const hdPlant = norm(add(scl(groundFwd, b.fore ? 0.75 : 0.25), scl(groundSide, b.fore ? 0.65 : 0.95)));
    const tk = lp.target ? lp.tuck : 1;
    const hd = norm(add(scl(hdPlant, 1 - tk), scl(T, -tk)));
    const hUp = norm(add(scl([0, 1, 0], 1 - tk), scl(S, tk)));
    const hSide = norm(cross(hUp, hd));
    const regen = id === 'LF' && pose.regen ? pose.regen : null;
    const P0 = P(b.p);
    const PE = P(elbow);
    const PW = P(wrist);
    const wU = 0.016 * L;
    const wL = 0.0135 * L;
    const bodyCol = C.body;
    const outlineCol = mixColor(C.dark, '#000000', 0.1);
    const seg2 = (a: Vec, c: Vec, w: number, col = bodyCol) => (
      <>
        <path d={`M${f1(a.x)},${f1(a.y)}L${f1(c.x)},${f1(c.y)}`} stroke={outlineCol} strokeWidth={w * 2 + 0.004 * L} strokeLinecap="round" />
        <path d={`M${f1(a.x)},${f1(a.y)}L${f1(c.x)},${f1(c.y)}`} stroke={col} strokeWidth={w * 2} strokeLinecap="round" />
      </>
    );
    const els: React.ReactNode[] = [];
    els.push(<g key="u">{seg2(P0, PE, wU)}</g>);
    const hand = (scale: number, digitK: number[], paddle: number, tint: string, op = 1) => {
      // palma + dedos en abanico (4 delante, 5 detrás), dedos delgados con punta redondeada
      const palmC = add(wrist, scl(hd, seg.palm * L * 0.55 * scale));
      const n = seg.digits.length;
      const spread = b.fore ? 0.62 : 0.78;
      const out: React.ReactNode[] = [];
      const pc = P(palmC);
      if (paddle > 0.01) {
        const pr = seg.palm * L * (0.9 + 0.8 * paddle) * scale;
        const pa = P(add(palmC, scl(hd, pr * 0.5)));
        out.push(<ellipse key="pd" cx={f1(pa.x)} cy={f1(pa.y)} rx={f1(pr * 0.9)} ry={f1(pr * 0.55)} transform={`rotate(${((Math.atan2(pa.y - pc.y, pa.x - pc.x) * 180) / Math.PI).toFixed(1)} ${f1(pa.x)} ${f1(pa.y)})`} fill={tint} stroke={outlineCol} strokeWidth={0.003 * L} opacity={op * paddle} />);
      }
      seg.digits.forEach((dl, i) => {
        const g = digitK[i] ?? 1;
        if (g <= 0.01) return;
        const a = (-spread / 2 + (spread * i) / Math.max(1, n - 1)) * (b.sg === 1 ? 1 : -1);
        const dd = norm(add(scl(hd, Math.cos(a)), scl(hSide, Math.sin(a))));
        const base = add(palmC, scl(dd, seg.palm * L * 0.35 * scale));
        const tip = add(base, scl(dd, dl * L * scale * g));
        const pb = P(base);
        const pt = P(tip);
        out.push(
          <g key={i} opacity={op}>
            <path d={`M${f1(pb.x)},${f1(pb.y)}L${f1(pt.x)},${f1(pt.y)}`} stroke={outlineCol} strokeWidth={0.0095 * L * scale + 0.003 * L} strokeLinecap="round" />
            <path d={`M${f1(pb.x)},${f1(pb.y)}L${f1(pt.x)},${f1(pt.y)}`} stroke={tint} strokeWidth={0.0095 * L * scale} strokeLinecap="round" />
            <circle cx={f1(pt.x)} cy={f1(pt.y)} r={f1(0.0052 * L * scale)} fill={mixColor(tint, C.dark, 0.15)} />
          </g>,
        );
      });
      out.push(<ellipse key="pm" cx={f1(pc.x)} cy={f1(pc.y)} rx={f1(seg.palm * L * 0.5 * scale)} ry={f1(seg.palm * L * 0.38 * scale)} fill={tint} stroke={outlineCol} strokeWidth={0.003 * L} opacity={op} />);
      return out;
    };
    if (!regen) {
      els.push(<g key="l">{seg2(PE, PW, wL)}</g>);
      els.push(<g key="h">{hand(1, [1, 1, 1, 1, 1], 0, C.digit)}</g>);
      if (id === 'LF') {
        lfTip = wrist;
        lfElbow = elbow;
      }
    } else {
      // ---------------- REGENERACIÓN (r continuo 0–6), siempre a lo largo del mismo antebrazo
      const r = regen.r;
      const sz = regen.size;
      const dir = norm(sub(wrist, elbow));
      const stump = add(elbow, scl(dir, l2 * 0.42));
      const PS = P(stump);
      const newTint = mixColor(C.body, '#fff1ee', clamp(1 - (r - 4) / 2) * 0.55);
      if (r < 6) els.push(<g key="st">{seg2(PE, PS, wL)}</g>);
      // STAGE_1: epitelio de la herida (casquete translúcido)
      const cap = smoothstep(0, 1, r);
      // STAGE_2–3: blastema (yema cónica que se alarga)
      const bud = smoothstep(1, 2, r) * 0.28 + smoothstep(2, 3, r) * 0.42 + smoothstep(3, 4, r) * 0.3;
      const fullLen = l2 * 0.58;
      const tipLen = fullLen * bud * (r < 5 ? 1 : 1) * (r >= 3 ? lerp(1, sz, smoothstep(3, 6, r)) : 1);
      const tip = add(stump, scl(dir, tipLen));
      const PT = P(tip);
      if (r < 6 && cap < 1) {
        // borde del muñón: tejido rosado, sin sangre (no gráfico)
        els.push(<circle key="sb" cx={f1(PS.x)} cy={f1(PS.y)} r={f1(wL * 1.05)} fill={mixColor(C.body, '#e88f8f', 0.45)} />);
      }
      if (r >= 3.6) {
        // antebrazo y muñeca organizados (STAGE_4+): el segmento nuevo se integra
        const k4 = smoothstep(3.6, 4.6, r);
        els.push(<g key="nf" opacity={k4}>{seg2(PS, PT, wL * lerp(0.85, 1, smoothstep(5, 6, r)), newTint)}</g>);
      }
      if (bud > 0.005 && r < 4.6) {
        // yema del blastema: cono redondeado
        const dx = PT.x - PS.x;
        const dy = PT.y - PS.y;
        const ll = Math.hypot(dx, dy) || 1;
        const nx = -dy / ll;
        const ny = dx / ll;
        const wb = wL * 1.05;
        const d = `M${f1(PS.x + nx * wb)},${f1(PS.y + ny * wb)} Q${f1(PT.x + nx * wb * 0.9)},${f1(PT.y + ny * wb * 0.9)} ${f1(PT.x + dx / ll * wb * 0.6)},${f1(PT.y + dy / ll * wb * 0.6)} Q${f1(PT.x - nx * wb * 0.9)},${f1(PT.y - ny * wb * 0.9)} ${f1(PS.x - nx * wb)},${f1(PS.y - ny * wb)}Z`;
        els.push(<path key="bd" d={d} fill="#fbe6e2" stroke={mixColor(C.dark, '#ffffff', 0.2)} strokeWidth={0.003 * L} opacity={1 - smoothstep(4.2, 4.6, r)} />);
      }
      if (cap > 0.01 && r < 2.2) {
        els.push(<circle key="cap" cx={f1(PS.x)} cy={f1(PS.y)} r={f1(wL * 1.18)} fill="#ffffff" opacity={0.45 * cap * (1 - smoothstep(1.6, 2.2, r))} stroke="#ffffff" strokeWidth={0.002 * L} />);
      }
      if (r >= 3) {
        // mano: primero una paleta (STAGE_4), luego los dedos en orden (2, 1, 3, 4)
        const paddle = smoothstep(3, 4, r) * (1 - smoothstep(5, 6, r));
        const order = [1, 0, 2, 3];
        const dk = [0, 0, 0, 0];
        order.forEach((di, pos) => (dk[di] = smoothstep(4 + pos * 0.22, 4.55 + pos * 0.22, r)));
        const wristNew = tip;
        const saved = wrist;
        wrist = wristNew;
        els.push(<g key="nh">{hand(lerp(0.55, sz, smoothstep(4, 6, r)), dk, paddle, newTint, smoothstep(3, 3.5, r))}</g>);
        wrist = saved;
      }
      lfTip = tip;
      lfElbow = elbow;
    }
    // resaltado científico de la extremidad LF
    if (id === 'LF' && pose.highlight > 0.01) {
      const tipP = lfTip ? P(lfTip) : PW;
      els.push(<path key="hlt" d={`M${f1(P0.x)},${f1(P0.y)}L${f1(PE.x)},${f1(PE.y)}L${f1(tipP.x)},${f1(tipP.y)}`} stroke="#7ff3ff" strokeWidth={0.03 * L} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.25 * pose.highlight} />);
    }
    const near = sideZ(b.sg) > 0.12;
    push(rootZ + (near ? 1 : -1) + (b.fore ? 0.1 : 0) + (regen && near ? 2.5 : 0), `limb${id}`, <>{els}</>);
  });
  return {items, spine: sp, lfTip, lfElbow};
}
