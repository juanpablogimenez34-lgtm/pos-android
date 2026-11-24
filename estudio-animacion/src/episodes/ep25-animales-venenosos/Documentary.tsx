// MUNDO INSÓLITO DOCUMENTALES — 20 ANIMALES VENENOSOS QUE PARECEN DE OTRO PLANETA.
// 180 s · 1080×1920 · 30 fps · 5.400 fotogramas · 22 secuencias (gancho 10 s + 20 animales × 8 s + cierre
// 10 s) sobre la carcasa del Estudio 2.0. Solo se monta la escena activa (carga por escenas).
// Pistas: voz, música, ambiente de selva, movimiento sobre arena, impactos y transiciones (carcasa) +
// desierto, submarino, hojas, cascabel, burbujas, agua y música de cierre (montadas aparte).
import React from 'react';
import {Audio, staticFile} from 'remotion';
import {cuesFromTiming, speechIntervals, TimedLine} from '../../engine/cues';
import {AudioMix} from '../../engine/types';
import {BubbleCurtain, EpisodeShell, SceneDef, ShellProps} from '../../studio2';
import narration from './data/narration-timing.json';
import {ANIMALS, INTRO, OUTRO} from './data/timeline';
import {DustWipe, LeafWipe} from './environment/Habitats';
import {a01, a02, a03, a04, a05, a06, a07, a08, a09, a10} from './scenes/A01_10';
import {a11, a12, a13, a14, a15, a16, a17, a18, a19, a20} from './scenes/A11_20';
import {intro, outro} from './scenes/IntroOutro';

const FNS = [a01, a02, a03, a04, a05, a06, a07, a08, a09, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20];
const DEFS: SceneDef[] = [
  {start: INTRO.start, end: INTRO.end, render: intro},
  ...ANIMALS.map((a, i) => ({start: a.start, end: a.start + 8, render: (t: number) => FNS[i](t - a.start)})),
  {start: OUTRO.start, end: OUTRO.end, render: outro},
];
const TIMING = (narration as unknown as {timing: TimedLine[]}).timing;
export const VENOM_CUES = cuesFromTiming(TIMING, 28);
const SPEECH = speechIntervals(TIMING);

// transiciones entre animales: hojas (hábitats húmedos), polvo (desiertos), burbujas (agua)
const WIPES: [number, 'leaf' | 'dust' | 'bubble'][] = [
  [10, 'leaf'], [18, 'dust'], [26, 'dust'], [34, 'leaf'], [42, 'dust'], [50, 'dust'], [58, 'dust'], [66, 'dust'], [74, 'leaf'], [82, 'leaf'], [90, 'leaf'],
  [98, 'bubble'], [106, 'bubble'], [114, 'bubble'], [122, 'bubble'], [130, 'bubble'], [138, 'bubble'], [146, 'dust'], [154, 'bubble'], [162, 'leaf'], [170, 'leaf'],
];
const Wipes: React.FC<{t: number}> = ({t}) => (
  <>
    {WIPES.map(([b, k]) => {
      const u = (t - (b - 0.55)) / 1.1;
      if (u <= 0 || u >= 1) return null;
      return k === 'leaf' ? <LeafWipe key={b} u={u} /> : k === 'dust' ? <DustWipe key={b} u={u} /> : <BubbleCurtain key={b} u={u} />;
    })}
  </>
);

const DIR = 'audio/ep25-animales-venenosos';
export const VENOM_AUDIO: AudioMix = {
  narration: {src: `${DIR}/narracion.m4a`, volume: 1},
  music: {src: `${DIR}/musica.m4a`, volume: 0.32, duckTo: 0.35},
  ambience: {src: `${DIR}/ambiente-selva.m4a`, volume: 0.45},
  movement: {src: `${DIR}/movimiento-arena.m4a`, volume: 0.45},
  tension: {src: `${DIR}/impactos.m4a`, volume: 0.5},
  transitions: {src: `${DIR}/transiciones.m4a`, volume: 0.45},
};

export type VenomDocProps = ShellProps & {extraTracks?: boolean};

export const VenomDocumentary: React.FC<VenomDocProps> = ({extraTracks = true, ...props}) => (
  <>
    <EpisodeShell {...props} scenes={DEFS} cues={VENOM_CUES} speech={SPEECH} background="#10140e" extra={(t) => <Wipes t={t} />} />
    {extraTracks && props.audio.narration && (
      <>
        <Audio src={staticFile(`${DIR}/ambiente-desierto.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/ambiente-submarino.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/hojas.m4a`)} volume={0.4} />
        <Audio src={staticFile(`${DIR}/cascabel.m4a`)} volume={0.45} />
        <Audio src={staticFile(`${DIR}/burbujas.m4a`)} volume={0.4} />
        <Audio src={staticFile(`${DIR}/agua.m4a`)} volume={0.4} />
        <Audio src={staticFile(`${DIR}/musica-cierre.m4a`)} volume={0.4} />
      </>
    )}
  </>
);
