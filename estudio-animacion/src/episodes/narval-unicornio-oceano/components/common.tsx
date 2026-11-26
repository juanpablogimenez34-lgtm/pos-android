// Rótulos y utilidades de tiempo del episodio (narval).
import React from 'react';
import {clamp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {SCENES} from '../data/timeline';

export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const win = (t: number, a: number, b: number, r = 0.4) => clamp((t - a) / r) * clamp((b - t) / r);
export const SceneTag: React.FC<{t: number}> = ({t}) => {
  const s = SCENES.find((x) => t >= x.start && t < x.end);
  if (!s || s.n === 1) return null;
  const k = clamp((t - s.start - 0.5) / 0.5) * clamp((s.start + 4 - t) / 0.5);
  if (k <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${((1 - k) * -12).toFixed(1)}px)`}}>
      <div style={{color: '#8fe0ff', fontWeight: 800, fontSize: 26, letterSpacing: 7}}>ESCENA {s.n}</div>
      <div style={{color: '#f4fbff', fontWeight: 900, fontSize: 46, letterSpacing: 1, textShadow: '0 3px 14px rgba(0,0,0,0.85)'}}>{s.title.toUpperCase()}</div>
    </div>
  );
};
export const BigTitle: React.FC<{k: number; lines: string[]; top?: number; size?: number; color?: string}> = ({k, lines, top = 330, size = 92, color = '#ffffff'}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `scale(${(0.94 + 0.06 * k).toFixed(3)})`}}>
      {lines.map((l, i) => (
        <div key={i} style={{fontWeight: 900, fontSize: i === 0 ? size * 0.55 : size, lineHeight: 1.05, letterSpacing: 2, color: i === 0 ? '#bfeaff' : color, textShadow: '0 0 30px rgba(0,30,60,0.6), 0 6px 18px rgba(0,0,0,0.9)'}}>{l}</div>
      ))}
    </div>
  ) : null;
export const Brand: React.FC = () => (
  <div style={{position: 'absolute', left: 54, top: 70, fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 22, letterSpacing: 4, color: '#eaf6ff', opacity: 0.45, textShadow: '0 2px 6px rgba(0,0,0,0.6)'}}>MUNDO INSÓLITO</div>
);
export const Tag: React.FC<{k: number; text: string; top?: number; color?: string}> = ({k, text, top = 330, color = '#9fe8ff'}) =>
  k > 0.01 ? <div style={{position: 'absolute', left: 30, right: 30, top, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k}}><span style={{display: 'inline-block', padding: '6px 18px', borderRadius: 24, background: 'rgba(2,18,30,0.62)', fontWeight: 800, fontSize: 30, letterSpacing: 3, color, textShadow: '0 2px 10px rgba(0,0,0,0.9)'}}>{text}</span></div> : null;
export const Wash: React.FC<{k: number; color?: string}> = ({k, color = '#000'}) => (k > 0.002 ? <div style={{position: 'absolute', inset: 0, background: color, opacity: k}} /> : null);
export const Card: React.FC<{k: number; title: string; x?: number; y?: number; w?: number; h?: number; children: React.ReactNode}> = ({k, title, x = 60, y = 330, w = 960, h = 1100, children}) => {
  if (k <= 0.01) return null;
  const e = k * k * (3 - 2 * k);
  return (
    <g opacity={e} transform={`translate(0 ${((1 - e) * 40).toFixed(1)})`}>
      <rect x={x} y={y} width={w} height={h} rx={34} fill="#031420" opacity={0.88} stroke="#7ad8ff" strokeOpacity={0.5} strokeWidth={2.5} />
      <text x={x + w / 2} y={y + 64} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={900} fontSize={40} fill="#ffd23f">{title}</text>
      {children}
    </g>
  );
};
export const Txt: React.FC<{x: number; y: number; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; w?: number; children: React.ReactNode; op?: number}> = ({x, y, s = 30, c = '#eef8ff', a = 'start', w = 800, children, op = 1}) => (
  <text x={x} y={y} fontFamily={FONT_FAMILY} fontWeight={w} fontSize={s} fill={c} textAnchor={a} opacity={op} style={{paintOrder: 'stroke'}} stroke="#021018" strokeWidth={5} strokeLinejoin="round">{children}</text>
);
/** Rótulo de la fase de caza con el colmillo (1–10). */
export const PhaseTag: React.FC<{i: number; k?: number; names: string[]; top?: number}> = ({i, k = 1, names, top = 1240}) =>
  i >= 0 && i < 10 && k > 0.01 ? (
    <div style={{position: 'absolute', left: 40, right: 40, top, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k}}>
      <div style={{display: 'inline-block', padding: '8px 22px', borderRadius: 30, background: 'rgba(2,20,32,0.72)', border: '2px solid rgba(255,210,63,0.6)', color: '#ffd23f', fontWeight: 900, fontSize: 28, letterSpacing: 2}}>
        {i + 1}/10 · {names[i]}
      </div>
    </div>
  ) : null;
