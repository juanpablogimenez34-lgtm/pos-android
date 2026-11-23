// MOTOR DE CAZA: encadena las fases A–G de cada caza a partir de unos pocos parámetros, en TIEMPO DE
// ACCIÓN (las cámaras lentas se aplican con `remap`, una función monótona tiempo real → acción).
//  A detección (mirada y cabeza hacia el objetivo) · B posicionamiento bajo la superficie ·
//  C preparación (boca y compresión de opérculos) · D disparo (chorro balístico) · E impacto (hoja e
//  insecto reaccionan) · F caída con gravedad · G carrera y captura en la superficie.
// Garantías: el insecto no cae antes del impacto; la boca del pez está en el origen del chorro; la
// captura ocurre donde el insecto toca el agua.
import {clamp, lerp} from '../../../engine/math';
import {archerMouth} from '../character/ArcherFish';
import {InsectKind, InsectState, Perch, perchPoint} from '../character/Insects';
import {Shot} from '../effects/WaterJet';

type V = {x: number; y: number};
const GI = 2600; // gravedad visual del insecto

export const remap = (knots: [number, number][]) => (t: number) => {
  if (t <= knots[0][0]) return knots[0][1] + (t - knots[0][0]);
  for (let i = 1; i < knots.length; i++) {
    const [a, A] = knots[i - 1];
    const [b, B] = knots[i];
    if (t <= b) return A + ((t - a) / (b - a)) * (B - A);
  }
  const [a, A] = knots[knots.length - 1];
  return A + (t - a);
};

export type Hunt = {
  perch: Perch;
  insect: InsectKind;
  insectScale: number;
  fishScale?: number;
  dir?: 1 | -1;
  from: V; // posición inicial del pez
  approach: [number, number]; // B: desplazamiento hasta el punto de tiro
  aimMouth: V; // dónde queda la boca al apuntar (justo bajo la superficie)
  aimAngle: number; // inclinación al apuntar
  tShot: number; // D
  tau?: number;
  hit?: boolean;
  missBy?: V; // desviación si falla
  knock?: V; // velocidad inicial del insecto al soltarse
  grip?: number; // segundos que se sostiene tras el impacto
  chaseAngle?: number;
  captureDelay?: number; // segundos desde que toca el agua hasta la captura
  after?: V; // adónde nada después
  seed?: number;
};

const rot = (v: V, a: number) => ({x: v.x * Math.cos(a) - v.y * Math.sin(a), y: v.x * Math.sin(a) + v.y * Math.cos(a)});
const centerFor = (mouth: V, ang: number, s: number, dir: 1 | -1) => {
  const off = rot({x: 116 * s * dir, y: -2 * s}, ang);
  return {x: mouth.x - off.x, y: mouth.y - off.y};
};
const ease = (u: number) => {
  const v = clamp(u);
  return v * v * (3 - 2 * v);
};

export type HuntFrame = {
  fish: {x: number; y: number; angle: number; dir: 1 | -1; scale: number; swim: number; freq: number; mouth: number; squeeze: number; lookAt: V; state: string};
  shot: Shot;
  insect: {x: number; y: number; ang: number; state: InsectState; visible: boolean; kind: InsectKind; s: number};
  perch: Perch;
  impactT: number;
  landT: number;
  landX: number;
  captureT: number;
  wet: number;
};

