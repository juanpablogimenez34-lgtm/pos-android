// SISTEMA DE MOVIMIENTO DEL NARVAL. Reutiliza las trayectorias Catmull-Rom y la fase integrada del motor de la orca
// (propulsión por batido VERTICAL de la caudal; la columna se flexiona arriba/abajo, nunca de lado como un tiburón).
// Estados: RESTING, SWIMMING, EXPLORING, DIVING, SURFACING, BREATHING, ACCELERATING, FISH_TRACKING, TUSK_STRIKE,
// HUNTING, COMMUNICATING, FEEDING, CALF_SWIMMING.
// CAZA CON EL COLMILLO en 10 fases (cámara lenta a partir de la 5.ª): detección, aproximación, seguimiento, ajuste de
// postura, movimiento lateral de la cabeza, contacto del colmillo, reacción del pez (aturdido, sin heridas),
// reorientación, acercamiento a la boca y captura por succión. El colmillo golpea de lado: NO se usa como lanza.
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {Key, pathAt, phaseOf} from '../../orca-reina-oceanos/character/motion';
import {NarwhalPose} from './Narwhal';

export type {Key};
export {pathAt, phaseOf};
export type NState = 'RESTING' | 'SWIMMING' | 'EXPLORING' | 'DIVING' | 'SURFACING' | 'BREATHING' | 'ACCELERATING' | 'FISH_TRACKING' | 'TUSK_STRIKE' | 'HUNTING' | 'COMMUNICATING' | 'FEEDING' | 'CALF_SWIMMING';
type Kind = NarwhalPose['kind'];

/** Pose de natación a lo largo de una trayectoria (mundo: superficie en y = 0). */
export function nswim(keys: Key[], t: number, o: {kind: Kind; scale: number; seed?: number; under?: number; age?: number; tusk?: number; extra?: Partial<NarwhalPose>; maxPitch?: number}): NarwhalPose {
  const p = pathAt(keys, t);
  const sp = Math.hypot(p.vx, p.vy);
  const facing: 1 | -1 = p.vx >= 0 ? 1 : -1;
  const pitch = clamp(Math.atan2(p.vy, Math.abs(p.vx) + 40), -(o.maxPitch ?? 0.9), o.maxPitch ?? 0.9);
  const calf = o.kind === 'calf';
  return {
    x: p.x, y: p.y, angle: facing > 0 ? pitch : -pitch, scale: o.scale, facing, kind: o.kind, t,
    phase: phaseOf(keys, t, calf ? 0.75 : 0.42, 0.0012, o.seed ?? 0),
    amp: clamp(0.4 + sp * 0.0016, 0.35, 1.3),
    flipN: clamp(-p.vy * 0.0006, -0.4, 0.4), flipF: clamp(-p.vy * 0.0005, -0.4, 0.4) + 0.1,
    eye: {x: 0.4, y: 0}, under: o.under ?? 1, age: o.age ?? (calf ? 0 : 1), tusk: o.tusk ?? 0,
    ...(o.extra ?? {}),
  };
}

// ------------------------------------------------------------------ caza con el colmillo
export const STRIKE_NAMES = ['DETECCIÓN', 'APROXIMACIÓN', 'SEGUIMIENTO', 'AJUSTE DE POSTURA', 'MOVIMIENTO LATERAL', 'CONTACTO DEL COLMILLO', 'REACCIÓN DEL PEZ', 'REORIENTACIÓN', 'ACERCAMIENTO A LA BOCA', 'CAPTURA'];
const DUR = [1.1, 1.3, 1.1, 0.8, 0.7, 0.35, 0.9, 0.9, 1.0, 0.85];
/** Fase actual (0–9; 10 = terminado) y su progreso. `slow` multiplica las fases 5–10 (cámara lenta). */
export function strikeAt(t: number, t0: number, slow = 1) {
  let s = t0;
  for (let i = 0; i < 10; i++) {
    const d = DUR[i] * (i >= 4 ? slow : 1);
    if (t < s + d) return {i, k: clamp((t - s) / d), s, e: s + d};
    s += d;
  }
  return {i: 10, k: 1, s, e: s};
}
export const strikeLen = (slow = 1) => DUR.reduce((a, d, i) => a + d * (i >= 4 ? slow : 1), 0);
/** Inicio de la fase i. */
export const strikePhaseStart = (t0: number, i: number, slow = 1) => t0 + DUR.slice(0, i).reduce((a, d, j) => a + d * (j + 0 >= 4 ? slow : 1), 0);

/**
 * Coreografía común: devuelve, para el instante t, el giro lateral de la cabeza (`yaw`, + hacia el lado del pez),
 * la distancia relativa al pez (1 = lejos … 0 = boca sobre el pez), el aturdimiento del pez, la mandíbula y
 * si el pez ya fue tragado. La geometría concreta (vista lateral o aérea) se resuelve en cada escena.
 */
export function strikeChoreo(t: number, t0: number, slow = 1) {
  const P = strikeAt(t, t0, slow);
  const ps = (i: number) => strikePhaseStart(t0, i, slow);
  const tEnd = t0 + strikeLen(slow);
  // giro de cabeza: preparación hacia fuera (fase 5) y barrido rápido a través del pez (fase 6)
  const wind = smoothstep(ps(4), ps(5), t);
  const sweep = smoothstep(ps(5), ps(6), t);
  const settle = smoothstep(ps(6), ps(7) + 0.3 * slow, t);
  const yaw = -0.55 * wind * (1 - sweep) + 0.45 * sweep * (1 - settle);
  // distancia (tip-to-fish normalizada)
  const dist = t < ps(1) ? 1 : t < ps(2) ? lerp(1, 0.45, smoothstep(ps(1), ps(2), t)) : t < ps(7) ? 0.45 : t < ps(8) ? 0.45 : lerp(0.45, 0, smoothstep(ps(8), ps(9), t));
  const contact = t >= ps(5) + DUR[5] * slow * 0.55;
  const stun = contact ? clamp((t - (ps(5) + DUR[5] * slow * 0.55)) / (0.5 * slow)) : 0;
  const jaw = smoothstep(ps(9) - 0.2 * slow, ps(9) + 0.25 * slow, t) * (1 - smoothstep(ps(9) + 0.55 * slow, tEnd, t));
  const suck = smoothstep(ps(9) + 0.05 * slow, ps(9) + 0.5 * slow, t);
  const eaten = t > ps(9) + 0.5 * slow;
  const flash = contact ? clamp(1 - (t - (ps(5) + DUR[5] * slow * 0.55)) / (0.35 * slow)) : 0;
  return {P, yaw, dist, stun, jaw, suck, eaten, flash, contactT: ps(5) + DUR[5] * slow * 0.55, tEnd, ps};
}
export const _k = {lerp};
