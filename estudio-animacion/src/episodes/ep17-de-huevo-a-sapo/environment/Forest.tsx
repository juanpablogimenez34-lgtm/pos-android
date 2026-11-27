// AMBIENTE B — ORILLA Y BOSQUE HÚMEDO (vista lateral, suelo en y = 0). Paleta musgo, tierra,
// verde oscuro, ámbar y dorado. A la izquierda, el borde del estanque (agua con reflejos); a la
// derecha, piedra húmeda, musgo, hojarasca con nervios, helechos, hongos, raíces, gotas que caen y
// salpican, insectos diminutos, rayos de luz ámbar y troncos lejanos desenfocados (parallax).
import React from 'react';
import {hash1, mixColor} from '../../../engine/math';
import {Cam, layerT} from '../../../studio2';
import {SoftFilter} from '../../oarfish-cinematic-v2/character/filters';
import {Stone} from './Pond';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
export const BANK = {ground: 0, waterEdge: -260};

export const Leaf: React.FC<{x: number; y: number; s: number; rot: number; c: string; t?: number}> = ({x, y, s, rot, c, t = 0}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(rot + Math.sin(t * 0.8 + x) * 2)}) scale(${f1(s)})`}>
    <path d="M0,0 C14,-18 46,-20 70,0 C46,18 14,16 0,0Z" fill={c} />
    <path d="M2,0 L66,0" stroke={mixColor(c, '#000', 0.35)} strokeWidth={1.4} />
    {[14, 26, 38, 50].map((v) => (
      <path key={v} d={`M${v},0 l8,-8 M${v},0 l8,7`} stroke={mixColor(c, '#000', 0.3)} strokeWidth={0.9} />
    ))}
    <path d="M6,-3 C20,-12 40,-13 58,-5" stroke="#fff4c8" strokeWidth={1.2} fill="none" opacity={0.3} />
  </g>
);

export const Fern: React.FC<{x: number; base: number; h: number; t: number; seed: number; c: string; dir?: number}> = ({x, base, h, t, seed, c, dir = 1}) => {
  const n = 12;
  const pts = Array.from({length: n + 1}, (_, i) => {
    const u = i / n;
    return {x: x + dir * (u * h * 0.55 + Math.sin(t * 0.6 + seed + u * 2) * 10 * u), y: base - Math.sin(u * Math.PI * 0.62) * h};
  });
  let pinnae = '';
  for (let i = 1; i < n; i++) {
    const p = pts[i];
    const L = 34 * (1 - i / n) + 6;
    for (const sd of [-1, 1]) {
      const a = Math.atan2(pts[i + 1].y - p.y, pts[i + 1].x - p.x) + sd * 1.15;
      const tip = {x: p.x + Math.cos(a) * L, y: p.y + Math.sin(a) * L};
      pinnae += `M${f1(p.x)},${f1(p.y)} Q${f1((p.x + tip.x) / 2 - Math.sin(a) * 5)},${f1((p.y + tip.y) / 2 + Math.cos(a) * 5)} ${f1(tip.x)},${f1(tip.y)} Q${f1((p.x + tip.x) / 2 + Math.sin(a) * 5)},${f1((p.y + tip.y) / 2 - Math.cos(a) * 5)} ${f1(p.x)},${f1(p.y)}Z `;
    }
  }
  return (
    <g>
      <path d={pts.map((p, i) => `${i ? 'L' : 'M'}${f1(p.x)},${f1(p.y)}`).join(' ')} stroke={mixColor(c, '#000', 0.3)} strokeWidth={3} fill="none" />
      <path d={pinnae} fill={c} />
    </g>
  );
};

export const Mushroom: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s)})`}>
    <path d="M-6,0 C-7,-20 -5,-40 -3,-52 L5,-52 C7,-40 8,-20 7,0Z" fill="#e8dcc0" />
    <path d="M-34,-50 C-30,-74 30,-76 36,-50 C20,-44 -18,-44 -34,-50Z" fill="#b8642a" />
    <path d="M-30,-50 C-14,-46 18,-46 32,-50" stroke="#6a3414" strokeWidth={1.4} fill="none" />
    {Array.from({length: 9}, (_, i) => <path key={i} d={`M${-26 + i * 6.5},-49 l0,4`} stroke="#8a5a34" strokeWidth={1} />)}
    <path d="M-18,-66 C-6,-72 10,-72 20,-66" stroke="#ffe0a8" strokeWidth={3} fill="none" opacity={0.45} strokeLinecap="round" />
  </g>
);

