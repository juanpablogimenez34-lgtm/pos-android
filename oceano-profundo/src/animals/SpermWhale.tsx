// CACHALOTE (Physeter macrocephalus) — rig 2.5D en SVG, vista lateral.
// Coordenadas locales: la punta del hocico en el origen, el cuerpo hacia −x (longitud L = 1600 → 100 u/m
// para un macho de 16 m), el vientre hacia +y. Piezas separadas:
//  · COLUMNA de 40 puntos: la natación es una onda DORSOVENTRAL (vertical) que crece hacia la cola
//    (sin ondulación lateral de anguila); la cabeza tiene un leve contramovimiento.
//  · CABEZA en bloque (≈ 1/3 del cuerpo), frente roma; ESPIRÁCULO en el lado izquierdo de la parte
//    delantera (soplo inclinado hacia delante); OJO pequeño cerca de la comisura.
//  · MANDÍBULA inferior estrecha articulada (se abre girando desde la bisagra), dientes visibles solo al abrir.
//  · ALETA PECTORAL pequeña en forma de pala; JOROBA dorsal baja seguida de nudillos (sin aleta de tiburón).
//  · PEDÚNCULO potente y ALETA CAUDAL HORIZONTAL de dos lóbulos (proyección en perspectiva `fv`: 0 de canto,
//    1 vista de frente) que cabecea con retraso respecto a la onda.
//  · Piel: degradado direccional, arrugas detrás de la cabeza, cicatrices discretas, luz de contorno.
//  · Opcional: corte anatómico (órgano del espermaceti, «junk», cerebro) y soplo animado.
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../utils/math';
import {closedSpline} from '../utils/spline';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
export const L = 1600;
const N = 40;

export type WhalePose = {
  t: number;
  phase: number; // fase acumulada del batido de la cola (rad)
  amp: number; // amplitud del batido 0…1.4
  arch?: number; // curvatura postural (−1 cóncavo … +1 arqueado hacia arriba)
  flip?: number; // movimiento de las aletas pectorales 0…1
  jaw?: number; // apertura de la mandíbula 0…1
  fv?: number; // vista de la aleta caudal 0 (de canto) … 1 (de frente)
  blow?: number; // progreso del soplo 0…1 (0 = sin soplo)
  tone?: number; // oscurecimiento por profundidad 0…1
  rim?: number; // luz de contorno superior 0…1
  cut?: number; // corte anatómico 0…1
  calf?: boolean; // proporciones de cría (cabeza algo menor, cuerpo más rechoncho)
};

const COL = {back: '#2c3138', side: '#454c55', belly: '#6a727c', dark: '#171b20', lip: '#e8ecee', scar: '#a8b0b8'};

// semialturas del perfil (fracción de L) — arriba y abajo de la columna
const TOP: [number, number][] = [[0, 0.07], [0.012, 0.094], [0.06, 0.104], [0.2, 0.104], [0.3, 0.098], [0.36, 0.09], [0.45, 0.1], [0.56, 0.096], [0.615, 0.104], [0.66, 0.088], [0.74, 0.068], [0.82, 0.048], [0.9, 0.03], [0.96, 0.018], [1, 0.013]];
const BOT: [number, number][] = [[0, 0.036], [0.02, 0.062], [0.08, 0.082], [0.25, 0.09], [0.38, 0.104], [0.5, 0.1], [0.62, 0.088], [0.72, 0.066], [0.82, 0.044], [0.9, 0.026], [0.96, 0.015], [1, 0.012]];
const prof = (tab: [number, number][], u: number) => {
  for (let i = 1; i < tab.length; i++) {
    if (u <= tab[i][0]) {
      const [a, va] = tab[i - 1];
      const [b, vb] = tab[i];
      const k = (u - a) / (b - a);
      const s = k * k * (3 - 2 * k);
      return lerp(va, vb, s);
    }
  }
  return tab[tab.length - 1][1];
};

