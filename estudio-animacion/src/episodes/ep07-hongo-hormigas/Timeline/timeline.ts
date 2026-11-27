// EPISODIO 07 — "El hongo que controla a las hormigas" (180 s = 5.400 fotogramas).
// Línea de tiempo maestra: escenas, instantes clave y etapas del hongo.
import {clamp, smoothstep} from '../../../engine/math';

export const FPS = 30;
export const DURATION = 180;

export const SCENES = [
  {n: 1, start: 0, end: 20, title: 'UNA COLONIA EN MOVIMIENTO'},
  {n: 2, start: 20, end: 45, title: 'UNA AMENAZA INVISIBLE'},
  {n: 3, start: 45, end: 70, title: 'LA INFECCIÓN'},
  {n: 4, start: 70, end: 95, title: 'EL COMPORTAMIENTO CAMBIA'},
  {n: 5, start: 95, end: 120, title: 'LA ÚLTIMA MORDIDA'},
  {n: 6, start: 120, end: 150, title: 'EL HONGO EMERGE'},
  {n: 7, start: 150, end: 180, title: 'EL CICLO CONTINÚA'},
];

/** Instantes clave (compartidos con tools/audio/score_ep07.py). */
export const EV = {
  micro1: 27.0, // paso a escala microscópica (esporas)
  sporeTouch: 40.6, // la espora se adhiere a la cutícula
  micro2: 52.4, // visualización interna
  micro2Out: 65.0,
  leaveRoute: 70.0,
  climb: 77.0,
  grip: 103.4, // comienza la fijación
  clamp: 105.4, // las mandíbulas se cierran sobre la nervadura
  dead: 116.4,
  days: 120.4, // salto temporal
  sporeRelease: 158.0,
  colonyFinal: 173.0,
  final: 174.8,
};

/** Etapas del hongo (para el indicador en pantalla y el informe). */
export const FUNGUS_STAGES = ['SPORE', 'GERMINATION', 'INFECTION', 'INTERNAL_GROWTH', 'BEHAVIORAL_MANIPULATION', 'HOST_DEATH', 'FRUITING_BODY', 'SPORE_RELEASE'] as const;
export const FUNGUS_LABEL: Record<(typeof FUNGUS_STAGES)[number], string> = {
  SPORE: 'espora',
  GERMINATION: 'germinación',
  INFECTION: 'infección',
  INTERNAL_GROWTH: 'crecimiento interno',
  BEHAVIORAL_MANIPULATION: 'alteración del comportamiento',
  HOST_DEATH: 'muerte del hospedador',
  FRUITING_BODY: 'cuerpo fructífero',
  SPORE_RELEASE: 'liberación de esporas',
};
export function fungusStage(t: number): (typeof FUNGUS_STAGES)[number] | null {
  if (t < 33.6) return null;
  if (t < EV.sporeTouch) return 'SPORE';
  if (t < 43.2) return 'GERMINATION';
  if (t < 56) return 'INFECTION';
  if (t < EV.leaveRoute) return 'INTERNAL_GROWTH';
  if (t < EV.dead) return 'BEHAVIORAL_MANIPULATION';
  if (t < 128) return 'HOST_DEATH';
  if (t < EV.sporeRelease) return 'FRUITING_BODY';
  if (t < 173) return 'SPORE_RELEASE';
  return null;
}

/** Desarrollo externo del hongo sobre el cadáver (acelerado tras "DÍAS DESPUÉS"). */
export function fungusAt(t: number) {
  return {
    hyphae: smoothstep(124.5, 131, t),
    stalk: clamp(0.15 * smoothstep(129, 132, t) + 0.85 * smoothstep(131.5, 148, t)),
    ascoma: smoothstep(137.5, 149, t),
  };
}

/**
 * Tiempo de animación de la protagonista: cámara lenta puntual (×0,35) en la mordida
 * (104,8–106,8 s) y recuperación rápida hasta 108 s, cuando ya está inmóvil.
 */
export function animT(t: number) {
  if (t < 104.8) return t;
  if (t < 106.8) return 104.8 + (t - 104.8) * 0.35;
  if (t < 108) return 105.5 + ((t - 106.8) / 1.2) * 2.5;
  return t;
}
