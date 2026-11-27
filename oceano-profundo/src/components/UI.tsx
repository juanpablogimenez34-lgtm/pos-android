// INTERFAZ DOCUMENTAL: subtítulos, rótulos de especie, indicador de profundidad, escala, etiquetas anatómicas,
// avisos de reconstrucción y títulos. Se adaptan al formato (16:9 o 9:16).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useView} from '../utils/context';
import {Cue} from '../utils/cues';
import {FONT} from '../utils/fonts';
import {clamp, lerp} from '../utils/math';

/** Formato numérico con punto de miles (4.000), coherente con los rótulos. */
export const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const seg = (t: number, a: number, b: number) => {
  const u = clamp((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
export const win = (t: number, a: number, b: number, r = 0.4) => clamp((t - a) / r) * clamp((b - t) / r);

export const Subtitles: React.FC<{cues: Cue[]; t: number; highlight?: string[]}> = ({cues, t, highlight = []}) => {
  const {w, h, vertical} = useView();
  const c = cues.find((q) => t >= q.start && t < q.end);
  if (!c) return null;
  const k = clamp((t - c.start) / 0.12) * clamp((c.end - t) / 0.12);
  const size = vertical ? 46 : 40;
  const mark = (line: string) =>
    line.split(' ').map((wd, i) => {
      const hit = highlight.some((x) => wd.toLowerCase().replace(/[^a-záéíóúñü]/g, '').startsWith(x));
      return <span key={i} style={{color: hit ? '#ffd76a' : '#ffffff'}}>{wd} </span>;
    });
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: vertical ? h * 0.7 : h - 190, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.25, opacity: k, padding: `0 ${vertical ? 60 : w * 0.16}px`}}>
      {c.lines.map((l, i) => (
        <div key={i}>
          <span style={{background: 'rgba(2,8,16,0.55)', padding: '2px 14px', borderRadius: 10, textShadow: '0 2px 6px rgba(0,0,0,0.9)', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>{mark(l)}</span>
        </div>
      ))}
    </div>
  );
};

/** Rótulo de especie (tercio inferior izquierdo): nombre común, nombre científico y dato. */
export const SpeciesCard: React.FC<{k: number; name: string; sci: string; info?: string}> = ({k, name, sci, info}) => {
  const {vertical, h} = useView();
  if (k <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: vertical ? 60 : 110, top: vertical ? h * 0.13 : h * 0.62, fontFamily: FONT, opacity: k, transform: `translateX(${((1 - k) * -40).toFixed(1)}px)`}}>
      <div style={{width: 70 * k, height: 4, background: '#7ad8ff', marginBottom: 12}} />
      <div style={{fontSize: vertical ? 58 : 54, fontWeight: 900, color: '#f2f8ff', letterSpacing: 1, textShadow: '0 3px 12px rgba(0,0,0,0.85)'}}>{name}</div>
      <div style={{fontSize: vertical ? 32 : 30, fontWeight: 600, fontStyle: 'italic', color: '#9fd8ff', textShadow: '0 2px 8px rgba(0,0,0,0.85)'}}>{sci}</div>
      {info && <div style={{fontSize: vertical ? 26 : 24, fontWeight: 600, color: '#cfe0ea', marginTop: 8, textShadow: '0 2px 8px rgba(0,0,0,0.85)'}}>{info}</div>}
    </div>
  );
};

