import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

/** Título de apertura: entra con desenfoque y sale con fundido. */
export const TitleCard: React.FC<{ kicker: string; title: string; start: number; end: number }> = ({
  kicker,
  title,
  start,
  end,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const inK = interpolate(t, [start, start + 0.9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const outK = interpolate(t, [end - 0.7, end], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const o = inK * outK;
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: 300 }}>
      <div
        style={{
          opacity: o,
          filter: `blur(${(1 - inK) * 12}px)`,
          transform: `translateY(${(1 - inK) * 30}px)`,
          textAlign: 'center',
          color: 'white',
          fontFamily: '"Montserrat", "Inter", "Helvetica Neue", Arial, sans-serif',
          textShadow: '0 4px 30px rgba(0,0,0,0.6)',
          padding: '0 80px',
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 10, fontWeight: 600, opacity: 0.85, textTransform: 'uppercase' }}>
          {kicker}
        </div>
        <div style={{ width: 120, height: 3, background: '#7fe3ff', margin: '28px auto' }} />
        <div style={{ fontSize: 86, lineHeight: 1.05, fontWeight: 800, textTransform: 'uppercase' }}>{title}</div>
      </div>
    </AbsoluteFill>
  );
};
