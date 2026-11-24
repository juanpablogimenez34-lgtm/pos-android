// MUNDO INSÓLITO — EL CAMARÓN QUE DISPARA SIN BALAS (camarón pistola, género Alpheus).
// 60 s · 1080×1920 · 30 fps · 1.800 fotogramas · 8 escenas sobre la carcasa del Estudio 2.0.
// Pistas: voz, música cinematográfica, ambiente submarino, movimiento del camarón, chasquidos y transiciones
// (carcasa) + apertura de la pinza, colapso de la burbuja y onda de choque (montadas aparte).
import React from 'react';
import {Audio, staticFile} from 'remotion';
import {cuesFromTiming, speechIntervals, TimedLine} from '../../engine/cues';
import {AudioMix} from '../../engine/types';
import {BubbleCurtain, EpisodeShell, SceneDef, SceneOut, ShellProps} from '../../studio2';
import {SceneTag} from './components/common';
import narration from './data/narration-timing.json';
import {SCENES} from './data/timeline';
import {scene1, scene2, scene3, scene4} from './scenes/S1_4';
import {scene5, scene6, scene7, scene8} from './scenes/S5_8';

/** Fundido encadenado: durante `d` s al inicio de `next` se dibujan ambas escenas (sin cortes bruscos de luz). */
const xfade = (prev: (t: number) => SceneOut, next: (t: number) => SceneOut, at: number, d: number) => (t: number): SceneOut => {
  const u = (t - at) / d;
  if (u >= 1) return next(t);
  const e = u * u * (3 - 2 * u);
  const A = prev(t);
  const B = next(t);
  return {svg: <g>{A.svg}<g opacity={e}>{B.svg}</g></g>, overlay: <>{e < 0.5 && A.overlay}{e >= 0.5 && B.overlay}</>};
};
const FNS = [scene1, scene2, scene3, xfade(scene3, scene4, 20, 0.7), scene5, xfade(scene5, scene6, 40, 0.7), scene7, scene8];
const DEFS: SceneDef[] = SCENES.map((s, i) => ({start: s.start, end: s.end, render: FNS[i]}));
const TIMING = (narration as unknown as {timing: TimedLine[]}).timing;
export const SHRIMP_CUES = cuesFromTiming(TIMING, 32);
const SPEECH = speechIntervals(TIMING);

const DIR = 'audio/camaron-pistola';
export const SHRIMP_AUDIO: AudioMix = {
  narration: {src: `${DIR}/narracion.m4a`, volume: 1},
  music: {src: `${DIR}/musica.m4a`, volume: 0.34, duckTo: 0.4},
  ambience: {src: `${DIR}/ambiente-submarino.m4a`, volume: 0.5},
  movement: {src: `${DIR}/movimiento-camaron.m4a`, volume: 0.5},
  tension: {src: `${DIR}/chasquido.m4a`, volume: 0.62},
  transitions: {src: `${DIR}/transiciones.m4a`, volume: 0.45},
};

export type ShrimpDocProps = ShellProps & {extraTracks?: boolean};

export const ShrimpDocumentary: React.FC<ShrimpDocProps> = ({extraTracks = true, ...props}) => (
  <>
    <EpisodeShell {...props} scenes={DEFS} cues={SHRIMP_CUES} speech={SPEECH} background="#0d4a5e" extra={(t) => (
        <>
          <SceneTag t={t} />
          {/* entradas y salidas de la visualización científica, motivadas por el agua */}
          {[19.6, 39.6].map((a) => <BubbleCurtain key={a} u={(t - a) / 0.8} />)}
        </>
      )} />
    {extraTracks && props.audio.narration && (
      <>
        <Audio src={staticFile(`${DIR}/apertura-pinza.m4a`)} volume={0.5} />
        <Audio src={staticFile(`${DIR}/colapso-burbuja.m4a`)} volume={0.55} />
        <Audio src={staticFile(`${DIR}/onda-choque.m4a`)} volume={0.5} />
      </>
    )}
  </>
);
