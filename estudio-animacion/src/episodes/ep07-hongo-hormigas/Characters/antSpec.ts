// FICHA DE CONTINUIDAD — protagonista y colonia.
// Especie: hormiga carpintera Camponotus rufipes (Sudamérica), obrera sin alas.
// Hospedadora documentada de Ophiocordyceps camponoti-rufipedis (complejo O. unilateralis),
// descrito en la Mata Atlántica de Brasil (Evans et al., 2011).
// Unidad del mundo: 0,1 mm. La obrera mide ≈ 95 u (≈ 9,5 mm).
//
// No cambian en ningún plano:
//  - cabeza grande y redondeada, 2 mandíbulas articuladas, 2 ojos compuestos laterales
//  - 2 antenas ACODADAS (escapo largo + funículo de 6 segmentos visibles)
//  - mesosoma (pronoto + propodeo), pecíolo con nodo, gáster con 4 segmentos visibles
//  - 6 patas (fémur, tibia, tarso), SIN alas
//  - color: cuerpo negro brillante y patas pardo-rojizas ("rufipes" = de patas rojas);
//    pelos dorados finos y escasos en el gáster

export type AntColors = {body: string; light: string; leg: string; legDark: string; antenna: string; mandible: string; hair: string; eye: string};

export type AntSpec = {id: string; scale: number; colors: AntColors; seed: number};

export const RUFIPES: AntColors = {body: '#1c1917', light: '#7a6e64', leg: '#8e3c20', legDark: '#4f1f10', antenna: '#3a2216', mandible: '#5e2a14', hair: '#c9a466', eye: '#2a2a2c'};

/** Protagonista (obrera exploradora). */
export const HERO: AntSpec = {id: 'protagonista', scale: 1, colors: RUFIPES, seed: 3};

/** Colonia: mismas proporciones y colores; leves diferencias de tamaño (obreras polimórficas). */
export const COLONY: AntSpec[] = [
  {id: 'c1', scale: 0.92, colors: RUFIPES, seed: 11},
  {id: 'c2', scale: 1.05, colors: RUFIPES, seed: 17},
  {id: 'c3', scale: 0.88, colors: RUFIPES, seed: 23},
  {id: 'c4', scale: 0.97, colors: RUFIPES, seed: 29},
  {id: 'c5', scale: 1.02, colors: RUFIPES, seed: 31},
];

/** Apoyos de las 6 patas (adelante, lateral) y grupo del trípode alterno (L1-R2-L3 / R1-L2-R3). */
export const ANT_LEGS: {fwd: number; side: number; group: 0 | 1}[] = [
  {fwd: 30, side: 17, group: 0}, // L1
  {fwd: 30, side: -17, group: 1}, // R1
  {fwd: 5, side: 24, group: 1}, // L2
  {fwd: 5, side: -24, group: 0}, // R2
  {fwd: -21, side: 22, group: 0}, // L3
  {fwd: -21, side: -22, group: 1}, // R3
];
export const ANT_STRIDE = 20;
export const ANT_BODY_H = 11;
