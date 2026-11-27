// SISTEMA DE MOVIMIENTO DEL CAMALEÓN (principio de los brazos independientes del pulpo, aplicado a 4 patas):
// · Marcha en pares diagonales ligeramente desfasados (delantera cercana + trasera lejana, y viceversa).
// · Cada pie tiene su fase, se PLANTA en la rama (queda fijo mientras apoya), se eleva en arco abriendo los dedos y
//   vuelve a cerrarlos al sujetar la rama siguiente. Sin deslizamientos: los apoyos se precalculan.
// · Balanceo característico de vaivén (el cuerpo oscila adelante y atrás antes de cada paso).
// · Estados: RESTING, CRAWLING, EXPLORING, CLIMBING, LOOKING_AROUND, TARGET_LOCK, TONGUE_ATTACK, FEEDING,
//   COLOR_CHANGING, THREATENED, HIDING (ver states.ts).
import {clamp, hash1, lerp, noise1, smoothstep} from '../../../engine/math';
import {CHAM_ANCHORS, ChamPose, LegKey, V} from './Chameleon';
import {ColorState} from './skin';

export type Branch = {pts: V[]; r: number};
/** Centro de la rama en x (interpolación lineal entre puntos ordenados por x) y pendiente. */
export function branchAt(b: Branch, x: number) {
  const p = b.pts;
  let i = 0;
  while (i < p.length - 2 && x > p[i + 1].x) i++;
  const a = p[i];
  const c = p[i + 1];
  const u = clamp((x - a.x) / (c.x - a.x || 1), -0.5, 1.5);
  // suavizado con los vecinos (Catmull-Rom en y)
  const p0 = p[Math.max(0, i - 1)];
  const p3 = p[Math.min(p.length - 1, i + 2)];
  const uu = clamp(u);
  const y = 0.5 * (2 * a.y + (-p0.y + c.y) * uu + (2 * p0.y - 5 * a.y + 4 * c.y - p3.y) * uu * uu + (-p0.y + 3 * a.y - 3 * c.y + p3.y) * uu * uu * uu);
  const slope = Math.atan2(c.y - a.y, c.x - a.x);
  return {y, slope, top: y - b.r};
}

const LEGS: LegKey[] = ['FN', 'HF', 'FF', 'HN'];
const OFF: Record<LegKey, number> = {FN: 0, HF: 0.07, FF: 0.5, HN: 0.57};
const DUTY = 0.76;

export type Walk = {at: (t: number) => {x: number; D: number; feet: Record<LegKey, {p: V; grip: number}>; phase: number; speed: number}};
/**
 * Marcha a lo largo de la rama: x0 = posición inicial del origen del cuerpo (cadera); speed(t) px/s.
 * stride en px a escala 1 (se multiplica por la escala del animal).
 */
