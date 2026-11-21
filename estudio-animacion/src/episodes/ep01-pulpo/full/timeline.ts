// EPISODIO 01 COMPLETO — línea de tiempo maestra (180 s = 5.400 fotogramas a 30 fps).
// Todo en segundos GLOBALES. Los cortes de plano se escriben como dos claves
// separadas 1 ms con `stop`: la transición CutWipe tapa ese instante.

import {CameraTrack} from '../../../engine/camera';
import {clamp, lerp, smoothstep, Vec} from '../../../engine/math';
import {keys, KeyTuple, pulse, track} from '../../../engine/timeline';
import {Gaze, MotionSample} from '../../../creatures/octopus/pose';
import {StateParams, stateAt, StateKey} from '../../../creatures/octopus/states';
import {groundY} from '../../../environments/underwater/sets/CaveReefSet';
import {CREVICE, InkBurst} from '../../../environments/underwater/Props';

export const FPS = 30;
export const DURATION = 180;
export const CUTS = [45, 120, 127, 150];

export const SCENES = [
  {n: 1, start: 0, end: 20, title: 'EL MISTERIO'},
  {n: 2, start: 20, end: 45, title: 'EL SECRETO DE SUS TRES CORAZONES'},
  {n: 3, start: 45, end: 70, title: 'EL PRECIO DE NADAR'},
  {n: 4, start: 70, end: 95, title: 'EL MAESTRO DEL CAMUFLAJE'},
  {n: 5, start: 95, end: 120, title: 'EL DEPREDADOR'},
  {n: 6, start: 120, end: 150, title: 'OCHO BRAZOS EXTRAORDINARIOS'},
  {n: 7, start: 150, end: 180, title: 'LA REVELACIÓN FINAL'},
];

export const sceneAt = (t: number) => SCENES.find((s) => t >= s.start && t < s.end) ?? SCENES[SCENES.length - 1];

// ----------------------------------------------------------------- PULPO
const X = keys([
  // 1 · sale de la cueva
  [0, 772], [3, 782], [6, 798], [8, 812], [10, 832], [12.5, 950], [15, 1080], [17, 1190], [18.6, 1238, 'stop'], [20, 1240],
  // 2 · primer plano y anatomía (casi inmóvil)
  [32, 1243], [44.999, 1244, 'stop'],
  // 3 · camina, se recoge, nada y aterriza junto a las rocas
  [45, 1440, 'stop'], [47, 1530], [50, 1670], [51.8, 1730, 'stop'], [57.8, 1748, 'stop'],
  [59.5, 1840], [61.5, 2040], [63.5, 2240], [65.5, 2380], [67.5, 2450], [69.5, 2470, 'stop'],
  // 4 · camuflaje
  [95, 2474, 'stop'],
  // 5 · amenaza y huida
  [109.2, 2476, 'stop'], [110.5, 2560], [112.5, 2760], [114.5, 2960], [116.5, 3150], [119.999, 3420, 'stop'],
  // 6 · concha (el plano macro 120–127 no muestra el cuerpo)
  [120, 1880, 'stop'], [149.999, 1890, 'stop'],
  // 7 · regreso al refugio
  [150, 1400, 'stop'], [152, 1320], [155, 1140], [157.6, 1010, 'stop'], [165, 1008, 'stop'], [168, 950], [171, 890], [173, 868, 'stop'], [180, 866],
] as KeyTuple[]);

const LIFT = keys([
  [0, 0], [58, 0, 'stop'], [59.5, 90], [61.5, 220], [63.5, 240], [65.5, 150], [67.5, 40], [69.3, 0, 'stop'],
  [109.2, 0, 'stop'], [110.5, 120], [112.5, 260], [114.5, 320], [116.5, 360], [119.999, 420, 'stop'], [120, 0, 'stop'], [180, 0],
] as KeyTuple[]);

const ROT = keys([
  [0, 0], [57.9, 0, 'stop'], [59, 0.42], [63, 0.38], [65.5, 0.15], [67.5, 0, 'stop'],
  [109.1, 0, 'stop'], [110, 0.55], [116, 0.45], [119.999, 0.45, 'stop'], [120, 0, 'stop'], [180, 0],
] as KeyTuple[]);

const FACING = keys([
  [0, 1], [18.4, 1, 'stop'], [20, 0.4], [24.5, 0.1], [27, 0, 'stop'], [44.999, 0, 'stop'],
  [45, 1, 'stop'], [54.5, 1, 'stop'], [56.8, -1, 'stop'], [66.5, -1, 'stop'], [69, 1, 'stop'],
  [108.6, 1, 'stop'], [109.2, -1, 'stop'], [119.999, -1, 'stop'],
  [120, 1, 'stop'], [140, 1, 'stop'], [143, 0.5, 'stop'], [149.999, 0.5, 'stop'],
  [150, -1, 'stop'], [158, -1, 'stop'], [159.5, -0.15, 'stop'], [164.5, -0.15, 'stop'], [166.5, -0.7, 'stop'], [180, -0.7],
] as KeyTuple[]);

