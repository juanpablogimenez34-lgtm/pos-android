// DELFÍN ROSADO DEL AMAZONAS (Inia geoffrensis) — rig 2.5D original en SVG.
// Coordenadas locales: la punta del hocico en el origen, el cuerpo hacia −x; L = 1000 u (≈ 2,4 m, adulto).
// Rasgos de la especie (no es un delfín oceánico pintado de rosa):
//  · HOCICO largo y estrecho, con pequeñas cerdas sensoriales; dientes visibles solo al abrir la boca;
//  · MELÓN (frente) redondeado y prominente; OJOS pequeños; ESPIRÁCULO detrás del melón;
//  · CUELLO flexible (vértebras cervicales no fusionadas): la cabeza gira y cabecea con independencia del tronco;
//  · ALETAS PECTORALES grandes, anchas y redondeadas («remos»), que se orientan en los giros;
//  · sin aleta dorsal triangular: CRESTA DORSAL baja y alargada;
//  · cuerpo robusto; PEDÚNCULO caudal comprimido; COLA HORIZONTAL de dos lóbulos que bate en VERTICAL;
//  · piel gris (cría) → gris rosado / rosado natural (adulto) con moteado, cicatrices y reflejos.
// Vistas: 'side' (con `yaw` 0…0,6 para tres cuartos), 'top' (dorsal, para el giro del cuello) y 'front'.
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';
import {closedSpline} from '../../../lifecycle/stages';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
export const DL = 1000;

export type DolphinPose = {
  t: number;
  phase: number; // fase acumulada del batido (rad)
  amp?: number; // amplitud 0…1,4 (natación lenta ≈ 0,5; rápida ≈ 1,2)
  headYaw?: number; // giro lateral de la cabeza (rad, ±0,9)
  headPitch?: number; // cabeceo (rad, + hacia abajo)
  bend?: number; // curvatura lateral del cuerpo en un giro (vista superior)
  flipper?: number; // orientación de las pectorales (−1…1)
  jaw?: number; // apertura de la boca 0…1
  pink?: number; // 0 cría gris … 1 adulto rosado
  wet?: number; // brillo de piel mojada fuera del agua
  rim?: number; // contraluz dorado
  tone?: number; // oscurecimiento por turbidez
  caustics?: number; // manchas de luz sobre la piel
};

/** Paleta según el grado de rosado (sin rosa fluorescente: tonos naturales, gris perla → rosa empolvado). */
export function skin(pink: number, tone = 0) {
  const p = clamp(pink);
  const k = (a: string, b: string) => mixColor(mixColor(a, b, p), '#14200f', tone * 0.6);
  return {back: k('#6e767e', '#8c7a80'), side: k('#9aa1a8', '#c99598'), belly: k('#c4c8cc', '#e6b6af'), dark: k('#3a3f45', '#5a4448'), mottle: k('#80878e', '#9a8a90'), scar: k('#d0d4d6', '#f0cfc8'), flip: k('#7a8188', '#b08488')};
}

// semialturas del perfil lateral (fracción de L) — arriba / abajo de la columna
const TOP: [number, number][] = [[0, 0.009], [0.04, 0.013], [0.09, 0.02], [0.115, 0.05], [0.14, 0.088], [0.165, 0.098], [0.19, 0.088], [0.23, 0.09], [0.3, 0.11], [0.42, 0.12], [0.5, 0.13], [0.6, 0.128], [0.7, 0.1], [0.8, 0.072], [0.9, 0.048], [0.96, 0.034], [1, 0.024]];
const BOT: [number, number][] = [[0, 0.007], [0.04, 0.011], [0.1, 0.02], [0.13, 0.04], [0.17, 0.064], [0.22, 0.094], [0.32, 0.125], [0.44, 0.13], [0.56, 0.115], [0.68, 0.088], [0.8, 0.062], [0.9, 0.04], [0.96, 0.03], [1, 0.022]];
// semianchuras en vista dorsal
const WID: [number, number][] = [[0, 0.008], [0.08, 0.014], [0.12, 0.042], [0.16, 0.068], [0.22, 0.072], [0.32, 0.105], [0.42, 0.112], [0.55, 0.1], [0.7, 0.066], [0.82, 0.04], [0.92, 0.022], [1, 0.016]];
const prof = (tab: [number, number][], u: number) => {
  for (let i = 1; i < tab.length; i++)
    if (u <= tab[i][0]) {
      const k = (u - tab[i - 1][0]) / (tab[i][0] - tab[i - 1][0]);
      return lerp(tab[i - 1][1], tab[i][1], k * k * (3 - 2 * k));
    }
  return tab[tab.length - 1][1];
};
const NECK = 0.21;
const rot = (p: V, a: number, c: V): V => ({x: c.x + (p.x - c.x) * Math.cos(a) - (p.y - c.y) * Math.sin(a), y: c.y + (p.x - c.x) * Math.sin(a) + (p.y - c.y) * Math.cos(a)});

