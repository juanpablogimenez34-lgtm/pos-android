// CALENDARIO: introducción 10 s + 20 animales × 8 s + cierre 10 s = 180 s (5.400 fotogramas, 22 secuencias).
// Los eventos se comparten con la banda sonora (tools/audio/score_ep25_venenosos.py).
export const FPS = 30;
export const DURATION = 180;
export type Animal = {n: number; name: string; sci: string; start: number; habitat: 'jungle' | 'desert' | 'forest' | 'ocean' | 'river'};
const LIST: [string, string, Animal['habitat']][] = [
  ['COBRA REAL', 'Ophiophagus hannah (complejo de especies)', 'jungle'],
  ['MAMBA NEGRA', 'Dendroaspis polylepis', 'desert'],
  ['TAIPÁN DEL INTERIOR', 'Oxyuranus microlepidotus', 'desert'],
  ['VÍBORA DE GABÓN', 'Bitis gabonica', 'forest'],
  ['CASCABEL DIAMANTE OCCIDENTAL', 'Crotalus atrox', 'desert'],
  ['ESCORPIÓN AMARILLO', 'Leiurus quinquestriatus', 'desert'],
  ['ESCORPIÓN DE COLA GRUESA', 'Androctonus australis', 'desert'],
  ['ESCORPIÓN DE ARIZONA', 'Centruroides sculpturatus', 'desert'],
  ['VIUDA NEGRA', 'Latrodectus mactans', 'forest'],
  ['ARAÑA DE EMBUDO DE SÍDNEY', 'Atrax robustus', 'forest'],
  ['ARAÑA ERRANTE BRASILEÑA', 'Phoneutria nigriventer', 'jungle'],
  ['AVISPA DE MAR', 'Chironex fleckeri', 'ocean'],
  ['PULPO DE ANILLOS AZULES', 'Hapalochlaena lunulata', 'ocean'],
  ['PEZ PIEDRA', 'Synanceia verrucosa', 'ocean'],
  ['CARACOL CONO GEOGRÁFICO', 'Conus geographus', 'ocean'],
  ['PEZ LEÓN', 'Pterois volitans', 'ocean'],
  ['RAYA COMÚN', 'Dasyatis pastinaca', 'ocean'],
  ['MONSTRUO DE GILA', 'Heloderma suspectum', 'desert'],
  ['ORNITORRINCO (MACHO)', 'Ornithorhynchus anatinus', 'river'],
  ['CIEMPIÉS GIGANTE', 'Scolopendra gigantea', 'jungle'],
];
export const ANIMALS: Animal[] = LIST.map(([name, sci, habitat], i) => ({n: i + 1, name, sci, habitat, start: 10 + i * 8}));
export const INTRO = {start: 0, end: 10};
export const OUTRO = {start: 170, end: 180};
export const EV = {
  title: 3.0, // «20 ANIMALES VENENOSOS»
  rattle: [44.0, 50.0], // cascabel (escena 5)
  surfaceIn: 98.0, // la cámara atraviesa el agua (avispa de mar)
  surfaceOut: 146.0, // vuelta a tierra (monstruo de Gila)
  river: 154.0, // río del ornitorrinco
  endText: 176.6,
  fadeOut: 179.4,
};
