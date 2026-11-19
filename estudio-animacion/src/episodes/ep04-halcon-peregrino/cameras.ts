// Cámaras del Ep. 04: mezcla de planos fijos, seguimiento del halcón, seguimiento de
// la cabeza (primeros planos) y encuadre conjunto halcón–paloma.
import {Camera} from '../../engine/camera';
import {clamp, fbm1, lerp, Vec} from '../../engine/math';
import {keys, KeyTuple, track} from '../../engine/timeline';

const k = (l: KeyTuple[]) => keys(l);

const EX = k([[0, 300], [5, 450], [10, 0], [20, 0, 'stop'], [20.01, -240, 'stop'], [34, -250], [40, -230], [80.2, 3200], [81.6, 3420], [83.2, 3420], [180, 7000]]);
const EY = k([[0, -1120], [5, -1250], [10, -1250], [20, -1200, 'stop'], [20.01, -80, 'stop'], [34, -130], [40, -120], [80.2, -1800], [81.6, 1340], [83.2, 1340], [173, 160], [180, 160]]);
/** 0 plano fijo · 1 seguimiento */
const FOLLOW = k([[0, 0], [8.5, 0], [11.5, 1], [19.99, 1, 'stop'], [20, 0, 'stop'], [39.6, 0], [41.2, 1], [80.2, 1], [80.9, 0], [83.4, 0], [84.6, 1], [173, 1], [176, 0.6], [180, 0.4]]);
/** seguimiento de la cabeza (primeros planos) */
const HEAD = k([[0, 0], [14.6, 0], [15.8, 1], [19.99, 1, 'stop'], [20, 0, 'stop'], [26.8, 0], [27.8, 1], [33.4, 1], [34.4, 0], [76.8, 0], [77.6, 1], [79.8, 1], [80.4, 0], [113.6, 0], [114.4, 0.6], [119.6, 0.6], [120.4, 0], [180, 0]]);
/** encuadre conjunto halcón + paloma */
const MID = k([[0, 0], [119.6, 0], [121, 0.75], [136.5, 0.6], [138.2, 0.5], [140.5, 0], [180, 0]]);
const OX = k([[0, 0], [41, 100], [45, 120], [65, 100], [70, 0], [95, 60], [104, 150], [114, 120], [120, 0], [150, 0], [158, 150], [173, 120], [180, 0]]);
const OY = k([[0, 0], [41, 0], [70, 0], [72, 160], [84, 120], [95, 200], [104, 260], [114, 220], [120, 0], [150, 0], [158, -40], [180, 0]]);
const ZOOM = k([
  [0, 0.42], [5, 0.46], [9, 0.6], [11.5, 1.25], [13.6, 1.6], [15.8, 6.5], [19.99, 7.5, 'stop'],
  [20, 2.0, 'stop'], [26.8, 2.3], [27.8, 5.6], [31, 6.2], [33.4, 5.2], [34.6, 1.9], [39.6, 1.7], [42, 1.35], [45, 1.5], [51.5, 1.6], [65, 1.5], [70, 1.2],
  [72.5, 1.05], [76.8, 1.15], [77.8, 4.2], [79.8, 4.6], [80.6, 1.4], [81.6, 1.6], [83.2, 1.6], [84.6, 1.3], [90, 1.5], [95, 1.25],
  [102, 2.0], [107, 2.0], [109, 0.9], [113.6, 0.95], [114.6, 2.6], [119.6, 2.6], [121, 0.95], [128, 1.2], [136.5, 1.5], [139, 1.6], [141, 1.2], [145, 1.45], [150, 1.35],
  [158, 1.25], [165, 1.8], [171, 1.7], [173, 1.2], [180, 0.55],
]);

export function cameraFor(t: number, falcon: Vec, head: Vec, pigeon: Vec | null): Camera {
  // los pesos se limitan a [0, 1]: la interpolación Hermite puede pasarse en las mesetas
  const follow = clamp(track(FOLLOW, t));
  const headK = clamp(track(HEAD, t));
  const midK = pigeon ? clamp(track(MID, t)) : 0;
  const target = {x: lerp(falcon.x, (falcon.x + (pigeon?.x ?? falcon.x)) / 2, midK), y: lerp(falcon.y, (falcon.y + (pigeon?.y ?? falcon.y)) / 2, midK)};
  const tx = lerp(target.x + track(OX, t), head.x, headK);
  const ty = lerp(target.y + track(OY, t), head.y, headK);
  const x = lerp(track(EX, t), tx, Math.max(follow, headK));
  const y = lerp(track(EY, t), ty, Math.max(follow, headK));
  const z = track(ZOOM, t);
  // ligera deriva de cámara aérea (determinista)
  return {x: x + fbm1(t * 0.15, 11) * 10 / z, y: y + fbm1(t * 0.15, 23) * 8 / z, zoom: z, roll: fbm1(t * 0.1, 41) * 0.006};
}
export const ANCHOR = {x: 0, y: 0};
