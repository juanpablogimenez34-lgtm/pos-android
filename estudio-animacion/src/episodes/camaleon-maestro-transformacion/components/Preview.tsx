// Vista previa interna de escenas (sin audio ni subtítulos) para el control de calidad.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {scene1, scene2} from '../scenes/S1_2';
import {scene3, scene4} from '../scenes/S3_4';
import {scene5, scene6, scene7} from '../scenes/S5_7';
import {ensureFonts} from '../../../engine/fonts';

const ALL = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
export const CamaleonPreview: React.FC<{n: number}> = ({n}) => {
  ensureFonts();
  const t = useCurrentFrame() / 30;
  const out = ALL[n](t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width={1080} height={1920}>{out.svg}</svg>
      {out.overlay}
    </AbsoluteFill>
  );
};
