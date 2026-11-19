// Pequeña araña ambiental (sin especie concreta): cefalotórax + abdomen, ocho patas de tres
// segmentos visibles con las "rodillas" altas, pedipalpos, ojos pequeños y abdomen con dibujo.
import React from 'react';
import {clamp, mixColor} from '../../../engine/math';
import {add, cross, dot, ellipsoidSilhouette, ik3, norm, project, scl, sub, V3, View} from '../anatomy/proj';
import {f1, Item} from '../anatomy/render';
import {LegRest} from '../anatomy/locomotion';

/** Apoyos de las 8 patas (adelante, lateral) y grupo de la marcha alterna. */
export const SPIDER_LEGS: (LegRest & {hip: V3; l: [number, number, number]})[] = [
  {fwd: 22, side: 17, group: 0, hip: [8, 4, 3.5], l: [12, 12, 11]},
  {fwd: 22, side: -17, group: 1, hip: [8, 4, -3.5], l: [12, 12, 11]},
  {fwd: 9, side: 24, group: 1, hip: [6, 4, 4.2], l: [11, 11, 10]},
  {fwd: 9, side: -24, group: 0, hip: [6, 4, -4.2], l: [11, 11, 10]},
  {fwd: -4, side: 23, group: 0, hip: [4, 4, 4.2], l: [10, 10, 9]},
  {fwd: -4, side: -23, group: 1, hip: [4, 4, -4.2], l: [10, 10, 9]},
  {fwd: -15, side: 19, group: 1, hip: [2, 4, 3.6], l: [12, 12, 11]},
  {fwd: -15, side: -19, group: 0, hip: [2, 4, -3.6], l: [12, 12, 11]},
];

export type SpiderPose = {pos: V3; fwd: V3; up: V3; scale: number; feet: V3[]; frontRaise: number; opacity: number};

