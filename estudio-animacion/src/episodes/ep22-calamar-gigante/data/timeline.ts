// CALENDARIO: 12 escenas × 15 s (450 fotogramas) = 5.400 fotogramas. Los eventos (EV) se comparten con la
// banda sonora (tools/audio/score_ep22_calamar.py): si se cambia uno, cambiarlo también allí.
export const FPS = 30;
export const DURATION = 180;
const TITLES = [
  'El monstruo de las leyendas',
  'El gigante real',
  'El mundo sin sol',
  'Los ojos gigantes',
  'Ocho brazos y dos tentáculos',
  'La caza en la oscuridad',
  'El pico escondido',
  'El poder de su propulsión',
  'El enemigo gigante',
  'El encuentro en la oscuridad',
  'El descubrimiento científico',
  'El último misterio',
];
export const SCENES = TITLES.map((title, i) => ({n: i + 1, title, start: i * 15, end: (i + 1) * 15}));

export const EV = {
  hookStrike: 1.3, // los tentáculos se lanzan (gancho)
  hookCut: 3.0, // corte al plano general
  hookText: 3.0,
  huntStrike: 86.0, // caza (escena 6)
  jets: [106.0, 107.4, 108.8, 111.0, 112.2, 113.4, 116.0, 117.0], // impulsos del sifón (escena 8)
  whaleIn: 125.0,
  threat: 130.0,
  strobes: [153.0, 154.5, 156.0, 157.5, 159.0, 160.5, 162.0, 163.5], // destellos de la cámara científica
  baitStrike: 161.5,
  endText: 176.2,
  fadeOut: 179.4,
};
