// Mezcla: locución Piper (es_MX-claude-high, Apache-2.0) + música y efectos ORIGINALES sintetizados
// con tools/audio/score_ep11_dragon.py (licencia propia, aptos para redes sociales).
import {AudioMix} from '../../../engine/types';

export const EP05_DRAGON_AUDIO: AudioMix = {
  narration: {src: 'audio/ep05-dragon-azul/narracion.m4a', volume: 1},
  music: {src: 'audio/ep05-dragon-azul/musica.m4a', volume: 0.36, duckTo: 0.4},
  ambience: {src: 'audio/ep05-dragon-azul/ambiente.m4a', volume: 0.5},
  movement: {src: 'audio/ep05-dragon-azul/movimiento.m4a', volume: 0.55},
  tension: {src: 'audio/ep05-dragon-azul/descubrimiento.m4a', volume: 0.55},
  transitions: {src: 'audio/ep05-dragon-azul/transiciones.m4a', volume: 0.5},
};
