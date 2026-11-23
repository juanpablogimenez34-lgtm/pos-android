// PERSONAJES SECUNDARIOS: cachalote, pez de aguas profundas, corona de brazos vista de frente (pico)
// y sistema de cámara científica con cebo y destello (recreación del tipo de equipo usado en 2004).
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';
import {closedSpline} from '../../../lifecycle/stages';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

/** Cachalote (Physeter macrocephalus) en vista lateral: cabeza en bloque, mandíbula estrecha, piel
 *  arrugada, aleta pectoral pequeña, joroba dorsal y aleta caudal que bate en vertical. Longitud ≈ 2400. */
export const SpermWhale: React.FC<{x: number; y: number; t: number; scale?: number; dir?: 1 | -1; tone?: number; angle?: number}> = ({x, y, t, scale = 1, dir = 1, tone = 0, angle = 0}) => {
  const C = (c: string) => mixColor(c, '#030508', tone * 0.85);
  const beat = Math.sin(t * 1.1);
  const und = (u: number) => beat * 40 * Math.pow(u, 2.2);
  const len = 2400;
  const H = (u: number) => (u < 0.35 ? 300 - u * 120 : u < 0.8 ? lerp(258, 120, (u - 0.35) / 0.45) : lerp(120, 40, (u - 0.8) / 0.2));
  const N = 16;
  const top = Array.from({length: N}, (_, i) => {
    const u = i / (N - 1);
    return {x: -u * len, y: -H(u) * (u < 0.35 ? 1 : 0.85) + und(u) - (u > 0.55 && u < 0.62 ? 26 : 0)};
  });
  const bot = Array.from({length: N}, (_, i) => {
    const u = i / (N - 1);
    return {x: -u * len, y: H(u) * (u < 0.35 ? 0.55 : 0.75) + und(u)};
  });
  const body = closedSpline([{x: 30, y: -250}, ...top.slice(1), {x: -len - 20, y: und(1)}, ...[...bot.slice(1)].reverse(), {x: 20, y: 120}], 1);
  const tailY = und(1);
  const fl = beat * 120;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((angle * 180) / Math.PI)}) scale(${f1(scale * dir)} ${f1(scale)})`}>
      <path d={`M${f1(-len + 10)},${f1(tailY - 20)} Q${f1(-len - 140)},${f1(tailY - 160 + fl)} ${f1(-len - 300)},${f1(tailY - 120 + fl)} Q${f1(-len - 200)},${f1(tailY + fl * 0.3)} ${f1(-len - 300)},${f1(tailY + 120 + fl)} Q${f1(-len - 140)},${f1(tailY + 160 + fl)} ${f1(-len + 10)},${f1(tailY + 20)}Z`} fill={C('#2e343c')} />
      <path d={body} fill={C('#3a4048')} stroke={C('#14181e')} strokeWidth={4} />
      {/* arrugas de la piel */}
      {Array.from({length: 40}, (_, i) => {
        const u = 0.38 + hash1(i * 3) * 0.55;
        const yy = (hash1(i * 7) - 0.5) * H(u) * 1.2 + und(u);
        return <path key={i} d={`M${f1(-u * len)},${f1(yy)} q30,${f1(-6 + hash1(i) * 12)} 70,0`} stroke={C('#22282e')} strokeWidth={3} fill="none" opacity={0.6} />;
      })}
      {/* (sin cicatrices de ventosas: dato no verificado en las fuentes consultadas) */}
      {false && Array.from({length: 9}, (_, i) => <circle key={`sc${i}`} cx={-80 - hash1(i * 5) * 600} cy={-160 + hash1(i * 9) * 200} r={8 + hash1(i) * 10} fill="none" stroke={C('#8a9098')} strokeWidth={3} opacity={0.45} />)}
      {/* mandíbula inferior estrecha */}
      <path d={`M10,110 Q-220,150 -560,130`} stroke={C('#22282e')} strokeWidth={10} fill="none" />
      <path d={`M-20,124 L-520,134`} stroke={C('#c8ccd0')} strokeWidth={4} opacity={0.4} strokeDasharray="10 18" />
      {/* ojo pequeño */}
      <circle cx={-640} cy={60} r={10} fill={C('#0a0c10')} />
      <circle cx={-643} cy={57} r={3} fill="#c8d0d8" opacity={0.6 * (1 - tone)} />
      {/* aleta pectoral */}
      <path d={`M-760,170 q-60,${f1(80 + beat * 10)} -170,${f1(110 + beat * 12)} q60,-60 110,-120Z`} fill={C('#2a3038')} />
      <path d={top.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y + 30)}`).join(' ')} stroke="#9ab8d0" strokeWidth={14} fill="none" opacity={0.22 * (1 - tone * 0.6)} />
      <path d={bot.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y - 24)}`).join(' ')} stroke="#6a7a8a" strokeWidth={10} fill="none" opacity={0.18 * (1 - tone * 0.6)} />
    </g>
  );
};

/** Pez de aguas profundas (presa): cuerpo plateado oscuro, ojo grande, fotóforos ventrales. */
export const DeepFish: React.FC<{x: number; y: number; t: number; s?: number; dir?: 1 | -1; angle?: number; flail?: number; opacity?: number}> = ({x, y, t, s = 1, dir = 1, angle = 0, flail = 0, opacity = 1}) => {
  const tb = Math.sin(t * (10 + flail * 20)) * (8 + flail * 14);
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((angle * 180) / Math.PI)}) scale(${f1(s * dir)} ${f1(s)})`} opacity={opacity}>
      <path d={`M-52,0 L-82,${f1(-22 + tb)} L-76,0 L-82,${f1(22 + tb)}Z`} fill="#4a5a68" />
      <path d="M60,0 Q40,-26 0,-24 Q-40,-20 -56,-4 L-56,4 Q-40,20 0,24 Q40,26 60,0Z" fill="#6a7a88" stroke="#1a2228" strokeWidth={1.5} />
      <path d="M50,-4 Q10,-14 -50,-4" stroke="#c8d8e0" strokeWidth={3} opacity={0.5} fill="none" />
      {Array.from({length: 7}, (_, i) => <circle key={i} cx={34 - i * 12} cy={16} r={2.2} fill="#7ad8ff" opacity={0.8} />)}
      <circle cx={38} cy={-6} r={9} fill="#e8eef0" />
      <circle cx={40} cy={-6} r={6} fill="#020406" />
      <path d={`M58,4 l-12,6`} stroke="#1a2228" strokeWidth={2} />
    </g>
  );
};

