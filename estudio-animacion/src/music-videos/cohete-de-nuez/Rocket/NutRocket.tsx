// FICHA — EL COHETE DE NUEZ (manualidad de cartón, cinta y papel; vuela solo en la fantasía).
// Cuerpo: nuez grande con cáscara arrugada y costura central · aletas de cartón pintado con
// borde corrugado · punta de papel decorado · ventana circular con aro de cartón · tiras de
// cinta adhesiva visibles · lucecitas de colores · "motor imaginario" de chispas mágicas.
// Cada pieza tiene su propio progreso de construcción (0–1) para el montaje paso a paso.
import React from 'react';
import {hash1, mixColor} from '../../../engine/math';

export type RocketBuild = {
  shell: number; // la nuez aparece sobre la mesa
  fins: [number, number, number]; // izquierda, derecha, central
  windowK: number; // ventana colocada
  nose: number; // punta de papel
  tape: number; // tiras de cinta
  lights: number; // lucecitas encendidas
  stars: number; // decoración de estrellas
};
export const BUILT: RocketBuild = {shell: 1, fins: [1, 1, 1], windowK: 1, nose: 1, tape: 1, lights: 1, stars: 1};

export type RocketPose = {
  x: number;
  y: number;
  scale: number;
  rot: number; // rad
  build: RocketBuild;
  vibrate: number; // 0–1 temblor antes del despegue
  engine: number; // 0–1 chispas mágicas del motor imaginario
  glow: number; // 0–1 resplandor mágico
  t: number;
};

const SHELL = '#a8743e';
const SHELL_D = '#6e4522';
const OUT = '#3e2412';

const shellPath = () => {
  // contorno de nuez: ovalado con pequeñas ondulaciones
  const pts: string[] = [];
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const wob = 1 + 0.025 * Math.sin(a * 9) + 0.015 * Math.sin(a * 17 + 1);
    pts.push(`${(Math.sin(a) * 132 * wob).toFixed(1)},${(-250 - Math.cos(a) * 182 * wob).toFixed(1)}`);
  }
  return 'M' + pts.join('L') + 'Z';
};
const SHELL_D_PATH = shellPath();
// arrugas deterministas de la cáscara
const WRINKLES = Array.from({length: 26}, (_, i) => {
  const side = i % 2 ? 1 : -1;
  const y0 = -400 + hash1(i * 3.1) * 300;
  const x0 = side * (18 + hash1(i * 5.3) * 90);
  const w = 30 + hash1(i * 7.7) * 40;
  return `M${x0.toFixed(0)},${y0.toFixed(0)} q${(side * w * 0.5).toFixed(0)},${(-10 - hash1(i) * 14).toFixed(0)} ${(side * w).toFixed(0)},${(4 + hash1(i * 2) * 10).toFixed(0)} q${(side * 8).toFixed(0)},12 ${(side * 2).toFixed(0)},26`;
});

const Fin: React.FC<{side: -1 | 1 | 0; k: number; color: string}> = ({side, k, color}) => {
  if (k <= 0.01) return null;
  const d =
    side === 0
      ? 'M-26,-120 L26,-120 L18,10 L-18,10Z'
      : `M${side * 96},-170 Q${side * 190},-120 ${side * 200},0 L${side * 150},0 Q${side * 120},-60 ${side * 78},-96Z`;
  const drop = (1 - k) * -260;
  return (
    <g transform={`translate(0 ${drop.toFixed(1)})`} opacity={Math.min(1, k * 2)}>
      <path d={d} fill={color} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      {/* borde corrugado del cartón */}
      {side !== 0 && <path d={`M${side * 152},-4 L${side * 196},-4`} stroke={mixColor(color, '#000000', 0.25)} strokeWidth={8} strokeDasharray="4 4" />}
      {side !== 0 && <path d={`M${side * 112},-120 Q${side * 160},-90 ${side * 172},-30`} stroke="#ffffff" strokeWidth={6} fill="none" opacity={0.35} strokeLinecap="round" />}
      {side === 0 && <path d="M-14,-100 L14,-100 M-12,-70 L12,-70 M-10,-40 L10,-40" stroke="#ffffff" strokeWidth={5} opacity={0.5} />}
    </g>
  );
};

