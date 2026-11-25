// CONSTRUCCIÓN DE VOLÚMENES: del esqueleto 3D a listas de elipsoides proyectados por componente
// (PumaTorso + PumaNeck + PumaShoulders + PumaHips, cuatro patas, PumaPaws, PumaTail, PumaHead, PumaJaw).
// Cada componente devuelve elipses de pantalla y "parches" de superficie para el pelaje (PumaFur).
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {Frame, LegId, LEGS, Skeleton} from './rig';
import {add3, ellipsoid, Ell, facing, mul3, norm3, proj, sub3, v3, V3, View, camDir} from './space';

export type Section = {c: V3; f: V3; u: V3; l: V3; h: number; w: number; ds: number}; // c = centro de la sección
export type Part = {id: string; kind: 'body' | 'leg' | 'tail' | 'head' | 'paw'; ells: Ell[]; secs: Section[]; d: number; far: number; extra?: Ell[]};

const cr = (a: number, b: number, c: number, d: number, t: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
/** Cadena Catmull-Rom 3D con datos por nodo. */
class Chain {
  pts: V3[]; data: number[][]; ups: V3[]; acc: number[]; len: number;
  constructor(pts: V3[], ups: V3[], data: number[][]) {
    this.pts = pts; this.ups = ups; this.data = data; this.acc = [0];
    for (let i = 1; i < pts.length; i++) this.acc.push(this.acc[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y, pts[i].z - pts[i - 1].z) + 1e-6);
    this.len = this.acc[this.acc.length - 1];
  }
  seg(u: number) {
    const s = clamp(u) * this.len;
    let i = 0;
    while (i < this.pts.length - 2 && s > this.acc[i + 1]) i++;
    return {i, t: clamp((s - this.acc[i]) / (this.acc[i + 1] - this.acc[i]))};
  }
  at(u: number) {
    const {i, t} = this.seg(u);
    const n = this.pts.length;
    const P = (k: number) => this.pts[Math.max(0, Math.min(n - 1, k))];
    const D = (k: number) => this.data[Math.max(0, Math.min(n - 1, k))];
    const a = P(i - 1), b = P(i), c = P(i + 1), d = P(i + 2);
    const p = v3(cr(a.x, b.x, c.x, d.x, t), cr(a.y, b.y, c.y, d.y, t), cr(a.z, b.z, c.z, d.z, t));
    const da = D(i - 1), db = D(i), dc = D(i + 1), dd = D(i + 2);
    const data = db.map((_, k) => cr(da[k], db[k], dc[k], dd[k], t));
    const up = norm3(add3(mul3(this.ups[i], 1 - t), mul3(this.ups[Math.min(n - 1, i + 1)], t)));
    return {p, data, up};
  }
}
function frames(ch: Chain, n: number, lateralHint?: (u: number) => V3, win = 0.004) {
  const out: {p: V3; f: V3; u: V3; l: V3; data: number[]; s: number}[] = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    const a = ch.at(s);
    // tangente promediada en una ventana: en las curvas cerradas (cruz → cuello) las secciones no se abren en abanico
    const b = ch.at(Math.min(1, s + win));
    const z = ch.at(Math.max(0, s - win));
    let f = norm3(sub3(b.p, z.p));
    if (!Number.isFinite(f.x)) f = v3(1, 0, 0);
    let l = lateralHint ? lateralHint(s) : norm3(cross(f, a.up));
    l = norm3(sub3(l, mul3(f, l.x * f.x + l.y * f.y + l.z * f.z)));
    const u = norm3(cross(l, f));
    out.push({p: a.p, f, u, l, data: a.data, s});
  }
  return out;
}
const cross = (a: V3, b: V3): V3 => v3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);

// ------------------------------------------------------------------ TRONCO + CUELLO (malla continua)
/** Perfiles [arriba, abajo, semiancho] relativos al eje de la columna (adulto, metros). */
const SPINE_PROF: Record<number, number[]> = {
  0: [0.105, -0.165, 0.118], 2: [0.1, -0.175, 0.122], 5: [0.072, -0.195, 0.116], 8: [0.05, -0.29, 0.138], 10: [0.032, -0.325, 0.142], 12: [0.014, -0.335, 0.136],
};
const NECK_PROF = [[0.012, -0.31, 0.12], [0.018, -0.25, 0.108], [0.022, -0.19, 0.098], [0.025, -0.145, 0.09], [0.026, -0.11, 0.084], [0.024, -0.088, 0.078]];

