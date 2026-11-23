// VISUALIZACIONES CIENTÍFICAS ESTILIZADAS de la electricidad (no son rayos: bajo el agua la descarga
// no se ve). Se dibujan como gráficos superpuestos en turquesa/amarillo:
//  · FieldLines: campo dipolar débil (electrolocalización) entre la cabeza (+) y la cola (−), con
//    trazos que fluyen; se deforma hacia un objeto cercano (la presa oculta).
//  · PulseFronts: frentes de pulso que salen del cuerpo y viajan por el agua (descarga de alto voltaje).
//  · VisualTag: etiqueta discreta "visualización científica".
import React from 'react';
import {clamp, hash1} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {Spine} from '../../ep18-mixino/motion/path';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export const FieldLines: React.FC<{spine: Spine; k: number; t: number; target?: {x: number; y: number}; pull?: number; color?: string}> = ({spine, k, t, target, pull = 0, color = '#5ff0e0'}) => {
  if (k <= 0.01) return null;
  const head = spine[1];
  const tail = spine[spine.length - 1];
  const mid = spine[Math.round(spine.length * 0.45)];
  const dx = tail.x - head.x;
  const dy = tail.y - head.y;
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L;
  const ny = dx / L;
  const lines: React.ReactNode[] = [];
  [1, 2, 3, 4].forEach((r) => {
    [1, -1].forEach((side) => {
      const off = r * 70 * side;
      let cx = mid.x + nx * off * 2.2;
      let cy = mid.y + ny * off * 2.2;
      if (target && pull > 0) {
        const d = Math.hypot(target.x - cx, target.y - cy);
        const w = clamp(1 - d / 700) * pull;
        cx += (target.x - cx) * w * 0.6;
        cy += (target.y - cy) * w * 0.6;
      }
      lines.push(
        <path key={`${r}${side}`} d={`M${f1(head.x)},${f1(head.y)} Q${f1(cx)},${f1(cy)} ${f1(tail.x)},${f1(tail.y)}`} stroke={color} strokeWidth={2} fill="none" strokeDasharray="10 16" strokeDashoffset={f1(-t * 60 * (1 + r * 0.1))} opacity={k * (0.55 - r * 0.1)} />,
      );
    });
  });
  return (
    <g>
      {lines}
      <circle cx={head.x} cy={head.y} r={10} fill="none" stroke={color} strokeWidth={2} opacity={k * 0.6} />
      <text x={head.x - 6} y={head.y - 16} fill={color} fontSize={20} fontWeight={800} opacity={k * 0.8} fontFamily={FONT_FAMILY}>+</text>
      <text x={tail.x - 6} y={tail.y - 14} fill={color} fontSize={22} fontWeight={800} opacity={k * 0.8} fontFamily={FONT_FAMILY}>−</text>
    </g>
  );
};

/** Frentes de pulso (descarga): ondas que nacen a lo largo del cuerpo y se expanden. */
export const PulseFronts: React.FC<{spine: Spine; t: number; t0: number; dur: number; rate?: number; color?: string; reach?: number; aim?: {x: number; y: number}}> = ({spine, t, t0, dur, rate = 14, color = '#f6f070', reach = 520, aim}) => {
  const age = t - t0;
  if (age < 0 || age > dur + 1.2) return null;
  const fronts: React.ReactNode[] = [];
  const n = Math.floor(Math.min(age, dur) * rate);
  const srcs = [spine[2], spine[Math.round(spine.length * 0.35)], spine[Math.round(spine.length * 0.7)]];
  for (let k = Math.max(0, n - 10); k <= n; k++) {
    const born = k / rate;
    const a = age - born;
    if (a < 0 || a > 0.9) continue;
    const r = 30 + (a / 0.9) * reach;
    const o = (1 - a / 0.9) * 0.6;
    const src = srcs[k % srcs.length];
    if (aim) {
      const ang = Math.atan2(aim.y - src.y, aim.x - src.x);
      fronts.push(<path key={k} d={`M${f1(src.x + Math.cos(ang - 0.7) * r)},${f1(src.y + Math.sin(ang - 0.7) * r)} A${f1(r)},${f1(r)} 0 0,1 ${f1(src.x + Math.cos(ang + 0.7) * r)},${f1(src.y + Math.sin(ang + 0.7) * r)}`} stroke={k % 2 ? color : '#7ff8ff'} strokeWidth={3 + (1 - a) * 3} fill="none" opacity={o} />);
    } else {
      fronts.push(<circle key={k} cx={src.x} cy={src.y} r={r} stroke={k % 2 ? color : '#7ff8ff'} strokeWidth={3} fill="none" opacity={o * 0.8} />);
    }
  }
  // chispeo gráfico alrededor del cuerpo (marcas, no rayos)
  const ticks = age < dur ? Array.from({length: 18}, (_, i) => {
    const p = spine[Math.floor(hash1(i * 3 + Math.floor(t * 20)) * spine.length)];
    const a = hash1(i * 7 + Math.floor(t * 20)) * Math.PI * 2;
    return <path key={`k${i}`} d={`M${f1(p.x + Math.cos(a) * 30)},${f1(p.y + Math.sin(a) * 30)} l${f1(Math.cos(a) * 18)},${f1(Math.sin(a) * 18)}`} stroke={color} strokeWidth={2.4} opacity={0.6} strokeLinecap="round" />;
  }) : null;
  return (
    <g>
      {fronts}
      {ticks}
    </g>
  );
};

export const VisualTag: React.FC<{k: number; text?: string}> = ({k, text = 'VISUALIZACIÓN CIENTÍFICA · LA DESCARGA NO ES VISIBLE BAJO EL AGUA'}) =>
  k > 0.01 ? <div style={{position: 'absolute', left: 0, right: 0, top: 1700, textAlign: 'center', fontFamily: FONT_FAMILY, color: '#9ff4e8', fontSize: 22, fontWeight: 700, letterSpacing: 2, opacity: 0.75 * k}}>{text}</div> : null;
