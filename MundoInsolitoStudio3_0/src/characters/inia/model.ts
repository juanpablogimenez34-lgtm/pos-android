// MODELO VOLUMÉTRICO DE INIA GEOFFRENSIS — malla continua generada por «loft» de secciones transversales.
// Unidades: metros. Eje +x hacia el hocico, +y arriba, +z hacia el lado izquierdo del animal.
// s ∈ [0,1] recorre el cuerpo desde la punta del hocico (s=0) hasta la base de la cola (s=1).
// φ recorre la sección: 0 = lado izquierdo (+z), π/2 = dorso, π = lado derecho, 3π/2 = vientre.
//
// RIG («esqueleto digital»): la columna es una cadena de articulaciones (una por sección a partir del cuello) con
// cabeceo y guiñada por articulación y límites anatómicos; la cabeza (s < 0,18) es rígida y se mueve con las
// articulaciones del cuello; la mandíbula gira sobre su bisagra; aletas pectorales y cola tienen articulaciones
// propias. Cada fotograma se reconstruyen posiciones y normales a partir de la pose: la textura (UV fijas por
// (s, φ)) queda adherida a la piel y el volumen se conserva en cualquier perspectiva.
import * as THREE from 'three';
import {clamp, lerp, smooth} from '../../lib/noise';

export const L = 2.3; // longitud de un macho adulto (m)
export const SM = 0.165; // fin de la boca (comisura) en s
export const ALPHA = 0.42; // ángulo de la línea de la boca bajo el lado (rad)
export const S_HEAD = 0.18; // hasta aquí la cabeza es rígida
export const S_NECK = 0.27; // las articulaciones del cuello reparten el giro entre S_HEAD y S_NECK
export const S_ROOT = 0.42; // centro de masa (raíz del esqueleto)

// Perfil anatómico [s, semianchura w, semialtura dorsal hu, semialtura ventral hd, desplazamiento vertical yc, exponente n]
type Row = [number, number, number, number, number, number];
const PROFILE: Row[] = [
  [0.0, 0.003, 0.003, 0.003, -0.034, 2],
  [0.004, 0.0105, 0.0105, 0.0098, -0.034, 2], // punta roma y redondeada
  [0.015, 0.016, 0.016, 0.015, -0.034, 2],
  [0.05, 0.022, 0.024, 0.022, -0.03, 2.1],
  [0.09, 0.028, 0.032, 0.028, -0.026, 2.1],
  [0.12, 0.04, 0.05, 0.036, -0.02, 2.15],
  [0.14, 0.07, 0.1, 0.055, -0.004, 2.25],
  [0.16, 0.112, 0.155, 0.08, 0.016, 2.35], // el melón se eleva bruscamente desde la base del rostro
  [0.185, 0.138, 0.188, 0.1, 0.018, 2.4], // cúspide del melón (bulbosa)
  [0.215, 0.148, 0.17, 0.13, 0.004, 2.25], // estrechamiento del cuello
  [0.25, 0.178, 0.19, 0.172, 0.0, 2.2],
  [0.32, 0.212, 0.222, 0.222, 0.0, 2.15],
  [0.42, 0.228, 0.236, 0.248, 0.0, 2.15],
  [0.52, 0.218, 0.232, 0.232, 0.0, 2.12],
  [0.62, 0.188, 0.208, 0.198, 0.0, 2.05],
  [0.72, 0.138, 0.172, 0.155, 0.0, 1.95],
  [0.8, 0.092, 0.138, 0.118, 0.0, 1.75], // pedúnculo comprimido lateralmente, alto
  [0.88, 0.056, 0.1, 0.086, 0.0, 1.55],
  [0.95, 0.034, 0.062, 0.054, 0.0, 1.5],
  [1.0, 0.024, 0.034, 0.03, 0.0, 1.6],
];
function profile(s: number) {
  const P = PROFILE;
  let i = 1;
  while (i < P.length - 1 && s > P[i][0]) i++;
  const a = P[i - 1];
  const b = P[i];
  const u = clamp((s - a[0]) / (b[0] - a[0]));
  // interpolación cúbica de Hermite con tangentes de Catmull-Rom (perfil suave, sin facetas)
  const a0 = P[Math.max(0, i - 2)];
  const b1 = P[Math.min(P.length - 1, i + 1)];
  const out = [0, 0, 0, 0, 0];
  for (let k = 1; k <= 5; k++) {
    const p0 = a0[k];
    const p1 = a[k];
    const p2 = b[k];
    const p3 = b1[k];
    const t = u;
    out[k - 1] = 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
  }
  return {w: out[0], hu: out[1], hd: out[2], yc: out[3], n: out[4]};
}
const spow = (v: number, e: number) => Math.sign(v) * Math.pow(Math.abs(v), e);

