// EPISODIO 04 — "El ave que supera los 300 km/h" (180 s = 5.400 fotogramas).
// Línea de tiempo maestra (segundos globales): trayectorias, orientación, estados de
// vuelo del halcón, paloma, hora del día y cámara lenta. Cámaras en cameras.ts.
import {clamp, lerp, smoothstep, TAU} from '../../engine/math';
import {keys, KeyTuple, pulse, track} from '../../engine/timeline';
import {BirdParams} from '../../creatures/falcon/Bird';
import {flapAngle, flapPhase, flightAt, FlightKey} from '../../creatures/falcon/flight';

export const FPS = 30;
export const DURATION = 180;
export const MISS = 138.2; // compartido con tools/audio/score_ep04.py

export const SCENES = [
  {n: 1, start: 0, end: 20, title: 'UNA SOMBRA EN EL CIELO'},
  {n: 2, start: 20, end: 45, title: 'EL HALCÓN PEREGRINO'},
  {n: 3, start: 45, end: 70, title: 'EL SECRETO DE LA VELOCIDAD'},
  {n: 4, start: 70, end: 95, title: 'PREPARANDO LA PICADA'},
  {n: 5, start: 95, end: 120, title: 'MÁS DE 300 KM/H'},
  {n: 6, start: 120, end: 150, title: 'LA PRECISIÓN DEL CAZADOR'},
  {n: 7, start: 150, end: 180, title: 'EL REGRESO AL CIELO'},
];

const k = (l: KeyTuple[]) => keys(l);

// ------------------------------------------------------------ HORA DEL DÍA / CÁMARA LENTA
const TOD = k([[0, 0], [20, 0.55], [26, 1], [150, 1], [165, 1.75], [173, 2], [180, 2]]);
export const tod = (t: number) => track(TOD, t);
/** Escala temporal de la animación (cámara lenta ilustrativa). */
export const timeScale = (t: number) => (t >= 114 && t < 120 ? 0.3 : t >= 137.4 && t < 139.4 ? 0.5 : 1);

// ------------------------------------------------------------ ESTADOS DE VUELO
export const FLIGHT: FlightKey[] = [
  {t: 0, state: 'SOARING'},
  {t: 9.5, state: 'GLIDING', blend: 1.5},
  {t: 19.99, state: 'PERCHED', blend: 0.01},
  {t: 40.2, state: 'TAKEOFF', blend: 0.25},
  {t: 42.4, state: 'FLAPPING', blend: 0.8},
  {t: 49.5, state: 'GLIDING', blend: 1.2},
  {t: 70, state: 'FLAPPING', blend: 0.6},
  {t: 72.5, state: 'SOARING', blend: 1.2},
  {t: 84, state: 'STOOP_PREPARATION', blend: 2.5},
  {t: 90, state: 'HIGH_SPEED_DIVE', blend: 3},
  {t: 124, state: 'STOOP_PREPARATION', blend: 3},
  {t: 128.4, state: 'PURSUIT', blend: 1.2},
  {t: 138.6, state: 'GLIDING', blend: 1.0},
  {t: 144.8, state: 'BRAKING', blend: 0.8},
  {t: 149.5, state: 'FLAPPING', blend: 1.0},
  {t: 157, state: 'SOARING', blend: 2},
  {t: 165, state: 'GLIDING', blend: 2},
];

