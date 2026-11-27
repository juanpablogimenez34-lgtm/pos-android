// HORMIGA EN VISTA LATERAL (macro, cámara a pocos milímetros del suelo).
//  · SEIS PATAS ARTICULADAS: coxa, trocánter, fémur, tibia y tarso (3 tarsómeros + uñas). Las 3 del lado cercano
//    se dibujan delante del cuerpo y las 3 del lado lejano detrás, más oscuras. IK de dos huesos (fémur–tibia) con
//    la rodilla hacia arriba; la coxa gira con la fase (protracción/retracción).
//  · MARCHA TRÍPODE ALTERNANTE: grupo A = L1, R2, L3 y grupo B = R1, L2, R3. La fase sale de la DISTANCIA
//    recorrida (no del tiempo): en apoyo, el pie retrocede respecto al cuerpo exactamente lo que el cuerpo avanza,
//    así que queda fijo en el mundo (sin patinar) a cualquier velocidad; en vuelo describe un arco. Cada pie se
//    apoya sobre el terreno real (`ground(x)`), incluidas las piedras.
//  · ANTENAS acodadas (escapo + funículo articulado, con maza en Solenopsis), MANDÍBULAS que se abren y sujetan,
//    cabeza con giro propio, mesosoma, pecíolo de 1 o 2 nudos, GÁSTER que se flexiona, acidoporo con secreción de
//    ácido fórmico (Camponotus) o AGUIJÓN que se extiende (Solenopsis).
import React from 'react';
import {clamp, hash1, lerp, mixColor, smoothPath} from '../../../engine/math';
import {AntSpec, LegSpec, V} from './species';

const f1 = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);
export type AntPose = {
  x: number; y: number; angle: number; facing: number; scale: number; t: number;
  dist: number; // distancia recorrida acumulada (unidades locales) → fase de la marcha
  speed?: number; // 0–1 (altura del paso)
  head?: number; // giro de la cabeza (rad, + abajo)
  mand?: number; // 0 cerrada … 1 abierta
  gaster?: number; // flexión del gáster (rad, + se curva hacia delante por debajo)
  sting?: number; // 0–1 extensión del aguijón
  spray?: number; // 0–1 secreción de ácido fórmico
  scan?: number; // amplitud de exploración de las antenas
  antTarget?: number; // inclinación de las antenas hacia delante/abajo (−1…1)
  seed?: number; detail?: number; tone?: number; rim?: number;
  stance?: number; // 0 normal … 1 postura defensiva (cuerpo alto, cabeza levantada)
};
export type Ground = (x: number) => number;

const ang = (a: V, b: V) => Math.atan2(b.y - a.y, b.x - a.x);
const add = (a: V, b: V) => ({x: a.x + b.x, y: a.y + b.y});
const pol = (a: number, l: number): V => ({x: Math.cos(a) * l, y: Math.sin(a) * l});
/** IK de dos huesos: devuelve la rodilla (eligiendo la solución más alta). */
function ik(A: V, T: V, a: number, b: number): V {
  const dx = T.x - A.x;
  const dy = T.y - A.y;
  const d = clamp(Math.hypot(dx, dy), Math.abs(a - b) + 1e-3, a + b - 1e-3);
  const th = Math.atan2(dy, dx);
  const al = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1));
  const k1 = add(A, pol(th - al, a));
  const k2 = add(A, pol(th + al, a));
  return k1.y < k2.y ? k1 : k2;
}
export type LegGeo = {coxa0: V; coxa1: V; troch: V; knee: V; ankle: V; foot: V; tars: V[]; swing: number};

