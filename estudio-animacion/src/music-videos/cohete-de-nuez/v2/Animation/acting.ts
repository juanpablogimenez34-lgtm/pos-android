// ACTUACIÓN 2.0: poses clave con curvas (anticipación, sobreimpulso, golpe), expresiones con
// parpadeo y canto, constructores de pose de los cuatro personajes y coreografías por personaje
// sincronizadas con los pulsos medidos de la canción.
import {clamp, easeInOut, lerp} from '../../../../engine/math';
import {Limb} from '../../Characters/parts';
import {blink, earsFor, antennaeFor, tailFor} from '../../Animation/moves';
import {beatPhase, beatPulse, vocal} from '../../MusicSync/songMap';
import {Bip2Pose, BipScreen2} from '../Characters/Bip2';
import {Luna2Pose} from '../Characters/Luna2';
import {Nico2Pose} from '../Characters/Nico2';
import {Zumi2Pose} from '../Characters/Zumi2';
import {EXPR2, Expr2, Hold, Pose2, pose2} from '../rig';

export const L = (a: number, b: number): Limb => ({a, b});
export type PK = Partial<Omit<Pose2, 'expr'>> & {expr?: Partial<Expr2>; dx?: number; dy?: number};

// ---------------------------------------------------------------- curvas
export type Ease = 'io' | 'back' | 'over' | 'snap' | 'lin' | 'hold';
const S = 1.70158;
export const ease = (k: Ease, u: number) => {
  u = clamp(u);
  switch (k) {
    case 'lin':
      return u;
    case 'snap':
      return 1 - Math.pow(1 - u, 3);
    case 'over': {
      const v = u - 1;
      return 1 + v * v * ((S + 1) * v + S);
    }
    case 'back': {
      // anticipación (retrocede un poco) y sobreimpulso al final
      const s2 = S * 1.2;
      return u < 0.5 ? (Math.pow(2 * u, 2) * ((s2 + 1) * 2 * u - s2)) / 2 : (Math.pow(2 * u - 2, 2) * ((s2 + 1) * (u * 2 - 2) + s2) + 2) / 2;
    }
    case 'hold':
      return u < 1 ? 0 : 1;
    default:
      return easeInOut(u);
  }
};

// ---------------------------------------------------------------- mezcla de poses
const isLimb = (v: unknown): v is Limb => !!v && typeof v === 'object' && 'a' in (v as object) && 'b' in (v as object);
function mixVal(a: unknown, b: unknown, k: number): unknown {
  if (typeof a === 'number' && typeof b === 'number') return lerp(a, b, k);
  if (isLimb(a) && isLimb(b)) return L(lerp(a.a, b.a, k), lerp(a.b, b.b, k));
  if (a && b && typeof a === 'object' && typeof b === 'object' && 'x' in a && 'y' in b) {
    const va = a as {x: number; y: number};
    const vb = b as {x: number; y: number};
    return {x: lerp(va.x, vb.x, k), y: lerp(va.y, vb.y, k)};
  }
  if (a && b && typeof a === 'object' && typeof b === 'object' && !('kind' in a)) {
    const out: Record<string, unknown> = {...(a as object)};
    for (const [kk, vb] of Object.entries(b)) out[kk] = kk in out ? mixVal(out[kk], vb, k) : vb;
    return out;
  }
  return k < 0.5 ? a ?? b : b;
}
export function mixPK(a: PK, b: PK, k: number): PK {
  const out: Record<string, unknown> = {...a};
  for (const [key, vb] of Object.entries(b)) out[key] = key in out ? mixVal(out[key], vb, k) : vb;
  return out as PK;
}

/** Poses clave: [tiempo, pose, curva hacia ESTA clave]. Entre claves se mezcla con la curva. */
export type Key = [number, PK, Ease?];
export function keyed(t: number, keys: Key[]): PK {
  if (t <= keys[0][0]) return keys[0][1];
  let acc: PK = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, p1, e1] = keys[i];
    const t0 = keys[i - 1][0];
    const full = mixPK(acc, p1, 1);
    if (t < t1) return mixPK(acc, p1, ease(e1 ?? 'io', (t - t0) / Math.max(1e-3, t1 - t0)));
    acc = full;
  }
  return acc;
}

