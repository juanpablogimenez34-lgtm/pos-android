// Mezcla de audio del Ep. 08: seis pistas en public/audio/ep08 (locución Piper +
// tools/audio/score_ep08.py). La música baja automáticamente bajo la voz (ducking).
import {AudioMix} from '../../../engine/types';

export const EP08_DEFAULT_AUDIO: AudioMix = {
  narration: {src: 'audio/ep08/narracion.m4a', volume: 1},
  music: {src: 'audio/ep08/musica.m4a', volume: 0.36, duckTo: 0.42},
  ambience: {src: 'audio/ep08/ambiente.m4a', volume: 0.5},
  movement: {src: 'audio/ep08/movimiento.m4a', volume: 0.5},
  tension: {src: 'audio/ep08/descubrimiento.m4a', volume: 0.5},
  transitions: {src: 'audio/ep08/transiciones.m4a', volume: 0.45},
};
