// SISTEMA DE DESCENSO: profundidad del recorrido (metros) en función del tiempo, zonas oceánicas y valores
// físicos aproximados. El descenso es una REPRESENTACIÓN NARRATIVA ACELERADA (no una inmersión real de 10 min).
//  · Presión ≈ 1 atm (aire) + 1 atm por cada 10 m de agua (aproximación usada en divulgación).
//  · Temperatura: perfil típico del Pacífico occidental tropical (aprox.); en la zona hadal aumenta levemente por
//    compresión adiabática (≈ 2,4–2,5 °C cerca del fondo del abismo Challenger).
//  · Profundidad final: 10.935 m (medición de 2021, ±6 m). Otras mediciones: ≈10.924–10.925 m (2019–2020) y
//    10.984 m (cartografía multihaz de 2010).
import {clamp, lerp, smoothstep} from '../../../engine/math';

export const CHALLENGER = 10935;
// [t (s), metros] — monótona: el contador siempre aumenta (salvo la pausa final en el fondo)
export const DEPTH_KEYS: [number, number][] = [
  [0, 0], [30, 0], [34, 3], [45, 60], [60, 200],
  [75, 330], [90, 520], [105, 760], [120, 1000],
  [135, 1250], [150, 1500], [165, 1750], [180, 2000],
  [195, 2250], [210, 2500], [225, 2750], [240, 3000],
  [255, 3250], [270, 3500], [285, 3750], [300, 4000],
  [315, 4500], [330, 5000], [345, 5500], [360, 6000],
  [375, 6250], [390, 6500], [405, 6750], [420, 7000],
  [435, 7300], [450, 7600], [465, 7900], [480, 8200],
  [495, 8650], [510, 9100], [525, 9550], [540, 10000],
  [550, 10600], [558, 10880], [564, CHALLENGER], [600, CHALLENGER],
];
/** Profundidad (m) en el instante t: interpolación monótona (Fritsch–Carlson) para que el ritmo varíe sin saltos. */
const slopes = (() => {
  const k = DEPTH_KEYS;
  const n = k.length;
  const d = k.slice(0, -1).map((a, i) => (k[i + 1][1] - a[1]) / (k[i + 1][0] - a[0]));
  const m = k.map((_, i) => (i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const tau = 3 / Math.sqrt(s);
      m[i] = tau * a * d[i];
      m[i + 1] = tau * b * d[i];
    }
  }
  return m;
})();
export function depthAt(t: number): number {
  const k = DEPTH_KEYS;
  if (t <= k[0][0]) return k[0][1];
  if (t >= k[k.length - 1][0]) return k[k.length - 1][1];
  let i = 0;
  while (i < k.length - 2 && t > k[i + 1][0]) i++;
  const h = k[i + 1][0] - k[i][0];
  const u = (t - k[i][0]) / h;
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1;
  const h10 = u ** 3 - 2 * u ** 2 + u;
  const h01 = -2 * u ** 3 + 3 * u ** 2;
  const h11 = u ** 3 - u ** 2;
  return h00 * k[i][1] + h10 * h * slopes[i] + h01 * k[i + 1][1] + h11 * h * slopes[i + 1];
}
export type Zone = {id: string; name: string; range: string};
export function zoneOf(d: number): Zone {
  if (d < 200) return {id: 'epi', name: 'ZONA EPIPELÁGICA · ILUMINADA', range: '0–200 m'};
  if (d < 1000) return {id: 'meso', name: 'ZONA MESOPELÁGICA · CREPUSCULAR', range: '200–1.000 m'};
  if (d < 4000) return {id: 'bathy', name: 'ZONA BATIPELÁGICA · MEDIANOCHE', range: '1.000–4.000 m'};
  if (d < 6000) return {id: 'abyss', name: 'ZONA ABISAL', range: '4.000–6.000 m'};
  return {id: 'hadal', name: 'ZONA HADAL', range: '6.000–10.935 m'};
}
/** Presión aproximada en atmósferas (1 + d/10). */
export const pressureAtm = (d: number) => 1 + d / 10;
const TEMP: [number, number][] = [[0, 28.5], [60, 28], [120, 26], [200, 21], [300, 15], [450, 10], [650, 7], [1000, 4.5], [1500, 3], [2000, 2.3], [3000, 1.8], [4000, 1.5], [6000, 1.6], [8000, 2.0], [10935, 2.5]];
export function tempAt(d: number) {
  let i = 0;
  while (i < TEMP.length - 2 && d > TEMP[i + 1][0]) i++;
  const k = clamp((d - TEMP[i][0]) / (TEMP[i + 1][0] - TEMP[i][0]));
  return lerp(TEMP[i][1], TEMP[i + 1][1], k);
}
/** Fracción de luz solar disponible (0–1): visible hasta ~1.000 m como penumbra; nada en profundidad. */
export const sunlight = (d: number) => clamp(Math.exp(-d / 140) * (1 - smoothstep(700, 1000, d)) + 0.0);
/** Miles con punto (estilo español), también para 4 cifras: 4.000. */
export const fmt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
