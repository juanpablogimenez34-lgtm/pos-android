// ESCENARIOS DEL ÁRTICO Y DEL ATLÁNTICO NORTE (coordenadas de mundo; se dibujan dentro de SurfaceWorld o
// DeepOcean del episodio del cachalote, importados sin modificarlos):
//  · IceFloes / Icebergs: hielo marino flotando en la línea del agua y témpanos en el horizonte.
//  · IceCeiling: cara inferior del hielo vista desde abajo, con grietas por donde se filtra la luz.
//  · Seabed: fondo rocoso con sedimento, esponjas, anémonas, ofiuras y peces de aguas frías (bacalaos).
//  · ColdFish: cardumen de peces pequeños que nadan de forma independiente.
//  · Carcass: restos de un pez muerto sobre el fondo (alimento carroñero).
import React from 'react';
import {clamp, hash1} from '../../../engine/math';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export const IceFloes: React.FC<{t: number; x0: number; x1: number; n?: number}> = ({t, x0, x1, n = 9}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const w = 160 + hash1(i * 3) * 380;
      const x = x0 + hash1(i * 7) * (x1 - x0) + Math.sin(t * 0.2 + i) * 20;
      const bob = Math.sin(t * 0.9 + i * 1.7) * 4;
      const h = 18 + hash1(i * 5) * 22;
      return (
        <g key={i} transform={`translate(${f1(x)} ${f1(bob)})`}>
          <path d={`M${f1(-w / 2)},4 L${f1(-w / 2 + 20)},${f1(-h)} L${f1(w / 2 - 30)},${f1(-h - 6)} L${f1(w / 2)},4 L${f1(w / 2 - 20)},${f1(h * 1.6)} L${f1(-w / 2 + 30)},${f1(h * 1.4)}Z`} fill="#e8f4fa" stroke="#b8d4e4" strokeWidth={3} />
          <path d={`M${f1(-w / 2 + 20)},${f1(-h)} L${f1(w / 2 - 30)},${f1(-h - 6)} L${f1(w / 2 - 40)},${f1(-h + 6)} L${f1(-w / 2 + 30)},${f1(-h + 8)}Z`} fill="#ffffff" />
          <path d={`M${f1(-w / 2 + 30)},${f1(h * 1.4)} L${f1(w / 2 - 20)},${f1(h * 1.6)} L${f1(w / 3)},${f1(h * 3)} L${f1(-w / 3)},${f1(h * 2.8)}Z`} fill="#9fd0e8" opacity={0.55} />
        </g>
      );
    })}
  </g>
);

export const Icebergs: React.FC<{t: number; x: number; y: number; s?: number}> = ({t, x, y, s = 1}) => (
  <g transform={`translate(${f1(x)} ${f1(y + Math.sin(t * 0.3) * 2)}) scale(${s})`}>
    <path d="M-420,0 L-330,-120 L-250,-90 L-170,-230 L-60,-170 L20,-260 L120,-150 L230,-190 L330,-60 L420,0Z" fill="#dceef8" />
    <path d="M-170,-230 L-60,-170 L-90,0 L-250,0Z M20,-260 L120,-150 L80,0 L-20,0Z" fill="#b6d6ea" opacity={0.8} />
    <path d="M-420,0 L420,0 L300,90 L-300,80Z" fill="#7ab6d8" opacity={0.4} />
  </g>
);

/** Cara inferior del hielo (y = 0 es la base del hielo); la luz entra por las grietas. */
export const IceCeiling: React.FC<{t: number; x0: number; x1: number}> = ({t, x0, x1}) => {
  const segs = 22;
  const w = (x1 - x0) / segs;
  const pts = Array.from({length: segs + 1}, (_, i) => ({x: x0 + i * w, y: 30 + Math.sin(i * 1.7) * 40 + hash1(i * 3) * 50}));
  const under = `M${f1(x0)},-600 ${pts.map((p) => `L${f1(p.x)},${f1(p.y)}`).join(' ')} L${f1(x1)},-600Z`;
  return (
    <g>
      <defs>
        <linearGradient id="iceU" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfe8f2" />
          <stop offset="0.7" stopColor="#7fb2c8" />
          <stop offset="1" stopColor="#4a8aa6" />
        </linearGradient>
        <linearGradient id="iceRay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e4f6ff" stopOpacity={0.5} />
          <stop offset="1" stopColor="#e4f6ff" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* haces de luz desde las grietas */}
      {[0.18, 0.42, 0.63, 0.86].map((u, i) => {
        const cx = x0 + (x1 - x0) * u;
        return <path key={i} d={`M${f1(cx - 30)},40 L${f1(cx - 260)},1900 L${f1(cx + 220)},1900 L${f1(cx + 30)},40Z`} fill="url(#iceRay)" opacity={0.35 + 0.25 * Math.sin(t * 0.6 + i * 2)} />;
      })}
      <path d={under} fill="url(#iceU)" />
      {/* textura de la base: bolsas y estrías */}
      {Array.from({length: 26}, (_, i) => {
        const p = pts[i % segs];
        return <ellipse key={i} cx={p.x + hash1(i) * w} cy={p.y - 16 - hash1(i * 2) * 50} rx={20 + hash1(i * 3) * 40} ry={6 + hash1(i * 4) * 8} fill="#e8f6fc" opacity={0.35} />;
      })}
      {[0.18, 0.42, 0.63, 0.86].map((u, i) => {
        const cx = x0 + (x1 - x0) * u;
        return <path key={`c${i}`} d={`M${f1(cx - 26)},-600 L${f1(cx - 18)},60 L${f1(cx + 18)},60 L${f1(cx + 26)},-600Z`} fill="#f4fcff" opacity={0.85} />;
      })}
    </g>
  );
};

