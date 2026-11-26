// NARVAL (Monodon monoceros) — personaje vectorial 2.5D articulado, vista lateral.
// Coordenadas locales: hocico en el origen, cuerpo hacia −x (L = 1000 u a escala 1), vientre hacia +y.
//  · COLUMNA de 36 puntos con onda DORSOVENTRAL (la cola sube y baja como en todo cetáceo) que crece hacia el
//    pedúnculo; contramovimiento leve de la cabeza; `arch` curva el cuerpo al subir o bajar.
//  · SIN ALETA DORSAL: solo una cresta baja e irregular en la mitad posterior del lomo.
//  · Cabeza redondeada, boca pequeña, ojo pequeño cerca de la comisura, espiráculo en lo alto (se abre al respirar).
//  · COLMILLO: canino izquierdo de la mandíbula superior que sale del labio y se proyecta hacia delante; rígido,
//    helicoidal (espiral levógira), se estrecha hacia la punta, textura de marfil con reflejos; su perspectiva
//    acompaña el giro lateral de la cabeza (headYaw: escorzo). No nace de la frente.
//  · Pectorales cortas con puntas levantadas (fase propia cada una) y caudal horizontal de borde convexo.
//  · PIEL: manchas oscuras irregulares definidas en coordenadas del cuerpo (u, v): se deforman con él. La edad
//    cambia el patrón: cría gris azulada uniforme → juvenil oscuro → adulto moteado de vientre claro.
import React from 'react';
import {clamp, hash1, lerp, mixColor, smoothPath} from '../../../engine/math';

export type V = {x: number; y: number};
export type NKind = 'male' | 'female' | 'calf';
export type NarwhalPose = {
  x: number; y: number; angle: number; scale: number; facing: 1 | -1; kind: NKind; t: number;
  phase: number; amp: number; arch?: number; flipN?: number; flipF?: number; jaw?: number; eye?: V; blow?: number;
  under?: number; age?: number; // 0 cría … 1 adulto (moteado)
  tusk?: number; // longitud del colmillo como fracción de L (0 = sin colmillo visible)
  headYaw?: number; // giro lateral de la cabeza (rad): escorzo del colmillo
  rim?: string; rimK?: number; shade?: number;
};

export const NL = 1000;
const N = 36;
const PROF: [number, number, number][] = [
  [0, 0.02, 0.02], [0.015, 0.056, 0.046], [0.05, 0.086, 0.07], [0.1, 0.102, 0.09], [0.2, 0.118, 0.12], [0.32, 0.125, 0.13], [0.45, 0.12, 0.12],
  [0.56, 0.104, 0.1], [0.66, 0.084, 0.075], [0.75, 0.062, 0.05], [0.83, 0.043, 0.034], [0.9, 0.028, 0.022], [0.96, 0.018, 0.014], [1, 0.012, 0.01],
];
const prof = (u: number) => {
  let i = 0;
  while (i < PROF.length - 2 && u > PROF[i + 1][0]) i++;
  const a = PROF[i];
  const b = PROF[i + 1];
  const k = clamp((u - a[0]) / (b[0] - a[0]));
  const e = k * k * (3 - 2 * k);
  return {top: lerp(a[1], b[1], e), bot: lerp(a[2], b[2], e)};
};
const f1 = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);

