// Vista previa interna por escena (control de calidad, sin audio ni subtítulos).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ensureFonts} from '../../../engine/fonts';
import {SceneOut} from '../../../studio2';
import {scene1, scene2} from '../scenes/S1_2';
import {scene3, scene4} from '../scenes/S3_4';
import {scene5, scene6, scene7} from '../scenes/S5_7';

export const NARVAL_SCENES: ((t: number) => SceneOut)[] = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
export const NarvalPreview: React.FC<{n: number}> = ({n}) => {
  ensureFonts();
  const t = useCurrentFrame() / 30;
  const out = NARVAL_SCENES[n](t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width={1080} height={1920}>{out.svg}</svg>
      {out.overlay}
    </AbsoluteFill>
  );
};
