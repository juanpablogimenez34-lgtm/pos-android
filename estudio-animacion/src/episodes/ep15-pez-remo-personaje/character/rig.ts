// RIG DEL PEZ REMO GIGANTE (personaje principal, versión de maqueta).
// Una columna de N articulaciones recorre el cuerpo detrás de la cabeza (x = 0 → −longitud).
// Cada capa (piel, escamas, manchas, aleta dorsal, aletas pares) se construye sobre esta columna,
// así que todas se deforman juntas. Todo depende solo de `t` (determinista en cualquier fotograma).
//
// Movimiento naturalista: la propulsión visible está en la ALETA DORSAL (onda cabeza → cola).
// El cuerpo ondula muy poco (amplitud pequeña que crece hacia la cola) y la cabeza apenas cabecea:
// así se evita el aspecto de serpiente.
export type V = {x: number; y: number};

export type OarRig = {
  t: number;
  length: number; // longitud del cuerpo detrás de la cabeza (u)
  bodyAmp: number; // ondulación vertical del cuerpo (u)
  bodyFreq: number; // ondas a lo largo del cuerpo
  bodySpeed: number; // rad/s
  curve: number; // curvatura lenta y amplia (u)
  curvePhase: number;
  finWaves: number; // ondas simultáneas en la aleta dorsal
  finSpeed: number; // rad/s (la onda viaja hacia la cola)
  finAmp: number; // inclinación de los radios (rad)
  mouth: number; // 0 cerrada … 1 abierta
  current: number; // deriva de la cola por la corriente
};

export const defaultRig = (o: Partial<OarRig> = {}): OarRig => ({
  t: 0,
  length: 1750,
  bodyAmp: 7,
  bodyFreq: 1.15,
  bodySpeed: 1.7,
  curve: 22,
  curvePhase: 0,
  finWaves: 6,
  finSpeed: 3.4,
  finAmp: 0.3,
  mouth: 0.25,
  current: 0,
  ...o,
});

export const NB = 84;

/** Altura total del cuerpo a lo largo (u: 0 detrás de la cabeza … 1 cola). Cinta ancha que se afina. */
export const depthAt = (u: number) => (u < 0.04 ? 104 + 350 * u : 118 * (1 - 0.86 * Math.pow(u, 1.12)) + 4);

export type Spine = {pts: V[]; tan: V[]; nrm: V[]; depth: number[]; u: number[]};

export function spine(r: OarRig, n = NB): Spine {
  const pts: V[] = [];
  const u: number[] = [];
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1);
    const x = -k * r.length;
    const wave = r.bodyAmp * Math.sin(2 * Math.PI * r.bodyFreq * k - r.bodySpeed * r.t) * (0.15 + k);
    const bend = r.curve * Math.sin(Math.PI * 1.25 * k + r.curvePhase + r.t * 0.18) * k;
    const y = wave + bend + r.current * 140 * k * k;
    pts.push({x, y});
    u.push(k);
  }
  const tan = pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const l = Math.hypot(dx, dy) || 1;
    return {x: dx / l, y: dy / l}; // apunta hacia la cabeza
  });
  const nrm = tan.map((t) => ({x: t.y, y: -t.x})); // hacia el dorso (arriba)
  return {pts, tan, nrm, depth: u.map(depthAt), u};
}

/** Punto de la piel: u a lo largo, v ∈ [−1 dorso, 1 vientre]. */
export function skinPoint(s: Spine, u: number, v: number): V {
  const f = Math.min(1, Math.max(0, u)) * (s.pts.length - 1);
  const i = Math.min(s.pts.length - 2, Math.floor(f));
  const k = f - i;
  const p = {x: s.pts[i].x + (s.pts[i + 1].x - s.pts[i].x) * k, y: s.pts[i].y + (s.pts[i + 1].y - s.pts[i].y) * k};
  const n = {x: s.nrm[i].x + (s.nrm[i + 1].x - s.nrm[i].x) * k, y: s.nrm[i].y + (s.nrm[i + 1].y - s.nrm[i].y) * k};
  const h = depthAt(u) * 0.5;
  return {x: p.x - n.x * h * v, y: p.y - n.y * h * v};
}

/** Ángulo de la cabeza (sigue a la primera articulación, con un cabeceo mínimo). */
export const headAngle = (s: Spine, r: OarRig) => Math.atan2(s.tan[2].y, s.tan[2].x) * 0.6 + Math.sin(r.t * 1.1) * 0.012;

export const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

/** Cinta afinada (para radios de aleta): polígono a lo largo de `pts` con ancho w0 → w1. */
export function taper(pts: V[], w0: number, w1: number): string {
  const n = pts.length;
  const L: V[] = [];
  const R: V[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    const w = (w0 + (w1 - w0) * (i / (n - 1))) / 2;
    L.push({x: pts[i].x - (dy / l) * w, y: pts[i].y + (dx / l) * w});
    R.push({x: pts[i].x + (dy / l) * w, y: pts[i].y - (dx / l) * w});
  }
  return `M${L.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')} L${R.reverse().map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')}Z`;
}

/** Curva cuadrática muestreada. */
export const quad = (a: V, c: V, b: V, n = 8): V[] =>
  Array.from({length: n + 1}, (_, i) => {
    const k = i / n;
    return {x: (1 - k) * (1 - k) * a.x + 2 * (1 - k) * k * c.x + k * k * b.x, y: (1 - k) * (1 - k) * a.y + 2 * (1 - k) * k * c.y + k * k * b.y};
  });
