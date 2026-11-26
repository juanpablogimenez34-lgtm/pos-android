// SISTEMA DE NATACIÓN Y SALTOS: trayectorias suaves (Catmull-Rom en el tiempo) de las que salen la orientación,
// la velocidad y la intensidad del batido; fase de la cola integrada (la frecuencia sigue a la velocidad);
// salto en 10 fases (aceleración, orientación, propulsión, ruptura de la superficie, elevación, flexión en el
// aire, descenso, contacto, salpicadura, regreso a la natación). Estados: RESTING, SWIMMING, EXPLORING, DIVING,
// SURFACING, BREATHING, ACCELERATING, BREACHING, HUNTING, GROUP_HUNTING, COMMUNICATING, FEEDING, CALF_PLAYING.
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {Kind, OrcaPose} from './Orca';

export type Key = [number, number, number]; // t, x, y
const cr = (a: number, b: number, c: number, d: number, u: number) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
export function pathAt(keys: Key[], t: number) {
  const n = keys.length;
  const at = (tt: number) => {
    if (tt <= keys[0][0]) return {x: keys[0][1], y: keys[0][2]};
    if (tt >= keys[n - 1][0]) return {x: keys[n - 1][1], y: keys[n - 1][2]};
    let i = 0;
    while (i < n - 2 && tt > keys[i + 1][0]) i++;
    const k0 = keys[Math.max(0, i - 1)];
    const k1 = keys[i];
    const k2 = keys[i + 1];
    const k3 = keys[Math.min(n - 1, i + 2)];
    const u = clamp((tt - k1[0]) / (k2[0] - k1[0]));
    return {x: cr(k0[1], k1[1], k2[1], k3[1], u), y: cr(k0[2], k1[2], k2[2], k3[2], u)};
  };
  const p = at(t);
  const q = at(t + 1 / 30);
  const r = at(t - 1 / 30);
  return {x: p.x, y: p.y, vx: (q.x - r.x) * 15, vy: (q.y - r.y) * 15};
}
/** Fase integrada del batido: la frecuencia crece con la velocidad (px/s → Hz). */
export function phaseOf(keys: Key[], t: number, base = 0.45, k = 0.0011, seed = 0) {
  let ph = seed;
  const dt = 1 / 30;
  const t0 = keys[0][0];
  for (let s = t0; s < t; s += dt) {
    const v = pathAt(keys, s);
    ph += (base + Math.hypot(v.vx, v.vy) * k) * Math.PI * 2 * Math.min(dt, t - s);
  }
  return ph;
}
/** Pose de natación a lo largo de una trayectoria. */
export function swim(keys: Key[], t: number, o: {kind: Kind; scale: number; seed?: number; under?: number; extra?: Partial<OrcaPose>; maxPitch?: number}): OrcaPose {
  const p = pathAt(keys, t);
  const sp = Math.hypot(p.vx, p.vy);
  const facing: 1 | -1 = p.vx >= 0 ? 1 : -1;
  const pitch = clamp(Math.atan2(p.vy, Math.abs(p.vx) + 40), -(o.maxPitch ?? 0.9), o.maxPitch ?? 0.9);
  // con facing −1 el grupo está espejado: el ángulo de cabeceo cambia de signo
  const angle = facing > 0 ? pitch : -pitch;
  return {
    x: p.x, y: p.y, angle, scale: o.scale, facing, kind: o.kind, t,
    phase: phaseOf(keys, t, o.kind === 'calf' ? 0.7 : 0.45, 0.0011, o.seed ?? 0),
    amp: clamp(0.35 + sp * 0.0018, 0.3, 1.35),
    flipN: clamp(-p.vy * 0.0006, -0.4, 0.4), flipF: clamp(-p.vy * 0.0005, -0.4, 0.4) + 0.1,
    eye: {x: 0.4, y: 0}, under: o.under ?? 1, fv: 0.2,
    ...(o.extra ?? {}),
  };
}

/** SALTO: trayectoria completa alrededor de x0 (superficie en y = 0). `slow` alarga el vuelo (cámara lenta). */
export function breach(t: number, t0: number, x0: number, o: {scale: number; kind: Kind; slow?: number; dir?: 1 | -1; depth?: number}) {
  const slow = o.slow ?? 1;
  const dir = o.dir ?? 1;
  const g = 1250 * o.scale; // gravedad en px/s² a la escala de la orca
  const vExit = 1050 * o.scale;
  const aExit = 1.2; // ángulo de salida respecto a la horizontal
  const tUp = 2.6;
  const tAir = ((2 * vExit * Math.sin(aExit)) / g) * slow;
  const tDown = 2.4;
  const depth = o.depth ?? 900;
  let x: number;
  let y: number;
  let vx: number;
  let vy: number;
  let stage = 0;
  let arch = 0;
  if (t < t0 + tUp) {
    // 1-3: aceleración submarina, orientación hacia la superficie, propulsión intensa
    const u = clamp((t - t0) / tUp);
    const e = u * u;
    x = x0 - dir * (1 - e) * 700 * o.scale;
    y = lerp(depth, 0, e);
    vx = dir * (1400 * o.scale * u) / tUp;
    vy = -(depth * 2 * u) / tUp;
    stage = u < 0.35 ? 1 : u < 0.7 ? 2 : 3;
    arch = -0.2 * u;
  } else if (t < t0 + tUp + tAir) {
    // 4-7: ruptura, elevación, flexión en el aire, descenso (balística ralentizada)
    const ta = (t - t0 - tUp) / slow;
    x = x0 + dir * vExit * Math.cos(aExit) * ta;
    y = -vExit * Math.sin(aExit) * ta + 0.5 * g * ta * ta;
    vx = dir * vExit * Math.cos(aExit);
    vy = -vExit * Math.sin(aExit) + g * ta;
    const u = (t - t0 - tUp) / tAir;
    stage = u < 0.12 ? 4 : u < 0.45 ? 5 : u < 0.75 ? 6 : 7;
    arch = Math.sin(Math.PI * u) * 0.9;
  } else {
    // 8-10: contacto, salpicadura, regreso a la natación
    const u = clamp((t - t0 - tUp - tAir) / tDown);
    const xs = x0 + dir * vExit * Math.cos(aExit) * (tAir / slow);
    x = xs + dir * (900 * o.scale) * (1 - (1 - u) * (1 - u));
    y = Math.sin(u * Math.PI * 0.6) * 520 * o.scale;
    vx = dir * 900 * o.scale * 2 * (1 - u) / tDown + 1;
    vy = Math.cos(u * Math.PI * 0.6) * 520 * o.scale * 0.6 * Math.PI / tDown;
    stage = u < 0.15 ? 8 : u < 0.5 ? 9 : 10;
    arch = 0.3 * (1 - u);
  }
  const ang = Math.atan2(vy, Math.abs(vx));
  const facing = dir;
  return {
    x, y, angle: facing > 0 ? ang : -ang, facing, stage, arch, tExit: t0 + tUp, tEntry: t0 + tUp + tAir, tEnd: t0 + tUp + tAir + tDown,
    amp: stage <= 3 ? 1.35 : stage <= 7 ? 0.25 : 0.9, air: y < -10 ? 1 : 0, xEntry: x0 + dir * vExit * Math.cos(aExit) * (tAir / slow),
  };
}
export const _k = {smoothstep};
