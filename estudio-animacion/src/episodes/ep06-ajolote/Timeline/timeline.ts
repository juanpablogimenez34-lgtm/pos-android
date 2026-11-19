// EPISODIO 06 — "El animal que reconstruye su cuerpo" (180 s = 5.400 fotogramas).
// Línea de tiempo maestra: escenas, instantes clave y progreso de la regeneración.
import {clamp, smoothstep} from '../../../engine/math';
import {keys, track} from '../../../engine/timeline';

export const FPS = 30;
export const DURATION = 180;

export const SCENES = [
  {n: 1, start: 0, end: 20, title: 'UN HABITANTE EXTRAORDINARIO'},
  {n: 2, start: 20, end: 45, title: 'CONOCEMOS AL AJOLOTE'},
  {n: 3, start: 45, end: 70, title: 'EL ACCIDENTE'},
  {n: 4, start: 70, end: 95, title: 'COMIENZA LA REGENERACIÓN'},
  {n: 5, start: 95, end: 120, title: 'UNA NUEVA EXTREMIDAD'},
  {n: 6, start: 120, end: 150, title: 'EL SECRETO DE SUS CÉLULAS'},
  {n: 7, start: 150, end: 180, title: 'EL REGRESO Y EL FUTURO'},
];

/** Instantes clave (compartidos con tools/audio/score_ep06.py). */
export const EV = {
  underwater: 7.6, // la cámara cruza la superficie
  wildSwim: 15.6,
  pinkWalk: 34.0,
  pinkSwim: 40.0,
  land: 46.2,
  feed: 50.25, // succión de la Daphnia
  startle: 55.2,
  rest: 58.6,
  sciIn: 59.4, // transición a la vista científica
  lesion: 62.2, // (oculto por el destello) la extremidad pasa a mostrarse lesionada
  sciPanel: 120.6, // panel celular a pantalla completa
  sciOut: 145.0,
  recovery: 150.0,
  swimAway: 158.0,
  surface: 165.0,
  wildFinal: 173.0,
  final: 174.8,
};

/** Progreso de la regeneración (r: 0 lesión → 6 extremidad regenerada) y escala de la pata nueva. */
const R = keys([
  [0, 6], [EV.lesion, 6, 'stop'], [EV.lesion + 0.01, 0, 'stop'], [77, 0, 'stop'], [84, 1], [90, 2], [95, 2.6], [103, 3.5], [110, 4.35], [116, 5.4], [120, 6, 'stop'], [180, 6],
]);
const SIZE = keys([[0, 1], [EV.lesion, 1, 'stop'], [EV.lesion + 0.01, 0.6, 'stop'], [110, 0.62], [116, 0.7], [120, 0.76], [150, 0.9], [170, 0.97], [180, 1]]);

export const regenR = (t: number) => clamp(track(R, t), 0, 6);
export const regenSize = (t: number) => track(SIZE, t);
export const regenActive = (t: number) => t >= EV.lesion;

export const STAGES = ['STAGE_0 · extremidad lesionada', 'STAGE_1 · cobertura de la herida', 'STAGE_2 · formación del blastema', 'STAGE_3 · crecimiento inicial', 'STAGE_4 · organización de estructuras', 'STAGE_5 · desarrollo de dedos', 'STAGE_6 · extremidad regenerada'];
export const stageAt = (r: number) => Math.min(6, Math.floor(r + 0.0001));

/** Peso de la "vista científica" (velo y rejilla) sobre la escena real. */
export const sciK = (t: number) => smoothstep(EV.sciIn, EV.sciIn + 1.2, t) * (1 - smoothstep(EV.recovery - 2, EV.recovery, t));
