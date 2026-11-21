// Cámaras del Ep. 07 (escala macro): planos con objetivo (colonia, protagonista, cabeza,
// agarre, tallo del hongo, esporas), zoom, elevación (negativa = desde debajo de la hoja)
// y transición. Mismo esquema que los Ep. 05–06; este archivo es propio del Ep. 07.
import {Camera} from '../../../engine/camera';
import {clamp, easeInOut, fbm1, lerp, Vec} from '../../../engine/math';
import {makeView, project, V3, View} from '../Animation/proj';

export type TargetName = 'jungle' | 'branchDown' | 'colony' | 'hero' | 'heroHead' | 'leaf2' | 'grip' | 'stalk' | 'ascoma' | 'spores' | 'colonyFinal';
export type Targets = Partial<Record<TargetName, V3 | null>>;

type Shot = {t: number; target: TargetName; zoom: number | [number, number]; pitch: number; yaw?: number; off?: [number, number]; tr?: number; cut?: boolean};

export const SHOTS: Shot[] = [
  {t: 0, target: 'jungle', zoom: [0.16, 0.2], pitch: 0.1},
  {t: 5, target: 'branchDown', zoom: [0.26, 0.9], pitch: 0.3, tr: 2.6},
  {t: 10, target: 'colony', zoom: 2.1, pitch: 0.42, tr: 1.4},
  {t: 15, target: 'hero', zoom: 2.8, pitch: 0.4, tr: 1.2},
  {t: 20, target: 'hero', zoom: 3.2, pitch: 0.62, tr: 1.0, cut: true},
  {t: 22.8, target: 'heroHead', zoom: 6.2, pitch: 0.42, tr: 0.8},
  {t: 26.2, target: 'hero', zoom: 3.0, pitch: 0.55, tr: 0.8},
  {t: 45, target: 'colony', zoom: 2.2, pitch: 0.4, tr: 0.8, cut: true},
  {t: 48.6, target: 'heroHead', zoom: 5.2, pitch: 0.34, tr: 0.8},
  {t: 52.2, target: 'hero', zoom: 3.0, pitch: 0.4, tr: 0.8},
  {t: 65, target: 'hero', zoom: 2.6, pitch: 0.4, tr: 1.0},
  {t: 70, target: 'colony', zoom: 1.6, pitch: 0.45, tr: 1.2},
  {t: 73.6, target: 'hero', zoom: 2.2, pitch: 0.4, tr: 1.2},
  {t: 77, target: 'hero', zoom: 2.6, pitch: 0.08, yaw: 0.3, cut: true},
  {t: 83.6, target: 'hero', zoom: 3.8, pitch: 0.05, yaw: 0.2, tr: 1.0},
  {t: 90, target: 'leaf2', zoom: 1.5, pitch: -0.36, tr: 1.4},
  {t: 95, target: 'hero', zoom: 3.0, pitch: -0.45, tr: 1.0},
  {t: 103, target: 'grip', zoom: 5.0, pitch: -0.3, yaw: 0.4, tr: 1.0},
  {t: 110, target: 'grip', zoom: 7.0, pitch: -0.25, yaw: 0.6, tr: 0.8},
  {t: 116, target: 'hero', zoom: 3.4, pitch: -0.4, tr: 1.4},
  {t: 120.4, target: 'hero', zoom: 2.6, pitch: -0.35, tr: 0.6},
  {t: 128, target: 'hero', zoom: [3.0, 2.4], pitch: -0.3, yaw: 0.3, tr: 1.2},
  {t: 137, target: 'stalk', zoom: [2.2, 2.8], pitch: -0.2, yaw: 0.5, tr: 1.2},
  {t: 145, target: 'ascoma', zoom: 5.0, pitch: -0.15, yaw: 0.6, tr: 1.0},
  {t: 150, target: 'ascoma', zoom: 4.2, pitch: -0.1, yaw: 0.5, tr: 1.0},
  {t: 158, target: 'ascoma', zoom: 3.0, pitch: 0.0, yaw: 0.4, tr: 1.0},
  {t: 165, target: 'spores', zoom: [1.6, 1.0], pitch: 0.15, tr: 1.4},
  {t: 173, target: 'colonyFinal', zoom: 2.0, pitch: 0.42, tr: 1.4},
  {t: 177, target: 'colonyFinal', zoom: [2.0, 1.2], pitch: 0.4, tr: 0.6},
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
    const tg = targets[s.target] ?? targets.hero ?? [0, 0, 0];
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
export const ANCHOR = {x: 0, y: -300};
