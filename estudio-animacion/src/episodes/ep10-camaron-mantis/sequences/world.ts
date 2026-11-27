// CONTROLADOR DE ESCENA (mundo continuo del arrecife). El protagonista vive en UNA sola línea de
// tiempo: su posición, estado y escala (constante, MS) se calculan aquí a partir del tiempo, de modo
// que ninguna acción se corta entre secuencias. La cámara virtual también se define de forma global.
import {clamp, easeInOut, lerp} from '../../../engine/math';
import {Cam, camAt, CamKey, drift} from '../camera/CameraSystem';
import {clubTip, mantisPose, MantisPose} from '../characters/MantisShrimp';
import {EV} from '../config/sequences';
import {alive, focusOn, manipulate, MP, STEP, strikeAt, walkBetween} from '../rig/MantisMotion';

/** Escala del animal en el mundo: NO cambia entre escenas (≈ 285 unidades de longitud). */
export const MS = 0.8;
/** Posición de acecho y de la presa. */
export const MX = 440;
const between = (t: number, a: number, b: number) => t >= a && t < b;
const ramp = (t: number, a: number, b: number) => easeInOut(clamp((t - a) / (b - a)));

/** Tiempo efectivo: dentro de la repetición a cámara lenta se reproduce de nuevo el golpe. */
export function slowTime(t: number): number {
  const [a, b] = EV.slow;
  if (t < a || t >= b) return t;
  // 86,2–87,4 → 82,50–82,905 (tensión) · 87,4–88,2 → 82,905–83,0 (golpe ×0,11) · 88,2–88,6 → 83,0–83,06
  if (t < 87.4) return lerp(82.5, 82.905, (t - a) / 1.2);
  if (t < 88.2) return lerp(82.905, 83.0, (t - 87.4) / 0.8);
  return lerp(83.0, 83.06, (t - 88.2) / 0.4);
}
export const isSlow = (t: number) => between(t, EV.slow[0], EV.slow[1]) || between(t, 89.4, 98.6);

/** Golpe lento de la secuencia de cavitación: carga 88,7–89,5, golpe 89,5–90,6, mantiene, recupera. */
function cavRaptor(t: number) {
  if (t < 88.7) return {cock: 0, strike: 0, hold: 0};
  if (t < 89.5) return {cock: ramp(t, 88.7, 89.5), strike: 0, hold: 0};
  if (t < 90.6) return {cock: 1, strike: Math.pow((t - 89.5) / 1.1, 1.6), hold: 0};
  if (t < 97.4) return {cock: 1, strike: 1, hold: 0};
  return {cock: 1 - ramp(t, 97.4, 98.6), strike: 1 - ramp(t, 97.4, 98.6), hold: 0};
}

const HITS3 = EV.extra;
function repeatRaptor(t: number) {
  for (const ts of HITS3) {
    if (between(t, ts - 0.5, ts + 0.52)) return strikeAt(t, ts, 1.6);
  }
  return {cock: 0, strike: 0, hold: 0, impact: 0};
}

