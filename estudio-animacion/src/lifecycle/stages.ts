// MOTOR DE CICLOS DE VIDA (reutilizable). Una especie se describe como una lista de ETAPAS clave con
// parámetros numéricos (longitud de cola, tamaño, desarrollo de patas, forma del cuerpo, piel…).
// `stageAt(keys, g)` interpola todos los parámetros para un grado de desarrollo continuo g ∈ [0, 1]
// con suavizado entre etapas vecinas: la metamorfosis es progresiva e interpolable fotograma a
// fotograma (sin fundidos entre ilustraciones distintas).
// `growthAt(track, t)` convierte el tiempo del video en grado de desarrollo con claves de montaje,
// para condensar días o semanas reales en segundos (transiciones temporales).
export type StageKey<P extends Record<string, number>> = {g: number; name: string; params: P};

const smooth = (u: number) => u * u * (3 - 2 * u);

export function stageAt<P extends Record<string, number>>(keys: StageKey<P>[], g: number): P & {stage: string} {
  const k = [...keys].sort((a, b) => a.g - b.g);
  if (g <= k[0].g) return {...k[0].params, stage: k[0].name};
  if (g >= k[k.length - 1].g) return {...k[k.length - 1].params, stage: k[k.length - 1].name};
  let i = 0;
  while (i < k.length - 2 && g > k[i + 1].g) i++;
  const a = k[i];
  const b = k[i + 1];
  const u = smooth((g - a.g) / (b.g - a.g));
  const out = {} as Record<string, number>;
  for (const key of Object.keys(a.params)) out[key] = a.params[key] + (b.params[key] - a.params[key]) * u;
  return {...(out as P), stage: u < 0.5 ? a.name : b.name};
}

/** Pista de montaje: [tiempo de video (s), grado de desarrollo]. Interpolación suave. */
export type GrowthTrack = [number, number][];
export function growthAt(track: GrowthTrack, t: number): number {
  if (t <= track[0][0]) return track[0][1];
  for (let i = 0; i < track.length - 1; i++) {
    const [t0, g0] = track[i];
    const [t1, g1] = track[i + 1];
    if (t <= t1) return g0 + (g1 - g0) * smooth((t - t0) / (t1 - t0));
  }
  return track[track.length - 1][1];
}

/** Interpolación lineal de polígonos con el mismo número de puntos (morfología del cuerpo). */
export type Pt = {x: number; y: number};
export const lerpPoly = (a: Pt[], b: Pt[], k: number): Pt[] => a.map((p, i) => ({x: p.x + (b[i].x - p.x) * k, y: p.y + (b[i].y - p.y) * k}));

/** Curva cerrada suave (Catmull-Rom → Bézier) a partir de puntos de control. */
export function closedSpline(pts: Pt[], tension = 1): string {
  const n = pts.length;
  const f = (v: number) => (Number.isFinite(v) ? v : 0).toFixed(1);
  let d = `M${f(pts[0].x)},${f(pts[0].y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = {x: p1.x + ((p2.x - p0.x) / 6) * tension, y: p1.y + ((p2.y - p0.y) / 6) * tension};
    const c2 = {x: p2.x - ((p3.x - p1.x) / 6) * tension, y: p2.y - ((p3.y - p1.y) / 6) * tension};
    d += ` C${f(c1.x)},${f(c1.y)} ${f(c2.x)},${f(c2.y)} ${f(p2.x)},${f(p2.y)}`;
  }
  return d + 'Z';
}
