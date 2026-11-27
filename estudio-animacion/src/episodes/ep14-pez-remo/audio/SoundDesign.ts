// Mezcla: voz Piper es_MX (gratuita, local) + banda sonora y efectos ORIGINALES generados con
// tools/audio/score_ep14_oarfish.py. La voz manda: música y ambiente bajan bajo ella.
import {AudioMix} from '../../../engine/types';

export const OARFISH_AUDIO: AudioMix = {
  narration: {src: 'audio/ep07-pez-remo/narracion.m4a', volume: 1},
  music: {src: 'audio/ep07-pez-remo/musica.m4a', volume: 0.34, duckTo: 0.35},
  ambience: {src: 'audio/ep07-pez-remo/ambiente.m4a', volume: 0.55},
  movement: {src: 'audio/ep07-pez-remo/movimiento.m4a', volume: 0.55},
  tension: {src: 'audio/ep07-pez-remo/descubrimiento.m4a', volume: 0.5},
  transitions: {src: 'audio/ep07-pez-remo/transiciones.m4a', volume: 0.5},
};