export function bodyPart(sk: Skeleton, w: View, N: number): Part {
  const sp = sk.sp;
  const g = sp.girth;
  const pts: V3[] = [];
  const ups: V3[] = [];
  const data: number[][] = [];
  const pel = sk.spine[0];
  const br = sk.pose.breathe;
  pts.push(add3(pel.p, add3(mul3(pel.f, -0.135 * g), mul3(pel.u, 0.03 * g))));
  ups.push(pel.u);
  data.push([0.03 * g, -0.03 * g, 0.03 * g]);
  pts.push(add3(pel.p, add3(mul3(pel.f, -0.085 * g), mul3(pel.u, 0.02 * g))));
  ups.push(pel.u);
  data.push([0.075 * g, -0.1 * g, 0.085 * g]);
  for (const k of [0, 2, 5, 8, 10, 12]) {
    const fr = sk.spine[k];
    const pr = SPINE_PROF[k];
    const rib = k >= 8 ? 1 + 0.03 * (br - 0.5) * 2 : 1;
    pts.push(fr.p);
    ups.push(fr.u);
    data.push([pr[0] * g, pr[1] * g * rib, pr[2] * g * rib]);
  }
  for (let i = 1; i <= 6; i++) {
    const fr = sk.neck[i];
    const s = lerp(g, sp.head, i / 6);
    const pr = NECK_PROF[i - 1];
    pts.push(fr.p);
    ups.push(fr.u);
    data.push([pr[0] * s, pr[1] * s, pr[2] * s]);
  }
  const ch = new Chain(pts, ups, data);
  const fr = frames(ch, N, undefined, 0.07);
  const secs: Section[] = [];
  const ells: Ell[] = [];
  const ds = ch.len / N;
  for (const q of fr) {
    const [top, bot, wd] = q.data;
    const c = add3(q.p, mul3(q.u, (top + bot) / 2));
    const h = Math.max(0.004, (top - bot) / 2);
    secs.push({c, f: q.f, u: q.u, l: q.l, h, w: Math.max(0.004, wd), ds});
    ells.push(ellipsoid(c, mul3(q.f, ds * 1.4 + 0.004 * g), mul3(q.u, h), mul3(q.l, Math.max(0.004, wd)), w));
  }
  // grupa redondeada y pecho: casquetes
  const extra: Ell[] = [];
  // omóplatos y caderas bajo la piel: masas musculares que se mueven con las patas
  for (const s of ['R', 'L'] as const) {
    const sc = sk.scap[s];
    const mid = lerp3(sc.top, sc.joint, 0.45);
    const along = norm3(sub3(sc.joint, sc.top));
    const lat = mul3(sk.spine[11].l, s === 'R' ? 1 : -1);
    extra.push(ellipsoid(add3(mid, mul3(lat, 0.035 * g)), mul3(along, 0.11 * g), mul3(sk.spine[11].f, 0.06 * g), mul3(lat, 0.05 * g), w));
    const hip = sk.legs[s === 'R' ? 'RH' : 'LH'][0];
    const knee = sk.legs[s === 'R' ? 'RH' : 'LH'][1];
    const hm = lerp3(hip, knee, 0.2);
    const hl = mul3(pel.l, s === 'R' ? 1 : -1);
    extra.push(ellipsoid(add3(hm, mul3(hl, 0.02 * g)), mul3(norm3(sub3(knee, hip)), 0.12 * g), mul3(pel.f, 0.1 * g), mul3(hl, 0.06 * g), w));
  }
  const d = ells.reduce((a, e) => a + e.d, 0) / ells.length;
  return {id: "body", kind: "body", ells: [...ells, ...extra], secs, d, far: 0};
}
const lerp3 = (a: V3, b: V3, t: number) => v3(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);

