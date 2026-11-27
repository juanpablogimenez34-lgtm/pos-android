// CALENDARIO: 12 escenas × 15 s = 5.400 fotogramas. Los instantes (EV, en tiempo REAL) se comparten con
// la banda sonora (tools/audio/score_ep21_pez_arquero.py): si se cambia uno, cambiarlo también allí.
export const FPS = 30;
export const DURATION = 180;
const TITLES = [
  'El francotirador del agua',
  'Conoce al pez arquero',
  'Los ojos del cazador',
  'El engaño de la luz',
  'La boca que dispara',
  'El disparo perfecto',
  'La presa cae',
  'La carrera por el alimento',
  '¿Siempre acierta?',
  'Aprender a apuntar',
  'El secreto de su supervivencia',
  'El último disparo',
];
export const SCENES = TITLES.map((title, i) => ({n: i + 1, title, start: i * 15, end: (i + 1) * 15}));

/** Disparos (instante real de salida, instante real de impacto/llegada) y otros eventos de sonido. */
export const EV = {
  shots: [
    {t: 1.2, hit: true},
    {t: 71.5, hit: true},
    {t: 86.0, hit: true}, // cámara lenta: llega a los 91 s
    {t: 126.0, hit: false},
    {t: 145.6, hit: true},
    {t: 170.6, hit: true},
  ],
  hookText: 2.2,
  endText: 176.2,
  fadeOut: 179.4,
};
