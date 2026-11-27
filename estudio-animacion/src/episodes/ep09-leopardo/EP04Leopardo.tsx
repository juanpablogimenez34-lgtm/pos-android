// MUNDO INSÓLITO DOCUMENTALES · EP04 — EL LEOPARDO: EL FANTASMA DE LA SELVA (180 s, 1080×1920, 30 fps).
// Composición independiente (carpeta ep09-leopardo para no tocar el EP04 existente del halcón).
// Reutiliza del motor: mezcla de audio con ducking, subtítulos con palabras destacadas,
// etiquetas de capítulo, fuentes y calidad.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AudioTracks} from '../../engine/AudioTracks';
import {ensureFonts} from '../../engine/fonts';
import {ChapterTag} from '../../engine/Overlays';
import {QualityName, QualityProvider} from '../../engine/quality';
import {StyleProvider} from '../../engine/style';
import {Subtitles} from '../../engine/Subtitles';
import {AudioMix} from '../../engine/types';
import {useTime} from '../../engine/useTime';
import {sceneAt, SCENES} from './config/episode';
import {scene01} from './scenes/LeopardScene01';
import {scene02} from './scenes/LeopardScene02';
import {scene03} from './scenes/LeopardScene03';
import {scene04} from './scenes/LeopardScene04';
import {scene05} from './scenes/LeopardScene05';
import {scene06} from './scenes/LeopardScene06';
import {scene07} from './scenes/LeopardScene07';
import {scene08} from './scenes/LeopardScene08';
import {scene09} from './scenes/LeopardScene09';
import {scene10} from './scenes/LeopardScene10';
import {scene11} from './scenes/LeopardScene11';
import {scene12} from './scenes/LeopardScene12';
import {CUES, SPEECH} from './subtitles/subtitles';

export type EP04LeopardoProps = {quality: QualityName; showSubtitles: boolean; audio: AudioMix};
const FNS = [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08, scene09, scene10, scene11, scene12];

const Scene: React.FC<{showSubtitles: boolean; audio: AudioMix}> = ({showSubtitles, audio}) => {
  const t = useTime();
  const sc = sceneAt(t);
  const out = FNS[sc.n - 1](t);
  const mix: AudioMix = {...audio, music: audio.music ? {...audio.music, duck: SPEECH} : undefined};
  // transición: breve fundido a negro en cada corte de escena (salvo la primera)
  const edge = Math.min(t - sc.start, sc.end - t);
  const cut = sc.n > 1 && t - sc.start < 0.35 ? 1 - (t - sc.start) / 0.35 : sc.n < 12 && sc.end - t < 0.25 ? 1 - (sc.end - t) / 0.25 : 0;
  return (
    <AbsoluteFill style={{backgroundColor: '#050302'}}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>{out.svg}</svg>
      </AbsoluteFill>
      {out.overlay}
      {cut > 0 && edge < 0.4 && <AbsoluteFill style={{background: '#050302', opacity: Math.min(0.85, cut)}} />}
      {SCENES.slice(1, 11).map((s) => (
        <ChapterTag key={s.n} start={s.start + 0.5} num={String(s.n).padStart(2, '0')} label={s.title} />
      ))}
      {showSubtitles && <Subtitles cues={CUES} centerY={0.76} highlightColor="#ffd23f" />}
      <AudioTracks mix={mix} />
    </AbsoluteFill>
  );
};

export const EP04Leopardo: React.FC<EP04LeopardoProps> = ({quality, showSubtitles, audio}) => {
  ensureFonts();
  return (
    <QualityProvider quality={quality}>
      <StyleProvider refined>
        <Scene showSubtitles={showSubtitles} audio={audio} />
      </StyleProvider>
    </QualityProvider>
  );
};
