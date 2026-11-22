// CALENDARIO DEL DOCUMENTAL COMPLETO (180 s · 30 fps · 5.400 fotogramas): siete escenas.
// Los instantes de los eventos (EV) se comparten con la banda sonora
// (tools/audio/score_ep17_sapo.py): si se cambia uno, cambiarlo también allí.
import {GrowthTrack} from '../../../../lifecycle/stages';

export const FPS = 30;
export const DURATION = 180;

export const SCENES = [
  {n: 1, start: 0, end: 20, title: 'El nacimiento de una criatura extraordinaria'},
  {n: 2, start: 20, end: 45, title: 'La vida dentro del huevo'},
  {n: 3, start: 45, end: 70, title: 'El pequeño nadador'},
  {n: 4, start: 70, end: 95, title: 'Comienza la transformación'},
  {n: 5, start: 95, end: 120, title: 'El adiós a la cola'},
  {n: 6, start: 120, end: 150, title: 'El primer mundo terrestre'},
  {n: 7, start: 150, end: 180, title: 'El sapo adulto'},
];

/** Grado de desarrollo del renacuajo/sapo (0 recién eclosionado … 1 adulto) en función del tiempo de
 *  vídeo. Los tramos con pendiente son las transiciones temporales (días o semanas condensados). */
export const GROWTH: GrowthTrack = [
  [45, 0],
  [58, 0.04],
  [70, 0.15],
  [76, 0.45],
  [84, 0.66],
  [90, 0.74],
  [95, 0.76],
  [101, 0.77],
  [107, 0.9],
  [113, 0.93],
  [118, 0.95],
  [150.5, 0.95],
  [158, 1],
];

/** Eventos compartidos con el sonido. */
export const EV = {
  hookSurface: 2.3, // el renacuajo ya metamorfoseado atraviesa la superficie
  title: 3.4, // título
  dive: 8.4, // la cámara entra en el estanque
  hatch: 46.0, // se abre la cápsula
  tailMacro: 65.0,
  legsHind: 76.0,
  legsFore: 84.0,
  rest: 101.0, // descansa mientras reabsorbe la cola
  edge: 107.0, // cambio a la orilla (toma partida agua/aire)
  breakSurface: 116.2, // la cabeza rompe la superficie
  hop: 131.0, // primer saltito en tierra
  antIn: 141.5,
  strike: 146.0, // lengua
  adultLapse: 150.5,
  walkAdult: 158.0,
  eye: 165.0,
  endText: 173.8,
  fadeOut: 179.3,
};
