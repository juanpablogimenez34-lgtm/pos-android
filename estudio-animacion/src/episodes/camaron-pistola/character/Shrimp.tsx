// CAMARÓN PISTOLA (género Alpheus) — rig 2.5D en SVG, vista lateral, cabeza hacia +x.
// Longitud de referencia (rostro → telson) ≈ 400 u.
// Anatomía (familia Alpheidae):
//  · Caparazón liso y algo translúcido con capuchas orbitales que cubren en parte los OJOS (sobre pedúnculos
//    cortos, visibles a través de la cutícula); rostro corto.
//  · Anténulas (cortas, birrámeas) y antenas (flagelos largos y flexibles) con escama antenal.
//  · Abdomen de 6 segmentos articulados con pleuras, PLEÓPODOS que baten en onda, abanico caudal (telson +
//    urópodos) que se abre.
//  · CINCO pares de patas torácicas articuladas: P1 = quelípedos ASIMÉTRICOS (una pinza mayor «chasqueadora» y
//    otra menor y delgada); P2 = patas delgadas con pinza diminuta y carpo segmentado; P3–P5 = patas marchadoras
//    con apoyo fijo en la arena (no patinan).
//  · PINZA MAYOR muy detallada: mero y carpo, palma (própodo) voluminosa, dedo fijo y DEDO MÓVIL (dáctilo) que
//    pivota en su articulación; en el dáctilo, el «émbolo» que encaja en una cavidad del dedo fijo.
// Coloración rojiza/anaranjada/parda con bandas y bordes translúcidos.
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';
import {closedSpline} from '../../../lifecycle/stages';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
const P = (pts: V[]) => pts.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y)}`).join(' ');
const C = {body: '#c8603a', light: '#f2a070', dark: '#6a2416', band: '#8a3420', clear: '#f8d8c0', claw: '#c84a2a', clawLight: '#f0905a', tip: '#3a1a10', leg: '#d87a50'};

export type ShrimpPose = {
  t: number;
  walkDist?: number; // distancia recorrida (u locales) — sincroniza los apoyos de las patas
  open?: number; // 0 pinza mayor cerrada … 1 armada (abierta ≈ 80°)
  aim?: number; // giro del brazo de la pinza hacia la presa (rad)
  minor?: number; // apertura de la pinza menor
  flex?: number; // flexión ventral del abdomen (−0,3 … 1)
  fan?: number; // apertura del abanico caudal 0…1
  antenna?: number; // dirección de las antenas (rad; 0 = hacia delante)
  alert?: number; // 0…1 tensión de antenas
  swim?: number; // ritmo de los pleópodos
  blur?: number; // 0…1 estela de movimiento del dáctilo (chasquido)
};

/** Segmento con volumen (cápsula) entre dos puntos. */
const Seg: React.FC<{a: V; b: V; w: number; col: string; dark: string}> = ({a, b, w, col, dark}) => (
  <g>
    <path d={P([a, b])} stroke={dark} strokeWidth={w + 2.5} strokeLinecap="round" />
    <path d={P([a, b])} stroke={col} strokeWidth={w} strokeLinecap="round" />
    <path d={P([{x: a.x + (b.x - a.x) * 0.15, y: a.y + (b.y - a.y) * 0.15 - w * 0.2}, {x: a.x + (b.x - a.x) * 0.8, y: a.y + (b.y - a.y) * 0.8 - w * 0.2}])} stroke="#ffffff" strokeWidth={w * 0.25} strokeLinecap="round" opacity={0.25} />
  </g>
);

export const Shrimp: React.FC<{pose: ShrimpPose; x: number; y: number; scale?: number; dir?: 1 | -1; angle?: number; tone?: number}> = ({pose, x, y, scale = 1, dir = 1, angle = 0, tone = 0}) => {
  const K = (c: string) => mixColor(c, '#06101a', tone * 0.7);
  const t = pose.t;
  const g = `t${Math.round(tone * 100)}`;
  const open = clamp(pose.open ?? 0);
  const flex = pose.flex ?? 0.25;
  const fan = clamp(pose.fan ?? 0.6);
  const alert = clamp(pose.alert ?? 0.3);
  // ---------- abdomen (6 segmentos que se flexionan hacia abajo) ----------
  const abd: {p: V; a: number; h: number}[] = [];
  let p = {x: -118, y: 4};
  let a = Math.PI + 0.04;
  const LEN = [32, 31, 30, 28, 26, 26];
  for (let i = 0; i < 6; i++) {
    a -= (0.07 + flex * 0.17) * (i > 0 ? 1 : 0.5) + Math.sin(t * 1.3 + i * 0.6) * 0.012;
    p = {x: p.x + Math.cos(a) * LEN[i], y: p.y + Math.sin(a) * LEN[i]};
    abd.push({p, a, h: 34 - i * 3.4});
  }
  const tail = abd[5].p;
  const tailA = abd[5].a;
  // ---------- patas marchadoras con apoyo fijo ----------
  const D = 70;
  const wph = ((pose.walkDist ?? 0) / D) % 1;
  const walkLeg = (bx: number, off: number, far: boolean, k: number): React.ReactNode => {
    const ph = (wph + off) % 1;
    const duty = 0.7;
    const S = D * duty;
    const stance = ph < duty;
    const fx = stance ? bx + S / 2 - (ph / duty) * S : bx - S / 2 + ((ph - duty) / (1 - duty)) * S;
    const lift = stance ? 0 : Math.sin(((ph - duty) / (1 - duty)) * Math.PI) * 10;
    const spread = (k - 1) * 34; // P3 hacia delante, P5 hacia atrás
    const base = {x: bx, y: 30};
    const foot = {x: fx + spread, y: 96 - lift};
    const knee = {x: base.x + (foot.x - base.x) * 0.35 + 18 - k * 10, y: base.y + 14 - lift * 0.4};
    const ankle = {x: knee.x + (foot.x - knee.x) * 0.62, y: knee.y + (foot.y - knee.y) * 0.62};
    const col = far ? K(mixColor(C.leg, '#000', 0.35)) : K(C.leg);
    const band = K(mixColor(C.band, '#000', far ? 0.3 : 0));
    return (
      <g key={`w${bx}${far}`} opacity={far ? 0.8 : 1}>
        <Seg a={base} b={knee} w={7.5 - k * 0.5} col={col} dark={K(C.dark)} />
        <Seg a={knee} b={ankle} w={5.5 - k * 0.4} col={col} dark={K(C.dark)} />
        <Seg a={ankle} b={foot} w={3.6} col={K(C.clear)} dark={K(C.dark)} />
        <circle cx={knee.x} cy={knee.y} r={4} fill={band} />
        <circle cx={ankle.x} cy={ankle.y} r={3} fill={band} />
        <path d={`M${f1(foot.x)},${f1(foot.y)} l${f1(-5)},2`} stroke={K(C.tip)} strokeWidth={2.4} strokeLinecap="round" />
      </g>
    );
  };
  const legs = [[-16, 0.0], [-52, 0.33], [-88, 0.66]].map(([bx, o], k) => walkLeg(bx, o + 0.5, true, k));
  // P2 delgadas con carpo segmentado (se mueven palpando)
  const p2 = (far: boolean) => {
    const base = {x: 14, y: 30};
    const sw = Math.sin(t * 3 + (far ? 1 : 0)) * 0.25;
    const pts: V[] = [base];
    let aa = 1.2 + sw;
    let q = base;
    [26, 14, 10, 10, 10, 16].forEach((l, i) => {
      aa -= i === 0 ? 0.7 : 0.06;
      q = {x: q.x + Math.cos(aa) * l, y: q.y + Math.sin(aa) * l};
      pts.push(q);
    });
    const col = far ? K(mixColor(C.leg, '#000', 0.35)) : K(C.leg);
    return <path key={`p2${far}`} d={P(pts)} stroke={col} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
  };
  // ---------- pinza menor (lado lejano) ----------
  const minorOpen = clamp(pose.minor ?? 0.2);
  const minorClaw = (
    <g transform={`translate(34 34) rotate(${f1(18 + Math.sin(t * 1.7) * 4)})`} opacity={0.92}>
      <Seg a={{x: 0, y: 0}} b={{x: 32, y: 14}} w={7} col={K(mixColor(C.claw, '#000', 0.22))} dark={K(C.dark)} />
      <Seg a={{x: 32, y: 14}} b={{x: 62, y: 12}} w={6.5} col={K(mixColor(C.claw, '#000', 0.22))} dark={K(C.dark)} />
      <g transform="translate(62 12)">
        <path d="M0,-6 Q22,-9 40,-3 L58,0 Q40,6 0,6Z" fill={K(mixColor(C.claw, '#000', 0.15))} stroke={K(C.dark)} strokeWidth={1.5} />
        <path d="M14,-5 Q26,-7 36,-3" stroke="#ffe8d0" strokeWidth={1.6} fill="none" opacity={0.4} />
        <path d={`M38,-4 q10,${f1(-3 - minorOpen * 9)} 22,${f1(-1 - minorOpen * 11)}`} stroke={K(C.tip)} strokeWidth={3.4} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
  // ---------- PINZA MAYOR (lado cercano) ----------
  const aim = pose.aim ?? 0;
  const dactylA = -lerp(0.04, 1.4, open); // ≈ 80° abierta
  const majorClaw = (
    <g transform={`translate(30 26) rotate(${f1((aim * 180) / Math.PI)})`}>
      {/* mero y carpo */}
      <Seg a={{x: 0, y: 0}} b={{x: 34, y: 18}} w={17} col={K(C.claw)} dark={K(C.dark)} />
      <circle cx={34} cy={18} r={9} fill={K(C.band)} stroke={K(C.dark)} strokeWidth={1.5} />
      <Seg a={{x: 34, y: 18}} b={{x: 62, y: 14}} w={19} col={K(C.claw)} dark={K(C.dark)} />
      <g transform="translate(62 12)">
        {/* palma (própodo) voluminosa */}
        <defs>
          <linearGradient id={`palmG${g}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={K(C.clawLight)} />
            <stop offset="0.55" stopColor={K(C.claw)} />
            <stop offset="1" stopColor={K(C.band)} />
          </linearGradient>
        </defs>
        <path d="M0,-18 Q20,-34 70,-30 Q104,-26 118,-12 L120,6 Q104,26 66,28 Q20,30 0,18Z" fill={`url(#palmG${g})`} stroke={K(C.dark)} strokeWidth={2} />
        {Array.from({length: 18}, (_, i) => <circle key={i} cx={14 + hash1(i * 3) * 96} cy={-20 + hash1(i * 5) * 40} r={1.6 + hash1(i) * 1.6} fill={K(C.dark)} opacity={0.35} />)}
        <path d="M14,-20 Q60,-30 108,-18" stroke="#ffe8d0" strokeWidth={4} fill="none" opacity={0.35} />
        <path d="M30,22 Q70,26 110,10" stroke={K(C.band)} strokeWidth={3} fill="none" opacity={0.6} />
        {/* dedo fijo con la cavidad (receptáculo) */}
        <path d="M112,-2 Q150,0 176,10 Q160,22 112,18Z" fill={K(C.claw)} stroke={K(C.dark)} strokeWidth={2} />
        <ellipse cx={128} cy={4} rx={8} ry={4} fill={K(C.dark)} opacity={0.7} />
        <path d="M160,12 l16,-2" stroke={K(C.tip)} strokeWidth={5} strokeLinecap="round" />
        {/* dáctilo (dedo móvil) con émbolo; pivota en la articulación superior */}
        <g transform={`translate(112 -10) rotate(${f1((dactylA * 180) / Math.PI)})`}>
          {(pose.blur ?? 0) > 0.01 && [0.35, 0.7, 1.05].map((da, i) => <path key={i} d="M0,0 Q36,-10 70,4" transform={`rotate(${f1((-da * 180) / Math.PI)})`} stroke="#ffffff" strokeWidth={10 - i * 2} fill="none" opacity={(pose.blur ?? 0) * (0.3 - i * 0.08)} strokeLinecap="round" />)}
          <path d="M0,-6 Q38,-14 72,0 Q60,10 0,8Z" fill={K(C.clawLight)} stroke={K(C.dark)} strokeWidth={2} />
          <path d="M14,8 l6,10 l6,-10" fill={K(C.claw)} stroke={K(C.dark)} strokeWidth={1.4} />
          <path d="M58,2 l14,-2" stroke={K(C.tip)} strokeWidth={5} strokeLinecap="round" />
        </g>
        <circle cx={112} cy={-10} r={5} fill={K(C.band)} stroke={K(C.dark)} strokeWidth={1.4} />
      </g>
    </g>
  );
  // ---------- antenas ----------
  const ant = (base: V, len: number, phase: number, w: number) => {
    const pts: V[] = [base];
    let aa = (pose.antenna ?? -0.32) - phase * 0.12;
    let q = base;
    const n = 22;
    for (let i = 0; i < n; i++) {
      aa += Math.sin(t * (1.6 + alert * 2) + i * 0.35 + phase * 2) * 0.035 * (1 - alert * 0.6) + 0.022 * (1 - alert * 0.5) - 0.006 * phase;
      q = {x: q.x + Math.cos(aa) * (len / n), y: q.y + Math.sin(aa) * (len / n)};
      pts.push(q);
    }
    return <path d={P(pts)} stroke={K('#e8906a')} strokeWidth={w} fill="none" strokeLinecap="round" />;
  };
  // ---------- pleópodos ----------
  const pleo = abd.slice(0, 5).map((s, i) => {
    const sw = Math.sin(t * (pose.swim ?? 2) * Math.PI * 2 - i * 0.8) * 8;
    return <path key={`pl${i}`} d={`M${f1(s.p.x + 6)},${f1(s.p.y + s.h * 0.55)} q${f1(-4 + sw * 0.3)},10 ${f1(-2 + sw)},18`} stroke={K(C.clear)} strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.85} />;
  });
  // ---------- cuerpo ----------
  const carapace = closedSpline([{x: 62, y: -4}, {x: 48, y: -26}, {x: 20, y: -36}, {x: -40, y: -38}, {x: -112, y: -30}, {x: -120, y: 2}, {x: -110, y: 30}, {x: -40, y: 36}, {x: 20, y: 32}, {x: 50, y: 14}], 0.85);
  const abdPath = closedSpline([
    {x: -110, y: -28},
    ...abd.map((s) => ({x: s.p.x - Math.sin(s.a) * 0, y: s.p.y - s.h * 0.95})),
    {x: tail.x - 8, y: tail.y},
    ...[...abd].reverse().map((s) => ({x: s.p.x, y: s.p.y + s.h * 0.8})),
    {x: -110, y: 30},
  ], 0.85);
  const fanW = 22 + fan * 26;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((angle * 180) / Math.PI)}) scale(${f1(scale * dir)} ${f1(scale)})`}>
      <defs>
        <linearGradient id={`shrG${g}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={K(C.light)} />
          <stop offset="0.5" stopColor={K(C.body)} />
          <stop offset="1" stopColor={K(C.band)} />
        </linearGradient>
      </defs>
      <ellipse cx={-60} cy={92} rx={150} ry={10} fill="#000" opacity={0.25} />
      {ant({x: 50, y: -6}, 460, 1, 2.6)}
      {ant({x: 52, y: -10}, 400, 2.2, 2)}
      {legs}
      {p2(true)}
      {minorClaw}
      {/* abanico caudal: telson y urópodos (se abre) */}
      <g transform={`translate(${f1(tail.x)} ${f1(tail.y)}) rotate(${f1((-(tailA - Math.PI) * 180) / Math.PI)})`}>
        {[-1, 0, 1].map((k) => <path key={k} d={`M0,0 Q-24,${f1(k * fanW * 0.4)} -46,${f1(k * fanW)} Q-52,${f1(k * fanW * 0.6)} -50,${f1(k * fanW * 0.2 + (k === 0 ? 8 : 0))}Z`} fill={K(k === 0 ? C.body : mixColor(C.clear, C.body, 0.45))} stroke={K(C.dark)} strokeWidth={1.5} opacity={k === 0 ? 1 : 0.9} />)}
        {[-1, 1].map((k) => <path key={`e${k}`} d={`M-40,${f1(k * fanW * 0.9)} Q-50,${f1(k * fanW * 0.6)} -50,${f1(k * fanW * 0.25)}`} stroke={K(C.band)} strokeWidth={4} fill="none" opacity={0.8} />)}
      </g>
      <path d={abdPath} fill={`url(#shrG${g})`} stroke={K(C.dark)} strokeWidth={2} />
      {/* pleuras y bandas de cada segmento */}
      {abd.map((s, i) => (
        <g key={`ab${i}`}>
          <path d={`M${f1(s.p.x + 4)},${f1(s.p.y - s.h * 0.95)} Q${f1(s.p.x - 2)},${f1(s.p.y)} ${f1(s.p.x + 6)},${f1(s.p.y + s.h * 0.8)}`} stroke={K(C.dark)} strokeWidth={2} fill="none" opacity={0.7} />
          <path d={`M${f1(s.p.x + 18)},${f1(s.p.y - s.h * 0.9)} l-12,0`} stroke={K(C.band)} strokeWidth={6} opacity={0.5} />
        </g>
      ))}
      {pleo}
      <path d={carapace} fill={`url(#shrG${g})`} stroke={K(C.dark)} strokeWidth={2} />
      <path d="M56,-14 L80,-8 L58,-6Z" fill={K(C.body)} stroke={K(C.dark)} strokeWidth={1.2} />
      <path d={carapace} fill="none" stroke={K(C.clear)} strokeWidth={5} opacity={0.35} />
      <ellipse cx={-50} cy={-2} rx={46} ry={18} fill={K('#7a2a18')} opacity={0.22} />
      {/* textura y transparencia de la cutícula */}
      {Array.from({length: 22}, (_, i) => <circle key={`tx${i}`} cx={-100 + hash1(i * 7) * 150} cy={-26 + hash1(i * 9) * 50} r={1.4 + hash1(i) * 1.8} fill={K(C.dark)} opacity={0.3} />)}
      <path d="M-100,-30 Q-30,-40 40,-28" stroke={K(C.clear)} strokeWidth={6} fill="none" opacity={0.45} />
      <path d="M-110,24 Q-40,34 30,26" stroke={K(C.clear)} strokeWidth={4} fill="none" opacity={0.3} />
      {/* ojo sobre pedúnculo, bajo la capucha orbital translúcida */}
      <path d="M44,-12 l8,-8" stroke={K(C.body)} strokeWidth={6} strokeLinecap="round" />
      <circle cx={52} cy={-21} r={7} fill="#1a0a08" />
      <circle cx={54} cy={-23} r={2} fill="#ffffff" opacity={0.6} />
      <path d="M30,-30 Q56,-34 64,-12 Q54,-6 36,-12Z" fill={K(C.clear)} opacity={0.4} stroke={K(C.dark)} strokeWidth={1.2} />
      {/* escama antenal y anténulas */}
      <path d="M56,-4 q26,-6 40,-2 q-14,6 -40,6Z" fill={K(C.clear)} stroke={K(C.dark)} strokeWidth={1.2} opacity={0.85} />
      {[0, 1].map((k) => <path key={`an${k}`} d={`M58,-12 q${30 + k * 8},${-18 - k * 6 + Math.sin(t * 3 + k) * 4} ${70 + k * 10},${-14 - k * 10}`} stroke={K('#f0a078')} strokeWidth={2.2} fill="none" />)}
      {/* lado cercano: P2, patas marchadoras y pinza mayor */}
      {p2(false)}
      {[[-6, 0.0], [-44, 0.33], [-82, 0.66]].map(([bx, o], k) => walkLeg(bx, o, false, k))}
      {majorClaw}
    </g>
  );
};