export const Moss: React.FC<{x: number; y: number; w: number; seed: number}> = ({x, y, w, seed}) => (
  <g>
    <path d={`M${f1(x - w / 2)},${f1(y)} C${f1(x - w * 0.35)},${f1(y - 30)} ${f1(x + w * 0.35)},${f1(y - 34)} ${f1(x + w / 2)},${f1(y)}Z`} fill="#4a7a2a" />
    {Array.from({length: Math.round(w / 6)}, (_, i) => {
      const px = x - w / 2 + 4 + hash1(seed * 7 + i) * (w - 8);
      const top = y - 26 * Math.sin(Math.PI * ((px - (x - w / 2)) / w));
      return <path key={i} d={`M${f1(px)},${f1(y)} L${f1(px + (hash1(i) - 0.5) * 4)},${f1(top - hash1(i * 3) * 8)}`} stroke={i % 3 ? '#6aa03a' : '#88b84a'} strokeWidth={2} strokeLinecap="round" />;
    })}
  </g>
);

/** Opciones del documental completo (por defecto, idéntico a la demo):
 *  wide: el bosque continúa hacia la derecha (x 1400–3600) para recorridos largos;
 *  season: 0 verano … 1 otoño (color de la hojarasca); light: 1 sol … 0 penumbra fría;
 *  fall: hojas que caen (0 … 1). */
export type ForestOpts = {wide?: boolean; season?: number; light?: number; fall?: number};
const autumn = (c: string, season: number) => (season > 0 ? mixColor(c, '#c8641e', 0.55 * season) : c);

