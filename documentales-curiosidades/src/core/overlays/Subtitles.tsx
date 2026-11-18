import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export type Cue = { start: number; end: number; text: string };

/**
 * Subtítulos estilo redes verticales: grandes, centrados en la zona segura
 * (lejos de los botones laterales de TikTok/Reels y de la descripción inferior).
 */
export const Subtitles: React.FC<{ cues: Cue[] }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cue = cues.find((c) => t >= c.start && t < c.end);
  if (!cue) return null;
  const o = interpolate(t, [cue.start, cue.start + 0.2, cue.end - 0.2, cue.end], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Revelado palabra a palabra (karaoke suave).
  const words = cue.text.split(' ');
  const dur = cue.end - cue.start;
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 520 }}>
      <div
        style={{
          opacity: o,
          maxWidth: 860,
          textAlign: 'center',
          fontFamily: '"Montserrat", "Inter", "Helvetica Neue", Arial, sans-serif',
          fontSize: 54,
          fontWeight: 800,
          lineHeight: 1.25,
          color: 'white',
          textShadow: '0 3px 12px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,1)',
        }}
      >
        {words.map((w, i) => {
          const w0 = cue.start + (i / words.length) * dur * 0.9;
          const w1 = cue.start + ((i + 1) / words.length) * dur * 0.9;
          const current = t >= w0 && t < w1;
          return (
            <span key={i} style={{ color: current ? '#ffd84a' : '#ffffff' }}>
              {w}{' '}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
