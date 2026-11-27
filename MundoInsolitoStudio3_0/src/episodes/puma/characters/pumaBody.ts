// CUERPO DEL PUMA: geometría procedural sobre el esqueleto resuelto (rig.ts).
//  · Tronco + cuello: UNA malla continua (loft) desde la grupa hasta la nuca, con secciones anatómicas
//    (grupa, lomo, cintura, costillas, pecho, quilla del esternón, cuello musculoso). Los omóplatos deforman la piel.
//  · Patas: tubos anatómicos sobre las articulaciones (muslo potente, rodilla, gemelo, corvejón; hombro, tríceps,
//    olécranon, antebrazo, muñeca) que se funden con el tronco.
//  · Patas (manos/pies): almohadilla plantar trilobulada, 4 dedos con surcos, pelo entre almohadillas.
//  · Cola: tubo largo, grueso hasta la punta, punta oscura.
//  · Cabeza (estática por edad): cráneo redondeado, hocico corto, almohadillas de los bigotes, mandíbula articulada.
import * as THREE from 'three';
import {clamp, fbm2, hash, lerp, smooth} from '../../../lib/noise';
import {Chain, gridGeometry, openGrid, segDist, spow, v3, V3} from '../anatomy/mesh';
import {hex, mixc, paintFur, RGB} from '../anatomy/npr';
import {LegId, Skeleton} from '../anatomy/rig';

// ------------------------------------------------------------------ TRONCO + CUELLO
/** Perfiles por nodo: [arriba, abajo, ancho, cintura(0..1 altura del máximo ancho), exponente]. Adulto, metros. */
const SPINE_PROF: Record<number, number[]> = {
  0: [0.105, -0.165, 0.118, 0.55, 2.3],
  2: [0.1, -0.175, 0.122, 0.52, 2.3],
  5: [0.072, -0.195, 0.116, 0.5, 2.2],
  8: [0.05, -0.29, 0.138, 0.5, 2.25],
  10: [0.032, -0.325, 0.142, 0.5, 2.3],
  12: [0.014, -0.335, 0.136, 0.5, 2.35],
};
const NECK_PROF = [
  [0.01, -0.33, 0.122, 0.5, 2.3],
  [0.02, -0.27, 0.108, 0.5, 2.3],
  [0.026, -0.205, 0.098, 0.5, 2.2],
  [0.032, -0.16, 0.09, 0.5, 2.2],
  [0.03, -0.125, 0.083, 0.5, 2.2],
  [0.022, -0.1, 0.076, 0.5, 2.2],
];

export function torsoChain(sk: Skeleton, breathe: number) {
  const sp = sk.sp;
  const g = sp.girth;
  const pts: V3[] = [];
  const ups: V3[] = [];
  const data: number[][] = [];
  const pel = sk.pelvis;
  const upOf = (q: THREE.Quaternion) => v3(0, 1, 0).applyQuaternion(q);
  // cierre de la grupa (detrás de la pelvis, donde nace la cola)
  pts.push(pel.p.clone().add(v3(-0.135 * g, 0.035 * g, 0).applyQuaternion(pel.q)));
  ups.push(upOf(pel.q));
  data.push([0.012 * g, -0.012 * g, 0.012 * g, 0.5, 2]);
  pts.push(pel.p.clone().add(v3(-0.09 * g, 0.03 * g, 0).applyQuaternion(pel.q)));
  ups.push(upOf(pel.q));
  data.push([0.07 * g, -0.085 * g, 0.072 * g, 0.55, 2.2]);
  const keys = [0, 2, 5, 8, 10, 12];
  for (const k of keys) {
    const f = sk.spine[k];
    pts.push(f.p.clone());
    ups.push(upOf(f.q));
    const pr = SPINE_PROF[k].slice();
    const rib = k >= 8 ? 1 + 0.035 * breathe : 1;
    data.push([pr[0] * g, pr[1] * g * (k >= 8 ? 1 + 0.02 * breathe : 1), pr[2] * g * rib, pr[3], pr[4]]);
  }
  // cuello: grosor que pasa de la escala del cuerpo a la de la cabeza
  for (let i = 1; i <= 6; i++) {
    const f = sk.neck[i];
    pts.push(f.p.clone());
    ups.push(upOf(f.q));
    const u = i / 6;
    const s = lerp(g, sp.head, u);
    const pr = NECK_PROF[i - 1];
    data.push([pr[0] * s, pr[1] * s, pr[2] * s, pr[3], pr[4]]);
  }
  // remate dentro de la cabeza
  const h = sk.head;
  pts.push(h.p.clone().add(v3(0.03 * sp.head, -0.01 * sp.head, 0).applyQuaternion(h.q)));
  ups.push(upOf(h.q));
  data.push([0.03 * sp.head, -0.055 * sp.head, 0.055 * sp.head, 0.5, 2.2]);
  pts.push(h.p.clone().add(v3(0.06 * sp.head, -0.01 * sp.head, 0).applyQuaternion(h.q)));
  ups.push(upOf(h.q));
  data.push([0.004 * sp.head, -0.006 * sp.head, 0.006 * sp.head, 0.5, 2]);
  return new Chain(pts, ups, data);
}