const Anemone: React.FC<{x: number; y: number; s: number; t: number; c: string}> = ({x, y, s, t, c}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) scale(${s})`}>
    <path d="M-14,0 Q-16,-40 -10,-60 L10,-60 Q16,-40 14,0Z" fill={c} opacity={0.9} />
    {Array.from({length: 9}, (_, i) => {
      const a = -Math.PI / 2 + (i - 4) * 0.28 + Math.sin(t * 1.2 + i) * 0.08;
      return <path key={i} d={`M0,-58 q${f1(Math.cos(a) * 18)},${f1(Math.sin(a) * 18)} ${f1(Math.cos(a) * 34)},${f1(Math.sin(a) * 34 + 6)}`} stroke={c} strokeWidth={5} fill="none" strokeLinecap="round" />;
    })}
  </g>
);
const BrittleStar: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) scale(${s} ${s * 0.4})`}>
    <circle r={10} fill="#c89a7a" />
    {Array.from({length: 5}, (_, i) => {
      const a = (i / 5) * Math.PI * 2 + Math.sin(t * 0.7 + i) * 0.1;
      return <path key={i} d={`M0,0 q${f1(Math.cos(a + 0.4) * 30)},${f1(Math.sin(a + 0.4) * 30)} ${f1(Math.cos(a) * 60)},${f1(Math.sin(a) * 60)}`} stroke="#b88a6a" strokeWidth={4} fill="none" strokeLinecap="round" />;
    })}
  </g>
);
const Sponge: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) scale(${s})`}>
    <path d="M-30,0 Q-40,-60 -18,-110 Q0,-120 16,-108 Q40,-60 30,0Z" fill="#d8c8a0" opacity={0.85} />
    <ellipse cx={0} cy={-108} rx={16} ry={6} fill="#6a5a40" />
    {Array.from({length: 8}, (_, i) => <circle key={i} cx={-16 + hash1(i) * 32} cy={-20 - hash1(i * 3) * 80} r={3} fill="#a8986a" />)}
  </g>
);

export const ColdFish: React.FC<{t: number; cx: number; cy: number; n?: number; spread?: number; s?: number; tone?: number; dir?: 1 | -1}> = ({t, cx, cy, n = 12, spread = 260, s = 1, tone = 0, dir = 1}) => (
  <g opacity={1 - tone * 0.5}>
    {Array.from({length: n}, (_, i) => {
      const a = i * 2.39996 + t * 0.15;
      const r = spread * (0.3 + (i % 5) * 0.16);
      const x = cx + Math.cos(a) * r * 1.4 + dir * t * 18;
      const y = cy + Math.sin(a * 1.3) * r * 0.5;
      const tb = Math.sin(t * 9 + i * 1.3) * 5;
      const sc = s * (0.8 + (i % 3) * 0.15);
      return (
        <g key={i} transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(sc * dir)} ${f1(sc)})`}>
          <path d={`M-30,0 L-44,${f1(-12 + tb)} L-42,${f1(12 + tb)}Z`} fill="#6a7a70" />
          <path d="M28,0 Q14,-14 -10,-12 Q-28,-8 -32,0 Q-28,8 -10,12 Q14,14 28,0Z" fill="#8a9a88" stroke="#3a4a40" strokeWidth={1.5} />
          <path d="M-6,-12 l8,-8 l6,8Z" fill="#6a7a70" />
          <circle cx={18} cy={-3} r={2.5} fill="#101410" />
          <path d="M-26,0 L22,2" stroke="#c8d0c0" strokeWidth={1.5} opacity={0.5} />
        </g>
      );
    })}
  </g>
);

