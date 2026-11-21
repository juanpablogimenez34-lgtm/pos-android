// OPENMONTAGE DOCUMENTALES · EPISODIO 04 — EL CAMARÓN MANTIS: EL PEQUEÑO GIGANTE DEL OCÉANO.
// Producción cinematográfica premium 2.0 · 180 s · 1080×1920 · 30 fps · 5.400 fotogramas.
// Composición principal (ID "EP04-MantisShrimp-Premium"). Carpeta independiente: no modifica
// ningún episodio anterior. Todo es procedural y determinista (depende solo del fotograma).
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
import {ACTS, SEQUENCES, seqAt} from './config/sequences';
import {seq01, seq02, seq03, seq04} from './sequences/Act1';
import {seq05, seq06, seq07} from './sequences/Act2';
import {seq08, seq09, seq10, seq11, seq12} from './sequences/Act3';
import {seq13, seq14, seq15, seq16} from './sequences/Act4';
import {seq17, seq18, seq19, seq20} from './sequences/Act5';
import {CUES, SPEECH} from './subtitles/subtitles';

export type EP04MantisProps = {quality: QualityName; showSubtitles: boolean; audio: AudioMix};
const FNS = [seq01, seq02, seq03, seq04, seq05, seq06, seq07, seq08, seq09, seq10, seq11, seq12, seq13, seq14, seq15, seq16, seq17, seq18, seq19, seq20];

const Episode: React.FC<{showSubtitles: boolean; audio: AudioMix}> = ({showSubtitles, audio}) => {
  const t = useTime();
  const sq = seqAt(t);
  const out = FNS[sq.n - 1](t);
  const mix: AudioMix = {...audio, music: audio.music ? {...audio.music, duck: SPEECH} : undefined};
  return (
    <AbsoluteFill style={{backgroundColor: '#01040a'}}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>{out.svg}</svg>
      </AbsoluteFill>
      {out.overlay}
      {ACTS.slice(1).map((a) => (
        <ChapterTag key={a.n} start={SEQUENCES[a.from - 1].start + 0.4} num={`ACTO ${a.n}`} label={a.label} duration={3} />
      ))}
      {showSubtitles && <Subtitles cues={CUES} centerY={0.75} fontSize={50} highlightColor="#ffd23f" />}
      <AudioTracks mix={mix} />
    </AbsoluteFill>
  );
};

export const EP04MantisShrimp: React.FC<EP04MantisProps> = ({quality, showSubtitles, audio}) => {
  ensureFonts();
  return (
    <QualityProvider quality={quality}>
      <StyleProvider refined>
        <Episode showSubtitles={showSubtitles} audio={audio} />
      </StyleProvider>
    </QualityProvider>
  );
};
