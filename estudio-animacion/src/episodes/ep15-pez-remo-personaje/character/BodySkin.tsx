// CAPA CUERPO: silueta en cinta, sombreado volumétrico (dorso azul acero → flancos plateados →
// vientre perlado), irisación azul-violeta que se desliza, escamas dibujadas SOBRE la columna (se
// deforman con el cuerpo), manchas oscuras irregulares, línea lateral, luz de borde y brillos.
import React from 'react';
import {hash1} from '../../../engine/math';
import {f1, NB, skinPoint, Spine, V} from './rig';

export const PAL = {navy: '#16234a', steel: '#5d74b8', blue: '#8fa4dc', silver: '#dbe4ee', pearl: '#f3f7fb', lav: '#c8c4ec', red: '#e5293b', redDeep: '#8a0f20', pink: '#f08a98', rim: '#9fe8ff', spot: '#1c2442'};

export const outlinePath = (s: Spine) => {
  const top: V[] = [];
  const bot: V[] = [];
  for (let i = 0; i < NB; i++) {
    const u = s.u[i];
    top.push(skinPoint(s, u, -1));
    bot.push(skinPoint(s, u, 1));
  }
  const tail = s.pts[NB - 1];
  return `M${f1(top[0].x + 6)},${f1(top[0].y)} ${top.map((p) => `L${f1(p.x)},${f1(p.y)}`).join(' ')} Q${f1(tail.x - 26)},${f1(tail.y)} ${f1(bot[NB - 1].x)},${f1(bot[NB - 1].y)} ${bot
    .slice()
    .reverse()
    .map((p) => `L${f1(p.x)},${f1(p.y)}`)
    .join(' ')} L${f1(bot[0].x + 6)},${f1(bot[0].y)}Z`;
};

const line = (s: Spine, v: number, u0 = 0, u1 = 1, n = 60) =>
  Array.from({length: n + 1}, (_, i) => {
    const p = skinPoint(s, u0 + ((u1 - u0) * i) / n, v);
    return `${i ? 'L' : 'M'}${f1(p.x)},${f1(p.y)}`;
  }).join(' ');

