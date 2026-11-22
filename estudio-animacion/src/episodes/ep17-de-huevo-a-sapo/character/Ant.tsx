// Presa: hormiga pequeña (proporcionada al sapo juvenil), vista lateral. Marcha en trípode
// (tres patas apoyadas, tres en el aire), antenas que tantean y cuerpo de tres segmentos.
import React from 'react';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export const Ant: React.FC<{x: number; y: number; t: number; s?: number; dir?: 1 | -1; walking?: number; opacity?: number}> = ({x, y, t, s = 1, dir = 1, walking = 1, opacity = 1}) => {
  const ph = t * 14;
  const legs = [-1, 0, 1].flatMap((i) => [0, 1].map((side) => {
    const g = (i + side) % 2 === 0 ? 0 : Math.PI; // trípode alterno
    const sw = Math.sin(ph + g) * 4 * walking;
    const lift = Math.max(0, Math.cos(ph + g)) * 2.5 * walking;
    const hx = i * 4;
    const kx = hx + i * 4 + sw * 0.5;
    const fx = hx + i * 8 + sw;
    return {d: `M${hx},2 L${f1(kx)},${f1(-3 - lift)} L${f1(fx)},${f1(9 - lift)}`, far: side === 1};
  }));
  const ant = Math.sin(t * 9) * 3;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(dir * s)} ${f1(s)})`} opacity={opacity}>
      {legs.filter((l) => l.far).map((l, i) => <path key={`f${i}`} d={l.d} stroke="#2a120a" strokeWidth={1.1} fill="none" opacity={0.6} />)}
      <ellipse cx={-14} cy={-1} rx={8} ry={5.5} fill="#3a160c" />
      <ellipse cx={-6} cy={1} rx={2.2} ry={1.8} fill="#4a1e10" />
      <ellipse cx={1} cy={0} rx={5.5} ry={3} fill="#5a2412" />
      <ellipse cx={10} cy={-1} rx={4.2} ry={3.6} fill="#4a1c0e" />
      <circle cx={12} cy={-2} r={0.9} fill="#000" />
      <path d={`M12,-4 L17,${f1(-10 + ant)} L22,${f1(-6 + ant)}`} stroke="#2a120a" strokeWidth={0.9} fill="none" />
      <path d={`M-16,-4 C-12,-6 -9,-5 -8,-3`} stroke="#c8784a" strokeWidth={0.9} fill="none" opacity={0.6} />
      {legs.filter((l) => !l.far).map((l, i) => <path key={`n${i}`} d={l.d} stroke="#1e0c06" strokeWidth={1.3} fill="none" />)}
    </g>
  );
};