export function buildTorso(sk: Skeleton, breathe: number, reuse?: THREE.BufferGeometry) {
  const ch = torsoChain(sk, breathe);
  const g = sk.sp.girth;
  const C = v3();
  const T = v3();
  const U = v3();
  const S = v3();
  const scap = sk.scapula;
  return gridGeometry(150, 56, (u, v, o) => {
    ch.point(u, C);
    ch.tangent(u, T);
    ch.up(u, U);
    S.crossVectors(T, U).normalize();
    U.crossVectors(S, T).normalize();
    const [top, bot, w, belt, n] = ch.prof(u);
    const phi = v * Math.PI * 2;
    const c = Math.cos(phi);
    const s = Math.sin(phi);
    const e = 2 / n;
    const mid = bot + (top - bot) * belt;
    const Y = mid + (c >= 0 ? top - mid : mid - bot) * spow(c, e);
    const Z = w * spow(s, e);
    o.copy(C).addScaledVector(U, Y).addScaledVector(S, Z);
    // omóplatos bajo la piel: abultamiento suave a lo largo del hueso (se mueve con la mano)
    for (const k of ['L', 'R'] as const) {
      const d = segDist(o, scap[k].top, scap[k].joint);
      const R = 0.075 * g;
      if (d < R) {
        const side = k === 'L' ? 1 : -1;
        if (Math.sign(Z) === side || Math.abs(Z) < 1e-6) o.addScaledVector(S, side * 0.012 * g * (1 - d / R) ** 2);
      }
    }
  }, reuse);
}

// ------------------------------------------------------------------ PATAS (tubos anatómicos)
type Node = {p: V3; rf: number; rl: number; back?: number};
function legNodes(sk: Skeleton, id: LegId): Node[] {
  const sp = sk.sp;
  const k = sp.legR;
  const J = sk.legs[id];
  const L = (a: V3, b: V3, t: number) => a.clone().lerp(b, t);
  if (id[1] === 'H') {
    const [hip, knee, hock, heel] = J;
    const up = v3(0, 1, 0);
    return [
      {p: hip.clone().addScaledVector(up, 0.05 * k), rf: 0.02 * k, rl: 0.015 * k},
      {p: hip.clone().addScaledVector(up, 0.02 * k), rf: 0.1 * k, rl: 0.062 * k},
      {p: L(hip, knee, 0.4), rf: 0.108 * k, rl: 0.066 * k, back: 0.01 * k},
      {p: L(hip, knee, 0.8), rf: 0.074 * k, rl: 0.05 * k},
      {p: knee, rf: 0.054 * k, rl: 0.04 * k},
      {p: L(knee, hock, 0.3), rf: 0.056 * k, rl: 0.037 * k, back: 0.016 * k},
      {p: L(knee, hock, 0.72), rf: 0.036 * k, rl: 0.027 * k, back: 0.008 * k},
      {p: hock, rf: 0.031 * k, rl: 0.025 * k, back: 0.01 * k},
      {p: L(hock, heel, 0.5), rf: 0.026 * k, rl: 0.024 * k},
      {p: heel, rf: 0.028 * k, rl: 0.027 * k},
      {p: heel.clone().add(v3(0, -0.006 * k, 0)), rf: 0.008 * k, rl: 0.008 * k},
    ];
  }
  const [top, sh, elbow, wrist, heel] = J;
  return [
    {p: top.clone().add(v3(0, 0.01 * k, 0)), rf: 0.012 * k, rl: 0.008 * k},
    {p: L(top, sh, 0.35), rf: 0.05 * k, rl: 0.024 * k},
    {p: L(top, sh, 0.8), rf: 0.078 * k, rl: 0.046 * k},
    {p: L(sh, elbow, 0.4), rf: 0.076 * k, rl: 0.05 * k, back: 0.01 * k},
    {p: elbow, rf: 0.058 * k, rl: 0.043 * k, back: 0.014 * k},
    {p: L(elbow, wrist, 0.3), rf: 0.052 * k, rl: 0.04 * k},
    {p: L(elbow, wrist, 0.8), rf: 0.037 * k, rl: 0.032 * k},
    {p: wrist, rf: 0.035 * k, rl: 0.032 * k},
    {p: heel, rf: 0.034 * k, rl: 0.033 * k},
    {p: heel.clone().add(v3(0, -0.006 * k, 0)), rf: 0.008 * k, rl: 0.008 * k},
  ];
}

