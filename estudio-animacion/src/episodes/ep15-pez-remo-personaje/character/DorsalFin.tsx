// CAPA ALETA DORSAL (segmentada): ~160 radios curvos e inclinados hacia atrás, membrana roja
// translúcida con degradado y bordes luminosos. La onda viaja de la cabeza a la cola:
// fase φ = 2π·ondas·u − ω·t; el radio se inclina y se estira con su fase (con variación natural).
import React from 'react';
import {hash1} from '../../../engine/math';
import {f1, OarRig, skinPoint, Spine, V} from './rig';

export const DorsalFin: React.FC<{s: Spine; r: OarRig; uid: string; light: number}> = ({s, r, uid, light}) => {
  const n = 160;
  const bases: V[] = [];
  const tips: V[] = [];
  const ctrls: V[] = [];
  for (let i = 0; i < n; i++) {
    const u = 0.004 + (i / (n - 1)) * 0.975;
    const b = skinPoint(s, u, -0.97);
    const b2 = skinPoint(s, u + 0.002, -0.97);
    // normal dorsal local
    const tx = b.x - b2.x;
    const ty = b.y - b2.y;
    const tl = Math.hypot(tx, ty) || 1;
    const nx = ty / tl;
    const ny = -tx / tl;
    const ph = 2 * Math.PI * r.finWaves * u - r.finSpeed * r.t + hash1(i * 1.3) * 0.2;
    const tilt = -0.72 + Math.sin(ph) * r.finAmp; // hacia atrás
    const len = (128 * (1 - 0.8 * Math.pow(u, 1.0)) + 12) * (0.82 + 0.18 * Math.cos(ph)) * (0.93 + 0.14 * hash1(i * 4.1));
    const c = Math.cos(tilt);
    const sn = Math.sin(tilt);
    // rotar la normal hacia la cola (−tangente)
    const dx = nx * c + (tx / tl) * sn;
    const dy = ny * c + (ty / tl) * sn;
    const tip = {x: b.x + dx * len, y: b.y + dy * len};
    const ctrl = {x: b.x + dx * len * 0.6 + (tx / tl) * len * 0.22, y: b.y + dy * len * 0.6 + (ty / tl) * len * 0.22};
    bases.push(b);
    tips.push(tip);
    ctrls.push(ctrl);
  }
  const membrane = `M${f1(bases[0].x)},${f1(bases[0].y)} ${tips.map((p) => `L${f1(p.x)},${f1(p.y)}`).join(' ')} ${bases
    .slice()
    .reverse()
    .map((p) => `L${f1(p.x)},${f1(p.y)}`)
    .join(' ')}Z`;
  let rays = '';
  for (let i = 0; i < n; i++) rays += `M${f1(bases[i].x)},${f1(bases[i].y)} Q${f1(ctrls[i].x)},${f1(ctrls[i].y)} ${f1(tips[i].x)},${f1(tips[i].y)} `;
  const edge = tips.map((p, i) => `${i ? 'L' : 'M'}${f1(p.x)},${f1(p.y)}`).join(' ');
  return (
    <g>
      <defs>
        <linearGradient id={`df-${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#7a0c1c" stopOpacity={0.8} />
          <stop offset="0.45" stopColor="#c8182c" stopOpacity={0.42} />
          <stop offset="1" stopColor="#ff5a6a" stopOpacity={0.18} />
        </linearGradient>
      </defs>
      <path d={membrane} fill={`url(#df-${uid})`} />
      <path d={rays} stroke="#ff3b4e" strokeWidth={5} fill="none" opacity={0.12 * light} />
      <path d={rays} stroke="#ff4054" strokeWidth={2.6} fill="none" opacity={0.95} strokeLinecap="round" />
      <path d={rays} stroke="#ffb0b8" strokeWidth={0.9} fill="none" opacity={0.55 * light} strokeLinecap="round" />
      <path d={rays} stroke="#5a0814" strokeWidth={0.8} fill="none" opacity={0.5} transform="translate(0.8 0.6)" />
      <path d={edge} stroke="#ffb0b8" strokeWidth={1.6} fill="none" opacity={0.55 * light + 0.15} />
      <path d={edge} stroke="#ff4a5c" strokeWidth={8} fill="none" opacity={0.12 * light} />
    </g>
  );
};
