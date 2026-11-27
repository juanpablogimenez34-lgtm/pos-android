// MOTOR DE CÁMARAS — cámara 2.5D con paralaje multicapa para cualquier tamaño de cuadro.
//  (x, y) = punto del mundo en el centro del cuadro; zoom = dolly; roll = giro; focus = plano enfocado (profundidad d).
//  Capas: d < 1 lejos (se mueven y escalan menos), d = 1 plano de los animales, d > 1 primer plano.
import {clamp, lerp} from '../utils/math';

export type Cam = {x: number; y: number; zoom: number; roll: number; focus?: number};
export type VP = {w: number; h: number};
export const cam = (x: number, y: number, zoom: number, roll = 0, focus = 1): Cam => ({x, y, zoom, roll, focus});

export const layerT = (c: Cam, vp: VP, d = 1) => {
  const z = Math.pow(c.zoom, d);
  return `translate(${vp.w / 2} ${vp.h / 2}) rotate(${((c.roll * d * 180) / Math.PI).toFixed(3)}) scale(${z.toFixed(4)}) translate(${(-c.x * d).toFixed(1)} ${(-c.y * d).toFixed(1)})`;
};
export const toScreen = (c: Cam, vp: VP, x: number, y: number, d = 1) => {
  const z = Math.pow(c.zoom, d);
  const dx = (x - c.x * d) * z;
  const dy = (y - c.y * d) * z;
  const co = Math.cos(c.roll * d);
  const s = Math.sin(c.roll * d);
  return {x: vp.w / 2 + dx * co - dy * s, y: vp.h / 2 + dx * s + dy * co};
};
/** Rectángulo visible del mundo en el plano d (para descartar lo que queda fuera de cámara). */
export const visible = (c: Cam, vp: VP, d = 1, pad = 200) => {
  const z = Math.pow(c.zoom, d);
  const hw = vp.w / 2 / z + pad;
  const hh = vp.h / 2 / z + pad;
  return {x0: c.x * d - hw, x1: c.x * d + hw, y0: c.y * d - hh, y1: c.y * d + hh};
};

export const ease = {
  linear: (u: number) => u,
  inOut: (u: number) => u * u * (3 - 2 * u),
  out: (u: number) => 1 - Math.pow(1 - u, 3),
  in: (u: number) => u * u * u,
  cine: (u: number) => u * u * u * (u * (u * 6 - 15) + 10),
};
export type Ease = keyof typeof ease;

/** Tramo entre dos encuadres (zoom interpolado en escala logarítmica: dolly natural). */
export function shot(t: number, a: number, b: number, from: Cam, to: Cam, curve: Ease = 'cine'): Cam {
  const u = ease[curve](clamp((t - a) / (b - a)));
  return {x: lerp(from.x, to.x, u), y: lerp(from.y, to.y, u), zoom: Math.exp(lerp(Math.log(from.zoom), Math.log(to.zoom), u)), roll: lerp(from.roll, to.roll, u), focus: lerp(from.focus ?? 1, to.focus ?? 1, u)};
}
/** Secuencia de encuadres clave [t, cam]; se encadenan con la curva indicada. */
export function track(t: number, keys: [number, Cam][], curve: Ease = 'cine'): Cam {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) if (t <= keys[i + 1][0]) return shot(t, keys[i][0], keys[i + 1][0], keys[i][1], keys[i + 1][1], curve);
  return keys[keys.length - 1][1];
}
/** Cámara en mano muy leve (deriva orgánica, nunca temblor). */
export const breathe = (c: Cam, t: number, k = 1): Cam => ({...c, x: c.x + Math.sin(t * 0.37) * 7 * k, y: c.y + Math.sin(t * 0.29 + 1) * 5 * k, roll: c.roll + Math.sin(t * 0.21) * 0.004 * k});
/** Seguimiento de un objetivo con retraso (encuadre por delante del animal, en su dirección de marcha). */
export const follow = (target: {x: number; y: number}, vel: {x: number; y: number}, zoom: number, lead = 0.6, roll = 0): Cam => cam(target.x + vel.x * lead, target.y + vel.y * lead, zoom, roll);
/** Pulso breve de cámara (impacto, motivado). */
export function jolt(c: Cam, t: number, at: number, amp = 1, dur = 0.5): Cam {
  const u = (t - at) / dur;
  if (u < 0 || u > 1) return c;
  const d = (1 - u) * amp;
  return {...c, x: c.x + (Math.sin(t * 70) * 5 * d) / c.zoom, y: c.y + (Math.cos(t * 61) * 4 * d) / c.zoom};
}
