// HUEVOS Y EMBRIÓN (Bufo bufo pone sus huevos en cordones gelatinosos dobles enrollados en las plantas).
//  · EggString — cordón gelatinoso translúcido a lo largo de una curva, con dos filas de huevos
//    oscuros; la gelatina refleja la luz y se mece con el agua.
//  · EmbryoEgg — un huevo en primer plano con el embrión que se desarrolla (e: 0 → 1):
//    esfera con polo animal oscuro → alargamiento (pliegues neurales) → yema caudal curvada con
//    esbozo de cabeza y ojo → renacuajo enroscado que se contrae dentro de la cápsula.
import React from 'react';
import {clamp, hash1, lerp} from '../../../engine/math';
import {closedSpline} from '../../../lifecycle/stages';
import {SoftFilter} from '../../oarfish-cinematic-v2/character/filters';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
type Pt = {x: number; y: number};

/** Cordón: `pts` = curva central (coordenadas de mundo), `t` para el balanceo. */
export const EggString: React.FC<{pts: Pt[]; t: number; uid: string; width?: number; seed?: number; skipNear?: Pt; skipR?: number}> = ({pts, t, uid, width = 34, seed = 0, skipNear, skipR = 0}) => {
  const P = pts.map((p, i) => ({x: p.x + Math.sin(t * 0.6 + i * 0.5 + seed) * 6, y: p.y + Math.cos(t * 0.5 + i * 0.4 + seed) * 4}));
  const d = P.map((p, i) => `${i ? 'L' : 'M'}${f1(p.x)},${f1(p.y)}`).join(' ');
  // huevos: dos filas alternas a lo largo del cordón
  const eggs: {x: number; y: number; r: number}[] = [];
  let acc = 0;
  for (let i = 1; i < P.length; i++) {
    const a = P[i - 1];
    const b = P[i];
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    const nx = -(b.y - a.y) / (seg || 1);
    const ny = (b.x - a.x) / (seg || 1);
    for (let s = 0; s < seg; s += 13) {
      const k = s / seg;
      const row = Math.floor((acc + s) / 13) % 2 ? 1 : -1;
      const x = a.x + (b.x - a.x) * k + nx * row * width * 0.2;
      const y = a.y + (b.y - a.y) * k + ny * row * width * 0.2;
      if (skipNear && Math.hypot(x - skipNear.x, y - skipNear.y) < skipR) continue;
      eggs.push({x, y, r: 4.6 + hash1(eggs.length * 3 + seed) * 0.8});
    }
    acc += seg;
  }
  return (
    <g>
      <defs>
        <SoftFilter id={`eg-${uid}`} radius={2} />
      </defs>
      <path d={d} stroke="#bfe8d0" strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.16} />
      <path d={d} stroke="#e8fff0" strokeWidth={width * 0.85} fill="none" strokeLinecap="round" opacity={0.08} />
      {eggs.map((e, i) => (
        <g key={i}>
          <circle cx={e.x} cy={e.y} r={e.r * 1.9} fill="#d8f4e0" opacity={0.12} />
          <circle cx={e.x} cy={e.y} r={e.r} fill="#120e0c" />
          <path d={`M${f1(e.x - e.r * 0.5)},${f1(e.y - e.r * 0.35)} q${f1(e.r * 0.4)},${f1(-e.r * 0.4)} ${f1(e.r * 0.85)},${f1(-e.r * 0.15)}`} stroke="#9a8a7a" strokeWidth={1.2} fill="none" opacity={0.6} />
        </g>
      ))}
      <path d={d} stroke="#ffffff" strokeWidth={2} fill="none" opacity={0.3} transform={`translate(${-width * 0.25} ${-width * 0.3})`} filter={`url(#eg-${uid})`} />
    </g>
  );
};

