// MOVIMIENTO Y COREOGRAFÍA DE LAS HORMIGAS (reutiliza las trayectorias Catmull-Rom del motor de la orca y la
// orientación continua con histéresis del sistema de enfrentamientos de la batalla orca–tiburón).
//  · Protagonistas (vista lateral): claves [t, x]; la distancia recorrida integrada alimenta la marcha trípode
//    (pies fijos en el suelo); el cuerpo se adapta al terreno (altura y cabeceo bajo las patas); el frenado y la
//    aceleración salen de la propia curva; en los giros el cuerpo se escorza en lugar de voltearse de golpe.
//  · Colonias (vista superior): cada hormiga sigue un rastro con su propio desfase, velocidad, carril lateral,
//    exploración y semilla de marcha; nunca comparten exactamente el mismo ciclo.
// Estados: IDLE, WALKING, RUNNING, EXPLORING, CLIMBING, ANTENNA_SCANNING, FOOD_DETECTED, FOOD_CARRYING,
// COMMUNICATING, TARGET_DETECTED, APPROACHING, DEFENDING, BITING, STINGING, DODGING, RETREATING, RECRUITING,
// COLONY_MOVEMENT.
import {clamp, hash1} from '../../../engine/math';
import {Key, pathAt} from '../../orca-reina-oceanos/character/motion';
import {AntPose, Ground} from './AntSide';
import {TopPose} from './AntTop';
import {AntSpec, scaleFor, V} from './species';
import {groundY, onGround} from '../world/Macro';

export type XKey = [number, number];
const toKeys = (k: XKey[]): Key[] => k.map(([t, x]) => [t, x, 0]);

/** Pose lateral de un protagonista a lo largo de sus claves. */
export function heroAt(spec: AntSpec, keys: XKey[], t: number, extra: Partial<AntPose> = {}, ground: Ground = groundY, mmScale = 1): AntPose {
  const K = toKeys(keys);
  const sc = scaleFor(spec) * mmScale;
  const p = pathAt(K, t);
  // orientación continua: media de la dirección en ±0,3 s; al estar casi quieta conserva su último lado
  let acc = 0;
  for (let k = -3; k <= 3; k++) acc += Math.tanh(pathAt(K, t + k * 0.1).vx / 25);
  let f = acc / 7;
  if (Math.abs(p.vx) < 30 && Math.abs(f) < 0.9) {
    let last = 0;
    for (let b = 0.2; b <= 12 && last === 0; b += 0.2) {
      const v = pathAt(K, t - b).vx;
      if (Math.abs(v) > 40) last = Math.sign(v);
    }
    f = last || (f >= 0 ? 1 : -1);
  }
  const s = f >= 0 ? 1 : -1;
  f = s * Math.max(0.25, Math.abs(f));
  // distancia recorrida (unidades locales) integrada desde la primera clave
  let dist = 0;
  const t0 = keys[0][0];
  let prev = pathAt(K, t0).x;
  for (let u = t0 + 1 / 30; u <= t; u += 1 / 30) {
    const x = pathAt(K, u).x;
    dist += Math.abs(x - prev);
    prev = x;
  }
  dist += Math.abs(p.x - prev);
  const g = onGround(p.x, s, sc, spec.ground, ground);
  return {x: p.x, y: g.y, angle: g.angle, facing: f, scale: sc, t, dist: dist / sc, speed: clamp(Math.abs(p.vx) / (500 * sc), 0.3, 1.3), scan: Math.abs(p.vx) < 20 ? 1 : 0.5, ...extra};
}

// ------------------------------------------------------------------ colonias (vista superior)
export type Trail = {pts: V[]; len: number[]; total: number};
export function makeTrail(pts: V[]): Trail {
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  return {pts, len, total: len[len.length - 1]};
}
export function trailAt(tr: Trail, s: number) {
  const ss = clamp(s, 0, tr.total);
  let i = 1;
  while (i < tr.pts.length - 1 && tr.len[i] < ss) i++;
  const a = tr.pts[i - 1];
  const b = tr.pts[i];
  const k = (ss - tr.len[i - 1]) / Math.max(1e-6, tr.len[i] - tr.len[i - 1]);
  return {x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, h: Math.atan2(b.y - a.y, b.x - a.x)};
}
export type ColonyMember = {trail: Trail; start: number; speed: number; lane: number; seed: number; stop: number; mm: number};
/** Hormiga de una colonia en el instante t: avanza por su rastro, frena al llegar y explora. */
export function memberAt(spec: AntSpec, m: ColonyMember, t: number, reverseAt?: number): TopPose {
  const sc = scaleFor(spec, m.mm);
  let s = Math.max(0, (t - m.start) * m.speed);
  // frenado progresivo al llegar a su posición de parada
  if (s > m.stop) s = m.stop + (1 - Math.exp(-(s - m.stop) / 120)) * 60;
  let heading: number;
  let pos: {x: number; y: number; h: number};
  let dist: number;
  if (reverseAt !== undefined && t > reverseAt) {
    const sStop = Math.max(0, Math.min(m.stop + 60, (reverseAt - m.start) * m.speed));
    const back = (t - reverseAt) * m.speed * 1.25;
    const sb = Math.max(0, sStop - back);
    pos = trailAt(m.trail, sb);
    heading = pos.h + Math.PI;
    dist = (sStop + back) / sc;
  } else {
    pos = trailAt(m.trail, s);
    heading = pos.h;
    dist = s / sc;
  }
  const n = Math.sin(t * 0.9 + m.seed * 6) * 0.12;
  const side = {x: -Math.sin(pos.h), y: Math.cos(pos.h)};
  return {x: pos.x + side.x * m.lane, y: pos.y + side.y * m.lane, heading: heading + n, scale: sc, t, dist, seed: m.seed, scan: 0.7, detail: 0.4};
}
/** Genera una colonia sobre varios rastros con variaciones individuales. */
export function makeColony(trails: Trail[], n: number, opts: {t0: number; spread: number; speed: [number, number]; lanes: number; stopFrac: [number, number]; mm: [number, number]; seed: number}): ColonyMember[] {
  return Array.from({length: n}, (_, i) => {
    const tr = trails[i % trails.length];
    const h = (k: number) => hash1(opts.seed + i * 7.31 + k);
    return {
      trail: tr, start: opts.t0 + h(1) * opts.spread, speed: opts.speed[0] + h(2) * (opts.speed[1] - opts.speed[0]), lane: (h(3) - 0.5) * opts.lanes, seed: h(4) * 10,
      stop: tr.total * (opts.stopFrac[0] + h(5) * (opts.stopFrac[1] - opts.stopFrac[0])), mm: opts.mm[0] + h(6) * (opts.mm[1] - opts.mm[0]),
    };
  });
}
export const _k = {hash1};
