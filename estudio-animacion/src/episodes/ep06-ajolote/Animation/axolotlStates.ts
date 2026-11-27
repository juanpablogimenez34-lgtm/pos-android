// Estados de los dos ajolotes en función del tiempo:
// IDLE, GILL_MOVEMENT, WALKING, SWIMMING, TURNING, FEEDING, STARTLED, RESTING, REGENERATION, RECOVERY.
// El rosado y el silvestre usan la misma base anatómica pero rutas, ritmos y reacciones propias.
import {clamp, fbm1, lerp, smoothstep} from '../../../engine/math';
import {keys, KeyTuple, pulse, track} from '../../../engine/timeline';
import {AxolotlPose, restTarget, spineOf} from '../Characters/Axolotl';
import {AxolotlSpec, PINK, WILD} from '../Characters/axolotlSpec';
import {EV, regenActive, regenR, regenSize} from '../Timeline/timeline';
import {buildPose, MotionParams} from './axolotlMotion';
import {makeWalk, walkHeading, walkPos, WalkPath, walkS} from './locomotion';
import {V3} from './proj';

export type AxState = 'HIDDEN' | 'IDLE' | 'GILL_MOVEMENT' | 'WALKING' | 'SWIMMING' | 'TURNING' | 'FEEDING' | 'STARTLED' | 'RESTING' | 'REGENERATION' | 'RECOVERY';
export type AxResult = {pose: AxolotlPose; state: AxState; spec: AxolotlSpec};

const STRIDE = 0.12 * PINK.L;
const groundRootY = (spec: AxolotlSpec) => {
  const sp = spec.profile;
  // semialto en s = 0.36 interpolado (aprox. tabla) × L
  const a = sp.find((p) => p[0] >= 0.36)!;
  return a[2] * spec.L * 0.96;
};

type Seg = {t0: number; t1: number; kind: 'idle' | 'walk' | 'swim'; walk?: WalkPath; swim?: [number, number, number, number][]; heading?: number};

const swimTrack = (pts: [number, number, number, number][]) => ({
  x: keys(pts.map(([t, x]) => [t, x] as KeyTuple)),
  y: keys(pts.map(([t, , y]) => [t, y] as KeyTuple)),
  z: keys(pts.map(([t, , , z]) => [t, z] as KeyTuple)),
});

function motionFrom(spec: AxolotlSpec, segs: Seg[], t: number, base: Partial<MotionParams>): {m: MotionParams; walk: WalkPath | null; kind: Seg['kind']} {
  const gy = groundRootY(spec);
  let seg = segs[0];
  for (const s of segs) if (t >= s.t0) seg = s;
  const m: MotionParams = {root: [0, 0, 0], heading: Math.PI, walkK: 0, walkPhase: 0, swimK: 0, swimPhase: 0, swimAmp: 0.2, headTurn: 0, tailCurl: 0, idle: 1, elev: gy, pitch: 0, startle: 0, t, ...base};
  let walk: WalkPath | null = null;
  if (seg.kind === 'walk' && seg.walk) {
    walk = seg.walk;
    const q = walkPos(walk, t);
    m.heading = walkHeading(walk, t, seg.heading ?? Math.PI);
    m.root = [q.a, gy, q.b];
    const moving = clamp((walkS(walk, t + 0.1) - walkS(walk, t - 0.1)) / 0.2 / 40);
    m.walkK = moving;
    m.walkPhase = walkS(walk, t) / STRIDE;
  } else if (seg.kind === 'swim' && seg.swim) {
    const tr = swimTrack(seg.swim);
    const p: V3 = [track(tr.x, t), track(tr.y, t), track(tr.z, t)];
    const a: V3 = [track(tr.x, t - 0.2), track(tr.y, t - 0.2), track(tr.z, t - 0.2)];
    const b: V3 = [track(tr.x, t + 0.2), track(tr.y, t + 0.2), track(tr.z, t + 0.2)];
    const v: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const sp = Math.hypot(v[0], v[2]);
    m.heading = sp > 1 ? Math.atan2(v[2], v[0]) : seg.heading ?? Math.PI;
    m.root = [p[0], Math.max(gy, p[1]), p[2]];
    m.elev = Math.max(gy, p[1]);
    m.pitch = clamp(Math.atan2(v[1], sp + 1) * 0.6, -0.35, 0.35);
    m.swimK = smoothstep(seg.t0, seg.t0 + 0.8, t) * (1 - smoothstep(seg.t1 - 0.8, seg.t1, t));
    m.swimPhase = (t - seg.t0) * 2 * Math.PI * 1.7;
  } else {
    m.heading = seg.heading ?? Math.PI;
  }
  return {m, walk, kind: seg.kind};
}

