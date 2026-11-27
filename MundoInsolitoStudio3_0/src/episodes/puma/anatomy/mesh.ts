// UTILIDADES DE MALLA PROCEDURAL (comunes a puma y ciervo): rejilla paramétrica (u, v) con costura duplicada,
// normales suavizadas sin costura, orientación hacia fuera garantizada, curvas Catmull-Rom con perfiles y tubos
// anatómicos (sección elíptica orientada por la dirección del cuerpo).
import * as THREE from 'three';
import {clamp} from '../../../lib/noise';

export type V3 = THREE.Vector3;
export const v3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

/** Rejilla (nu+1)×(nv+1) → BufferGeometry con uv; v es periódica (columna duplicada en la costura). */
export function gridGeometry(nu: number, nv: number, fn: (u: number, v: number, out: V3) => void, reuse?: THREE.BufferGeometry) {
  const N = (nu + 1) * (nv + 1);
  let g = reuse;
  if (!g || (g.getAttribute('position') as THREE.BufferAttribute).count !== N) {
    g = new THREE.BufferGeometry();
    const uv = new Float32Array(N * 2);
    for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) uv.set([i / nu, j / nv], (i * (nv + 1) + j) * 2);
    const idx: number[] = [];
    for (let i = 0; i < nu; i++)
      for (let j = 0; j < nv; j++) {
        const a = i * (nv + 1) + j;
        const b = a + 1;
        const c = a + nv + 1;
        const d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    g.setIndex(idx);
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  }
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const p = v3();
  for (let i = 0; i <= nu; i++)
    for (let j = 0; j <= nv; j++) {
      fn(i / nu, j / nv, p);
      pos.setXYZ(i * (nv + 1) + j, p.x, p.y, p.z);
    }
  pos.needsUpdate = true;
  smoothNormals(g, nu, nv);
  return g;
}

/** Normales por diferencias de la propia rejilla (sin costura en v; polos resueltos con el anillo vecino). */
function smoothNormals(g: THREE.BufferGeometry, nu: number, nv: number) {
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const nrm = g.getAttribute('normal') as THREE.BufferAttribute;
  const P = (i: number, j: number, o: V3) => {
    const jj = ((j % nv) + nv) % nv;
    return o.fromBufferAttribute(pos, i * (nv + 1) + jj);
  };
  const a = v3();
  const b = v3();
  const c = v3();
  const d = v3();
  const du = v3();
  const dv = v3();
  const n = v3();
  // signo: ¿la orientación (du × dv) apunta hacia fuera? Se decide por el volumen con signo de toda la malla.
  let vol = 0;
  const cen = v3();
  for (let k = 0; k < pos.count; k++) cen.add(a.fromBufferAttribute(pos, k));
  cen.multiplyScalar(1 / pos.count);
  const ring: V3[] = [];
  for (let i = 0; i <= nu; i++) {
    for (let j = 0; j <= nv; j++) {
      const i0 = Math.max(0, i - 1);
      const i1 = Math.min(nu, i + 1);
      P(i1, j, a);
      P(i0, j, b);
      du.subVectors(a, b);
      P(i, j + 1, c);
      P(i, j - 1, d);
      dv.subVectors(c, d);
      if (du.lengthSq() < 1e-14) du.set(0, 0, 0);
      n.crossVectors(du, dv);
      // en los polos (anillo degenerado, dv ≈ 0) se usa el eje del tubo
      if (dv.lengthSq() < 1e-12 || n.lengthSq() < 1e-16) {
        const ii = i === 0 ? 1 : nu - 1;
        // centro del anillo vecino → polo
        const rc = v3();
        for (let jj = 0; jj < nv; jj++) rc.add(P(ii, jj, c));
        rc.multiplyScalar(1 / nv);
        P(i, j, a);
        n.subVectors(a, rc);
        ring.push(n.clone());
      }
      n.normalize();
      nrm.setXYZ(i * (nv + 1) + j, n.x, n.y, n.z);
      if (j < nv && i > 0 && i < nu) {
        P(i, j, a);
        vol += n.dot(a.clone().sub(cen));
      }
    }
  }
  // los polos se calculan siempre hacia fuera; el resto se invierte si la orientación es interior
  if (vol < 0) {
    for (let i = 1; i < nu; i++)
      for (let j = 0; j <= nv; j++) {
        const k = i * (nv + 1) + j;
        nrm.setXYZ(k, -nrm.getX(k), -nrm.getY(k), -nrm.getZ(k));
      }
    // invertir también el orden de los triángulos
    const ix = g.getIndex()!;
    if (!g.userData.flipped) {
      const arr = ix.array as Uint16Array | Uint32Array;
      for (let t = 0; t < arr.length; t += 3) {
        const tmp = arr[t + 1];
        arr[t + 1] = arr[t + 2];
        arr[t + 2] = tmp;
      }
      ix.needsUpdate = true;
      g.userData.flipped = true;
    }
  }
  nrm.needsUpdate = true;
  g.computeBoundingSphere();
  void ring;
}

