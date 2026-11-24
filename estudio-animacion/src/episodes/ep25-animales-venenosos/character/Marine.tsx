// MOTORES MARINOS.
//  · BoxJelly (Chironex fleckeri): campana cúbica translúcida que se contrae (pulso), pedalios en las cuatro
//    esquinas con racimos de tentáculos que se ondulan con retraso (cada uno con su fase).
//  · Lionfish (Pterois volitans): cuerpo con bandas rojizas y blancas, espinas dorsales largas (13, venenosas),
//    pectorales amplias en abanico con radios, aletas que se mueven por separado, ondulación de la cola.
//  · Stonefish (Synanceia verrucosa): cuerpo irregular y verrugoso de camuflaje, cabeza ancha con boca hacia
//    arriba, branquias que bombean, 13 espinas dorsales que se erizan (`spines`).
//  · Stingray (vista superior): disco con ondas que recorren el margen de las pectorales, cola larga con aguijón.
//  · ConeSnail (Conus geographus): concha cónica con dibujo reticulado, pie musculoso, sifón y probóscide.
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';
import {closedSpline} from '../../../lifecycle/stages';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
const P = (pts: V[]) => pts.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y)}`).join(' ');

// ------------------------------------------------------------------- AVISPA DE MAR
export const BoxJelly: React.FC<{x: number; y: number; t: number; s?: number; pulse: number; drift?: V}> = ({x, y, t, s = 1, pulse, drift = {x: 0, y: 0}}) => {
  const c = Math.pow(0.5 - 0.5 * Math.cos(pulse * Math.PI * 2), 1.5); // 0 relajada … 1 contraída
  const W = 90 * (1 - c * 0.18);
  const H = 110 * (1 + c * 0.1);
  const bell = `M${f1(-W)},0 L${f1(-W * 0.92)},${f1(-H * 0.8)} Q${f1(-W * 0.8)},${f1(-H * 1.02)} 0,${f1(-H * 1.04)} Q${f1(W * 0.8)},${f1(-H * 1.02)} ${f1(W * 0.92)},${f1(-H * 0.8)} L${f1(W)},0 Q0,${f1(16 - c * 18)} ${f1(-W)},0Z`;
  const corners = [-W, -W * 0.35, W * 0.35, W];
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s)})`}>
      {corners.map((cx, ci) => (
        <g key={ci}>
          {Array.from({length: 7}, (_, k) => {
            const pts: V[] = [];
            const len = 520 + hash1(ci * 13 + k) * 260;
            for (let j = 0; j <= 18; j++) {
              const u = j / 18;
              const lag = u * 3.2 + k * 0.4 + ci;
              pts.push({x: cx + (k - 3) * 4 + Math.sin(t * 1.3 - lag) * 26 * u - drift.x * u * 60, y: 6 + u * len * (1 - c * 0.12) - drift.y * u * 40});
            }
            return <path key={k} d={P(pts)} stroke="#e8f4ff" strokeWidth={2.2 - k * 0.15} fill="none" opacity={0.55} strokeLinecap="round" />;
          })}
          <path d={`M${f1(cx)},-4 l${f1(ci < 2 ? -8 : 8)},18 l${f1(ci < 2 ? 10 : -10)},6Z`} fill="#dceefc" opacity={0.7} />
        </g>
      ))}
      <path d={bell} fill="#cfe8ff" opacity={0.28} stroke="#eaf6ff" strokeWidth={2.5} />
      <path d={`M${f1(-W * 0.35)},${f1(-H * 0.95)} L${f1(-W * 0.32)},-4 M${f1(W * 0.35)},${f1(-H * 0.95)} L${f1(W * 0.32)},-4`} stroke="#eaf6ff" strokeWidth={1.5} opacity={0.5} />
      <ellipse cx={-W * 0.35} cy={-H * 0.75} rx={W * 0.25} ry={H * 0.08} fill="#ffffff" opacity={0.35} />
      <path d={`M${f1(-W * 0.2)},${f1(-H * 0.55)} Q0,${f1(-H * 0.2)} ${f1(W * 0.2)},${f1(-H * 0.55)}`} stroke="#f4e8ff" strokeWidth={6} fill="none" opacity={0.35} />
      {/* ropalios (órganos sensoriales) en cada cara */}
      {[-W * 0.68, W * 0.68].map((rx, i) => <circle key={i} cx={rx} cy={-H * 0.18} r={4} fill="#5a4a3a" opacity={0.6} />)}
    </g>
  );
};

