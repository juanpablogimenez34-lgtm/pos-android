// PERSONAJE — MIXINO (Myxine / Eptatretus, ilustración original).
// Cuerpo largo, sin escamas ni aletas pares, piel húmeda marrón rosada; cabeza redondeada con boca
// sin mandíbulas (hendidura ventral), un orificio nasal terminal y tres pares de barbillas
// sensoriales; ojos vestigiales cubiertos de piel (solo una mancha pálida); una hilera de poros
// de glándulas mucosas a lo largo de cada costado; pliegue de aleta alrededor de la cola.
// El cuerpo se dibuja por segmentos y por capas (contorno, base, vientre, lomo, brillo, poros) para
// dar volumen sin filtros costosos. Donde el cuerpo se cruza consigo mismo (nudo), el tramo con
// mayor z se vuelve a dibujar encima.
import React from 'react';
import {clamp, mixColor} from '../../../engine/math';
import {Spine} from '../motion/path';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export type HagfishLook = {
  width?: number; // grosor máximo (unidades de mundo)
  t: number;
  pores?: number; // 0…1 poros activos (liberando mucosidad)
  barbels?: number; // agitación de las barbillas
  mouth?: number; // 0…1 boca abierta (placas dentales queratinosas)
  shadow?: number; // desplazamiento de la sombra sobre el sedimento (0 = sin sombra)
  tone?: number; // 0 normal … 1 más oscuro (lejos)
  slimeCoat?: number; // brillo de mucosidad sobre la piel
};

const C = {back: '#3e2220', mback: '#56302c', base: '#6e403a', lbase: '#86564c', belly: '#a27264', hi: '#ffd8cc', outline: '#1c0e0c', pore: '#24100e'};

const widthAt = (u: number, W: number) => {
  const head = u < 0.07 ? 0.62 + 0.38 * Math.sqrt(u / 0.07) : 1;
  const tail = u > 0.72 ? 1 - 0.45 * ((u - 0.72) / 0.28) : 1;
  return W * head * tail;
};

function segIntersect(a: {x: number; y: number}, b: {x: number; y: number}, c: {x: number; y: number}, d: {x: number; y: number}) {
  const den = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
  if (Math.abs(den) < 1e-6) return false;
  const u = ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / den;
  const v = ((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)) / den;
  return u >= 0 && u <= 1 && v >= 0 && v <= 1;
}