/** Postura del protagonista en el instante t (estado completo). */
export function mantisAt(t0: number): MantisPose {
  const t = slowTime(t0);
  let o: MP = alive(t);
  let x = -150;
  let yaw = 0;
  // ---------- 1 · dentro de la grieta, se asoma (ojos), muestra un instante el apéndice
  if (t < EV.walkOut[0]) {
    x = t < EV.peek ? -150 : lerp(-150, -56, ramp(t, EV.peek, 11.4));
    if (t > 14.4) x = lerp(-56, -40, ramp(t, 14.4, 15.6));
    o = {...alive(t, {eyes: 1.2, ant: 0.6}), raptor: {cock: 0.45 * Math.sin(Math.PI * clamp((t - 15.0) / 1.6)), strike: 0, hold: 0}};
  } else if (t < 27) {
    // ---------- 2 · sale caminando (patas coordinadas, apoyos fijos)
    const w = walkBetween(t, EV.walkOut[0], EV.walkOut[1], -40, 300);
    x = w.x;
    o = {...w, facing: 1};
  } else if (t < 63) {
    // ---------- 3 · reposo vivo; ojos independientes (más amplios en la secuencia 5); giro del cuerpo
    x = 300;
    o = alive(t, {eyes: between(t, 36, 45) ? 1.5 : 1, ant: 0.2});
    yaw = Math.PI * (ramp(t, 55, 56.6) + ramp(t, 59.4, 61));
    if (between(t, 55, 61)) o = {...o, walk: (Math.min(1, (t - 55) / 1.6) + Math.max(0, (t - 59.4) / 1.6)) * 1.5, walking: 0.6 * (between(t, 55, 56.6) || between(t, 59.4, 61) ? 1 : 0)};
  } else if (t < 108) {
    // ---------- 4 · la caza
    if (t < EV.approach[1]) {
      const w = walkBetween(t, EV.approach[0], EV.approach[1], 300, 420);
      x = w.x;
      o = {...w, facing: 1};
    } else if (t < EV.backStep[1]) {
      const w = walkBetween(t, EV.backStep[0], EV.backStep[1], 420, 395);
      x = w.x;
      o = {...w, facing: 1, walk: -(w.walk ?? 0), eyeN: {pitch: 0.2, yaw: 0.4}, eyeF: {pitch: 0.2, yaw: 0.3}};
    } else if (t < 70.6) {
      const w = walkBetween(t, EV.advance[0], EV.advance[1], 395, MX);
      x = w.x;
      o = {...w, facing: 1, walk: 25 / STEP + (w.walk ?? 0)};
    } else {
      x = MX;
      o = focusOn(t, 0.35);
      const load = ramp(t, EV.cock[0], EV.cock[1]);
      let r = {cock: load, strike: 0, hold: 0};
      if (t >= EV.strike - 0.1 && t < 85) r = strikeAt(t, EV.strike, 1);
      if (t >= 85) r = {cock: 0, strike: 0, hold: 0};
      if (t >= 88.6) r = cavRaptor(t);
      if (t >= 98.6) r = repeatRaptor(t);
      o = {...o, raptor: {cock: r.cock, strike: r.strike, hold: 0}, bodyY: 6 + 4 * load * (t < EV.strike ? 1 : 0) + Math.sin(t * 2) * 0.6, pitch: 0.05 + 0.05 * (r.cock ?? 0)};
      if (t >= 103.4) {
        o = {...manipulate(t, ramp(t, 103.4, 104.6)), bodyY: 6};
      }
    }
  } else if (t < 140) {
    // ---------- 5 · tras la caza (vuelve a verse a partir de 135 s)
    x = MX;
    o = alive(t, {ant: 0.3});
  } else {
    // ---------- 6 · territorio: patrulla, gira, exhibición de amenaza, regresa y entra de espaldas
    if (t < EV.patrol[1]) {
      const w = walkBetween(t, EV.patrol[0], EV.patrol[1], MX, 600);
      x = w.x;
      o = {...w, facing: 1};
    } else if (t < EV.walkBack[0]) {
      x = 600;
      yaw = Math.PI * ramp(t, EV.turn1[0], EV.turn1[1]);
      const thr = Math.sin(Math.PI * clamp((t - EV.threat[0]) / (EV.threat[1] - EV.threat[0])));
      o = {...alive(t, {eyes: 0.5, ant: 0.9}), walk: 1.4 * ramp(t, EV.turn1[0], EV.turn1[1]), walking: between(t, EV.turn1[0], EV.turn1[1]) ? 0.6 : 0, raptor: {cock: 0.65 * thr, strike: 0, hold: 0}, fan: 0.5 + 0.5 * thr, bodyY: -8 * thr, pitch: -0.08 * thr};
    } else if (t < EV.walkHome[0]) {
      const w = walkBetween(t, EV.walkBack[0], EV.walkBack[1], 600, 400);
      x = w.x;
      yaw = Math.PI;
      o = {...w, facing: 1};
    } else if (t < EV.turn2[0]) {
      const w = walkBetween(t, EV.walkHome[0], EV.walkHome[1], 400, 150);
      x = w.x;
      yaw = Math.PI;
      o = {...w, facing: 1};
    } else if (t < EV.retreat[0]) {
      x = 150;
      yaw = Math.PI + Math.PI * ramp(t, EV.turn2[0], EV.turn2[1]);
      o = {...alive(t), walk: 1.4 * ramp(t, EV.turn2[0], EV.turn2[1]), walking: 0.6};
    } else {
      // retroceso: entra de espaldas en la grieta y sigue vigilando con los ojos fuera
      const w = walkBetween(t, EV.retreat[0], EV.retreat[1], 150, -40);
      x = w.x;
      o = {...w, facing: 1, walk: -(w.walk ?? 0), ...(t > EV.retreat[1] ? alive(t, {eyes: 1.1, ant: 0.5}) : {})};
    }
  }
  return mantisPose({...o, t, x, y: 0, scale: MS, facing: 1, yaw, light: '#c8f0ff', shine: 0.7});
}

/** Postura de golpe completo (para situar la presa justo al alcance del mazo). */
const STRUCK = mantisPose({x: MX, y: 0, scale: MS, bodyY: 6, pitch: 0.1, raptor: {cock: 1, strike: 1, hold: 0}});
export const CONTACT = clubTip(STRUCK);
export const SNAIL_S = 0.9;
export const SX = CONTACT.x + 34 * SNAIL_S - 6;

