// MOTOR DE CUADRÚPEDOS (vista lateral, cabeza hacia +x).
//  · GilaMonster (Heloderma suspectum): cuerpo robusto con flexión lateral leve, cuatro patas articuladas en
//    postura extendida con ciclo de marcha diagonal, cola gruesa (reserva de grasa), escamas granuladas
//    (cuentas) con dibujo negro y anaranjado/rosado, cabeza ancha que gira y lengua bífida.
//  · Platypus (Ornithorhynchus anatinus, macho): pelaje pardo, pico ancho y blando, patas delanteras palmeadas
//    (remo alterno al nadar), traseras con ESPOLÓN en el tobillo, cola aplanada. Modos `swim` y `walk`.
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';
import {closedSpline} from '../../../lifecycle/stages';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
const P = (pts: V[]) => pts.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y)}`).join(' ');

/** Pata de dos segmentos con pie; fase de marcha: apoyo (pie fijo atrás) y vuelo (pie elevado delante). */
function limb(hip: V, ph: number, len: number, stride: number, lift: number, front: boolean): V[] {
  const c = Math.cos(ph);
  const sw = Math.sin(ph);
  const foot = {x: hip.x + sw * stride + (front ? stride * 0.2 : -stride * 0.1), y: hip.y + len - Math.max(0, -c) * lift};
  const knee = {x: (hip.x + foot.x) / 2 + (front ? -len * 0.18 : len * 0.22), y: (hip.y + foot.y) / 2 - len * 0.05};
  return [hip, knee, foot];
}

export const GilaMonster: React.FC<{x: number; y: number; t: number; walk: number; s?: number; dir?: 1 | -1; tongue?: number; look?: number; tone?: number}> = ({x, y, t, walk, s = 1, dir = 1, tongue = 0, look = 0, tone = 0}) => {
  const C = (c: string) => mixColor(c, '#060504', tone * 0.7);
  const ph = walk * Math.PI * 2;
  const sway = Math.sin(ph) * 6;
  const breath = Math.sin(t * 1.6) * 1.5;
  const body = closedSpline([{x: 150, y: -24}, {x: 110, y: -58 - breath}, {x: 0, y: -70 - breath}, {x: -110, y: -64}, {x: -170, y: -48}, {x: -250, y: -30 + sway * 0.4}, {x: -305, y: -10 + sway}, {x: -250, y: 14 + sway * 0.4}, {x: -170, y: 22}, {x: -60, y: 26 + breath}, {x: 60, y: 20}, {x: 140, y: 8}], 0.9);
  const legs = [
    {hip: {x: 90, y: 0}, ph: ph, front: true, far: true},
    {hip: {x: -120, y: 0}, ph: ph + Math.PI, front: false, far: true},
    {hip: {x: 100, y: 6}, ph: ph + Math.PI, front: true, far: false},
    {hip: {x: -110, y: 6}, ph: ph, front: false, far: false},
  ];
  const drawLeg = (l: (typeof legs)[0], i: number) => {
    const pts = limb(l.hip, l.ph, 46, 30, 14, l.front);
    const f = pts[2];
    return (
      <g key={i} opacity={l.far ? 0.8 : 1}>
        <path d={P(pts)} stroke={C(l.far ? '#2a1a14' : '#3a2418')} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={P(pts)} stroke={C(l.far ? '#a85a40' : '#d07050')} strokeWidth={8} strokeDasharray="6 10" strokeLinecap="round" fill="none" opacity={0.7} />
        {[-1, 0, 1, 2].map((k) => <path key={k} d={`M${f1(f.x)},${f1(f.y)} l${f1(10 + k * 4)},${f1(k * 3 - 2)}`} stroke={C('#2a1a14')} strokeWidth={4} strokeLinecap="round" />)}
      </g>
    );
  };
  const hx = 150;
  const tl = clamp(tongue) * 46 * (0.7 + 0.3 * Math.sin(t * 24));
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s * dir)} ${f1(s)})`}>
      <ellipse cx={-80} cy={58} rx={260} ry={14} fill="#000" opacity={0.2} />
      {legs.filter((l) => l.far).map(drawLeg)}
      <path d={body} fill={C('#24160f')} stroke={C('#120a06')} strokeWidth={2} />
      <clipPath id="gilaC"><path d={body} /></clipPath>
      <g clipPath="url(#gilaC)">
        {/* manchas anaranjadas/rosadas irregulares y bandas en la cola */}
        {Array.from({length: 7}, (_, i) => {
          const cx = 110 - i * 46;
          return <path key={`band${i}`} d={`M${f1(cx)},-80 q${f1(-18)},40 ${f1(-6)},${f1(110)} l${f1(-24)},0 q${f1(-14)},-60 ${f1(4)},-110Z`} fill={C(i % 2 ? '#e8906a' : '#e07850')} opacity={0.9} />;
        })}
        {Array.from({length: 30}, (_, i) => {
          const cx = 130 - hash1(i * 7) * 420;
          const cy = -50 + hash1(i * 3) * 60;
          return <ellipse key={i} cx={cx} cy={cy} rx={6 + hash1(i * 5) * 10} ry={4 + hash1(i * 9) * 6} fill={C(i % 2 ? '#e88a62' : '#20140e')} opacity={0.85} />;
        })}
        {[-215, -260].map((cx, i) => <rect key={`b${i}`} x={cx} y={-50} width={20} height={90} fill={C('#e07850')} opacity={0.9} />)}
        {/* escamas granuladas (cuentas) */}
        {Array.from({length: 120}, (_, i) => <circle key={`g${i}`} cx={150 - hash1(i * 7) * 450} cy={-64 + hash1(i * 9) * 86} r={3} fill={C('#000')} opacity={0.25} />)}
        <path d="M140,-30 Q0,-58 -300,-14" stroke="#ffffff" strokeWidth={6} fill="none" opacity={0.08} />
      </g>
      {/* cabeza ancha que gira */}
      <g transform={`translate(${hx} -14) rotate(${f1(look * 57)})`}>
        {tongue > 0.02 && <path d={`M70,8 L${f1(70 + tl)},8 l10,-6 M${f1(70 + tl)},8 l10,6`} stroke="#3a1a2a" strokeWidth={4} strokeLinecap="round" fill="none" />}
        <path d="M-10,-30 Q40,-38 72,-10 Q78,4 70,16 Q30,28 -10,22Z" fill={C('#2a1a12')} stroke={C('#120a06')} strokeWidth={2} />
        <path d="M10,-22 q20,-6 36,4 M20,10 q20,4 40,0" stroke={C('#e08a5a')} strokeWidth={7} fill="none" opacity={0.85} />
        <circle cx={40} cy={-12} r={5} fill="#0a0604" />
        <path d="M30,6 Q55,12 72,6" stroke="#0a0604" strokeWidth={2.5} fill="none" />
      </g>
      {legs.filter((l) => !l.far).map(drawLeg)}
    </g>
  );
};