// ------------------------------------------------------------------ AJOLOTE ROSADO
const P_REST: V3 = [-3100, 0, 150];
const PINK_SEGS: Seg[] = [
  {t0: 0, t1: 34, kind: 'walk', walk: makeWalk([[0, 0, 0], [34, 0, 0]]), heading: Math.PI},
  {t0: 34, t1: 40, kind: 'walk', walk: makeWalk([[34, 0, 0], [40, -560, 40]]), heading: Math.PI},
  {t0: 40, t1: 46.2, kind: 'swim', swim: [[40, -560, 54, 40], [41.6, -800, 190, 60], [43.6, -1380, 340, 120], [45.2, -1980, 230, 170], [46.2, -2250, 54, 180]]},
  {t0: 46.2, t1: 51.2, kind: 'walk', walk: makeWalk([[46.2, -2250, 180], [48.2, -2390, 150], [51.2, -2390, 150]]), heading: Math.PI},
  {t0: 51.2, t1: 58.6, kind: 'walk', walk: makeWalk([[51.2, -2390, 150], [54.9, -2800, 175], [55.9, -2800, 175], [58.6, -3100, 150]]), heading: Math.PI},
  {t0: 58.6, t1: 150, kind: 'walk', walk: makeWalk([[58.6, -3100, 150], [150, -3100, 150]]), heading: Math.PI},
  {t0: 150, t1: 158, kind: 'walk', walk: makeWalk([[150, -3100, 150], [158, -3760, 200]]), heading: Math.PI},
  {t0: 158, t1: 180, kind: 'swim', swim: [[158, -3760, 54, 200], [159.6, -4020, 170, 220], [162.2, -4700, 390, 120], [165.5, -5400, 520, -220], [172, -6900, 720, -760], [180, -8200, 860, -1200]]},
];

export function pinkState(t: number): AxState {
  if (t < 14.5) return 'HIDDEN';
  if (t < 27) return 'IDLE';
  if (t < EV.pinkWalk) return 'GILL_MOVEMENT';
  if (t < EV.pinkSwim) return 'WALKING';
  if (t < EV.land) return 'SWIMMING';
  if (t < 48.4) return 'WALKING';
  if (t < 49.8) return 'TURNING';
  if (t < 51.0) return 'FEEDING';
  if (Math.abs(t - EV.startle - 0.25) < 0.45) return 'STARTLED';
  if (t < EV.rest) return 'WALKING';
  if (t < EV.lesion) return 'RESTING';
  if (t < EV.recovery) return 'REGENERATION';
  if (t < EV.swimAway) return 'RECOVERY';
  return 'SWIMMING';
}

