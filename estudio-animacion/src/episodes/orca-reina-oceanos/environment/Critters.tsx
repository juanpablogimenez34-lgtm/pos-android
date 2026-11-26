// ANIMALES SECUNDARIOS: tiburón blanco (Carcharodon carcharias) con propulsión LATERAL —de perfil, el vaivén de la
// cola se ve como el giro de la aleta caudal vertical (escorzo) y una leve onda del cuerpo— y foca de Weddell
// descansando sobre el hielo.
import React from 'react';
import {clamp, lerp, smoothPath} from '../../../engine/math';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);

export type SharkPose = {x: number; y: number; angle: number; scale: number; facing: 1 | -1; phase: number; amp: number; under?: number; liver?: number; jaw?: number};
/** Tiburón blanco de perfil (local: hocico en el origen, cuerpo hacia −x, longitud 1000). */
export const GreatWhite: React.FC<{p: SharkPose; uid: string}> = ({p, uid}) => {
  const N = 24;
  const top: V[] = [];
  const bot: V[] = [];
  const PR: [number, number, number][] = [[0, 0.01, 0.01], [0.04, 0.06, 0.05], [0.12, 0.1, 0.09], [0.25, 0.125, 0.12], [0.4, 0.12, 0.11], [0.55, 0.095, 0.08], [0.7, 0.06, 0.045], [0.82, 0.035, 0.028], [0.9, 0.025, 0.022], [1, 0.02, 0.018]];
  const pr = (u: number) => {
    let i = 0;
    while (i < PR.length - 2 && u > PR[i + 1][0]) i++;
    const k = clamp((u - PR[i][0]) / (PR[i + 1][0] - PR[i][0]));
    return [lerp(PR[i][1], PR[i + 1][1], k), lerp(PR[i][2], PR[i + 1][2], k)];
  };
  // de perfil, la onda lateral apenas desplaza en vertical: el cuerpo "respira" en anchura aparente
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const sway = Math.sin(p.phase - u * 3) * Math.pow(u, 2) * p.amp;
    const [t, b] = pr(u);
    const k = 1 - Math.abs(sway) * 0.15;
    top.push({x: -u * 1000, y: -t * 1000 * k});
    bot.push({x: -u * 1000, y: b * 1000 * k});
  }
  const outline = smoothPath([...top, ...bot.reverse()], true);
  // caudal heterocerca: el lóbulo superior más largo; su anchura aparente cambia con el vaivén lateral
  const sw = Math.cos(p.phase - 3) * p.amp;
  const cw = Math.max(0.18, Math.abs(Math.cos(Math.asin(clamp(sw * 0.8, -0.95, 0.95))))) ;
  const tx = -1000;
  const caudal = `M${tx + 30} -18L${tx - 130 * cw} -230L${tx - 60 * cw} -40L${tx - 90 * cw} 150L${tx + 30} 18Z`;
  const id = `gw-${uid}`;
  const under = p.under ?? 1;
  const grey = lerp(0, 1, under) > 0.5 ? '#5a6e7c' : '#6a7a86';
  const jaw = clamp(p.jaw ?? 0);
  return (
    <g transform={`translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1((p.angle * 180) / Math.PI)}) scale(${f1(p.facing * p.scale * 1000) / 1000} ${f1(p.scale * 1000) / 1000})`}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a4a58" />
          <stop offset="0.45" stopColor={grey} />
          <stop offset="0.52" stopColor="#e8eef0" />
          <stop offset="1" stopColor="#c8d4da" />
        </linearGradient>
      </defs>
      <path d={caudal} fill="#44545f" stroke="#1a242c" strokeWidth={2.5} />
      {/* aleta pectoral lejana, dorsal, pectoral cercana, pélvica y anal */}
      <path d="M-300 70L-420 210L-360 80Z" fill="#33424e" />
      <path d={outline} fill={`url(#${id}-g)`} stroke="#1a242c" strokeWidth={2.5} />
      <path d="M-330 -112C-360 -200 -400 -260 -440 -300C-450 -220 -470 -150 -520 -100Z" fill="#46566a" stroke="#1a242c" strokeWidth={2.5} />
      <path d="M-260 80C-300 160 -360 240 -420 290C-400 200 -370 130 -340 90Z" fill="#4a5a66" stroke="#1a242c" strokeWidth={2.5} />
      <path d="M-690 40L-740 100L-730 40Z" fill="#46566a" />
      <path d="M-870 -24L-900 -60L-910 -22ZM-870 22L-900 50L-905 20Z" fill="#46566a" />
      {/* hendiduras branquiales (branquias: el tiburón es un pez) */}
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${-190 - i * 22} -40Q${-198 - i * 22} 10 ${-190 - i * 22} 50`} stroke="#22303a" strokeWidth={3} fill="none" />)}
      {/* ojo negro y boca */}
      <circle cx={-80} cy={-18} r={9} fill="#05080a" />
      <circle cx={-83} cy={-21} r={2.5} fill="#cfe8f4" />
      <path d={`M-30 22Q-90 ${50 + jaw * 30} -160 34`} stroke="#1a242c" strokeWidth={3} fill={jaw > 0.05 ? '#5a2a30' : 'none'} />
      {(p.liver ?? 0) > 0.01 && (
        <g opacity={p.liver}>
          <path d="M-200 20C-260 -20 -420 -10 -520 30C-440 70 -280 80 -200 20Z" fill="#e8a838" stroke="#fff" strokeWidth={4} />
        </g>
      )}
    </g>
  );
};

/** Foca de Weddell tumbada sobre el hielo (local: base en y = 0); `alert` levanta la cabeza. */
export const Seal: React.FC<{x: number; y: number; s?: number; alert?: number; slide?: number}> = ({x, y, s = 1, alert = 0, slide = 0}) => (
  <g transform={`translate(${f1(x + slide)} ${f1(y)}) scale(${s})`}>
    <path d={`M-90 0C-100 -20 -60 -42 0 -40C40 -38 70 -30 ${80} ${-24 - alert * 16}C${96} ${-34 - alert * 24} ${118} ${-30 - alert * 24} ${116} ${-16 - alert * 16}C110 -6 90 0 60 0Z`} fill="#5a6672" stroke="#22282e" strokeWidth={2} />
    <path d="M-70 -10C-30 -26 30 -26 70 -12" stroke="#8a96a2" strokeWidth={4} fill="none" opacity={0.6} />
    {[[-40, -28], [-10, -30], [20, -26], [-55, -16], [5, -18]].map(([cx, cy], i) => <ellipse key={i} cx={cx} cy={cy} rx={7} ry={4} fill="#c8d0d8" opacity={0.55} />)}
    <circle cx={104} cy={-24 - alert * 18} r={3} fill="#05080a" />
    <path d="M-92 -2L-120 -14L-114 0L-120 12Z" fill="#4a5662" />
  </g>
);
export const _k = {lerp};
