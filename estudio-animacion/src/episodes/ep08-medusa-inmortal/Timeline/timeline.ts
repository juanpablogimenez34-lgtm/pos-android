// Línea de tiempo del Ep. 08 (180 s, 30 fps). Escenas según la estructura del guion; los instantes
// de las frases salen de Script/narration-timing.json (duraciones MEDIDAS de la locución).
export const FPS = 30;
export const DURATION = 180;
export const SCENES = [
  {n: 1, start: 0, end: 8, title: 'Impacto inmediato'},
  {n: 2, start: 8, end: 25, title: 'Una medusa diminuta'},
  {n: 3, start: 25, end: 45, title: 'El secreto'},
  {n: 4, start: 45, end: 71, title: 'La transformación'},
  {n: 5, start: 71, end: 96, title: 'Un nuevo comienzo'},
  {n: 6, start: 96, end: 120, title: '¿Es inmortal?'},
  {n: 7, start: 120, end: 145, title: 'La ciencia'},
  {n: 8, start: 145, end: 165, title: 'Revelación'},
  {n: 9, start: 165, end: 180, title: 'Cierre'},
];
export const sceneAt = (t: number) => SCENES.find((s) => t >= s.start && t < s.end) ?? SCENES[SCENES.length - 1];
/** Escenas ya implementadas (las demás se construyen tras aprobar la demo). */
export const IMPLEMENTED = 2;
export const EV = {
  title: 4.4, // "¿PUEDE REJUVENECER?" (golpe sonoro en tools/audio/score_ep08.py)
  tease: 5.6, // empieza a transformarse (adelanto)
  name: 15.4, // Turritopsis dohrnii
  stomach: 21.3, // estómago rojo
};
