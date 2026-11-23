// Ayudas compartidas por las escenas: columna del mixino que repta, poros que liberan, etc.
import {bodyOnPath, makePath, P3, Path, smoothPts, Spine} from '../motion/path';
import {HAG} from '../data/timeline';

export const pathOf = (ctrl: P3[]) => makePath(smoothPts(ctrl, 16));

/** Mixino reptando/nadando: `freq` en Hz de la onda lateral. */
export const crawl = (path: Path, sHead: number, t: number, amp = 14, waves = 1.4, freq = 1.1, len = HAG.len, n = HAG.n): Spine =>
  bodyOnPath(path, sHead, len, n, {amp, waves, phase: t * freq * Math.PI * 2});

/** Puntos de poros (costado) en ciertas fracciones del cuerpo. */
export const poresAt = (sp: Spine, fr: number[]) => fr.map((u) => {
  const p = sp[Math.round(u * (sp.length - 1))];
  return {x: p.x, y: p.y + 6};
});

/** Cabeza (punto y ángulo de avance). */
export const headOf = (sp: Spine) => ({x: sp[0].x, y: sp[0].y, ang: Math.atan2(sp[0].y - sp[2].y, sp[0].x - sp[2].x)});
