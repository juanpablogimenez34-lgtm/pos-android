// PEZ REMO GIGANTE (Regalecus glesne) — modelo 2.5D articulado y procedural (vista lateral, cabeza hacia +x).
// Anatomía representada:
//  · cuerpo en forma de cinta, muy largo y comprimido lateralmente, plateado con marcas oscuras
//    irregulares y textura de escamas sutil; se estrecha poco a poco hasta una cola fina;
//  · cabeza pequeña, ojo grande con reflejo, boca pequeña protráctil (animable), opérculo;
//  · aleta dorsal roja desde encima del ojo hasta la cola (componente OarfishFin) con la cresta de
//    radios alargados sobre la cabeza;
//  · aletas pélvicas como radios largos y finos con el extremo en forma de "remo"; pectoral pequeña.
// Movimiento: onda que recorre la aleta dorsal (cabeza → cola), cuerpo casi recto con una ondulación
// suave, curvatura en S opcional, respuesta a la corriente, inclinación y ángulo global (incluida la
// posición vertical), perspectiva a lo largo del cuerpo (la cola se aleja), desvanecimiento en la
// oscuridad y luz dependiente de la profundidad. 100 % determinista (depende solo de t).
import React from 'react';
import {clamp, hash1, mixColor} from '../../../engine/math';
import {OarfishFin, Pt} from './OarfishFin';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export const OAR = {silverTop: '#7f9bb2', silver: '#dce7ec', silverLow: '#eef4f6', mark: '#3a4a5a', red: '#d63847', eye: '#0a0f18', outline: '#1a2a3a'};

export type OarPose = {
  x: number;
  y: number;
  scale: number;
  angle: number; // rotación global (rad); −π/2 = cabeza hacia arriba
  t: number;
  length: number; // longitud del modelo (u)
  sCurve: number; // amplitud de la curva en S (u)
  sPhase: number;
  bodyWave: number; // ondulación corporal (u)
  finSpeed: number; // velocidad de la onda dorsal
  finAmp: number;
  current: number; // empuje de la corriente (desvía la cola)
  persp: number; // 0 plano · >0 la cola se aleja (más pequeña)
  fade: number; // 0 sin niebla · 1 la cola desaparece en la oscuridad
  light: number; // 0 oscuridad · 1 plena luz
  tint: string; // color de la luz ambiente
  mouth: number; // apertura/protrusión de la boca 0…1
  shine: number;
  opacity: number;
};

export const oarPose = (o: Partial<OarPose> = {}): OarPose => ({
  x: 0,
  y: 0,
  scale: 1,
  angle: 0,
  t: 0,
  length: 1900,
  sCurve: 40,
  sPhase: 0,
  bodyWave: 8,
  finSpeed: 3.2,
  finAmp: 0.38,
  current: 0,
  persp: 0,
  fade: 0,
  light: 1,
  tint: '#bfe8ff',
  mouth: 0,
  shine: 0.8,
  opacity: 1,
  ...o,
});

const NB = 72; // muestras del cuerpo
const NF = 140; // radios de la aleta dorsal
const HEAD_X = 120;

/** Altura total del cuerpo en u (0 cabeza … 1 cola). */
const depthAt = (u: number) => (u < 0.025 ? 46 + 1000 * u : 72 * (1 - 0.86 * Math.pow(u, 1.25)) + 4);

/** Geometría del cuerpo: columna, normales, escala de perspectiva. */
export function oarGeom(p: OarPose, n = NB) {
  const pts: Pt[] = [];
  const sc: number[] = [];
  let x = HEAD_X;
  const step = p.length / (n - 1);
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const f = 1 / (1 + p.persp * u);
    if (i) x -= step * f;
    const y = p.sCurve * Math.sin(u * Math.PI * 1.6 + p.sPhase + p.t * 0.12) * u + p.bodyWave * Math.sin(2 * Math.PI * 2.2 * u - p.t * 1.6) * u + p.current * 160 * u * u + Math.sin(p.t * 0.5) * 4;
    pts.push({x, y});
    sc.push(f);
  }
  const nrm = pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const l = Math.hypot(dx, dy) || 1;
    return {x: dy / l, y: -dx / l}; // hacia arriba (dorsal)
  });
  return {pts, nrm, sc};
}

const sample = (arr: Pt[], u: number) => {
  const f = clamp(u) * (arr.length - 1);
  const i = Math.min(arr.length - 2, Math.floor(f));
  const k = f - i;
  return {x: arr[i].x + (arr[i + 1].x - arr[i].x) * k, y: arr[i].y + (arr[i + 1].y - arr[i].y) * k};
};

