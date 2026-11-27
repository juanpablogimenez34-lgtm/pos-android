// SISTEMA DE MOVIMIENTO (principio de los brazos independientes del pulpo, aplicado a 4 patas):
// cada pata tiene su fase, apoyo FIJO en el suelo (sin deslizamiento) y balanceo en arco hasta el siguiente
// apoyo. La columna se flexiona y extiende en la carrera; la cabeza se estabiliza; la cola equilibra.
// Estados: RESTING, WALKING, RUNNING, STALKING, CROUCHING, JUMPING, LANDING, CLIMBING, DRINKING, ALERT, CUB_PLAYING.
// Todo es determinista: la locomoción se precalcula una vez por plano (memorizada) y se consulta por tiempo.
import {clamp, hash1, lerp, noise1, smoothstep} from '../../../engine/math';
import {basePose, LegId, LEGS, LegPose, neutralFeet, Pose, Species} from './rig';
import {v3, V3} from './space';

export type Gait = 'walk' | 'stalk' | 'trot' | 'gallop';
const GAIT: Record<Gait, {duty: number; off: Record<LegId, number>; lift: number; bob: number; base: number}> = {
  walk: {duty: 0.64, off: {LH: 0, LF: 0.25, RH: 0.5, RF: 0.75}, lift: 0.07, bob: 0.012, base: 1.25}, // secuencia lateral de 4 tiempos
  stalk: {duty: 0.8, off: {LH: 0, LF: 0.25, RH: 0.5, RF: 0.75}, lift: 0.045, bob: 0.004, base: 0.9},
  trot: {duty: 0.48, off: {LH: 0, RF: 1.0, RH: 0.5, LF: 0.5}, lift: 0.1, bob: 0.02, base: 1.55},
  gallop: {duty: 0.32, off: {LH: 0, RH: 0.1, LF: 0.5, RF: 0.62}, lift: 0.15, bob: 0.05, base: 1.9}, // galope rotatorio con suspensión
};
type GP = {duty: number; off: Record<LegId, number>; lift: number; bob: number; base: number};
function gaitParams(gait: (t: number) => Gait, t: number): GP {
  const o: GP = {duty: 0, off: {LH: 0, RH: 0, LF: 0, RF: 0}, lift: 0, bob: 0, base: 0};
  for (let k = 0; k < 7; k++) {
    const G = GAIT[gait(t + (k - 3) * 0.1)];
    o.duty += G.duty / 7;
    o.lift += G.lift / 7;
    o.bob += G.bob / 7;
    o.base += G.base / 7;
    for (const id of LEGS) o.off[id] += G.off[id] / 7;
  }
  return o;
}

export type LocoSample = {D: number; speed: number; legs: Record<LegId, LegPose>; bob: number; phase: number; gait: Gait; gallopK: number};
export type Locomotion = {at: (t: number) => LocoSample; t0: number; t1: number};

/**
 * Locomoción en línea recta a lo largo de +x (coordenadas del animal; la cámara puede orbitar).
 * speed(t) en m/s; gait(t) marcha. Los apoyos se registran al empezar y quedan fijos.
 */