/** Geometría de una pata en el MUNDO. side: 0 cercano (R), 1 lejano (L). */
export function legGeo(spec: AntSpec, P: AntPose, i: number, side: 0 | 1, ground: Ground): LegGeo {
  const L: LegSpec = spec.legs[i];
  const sc = P.scale;
  const fs = P.facing >= 0 ? 1 : -1;
  const fx = Math.abs(P.facing) < 1 ? P.facing : fs;
  const ca = Math.cos(P.angle);
  const sa = Math.sin(P.angle);
  const W = (p: V): V => ({x: P.x + (p.x * fx * sc) * ca - p.y * sc * sa, y: P.y + (p.x * fx * sc) * sa + p.y * sc * ca});
  // trípode: cercano = R1 (B), R2 (A), R3 (B); lejano = L1 (A), L2 (B), L3 (A)
  const groupA = side === 0 ? i === 1 : i !== 1;
  const duty = 0.56;
  const c = P.dist / spec.stride + (groupA ? 0 : 0.5) + (P.seed ?? 0) * 0.07;
  const f = c - Math.floor(c);
  const half = spec.stride * duty * 0.5;
  let lx: number;
  let lift = 0;
  if (f < duty) lx = L.rest + half - (f / duty) * 2 * half;
  else {
    const u = (f - duty) / (1 - duty);
    lx = L.rest - half + u * 2 * half;
    lift = Math.sin(Math.PI * u) * 75 * clamp(P.speed ?? 1, 0.25, 1.2);
  }
  const stance = P.stance ?? 0;
  const spread = side === 1 ? 0.94 : 1; // el lado lejano se ve algo más corto (perspectiva)
  const footW0 = W({x: lx * spread, y: spec.ground});
  const gy = ground(footW0.x) - (side === 1 ? 10 * sc : 0);
  const foot = {x: footW0.x, y: gy - lift * sc};
  const swingK = f < duty ? 0 : Math.sin(Math.PI * (f - duty) / (1 - duty));
  // coxa y trocánter (la coxa oscila con la fase)
  const swingAng = (f < duty ? 0.5 - f / duty : -0.5 + (f - duty) / (1 - duty)) * 0.22;
  const coxa0 = W({x: L.base.x + (side === 1 ? 12 : 0), y: L.base.y - (side === 1 ? 6 : 0)});
  const cA = L.coxaAng - swingAng - stance * 0.1;
  const coxa1 = W(add({x: L.base.x + (side === 1 ? 12 : 0), y: L.base.y}, pol(cA, L.coxa)));
  const troch = W(add(add({x: L.base.x + (side === 1 ? 12 : 0), y: L.base.y}, pol(cA, L.coxa)), pol(cA + 0.4, L.troch)));
  // tarso: hacia delante en la pata delantera, hacia atrás en la trasera; se curva en vuelo
  const tA = L.tarsAng + (L.tarsAng < Math.PI / 2 ? 1 : -1) * swingK * 0.5;
  const tv = pol(tA, L.tarsus * sc);
  const tvW = {x: tv.x * fs, y: tv.y};
  const ankle = {x: foot.x - tvW.x, y: foot.y - tvW.y};
  const knee = ik(troch, ankle, L.femur * sc, L.tibia * sc);
  const tars = [ankle, {x: lerp(ankle.x, foot.x, 0.45), y: lerp(ankle.y, foot.y, 0.45) - 4 * sc}, {x: lerp(ankle.x, foot.x, 0.78), y: lerp(ankle.y, foot.y, 0.78) - 2 * sc}, foot];
  return {coxa0, coxa1, troch, knee, ankle, foot, tars, swing: swingK};
}

