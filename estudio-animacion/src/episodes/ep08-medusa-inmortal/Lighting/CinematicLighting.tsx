// ILUMINACIÓN CINEMATOGRÁFICA: luz que envuelve al protagonista (en pantalla), etalonaje
// turquesa-violeta, bruma de profundidad y viñeta. Capas ligeras (sin filtros pesados).
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const CinematicLighting: React.FC<{subject?: {x: number; y: number; r: number; k: number; color?: string}; grade?: number; vignette?: number; dark?: number; violet?: number}> = ({subject, grade = 0.5, vignette = 0.8, dark = 0, violet = 0.3}) => (
  <>
    {subject && subject.k > 0.01 && (
      <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(circle ${Math.round(subject.r)}px at ${Math.round(subject.x)}px ${Math.round(subject.y)}px, ${subject.color ?? 'rgba(130,240,255,0.32)'} 0%, rgba(140,120,255,0.12) 45%, rgba(0,0,0,0) 100%)`, opacity: subject.k, mixBlendMode: 'screen'}} />
    )}
    <AbsoluteFill style={{pointerEvents: 'none', background: `linear-gradient(180deg, rgba(80,220,255,${(0.1 * grade).toFixed(3)}) 0%, rgba(120,80,255,${(0.14 * grade * (0.5 + violet)).toFixed(3)}) 100%)`, mixBlendMode: 'soft-light'}} />
    {dark > 0.001 && <AbsoluteFill style={{pointerEvents: 'none', background: '#02030f', opacity: dark}} />}
    <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 65% at 50% 46%, rgba(0,0,0,0) 55%, rgba(2,4,20,0.7) 100%)', opacity: vignette}} />
  </>
);