export const Platypus: React.FC<{x: number; y: number; t: number; s?: number; dir?: 1 | -1; mode: 'swim' | 'walk'; walk?: number; angle?: number; spur?: number; wet?: number}> = ({x, y, t, s = 1, dir = 1, mode, walk = 0, angle = 0, spur = 0, wet = 0}) => {
  const swim = mode === 'swim';
  const ph = (swim ? t * 2.6 : walk) * Math.PI * 2;
  const undu = swim ? Math.sin(ph * 0.5) * 4 : 0;
  const body = closedSpline([{x: 110, y: -6}, {x: 80, y: -42}, {x: 0, y: -52 + undu}, {x: -80, y: -44}, {x: -120, y: -20}, {x: -128, y: 4}, {x: -100, y: 26}, {x: 0, y: 32 - undu}, {x: 80, y: 22}], 0.9);
  const tailA = swim ? Math.sin(ph * 0.5) * 0.1 : 0;
  const foreArm = (far: boolean) => {
    const p2 = swim ? ph + (far ? Math.PI : 0) : ph + (far ? Math.PI : 0);
    const hip = {x: 60, y: 16};
    if (swim) {
      const a = Math.sin(p2) * 0.9;
      const tip = {x: hip.x + Math.cos(Math.PI / 2 + a) * 44, y: hip.y + Math.sin(Math.PI / 2 + a) * 44};
      return (
        <g opacity={far ? 0.7 : 1}>
          <path d={P([hip, tip])} stroke="#3a2618" strokeWidth={12} strokeLinecap="round" />
          <path d={`M${f1(tip.x)},${f1(tip.y)} l${f1(-18 + Math.sin(p2) * 10)},18 l36,0Z`} fill="#3a2a22" opacity={0.95} />
        </g>
      );
    }
    const pts = limb(hip, p2, 34, 18, 10, true);
    return <path d={P(pts)} stroke={far ? '#2a1a10' : '#3a2618'} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={far ? 0.7 : 1} />;
  };
  const hind = (far: boolean) => {
    const p2 = ph + (far ? 0 : Math.PI);
    const hip = {x: -80, y: 18};
    const pts = swim ? [hip, {x: hip.x - 30, y: hip.y + 14 + Math.sin(p2) * 6}, {x: hip.x - 54, y: hip.y + 10 + Math.sin(p2) * 8}] : limb(hip, p2, 32, 16, 8, false);
    const ankle = pts[1];
    return (
      <g opacity={far ? 0.7 : 1}>
        <path d={P(pts)} stroke="#2e1e14" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* espolón del macho en el tobillo */}
        {!far && <path d={`M${f1(ankle.x)},${f1(ankle.y)} l${f1(10)},${f1(-12)} l${f1(-2)},${f1(14)}Z`} fill="#e8dcc0" stroke="#8a7a5a" strokeWidth={1.2} />}
        {!far && spur > 0.01 && <circle cx={ankle.x + 4} cy={ankle.y - 4} r={20} fill="none" stroke="#ffd870" strokeWidth={3} opacity={spur} />}
      </g>
    );
  };
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((angle * 180) / Math.PI)}) scale(${f1(s * dir)} ${f1(s)})`}>
      {!swim && <ellipse cx={0} cy={58} rx={150} ry={10} fill="#000" opacity={0.2} />}
      {foreArm(true)}
      {hind(true)}
      {/* cola aplanada */}
      <g transform={`translate(-118 0) rotate(${f1(tailA * 57)})`}>
        <path d="M0,-18 Q-60,-24 -86,-4 Q-60,18 0,16Z" fill="#4a3220" stroke="#2a1a10" strokeWidth={2} />
      </g>
      <path d={body} fill="#7e5634" stroke="#2e1e12" strokeWidth={2} />
      {/* pelaje: trazos cortos y brillo húmedo */}
      {Array.from({length: 40}, (_, i) => {
        const xx = 90 - hash1(i * 3) * 200;
        const yy = -40 + hash1(i * 5) * 60;
        return <path key={i} d={`M${f1(xx)},${f1(yy)} l-8,2`} stroke="#4a321e" strokeWidth={2} opacity={0.5} />;
      })}
      <path d="M80,-30 Q0,-50 -100,-28" stroke="#d8c0a0" strokeWidth={5} fill="none" opacity={0.18 + wet * 0.2} />
      {/* pico ancho */}
      <path d="M100,-24 Q170,-30 186,-10 Q190,4 176,10 Q140,14 100,8Z" fill="#3a3430" stroke="#1a1612" strokeWidth={2} />
      <circle cx={170} cy={-16} r={2.5} fill="#0a0a0a" />
      <circle cx={92} cy={-24} r={4} fill="#0a0806" />
      {hind(false)}
      {foreArm(false)}
    </g>
  );
};

export const _q = lerp;
