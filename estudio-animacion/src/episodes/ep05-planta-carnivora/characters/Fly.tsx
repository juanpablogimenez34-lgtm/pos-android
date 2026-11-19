// Mosca doméstica (Musca domestica) en 3D ligero proyectado a SVG.
// Cabeza con dos ojos compuestos pardo-rojizos y antenas cortas con arista, tórax gris con
// cuatro bandas oscuras longitudinales, escutelo, abdomen segmentado, DOS alas membranosas con
// la nervadura típica (la vena M se curva hacia la punta), halterios, seis patas articuladas
// (fémur, tibia, tarso con pulvilos) y cerdas. Sin rasgos caricaturescos.
import React from 'react';
import {clamp, hash1, lerp, mixColor, smoothPath, Vec} from '../../../engine/math';
import {add, cross, dot, ellipsoidSilhouette, ik3, M3, mm, mul, norm, project, Ry, Rz, scl, sub, V3, View} from '../anatomy/proj';
import {f1, Item} from '../anatomy/render';

export type FlyPose = {
  pos: V3; // centro del tórax (mundo)
  fwd: V3; // adelante
  up: V3; // dorso
  scale: number;
  /** Pies en el mundo (L1,R1,L2,R2,L3,R3) cuando apoya; null = postura aérea. */
  feet: (V3 | null)[];
  legExtend: number; // 0 recogidas · 1 extendidas (aterrizaje)
  wingBuzz: number; // 0 alas en reposo · 1 batido (desenfoque)
  wingSpread: number; // apertura de las alas en reposo (0–1)
  headYaw: number;
  headPitch: number;
  proboscis: number; // 0–1 probóscide extendida
  dry: number; // 0–1 restos secos tras la digestión
  opacity: number;
  t: number;
};

const LEGS: {hip: V3; femur: number; tibia: number; tarsus: number; air: V3; land: V3}[] = [
  {hip: [12, -4, 4], femur: 12, tibia: 12, tarsus: 10, air: [21, -11, 7], land: [25, -21, 13]},
  {hip: [12, -4, -4], femur: 12, tibia: 12, tarsus: 10, air: [21, -11, -7], land: [25, -21, -13]},
  {hip: [5, -6, 5.5], femur: 13, tibia: 13, tarsus: 10, air: [6, -15, 10], land: [5, -23, 17]},
  {hip: [5, -6, -5.5], femur: 13, tibia: 13, tarsus: 10, air: [6, -15, -10], land: [5, -23, -17]},
  {hip: [-1, -6, 5], femur: 15, tibia: 15, tarsus: 11, air: [-12, -13, 9], land: [-15, -21, 15]},
  {hip: [-1, -6, -5], femur: 15, tibia: 15, tarsus: 11, air: [-12, -13, -9], land: [-15, -21, -15]},
];

/** Contorno de un ala en su plano: (l a lo largo, c hacia el borde posterior). */
const WING: [number, number][] = [[0, 0], [10, -2.2], [30, -3.4], [50, -2.8], [57, -0.5], [59, 3], [56, 7.5], [46, 11.5], [32, 12.8], [18, 11], [8, 7.5], [3, 5.5], [1, 2.5]];
const VEINS: [number, number][][] = [
  [[6, 0.2], [22, -1.6], [34, -1.9]], // R1
  [[8, 1.2], [30, -0.6], [50, -1.2]], // R2+3
  [[9, 2.4], [34, 1.6], [57, 1.4]], // R4+5
  [[11, 4.2], [30, 6.2], [44, 6.8], [53, 3.6], [56, 2.4]], // M (curva hacia R4+5)
  [[12, 6.2], [26, 9.4], [38, 11.2]], // CuA
  [[20, 2.4], [21, 4.8]], // vena transversal r-m
  [[38, 6.6], [39, 9.2]], // dm-cu
];

