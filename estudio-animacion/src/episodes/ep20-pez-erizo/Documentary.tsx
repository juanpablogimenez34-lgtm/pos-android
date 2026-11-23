// MUNDO INSÓLITO DOCUMENTALES — EL PEZ QUE SE CONVIERTE EN UN GLOBO DE ESPINAS (Diodon holocanthus).
// 180 s · 1080×1920 · 30 fps · 5.400 fotogramas · 12 escenas de 450 fotogramas sobre la carcasa del
// Estudio 2.0. Nueve pistas: voz, música, ambiente submarino, movimiento de agua, suspenso y transiciones
// (carcasa) + aletas, transformación corporal y cierre musical (montadas aparte).
import React from 'react';
import {Audio, staticFile} from 'remotion';
import {cuesFromTiming, speechIntervals, TimedLine} from '../../engine/cues';
import {AudioMix} from '../../engine/types';
import {EpisodeShell, SceneDef, ShellProps} from '../../studio2';
import {SceneTag} from './components/common';
import narration from './data/narration-timing.json';
import {SCENES} from './data/timeline';
import {scene01, scene02, scene03} from './scenes/S01_03';
import {scene04, scene05, scene06} from './scenes/S04_06';
import {scene07, scene08, scene09} from './scenes/S07_09';
import {scene10, scene11, scene12} from './scenes/S10_12';

const FNS = [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08, scene09, scene10, scene11, scene12];
const DEFS: SceneDef[] = SCENES.map((s, i) => ({start: s.start, end: s.end, render: FNS[i]}));
const TIMING = (narration as unknown as {timing: TimedLine[]}).timing;
export const PUFFER_CUES = cuesFromTiming(TIMING, 28);
const SPEECH = speechIntervals(TIMING);

const DIR = 'audio/ep20-pez-erizo';
export const PUFFER_AUDIO: AudioMix = {
  narration: {src: `${DIR}/narracion.m4a`, volume: 1},
  music: {src: `${DIR}/musica.m4a`, volume: 0.32, duckTo: 0.35},
  ambience: {src: `${DIR}/ambiente.m4a`, volume: 0.55},
  movement: {src: `${DIR}/agua.m4a`, volume: 0.45},
  tension: {src: `${DIR}/suspenso.m4a`, volume: 0.45},
  transitions: {src: `${DIR}/transiciones.m4a`, volume: 0.45},
};

/** Primeros planos en los que el pez ocupa la franja inferior: los subtítulos suben a la zona alta. */
const CLOSE_UPS: [number, number][] = [[0, 1.0], [60, 66.5], [150, 155], [171, 174.6]];
const avoidFace = (t: number) => CLOSE_UPS.some(([a, b]) => t >= a && t < b);

export type PufferDocProps = ShellProps & {extraTracks?: boolean};

export const PufferDocumentary: React.FC<PufferDocProps> = ({extraTracks = true, ...props}) => (
  <>
    <EpisodeShell {...props} scenes={DEFS} cues={PUFFER_CUES} speech={SPEECH} background="#0a2a52" avoid={avoidFace} extra={(t) => <SceneTag t={t} />} />
    {extraTracks && props.audio.narration && (
      <>
        <Audio src={staticFile(`${DIR}/aletas.m4a`)} volume={0.4} />
        <Audio src={staticFile(`${DIR}/transformacion.m4a`)} volume={0.55} />
        <Audio src={staticFile(`${DIR}/cierre.m4a`)} volume={0.5} />
      </>
    )}
  </>
);