export function makeLocomotion(sp: Species, t0: number, t1: number, speed: (t: number) => number, gait: (t: number) => Gait, x0 = 0, ground: (x: number) => number = () => 0): Locomotion {
  const dt = 1 / 120;
  const n = Math.ceil((t1 - t0) / dt) + 240;
  const D = new Float64Array(n);
  const PH = new Float64Array(n);
  const LEN = sp.femur + sp.tibia + sp.metatarsus;
  const strideOf = (v: number, G: GP) => LEN * G.base * (0.75 + 0.25 * Math.min(1, v / 1.2)) + smoothstep(1.55, 1.9, G.base) * v * 0.06 * (sp.torso / 0.66);
  const plants: Record<LegId, {i: number; D: number}[]> = {LH: [], RH: [], LF: [], RF: []};
  const prev: Record<LegId, number> = {LH: -1, RH: -1, LF: -1, RF: -1};
  const p0: Record<LegId, number> = {LH: 0, RH: 0, LF: 0, RF: 0};
  const prevDuty: Record<LegId, number> = {LH: 1, RH: 1, LF: 1, RF: 1};
  let d = 0;
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = t0 + i * dt;
    const G = gaitParams(gait, t);
    const v = Math.max(0, speed(t));
    const L = strideOf(v, G);
    D[i] = d;
    PH[i] = ph;
    for (const id of LEGS) {
      const p = (((ph + G.off[id]) % 1) + 1) % 1;
      // nuevo apoyo cada vez que la pata pasa de balanceo a apoyo (también si la marcha cambia las fases)
      const inSt = p < G.duty;
      if (prev[id] >= 0 && inSt && (prev[id] >= prevDuty[id] || p < prev[id] - 0.5)) plants[id].push({i, D: d + (G.duty * 0.5 - p) * L});
      prevDuty[id] = G.duty;
      if (i === 0) {
        plants[id].push({i: -1, D: d});
        p0[id] = p;
      }
      prev[id] = p;
    }
    d += v * dt;
    ph += (v / Math.max(0.05, L)) * dt;
  }
  const neutral = neutralFeet(sp, 0, 0);
  const idx = (t: number) => clamp(Math.round((t - t0) / dt), 0, n - 1);
  return {
    t0,
    t1,
    at: (t: number) => {
      const i = idx(t);
      const g = gait(t);
      const G = gaitParams(gait, t);
      const v = Math.max(0, speed(t));
      const legs = {} as Record<LegId, LegPose>;
      for (const id of LEGS) {
        const p = (((PH[i] + G.off[id]) % 1) + 1) % 1;
        const list = plants[id];
        let k = list.length - 1;
        while (k > 0 && list[k].i > i) k--;
        const cur = list[k];
        const foot = (Dd: number) => {
          const x = x0 + Dd + neutral[id].x;
          return v3(x, ground(x), neutral[id].z);
        };
        if (p < G.duty) legs[id] = {target: foot(cur.D), pawPitch: 0, contact: 1};
        else {
          const sw0 = k === 0 && p0[id] >= G.duty && p >= p0[id] ? p0[id] : G.duty;
          const s = clamp((p - sw0) / (1 - sw0));
          const next = k + 1 < list.length ? list[k + 1].D : cur.D + strideOf(v, G);
          const e = s * s * (3 - 2 * s);
          const f = foot(lerp(cur.D, next, e));
          const h = Math.sin(Math.PI * s) * G.lift * (sp.femur + sp.tibia) * 1.6 * smoothstep(0, 0.3, v);
          f.y += h;
          legs[id] = {target: f, pawPitch: Math.sin(Math.PI * s) * 0.9 * smoothstep(0, 0.3, v), contact: 0};
        }
      }
      const bob = Math.cos(PH[i] * Math.PI * 4) * G.bob * (sp.hipH / 0.58) * Math.min(1, v / 0.5);
      return {D: D[i], speed: v, legs, bob, phase: PH[i], gait: g, gallopK: smoothstep(1.56, 1.9, G.base)};
    },
  };
}

/** Parpadeo natural cada 2,5–5,5 s (determinista). */
export function blinkAt(t: number, seed = 1) {
  let acc = 0.7 + hash1(seed) * 1.5;
  let i = 0;
  while (acc < t + 1) {
    const dd = t - acc;
    if (dd >= 0 && dd < 0.22) return Math.sin((dd / 0.22) * Math.PI);
    acc += 2.5 + hash1(seed * 13 + i++) * 3;
  }
  return 0;
}
export const breathAt = (t: number, period = 3.2) => 0.5 + 0.5 * Math.sin((t / period) * Math.PI * 2);
export function earsAt(t: number, alert: number, seed = 3) {
  const tw = (s: number) => {
    const nz = noise1(t * 0.9, s) * 0.5 + 0.5;
    return nz > 0.8 ? -smoothstep(0.8, 0.9, nz) * 0.7 : 0;
  };
  return {earL: lerp(0.2, 0.9, alert) + noise1(t * 0.5, seed) * 0.15 + tw(seed + 10), earR: lerp(0.2, 0.9, alert) + noise1(t * 0.5, seed + 4) * 0.15 + tw(seed + 20)};
}

