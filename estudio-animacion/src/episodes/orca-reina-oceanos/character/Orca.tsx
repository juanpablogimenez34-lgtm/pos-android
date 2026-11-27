// ORCA (Orcinus orca) — personaje vectorial 2.5D articulado, vista lateral.
// Coordenadas locales: hocico en el origen, cuerpo hacia −x (L = 1000 u a escala 1), vientre hacia +y.
//  · COLUMNA de 36 puntos: natación por onda DORSOVENTRAL (la cola sube y baja, nunca de lado), que crece hacia
//    el pedúnculo; la cabeza hace un leve contramovimiento; `arch` curva el cuerpo en saltos y giros verticales.
//  · PATRÓN UNIDO A LA PIEL: cada mancha se define en coordenadas del cuerpo (u a lo largo, v de vientre −1 a
//    lomo +1) y se recalcula sobre la columna deformada en cada fotograma (parche ocular, mentón y vientre blancos,
//    lóbulo blanco del flanco, montura gris tras la aleta dorsal).
//  · OJO real pequeño delante y debajo del parche blanco; ESPIRÁCULO en lo alto de la cabeza (se abre al respirar).
//  · MANDÍBULA articulada con dientes cónicos visibles al abrir.
//  · ALETA DORSAL según edad/sexo (macho alta y triangular, hembra falcada, cría pequeña); flexión con retraso.
//  · DOS ALETAS PECTORALES en forma de pala con fase propia; ALETA CAUDAL horizontal de dos lóbulos.
//  · Cría: proporciones juveniles (cabeza mayor, aletas cortas) y zonas claras de tono anaranjado.
import React from 'react';
import {clamp, hash1, lerp, mixColor, smoothPath} from '../../../engine/math';

export type V = {x: number; y: number};
export type Kind = 'male' | 'female' | 'calf';
export type OrcaPose = {
  x: number; y: number; angle: number; scale: number; facing: 1 | -1;
  kind: Kind; t: number;
  phase: number; // fase acumulada del batido (rad)
  amp: number; // intensidad del batido 0…1.4
  arch?: number; // curvatura del cuerpo (− cóncavo hacia arriba, + arqueado)
  flipN?: number; flipF?: number; // ángulo extra de las pectorales (rad)
  jaw?: number; // 0…1
  eye?: V; // mirada (−1…1)
  blow?: number; // 0…1 apertura del espiráculo
  fv?: number; // vista de la caudal: 0 de canto … 1 desde arriba
  under?: number; // 0 fuera del agua … 1 bajo el agua (tinte azul)
  rim?: string; rimK?: number; shade?: number;
  age?: number; // 0 recién nacida … 1 juvenil (solo para kind = 'calf')
};

