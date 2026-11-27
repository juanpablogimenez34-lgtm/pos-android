// RIG DE CUADRÚPEDO (felino / cérvido) — Mundo Insólito Studio 3.2.
// Unidades: metros. +x = hacia delante del animal, +y = arriba, +z = lado izquierdo. Suelo en y = 0 (o altura del terreno).
//
// · ESPECIE: proporciones (longitudes óseas, alturas, anchuras) que se interpolan con la edad (recién nacido → adulto).
// · COLUMNA: cadena de 12 vértebras entre la cadera y la cruz con flexión dorsoventral (galope: agrupar/extender) y
//   curvatura lateral (giros). La raíz está en la pelvis.
// · OMÓPLATOS: pivotan sobre la cruz; su borde superior desplaza la piel del lomo (hombros que se mueven bajo la piel).
// · PATAS: cinemática inversa analítica de 2 huesos + segmento distal:
//     traseras: cadera → rodilla (apunta hacia delante) → corvejón → pata (metatarso inclinado, digitígrado);
//     delanteras: hombro → codo (apunta hacia atrás) → muñeca → pata (metacarpo casi vertical).
// · MARCHA: planificador de apoyos precalculado (sin deslizamiento): cada pie queda FIJO en el mundo durante el apoyo;
//   en el balanceo describe un arco entre la huella anterior y la siguiente.
// · SALTO: controlador de fases (observación, descenso, compresión, impulso, extensión, vuelo, preparación de las
//   manos, contacto, absorción y recuperación).
import * as THREE from 'three';
import {clamp, lerp, smooth} from '../../../lib/noise';

export type V3 = THREE.Vector3;
const v3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// ------------------------------------------------------------------ ESPECIE
export type Species = {
  name: 'puma' | 'deer';
  torso: number; // cadera → cruz
  hipH: number; // altura de la articulación de la cadera sobre el suelo en estación
  withersH: number; // altura de la cruz
  hipW: number; // semiseparación lateral de las caderas
  shW: number; // semiseparación lateral de los hombros
  femur: number;
  tibia: number;
  metatarsus: number;
  scapula: number;
  humerus: number;
  radius: number;
  metacarpus: number;
  paw: number; // longitud del pie (dedos/pezuña)
  neck: number; // longitud del cuello
  neckAngle: number; // inclinación de reposo del cuello (rad sobre la horizontal)
  head: number; // escala de la cabeza (1 = adulto)
  tail: number; // longitud de la cola
  tailR: number; // radio de la base de la cola
  girth: number; // escala del grosor del tronco
  legR: number; // escala del grosor de las patas
};