export const STATES: StateKey[] = [
  {t: 0, state: 'HIDING'},
  {t: 4.6, state: 'EXPLORING', blend: 1.2},
  {t: 10, state: 'CRAWLING', blend: 1.0},
  {t: 18.2, state: 'RESTING', blend: 1.0},
  {t: 45, state: 'CRAWLING', blend: 0.01},
  {t: 51.6, state: 'RESTING', blend: 0.8},
  {t: 58, state: 'SWIMMING', blend: 0.5},
  {t: 65.6, state: 'EXPLORING', blend: 1.2},
  {t: 69, state: 'RESTING', blend: 1.0},
  {t: 76, state: 'CAMOUFLAGING', blend: 13},
  {t: 101.6, state: 'THREATENED', blend: 0.7},
  {t: 109.1, state: 'INK_ESCAPE', blend: 0.3},
  {t: 120, state: 'EXPLORING', blend: 0.01},
  {t: 141, state: 'RESTING', blend: 1.5},
  {t: 150, state: 'CRAWLING', blend: 0.01},
  {t: 157.4, state: 'RESTING', blend: 0.9},
  {t: 165.4, state: 'CAMOUFLAGING', blend: 4},
  {t: 170, state: 'HIDING', blend: 2.5},
];

/** Parámetros de estado + ajustes finos por momento narrativo. */
export function octoState(t: number): StateParams {
  const p = {...stateAt(STATES, t)};
  // 1 · se presenta (alerta, ojos abiertos)
  const present = smoothstep(14.5, 16, t) * (1 - smoothstep(19.5, 21, t));
  p.alert = lerp(p.alert, 0.55, present);
  p.eyeOpen = lerp(p.eyeOpen, 0.95, present);
  // 2 · anatomía: brazos más tranquilos para no distraer
  const calm = smoothstep(25, 28, t) * (1 - smoothstep(44.5, 45, t));
  p.armAmp *= 1 - 0.55 * calm;
  // 3 · se recoge antes de nadar
  const gather = smoothstep(53.2, 56, t) * (1 - smoothstep(57.8, 58.4, t));
  p.spread = lerp(p.spread, 0.45, gather);
  p.reach = lerp(p.reach, 0.6, gather);
  p.curl = lerp(p.curl, 1.3, gather);
  p.alert = lerp(p.alert, 0.6, gather);
  // 4 · cambio de patrón visible (más contraste a mitad del cambio)
  const texture = smoothstep(83.5, 89, t) * (1 - smoothstep(101.6, 102.4, t));
  p.papillae = Math.max(p.papillae, texture);
  p.pattern = Math.max(p.pattern, texture);
  // 7 · primer plano del ojo: la pupila reacciona
  const eye = smoothstep(158.5, 159.5, t) * (1 - smoothstep(164.5, 165.5, t));
  p.eyeOpen = lerp(p.eyeOpen, 0.97, eye);
  p.pupil = lerp(p.pupil, 0.35 + 0.6 * smoothstep(160.6, 161.8, t), eye);
  p.alert = lerp(p.alert, 0.4, eye);
  // 7 · desaparece: el camuflaje se mantiene aunque pase a HIDING
  const vanish = smoothstep(165.4, 171.5, t);
  p.camo = Math.max(p.camo, vanish);
  p.papillae = Math.max(p.papillae, vanish);
  p.pattern = Math.max(p.pattern, vanish * 0.9);
  return p;
}

/** Nubes oscuras que recorren el manto durante el cambio de color. */
export const octoClouds = (t: number) => pulse(t, 76.5, 89.5, 1.6) * 0.9 + pulse(t, 165.6, 171, 1.2) * 0.7;

export const SCALE = 0.92;

export const octoMotion = (t: number): MotionSample => {
  const x = track(X, t);
  const s = octoState(t);
  return {x, y: groundY(x) - s.hover - track(LIFT, t), rot: track(ROT, t), scale: SCALE, facing: track(FACING, t)};
};

// ----------------------------------------------------------------- MORENA
const MX = keys([[95, 2400], [101, 2360], [107, 2440], [110, 2470], [120, 2380]] as KeyTuple[]);
const MY = keys([[95, 1180], [101, 1215], [107, 1215], [110, 1180], [120, 1200]] as KeyTuple[]);
const MEXT = keys([[95, 0], [95.6, 0], [100, 0.42], [104, 0.48], [107.2, 0.5], [109.3, 0.86, 'stop'], [110.6, 0.82], [113, 0.62], [117, 0.34], [120, 0.15]] as KeyTuple[]);

