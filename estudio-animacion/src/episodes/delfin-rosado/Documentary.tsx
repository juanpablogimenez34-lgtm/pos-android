// MUNDO INSÓLITO — EL DELFÍN ROSADO QUE NADA ENTRE LOS ÁRBOLES (Inia geoffrensis).
// 60 s · 1080×1920 · 30 fps · 1.800 fotogramas · 8 escenas sobre la carcasa del Estudio 2.0.
// Pistas: voz, música cinematográfica, ambiente de selva, corrientes de agua, movimiento del delfín y transiciones
// (carcasa) + aves, burbujas, respiración en superficie y clics de ecolocalización (montadas aparte).
import React from 'react';
import {Audio, staticFile} from 'remotion';
import {cuesFromTiming, speechIntervals, TimedLine} from '../../engine/cues';
import {AudioMix} from '../../engine/types';
import {EpisodeShell, SceneDef, SceneOut, ShellProps} from '../../studio2';
import narration from './data/narration-timing.json';
import {SCENES} from './data/timeline';
import {scene1, scene2, scene3, scene4} from './scenes/S1_4';
import {scene5, scene6, scene7, scene8} from './scenes/S5_8';

/** Fundido encadenado en las fronteras de escena (sin cortes bruscos de luz). */
const xfade = (prev: (t: number) => SceneOut, next: (t: number) => SceneOut, at: number, d: number) => (t: number): SceneOut => {
  const u = (t - at) / d;
  if (u >= 1) return next(t);
  const e = u * u * (3 - 2 * u);
  const A = prev(t);
  const B = next(t);
  return {svg: <g>{A.svg}<g opacity={e}>{B.svg}</g></g>, overlay: <>{e < 0.5 && A.overlay}{e >= 0.5 && B.overlay}</>};
};
const RAW = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8];
const FNS = RAW.map((f, i) => (i === 0 ? f : xfade(RAW[i - 1], f, SCENES[i].start, 0.45)));
const DEFS: SceneDef[] = SCENES.map((s, i) => ({start: s.start, end: s.end, render: FNS[i]}));
const TIMING = (narration as unknown as {timing: TimedLine[]}).timing;
export const DOLPHIN_CUES = cuesFromTiming(TIMING, 34);
const SPEECH = speechIntervals(TIMING);

const DIR = 'audio/delfin-rosado';
export const DOLPHIN_AUDIO: AudioMix = {
  narration: {src: `${DIR}/narracion.m4a`, volume: 1},
  music: {src: `${DIR}/musica.m4a`, volume: 0.32, duckTo: 0.38},
  ambience: {src: `${DIR}/ambiente-selva.m4a`, volume: 0.45},
  movement: {src: `${DIR}/movimiento-delfin.m4a`, volume: 0.5},
  tension: {src: `${DIR}/corrientes.m4a`, volume: 0.42},
  transitions: {src: `${DIR}/transiciones.m4a`, volume: 0.45},
};

export type DolphinDocProps = ShellProps & {extraTracks?: boolean};

export const DolphinDocumentary: React.FC<DolphinDocProps> = ({extraTracks = true, ...props}) => (
  <>
    <EpisodeShell {...props} scenes={DEFS} cues={DOLPHIN_CUES} speech={SPEECH} background="#2a3a1e" />
    {extraTracks && props.audio.narration && (
      <>
        <Audio src={staticFile(`${DIR}/aves.m4a`)} volume={0.4} />
        <Audio src={staticFile(`${DIR}/burbujas.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/respiracion.m4a`)} volume={0.6} />
        <Audio src={staticFile(`${DIR}/clics.m4a`)} volume={0.5} />
      </>
    )}
  </>
);
