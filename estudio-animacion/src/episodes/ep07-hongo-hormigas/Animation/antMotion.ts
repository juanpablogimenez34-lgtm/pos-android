// Postura de una hormiga que camina sobre una superficie: marcha en trípode con pies fijos,
// antenas que exploran, mandíbulas, limpieza (la pata delantera pasa por la antena) y marcha
// alterada por la infección (rumbo vacilante, temblor, pausas). Todo función del tiempo.
import {clamp, fbm1, lerp} from '../../../engine/math';
import {AntPose} from '../Characters/Ant';
import {ANT_BODY_H, ANT_LEGS, ANT_STRIDE, AntSpec} from '../Characters/antSpec';
import {bodyFrame, footOnSurface, Surface, WalkPath, walkHeading, walkPos, walkS} from './locomotion';
import {add, scl, V3} from './proj';

export type AntOpts = {
  fallback: number; // rumbo si está quieta
  scan: number; // 0–1 barrido amplio de antenas (ANTENNA_SCAN)
  mandible: number; // 0–1
  groom: number; // 0–1 limpieza de antenas con las patas delanteras
  infected: number; // 0–1 alteración de la marcha
  headYaw: number;
  headPitch: number;
  seed: number;
  freezeAt?: number; // congela la marcha (pies y cuerpo) en este instante (fijación)
};

export const DEFAULT_OPTS: AntOpts = {fallback: 0, scan: 0, mandible: 0.1, groom: 0, infected: 0, headYaw: 0, headPitch: 0, seed: 1};

export function walkPose(spec: AntSpec, surf: Surface, walk: WalkPath, tIn: number, o: AntOpts): AntPose {
  const t = o.freezeAt !== undefined ? Math.min(tIn, o.freezeAt) : tIn;
  const k = spec.scale;
  const wob = (tt: number) => o.infected * (0.32 * fbm1(tt * 1.1, o.seed + 5) + 0.12 * Math.sin(tt * 2.7 + o.seed));
  const headingAt = (tt: number) => walkHeading(walk, tt, o.fallback) + wob(tt);
  const q = walkPos(walk, t);
  const h = headingAt(t);
  const fr = bodyFrame(surf, q.a, q.b, h);
  const feet: (V3 | null)[] = ANT_LEGS.map((lg) => footOnSurface(surf, walk, t, {fwd: lg.fwd * k, side: lg.side * k, group: lg.group}, ANT_STRIDE * k, headingAt, 0.55).p);
  const speed = (walkS(walk, t + 0.1) - walkS(walk, t - 0.1)) / 0.2;
  const moving = clamp(speed / 40);
  // antenas: barrido alterno al caminar; barrido amplio al explorar
  const ph = tIn * (3.2 + (o.seed % 5) * 0.25) + o.seed;
  const amp = 0.18 + 0.12 * moving + 0.45 * o.scan;
  const antenna = [0, 1].map((i) => {
    const s = i === 0 ? 0 : Math.PI * 0.85;
    return {yaw: 0.35 + amp * Math.sin(ph + s), pitch: 0.25 + 0.15 * Math.sin(ph * 0.7 + s + 1) - 0.25 * o.groom, elbow: 0.55 + 0.25 * Math.sin(ph * 1.3 + s) * (0.4 + o.scan)};
  });
  // temblor leve en la marcha alterada
  const trem = o.infected * 1.2 * Math.sin(tIn * 31 + o.seed);
  let pos = add(fr.p, scl(fr.n, ANT_BODY_H * k + trem * 0.3));
  // GROOMING: una pata delantera sube a la antena del mismo lado (alternando)
  if (o.groom > 0.01) {
    const side = Math.sin(tIn * 1.6) > 0 ? 0 : 1;
    const sg = side === 0 ? 1 : -1;
    const rub = Math.sin(tIn * 9);
    const target = add(pos, add(add(scl(fr.f, (30 + 4 * rub) * k), scl(fr.n, (8 + 3 * rub) * k)), scl(fr.side, sg * 6 * k)));
    const f = feet[side] as V3;
    feet[side] = [lerp(f[0], target[0], o.groom), lerp(f[1], target[1], o.groom), lerp(f[2], target[2], o.groom)];
    antenna[side].pitch -= 0.5 * o.groom;
    antenna[side].elbow += 0.4 * o.groom;
    pos = add(pos, scl(fr.f, -2 * o.groom * k));
  }
  return {
    pos,
    fwd: fr.f,
    up: fr.n,
    feet,
    antenna,
    mandible: o.mandible,
    headYaw: o.headYaw + 0.12 * Math.sin(ph * 0.5) * (0.4 + o.scan),
    headPitch: o.headPitch,
    gasterPitch: 0.05 * Math.sin(tIn * 2 + o.seed) - 0.12 * o.infected,
    dead: 0,
    hyphae: 0,
    stalk: 0,
    ascoma: 0,
    stalkDir: fr.n,
    opacity: 1,
    t: tIn,
  };
}
