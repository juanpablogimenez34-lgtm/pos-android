// MÓDULO DE EPISODIOS CONECTADOS: una línea temporal principal de 140 s (4.200 fotogramas) y 4 episodios de 35 s
// que la recorren. Cada composición individual usa el FOTOGRAMA GLOBAL correspondiente, de modo que personajes,
// aletas, colas, cámara, luz, partículas y coreografía continúan exactamente donde terminó el episodio anterior.
export const FPS = 30;
export const EP_SEC = 35;
export const EP_FRAMES = EP_SEC * FPS; // 1050
export const TOTAL_SEC = 140;
export const TOTAL_FRAMES = TOTAL_SEC * FPS; // 4200
export const EPISODES = [
  {n: 1, id: 'Battle01Episode01', title: 'El encuentro', file: 'orca-vs-tiburon-01-el-encuentro.mp4'},
  {n: 2, id: 'Battle01Episode02', title: 'El primer ataque', file: 'orca-vs-tiburon-02-el-primer-ataque.mp4'},
  {n: 3, id: 'Battle01Episode03', title: 'La estrategia secreta', file: 'orca-vs-tiburon-03-la-estrategia-secreta.mp4'},
  {n: 4, id: 'Battle01Episode04', title: 'El vencedor', file: 'orca-vs-tiburon-04-el-vencedor.mp4'},
].map((e, i) => ({...e, startFrame: i * EP_FRAMES, endFrame: (i + 1) * EP_FRAMES - 1, start: i * EP_SEC, end: (i + 1) * EP_SEC}));
export type Variant = 'episodios' | 'completo';
export const episodeOf = (t: number) => Math.min(3, Math.max(0, Math.floor(t / EP_SEC)));