const Leg: React.FC<{g: LegGeo; sc: number; col: string; light: string; far: boolean; detail: number}> = ({g, sc, col, light, far, detail}) => {
  const w = (n: number) => f1(n * sc);
  const c = far ? mixColor(col, '#000', 0.45) : col;
  const seg = (a: V, b: V, wa: number, wb: number) => {
    const an = ang(a, b) + Math.PI / 2;
    const ca = Math.cos(an);
    const sa = Math.sin(an);
    return `M${f1(a.x + ca * wa)} ${f1(a.y + sa * wa)}L${f1(b.x + ca * wb)} ${f1(b.y + sa * wb)}L${f1(b.x - ca * wb)} ${f1(b.y - sa * wb)}L${f1(a.x - ca * wa)} ${f1(a.y - sa * wa)}Z`;
  };
  return (
    <g>
      <path d={seg(g.coxa0, g.coxa1, 24 * sc, 20 * sc)} fill={c} />
      <path d={seg(g.coxa1, g.troch, 18 * sc, 16 * sc)} fill={mixColor(c, '#000', 0.15)} />
      <path d={seg(g.troch, g.knee, 21 * sc, 15 * sc)} fill={c} />
      <path d={seg(g.knee, g.ankle, 14 * sc, 9 * sc)} fill={c} />
      {!far && detail > 0.5 && <path d={`M${f1(g.troch.x)} ${f1(g.troch.y)}L${f1(g.knee.x)} ${f1(g.knee.y)}`} stroke={light} strokeWidth={w(4)} opacity={0.5} strokeLinecap="round" />}
      {detail > 0.5 && [0.3, 0.55, 0.8].map((u) => {
        const p = {x: lerp(g.knee.x, g.ankle.x, u), y: lerp(g.knee.y, g.ankle.y, u)};
        const an = ang(g.knee, g.ankle) + 0.6;
        return <path key={u} d={`M${f1(p.x)} ${f1(p.y)}l${f1(Math.cos(an) * 14 * sc)} ${f1(Math.sin(an) * 14 * sc)}`} stroke={c} strokeWidth={w(2.5)} />;
      })}
      <path d={smoothPath(g.tars)} stroke={c} strokeWidth={w(7)} fill="none" strokeLinecap="round" />
      {detail > 0.5 && g.tars.slice(1, 3).map((p, k) => <circle key={k} cx={f1(p.x)} cy={f1(p.y)} r={w(4.5)} fill={mixColor(c, '#000', 0.2)} />)}
      {[g.coxa1, g.troch, g.knee, g.ankle].map((p, k) => <circle key={`j${k}`} cx={f1(p.x)} cy={f1(p.y)} r={w(k === 2 ? 11 : 9)} fill={mixColor(c, light, far ? 0 : 0.12)} />)}
      {detail > 0.5 && <path d={`M${f1(g.foot.x)} ${f1(g.foot.y)}l${f1(6 * sc)} ${f1(5 * sc)}M${f1(g.foot.x)} ${f1(g.foot.y)}l${f1(-6 * sc)} ${f1(5 * sc)}`} stroke={c} strokeWidth={w(2.5)} />}
    </g>
  );
};

/** Puntos clave en el mundo (para coreografía, contactos y efectos). */
export function antPoint(spec: AntSpec, P: AntPose, p: V): V {
  const fx = Math.abs(P.facing) < 1 ? P.facing : P.facing >= 0 ? 1 : -1;
  const ca = Math.cos(P.angle);
  const sa = Math.sin(P.angle);
  return {x: P.x + p.x * fx * P.scale * ca - p.y * P.scale * sa, y: P.y + p.x * fx * P.scale * sa + p.y * P.scale * ca};
}
export const headTip = (spec: AntSpec, P: AntPose) => antPoint(spec, P, {x: spec.mand.base.x + spec.mand.len * 0.7, y: spec.mand.base.y + 10});
export function gasterTip(spec: AntSpec, P: AntPose): V {
  const g = spec.gaster;
  const a = P.gaster ?? 0;
  const tip = {x: g.c.x - g.rx * 0.98, y: g.c.y + 20};
  const r = {x: g.joint.x + (tip.x - g.joint.x) * Math.cos(-a) - (tip.y - g.joint.y) * Math.sin(-a), y: g.joint.y + (tip.x - g.joint.x) * Math.sin(-a) + (tip.y - g.joint.y) * Math.cos(-a)};
  return antPoint(spec, P, r);
}

