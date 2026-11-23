// PERSONAJE — CALAMAR GIGANTE (Architeuthis dux), ilustración original en vista lateral.
// Coordenadas locales: la cabeza en el origen, el manto hacia −x (aletas en la punta) y la corona de
// brazos hacia +x. Componentes articulados e independientes:
//  · MANTO alargado y musculoso con contracción (pulso) y textura de cromatóforos;
//  · ALETAS posteriores romboidales que baten por separado;
//  · CABEZA con OJO grande (iris, pupila, reflejos cambiantes) que sigue un objetivo;
//  · SIFÓN ventral que se orienta y expulsa un chorro de agua (estela fina, no burbujas);
//  · OCHO BRAZOS: cada uno es una cadena de 16 puntos con su propia longitud, fase, velocidad y
//    curvatura; se dibuja como un músculo que se afina, con ventosas pegadas a su cara interna que
//    siguen la curva; pueden abrirse en abanico, recogerse o sujetar una presa (`grip`);
//  · DOS TENTÁCULOS de alimentación, mucho más largos, con pedúnculo fino y MAZA ensanchada llena de
//    ventosas; se extienden hacia un punto objetivo (curva cúbica con anticipación y ajuste) y se recogen.
// Los brazos del lado lejano se dibujan detrás del cuerpo (más oscuros); los cercanos, delante.
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';
import {closedSpline} from '../../../lifecycle/stages';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
type V = {x: number; y: number};

export type SquidPose = {
  t: number;
  pulse?: number; // 0…1 contracción del manto (1 = contraído)
  fin?: number; // fase de las aletas (rad)
  finAmp?: number;
  spread?: number; // 0 brazos juntos … 1 abanico abierto (amenaza)
  curl?: number; // enrollamiento de las puntas
  wave?: number; // amplitud de la onda de los brazos
  armSpeed?: number;
  grip?: number; // 0…1 brazos cerrados sobre una presa delante de la boca
  look?: V; // objetivo en coordenadas locales (para el ojo)
  tentacles?: {tip: V; ext: number}[]; // objetivos de las mazas (local) y extensión 0…1
  siphon?: number; // dirección del sifón (−1 hacia atrás … 1 hacia delante)
  jet?: number; // 0…1 chorro de agua por el sifón
  tone?: number; // 0 iluminado … 1 silueta en la oscuridad
  rim?: number; // contraluz azul
};

const COL = {mantle: '#a83a2a', mantleDark: '#5a1a14', mantleLight: '#d8705a', arm: '#9a3424', armFar: '#5a1e16', sucker: '#f0c0b0', club: '#b84432', eye: '#0a0a14'};

// parámetros fijos de cada brazo (geometría memorizada a nivel de módulo)
const ARMS = Array.from({length: 8}, (_, i) => ({
  base: (i - 3.5) * 0.11, // ángulo de salida en la corona
  len: 300 + hash1(i * 3.1) * 60 + (i === 3 || i === 4 ? 30 : 0),
  phase: hash1(i * 7.7) * Math.PI * 2,
  speed: 0.8 + hash1(i * 5.3) * 0.6,
  bend: (hash1(i * 2.9) - 0.5) * 0.5,
  far: i % 2 === 1,
}));

function armChain(a: (typeof ARMS)[number], p: SquidPose, k: number): V[] {
  const t = p.t;
  const spread = p.spread ?? 0.2;
  const wave = p.wave ?? 0.5;
  const curl = p.curl ?? 0.3;
  const grip = clamp(p.grip ?? 0);
  const N = 16;
  const base = {x: 28, y: (k - 3.5) * 4};
  let ang = a.base * (1 + spread * 4.5) + (spread * (k - 3.5) * 0.18);
  const pts: V[] = [base];
  let cur = base;
  const seg = a.len / (N - 1);
  for (let i = 1; i < N; i++) {
    const u = i / (N - 1);
    const w = Math.sin(t * 1.6 * a.speed * (p.armSpeed ?? 1) - u * 3.2 + a.phase) * wave * 0.22 * u;
    const c = curl * u * u * 0.9 * (a.far ? -1 : 1) + a.bend * u * 0.6;
    // al sujetar una presa, las puntas convergen hacia delante de la boca
    const toward = grip * (Math.atan2(-cur.y * 0.6, 160) - ang) * 0.35 * u;
    ang += (w + c * 0.12 + toward) * 0.9;
    cur = {x: cur.x + Math.cos(ang) * seg * (1 - grip * 0.35 * u), y: cur.y + Math.sin(ang) * seg * (1 - grip * 0.35 * u)};
    pts.push(cur);
  }
  return pts;
}

