// ESTADOS DEL LEOPARDO: IDLE, WALK, STALK, RUN, JUMP, CLIMB, LOOK, REST, INTERACT y la cola
// (siempre con movimiento propio). Las patas tienen fases distintas (marcha lateral de cuatro
// tiempos: posterior y anterior del mismo lado coordinadas) y los apoyos quedan fijos en el suelo.
// Pequeñas variaciones deterministas evitan que los ciclos se vean repetitivos.
import {clamp, easeInOut, hash1, lerp} from '../../../engine/math';
import {LeopardPose, PAW0, PawKey, V, Vec} from './LeopardRig';

export type LP = Partial<LeopardPose>;
const KEYS: PawKey[] = ['FN', 'FF', 'HN', 'HF'];

export const blink = (t: number, seed = 0) => {
  const per = 3.4 + (seed % 5) * 0.4;
  const ph = (t + seed * 0.93) % per;
  return ph < 0.16 ? Math.sin((ph / 0.16) * Math.PI) : 0;
};
/** Cola: movimiento continuo e independiente (base, amplitud, velocidad, rizo de la punta). */
export const tailIdle = (t: number, energy = 0.4): LP['tail'] => ({base: 0.05 + 0.08 * Math.sin(t * 0.37), amp: 0.5 + 0.6 * energy, speed: 0.8 + 0.8 * energy + 0.15 * Math.sin(t * 0.23), curl: 0.45 + 0.2 * Math.sin(t * 0.5)});

/** Animación secundaria común: respiración, orejas que giran, parpadeo, mirada. */
export function alive(t: number, seed = 0, energy = 0.3): LP {
  const twitch = Math.max(0, Math.sin(t * 0.8 + seed) - 0.92) * 10;
  return {
    breathe: 0.5 + 0.5 * Math.sin(t * (1.6 + energy)),
    ears: 0.2 * Math.sin(t * 0.6 + seed) + twitch * 0.15,
    eye: {blink: blink(t, seed), look: V(0.4 + 0.3 * Math.sin(t * 0.4), 0.1 * Math.sin(t * 0.33)), pupil: 0.4, shine: 0},
    tail: tailIdle(t + seed, energy),
    t,
  };
}

// ---------------------------------------------------------------- marchas
type Gait = {period: number; duty: number; stride: number; lift: number; off: Record<PawKey, number>};
export const WALK: Gait = {period: 1.15, duty: 0.62, stride: 62, lift: 18, off: {HN: 0, FN: 0.22, HF: 0.5, FF: 0.72}};
export const STALK: Gait = {period: 1.9, duty: 0.72, stride: 42, lift: 12, off: {HN: 0, FN: 0.25, HF: 0.5, FF: 0.75}};
export const RUN: Gait = {period: 0.42, duty: 0.32, stride: 118, lift: 34, off: {HN: 0, HF: 0.1, FN: 0.48, FF: 0.58}};
export const CLIMB: Gait = {period: 0.9, duty: 0.5, stride: 70, lift: 30, off: {HN: 0, HF: 0.06, FN: 0.5, FF: 0.56}};
/** Avance en el mundo por ciclo (con los apoyos fijos). */
export const advance = (g: Gait) => g.stride / g.duty;
export const speedOf = (g: Gait) => advance(g) / g.period;

function paw(g: Gait, k: PawKey, cyc: number, jitter = 0): Vec {
  const ph = (((cyc + g.off[k] + jitter) % 1) + 1) % 1;
  const base = PAW0[k];
  if (ph < g.duty) return V(base.x + g.stride * (0.5 - ph / g.duty), 0);
  const u = (ph - g.duty) / (1 - g.duty);
  const e = easeInOut(u);
  const front = k[0] === 'F';
  return V(base.x + g.stride * (-0.5 + e) + (front ? 10 : -8) * Math.sin(u * Math.PI), -g.lift * Math.sin(u * Math.PI) * (front ? 1 : 0.8));
}
const pawsFor = (g: Gait, cyc: number) => Object.fromEntries(KEYS.map((k, i) => [k, paw(g, k, cyc, 0.012 * Math.sin(cyc * 1.7 + i))])) as Record<PawKey, Vec>;