/** Fondo rocoso entre x0 y x1 (base en y). */
export const Seabed: React.FC<{t: number; x0: number; x1: number; y: number; tone?: number}> = ({t, x0, x1, y, tone = 0}) => {
  const n = 18;
  const w = (x1 - x0) / n;
  const far = Array.from({length: n + 1}, (_, i) => `L${f1(x0 + i * w)},${f1(y - 120 - hash1(i * 5) * 160)}`).join(' ');
  const near = Array.from({length: n + 1}, (_, i) => `L${f1(x0 + i * w)},${f1(y - 20 - hash1(i * 9) * 70)}`).join(' ');
  return (
    <g opacity={1 - tone * 0.4}>
      <defs>
        <linearGradient id="sbG" gradientUnits="userSpaceOnUse" x1="0" y1={y - 60} x2="0" y2={y + 700}>
          <stop offset="0" stopColor="#4a5650" />
          <stop offset="0.25" stopColor="#2e3a38" />
          <stop offset="1" stopColor="#0a1418" />
        </linearGradient>
        <linearGradient id="sbF" gradientUnits="userSpaceOnUse" x1="0" y1={y - 300} x2="0" y2={y + 200}>
          <stop offset="0" stopColor="#1e3a44" stopOpacity={0.9} />
          <stop offset="1" stopColor="#0c1c22" stopOpacity={0.9} />
        </linearGradient>
      </defs>
      <path d={`M${f1(x0)},${f1(y + 900)} ${far} L${f1(x1)},${f1(y + 900)}Z`} fill="url(#sbF)" />
      <path d={`M${f1(x0)},${f1(y + 900)} ${near} L${f1(x1)},${f1(y + 900)}Z`} fill="url(#sbG)" />
      {Array.from({length: 14}, (_, i) => <path key={`rp${i}`} d={`M${f1(x0 + hash1(i * 37) * (x1 - x0))},${f1(y + 70 + i * 34)} q60,-8 120,0 t120,0`} stroke="#5a6660" strokeWidth={2} fill="none" opacity={0.35 * (1 - i / 14)} />)}
      {Array.from({length: 16}, (_, i) => {
        const x = x0 + hash1(i * 11) * (x1 - x0);
        const r = 40 + hash1(i * 13) * 110;
        return <path key={`r${i}`} d={`M${f1(x - r)},${f1(y + 40)} Q${f1(x - r * 0.8)},${f1(y - r * 0.7)} ${f1(x)},${f1(y - r * 0.8)} Q${f1(x + r * 0.9)},${f1(y - r * 0.5)} ${f1(x + r)},${f1(y + 40)}Z`} fill={i % 2 ? '#5a625c' : '#4a524c'} stroke="#2a302c" strokeWidth={3} />;
      })}
      {Array.from({length: 40}, (_, i) => <circle key={`s${i}`} cx={x0 + hash1(i * 17) * (x1 - x0)} cy={y + 40 + hash1(i * 19) * 60} r={2 + hash1(i) * 3} fill="#6a7068" opacity={0.6} />)}
      {Array.from({length: 7}, (_, i) => <Anemone key={`a${i}`} x={x0 + hash1(i * 23) * (x1 - x0)} y={y + 36} s={0.8 + hash1(i * 3) * 0.6} t={t} c={i % 2 ? '#e88a7a' : '#f0d0b0'} />)}
      {Array.from({length: 5}, (_, i) => <Sponge key={`p${i}`} x={x0 + hash1(i * 29) * (x1 - x0)} y={y + 40} s={0.7 + hash1(i * 5) * 0.6} />)}
      {Array.from({length: 6}, (_, i) => <BrittleStar key={`b${i}`} x={x0 + hash1(i * 31) * (x1 - x0)} y={y + 50 + hash1(i) * 30} s={0.8} t={t} />)}
    </g>
  );
};

export const Carcass: React.FC<{x: number; y: number; s?: number; eaten?: number}> = ({x, y, s = 1, eaten = 0}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) scale(${s})`}>
    <path d="M-150,0 Q-140,-46 -40,-50 Q80,-52 150,-12 Q160,0 150,10 Q80,30 -40,26 Q-140,26 -150,0Z" fill="#9aa098" stroke="#4a504a" strokeWidth={3} />
    <path d="M-150,0 L-200,-36 L-196,30Z" fill="#8a9088" />
    {eaten > 0.01 && <path d={`M${f1(60 - eaten * 60)},-46 Q${f1(90 - eaten * 40)},${f1(-10)} ${f1(70 - eaten * 50)},24 L150,10 L150,-12Z`} fill="#c87a6a" opacity={clamp(eaten * 2)} />}
    {Array.from({length: 10}, (_, i) => <path key={i} d={`M${f1(-110 + i * 22)},-40 l4,60`} stroke="#6a706a" strokeWidth={2} opacity={0.5} />)}
    <circle cx={110} cy={-14} r={7} fill="#2a2e2a" />
  </g>
);
