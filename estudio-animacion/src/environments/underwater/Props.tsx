// Objetos y efectos de agua para el episodio: concha, chorro del sifón,
// tinta mejorada, grieta de la morena y campo de rocas para el camuflaje.
import React, {useMemo} from 'react';
import {clamp, hash1, rng, smoothPath, Vec} from '../../engine/math';
import {UW} from './palette';
import {Rock} from './Rocks';

/** Vieira (bivalvo): costillas radiales, borde festoneado y "orejas" en la charnela. */
export const Scallop: React.FC<{x: number; y: number; rot?: number; scale?: number}> = ({x, y, rot = 0, scale = 1}) => {
  const ribs = 13;
  const R = 34;
  const edge: Vec[] = [];
  for (let i = 0; i <= ribs * 2; i++) {
    const a = Math.PI * (1.08 + (0.84 * i) / (ribs * 2));
    const r = R * (i % 2 ? 1 : 0.94);
    edge.push({x: Math.cos(a) * r, y: Math.sin(a) * r * 0.92 + R * 0.45});
  }
  return (
    <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${((rot * 180) / Math.PI).toFixed(2)}) scale(${scale})`}>
      <defs>
        <radialGradient id="scallop-g" cx="0.5" cy="0.9" r="0.9">
          <stop offset="0" stopColor="#fbe3c4" />
          <stop offset="0.6" stopColor="#e9a46a" />
          <stop offset="1" stopColor="#a0532f" />
        </radialGradient>
      </defs>
      <ellipse cx={4} cy={R * 0.55} rx={R * 0.95} ry={R * 0.22} fill="#02040d" opacity={0.25} />
      <path d={`M-14,${R * 0.45} L-24,${R * 0.25} L-22,${R * 0.55}Z M14,${R * 0.45} L24,${R * 0.25} L22,${R * 0.55}Z`} fill="#d48a55" />
      <path d={smoothPath([{x: 0, y: R * 0.5}, ...edge, {x: 0, y: R * 0.5}], true, 0.6)} fill="url(#scallop-g)" stroke="#7a3b22" strokeWidth={1.4} />
      {Array.from({length: ribs}, (_, i) => {
        const a = Math.PI * (1.1 + (0.8 * (i + 0.5)) / ribs);
        return <path key={i} d={`M0,${R * 0.5} L${Math.cos(a) * R * 0.9},${Math.sin(a) * R * 0.85 + R * 0.45}`} stroke="#8a4526" strokeOpacity={0.45} strokeWidth={1.6} />;
      })}
      {[0.35, 0.6, 0.82].map((k, i) => (
        <path key={i} d={smoothPath(edge.filter((_, j) => j % 2 === 0).map((p) => ({x: p.x * k, y: (p.y - R * 0.45) * k + R * 0.45})))} stroke="#fff1dc" strokeOpacity={0.3} strokeWidth={1.2} fill="none" />
      ))}
    </g>
  );
};

export type JetEmitter = (t: number) => {x: number; y: number; dx: number; dy: number; strength: number};

/**
 * Chorro del sifón y agua desplazada: estelas y burbujas emitidas en instantes
 * pasados (determinista: se reconstruye desde el emisor, sin estado acumulado).
 */
export const WaterJet: React.FC<{t: number; emitter: JetEmitter; life?: number; rate?: number}> = ({t, emitter, life = 1.3, rate = 30}) => {
  const items: React.ReactNode[] = [];
  const first = Math.ceil((t - life) * rate);
  const last = Math.floor(t * rate);
  for (let k = first; k <= last; k++) {
    const te = k / rate;
    const e = emitter(te);
    if (e.strength <= 0.02) continue;
    const age = t - te;
    const u = age / life;
    const h = hash1(k * 1.7);
    const sp = 420 * e.strength;
    const travel = sp * age * (1 - u * 0.55);
    const lat = (h - 0.5) * 60 * u;
    const x = e.x + e.dx * travel - e.dy * lat;
    const y = e.y + e.dy * travel + e.dx * lat;
    const o = (1 - u) * e.strength;
    if (k % 2 === 0) {
      const len = 38 * (1 - u) * e.strength + 6;
      items.push(
        <line key={`l${k}`} x1={x} y1={y} x2={x - e.dx * len} y2={y - e.dy * len} stroke="#d8fbff" strokeOpacity={0.35 * o} strokeWidth={3 * (1 - u) + 1} strokeLinecap="round" />,
      );
    }
    const r = 2 + h * 5 * (0.4 + u);
    items.push(<circle key={`b${k}`} cx={x + (h - 0.5) * 20} cy={y - age * 40} r={r} fill="none" stroke="#e8ffff" strokeOpacity={0.6 * o} strokeWidth={1.3} />);
    if (k % 9 === 0) {
      const rr = 20 + age * 120;
      items.push(<ellipse key={`r${k}`} cx={e.x + e.dx * travel * 0.4} cy={e.y + e.dy * travel * 0.4} rx={rr} ry={rr * 0.55} fill="none" stroke="#bff6ff" strokeOpacity={0.18 * o} strokeWidth={2} />);
    }
  }
  return <g>{items}</g>;
};

export type InkBurst = {t: number; x: number; y: number; dx: number; dy: number; amount?: number};

/** Tinta: bocanadas grumosas que se expanden y disipan + una mancha densa (pseudomorfo). */
export const InkCloud2: React.FC<{id: string; t: number; bursts: InkBurst[]; life?: number}> = ({id, t, bursts, life = 9}) => {
  const puffs = useMemo(() => {
    const out: {t0: number; x: number; y: number; vx: number; vy: number; r: number; seed: number; core: boolean}[] = [];
    bursts.forEach((b, bi) => {
      const r = rng(900 + bi);
      const count = Math.round(16 * (b.amount ?? 1));
      for (let i = 0; i < count; i++) {
        out.push({
          t0: b.t + i * 0.018,
          x: b.x,
          y: b.y,
          vx: b.dx * (90 + r() * 220) + (r() - 0.5) * 120,
          vy: b.dy * (90 + r() * 220) + (r() - 0.5) * 120,
          r: 18 + r() * 34,
          seed: r() * 10,
          core: i === 0,
        });
      }
    });
    return out;
  }, [bursts]);
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-ink`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#07060c" stopOpacity={0.9} />
          <stop offset="0.45" stopColor="#15101c" stopOpacity={0.62} />
          <stop offset="0.8" stopColor="#241b2e" stopOpacity={0.22} />
          <stop offset="1" stopColor="#241b2e" stopOpacity={0} />
        </radialGradient>
      </defs>
      {puffs.map((p, i) => {
        const age = t - p.t0;
        if (age < 0 || age > life) return null;
        const k = 1 - Math.exp(-age * 1.8);
        const drift = age * 10;
        const x = p.x + (p.vx * k) / 1.8 + Math.sin(age * 0.7 + p.seed) * 16 * age;
        const y = p.y + (p.vy * k) / 1.8 - drift;
        const grow = p.core ? 1 + age * 0.35 : 0.45 + age * 1.15;
        const rad = p.r * grow * (p.core ? 1.8 : 1);
        const o = clamp(age / 0.12) * clamp(1 - age / life) * (p.core ? 1 : 0.9);
        return (
          <g key={i} opacity={o}>
            <circle cx={x} cy={y} r={rad} fill={`url(#${id}-ink)`} />
            <circle cx={x + rad * 0.45 * Math.cos(p.seed)} cy={y + rad * 0.4 * Math.sin(p.seed)} r={rad * 0.7} fill={`url(#${id}-ink)`} />
          </g>
        );
      })}
    </g>
  );
};

