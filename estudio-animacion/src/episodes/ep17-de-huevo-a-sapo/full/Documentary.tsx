// DE HUEVO A SAPO: UNA TRANSFORMACIÓN INCREÍBLE — documental completo.
// 180 s · 1080×1920 · 30 fps · 5.400 fotogramas. Siete escenas sobre la carcasa del Estudio 2.0
// (subtítulos sincronizados con la locución medida, mezcla de seis pistas con prioridad de la voz).
import React from 'react';
import {cuesFromTiming, speechIntervals, TimedLine} from '../../../engine/cues';
import {AudioMix} from '../../../engine/types';
import {EpisodeShell, SceneDef, ShellProps} from '../../../studio2';
import {SceneTag} from './components/shared';
import narration from './data/narration-timing.json';
import {SCENES} from './data/timeline';
import {scene1} from './scenes/Scene1';
import {scene2} from './scenes/Scene2';
import {scene3} from './scenes/Scene3';
import {scene4} from './scenes/Scene4';
import {scene5} from './scenes/Scene5';
import {scene6} from './scenes/Scene6';
import {scene7} from './scenes/Scene7';

const FNS = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
const DEFS: SceneDef[] = SCENES.map((s, i) => ({start: s.start, end: s.end, render: FNS[i]}));

const TIMING = (narration as unknown as {timing: TimedLine[]}).timing;
export const SAPO_CUES = cuesFromTiming(TIMING, 28);
const SPEECH = speechIntervals(TIMING);

/** Voz Piper es_MX (local) + banda sonora y efectos ORIGINALES (tools/audio/score_ep17_sapo.py). */
export const SAPO_AUDIO: AudioMix = {
  narration: {src: 'audio/ep17-de-huevo-a-sapo-180/narracion.m4a', volume: 1},
  music: {src: 'audio/ep17-de-huevo-a-sapo-180/musica.m4a', volume: 0.34, duckTo: 0.35},
  ambience: {src: 'audio/ep17-de-huevo-a-sapo-180/ambiente.m4a', volume: 0.55},
  movement: {src: 'audio/ep17-de-huevo-a-sapo-180/movimiento.m4a', volume: 0.5},
  tension: {src: 'audio/ep17-de-huevo-a-sapo-180/revelacion.m4a', volume: 0.5},
  transitions: {src: 'audio/ep17-de-huevo-a-sapo-180/transiciones.m4a', volume: 0.5},
};

export type SapoDocProps = ShellProps;
export const SapoDocumentary: React.FC<SapoDocProps> = (props) => (
  <EpisodeShell {...props} scenes={DEFS} cues={SAPO_CUES} speech={SPEECH} background="#06282e" extra={(t) => <SceneTag t={t} />} />
);
