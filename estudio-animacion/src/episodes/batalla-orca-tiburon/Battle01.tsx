// MUNDO INSÓLITO — BATALLAS DE LA NATURALEZA · T01 · BATALLA 01: ORCA VS. TIBURÓN BLANCO.
// Línea temporal principal de 140 s (4.200 fotogramas) sobre la carcasa del Estudio 2.0 (motor del pulpo).
// Cinco composiciones: Battle01Episode01…04 (35 s, cada una usa el FOTOGRAMA GLOBAL de su tramo mediante una
// secuencia desplazada) y Battle01Complete (140 s, sin las llamadas a la siguiente parte).
import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {cuesFromTiming, speechIntervals, TimedLine} from '../../engine/cues';
import {AudioMix} from '../../engine/types';
import {EpisodeShell, ShellProps} from '../../studio2';
import timingEp from './data/narration-timing-episodios.json';
import timingFull from './data/narration-timing-completo.json';
import {EP_FRAMES, TOTAL_SEC, Variant} from './engine/timeline';
import {battleFrame} from './scenes/Battle';

const T = {episodios: (timingEp as unknown as {timing: TimedLine[]}).timing, completo: (timingFull as unknown as {timing: TimedLine[]}).timing};
const CUES = {episodios: cuesFromTiming(T.episodios, 32), completo: cuesFromTiming(T.completo, 32)};
const SPEECH = {episodios: speechIntervals(T.episodios), completo: speechIntervals(T.completo)};
const DIR = 'audio/batalla';
export const battleAudio = (variant: Variant): AudioMix => ({
  narration: {src: `${DIR}/narracion-${variant}.m4a`, volume: 1},
  music: {src: `${DIR}/musica.m4a`, volume: 0.32, duckTo: 0.42},
  ambience: {src: `${DIR}/ambiente-submarino.m4a`, volume: 0.45},
  movement: {src: `${DIR}/movimiento-agua.m4a`, volume: 0.5},
  tension: {src: `${DIR}/tension.m4a`, volume: 0.45},
  transitions: {src: `${DIR}/transiciones.m4a`, volume: 0.5},
});
export type BattleProps = ShellProps & {variant: Variant; extraTracks?: boolean};
export const Battle01: React.FC<BattleProps> = ({variant, extraTracks = true, ...props}) => (
  <>
    <EpisodeShell {...props} scenes={[{start: 0, end: TOTAL_SEC + 1, render: (t) => battleFrame(t, variant)}]} cues={CUES[variant]} speech={SPEECH[variant]} background="#041a2e" />
    {extraTracks && props.audio.narration && (
      <>
        <Audio src={staticFile(`${DIR}/oceano-olas.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/orcas.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/ecolocalizacion.m4a`)} volume={0.5} />
        <Audio src={staticFile(`${DIR}/burbujas-turbulencia.m4a`)} volume={0.5} />
      </>
    )}
  </>
);
/** Episodio n (1–4): la línea global desplazada; el fotograma local f equivale al global (n−1)·1050 + f. */
export const Battle01Episode: React.FC<BattleProps & {n: number}> = ({n, ...props}) => (
  <Sequence from={-(n - 1) * EP_FRAMES} layout="none">
    <Battle01 {...props} variant="episodios" />
  </Sequence>
);
