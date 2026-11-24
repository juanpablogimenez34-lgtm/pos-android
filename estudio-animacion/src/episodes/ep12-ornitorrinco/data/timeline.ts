// CALENDARIO: 12 escenas × 15 s (450 fotogramas) = 5.400 fotogramas.
// Los eventos (EV) se comparten con la banda sonora (tools/audio/score_ep12_ornitorrinco.py).
export const FPS = 30;
export const DURATION = 180;
const TITLES = [
  'El animal imposible',
  'Su extraordinario hogar',
  'Un mamífero que pone huevos',
  'El nacimiento',
  'Leche sin pezones',
  'El crecimiento',
  'Su primera gran inmersión',
  'El sexto sentido',
  'Un cazador sin dientes',
  'El mamífero venenoso',
  'Un superviviente extraordinario',
  'La naturaleza supera la imaginación',
];
export const SCENES = TITLES.map((title, i) => ({n: i + 1, title, start: i * 15, end: (i + 1) * 15}));
export const EV = {
  hookTitle: 0.5,
  exitWater: 5.4, // sale del río
  hatchCrack: 49.5,
  milk: 68.0,
  growth: [79.0, 83.0],
  pawsIn: 95.0, // patas delanteras en el agua
  dive: 98.6, // inmersión (anillo de ondas)
  eyesClose: 110.0,
  efield: 117.0,
  feedPick: [125.5, 126.8, 128.0],
  surface9: 131.0,
  enter12: 171.0,
  endText: 177.0,
  fadeOut: 179.4,
};
