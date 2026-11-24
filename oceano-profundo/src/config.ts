// CONFIGURACIÓN CENTRAL — resolución, duración, calidad, volúmenes y rendimiento.
export const CONFIG = {
  fps: 30,
  documentary: {id: 'Documental', width: 1920, height: 1080, durationSec: 600},
  short: {width: 1080, height: 1920},
  /** Perfiles de calidad: `preview` para revisar rápido, `premium` para la entrega. */
  quality: {
    preview: {particles: 0.45, blur: 0.5, rays: true, warp: false, grain: false},
    premium: {particles: 1, blur: 1, rays: true, warp: true, grain: true},
  },
  /** Volúmenes de mezcla (0–1). La música se atenúa automáticamente durante la voz (duck). */
  audio: {narration: 1, music: 0.3, musicDuck: 0.32, ambience: 0.45, sfx: 0.55, duckAttack: 0.25, duckRelease: 0.6},
  subtitles: {maxChars: 42, maxCharsShort: 28, maxLines: 2},
  seed: 20261124,
};
export type QualityName = keyof typeof CONFIG.quality;
export type Quality = (typeof CONFIG.quality)[QualityName];