// ---------------------------------------------------------------- expresiones
/** Expresión completa: parpadeo propio y, si canta, boca con la envolvente de voz real. */
export function ex(t: number, seed: number, o: Partial<Expr2> = {}, sing = 0): Expr2 {
  const v = sing > 0 ? clamp(vocal(t) * 1.15 * sing) : 0;
  const e: Expr2 = {...EXPR2, blink: o.eyes && o.eyes !== 'normal' ? 0 : blink(t, seed), ...o};
  if (v > 0.18 && (e.mouth === 'smile' || e.mouth === 'grin' || e.mouth === 'open')) return {...e, mouth: 'open', mouthOpen: Math.max(e.mouthOpen, v)};
  return {...e, mouthOpen: Math.max(e.mouthOpen, v * 0.6)};
}

// ---------------------------------------------------------------- constructores
function base(t: number, seed: number, o: PK): Pose2 {
  const {expr: eo, dx = 0, dy = 0, ...rest} = o;
  const p = pose2({t, ...rest});
  p.x += dx;
  p.y += dy;
  p.expr = {...EXPR2, blink: blink(t, seed), ...(eo ?? {})};
  if (eo?.eyes && eo.eyes !== 'normal') p.expr.blink = 0;
  return p;
}
export function nico2(t: number, o: PK = {}, x: Partial<Pick<Nico2Pose, 'tail' | 'belt'>> = {}, energy = 0.5): Nico2Pose {
  const p = base(t, 1, o);
  return {...p, tail: tailFor(t, energy, p.lean), belt: 0, ...x};
}
export function luna2(t: number, o: PK = {}, surprise = 0, x: Partial<Pick<Luna2Pose, 'earL' | 'earR'>> = {}): Luna2Pose {
  const p = base(t, 4, o);
  return {...p, ...earsFor(t, p.bob, surprise), ...x};
}
export function bip2(t: number, o: PK = {}, screen: Partial<BipScreen2> = {}, x: Partial<Pick<Bip2Pose, 'lights' | 'antenna'>> = {}): Bip2Pose {
  const p = base(t, 6, o);
  return {...p, screen: {mode: 'face', value: '', face: 'happy', ...screen}, lights: 1, antenna: 0.5 + 0.5 * Math.sin(t * 4), ...x};
}
export function zumi2(t: number, o: PK = {}): Zumi2Pose {
  const p = base(t, 9, o);
  return {...p, ...antennaeFor(t, p.bob)};
}

export const hold = (kind: Hold['kind'], rot = 0, s = 1): Hold => ({kind, rot, s});

