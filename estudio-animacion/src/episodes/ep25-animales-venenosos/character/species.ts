// Especificaciones de cada especie para los motores por familia (cada una con su propio diseño).
import {CentipedeSpec, ScorpionSpec, SpiderSpec} from './Arthropods';
import {SnakeSpec} from './Snake';

export const KING_COBRA: SnakeSpec = {len: 1500, width: 30, base: '#6a6a3a', dark: '#2a2a16', belly: '#e0d4a0', pattern: 'chevrons', patA: '#e8dca0', head: 'cobra', mouth: '#e8c8c0', hood: true, fangs: 'front', headDark: '#5a5a30'};
export const BLACK_MAMBA: SnakeSpec = {len: 1400, width: 21, base: '#7a7a6a', dark: '#3a3a32', belly: '#c8c4a8', pattern: 'plain', patA: '#5a5a4a', head: 'mamba', mouth: '#141010', fangs: 'front', headDark: '#6a6a5c'};
export const INLAND_TAIPAN: SnakeSpec = {len: 1150, width: 24, base: '#9a6a3a', dark: '#4a2e18', belly: '#e8d0a0', pattern: 'speckle', patA: '#5a3a1e', head: 'taipan', mouth: '#e8c8b8', fangs: 'front', headDark: '#3a2414'};
export const GABOON_VIPER: SnakeSpec = {len: 900, width: 36, base: '#b89a70', dark: '#4a3420', belly: '#e8dcc0', pattern: 'gaboon', patA: '#e4cfa0', patB: '#6a3a2a', head: 'viper', mouth: '#f0e0e0', horns: true, fangs: 'long', headDark: '#b89a6e'};
export const WD_RATTLESNAKE: SnakeSpec = {len: 950, width: 30, base: '#a8987a', dark: '#4a3e2c', belly: '#e8e0c8', pattern: 'diamonds', patA: '#6a5a40', patB: '#efe6d0', head: 'viper', mouth: '#f0e0e0', rattle: true, fangs: 'long', headDark: '#8a7a5e'};

export const DEATHSTALKER: ScorpionSpec = {size: 120, body: '#d8c070', dark: '#6a5a28', tailThick: 0.9, tailLen: 1.15, clawW: 0.45, legLen: 1.0, telson: '#c8a858'};
export const FAT_TAIL: ScorpionSpec = {size: 120, body: '#c8a868', dark: '#5a4420', tailColor: '#8a6a3a', telson: '#3a2a1a', tailThick: 1.7, tailLen: 1.0, clawW: 0.6, legLen: 0.95};
export const BARK_SCORPION: ScorpionSpec = {size: 100, body: '#c8a878', dark: '#5a4428', tailThick: 0.7, tailLen: 1.45, clawW: 0.38, legLen: 1.15, stripes: true, telson: '#a88a5a'};

export const BLACK_WIDOW: SpiderSpec = {size: 60, body: '#151214', dark: '#050405', abdomen: '#100c0e', abdomenR: 1.5, legLen: 2.0, gloss: 0.55, mark: 'hourglass'};
export const FUNNEL_WEB: SpiderSpec = {size: 80, body: '#241a16', dark: '#0a0706', abdomen: '#1c1410', abdomenR: 1.0, legLen: 1.5, gloss: 0.5, bigChelicerae: true};
export const WANDERING: SpiderSpec = {size: 80, body: '#7a5a3a', dark: '#3a2818', abdomen: '#6a4a30', abdomenR: 1.0, legLen: 2.2, hairy: true, gloss: 0.12, legBands: '#1a1210'};

export const GIANT_CENTIPEDE: CentipedeSpec = {segments: 22, segLen: 26, width: 14, body: '#7a2a1a', dark: '#3a120a', legs: '#e8c060', head: '#6a2414'};
