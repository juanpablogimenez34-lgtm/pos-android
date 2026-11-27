// EP04 · EL CAMARÓN MANTIS — EL PEQUEÑO GIGANTE DEL OCÉANO. 180 s · 30 fps · 5.400 fotogramas.
// 20 secuencias de 9 s (270 fotogramas) agrupadas en 5 actos. Cada secuencia declara su fotograma
// inicial y final. Los instantes de los eventos (EV) coinciden con tools/audio/score_ep10_mantis.py
// y con los tiempos MEDIDOS de la locución (narration/narration-timing.json).
export const FPS = 30;
export const DURATION = 180;
export const TOTAL_FRAMES = DURATION * FPS; // 5400
export const SEQ_LEN = 9;

const TITLES = [
  'Descenso al arrecife',
  'Ojos en la grieta',
  'El protagonista emerge',
  'Un cuerpo extraordinario',
  'Ojos independientes',
  'Cómo funcionan sus ojos',
  'El mundo a través de su mirada',
  'Encuentro con la presa',
  'Preparación del golpe',
  'El impacto',
  'Burbujas de cavitación',
  'La presa',
  'El arma natural',
  'Estructura interna',
  'Inspiración científica',
  'Regreso al arrecife',
  'La vida de un cazador',
  'El refugio',
  'Un pequeño gigante',
  'Cierre',
];

export const ACTS = [
  {n: 1, label: 'El misterio', from: 1, to: 4},
  {n: 2, label: 'La visión', from: 5, to: 7},
  {n: 3, label: 'El golpe', from: 8, to: 12},
  {n: 4, label: 'La ciencia', from: 13, to: 16},
  {n: 5, label: 'El regreso', from: 17, to: 20},
];

export type Sequence = {n: number; title: string; start: number; end: number; startFrame: number; endFrame: number; act: number};
export const SEQUENCES: Sequence[] = TITLES.map((title, i) => ({
  n: i + 1,
  title,
  start: i * SEQ_LEN,
  end: (i + 1) * SEQ_LEN,
  startFrame: i * SEQ_LEN * FPS,
  endFrame: (i + 1) * SEQ_LEN * FPS - 1,
  act: ACTS.find((a) => i + 1 >= a.from && i + 1 <= a.to)!.n,
}));
export const seqAt = (t: number) => SEQUENCES[Math.min(19, Math.max(0, Math.floor(t / SEQ_LEN)))];

/** Eventos clave (s). */
export const EV = {
  title: 2.2,
  peek: 9.6,
  walkOut: [19, 26.5] as const,
  approach: [63.5, 66.5] as const,
  backStep: [67.2, 68.4] as const,
  advance: [69.0, 70.5] as const,
  cock: [73.0, 75.6] as const,
  strike: 83.0,
  slow: [86.2, 88.6] as const,
  cav: [90.6, 98.6] as const,
  extra: [100.4, 101.6, 102.8] as const,
  crack: 103.0,
  current: [135, 137.5] as const,
  patrol: [140, 144.5] as const,
  turn1: [145, 146.2] as const,
  threat: [147.2, 149.6] as const,
  walkBack: [149.8, 152.4] as const,
  walkHome: [153, 156.5] as const,
  turn2: [156.6, 157.8] as const,
  retreat: [158, 161] as const,
  endTitle: 172.0,
  fade: [177.4, 180] as const,
};
