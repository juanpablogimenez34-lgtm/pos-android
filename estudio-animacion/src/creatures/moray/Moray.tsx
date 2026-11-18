// Morena mediterránea (Muraena helena), depredadora habitual del pulpo común.
// Cuerpo anguiliforme: una onda lateral viaja de la cabeza a la cola mientras la
// cabeza se mantiene relativamente estable apuntando a su objetivo. Abre y cierra
// la boca de forma rítmica (así ventila sus branquias). Pose = función pura de t.

import React, {useMemo} from 'react';
import {clamp, mixColor, rng, smoothPath, TAU, Vec} from '../../engine/math';

export type MorayProps = {
  id: string;
  t: number;
  anchor: Vec; // salida de la grieta (la cola queda dentro)
  target: Vec; // hacia dónde apunta la cabeza
  extend: number; // 0 escondida … 1 totalmente fuera
  maxLen?: number;
  width?: number; // semiancho del cuerpo
  mouth?: number; // apertura extra 0–1 (embestida)
  wave?: number; // amplitud de la ondulación
  /** Indica si la cabeza está desorientada (busca en la tinta). */
  search?: number;
};

const SKIN = {base: '#4e3829', dark: '#22170f', belly: '#7a604a', spot: '#ecd88e', spot2: '#c9a85a', fin: '#33241a'};

export function morayPose(p: MorayProps) {
  const {t, anchor, target, extend, maxLen = 560, wave = 1, search = 0} = p;
  const L = Math.max(4, clamp(extend) * maxLen);
  const n = 28;
  const base = Math.atan2(target.y - anchor.y, target.x - anchor.x) + Math.sin(t * 1.7) * 0.25 * search;
  const dx = Math.cos(base);
  const dy = Math.sin(base);
  const nx = -dy;
  const ny = dx;
  const pts: Vec[] = [];
  for (let k = 0; k <= n; k++) {
    const s = (k / n) * L;
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, s / L) * 0.92), 0.9); // la cabeza (s=L) casi quieta
    const lateral = Math.sin(TAU * (s / 230) - t * 3.1) * 26 * wave * env + Math.sin(TAU * (s / 520) - t * 0.9) * 18 * env;
    const bow = (s * (L - s)) / Math.max(1, L) * 0.18;
    pts.push({x: anchor.x + dx * s + nx * (lateral + bow), y: anchor.y + dy * s + ny * (lateral + bow)});
  }
  const a = pts[n - 1];
  const b = pts[n];
  const headAng = Math.atan2(b.y - a.y, b.x - a.x);
  return {pts, head: b, headAng, L};
}

