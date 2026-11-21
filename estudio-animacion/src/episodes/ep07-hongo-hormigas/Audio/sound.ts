// Mezcla de audio del Ep. 07: seis pistas en public/audio/ep07 (narración Piper + tools/audio/score_ep07.py).
import {AudioMix} from '../../../engine/types';

export const EP07_DEFAULT_AUDIO: AudioMix = {
  narration: {src: 'audio/ep07/narracion.m4a', volume: 1},
  music: {src: 'audio/ep07/musica.m4a', volume: 0.32, duckTo: 0.42},
  ambience: {src: 'audio/ep07/ambiente.m4a', volume: 0.5},
  movement: {src: 'audio/ep07/movimiento.m4a', volume: 0.5},
  tension: {src: 'audio/ep07/tension.m4a', volume: 0.5},
  transitions: {src: 'audio/ep07/transiciones.m4a', volume: 0.45},
};
