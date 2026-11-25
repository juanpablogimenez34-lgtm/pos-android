// RIG DEL PUMA (Puma concolor) — esqueleto 3D determinista para dibujo vectorial 2.5D.
// Unidades: metros · +x hacia delante · +y arriba · +z = lado DERECHO del animal.
// Columna de 12 vértebras (flexión dorsoventral y curvatura lateral), cuello de 6, cabeza con mandíbula,
// omóplatos que se deslizan, patas con IK (traseras digitígradas con corvejón), cola de 20 segmentos.
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {add3, cross3, len3, mul3, norm3, sub3, v3, V3} from './space';

export type Species = {
  torso: number; hipH: number; withersH: number; hipW: number; shW: number;
  femur: number; tibia: number; metatarsus: number; scapula: number; humerus: number; radius: number; metacarpus: number; paw: number;
  neck: number; neckAngle: number; head: number; tail: number; tailR: number; girth: number; legR: number;
  muzzle: number; earK: number; eyeK: number; spots: number; eyesOpen: number; blueEyes: number;
};
/** Macho adulto: 1,40 m cabeza-cuerpo, 0,75 m de cola, 0,68 m a la cruz. */
export const ADULT: Species = {
  torso: 0.66, hipH: 0.58, withersH: 0.66, hipW: 0.075, shW: 0.08,
  femur: 0.25, tibia: 0.27, metatarsus: 0.17, scapula: 0.17, humerus: 0.21, radius: 0.23, metacarpus: 0.075, paw: 0.075,
  neck: 0.2, neckAngle: 0.12, head: 1.3, tail: 0.76, tailR: 0.044, girth: 1.08, legR: 1.18,
  muzzle: 0.88, earK: 1, eyeK: 1, spots: 0, eyesOpen: 1, blueEyes: 0,
};
/** Cachorro (≈ 3 meses): cabeza, orejas, ojos y patas proporcionalmente grandes; manchas; ojos azules. */
export const CUB: Species = {
  torso: 0.25, hipH: 0.2, withersH: 0.21, hipW: 0.035, shW: 0.037,
  femur: 0.085, tibia: 0.09, metatarsus: 0.06, scapula: 0.065, humerus: 0.075, radius: 0.08, metacarpus: 0.03, paw: 0.036,
  neck: 0.07, neckAngle: 0.45, head: 0.58, tail: 0.2, tailR: 0.017, girth: 0.4, legR: 0.5,
  muzzle: 0.75, earK: 1.3, eyeK: 1.3, spots: 0.85, eyesOpen: 1, blueEyes: 1,
};
/** Recién nacido: ojos cerrados, muy moteado, cabeza grande, patas cortas (se arrastra). */
export const NEWBORN: Species = {
  torso: 0.14, hipH: 0.075, withersH: 0.078, hipW: 0.022, shW: 0.024,
  femur: 0.035, tibia: 0.035, metatarsus: 0.022, scapula: 0.03, humerus: 0.03, radius: 0.032, metacarpus: 0.014, paw: 0.02,
  neck: 0.035, neckAngle: 0.25, head: 0.34, tail: 0.08, tailR: 0.011, girth: 0.24, legR: 0.22,
  muzzle: 0.65, earK: 0.9, eyeK: 1.2, spots: 1, eyesOpen: 0, blueEyes: 1,
};
/** Crecimiento por proporciones (no un simple cambio de escala): 0 recién nacido · 0,35 cachorro · 1 adulto. */
export function grow(age: number): Species {
  const a = clamp(age);
  const mix = (A: Species, B: Species, u: number) => {
    const o = {...A} as Record<string, number>;
    for (const k of Object.keys(A)) o[k] = lerp((A as Record<string, number>)[k], (B as Record<string, number>)[k], u);
    return o as unknown as Species;
  };
  const s = a < 0.35 ? mix(NEWBORN, CUB, a / 0.35) : mix(CUB, ADULT, smoothstep(0, 1, (a - 0.35) / 0.65));
  s.eyesOpen = smoothstep(0.08, 0.16, a);
  s.blueEyes = 1 - smoothstep(0.45, 0.85, a);
  s.spots = 1 - smoothstep(0.35, 0.9, a);
  return s;
}

export type LegId = 'RH' | 'LH' | 'RF' | 'LF';
export const LEGS: LegId[] = ['RH', 'LH', 'RF', 'LF'];
export type LegPose = {target: V3; pawPitch: number; contact: number};
export type Pose = {
  root: V3; // articulación de la cadera (centro), coordenadas del animal (y = altura sobre el suelo)
  pitch: number; roll: number; flex: number; bend: number; breathe: number; crouch: number;
  neckPitch: number; neckYaw: number; headPitch: number; headYaw: number; headRoll: number;
  jaw: number; blink: number; eyeX: number; eyeY: number; earL: number; earR: number;
  tailBase: number; tailCurl: number; tailWave: number; tailAmp: number; tailSide: number;
  legs: Record<LegId, LegPose>;
};
export function basePose(): Pose {
  const leg = (): LegPose => ({target: v3(), pawPitch: 0, contact: 1});
  return {root: v3(), pitch: 0, roll: 0, flex: 0, bend: 0, breathe: 0.5, crouch: 0, neckPitch: 0, neckYaw: 0, headPitch: 0, headYaw: 0, headRoll: 0, jaw: 0, blink: 0, eyeX: 0, eyeY: 0, earL: 0.3, earR: 0.3, tailBase: -1, tailCurl: 1.2, tailWave: 0, tailAmp: 0.1, tailSide: 0, legs: {RH: leg(), LH: leg(), RF: leg(), LF: leg()}};
}

