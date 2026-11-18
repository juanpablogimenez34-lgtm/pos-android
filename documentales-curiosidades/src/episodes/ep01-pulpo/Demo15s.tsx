import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { activeShot } from '../../core/camera/CinematicCamera';
import { DebugHud } from '../../core/overlays/DebugHud';
import { Grade } from '../../core/overlays/Grade';
import { Subtitles } from '../../core/overlays/Subtitles';
import { TitleCard } from '../../core/overlays/TitleCard';
import { DEMO_CUES, DEMO_SHOTS } from './direction';
import { Scene3D } from './Scene3D';

export type DemoProps = {
  showTitle: boolean;
  showSubtitles: boolean;
  showHud: boolean;
};

/** Episodio 1 · Demostración técnica de 15 s. */
export const Ep01Demo15s: React.FC<DemoProps> = ({ showTitle, showSubtitles, showHud }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  // Fundido desde/hacia negro.
  const fade = interpolate(frame, [0, 18, durationInFrames - 15, durationInFrames - 1], [1, 0, 0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{ backgroundColor: '#02141b' }}>
      <Scene3D shots={DEMO_SHOTS} />
      <Grade />
      {showTitle ? <TitleCard kicker="Curiosidades animales · Ep. 1" title="El pulpo que tiene tres corazones" start={0.4} end={3.8} /> : null}
      {showSubtitles ? <Subtitles cues={DEMO_CUES} /> : null}
      {showHud ? <DebugHud shotName={activeShot(DEMO_SHOTS, t).name} /> : null}
      <AbsoluteFill style={{ backgroundColor: 'black', opacity: fade }} />
    </AbsoluteFill>
  );
};
