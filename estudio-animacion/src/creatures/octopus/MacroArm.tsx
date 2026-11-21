// Primer plano macro: cara inferior de un brazo con dos filas escalonadas de
// ventosas (cada una con anillo, copa e infundíbulo) y la visualización de la
// quimiorrecepción: partículas químicas que llegan a las ventosas y las "encienden".
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {clamp, hash1, mixColor, smoothPath, Vec} from '../../engine/math';
import {useTime} from '../../engine/useTime';
import {OctopusSkin} from './rig';

type Props = {start: number; skin: OctopusSkin};

function spine(t: number, w: number, h: number, phase: number, amp: number): Vec[] {
  const pts: Vec[] = [];
  const N = 26;
  for (let k = 0; k <= N; k++) {
    const u = k / N;
    const curl = Math.max(0, u - 0.55) * (2.2 + 0.6 * Math.sin(t * 0.6 + phase));
    const a = -0.35 + Math.sin(t * 0.45 + phase - u * 2.2) * 0.22 * amp - curl * curl * 2.2;
    const r = u * w * 1.25;
    pts.push({x: -w * 0.15 + Math.cos(a) * r, y: h * 0.78 + Math.sin(a) * r * 0.9 - u * h * 0.25});
  }
  return pts;
}

export const MacroArm: React.FC<Props> = ({start, skin}) => {
  const tg = useTime();
  const t = tg - start;
  const {width, height} = useVideoConfig();
  const push = 1 + t * 0.025;
  const draw = (pts: Vec[], baseW: number, key: string, dim: number) => {
    const N = pts.length - 1;
    const nor = pts.map((p, k) => {
      const a = pts[Math.max(0, k - 1)];
      const b = pts[Math.min(N, k + 1)];
      const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      return {x: -(b.y - a.y) / d, y: (b.x - a.x) / d};
    });
    const wid = pts.map((_, k) => baseW * Math.pow(1 - k / N, 0.85) + 6);
    const L = pts.map((p, k) => ({x: p.x + nor[k].x * wid[k], y: p.y + nor[k].y * wid[k]}));
    const R = pts.map((p, k) => ({x: p.x - nor[k].x * wid[k], y: p.y - nor[k].y * wid[k]}));
    const body = smoothPath([...L, ...[...R].reverse()], true);
    const inner = smoothPath([...L.map((p, k) => ({x: (p.x * 3 + pts[k].x) / 4, y: (p.y * 3 + pts[k].y) / 4})), ...[...R].reverse().map((p, k2) => {
      const k = N - k2;
      return {x: (p.x * 3 + pts[k].x) / 4, y: (p.y * 3 + pts[k].y) / 4};
    })], true);
    const suckers: React.ReactNode[] = [];
    const count = 30;
    for (let q = 0; q < count; q++) {
      const f = (0.04 + (q / (count - 1)) * 0.86) * N;
      const i = Math.floor(f);
      const k = f - i;
      const p = {x: pts[i].x + (pts[i + 1].x - pts[i].x) * k, y: pts[i].y + (pts[i + 1].y - pts[i].y) * k};
      const n = nor[i];
      const w = wid[i] + (wid[i + 1] - wid[i]) * k;
      const side = q % 2 === 0 ? 1 : -1;
      const cx = p.x + n.x * w * 0.4 * side;
      const cy = p.y + n.y * w * 0.4 * side;
      const r = w * 0.36;
      // detección química: onda que recorre las ventosas + partícula que llega
      const glow = clamp(Math.sin(t * 2.2 - q * 0.45) * 1.4 - 0.4) * clamp((t - 2.2) / 1.2) * (1 - dim);
      const suck = Math.sin(t * 1.6 + q * 0.7) * 0.06;
      suckers.push(
        <g key={q} transform={`translate(${cx.toFixed(1)} ${cy.toFixed(1)}) scale(${(1 + suck).toFixed(3)})`}>
          {glow > 0.01 && <circle r={r * 1.45} fill="#ffd27a" opacity={0.35 * glow} />}
          <circle r={r} fill={`url(#${key}-ring)`} stroke={mixColor(skin.suckerRim, '#000000', 0.3)} strokeWidth={Math.max(1, r * 0.06)} />
          <circle r={r * 0.62} fill={`url(#${key}-cup)`} />
          {Array.from({length: 10}, (_, j) => {
            const a = (j / 10) * Math.PI * 2;
            return <line key={j} x1={Math.cos(a) * r * 0.64} y1={Math.sin(a) * r * 0.64} x2={Math.cos(a) * r * 0.92} y2={Math.sin(a) * r * 0.92} stroke={skin.suckerRim} strokeOpacity={0.35} strokeWidth={Math.max(0.8, r * 0.04)} />;
          })}
          <circle r={r * 0.2} fill="#2a0a10" opacity={0.85} />
          <ellipse cx={-r * 0.38} cy={-r * 0.42} rx={r * 0.26} ry={r * 0.13} fill="#ffffff" opacity={0.6} transform={`rotate(-30 ${-r * 0.38} ${-r * 0.42})`} />
          {glow > 0.01 && <circle r={r * 0.95} fill="none" stroke="#ffe7a3" strokeOpacity={0.8 * glow} strokeWidth={r * 0.08} />}
        </g>,
      );
    }
    return (
      <g opacity={1 - dim * 0.55}>
        <path d={smoothPath(pts.map((p) => ({x: p.x + 30, y: p.y + 60})))} stroke="#000814" strokeOpacity={0.25} strokeWidth={baseW * 1.6} strokeLinecap="round" fill="none" />
        <path d={body} fill={mixColor(skin.base, '#000000', dim * 0.4)} />
        <path d={inner} fill={mixColor(skin.underside, skin.base, 0.25 + dim * 0.3)} />
        <path d={smoothPath(R.slice(0, N - 2))} stroke={skin.rim} strokeOpacity={0.35} strokeWidth={4} fill="none" />
        {suckers}
      </g>
    );
  };
  const main = spine(t, width, height, 0, 1);
  const back = spine(t * 0.8 + 3, width * 0.9, height * 0.72, 2, 0.7).map((p) => ({x: width - p.x + 80, y: p.y - 260}));
  // partículas químicas (ámbar) que se acercan al brazo
  const chem = Array.from({length: 26}, (_, i) => {
    const h1 = hash1(i * 3.1);
    const h2 = hash1(i * 7.7);
    const cyc = ((t * (0.12 + h2 * 0.08) + h1) % 1 + 1) % 1;
    const x = width * (1.05 - cyc * 0.75) + Math.sin(t + i) * 20;
    const y = height * (0.25 + h2 * 0.45) + cyc * 160 + Math.sin(t * 0.8 + i * 2) * 25;
    return {x, y, o: clamp(cyc * 4) * clamp((1 - cyc) * 3) * clamp((t - 1.2) / 1), r: 3 + h1 * 5};
  });
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 70% at 50% 35%, #0f6a7e 0%, #073456 55%, #071535 100%)'}}>
      <svg width={width} height={height}>
        <defs>
          {['m', 'b'].map((k) => (
            <React.Fragment key={k}>
              <radialGradient id={`${k}-ring`} cx="0.42" cy="0.38" r="0.7">
                <stop offset="0" stopColor="#fff3ea" />
                <stop offset="0.5" stopColor={skin.sucker} />
                <stop offset="1" stopColor={skin.suckerRim} />
              </radialGradient>
              <radialGradient id={`${k}-cup`} cx="0.5" cy="0.6" r="0.6">
                <stop offset="0" stopColor="#3a0f16" />
                <stop offset="0.7" stopColor={mixColor(skin.suckerRim, '#3a0f16', 0.4)} />
                <stop offset="1" stopColor={skin.sucker} />
              </radialGradient>
            </React.Fragment>
          ))}
          <radialGradient id="macro-bokeh" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#bff6ff" stopOpacity={0.16} />
            <stop offset="1" stopColor="#bff6ff" stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* rayos de luz y bokeh lejanos */}
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${200 + i * 230 + Math.sin(t * 0.3 + i) * 30},-50 l90,0 l${260 + i * 40},${height + 100} l-260,0Z`} fill="#ffe9bf" opacity={0.035 + 0.02 * Math.sin(t * 0.5 + i)} />
        ))}
        {Array.from({length: 12}, (_, i) => (
          <circle key={i} cx={(hash1(i) * width + t * 12 * (i % 3)) % width} cy={hash1(i + 9) * height} r={40 + hash1(i + 4) * 80} fill="url(#macro-bokeh)" />
        ))}
        <g transform={`translate(${width / 2} ${height / 2}) scale(${push}) translate(${-width / 2} ${-height / 2})`}>
          {draw(back, 120, 'b', 0.8)}
          {chem.map((c, i) => (
            <g key={i} opacity={c.o}>
              <circle cx={c.x} cy={c.y} r={c.r * 2.4} fill="#ffcf6a" opacity={0.18} />
              <circle cx={c.x} cy={c.y} r={c.r} fill={i % 3 ? '#ffd27a' : '#9fffd0'} />
            </g>
          ))}
          {draw(main, 170, 'm', 0)}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
