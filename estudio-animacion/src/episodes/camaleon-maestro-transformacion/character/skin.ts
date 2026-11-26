// SISTEMA DE TRANSFORMACIÓN CROMÁTICA del camaleón pantera (Furcifer pardalis).
// La piel se divide en REGIONES (base, barras verticales, franja lateral, cabeza, labios, torreta ocular,
// vientre/garganta, cola, patas). Cada región interpola entre paletas naturales de la especie con su propio
// retardo y una onda que recorre el cuerpo (de la cabeza a la cola o al revés): el cambio es progresivo y
// orgánico, nunca un filtro uniforme. Las paletas corresponden a variantes reales de la especie
// (verdes de reposo, turquesa/azul, barras rojas y cabeza naranja-amarilla de excitación, oscurecimiento por estrés).
import {clamp, mixColor, smoothstep} from '../../../engine/math';

export type Region = 'base' | 'bar' | 'stripe' | 'head' | 'lip' | 'eye' | 'eyeLine' | 'belly' | 'tail' | 'leg' | 'crest' | 'spot';
export type Palette = Record<Region, string>;

export const PALETTES = {
  rest: {base: '#3c9f62', bar: '#2f8452', stripe: '#cfe9bc', head: '#4fb072', lip: '#e2efbc', eye: '#3e9a5e', eyeLine: '#d9c54a', belly: '#93cf8f', tail: '#3a965d', leg: '#3a925a', crest: '#9ad18a', spot: '#2a6e44'},
  turquoise: {base: '#22a89a', bar: '#2c7fb8', stripe: '#e4f6ee', head: '#3cc0a8', lip: '#f0fae8', eye: '#2a9cae', eyeLine: '#f0d040', belly: '#8ad8c4', tail: '#2a96a6', leg: '#2a98a0', crest: '#c8f0dc', spot: '#1a6a8a'},
  blue: {base: '#2a7fc4', bar: '#1c5a9a', stripe: '#dff2ff', head: '#3fa2dc', lip: '#a6e2ff', eye: '#2a78bc', eyeLine: '#9ad8ff', belly: '#76c0e6', tail: '#2670b0', leg: '#2a74b4', crest: '#b8e4ff', spot: '#163e7a'},
  excited: {base: '#1fae94', bar: '#d6322a', stripe: '#f6f2e2', head: '#f0a428', lip: '#fff6e8', eye: '#e2582c', eyeLine: '#ffd23a', belly: '#f2c454', tail: '#d84a30', leg: '#2ea086', crest: '#ffd27a', spot: '#a01e1e'},
  display: {base: '#c6c03a', bar: '#e2602a', stripe: '#fff4d6', head: '#f2cc3a', lip: '#ffffff', eye: '#e8742a', eyeLine: '#fff07a', belly: '#f2d66a', tail: '#e06a2c', leg: '#b8b43a', crest: '#fff0a0', spot: '#b03a1c'},
  dark: {base: '#3e4636', bar: '#1c1e16', stripe: '#9a9878', head: '#4a5040', lip: '#bdb89c', eye: '#3a4232', eyeLine: '#8a8a5a', belly: '#5c604a', tail: '#343a2c', leg: '#3a4030', crest: '#7a7c60', spot: '#14160f'},
  hatchling: {base: '#8b8a6a', bar: '#6c6a50', stripe: '#cfc9ad', head: '#9a987a', lip: '#d6d0b8', eye: '#8a8868', eyeLine: '#c8c08a', belly: '#b6b094', tail: '#7e7c60', leg: '#86846a', crest: '#bcb898', spot: '#58563e'},
  juvenile: {base: '#6f9a5c', bar: '#5a7e48', stripe: '#d6e2b8', head: '#7aa864', lip: '#e2e8c4', eye: '#6c9656', eyeLine: '#d4c66a', belly: '#a8c48c', tail: '#66905a', leg: '#6a9058', crest: '#b8d098', spot: '#46663a'},
} satisfies Record<string, Palette>;
export type PaletteName = keyof typeof PALETTES;

/** Retardo de cada región (las barras y la cabeza reaccionan antes; el vientre y la cola después). */
const LAG: Record<Region, number> = {bar: 0, head: 0.06, eye: 0.08, eyeLine: 0.04, lip: 0.1, crest: 0.12, base: 0.18, stripe: 0.2, spot: 0.1, leg: 0.28, belly: 0.3, tail: 0.34};

export type ColorState = {from: PaletteName; to: PaletteName; k: number; wave?: 1 | -1};

/** Color de una región en la posición normalizada x ∈ [0, 1] (0 cola · 1 hocico). */
export function skin(cs: ColorState, region: Region, x: number) {
  const A = PALETTES[cs.from][region];
  const B = PALETTES[cs.to][region];
  if (cs.k <= 0) return A;
  if (cs.k >= 1) return B;
  const wave = cs.wave ?? 1;
  const pos = wave > 0 ? 1 - clamp(x) : clamp(x); // la onda nace en la cabeza (wave = 1)
  const local = clamp(cs.k * 1.75 - LAG[region] * 1.2 - pos * 0.45);
  return mixColor(A, B, smoothstep(0, 1, local));
}

/** Secuencia de estados: lista de [t, paleta] con transiciones de duración d. */
export function colorTrack(keys: [number, PaletteName, number?][], t: number): ColorState {
  let i = 0;
  while (i < keys.length - 1 && t >= keys[i + 1][0]) i++;
  const cur = keys[i];
  const prev = keys[Math.max(0, i - 1)];
  const d = cur[2] ?? 3;
  if (i === 0) return {from: cur[1], to: cur[1], k: 1};
  return {from: prev[1], to: cur[1], k: clamp((t - cur[0]) / d), wave: i % 2 ? 1 : -1};
}
