// TRANSFORMACIÓN Y CICLO DE VIDA (representación biológica, sin magia):
//  medusa adulta → se encoge y reabsorbe los tentáculos → la campana se evierte → masa de tejido
//  (quiste) → se adhiere al sustrato → estolón (tallo rastrero con perisarco) → pólipos que se
//  alimentan → yemas de medusa en los pólipos → medusa joven liberada → adulta.
// La morfología se interpola geométricamente (mismos puntos), no con fundidos entre imágenes.
import React from 'react';
import {clamp, easeInOut, hash1, lerp, mixColor} from '../../../engine/math';
import {JellyMorph} from './ImmortalJellyfish';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
const seg = (u: number, a: number, b: number) => easeInOut(clamp((u - a) / (b - a)));

/** Fases de la reversión (u 0…1) → parámetros de forma de la medusa. */
export function reversalMorph(u: number): JellyMorph & {retract: number; sink: number} {
  return {
    retract: seg(u, 0.0, 0.3),
    evert: seg(u, 0.18, 0.5) * (1 - seg(u, 0.55, 0.8)),
    blob: seg(u, 0.45, 0.8),
    tissue: seg(u, 0.35, 0.75),
    cells: seg(u, 0.4, 0.7) * (1 - 0.4 * seg(u, 0.85, 1)),
    sink: seg(u, 0.05, 0.85),
  };
}

const PERI = '#d8b48a';
const POLYP = '#f3c3a8';
const POLYP_D = '#d88a6a';
const HYPO = '#e8463c';

