// Comportamiento de la mosca: FLYING, HOVERING, LANDING, WALKING, GROOMING, EXPLORING,
// TRIGGER_CONTACT, ESCAPE_ATTEMPT, TRAPPED (y restos secos tras la digestión).
// Todo es función del tiempo: mismo fotograma → misma postura en cualquier proceso.
import {clamp, fbm1, lerp, smoothstep} from '../../../engine/math';
import {keys, pulse, track} from '../../../engine/timeline';
import {hairTip, lobeSurface, TrapGeo} from '../anatomy/flytrap';
import {bodyFrame, footOnSurface, makeWalk, Surface, walkHeading, walkPos, WalkPath} from '../anatomy/locomotion';
import {add, cross, lerp3, norm, scl, sub, V3} from '../anatomy/proj';
import {FlyPose} from '../characters/Fly';
import {LEAF} from '../scenes/leaf';
import {EV, storyT} from '../timeline';
import {HAIR1, HAIR2} from './trapStates';

export type FlyState = 'HIDDEN' | 'FLYING' | 'HOVERING' | 'LANDING' | 'WALKING' | 'GROOMING' | 'EXPLORING' | 'TRIGGER_CONTACT' | 'ESCAPE_ATTEMPT' | 'TRAPPED' | 'DIGESTED';

/** Apoyos de las seis patas (adelante, lateral) y grupos del trípode alterno. */
const REST: {fwd: number; side: number; group: 0 | 1}[] = [
  {fwd: 23, side: 14, group: 0}, // L1
  {fwd: 23, side: -14, group: 1}, // R1
  {fwd: 4, side: 21, group: 1}, // L2
  {fwd: 4, side: -21, group: 0}, // R2
  {fwd: -17, side: 17, group: 0}, // L3
  {fwd: -17, side: -17, group: 1}, // R3
];
const STRIDE = 17;
const BODY_H = 11;

// ------------------------------------------------------------------ VUELO
const LAND_A = 150;
const landP = LEAF.point(LAND_A, 0);
const landN = LEAF.normal(LAND_A, 0);
const HOVER: V3 = add(landP, scl(landN, 75));
const AIR: [number, V3][] = [
  [20.0, [820, 520, -760]],
  [22.0, [520, 450, -420]],
  [24.0, [180, 400, -60]],
  [25.6, [-150, 360, 230]],
  [27.2, [-460, 300, 430]],
  [28.6, [HOVER[0] + 60, HOVER[1] + 20, HOVER[2] - 30]],
  [29.4, HOVER],
  [30.4, add(HOVER, [6, -6, 4])],
  [31.6, add(landP, scl(landN, BODY_H))],
];
const AX = keys(AIR.map(([t, p]) => [t, p[0]] as [number, number]));
const AY = keys(AIR.map(([t, p]) => [t, p[1]] as [number, number]));
const AZ = keys(AIR.map(([t, p]) => [t, p[2]] as [number, number]));
const airPos = (t: number): V3 => {
  // trayectoria irregular pero controlada: ruido que se apaga al estabilizarse y aterrizar
  const wob = 1 - smoothstep(28.4, 29.6, t);
  const hov = smoothstep(29.0, 29.6, t) * (1 - smoothstep(30.4, 31.2, t));
  return [
    track(AX, t) + fbm1(t * 1.6, 3) * 34 * wob + Math.sin(t * 9.3) * 2.5 * hov,
    track(AY, t) + fbm1(t * 2.1, 7) * 26 * wob + Math.sin(t * 7.1 + 1) * 2.2 * hov,
    track(AZ, t) + fbm1(t * 1.3, 11) * 30 * wob,
  ];
};

// ------------------------------------------------------------------ CAMINAR SOBRE LA HOJA
const LEAF_WALK = makeWalk([
  [31.6, LAND_A, 0],
  [33.0, LAND_A, 0],
  [34.2, LAND_A + 18, 7],
  [40.0, LAND_A + 18, 7],
  [45.6, 470, -4],
]);