/** Columna deformada: x desde el hocico, y con la onda vertical. Devuelve puntos y normales. */
export function spine(p: WhalePose) {
  const amp = p.amp * 0.075 * L;
  const arch = (p.arch ?? 0) * 0.05 * L;
  const pts: V[] = [];
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    const env = Math.pow(clamp((u - 0.38) / 0.62), 1.7);
    const wave = Math.sin(p.phase - u * 3.4) * env * amp;
    const recoil = Math.sin(p.phase + 0.6) * amp * 0.05 * (1 - u);
    const ar = -Math.sin(Math.PI * u) * arch;
    pts.push({x: -u * L, y: wave + recoil + ar});
  }
  const nor = pts.map((q, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(N - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    return {x: -dy / l, y: dx / l}; // apunta hacia el vientre (+y) cuando el cuerpo va hacia −x
  });
  // `nor` mira hacia −y para dx<0; normalizar para que apunte al vientre
  const n2 = nor.map((n) => (n.y < 0 ? {x: -n.x, y: -n.y} : n));
  return {pts, nor: n2};
}

/** Punto local sobre el cuerpo: u (0 hocico … 1 cola), side (−1 dorso … +1 vientre, fracción del perfil). */
export function whalePoint(p: WhalePose, u: number, side = 0): V {
  const {pts, nor} = spine(p);
  const f = clamp(u) * (N - 1);
  const i = Math.min(N - 2, Math.floor(f));
  const k = f - i;
  const c = {x: lerp(pts[i].x, pts[i + 1].x, k), y: lerp(pts[i].y, pts[i + 1].y, k)};
  const n = {x: lerp(nor[i].x, nor[i + 1].x, k), y: lerp(nor[i].y, nor[i + 1].y, k)};
  const h = (side < 0 ? prof(TOP, u) : prof(BOT, u)) * L * Math.abs(side);
  return {x: c.x + n.x * h * Math.sign(side || 1) * (side === 0 ? 0 : 1), y: c.y + n.y * h * Math.sign(side || 1) * (side === 0 ? 0 : 1)};
}
/** Origen de los clics (parte delantera de la cabeza, local). */
export const SOUND_ORIGIN: V = {x: 4, y: -40};