export type Mood = {crouch?: number; alert?: number; look?: number; lookPitch?: number; seed?: number; tailMood?: number};
/** Pose completa a partir de la locomoción, con animación secundaria (respiración, parpadeo, orejas, cola). */
export function locoPose(sp: Species, loco: Locomotion, t: number, m: Mood = {}, x0 = 0, ground: (x: number) => number = () => 0): Pose {
  const st = loco.at(t);
  const P = basePose();
  const crouch = m.crouch ?? 0;
  const ph = st.phase;
  const gk = st.gallopK;
  const sc = sp.hipH / 0.58;
  let flex = 0;
  let pitch = 0;
  let bob = st.bob;
  let roll = 0;
  if (gk > 0.01) {
    flex = Math.cos(Math.PI * 2 * (ph - 0.95)) * 0.9 * gk;
    pitch = Math.sin(Math.PI * 2 * (ph - 0.2)) * 0.09 * gk;
    bob = lerp(bob, ((Math.cos(Math.PI * 2 * (ph - 0.45)) * 0.5 + 0.5) * 0.07 - 0.035) * sc, gk);
  } else {
    roll = Math.sin(Math.PI * 2 * ph) * 0.035 * smoothstep(0, 0.5, st.speed);
    flex = Math.sin(Math.PI * 4 * ph + 0.6) * 0.05 * smoothstep(0, 0.5, st.speed);
  }
  const hindY = (st.legs.LH.target.y + st.legs.RH.target.y) * 0.5;
  const foreY = (st.legs.LF.target.y + st.legs.RF.target.y) * 0.5;
  pitch += Math.atan2(foreY - hindY, sp.torso) * 0.9;
  const gx = x0 + st.D;
  const gy = ground(gx);
  P.root = v3(gx, gy + sp.hipH * (1 - (crouch + gk * 0.12) * 0.42) + bob, 0);
  P.pitch = pitch;
  P.roll = roll;
  P.flex = flex + crouch * 0.12;
  P.crouch = crouch;
  P.legs = st.legs;
  const alert = m.alert ?? 0;
  P.neckPitch = -crouch * 0.3 + alert * 0.15 - gk * 0.2 + Math.sin(Math.PI * 4 * ph) * 0.03 * (1 - gk);
  P.headPitch = -pitch * 0.8 + (m.lookPitch ?? 0) + crouch * 0.25 + gk * 0.1;
  P.headYaw = (m.look ?? 0) * 0.55;
  P.neckYaw = (m.look ?? 0) * 0.45;
  P.eyeX = (m.look ?? 0) * 1.5;
  P.blink = blinkAt(t, m.seed ?? 1) * (1 - alert * 0.5);
  const ears = earsAt(t, Math.max(alert, crouch), m.seed ?? 3);
  P.earL = ears.earL;
  P.earR = ears.earR;
  P.breathe = breathAt(t, gk > 0.5 ? 0.7 : 2.6);
  const mood = m.tailMood ?? crouch;
  P.tailBase = lerp(lerp(-1.0, -0.6, mood) + Math.sin(Math.PI * 2 * ph) * 0.05, -0.2 + Math.sin(Math.PI * 2 * ph) * 0.15, gk);
  P.tailCurl = lerp(lerp(1.3, 0.7, mood), 0.35 + Math.sin(Math.PI * 2 * (ph - 0.3)) * 0.35, gk);
  P.tailAmp = 0.1 + mood * 0.12;
  P.tailWave = t * (1.6 + mood * 3) + ph * Math.PI;
  return P;
}