export function nSpine(P: NarwhalPose) {
  const pts: V[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const env = Math.pow(Math.max(0, u - 0.28) / 0.72, 1.6);
    const wave = Math.sin(P.phase - u * 2.6) * env * 0.075 * P.amp - Math.sin(P.phase + 0.6) * 0.005 * P.amp * Math.pow(1 - u, 3);
    const arch = (P.arch ?? 0) * 0.12 * (Math.pow(u - 0.45, 2) - 0.2);
    pts.push({x: -u * NL, y: (wave + arch) * NL});
  }
  const nrm: V[] = pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(N, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    const n = {x: dy / l, y: -dx / l};
    return n.y > 0 ? {x: -n.x, y: -n.y} : n;
  });
  return {pts, nrm};
}
export function nUV(S: ReturnType<typeof nSpine>, u: number, v: number, calf: boolean): V {
  const f = clamp(u) * N;
  const i = Math.min(N - 1, Math.floor(f));
  const k = f - i;
  const p = {x: lerp(S.pts[i].x, S.pts[i + 1].x, k), y: lerp(S.pts[i].y, S.pts[i + 1].y, k)};
  const n = {x: lerp(S.nrm[i].x, S.nrm[i + 1].x, k), y: lerp(S.nrm[i].y, S.nrm[i + 1].y, k)};
  const pr = prof(u);
  const h = (v >= 0 ? v * pr.top : v * pr.bot) * NL * (calf && u < 0.2 ? 1.08 : 1);
  return {x: p.x + n.x * h, y: p.y + n.y * h};
}
/** Manchas fijas sobre la piel (más densas en el lomo, escasas en el vientre). */
export const SPOTS = Array.from({length: 380}, (_, i) => {
  const u = 0.03 + hash1(i * 3.13) * 0.92;
  const r = hash1(i * 7.7);
  const v = 1 - Math.pow(r, 0.7) * 1.7; // sesgo hacia el lomo
  return {u, v: clamp(v, -0.85, 0.98), s: 0.0035 + hash1(i * 1.9) * 0.0085, a: hash1(i * 5.1) * 180, e: 0.5 + hash1(i * 2.3) * 0.5};
});

