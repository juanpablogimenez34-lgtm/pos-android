// MUNDO INSÓLITO — EL TIBURÓN BLANCO: EL GRAN DEPREDADOR (Carcharodon carcharias).
// 180 s · 1080×1920 (Reels) · 30 fps · 5.400 fotogramas · 7 escenas sobre la carcasa del Estudio 2.0 (motor del pulpo).
import React from 'react';
import {Audio, staticFile} from 'remotion';
import {cuesFromTiming, speechIntervals, TimedLine} from '../../engine/cues';
import {AudioMix} from '../../engine/types';
import {EpisodeShell, SceneDef, SceneOut, ShellProps} from '../../studio2';
import {SceneTag} from './components/common';
import narration from './data/narration-timing.json';
import {SCENES} from './data/timeline';
import {scene1, scene2, scene3, scene4} from './scenes/S1_4';
import {scene5, scene6, scene7} from './scenes/S5_7';

const xfade = (prev: (t: number) => SceneOut, next: (t: number) => SceneOut, at: number, d: number) => (t: number): SceneOut => {
  const u = (t - at) / d;
  if (u >= 1) return next(t);
  const e = u * u * (3 - 2 * u);
  const A = prev(t);
  const B = next(t);
  return {svg: <g>{A.svg}<g opacity={e}>{B.svg}</g></g>, overlay: <>{e < 0.5 ? A.overlay : B.overlay}</>};
};
export const TIB_RAW = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
const FNS = TIB_RAW.map((f, i) => (i === 0 ? f : xfade(TIB_RAW[i - 1], f, SCENES[i].start, 0.7)));
const DEFS: SceneDef[] = SCENES.map((s, i) => ({start: s.start, end: s.end, render: FNS[i]}));
const TIMING = (narration as unknown as {timing: TimedLine[]}).timing;
export const TIB_CUES = cuesFromTiming(TIMING, 32);
const SPEECH = speechIntervals(TIMING);

const DIR = 'audio/tiburon';
export const TIB_AUDIO: AudioMix = {
  narration: {src: `${DIR}/narracion.m4a`, volume: 1},
  music: {src: `${DIR}/musica.m4a`, volume: 0.3, duckTo: 0.4},
  ambience: {src: `${DIR}/ambiente-submarino.m4a`, volume: 0.45},
  movement: {src: `${DIR}/movimiento-agua.m4a`, volume: 0.5},
  tension: {src: `${DIR}/tension.m4a`, volume: 0.45},
  transitions: {src: `${DIR}/transiciones.m4a`, volume: 0.45},
};
export type TibDocProps = ShellProps & {extraTracks?: boolean};
export const TiburonDocumentary: React.FC<TibDocProps> = ({extraTracks = true, ...props}) => (
  <>
    <EpisodeShell {...props} scenes={DEFS} cues={TIB_CUES} speech={SPEECH} background="#041a2e" extra={(t) => <SceneTag t={t} />} />
    {extraTracks && props.audio.narration && (
      <>
        <Audio src={staticFile(`${DIR}/olas-salpicaduras.m4a`)} volume={0.55} />
        <Audio src={staticFile(`${DIR}/burbujas.m4a`)} volume={0.5} />
        <Audio src={staticFile(`${DIR}/orcas.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/senales.m4a`)} volume={0.4} />
      </>
    )}
  </>
);
