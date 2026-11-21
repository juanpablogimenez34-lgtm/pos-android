// Sincronización con la canción REAL (el_baile_del_lobito.mp3): datos medidos por
// MusicSync/analyze_song.py (pulsos, compases, energía). Ninguna marca se inventa.
import map from './song-map.json';

const M = map as unknown as {durationSec: number; frames: number; tempoBpm: number; beats: number[]; downbeats: number[]};

export const SONG_DURATION = M.durationSec;
/** ⌈duración × 30⌉: el último fotograma incluye el final de la canción. */
export const SONG_FRAMES = Math.ceil(M.durationSec * 30);
export const TEMPO = M.tempoBpm;
export const BEATS = M.beats;
export const DOWNBEATS = M.downbeats;

const lastBefore = (arr: number[], t: number) => {
  if (!arr.length || t < arr[0]) return -1;
  let lo = 0;
  let hi = arr.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (arr[m] <= t) lo = m;
    else hi = m;
  }
  return arr[hi] <= t ? hi : lo;
};

/** Número de pulso y fase (0–1) dentro del pulso. */
export function beatPhase(t: number) {
  const i = lastBefore(BEATS, t);
  if (i < 0) return {i: -1, ph: 0};
  const a = BEATS[i];
  const b = BEATS[i + 1] ?? a + 60 / TEMPO;
  return {i, ph: Math.min(1, (t - a) / (b - a))};
}
/** Pulsos (decimales) transcurridos desde el instante t0. */
export const beatsSince = (t0: number, t: number) => {
  const a = beatPhase(t0);
  const b = beatPhase(t);
  return b.i + b.ph - (a.i + a.ph);
};
export const beatPulse = (t: number, decay = 6) => {
  const i = lastBefore(BEATS, t);
  return i < 0 ? 0 : Math.exp(-(t - BEATS[i]) * decay);
};
/** Pulso medido más cercano. */
export const snap = (x: number) => BEATS.reduce((b, v) => (Math.abs(v - x) < Math.abs(b - x) ? v : b), BEATS[0]);
