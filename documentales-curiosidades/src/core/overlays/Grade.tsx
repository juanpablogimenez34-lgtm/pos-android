import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

/** Etalonaje final sobre el 3D: viñeta, gradiente de profundidad y grano de película. */
export const Grade: React.FC<{ grain?: number }> = ({ grain = 0.07 }) => {
  const frame = useCurrentFrame();
  // Semilla distinta en cada fotograma = grano "vivo", pero determinista.
  const seed = (frame * 7919) % 1000;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(120,210,235,0.10) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 65%, rgba(0,18,28,0.35) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,8,14,0.6) 100%)',
        }}
      />
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: grain, mixBlendMode: 'overlay' }}>
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