// ------------------------------------------------------------------ PATAS
export function legPart(sk: Skeleton, id: LegId, w: View, N: number): Part {
  const sp = sk.sp;
  const k = sp.legR;
  const J = sk.legs[id];
  const L = (a: V3, b: V3, t: number) => lerp3(a, b, t);
  const up = v3(0, 1, 0);
  type Nd = {p: V3; rf: number; rl: number};
  let nodes: Nd[];
  if (id[1] === 'H') {
    const [hip, knee, hock, heel] = J;
    nodes = [
      {p: add3(hip, mul3(up, 0.05 * k)), rf: 0.0360 * k, rl: 0.0300 * k},
      {p: add3(hip, mul3(up, 0.015 * k)), rf: 0.1200 * k, rl: 0.0744 * k},
      {p: L(hip, knee, 0.4), rf: 0.1296 * k, rl: 0.0792 * k},
      {p: L(hip, knee, 0.8), rf: 0.0888 * k, rl: 0.0600 * k},
      {p: knee, rf: 0.0648 * k, rl: 0.0480 * k},
      {p: L(knee, hock, 0.3), rf: 0.0648 * k, rl: 0.0444 * k},
      {p: L(knee, hock, 0.72), rf: 0.0408 * k, rl: 0.0324 * k},
      {p: hock, rf: 0.0360 * k, rl: 0.0300 * k},
      {p: L(hock, heel, 0.5), rf: 0.0300 * k, rl: 0.0288 * k},
      {p: heel, rf: 0.0312 * k, rl: 0.0312 * k},
    ];
  } else {
    const [top, sh, elbow, wrist, heel] = J;
    nodes = [
      {p: add3(top, mul3(up, 0.0)), rf: 0.0240 * k, rl: 0.0180 * k},
      {p: L(top, sh, 0.4), rf: 0.0660 * k, rl: 0.0360 * k},
      {p: L(top, sh, 0.85), rf: 0.0936 * k, rl: 0.0552 * k},
      {p: L(sh, elbow, 0.45), rf: 0.0840 * k, rl: 0.0576 * k},
      {p: elbow, rf: 0.0672 * k, rl: 0.0516 * k},
      {p: L(elbow, wrist, 0.3), rf: 0.0600 * k, rl: 0.0480 * k},
      {p: L(elbow, wrist, 0.8), rf: 0.0432 * k, rl: 0.0384 * k},
      {p: wrist, rf: 0.0408 * k, rl: 0.0384 * k},
      {p: heel, rf: 0.0396 * k, rl: 0.0384 * k},
    ];
  }
  const ch = new Chain(nodes.map((n) => n.p), nodes.map(() => up), nodes.map((n) => [n.rf, n.rl]));
  const lat = v3(0, 0, 1);
  const fr = frames(ch, N, () => lat);
  const ds = ch.len / N;
  const secs: Section[] = [];
  const ells: Ell[] = [];
  for (const q of fr) {
    const [rf, rl] = q.data;
    secs.push({c: q.p, f: q.f, u: q.u, l: q.l, h: rf, w: rl, ds});
    // u = perpendicular en el plano sagital (delante/detrás), l = lateral
    ells.push(ellipsoid(q.p, mul3(q.f, ds * 1.3), mul3(q.u, rf), mul3(q.l, rl), w));
  }
  const d = proj(lerp3(J[0], J[1], 0.5), w).d;
  return {id, kind: 'leg', ells, secs, d, far: 0};
}
/** Pie o mano: almohadilla plantar + 4 dedos, orientado por el talón y la punta. */
export function pawPart(sk: Skeleton, id: LegId, w: View): Part {
  const sp = sk.sp;
  const k = sp.legR;
  const J = sk.legs[id];
  const heel = J[J.length - 2];
  const toe = J[J.length - 1];
  const front = id[1] === 'F';
  let fx = sub3(toe, heel);
  fx.y = 0;
  fx = len(fx) < 1e-6 ? v3(1, 0, 0) : norm3(fx);
  const pitch = -sk.pose.legs[id].pawPitch * 0.75;
  const fwd = norm3(v3(fx.x * Math.cos(pitch), Math.sin(pitch), fx.z * Math.cos(pitch)));
  const lat = norm3(cross(fwd, v3(0, 1, 0)));
  const upv = norm3(cross(lat, fwd));
  const Lp = (front ? sp.paw * 0.95 : sp.paw * 1.05);
  const W = (front ? 0.095 : 0.084) * k;
  const H = (front ? 0.04 : 0.038) * k;
  const base = add3(heel, mul3(upv, -0.012 * k));
  const ells: Ell[] = [];
  const secs: Section[] = [];
  const pad = add3(add3(base, mul3(fwd, Lp * 0.35)), mul3(upv, H * 0.5));
  ells.push(ellipsoid(pad, mul3(fwd, Lp * 0.55), mul3(upv, H * 0.55), mul3(lat, W * 0.48), w));
  secs.push({c: pad, f: fwd, u: upv, l: lat, h: H * 0.55, w: W * 0.48, ds: Lp * 0.5});
  for (let i = 0; i < 4; i++) {
    const zz = (i - 1.5) * W * 0.24;
    const tc = add3(add3(add3(base, mul3(fwd, Lp * (0.78 + (i === 0 || i === 3 ? -0.05 : 0)))), mul3(lat, zz)), mul3(upv, H * 0.38));
    ells.push(ellipsoid(tc, mul3(fwd, Lp * 0.2), mul3(upv, H * 0.38), mul3(lat, W * 0.13), w));
  }
  return {id: 'paw' + id, kind: 'paw', ells, secs, d: proj(pad, w).d, far: 0};
}
const len = (a: V3) => Math.hypot(a.x, a.y, a.z);

