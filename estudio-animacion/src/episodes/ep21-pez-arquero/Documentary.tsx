// MUNDO INSÓLITO DOCUMENTALES — EL PEZ QUE DISPARA AGUA COMO UN FRANCOTIRADOR (Toxotes jaculatrix).
// 180 s · 1080×1920 · 30 fps · 5.400 fotogramas · 12 escenas de 15 s sobre la carcasa del Estudio 2.0.
// Diez pistas: voz, música de exploración, ambiente del manglar, movimiento del agua, suspenso y
// transiciones/cierre (carcasa) + disparos, impactos y salpicaduras, hojas e insectos (montadas aparte).
import React from 'react';
import {Audio, staticFile} from 'remotion';
import {cuesFromTiming, speechIntervals, TimedLine} from '../../engine/cues';
import {AudioMix} from '../../engine/types';
import {EpisodeShell, SceneDef, ShellProps} from '../../studio2';
import {SceneTag} from './components/common';
import narration from './data/narration-timing.json';
import {SCENES} from './data/timeline';
import {scene01, scene02, scene03, scene04} from './scenes/S01_04';
import {scene05, scene06, scene07, scene08} from './scenes/S05_08';
import {scene09, scene10, scene11, scene12} from './scenes/S09_12';

const FNS = [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08, scene09, scene10, scene11, scene12];
const DEFS: SceneDef[] = SCENES.map((s, i) => ({start: s.start, end: s.end, render: FNS[i]}));
const TIMING = (narration as unknown as {timing: TimedLine[]}).timing;
export const ARCHER_CUES = cuesFromTiming(TIMING, 28);
const SPEECH = speechIntervals(TIMING);

const DIR = 'audio/ep21-pez-arquero';
export const ARCHER_AUDIO: AudioMix = {
  narration: {src: `${DIR}/narracion.m4a`, volume: 1},
  music: {src: `${DIR}/musica.m4a`, volume: 0.32, duckTo: 0.35},
  ambience: {src: `${DIR}/ambiente-manglar.m4a`, volume: 0.5},
  movement: {src: `${DIR}/agua.m4a`, volume: 0.45},
  tension: {src: `${DIR}/suspenso.m4a`, volume: 0.45},
  transitions: {src: `${DIR}/transiciones-cierre.m4a`, volume: 0.45},
};

export type ArcherDocProps = ShellProps & {extraTracks?: boolean};

export const ArcherDocumentary: React.FC<ArcherDocProps> = ({extraTracks = true, ...props}) => (
  <>
    <EpisodeShell {...props} scenes={DEFS} cues={ARCHER_CUES} speech={SPEECH} background="#2a5a3a" extra={(t) => <SceneTag t={t} />} />
    {extraTracks && props.audio.narration && (
      <>
        <Audio src={staticFile(`${DIR}/disparos.m4a`)} volume={0.55} />
        <Audio src={staticFile(`${DIR}/impactos.m4a`)} volume={0.5} />
        <Audio src={staticFile(`${DIR}/hojas.m4a`)} volume={0.4} />
        <Audio src={staticFile(`${DIR}/insectos.m4a`)} volume={0.35} />
      </>
    )}
  </>
);
