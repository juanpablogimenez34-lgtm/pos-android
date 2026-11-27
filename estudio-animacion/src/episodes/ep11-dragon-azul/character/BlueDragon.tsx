// DRAGÓN AZUL (Glaucus atlanticus) — modelo 2.5D articulado y procedural.
// Anatomía (vista en planta, cabeza hacia +x, unos 390 u de longitud a escala 1):
//  · cuerpo alargado y aplanado que se estrecha en una cola fina; cara VENTRAL (pie) azul con banda
//    central más oscura y bordes claros — es la que mira al cielo, porque flota boca abajo —;
//    cara DORSAL gris plateada (mira al fondo).
//  · cabeza con un par de rinóforos y un par de tentáculos orales cortos; boca con mandíbulas.
//  · 4 grupos de CERATAS por lado sobre pedúnculos cortos; cada grupo, un abanico de dedos
//    cónicos con la punta oscura (cnidosaco, donde se almacenan los nematocistos).
// Partes animables: ondulación de la columna, balanceo de pedúnculos y de cada cerata por
// separado, apertura de los abanicos, giro 3D simulado (roll alrededor del eje largo, con
// cambio de cara azul/plateada y escorzo), inclinación del plano (tilt), alimentación (la cabeza
// se adelanta y la boca se abre), brillo iridiscente y halo luminoso.
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
type V = {x: number; y: number};

export const DRAGON = {
  blue: '#2a6cf0',
  blueDeep: '#0f2f9a',
  blueLight: '#7cc4ff',
  edge: '#e8f4ff',
  stripe: '#0b2378',
  silver: '#c8d6ea',
  silverDark: '#7a8eb4',
  tip: '#0a1650',
  outline: '#06103a',
};

export type DragonPose = {
  x: number;
  y: number;
  scale: number;
  heading: number; // rotación en el plano (rad)
  roll: number; // 0 = cara azul hacia la cámara · π = cara plateada
  tilt: number; // 1 = vista cenital · <1 = plano visto en escorzo
  t: number;
  bend: number; // amplitud de la ondulación lateral
  curve: number; // curvatura estática del cuerpo
  sway: number; // balanceo de las ceratas
  spread: number; // apertura de los abanicos (0 recogidas … 1 abiertas)
  feed: number; // 0 … 1 alimentación (cabeza adelantada, boca abierta)
  bite: number; // fase de mordisco 0…1
  glow: number; // halo luminoso (escenas oscuras)
  shine: number; // intensidad del brillo iridiscente
  light: string; // color de la luz principal (reflejos)
  opacity: number;
  xray: number; // 0…1 transparencia para mostrar la burbuja de aire del estómago
};

export const dragonPose = (o: Partial<DragonPose> = {}): DragonPose => ({
  x: 0,
  y: 0,
  scale: 1,
  heading: 0,
  roll: 0,
  tilt: 1,
  t: 0,
  bend: 1,
  curve: 0,
  sway: 1,
  spread: 1,
  feed: 0,
  bite: 0,
  glow: 0,
  shine: 0.7,
  light: '#eaffff',
  opacity: 1,
  xray: 0,
  ...o,
});

const NS = 16;
const HEAD_X = 190;
const TAIL_X = -200;
/** Semiancho del cuerpo a lo largo (u: 0 cabeza → 1 cola). */
const width = (u: number) => 1.3 * (u < 0.08 ? 14 + 70 * u : u < 0.32 ? 19.6 + 30 * (u - 0.08) : 26.8 * Math.pow(1 - (u - 0.32) / 0.68, 1.4) + 1.5);

