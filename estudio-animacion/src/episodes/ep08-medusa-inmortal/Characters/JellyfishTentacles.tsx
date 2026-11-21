// TENTÁCULOS: finos, numerosos (la adulta tiene decenas) y cada uno con su propio movimiento:
// onda que viaja hacia la punta con fase propia, apertura retrasada tras cada contracción,
// arrastre opuesto a la dirección de nado, deriva por la corriente y recogida (retracción).
// Bulbos rojizos en la base y anillos de cnidocitos (células urticantes) a lo largo.
import React from 'react';
import {hash1, lerp} from '../../../engine/math';
import {contraction} from '../Animation/jellyMotion';
import {BellShape, bellPoints, JELLY} from './JellyfishBell';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export type TentacleParams = {
  t: number;
  n: number; // número de tentáculos
  len: number; // longitud base
  retract: number; // 0…1
  vLocal: {x: number; y: number}; // velocidad en coordenadas de la medusa
  current: number;
  alarm: number;
  pulsePhaseT: number; // tiempo para la onda de contracción (permite periodos distintos)
  period: number;
  glow: number;
  tissue: number;
};

function tentaclePts(s: BellShape, root: {a: number; x: number; y: number}, j: number, p: TentacleParams) {
  const K = 14;
  const L = p.len * (0.75 + 0.5 * hash1(j * 5.3)) * (1 - 0.92 * p.retract);
  const ph = hash1(j * 2.1) * Math.PI * 2;
  const out = Math.cos(root.a); // lado (−1 izq · +1 der)
  const pts: {x: number; y: number}[] = [];
  let x = root.x;
  let y = root.y;
  for (let k = 0; k <= K; k++) {
    const sN = k / K;
    // la contracción llega a cada tramo con retraso → los tentáculos se abren y se cierran en ola
    const cDel = contraction(p.pulsePhaseT - sN * 0.45, p.period);
    const flare = (0.55 * cDel + 0.2 * p.alarm) * out * (1 - sN) * (1 - p.retract);
    const wave = Math.sin(sN * 5.5 - p.t * (2.2 + p.alarm * 4) + ph) * (6 + 16 * sN) * (1 - 0.6 * p.retract);
    const drag = -p.vLocal.x * 0.4 * Math.pow(sN, 1.3);
    const dragY = -p.vLocal.y * 0.25 * Math.pow(sN, 1.2);
    const cur = p.current * 70 * sN * sN;
    if (k === 0) {
      pts.push({x, y});
      continue;
    }
    const seg = L / K;
    const ang = flare + 0.04 * out;
    x += Math.sin(ang) * seg + (wave - (pts.length > 1 ? 0 : 0)) * 0.12 + drag / K + cur / K;
    y += Math.cos(ang) * seg * (1 - 0.15 * cDel * (1 - sN)) + dragY / K;
    pts.push({x: x + wave * 0.35, y});
  }
  return pts;
}

const curve = (pts: {x: number; y: number}[]) => {
  let d = `M${f1(pts[0].x)},${f1(pts[0].y)}`;
  for (let i = 1; i < pts.length - 1; i++) d += ` Q${f1(pts[i].x)},${f1(pts[i].y)} ${f1((pts[i].x + pts[i + 1].x) / 2)},${f1((pts[i].y + pts[i + 1].y) / 2)}`;
  return d + ` L${f1(pts[pts.length - 1].x)},${f1(pts[pts.length - 1].y)}`;
};

/** Dibuja los tentáculos de un lado (`front` = delante de la campana). */
export const Tentacles: React.FC<{s: BellShape; p: TentacleParams; front: boolean}> = ({s, p, front}) => {
  const roots = bellPoints(s, p.n);
  const col = lerp(0, 1, p.tissue) > 0.5 ? JELLY.tissue : JELLY.rim;
  return (
    <g>
      {roots.map((r, j) => {
        if (r.front !== front) return null;
        const pts = tentaclePts(s, r, j, p);
        const d = curve(pts);
        const op = front ? 0.9 : 0.5;
        return (
          <g key={j} opacity={op}>
            <path d={d} stroke={JELLY.bell} strokeWidth={6.5} opacity={0.14 + 0.1 * p.glow} fill="none" strokeLinecap="round" />
            <path d={d} stroke={col} strokeWidth={2} opacity={0.85} fill="none" strokeLinecap="round" />
            {p.retract < 0.8 &&
              [4, 8, 12].map((k) => (pts[k] ? <circle key={k} cx={pts[k].x} cy={pts[k].y} r={1.8} fill="#ffffff" opacity={0.7} /> : null))}
            <ellipse cx={r.x} cy={r.y} rx={3.6} ry={3} fill={JELLY.bulb} opacity={0.85} />
          </g>
        );
      })}
    </g>
  );
};
