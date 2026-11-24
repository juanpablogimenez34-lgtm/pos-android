// CALENDARIO: 60 s · 1.800 fotogramas · 8 escenas. Los eventos (EV) se comparten con la banda sonora
// (tools/audio/score_camaron_pistola.py): cada chasquido real, la reconstrucción en cámara ultralenta y el destello.
export const FPS = 30;
export const DURATION = 60;
const DEF: [number, number, string][] = [
  [0, 5, 'Dispara sin balas'],
  [5, 12, 'El camarón pistola'],
  [12, 20, 'El mecanismo'],
  [20, 30, 'Cavitación'],
  [30, 40, 'El colapso'],
  [40, 50, 'La caza'],
  [50, 56, 'Física como arma'],
  [56, 60, 'Otra presa'],
];
export const SCENES = DEF.map(([start, end, title], i) => ({n: i + 1, title, start, end}));
export const EV = {
  hookSnap: 1.0, // cierre de la pinza en el gancho
  hookCollapse: 1.42, // colapso de la burbuja (gancho, cámara lenta)
  clawOpen3: 14.6, // abre la pinza (escena 3)
  snap3: 18.2, // chasquido (escena 3, velocidad real)
  // escena 4 · reconstrucción en cámara ultralenta
  slowClose: [20.6, 22.0] as [number, number], // el dáctilo se cierra
  jet: 22.0, // chorro de agua
  bubbleForm: 23.0, // caída de presión → burbuja
  bubbleMax: 25.2,
  collapse4: 26.6, // colapso
  // escena 5 · colapso microscópico
  microCollapse: 35.55, // destello diminuto + onda de choque
  snap6: 41.4, // chasquido que aturde a la presa
  clawOpen8: 57.2, // otra presa: abre la pinza (pose del fotograma 0)
};
/** Chasquidos con sonido real (velocidad normal). */
export const SNAPS = [EV.hookSnap, EV.snap3, EV.snap6];
