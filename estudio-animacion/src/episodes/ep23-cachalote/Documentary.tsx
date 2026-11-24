// MUNDO INSÓLITO DOCUMENTALES — EL CACHALOTE: EL GIGANTE QUE CAZA EN LA OSCURIDAD (Physeter macrocephalus).
// 180 s · 1080×1920 · 30 fps · 5.400 fotogramas · 12 escenas de 15 s sobre la carcasa del Estudio 2.0.
// Pistas: voz, música ambiental, ambiente oceánico, movimiento del agua, tensión del descenso y transiciones
// (carcasa) + respiración, clics de ecolocalización, encuentro con el calamar, comunicación social y música
// del cierre (montadas aparte). Son las 10 pistas pedidas más una de transiciones.
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
export const WHALE_CUES = cuesFromTiming(TIMING, 28);
const SPEECH = speechIntervals(TIMING);

const DIR = 'audio/ep23-cachalote';
export const WHALE_AUDIO: AudioMix = {
  narration: {src: `${DIR}/narracion.m4a`, volume: 1},
  music: {src: `${DIR}/musica-ambiental.m4a`, volume: 0.32, duckTo: 0.35},
  ambience: {src: `${DIR}/ambiente-oceanico.m4a`, volume: 0.5},
  movement: {src: `${DIR}/movimiento-agua.m4a`, volume: 0.45},
  tension: {src: `${DIR}/tension-descenso.m4a`, volume: 0.45},
  transitions: {src: `${DIR}/transiciones.m4a`, volume: 0.45},
};

export type WhaleDocProps = ShellProps & {extraTracks?: boolean};

export const WhaleDocumentary: React.FC<WhaleDocProps> = ({extraTracks = true, ...props}) => (
  <>
    <EpisodeShell {...props} scenes={DEFS} cues={WHALE_CUES} speech={SPEECH} background="#04101e" extra={(t) => <SceneTag t={t} />} />
    {extraTracks && props.audio.narration && (
      <>
        <Audio src={staticFile(`${DIR}/respiracion.m4a`)} volume={0.5} />
        <Audio src={staticFile(`${DIR}/clics-ecolocalizacion.m4a`)} volume={0.5} />
        <Audio src={staticFile(`${DIR}/encuentro-calamar.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/comunicacion-social.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/musica-cierre.m4a`)} volume={0.4} />
      </>
    )}
  </>
);
