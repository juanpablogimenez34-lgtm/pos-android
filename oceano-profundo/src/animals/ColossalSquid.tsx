// CALAMAR COLOSAL (Mesonychoteuthis hamiltoni) — rig ORIGINAL e independiente del calamar gigante.
// Vista lateral: cabeza en el origen, manto hacia −x, brazos hacia +x. Diferencias con Architeuthis:
//  · MANTO más corto y mucho más ANCHO (robusto, «barril»), con ALETAS GRANDES y redondeadas que ocupan buena
//    parte del extremo posterior;
//  · BRAZOS más cortos y gruesos con GANCHOS en la parte media (además de ventosas en la base y la punta);
//  · TENTÁCULOS relativamente cortos con maza armada de GANCHOS GIRATORIOS (dos hileras) y ventosas;
//  · OJO enorme con FOTÓFOROS en su cara ventral;
//  · movimiento pausado: pulsos lentos del manto, brazos que derivan despacio (cazador de acecho, hipótesis).
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../utils/math';
import {closedSpline, f1} from '../utils/spline';

type V = {x: number; y: number};
export type ColossalPose = {
  t: number;
  pulse?: number; // contracción del manto 0…1
  fin?: number; // fase de las aletas
  spread?: number; // apertura de los brazos 0…1
  drift?: number; // amplitud de la deriva de los brazos
  hooks?: number; // ganchos girados/extendidos 0…1
  tentacles?: {tip: V; ext: number}[];
  look?: V;
  jet?: number;
  tone?: number;
  rim?: number;
};

const COL = {mantle: '#b0402e', mantleDark: '#5a1c16', mantleLight: '#e88a70', arm: '#a23a2a', armFar: '#5e2018', sucker: '#f2c8b8', hook: '#efe6d4', eye: '#060810'};
const ARMS = Array.from({length: 8}, (_, i) => ({
  base: (i - 3.5) * 0.13,
  len: 210 + hash1(i * 4.3) * 40,
  phase: hash1(i * 9.1) * Math.PI * 2,
  speed: 0.45 + hash1(i * 3.7) * 0.3,
  bend: (hash1(i * 1.9) - 0.5) * 0.6,
  far: i % 2 === 0,
}));

function chain(a: (typeof ARMS)[number], p: ColossalPose, k: number): V[] {
  const t = p.t;
  const spread = p.spread ?? 0.3;
  const drift = p.drift ?? 0.5;
  const N = 14;
  const base = {x: 34, y: (k - 3.5) * 6};
  let ang = a.base * (1 + spread * 3.5) + spread * (k - 3.5) * 0.16;
  const pts: V[] = [base];
  let cur = base;
  const seg = a.len / (N - 1);
  for (let i = 1; i < N; i++) {
    const u = i / (N - 1);
    ang += (Math.sin(t * a.speed - u * 2.4 + a.phase) * drift * 0.2 * u + a.bend * u * 0.12 + (a.far ? -1 : 1) * u * u * 0.05) * 0.9;
    cur = {x: cur.x + Math.cos(ang) * seg, y: cur.y + Math.sin(ang) * seg};
    pts.push(cur);
  }
  return pts;
}
function tube(pts: V[], w0: number, w1: number) {
  const n = pts.length;
  const L: V[] = [];
  const R: V[] = [];
  const nr: V[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / l;
    const ny = (b.x - a.x) / l;
    const w = (w0 + (w1 - w0) * Math.pow(i / (n - 1), 1.1)) / 2;
    L.push({x: pts[i].x + nx * w, y: pts[i].y + ny * w});
    R.push({x: pts[i].x - nx * w, y: pts[i].y - ny * w});
    nr.push({x: nx, y: ny});
  }
  return {d: closedSpline([...L, ...R.reverse()], 1), nr};
}
/** Gancho quitinoso (con giro: `rot` en rad) en un punto, orientado según la normal. */
const Hook: React.FC<{q: V; n: V; s: number; rot: number; col: string}> = ({q, n, s, rot, col}) => {
  const a = Math.atan2(n.y, n.x) + rot;
  const tip = {x: q.x + Math.cos(a) * s * 1.6, y: q.y + Math.sin(a) * s * 1.6};
  const back = {x: q.x + Math.cos(a + 1.9) * s * 0.9, y: q.y + Math.sin(a + 1.9) * s * 0.9};
  return <path d={`M${f1(q.x)},${f1(q.y)} Q${f1(tip.x)},${f1(tip.y)} ${f1(back.x)},${f1(back.y)}`} stroke={col} strokeWidth={Math.max(1, s * 0.42)} fill="none" strokeLinecap="round" />;
};