/** Punto de la superficie en reposo (cuerpo recto). Incluye cresta dorsal, quilla ventral, espiráculo y pliegue del cuello. */
export function surface(s: number, phi: number, age = 1): THREE.Vector3 {
  const p = profile(clamp(s));
  const c = Math.cos(phi);
  const si = Math.sin(phi);
  // proporciones de cría: rostro algo más corto, melón más redondo (age 0 → cría)
  const juv = 1 - age;
  let w = p.w * (1 + juv * 0.06);
  let hu = p.hu * (1 + juv * 0.08 * smooth(0.13, 0.2, s));
  const hd = p.hd;
  // pliegue del cuello
  const neck = Math.exp(-(((s - 0.215) / 0.012) ** 2));
  hu *= 1 - 0.035 * neck;
  w *= 1 - 0.03 * neck;
  const e = 2 / p.n;
  let z = w * spow(c, e);
  let y = p.yc + (si >= 0 ? hu : hd) * spow(si, e);
  // cresta dorsal baja y alargada (relieve estrecho en la línea media)
  const ridge = 0.022 * smooth(0.46, 0.56, s) * (1 - smooth(0.7, 0.86, s));
  if (si > 0) y += ridge * Math.exp(-(c * c) * 60) * si;
  // quilla ventral del pedúnculo y quilla dorsal posterior
  const keel = 0.016 * smooth(0.76, 0.86, s) * (1 - smooth(0.95, 1.0, s));
  if (si < 0) y -= keel * Math.exp(-(c * c) * 50) * -si;
  if (si > 0) y += keel * 0.8 * Math.exp(-(c * c) * 50) * si * smooth(0.82, 0.9, s);
  // espiráculo en media luna detrás del melón (hundimiento suave)
  const bs = (s - 0.205) / 0.006;
  const bz = (c + 0.02 * Math.sign(c) * 0) / 0.09;
  if (si > 0.6) y -= 0.006 * Math.exp(-bs * bs - bz * bz * (1 + 2 * Math.max(0, bs)));
  // la boca: labio ligeramente marcado (surco) en la línea de la comisura
  const mouthPhi = Math.abs(Math.sin(phi + ALPHA)) < 0.06 || Math.abs(Math.sin(phi - Math.PI - ALPHA)) < 0.06;
  if (s < SM && mouthPhi) {
    z *= 0.985;
  }
  return new THREE.Vector3(-s * L, y, z);
}

// -------------------------------------------------------------------------------------------- RIG
export type IniaPose = {
  phase: number; // fase del batido (rad, acumulada)
  amp: number; // amplitud del batido 0…1,5
  headYaw: number; // giro lateral de la cabeza (rad, límite ±1,22)
  headPitch: number; // cabeceo (rad, límite ±0,52)
  bend: number; // curvatura lateral del tronco (giros), −1…1
  arch: number; // curvatura dorsoventral postural, −1…1
  roll: number; // alabeo del cuerpo completo (rad)
  jaw: number; // apertura de la mandíbula 0…1 (≈ 30°)
  flipL: [number, number, number]; // aleta izquierda: [abducción, barrido, torsión] (rad, desde la pose de reposo)
  flipR: [number, number, number];
  eyeYaw: number; // dirección de la mirada
  blink: number; // 0 abierto … 1 cerrado
  age: number; // 1 adulto … 0 cría
};
export const restPose = (): IniaPose => ({phase: 0, amp: 0, headYaw: 0, headPitch: 0, bend: 0, arch: 0, roll: 0, jaw: 0, flipL: [0, 0, 0], flipR: [0, 0, 0], eyeYaw: 0, blink: 0, age: 1});

