// La colonia: 5 obreras sobre la rama, cada una con su ruta, velocidad, pausas, lado de la
// corteza y ritmo de antenas. Algunas van y otras vuelven; se cruzan y se tocan con las antenas.
// Misma anatomía que la protagonista (ficha COLONY), animaciones independientes.
import {hash1} from '../../../engine/math';
import {pulse} from '../../../engine/timeline';
import {AntPose} from '../Characters/Ant';
import {AntSpec, COLONY} from '../Characters/antSpec';
import {BRANCH} from '../Environments/surfaces';
import {DEFAULT_OPTS, walkPose} from '../Animation/antMotion';
import {makeWalk, WalkKey, WalkPath} from '../Animation/locomotion';

/** Planos grupales: ventana de tiempo, centro del sendero (x) y sentido dominante. */
const WINDOWS = [
  {t0: 8.0, t1: 21.5, x: -1900, dir: 1},
  {t0: 43.5, t1: 53.5, x: -1350, dir: 1},
  {t0: 63.5, t1: 78.5, x: -500, dir: -1},
  {t0: 170.5, t1: 180, x: -700, dir: 1},
];

/** Ruta determinista de una obrera en una ventana: tramos de marcha con paradas cortas. */
function route(i: number, w: number): {keys: WalkKey[]; dir: 1 | -1} {
  const W0 = WINDOWS[w];
  const dir: 1 | -1 = (i === 1 || i === 3 ? -W0.dir : W0.dir) as 1 | -1; // algunas van y otras vuelven
  const speed = 90 + hash1(i * 3.1 + w) * 50; // u/s (≈ 1 cm/s)
  const b = [-70, 40, -20, 75, 0][i] + (hash1(i * 5.3 + w) - 0.5) * 30;
  let x = W0.x + (i - 2) * 230 - dir * 520 + (hash1(i * 7.7 + w) - 0.5) * 160;
  let t = W0.t0;
  const keys: WalkKey[] = [[t, x, b]];
  let k = 0;
  while (t < W0.t1) {
    const run = 1.8 + hash1(i * 11 + k + w * 5) * 2.6;
    t += run;
    x += dir * speed * run;
    const bb = b + (hash1(i * 13 + k + w) - 0.5) * 44;
    keys.push([t, x, bb]);
    t += 0.3 + hash1(i * 17 + k + w) * 1.0;
    keys.push([t, x, bb]);
    k++;
  }
  return {keys, dir};
}

type Worker = {spec: AntSpec; walks: {walk: WalkPath; dir: 1 | -1}[]};
const WORKERS: Worker[] = COLONY.map((spec, i) => ({spec, walks: WINDOWS.map((_, w) => {
  const r = route(i, w);
  return {walk: makeWalk(r.keys), dir: r.dir};
})}));
const MEET = [12.6, 15.8, 47.5, 69.0, 175.5];

/** Las obreras están visibles en los planos grupales; en otros momentos no se dibujan. */
export const colonyVisible = (t: number) => WINDOWS.some((w) => t > w.t0 + 0.3 && t < w.t1 - 0.3);

export function colonyPoses(t: number): {spec: AntSpec; pose: AntPose}[] {
  return WORKERS.map((w, i) => {
    let wi = 0;
    WINDOWS.forEach((W0, j) => {
      if (t >= W0.t0) wi = j;
    });
    const r = w.walks[wi];
    const pose = walkPose(w.spec, BRANCH, r.walk, t, {
      ...DEFAULT_OPTS,
      fallback: r.dir === 1 ? 0 : Math.PI,
      scan: MEET.reduce((a, m) => a + pulse(t, m + i * 0.35, m + i * 0.35 + 1.2, 0.3), 0),
      mandible: 0.1 + 0.3 * Math.max(0, Math.sin(t * 2.3 + i)),
      seed: w.spec.seed,
    });
    pose.t = t;
    return {spec: w.spec, pose};
  });
}
