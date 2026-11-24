// CALENDARIO: 12 escenas × 15 s (450 fotogramas) = 5.400 fotogramas. Los eventos (EV) se comparten con la
// banda sonora (tools/audio/score_ep24_tiburon.py): si se cambia uno, cambiarlo también allí.
export const FPS = 30;
export const DURATION = 180;
const TITLES = [
  'El tiburón de cuatro siglos',
  'El gigante de las aguas heladas',
  'El comienzo de una vida extraordinaria',
  'Los siglos pasan',
  'El secreto de su lentitud',
  'Más de un siglo para madurar',
  '¿Cómo consigue alimento?',
  'El misterio de sus ojos',
  '¿Cómo sabemos su edad?',
  'El descubrimiento de los 392 años',
  'Sobrevivir en un mundo cambiante',
  'El viajero del tiempo',
];
export const SCENES = TITLES.map((title, i) => ({n: i + 1, title, start: i * 15, end: (i + 1) * 15}));

export const EV = {
  hookHit: 0.0, // impacto musical sobre el ojo
  hookShip: 3.4, // transición al barco de madera + texto
  backDown: 10.0, // la cámara vuelve a bajar al tiburón
  arcticDive: 19.0, // la cámara atraviesa la superficie
  ageMorph: [40.5, 44.8], // cría → juvenil
  ships: [45.0, 49.0, 53.0, 57.0], // siglo XVII · XVIII · XIX · vuelta al tiburón (mayor)
  growth: [80.0, 85.0],
  maturity: 85.5, // gráfico de ~150 años
  feed: 102.8, // la boca se abre ante el alimento
  lab: 125.0,
  lens: 130.0,
  num392: 140.0,
  range: 145.0,
  montage: [170.0, 171.25, 172.5, 173.75], // barcos de distintas épocas (cierre)
  endText: 176.0,
  fadeOut: 179.4,
};