export const L = 1000;
const N = 36;
// perfil: [u, alto dorsal, alto ventral] (fracciones de L)
const PROF: [number, number, number][] = [
  [0, 0.012, 0.012], [0.015, 0.046, 0.04], [0.04, 0.072, 0.062], [0.08, 0.092, 0.078], [0.14, 0.104, 0.094], [0.22, 0.116, 0.114],
  [0.32, 0.122, 0.124], [0.42, 0.118, 0.118], [0.52, 0.104, 0.1], [0.62, 0.084, 0.078], [0.72, 0.06, 0.052], [0.8, 0.044, 0.036],
  [0.88, 0.03, 0.024], [0.95, 0.018, 0.015], [1, 0.012, 0.01],
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

/** Esqueleto deformado: puntos de la columna y normales "hacia el lomo". */
export function spine(P: OrcaPose) {
  const amp = P.amp;
  const calf = P.kind === 'calf';
  const pts: V[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const env = Math.pow(Math.max(0, u - 0.28) / 0.72, 1.6);
    const wave = Math.sin(P.phase - u * 2.6) * env * 0.075 * amp - Math.sin(P.phase + 0.6) * 0.006 * amp * Math.pow(1 - u, 3);
    const arch = (P.arch ?? 0) * 0.12 * (Math.pow(u - 0.45, 2) - 0.2);
    pts.push({x: -u * L, y: (wave + arch) * L * (calf ? 1.1 : 1)});
  }
  const nrm: V[] = pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(N, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    // hacia el lomo (−y cuando el cuerpo es horizontal hacia −x): rotar la tangente
    return {x: dy / l, y: -dx / l};
  });
  // corregir orientación: la tangente apunta a −x; el lomo debe quedar en −y
  for (const n of nrm) {
    if (n.y > 0) {
      n.x = -n.x;
      n.y = -n.y;
    }
  }
  return {pts, nrm};
}
/** Coordenadas del cuerpo (u, v) → local. v: +1 borde dorsal · −1 borde ventral. */
export function uv(S: ReturnType<typeof spine>, u: number, v: number, kind: Kind): V {
  const f = clamp(u) * N;
  const i = Math.min(N - 1, Math.floor(f));
  const k = f - i;
  const p = {x: lerp(S.pts[i].x, S.pts[i + 1].x, k), y: lerp(S.pts[i].y, S.pts[i + 1].y, k)};
  const n = {x: lerp(S.nrm[i].x, S.nrm[i + 1].x, k), y: lerp(S.nrm[i].y, S.nrm[i + 1].y, k)};
  const pr = prof(u);
  const headK = kind === 'calf' ? 1.06 : 1;
  const h = (v >= 0 ? v * pr.top : v * pr.bot) * L * (u < 0.25 ? headK : 1);
  return {x: p.x + n.x * h, y: p.y + n.y * h};
}
const path = (S: ReturnType<typeof spine>, pts: [number, number][], kind: Kind, closed = true) => smoothPath(pts.map(([u, v]) => uv(S, u, v, kind)), closed);

// manchas (u, v)
const WHITE_BELLY: [number, number][] = [
  [0.012, -0.2], [0.035, -0.12], [0.07, -0.22], [0.12, -0.38], [0.2, -0.5], [0.3, -0.56], [0.4, -0.6], [0.48, -0.55], [0.54, -0.3], [0.58, 0.12], [0.62, 0.42], [0.665, 0.46], [0.7, 0.24], [0.72, -0.2], [0.74, -0.7],
  [0.7, -0.99], [0.55, -0.99], [0.4, -0.99], [0.25, -0.99], [0.12, -0.99], [0.05, -0.97], [0.015, -0.8], [0.004, -0.45],
];
const EYE_PATCH: [number, number][] = [[0.135, 0.3], [0.16, 0.44], [0.2, 0.5], [0.232, 0.44], [0.226, 0.3], [0.19, 0.24], [0.155, 0.22]];
const SADDLE: [number, number][] = [[0.47, 0.99], [0.5, 0.8], [0.56, 0.72], [0.62, 0.76], [0.66, 0.9], [0.68, 0.99]];
const EYE_UV: [number, number] = [0.118, 0.06];