export const MORAY_WINDOW = [94.8, 120.1] as const;
export const morayState = (t: number) => ({
  anchor: {x: CREVICE.x, y: CREVICE.y},
  target: {x: track(MX, t), y: track(MY, t)},
  extend: clamp(track(MEXT, t)),
  mouth: pulse(t, 107.8, 110.4, 0.4),
  search: smoothstep(110, 111, t) * (1 - smoothstep(117, 119, t)),
  maxLen: 360,
  width: 30,
});

// ----------------------------------------------------------------- MIRADA / PARPADEOS
const ahead = (t: number, dx: number): Gaze => {
  const m = octoMotion(t);
  return {x: m.x + dx, y: groundY(m.x + dx) - 40};
};

export function octoGaze(t: number, morayHead?: Vec, shell?: Vec): Gaze {
  if (t < 4.4) return 'camera';
  if (t < 15) return ahead(t, 380);
  if (t < 45) return 'camera';
  if (t < 52) return ahead(t, 380);
  if (t < 58) return ahead(t, -420);
  if (t < 70) return 'forward';
  if (t < 95) return 'camera';
  if (t < 101.6) return 'forward';
  if (t < 109.2) return morayHead ?? 'forward';
  if (t < 127) return 'forward';
  if (t < 135) return shell ?? 'forward';
  if (t < 142) return ahead(t, 300);
  if (t < 150) return 'camera';
  if (t < 158) return 'forward';
  if (t < 165) return 'camera';
  return 'forward';
}

export const BLINKS = [4.15, 9.2, 17.6, 23.0, 36.0, 48.5, 72.5, 88.0, 99.0, 104.4, 125.0, 133.6, 146.0, 152.5, 162.6, 176.0];

// ----------------------------------------------------------------- CONCHA Y BRAZOS DIRIGIDOS
export const SHELL_REST: Vec = {x: 2005, y: 1256};
export const SHELL_DROP: Vec = {x: 1992, y: 1258};
const SHX = keys([[128, 2005], [131.5, 2003, 'stop'], [134, 1985], [137, 1982, 'stop'], [141, 1992, 'stop']] as KeyTuple[]);
const SHY = keys([[128, 1255], [131.5, 1252, 'stop'], [134, 1150], [137, 1146, 'stop'], [141, 1252, 'stop']] as KeyTuple[]);
export const shellAttach = (t: number) => smoothstep(130.2, 130.8, t) * (1 - smoothstep(141.2, 141.8, t));
export const shellSpin = (t: number) => smoothstep(134, 137.5, t) * Math.PI * 1.1 + Math.sin(t * 2) * 0.08 * shellAttach(t);

export function octoReach(t: number) {
  if (t < 127 || t > 143) return undefined;
  const hold = smoothstep(128.6, 130.6, t) * (1 - smoothstep(141, 142.4, t));
  const probe = smoothstep(135, 136.2, t) * (1 - smoothstep(141.5, 142.5, t));
  const lift = smoothstep(135.6, 137, t) * (1 - smoothstep(141.5, 142.5, t));
  return [
    {arm: 0, target: {x: track(SHX, t), y: track(SHY, t)}, weight: hold},
    {arm: 7, target: {x: 2045 + Math.sin(t * 1.3) * 32, y: 1172 + Math.cos(t * 1.7) * 22}, weight: probe * 0.9},
    {arm: 3, target: {x: 1790 + Math.sin(t * 0.9) * 24, y: 1112 + Math.cos(t * 1.1) * 26}, weight: lift * 0.85},
  ];
}

// ----------------------------------------------------------------- TINTA Y CHORRO
export const INK_BURSTS: InkBurst[] = [109.2, 109.5, 109.9].map((ti, i) => {
  const m = octoMotion(ti);
  return {t: ti, x: m.x - 10, y: m.y - 46, dx: -0.92, dy: 0.12 + i * 0.1, amount: i === 0 ? 1.3 : 0.8};
});

export const jetEmitter = (te: number) => {
  const s = octoState(te);
  const m = octoMotion(te);
  const m2 = octoMotion(te + 0.05);
  let dx = m.x - m2.x;
  let dy = m.y - m2.y;
  const d = Math.hypot(dx, dy) || 1;
  dx /= d;
  dy /= d;
  const pulseK = 0.55 + 0.45 * Math.max(0, Math.sin(te * Math.PI * 2 * s.breathRate));
  return {x: m.x + dx * 30, y: m.y - 40 + dy * 30, dx, dy, strength: clamp(s.streamline) * pulseK * clamp(d / 6)};
};

