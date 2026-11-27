// TIBURÓN DE GROENLANDIA (Somniosus microcephalus) — rig 2.5D en SVG.
// Coordenadas locales: hocico en el origen, cuerpo hacia −x (L = 1000 → 200 u/m para un adulto de 5 m).
// Piezas articuladas: cabeza ancha y redondeada de hocico corto, ojo pequeño, boca ventral (mandíbula
// inferior que se abre), cinco aberturas branquiales que pulsan, aletas pectorales, dos dorsales pequeñas
// de tamaño parecido, pélvicas, SIN aleta anal, pedúnculo y aleta caudal heterocerca (lóbulo superior más
// largo). Piel gris parda, áspera, con manchas discretas.
// NATACIÓN: onda LATERAL que crece hacia la cola (la cabeza casi no se mueve). En vista lateral (cámara un
// poco elevada, 3/4) la flexión se ve por el escorzo del tronco posterior, el paralaje vertical de la
// cola y el cambio de anchura aparente de la aleta caudal al girar. Vista superior (`view: 'top'`): la
// flexión lateral se ve directamente.
// CRECIMIENTO: `age` 0 (recién nacido) … 1 (ejemplar muy longevo): proporciones juveniles (cabeza y ojo
// relativamente mayores, piel uniforme) → adulto robusto con más textura y marcas discretas.
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';
import {closedSpline} from '../../../lifecycle/stages';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
export const SL = 1000;
const N = 36;

export type SharkPose = {
  t: number;
  phase: number; // fase acumulada del batido lateral
  amp: number; // amplitud 0…1.3
  age?: number; // 0 recién nacido … 1 muy longevo
  flip?: number; // ajuste de pectorales
  jaw?: number; // apertura de la boca 0…1
  gill?: number; // frecuencia branquial (fase = t·gill)
  tone?: number; // oscurecimiento por profundidad
  rim?: number; // luz de contorno
  parasite?: boolean; // copépodo en el ojo
  view?: 'side' | 'top';
  belly?: boolean; // vista superior desde abajo (vientre más claro)
};

const TOP: [number, number][] = [[0, 0.028], [0.025, 0.06], [0.07, 0.082], [0.18, 0.094], [0.34, 0.1], [0.5, 0.092], [0.64, 0.072], [0.75, 0.05], [0.84, 0.031], [0.9, 0.025]];
const BOT: [number, number][] = [[0, 0.018], [0.025, 0.048], [0.07, 0.068], [0.22, 0.088], [0.4, 0.095], [0.55, 0.082], [0.7, 0.052], [0.84, 0.028], [0.9, 0.023]];
const WID: [number, number][] = [[0, 0.03], [0.025, 0.07], [0.09, 0.092], [0.3, 0.1], [0.5, 0.09], [0.68, 0.058], [0.84, 0.03], [0.9, 0.024]];
const prof = (tab: [number, number][], u: number) => {
  for (let i = 1; i < tab.length; i++) {
    if (u <= tab[i][0]) {
      const [a, va] = tab[i - 1];
      const [b, vb] = tab[i];
      const k = (u - a) / (b - a);
      return lerp(va, vb, k * k * (3 - 2 * k));
    }
  }
  return tab[tab.length - 1][1];
};
const BODY_END = 0.9;

/** Onda lateral z(u) (hacia el espectador +). */
export function lateral(p: SharkPose, u: number) {
  const env = Math.pow(clamp((u - 0.22) / 0.78), 1.5);
  const head = Math.sin(p.phase + 1.2) * 0.004 * (1 - u); // la cabeza apenas se mueve
  return (Math.sin(p.phase - u * 4.6) * env * 0.075 + head) * p.amp * SL;
}

