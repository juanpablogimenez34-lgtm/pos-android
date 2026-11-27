// RIG 3D DEL PEZ REMO GIGANTE (personaje premium, reutilizable).
//
// 1) TRAYECTORIA: la cabeza sigue una curva 3D suave (Hermite por claves de tiempo).
// 2) SEGUIMIENTO DEL LÍDER: el cuerpo NO oscila como una serpiente: cada punto de control ocupa la
//    posición por la que pasó la cabeza a una distancia d detrás de ella (como un tren). Así los giros
//    recorren el cuerpo de forma natural y coordinada.
// 3) 12 PUNTOS DE CONTROL a lo largo del cuerpo; una spline Catmull-Rom continua los une y se muestrea
//    en 96 puntos: no hay segmentos ni uniones visibles.
// 4) MARCO LOCAL 3D en cada muestra: avance h, dorso d (perpendicular a h en el plano vertical) y
//    lateral l = h × d. Piel, aleta, escamas y aletas pares se construyen en 3D y se PROYECTAN con
//    perspectiva: el escorzo, el giro y los cambios de escala son geométricos, no un espejo 2D.
// 5) Ondulación mínima superpuesta (dorso y lateral) para que el cuerpo respire sin serpentear.
// Todo depende solo del tiempo t (determinista en cualquier fotograma de Remotion).

export type V3 = {x: number; y: number; z: number};
export type V2 = {x: number; y: number};
export type Key = [number, number, number, number]; // [t, x, y, z]

export const v3 = (x: number, y: number, z: number): V3 => ({x, y, z});
const add = (a: V3, b: V3) => v3(a.x + b.x, a.y + b.y, a.z + b.z);
const sub = (a: V3, b: V3) => v3(a.x - b.x, a.y - b.y, a.z - b.z);
const mul = (a: V3, k: number) => v3(a.x * k, a.y * k, a.z * k);
const dot = (a: V3, b: V3) => a.x * b.x + a.y * b.y + a.z * b.z;
const len = (a: V3) => Math.sqrt(dot(a, a));
const norm = (a: V3) => mul(a, 1 / (len(a) || 1));
const cross = (a: V3, b: V3) => v3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);

/** Trayectoria de la cabeza: Hermite cúbico con tangentes de tipo Catmull-Rom (respetando el
 *  espaciado temporal de las claves). Fuera del rango continúa en línea recta. */
export function pathAt(keys: Key[], t: number): V3 {
  const P = (i: number) => v3(keys[i][1], keys[i][2], keys[i][3]);
  const n = keys.length;
  const tangent = (i: number) => {
    const a = Math.max(0, i - 1);
    const b = Math.min(n - 1, i + 1);
    return mul(sub(P(b), P(a)), 1 / (keys[b][0] - keys[a][0]));
  };
  if (t <= keys[0][0]) return add(P(0), mul(tangent(0), t - keys[0][0]));
  if (t >= keys[n - 1][0]) return add(P(n - 1), mul(tangent(n - 1), t - keys[n - 1][0]));
  let i = 0;
  while (i < n - 2 && t > keys[i + 1][0]) i++;
  const t0 = keys[i][0];
  const t1 = keys[i + 1][0];
  const h = t1 - t0;
  const s = (t - t0) / h;
  const h00 = 2 * s * s * s - 3 * s * s + 1;
  const h10 = s * s * s - 2 * s * s + s;
  const h01 = -2 * s * s * s + 3 * s * s;
  const h11 = s * s * s - s * s;
  return add(add(mul(P(i), h00), mul(tangent(i), h10 * h)), add(mul(P(i + 1), h01), mul(tangent(i + 1), h11 * h)));
}

/** Catmull-Rom uniforme entre p1 y p2. */
const cr = (p0: V3, p1: V3, p2: V3, p3: V3, s: number) => {
  const s2 = s * s;
  const s3 = s2 * s;
  const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * s + (2 * a - 5 * b + 4 * c - d) * s2 + (-a + 3 * b - 3 * c + d) * s3);
  return v3(f(p0.x, p1.x, p2.x, p3.x), f(p0.y, p1.y, p2.y, p3.y), f(p0.z, p1.z, p2.z, p3.z));
};

