// BOSQUE ENCANTADO (2.5D, parallax multicapa). Cielo con sol/luna/estrellas y nubes · colinas y
// árboles lejanos con atmósfera · árboles grandes con troncos y copas que se mecen · suelo con
// sendero y claro de baile · hierba, flores, arbustos, rosales, hongos · tronco caído · primer
// plano · vida: pájaros con alas articuladas, mariposas, hojas que caen, rayos de sol y
// luciérnagas de noche (laten con el pulso). Los colores salen del ciclo día-noche.
import React from 'react';
import {clamp, hash1, mixColor} from '../../../engine/math';
import {Cam, layerT} from '../Camera/cam';
import {DN, haze, tint} from '../DayNight/dayNight';
import {f1, furCircle, smooth, V} from '../Rigging/core';

export const SPAN = [-2600, 5200]; // extensión del bosque en el mundo
export const LOG_X = 1250; // tronco caído (salto)
export const ROSE_X = 520; // rosal (escondite)
export const CLEARING = [1900, 2900]; // claro de baile
export const HILL_X = 3500; // colina (noche)
export const DEN_X = 4300; // refugio

// ---------------------------------------------------------------- cielo
export const Sky: React.FC<{cam: Cam; dn: DN; t: number}> = ({cam, dn, t}) => (
  <g>
    <defs>
      <linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={dn.top} />
        <stop offset="0.55" stopColor={dn.mid} />
        <stop offset="1" stopColor={dn.bottom} />
      </linearGradient>
      <radialGradient id="fsun" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={dn.sun} stopOpacity={0.95} />
        <stop offset="0.25" stopColor={dn.sun} stopOpacity={0.5} />
        <stop offset="1" stopColor={dn.sun} stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#fsky)" />
    <g transform={layerT(cam, 0.04)}>
      {dn.stars > 0.01 &&
        Array.from({length: 120}, (_, i) => {
          const tw = 0.5 + 0.5 * Math.sin(t * (1 + hash1(i) * 2) + i);
          return <circle key={i} cx={-2400 + hash1(i * 3.1) * 4800} cy={-2400 + hash1(i * 5.7) * 1800} r={1.2 + hash1(i * 7) * 2.4} fill="#ffffff" opacity={dn.stars * (0.35 + 0.6 * tw)} />;
        })}
      {/* sol que baja y luna que sube */}
      {dn.sunUp > 0.01 && (
        <g transform={`translate(${f1(-200 + dn.tod * 260)} ${f1(-1500 + dn.tod * 380)})`} opacity={dn.sunUp}>
          <circle r={420} fill="url(#fsun)" />
          <circle r={90} fill={dn.sun} />
        </g>
      )}
      {dn.moonUp > 0.01 && (
        <g transform={`translate(420 ${f1(-1100 - dn.moonUp * 450)})`} opacity={dn.moonUp}>
          <circle r={300} fill="#d8d8ff" opacity={0.12} />
          <circle r={95} fill="#f6f2dc" />
          <circle cx={-26} cy={-18} r={16} fill="#e6dfc0" />
          <circle cx={22} cy={24} r={11} fill="#e6dfc0" />
          <circle cx={34} cy={-26} r={7} fill="#e6dfc0" />
        </g>
      )}
      {Array.from({length: 6}, (_, i) => (
        <g key={i} transform={`translate(${f1(-1800 + hash1(i * 9) * 3600 + t * 6 * (1 + i * 0.2))} ${f1(-1900 + hash1(i * 4) * 600)}) scale(${f1(1 + hash1(i) * 1.2)})`} opacity={0.85 - dn.night * 0.6}>
          <ellipse rx={150} ry={42} fill={mixColor('#ffffff', dn.mid, 0.25)} />
          <ellipse cx={-50} cy={-24} rx={80} ry={50} fill={mixColor('#ffffff', dn.mid, 0.2)} />
          <ellipse cx={52} cy={-18} rx={70} ry={40} fill={mixColor('#ffffff', dn.mid, 0.2)} />
        </g>
      ))}
    </g>
  </g>
);