export function huntAt(h: Hunt, T: number): HuntFrame {
  const s = h.fishScale ?? 1;
  const dir = h.dir ?? 1;
  const tau = h.tau ?? 0.34;
  const hit = h.hit ?? true;
  const impactT = h.tShot + tau;
  const grip = h.grip ?? 0.12;
  const detachT = impactT + grip;
  const perch: Perch = {...h.perch, hitAt: hit ? impactT : impactT + 0.05, hitAmp: hit ? 0.55 : 0.12};
  const pAtImpact = perchPoint(perch, impactT);
  const target = hit ? {x: pAtImpact.x, y: pAtImpact.y + 3} : {x: pAtImpact.x + (h.missBy?.x ?? 70), y: pAtImpact.y + (h.missBy?.y ?? -60)};
  const aimC = centerFor(h.aimMouth, h.aimAngle, s, dir);
  const shot: Shot = {t0: h.tShot, mouth: h.aimMouth, target, tau, hit, seed: h.seed ?? 1};
  // caída del insecto
  const kv = h.knock ?? {x: 90 * dir, y: -160};
  const p0 = perchPoint(perch, detachT);
  const landDt = (-kv.y + Math.sqrt(kv.y * kv.y - 2 * GI * p0.y)) / GI;
  const landT = detachT + landDt;
  const landX = p0.x + kv.x * landDt;
  const captureT = landT + (h.captureDelay ?? 0.9);
  const chaseA = h.chaseAngle ?? -0.35 * dir;
  const capC = centerFor({x: landX, y: 2}, chaseA, s, dir);
  // insecto
  let ins: HuntFrame['insect'] = {...perchPoint(perch, T), state: 'perched', visible: true, kind: h.insect, s: h.insectScale};
  if (hit && T >= impactT && T < detachT) {
    const q = perchPoint(perch, T);
    ins = {...ins, x: q.x + Math.sin(T * 40) * 2, y: q.y, ang: q.ang + Math.sin(T * 30) * 0.3, state: 'hit'};
  } else if (hit && T >= detachT && T < landT) {
    const u = T - detachT;
    ins = {...ins, x: p0.x + kv.x * u, y: p0.y + kv.y * u + 0.5 * GI * u * u, ang: p0.ang + u * 9 * dir, state: 'falling'};
  } else if (hit && T >= landT) {
    const u = T - landT;
    let x = landX + Math.sin(u * 3) * 3;
    let y = -3 + Math.sin(u * 7) * 1.5;
    const pull = clamp((T - (captureT - 0.15)) / 0.15);
    const m = archerMouth(capC.x, capC.y, chaseA, s, dir);
    x = lerp(x, m.x, pull);
    y = lerp(y, m.y, pull);
    ins = {...ins, x, y, ang: Math.sin(u * 5) * 0.4, state: 'water', visible: T < captureT};
  }
  // pez
  let x = h.from.x;
  let y = h.from.y;
  let angle = 0;
  let swim = 0.7;
  let freq = 2.4;
  let mouth = 0.05;
  let squeeze = 0;
  let state = 'SLOW_SWIM';
  const [a, b] = h.approach;
  if (T < a) {
    x = h.from.x + Math.sin(T * 0.6) * 10;
    y = h.from.y + Math.sin(T * 0.9) * 6;
    state = 'SEARCHING';
  } else if (T < b) {
    const u = ease((T - a) / (b - a));
    x = lerp(h.from.x, aimC.x, u);
    y = lerp(h.from.y, aimC.y, u);
    angle = lerp(0, h.aimAngle, u);
    swim = 0.9;
    state = 'TARGET_TRACKING';
  } else if (T < h.tShot + 0.12) {
    x = aimC.x;
    y = aimC.y + Math.sin(T * 2) * 1.5;
    angle = h.aimAngle;
    swim = 0.25;
    freq = 3.2;
    squeeze = clamp((T - (h.tShot - 0.45)) / 0.45);
    mouth = clamp((T - (h.tShot - 0.25)) / 0.2);
    state = T < h.tShot ? 'AIMING' : 'WATER_SHOT';
    if (T >= h.tShot) squeeze = 1 - (T - h.tShot) / 0.12;
  } else if (!hit || T < landT - 0.2) {
    const r = clamp((T - h.tShot - 0.12) / 0.25);
    const back = rot({x: -10 * dir, y: 0}, h.aimAngle);
    x = aimC.x + back.x * Math.sin(r * Math.PI);
    y = aimC.y + back.y * Math.sin(r * Math.PI) + clamp(T - h.tShot - 0.4) * 10;
    angle = lerp(h.aimAngle, h.aimAngle * 0.7, clamp((T - h.tShot) / 1.2));
    swim = 0.35;
    mouth = lerp(0.6, 0.05, r);
    state = hit ? 'PREY_FALLING' : 'SHOT_RECOVERY';
    if (!hit && h.after && T > h.tShot + 1.2) {
      const u = ease((T - h.tShot - 1.2) / 2.5);
      x = lerp(x, h.after.x, u);
      y = lerp(y, h.after.y, u);
      angle = lerp(angle, 0, u);
      swim = 0.8;
    }
  } else if (T < captureT) {
    const u = ease((T - (landT - 0.2)) / (captureT - landT + 0.2));
    const r0 = {x: aimC.x, y: aimC.y + 10};
    x = lerp(r0.x, capC.x, u);
    y = lerp(r0.y, capC.y, u);
    angle = lerp(h.aimAngle * 0.7, chaseA, u);
    swim = 1;
    freq = 4.2;
    mouth = clamp((T - (captureT - 0.3)) / 0.2);
    state = 'PREY_CHASE';
  } else {
    const u = ease((T - captureT) / 2.5);
    const to = h.after ?? {x: capC.x + 200 * dir, y: capC.y + 120};
    x = lerp(capC.x, to.x, u);
    y = lerp(capC.y, to.y, u);
    angle = lerp(chaseA, 0, u);
    swim = 0.8;
    mouth = clamp(1 - (T - captureT) / 0.25);
    state = T < captureT + 0.6 ? 'PREY_CAPTURE' : 'SLOW_SWIM';
  }
  // mirada: el insecto en coordenadas locales del pez
  const d = {x: ins.x - x, y: ins.y - y};
  const lr = rot(d, -angle);
  const lookAt = {x: (lr.x / s) * dir, y: lr.y / s};
  return {fish: {x, y, angle, dir, scale: s, swim, freq, mouth, squeeze, lookAt, state}, shot, insect: ins, perch, impactT, landT, landX, captureT, wet: hit ? clamp((T - impactT) * 3) : 0};
}