export function spiderItems(view: View, pose: SpiderPose, uid: string): Item[] {
  const k = pose.scale;
  const fwd = norm(pose.fwd);
  const up = norm(sub(pose.up, scl(fwd, dot(pose.up, fwd))));
  const side = cross(fwd, up);
  const W = (l: V3): V3 => add(pose.pos, add(add(scl(fwd, l[0] * k), scl(up, l[1] * k)), scl(side, l[2] * k)));
  const Wd = (l: V3): V3 => add(add(scl(fwd, l[0]), scl(up, l[1])), scl(side, l[2]));
  const P = (p: V3) => project(view, p);
  const items: Item[] = [];
  const push = (z: number, key: string, node: React.ReactNode) => items.push({z, key: `${uid}-${key}`, node: <g key={`${uid}-${key}`} opacity={pose.opacity}>{node}</g>});
  const blob = (key: string, c: V3, r: V3, base: string, light: string, dark: string) => {
    const e = ellipsoidSilhouette(view, W(c), [Wd([r[0] * k, 0, 0]), Wd([0, r[1] * k, 0]), Wd([0, 0, r[2] * k])]);
    const gid = `${uid}-${key}`;
    push(e.z, key, (
      <>
        <defs>
          <radialGradient id={gid} gradientUnits="userSpaceOnUse" cx={f1(e.cx - e.rx * 0.3)} cy={f1(e.cy - e.ry * 0.4)} r={f1(Math.max(e.rx, e.ry) * 1.3)}>
            <stop offset="0" stopColor={light} />
            <stop offset="0.5" stopColor={base} />
            <stop offset="1" stopColor={dark} />
          </radialGradient>
        </defs>
        <ellipse cx={f1(e.cx)} cy={f1(e.cy)} rx={f1(e.rx)} ry={f1(e.ry)} transform={`rotate(${e.deg.toFixed(2)} ${f1(e.cx)} ${f1(e.cy)})`} fill={`url(#${gid})`} stroke="#1c120a" strokeWidth={0.5} />
      </>
    ));
    return e;
  };
  const ab = blob('ab', [-8, 7, 0], [8.5, 6.2, 6.8], '#6e4d31', '#b08a5c', '#2a1a0e');
  // dibujo del abdomen: banda central con chevrones
  {
    const pts = [-0.75, -0.4, -0.05, 0.3, 0.6].map((x) => P(W([-8 + 8.5 * x, 7 + 6.2 * Math.sqrt(1 - x * x) * 0.98, 0])));
    const chev: React.ReactNode[] = [];
    [-0.55, -0.15, 0.25].forEach((x, i) => {
      const a = P(W([-8 + 8.5 * x - 1.5, 7 + 5.4, 3.2]));
      const b = P(W([-8 + 8.5 * x, 7 + 6.1, 0]));
      const c = P(W([-8 + 8.5 * x - 1.5, 7 + 5.4, -3.2]));
      chev.push(<path key={i} d={`M${f1(a.x)},${f1(a.y)}L${f1(b.x)},${f1(b.y)}L${f1(c.x)},${f1(c.y)}`} stroke="#2a190c" strokeWidth={0.9 * k} fill="none" opacity={0.7} />);
    });
    const vis = dot(up, [view.M[2][0], view.M[2][1], view.M[2][2]]) > -0.2;
    if (vis) push(ab.z + 0.2, 'abm', (
      <>
        <path d={'M' + pts.map((q) => `${f1(q.x)},${f1(q.y)}`).join('L')} stroke="#d0ad78" strokeWidth={2.2 * k} strokeLinecap="round" fill="none" opacity={0.45} />
        {chev}
      </>
    ));
  }
  const ce = blob('ce', [6, 5, 0], [6.5, 3.8, 5.2], '#5c3d24', '#9c7550', '#22150b');
  // ojos (pequeños, en la parte frontal del cefalotórax)
  const eyes: React.ReactNode[] = [];
  for (const [x, y, z, r] of [[11.5, 7.2, 1.4, 0.9], [11.5, 7.2, -1.4, 0.9], [10.5, 7.9, 2.6, 0.6], [10.5, 7.9, -2.6, 0.6]] as [number, number, number, number][]) {
    const q = P(W([x, y, z]));
    eyes.push(<circle key={`${x}${z}`} cx={f1(q.x)} cy={f1(q.y)} r={f1(r * k)} fill="#0c0806" />);
  }
  push(ce.z + 0.3, 'eyes', <>{eyes}</>);
  // pedipalpos
  for (const sg of [1, -1]) {
    const a = P(W([11, 3.5, 2 * sg]));
    const b = P(W([15, 2.5 + 2.5 * pose.frontRaise, 3.5 * sg]));
    push((a.z + b.z) / 2, `pp${sg}`, <path d={`M${f1(a.x)},${f1(a.y)}L${f1(b.x)},${f1(b.y)}`} stroke="#3d2716" strokeWidth={1.5 * k} strokeLinecap="round" />);
  }
  // patas: rodilla alta (polo hacia arriba), metatarso + tarso hasta el pie apoyado
  SPIDER_LEGS.forEach((lg, i) => {
    const sg = lg.side > 0 ? 1 : -1;
    const hip = W(lg.hip);
    let foot = pose.feet[i];
    if (i < 2 && pose.frontRaise > 0.01) {
      // reacción a la vibración: patas delanteras levantadas y abiertas
      const raised = W([22, 18, 14 * sg]);
      foot = add(scl(foot, 1 - clamp(pose.frontRaise)), scl(raised, clamp(pose.frontRaise)));
    }
    const out = norm(sub(foot, hip));
    const ankle = sub(foot, scl(norm(add(scl(out, 0.6), scl(up, -0.8))), -lg.l[2] * k * -1));
    const knee = ik3(hip, ankle, lg.l[0] * k, lg.l[1] * k, add(scl(up, 1.4), scl(side, 0.3 * sg)));
    const ph = P(hip);
    const pk = P(knee);
    const pa = P(ankle);
    const pf = P(foot);
    const band = mixColor('#4a321e', '#c39a68', 0.5);
    push((ph.z + pk.z + pa.z) / 3, `lg${i}`, (
      <>
        <path d={`M${f1(ph.x)},${f1(ph.y)}L${f1(pk.x)},${f1(pk.y)}`} stroke="#4a311c" strokeWidth={1.7 * k} strokeLinecap="round" />
        <path d={`M${f1(pk.x)},${f1(pk.y)}L${f1(pa.x)},${f1(pa.y)}`} stroke="#3f2917" strokeWidth={1.35 * k} strokeLinecap="round" />
        <path d={`M${f1(pa.x)},${f1(pa.y)}L${f1(pf.x)},${f1(pf.y)}`} stroke="#352312" strokeWidth={1.0 * k} strokeLinecap="round" />
        <circle cx={f1(pk.x)} cy={f1(pk.y)} r={0.9 * k} fill={band} />
        <circle cx={f1(pa.x)} cy={f1(pa.y)} r={0.7 * k} fill={band} />
      </>
    ));
  });
  return items;
}