/** Grieta de la morena: fondo oscuro (detrás) y labio de roca (delante). */
export const CREVICE = {x: 2236, y: 1236, rx: 64, ry: 46};

export const CreviceBack: React.FC = () => (
  <g>
    <Rock id="crev-r" x={2210} y={1300} w={300} h={210} seed={511} />
    <ellipse cx={CREVICE.x} cy={CREVICE.y} rx={CREVICE.rx} ry={CREVICE.ry} fill="#03040b" />
    <ellipse cx={CREVICE.x} cy={CREVICE.y - 6} rx={CREVICE.rx * 0.8} ry={CREVICE.ry * 0.6} fill="#000000" />
  </g>
);

export const CreviceLip: React.FC = () => (
  <g>
    <path
      d={`M${CREVICE.x - 90},${CREVICE.y + 70} C${CREVICE.x - 80},${CREVICE.y + 20} ${CREVICE.x - 40},${CREVICE.y + 30} ${CREVICE.x - 10},${CREVICE.y + 28} C${CREVICE.x + 30},${CREVICE.y + 26} ${CREVICE.x + 60},${CREVICE.y + 18} ${CREVICE.x + 88},${CREVICE.y + 46} L${CREVICE.x + 96},${CREVICE.y + 80} L${CREVICE.x - 96},${CREVICE.y + 80}Z`}
      fill={UW.rockMid}
    />
    <path d={`M${CREVICE.x - 84},${CREVICE.y + 36} C${CREVICE.x - 40},${CREVICE.y + 26} ${CREVICE.x + 30},${CREVICE.y + 22} ${CREVICE.x + 84},${CREVICE.y + 44}`} stroke={UW.rockLit} strokeOpacity={0.6} strokeWidth={4} fill="none" />
  </g>
);

/** Campo de rocas de tonos parecidos al camuflaje del pulpo. */
export const BoulderField: React.FC = () => (
  <g>
    <Rock id="bf1" x={2420} y={1300} w={320} h={240} seed={521} />
    <Rock id="bf2" x={2690} y={1310} w={380} h={280} seed={522} flip />
    <Rock id="bf3" x={2960} y={1316} w={300} h={200} seed={523} />
    <Rock id="bf4" x={3220} y={1322} w={420} h={300} seed={524} />
  </g>
);
