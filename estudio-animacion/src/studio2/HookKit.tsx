// ESTUDIO 2.0 · KIT DE GANCHO (0–5 s). Reglas: acción visible desde el fotograma 0, sin logos, sin
// negro, textos CORTOS que no tapen al animal (franja superior), "golpe" de cámara motivado.
import React from 'react';
import {FONT_FAMILY} from '../engine/fonts';

/** Palabra o frase de impacto (máx. ~3 palabras), con entrada en golpe. */
export const PunchWord: React.FC<{text: string; k: number; top?: number; size?: number; color?: string}> = ({text, k, top = 230, size = 92, color = '#ffd23f'}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: 60, right: 60, top, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: Math.min(1, k * 1.6), transform: `scale(${(1.3 - 0.3 * Math.min(1, k * 1.4)).toFixed(3)})`}}>
      <span style={{fontWeight: 900, fontSize: size, color, letterSpacing: 1, WebkitTextStroke: '3px #04102a', textShadow: '0 0 30px rgba(80,170,255,0.7), 0 6px 18px rgba(0,0,0,0.9)'}}>{text}</span>
    </div>
  ) : null;

/** Pulso de cámara para el instante de acción (escala multiplicativa). */
export const punch = (t: number, at: number, amp = 0.08, dur = 0.5) => (t < at || t > at + dur ? 1 : 1 + amp * Math.sin(((t - at) / dur) * Math.PI));
