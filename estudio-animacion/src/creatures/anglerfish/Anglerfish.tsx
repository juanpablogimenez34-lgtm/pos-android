// Rape abisal hembra — Linophryne arborifera (familia Linophrynidae).
// Rasgos de la especie representados (Pietsch 2009, "Oceanic Anglerfishes"):
//  · cuerpo corto y globoso, cabeza grande, piel negra sin escamas
//  · boca terminal muy grande, mandíbula inferior que sobresale
//  · dientes largos, curvados y orientados hacia el interior
//  · ojos pequeños
//  · illicium (radio de la aleta dorsal modificado) con esca luminosa y apéndices
//  · barbilla hioidea ramificada ("arborifera") con puntos luminosos
//  · aletas dorsal y anal blandas cerca de la cola, aletas pectorales pequeñas
// No se añaden carúnculas (son de Ceratiidae) ni otros rasgos de otras familias.
//
// La pose es una función pura del tiempo y de los parámetros: render reproducible.

import React, {useMemo} from 'react';
import {clamp, fbm1, mixColor, rng, smoothPath, TAU, Vec} from '../../engine/math';

export type AnglerParams = {
  t: number;
  x: number;
  y: number;
  scale: number;
  facing: 1 | -1;
  pitch: number; // rad
  yaw: number; // 0 de perfil … 1 casi de frente (aplasta el eje x)
  jaw: number; // 0 cerrada … 1 abierta del todo
  lureSway: number; // amplitud del balanceo del señuelo
  lureJig: number; // 0–1 tirones rápidos del señuelo
  glow: number; // 0–1 intensidad de la esca
  finRate: number; // Hz de las aletas
  gulp: number; // 0–1 abdomen distendido tras tragar
};

export type AnglerPose = {
  p: AnglerParams;
  toWorld: (v: Vec) => Vec;
  illicium: Vec[]; // local
  esca: Vec; // local
  escaWorld: Vec;
  mouthWorld: Vec;
  jawAngle: number; // rad
  barbel: {segs: [Vec, Vec, number][]; tips: Vec[]};
  tailAngle: number;
  pect: number;
};

// Puntos clave del rig (local, mirando a la derecha; radio del cuerpo ≈ 100)
const C: Vec = {x: 26, y: 22}; // comisura (pivote de la mandíbula)
const U: Vec = {x: 102, y: -20}; // punta de la mandíbula superior
const LJ: Vec = {x: 122, y: -6}; // punta de la mandíbula inferior (sobresale)
const T: Vec = {x: 40, y: 70}; // garganta
const ILL_BASE: Vec = {x: 84, y: -44};
const BARBEL_BASE: Vec = {x: 86, y: 44}; // bajo la mandíbula (se mueve con ella)

const rot = (v: Vec, a: number, o: Vec = {x: 0, y: 0}): Vec => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return {x: o.x + (v.x - o.x) * c - (v.y - o.y) * s, y: o.y + (v.x - o.x) * s + (v.y - o.y) * c};
};

/** Estructura memorizada de la barbilla ramificada (ángulos y longitudes). */
function barbelTree(seed: number) {
  const r = rng(seed);
  type B = {parent: number; ang: number; len: number; depth: number};
  const out: B[] = [{parent: -1, ang: Math.PI / 2 + 0.15, len: 34, depth: 0}];
  const grow = (idx: number, depth: number) => {
    if (depth >= 3) return;
    const kids = depth === 0 ? 3 : 2;
    for (let k = 0; k < kids; k++) {
      out.push({parent: idx, ang: (k / (kids - 1) - 0.5) * 1.1 + (r() - 0.5) * 0.3, len: out[idx].len * (0.62 + r() * 0.15), depth: depth + 1});
      grow(out.length - 1, depth + 1);
    }
  };
  grow(0, 0);
  return out;
}
const TREE = barbelTree(31);