export const ForestBack: React.FC<{cam: Cam; t: number; children?: React.ReactNode} & ForestOpts> = ({cam, t, children, wide = false, season = 0, light = 1, fall = 0}) => (
  <g>
    <defs>
      <linearGradient id="forestAir" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3a5a2a" />
        <stop offset="0.5" stopColor="#24381e" />
        <stop offset="1" stopColor="#121c10" />
      </linearGradient>
      <radialGradient id="forestSun" cx="0.8" cy="0.05" r="0.9">
        <stop offset="0" stopColor="#ffd890" stopOpacity={0.6} />
        <stop offset="0.45" stopColor="#c8a050" stopOpacity={0.15} />
        <stop offset="1" stopColor="#c8a050" stopOpacity={0} />
      </radialGradient>
      <linearGradient id="forestRay" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffe0a0" stopOpacity={0.5} />
        <stop offset="1" stopColor="#ffe0a0" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="forestSoil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4a3a24" />
        <stop offset="1" stopColor="#1e160c" />
      </linearGradient>
      <linearGradient id="bankWater" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3a6a5a" />
        <stop offset="1" stopColor="#123028" />
      </linearGradient>
      <linearGradient id="pondStoneShade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff0c0" stopOpacity={0.22} />
        <stop offset="1" stopColor="#000" stopOpacity={0.5} />
      </linearGradient>
      <SoftFilter id="forestFar" radius={9} />
      <SoftFilter id="forestRays" radius={24} />
    </defs>
    <rect width={1080} height={1920} fill="url(#forestAir)" />
    <rect width={1080} height={1920} fill="url(#forestSun)" opacity={light} />
    {/* troncos lejanos */}
    <g transform={layerT(cam, 0.3)} filter="url(#forestFar)" opacity={0.6}>
      {Array.from({length: 8}, (_, i) => {
        const x = cam.x * 0.3 - 900 + i * 260 + hash1(i) * 60;
        const w = 50 + hash1(i * 3) * 60;
        return <rect key={i} x={x} y={-1500} width={w} height={2200} fill={i % 2 ? '#1e2a16' : '#283620'} />;
      })}
    </g>
    <g transform={layerT(cam, 0.2)} filter="url(#forestRays)" opacity={0.75 * light}>
      {Array.from({length: 6}, (_, i) => {
        const x = cam.x * 0.2 - 400 + i * 230 + Math.sin(t * 0.25 + i) * 30;
        return <path key={i} d={`M${f1(x + 300)},-1500 L${f1(x + 380)},-1500 L${f1(x - 160)},900 L${f1(x - 300)},900Z`} fill="url(#forestRay)" opacity={0.35 + 0.25 * Math.sin(t * 0.5 + i * 1.7)} />;
      })}
    </g>
    {/* follaje medio */}
    <g transform={layerT(cam, 0.65)} opacity={0.85}>
      {Array.from({length: 12}, (_, i) => (
        <Fern key={i} x={cam.x * 0.65 - 1100 + i * 200} base={60} h={260 + hash1(i * 4) * 160} t={t} seed={i} c="#2e5a24" dir={i % 2 ? 1 : -1} />
      ))}
      <rect x={cam.x * 0.65 - 2000} y={60} width={4000} height={1200} fill="#2a2a18" />
    </g>
    {/* plano del personaje */}
    <g transform={layerT(cam, 1)}>
      {/* borde del estanque */}
      <rect x={-2400} y={BANK.ground + 18} width={2400 + BANK.waterEdge} height={900} fill="url(#bankWater)" />
      {Array.from({length: 9}, (_, i) => (
        <path key={`w${i}`} d={`M${-1600 + i * 150},${BANK.ground + 26 + (i % 3) * 8} q40,${f1(-3 + Math.sin(t * 1.5 + i) * 3)} 80,0`} stroke="#c8e8d0" strokeWidth={1.6} fill="none" opacity={0.35} />
      ))}
      {/* reflejos del bosque y destellos en el agua del estanque */}
      {Array.from({length: 14}, (_, i) => (
        <rect key={`rf${i}`} x={-2200 + i * 150 + hash1(i * 7) * 60} y={BANK.ground + 30} width={18 + hash1(i * 3) * 30} height={120 + hash1(i * 5) * 160} fill="#0e2a20" opacity={0.18} rx={9} />
      ))}
      {Array.from({length: 18}, (_, i) => (
        <path key={`sp${i}`} d={`M${f1(-2300 + hash1(i * 11) * 2000)},${f1(BANK.ground + 40 + hash1(i * 13) * 380)} l${f1(30 + hash1(i) * 50)},0`} stroke="#e8f8e8" strokeWidth={2} opacity={0.18 + 0.15 * Math.sin(t * 2 + i)} />
      ))}
      <path d={`M${BANK.waterEdge - 40},${BANK.ground + 20} C${BANK.waterEdge + 80},${BANK.ground - 14} 600,${BANK.ground - 8} 2400,${BANK.ground - 4} L2400,1200 L${BANK.waterEdge - 760},1200 C${BANK.waterEdge - 420},700 ${BANK.waterEdge - 160},200 ${BANK.waterEdge - 40},${BANK.ground + 20}Z`} fill="url(#forestSoil)" />
      <path d={`M${BANK.waterEdge - 760},1200 C${BANK.waterEdge - 420},700 ${BANK.waterEdge - 160},200 ${BANK.waterEdge - 40},${BANK.ground + 20}`} stroke="#2a4a3a" strokeWidth={10} fill="none" opacity={0.5} />
      <path d={`M${BANK.waterEdge - 40},${BANK.ground + 20} C${BANK.waterEdge + 80},${BANK.ground - 14} 600,${BANK.ground - 8} 2400,${BANK.ground - 4}`} stroke="#6a5a3a" strokeWidth={3} fill="none" opacity={0.6} />
      {/* textura del suelo: guijarros, ramitas, hojas caídas y humedad */}
      {Array.from({length: 70}, (_, i) => {
        const x = -300 + hash1(i * 3.3) * 1700;
        const y = BANK.ground + 14 + Math.pow(hash1(i * 5.1), 0.8) * 520;
        const r = 3 + hash1(i * 7.7) * 9;
        return <path key={`pb${i}`} d={`M${f1(x - r)},${f1(y)} q${f1(r * 0.3)},${f1(-r * 0.8)} ${f1(r)},${f1(-r * 0.7)} q${f1(r * 0.8)},${f1(r * 0.1)} ${f1(r)},${f1(r * 0.7)} q${f1(-r)},${f1(r * 0.4)} ${f1(-r * 2)},0Z`} fill={['#5a4a34', '#6a5a40', '#3e3020', '#7a6a4a'][i % 4]} opacity={0.85} />;
      })}
      {Array.from({length: 14}, (_, i) => {
        const x = -200 + hash1(i * 11) * 1500;
        const y = BANK.ground + 30 + hash1(i * 13) * 460;
        const L = 40 + hash1(i * 17) * 80;
        const a = (hash1(i * 19) - 0.5) * 0.6;
        return <path key={`tw${i}`} d={`M${f1(x)},${f1(y)} l${f1(Math.cos(a) * L)},${f1(Math.sin(a) * L)} m${f1(-Math.cos(a) * L * 0.5)},${f1(-Math.sin(a) * L * 0.5)} l${f1(12)},${f1(-10)}`} stroke="#2e2214" strokeWidth={3 + hash1(i) * 2} strokeLinecap="round" fill="none" />;
      })}
      {Array.from({length: 18}, (_, i) => (
        <Leaf key={`gl${i}`} x={-250 + hash1(i * 23) * 1600} y={BANK.ground + 40 + hash1(i * 29) * 480} s={0.7 + hash1(i * 31) * 0.7} rot={hash1(i * 37) * 360} c={autumn(['#7a5a24', '#94682a', '#5a4a20', '#8a3e1a'][i % 4], season)} />
      ))}
      {Array.from({length: 12}, (_, i) => (
        <ellipse key={`wet${i}`} cx={-150 + hash1(i * 41) * 1400} cy={BANK.ground + 60 + hash1(i * 43) * 420} rx={20 + hash1(i) * 40} ry={4 + hash1(i * 2) * 5} fill="#9ab8a8" opacity={0.12} />
      ))}
      {/* raíz, musgo, piedra húmeda */}
      <path d={`M-120,${BANK.ground - 4} C40,-40 220,-30 380,${BANK.ground - 6}`} stroke="#3a2a18" strokeWidth={16} fill="none" strokeLinecap="round" />
      <Stone x={0} y={BANK.ground + 4} w={230} h={58} seed={5} c="#4e5a4a" moss={0.5} />
      <path d="M-80,-50 C-30,-58 40,-58 90,-48" stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.25} strokeLinecap="round" />
      <Moss x={420} y={BANK.ground - 2} w={260} seed={2} />
      <Moss x={-260} y={BANK.ground + 10} w={140} seed={4} />
      <Mushroom x={660} y={BANK.ground - 4} s={1.1} />
      <Mushroom x={735} y={BANK.ground - 2} s={0.7} />
      {Array.from({length: 16}, (_, i) => (
        <Leaf key={`l${i}`} x={220 + i * 85 + hash1(i) * 40} y={BANK.ground - 2 - hash1(i * 3) * 6} s={0.8 + hash1(i * 5) * 0.6} rot={-10 + hash1(i * 7) * 20} c={autumn(['#8a6a2a', '#a8782a', '#6a5a24', '#9a4a1e'][i % 4], season)} t={t} />
      ))}
      <Fern x={980} base={BANK.ground} h={300} t={t} seed={8} c="#3a6a28" dir={-1} />
      {wide && <ForestWide t={t} season={season} />}
      {children}
      {/* gotas que caen y salpican */}
      {[0, 1].map((i) => {
        const per = 2.4 + i * 0.9;
        const ph = (((t + i * 1.3) / per) % 1 + 1) % 1;
        const x = 300 + i * 420;
        return (
          <g key={`d${i}`}>
            {ph < 0.8 && <path d={`M${x},${f1(-700 + ph * 870)} q3,6 0,9 q-3,-3 0,-9Z`} fill="#dff4ff" opacity={0.8} />}
            {ph >= 0.8 && <ellipse cx={x} cy={BANK.ground - 6} rx={6 + (ph - 0.8) * 90} ry={2 + (ph - 0.8) * 10} fill="none" stroke="#dff4ff" strokeWidth={1.4} opacity={1 - (ph - 0.8) * 5} />}
          </g>
        );
      })}
    </g>
    {/* hojas que caen (paso de las estaciones) */}
    {fall > 0.01 && (
      <g transform={layerT(cam, 0.95)} opacity={Math.min(1, fall * 1.5)}>
        {Array.from({length: 10}, (_, i) => {
          const per = 3.2 + hash1(i * 5) * 2.4;
          const ph = (((t + hash1(i) * per) / per) % 1 + 1) % 1;
          const x = cam.x * 0.95 - 520 + hash1(i * 9) * 1040 + Math.sin(t * 1.4 + i) * 40;
          const y = cam.y * 0.95 - 1000 + ph * 1900;
          return <Leaf key={i} x={x} y={y} s={0.55 + hash1(i * 3) * 0.4} rot={t * 90 * (i % 2 ? 1 : -1) + i * 40} c={autumn(['#a8782a', '#9a4a1e', '#c8902a'][i % 3], Math.max(season, 0.5))} />;
        })}
      </g>
    )}
    {/* insectos diminutos */}
    <g transform={layerT(cam, 0.9)}>
      {Array.from({length: 7}, (_, i) => (
        <circle key={i} cx={cam.x * 0.9 + Math.sin(t * (1.3 + i * 0.2) + i) * 160 + (i - 3) * 90} cy={cam.y * 0.9 - 200 + Math.cos(t * (1.7 + i * 0.3) + i) * 80} r={1.6} fill="#1a1408" />
      ))}
    </g>
    {light < 0.999 && <rect width={1080} height={1920} fill="#0a1626" opacity={(1 - light) * 0.5} />}
  </g>
);

