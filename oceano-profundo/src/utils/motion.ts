// MOVIMIENTO ORGÁNICO: trayectorias con inercia (Catmull-Rom en el tiempo, arranque y frenada suaves),
// rumbo con alabeo, y giros con escorzo (el animal «da la vuelta» en lugar de reflejarse de golpe).
import {clamp} from './math';

export type Key = [number, number, number]; // [t, x, y]
export type Motion = {x: number; y: number; vx: number; vy: number; speed: number; heading: number};

const cr = (p0: number, p1: number, p2: number, p3: number, u: number) => 0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
function posAt(keys: Key[], t: number): [number, number] {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  const n = keys.length;
  if (t >= keys[n - 1][0]) return [keys[n - 1][1], keys[n - 1][2]];
  let i = 0;
  while (i < n - 2 && t > keys[i + 1][0]) i++;
  const k0 = keys[Math.max(0, i - 1)];
  const k1 = keys[i];
  const k2 = keys[i + 1];
  const k3 = keys[Math.min(n - 1, i + 2)];
  let u = (t - k1[0]) / (k2[0] - k1[0]);
  // primera y última sección: aceleración/frenada
  if (n === 2) u = u * u * (3 - 2 * u);
  else if (i === 0) u = 0.5 * (u * u) + 0.5 * u * u * (2 - u);
  else if (i === n - 2) u = 0.5 * u * (2 - u) + 0.5 * u * (2 - u) * (1 - (1 - u) * 0);
  return [cr(k0[1], k1[1], k2[1], k3[1], u), cr(k0[2], k1[2], k2[2], k3[2], u)];
}
/** Posición y velocidad a lo largo de una trayectoria de claves temporales. */
export function along(keys: Key[], t: number): Motion {
  const [x, y] = posAt(keys, t);
  const [x2, y2] = posAt(keys, t + 1 / 30);
  const vx = (x2 - x) * 30;
  const vy = (y2 - y) * 30;
  return {x, y, vx, vy, speed: Math.hypot(vx, vy), heading: Math.atan2(vy, vx)};
}
/** Alabeo: inclinación del cuerpo según la componente vertical del rumbo (limitada). */
export const pitchOf = (m: Motion, max = 0.45) => clamp(Math.atan2(m.vy, Math.abs(m.vx) + 1e-3), -max, max);
/** Factor de escala horizontal con signo para giros: dir0 → −dir0 en cada giro [t0, duración]. */
export function turnScale(t: number, dir0: 1 | -1, turns: [number, number][]): number {
  let d = dir0;
  for (const [t0, dur] of turns) {
    if (t < t0) break;
    if (t < t0 + dur) {
      const u = (t - t0) / dur;
      return d * Math.cos(u * Math.PI);
    }
    d = -d as 1 | -1;
  }
  return d;
}
/** Fase acumulada de un ciclo con frecuencia variable f(t) (integración numérica: sin saltos). */
export function phase(t: number, f: (t: number) => number, t0 = 0, dt = 1 / 30): number {
  let p = 0;
  for (let x = t0; x < t; x += dt) p += f(x) * Math.min(dt, t - x) * Math.PI * 2;
  return p;
}
export const pulseAt = (t: number, rate: number) => {
  const u = (t * rate) % 1;
  return u < 0.25 ? u / 0.25 : 1 - (u - 0.25) / 0.75;
};
