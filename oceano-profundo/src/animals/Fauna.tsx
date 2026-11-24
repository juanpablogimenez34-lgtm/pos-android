// FAUNA SECUNDARIA de las profundidades, cada una con su propio movimiento:
//  · Jellyfish: medusa de campana con pulsación (contracción rápida, relajación lenta), brazos orales y tentáculos.
//  · Atolla: medusa coronada roja de la zona de medianoche con anillo luminoso que gira («alarma antirrobo»).
//  · CombJelly: ctenóforo con hileras de peines que difractan la luz (destellos iridiscentes, no bioluminiscencia).
//  · Siphonophore: colonia larga en cadena con nectóforos que bombean.
//  · Hatchetfish: pez hacha plateado con fotóforos ventrales.
//  · Krill / RedShrimp: crustáceos rojos (invisibles a la luz roja inexistente en la profundidad).
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../utils/math';
import {closedSpline, f1, openSpline} from '../utils/spline';

type V = {x: number; y: number};
const T = (x: number, y: number, s: number, a = 0) => `translate(${f1(x)} ${f1(y)}) rotate(${f1((a * 180) / Math.PI)}) scale(${f1(s)})`;
/** Pulso de medusa: contracción rápida (30 %) y relajación lenta. */
const jpulse = (t: number, rate: number, ph = 0) => {
  const u = (t * rate + ph) % 1;
  return u < 0.3 ? Math.sin((u / 0.3) * (Math.PI / 2)) : Math.cos(((u - 0.3) / 0.7) * (Math.PI / 2));
};

export const Jellyfish: React.FC<{x: number; y: number; s?: number; t: number; hue?: string; glow?: number; a?: number; seed?: number}> = ({x, y, s = 1, t, hue = '#b8a8ff', glow = 0.6, a = 0, seed = 1}) => {
  const c = jpulse(t, 0.55, hash1(seed));
  const bw = 60 * (1 - 0.22 * c);
  const bh = 46 * (1 + 0.12 * c);
  const bell = `M${-bw},0 C${-bw},${-bh * 1.3} ${bw},${-bh * 1.3} ${bw},0 Q${bw * 0.7},${8 - c * 6} 0,${6 - c * 4} Q${-bw * 0.7},${8 - c * 6} ${-bw},0Z`;
  return (
    <g transform={T(x, y, s, a)}>
      <ellipse cx={0} cy={-bh * 0.4} rx={bw * 1.6} ry={bh * 1.4} fill={hue} opacity={0.08 * glow} style={{mixBlendMode: 'screen'}} />
      {Array.from({length: 10}, (_, i) => {
        const x0 = -bw * 0.9 + (i / 9) * bw * 1.8;
        const pts: V[] = Array.from({length: 7}, (_, k) => ({x: x0 + Math.sin(t * 1.2 + k * 0.7 + i) * (6 + k * 3), y: 6 + k * 26 + c * k * 3}));
        return <path key={i} d={openSpline(pts)} stroke={hue} strokeWidth={1.2} fill="none" opacity={0.55} />;
      })}
      {[-1, 0, 1].map((k) => <path key={`o${k}`} d={openSpline(Array.from({length: 5}, (_, j) => ({x: k * 12 + Math.sin(t + j + k) * 10, y: 4 + j * 22})))} stroke={mixColor(hue, '#fff', 0.4)} strokeWidth={6} fill="none" opacity={0.45} strokeLinecap="round" />)}
      <path d={bell} fill={hue} fillOpacity={0.28} stroke={mixColor(hue, '#fff', 0.5)} strokeWidth={1.8} />
      <path d={`M${-bw * 0.6},${-bh * 0.5} Q0,${-bh * 1.05} ${bw * 0.6},${-bh * 0.5}`} stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.35} />
      {Array.from({length: 4}, (_, i) => <ellipse key={i} cx={-24 + i * 16} cy={-bh * 0.35} rx={7} ry={10} fill={mixColor(hue, '#ff80c0', 0.5)} opacity={0.4} />)}
    </g>
  );
};

