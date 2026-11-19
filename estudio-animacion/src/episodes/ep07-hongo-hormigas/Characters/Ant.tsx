// Hormiga carpintera (Camponotus rufipes) en 3D ligero proyectado a SVG.
// Cabeza con mandíbulas articuladas y ojos compuestos, antenas acodadas (escapo + funículo),
// mesosoma (pronoto + propodeo), pecíolo con nodo, gáster segmentado con brillo, 6 patas con IK.
// Capas del hongo sobre el hospedador (tras la muerte): filamentos blancos en las articulaciones,
// tallo (estroma) que sale de detrás de la cabeza y estructura fértil lateral (ascoma).
import React from 'react';
import {clamp, hash1, lerp, mixColor, smoothPath, Vec} from '../../../engine/math';
import {add, cross, dot, ellipsoidSilhouette, ik3, M3, mm, mul, norm, project, Ry, Rz, scl, sub, V3, View} from '../Animation/proj';
import {f1, Item} from '../Animation/render';
import {AntSpec} from './antSpec';

export type AntPose = {
  pos: V3; // centro del mesosoma (mundo)
  fwd: V3;
  up: V3;
  /** Pies en el mundo (L1,R1,L2,R2,L3,R3); null = postura libre (pata recogida). */
  feet: (V3 | null)[];
  antenna: {yaw: number; pitch: number; elbow: number}[]; // izquierda, derecha
  mandible: number; // 0 cerradas · 1 abiertas
  headYaw: number;
  headPitch: number;
  gasterPitch: number;
  dead: number; // 0–1 (color apagado, patas flexionadas)
  hyphae: number; // 0–1 filamentos blancos en las articulaciones
  stalk: number; // 0–1 longitud del tallo fúngico
  ascoma: number; // 0–1 estructura fértil lateral
  stalkDir: V3; // dirección de crecimiento del tallo (mundo)
  opacity: number;
  t: number;
};

const LEG_HIPS: {hip: V3; femur: number; tibia: number; tarsus: number}[] = [
  {hip: [17, -2, 3], femur: 15, tibia: 15, tarsus: 12},
  {hip: [17, -2, -3], femur: 15, tibia: 15, tarsus: 12},
  {hip: [7, -2, 4], femur: 15, tibia: 16, tarsus: 12},
  {hip: [7, -2, -4], femur: 15, tibia: 16, tarsus: 12},
  {hip: [1, -2, 4], femur: 18, tibia: 19, tarsus: 14},
  {hip: [1, -2, -4], femur: 18, tibia: 19, tarsus: 14},
];