export function anglerPose(p: AnglerParams): AnglerPose {
  const {t} = p;
  const sx = p.scale * p.facing * (1 - 0.55 * clamp(p.yaw));
  const toWorld = (v: Vec): Vec => {
    const r = rot({x: v.x * sx, y: v.y * p.scale}, p.pitch * p.facing);
    return {x: p.x + r.x, y: p.y + r.y};
  };
  const jawAngle = clamp(p.jaw) * 0.95 + Math.sin(t * 1.3) * 0.015;
  // illicium: cadena de 4 segmentos que se curva hacia delante
  const sway = Math.sin(t * 0.9) * 0.16 * p.lureSway + fbm1(t * 0.35, 3) * 0.1 * p.lureSway;
  const jig = p.lureJig * (Math.sin(t * 7.3) * 0.12 + (Math.sin(t * 2.1) > 0.6 ? 0.18 : 0));
  const ill: Vec[] = [ILL_BASE];
  let a = -1.75 + sway * 0.5;
  for (let k = 0; k < 4; k++) {
    a += 0.47 + sway * 0.25 + jig * (k === 3 ? 1.6 : 0.6);
    const prev = ill[ill.length - 1];
    ill.push({x: prev.x + Math.cos(a) * 27, y: prev.y + Math.sin(a) * 27});
  }
  const esca = ill[4];
  // barbilla (cuelga de la mandíbula: rota con ella)
  const base = rot(BARBEL_BASE, jawAngle, C);
  const pos: Vec[] = [];
  const angs: number[] = [];
  const segs: [Vec, Vec, number][] = [];
  const tips: Vec[] = [];
  TREE.forEach((b, i) => {
    const parentPos = b.parent < 0 ? base : pos[b.parent];
    const parentAng = b.parent < 0 ? 0 : angs[b.parent];
    const swayB = Math.sin(t * 1.1 + i * 0.7) * 0.12 * (b.depth + 1) + jawAngle * 0.4;
    const ang = (b.parent < 0 ? b.ang : parentAng + b.ang) + swayB * 0.4;
    const end = {x: parentPos.x + Math.cos(ang) * b.len, y: parentPos.y + Math.sin(ang) * b.len};
    pos.push(end);
    angs.push(ang);
    segs.push([parentPos, end, b.depth]);
    if (b.depth === 3) tips.push(end);
  });
  const tailAngle = Math.sin(t * TAU * p.finRate * 0.6) * 0.16 + fbm1(t * 0.4, 7) * 0.06;
  const pect = Math.sin(t * TAU * p.finRate) * 0.35;
  const mouthLocal = {x: 70, y: 8};
  return {p, toWorld, illicium: ill, esca, escaWorld: toWorld(esca), mouthWorld: toWorld(mouthLocal), jawAngle, barbel: {segs, tips}, tailAngle, pect};
}

const SKIN = {base: '#1b1613', dark: '#0c0a09', mid: '#2b231f', fin: '#3a302b', teeth: '#efe9dc', mouth: '#2a0a0e'};

type Tooth = {f: number; len: number; w: number; tilt: number};
const UPPER: Tooth[] = [
  {f: 0.28, len: 10, w: 3, tilt: 0.5},
  {f: 0.4, len: 18, w: 4, tilt: 0.45},
  {f: 0.52, len: 14, w: 3.5, tilt: 0.4},
  {f: 0.63, len: 26, w: 5, tilt: 0.35},
  {f: 0.74, len: 16, w: 4, tilt: 0.3},
  {f: 0.84, len: 30, w: 5, tilt: 0.25},
];
const LOWER: Tooth[] = [
  {f: 0.3, len: 12, w: 3, tilt: 0.5},
  {f: 0.42, len: 20, w: 4, tilt: 0.45},
  {f: 0.55, len: 15, w: 3.5, tilt: 0.4},
  {f: 0.67, len: 28, w: 5, tilt: 0.35},
  {f: 0.78, len: 18, w: 4, tilt: 0.3},
];
// colmillos frontales visibles incluso con la boca cerrada
const FANGS_U: Tooth[] = [{f: 0.95, len: 34, w: 5.5, tilt: 0.2}];
const FANGS_L: Tooth[] = [{f: 0.9, len: 40, w: 6, tilt: 0.15}, {f: 0.97, len: 30, w: 5, tilt: 0.1}];

