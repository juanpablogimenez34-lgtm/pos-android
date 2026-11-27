// HORMIGA EN VISTA SUPERIOR (perspectiva cenital para colonias y el conflicto colectivo).
// Mismo sistema de marcha trípode que la vista lateral (fase por distancia recorrida → pies fijos en el suelo),
// IK de dos huesos en el plano con la rodilla hacia fuera, antenas acodadas con exploración y contacto,
// mandíbulas que se abren lateralmente, gáster con flexión lateral. `detail` reduce el dibujo de las lejanas (LOD).
import React from 'react';
import {clamp, lerp, mixColor} from '../../../engine/math';
import {AntSpec, V} from './species';

const f1 = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);
export type TopPose = {x: number; y: number; heading: number; scale: number; t: number; dist: number; mand?: number; scan?: number; bend?: number; detail?: number; seed?: number; carry?: string; sting?: number};

// planta: posición lateral de los pies y de las coxas (unidades locales)
const LEG_X = [150, 20, -110];
const FOOT = (s: AntSpec) => [[s.legs[0].rest + 40, 330], [s.legs[1].rest, 400], [s.legs[2].rest - 40, 360]];

export const AntTop: React.FC<{spec: AntSpec; p: TopPose; uid: string}> = ({spec: S, p: P}) => {
  const C = S.colors;
  const d = P.detail ?? 1;
  const seed = P.seed ?? 0;
  const t = P.t;
  const feet = FOOT(S);
  const legs: React.ReactNode[] = [];
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      // trípode: A = L1 (side +1, i 0), R2 (side −1, i 1), L3 (side +1, i 2)
      const groupA = side > 0 ? i !== 1 : i === 1;
      const duty = 0.56;
      const c = P.dist / S.stride + (groupA ? 0 : 0.5) + seed * 0.07;
      const f = c - Math.floor(c);
      const half = S.stride * duty * 0.5;
      const fx = f < duty ? feet[i][0] + half - (f / duty) * 2 * half : feet[i][0] - half + ((f - duty) / (1 - duty)) * 2 * half;
      const lift = f < duty ? 0 : Math.sin(Math.PI * (f - duty) / (1 - duty));
      const foot = {x: fx, y: side * feet[i][1] * (1 - lift * 0.08)};
      const base = {x: LEG_X[i], y: side * 55};
      const A = {x: base.x + (i === 0 ? 30 : i === 2 ? -30 : 0), y: side * 95};
      const a = S.legs[i].femur;
      const b = S.legs[i].tibia + S.legs[i].tarsus * 0.6;
      const dx = foot.x - A.x;
      const dy = foot.y - A.y;
      const dd = clamp(Math.hypot(dx, dy), Math.abs(a - b) + 1, a + b - 1);
      const th = Math.atan2(dy, dx);
      const al = Math.acos(clamp((a * a + dd * dd - b * b) / (2 * a * dd), -1, 1));
      // rodilla hacia fuera del cuerpo
      const k1 = {x: A.x + Math.cos(th + al) * a, y: A.y + Math.sin(th + al) * a};
      const k2 = {x: A.x + Math.cos(th - al) * a, y: A.y + Math.sin(th - al) * a};
      const knee = Math.abs(k1.y) > Math.abs(k2.y) ? k1 : k2;
      const col = mixColor(C.leg, '#000', lift * 0.15);
      legs.push(
        <g key={`${side}${i}`}>
          <path d={`M${base.x} ${base.y}L${f1(A.x)} ${f1(A.y)}L${f1(knee.x)} ${f1(knee.y)}L${f1(foot.x)} ${f1(foot.y)}`} stroke={col} strokeWidth={d > 0.5 ? 22 : 26} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          {d > 0.5 && <circle cx={f1(knee.x)} cy={f1(knee.y)} r={14} fill={mixColor(C.leg, C.legLight, 0.2)} />}
        </g>,
      );
    }
  }
  const scan = P.scan ?? 0.6;
  const mand = clamp(P.mand ?? 0);
  const antenna = (side: number) => {
    const b = {x: S.head.c.x + 80, y: side * 50};
    const a1 = side * (0.55 + Math.sin(t * 1.7 + seed + side) * 0.25 * scan);
    const e = {x: b.x + Math.cos(a1) * S.ant.scape, y: b.y + Math.sin(a1) * S.ant.scape};
    const a2 = a1 - side * (1.0 + Math.sin(t * 2.4 + seed * 2 + side) * 0.35 * scan);
    const tip = {x: e.x + Math.cos(a2) * S.ant.seg * S.ant.n, y: e.y + Math.sin(a2) * S.ant.seg * S.ant.n};
    const mid = {x: (e.x + tip.x) / 2 + Math.cos(a2 + side * 1.57) * 18, y: (e.y + tip.y) / 2 + Math.sin(a2 + side * 1.57) * 18};
    return {b, e, mid, tip};
  };
  const bend = P.bend ?? 0;
  const G = S.gaster;
  const hx = S.head.c.x;
  return (
    <g transform={`translate(${f1(P.x)} ${f1(P.y)}) rotate(${f1((P.heading * 180) / Math.PI)}) scale(${f1(P.scale * 10000) / 10000})`}>
      <ellipse cx={-120} cy={30} rx={620} ry={150} fill="#1a1006" opacity={0.18} />
      {legs}
      {/* gáster con flexión lateral */}
      <g transform={`rotate(${f1(bend * 40)} ${G.joint.x} 0)`}>
        <ellipse cx={G.c.x} cy={0} rx={G.rx} ry={G.ry * 0.95} fill={C.gaster} stroke="#000" strokeWidth={4} />
        {d > 0.5 && [0.45, 0.1, -0.25].map((u) => <path key={u} d={`M${f1(G.c.x + G.rx * u)} ${f1(-G.ry * 0.85)}Q${f1(G.c.x + G.rx * u - 30)} 0 ${f1(G.c.x + G.rx * u)} ${f1(G.ry * 0.85)}`} stroke={mixColor(C.gaster, C.gasterLight, 0.6)} strokeWidth={6} fill="none" opacity={0.7} />)}
        <ellipse cx={G.c.x + G.rx * 0.15} cy={-G.ry * 0.3} rx={G.rx * 0.5} ry={G.ry * 0.22} fill="#ffffff" opacity={0.2} />
        {S.sting && (P.sting ?? 0) > 0.05 && <path d={`M${f1(G.c.x - G.rx + 6)} -8L${f1(G.c.x - G.rx - 30 - (P.sting ?? 0) * 50)} 0L${f1(G.c.x - G.rx + 6)} 8Z`} fill="#1a0a06" />}
      </g>
      {S.waist.map((w, k) => <ellipse key={k} cx={w.c.x} cy={0} rx={w.rx} ry={w.ry * 0.8} fill={C.body} stroke="#000" strokeWidth={3} />)}
      <ellipse cx={20} cy={0} rx={200} ry={78} fill={C.body} stroke="#000" strokeWidth={4} />
      <ellipse cx={60} cy={-22} rx={110} ry={20} fill="#ffffff" opacity={0.18} />
      {/* mandíbulas (apertura lateral) */}
      {[1, -1].map((sd) => {
        const a = sd * (0.25 + mand * 0.7);
        const b = {x: hx + S.head.rx * 0.85, y: sd * 40};
        const tip = {x: b.x + Math.cos(a) * S.mand.len, y: b.y + Math.sin(a) * S.mand.len};
        const tip2 = {x: tip.x + Math.cos(a - sd * 1.9) * S.mand.len * 0.55, y: tip.y + Math.sin(a - sd * 1.9) * S.mand.len * 0.55};
        return <path key={sd} d={`M${f1(b.x)} ${f1(b.y - sd * 14)}L${f1(tip.x)} ${f1(tip.y)}L${f1(tip2.x)} ${f1(tip2.y)}L${f1(b.x)} ${f1(b.y + sd * 10)}Z`} fill={C.mand} stroke="#000" strokeWidth={3} />;
      })}
      {/* cabeza y ojos */}
      <ellipse cx={hx} cy={0} rx={S.head.rx * 0.95} ry={S.head.ry * 1.05} fill={C.body} stroke="#000" strokeWidth={4} />
      <ellipse cx={hx - 10} cy={-S.head.ry * 0.4} rx={S.head.rx * 0.45} ry={S.head.ry * 0.18} fill="#ffffff" opacity={0.18} />
      {[1, -1].map((sd) => <ellipse key={sd} cx={S.eye.c.x - 10} cy={sd * S.head.ry * 0.82} rx={S.eye.rx} ry={S.eye.ry * 0.7} fill={C.eye} />)}
      {/* carga transportada entre las mandíbulas */}
      {P.carry && <ellipse cx={hx + S.head.rx + S.mand.len * 0.7} cy={0} rx={70} ry={55} fill={P.carry} stroke="#5a3a10" strokeWidth={4} />}
      {/* antenas */}
      {[1, -1].map((sd) => {
        const A = antenna(sd);
        return <path key={sd} d={`M${f1(A.b.x)} ${f1(A.b.y)}L${f1(A.e.x)} ${f1(A.e.y)}Q${f1(A.mid.x)} ${f1(A.mid.y)} ${f1(A.tip.x)} ${f1(A.tip.y)}`} stroke={C.leg} strokeWidth={d > 0.5 ? 14 : 18} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};
/** Punta de una antena en el mundo (para contactos de comunicación). */
export function antennaTip(spec: AntSpec, P: TopPose, side: 1 | -1): V {
  const scan = P.scan ?? 0.6;
  const seed = P.seed ?? 0;
  const t = P.t;
  const b = {x: spec.head.c.x + 80, y: side * 50};
  const a1 = side * (0.55 + Math.sin(t * 1.7 + seed + side) * 0.25 * scan);
  const e = {x: b.x + Math.cos(a1) * spec.ant.scape, y: b.y + Math.sin(a1) * spec.ant.scape};
  const a2 = a1 - side * (1.0 + Math.sin(t * 2.4 + seed * 2 + side) * 0.35 * scan);
  const tip = {x: e.x + Math.cos(a2) * spec.ant.seg * spec.ant.n, y: e.y + Math.sin(a2) * spec.ant.seg * spec.ant.n};
  const c = Math.cos(P.heading);
  const s = Math.sin(P.heading);
  return {x: P.x + (tip.x * c - tip.y * s) * P.scale, y: P.y + (tip.x * s + tip.y * c) * P.scale};
}
export const _k = {lerp};
