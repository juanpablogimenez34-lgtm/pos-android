import React from 'react';
import {AbsoluteFill} from 'remotion';

/** Etalonaje final: viñeta, velo violeta en la base y resplandor turquesa arriba. Coste ~0 (CSS). */
export const Grade: React.FC<{vignette?: number}> = ({vignette = 0.6}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(180deg, rgba(120,255,235,0.10) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 62%, rgba(40,14,70,0.35) 100%)',
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 75% 60% at 50% 46%, rgba(0,0,0,0) 55%, rgba(2,4,18,${vignette}) 100%)`,
      }}
    />
  </AbsoluteFill>
);
