import * as THREE from 'three';
import { CameraSafety } from '../../core/camera/cameraSafety';
import { BoulderSpec } from '../../core/environment/Boulders';
import { RockSpec, Seabed } from '../../core/environment/seabed';
import { createRng } from '../../core/math/noise';
import { CrawlMotion } from '../../creatures/octopus/locomotion';
import { OctopusGait } from '../../creatures/octopus/gait';
import { DEMO_SHOTS, octopusSpeed } from './direction';

/**
 * Escenografía del episodio 1: arrecife rocoso templado a ~10 m de profundidad.
 * Todo se genera con semillas fijas: el mismo fotograma siempre se ve igual.
 */
export const SCENE_CENTER: [number, number] = [0.6, 0];

/** Recorrido del pulpo (x, z) en metros. */
export const OCTOPUS_PATH: [number, number][] = [
  [-2.0, -1.3],
  [-1.2, -0.8],
  [-0.4, -0.3],
  [0.4, 0.05],
  [1.2, 0.3],
  [2.0, 0.45],
  [2.8, 0.7],
  [3.6, 1.1],
];

const pathCurve = new THREE.CatmullRomCurve3(
  OCTOPUS_PATH.map(([x, z]) => new THREE.Vector3(x, 0, z)),
  false,
  'centripetal',
);
const pathLength = pathCurve.getLength();
const PATH_SAMPLES = Array.from({ length: 200 }, (_, i) => pathCurve.getPointAt(i / 199));

export const distanceToPath = (x: number, z: number) => {
  let best = Infinity;
  for (const p of PATH_SAMPLES) {
    const d = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z);
    if (d < best) best = d;
  }
  return Math.sqrt(best);
};

const pointAtDistance = (s: number) => pathCurve.getPointAt(Math.min(1, s / pathLength));

const buildRocks = (): RockSpec[] => {
  const rocks: RockSpec[] = [];
  // Roca protagonista: el pulpo la escala, se detiene en la cima y se camufla.
  const hero = pointAtDistance(1.95);
  rocks.push({ x: hero.x, z: hero.z, rx: 0.62, rz: 0.48, h: 0.28, rot: 0.4, seed: 101 });
  // Piedra pequeña al inicio del recorrido.
  const small = pointAtDistance(0.55);
  rocks.push({ x: small.x + 0.12, z: small.z - 0.05, rx: 0.26, rz: 0.2, h: 0.07, rot: 1.1, seed: 202 });
  // Rocas que acompañan el camino (fuera de la trayectoria).
  const rng = createRng(77);
  let guard = 0;
  while (rocks.length < 34 && guard++ < 2000) {
    const a = rng.next() * Math.PI * 2;
    const r = 0.8 + Math.sqrt(rng.next()) * 5.5;
    const x = SCENE_CENTER[0] + Math.cos(a) * r;
    const z = SCENE_CENTER[1] + Math.sin(a) * r;
    const size = rng.range(0.2, 0.9) * (r > 3 ? 1.6 : 1);
    if (distanceToPath(x, z) < size + 0.45) continue;
    rocks.push({
      x,
      z,
      rx: size,
      rz: size * rng.range(0.6, 1),
      h: size * rng.range(0.35, 0.8),
      rot: rng.next() * Math.PI,
      seed: 300 + rocks.length,
    });
  }
  return rocks;
};

const buildBoulders = (): BoulderSpec[] => {
  const rng = createRng(909);
  const list: BoulderSpec[] = [];
  let guard = 0;
  while (list.length < 22 && guard++ < 2000) {
    const a = rng.next() * Math.PI * 2;
    const r = rng.range(3.2, 10);
    const x = SCENE_CENTER[0] + Math.cos(a) * r;
    const z = SCENE_CENTER[1] + Math.sin(a) * r;
    if (distanceToPath(x, z) < 2.4) continue;
    const s = rng.range(0.5, 1.8) * (r / 6 + 0.5);
    list.push({
      x,
      z,
      scale: [s * rng.range(0.9, 1.5), s * rng.range(0.55, 1.0), s * rng.range(0.9, 1.3)],
      rotY: rng.next() * Math.PI * 2,
      variant: list.length,
    });
  }
  return list;
};

export const seabed = new Seabed({ rocks: buildRocks(), duneAmp: 0.12, rippleAmp: 0.006 });

export const GAIT_FREQUENCY = 0.85;

export const octopusMotion = new CrawlMotion({
  seabed,
  path: OCTOPUS_PATH,
  speed: octopusSpeed,
  duration: 200,
  gaitFrequency: GAIT_FREQUENCY,
});

export const octopusGait = new OctopusGait(octopusMotion, seabed, {
  frequency: GAIT_FREQUENCY,
  duty: 0.64,
  stepHeight: 0.11,
});

/** Recorrido de cámara de la demo: la decoración se aparta de él automáticamente. */
export const cameraSafety = new CameraSafety(DEMO_SHOTS, octopusMotion, seabed, 15.1);

export const boulders = buildBoulders().filter((b) => {
  const r = Math.max(...b.scale) * 1.35;
  return cameraSafety.sphereClear(new THREE.Vector3(b.x, seabed.height(b.x, b.z) + b.scale[1] * 0.4, b.z), r + 0.25);
});

export const vegetationExclude = (x: number, z: number, margin: number) =>
  distanceToPath(x, z) < margin || !cameraSafety.columnClear(x, z, margin > 0.5 ? 0.6 : 0.12);

export const SUN_DIR: [number, number, number] = [0.35, 1, 0.25];

export const WATER_LOOK = {
  fogColor: '#0b3d58',
  fogDensity: 0.11,
  surfaceColor: '#4fb4d8',
  deepColor: '#041c26',
  exposure: 1.05,
};
