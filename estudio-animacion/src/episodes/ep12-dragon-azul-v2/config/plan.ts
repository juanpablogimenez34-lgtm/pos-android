// EP05 v2 · EL DRAGÓN AZUL: LA CRIATURA QUE ROBA EL VENENO DE SUS PRESAS — plan del Estudio 2.0.
// Estructura de retención de 9 segmentos, gancho de 5 s y "beats" visuales (cambio significativo
// cada ≤ 15 s). Validado con scripts/check-retention.mjs.
import {Beat, EpisodePlan, STRUCTURE_180} from '../../../studio2/timeline';
import beatsData from './beats.json';

const TITLES: Record<string, string> = {
  hook: 'Gancho: se come una carabela',
  mystery: 'El misterio',
  reveal1: 'Primera revelación: una babosa marina',
  demo: 'Demostración: la caza',
  surprise2: 'Segunda sorpresa: armas intactas',
  deep: 'Cómo funciona un nematocisto',
  fact: 'Dato extraordinario: la flota azul',
  finalReveal: 'Revelación final: su picadura no es suya',
  close: 'Cierre y pregunta',
};

export const BEATS = beatsData.beats as Beat[];

export const PLAN: EpisodePlan = {
  id: 'ep05-dragon-azul-v2',
  title: 'EL DRAGÓN AZUL: LA CRIATURA QUE ROBA EL VENENO DE SUS PRESAS',
  duration: 180,
  fps: 30,
  segments: STRUCTURE_180.map((s) => ({...s, title: TITLES[s.kind]})),
  beats: BEATS,
  hook: {action: [0, 1], question: [1, 3], promise: [3, 5.2]},
};

/** Escala del dragón en el mundo (constante). */
export const DS = 1.2;
