// CÁMARA 2D con parallax multicapa. (x, y) = punto del mundo en el centro de la imagen.
// Las capas lejanas (profundidad < 1) se desplazan y escalan menos; las cercanas (> 1), más.
import {clamp, easeInOut, lerp} from '../../../engine/math';

export type Cam = {x: number; y: number; zoom: number; roll: number};
export const W = 1080;
export const H = 1920;

export const layerT = (c: Cam, d = 1) => {
  const z = Math.pow(c.zoom, d);
  return `translate(${W / 2} ${H / 2}) rotate(${((c.roll * d * 180) / Math.PI).toFixed(3)}) scale(${z.toFixed(4)}) translate(${(-c.x * d).toFixed(1)} ${(-c.y * d).toFixed(1)})`;
};

/** Claves [t, x, y, zoom, roll?] con interpolación suave. */
export type CamKey = [number, number, number, number, number?];
export function camAt(keys: CamKey[], t: number): Cam {
  if (t <= keys[0][0]) return {x: keys[0][1], y: keys[0][2], zoom: keys[0][3], roll: keys[0][4] ?? 0};
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t <= b[0]) {
      const u = easeInOut(clamp((t - a[0]) / (b[0] - a[0])));
      return {x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), zoom: Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u)), roll: lerp(a[4] ?? 0, b[4] ?? 0, u)};
    }
  }
  const l = keys[keys.length - 1];
  return {x: l[1], y: l[2], zoom: l[3], roll: l[4] ?? 0};
}

/** Seguimiento suave de un sujeto (con adelanto en la dirección del movimiento). */
export const follow = (x: number, y: number, zoom: number, lead = 0): Cam => ({x: x + lead, y, zoom, roll: 0});
