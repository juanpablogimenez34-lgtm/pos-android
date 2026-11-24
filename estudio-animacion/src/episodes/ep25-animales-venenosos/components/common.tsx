// Piezas compartidas: título cinematográfico de cada animal (número, nombre común y nombre científico),
// recuadros de visualización científica simplificada, notas y reutilización de rótulos de otros episodios.
import React from 'react';
import {clamp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';

export {seg, win, Callout, Wash, BigTitle} from '../../ep18-mixino/components/common';
export {Vignette, Brand, Note} from '../../ep23-cachalote/components/common';

export const AnimalTitle: React.FC<{u: number; n: number; name: string; sci: string}> = ({u, n, name, sci}) => {
  const k = clamp((u - 0.25) / 0.4) * clamp((4.6 - u) / 0.5);
  if (k <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 150, fontFamily: FONT_FAMILY, opacity: k, transform: `translateX(${((1 - k) * -24).toFixed(1)}px)`}}>
      <div style={{color: '#ffd870', fontWeight: 900, fontSize: 30, letterSpacing: 6, textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>{String(n).padStart(2, '0')}</div>
      <div style={{color: '#f6fbff', fontWeight: 900, fontSize: name.length > 20 ? 44 : 54, lineHeight: 1.05, letterSpacing: 1, textShadow: '0 3px 14px rgba(0,0,0,0.85)'}}>{name}</div>
      <div style={{color: '#cfe8ff', fontWeight: 600, fontStyle: 'italic', fontSize: 26, marginTop: 6, textShadow: '0 2px 8px rgba(0,0,0,0.85)'}}>{sci}</div>
    </div>
  );
};

/** Recuadro circular con una ilustración científica simplificada. */
export const Inset: React.FC<{k: number; x?: number; y?: number; r?: number; label: string; children: React.ReactNode}> = ({k, x = 760, y = 620, r = 210, label, children}) =>
  k > 0.01 ? (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: k}}>
      <defs>
        <clipPath id={`ins-${label.length}`}>
          <circle cx={x} cy={y} r={r} />
        </clipPath>
      </defs>
      <circle cx={x} cy={y} r={r + 6} fill="rgba(6,14,20,0.85)" stroke="#ffd870" strokeWidth={3} />
      <g clipPath={`url(#ins-${label.length})`}>
        <g transform={`translate(${x} ${y})`}>{children}</g>
      </g>
      <text x={x} y={y + r + 46} textAnchor="middle" fill="#ffd870" fontSize={26} fontWeight={800} fontFamily={FONT_FAMILY} style={{paintOrder: 'stroke'}} stroke="rgba(0,0,0,0.7)" strokeWidth={4}>{label}</text>
    </svg>
  ) : null;
