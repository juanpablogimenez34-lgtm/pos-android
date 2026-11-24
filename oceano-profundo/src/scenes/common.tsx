// Piezas compartidas por las escenas.
import React from 'react';
import {Cam, layerT, toScreen} from '../camera/camera';

export type SceneOut = {svg: React.ReactNode; overlay?: React.ReactNode; depth?: number; grade?: {vignette?: number; tint?: string; tintK?: number; warm?: number}};
export type SceneFn = (t: number) => SceneOut;
export {layerT, toScreen};
export type {Cam};
/** Combina dos escenas en un fundido encadenado (sin cortes bruscos de luz). */
export const xfade = (a: SceneFn, b: SceneFn, at: number, d: number): SceneFn => (t) => {
  const u = (t - at) / d;
  if (u <= 0) return a(t);
  if (u >= 1) return b(t);
  const e = u * u * (3 - 2 * u);
  const A = a(t);
  const B = b(t);
  return {svg: <g>{A.svg}<g opacity={e}>{B.svg}</g></g>, overlay: e < 0.5 ? A.overlay : B.overlay, depth: e < 0.5 ? A.depth : B.depth, grade: e < 0.5 ? A.grade : B.grade};
};
/** Cambia de plano dentro de una escena con fundido corto. shots: [inicio, fn]. */
export const cuts = (shots: [number, SceneFn][], d = 0.6): SceneFn => (t) => {
  let i = 0;
  while (i + 1 < shots.length && t >= shots[i + 1][0]) i++;
  const cur = shots[i][1];
  if (i + 1 < shots.length && t > shots[i + 1][0] - d) return xfade(cur, shots[i + 1][1], shots[i + 1][0] - d, d)(t);
  return cur(t);
};
