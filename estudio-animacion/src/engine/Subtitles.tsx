import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, easeOut} from './math';
import {FONT_FAMILY} from './fonts';
import {SubtitleCue} from './types';

type Props = {
  cues: SubtitleCue[];
  /** Centro vertical del bloque como fracción de la altura (zona segura TikTok/Shorts ≈ 0.70–0.78). */
  centerY?: number;
  fontSize?: number;
  highlightColor?: string;
};

function renderLine(line: string, highlights: string[], color: string) {
  if (!highlights.length) return line;
  const escaped = highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(${escaped.join('|')})`, 'gi');
  return line.split(re).map((part, i) =>
    highlights.some((h) => h.toLowerCase() === part.toLowerCase()) ? (
      <span key={i} style={{color, textShadow: `0 0 18px ${color}66, 0 3px 10px rgba(0,0,0,0.65)`}}>
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}

/** Subtítulos sincronizados: máx. dos líneas, entrada suave, salida rápida. */
export const Subtitles: React.FC<Props> = ({cues, centerY = 0.74, fontSize = 46, highlightColor = '#ffd27a'}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;
  const cue = cues.find((c) => t >= c.start && t < c.end);
  if (!cue) return null;
  const inP = easeOut((t - cue.start) / 0.35);
  const outP = clamp((cue.end - t) / 0.18);
  const lines = cue.text.split('\n').slice(0, 2);
  return (
    <div
      style={{
        position: 'absolute',
        left: width * 0.06,
        right: width * 0.12, // margen extra a la derecha: iconos de TikTok/Reels
        top: height * centerY,
        transform: `translateY(-50%) translateY(${(1 - inP) * 22}px)`,
        opacity: inP * outP,
        textAlign: 'center',
        fontFamily: FONT_FAMILY,
        fontWeight: 800,
        fontSize,
        lineHeight: 1.22,
        color: '#ffffff',
        letterSpacing: 0.3,
        textShadow: '0 3px 10px rgba(0,0,0,0.65), 0 1px 2px rgba(0,0,0,0.8)',
      }}
    >
      {lines.map((l, i) => (
        <div key={i} style={{whiteSpace: 'nowrap'}}>{renderLine(l, cue.highlight ?? [], highlightColor)}</div>
      ))}
    </div>
  );
};
