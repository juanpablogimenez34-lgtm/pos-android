// Mezcla de audio del Ep. 04: seis pistas reales en public/audio/ep04 (tools/audio/score_ep04.py).
import {AudioMix} from '../../engine/types';

export const EP04_DEFAULT_AUDIO: AudioMix = {
  narration: {src: 'audio/ep04/narracion.m4a', volume: 1},
  music: {src: 'audio/ep04/musica.m4a', volume: 0.34, duckTo: 0.42},
  ambience: {src: 'audio/ep04/ambiente.m4a', volume: 0.45},
  movement: {src: 'audio/ep04/movimiento.m4a', volume: 0.6},
  tension: {src: 'audio/ep04/tension.m4a', volume: 0.6},
  transitions: {src: 'audio/ep04/transiciones.m4a', volume: 0.45},
};
