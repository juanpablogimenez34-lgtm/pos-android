// Línea de tiempo del videoclip: escenas asignadas a las secciones REALES de la canción.
// Las acciones dentro de cada escena se expresan en compases/pulsos detectados.
import {BAR, beatAfter, sec, SONG_FRAMES} from '../MusicSync/songMap';

export const FPS = 30;
export const FRAMES = SONG_FRAMES;

const S = {
  intro: sec('intro'),
  v1: sec('verse1'),
  v1b: sec('verse1b'),
  cd: sec('countdown'),
  c1: sec('chorus1'),
  brk: sec('break'),
  v2: sec('verse2'),
  zumi: sec('zumi'),
  hold: sec('hold'),
  c2: sec('chorus2'),
  inter: sec('interlude'),
  v3: sec('verse3'),
  outro: sec('outro'),
};
export const SEC = S;

export type SceneId = 'room' | 'countdown' | 'flight' | 'moon' | 'zumi' | 'montage' | 'descent' | 'home';
export const SCENES: {id: SceneId; start: number; end: number; title: string}[] = [
  {id: 'room', start: 0, end: S.cd.start, title: 'Introducción · Construimos el cohete'},
  {id: 'countdown', start: S.cd.start, end: S.c1.start + BAR * 2, title: 'Cuenta regresiva'},
  {id: 'flight', start: S.c1.start + BAR * 2, end: S.brk.end, title: 'Viaje espacial (estribillo 1)'},
  {id: 'moon', start: S.v2.start, end: S.zumi.start, title: 'La Luna de queso'},
  {id: 'zumi', start: S.zumi.start, end: S.c2.start, title: 'Encuentro con Zumi'},
  {id: 'montage', start: S.c2.start, end: S.inter.start, title: 'Segundo estribillo'},
  {id: 'descent', start: S.inter.start, end: S.v3.start, title: 'Regreso'},
  {id: 'home', start: S.v3.start, end: 1e9, title: 'Regreso a casa y final'},
];
export const sceneAt = (t: number) => SCENES.find((s) => t >= s.start && t < s.end) ?? SCENES[SCENES.length - 1];

/** Cuenta regresiva: los 5 números en los últimos 5 pulsos antes del estribillo; el "cero" en su primer tiempo. */
const zero = S.c1.start;
export const COUNT_TIMES = [-5, -4, -3, -2, -1].map((n) => beatAfter(zero - 0.01, n));
export const LIFTOFF = zero;

/** Construcción del cohete (estrofa 1), en compases desde el inicio de la estrofa. */
const v = S.v1.start;
export const BUILD = {
  walnut: v + BAR * 0.5,
  cut: [v + BAR * 1.5, v + BAR * 5.5] as [number, number],
  fin1: v + BAR * 4,
  fin2: S.v1b.start + BAR * 0.5,
  fin3: S.v1b.start + BAR * 1.5,
  window: S.v1b.start + BAR * 2.5,
  nose: S.v1b.start + BAR * 3.5,
  tape: S.v1b.start + BAR * 4.2,
  stars: S.v1b.start + BAR * 4.8,
  helmet: S.v1b.start + BAR * 3.0, // el colador se convierte en casco de juego
  lights: S.cd.start - BAR * 0.5,
};