/** Secundarios sobre una pose estática (reposo, alerta, mirar). */
export function idle(P: Pose, t: number, o: {alert?: number; look?: number; seed?: number; breath?: number} = {}) {
  const alert = o.alert ?? 0;
  P.breathe = breathAt(t, o.breath ?? 3.2);
  P.blink = Math.max(P.blink, blinkAt(t, o.seed ?? 1) * (1 - alert * 0.4));
  const e = earsAt(t, alert, o.seed ?? 3);
  P.earL = e.earL;
  P.earR = e.earR;
  P.root = v3(P.root.x, P.root.y + (P.breathe - 0.5) * 0.004 * (P.root.y / 0.58), P.root.z);
  P.roll += noise1(t * 0.3, 7) * 0.015;
  P.headYaw += (o.look ?? 0) + noise1(t * 0.4, 9) * 0.06;
  P.headPitch += noise1(t * 0.35, 11) * 0.03;
  P.eyeX = (o.look ?? 0) * 2;
  P.tailWave = t * 1.3;
  P.tailAmp = 0.12 + alert * 0.1;
  return P;
}

/** Mezcla de dos poses (transición suave entre estados). */
export function blendPose(A: Pose, B: Pose, k: number): Pose {
  const u = clamp(k);
  if (u <= 0) return A;
  if (u >= 1) return B;
  const P = basePose();
  for (const key of Object.keys(A) as (keyof Pose)[]) {
    const a = A[key];
    const b = B[key];
    if (typeof a === 'number' && typeof b === 'number') (P as Record<string, unknown>)[key] = lerp(a, b, u);
  }
  P.root = lerpV(A.root, B.root, u);
  for (const id of LEGS) P.legs[id] = {target: lerpV(A.legs[id].target, B.legs[id].target, u), pawPitch: lerp(A.legs[id].pawPitch, B.legs[id].pawPitch, u), contact: lerp(A.legs[id].contact, B.legs[id].contact, u)};
  return P;
}
const lerpV = (a: V3, b: V3, t: number) => v3(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);

// ------------------------------------------------------------------ SALTO (10 fases)
export type JumpSpec = {t0: number; fromX: number; toX: number; fromY: number; toY: number; apex: number; tLook: number; tPrep: number; tAir: number; tLand: number};
/**
 * 1 observa el objetivo · 2 baja el cuerpo · 3 flexiona las traseras · 4 acumula impulso · 5 extiende ·
 * 6 despega · 7 columna en vuelo · 8 prepara las manos · 9 aterriza · 10 absorbe el impacto.
 * Los pies no se mueven en la preparación; las manos tocan primero; las traseras aterrizan después.
 */
