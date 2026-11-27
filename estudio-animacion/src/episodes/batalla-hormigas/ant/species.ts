// ESPECIES (vista lateral, unidades locales: longitud del cuerpo L = 1000, origen en el centro del mesosoma,
// mirando hacia +x, suelo por debajo). Proporciones relativas por especie; el tamaño real se aplica con la escala
// (1 mm = PX_MM px), de modo que la carpintera de 10 mm mide el doble que la de fuego de 5 mm en todo el video.
//  · Camponotus pennsylvanicus (obrera mayor): cabeza grande, ojos ovales, antena acodada de 12 artejos, mesosoma
//    de perfil dorsal arqueado y continuo, pecíolo de UN nudo en forma de escama, gáster grande negro con
//    pubescencia dorada, acidoporo en el extremo (SIN aguijón).
//  · Solenopsis invicta (obrera): cabeza castaño rojiza, ojos pequeños, antena de 10 artejos con MAZA de 2,
//    mesosoma rojizo, cintura de DOS nudos (pecíolo y pospecíolo), gáster más oscuro con AGUIJÓN.
export type V = {x: number; y: number};
export type LegSpec = {base: V; coxa: number; troch: number; femur: number; tibia: number; tarsus: number; rest: number; coxaAng: number; tarsAng: number};
export type AntSpec = {
  id: 'black' | 'red';
  name: string;
  mm: number; // tamaño de la simulación
  colors: {body: string; dark: string; light: string; gaster: string; gasterLight: string; leg: string; legLight: string; eye: string; hair: string; mand: string};
  head: {c: V; rx: number; ry: number; neck: V};
  eye: {c: V; rx: number; ry: number};
  mand: {base: V; len: number; teeth: number};
  ant: {base: V; scape: number; seg: number; n: number; club: number};
  meso: {front: number; back: number; top: number; bottom: number; hump: number};
  waist: {c: V; rx: number; ry: number}[]; // 1 (Camponotus) o 2 (Solenopsis) nudos
  gaster: {joint: V; c: V; rx: number; ry: number; bands: number};
  sting: boolean;
  legs: LegSpec[]; // 0 delantera, 1 media, 2 trasera (se dibujan a ambos lados)
  ground: number; // altura del centro del cuerpo sobre el suelo (local)
  stride: number;
};
export const PX_MM = 60;

export const BLACK: AntSpec = {
  id: 'black', name: 'Camponotus pennsylvanicus', mm: 10,
  colors: {body: '#16120f', dark: '#050403', light: '#4a4038', gaster: '#14100d', gasterLight: '#5a4a36', leg: '#1e1612', legLight: '#5a463a', eye: '#2a2622', hair: '#d8b878', mand: '#2a1a12'},
  head: {c: {x: 330, y: -30}, rx: 150, ry: 130, neck: {x: 210, y: -20}},
  eye: {c: {x: 360, y: -70}, rx: 40, ry: 30},
  mand: {base: {x: 455, y: 30}, len: 140, teeth: 5},
  ant: {base: {x: 430, y: -95}, scape: 260, seg: 26, n: 11, club: 0},
  meso: {front: 215, back: -175, top: -120, bottom: 45, hump: 60},
  waist: [{c: {x: -210, y: -40}, rx: 30, ry: 60}],
  gaster: {joint: {x: -235, y: 5}, c: {x: -455, y: 0}, rx: 240, ry: 180, bands: 4},
  sting: false,
  legs: [
    {base: {x: 160, y: 40}, coxa: 75, troch: 30, femur: 300, tibia: 300, tarsus: 240, rest: 420, coxaAng: 2.0, tarsAng: 0.35},
    {base: {x: 20, y: 40}, coxa: 60, troch: 28, femur: 310, tibia: 310, tarsus: 250, rest: 60, coxaAng: 1.75, tarsAng: 1.0},
    {base: {x: -110, y: 35}, coxa: 65, troch: 30, femur: 340, tibia: 350, tarsus: 270, rest: -360, coxaAng: 1.35, tarsAng: 2.75},
  ],
  ground: 470, stride: 300,
};
export const RED: AntSpec = {
  id: 'red', name: 'Solenopsis invicta', mm: 5,
  colors: {body: '#8a3a1e', dark: '#4a1a0c', light: '#d8784a', gaster: '#3a1a10', gasterLight: '#8a4a2a', leg: '#9a4a26', legLight: '#d88a5a', eye: '#1a0e0a', hair: '#e8b890', mand: '#6a2a14'},
  head: {c: {x: 310, y: -15}, rx: 135, ry: 115, neck: {x: 200, y: -10}},
  eye: {c: {x: 350, y: -40}, rx: 22, ry: 18},
  mand: {base: {x: 430, y: 35}, len: 120, teeth: 4},
  ant: {base: {x: 410, y: -70}, scape: 230, seg: 28, n: 8, club: 2},
  meso: {front: 200, back: -150, top: -85, bottom: 45, hump: 30},
  waist: [{c: {x: -185, y: -30}, rx: 34, ry: 46}, {c: {x: -250, y: -22}, rx: 38, ry: 44}],
  gaster: {joint: {x: -280, y: 0}, c: {x: -470, y: 5}, rx: 205, ry: 158, bands: 4},
  sting: true,
  legs: [
    {base: {x: 150, y: 40}, coxa: 70, troch: 26, femur: 255, tibia: 240, tarsus: 190, rest: 380, coxaAng: 2.0, tarsAng: 0.35},
    {base: {x: 20, y: 40}, coxa: 55, troch: 24, femur: 260, tibia: 250, tarsus: 200, rest: 50, coxaAng: 1.75, tarsAng: 1.0},
    {base: {x: -100, y: 35}, coxa: 60, troch: 26, femur: 280, tibia: 280, tarsus: 215, rest: -320, coxaAng: 1.35, tarsAng: 2.75},
  ],
  ground: 400, stride: 260,
};
/** Longitud total (mandíbulas cerradas a punta del gáster) en unidades locales. */
export const spanOf = (s: AntSpec) => s.mand.base.x + s.mand.len * 0.6 - (s.gaster.c.x - s.gaster.rx);
/** Escala de dibujo para que la especie mida `mm` milímetros (a zoom 1). */
export const scaleFor = (s: AntSpec, mm = s.mm) => (mm * PX_MM) / spanOf(s);
