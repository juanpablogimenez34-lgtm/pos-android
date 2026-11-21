// Araña ambiental (8–13 s): camina sobre la hoja con marcha alterna; una gota que cae
// hace vibrar la hoja y la araña se detiene y levanta las patas delanteras antes de seguir.
import {clamp} from '../../../engine/math';
import {pulse} from '../../../engine/timeline';
import {bodyFrame, footOnSurface, makeWalk, walkHeading, walkPos} from '../anatomy/locomotion';
import {add, scl} from '../anatomy/proj';
import {SpiderPose, SPIDER_LEGS} from '../characters/Spider';
import {LEAF} from '../scenes/leaf';

/** Tamaño de la araña (≈ 6 mm de envergadura de patas a esta escala). */
export const SPIDER_SCALE = 1.5;

export const DROP = {fall: 9.55, hit: 10.05, a: 300, b: 14};

const WALK = makeWalk([
  [7.4, 370, 18],
  [10.1, 245, 4],
  [11.2, 245, 4],
  [13.0, 70, -8],
]);

export const spiderVisible = (t: number) => t > 7.0 && t < 14.5;

export function spiderPose(t: number): SpiderPose {
  const q = walkPos(WALK, t);
  const h = walkHeading(WALK, t, Math.PI);
  const fr = bodyFrame(LEAF, q.a, q.b, h);
  const feet = SPIDER_LEGS.map((lg) => footOnSurface(LEAF, WALK, t, {...lg, fwd: lg.fwd * SPIDER_SCALE, side: lg.side * SPIDER_SCALE}, 14 * SPIDER_SCALE, (tt) => walkHeading(WALK, tt, Math.PI), 0.55).p);
  // reacción: se agazapa y levanta las patas delanteras al notar la vibración
  const react = pulse(t, DROP.hit + 0.08, 11.15, 0.15);
  const crouch = (9 - 2.5 * react) * SPIDER_SCALE;
  return {pos: add(fr.p, scl(fr.n, crouch)), fwd: fr.f, up: fr.n, scale: SPIDER_SCALE, feet, frontRaise: clamp(react), opacity: 1};
}
