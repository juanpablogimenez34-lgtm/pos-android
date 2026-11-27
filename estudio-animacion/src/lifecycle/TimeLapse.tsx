// INDICADOR DE TIEMPO CONDENSADO (reutilizable): comunica que el desarrollo real dura días, semanas
// o años aunque en pantalla dure segundos. Esfera con aguja que gira deprisa + etiqueta.
import React from 'react';
import {FONT_FAMILY} from '../engine/fonts';

export const TimeLapse: React.FC<{k: number; label: string; spin: number; top?: number}> = ({k, label, spin, top = 230}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', opacity: k, fontFamily: FONT_FAMILY}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '10px 24px 10px 14px', borderRadius: 40, background: 'rgba(6,24,20,0.6)', border: '1.5px solid rgba(230,210,140,0.55)'}}>
        <svg width={46} height={46} viewBox="-23 -23 46 46">
          <circle r={20} fill="none" stroke="#e8d28c" strokeWidth={2.5} />
          {Array.from({length: 12}, (_, i) => (
            <line key={i} x1={0} y1={-16} x2={0} y2={-19} stroke="#e8d28c" strokeWidth={1.5} transform={`rotate(${i * 30})`} />
          ))}
          <line x1={0} y1={0} x2={0} y2={-15} stroke="#fff4c8" strokeWidth={2.5} strokeLinecap="round" transform={`rotate(${(spin * 360).toFixed(1)})`} />
          <line x1={0} y1={0} x2={0} y2={-10} stroke="#e8d28c" strokeWidth={3} strokeLinecap="round" transform={`rotate(${((spin / 12) * 360).toFixed(1)})`} />
        </svg>
        <span style={{color: '#fff4d8', fontWeight: 800, fontSize: 32, letterSpacing: 1}}>{label}</span>
      </div>
    </div>
  ) : null;
