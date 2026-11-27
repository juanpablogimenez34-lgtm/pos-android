// Movimientos de los personajes (todo determinista, función del tiempo y de la música):
// caminar, correr, saltar, agacharse, señalar, aplaudir, saludar, bailar (varios pasos), flotar,
// parpadear y cantar (boca con la envolvente de voz). Animación secundaria para cola, orejas y antenas.
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {beatPhase, vocal} from '../MusicSync/songMap';
import {BasePose, basePose, Expression, Limb, NEUTRAL_EXPR} from '../Characters/parts';

export const L = (a: number, b: number): Limb => ({a, b});

/** Parpadeo natural (cada 2,6–4 s, distinto por personaje). */
export const blink = (t: number, seed: number) => {
  const per = 2.6 + (seed % 7) * 0.2;
  const ph = (t + seed * 0.77) % per;
  return ph < 0.13 ? Math.sin((ph / 0.13) * Math.PI) : 0;
};

/** Expresión con parpadeo y, si canta, boca movida por la envolvente de la voz real. */
export function expr(t: number, seed: number, o: Partial<Expression> = {}, sing = 0): Expression {
  const v = vocal(t);
  const open = sing > 0 ? clamp(v * 1.15 * sing) : 0;
  return {...NEUTRAL_EXPR, blink: blink(t, seed), ...o, mouth: open > 0.2 ? 'open' : o.mouth ?? 'smile', mouthOpen: Math.max(o.mouthOpen ?? 0, open)};
}

/** Ciclo de marcha: piernas alternas, brazos opuestos y rebote. `ph` en ciclos. */
export function walk(ph: number, amp = 1): Partial<BasePose> {
  const s = Math.sin(ph * Math.PI * 2);
  const c = Math.cos(ph * Math.PI * 2);
  return {
    legL: L(0.5 * s * amp, -Math.max(0, -c) * 0.8 * amp),
    legR: L(-0.5 * s * amp, -Math.max(0, c) * 0.8 * amp),
    armL: L(0.15 - 0.45 * s * amp, -0.4),
    armR: L(-0.15 + 0.45 * s * amp, 0.4),
    bob: -Math.abs(Math.sin(ph * Math.PI * 2)) * 6 * amp,
    lean: 0.05 * amp,
  };
}

/** Salto parabólico entre t0 y t0 + d (anticipación, vuelo y aterrizaje con aplastamiento). */
export function hop(t: number, t0: number, d: number, h: number): Partial<BasePose> & {dy: number} {
  const u = (t - t0) / d;
  if (u < -0.15 || u > 1.15) return {dy: 0};
  if (u < 0) return {dy: 0, squash: 0.12 * smoothstep(-0.15, 0, u), legL: L(0.3, -0.7), legR: L(-0.3, 0.7)};
  if (u > 1) return {dy: 0, squash: 0.14 * (1 - smoothstep(1, 1.15, u)), legL: L(0.25, -0.5), legR: L(-0.25, 0.5)};
  return {dy: -4 * h * u * (1 - u), squash: -0.08 * Math.sin(u * Math.PI), legL: L(0.4, -0.9), legR: L(-0.2, 0.6), armL: L(2.2, 0.3), armR: L(-2.2, -0.3)};
}

/** Pasos de baile sincronizados con los pulsos detectados (cada personaje con su estilo). */
export type DanceStyle = 'bounce' | 'sway' | 'arms' | 'twist' | 'robot' | 'wiggle';
export function dance(t: number, style: DanceStyle, energy = 1): Partial<BasePose> {
  const {i, ph} = beatPhase(t);
  const on = Math.exp(-ph * 5); // golpe en cada pulso
  const alt = i % 2 === 0 ? 1 : -1;
  const s = Math.sin(ph * Math.PI) * alt;
  const e = energy;
  switch (style) {
    case 'bounce':
      return {bob: -14 * Math.sin(ph * Math.PI) * e, squash: 0.06 * on * e, armL: L(0.6 + 0.6 * on * e, -0.8), armR: L(-0.6 - 0.6 * on * e, 0.8), legL: L(0.1, -0.2 * on), legR: L(-0.1, 0.2 * on), headTilt: 0.08 * s * e};
    case 'sway':
      return {lean: 0.14 * s * e, headTilt: -0.1 * s * e, armL: L(0.9 + 0.4 * s * e, -0.5), armR: L(-0.9 + 0.4 * s * e, 0.5), bob: -6 * on * e};
    case 'arms':
      return {armL: L(2.6 - 0.5 * on * e, 0.4 * alt), armR: L(-2.6 + 0.5 * on * e, -0.4 * alt), bob: -10 * Math.sin(ph * Math.PI) * e, headTilt: 0.06 * s};
    case 'twist':
      return {lean: 0.1 * s * e, legL: L(0.25 * s * e, -0.3), legR: L(0.25 * s * e, 0.3), armL: L(1.2, -1.4 * (0.5 + 0.5 * s)), armR: L(-1.2, 1.4 * (0.5 - 0.5 * s)), bob: -8 * on * e};
    case 'robot':
      return {armL: L(i % 4 < 2 ? 1.57 : 0.3, i % 4 < 2 ? -1.57 : 0), armR: L(i % 4 >= 2 ? -1.57 : -0.3, i % 4 >= 2 ? 1.57 : 0), headTilt: 0.12 * alt * on, bob: -6 * on * e};
    case 'wiggle':
      return {lean: 0.18 * Math.sin(t * 8) * e * 0.5, bob: -12 * Math.sin(ph * Math.PI) * e, armL: L(1.8 + 0.4 * s, 0.3), armR: L(-1.8 + 0.4 * s, -0.3), headTilt: 0.12 * s};
  }
}

