// Utilidades de las escenas: reutiliza del Ep. 04 (sin modificarlo) los rótulos, etiquetas y
// ventanas de tiempo; añade el texto gigante del gancho y la etiqueta de pregunta.
import React from 'react';
import {FONT_FAMILY} from '../../../engine/fonts';
export {BigTitle, Callouts, Caption, seg, win} from '../../ep10-camaron-mantis/sequences/common';
export type {SceneOut} from '../../ep10-camaron-mantis/sequences/common';

/** Texto de impacto (gancho): grande, con contorno y entrada en "golpe". */
export const HookText: React.FC<{lines: string[]; k: number; top?: number; size?: number; color?: string}> = ({lines, k, top = 300, size = 104, color = '#ffd23f'}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: Math.min(1, k * 1.5), transform: `scale(${(1.25 - 0.25 * Math.min(1, k * 1.3)).toFixed(3)})`}}>
      {lines.map((l, i) => (
        <div key={i} style={{fontWeight: 900, fontSize: size, lineHeight: 1.0, color: i === 0 ? '#ffffff' : color, letterSpacing: 1, WebkitTextStroke: '3px #06103a', textShadow: '0 0 36px rgba(60,140,255,0.8), 0 6px 18px rgba(0,0,0,0.9)'}}>
          {l}
        </div>
      ))}
    </div>
  ) : null;

/** Pregunta que abre una escena (retención): pequeña, arriba, en zona segura. */
export const Question: React.FC<{text: string; k: number; top?: number}> = ({text, k, top = 240}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: 90, right: 120, top, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${((1 - k) * -16).toFixed(1)}px)`}}>
      <span style={{display: 'inline-block', padding: '10px 24px', borderRadius: 40, background: 'linear-gradient(90deg, rgba(42,108,240,0.9), rgba(120,80,255,0.9))', color: '#ffffff', fontWeight: 900, fontSize: 40, boxShadow: '0 6px 24px rgba(0,0,0,0.45)'}}>{text}</span>
    </div>
  ) : null;
