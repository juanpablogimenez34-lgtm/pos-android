// CALENDARIO: 60 s · 1.800 fotogramas · 8 escenas (eventos compartidos con la banda sonora).
export const FPS = 30;
export const DURATION = 60;
const DEF: [number, number, string][] = [
  [0, 5, 'El delfín imposible'],
  [5, 12, 'El habitante del Amazonas'],
  [12, 22, '¿Por qué es rosado?'],
  [22, 32, 'El cuello extraordinario'],
  [32, 42, 'Puede detectar lo que no ve'],
  [42, 51, 'El cazador del bosque'],
  [51, 56, 'La revelación'],
  [56, 60, 'Cierre'],
];
export const SCENES = DEF.map(([start, end, title], i) => ({n: i + 1, title, start, end}));
export const EV = {
  gap: 1.6, // atraviesa el hueco entre dos troncos
  look: 3.2, // mira a la cámara
  crossSurface: [8.0, 9.6] as [number, number], // la cámara atraviesa la superficie
  clicks: [34.8, 41.6] as [number, number],
  detect: 43.4,
  turn: 44.4,
  catch: 48.7,
  surface: 53.6, // asoma y respira
  breath: 54.0,
  dive: 56.2,
};