// ------------------------------------------------------------------ SOBRE EL LÓBULO DE LA TRAMPA
/** Lóbulo por el que camina la mosca (el del fondo en el plano interior). */
export const WALK_S: 1 | -1 = 1;
const uv = (u: number, v: number): [number, number] => [u, v];
const LOBE_KEYS: [number, [number, number]][] = [
  [57.8, uv(0.06, 1.32)],
  [59.4, uv(0.05, 0.98)],
  [60.3, uv(0.07, 0.86)],
  [62.2, uv(0.07, 0.86)],
  [64.0, uv(-0.12, 0.74)],
  [68.0, uv(-0.12, 0.74)],
  [71.4, uv(-0.32, 0.56)],
  [73.0, uv(-0.28, 0.6)],
  [76.4, uv(0.26, 0.58)],
  [78.4, uv(0.4, 0.62)],
];
export function lobeWalkSurface(g: TrapGeo): Surface {
  const L2 = g.spec.L / 2;
  const W = g.spec.W;
  return {
    id: 'lobe',
    point: (a, b) => lobeSurface(g, WALK_S, clamp(a / L2, -0.98, 0.98) * WALK_S, Math.max(0, b / W)).p,
    normal: (a, b) => lobeSurface(g, WALK_S, clamp(a / L2, -0.98, 0.98) * WALK_S, clamp(b / W, 0.02, 1)).n,
  };
}
let lobeWalkCache: {L: number; W: number; w: WalkPath} | null = null;
const lobeWalk = (g: TrapGeo) => {
  if (!lobeWalkCache || lobeWalkCache.L !== g.spec.L || lobeWalkCache.W !== g.spec.W) {
    lobeWalkCache = {L: g.spec.L, W: g.spec.W, w: makeWalk(LOBE_KEYS.map(([t, [u, v]]) => [t, (u * g.spec.L) / 2, v * g.spec.W]))};
  }
  return lobeWalkCache.w;
};

// ------------------------------------------------------------------ ESTADOS
export function flyState(t: number): FlyState {
  const s = storyT(t);
  if (s < EV.flyIn) return 'HIDDEN';
  if (s < EV.hover) return 'FLYING';
  if (s < 30.4) return 'HOVERING';
  if (s < EV.touchdown + 0.3) return 'LANDING';
  if (s < EV.groom) return 'EXPLORING';
  if (s < EV.walkToPlant) return 'GROOMING';
  if (s < 45.6) return 'WALKING';
  if (s < 57.8) return 'HIDDEN';
  if (Math.abs(s - EV.touch1) < 0.4 || Math.abs(s - EV.touch2) < 0.3) return 'TRIGGER_CONTACT';
  if (s < EV.snap) return (s > 59.4 && s < 60.3) || (s > 68 && s < 78.4) ? 'WALKING' : 'EXPLORING';
  if (s < 81) return 'ESCAPE_ATTEMPT';
  if (s < EV.sealStart + 2) return 'TRAPPED';
  return 'DIGESTED';
}

const planted = (surf: Surface, w: WalkPath, t: number, fallback: number) =>
  REST.map((leg) => footOnSurface(surf, w, t, leg, STRIDE, (tt) => walkHeading(w, tt, fallback)).p);

export type FlyResult = {pose: FlyPose; where: 'air' | 'leaf' | 'lobe' | 'inside' | 'husk'; blur: number; state: FlyState};