/** Onda dorsoventral: crece hacia la cola; la cabeza contrarresta levemente. */
function wave(p: DolphinPose, u: number) {
  const a = (p.amp ?? 0.6) * DL * 0.026;
  const w = Math.sin(p.phase - u * 4.2) * a * Math.pow(Math.max(0, u - 0.2) / 0.8, 1.7);
  const head = u < 0.25 ? -Math.sin(p.phase + 0.6) * a * 0.12 * (1 - u / 0.25) : 0;
  return w + head;
}

/** Punto de la columna en vista lateral (con giro y cabeceo de la cabeza). */
export function dolphinPoint(p: DolphinPose, u: number, side = 0): V {
  let q = {x: -u * DL, y: wave(p, u) + (side < 0 ? -prof(TOP, u) : side > 0 ? prof(BOT, u) : 0) * DL * Math.abs(side)};
  if (u < NECK) q = headXform(p, q);
  return q;
}
function headXform(p: DolphinPose, q: V): V {
  const neck = {x: -NECK * DL, y: wave(p, NECK)};
  const yaw = p.headYaw ?? 0;
  // giro lateral visto de perfil: el hocico se acorta (escorzo) y sube un poco
  const fx = Math.cos(yaw);
  let r = {x: neck.x + (q.x - neck.x) * fx, y: q.y - Math.abs(Math.sin(yaw)) * (q.x - neck.x) * 0.04};
  r = rot(r, p.headPitch ?? 0, neck);
  return r;
}

export const PinkDolphin: React.FC<{pose: DolphinPose; uid: string; x: number; y: number; scale?: number; dir?: 1 | -1; angle?: number; view?: 'side' | 'top' | 'front'; yaw?: number; opacity?: number}> = (props) => {
  if (props.view === 'top') return <DolphinTop {...props} />;
  if (props.view === 'front') return <DolphinFront {...props} />;
  return <DolphinSide {...props} />;
};

type RP = {pose: DolphinPose; uid: string; x: number; y: number; scale?: number; dir?: 1 | -1; angle?: number; yaw?: number; opacity?: number};