export function makeWalk(b: Branch, scale: number, facing: 1 | -1, x0: number, t0: number, t1: number, speed: (t: number) => number, stride = 62): Walk {
  const dt = 1 / 120;
  const n = Math.ceil((t1 - t0) / dt) + 240;
  const D = new Float64Array(n);
  const PH = new Float64Array(n);
  const L = stride * scale;
  const plants: Record<LegKey, {i: number; D: number}[]> = {FN: [], HF: [], FF: [], HN: []};
  const prev: Record<LegKey, number> = {FN: -1, HF: -1, FF: -1, HN: -1};
  let d = 0;
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = t0 + i * dt;
    const v = Math.max(0, speed(t));
    D[i] = d;
    PH[i] = ph;
    for (const k of LEGS) {
      const p = (((ph + OFF[k]) % 1) + 1) % 1;
      if (i === 0) plants[k].push({i: -1, D: 0});
      else if (p < DUTY && prev[k] >= DUTY) plants[k].push({i, D: d + (DUTY * 0.5 - p) * L});
      prev[k] = p;
    }
    // el avance del cuerpo se concentra en la fase de apoyo de cada par (marcha a impulsos)
    const pulse = 0.55 + 0.45 * Math.cos(ph * Math.PI * 4);
    d += v * dt * pulse;
    ph += ((v * pulse) / Math.max(1, L)) * dt;
  }
  const anchor = (k: LegKey) => {
    const a = k[0] === 'F' ? CHAM_ANCHORS.SHOULDER.x + 6 : CHAM_ANCHORS.HIP.x - 4;
    return (a + (k[1] === 'F' ? (k[0] === 'F' ? -10 : 10) : 0)) * scale * facing;
  };
  const idx = (t: number) => clamp(Math.round((t - t0) / dt), 0, n - 1);
  return {
    at: (t: number) => {
      const i = idx(t);
      const v = Math.max(0, speed(t));
      const feet = {} as Record<LegKey, {p: V; grip: number}>;
      for (const k of LEGS) {
        const p = (((PH[i] + OFF[k]) % 1) + 1) % 1;
        const list = plants[k];
        let j = list.length - 1;
        while (j > 0 && list[j].i > i) j--;
        const cur = list[j];
        const footX = (Dd: number) => x0 + Dd * facing + anchor(k);
        if (p < DUTY) {
          const x = footX(cur.D);
          feet[k] = {p: {x, y: branchAt(b, x).top}, grip: 1};
        } else {
          const s = (p - DUTY) / (1 - DUTY);
          const next = j + 1 < list.length ? list[j + 1].D : cur.D + L;
          const e = s * s * (3 - 2 * s);
          const x = footX(lerp(cur.D, next, e));
          const lift = Math.sin(Math.PI * s) * 20 * scale * smoothstep(0, 4, v);
          feet[k] = {p: {x, y: branchAt(b, x).top - lift}, grip: 1 - Math.sin(Math.PI * clamp(s * 1.15)) * smoothstep(0, 4, v)};
        }
      }
      return {x: x0 + D[i] * facing, D: D[i], feet, phase: PH[i], speed: v};
    },
  };
}

/** Pies en reposo sobre la rama alrededor del cuerpo. */
export function restFeet(b: Branch, x: number, scale: number, facing: 1 | -1, spread = 0) {
  const feet = {} as Record<LegKey, {p: V; grip: number}>;
  for (const k of LEGS) {
    const a = (k[0] === 'F' ? CHAM_ANCHORS.SHOULDER.x + 6 + spread : CHAM_ANCHORS.HIP.x - 4 - spread) + (k[1] === 'F' ? (k[0] === 'F' ? -10 : 10) : 0);
    const fx = x + a * scale * facing;
    feet[k] = {p: {x: fx, y: branchAt(b, fx).top}, grip: 1};
  }
  return feet;
}

export const LEG_H = 74; // altura de la cadera sobre la rama (escala 1)

/** Ojo → objetivo: yaw/pitch relativos a la orientación del animal. */
export function lookAt(eyeWorld: V, target: V, facing: 1 | -1, angle: number) {
  const dx = (target.x - eyeWorld.x) * facing;
  const dy = target.y - eyeWorld.y;
  const a = Math.atan2(dy, dx) - angle * facing;
  return {yaw: clamp(Math.cos(a) * 1.2, -1.3, 1.3), pitch: clamp(-Math.sin(a) * 1.2, -1.1, 1.1)};
}
/** Mirada exploratoria independiente (sacadas deterministas). */
export function scanEye(t: number, seed: number) {
  const k = Math.floor(t / 1.3 + hash1(seed) * 3);
  const a = hash1(k * 7.3 + seed);
  const b = hash1(k * 3.9 + seed * 2);
  const tgt = {yaw: (a - 0.5) * 2.4, pitch: (b - 0.5) * 1.6};
  const prevA = hash1((k - 1) * 7.3 + seed);
  const prevB = hash1((k - 1) * 3.9 + seed * 2);
  const u = smoothstep(0, 0.18, (t / 1.3 + hash1(seed) * 3) - k); // sacada rápida
  return {yaw: lerp((prevA - 0.5) * 2.4, tgt.yaw, u) + noise1(t * 2, seed) * 0.04, pitch: lerp((prevB - 0.5) * 1.6, tgt.pitch, u)};
}