// ------------------------------------------------------------ HALCÓN: trayectoria y orientación
const FX = k([
  [0, 2600], [5, 1500], [10, -300], [15, -1000], [19.99, -1450, 'stop'],
  [20, -300, 'stop'], [40.2, -300, 'stop'], [41.5, -190], [43, 40], [45, 330], [52, 1300], [65, 2600], [70, 3000],
  [73, 3150], [77, 3080], [84, 3120], [90, 3100], [95, 3110, 'stop'],
  [104, 3260], [114, 3380], [120, 3420], [128, 3500], [133, 3790], [137, 4030], [MISS, 4212, 'stop'], [139, 4330], [141, 4560], [146, 4900], [150, 5150],
  [158, 5700], [165, 6300], [173, 6900], [180, 7400],
]);
const FY = k([
  [0, -1450], [5, -1380], [10, -1300], [15, -1220], [19.99, -1180, 'stop'],
  [20, -52, 'stop'], [40.2, -52, 'stop'], [41.5, -112], [43, -150], [45, -172], [52, -230], [65, -280], [70, -300],
  [77, -1500], [84, -2350], [90, -2600], [95, -2660, 'stop'],
  [104, -1200], [114, 900], [120, 1160], [128, 1300], [133, 1360], [137, 1384], [MISS, 1404, 'stop'], [139, 1380], [141, 1300], [146, 1200], [150, 1100],
  [158, 500], [165, 300], [173, 200], [180, 60],
]);
const YAW = k([
  [0, Math.PI], [19.99, Math.PI, 'stop'], [20, 0, 'stop'], [72.5, 0, 'stop'], [76.8, TAU, 'stop'], [180, TAU],
]);
const PITCH = k([
  [0, 0.02], [20, 0], [84, 0, 'stop'], [90, -0.55], [95, -1.32, 'stop'], [120, -1.3], [124, -1.2], [128, -0.35], [133, -0.08], [137.6, -0.15],
  [MISS, -0.25, 'stop'], [139.6, 0.35], [144.8, 0.3], [150, 0.25], [158, 0.18], [165, 0.02], [180, 0.08],
]);
const ROLL = k([
  [0, 0.1], [10, -0.2], [15, 0.05], [20, 0], [45, 0], [52, 0.1], [70, 0.05], [72.5, 0.42], [76.4, 0.42], [77.2, 0], [84, 0], [124, 0], [129, 0.25], [133, -0.15],
  [137.6, 0], [MISS, 0, 'stop'], [139.4, 0.75], [141, 0.5], [146, 0.1], [150, 0], [158, 0.25], [165, 0.45], [173, 0.2], [180, 0.15],
]);
const SCALE = k([[0, 1], [172, 1], [180, 0.42]]);
const SIL = k([[0, 1], [11, 1], [13.6, 0], [180, 0]]);

export const FALCON_SCALE = 1;

/** Fase integrada del batido (caché por fotograma: mismo resultado en cualquier orden). */
const phaseCache = new Map<number, number>();
const phaseAt = (t: number) => {
  const key = Math.round(t * 30);
  let v = phaseCache.get(key);
  if (v === undefined) {
    v = flapPhase(FLIGHT, t, timeScale);
    phaseCache.set(key, v);
  }
  return v;
};

export function falconParams(t: number, rim: string): BirdParams {
  const fp = flightAt(FLIGHT, t);
  const yaw = track(YAW, t);
  const circling = t > 72.5 && t < 76.8;
  // vuelo en círculos (térmica): el ave gira 360° dos veces mientras asciende
  const cx = circling ? 240 * Math.sin(yaw) : 0;
  const blink = pulse(t, 30.4, 30.7, 0.08) + pulse(t, 32.8, 33.1, 0.08) + pulse(t, 16.9, 17.2, 0.08);
  const lookAround = t > 20 && t < 40 ? Math.sin(t * 0.7) * 0.35 + Math.sin(t * 1.9) * 0.08 : 0;
  const lookDown = smoothstep(77, 78.5, t) * (1 - smoothstep(83.5, 85, t)) * -0.55;
  const ts = timeScale(t);
  return {
    t,
    x: track(FX, t) + cx,
    y: track(FY, t) + Math.sin(t * 1.1) * 6 * (fp.legs > 0.8 ? 0 : 1),
    scale: track(SCALE, t) * FALCON_SCALE,
    yaw,
    pitch: track(PITCH, t) + fp.bodyPitch,
    roll: track(ROLL, t),
    flap: flapAngle(fp, phaseAt(t)),
    fold: fp.fold,
    sweep: fp.sweep,
    tail: fp.tail + Math.sin(t * 2.3) * 0.05 * ts,
    tailPitch: fp.tailPitch + Math.sin(t * 1.7) * 0.04,
    legs: Math.max(fp.legs, pulse(t, 137.2, 138.6, 0.3) * 0.8),
    headYaw: lookAround,
    headPitch: -fp.bodyPitch * 0.75 + lookDown + (t > 90 && t < 124 ? 0 : 0),
    nict: Math.max(fp.nict, clamp(blink)),
    silhouette: clamp(track(SIL, t)),
    rim,
  };
}

