// MUNDO INSÓLITO DOCUMENTALES — LA ANGUILA ELÉCTRICA: EL ANIMAL QUE GENERA 860 VOLTIOS.
// 180 s · 1080×1920 · 30 fps · 5.400 fotogramas · 12 escenas de 15 s sobre la carcasa del Estudio 2.0.
// Ocho pistas: las seis de la carcasa (voz, música, ambiente del río, movimiento del agua, tensión,
// transiciones) + pulsos eléctricos estilizados + ataque, montadas aparte.
import React from 'react';
import {Audio, staticFile} from 'remotion';
import {cuesFromTiming, speechIntervals, TimedLine} from '../../engine/cues';
import {AudioMix} from '../../engine/types';
import {EpisodeShell, SceneDef, ShellProps} from '../../studio2';
import {SceneTag} from './components/common';
import narration from './data/narration-timing.json';
import {SCENES} from './data/timeline';
import {scene01} from './scenes/S01';
import {scene02} from './scenes/S02';
import {scene03} from './scenes/S03';
import {scene04} from './scenes/S04';
import {scene05, scene06} from './scenes/S05';
import {scene07} from './scenes/S07';
import {scene08} from './scenes/S08';
import {scene09} from './scenes/S09';
import {scene10} from './scenes/S10';
import {scene11} from './scenes/S11';
import {scene12} from './scenes/S12';

const FNS = [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08, scene09, scene10, scene11, scene12];
const DEFS: SceneDef[] = SCENES.map((s, i) => ({start: s.start, end: s.end, render: FNS[i]}));
const TIMING = (narration as unknown as {timing: TimedLine[]}).timing;
export const EEL_CUES = cuesFromTiming(TIMING, 28);
const SPEECH = speechIntervals(TIMING);

const DIR = 'audio/ep19-anguila-electrica';
export const EEL_AUDIO: AudioMix = {
  narration: {src: `${DIR}/narracion.m4a`, volume: 1},
  music: {src: `${DIR}/musica.m4a`, volume: 0.32, duckTo: 0.35},
  ambience: {src: `${DIR}/ambiente-rio.m4a`, volume: 0.55},
  movement: {src: `${DIR}/agua.m4a`, volume: 0.5},
  tension: {src: `${DIR}/tension.m4a`, volume: 0.45},
  transitions: {src: `${DIR}/transiciones.m4a`, volume: 0.45},
};

export type EelDocProps = ShellProps & {extraTracks?: boolean};

export const EelDocumentary: React.FC<EelDocProps> = ({extraTracks = true, ...props}) => (
  <>
    <EpisodeShell {...props} scenes={DEFS} cues={EEL_CUES} speech={SPEECH} background="#14302a" extra={(t) => <SceneTag t={t} />} />
    {extraTracks && props.audio.narration && (
      <>
        <Audio src={staticFile(`${DIR}/pulsos.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/ataque.m4a`)} volume={0.55} />
      </>
    )}
  </>
);
