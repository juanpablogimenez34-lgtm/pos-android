// Configuración de exportación del episodio (proyecto EP04_MantisShrimp_Premium).
// El ID de composición de Remotion no admite guiones bajos: se usa "EP04-MantisShrimp-Premium".
export const EXPORT = {
  project: 'EP04_MantisShrimp_Premium',
  compositionId: 'EP04-MantisShrimp-Premium',
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 5400,
  codec: 'h264',
  crf: 20,
  pixelFormat: 'yuv420p',
  audio: {codec: 'aac', bitrate: '192k', loudnessLUFS: -14},
  output: 'entregas/ep04-camaron-mantis/ep04-final-1080x1920.mp4',
  /** Perfil para Android/Termux: segmentos cortos, concurrencia 1, escala completa. */
  termux: {segmentSeconds: 15, concurrency: 1, crf: 22},
} as const;
