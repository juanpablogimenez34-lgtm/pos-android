// MUNDO INSÓLITO DOCUMENTALES — EL CALAMAR GIGANTE: EL MONSTRUO REAL DE LAS PROFUNDIDADES (Architeuthis dux).
// 180 s · 1080×1920 · 30 fps · 5.400 fotogramas · 12 escenas de 15 s sobre la carcasa del Estudio 2.0.
// Diez pistas: voz, música ambiental, ambiente submarino, movimiento del calamar, suspenso de caza y
// transiciones (carcasa) + tentáculos, propulsión del sifón, encuentro con el cachalote y música final.
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
export const SQUID_CUES = cuesFromTiming(TIMING, 28);
const SPEECH = speechIntervals(TIMING);

const DIR = 'audio/ep22-calamar-gigante';
export const SQUID_AUDIO: AudioMix = {
  narration: {src: `${DIR}/narracion.m4a`, volume: 1},
  music: {src: `${DIR}/musica-ambiental.m4a`, volume: 0.32, duckTo: 0.35},
  ambience: {src: `${DIR}/ambiente-submarino.m4a`, volume: 0.5},
  movement: {src: `${DIR}/movimiento-calamar.m4a`, volume: 0.45},
  tension: {src: `${DIR}/suspenso-caza.m4a`, volume: 0.45},
  transitions: {src: `${DIR}/transiciones.m4a`, volume: 0.45},
};

export type SquidDocProps = ShellProps & {extraTracks?: boolean};

export const SquidDocumentary: React.FC<SquidDocProps> = ({extraTracks = true, ...props}) => (
  <>
    <EpisodeShell {...props} scenes={DEFS} cues={SQUID_CUES} speech={SPEECH} background="#020814" extra={(t) => <SceneTag t={t} />} />
    {extraTracks && props.audio.narration && (
      <>
        <Audio src={staticFile(`${DIR}/tentaculos.m4a`)} volume={0.5} />
        <Audio src={staticFile(`${DIR}/sifon.m4a`)} volume={0.5} />
        <Audio src={staticFile(`${DIR}/encuentro-cachalote.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/musica-final.m4a`)} volume={0.4} />
      </>
    )}
  </>
);
