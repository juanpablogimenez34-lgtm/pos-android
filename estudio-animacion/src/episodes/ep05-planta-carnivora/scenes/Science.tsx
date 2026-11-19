// Visualizaciones científicas del Ep. 05 (esquemáticas y rotuladas como tales):
// contador de estímulos, gráfica de señales eléctricas, corte de la digestión acelerada,
// salto temporal "DÍAS DESPUÉS", repetición en cámara lenta y leyendas de nutrientes.
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {FONT_FAMILY} from '../../../engine/fonts';
import {clamp, easeOut, hash1, lerp, smoothstep} from '../../../engine/math';
import {useTime} from '../../../engine/useTime';
import {EV, storyT} from '../timeline';

const panel = {background: 'rgba(6,18,24,0.78)', border: '2px solid rgba(127,243,255,0.45)', borderRadius: 22, fontFamily: FONT_FAMILY, color: '#eafffb'} as const;
const win = (t: number, a: number, b: number, r = 0.4) => smoothstep(a, a + r, t) * (1 - smoothstep(b - r, b, t));

/** Número de estímulos registrados por la trampa protagonista (visualización). */
export const stimuliAt = (s: number) => (s >= EV.touch1 ? 1 : 0) + (s >= EV.touch2 ? 1 : 0) + EV.struggles.filter((x) => s >= x).length;

export const StimulusCounter: React.FC = () => {
  const t = useTime();
  const k = win(t, 59.8, 102.6, 0.5) * (1 - win(t, 64, 70, 0.4)) * (t >= EV.replayStart && t < EV.replayEnd ? 0 : 1);
  if (k <= 0.01) return null;
  const s = storyT(t);
  const n = stimuliAt(s);
  const last = [EV.touch1, EV.touch2, ...EV.struggles].filter((x) => s >= x).pop() ?? 0;
  const flash = 1 - clamp((s - last) / 0.6);
  const note = n === 1 ? 'un estímulo: la trampa sigue abierta' : n === 2 ? 'segundo estímulo: cierre' : 'más estímulos: sellado y digestión';
  return (
    <div style={{position: 'absolute', left: 60, top: 230, opacity: easeOut(k), ...panel, padding: '16px 24px', transform: `scale(${1 + 0.06 * flash})`, transformOrigin: 'left top'}}>
      <div style={{fontSize: 22, fontWeight: 700, color: '#7ff3ff', letterSpacing: 2}}>ESTÍMULOS DETECTADOS</div>
      <div style={{display: 'flex', gap: 10, marginTop: 10}}>
        {Array.from({length: 6}, (_, i) => (
          <div key={i} style={{width: 34, height: 34, borderRadius: 17, background: i < n ? '#7ff3ff' : 'rgba(127,243,255,0.12)', boxShadow: i === n - 1 ? `0 0 ${18 * flash}px #7ff3ff` : 'none'}} />
        ))}
      </div>
      <div style={{fontSize: 22, fontWeight: 600, marginTop: 10, maxWidth: 420}}>{note}</div>
    </div>
  );
};

/** 64–70 s: gráfica esquemática de las señales eléctricas (no son datos medidos). */
export const SignalPanel: React.FC = () => {
  const t = useTime();
  const {width} = useVideoConfig();
  const k = win(t, 64, 70, 0.5);
  if (k <= 0.01) return null;
  const W = width - 120;
  const H = 300;
  const x0 = 40;
  const base = 210;
  const spike = (tc: number, at: number) => {
    // forma de potencial de acción estilizada
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const u = i / 40;
      const x = at - 30 + u * 70;
      const d = u * 70 - 22;
      const y = base - (d > 0 && d < 30 ? Math.sin((d / 30) * Math.PI) * 140 : 0) + (d > 30 && d < 46 ? Math.sin(((d - 30) / 16) * Math.PI) * 18 : 0);
      if (tc >= u) pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.length > 1 ? `M${pts.join('L')}` : '';
  };
  const p1 = clamp((t - 65.0) / 0.9);
  const p2 = clamp((t - 67.4) / 0.9);
  const a1 = x0 + W * 0.25;
  const a2 = x0 + W * 0.6;
  return (
    <div style={{position: 'absolute', left: 60, top: 1180, width: W, opacity: easeOut(k), ...panel, padding: 0, overflow: 'hidden'}}>
      <div style={{padding: '18px 26px 0', fontSize: 30, fontWeight: 900}}>SEÑALES ELÉCTRICAS</div>
      <div style={{padding: '2px 26px', fontSize: 22, color: '#7ff3ff'}}>representación esquemática · no es una medición</div>
      <svg width={W} height={H}>
        <line x1={x0} y1={base} x2={W - 30} y2={base} stroke="#7ff3ff" strokeOpacity={0.4} strokeWidth={2} />
        <path d={spike(p1, a1)} stroke="#7ff3ff" strokeWidth={4} fill="none" />
        <path d={spike(p2, a2)} stroke="#ffd27a" strokeWidth={4} fill="none" />
        {/* ventana temporal breve */}
        <rect x={a1} y={base + 24} width={(a2 - a1) * clamp((t - 65.6) / 1.6)} height={10} rx={5} fill="#7ff3ff" opacity={0.35} />
        <text x={a1 - 10} y={base + 64} fill="#eafffb" fontFamily={FONT_FAMILY} fontWeight={700} fontSize={24} opacity={clamp((t - 65.4) / 0.5)}>
          1.ª señal: no cierra
        </text>
        <text x={a2 - 10} y={base + 64} fill="#ffd27a" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={24} opacity={clamp((t - 67.9) / 0.5)}>
          2.ª en un intervalo breve: cierre
        </text>
      </svg>
    </div>
  );
};

