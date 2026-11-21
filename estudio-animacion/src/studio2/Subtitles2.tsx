// ESTUDIO 2.0 · SUBTÍTULOS PREMIUM: máx. 2 líneas, tipografía grande, blanco con sombra,
// palabras clave resaltadas y AVANCE PALABRA A PALABRA (la palabra que se está diciendo se
// ilumina; reparto proporcional a la longitud dentro del tramo medido de la locución).
// Zona segura: lejos de la interfaz de Shorts/TikTok/Reels (márgenes laterales y franja inferior);
// si el animal ocupa esa zona (`avoid`), el bloque sube a la posición alternativa.
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, easeOut} from '../engine/math';
import {FONT_FAMILY} from '../engine/fonts';
import {SubtitleCue} from '../engine/types';

type Props = {cues: SubtitleCue[]; centerY?: number; altY?: number; avoid?: (t: number) => boolean; fontSize?: number; highlight?: string; active?: string};

export const Subtitles2: React.FC<Props> = ({cues, centerY = 0.765, altY = 0.2, avoid, fontSize = 52, highlight = '#ffd23f', active = '#9ff4ff'}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;
  const cue = cues.find((c) => t >= c.start && t < c.end);
  if (!cue) return null;
  const inP = easeOut((t - cue.start) / 0.3);
  const outP = clamp((cue.end - t) / 0.15);
  const y = avoid && avoid(t) ? altY : centerY;
  const words = cue.text.replace(/\n/g, ' \n ').split(' ').filter(Boolean);
  const total = words.filter((w) => w !== '\n').reduce((a, w) => a + w.length + 1, 0);
  const speakEnd = cue.end - 0.25;
  let acc = 0;
  const hl = (cue.highlight ?? []).map((h) => h.toLowerCase());
  const isHL = (w: string) => hl.some((h) => h.split(' ').some((p) => p === w.toLowerCase().replace(/[¿?¡!.,:;…]/g, '')));
  const lines: React.ReactNode[][] = [[]];
  words.forEach((w, i) => {
    if (w === '\n') {
      lines.push([]);
      return;
    }
    const a = cue.start + (acc / total) * (speakEnd - cue.start);
    acc += w.length + 1;
    const said = t >= a;
    const now = said && t < cue.start + (acc / total) * (speakEnd - cue.start);
    lines[lines.length - 1].push(
      <span key={i} style={{color: isHL(w) ? highlight : now ? active : '#ffffff', opacity: said ? 1 : 0.62, textShadow: isHL(w) ? `0 0 18px ${highlight}66, 0 3px 10px rgba(0,0,0,0.75)` : undefined}}>
        {w}{' '}
      </span>,
    );
  });
  return (
    <div style={{position: 'absolute', left: width * 0.07, right: width * 0.13, top: height * y, transform: `translateY(-50%) translateY(${(1 - inP) * 20}px)`, opacity: inP * outP, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 800, fontSize, lineHeight: 1.2, color: '#ffffff', textShadow: '0 3px 10px rgba(0,0,0,0.75), 0 1px 2px rgba(0,0,0,0.9)'}}>
      {lines.slice(0, 2).map((l, i) => (
        <div key={i} style={{whiteSpace: 'nowrap'}}>{l}</div>
      ))}
    </div>
  );
};
