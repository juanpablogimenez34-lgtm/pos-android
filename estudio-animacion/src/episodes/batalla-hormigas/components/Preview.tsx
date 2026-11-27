// Vista previa interna por escena (control de calidad, sin audio ni subtítulos).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ensureFonts} from '../../../engine/fonts';
import {HORMIGAS_RAW} from '../Documentary';

export const HormigasPreview: React.FC<{n: number}> = ({n}) => {
  ensureFonts();
  const t = useCurrentFrame() / 30;
  const out = HORMIGAS_RAW[n](t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width={1080} height={1920}>{out.svg}</svg>
      {out.overlay}
    </AbsoluteFill>
  );
};
