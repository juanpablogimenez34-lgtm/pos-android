// Vista previa por escena (control de calidad, sin audio ni subtítulos).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ensureFonts} from '../../../engine/fonts';
import {TIB_RAW} from '../Documentary';

export const TiburonPreview: React.FC<{n: number}> = ({n}) => {
  ensureFonts();
  const t = useCurrentFrame() / 30;
  const out = TIB_RAW[n](t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width={1080} height={1920}>{out.svg}</svg>
      {out.overlay}
    </AbsoluteFill>
  );
};