export const ColossalSquid: React.FC<{pose: ColossalPose; uid: string; x: number; y: number; scale?: number; dir?: 1 | -1; angle?: number}> = ({pose, uid, x, y, scale = 1, dir = 1, angle = 0}) => {
  const p = pose;
  const t = p.t;
  const tone = clamp(p.tone ?? 0);
  const C = (c: string) => mixColor(c, '#04070c', tone * 0.8);
  const pulse = clamp(p.pulse ?? 0.5 + 0.5 * Math.sin(t * 0.8));
  const hk = clamp(p.hooks ?? 0.4);
  const ML = 420;
  // manto en barril: ancho casi constante y final redondeado
  const mw = (u: number) => (u < 0.1 ? lerp(78, 104, u / 0.1) : u < 0.62 ? lerp(104, 98, (u - 0.1) / 0.52) : lerp(98, 18, Math.pow((u - 0.62) / 0.38, 1.4))) * (1 - 0.08 * pulse * Math.sin(Math.PI * clamp(u * 1.05)));
  const sway = (u: number) => Math.sin(t * 0.6 - u * 1.6) * 5 * u;
  const us = Array.from({length: 18}, (_, i) => i / 17);
  const top = us.map((u) => ({x: -u * ML, y: -mw(u) + sway(u)}));
  const bot = us.map((u) => ({x: -u * ML, y: mw(u) * 0.96 + sway(u)}));
  const mantle = closedSpline([{x: 8, y: -74}, ...top.slice(1), {x: -ML - 14, y: sway(1)}, ...[...bot.slice(1)].reverse(), {x: 8, y: 72}], 1);
  // aletas grandes y redondeadas
  const fa = 0.5 * Math.sin(p.fin ?? t * 1.4);
  const fin = (s: number) => {
    const y0 = sway(0.55) + s * mw(0.55) * 0.85;
    return `M${f1(-ML * 0.52)},${f1(y0)} C${f1(-ML * 0.6)},${f1(y0 + s * (120 + fa * 40 * s))} ${f1(-ML * 1.0)},${f1(sway(1) + s * (130 + fa * 30 * s))} ${f1(-ML - 16)},${f1(sway(1))}Z`;
  };
  const spots = Array.from({length: 70}, (_, i) => {
    const u = 0.04 + hash1(i * 2.7) * 0.88;
    return {x: -u * ML, y: (hash1(i * 6.1) - 0.5) * 1.7 * mw(u) + sway(u), r: 2 + hash1(i) * 6};
  });
  const arms = ARMS.map((a, k) => ({a, pts: chain(a, p, k)}));
  const drawArm = (pts: V[], far: boolean, i: number) => {
    const w0 = far ? 40 : 48;
    const {d, nr} = tube(pts, w0, 6);
    return (
      <g key={`ca${i}`}>
        <path d={d} fill={far ? C(COL.armFar) : C(COL.arm)} stroke={C('#2a0a06')} strokeWidth={1.3} />
        {pts.map((q, j) => {
          if (j < 1 || j > pts.length - 2) return null;
          const u = j / (pts.length - 1);
          const w = lerp(w0, 6, Math.pow(u, 1.1)) / 2;
          const s = far ? -1 : 1;
          const at = {x: q.x + nr[j].x * w * 0.7 * s, y: q.y + nr[j].y * w * 0.7 * s};
          // ganchos en la parte media del brazo, ventosas en la base y la punta
          return u > 0.35 && u < 0.72 ? (
            <Hook key={j} q={at} n={{x: nr[j].x * s, y: nr[j].y * s}} s={w * 0.55} rot={-0.6 + hk * 0.9} col={C(COL.hook)} />
          ) : (
            <circle key={j} cx={at.x} cy={at.y} r={Math.max(1.4, w * 0.36)} fill={C(COL.sucker)} opacity={far ? 0.55 : 0.95} />
          );
        })}
      </g>
    );
  };
  // tentáculos cortos con maza de ganchos giratorios
  const tents = (p.tentacles ?? [{tip: {x: 380, y: 30}, ext: 0}, {tip: {x: 380, y: -30}, ext: 0}]).map((tt, i) => {
    const side = i === 0 ? 1 : -1;
    const base = {x: 36, y: side * 10};
    const rest = {x: base.x + 360, y: base.y + side * 30 + Math.sin(t * 0.7 + i) * 18};
    const tgt = {x: lerp(rest.x, tt.tip.x, clamp(tt.ext)), y: lerp(rest.y, tt.tip.y, clamp(tt.ext))};
    const mid = {x: (base.x + tgt.x) / 2, y: (base.y + tgt.y) / 2 + side * 40 * (1 - clamp(tt.ext)) + Math.sin(t * 0.9 + i) * 14};
    const pts = Array.from({length: 18}, (_, j) => {
      const u = j / 17;
      return {x: (1 - u) ** 2 * base.x + 2 * (1 - u) * u * mid.x + u * u * tgt.x, y: (1 - u) ** 2 * base.y + 2 * (1 - u) * u * mid.y + u * u * tgt.y};
    });
    return pts;
  });
  const drawTent = (pts: V[], i: number) => {
    const stalk = pts.slice(0, -5);
    const club = pts.slice(-6);
    const {d} = tube(stalk, 15, 10);
    const {d: dc, nr} = tube(club, 30, 8);
    return (
      <g key={`ct${i}`}>
        <path d={d} fill={C('#b8483a')} stroke={C('#3a0e08')} strokeWidth={1} />
        <path d={dc} fill={C('#c24e3a')} stroke={C('#3a0e08')} strokeWidth={1.2} />
        {club.flatMap((q, j) => [-1, 1].map((s) => <Hook key={`${j}${s}`} q={{x: q.x + nr[j].x * 6 * s, y: q.y + nr[j].y * 6 * s}} n={{x: nr[j].x * s, y: nr[j].y * s}} s={6} rot={Math.sin(t * 1.3 + j + s) * 0.5 * hk + (hk - 0.5)} col={C(COL.hook)} />))}
      </g>
    );
  };
  const eye = {x: -30, y: -20};
  const la = p.look ? Math.atan2(p.look.y - eye.y, p.look.x - eye.x) : 0;
  const jet = clamp(p.jet ?? 0);
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((angle * 180) / Math.PI)}) scale(${f1(scale * dir)} ${f1(scale)})`}>
      <defs>
        <linearGradient id={`csm${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C(COL.mantleDark)} />
          <stop offset="0.4" stopColor={C(COL.mantle)} />
          <stop offset="0.8" stopColor={C(COL.mantleLight)} />
          <stop offset="1" stopColor={C('#f0b0a0')} />
        </linearGradient>
        <radialGradient id={`cse${uid}`} cx="0.4" cy="0.35" r="0.65">
          <stop offset="0" stopColor="#4a5a7a" />
          <stop offset="0.5" stopColor="#141c30" />
          <stop offset="1" stopColor="#010206" />
        </radialGradient>
        <clipPath id={`csc${uid}`}><path d={mantle} /></clipPath>
      </defs>
      {jet > 0.01 && (
        <g opacity={jet}>
          {[0, 1, 2].map((k) => <path key={k} d={`M10,62 q-120,${8 + k * 8} -${260 + k * 70},${18 + k * 14 + Math.sin(t * 6 + k) * 8}`} stroke="#d8f2ff" strokeWidth={14 - k * 4} fill="none" opacity={0.25} strokeLinecap="round" />)}
        </g>
      )}
      {arms.filter((r) => r.a.far).map((r, i) => drawArm(r.pts, true, i))}
      {drawTent(tents[1], 1)}
      <path d={fin(-1)} fill={C('#7e2a1e')} opacity={0.92} />
      <path d={mantle} fill={`url(#csm${uid})`} />
      <g clipPath={`url(#csc${uid})`}>
        {spots.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={C(i % 3 ? '#6a1a10' : '#d86a50')} opacity={0.35} />)}
        <path d={top.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y + 22)}`).join(' ')} stroke="#ffe0d0" strokeWidth={9} fill="none" opacity={0.2 * (1 - tone)} />
        <path d={bot.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y - 10)}`).join(' ')} stroke="#000" strokeWidth={22} fill="none" opacity={0.2} />
      </g>
      <path d={mantle} fill="none" stroke={C('#3a0e08')} strokeWidth={2.2} />
      {(p.rim ?? 0) > 0.01 && <path d={mantle} fill="none" stroke="#9adcff" strokeWidth={4} opacity={(p.rim ?? 0) * 0.55} transform="translate(0 -3)" />}
      <path d={fin(1)} fill={C('#c0503a')} stroke={C('#3a0e08')} strokeWidth={1.5} />
      <ellipse cx={-6} cy={0} rx={58} ry={64} fill={C('#a83a28')} stroke={C('#3a0e08')} strokeWidth={1.8} />
      <path d="M-4,54 Q28,74 52,70 L52,84 Q26,92 -8,70Z" fill={C('#c25a42')} stroke={C('#3a0e08')} strokeWidth={1.2} />
      <g transform={`translate(${eye.x} ${eye.y})`}>
        <circle r={42} fill={C('#5a1a12')} />
        <circle r={35} fill={`url(#cse${uid})`} stroke={C('#e8d0b0')} strokeWidth={2.4} />
        <circle cx={Math.cos(la) * 7} cy={Math.sin(la) * 7} r={16} fill="#000" />
        <ellipse cx={-11} cy={-12} rx={8} ry={6} fill="#dff0ff" opacity={0.8 * (1 - tone * 0.5)} />
        {/* fotóforos en la cara ventral del ojo */}
        {[-0.9, -0.3, 0.3, 0.9].map((a, i) => (
          <g key={i} style={{mixBlendMode: 'screen'}}>
            <ellipse cx={Math.sin(a) * 30} cy={36} rx={7} ry={3.5} fill="#7adfff" opacity={0.55 + 0.25 * Math.sin(t * 1.2 + i)} />
          </g>
        ))}
      </g>
      {arms.filter((r) => !r.a.far).map((r, i) => drawArm(r.pts, false, i + 4))}
      {drawTent(tents[0], 0)}
    </g>
  );
};
