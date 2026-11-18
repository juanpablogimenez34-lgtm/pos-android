import {mixColor} from '../../engine/math';

// Paleta cinematográfica submarina: azules profundos, turquesa, esmeralda,
// violeta oscuro y una luz dorada suave que entra desde la superficie.
export const UW = {
  surface: '#9af0e2',
  shallow: '#1ea9ad',
  mid: '#0b6385',
  deep: '#073456',
  abyss: '#0a1638',
  violet: '#2b1850',
  violetDeep: '#150b2c',
  fog: '#0e5874',
  gold: '#ffd58a',
  goldSoft: '#ffe9bf',
  turquoise: '#3fd6c6',
  emerald: '#16956c',
  emeraldDark: '#0b4e45',
  olive: '#7c9a3c',
  rockLit: '#6f9a92',
  rockMid: '#36586a',
  rockDark: '#1c2747',
  rockShadow: '#120c27',
  sandLit: '#d2c193',
  sand: '#8a957c',
  sandDark: '#38505a',
  coralRed: '#e2574c',
  coralOrange: '#f08a4b',
  coralPink: '#e46aa0',
  coralViolet: '#9b5bd6',
  sponge: '#d9a23c',
};

/** Perspectiva atmosférica: mezcla un color con el agua según la distancia. */
export const fog = (c: string, amount: number) => mixColor(c, UW.fog, amount);
