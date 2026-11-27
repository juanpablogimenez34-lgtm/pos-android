// Fondo de la selva húmeda en capas de parallax: troncos lejanos, dosel, helechos y hojas
// grandes desenfocadas, niebla baja y rayos de luz filtrada. Primer plano desenfocado (macro).
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ParallaxLayer} from '../../../engine/camera';
import {clamp, hash1, mixColor, rng} from '../../../engine/math';
import {useTime} from '../../../engine/useTime';

const Trunks: React.FC<{seed: number; n: number; col: string; w: number; y0: number}> = React.memo(({seed, n, col, w, y0}) => {
  const r = rng(seed);
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const x = -6000 + r() * 12000;
        const ww = w * (0.6 + r() * 0.8);
        return (
          <g key={i}>
            <rect x={x - ww / 2} y={-9000} width={ww} height={9000 + y0} fill={col} />
            <rect x={x - ww / 2 + ww * 0.15} y={-9000} width={ww * 0.12} height={9000 + y0} fill="#ffffff" opacity={0.05} />
          </g>
        );
      })}
    </g>
  );
});

/** Hoja grande ilustrada (para las capas lejanas y el primer plano). */
const BigLeaf: React.FC<{x: number; y: number; s: number; a: number; col: string}> = ({x, y, s, a, col}) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
    <path d="M0,0 C80,-60 260,-70 380,0 C260,70 80,60 0,0Z" fill={col} />
    <path d="M0,0 L370,0" stroke="#000000" strokeOpacity={0.18} strokeWidth={5} />
    {[60, 120, 180, 240, 300].map((v) => (
      <path key={v} d={`M${v},0 L${v + 50},-${36 - v / 12} M${v},0 L${v + 50},${36 - v / 12}`} stroke="#000000" strokeOpacity={0.12} strokeWidth={3} />
    ))}
  </g>
);

const Fern: React.FC<{x: number; y: number; s: number; col: string; sway: number}> = ({x, y, s, col, sway}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-1.1, -0.6, -0.1, 0.4, 0.9].map((a, i) => {
      const L = 420 - Math.abs(a) * 120;
      const ang = a + sway * 0.05;
      const ex = Math.sin(ang) * L;
      const ey = -Math.cos(ang) * L;
      const pinnae = Array.from({length: 12}, (_, k) => {
        const u = (k + 1) / 13;
        const px = ex * u;
        const py = ey * u + Math.sin(u * Math.PI) * 30;
        const pl = 70 * (1 - u * 0.7);
        return <path key={k} d={`M${px},${py} l${-pl * 0.8},${-pl * 0.25} M${px},${py} l${pl * 0.8},${-pl * 0.25}`} stroke={col} strokeWidth={14} strokeLinecap="round" />;
      });
      return (
        <g key={i}>
          <path d={`M0,0 Q${ex * 0.4},${ey * 0.6} ${ex},${ey}`} stroke={col} strokeWidth={8} fill="none" />
          {pinnae}
        </g>
      );
    })}
  </g>
);

