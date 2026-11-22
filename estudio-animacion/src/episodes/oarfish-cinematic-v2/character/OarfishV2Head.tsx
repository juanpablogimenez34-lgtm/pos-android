// CABEZA NATURALISTA DEL PEZ REMO (v2). Coordenadas locales: unión con el cuerpo en x = 0, hocico
// hacia +x, dorso hacia −y. Proporciones de Regalecus: cabeza corta y alta (≈ altura del cuerpo),
// frente casi vertical bajo la cresta, boca pequeña y protráctil en el extremo, ojo moderado (≈ 1/6
// de la altura de la cabeza), opérculo grande con estrías radiales, piel plateada sin escamas.
// El volumen lo da el filtro de iluminación (no hay brillos pintados con círculos).
import React from 'react';
import {hash1} from '../../../engine/math';
import {f1} from '../../ep16-pez-remo-premium/OarfishRig';
import {taper} from '../../ep15-pez-remo-personaje/character/rig';
import {VolumeFilter} from './filters';

/** Contorno del cráneo (parte trasera solapada con el cuerpo y difuminada con máscara). */
const SKULL =
  'M-26,-58 C4,-64 38,-70 64,-70 C78,-70 88,-64 96,-54 C108,-38 116,-24 122,-10 C125,-4 126,2 124,6 L106,10 C110,18 110,28 104,36 C92,50 70,60 44,63 C18,66 -8,64 -26,58 C-34,30 -34,-30 -26,-58 Z';