// ---------------------------------------------------------------- gestos útiles
export const reach = (side: 1 | -1, up: number, bend = 0.3): PK => (side === 1 ? {armR: L(-1.57 - up, bend)} : {armL: L(1.57 + up, -bend)});
export const pointAt = (side: 1 | -1 = 1, up = 0.1): PK => (side === 1 ? {armR: L(-1.7 - up, 0.05), gripR: 0.85} : {armL: L(1.7 + up, -0.05), gripL: 0.85});
export const waveArm = (t: number, side: 1 | -1 = 1, speed = 10): PK => (side === 1 ? {armR: L(-2.75 + Math.sin(t * speed) * 0.32, -0.55 + Math.sin(t * speed + 0.6) * 0.25), gripR: 0} : {armL: L(2.75 + Math.sin(t * speed) * 0.32, 0.55 - Math.sin(t * speed + 0.6) * 0.25), gripL: 0});
export const cheer = (t: number): PK => ({armL: L(2.7, 0.25 + 0.1 * Math.sin(t * 9)), armR: L(-2.7, -0.25 - 0.1 * Math.sin(t * 9 + 1)), gripL: 0.9, gripR: 0.9});
export const crouchK = (k: number): PK => ({squash: 0.12 * k, legL: L(0.6 * k, -1.2 * k), legR: L(-0.2 * k, 0.9 * k), bob: 18 * k});
export const walkCycle = (ph: number, amp = 1): PK => {
  const s = Math.sin(ph * Math.PI * 2);
  const c = Math.cos(ph * Math.PI * 2);
  return {legL: L(0.5 * s * amp, -Math.max(0, -c) * 0.8 * amp), legR: L(-0.5 * s * amp, -Math.max(0, c) * 0.8 * amp), armL: L(0.15 - 0.45 * s * amp, -0.4), armR: L(-0.15 + 0.45 * s * amp, 0.4), bob: -Math.abs(s) * 6 * amp, lean: 0.05 * amp};
};
/** Salto con anticipación (agacharse), vuelo y aterrizaje con aplastamiento. */
export function jump(t: number, t0: number, d: number, h: number): PK {
  const u = (t - t0) / d;
  if (u < -0.2 || u > 1.25) return {};
  if (u < 0) return {...crouchK(-u < 0.1 ? 1 : (0.2 + u) / 0.1), armL: L(-0.3, -0.4), armR: L(0.3, 0.4)};
  if (u > 1) return crouchK(1 - (u - 1) / 0.25);
  return {bob: -4 * h * u * (1 - u), squash: -0.1 * Math.sin(u * Math.PI), legL: L(0.4, -0.9), legR: L(-0.2, 0.6), armL: L(2.4, 0.3), armR: L(-2.4, -0.3)};
}

// ---------------------------------------------------------------- coreografías (estribillos)
const on = (ph: number) => Math.exp(-ph * 5);
/** Anticipación dentro del pulso: baja un poco antes del golpe y sube con suavidad tras él. */
const pump = (ph: number) => (ph < 0.82 ? Math.sin((ph / 0.82) * Math.PI) : -0.35 * Math.sin(((ph - 0.82) / 0.18) * Math.PI));

/** Nico: balanceo lateral, brazos alternos y cola al ritmo. */
export function nicoDance(t: number, e = 1): PK & {tailK: number} {
  const {i, ph} = beatPhase(t);
  const two = ((i % 2) + ph) / 2; // ciclo de dos pulsos
  const sway = Math.sin(two * Math.PI * 2);
  const alt = i % 2 === 0 ? 1 : -1;
  const up = ease('over', clamp(ph * 3)) * (1 - ph * 0.6);
  return {
    dx: 28 * sway * e,
    lean: -0.13 * sway * e,
    headTilt: 0.12 * sway * e,
    bob: -12 * pump(ph) * e,
    squash: 0.05 * on(ph) * e,
    armL: alt > 0 ? L(2.5 - 0.5 * (1 - up), 0.35) : L(0.7, -0.9),
    armR: alt < 0 ? L(-2.5 + 0.5 * (1 - up), -0.35) : L(-0.7, 0.9),
    gripL: 0.6,
    gripR: 0.6,
    legL: L(0.12 * sway, -0.2 * on(ph)),
    legR: L(0.12 * sway, 0.2 * on(ph)),
    twist: 0.5 * sway * e,
    tailK: sway,
  };
}