/** Atolla: corona roja oscura con surco; el anillo luminoso se activa en ondas giratorias. */
export const Atolla: React.FC<{x: number; y: number; s?: number; t: number; alarm?: number; a?: number}> = ({x, y, s = 1, t, alarm = 0.4, a = 0}) => {
  const c = jpulse(t, 0.45);
  const r = 70 * (1 - 0.15 * c);
  return (
    <g transform={T(x, y, s, a)}>
      {Array.from({length: 22}, (_, i) => {
        const ang = (i / 22) * Math.PI * 2;
        return <path key={`t${i}`} d={`M${f1(Math.cos(ang) * r)},${f1(Math.sin(ang) * r * 0.3 + 6)} q${f1(Math.cos(ang) * 30)},${f1(30 + Math.sin(t + i) * 10)} ${f1(Math.cos(ang) * 50 + Math.sin(t * 0.8 + i) * 12)},${f1(70)}`} stroke="#8a2a3a" strokeWidth={1.4} fill="none" opacity={0.6} />;
      })}
      {/* tentáculo hipertrofiado (largo, característico) */}
      <path d={openSpline(Array.from({length: 9}, (_, k) => ({x: Math.sin(t * 0.7 + k * 0.6) * (10 + k * 6), y: 10 + k * 40})))} stroke="#b03a4a" strokeWidth={2.4} fill="none" opacity={0.7} />
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.42} fill="#5a0e1e" stroke="#8a1a2e" strokeWidth={2} />
      <ellipse cx={0} cy={-r * 0.12} rx={r * 0.62} ry={r * 0.26} fill="#7a1628" />
      <ellipse cx={0} cy={-r * 0.12} rx={r * 0.32} ry={r * 0.13} fill="#a02a3a" opacity={0.8} />
      <g style={{mixBlendMode: 'screen'}}>
        {Array.from({length: 18}, (_, i) => {
          const ang = (i / 18) * Math.PI * 2;
          const wave = Math.max(0, Math.sin(ang * 1 - t * 6)) ** 4 * alarm;
          return <circle key={i} cx={Math.cos(ang) * r * 0.85} cy={Math.sin(ang) * r * 0.36} r={4 + wave * 10} fill="#5ad0ff" opacity={0.2 + wave * 0.8} />;
        })}
      </g>
    </g>
  );
};

/** Ctenóforo: cuerpo ovalado translúcido con 8 hileras de peines que reflejan colores en ondas. */
export const CombJelly: React.FC<{x: number; y: number; s?: number; t: number; a?: number}> = ({x, y, s = 1, t, a = 0}) => (
  <g transform={T(x, y, s, a)}>
    <ellipse cx={0} cy={0} rx={30} ry={52} fill="#dff4ff" fillOpacity={0.12} stroke="#dff4ff" strokeWidth={1.3} strokeOpacity={0.6} />
    {Array.from({length: 6}, (_, r) => {
      const xx = -24 + r * 9.6;
      return (
        <g key={r}>
          {Array.from({length: 12}, (_, k) => {
            const yy = -44 + k * 8;
            const ph = (t * 4 - k * 0.6 + r) % (Math.PI * 2);
            const hue = ['#ff5a8a', '#ffd05a', '#5affb0', '#5ac8ff', '#b05aff'][(k + r + Math.floor(t * 3)) % 5];
            const w = Math.sqrt(Math.max(0, 1 - (yy / 52) ** 2)) * 1.0;
            return <rect key={k} x={xx * w - 2} y={yy} width={4} height={3} fill={hue} opacity={0.4 + 0.6 * Math.max(0, Math.sin(ph))} />;
          })}
        </g>
      );
    })}
  </g>
);

/** Sifonóforo: cadena larga y ondulante de individuos (nectóforos arriba, cuerpo con tentáculos colgantes). */
export const Siphonophore: React.FC<{x: number; y: number; s?: number; t: number; len?: number; a?: number}> = ({x, y, s = 1, t, len = 900, a = 0}) => {
  const N = 30;
  const pts: V[] = Array.from({length: N}, (_, i) => ({x: -i * (len / N), y: Math.sin(t * 0.8 - i * 0.35) * 26}));
  return (
    <g transform={T(x, y, s, a)} style={{mixBlendMode: 'screen'}}>
      <path d={openSpline(pts)} stroke="#c8e8ff" strokeWidth={2} fill="none" opacity={0.6} />
      {pts.map((q, i) =>
        i < 4 ? (
          <ellipse key={i} cx={q.x} cy={q.y} rx={16 * (1 - 0.15 * jpulse(t, 1.2, i * 0.25))} ry={11} fill="#dff4ff" fillOpacity={0.2} stroke="#dff4ff" strokeWidth={1} />
        ) : (
          <g key={i}>
            <circle cx={q.x} cy={q.y} r={3} fill={i % 3 ? '#ffb070' : '#ff7a5a'} opacity={0.75} />
            <path d={`M${f1(q.x)},${f1(q.y)} q${f1(Math.sin(t + i) * 8)},30 ${f1(Math.sin(t * 1.3 + i) * 12)},${f1(60 + (i % 4) * 14)}`} stroke="#c8e8ff" strokeWidth={0.8} fill="none" opacity={0.4} />
          </g>
        ),
      )}
    </g>
  );
};