export const ForestFront: React.FC<{cam: Cam; t: number}> = ({cam, t}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <defs>
      <SoftFilter id="forestFg" radius={11} />
    </defs>
    <g transform={layerT(cam, 1.5)} filter="url(#forestFg)" opacity={0.85}>
      <Fern x={cam.x * 1.5 - 700} base={420} h={620} t={t} seed={21} c="#14260e" dir={1} />
      <Fern x={cam.x * 1.5 + 760} base={460} h={560} t={t} seed={23} c="#122210" dir={-1} />
      {Array.from({length: 12}, (_, i) => (
        <circle key={i} cx={cam.x * 1.5 + ((hash1(i * 19) * 1800 + t * 14) % 1800) - 900} cy={cam.y * 1.5 + ((hash1(i * 23) * 2200 - t * 6) % 2200 + 2200) % 2200 - 1100} r={4 + hash1(i) * 6} fill="#ffe8b0" opacity={0.18} />
      ))}
    </g>
  </svg>
);

/** Continuación del bosque hacia la derecha (documental completo): suelo con textura, tronco caído,
 *  piedras húmedas, musgo, hongos, helechos y hojarasca. */
const ForestWide: React.FC<{t: number; season: number}> = ({t, season}) => (
  <g>
    {Array.from({length: 80}, (_, i) => {
      const x = 1400 + hash1(i * 3.7 + 100) * 2300;
      const y = BANK.ground + 14 + Math.pow(hash1(i * 5.3 + 100), 0.8) * 520;
      const r = 3 + hash1(i * 7.1 + 100) * 9;
      return <path key={`wp${i}`} d={`M${f1(x - r)},${f1(y)} q${f1(r * 0.3)},${f1(-r * 0.8)} ${f1(r)},${f1(-r * 0.7)} q${f1(r * 0.8)},${f1(r * 0.1)} ${f1(r)},${f1(r * 0.7)} q${f1(-r)},${f1(r * 0.4)} ${f1(-r * 2)},0Z`} fill={['#5a4a34', '#6a5a40', '#3e3020', '#7a6a4a'][i % 4]} opacity={0.85} />;
    })}
    {Array.from({length: 22}, (_, i) => (
      <Leaf key={`wg${i}`} x={1400 + hash1(i * 23 + 200) * 2300} y={BANK.ground + 40 + hash1(i * 29 + 200) * 480} s={0.7 + hash1(i * 31 + 200) * 0.7} rot={hash1(i * 37 + 200) * 360} c={autumn(['#7a5a24', '#94682a', '#5a4a20', '#8a3e1a'][i % 4], season)} />
    ))}
    {/* tronco caído cubierto de musgo (lejos, detrás del recorrido) */}
    <path d={`M2050,${BANK.ground - 6} C2200,-130 2700,-150 3050,-60 L3060,${BANK.ground - 4}Z`} fill="#3a2a1a" />
    <path d="M2080,-40 C2250,-128 2680,-146 3040,-66" stroke="#5a8a2a" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.85} />
    {Array.from({length: 9}, (_, i) => <path key={`bk${i}`} d={`M${2140 + i * 100},${-70 - Math.sin(i / 8 * Math.PI) * 50} l20,40`} stroke="#22180e" strokeWidth={3} opacity={0.6} />)}
    <Stone x={1900} y={BANK.ground + 4} w={190} h={52} seed={13} c="#525e4c" moss={0.6} />
    <Stone x={3300} y={BANK.ground + 4} w={240} h={64} seed={17} c="#4a564a" moss={0.5} />
    <Moss x={1650} y={BANK.ground - 2} w={220} seed={6} />
    <Moss x={2500} y={BANK.ground - 2} w={300} seed={8} />
    <Mushroom x={2150} y={BANK.ground - 4} s={0.9} />
    <Mushroom x={2210} y={BANK.ground - 2} s={0.6} />
    <Mushroom x={3120} y={BANK.ground - 4} s={1.2} />
    {Array.from({length: 22}, (_, i) => (
      <Leaf key={`wl${i}`} x={1520 + i * 92 + hash1(i + 50) * 40} y={BANK.ground - 2 - hash1(i * 3 + 50) * 6} s={0.8 + hash1(i * 5 + 50) * 0.6} rot={-10 + hash1(i * 7 + 50) * 20} c={autumn(['#8a6a2a', '#a8782a', '#6a5a24', '#9a4a1e'][i % 4], season)} t={t} />
    ))}
    <Fern x={1780} base={BANK.ground} h={280} t={t} seed={11} c="#3a6a28" dir={1} />
    <Fern x={2900} base={BANK.ground} h={340} t={t} seed={13} c="#36622a" dir={-1} />
    <Fern x={3500} base={BANK.ground} h={300} t={t} seed={15} c="#3a6a28" dir={1} />
  </g>
);
