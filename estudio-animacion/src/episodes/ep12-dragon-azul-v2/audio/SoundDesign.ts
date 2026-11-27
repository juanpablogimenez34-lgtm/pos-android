// Mezcla v2: voz Piper + música/efectos ORIGINALES (tools/audio/score_ep12_dragon_v2.py).
import {AudioMix} from '../../../engine/types';

export const EP05V2_AUDIO: AudioMix = {
  narration: {src: 'audio/ep05-dragon-azul-v2/narracion.m4a', volume: 1},
  music: {src: 'audio/ep05-dragon-azul-v2/musica.m4a', volume: 0.34, duckTo: 0.35},
  ambience: {src: 'audio/ep05-dragon-azul-v2/ambiente.m4a', volume: 0.5},
  movement: {src: 'audio/ep05-dragon-azul-v2/movimiento.m4a', volume: 0.6},
  tension: {src: 'audio/ep05-dragon-azul-v2/descubrimiento.m4a', volume: 0.55},
  transitions: {src: 'audio/ep05-dragon-azul-v2/transiciones.m4a', volume: 0.5},
};
