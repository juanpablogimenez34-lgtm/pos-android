// Efectos del Ep. 04. Las líneas de velocidad y el desenfoque son RECURSOS VISUALES
// estilizados: no representan ninguna medición del ave animada.
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {clamp, easeOut, hash1, smoothPath, Vec} from '../../engine/math';
import {FONT_FAMILY} from '../../engine/fonts';
import {useTime} from '../../engine/useTime';
import {Bird, BirdParams, PEREGRINE} from '../../creatures/falcon/Bird';
import {Cloud, SkyPal} from '../../environments/sky/Sky';

/** Estelas de velocidad en pantalla, alineadas con la dirección de vuelo. */
export const SpeedLines: React.FC<{intensity: number; dir: Vec; slow?: number; tau?: number}> = ({intensity, dir, slow = 1, tau}) => {
  const t0 = useTime();
  const t = tau ?? t0;
  if (tau !== undefined) slow = 1;
  const {width, height} = useVideoConfig();
  if (intensity <= 0.01) return null;
  const l = Math.hypot(dir.x, dir.y) || 1;
  const dx = -dir.x / l;
  const dy = -dir.y / l;
  const n = Math.round(30 + 34 * intensity);
  const lines = Array.from({length: n}, (_, i) => {
    const ph = ((t * (1.8 + hash1(i) * 1.6) * slow + hash1(i * 3)) % 1 + 1) % 1;
    // lejos del centro del encuadre (donde está el ave)
    const side = hash1(i * 17) < 0.5 ? -1 : 1;
    const off = side * (0.2 + hash1(i * 7) * 0.62);
    const cx = width / 2 + -dy * off * width + dx * (ph - 0.5) * height * 1.4;
    const cy = height / 2 + dx * off * width + dy * (ph - 0.5) * height * 1.4;
    const len = (160 + hash1(i * 11) * 520) * intensity;
    return {x1: cx, y1: cy, x2: cx + dx * len, y2: cy + dy * len, o: Math.sin(Math.PI * ph) * (0.22 + 0.38 * hash1(i * 5)), w: 1.2 + hash1(i * 13) * 2.6};
  });
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={width} height={height}>
        <defs>
          <linearGradient id="sl-g" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity={0} />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity={1} />
            <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>
        </defs>
        {lines.map((s, i) => {
          // trazo afilado: polígono fino que se estrecha en ambos extremos
          const nx = -(s.y2 - s.y1);
          const ny = s.x2 - s.x1;
          const l = Math.hypot(nx, ny) || 1;
          const w = s.w / 2;
          const mx = (s.x1 + s.x2) / 2;
          const my = (s.y1 + s.y2) / 2;
          return <path key={i} d={`M${s.x1},${s.y1} L${mx + (nx / l) * w},${my + (ny / l) * w} L${s.x2},${s.y2} L${mx - (nx / l) * w},${my - (ny / l) * w}Z`} fill="#ffffff" opacity={s.o * intensity} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

const PanelBg: React.FC<{k: number; title: string; sub: string; children: React.ReactNode}> = ({k, title, sub, children}) => {
  const {width, height} = useVideoConfig();
  if (k <= 0.01) return null;
  return (
    <AbsoluteFill style={{opacity: easeOut(k)}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #10345a 0%, #071a33 70%, #040d1c 100%)'}} />
      <svg width={width} height={height} style={{position: 'absolute'}}>
        {Array.from({length: 30}, (_, i) => (
          <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={height} stroke="#7fd0ff" strokeOpacity={0.06} />
        ))}
        {Array.from({length: 50}, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 40} x2={width} y2={i * 40} stroke="#7fd0ff" strokeOpacity={0.06} />
        ))}
        {children}
      </svg>
      <div style={{position: 'absolute', top: 250, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_FAMILY}}>
        <div style={{color: '#eafffb', fontWeight: 900, fontSize: 44, letterSpacing: 3}}>{title}</div>
        <div style={{color: '#7fd0ff', fontWeight: 600, fontSize: 26, marginTop: 6}}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
};

const Label: React.FC<{x: number; y: number; tx: number; ty: number; text: string; k: number}> = ({x, y, tx, ty, text, k}) => (
  <g opacity={clamp(k)}>
    <circle cx={x} cy={y} r={7} fill="none" stroke="#ffd27a" strokeWidth={3} />
    <path d={`M${x},${y} L${tx},${ty}`} stroke="#ffd27a" strokeWidth={2.5} />
    <text x={tx} y={ty - 10} fill="#ffffff" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={32} textAnchor={tx > x ? 'start' : 'middle'}>
      {text}
    </text>
  </g>
);

/** 52–59 s: forma del ala vista desde arriba (mismo rig del halcón). */
export const WingPanel: React.FC<{k: number; base: BirdParams}> = ({k, base}) => {
  const t = useTime();
  const {width, height} = useVideoConfig();
  const p: BirdParams = {...base, x: width / 2, y: height * 0.52, scale: 2.2, yaw: 0, pitch: Math.PI / 2, roll: Math.PI / 2, flap: 0.04 + Math.sin(t * 1.2) * 0.03, fold: 0, sweep: 0.15 + 0.1 * Math.sin(t * 0.8), tail: 0.4 + 0.3 * Math.sin(t * 0.9), silhouette: 0, legs: 0, headYaw: 0, headPitch: 0};
  const u = t - 52;
  return (
    <PanelBg k={k} title="FORMA DEL ALA" sub="ilustración esquemática · vista desde arriba">
      <Bird id="wp" spec={PEREGRINE} params={p} />
      <path d={`M${width / 2 - 420},${height * 0.52 + 30} Q${width / 2 - 200},${height * 0.52 - 40} ${width / 2},${height * 0.52 - 10} Q${width / 2 + 200},${height * 0.52 - 40} ${width / 2 + 420},${height * 0.52 + 30}`} stroke="#7fd0ff" strokeWidth={3} strokeDasharray="10 8" fill="none" opacity={clamp(u / 1.5)} />
      <Label x={width / 2 + 370} y={height * 0.52 + 40} tx={width / 2 + 100} ty={height * 0.52 - 260} text="Alas largas y puntiagudas" k={(u - 1) / 0.8} />
      <Label x={width / 2} y={height * 0.52 + 200} tx={width / 2 + 120} ty={height * 0.52 + 380} text="Cola: timón" k={(u - 3) / 0.8} />
      <Label x={width / 2} y={height * 0.52 - 40} tx={130} ty={height * 0.52 - 300} text="Cuerpo compacto" k={(u - 4.5) / 0.8} />
    </PanelBg>
  );
};

/** 59–65 s: flujo de aire estilizado alrededor del perfil del ave planeando. */
export const FlowPanel: React.FC<{k: number; base: BirdParams}> = ({k, base}) => {
  const t = useTime();
  const {width, height} = useVideoConfig();
  const cx = width / 2;
  const cy = height * 0.52;
  const p: BirdParams = {...base, x: cx, y: cy, scale: 2.4, yaw: 0, pitch: -0.02, roll: 0.3, flap: 0.05, fold: 0, sweep: 0.2, tail: 0.25, silhouette: 0, legs: 0, headYaw: 0, headPitch: 0};
  // líneas de corriente alrededor de una elipse (flujo potencial simplificado, esquemático)
  const A = 330;
  const B = 150;
  const lines = Array.from({length: 13}, (_, i) => {
    const y0 = (i - 6) * 70;
    const pts: Vec[] = [];
    for (let x = -600; x <= 600; x += 30) {
      const r2 = (x / A) ** 2 + (y0 / B) ** 2;
      const push = y0 === 0 ? 0 : (Math.sign(y0) * B * 1.25) / (1 + r2 * 0.9);
      pts.push({x: cx + x, y: cy + y0 + push});
    }
    return smoothPath(pts);
  });
  return (
    <PanelBg k={k} title="FLUJO DE AIRE" sub="representación estilizada, no una simulación">
      {lines.map((d, i) => (
        <path key={i} d={d} stroke="#7fd0ff" strokeOpacity={0.5} strokeWidth={3} fill="none" strokeDasharray="26 22" strokeDashoffset={-t * 180} />
      ))}
      <Bird id="fp" spec={PEREGRINE} params={p} />
      <g opacity={clamp((t - 61) / 0.8)}>
        <path d={`M${cx - 300},${cy + 230} q-60,40 -10,90`} stroke="#ffd27a" strokeWidth={3} fill="none" />
        <text x={cx - 300} y={cy + 360} fill="#ffffff" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={30} textAnchor="middle">
          la cola ajusta la trayectoria
        </text>
      </g>
    </PanelBg>
  );
};

/** Anillo de enfoque discreto sobre la presa lejana (no es una interfaz de videojuego). */
export const FocusRing: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) => {
  const {width, height} = useVideoConfig();
  if (k <= 0.01) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={width} height={height}>
        <circle cx={x} cy={y} r={70 + 20 * (1 - k)} fill="none" stroke="#ffffff" strokeOpacity={0.55 * k} strokeWidth={2} />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Nubes que pasan a gran velocidad junto al ave en la picada (recurso visual estilizado).
 * `tau`: tiempo de animación integrado (respeta la cámara lenta). `front`: capa delante del ave.
 */
export const RushClouds: React.FC<{intensity: number; dir: Vec; tau: number; pal: SkyPal; front?: boolean}> = ({intensity, dir, tau, pal, front = false}) => {
  const {width, height} = useVideoConfig();
  if (intensity <= 0.02) return null;
  const l = Math.hypot(dir.x, dir.y) || 1;
  // el fondo se desplaza en sentido contrario al vuelo
  const mx = -dir.x / l;
  const my = -dir.y / l;
  const ang = (Math.atan2(my, mx) * 180) / Math.PI - 90;
  const n = front ? 3 : 8;
  const period = front ? 1.9 : 1.15;
  const travel = height + 2200;
  const items = Array.from({length: n}, (_, i) => {
    const seed = (front ? 700 : 900) + i;
    const ph = (((tau / period) * (0.8 + hash1(seed) * 0.5) + hash1(seed * 3)) % 1 + 1) % 1;
    const cycle = Math.floor((tau / period) * (0.8 + hash1(seed) * 0.5) + hash1(seed * 3));
    // posición lateral distinta en cada pasada; la capa frontal evita el centro (el ave)
    const r = hash1(seed * 7 + cycle * 13.1);
    const lat = front ? (r < 0.5 ? -1 : 1) * (0.42 + hash1(seed + cycle) * 0.35) : (r - 0.5) * 1.5;
    const along = (ph - 0.5) * travel;
    const cx = width / 2 + -my * lat * width - mx * along * -1;
    const cy = height / 2 + mx * lat * width - my * along * -1;
    const s = (front ? 1.0 : 0.45) + hash1(seed * 5 + cycle) * (front ? 0.5 : 0.45);
    return {cx, cy, s, seed: seed * 10 + (cycle % 5), o: Math.sin(Math.PI * ph)};
  });
  const blur = front ? 14 : 8;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={width} height={height}>
        <defs>
          <filter id={`rush-${front ? 'f' : 'b'}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={`${(blur * 0.25 * intensity + 2).toFixed(1)} ${(blur * intensity + 2).toFixed(1)}`} />
          </filter>
        </defs>
        {items.map((c, i) => (
          <g key={i} transform={`translate(${c.cx.toFixed(1)} ${c.cy.toFixed(1)}) rotate(${ang.toFixed(2)}) scale(${(0.8 * c.s).toFixed(3)} ${(c.s * (1 + 0.9 * intensity)).toFixed(3)})`} filter={`url(#rush-${front ? 'f' : 'b'})`} opacity={Math.min(1, c.o * 1.6) * intensity * (front ? 0.5 : 0.85)}>
            <g transform="rotate(90)">
              <Cloud x={0} y={0} s={1} seed={c.seed} pal={pal} op={1} />
            </g>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/** Estelas de aire pegadas al cuerpo del ave (afiladas, se desvanecen hacia atrás). */
export const BodyTrails: React.FC<{intensity: number; x: number; y: number; dir: Vec; scale: number; tau: number}> = ({intensity, x, y, dir, scale, tau}) => {
  if (intensity <= 0.03) return null;
  const l = Math.hypot(dir.x, dir.y) || 1;
  const fx = dir.x / l;
  const fy = dir.y / l;
  const nx = -fy;
  const ny = fx;
  return (
    <g>
      {Array.from({length: 11}, (_, i) => {
        const off = (i - 5) * 11 * scale * (1 + Math.abs(i - 5) * 0.12);
        const flick = 0.75 + 0.25 * Math.sin(tau * 23 + i * 1.7);
        const L = (260 + hash1(i * 9) * 340) * intensity * scale * flick;
        const back = (30 + Math.abs(i - 5) * 10) * scale;
        const w = (Math.abs(i - 5) < 2 ? 3.2 : 2.2) * scale;
        const ax = x + nx * off - fx * back;
        const ay = y + ny * off - fy * back;
        const bx = ax - fx * L;
        const by = ay - fy * L;
        return (
          <path key={i} d={`M${(ax + nx * w).toFixed(1)},${(ay + ny * w).toFixed(1)} L${bx.toFixed(1)},${by.toFixed(1)} L${(ax - nx * w).toFixed(1)},${(ay - ny * w).toFixed(1)}Z`} fill="#ffffff" opacity={(0.25 + 0.3 * hash1(i * 4)) * intensity} />
        );
      })}
    </g>
  );
};
