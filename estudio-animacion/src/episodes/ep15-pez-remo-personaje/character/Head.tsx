// CAPA CABEZA (rígida, articulada en el extremo de la columna): cráneo plateado con irisación,
// placas del opérculo, mejilla brillante, ojo grande con anillo, iris y reflejos, narina, boca
// protráctil con labio superior y mandíbula inferior que gira (mouth 0…1), y la CRESTA de radios
// rojos largos que nace sobre la cabeza y se balancea con retardo (cadena de dos segmentos).
import React from 'react';
import {hash1} from '../../../engine/math';
import {f1, quad, taper, V} from './rig';
import {PAL} from './BodySkin';

/** Contorno del cráneo en coordenadas locales (unión con el cuerpo en x = 0, cabeza hacia +x). */
const SKULL = 'M-6,-46 C18,-56 60,-60 96,-52 C124,-40 142,-20 150,4 L118,12 C120,26 112,40 92,50 C60,60 24,58 -6,46 C-12,20 -12,-20 -6,-46 Z';

export const Crest: React.FC<{t: number; uid: string; light: number; sway?: number}> = ({t, uid, light, sway = 1}) => {
  const N = 13;
  const rays = Array.from({length: N}, (_, i) => {
    const k = i / (N - 1);
    const root: V = {x: 104 - k * 74, y: -54 + Math.pow(k - 0.3, 2) * -14 + (k < 0.15 ? 8 : 0)};
    const len = (170 + 190 * Math.sin(Math.PI * Math.min(1, 0.2 + k * 1.1))) * (0.85 + 0.3 * hash1(i * 7.7));
    const a0 = -Math.PI / 2 - 0.5 - k * 0.55 + Math.sin(t * 1.5 - i * 0.45) * 0.05 * sway; // base
    const a1 = a0 - 0.75 - k * 0.2 + Math.sin(t * 1.5 - i * 0.45 - 0.9) * 0.16 * sway; // punta (retardo)
    const mid: V = {x: root.x + Math.cos(a0) * len * 0.5, y: root.y + Math.sin(a0) * len * 0.5};
    const tip: V = {x: mid.x + Math.cos(a1) * len * 0.5, y: mid.y + Math.sin(a1) * len * 0.5};
    const ctrl: V = {x: mid.x, y: mid.y};
    return {root, ctrl, tip, pts: quad(root, ctrl, tip, 10), w: 6.5 - k * 2};
  });
  const membranes = rays.slice(0, N - 1).map((a, i) => {
    const b = rays[i + 1];
    const ha = a.pts.slice(0, 7);
    const hb = b.pts.slice(0, 6).reverse();
    return `M${ha.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')} L${hb.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')}Z`;
  });
  return (
    <g>
      <defs>
        <linearGradient id={`cr-${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#c0182c" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ff5a6a" stopOpacity={0.15} />
        </linearGradient>
      </defs>
      {membranes.map((d, i) => (
        <path key={`m${i}`} d={d} fill={`url(#cr-${uid})`} />
      ))}
      {rays.map((r, i) => (
        <g key={i}>
          <path d={taper(r.pts, r.w * 3, r.w)} fill="#ff3a4c" opacity={0.1 * light} />
          <path d={taper(r.pts, r.w, 1)} fill={PAL.red} />
          <path d={taper(r.pts.slice(0, 7), r.w * 0.35, 0.4)} fill="#ffb4bc" opacity={0.6} />
          <circle cx={r.tip.x} cy={r.tip.y} r={2.2} fill="#ff8a96" opacity={0.8} />
        </g>
      ))}
    </g>
  );
};