/** 81–86 s: rótulo de la repetición en cámara lenta. */
export const ReplayOverlay: React.FC = () => {
  const t = useTime();
  const {width, height} = useVideoConfig();
  const k = win(t, EV.replayStart, EV.replayEnd, 0.2);
  if (k <= 0.01) return null;
  const flashIn = 1 - clamp((t - EV.replayStart) / 0.25);
  const flashOut = clamp((t - (EV.replayEnd - 0.25)) / 0.25);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 120 * k, background: '#000'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 * k, background: '#000'}} />
      <div style={{position: 'absolute', left: 60, top: 170, fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 34, letterSpacing: 4, color: '#fff', opacity: k}}>
        ● REPETICIÓN · CÁMARA LENTA ×10
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: 0.55 * Math.max(flashIn, flashOut)}} />
      <svg width={width} height={height} style={{position: 'absolute'}}>
        <rect x={20} y={20} width={width - 40} height={height - 40} fill="none" stroke="#ffffff" strokeOpacity={0.25 * k} strokeWidth={3} />
      </svg>
    </AbsoluteFill>
  );
};

/** 103–110 s: corte transversal de la trampa sellada con secreción digestiva (acelerado). */
export const DigestionPanel: React.FC = () => {
  const t = useTime();
  const {width, height} = useVideoConfig();
  const k = win(t, 103.2, 110.4, 0.6);
  if (k <= 0.01) return null;
  const u = clamp((t - 103.6) / 6.2); // progreso de la visualización
  const cx = width / 2;
  const cy = height * 0.47;
  const R = 330;
  // lóbulos en corte: dos arcos unidos en la bisagra (abajo) y sellados arriba
  const lobe = (sg: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 30; i++) {
      const a = (i / 30) * Math.PI;
      const x = cx + sg * Math.sin(a) * R * 0.62;
      const y = cy + R - (1 - Math.cos(a)) * R;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return 'M' + pts.join('L');
  };
  const fluid = smoothstep(0.1, 0.55, u);
  const prey = 1 - smoothstep(0.35, 1, u);
  const drops = Array.from({length: 22}, (_, i) => {
    const side = i % 2 ? 1 : -1;
    const a = 0.25 + hash1(i * 3.1) * 2.6;
    const ph = (u * 3 + hash1(i)) % 1;
    const sx = cx + side * Math.sin(a) * R * 0.6;
    const sy = cy + R - (1 - Math.cos(a)) * R;
    return {x: lerp(sx, cx, ph * 0.5), y: lerp(sy, cy, ph * 0.3), o: Math.sin(Math.PI * ph) * smoothstep(0.05, 0.2, u)};
  });
  const arrows = smoothstep(0.55, 0.8, u);
  return (
    <AbsoluteFill style={{opacity: easeOut(k)}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #1b2a12 0%, #0b140a 75%)'}} />
      <svg width={width} height={height} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <radialGradient id="dg-fluid" cx="0.5" cy="0.6" r="0.6">
            <stop offset="0" stopColor="#ffe08a" stopOpacity={0.85} />
            <stop offset="1" stopColor="#ff9f3a" stopOpacity={0.35} />
          </radialGradient>
        </defs>
        <ellipse cx={cx} cy={cy + 30} rx={R * 0.55} ry={R * 0.82} fill="url(#dg-fluid)" opacity={fluid} />
        {/* silueta de la presa que se va descomponiendo */}
        <g opacity={0.25 + 0.75 * prey} transform={`translate(${cx} ${cy + 20}) rotate(-90)`}>
          <ellipse cx={-30} cy={0} rx={70} ry={38} fill="#3c3a34" />
          <ellipse cx={40} cy={0} rx={42} ry={36} fill="#54575c" />
          <circle cx={88} cy={0} r={26} fill="#5d2a20" />
          {[-1, 1].map((sg) => (
            <g key={sg}>
              {[30, 50, 70].map((x) => (
                <path key={x} d={`M${x},${sg * 30} l${-10},${sg * 50} l${-14},${sg * 18}`} stroke="#2a2724" strokeWidth={6} fill="none" opacity={prey} />
              ))}
            </g>
          ))}
        </g>
        <path d={lobe(1)} stroke="#6fa232" strokeWidth={34} fill="none" strokeLinecap="round" />
        <path d={lobe(-1)} stroke="#6fa232" strokeWidth={34} fill="none" strokeLinecap="round" />
        <path d={lobe(1)} stroke="#b0303a" strokeWidth={10} fill="none" transform="translate(-14 0)" />
        <path d={lobe(-1)} stroke="#b0303a" strokeWidth={10} fill="none" transform="translate(14 0)" />
        {/* glándulas y gotas de secreción */}
        {drops.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={9} fill="#ffe9a8" opacity={d.o} />
        ))}
        {/* nutrientes absorbidos hacia los tejidos */}
        {[-1, 1].map((sg) =>
          [0, 1, 2].map((j) => {
            const y = cy - 120 + j * 120;
            const x0 = cx + sg * 60;
            const x1 = cx + sg * (R * 0.62 + 10);
            return (
              <g key={`${sg}${j}`} opacity={arrows}>
                <path d={`M${x0},${y} L${x1},${y}`} stroke="#c9f27a" strokeWidth={6} />
                <path d={`M${x1},${y} l${-sg * 22},-14 l0,28Z`} fill="#c9f27a" />
              </g>
            );
          }),
        )}
        <text x={cx} y={cy - R - 50} textAnchor="middle" fill="#ffffff" fontFamily={FONT_FAMILY} fontWeight={900} fontSize={44}>
          TRAMPA SELLADA (CORTE)
        </text>
        <text x={cx} y={cy - R - 10} textAnchor="middle" fill="#ffd27a" fontFamily={FONT_FAMILY} fontWeight={700} fontSize={28}>
          visualización acelerada · el proceso real dura días
        </text>
        <text x={cx + R * 0.7} y={cy + R * 0.25} fill="#ffe9a8" fontFamily={FONT_FAMILY} fontWeight={700} fontSize={26} opacity={smoothstep(0.1, 0.25, u)}>
          secreción digestiva
        </text>
        <text x={cx - R * 0.72} y={cy - 160} textAnchor="end" fill="#c9f27a" fontFamily={FONT_FAMILY} fontWeight={700} fontSize={26} opacity={arrows}>
          nutrientes absorbidos
        </text>
      </svg>
    </AbsoluteFill>
  );
};

