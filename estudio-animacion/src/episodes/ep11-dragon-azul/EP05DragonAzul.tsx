// MUNDO INSÓLITO DOCUMENTALES · EP05 — EL DRAGÓN AZUL: LA CRIATURA QUE PARECE DE OTRO PLANETA.
// 180 s · 1080×1920 · 30 fps · 5.400 fotogramas. Módulo independiente (carpeta ep11-dragon-azul):
// no modifica ningún episodio anterior (el EP05 de la planta carnívora queda intacto).
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
import {scene01, scene02, scene03, scene04} from './scenes/ScenesA';
import {scene05, scene06, scene07, scene08} from './scenes/ScenesB';
import {scene09, scene10, scene11, scene12} from './scenes/ScenesC';
import {CUES, SPEECH} from './subtitles/subtitles';

export type EP05DragonProps = {quality: QualityName; showSubtitles: boolean; audio: AudioMix};
const FNS = [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08, scene09, scene10, scene11, scene12];

const Episode: React.FC<{showSubtitles: boolean; audio: AudioMix}> = ({showSubtitles, audio}) => {
  const t = useTime();
  const sc = sceneAt(t);
  const out = FNS[sc.n - 1](t);
  const mix: AudioMix = {...audio, music: audio.music ? {...audio.music, duck: SPEECH} : undefined};
  // transición breve entre escenas: destello azulado (no negro) de 0,3 s
  const d = Math.min(t - sc.start, sc.end - t);
  const flash = sc.n > 1 && t - sc.start < 0.3 ? 1 - (t - sc.start) / 0.3 : sc.n < 12 && sc.end - t < 0.2 ? 1 - (sc.end - t) / 0.2 : 0;
  return (
    <AbsoluteFill style={{backgroundColor: '#00030a'}}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>{out.svg}</svg>
      </AbsoluteFill>
      {out.overlay}
      {flash > 0 && d < 0.3 && <AbsoluteFill style={{background: '#0a3a7a', opacity: 0.55 * flash}} />}
      {SCENES.slice(1).map((s) => (
        <ChapterTag key={s.n} start={s.start + 0.3} num={String(s.n).padStart(2, '0')} label={s.title} duration={2.8} />
      ))}
      {showSubtitles && <Subtitles cues={CUES} centerY={0.765} fontSize={52} highlightColor="#ffd23f" />}
      <AudioTracks mix={mix} />
    </AbsoluteFill>
  );
};

export const EP05DragonAzul: React.FC<EP05DragonProps> = ({quality, showSubtitles, audio}) => {
  ensureFonts();
  return (
    <QualityProvider quality={quality}>
      <StyleProvider refined>
        <Episode showSubtitles={showSubtitles} audio={audio} />
      </StyleProvider>
    </QualityProvider>
  );
};
