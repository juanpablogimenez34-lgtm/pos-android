// PERSONAJE — PEZ ERIZO DE ESPINAS LARGAS (Diodon holocanthus), ilustración original, vista lateral.
// Cuerpo ovalado con la cabeza integrada, ojos grandes, boca pequeña con "pico" de dientes fusionados,
// aletas pectorales, dorsal y anal retrasadas, aleta caudal redondeada; dorso marrón amarillento con
// grandes manchas oscuras y puntos, vientre crema; espinas largas plegadas hacia atrás en reposo.
//
// Capas (de atrás a delante): sombra sobre el fondo → aleta dorsal/anal/caudal → pectoral lejana →
// cuerpo (silueta deformada con degradado dorso-vientre y volumen) → textura y manchas (en la malla)
// → espinas (anclaje fijo en la malla; giran de plegadas a radiales y se alargan) con su sombra →
// brillo húmedo → ojo y boca → pectoral cercana. Todo depende de `inflation` (0…1) y es continuo.
import React from 'react';
import {clamp, hash1, lerp} from '../../../engine/math';
import {closedSpline} from '../../../lifecycle/stages';
import {deform, localScale, outline, outward, rDef, rNormal, V} from './inflation';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export type FishLook = {
  inflation: number;
  t: number;
  swim?: number; // 0…1 batido de aletas / oscilación
  finFreq?: number; // Hz
  mouth?: number; // 0…1 apertura (bombeo)
  eye?: number; // mirada −1…1
  blink?: number;
  anatomy?: number; // 0…1 corte anatómico (estómago y conducto)
  water?: number; // 0…1 flujo de agua visualizado hacia el estómago
  tone?: number;
};

// --- elementos fijos en coordenadas del cuerpo normal (geometría memorizada a nivel de módulo) ---
const EYE: V = {x: 66, y: -24};
const EYE_R = 17;
const PECT: V = {x: 40, y: 16};
const inside = (p: V, k = 0.92) => Math.hypot(p.x, p.y) < rNormal(Math.atan2(p.y, p.x)) * k;
const far = (p: V, q: V, d: number) => Math.hypot(p.x - q.x, p.y - q.y) > d;

/** Anclajes de espinas: superficie (malla) + anillo del contorno. */
const SPINES: {p: V; rim: boolean; len: number}[] = (() => {
  const out: {p: V; rim: boolean; len: number}[] = [];
  for (let i = 0; i < 140 && out.length < 62; i++) {
    const p = {x: -100 + hash1(i * 3.17) * 210, y: -70 + hash1(i * 7.31) * 140};
    if (!inside(p, 0.88) || !far(p, EYE, 30) || p.x > 104 || !far(p, PECT, 22)) continue;
    if (out.some((q) => !far(q.p, p, 20))) continue;
    out.push({p, rim: false, len: 30 + hash1(i * 5.1) * 12});
  }
  for (let i = 0; i < 30; i++) {
    const th = -Math.PI + ((i + 0.5) / 30) * Math.PI * 2;
    if (Math.cos(th) > 0.82 || Math.cos(th) < -0.93) continue; // ni en la boca ni en el pedúnculo
    const r = rNormal(th) * 0.97;
    out.push({p: {x: Math.cos(th) * r, y: Math.sin(th) * r}, rim: true, len: 40 + hash1(i * 2.7) * 10});
  }
  return out;
})();

/** Manchas: grandes manchas oscuras dorsales/laterales y puntos pequeños. */
const SPOTS: {p: V; r: number; dark: number}[] = [
  {p: {x: 40, y: -50}, r: 20, dark: 0.85},
  {p: {x: -10, y: -56}, r: 22, dark: 0.85},
  {p: {x: -62, y: -40}, r: 18, dark: 0.85},
  {p: {x: 20, y: 18}, r: 15, dark: 0.75},
  {p: {x: -48, y: 8}, r: 16, dark: 0.75},
  {p: {x: 82, y: -2}, r: 9, dark: 0.7},
  ...Array.from({length: 46}, (_, i) => ({p: {x: -100 + hash1(i * 4.3) * 200, y: -66 + hash1(i * 8.9) * 100}, r: 2.2 + hash1(i * 1.7) * 2.8, dark: 0.6})).filter((s) => inside(s.p, 0.86) && far(s.p, EYE, 24)),
];

