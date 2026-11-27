// Mezcla: voz Piper es_MX (gratuita, local) + música y efectos ORIGINALES generados con
// tools/audio/score_ep13_goblin.py. La voz tiene prioridad (la música y el ambiente bajan bajo ella).
// Para sustituir la narración por otra voz, basta con reemplazar narracion.m4a y regenerar
// narration-timing.json con tools/audio/narration.py (o medir la nueva pista).
import {AudioMix} from '../../../engine/types';

export const GOBLIN_AUDIO: AudioMix = {
  narration: {src: 'audio/ep-tiburon-duende/narracion.m4a', volume: 1},
  music: {src: 'audio/ep-tiburon-duende/musica.m4a', volume: 0.34, duckTo: 0.35},
  ambience: {src: 'audio/ep-tiburon-duende/ambiente.m4a', volume: 0.55},
  movement: {src: 'audio/ep-tiburon-duende/movimiento.m4a', volume: 0.6},
  tension: {src: 'audio/ep-tiburon-duende/descubrimiento.m4a', volume: 0.55},
  transitions: {src: 'audio/ep-tiburon-duende/transiciones.m4a', volume: 0.5},
};
