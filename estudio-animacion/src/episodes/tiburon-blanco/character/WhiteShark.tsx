// PROTAGONISTA — TIBURÓN BLANCO (Carcharodon carcharias), vista lateral (hocico hacia +x).
//  · Columna de 30 puntos: la propulsión es LATERAL (de perfil se ve como el vaivén de la aleta caudal, cuya cuerda
//    aparente se acorta al pasar de lado) más una leve flexión del cuerpo.
//  · Hocico cónico, ojo negro, 5 hendiduras branquiales, quilla caudal, caudal casi simétrica (lunada),
//    pectorales grandes con punta oscura, dorsal triangular, contrasombreado con borde irregular, cicatrices.
//  · Mandíbula: la inferior baja y la SUPERIOR SE DESPLAZA HACIA DELANTE al morder; filas de dientes triangulares
//    aserrados. Capas opcionales: ampollas de Lorenzini, línea lateral y zonas de calor (endotermia regional).
import React from 'react';
import {clamp, hash1, lerp, mixColor, smoothPath} from '../../../engine/math';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);
export type SharkPose = {
  x: number; y: number; angle: number; scale: number; facing: 1 | -1; t: number; phase: number; amp: number;
  jaw?: number; // 0–1 apertura
  protrude?: number; // 0–1 mandíbula superior hacia delante
  look?: V; tone?: number; rim?: number; under?: number;
  sense?: number; // ampollas y línea lateral
  heat?: number; // mapa de calor
  pecs?: number; // inclinación de las pectorales (−1 sube … 1 baja)
};
export const SL = 1000;
const N = 30;
const TOP: [number, number][] = [[0, 0.01], [0.03, 0.045], [0.08, 0.085], [0.16, 0.115], [0.3, 0.13], [0.45, 0.12], [0.6, 0.085], [0.74, 0.05], [0.86, 0.03], [0.94, 0.022], [1, 0.02]];
const BOT: [number, number][] = [[0, 0.012], [0.03, 0.04], [0.08, 0.075], [0.18, 0.11], [0.32, 0.12], [0.48, 0.1], [0.62, 0.07], [0.76, 0.04], [0.88, 0.026], [0.95, 0.021], [1, 0.02]];
const pr = (tab: [number, number][], u: number) => {
  if (u <= 0) return tab[0][1];
  for (let i = 1; i < tab.length; i++) {
    if (u <= tab[i][0]) {
      const k = (u - tab[i - 1][0]) / (tab[i][0] - tab[i - 1][0]);
      return lerp(tab[i - 1][1], tab[i][1], k * k * (3 - 2 * k));
    }
  }
  return tab[tab.length - 1][1];
};
export function sharkSpine(P: SharkPose) {
  const pts: V[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const env = Math.pow(Math.max(0, u - 0.3) / 0.7, 1.6);
    pts.push({x: -u * SL, y: (Math.sin(P.phase - u * 3.4) * env * 0.035 * P.amp + Math.sin(P.phase * 0.5) * 0.004 * (1 - u)) * SL});
  }
  const nrm = pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(N, i + 1)];
    const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const n = {x: (b.y - a.y) / l, y: -(b.x - a.x) / l};
    return n.y > 0 ? {x: -n.x, y: -n.y} : n;
  });
  const U = (u: number, v: number) => {
    const f = clamp(u) * N;
    const i = Math.min(N - 1, Math.floor(f));
    const k = f - i;
    const p = {x: lerp(pts[i].x, pts[i + 1].x, k), y: lerp(pts[i].y, pts[i + 1].y, k)};
    const n = {x: lerp(nrm[i].x, nrm[i + 1].x, k), y: lerp(nrm[i].y, nrm[i + 1].y, k)};
    const h = (v >= 0 ? v * pr(TOP, u) : v * pr(BOT, u)) * SL;
    return {x: p.x + n.x * h, y: p.y + n.y * h};
  };
  return {pts, U};
}
/** Punto del cuerpo en el mundo. */
export function sharkPoint(P: SharkPose, u: number, v: number): V {
  const S = sharkSpine(P);
  const p = S.U(u, v);
  const x = p.x * P.facing * P.scale;
  const y = p.y * P.scale;
  const c = Math.cos(P.angle);
  const s = Math.sin(P.angle);
  return {x: P.x + x * c - y * s, y: P.y + x * s + y * c};
}
const SCARS = Array.from({length: 7}, (_, i) => ({u: 0.18 + hash1(i * 3) * 0.4, v: 0.2 + hash1(i * 5) * 0.6, l: 0.02 + hash1(i * 7) * 0.04, a: (hash1(i * 9) - 0.5) * 0.8}));