export const HeadV2: React.FC<{uid: string; mouth: number; light: number; relief?: number}> = ({uid, mouth, light, relief = 9}) => {
  const jaw = mouth * 0.42;
  const pv = {x: 100, y: 12};
  const R = (x: number, y: number) => ({x: pv.x + (x - pv.x) * Math.cos(jaw) - (y - pv.y) * Math.sin(jaw), y: pv.y + (x - pv.x) * Math.sin(jaw) + (y - pv.y) * Math.cos(jaw)});
  const lj = [R(98, 10), R(112, 8.5), R(126, 7.5), R(127.5, 10), R(120, 13.5), R(106, 17), R(96, 16)];
  // estrías radiales del opérculo
  let striae = '';
  for (let i = 0; i < 16; i++) {
    const a = -1.15 + i * 0.15;
    const r0 = 18;
    const r1 = 46 + 6 * hash1(i * 3);
    striae += `M${f1(36 + Math.cos(a + Math.PI) * -r0 * 0.2)},${f1(Math.sin(a) * r0)} Q${f1(30 - Math.cos(a) * r1 * 0.35)},${f1(Math.sin(a) * r1 * 0.6)} ${f1(18 - Math.cos(a) * r1 * 0.45)},${f1(Math.sin(a) * r1)} `;
  }
  // manchas pequeñas irregulares (polígonos con jitter, no círculos)
  let marks = '';
  for (let i = 0; i < 18; i++) {
    const cx = -10 + hash1(i * 5.1) * 90;
    const cy = -44 + hash1(i * 7.7) * 70;
    const s = 1.6 + hash1(i * 2.3) * 2.8;
    marks += 'M' + Array.from({length: 6}, (_, q) => {
      const w = (q / 6) * Math.PI * 2;
      const rr = s * (0.6 + 0.6 * hash1(i * 13 + q));
      return `${f1(cx + Math.cos(w) * rr * 1.5)},${f1(cy + Math.sin(w) * rr)}`;
    }).join(' L') + 'Z ';
  }
  return (
    <g>
      <defs>
        <VolumeFilter id={`hv-${uid}`} relief={relief} micro={0.05} />
        <linearGradient id={`hb-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0e1736" />
          <stop offset="0.12" stopColor="#1a2a5e" />
          <stop offset="0.3" stopColor="#3d5896" />
          <stop offset="0.48" stopColor="#9eb0d8" />
          <stop offset="0.62" stopColor="#c9d3e6" />
          <stop offset="0.8" stopColor="#cfcde6" />
          <stop offset="1" stopColor="#e6eaf3" />
        </linearGradient>
        <linearGradient id={`hir-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c6cff" stopOpacity={0.35} />
          <stop offset="0.45" stopColor="#5ad8ff" stopOpacity={0.08} />
          <stop offset="1" stopColor="#c08cff" stopOpacity={0.3} />
        </linearGradient>
        <linearGradient id={`hm-${uid}`} gradientUnits="userSpaceOnUse" x1="-24" y1="0" x2="30" y2="0">
          <stop offset="0" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id={`hk-${uid}`} maskUnits="userSpaceOnUse" x="-60" y="-140" width="260" height="280">
          <rect x={-60} y={-140} width={260} height={280} fill={`url(#hm-${uid})`} />
        </mask>
        <radialGradient id={`ey-${uid}`} cx="0.42" cy="0.38" r="0.62">
          <stop offset="0" stopColor="#d9e2ee" />
          <stop offset="0.55" stopColor="#8d9cb6" />
          <stop offset="1" stopColor="#3a4868" />
        </radialGradient>
      </defs>
      {/* boca: interior y mandíbula inferior protráctil */}
      <path d={`M98,9 L127,6 L${f1(lj[3].x)},${f1(lj[3].y)} L${f1(lj[5].x)},${f1(lj[5].y)}Z`} fill="#3a0c16" />
      <path d={`M${lj.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')}Z`} fill="#c4cbdc" stroke="#141c34" strokeWidth={1} filter={`url(#hv-${uid})`} />
      <g mask={`url(#hk-${uid})`}>
        <g filter={`url(#hv-${uid})`}>
          <path d={SKULL} fill={`url(#hb-${uid})`} />
        </g>
        <path d={SKULL} fill={`url(#hir-${uid})`} style={{mixBlendMode: 'screen'}} opacity={0.9 * light} />
      </g>
      {/* brillos especulares suaves en frente y mejilla (formas orgánicas desenfocadas) */}
      <defs>
        <filter id={`hb2-${uid}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={5} /></filter>
      </defs>
      <path d="M58,-60 C76,-62 92,-54 104,-40 C92,-46 76,-52 58,-54Z" fill="#ffffff" opacity={0.7 * light} filter={`url(#hb2-${uid})`} />
      <path d="M50,6 C64,0 84,4 96,14 C88,22 70,24 54,18Z" fill="#ffffff" opacity={0.35 * light} filter={`url(#hb2-${uid})`} />
      <path d="M44,36 C62,42 84,40 100,30" stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.4 * light} filter={`url(#hb2-${uid})`} />
      {/* opérculo y preopérculo (bordes óseos con estrías) */}
      <path d="M40,-50 C24,-26 22,18 36,52" stroke="#16224a" strokeWidth={2.2} fill="none" opacity={0.7} />
      <path d="M42,-50 C26,-26 24,18 38,52" stroke="#eaf2ff" strokeWidth={1} fill="none" opacity={0.45 * light} />
      <path d={striae} stroke="#2a3a66" strokeWidth={0.8} fill="none" opacity={0.35} />
      <path d="M66,-28 C58,-8 58,18 72,38" stroke="#24345e" strokeWidth={1.4} fill="none" opacity={0.45} />
      <path d={marks} fill="#1a2242" opacity={0.42} />
      {/* maxilar y labio superior protráctil */}
      <path d="M96,6 C106,3 118,0 127,3" stroke="#d9a4ae" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <path d="M96,8 C106,5 118,2 127,5" stroke="#141c34" strokeWidth={0.9} fill="none" opacity={0.6} />
      <path d="M90,-2 C98,2 104,4 110,4" stroke="#30406e" strokeWidth={1.2} fill="none" opacity={0.5} />
      <path d={`M${f1(lj[1].x)},${f1(lj[1].y)} L${f1(lj[2].x)},${f1(lj[2].y)}`} stroke="#d9a4ae" strokeWidth={2} strokeLinecap="round" />
      {/* narina */}
      <path d="M110,-18 q3,-2 5,1" stroke="#141c34" strokeWidth={1.4} fill="none" opacity={0.7} />
      {/* ojo pequeño y natural: órbita, iris plateado con reflejo dorado tenue, pupila, un brillo */}
      <g transform="translate(84 -22)">
        <path d="M-15,0 C-15,-10 -8,-15 0,-15 C9,-15 15,-9 15,0 C15,9 9,15 0,15 C-9,15 -15,9 -15,0Z" fill="#0c1428" opacity={0.55} />
        <path d="M-11.5,0 C-11.5,-7 -6,-11.5 0,-11.5 C7,-11.5 11.5,-7 11.5,0 C11.5,7 7,11.5 0,11.5 C-7,11.5 -11.5,7 -11.5,0Z" fill={`url(#ey-${uid})`} />
        <path d="M-7.4,0.6 C-7.4,-4 -4,-7 0.4,-7 C4.6,-7 7.6,-4 7.6,0.4 C7.6,4.8 4.4,7.6 0.2,7.6 C-4,7.6 -7.4,4.6 -7.4,0.6Z" fill="#05080f" />
        <path d="M-7.4,0.6 C-7.4,-4 -4,-7 0.4,-7 C4.6,-7 7.6,-4 7.6,0.4" stroke="#c9b27a" strokeWidth={1} fill="none" opacity={0.45} />
        <path d="M-4.6,-3.4 q1.6,-1.8 3.4,-1.2" stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" opacity={0.8} />
        <path d="M-13,-4 C-8,-13 6,-14 13,-5" stroke="#0a1226" strokeWidth={2.4} fill="none" opacity={0.4} />
      </g>
    </g>
  );
};

/** CRESTA: radios rojos largos y delicados (con pequeñas membranas en la base), que se balancean con
 *  retardo progresivo (cadena base → punta). Nacen sobre la nuca, por delante de la aleta dorsal. */
export const CrestV2: React.FC<{uid: string; t: number; light: number; k?: number}> = ({uid, t, light, k = 1}) => {
  const N = 17;
  const rays = Array.from({length: N}, (_, i) => {
    const q = i / (N - 1);
    const root = {x: 70 - q * 62, y: -69 + q * 4};
    const L = (150 + 230 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.15 + q * 1.05)), 0.8)) * (0.78 + 0.4 * hash1(i * 7.7));
    const sw = Math.sin(t * 1.35 - i * 0.42);
    const a0 = -Math.PI / 2 - 0.42 - q * 0.6 + sw * 0.035;
    const a1 = a0 - 0.42 - q * 0.2 + Math.sin(t * 1.35 - i * 0.42 - 0.8) * 0.12;
    const a2 = a1 - 0.18 + Math.sin(t * 1.35 - i * 0.42 - 1.6) * 0.18;
    const m1 = {x: root.x + Math.cos(a0) * L * 0.42, y: root.y + Math.sin(a0) * L * 0.42};
    const m2 = {x: m1.x + Math.cos(a1) * L * 0.36, y: m1.y + Math.sin(a1) * L * 0.36};
    const tip = {x: m2.x + Math.cos(a2) * L * 0.22, y: m2.y + Math.sin(a2) * L * 0.22};
    return {root, m1, m2, tip, w: 2.2 - q * 0.7};
  });
  const d = (r: (typeof rays)[number]) => `M${f1(r.root.x)},${f1(r.root.y)} C${f1(r.m1.x)},${f1(r.m1.y)} ${f1(r.m2.x)},${f1(r.m2.y)} ${f1(r.tip.x)},${f1(r.tip.y)}`;
  const samples = (r: (typeof rays)[number]) =>
    Array.from({length: 14}, (_, i) => {
      const s = i / 13;
      const a = (1 - s) ** 3;
      const b = 3 * (1 - s) ** 2 * s;
      const c = 3 * (1 - s) * s * s;
      const e = s ** 3;
      return {x: a * r.root.x + b * r.m1.x + c * r.m2.x + e * r.tip.x, y: a * r.root.y + b * r.m1.y + c * r.m2.y + e * r.tip.y};
    });
  const membranes = rays.slice(0, N - 1).map((a, i) => {
    const b = rays[i + 1];
    return `M${f1(a.root.x)},${f1(a.root.y)} Q${f1(a.m1.x)},${f1(a.m1.y)} ${f1((a.m1.x + a.m2.x) / 2)},${f1((a.m1.y + a.m2.y) / 2)} L${f1((b.m1.x + b.root.x) / 2)},${f1((b.m1.y + b.root.y) / 2)} L${f1(b.root.x)},${f1(b.root.y)}Z`;
  });
  return (
    <g opacity={k}>
      <defs>
        <linearGradient id={`cm-${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#b0142a" stopOpacity={0.5} />
          <stop offset="1" stopColor="#ff5466" stopOpacity={0.08} />
        </linearGradient>
      </defs>
      {membranes.map((m, i) => (
        <path key={`m${i}`} d={m} fill={`url(#cm-${uid})`} />
      ))}
      {rays.map((r, i) => (
        <g key={i}>
          <path d={d(r)} stroke="#ff2f46" strokeWidth={r.w * 2.6} fill="none" opacity={0.08 * light} strokeLinecap="round" />
          <path d={taper(samples(r), r.w * 1.25, 0.35)} fill={i % 3 === 1 ? '#c41a31' : '#dc2239'} />
          <path d={taper(samples(r).slice(0, 7), r.w * 0.4, 0.15)} fill="#ffb8c0" opacity={0.5 * light} />
        </g>
      ))}
    </g>
  );
};
