// MOVIMIENTO DE LA MEDUSA (Turritopsis dohrnii), determinista.
// Natación por chorro: la campana se contrae rápido (expulsa agua → impulso) y se relaja despacio
// (se rellena). La velocidad sube tras cada contracción y decae por el rozamiento; las corrientes
// la desplazan lateralmente; ante el peligro las contracciones se aceleran y los tentáculos se recogen.
import {clamp, easeInOut} from '../../../engine/math';

export const PULSE_T0 = 1.0; // primera contracción (igual que tools/audio/score_ep08.py)
export const PULSE_PERIOD = 1.6;

/** Fase de contracción 0…1: 1 = campana totalmente contraída. Rápida al cerrar, lenta al abrir. */
export function contraction(t: number, period = PULSE_PERIOD, t0 = PULSE_T0): number {
  const ph = ((((t - t0) / period) % 1) + 1) % 1;
  if (ph < 0.28) return easeInOut(ph / 0.28);
  return 1 - easeInOut((ph - 0.28) / 0.72);
}
/** Impulso tras cada contracción (0…1), con decaimiento suave. */
export function thrust(t: number, period = PULSE_PERIOD, t0 = PULSE_T0): number {
  const ph = ((((t - t0) / period) % 1) + 1) % 1;
  return ph < 0.18 ? Math.sin((ph / 0.18) * Math.PI * 0.5) : Math.exp(-(ph - 0.18) * 4.5);
}
/** Avance acumulado (en unidades de "pulsos"): sube a saltos suaves con cada contracción. */
export function strokes(t: number, period = PULSE_PERIOD, t0 = PULSE_T0): number {
  const n = (t - t0) / period;
  const i = Math.floor(n);
  const ph = n - i;
  // integral aproximada del impulso: casi todo el avance ocurre en el primer 40 % del ciclo
  return i + 1 - Math.exp(-ph * 5.2) * (1 - ph * 0.05);
}

export type JellyPose = {
  x: number;
  y: number;
  scale: number;
  rot: number; // inclinación del eje (rad): 0 = boca hacia abajo, nadando hacia arriba
  contract: number; // 0 relajada · 1 contraída
  vx: number; // velocidad (para el arrastre de tentáculos)
  vy: number;
  current: number; // corriente lateral (−1…1)
  retract: number; // 0 tentáculos extendidos · 1 recogidos
  alarm: number; // 0 tranquila · 1 reacción al peligro
  glow: number; // intensidad de la luz de contorno
  t: number;
  tentacles?: number; // nº de tentáculos dibujados
  young?: number; // 0 adulta · 1 juvenil recién liberada (más pequeña, menos tentáculos)
};

export const jellyPose = (o: Partial<JellyPose> = {}): JellyPose => ({x: 0, y: 0, scale: 1, rot: 0, contract: 0, vx: 0, vy: 0, current: 0, retract: 0, alarm: 0, glow: 0.6, t: 0, ...o});

/** Nado tranquilo a lo largo de una dirección: cada contracción la empuja `step` unidades. */
export function swim(t: number, o: {x0: number; y0: number; dir: number; step: number; period?: number; t0?: number; current?: number; scale?: number; glow?: number}): JellyPose {
  const period = o.period ?? PULSE_PERIOD;
  const t0 = o.t0 ?? PULSE_T0;
  const s = strokes(t, period, t0);
  const th = thrust(t, period, t0);
  const c = o.current ?? 0;
  const dx = Math.sin(o.dir);
  const dy = -Math.cos(o.dir);
  const sway = Math.sin(t * 0.7) * 14;
  return jellyPose({
    t,
    x: o.x0 + dx * s * o.step + c * t * 18 + sway,
    y: o.y0 + dy * s * o.step + Math.sin(t * 0.9) * 6,
    rot: o.dir + Math.sin(t * 0.6) * 0.08 + c * 0.12,
    contract: contraction(t, period, t0),
    vx: dx * th * o.step * 1.2 + c * 20,
    vy: dy * th * o.step * 1.2,
    current: c + Math.sin(t * 0.45) * 0.25,
    scale: o.scale ?? 1,
    glow: o.glow ?? 0.6,
  });
}

/** Reacción al peligro: contracciones rápidas, tentáculos recogidos, giro de huida. u 0…1. */
export function alarmed(p: JellyPose, k: number): JellyPose {
  const a = clamp(k);
  return {...p, alarm: a, retract: Math.max(p.retract, 0.55 * a), contract: Math.max(p.contract, a * (0.5 + 0.5 * Math.abs(Math.sin(p.t * 9)))), rot: p.rot + 0.4 * a * Math.sin(p.t * 1.3)};
}