/**
 * Ataque con la lengua (8 fases): 1 detección · 2 orientación de los ojos · 3 ajuste de postura · 4 apertura de la
 * boca · 5 proyección · 6 contacto · 7 retracción · 8 cierre. `slow` alarga la proyección (cámara lenta).
 */
export function strike(t: number, t0: number, slow = 1) {
  const tDetect = t0;
  const tAim = t0 + 0.6;
  const tPose = t0 + 1.2;
  const tOpen = t0 + 1.8;
  const tLaunch = t0 + 2.3;
  const launch = 0.12 * slow;
  const tHit = tLaunch + launch;
  const hold = 0.08 * slow;
  const retract = 0.3 * slow;
  const tBack = tHit + hold + retract;
  const tClose = tBack + 0.35;
  let phase = 0;
  if (t >= tDetect) phase = 1;
  if (t >= tAim) phase = 2;
  if (t >= tPose) phase = 3;
  if (t >= tOpen) phase = 4;
  if (t >= tLaunch) phase = 5;
  if (t >= tHit) phase = 6;
  if (t >= tHit + hold) phase = 7;
  if (t >= tBack) phase = 8;
  if (t >= tClose + 0.6) phase = 9; // masticar / alimentarse
  const lean = smoothstep(tPose, tOpen, t) * (1 - smoothstep(tBack, tClose + 0.5, t));
  const jaw = smoothstep(tOpen, tLaunch, t) * 0.75 * (1 - smoothstep(tBack, tClose, t)) + (phase === 9 ? Math.max(0, Math.sin((t - tClose - 0.6) * 9)) * 0.18 * (1 - smoothstep(tClose + 0.6, tClose + 2.4, t)) : 0);
  let ext = 0;
  if (t >= tOpen && t < tLaunch) ext = smoothstep(tOpen, tLaunch, t) * 0.04; // la punta asoma
  else if (t >= tLaunch && t < tHit) ext = 0.04 + 0.96 * Math.pow(clamp((t - tLaunch) / launch), 0.55);
  else if (t >= tHit && t < tHit + hold) ext = 1;
  else if (t >= tHit + hold && t < tBack) ext = 1 - Math.pow(clamp((t - tHit - hold) / retract), 0.8);
  const caught = t >= tHit;
  const bulge = t >= tLaunch && t < tHit ? 1.15 : 1;
  return {phase, jaw, ext, caught, lean, tHit, tBack, tClose, bulge};
}

export type StateName = 'RESTING' | 'CRAWLING' | 'EXPLORING' | 'CLIMBING' | 'LOOKING_AROUND' | 'TARGET_LOCK' | 'TONGUE_ATTACK' | 'FEEDING' | 'COLOR_CHANGING' | 'THREATENED' | 'HIDING';

/** Pose base sobre una rama a partir de una posición x y unos pies (marcha o reposo). */
export function poseOn(b: Branch, x: number, feet: Record<LegKey, {p: V; grip: number}>, o: {scale: number; facing: 1 | -1; t: number; color: ColorState; age?: number; rock?: number; tail?: Partial<ChamPose['tail']>; lift?: number}): ChamPose {
  const s = o.scale;
  const mid = x + 100 * s * o.facing;
  const br = branchAt(b, mid);
  const rock = (o.rock ?? 0) * s;
  const y = br.top - (LEG_H + (o.lift ?? 0)) * s;
  return {
    x: x + rock * o.facing, y, angle: br.slope * (o.facing > 0 ? 1 : 1), scale: s, facing: o.facing,
    feet: Object.fromEntries(Object.entries(feet).map(([k, f]) => [k, {p: f.p, grip: f.grip}])) as ChamPose['feet'],
    breathe: 0.5 + 0.5 * Math.sin(o.t * 1.6), bend: Math.sin(o.t * 0.7) * 0.02, headPitch: 0,
    eyeN: {yaw: 0.4, pitch: 0}, eyeF: {yaw: -0.3, pitch: 0.2}, jaw: 0,
    tail: {base: 0.55, curl: 0.55, wave: o.t * 0.8, amp: 0.25, ...(o.tail ?? {})},
    color: o.color, age: o.age ?? 1, blink: 0,
  };
}