/** Marco ortonormal: f adelante, u arriba, l = lateral (+z derecha). */
export type Frame = {p: V3; f: V3; u: V3; l: V3};
const frameFrom = (p: V3, yaw: number, pitch: number): Frame => {
  const f = v3(Math.cos(pitch) * Math.cos(yaw), Math.sin(pitch), -Math.cos(pitch) * Math.sin(yaw));
  const l = v3(Math.sin(yaw), 0, Math.cos(yaw));
  const u = norm3(cross3(l, f));
  return {p, f, u, l};
};

export type Skeleton = {
  sp: Species;
  spine: Frame[]; // 13: cadera (0) → cruz (12)
  neck: Frame[]; // 7: cruz → nuca
  head: Frame; // nuca; f hacia el hocico
  scap: Record<'R' | 'L', {top: V3; joint: V3}>;
  legs: Record<LegId, V3[]>; // traseras [cadera, rodilla, corvejón, talón, dedos] · delanteras [omóplato, hombro, codo, muñeca, talón, dedos]
  tail: Frame[];
  pose: Pose;
};

export function solve(sp: Species, P: Pose): Skeleton {
  const NSP = 12;
  const seg = sp.torso / NSP;
  const slope = Math.asin(clamp((sp.withersH - sp.hipH) / sp.torso, -0.5, 0.5));
  const spine: Frame[] = [];
  let yaw = 0;
  // la flexión arquea el lomo sin hundir los hombros: la cuerda cadera→cruz conserva su inclinación
  let pitch = P.pitch + slope + P.flex * 0.48;
  let p = {...P.root};
  spine.push(frameFrom(p, yaw, pitch));
  for (let i = 1; i <= NSP; i++) {
    const u = i / NSP;
    pitch -= (P.flex * 1.5 * Math.sin(u * Math.PI)) / NSP; // flexión: arco lumbar (agrupado) / extensión
    yaw += (P.bend * 0.9) / NSP;
    const fr = frameFrom(p, yaw, pitch);
    p = add3(p, mul3(fr.f, seg));
    spine.push(frameFrom(p, yaw, pitch));
  }
  // compensación: la pendiente media vuelve a la del cuerpo (la flexión no levanta el pecho)
  const w = spine[NSP];
  // cuello
  const neck: Frame[] = [w];
  let ny = yaw;
  let np = pitch + sp.neckAngle + P.neckPitch - P.crouch * 0.35 + P.flex * 0.4;
  let nP = add3(w.p, mul3(w.u, -0.015 * sp.girth));
  for (let i = 1; i <= 6; i++) {
    ny += P.neckYaw / 6;
    if (i > 4) np -= 0.1;
    const fr = frameFrom(nP, ny, np);
    nP = add3(nP, mul3(fr.f, sp.neck / 6));
    neck.push(frameFrom(nP, ny, np));
  }
  // cabeza: tiende a la horizontal; giro e inclinación propios
  const hp = np - (sp.neckAngle + P.neckPitch) * 0.85 + 0.12 + P.headPitch;
  const hy = ny + P.headYaw;
  let head = frameFrom(nP, hy, hp);
  if (Math.abs(P.headRoll) > 1e-4) {
    const c = Math.cos(P.headRoll);
    const s = Math.sin(P.headRoll);
    head = {...head, u: add3(mul3(head.u, c), mul3(head.l, s)), l: add3(mul3(head.l, c), mul3(head.u, -s))};
  }
  // omóplatos: el borde superior bajo la piel de la cruz; el ángulo sigue a la mano
  const scap = {} as Skeleton['scap'];
  for (const s of ['R', 'L'] as const) {
    const side = s === 'R' ? 1 : -1;
    const fi = spine[NSP - 1];
    const top = add3(add3(fi.p, mul3(fi.l, side * sp.shW * 0.55)), mul3(fi.u, -0.015 * sp.girth));
    const tgt = P.legs[s === 'R' ? 'RF' : 'LF'].target;
    const rel = sub3(tgt, top);
    const along = rel.x * fi.f.x + rel.y * fi.f.y + rel.z * fi.f.z;
    const down = -(rel.x * fi.u.x + rel.y * fi.u.y + rel.z * fi.u.z);
    const ang = clamp(Math.atan2(along, down) * 0.5, -0.5, 0.6) - 0.35;
    const joint = add3(add3(top, mul3(fi.f, Math.sin(ang) * sp.scapula)), add3(mul3(fi.u, -Math.cos(ang) * sp.scapula), mul3(fi.l, side * sp.shW * 0.45)));
    scap[s] = {top, joint};
  }
  // patas
  const legs = {} as Skeleton['legs'];
  const pel = spine[0];
  const fwd = v3(Math.cos(yaw * 0.5), 0, -Math.sin(yaw * 0.5));
  for (const id of LEGS) {
    const L = P.legs[id];
    const side = id[0] === 'R' ? 1 : -1;
    const toe = {...L.target};
    if (id[1] === 'H') {
      const hip = add3(add3(pel.p, mul3(pel.l, side * sp.hipW)), mul3(pel.u, -0.02 * sp.girth));
      const mAng = 0.32 + P.crouch * 0.45 + L.pawPitch * 0.5;
      const heel = add3(toe, add3(mul3(fwd, -sp.paw), v3(0, 0.012 * sp.legR, 0)));
      const hock = add3(heel, add3(mul3(fwd, -Math.sin(mAng) * sp.metatarsus), v3(0, Math.cos(mAng) * sp.metatarsus, 0)));
      const knee = ik2(hip, hock, sp.femur, sp.tibia, fwd, 1);
      legs[id] = [hip, knee, hock, heel, toe];
    } else {
      const sc = scap[id[0] as 'R' | 'L'];
      const wa = 0.15 + L.pawPitch;
      const heel = add3(toe, add3(mul3(fwd, -sp.paw * 0.75), v3(0, 0.01 * sp.legR, 0)));
      const wrist = add3(heel, add3(v3(0, sp.metacarpus * Math.cos(wa), 0), mul3(fwd, -sp.metacarpus * Math.sin(wa))));
      const elbow = ik2(sc.joint, wrist, sp.humerus, sp.radius, fwd, -1);
      legs[id] = [sc.top, sc.joint, elbow, wrist, heel, toe];
    }
  }
  // cola: nace detrás de la pelvis; curvatura (J), onda lateral y desvío
  const tail: Frame[] = [];
  let ty = yaw + Math.PI + P.tailSide;
  let tpch = -(pel.f.y > 0 ? 0 : 0) + P.tailBase; // ángulo respecto a la horizontal (− abajo)
  let tp = add3(pel.p, add3(mul3(pel.f, -0.06 * Math.max(0.35, sp.girth)), mul3(pel.u, 0.02 * sp.girth)));
  const NT = 20;
  tail.push(frameFrom(tp, ty, tpch));
  for (let i = 1; i <= NT; i++) {
    const u = i / NT;
    tpch += (P.tailCurl * 1.5 * u) / NT;
    ty += (Math.sin(P.tailWave - u * 3.2) * P.tailAmp * 2.6) / NT;
    const fr = frameFrom(tp, ty, tpch);
    tp = add3(tp, mul3(fr.f, sp.tail / NT));
    tail.push(frameFrom(tp, ty, tpch));
  }
  return {sp, spine, neck, head, scap, legs, tail, pose: P};
}