// ---------------------------------------------------------------- árboles
const Tree: React.FC<{x: number; s: number; seed: number; dn: DN; t: number; depthK: number; detail: boolean}> = ({x, s, seed, dn, t, depthK, detail}) => {
  const trunk = haze('#7a5234', dn, depthK);
  const bark = haze('#5a3a22', dn, depthK);
  const greens = ['#3f9a52', '#55b45e', '#2f7d48', '#6cc56a'].map((c) => haze(c, dn, depthK));
  const sway = Math.sin(t * 0.8 + seed) * 4 * s;
  const H = 700 * s;
  const blobs = Array.from({length: 9}, (_, i) => {
    const a = (i / 9) * Math.PI * 2 + seed;
    const r = (120 + hash1(seed + i) * 80) * s;
    return {x: Math.cos(a) * 150 * s + sway * (i % 3), y: -H + Math.sin(a) * 110 * s, r, c: greens[i % 4]};
  });
  return (
    <g transform={`translate(${f1(x)} 0)`}>
      <path d={`M${-34 * s},0 Q${-26 * s},${-H * 0.5} ${-22 * s + sway * 0.3},${-H * 0.85} L${22 * s + sway * 0.3},${-H * 0.85} Q${26 * s},${-H * 0.5} ${38 * s},0Z`} fill={trunk} />
      {detail && <path d={`M${-10 * s},${-40 * s} q${8 * s},${-120 * s} ${-2 * s},${-260 * s} M${12 * s},${-80 * s} q${-6 * s},${-90 * s} ${4 * s},${-220 * s}`} stroke={bark} strokeWidth={5 * s} fill="none" strokeLinecap="round" />}
      {detail && <path d={`M${-44 * s},0 q${-30 * s},${-6 * s} ${-50 * s},${10 * s} M${44 * s},0 q${30 * s},${-6 * s} ${54 * s},${10 * s}`} stroke={trunk} strokeWidth={14 * s} strokeLinecap="round" />}
      {blobs.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={b.c} />
      ))}
      <circle cx={sway} cy={-H} r={150 * s} fill={greens[1]} />
      {detail &&
        blobs.slice(0, 5).map((b, i) => <path key={`h${i}`} d={`M${f1(b.x - b.r * 0.5)},${f1(b.y - b.r * 0.4)} A${f1(b.r * 0.7)},${f1(b.r * 0.7)} 0 0 1 ${f1(b.x + b.r * 0.2)},${f1(b.y - b.r * 0.7)}`} stroke={mixColor(greens[3], dn.light, 0.5)} strokeWidth={10 * s} fill="none" opacity={0.6} strokeLinecap="round" />)}
      {detail &&
        Array.from({length: 10}, (_, i) => (
          <ellipse key={`l${i}`} cx={-170 * s + hash1(seed * 3 + i) * 340 * s + sway} cy={-H - 140 * s + hash1(seed * 5 + i) * 260 * s} rx={10 * s} ry={6 * s} fill={mixColor(greens[3], '#ffffff', 0.25)} opacity={0.7} transform={`rotate(${f1(hash1(i) * 180)})`} />
        ))}
    </g>
  );
};