export const Moray: React.FC<MorayProps> = (props) => {
  const {id, t, width = 26, mouth = 0} = props;
  const pose = morayPose(props);
  const {pts, head, headAng, L} = pose;
  const spots = useMemo(() => {
    const r = rng(404);
    return Array.from({length: 90}, () => ({u: r(), v: r() * 1.6 - 0.8, s: 0.5 + r() * 0.8, k: r() < 0.5}));
  }, []);
  if (L < 8) return null;
  const n = pts.length - 1;
  const normals = pts.map((p, k) => {
    const q0 = pts[Math.max(0, k - 1)];
    const q1 = pts[Math.min(n, k + 1)];
    const ddx = q1.x - q0.x;
    const ddy = q1.y - q0.y;
    const d = Math.hypot(ddx, ddy) || 1;
    return {x: -ddy / d, y: ddx / d};
  });
  const w = (k: number) => width * (0.92 + 0.08 * Math.sin((k / n) * Math.PI));
  const top = pts.map((p, k) => ({x: p.x - normals[k].x * w(k), y: p.y - normals[k].y * w(k)}));
  const bot = pts.map((p, k) => ({x: p.x + normals[k].x * w(k), y: p.y + normals[k].y * w(k)}));
  const belly = pts.map((p, k) => ({x: p.x + normals[k].x * w(k) * 0.35, y: p.y + normals[k].y * w(k) * 0.35}));
  const fin = pts.map((p, k) => ({
    x: p.x - normals[k].x * (w(k) + 9 + 3 * Math.sin(k * 0.9 - t * 4)),
    y: p.y - normals[k].y * (w(k) + 9 + 3 * Math.sin(k * 0.9 - t * 4)),
  }));
  const bodyPath = smoothPath([...top, ...[...bot].reverse()], true);
  const finPath = smoothPath([...fin.slice(2), ...[...top.slice(2)].reverse()], true);
  const bellyPath = smoothPath([...bot, ...[...belly].reverse()], true);
  const open = clamp(0.18 + 0.12 * Math.sin(t * 2.4) + mouth * 0.75);
  const W = width;
  const jawDeg = open * 28;
  const deg = (headAng * 180) / Math.PI;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-b`} gradientUnits="userSpaceOnUse" x1={head.x - normals[n].x * W} y1={head.y - normals[n].y * W} x2={head.x + normals[n].x * W} y2={head.y + normals[n].y * W}>
          <stop offset="0" stopColor={SKIN.dark} />
          <stop offset="0.45" stopColor={SKIN.base} />
          <stop offset="1" stopColor={SKIN.belly} />
        </linearGradient>
      </defs>
      {/* sombra proyectada */}
      <path d={smoothPath(pts.map((p) => ({x: p.x + 8, y: p.y + 22})))} stroke="#02040d" strokeOpacity={0.18} strokeWidth={W * 2.2} fill="none" strokeLinecap="round" />
      <path d={finPath} fill={SKIN.fin} opacity={0.9} />
      <path d={bodyPath} fill={`url(#${id}-b)`} />
      <path d={bellyPath} fill={SKIN.belly} opacity={0.45} />
      {spots.map((sp, i) => {
        const f = sp.u * (n - 1);
        const k = Math.floor(f);
        const p = pts[k];
        const nn = normals[k];
        const x = p.x + nn.x * sp.v * W * 0.8;
        const y = p.y + nn.y * sp.v * W * 0.8;
        return <ellipse key={i} cx={x} cy={y} rx={3.2 * sp.s} ry={2.4 * sp.s} fill={sp.k ? SKIN.spot : SKIN.spot2} opacity={0.75} />;
      })}
      <path d={smoothPath(top.slice(1))} stroke="#f2e2b0" strokeOpacity={0.3} strokeWidth={2.5} fill="none" />
      <path d={smoothPath(bot.slice(1))} stroke="#7fe9e0" strokeOpacity={0.22} strokeWidth={2} fill="none" />
      {/* cabeza */}
      <g transform={`translate(${head.x.toFixed(2)} ${head.y.toFixed(2)}) rotate(${deg.toFixed(2)})`}>
        <path d={`M${-W * 0.6},${-W * 0.1} L${W * 2.5},${W * 0.12} L${W * 2.3},${W * 0.5} L${-W * 0.6},${W * 0.6}Z`} fill="#3a0e12" />
        <g transform={`rotate(${jawDeg.toFixed(2)} ${-W * 0.2} ${W * 0.2})`}>
          <path d={`M${-W * 0.9},${W * 0.15} C${W * 0.4},${W * 0.25} ${W * 1.6},${W * 0.32} ${W * 2.35},${W * 0.18} L${W * 2.25},${W * 0.5} C${W * 1.5},${W * 0.95} ${W * 0.3},${W * 1.05} ${-W * 0.9},${W * 1.0}Z`} fill={SKIN.base} />
          {Array.from({length: 6}, (_, i) => (
            <path key={i} d={`M${W * (0.5 + i * 0.3)},${W * 0.24} l${W * 0.07},${-W * 0.16} l${W * 0.07},${W * 0.16}Z`} fill="#f4efe0" />
          ))}
        </g>
        <path d={`M${-W * 0.9},${-W * 1.0} C${W * 0.3},${-W * 1.1} ${W * 1.6},${-W * 0.75} ${W * 2.7},${-W * 0.1} L${W * 2.6},${W * 0.18} C${W * 1.6},${W * 0.3} ${W * 0.4},${W * 0.25} ${-W * 0.9},${W * 0.2}Z`} fill={`url(#${id}-b)`} />
        {Array.from({length: 5}, (_, i) => (
          <path key={i} d={`M${W * (0.6 + i * 0.36)},${W * 0.18} l${W * 0.08},${W * 0.2} l${W * 0.08},${-W * 0.2}Z`} fill="#f4efe0" opacity={clamp(open * 3)} />
        ))}
        {[0.2, 0.9, 1.6].map((u, i) => (
          <ellipse key={i} cx={W * u} cy={-W * (0.55 - i * 0.08)} rx={W * 0.13} ry={W * 0.09} fill={SKIN.spot} opacity={0.7} />
        ))}
        {/* narinas tubulares, ojo y abertura branquial */}
        <path d={`M${W * 2.35},${-W * 0.25} l${W * 0.12},${-W * 0.28}`} stroke={SKIN.base} strokeWidth={W * 0.12} strokeLinecap="round" />
        <circle cx={W * 1.45} cy={-W * 0.52} r={W * 0.2} fill="#e9dca0" />
        <circle cx={W * 1.49} cy={-W * 0.52} r={W * 0.11} fill="#0a0806" />
        <circle cx={W * 1.4} cy={-W * 0.58} r={W * 0.05} fill="#ffffff" opacity={0.9} />
        <ellipse cx={-W * 0.5} cy={W * 0.15} rx={W * 0.12} ry={W * 0.2} fill={mixColor(SKIN.dark, '#000000', 0.4)} />
      </g>
    </g>
  );
};
