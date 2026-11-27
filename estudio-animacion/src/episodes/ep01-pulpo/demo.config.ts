// Datos de la demostración de 15 s: cámara, trayectoria, estados y subtítulos.
// Todo es DATOS: para otra escena basta con cambiar estas tablas.

import {CameraTrack} from '../../engine/camera';
import {keys, track} from '../../engine/timeline';
import {EpisodeMeta, SubtitleCue} from '../../engine/types';
import {MotionSample} from '../../creatures/octopus/pose';
import {stateAt, StateKey} from '../../creatures/octopus/states';
import {groundY} from '../../environments/underwater/sets/CaveReefSet';

export const DEMO_META: EpisodeMeta = {
  id: 'ep01-demo',
  title: 'EL ANIMAL CON TRES CORAZONES',
  subject: 'Octopus vulgaris',
  fps: 30,
  width: 1080,
  height: 1920,
  durationSec: 15,
};

// 0–3 s acercamiento a la cueva · 3–6 ojo y cuerpo · 6–10 sale y camina ·
// 10–13 seguimiento · 13–15 mira a cámara + título
export const DEMO_CAMERA: CameraTrack = {
  x: keys([[0, 870], [3, 835], [4.6, 838], [6, 905], [8, 1060], [10, 1270], [12, 1480], [13.4, 1610], [15, 1676, 'stop']]),
  y: keys([[0, 840], [3, 1010], [4.6, 1130], [6, 1120], [8, 1090], [10, 1080], [13.4, 1085], [15, 1112, 'stop']]),
  zoom: keys([[0, 0.72], [3, 1.02], [4.6, 1.7], [6, 1.42], [8, 1.18], [10, 1.12], [12, 1.12], [13.4, 1.22], [15, 1.5, 'stop']]),
};

export const DEMO_STATES: StateKey[] = [
  {t: 0, state: 'HIDING'},
  {t: 4.3, state: 'EXPLORING', blend: 1.2},
  {t: 6.0, state: 'CRAWLING', blend: 1.0},
  {t: 13.2, state: 'RESTING', blend: 1.0},
];

const X = keys([[0, 772], [3, 784], [4.3, 806], [6, 905], [8, 1110], [10, 1320], [12, 1525], [13.3, 1630], [14.3, 1664, 'stop'], [15, 1666]]);
const FACING = keys([[0, 1], [12.7, 1, 'stop'], [13.9, 0, 'stop'], [15, 0]]);

export const demoState = (t: number) =>
  stateAt(DEMO_STATES, t, (tt) => (tt > 13 ? {alert: 0.55, eyeOpen: 0.95, pupil: 0.7} : {}));

export const demoMotion = (t: number): MotionSample => {
  const x = track(X, t);
  const s = demoState(t);
  return {x, y: groundY(x) - s.hover, rot: 0, scale: 0.92, facing: track(FACING, t)};
};

export const demoGaze = (t: number) => {
  if (t < 4.4) return 'camera' as const;
  if (t < 12.8) return {x: track(X, t) + 380, y: groundY(track(X, t) + 380) - 40};
  return 'camera' as const;
};

export const DEMO_BLINKS = [4.15, 9.2, 14.0];

export const DEMO_CUES: SubtitleCue[] = [
  {start: 0.5, end: 3.7, text: 'En las profundidades del océano\nvive una criatura extraordinaria.', highlight: ['extraordinaria']},
  {start: 3.9, end: 7.1, text: 'Tiene ocho brazos,\nuna inteligencia sorprendente', highlight: ['ocho brazos']},
  {start: 7.3, end: 10.0, text: 'y algo que parece imposible:'},
  {start: 10.2, end: 12.8, text: 'tres corazones.', highlight: ['tres corazones']},
];
