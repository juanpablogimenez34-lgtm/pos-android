// MUNDO INSÓLITO — LA FOSA DE LAS MARIANAS: ¿QUÉ VIVE A 11.000 METROS BAJO EL MAR?
// 600 s · 1920×1080 · 30 fps · 18.000 fotogramas · 10 secuencias sobre el motor 2.5D original del pulpo
// (engine/camera, nieve marina y oscuridad del episodio abisal) con una carcasa horizontal propia.
import React from 'react';
import {cuesFromTiming, speechIntervals, TimedLine} from '../../engine/cues';
import {AudioMix} from '../../engine/types';
import {QualityName} from '../../engine/quality';
import {useTime} from '../../engine/useTime';
import {HShell, SceneDef} from './components/HShell';
import {depthAt} from './data/depth';
import narration from './data/narration-timing.json';
import {SCENES} from './data/timeline';
import {DepthHUD} from './hud/HUD';
import {SCENE_FNS} from './scenes';

const TIMING = (narration as unknown as {timing: TimedLine[]}).timing;
export const FOSA_CUES = cuesFromTiming(TIMING, 52);
const SPEECH = speechIntervals(TIMING);
const DEFS: SceneDef[] = SCENES.map((s, i) => ({start: s.start, end: s.end, render: SCENE_FNS[Math.min(i, SCENE_FNS.length - 1)]}));
// datos ocasionales de presión y temperatura (no saturar la pantalla)
const INFO: [number, number][] = [[46, 56], [96, 104], [140, 150], [205, 214], [250, 258], [311, 319], [392, 400], [470, 478], [532, 540], [565, 575]];
const win = (t: number, a: number, b: number, r = 0.6) => Math.max(0, Math.min(1, (t - a) / r, (b - t) / r));

const DIR = 'audio/fosa';
export const FOSA_AUDIO: AudioMix = {
  narration: {src: `${DIR}/narracion.m4a`, volume: 1},
  music: {src: `${DIR}/musica.m4a`, volume: 0.32, duckTo: 0.4},
  ambience: {src: `${DIR}/ambiente-submarino.m4a`, volume: 0.45},
  movement: {src: `${DIR}/movimiento-agua.m4a`, volume: 0.45},
  tension: {src: `${DIR}/tension.m4a`, volume: 0.42},
  transitions: {src: `${DIR}/transiciones.m4a`, volume: 0.42},
};
const EXTRA = ['oceano-olas', 'burbujas-salpicaduras', 'cetaceos', 'ecolocalizacion', 'sumergible', 'propulsores', 'instrumentos'].map((n, i) => ({src: `${DIR}/${n}.m4a`, volume: [0.5, 0.5, 0.45, 0.5, 0.42, 0.42, 0.4][i]}));

export type FosaProps = {quality: QualityName; showSubtitles: boolean; audio: AudioMix; extraTracks?: boolean};
const Hud: React.FC = () => {
  const t = useTime();
  const d = depthAt(t);
  const k = Math.max(0, Math.min(1, (t - 30.4) / 0.8));
  const info = INFO.reduce((a, [s, e]) => Math.max(a, win(t, s, e)), 0);
  return <DepthHUD d={d} k={k} info={info} />;
};
export const FosaDocumentary: React.FC<FosaProps> = ({extraTracks = true, ...props}) => (
  <HShell {...props} scenes={DEFS} cues={FOSA_CUES} speech={SPEECH} hud={() => <Hud />} extraAudio={extraTracks ? EXTRA : []} />
);
