// MOTOR DE DISPARO DE AGUA del pez arquero.
// El chorro se modela como una serie de "paquetes" de agua emitidos por la boca durante ~0,12 s. Cada
// paquete sigue una trayectoria balística (gravedad) calculada para llegar al objetivo en el mismo
// instante τ: los paquetes emitidos más tarde salen algo más rápidos y alcanzan a los primeros, así que
// el agua se CONCENTRA cerca del objetivo (comportamiento documentado del chorro del pez arquero).
// El cuerpo del chorro es una columna estrecha que une los paquetes; se fragmenta en gotas satélite
// con su propia caída. Al llegar: impacto (abanico de gotas con gravedad) o, si falla, el agua sigue
// su parábola y cae de vuelta. Determinista (hash1), dibujado en SVG con pocos elementos.
import React from 'react';
import {clamp, hash1} from '../../../engine/math';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
type V = {x: number; y: number};

export const G = 3200; // gravedad visual (unidades/s²; y hacia abajo)

export type Shot = {
  t0: number; // inicio de la emisión
  mouth: V; // boca (mundo)
  target: V; // punto de llegada
  tau?: number; // tiempo de vuelo del primer paquete (s)
  emit?: number; // duración de la emisión (s)
  hit?: boolean; // true = impacta en el objetivo; false = falla y el agua sigue
  seed?: number;
};

const vel = (m: V, tg: V, T: number) => ({x: (tg.x - m.x) / T, y: (tg.y - m.y) / T - 0.5 * G * T});
const at = (m: V, v: V, s: number) => ({x: m.x + v.x * s, y: m.y + v.y * s + 0.5 * G * s * s});

/** Tiempo de llegada al objetivo. */
export const arrival = (sh: Shot) => sh.t0 + (sh.tau ?? 0.34);

export const WaterJet: React.FC<{sh: Shot; t: number}> = ({sh, t}) => {
  const tau = sh.tau ?? 0.34;
  const E = sh.emit ?? 0.12;
  const age = t - sh.t0;
  if (age < 0 || age > tau + 1.6) return null;
  const seed = sh.seed ?? 1;
  const hit = sh.hit ?? true;
  const K = 12;
  const packs: {p: V; r: number; alive: boolean}[] = [];
  for (let k = 0; k < K; k++) {
    const e = (k / (K - 1)) * E;
    if (age < e) continue;
    const T = tau - e; // todos llegan a la vez
    const v = vel(sh.mouth, sh.target, T);
    const s = age - e;
    if (hit && s > T) continue; // ya impactó
    const p = at(sh.mouth, v, s);
    const r = 3 + 2.5 * (k / (K - 1)) + 2 * clamp(s / T);
    packs.push({p, r, alive: true});
  }
  const els: React.ReactNode[] = [];
  if (packs.length > 1) {
    const d = packs.map((q, i) => `${i ? 'L' : 'M'}${f1(q.p.x)},${f1(q.p.y)}`).join(' ');
    // columna continua: halo, cuerpo y filo brillante
    els.push(<path key="colg" d={d} stroke="#bff4ff" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.2} />);
    els.push(<path key="col" d={d} stroke="#e4faff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.85} />);
    els.push(<path key="colh" d={d} stroke="#ffffff" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.9} transform="translate(-1.5 -1.5)" />);
  }
  // masa concentrada en la punta (los paquetes delanteros se juntan) y algún engrosamiento
  packs.forEach((q, i) => {
    const front = i === 0 || i >= packs.length - 3;
    if (!front && i % 4) return;
    const r = front && i === 0 ? q.r * 1.25 : q.r * 0.8;
    els.push(<ellipse key={`p${i}`} cx={q.p.x} cy={q.p.y} rx={r * 1.1} ry={r} fill="#f2feff" opacity={0.92} />);
    els.push(<circle key={`ph${i}`} cx={q.p.x - r * 0.35} cy={q.p.y - r * 0.35} r={r * 0.35} fill="#ffffff" />);
  });
  // gotas satélite que se desprenden a lo largo del recorrido
  for (let j = 0; j < 16; j++) {
    const born = hash1(seed * 7 + j) * tau * 0.9;
    if (age < born) continue;
    const v0 = vel(sh.mouth, sh.target, tau);
    const p0 = at(sh.mouth, v0, born);
    const s = age - born;
    if (s > 0.9) continue;
    const sv = {x: v0.x * 0.85 + (hash1(j * 3 + seed) - 0.5) * 140, y: v0.y * 0.85 + (hash1(j * 5 + seed) - 0.5) * 140};
    const p = at(p0, sv, s);
    els.push(<circle key={`sat${j}`} cx={p.x} cy={p.y} r={1.6 + hash1(j) * 1.8} fill="#e8fbff" opacity={0.8 * (1 - s / 0.9)} />);
  }
  // impacto: abanico de gotas
  if (hit && age >= tau) {
    const a = age - tau;
    for (let j = 0; j < 28; j++) {
      const ang = -Math.PI / 2 + (hash1(j * 11 + seed) - 0.5) * 2.6;
      const sp = 280 + hash1(j * 13 + seed) * 520;
      const p = {x: sh.target.x + Math.cos(ang) * sp * a, y: sh.target.y + Math.sin(ang) * sp * a + 0.5 * G * a * a};
      if (a > 1.4) continue;
      els.push(<circle key={`im${j}`} cx={p.x} cy={p.y} r={2 + hash1(j * 3) * 3} fill="#f0feff" opacity={0.85 * clamp(1 - a / 1.4)} />);
    }
    if (a < 0.25) els.push(<circle key="flash" cx={sh.target.x} cy={sh.target.y} r={10 + a * 140} fill="none" stroke="#ffffff" strokeWidth={3} opacity={0.7 * (1 - a / 0.25)} />);
  }
  return <g>{els}</g>;
};
