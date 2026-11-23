// CALENDARIO: 12 escenas × 15 s × 30 fps = 5.400 fotogramas. Los eventos (EV) se comparten con la
// banda sonora (tools/audio/score_ep18_mixino.py): si se cambia uno, cambiarlo también allí.
export const FPS = 30;
export const DURATION = 180;
const TITLES = [
  'Gancho',
  'La criatura misteriosa',
  'Las glándulas secretas',
  'La expansión',
  'El depredador',
  'La defensa en acción',
  'El nudo imposible',
  'El cuerpo extraordinario',
  'El limpiador del océano',
  'Un linaje antiguo',
  'El secreto de su supervivencia',
  'Final',
];
export const SCENES = TITLES.map((title, i) => ({n: i + 1, title, start: i * 15, end: (i + 1) * 15}));

/** Dimensiones del personaje (unidades de mundo). */
export const HAG = {len: 1000, n: 84, width: 42, knotLen: 1100, knotN: 96, knotW: 38, knotScale: 30, knotR: 1.6};

export const EV = {
  hookLunge: 2.6, // el depredador ataca
  hookSlime: 2.9, // primera liberación de mucosidad
  hookSlime2: 3.5,
  hookRetreat: 3.4,
  title: 10.0,
  glandPulse: 38.2, // la glándula se contrae y libera
  microUnravel: 48.0, // las madejas se despliegan
  microBurst: 52.5, // las vesículas de mucina estallan
  predTurn: 66.0,
  predBite: 71.4,
  predSlime: 71.7,
  gillClog: 77.0,
  predShake: 81.0,
  hagEscape: 83.0,
  knotStart: 93.0,
  knotDone: 98.0,
  slideStart: 105.5,
  slideEnd: 116.5,
  unknot: 118.0,
  feed: 121.0,
  timeline: 136.0,
  rocks: 150.0,
  predReturn: 165.0,
  finalLunge: 168.6,
  finalSlime: 168.9,
  endText: 177.6,
  fadeOut: 179.4,
};