export function buildLeg(sk: Skeleton, id: LegId, heading: number, reuse?: THREE.BufferGeometry) {
  const nodes = legNodes(sk, id);
  const ch = new Chain(nodes.map((n) => n.p), nodes.map(() => v3(0, 1, 0)), nodes.map((n) => [n.rf, n.rl, n.back ?? 0]));
  const fwd = v3(Math.cos(heading), 0, -Math.sin(heading));
  const outer = id[0] === 'L' ? 1 : -1;
  const C = v3();
  const T = v3();
  const F = v3();
  const Lt = v3();
  return gridGeometry(64, 24, (u, v, o) => {
    ch.point(u, C);
    ch.tangent(u, T);
    F.copy(fwd).addScaledVector(T, -fwd.dot(T)).normalize();
    Lt.crossVectors(T, F).normalize().multiplyScalar(outer); // lado exterior
    const [rf, rl, back] = ch.prof(u);
    const phi = v * Math.PI * 2; // 0 = delante, π/2 = exterior
    const cap = Math.sin(Math.min(1, u / 0.04) * Math.PI * 0.5) * Math.sin(Math.min(1, (1 - u) / 0.03) * Math.PI * 0.5);
    const c = Math.cos(phi);
    const s = Math.sin(phi);
    const bb = c < 0 ? back * -c : 0; // masa muscular detrás (gemelo, tríceps, olécranon)
    o.copy(C)
      .addScaledVector(F, (rf * c - bb) * Math.max(0.02, cap))
      .addScaledVector(Lt, rl * s * Math.max(0.02, cap) * outer * outer);
  }, reuse);
}

// ------------------------------------------------------------------ PIE / MANO (geometría local; suela en y = 0)
/** x de −0,25·L (talón) a L (punta de los dedos); z lateral; 4 dedos con surcos; almohadilla plantar. */
export function buildPaw(len: number, width: number, height: number, front: boolean) {
  const L = len;
  return gridGeometry(36, 28, (u, v, o) => {
    const x = lerp(-0.25 * L, L, u);
    const phi = v * Math.PI * 2;
    const c = Math.cos(phi);
    const s = Math.sin(phi);
    const env = Math.sin(clamp(u) * Math.PI) ** 0.42;
    const toeZone = smooth(0.5, 0.75, u);
    const w = width * 0.5 * env * (front ? 1 : 0.92) * (1 + 0.08 * toeZone);
    let h = height * (lerp(0.95, 0.62, smooth(0.2, 1, u)) * env);
    // surcos entre dedos (arriba) y lóbulos de los dedos en el borde delantero
    const z = w * spow(s, 2 / 2.4);
    const lobes = Math.cos((z / Math.max(1e-6, w)) * Math.PI * 2) * 0.5 + 0.5; // 4 lóbulos ≈ máximos en ±0,25 y ±0,75
    h *= 1 - toeZone * (1 - lobes) * 0.32;
    const sole = 0.002;
    const Y = c >= 0 ? sole + h * spow(c, 2 / 2.6) : sole + height * 0.05 * spow(c, 2 / 7);
    const xFront = x + (u > 0.85 ? (lobes - 0.5) * L * 0.06 * smooth(0.85, 1, u) : 0);
    o.set(xFront, Math.max(0, Y), z);
  });
}

