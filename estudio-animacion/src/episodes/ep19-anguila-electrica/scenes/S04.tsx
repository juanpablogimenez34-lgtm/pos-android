// ESCENA 4 (45–60 s) · LOS 860 VOLTIOS: medidor ilustrado cuya aguja sube hasta 860 V, identificado
// como el MÁXIMO DOCUMENTADO para Electrophorus voltai (no el valor de todas las anguilas eléctricas).
// Detrás, la anguila nada y, en el pico, emite una descarga (visualización).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, SceneOut} from '../../../studio2';
import {ElectricEel} from '../character/ElectricEel';
import {Track} from '../character/states';
import {Brand, eelAt, pathOf, seg, Vignette, win} from '../components/common';
import {EV} from '../data/timeline';
import {PulseFronts, VisualTag} from '../effects/Electric';
import {RiverBack, RiverFront} from '../environment/River';

const f1 = (n: number) => n.toFixed(1);
const PATH = pathOf([{x: -2000, y: 520}, {x: -1300, y: 440}, {x: -600, y: 520}, {x: 100, y: 450}, {x: 800, y: 520}, {x: 1500, y: 460}, {x: 2200, y: 510}]);
const TRACK: Track = [[45, 'SLOW_SWIM'], [EV.gaugePeak - 0.4, 'HIGH_VOLTAGE_ATTACK'], [EV.gaugePeak + 1.4, 'SLOW_SWIM']];

const Gauge: React.FC<{v: number; k: number}> = ({v, k}) => {
  const cx = 540;
  const cy = 820;
  const R = 330;
  const a0 = Math.PI * 1.15;
  const a1 = Math.PI * 1.85;
  const max = 1000;
  const ang = (val: number) => a0 + (a1 - a0) * (val / max);
  const needle = ang(v);
  const arc = (from: number, to: number, r: number) => `M${f1(cx + Math.cos(ang(from)) * r)},${f1(cy + Math.sin(ang(from)) * r)} A${r},${r} 0 0,1 ${f1(cx + Math.cos(ang(to)) * r)},${f1(cy + Math.sin(ang(to)) * r)}`;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: k}}>
      <rect x={cx - R - 90} y={cy - R - 90} width={(R + 90) * 2} height={R + 250} rx={40} fill="rgba(4,20,18,0.78)" stroke="#5ff0e0" strokeWidth={3} strokeOpacity={0.5} />
      <path d={arc(0, 240, R)} stroke="#7ab0a0" strokeWidth={22} fill="none" />
      <path d={arc(240, 860, R)} stroke="#f6e070" strokeWidth={22} fill="none" opacity={0.85} />
      <path d={arc(0, Math.min(v, max), R)} stroke="#5ff0e0" strokeWidth={8} fill="none" />
      {Array.from({length: 11}, (_, i) => {
        const a = ang(i * 100);
        return (
          <g key={i}>
            <path d={`M${f1(cx + Math.cos(a) * (R - 24))},${f1(cy + Math.sin(a) * (R - 24))} L${f1(cx + Math.cos(a) * (R + 24))},${f1(cy + Math.sin(a) * (R + 24))}`} stroke="#eafff8" strokeWidth={3} />
            <text x={cx + Math.cos(a) * (R - 64)} y={cy + Math.sin(a) * (R - 64) + 9} textAnchor="middle" fill="#cfeee8" fontSize={24} fontWeight={700} fontFamily={FONT_FAMILY}>{i * 100}</text>
          </g>
        );
      })}
      <path d={`M${cx},${cy} L${f1(cx + Math.cos(needle) * (R + 10))},${f1(cy + Math.sin(needle) * (R + 10))}`} stroke="#ff6a4a" strokeWidth={7} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={18} fill="#ff6a4a" />
      <text x={cx} y={cy + 118} textAnchor="middle" fill="#ffffff" fontSize={96} fontWeight={900} fontFamily={FONT_FAMILY}>{Math.min(860, Math.round(v))} V</text>
    </svg>
  );
};

export function scene04(t: number): SceneOut {
  const e = eelAt(PATH, 1600, TRACK, 45, t);
  const sp = e.spine;
  const c = breathe(cam(sp[12].x, 150, 0.95), t, 0.3);
  const v = 860 * Math.pow(seg(t, EV.gaugeStart, EV.gaugePeak), 1.4) * (1 + 0.004 * Math.sin(t * 30) * (t > EV.gaugePeak ? 1 : 0));
  const k = win(t, 45.4, 59.5, 0.5);
  return {
    svg: (
      <RiverBack cam={c} t={t} light={0.8}>
        <ElectricEel uid="e4" spine={sp} look={{t, finPhase: e.finPhase, finAmp: e.p.finAmp, mouth: e.p.mouth, volt: win(t, EV.gaugePeak, EV.gaugePeak + 1, 0.1)}} />
        <PulseFronts spine={sp} t={t} t0={EV.gaugePeak} dur={1.0} rate={14} reach={700} />
      </RiverBack>
    ),
    overlay: (
      <>
        <RiverFront cam={c} t={t} />
        <Vignette />
        <AbsoluteFill style={{background: 'rgba(2,12,10,0.35)', opacity: k}} />
        <Gauge v={v} k={k} />
        <div style={{position: 'absolute', left: 80, right: 80, top: 1090, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: clamp((t - EV.gaugePeak) / 0.6) * k}}>
          <div style={{color: '#f6e070', fontWeight: 900, fontSize: 40, fontStyle: 'italic'}}>Electrophorus voltai</div>
          <div style={{color: '#eafff8', fontWeight: 700, fontSize: 30, lineHeight: 1.25}}>máximo documentado · otras especies producen descargas menores</div>
          <div style={{color: '#9fd8cc', fontWeight: 700, fontSize: 24, marginTop: 8}}>de Santana et al., 2019 · franja gris: 0–240 V (red eléctrica doméstica)</div>
        </div>
        <VisualTag k={win(t, EV.gaugePeak, EV.gaugePeak + 1.6, 0.2)} />
        <Brand />
      </>
    ),
  };
}
