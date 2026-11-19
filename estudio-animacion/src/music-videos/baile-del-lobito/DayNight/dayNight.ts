// CICLO DÍA → NOCHE. `tod` continuo: 0 mañana · 1 tarde · 2 atardecer · 3 noche.
// Todos los colores del bosque se calculan a partir de aquí: la transición es gradual.
import {clamp, mixColor} from '../../../engine/math';

type Key = {top: string; mid: string; bottom: string; ambient: string; ambK: number; sun: string; light: string; fog: string};
const KEYS: Key[] = [
  {top: '#8fd0ff', mid: '#cfeeff', bottom: '#fff0c8', ambient: '#fff2d0', ambK: 0.06, sun: '#fff4c0', light: '#fff6dc', fog: '#d6efff'},
  {top: '#5fb4ff', mid: '#a8dcff', bottom: '#fff4c4', ambient: '#ffe39a', ambK: 0.08, sun: '#ffe9a0', light: '#fff0c0', fog: '#c4e6ff'},
  {top: '#5a4c9e', mid: '#e28a8a', bottom: '#ffb96a', ambient: '#ff9a50', ambK: 0.2, sun: '#ff8a40', light: '#ffc890', fog: '#f0a890'},
  {top: '#0c1036', mid: '#2a2466', bottom: '#4a3478', ambient: '#2a2a7a', ambK: 0.42, sun: '#f4f2ff', light: '#b8c4ff', fog: '#3a3a7a'},
];
export type DN = Key & {tod: number; night: number; stars: number; fireflies: number; sunUp: number; moonUp: number; birds: number};

export function dayNight(tod: number): DN {
  const t = clamp(tod, 0, 3);
  const i = Math.min(2, Math.floor(t));
  const k = t - i;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const m = (x: keyof Key) => mixColor(a[x] as string, b[x] as string, k);
  const night = clamp(t - 2);
  return {
    top: m('top'),
    mid: m('mid'),
    bottom: m('bottom'),
    ambient: m('ambient'),
    ambK: a.ambK + (b.ambK - a.ambK) * k,
    sun: m('sun'),
    light: m('light'),
    fog: m('fog'),
    tod: t,
    night,
    stars: clamp((t - 2.3) / 0.6),
    fireflies: clamp((t - 2.4) / 0.5),
    sunUp: 1 - clamp((t - 1.9) / 0.6),
    moonUp: clamp((t - 2.2) / 0.7),
    birds: 1 - clamp((t - 2.2) / 0.5),
  };
}

/** Tiñe un color del decorado con la luz ambiente del momento del día. */
export const tint = (c: string, dn: DN, extra = 0) => mixColor(c, dn.ambient, Math.min(0.85, dn.ambK + extra * dn.night));
/** Atmósfera: los objetos lejanos se acercan al color del cielo. */
export const haze = (c: string, dn: DN, depthK: number) => mixColor(tint(c, dn), dn.fog, depthK);
