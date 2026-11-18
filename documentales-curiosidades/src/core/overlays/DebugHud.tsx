import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

/** Información técnica para revisar la demo (desactivable desde las props). */
export const DebugHud: React.FC<{ shotName: string; extra?: string }> = ({ shotName, extra }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ padding: 40, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: 26,
          color: '#9ff',
          background: 'rgba(0,0,0,0.45)',
          padding: '10px 16px',
          borderRadius: 8,
        }}
      >
        f {frame} · {(frame / fps).toFixed(2)} s · {shotName}
        {extra ? ` · ${extra}` : ''}
      </div>
    </AbsoluteFill>
  );
};