export function walk(t: number, cyc: number, seed = 0): LP {
  const ph = cyc * Math.PI * 4;
  return {
    ...alive(t, seed, 0.4),
    paws: pawsFor(WALK, cyc),
    bodyY: 3 + 3 * Math.cos(ph),
    pitch: 0.025 * Math.sin(cyc * Math.PI * 2),
    stretch: 0.02 * Math.sin(ph),
    head: {pitch: 0.05 * Math.sin(ph + 0.8), tilt: 0.02 * Math.sin(cyc * Math.PI * 2), turn: 0.1 * Math.sin(t * 0.3 + seed)},
    muscle: 0.4 + 0.2 * Math.abs(Math.sin(cyc * Math.PI * 2)),
  };
}

/** Acecho: cuerpo bajo, cabeza adelantada y baja, orejas al frente, cola baja con la punta inquieta. */
export function stalk(t: number, cyc: number, freeze = 0): LP {
  const c = cyc * (1 - freeze);
  const ph = c * Math.PI * 4;
  return {
    ...alive(t, 2, 0.2),
    paws: pawsFor(STALK, c),
    bodyY: 26 + 2 * Math.cos(ph),
    pitch: 0.05,
    neck: 0.9,
    head: {pitch: -0.08, tilt: 0, turn: 0.05},
    ears: 0.9,
    eye: {blink: 0, look: V(1, 0), pupil: 0.65, shine: 0},
    tail: {base: -0.25, amp: 0.25, speed: 2.2, curl: 0.8 + 0.3 * Math.sin(t * 3)},
    muscle: 0.6,
    breathe: 0.5 + 0.5 * Math.sin(t * 2.2),
  };
}

/** Carrera: galope rotatorio con impulso, suspensión y apoyo; columna que se recoge y se estira. */
export function run(t: number, cyc: number): LP {
  const paws = pawsFor(RUN, cyc);
  const ph = ((cyc % 1) + 1) % 1;
  const susp = ph > 0.66 && ph < 0.98 ? Math.sin(((ph - 0.66) / 0.32) * Math.PI) : 0;
  const lift = susp * 30;
  KEYS.forEach((k) => {
    const v = paws[k];
    paws[k] = V(v.x, Math.min(0, v.y - (v.y < 0 ? lift : 0)));
  });
  const g = Math.sin(ph * Math.PI * 2);
  return {
    ...alive(t, 3, 1),
    paws,
    bodyY: -lift + 6 + 5 * Math.cos(ph * Math.PI * 2),
    stretch: 0.14 * g,
    pitch: -0.08 * Math.cos(ph * Math.PI * 2),
    neck: 0.5,
    head: {pitch: 0.06 * Math.sin(ph * Math.PI * 2 + 1), tilt: 0, turn: 0},
    ears: -0.3,
    eye: {blink: 0, look: V(1, 0), pupil: 0.7, shine: 0},
    tail: {base: 0.25 + 0.2 * g, amp: 0.4, speed: 3.5, curl: 0.3},
    muscle: 1,
  };
}

/** Salto: anticipación (se agacha), impulso, vuelo en parábola y aterrizaje. u 0…1. */
export function jump(t: number, u: number, h = 160): LP & {travel: number} {
  const cr = u < 0.22 ? easeInOut(u / 0.22) : u < 0.3 ? 1 - (u - 0.22) / 0.08 : 0;
  const fl = clamp((u - 0.28) / 0.54);
  const air = fl > 0 && fl < 1 ? Math.sin(fl * Math.PI) : 0;
  const land = u > 0.82 ? Math.sin(clamp((u - 0.82) / 0.18) * Math.PI) : 0;
  const y = -h * air;
  const paws: Record<PawKey, Vec> = {...PAW0};
  if (u >= 0.28 && u < 0.82) {
    const k = fl;
    paws.FN = V(lerp(84, 120, k), y + lerp(-60, -6, k * k));
    paws.FF = V(lerp(70, 104, k), y + lerp(-66, -10, k * k));
    paws.HN = V(lerp(-120, -70, k * k), y + lerp(-8, -44, k));
    paws.HF = V(lerp(-136, -86, k * k), y + lerp(-4, -40, k));
  } else if (u >= 0.82) {
    paws.FN = V(86, 0);
    paws.FF = V(70, 0);
    paws.HN = V(-60, Math.min(0, -24 * (1 - clamp((u - 0.82) / 0.1))));
    paws.HF = V(-76, Math.min(0, -20 * (1 - clamp((u - 0.84) / 0.1))));
  }
  return {
    ...alive(t, 4, 1),
    paws,
    bodyY: 30 * cr + 22 * land + y,
    pitch: u < 0.28 ? 0.08 * cr : u < 0.82 ? lerp(-0.3, 0.26, fl) : 0.1 * land,
    stretch: u < 0.28 ? -0.1 * cr : u < 0.82 ? 0.16 * Math.sin(fl * Math.PI) : -0.08 * land,
    neck: u < 0.28 ? 0.8 : 0.4,
    head: {pitch: lerp(-0.2, 0.15, fl), tilt: 0, turn: 0},
    ears: u > 0.28 && u < 0.82 ? -0.5 : 0.8,
    eye: {blink: 0, look: V(1, 0.2), pupil: 0.75, shine: 0},
    tail: {base: u > 0.28 && u < 0.82 ? 0.7 : 0, amp: 0.3, speed: 2, curl: 0.2},
    muscle: 1,
    travel: u < 0.28 ? 0 : u < 0.82 ? easeInOut(fl) : 1,
  };
}

