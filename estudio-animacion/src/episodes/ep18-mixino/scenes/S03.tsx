// ESCENA 3 (30–45 s) · LAS GLÁNDULAS SECRETAS: la cámara recorre la hilera de poros del costado; un
// recuadro anatómico (corte esquemático) muestra una glándula mucosa con células mucosas y células de
// filamento (con su madeja enrollada) y el conducto que desemboca en un poro. A los 38 s la glándula
// se contrae y expulsa su contenido; en el cuerpo, los poros liberan los primeros hilos.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, hash1} from '../../../engine/math';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {Hagfish} from '../character/Hagfish';
import {SlimeCloud, SlimeDefs} from '../character/Slime';
import {Callout, seg, Vignette, Wash, win} from '../components/common';
import {EV} from '../data/timeline';
import {DeepBack, DeepFront} from '../environment/Deep';
import {crawl, pathOf, poresAt} from './rig';

const f1 = (n: number) => n.toFixed(1);
const PATH = pathOf([{x: -1200, y: 300}, {x: -700, y: 330}, {x: -200, y: 300}, {x: 300, y: 320}, {x: 800, y: 300}, {x: 1300, y: 320}]);
const SH = 1700;

const spineAt = (t: number) => crawl(PATH, SH + (t - 30) * 10, t, 6, 1.2, 0.6);
const SP_P = spineAt(EV.glandPulse);

const Gland: React.FC<{t: number; cx: number; cy: number; R: number; k: number}> = ({t, cx, cy, R, k}) => {
  const pulse = seg(t, EV.glandPulse, EV.glandPulse + 0.6) * (1 - seg(t, EV.glandPulse + 1.2, EV.glandPulse + 3));
  const sq = 1 - 0.14 * pulse;
  const out = seg(t, EV.glandPulse + 0.2, EV.glandPulse + 3);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: k}}>
      <defs>
        <clipPath id="lens">
          <circle cx={cx} cy={cy} r={R} />
        </clipPath>
        <radialGradient id="tissue" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#c47a6c" />
          <stop offset="1" stopColor="#7a3e36" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={R + 8} fill="#04161a" stroke="#9ff4e4" strokeWidth={4} />
      <g clipPath="url(#lens)">
        <rect x={cx - R} y={cy - R} width={R * 2} height={R * 2} fill="url(#tissue)" />
        {/* agua (arriba) y piel: epidermis y dermis */}
        <rect x={cx - R} y={cy - R} width={R * 2} height={R * 0.42} fill="#0c3a40" />
        <path d={`M${cx - R},${cy - R * 0.58} Q${cx},${cy - R * 0.62} ${cx + R},${cy - R * 0.58} L${cx + R},${cy - R * 0.44} Q${cx},${cy - R * 0.48} ${cx - R},${cy - R * 0.44}Z`} fill="#e0a898" />
        {/* poro y conducto */}
        <path d={`M${cx - 12},${cy - R * 0.6} L${cx - 9},${cy - R * 0.2} L${cx + 9},${cy - R * 0.2} L${cx + 12},${cy - R * 0.6}Z`} fill="#3a1414" />
        {/* saco glandular */}
        <g transform={`translate(${cx} ${cy + R * 0.18}) scale(${f1(sq)} ${f1(sq)})`}>
          <ellipse rx={R * 0.62} ry={R * 0.46} fill="#5a2a26" stroke="#2a1010" strokeWidth={4} />
          <ellipse rx={R * 0.56} ry={R * 0.4} fill="#e8d0c0" opacity={0.9} />
          {/* células mucosas (pequeñas, claras) */}
          {Array.from({length: 26}, (_, i) => {
            const a = hash1(i * 3) * Math.PI * 2;
            const d = Math.sqrt(hash1(i * 7)) * 0.85;
            return <circle key={`m${i}`} cx={Math.cos(a) * R * 0.5 * d} cy={Math.sin(a) * R * 0.34 * d} r={R * 0.05} fill="#f8f2e8" stroke="#b89a88" strokeWidth={1.2} />;
          })}
          {/* células de filamento con su madeja */}
          {Array.from({length: 7}, (_, i) => {
            const a = (i / 7) * Math.PI * 2 + 0.4;
            const x = Math.cos(a) * R * 0.3;
            const y = Math.sin(a) * R * 0.2;
            let d = '';
            for (let k = 0; k <= 40; k++) {
              const u = k / 40;
              const ang = u * Math.PI * 2 * 5;
              const rr = R * 0.07 * (0.3 + 0.7 * u);
              d += `${k ? 'L' : 'M'}${f1(x + Math.cos(ang) * rr * 1.4)},${f1(y + Math.sin(ang) * rr)} `;
            }
            return (
              <g key={`t${i}`}>
                <ellipse cx={x} cy={y} rx={R * 0.12} ry={R * 0.09} fill="#f0dcc8" stroke="#a07a60" strokeWidth={1.4} />
                <path d={d} stroke="#6a3a2a" strokeWidth={1.4} fill="none" />
              </g>
            );
          })}
        </g>
        {/* contenido expulsado por el conducto */}
        {out > 0.01 &&
          Array.from({length: 10}, (_, i) => {
            const u = clamp(out * 1.4 - i * 0.07);
            const y = cy - R * 0.2 - u * R * 0.75;
            return <circle key={`o${i}`} cx={cx + Math.sin(i * 2 + t * 3) * 10 * u} cy={y} r={4 + 6 * u} fill="#eef8f2" opacity={0.7 * (1 - u * 0.6)} />;
          })}
        {out > 0.2 && <path d={`M${cx},${cy - R * 0.62} q${f1(30 * out)},${f1(-60 * out)} ${f1(10 + 60 * out)},${f1(-120 * out)} M${cx},${cy - R * 0.62} q${f1(-40 * out)},${f1(-50 * out)} ${f1(-30 - 50 * out)},${f1(-110 * out)}`} stroke="#eef8f2" strokeWidth={2} fill="none" opacity={0.6} />}
      </g>
    </svg>
  );
};

