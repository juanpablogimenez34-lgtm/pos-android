import React, {useMemo} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {clamp, mixColor, rng, smoothstep} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {useTime} from '../../../engine/useTime';
import {Tardigrade, tardiPose} from '../../../creatures/tardigrade/Tardigrade';

/** Escena 4: frío (laboratorio) → calor (ILUSTRATIVO) → límites. El animal sigue en tonel, inmóvil. */
export const ExtremeScene: React.FC = () => {
  const t = useTime();
  const {width, height} = useVideoConfig();
  const cold = smoothstep(70.4, 72, t) * (1 - smoothstep(84, 85.4, t));
  const heat = smoothstep(84, 85.4, t) * (1 - smoothstep(90, 91.2, t));
  const neutral = smoothstep(90, 91.2, t);
  const bgTop = mixColor(mixColor('#0d2a4a', '#5a1a0a', heat), '#101418', neutral);
  const bgBot = mixColor(mixColor('#020a1a', '#1a0602', heat), '#050607', neutral);
  const pose = tardiPose({t, x: 0, y: 0, scale: 2.6, facing: 1, slope: 0, dist: 0, activity: 0, tun: 1, look: 0});
  const frost = useMemo(() => {
    const r = rng(71);
    const out: {d: string; k: number}[] = [];
    const branch = (x: number, y: number, a: number, len: number, depth: number, k: number) => {
      const x2 = x + Math.cos(a) * len;
      const y2 = y + Math.sin(a) * len;
      out.push({d: `M${x.toFixed(0)},${y.toFixed(0)} L${x2.toFixed(0)},${y2.toFixed(0)}`, k});
      if (depth <= 0) return;
      branch(x2, y2, a - 0.6, len * 0.6, depth - 1, k + 0.1);
      branch(x2, y2, a + 0.6, len * 0.6, depth - 1, k + 0.1);
      branch(x2, y2, a + (r() - 0.5) * 0.2, len * 0.75, depth - 1, k + 0.12);
    };
    for (let i = 0; i < 10; i++) {
      const side = i % 4;
      const x = side === 0 ? 0 : side === 1 ? width : r() * width;
      const y = side === 2 ? 0 : side === 3 ? height : 300 + r() * (height - 600);
      const a = Math.atan2(height / 2 - y, width / 2 - x) + (r() - 0.5) * 0.6;
      branch(x, y, a, 120 + r() * 60, 3, r() * 0.3);
    }
    return out;
  }, [width, height]);
  const grow = smoothstep(73, 82, t) * (1 - heat) * (1 - neutral);
  const thermo = cold > 0.5 ? 0.05 : heat > 0.5 ? 0.92 : 0.5;
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${bgTop} 0%, ${bgBot} 100%)`}}>
      <svg width={width} height={height}>
        {frost.map((f, i) => {
          const p = clamp(grow * 1.8 - f.k);
          return p > 0 ? <path key={i} d={f.d} stroke="#cfefff" strokeOpacity={0.55} strokeWidth={3} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} fill="none" /> : null;
        })}
        {/* ondas de calor (ilustrativas) */}
        {heat > 0.01 &&
          Array.from({length: 9}, (_, i) => {
            const y = ((i * 220 - t * 120) % (height + 200) + height + 200) % (height + 200) - 100;
            const pts = Array.from({length: 14}, (_, k) => `${k * 90},${(y + Math.sin(k * 0.9 + t * 4 + i) * 18).toFixed(1)}`).join(' ');
            return <polyline key={i} points={pts} stroke="#ffb070" strokeOpacity={0.25 * heat} strokeWidth={4} fill="none" />;
          })}
        <g transform={`translate(${width / 2} ${height * 0.5 + Math.sin(t * 0.5) * 4})`}>
          <circle cy={-200} r={360} fill={heat > 0.3 ? '#ff7a3a' : '#7fd0ff'} opacity={0.08 + 0.06 * Math.sin(t * 2)} />
          <g transform="translate(0 40)">
            <Tardigrade id="ex" pose={pose} dryness={1} light={0.7} />
          </g>
          {/* cristales de hielo alrededor */}
          {Array.from({length: 10}, (_, i) => {
            const a = (i / 10) * Math.PI * 2 + t * 0.05;
            const rr = 300 + (i % 3) * 30;
            const s = 14 + (i % 4) * 6;
            return (
              <g key={i} transform={`translate(${Math.cos(a) * rr} ${Math.sin(a) * rr * 0.7}) rotate(${i * 30})`} opacity={grow}>
                <path d={`M0,${-s} L0,${s} M${-s * 0.87},${-s / 2} L${s * 0.87},${s / 2} M${-s * 0.87},${s / 2} L${s * 0.87},${-s / 2}`} stroke="#e8f8ff" strokeWidth={3} />
              </g>
            );
          })}
        </g>
        {/* termómetro */}
        <g transform="translate(120 520)" opacity={1 - neutral}>
          <rect x={-18} y={0} width={36} height={600} rx={18} fill="#0c1420" stroke="#9fb3c2" strokeWidth={3} />
          <rect x={-10} y={600 - 600 * thermo} width={20} height={600 * thermo} rx={10} fill={heat > 0.3 ? '#ff6a3a' : '#7fd0ff'} />
          <circle cx={0} cy={630} r={34} fill={heat > 0.3 ? '#ff6a3a' : '#7fd0ff'} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 190, top: 980, fontFamily: FONT_FAMILY, color: '#eafffb', opacity: cold}}>
        <div style={{fontWeight: 900, fontSize: 64}}>−196 °C</div>
        <div style={{fontWeight: 700, fontSize: 26, color: '#7fd0ff'}}>nitrógeno líquido · laboratorio</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: smoothstep(81.6, 82.4, t) * (1 - smoothstep(84, 84.6, t))}}>
        <div style={{display: 'inline-block', padding: '16px 30px', borderRadius: 24, background: 'rgba(3,14,30,0.8)', border: '2px solid #7fd0ff88'}}>
          <div style={{fontWeight: 900, fontSize: 42, color: '#7fd0ff'}}>2016 · MUSGO ANTÁRTICO</div>
          <div style={{fontWeight: 600, fontSize: 26, color: '#eafffb'}}>congelado más de 30 años, tardígrados reactivados</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 190, top: 980, fontFamily: FONT_FAMILY, color: '#fff1e0', opacity: heat}}>
        <div style={{fontWeight: 900, fontSize: 48}}>CALOR</div>
        <div style={{fontWeight: 700, fontSize: 24, color: '#ffb070'}}>experimento ilustrativo · resistencia breve y limitada</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: neutral}}>
        <div style={{fontWeight: 900, fontSize: 52, color: '#ffffff'}}>NO SON INVENCIBLES</div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 14, marginTop: 22, flexWrap: 'wrap', padding: '0 80px'}}>
          {['especie', 'temperatura', 'duración', 'estado fisiológico'].map((c, i) => (
            <div key={c} style={{padding: '10px 22px', borderRadius: 30, border: '2px solid #c9f27a', color: '#c9f27a', fontWeight: 800, fontSize: 28, opacity: smoothstep(90.6 + i * 0.3, 91.2 + i * 0.3, t)}}>
              {c}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