/** Huevo en primer plano. r = radio de la cápsula gelatinosa (unidades de mundo). */
export const EmbryoEgg: React.FC<{x: number; y: number; r: number; e: number; t: number; open?: number; uid: string; refined?: boolean}> = ({x, y, r, e, t, open = 0, uid, refined = false}) => {
  const twitch = e > 0.7 ? Math.sin(t * 9) * 0.06 * clamp((e - 0.7) / 0.3) + (Math.sin(t * 2.3) > 0.85 ? 0.12 : 0) : 0;
  const elong = clamp(e / 0.55); // 0 esfera … 1 alargado
  const curl = clamp((e - 0.45) / 0.45); // se curva y se forma la cola
  const L = lerp(r * 0.42, r * 0.95, elong); // longitud del embrión
  const H = lerp(r * 0.42, r * 0.34, elong);
  // eje del embrión: recta que se curva en arco (radio decreciente) a medida que crece la cola
  const span = 0.15 + curl * 2.5 + twitch * 2; // ángulo total del arco (rad)
  const R = L / span;
  // refined (documental completo): más puntos, cola más fina y contorno suavizado (sin aristas)
  const NA = refined ? 20 : 10;
  const axisN = Array.from({length: NA + 1}, (_, i) => {
    const a = (i / NA - 0.5) * span;
    return {x: Math.sin(a) * R, y: R - Math.cos(a) * R - (R - Math.cos(span / 2) * R) * 0.5};
  }).reverse();
  const axis = refined ? axisN.filter((_, i) => i % 2 === 0) : axisN;
  const widthU = (u: number) => {
    const headK = lerp(0.95, 1.15, curl) * Math.exp(-Math.pow((u - 0.18) / lerp(0.45, 0.25, curl), 2));
    if (refined) {
      // fase temprana: forma de judía (néurula/brote caudal); después, perfil de renacuajo
      const bean = H * 1.05 * Math.pow(Math.sin(Math.PI * (0.03 + 0.94 * u)), 0.55) * (1 + 0.3 * (0.5 - u));
      const headR = 1.2 * Math.exp(-Math.pow((u - 0.17) / 0.2, 2));
      const tailK = lerp(0.42, 0.16, curl) * Math.pow(1 - u, 1.2) + 0.03;
      const nose = Math.pow(Math.sin((Math.PI / 2) * clamp(u / 0.15)), 0.6); // hocico redondeado
      const tad = H * Math.max(headR, tailK) * nose * (u > 0.85 ? Math.max(0.15, (1 - u) / 0.15) : 1);
      return lerp(bean, tad, Math.pow(curl, 0.7));
    }
    const tailK = lerp(0.55, 0.12, curl) * (1 - u) + 0.05;
    return H * Math.max(headK, tailK) * (u > 0.9 ? (1 - u) * 10 * 0.6 + 0.4 : 1);
  };
  const width = (i: number) => widthU(i / 10);
  const top = axis.map((p, i) => ({x: p.x, y: p.y - width(i)}));
  const bot = axis.map((p, i) => ({x: p.x, y: p.y + width(i) * 0.9}));
  // contorno desplazado según la NORMAL del eje (no en vertical): en el arco cerrado la cabeza
  // conserva su volumen en lugar de aplastarse
  const nrm = axisN.map((_, i) => {
    const a0 = axisN[Math.max(0, i - 1)];
    const b0 = axisN[Math.min(NA, i + 1)];
    const dx = b0.x - a0.x;
    const dy = b0.y - a0.y;
    const l = Math.hypot(dx, dy) || 1;
    return {x: dy / l, y: -dx / l};
  });
  const side = nrm[Math.round(NA / 2)].y > 0 ? -1 : 1; // +1 = lado dorsal (arriba)
  const bodyPath = refined
    ? closedSpline([...axisN.map((p, i) => ({x: p.x + nrm[i].x * side * widthU(i / NA), y: p.y + nrm[i].y * side * widthU(i / NA)})), ...axisN.map((p, i) => ({x: p.x - nrm[i].x * side * widthU(i / NA) * 0.9, y: p.y - nrm[i].y * side * widthU(i / NA) * 0.9})).reverse()], 1)
    : `M${top.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')} L${bot.reverse().map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')}Z`;
  // contornos de referencia para los detalles (11 puntos, desplazados según la normal en refined)
  const topR = refined ? axis.map((p, i) => ({x: p.x + nrm[i * 2].x * side * width(i), y: p.y + nrm[i * 2].y * side * width(i)})) : top;
  const botR = refined ? axis.map((p, i) => ({x: p.x - nrm[i * 2].x * side * width(i) * 0.9, y: p.y - nrm[i * 2].y * side * width(i) * 0.9})) : bot;
  const inward = (q: {x: number; y: number}, i: number, k: number) => (refined ? {x: q.x - nrm[i * 2].x * side * width(i) * k, y: q.y - nrm[i * 2].y * side * width(i) * k} : {x: q.x, y: q.y + width(i) * k});
  const sphere = 1 - clamp(e / 0.25);
  const eyeK = clamp((e - 0.6) / 0.25);
  const head = axis[1];
  void hash1;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)})`}>
      <defs>
        <radialGradient id={`cap-${uid}`} cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#f2fff4" stopOpacity={0.4} />
          <stop offset="0.55" stopColor="#bfe6cc" stopOpacity={0.14} />
          <stop offset="0.9" stopColor="#8ac8a8" stopOpacity={0.22} />
          <stop offset="1" stopColor="#e8fff0" stopOpacity={0.5} />
        </radialGradient>
        <radialGradient id={`emb-${uid}`} cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#6a5a4a" />
          <stop offset="0.5" stopColor="#2a201a" />
          <stop offset="1" stopColor="#0c0806" />
        </radialGradient>
        <linearGradient id={`pole-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141010" />
          <stop offset="0.55" stopColor="#2a221c" />
          <stop offset="0.6" stopColor="#c8b088" />
          <stop offset="1" stopColor="#e0cca4" />
        </linearGradient>
        <SoftFilter id={`es-${uid}`} radius={r * 0.04} />
      </defs>
      {/* cápsula gelatinosa (se abre al eclosionar) */}
      <circle r={r} fill={`url(#cap-${uid})`} stroke="#e8fff0" strokeWidth={r * 0.02} strokeOpacity={0.45 * (1 - open)} strokeDasharray={open > 0 ? `${f1(r * 6.28 * (1 - open * 0.3))} ${f1(r * 6.28 * open * 0.3)}` : undefined} />
      <circle r={r * 0.62} fill="#d8f4e0" opacity={0.08} />
      {/* embrión: esfera bipolar → cuerpo alargado y curvado */}
      {sphere > 0.01 && <circle r={r * 0.42} fill={`url(#pole-${uid})`} opacity={sphere} transform={`rotate(${f1(-20 + t * 3)})`} />}
      {e > 0.18 && (
        <g opacity={clamp((e - 0.18) / 0.12)} transform={`rotate(${f1(twitch * 30)})`}>
          <path d={bodyPath} fill={`url(#emb-${uid})`} />
          {/* pliegues neurales / línea dorsal */}
          <path d={topR.slice(1, 9).map((p, i) => inward(p, i + 1, 0.35)).map((p, i) => `${i ? 'L' : 'M'}${f1(p.x)},${f1(p.y)}`).join(' ')} stroke="#8a7a68" strokeWidth={r * 0.015} fill="none" opacity={0.6 * clamp((e - 0.25) / 0.2)} />
          {/* yema (vientre claro) */}
          <path d={(refined ? botR.slice(1, 6).map((p, i) => inward(p, i + 1, -0.25)) : bot.slice(1, 6)).map((p, i) => `${i ? 'L' : 'M'}${f1(p.x)},${f1(p.y)}`).join(' ')} stroke="#c8b088" strokeWidth={r * 0.06} fill="none" opacity={0.5 * (1 - curl * 0.5)} strokeLinecap="round" />
          {eyeK > 0.01 && <ellipse cx={head.x + r * 0.04} cy={head.y - width(1) * 0.2} rx={r * 0.05} ry={r * 0.045} fill="#050302" opacity={eyeK} />}
          {/* esbozos de branquias externas */}
          {e > 0.75 && [0, 1].map((i) => <path key={i} d={`M${f1(refined ? inward(topR[2], 2, 0.4).x : axis[2].x)},${f1(refined ? inward(topR[2], 2, 0.4).y : axis[2].y - width(2) * 0.6)} q${f1(-r * 0.05)},${f1(-r * 0.08)} ${f1(-r * 0.1 - i * r * 0.03)},${f1(-r * 0.06)}`} stroke="#c87a5a" strokeWidth={r * 0.02} fill="none" opacity={clamp((e - 0.75) * 4)} />)}
        </g>
      )}
      {/* reflejos de la gelatina */}
      <path d={`M${f1(-r * 0.6)},${f1(-r * 0.45)} Q${f1(-r * 0.3)},${f1(-r * 0.85)} ${f1(r * 0.2)},${f1(-r * 0.78)}`} stroke="#ffffff" strokeWidth={r * 0.05} fill="none" opacity={0.55 * (1 - open)} strokeLinecap="round" filter={`url(#es-${uid})`} />
      <path d={`M${f1(r * 0.55)},${f1(r * 0.5)} q${f1(r * 0.15)},${f1(-r * 0.2)} ${f1(r * 0.12)},${f1(-r * 0.45)}`} stroke="#ffffff" strokeWidth={r * 0.025} fill="none" opacity={0.3} strokeLinecap="round" />
    </g>
  );
};