/** Columna proyectada: en vista lateral, escorzo + paralaje; en vista superior, flexión directa. */
export function sharkSpine(p: SharkPose) {
  const view = p.view ?? 'side';
  const ds = (BODY_END * SL) / (N - 1);
  const pts: V[] = [];
  const zs: number[] = [];
  let x = 0;
  for (let i = 0; i < N; i++) {
    const u = (i / (N - 1)) * BODY_END;
    const z = lateral(p, u);
    if (i > 0) {
      const dz = z - zs[i - 1];
      x -= view === 'side' ? Math.sqrt(Math.max(1, ds * ds - dz * dz)) : Math.sqrt(Math.max(1, ds * ds - dz * dz));
    }
    zs.push(z);
    pts.push(view === 'side' ? {x, y: z * 0.2} : {x, y: z});
  }
  const nor = pts.map((q, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(N - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    const n = {x: -dy / l, y: dx / l};
    return n.y < 0 ? {x: -n.x, y: -n.y} : n;
  });
  return {pts, nor, zs};
}

const COL = {back: '#2c2a27', side: '#46423d', belly: '#625d56', dark: '#141310', spot: '#1e1c19', light: '#8a847a'};

export const GreenlandShark: React.FC<{pose: SharkPose; uid: string; x: number; y: number; scale?: number; dir?: 1 | -1; angle?: number; opacity?: number}> = ({pose, uid, x, y, scale = 1, dir = 1, angle = 0, opacity = 1}) => {
  const view = pose.view ?? 'side';
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((angle * 180) / Math.PI)}) scale(${f1(scale * dir)} ${f1(scale)})`} opacity={opacity}>
      {view === 'side' ? <SideShark pose={pose} uid={uid} /> : <TopShark pose={pose} uid={uid} />}
    </g>
  );
};

const SideShark: React.FC<{pose: SharkPose; uid: string}> = ({pose, uid}) => {
  const age = clamp(pose.age ?? 0.8);
  const tone = clamp(pose.tone ?? 0);
  const C = (c: string) => mixColor(c, '#05080c', tone * 0.8);
  const {pts, nor, zs} = sharkSpine(pose);
  const juv = 1 - age;
  const headK = (u: number) => (u < 0.3 ? 1 + 0.14 * juv * (1 - u / 0.3) : 1 - 0.08 * juv * clamp((u - 0.3) / 0.6));
  const top = pts.map((q, i) => {
    const u = (i / (N - 1)) * BODY_END;
    const h = prof(TOP, u) * SL * headK(u) * (0.92 + 0.08 * age);
    return {x: q.x - nor[i].x * h, y: q.y - nor[i].y * h};
  });
  const bot = pts.map((q, i) => {
    const u = (i / (N - 1)) * BODY_END;
    const h = prof(BOT, u) * SL * headK(u) * (0.92 + 0.08 * age);
    return {x: q.x + nor[i].x * h, y: q.y + nor[i].y * h};
  });
  const p0 = pts[0];
  const snout: V[] = [{x: p0.x + 8, y: p0.y - 0.012 * SL}, {x: p0.x + 12, y: p0.y + 0.004 * SL}, {x: p0.x + 6, y: p0.y + 0.016 * SL}];
  const body = closedSpline([...snout, ...bot.slice(1), ...[...top.slice(1)].reverse()], 0.9);
  const at = (u: number, side: number): V => {
    const f = clamp(u / BODY_END) * (N - 1);
    const i = Math.min(N - 2, Math.floor(f));
    const k = f - i;
    const c = {x: lerp(pts[i].x, pts[i + 1].x, k), y: lerp(pts[i].y, pts[i + 1].y, k)};
    const n = {x: lerp(nor[i].x, nor[i + 1].x, k), y: lerp(nor[i].y, nor[i + 1].y, k)};
    const h = (side < 0 ? prof(TOP, u) : prof(BOT, u)) * SL * headK(u) * Math.abs(side);
    return {x: c.x + n.x * h * Math.sign(side), y: c.y + n.y * h * Math.sign(side)};
  };
  const slope = (u: number) => {
    const f = clamp(u / BODY_END) * (N - 1);
    const i = Math.min(N - 2, Math.floor(f));
    return (zs[i + 1] - zs[i]) / ((BODY_END * SL) / (N - 1));
  };
  // aleta caudal heterocerca: anchura aparente según el giro (lateral) de la cola
  const tail = pts[N - 1];
  const yaw = Math.atan(slope(BODY_END - 0.02)) + Math.cos(pose.phase - 4.6 - 0.8) * 0.35 * pose.amp;
  const wk = 0.45 + 0.55 * Math.abs(Math.cos(yaw));
  const cf = (a: number, b: number): V => ({x: tail.x - a * SL * 0.16 * wk, y: tail.y + b * SL});
  // lóbulo superior largo y más estrecho; lóbulo inferior corto y moderado
  const caudal = closedSpline([cf(-0.05, -0.02), cf(0.35, -0.045), cf(0.8, -0.075), cf(1.05, -0.088), cf(0.98, -0.07), cf(0.7, -0.03), cf(0.52, -0.004), cf(0.55, 0.026), cf(0.44, 0.046), cf(0.22, 0.032), cf(-0.05, 0.018)], 0.85);
  // aletas
  const d1 = at(0.43, -1);
  const d2 = at(0.61, -1);
  const pe = at(0.235, 0.8);
  const pv = at(0.6, 0.95);
  const lean1 = slope(0.43) * 30;
  const lean2 = slope(0.61) * 30;
  const flipA = 0.5 + Math.sin(pose.t * 0.9) * 0.08 + (pose.flip ?? 0.3) * Math.sin(pose.t * 1.6 + 0.5) * 0.18;
  const eye = at(0.045, -0.25);
  const eyeR = 0.0085 * SL * (1 + 0.5 * juv);
  const jaw = clamp(pose.jaw ?? 0);
  const gph = pose.t * (pose.gill ?? 0.6) * Math.PI * 2;
  const gid = `${uid}-g`;
  const rim = clamp(pose.rim ?? 0.6) * (1 - tone * 0.7);
  const spots = Math.round(18 + age * 40);
  return (
    <g>
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="0" y1={-0.1 * SL} x2="0" y2={0.1 * SL}>
          <stop offset="0" stopColor={C(age > 0.3 ? COL.back : '#4a4844')} />
          <stop offset="0.55" stopColor={C(COL.side)} />
          <stop offset="1" stopColor={C(COL.belly)} />
        </linearGradient>
        <clipPath id={`${uid}-c`}>
          <path d={body} />
        </clipPath>
      </defs>
      {/* aleta pectoral lejana (asoma por debajo) */}
      <g transform={`translate(${f1(pe.x + 14)} ${f1(pe.y - 6)}) rotate(${f1((flipA + 0.15) * 57.3 + 20)})`}>
        <path d={`M0,0 C${f1(0.02 * SL)},${f1(0.03 * SL)} ${f1(0.015 * SL)},${f1(0.07 * SL)} ${f1(-0.01 * SL)},${f1(0.075 * SL)} C${f1(-0.03 * SL)},${f1(0.05 * SL)} ${f1(-0.03 * SL)},${f1(0.02 * SL)} 0,0Z`} fill={C('#2c2a26')} />
      </g>
      <path d={caudal} fill={C('#46433e')} stroke={C(COL.dark)} strokeWidth={2.5} />
      {/* dorsales pequeñas, de tamaño parecido */}
      <path d={`M${f1(d1.x + 0.03 * SL)},${f1(d1.y + 6)} Q${f1(d1.x + 0.01 * SL + lean1)},${f1(d1.y - 0.045 * SL)} ${f1(d1.x - 0.025 * SL + lean1)},${f1(d1.y - 0.04 * SL)} L${f1(d1.x - 0.035 * SL)},${f1(d1.y + 6)}Z`} fill={C('#3a3834')} stroke={C(COL.dark)} strokeWidth={2.5} />
      <path d={`M${f1(d2.x + 0.028 * SL)},${f1(d2.y + 6)} Q${f1(d2.x + 0.008 * SL + lean2)},${f1(d2.y - 0.042 * SL)} ${f1(d2.x - 0.024 * SL + lean2)},${f1(d2.y - 0.037 * SL)} L${f1(d2.x - 0.033 * SL)},${f1(d2.y + 6)}Z`} fill={C('#3a3834')} stroke={C(COL.dark)} strokeWidth={2.5} />
      {/* pélvica (sin aleta anal) */}
      <path d={`M${f1(pv.x + 0.02 * SL)},${f1(pv.y - 6)} Q${f1(pv.x - 0.01 * SL)},${f1(pv.y + 0.03 * SL)} ${f1(pv.x - 0.04 * SL)},${f1(pv.y + 0.022 * SL)} L${f1(pv.x - 0.03 * SL)},${f1(pv.y - 6)}Z`} fill={C('#4a4640')} stroke={C(COL.dark)} strokeWidth={2} />
      {/* mandíbula inferior (boca ventral) */}
      <g transform={`translate(${f1(at(0.1, 0.9).x)} ${f1(at(0.1, 0.9).y - 4)}) rotate(${f1(jaw * 22)})`}>
        {jaw > 0.15 && Array.from({length: 9}, (_, i) => <path key={i} d={`M${f1(10 + i * 7)},-2 l3,-7 l3,7Z`} fill="#e8e0d0" />)}
        <path d={`M0,-4 L${f1(0.07 * SL)},-6 Q${f1(0.075 * SL)},4 ${f1(0.06 * SL)},10 L6,12Z`} fill={C('#5a5650')} stroke={C(COL.dark)} strokeWidth={2} />
      </g>
      {/* cuerpo */}
      <path d={body} fill={`url(#${gid})`} stroke={C(COL.dark)} strokeWidth={2.5} />
      <g clipPath={`url(#${uid}-c)`}>
        {/* el flanco que gira hacia la luz se aclara (lee la onda lateral) */}
        {Array.from({length: 8}, (_, i) => {
          const u = 0.4 + i * 0.065;
          const q = at(u, 0);
          const k = clamp(slope(u) * 3);
          return k > 0.02 ? <ellipse key={`l${i}`} cx={q.x} cy={q.y - 0.02 * SL} rx={0.04 * SL} ry={0.06 * SL} fill="#c8d4dc" opacity={0.12 * k} /> : null;
        })}
        <path d={bot.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y - 0.02 * SL)}`).join(' ')} stroke={C('#141310')} strokeWidth={0.04 * SL} fill="none" opacity={0.22} />
        <path d={top.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y + 6)}`).join(' ')} stroke="#c8dce8" strokeWidth={8} fill="none" opacity={0.25 * rim} />
        {/* manchas y textura áspera */}
        {Array.from({length: spots}, (_, i) => {
          const q = at(0.05 + hash1(i * 3.7) * 0.8, (hash1(i * 5.3) - 0.55) * 1.6);
          return <ellipse key={i} cx={q.x} cy={q.y} rx={4 + hash1(i) * 9} ry={3 + hash1(i * 2) * 6} fill={C(i % 4 ? COL.spot : COL.light)} opacity={(0.18 + 0.22 * age) * (i % 4 ? 1 : 0.5)} />;
        })}
        {Array.from({length: 70}, (_, i) => {
          const q = at(0.04 + hash1(i * 9.1) * 0.84, (hash1(i * 4.4) - 0.5) * 1.8);
          return <circle key={`t${i}`} cx={q.x} cy={q.y} r={1.4} fill={C('#22201c')} opacity={0.35} />;
        })}
        {/* marcas discretas en ejemplares viejos */}
        {age > 0.75 && Array.from({length: 5}, (_, i) => {
          const q = at(0.15 + hash1(i * 13) * 0.5, -0.5 + hash1(i * 7) * 0.9);
          return <path key={`m${i}`} d={`M${f1(q.x)},${f1(q.y)} l${f1(-18 - hash1(i) * 26)},${f1((hash1(i * 3) - 0.5) * 10)}`} stroke={C('#8a867e')} strokeWidth={2} opacity={0.4 * (age - 0.75) * 4} strokeLinecap="round" />;
        })}
      </g>
      {/* cinco aberturas branquiales (pulsan con la respiración) */}
      {Array.from({length: 5}, (_, i) => {
        const u = 0.155 + i * 0.016;
        const a = at(u, -0.1);
        const b = at(u + 0.004, 0.55);
        const open = 0.5 + 0.5 * Math.sin(gph - i * 0.3);
        return <path key={`g${i}`} d={`M${f1(a.x)},${f1(a.y)} Q${f1((a.x + b.x) / 2 - 3 - open * 2)},${f1((a.y + b.y) / 2)} ${f1(b.x)},${f1(b.y)}`} stroke={C('#1c1a17')} strokeWidth={1.6 + open * 1.3} opacity={0.75} fill="none" strokeLinecap="round" />;
      })}
      {/* ojo pequeño (sin rasgos humanos) */}
      <ellipse cx={eye.x} cy={eye.y} rx={eyeR * 1.2} ry={eyeR} fill={C('#0c1416')} />
      <ellipse cx={eye.x} cy={eye.y} rx={eyeR * 0.9} ry={eyeR * 0.7} fill={C('#1e3a40')} opacity={0.8} />
      <circle cx={eye.x + eyeR * 0.3} cy={eye.y - eyeR * 0.3} r={eyeR * 0.25} fill="#d8eef4" opacity={0.6 * (1 - tone)} />
      {/* espiráculo */}
      <circle cx={at(0.075, -0.4).x} cy={at(0.075, -0.4).y} r={3} fill={C('#141210')} />
      {/* boca ventral (línea) */}
      <path d={`M${f1(at(0.035, 0.85).x)},${f1(at(0.035, 0.85).y)} Q${f1(at(0.07, 1).x)},${f1(at(0.07, 1).y + 4)} ${f1(at(0.1, 0.92).x)},${f1(at(0.1, 0.92).y)}`} stroke={C('#141210')} strokeWidth={3} fill="none" />
      {/* aleta pectoral cercana */}
      <g transform={`translate(${f1(pe.x)} ${f1(pe.y)}) rotate(${f1(flipA * 57.3 + 10)})`}>
        <path d={`M0,0 C${f1(0.025 * SL)},${f1(0.03 * SL)} ${f1(0.02 * SL)},${f1(0.075 * SL)} ${f1(-0.008 * SL)},${f1(0.082 * SL)} C${f1(-0.032 * SL)},${f1(0.055 * SL)} ${f1(-0.034 * SL)},${f1(0.02 * SL)} 0,0Z`} fill={C('#4e4a44')} stroke={C(COL.dark)} strokeWidth={2.5} />
      </g>
      {/* copépodo Ommatokoita elongata (algunos individuos) */}
      {pose.parasite && <Parasite at={eye} t={pose.t} r={eyeR} />}
    </g>
  );
};

