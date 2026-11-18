import React from 'react';
import { Composition } from 'remotion';
import { DURATIONS, seconds, VIDEO } from './config/video';
import { DemoProps, Ep01Demo15s } from './episodes/ep01-pulpo/Demo15s';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Ep01Demo15s"
      component={Ep01Demo15s}
      durationInFrames={seconds(DURATIONS.demo)}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
      defaultProps={{ showTitle: true, showSubtitles: true, showHud: false } satisfies DemoProps}
    />
  </>
);