/** Impactos sobre la concha (tiempo efectivo) con el grado de rotura alcanzado. */
const HITS: [number, number][] = [[EV.strike, 0.12], [90.6, 0.25], [HITS3[0], 0.45], [HITS3[1], 0.7], [HITS3[2], 0.9], [EV.crack, 1]];
export function snailAt(t0: number) {
  const t = slowTime(t0);
  let crack = 0;
  let shake = 0;
  let last = -99;
  for (const [h, c] of HITS) {
    if (t >= h) {
      crack = c;
      last = h;
    }
  }
  if (t >= last) shake = Math.exp(-(t - last) * 8) * (t - last < 0.6 ? 1 : 0);
  const hide = ramp(t, 71, 72.2);
  const creep = t < 71 ? (71 - Math.max(63, t)) * 1.5 : 0;
  return {x: SX + creep, crack, shake, hide, lastHit: last};
}

/** Cámara global del arrecife (las secuencias científicas usan sus propios fondos). */
export function reefCam(t: number, m: MantisPose): Cam {
  const K: CamKey[] = [
    [0, 0, -3300, 0.55],
    [8.6, 40, -260, 0.95],
    [11.2, 20, -86, 2.7],
    [16.8, 26, -90, 2.8],
    [18.6, 60, -150, 1.7],
  ];
  let c: Cam;
  if (t < 18.6) c = camAt(K, t);
  else if (t < 27) c = {x: lerp(60, m.x + 10, ramp(t, 18.6, 20)), y: -150, zoom: 1.7 - 0.15 * ramp(t, 24, 27), roll: 0};
  else if (t < 36) c = camAt([[27, 310, -150, 1.55], [29, 300, -130, 1.95], [36, 300, -130, 2.05]], t);
  else if (t < 45) c = camAt([[36, 300, -130, 2.05], [37.4, 418, -100, 4.3], [44.6, 424, -104, 4.7]], t);
  else if (t < 63) c = camAt([[45, 424, -104, 4.7], [46.6, 360, -170, 1.35], [54, 380, -190, 1.3], [58, 500, -230, 1.15], [63, 520, -210, 1.0]], t);
  else if (t < 70.6) c = {x: lerp(520, (m.x + SX) / 2, ramp(t, 63, 65)), y: -200, zoom: 1.0 + 0.15 * ramp(t, 66, 70.6), roll: 0};
  else if (t < 83) c = camAt([[70.6, (MX + SX) / 2, -200, 1.15], [73, (MX + SX) / 2, -120, 1.9], [76, MX + 110, -80, 2.7], [82.9, MX + 115, -78, 3.1]], t);
  else if (t < 85.6) c = camAt([[83, MX + 115, -78, 3.1], [85.6, MX + 115, -78, 3.0]], t);
  else if (t < 89.4) c = camAt([[85.6, MX + 115, -78, 3.0], [86.3, CONTACT.x - 20, CONTACT.y - 10, 4.2], [89.4, CONTACT.x - 10, CONTACT.y - 8, 4.5]], t);
  else if (t < 99) c = camAt([[89.4, CONTACT.x - 10, CONTACT.y - 8, 4.5], [91, CONTACT.x + 10, CONTACT.y - 10, 5.2], [98.6, CONTACT.x + 14, CONTACT.y - 12, 5.6], [99, CONTACT.x, CONTACT.y - 20, 4.8]], t);
  else if (t < 108.5) c = camAt([[99, CONTACT.x, CONTACT.y - 20, 4.8], [99.8, MX + 130, -110, 2.3], [103.5, MX + 130, -110, 2.3], [106.8, MX + 150, -80, 2.9], [108.5, CONTACT.x, CONTACT.y, 7.5]], t);
  else if (t < 140) c = camAt([[135, 380, -320, 0.9], [140, 470, -190, 1.25]], t);
  else if (t < 153) c = {x: lerp(470, m.x, ramp(t, 140, 141.5)), y: -180 + 20 * ramp(t, 146.5, 148), zoom: 1.25 + 0.3 * Math.sin(Math.PI * clamp((t - 146.5) / 4)), roll: 0};
  else if (t < 162) c = camAt([[153, 420, -180, 1.3], [156.6, 220, -160, 1.6], [161, 140, -140, 1.85], [162, 140, -140, 1.85]], t);
  else if (t < 171) c = camAt([[162, 140, -140, 1.85], [163.5, 100, -180, 1.4], [171, 20, -720, 0.3]], t);
  else c = camAt([[171, 20, -720, 0.3], [177, 0, -3200, 0.48], [180, 0, -3500, 0.5]], t);
  const shake = t >= EV.strike && t < EV.strike + 0.35 ? Math.exp(-(t - EV.strike) * 12) : 0;
  const d = drift(c, t, 1 + (t > 36 && t < 45 ? -0.5 : 0));
  return {...d, x: d.x + Math.sin(t * 90) * 10 * shake, y: d.y + Math.cos(t * 80) * 8 * shake};
}
