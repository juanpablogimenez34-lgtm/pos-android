// CAPAS ALETAS PARES: pectorales pequeñas en abanico (rojas, translúcidas) que baten, y pélvicas como
// radios rojos muy largos que se arrastran con una onda suave y terminan en un pequeño ensanchamiento.
import React from 'react';
import {f1, quad, taper, V} from './rig';
import {PAL} from './BodySkin';

/** Pectoral (coordenadas de la cabeza). `far` = la del lado lejano, más oscura. */
export const Pectoral: React.FC<{t: number; far?: boolean}> = ({t, far}) => {
  const base: V = far ? {x: 18, y: 30} : {x: 22, y: 34};
  const flap = Math.sin(t * 3.2 + (far ? 1 : 0)) * 0.22;
  const rays = Array.from({length: 7}, (_, i) => {
    const a = Math.PI * 0.82 + i * 0.07 + flap;
    const L = 46 - Math.abs(i - 2) * 5;
    const tip = {x: base.x + Math.cos(a) * L, y: base.y + Math.sin(a) * L};
    return quad(base, {x: (base.x + tip.x) / 2, y: (base.y + tip.y) / 2 - 4}, tip, 5);
  });
  const fan = `M${f1(base.x)},${f1(base.y)} ${rays.map((r) => `L${f1(r[5].x)},${f1(r[5].y)}`).join(' ')}Z`;
  return (
    <g opacity={far ? 0.55 : 0.95}>
      <path d={fan} fill={PAL.red} opacity={0.4} />
      {rays.map((r, i) => (
        <path key={i} d={taper(r, 2.4, 0.6)} fill={far ? PAL.redDeep : '#ff5a6a'} />
      ))}
    </g>
  );
};

/** Pélvicas: radios largos que nacen bajo la garganta (coordenadas de la cabeza). */
export const Pelvic: React.FC<{t: number; length?: number}> = ({t, length = 520}) => (
  <g>
    {[0, 1].map((k) => {
      const root: V = {x: 70 - k * 6, y: 50};
      const pts: V[] = Array.from({length: 18}, (_, i) => {
        const u = i / 17;
        return {x: root.x - u * length, y: root.y + u * (70 + k * 18) + Math.sin(t * 1.3 - u * 4 + k) * 10 * u};
      });
      const tip = pts[pts.length - 1];
      return (
        <g key={k} opacity={k ? 0.6 : 1}>
          <path d={taper(pts, 4, 1.4)} fill={k ? PAL.redDeep : PAL.red} />
          <ellipse cx={tip.x - 8} cy={tip.y + 2} rx={16} ry={5} fill={PAL.red} opacity={0.85} transform={`rotate(12 ${f1(tip.x)} ${f1(tip.y)})`} />
        </g>
      );
    })}
  </g>
);
