// Curvas suaves (Catmull-Rom → Bézier) y utilidades de trazado SVG.
export type Pt = {x: number; y: number};
export const f1 = (v: number) => (Number.isFinite(v) ? v : 0).toFixed(1);
export const path = (pts: Pt[]) => pts.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y)}`).join(' ');

/** Curva cerrada que pasa por todos los puntos (tensión 1 = Catmull-Rom). */
export function closedSpline(pts: Pt[], tension = 1): string {
  const n = pts.length;
  let d = `M${f1(pts[0].x)},${f1(pts[0].y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = {x: p1.x + ((p2.x - p0.x) / 6) * tension, y: p1.y + ((p2.y - p0.y) / 6) * tension};
    const c2 = {x: p2.x - ((p3.x - p1.x) / 6) * tension, y: p2.y - ((p3.y - p1.y) / 6) * tension};
    d += ` C${f1(c1.x)},${f1(c1.y)} ${f1(c2.x)},${f1(c2.y)} ${f1(p2.x)},${f1(p2.y)}`;
  }
  return d + 'Z';
}

/** Curva abierta que pasa por todos los puntos. */
export function openSpline(pts: Pt[], tension = 1): string {
  const n = pts.length;
  let d = `M${f1(pts[0].x)},${f1(pts[0].y)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    const c1 = {x: p1.x + ((p2.x - p0.x) / 6) * tension, y: p1.y + ((p2.y - p0.y) / 6) * tension};
    const c2 = {x: p2.x - ((p3.x - p1.x) / 6) * tension, y: p2.y - ((p3.y - p1.y) / 6) * tension};
    d += ` C${f1(c1.x)},${f1(c1.y)} ${f1(c2.x)},${f1(c2.y)} ${f1(p2.x)},${f1(p2.y)}`;
  }
  return d;
}

/** Contorno cerrado de una cinta que se afina a lo largo de una polilínea (ancho w(u), u ∈ [0,1]). */
export function ribbon(pts: Pt[], w: (u: number) => number, tension = 0.9): string {
  const n = pts.length;
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    let dx = b.x - a.x;
    let dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    dx /= l;
    dy /= l;
    const ww = w(i / (n - 1)) / 2;
    L.push({x: pts[i].x - dy * ww, y: pts[i].y + dx * ww});
    R.push({x: pts[i].x + dy * ww, y: pts[i].y - dx * ww});
  }
  return closedSpline([...L, ...R.reverse()], tension);
}
