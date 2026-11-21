// EP05 · EL DRAGÓN AZUL — LA CRIATURA QUE PARECE DE OTRO PLANETA. 180 s · 30 fps · 5.400 fotogramas.
// 12 escenas de 15 s (450 fotogramas). Los instantes salen de narration/narration-timing.json
// (duraciones MEDIDAS de la locución) y coinciden con tools/audio/score_ep11_dragon.py.
export const FPS = 30;
export const DURATION = 180;
export const SCENES = [
  'Un dragón real',
  '¿Qué es realmente?',
  'El mundo al revés',
  'El secreto de sus colores',
  'Una presa peligrosa',
  'Robar las armas',
  'Pequeño, pero no inofensivo',
  'Un viajero del océano',
  'Una anatomía extraordinaria',
  'La vida en miniatura',
  'Belleza y peligro',
  'El último dragón',
].map((title, i) => ({n: i + 1, start: i * 15, end: (i + 1) * 15, startFrame: i * 450, endFrame: (i + 1) * 450 - 1, title}));
export const sceneAt = (t: number) => SCENES[Math.min(11, Math.max(0, Math.floor(t / 15)))];
/** Eventos clave del gancho y del cierre. */
export const EV = {hookText: [0.1, 2.3] as const, size: [2.3, 4.9] as const, manowar: 4.9, flash: 8.0, logo: 177.1, fade: [179.45, 180] as const};
/** Escala del dragón en el mundo: constante en todo el episodio. */
export const DS = 1.2;