/** 110–116 s: salto temporal explícito (ciclos de día y noche acelerados). */
export const DaysCard: React.FC = () => {
  const t = useTime();
  const k = win(t, 110.2, 116.4, 0.4);
  if (k <= 0.01) return null;
  const cycles = clamp((t - 110.4) / 5.6) * 4;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: easeOut(k)}}>
      <div style={{display: 'inline-block', ...panel, padding: '22px 40px'}}>
        <div style={{fontSize: 64, fontWeight: 900, letterSpacing: 4, color: '#ffffff'}}>DÍAS DESPUÉS</div>
        <div style={{fontSize: 26, fontWeight: 600, color: '#ffd27a', marginTop: 6}}>salto temporal · la digestión suele durar varios días</div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 18, marginTop: 14}}>
          {Array.from({length: 4}, (_, i) => (
            <div key={i} style={{width: 40, height: 40, borderRadius: 20, background: i < cycles ? '#ffd27a' : 'rgba(255,210,122,0.18)'}} />
          ))}
        </div>
      </div>
    </div>
  );
};

/** Oscurecimiento día/noche durante el salto temporal (0–1). */
export const nightAt = (t: number) => (t > 110.4 && t < 116.4 ? Math.pow(Math.max(0, Math.sin(((t - 110.4) / 1.5) * Math.PI)), 2) * 0.75 : 0);
