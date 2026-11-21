// EPISODIO 02 — "El monstruo que vive en la oscuridad" (180 s = 5.400 fotogramas).
// Línea de tiempo maestra en segundos globales. La hembra está en el origen del mundo.

import {CameraTrack} from '../../engine/camera';
import {clamp, lerp, smoothstep, Vec} from '../../engine/math';
import {keys, KeyTuple, pulse, track} from '../../engine/timeline';
import {AnglerParams} from '../../creatures/anglerfish/Anglerfish';

export const FPS = 30;
export const DURATION = 180;
export const STRIKE = 109.0; // compartido con tools/audio/score_ep02.py
export const BITE = 138.6;

export const SCENES = [
  {n: 1, start: 0, end: 20, title: 'DESCENSO A LA OSCURIDAD'},
  {n: 2, start: 20, end: 45, title: 'LA LUZ MISTERIOSA'},
  {n: 3, start: 45, end: 70, title: 'EL PEZ ABISAL'},
  {n: 4, start: 70, end: 95, title: 'LA TRAMPA LUMINOSA'},
  {n: 5, start: 95, end: 120, title: 'EL ATAQUE'},
  {n: 6, start: 120, end: 150, title: 'EL SECRETO DE SU REPRODUCCIÓN'},
  {n: 7, start: 150, end: 180, title: 'EL MISTERIO FINAL'},
];

const k = (l: KeyTuple[]) => keys(l);

// ------------------------------------------------------------ DESCENSO (0–20 s)
export const descentDepth = (t: number) => Math.pow(clamp(t / 19), 0.9);
export const descentMeters = (t: number) => 1000 * Math.pow(clamp(t / 18), 1.25);
export const snowClimb = (t: number) => 160 * Math.min(t, 20); // desplazamiento acumulado
export const stageMix = (t: number) => smoothstep(19.2, 21, t);

// ------------------------------------------------------------ HEMBRA
const FX = k([[0, 0], [45, 0], [70, 10], [95, 0], [108.95, 0, 'stop'], [109.15, 40], [110, 30], [114, 10], [120, 0, 'stop'], [150, 0, 'stop'], [160, 340], [170, 700], [180, 900]]);
const FY = k([[0, 0], [95, 0], [114, 0], [120, 40, 'stop'], [120.01, 0, 'stop'], [150, 0], [170, -120], [180, -160]]);
const FSCALE = k([[0, 1.7], [114, 1.7], [119.99, 1.35, 'stop'], [120, 1.7, 'stop'], [150, 1.7], [170, 1.15], [180, 0.9]]);
const YAW = k([[0, 0], [59, 0, 'stop'], [61.8, 0.72], [63.2, 0.72], [65.5, 0, 'stop'], [180, 0]]);
const PITCH = k([[0, 0], [59, 0, 'stop'], [62, -0.16], [65.5, 0, 'stop'], [150, 0, 'stop'], [158, -0.08], [180, -0.06]]);
const JAW = k([
  [0, 0.04], [40, 0.04], [43, 0.14], [46, 0.06], [52, 0.06, 'stop'], [55.5, 0.42], [57.5, 0.42], [60, 0.06, 'stop'],
  [100, 0.05], [104, 0.12], [108.95, 0.05, 'stop'], [109.08, 1.0, 'stop'], [109.3, 1.0, 'stop'], [109.55, 0.08, 'stop'], [110.4, 0.05], [180, 0.05],
] as KeyTuple[]);
const GLOW = k([[0, 0.3], [20, 0.3], [27, 1.0], [176, 1.0, 'stop'], [179.5, 0, 'stop'], [180, 0]]);
const FIN = k([[0, 0.45], [59, 0.45], [60, 1.0], [65, 1.0], [66, 0.45], [108.5, 0.45], [109.2, 1.4], [111, 0.5], [150, 0.5], [151, 0.9], [170, 0.9], [180, 0.6]]);
const GULP = k([[0, 0], [109.5, 0, 'stop'], [110.6, 0.85], [118, 0.5], [120, 0.3, 'stop'], [180, 0.3]]);

export function femaleParams(t: number): AnglerParams {
  return {
    t,
    x: track(FX, t),
    y: track(FY, t) + Math.sin(t * 0.45) * 8,
    scale: track(FSCALE, t),
    facing: 1,
    pitch: track(PITCH, t) + Math.sin(t * 0.37) * 0.025,
    yaw: track(YAW, t),
    jaw: track(JAW, t) + pulse(t, 110.2, 112.2, 0.3) * 0.08 * Math.max(0, Math.sin(t * 9)),
    lureSway: t < 45 ? 1.4 : 1,
    lureJig: pulse(t, 77, 84, 0.8) + pulse(t, 90, 108.6, 0.6) * 0.55,
    glow: track(GLOW, t) * (t < 27 ? 0.75 + 0.25 * Math.sin(t * 3.1) : 1),
    finRate: track(FIN, t),
    gulp: track(GULP, t),
  };
}

// ------------------------------------------------------------ PRESA (pez linterna)
const PX = k([[84, 1050], [90, 640], [95, 420], [100, 330], [104, 280], [108.9, 212, 'stop']]);
const PY = k([[84, -330], [90, -250], [95, -215], [100, -200], [104, -150], [108.9, -48, 'stop']]);
export const PREY_WINDOW = [83.8, 109.4] as const;
export function preyState(t: number, mouth: Vec) {
  const base = {x: track(PX, t) + Math.sin(t * 1.7) * 6, y: track(PY, t) + Math.sin(t * 2.3) * 5};
  const suck = smoothstep(109.04, 109.28, t);
  const p = {x: lerp(base.x, mouth.x, suck), y: lerp(base.y, mouth.y, suck)};
  const dx = track(PX, t + 0.1) - track(PX, t);
  const dy = track(PY, t + 0.1) - track(PY, t);
  return {
    ...p,
    angle: Math.atan2(dy, dx) + (dx < 0 ? 0 : 0),
    scale: 1.25 * (1 - suck * 0.6),
    opacity: smoothstep(83.8, 85.5, t) * (1 - smoothstep(109.2, 109.34, t)),
    wag: 1 + pulse(t, 103, 109, 0.5) * 0.8,
  };
}

