import React from 'react';
import {Composition} from 'remotion';
import {StatesShowcase} from './creatures/octopus/StatesShowcase';
import {DEMO_META} from './episodes/ep01-pulpo/demo.config';
import {Ep01Demo, Ep01DemoProps} from './episodes/ep01-pulpo/Ep01Demo';

const demoDefaults: Ep01DemoProps = {quality: 'final', showSubtitles: true, audio: {}};

export const RemotionRoot: React.FC = () => (
  <>
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
