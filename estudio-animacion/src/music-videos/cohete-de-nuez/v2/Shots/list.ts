// Lista completa de planos del videoclip 2.0, ordenada por tiempo. Cada plano dura hasta el
// inicio del siguiente; el último, hasta el final de la canción.
import {SONG_DURATION} from '../../MusicSync/songMap';
import {BUILD_SHOTS} from '../Scenes/Build';
import {COUNT_SHOTS} from '../Scenes/Countdown';
import {FLIGHT_SHOTS} from '../Scenes/Flight';
import {Shot} from './shot';

export const ALL_SHOTS: Shot[] = [...BUILD_SHOTS, ...COUNT_SHOTS, ...FLIGHT_SHOTS].sort((a, b) => a.t0 - b.t0);

export function shotAt(t: number): {shot: Shot; lt: number; dur: number; i: number} {
  let i = 0;
  for (let k = 0; k < ALL_SHOTS.length; k++) if (ALL_SHOTS[k].t0 <= t) i = k;
  const shot = ALL_SHOTS[i];
  const end = ALL_SHOTS[i + 1]?.t0 ?? SONG_DURATION;
  return {shot, lt: t - shot.t0, dur: end - shot.t0, i};
}