// ------------------------------------------------------------------ COLA
export function buildTail(sk: Skeleton, reuse?: THREE.BufferGeometry) {
  const sp = sk.sp;
  const pts = sk.tail.map((f) => f.p);
  const ups = sk.tail.map((f) => v3(0, 1, 0).applyQuaternion(f.q));
  const ch = new Chain(pts, ups, pts.map((_, i) => [i / (pts.length - 1)]));
  const C = v3();
  const T = v3();
  const U = v3();
  const S = v3();
  return gridGeometry(72, 16, (u, v, o) => {
    ch.point(u, C);
    ch.tangent(u, T);
    ch.up(u, U);
    S.crossVectors(T, U).normalize();
    U.crossVectors(S, T).normalize();
    // grosor casi uniforme (la cola del puma es gruesa hasta la punta) con punta redondeada
    let r = sp.tailR * lerp(1.15, 0.78, u) * (1 + 0.3 * Math.max(0, 0.12 - u) / 0.12);
    r *= Math.sin(Math.min(1, (1 - u) / 0.05) * Math.PI * 0.5) ** 0.6;
    if (u < 0.03) r *= 0.6 + 0.4 * (u / 0.03);
    const phi = v * Math.PI * 2;
    o.copy(C).addScaledVector(U, r * Math.cos(phi)).addScaledVector(S, r * Math.sin(phi));
  }, reuse);
}

// ------------------------------------------------------------------ CABEZA (local: origen en la nuca, x hacia el hocico)
/** [x, arriba, abajo, ancho] del adulto. */
const HEAD_KEYS = [
  [-0.045, 0.045, -0.054, 0.066],
  [-0.015, 0.07, -0.066, 0.08],
  [0.02, 0.085, -0.07, 0.089],
  [0.05, 0.088, -0.07, 0.095],
  [0.08, 0.082, -0.064, 0.09],
  [0.105, 0.07, -0.056, 0.078],
  [0.125, 0.056, -0.05, 0.064],
  [0.145, 0.044, -0.045, 0.052],
  [0.165, 0.035, -0.038, 0.042],
  [0.18, 0.028, -0.03, 0.032],
  [0.19, 0.02, -0.018, 0.02],
  [0.195, 0.008, -0.006, 0.008],
  [0.197, 0, 0, 0],
];
export const HEAD_X0 = -0.05;
export const HEAD_X1 = 0.197;
export type HeadShape = {hs: number; mz: number; dome: number};
/** Forma de la cabeza según la edad: el cachorro tiene hocico más corto y cráneo más abombado. */
export const headShape = (age: number): HeadShape => ({hs: 1, mz: lerp(0.72, 1, smooth(0.2, 1, age)), dome: lerp(1.12, 1, smooth(0.2, 1, age))});