export const SpermWhale: React.FC<{pose: WhalePose; uid: string; x: number; y: number; scale?: number; dir?: 1 | -1; angle?: number; opacity?: number}> = ({pose, uid, x, y, scale = 1, dir = 1, angle = 0, opacity = 1}) => {
  const tone = clamp(pose.tone ?? 0);
  const C = (c: string) => mixColor(c, '#04070c', tone * 0.82);
  const {pts, nor} = spine(pose);
  const calfK = pose.calf ? 1.28 : 1;
  const top = pts.map((q, i) => {
    const u = i / (N - 1);
    const knuckle = u > 0.66 && u < 0.88 ? Math.max(0, Math.sin((u - 0.66) * 70)) * 0.006 : 0;
    const h = (prof(TOP, u) + knuckle) * L * (u < 0.33 && pose.calf ? 0.94 : calfK);
    return {x: q.x - nor[i].x * h, y: q.y - nor[i].y * h};
  });
  const bot = pts.map((q, i) => {
    const u = i / (N - 1);
    const h = prof(BOT, u) * L * calfK;
    return {x: q.x + nor[i].x * h, y: q.y + nor[i].y * h};
  });
  // frente roma de la cabeza (ligeramente abombada)
  const p0 = pts[0];
  const front: V[] = [
    {x: p0.x + 10, y: p0.y - 0.088 * L},
    {x: p0.x + 18, y: p0.y - 0.04 * L},
    {x: p0.x + 16, y: p0.y + 0.006 * L},
    {x: p0.x + 6, y: p0.y + 0.03 * L},
  ];
  const body = closedSpline([...front, ...bot.slice(1), ...[...top.slice(1)].reverse()], 0.9);
  // aleta caudal: base en la cola, eje tangente con cabeceo retrasado
  const tail = pts[N - 1];
  const tp = pts[N - 4];
  const ang = Math.atan2(tail.y - tp.y, tail.x - tp.x) + Math.cos(pose.phase - 3.4 - 0.9) * pose.amp * 0.35;
  const T = {x: Math.cos(ang), y: Math.sin(ang)};
  const Nn = {x: -T.y, y: T.x};
  const fv = clamp(pose.fv ?? 0.3, 0, 1);
  const span = 0.13 * L;
  const fl = (sideK: number) => {
    // lóbulo en el plano de la aleta: a (a lo largo), b (envergadura)
    const pl: [number, number][] = [[0, 0.02], [0.05, 0.25], [0.12, 0.62], [0.17, 0.92], [0.2, 1], [0.165, 0.7], [0.13, 0.36], [0.115, 0.06]];
    return pl.map(([a, b]) => {
      const A = a * L * 0.9;
      const B = b * span * sideK * Math.max(0.1, fv);
      const thick = (1 - b) * 10 * (1 - fv) * sideK;
      return {x: tail.x + T.x * A + Nn.x * (B + thick), y: tail.y + T.y * A + Nn.y * (B + thick)};
    });
  };
  const lobeNear = closedSpline([tail, ...fl(1)], 0.8);
  const lobeFar = closedSpline([tail, ...fl(-0.85)], 0.8);
  // mandíbula inferior: varilla estrecha bajo la cabeza, bisagra en u≈0.27
  const hingeU = 0.27;
  const hi = Math.round(hingeU * (N - 1));
  const hinge = bot[hi];
  const jaw = clamp(pose.jaw ?? 0);
  const jawA = jaw * 0.55;
  const jawLen = Math.abs(hinge.x - (p0.x - 0.03 * L));
  const jawPath = `M0,-4 L${f1(jawLen)},-2 Q${f1(jawLen + 8)},6 ${f1(jawLen - 6)},14 L${f1(jawLen * 0.35)},24 Q0,26 -18,10Z`;
  // pectoral
  const fp = bot[Math.round(0.36 * (N - 1))];
  const flipA = 0.55 + Math.sin(pose.t * 1.3 + 1) * 0.1 + (pose.flip ?? 0.3) * Math.sin(pose.t * 2.1) * 0.25;
  // ojo
  const eyeI = Math.round(0.305 * (N - 1));
  const eye = {x: lerp(pts[eyeI].x, bot[eyeI].x, 0.55), y: lerp(pts[eyeI].y, bot[eyeI].y, 0.55)};
  const blowhole = {x: top[0].x - 0.025 * L, y: top[1].y + 6};
  const gid = `${uid}-g`;
  const rim = clamp(pose.rim ?? 0.6) * (1 - tone * 0.7);
  const cut = clamp(pose.cut ?? 0);
  const blow = clamp(pose.blow ?? 0);
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((angle * 180) / Math.PI)}) scale(${f1(scale * dir)} ${f1(scale)})`} opacity={opacity}>
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="0" y1={-0.11 * L} x2="0" y2={0.1 * L}>
          <stop offset="0" stopColor={C(COL.back)} />
          <stop offset="0.55" stopColor={C(COL.side)} />
          <stop offset="1" stopColor={C(COL.belly)} />
        </linearGradient>
        <clipPath id={`${uid}-c`}>
          <path d={body} />
        </clipPath>
      </defs>
      {/* lóbulo lejano de la aleta caudal (detrás) */}
      <path d={lobeFar} fill={C('#22262c')} />
      {/* mandíbula (se dibuja detrás del cuerpo para que la cabeza la tape al cerrarse) */}
      <g transform={`translate(${f1(hinge.x)} ${f1(hinge.y - 10)}) rotate(${f1((jawA * 180) / Math.PI)})`}>
        {jaw > 0.04 && (
          <>
            <path d={`M10,-2 L${f1(jawLen - 6)},-2 L${f1(jawLen - 10)},10 L14,16Z`} fill={C('#e8d8d8')} opacity={0.9} />
            {Array.from({length: 18}, (_, i) => {
              const xx = 30 + (i / 17) * (jawLen - 50);
              return <path key={i} d={`M${f1(xx - 5)},-1 L${f1(xx)},${f1(-14 - jaw * 4)} L${f1(xx + 5)},-1Z`} fill={C('#f2eee4')} stroke={C('#9a948a')} strokeWidth={1} />;
            })}
          </>
        )}
        <path d={jawPath} fill={C(COL.side)} stroke={C(COL.dark)} strokeWidth={3} />
        <path d={`M${f1(jawLen * 0.45)},18 L${f1(jawLen - 4)},10`} stroke={C(COL.lip)} strokeWidth={5} strokeLinecap="round" opacity={0.85} />
      </g>
      {/* cuerpo */}
      <path d={body} fill={`url(#${gid})`} stroke={C(COL.dark)} strokeWidth={3} />
      <g clipPath={`url(#${uid}-c)`}>
        {/* sombra ventral y luz dorsal */}
        <path d={bot.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y - 0.02 * L)}`).join(' ')} stroke={C('#0e1216')} strokeWidth={0.05 * L} fill="none" opacity={0.25} />
        <path d={top.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y + 10)}`).join(' ')} stroke="#c8dcec" strokeWidth={14} fill="none" opacity={0.22 * rim} />
        {/* arrugas (detrás de la cabeza) */}
        {Array.from({length: pose.calf ? 22 : 54}, (_, i) => {
          const u = 0.34 + hash1(i * 3.1) * 0.5;
          const s = (hash1(i * 7.7) - 0.5) * 1.6;
          const q = whalePoint(pose, u, s);
          const w = 26 + hash1(i) * 40;
          return <path key={i} d={`M${f1(q.x)},${f1(q.y)} q${f1(-w / 2)},${f1(-3 + hash1(i * 5) * 6)} ${f1(-w)},0`} stroke={C('#1c2126')} strokeWidth={2.4} fill="none" opacity={0.5} />;
        })}
        {/* cicatrices discretas en la cabeza (líneas y algunas marcas circulares tenues) */}
        {!pose.calf && Array.from({length: 10}, (_, i) => {
          const u = 0.03 + hash1(i * 11) * 0.24;
          const q = whalePoint(pose, u, -0.7 + hash1(i * 13) * 1.2);
          return <path key={`s${i}`} d={`M${f1(q.x)},${f1(q.y)} l${f1(-30 - hash1(i) * 50)},${f1((hash1(i * 2) - 0.5) * 18)}`} stroke={C(COL.scar)} strokeWidth={2} opacity={0.35} strokeLinecap="round" />;
        })}
        {!pose.calf && Array.from({length: 5}, (_, i) => {
          const q = whalePoint(pose, 0.08 + i * 0.035, -0.35 + hash1(i * 17) * 0.5);
          return <circle key={`r${i}`} cx={q.x} cy={q.y} r={7 + hash1(i * 3) * 7} fill="none" stroke={C(COL.scar)} strokeWidth={1.8} opacity={0.28} />;
        })}
        {/* surco entre la cabeza y el cuerpo, labio blanco superior */}
        <path d={`M${f1(bot[3].x)},${f1(bot[3].y - 8)} L${f1(hinge.x)},${f1(hinge.y - 14)}`} stroke={C('#1a1e22')} strokeWidth={5} opacity={0.6} />
        {/* corte anatómico */}
        {cut > 0.01 && (
          <g opacity={cut}>
            <path d={`M${f1(p0.x + 4)},${f1(p0.y - 0.075 * L)} Q${f1(-0.12 * L)},${f1(p0.y - 0.112 * L)} ${f1(-0.27 * L)},${f1(p0.y - 0.07 * L)} Q${f1(-0.2 * L)},${f1(p0.y - 0.005 * L)} ${f1(p0.x - 10)},${f1(p0.y - 0.02 * L)}Z`} fill="#e8c890" stroke="#8a6a3a" strokeWidth={3} opacity={0.92} />
            {Array.from({length: 6}, (_, i) => {
              const x0 = -0.02 * L - i * 0.04 * L;
              return <path key={i} d={`M${f1(x0)},${f1(p0.y + 0.002 * L)} q${f1(-0.02 * L)},${f1(0.016 * L)} ${f1(-0.04 * L)},0 q${f1(0.02 * L)},${f1(0.018 * L)} ${f1(0.04 * L)},0`} fill="#d8b0a0" stroke="#8a5a4a" strokeWidth={2} opacity={0.9} />;
            })}
            <path d={`M${f1(-0.27 * L)},${f1(p0.y - 0.07 * L)} q${f1(-0.03 * L)},${f1(0.03 * L)} ${f1(-0.02 * L)},${f1(0.08 * L)} l${f1(0.03 * L)},${f1(0.02 * L)}`} stroke="#e8e0d0" strokeWidth={10} fill="none" opacity={0.9} />
            <ellipse cx={-0.3 * L} cy={p0.y + 0.0 * L} rx={0.026 * L} ry={0.02 * L} fill="#e0a0b0" stroke="#8a4a5a" strokeWidth={3} />
            {Array.from({length: 5}, (_, i) => <path key={`b${i}`} d={`M${f1(-0.3 * L - 30 + i * 14)},${f1(p0.y - 20)} q8,14 0,30`} stroke="#a85a6a" strokeWidth={2} fill="none" />)}
          </g>
        )}
      </g>
      {/* espiráculo (lado izquierdo, delante) */}
      <path d={`M${f1(blowhole.x - 14)},${f1(blowhole.y)} q14,-6 28,2`} stroke={C('#0c0f12')} strokeWidth={4} fill="none" />
      {/* ojo pequeño */}
      <ellipse cx={eye.x} cy={eye.y} rx={11} ry={7} fill={C('#0a0c0e')} />
      <circle cx={eye.x + 3} cy={eye.y - 2} r={2.4} fill="#dfe8f0" opacity={0.7 * (1 - tone)} />
      <path d={`M${f1(eye.x - 16)},${f1(eye.y - 9)} q16,-8 32,0`} stroke={C('#1a1e22')} strokeWidth={2.5} fill="none" />
      {/* aleta pectoral */}
      <g transform={`translate(${f1(fp.x)} ${f1(fp.y - 14)}) rotate(${f1((flipA * 180) / Math.PI + 90)})`}>
        <path d={`M-14,0 C-20,${f1(0.04 * L)} -10,${f1(0.075 * L)} 0,${f1(0.08 * L)} C10,${f1(0.075 * L)} 18,${f1(0.04 * L)} 12,0Z`} fill={C('#3a4048')} stroke={C(COL.dark)} strokeWidth={2.5} />
      </g>
      {/* lóbulo cercano de la aleta caudal */}
      <path d={lobeNear} fill={C('#363c44')} stroke={C(COL.dark)} strokeWidth={2.5} />
      {/* soplo: niebla inclinada hacia delante (espiráculo a la izquierda → soplo oblicuo) */}
      {blow > 0.01 && blow < 0.999 && <Blow at={blowhole} k={blow} uid={uid} t={pose.t} />}
    </g>
  );
};

const Blow: React.FC<{at: V; k: number; uid: string; t: number}> = ({at, k, uid, t}) => {
  const rise = Math.pow(k, 0.45);
  const fade = clamp((1 - k) / 0.55);
  const n = 44;
  return (
    <g opacity={fade}>
      {Array.from({length: n}, (_, i) => {
        const r = hash1(i * 3.3);
        const along = (0.2 + r * 0.8) * rise * 760;
        const spread = (hash1(i * 5.1) - 0.5) * along * 0.5;
        const ang = -0.95; // hacia delante y arriba (≈ 45°)
        const x = at.x + Math.cos(ang) * along - Math.sin(ang) * spread + Math.sin(t * 2 + i) * 6;
        const y = at.y + Math.sin(ang) * along + Math.cos(ang) * spread;
        const rad = 20 + r * 50 * rise;
        return <circle key={`${uid}-b${i}`} cx={x} cy={y} r={rad} fill="#f4f8fb" opacity={0.22 + 0.25 * (1 - r)} />;
      })}
    </g>
  );
};