export type RigParams = {
  t: number;
  keys: Key[];
  length: number; // longitud del cuerpo detrás de la cabeza (u)
  controls: number; // puntos de control (≥ 12)
  samples: number; // muestras de la spline
  undulation: number; // amplitud dorsal (u)
  lateral: number; // amplitud lateral (u)
  waveFreq: number; // ondas a lo largo del cuerpo
  waveSpeed: number; // rad/s
};

export const rigParams = (o: Partial<RigParams> & {keys: Key[]; t: number}): RigParams => ({length: 1750, controls: 12, samples: 96, undulation: 6, lateral: 4, waveFreq: 1.1, waveSpeed: 1.6, ...o});

export type Frame = {p: V3; h: V3; d: V3; l: V3; u: number};
export type Rig = {controls: V3[]; frames: Frame[]; head: Frame; params: RigParams};

/** Construye el rig del fotograma: controles por seguimiento del líder + spline + marcos locales. */
export function buildRig(params: RigParams): Rig {
  const {t, keys, length, controls: nc, samples} = params;
  // muestrear la trayectoria hacia atrás y acumular longitud de arco
  const trail: {p: V3; s: number}[] = [{p: pathAt(keys, t), s: 0}];
  const dt = 0.04;
  let acc = 0;
  for (let k = 1; acc < length + 60 && k < 5000; k++) {
    const p = pathAt(keys, t - k * dt);
    acc += len(sub(p, trail[trail.length - 1].p));
    trail.push({p, s: acc});
  }
  const at = (s: number) => {
    let i = 1;
    while (i < trail.length - 1 && trail[i].s < s) i++;
    const a = trail[i - 1];
    const b = trail[i];
    const k = (s - a.s) / ((b.s - a.s) || 1);
    return add(a.p, mul(sub(b.p, a.p), Math.min(1, Math.max(0, k))));
  };
  const ctrl: V3[] = Array.from({length: nc}, (_, i) => at((i / (nc - 1)) * length));
  // spline continua por los 12 controles
  const pts: V3[] = [];
  for (let i = 0; i < samples; i++) {
    const g = (i / (samples - 1)) * (nc - 1);
    const j = Math.min(nc - 2, Math.floor(g));
    const s = g - j;
    pts.push(cr(ctrl[Math.max(0, j - 1)], ctrl[j], ctrl[j + 1], ctrl[Math.min(nc - 1, j + 2)], s));
  }
  const up = v3(0, -1, 0);
  const frames: Frame[] = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(samples - 1, i + 1)];
    const h = norm(sub(a, b)); // hacia la cabeza
    const d = norm(sub(up, mul(h, dot(up, h))));
    const l = norm(cross(h, d));
    const u = i / (samples - 1);
    const wave = Math.sin(2 * Math.PI * params.waveFreq * u - params.waveSpeed * t);
    const off = add(mul(d, params.undulation * wave * (0.15 + u)), mul(l, params.lateral * Math.sin(2 * Math.PI * 0.6 * u - 1.1 * t) * u));
    return {p: add(p, off), h, d, l, u};
  });
  return {controls: ctrl, frames, head: frames[0], params};
}

/** Proyección en perspectiva alrededor del centro de cámara (cx, cy). z > 0 se aleja. */
export type Proj = {cx: number; cy: number; f: number};
export const project = (q: V3, pr: Proj): V2 & {k: number} => {
  const k = pr.f / Math.max(80, pr.f + q.z);
  return {x: pr.cx + (q.x - pr.cx) * k, y: pr.cy + (q.y - pr.cy) * k, k};
};

export const vadd = add;
export const vmul = mul;
export const vsub = sub;
export const vnorm = norm;

/** Altura total del cuerpo (u: 0 detrás de la cabeza … 1 cola): cinta ancha que se afina. */
export const depthAt = (u: number) => (u < 0.04 ? 104 + 350 * u : 118 * (1 - 0.86 * Math.pow(u, 1.12)) + 4);

export const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
