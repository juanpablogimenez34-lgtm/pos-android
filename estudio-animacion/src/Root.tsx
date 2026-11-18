import React from 'react';
import {Composition} from 'remotion';
import {StatesShowcase} from './creatures/octopus/StatesShowcase';
import {DEMO_META} from './episodes/ep01-pulpo/demo.config';
import {Ep01Demo, Ep01DemoProps} from './episodes/ep01-pulpo/Ep01Demo';
import {EP01_DEFAULT_AUDIO, Ep01Full, Ep01FullProps} from './episodes/ep01-pulpo/full/Ep01Full';
import {DURATION, FPS} from './episodes/ep01-pulpo/full/timeline';

const demoDefaults: Ep01DemoProps = {quality: 'final', showSubtitles: true, audio: {}};
const fullDefaults: Ep01FullProps = {quality: 'final', showSubtitles: true, audio: EP01_DEFAULT_AUDIO};

export const RemotionRoot: React.FC = () => (
  <>
    {/* Episodio 01 completo: 180 s × 30 fps = 5.400 fotogramas */}
    <Composition
      id="Ep01Full"
      component={Ep01Full}
      durationInFrames={DURATION * FPS}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={fullDefaults}
    />
    {/* Demo aprobada de 15 s (se conserva intacta) */}
    <Composition
      id="Ep01Demo"
      component={Ep01Demo}
      durationInFrames={DEMO_META.durationSec * DEMO_META.fps}
      fps={DEMO_META.fps}
      width={DEMO_META.width}
      height={DEMO_META.height}
      defaultProps={demoDefaults}
    />
    <Composition
      id="OctopusStates"
      component={StatesShowcase}
      durationInFrames={180}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{quality: 'final' as const}}
    />
  </>
);