function headProfile(x: number, H: HeadShape) {
  // x en coordenadas «adultas»: se interpolan las secciones
  const K = HEAD_KEYS;
  let i = 0;
  while (i < K.length - 2 && x > K[i + 1][0]) i++;
  const t = clamp((x - K[i][0]) / (K[i + 1][0] - K[i][0]));
  const e = t * t * (3 - 2 * t);
  const top = lerp(K[i][1], K[i + 1][1], e) * (x < 0.12 ? H.dome : 1);
  return {top, bot: lerp(K[i][2], K[i + 1][2], e), w: lerp(K[i][3], K[i + 1][3], e)};
}
/** Posición en la superficie de la cabeza (coordenadas locales, sin escala de especie) para x adulto y ángulo φ. */
export function headSurface(xa: number, phi: number, H: HeadShape, o = v3()) {
  const {top, bot, w} = headProfile(xa, H);
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  const muzzle = smooth(0.13, 0.17, xa);
  const nTop = lerp(2.2, 2.8, muzzle); // dorso del hocico más plano
  const nBot = 2.2;
  const mid = (top + bot) * 0.5 * 0.2;
  let Y = c >= 0 ? mid + (top - mid) * spow(c, 2 / nTop) : mid + (mid - bot) * spow(c, 2 / nBot);
  let Z = w * spow(s, 2 / lerp(2.2, 2.6, muzzle));
  // almohadillas de los bigotes: abultamiento lateral-inferior del hocico
  const pad = Math.exp(-(((xa - 0.16) / 0.02) ** 2)) * Math.exp(-(((Math.abs(phi > Math.PI ? phi - 2 * Math.PI : phi) - 1.75) / 0.45) ** 2));
  const wk = clamp(w / 0.03);
  Z += Math.sign(s) * pad * 0.009 * wk;
  Y -= pad * 0.003 * wk;
  // arco superciliar y mejillas
  const brow = Math.exp(-(((xa - 0.092) / 0.018) ** 2)) * Math.exp(-(((Math.abs(phi > Math.PI ? phi - 2 * Math.PI : phi) - 0.55) / 0.25) ** 2));
  Y += brow * 0.004;
  const cheek = Math.exp(-(((xa - 0.05) / 0.04) ** 2)) * Math.exp(-(((Math.abs(phi > Math.PI ? phi - 2 * Math.PI : phi) - 1.9) / 0.5) ** 2));
  Z += Math.sign(s) * cheek * 0.007 * wk;
  const x = xa <= 0.09 ? xa : 0.09 + (xa - 0.09) * H.mz;
  return o.set(x, Y, Z);
}
export function buildHead(H: HeadShape) {
  return gridGeometry(80, 56, (u, v, o) => headSurface(lerp(HEAD_X0, HEAD_X1, u), v * Math.PI * 2, H, o));
}
/** Mandíbula inferior (local de la mandíbula: pivote en el origen). */
export const JAW_PIVOT: [number, number, number] = [0.03, -0.038, 0];
export function buildJaw(H: HeadShape) {
  const K = [
    [0.0, 0.004, -0.022, 0.05],
    [0.05, 0.006, -0.032, 0.05],
    [0.09, 0.006, -0.032, 0.042],
    [0.118, 0.006, -0.028, 0.034],
    [0.136, 0.005, -0.02, 0.025],
    [0.143, 0.002, -0.007, 0.009],
    [0.145, 0, 0, 0],
  ];
  return gridGeometry(40, 28, (u, v, o) => {
    const xa = lerp(0, 0.145, u);
    let i = 0;
    while (i < K.length - 2 && xa > K[i + 1][0]) i++;
    const t = clamp((xa - K[i][0]) / (K[i + 1][0] - K[i][0]));
    const top = lerp(K[i][1], K[i + 1][1], t);
    const bot = lerp(K[i][2], K[i + 1][2], t);
    const w = lerp(K[i][3], K[i + 1][3], t);
    const phi = v * Math.PI * 2;
    const c = Math.cos(phi);
    const Y = c >= 0 ? top * spow(c, 2 / 3) : -bot * spow(c, 2 / 2.2);
    const x = xa + JAW_PIVOT[0] <= 0.09 ? xa : 0.09 - JAW_PIVOT[0] + (xa + JAW_PIVOT[0] - 0.09) * H.mz;
    o.set(x, Y - 0.006, w * spow(Math.sin(phi), 2 / 2.3));
  });
}
/** Oreja: concha redondeada (u: base → punta; v: −1 … 1). Cara anterior (interior) y posterior por separado. */
export function buildEar(back: boolean) {
  // cara anterior (cóncava, mira a +x) y cara posterior (convexa, desplazada hacia atrás): dos láminas
  return openGrid(14, 16, (u, v, o) => {
    const across = v * 2 - 1;
    const hw = 0.56 * Math.max(0, 1 - u * u) ** 0.36 + 0.02;
    const cup = (1 - across * across) * 0.24 * (1 - u * 0.6);
    o.set(-cup - (back ? 0.05 * (1 - u * 0.7) : 0) - u * u * 0.06, u * 0.82, across * hw);
  }, back);
}

