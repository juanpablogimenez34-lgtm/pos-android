// EPISODIO 03 — "El animal que sobrevivió al espacio" (180 s = 5.400 fotogramas).
// Línea de tiempo maestra (segundos globales): entornos, animación del tardígrado,
// secado/rehidratación y revelaciones. Las cámaras están en cameras.ts.
import {clamp, smoothstep} from '../../engine/math';
import {keys, KeyTuple, pulse, track} from '../../engine/timeline';
import {TardiParams} from '../../creatures/tardigrade/Tardigrade';
import {stemSlope, stemTop} from '../../environments/moss/Moss';

export const FPS = 30;
export const DURATION = 180;
export const SPLASH = 152.4; // compartido con tools/audio/score_ep03.py

export const SCENES = [
  {n: 1, start: 0, end: 20, title: 'UN MUNDO INVISIBLE'},
  {n: 2, start: 20, end: 45, title: 'EL OSO DE AGUA'},
  {n: 3, start: 45, end: 70, title: 'CUANDO EL AGUA DESAPARECE'},
  {n: 4, start: 70, end: 95, title: 'CONDICIONES EXTREMAS'},
  {n: 5, start: 95, end: 120, title: 'EL EXPERIMENTO ESPACIAL'},
  {n: 6, start: 120, end: 150, title: 'EL SECRETO DE SUS CÉLULAS'},
  {n: 7, start: 150, end: 180, title: 'EL REGRESO'},
];

// ------------------------------------------------------------ ENTORNOS (sólo se monta lo visible)
export const ENV = {
  forestA: [0, 14.2] as const,
  microA: [10.6, 70.8] as const,
  extreme: [70, 95.8] as const,
  space: [95, 120.8] as const,
  microB: [120, 129.4] as const,
  cell: [125.8, 148.6] as const,
  microC: [145.6, 176.4] as const,
  forestB: [172.2, 180] as const,
};
export const inWin = (t: number, w: readonly [number, number]) => t >= w[0] && t < w[1];
/** Radio (0–1) de la "lente" circular que revela el entorno microscópico/celular. */
export const lensIn = (t: number) => smoothstep(10.6, 14.2, t);
export const lensOut = (t: number) => 1 - smoothstep(172.4, 176.2, t);
export const cellLens = (t: number) => smoothstep(125.8, 129.2, t) * (1 - smoothstep(145.6, 148.4, t));

// ------------------------------------------------------------ SEQUEDAD DEL MUSGO
const DRY = keys([[0, 0], [45, 0], [60, 1, 'stop'], [SPLASH, 1, 'stop'], [162, 0, 'stop'], [180, 0]] as KeyTuple[]);
export const dryness = (t: number) => clamp(track(DRY, t));

// ------------------------------------------------------------ TARDÍGRADO
const X = keys([
  [10, -980], [15, -900], [20, -720], [27, -600], [34, -500], [40, -320], [45, -160], [52, -50], [58, 4, 'stop'],
  [158, 4, 'stop'], [162, 12], [165, 40], [169, 150], [173, 260], [176.4, 330],
] as KeyTuple[]);
const TUN = keys([[0, 0], [58.6, 0, 'stop'], [64.6, 1, 'stop'], [156.4, 1, 'stop'], [164, 0, 'stop'], [180, 0]] as KeyTuple[]);
const ACT = keys([[0, 1], [45, 1], [55, 0.5], [59, 0.2], [64.6, 0, 'stop'], [158, 0, 'stop'], [162, 0.6], [165, 1], [180, 1]] as KeyTuple[]);
export const MICRO_SCALE = 1.6;

export function tardiParams(t: number): TardiParams {
  const x = track(X, t);
  return {
    t,
    x,
    y: stemTop(x),
    scale: MICRO_SCALE,
    facing: 1,
    slope: stemSlope(x),
    dist: x, // la fase de la marcha depende de la distancia recorrida
    activity: clamp(track(ACT, t)),
    tun: clamp(track(TUN, t)),
    look: Math.sin(t * 0.5) * 0.6 * (t < 45 ? 1 : 0.4),
  };
}

// ------------------------------------------------------------ GOTAS
/** Gota que cruza el encuadre (40–45 s), en coordenadas de pantalla. */
export const passingDrop = (t: number) => {
  const u = clamp((t - 40.2) / 4.4);
  return {active: t > 40.2 && t < 44.8, x: 1180 - u * 1400, y: -200 + u * 1900 + Math.sin(u * 6) * 30, r: 150};
};
/** Gota que cae sobre el tonel y salpica (150–153 s), en coordenadas del mundo microscópico. */
export const fallingDrop = (t: number) => {
  const u = clamp((t - 150) / (SPLASH - 150));
  return {active: t > 150 && t < SPLASH, x: 6, y: -900 + u * u * (stemTop(4) - 80 + 900), r: 70 * (1 + 0.1 * u)};
};
export const splash = (t: number) => (t >= SPLASH && t < SPLASH + 2.2 ? (t - SPLASH) / 2.2 : -1);

// ------------------------------------------------------------ VISUALIZACIONES
export const tunPanel = (t: number) => smoothstep(64.6, 65.6, t) * (1 - smoothstep(69.6, 70.4, t));
export const cellGel = (t: number) => smoothstep(127, 131, t);
export const cellDsup = (t: number) => smoothstep(130.8, 135.8, t);
export const pulseAt = pulse;
