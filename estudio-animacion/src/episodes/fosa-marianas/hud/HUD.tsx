// INDICADORES CINEMATOGRÁFICOS (pantalla 1920×1080), discretos y fuera de la franja de subtítulos:
//  · Contador de profundidad (derecha): cifra grande, cinta con marcas cada 100 m que se desplaza al
//    descender, columna completa 0–11.000 m con las zonas y la posición actual.
//  · Datos ocasionales: zona, presión y temperatura APROXIMADAS.
//  · Ficha de especie (arriba a la izquierda): nombre común, científico, rango documentado y rasgo.
import React from 'react';
import {clamp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {CHALLENGER, fmt, pressureAtm, tempAt, zoneOf} from '../data/depth';

const ZONES: [number, number, string][] = [[0, 200, '#3cc8e8'], [200, 1000, '#2a6aa8'], [1000, 4000, '#3a3a8a'], [4000, 6000, '#5a3a7a'], [6000, CHALLENGER, '#7a2a3a']];
const COL_TOP = 180;
const COL_H = 520;
const yOf = (m: number) => COL_TOP + (m / 11000) * COL_H;

export const DepthHUD: React.FC<{d: number; k: number; info: number}> = ({d, k, info}) => {
  if (k <= 0.01) return null;
  const z = zoneOf(d);
  // cinta: marcas cada 100 m alrededor de la profundidad actual (px por 100 m)
  const PX = 34;
  const ticks: React.ReactNode[] = [];
  const base = Math.floor(d / 100) * 100;
  for (let m = base - 500; m <= base + 600; m += 100) {
    if (m < 0 || m > 11000) continue;
    const y = 470 + ((m - d) / 100) * PX;
    if (y < 330 || y > 610) continue;
    const major = m % 500 === 0;
    const fade = clamp(1 - Math.abs(y - 470) / 140);
    ticks.push(
      <g key={m} opacity={0.25 + 0.75 * fade}>
        <line x1={1716} x2={major ? 1748 : 1736} y1={y} y2={y} stroke="#cfefff" strokeWidth={major ? 2.5 : 1.5} />
        {major && <text x={1756} y={y + 6} fill="#cfefff" fontSize={17} fontWeight={700}>{fmt(m)}</text>}
      </g>,
    );
  }
  return (
    <div style={{position: 'absolute', inset: 0, opacity: k, fontFamily: FONT_FAMILY, pointerEvents: 'none'}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="hudfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity={0} />
            <stop offset="0.5" stopColor="#000" stopOpacity={0.35} />
            <stop offset="1" stopColor="#000" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* columna completa con zonas */}
        <rect x={1858} y={COL_TOP - 6} width={14} height={COL_H + 12} rx={7} fill="#000" opacity={0.35} />
        {ZONES.map(([a, b, c]) => <rect key={a} x={1861} y={yOf(a)} width={8} height={yOf(b) - yOf(a)} fill={c} opacity={0.85} />)}
        <rect x={1861} y={COL_TOP} width={8} height={Math.max(0, yOf(d) - COL_TOP)} fill="#ffffff" opacity={0.35} />
        <path d={`M1852 ${yOf(d)}l-12 -7l0 14Z`} fill="#ffd23f" />
        {[0, 2000, 4000, 6000, 8000, 10000].map((m) => <text key={m} x={1880} y={yOf(m) + 5} fill="#cfefff" opacity={0.5} fontSize={13} fontWeight={700}>{m / 1000}k</text>)}
        {/* cinta de 100 m */}
        <rect x={1700} y={330} width={140} height={280} fill="url(#hudfade)" />
        <line x1={1716} x2={1716} y1={330} y2={610} stroke="#cfefff" strokeOpacity={0.4} strokeWidth={1.5} />
        {ticks}
        <path d="M1700 470l14 -8l0 16Z" fill="#ffd23f" />
      </svg>
      {/* cifra principal */}
      <div style={{position: 'absolute', right: 70, top: 222, textAlign: 'right', whiteSpace: 'nowrap'}}>
        <div style={{color: '#ffffff', fontWeight: 900, fontSize: 50, lineHeight: 1, textShadow: '0 3px 14px rgba(0,0,0,0.8)', fontVariantNumeric: 'tabular-nums'}}>−{fmt(d)} m</div>
        <div style={{color: '#8fe8ff', fontWeight: 800, fontSize: 14, letterSpacing: 2, marginTop: 6, textShadow: '0 2px 8px rgba(0,0,0,0.9)'}}>{z.name}</div>
      </div>
      {info > 0.01 && (
        <div style={{position: 'absolute', right: 70, top: 640, textAlign: 'right', opacity: info, color: '#d8f4ff', fontWeight: 700, fontSize: 19, lineHeight: 1.55, textShadow: '0 2px 8px rgba(0,0,0,0.9)', whiteSpace: 'nowrap'}}>
          <div>Presión ≈ {fmt(pressureAtm(d))} atm</div>
          <div>Temperatura ≈ {tempAt(d).toFixed(1).replace('.', ',')} °C</div>
          <div style={{color: '#8fb8cc', fontSize: 14}}>valores aproximados</div>
        </div>
      )}
      <div style={{position: 'absolute', right: 70, top: 180, color: '#cfefff', opacity: 0.5, fontWeight: 800, fontSize: 13, letterSpacing: 2}}>DESCENSO ACELERADO · REPRESENTACIÓN</div>
    </div>
  );
};

export type Species = {common: string; sci: string; range: string; fact: string; note?: string};
/** Ficha discreta de especie (arriba a la izquierda), con entrada y salida suaves. */
export const SpeciesCard: React.FC<{s: Species; k: number}> = ({s, k}) => {
  if (k <= 0.01) return null;
  const e = k * k * (3 - 2 * k);
  return (
    <div style={{position: 'absolute', left: 64, top: 64, width: 560, opacity: e, transform: `translateX(${((1 - e) * -24).toFixed(1)}px)`, fontFamily: FONT_FAMILY, pointerEvents: 'none'}}>
      <div style={{borderLeft: '4px solid #ffd23f', padding: '12px 20px 14px', background: 'linear-gradient(90deg, rgba(2,14,26,0.78), rgba(2,14,26,0))'}}>
        <div style={{color: '#ffffff', fontWeight: 900, fontSize: 34, lineHeight: 1.05, textShadow: '0 2px 10px rgba(0,0,0,0.8)'}}>{s.common}</div>
        <div style={{color: '#9fe8ff', fontStyle: 'italic', fontWeight: 600, fontSize: 21, marginTop: 4}}>{s.sci}</div>
        <div style={{color: '#ffd23f', fontWeight: 800, fontSize: 17, letterSpacing: 1.2, marginTop: 8}}>RANGO DOCUMENTADO: {s.range}</div>
        <div style={{color: '#e8f6ff', fontWeight: 600, fontSize: 18, marginTop: 6, lineHeight: 1.3}}>{s.fact}</div>
        {s.note && <div style={{color: '#ffb8a0', fontWeight: 700, fontSize: 15, marginTop: 6, lineHeight: 1.25}}>{s.note}</div>}
      </div>
    </div>
  );
};
/** Rótulo central breve (títulos de capítulo y textos de impacto). */
export const BigText: React.FC<{k: number; lines: string[]; top?: number; size?: number; sub?: string}> = ({k, lines, top = 380, size = 86, sub}) => {
  if (k <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 120, right: 120, top, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `scale(${(0.96 + 0.04 * k).toFixed(3)})`, pointerEvents: 'none'}}>
      {lines.map((l, i) => <div key={i} style={{fontWeight: 900, fontSize: size, lineHeight: 1.08, color: '#ffffff', letterSpacing: 2, textShadow: '0 0 40px rgba(0,40,80,0.6), 0 6px 20px rgba(0,0,0,0.9)'}}>{l}</div>)}
      {sub && <div style={{marginTop: 18, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: '#ffd23f', textShadow: '0 3px 12px rgba(0,0,0,0.9)'}}>{sub}</div>}
    </div>
  );
};
/** Capítulo (esquina superior central). */
export const Chapter: React.FC<{n: number; title: string; range: string; k: number}> = ({n, title, range, k}) => {
  if (k <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${((1 - k) * -10).toFixed(1)}px)`, pointerEvents: 'none'}}>
      <div style={{color: '#8fe8ff', fontWeight: 800, fontSize: 20, letterSpacing: 8}}>CAPÍTULO {n} · {range}</div>
      <div style={{color: '#ffffff', fontWeight: 900, fontSize: 52, letterSpacing: 1, textShadow: '0 4px 18px rgba(0,0,0,0.85)'}}>{title.toUpperCase()}</div>
    </div>
  );
};
/** Etiqueta pequeña (p. ej. "RECONSTRUCCIÓN ILUSTRADA"). */
export const Badge: React.FC<{k: number; text: string; x?: number; y?: number; color?: string}> = ({k, text, x = 64, y = 22, color = '#ffd23f'}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: x, top: y, opacity: k, fontFamily: FONT_FAMILY, pointerEvents: 'none'}}>
      <span style={{display: 'inline-block', padding: '6px 16px', borderRadius: 20, background: 'rgba(2,14,26,0.7)', border: `1.5px solid ${color}88`, color, fontWeight: 800, fontSize: 17, letterSpacing: 2}}>{text}</span>
    </div>
  ) : null;