export function scene03(t: number): SceneOut {
  const sp = spineAt(t);
  const i0 = Math.round(0.12 * (sp.length - 1));
  const i1 = Math.round(0.8 * (sp.length - 1));
  const u = seg(t, 30, 44.5);
  const fi = Math.round(i0 + (i1 - i0) * u);
  const focus = sp[fi];
  let c: Cam = shot(t, 30, 32, cam(sp[i0].x, sp[i0].y - 80, 1.6), cam(focus.x, focus.y - 40, 3.4), 'cine');
  if (t >= 32) c = cam(focus.x, focus.y - 40, 3.4);
  c = breathe(c, t, 0.25);
  const pi = Math.round(0.42 * (sp.length - 1));
  const ps = toScreen(c, sp[pi].x, sp[pi].y + 4);
  const R = 250;
  const lens = {x: 540, y: 640};
  const k = win(t, 31.4, 44.6, 0.6);
  return {
    svg: (
      <DeepBack cam={c} t={t}>
        <SlimeDefs />
        <Hagfish uid="h3" spine={sp} look={{t, shadow: 12, pores: win(t, EV.glandPulse, EV.glandPulse + 4, 0.4) * 0.8, barbels: 0.6}} />
        <SlimeCloud t={t} b={{t0: EV.glandPulse + 0.4, sources: poresAt(SP_P, [0.3, 0.42, 0.55]), dir: -1.6, spread: 1.2, size: 120, seed: 11, life: 8}} />
      </DeepBack>
    ),
    overlay: (
      <>
        <DeepFront cam={c} t={t} />
        <Vignette />
        {k > 0.01 && (
          <AbsoluteFill style={{pointerEvents: 'none'}}>
            <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: k}}>
              <path d={`M${f1(ps.x)},${f1(ps.y)} L${lens.x},${lens.y + R + 8}`} stroke="#9ff4e4" strokeWidth={2} strokeDasharray="8 6" opacity={0.8} />
              <circle cx={ps.x} cy={ps.y} r={16} fill="none" stroke="#9ff4e4" strokeWidth={3} />
            </svg>
            <Gland t={t} cx={lens.x} cy={lens.y} R={R} k={k} />
          </AbsoluteFill>
        )}
        <Callout k={win(t, 33.0, 44.4)} x={lens.x} y={lens.y - R * 0.6} tx={820} ty={lens.y - R - 60} text="poro" />
        <Callout k={win(t, 34.2, 44.4)} x={lens.x + R * 0.55} y={lens.y + R * 0.3} tx={860} ty={lens.y + R + 70} text="glándula mucosa" align="right" />
        <Callout k={win(t, 35.4, 44.4)} x={lens.x - R * 0.3} y={lens.y + R * 0.1} tx={120} ty={lens.y - R - 40} text="células de filamento" />
        <Wash k={0.9 * seg(t, 44.4, 45)} color="#010708" />
        <Callout k={win(t, 36.6, 44.4)} x={lens.x - R * 0.1} y={lens.y + R * 0.45} tx={130} ty={lens.y + R + 60} text="células mucosas" />
      </>
    ),
  };
}