export const PUMA_ADULT: Species = {
  name: 'puma', torso: 0.66, hipH: 0.58, withersH: 0.66, hipW: 0.07, shW: 0.075,
  femur: 0.25, tibia: 0.27, metatarsus: 0.17, scapula: 0.17, humerus: 0.21, radius: 0.23, metacarpus: 0.075, paw: 0.075,
  neck: 0.2, neckAngle: 0.32, head: 1, tail: 0.76, tailR: 0.042, girth: 1, legR: 1,
};
/** Cachorro de ≈ 3 meses: cabeza y patas proporcionalmente grandes, tronco corto, cola relativamente corta. */
export const PUMA_CUB: Species = {
  name: 'puma', torso: 0.25, hipH: 0.2, withersH: 0.22, hipW: 0.035, shW: 0.037,
  femur: 0.085, tibia: 0.09, metatarsus: 0.06, scapula: 0.065, humerus: 0.075, radius: 0.08, metacarpus: 0.03, paw: 0.035,
  neck: 0.075, neckAngle: 0.5, head: 0.58, tail: 0.2, tailR: 0.018, girth: 0.4, legR: 0.48,
};
/** Recién nacido: muy pequeño, patas cortas, cabeza grande respecto al cuerpo. */
export const PUMA_NEWBORN: Species = {
  name: 'puma', torso: 0.14, hipH: 0.075, withersH: 0.08, hipW: 0.022, shW: 0.024,
  femur: 0.035, tibia: 0.035, metatarsus: 0.022, scapula: 0.03, humerus: 0.03, radius: 0.032, metacarpus: 0.014, paw: 0.02,
  neck: 0.035, neckAngle: 0.3, head: 0.34, tail: 0.08, tailR: 0.011, girth: 0.24, legR: 0.2,
};
/** Hembra de venado de cola blanca: patas largas y finas, cuello largo, tronco profundo. */
export const DEER: Species = {
  name: 'deer', torso: 0.62, hipH: 0.78, withersH: 0.86, hipW: 0.07, shW: 0.07,
  femur: 0.27, tibia: 0.31, metatarsus: 0.27, scapula: 0.2, humerus: 0.2, radius: 0.27, metacarpus: 0.22, paw: 0.05,
  neck: 0.38, neckAngle: 0.95, head: 1, tail: 0.18, tailR: 0.04, girth: 0.95, legR: 0.62,
};
/** Interpolación de proporciones entre etapas (el crecimiento NO es un cambio de escala uniforme). */
export function growPuma(age: number): Species {
  // age: 0 recién nacido · 0,35 cachorro · 1 adulto
  const a = clamp(age);
  const mix = (A: Species, B: Species, u: number): Species => {
    const o = {...A};
    (Object.keys(A) as (keyof Species)[]).forEach((k) => {
      if (k !== 'name') (o as Record<string, unknown>)[k] = lerp(A[k] as number, B[k] as number, u);
    });
    return o;
  };
  return a < 0.35 ? mix(PUMA_NEWBORN, PUMA_CUB, a / 0.35) : mix(PUMA_CUB, PUMA_ADULT, smooth(0, 1, (a - 0.35) / 0.65));
}

// ------------------------------------------------------------------ POSE
export type LegId = 'LH' | 'RH' | 'LF' | 'RF';
export const LEGS: LegId[] = ['LH', 'RH', 'LF', 'RF'];
export type LegPose = {target: V3; lift: number; pawPitch: number; contact: number};
export type Pose = {
  root: V3; // articulación de la cadera, en el centro (entre ambas caderas)
  heading: number; // rumbo (rad, 0 = +x del mundo)
  pitch: number; // cabeceo del cuerpo (+ = morro arriba)
  roll: number;
  flex: number; // −1 extendido … +1 agrupado (columna)
  bend: number; // curvatura lateral (+ = gira a la izquierda)
  breathe: number; // 0…1 inspiración (volumen torácico)
  neckPitch: number; // + = cuello más erguido
  neckYaw: number;
  headPitch: number;
  headYaw: number;
  headRoll: number;
  jaw: number;
  blink: number; // 0 abierto … 1 cerrado
  eyeYaw: number;
  earL: number; // −1 hacia atrás … +1 hacia delante (giro de la oreja)
  earR: number;
  tailBase: number; // ángulo de la base (+ arriba)
  tailCurl: number; // curvatura (+ hacia arriba en la punta)
  tailWave: number; // fase de la onda lateral
  tailAmp: number;
  legs: Record<LegId, LegPose>;
  crouch: number; // 0…1 (acecho/agazapado: baja el cuerpo, flexiona las patas)
};

export function basePose(): Pose {
  const leg = (): LegPose => ({target: v3(), lift: 0, pawPitch: 0, contact: 1});
  return {root: v3(), heading: 0, pitch: 0, roll: 0, flex: 0, bend: 0, breathe: 0, neckPitch: 0, neckYaw: 0, headPitch: 0, headYaw: 0, headRoll: 0, jaw: 0, blink: 0, eyeYaw: 0, earL: 0.3, earR: 0.3, tailBase: -0.35, tailCurl: 0.3, tailWave: 0, tailAmp: 0.1, legs: {LH: leg(), RH: leg(), LF: leg(), RF: leg()}, crouch: 0};
}