/** Columna: puntos y normales (en coordenadas locales, antes del escorzo). */
export function dragonSpine(p: DragonPose) {
  const pts: V[] = [];
  for (let i = 0; i < NS; i++) {
    const u = i / (NS - 1);
    const x = lerp(HEAD_X + p.feed * 16, TAIL_X, u);
    const wave = p.bend * 11 * Math.sin(p.t * 1.25 - u * 3.4) * (0.25 + u);
    const y = wave + p.curve * 90 * (u - 0.4) * (u - 0.4) + 3 * Math.sin(p.t * 0.6);
    pts.push({x, y});
  }
  const nrm = pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(NS - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    return {x: -dy / l, y: dx / l};
  });
  return {pts, nrm};
}
const at = (s: ReturnType<typeof dragonSpine>, u: number) => {
  const f = clamp(u) * (NS - 1);
  const i = Math.min(NS - 2, Math.floor(f));
  const k = f - i;
  const a = s.pts[i];
  const b = s.pts[i + 1];
  return {p: {x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k)}, n: s.nrm[i]};
};

const CLUSTERS = [
  {u: 0.16, len: 1.0, n: 11, back: 0.1},
  {u: 0.3, len: 1.08, n: 12, back: 0.35},
  {u: 0.44, len: 0.88, n: 10, back: 0.55},
  {u: 0.57, len: 0.62, n: 7, back: 0.75},
];

type Finger = {base: V; mid: V; tip: V; w: number; depth: number};

function clusterGeom(p: DragonPose, s: ReturnType<typeof dragonSpine>, ci: number, side: 1 | -1, cy: number): Finger[] {
  const c = CLUSTERS[ci];
  const {p: b, n} = at(s, c.u);
  const w = width(c.u) * 0.9;
  const base = {x: b.x + n.x * w * side, y: b.y + n.y * w * side};
  const dirA = Math.atan2(n.y * side, n.x * side) - side * c.back * 0.9 + Math.sin(p.t * 1.1 + ci * 1.7 + side) * 0.1 * p.sway;
  const armL = 16 * c.len;
  const arm = {x: base.x + Math.cos(dirA) * armL, y: base.y + Math.sin(dirA) * armL};
  const out: Finger[] = [];
  const arc = (0.4 + 1.5 * p.spread) * (0.8 + 0.2 * c.len);
  for (let i = 0; i < c.n; i++) {
    const k = c.n === 1 ? 0 : i / (c.n - 1) - 0.5;
    const seed = ci * 31 + i * 7 + (side > 0 ? 0 : 100);
    const a = dirA + k * arc + Math.sin(p.t * 2.1 + seed * 0.9) * 0.13 * p.sway;
    const L = (58 + 18 * hash1(seed)) * c.len * (1 - Math.abs(k) * 0.35) * (0.7 + 0.3 * p.spread);
    const root = {x: arm.x + Math.cos(dirA + k * 1.4) * 8, y: arm.y + Math.sin(dirA + k * 1.4) * 8};
    const bendA = a + side * 0.25 * Math.sin(p.t * 1.6 + seed);
    const mid = {x: root.x + Math.cos(a) * L * 0.55, y: root.y + Math.sin(a) * L * 0.55};
    const tip = {x: mid.x + Math.cos(bendA) * L * 0.5, y: mid.y + Math.sin(bendA) * L * 0.5};
    out.push({base: root, mid, tip, w: 14 * (0.7 + 0.3 * c.len), depth: side * Math.sign(cy || 1)});
  }
  // el pedúnculo como primer elemento (dedo grueso y corto)
  out.unshift({base, mid: {x: (base.x + arm.x) / 2, y: (base.y + arm.y) / 2}, tip: arm, w: 13 * c.len, depth: 0});
  return out;
}