export const Parasite: React.FC<{at: V; t: number; r: number; k?: number}> = ({at, t, r, k = 1}) => {
  const sw = Math.sin(t * 1.4) * 6;
  const len = r * 5.5;
  return (
    <g opacity={0.9 * k}>
      <path d={`M${f1(at.x)},${f1(at.y)} q${f1(-len * 0.4 + sw)},${f1(len * 0.3)} ${f1(-len * 0.8 + sw * 1.4)},${f1(len * 0.55)}`} stroke="#e8e2c8" strokeWidth={r * 0.35} fill="none" strokeLinecap="round" />
      <ellipse cx={at.x - len * 0.8 + sw * 1.4} cy={at.y + len * 0.6} rx={r * 0.3} ry={r * 0.6} fill="#ece4c0" />
      <ellipse cx={at.x - len * 0.7 + sw * 1.3} cy={at.y + len * 0.66} rx={r * 0.3} ry={r * 0.6} fill="#e4dab0" />
    </g>
  );
};

/** Vista superior (o inferior con `belly`): la flexión lateral se ve directamente. */
const TopShark: React.FC<{pose: SharkPose; uid: string}> = ({pose, uid}) => {
  const age = clamp(pose.age ?? 0.8);
  const tone = clamp(pose.tone ?? 0);
  const C = (c: string) => mixColor(c, '#05080c', tone * 0.8);
  const {pts, nor} = sharkSpine({...pose, view: 'top'});
  const juv = 1 - age;
  const wk = (u: number) => (u < 0.3 ? 1 + 0.12 * juv : 1 - 0.06 * juv);
  const L1 = pts.map((q, i) => {
    const u = (i / (N - 1)) * BODY_END;
    const w = prof(WID, u) * SL * wk(u);
    return {x: q.x - nor[i].x * w, y: q.y - nor[i].y * w};
  });
  const R1 = pts.map((q, i) => {
    const u = (i / (N - 1)) * BODY_END;
    const w = prof(WID, u) * SL * wk(u);
    return {x: q.x + nor[i].x * w, y: q.y + nor[i].y * w};
  });
  const p0 = pts[0];
  const body = closedSpline([{x: p0.x + 10, y: p0.y - 0.02 * SL}, {x: p0.x + 14, y: p0.y}, {x: p0.x + 10, y: p0.y + 0.02 * SL}, ...R1.slice(1), ...[...L1.slice(1)].reverse()], 0.9);
  const iPe = Math.round((0.235 / BODY_END) * (N - 1));
  const flip = 0.25 + Math.sin(pose.t * 1.6) * 0.08 * (pose.flip ?? 0.3);
  const tail = pts[N - 1];
  const tp = pts[N - 3];
  const ta = Math.atan2(tail.y - tp.y, tail.x - tp.x);
  const base = pose.belly ? '#8a8680' : '#4a4640';
  const gid = `${uid}-tg`;
  return (
    <g>
      <defs>
        <radialGradient id={gid} cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor={C(pose.belly ? '#a09a90' : '#5e5a54')} />
          <stop offset="1" stopColor={C(base)} />
        </radialGradient>
      </defs>
      {[-1, 1].map((s) => {
        const b = s < 0 ? L1[iPe] : R1[iPe];
        const n = nor[iPe];
        const o = {x: n.x * s, y: n.y * s};
        const tipA = {x: b.x + o.x * 0.075 * SL - 0.04 * SL, y: b.y + o.y * 0.075 * SL * (1 + flip)};
        return <path key={s} d={`M${f1(b.x + 0.02 * SL)},${f1(b.y)} Q${f1(tipA.x + 0.03 * SL)},${f1(tipA.y)} ${f1(tipA.x)},${f1(tipA.y)} L${f1(b.x - 0.05 * SL)},${f1(b.y)}Z`} fill={C('#3e3a36')} stroke={C(COL.dark)} strokeWidth={2} />;
      })}
      {/* aleta caudal (vertical, vista casi de canto desde arriba) */}
      <path d={`M${f1(tail.x)},${f1(tail.y - 5)} Q${f1(tail.x + Math.cos(ta) * 0.09 * SL)},${f1(tail.y + Math.sin(ta) * 0.09 * SL - 12)} ${f1(tail.x + Math.cos(ta) * 0.16 * SL)},${f1(tail.y + Math.sin(ta) * 0.16 * SL - 3)} L${f1(tail.x + Math.cos(ta) * 0.16 * SL)},${f1(tail.y + Math.sin(ta) * 0.16 * SL + 3)} Q${f1(tail.x + Math.cos(ta) * 0.09 * SL)},${f1(tail.y + Math.sin(ta) * 0.09 * SL + 12)} L${f1(tail.x)},${f1(tail.y + 5)}Z`} fill={C('#3a3632')} stroke={C(COL.dark)} strokeWidth={2} />
      <path d={body} fill={`url(#${gid})`} stroke={C(COL.dark)} strokeWidth={2.5} />
      {!pose.belly && [0.43, 0.61].map((u) => {
        const i = Math.round((u / BODY_END) * (N - 1));
        return <path key={u} d={`M${f1(pts[i].x + 0.03 * SL)},${f1(pts[i].y)} L${f1(pts[i - 2].x - 0.01 * SL)},${f1(pts[i - 2].y)}`} stroke={C('#22201c')} strokeWidth={7} strokeLinecap="round" />;
      })}
      {Array.from({length: Math.round(14 + age * 26)}, (_, i) => {
        const u = 0.05 + hash1(i * 3.1) * 0.8;
        const ii = Math.round((u / BODY_END) * (N - 1));
        const s = (hash1(i * 6.7) - 0.5) * 1.5 * prof(WID, u) * SL;
        return <circle key={i} cx={pts[ii].x + nor[ii].x * s} cy={pts[ii].y + nor[ii].y * s} r={3 + hash1(i) * 6} fill={C(COL.spot)} opacity={0.25} />;
      })}
      <circle cx={L1[2].x + 4} cy={L1[2].y + 8} r={4} fill={C('#0c1416')} />
      <circle cx={R1[2].x + 4} cy={R1[2].y - 8} r={4} fill={C('#0c1416')} />
    </g>
  );
};