export function jumpPose(sp: Species, J: JumpSpec, t: number, feet0?: Record<LegId, V3>): {pose: Pose; phase: number} {
  const P = basePose();
  const ks = sp.torso / 0.66;
  const nf0 = neutralFeet(sp, J.fromX, 0, J.fromY);
  const nf1 = neutralFeet(sp, J.toX, 0, J.toY);
  const tP = J.t0 + J.tLook; // empieza la preparación
  const tT = tP + J.tPrep; // despegue
  const tL = tT + J.tAir; // contacto de las manos
  let phase = 1;
  const legs = {} as Record<LegId, LegPose>;
  if (t < tT) {
    const look = clamp((t - J.t0) / J.tLook);
    const u = clamp((t - tP) / J.tPrep);
    const lower = smoothstep(0, 0.35, u); // 2
    const coil = smoothstep(0.3, 0.8, u); // 3-4
    const push = smoothstep(0.82, 1, u); // 5
    phase = u <= 0 ? 1 : u < 0.35 ? 2 : u < 0.6 ? 3 : u < 0.82 ? 4 : 5;
    const crouch = lower * 0.75 * (1 - push) + coil * 0.2 * (1 - push);
    P.crouch = crouch;
    P.root = v3(J.fromX - coil * 0.06 * ks * (1 - push) + push * 0.08 * ks, J.fromY + sp.hipH * (1 - crouch * 0.42) + push * sp.hipH * 0.12, 0);
    P.pitch = coil * 0.06 + push * 0.1;
    P.flex = coil * 0.45 * (1 - push) - push * 0.3;
    for (const id of LEGS) legs[id] = {target: feet0 ? {...feet0[id]} : nf0[id], pawPitch: id[1] === 'H' ? push * 0.6 : 0, contact: 1};
    P.neckPitch = -crouch * 0.3 + look * 0.1;
    P.headPitch = crouch * 0.3 + (J.toY - J.fromY) * 0.6 * look;
    P.tailBase = -0.7 - coil * 0.25 + push * 0.4;
    P.tailCurl = 0.9 - coil * 0.3;
    P.tailAmp = 0.05 + coil * 0.25;
    P.earL = P.earR = 0.9;
  } else if (t < tL) {
    const u = clamp((t - tT) / J.tAir);
    phase = u < 0.25 ? 6 : u < 0.65 ? 7 : 8;
    const x = lerp(J.fromX, J.toX, u);
    const yb = lerp(J.fromY, J.toY, u);
    const h = Math.sin(Math.PI * u) * J.apex + (J.toY - J.fromY) * 0 ;
    P.root = v3(x + 0.08 * ks, yb + sp.hipH * (0.95 + 0.1 * u) + h, 0);
    P.pitch = lerp(0.14, -0.2, u);
    P.flex = lerp(-0.5, -0.05, smoothstep(0.2, 0.9, u)) + Math.sin(Math.PI * u) * 0.25;
    for (const id of LEGS) {
      const hind = id[1] === 'H';
      const base = hind ? nf0[id] : nf1[id];
      // traseras estiradas atrás tras el impulso y recogidas al final; manos adelantadas y extendidas
      const off = hind ? lerp(-0.3, -0.05, smoothstep(0.3, 0.9, u)) * ks : lerp(0.15, 0.32, smoothstep(0.4, 0.9, u)) * ks;
      const drop = hind ? sp.hipH * lerp(0.55, 0.75, u) : sp.withersH * lerp(0.45, 0.85, smoothstep(0.45, 0.95, u));
      const f = v3(P.root.x + (base.x - (hind ? J.fromX : J.toX)) + off, P.root.y - drop, base.z);
      legs[id] = {target: f, pawPitch: hind ? lerp(0.9, 0.3, u) : lerp(-0.3, 0.1, u), contact: 0};
    }
    P.neckPitch = lerp(0.05, -0.1, u);
    P.headPitch = lerp(0.0, -0.15, u);
    P.tailBase = lerp(-0.25, 0.25, u);
    P.tailCurl = lerp(0.3, 0.8, u);
    P.tailAmp = 0.05;
    P.earL = P.earR = 0.6;
  } else {
    const u = clamp((t - tL) / J.tLand);
    phase = u < 0.45 ? 9 : 10;
    const absorb = Math.sin(Math.PI * clamp(u / 0.6)) * (1 - smoothstep(0.6, 1, u));
    P.root = v3(J.toX + lerp(0.1, 0, smoothstep(0, 0.8, u)) * ks, J.toY + sp.hipH * (1 - absorb * 0.32), 0);
    P.crouch = absorb * 0.5;
    P.pitch = lerp(-0.22, 0, smoothstep(0, 0.8, u));
    P.flex = lerp(0.35, 0, smoothstep(0.2, 1, u));
    for (const id of LEGS) {
      const hind = id[1] === 'H';
      const land = hind ? clamp(u / 0.35) : 1;
      const f = {...nf1[id]};
      if (hind && land < 1) {
        f.x += -0.25 * ks * (1 - land);
        f.y += Math.sin(Math.PI * land) * 0.08 * ks;
      }
      legs[id] = {target: f, pawPitch: 0, contact: hind ? land : 1};
    }
    P.neckPitch = -absorb * 0.25;
    P.headPitch = absorb * 0.2;
    P.tailBase = lerp(0.2, -0.9, smoothstep(0, 1, u));
    P.tailCurl = lerp(0.8, 1.2, u);
    P.tailAmp = 0.15 * (1 - u);
    P.earL = P.earR = 0.5;
  }
  P.legs = legs;
  P.breathe = 0.5;
  return {pose: P, phase};
}
export const _keep = {noise1};