// ------------------------------------------------------------------ ESQUELETO RESUELTO
export type Frame = {p: V3; q: THREE.Quaternion};
export type Skeleton = {
  spine: Frame[]; // 13 marcos de la cadera (0) a la cruz (12)
  pelvis: Frame;
  withers: Frame;
  neck: Frame[]; // 7 marcos del cuello
  head: Frame;
  scapula: Record<'L' | 'R', {top: V3; joint: V3; angle: number}>;
  legs: Record<LegId, V3[]>; // articulaciones de cada pata (de proximal a distal), incluye la punta del pie
  tail: Frame[];
  sp: Species;
};

const qFrom = (yaw: number, pitch: number, roll: number) => new THREE.Quaternion().setFromEuler(new THREE.Euler(roll, yaw, pitch, 'YZX'));

/** Resolución completa del esqueleto para una pose. */
export function solve(sp: Species, P: Pose): Skeleton {
  const body = qFrom(P.heading, P.pitch, P.roll);
  const NSP = 12;
  const segL = sp.torso / NSP;
  // inclinación de reposo cadera→cruz (la cruz algo más alta en el ciervo, casi igual en el puma)
  const slope = Math.asin(clamp((sp.withersH - sp.hipH) / sp.torso, -0.5, 0.5));
  const spine: Frame[] = [{p: P.root.clone(), q: body.clone()}];
  let q = body.clone().multiply(new THREE.Quaternion().setFromAxisAngle(v3(0, 0, 1), slope));
  let p = P.root.clone();
  for (let i = 1; i <= NSP; i++) {
    const u = i / NSP;
    // flexión: arco dorsal en la región lumbar (agrupado) y extensión (cóncava); curvatura lateral uniforme
    const k = (P.flex * 0.95 * Math.sin(u * Math.PI)) / NSP;
    const b = (P.bend * 0.9) / NSP;
    q = q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(v3(0, 0, 1), -k * 1.6 + (i === 1 ? 0 : 0))).multiply(new THREE.Quaternion().setFromAxisAngle(v3(0, 1, 0), b));
    p = p.clone().add(v3(segL, 0, 0).applyQuaternion(q));
    spine.push({p: p.clone(), q: q.clone()});
  }
  const withers = spine[NSP];
  // cuello: parte de la cruz, sube con neckAngle + neckPitch, gira con neckYaw
  const neck: Frame[] = [withers];
  let nq = withers.q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(v3(0, 0, 1), sp.neckAngle + P.neckPitch - P.crouch * 0.35));
  let np = withers.p.clone().add(v3(0.02 * sp.head, -0.02 * sp.head, 0).applyQuaternion(withers.q));
  const NN = 6;
  for (let i = 1; i <= NN; i++) {
    nq = nq.clone().multiply(new THREE.Quaternion().setFromAxisAngle(v3(0, 1, 0), P.neckYaw / NN)).multiply(new THREE.Quaternion().setFromAxisAngle(v3(0, 0, 1), i > NN - 2 ? -0.22 : 0));
    np = np.clone().add(v3(sp.neck / NN, 0, 0).applyQuaternion(nq));
    neck.push({p: np.clone(), q: nq.clone()});
  }
  // cabeza: orientada por el último marco del cuello y la pose de la cabeza (la cabeza tiende a la horizontal)
  const nEnd = neck[NN];
  const headQ = nEnd.q
    .clone()
    .multiply(new THREE.Quaternion().setFromAxisAngle(v3(0, 0, 1), -(sp.neckAngle + P.neckPitch) * 0.85 + P.headPitch + (sp.name === 'deer' ? -0.35 : 0)))
    .multiply(new THREE.Quaternion().setFromAxisAngle(v3(0, 1, 0), P.headYaw))
    .multiply(new THREE.Quaternion().setFromAxisAngle(v3(1, 0, 0), P.headRoll));
  const head = {p: nEnd.p.clone(), q: headQ};
  // omóplatos: el borde superior en la cruz; el ángulo sigue a la pata delantera (balanceo) — se mueve bajo la piel
  const scap = {} as Skeleton['scapula'];
  (['L', 'R'] as const).forEach((s) => {
    const side = s === 'L' ? 1 : -1;
    const fi = spine[NSP - 1];
    const top = fi.p.clone().add(v3(0, -0.01 * sp.head, side * sp.shW * 0.55).applyQuaternion(fi.q));
    const legT = P.legs[s === 'L' ? 'LF' : 'RF'].target;
    // ángulo: el omóplato se inclina hacia delante cuando la mano avanza
    const local = legT.clone().sub(top).applyQuaternion(fi.q.clone().invert());
    const angle = clamp(Math.atan2(local.x, -local.y) * 0.5, -0.5, 0.6) - 0.35;
    const joint = top.clone().add(v3(Math.sin(angle) * sp.scapula, -Math.cos(angle) * sp.scapula, side * (sp.shW - sp.shW * 0.55)).applyQuaternion(fi.q));
    scap[s] = {top, joint, angle};
  });
  // patas
  const legs = {} as Skeleton['legs'];
  const pelvis = spine[0];
  for (const id of LEGS) {
    const L = P.legs[id];
    const side = id[0] === 'L' ? 1 : -1;
    const fwd = v3(1, 0, 0).applyQuaternion(qFrom(P.heading, 0, 0));
    if (id[1] === 'H') {
      const hip = pelvis.p.clone().add(v3(-0.01, -0.02 * sp.girth, side * sp.hipW).applyQuaternion(pelvis.q));
      // pie: punta en el objetivo; el metatarso se inclina hacia atrás (más al comprimirse)
      const toe = L.target.clone();
      const mAng = 0.32 + P.crouch * 0.45 + L.pawPitch * 0.5;
      const heel = toe.clone().add(fwd.clone().multiplyScalar(-sp.paw)).add(v3(0, 0.012 * sp.legR, 0));
      const hock = heel.clone().add(fwd.clone().multiplyScalar(-Math.sin(mAng) * sp.metatarsus)).add(v3(0, Math.cos(mAng) * sp.metatarsus, 0));
      const knee = ik2(hip, hock, sp.femur, sp.tibia, fwd, +1);
      legs[id] = [hip, knee, hock, heel, toe];
    } else {
      const sh = scap[side > 0 ? 'L' : 'R'].joint;
      const toe = L.target.clone();
      const wrist = toe.clone().add(fwd.clone().multiplyScalar(-sp.paw * 0.75)).add(v3(0, sp.metacarpus * Math.cos(0.15 + L.pawPitch), 0)).add(fwd.clone().multiplyScalar(-sp.metacarpus * Math.sin(0.15 + L.pawPitch)));
      const heel = toe.clone().add(fwd.clone().multiplyScalar(-sp.paw * 0.75)).add(v3(0, 0.01 * sp.legR, 0));
      const elbow = ik2(sh, wrist, sp.humerus, sp.radius, fwd, -1);
      legs[id] = [scap[side > 0 ? 'L' : 'R'].top, sh, elbow, wrist, heel, toe];
    }
  }
  // cola: cadena de 18 segmentos desde la base (detrás de la pelvis) con curvatura y onda lateral
  const tail: Frame[] = [];
  const NT = 18;
  let tq = pelvis.q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(v3(0, 0, 1), Math.PI + P.tailBase * -1));
  let tp = pelvis.p.clone().add(v3(-0.06 * Math.max(0.3, sp.girth), 0.015, 0).applyQuaternion(pelvis.q));
  tail.push({p: tp.clone(), q: tq.clone()});
  for (let i = 1; i <= NT; i++) {
    const u = i / NT;
    const curl = (P.tailCurl * 1.4 * u) / NT;
    const wave = (Math.sin(P.tailWave - u * 3.2) * P.tailAmp * 2.4) / NT;
    tq = tq.clone().multiply(new THREE.Quaternion().setFromAxisAngle(v3(0, 0, 1), -curl)).multiply(new THREE.Quaternion().setFromAxisAngle(v3(0, 1, 0), wave));
    tp = tp.clone().add(v3(sp.tail / NT, 0, 0).applyQuaternion(tq));
    tail.push({p: tp.clone(), q: tq.clone()});
  }
  return {spine, pelvis, withers, neck, head, scapula: scap, legs, tail, sp};
}

