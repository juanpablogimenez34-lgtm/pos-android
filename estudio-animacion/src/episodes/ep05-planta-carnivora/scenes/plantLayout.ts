// Disposición de la roseta: hojas de distintos tamaños y orientaciones (unidades de 0,1 mm).
// T1 es la trampa protagonista (captura); T2 queda abierta al final; T7 y T8 son hojas jóvenes.
import {TrapSpec} from '../anatomy/flytrap';

export const TRAPS: TrapSpec[] = [
  {id: 'T6', angle: -1.65, petiole: 250, petioleW: 70, rise: 60, elev: 0.5, tilt: 0.1, L: 190, W: 87, red: 0.55, seed: 61},
  {id: 'T3', angle: -2.45, petiole: 290, petioleW: 80, rise: 55, elev: 0.38, tilt: -0.15, L: 220, W: 101, red: 0.5, seed: 31},
  {id: 'T4', angle: -0.75, petiole: 300, petioleW: 82, rise: 60, elev: 0.4, tilt: 0.12, L: 230, W: 106, red: 0.8, seed: 41},
  {id: 'T2', angle: 0.32, petiole: 320, petioleW: 88, rise: 62, elev: 0.36, tilt: 0.05, L: 245, W: 113, red: 0.7, seed: 21},
  {id: 'T1', angle: Math.PI - 0.38, petiole: 340, petioleW: 92, rise: 70, elev: 0.32, tilt: 0.0, L: 285, W: 131, red: 0.92, seed: 11},
  {id: 'T7', angle: 2.25, petiole: 150, petioleW: 46, rise: 40, elev: 0.7, tilt: 0.2, L: 110, W: 51, red: 0.3, seed: 71},
  {id: 'T8', angle: 0.95, petiole: 140, petioleW: 44, rise: 38, elev: 0.75, tilt: -0.2, L: 100, W: 46, red: 0.25, seed: 81},
  {id: 'T5', angle: 1.62, petiole: 230, petioleW: 64, rise: 48, elev: 0.45, tilt: 0.0, L: 165, W: 76, red: 0.6, seed: 51},
];
export const HERO = 'T1';
