// MOVIMIENTO DEL TIBURÓN: natación por trayectorias (motor de la orca: Catmull-Rom + fase integrada) y SALTO
// (emboscada desde abajo: aceleración, ruptura de la superficie, vuelo balístico en cámara lenta, reentrada).
import {clamp, lerp} from '../../../engine/math';
import {Key, pathAt, phaseOf} from '../../orca-reina-oceanos/character/motion';
import {SharkPose} from './WhiteShark';

export type {Key};
export {pathAt};
export function sharkSwim(keys: Key[], t: number, scale: number, extra: Partial<SharkPose> = {}, seed = 0, maxPitch = 0.9): SharkPose {
  const p = pathAt(keys, t);
  const sp = Math.hypot(p.vx, p.vy);
  const facing: 1 | -1 = p.vx >= 0 ? 1 : -1;
  const pitch = clamp(Math.atan2(p.vy, Math.abs(p.vx) + 30), -maxPitch, maxPitch);
  return {x: p.x, y: p.y, angle: facing > 0 ? pitch : -pitch, scale, facing, t, phase: phaseOf(keys, t, 0.35, 0.0016, seed), amp: clamp(0.5 + sp * 0.0016, 0.4, 1.5), look: {x: 1, y: clamp(p.vy / 300, -0.6, 0.6)}, ...extra};
}
/** Salto: el tiburón sale del agua en x0 (superficie y = 0) en el instante tExit; `slow` alarga el vuelo. */
export function breach(t: number, tExit: number, x0: number, o: {scale: number; slow?: number; dir?: 1 | -1; v?: number}) {
  const slow = o.slow ?? 1;
  const dir = o.dir ?? 1;
  const v = o.v ?? 1300; // px/s al salir
  const g = 2600;
  const a0 = -1.15; // ángulo de salida (casi vertical)
  const vx = Math.cos(a0) * v * dir * 0.55;
  const vy = Math.sin(a0) * v;
  const tAir = (-2 * vy) / g;
  const tEntry = tExit + tAir * slow;
  if (t < tExit) {
    // ascenso desde la profundidad, acelerando
    const k = clamp((t - (tExit - 2.2)) / 2.2);
    const e = k * k;
    const x = x0 - vx * 0.9 * (1 - e) * 1.2;
    const y = lerp(1100, 0, e);
    return {x, y, angle: dir > 0 ? a0 : -a0, stage: 'rise' as const, air: false, tEntry, tAir, k};
  }
  const dt = Math.min(t - tExit, tAir * slow) / slow;
  const x = x0 + vx * dt;
  const y = vy * dt + 0.5 * g * dt * dt;
  const ang = Math.atan2(vy + g * dt, vx);
  if (t <= tEntry) return {x, y, angle: dir > 0 ? ang : ang - Math.PI, stage: 'air' as const, air: true, tEntry, tAir, k: 1};
  const after = t - tEntry;
  const ex = x0 + vx * tAir;
  return {x: ex + vx * 0.3 * Math.min(after, 1.5), y: Math.min(700, after * 500), angle: (dir > 0 ? 1 : -1) * Math.max(0.2, 1.0 - after * 0.5), stage: 'dive' as const, air: false, tEntry, tAir, k: 1};
}
