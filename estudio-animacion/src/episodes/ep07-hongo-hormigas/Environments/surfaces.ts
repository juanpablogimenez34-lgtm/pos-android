// Superficies caminables del Ep. 07 (unidades 0,1 mm). La hormiga camina en el espacio de
// parámetros de cada una y sus pies se apoyan en puntos reales de esa superficie.
//  BRANCH  rama caída con corteza (sendero de la colonia)
//  LEAF1   hoja ancha cerca del suelo (exploración y contacto con la espora)
//  STEM    tallo vertical de una planta joven (ascenso)
//  LEAF2   ENVÉS de la hoja elevada (fijación con las mandíbulas)
import {clamp} from '../../../engine/math';
import {Surface} from '../Animation/locomotion';
import {add, cross, norm, scl, sub, V3} from '../Animation/proj';

export const BRANCH_R = 140;
export const BRANCH_Y = 140;
export const BRANCH_X0 = -3200;
export const BRANCH_X1 = 1300;

/** a = x a lo largo de la rama, b = arco desde la parte superior (+ hacia la cámara). */
export const BRANCH: Surface = {
  id: 'branch',
  point: (a, b) => {
    const th = b / BRANCH_R;
    return [a, BRANCH_Y + BRANCH_R * Math.cos(th), BRANCH_R * Math.sin(th)];
  },
  normal: (_a, b) => {
    const th = b / BRANCH_R;
    return [0, Math.cos(th), Math.sin(th)];
  },
};

// hoja ancha apoyada cerca del suelo, delante de la rama
const L1A: V3 = [-700, 30, 520];
const L1B: V3 = [800, 70, 380];
export const LEAF1_LEN = Math.hypot(L1B[0] - L1A[0], L1B[2] - L1A[2]);
const L1X = norm(sub(L1B, L1A));
const L1S = norm(cross(L1X, [0, 1, 0]));
export const leaf1HalfW = (a: number) => 330 * Math.pow(Math.sin(Math.PI * clamp(a / LEAF1_LEN) ** 0.8), 0.85) + 4;
const l1 = (a: number, b: number): V3 => {
  const s = a / LEAF1_LEN;
  return add(add(add(L1A, scl(L1X, a)), scl(L1S, b)), [0, 40 * Math.sin(Math.PI * clamp(s)) - 0.00045 * b * b, 0]);
};
const nrm = (f: (a: number, b: number) => V3, flip = false) => (a: number, b: number): V3 => {
  const da = sub(f(a + 1, b), f(a - 1, b));
  const db = sub(f(a, b + 1), f(a, b - 1));
  let n = norm(cross(db, da));
  if ((n[1] < 0) !== flip) n = scl(n, -1);
  return n;
};
export const LEAF1: Surface = {id: 'leaf1', point: l1, normal: nrm(l1)};
export const leaf1Point = l1;

// tallo vertical
export const STEM_X = 1560;
export const STEM_Z = 140;
export const STEM_R = 24;
export const STEM_H = 1500;
/** a = altura, b = arco (0 = cara hacia la cámara). */
export const STEM: Surface = {
  id: 'stem',
  point: (a, b) => {
    const th = b / STEM_R;
    return [STEM_X + STEM_R * Math.sin(th), a, STEM_Z + STEM_R * Math.cos(th)];
  },
  normal: (_a, b) => {
    const th = b / STEM_R;
    return [Math.sin(th), 0, Math.cos(th)];
  },
};

// hoja elevada: el pecíolo sale del ápice del tallo; se camina por el ENVÉS (normal hacia abajo)
const L2A: V3 = [STEM_X + 20, STEM_H + 20, STEM_Z];
const L2B: V3 = [STEM_X + 1350, STEM_H + 60, STEM_Z - 120];
export const LEAF2_LEN = Math.hypot(L2B[0] - L2A[0], L2B[2] - L2A[2]);
const L2X = norm(sub(L2B, L2A));
const L2S = norm(cross(L2X, [0, 1, 0]));
export const leaf2HalfW = (a: number) => (a < 160 ? 14 : 300 * Math.pow(Math.sin(Math.PI * clamp((a - 160) / (LEAF2_LEN - 160)) ** 0.85), 0.8) + 6);
const l2top = (a: number, b: number): V3 => {
  const s = (a - 160) / (LEAF2_LEN - 160);
  return add(add(add(L2A, scl(L2X, a)), scl(L2S, b)), [0, 60 * Math.sin(Math.PI * clamp(s)) - 0.0008 * b * b - (a > 160 ? 0 : 0), 0]);
};
export const leaf2Top = l2top;
/** Envés: 5 u por debajo de la cara superior. */
const l2under = (a: number, b: number): V3 => add(l2top(a, b), [0, -5, 0]);
export const LEAF2: Surface = {id: 'leaf2', point: l2under, normal: nrm(l2under, true)};