/** Flotar en gravedad reducida (vaivén lento y extremidades sueltas). */
export function float(t: number, seed: number): Partial<BasePose> {
  return {
    bob: Math.sin(t * 1.3 + seed) * 14,
    lean: Math.sin(t * 0.9 + seed) * 0.18,
    armL: L(1.2 + 0.3 * Math.sin(t * 1.7 + seed), -0.4),
    armR: L(-1.2 + 0.3 * Math.sin(t * 1.5 + seed), 0.4),
    legL: L(0.35 + 0.15 * Math.sin(t * 1.2 + seed), -0.5),
    legR: L(-0.25 + 0.15 * Math.sin(t * 1.4 + seed), 0.4),
  };
}

export const point = (side: 1 | -1 = 1): Partial<BasePose> => (side === 1 ? {armR: L(-1.75, 0.05)} : {armL: L(1.75, -0.05)});
export const wave = (t: number, side: 1 | -1 = 1): Partial<BasePose> => (side === 1 ? {armR: L(-2.7 + Math.sin(t * 10) * 0.3, -0.5)} : {armL: L(2.7 + Math.sin(t * 10) * 0.3, 0.5)});
export const clap = (t: number): Partial<BasePose> => {
  const {ph} = beatPhase(t);
  const k = Math.sin(ph * Math.PI);
  return {armL: L(1.1, -1.2 - 0.4 * k), armR: L(-1.1, 1.2 + 0.4 * k)};
};
export const crouch = (k: number): Partial<BasePose> => ({squash: 0.12 * k, legL: L(0.6 * k, -1.2 * k), legR: L(-0.2 * k, 0.9 * k), bob: 18 * k});

/** Mezcla de dos poses parciales (para transiciones suaves entre acciones). */
export function mixPose(a: Partial<BasePose>, b: Partial<BasePose>, k: number): Partial<BasePose> {
  const out: Record<string, unknown> = {...a};
  for (const [key, vb] of Object.entries(b)) {
    const va = (a as Record<string, unknown>)[key];
    if (typeof vb === 'number') out[key] = lerp(typeof va === 'number' ? va : (basePose() as unknown as Record<string, number>)[key] ?? 0, vb, k);
    else if (vb && typeof vb === 'object' && 'a' in (vb as object)) {
      const la = (va as Limb) ?? ((basePose() as unknown as Record<string, Limb>)[key] as Limb);
      out[key] = L(lerp(la.a, (vb as Limb).a, k), lerp(la.b, (vb as Limb).b, k));
    } else if (k > 0.5) out[key] = vb;
  }
  return out as Partial<BasePose>;
}

/** Cola de Nico: balanceo con retraso respecto al cuerpo (animación secundaria). */
export const tailFor = (t: number, energy: number, lean: number) => ({sway: Math.sin(t * 2.4 - 0.6) * (0.5 + 0.5 * energy) - lean * 2, curl: 0.35 + 0.25 * Math.sin(t * 1.3)});
/** Orejas de Luna: cada una con su fase y respuesta al rebote. */
export const earsFor = (t: number, bob: number, surprise = 0) => ({
  earL: {a: -0.16 + 0.07 * Math.sin(t * 2.3) - surprise * 0.1, bend: -0.25 + 0.2 * Math.sin(t * 1.9 - 0.4) + bob * 0.012},
  earR: {a: 0.18 + 0.06 * Math.sin(t * 2.9 + 1) + surprise * 0.1, bend: 0.45 + 0.25 * Math.sin(t * 2.2 + 0.3) - bob * 0.015 - surprise * 0.3},
});
/** Antenas de Zumi. */
export const antennaeFor = (t: number, bob: number) => ({antL: {a: -0.35 + 0.15 * Math.sin(t * 3), bend: -0.35 * Math.sin(t * 2.2 - 0.5) + bob * 0.01}, antR: {a: 0.35 + 0.15 * Math.sin(t * 3 + 1.2), bend: 0.35 * Math.sin(t * 2.6 - 0.2) - bob * 0.01}});
