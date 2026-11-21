// Movimiento del ajolote: construye la postura (columna, alturas, extremidades) a partir de
// parámetros de estado. Todo depende del tiempo: mismo fotograma → misma postura.
//  - marcha: onda estacionaria del tronco sincronizada con pares diagonales (LF+RH / RF+LH)
//  - nado: onda viajera hacia la cola, extremidades pegadas al cuerpo
//  - giro: la cabeza inicia la curva y el cuerpo la sigue
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {AxolotlPose, LimbPose, profileAt, restTarget, spineOf} from '../Characters/Axolotl';
import {AxolotlSpec, LimbId} from '../Characters/axolotlSpec';
import {footOnSurface, LegRest, Surface, WalkPath, walkHeading, walkPos, walkS} from './locomotion';
import {V3} from './proj';

/** Fondo plano (sedimento) en y = 0, parámetros (x, z). */
export const FLOOR: Surface = {id: 'floor', point: (a, b) => [a, 0, b], normal: () => [0, 1, 0]};

export type MotionParams = {
  root: V3;
  heading: number;
  walkK: number; // 0–1 peso de la marcha
  walkPhase: number; // ciclos de zancada
  swimK: number; // 0–1 peso del nado
  swimPhase: number; // rad
  swimAmp: number;
  headTurn: number; // rad (+ izquierda del animal)
  tailCurl: number;
  idle: number; // respiración/vaivén sutil
  elev: number; // altura del punto raíz al nadar
  pitch: number; // rad, morro arriba +
  startle: number; // 0–1 sacudida en C
  t: number;
};

export function bendFn(m: MotionParams) {
  return (s: number) => {
    const walk = m.walkK * 0.16 * Math.sin(2 * Math.PI * m.walkPhase) * Math.sin((2 * Math.PI * (s - 0.36)) / 0.62);
    const swim = m.swimK * m.swimAmp * (0.1 + 1.5 * Math.pow(s, 1.6)) * Math.sin(m.swimPhase - (2 * Math.PI * s) / 0.78);
    const turn = m.headTurn * (1 - smoothstep(0.02, 0.4, s));
    const curl = m.tailCurl * smoothstep(0.5, 1, s);
    const idle = m.idle * 0.035 * Math.sin(m.t * 0.9 - s * 3) * smoothstep(0.45, 1, s);
    const startle = m.startle * 0.9 * (s < 0.36 ? -(0.36 - s) * 2 : (s - 0.36) * 1.6);
    return walk + swim + turn + curl + idle + startle;
  };
}

export function heightFn(spec: AxolotlSpec, m: MotionParams) {
  const L = spec.L;
  return (s: number) => {
    const [, hh] = profileAt(spec.profile, s);
    const ground = hh * L * 0.96 + m.walkK * 0.014 * L * smoothstep(0.08, 0.2, s) * (1 - smoothstep(0.5, 0.7, s)) + 0.01 * L * (1 - smoothstep(0.0, 0.2, s));
    const swim = m.elev + (s - 0.36) * L * -Math.sin(m.pitch) + Math.sin(m.swimPhase * 0.5 - s * 2) * 0.006 * L;
    return lerp(ground, Math.max(ground, swim), clamp(m.swimK));
  };
}

/** Apoyos de las patas respecto a la raíz (adelante, lateral en el plano del fondo). */
export function legRests(spec: AxolotlSpec): Record<LimbId, LegRest> {
  const L = spec.L;
  const f = (0.36 - spec.shoulderS) * L + 0.035 * L;
  const h = -(spec.hipS - 0.36) * L - 0.01 * L;
  // lateral: + derecha en el plano (x, z) según footOnSurface → el lado izquierdo es negativo
  return {
    LF: {fwd: f, side: -0.135 * L, group: 0},
    RH: {fwd: h, side: 0.14 * L, group: 0},
    RF: {fwd: f, side: 0.135 * L, group: 1},
    LH: {fwd: h, side: -0.14 * L, group: 1},
  };
}

export type LimbOverride = Partial<Record<LimbId, LimbPose>>;

/** Postura completa. `walk` = camino de la marcha (si camina), para apoyar los pies sin patinar. */
export function buildPose(spec: AxolotlSpec, m: MotionParams, walk: WalkPath | null, extra: Partial<AxolotlPose> = {}, limbOv: LimbOverride = {}): AxolotlPose {
  const pose: AxolotlPose = {
    root: m.root,
    heading: m.heading,
    bend: bendFn(m),
    height: heightFn(spec, m),
    limbs: {LF: {target: null, tuck: 0}, RF: {target: null, tuck: 0}, LH: {target: null, tuck: 0}, RH: {target: null, tuck: 0}},
    gillPhase: m.t * 1.7,
    gillAmp: 0.08,
    gillFlare: 0,
    mouth: 0,
    throat: 0,
    eyeLook: 0,
    regen: null,
    highlight: 0,
    opacity: 1,
    ...extra,
  };
  const sp = spineOf(spec, pose);
  const rests = legRests(spec);
  const tuck = clamp(m.swimK * 1.2);
  (['LF', 'RF', 'LH', 'RH'] as LimbId[]).forEach((id) => {
    let target: V3 = restTarget(spec, sp, id);
    if (walk && m.walkK > 0.01) {
      const ft = footOnSurface(FLOOR, walk, m.t, rests[id], 0.12 * spec.L, (tt) => walkHeading(walk, tt, m.heading), 0.65);
      const lifted: V3 = [ft.p[0], 0.008 * spec.L + ft.lift * 0.04 * spec.L, ft.p[2]];
      target = [lerp(target[0], lifted[0], m.walkK), lerp(target[1], lifted[1], m.walkK), lerp(target[2], lifted[2], m.walkK)];
    }
    pose.limbs[id] = {target, tuck};
  });
  Object.assign(pose.limbs, limbOv);
  return pose;
}

/** Fase de marcha (ciclos) a partir de la distancia recorrida. */
export const walkPhaseAt = (w: WalkPath, t: number, stride: number) => walkS(w, t) / stride;
export {walkPos};
