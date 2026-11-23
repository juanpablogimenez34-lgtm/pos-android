// CALENDARIO: 12 escenas × 15 s × 30 fps = 5.400 fotogramas. Los eventos (EV) se comparten con la
// banda sonora (tools/audio/score_ep19_anguila.py): si se cambia uno, cambiarlo también allí.
export const FPS = 30;
export const DURATION = 180;
const TITLES = [
  'El depredador eléctrico',
  'La revelación',
  'La batería viviente',
  'Los 860 voltios',
  'El sexto sentido',
  'La presa escondida',
  'El ataque',
  'El movimiento imposible',
  'Necesita respirar aire',
  'La defensa eléctrica',
  'El secreto de su poder',
  'El final',
];
export const SCENES = TITLES.map((title, i) => ({n: i + 1, title, start: i * 15, end: (i + 1) * 15}));

export const EEL = {len: 1100, n: 28, height: 78};

export const EV = {
  hookDetect: 0.9,
  hookShock: 1.8,
  hookText: 3.0,
  hookCapture: 9.0,
  organs: 30.5,
  electrocytes: 38.4,
  gaugeStart: 46.0,
  gaugePeak: 51.5,
  locate: 63.0,
  ping: 82.0,
  attack: 96.5,
  capture: 99.6,
  retreat: 110.2,
  forward: 114.5,
  surface: 129.2,
  threat: 135.5,
  defense: 142.5,
  power: 150.5,
  endText: 176.4,
  fadeOut: 179.4,
};