// ------------------------------------------------------------------ COLA
export function tailPart(sk: Skeleton, w: View, N: number): Part {
  const sp = sk.sp;
  const pts = sk.tail.map((f) => f.p);
  const ch = new Chain(pts, sk.tail.map((f) => f.u), pts.map((_, i) => [i / (pts.length - 1)]));
  const fr = frames(ch, N);
  const ds = ch.len / N;
  const secs: Section[] = [];
  const ells: Ell[] = [];
  for (const q of fr) {
    const u = q.s;
    let r = sp.tailR * lerp(1.15, 0.8, u) * (1 + (0.3 * Math.max(0, 0.12 - u)) / 0.12);
    r *= Math.pow(Math.sin(Math.min(1, (1 - u) / 0.05) * Math.PI * 0.5), 0.6);
    r = Math.max(r, 0.002);
    secs.push({c: q.p, f: q.f, u: q.u, l: q.l, h: r, w: r, ds});
    ells.push(ellipsoid(q.p, mul3(q.f, ds * 1.3), mul3(q.u, r), mul3(q.l, r), w));
  }
  const d = ells.reduce((a, e) => a + e.d, 0) / ells.length;
  return {id: 'tail', kind: 'tail', ells, secs, d, far: 0};
}

// ------------------------------------------------------------------ CABEZA
export type HeadGeo = {
  F: Frame; // marco de la cabeza
  P: (x: number, y: number, z: number) => V3; // local (adulto) → animal
  D: (x: number, y: number, z: number) => V3; // dirección local → animal
  JP: (x: number, y: number, z: number) => V3; // local de la mandíbula
  ells: Ell[]; // cráneo, mejillas, puente nasal
  cream: Ell[]; // almohadillas del hocico y barbilla (blancas)
  facingF: number;
};
export function headGeo(sk: Skeleton, w: View): HeadGeo {
  const sp = sk.sp;
  const F = sk.head;
  const s = sp.head;
  const mz = sp.muzzle;
  const X = (x: number) => (x <= 0.09 ? x : 0.09 + (x - 0.09) * mz);
  const P = (x: number, y: number, z: number) => add3(F.p, add3(add3(mul3(F.f, X(x) * s), mul3(F.u, y * s)), mul3(F.l, z * s)));
  const D = (x: number, y: number, z: number) => norm3(add3(add3(mul3(F.f, x), mul3(F.u, y)), mul3(F.l, z)));
  // mandíbula: gira hacia abajo alrededor del pivote (0,03; −0,038)
  const ja = -clamp(sk.pose.jaw) * 0.5;
  const jf = add3(mul3(F.f, Math.cos(ja)), mul3(F.u, Math.sin(ja)));
  const ju = add3(mul3(F.u, Math.cos(ja)), mul3(F.f, -Math.sin(ja)));
  const piv = P(0.03, -0.038, 0);
  const JP = (x: number, y: number, z: number) => add3(piv, add3(add3(mul3(jf, X(x + 0.03) * s - 0.03 * s), mul3(ju, y * s)), mul3(F.l, z * s)));
  const E = (cx: number, cy: number, cz: number, ax: number, ay: number, az: number) => ellipsoid(P(cx, cy, cz), mul3(F.f, ax * s * (cx > 0.1 ? mz : 1)), mul3(F.u, ay * s), mul3(F.l, az * s), w);
  const ells: Ell[] = [
    E(-0.005, 0.0, 0, 0.055, 0.06, 0.066),
    E(0.045, 0.018, 0, 0.068, 0.066, 0.078),
    E(0.095, 0.028, 0, 0.05, 0.046, 0.062),
    E(0.06, -0.022, 0.044, 0.05, 0.045, 0.034),
    E(0.06, -0.022, -0.044, 0.05, 0.045, 0.034),
    E(0.148, 0.004, 0, 0.046, 0.036, 0.04),
  ];
  const JE = (cx: number, cy: number, cz: number, ax: number, ay: number, az: number) => ellipsoid(JP(cx, cy, cz), mul3(jf, ax * s * mz), mul3(ju, ay * s), mul3(F.l, az * s), w);
  const cream: Ell[] = [
    JE(0.085, -0.008, 0, 0.06, 0.017, 0.032),
    JE(0.122, -0.012, 0, 0.022, 0.016, 0.02),
    E(0.168, -0.018, 0.021, 0.026, 0.023, 0.025),
    E(0.168, -0.018, -0.021, 0.026, 0.023, 0.025),
  ];
  return {F, P, D, JP, ells, cream, facingF: facing(F.f, w)};
}

export const visible = (n: V3, w: View) => smoothstep(-0.05, 0.25, camDir(n, w).z);
export const _keep = {LEGS};