/** Estolón: tubo rastrero con perisarco anillado que crece de x0 a x0+len (k 0…1). */
export const Stolon: React.FC<{x0: number; y: number; len: number; k: number; t: number}> = ({x0, y, len, k, t}) => {
  if (k <= 0.001) return null;
  const L = len * k;
  const pts = Array.from({length: 24}, (_, i) => {
    const u = i / 23;
    return {x: x0 + u * L, y: y - Math.sin(u * 9 + 1) * 4 - Math.sin(u * 3) * 6};
  });
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${f1(p.x)},${f1(p.y)}`).join(' ');
  return (
    <g>
      <path d={d} stroke="#6a4a2a" strokeWidth={15} fill="none" strokeLinecap="round" />
      <path d={d} stroke={PERI} strokeWidth={11} fill="none" strokeLinecap="round" />
      <path d={d} stroke={POLYP} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.9} />
      {pts.filter((_, i) => i % 2 === 0).map((p, i) => (
        <path key={i} d={`M${f1(p.x)},${f1(p.y - 6)} l0,12`} stroke="#8a6a4a" strokeWidth={1.5} opacity={0.6} />
      ))}
      <circle cx={pts[23].x} cy={pts[23].y} r={7 + Math.sin(t * 3) * 0.8} fill={POLYP} stroke="#8a5a3a" strokeWidth={2} />
    </g>
  );
};

/** Pólipo (hidroide): pedúnculo con perisarco, hidranto con hipostoma rojizo y corona de
 *  tentáculos filiformes. `grow` 0…1 · `feed` 0…1 (los tentáculos se cierran) · yemas de medusa. */
export const Polyp: React.FC<{x: number; y: number; h: number; grow: number; t: number; seed: number; feed?: number; buds?: number; budRelease?: number}> = ({x, y, h, grow, t, seed, feed = 0, buds = 0, budRelease = 0}) => {
  if (grow <= 0.001) return null;
  const H = h * grow;
  const sway = Math.sin(t * 0.8 + seed) * 0.08 * grow;
  const top = {x: x + Math.sin(sway) * H, y: y - Math.cos(sway) * H};
  const mid = {x: x + Math.sin(sway * 0.5) * H * 0.5, y: y - H * 0.5};
  const crown = clamp((grow - 0.55) / 0.45);
  return (
    <g>
      {/* pedúnculo con anillos de perisarco */}
      <path d={`M${f1(x)},${f1(y)} Q${f1(mid.x)},${f1(mid.y)} ${f1(top.x)},${f1(top.y)}`} stroke="#6a4a2a" strokeWidth={13} fill="none" strokeLinecap="round" />
      <path d={`M${f1(x)},${f1(y)} Q${f1(mid.x)},${f1(mid.y)} ${f1(top.x)},${f1(top.y)}`} stroke={PERI} strokeWidth={9} fill="none" strokeLinecap="round" />
      {Array.from({length: 6}, (_, i) => {
        const u = (i + 1) / 8;
        const px = lerp(lerp(x, mid.x, u), lerp(mid.x, top.x, u), u);
        const py = lerp(lerp(y, mid.y, u), lerp(mid.y, top.y, u), u);
        return <ellipse key={i} cx={px} cy={py} rx={7} ry={2.5} fill="none" stroke="#8a6a4a" strokeWidth={1.4} opacity={0.7} />;
      })}
      {/* hidranto */}
      <g transform={`translate(${f1(top.x)} ${f1(top.y)}) rotate(${f1((sway * 180) / Math.PI)}) scale(${f1(0.3 + 0.7 * crown)})`}>
        <ellipse cx={0} cy={-18} rx={15} ry={22} fill={POLYP} stroke={POLYP_D} strokeWidth={2} />
        <path d="M-8,-36 Q0,-50 8,-36Z" fill={HYPO} />
        {/* yemas de medusa (crecen en el cuerpo del pólipo y se liberan) */}
        {buds > 0.01 &&
          [-1, 1].map((sd, i) => {
            const k = clamp(buds - i * 0.25);
            const rel = clamp(budRelease - i * 0.3);
            return k > 0 ? (
              <g key={i} transform={`translate(${f1(sd * (16 + rel * 60))} ${f1(-10 - rel * 90)}) scale(${f1(0.3 + 0.5 * k)})`} opacity={1 - clamp((rel - 0.8) / 0.2)}>
                <path d="M-12,4 Q-12,-14 0,-16 Q12,-14 12,4Z" fill="#bff3ff" stroke="#e8fbff" strokeWidth={2} opacity={0.85} />
                <rect x={-3} y={-8} width={6} height={10} rx={3} fill={HYPO} opacity={0.8} />
              </g>
            ) : null;
          })}
        {/* corona de tentáculos filiformes */}
        {crown > 0.01 &&
          Array.from({length: 14}, (_, i) => {
            const a = -Math.PI + (Math.PI * (i + 0.5)) / 14;
            const close = feed * 0.9;
            const len = (26 + 8 * hash1(i + seed)) * crown;
            const wv = Math.sin(t * 2 + i + seed) * 0.12;
            const ang = lerp(a, -Math.PI / 2, close) + wv;
            const bx = Math.cos(a) * 12;
            const by = -26 + Math.sin(a) * 6;
            return <path key={i} d={`M${f1(bx)},${f1(by)} q${f1(Math.cos(ang) * len * 0.6)},${f1(Math.sin(ang) * len * 0.6 - 4)} ${f1(Math.cos(ang) * len)},${f1(Math.sin(ang) * len)}`} stroke={mixColor(POLYP, '#ffffff', 0.3)} strokeWidth={2.4} fill="none" strokeLinecap="round" />;
          })}
      </g>
    </g>
  );
};

/** Masa de tejido (quiste) apoyada en el sustrato: se aplana al adherirse (attach 0…1). */
export const Cyst: React.FC<{x: number; y: number; r: number; attach: number; t: number}> = ({x, y, r, attach, t}) => {
  const flat = 1 - 0.35 * attach;
  return (
    <g transform={`translate(${f1(x)} ${f1(y - r * flat)})`}>
      <ellipse cx={0} cy={r * flat} rx={r * (1 + 0.4 * attach)} ry={6} fill="#000000" opacity={0.25} />
      <ellipse cx={0} cy={0} rx={r * (1 + 0.25 * attach)} ry={r * flat} fill="#f2a070" stroke="#c8704a" strokeWidth={2.5} opacity={0.92} />
      {Array.from({length: 22}, (_, i) => {
        const a = hash1(i * 3.1) * Math.PI * 2;
        const rr = Math.sqrt(hash1(i * 5.9)) * r * 0.75;
        return <circle key={i} cx={Math.cos(a + t * 0.1) * rr} cy={Math.sin(a) * rr * flat} r={3 + hash1(i) * 3} fill="#ffd2b0" opacity={0.6} />;
      })}
      <ellipse cx={-r * 0.35} cy={-r * 0.45 * flat} rx={r * 0.3} ry={r * 0.15} fill="#ffffff" opacity={0.35} />
      {attach > 0.3 && <path d={`M${f1(-r * 1.2)},${f1(r * flat)} Q0,${f1(r * flat - 10 * attach)} ${f1(r * 1.2)},${f1(r * flat)}`} stroke={PERI} strokeWidth={6 * attach} fill="none" />}
    </g>
  );
};

/** Línea temporal circular del ciclo vital, con el punto que avanza (u 0…1) y la flecha de reversión. */
export const LifeCycleWheel: React.FC<{cx: number; cy: number; r: number; u: number; reverse: number; appear: number; labels: string[]}> = ({cx, cy, r, u, reverse, appear, labels}) => {
  const n = labels.length;
  const ang = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2;
  const pa = -Math.PI / 2 + u * Math.PI * 2;
  return (
    <g opacity={appear} transform={`translate(${cx} ${cy}) scale(${f1(0.85 + 0.15 * appear)})`}>
      <circle r={r} fill="rgba(6,16,40,0.55)" stroke="#8fe9ff" strokeWidth={3} opacity={0.9} strokeDasharray="10 8" />
      <path d={`M0,${-r} A${r},${r} 0 ${u > 0.5 ? 1 : 0} 1 ${f1(Math.cos(pa) * r)},${f1(Math.sin(pa) * r)}`} stroke="#d6f8ff" strokeWidth={6} fill="none" strokeLinecap="round" />
      {labels.map((lb, i) => (
        <g key={i} transform={`translate(${f1(Math.cos(ang(i)) * r)} ${f1(Math.sin(ang(i)) * r)})`}>
          <circle r={12} fill="#0a1a3a" stroke="#8fe9ff" strokeWidth={3} />
          <text x={Math.cos(ang(i)) * 34} y={Math.sin(ang(i)) * 34 + 9} textAnchor={Math.abs(Math.cos(ang(i))) < 0.3 ? 'middle' : Math.cos(ang(i)) > 0 ? 'start' : 'end'} fontFamily="Montserrat" fontWeight={800} fontSize={28} fill="#e8fbff">
            {lb}
          </text>
        </g>
      ))}
      <circle cx={Math.cos(pa) * r} cy={Math.sin(pa) * r} r={14} fill="#ffd27a" />
      {reverse > 0.01 && (
        <path d={`M${f1(Math.cos(ang(2)) * r * 0.72)},${f1(Math.sin(ang(2)) * r * 0.72)} Q0,0 ${f1(Math.cos(ang(1)) * r * 0.72)},${f1(Math.sin(ang(1)) * r * 0.72)}`} stroke="#ff9ad5" strokeWidth={6} fill="none" strokeDasharray={`${f1(400 * reverse)} 400`} markerEnd="url(#e8arrow)" />
      )}
      <defs>
        <marker id="e8arrow" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto">
          <path d="M0,0 L10,5 L0,10Z" fill="#ff9ad5" />
        </marker>
      </defs>
    </g>
  );
};