export const Orca: React.FC<{pose: OrcaPose; uid: string; detail?: number}> = ({pose: P, uid, detail = 1}) => {
  const kind = P.kind;
  const calfAge = clamp(P.age ?? 0);
  const S = spine(P);
  const under = clamp(P.under ?? 1);
  const U = (u: number, v: number) => uv(S, u, v, kind);
  // ---- contorno del cuerpo
  const top: V[] = [];
  const bot: V[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    top.push(U(u, 1));
    bot.push(U(u, -1));
  }
  const jawA = clamp(P.jaw ?? 0) * 0.32;
  const jawPivot = U(0.1, -0.25);
  const rotJ = (p: V) => {
    const dx = p.x - jawPivot.x;
    const dy = p.y - jawPivot.y;
    const c = Math.cos(jawA);
    const sn = Math.sin(jawA);
    return {x: jawPivot.x + dx * c - dy * sn, y: jawPivot.y + dx * sn + dy * c};
  };
  // la parte ventral de la cabeza (u < 0.1) pertenece a la mandíbula
  const botJ = bot.map((p, i) => (i / N < 0.1 ? rotJ(p) : p));
  const outline = smoothPath([...top, ...[...botJ].reverse()], true);
  // ---- aleta dorsal
  const dorsalH = kind === 'male' ? 0.19 : kind === 'female' ? 0.105 : 0.075;
  const db0 = U(0.37, 0.98);
  const db1 = U(0.5, 0.98);
  const dn = S.nrm[Math.round(0.44 * N)];
  const dlag = Math.sin(P.phase - 1.2) * 0.04 * P.amp;
  const dtipBack = kind === 'male' ? 0.035 : 0.075;
  const dtip = {x: db0.x - (dtipBack + dlag * 0.3) * L + dn.x * dorsalH * L, y: db0.y + dn.y * dorsalH * L};
  const dorsal = kind === 'male'
    ? `M${f1(db0.x + 6)} ${f1(db0.y)}C${f1(db0.x - 6)} ${f1(db0.y - dorsalH * L * 0.4)} ${f1(dtip.x + 12)} ${f1(dtip.y + 40)} ${f1(dtip.x)} ${f1(dtip.y)}C${f1(dtip.x - 18)} ${f1(dtip.y + 60)} ${f1(db1.x + 20)} ${f1(db1.y - 40)} ${f1(db1.x)} ${f1(db1.y)}Z`
    : `M${f1(db0.x + 6)} ${f1(db0.y)}C${f1(db0.x - 10)} ${f1(db0.y - dorsalH * L * 0.7)} ${f1(dtip.x + 40)} ${f1(dtip.y - 6)} ${f1(dtip.x)} ${f1(dtip.y)}C${f1(dtip.x + 6)} ${f1(dtip.y + 30)} ${f1(db1.x + 30)} ${f1(db1.y - 22)} ${f1(db1.x)} ${f1(db1.y)}Z`;
  // ---- pectorales (pala redondeada); cercana delante, lejana detrás
  const pecLen = (kind === 'male' ? 0.13 : kind === 'female' ? 0.1 : 0.095) * L;
  const pec = (far: boolean) => {
    const base = U(far ? 0.205 : 0.2, far ? -0.55 : -0.68);
    const a0 = Math.atan2(S.nrm[7].y, S.nrm[7].x) + Math.PI; // hacia el vientre
    const sway = Math.sin(P.t * (far ? 1.7 : 1.3) + (far ? 1.9 : 0)) * 0.18 + Math.sin(P.phase * 0.5 + (far ? 2 : 0)) * 0.1 * P.amp;
    const a = a0 - 0.75 + (far ? P.flipF ?? 0 : P.flipN ?? 0) + sway;
    const dir = {x: Math.cos(a), y: Math.sin(a)};
    const side = {x: -dir.y, y: dir.x};
    const w = pecLen * 0.36;
    const tip = {x: base.x + dir.x * pecLen, y: base.y + dir.y * pecLen};
    return `M${f1(base.x - side.x * w * 0.5)} ${f1(base.y - side.y * w * 0.5)}C${f1(base.x + dir.x * pecLen * 0.4 - side.x * w)} ${f1(base.y + dir.y * pecLen * 0.4 - side.y * w)} ${f1(tip.x - side.x * w * 0.9)} ${f1(tip.y - side.y * w * 0.9)} ${f1(tip.x)} ${f1(tip.y)}C${f1(tip.x + side.x * w * 0.7)} ${f1(tip.y + side.y * w * 0.7)} ${f1(base.x + dir.x * pecLen * 0.5 + side.x * w * 0.6)} ${f1(base.y + dir.y * pecLen * 0.5 + side.y * w * 0.6)} ${f1(base.x + side.x * w * 0.5)} ${f1(base.y + side.y * w * 0.5)}Z`;
  };
  // ---- caudal horizontal: de canto se ve fina; con fv > 0 se abren los dos lóbulos
  const fe = S.pts[N];
  const fp = S.pts[N - 2];
  const fa = Math.atan2(fe.y - fp.y, fe.x - fp.x) + Math.sin(P.phase - 3.2) * 0.35 * P.amp;
  const fd = {x: Math.cos(fa), y: Math.sin(fa)};
  const fs = {x: -fd.y, y: fd.x};
  const span = (kind === 'male' ? 0.27 : 0.24) * L * 0.5;
  const fv = clamp(P.fv ?? 0.22, 0, 0.4);
  const chord = 0.085 * L;
  const lobe = (sgn: number) => {
    const tipP = {x: fe.x + fd.x * chord * 1.05 + fs.x * span * fv * sgn, y: fe.y + fd.y * chord * 1.05 + fs.y * span * fv * sgn + sgn * 4};
    const th = lerp(8, chord * 0.45, fv);
    return `M${f1(fe.x - fd.x * 10)} ${f1(fe.y - fd.y * 10)}Q${f1(fe.x + fd.x * chord * 0.2 + fs.x * th * sgn)} ${f1(fe.y + fd.y * chord * 0.2 + fs.y * th * sgn)} ${f1(tipP.x)} ${f1(tipP.y)}Q${f1(fe.x + fd.x * chord * 0.75)} ${f1(fe.y + fd.y * chord * 0.75)} ${f1(fe.x + fd.x * chord * 0.55)} ${f1(fe.y + fd.y * chord * 0.55)}Z`;
  };
  // ---- colores
  const black = mixColor('#0d1116', '#123248', under * 0.35);
  const white = kind === 'calf' ? mixColor('#f2c9a0', '#f2f4f2', calfAge) : '#f2f4f2';
  const whiteU = mixColor(white, '#9cc8e0', under * 0.35);
  const saddle = mixColor('#6a7078', '#4a6a82', under * 0.3);
  const id = `orca-${uid}`;
  const eye = U(EYE_UV[0], EYE_UV[1]);
  const er = 0.0062 * L * (kind === 'calf' ? 1.15 : 1);
  const blowP = U(0.13, 1.0);
  const blow = clamp(P.blow ?? 0);
  const teeth: React.ReactNode[] = [];
  if (jawA > 0.01) {
    for (let i = 0; i < 9; i++) {
      const u = 0.012 + i * 0.0095;
      const a = U(u, -0.32);
      const b = rotJ(U(u + 0.004, -0.42));
      teeth.push(<path key={`ut${i}`} d={`M${f1(a.x - 4)} ${f1(a.y)}L${f1(a.x)} ${f1(a.y + 11)}L${f1(a.x + 4)} ${f1(a.y)}Z`} fill="#f4eee0" stroke="#8a8270" strokeWidth={0.8} />);
      teeth.push(<path key={`lt${i}`} d={`M${f1(b.x - 4)} ${f1(b.y)}L${f1(b.x)} ${f1(b.y - 11)}L${f1(b.x + 4)} ${f1(b.y)}Z`} fill="#f4eee0" stroke="#8a8270" strokeWidth={0.8} />);
    }
  }
  const mouthIn = jawA > 0.01 ? smoothPath([U(0.006, -0.3), U(0.05, -0.33), U(0.1, -0.3), jawPivot, rotJ(U(0.06, -0.45)), rotJ(U(0.01, -0.45))], true) : null;
  // rasguños (marcas de dientes) y moteado sutil: siguen al cuerpo
  const scratches = detail > 0.6 ? Array.from({length: 7}, (_, i) => {
    const u = 0.3 + hash1(i * 3.1) * 0.3;
    const v = 0.2 + hash1(i * 5.3) * 0.6;
    return <path key={i} d={smoothPath([U(u, v), U(u + 0.03, v - 0.08), U(u + 0.05, v - 0.18)])} stroke="#3a4a58" strokeWidth={2} fill="none" opacity={0.35} />;
  }) : null;
  const tr = `translate(${f1(P.x)} ${f1(P.y)}) rotate(${f1((P.angle * 180) / Math.PI)}) scale(${f1(P.facing * P.scale * 1000) / 1000} ${f1(P.scale * 1000) / 1000})`;
  const rim = P.rim ?? '#d8f4ff';
  const rimK = P.rimK ?? 0.45;
  return (
    <g transform={tr}>
      <defs>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mixColor(black, '#5a7488', 0.28)} />
          <stop offset="0.4" stopColor={black} />
          <stop offset="1" stopColor={mixColor(black, '#000000', 0.4)} />
        </linearGradient>
        <linearGradient id={`${id}-w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={whiteU} />
          <stop offset="1" stopColor={mixColor(whiteU, '#5a7a90', 0.45)} />
        </linearGradient>
        <clipPath id={`${id}-c`}>
          <path d={outline} />
        </clipPath>
      </defs>
      {/* pectoral lejana (asoma bajo el vientre) */}
      <path d={pec(true)} fill={mixColor(black, '#000', 0.2)} stroke="#04070a" strokeWidth={2} />
      {/* caudal */}
      <path d={lobe(1)} fill={black} stroke="#04070a" strokeWidth={2} />
      <path d={lobe(-1)} fill={mixColor(black, '#3a4a58', fv * 0.3)} stroke="#04070a" strokeWidth={2} />
      {mouthIn ? <path d={mouthIn} fill="#c4566a" stroke="#3a1018" strokeWidth={1.5} /> : null}
      {teeth}
      {/* cuerpo */}
      <path d={outline} fill={`url(#${id}-b)`} stroke="#04070a" strokeWidth={2.5} />
      <g clipPath={`url(#${id}-c)`}>
        <path d={path(S, WHITE_BELLY, kind)} fill={`url(#${id}-w)`} />
        <path d={path(S, EYE_PATCH, kind)} fill={whiteU} />
        <path d={path(S, SADDLE, kind)} fill={saddle} opacity={kind === 'calf' ? 0.45 : 0.9} />
        {scratches}
        {/* volumen: brillo dorsal y sombra ventral que siguen la columna */}
        <path d={smoothPath(Array.from({length: 18}, (_, i) => U(0.04 + i * 0.05, 0.62)))} stroke={rim} strokeWidth={0.026 * L} fill="none" opacity={0.08} strokeLinecap="round" />
        <path d={smoothPath(Array.from({length: 18}, (_, i) => U(0.04 + i * 0.05, -0.9)))} stroke="#000" strokeWidth={0.03 * L} fill="none" opacity={0.18} strokeLinecap="round" />
        {/* línea de la boca */}
        <path d={smoothPath([U(0.004, -0.28), U(0.04, -0.3), U(0.075, -0.28), U(0.102, -0.22)])} stroke="#04070a" strokeWidth={2.4} fill="none" />
      </g>
      {/* ojo real (pequeño, delante y debajo del parche blanco) */}
      <g>
        <ellipse cx={f1(eye.x)} cy={f1(eye.y)} rx={f1(er * 1.5)} ry={f1(er * 1.1)} fill="#1c242c" />
        <circle cx={f1(eye.x + (P.eye?.x ?? 0.3) * er * 0.4)} cy={f1(eye.y + (P.eye?.y ?? 0) * er * 0.3)} r={f1(er * 0.75)} fill="#2a1e14" stroke="#000" strokeWidth={1} />
        <circle cx={f1(eye.x + (P.eye?.x ?? 0.3) * er * 0.4 - er * 0.25)} cy={f1(eye.y - er * 0.3)} r={f1(er * 0.25)} fill="#e8f4ff" opacity={0.85} />
      </g>
      {/* espiráculo */}
      <ellipse cx={f1(blowP.x)} cy={f1(blowP.y + 2)} rx={f1(5 + blow * 9)} ry={f1(1.5 + blow * 3.5)} fill="#04070a" />
      {/* aleta dorsal */}
      <path d={dorsal} fill={`url(#${id}-b)`} stroke="#04070a" strokeWidth={2.5} />
      <path d={`M${f1(db0.x)} ${f1(db0.y)}Q${f1((db0.x + dtip.x) / 2 + 10)} ${f1((db0.y + dtip.y) / 2)} ${f1(dtip.x)} ${f1(dtip.y)}`} stroke={rim} strokeWidth={3} fill="none" opacity={rimK * 0.8} />
      {/* luz de contorno en el lomo */}
      <path d={smoothPath(top.slice(1, Math.round(N * 0.85)))} stroke={rim} strokeWidth={3.5} fill="none" opacity={rimK} />
      {/* pectoral cercana */}
      <path d={pec(false)} fill={`url(#${id}-b)`} stroke="#04070a" strokeWidth={2.2} />
    </g>
  );
};

/** Punto (u, v) del cuerpo en coordenadas del mundo. */
export function orcaPoint(P: OrcaPose, u: number, v: number): V {
  const S = spine(P);
  const p = uv(S, u, v, P.kind);
  const x = p.x * P.facing * P.scale;
  const y = p.y * P.scale;
  const c = Math.cos(P.angle);
  const s = Math.sin(P.angle);
  return {x: P.x + x * c - y * s, y: P.y + x * s + y * c};
}