export const Narwhal: React.FC<{pose: NarwhalPose; uid: string; detail?: number}> = ({pose: P, uid, detail = 1}) => {
  const calf = P.kind === 'calf';
  const age = clamp(P.age ?? (calf ? 0 : 1));
  const S = nSpine(P);
  const U = (u: number, v: number) => nUV(S, u, v, calf);
  const top: V[] = [];
  const bot: V[] = [];
  for (let i = 0; i <= N; i++) {
    top.push(U(i / N, 1));
    bot.push(U(i / N, -1));
  }
  // mandíbula: la zona ventral de la cabeza gira hacia abajo al abrir (alimentación por succión)
  const jawA = clamp(P.jaw ?? 0) * 0.28;
  const piv = U(0.06, -0.3);
  const rotJ = (p: V) => {
    const dx = p.x - piv.x;
    const dy = p.y - piv.y;
    return {x: piv.x + dx * Math.cos(jawA) - dy * Math.sin(jawA), y: piv.y + dx * Math.sin(jawA) + dy * Math.cos(jawA)};
  };
  const botJ = bot.map((p, i) => (i / N < 0.06 ? rotJ(p) : p));
  const outline = smoothPath([...top, ...[...botJ].reverse()], true);
  // colores según la edad
  const under = clamp(P.under ?? 1);
  const baseAdult = '#a9b3b8';
  const base = age < 0.5 ? mixColor('#5e6e7c', '#4a525a', age * 2) : mixColor('#4a525a', baseAdult, (age - 0.5) * 2);
  const belly = mixColor(mixColor('#8a9aa6', '#e8ecec', age), '#9cc0d4', under * 0.3);
  const dorsal = mixColor(base, '#2a3238', 0.45);
  const spotC = mixColor('#2e383e', '#1e262c', age);
  const baseU = mixColor(base, '#6a9ab4', under * 0.25);
  const id = `nw-${uid}`;
  // pectorales cortas con puntas levantadas
  const pecLen = (P.kind === 'male' ? 0.08 : 0.072) * NL;
  const pec = (far: boolean) => {
    const b = U(far ? 0.175 : 0.17, far ? -0.5 : -0.62);
    const a0 = Math.atan2(S.nrm[6].y, S.nrm[6].x) + Math.PI;
    const sway = Math.sin(P.t * (far ? 1.6 : 1.25) + (far ? 2.2 : 0)) * 0.2 + Math.sin(P.phase * 0.5 + (far ? 2 : 0)) * 0.08 * P.amp;
    const a = a0 - 0.95 + (far ? P.flipF ?? 0 : P.flipN ?? 0) + sway;
    const d = {x: Math.cos(a), y: Math.sin(a)};
    const sd = {x: -d.y, y: d.x};
    const w = pecLen * 0.34;
    const tip = {x: b.x + d.x * pecLen - sd.x * w * 0.5, y: b.y + d.y * pecLen - sd.y * w * 0.5};
    return `M${f1(b.x - sd.x * w * 0.5)} ${f1(b.y - sd.y * w * 0.5)}C${f1(b.x + d.x * pecLen * 0.5 - sd.x * w)} ${f1(b.y + d.y * pecLen * 0.5 - sd.y * w)} ${f1(tip.x - sd.x * w * 0.4)} ${f1(tip.y - sd.y * w * 0.4)} ${f1(tip.x)} ${f1(tip.y)}C${f1(tip.x + sd.x * w * 0.6)} ${f1(tip.y + sd.y * w * 0.6)} ${f1(b.x + d.x * pecLen * 0.5 + sd.x * w * 0.5)} ${f1(b.y + d.y * pecLen * 0.5 + sd.y * w * 0.5)} ${f1(b.x + sd.x * w * 0.5)} ${f1(b.y + sd.y * w * 0.5)}Z`;
  };
  // caudal horizontal (de canto, con algo de perspectiva) de borde convexo
  const fe = S.pts[N];
  const fp = S.pts[N - 2];
  const fa = Math.atan2(fe.y - fp.y, fe.x - fp.x) + Math.sin(P.phase - 3.2) * 0.35 * P.amp;
  const fd = {x: Math.cos(fa), y: Math.sin(fa)};
  const fs = {x: -fd.y, y: fd.x};
  const chord = 0.09 * NL;
  const span = 0.13 * NL * 0.28;
  const lobe = (sg: number) => {
    const tp = {x: fe.x + fd.x * chord * 0.9 + fs.x * span * sg, y: fe.y + fd.y * chord * 0.9 + fs.y * span * sg + sg * 3};
    return `M${f1(fe.x - fd.x * 8)} ${f1(fe.y - fd.y * 8)}Q${f1(fe.x + fd.x * chord * 0.3 + fs.x * 14 * sg)} ${f1(fe.y + fd.y * chord * 0.3 + fs.y * 14 * sg)} ${f1(tp.x)} ${f1(tp.y)}Q${f1(fe.x + fd.x * chord * 1.05)} ${f1(fe.y + fd.y * chord * 1.05)} ${f1(fe.x + fd.x * chord * 0.62)} ${f1(fe.y + fd.y * chord * 0.62)}Z`;
  };
  // cresta dorsal baja (pequeñas protuberancias, no una aleta)
  const ridge = Array.from({length: 9}, (_, i) => {
    const u = 0.5 + i * 0.035;
    const a = U(u - 0.012, 0.99);
    const b = U(u, 1.08 + (i % 3 === 1 ? 0.04 : 0));
    const c = U(u + 0.012, 0.99);
    return `M${f1(a.x)} ${f1(a.y)}Q${f1(b.x)} ${f1(b.y)} ${f1(c.x)} ${f1(c.y)}`;
  }).join('');
  // colmillo
  const tuskL = (P.tusk ?? 0) * NL;
  let tuskEl: React.ReactNode = null;
  if (tuskL > 6) {
    const base = U(0.008, -0.12);
    const ref = U(0.06, -0.12);
    let ang = Math.atan2(base.y - ref.y, base.x - ref.x) - 0.04; // hacia delante, levemente hacia abajo
    const yaw = P.headYaw ?? 0;
    const fore = Math.cos(yaw); // escorzo cuando la cabeza gira hacia/desde la cámara
    ang += Math.sin(yaw) * 0.08;
    const len = tuskL * Math.max(0.12, fore);
    const d = {x: Math.cos(ang), y: Math.sin(ang)};
    const nn = {x: -d.y, y: d.x};
    const r0 = 0.0145 * NL * Math.min(1, 0.4 + (P.tusk ?? 0) * 1.6);
    const r1 = 0.0035 * NL;
    const P0 = (s: number, w: number) => ({x: base.x + d.x * len * s + nn.x * lerp(r0, r1, Math.pow(s, 0.8)) * w, y: base.y + d.y * len * s + nn.y * lerp(r0, r1, Math.pow(s, 0.8)) * w});
    const edge1: V[] = [];
    const edge2: V[] = [];
    for (let i = 0; i <= 14; i++) {
      const s = i / 14;
      edge1.push(P0(s, 1));
      edge2.push(P0(s, -1));
    }
    const tip = {x: base.x + d.x * (len + r1 * 2), y: base.y + d.y * (len + r1 * 2)};
    const shape = smoothPath([...edge1, tip, ...[...edge2].reverse()], true);
    // estrías helicoidales: líneas inclinadas que recorren el diente en espiral levógira
    const grooves: string[] = [];
    const turns = Math.max(4, Math.round(len / (0.035 * NL)));
    for (let k = 0; k < turns; k++) {
      const s0 = (k + 0.15) / turns;
      const s1 = s0 + 0.55 / turns;
      if (s1 > 0.98) continue;
      const a = P0(s0, 0.95);
      const b = P0(s1, -0.95);
      grooves.push(`M${f1(a.x)} ${f1(a.y)}Q${f1((a.x + b.x) / 2 + nn.x * 2)} ${f1((a.y + b.y) / 2 + nn.y * 2)} ${f1(b.x)} ${f1(b.y)}`);
    }
    const hl: V[] = [];
    for (let i = 0; i <= 12; i++) hl.push(P0(i / 12, 0.45));
    tuskEl = (
      <g>
        <defs>
          <linearGradient id={`${id}-t`} gradientUnits="userSpaceOnUse" x1={f1(base.x + nn.x * r0)} y1={f1(base.y + nn.y * r0)} x2={f1(base.x - nn.x * r0)} y2={f1(base.y - nn.y * r0)}>
            <stop offset="0" stopColor="#fbf6e6" />
            <stop offset="0.45" stopColor="#e8dcc0" />
            <stop offset="1" stopColor="#a8987a" />
          </linearGradient>
        </defs>
        <path d={shape} fill={`url(#${id}-t)`} stroke="#5a503e" strokeWidth={1.8} />
        <path d={grooves.join('')} stroke="#9a8a6a" strokeWidth={2.2} fill="none" opacity={0.75} />
        <path d={smoothPath(hl)} stroke="#ffffff" strokeWidth={2.6} fill="none" opacity={0.55} />
        {/* encía y labio en el punto de salida (lado izquierdo de la mandíbula superior) */}
        <ellipse cx={f1(base.x)} cy={f1(base.y)} rx={f1(r0 * 1.15)} ry={f1(r0 * 0.9)} fill={mixColor(base === base ? baseU : baseU, '#000', 0.25)} />
      </g>
    );
  }
  const eye = U(0.075, -0.05);
  const er = 0.0055 * NL * (calf ? 1.15 : 1);
  const blowP = U(0.1, 1);
  const blow = clamp(P.blow ?? 0);
  const tr = `translate(${f1(P.x)} ${f1(P.y)}) rotate(${f1((P.angle * 180) / Math.PI)}) scale(${f1(P.facing * P.scale * 1000) / 1000} ${f1(P.scale * 1000) / 1000})`;
  const rim = P.rim ?? '#dff6ff';
  const rimK = P.rimK ?? 0.45;
  const spotEls = age > 0.3 && detail > 0.3 ? SPOTS.map((s, i) => {
    const p = U(s.u, s.v);
    const k = clamp((age - 0.3) / 0.6) * (s.v < -0.4 ? 0.4 : 1);
    if (k < 0.05) return null;
    const r = s.s * NL * (0.6 + 0.4 * age);
    return <ellipse key={i} cx={f1(p.x)} cy={f1(p.y)} rx={f1(r)} ry={f1(r * s.e)} transform={`rotate(${f1(s.a)} ${f1(p.x)} ${f1(p.y)})`} fill={spotC} opacity={0.75 * k} />;
  }) : null;
  return (
    <g transform={tr}>
      <defs>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mixColor(dorsal, '#1e262c', 0.2)} />
          <stop offset="0.45" stopColor={baseU} />
          <stop offset="0.8" stopColor={belly} />
          <stop offset="1" stopColor={mixColor(belly, '#5a7a90', 0.35)} />
        </linearGradient>
        <clipPath id={`${id}-c`}>
          <path d={outline} />
        </clipPath>
      </defs>
      <path d={pec(true)} fill={mixColor(dorsal, '#000', 0.25)} stroke="#151b20" strokeWidth={2} />
      <path d={lobe(1)} fill={dorsal} stroke="#151b20" strokeWidth={2} />
      <path d={lobe(-1)} fill={mixColor(dorsal, '#000', 0.15)} stroke="#151b20" strokeWidth={2} />
      {jawA > 0.01 && <path d={smoothPath([U(0.004, -0.3), U(0.03, -0.32), piv, rotJ(U(0.03, -0.5)), rotJ(U(0.004, -0.5))], true)} fill="#b85a6a" stroke="#3a1018" strokeWidth={1.5} />}
      <path d={outline} fill={`url(#${id}-b)`} stroke="#151b20" strokeWidth={2.5} />
      <g clipPath={`url(#${id}-c)`}>
        {spotEls}
        {age > 0.5 && <path d={smoothPath([U(0.8, 1.2), U(1, 1.3), U(1, -1.3), U(0.8, -1.2)], true)} fill="#22292e" opacity={0.55 * (age - 0.5) * 2} />}
        {age > 0.5 && <path d={smoothPath([U(0.7, 1.2), U(0.82, 1.2), U(0.82, -1.2), U(0.7, -1.2)], true)} fill="#22292e" opacity={0.25 * (age - 0.5) * 2} />}
        <path d={smoothPath(Array.from({length: 18}, (_, i) => U(0.04 + i * 0.05, 0.6)))} stroke={rim} strokeWidth={0.024 * NL} fill="none" opacity={0.08} strokeLinecap="round" />
        <path d={smoothPath(Array.from({length: 18}, (_, i) => U(0.04 + i * 0.05, -0.92)))} stroke="#000" strokeWidth={0.03 * NL} fill="none" opacity={0.16} strokeLinecap="round" />
        <path d={smoothPath([U(0.003, -0.3), U(0.03, -0.33), U(0.058, -0.3)])} stroke="#151b20" strokeWidth={2.2} fill="none" />
      </g>
      <path d={ridge} stroke={mixColor(dorsal, '#000', 0.3)} strokeWidth={3} fill="none" />
      <ellipse cx={f1(eye.x)} cy={f1(eye.y)} rx={f1(er * 1.4)} ry={f1(er)} fill="#1a2024" />
      <circle cx={f1(eye.x + (P.eye?.x ?? 0.3) * er * 0.4)} cy={f1(eye.y + (P.eye?.y ?? 0) * er * 0.3)} r={f1(er * 0.7)} fill="#241a12" stroke="#000" strokeWidth={0.8} />
      <circle cx={f1(eye.x - er * 0.2)} cy={f1(eye.y - er * 0.3)} r={f1(er * 0.24)} fill="#e8f4ff" opacity={0.85} />
      <ellipse cx={f1(blowP.x)} cy={f1(blowP.y + 2)} rx={f1(4 + blow * 8)} ry={f1(1.5 + blow * 3)} fill="#11161a" />
      <path d={smoothPath(top.slice(1, Math.round(N * 0.85)))} stroke={rim} strokeWidth={3.2} fill="none" opacity={rimK} />
      <path d={pec(false)} fill={`url(#${id}-b)`} stroke="#151b20" strokeWidth={2} />
      {tuskEl}
    </g>
  );
};

/** Punto (u, v) del cuerpo en coordenadas del mundo. */
export function narwhalPoint(P: NarwhalPose, u: number, v: number): V {
  const S = nSpine(P);
  const p = nUV(S, u, v, P.kind === 'calf');
  const x = p.x * P.facing * P.scale;
  const y = p.y * P.scale;
  const c = Math.cos(P.angle);
  const s = Math.sin(P.angle);
  return {x: P.x + x * c - y * s, y: P.y + x * s + y * c};
}
/** Punta del colmillo en el mundo (misma geometría que el dibujo). */
export function tuskTip(P: NarwhalPose): V {
  const b = narwhalPoint(P, 0.008, -0.12);
  const r = narwhalPoint(P, 0.06, -0.12);
  const l = Math.hypot(b.x - r.x, b.y - r.y) || 1;
  const len = (P.tusk ?? 0) * NL * P.scale * Math.max(0.12, Math.cos(P.headYaw ?? 0));
  return {x: b.x + ((b.x - r.x) / l) * len, y: b.y + ((b.y - r.y) / l) * len};
}