export type Frame = {p: THREE.Vector3; q: THREE.Quaternion};
/** Resuelve los marcos de la columna en los valores de s indicados (orden creciente, todos ≥ S_HEAD). */
export function solveSpine(pose: IniaPose, ss: number[]): Map<number, Frame> {
  const yawH = clamp(pose.headYaw, -1.22, 1.22);
  const pitchH = clamp(pose.headPitch, -0.52, 0.52);
  // incremento angular por unidad de s (pitch: z-rot; yaw: y-rot) en cada punto
  const inc = (s: number) => {
    // ondulación dorsoventral: crece hacia la cola (último tercio), leve contramovimiento delante
    const g = Math.pow(Math.max(0, (s - 0.45) / 0.55), 1.4) * 2.6 - (s < 0.4 ? 0.12 * (0.4 - s) / 0.22 : 0);
    const wave = pose.amp * 0.55 * g * Math.cos(pose.phase - s * 5.2);
    const neckW = s < S_NECK ? 1 / (S_NECK - S_HEAD) : 0; // el cuello concentra el giro de la cabeza
    const pitch = wave + pose.arch * 0.9 + pitchH * neckW * -1;
    const yaw = pose.bend * 1.4 * (s > S_NECK ? 1 : 0.6) + yawH * neckW;
    return {pitch, yaw};
  };
  const out = new Map<number, Frame>();
  const root = {p: new THREE.Vector3(0, 0, 0), q: new THREE.Quaternion()};
  // hacia la cabeza (s decreciente desde la raíz)
  const fwd = ss.filter((s) => s <= S_ROOT).sort((a, b) => b - a);
  const back = ss.filter((s) => s > S_ROOT).sort((a, b) => a - b);
  const qz = new THREE.Quaternion();
  const qy = new THREE.Quaternion();
  const AX_Z = new THREE.Vector3(0, 0, 1);
  const AX_Y = new THREE.Vector3(0, 1, 0);
  let cur = {p: root.p.clone(), q: root.q.clone()};
  let sPrev = S_ROOT;
  for (const s of fwd) {
    const ds = sPrev - s;
    const a = inc((s + sPrev) / 2);
    // al avanzar hacia la cabeza los ángulos se aplican en sentido contrario (convención desde la raíz)
    qz.setFromAxisAngle(AX_Z, -a.pitch * ds);
    qy.setFromAxisAngle(AX_Y, a.yaw * ds);
    cur.q = cur.q.clone().multiply(qy).multiply(qz);
    cur.p = cur.p.clone().add(new THREE.Vector3(ds * L, 0, 0).applyQuaternion(cur.q));
    out.set(s, {p: cur.p.clone(), q: cur.q.clone()});
    sPrev = s;
  }
  cur = {p: root.p.clone(), q: root.q.clone()};
  sPrev = S_ROOT;
  for (const s of back) {
    const ds = s - sPrev;
    const a = inc((s + sPrev) / 2);
    qz.setFromAxisAngle(AX_Z, a.pitch * ds);
    qy.setFromAxisAngle(AX_Y, -a.yaw * ds);
    cur.q = cur.q.clone().multiply(qy).multiply(qz);
    cur.p = cur.p.clone().add(new THREE.Vector3(-ds * L, 0, 0).applyQuaternion(cur.q));
    out.set(s, {p: cur.p.clone(), q: cur.q.clone()});
    sPrev = s;
  }
  out.set(S_ROOT, {p: root.p.clone(), q: root.q.clone()});
  return out;
}

/** Transforma un punto de reposo (x = −sL) al espacio posado usando el marco en s (o el de la cabeza). */
function poseVec(v: THREE.Vector3, f: Frame, s0: number): THREE.Vector3 {
  const local = new THREE.Vector3(v.x + s0 * L, v.y, v.z);
  return local.applyQuaternion(f.q).add(f.p);
}

// -------------------------------------------------------------------------------------------- MALLA DEL CUERPO
export const NS = 150; // secciones
export const NPU = 44; // segmentos del arco superior (dorso y lados)
export const NPL = 32; // segmentos del arco inferior (vientre / mandíbula)
/** Distribución de secciones: más densa en la cabeza (rostro, melón) y en la cola. */
export const SECTIONS: number[] = Array.from({length: NS}, (_, i) => {
  const u = i / (NS - 1);
  return clamp(u + 0.06 * Math.sin(u * Math.PI * 2) * 0.5 - 0.035 * Math.sin(u * Math.PI));
});
const ringPhis = (): number[] => {
  const up = Array.from({length: NPU + 1}, (_, k) => -ALPHA + (k / NPU) * (Math.PI + 2 * ALPHA));
  const lo = Array.from({length: NPL + 1}, (_, k) => Math.PI + ALPHA + (k / NPL) * (Math.PI - 2 * ALPHA));
  return [...up, ...lo];
};
export const PHIS = ringPhis();
const RING = PHIS.length;

