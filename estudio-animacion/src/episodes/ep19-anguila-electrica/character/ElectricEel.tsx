// PERSONAJE — ANGUILA ELÉCTRICA (Electrophorus), ilustración original en vista lateral.
// Pez cuchillo (Gymnotiformes), no una anguila verdadera: cuerpo muy alargado y cilíndrico que se
// comprime hacia la cola, cabeza ancha y algo aplanada con boca terminal amplia, ojos pequeños,
// poros sensoriales en la cabeza, garganta y vientre amarillentos, dorso marrón oliva y gris oscuro.
// Sin aleta dorsal ni pélvicas; pequeñas aletas pectorales; una larga aleta anal recorre casi todo
// el vientre hasta la punta de la cola y se anima con ondas propias (independientes del cuerpo).
//
// Construcción: columna de control (18–32 puntos) → curva densa (Catmull-Rom) → silueta cerrada
// según la normal; el volumen se pinta con bandas recortadas dentro de la silueta (dorso, flanco,
// vientre, brillo húmedo) y manchas orgánicas. Opcionalmente muestra los órganos eléctricos.
import React from 'react';
import {clamp, hash1, mixColor} from '../../../engine/math';
import {closedSpline} from '../../../lifecycle/stages';
import {smoothPts, Spine} from '../../ep18-mixino/motion/path';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export type EelLook = {
  t: number;
  height?: number; // altura máxima del cuerpo (vista lateral)
  finPhase: number; // fase acumulada de la onda de la aleta anal
  finAmp?: number;
  mouth?: number;
  organs?: number; // 0…1 muestra los órganos eléctricos (corte anatómico)
  organPulse?: number; // fase de activación de los electrocitos (0…1 recorre el cuerpo)
  volt?: number; // brillo de descarga (visualización)
  tone?: number; // 0 normal … 1 en penumbra
  eye?: number; // mirada (desplazamiento de la pupila)
};

const COL = {back: '#2e3226', flankDark: '#4a4630', flank: '#6a6440', belly: '#c8a858', throat: '#d89a48', outline: '#14140c', hi: '#f0f0d0', fin: '#5a5434'};

const hAt = (u: number, H: number) => {
  // perfil lateral: hocico romo, cabeza ancha, cuerpo alto, cola comprimida que se afina
  const k = u < 0.05 ? 0.62 + (0.82 - 0.62) * (u / 0.05) : u < 0.14 ? 0.82 + 0.18 * ((u - 0.05) / 0.09) : u < 0.45 ? 1 - 0.08 * ((u - 0.14) / 0.31) : u < 0.8 ? 0.92 - 0.42 * ((u - 0.45) / 0.35) : 0.5 - 0.44 * ((u - 0.8) / 0.2);
  return H * k;
};