export function pinkAt(t: number): AxResult {
  const startle = pulse(t, EV.startle, EV.startle + 0.55, 0.12);
  const turn = 0.5 * smoothstep(48.4, 49.4, t) * (1 - smoothstep(50.6, 51.6, t)) + 0.25 * pulse(t, 99, 103, 1) - 0.3 * pulse(t, 131, 135, 1);
  const {m, walk} = motionFrom(PINK, PINK_SEGS, t, {});
  m.headTurn = turn;
  m.startle = startle * 0.5;
  // marcha de recuperación: más lenta y prudente al principio
  const gillAmp = 0.06 + 0.07 * smoothstep(27, 28, t) * (1 - smoothstep(33.5, 34.5, t)) + 0.05 * m.swimK;
  const mouth = pulse(t, EV.feed - 0.12, EV.feed + 0.22, 0.07);
  const throat = pulse(t, EV.feed - 0.08, EV.feed + 0.4, 0.1);
  const regen = regenActive(t) ? {r: regenR(t), size: regenSize(t)} : null;
  const pose = buildPose(PINK, m, walk, {
    gillPhase: t * 1.7,
    gillAmp,
    gillFlare: 0.6 * pulse(t, 29.5, 31.5, 0.5) + startle + 0.3 * pulse(t, 62, 64, 0.6),
    mouth,
    throat,
    regen,
    highlight: pulse(t, 60.0, 70.5, 1.0),
  });
  // RECOVERY: la pata regenerada da pasos más cortos al principio
  if (t >= EV.recovery && t < EV.swimAway && pose.limbs.LF.target) {
    const sp = spineOf(PINK, pose);
    const rest = restTarget(PINK, sp, 'LF');
    const k = 0.55 * (1 - smoothstep(EV.recovery, EV.recovery + 5.5, t));
    const tg = pose.limbs.LF.target;
    pose.limbs.LF = {target: [lerp(tg[0], rest[0], k), lerp(tg[1], rest[1], k), lerp(tg[2], rest[2], k)], tuck: pose.limbs.LF.tuck};
  }
  return {pose, state: pinkState(t), spec: PINK};
}

export const pinkVisible = (t: number) => t >= 14.5;
export const PINK_REST = P_REST;

// ------------------------------------------------------------------ AJOLOTE SILVESTRE
const WILD_SEGS: Seg[] = [
  {t0: 0, t1: 15.8, kind: 'walk', walk: makeWalk([[9.4, 1950, -420], [14.6, 1320, -380], [15.8, 1320, -380]]), heading: Math.PI},
  {t0: 15.8, t1: 30, kind: 'swim', swim: [[15.8, 1320, 54, -380], [17.0, 1240, 200, -620], [19.6, 1560, 560, -1150], [24, 2600, 800, -1700]]},
  {t0: 30, t1: 172, kind: 'idle', heading: Math.PI},
  {t0: 172, t1: 180, kind: 'walk', walk: makeWalk([[172.4, -6550, 330], [178.2, -6020, 350], [180, -6020, 350]]), heading: 0},
];

export function wildAt(t: number): AxResult | null {
  if (t < 9.0 || (t > 21 && t < 172)) return null;
  const {m, walk} = motionFrom(WILD, WILD_SEGS, t, {});
  // reacciona al entorno: gira la cabeza hacia la cámara y despliega las branquias al final
  m.headTurn = 0.55 * smoothstep(14.4, 15.4, t) * (1 - smoothstep(15.8, 16.6, t)) + 0.35 * smoothstep(178, 179.2, t);
  m.swimAmp = 0.24;
  m.idle = 1.3;
  const pose = buildPose(WILD, m, walk, {
    gillPhase: t * 1.35 + 2,
    gillAmp: 0.07 + 0.04 * Math.sin(t * 0.3),
    gillFlare: 0.5 * smoothstep(178.2, 179.2, t) + 0.4 * pulse(t, 14.6, 15.8, 0.3),
  });
  const state: AxState = t < 14.6 ? 'WALKING' : t < 15.8 ? 'TURNING' : t < 21 ? 'SWIMMING' : t < 178.2 ? 'WALKING' : 'GILL_MOVEMENT';
  return {pose, state, spec: WILD};
}

/** Pequeño trozo de ramita que cae (estímulo del sobresalto del rosado). */
export function twigAt(t: number): V3 | null {
  if (t < EV.startle - 1.6 || t > EV.startle + 2.2) return null;
  const u = clamp((t - (EV.startle - 1.6)) / 1.7);
  const y = lerp(900, 30, u * u * (3 - 2 * u));
  return [-2700 + fbm1(t * 2, 4) * 20, Math.max(30, y), 260];
}