// ------------------------------------------------------------------ TEXTURAS DE PELAJE (por edad)
const C = {
  dorsal: hex('#77583c'),
  flank: hex('#9b7a57'),
  low: hex('#bf9f7b'),
  belly: hex('#e2d6c2'),
  cream: hex('#f1ebe0'),
  dark: hex('#2e2016'),
  spot: hex('#47301f'),
  cubBase: hex('#b49673'),
  cubBelly: hex('#e6dccb'),
  grey: hex('#8b7a66'),
};
/** Manchas de cría: celdas de Worley sobre el cuerpo; intensidad 1 (recién nacido) → 0 (adulto). */
export const spotK = (age: number) => 1 - smooth(0.3, 0.85, age);
function worley(x: number, y: number, seed: number, periodY = 0) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  let best = 9;
  for (let a = -1; a <= 1; a++)
    for (let b = -1; b <= 1; b++) {
      let cy = yi + b;
      if (periodY > 0) cy = ((cy % periodY) + periodY) % periodY;
      const h1 = hash((xi + a) * 17.13 + cy * 91.7 + seed);
      const h2 = hash((xi + a) * 31.7 + cy * 11.3 + seed * 3.1);
      const px = xi + a + 0.15 + 0.7 * h1;
      const py = yi + b + 0.15 + 0.7 * h2;
      best = Math.min(best, Math.hypot(x - px, y - py));
    }
  return best;
}
const absPhi = (v: number) => {
  const p = v * Math.PI * 2;
  return Math.abs(p > Math.PI ? p - Math.PI * 2 : p);
};

const texCache = new Map<string, ReturnType<typeof paintFur>>();
function cached(key: string, f: () => ReturnType<typeof paintFur>) {
  const h = texCache.get(key);
  if (h) return h;
  const r = f();
  texCache.set(key, r);
  return r;
}
export const ageKey = (age: number) => Math.round(clamp(age) * 20) / 20;

