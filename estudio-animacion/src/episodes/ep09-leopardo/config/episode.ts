// EP04 · EL LEOPARDO — EL FANTASMA DE LA SELVA. 180 s · 30 fps · 5.400 fotogramas.
// 12 escenas de 15 s. Los instantes de las frases salen de script/narration-timing.json
// (duraciones MEDIDAS de la locución); los eventos visuales se alinean con ellas.
export const FPS = 30;
export const DURATION = 180;
export const SCENES = [
  'El fantasma aparece',
  'Camuflaje perfecto',
  'El cazador silencioso',
  'El ataque',
  'El rey de los árboles',
  'Fuerza extraordinaria',
  'Los ojos de la noche',
  'Un felino solitario',
  'Una madre protectora',
  'Maestro de la adaptación',
  'Un futuro incierto',
  'El último encuentro',
].map((title, i) => ({n: i + 1, start: i * 15, end: (i + 1) * 15, title}));
export const sceneAt = (t: number) => SCENES[Math.min(11, Math.max(0, Math.floor(t / 15)))];
/** Eventos clave (coinciden con tools/audio/score_ep09_leopardo.py). */
export const EV = {title: 11.6, runStart: 46.2, jump: 51.6, land: 53.2, climb: 61.5, branch: 72, final: 174};
