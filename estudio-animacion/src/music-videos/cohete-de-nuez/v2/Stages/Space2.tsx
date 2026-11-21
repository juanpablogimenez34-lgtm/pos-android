// ESPACIO 2.0: profundidad en varias capas (nebulosas, tres capas de estrellas de distintos
// tamaños, asteroides lejanos), planetas detallados (bandas, terminador, atmósfera, anillo por
// delante y por detrás), Luna de queso con volumen y cometas animados. Iluminación de color por
// escena. Todo determinista y sin filtros pesados: degradados y formas simples.
import React from 'react';
import {hash1, mixColor} from '../../../../engine/math';
import {beatPulse} from '../../MusicSync/songMap';
import {Cam, layerT} from '../../Camera/cam2d';

const STAR = 'M0,-20 L6,-6 L21,-6 L9,3 L13,18 L0,9 L-13,18 L-9,3 L-21,-6 L-6,-6Z';

export type SpaceLook = {top: string; bottom: string; neb: [string, string, string]};
export const LOOKS: Record<string, SpaceLook> = {
  violet: {top: '#140c3e', bottom: '#3a1f78', neb: ['#ff7ab0', '#7ff3ff', '#c38aff']},
  teal: {top: '#06203a', bottom: '#14506a', neb: ['#5af0c8', '#7fb8ff', '#ffd27a']},
  rose: {top: '#2a0c3a', bottom: '#6a2468', neb: ['#ff9a6a', '#ff7ab0', '#9f8aff']},
  gold: {top: '#1c1240', bottom: '#4a2a5a', neb: ['#ffd27a', '#ff9ad5', '#7ff3ff']},
};

