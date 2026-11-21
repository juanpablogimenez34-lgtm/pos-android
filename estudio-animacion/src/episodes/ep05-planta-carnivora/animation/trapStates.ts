// Estados de las trampas (OPEN_IDLE, PREY_CONTACT, SECOND_TRIGGER, SNAP_CLOSING, INITIAL_CLOSED,
// SEALING, DIGESTION, REOPENING) como parámetros articulados en función del tiempo.
// Regla científica representada: un solo estímulo NO cierra la trampa; un segundo estímulo
// dentro de un intervalo breve sí. Más estímulos de la presa retenida conducen al sellado y a
// la digestión, que dura días (aquí se muestra acelerada y rotulada).
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {keys, pulse, track} from '../../../engine/timeline';
import {OPEN_STATE, TrapState} from '../anatomy/flytrap';
import {EV, storyT} from '../timeline';

export type TrapPhase = 'OPEN_IDLE' | 'PREY_CONTACT' | 'SECOND_TRIGGER' | 'SNAP_CLOSING' | 'INITIAL_CLOSED' | 'SEALING' | 'DIGESTION' | 'REOPENING';

/** Fase de la trampa protagonista (para rótulos e informe). */
export function heroPhase(t: number): TrapPhase {
  const s = storyT(t);
  if (s < EV.touch1) return 'OPEN_IDLE';
  if (s < EV.touch2) return 'PREY_CONTACT';
  if (s < EV.snap) return 'SECOND_TRIGGER';
  if (s < EV.snapEnd + 0.4) return 'SNAP_CLOSING';
  if (s < EV.sealStart) return 'INITIAL_CLOSED';
  if (s < EV.daysStart) return 'SEALING';
  if (s < EV.reopen) return 'DIGESTION';
  return 'REOPENING';
}

/** Índices de pelos: 0–2 lóbulo +1, 3–5 lóbulo −1. La mosca camina por el lóbulo del fondo. */
export const HAIR1 = 1; // pelo central
export const HAIR2 = 2;

// apertura de la trampa protagonista (tiempo de la historia)
const OPEN = keys([
  [0, 1], [EV.snap, 1, 'stop'], [EV.snapEnd, 0.24, 'stop'], [81, 0.2], [92, 0.17], [99, 0.11], [EV.sealStart, 0.08, 'stop'],
  [108, 0.0, 'stop'], [EV.reopen, 0.0, 'stop'], [121, 0.62], [126, 0.72], [150, 0.74], [180, 0.8],
]);

export function heroTrap(t: number): TrapState {
  const s = storyT(t);
  // cierre: interpolación rápida (≈ 0,1 s) entre las claves del chasquido
  let open = track(OPEN, s);
  if (s > EV.snap && s < EV.snapEnd) {
    const u = (s - EV.snap) / (EV.snapEnd - EV.snap);
    open = lerp(1, 0.24, u * u * (3 - 2 * u));
  }
  // la presa retenida sacude la trampa
  const twitch = EV.struggles.reduce((a, ts) => a + pulse(s, ts, ts + 0.5, 0.12) * 0.025, 0);
  open = clamp(open + twitch);
  // curvatura: se invierte durante el cierre (pandeo) y vuelve despacio al reabrirse
  const curv = s < EV.snap ? -1 : s < EV.snapEnd ? lerp(-1, 1, smoothstep(EV.snap, EV.snapEnd, s)) : s < EV.reopen ? 1 : lerp(1, -1, smoothstep(EV.reopen, 122, s));
  // cilios: hacia fuera (abierta) → entrecruzados (cerrada) → hacia fuera tras el sellado
  let cilia = 1;
  if (s >= EV.snap) cilia = lerp(1, -0.35, smoothstep(EV.snap, EV.snapEnd, s));
  if (s >= EV.snapEnd) cilia = lerp(-0.35, -1, smoothstep(EV.snapEnd, 81, s));
  if (s >= EV.sealStart) cilia = lerp(-1, 0.75, smoothstep(EV.sealStart, 108, s));
  if (s >= EV.reopen) cilia = lerp(0.75, 1, smoothstep(EV.reopen, 122, s));
  const seal = smoothstep(EV.sealStart, 108, s) * (1 - smoothstep(EV.reopen, 120, s));
  const glow = smoothstep(104, 107, s) * (1 - smoothstep(EV.reopen - 1, EV.reopen + 1, s));
  // pelos sensitivos: se doblan cuando la pata los toca
  const hairs = [0, 0, 0, 0, 0, 0];
  hairs[HAIR1] = 0.65 * pulse(s, EV.touch1 - 0.15, EV.touch1 + 0.45, 0.12);
  hairs[HAIR2] = 0.65 * pulse(s, EV.touch2 - 0.15, EV.touch2 + 0.35, 0.1);
  // señal eléctrica (visualización): AP1, repetición explicativa (64–70) y AP2
  let signal = 0;
  let signalOn = 0;
  const ap = (t0: number, dur: number) => {
    if (s >= t0 && s < t0 + dur + 0.4) {
      signal = clamp((s - t0) / dur);
      signalOn = Math.max(signalOn, 1 - smoothstep(t0 + dur, t0 + dur + 0.4, s));
    }
  };
  ap(EV.touch1 + 0.05, 1.0);
  ap(65.2, 1.4);
  ap(67.6, 1.4);
  ap(EV.touch2 + 0.05, 0.25);
  for (const ts of EV.struggles) ap(ts + 0.1, 0.8);
  const husk = s >= EV.reopen - 0.5 ? 1 : 0;
  return {open, curv, cilia, seal, hairs, glow, signal, signalOn: signalOn * (s >= EV.sealStart ? 0 : 1), husk, sway: s < EV.snap || s > 121 ? 1 : 0.15};
}

/** Resto de la roseta: variedad de estados (abiertas, una cerrada antigua, una reabriéndose). */
export function otherTrap(id: string, t: number): TrapState {
  if (id === 'T4') return {...OPEN_STATE, open: 0.02, curv: 1, cilia: 0.7, seal: 1, sway: 0.4};
  if (id === 'T6') return {...OPEN_STATE, open: 0.45 + 0.05 * smoothstep(0, 180, t), curv: 0.2, cilia: 0.9};
  if (id === 'T7' || id === 'T8') return {...OPEN_STATE, open: 0.8};
  return OPEN_STATE;
}