export const AntSide: React.FC<{spec: AntSpec; p: AntPose; uid: string; ground: Ground}> = ({spec: S, p: P, uid, ground}) => {
  const C = S.colors;
  const tone = clamp(P.tone ?? 0);
  const dk = (c: string) => mixColor(c, '#0a0805', tone * 0.6);
  const detail = P.detail ?? 1;
  const sc = P.scale;
  const fx = Math.abs(P.facing) < 1 ? P.facing : P.facing >= 0 ? 1 : -1;
  const stance = clamp(P.stance ?? 0);
  const legs = [0, 1, 2].map((i) => [legGeo(S, P, i, 1, ground), legGeo(S, P, i, 0, ground)]);
  const id = `ant-${uid}`;
  const t = P.t;
  const seed = P.seed ?? 0;
  const headA = (P.head ?? 0) - stance * 0.25;
  const H = S.head;
  const mand = clamp(P.mand ?? 0);
  // antenas: escapo + funículo articulado
  const antenna = (far: boolean) => {
    const sh = far ? 1.3 : 0;
    const scan = P.scan ?? 0.6;
    const base = {x: S.ant.base.x - (far ? 14 : 0), y: S.ant.base.y + (far ? -6 : 0)};
    const a1 = -0.8 + Math.sin(t * 1.6 + seed + sh) * 0.2 * scan - stance * 0.2;
    const elbow = add(base, pol(a1, S.ant.scape));
    let a = a1 + 1.2 + (P.antTarget ?? 0) * 0.4 + Math.sin(t * 2.3 + seed * 2 + sh) * 0.35 * scan;
    const pts: V[] = [base, elbow];
    let q = elbow;
    for (let k = 0; k < S.ant.n; k++) {
      a += 0.035 + Math.sin(t * 3.1 + k * 0.5 + sh + seed) * 0.03 * scan;
      q = add(q, pol(a, S.ant.seg));
      pts.push(q);
    }
    return pts;
  };
  const rotHead = (p: V): V => {
    const dx = p.x - H.neck.x;
    const dy = p.y - H.neck.y;
    return {x: H.neck.x + dx * Math.cos(headA) - dy * Math.sin(headA), y: H.neck.y + dx * Math.sin(headA) + dy * Math.cos(headA)};
  };
  const antFar = antenna(true).map(rotHead);
  const antNear = antenna(false).map(rotHead);
  const mandPath = (open: number, far: boolean) => {
    const b = rotHead({x: S.mand.base.x - (far ? 10 : 0), y: S.mand.base.y - (far ? 4 : 0)});
    const a0 = 0.32 + headA + (far ? -1 : 1) * open * (far ? 0.45 : 0.75);
    const l = S.mand.len;
    const d = pol(a0, l);
    const n = pol(a0 + Math.PI / 2, l * 0.22);
    const tip = add(b, d);
    let path = `M${f1(b.x - n.x * 0.5)} ${f1(b.y - n.y * 0.5)}Q${f1(b.x + d.x * 0.6 - n.x * 0.9)} ${f1(b.y + d.y * 0.6 - n.y * 0.9)} ${f1(tip.x)} ${f1(tip.y)}`;
    // borde interno dentado
    for (let k = S.mand.teeth; k >= 0; k--) {
      const u = k / S.mand.teeth;
      const pp = {x: b.x + d.x * u + n.x * 0.55, y: b.y + d.y * u + n.y * 0.55};
      const tt = {x: pp.x + n.x * 0.16 - d.x * 0.03, y: pp.y + n.y * 0.16 - d.y * 0.03};
      path += `L${f1(tt.x)} ${f1(tt.y)}L${f1(pp.x - d.x * 0.06)} ${f1(pp.y - d.y * 0.06)}`;
    }
    return path + 'Z';
  };
  // mesosoma
  const M = S.meso;
  const meso = smoothPath([
    {x: M.front, y: M.top + 55}, {x: M.front - 60, y: M.top + 10}, {x: (M.front + M.back) / 2 + M.hump, y: M.top}, {x: M.back + 70, y: M.top + (S.id === 'red' ? 35 : 15)},
    {x: M.back, y: M.top + 70}, {x: M.back + 10, y: M.bottom}, {x: (M.front + M.back) / 2, y: M.bottom + 15}, {x: M.front - 10, y: M.bottom},
  ], true);
  // gáster flexionado
  const G = S.gaster;
  const ga = P.gaster ?? 0;
  const gT = `rotate(${f1((-ga * 180) / Math.PI)} ${G.joint.x} ${G.joint.y})`;
  const tipL = {x: G.c.x - G.rx * 0.98, y: G.c.y + 20};
  const tipW = gasterTip(S, P);
  const tr = `translate(${f1(P.x)} ${f1(P.y)}) rotate(${f1((P.angle * 180) / Math.PI)}) scale(${f1(fx * sc * 10000) / 10000} ${f1(sc * 10000) / 10000})`;
  const spray = clamp(P.spray ?? 0);
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-b`} cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor={dk(C.light)} />
          <stop offset="0.45" stopColor={dk(C.body)} />
          <stop offset="1" stopColor={dk(C.dark)} />
        </radialGradient>
        <radialGradient id={`${id}-g`} cx="0.45" cy="0.3" r="0.8">
          <stop offset="0" stopColor={dk(C.gasterLight)} />
          <stop offset="0.5" stopColor={dk(C.gaster)} />
          <stop offset="1" stopColor={dk(mixColor(C.gaster, '#000', 0.5))} />
        </radialGradient>
        <radialGradient id={`${id}-e`} cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#8a8070" />
          <stop offset="1" stopColor={C.eye} />
        </radialGradient>
      </defs>
      {/* sombra de contacto en el suelo */}
      <ellipse cx={f1(P.x)} cy={f1(ground(P.x) + 4 * sc)} rx={f1(560 * sc)} ry={f1(40 * sc)} fill="#1a1006" opacity={0.28} />
      {/* patas del lado lejano */}
      {legs.map((l, i) => <Leg key={`far${i}`} g={l[0]} sc={sc} col={dk(C.leg)} light={C.legLight} far detail={detail} />)}
      <g transform={tr}>
        {/* antena y mandíbula lejanas */}
        <path d={smoothPath(antFar)} stroke={dk(mixColor(C.leg, '#000', 0.4))} strokeWidth={13} fill="none" strokeLinecap="round" />
        <path d={mandPath(mand, true)} fill={dk(mixColor(C.mand, '#000', 0.35))} />
        {/* gáster */}
        <g transform={gT}>
          <ellipse cx={G.c.x} cy={G.c.y} rx={G.rx} ry={G.ry} fill={`url(#${id}-g)`} stroke={dk('#000')} strokeWidth={3} />
          {Array.from({length: G.bands}, (_, k) => {
            const x = G.c.x + G.rx * (0.55 - k * 0.32);
            const h = G.ry * Math.sqrt(Math.max(0, 1 - ((x - G.c.x) / G.rx) ** 2));
            return <path key={k} d={`M${f1(x + 8)} ${f1(G.c.y - h)}Q${f1(x - 30)} ${G.c.y} ${f1(x + 8)} ${f1(G.c.y + h)}`} stroke={dk(mixColor(C.gaster, C.gasterLight, 0.6))} strokeWidth={4} fill="none" opacity={0.7} />;
          })}
          <ellipse cx={G.c.x + G.rx * 0.15} cy={G.c.y - G.ry * 0.5} rx={G.rx * 0.45} ry={G.ry * 0.16} fill="#ffffff" opacity={0.22 + (P.rim ?? 0) * 0.2} />
          {detail > 0.5 && Array.from({length: 22}, (_, k) => {
            const a = Math.PI * (1.05 + (k / 21) * 0.9);
            const px = G.c.x + Math.cos(a) * G.rx;
            const py = G.c.y + Math.sin(a) * G.ry;
            return <path key={`h${k}`} d={`M${f1(px)} ${f1(py)}l${f1(Math.cos(a - 0.5) * 22)} ${f1(Math.sin(a - 0.5) * 22)}`} stroke={C.hair} strokeWidth={2.4} opacity={S.id === 'black' ? 0.75 : 0.35} />;
          })}
          {/* acidoporo (Camponotus) o aguijón (Solenopsis) */}
          {S.sting ? (
            <path d={`M${tipL.x + 6} ${tipL.y - 8}L${f1(tipL.x - 20 - (P.sting ?? 0) * 70)} ${tipL.y + 4}L${tipL.x + 6} ${tipL.y + 10}Z`} fill={dk('#1a0a06')} />
          ) : (
            <circle cx={tipL.x + 4} cy={tipL.y} r={9} fill={dk('#3a2a1a')} />
          )}
        </g>
        {/* cintura: pecíolo (1 o 2 nudos) */}
        {S.waist.map((w, k) => <ellipse key={k} cx={w.c.x} cy={w.c.y} rx={w.rx} ry={w.ry} fill={`url(#${id}-b)`} stroke={dk('#000')} strokeWidth={2.5} />)}
        {/* mesosoma */}
        <path d={meso} fill={`url(#${id}-b)`} stroke={dk('#000')} strokeWidth={3} />
        {detail > 0.5 && <path d={`M${M.front - 80} ${M.top + 20}Q${M.front - 95} ${M.bottom - 10} ${M.front - 70} ${M.bottom}M${M.back + 110} ${M.top + 15}Q${M.back + 95} ${M.bottom - 20} ${M.back + 110} ${M.bottom}`} stroke={dk(mixColor(C.body, '#000', 0.5))} strokeWidth={3} fill="none" />}
        <path d={`M${M.front - 70} ${M.top + 22}Q${(M.front + M.back) / 2 + M.hump} ${M.top + 4} ${M.back + 80} ${M.top + 26}`} stroke="#ffffff" strokeWidth={10} fill="none" opacity={0.18 + (P.rim ?? 0) * 0.25} strokeLinecap="round" />
        {/* cabeza */}
        <g transform={`rotate(${f1((headA * 180) / Math.PI)} ${H.neck.x} ${H.neck.y})`}>
          <ellipse cx={H.c.x} cy={H.c.y} rx={H.rx} ry={H.ry} fill={`url(#${id}-b)`} stroke={dk('#000')} strokeWidth={3} />
          <ellipse cx={H.c.x - 10} cy={H.c.y - H.ry * 0.55} rx={H.rx * 0.5} ry={H.ry * 0.15} fill="#ffffff" opacity={0.2 + (P.rim ?? 0) * 0.2} />
          {/* ojo compuesto con facetas */}
          <ellipse cx={S.eye.c.x} cy={S.eye.c.y} rx={S.eye.rx} ry={S.eye.ry} fill={`url(#${id}-e)`} stroke={dk('#000')} strokeWidth={2} />
          {detail > 0.5 && Array.from({length: 18}, (_, k) => {
            const u = hash1(k * 3.1) * 2 - 1;
            const v = hash1(k * 5.7) * 2 - 1;
            if (u * u + v * v > 0.8) return null;
            return <circle key={k} cx={f1(S.eye.c.x + u * S.eye.rx * 0.8)} cy={f1(S.eye.c.y + v * S.eye.ry * 0.8)} r={S.eye.rx * 0.11} fill="none" stroke="#000" strokeWidth={1.2} opacity={0.35} />;
          })}
          <ellipse cx={S.eye.c.x - S.eye.rx * 0.3} cy={S.eye.c.y - S.eye.ry * 0.35} rx={S.eye.rx * 0.28} ry={S.eye.ry * 0.2} fill="#ffffff" opacity={0.55} />
          {/* clípeo y surco */}
          <path d={`M${H.c.x + H.rx * 0.55} ${H.c.y + H.ry * 0.1}Q${H.c.x + H.rx * 0.85} ${H.c.y + H.ry * 0.45} ${H.c.x + H.rx * 0.95} ${H.c.y + H.ry * 0.35}`} stroke={dk(mixColor(C.body, '#000', 0.5))} strokeWidth={3} fill="none" />
        </g>
        {/* mandíbula y antena cercanas */}
        <path d={mandPath(mand, false)} fill={dk(C.mand)} stroke={dk('#000')} strokeWidth={2} />
        <path d={smoothPath(antNear)} stroke={dk(C.leg)} strokeWidth={14} fill="none" strokeLinecap="round" />
        {detail > 0.5 && antNear.slice(2).map((q, k) => <circle key={k} cx={f1(q.x)} cy={f1(q.y)} r={k >= antNear.length - 2 - S.ant.club ? (S.ant.club ? 13 : 8) : 7.5} fill={dk(mixColor(C.leg, C.legLight, 0.25))} />)}
        <circle cx={antNear[1].x} cy={antNear[1].y} r={10} fill={dk(C.leg)} />
      </g>
      {/* patas del lado cercano */}
      {legs.map((l, i) => <Leg key={`near${i}`} g={l[1]} sc={sc} col={dk(C.leg)} light={C.legLight} far={false} detail={detail} />)}
      {/* secreción defensiva de ácido fórmico (representación educativa) */}
      {spray > 0.01 && Array.from({length: 18}, (_, k) => {
        const ph = ((t * 1.8 + k / 18) % 1);
        const dir = ang(antPoint(S, P, G.joint), tipW) + (hash1(k) - 0.5) * 0.7;
        return <circle key={`s${k}`} cx={f1(tipW.x + Math.cos(dir) * ph * 160 * sc * 2)} cy={f1(tipW.y + Math.sin(dir) * ph * 160 * sc * 2)} r={f1((3 + ph * 7) * sc * 2)} fill="#e8f4d8" opacity={spray * 0.55 * (1 - ph)} />;
      })}
      {/* gota de veneno en la punta del aguijón (no es fuego) */}
      {S.sting && (P.sting ?? 0) > 0.5 && <circle cx={f1(tipW.x + (fx >= 0 ? -1 : 1) * 60 * sc)} cy={f1(tipW.y + 6 * sc)} r={f1(9 * sc)} fill="#f4e8a0" opacity={0.85} />}
    </g>
  );
};