/** Fondo completo: degradado, nebulosas en capas, estrellas en 3 profundidades y destellos. */
export const SpaceStage: React.FC<{cam: Cam; t: number; look?: SpaceLook; asteroids?: number; stars?: number}> = ({cam, t, look = LOOKS.violet, asteroids = 0, stars = 1}) => {
  const bp = beatPulse(t, 5);
  const id = `sp2${look.top.slice(1)}`;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor={look.top} />
          <stop offset="1" stopColor={look.bottom} />
        </linearGradient>
        {look.neb.map((c, i) => (
          <radialGradient key={i} id={`${id}n${i}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={c} stopOpacity={0.5} />
            <stop offset="0.5" stopColor={c} stopOpacity={0.18} />
            <stop offset="1" stopColor={c} stopOpacity={0} />
          </radialGradient>
        ))}
      </defs>
      <rect x={0} y={0} width={1080} height={1920} fill={`url(#${id}bg)`} />
      {/* nebulosas: grandes nubes suaves + jirones */}
      <g transform={layerT(cam, 0.05)}>
        {Array.from({length: 9}, (_, i) => {
          const c = i % 3;
          const x = -1400 + hash1(i * 3.3) * 2800;
          const y = -1600 + hash1(i * 5.1) * 3200;
          const rx = 500 + hash1(i * 7.7) * 700;
          return <ellipse key={i} cx={x} cy={y} rx={rx} ry={rx * (0.45 + hash1(i) * 0.3)} transform={`rotate(${(hash1(i * 2) * 60 - 30).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})`} fill={`url(#${id}n${c})`} />;
        })}
      </g>
      <g transform={layerT(cam, 0.09)}>
        {Array.from({length: 7}, (_, i) => {
          const x = -1200 + hash1(i * 9.1) * 2400;
          const y = -1400 + hash1(i * 4.4) * 2800;
          return <path key={i} d={`M${x},${y} q220,-90 460,10 q160,70 340,-20`} stroke={look.neb[i % 3]} strokeWidth={60 + hash1(i) * 50} strokeLinecap="round" fill="none" opacity={0.08} />;
        })}
      </g>
      {/* estrellas: lejanas (pequeñas), medias y cercanas (grandes con destello en cruz) */}
      {[
        {d: 0.1, n: 260, r: [1, 2.2]},
        {d: 0.18, n: 120, r: [2, 3.6]},
        {d: 0.3, n: 26, r: [4, 7]},
      ].map((L, li) => (
        <g key={li} transform={layerT(cam, L.d)} opacity={stars}>
          {Array.from({length: L.n}, (_, i) => {
            const x = -3200 + hash1(i * 1.3 + li * 17) * 6400;
            const y = -3200 + hash1(i * 2.7 + li * 31) * 6400;
            const r = L.r[0] + hash1(i * 5.1 + li) * (L.r[1] - L.r[0]);
            const tw = 0.55 + 0.45 * Math.sin(t * (1 + hash1(i) * 2.5) + i);
            const col = i % 9 === 0 ? '#ffe7b0' : i % 11 === 0 ? '#bfe6ff' : '#ffffff';
            if (li < 2) return <circle key={i} cx={x} cy={y} r={r * (i % 13 === 0 ? 1 + bp * 0.7 : 1)} fill={col} opacity={0.3 + 0.65 * tw} />;
            const fl = r * (3 + 2 * tw + bp * 2);
            return (
              <g key={i} transform={`translate(${x.toFixed(0)} ${y.toFixed(0)})`} opacity={0.6 + 0.4 * tw}>
                <circle r={r * 2.4} fill={col} opacity={0.18} />
                <path d={`M${-fl},0 L${fl},0 M0,${-fl} L0,${fl}`} stroke={col} strokeWidth={1.6} opacity={0.7} />
                <circle r={r * 0.8} fill="#ffffff" />
              </g>
            );
          })}
          {li === 1 &&
            Array.from({length: 14}, (_, i) => (
              <path key={`s${i}`} transform={`translate(${(-3000 + hash1(i * 9.1) * 6000).toFixed(0)} ${(-3000 + hash1(i * 4.3) * 6000).toFixed(0)}) rotate(${(t * 15 + i * 30).toFixed(0)}) scale(${((7 + hash1(i) * 6 + bp * 3) / 20).toFixed(2)})`} d={STAR} fill={['#ffd23f', '#ff9ad5', '#7ff3ff'][i % 3]} opacity={0.85} />
            ))}
        </g>
      ))}
      {asteroids > 0 && <Asteroids cam={cam} t={t} n={asteroids} />}
    </g>
  );
};

/** Asteroides lejanos: rocas irregulares con cráteres, giro lento y parallax. */
export const Asteroids: React.FC<{cam: Cam; t: number; n: number; depth?: number; near?: boolean}> = ({cam, t, n, depth = 0.45, near = false}) => (
  <g transform={layerT(cam, depth)}>
    {Array.from({length: n}, (_, i) => {
      const x = -1500 + hash1(i * 6.1) * 3000;
      const y = -1700 + hash1(i * 3.9) * 3400;
      const r = (near ? 50 : 14) + hash1(i * 2.3) * (near ? 70 : 34);
      const pts = Array.from({length: 9}, (_, k) => {
        const a = (k / 9) * Math.PI * 2;
        const rr = r * (0.78 + hash1(i * 13 + k) * 0.35);
        return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
      });
      const base = mixColor('#8a7a9a', '#6a5a7a', hash1(i));
      return (
        <g key={i} transform={`translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${((t * (8 + hash1(i) * 20) + i * 40) % 360).toFixed(1)})`} opacity={near ? 1 : 0.75}>
          <polygon points={pts.join(' ')} fill={base} stroke="#3a2a4a" strokeWidth={near ? 4 : 2} strokeLinejoin="round" />
          <polygon points={pts.join(' ')} fill="#ffffff" opacity={0.12} transform={`translate(${-r * 0.12} ${-r * 0.14}) scale(0.8)`} />
          <circle cx={r * 0.25} cy={r * 0.1} r={r * 0.2} fill="#4a3a5a" opacity={0.55} />
          <circle cx={-r * 0.3} cy={-r * 0.25} r={r * 0.12} fill="#4a3a5a" opacity={0.5} />
          <path d={`M${(-r * 0.7).toFixed(1)},${(-r * 0.4).toFixed(1)} A${r * 0.8},${r * 0.8} 0 0 1 ${(r * 0.2).toFixed(1)},${(-r * 0.78).toFixed(1)}`} stroke="#d8c8ff" strokeWidth={near ? 4 : 2} fill="none" opacity={0.5} />
        </g>
      );
    })}
  </g>
);

/** Planeta detallado: bandas, terminador (lado en sombra), atmósfera y anillo delante/detrás. */
export const Planet2: React.FC<{x: number; y: number; r: number; c1: string; c2: string; ring?: string; t: number; tilt?: number; moon?: boolean; light?: number; uid: string}> = ({x, y, r, c1, c2, ring, t, tilt = -0.3, moon = false, light = -0.6, uid}) => {
  const id = `p2${uid}`;
  const deg = (tilt * 180) / Math.PI;
  const lx = Math.cos(light);
  const ly = Math.sin(light);
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
      <defs>
        <radialGradient id={`${id}g`} cx={0.5 + lx * 0.18} cy={0.5 + ly * 0.18} r="0.75">
          <stop offset="0" stopColor={mixColor(c1, '#ffffff', 0.35)} />
          <stop offset="0.55" stopColor={c1} />
          <stop offset="1" stopColor={mixColor(c1, '#140a30', 0.6)} />
        </radialGradient>
        <radialGradient id={`${id}a`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.8" stopColor={mixColor(c1, '#ffffff', 0.5)} stopOpacity={0} />
          <stop offset="0.92" stopColor={mixColor(c1, '#ffffff', 0.5)} stopOpacity={0.45} />
          <stop offset="1" stopColor={mixColor(c1, '#ffffff', 0.5)} stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${id}c`}>
          <circle r={r} />
        </clipPath>
      </defs>
      {ring && <path d={`M${r * 1.9},0 A${r * 1.9},${r * 0.5} 0 0 0 ${-r * 1.9},0`} transform={`rotate(${deg})`} fill="none" stroke={ring} strokeWidth={r * 0.22} opacity={0.55} />}
      <circle r={r * 1.14} fill={`url(#${id}a)`} />
      <circle r={r} fill={`url(#${id}g)`} />
      <g clipPath={`url(#${id}c)`}>
        {[-0.62, -0.3, 0.02, 0.34, 0.62].map((k, i) => (
          <path key={i} d={`M${-r * 1.2},${k * r} Q${-r * 0.4 + Math.sin(t * 0.3 + i) * r * 0.1},${k * r - r * 0.08} 0,${k * r} T${r * 1.2},${k * r}`} stroke={i % 2 ? c2 : mixColor(c2, c1, 0.5)} strokeWidth={r * (0.08 + 0.06 * (i % 3))} fill="none" opacity={0.55} />
        ))}
        <ellipse cx={r * 0.3} cy={r * 0.2} rx={r * 0.18} ry={r * 0.1} fill={mixColor(c2, '#ffffff', 0.3)} opacity={0.6} />
        {/* terminador: sombra del lado opuesto a la luz */}
        <circle cx={-lx * r * 0.55} cy={-ly * r * 0.55} r={r * 1.05} fill="#140a30" opacity={0.0} />
        <circle cx={-lx * r * 1.15} cy={-ly * r * 1.15} r={r * 1.25} fill="none" stroke="#140a30" strokeWidth={r * 0.9} opacity={0.35} />
      </g>
      <path d={`M${(lx * r * 0.2 - r * 0.62).toFixed(1)},${(ly * r * 0.2 - r * 0.5).toFixed(1)} A${r * 0.8},${r * 0.8} 0 0 1 ${(lx * r * 0.2 + r * 0.1).toFixed(1)},${(ly * r * 0.2 - r * 0.8).toFixed(1)}`} stroke="#ffffff" strokeWidth={r * 0.05} fill="none" opacity={0.35} strokeLinecap="round" />
      {ring && <path d={`M${-r * 1.9},0 A${r * 1.9},${r * 0.5} 0 0 0 ${r * 1.9},0`} transform={`rotate(${deg})`} fill="none" stroke={ring} strokeWidth={r * 0.22} />}
      {ring && <path d={`M${-r * 1.7},0 A${r * 1.7},${r * 0.42} 0 0 0 ${r * 1.7},0`} transform={`rotate(${deg})`} fill="none" stroke="#ffffff" strokeWidth={r * 0.03} opacity={0.5} />}
      {moon && (
        <g transform={`translate(${(Math.cos(t * 0.5) * r * 1.6).toFixed(1)} ${(Math.sin(t * 0.5) * r * 0.5 - r * 0.2).toFixed(1)})`}>
          <circle r={r * 0.16} fill="#d8d0f0" />
          <circle cx={-r * 0.04} cy={-r * 0.03} r={r * 0.05} fill="#b0a8d0" />
        </g>
      )}
    </g>
  );
};

/** Luna de queso con volumen: esfera con sombra, agujeros de queso deformados por la curvatura
 *  (escorzo hacia el borde), cada uno con sombra interior y borde iluminado. */
const HOLES = Array.from({length: 16}, (_, i) => {
  const a = hash1(i * 3.7) * Math.PI * 2;
  const d = Math.sqrt(hash1(i * 6.1)) * 0.82;
  return {x: Math.cos(a) * d, y: Math.sin(a) * d, r: 0.06 + hash1(i * 9.3) * 0.13};
});
export const CheeseMoon2: React.FC<{x: number; y: number; r: number; t: number; rot?: number}> = ({x, y, r, t, rot = 0}) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
    <defs>
      <radialGradient id="cm2g" cx="0.36" cy="0.3" r="0.78">
        <stop offset="0" stopColor="#fffbe0" />
        <stop offset="0.45" stopColor="#ffe48a" />
        <stop offset="0.85" stopColor="#f0b840" />
        <stop offset="1" stopColor="#b8782a" />
      </radialGradient>
      <radialGradient id="cm2h" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0.86" stopColor="#fff2a0" stopOpacity={0} />
        <stop offset="0.94" stopColor="#fff2a0" stopOpacity={0.35} />
        <stop offset="1" stopColor="#fff2a0" stopOpacity={0} />
      </radialGradient>
      <clipPath id="cm2c">
        <circle r={r} />
      </clipPath>
    </defs>
    <circle r={r * 1.18} fill="url(#cm2h)" />
    <circle r={r} fill="url(#cm2g)" />
    <g clipPath="url(#cm2c)" transform={`rotate(${rot})`}>
      {HOLES.map((h, i) => {
        const hx = h.x + Math.sin(t * 0.05) * 0.02;
        const d = Math.hypot(hx, h.y);
        const fore = Math.sqrt(Math.max(0.05, 1 - d * d)); // escorzo
        const ang = (Math.atan2(h.y, hx) * 180) / Math.PI;
        const rr = h.r * r;
        return (
          <g key={i} transform={`translate(${(hx * r).toFixed(1)} ${(h.y * r).toFixed(1)}) rotate(${ang.toFixed(1)})`}>
            <ellipse rx={rr * fore} ry={rr} fill="#d89a30" />
            <ellipse cx={rr * fore * 0.18} rx={rr * fore * 0.82} ry={rr * 0.84} fill="#b87a22" />
            <path d={`M${(-rr * fore).toFixed(1)},0 A${(rr * fore).toFixed(1)},${rr.toFixed(1)} 0 0 0 ${(rr * fore * 0.4).toFixed(1)},${(rr * 0.92).toFixed(1)}`} stroke="#fff4c0" strokeWidth={Math.max(2, rr * 0.12)} fill="none" opacity={0.7} transform="scale(1 -1)" />
          </g>
        );
      })}
      <circle cx={r * 0.55} cy={r * 0.5} r={r * 1.05} fill="none" stroke="#7a4a1a" strokeWidth={r * 0.5} opacity={0.18} transform={`translate(${r * 0.35} ${r * 0.35})`} />
    </g>
    <path d={`M${-r * 0.7},${-r * 0.5} A${r * 0.86},${r * 0.86} 0 0 1 ${r * 0.05},${-r * 0.85}`} stroke="#ffffff" strokeWidth={r * 0.04} fill="none" opacity={0.5} strokeLinecap="round" />
    {Array.from({length: 6}, (_, i) => (
      <path key={i} transform={`translate(${(Math.cos(i * 1.05 + t * 0.15) * r * 1.4).toFixed(1)} ${(Math.sin(i * 1.05 + t * 0.15) * r * 1.28).toFixed(1)}) rotate(${(t * 30 + i * 40).toFixed(0)}) scale(${((10 + (i % 3) * 4) / 20).toFixed(2)})`} d={STAR} fill="#fff6c8" />
    ))}
  </g>
);

/** Cometa animado: cabeza brillante y cola curva de partículas que se desvanecen. */
export const Comet2: React.FC<{t: number; t0: number; dur: number; x0: number; y0: number; x1: number; y1: number; s?: number; c?: string}> = ({t, t0, dur, x0, y0, x1, y1, s = 1, c = '#bff6ff'}) => {
  const u = (t - t0) / dur;
  if (u < 0 || u > 1) return null;
  const pos = (k: number) => ({x: x0 + (x1 - x0) * k, y: y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * 80});
  const h = pos(u);
  return (
    <g opacity={Math.min(1, Math.sin(u * Math.PI) * 2)}>
      {Array.from({length: 18}, (_, i) => {
        const k = Math.max(0, u - i * 0.012);
        const p = pos(k);
        const w = (1 - i / 18) * 16 * s;
        return <circle key={i} cx={p.x + Math.sin(i + t * 9) * i * 0.6} cy={p.y + Math.cos(i * 1.3 + t * 7) * i * 0.6} r={w} fill={i % 3 === 0 ? '#ffffff' : c} opacity={0.5 * (1 - i / 18)} />;
      })}
      <circle cx={h.x} cy={h.y} r={30 * s} fill={c} opacity={0.3} />
      <circle cx={h.x} cy={h.y} r={12 * s} fill="#ffffff" />
    </g>
  );
};