export function antItems(view: View, spec: AntSpec, pose: AntPose, uid: string, zMap?: (z: number) => number): {items: Item[]; headFront: V3; stalkTop: V3 | null; ascoma: V3 | null} {
  const k = spec.scale;
  const fwd = norm(pose.fwd);
  const up = norm(sub(pose.up, scl(fwd, dot(pose.up, fwd))));
  const side = cross(fwd, up);
  const W = (l: V3): V3 => add(pose.pos, add(add(scl(fwd, l[0] * k), scl(up, l[1] * k)), scl(side, l[2] * k)));
  const Wd = (l: V3): V3 => add(add(scl(fwd, l[0]), scl(up, l[1])), scl(side, l[2]));
  const P = (p: V3) => project(view, p);
  const camZ = (d: V3) => mul(view.M, d)[2];
  const dead = clamp(pose.dead);
  const CC = spec.colors;
  const C = (c: string) => mixColor(c, '#5a554c', dead * 0.35);
  const items: Item[] = [];
  const zz = (z: number) => (zMap ? zMap(z) : z);
  const push = (z: number, key: string, node: React.ReactNode) => items.push({z: zz(z), key: `${uid}-${key}`, node: <g key={`${uid}-${key}`} opacity={pose.opacity}>{node}</g>});

  const blob = (key: string, c: V3, r: V3, base: string, light: string, rot: M3 | null = null, zOff = 0, gloss = 0.5) => {
    const ax: [V3, V3, V3] = rot
      ? [Wd(mul(rot, [r[0] * k, 0, 0])), Wd(mul(rot, [0, r[1] * k, 0])), Wd(mul(rot, [0, 0, r[2] * k]))]
      : [Wd([r[0] * k, 0, 0]), Wd([0, r[1] * k, 0]), Wd([0, 0, r[2] * k])];
    const e = ellipsoidSilhouette(view, W(c), ax);
    const gid = `${uid}-${key}-g`;
    push(e.z + zOff, key, (
      <>
        <defs>
          <radialGradient id={gid} gradientUnits="userSpaceOnUse" cx={f1(e.cx - e.rx * 0.32)} cy={f1(e.cy - e.ry * 0.42)} r={f1(Math.max(e.rx, e.ry) * 1.3)}>
            <stop offset="0" stopColor={C(light)} />
            <stop offset="0.35" stopColor={C(mixColor(base, light, 0.25))} />
            <stop offset="1" stopColor={C(base)} />
          </radialGradient>
        </defs>
        <ellipse cx={f1(e.cx)} cy={f1(e.cy)} rx={f1(e.rx)} ry={f1(e.ry)} transform={`rotate(${e.deg.toFixed(2)} ${f1(e.cx)} ${f1(e.cy)})`} fill={`url(#${gid})`} stroke="#0a0908" strokeWidth={0.5} />
        {/* brillo discreto del exoesqueleto */}
        <ellipse cx={f1(e.cx - e.rx * 0.3)} cy={f1(e.cy - e.ry * 0.38)} rx={f1(e.rx * 0.32)} ry={f1(e.ry * 0.16)} transform={`rotate(${e.deg.toFixed(2)} ${f1(e.cx)} ${f1(e.cy)})`} fill="#ffffff" opacity={gloss * 0.35 * (1 - dead * 0.7)} />
      </>
    ));
    return e;
  };
  const surf = (c: V3, r: V3, x: number, y: number, z: number): V3 => W([c[0] + r[0] * x, c[1] + r[1] * y, c[2] + r[2] * z]);
  const visN = (x: number, y: number, z: number) => camZ(Wd([x, y, z])) > 0.05;

  // ---------------- gáster, pecíolo y mesosoma
  const GA: V3 = [-21, 3 + pose.gasterPitch * 6, 0];
  const GAr: V3 = [13, 10, 10.5];
  const ga = blob('ga', GA, GAr, CC.body, CC.light, mm(Rz(pose.gasterPitch), [[1, 0, 0], [0, 1, 0], [0, 0, 1]]), 0, 0.8);
  // segmentos del gáster (bordes de los tergitos) y pelos dorados finos
  const marks: React.ReactNode[] = [];
  for (const x0 of [0.62, 0.22, -0.18, -0.55]) {
    const rr = Math.sqrt(1 - x0 * x0);
    const pts: Vec[] = [];
    for (let i = 0; i <= 14; i++) {
      const a = (i / 14) * Math.PI;
      const y = rr * Math.sin(a);
      const z = rr * Math.cos(a);
      if (!visN(x0, y, z)) {
        if (pts.length > 2) break;
        pts.length = 0;
        continue;
      }
      pts.push(P(surf(GA, GAr, x0, y, z)));
    }
    if (pts.length > 2) marks.push(<path key={`gs${x0}`} d={smoothPath(pts)} stroke={C(CC.light)} strokeWidth={0.9 * k} fill="none" opacity={0.5} />);
  }
  for (let i = 0; i < 14; i++) {
    const x = -0.7 + hash1(i * 2.3 + spec.seed) * 1.3;
    const zs = (hash1(i * 4.1) - 0.5) * 1.4;
    const y = Math.sqrt(Math.max(0, 1 - x * x - zs * zs));
    if (!visN(x, y, zs)) continue;
    const a = surf(GA, GAr, x, y, zs);
    const b = add(a, add(scl(norm(Wd([x, y, zs])), 2.6 * k), scl(fwd, -1.6 * k)));
    const pa = P(a);
    const pb = P(b);
    marks.push(<path key={`h${i}`} d={`M${f1(pa.x)},${f1(pa.y)}L${f1(pb.x)},${f1(pb.y)}`} stroke={CC.hair} strokeWidth={0.45 * k} opacity={0.7 * (1 - dead * 0.5)} />);
  }
  push(ga.z + 0.3, 'gm', <>{marks}</>);
  blob('pe', [-8, 3, 0], [2.6, 4.6, 3.2], CC.body, CC.light, null, 0.1, 0.5);
  blob('pp', [3, 3.6, 0], [10, 5.2, 4.8], CC.body, CC.light, null, 0, 0.6);
  blob('ms', [9, 4.6, 0], [7, 5.6, 5.2], CC.body, CC.light, null, 0.03, 0.6);
  const pr = blob('pr', [15, 4.4, 0], [8, 6.6, 6.2], CC.body, CC.light, null, 0.05, 0.7);

  // ---------------- cabeza, ojos, mandíbulas, antenas
  const HR = mm(Ry(pose.headYaw), Rz(pose.headPitch));
  const neck: V3 = [21, 3, 0];
  const hl = (l: V3): V3 => add(neck, mul(HR, sub(l, neck)));
  const hd = blob('hd', hl([30, 3, 0]), [9, 8.6, 9.6], CC.body, CC.light, HR, 0.2, 0.7);
  for (const sg of [1, -1]) {
    const e = blob(`ey${sg}`, hl([31.5, 6, 7.6 * sg]), [3.2, 3.6, 2.2], CC.eye, '#8a8f96', HR, 0.4, 0.9);
    void e;
  }
  // mandíbulas: láminas triangulares con dientes, giran sobre su base
  const mand: React.ReactNode[] = [];
  for (const sg of [1, -1]) {
    // ángulo hacia dentro: cerradas ≈ 0,95 rad (las puntas se cruzan) · abiertas ≈ −0,15 rad
    const ang = lerp(0.95, -0.15, clamp(pose.mandible));
    const base = W(hl([37.5, -1.5, 4 * sg]));
    const dir = norm(Wd(mul(HR, [Math.cos(ang), -0.12, -Math.sin(ang) * sg])));
    const inner = scl(norm(Wd(mul(HR, [Math.sin(ang), 0, Math.cos(ang) * sg]))), -sg);
    const L = 10 * k;
    const tip = add(base, scl(dir, L));
    const q = (p: V3) => P(p);
    const b0 = q(add(base, scl(inner, -2.2 * k * sg)));
    const b1 = q(add(base, scl(inner, 2.2 * k * sg)));
    const tp = q(add(tip, scl(inner, 1.5 * k * sg)));
    const t1 = q(add(add(base, scl(dir, L * 0.7)), scl(inner, 2.6 * k * sg)));
    const t2 = q(add(add(base, scl(dir, L * 0.45)), scl(inner, 2.4 * k * sg)));
    mand.push(<path key={sg} d={`M${f1(b0.x)},${f1(b0.y)} L${f1(tp.x)},${f1(tp.y)} L${f1(t1.x)},${f1(t1.y)} L${f1(t2.x)},${f1(t2.y)} L${f1(b1.x)},${f1(b1.y)}Z`} fill={C(CC.mandible)} stroke="#140806" strokeWidth={0.5} />);
  }
  const headFront = W(hl([44, -2, 0]));
  push(hd.z + 0.6, 'md', <>{mand}</>);
  // antenas acodadas
  const ant: React.ReactNode[] = [];
  pose.antenna.forEach((a, i) => {
    const sg = i === 0 ? 1 : -1;
    const sock = W(hl([35.5, 6.5, 3 * sg]));
    const scapeDir = norm(Wd(mul(HR, [Math.cos(a.pitch) * Math.cos(a.yaw * sg) * 0.6, Math.sin(a.pitch) + 0.5, sg * (0.5 + Math.sin(a.yaw) * 0.3)])));
    const elbow = add(sock, scl(scapeDir, 18 * k));
    const pts: V3[] = [sock, elbow];
    let d = norm(add(scl(fwd, Math.cos(a.elbow)), add(scl(up, -Math.sin(a.elbow) * 0.6), scl(side, sg * 0.35))));
    let p = elbow;
    for (let s = 0; s < 6; s++) {
      p = add(p, scl(d, 3.8 * k));
      pts.push(p);
      d = norm(add(d, scl(up, -0.04)));
    }
    const p2 = pts.map(P);
    ant.push(<path key={`s${i}`} d={`M${f1(p2[0].x)},${f1(p2[0].y)}L${f1(p2[1].x)},${f1(p2[1].y)}`} stroke={C(CC.antenna)} strokeWidth={1.5 * k} strokeLinecap="round" />);
    ant.push(<path key={`f${i}`} d={smoothPath(p2.slice(1))} stroke={C(CC.antenna)} strokeWidth={1.25 * k} strokeLinecap="round" fill="none" />);
    for (let s = 2; s < p2.length; s++) ant.push(<circle key={`j${i}${s}`} cx={f1(p2[s].x)} cy={f1(p2[s].y)} r={0.75 * k} fill={C(s === p2.length - 1 ? '#6a4630' : CC.antenna)} />);
  });
  push(hd.z + 0.8, 'an', <>{ant}</>);

  // ---------------- patas (IK, rodilla hacia arriba y afuera)
  LEG_HIPS.forEach((lg, i) => {
    const sg = lg.hip[2] > 0 ? 1 : -1;
    const hip = W(lg.hip);
    let foot = pose.feet[i];
    const fold = dead > 0 ? dead * 0.5 : 0;
    if (!foot) foot = W([lg.hip[0] + (i < 2 ? 10 : i < 4 ? 0 : -10), -12, lg.hip[2] + sg * 12]);
    if (fold > 0) foot = add(scl(foot, 1 - fold), scl(W([lg.hip[0] + 4, -6, lg.hip[2] + sg * 7]), fold));
    const out = sub(foot, pose.pos);
    const tarsDir = norm(sub(out, scl(up, dot(out, up) * 0.9)));
    const ankle = sub(foot, scl(tarsDir, lg.tarsus * k * 0.9));
    const knee = ik3(hip, ankle, lg.femur * k, lg.tibia * k, add(scl(up, 1.2), scl(side, 0.7 * sg)));
    const ph = P(hip);
    const pk = P(knee);
    const pa = P(ankle);
    const pf = P(foot);
    const tm = {x: lerp(pa.x, pf.x, 0.5), y: lerp(pa.y, pf.y, 0.5)};
    push((ph.z + pk.z + pa.z) / 3, `lg${i}`, (
      <>
        <path d={`M${f1(ph.x)},${f1(ph.y)}L${f1(pk.x)},${f1(pk.y)}`} stroke={C(CC.leg)} strokeWidth={2.1 * k} strokeLinecap="round" />
        <path d={`M${f1(pk.x)},${f1(pk.y)}L${f1(pa.x)},${f1(pa.y)}`} stroke={C(mixColor(CC.leg, CC.legDark, 0.25))} strokeWidth={1.6 * k} strokeLinecap="round" />
        <path d={`M${f1(pa.x)},${f1(pa.y)}Q${f1(tm.x)},${f1(tm.y)} ${f1(pf.x)},${f1(pf.y)}`} stroke={C(CC.legDark)} strokeWidth={1.1 * k} strokeLinecap="round" fill="none" />
        <circle cx={f1(pk.x)} cy={f1(pk.y)} r={1.1 * k} fill={C(CC.legDark)} />
      </>
    ));
    // filamentos blancos en las articulaciones de las patas y hacia la superficie
    if (pose.hyphae > 0.02) {
      const tuft = (c: Vec, n: number, len: number, key: string) => {
        const lines: React.ReactNode[] = [];
        for (let j = 0; j < n * 2; j++) {
          const a = hash1(j * 3.7 + i * 11 + key.length) * Math.PI * 2;
          const l = len * (0.35 + hash1(j * 5.1 + i) * 0.5);
          lines.push(<path key={j} d={`M${f1(c.x)},${f1(c.y)}l${f1(Math.cos(a) * l)},${f1(Math.sin(a) * l)}`} stroke="#f4f1e6" strokeWidth={0.4} strokeLinecap="round" />);
        }
        return <g key={key} opacity={0.75}>{lines}</g>;
      };
      push(pk.z + 0.5, `hy${i}`, (
        <>
          {tuft(pk, 7, 4.5 * pose.hyphae * k, 'k')}
          {tuft(pa, 6, 4 * pose.hyphae * k, 'a')}
          {tuft(pf, 8, 6 * pose.hyphae * k, 'f')}
        </>
      ));
    }
  });

  // ---------------- hongo sobre el cuerpo: articulaciones del cuerpo, tallo y ascoma
  let stalkTop: V3 | null = null;
  let ascomaP: V3 | null = null;
  if (pose.hyphae > 0.02) {
    const joints: V3[] = [[22, 4, 0], [22, 2, 5], [22, 2, -5], [-4, 4, 0], [-9, 5, 0], [-12, 3, 6], [-12, 3, -6], [-17, 9, 3], [-24, 9, -3]];
    const tufts: React.ReactNode[] = [];
    joints.forEach((j, ji) => {
      const c = P(W(j));
      for (let m = 0; m < 16; m++) {
        const a = hash1(m * 2.9 + ji * 7.3) * Math.PI * 2;
        const l = (1.5 + hash1(m + ji * 3) * 3) * pose.hyphae * k;
        tufts.push(<path key={`${ji}-${m}`} d={`M${f1(c.x)},${f1(c.y)}q${f1(Math.cos(a + 0.6) * l * 0.5)},${f1(Math.sin(a + 0.6) * l * 0.5)} ${f1(Math.cos(a) * l)},${f1(Math.sin(a) * l)}`} stroke="#f6f3ea" strokeWidth={0.45} fill="none" strokeLinecap="round" />);
      }
      tufts.push(<circle key={`b${ji}`} cx={f1(c.x)} cy={f1(c.y)} r={f1(2 * pose.hyphae * k)} fill="#f2eee2" opacity={0.6} />);
    });
    push(Math.max(pr.z, ga.z) + 1, 'hyb', <g opacity={0.85}>{tufts}</g>);
  }
  if (pose.stalk > 0.01) {
    const base = W(hl([22, 9, 0]));
    const dir = norm(pose.stalkDir);
    const len = 190 * k * pose.stalk;
    const bend = norm(cross(dir, side));
    const pts: V3[] = [];
    for (let i = 0; i <= 10; i++) {
      const u = i / 10;
      pts.push(add(add(base, scl(dir, len * u)), scl(bend, Math.sin(u * Math.PI * 0.9) * len * 0.08)));
    }
    stalkTop = pts[10];
    const p2 = pts.map(P);
    const z = P(pts[5]).z;
    const segs: React.ReactNode[] = [];
    for (let i = 0; i < 10; i++) {
      const u = i / 10;
      const w = (4.2 - 2.4 * u) * k;
      const col = mixColor('#2e2218', '#e9dcc0', clamp((u - 0.75) / 0.25));
      segs.push(<path key={i} d={`M${f1(p2[i].x)},${f1(p2[i].y)}L${f1(p2[i + 1].x)},${f1(p2[i + 1].y)}`} stroke={col} strokeWidth={w} strokeLinecap="round" />);
    }
    // estructura fértil lateral (ascoma) con peritecios: "unilateral", en un solo lado del tallo
    if (pose.ascoma > 0.01) {
      const ap = pts[3];
      const lat = norm(cross(dir, bend));
      const c3 = add(ap, scl(lat, 4 * k * pose.ascoma));
      ascomaP = c3;
      const c = P(c3);
      const t2 = P(pts[4]);
      const ang = (Math.atan2(t2.y - P(pts[2]).y, t2.x - P(pts[2]).x) * 180) / Math.PI;
      const rx = 11 * k * pose.ascoma;
      const ry = 6 * k * pose.ascoma;
      const dots: React.ReactNode[] = [];
      for (let m = 0; m < 9; m++) {
        const a = (m / 9) * Math.PI * 2;
        dots.push(<circle key={m} cx={f1(c.x + Math.cos(a) * rx * 0.55)} cy={f1(c.y + Math.sin(a) * ry * 0.5)} r={f1(Math.max(0.4, 1.1 * k * pose.ascoma))} fill="#1c120a" />);
      }
      segs.push(
        <g key="asc">
          <ellipse cx={f1(c.x)} cy={f1(c.y)} rx={f1(rx)} ry={f1(ry)} transform={`rotate(${ang.toFixed(1)} ${f1(c.x)} ${f1(c.y)})`} fill="#7a5532" stroke="#3a2614" strokeWidth={0.6} />
          {dots}
        </g>,
      );
    }
    push(z + 2, 'stalk', <>{segs}</>);
  }
  return {items, headFront, stalkTop, ascoma: ascomaP};
}
