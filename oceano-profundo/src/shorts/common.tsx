// Piezas comunes de los Shorts verticales (1080×1920): tamaño de cuadro, pantalla dividida y tarjeta final.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Cam} from '../camera/camera';
import {FONT} from '../utils/fonts';
import {clamp} from '../utils/math';

export const VV = {w: 1080, h: 1920};
/** Desplaza una cámara para centrar su encuadre en la mitad superior (−1) o inferior (+1) del cuadro. */
export const half = (c: Cam, side: -1 | 1): Cam => ({...c, y: c.y - (side * 480) / c.zoom});
export const ClipHalf: React.FC<{side: -1 | 1; id: string; children: React.ReactNode}> = ({side, id, children}) => (
  <g>
    <defs>
      <clipPath id={id}><rect x={0} y={side < 0 ? 0 : 960} width={1080} height={960} /></clipPath>
    </defs>
    <g clipPath={`url(#${id})`}>{children}</g>
    <rect x={0} y={957} width={1080} height={6} fill="#cfefff" opacity={0.7} />
  </g>
);
/** Tarjeta final: invita a ver el documental completo. */
export const EndCard: React.FC<{t: number; at: number; line?: string}> = ({t, at, line = 'DOCUMENTAL COMPLETO EN EL CANAL'}) => {
  const k = clamp((t - at) / 0.8);
  if (k <= 0.01) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'rgba(1,6,14,0.55)', opacity: k}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 520, textAlign: 'center', fontFamily: FONT, opacity: k, transform: `translateY(${((1 - k) * 30).toFixed(1)}px)`}}>
        <div style={{fontSize: 40, fontWeight: 800, color: '#9fe0ff', letterSpacing: 4}}>{line}</div>
        <div style={{fontSize: 76, fontWeight: 900, color: '#ffffff', lineHeight: 1.05, marginTop: 18, textShadow: '0 4px 18px rgba(0,0,0,0.85)'}}>LOS MONSTRUOS REALES DE LAS PROFUNDIDADES</div>
        <div style={{width: 160, height: 6, background: '#ffd76a', margin: '30px auto 0'}} />
      </div>
    </AbsoluteFill>
  );
};
