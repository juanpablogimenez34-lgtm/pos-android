// Exportación: MP4 H.264 + AAC, 1080×1920, 30 fps, 5400 fotogramas; previsualización 540×960.
export const EXPORT = {
  compositionId: 'TiburonDuende',
  final: {file: 'entregas/ep-tiburon-duende/ep-tiburon-duende-final-1080x1920.mp4', scale: 1, crf: 20},
  preview: {file: 'entregas/ep-tiburon-duende/ep-tiburon-duende-preview-540x960.mp4', scale: 0.5, crf: 26},
  segmentSeconds: 30,
  lowMemory: {segmentSeconds: 15, concurrency: 1},
} as const;