export const BodySkin: React.FC<{s: Spine; t: number; uid: string; light: number; length: number}> = ({s, t, uid, light, length}) => {
  const body = outlinePath(s);
  // escamas: filas a lo largo, arcos que se solapan hacia la cola
  const rows = [-0.62, -0.31, 0, 0.31, 0.62];
  const scaleRows = rows.map((v, r) => {
    let d = '';
    const n = Math.floor(length / 15);
    for (let j = 0; j < n; j++) {
      const u = (j + (r % 2) * 0.5) / n;
      if (u > 0.97) break;
      const a = skinPoint(s, u, v - 0.16);
      const b = skinPoint(s, u, v + 0.16);
      const back = skinPoint(s, u + 9 / length, v);
      d += `M${f1(a.x)},${f1(a.y)} Q${f1(back.x)},${f1(back.y)} ${f1(b.x)},${f1(b.y)} `;
    }
    return d;
  });
  // manchas oscuras irregulares (sobre todo en la mitad superior y delantera)
  let spots = '';
  for (let i = 0; i < 230; i++) {
    const u = 0.02 + Math.pow(hash1(i * 3.7), 1.15) * 0.9;
    const v = -0.5 + hash1(i * 5.3) * 0.75;
    const p = skinPoint(s, u, v);
    const sz = (1.8 + hash1(i * 9.1) * 3.6) * (1 - u * 0.6);
    const rx = sz * (1.2 + 2.2 * hash1(i * 2.2));
    const ry = sz * (0.4 + 0.4 * hash1(i * 6.6));
    spots += `M${f1(p.x - rx)},${f1(p.y)} a${f1(rx)},${f1(ry)} 0 1,0 ${f1(2 * rx)},0 a${f1(rx)},${f1(ry)} 0 1,0 ${f1(-2 * rx)},0 `;
  }
  const shift = ((t * 70) % 600).toFixed(1);
  return (
    <g>
      <defs>
        <linearGradient id={`bs-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={PAL.navy} />
          <stop offset="0.1" stopColor="#2c3f86" />
          <stop offset="0.24" stopColor={PAL.steel} />
          <stop offset="0.42" stopColor="#b8c8f0" />
          <stop offset="0.55" stopColor={PAL.silver} />
          <stop offset="0.78" stopColor={PAL.lav} />
          <stop offset="1" stopColor={PAL.pearl} />
        </linearGradient>
        <linearGradient id={`bi-${uid}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="-600" y2="0" spreadMethod="repeat" gradientTransform={`translate(${shift} 0)`}>
          <stop offset="0" stopColor="#7fa8ff" stopOpacity={0.0} />
          <stop offset="0.25" stopColor="#8f7cff" stopOpacity={0.55} />
          <stop offset="0.5" stopColor="#7fe8ff" stopOpacity={0.15} />
          <stop offset="0.75" stopColor="#c89cff" stopOpacity={0.5} />
          <stop offset="1" stopColor="#7fa8ff" stopOpacity={0.0} />
        </linearGradient>
        <linearGradient id={`bo-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000a20" stopOpacity={0.55} />
          <stop offset="0.12" stopColor="#000a20" stopOpacity={0} />
          <stop offset="0.85" stopColor="#000a20" stopOpacity={0} />
          <stop offset="1" stopColor="#000a20" stopOpacity={0.35} />
        </linearGradient>
        <clipPath id={`bc-${uid}`}>
          <path d={body} />
        </clipPath>
      </defs>
      <path d={body} fill={`url(#bs-${uid})`} />
      <g clipPath={`url(#bc-${uid})`}>
        <path d={body} fill={`url(#bi-${uid})`} style={{mixBlendMode: 'screen'}} opacity={0.95 * light} />
        {scaleRows.map((d, i) => (
          <g key={i}>
            <path d={d} stroke="#0c1838" strokeWidth={1.4} fill="none" opacity={0.28} transform="translate(1.4 1.2)" />
            <path d={d} stroke="#ffffff" strokeWidth={1.2} fill="none" opacity={0.32 * light + 0.08} />
          </g>
        ))}
        <path d={spots} fill={PAL.spot} opacity={0.62} />
        {/* línea lateral */}
        <path d={line(s, 0.05, 0.01, 0.96)} stroke="#e8f4ff" strokeWidth={1.8} fill="none" opacity={0.55} />
        {/* brillo especular amplio + destellos que viajan */}
        <path d={line(s, -0.42, 0, 0.9)} stroke="#ffffff" strokeWidth={12} fill="none" opacity={0.18 * light} strokeLinecap="round" />
        <path d={line(s, -0.38, 0, 0.9)} stroke="#ffffff" strokeWidth={5} fill="none" opacity={0.75 * light} strokeLinecap="round" strokeDasharray="70 260" strokeDashoffset={f1(-t * 220)} />
        {/* oclusión ambiental en el dorso (bajo la aleta) y el vientre */}
        <path d={body} fill={`url(#bo-${uid})`} />
      </g>
      {/* luz de borde (contraluz azul) */}
      <path d={line(s, -1, 0, 0.98)} stroke={PAL.rim} strokeWidth={10} fill="none" opacity={0.16 * light} strokeLinecap="round" />
      <path d={line(s, -1, 0, 0.98)} stroke={PAL.rim} strokeWidth={2.5} fill="none" opacity={0.6 * light} strokeLinecap="round" />
      <path d={line(s, 1, 0, 0.98)} stroke="#e8f0ff" strokeWidth={2} fill="none" opacity={0.45 * light} />
      {/* contorno abierto (sin el borde frontal, que queda bajo la cabeza) */}
      <path d={`${line(s, -1, 0.02, 1)} ${line(s, 1, 0.02, 1).replace(/^M/, "M")}`} fill="none" stroke="#0a1430" strokeWidth={1.6} opacity={0.6} />
    </g>
  );
};