export const Hagfish: React.FC<{spine: Spine; look: HagfishLook; uid: string}> = ({spine, look, uid}) => {
  const W = look.width ?? 42;
  const n = spine.length;
  const tone = look.tone ?? 0;
  const col = (c: string, z = 0) => mixColor(mixColor(c, '#0a1418', tone * 0.55), '#000000', clamp(-z) * 0.25);
  // normales con orientación "hacia arriba" (lomo) para la luz
  const nrm = spine.map((_, i) => {
    const a = spine[Math.max(0, i - 1)];
    const b = spine[Math.min(n - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    let nx = dy / l;
    let ny = -dx / l;
    if (ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    return {x: nx, y: ny};
  });
  const w = spine.map((_, i) => widthAt(i / (n - 1), W));
  // cruces (nudo): el tramo de mayor z pasa por encima
  const over = new Set<number>();
  const hasZ = spine.some((p) => Math.abs(p.z) > 0.01);
  if (hasZ) {
    for (let i = 0; i < n - 1; i++)
      for (let j = i + 6; j < n - 1; j++) {
        if (segIntersect(spine[i], spine[i + 1], spine[j], spine[j + 1])) {
          const top = spine[i].z >= spine[j].z ? i : j;
          for (let k = Math.max(0, top - 4); k <= Math.min(n - 2, top + 4); k++) over.add(k);
        }
      }
  }
  const segPath = (i: number, off: number, side: 1 | -1) => {
    const a = spine[i];
    const b = spine[i + 1];
    const oa = off * w[i] * side;
    const ob = off * w[i + 1] * side;
    return `M${f1(a.x + nrm[i].x * oa)},${f1(a.y + nrm[i].y * oa)} L${f1(b.x + nrm[i + 1].x * ob)},${f1(b.y + nrm[i + 1].y * ob)}`;
  };
  const sw = (i: number, k: number) => f1(((w[i] + w[i + 1]) / 2) * k);
  const layers = (idx: number[], key: string) => (
    <g key={key}>
      {idx.map((i) => <path key={`o${i}`} d={segPath(i, 0, 1)} stroke={col(C.outline, spine[i].z)} strokeWidth={sw(i, 1) + 3} strokeLinecap="round" fill="none" />)}
      {idx.map((i) => <path key={`b${i}`} d={segPath(i, 0, 1)} stroke={col(C.base, spine[i].z)} strokeWidth={sw(i, 1)} strokeLinecap="round" fill="none" />)}
      {idx.map((i) => <path key={`l${i}`} d={segPath(i, 0.14, -1)} stroke={col(C.lbase, spine[i].z)} strokeWidth={sw(i, 0.6)} strokeLinecap="round" fill="none" opacity={0.7} />)}
      {idx.map((i) => <path key={`v${i}`} d={segPath(i, 0.3, -1)} stroke={col(C.belly, spine[i].z)} strokeWidth={sw(i, 0.3)} strokeLinecap="round" fill="none" opacity={0.6} />)}
      {idx.map((i) => <path key={`m${i}`} d={segPath(i, 0.16, 1)} stroke={col(C.mback, spine[i].z)} strokeWidth={sw(i, 0.62)} strokeLinecap="round" fill="none" opacity={0.6} />)}
      {idx.map((i) => <path key={`d${i}`} d={segPath(i, 0.32, 1)} stroke={col(C.back, spine[i].z)} strokeWidth={sw(i, 0.32)} strokeLinecap="round" fill="none" opacity={0.75} />)}
      {idx.map((i) => <path key={`h${i}`} d={segPath(i, 0.22, 1)} stroke={C.hi} strokeWidth={sw(i, 0.07)} strokeLinecap="round" fill="none" opacity={(0.38 + 0.3 * (look.slimeCoat ?? 0)) * (1 - tone * 0.6)} />)}
    </g>
  );
  const all = Array.from({length: n - 1}, (_, i) => i);
  const overIdx = [...over].sort((a, b) => a - b);
  // poros mucosos (fila lateral, algo por debajo de la línea media)
  const pores: React.ReactNode[] = [];
  const act = look.pores ?? 0;
  for (let i = 5; i < n - 3; i += 2) {
    const p = spine[i];
    const o = -0.12 * w[i];
    const x = p.x + nrm[i].x * o;
    const y = p.y + nrm[i].y * o;
    const r = Math.max(1.2, w[i] * 0.055);
    pores.push(
      <g key={i}>
        <ellipse cx={x} cy={y} rx={r * 1.25} ry={r} fill={col(C.pore, p.z)} />
        <ellipse cx={x - r * 0.3} cy={y - r * 0.35} rx={r * 0.5} ry={r * 0.35} fill={C.hi} opacity={0.35} />
        {act > 0.01 && <circle cx={x} cy={y} r={r * (1.6 + 1.4 * act * (0.6 + 0.4 * Math.sin(look.t * 9 + i)))} fill="#e8f6f2" opacity={0.55 * act} />}
      </g>,
    );
  }
  // pliegue de la aleta caudal (alrededor de la cola)
  const finIdx = all.filter((i) => i / (n - 1) > 0.8);
  const finTop = finIdx.map((i) => ({x: spine[i].x + nrm[i].x * w[i] * 0.95, y: spine[i].y + nrm[i].y * w[i] * 0.95}));
  const finBot = finIdx.map((i) => ({x: spine[i].x - nrm[i].x * w[i] * 0.95, y: spine[i].y - nrm[i].y * w[i] * 0.95}));
  const tip = spine[n - 1];
  const tipDir = {x: tip.x - spine[n - 3].x, y: tip.y - spine[n - 3].y};
  const tl = Math.hypot(tipDir.x, tipDir.y) || 1;
  const tipP = {x: tip.x + (tipDir.x / tl) * w[n - 1] * 0.9, y: tip.y + (tipDir.y / tl) * w[n - 1] * 0.9};
  const finPath = `M${finTop.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')} Q${f1(tipP.x)},${f1(tipP.y)} ${f1(finBot[finBot.length - 1].x)},${f1(finBot[finBot.length - 1].y)} L${finBot.reverse().map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')}Z`;
  // cabeza (marco local: x hacia delante)
  const h = spine[0];
  const hd = {x: spine[0].x - spine[2].x, y: spine[0].y - spine[2].y};
  const ang = Math.atan2(hd.y, hd.x);
  const flip = Math.cos(ang) < 0 ? -1 : 1;
  const hw = w[0];
  const bar = look.barbels ?? 0.5;
  const mouth = look.mouth ?? 0;
  const wig = (i: number) => Math.sin(look.t * (5 + i) + i * 1.7) * (2 + 4 * bar);
  return (
    <g>
      {(look.shadow ?? 0) > 0 && (
        <path d={spine.map((p, i) => `${i ? 'L' : 'M'}${f1(p.x + look.shadow! * 0.35)},${f1(p.y + look.shadow!)}`).join(' ')} stroke="#000" strokeWidth={W * 1.15} strokeLinecap="round" fill="none" opacity={0.28 * (1 - tone)} />
      )}
      <path d={finPath} fill={col('#8a5a50')} opacity={0.6} stroke={col(C.outline)} strokeWidth={1} strokeOpacity={0.5} />
      {layers(all, `L${uid}`)}
      <g>{pores}</g>
      {overIdx.length > 0 && layers(overIdx, `O${uid}`)}
      {overIdx.length > 0 && <g>{pores.filter((_, k) => over.has(5 + k * 2))}</g>}
      <g transform={`translate(${f1(h.x)} ${f1(h.y)}) rotate(${f1((ang * 180) / Math.PI)}) scale(1 ${flip})`}>
        {/* barbillas: tres pares alrededor de la boca y del orificio nasal */}
        {[0, 1, 2].map((i) => (
          <path key={`bb${i}`} d={`M${f1(hw * 0.42 - i * 3)},${f1(hw * (0.05 + i * 0.12))} q${f1(hw * 0.35)},${f1(hw * 0.12 + wig(i) * 0.4)} ${f1(hw * 0.55 + wig(i))},${f1(hw * (0.28 + i * 0.1) + wig(i) * 0.5)}`} stroke={col('#9a6a5c')} strokeWidth={Math.max(1.6, hw * 0.08)} strokeLinecap="round" fill="none" />
        ))}
        {[0, 1].map((i) => (
          <path key={`bt${i}`} d={`M${f1(hw * 0.5)},${f1(-hw * 0.12 + i * 4)} q${f1(hw * 0.3)},${f1(-hw * 0.12 + wig(i + 3) * 0.4)} ${f1(hw * 0.52 + wig(i + 3))},${f1(-hw * 0.05 + i * 6 + wig(i + 3) * 0.4)}`} stroke={col('#9a6a5c')} strokeWidth={Math.max(1.4, hw * 0.07)} strokeLinecap="round" fill="none" />
        ))}
        {/* orificio nasal terminal */}
        <ellipse cx={hw * 0.48} cy={-hw * 0.1} rx={hw * 0.06} ry={hw * 0.09} fill={C.pore} />
        {/* boca ventral sin mandíbulas (con placas dentales cuando se abre) */}
        <path d={`M${f1(hw * 0.05)},${f1(hw * 0.38)} q${f1(hw * 0.15)},${f1(hw * (0.06 + 0.2 * mouth))} ${f1(hw * 0.32)},${f1(hw * 0.02)}`} stroke={C.pore} strokeWidth={Math.max(1.2, hw * 0.06)} fill={mouth > 0.05 ? '#3a1414' : 'none'} />
        {mouth > 0.2 && [0, 1, 2, 3].map((i) => <path key={`tp${i}`} d={`M${f1(hw * (0.08 + i * 0.07))},${f1(hw * 0.4)} l${f1(hw * 0.02)},${f1(hw * 0.07 * mouth)}`} stroke="#f0d8a8" strokeWidth={1.2} opacity={mouth} />)}
        {/* ojo vestigial bajo la piel */}
        <ellipse cx={-hw * 0.05} cy={-hw * 0.18} rx={hw * 0.12} ry={hw * 0.08} fill="#d8b0a4" opacity={0.35} />
        {/* brillo húmedo de la cabeza */}
        <path d={`M${f1(-hw * 0.3)},${f1(-hw * 0.38)} q${f1(hw * 0.4)},${f1(-hw * 0.16)} ${f1(hw * 0.7)},${f1(-hw * 0.06)}`} stroke={C.hi} strokeWidth={Math.max(1, hw * 0.08)} strokeLinecap="round" fill="none" opacity={0.45 * (1 - tone * 0.6)} />
      </g>
    </g>
  );
};