export const WhiteShark: React.FC<{p: SharkPose; uid: string}> = ({p, uid}) => {
  const S = sharkSpine(p);
  const U = S.U;
  const jaw = clamp(p.jaw ?? 0);
  const pro = clamp(p.protrude ?? jaw * 0.8);
  const tone = clamp(p.tone ?? 0);
  const dk = (c: string) => mixColor(c, '#04101c', tone * 0.65);
  const id = `ws-${uid}`;
  // contorno con la boca abierta: mandíbula inferior gira hacia abajo, superior avanza
  const piv = U(0.13, -0.35);
  const ja = jaw * 0.72;
  const rot = (q: V) => ({x: piv.x + (q.x - piv.x) * Math.cos(ja) - (q.y - piv.y) * Math.sin(ja), y: piv.y + (q.x - piv.x) * Math.sin(ja) + (q.y - piv.y) * Math.cos(ja)});
  const top: V[] = [];
  const bot: V[] = [];
  for (let i = 0; i <= N; i++) {
    top.push(U(i / N, 1));
    const u = i / N;
    bot.push(u > 0.035 && u < 0.13 ? rot(U(u, -1)) : U(u, -1));
  }
  const outline = smoothPath([...top, ...[...bot].reverse()], true);
  // aletas
  const d0 = U(0.32, 0.97);
  const d1 = U(0.45, 0.95);
  const dTip = {x: d0.x - 0.07 * SL, y: d0.y - 0.15 * SL};
  const dorsal = `M${f1(d0.x)} ${f1(d0.y)}C${f1(d0.x - 0.02 * SL)} ${f1(d0.y - 0.08 * SL)} ${f1(dTip.x + 0.02 * SL)} ${f1(dTip.y + 0.01 * SL)} ${f1(dTip.x)} ${f1(dTip.y)}C${f1(dTip.x + 0.005 * SL)} ${f1(dTip.y + 0.07 * SL)} ${f1(d1.x + 0.01 * SL)} ${f1(d1.y - 0.03 * SL)} ${f1(d1.x)} ${f1(d1.y)}Z`;
  const pec = (far: boolean) => {
    const b = U(far ? 0.24 : 0.23, far ? -0.5 : -0.7);
    const a = 2.25 + (p.pecs ?? 0) * 0.3 + Math.sin(p.t * 1.1 + (far ? 1.2 : 0)) * 0.05 + (far ? 0.12 : 0);
    const l = 0.2 * SL;
    const d = {x: Math.cos(a), y: Math.sin(a)};
    const s = {x: -d.y, y: d.x};
    const tip = {x: b.x + d.x * l, y: b.y + d.y * l};
    return {d: `M${f1(b.x - s.x * 30)} ${f1(b.y - s.y * 30)}C${f1(b.x + d.x * l * 0.4 - s.x * 34)} ${f1(b.y + d.y * l * 0.4 - s.y * 34)} ${f1(tip.x - s.x * 12)} ${f1(tip.y - s.y * 12)} ${f1(tip.x)} ${f1(tip.y)}C${f1(tip.x + s.x * 4)} ${f1(tip.y + s.y * 4)} ${f1(b.x + d.x * l * 0.5 + s.x * 10)} ${f1(b.y + d.y * l * 0.5 + s.y * 10)} ${f1(b.x + s.x * 20)} ${f1(b.y + s.y * 20)}Z`, tip, b};
  };
  // caudal casi simétrica (lunada) con vaivén lateral: escorzo de la cuerda
  const e = S.pts[N];
  const q = S.pts[N - 2];
  const ang = Math.atan2(e.y - q.y, e.x - q.x);
  const sw = Math.cos(p.phase - 3.4);
  const chord = 0.13 * SL * (0.35 + 0.65 * Math.abs(sw));
  const span = 0.2 * SL;
  const dd = {x: Math.cos(ang), y: Math.sin(ang)};
  const ss = {x: -dd.y, y: dd.x};
  const T = (fx: number, fy: number) => ({x: e.x + dd.x * fx * chord + ss.x * fy * span + dd.x * sw * fy * span * 0.12, y: e.y + dd.y * fx * chord + ss.y * fy * span});
  const caudal = smoothPath([T(-0.2, 0.12), T(0.4, 0.55), T(1.05, 1.05), T(0.62, 0.1), T(0.56, 0), T(0.62, -0.1), T(1.0, -0.92), T(0.4, -0.5), T(-0.2, -0.12)], true, 0.65);
  const pFar = pec(true);
  const pNear = pec(false);
  // contrasombreado: borde irregular entre gris y blanco
  const edge: V[] = Array.from({length: 18}, (_, i) => {
    const u = 0.04 + i * 0.05;
    return U(u, -0.1 + Math.sin(i * 1.7) * 0.08 + (u > 0.25 && u < 0.4 ? -0.15 : 0));
  });
  const greyTop = [...Array.from({length: 18}, (_, i) => U(0.04 + i * 0.05, 1.3)).reverse(), ...edge];
  const eye = U(0.085, 0.3);
  const look = p.look ?? {x: 1, y: 0};
  const ll = Math.hypot(look.x, look.y) || 1;
  // dientes: fila superior (avanza con la protrusión) e inferior (gira con la mandíbula)
  const shift = pro * 0.022 * SL;
  const upTeeth = Array.from({length: 9}, (_, i) => {
    const b = U(0.03 + i * 0.011, -0.55);
    const h = 0.024 * SL * (1 - i * 0.05);
    return `M${f1(b.x + shift - 7)} ${f1(b.y + shift * 0.3)}L${f1(b.x + shift)} ${f1(b.y + h + shift * 0.3)}L${f1(b.x + shift + 7)} ${f1(b.y + shift * 0.3)}Z`;
  }).join('');
  const loTeeth = Array.from({length: 8}, (_, i) => {
    const b = rot(U(0.04 + i * 0.011, -0.75));
    const h = 0.02 * SL;
    const a = ja;
    return `M${f1(b.x - 4)} ${f1(b.y)}L${f1(b.x + Math.sin(a) * h)} ${f1(b.y - Math.cos(a) * h)}L${f1(b.x + 4)} ${f1(b.y)}Z`;
  }).join('');
  const mouthIn = jaw > 0.03 ? smoothPath([U(0.02, -0.5), U(0.07, -0.6), U(0.13, -0.4), rot(U(0.08, -0.85)), rot(U(0.035, -0.8))], true) : null;
  const tr = `translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1((p.angle * 180) / Math.PI)}) scale(${f1(p.facing * p.scale * 1000) / 1000} ${f1(p.scale * 1000) / 1000})`;
  const sense = clamp(p.sense ?? 0);
  const heat = clamp(p.heat ?? 0);
  return (
    <g transform={tr}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dk('#4a5866')} />
          <stop offset="0.5" stopColor={dk('#8a96a0')} />
          <stop offset="1" stopColor={dk('#f2f4f4')} />
        </linearGradient>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dk('#3a4652')} />
          <stop offset="1" stopColor={dk('#6a7884')} />
        </linearGradient>
        <radialGradient id={`${id}-heat`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff4a2a" stopOpacity={0.85} />
          <stop offset="0.6" stopColor="#ffb02a" stopOpacity={0.5} />
          <stop offset="1" stopColor="#ffb02a" stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${id}-c`}><path d={outline} /></clipPath>
      </defs>
      <path d={pFar.d} fill={dk('#2e3a46')} />
      <path d={caudal} fill={dk('#46525e')} stroke={dk('#141c24')} strokeWidth={2.5} />
      <path d={dorsal} fill={dk('#4a5866')} stroke={dk('#141c24')} strokeWidth={2.5} />
      {/* pélvica, segunda dorsal y anal pequeñas */}
      {(() => {
        const a = U(0.6, -0.95);
        const b = U(0.82, 0.95);
        const c = U(0.84, -0.95);
        return <path d={`M${f1(a.x)} ${f1(a.y)}l-40 50l-30 -48ZM${f1(b.x)} ${f1(b.y)}l-14 -26l-14 26ZM${f1(c.x)} ${f1(c.y)}l-14 24l-14 -24Z`} fill={dk('#4a5866')} />;
      })()}
      {mouthIn && <path d={mouthIn} fill="#5a2028" />}
      <path d={outline} fill={`url(#${id}-g)`} stroke={dk('#141c24')} strokeWidth={2.5} />
      <g clipPath={`url(#${id}-c)`}>
        <path d={smoothPath(greyTop, true)} fill={`url(#${id}-top)`} />
        {SCARS.map((s, i) => {
          const a = U(s.u, s.v);
          const b = U(s.u + s.l, s.v + s.a * 0.3);
          return <path key={i} d={`M${f1(a.x)} ${f1(a.y)}L${f1(b.x)} ${f1(b.y)}`} stroke={dk('#c8d0d6')} strokeWidth={2} opacity={0.5} />;
        })}
        {/* quilla caudal */}
        <path d={smoothPath([U(0.86, 0.05), U(0.93, 0.0), U(1, 0)])} stroke={dk('#2e3a46')} strokeWidth={10} fill="none" />
        <path d={smoothPath(Array.from({length: 12}, (_, i) => U(0.05 + i * 0.075, 0.75)))} stroke="#ffffff" strokeWidth={14} fill="none" opacity={0.1 + (p.rim ?? 0) * 0.25} strokeLinecap="round" />
        {/* mapa de calor: endotermia regional (músculo rojo, estómago, cerebro y ojos) */}
        {heat > 0.01 && (
          <g opacity={heat}>
            <ellipse cx={f1(U(0.4, 0.15).x)} cy={f1(U(0.4, 0.15).y)} rx={0.2 * SL} ry={0.07 * SL} fill={`url(#${id}-heat)`} />
            <ellipse cx={f1(U(0.3, -0.3).x)} cy={f1(U(0.3, -0.3).y)} rx={0.08 * SL} ry={0.05 * SL} fill={`url(#${id}-heat)`} />
            <ellipse cx={f1(U(0.09, 0.3).x)} cy={f1(U(0.09, 0.3).y)} rx={0.05 * SL} ry={0.035 * SL} fill={`url(#${id}-heat)`} />
          </g>
        )}
      </g>
      {/* hendiduras branquiales */}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = U(0.17 + i * 0.017, 0.35);
        const b = U(0.165 + i * 0.017, -0.5);
        return <path key={i} d={`M${f1(a.x)} ${f1(a.y)}Q${f1((a.x + b.x) / 2 - 6)} ${f1((a.y + b.y) / 2)} ${f1(b.x)} ${f1(b.y)}`} stroke={dk('#26323c')} strokeWidth={3.2} fill="none" />;
      })}
      {/* boca, dientes y mandíbula superior desplazada */}
      {jaw > 0.03 && <path d={upTeeth} fill="#f4f0e4" stroke="#a8a090" strokeWidth={0.8} />}
      {jaw > 0.03 && <path d={loTeeth} fill="#f4f0e4" stroke="#a8a090" strokeWidth={0.8} />}
      {jaw > 0.03 && pro > 0.05 && <path d={smoothPath([U(0.02, -0.45), U(0.06, -0.5), U(0.11, -0.45)])} stroke="#c88a90" strokeWidth={10 * pro} fill="none" />}
      <path d={smoothPath([U(0.01, -0.4), U(0.07, -0.6), U(0.135, -0.38)])} stroke={dk('#141c24')} strokeWidth={2.5} fill="none" opacity={jaw > 0.03 ? 0 : 1} />
      {/* ojo negro con brillo */}
      <circle cx={f1(eye.x)} cy={f1(eye.y)} r={9} fill="#05070a" />
      <circle cx={f1(eye.x + (look.x / ll) * 1.5 - 2.5)} cy={f1(eye.y + (look.y / ll) * 1.5 - 2.5)} r={2.6} fill="#d8eef8" opacity={0.9} />
      <circle cx={f1(U(0.02, 0.1).x)} cy={f1(U(0.02, 0.1).y)} r={3} fill={dk('#26323c')} />
      {/* ampollas de Lorenzini y línea lateral */}
      {sense > 0.01 && (
        <g opacity={sense}>
          {Array.from({length: 34}, (_, i) => {
            const pt = U(0.005 + hash1(i * 3) * 0.075, -0.6 + hash1(i * 7) * 1.2);
            return <circle key={i} cx={f1(pt.x)} cy={f1(pt.y)} r={3 + 2 * Math.sin(p.t * 4 + i)} fill="#7ff0ff" opacity={0.85} />;
          })}
          <path d={smoothPath(Array.from({length: 18}, (_, i) => U(0.1 + i * 0.05, 0.05 + Math.sin(i * 0.5) * 0.04)))} stroke="#ffd23f" strokeWidth={5} fill="none" strokeDasharray="10 6" />
        </g>
      )}
      <path d={pNear.d} fill={`url(#${id}-g)`} stroke={dk('#141c24')} strokeWidth={2.5} />
      <path d={`M${f1(pNear.tip.x)} ${f1(pNear.tip.y)}l${f1((pNear.b.x - pNear.tip.x) * 0.15)} ${f1((pNear.b.y - pNear.tip.y) * 0.15)}`} stroke={dk('#141c24')} strokeWidth={10} strokeLinecap="round" />
    </g>
  );
};

