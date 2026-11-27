// MUNDO INSÓLITO — EL NARVAL: EL UNICORNIO DEL OCÉANO (Monodon monoceros).
// 180 s · 1080×1920 · 30 fps · 5.400 fotogramas · 7 escenas sobre la carcasa del Estudio 2.0 (motor del pulpo).
// Pistas: voz, música, ambiente submarino, movimiento del agua, tensión y transiciones (carcasa) + océano y olas,
// salpicaduras, hielo, vocalizaciones, ecolocalización, burbujas y soplos (montadas aparte).
import React from 'react';
import {Audio, staticFile} from 'remotion';
import {cuesFromTiming, speechIntervals, TimedLine} from '../../engine/cues';
import {AudioMix} from '../../engine/types';
import {EpisodeShell, SceneDef, SceneOut, ShellProps} from '../../studio2';
import {SceneTag} from './components/common';
import narration from './data/narration-timing.json';
import {SCENES} from './data/timeline';
import {scene1, scene2} from './scenes/S1_2';
import {scene3, scene4} from './scenes/S3_4';
import {scene5, scene6, scene7} from './scenes/S5_7';

const xfade = (prev: (t: number) => SceneOut, next: (t: number) => SceneOut, at: number, d: number) => (t: number): SceneOut => {
  const u = (t - at) / d;
  if (u >= 1) return next(t);
  const e = u * u * (3 - 2 * u);
  const A = prev(t);
  const B = next(t);
  return {svg: <g>{A.svg}<g opacity={e}>{B.svg}</g></g>, overlay: <>{e < 0.5 ? A.overlay : B.overlay}</>};
};
export const NARVAL_RAW = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
const FNS = NARVAL_RAW.map((f, i) => (i === 0 ? f : xfade(NARVAL_RAW[i - 1], f, SCENES[i].start, 0.7)));
const DEFS: SceneDef[] = SCENES.map((s, i) => ({start: s.start, end: s.end, render: FNS[i]}));
const TIMING = (narration as unknown as {timing: TimedLine[]}).timing;
export const NARVAL_CUES = cuesFromTiming(TIMING, 32);
const SPEECH = speechIntervals(TIMING);

const DIR = 'audio/narval';
export const NARVAL_AUDIO: AudioMix = {
  narration: {src: `${DIR}/narracion.m4a`, volume: 1},
  music: {src: `${DIR}/musica.m4a`, volume: 0.3, duckTo: 0.4},
  ambience: {src: `${DIR}/ambiente-submarino.m4a`, volume: 0.45},
  movement: {src: `${DIR}/movimiento-agua.m4a`, volume: 0.5},
  tension: {src: `${DIR}/tension.m4a`, volume: 0.45},
  transitions: {src: `${DIR}/transiciones.m4a`, volume: 0.45},
};
export type NarvalDocProps = ShellProps & {extraTracks?: boolean};
export const NarvalDocumentary: React.FC<NarvalDocProps> = ({extraTracks = true, ...props}) => (
  <>
    <EpisodeShell {...props} scenes={DEFS} cues={NARVAL_CUES} speech={SPEECH} background="#04182a" extra={(t) => <SceneTag t={t} />} />
    {extraTracks && props.audio.narration && (
      <>
        <Audio src={staticFile(`${DIR}/oceano-olas.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/salpicaduras.m4a`)} volume={0.5} />
        <Audio src={staticFile(`${DIR}/hielo.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/vocalizaciones.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/ecolocalizacion.m4a`)} volume={0.5} />
        <Audio src={staticFile(`${DIR}/burbujas-soplos.m4a`)} volume={0.5} />
      </>
    )}
  </>
);
