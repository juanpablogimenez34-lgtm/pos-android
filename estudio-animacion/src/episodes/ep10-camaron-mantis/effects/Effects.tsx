// EFECTOS: cavitación (en science/Science.tsx, re-exportada), destello de impacto contenido
// (sin explosiones), corriente marina de transición, marco de cámara lenta y onda de presión.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, hash1} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
export {Cavitation} from '../science/Science';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

/** Destello breve y pequeño en el punto de contacto (u = tiempo desde el impacto, s). */
export const ImpactFlash: React.FC<{x: number; y: number; u: number; s?: number}> = ({x, y, u, s = 1}) => {
  if (u < 0 || u > 0.5) return null;
  const k = 1 - u / 0.5;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s)})`}>
      <circle r={18 + 40 * (1 - k)} fill="#e8fbff" opacity={0.55 * k} />
      <circle r={30 + 140 * (1 - k)} fill="none" stroke="#e8fbff" strokeWidth={4 * k} opacity={0.7 * k} />
      {Array.from({length: 8}, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <path key={i} d={`M${f1(Math.cos(a) * 24)},${f1(Math.sin(a) * 24)} L${f1(Math.cos(a) * (40 + 50 * (1 - k)))},${f1(Math.sin(a) * (40 + 50 * (1 - k)))}`} stroke="#ffffff" strokeWidth={3} opacity={0.6 * k} />;
      })}
    </g>
  );
};

/** Corriente marina que barre el cuadro (transición motivada). u 0…1. */
export const CurrentSweep: React.FC<{u: number; t: number}> = ({u, t}) => {
  if (u <= 0 || u >= 1) return null;
  const k = Math.sin(u * Math.PI);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1080} height={1920}>
        <rect width={1080} height={1920} fill="#0a3a5a" opacity={0.85 * k} />
        {Array.from({length: 46}, (_, i) => {
          const y = hash1(i * 3) * 1920;
          const len = 200 + hash1(i * 5) * 500;
          const x = -700 + ((u * 2600 + hash1(i * 7) * 1400 + t * 30) % 2400);
          return <path key={i} d={`M${f1(x)},${f1(y)} q${f1(len / 2)},${f1(-20 + hash1(i) * 40)} ${f1(len)},0`} stroke="#bff6ff" strokeWidth={2 + hash1(i * 9) * 5} opacity={0.5 * k} fill="none" strokeLinecap="round" />;
        })}
        {Array.from({length: 30}, (_, i) => (
          <circle key={`p${i}`} cx={((hash1(i * 11) * 1400 + u * 2200) % 1500) - 200} cy={hash1(i * 13) * 1920} r={2 + hash1(i) * 4} fill="#e8fbff" opacity={0.6 * k} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/** Marco de cámara lenta: barras y rótulo «cámara lenta» con indicador de velocidad. */
export const SlowMoFrame: React.FC<{k: number; label?: string; rate?: string}> = ({k, label = 'CÁMARA LENTA', rate}) =>
  k > 0.01 ? (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: k}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 120, background: 'rgba(0,0,0,0.55)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: 'rgba(0,0,0,0.55)'}} />
      <div style={{position: 'absolute', top: 200, left: 70, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 30, color: '#ffd27a', letterSpacing: 4, display: 'flex', alignItems: 'center', gap: 14}}>
        <span style={{width: 18, height: 18, borderRadius: 9, background: '#ff4a4a', display: 'inline-block'}} />
        {label}
        {rate && <span style={{color: '#bff6ff', fontSize: 26}}>{rate}</span>}
      </div>
    </AbsoluteFill>
  ) : null;

/** Onda de presión del agua (anillo que se expande), para el golpe a velocidad real. */
export const PressureRing: React.FC<{x: number; y: number; u: number; s?: number}> = ({x, y, u, s = 1}) =>
  u > 0 && u < 1 ? <ellipse cx={x} cy={y} rx={(30 + 220 * u) * s} ry={(20 + 140 * u) * s} fill="none" stroke="#dffbff" strokeWidth={5 * (1 - u)} opacity={clamp(1 - u)} /> : null;