/** Tubo que se afina a lo largo de una polilínea (+ ventosas en un lado). */
function tube(pts: V[], w0: number, w1: number) {
  const n = pts.length;
  const L: V[] = [];
  const R: V[] = [];
  const nr: V[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l;
    const ny = dx / l;
    const w = (w0 + (w1 - w0) * Math.pow(i / (n - 1), 0.8)) / 2;
    L.push({x: pts[i].x + nx * w, y: pts[i].y + ny * w});
    R.push({x: pts[i].x - nx * w, y: pts[i].y - ny * w});
    nr.push({x: nx, y: ny});
  }
  const d = closedSpline([...L, ...R.reverse()], 1);
  return {d, nr};
}

/** Tentáculo: pedúnculo (curva cúbica base → maza) con extensión y ondulación. */
function tentacleChain(base: V, tip: V, ext: number, t: number, side: number): V[] {
  const rest = {x: base.x + 640, y: base.y + side * 26};
  const target = {x: lerp(rest.x, tip.x, ext), y: lerp(rest.y, tip.y, ext)};
  const dx = target.x - base.x;
  const dy = target.y - base.y;
  const D = Math.hypot(dx, dy) || 1;
  const nx = -dy / D;
  const ny = dx / D;
  const sag = (1 - ext) * 50 * side + Math.sin(t * 1.1 + side) * 26 * (1 - ext * 0.7);
  const c1 = {x: base.x + dx * 0.3 + nx * sag, y: base.y + dy * 0.3 + ny * sag};
  const c2 = {x: base.x + dx * 0.7 - nx * sag * 0.6, y: base.y + dy * 0.7 - ny * sag * 0.6};
  const N = 22;
  return Array.from({length: N}, (_, i) => {
    const u = i / (N - 1);
    const a = (1 - u) ** 3;
    const b = 3 * (1 - u) ** 2 * u;
    const c = 3 * (1 - u) * u * u;
    const d = u ** 3;
    return {x: a * base.x + b * c1.x + c * c2.x + d * target.x, y: a * base.y + b * c1.y + c * c2.y + d * target.y};
  });
}

