// CAMALEÓN PANTERA (Furcifer pardalis) — personaje vectorial 2.5D articulado.
// Vista lateral (el cuerpo está comprimido lateralmente: su silueta característica se lee de perfil).
// Componentes: tronco con cresta dorsal, casco y hocico, mandíbula articulada, lengua extensible con punta en
// maza, dos torretas oculares con movimiento independiente (la lejana asoma sobre el casco), cuatro patas con IK
// (codo atrás, rodilla adelante) y manos zigodáctilas que abren y cierran sus dos grupos de dedos alrededor de
// la rama, cola prensil de 24 segmentos que se enrolla. Patrón de piel unido al cuerpo: barras, franja lateral,
// tubérculos y escamas que cambian de color por regiones (skin.ts).
import React from 'react';
import {clamp, hash1, lerp, mixColor, smoothPath} from '../../../engine/math';
import {ColorState, Region, skin} from './skin';

export type V = {x: number; y: number};
export type LegKey = 'FN' | 'FF' | 'HN' | 'HF'; // delantera/trasera · cercana/lejana
export type Foot = {p: V; grip: number; lift?: number; branchR?: number}; // grip 1 = dedos cerrados sobre la rama
export type ChamPose = {
  x: number; y: number; angle: number; scale: number; facing: 1 | -1;
  feet: Record<LegKey, Foot>; // en coordenadas de mundo
  breathe: number; // 0..1
  bend: number; // flexión del tronco (rad)
  headPitch: number; // inclinación de la cabeza
  eyeN: {yaw: number; pitch: number}; // ojo cercano (rad, yaw + = hacia delante)
  eyeF: {yaw: number; pitch: number}; // ojo lejano
  blink?: number; // 0..1 (los párpados se cierran en anillo sobre la pupila)
  jaw: number; // 0..1
  tongue?: {ext: number; target: V; prey?: React.ReactNode; bulge?: number}; // ext 0..1 de la distancia al objetivo
  tail: {base: number; curl: number; wave: number; amp: number}; // base: ángulo (rad, + abajo)
  color: ColorState;
  age: number; // 0 cría recién nacida · 1 adulto
  flat?: number; // aplanamiento/oscurecimiento al esconderse (0..1)
  gular?: number; // inflado de la garganta (amenaza)
  shade?: number; // sombra global (lado oculto de la rama)
  rim?: string; // color de la luz de contorno
  rimK?: number;
};

// ---------------------------------------------------------------- GEOMETRÍA BASE (adulto, mirando a la derecha)
const DORSAL: V[] = [
  {x: -44, y: -16}, {x: -20, y: -30}, {x: 4, y: -42}, {x: 34, y: -60}, {x: 66, y: -73}, {x: 100, y: -79}, {x: 136, y: -75}, {x: 166, y: -65}, {x: 190, y: -54}, {x: 208, y: -47},
];
const HEAD_TOP: V[] = [{x: 222, y: -56}, {x: 238, y: -66}, {x: 252, y: -70}, {x: 266, y: -64}, {x: 284, y: -50}, {x: 300, y: -38}, {x: 313, y: -26}, {x: 321, y: -15}];
const SNOUT: V = {x: 323, y: -8};
const UPPER_LIP: V[] = [{x: 318, y: -3}, {x: 300, y: 0}, {x: 282, y: 1}, {x: 266, y: 0}];
const JAW_LOW: V[] = [{x: 316, y: 1}, {x: 300, y: 8}, {x: 280, y: 13}, {x: 258, y: 17}];
const VENTRAL: V[] = [{x: 236, y: 18}, {x: 212, y: 19}, {x: 186, y: 22}, {x: 150, y: 27}, {x: 112, y: 29}, {x: 74, y: 25}, {x: 40, y: 17}, {x: 12, y: 8}, {x: -16, y: 2}, {x: -44, y: 2}];
const MOUTH_PIVOT: V = {x: 262, y: 2};
const EYE_C: V = {x: 262, y: -35};
const SHOULDER: V = {x: 190, y: 2};
const HIP: V = {x: 14, y: -2};
const TAIL_BASE: V = {x: -42, y: -8};
// tubérculos y escamas grandes (posiciones fijas sobre la piel)
const TUBERCLES = Array.from({length: 120}, (_, i) => ({x: -30 + hash1(i * 3.1) * 250, y: -62 + hash1(i * 5.7) * 80, r: 1.6 + hash1(i * 9.3) * 2.4, h: hash1(i * 1.7)}));
const BARS = [28, 62, 98, 134, 168];

