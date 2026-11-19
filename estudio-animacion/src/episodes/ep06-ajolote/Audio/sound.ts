// Mezcla de audio del Ep. 06: seis pistas en public/audio/ep06 (narración Piper + tools/audio/score_ep06.py).
import {AudioMix} from '../../../engine/types';

export const EP06_DEFAULT_AUDIO: AudioMix = {
  narration: {src: 'audio/ep06/narracion.m4a', volume: 1},
  music: {src: 'audio/ep06/musica.m4a', volume: 0.34, duckTo: 0.42},
  ambience: {src: 'audio/ep06/ambiente.m4a', volume: 0.5},
  movement: {src: 'audio/ep06/movimiento.m4a', volume: 0.55},
  tension: {src: 'audio/ep06/descubrimiento.m4a', volume: 0.5},
  transitions: {src: 'audio/ep06/transiciones.m4a', volume: 0.45},
};
