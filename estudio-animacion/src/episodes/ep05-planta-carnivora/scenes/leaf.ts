// Hoja caída cerca de la planta (superficie caminable): aquí pasea la araña y se posa la mosca.
// Parámetros: a = distancia a lo largo de la hoja (0 base → LEAF_LEN punta), b = lateral.
import {clamp} from '../../../engine/math';
import {add, cross, norm, scl, sub, V3} from '../anatomy/proj';
import {Surface} from '../anatomy/locomotion';

const A: V3 = [-1060, 6, 600];
const B: V3 = [-600, 26, 360];
export const LEAF_LEN = Math.hypot(B[0] - A[0], B[2] - A[2]);
const AX = norm(sub(B, A));
const SIDE = norm(cross(AX, [0, 1, 0]));

/** Semianchura de la hoja en a. */
export const leafHalfW = (a: number) => {
  const s = clamp(a / LEAF_LEN);
  return 62 * Math.pow(Math.sin(Math.PI * Math.pow(s, 0.85)), 0.8) + 2;
};

const pt = (a: number, b: number): V3 => {
  const s = a / LEAF_LEN;
  const arch = 16 * Math.sin(Math.PI * clamp(s)); // ligeramente arqueada
  const across = -0.0035 * b * b; // sección convexa (nervio central más alto)
  const twist = 0.08 * b * s; // leve torsión hacia la punta
  return add(add(add(A, scl(AX, a)), scl(SIDE, b)), [0, arch + across + twist + 4, 0]);
};

export const LEAF: Surface = {
  id: 'leaf',
  point: pt,
  normal: (a, b) => {
    const da = sub(pt(a + 1, b), pt(a - 1, b));
    const db = sub(pt(a, b + 1), pt(a, b - 1));
    let n = norm(cross(db, da));
    if (n[1] < 0) n = scl(n, -1);
    return n;
  },
};
