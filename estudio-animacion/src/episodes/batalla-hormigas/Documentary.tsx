// MUNDO INSÓLITO · BATALLAS DE LA NATURALEZA — HORMIGA NEGRA VS. HORMIGA ROJA: ¿QUIÉN GANARÍA?
// Camponotus pennsylvanicus (10 mm en la simulación) frente a Solenopsis invicta (5 mm): proporción 2:1 constante.
// 180 s · 1080×1920 · 30 fps · 5.400 fotogramas · 7 escenas sobre la carcasa del Estudio 2.0 (motor del pulpo).
// Pistas: voz, música, ambiente natural, movimiento, tensión y transiciones (carcasa) + viento y hojas, insectos,
// pasos, tierra (montadas aparte).
import React from 'react';
import {Audio, staticFile} from 'remotion';
import {cuesFromTiming, speechIntervals, TimedLine} from '../../engine/cues';
import {AudioMix} from '../../engine/types';
import {EpisodeShell, SceneDef, SceneOut, ShellProps} from '../../studio2';
import {SceneTag} from './components/common';
import narration from './data/narration-timing.json';
import {SCENES} from './data/timeline';
import {duelFrame} from './scenes/Duel';
import {scene2, scene3} from './scenes/Nests';
import {scene4, scene6, scene7} from './scenes/Colony';

const xfade = (prev: (t: number) => SceneOut, next: (t: number) => SceneOut, at: number, d: number) => (t: number): SceneOut => {
  const u = (t - at) / d;
  if (u >= 1) return next(t);
  const e = u * u * (3 - 2 * u);
  const A = prev(t);
  const B = next(t);
  return {svg: <g>{A.svg}<g opacity={e}>{B.svg}</g></g>, overlay: <>{e < 0.5 ? A.overlay : B.overlay}</>};
};
export const HORMIGAS_RAW: ((t: number) => SceneOut)[] = [duelFrame, scene2, scene3, scene4, duelFrame, scene6, scene7];
const FNS = HORMIGAS_RAW.map((f, i) => (i === 0 || i === 6 ? f : xfade(HORMIGAS_RAW[i - 1], f, SCENES[i].start, 0.7)));
const DEFS: SceneDef[] = SCENES.map((s, i) => ({start: s.start, end: s.end, render: FNS[i]}));
const TIMING = (narration as unknown as {timing: TimedLine[]}).timing;
export const HORMIGAS_CUES = cuesFromTiming(TIMING, 32);
const SPEECH = speechIntervals(TIMING);

const DIR = 'audio/hormigas';
export const HORMIGAS_AUDIO: AudioMix = {
  narration: {src: `${DIR}/narracion.m4a`, volume: 1},
  music: {src: `${DIR}/musica.m4a`, volume: 0.3, duckTo: 0.4},
  ambience: {src: `${DIR}/ambiente-natural.m4a`, volume: 0.45},
  movement: {src: `${DIR}/movimiento.m4a`, volume: 0.5},
  tension: {src: `${DIR}/tension.m4a`, volume: 0.45},
  transitions: {src: `${DIR}/transiciones.m4a`, volume: 0.45},
};
export type HormigasDocProps = ShellProps & {extraTracks?: boolean};
export const HormigasDocumentary: React.FC<HormigasDocProps> = ({extraTracks = true, ...props}) => (
  <>
    <EpisodeShell {...props} scenes={DEFS} cues={HORMIGAS_CUES} speech={SPEECH} background="#2a1a0c" extra={(t) => <SceneTag t={t} />} />
    {extraTracks && props.audio.narration && (
      <>
        <Audio src={staticFile(`${DIR}/viento-hojas.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/insectos.m4a`)} volume={0.4} />
        <Audio src={staticFile(`${DIR}/pasos.m4a`)} volume={0.5} />
        <Audio src={staticFile(`${DIR}/tierra.m4a`)} volume={0.45} />
      </>
    )}
  </>
);
