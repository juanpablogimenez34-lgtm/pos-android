// Mezcla: locución Piper (voz es_MX-claude-high, Apache-2.0) + banda sonora y efectos ORIGINALES
// sintetizados por código con tools/audio/score_ep10_mantis.py (ambiente submarino, corrientes,
// burbujas, sedimento, música de misterio y tensión, impacto del golpe, transiciones y cierre).
import {AudioMix} from '../../../engine/types';

export const EP04_MANTIS_AUDIO: AudioMix = {
  narration: {src: 'audio/ep04-camaron-mantis/narracion.m4a', volume: 1},
  music: {src: 'audio/ep04-camaron-mantis/musica.m4a', volume: 0.36, duckTo: 0.4},
  ambience: {src: 'audio/ep04-camaron-mantis/ambiente.m4a', volume: 0.55},
  movement: {src: 'audio/ep04-camaron-mantis/movimiento.m4a', volume: 0.6},
  tension: {src: 'audio/ep04-camaron-mantis/descubrimiento.m4a', volume: 0.55},
  transitions: {src: 'audio/ep04-camaron-mantis/transiciones.m4a', volume: 0.45},
};