/** Postura de la mosca protagonista. `g` = geometría de la trampa T1 en el tiempo de la historia. */
export function heroFly(t: number, g: TrapGeo): FlyResult | null {
  const s = storyT(t);
  const state = flyState(t);
  if (state === 'HIDDEN') return null;
  const base: Omit<FlyPose, 'pos' | 'fwd' | 'up' | 'feet'> = {scale: 1, legExtend: 0, wingBuzz: 0, wingSpread: 0.15, headYaw: 0, headPitch: 0, proboscis: 0, dry: 0, opacity: 1, t};
  // ---------------- en el aire
  if (s < EV.touchdown) {
    const p = airPos(s);
    const v = sub(airPos(s + 0.12), airPos(s - 0.12));
    const hz = norm([v[0], 0, v[2]]);
    const lf = bodyFrame(LEAF, LAND_A, 0, 0).f;
    const k = smoothstep(28.8, 30.6, s);
    const fwd = norm(lerp3(hz, lf, k));
    const bank = clamp(-v[1] * 0.004, -0.3, 0.3);
    const up = norm(add([0, 1, 0], scl(cross(fwd, [0, 1, 0]), bank)));
    const nose = add(fwd, [0, 0.12 + 0.1 * Math.sin(s * 5), 0]);
    return {
      pose: {...base, pos: p, fwd: norm(nose), up, feet: [null, null, null, null, null, null], wingBuzz: 1, legExtend: smoothstep(30.0, 31.2, s), scale: lerp(0.42, 1, smoothstep(20, 24.8, s))},
      where: 'air',
      blur: lerp(3.5, 0, smoothstep(20, 24.5, s)),
      state,
    };
  }
  // ---------------- sobre la hoja
  if (s < 45.6) {
    const w = LEAF_WALK;
    const q = walkPos(w, s);
    const h = walkHeading(w, s, 0);
    const fr = bodyFrame(LEAF, q.a, q.b, h);
    const feet: (V3 | null)[] = planted(LEAF, w, s, 0);
    let up = fr.n;
    let headYaw = 0.25 * Math.sin(s * 1.7) * smoothstep(31.8, 32.6, s) * (1 - smoothstep(34.6, 35.0, s));
    let headPitch = 0;
    let proboscis = pulse(s, 33.1, 34.0, 0.15);
    // GROOMING: patas delanteras frotándose (35–38) y limpieza de la cabeza (38–40)
    if (s >= EV.groom && s < EV.walkToPlant) {
      const rub = s < 38;
      const ph = s * (rub ? 13 : 9);
      const lean = 0.18 * smoothstep(35, 35.5, s) * (1 - smoothstep(39.5, 40, s));
      up = norm(add(fr.n, scl(fr.f, -lean)));
      const Wl = (x: number, y: number, z: number) => add(fr.p, add(add(scl(fr.f, x), scl(up, y + BODY_H)), scl(fr.side, z)));
      if (rub) {
        feet[0] = Wl(27 + 2.5 * Math.sin(ph), -6 + 1.5 * Math.cos(ph), 2.2 + 1.4 * Math.sin(ph + 1.5));
        feet[1] = Wl(27 + 2.5 * Math.sin(ph + Math.PI), -6 + 1.5 * Math.cos(ph + Math.PI), -2.2 - 1.4 * Math.sin(ph + 1.5));
      } else {
        headPitch = -0.25;
        feet[0] = Wl(23 + 3 * Math.sin(ph), 6 + 3 * Math.cos(ph), 7);
        feet[1] = Wl(23 + 3 * Math.sin(ph + 0.6), 6 + 3 * Math.cos(ph + 0.6), -7);
      }
      headYaw = rub ? 0 : 0.15 * Math.sin(ph * 0.5);
      proboscis = 0;
    }
    const pos = add(fr.p, scl(up, BODY_H));
    return {pose: {...base, pos, fwd: fr.f, up, feet, headYaw, headPitch, proboscis, wingSpread: 0.15 + 0.1 * pulse(s, 31.6, 32.4, 0.2)}, where: 'leaf', blur: 0, state};
  }
  // ---------------- sobre el lóbulo (exploración y contactos)
  const surf = lobeWalkSurface(g);
  const w = lobeWalk(g);
  if (s < EV.snap + 0.04) {
    const q = walkPos(w, s);
    const h = walkHeading(w, s, -Math.PI / 2);
    const fr = bodyFrame(surf, q.a, q.b, h);
    const feet: (V3 | null)[] = planted(surf, w, s, -Math.PI / 2);
    // TRIGGER_CONTACT: una pata delantera toca la punta del pelo sensitivo
    const c1 = pulse(s, EV.touch1 - 0.3, EV.touch1 + 0.4, 0.18);
    const c2 = pulse(s, EV.touch2 - 0.25, EV.touch2 + 0.3, 0.12);
    if (c1 > 0) feet[0] = lerp3(feet[0] as V3, hairTip(g, HAIR1).tip, c1);
    if (c2 > 0) feet[1] = lerp3(feet[1] as V3, hairTip(g, HAIR2).tip, c2);
    const headYaw = 0.3 * Math.sin(s * 1.3) * (s > 62 && s < 76 ? 1 : 0.3);
    const proboscis = pulse(s, 62.6, 63.6, 0.15) + pulse(s, 72.6, 73.4, 0.15);
    const pos = add(fr.p, scl(fr.n, BODY_H));
    return {pose: {...base, pos, fwd: fr.f, up: fr.n, feet, headYaw, proboscis}, where: 'lobe', blur: 0, state};
  }
  // ---------------- ESCAPE_ATTEMPT → TRAPPED → restos secos
  const inside = add(add(g.C, scl(g.Y, g.spec.W * 0.36)), scl(g.X, g.spec.L * 0.06));
  if (s < EV.reopen - 0.5) {
    const q = walkPos(w, EV.snap);
    const fr = bodyFrame(surf, q.a, q.b, walkHeading(w, EV.snap, -Math.PI / 2));
    const ground = add(fr.p, scl(fr.n, BODY_H));
    const esc = smoothstep(EV.snap, 80.0, s);
    const jit = (sd: number, a: number) => fbm1(s * 6, sd) * a;
    const struggle = EV.struggles.reduce((a, ts) => a + pulse(s, ts, ts + 0.7, 0.15), 0) + (s < 81 ? 1 : 0);
    const pos = add(lerp3(add(ground, scl(fr.n, 10 * pulse(s, EV.snap, 80, 0.2))), inside, esc), [jit(3, 3 * struggle), jit(5, 2.5 * struggle), jit(9, 3 * struggle)]);
    const fwd = norm(lerp3(fr.f, norm(add(g.X, scl(g.Y, 0.35))), esc));
    const up = norm(lerp3(fr.n, norm(add(g.Z, scl(g.Y, 0.4))), esc));
    const dry = smoothstep(105, EV.reopen - 0.6, s);
    return {
      pose: {...base, pos, fwd, up, feet: [null, null, null, null, null, null], legExtend: 0.55 + 0.35 * Math.sin(s * 23) * clamp(struggle), wingBuzz: clamp(struggle) * (1 - dry), wingSpread: 0.4, dry, headYaw: jit(13, 0.3)},
      where: 'inside',
      blur: 0,
      state,
    };
  }
  // restos secos sobre el lóbulo (visibles al reabrirse)
  const hs = lobeSurface(g, WALK_S, 0.12 * WALK_S, 0.42);
  return {
    pose: {...base, pos: add(hs.p, scl(hs.n, 6)), fwd: norm(add(g.X, scl(hs.dv, 0.3))), up: hs.n, feet: [null, null, null, null, null, null], legExtend: 0.2, dry: 1, wingSpread: 0.8},
    where: 'husk',
    blur: 0,
    state,
  };
}

/** Segunda mosca: pasa a distancia (165–173 s) y no es capturada. */
export function secondFly(t: number): FlyResult | null {
  if (t < EV.secondFly || t > 173.5) return null;
  const u = (t - EV.secondFly) / 8.5;
  const pos: V3 = [lerp(1300, -1400, u) + fbm1(t * 1.4, 21) * 40, 560 + fbm1(t * 1.9, 23) * 40 + Math.sin(u * 3) * 60, lerp(-700, -500, u)];
  const v: V3 = [-1, 0, 0.1];
  return {
    pose: {pos, fwd: norm(v), up: [0, 1, 0], scale: 0.62, feet: [null, null, null, null, null, null], legExtend: 0.1, wingBuzz: 1, wingSpread: 0, headYaw: 0, headPitch: 0, proboscis: 0, dry: 0, opacity: 1, t},
    where: 'air',
    blur: 2.2,
    state: 'FLYING',
  };
}