export const GiantSquid: React.FC<{pose: SquidPose; uid: string; x: number; y: number; scale?: number; dir?: 1 | -1; angle?: number}> = ({pose, uid, x, y, scale = 1, dir = 1, angle = 0}) => {
  const p = pose;
  const t = p.t;
  const tone = clamp(p.tone ?? 0);
  const C = (c: string) => mixColor(c, '#05080e', tone * 0.85);
  const pulse = clamp(p.pulse ?? 0);
  // manto: cono alargado, se estrecha al contraerse
  const ML = 520;
  const mw = (u: number) => (u < 0.12 ? lerp(62, 74, u / 0.12) : lerp(74, 10, Math.pow((u - 0.12) / 0.88, 1.15))) * (1 - 0.13 * pulse * Math.sin(Math.PI * clamp(u * 1.1)));
  const mPts = Array.from({length: 18}, (_, i) => i / 17);
  const sway = (u: number) => Math.sin(t * 0.9 - u * 2) * 6 * u;
  const top = mPts.map((u) => ({x: -u * ML, y: -mw(u) + sway(u)}));
  const bot = mPts.map((u) => ({x: -u * ML, y: mw(u) * 0.95 + sway(u)}));
  const mantle = closedSpline([{x: 8, y: -56}, ...top.slice(1), {x: -ML - 18, y: sway(1)}, ...[...bot.slice(1)].reverse(), {x: 8, y: 54}], 1);
  // aletas
  const fph = p.fin ?? t * 2.2;
  const fa = (p.finAmp ?? 0.6) * Math.sin(fph);
  const finTip = {x: -ML + 40, y: sway(0.92)};
  const fin = (s: number) => `M${f1(-ML + 120)},${f1(sway(0.78) + s * mw(0.78) * 0.8)} Q${f1(-ML + 60)},${f1(sway(0.85) + s * (66 + fa * 30 * s))} ${f1(finTip.x - 20)},${f1(finTip.y + s * (44 + fa * 26 * s))} L${f1(-ML - 6)},${f1(sway(1))}Z`;
  // cromatóforos
  const spots = Array.from({length: 60}, (_, i) => {
    const u = 0.05 + hash1(i * 3.3) * 0.85;
    const v = (hash1(i * 7.1) - 0.5) * 1.6;
    return {x: -u * ML, y: v * mw(u) + sway(u), r: 2 + hash1(i) * 5};
  });
  // brazos
  const arms = ARMS.map((a, k) => ({a, pts: armChain(a, p, k)}));
  const drawArm = (pts: V[], far: boolean, i: number) => {
    const {d, nr} = tube(pts, far ? 28 : 34, 3);
    const col = far ? C(COL.armFar) : C(COL.arm);
    const suckers = pts.filter((_, j) => j > 1 && j % 1 === 0 && j < pts.length - 1).map((q, j) => {
      const idx = j + 2;
      const w = lerp(far ? 28 : 34, 3, Math.pow(idx / (pts.length - 1), 0.8)) / 2;
      const s = far ? -1 : 1;
      return {x: q.x + nr[idx].x * w * 0.75 * s, y: q.y + nr[idx].y * w * 0.75 * s, r: Math.max(1.2, w * 0.38)};
    });
    return (
      <g key={`arm${i}`}>
        <path d={d} fill={col} stroke={C('#2a0a06')} strokeWidth={1.2} />
        <path d={pts.map((q, j) => `${j ? 'L' : 'M'}${f1(q.x)},${f1(q.y)}`).join(' ')} stroke={C(COL.mantleLight)} strokeWidth={far ? 2 : 3} fill="none" opacity={0.35 * (1 - tone)} />
        {suckers.map((s, j) => <circle key={j} cx={s.x} cy={s.y} r={s.r} fill={C(COL.sucker)} stroke={C('#8a4a3a')} strokeWidth={0.6} opacity={far ? 0.55 : 0.95} />)}
      </g>
    );
  };
  // tentáculos
  const tents = (p.tentacles ?? [{tip: {x: 400, y: 20}, ext: 0}, {tip: {x: 400, y: -20}, ext: 0}]).map((tt, i) => {
    const side = i === 0 ? 1 : -1;
    const base = {x: 30, y: side * 8};
    const pts = tentacleChain(base, tt.tip, clamp(tt.ext), t + i * 1.7, side);
    return {pts, side};
  });
  const drawTentacle = (pts: V[], i: number) => {
    const stalk = pts.slice(0, -5);
    const club = pts.slice(-6);
    const {d} = tube(stalk, 11, 7);
    const {d: dc, nr} = tube(club, 20, 6);
    return (
      <g key={`ten${i}`}>
        <path d={d} fill={C('#b0402e')} stroke={C('#3a0e08')} strokeWidth={1} />
        <path d={dc} fill={C(COL.club)} stroke={C('#3a0e08')} strokeWidth={1.2} />
        {club.flatMap((q, j) => [-1, 1].map((s) => <circle key={`${j}${s}`} cx={q.x + nr[j].x * 4 * s} cy={q.y + nr[j].y * 4 * s} r={2.6} fill={C(COL.sucker)} stroke={C('#8a4a3a')} strokeWidth={0.6} />))}
      </g>
    );
  };
  // ojo
  const eye = {x: -26, y: -18};
  const la = p.look ? Math.atan2(p.look.y - eye.y, p.look.x - eye.x) : 0;
  const glint = 0.6 + 0.4 * Math.sin(t * 0.7);
  // sifón y chorro
  const sdir = p.siphon ?? -1;
  const sBase = {x: 8, y: 44};
  const sTip = {x: 8 + sdir * 46, y: 58};
  const jet = clamp(p.jet ?? 0);
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((angle * 180) / Math.PI)}) scale(${f1(scale * dir)} ${f1(scale)})`}>
      <defs>
        <linearGradient id={`sqm-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C(COL.mantleDark)} />
          <stop offset="0.35" stopColor={C(COL.mantle)} />
          <stop offset="0.75" stopColor={C(COL.mantleLight)} />
          <stop offset="1" stopColor={C('#e89a84')} />
        </linearGradient>
        <radialGradient id={`sqe-${uid}`} cx="0.4" cy="0.35" r="0.65">
          <stop offset="0" stopColor="#3a4a6a" />
          <stop offset="0.5" stopColor="#141c2e" />
          <stop offset="1" stopColor="#020308" />
        </radialGradient>
        <clipPath id={`sqc-${uid}`}>
          <path d={mantle} />
        </clipPath>
      </defs>
      {/* chorro del sifón (estela de agua desplazada y partículas finas) */}
      {jet > 0.01 && (
        <g opacity={jet}>
          {[0, 1, 2].map((k) => <path key={k} d={`M${f1(sTip.x)},${f1(sTip.y)} q${f1(sdir * 80)},${f1(6 + k * 6)} ${f1(sdir * (160 + k * 60))},${f1(14 + k * 16 + Math.sin(t * 9 + k) * 8)}`} stroke="#bfe8ff" strokeWidth={10 - k * 3} fill="none" opacity={0.18} strokeLinecap="round" />)}
          {Array.from({length: 10}, (_, k) => {
            const u = ((t * 2.4 + k / 10) % 1);
            return <circle key={`j${k}`} cx={sTip.x + sdir * u * 260} cy={sTip.y + u * 30 + Math.sin(k * 3 + t * 5) * 10 * u} r={1.4 + u} fill="#dff4ff" opacity={0.6 * (1 - u)} />;
          })}
        </g>
      )}
      {/* brazos lejanos y tentáculo lejano (detrás) */}
      {arms.filter((r) => r.a.far).map((r, i) => drawArm(r.pts, true, i))}
      {drawTentacle(tents[1].pts, 1)}
      {/* aleta lejana */}
      <path d={fin(-1)} fill={C('#7a2a1e')} opacity={0.9} />
      {/* manto */}
      <path d={mantle} fill={`url(#sqm-${uid})`} />
      <g clipPath={`url(#sqc-${uid})`}>
        {spots.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={C(i % 3 ? '#6a1a10' : '#c85a40')} opacity={0.4} />)}
        <path d={top.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y + 16)}`).join(' ')} stroke="#ffd8c8" strokeWidth={6} fill="none" opacity={0.22 * (1 - tone)} />
        <path d={bot.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y - 8)}`).join(' ')} stroke="#000" strokeWidth={16} fill="none" opacity={0.18} />
      </g>
      <path d={mantle} fill="none" stroke={C('#3a0e08')} strokeWidth={2} />
      {(p.rim ?? 0) > 0.01 && <path d={mantle} fill="none" stroke="#7ac8ff" strokeWidth={4} opacity={(p.rim ?? 0) * 0.55} transform="translate(0 -3)" />}
      <path d={fin(1)} fill={C('#b84a34')} stroke={C('#3a0e08')} strokeWidth={1.4} />
      {/* cabeza */}
      <ellipse cx={-4} cy={0} rx={48} ry={50} fill={C('#a03826')} stroke={C('#3a0e08')} strokeWidth={1.6} />
      {/* sifón */}
      <path d={`M${f1(sBase.x - 22)},${f1(sBase.y - 6)} Q${f1((sBase.x + sTip.x) / 2)},${f1(sBase.y + 22)} ${f1(sTip.x)},${f1(sTip.y - 8)} L${f1(sTip.x)},${f1(sTip.y + 8)} Q${f1((sBase.x + sTip.x) / 2)},${f1(sBase.y + 34)} ${f1(sBase.x - 22)},${f1(sBase.y + 10)}Z`} fill={C('#c25a42')} stroke={C('#3a0e08')} strokeWidth={1.2} />
      {/* ojo grande */}
      <g transform={`translate(${f1(eye.x)} ${f1(eye.y)})`}>
        <circle r={34} fill={C('#5a1a12')} />
        <circle r={28} fill={`url(#sqe-${uid})`} stroke={C('#e8c8a8')} strokeWidth={2} />
        <circle cx={Math.cos(la) * 6} cy={Math.sin(la) * 6} r={13} fill="#000" />
        <ellipse cx={-9 + Math.sin(t * 0.5) * 2} cy={-10} rx={7 * glint} ry={5 * glint} fill="#dff0ff" opacity={0.85 * (1 - tone * 0.5)} />
        <circle cx={8} cy={9} r={2.5} fill="#9ac8ff" opacity={0.6} />
      </g>
      {/* brazos cercanos y tentáculo cercano (delante) */}
      {arms.filter((r) => !r.a.far).map((r, i) => drawArm(r.pts, false, i + 4))}
      {drawTentacle(tents[0].pts, 0)}
    </g>
  );
};

/** Posición local de la maza de un tentáculo cuando está recogido (para encadenar animaciones). */
export const TENT_REST: V = {x: 670, y: 0};

/** Puntas de los ocho brazos (coordenadas locales) para una pose: sirve para rotular o anclar objetos. */
export const armTips = (p: SquidPose): V[] => ARMS.map((a, k) => {
  const pts = armChain(a, p, k);
  return pts[pts.length - 1];
});
