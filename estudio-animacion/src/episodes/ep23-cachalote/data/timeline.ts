// CALENDARIO: 12 escenas × 15 s (450 fotogramas) = 5.400 fotogramas. Los eventos (EV) se comparten con la
// banda sonora (tools/audio/score_ep23_cachalote.py): si se cambia uno, cambiarlo también allí.
export const FPS = 30;
export const DURATION = 180;
const TITLES = [
  'El gigante invisible',
  'El gigante con dientes',
  'El cerebro más pesado',
  'El descenso',
  'Su sonar natural',
  'La presa en la oscuridad',
  'El encuentro con el calamar gigante',
  'Una caza enorme',
  'El regreso a la superficie',
  'Una familia de gigantes',
  'El lenguaje de los clics',
  'El último misterio',
];
export const SCENES = TITLES.map((title, i) => ({n: i + 1, title, start: i * 15, end: (i + 1) * 15}));

export const EV = {
  hookClick: 0.15, // clic fuerte sobre el ojo
  hookText: 3.0,
  blows: [45.6, 48.4, 131.0, 133.6], // soplos en superficie
  flukeUp: 50.5, // la cola emerge antes del descenso
  buzzStart: 85.0, // los clics se aceleran (zumbido)
  buzzEnd: 89.6,
  squidIn: 90.0,
  surface: 130.0,
  // codas (escena 11): instantes de inicio, alternando entre dos cachalotes; patrón ilustrativo «1+1+3»
  codas: [151.4, 153.0, 154.6, 156.2, 157.6, 159.0, 160.6, 162.2],
  codaPattern: [0, 0.24, 0.48, 0.6, 0.72],
  endFluke: 175.2,
  endText: 176.2,
  fadeOut: 179.4,
};