/** Diente curvo desde la línea a→b, en la fracción f, hacia el lado `side` (normal). */
function toothPath(a: Vec, b: Vec, tooth: Tooth, side: 1 | -1) {
  const base = {x: a.x + (b.x - a.x) * tooth.f, y: a.y + (b.y - a.y) * tooth.f};
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy) || 1;
  const tx = dx / d;
  const ty = dy / d;
  const nx = -ty * side;
  const ny = tx * side;
  // inclinado hacia el interior (hacia la comisura, -t)
  const dirx = nx * Math.cos(tooth.tilt) - tx * Math.sin(tooth.tilt);
  const diry = ny * Math.cos(tooth.tilt) - ty * Math.sin(tooth.tilt);
  const tip = {x: base.x + dirx * tooth.len, y: base.y + diry * tooth.len};
  const ctrl = {x: base.x + dirx * tooth.len * 0.55 + tx * tooth.len * 0.18, y: base.y + diry * tooth.len * 0.55 + ty * tooth.len * 0.18};
  const l = {x: base.x - tx * tooth.w, y: base.y - ty * tooth.w};
  const r = {x: base.x + tx * tooth.w, y: base.y + ty * tooth.w};
  return `M${l.x.toFixed(1)},${l.y.toFixed(1)} Q${ctrl.x.toFixed(1)},${ctrl.y.toFixed(1)} ${tip.x.toFixed(1)},${tip.y.toFixed(1)} Q${(ctrl.x + tx * tooth.w).toFixed(1)},${(ctrl.y + ty * tooth.w).toFixed(1)} ${r.x.toFixed(1)},${r.y.toFixed(1)}Z`;
}

const finRays = (base: Vec, n: number, a0: number, a1: number, len: (k: number) => number, wob: (k: number) => number) => {
  const tips: Vec[] = [];
  for (let k = 0; k < n; k++) {
    const a = a0 + ((a1 - a0) * k) / (n - 1) + wob(k);
    tips.push({x: base.x + Math.cos(a) * len(k), y: base.y + Math.sin(a) * len(k)});
  }
  return tips;
};