// ---------------------------------------------------------------- flores, rosal, hongos, arbustos
export const Flower: React.FC<{x: number; y: number; s: number; c: string; t: number; seed: number; dn: DN; open?: number}> = ({x, y, s, c, t, seed, dn, open = 1}) => {
  const sway = Math.sin(t * 1.6 + seed) * 6;
  const pc = tint(c, dn, 0.4);
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s)})`}>
      <path d={`M0,0 Q${f1(sway * 0.3)},-25 ${f1(sway)},-50`} stroke={tint('#3f9a52', dn, 0.4)} strokeWidth={4} fill="none" />
      <ellipse cx={sway * 0.4 + 6} cy={-22} rx={9} ry={4} fill={tint('#55b45e', dn, 0.4)} transform={`rotate(-30 ${f1(sway * 0.4 + 6)} -22)`} />
      <g transform={`translate(${f1(sway)} -52) scale(${f1(0.4 + 0.6 * open)})`}>
        {Array.from({length: 6}, (_, i) => (
          <ellipse key={i} cx={Math.cos((i / 6) * Math.PI * 2) * 9} cy={Math.sin((i / 6) * Math.PI * 2) * 9} rx={8} ry={6} fill={pc} transform={`rotate(${(i / 6) * 360} ${f1(Math.cos((i / 6) * Math.PI * 2) * 9)} ${f1(Math.sin((i / 6) * Math.PI * 2) * 9)})`} />
        ))}
        <circle r={6} fill={tint('#ffd23f', dn, 0.4)} />
      </g>
    </g>
  );
};

export const RoseBush: React.FC<{x: number; s: number; dn: DN; t: number; shake?: number}> = ({x, s, dn, t, shake = 0}) => {
  const g = ['#2f7d48', '#3f9a52', '#4aa858'].map((c) => tint(c, dn, 0.3));
  const sh = Math.sin(t * 30) * shake * 6;
  return (
    <g transform={`translate(${f1(x + sh)} 0) scale(${f1(s)})`}>
      {[[-120, -70, 90], [-40, -120, 110], [70, -100, 100], [130, -50, 70], [-10, -40, 120]].map(([cx, cy, r], i) => (
        <path key={i} d={furCircle(V(cx, cy), r, 22, 0.08, i)} fill={g[i % 3]} />
      ))}
      {Array.from({length: 9}, (_, i) => {
        const rx = -130 + hash1(i * 4) * 270;
        const ry = -170 + hash1(i * 6) * 140;
        return (
          <g key={`r${i}`} transform={`translate(${f1(rx)} ${f1(ry)})`}>
            <circle r={15} fill={tint('#e8465c', dn, 0.4)} />
            <path d="M-8,-2 q8,-10 16,0 q-8,8 -16,0 M-4,4 q4,-6 8,0" stroke={tint('#a82a3c', dn, 0.4)} strokeWidth={2.5} fill="none" />
          </g>
        );
      })}
      {Array.from({length: 7}, (_, i) => (
        <ellipse key={`l${i}`} cx={-120 + i * 40} cy={-150 + (i % 2) * 40} rx={12} ry={6} fill={mixColor(g[2], dn.light, 0.35)} opacity={0.6} />
      ))}
    </g>
  );
};

export const Mushroom: React.FC<{x: number; s: number; c: string; dn: DN; glow?: number}> = ({x, s, c, dn, glow = 0}) => (
  <g transform={`translate(${f1(x)} 0) scale(${f1(s)})`}>
    {glow > 0.01 && <circle cx={0} cy={-40} r={60} fill={c} opacity={0.18 * glow} />}
    <path d="M-10,0 Q-12,-24 -8,-38 L8,-38 Q12,-24 10,0Z" fill={tint('#f4ead2', dn, 0.35)} stroke={tint('#8a6a4a', dn, 0.3)} strokeWidth={2} />
    <path d="M-36,-34 Q-30,-74 0,-76 Q30,-74 36,-34 Q0,-26 -36,-34Z" fill={mixColor(tint(c, dn, 0.35), c, glow * 0.6)} stroke={tint('#6a2a2a', dn, 0.3)} strokeWidth={2.5} />
    {[[-16, -54], [8, -62], [20, -44]].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r={5} fill="#ffffff" opacity={0.85} />
    ))}
  </g>
);

const Bush: React.FC<{x: number; s: number; dn: DN; seed: number; depthK?: number}> = ({x, s, dn, seed, depthK = 0}) => (
  <g transform={`translate(${f1(x)} 0) scale(${f1(s)})`}>
    {[[-60, -40, 60], [0, -70, 75], [60, -40, 58]].map(([cx, cy, r], i) => (
      <path key={i} d={furCircle(V(cx, cy), r, 18, 0.08, seed + i)} fill={haze(['#3f9a52', '#55b45e', '#2f7d48'][(i + seed) % 3], dn, depthK)} />
    ))}
  </g>
);

/** Tronco caído (para el salto). */
export const Log: React.FC<{x: number; dn: DN}> = ({x, dn}) => (
  <g transform={`translate(${x} 0)`}>
    <ellipse cx={0} cy={4} rx={150} ry={16} fill="#1a1030" opacity={0.22} />
    <path d="M-140,-6 Q-140,-62 -110,-62 L120,-62 Q120,-6 120,-6Z" fill={tint('#8a5a34', dn, 0.3)} stroke={tint('#4a2a14', dn, 0.3)} strokeWidth={4} />
    <ellipse cx={120} cy={-34} rx={18} ry={28} fill={tint('#c99a64', dn, 0.3)} stroke={tint('#4a2a14', dn, 0.3)} strokeWidth={4} />
    <ellipse cx={120} cy={-34} rx={9} ry={15} fill="none" stroke={tint('#8a5a34', dn, 0.3)} strokeWidth={2.5} />
    <path d="M-110,-44 L90,-44 M-90,-24 L70,-24" stroke={tint('#5a3a1e', dn, 0.3)} strokeWidth={3} strokeDasharray="30 14" />
    <path d="M-60,-62 q-6,-22 8,-30 q4,16 -8,30" fill={tint('#55b45e', dn, 0.3)} />
    <Mushroom x={-90} s={0.4} c="#e8465c" dn={dn} />
  </g>
);

// ---------------------------------------------------------------- vida del bosque
/** Pájaro con alas articuladas (dos segmentos por ala), pico que se abre al cantar. */
export const Bird: React.FC<{x: number; y: number; s: number; t: number; seed: number; fly: number; sing: number; c?: string; facing?: 1 | -1; dn: DN}> = ({x, y, s, t, seed, fly, sing, c = '#5db8ff', facing = 1, dn}) => {
  const flap = fly > 0 ? Math.sin(t * 22 + seed) : 0;
  const w1 = fly > 0 ? -0.9 * flap : 0.35;
  const w2 = fly > 0 ? -0.6 * flap + 0.3 : 0.2;
  const hop = fly > 0 ? 0 : Math.max(0, Math.sin(t * 3 + seed)) * 3;
  const bc = tint(c, dn, 0.4);
  const beak = sing > 0 ? Math.max(0, Math.sin(t * 14 + seed)) * 0.5 * sing : 0;
  const wing = (k: number) => {
    const sh = V(-2, -18);
    const e1 = V(sh.x - Math.cos(w1 * k) * 22, sh.y + Math.sin(w1 * k) * 22 * k);
    const e2 = V(e1.x - Math.cos(w1 + w2) * 18, e1.y + Math.sin((w1 + w2) * k) * 18 * k);
    return `M${f1(sh.x)},${f1(sh.y)} Q${f1(e1.x)},${f1(e1.y - 6)} ${f1(e2.x)},${f1(e2.y)} Q${f1(e1.x + 4)},${f1(e1.y + 6)} ${f1(sh.x + 8)},${f1(sh.y + 6)}Z`;
  };
  return (
    <g transform={`translate(${f1(x)} ${f1(y - hop)}) scale(${f1(s * facing)} ${f1(s)})`}>
      <path d={wing(-1)} fill={mixColor(bc, '#1a1030', 0.25)} />
      <ellipse cx={0} cy={-16} rx={18} ry={14} fill={bc} stroke="#2a2440" strokeWidth={2.5} />
      <ellipse cx={4} cy={-11} rx={10} ry={8} fill={tint('#fff2c8', dn, 0.4)} />
      <path d="M-16,-18 L-30,-24 L-28,-12Z" fill={mixColor(bc, '#1a1030', 0.3)} />
      <circle cx={10} cy={-28} r={10} fill={bc} stroke="#2a2440" strokeWidth={2.5} />
      <circle cx={13} cy={-30} r={3} fill="#1a1020" />
      <circle cx={14} cy={-31} r={1} fill="#ffffff" />
      <path d={`M19,-29 L28,${f1(-27 - beak * 6)} L19,-26Z`} fill="#ffb03a" />
      <path d={`M19,-26 L27,${f1(-25 + beak * 6)} L19,-24Z`} fill="#e8902a" />
      <path d={wing(1)} fill={mixColor(bc, '#ffffff', 0.15)} stroke="#2a2440" strokeWidth={2} />
      {fly <= 0 && <path d="M-2,-2 l-2,6 M4,-2 l2,6" stroke="#ffb03a" strokeWidth={2} />}
      {sing > 0.3 && Math.sin(t * 3 + seed) > 0 && <text x={30} y={-46 - ((t * 30 + seed) % 20)} fontSize={18} fill="#ffffff" opacity={0.8}>♪</text>}
    </g>
  );
};

export const Butterfly: React.FC<{x: number; y: number; s: number; t: number; seed: number; c?: string}> = ({x, y, s, t, seed, c = '#ff9ad5'}) => {
  const f = 0.25 + 0.75 * Math.abs(Math.sin(t * 16 + seed));
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s)}) rotate(${f1(Math.sin(t * 2 + seed) * 15)})`}>
      <g transform={`scale(${f1(f)} 1)`}>
        <path d="M0,0 C-26,-30 -40,-6 -20,6 C-34,20 -10,28 0,6Z" fill={c} stroke="#4a2a5a" strokeWidth={2} />
        <path d="M0,0 C26,-30 40,-6 20,6 C34,20 10,28 0,6Z" fill={c} stroke="#4a2a5a" strokeWidth={2} />
        <circle cx={-16} cy={-8} r={4} fill="#ffffff" opacity={0.7} />
        <circle cx={16} cy={-8} r={4} fill="#ffffff" opacity={0.7} />
      </g>
      <rect x={-2} y={-8} width={4} height={18} rx={2} fill="#4a2a5a" />
      <path d="M-1,-8 q-6,-10 -8,-14 M1,-8 q6,-10 8,-14" stroke="#4a2a5a" strokeWidth={1.5} fill="none" />
    </g>
  );
};

