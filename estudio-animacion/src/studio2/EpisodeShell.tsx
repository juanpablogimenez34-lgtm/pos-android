// ESTUDIO 2.0 · CARCASA DE EPISODIO reutilizable: calidad, estilo, enrutado de escenas por tiempo,
// rótulos de segmento, subtítulos premium y mezcla de audio con prioridad de la voz.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AudioTracks} from '../engine/AudioTracks';
import {ensureFonts} from '../engine/fonts';
import {QualityName, QualityProvider} from '../engine/quality';
import {StyleProvider} from '../engine/style';
import {AudioMix, DuckInterval, SubtitleCue} from '../engine/types';
import {useTime} from '../engine/useTime';
import {Subtitles2} from './Subtitles2';

export type SceneOut = {svg: React.ReactNode; overlay?: React.ReactNode};
export type SceneDef = {start: number; end: number; render: (t: number) => SceneOut};
export type ShellProps = {quality: QualityName; showSubtitles: boolean; audio: AudioMix};

export const EpisodeShell: React.FC<ShellProps & {scenes: SceneDef[]; cues: SubtitleCue[]; speech: DuckInterval[]; avoid?: (t: number) => boolean; background?: string; extra?: (t: number) => React.ReactNode}> = ({quality, showSubtitles, audio, scenes, cues, speech, avoid, background = '#02060f', extra}) => {
  ensureFonts();
  return (
    <QualityProvider quality={quality}>
      <StyleProvider refined>
        <Inner {...{showSubtitles, audio, scenes, cues, speech, avoid, background, extra}} />
      </StyleProvider>
    </QualityProvider>
  );
};

const Inner: React.FC<{showSubtitles: boolean; audio: AudioMix; scenes: SceneDef[]; cues: SubtitleCue[]; speech: DuckInterval[]; avoid?: (t: number) => boolean; background: string; extra?: (t: number) => React.ReactNode}> = ({showSubtitles, audio, scenes, cues, speech, avoid, background, extra}) => {
  const t = useTime();
  const sc = scenes.find((s) => t >= s.start && t < s.end) ?? scenes[scenes.length - 1];
  const out = sc.render(t);
  // prioridad de la voz: la música baja bajo la narración (y algo menos el ambiente)
  const mix: AudioMix = {
    ...audio,
    music: audio.music ? {...audio.music, duck: speech} : undefined,
    ambience: audio.ambience ? {...audio.ambience, duck: speech, duckTo: 0.7} : undefined,
  };
  return (
    <AbsoluteFill style={{backgroundColor: background}}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>{out.svg}</svg>
      </AbsoluteFill>
      {out.overlay}
      {extra?.(t)}
      {showSubtitles && <Subtitles2 cues={cues} avoid={avoid} />}
      <AudioTracks mix={mix} />
    </AbsoluteFill>
  );
};