/** IK analítica de 2 huesos: devuelve la articulación media. `pole` indica hacia dónde apunta (rodilla delante, codo detrás). */
export function ik2(a: V3, c: V3, l1: number, l2: number, fwd: V3, sign: 1 | -1): V3 {
  const ac = c.clone().sub(a);
  let d = ac.length();
  d = clamp(d, Math.abs(l1 - l2) + 1e-4, l1 + l2 - 1e-4);
  const dir = ac.clone().normalize();
  // ángulo en a (ley de los cosenos)
  const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const ang = Math.acos(cosA);
  // eje de flexión: perpendicular al plano (dir, fwd)
  const pole = fwd.clone().multiplyScalar(sign);
  let axis = new THREE.Vector3().crossVectors(dir, pole);
  if (axis.lengthSq() < 1e-8) axis = v3(0, 0, 1);
  axis.normalize();
  const b = dir.clone().applyAxisAngle(axis, ang).multiplyScalar(l1);
  return a.clone().add(b);
}

// ------------------------------------------------------------------ PLANIFICADOR DE MARCHA (sin deslizamiento)
export type Gait = 'walk' | 'stalk' | 'trot' | 'gallop';
const GAIT: Record<Gait, {duty: number; off: Record<LegId, number>; lift: number; bob: number}> = {
  walk: {duty: 0.64, off: {LH: 0, LF: 0.25, RH: 0.5, RF: 0.75}, lift: 0.07, bob: 0.012},
  stalk: {duty: 0.8, off: {LH: 0, LF: 0.25, RH: 0.5, RF: 0.75}, lift: 0.045, bob: 0.004},
  trot: {duty: 0.48, off: {LH: 0, RF: 1.0, RH: 0.5, LF: 0.5}, lift: 0.1, bob: 0.02},
  gallop: {duty: 0.3, off: {LH: 0, RH: 0.1, LF: 0.5, RF: 0.62}, lift: 0.17, bob: 0.05}, // galope rotatorio con suspensión
};
type GP = {duty: number; off: Record<LegId, number>; lift: number; bob: number; base: number};
const BASE: Record<Gait, number> = {gallop: 2.6, trot: 1.55, stalk: 0.9, walk: 1.25};
/** Parámetros de marcha mezclados en una ventana de ±0,3 s: los cambios de marcha no producen saltos de los pies. */
function gaitParams(gait: (t: number) => Gait, t: number): GP {
  const o: GP = {duty: 0, off: {LH: 0, RH: 0, LF: 0, RF: 0}, lift: 0, bob: 0, base: 0};
  const N = 7;
  for (let k = 0; k < N; k++) {
    const g = gait(t + (k - 3) * 0.1);
    const G = GAIT[g];
    o.duty += G.duty / N;
    o.lift += G.lift / N;
    o.bob += G.bob / N;
    o.base += BASE[g] / N;
    for (const id of LEGS) o.off[id] += G.off[id] / N;
  }
  return o;
}
/** Recorrido en el plano (centrado en la cadera): devuelve punto y rumbo a una distancia D. */
export type Path = (D: number) => {x: number; z: number; heading: number};
export const straightPath = (x0: number, z0: number, heading: number): Path => (D) => ({x: x0 + Math.cos(heading) * D, z: z0 - Math.sin(heading) * D, heading});
/** Recorrido curvo por puntos (polilínea suavizada por longitud de arco). */
export function polyPath(pts: [number, number][]): Path {
  const seg: {a: [number, number]; b: [number, number]; l: number; s0: number}[] = [];
  let s = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    seg.push({a: pts[i], b: pts[i + 1], l, s0: s});
    s += l;
  }
  return (D) => {
    let i = 0;
    while (i < seg.length - 1 && D > seg[i].s0 + seg[i].l) i++;
    const g = seg[i];
    const u = (D - g.s0) / g.l;
    // rumbo suavizado entre segmentos
    const h0 = Math.atan2(-(g.b[1] - g.a[1]), g.b[0] - g.a[0]);
    const nb = seg[Math.min(seg.length - 1, i + 1)];
    const h1 = Math.atan2(-(nb.b[1] - nb.a[1]), nb.b[0] - nb.a[0]);
    let dh = h1 - h0;
    while (dh > Math.PI) dh -= Math.PI * 2;
    while (dh < -Math.PI) dh += Math.PI * 2;
    const blend = smooth(0.6, 1.0, u);
    return {x: g.a[0] + (g.b[0] - g.a[0]) * u, z: g.a[1] + (g.b[1] - g.a[1]) * u, heading: h0 + dh * blend * 0.5};
  };
}