/** Luciérnagas: brillo que late con el pulso de la canción. */
export const Fireflies: React.FC<{t: number; n: number; k: number; pulse: number; x0: number; x1: number; y0: number; y1: number; seed?: number}> = ({t, n, k, pulse, x0, x1, y0, y1, seed = 0}) =>
  k > 0.01 ? (
    <g>
      {Array.from({length: n}, (_, i) => {
        const x = x0 + hash1(i * 3 + seed) * (x1 - x0) + Math.sin(t * (0.6 + hash1(i) * 0.6) + i) * 40;
        const y = y0 + hash1(i * 7 + seed) * (y1 - y0) + Math.cos(t * (0.5 + hash1(i * 2) * 0.5) + i) * 30;
        const on = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2 + i * 1.7)) + 0.6 * pulse * (i % 3 === 0 ? 1 : 0.4);
        return (
          <g key={i} opacity={k * clamp(on)}>
            <circle cx={x} cy={y} r={16} fill="#fff59a" opacity={0.25} />
            <circle cx={x} cy={y} r={4.5} fill="#fffbd0" />
          </g>
        );
      })}
    </g>
  ) : null;

// ---------------------------------------------------------------- composición del bosque
/** Fondo (cielo + colinas + árboles lejanos y medios). */
export const ForestBack: React.FC<{cam: Cam; dn: DN; t: number}> = ({cam, dn, t}) => (
  <g>
    <Sky cam={cam} dn={dn} t={t} />
    <g transform={layerT(cam, 0.18)}>
      <path d={`M-4000,-120 ${Array.from({length: 18}, (_, i) => `Q${-3800 + i * 480},${-420 - hash1(i) * 260} ${-3560 + i * 480},-160`).join(' ')} L5000,600 L-4000,600Z`} fill={haze('#5a9a6a', dn, 0.6)} />
    </g>
    <g transform={layerT(cam, 0.32)}>
      {Array.from({length: 16}, (_, i) => (
        <Tree key={i} x={-3200 + i * 520 + hash1(i * 3) * 200} s={0.55 + hash1(i) * 0.25} seed={i * 7} dn={dn} t={t} depthK={0.55} detail={false} />
      ))}
      <rect x={-4000} y={0} width={10000} height={700} fill={haze('#4f9a58', dn, 0.5)} />
    </g>
    <g transform={layerT(cam, 0.58)}>
      {Array.from({length: 14}, (_, i) => (
        <Tree key={i} x={-2600 + i * 640 + hash1(i * 5) * 220} s={0.85 + hash1(i * 2) * 0.3} seed={i * 11 + 3} dn={dn} t={t} depthK={0.28} detail />
      ))}
      {Array.from({length: 18}, (_, i) => (
        <Bush key={`b${i}`} x={-2600 + i * 460 + hash1(i * 9) * 150} s={0.9 + hash1(i) * 0.5} dn={dn} seed={i} depthK={0.25} />
      ))}
      <rect x={-4000} y={0} width={10000} height={900} fill={haze('#5aa860', dn, 0.22)} />
    </g>
  </g>
);