// ------------------------------------------------------------------- PEZ LEÓN
export const Lionfish: React.FC<{x: number; y: number; t: number; s?: number; dir?: 1 | -1; spread?: number; angle?: number; tone?: number}> = ({x, y, t, s = 1, dir = 1, spread = 0.7, angle = 0, tone = 0}) => {
  const C = (c: string) => mixColor(c, '#05080c', tone * 0.7);
  const wag = Math.sin(t * 3.2) * 0.12;
  const bodyP = closedSpline([{x: 120, y: 0}, {x: 95, y: -38}, {x: 30, y: -55}, {x: -50, y: -45}, {x: -105, y: -14}, {x: -118, y: 0}, {x: -105, y: 14}, {x: -50, y: 40}, {x: 30, y: 46}, {x: 92, y: 30}], 0.9);
  // pectoral en abanico: radios largos con membrana (cada lado con su fase)
  const fan = (side: number, ph: number) => {
    const open = clamp(spread + Math.sin(t * 1.6 + ph) * 0.12);
    const rays = 12;
    return (
      <g opacity={side > 0 ? 1 : 0.75}>
        {Array.from({length: rays}, (_, i) => {
          const a = Math.PI * 0.55 + (i / (rays - 1)) * (0.8 + open * 1.1) + Math.sin(t * 2 + i * 0.3 + ph) * 0.05;
          const len = 150 + (i % 3) * 18 + open * 40;
          const tip = {x: 30 + Math.cos(a) * len * (side > 0 ? 1 : 0.85), y: 12 + Math.sin(a) * len * 0.75};
          return (
            <g key={i}>
              <path d={`M30,12 L${f1(tip.x)},${f1(tip.y)}`} stroke={C('#f4e0d0')} strokeWidth={3} />
              <path d={`M30,12 L${f1(tip.x)},${f1(tip.y)}`} stroke={C(i % 2 ? '#b8442e' : '#7a2a1e')} strokeWidth={2} strokeDasharray="14 10" />
            </g>
          );
        })}
        <path d={`M30,12 ${Array.from({length: 12}, (_, i) => {
          const a = Math.PI * 0.55 + (i / 11) * (0.8 + open * 1.1);
          const len = (150 + (i % 3) * 18 + open * 40) * 0.85;
          return `L${f1(30 + Math.cos(a) * len * (side > 0 ? 1 : 0.85))},${f1(12 + Math.sin(a) * len * 0.75)}`;
        }).join(' ')}Z`} fill={C('#e8c8b8')} opacity={0.28} />
      </g>
    );
  };
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((angle * 180) / Math.PI)}) scale(${f1(s * dir)} ${f1(s)})`}>
      {fan(-1, 1.2)}
      {/* cola */}
      <g transform={`translate(-112 0) rotate(${f1(wag * 57)})`}>
        <path d="M0,0 L-70,-38 Q-60,0 -70,38Z" fill={C('#f0d8c8')} opacity={0.8} />
        {[-28, -12, 4, 20].map((yy, i) => <path key={i} d={`M-6,${yy * 0.3} L-62,${yy}`} stroke={C('#9a3a26')} strokeWidth={2.4} strokeDasharray="6 6" />)}
      </g>
      {/* espinas dorsales largas (13) con membrana */}
      {Array.from({length: 13}, (_, i) => {
        const bx = 70 - i * 13;
        const by = -48 + Math.abs(i - 5) * 1.5;
        const len = 120 - Math.abs(i - 3) * 6 + Math.sin(t * 1.4 + i * 0.5) * 6;
        const a = -Math.PI / 2 - 0.35 - i * 0.03 + Math.sin(t * 1.1 + i * 0.4) * 0.04;
        return (
          <g key={i}>
            <path d={`M${bx},${by} L${f1(bx + Math.cos(a) * len)},${f1(by + Math.sin(a) * len)}`} stroke={C('#f4e4d8')} strokeWidth={3.2} strokeLinecap="round" />
            <path d={`M${bx},${by} L${f1(bx + Math.cos(a) * len)},${f1(by + Math.sin(a) * len)}`} stroke={C('#a0382a')} strokeWidth={2.2} strokeDasharray="10 9" />
          </g>
        );
      })}
      <path d={bodyP} fill={C('#f2dcc8')} stroke={C('#6a2a1e')} strokeWidth={2} />
      {/* bandas rojizas */}
      {Array.from({length: 9}, (_, i) => {
        const xx = 80 - i * 22;
        return <path key={i} d={`M${xx},-50 Q${xx - 10},0 ${xx},48`} stroke={C(i % 2 ? '#b8442e' : '#8a2e20')} strokeWidth={i % 2 ? 9 : 6} fill="none" opacity={0.85} />;
      })}
      <circle cx={88} cy={-12} r={9} fill={C('#2a0e0a')} stroke={C('#f4e4c8')} strokeWidth={2} />
      <path d="M118,6 Q108,14 98,12" stroke={C('#5a1e14')} strokeWidth={3} fill="none" />
      {/* tentáculos supraorbitales */}
      <path d={`M90,-30 q-6,-18 ${f1(-2 + Math.sin(t * 2) * 3)},-30`} stroke={C('#e8c8b0')} strokeWidth={3} fill="none" />
      {fan(1, 0)}
      {/* aleta pélvica y anal (espinas venenosas) */}
      <path d={`M20,42 l-14,${f1(40 + Math.sin(t * 2.4) * 4)} l-12,-38Z`} fill={C('#e0b8a8')} opacity={0.9} />
      <path d={`M-50,38 l-20,${f1(34 + Math.sin(t * 2.8) * 4)} l-16,-36Z`} fill={C('#e0b8a8')} opacity={0.9} />
    </g>
  );
};

// ------------------------------------------------------------------- PEZ PIEDRA
export const Stonefish: React.FC<{x: number; y: number; t: number; s?: number; spines?: number; reveal?: number}> = ({x, y, t, s = 1, spines = 0, reveal = 1}) => {
  const gill = 0.5 + 0.5 * Math.sin(t * 2.2);
  const outline: V[] = Array.from({length: 22}, (_, i) => {
    const a = (i / 22) * Math.PI * 2;
    const r = 1 + (hash1(i * 7) - 0.5) * 0.18;
    return {x: Math.cos(a) * 170 * r - (Math.cos(a) < 0 ? 40 * -Math.cos(a) : 0), y: Math.sin(a) * (Math.sin(a) < 0 ? 72 : 48) * r};
  });
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s)})`}>
      {/* espinas dorsales (13) que se erizan */}
      {Array.from({length: 13}, (_, i) => {
        const bx = 80 - i * 16;
        const len = 18 + spines * 34;
        return <path key={i} d={`M${bx},-58 l${f1(-6 - spines * 4)},${f1(-len)} l${f1(12)},${f1(len * 0.8)}Z`} fill="#7a6a50" stroke="#3a3020" strokeWidth={1.2} opacity={0.5 + 0.5 * spines} />;
      })}
      <path d={closedSpline(outline, 0.85)} fill="#7a6e58" stroke="#3a3428" strokeWidth={2.5} />
      {/* verrugas, manchas de algas y costras (camuflaje) */}
      {Array.from({length: 46}, (_, i) => (
        <circle key={i} cx={(hash1(i * 3) - 0.55) * 300} cy={(hash1(i * 5) - 0.5) * 100} r={4 + hash1(i * 7) * 12} fill={['#5a5040', '#8a7e60', '#9a6a4a', '#6a7a4a', '#b08a5a'][i % 5]} opacity={0.75} />
      ))}
      {Array.from({length: 10}, (_, i) => <path key={`a${i}`} d={`M${f1((hash1(i * 9) - 0.5) * 280)},${f1(-40 + hash1(i * 4) * 30)} q${f1(-6 + Math.sin(t + i) * 4)},-16 ${f1(Math.sin(t * 1.2 + i) * 6)},-28`} stroke="#6a8a4a" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />)}
      {/* boca hacia arriba y ojos pequeños elevados */}
      <path d={`M150,-20 Q120,${f1(-46 - gill * 4)} 90,-36`} stroke="#2a2418" strokeWidth={5} fill="none" />
      <circle cx={95} cy={-50} r={8} fill="#2a2418" />
      <circle cx={70} cy={-55} r={7} fill="#2a2418" />
      {/* opérculo (branquias) que bombea */}
      <path d={`M40,-30 Q${f1(30 - gill * 10)},0 40,30`} stroke="#3a3020" strokeWidth={4} fill="none" />
      {/* pectorales anchas apoyadas */}
      <path d={`M20,30 q-40,${f1(40 + gill * 4)} -110,30 q40,-10 80,-34Z`} fill="#6e6250" stroke="#3a3428" strokeWidth={2} />
      {reveal < 0.99 && <path d={closedSpline(outline, 0.85)} fill="#7a705e" opacity={0.55 * (1 - clamp(reveal))} />}
    </g>
  );
};

