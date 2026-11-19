// Sincronización con la canción REAL (nuestro_cohete_de_nuez.mp3): datos medidos por
// MusicSync/analyze_song.py y MusicSync/build_map.py. Nada de marcas inventadas.
//  MUSIC_BEAT     fase dentro del pulso y del compás
//  CAMERA_PULSE   pequeño impulso en cada primer tiempo de compás
//  LIGHT_PULSE    destello en cada pulso
//  CHARACTER_SING apertura de boca aproximada a partir de la envolvente de la voz (sin fonemas)
import map from './song-map.json';

type Section = {label: string; start: number; end: number};
const M = map as unknown as {durationSec: number; frames: number; tempoBpm: number; beats: number[]; downbeats: number[]; sections: Section[]; barSec: number; vocalEnvelope30: number[]};

export const SONG_DURATION = M.durationSec;
export const SONG_FRAMES = M.frames;
export const TEMPO = M.tempoBpm;
export const BEATS = M.beats;
export const DOWNBEATS = M.downbeats;
export const BAR = M.barSec;
export const SECTIONS = M.sections;

export const sec = (label: string) => {
  const s = SECTIONS.find((x) => x.label === label);
  if (!s) throw new Error(`sección ${label} no encontrada`);
  return s;
};

const lastBefore = (arr: number[], t: number) => {
  let lo = 0;
  let hi = arr.length - 1;
  if (t < arr[0]) return -1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (arr[m] <= t) lo = m;
    else hi = m;
  }
  return arr[hi] <= t ? hi : lo;
};

/** Fase dentro del pulso (0–1) y número de pulso. */
export function beatPhase(t: number) {
  const i = lastBefore(BEATS, t);
  if (i < 0) return {i: -1, ph: 0};
  const a = BEATS[i];
  const b = BEATS[i + 1] ?? a + 60 / TEMPO;
  return {i, ph: Math.min(1, (t - a) / (b - a))};
}

/** Impulso que decae tras cada pulso (LIGHT_PULSE) o primer tiempo (CAMERA_PULSE). */
export const beatPulse = (t: number, decay = 6) => {
  const i = lastBefore(BEATS, t);
  return i < 0 ? 0 : Math.exp(-(t - BEATS[i]) * decay);
};
export const barPulse = (t: number, decay = 4) => {
  const i = lastBefore(DOWNBEATS, t);
  return i < 0 ? 0 : Math.exp(-(t - DOWNBEATS[i]) * decay);
};

/** Envolvente de la voz principal (0–1) en el instante t (CHARACTER_SING). */
export const vocal = (t: number) => {
  const f = t * 30;
  const i = Math.floor(f);
  const a = M.vocalEnvelope30[Math.max(0, Math.min(M.vocalEnvelope30.length - 1, i))] ?? 0;
  const b = M.vocalEnvelope30[Math.max(0, Math.min(M.vocalEnvelope30.length - 1, i + 1))] ?? 0;
  return a + (b - a) * (f - i);
};

/** Pulso n-ésimo (en segundos) a partir de un instante. */
export const beatAfter = (t: number, n = 0) => {
  const i = lastBefore(BEATS, t);
  return BEATS[Math.max(0, i + 1 + n)] ?? t;
};