/** Suelo en el plano de los personajes: sendero, claro, hierba, flores, hongos, rosal y tronco. */
export const ForestGround: React.FC<{cam: Cam; dn: DN; t: number; roseShake?: number; flowersOpen?: number; children?: React.ReactNode; front?: React.ReactNode; mushroomGlow?: number}> = ({cam, dn, t, roseShake = 0, flowersOpen = 1, children, front, mushroomGlow = 0}) => {
  const grass = tint('#6cc56a', dn, 0.35);
  const grassD = tint('#4aa858', dn, 0.35);
  const path = tint('#e8c890', dn, 0.35);
  const flowersC = ['#ff7ab0', '#ffd23f', '#c38aff', '#ffffff', '#ff9a6a', '#7fd0ff'];
  return (
    <g transform={layerT(cam, 1)}>
      <rect x={SPAN[0] - 2000} y={-10} width={12000} height={1400} fill={grass} />
      <path d={smooth([V(SPAN[0] - 2000, 40), V(0, 26), V(1500, 50), V(CLEARING[0], 30), V(CLEARING[1], 40), V(DEN_X + 600, 30), V(SPAN[1] + 2000, 40)])} stroke={path} strokeWidth={120} fill="none" strokeLinecap="round" />
      <ellipse cx={(CLEARING[0] + CLEARING[1]) / 2} cy={70} rx={(CLEARING[1] - CLEARING[0]) / 2} ry={110} fill={tint('#8ad27a', dn, 0.35)} opacity={0.8} />
      {Array.from({length: 26}, (_, i) => (
        <circle key={`p${i}`} cx={SPAN[0] + hash1(i * 13) * (SPAN[1] - SPAN[0])} cy={30 + hash1(i * 17) * 30} r={6 + hash1(i) * 6} fill={tint('#c9a870', dn, 0.35)} opacity={0.6} />
      ))}
      <g transform={`translate(${HILL_X} 0)`}>
        <path d="M-420,0 Q-200,-170 0,-180 Q220,-170 420,0Z" fill={tint('#5aa860', dn, 0.35)} />
        <path d="M-300,-60 Q-100,-150 120,-150" stroke={tint('#8ad27a', dn, 0.35)} strokeWidth={12} fill="none" opacity={0.6} strokeLinecap="round" />
      </g>
      <g transform={`translate(${DEN_X} 0)`}>
        <path d="M-260,0 Q-260,-280 0,-300 Q260,-280 260,0Z" fill={tint('#6a4a2e', dn, 0.35)} stroke={tint('#3a2414', dn, 0.35)} strokeWidth={6} />
        <path d="M-170,0 Q-170,-190 0,-200 Q170,-190 170,0Z" fill={tint('#2a1a10', dn, 0.4)} />
        <ellipse cx={0} cy={-4} rx={150} ry={30} fill={tint('#d98a3a', dn, 0.3)} />
        {Array.from({length: 12}, (_, i) => (
          <ellipse key={i} cx={-130 + i * 24} cy={-10 - (i % 3) * 5} rx={16} ry={7} fill={tint(['#e8a040', '#d9702a', '#f2c060'][i % 3], dn, 0.3)} transform={`rotate(${(i * 37) % 60 - 30} ${-130 + i * 24} ${-10 - (i % 3) * 5})`} />
        ))}
        {Array.from({length: 8}, (_, i) => (
          <path key={`m${i}`} d={furCircle(V(-200 + i * 56, -290 + Math.abs(i - 3.5) * 22), 40, 12, 0.1, i)} fill={tint(['#3f9a52', '#55b45e'][i % 2], dn, 0.35)} />
        ))}
      </g>
      <RoseBush x={ROSE_X} s={1} dn={dn} t={t} shake={roseShake} />
      <Log x={LOG_X} dn={dn} />
      {[[-900, 0.9, '#e8465c'], [300, 0.7, '#ff9a3c'], [1600, 0.8, '#c38aff'], [2700, 1, '#e8465c'], [3150, 0.7, '#5db8ff'], [3900, 0.8, '#ff9a3c']].map(([x, s, c], i) => (
        <Mushroom key={`mu${i}`} x={x as number} s={s as number} c={c as string} dn={dn} glow={mushroomGlow} />
      ))}
      {Array.from({length: 60}, (_, i) => {
        const x = SPAN[0] + hash1(i * 3.3) * (SPAN[1] - SPAN[0]);
        if (Math.abs(x - ROSE_X) < 150 || Math.abs(x - LOG_X) < 160) return null;
        return <Flower key={`f${i}`} x={x} y={-2 + hash1(i * 5) * 20} s={0.8 + hash1(i) * 0.6} c={flowersC[i % 6]} t={t} seed={i} dn={dn} open={flowersOpen} />;
      })}
      {Array.from({length: 120}, (_, i) => {
        const x = SPAN[0] + hash1(i * 7.1) * (SPAN[1] - SPAN[0]);
        const h = 20 + hash1(i * 2) * 26;
        const sw = Math.sin(t * 2 + x * 0.01) * 6;
        return <path key={`g${i}`} d={`M${f1(x)},6 q${f1(sw * 0.4 - 4)},${f1(-h * 0.5)} ${f1(sw - 2)},${f1(-h)} M${f1(x + 6)},6 q${f1(sw * 0.4 + 4)},${f1(-h * 0.4)} ${f1(sw + 8)},${f1(-h * 0.8)}`} stroke={i % 2 ? grassD : grass} strokeWidth={4} fill="none" strokeLinecap="round" />;
      })}
      {children}
      {front}
    </g>
  );
};

