// MUNDO INSÓLITO DOCUMENTALES — EL MIXINO: EL ANIMAL QUE CONVIERTE EL AGUA EN MOCO.
// 180 s · 1080×1920 · 30 fps · 5.400 fotogramas. Doce escenas de 15 s sobre la carcasa del Estudio 2.0
// (subtítulos sincronizados con la locución medida y mezcla con prioridad de la voz). Siete pistas:
// las seis estándar de la carcasa + una pista propia de sonidos de mucosidad.
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
import {scene05} from './scenes/S05';
import {scene06} from './scenes/S06';
import {scene07, scene08} from './scenes/S07';
import {scene09} from './scenes/S09';
import {scene10} from './scenes/S10';
import {scene11} from './scenes/S11';
import {scene12} from './scenes/S12';

const FNS = [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08, scene09, scene10, scene11, scene12];
const DEFS: SceneDef[] = SCENES.map((s, i) => ({start: s.start, end: s.end, render: FNS[i]}));
const TIMING = (narration as unknown as {timing: TimedLine[]}).timing;
export const MIXINO_CUES = cuesFromTiming(TIMING, 28);
const SPEECH = speechIntervals(TIMING);

const DIR = 'audio/ep18-mixino';
/** Voz Piper es_MX (local) + música y efectos ORIGINALES (tools/audio/score_ep18_mixino.py). */
export const MIXINO_AUDIO: AudioMix = {
  narration: {src: `${DIR}/narracion.m4a`, volume: 1},
  music: {src: `${DIR}/musica.m4a`, volume: 0.32, duckTo: 0.35},
  ambience: {src: `${DIR}/ambiente.m4a`, volume: 0.55},
  movement: {src: `${DIR}/movimiento.m4a`, volume: 0.5},
  tension: {src: `${DIR}/suspenso.m4a`, volume: 0.5},
  transitions: {src: `${DIR}/transiciones.m4a`, volume: 0.5},
};

export type MixinoProps = ShellProps & {slimeTrack?: boolean};
export const MixinoDocumentary: React.FC<MixinoProps> = ({slimeTrack: _s, ...props}) => (
  <EpisodeShell
    {...props}
    scenes={DEFS}
    cues={MIXINO_CUES}
    speech={SPEECH}
    background="#04141c"
    extra={(t) => <SceneTag t={t} />}
  />
);

/** Pista 7 (mucosidad): se monta fuera del enrutado de escenas para que suene continua. */
export const MixinoWithSlime: React.FC<MixinoProps> = (props) => (
  <>
    <MixinoDocumentary {...props} />
    {props.slimeTrack !== false && props.audio.narration && <Audio src={staticFile(`${DIR}/mucosidad.m4a`)} volume={0.6} />}
  </>
);