const rot = (p: V, a: number, c: V = {x: 0, y: 0}): V => ({x: c.x + (p.x - c.x) * Math.cos(a) - (p.y - c.y) * Math.sin(a), y: c.y + (p.x - c.x) * Math.sin(a) + (p.y - c.y) * Math.cos(a)});
const f1 = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);

/** IK de 2 segmentos; bend ±1 elige el lado de la articulación. */
function ik(o: V, p: V, l1: number, l2: number, bend: number) {
  const dx = p.x - o.x;
  const dy = p.y - o.y;
  const d0 = Math.hypot(dx, dy) || 1e-3;
  const d = clamp(d0, Math.abs(l1 - l2) + 0.5, l1 + l2 - 0.5);
  const a = Math.atan2(dy, dx);
  const al = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const ja = a + bend * al;
  return {j: {x: o.x + Math.cos(ja) * l1, y: o.y + Math.sin(ja) * l1}, e: {x: o.x + (dx / d0) * d, y: o.y + (dy / d0) * d}};
}
/** Tubo de grosor variable a lo largo de una polilínea. */
function tube(pts: V[], w: (u: number) => number) {
  const L: V[] = [];
  const R: V[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l;
    const ny = dx / l;
    const ww = w(i / (pts.length - 1));
    L.push({x: pts[i].x + nx * ww, y: pts[i].y + ny * ww});
    R.push({x: pts[i].x - nx * ww, y: pts[i].y - ny * ww});
  }
  return {L, R, d: smoothPath([...L, ...R.reverse()], true)};
}

/** Puntos de la cola (local). curl > 0 enrolla hacia abajo y hacia dentro. */
export function tailPoints(P: ChamPose, k: number) {
  const N = 24;
  const len = 300 * k;
  const pts: V[] = [{...TAIL_BASE}];
  let a = Math.PI - 0.15 - P.tail.base; // hacia atrás (−x) y algo abajo
  let p = {...TAIL_BASE};
  for (let i = 1; i <= N; i++) {
    const u = i / N;
    a -= (P.tail.curl * 5.4 * Math.pow(u, 2.2)) / N + (Math.sin(P.tail.wave - u * 3) * P.tail.amp) / N;
    const seg = (len / N) * (1 - u * 0.35 * P.tail.curl);
    p = {x: p.x + Math.cos(a) * seg, y: p.y + Math.sin(a) * seg};
    pts.push(p);
  }
  return pts;
}