/** Interpolación Catmull-Rom uniforme de números. */
export const cr = (p0: number, p1: number, p2: number, p3: number, t: number) => 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);

/** Curva por puntos con datos por nodo (perfiles, vectores «arriba»): muestreo por longitud de cuerda. */
export class Chain {
  pts: V3[];
  ups: V3[];
  data: number[][];
  acc: number[];
  len: number;
  constructor(pts: V3[], ups: V3[], data: number[][]) {
    this.pts = pts;
    this.ups = ups;
    this.data = data;
    this.acc = [0];
    for (let i = 1; i < pts.length; i++) this.acc.push(this.acc[i - 1] + pts[i].distanceTo(pts[i - 1]) + 1e-6);
    this.len = this.acc[this.acc.length - 1];
  }
  private seg(u: number) {
    const s = clamp(u) * this.len;
    let i = 0;
    while (i < this.pts.length - 2 && s > this.acc[i + 1]) i++;
    const t = clamp((s - this.acc[i]) / (this.acc[i + 1] - this.acc[i]));
    return {i, t};
  }
  point(u: number, o = v3()) {
    const {i, t} = this.seg(u);
    const n = this.pts.length;
    const P = (k: number) => this.pts[clamp(k, 0, n - 1)];
    const a = P(i - 1);
    const b = P(i);
    const c = P(i + 1);
    const d = P(i + 2);
    // extremos: puntos fantasma por reflexión (tangente natural)
    const A = i - 1 < 0 ? b.clone().multiplyScalar(2).sub(c) : a;
    const D = i + 2 > n - 1 ? c.clone().multiplyScalar(2).sub(b) : d;
    return o.set(cr(A.x, b.x, c.x, D.x, t), cr(A.y, b.y, c.y, D.y, t), cr(A.z, b.z, c.z, D.z, t));
  }
  tangent(u: number, o = v3()) {
    const e = 0.002;
    const a = this.point(Math.max(0, u - e));
    const b = this.point(Math.min(1, u + e));
    return o.subVectors(b, a).normalize();
  }
  up(u: number, o = v3()) {
    const {i, t} = this.seg(u);
    const k = Math.min(this.ups.length - 1, i + 1);
    return o.copy(this.ups[i]).lerp(this.ups[k], t * t * (3 - 2 * t)).normalize();
  }
  prof(u: number): number[] {
    const {i, t} = this.seg(u);
    const n = this.data.length;
    const D = (k: number) => this.data[clamp(k, 0, n - 1)];
    const a = D(i - 1);
    const b = D(i);
    const c = D(i + 1);
    const d = D(i + 2);
    return b.map((_, k) => cr(a[k], b[k], c[k], d[k], t));
  }
}

/** Potencia con signo para superelipses. */
export const spow = (x: number, e: number) => Math.sign(x) * Math.abs(x) ** e;

/** Distancia de un punto a un segmento. */
export function segDist(p: V3, a: V3, b: V3) {
  const ab = b.clone().sub(a);
  const t = clamp(p.clone().sub(a).dot(ab) / Math.max(1e-9, ab.lengthSq()));
  return p.distanceTo(a.clone().addScaledVector(ab, t));
}

/** Superficie abierta (u, v ∈ [0,1], sin periodicidad) con normales de three.js; para orejas y láminas. */
export function openGrid(nu: number, nv: number, fn: (u: number, v: number, out: V3) => void, flip = false) {
  const pos: number[] = [];
  const uv: number[] = [];
  const p = v3();
  for (let i = 0; i <= nu; i++)
    for (let j = 0; j <= nv; j++) {
      fn(i / nu, j / nv, p);
      pos.push(p.x, p.y, p.z);
      uv.push(i / nu, j / nv);
    }
  const idx: number[] = [];
  for (let i = 0; i < nu; i++)
    for (let j = 0; j < nv; j++) {
      const a = i * (nv + 1) + j;
      const b = a + 1;
      const c = a + nv + 1;
      const d = c + 1;
      if (flip) idx.push(a, b, c, b, d, c);
      else idx.push(a, c, b, b, c, d);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