/** Peso de la mandíbula según s: 0 en la comisura, 1 hacia la punta (apertura natural sin pliegue brusco). */
const jawW = (s: number) => (s >= SM ? 0 : smooth(SM, SM - 0.035, s));
const HINGE = () => new THREE.Vector3(-SM * L, -0.03, 0);

export type BodyBuffers = {position: Float32Array; normal: Float32Array; uv: Float32Array; index: Uint32Array};
let INDEX: Uint32Array | null = null;
let UV: Float32Array | null = null;
function topology() {
  if (INDEX && UV) return {index: INDEX, uv: UV};
  const idx: number[] = [];
  // orden antihorario visto desde fuera (normales de cara hacia el exterior)
  const quad = (a: number, b: number, c: number, d: number) => idx.push(a, d, b, b, d, c);
  for (let i = 0; i < NS - 1; i++) {
    for (let k = 0; k < NPU; k++) quad(i * RING + k, (i + 1) * RING + k, (i + 1) * RING + k + 1, i * RING + k + 1);
    const o = NPU + 1;
    for (let k = 0; k < NPL; k++) quad(i * RING + o + k, (i + 1) * RING + o + k, (i + 1) * RING + o + k + 1, i * RING + o + k + 1);
  }
  // tapas: punta del hocico y extremo de la cola (abanico al centro de la sección)
  const tipA = NS * RING;
  const tipB = tipA + 1;
  for (let k = 0; k < NPU; k++) idx.push(tipA, k, k + 1);
  const tipC = tipA + 2; // punta de la mandíbula (gira con ella)
  for (let k = 0; k < NPL; k++) idx.push(tipC, NPU + 1 + k, NPU + 1 + k + 1);
  const last = (NS - 1) * RING;
  for (let k = 0; k < NPU; k++) idx.push(tipB, last + k + 1, last + k);
  for (let k = 0; k < NPL; k++) idx.push(tipB, last + NPU + 1 + k + 1, last + NPU + 1 + k);
  INDEX = new Uint32Array(idx);
  const uv = new Float32Array((NS * RING + 3) * 2);
  for (let i = 0; i < NS; i++)
    for (let k = 0; k < RING; k++) {
      const phi = PHIS[k];
      uv[(i * RING + k) * 2] = SECTIONS[i];
      uv[(i * RING + k) * 2 + 1] = (((phi + ALPHA) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI * 2);
    }
  uv.set([0, 0.25, 1, 0.25, 0, 0.75], NS * RING * 2);
  UV = uv;
  return {index: INDEX, uv: UV};
}

/** Normal analítica (diferencias finitas en la superficie de reposo). */
function restNormal(s: number, phi: number, age: number): THREE.Vector3 {
  const e = 1e-3;
  s = Math.max(0.003, s);
  const a = surface(Math.min(1, s + e), phi, age).sub(surface(Math.max(0, s - e), phi, age));
  const b = surface(s, phi + e, age).sub(surface(s, phi - e, age));
  return new THREE.Vector3().crossVectors(b, a).normalize();
}

/** Construye los búferes del cuerpo para una pose. Devuelve también los marcos (para anclar aletas, ojos, dientes). */
export function buildBody(pose: IniaPose) {
  const {index, uv} = topology();
  const bodyS = SECTIONS.filter((s) => s >= S_HEAD);
  const frames = solveSpine(pose, [S_HEAD, ...bodyS, 0.265, 0.205, 1.0]);
  const head = frames.get(S_HEAD)!;
  const pos = new Float32Array((NS * RING + 3) * 3);
  const nor = new Float32Array((NS * RING + 3) * 3);
  const hinge = HINGE();
  const jawAng = -clamp(pose.jaw) * 0.52;
  const tmp = new THREE.Vector3();
  for (let i = 0; i < NS; i++) {
    const s = SECTIONS[i];
    const f = s >= S_HEAD ? frames.get(s)! : head;
    const s0 = s >= S_HEAD ? s : S_HEAD;
    const jw = jawW(s);
    for (let k = 0; k < RING; k++) {
      const phi = PHIS[k];
      let v = surface(s, phi, pose.age);
      let n = restNormal(s, phi, pose.age);
      // la mandíbula (arco inferior de la boca) gira sobre la bisagra
      if (k > NPU && jw > 0) {
        const a = jawAng * jw;
        tmp.copy(v).sub(hinge);
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        v = new THREE.Vector3(hinge.x + tmp.x * ca - tmp.y * sa, hinge.y + tmp.x * sa + tmp.y * ca, v.z);
        n = new THREE.Vector3(n.x * ca - n.y * sa, n.x * sa + n.y * ca, n.z);
      }
      const P = poseVec(v, f, s0);
      const N = n.applyQuaternion(f.q);
      const o = (i * RING + k) * 3;
      pos[o] = P.x;
      pos[o + 1] = P.y;
      pos[o + 2] = P.z;
      nor[o] = N.x;
      nor[o + 1] = N.y;
      nor[o + 2] = N.z;
    }
  }
  // puntas
  const tip = poseVec(surface(0, 0, pose.age).setZ(0).setY(-0.034), head, S_HEAD);
  pos.set([tip.x, tip.y, tip.z], NS * RING * 3);
  const tq = new THREE.Vector3(1, 0, 0).applyQuaternion(head.q);
  nor.set([tq.x, tq.y, tq.z], NS * RING * 3);
  const tf = frames.get(1.0)!;
  const tail = tf.p;
  const tn = new THREE.Vector3(-1, 0, 0).applyQuaternion(tf.q);
  pos.set([tail.x, tail.y, tail.z], (NS * RING + 1) * 3);
  nor.set([tn.x, tn.y, tn.z], (NS * RING + 1) * 3);
  // punta inferior: misma posición que la superior con la boca cerrada; gira con la mandíbula al abrirla
  const tl = new THREE.Vector3(0, -0.034, 0).sub(hinge);
  const aj = jawAng;
  const tipLow = poseVec(new THREE.Vector3(hinge.x + tl.x * Math.cos(aj) - tl.y * Math.sin(aj), hinge.y + tl.x * Math.sin(aj) + tl.y * Math.cos(aj), 0), head, S_HEAD);
  pos.set([tipLow.x, tipLow.y, tipLow.z], (NS * RING + 2) * 3);
  const tnl = new THREE.Vector3(Math.cos(aj), Math.sin(aj), 0).applyQuaternion(head.q);
  nor.set([tnl.x, tnl.y, tnl.z], (NS * RING + 2) * 3);
  return {buffers: {position: pos, normal: nor, uv, index} as BodyBuffers, frames, head};
}

/** Interior de la boca (paladar, suelo de la boca y fondo) — visible solo al abrir la mandíbula. */
export function buildMouth(pose: IniaPose, head: Frame) {
  const hinge = HINGE();
  const jawAng = -clamp(pose.jaw) * 0.52;
  const n = 26;
  const pts: number[] = [];
  const idx: number[] = [];
  const add = (v: THREE.Vector3) => {
    const P = poseVec(v, head, S_HEAD);
    pts.push(P.x, P.y, P.z);
    return pts.length / 3 - 1;
  };
  const rot = (v: THREE.Vector3, w: number) => {
    const a = jawAng * w;
    const t = v.clone().sub(hinge);
    return new THREE.Vector3(hinge.x + t.x * Math.cos(a) - t.y * Math.sin(a), hinge.y + t.x * Math.sin(a) + t.y * Math.cos(a), v.z);
  };
  const rows: number[][] = [];
  for (let i = 0; i <= n; i++) {
    const s = 0.01 + (i / n) * (SM - 0.01);
    const L0 = surface(s, -ALPHA);
    const R0 = surface(s, Math.PI + ALPHA);
    const w = jawW(s);
    // paladar (ligeramente hundido hacia arriba) y suelo de la boca (hacia abajo), ambos dentro del contorno
    const pal = [add(L0.clone().multiplyScalar(1).add(new THREE.Vector3(0, 0.002, -0.002))), add(new THREE.Vector3(L0.x, L0.y + 0.012, 0)), add(R0.clone().add(new THREE.Vector3(0, 0.002, 0.002)))];
    const flo = [add(rot(L0.clone().add(new THREE.Vector3(0, -0.002, -0.002)), w)), add(rot(new THREE.Vector3(L0.x, L0.y - 0.01, 0), w)), add(rot(R0.clone().add(new THREE.Vector3(0, -0.002, 0.002)), w))];
    rows.push([...pal, ...flo]);
  }
  for (let i = 0; i < n; i++) {
    const a = rows[i];
    const b = rows[i + 1];
    for (const [o, len] of [[0, 2], [3, 2]] as [number, number][])
      for (let k = 0; k < len; k++) idx.push(a[o + k], b[o + k], b[o + k + 1], a[o + k], b[o + k + 1], a[o + k + 1]);
  }
  // fondo de la boca (garganta) entre paladar y suelo en la comisura
  const last = rows[n];
  idx.push(last[0], last[1], last[4], last[0], last[4], last[3], last[1], last[2], last[5], last[1], last[5], last[4]);
  return {position: new Float32Array(pts), index: new Uint32Array(idx)};
}

/** Dientes heterodontos: cónicos delante, con corona más ancha detrás. Devuelve matrices (superiores y mandíbula). */
export function teethMatrices(pose: IniaPose, head: Frame): THREE.Matrix4[] {
  const hinge = HINGE();
  const jawAng = -clamp(pose.jaw) * 0.52;
  const out: THREE.Matrix4[] = [];
  const count = 24; // 23–35 por hemimandíbula en la especie
  for (const jaw of [false, true])
    for (const side of [-1, 1])
      for (let i = 0; i < count; i++) {
        const s = 0.018 + (i / (count - 1)) * (SM - 0.03);
        const phi = side > 0 ? -ALPHA : Math.PI + ALPHA;
        const v = surface(s, phi);
        v.z *= 0.86; // hacia dentro de la boca
        const rear = i > count * 0.55;
        let q = new THREE.Quaternion().setFromEuler(new THREE.Euler(jaw ? 0 : Math.PI, 0, 0));
        let p = v.clone().add(new THREE.Vector3(0, jaw ? 0.001 : -0.001, 0));
        if (jaw) {
          const w = jawW(s);
          const a = jawAng * w;
          const t = p.clone().sub(hinge);
          p = new THREE.Vector3(hinge.x + t.x * Math.cos(a) - t.y * Math.sin(a), hinge.y + t.x * Math.sin(a) + t.y * Math.cos(a), p.z);
          q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), a).multiply(q);
        }
        const P = poseVec(p, head, S_HEAD);
        const Q = head.q.clone().multiply(q);
        const sc = rear ? new THREE.Vector3(1.5, 0.75, 1.3) : new THREE.Vector3(1, 1, 1);
        out.push(new THREE.Matrix4().compose(P, Q, sc));
      }
  return out;
}