/** Desplegar las alas posado (34–40 s): el estiramiento se superpone al estado PERCHED. */
export function wingStretch(t: number) {
  const k2 = smoothstep(34.2, 36, t) * (1 - smoothstep(38.4, 40.1, t));
  return {fold: 1 - k2 * 0.95, flapAdd: k2 * (0.75 + Math.sin(t * 2) * 0.08)};
}

// ------------------------------------------------------------ PALOMA
const PX = k([[78, 3150], [84, 3700], [84.01, 3000, 'stop'], [116, 3000, 'stop'], [120, 3250], [128, 3700], [137, 4150], [MISS, 4235, 'stop'], [138.6, 4275], [141, 4500], [146, 5100], [150, 5600]]);
const PY = k([[78, 1460], [84, 1440], [84.01, 1450, 'stop'], [116, 1450, 'stop'], [128, 1460], [137, 1440], [MISS, 1452, 'stop'], [138.6, 1560], [141, 1700], [146, 1760], [150, 1780]]);
export const PIGEON_WINDOWS: [number, number][] = [[78, 84], [116, 150]];
export const pigeonVisible = (t: number) => PIGEON_WINDOWS.some(([a, b]) => t >= a && t < b);
export function pigeonParams(t: number, rim: string): BirdParams {
  const dodge = pulse(t, 137.9, 139.6, 0.25);
  return {
    t,
    x: track(PX, t),
    y: track(PY, t),
    scale: t < 90 ? 0.9 : 0.85,
    yaw: 0,
    pitch: -0.6 * dodge + 0.05,
    roll: 1.0 * dodge,
    flap: flapAngle({flapAmp: 0.95, flapFreq: 7, flapBias: 0.1, fold: 0, sweep: 0, tail: 0.4, tailPitch: 0, legs: 0, nict: 0, bodyPitch: 0}, t * 7 * lerp(1, 0.5, t >= 137.4 && t < 139.4 ? 1 : 0)),
    fold: 0,
    sweep: 0.1 + 0.3 * dodge,
    tail: 0.4 + 0.5 * dodge,
    tailPitch: 0,
    legs: 0,
    headYaw: 0,
    headPitch: 0,
    nict: 0,
    silhouette: 0,
    rim,
  };
}

// ------------------------------------------------------------ EFECTOS
const SPEED = k([[0, 0], [95, 0, 'stop'], [100, 0.55], [108, 1], [114, 1, 'stop'], [114.4, 0.25], [120, 0.25], [124, 0.45], [128, 0.2], [133, 0.35], [140, 0.1], [145, 0], [180, 0]]);
export const speedIntensity = (t: number) => clamp(track(SPEED, t));
export const focusBlur = (t: number) =>
  4 * pulse(t, 15.4, 20, 0.6) + 4 * pulse(t, 27.2, 34, 0.6) + 3 * pulse(t, 77.2, 80.4, 0.5) + 2.5 * pulse(t, 114.2, 120, 0.5);
export const panel = (t: number) => ({
  wing: smoothstep(51.8, 52.6, t) * (1 - smoothstep(58.6, 59.2, t)),
  flow: smoothstep(58.8, 59.4, t) * (1 - smoothstep(64.6, 65.4, t)),
});
export const currents = (t: number) => 0.5 + 0.5 * pulse(t, 70, 84, 2) + 0.6 * pulse(t, 150, 172, 3);