export const Chameleon: React.FC<{pose: ChamPose; uid: string; detail?: number}> = ({pose: P, uid, detail = 1}) => {
  const age = clamp(P.age);
  // proporciones por edad: la cría tiene cabeza y ojos relativamente mayores, casco bajo y cola más corta
  const headK = lerp(1.25, 1, age);
  const tailK = lerp(0.85, 1, age);
  const casque = lerp(0.35, 1, age);
  const s = P.scale;
  const C = P.color;
  const col = (r: Region, x = 0.5) => {
    const c = skin(C, r, x);
    const sh = (P.shade ?? 0) * 0.55 + (P.flat ?? 0) * 0.15;
    return sh > 0 ? mixColor(c, '#0c120a', sh) : c;
  };
  const toLocal = (q: V): V => {
    const dx = (q.x - P.x) / s;
    const dy = (q.y - P.y) / s;
    const r = rot({x: dx, y: dy}, -P.angle);
    return {x: r.x * P.facing, y: r.y};
  };
  const br = 1 + (P.breathe - 0.5) * 0.05;
  // flexión del tronco: los puntos anteriores giran alrededor de la cadera
  const flex = (p: V) => (p.x > 20 ? rot(p, P.bend * ((p.x - 20) / 290), {x: 20, y: 0}) : p);
  const breathe = (p: V) => (p.x > 10 && p.x < 220 && p.y > -20 ? {x: p.x, y: p.y * br + (P.gular ?? 0) * (p.x > 210 ? 8 : 0)} : p);
  const headT = (p: V) => {
    // cabeza: escala por edad alrededor de la nuca, inclinación propia
    const c = {x: 214, y: -20};
    const q = {x: c.x + (p.x - c.x) * headK, y: c.y + (p.y - c.y) * headK};
    const q2 = p.y < -40 && p.x > 220 ? {x: q.x, y: c.y + (q.y - c.y) * lerp(0.82, 1, casque)} : q;
    return flex(rot(q2, P.headPitch, c));
  };
  const jawA = clamp(P.jaw) * 0.5;
  const jawT = (p: V) => headT(rot(p, jawA, MOUTH_PIVOT));
  const dors = DORSAL.map((p) => flex(breathe(p)));
  const top = HEAD_TOP.map(headT);
  const upLip = UPPER_LIP.map(headT);
  const lowJaw = JAW_LOW.map(jawT);
  const ven = VENTRAL.map((p, i) => (i === 0 ? headT({x: p.x, y: p.y + (P.gular ?? 0) * 10}) : flex(breathe(p))));
  const snout = headT(SNOUT);
  const outline = smoothPath([...dors, ...top, snout, {x: snout.x - 2, y: snout.y + 7}, ...lowJaw.slice(1), ...ven], true);
  const headShape = smoothPath([dors[dors.length - 1], ...top, snout, ...upLip, headT({x: 252, y: 4}), headT({x: 232, y: 10}), headT({x: 214, y: 6})], true);
  const eye = headT(EYE_C);
  const mouthIn = jawA > 0.02 ? smoothPath([headT({x: 316, y: -2}), ...upLip.slice(1), headT(MOUTH_PIVOT), ...lowJaw.slice(1).reverse()], true) : null;

  // ---------------- patas: hombro/cadera (local) → pie (mundo → local)
  const legsOf = (k: LegKey) => {
    const front = k[0] === 'F';
    const far = k[1] === 'F';
    const base = flex(front ? {x: SHOULDER.x - (far ? 8 : 0), y: SHOULDER.y - (far ? 6 : 0)} : {x: HIP.x + (far ? 8 : 0), y: HIP.y - (far ? 6 : 0)});
    const foot = toLocal(P.feet[k].p);
    const l1 = (front ? 46 : 48) * lerp(0.9, 1, age);
    const l2 = (front ? 46 : 47) * lerp(0.9, 1, age);
    const wrist = {x: foot.x, y: foot.y - 9};
    const r = ik(base, wrist, l1, l2, front ? 1 : -1);
    return {base, j: r.j, w: r.e, foot, grip: clamp(P.feet[k].grip), front, far};
  };
  const legs = (['FF', 'HF', 'FN', 'HN'] as LegKey[]).map((k) => ({k, ...legsOf(k)}));
  const Leg = (L: ReturnType<typeof legsOf> & {k: LegKey}) => {
    const c = L.far ? mixColor(col('leg', L.front ? 0.7 : 0.15), '#0e140c', 0.35) : col('leg', L.front ? 0.7 : 0.15);
    const up = tube([L.base, {x: (L.base.x + L.j.x) / 2, y: (L.base.y + L.j.y) / 2}, L.j], (u) => lerp(11, 7.5, u));
    const lo = tube([L.j, {x: (L.j.x + L.w.x) / 2, y: (L.j.y + L.w.y) / 2}, L.w], (u) => lerp(7.5, 5.5, u));
    // mano/pie zigodáctilo: dos grupos de dedos opuestos que abrazan la rama
    const g = L.grip;
    const spread = lerp(0.95, 0.15, g);
    const fl = 15;
    const dirA = Math.PI / 2 + spread; // grupo delantero/trasero
    const dirB = Math.PI / 2 - spread;
    const toe = (a: number, curl: number) => {
      const p0 = L.w;
      const p1 = {x: p0.x + Math.cos(a) * fl * 0.55, y: p0.y + Math.sin(a) * fl * 0.55};
      const a2 = a + curl;
      const p2 = {x: p1.x + Math.cos(a2) * fl * 0.6, y: p1.y + Math.sin(a2) * fl * 0.6};
      return tube([p0, p1, p2], (u) => lerp(4.4, 2.2, u));
    };
    const tA = toe(dirA, g * 0.9);
    const tB = toe(dirB, -g * 0.9);
    return (
      <g key={L.k}>
        <path d={tB.d} fill={mixColor(c, '#101810', 0.3)} stroke="#0f1a10" strokeWidth={1.2} />
        <path d={up.d} fill={c} stroke="#0f1a10" strokeWidth={1.4} />
        <path d={lo.d} fill={c} stroke="#0f1a10" strokeWidth={1.4} />
        <path d={tA.d} fill={mixColor(c, '#ffffff', 0.05)} stroke="#0f1a10" strokeWidth={1.2} />
        {/* garras diminutas */}
        {detail > 0.5 && [tA, tB].map((tt, i) => {
          const e = tt.L[tt.L.length - 1];
          return <circle key={i} cx={f1(e.x)} cy={f1(e.y)} r={1.2} fill="#e8e0c8" />;
        })}
        {/* escamas y luz en la pata */}
        <path d={smoothPath([L.base, L.j, L.w])} stroke={mixColor(c, '#ffffff', 0.35)} strokeWidth={2} fill="none" opacity={0.35} transform="translate(-1.5 -1.5)" />
      </g>
    );
  };

  // ---------------- cola
  const tp = tailPoints(P, tailK);
  const tailT = tube(tp, (u) => lerp(17, 2.6, Math.pow(u, 0.75)));

  // ---------------- ojos (torretas)
  const eyeR = 17 * headK;
  const turret = (c: V, g: {yaw: number; pitch: number}, far: boolean) => {
    const off = {x: Math.sin(clamp(g.yaw, -1.4, 1.4)) * eyeR * 0.55, y: -Math.sin(clamp(g.pitch, -1.2, 1.2)) * eyeR * 0.5};
    const pc = {x: c.x + off.x, y: c.y + off.y};
    const blink = clamp(P.blink ?? 0);
    const rings = [0.92, 0.74, 0.56];
    return (
      <g>
        <circle cx={f1(c.x)} cy={f1(c.y)} r={f1(eyeR)} fill={col('eye', 0.82)} stroke="#0f1a10" strokeWidth={1.4} />
        {/* el cono de escamas se orienta con la mirada */}
        {rings.map((k, i) => (
          <ellipse key={i} cx={f1(lerp(c.x, pc.x, 1 - k))} cy={f1(lerp(c.y, pc.y, 1 - k))} rx={f1(eyeR * k)} ry={f1(eyeR * k * 0.96)} fill="none" stroke={col('eyeLine', 0.82)} strokeWidth={1.1} opacity={0.55} />
        ))}
        {Array.from({length: 10}, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <path key={i} d={`M${f1(pc.x + Math.cos(a) * 6)} ${f1(pc.y + Math.sin(a) * 6)}L${f1(c.x + Math.cos(a) * eyeR * 0.95)} ${f1(c.y + Math.sin(a) * eyeR * 0.95)}`} stroke={col('eyeLine', 0.82)} strokeWidth={1.3} opacity={0.6} />;
        })}
        <circle cx={f1(pc.x)} cy={f1(pc.y)} r={f1(5.6 * (1 - blink * 0.85))} fill="#d8b23a" stroke="#1a1208" strokeWidth={1} />
        <circle cx={f1(pc.x)} cy={f1(pc.y)} r={f1(3.2 * (1 - blink))} fill="#050403" />
        <circle cx={f1(pc.x - 1.4)} cy={f1(pc.y - 1.6)} r={1.1 * (1 - blink)} fill="#fff" opacity={0.85} />
        <circle cx={f1(c.x - eyeR * 0.35)} cy={f1(c.y - eyeR * 0.4)} r={f1(eyeR * 0.3)} fill="#ffffff" opacity={far ? 0.05 : 0.12} />
      </g>
    );
  };
  // ojo lejano: asoma por encima del casco
  const farC = headT({x: EYE_C.x - 4, y: EYE_C.y - 9});

  // ---------------- lengua
  let tongueEl: React.ReactNode = null;
  if (P.tongue && P.tongue.ext > 0.001) {
    const o = headT({x: 306, y: 2});
    const tg = toLocal(P.tongue.target);
    const e = P.tongue.ext;
    const tip = {x: lerp(o.x, tg.x, e), y: lerp(o.y, tg.y, e)};
    const len = Math.hypot(tip.x - o.x, tip.y - o.y);
    const sag = Math.min(14, len * 0.04) * (1 - e * 0.5);
    const mid = {x: (o.x + tip.x) / 2, y: (o.y + tip.y) / 2 + sag};
    const pts: V[] = [];
    for (let i = 0; i <= 14; i++) {
      const u = i / 14;
      pts.push({x: (1 - u) * (1 - u) * o.x + 2 * u * (1 - u) * mid.x + u * u * tip.x, y: (1 - u) * (1 - u) * o.y + 2 * u * (1 - u) * mid.y + u * u * tip.y});
    }
    const bulge = P.tongue.bulge ?? 1;
    const tt = tube(pts, (u) => lerp(5.5, 3.8, u) * (1 + Math.sin(u * 14 - e * 8) * 0.06));
    const ang = Math.atan2(tip.y - mid.y, tip.x - mid.x);
    tongueEl = (
      <g>
        <path d={tt.d} fill="#d86a7c" stroke="#5a1c28" strokeWidth={1.2} />
        <path d={smoothPath(pts)} stroke="#f2a2ae" strokeWidth={1.6} fill="none" opacity={0.7} transform="translate(0 -1.5)" />
        <g transform={`translate(${f1(tip.x)} ${f1(tip.y)}) rotate(${f1((ang * 180) / Math.PI)})`}>
          <ellipse rx={11 * bulge} ry={9 * bulge} fill="#e07888" stroke="#5a1c28" strokeWidth={1.3} />
          <ellipse cx={5 * bulge} rx={5 * bulge} ry={6.5 * bulge} fill="#b84860" opacity={0.85} />
          <ellipse cx={-3} cy={-3.5} rx={3.6} ry={2} fill="#ffd8de" opacity={0.85} />
        </g>
        {P.tongue.prey ? <g transform={`translate(${f1(tip.x)} ${f1(tip.y)})`}>{P.tongue.prey}</g> : null}
      </g>
    );
  }

  // ---------------- piel: patrones unidos al cuerpo
  const id = `cham-${uid}`;
  const xn = (x: number) => clamp((x + 44) / 367);
  const bodyGrad = (
    <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="0">
      {[0, 0.25, 0.5, 0.75, 1].map((u) => (
        <stop key={u} offset={u} stopColor={col('base', u)} />
      ))}
    </linearGradient>
  );
  const shading = (
    <linearGradient id={`${id}-sh`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ffffff" stopOpacity={0.28} />
      <stop offset="0.35" stopColor="#ffffff" stopOpacity={0} />
      <stop offset="0.7" stopColor="#000000" stopOpacity={0.12} />
      <stop offset="1" stopColor="#000000" stopOpacity={0.38} />
    </linearGradient>
  );
  // barras verticales y franja lateral (deformadas con el cuerpo)
  const bars = BARS.map((bx, i) => {
    const pts = [{x: bx - 7, y: -82}, {x: bx + 9, y: -82}, {x: bx + 8, y: -18}, {x: bx + 2, y: -2}, {x: bx - 5, y: -18}].map((p) => flex(breathe(p)));
    return <path key={i} d={smoothPath(pts, true)} fill={col('bar', xn(bx))} opacity={0.92} />;
  });
  const stripe = smoothPath([{x: -30, y: -6}, {x: 40, y: 0}, {x: 110, y: 4}, {x: 180, y: 2}, {x: 214, y: -2}, {x: 214, y: 7}, {x: 180, y: 11}, {x: 110, y: 13}, {x: 40, y: 9}, {x: -30, y: 2}].map((p) => flex(breathe(p))), true);
  const belly = smoothPath([{x: 20, y: 6}, {x: 80, y: 18}, {x: 150, y: 20}, {x: 214, y: 12}, ...VENTRAL.slice(1, 9).reverse()].map((p) => flex(breathe(p))).reverse(), true);
  const tub = detail > 0.4 ? TUBERCLES.map((tb, i) => {
    const q = flex(breathe(tb));
    const region: Region = tb.h > 0.8 ? 'spot' : tb.h > 0.5 ? 'crest' : 'base';
    return <circle key={i} cx={f1(q.x)} cy={f1(q.y)} r={tb.r} fill={col(region, xn(tb.x))} opacity={0.75} />;
  }) : null;
  // cresta dorsal: pequeños conos a lo largo del lomo y el inicio de la cola
  const crest: string[] = [];
  for (let i = 1; i < dors.length - 1; i++) {
    const a = dors[i];
    const b = dors[i + 1];
    for (let k = 0; k < 3; k++) {
      const u = k / 3;
      const p = {x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u)};
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const l = Math.hypot(dx, dy) || 1;
      const h = 5.5 * (1 - i / dors.length * 0.5);
      crest.push(`M${f1(p.x - (dx / l) * 2.6)} ${f1(p.y - (dy / l) * 2.6)}L${f1(p.x + (dy / l) * h)} ${f1(p.y - (dx / l) * h)}L${f1(p.x + (dx / l) * 2.6)} ${f1(p.y + (dy / l) * 2.6)}Z`);
    }
  }
  const tr = `translate(${f1(P.x)} ${f1(P.y)}) rotate(${f1((P.angle * 180) / Math.PI)}) scale(${f1(P.facing * s * 1000) / 1000} ${f1(s * 1000) / 1000})`;
  const rim = P.rim ?? '#fff1c0';
  const rimK = P.rimK ?? 0.5;
  return (
    <g transform={tr}>
      <defs>
        {bodyGrad}
        {shading}
        <clipPath id={`${id}-c`}>
          <path d={outline} />
        </clipPath>
        <pattern id={`${id}-sc`} width={5} height={4.4} patternUnits="userSpaceOnUse">
          <circle cx={2.5} cy={2.2} r={1.5} fill="#ffffff" opacity={0.14} />
          <circle cx={0} cy={0} r={1.3} fill="#000000" opacity={0.08} />
        </pattern>
      </defs>
      {/* patas lejanas detrás del cuerpo */}
      {legs.filter((l) => l.far).map((l) => Leg(l))}
      {/* ojo lejano asomando */}
      <g opacity={0.95}>{turret(farC, P.eyeF, true)}</g>
      {/* cola */}
      <path d={tailT.d} fill={col('tail', 0.05)} stroke="#0f1a10" strokeWidth={1.6} />
      <g opacity={0.8}>
        {tp.map((p, i) => (i % 3 === 1 && i < tp.length - 3 ? <circle key={i} cx={f1(p.x)} cy={f1(p.y)} r={f1(lerp(6, 1.6, i / tp.length))} fill={col('bar', 0.02)} opacity={0.7} /> : null))}
      </g>
      <path d={smoothPath(tailT.L)} stroke={rim} strokeWidth={2} fill="none" opacity={rimK * 0.6} />
      {/* tronco */}
      <path d={outline} fill={`url(#${id}-g)`} stroke="#0f1a10" strokeWidth={2} />
      <g clipPath={`url(#${id}-c)`}>
        <path d={belly} fill={col('belly', 0.5)} opacity={0.75} />
        {bars}
        <path d={stripe} fill={col('stripe', 0.5)} opacity={0.88} />
        <path d={headShape} fill={col('head', 0.9)} opacity={0.92} />
        {/* labios y cresta rostral */}
        <path d={smoothPath([headT({x: 320, y: -10}), ...upLip, headT({x: 252, y: 6}), headT({x: 260, y: 12}), ...lowJaw.slice(1).reverse(), headT({x: 320, y: 4})], true)} fill={col('lip', 0.95)} opacity={0.9} />
        <path d={smoothPath(top.slice(3))} stroke={col('crest', 0.95)} strokeWidth={4} fill="none" opacity={0.6} />
        {tub}
        <rect x={-60} y={-110} width={420} height={160} fill={`url(#${id}-sc)`} />
        <rect x={-60} y={-110} width={420} height={160} fill={`url(#${id}-sh)`} />
        {/* línea de la boca con la característica curva */}
        <path d={smoothPath([headT({x: 320, y: -4}), ...upLip.slice(1), headT(MOUTH_PIVOT)])} stroke="#132014" strokeWidth={1.8} fill="none" />
      </g>
      {mouthIn ? <path d={mouthIn} fill="#c24a5c" stroke="#3a1018" strokeWidth={1.2} /> : null}
      <path d={crest.join('')} fill={col('crest', 0.6)} stroke="#0f1a10" strokeWidth={0.8} />
      {/* luz de contorno en el lomo */}
      <path d={smoothPath([...dors.slice(1), ...top.slice(0, 5)])} stroke={rim} strokeWidth={3} fill="none" opacity={rimK} />
      {tongueEl}
      {turret(eye, P.eyeN, false)}
      {/* patas cercanas */}
      {legs.filter((l) => !l.far).map((l) => Leg(l))}
    </g>
  );
};
export const CHAM_ANCHORS = {SHOULDER, HIP, EYE_C, MOUTH: {x: 306, y: 2}, SNOUT};
/** Punto local del cuerpo (sin la deformación de la cabeza) → mundo. */
export function chamToWorld(P: ChamPose, p: V): V {
  const q = rot({x: p.x * P.facing * P.scale, y: p.y * P.scale}, P.angle);
  return {x: P.x + q.x, y: P.y + q.y};
}