// ------------------------------------------------------------------- RAYA (vista superior)
export const Stingray: React.FC<{x: number; y: number; t: number; s?: number; angle?: number; swim?: number; sand?: number}> = ({x, y, t, s = 1, angle = 0, swim = 1, sand = 0}) => {
  const n = 28;
  const pts: V[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const side = Math.sin(a);
    const wave = Math.sin(t * 4 * swim - Math.cos(a) * 3) * 16 * swim * Math.abs(side);
    pts.push({x: Math.cos(a) * 150 + (Math.cos(a) > 0 ? 20 : 0), y: side * (130 + wave)});
  }
  const tailA = Math.sin(t * 1.4) * 0.15;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((angle * 180) / Math.PI)}) scale(${f1(s)})`}>
      <ellipse cx={0} cy={18} rx={180} ry={140} fill="#000" opacity={0.15 * (1 - sand)} />
      {/* cola larga con aguijón */}
      <path d={`M-140,0 Q-260,${f1(tailA * 80)} -400,${f1(tailA * 160)}`} stroke="#6a5a48" strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d={`M-220,${f1(tailA * 50)} l-46,${f1(tailA * 30 - 10)} l4,16Z`} fill="#d8c8a8" stroke="#4a3a2a" strokeWidth={1.5} />
      <path d={closedSpline(pts, 0.9)} fill="#8a7458" stroke="#4a3a2a" strokeWidth={2.5} />
      <ellipse cx={20} cy={0} rx={90} ry={60} fill="#9a8466" opacity={0.6} />
      {Array.from({length: 24}, (_, i) => <circle key={i} cx={(hash1(i * 3) - 0.5) * 240} cy={(hash1(i * 5) - 0.5) * 200} r={3 + hash1(i) * 4} fill="#6a5640" opacity={0.4} />)}
      <circle cx={70} cy={-28} r={8} fill="#2a2018" />
      <circle cx={70} cy={28} r={8} fill="#2a2018" />
      <circle cx={52} cy={-34} r={5} fill="#3a3024" />
      <circle cx={52} cy={34} r={5} fill="#3a3024" />
      {/* arena que la cubre (escondida) */}
      {sand > 0.01 && Array.from({length: 40}, (_, i) => <circle key={`s${i}`} cx={(hash1(i * 11) - 0.5) * 320} cy={(hash1(i * 13) - 0.5) * 260} r={10 + hash1(i * 17) * 18} fill="#d8c8a0" opacity={sand * 0.85} />)}
    </g>
  );
};

// ------------------------------------------------------------------- CARACOL CONO
export const ConeSnail: React.FC<{x: number; y: number; t: number; s?: number; out?: number; proboscis?: number; crawl?: number}> = ({x, y, t, s = 1, out = 1, proboscis = 0, crawl = 0}) => {
  const o = clamp(out);
  const wave = Math.sin(crawl * Math.PI * 2) * 4;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s)})`}>
      <ellipse cx={0} cy={36} rx={170} ry={18} fill="#000" opacity={0.18} />
      {/* pie musculoso */}
      <path d={`M${f1(-120 * o)},30 Q${f1(-40)},${f1(46 + wave)} ${f1(140 * o + 20)},${f1(28 - wave)} Q${f1(150 * o + 30)},18 ${f1(120 * o)},12 L${f1(-110 * o)},18Z`} fill="#c89a8a" stroke="#7a5a50" strokeWidth={2} opacity={o} />
      {/* sifón (tubo sensorial) */}
      <path d={`M90,-30 q${f1(40 * o)},-30 ${f1(70 * o)},${f1(-36 + Math.sin(t * 1.6) * 6)}`} stroke="#d8a898" strokeWidth={12} strokeLinecap="round" fill="none" opacity={o} />
      {/* probóscide extensible */}
      {proboscis > 0.01 && <path d={`M110,10 q${f1(60 * proboscis)},${f1(-4)} ${f1(120 * proboscis)},${f1(-10 + Math.sin(t * 3) * 3)}`} stroke="#e8b8a8" strokeWidth={8} strokeLinecap="round" fill="none" />}
      {/* concha cónica con dibujo reticulado (tipo «mapa») */}
      <path d="M-150,0 Q-140,-58 -60,-70 L120,-24 Q138,-8 120,8 L-60,40 Q-140,40 -150,0Z" fill="#e8d6b4" stroke="#6a4a2a" strokeWidth={2.5} />
      <clipPath id="coneClip"><path d="M-150,0 Q-140,-58 -60,-70 L120,-24 Q138,-8 120,8 L-60,40 Q-140,40 -150,0Z" /></clipPath>
      <g clipPath="url(#coneClip)">
        {Array.from({length: 26}, (_, i) => {
          const cx = -140 + hash1(i * 3) * 260;
          const cy = -60 + hash1(i * 5) * 100;
          return <path key={i} d={`M${f1(cx)},${f1(cy)} l${f1(18 + hash1(i) * 20)},${f1(-8)} l${f1(-6)},${f1(16)} l${f1(-20)},${f1(4)}Z`} fill="#8a5a34" opacity={0.75} />;
        })}
        {Array.from({length: 7}, (_, i) => <path key={`b${i}`} d={`M${-150 + i * 40},-80 L${-110 + i * 40},60`} stroke="#6a4224" strokeWidth={2} opacity={0.35} />)}
      </g>
      <path d="M-150,0 Q-160,-6 -172,-2 Q-162,4 -150,0Z" fill="#c8b090" />
    </g>
  );
};

export const _m = lerp;
