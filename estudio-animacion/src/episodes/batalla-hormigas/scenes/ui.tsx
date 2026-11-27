// Rótulos del episodio: marca de la serie, etiqueta de simulación y palabras clave discretas.
import React from 'react';
import {FONT_FAMILY} from '../../../engine/fonts';

export const Brand: React.FC = () => (
  <div style={{position: 'absolute', left: 54, top: 70, fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 21, letterSpacing: 4, color: '#fff8e8', opacity: 0.6, textShadow: '0 2px 6px rgba(0,0,0,0.7)'}}>MUNDO INSÓLITO · BATALLAS DE LA NATURALEZA</div>
);
export const SimBadge: React.FC<{k: number}> = ({k}) =>
  k > 0.01 ? <div style={{position: 'absolute', right: 54, top: 108, opacity: k * 0.9, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 20, letterSpacing: 3, color: '#fff2d0', textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>SIMULACIÓN ILUSTRADA</div> : null;
/** Palabra clave cinematográfica (MANDÍBULAS, VENENO, FUERZA, COMUNICACIÓN, ESTRATEGIA, COLONIA). */
export const Keyword: React.FC<{k: number; text: string; color?: string; top?: number}> = ({k, text, color = '#ffd23f', top = 600}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${((1 - k) * 14).toFixed(1)}px)`, letterSpacing: `${(10 + (1 - k) * 8).toFixed(1)}px`}}>
      <span style={{fontWeight: 900, fontSize: 54, color, textShadow: '0 0 24px rgba(0,0,0,0.6), 0 4px 14px rgba(0,0,0,0.9)'}}>{text}</span>
    </div>
  ) : null;