/** Lobo marino del Cabo (Arctocephalus pusillus) nadando, vista lateral (cabeza hacia +x). */
export const FurSeal: React.FC<{x: number; y: number; s?: number; t: number; angle?: number; dir?: 1 | -1; flip?: number; tone?: number}> = ({x, y, s = 1, t, angle = 0, dir = 1, flip = 1, tone = 0}) => {
  const w = Math.sin(t * 5 * flip) * 0.4;
  const col = mixColor('#4a3a30', '#04101c', tone * 0.6);
  const colL = mixColor('#7a6050', '#04101c', tone * 0.6);
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(angle * 57.3)}) scale(${dir * s} ${s})`}>
      <path d={`M-110 -6L${f1(-160 - Math.cos(w) * 10)} ${f1(-26 + Math.sin(w) * 22)}L-150 0L${f1(-160 - Math.cos(w) * 10)} ${f1(26 + Math.sin(w) * 22)}Z`} fill={col} />
      <path d="M100 0C96 -22 70 -34 30 -34C-20 -34 -80 -22 -112 -4C-80 14 -20 30 30 28C70 26 96 18 100 0Z" fill={colL} stroke="#1a120c" strokeWidth={2} />
      <path d="M100 0C96 -22 70 -34 30 -34C-20 -34 -80 -22 -112 -4C-60 -8 30 -10 100 0Z" fill={col} opacity={0.8} />
      <path d={`M40 18Q${f1(10 + Math.sin(t * 5 * flip) * 20)} ${f1(56 + Math.cos(t * 5 * flip) * 10)} -10 50Q10 30 20 18Z`} fill={col} stroke="#1a120c" strokeWidth={1.5} />
      <circle cx={80} cy={-10} r={4} fill="#050505" />
      <path d="M100 0L108 2L100 6" fill={col} />
      {[0, 1, 2].map((i) => <path key={i} d={`M98 ${2 + i * 2}l${14 + i * 2} ${-3 + i * 3}`} stroke="#e8e0d0" strokeWidth={0.8} opacity={0.7} />)}
    </g>
  );
};