export const Oarfish: React.FC<{p: OarPose; uid: string}> = ({p, uid}) => {
  const G = oarGeom(p);
  const L = clamp(p.light);
  const dk = (c: string) => mixColor('#06101c', mixColor(c, p.tint, 0.15), 0.12 + 0.88 * L);
  const top = G.pts.map((q, i) => ({x: q.x + G.nrm[i].x * depthAt(i / (NB - 1)) * 0.5 * G.sc[i], y: q.y + G.nrm[i].y * depthAt(i / (NB - 1)) * 0.5 * G.sc[i]}));
  const bot = G.pts.map((q, i) => ({x: q.x - G.nrm[i].x * depthAt(i / (NB - 1)) * 0.5 * G.sc[i], y: q.y - G.nrm[i].y * depthAt(i / (NB - 1)) * 0.5 * G.sc[i]}));
  const head = G.pts[0];
  const body = `M${f1(head.x + 26)},${f1(head.y - 4)} Q${f1(head.x + 18)},${f1(top[0].y - 8)} ${f1(top[0].x)},${f1(top[0].y)} ` + top.slice(1).map((q) => `L${f1(q.x)},${f1(q.y)}`).join(' ') + ` L${f1(G.pts[NB - 1].x - 14)},${f1(G.pts[NB - 1].y)} ` + bot.slice().reverse().map((q) => `L${f1(q.x)},${f1(q.y)}`).join(' ') + ` Q${f1(head.x + 22)},${f1(bot[0].y + 4)} ${f1(head.x + 26)},${f1(head.y + 6)}Z`;
  // aleta: base en el borde dorsal desde encima del ojo
  const finBase: Pt[] = [];
  const finN: Pt[] = [];
  const finS: number[] = [];
  for (let i = 0; i < NF; i++) {
    const u = 0.004 + (i / (NF - 1)) * 0.99;
    const b = sample(top, u);
    const nn = sample(G.nrm, u);
    const l = Math.hypot(nn.x, nn.y) || 1;
    finBase.push(b);
    finN.push({x: nn.x / l, y: nn.y / l});
    finS.push(1 / (1 + p.persp * u));
  }
  // marcas oscuras irregulares (deterministas)
  const marks = Array.from({length: 46}, (_, i) => {
    const u = 0.05 + hash1(i * 3.3) * 0.85;
    const c = sample(G.pts, u);
    const s = 1 / (1 + p.persp * u);
    const off = (hash1(i * 7.1) - 0.5) * depthAt(u) * 0.6 * s;
    const len = (10 + hash1(i * 5.7) * 26) * s;
    return `M${f1(c.x - len / 2)},${f1(c.y + off)} q${f1(len / 2)},${f1((hash1(i) - 0.5) * 8)} ${f1(len)},${f1((hash1(i * 2) - 0.5) * 6)}`;
  }).join(' ');
  // reflejo plateado que viaja por el cuerpo
  const shineLine = top.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x * 0.7 + G.pts[i].x * 0.3)},${f1(q.y * 0.7 + G.pts[i].y * 0.3 + 6 * G.sc[i])}`).join(' ');
  const total = p.length;
  const pelv = sample(bot, 0.02);
  const pelvA = 0.9 + Math.sin(p.t * 0.7) * 0.12;
  const pelvL = 230 * G.sc[1];
  const pelvTip = {x: pelv.x - Math.cos(pelvA - 0.6) * pelvL, y: pelv.y + Math.sin(pelvA) * pelvL};
  const pelvTip2 = {x: pelv.x - Math.cos(pelvA - 0.45) * pelvL * 0.94, y: pelv.y + Math.sin(pelvA + 0.08) * pelvL * 0.94};
  const eye = {x: head.x + 4, y: head.y - 6};
  const mo = p.mouth;
  const T = `translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1((p.angle * 180) / Math.PI)}) scale(${p.scale.toFixed(4)})`;
  return (
    <g opacity={p.opacity}>
      <defs>
        <linearGradient id={`ob-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dk(OAR.silverTop)} />
          <stop offset="0.38" stopColor={dk(OAR.silver)} />
          <stop offset="0.75" stopColor={dk(OAR.silverLow)} />
          <stop offset="1" stopColor={dk('#b8c8d2')} />
        </linearGradient>
        <linearGradient id={`osh-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity={1} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
        <pattern id={`osc-${uid}`} width={16} height={11} patternUnits="userSpaceOnUse">
          <path d="M0,11 Q8,2 16,11" stroke="#ffffff" strokeWidth={1} fill="none" opacity={0.35} />
        </pattern>
        <linearGradient id={`ofd-${uid}`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset={(0.55 - 0.45 * clamp(p.fade)).toFixed(3)} stopColor="#ffffff" />
          <stop offset="1" stopColor="#ffffff" stopOpacity={1 - clamp(p.fade)} />
        </linearGradient>
        <mask id={`omk-${uid}`} maskContentUnits="objectBoundingBox">
          <rect width={1} height={1} fill={`url(#ofd-${uid})`} />
        </mask>
      </defs>
      <g transform={T}>
        <g mask={p.fade > 0.01 ? `url(#omk-${uid})` : undefined}>
          {/* aleta pélvica lejana */}
          <path d={`M${f1(pelv.x)},${f1(pelv.y)} Q${f1((pelv.x + pelvTip2.x) / 2 + 10)},${f1((pelv.y + pelvTip2.y) / 2)} ${f1(pelvTip2.x)},${f1(pelvTip2.y)}`} stroke={dk('#9a3a48')} strokeWidth={2.5} fill="none" opacity={0.7} />
          <ellipse cx={pelvTip2.x} cy={pelvTip2.y} rx={18 * G.sc[1]} ry={6 * G.sc[1]} transform={`rotate(${f1(-35)} ${f1(pelvTip2.x)} ${f1(pelvTip2.y)})`} fill={dk('#a8404e')} opacity={0.7} />
          <OarfishFin base={finBase} nrm={finN} scale={finS} uid={uid} crest={9} p={{t: p.t, waves: 5.5 * (total / 1900), speed: p.finSpeed, amp: p.finAmp, glow: 0.4 + 0.6 * L, dark: 1 - L}} />
          {/* cuerpo */}
          <path d={body} fill={`url(#ob-${uid})`} stroke={dk(OAR.outline)} strokeWidth={3} strokeLinejoin="round" />
          <path d={body} fill={`url(#osc-${uid})`} opacity={0.5 * L} />
          <path d={marks} stroke={dk(OAR.mark)} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.55} />
          {/* línea lateral y reflejo plateado viajero */}
          <path d={G.pts.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y + 4 * G.sc[i])}`).join(' ')} stroke={dk('#a8bccb')} strokeWidth={1.6} fill="none" opacity={0.7} />
          <path d={shineLine} stroke="#ffffff" strokeWidth={7} fill="none" strokeLinecap="round" opacity={p.shine * (0.25 + 0.55 * L)} strokeDasharray="160 520" strokeDashoffset={f1(-p.t * 260)} />
          {/* cabeza: opérculo, boca protráctil, ojo con reflejo */}
          <path d={`M${f1(head.x - 26)},${f1(head.y - 28)} Q${f1(head.x - 40)},${f1(head.y)} ${f1(head.x - 24)},${f1(head.y + 30)}`} stroke={dk('#6a8094')} strokeWidth={3} fill="none" />
          <path d={`M${f1(head.x + 26)},${f1(head.y + 2)} l${f1(8 + 10 * mo)},${f1(3 + 6 * mo)} M${f1(head.x + 24)},${f1(head.y + 6)} l${f1(-4 + 12 * mo)},${f1(10 + 10 * mo)}`} stroke={dk('#4a5a6a')} strokeWidth={3} strokeLinecap="round" />
          {mo > 0.05 && <ellipse cx={head.x + 30 + 8 * mo} cy={head.y + 8 + 4 * mo} rx={5 * mo} ry={7 * mo} fill="#1a1018" opacity={0.85} />}
          <circle cx={eye.x} cy={eye.y} r={14} fill={dk('#c8d4dc')} stroke={dk(OAR.outline)} strokeWidth={2} />
          <circle cx={eye.x + 1} cy={eye.y} r={9} fill={OAR.eye} />
          <circle cx={eye.x + 4} cy={eye.y - 4} r={3.2} fill="#ffffff" opacity={0.6 + 0.4 * L} />
          <circle cx={eye.x - 3} cy={eye.y + 3} r={1.6} fill={p.tint} opacity={0.8} />
          {/* pectoral pequeña */}
          <path d={`M${f1(head.x - 46)},${f1(head.y + 14)} q-22,${f1(4 + Math.sin(p.t * 3) * 4)} -30,${f1(16 + Math.sin(p.t * 3) * 3)} q14,-2 28,-10Z`} fill={dk('#c86a74')} opacity={0.8} />
          {/* aleta pélvica cercana con extremo en forma de remo */}
          <path d={`M${f1(pelv.x)},${f1(pelv.y)} Q${f1((pelv.x + pelvTip.x) / 2 + 14)},${f1((pelv.y + pelvTip.y) / 2)} ${f1(pelvTip.x)},${f1(pelvTip.y)}`} stroke={dk('#c8404e')} strokeWidth={3.2} fill="none" />
          <ellipse cx={pelvTip.x} cy={pelvTip.y} rx={20 * G.sc[1]} ry={7 * G.sc[1]} transform={`rotate(${f1(-35)} ${f1(pelvTip.x)} ${f1(pelvTip.y)})`} fill={dk(OAR.red)} stroke={dk('#7a1a24')} strokeWidth={1.5} />
        </g>
      </g>
    </g>
  );
};

/** Punto del modelo (u a lo largo del cuerpo, v −1 dorsal … 1 ventral) → coordenadas del padre. */
export function oarPoint(p: OarPose, u: number, v = 0) {
  const G = oarGeom(p, 48);
  const c = sample(G.pts, u);
  const nn = sample(G.nrm, u);
  const h = depthAt(u) * 0.5 * (1 / (1 + p.persp * u));
  const lx = c.x - nn.x * h * v;
  const ly = c.y - nn.y * h * v;
  const ca = Math.cos(p.angle);
  const sa = Math.sin(p.angle);
  return {x: p.x + (lx * ca - ly * sa) * p.scale, y: p.y + (lx * sa + ly * ca) * p.scale};
}