export type Locomotion = {
  /** Estado en el instante t: distancia, rumbo, pose de las patas y oscilación del cuerpo. */
  at: (t: number) => {D: number; speed: number; heading: number; legs: Record<LegId, LegPose>; bob: number; gaitBlend: Record<Gait, number>; phase: number; airborne: number};
};
/**
 * Precalcula la locomoción de un plano: velocidad(t) y marcha(t) → distancia, fase del ciclo, huellas.
 * La longitud de zancada depende de la velocidad y de la marcha; los apoyos se registran cuando empiezan, de modo que el
 * pie permanece en el mismo punto del mundo durante todo el apoyo.
 */
export function makeLocomotion(sp: Species, path: Path, t0: number, t1: number, speed: (t: number) => number, gait: (t: number) => Gait, ground: (x: number, z: number) => number = () => 0): Locomotion {
  const dt = 1 / 120;
  const n = Math.ceil((t1 - t0) / dt) + 240;
  const D = new Float64Array(n);
  const PH = new Float64Array(n);
  const LEN = sp.femur + sp.tibia + sp.metatarsus;
  const strideOf = (v: number, G: GP) => LEN * G.base * (0.75 + 0.25 * Math.min(1, v / 1.2)) + smooth(1.55, 2.6, G.base) * v * 0.12;
  const plants: Record<LegId, {t: number; D: number}[]> = {LH: [], RH: [], LF: [], RF: []};
  let d = 0;
  let ph = 0;
  const prevP: Record<LegId, number> = {LH: -1, RH: -1, LF: -1, RF: -1};
  const p0: Record<LegId, number> = {LH: 0, RH: 0, LF: 0, RF: 0};
  for (let i = 0; i < n; i++) {
    const t = t0 + i * dt;
    const G = gaitParams(gait, t);
    const v = Math.max(0, speed(t));
    const L = strideOf(v, G);
    D[i] = d;
    PH[i] = ph;
    for (const id of LEGS) {
      const p = (((ph + G.off[id]) % 1) + 1) % 1;
      // inicio de apoyo: el pie se planta adelantado media zancada de apoyo respecto a su anclaje
      if (prevP[id] >= 0 && p < prevP[id] - 0.5) plants[id].push({t, D: d + G.duty * L * 0.5});
      // arranque desde la estación: todos los pies parten de su posición neutra (sin salto respecto a la pose anterior)
      if (i === 0) {
        plants[id].push({t: t - 10, D: d});
        p0[id] = p;
      }
      prevP[id] = p;
    }
    d += v * dt;
    ph += (v / Math.max(0.05, L)) * dt;
  }
  const idx = (t: number) => clamp(Math.round((t - t0) / dt), 0, n - 1);
  // anclaje de cada pie respecto a la cadera (igual que la pose de estación: los apoyos coinciden con el reposo)
  const slope = Math.asin(clamp((sp.withersH - sp.hipH) / sp.torso, -0.5, 0.5));
  const ks = sp.torso / 0.66;
  const anchor = (id: LegId) => (id[1] === 'F' ? sp.torso * Math.cos(slope) + 0.035 * ks + sp.paw * 0.4 : -0.02 * ks + sp.paw * 0.45);
  return {
    at: (t: number) => {
      const i = idx(t);
      const g = gait(t);
      const G = gaitParams(gait, t);
      const v = Math.max(0, speed(t));
      const L = strideOf(v, G);
      const here = path(D[i]);
      const legs = {} as Record<LegId, LegPose>;
      let air = 0;
      for (const id of LEGS) {
        const side = id[0] === 'L' ? 1 : -1;
        const p = (((PH[i] + G.off[id]) % 1) + 1) % 1;
        const list = plants[id];
        let k = list.length - 1;
        while (k > 0 && list[k].t > t) k--;
        const cur = list[k];
        const footAt = (Dd: number) => {
          const w = path(Dd + anchor(id));
          const halfW = id[1] === 'H' ? sp.hipW : sp.shW;
          const x = w.x - Math.sin(w.heading) * side * halfW * 0.92;
          const z = w.z - Math.cos(w.heading) * side * halfW * 0.92;
          return v3(x, ground(x, z), z);
        };
        if (p < G.duty) {
          legs[id] = {target: footAt(cur.D), lift: 0, pawPitch: 0, contact: 1};
        } else {
          air++;
          // primer balanceo de una pata que ya estaba en el aire al empezar: arranca desde la posición neutra
          const sw0 = k === 0 && p0[id] >= G.duty && p >= p0[id] ? p0[id] : G.duty;
          const s = clamp((p - sw0) / (1 - sw0));
          // destino: el próximo apoyo registrado (exacto aunque cambie la velocidad); si no existe, una zancada
          const next = k + 1 < list.length ? list[k + 1].D : cur.D + L;
          const e = s * s * (3 - 2 * s);
          const f = footAt(lerp(cur.D, next, e));
          const h = Math.sin(Math.PI * s) * G.lift * (sp.femur + sp.tibia) * 1.6 * smooth(0.0, 0.3, v);
          f.y += h;
          legs[id] = {target: f, lift: h, pawPitch: Math.sin(Math.PI * s) * 0.9 * smooth(0, 0.3, v), contact: 0};
        }
      }
      const bob = Math.cos(PH[i] * Math.PI * 4) * G.bob * (sp.hipH / 0.6) * Math.min(1, v / 0.5);
      const blend = {walk: 0, stalk: 0, trot: 0, gallop: 0} as Record<Gait, number>;
      blend[g] = 1;
      return {D: D[i], speed: v, heading: here.heading, legs, bob, gaitBlend: blend, phase: PH[i], airborne: air === 4 ? 1 : 0};
    },
  };
}

