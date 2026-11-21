// Interior celular ESQUEMÁTICO (no a escala). Muestra dos mecanismos estudiados:
//  · Proteínas CAHS (en algunas especies): al secarse la célula forman una red tipo gel
//    que ayuda a conservar estructuras (Boothby et al. 2017; estudios posteriores).
//  · Dsup (descubierta en Ramazzottius varieornatus): se asocia al ADN y, en
//    experimentos con células humanas cultivadas, redujo daños en el ADN (Hashimoto et al. 2016).
// No se presenta como un mecanismo único.
import React, {useMemo} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {clamp, rng, smoothstep} from '../../engine/math';

export const CellScene: React.FC<{t: number; gel: number; dsup: number; dryness: number}> = ({t, gel, dsup, dryness}) => {
  const {width, height} = useVideoConfig();
  const organ = useMemo(() => {
    const r = rng(81);
    return Array.from({length: 7}, () => ({x: r() * width, y: 200 + r() * (height - 400), a: r() * 180, s: 0.7 + r() * 0.6, ph: r() * 10}));
  }, [width, height]);
  const nodes = useMemo(() => {
    const r = rng(82);
    return Array.from({length: 46}, () => ({x: r() * width, y: 180 + r() * (height - 360), ph: r() * 10, k: r()}));
  }, [width, height]);
  const ribo = useMemo(() => {
    const r = rng(83);
    return Array.from({length: 90}, () => ({x: r() * width, y: r() * height, ph: r() * 10}));
  }, [width, height]);
  // aristas de la red de gel: sólo entre nodos cercanos, aparecen progresivamente
  const edges = useMemo(() => {
    const out: [number, number, number][] = [];
    nodes.forEach((a, i) =>
      nodes.forEach((b, j) => {
        if (j <= i) return;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 230) out.push([i, j, (a.k + b.k) / 2]);
      }),
    );
    return out;
  }, [nodes]);
  const dnaY = height * 0.56;
  const helix = (phase: number) => {
    const pts: string[] = [];
    for (let x = -40; x <= width + 40; x += 12) pts.push(`${x},${(dnaY + Math.sin(x * 0.018 + t * 0.8 + phase) * 46).toFixed(1)}`);
    return pts.join(' ');
  };
  const wob = (ph: number) => Math.sin(t * 0.6 + ph) * 10 * (1 - dryness * 0.7);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 70% at 40% 40%, #2a6f7a 0%, #1a3a5a 55%, #120f2a 100%)`}}>
      <svg width={width} height={height}>
        {/* membrana celular */}
        <path d={`M-50,${height * 0.12} C${width * 0.3},${height * 0.02} ${width * 0.7},${height * 0.05} ${width + 50},${height * 0.15}`} stroke="#9fe8d8" strokeOpacity={0.6} strokeWidth={14} fill="none" />
        <path d={`M-50,${height * 0.135} C${width * 0.3},${height * 0.035} ${width * 0.7},${height * 0.065} ${width + 50},${height * 0.165}`} stroke="#9fe8d8" strokeOpacity={0.3} strokeWidth={6} fill="none" />
        {/* núcleo */}
        <circle cx={width * 0.82} cy={height * 0.32} r={260} fill="#3a2f6a" opacity={0.75} />
        <circle cx={width * 0.82} cy={height * 0.32} r={260} fill="none" stroke="#b9a8ff" strokeOpacity={0.5} strokeWidth={6} strokeDasharray="18 10" />
        {ribo.map((r, i) => (
          <circle key={i} cx={r.x + Math.sin(t * 0.5 + r.ph) * 6} cy={r.y + Math.cos(t * 0.4 + r.ph) * 6} r={3} fill="#cfe9ff" opacity={0.35} />
        ))}
        {/* mitocondrias */}
        {organ.map((o, i) => (
          <g key={i} transform={`translate(${o.x + wob(o.ph)} ${o.y + wob(o.ph + 2)}) rotate(${o.a + t * 3}) scale(${o.s})`} opacity={0.8}>
            <rect x={-70} y={-30} width={140} height={60} rx={30} fill="#c86a5a" />
            <path d="M-50,-14 q10,28 20,0 q10,-28 20,0 q10,28 20,0 q10,-28 20,0 q10,28 20,0" stroke="#f3b2a2" strokeWidth={4} fill="none" />
          </g>
        ))}
        {/* ADN (doble hélice esquemática) */}
        <polyline points={helix(0)} stroke="#7fd0ff" strokeWidth={6} fill="none" />
        <polyline points={helix(Math.PI)} stroke="#ffb07f" strokeWidth={6} fill="none" />
        {Array.from({length: 46}, (_, i) => {
          const x = -40 + i * 26;
          const y1 = dnaY + Math.sin(x * 0.018 + t * 0.8) * 46;
          const y2 = dnaY + Math.sin(x * 0.018 + t * 0.8 + Math.PI) * 46;
          return <line key={i} x1={x} y1={y1} x2={x} y2={y2} stroke="#e8f4ff" strokeOpacity={0.35} strokeWidth={3} />;
        })}
        {/* Dsup: se une al ADN progresivamente */}
        {Array.from({length: 14}, (_, i) => {
          const x = 60 + i * 72;
          const k = clamp(dsup * 14 - i);
          if (k <= 0) return null;
          const y = dnaY + Math.sin(x * 0.018 + t * 0.8 + Math.PI / 2) * 10;
          return (
            <g key={i} opacity={k}>
              <circle cx={x} cy={y - (1 - k) * 160} r={22} fill="#b46aff" />
              <circle cx={x - 6} cy={y - 6 - (1 - k) * 160} r={7} fill="#e6c8ff" opacity={0.7} />
            </g>
          );
        })}
        {/* red de proteínas CAHS que forman un gel */}
        <g opacity={clamp(gel * 1.2)}>
          {edges.map(([i, j, k], e) => {
            const p = clamp(gel * 1.6 - k * 0.6);
            if (p <= 0) return null;
            const a = nodes[i];
            const b = nodes[j];
            return <line key={e} x1={a.x} y1={a.y} x2={a.x + (b.x - a.x) * p} y2={a.y + (b.y - a.y) * p} stroke="#a8ffcf" strokeOpacity={0.45} strokeWidth={3} />;
          })}
          {nodes.map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r={6 + 3 * smoothstep(0, 1, gel)} fill="#c8ffe0" opacity={0.8} />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