/** IK analítica de 2 huesos en 3D. `sign` +1: la articulación apunta hacia delante (rodilla), −1 atrás (codo). */
export function ik2(a: V3, c: V3, l1: number, l2: number, fwd: V3, sign: 1 | -1): V3 {
  const ac = sub3(c, a);
  const d = clamp(len3(ac), Math.abs(l1 - l2) + 1e-4, l1 + l2 - 1e-4);
  const dir = norm3(ac);
  const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const ang = Math.acos(cosA);
  // vector perpendicular a dir en el plano (dir, fwd) hacia el lado del polo
  const pole = mul3(fwd, sign);
  let perp = sub3(pole, mul3(dir, pole.x * dir.x + pole.y * dir.y + pole.z * dir.z));
  if (len3(perp) < 1e-6) perp = v3(0, 0, 1);
  perp = norm3(perp);
  return add3(a, add3(mul3(dir, Math.cos(ang) * l1), mul3(perp, Math.sin(ang) * l1)));
}

/** Pose de estación con los pies bajo cadera y hombros (posición neutra de cada pie). */
export function neutralFeet(sp: Species, x: number, z: number, ground = 0, crouch = 0): Record<LegId, V3> {
  const slope = Math.asin(clamp((sp.withersH - sp.hipH) / sp.torso, -0.5, 0.5));
  const reach = sp.torso * Math.cos(slope);
  const ks = sp.torso / 0.66;
  const o = {} as Record<LegId, V3>;
  for (const id of LEGS) {
    const s = id[0] === 'R' ? 1 : -1;
    const hind = id[1] === 'H';
    const along = hind ? -0.02 * ks + sp.paw * 0.45 - crouch * 0.03 * ks : reach + 0.035 * ks + sp.paw * 0.4 + crouch * 0.02 * ks;
    o[id] = v3(x + along, ground, z + s * (hind ? sp.hipW : sp.shW) * 0.92);
  }
  return o;
}
export function standPose(sp: Species, crouch = 0): Pose {
  const P = basePose();
  P.crouch = crouch;
  P.root = v3(0, sp.hipH * (1 - crouch * 0.42), 0);
  const f = neutralFeet(sp, 0, 0, 0, crouch);
  for (const id of LEGS) P.legs[id] = {target: f[id], pawPitch: 0, contact: 1};
  return P;
}
export const _unused = {len3};
