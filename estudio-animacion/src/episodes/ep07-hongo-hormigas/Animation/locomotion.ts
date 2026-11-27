// Copia de ep05-planta-carnivora/anatomy/locomotion.ts (los episodios anteriores no se modifican).
// Locomoción sobre superficies ilustradas: la mosca y la araña caminan en el espacio de
// parámetros de una superficie (hoja caída, lóbulo de la trampa). Las patas en apoyo quedan
// FIJAS en el mundo mientras el cuerpo avanza (sin patinar) y siempre sobre la superficie.
import {clamp, lerp} from '../../../engine/math';
import {add, cross, dot, norm, scl, sub, V3} from './proj';

export type Surface = {
  id: string;
  point: (a: number, b: number) => V3;
  normal: (a: number, b: number) => V3; // hacia el lado por el que se camina
};

/** Marco del cuerpo sobre la superficie: x adelante, y normal, z lateral. */
export function bodyFrame(surf: Surface, a: number, b: number, heading: number) {
  const p = surf.point(a, b);
  const n = surf.normal(a, b);
  const d = 0.5;
  const ahead = surf.point(a + Math.cos(heading) * d, b + Math.sin(heading) * d);
  let f = sub(ahead, p);
  f = norm(sub(f, scl(n, dot(f, n))));
  const side = cross(f, n);
  return {p, n, f, side};
}

/** Camino con claves (t, a, b). Interpolación lineal suavizada entre claves. */
export type WalkKey = [number, number, number];

export type WalkPath = {keys: WalkKey[]; table: {t: number; s: number}[]};

export function makeWalk(keys: WalkKey[]): WalkPath {
  const table: {t: number; s: number}[] = [];
  const t0 = keys[0][0];
  const t1 = keys[keys.length - 1][0];
  const steps = Math.max(40, Math.ceil((t1 - t0) * 30));
  let s = 0;
  let prev = posAtKeys(keys, t0);
  for (let i = 0; i <= steps; i++) {
    const t = t0 + ((t1 - t0) * i) / steps;
    const q = posAtKeys(keys, t);
    s += Math.hypot(q.a - prev.a, q.b - prev.b);
    table.push({t, s});
    prev = q;
  }
  return {keys, table};
}

function posAtKeys(keys: WalkKey[], t: number) {
  if (t <= keys[0][0]) return {a: keys[0][1], b: keys[0][2]};
  const n = keys.length;
  if (t >= keys[n - 1][0]) return {a: keys[n - 1][1], b: keys[n - 1][2]};
  let i = 0;
  while (i < n - 2 && t > keys[i + 1][0]) i++;
  const [ta, aa, ba] = keys[i];
  const [tb, ab, bb] = keys[i + 1];
  const u = clamp((t - ta) / (tb - ta));
  const e = u * u * (3 - 2 * u); // arranque y parada suaves
  return {a: lerp(aa, ab, e), b: lerp(ba, bb, e)};
}

export const walkPos = (w: WalkPath, t: number) => posAtKeys(w.keys, t);

/** Distancia recorrida hasta t. */
export function walkS(w: WalkPath, t: number) {
  const tb = w.table;
  if (t <= tb[0].t) return 0;
  if (t >= tb[tb.length - 1].t) return tb[tb.length - 1].s;
  let lo = 0;
  let hi = tb.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (tb[m].t <= t) lo = m;
    else hi = m;
  }
  const k = (t - tb[lo].t) / (tb[hi].t - tb[lo].t || 1);
  return lerp(tb[lo].s, tb[hi].s, k);
}

/** Instante en que se alcanzó la distancia s (inversa de walkS). */
export function walkTimeAtS(w: WalkPath, s: number) {
  const tb = w.table;
  if (s <= 0) return tb[0].t;
  if (s >= tb[tb.length - 1].s) return tb[tb.length - 1].t;
  let lo = 0;
  let hi = tb.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (tb[m].s <= s) lo = m;
    else hi = m;
  }
  const k = (s - tb[lo].s) / (tb[hi].s - tb[lo].s || 1);
  return lerp(tb[lo].t, tb[hi].t, k);
}

/** Rumbo (en el plano de parámetros) a partir de la dirección del camino. */
export function walkHeading(w: WalkPath, t: number, fallback: number) {
  // se mira hacia la siguiente porción del camino con movimiento
  const a = walkPos(w, t - 0.15);
  const b = walkPos(w, t + 0.15);
  const da = b.a - a.a;
  const db = b.b - a.b;
  if (Math.hypot(da, db) < 0.4) return fallback;
  return Math.atan2(db, da);
}

export type LegRest = {fwd: number; side: number; group: 0 | 1};

/**
 * Posición de un pie con marcha alterna (trípode en la mosca, tetrápodo en la araña).
 * - stance: el pie queda fijo donde se apoyó.
 * - swing: viaja al siguiente apoyo describiendo un arco (lift).
 * Devuelve el punto en el mundo y la elevación del pie (0 = apoyado).
 */
export function footOnSurface(
  surf: Surface,
  w: WalkPath,
  t: number,
  leg: LegRest,
  stride: number,
  headingAt: (t: number) => number,
  duty = 0.6,
) {
  const s = walkS(w, t);
  const off = leg.group * 0.5;
  const cyc = s / stride + off;
  const k = Math.floor(cyc);
  const ph = cyc - k;
  const plantS = (kk: number) => (kk - off + duty * 0.5) * stride;
  const placeAt = (sp: number) => {
    const tt = walkTimeAtS(w, sp);
    const q = walkPos(w, tt);
    const h = headingAt(tt);
    const c = Math.cos(h);
    const sn = Math.sin(h);
    // el pie se adelanta media zancada respecto al cuerpo en el centro del apoyo
    const fa = leg.fwd;
    const fb = leg.side;
    return {a: q.a + c * fa - sn * fb, b: q.b + sn * fa + c * fb};
  };
  let a: number;
  let b: number;
  let lift = 0;
  if (ph < duty) {
    const p = placeAt(plantS(k));
    a = p.a;
    b = p.b;
  } else {
    const u = (ph - duty) / (1 - duty);
    const p0 = placeAt(plantS(k));
    const p1 = placeAt(plantS(k + 1));
    const e = u * u * (3 - 2 * u);
    a = lerp(p0.a, p1.a, e);
    b = lerp(p0.b, p1.b, e);
    // si el cuerpo se ha detenido, el pie se apoya donde está (no queda en el aire)
    const moving = clamp((walkS(w, t + 0.05) - walkS(w, t - 0.05)) / 0.1 / (stride * 0.4));
    lift = Math.sin(Math.PI * u) * moving;
  }
  const p = surf.point(a, b);
  const n = surf.normal(a, b);
  return {p: add(p, scl(n, lift * stride * 0.3)), lift, n};
}