const Fingers: React.FC<{fs: Finger[]; front: boolean; blueSide: number; tipK: number}> = ({fs, front, blueSide, tipK}) => {
  const body = mixColor(DRAGON.silverDark, DRAGON.blue, blueSide);
  const light = mixColor(DRAGON.silver, DRAGON.blueLight, blueSide);
  const tint = front ? 1 : 0.78;
  return (
    <g opacity={tint}>
      {fs.map((f, i) => {
        if (i === 0) {
          const d = `M${f1(f.base.x)},${f1(f.base.y)} L${f1(f.tip.x)},${f1(f.tip.y)}`;
          return (
            <g key={i}>
              <path d={d} stroke={DRAGON.outline} strokeWidth={f.w + 4} strokeLinecap="round" />
              <path d={d} stroke={body} strokeWidth={f.w} strokeLinecap="round" />
            </g>
          );
        }
        const cone = (a: V, m: V, tp: V, w: number) => {
          const ang = Math.atan2(m.y - a.y, m.x - a.x);
          const nx = -Math.sin(ang);
          const ny = Math.cos(ang);
          const angM = Math.atan2(tp.y - m.y, tp.x - m.x);
          const mx = -Math.sin(angM);
          const my = Math.cos(angM);
          return `M${f1(a.x + nx * w * 0.5)},${f1(a.y + ny * w * 0.5)} Q${f1(m.x + mx * w * 0.42)},${f1(m.y + my * w * 0.42)} ${f1(tp.x)},${f1(tp.y)} Q${f1(m.x - mx * w * 0.42)},${f1(m.y - my * w * 0.42)} ${f1(a.x - nx * w * 0.5)},${f1(a.y - ny * w * 0.5)}Z`;
        };
        const t0 = {x: lerp(f.mid.x, f.tip.x, 0.25), y: lerp(f.mid.y, f.tip.y, 0.25)};
        const tm = {x: lerp(f.mid.x, f.tip.x, 0.62), y: lerp(f.mid.y, f.tip.y, 0.62)};
        return (
          <g key={i}>
            <path d={cone(f.base, f.mid, f.tip, f.w)} fill={body} stroke={DRAGON.outline} strokeWidth={2.4} strokeLinejoin="round" />
            <path d={`M${f1(f.base.x)},${f1(f.base.y)} Q${f1(f.mid.x)},${f1(f.mid.y)} ${f1(t0.x)},${f1(t0.y)}`} stroke={light} strokeWidth={f.w * 0.22} strokeLinecap="round" fill="none" opacity={0.75} />
            <path d={cone(t0, tm, f.tip, f.w * 0.5)} fill={mixColor(DRAGON.tip, DRAGON.silverDark, 1 - blueSide)} />
            <circle cx={lerp(tm.x, f.tip.x, 0.4)} cy={lerp(tm.y, f.tip.y, 0.4)} r={1.6} fill="#ffffff" opacity={0.35 + 0.5 * tipK} />
          </g>
        );
      })}
    </g>
  );
};

