// MOTOR DE MOVIMIENTO DEL MIXINO.
// El cuerpo es una columna de N puntos que sigue una trayectoria ("sigue al líder"): la cabeza avanza
// por la curva y cada punto ocupa la posición que la cabeza tuvo antes. Sobre esa trayectoria se suma
// una onda lateral (ondulación anguiliforme, mayor hacia la cola). La trayectoria puede llevar
// profundidad z (para el nudo: los tramos que pasan por encima se dibujan delante).
export type P3 = {x: number; y: number; z?: number};
export type Spine = {x: number; y: number; z: number}[];

export type Path = {pts: P3[]; cum: number[]; total: number};

export function makePath(pts: P3[]): Path {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  return {pts, cum, total: cum[cum.length - 1]};
}

/** Punto a distancia s (fuera de los extremos, prolonga en línea recta). */
export function pathAt(p: Path, s: number): {x: number; y: number; z: number; ang: number} {
  const n = p.pts.length;
  let i = 1;
  if (s <= 0) i = 1;
  else if (s >= p.total) i = n - 1;
  else {
    let lo = 1;
    let hi = n - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (p.cum[mid] < s) lo = mid + 1;
      else hi = mid;
    }
    i = lo;
  }
  const a = p.pts[i - 1];
  const b = p.pts[i];
  const seg = p.cum[i] - p.cum[i - 1] || 1;
  const u = (s - p.cum[i - 1]) / seg;
  return {x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, z: (a.z ?? 0) + ((b.z ?? 0) - (a.z ?? 0)) * Math.min(1, Math.max(0, u)), ang: Math.atan2(b.y - a.y, b.x - a.x)};
}

/** Curva suave (Catmull-Rom muestreada) a partir de pocos puntos de control. */
export function smoothPts(ctrl: P3[], per = 14): P3[] {
  const out: P3[] = [];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = ctrl[Math.max(0, i - 1)];
    const p1 = ctrl[i];
    const p2 = ctrl[i + 1];
    const p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
    for (let k = 0; k < per; k++) {
      const t = k / per;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push({x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y), z: f(p0.z ?? 0, p1.z ?? 0, p2.z ?? 0, p3.z ?? 0)});
    }
  }
  out.push(ctrl[ctrl.length - 1]);
  return out;
}

export type Wave = {amp: number; waves: number; phase: number};

/**
 * Columna del cuerpo: la cabeza está en la distancia `sHead` de la trayectoria (la trayectoria se
 * recorre en el sentido de avance) y el cuerpo ocupa los `len` anteriores. `wave` añade la onda
 * lateral; `phase` debe crecer con el tiempo (ω·t) para que la onda viaje hacia la cola.
 */
export function bodyOnPath(path: Path, sHead: number, len: number, n: number, wave?: Wave): Spine {
  const out: Spine = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const q = pathAt(path, sHead - u * len);
    let x = q.x;
    let y = q.y;
    if (wave && wave.amp) {
      const a = wave.amp * (0.12 + 0.88 * Math.pow(u, 0.9));
      const o = a * Math.sin(2 * Math.PI * wave.waves * u - wave.phase);
      x += -Math.sin(q.ang) * o;
      y += Math.cos(q.ang) * o;
    }
    out.push({x, y, z: q.z});
  }
  return out;
}

/**
 * Trayectoria con NUDO: entra en línea recta, describe la proyección de un nudo trébol (toro (2,3))
 * con profundidad z = sen 3t, y sale en línea recta. `k` (0…1) hace crecer el nudo desde un punto
 * (formación); `rot` gira todo el conjunto. Devuelve también dónde empieza y acaba el nudo.
 */
export function knotPath(cx: number, cy: number, scale: number, k: number, rot: number, lead = 700, R = 1.5): {path: Path; a: number; b: number} {
  const r = 1.0;
  const t0 = 0.18;
  const t1 = 2 * Math.PI - 0.18;
  const steps = 120;
  const rotP = (x: number, y: number) => ({x: cx + (x * Math.cos(rot) - y * Math.sin(rot)), y: cy + (x * Math.sin(rot) + y * Math.cos(rot))});
  const knot: P3[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = t0 + ((t1 - t0) * i) / steps;
    const rr = R + r * Math.cos(3 * t);
    knot.push({...rotP(rr * Math.cos(2 * t) * scale * k, rr * Math.sin(2 * t) * scale * k), z: Math.sin(3 * t) * k});
  }
  // direcciones de entrada y salida (tangentes en los extremos, sin depender de k)
  const tan = (t: number) => {
    const dx = -3 * r * Math.sin(3 * t) * Math.cos(2 * t) - 2 * (R + r * Math.cos(3 * t)) * Math.sin(2 * t);
    const dy = -3 * r * Math.sin(3 * t) * Math.sin(2 * t) + 2 * (R + r * Math.cos(3 * t)) * Math.cos(2 * t);
    const l = Math.hypot(dx, dy);
    return {x: dx / l, y: dy / l};
  };
  const ti = tan(t0);
  const to = tan(t1);
  const di = {x: ti.x * Math.cos(rot) - ti.y * Math.sin(rot), y: ti.x * Math.sin(rot) + ti.y * Math.cos(rot)};
  const dO = {x: to.x * Math.cos(rot) - to.y * Math.sin(rot), y: to.x * Math.sin(rot) + to.y * Math.cos(rot)};
  const s = knot[0];
  const e = knot[knot.length - 1];
  const pre: P3[] = [];
  for (let i = 10; i >= 1; i--) pre.push({x: s.x - di.x * (lead * i) / 10, y: s.y - di.y * (lead * i) / 10, z: 0});
  const post: P3[] = [];
  for (let i = 1; i <= 10; i++) post.push({x: e.x + dO.x * (lead * i) / 10, y: e.y + dO.y * (lead * i) / 10, z: 0});
  const path = makePath([...pre, ...knot, ...post]);
  const a = path.cum[pre.length];
  const b = path.cum[pre.length + knot.length - 1];
  return {path, a, b};
}
