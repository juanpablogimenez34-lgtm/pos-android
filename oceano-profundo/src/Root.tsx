import React from 'react';
import {Composition} from 'remotion';
import {Sheet} from './components/Sheet';
import {CONFIG} from './config';
import {DocProps, Documentary} from './Documentary';
import {SHORT_COMPONENTS} from './shorts';
import {ShortProps} from './shorts/Short';

const docDefaults: DocProps = {quality: 'premium', showSubtitles: true, audio: true};
const shortDefaults: ShortProps = {quality: 'premium', showSubtitles: true, audio: true};
export const Root: React.FC = () => (
  <>
    <Composition id={CONFIG.documentary.id} component={Documentary} durationInFrames={CONFIG.documentary.durationSec * CONFIG.fps} fps={CONFIG.fps} width={CONFIG.documentary.width} height={CONFIG.documentary.height} defaultProps={docDefaults} />
    {SHORT_COMPONENTS.map(({spec, Comp}) => (
      <Composition key={spec.n} id={`Short${spec.n}`} component={Comp} durationInFrames={spec.duration * CONFIG.fps} fps={CONFIG.fps} width={CONFIG.short.width} height={CONFIG.short.height} defaultProps={shortDefaults} />
    ))}
    <Composition id="Fichas" component={Sheet} durationInFrames={90} fps={30} width={1920} height={1080} />
  </>
);
