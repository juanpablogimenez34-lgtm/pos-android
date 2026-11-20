// Mezcla de audio: locución Piper (es_MX-claude-high, licencia Apache-2.0) + banda sonora original
// sintetizada con tools/audio/score_ep09_leopardo.py. La música baja bajo la voz (ducking).
import {AudioMix} from '../../../engine/types';

export const EP04_LEOPARDO_AUDIO: AudioMix = {
  narration: {src: 'audio/ep04-leopardo/narracion.m4a', volume: 1},
  music: {src: 'audio/ep04-leopardo/musica.m4a', volume: 0.36, duckTo: 0.4},
  ambience: {src: 'audio/ep04-leopardo/ambiente.m4a', volume: 0.55},
  movement: {src: 'audio/ep04-leopardo/movimiento.m4a', volume: 0.55},
  tension: {src: 'audio/ep04-leopardo/descubrimiento.m4a', volume: 0.5},
  transitions: {src: 'audio/ep04-leopardo/transiciones.m4a', volume: 0.45},
};
