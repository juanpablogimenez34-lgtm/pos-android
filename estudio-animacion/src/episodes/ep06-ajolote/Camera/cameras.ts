// Cámaras del Ep. 06: lista de planos con objetivo (ajolote, branquias, pata LF, superficie),
// zoom, elevación de la vista y transición. La cámara acompaña la acción.
// (Mismo esquema que el Ep. 05; este archivo es propio del Ep. 06.)
import {Camera} from '../../../engine/camera';
import {clamp, easeInOut, fbm1, lerp, Vec} from '../../../engine/math';
import {makeView, project, V3, View} from '../Animation/proj';

export type TargetName = 'canal' | 'descend' | 'wild' | 'wildPink' | 'pink' | 'pinkHead' | 'pinkGills' | 'pinkLF' | 'feed' | 'surfaceView';
export type Targets = Partial<Record<TargetName, V3 | null>>;

type Shot = {t: number; target: TargetName; zoom: number | [number, number]; pitch: number; yaw?: number; off?: [number, number]; tr?: number; cut?: boolean};

export const SHOTS: Shot[] = [
  {t: 0, target: 'canal', zoom: [0.2, 0.22], pitch: 0.12},
  {t: 4.6, target: 'descend', zoom: [0.22, 0.42], pitch: 0.14, tr: 3.2},
  {t: 9.6, target: 'wild', zoom: 1.1, pitch: 0.26, tr: 1.8},
  {t: 15.0, target: 'wildPink', zoom: 0.62, pitch: 0.22, tr: 1.4},
  {t: 17.6, target: 'pinkHead', zoom: 1.6, pitch: 0.28, tr: 1.8},
  {t: 20.0, target: 'pinkHead', zoom: 2.7, pitch: 0.3, tr: 1.4},
  {t: 27.0, target: 'pinkGills', zoom: 3.8, pitch: 0.42, tr: 1.2},
  {t: 34.0, target: 'pink', zoom: 1.45, pitch: 0.36, tr: 1.4},
  {t: 40.0, target: 'pink', zoom: 1.0, pitch: 0.18, tr: 1.0},
  {t: 45.6, target: 'pink', zoom: 1.6, pitch: 0.38, tr: 1.0},
  {t: 48.0, target: 'feed', zoom: 3.4, pitch: 0.3, tr: 1.2},
  {t: 51.6, target: 'pink', zoom: 1.35, pitch: 0.34, tr: 1.2},
  {t: 58.6, target: 'pink', zoom: 1.6, pitch: 0.62, tr: 1.2},
  {t: 62.0, target: 'pinkLF', zoom: 3.0, pitch: 1.0, tr: 1.6},
  {t: 70.0, target: 'pinkLF', zoom: 3.0, pitch: 1.0, off: [0, 380], tr: 1.0},
  {t: 95.0, target: 'pinkLF', zoom: [3.0, 3.3], pitch: 1.0, off: [0, 380], tr: 1.0},
  {t: 120.0, target: 'pinkLF', zoom: 5.2, pitch: 1.0, tr: 1.2},
  {t: 145.0, target: 'pink', zoom: 1.3, pitch: 0.45, tr: 1.4},
  {t: 150.0, target: 'pink', zoom: 1.5, pitch: 0.4, tr: 1.0},
  {t: 158.0, target: 'pink', zoom: 1.0, pitch: 0.22, tr: 1.2},
  {t: 165.0, target: 'surfaceView', zoom: 0.3, pitch: 0.14, tr: 2.4},
  {t: 172.4, target: 'wild', zoom: 1.3, pitch: 0.3, tr: 1.8},
  {t: 176.6, target: 'wild', zoom: [1.3, 0.95], pitch: 0.28, tr: 0.6},
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
    const tg = targets[s.target] ?? targets.pink ?? [0, 0, 0];
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
export const ANCHOR = {x: 0, y: -2600}; // la superficie del agua: los planos lejanos se alinean con ella