const DolphinSide: React.FC<RP> = ({pose: p, uid, x, y, scale = 1, dir = 1, angle = 0, yaw = 0, opacity = 1}) => {
  const t = p.t;
  const C = skin(p.pink ?? 1, p.tone ?? 0);
  const N = 44;
  const us = Array.from({length: N}, (_, i) => i / (N - 1));
  const top = us.map((u) => dolphinPoint(p, u, -1));
  const bot = us.map((u) => dolphinPoint(p, u, 1));
  const body = closedSpline([...top, ...[...bot].reverse()], 0.9);
  // cresta dorsal baja y alargada (relieve, no aleta)
  const ridge = us.filter((u) => u > 0.44 && u < 0.76).map((u) => {
    const q = dolphinPoint(p, u, -1);
    const h = Math.sin(((u - 0.44) / 0.32) * Math.PI) * DL * 0.006;
    return {x: q.x, y: q.y - h};
  });
  // cola: dos lóbulos horizontales vistos de canto; su grosor aparente cambia con el batido vertical
  const tail = dolphinPoint(p, 1);
  const pre = dolphinPoint(p, 0.95);
  const ta = Math.atan2(tail.y - pre.y, tail.x - pre.x);
  const flap = Math.sin(p.phase - 4.2 - 0.9) * 0.5 * (p.amp ?? 0.6);
  const lobeH = DL * (0.016 + Math.abs(Math.sin(flap)) * 0.07);
  // aleta pectoral grande y ancha
  const pb = dolphinPoint(p, 0.25, 0.75);
  const fl = (p.flipper ?? 0) * 0.5 + Math.sin(p.phase * 0.5) * 0.06;
  const flipPath = (s: number) => {
    const a = 0.55 + fl;
    const len = DL * 0.19 * s;
    const wd = DL * 0.075 * s;
    const tip = {x: pb.x - Math.cos(a) * len, y: pb.y + Math.sin(a) * len};
    const nx = Math.sin(a);
    const ny = Math.cos(a);
    return `M${f1(pb.x + 18)},${f1(pb.y - 8)} C${f1(pb.x + 10 + nx * wd)},${f1(pb.y + ny * wd)} ${f1(tip.x + nx * wd * 0.9 + 10)},${f1(tip.y + ny * wd * 0.6)} ${f1(tip.x)},${f1(tip.y)} C${f1(tip.x - nx * wd * 0.5)},${f1(tip.y - ny * wd * 0.6)} ${f1(pb.x - 50)},${f1(pb.y - 6)} ${f1(pb.x - 40)},${f1(pb.y - 12)}Z`;
  };
  // boca / mandíbula
  const jaw = clamp(p.jaw ?? 0);
  const hinge = dolphinPoint(p, 0.15, 0.25);
  const snout = dolphinPoint(p, 0, 0);
  const ja = jaw * 0.32;
  const lowTip = rot({x: snout.x - 4, y: snout.y + 5}, ja, hinge);
  const mouthTop = us.filter((u) => u < 0.155).map((u) => dolphinPoint(p, u, 0.15));
  const eye = dolphinPoint(p, 0.172, -0.05);
  const blow = dolphinPoint(p, 0.205, -1);
  const yawK = Math.max(0.12, 1 - 0.45 * clamp(yaw, 0, 2));
  // moteado, cicatrices y textura (memorizados por índice)
  const marks = Array.from({length: 46}, (_, i) => {
    const u = 0.2 + hash1(i * 3.1) * 0.66;
    const v = hash1(i * 7.7) * 1.7 - 0.85;
    const q = dolphinPoint(p, u, v);
    return {q, r: DL * (0.004 + hash1(i) * 0.012), scar: i % 4 === 0, a: hash1(i * 5) * 3};
  });
  const ca = clamp(p.caustics ?? 0);
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((angle * 180) / Math.PI)}) scale(${f1(scale * dir * yawK)} ${f1(scale)})`} opacity={opacity}>
      <defs>
        <linearGradient id={`dsk${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.back} />
          <stop offset="0.45" stopColor={C.side} />
          <stop offset="1" stopColor={C.belly} />
        </linearGradient>
        <radialGradient id={`dsh${uid}`} cx="0.5" cy="0.25" r="0.8">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.35} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
        <clipPath id={`dcl${uid}`}><path d={body} /></clipPath>
      </defs>
      {/* aleta pectoral lejana (tres cuartos) */}
      {yaw > 0.05 && <path d={flipPath(0.85)} fill={C.dark} opacity={0.7} transform="translate(30 -20)" />}
      {/* cola */}
      <g transform={`translate(${f1(tail.x)} ${f1(tail.y)}) rotate(${f1(((ta + flap) * 180) / Math.PI)})`}>
        <path d={`M-14,0 C30,${f1(-lobeH * 0.9)} 70,${f1(-lobeH * 1.1)} 118,${f1(-lobeH * 0.6)} C96,${f1(-lobeH * 0.2)} 100,-2 110,0 C100,2 96,${f1(lobeH * 0.2)} 118,${f1(lobeH * 0.6)} C70,${f1(lobeH * 1.1)} 30,${f1(lobeH * 0.9)} -14,0Z`} fill={C.back} stroke={C.dark} strokeWidth={2} />
        <path d={`M14,0 L108,0`} stroke={C.dark} strokeWidth={1.4} opacity={0.5} />
      </g>
      {/* cuerpo */}
      <path d={body} fill={`url(#dsk${uid})`} />
      <g clipPath={`url(#dcl${uid})`}>
        {marks.map((m, i) => (m.scar ? (
          <path key={i} d={`M${f1(m.q.x)},${f1(m.q.y)} l${f1(Math.cos(m.a) * m.r * 3)},${f1(Math.sin(m.a) * m.r)}`} stroke={C.scar} strokeWidth={2.2} opacity={0.55} strokeLinecap="round" />
        ) : (
          <ellipse key={i} cx={m.q.x} cy={m.q.y} rx={m.r * 1.6} ry={m.r} fill={C.mottle} opacity={0.35} />
        )))}
        {/* volumen: luz superior, sombra ventral */}
        <path d={closedSpline([...top.slice(0, -1), ...us.slice(0, -1).reverse().map((u) => dolphinPoint(p, u, -0.2))], 0.9)} fill={`url(#dsh${uid})`} />
        <path d={bot.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y - 10)}`).join(' ')} stroke="#2a1a1a" strokeWidth={34} fill="none" opacity={0.2} />
        {/* cáusticas: manchas de luz que se desplazan */}
        {ca > 0.01 && Array.from({length: 14}, (_, i) => {
          const u = (hash1(i * 9) + t * 0.05 * (0.5 + hash1(i))) % 1;
          const q = dolphinPoint(p, u, -0.6 + hash1(i * 4) * 0.5);
          return <ellipse key={`c${i}`} cx={q.x} cy={q.y} rx={DL * 0.03} ry={DL * 0.008} fill="#fff4c8" opacity={ca * (0.18 + 0.15 * Math.sin(t * 2 + i))} />;
        })}
        {(p.wet ?? 0) > 0.01 && <path d={top.slice(4, 30).map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y + 8)}`).join(' ')} stroke="#ffffff" strokeWidth={5} fill="none" opacity={(p.wet ?? 0) * 0.55} />}
      </g>
      <path d={body} fill="none" stroke={C.dark} strokeWidth={2.2} />
      {(p.rim ?? 0) > 0.01 && <path d={top.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y + 2)}`).join(' ')} stroke="#ffd890" strokeWidth={4} fill="none" opacity={(p.rim ?? 0) * 0.7} />}
      {/* cresta dorsal */}
      <path d={`${ridge.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y)}`).join(' ')} ${ridge.slice().reverse().map((q) => `L${f1(q.x)},${f1(q.y + DL * 0.008)}`).join(' ')}Z`} fill={C.back} stroke={C.dark} strokeWidth={1.6} strokeLinejoin="round" />
      <path d={ridge.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y + 14)}`).join(' ')} stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.12} />
      {/* pliegue del cuello (se marca al girar o cabecear) */}
      {(() => {
        const k = clamp(Math.abs(p.headYaw ?? 0) * 1.6 + Math.abs(p.headPitch ?? 0) * 2);
        const a = dolphinPoint(p, NECK + 0.01, -0.85);
        const b = dolphinPoint(p, NECK + 0.02, 0.6);
        return <path d={`M${f1(a.x)},${f1(a.y)} Q${f1(a.x - 14)},${f1((a.y + b.y) / 2)} ${f1(b.x)},${f1(b.y)}`} stroke={C.dark} strokeWidth={2} fill="none" opacity={0.15 + k * 0.45} />;
      })()}
      {/* boca: interior y dientes al abrir */}
      {jaw > 0.02 && (
        <g>
          <path d={`M${f1(hinge.x)},${f1(hinge.y)} ${mouthTop.slice().reverse().map((q) => `L${f1(q.x)},${f1(q.y)}`).join(' ')} L${f1(lowTip.x)},${f1(lowTip.y)}Z`} fill="#6a2a32" />
          {Array.from({length: 14}, (_, i) => {
            const u = 0.012 + i * 0.0095;
            const q = dolphinPoint(p, u, 0.15);
            return <path key={i} d={`M${f1(q.x)},${f1(q.y)} l1.5,${f1(4 + (i > 9 ? 2 : 0))} l1.5,${f1(-4 - (i > 9 ? 2 : 0))}`} fill="#f2ece0" />;
          })}
        </g>
      )}
      {/* mandíbula inferior */}
      <path d={`M${f1(hinge.x)},${f1(hinge.y + 6)} Q${f1((hinge.x + lowTip.x) / 2)},${f1((hinge.y + lowTip.y) / 2 + 9)} ${f1(lowTip.x)},${f1(lowTip.y)} L${f1(lowTip.x + 4)},${f1(lowTip.y - 4)} Q${f1((hinge.x + lowTip.x) / 2)},${f1((hinge.y + lowTip.y) / 2)} ${f1(hinge.x)},${f1(hinge.y)}Z`} fill={C.belly} stroke={C.dark} strokeWidth={1.6} />
      <path d={mouthTop.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y)}`).join(' ')} stroke={C.dark} strokeWidth={1.8} fill="none" />
      {/* cerdas sensoriales del hocico */}
      {Array.from({length: 9}, (_, i) => {
        const q = dolphinPoint(p, 0.015 + i * 0.01, -0.6);
        return <path key={i} d={`M${f1(q.x)},${f1(q.y)} l${f1(-2 + Math.sin(t + i) * 1)},-5`} stroke={C.dark} strokeWidth={1} opacity={0.6} />;
      })}
      {/* ojo pequeño */}
      <ellipse cx={eye.x} cy={eye.y} rx={DL * 0.0075} ry={DL * 0.0062} fill="#1a1012" />
      <circle cx={eye.x + 1.5} cy={eye.y - 1.5} r={DL * 0.0022} fill="#ffffff" opacity={0.7} />
      <path d={`M${f1(eye.x - 9)},${f1(eye.y - 6)} q9,-4 18,0`} stroke={C.dark} strokeWidth={1.2} fill="none" opacity={0.5} />
      {/* espiráculo */}
      <path d={`M${f1(blow.x - 8)},${f1(blow.y + 2)} q8,-5 16,0`} stroke={C.dark} strokeWidth={2.4} fill="none" />
      {/* aleta pectoral cercana */}
      <path d={flipPath(1)} fill={C.flip} stroke={C.dark} strokeWidth={1.8} />
      <path d={flipPath(0.7)} fill="#ffffff" opacity={0.12} />
    </g>
  );
};