const Star: React.FC<{x: number; y: number; r: number; c: string; rot?: number}> = ({x, y, r, c, rot = 0}) => (
  <path transform={`translate(${x} ${y}) rotate(${rot}) scale(${r / 20})`} d="M0,-20 L6,-6 L21,-6 L9,3 L13,18 L0,9 L-13,18 L-9,3 L-21,-6 L-6,-6Z" fill={c} stroke={OUT} strokeWidth={2.5} strokeLinejoin="round" />
);

export const NutRocket: React.FC<{p: RocketPose; id?: string; windowContent?: React.ReactNode}> = ({p, id = 'rocket', windowContent}) => {
  const b = p.build;
  const shake = p.vibrate * (Math.sin(p.t * 61) * 3 + Math.sin(p.t * 47 + 1) * 2);
  const lights = ['#ff5d73', '#ffd23f', '#4dd88a', '#5db8ff', '#c38aff', '#ff9a3c', '#ff5d73', '#4dd88a'];
  return (
    <g transform={`translate(${(p.x + shake).toFixed(1)} ${p.y.toFixed(1)}) rotate(${((p.rot * 180) / Math.PI).toFixed(2)}) scale(${p.scale.toFixed(3)})`}>
      <defs>
        <radialGradient id={`${id}-shell`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#d9a466" />
          <stop offset="0.5" stopColor={SHELL} />
          <stop offset="1" stopColor={SHELL_D} />
        </radialGradient>
        <radialGradient id={`${id}-glass`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.5} />
          <stop offset="0.5" stopColor="#bfe6ff" stopOpacity={0.15} />
          <stop offset="1" stopColor="#7fbfff" stopOpacity={0.35} />
        </radialGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6c8" stopOpacity={0.9} />
          <stop offset="0.5" stopColor="#ffb3e6" stopOpacity={0.45} />
          <stop offset="1" stopColor="#8ad7ff" stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${id}-win`}>
          <circle cx={0} cy={-280} r={58} />
        </clipPath>
      </defs>
      {/* resplandor mágico */}
      {p.glow > 0.01 && <circle cx={0} cy={-220} r={360} fill={`url(#${id}-glow)`} opacity={p.glow} />}
      {/* motor imaginario: chispas, estrellitas y colores (no fuego realista) */}
      {p.engine > 0.01 && (
        <g>
          <ellipse cx={0} cy={60} rx={70 * p.engine} ry={130 * p.engine} fill={`url(#${id}-glow)`} />
          {Array.from({length: 22}, (_, i) => {
            const ph = (p.t * 1.6 + hash1(i)) % 1;
            const x = (hash1(i * 3) - 0.5) * 90 * (0.4 + ph);
            const y = 40 + ph * 260 * p.engine;
            const c = ['#ffd23f', '#ff7ab0', '#7ff3ff', '#c38aff', '#ffffff'][i % 5];
            return i % 3 === 0 ? <Star key={i} x={x} y={y} r={9 * (1 - ph)} c={c} rot={ph * 200} /> : <circle key={i} cx={x} cy={y} r={7 * (1 - ph) + 2} fill={c} opacity={(1 - ph) * p.engine} />;
          })}
        </g>
      )}
      {/* tobera: vaso de papel */}
      {b.shell > 0.5 && <path d="M-46,-80 L46,-80 L36,30 L-36,30Z" fill="#e8e2d4" stroke={OUT} strokeWidth={5} opacity={Math.min(1, (b.shell - 0.5) * 2)} />}
      {b.shell > 0.5 && <path d="M-40,-50 L40,-50 M-38,-20 L38,-20" stroke="#5db8ff" strokeWidth={6} opacity={Math.min(1, (b.shell - 0.5) * 2)} />}
      <Fin side={-1} k={b.fins[0]} color="#e8463c" />
      <Fin side={1} k={b.fins[1]} color="#2f6fd6" />
      {/* cuerpo: nuez */}
      <g opacity={b.shell} transform={`translate(0 ${((1 - b.shell) * 40).toFixed(1)}) scale(${(0.85 + 0.15 * b.shell).toFixed(3)})`}>
        <path d={SHELL_D_PATH} fill={`url(#${id}-shell)`} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
        {WRINKLES.map((d, i) => (
          <path key={i} d={d} stroke={SHELL_D} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.75} />
        ))}
        {/* costura central de la nuez */}
        <path d="M0,-432 Q-10,-330 4,-250 Q12,-160 0,-68" stroke={SHELL_D} strokeWidth={10} fill="none" strokeLinecap="round" />
        <path d="M-4,-432 Q-14,-330 0,-250 Q8,-160 -4,-68" stroke="#d9a466" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.6} />
        <ellipse cx={-56} cy={-330} rx={30} ry={60} fill="#ffffff" opacity={0.12} transform="rotate(-18 -56 -330)" />
      </g>
      {/* ventana circular con aro de cartón y contenido interior */}
      {b.windowK > 0.01 && (
        <g opacity={Math.min(1, b.windowK * 2)} transform={`translate(0 ${((1 - b.windowK) * -60).toFixed(1)})`}>
          <circle cx={0} cy={-280} r={72} fill="#c79a5e" stroke={OUT} strokeWidth={5} />
          {Array.from({length: 12}, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <circle key={i} cx={Math.cos(a) * 65} cy={-280 + Math.sin(a) * 65} r={3.5} fill="#7a5428" />;
          })}
          <circle cx={0} cy={-280} r={58} fill="#1d2a52" />
          <g clipPath={`url(#${id}-win)`}>{windowContent}</g>
          <circle cx={0} cy={-280} r={58} fill={`url(#${id}-glass)`} stroke={OUT} strokeWidth={4} />
          <path d="M-36,-316 A44,44 0 0 1 4,-334" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.7} />
        </g>
      )}
      <Fin side={0} k={b.fins[2]} color="#ffd23f" />
      {/* punta de papel decorado */}
      {b.nose > 0.01 && (
        <g opacity={Math.min(1, b.nose * 2)} transform={`translate(0 ${((1 - b.nose) * -120).toFixed(1)})`}>
          <path d="M-92,-410 Q-40,-560 0,-600 Q40,-560 92,-410 Q0,-388 -92,-410Z" fill="#ff9ad5" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
          <path d="M-70,-452 Q0,-432 70,-452" stroke="#ffffff" strokeWidth={10} fill="none" />
          <path d="M-46,-502 Q0,-488 46,-502" stroke="#ffd23f" strokeWidth={9} fill="none" />
          <circle cx={0} cy={-604} r={12} fill="#ffd23f" stroke={OUT} strokeWidth={4} />
          {[-40, 0, 40].map((x, i) => (
            <circle key={i} cx={x} cy={-470 + Math.abs(x) * 0.2} r={5} fill="#5db8ff" />
          ))}
        </g>
      )}
      {/* tiras de cinta adhesiva (translúcidas) */}
      {b.tape > 0.01 && (
        <g opacity={0.85 * b.tape}>
          {[
            [-118, -150, -30],
            [112, -150, 30],
            [-80, -414, -10],
            [76, -414, 12],
            [-54, -228, -70],
            [52, -232, 66],
          ].map(([x, y, r], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
              <rect x={-30} y={-9} width={60 * Math.min(1, b.tape * 1.4 - i * 0.05)} height={18} fill="#f6ecc4" opacity={0.75} stroke="#d8c48a" strokeWidth={1.5} />
            </g>
          ))}
        </g>
      )}
      {/* lucecitas decorativas */}
      {lights.map((c, i) => {
        const a = -1.15 + (i / (lights.length - 1)) * 2.3;
        const x = Math.sin(a) * 124;
        const y = -170 - Math.cos(a) * 20 + Math.abs(a) * 14;
        const on = b.lights * (0.55 + 0.45 * Math.sin(p.t * 5 + i * 1.3));
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={9} fill={mixColor('#5a5040', c, on)} stroke={OUT} strokeWidth={3} />
            {on > 0.3 && <circle cx={x} cy={y} r={20} fill={c} opacity={0.3 * on} />}
          </g>
        );
      })}
      {/* estrellas pegadas */}
      {b.stars > 0.01 && (
        <g opacity={b.stars}>
          <Star x={-78} y={-372} r={18 * b.stars} c="#ffd23f" rot={-10} />
          <Star x={84} y={-350} r={14 * b.stars} c="#ffffff" rot={14} />
          <Star x={-92} y={-210} r={12 * b.stars} c="#7ff3ff" rot={8} />
          <Star x={90} y={-200} r={16 * b.stars} c="#ff9ad5" rot={-6} />
        </g>
      )}
    </g>
  );
};
