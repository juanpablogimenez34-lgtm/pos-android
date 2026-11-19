// Cámaras del Ep. 05: lista de planos con objetivo (personaje o parte de la planta), zoom,
// elevación (pitch) y guiñada de la vista. Entre planos se mezcla suavemente (o se corta).
// La cámara sigue la acción: cada plano apunta a lo que ocurre en ese momento.
import {Camera} from '../../engine/camera';
import {clamp, easeInOut, fbm1, lerp, Vec} from '../../engine/math';
import {makeView, project, V3, View} from './anatomy/proj';

export type TargetName = 'O' | 'spider' | 'T1C' | 'T1rim' | 'hairs' | 'fly' | 'flyPlant' | 'flyT1' | 'flyHair' | 'soil' | 'T1T2' | 'T1base' | 'high';
export type Targets = Partial<Record<TargetName, V3 | null>>;

type Shot = {t: number; target: TargetName; zoom: number | [number, number]; pitch: number; yaw?: number; off?: [number, number]; tr?: number; cut?: boolean};

export const SHOTS: Shot[] = [
  {t: 0, target: 'O', zoom: [0.13, 0.15], pitch: 0.2, off: [0, 330]},
  {t: 4, target: 'O', zoom: [0.16, 0.6], pitch: 0.32, off: [0, 160], tr: 1.0},
  {t: 8, target: 'spider', zoom: 4.0, pitch: 0.55, tr: 1.3},
  {t: 12, target: 'T1C', zoom: [1.0, 1.7], pitch: 0.42, tr: 1.4},
  {t: 16, target: 'T1rim', zoom: 4.6, pitch: 0.48, tr: 1.0},
  {t: 20, target: 'flyPlant', zoom: 1.0, pitch: 0.35, tr: 1.0},
  {t: 25, target: 'fly', zoom: 2.3, pitch: 0.3, tr: 1.2},
  {t: 29, target: 'fly', zoom: 3.4, pitch: 0.34, tr: 1.0},
  {t: 34.6, target: 'fly', zoom: 5.6, pitch: 0.3, tr: 0.9},
  {t: 40, target: 'flyT1', zoom: 1.8, pitch: 0.45, tr: 1.2},
  {t: 45.4, target: 'T1C', zoom: 3.0, pitch: 0.95, tr: 1.4},
  {t: 51.6, target: 'hairs', zoom: 5.0, pitch: 1.0, tr: 1.0},
  {t: 57.8, target: 'flyHair', zoom: 3.8, pitch: 0.95, tr: 1.0},
  {t: 64, target: 'T1C', zoom: 2.5, pitch: 0.9, off: [0, -330], tr: 0.8},
  {t: 70, target: 'fly', zoom: 3.6, pitch: 0.9, tr: 1.0},
  {t: 79.05, target: 'T1C', zoom: 2.9, pitch: 0.72, tr: 0.35},
  {t: 81, target: 'T1C', zoom: 3.6, pitch: 0.55, yaw: 0.5, cut: true},
  {t: 86, target: 'T1C', zoom: 3.6, pitch: 0.85, yaw: -0.1, cut: true},
  {t: 93.4, target: 'T1C', zoom: 3.4, pitch: 0.36, yaw: -0.1, tr: 1.6},
  {t: 96, target: 'T1C', zoom: [3.4, 4.3], pitch: 0.36, yaw: -0.1, tr: 1.2},
  {t: 110, target: 'T1C', zoom: 2.4, pitch: 0.42, tr: 0.5},
  {t: 116.4, target: 'T1C', zoom: [2.6, 3.1], pitch: 0.95, tr: 0.8},
  {t: 120.6, target: 'soil', zoom: 0.8, pitch: 0.08, tr: 1.6},
  {t: 128, target: 'soil', zoom: 0.95, pitch: 0.08, tr: 1.2},
  {t: 137, target: 'T1base', zoom: 1.1, pitch: 0.32, tr: 1.6},
  {t: 145, target: 'O', zoom: 0.85, pitch: 0.42, off: [0, 120], tr: 1.4},
  {t: 150, target: 'O', zoom: [0.78, 0.7], pitch: 0.45, off: [0, 120], tr: 1.0},
  {t: 157.6, target: 'T1T2', zoom: 1.25, pitch: 0.5, tr: 1.4},
  {t: 165, target: 'high', zoom: 0.8, pitch: 0.36, tr: 1.4},
  {t: 173, target: 'O', zoom: [0.8, 0.14], pitch: 0.24, off: [0, 300], tr: 1.0},
];

const shotIndex = (t: number) => {
  let i = 0;
  while (i < SHOTS.length - 1 && t >= SHOTS[i + 1].t) i++;
  return i;
};

const zoomOf = (s: Shot, t: number) => {
  if (typeof s.zoom === 'number') return s.zoom;
  const i = SHOTS.indexOf(s);
  const end = i < SHOTS.length - 1 ? SHOTS[i + 1].t : 180;
  return lerp(s.zoom[0], s.zoom[1], easeInOut(clamp((t - s.t) / (end - s.t))));
};

/** Mezcla del plano actual con el anterior (0 = anterior, 1 = actual). */
function blendK(t: number) {
  const i = shotIndex(t);
  const s = SHOTS[i];
  if (i === 0 || s.cut) return {i, k: 1};
  return {i, k: easeInOut(clamp((t - s.t) / (s.tr ?? 1)))};
}

/** Vista (pitch/yaw) en el instante t. */
export function viewAt(t: number): View {
  const {i, k} = blendK(t);
  const s = SHOTS[i];
  const p = i > 0 ? SHOTS[i - 1] : s;
  return makeView(lerp(p.yaw ?? 0, s.yaw ?? 0, k), lerp(p.pitch, s.pitch, k));
}

/** Cámara en el instante t. `targets` se evalúan con la vista mezclada. */
export function cameraAt(t: number, view: View, targets: Targets): Camera {
  const {i, k} = blendK(t);
  const one = (s: Shot): {x: number; y: number; z: number} => {
    const tg = targets[s.target] ?? targets.O ?? [0, 0, 0];
    const q: Vec = project(view, tg as V3);
    const z = zoomOf(s, t);
    const off = s.off ?? [0, 0];
    return {x: q.x - off[0] / z, y: q.y - off[1] / z, z};
  };
  const a = one(SHOTS[i]);
  const b = i > 0 && k < 1 ? one(SHOTS[i - 1]) : a;
  // el zoom se mezcla en escala logarítmica (acercamientos naturales)
  const z = Math.exp(lerp(Math.log(b.z), Math.log(a.z), k));
  const x = lerp(b.x, a.x, k);
  const y = lerp(b.y, a.y, k);
  // ligera respiración de cámara en mano (determinista)
  return {x: x + (fbm1(t * 0.2, 5) * 6) / z, y: y + (fbm1(t * 0.2, 9) * 5) / z, zoom: z, roll: fbm1(t * 0.12, 13) * 0.004};
}
export const ANCHOR = {x: 0, y: 0};
