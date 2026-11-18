/**
 * Especificaciones técnicas comunes a toda la serie.
 * Cambiar aquí afecta a todos los episodios.
 */
export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

/** Duraciones de cada entrega (en segundos). */
export const DURATIONS = {
  demo: 15,
  episode: 180,
} as const;

export const seconds = (s: number) => Math.round(s * VIDEO.fps);
