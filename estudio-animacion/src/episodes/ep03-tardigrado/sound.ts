// Mezcla de audio del Ep. 03: seis pistas reales en public/audio/ep03 (ver tools/audio/score_ep03.py).
import {AudioMix} from '../../engine/types';

export const EP03_DEFAULT_AUDIO: AudioMix = {
  narration: {src: 'audio/ep03/narracion.m4a', volume: 1},
  music: {src: 'audio/ep03/musica.m4a', volume: 0.34, duckTo: 0.4},
  ambience: {src: 'audio/ep03/ambiente.m4a', volume: 0.45},
  movement: {src: 'audio/ep03/movimiento.m4a', volume: 0.75},
  tension: {src: 'audio/ep03/tension.m4a', volume: 0.65},
  transitions: {src: 'audio/ep03/transiciones.m4a', volume: 0.5},
};
