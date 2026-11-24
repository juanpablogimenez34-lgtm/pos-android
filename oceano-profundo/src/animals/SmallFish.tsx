// Personajes secundarios del Ep. 02:
//  · Pez linterna (Myctophidae): presa habitual de peces de aguas profundas, con
//    fotóforos en hileras ventrales.
//  · Macho de Linophryne: diminuto, sin señuelo, con narinas grandes (olfato) y
//    dentículos en el hocico para sujetarse. Versión libre y versión adherida
//    (fusionada al vientre de la hembra: parasitismo sexual obligado).
import React from 'react';
import {clamp, smoothPath, Vec} from '../utils/math';

/** `angle`: rumbo (rad). Si el rumbo apunta a la izquierda se refleja el dibujo para no nadar boca arriba. */
type FishProps = {x: number; y: number; scale: number; angle: number; t: number; wag?: number; opacity?: number};

const orient = (angle: number) => {
  const flip = Math.cos(angle) < 0;
  return {flip, a: flip ? angle - Math.PI : angle};
};

export const Lanternfish: React.FC<FishProps> = ({x, y, scale, angle, t, wag = 1, opacity = 1}) => {
  const o = orient(angle);
  const w = Math.sin(t * 14) * 0.35 * wag;
  const body = smoothPath(
    [
      {x: 38, y: 0},
      {x: 24, y: -10},
      {x: 0, y: -12},
      {x: -22, y: -8},
      {x: -34, y: -3},
      {x: -34, y: 3},
      {x: -22, y: 8},
      {x: 0, y: 12},
      {x: 24, y: 10},
    ],
    true,
  );
  return (
    <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${((o.a * 180) / Math.PI).toFixed(2)}) scale(${o.flip ? -scale : scale} ${scale})`} opacity={opacity}>
      <defs>
        <linearGradient id="lf-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b2633" />
          <stop offset="0.55" stopColor="#5c6f80" />
          <stop offset="1" stopColor="#b9c8d2" />
        </linearGradient>
      </defs>
      <g transform={`rotate(${(w * 57).toFixed(1)} -30 0)`}>
        <path d="M-32,0 L-50,-12 L-46,0 L-50,12Z" fill="#2a3644" />
      </g>
      <path d={body} fill="url(#lf-b)" />
      <path d="M-4,-11 L-12,-20 L-18,-10Z" fill="#2a3644" opacity={0.8} />
      <circle cx={26} cy={-2} r={6} fill="#0a0d12" stroke="#9fb3c2" strokeWidth={1.2} />
      <circle cx={27.5} cy={-3.5} r={1.8} fill="#e8fbff" />
    </g>
  );
};

/** Fotóforos del pez linterna (capa de luz). */
export const LanternfishGlow: React.FC<FishProps> = ({x, y, scale, angle, opacity = 1}) => {
  const o = orient(angle);
  const c = Math.cos(o.a);
  const s = Math.sin(o.a);
  const fx = o.flip ? -1 : 1;
  const pts: Vec[] = Array.from({length: 8}, (_, i) => ({x: 20 - i * 6.5, y: 9 - Math.abs(i - 3) * 0.6}));
  return (
    <g opacity={opacity}>
      {pts.map((p, i) => {
        const px = p.x * fx;
        const wx = x + (px * c - p.y * s) * scale;
        const wy = y + (px * s + p.y * c) * scale;
        return (
          <g key={i}>
            <circle cx={wx} cy={wy} r={5 * scale} fill="#6fd8ff" opacity={0.25} />
            <circle cx={wx} cy={wy} r={1.6 * scale} fill="#dff8ff" />
          </g>
        );
      })}
    </g>
  );
};

/** Macho libre: alargado, sin señuelo, narinas grandes y dentículos en el hocico. */
export const MaleAngler: React.FC<FishProps> = ({x, y, scale, angle, t, wag = 1, opacity = 1}) => {
  const o = orient(angle);
  const w = Math.sin(t * 11) * 0.3 * wag;
  const body = smoothPath(
    [
      {x: 30, y: -2},
      {x: 22, y: -12},
      {x: 4, y: -14},
      {x: -16, y: -9},
      {x: -28, y: -4},
      {x: -28, y: 4},
      {x: -16, y: 9},
      {x: 4, y: 13},
      {x: 22, y: 10},
    ],
    true,
  );
  return (
    <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${((o.a * 180) / Math.PI).toFixed(2)}) scale(${o.flip ? -scale : scale} ${scale})`} opacity={opacity}>
      <g transform={`rotate(${(w * 57).toFixed(1)} -26 0)`}>
        <path d="M-26,0 L-44,-11 L-40,0 L-44,11Z" fill="#2c2420" />
      </g>
      <path d={body} fill="#211b18" />
      <path d={body} fill="none" stroke="#6fe8ff" strokeOpacity={0.55} strokeWidth={1.4} />
      {/* narina grande (olfato) */}
      <ellipse cx={20} cy={-6} rx={5} ry={4} fill="#3a302b" stroke="#c9b9a8" strokeWidth={1.2} />
      <ellipse cx={20} cy={-6} rx={2.2} ry={1.8} fill="#0a0806" />
      <circle cx={12} cy={-5} r={3.4} fill="#0a0d12" stroke="#5a6470" strokeWidth={0.8} />
      {/* dentículos del hocico */}
      <path d="M30,-2 l5,-3 l-1,4Z M30,3 l5,2 l-2,-4Z" fill="#efe9dc" />
    </g>
  );
};

/** Macho adherido: su hocico queda fusionado al vientre de la hembra (coordenadas locales de la hembra). */
export const AttachedMale: React.FC<{t: number; fuse: number}> = ({t, fuse}) => {
  const sway = Math.sin(t * 1.4) * 4;
  const k = clamp(fuse);
  return (
    <g transform={`translate(10 98) rotate(${(118 + sway).toFixed(2)})`}>
      <path d={smoothPath([{x: 0, y: -6}, {x: 18, y: -10}, {x: 40, y: -7}, {x: 52, y: -2}, {x: 52, y: 2}, {x: 40, y: 7}, {x: 18, y: 10}, {x: 0, y: 6}], true)} fill="#211b18" />
      <path d="M52,0 L64,-8 L61,0 L64,8Z" fill="#2c2420" transform={`rotate(${Math.sin(t * 3) * 8} 52 0)`} />
      <circle cx={10} cy={-3} r={2.6} fill="#0a0d12" opacity={1 - k * 0.6} />
      {/* puente de tejido fusionado */}
      <ellipse cx={-2} cy={0} rx={9 + 5 * k} ry={8 + 2 * k} fill="#1b1613" />
    </g>
  );
};