export const Head: React.FC<{t: number; mouth: number; uid: string; light: number}> = ({mouth, uid, light}) => {
  const jaw = mouth * 0.38; // rad
  const pivot = {x: 100, y: 16};
  const rot = (p: V) => ({x: pivot.x + (p.x - pivot.x) * Math.cos(jaw) - (p.y - pivot.y) * Math.sin(jaw), y: pivot.y + (p.x - pivot.x) * Math.sin(jaw) + (p.y - pivot.y) * Math.cos(jaw)});
  const lj = [{x: 100, y: 15}, {x: 128, y: 13}, {x: 145, y: 15}, {x: 142, y: 21}, {x: 126, y: 26}, {x: 106, y: 28}].map(rot);
  const blink = 1;
  return (
    <g>
      <defs>
        <linearGradient id={`hs-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={PAL.navy} />
          <stop offset="0.25" stopColor={PAL.steel} />
          <stop offset="0.5" stopColor={PAL.silver} />
          <stop offset="0.8" stopColor={PAL.lav} />
          <stop offset="1" stopColor={PAL.pearl} />
        </linearGradient>
        <radialGradient id={`hc-${uid}`} cx="0.62" cy="0.55" r="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`hi-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8f7cff" stopOpacity={0.4} />
          <stop offset="0.5" stopColor="#7fe8ff" stopOpacity={0.1} />
          <stop offset="1" stopColor="#c89cff" stopOpacity={0.35} />
        </linearGradient>
        <linearGradient id={`hm-${uid}`} gradientUnits="userSpaceOnUse" x1="-8" y1="0" x2="34" y2="0">
          <stop offset="0" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id={`hk-${uid}`} maskUnits="userSpaceOnUse" x="-40" y="-120" width="240" height="240">
          <rect x={-40} y={-120} width={240} height={240} fill={`url(#hm-${uid})`} />
        </mask>
        <radialGradient id={`he-${uid}`} cx="0.4" cy="0.35" r="0.65">
          <stop offset="0" stopColor="#f6fbff" />
          <stop offset="0.6" stopColor="#a8b8d8" />
          <stop offset="1" stopColor="#4a5a80" />
        </radialGradient>
      </defs>
      {/* interior de la boca (visible al abrir) */}
      <path d={`M100,14 L146,12 L${f1(lj[2].x)},${f1(lj[2].y)} L${f1(lj[5].x)},${f1(lj[5].y)}Z`} fill="#4a0e1a" opacity={0.9} />
      {/* mandíbula inferior */}
      <path d={`M${lj.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')}Z`} fill={`url(#hs-${uid})`} stroke="#0a1430" strokeWidth={1.6} />
      <path d={`M${f1(lj[1].x)},${f1(lj[1].y + 1)} L${f1(lj[2].x)},${f1(lj[2].y + 1)}`} stroke={PAL.pink} strokeWidth={3} strokeLinecap="round" opacity={0.85} />
      {/* cráneo */}
      <g mask={`url(#hk-${uid})`}>
        <path d={SKULL} fill={`url(#hs-${uid})`} />
        <path d={SKULL} fill={`url(#hi-${uid})`} style={{mixBlendMode: 'screen'}} opacity={0.8 * light} />
        <path d={SKULL} fill={`url(#hc-${uid})`} opacity={0.9 * light} />
      </g>
      <path d="M30,-58 C56,-60 80,-58 96,-52 C124,-40 142,-20 150,4 L118,12 C120,26 112,40 92,50 C70,57 50,58 30,56" stroke="#0a1430" strokeWidth={1.8} fill="none" />
      {/* placas del opérculo y mejilla */}
      <path d="M40,-48 C22,-20 22,22 40,52" stroke="#1a2a50" strokeWidth={3} fill="none" opacity={0.75} />
      <path d="M40,-48 C22,-20 22,22 40,52" stroke="#ffffff" strokeWidth={1.4} fill="none" opacity={0.5} transform="translate(3 0)" />
      <path d="M62,-18 C54,0 56,24 70,40" stroke="#2a3a66" strokeWidth={2} fill="none" opacity={0.6} />
      <path d="M58,26 C76,34 96,36 112,30" stroke="#2a3a66" strokeWidth={1.6} fill="none" opacity={0.5} />
      {Array.from({length: 6}, (_, i) => (
        <circle key={i} cx={30 + hash1(i * 3) * 70} cy={-30 + hash1(i * 5) * 60} r={2 + hash1(i) * 3} fill={PAL.spot} opacity={0.35} />
      ))}
      {/* labio superior protráctil */}
      <path d="M104,10 C118,6 136,4 150,8" stroke={PAL.pink} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <path d="M104,10 C118,6 136,4 150,8" stroke="#0a1430" strokeWidth={1.2} fill="none" opacity={0.6} transform="translate(0 3)" />
      <circle cx={136} cy={-10} r={2.4} fill="#0a1430" opacity={0.7} />
      {/* ojo */}
      <g transform="translate(100 -22)">
        <circle r={19} fill="#0a1430" opacity={0.35} />
        <circle r={16} fill={`url(#he-${uid})`} stroke="#0a1430" strokeWidth={1.8} />
        <circle r={11.5} fill="#2a3450" />
        <circle r={11.5} fill="none" stroke="#c8b070" strokeWidth={1.6} opacity={0.55} />
        <ellipse rx={8} ry={8 * blink} fill="#03060c" />
        <circle cx={-3.5} cy={-4} r={2.8} fill="#ffffff" opacity={0.9} />
        <circle cx={4} cy={3.5} r={1.3} fill="#bfe8ff" opacity={0.7} />
        <path d="M-17,-4 Q0,-21 17,-4" stroke="#0a1430" strokeWidth={3} fill="none" opacity={0.45} />
      </g>
      <path d="M30,-58 C56,-60 80,-58 96,-52 C124,-40 142,-20 150,4" stroke={PAL.rim} strokeWidth={2.4} fill="none" opacity={0.5 * light} />
    </g>
  );
};
