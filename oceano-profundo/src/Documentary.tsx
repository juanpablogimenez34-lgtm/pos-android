// LOS MONSTRUOS REALES DE LAS PROFUNDIDADES DEL OCÉANO — documental de 10 min (1920×1080 · 30 fps · 18.000 fotogramas).
// Cada escena es una función pura del tiempo → fotogramas independientes y reproducibles.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {AudioMix} from './audio/AudioMix';
import {DepthGauge, Subtitles} from './components/UI';
import {CONFIG, QualityName} from './config';
import narration from './data/narration-timing.json';
import {SCENES} from './data/timeline';
import {Grade, WaterVeil} from './effects/Effects';
import {SceneFn, SceneOut, xfade} from './scenes/common';
import {scene01} from './scenes/S01_Gancho';
import {scene02} from './scenes/S02_Descenso';
import {scene03} from './scenes/S03_Pescador';
import {scene04} from './scenes/S04_Vibora';
import {scene05} from './scenes/S05_CalamarGigante';
import {scene06} from './scenes/S06_Cachalote';
import {scene07} from './scenes/S07_Colosal';
import {scene08} from './scenes/S08_Desconocido';
import {scene09} from './scenes/S09_Final';
import {ViewProvider} from './utils/context';
import {cuesFrom, speechIntervals, TimedLine} from './utils/cues';
import {ensureFonts} from './utils/fonts';

const TIMING = (narration as unknown as {timing: TimedLine[]}).timing;
export const DOC_CUES = cuesFrom(TIMING, CONFIG.subtitles.maxChars);
const SPEECH = speechIntervals(TIMING);
const HIGHLIGHT = ['architeuthis', 'mesonychoteuthis', 'bioluminisc', 'ecolocaliz', 'fotóforos', 'presión'];

const FNS: SceneFn[] = [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08, scene09];

/** Escena activa con fundido encadenado de 1,2 s en cada frontera. */
function sceneAt(t: number): SceneOut {
  const i = Math.max(0, SCENES.findIndex((s) => t >= s.start && t < s.end));
  const next = SCENES[i + 1];
  if (next && t > next.start - 1.2) return xfade(FNS[i], FNS[i + 1], next.start - 1.2, 1.2)(t);
  return FNS[i](t);
}

export type DocProps = {quality: QualityName; showSubtitles: boolean; audio: boolean};
export const Documentary: React.FC<DocProps> = ({quality, showSubtitles, audio}) => {
  ensureFonts();
  const f = useCurrentFrame();
  const t = f / CONFIG.fps;
  const sc = sceneAt(t);
  const n = SCENES.find((s) => t >= s.start && t < s.end)?.n ?? 1;
  return (
    <ViewProvider w={1920} h={1080} quality={quality}>
      <AbsoluteFill style={{background: '#02060c'}}>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>{sc.svg}</svg>
        <Grade t={t} vignette={sc.grade?.vignette ?? 0.7} tint={sc.grade?.tint} tintK={sc.grade?.tintK} warm={sc.grade?.warm} />
        {sc.overlay}
        {n !== 2 && n !== 1 && n !== 9 && sc.depth !== undefined && <DepthGauge k={0.9} depth={sc.depth} compact />}
        {/* velos orgánicos de agua en los cambios de especie */}
        {SCENES.slice(1).map((s) => <WaterVeil key={s.n} u={(t - s.start + 0.6) / 1.0} max={s.n === 3 || s.n === 4 ? 0.5 : 0.92} />)}
        {showSubtitles && <Subtitles cues={DOC_CUES} t={t} highlight={HIGHLIGHT} />}
        {audio && (
          <AudioMix narration="audio/documental/narracion.m4a" music="audio/documental/musica.m4a" speech={SPEECH} others={[
            {src: 'audio/documental/ambiente.m4a', volume: CONFIG.audio.ambience},
            {src: 'audio/documental/efectos.m4a', volume: CONFIG.audio.sfx},
            {src: 'audio/documental/transiciones.m4a', volume: CONFIG.audio.sfx * 0.8},
          ]} />
        )}
      </AbsoluteFill>
    </ViewProvider>
  );
};