export function flyItems(view: View, pose: FlyPose, uid: string, zMap?: (z: number) => number): Item[] {
  const {pos, scale: k, t} = pose;
  const fwd = norm(pose.fwd);
  const up = norm(sub(pose.up, scl(fwd, dot(pose.up, fwd))));
  const side = cross(fwd, up); // +z local
  const W = (l: V3): V3 => add(pos, add(add(scl(fwd, l[0] * k), scl(up, l[1] * k)), scl(side, l[2] * k)));
  const Wd = (l: V3): V3 => add(add(scl(fwd, l[0]), scl(up, l[1])), scl(side, l[2]));
  const P = (p: V3) => project(view, p);
  const dry = clamp(pose.dry);
  const C = (c: string) => mixColor(c, '#4b3f31', dry * 0.75);
  const items: Item[] = [];
  const zz = (z: number) => (zMap ? zMap(z) : z);
  const push = (z: number, key: string, node: React.ReactNode) => items.push({z: zz(z), key: `${uid}-${key}`, node: <g key={`${uid}-${key}`} opacity={pose.opacity}>{node}</g>});
  const camZ = (d: V3) => mul(view.M, d)[2];

  // ---------------- elipsoides del cuerpo ----------------
  const blob = (key: string, c: V3, r: V3, base: string, light: string, dark: string, rot: M3 | null = null, zOff = 0) => {
    let ax: [V3, V3, V3] = [Wd([r[0] * k, 0, 0]), Wd([0, r[1] * k, 0]), Wd([0, 0, r[2] * k])];
    if (rot) ax = [Wd(mul(rot, [r[0] * k, 0, 0])), Wd(mul(rot, [0, r[1] * k, 0])), Wd(mul(rot, [0, 0, r[2] * k]))];
    const e = ellipsoidSilhouette(view, W(c), ax);
    const gid = `${uid}-${key}-g`;
    push(e.z + zOff, key, (
      <>
        <defs>
          <radialGradient id={gid} gradientUnits="userSpaceOnUse" cx={f1(e.cx - e.rx * 0.3)} cy={f1(e.cy - e.ry * 0.45)} r={f1(Math.max(e.rx, e.ry) * 1.35)}>
            <stop offset="0" stopColor={C(light)} />
            <stop offset="0.45" stopColor={C(base)} />
            <stop offset="1" stopColor={C(dark)} />
          </radialGradient>
        </defs>
        <ellipse cx={f1(e.cx)} cy={f1(e.cy)} rx={f1(e.rx)} ry={f1(e.ry)} transform={`rotate(${e.deg.toFixed(2)} ${f1(e.cx)} ${f1(e.cy)})`} fill={`url(#${gid})`} stroke={C('#141312')} strokeWidth={0.5} />
      </>
    ));
    return e;
  };
  // puntos sobre la superficie de un elipsoide alineado al cuerpo
  const surf = (c: V3, r: V3, x: number, y: number, z: number): V3 => W([c[0] + r[0] * x, c[1] + r[1] * y, c[2] + r[2] * z]);
  const visibleN = (x: number, y: number, z: number, r: V3) => camZ(Wd([x / r[0], y / r[1], z / r[2]])) > 0.05;

  // abdomen
  const AB: V3 = [-16, 0.5, 0];
  const ABr: V3 = [18, 9.5 * (1 - 0.35 * dry), 11.5];
  const abE = blob('ab', AB, ABr, '#6b6556', '#9d9378', '#26231e');
  // tórax y escutelo
  const TH: V3 = [5, 3, 0];
  const THr: V3 = [12.5, 10.5, 11];
  const thE = blob('th', TH, THr, '#73767b', '#b7bbc0', '#2b2d31');
  blob('sc', [-7, 9.5, 0], [4.5, 2.6, 5], '#6a6d72', '#a4a8ad', '#2b2d31', null, 0.2);
  // bandas del tórax y segmentos del abdomen (solo la parte visible)
  const marks: React.ReactNode[] = [];
  for (const zs of [-0.55, -0.2, 0.2, 0.55]) {
    const pts: Vec[] = [];
    for (let i = 0; i <= 8; i++) {
      const x = -0.75 + (1.45 * i) / 8;
      const y = Math.sqrt(Math.max(0, 1 - x * x - zs * zs));
      if (!visibleN(x, y, zs, [1, 1, 1])) continue;
      pts.push(P(surf(TH, THr, x, y * 0.98, zs)));
    }
    if (pts.length > 2) marks.push(<path key={`ts${zs}`} d={smoothPath(pts)} stroke={C('#232428')} strokeWidth={1.7 * k} fill="none" strokeLinecap="round" opacity={0.85} />);
  }
  for (const x0 of [0.55, 0.15, -0.25, -0.62]) {
    const rr = Math.sqrt(1 - x0 * x0);
    const pts: Vec[] = [];
    for (let i = 0; i <= 16; i++) {
      const a = -Math.PI / 2 + (Math.PI * 2 * i) / 16;
      const y = rr * Math.sin(a + Math.PI / 2);
      const z = rr * Math.cos(a + Math.PI / 2);
      if (!visibleN(x0, y, z, [1, 1, 1])) {
        if (pts.length > 2) break;
        pts.length = 0;
        continue;
      }
      pts.push(P(surf(AB, ABr, x0, y, z)));
    }
    if (pts.length > 2) marks.push(<path key={`ab${x0}`} d={smoothPath(pts)} stroke={C('#35302a')} strokeWidth={1.1 * k} fill="none" opacity={0.7} />);
  }
  // banda dorsal oscura del abdomen (patrón ajedrezado tenue)
  {
    const pts: Vec[] = [];
    for (let i = 0; i <= 8; i++) {
      const x = 0.75 - (1.5 * i) / 8;
      const y = Math.sqrt(Math.max(0, 1 - x * x));
      if (visibleN(x, y, 0, [1, 1, 1])) pts.push(P(surf(AB, ABr, x, y * 0.97, 0)));
    }
    if (pts.length > 2) marks.push(<path key="abd" d={smoothPath(pts)} stroke={C('#2e2a25')} strokeWidth={4.5 * k} strokeLinecap="round" fill="none" opacity={0.45} />);
  }
  // cerdas del tórax y de la punta del abdomen
  for (let i = 0; i < 12; i++) {
    const x = -0.7 + hash1(i * 3.3) * 1.3;
    const zs = (hash1(i * 5.1) - 0.5) * 1.2;
    const y = Math.sqrt(Math.max(0, 1 - x * x - zs * zs));
    if (!visibleN(x, y, zs, [1, 1, 1])) continue;
    const a = surf(TH, THr, x, y, zs);
    const b = add(a, add(scl(norm(Wd([x, y, zs])), 3.2 * k), scl(fwd, -1.6 * k)));
    const pa = P(a);
    const pb = P(b);
    marks.push(<path key={`br${i}`} d={`M${f1(pa.x)},${f1(pa.y)}L${f1(pb.x)},${f1(pb.y)}`} stroke="#151413" strokeWidth={0.6 * k} />);
  }
  push(thE.z + 0.4, 'marks', <>{marks}</>);
  void abE;

  // ---------------- cabeza ----------------
  const HR = mm(Ry(pose.headYaw), Rz(pose.headPitch));
  const neck: V3 = [16, 2, 0];
  const hl = (l: V3): V3 => add(neck, mul(HR, sub(l, neck)));
  blob('hd', hl([20, 2, 0]), [5.5, 8.8, 10], '#8d9094', '#d2cfc2', '#3a3b3e', HR, 0.3);
  // ojos compuestos (grandes, pardo-rojizos; no caricaturescos)
  for (const sg of [1, -1]) {
    const e = blob(`eye${sg}`, hl([20.5, 3.5, 5.6 * sg]), [4.8, 6.8, 4.6], '#6a2216', '#b8573c', '#2a0b06', HR, 0.5);
    // reflejo y textura de omatidios (rejilla tenue)
    if (e.rx > 1.2) {
      push(e.z + 0.51, `eyeh${sg}`, (
        <>
          <ellipse cx={f1(e.cx - e.rx * 0.25)} cy={f1(e.cy - e.ry * 0.3)} rx={f1(e.rx * 0.28)} ry={f1(e.ry * 0.18)} transform={`rotate(${e.deg.toFixed(1)} ${f1(e.cx)} ${f1(e.cy)})`} fill="#ffffff" opacity={0.28 * (1 - dry)} />
          <ellipse cx={f1(e.cx)} cy={f1(e.cy)} rx={f1(e.rx * 0.82)} ry={f1(e.ry * 0.82)} transform={`rotate(${e.deg.toFixed(1)} ${f1(e.cx)} ${f1(e.cy)})`} fill="none" stroke="#3a0d07" strokeWidth={0.35} strokeDasharray="0.8 1.1" opacity={0.5} />
        </>
      ));
    }
  }
  // antenas cortas con arista y probóscide
  const ant: React.ReactNode[] = [];
  for (const sg of [1, -1]) {
    const a0 = P(W(hl([25, 4.5, 1.6 * sg])));
    const a1 = P(W(hl([27, 1.5, 2.2 * sg])));
    const a2 = P(W(hl([28.5, -0.5, 2.6 * sg])));
    const ar = P(W(hl([31, 1.5, 3.4 * sg])));
    ant.push(<path key={`a${sg}`} d={`M${f1(a0.x)},${f1(a0.y)}L${f1(a1.x)},${f1(a1.y)}L${f1(a2.x)},${f1(a2.y)}`} stroke={C('#3b3127')} strokeWidth={1.3 * k} strokeLinecap="round" fill="none" />);
    ant.push(<path key={`ar${sg}`} d={`M${f1(a1.x)},${f1(a1.y)}L${f1(ar.x)},${f1(ar.y)}`} stroke="#2a2420" strokeWidth={0.4 * k} />);
  }
  if (pose.proboscis > 0.02) {
    const p0 = P(W(hl([22, -5, 0])));
    const p1 = P(W(hl([24, -5 - 7 * pose.proboscis, 0])));
    ant.push(<path key="pr" d={`M${f1(p0.x)},${f1(p0.y)}L${f1(p1.x)},${f1(p1.y)}`} stroke={C('#4a3d30')} strokeWidth={1.8 * k} strokeLinecap="round" />);
    ant.push(<ellipse key="lb" cx={f1(p1.x)} cy={f1(p1.y)} rx={2.4 * k} ry={1.3 * k} fill={C('#6b5a46')} />);
  }
  push(P(W(hl([26, 2, 0]))).z + 0.6, 'ant', <>{ant}</>);

  // ---------------- patas ----------------
  const legsUp: V3 = up;
  LEGS.forEach((lg, i) => {
    const sg = lg.hip[2] > 0 ? 1 : -1;
    const hip = W(lg.hip);
    let foot: V3;
    let tarsDir: V3;
    const target = pose.feet[i];
    if (target) {
      foot = target;
      const out = sub(foot, pos);
      tarsDir = norm(sub(out, scl(legsUp, dot(out, legsUp) * 0.85)));
    } else {
      const curl = dry > 0 ? lerp(1, 0.55, dry) : 1;
      const l = lg.air.map((v, j) => lerp(v, lg.land[j], clamp(pose.legExtend)) * curl) as V3;
      foot = W(l);
      tarsDir = norm(Wd([lg.air[0] > 10 ? 0.5 : -0.4, -0.75, 0.35 * sg]));
    }
    const ankle = sub(foot, scl(tarsDir, lg.tarsus * k * 0.92));
    const pole = add(scl(legsUp, 1), scl(side, 0.8 * sg));
    const knee = ik3(hip, ankle, lg.femur * k, lg.tibia * k, pole);
    const ph = P(hip);
    const pk = P(knee);
    const pa = P(ankle);
    const pf = P(foot);
    const tz = (ph.z + pk.z + pa.z) / 3;
    const tm = {x: lerp(pa.x, pf.x, 0.45), y: lerp(pa.y, pf.y, 0.45) + 0.3};
    const bristles: React.ReactNode[] = [];
    for (let b = 1; b <= 3; b++) {
      const q = {x: lerp(pk.x, pa.x, b / 4), y: lerp(pk.y, pa.y, b / 4)};
      bristles.push(<path key={b} d={`M${f1(q.x)},${f1(q.y)}l${f1(1.6 * k)},${f1(-1.2 * k)}`} stroke="#151313" strokeWidth={0.4} />);
    }
    push(tz, `leg${i}`, (
      <>
        <path d={`M${f1(ph.x)},${f1(ph.y)}L${f1(pk.x)},${f1(pk.y)}`} stroke={C('#211e1b')} strokeWidth={2.2 * k} strokeLinecap="round" />
        <path d={`M${f1(pk.x)},${f1(pk.y)}L${f1(pa.x)},${f1(pa.y)}`} stroke={C('#1b1917')} strokeWidth={1.6 * k} strokeLinecap="round" />
        <path d={`M${f1(pa.x)},${f1(pa.y)}Q${f1(tm.x)},${f1(tm.y)} ${f1(pf.x)},${f1(pf.y)}`} stroke={C('#191716')} strokeWidth={1.05 * k} strokeLinecap="round" fill="none" />
        <circle cx={f1(pf.x)} cy={f1(pf.y)} r={0.9 * k} fill={C('#8f8370')} opacity={0.8} />
        {k > 0.7 && bristles}
      </>
    ));
  });

  // ---------------- halterios ----------------
  for (const sg of [1, -1]) {
    const h0 = P(W([-3, 5, 7.5 * sg]));
    const h1 = P(W([-7, 2, 9 * sg]));
    push(h1.z - 0.2, `hal${sg}`, (
      <>
        <path d={`M${f1(h0.x)},${f1(h0.y)}L${f1(h1.x)},${f1(h1.y)}`} stroke={C('#9a8f78')} strokeWidth={0.7 * k} />
        <circle cx={f1(h1.x)} cy={f1(h1.y)} r={1.4 * k} fill={C('#d8cfb4')} stroke="#6a6250" strokeWidth={0.3} />
      </>
    ));
  }

  // ---------------- alas ----------------
  for (const sg of [1, -1]) {
    const base = W([6, 9, 4.5 * sg]);
    const wingAt = (dir: V3, chordSign: number) => {
      const n = norm(cross(dir, scl(side, sg)));
      const nn = dot(n, up) < 0 ? scl(n, -1) : n;
      let chord = norm(cross(nn, dir));
      if (dot(chord, fwd) > 0) chord = scl(chord, -1);
      chord = scl(chord, chordSign);
      return (l: number, c: number) => P(add(base, add(scl(dir, l * k * 0.8), scl(chord, c * k * 0.85))));
    };
    if (pose.wingBuzz < 0.98) {
      // reposo: alas hacia atrás sobre el abdomen, ligeramente abiertas en V
      const sp = lerp(0.3, 0.75, clamp(pose.wingSpread));
      const dir = norm(Wd([-Math.cos(sp), 0.12, Math.sin(sp) * sg]));
      const map = wingAt(dir, 1);
      const outline = WING.map(([l, c]) => map(l, c));
      const veins = VEINS.map((v, j) => <path key={j} d={smoothPath(v.map(([l, c]) => map(l, c)))} stroke="#2b2b2b" strokeWidth={0.45 * k} fill="none" opacity={0.55} />);
      const cost = WING.slice(0, 5).map(([l, c]) => map(l, c));
      const z = P(add(base, scl(dir, 25 * k))).z + 1.2;
      push(z, `w${sg}`, (
        <g opacity={(1 - clamp(pose.wingBuzz)) * (1 - 0.6 * dry)}>
          <path d={smoothPath(outline, true, 0.6)} fill="#dfe9f2" fillOpacity={0.3} stroke="#5b6168" strokeWidth={0.4} />
          <path d={smoothPath(outline, true, 0.6)} fill="url(#flyIri)" fillOpacity={0.18} />
          <path d={smoothPath(cost)} stroke="#2b2b2b" strokeWidth={0.8 * k} fill="none" opacity={0.7} />
          {veins}
        </g>
      ));
    }
    if (pose.wingBuzz > 0.02) {
      // batido de alta frecuencia: abanico desenfocado entre los extremos de la carrera
      const tips: Vec[] = [];
      const lo = -0.55;
      const hi = 1.05;
      for (let j = 0; j <= 8; j++) {
        const b = lerp(lo, hi, j / 8);
        const dir = norm(Wd([-0.25 * Math.cos(b), Math.sin(b) * 0.95, Math.cos(b) * sg]));
        tips.push(P(add(base, scl(dir, 46 * k))));
      }
      const pb = P(base);
      // ala fantasma en una fase pseudoaleatoria (no se ve un ciclo lento)
      const fr = Math.round(t * 30);
      const b = lerp(lo, hi, hash1(fr * 1.7 + sg));
      const dir = norm(Wd([-0.25 * Math.cos(b), Math.sin(b) * 0.95, Math.cos(b) * sg]));
      const map = wingAt(dir, 1);
      const ghost = WING.map(([l, c]) => map(l, c));
      const z = P(add(base, scl(Wd([0, 0, sg]), 20 * k))).z + 1.5;
      push(z, `wb${sg}`, (
        <g opacity={clamp(pose.wingBuzz)}>
          <path d={`M${f1(pb.x)},${f1(pb.y)}L` + tips.map((q) => `${f1(q.x)},${f1(q.y)}`).join('L') + 'Z'} fill="#e8f0f7" opacity={0.2} />
          <path d={smoothPath(tips)} stroke="#f4f8fb" strokeWidth={1.2 * k} fill="none" opacity={0.25} />
          <path d={smoothPath(ghost, true, 0.6)} fill="#e3ecf4" opacity={0.16} />
        </g>
      ));
    }
  }
  return items;
}

/** Definiciones compartidas (iridiscencia del ala). Incluir una vez por SVG. */
export const FlyDefs: React.FC = () => (
  <defs>
    <linearGradient id="flyIri" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#9fd7ff" />
      <stop offset="0.5" stopColor="#f7c8ff" />
      <stop offset="1" stopColor="#d4ffc4" />
    </linearGradient>
  </defs>
);
