// EPISODIO 08 — LA MEDUSA QUE PUEDE VOLVER A SER JOVEN (Turritopsis dohrnii).
// Composición independiente: no toca ningún episodio anterior. Reutiliza del motor la mezcla de
// audio con ducking, los subtítulos, las etiquetas de capítulo, la tarjeta final y las fuentes.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AudioTracks} from '../../engine/AudioTracks';
import {ensureFonts, FONT_FAMILY} from '../../engine/fonts';
import {ChapterTag} from '../../engine/Overlays';
import {QualityName, QualityProvider} from '../../engine/quality';
import {StyleProvider} from '../../engine/style';
import {Subtitles} from '../../engine/Subtitles';
import {AudioMix} from '../../engine/types';
import {useTime} from '../../engine/useTime';
import {scene1, scene2} from './Scenes/Opening';
import {scene3, scene4, scene5} from './Scenes/Middle';
import {scene6, scene7, scene8, scene9} from './Scenes/Late';
import {CUES, SPEECH} from './Subtitles/subtitles';
import {IMPLEMENTED, SCENES, sceneAt} from './Timeline/timeline';

export type Ep08FullProps = {quality: QualityName; showSubtitles: boolean; audio: AudioMix};

const Scene: React.FC<{showSubtitles: boolean; audio: AudioMix}> = ({showSubtitles, audio}) => {
  const t = useTime();
  const sc = sceneAt(t);
  const fns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9];
  const out = fns[sc.n - 1](t);
  const mix: AudioMix = {...audio, music: audio.music ? {...audio.music, duck: SPEECH} : undefined};
  return (
    <AbsoluteFill style={{backgroundColor: '#02030f'}}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>{out.svg}</svg>
      </AbsoluteFill>
      {out.overlay}
      {SCENES.slice(1, 8).map((s) => (
        <ChapterTag key={s.n} start={s.start + 0.6} num={`0${s.n}`} label={s.title} />
      ))}
      {sc.n > IMPLEMENTED && (
        <div style={{position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_FAMILY, color: '#ffd27a', fontSize: 30, fontWeight: 800}}>
          Escena {sc.n} pendiente de producción (tras aprobar la demo)
        </div>
      )}
      {showSubtitles && <Subtitles cues={CUES} centerY={0.8} highlightColor="#8fe9ff" />}
      <AudioTracks mix={mix} />
    </AbsoluteFill>
  );
};

export const Ep08Full: React.FC<Ep08FullProps> = ({quality, showSubtitles, audio}) => {
  ensureFonts();
  return (
    <QualityProvider quality={quality}>
      <StyleProvider refined>
        <Scene showSubtitles={showSubtitles} audio={audio} />
      </StyleProvider>
    </QualityProvider>
  );
};