export const Jungle: React.FC<{zoom: number; dark: number}> = ({zoom, dark}) => {
  const {width, height} = useVideoConfig();
  const t = useTime();
  const blur = clamp((zoom - 0.6) * 2.4, 0, 12);
  const d = (c: string) => mixColor(c, '#050a06', dark);
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${d('#7fa88a')} 0%, ${d('#3f6a4a')} 40%, ${d('#1f3a26')} 100%)`}} />
      <AbsoluteFill style={blur > 0.3 ? {filter: `blur(${blur.toFixed(1)}px)`} : undefined}>
        <svg width={width} height={height}>
          <ParallaxLayer depth={0.05}>
            <Trunks seed={3} n={30} col={d('#6f8f78')} w={180} y0={200} />
          </ParallaxLayer>
          <ParallaxLayer depth={0.12}>
            <Trunks seed={7} n={18} col={d('#4a6650')} w={300} y0={260} />
            {Array.from({length: 22}, (_, i) => (
              <BigLeaf key={i} x={-4000 + hash1(i * 3) * 8000} y={-3600 + hash1(i * 5) * 3400} s={2.4 + hash1(i) * 2} a={hash1(i * 7) * 360} col={d(i % 2 ? '#3d6a3a' : '#4f7e44')} />
            ))}
          </ParallaxLayer>
          <ParallaxLayer depth={0.25}>
            <rect x={-8000} y={180} width={16000} height={4000} fill={d('#3a3020')} />
            {Array.from({length: 14}, (_, i) => (
              <Fern key={i} x={-3500 + hash1(i * 9) * 7000} y={220} s={1.2 + hash1(i * 4) * 1.2} col={d(i % 2 ? '#3f7a3a' : '#2f5e2c')} sway={Math.sin(t * 0.6 + i)} />
            ))}
          </ParallaxLayer>
          <ParallaxLayer depth={0.45}>
            {Array.from({length: 12}, (_, i) => (
              <BigLeaf key={i} x={-3000 + hash1(i * 13) * 6000} y={-1600 + hash1(i * 17) * 1700} s={1.5 + hash1(i * 2) * 1.2} a={-30 + hash1(i * 19) * 60 + Math.sin(t * 0.4 + i) * 3} col={d(i % 2 ? '#2f5a2a' : '#3e6c34')} />
            ))}
          </ParallaxLayer>
        </svg>
      </AbsoluteFill>
      {/* niebla baja y rayos de luz filtrada */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(220,235,220,0) 30%, rgba(220,235,220,0.18) 65%, rgba(220,235,220,0) 90%)', opacity: 1 - dark}} />
      <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
        <svg width={width} height={height}>
          <defs>
            <linearGradient id="jg-ray" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff6cf" stopOpacity={0.4} />
              <stop offset="1" stopColor="#fff6cf" stopOpacity={0} />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((i) => {
            const x = width * (0.2 + i * 0.22) + Math.sin(t * 0.18 + i * 2) * 50;
            const w = 50 + 60 * hash1(i * 5);
            return <path key={i} d={`M${x},-40 L${x + w},-40 L${x + w * 2 - 300},${height} L${x - 300},${height}Z`} fill="url(#jg-ray)" opacity={(0.45 + 0.25 * Math.sin(t * 0.5 + i)) * (1 - dark)} />;
          })}
        </svg>
      </AbsoluteFill>
    </>
  );
};

/** Hojas desenfocadas muy cerca de la cámara (macro), con máscara para no tapar el centro. */
export const ForegroundLeaves: React.FC<{zoom: number}> = ({zoom}) => {
  const {width, height} = useVideoConfig();
  const t = useTime();
  const k = clamp((zoom - 1.4) / 1.4);
  if (k <= 0.01) return null;
  return (
    <AbsoluteFill style={{filter: 'blur(10px)', opacity: 0.7 * k, pointerEvents: 'none', WebkitMaskImage: 'radial-gradient(ellipse 50% 44% at 50% 45%, transparent 55%, black 100%)', maskImage: 'radial-gradient(ellipse 50% 44% at 50% 45%, transparent 55%, black 100%)'}}>
      <svg width={width} height={height}>
        <ParallaxLayer depth={1.7}>
          {Array.from({length: 8}, (_, i) => (
            <BigLeaf key={i} x={-1800 + i * 520} y={-300 + hash1(i * 3) * 900} s={1.1 + hash1(i) * 0.6} a={hash1(i * 5) * 360 + Math.sin(t * 0.5 + i) * 4} col={i % 2 ? '#1f3d1c' : '#2c5226'} />
          ))}
        </ParallaxLayer>
      </svg>
    </AbsoluteFill>
  );
};

/** Partículas en suspensión y gotas que caen (pantalla). */
export const Atmosphere: React.FC<{n: number; drops: number}> = ({n, drops}) => {
  const {width, height} = useVideoConfig();
  const t = useTime();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={width} height={height}>
        {Array.from({length: n}, (_, i) => {
          const sp = 5 + hash1(i * 3) * 12;
          const x = ((((hash1(i) * width + Math.sin(t * 0.35 + i) * 40 + t * sp * 0.5) % (width + 40)) + width + 40) % (width + 40)) - 20;
          const y = ((((hash1(i * 7) * height - t * sp * 0.4) % (height + 40)) + height + 40) % (height + 40)) - 20;
          return <circle key={i} cx={x} cy={y} r={1 + hash1(i * 11) * 2.4} fill="#f3f6dd" opacity={0.2 + 0.35 * hash1(i * 13)} />;
        })}
        {Array.from({length: drops}, (_, i) => {
          const per = 2.2 + hash1(i * 5) * 2.5;
          const ph = ((t + hash1(i) * per) % per) / per;
          const x = width * (0.08 + hash1(i * 9) * 0.84);
          const y = -40 + ph * (height + 80);
          return <ellipse key={`d${i}`} cx={x} cy={y} rx={3.5} ry={9} fill="#e3f4ff" opacity={0.55} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