/** Luna: saltitos en cada pulso, giro cada 8 pulsos (con anticipación) y orejas que rebotan. */
export function lunaDance(t: number, e = 1): PK & {earFlop: number} {
  const {i, ph} = beatPhase(t);
  const spinBeat = i % 8 === 7;
  const hopH = spinBeat ? 0 : 34 * e;
  const air = Math.sin(Math.min(1, ph / 0.7) * Math.PI) * (ph < 0.7 ? 1 : 0);
  const land = ph > 0.7 ? Math.sin(((ph - 0.7) / 0.3) * Math.PI) : 0;
  const spin = spinBeat ? ease('back', ph) * Math.PI * 2 : 0;
  const alt = i % 2 === 0 ? 1 : -1;
  return {
    bob: -hopH * air + 6 * land,
    squash: -0.06 * air + 0.1 * land + (spinBeat ? 0.08 * Math.sin(ph * Math.PI) : 0),
    spin,
    armL: L(1.0 + 0.9 * air + (spinBeat ? 1.2 : 0), -0.6),
    armR: L(-1.0 - 0.9 * air - (spinBeat ? 1.2 : 0), 0.6),
    gripL: 0.2,
    gripR: 0.2,
    legL: L(0.25 * air, -0.7 * air),
    legR: L(-0.15 * air, 0.5 * air),
    headTilt: 0.1 * alt * e,
    earFlop: air - land,
  };
}

/** Bip: pasos robóticos (cortes secos), brazos alternos en ángulo recto y luces al ritmo. */
export function bipDance(t: number, e = 1): PK & {lightsK: number} {
  const {i, ph} = beatPhase(t);
  const step = [0, 1, 0, -1][i % 4];
  const prev = [0, 1, 0, -1][(i + 3) % 4];
  const k = ease('snap', clamp(ph * 4));
  const pose = i % 4;
  const arms: [Limb, Limb][] = [
    [L(1.57, -1.57), L(-0.3, 0)],
    [L(0.3, 0), L(-1.57, 1.57)],
    [L(2.8, 0), L(-2.8, 0)],
    [L(1.57, 0), L(-1.57, 0)],
  ];
  const pa = arms[(pose + 3) % 4];
  const pb = arms[pose];
  const mixL = (a: Limb, b: Limb) => L(lerp(a.a, b.a, ease('over', clamp(ph * 4))), lerp(a.b, b.b, ease('over', clamp(ph * 4))));
  return {
    dx: lerp(prev, step, k) * 30 * e,
    armL: mixL(pa[0], pb[0]),
    armR: mixL(pa[1], pb[1]),
    gripL: 0.8,
    gripR: 0.8,
    headTilt: (i % 2 ? 0.14 : -0.14) * k * e,
    bob: -8 * on(ph) * e,
    legL: L(step < 0 ? 0.35 * (1 - k) : 0, 0),
    legR: L(step > 0 ? -0.35 * (1 - k) : 0, 0),
    lightsK: beatPulse(t, 8),
  };
}

/** Zumi: saltos, giro cada 4 pulsos y antenas que latiguean. */
export function zumiDance(t: number, e = 1): PK {
  const {i, ph} = beatPhase(t);
  const spinBeat = i % 4 === 3;
  const air = ph < 0.65 ? Math.sin((ph / 0.65) * Math.PI) : 0;
  return {
    bob: -40 * air * e,
    squash: ph > 0.65 ? 0.12 * Math.sin(((ph - 0.65) / 0.35) * Math.PI) : -0.08 * air,
    spin: spinBeat ? ease('back', ph) * Math.PI * 2 : 0,
    armL: L(2.2 + 0.5 * air, 0.4),
    armR: L(-2.2 - 0.5 * air, -0.4),
    gripL: 0,
    gripR: 0,
    legL: L(0.3 * air, -0.6 * air),
    legR: L(-0.3 * air, 0.6 * air),
    headTilt: (i % 2 ? 0.12 : -0.12) * e,
  };
}

/** Paso común (planos generales): todos aplauden arriba en el primer tiempo de cada dos pulsos. */
export function unison(t: number): PK {
  const {i, ph} = beatPhase(t);
  const k = i % 2 === 0 ? ease('over', clamp(ph * 3)) : 1 - ease('io', ph);
  return {armL: L(1.4 + 1.3 * k, -0.6 + 0.5 * k), armR: L(-1.4 - 1.3 * k, 0.6 - 0.5 * k), bob: -14 * Math.sin(ph * Math.PI), squash: 0.06 * on(ph), gripL: 0, gripR: 0};
}
