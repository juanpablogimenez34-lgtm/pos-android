// ALETA DORSAL 3D: ~170 radios que nacen en el borde dorsal real del rig. Cada radio se construye en
// 3D (dirección = dorso·cos a − avance·sen a, inclinado hacia la cola) y se proyecta, de modo que la
// aleta escorza y gira con el cuerpo. La onda viaja de la cabeza a la cola, independiente del cuerpo:
// φ = 2π·ondas·u − ω·t (con variación natural por radio).
import React from 'react';
import {hash1} from '../../engine/math';
import {depthAt, f1, Proj, project, Rig, V2, vadd, vmul} from './OarfishRig';

export type FinMotion = {waves: number; speed: number; amp: number};

export function finGeometry(rig: Rig, pr: Proj, m: FinMotion) {
  const fr = rig.frames;
  const n = 170;
  const bases: V2[] = [];
  const ctrls: V2[] = [];
  const tips: V2[] = [];
  const t = rig.params.t;
  for (let i = 0; i < n; i++) {
    const g = (0.004 + (i / (n - 1)) * 0.975) * (fr.length - 1);
    const j = Math.min(fr.length - 2, Math.floor(g));
    const s = g - j;
    const A = fr[j];
    const B = fr[j + 1];
    const p = vadd(vmul(A.p, 1 - s), vmul(B.p, s));
    const d = vadd(vmul(A.d, 1 - s), vmul(B.d, s));
    const h = vadd(vmul(A.h, 1 - s), vmul(B.h, s));
    const u = A.u + (B.u - A.u) * s;
    const half = depthAt(u) * 0.5 * 0.97;
    const base = vadd(p, vmul(d, half));
    const ph = 2 * Math.PI * m.waves * u - m.speed * t + hash1(i * 1.3) * 0.2;
    const a = 0.72 + Math.sin(ph) * m.amp;
    const L = (128 * (1 - 0.8 * u) + 12) * (0.82 + 0.18 * Math.cos(ph)) * (0.93 + 0.14 * hash1(i * 4.1));
    const dir = vadd(vmul(d, Math.cos(a)), vmul(h, -Math.sin(a)));
    const tip = vadd(base, vmul(dir, L));
    const ctrl = vadd(vadd(base, vmul(dir, L * 0.6)), vmul(h, -L * 0.22));
    bases.push(project(base, pr));
    ctrls.push(project(ctrl, pr));
    tips.push(project(tip, pr));
  }
  return {bases, ctrls, tips};
}

export const OarfishDorsalFin: React.FC<{g: ReturnType<typeof finGeometry>; uid: string; light: number; shadeFill: string}> = ({g, uid, light, shadeFill}) => {
  const {bases, ctrls, tips} = g;
  const membrane = `M${f1(bases[0].x)},${f1(bases[0].y)} ${tips.map((p) => `L${f1(p.x)},${f1(p.y)}`).join(' ')} ${bases
    .slice()
    .reverse()
    .map((p) => `L${f1(p.x)},${f1(p.y)}`)
    .join(' ')}Z`;
  let rays = '';
  for (let i = 0; i < bases.length; i++) rays += `M${f1(bases[i].x)},${f1(bases[i].y)} Q${f1(ctrls[i].x)},${f1(ctrls[i].y)} ${f1(tips[i].x)},${f1(tips[i].y)} `;
  const edge = tips.map((p, i) => `${i ? 'L' : 'M'}${f1(p.x)},${f1(p.y)}`).join(' ');
  return (
    <g>
      <defs>
        <linearGradient id={`fm-${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#7a0c1c" stopOpacity={0.8} />
          <stop offset="0.45" stopColor="#c8182c" stopOpacity={0.42} />
          <stop offset="1" stopColor="#ff5a6a" stopOpacity={0.18} />
        </linearGradient>
      </defs>
      <path d={membrane} fill={`url(#fm-${uid})`} />
      <path d={rays} stroke="#ff3b4e" strokeWidth={5} fill="none" opacity={0.12 * light} />
      <path d={rays} stroke="#ff4054" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <path d={rays} stroke="#ffb0b8" strokeWidth={0.9} fill="none" opacity={0.55 * light} strokeLinecap="round" />
      <path d={edge} stroke="#ffb0b8" strokeWidth={1.6} fill="none" opacity={0.55 * light + 0.1} />
      <path d={edge} stroke="#ff4a5c" strokeWidth={8} fill="none" opacity={0.12 * light} />
      {/* oscuridad / niebla a lo largo (misma rampa que el cuerpo) */}
      <path d={membrane} fill={shadeFill} />
      <path d={rays} stroke={shadeFill} strokeWidth={2.6} fill="none" />
    </g>
  );
};