export const ElectricEel: React.FC<{spine: Spine; look: EelLook; uid: string}> = ({spine, look, uid}) => {
  const H = look.height ?? 78;
  const tone = look.tone ?? 0;
  const c = (x: string) => mixColor(x, '#06120e', tone * 0.6);
  // curva densa a partir de la columna de control
  const pts = smoothPts(spine.map((p) => ({x: p.x, y: p.y})), 4);
  const n = pts.length;
  const nrm = pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    // normal "dorsal": se elige la que apunta hacia arriba en la cabeza y se mantiene continua
    return {x: dy / l, y: -dx / l};
  });
  const flipAll = nrm[2].y > 0 ? -1 : 1;
  nrm.forEach((v) => {
    v.x *= flipAll;
    v.y *= flipAll;
  });
  const h = pts.map((_, i) => hAt(i / (n - 1), H));
  const top = pts.map((p, i) => ({x: p.x + nrm[i].x * h[i] * 0.5, y: p.y + nrm[i].y * h[i] * 0.5}));
  const bot = pts.map((p, i) => ({x: p.x - nrm[i].x * h[i] * 0.42, y: p.y - nrm[i].y * h[i] * 0.42}));
  const fwd = {x: pts[0].x - pts[1].x, y: pts[0].y - pts[1].y};
  const fl = Math.hypot(fwd.x, fwd.y) || 1;
  const fd = {x: fwd.x / fl, y: fwd.y / fl};
  const snout = {x: pts[0].x + fd.x * H * 0.32 - nrm[0].x * H * 0.04, y: pts[0].y + fd.y * H * 0.32 - nrm[0].y * H * 0.04};
  const tail = pts[n - 1];
  const tailDir = {x: tail.x - pts[n - 3].x, y: tail.y - pts[n - 3].y};
  const tlen = Math.hypot(tailDir.x, tailDir.y) || 1;
  const tailTip = {x: tail.x + (tailDir.x / tlen) * 10, y: tail.y + (tailDir.y / tlen) * 10};
  const body = closedSpline([snout, ...top, tailTip, ...[...bot].reverse()], 1);
  // aleta anal: base en el vientre desde u = 0,15 hasta la cola; ondas que recorren los radios
  const finAmp = look.finAmp ?? 0.7;
  const i0 = Math.round(0.15 * (n - 1));
  const finTop: {x: number; y: number}[] = [];
  const finEdge: {x: number; y: number}[] = [];
  const rays: string[] = [];
  for (let i = i0; i < n; i++) {
    const u = i / (n - 1);
    const fh = H * (0.5 + 0.12 * Math.sin(Math.PI * clamp((u - 0.15) / 0.85))) * (u > 0.9 ? (1 - u) / 0.1 : 1) * clamp((u - 0.15) / 0.05 + 0.2);
    const wave = Math.sin(u * Math.PI * 2 * 9 - look.finPhase);
    const tang = {x: -nrm[i].y, y: nrm[i].x}; // dirección hacia la cabeza/cola
    const b = bot[i];
    const e = {x: b.x - nrm[i].x * fh + tang.x * wave * fh * 0.35 * finAmp, y: b.y - nrm[i].y * fh + tang.y * wave * fh * 0.35 * finAmp};
    const lift = 1 - 0.18 * finAmp * (0.5 + 0.5 * Math.cos(u * Math.PI * 2 * 9 - look.finPhase));
    const ee = {x: b.x + (e.x - b.x) * lift, y: b.y + (e.y - b.y) * lift};
    finTop.push({x: b.x + nrm[i].x * 3, y: b.y + nrm[i].y * 3});
    finEdge.push(ee);
    if (i % 2 === 0) rays.push(`M${f1(b.x)},${f1(b.y)} L${f1(ee.x)},${f1(ee.y)}`);
  }
  const finPath = `M${finTop.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')} L${[...finEdge].reverse().map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')}Z`;
  const edgePath = `M${finEdge.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')}`;
  // bandas de volumen (recortadas a la silueta)
  const band = (off: number, from = 0, to = n) => pts.slice(from, to).map((p, k) => {
    const i = k + from;
    return `${k ? 'L' : 'M'}${f1(p.x + nrm[i].x * h[i] * off)},${f1(p.y + nrm[i].y * h[i] * off)}`;
  }).join(' ');
  const avgH = H;
  // cabeza (marco local)
  const ang = Math.atan2(fd.y, fd.x);
  const flip = Math.cos(ang) < 0 ? -1 : 1;
  const head = pts[Math.round(0.02 * (n - 1))];
  const mouth = clamp(look.mouth ?? 0);
  const organs = clamp(look.organs ?? 0);
  const volt = clamp(look.volt ?? 0);
  const iA = Math.round(0.2 * (n - 1));
  const iB = Math.round(0.97 * (n - 1));
  return (
    <g>
      <defs>
        <clipPath id={`ec-${uid}`}>
          <path d={body} />
        </clipPath>
      </defs>
      {/* aleta anal (detrás del cuerpo), translúcida con radios */}
      <path d={finPath} fill={c(COL.fin)} opacity={0.62} />
      <path d={rays.join(' ')} stroke={c('#2a2818')} strokeWidth={1.1} opacity={0.55} />
      <path d={edgePath} stroke={c('#c8b878')} strokeWidth={1.4} fill="none" opacity={0.45} />
      {/* cuerpo */}
      <path d={body} fill={c(COL.flank)} />
      <g clipPath={`url(#ec-${uid})`}>
        <path d={band(-0.32)} stroke={c(COL.belly)} strokeWidth={avgH * 0.42} fill="none" strokeLinecap="round" opacity={0.85} />
        <path d={band(-0.36, 0, Math.round(0.14 * n))} stroke={c(COL.throat)} strokeWidth={avgH * 0.4} fill="none" strokeLinecap="round" opacity={0.8} />
        <path d={band(0.18)} stroke={c(COL.flankDark)} strokeWidth={avgH * 0.36} fill="none" strokeLinecap="round" opacity={0.75} />
        <path d={band(0.4)} stroke={c(COL.back)} strokeWidth={avgH * 0.34} fill="none" strokeLinecap="round" opacity={0.9} />
        {/* manchas orgánicas y textura */}
        {Array.from({length: 46}, (_, k) => {
          const i = Math.round((0.06 + 0.9 * hash1(k * 3.7)) * (n - 1));
          const off = (hash1(k * 5.1) - 0.35) * 0.7;
          const p = pts[i];
          const r = h[i] * (0.06 + 0.08 * hash1(k * 2.3));
          return <ellipse key={k} cx={p.x + nrm[i].x * h[i] * off} cy={p.y + nrm[i].y * h[i] * off} rx={r * 1.5} ry={r} fill={c(k % 3 ? '#3a3622' : '#7a7048')} opacity={0.35} />;
        })}
        {/* línea lateral y brillo húmedo */}
        <path d={band(0.02, Math.round(0.08 * n), Math.round(0.95 * n))} stroke={c('#8a8458')} strokeWidth={1.4} fill="none" opacity={0.5} />
        <path d={band(0.32, 2, Math.round(0.7 * n))} stroke={COL.hi} strokeWidth={avgH * 0.05} fill="none" strokeLinecap="round" opacity={0.28 * (1 - tone)} />
        {/* órganos eléctricos (corte anatómico): órgano principal, órgano de Hunter y órgano de Sachs */}
        {organs > 0.01 && (
          <g opacity={organs}>
            <path d={band(-0.05, iA, Math.round(0.78 * n))} stroke="#2ad8c8" strokeWidth={avgH * 0.42} fill="none" opacity={0.42} strokeLinecap="round" />
            <path d={band(-0.33, iA, iB)} stroke="#f0d050" strokeWidth={avgH * 0.18} fill="none" opacity={0.5} strokeLinecap="round" />
            <path d={band(-0.02, Math.round(0.78 * n), iB)} stroke="#7ab8ff" strokeWidth={avgH * 0.3} fill="none" opacity={0.45} strokeLinecap="round" />
            {/* frente de activación de los electrocitos */}
            {look.organPulse !== undefined && (() => {
              const u = 0.2 + 0.77 * clamp(look.organPulse);
              const i = Math.round(u * (n - 1));
              const p = pts[i];
              return <ellipse cx={p.x} cy={p.y} rx={H * 0.9} ry={H * 0.6} fill="#e8fffa" opacity={0.5} />;
            })()}
            {Array.from({length: 40}, (_, k) => {
              const i = Math.round((0.2 + 0.58 * (k / 39)) * (n - 1));
              const p = pts[i];
              return <path key={k} d={`M${f1(p.x + nrm[i].x * h[i] * 0.16)},${f1(p.y + nrm[i].y * h[i] * 0.16)} L${f1(p.x - nrm[i].x * h[i] * 0.24)},${f1(p.y - nrm[i].y * h[i] * 0.24)}`} stroke="#bff7ee" strokeWidth={1} opacity={0.5} />;
            })}
          </g>
        )}
        {volt > 0.01 && <path d={band(0, 0, n)} stroke="#9ff8ff" strokeWidth={avgH * 0.9} fill="none" opacity={0.22 * volt} />}
      </g>
      <path d={body} fill="none" stroke={c(COL.outline)} strokeWidth={2.2} />
      {/* aleta pectoral (pequeña, detrás de la cabeza) */}
      {(() => {
        const i = Math.round(0.075 * (n - 1));
        const p = pts[i];
        const flap = Math.sin(look.t * 6) * 0.25;
        const a = Math.atan2(-nrm[i].y, -nrm[i].x) + 0.9 * flip + flap;
        const L = H * 0.42;
        return <path d={`M${f1(p.x)},${f1(p.y)} q${f1(Math.cos(a - 0.4) * L)},${f1(Math.sin(a - 0.4) * L)} ${f1(Math.cos(a) * L)},${f1(Math.sin(a) * L)} q${f1(-Math.cos(a + 0.6) * L * 0.4)},${f1(-Math.sin(a + 0.6) * L * 0.4)} ${f1(-Math.cos(a) * L)},${f1(-Math.sin(a) * L)}Z`} fill={c('#7a7048')} opacity={0.75} stroke={c(COL.outline)} strokeWidth={1} />;
      })()}
      {/* cabeza: boca terminal amplia, ojo pequeño, poros sensoriales */}
      <g transform={`translate(${f1(head.x)} ${f1(head.y)}) rotate(${f1((ang * 180) / Math.PI)}) scale(1 ${flip})`}>
        <path d={`M${f1(H * 0.36)},${f1(H * 0.06)} Q${f1(H * 0.05)},${f1(H * (0.12 + 0.1 * mouth))} ${f1(-H * 0.2)},${f1(H * 0.04)}`} stroke="#120e08" strokeWidth={2.4} fill="none" />
        {mouth > 0.05 && <path d={`M${f1(H * 0.36)},${f1(H * 0.06)} Q${f1(H * 0.12)},${f1(H * (0.1 + 0.32 * mouth))} ${f1(-H * 0.14)},${f1(H * 0.07)} Q${f1(H * 0.1)},${f1(H * 0.1)} ${f1(H * 0.36)},${f1(H * 0.06)}Z`} fill="#3a1a12" opacity={mouth} />}
        <circle cx={H * 0.06} cy={-H * 0.15} r={H * 0.065} fill="#1a1408" stroke="#c8b070" strokeWidth={1} />
        <circle cx={H * 0.06 + H * 0.015 * (look.eye ?? 0)} cy={-H * 0.15} r={H * 0.035} fill="#000" />
        <circle cx={H * 0.045} cy={-H * 0.17} r={H * 0.015} fill="#fff" opacity={0.8} />
        {Array.from({length: 9}, (_, k) => <circle key={k} cx={-H * 0.25 + (k % 5) * H * 0.1} cy={-H * 0.02 + Math.floor(k / 5) * H * 0.1 + (k % 2) * H * 0.03} r={H * 0.012} fill="#1e1a10" opacity={0.7} />)}
        <path d={`M${f1(-H * 0.3)},${f1(-H * 0.28)} q${f1(H * 0.3)},${f1(-H * 0.1)} ${f1(H * 0.58)},${f1(-H * 0.02)}`} stroke={COL.hi} strokeWidth={H * 0.04} strokeLinecap="round" fill="none" opacity={0.3 * (1 - tone)} />
      </g>
    </g>
  );
};
