import React from 'react';
import {Composition} from 'remotion';
import {Sheet} from './components/Sheet';
import {CONFIG} from './config';
import {DocProps, Documentary} from './Documentary';

const docDefaults: DocProps = {quality: 'premium', showSubtitles: true, audio: true};
export const Root: React.FC = () => (
  <>
    <Composition id={CONFIG.documentary.id} component={Documentary} durationInFrames={CONFIG.documentary.durationSec * CONFIG.fps} fps={CONFIG.fps} width={CONFIG.documentary.width} height={CONFIG.documentary.height} defaultProps={docDefaults} />
    <Composition id="Fichas" component={Sheet} durationInFrames={90} fps={30} width={1920} height={1080} />
  </>
);