/** Tronco: u a lo largo (0 grupa … 1 nuca), v alrededor (0 lomo, 0,5 vientre). */
export function torsoTexture(age: number) {
  const a = ageKey(age);
  const sk = spotK(a);
  return cached(`torso-${a}`, () =>
    paintFur(1024, 384, (u, v) => {
      const ap = absPhi(v);
      const base = mixc(C.cubBase, C.flank, smooth(0.2, 0.9, a));
      const dors = mixc(mixc(C.cubBase, C.grey, 0.3), C.dorsal, smooth(0.2, 0.9, a));
      let c = mixc(dors, base, smooth(0.25, 0.95, ap));
      c = mixc(c, C.low, smooth(1.7, 2.3, ap));
      const belly = mixc(C.cubBelly, C.belly, a);
      c = mixc(c, belly, smooth(2.3, 2.7, ap));
      // garganta y pecho claros (zona del cuello, cara inferior)
      const throat = smooth(0.62, 0.78, u) * smooth(1.7, 2.3, ap);
      c = mixc(c, C.cream, throat * 0.85);
      // manchas de cría (filas a lo largo del flanco y el lomo)
      if (sk > 0.01 && ap < 2.5) {
        const wob = fbm2(u * 40, v * 30, 2, 17, 30) * 0.18;
        const d = worley(u * 15 + wob, v * 14, 7, 14);
        const m = (1 - smooth(0.2, 0.36, d + wob * 0.6)) * (0.6 + 0.4 * smooth(0.3, 0.6, fbm2(u * 22, v * 18, 2, 5, 18)));
        const fade = 1 - smooth(1.9, 2.5, ap);
        c = mixc(c, C.spot, m * sk * 0.8 * fade);
      }
      // grupa algo más oscura; transición del lomo a la nuca
      c = mixc(c, dors, (1 - smooth(0.0, 0.12, u)) * (1 - smooth(0.6, 1.4, ap)) * 0.4);
      return c;
    }, {su: 70, sv: 120, seed: 11}),
  );
}
/** Patas: u de arriba a abajo; v: 0 delante, 0,25 exterior, 0,75 interior. */
export function legTexture(age: number) {
  const a = ageKey(age);
  const sk = spotK(a);
  return cached(`leg-${a}`, () =>
    paintFur(256, 160, (u, v) => {
      const inner = Math.max(0, -Math.sin(v * Math.PI * 2));
      let c = mixc(mixc(C.cubBase, C.flank, a), mixc(C.cubBelly, C.low, a), smooth(0.4, 1, u) * 0.6);
      c = mixc(c, mixc(C.cubBelly, C.belly, a), smooth(0.3, 0.9, inner) * 0.6);
      // las manchas persisten más en las patas (hasta ≈ 2 años)
      const legSpots = 1 - smooth(0.45, 1.0, a);
      if (legSpots > 0.01) {
        const d = worley(u * 8, v * 9, 3, 9);
        c = mixc(c, C.spot, (1 - smooth(0.18, 0.32, d)) * legSpots * 0.7 * (1 - inner * 0.6));
      }
      void sk;
      return c;
    }, {su: 30, sv: 50, seed: 5}),
  );
}
/** Cola: u de la base a la punta. Punta oscura; anillos en las crías. */
export function tailTexture(age: number) {
  const a = ageKey(age);
  const sk = spotK(a);
  return cached(`tail-${a}`, () =>
    paintFur(512, 96, (u, v) => {
      const ap = absPhi(v);
      let c = mixc(mixc(C.cubBase, C.flank, a), mixc(C.cubBelly, C.low, a), smooth(1.4, 2.6, ap));
      c = mixc(c, C.dark, smooth(0.8, 0.9, u));
      if (sk > 0.01) {
        const ring = Math.cos(u * Math.PI * 2 * 6.5) * 0.5 + 0.5;
        c = mixc(c, C.spot, smooth(0.65, 0.9, ring) * sk * 0.8 * smooth(0.25, 0.4, u));
      }
      return c;
    }, {su: 60, sv: 26, seed: 2}),
  );
}
/** Cabeza: u = x (nuca → nariz), v alrededor (0 frente, 0,5 barbilla). Marcas faciales del puma. */
export const EYE_U = 0.1;
export const EYE_PHI = 0.74;
export function headTexture(age: number) {
  const a = ageKey(age);
  const sk = spotK(a);
  return cached(`head-${a}`, () =>
    paintFur(768, 512, (u, v) => {
      const x = lerp(HEAD_X0, HEAD_X1, u);
      const ap = absPhi(v);
      const base = mixc(C.cubBase, C.flank, smooth(0.2, 0.9, a));
      let c = mixc(mixc(mixc(C.cubBase, C.grey, 0.4), C.dorsal, a), base, smooth(0.3, 1.3, ap));
      // mejillas y garganta claras
      c = mixc(c, C.low, smooth(1.4, 2.0, ap) * 0.8);
      c = mixc(c, C.cream, smooth(2.2, 2.7, ap));
      // dorso del hocico y frente algo más oscuros, y frente grisácea
      c = mixc(c, mixc(C.dorsal, C.grey, 0.25), (1 - smooth(0.0, 0.5, ap)) * smooth(0.06, 0.14, x) * 0.5);
      // hocico blanco (labio superior, morro y barbilla)
      const white = smooth(0.12, 0.14, x) * smooth(1.3, 1.6, ap) + smooth(0.168, 0.185, x) * smooth(0.75, 1.1, ap);
      c = mixc(c, C.cream, clamp(white));
      // mancha oscura en la base de los bigotes, a cada lado del hocico
      const wp = Math.exp(-(((x - 0.155) / 0.014) ** 2) - (((ap - 1.42) / 0.17) ** 2));
      c = mixc(c, C.dark, smooth(0.35, 0.7, wp) * 0.85);
      c = mixc(c, mixc(C.dorsal, C.dark, 0.25), (1 - smooth(0.0, 0.35, ap)) * smooth(0.11, 0.13, x) * (1 - smooth(0.178, 0.188, x)) * 0.55);
      // anillo claro alrededor del ojo y lagrimal oscuro hacia el hocico
      const de = Math.hypot((x - EYE_U) / 0.02, (ap - EYE_PHI) / 0.24);
      c = mixc(c, C.cream, (1 - smooth(0.85, 1.25, de)) * smooth(0.6, 0.9, de) * 0.55);
      const tear = Math.exp(-(((ap - lerp(0.7, 0.95, clamp((x - 0.108) / 0.03))) / 0.05) ** 2)) * smooth(0.106, 0.114, x) * (1 - smooth(0.128, 0.14, x));
      c = mixc(c, C.dark, tear * 0.45);
      // mancha clara sobre el ojo
      c = mixc(c, C.low, Math.exp(-(((x - 0.088) / 0.011) ** 2) - (((ap - 0.55) / 0.12) ** 2)) * 0.6);
      // cachorro: frente moteada
      if (sk > 0.01 && x < 0.12) {
        const d = worley(u * 30, v * 34, 9, 34);
        c = mixc(c, C.spot, (1 - smooth(0.15, 0.28, d)) * sk * 0.6 * (1 - smooth(0.9, 1.6, ap)));
      }
      return c;
    }, {su: 70, sv: 90, seed: 23, k: 0.8}),
  );
}
/** Pie: pelo claro arriba, almohadillas oscuras en la suela (dedos + almohadilla plantar trilobulada). */
export function pawTexture(age: number) {
  const a = ageKey(age);
  return cached(`paw-${a}`, () =>
    paintFur(128, 128, (u, v) => {
      const ap = absPhi(v);
      let c = mixc(C.low, C.cream, 0.35);
      if (ap < 1.5 && u > 0.6) {
        const z = Math.sin(v * Math.PI * 2);
        const crease = [-0.48, 0, 0.48].reduce((m, zz) => Math.max(m, Math.exp(-(((z - zz) / 0.05) ** 2))), 0) * smooth(0.6, 0.75, u);
        c = mixc(c, hex('#6a4c34'), crease * 0.7);
      }
      if (ap > 2.3) {
        const z = Math.sin(v * Math.PI * 2);
        const toes = [-0.62, -0.2, 0.2, 0.62].reduce((m, zz) => Math.max(m, Math.exp(-(((u - 0.8) / 0.08) ** 2) - (((z - zz) / 0.17) ** 2))), 0);
        const plantar = Math.exp(-(((u - 0.42) / 0.14) ** 2) - ((z / 0.5) ** 2));
        c = mixc(c, hex('#4a3434'), clamp((toes + plantar) * 1.6));
      }
      void fbm2;
      return c;
    }, {su: 18, sv: 30, seed: 4, k: 0.6}),
  );
}
export type FurPack = ReturnType<typeof paintFur>;
export type RGBc = RGB;

