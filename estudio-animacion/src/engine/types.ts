// Contratos del motor: un episodio es DATOS (guion, subtítulos, audio, tiempos)
// más una composición que combina escenarios y criaturas reutilizables.

export type SubtitleCue = {
  start: number; // segundos
  end: number;
  text: string; // máx. 2 líneas; usar "\n" para forzar salto
  highlight?: string[]; // palabras/frases a resaltar
};

export type NarrationLine = {
  text: string;
  pauseAfter?: number; // segundos de silencio intencional tras la frase
};

export type SceneScript = {
  id: string;
  title: string;
  start: number;
  end: number;
  visual: string; // descripción de lo que se ve
  narration: NarrationLine[];
  sfx?: {t: number; id: string; note: string}[];
};

export type AudioTrackSpec = {
  /** Ruta relativa a /public (p.ej. "audio/ep01/narracion.mp3"). Vacío = pista no usada. */
  src?: string;
  volume?: number;
  startFrom?: number; // segundos a saltar del archivo
  at?: number; // segundos en la línea de tiempo donde empieza
};

export type AudioMix = {
  narration?: AudioTrackSpec;
  music?: AudioTrackSpec;
  ambience?: AudioTrackSpec;
  movement?: AudioTrackSpec;
  tension?: AudioTrackSpec;
  transitions?: AudioTrackSpec;
};

export type EpisodeMeta = {
  id: string;
  title: string;
  subject: string;
  fps: number;
  width: number;
  height: number;
  durationSec: number;
};
