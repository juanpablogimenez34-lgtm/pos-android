// COMPOSICIÓN GENÉRICA DE SHORT VERTICAL: escena propia + subtítulos + gradación + audio (voz, música con
// ducking, ambiente y efectos generados para cada Short).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {AudioMix} from '../audio/AudioMix';
import {Subtitles} from '../components/UI';
import {CONFIG, QualityName} from '../config';
import {Grade} from '../effects/Effects';
import {SceneFn} from '../scenes/common';
import {ViewProvider} from '../utils/context';
import {Cue, cuesFrom, speechIntervals, TimedLine} from '../utils/cues';
import {ensureFonts} from '../utils/fonts';
import {EndCard} from './common';

export type ShortSpec = {n: number; title: string; duration: number; scene: SceneFn; timing: TimedLine[]; highlight: string[]; endAt: number};
export type ShortProps = {quality: QualityName; showSubtitles: boolean; audio: boolean};
export const cuesOf = (timing: TimedLine[]): Cue[] => cuesFrom(timing, CONFIG.subtitles.maxCharsShort);

export const makeShort = (spec: ShortSpec): React.FC<ShortProps> => {
  const cues = cuesOf(spec.timing);
  const speech = speechIntervals(spec.timing);
  const Comp: React.FC<ShortProps> = ({quality, showSubtitles, audio}) => {
    ensureFonts();
    const t = useCurrentFrame() / CONFIG.fps;
    const sc = spec.scene(t);
    const dir = `audio/short${spec.n}`;
    return (
      <ViewProvider w={1080} h={1920} quality={quality}>
        <AbsoluteFill style={{background: '#02060c'}}>
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>{sc.svg}</svg>
          <Grade t={t} vignette={sc.grade?.vignette ?? 0.7} tint={sc.grade?.tint} tintK={sc.grade?.tintK} />
          {sc.overlay}
          <EndCard t={t} at={spec.endAt} />
          {showSubtitles && <Subtitles cues={cues} t={t} highlight={spec.highlight} />}
          {audio && (
            <AudioMix narration={`${dir}/narracion.m4a`} music={`${dir}/musica.m4a`} speech={speech} others={[
              {src: `${dir}/ambiente.m4a`, volume: CONFIG.audio.ambience},
              {src: `${dir}/efectos.m4a`, volume: CONFIG.audio.sfx},
            ]} />
          )}
        </AbsoluteFill>
      </ViewProvider>
    );
  };
  return Comp;
};
