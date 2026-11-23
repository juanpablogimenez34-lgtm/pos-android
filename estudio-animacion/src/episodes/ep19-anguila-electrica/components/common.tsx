// Piezas compartidas: rótulo de escena, marca del canal, viñeta cálida, panel de electrocitos y
// ayudas para colocar a la anguila en una trayectoria con su máquina de estados.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {bodyOnPath, makePath, P3, Path, smoothPts} from '../../ep18-mixino/motion/path';
import {EelParams, EelState, integrate, paramsAt, Track} from '../character/states';
import {EEL, SCENES} from '../data/timeline';

export {seg, win, Callout, Wash, BigTitle} from '../../ep18-mixino/components/common';

export const pathOf = (ctrl: P3[]) => makePath(smoothPts(ctrl, 16));

/** Anguila en una trayectoria: estado mezclado, distancia y fase de aleta integradas. */
export function eelAt(path: Path, s0: number, track: Track, t0: number, t: number, override?: Partial<Record<EelState, Partial<EelParams>>>, len = EEL.len) {
  const p = paramsAt(track, t, override);
  const g = integrate(track, t0, t, override);
  const yaw = Math.sin(t * 1.3) * p.headYaw * 300;
  const spine = bodyOnPath(path, s0 + g.dist, len, EEL.n, {amp: p.bodyAmp, waves: 1.1, phase: t * 3.2});
  // balanceo de cabeza: desplaza los primeros puntos lateralmente
  for (let i = 0; i < 5; i++) {
    const a = spine[i];
    const b = spine[Math.min(spine.length - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    const k = ((5 - i) / 5) * yaw * 0.12;
    a.x += (-dy / l) * k;
    a.y += (dx / l) * k;
  }
  return {spine, p, finPhase: g.finPhase, s: s0 + g.dist};
}

export const headPoint = (sp: {x: number; y: number}[]) => {
  const d = {x: sp[0].x - sp[1].x, y: sp[0].y - sp[1].y};
  const l = Math.hypot(d.x, d.y) || 1;
  return {x: sp[0].x + (d.x / l) * 30, y: sp[0].y + (d.y / l) * 30, ang: Math.atan2(d.y, d.x)};
};

export const Vignette: React.FC<{k?: number}> = ({k = 1}) => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity: k, background: 'radial-gradient(ellipse 82% 66% at 50% 46%, rgba(0,0,0,0) 50%, rgba(6,10,4,0.78) 100%)'}} />
);

export const Brand: React.FC<{k?: number}> = ({k = 1}) => (
  <div style={{position: 'absolute', left: 54, top: 70, fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 22, letterSpacing: 4, color: '#eafff6', opacity: 0.45 * k, textShadow: '0 2px 6px rgba(0,0,0,0.6)'}}>MUNDO INSÓLITO</div>
);

export const SceneTag: React.FC<{t: number}> = ({t}) => {
  const s = SCENES.find((x) => t >= x.start && t < x.end);
  if (!s || s.n === 1 || s.n === 12) return null;
  const k = clamp((t - s.start - 0.4) / 0.5) * clamp((s.start + 3.6 - t) / 0.5);
  if (k <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${((1 - k) * -10).toFixed(1)}px)`}}>
      <div style={{color: '#f6e070', fontWeight: 800, fontSize: 24, letterSpacing: 6}}>ESCENA {s.n}</div>
      <div style={{color: '#f6fff4', fontWeight: 900, fontSize: 42, letterSpacing: 1, textShadow: '0 3px 12px rgba(0,0,0,0.8)'}}>{s.title.toUpperCase()}</div>
    </div>
  );
};

/** Panel esquemático de electrocitos en serie: la activación recorre las columnas y el voltaje se suma. */
export const ElectrocytePanel: React.FC<{t: number; k: number; t0: number; top?: number}> = ({t, k, t0, top = 330}) => {
  if (k <= 0.01) return null;
  const cols = 14;
  const rows = 4;
  const w = 880;
  const x0 = 100;
  const cw = w / cols;
  const act = ((t - t0) / 2.2) % 1;
  const running = t >= t0;
  const lit = running ? Math.floor(act * (cols + 3)) : -1;
  const sum = running ? Math.min(cols, lit + 1) : 0;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: k}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <rect x={70} y={top - 30} width={940} height={rows * 70 + 150} rx={26} fill="rgba(4,24,22,0.72)" stroke="#5ff0e0" strokeWidth={2} strokeOpacity={0.5} />
        {Array.from({length: rows}, (_, r) =>
          Array.from({length: cols}, (_, c) => {
            const on = running && c <= lit && c > lit - 4;
            const x = x0 + c * cw;
            const y = top + 20 + r * 70;
            return (
              <g key={`${r}-${c}`}>
                <rect x={x + 4} y={y} width={cw - 8} height={54} rx={10} fill={on ? '#5ff0e0' : '#1e4a44'} opacity={on ? 0.9 : 0.8} stroke="#8ff8ee" strokeWidth={1} strokeOpacity={0.4} />
                <text x={x + 10} y={y + 22} fill={on ? '#04201c' : '#9fe8de'} fontSize={18} fontWeight={800} fontFamily={FONT_FAMILY}>+</text>
                <text x={x + cw - 22} y={y + 46} fill={on ? '#04201c' : '#9fe8de'} fontSize={20} fontWeight={800} fontFamily={FONT_FAMILY}>−</text>
              </g>
            );
          }),
        )}
        <path d={`M${x0},${top + rows * 70 + 44} L${x0 + w * (sum / cols)},${top + rows * 70 + 44}`} stroke="#f6e070" strokeWidth={10} strokeLinecap="round" />
      </svg>
      <div style={{position: 'absolute', left: 100, right: 100, top: top + rows * 70 + 66, display: 'flex', justifyContent: 'space-between', fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 28, color: '#eafff8'}}>
        <span>electrocitos en serie</span>
        <span style={{color: '#f6e070'}}>{running ? `${sum} × ≈0,15 V` : '≈0,15 V por célula'}</span>
      </div>
    </AbsoluteFill>
  );
};