/** Trepar: marcha en salto (pares de patas casi a la vez) sobre el tronco; la escena gira el
 *  cuerpo para que la corteza haga de "suelo". Las garras se clavan en cada apoyo. */
export function climb(t: number, cyc: number, effort = 0.5): LP {
  const ph = cyc * Math.PI * 2;
  return {
    ...alive(t, 5, 0.8),
    paws: pawsFor(CLIMB, cyc),
    bodyY: 6 + 4 * Math.cos(ph * 2),
    stretch: 0.1 * Math.sin(ph),
    pitch: 0.02,
    neck: 0.3,
    head: {pitch: -0.15, tilt: 0, turn: 0},
    ears: 0.3,
    tail: {base: -0.5 + 0.1 * Math.sin(ph), amp: 0.5, speed: 1.6, curl: 0.4},
    muscle: 0.7 + 0.3 * effort,
  };
}

/** Descanso sobre una rama: tronco apoyado, patas colgando, cola péndula que oscila. */
export function rest(t: number, sleepy = 0): LP {
  return {
    ...alive(t, 6, 0.1),
    bodyY: 74,
    pitch: 0.02,
    neck: 0.2,
    paws: {FN: V(78, 64 + 4 * Math.sin(t * 0.6)), FF: V(40, 30), HN: V(-60, 70 + 3 * Math.sin(t * 0.5 + 1)), HF: V(-96, 26)},
    head: {pitch: 0.1 * sleepy, tilt: 0.05 * Math.sin(t * 0.3), turn: 0.2},
    eye: {blink: Math.max(blink(t, 6), sleepy * 0.6), look: V(0.6, 0.2), pupil: 0.35, shine: 0},
    tail: {base: -1.0, amp: 0.35, speed: 0.6, curl: -0.2},
    muscle: 0.1,
    breathe: 0.5 + 0.5 * Math.sin(t * 1.2),
  };
}

/** Giro de cabeza y mirada hacia un punto (look −1…1 horizontal, up −1…1). */
export const look = (base: LP, turn: number, up: number): LP => ({...base, head: {pitch: -0.25 * up, tilt: 0.05 * turn, turn}, eye: {...(base.eye ?? {blink: 0, look: V(0, 0), pupil: 0.4, shine: 0}), look: V(turn, -up)}});

/** Interacción con un cachorro: baja la cabeza para olerlo/lamerlo. k 0…1. */
export function interact(t: number, k: number): LP {
  const e = easeInOut(clamp(k));
  return {...alive(t, 7, 0.3), neck: 0.6 * e, head: {pitch: 0.45 * e + 0.05 * Math.sin(t * 3) * e, tilt: 0.1 * e, turn: 0.1}, eye: {blink: e > 0.6 ? 0.55 : blink(t, 7), look: V(0.5, 0.6), pupil: 0.3, shine: 0}, tail: {base: 0.1, amp: 0.6, speed: 1.2, curl: 0.6}};
}

export function idle(t: number, seed = 0): LP {
  return {...alive(t, seed, 0.3), paws: {...PAW0}, head: {pitch: 0.03 * Math.sin(t * 0.5), tilt: 0.03 * Math.sin(t * 0.4), turn: 0.3 * Math.sin(t * 0.25 + seed)}};
}

/** Variación determinista de un valor (evita repeticiones idénticas). */
export const vary = (seed: number, k = 1) => 1 + (hash1(seed) - 0.5) * 0.12 * k;