// ------------------------------------------------------------ MACHO
const MX = k([[128, -900], [131, -600], [134, -330], [136.5, -130], [138.6, -38, 'stop']]);
const MY = k([[128, 540], [131, 450], [134, 345], [136.5, 262], [138.6, 222, 'stop']]);
export const MALE_FREE_WINDOW = [127.8, 138.6] as const;
export function maleState(t: number) {
  const dx = track(MX, t + 0.1) - track(MX, t);
  const dy = track(MY, t + 0.1) - track(MY, t);
  return {
    x: track(MX, t) + Math.sin(t * 2) * 5,
    y: track(MY, t) + Math.sin(t * 2.6) * 6,
    angle: Math.atan2(dy, dx),
    scale: 1.45,
    opacity: smoothstep(127.8, 129.5, t),
  };
}
export const maleAttached = (t: number) => t >= BITE;
export const maleFuse = (t: number) => smoothstep(BITE, 145, t);

// ------------------------------------------------------------ LUZ / OSCURIDAD
const LIGHT_R = k([
  [19, 140], [34, 140], [40, 440], [45, 560], [48, 900], [70, 900], [72, 760], [95, 760], [100, 650], [114, 650], [120, 320, 'stop'],
  [120.01, 900, 'stop'], [150, 900], [160, 700], [170, 200], [176, 140], [180, 90],
] as KeyTuple[]);
const DARK = k([[19, 0.97], [40, 0.96], [46, 0.9], [70, 0.9], [95, 0.92], [114, 0.92], [120, 0.98, 'stop'], [120.01, 0.86, 'stop'], [127, 0.86], [129, 0.78], [137, 0.78], [139, 0.86], [150, 0.86], [165, 0.97], [176, 0.985], [180, 1]] as KeyTuple[]);
export const lightRadius = (t: number) => track(LIGHT_R, t);
export const darkness = (t: number) => track(DARK, t);
export const deepLife = (t: number) => smoothstep(20, 26, t) * (1 - smoothstep(172, 178, t));

// ------------------------------------------------------------ CÁMARA
export const CAMERA: CameraTrack = {
  x: k([
    [19, 226], [27, 226], [34, 220], [40, 150], [45, 140],
    [48, -10], [52, -10], [55, 150], [59, 150], [62, 0], [65, 0], [68, 180], [70, 120],
    [74, 40], [77, 226], [84, 226], [87, 300], [90, 226], [91.5, 130], [93, 226], [94.5, 130], [95, 150],
    [99, 230], [102, 150], [108, 150], [111, 160], [114, 60], [120, 0, 'stop'],
    [120.01, 0, 'stop'], [128, -300], [132, -470], [136, -170], [139, 30], [145, 30], [150, 40],
    [155, 200], [160, 420], [165, 640], [170, 860], [176, 930], [180, 960],
  ]),
  y: k([
    [19, -204], [27, -204], [34, -190], [40, -80], [45, -20],
    [48, -20], [52, -20], [55, 0], [59, 0], [62, -20], [65, -20], [68, -130], [70, -80],
    [74, -40], [77, -204], [84, -204], [87, -160], [90, -204], [91.5, 5], [93, -204], [94.5, 5], [95, -60],
    [99, -150], [102, -20], [108, -20], [111, -20], [114, -20], [120, -10, 'stop'],
    [120.01, 0, 'stop'], [128, 300], [132, 400], [136, 270], [139, 175], [145, 170], [150, 80],
    [155, 0], [160, -100], [165, -200], [170, -300], [176, -320], [180, -330],
  ]),
  zoom: k([
    [19, 0.45], [27, 0.7], [34, 1.3], [40, 1.15], [45, 1.85],
    [48, 0.95], [52, 0.95], [55, 2.8], [58, 2.9], [61, 1.25], [65, 1.25], [68, 2.1], [70, 1.6],
    [74, 1.05], [77, 1.9], [84, 1.9], [87, 0.8], [90, 2.2], [91.5, 2.3], [93, 2.2], [94.5, 2.3], [95, 1.6],
    [99, 1.5], [102, 2.6], [108, 2.6], [111, 2.3], [114, 1.4], [120, 0.65, 'stop'],
    [120.01, 0.8, 'stop'], [128, 1.0], [132, 1.3], [136, 1.5], [139, 2.4], [145, 2.4], [150, 1.4],
    [155, 1.2], [160, 1.1], [165, 1.0], [170, 0.85], [176, 0.8], [180, 0.75],
  ]),
};

/** Sacudida breve de cámara en el ataque (determinista). */
export const shake = (t: number) => {
  const a = pulse(t, STRIKE, STRIKE + 0.9, 0.05) * 16 * (1 - clamp((t - STRIKE) / 0.9));
  return {x: Math.sin(t * 71) * a, y: Math.cos(t * 59) * a};
};

// ------------------------------------------------------------ OVERLAYS
export const panelMix = (t: number) => smoothstep(120.2, 121, t) * (1 - smoothstep(127.4, 128.2, t));
export const fusionMix = (t: number) => smoothstep(139.6, 141, t) * (1 - smoothstep(149.4, 150.2, t));
export const illustrationDim = (t: number) => 0.45 * smoothstep(145, 146.5, t) * (1 - smoothstep(149.4, 150.4, t)) + 0.6 * panelMix(t);
