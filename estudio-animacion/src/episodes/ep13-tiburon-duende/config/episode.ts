// EL TIBURÓN DUENDE: LA CRIATURA QUE DISPARA SU MANDÍBULA — 180 s · 30 fps · 5.400 fotogramas.
// 12 escenas con las duraciones del encargo; instantes de la narración MEDIDOS
// (narration/narration-timing.json) y coherentes con tools/audio/score_ep13_goblin.py.
export const FPS = 30;
export const DURATION = 180;
const RAW: [number, number, string][] = [
  [0, 8, 'Gancho: la boca imposible'],
  [8, 22, 'El mundo de las profundidades'],
  [22, 38, 'Una apariencia extraordinaria'],
  [38, 54, 'El hocico que detecta presas'],
  [54, 70, 'La caza en la oscuridad'],
  [70, 88, 'El ataque extraordinario'],
  [88, 104, 'Cómo funciona su mandíbula'],
  [104, 120, 'Un cazador de aguas profundas'],
  [120, 136, '¿Es peligroso para los humanos?'],
  [136, 152, 'Un linaje antiguo'],
  [152, 168, 'El misterio continúa'],
  [168, 180, 'Final cinematográfico'],
];
export const SCENES = RAW.map(([start, end, title], i) => ({n: i + 1, start, end, startFrame: start * FPS, endFrame: end * FPS - 1, title}));
export const sceneAt = (t: number) => SCENES.find((s) => t >= s.start && t < s.end) ?? SCENES[SCENES.length - 1];
/** Eventos (s). */
export const EV = {
  hookStrike: 1.0, // máxima extensión del gancho
  freeze: [1.0, 1.45] as const, // congelación breve
  hookCut: [2.42, 2.62] as const, // corte rápido a negro
  realStrike: 74.6,
  slow: [78.4, 84.4] as const, // repetición a cámara lenta
  logo: 174.6,
  tagline: 176.2,
  fade: [179.4, 180] as const,
};
/** Escala del tiburón en el mundo (constante; los cambios de tamaño son de cámara o de distancia). */
export const SS = 1.0;