export const Anglerfish: React.FC<{id: string; pose: AnglerPose; light?: number}> = ({id, pose, light = 1}) => {
  const {p, jawAngle, illicium, esca, barbel, tailAngle, pect} = pose;
  const t = p.t;
  const dots = useMemo(() => {
    const r = rng(77);
    return Array.from({length: 70}, () => {
      const a = r() * TAU;
      const d = Math.sqrt(r());
      return {x: Math.cos(a) * d * 95 - 15, y: Math.sin(a) * d * 85 - 5, r: 0.8 + r() * 2.2, k: r()};
    }).filter((d) => !(d.x > 20 && d.y > -25 && d.y < 70));
  }, []);
  const g = 1 + clamp(p.gulp) * 0.16;
  // cuerpo superior: lomo y vientre suaves + línea de la mandíbula superior
  const back: Vec[] = [
    {x: 90, y: -34},
    {x: 74, y: -70},
    {x: 42, y: -96},
    {x: 0, y: -104},
    {x: -46, y: -94},
    {x: -86, y: -64},
    {x: -112, y: -30},
    {x: -128, y: -11},
    {x: -128, y: 11},
    {x: -108, y: 40 * g},
    {x: -74, y: 76 * g},
    {x: -30, y: 98 * g},
    {x: 14, y: 96 * g},
    {x: T.x, y: T.y + 6 * (g - 1) * 50},
  ];
  const bodyPath = smoothPath(back) + `L${C.x},${C.y} L${U.x},${U.y} Z`;
  const jawPts = [LJ, {x: 112, y: 22}, {x: 92, y: 44}, {x: 66, y: 62}, T];
  const jawPath = `M${C.x},${C.y} L${LJ.x},${LJ.y} ` + smoothPath(jawPts).replace(/^M[^C]+/, '') + ` L${C.x},${C.y} Z`;
  const rLJ = rot(LJ, jawAngle, C);
  const rT = rot(T, jawAngle, C);
  const rB = rot({x: 92, y: 44}, jawAngle, C);
  const deg = (jawAngle * 180) / Math.PI;
  const tf = `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${((p.pitch * p.facing * 180) / Math.PI).toFixed(2)}) scale(${(p.scale * p.facing * (1 - 0.55 * clamp(p.yaw))).toFixed(4)} ${p.scale.toFixed(4)})`;
  const tailDeg = (tailAngle * 180) / Math.PI;
  const caudal = finRays({x: -132, y: 0}, 9, Math.PI - 0.62, Math.PI + 0.62, () => 72, (k) => Math.sin(t * 3 + k * 0.5) * 0.05);
  const dorsal = finRays({x: -96, y: -58}, 6, -2.2, -2.75, (k) => 26 - k * 2, (k) => Math.sin(t * 2.4 - k * 0.7) * 0.12);
  const anal = finRays({x: -96, y: 58 * g}, 5, 2.2, 2.75, (k) => 22 - k * 2, (k) => Math.sin(t * 2.4 - k * 0.7 + 1) * 0.12);
  const pectR = finRays({x: -6, y: 24}, 7, 2.2 + pect, 3.3 + pect, (k) => 30 + Math.sin(k) * 3, (k) => Math.sin(t * 4 - k * 0.6) * 0.06);
  const glowK = clamp(p.glow) * light;
  return (
    <g transform={tf}>
      <defs>
        <radialGradient id={`${id}-skin`} gradientUnits="userSpaceOnUse" cx={40} cy={-60} r={190}>
          <stop offset="0" stopColor={SKIN.mid} />
          <stop offset="0.55" stopColor={SKIN.base} />
          <stop offset="1" stopColor={SKIN.dark} />
        </radialGradient>
        {/* luz de la esca sobre la piel */}
        <radialGradient id={`${id}-lit`} gradientUnits="userSpaceOnUse" cx={esca.x} cy={esca.y} r={220}>
          <stop offset="0" stopColor="#7ff6ff" stopOpacity={0.55 * glowK} />
          <stop offset="0.45" stopColor="#3fb8d8" stopOpacity={0.16 * glowK} />
          <stop offset="1" stopColor="#3fb8d8" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-tooth`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#bfb6a4" />
        </linearGradient>
        <radialGradient id={`${id}-mouth`} gradientUnits="userSpaceOnUse" cx={50} cy={10} r={90}>
          <stop offset="0" stopColor="#120305" />
          <stop offset="1" stopColor={SKIN.mouth} />
        </radialGradient>
      </defs>
      {/* aleta caudal y pedúnculo (oscilan alrededor de la base de la cola) */}
      <g transform={`rotate(${tailDeg.toFixed(2)} -112 0)`}>
        <path d={smoothPath([{x: -128, y: -10}, ...caudal, {x: -128, y: 10}], true, 0.7)} fill={SKIN.fin} opacity={0.75} />
        {caudal.map((c, i) => (
          <line key={i} x1={-130} y1={0} x2={c.x} y2={c.y} stroke="#4a3d36" strokeWidth={1.6} />
        ))}
      </g>
      {[dorsal, anal].map((rays, j) => {
        const b = j === 0 ? {x: -96, y: -58} : {x: -96, y: 58 * g};
        const b2 = j === 0 ? {x: -120, y: -26} : {x: -120, y: 26};
        return (
          <g key={j}>
            <path d={smoothPath([b, ...rays, b2], true, 0.6)} fill={SKIN.fin} opacity={0.7} />
            {rays.map((r, i) => (
              <line key={i} x1={b.x + (b2.x - b.x) * (i / 6)} y1={b.y + (b2.y - b.y) * (i / 6)} x2={r.x} y2={r.y} stroke="#4a3d36" strokeWidth={1.3} />
            ))}
          </g>
        );
      })}
      {/* interior de la boca + dientes internos (antes de las mandíbulas) */}
      <path d={`M${C.x},${C.y} L${U.x},${U.y} L${rLJ.x.toFixed(1)},${rLJ.y.toFixed(1)} Z`} fill={`url(#${id}-mouth)`} />
      {UPPER.map((th, i) => (
        <path key={`u${i}`} d={toothPath(C, U, th, 1)} fill={`url(#${id}-tooth)`} />
      ))}
      {LOWER.map((th, i) => (
        <path key={`l${i}`} d={toothPath(C, rLJ, th, -1)} fill={`url(#${id}-tooth)`} />
      ))}
      {/* membrana gular que se estira al abrir */}
      <path d={`M${T.x},${T.y} L${rT.x.toFixed(1)},${rT.y.toFixed(1)} L${rB.x.toFixed(1)},${rB.y.toFixed(1)} L${(rB.x - 30).toFixed(1)},${(rB.y + 40).toFixed(1)} L${14},${96 * g} Z`} fill={SKIN.base} />
      {/* mandíbula inferior */}
      <g transform={`rotate(${deg.toFixed(2)} ${C.x} ${C.y})`}>
        <path d={jawPath} fill={`url(#${id}-skin)`} />
        <path d={jawPath} fill={`url(#${id}-lit)`} />
      </g>
      {/* cuerpo */}
      <path d={bodyPath} fill={`url(#${id}-skin)`} />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.k < 0.6 ? '#3a2f2a' : '#070505'} opacity={0.6} />
      ))}
      <path d={bodyPath} fill={`url(#${id}-lit)`} />
      <path d={smoothPath(back.slice(0, 8))} stroke="#6fe8ff" strokeOpacity={0.45 * glowK} strokeWidth={2.5} fill="none" />
      {/* aleta pectoral */}
      <path d={smoothPath([{x: -6, y: 24}, ...pectR, {x: -6, y: 24}], true, 0.6)} fill={SKIN.fin} opacity={0.8} />
      {pectR.map((r, i) => (
        <line key={i} x1={-6} y1={24} x2={r.x} y2={r.y} stroke="#54463e" strokeWidth={1.2} />
      ))}
      {/* colmillos exteriores (visibles con la boca cerrada) */}
      {FANGS_U.map((th, i) => (
        <path key={`fu${i}`} d={toothPath(C, U, th, 1)} fill={`url(#${id}-tooth)`} />
      ))}
      {FANGS_L.map((th, i) => (
        <path key={`fl${i}`} d={toothPath(C, rLJ, th, -1)} fill={`url(#${id}-tooth)`} />
      ))}
      {/* ojo pequeño */}
      <circle cx={60} cy={-46} r={6} fill="#05070a" stroke="#3a4048" strokeWidth={1.2} />
      <circle cx={58.5} cy={-47.5} r={1.6} fill="#bff6ff" opacity={0.5 + 0.5 * glowK} />
      {/* barbilla ramificada */}
      {barbel.segs.map(([a, b, depth], i) => (
        <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={mixColor(SKIN.fin, '#000000', 0.2)} strokeWidth={3.2 - depth * 0.7} strokeLinecap="round" />
      ))}
      {/* illicium + esca */}
      <path d={smoothPath(illicium)} stroke="#2e2622" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d={smoothPath(illicium)} stroke="#7a6a60" strokeOpacity={0.4} strokeWidth={1.2} fill="none" />
      {[0, 1, 2].map((k) => {
        const ang = -0.8 + k * 0.8 + Math.sin(t * 2 + k) * 0.2;
        return <path key={k} d={`M${esca.x},${esca.y} q${Math.cos(ang) * 8},${Math.sin(ang) * 8 - 4} ${Math.cos(ang) * 16},${Math.sin(ang) * 16}`} stroke="#c9f6ff" strokeOpacity={0.55} strokeWidth={1.4} fill="none" />;
      })}
      <circle cx={esca.x} cy={esca.y} r={9} fill="#d9fbff" opacity={0.35 + 0.6 * glowK} />
    </g>
  );
};

