// CALENDARIO EXACTO: 12 escenas × 15 s × 30 fps = 450 fotogramas cada una → 5.400 fotogramas.
export const FPS = 30;
export const DURATION = 180;
export const SCENE_LEN = 15;
const TITLES = [
  'El dragón existe',
  'Revelación del pez remo',
  'Un cuerpo extraordinario',
  'El océano profundo',
  'Su forma de nadar',
  'Un cazador de organismos pequeños',
  'La serpiente de las leyendas',
  'El misterio de los terremotos',
  '¿Puede predecir terremotos?',
  'Un encuentro casi imposible',
  'El verdadero misterio',
  'Final impactante',
];
export const SCENES = TITLES.map((title, i) => ({n: i + 1, title, start: i * SCENE_LEN, end: (i + 1) * SCENE_LEN, startFrame: i * SCENE_LEN * FPS, endFrame: (i + 1) * SCENE_LEN * FPS - 1}));
/** Escala del pez en el mundo (constante entre escenas). */
export const OS = 1;
export const EV = {flash: 2.9, title: [0.5, 3.4] as const, endText: 173.6, channel: 175.4, fade: [179.45, 180] as const};
