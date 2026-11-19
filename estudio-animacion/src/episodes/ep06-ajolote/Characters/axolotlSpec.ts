// FICHA DE PERSONAJE — ajolote mexicano (Ambystoma mexicanum).
// Una sola base anatómica para los dos ajolotes; solo cambian el color y el carácter.
// Unidad del mundo ≈ 0,2 mm: el ajolote mide L = 1000 u (≈ 20 cm, un adulto típico).
//
// Reglas de continuidad (no cambian en ningún plano):
//  - cabeza ancha y aplanada; ojos pequeños, oscuros y sin párpados; boca amplia
//  - 3 pares de branquias externas con filamentos plumosos
//  - 4 extremidades: 4 dedos en cada mano anterior, 5 en cada pie posterior
//  - cola comprimida lateralmente con aleta caudal continua (dorsal desde el lomo)
//  - piel lisa y húmeda con surcos costales en los flancos
//  - EXTREMIDAD QUE SE REGENERA: la ANTERIOR IZQUIERDA del ajolote rosado ("LF").
//    Es la del lado izquierdo del animal (no de la pantalla): el rig la identifica por su lado
//    anatómico, así que no cambia aunque la cámara gire o el animal mire hacia el otro lado.

export type LimbId = 'LF' | 'RF' | 'LH' | 'RH';

export type AxolotlColors = {
  body: string;
  belly: string;
  dark: string; // sombra del dorso / contorno
  spots: string | null; // moteado (silvestre)
  flecks: string | null; // puntos claros (silvestre)
  gill: string;
  gillTip: string;
  eye: string;
  fin: string;
  digit: string;
};

export type AxolotlSpec = {
  id: string;
  L: number;
  colors: AxolotlColors;
  seed: number;
  /** Perfil del cuerpo: [s (0 hocico → 1 punta de la cola), semiancho, semialto] (fracciones de L). */
  profile: [number, number, number][];
  /** Aleta dorsal y ventral: [s, altura extra] (fracciones de L). */
  finTop: [number, number][];
  finBottom: [number, number][];
  gillS: number; // posición de la base de las branquias
  shoulderS: number;
  hipS: number;
  /** Longitudes de los segmentos de las extremidades (fracciones de L). */
  fore: {upper: number; lower: number; palm: number; digits: number[]};
  hind: {upper: number; lower: number; palm: number; digits: number[]};
  gills: {len: number; up: number; out: number}[]; // 3 ramas por lado (de arriba abajo)
};

const PROFILE: [number, number, number][] = [
  [0.0, 0.026, 0.022],
  [0.025, 0.058, 0.035],
  [0.07, 0.075, 0.038],
  [0.115, 0.074, 0.041],
  [0.16, 0.056, 0.042],
  [0.22, 0.058, 0.05],
  [0.32, 0.062, 0.056],
  [0.43, 0.058, 0.054],
  [0.51, 0.05, 0.05],
  [0.58, 0.036, 0.047],
  [0.7, 0.024, 0.041],
  [0.85, 0.013, 0.029],
  [1.0, 0.002, 0.008],
];

const BASE = {
  L: 1000,
  profile: PROFILE,
  finTop: [[0.18, 0], [0.3, 0.008], [0.5, 0.02], [0.68, 0.036], [0.86, 0.032], [0.97, 0.012], [1, 0]] as [number, number][],
  finBottom: [[0.56, 0], [0.64, 0.014], [0.76, 0.026], [0.9, 0.02], [1, 0]] as [number, number][],
  gillS: 0.13,
  shoulderS: 0.215,
  hipS: 0.505,
  fore: {upper: 0.07, lower: 0.062, palm: 0.02, digits: [0.024, 0.033, 0.034, 0.026]},
  hind: {upper: 0.076, lower: 0.066, palm: 0.024, digits: [0.022, 0.031, 0.037, 0.035, 0.024]},
  gills: [
    {len: 0.13, up: 0.85, out: 0.4},
    {len: 0.115, up: 0.4, out: 0.65},
    {len: 0.095, up: 0.0, out: 0.8},
  ],
};

/** Protagonista: variedad leucística rosada (ilustrativa). */
export const PINK: AxolotlSpec = {
  ...BASE,
  id: 'rosado',
  seed: 7,
  colors: {body: '#f3c9c6', belly: '#fbe3dd', dark: '#c98f8f', spots: null, flecks: null, gill: '#d9485f', gillTip: '#f27a8a', eye: '#17100f', fin: '#fbe0dc', digit: '#efbcb6'},
};

/** Ajolote silvestre: marrón oscuro con moteado irregular (más representativo del hábitat). */
export const WILD: AxolotlSpec = {
  ...BASE,
  id: 'silvestre',
  seed: 23,
  colors: {body: '#4f4636', belly: '#6d6450', dark: '#2a241b', spots: '#211c14', flecks: '#a59a72', gill: '#5e3b42', gillTip: '#8a5a60', eye: '#0b0908', fin: '#5d5544', digit: '#3e3629'},
};

export const REGEN_LIMB: LimbId = 'LF';
