// Protagonista: WALKING, ANTENNA_SCAN, MANDIBLE_MOVEMENT, TURNING, GROOMING, CLIMBING,
// INFECTED_WALK, LEAF_GRIP, IMMOBILE (y las etapas visibles del hongo tras la muerte).
import {clamp, smoothstep} from '../../../engine/math';
import {pulse} from '../../../engine/timeline';
import {AntPose} from '../Characters/Ant';
import {HERO} from '../Characters/antSpec';
import {BRANCH, LEAF1, LEAF2, STEM} from '../Environments/surfaces';
import {EV, fungusAt} from '../Timeline/timeline';
import {DEFAULT_OPTS, walkPose} from './antMotion';
import {makeWalk, Surface, WalkPath} from './locomotion';
import {add, norm, scl} from './proj';

export type AntState = 'WALKING' | 'ANTENNA_SCAN' | 'MANDIBLE_MOVEMENT' | 'TURNING' | 'GROOMING' | 'CLIMBING' | 'INFECTED_WALK' | 'LEAF_GRIP' | 'IMMOBILE';
export type HeroSeg = {t0: number; t1: number; surf: Surface; walk: WalkPath; fallback: number};

export const HERO_SEGS: HeroSeg[] = [
  {t0: 0, t1: 20, surf: BRANCH, walk: makeWalk([[9.0, -2350, 24], [20, -1060, 8]]), fallback: 0},
  {t0: 20, t1: 45, surf: LEAF1, walk: makeWalk([[20, 220, 40], [23, 480, 20], [25.6, 480, 20], [27.2, 540, 70], [33, 640, 90], [38, 640, 90], [45, 780, 40]]), fallback: 0},
  {t0: 45, t1: 70, surf: BRANCH, walk: makeWalk([[45, -1520, -30], [49, -1160, -24], [52, -1160, -24], [65, -560, -14], [70, -220, 0]]), fallback: 0},
  {t0: 70, t1: 77, surf: BRANCH, walk: makeWalk([[70, -220, 0], [77, 1120, 46]]), fallback: 0},
  {t0: 77, t1: 90, surf: STEM, walk: makeWalk([[77, 50, 0], [80.2, 300, 0], [83, 520, 4], [84.4, 520, 4], [86.6, 780, -5], [87.4, 780, -5], [90, 1390, 0]]), fallback: 0},
  {t0: 90, t1: 180, surf: LEAF2, walk: makeWalk([[90, 30, 0], [93, 250, 8], [95.4, 340, 22], [99, 430, -62], [101, 438, -56], [103, 442, -46], [180, 442, -46]]), fallback: Math.atan2(10, 4)},
];

export function heroState(t: number): AntState {
  if (t >= EV.dead) return 'IMMOBILE';
  if (t >= EV.grip) return 'LEAF_GRIP';
  if (t >= 77 && t < 90) return 'CLIMBING';
  if (t >= 70) return 'INFECTED_WALK';
  if (t >= 49 && t < 52) return 'GROOMING';
  if (t >= 23 && t < 24.4) return 'ANTENNA_SCAN';
  if (t >= 24.4 && t < 25.6) return 'MANDIBLE_MOVEMENT';
  if (t >= 25.6 && t < 27.2) return 'TURNING';
  return 'WALKING';
}

export const heroSeg = (t: number) => {
  let s = HERO_SEGS[0];
  for (const g of HERO_SEGS) if (t >= g.t0) s = g;
  return s;
};

/** Progreso de la alteración del comportamiento (0 normal → 1 marcada). */
export const infectedAt = (t: number) => clamp(0.25 * smoothstep(68, 72, t) + 0.45 * smoothstep(77, 86, t) + 0.3 * smoothstep(86, 95, t)) * (1 - smoothstep(EV.grip, EV.grip + 1, t));

export function heroPose(t: number): AntPose {
  const s = heroSeg(t);
  const scan = smoothstep(22.8, 23.2, t) * (1 - smoothstep(24.2, 24.6, t)) + 0.6 * pulse(t, 99, 103, 0.5) + 0.4 * pulse(t, 46, 48, 0.4);
  const mand = 0.1 + 0.8 * Math.max(0, Math.sin((t - 24.4) * 9)) * pulse(t, 24.4, 25.6, 0.2) + 0.9 * pulse(t, 103.6, EV.clamp, 0.4);
  const clampK = smoothstep(EV.clamp - 0.05, EV.clamp + 0.15, t);
  const pose = walkPose(HERO, s.surf, s.walk, t, {
    ...DEFAULT_OPTS,
    fallback: s.fallback,
    scan,
    mandible: t >= EV.clamp ? 0.02 : mand,
    groom: smoothstep(49.1, 49.5, t) * (1 - smoothstep(51.6, 52, t)),
    infected: infectedAt(t),
    headPitch: -0.22 * smoothstep(EV.grip, EV.clamp, t),
    seed: HERO.seed,
    freezeAt: t >= EV.grip + 1 ? EV.grip + 1 : undefined,
  });
  // tras la fijación: las antenas caen, el cuerpo se queda quieto y aparece el hongo
  const dead = smoothstep(EV.dead - 1, EV.dead + 3, t);
  const f = fungusAt(t);
  pose.dead = dead;
  pose.hyphae = f.hyphae;
  pose.stalk = f.stalk;
  pose.ascoma = f.ascoma;
  pose.stalkDir = norm(add(pose.up, scl(pose.fwd, -0.25)));
  pose.antenna = pose.antenna.map((a) => ({yaw: a.yaw * (1 - dead) + 0.5 * dead, pitch: a.pitch * (1 - dead) - 0.3 * dead, elbow: a.elbow * (1 - dead) + 0.9 * dead}));
  if (clampK > 0) pose.headPitch = -0.22;
  return pose;
}
