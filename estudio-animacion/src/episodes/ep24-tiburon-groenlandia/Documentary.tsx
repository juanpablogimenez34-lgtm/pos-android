// MUNDO INSÓLITO DOCUMENTALES — EL TIBURÓN QUE PUEDE VIVIR MÁS DE 400 AÑOS (Somniosus microcephalus).
// 180 s · 1080×1920 · 30 fps · 5.400 fotogramas · 12 escenas de 15 s sobre la carcasa del Estudio 2.0.
// 12 pistas: voz, música misteriosa, ambiente submarino, movimiento del agua, impactos y transiciones
// temporales (carcasa) + olas, barcos de madera, viento y velas, vapor, laboratorio y música del cierre.
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
export const GSHARK_CUES = cuesFromTiming(TIMING, 28);
const SPEECH = speechIntervals(TIMING);

const DIR = 'audio/ep24-tiburon-groenlandia';
export const GSHARK_AUDIO: AudioMix = {
  narration: {src: `${DIR}/narracion.m4a`, volume: 1},
  music: {src: `${DIR}/musica-misteriosa.m4a`, volume: 0.32, duckTo: 0.35},
  ambience: {src: `${DIR}/ambiente-submarino.m4a`, volume: 0.5},
  movement: {src: `${DIR}/movimiento-agua.m4a`, volume: 0.45},
  tension: {src: `${DIR}/impactos.m4a`, volume: 0.5},
  transitions: {src: `${DIR}/transiciones-temporales.m4a`, volume: 0.45},
};

export type GSharkDocProps = ShellProps & {extraTracks?: boolean};

export const GSharkDocumentary: React.FC<GSharkDocProps> = ({extraTracks = true, ...props}) => (
  <>
    <EpisodeShell {...props} scenes={DEFS} cues={GSHARK_CUES} speech={SPEECH} background="#061a22" extra={(t) => (
        <>
          <SceneTag t={t} />
          {/* transiciones motivadas: superficie ↔ profundidad (sin cortes bruscos de luz) */}
          {/* transiciones motivadas por el agua en los cambios superficie ↔ profundidad */}
          {[22.4, 44.4, 119.4, 154.4, 159.4, 169.4, 174.4].map((a) => <BubbleCurtain key={a} u={(t - a) / 1.2} />)}
        </>
      )} />
    {extraTracks && props.audio.narration && (
      <>
        <Audio src={staticFile(`${DIR}/olas.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/barcos-madera.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/viento-velas.m4a`)} volume={0.4} />
        <Audio src={staticFile(`${DIR}/motores-vapor.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/laboratorio.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/musica-cierre.m4a`)} volume={0.4} />
      </>
    )}
  </>
);