/** Posición y orientación del ojo (en la superficie, sobre la comisura) en espacio posado. */
export function eyeFrame(head: Frame, side: 1 | -1) {
  const s = 0.168;
  const phi = side > 0 ? 0.12 : Math.PI - 0.12;
  const v = surface(s, phi);
  const n = restNormal(s, phi, 1);
  const p = poseVec(v.clone().addScaledVector(n, -0.0065), head, S_HEAD);
  const N = n.clone().applyQuaternion(head.q);
  return {p, n: N, q: head.q};
}

// -------------------------------------------------------------------------------------------- ALETAS Y COLA
/** Loft de un ala con perfil aerodinámico: planta (borde de ataque, cuerda) y espesor a lo largo de la envergadura. */
export function foilGeometry(opts: {span: number; nS: number; nC: number; le: (r: number) => number; chord: (r: number) => number; thick: (r: number) => number; sym?: boolean; flex?: (r: number) => number}) {
  const {span, nS, nC} = opts;
  const rs = opts.sym ? Array.from({length: nS * 2 + 1}, (_, i) => (i - nS) / nS) : Array.from({length: nS + 1}, (_, i) => i / nS);
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const RINGF = nC * 2;
  rs.forEach((r, i) => {
    const ar = Math.abs(r);
    const c = Math.max(0.004, opts.chord(ar));
    const t = opts.thick(ar) * c;
    const le = opts.le(ar);
    const fl = opts.flex ? opts.flex(r) : 0;
    for (let k = 0; k < RINGF; k++) {
      const a = (k / RINGF) * Math.PI * 2;
      const xc = (1 - Math.cos(a)) / 2; // 0 borde de ataque … 1 borde de salida
      const th = t * 0.5 * Math.sin(a) * (1 - 0.55 * xc) * (0.4 + 0.6 * Math.sqrt(Math.max(0, Math.sin(Math.min(Math.PI, xc * Math.PI * 0.999 + 0.0005)))));
      const x = le - xc * c;
      pos.push(x, th + fl * (le - x) * 0.6, r * span);
      uv.push(xc, (r + 1) / 2);
    }
    if (i < rs.length - 1)
      for (let k = 0; k < RINGF; k++) {
        const a0 = i * RINGF + k;
        const a1 = i * RINGF + ((k + 1) % RINGF);
        const b0 = (i + 1) * RINGF + k;
        const b1 = (i + 1) * RINGF + ((k + 1) % RINGF);
        idx.push(a0, b0, b1, a0, b1, a1);
      }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Aleta pectoral grande en forma de remo (punta roma). Envergadura ≈ 0,36 m, cuerda en la base ≈ 0,17 m. */
export const flipperGeometry = () =>
  foilGeometry({
    span: 0.34,
    nS: 18,
    nC: 14,
    le: (r) => 0.02 * Math.sin(r * Math.PI) - 0.05 * Math.pow(r, 2),
    chord: (r) => 0.215 * (1 - 0.1 * r) * Math.sqrt(Math.max(0.02, 1 - Math.pow(r, 2.6))),
    thick: (r) => 0.24 * (1 - 0.4 * r),
  });

/** Aleta caudal horizontal de dos lóbulos (envergadura total ≈ 0,56 m) con muesca central. */
export const flukeGeometry = (flex = 0) =>
  foilGeometry({
    span: 0.31,
    nS: 16,
    nC: 12,
    sym: true,
    le: (r) => 0.02 - 0.11 * Math.pow(r, 1.25),
    chord: (r) => (0.17 * Math.pow(1 - r, 0.55) + 0.02) * (1 - 0.18 * Math.exp(-((r / 0.08) ** 2))) * Math.sqrt(Math.max(0.03, 1 - Math.pow(r, 6))),
    thick: (r) => 0.16 * (1 - 0.6 * r),
    flex: (r) => flex * r * r,
  });

/** Matriz de anclaje de una aleta pectoral sobre el marco del cuerpo en s = 0,265. */
export function flipperMatrix(frames: Map<number, Frame>, side: 1 | -1, art: [number, number, number], age = 1) {
  const f = frames.get(0.265)!;
  const phi = side > 0 ? -0.62 : Math.PI + 0.62;
  const root = surface(0.265, phi, age);
  root.z *= 0.92;
  root.y += 0.01;
  const local = new THREE.Vector3(root.x + 0.265 * L + 0.05, root.y, root.z);
  // reposo: caída de ≈ 40°, barrido hacia atrás ≈ 30°; más la articulación animada
  const [ab, sw, tw] = art;
  // barrido hacia atrás (eje y), caída hacia abajo (eje x) y torsión sobre la envergadura (eje z)
  const qa = new THREE.Quaternion()
    .setFromEuler(new THREE.Euler(0, -(0.72 + sw) * side, 0))
    .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler((side > 0 ? 1 : -1) * (0.5 + ab), 0, 0)))
    .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, tw)));
  const mirror = side > 0 ? new THREE.Vector3(1, 1, 1) : new THREE.Vector3(1, 1, -1);
  const P = local.clone().applyQuaternion(f.q).add(f.p);
  const Q = f.q.clone().multiply(qa);
  return new THREE.Matrix4().compose(P, Q, mirror);
}

/** Matriz de anclaje de la cola en el extremo (s = 1) con el cabeceo de retraso del batido. */
export function flukeMatrix(frames: Map<number, Frame>, pose: IniaPose) {
  const f = frames.get(1.0)!;
  const lag = -pose.amp * 0.32 * Math.sin(pose.phase - 5.2 - 0.9);
  const q = f.q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), lag));
  return new THREE.Matrix4().compose(f.p.clone().add(new THREE.Vector3(0.012, 0, 0).applyQuaternion(f.q)), q, new THREE.Vector3(1, 1, 1));
}
export const flukeFlex = (pose: IniaPose) => pose.amp * 0.25 * Math.sin(pose.phase - 5.2 - 1.5);
export const lerpN = lerp;