/** Almohadillas de los bigotes (esferas aplastadas): blancas con la mancha oscura del puma en la parte superior externa. */
export function padTexture(age: number, side: 1 | -1) {
  const a = ageKey(age);
  return cached(`pad-${a}-${side}`, () =>
    paintFur(256, 128, (u, v) => {
      const ph = u * Math.PI * 2;
      const th = v * Math.PI;
      // SphereGeometry: x = −cos φ·sin θ, y = cos θ, z = sin φ·sin θ (v = 0 abajo en la textura → θ = π·(1 − v))
      const t = Math.PI * (1 - v);
      const d = new THREE.Vector3(-Math.cos(ph) * Math.sin(t), Math.cos(t), Math.sin(ph) * Math.sin(t));
      const spot = d.dot(new THREE.Vector3(-0.15, 0.62, side * 0.77).normalize());
      let c = mixc(C.cream, C.low, 0.08);
      c = mixc(c, C.dark, smooth(0.62, 0.86, spot) * 0.9);
      // parte trasera/superior se funde con el tono del hocico
      c = mixc(c, mixc(C.flank, C.low, 0.5), smooth(0.4, 0.9, d.y * 0.6 - d.x * 0.8) * 0.5);
      void th;
      return c;
    }, {su: 20, sv: 14, seed: 31, k: 0.5, periodicV: false}),
  );
}