/** Corona de brazos vista de frente con el pico córneo en el centro (visualización anatómica). */
export const FrontCrown: React.FC<{x: number; y: number; t: number; s?: number; open?: number; beak?: number; prey?: number}> = ({x, y, t, s = 1, open = 0.6, beak = 0, prey = 0}) => {
  const arms = Array.from({length: 8}, (_, i) => {
    const a0 = (i / 8) * Math.PI * 2 + 0.2;
    const pts = Array.from({length: 12}, (_, k) => {
      const u = k / 11;
      const r = 70 + u * 420 * (0.6 + 0.4 * open);
      const a = a0 + Math.sin(t * 1.2 + i + u * 3) * 0.12 * u + (1 - open) * 0.5 * u * (i % 2 ? 1 : -1);
      return {x: Math.cos(a) * r, y: Math.sin(a) * r};
    });
    return pts;
  });
  const tube = (pts: {x: number; y: number}[], w0: number, w1: number) => {
    const L: {x: number; y: number}[] = [];
    const R: {x: number; y: number}[] = [];
    pts.forEach((p, i) => {
      const a = pts[Math.max(0, i - 1)];
      const b = pts[Math.min(pts.length - 1, i + 1)];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const l = Math.hypot(dx, dy) || 1;
      const w = (w0 + (w1 - w0) * (i / (pts.length - 1))) / 2;
      L.push({x: p.x - (dy / l) * w, y: p.y + (dx / l) * w});
      R.push({x: p.x + (dy / l) * w, y: p.y - (dx / l) * w});
    });
    return closedSpline([...L, ...R.reverse()], 1);
  };
  const bk = clamp(beak);
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s)})`}>
      {arms.map((pts, i) => (
        <g key={i}>
          <path d={tube(pts, 70, 8)} fill="#a8402e" stroke="#3a0e08" strokeWidth={2} />
          {pts.slice(1, 11).flatMap((p, k) => [-1, 1].map((sd) => {
            const a = Math.atan2(p.y, p.x) + Math.PI / 2;
            const w = (70 + (8 - 70) * ((k + 1) / 11)) * 0.22;
            return <circle key={`${k}${sd}`} cx={p.x + Math.cos(a) * w * sd} cy={p.y + Math.sin(a) * w * sd} r={Math.max(2, w * 0.45)} fill="#f0c0b0" stroke="#8a4a3a" strokeWidth={1} />;
          }))}
        </g>
      ))}
      {/* membrana bucal y pico córneo (dos mandíbulas oscuras en forma de pico de loro) */}
      <circle r={86} fill="#7a2a1e" stroke="#3a0e08" strokeWidth={3} />
      <circle r={64} fill="#c87a6a" />
      <path d={`M0,${f1(-46 - bk * 8)} C30,${f1(-40 - bk * 6)} 40,-6 6,${f1(10 - bk * 6)} L-6,${f1(10 - bk * 6)} C-40,-6 -30,${f1(-40 - bk * 6)} 0,${f1(-46 - bk * 8)}Z`} fill="#2a1a10" stroke="#0a0604" strokeWidth={2} />
      <path d={`M0,${f1(44 + bk * 8)} C26,${f1(38 + bk * 6)} 34,6 4,${f1(-8 + bk * 6)} L-4,${f1(-8 + bk * 6)} C-34,6 -26,${f1(38 + bk * 6)} 0,${f1(44 + bk * 8)}Z`} fill="#3a2414" stroke="#0a0604" strokeWidth={2} />
      <path d="M-14,-36 Q0,-42 14,-36" stroke="#a88a6a" strokeWidth={3} fill="none" opacity={0.6} />
      {prey > 0.01 && <ellipse cx={0} cy={0} rx={40 * prey} ry={22 * prey} fill="#7a8a98" opacity={0.85 * prey} />}
    </g>
  );
};

/** Sistema de cámara científica suspendido de un cabo, con cebo y destello periódico. */
export const CameraRig: React.FC<{x: number; y: number; t: number; strobe?: number; s?: number}> = ({x, y, t, strobe = 0, s = 1}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s)})`}>
    <path d="M0,-3000 L0,-60" stroke="#c8d0d8" strokeWidth={3} opacity={0.6} />
    <rect x={-38} y={-60} width={76} height={120} rx={14} fill="#c8a040" stroke="#3a2a0a" strokeWidth={3} />
    <circle cx={0} cy={-10} r={18} fill="#0a1018" stroke="#e8e8e8" strokeWidth={3} />
    <circle cx={-6} cy={-16} r={5} fill="#9ac8ff" opacity={0.7} />
    <rect x={-22} y={34} width={44} height={16} rx={4} fill="#e8f0ff" opacity={0.85} />
    {/* rama con cebo */}
    <path d="M0,60 L0,220 L120,260" stroke="#c8d0d8" strokeWidth={2} fill="none" opacity={0.6} />
    <path d="M120,260 q30,-8 60,4 q-30,12 -60,-4Z" fill="#d8c8b8" opacity={0.85} />
    {strobe > 0.01 && (
      <>
        <defs>
          <radialGradient id="rigFlash" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffffff" stopOpacity={0.9} />
            <stop offset="0.25" stopColor="#eaf6ff" stopOpacity={0.35} />
            <stop offset="1" stopColor="#eaf6ff" stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={0} cy={42} r={120 + strobe * 520} fill="url(#rigFlash)" opacity={strobe} />
      </>
    )}
  </g>
);