const TEX = Array.from({length: 90}, (_, i) => ({x: -105 + hash1(i * 6.1) * 220, y: -70 + hash1(i * 2.9) * 145})).filter((p) => inside(p, 0.9));

export const PorcupineFish: React.FC<{look: FishLook; uid: string; x: number; y: number; scale?: number; dir?: 1 | -1; angle?: number}> = ({look, uid, x, y, scale = 1, dir = 1, angle = 0}) => {
  const inf = clamp(look.inflation);
  const t = look.t;
  const swim = look.swim ?? 1;
  const ff = look.finFreq ?? 2.2;
  const ph = t * ff * Math.PI * 2;
  const D = (p: V) => deform(p, inf);
  const body = closedSpline(outline(inf, 64), 1);
  const rear = {x: -rDef(Math.PI, inf), y: 0};
  // aletas (anclajes deformados)
  const thD = -2.68;
  const thA = 2.68;
  const dA = {x: Math.cos(thD) * rDef(thD, inf), y: Math.sin(thD) * rDef(thD, inf)};
  const aA = {x: Math.cos(thA) * rDef(thA, inf), y: Math.sin(thA) * rDef(thA, inf)};
  const finWave = (k: number) => Math.sin(ph + k) * 10 * swim * (1 - 0.5 * inf);
  const tailBeat = Math.sin(ph * 0.5) * 16 * swim * (1 - 0.6 * inf);
  const tail = (L: number) => `M${f1(rear.x + 6)},${f1(rear.y - 22)} C${f1(rear.x - L * 0.5)},${f1(rear.y - 40 + tailBeat * 0.4)} ${f1(rear.x - L)},${f1(rear.y - 30 + tailBeat)} ${f1(rear.x - L - 6)},${f1(rear.y + tailBeat)} C${f1(rear.x - L)},${f1(rear.y + 30 + tailBeat)} ${f1(rear.x - L * 0.5)},${f1(rear.y + 40 + tailBeat * 0.4)} ${f1(rear.x + 6)},${f1(rear.y + 22)}Z`;
  const finAt = (a: V, up: number, k: number) => {
    const n = outward(Math.atan2(a.y, a.x), inf);
    const back = {x: -1, y: 0};
    const L = 30;
    const tip = {x: a.x + (n.x * 0.75 + back.x * 0.65) * L + finWave(k) * 0.3, y: a.y + (n.y * 0.75 + back.y * 0.65) * L + finWave(k) * up};
    const b0 = {x: a.x + 10, y: a.y - n.y * 4};
    const b1 = {x: a.x - 12, y: a.y - n.y * 2};
    return `M${f1(b0.x)},${f1(b0.y)} Q${f1(tip.x + 20)},${f1(tip.y)} ${f1(tip.x)},${f1(tip.y)} Q${f1(tip.x - 8)},${f1((tip.y + b1.y) / 2)} ${f1(b1.x)},${f1(b1.y)}Z`;
  };
  const pect = D(PECT);
  const flap = Math.sin(ph * 1.3) * 0.6 * swim + 0.15;
  const pectPath = (sx: number) => {
    const L = 40;
    const a = 2.6 + flap;
    return `M${f1(pect.x)},${f1(pect.y - 10)} Q${f1(pect.x + Math.cos(a) * L * 0.6 * sx)},${f1(pect.y + Math.sin(a) * L - 20)} ${f1(pect.x + Math.cos(a) * L * sx)},${f1(pect.y + Math.sin(a) * L)} Q${f1(pect.x - 4)},${f1(pect.y + 18)} ${f1(pect.x)},${f1(pect.y + 10)}Z`;
  };
  const eye = D(EYE);
  const mouthTh = 0.08;
  const mouthP = {x: Math.cos(mouthTh) * rDef(mouthTh, inf) - 2, y: Math.sin(mouthTh) * rDef(mouthTh, inf)};
  const mo = clamp(look.mouth ?? 0);
  const anat = clamp(look.anatomy ?? 0);
  // estómago: saco ventral que crece mucho más que el resto
  const stomach = (() => {
    const c = D({x: -8, y: 18});
    const g = 0.35 + 0.65 * Math.pow(inf, 0.8);
    return {cx: c.x, cy: c.y, rx: 34 + 62 * g * inf + 6, ry: 22 + 56 * g * inf + 4};
  })();
  const tone = look.tone ?? 0;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((angle * 180) / Math.PI)}) scale(${f1(scale * dir)} ${f1(scale)})`}>
      <defs>
        <linearGradient id={`pfb-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a5a2a" />
          <stop offset="0.35" stopColor="#b8904a" />
          <stop offset="0.62" stopColor="#d8c08a" />
          <stop offset="1" stopColor="#f0e6cc" />
        </linearGradient>
        <radialGradient id={`pfv-${uid}`} cx="0.42" cy="0.32" r="0.72">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.28} />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="0.85" stopColor="#1a1408" stopOpacity={0.12} />
          <stop offset="1" stopColor="#1a1408" stopOpacity={0.45} />
        </radialGradient>
        <radialGradient id={`pfe-${uid}`} cx="0.45" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#4a8a6a" />
          <stop offset="0.6" stopColor="#1e4a3a" />
          <stop offset="1" stopColor="#0a1a14" />
        </radialGradient>
        <clipPath id={`pfc-${uid}`}>
          <path d={body} />
        </clipPath>
      </defs>
      {/* aletas impares (detrás del cuerpo) */}
      <path d={tail(54)} fill="#a88a4a" opacity={0.85} stroke="#4a3818" strokeWidth={1.5} />
      {[0, 1, 2, 3, 4].map((k) => <path key={`tr${k}`} d={`M${f1(rear.x)},${f1(rear.y + (k - 2) * 8)} L${f1(rear.x - 52)},${f1(rear.y + (k - 2) * 14 + tailBeat)}`} stroke="#5a4420" strokeWidth={1} opacity={0.5} />)}
      <path d={finAt(dA, -1, 0)} fill="#b89a5a" opacity={0.85} stroke="#4a3818" strokeWidth={1.4} />
      <path d={finAt(aA, 1, 1.4)} fill="#c8aa6a" opacity={0.85} stroke="#4a3818" strokeWidth={1.4} />
      <path d={pectPath(0.8)} fill="#c8a868" opacity={0.6} />
      {/* cuerpo */}
      <path d={body} fill={`url(#pfb-${uid})`} />
      <g clipPath={`url(#pfc-${uid})`}>
        {TEX.map((p, i) => {
          const q = D(p);
          return <circle key={`t${i}`} cx={q.x} cy={q.y} r={1.3} fill="#6a4a20" opacity={0.25} />;
        })}
        {SPOTS.map((s, i) => {
          const q = D(s.p);
          const k = localScale(s.p, inf);
          return <ellipse key={`s${i}`} cx={q.x} cy={q.y} rx={s.r * k * 1.15} ry={s.r * k * 0.9} fill="#2e1e0e" opacity={s.dark * (1 - tone * 0.3)} />;
        })}
        {/* corte anatómico: esófago y estómago expansible con agua */}
        {anat > 0.01 && (
          <g opacity={anat}>
            <rect x={-300} y={-300} width={600} height={600} fill="#f4e8d8" opacity={0.55} />
            <path d={`M${f1(mouthP.x - 6)},${f1(mouthP.y)} Q${f1(mouthP.x - 30)},${f1(mouthP.y + 10)} ${f1(stomach.cx + stomach.rx * 0.7)},${f1(stomach.cy - stomach.ry * 0.4)}`} stroke="#c87a6a" strokeWidth={10} fill="none" strokeLinecap="round" />
            <ellipse cx={stomach.cx} cy={stomach.cy} rx={stomach.rx} ry={stomach.ry} fill="#9ad8e8" stroke="#c87a6a" strokeWidth={6} opacity={0.9} />
            {Array.from({length: 7}, (_, i) => <path key={`f${i}`} d={`M${f1(stomach.cx - stomach.rx * 0.8 + i * stomach.rx * 0.26)},${f1(stomach.cy - stomach.ry * 0.7)} q8,${f1(stomach.ry * 0.7)} 0,${f1(stomach.ry * 1.4)}`} stroke="#b06a5a" strokeWidth={1.5} fill="none" opacity={0.5 * (1 - inf)} />)}
            <path d={`M${f1(stomach.cx - stomach.rx - 4)},${f1(stomach.cy + 4)} Q${f1(stomach.cx - stomach.rx - 30)},${f1(stomach.cy + 20)} ${f1(rear.x + 20)},${f1(8)}`} stroke="#c8907a" strokeWidth={6} fill="none" opacity={0.7} />
            {(look.water ?? 0) > 0.01 && Array.from({length: 6}, (_, i) => {
              const u = ((t * 1.4 + i / 6) % 1);
              const px = lerp(mouthP.x - 6, stomach.cx + stomach.rx * 0.5, u);
              const py = lerp(mouthP.y, stomach.cy - stomach.ry * 0.3, u) + Math.sin(u * Math.PI) * 10;
              return <circle key={`w${i}`} cx={px} cy={py} r={4} fill="#2a8aff" opacity={(look.water ?? 0) * Math.sin(u * Math.PI)} />;
            })}
          </g>
        )}
        <path d={body} fill={`url(#pfv-${uid})`} />
      </g>
      <path d={body} fill="none" stroke="#3a2a12" strokeWidth={2} />
      {/* espinas: anclaje fijo; giran de plegadas (hacia atrás) a radiales y se alargan */}
      {SPINES.map((sp, i) => {
        const a = D(sp.p);
        const th = Math.atan2(sp.p.y, sp.p.x);
        const s = Math.hypot(sp.p.x, sp.p.y) / rNormal(th);
        const erect = clamp((inf - 0.12 - 0.12 * (1 - s)) / 0.7);
        const e = erect * erect * (3 - 2 * erect);
        // dirección plegada: hacia atrás y ligeramente hacia el contorno
        const fold = {x: -0.94, y: 0.34 * Math.sign(sp.p.y || 1) * 0.6};
        const rad = sp.rim ? outward(th, inf) : {x: Math.cos(th), y: Math.sin(th)};
        const dx = lerp(fold.x, rad.x, e);
        const dy = lerp(fold.y, rad.y, e);
        const l = Math.hypot(dx, dy) || 1;
        // las espinas del centro del disco apuntan hacia la cámara (escorzo: se ven más cortas)
        const fore = sp.rim ? 1 : 0.28 + 0.72 * Math.pow(s, 1.6);
        const L = lerp(12, sp.len * fore, e);
        const tip = {x: a.x + (dx / l) * L, y: a.y + (dy / l) * L};
        const w = lerp(2.2, 4.2, e);
        return (
          <g key={`sp${i}`}>
            <path d={`M${f1(a.x + 2)},${f1(a.y + 3)} L${f1(tip.x + 2 + e * 3)},${f1(tip.y + 3 + e * 4)}`} stroke="#000" strokeWidth={w * 0.8} strokeLinecap="round" opacity={0.18 + 0.1 * e} />
            <path d={`M${f1(a.x)},${f1(a.y)} L${f1(tip.x)},${f1(tip.y)}`} stroke="#e8dcc0" strokeWidth={w} strokeLinecap="round" opacity={sp.rim ? 1 : 0.85} />
            <path d={`M${f1(a.x + (tip.x - a.x) * 0.55)},${f1(a.y + (tip.y - a.y) * 0.55)} L${f1(tip.x)},${f1(tip.y)}`} stroke="#5a4220" strokeWidth={w * 0.6} strokeLinecap="round" />
            <circle cx={a.x} cy={a.y} r={w * 0.9} fill="#c8a868" opacity={0.6 * e + 0.2} />
          </g>
        );
      })}
      {/* brillo húmedo (sigue la geometría) */}
      {(() => {
        const p0 = D({x: -40, y: -58});
        const p1 = D({x: 20, y: -66});
        const p2 = D({x: 70, y: -48});
        return <path d={`M${f1(p0.x)},${f1(p0.y)} Q${f1(p1.x)},${f1(p1.y - 6)} ${f1(p2.x)},${f1(p2.y)}`} stroke="#fff8e0" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.35 * (1 - tone)} />;
      })()}
      {/* ojo grande (proporciones constantes) */}
      <g transform={`translate(${f1(eye.x)} ${f1(eye.y)})`}>
        <circle r={EYE_R + 4} fill="#5a4220" />
        <circle r={EYE_R} fill={`url(#pfe-${uid})`} stroke="#1a1408" strokeWidth={1.5} />
        <circle cx={3 * (look.eye ?? 0)} r={EYE_R * 0.5} fill="#020604" />
        <circle cx={-5} cy={-6} r={4} fill="#ffffff" opacity={0.85} />
        {(look.blink ?? 0) > 0.02 && <path d={`M${-EYE_R - 3},0 A${EYE_R + 3},${EYE_R + 3} 0 0,1 ${EYE_R + 3},0 L${EYE_R + 3},${f1(-EYE_R - 3 + (look.blink ?? 0) * (EYE_R * 2 + 6))} L${-EYE_R - 3},${f1(-EYE_R - 3 + (look.blink ?? 0) * (EYE_R * 2 + 6))}Z`} fill="#8a6a34" />}
      </g>
      {/* boca pequeña con pico de dientes fusionados (bombea al abrirse) */}
      <g transform={`translate(${f1(mouthP.x)} ${f1(mouthP.y)})`}>
        <path d={`M-14,-6 Q-2,${f1(-10 - mo * 4)} 8,-4 L6,${f1(-1 + mo * 2)} Q-4,${f1(-4 - mo * 2)} -12,-2Z`} fill="#e8e0c8" stroke="#3a2a12" strokeWidth={1.2} />
        <path d={`M-14,6 Q-2,${f1(10 + mo * 6)} 8,4 L6,${f1(1 + mo * 4)} Q-4,${f1(4 + mo * 4)} -12,2Z`} fill="#e8e0c8" stroke="#3a2a12" strokeWidth={1.2} />
        {mo > 0.05 && <ellipse cx={-2} cy={1 + mo * 1.5} rx={7} ry={mo * 5} fill="#2a1008" />}
        <path d="M-18,-9 Q-6,-14 10,-6" stroke="#8a6a34" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M-18,9 Q-6,15 10,6" stroke="#c8a86a" strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
      {/* pectoral cercana */}
      <path d={pectPath(1)} fill="#d8b878" opacity={0.85} stroke="#4a3818" strokeWidth={1.2} />
      {[0, 1, 2].map((k) => {
        const a = 2.6 + flap;
        return <path key={`pr${k}`} d={`M${f1(pect.x)},${f1(pect.y)} L${f1(pect.x + Math.cos(a + (k - 1) * 0.25) * 34)},${f1(pect.y + Math.sin(a + (k - 1) * 0.25) * 34)}`} stroke="#7a5a2a" strokeWidth={1} opacity={0.6} />;
      })}
    </g>
  );
};