export const BlueDragon: React.FC<{p: DragonPose; uid: string}> = ({p, uid}) => {
  const s = dragonSpine(p);
  const cr = Math.cos(p.roll);
  const cy = Math.sign(cr || 1) * Math.max(0.2, Math.abs(cr));
  const blueSide = clamp(0.5 + cr * 1.6); // 1 = cara azul visible
  const thick = Math.sin(p.roll) * 7; // grosor visible al girar (desplaza el borde opuesto)
  // contorno del cuerpo
  const left = s.pts.map((pt, i) => {
    const u = i / (NS - 1);
    const w = width(u);
    return {x: pt.x + s.nrm[i].x * w, y: pt.y + s.nrm[i].y * w};
  });
  const right = s.pts.map((pt, i) => {
    const u = i / (NS - 1);
    const w = width(u);
    return {x: pt.x - s.nrm[i].x * w, y: pt.y - s.nrm[i].y * w};
  });
  const head = s.pts[0];
  const tail = s.pts[NS - 1];
  const outline = `M${f1(head.x + 14)},${f1(head.y)} ${left.map((q) => `L${f1(q.x)},${f1(q.y)}`).join(' ')} Q${f1(tail.x - 18)},${f1(tail.y)} ${f1(right[NS - 1].x)},${f1(right[NS - 1].y)} ${right
    .slice()
    .reverse()
    .map((q) => `L${f1(q.x)},${f1(q.y)}`)
    .join(' ')} Z`;
  const stripe = s.pts.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y)}`).join(' ');
  // ceratas: lado lejano (según el giro) detrás del cuerpo, lado cercano delante
  const nearSide: 1 | -1 = Math.sin(p.roll) >= 0 ? 1 : -1;
  const clusters = ([1, -1] as const).map((side) => CLUSTERS.map((_, ci) => clusterGeom(p, s, ci, side, cy)));
  const tipK = 0.5 + 0.5 * Math.sin(p.t * 3);
  const bodyFill = `url(#dgb-${uid})`;
  const shineX = lerp(HEAD_X, TAIL_X, ((p.t * 0.12) % 1 + 1) % 1);
  const mouthOpen = p.feed * (0.4 + 0.6 * Math.abs(Math.sin(p.bite * Math.PI)));
  // transformación: posición, escala, escorzo del plano y rumbo; el roll comprime el eje lateral
  const T = `translate(${f1(p.x)} ${f1(p.y)}) scale(${(p.scale).toFixed(4)} ${(p.scale * p.tilt).toFixed(4)}) rotate(${f1((p.heading * 180) / Math.PI)}) scale(1 ${cy.toFixed(4)})`;
  const sideLayer = (side: 1 | -1, front: boolean) => (
    <g>
      {clusters[side > 0 ? 0 : 1].map((fs, ci) => (
        <Fingers key={ci} fs={fs} front={front} blueSide={blueSide} tipK={tipK} />
      ))}
    </g>
  );
  return (
    <g opacity={p.opacity}>
      <defs>
        <linearGradient id={`dgb-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mixColor(DRAGON.silver, DRAGON.blueLight, blueSide)} />
          <stop offset="0.3" stopColor={mixColor(DRAGON.silverDark, DRAGON.blue, blueSide)} />
          <stop offset="0.5" stopColor={mixColor('#9aa6ba', DRAGON.blueDeep, blueSide)} />
          <stop offset="0.7" stopColor={mixColor(DRAGON.silverDark, DRAGON.blue, blueSide)} />
          <stop offset="1" stopColor={mixColor(DRAGON.silver, DRAGON.blueLight, blueSide)} />
        </linearGradient>
        <radialGradient id={`dgg-${uid}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#5ab0ff" stopOpacity={0.55} />
          <stop offset="0.5" stopColor="#2a6cf0" stopOpacity={0.18} />
          <stop offset="1" stopColor="#2a6cf0" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`dgi-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="0.45" stopColor={p.light} stopOpacity={0.85} />
          <stop offset="0.55" stopColor="#c8a0ff" stopOpacity={0.5} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <g transform={T}>
        {p.glow > 0.01 && <ellipse cx={0} cy={0} rx={330} ry={240} fill={`url(#dgg-${uid})`} opacity={p.glow} />}
        {sideLayer(-nearSide as 1 | -1, false)}
        {/* grosor del cuerpo (canto) visible al girar */}
        {Math.abs(thick) > 0.5 && <path d={outline} transform={`translate(0 ${f1(thick)})`} fill={mixColor(DRAGON.silverDark, DRAGON.blueDeep, 1 - blueSide)} stroke={DRAGON.outline} strokeWidth={3} />}
        <path d={outline} fill={bodyFill} stroke={DRAGON.outline} strokeWidth={4} strokeLinejoin="round" />
        {/* banda central del pie y bordes claros (cara azul) / línea dorsal (cara plateada) */}
        <path d={stripe} stroke={mixColor('#8f9bb0', DRAGON.stripe, blueSide)} strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.85} />
        <path d={stripe} stroke={mixColor('#e6edf6', DRAGON.blueLight, blueSide)} strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={0.55} transform="translate(0 -9)" />
        <path d={left.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y)}`).join(' ')} stroke={DRAGON.edge} strokeWidth={2.5} fill="none" opacity={0.6 * blueSide + 0.25} />
        <path d={right.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y)}`).join(' ')} stroke={DRAGON.edge} strokeWidth={2.5} fill="none" opacity={0.6 * blueSide + 0.25} />
        {/* burbuja de aire en el estómago (modo rayos X) */}
        {p.xray > 0.01 && (
          <g opacity={p.xray}>
            <path d={outline} fill="#06103a" opacity={0.35} />
            <ellipse cx={lerp(HEAD_X, TAIL_X, 0.3)} cy={at(s, 0.3).p.y} rx={34} ry={13} fill="#dffcff" opacity={0.85} stroke="#ffffff" strokeWidth={3} />
            <ellipse cx={lerp(HEAD_X, TAIL_X, 0.3) - 10} cy={at(s, 0.3).p.y - 4} rx={10} ry={4} fill="#ffffff" />
          </g>
        )}
        {/* cabeza: tentáculos orales, rinóforos y boca */}
        <g>
          {[1, -1].map((sd) => (
            <g key={sd}>
              <path d={`M${f1(head.x + 4)},${f1(head.y + sd * 10)} q${f1(18 + 4 * Math.sin(p.t * 2 + sd))},${f1(sd * 6)} ${f1(26)},${f1(sd * (16 + 3 * Math.sin(p.t * 1.7 + sd)))}`} stroke={DRAGON.outline} strokeWidth={8} strokeLinecap="round" fill="none" />
              <path d={`M${f1(head.x + 4)},${f1(head.y + sd * 10)} q${f1(18 + 4 * Math.sin(p.t * 2 + sd))},${f1(sd * 6)} ${f1(26)},${f1(sd * (16 + 3 * Math.sin(p.t * 1.7 + sd)))}`} stroke={mixColor(DRAGON.silver, DRAGON.blueLight, blueSide)} strokeWidth={4.5} strokeLinecap="round" fill="none" />
              <path d={`M${f1(head.x - 18)},${f1(head.y + sd * 14)} l${f1(-4)},${f1(sd * 16)}`} stroke={DRAGON.outline} strokeWidth={7} strokeLinecap="round" />
              <path d={`M${f1(head.x - 18)},${f1(head.y + sd * 14)} l${f1(-4)},${f1(sd * 16)}`} stroke={mixColor(DRAGON.silverDark, DRAGON.blue, blueSide)} strokeWidth={4} strokeLinecap="round" />
            </g>
          ))}
          <ellipse cx={head.x + 10} cy={head.y} rx={4 + 6 * mouthOpen} ry={2 + 7 * mouthOpen} fill="#050a20" opacity={0.25 + 0.75 * Math.max(mouthOpen, blueSide * 0.5)} />
          {mouthOpen > 0.05 && (
            <path d={`M${f1(head.x + 8)},${f1(head.y - 6 * mouthOpen)} l8,3 M${f1(head.x + 8)},${f1(head.y + 6 * mouthOpen)} l8,-3`} stroke="#d8c890" strokeWidth={2} />
          )}
        </g>
        {/* reflejo iridiscente que recorre el cuerpo */}
        <ellipse cx={shineX} cy={at(s, clamp((HEAD_X - shineX) / (HEAD_X - TAIL_X))).p.y - 8} rx={46} ry={7} fill={`url(#dgi-${uid})`} opacity={p.shine} />
        <path d={stripe} stroke="#ffffff" strokeWidth={1.5} fill="none" opacity={0.25 * p.shine} transform="translate(0 -14)" />
        {sideLayer(nearSide, true)}
      </g>
    </g>
  );
};

/** Punto local del modelo → coordenadas del padre (para etiquetas y efectos). */
export function dragonPoint(p: DragonPose, lx: number, ly: number): V {
  const cr = Math.cos(p.roll);
  const cy = Math.sign(cr || 1) * Math.max(0.2, Math.abs(cr));
  const y1 = ly * cy;
  const c = Math.cos(p.heading);
  const sn = Math.sin(p.heading);
  const rx = lx * c - y1 * sn;
  const ry = lx * sn + y1 * c;
  return {x: p.x + rx * p.scale, y: p.y + ry * p.scale * p.tilt};
}
export const DRAGON_ANCHORS = {head: [205, 0], rhino: [174, 26], cerata: [70, 92], foot: [40, 0], tail: [-196, 0], tips: [100, 120], stomach: [73, 0]} as const;
