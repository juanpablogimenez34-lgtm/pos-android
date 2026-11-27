// Mezcla de audio del Ep. 05: seis pistas en public/audio/ep05 (narración Piper + tools/audio/score_ep05.py).
import {AudioMix} from '../../engine/types';

export const EP05_DEFAULT_AUDIO: AudioMix = {
  narration: {src: 'audio/ep05/narracion.m4a', volume: 1},
  music: {src: 'audio/ep05/musica.m4a', volume: 0.32, duckTo: 0.42},
  ambience: {src: 'audio/ep05/ambiente.m4a', volume: 0.5},
  movement: {src: 'audio/ep05/movimiento.m4a', volume: 0.55},
  tension: {src: 'audio/ep05/tension.m4a', volume: 0.55},
  transitions: {src: 'audio/ep05/transiciones.m4a', volume: 0.45},
};