/** Vista dorsal: muestra el giro real del cuello y la curvatura del cuerpo; la cola se ve de frente (ancha). */
const DolphinTop: React.FC<RP> = ({pose: p, uid, x, y, scale = 1, angle = 0, opacity = 1}) => {
  const C = skin(p.pink ?? 1, p.tone ?? 0);
  const bend = p.bend ?? 0;
  const yaw = p.headYaw ?? 0;
  const N = 40;
  // columna en planta: curvatura del tronco + giro del cuello
  const spine: V[] = [];
  const angles: number[] = [];
  let a = Math.PI;
  let q = {x: 0, y: 0};
  const us = Array.from({length: N}, (_, i) => i / (N - 1));
  // construir de la cola hacia la cabeza es más estable: aquí desde el cuello hacia atrás y hacia delante
  const neckIdx = Math.round(NECK * (N - 1));
  const pts: V[] = new Array(N);
  const angs: number[] = new Array(N);
  pts[neckIdx] = {x: -NECK * DL, y: 0};
  angs[neckIdx] = 0;
  for (let i = neckIdx + 1; i < N; i++) {
    const u = us[i];
    const da = bend * 0.05 + Math.sin(p.phase * 0.5 - u * 3) * 0.004;
    angs[i] = angs[i - 1] + da;
    const s = DL / (N - 1);
    pts[i] = {x: pts[i - 1].x - Math.cos(angs[i]) * s, y: pts[i - 1].y - Math.sin(angs[i]) * s};
  }
  for (let i = neckIdx - 1; i >= 0; i--) {
    angs[i] = yaw * (1 - i / neckIdx) * 0 + yaw;
    const s = DL / (N - 1);
    pts[i] = {x: pts[i + 1].x + Math.cos(angs[i]) * s, y: pts[i + 1].y + Math.sin(angs[i]) * s};
  }
  // suavizar la transición del cuello
  for (let i = Math.max(0, neckIdx - 2); i <= Math.min(N - 1, neckIdx + 2); i++) angs[i] = (angs[Math.max(0, i - 1)] + angs[i] + angs[Math.min(N - 1, i + 1)]) / 3;
  spine.push(...pts);
  angles.push(...angs);
  void a;
  void q;
  const L: V[] = [];
  const R: V[] = [];
  spine.forEach((s, i) => {
    const w = prof(WID, us[i]) * DL;
    const nx = -Math.sin(angles[i]);
    const ny = Math.cos(angles[i]);
    L.push({x: s.x + nx * w, y: s.y + ny * w});
    R.push({x: s.x - nx * w, y: s.y - ny * w});
  });
  const body = closedSpline([...L, ...R.reverse()], 0.9);
  const tail = spine[N - 1];
  const ta = angles[N - 1];
  const chord = 0.55 + 0.45 * Math.abs(Math.cos(p.phase - 4.2 - 0.9)); // escorzo del batido vertical
  const span = DL * 0.13;
  const pi = Math.round(0.25 * (N - 1));
  const pb = spine[pi];
  const pa = angles[pi];
  const fl = p.flipper ?? 0;
  const flip = (s: number) => {
    const ang = pa + s * (1.9 - fl * 0.5 * s);
    const tip = {x: pb.x + Math.cos(ang) * DL * 0.17, y: pb.y + Math.sin(ang) * DL * 0.17};
    const back = {x: pb.x - Math.cos(pa) * 50, y: pb.y - Math.sin(pa) * 50};
    const mid = {x: (pb.x + tip.x) / 2 + Math.cos(ang + 1.57 * s) * 34, y: (pb.y + tip.y) / 2 + Math.sin(ang + 1.57 * s) * 34};
    return `M${f1(pb.x)},${f1(pb.y)} Q${f1(mid.x)},${f1(mid.y)} ${f1(tip.x)},${f1(tip.y)} Q${f1(tip.x - Math.cos(pa) * 40)},${f1(tip.y - Math.sin(pa) * 40)} ${f1(back.x)},${f1(back.y)}Z`;
  };
  const eyeL = {x: spine[7].x + Math.cos(angles[7] + 1.57) * DL * 0.045, y: spine[7].y + Math.sin(angles[7] + 1.57) * DL * 0.045};
  const eyeR = {x: spine[7].x - Math.cos(angles[7] + 1.57) * DL * 0.045, y: spine[7].y - Math.sin(angles[7] + 1.57) * DL * 0.045};
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((angle * 180) / Math.PI)}) scale(${f1(scale)})`} opacity={opacity}>
      <defs>
        <radialGradient id={`dtp${uid}`} cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor={C.side} />
          <stop offset="1" stopColor={C.back} />
        </radialGradient>
      </defs>
      <path d={flip(1)} fill={C.flip} stroke={C.dark} strokeWidth={1.8} />
      <path d={flip(-1)} fill={C.flip} stroke={C.dark} strokeWidth={1.8} />
      <g transform={`translate(${f1(tail.x)} ${f1(tail.y)}) rotate(${f1((ta * 180) / Math.PI + 180)})`}>
        <path d={`M-6,0 C${f1(20 * chord)},${f1(-span * 0.4)} ${f1(70 * chord)},${f1(-span)} ${f1(96 * chord)},${f1(-span * 1.05)} C${f1(80 * chord)},${f1(-span * 0.5)} ${f1(70 * chord)},-6 ${f1(74 * chord)},0 C${f1(70 * chord)},6 ${f1(80 * chord)},${f1(span * 0.5)} ${f1(96 * chord)},${f1(span * 1.05)} C${f1(70 * chord)},${f1(span)} ${f1(20 * chord)},${f1(span * 0.4)} -6,0Z`} fill={C.back} stroke={C.dark} strokeWidth={2} />
      </g>
      <path d={body} fill={`url(#dtp${uid})`} stroke={C.dark} strokeWidth={2.2} />
      {/* cresta dorsal (línea media elevada) */}
      <path d={spine.slice(17, 30).map((s, i) => `${i ? 'L' : 'M'}${f1(s.x)},${f1(s.y)}`).join(' ')} stroke={C.back} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.8} />
      {/* melón y espiráculo */}
      <ellipse cx={spine[6].x} cy={spine[6].y} rx={DL * 0.04} ry={DL * 0.035} fill={C.side} opacity={0.6} transform={`rotate(${f1((angles[6] * 180) / Math.PI)} ${f1(spine[6].x)} ${f1(spine[6].y)})`} />
      <path d={`M${f1(spine[8].x)},${f1(spine[8].y - 6)} q-6,6 0,12`} stroke={C.dark} strokeWidth={3} fill="none" />
      {[eyeL, eyeR].map((e, i) => <circle key={i} cx={e.x} cy={e.y} r={DL * 0.006} fill="#1a1012" />)}
      {Array.from({length: 24}, (_, i) => {
        const k = 9 + Math.floor(hash1(i * 3) * 24);
        const s = spine[k];
        const o = (hash1(i * 7) - 0.5) * prof(WID, us[k]) * DL * 1.4;
        return <ellipse key={i} cx={s.x - Math.sin(angles[k]) * o} cy={s.y + Math.cos(angles[k]) * o} rx={DL * 0.012} ry={DL * 0.006} fill={i % 3 ? C.mottle : C.scar} opacity={0.4} />;
      })}
    </g>
  );
};

