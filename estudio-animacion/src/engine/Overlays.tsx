import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {clamp, easeInOut, easeOut, hash1} from './math';
import {FONT_FAMILY} from './fonts';
import {useTime} from './useTime';

/** Etiqueta de capítulo (arriba, discreta) durante los primeros segundos de una escena. */
export const ChapterTag: React.FC<{start: number; num: string; label: string; duration?: number}> = ({start, num, label, duration = 3.6}) => {
  const t = useTime() - start;
  if (t < 0 || t > duration) return null;
  const k = easeOut(t / 0.5) * clamp((duration - t) / 0.5);
  return (
    <div
      style={{
        position: 'absolute',
        top: 150,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: k,
        transform: `translateY(${(1 - k) * -14}px)`,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '12px 26px',
          borderRadius: 40,
          background: 'rgba(4,18,36,0.55)',
          border: '1.5px solid rgba(127,233,224,0.45)',
          color: '#eafffb',
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: 3,
        }}
      >
        <span style={{color: '#7fe9e0'}}>{num}</span>
        <span>{label}</span>
      </div>
    </div>
  );
};

/** Rótulo de etiqueta científica con punto + guía, en coordenadas de pantalla. */
export const Callout: React.FC<{
  x: number; // punto señalado (pantalla)
  y: number;
  text: string;
  sub?: string;
  side?: 'left' | 'right';
  dy?: number; // desplazamiento vertical del texto respecto al punto
  appear: number; // 0–1
  color?: string;
  width?: number;
}> = ({x, y, text, sub, side = 'right', dy = -70, appear, color = '#7fe9e0', width = 360}) => {
  const {width: vw} = useVideoConfig();
  if (appear <= 0.001) return null;
  const k = easeOut(appear);
  const lx = side === 'right' ? x + 90 : x - 90;
  const ty = y + dy;
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
        <circle cx={x} cy={y} r={9 * k} fill="none" stroke={color} strokeWidth={3} />
        <circle cx={x} cy={y} r={4} fill={color} opacity={k} />
        <path
          d={`M${x},${y} L${lx},${ty}`}
          stroke={color}
          strokeWidth={2.5}
          fill="none"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - k}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: Math.min(vw - width - 24, Math.max(24, side === 'right' ? lx + 8 : lx - 8 - width)),
          top: ty - 30,
          width,
          textAlign: side === 'right' ? 'left' : 'right',
          fontFamily: FONT_FAMILY,
          opacity: clamp((appear - 0.3) / 0.7),
          transform: `translateY(${(1 - k) * 10}px)`,
        }}
      >
        <div style={{fontWeight: 800, fontSize: 34, color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.8)', lineHeight: 1.1}}>{text}</div>
        {sub && <div style={{fontWeight: 600, fontSize: 26, color, marginTop: 4, textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>{sub}</div>}
      </div>
    </>
  );
};

/** Velo oscuro (para pasar a vistas científicas sin cambiar de escenario). */
export const Dim: React.FC<{amount: number; color?: string}> = ({amount, color = '2,10,28'}) =>
  amount > 0.001 ? <AbsoluteFill style={{background: `rgba(${color},${amount})`}} /> : null;

/**
 * Transición de corte: una silueta de algas oscuras cruza la pantalla y tapa el
 * corte justo en el instante `at`. Coste mínimo (un único SVG) y coherente con el mundo.
 */
export const CutWipe: React.FC<{at: number; duration?: number; dir?: 1 | -1}> = ({at, duration = 0.9, dir = 1}) => {
  const t = useTime();
  const {width, height} = useVideoConfig();
  const u = (t - (at - duration / 2)) / duration;
  if (u <= 0 || u >= 1) return null;
  const p = easeInOut(u);
  const band = width * 1.9;
  const x = dir > 0 ? width - p * (width + band) : -band + p * (width + band);
  const fronds = Array.from({length: 9}, (_, i) => {
    const fx = (i / 8) * band;
    const sway = Math.sin(t * 3 + i) * 30;
    const w = 90 + hash1(i * 3.3) * 120;
    return `M${fx - w},${height + 50} C${fx - w * 0.3 + sway},${height * 0.6} ${fx - w * 0.6 - sway},${height * 0.3} ${fx + sway * 0.5},-60 C${fx + w * 0.6 - sway},${height * 0.3} ${fx + w * 0.3 + sway},${height * 0.6} ${fx + w},${height + 50}Z`;
  });
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={width} height={height}>
        <defs>
          <linearGradient id="wipe-g" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#020a14" stopOpacity={0} />
            <stop offset="0.18" stopColor="#03121c" stopOpacity={1} />
            <stop offset="0.82" stopColor="#03121c" stopOpacity={1} />
            <stop offset="1" stopColor="#020a14" stopOpacity={0} />
          </linearGradient>
        </defs>
        <g transform={`translate(${x} 0)`}>
          <rect x={band * 0.12} y={0} width={band * 0.76} height={height} fill="url(#wipe-g)" />
          {fronds.map((d, i) => (
            <path key={i} d={d} fill={i % 2 ? '#0a2a22' : '#06201c'} />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Fundido desde/hacia negro. */
export const Fade: React.FC<{from: number; to: number; inverse?: boolean}> = ({from, to, inverse}) => {
  const t = useTime();
  const k = clamp((t - from) / (to - from));
  const o = inverse ? 1 - k : k;
  return o > 0.001 ? <AbsoluteFill style={{background: `rgba(1,4,12,${o})`}} /> : null;
};

/** Texto final del episodio. */
export const FinalCard: React.FC<{start: number; question: string; footer?: string}> = ({start, question, footer}) => {
  const t = useTime() - start;
  const {width, height} = useVideoConfig();
  if (t < 0) return null;
  const words = question.split(' ');
  return (
    <div style={{position: 'absolute', left: width * 0.07, right: width * 0.07, top: height * 0.2, textAlign: 'center', fontFamily: FONT_FAMILY}}>
      <div style={{fontWeight: 900, fontSize: 78, lineHeight: 1.08, color: '#ffffff'}}>
        {words.map((w, i) => {
          const k = easeOut((t - i * 0.09) / 0.5);
          const accent = /CRIATURA/.test(w);
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: 20,
                opacity: k,
                transform: `translateY(${(1 - k) * 30}px)`,
                color: accent ? '#ffd27a' : '#ffffff',
                textShadow: accent ? '0 0 30px rgba(255,210,122,0.45), 0 5px 18px rgba(0,0,0,0.7)' : '0 5px 18px rgba(0,0,0,0.7)',
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      {footer && (
        <div style={{marginTop: 34, fontWeight: 800, fontSize: 25, letterSpacing: 4, color: '#7fe9e0', opacity: easeOut((t - 1.2) / 0.8)}}>{footer}</div>
      )}
    </div>
  );
};
