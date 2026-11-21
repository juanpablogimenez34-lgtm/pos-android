// Panel científico (65–70 s): el corazón sistémico late en reposo y deja de
// latir mientras el pulpo nada (registro tipo electrocardiograma).
import React from 'react';
import {useVideoConfig} from 'remotion';
import {clamp, easeOut} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {useTime} from '../../../engine/useTime';
import {beat, HEART_HZ} from '../../../creatures/octopus/Anatomy';

export const LENS = {start: 65, end: 70, stopA: 66.3, stopB: 68.3};

const stopped = (tt: number) => tt >= LENS.stopA && tt < LENS.stopB;

function ecg(tt: number) {
  if (stopped(tt)) return 0;
  const p = (((tt * HEART_HZ - 0.35) % 1) + 1) % 1;
  if (p < 0.04) return -0.15 * Math.sin((p / 0.04) * Math.PI);
  if (p < 0.1) return Math.sin(((p - 0.04) / 0.06) * Math.PI);
  if (p < 0.16) return -0.3 * Math.sin(((p - 0.1) / 0.06) * Math.PI);
  if (p > 0.3 && p < 0.42) return 0.18 * Math.sin(((p - 0.3) / 0.12) * Math.PI);
  return 0;
}

export const HeartLens: React.FC = () => {
  const t = useTime();
  const {width} = useVideoConfig();
  if (t < LENS.start || t > LENS.end) return null;
  const k = easeOut((t - LENS.start) / 0.5) * clamp((LENS.end - t) / 0.4);
  const isStopped = stopped(t);
  const b = isStopped ? 0 : beat(t, 0.35);
  const cx = width / 2;
  const cy = 470;
  const R = 200;
  const traceW = 520;
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const tt = t - 3 + (i / 120) * 3;
    pts.push(`${(cx - traceW / 2 + (i / 120) * traceW).toFixed(1)},${(cy + R + 70 - ecg(tt) * 46).toFixed(1)}`);
  }
  const r = 70 * (1 + 0.14 * b);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: k, transform: `scale(${0.92 + 0.08 * k})`, transformOrigin: `${cx}px ${cy}px`}}>
      <svg width={width} height={1000} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <radialGradient id="lens-bg" cx="0.5" cy="0.4" r="0.65">
            <stop offset="0" stopColor="#0d3550" stopOpacity={0.92} />
            <stop offset="1" stopColor="#04111f" stopOpacity={0.92} />
          </radialGradient>
          <radialGradient id="lens-heart" cx="0.4" cy="0.35" r="0.7">
            <stop offset="0" stopColor="#f08aa6" />
            <stop offset="0.6" stopColor="#c8476e" />
            <stop offset="1" stopColor="#6e1834" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={R} fill="url(#lens-bg)" stroke="#7fe9e0" strokeWidth={4} />
        <circle cx={cx} cy={cy} r={R + 14} fill="none" stroke="#7fe9e0" strokeOpacity={0.3} strokeWidth={2} />
        {/* vasos: llegan desde las branquias (azul) y sale la aorta */}
        <path d={`M${cx - R + 30},${cy - 40} C${cx - 120},${cy - 40} ${cx - 90},${cy - 10} ${cx - 55},${cy - 10}`} stroke="#3f8cff" strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d={`M${cx + R - 30},${cy - 40} C${cx + 120},${cy - 40} ${cx + 90},${cy - 10} ${cx + 55},${cy - 10}`} stroke="#3f8cff" strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d={`M${cx},${cy + 60} C${cx + 4},${cy + 110} ${cx - 10},${cy + 140} ${cx},${cy + R - 20}`} stroke="#3f8cff" strokeWidth={16} fill="none" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r * 1.6} fill="#c8476e" opacity={0.15 + 0.3 * b} />
        <path
          d={`M${cx},${cy + r * 1.05} C${cx - r * 1.25},${cy + r * 0.2} ${cx - r * 1.15},${cy - r * 0.95} ${cx - r * 0.35},${cy - r * 0.9} C${cx - r * 0.1},${cy - r * 0.88} ${cx},${cy - r * 0.6} ${cx},${cy - r * 0.5} C${cx},${cy - r * 0.6} ${cx + r * 0.1},${cy - r * 0.88} ${cx + r * 0.35},${cy - r * 0.9} C${cx + r * 1.15},${cy - r * 0.95} ${cx + r * 1.25},${cy + r * 0.2} ${cx},${cy + r * 1.05}Z`}
          fill="url(#lens-heart)"
          stroke="#2a0a18"
          strokeWidth={3}
          opacity={isStopped ? 0.75 : 1}
        />
        <ellipse cx={cx - r * 0.35} cy={cy - r * 0.4} rx={r * 0.3} ry={r * 0.17} fill="#ffffff" opacity={0.45} />
        <rect x={cx - traceW / 2 - 16} y={cy + R + 14} width={traceW + 32} height={112} rx={18} fill="#04111f" fillOpacity={0.85} stroke="#7fe9e0" strokeOpacity={0.4} />
        <polyline points={pts.join(' ')} stroke={isStopped ? '#ff8a7a' : '#7fffb0'} strokeWidth={4} fill="none" strokeLinejoin="round" />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: cy - R - 92, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 36, letterSpacing: 4, color: '#eafffb', textShadow: '0 2px 10px rgba(0,0,0,0.7)'}}>
        CORAZÓN SISTÉMICO
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: cy + R + 150, display: 'flex', justifyContent: 'center', fontFamily: FONT_FAMILY}}>
        <div
          style={{
            padding: '10px 26px',
            borderRadius: 30,
            fontWeight: 800,
            fontSize: 30,
            color: isStopped ? '#2a0606' : '#03200f',
            background: isStopped ? '#ff8a7a' : '#7fffb0',
          }}
        >
          {isStopped ? 'NADANDO: PUEDE DETENERSE' : 'EN REPOSO: LATE'}
        </div>
      </div>
    </div>
  );
};