/** Luces de la hembra (se dibujan por encima de la capa de oscuridad, en modo "screen"). */
export const AnglerGlow: React.FC<{id: string; pose: AnglerPose; zoom: number}> = ({id, pose}) => {
  const g = clamp(pose.p.glow);
  if (g <= 0.005) return null;
  const e = pose.escaWorld;
  const s = pose.p.scale;
  const flicker = 0.92 + 0.08 * Math.sin(pose.p.t * 5.3) * Math.sin(pose.p.t * 1.7);
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-halo`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#c8fbff" stopOpacity={0.9} />
          <stop offset="0.2" stopColor="#5fe6ff" stopOpacity={0.4} />
          <stop offset="0.6" stopColor="#2a8cc8" stopOpacity={0.1} />
          <stop offset="1" stopColor="#2a8cc8" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={e.x} cy={e.y} r={170 * s * g * flicker} fill={`url(#${id}-halo)`} opacity={0.55} />
      <circle cx={e.x} cy={e.y} r={34 * s * g} fill={`url(#${id}-halo)`} />
      <circle cx={e.x} cy={e.y} r={7 * s} fill="#ffffff" opacity={g} />
      {pose.barbel.tips.map((tp, i) => {
        const w = pose.toWorld(tp);
        const k = 0.5 + 0.5 * Math.sin(pose.p.t * 2 + i * 1.7);
        return <circle key={i} cx={w.x} cy={w.y} r={(5 + 4 * k) * s} fill={`url(#${id}-halo)`} opacity={0.7 * g} />;
      })}
    </g>
  );
};