// ----------------------------------------------------------------- REVELACIONES CIENTÍFICAS
export function anatomyReveal(t: number) {
  const on = 1 - smoothstep(44.55, 44.95, t);
  return {
    outline: smoothstep(26, 28.5, t) * on,
    gills: smoothstep(30, 31.6, t) * on,
    branchial: smoothstep(31.2, 32.4, t) * on,
    venous: smoothstep(32, 34.2, t) * on,
    systemic: smoothstep(37.4, 38.6, t) * on,
    arterial: smoothstep(38.8, 41.2, t) * on,
  };
}
export const anatomyDim = (t: number) =>
  0.62 * smoothstep(25.6, 28.5, t) * (1 - smoothstep(44.55, 44.95, t)) + 0.6 * smoothstep(141.6, 143.2, t) * (1 - smoothstep(149.5, 149.95, t));
export const nervousReveal = (t: number) => smoothstep(142, 143.5, t) * (1 - smoothstep(149.5, 149.95, t));
export const brainReveal = (t: number) => smoothstep(142.6, 144, t) * (1 - smoothstep(149.5, 149.95, t));
export const xrayAmount = (t: number) => Math.max(anatomyReveal(t).outline, nervousReveal(t)) * 0.55;

// ----------------------------------------------------------------- CÁMARA
const cam = (list: KeyTuple[]) => keys(list);
export const CAMERA: CameraTrack = {
  x: cam([
    [0, 870], [3, 835], [5, 838], [6.5, 845], [10, 880], [12.5, 960], [15, 1040], [17.5, 1180], [20, 1250],
    [25, 1262], [29, 1262], [44.999, 1265, 'stop'],
    [45, 1450, 'stop'], [48, 1580], [51.8, 1730], [55, 1760], [58, 1790], [60, 1900], [62, 2080], [64, 2260], [66, 2390], [68, 2450], [70, 2470],
    [76, 2480], [84, 2488], [90, 2480], [95, 2420],
    [100, 2330], [104, 2370], [107, 2390], [110, 2470], [114, 2650], [119.999, 2860, 'stop'],
    [120, 1920, 'stop'], [126.999, 1930, 'stop'], [127, 1940, 'stop'], [131, 1975], [135, 1955], [141, 1915], [143.5, 1890], [149.999, 1888, 'stop'],
    [150, 1360, 'stop'], [154, 1190], [157.6, 1040], [159.6, 1038], [164.4, 1038], [166.5, 975], [172, 900], [180, 880],
  ]),
  y: cam([
    [0, 840], [3, 1010], [5, 1135], [6.5, 1140], [10, 1130], [12.5, 1110], [15, 1090], [17.5, 1100], [20, 1120],
    [23, 1132], [25, 1120], [29, 1072], [44.999, 1068, 'stop'],
    [45, 1080, 'stop'], [51.8, 1085], [55, 1095], [58, 1060], [60, 1000], [62, 950], [64, 960], [66, 1010], [68, 1060], [70, 1085],
    [76, 1110], [84, 1125], [90, 1105], [95, 1090],
    [100, 1110], [104, 1100], [107, 1090], [110, 1050], [114, 980], [119.999, 940, 'stop'],
    [120, 1100, 'stop'], [126.999, 1100, 'stop'], [127, 1130, 'stop'], [131, 1150], [135, 1110], [141, 1100], [143.5, 1110], [149.999, 1105, 'stop'],
    [150, 1090, 'stop'], [157.6, 1112], [159.6, 1158], [164.4, 1158], [166.5, 1130], [172, 1110], [180, 880],
  ]),
  zoom: cam([
    [0, 0.72], [3, 1.05], [5, 1.75], [6.5, 1.55], [10, 1.3], [12.5, 1.15], [15, 1.0], [17.5, 1.25], [20, 1.6],
    [23, 2.5], [25, 2.6], [29, 3.0], [37, 3.05], [44.999, 3.1, 'stop'],
    [45, 1.2, 'stop'], [51.8, 1.25], [55, 1.5], [58, 1.3], [60, 1.05], [63, 1.0], [66, 1.05], [70, 1.25],
    [76, 1.6], [84, 2.1], [90, 1.55], [95, 1.15],
    [100, 1.35], [104, 1.42], [107, 1.28], [110, 1.1], [114, 0.95], [119.999, 0.88, 'stop'],
    [120, 1.5, 'stop'], [126.999, 1.5, 'stop'], [127, 1.7, 'stop'], [131, 2.0], [135, 1.6], [141, 1.55], [143.5, 1.8], [149.999, 1.85, 'stop'],
    [150, 1.2, 'stop'], [157.6, 1.35], [159.6, 5.0], [164.4, 8.0], [166.5, 2.0], [172, 1.4], [180, 0.72],
  ]),
  roll: cam([[0, 0], [15, 0], [17.2, -0.035], [20, 0], [180, 0]]),
};