// ------------------------------------------------------------------ SALTO
export type JumpSpec = {t0: number; from: V3; to: V3; heading: number; apex: number; tPrep: number; tAir: number; tLand: number};
/**
 * Pose de salto en el instante t. Devuelve raíz, cabeceo, flexión, agazapado y objetivos de las 4 patas.
 * Fases: observación + descenso (tPrep·0,45) · compresión (tPrep·0,55) · impulso/vuelo (tAir) · contacto y absorción
 * (tLand·0,5) · recuperación (tLand·0,5).
 */
export function jumpPose(sp: Species, J: JumpSpec, t: number, feet0?: Record<LegId, V3>) {
  const fwd = v3(Math.cos(J.heading), 0, -Math.sin(J.heading));
  const side = v3(-Math.sin(J.heading), 0, -Math.cos(J.heading));
  const tT = J.t0 + J.tPrep; // despegue
  const tL = tT + J.tAir; // contacto de las manos
  const foot = (base: V3, id: LegId) => {
    const s = id[0] === 'L' ? 1 : -1;
    const hw = id[1] === 'H' ? sp.hipW : sp.shW;
    const along = id[1] === 'F' ? sp.torso : 0;
    return base.clone().add(fwd.clone().multiplyScalar(along)).add(side.clone().multiplyScalar(-s * hw * 0.92));
  };
  const legs = {} as Record<LegId, LegPose>;
  let root: V3;
  let pitch = 0;
  let flex = 0;
  let crouch = 0;
  let tailBase = -0.3;
  if (t < tT) {
    // preparación: el centro de gravedad baja, las patas traseras se comprimen; los pies NO se mueven
    const u = clamp((t - J.t0) / J.tPrep);
    crouch = smooth(0, 0.55, u) * 0.85;
    const coil = smooth(0.45, 1, u);
    root = J.from.clone().add(v3(0, sp.hipH - crouch * sp.hipH * 0.38 - coil * 0.03, 0)).add(fwd.clone().multiplyScalar(-coil * 0.05));
    pitch = coil * 0.12;
    flex = coil * 0.55;
    for (const id of LEGS) legs[id] = {target: feet0 ? feet0[id].clone() : foot(J.from, id), lift: 0, pawPitch: 0, contact: 1};
    tailBase = -0.3 - coil * 0.25;
  } else if (t < tL) {
    // vuelo: trayectoria parabólica; cuerpo extendido; manos que se adelantan para el aterrizaje; cola de contrapeso
    const u = clamp((t - tT) / J.tAir);
    const base = J.from.clone().lerp(J.to, u);
    const h = Math.sin(Math.PI * u) * J.apex;
    root = base.add(v3(0, sp.hipH * (0.85 + 0.15 * u) + h, 0));
    pitch = lerp(0.35, -0.3, u);
    flex = lerp(-0.9, -0.2, smooth(0.3, 1, u));
    crouch = 0;
    tailBase = lerp(-0.1, 0.25, u);
    for (const id of LEGS) {
      const hind = id[1] === 'H';
      const off = hind ? (u < 0.35 ? -0.35 : -0.15) : u < 0.5 ? 0.25 : 0.42; // traseras estiradas atrás; manos adelantadas
      const drop = hind ? sp.hipH * 0.62 : sp.withersH * (u < 0.5 ? 0.45 : 0.78);
      const f = foot(root.clone().sub(v3(0, 0, 0)), id).add(fwd.clone().multiplyScalar(off));
      f.y = root.y - drop;
      legs[id] = {target: f, lift: 1, pawPitch: hind ? 0.8 : -0.2, contact: 0};
    }
  } else {
    // aterrizaje: manos primero (absorben), después las traseras; recuperación del equilibrio
    const u = clamp((t - tL) / J.tLand);
    const absorb = Math.sin(Math.PI * clamp(u / 0.6)) * (1 - smooth(0.6, 1, u));
    root = J.to.clone().add(v3(0, sp.hipH - absorb * sp.hipH * 0.3, 0)).add(fwd.clone().multiplyScalar(lerp(-0.12, 0, smooth(0, 0.7, u))));
    pitch = lerp(-0.25, 0, smooth(0, 0.8, u));
    flex = lerp(0.35, 0, smooth(0.2, 1, u));
    crouch = absorb * 0.5;
    tailBase = lerp(0.2, -0.3, smooth(0, 1, u));
    for (const id of LEGS) {
      const hind = id[1] === 'H';
      const land = hind ? clamp(u / 0.35) : 1;
      const f = foot(J.to, id);
      if (hind && land < 1) {
        f.add(fwd.clone().multiplyScalar(-0.25 * (1 - land)));
        f.y += Math.sin(Math.PI * land) * 0.08;
      }
      legs[id] = {target: f, lift: 0, pawPitch: 0, contact: hind ? land : 1};
    }
  }
  return {root, pitch, flex, crouch, legs, tailBase, phase: t < tT ? 'prep' : t < tL ? 'air' : 'land'};
}