/** Indicador de profundidad (escala vertical con marcas de zonas y presión). */
export const DepthGauge: React.FC<{k: number; depth: number; max?: number; showZones?: boolean; compact?: boolean}> = ({k, depth, max = 4500, showZones = true, compact = false}) => {
  const {vertical, w, h} = useView();
  if (k <= 0.01) return null;
  const H = compact ? 0 : vertical ? 760 : 700;
  const x = vertical ? w - 290 : w - 300;
  const y0 = vertical ? 330 : 170;
  const yAt = (d: number) => y0 + (Math.log10(1 + d) / Math.log10(1 + max)) * H;
  const zones: [number, number, string, string][] = [[0, 200, 'ZONA ILUMINADA', '#5ab8e0'], [200, 1000, 'CREPUSCULAR', '#2a6a9a'], [1000, 4000, 'MEDIANOCHE', '#16305a'], [4000, 4500, 'ABISAL', '#0e1a34']];
  const atm = 1 + depth / 10;
  if (compact)
    return (
      <div style={{position: 'absolute', right: vertical ? 50 : 70, top: vertical ? 120 : 60, fontFamily: FONT, opacity: k * 0.9, textAlign: 'right', textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>
        <div style={{fontSize: 30, fontWeight: 900, color: '#e8f6ff'}}>{fmt(depth)} m</div>
        <div style={{fontSize: 18, fontWeight: 700, color: '#9fc8e0', letterSpacing: 2}}>PROFUNDIDAD APROX.</div>
      </div>
    );
  return (
    <svg width={w} height={h} style={{position: 'absolute', inset: 0, opacity: k}}>
      {showZones && zones.map(([a, b, name, col]) => (
        <g key={name}>
          <rect x={x} y={yAt(a)} width={16} height={yAt(Math.min(b, max)) - yAt(a)} fill={col} stroke="#cfe8ff" strokeWidth={1} />
          <text x={x + 30} y={(yAt(a) + yAt(Math.min(b, max))) / 2 - 2} fontFamily={FONT} fontWeight={800} fontSize={vertical ? 22 : 19} fill={depth >= a && depth < b ? '#ffffff' : '#8fb4cc'} letterSpacing={1.2} stroke="rgba(0,0,0,0.7)" strokeWidth={4} paintOrder="stroke">{name}</text>
          <text x={x + 30} y={(yAt(a) + yAt(Math.min(b, max))) / 2 + 20} fontFamily={FONT} fontWeight={600} fontSize={vertical ? 18 : 16} fill="#a8c8dc" stroke="rgba(0,0,0,0.7)" strokeWidth={3} paintOrder="stroke">{fmt(a)}–{fmt(b)} m</text>
        </g>
      ))}
      <g transform={`translate(${x} ${yAt(depth)})`}>
        <path d="M-6,0 l-16,-11 l0,22z" fill="#ffd76a" />
        <text x={-30} y={-6} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={vertical ? 44 : 40} fill="#ffffff" stroke="rgba(0,0,0,0.7)" strokeWidth={5} paintOrder="stroke">{fmt(depth)} m</text>
        <text x={-30} y={24} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={vertical ? 26 : 22} fill="#ffd76a" stroke="rgba(0,0,0,0.7)" strokeWidth={4} paintOrder="stroke">≈ {fmt(atm)} atm</text>
      </g>
    </svg>
  );
};

/** Etiqueta anatómica con línea guía (coordenadas de pantalla). */
export const Label: React.FC<{x: number; y: number; tx: number; ty: number; text: string; k: number; color?: string}> = ({x, y, tx, ty, text, k, color = '#9ff0ff'}) => {
  const {w, h, vertical} = useView();
  if (k <= 0.01) return null;
  const right = tx > x;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: k}}>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
        <circle cx={x} cy={y} r={7} fill="none" stroke={color} strokeWidth={2.5} />
        <path d={`M${x},${y} L${lerp(x, tx, clamp(k * 1.3))},${lerp(y, ty, clamp(k * 1.3))}`} stroke={color} strokeWidth={2.2} />
      </svg>
      <div style={{position: 'absolute', top: ty - 24, ...(right ? {left: tx + 8} : {right: w - tx + 8}), fontFamily: FONT, fontWeight: 800, fontSize: vertical ? 34 : 30, color: '#f4fdff', background: 'rgba(3,14,24,0.66)', padding: '6px 14px', borderRadius: 10, border: `1px solid ${color}55`}}>{text}</div>
    </AbsoluteFill>
  );
};

/** Aviso permanente para secuencias reconstruidas o ilustrativas. */
export const Notice: React.FC<{k: number; text: string}> = ({k, text}) => {
  const {vertical} = useView();
  if (k <= 0.01) return null;
  return <div style={{position: 'absolute', left: vertical ? 50 : 70, top: vertical ? 120 : 60, fontFamily: FONT, fontWeight: 800, fontSize: vertical ? 22 : 20, letterSpacing: 2.5, color: '#ffd8a8', opacity: 0.85 * k, textShadow: '0 2px 6px rgba(0,0,0,0.85)', background: 'rgba(30,14,4,0.35)', padding: '6px 12px', borderRadius: 8}}>{text}</div>;
};

/** Título grande centrado (aperturas, preguntas, revelaciones). */
export const Title: React.FC<{k: number; lines: string[]; size?: number; top?: number; color?: string}> = ({k, lines, size, top, color = '#f4faff'}) => {
  const {vertical, h} = useView();
  if (k <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: top ?? (vertical ? h * 0.2 : h * 0.16), textAlign: 'center', fontFamily: FONT, opacity: k, transform: `scale(${(1.06 - 0.06 * k).toFixed(3)})`}}>
      {lines.map((l, i) => <div key={i} style={{fontSize: size ?? (vertical ? 78 : 76), fontWeight: 900, color, letterSpacing: 2, lineHeight: 1.1, textShadow: '0 4px 18px rgba(0,0,0,0.85)'}}>{l}</div>)}
    </div>
  );
};

/** Barra de comparación de tamaños (pantalla). */
export const SizeBar: React.FC<{k: number; x: number; y: number; len: number; text: string; color?: string; vertical?: boolean}> = ({k, x, y, len, text, color = '#ffd76a'}) => {
  const {w, h, vertical} = useView();
  if (k <= 0.01) return null;
  const L = len * clamp(k * 1.2);
  return (
    <svg width={w} height={h} style={{position: 'absolute', inset: 0, opacity: k}}>
      <path d={`M${x},${y - 12} L${x},${y + 12} M${x},${y} L${x + L},${y} M${x + L},${y - 12} L${x + L},${y + 12}`} stroke={color} strokeWidth={4} />
      <text x={x + L / 2} y={y - 22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={vertical ? 34 : 32} fill={color} stroke="rgba(0,0,0,0.75)" strokeWidth={5} paintOrder="stroke">{text}</text>
    </svg>
  );
};
