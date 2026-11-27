// CALENDARIO: 12 escenas × 15 s (450 fotogramas) = 5.400 fotogramas. Los eventos (EV) se comparten con la
// banda sonora (tools/audio/score_ep20_pez_erizo.py): si se cambia uno, cambiarlo también allí.
export const FPS = 30;
export const DURATION = 180;
const TITLES = [
  'La transformación imposible',
  'Conoce al pez erizo',
  'El primer secreto',
  'Qué ocurre dentro de su cuerpo',
  'La armadura de espinas',
  'El depredador',
  'El increíble cambio de tamaño',
  'Una defensa que cuesta energía',
  'Regresar a la normalidad',
  'Su vida cuando no está en peligro',
  'Más que una simple bola',
  'Final',
];
export const SCENES = TITLES.map((title, i) => ({n: i + 1, title, start: i * 15, end: (i + 1) * 15}));

/** Inflados y desinflados (inicio, fin) — cada uno con ritmo y encuadre distintos. */
export const EV = {
  hookPred: 0.0,
  hookInflate: [0.8, 4.0] as const,
  hookText: 3.0,
  pump: [35.0, 40.0] as const,
  anatomyInflate: [50.0, 57.0] as const,
  spineInflate: [64.0, 72.5] as const,
  predAppear: 75.0,
  predInflate: [83.0, 86.4] as const,
  predLeave: 87.0,
  sizeInflate: [94.0, 100.0] as const,
  diagram: 100.2,
  holdThreatGone: 110.5,
  deflate: [115.0, 128.0] as const,
  swimAgain: 130.0,
  feed: 145.5,
  endText: 176.2,
  fadeOut: 179.4,
};
