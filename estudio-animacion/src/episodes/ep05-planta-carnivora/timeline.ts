// EPISODIO 05 — "La planta que caza animales" (180 s = 5.400 fotogramas).
// Línea de tiempo maestra: escenas, instantes clave de la historia y tiempo de la repetición
// en cámara lenta. Los estados de cada personaje están en animation/*.ts.
import {clamp} from '../../engine/math';

export const FPS = 30;
export const DURATION = 180;

export const SCENES = [
  {n: 1, start: 0, end: 20, title: 'UNA TRAMPA ESCONDIDA'},
  {n: 2, start: 20, end: 45, title: 'APARECE LA MOSCA'},
  {n: 3, start: 45, end: 70, title: 'EL MECANISMO SECRETO'},
  {n: 4, start: 70, end: 95, title: 'LA TRAMPA SE CIERRA'},
  {n: 5, start: 95, end: 120, title: 'LA DIGESTIÓN'},
  {n: 6, start: 120, end: 150, title: '¿POR QUÉ COME INSECTOS?'},
  {n: 7, start: 150, end: 180, title: 'EL FINAL SORPRENDENTE'},
];

/** Instantes clave (compartidos con tools/audio/score_ep05.py). */
export const EV = {
  flyIn: 20.0,
  hover: 29.0,
  touchdown: 31.6,
  groom: 35.0,
  walkToPlant: 40.0,
  touch1: 60.6, // primer pelo sensitivo → primera señal eléctrica
  touch2: 78.9, // segundo estímulo dentro de la ventana temporal
  snap: 79.25, // inicio del cierre rápido
  snapEnd: 79.36, // ≈ 0,1 s
  replayStart: 81.0,
  replayEnd: 86.0,
  replayFrom: 79.0, // tiempo de la historia que se repite
  replayRate: 0.1, // ×10 más lento
  struggles: [88.4, 91.0, 93.9, 97.4], // nuevos estímulos de la presa retenida
  sealStart: 103.0,
  daysStart: 110.0,
  reopen: 116.4,
  secondFly: 165.0,
  final: 174.8,
};

/** ¿Estamos en la repetición en cámara lenta? */
export const inReplay = (t: number) => t >= EV.replayStart && t < EV.replayEnd;

/** Tiempo de la historia (en la repetición se vuelve a ver el cierre a ×0,1). */
export const storyT = (t: number) => (inReplay(t) ? EV.replayFrom + (t - EV.replayStart) * EV.replayRate : t);

/** Días transcurridos en la visualización acelerada (para el rótulo). */
export const daysShown = (t: number) => Math.round(clamp((t - EV.daysStart) / (EV.reopen - EV.daysStart)) * 9) + 1;
