// MUNDO INSÓLITO — EL CAMALEÓN: EL MAESTRO DE LA TRANSFORMACIÓN (Furcifer pardalis).
// 180 s · 1080×1920 · 30 fps · 5.400 fotogramas · 7 escenas sobre la carcasa del Estudio 2.0 (motor del pulpo).
// Pistas: voz, música, ambiente de selva, movimiento, tensión y transiciones (carcasa) + hojas y viento, insectos,
// aves y lengua (montadas aparte).
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

/** Fundido encadenado en las fronteras de escena. */
const xfade = (prev: (t: number) => SceneOut, next: (t: number) => SceneOut, at: number, d: number) => (t: number): SceneOut => {
  const u = (t - at) / d;
  if (u >= 1) return next(t);
  const e = u * u * (3 - 2 * u);
  const A = prev(t);
  const B = next(t);
  return {svg: <g>{A.svg}<g opacity={e}>{B.svg}</g></g>, overlay: <>{e < 0.5 ? A.overlay : B.overlay}</>};
};
const RAW = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
const FNS = RAW.map((f, i) => (i === 0 ? f : xfade(RAW[i - 1], f, SCENES[i].start, 0.6)));
const DEFS: SceneDef[] = SCENES.map((s, i) => ({start: s.start, end: s.end, render: FNS[i]}));
const TIMING = (narration as unknown as {timing: TimedLine[]}).timing;
export const CHAM_CUES = cuesFromTiming(TIMING, 32);
const SPEECH = speechIntervals(TIMING);

const DIR = 'audio/camaleon';
export const CHAM_AUDIO: AudioMix = {
  narration: {src: `${DIR}/narracion.m4a`, volume: 1},
  music: {src: `${DIR}/musica.m4a`, volume: 0.3, duckTo: 0.4},
  ambience: {src: `${DIR}/ambiente-selva.m4a`, volume: 0.42},
  movement: {src: `${DIR}/movimiento.m4a`, volume: 0.55},
  tension: {src: `${DIR}/tension.m4a`, volume: 0.45},
  transitions: {src: `${DIR}/transiciones.m4a`, volume: 0.45},
};
export type ChamDocProps = ShellProps & {extraTracks?: boolean};
export const ChameleonDocumentary: React.FC<ChamDocProps> = ({extraTracks = true, ...props}) => (
  <>
    <EpisodeShell {...props} scenes={DEFS} cues={CHAM_CUES} speech={SPEECH} background="#0c2a20" extra={(t) => <SceneTag t={t} />} />
    {extraTracks && props.audio.narration && (
      <>
        <Audio src={staticFile(`${DIR}/hojas-viento.m4a`)} volume={0.4} />
        <Audio src={staticFile(`${DIR}/insectos.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/aves.m4a`)} volume={0.4} />
        <Audio src={staticFile(`${DIR}/lengua.m4a`)} volume={0.7} />
      </>
    )}
  </>
);