/** Vista frontal (mira a la cámara): melón abombado, hocico en escorzo, ojos pequeños laterales, pectorales abiertas. */
const DolphinFront: React.FC<RP> = ({pose: p, uid, x, y, scale = 1, angle = 0, opacity = 1}) => {
  const C = skin(p.pink ?? 1, p.tone ?? 0);
  const t = p.t;
  const yaw = (p.headYaw ?? 0) * 60;
  const bob = Math.sin(p.phase) * 6;
  const fl = (p.flipper ?? 0) * 0.3 + Math.sin(p.phase * 0.5) * 0.08;
  return (
    <g transform={`translate(${f1(x)} ${f1(y + bob)}) rotate(${f1((angle * 180) / Math.PI)}) scale(${f1(scale)})`} opacity={opacity}>
      <defs>
        <radialGradient id={`dfr${uid}`} cx="0.45" cy="0.35" r="0.7">
          <stop offset="0" stopColor={C.belly} />
          <stop offset="0.55" stopColor={C.side} />
          <stop offset="1" stopColor={C.back} />
        </radialGradient>
      </defs>
      {/* tronco detrás (más pequeño por perspectiva) y cola */}
      <ellipse cx={0} cy={20} rx={95} ry={86} fill={C.back} />
      <path d={`M-70,${f1(70 - Math.sin(p.phase - 2) * 20)} Q0,${f1(120 - Math.sin(p.phase - 2) * 30)} 70,${f1(70 - Math.sin(p.phase - 2) * 20)}`} stroke={C.dark} strokeWidth={10} fill="none" opacity={0.5} />
      {/* pectorales */}
      {[-1, 1].map((s) => (
        <path key={s} d={`M${s * 70},40 Q${s * 170},${f1(70 + fl * 60 * s)} ${s * 210},${f1(120 + fl * 80 * s)} Q${s * 150},${f1(110 + fl * 50 * s)} ${s * 60},80Z`} fill={C.flip} stroke={C.dark} strokeWidth={2} />
      ))}
      {/* cabeza: melón redondeado */}
      <g transform={`translate(${f1(yaw)} 0)`}>
        <ellipse cx={0} cy={-30} rx={92} ry={84} fill={`url(#dfr${uid})`} stroke={C.dark} strokeWidth={2.2} />
        <ellipse cx={-22} cy={-70} rx={40} ry={22} fill="#ffffff" opacity={0.18} />
        {/* espiráculo arriba */}
        <path d="M-12,-104 q12,-6 24,0" stroke={C.dark} strokeWidth={3} fill="none" />
        {/* ojos pequeños, laterales */}
        {[-1, 1].map((s) => <ellipse key={s} cx={s * 78} cy={-12} rx={6} ry={5} fill="#1a1012" />)}
        {/* hocico en escorzo */}
        <ellipse cx={0} cy={30} rx={30} ry={42} fill={C.side} stroke={C.dark} strokeWidth={2} />
        <ellipse cx={0} cy={52} rx={16} ry={14} fill={C.belly} stroke={C.dark} strokeWidth={1.6} />
        <path d="M-26,36 Q0,62 26,36" stroke={C.dark} strokeWidth={1.8} fill="none" />
        {Array.from({length: 7}, (_, i) => <path key={i} d={`M${-12 + i * 4},${f1(14 + Math.sin(i) * 3)} l-1,-6`} stroke={C.dark} strokeWidth={1} opacity={0.6} />)}
        {Array.from({length: 10}, (_, i) => <ellipse key={`m${i}`} cx={-70 + hash1(i * 3) * 140} cy={-90 + hash1(i * 5) * 100} rx={5} ry={3} fill={i % 3 ? C.mottle : C.scar} opacity={0.4} />)}
      </g>
      <circle cx={0} cy={0} r={1} opacity={0} data-t={t} />
    </g>
  );
};

/** Punto local del hocico/boca (para capturas). */
export const SNOUT: V = {x: 0, y: 4};