/** Pez hacha: cuerpo comprimido y alto, plateado, ojos tubulares hacia arriba y fotóforos ventrales. */
export const Hatchetfish: React.FC<{x: number; y: number; s?: number; t: number; dir?: 1 | -1; glow?: number}> = ({x, y, s = 1, t, dir = 1, glow = 0.7}) => {
  const w = Math.sin(t * 10) * 0.2;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s * dir)} ${f1(s)})`}>
      <path d={`M-30,-4 L${f1(-46)},${f1(-12 + w * 12)} L${f1(-46)},${f1(8 + w * 12)}Z`} fill="#9ab0c0" opacity={0.85} />
      <path d="M22,-6 Q10,-20 -10,-18 L-30,-8 Q-28,6 -14,18 Q4,30 16,14 Q26,4 22,-6Z" fill="#c8d8e4" stroke="#5a6a7a" strokeWidth={1.2} />
      <path d="M18,-4 Q0,-14 -26,-8" stroke="#ffffff" strokeWidth={2} fill="none" opacity={0.6} />
      <circle cx={12} cy={-8} r={4.5} fill="#0a0c12" stroke="#e8f0f4" strokeWidth={1} />
      {Array.from({length: 7}, (_, i) => <circle key={i} cx={8 - i * 5} cy={14 + Math.sin(i) * 2} r={1.8} fill="#6ae0ff" opacity={glow} />)}
    </g>
  );
};

/** Kril / camarón rojo de profundidad: cuerpo segmentado, patas que nadan en onda, antenas largas. */
export const RedShrimp: React.FC<{x: number; y: number; s?: number; t: number; dir?: 1 | -1; a?: number}> = ({x, y, s = 1, t, dir = 1, a = 0}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((a * 180) / Math.PI)}) scale(${f1(s * dir)} ${f1(s)})`}>
    {Array.from({length: 5}, (_, i) => <path key={i} d={`M${-4 - i * 7},6 q-2,${f1(10 + Math.sin(t * 12 - i) * 4)} -6,14`} stroke="#c83a2a" strokeWidth={1.6} fill="none" />)}
    <path d={closedSpline([{x: 18, y: -2}, {x: 6, y: -9}, {x: -20, y: -8}, {x: -38, y: -2}, {x: -46, y: 4}, {x: -36, y: 6}, {x: -12, y: 8}, {x: 12, y: 6}], 0.9)} fill="#d8442e" stroke="#7a1a10" strokeWidth={1} />
    <path d="M-46,4 l-10,-8 l2,14z" fill="#e8604a" />
    <path d={`M16,-4 q40,${f1(-20 + Math.sin(t * 2) * 6)} 80,${f1(-10 + Math.sin(t * 2.3) * 8)}`} stroke="#e86a50" strokeWidth={1} fill="none" />
    <circle cx={12} cy={-4} r={2.4} fill="#0a0a0a" />
  </g>
);

/** Banco de pequeñas presas que se dispersan cuando algo se acerca (`scare` 0…1 desde `from`). */
export function schoolPositions(n: number, t: number, center: V, radius: number, seed = 1, scare = 0, from: V = center): {p: V; a: number}[] {
  return Array.from({length: n}, (_, i) => {
    const ph = hash1(seed * 31 + i) * Math.PI * 2;
    const r = radius * (0.3 + hash1(seed * 17 + i) * 0.7);
    const base = {x: center.x + Math.cos(ph + t * 0.25) * r, y: center.y + Math.sin(ph * 1.3 + t * 0.2) * r * 0.5};
    const dx = base.x - from.x;
    const dy = base.y - from.y;
    const d = Math.hypot(dx, dy) || 1;
    const push = clamp(scare) * 260 * (1 - clamp(d / (radius * 3)));
    const p = {x: base.x + (dx / d) * push, y: base.y + (dy / d) * push};
    return {p, a: Math.atan2(Math.cos(ph * 1.3 + t * 0.2), -Math.sin(ph + t * 0.25)) * 0.2 + (scare > 0.1 ? Math.atan2(dy, dx) * clamp(scare) : 0)};
  });
}
export const lerpC = (a: string, b: string, u: number) => mixColor(a, b, clamp(u));
export const lerpN = lerp;