/** Primer plano (más cerca de la cámara) y luz: rayos de sol, hojas que caen, tinte ambiental. */
export const ForestFront: React.FC<{cam: Cam; dn: DN; t: number; leaves?: number; rays?: number; fg?: number}> = ({cam, dn, t, leaves = 1, rays = 1, fg = 1}) => (
  <g>
    {rays > 0.01 && dn.sunUp > 0.05 && (
      <g transform={layerT(cam, 0.7)} opacity={rays * dn.sunUp * (1 - dn.night)}>
        <defs>
          <linearGradient id="fray" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor={dn.light} stopOpacity={0.35} />
            <stop offset="1" stopColor={dn.light} stopOpacity={0} />
          </linearGradient>
        </defs>
        {[-900, -200, 600, 1500, 2400, 3300].map((x, i) => (
          <path key={i} d={`M${x},-1400 L${x + 120},-1400 L${x + 520},300 L${x + 200},300Z`} fill="url(#fray)" opacity={0.6 + 0.4 * Math.sin(t * 0.5 + i)} />
        ))}
      </g>
    )}
    {leaves > 0.01 && (
      <g transform={layerT(cam, 1.1)}>
        {Array.from({length: 14}, (_, i) => {
          const fall = ((t * (40 + hash1(i) * 30) + hash1(i * 3) * 1600) % 1600) - 1300;
          const x = SPAN[0] + hash1(i * 9) * (SPAN[1] - SPAN[0]) + Math.sin(t * 1.2 + i) * 60;
          return <ellipse key={i} cx={x} cy={fall} rx={12} ry={6} fill={tint(['#7fc85a', '#e8b040', '#d9702a'][i % 3], dn, 0.3)} transform={`rotate(${f1(t * 90 + i * 40)} ${f1(x)} ${f1(fall)})`} opacity={leaves} />;
        })}
      </g>
    )}
    {fg > 0.01 && (
      <g transform={layerT(cam, 1.5)} opacity={fg}>
        {Array.from({length: 8}, (_, i) => {
          const x = SPAN[0] + i * 1000 + hash1(i) * 300;
          return (
            <g key={i} transform={`translate(${x} 260)`}>
              {[-0.5, -0.2, 0.15, 0.45].map((a, k) => (
                <ellipse key={k} cx={Math.sin(a) * 120} cy={-Math.cos(a) * 120} rx={30} ry={130} fill={tint(mixColor('#2f7d48', '#0a2a1a', 0.35), dn, 0.3)} transform={`rotate(${f1((a * 180) / Math.PI + Math.sin(t + i + k) * 3)} ${f1(Math.sin(a) * 120)} ${f1(-Math.cos(a) * 120)})`} />
              ))}
            </g>
          );
        })}
      </g>
    )}
    <rect width={1080} height={1920} fill={dn.ambient} opacity={dn.ambK * 0.6} style={{mixBlendMode: 'multiply'}} />
  </g>
);
