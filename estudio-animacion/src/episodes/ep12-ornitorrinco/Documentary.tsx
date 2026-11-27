// MUNDO INSÓLITO DOCUMENTALES — EL ORNITORRINCO: EL ANIMAL QUE PARECE IMPOSIBLE (Ornithorhynchus anatinus).
// 180 s · 1080×1920 · 30 fps · 5.400 fotogramas · 12 escenas de 15 s sobre la carcasa del Estudio 2.0.
// 12 pistas: voz, música documental, ambiente de bosque, corriente del río, remadas y transiciones (carcasa) +
// hojas, pasos sobre tierra, entrada al agua, burbujas, sedimentos y música del cierre (montadas aparte).
import React from 'react';
import {Audio, staticFile} from 'remotion';
import {cuesFromTiming, speechIntervals, TimedLine} from '../../engine/cues';
import {AudioMix} from '../../engine/types';
import {BubbleCurtain, EpisodeShell, SceneDef, ShellProps} from '../../studio2';
import {SceneTag} from './components/common';
import narration from './data/narration-timing.json';
import {SCENES} from './data/timeline';
import {scene01, scene02, scene03, scene04} from './scenes/S01_04';
import {scene05, scene06, scene07, scene08} from './scenes/S05_08';
import {scene09, scene10, scene11, scene12} from './scenes/S09_12';

const FNS = [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08, scene09, scene10, scene11, scene12];
const DEFS: SceneDef[] = SCENES.map((s, i) => ({start: s.start, end: s.end, render: FNS[i]}));
const TIMING = (narration as unknown as {timing: TimedLine[]}).timing;
export const PLATY_CUES = cuesFromTiming(TIMING, 28);
const SPEECH = speechIntervals(TIMING);

const DIR = 'audio/ep12-ornitorrinco';
export const PLATY_AUDIO: AudioMix = {
  narration: {src: `${DIR}/narracion.m4a`, volume: 1},
  music: {src: `${DIR}/musica-documental.m4a`, volume: 0.32, duckTo: 0.35},
  ambience: {src: `${DIR}/ambiente-bosque.m4a`, volume: 0.45},
  movement: {src: `${DIR}/corriente-rio.m4a`, volume: 0.45},
  tension: {src: `${DIR}/remadas.m4a`, volume: 0.45},
  transitions: {src: `${DIR}/transiciones.m4a`, volume: 0.45},
};

export type PlatyDocProps = ShellProps & {extraTracks?: boolean};

export const PlatyDocumentary: React.FC<PlatyDocProps> = ({extraTracks = true, ...props}) => (
  <>
    <EpisodeShell {...props} scenes={DEFS} cues={PLATY_CUES} speech={SPEECH} background="#14261e" extra={(t) => (
        <>
          <SceneTag t={t} />
          {/* transiciones motivadas: superficie ↔ profundidad (sin cortes bruscos de luz) */}
          {/* transiciones motivadas por el agua en los cambios superficie ↔ profundidad */}
          {[89.4, 149.4, 164.4].map((a) => <BubbleCurtain key={a} u={(t - a) / 1.2} />)}
        </>
      )} />
    {extraTracks && props.audio.narration && (
      <>
        <Audio src={staticFile(`${DIR}/hojas.m4a`)} volume={0.4} />
        <Audio src={staticFile(`${DIR}/pasos.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/entrada-agua.m4a`)} volume={0.5} />
        <Audio src={staticFile(`${DIR}/burbujas.m4a`)} volume={0.4} />
        <Audio src={staticFile(`${DIR}/sedimentos.m4a`)} volume={0.4} />
        <Audio src={staticFile(`${DIR}/musica-cierre.m4a`)} volume={0.4} />
      </>
    )}
  </>
);
