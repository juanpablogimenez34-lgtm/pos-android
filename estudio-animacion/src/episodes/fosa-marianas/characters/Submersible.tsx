// PERSONAJE 18 — SUMERGIBLE CIENTÍFICO (diseño original, inspirado en los sumergibles capaces de llegar al abismo
// Challenger: esfera de presión de titanio con miradores, cuerpo de espuma sintáctica, propulsores con tobera,
// barra de focos LED, cámaras, brazo manipulador, cesta de muestras, sensores y lastres).
// Vista lateral (mira hacia +x). Estados: DESCENDING, SCANNING, BOTTOM_LANDING, ASCENDING (por props).
import React from 'react';
import {clamp, lerp} from '../../../engine/math';

type V = {x: number; y: number};
const f1 = (n: number) => Math.round(n * 10) / 10;

export type SubPose = {
  x: number; y: number; s: number; t: number;
  tilt?: number; // cabeceo (rad), + morro abajo
  dir?: 1 | -1;
  lights?: number; // 0–1 focos encendidos
  thrustH?: number; // −1…1 propulsores horizontales
  thrustV?: number; // −1…1 propulsores verticales (+ = empuja hacia abajo)
  arm?: number; // 0 recogido … 1 extendido
  scan?: number; // 0–1 barrido de sónar/láser
  dark?: number; // 0 iluminado por el sol … 1 solo sus propias luces
};
// puntos locales (sin escala, mirando a +x) de los focos y cámaras
export const LAMPS: {p: V; a: number}[] = [{p: {x: 330, y: -30}, a: 0.35}, {p: {x: 330, y: 20}, a: 0.55}, {p: {x: 250, y: 110}, a: 0.95}, {p: {x: -40, y: 118}, a: 1.35}];
/** Posición y orientación en el mundo de los focos (para dibujar los conos de luz). */
export function lampWorld(P: SubPose) {
  const dir = P.dir ?? 1;
  const c = Math.cos(P.tilt ?? 0);
  const s = Math.sin(P.tilt ?? 0);
  return LAMPS.map((l) => {
    const lx = l.p.x * dir * P.s;
    const ly = l.p.y * P.s;
    const ang = dir > 0 ? l.a + (P.tilt ?? 0) : Math.PI - l.a + (P.tilt ?? 0);
    return {x: P.x + lx * c - ly * s, y: P.y + lx * s + ly * c, a: ang};
  });
}

const Thruster: React.FC<{x: number; y: number; w: number; h: number; t: number; th: number; vertical?: boolean}> = ({x, y, w, h, t, th, vertical}) => {
  const spin = t * (6 + Math.abs(th) * 30);
  const blades = [0, 1, 2, 3].map((k) => Math.sin(spin + k * (Math.PI / 2)));
  return (
    <g transform={`translate(${x} ${y})${vertical ? ' rotate(90)' : ''}`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h * 0.22} fill="#2a3038" stroke="#0e1216" strokeWidth={2} />
      <rect x={-w / 2 + 4} y={-h / 2 + 4} width={w - 8} height={h * 0.22} rx={3} fill="#4a5462" opacity={0.7} />
      <ellipse cx={w / 2} cy={0} rx={6} ry={h / 2 - 3} fill="#111418" />
      {blades.map((b, k) => <rect key={k} x={w / 2 - 3} y={f1(b * (h / 2 - 8) - 3)} width={6} height={6} rx={2} fill="#9aa4ae" opacity={0.5 + 0.5 * Math.abs(b)} />)}
      {Math.abs(th) > 0.05 && (
        <g opacity={clamp(Math.abs(th))}>
          {[0, 1, 2].map((k) => {
            const ph = ((t * 3 + k / 3) % 1);
            return <ellipse key={k} cx={w / 2 + 14 + ph * 70 * Math.sign(th || 1)} cy={(k - 1) * 6} rx={10 + ph * 14} ry={4 + ph * 6} fill="#cfefff" opacity={0.35 * (1 - ph)} />;
          })}
        </g>
      )}
    </g>
  );
};

export const Submersible: React.FC<{p: SubPose; uid: string}> = ({p, uid}) => {
  const dir = p.dir ?? 1;
  const L = clamp(p.lights ?? 0);
  const dark = clamp(p.dark ?? 0);
  const arm = clamp(p.arm ?? 0);
  const id = `sub-${uid}`;
  const bob = Math.sin(p.t * 0.8) * 3;
  // brazo manipulador: hombro bajo la esfera, codo y pinza
  const sh = {x: 170, y: 120};
  const a1 = lerp(1.9, 0.5, arm) + Math.sin(p.t * 0.7) * 0.05 * arm;
  const el = {x: sh.x + Math.cos(a1) * 90, y: sh.y + Math.sin(a1) * 90};
  const a2 = a1 - lerp(2.4, 0.4, arm);
  const wr = {x: el.x + Math.cos(a2) * 80, y: el.y + Math.sin(a2) * 80};
  const grip = 0.25 + 0.2 * Math.sin(p.t * 1.3) * arm;
  return (
    <g transform={`translate(${f1(p.x)} ${f1(p.y + bob)}) rotate(${f1(((p.tilt ?? 0) * 180) / Math.PI)}) scale(${dir * p.s} ${p.s})`}>
      <defs>
        <linearGradient id={`${id}-hull`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#e6ecf0" />
          <stop offset="1" stopColor="#9aa6b0" />
        </linearGradient>
        <linearGradient id={`${id}-acc`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb63a" />
          <stop offset="1" stopColor="#d8741a" />
        </linearGradient>
        <radialGradient id={`${id}-ti`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#e8eef2" />
          <stop offset="0.5" stopColor="#8a98a4" />
          <stop offset="1" stopColor="#3a444e" />
        </radialGradient>
        <radialGradient id={`${id}-port`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#bff0ff" />
          <stop offset="0.6" stopColor="#2a6a8a" />
          <stop offset="1" stopColor="#0a1a26" />
        </radialGradient>
        <radialGradient id={`${id}-led`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.4" stopColor="#dff6ff" stopOpacity={0.8} />
          <stop offset="1" stopColor="#9fe0ff" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* sombra difusa propia */}
      <ellipse cx={20} cy={170} rx={300} ry={30} fill="#000" opacity={0.18 * (1 - dark)} />
      {/* patines y lastres */}
      <path d="M-260 150L280 150" stroke="#3a424a" strokeWidth={10} strokeLinecap="round" />
      {[-180, 200].map((x) => <path key={x} d={`M${x} 92L${x - 14} 150M${x + 30} 92L${x + 44} 150`} stroke="#4a545e" strokeWidth={7} />)}
      <rect x={-120} y={124} width={70} height={30} rx={5} fill="#5a6470" stroke="#1e2428" strokeWidth={2} />
      <rect x={-40} y={124} width={70} height={30} rx={5} fill="#5a6470" stroke="#1e2428" strokeWidth={2} />
      {/* cesta de muestras */}
      <rect x={60} y={100} width={90} height={40} rx={4} fill="none" stroke="#c8ccd0" strokeWidth={3} />
      {[75, 95, 115, 135].map((x) => <line key={x} x1={x} y1={100} x2={x} y2={140} stroke="#c8ccd0" strokeWidth={1.5} opacity={0.7} />)}
      {[70, 100].map((x, i) => <rect key={x} x={x} y={108} width={12} height={30} rx={4} fill={i ? '#4ab0c8' : '#e8c060'} opacity={0.8} />)}
      {/* propulsores (traseros y verticales) */}
      <Thruster x={-330} y={-20} w={90} h={56} t={p.t} th={p.thrustH ?? 0.3} />
      <Thruster x={-330} y={60} w={90} h={56} t={p.t + 1} th={p.thrustH ?? 0.3} />
      <Thruster x={-150} y={-118} w={56} h={46} t={p.t + 2} th={p.thrustV ?? 0} vertical />
      <Thruster x={140} y={-118} w={56} h={46} t={p.t + 3} th={p.thrustV ?? 0} vertical />
      {/* cuerpo de espuma sintáctica */}
      <path d="M-300 -70C-300 -112 -250 -120 -180 -120L210 -120C290 -120 330 -90 340 -40L344 40C340 82 300 96 240 96L-230 96C-290 96 -300 70 -300 40Z" fill={`url(#${id}-hull)`} stroke="#5a6672" strokeWidth={3} />
      <path d="M-300 -10L344 -10" stroke="#c8d0d6" strokeWidth={2} opacity={0.8} />
      <path d="M-290 -96C-200 -108 150 -110 300 -96" stroke="#ffffff" strokeWidth={6} opacity={0.8} />
      {/* franja de acento y rótulos (ficticios) */}
      <path d="M-300 20L344 20L344 46L-300 46Z" fill={`url(#${id}-acc)`} opacity={0.95} />
      <text x={-150} y={40} fill="#1a1e22" fontWeight={900} fontSize={20} fontFamily="Montserrat" letterSpacing={3}>MI-01 · ABISMO</text>
      {/* paneles y tornillería */}
      {[-240, -120, 0, 120].map((x) => <rect key={x} x={x} y={-92} width={96} height={64} rx={6} fill="none" stroke="#a8b4bc" strokeWidth={1.5} />)}
      {Array.from({length: 14}, (_, i) => <circle key={i} cx={-280 + i * 44} cy={-112} r={2.4} fill="#7a8690" />)}
      {/* mástil con baliza, antena y luz estroboscópica */}
      <path d="M-60 -120L-60 -170M-40 -120L-30 -190" stroke="#4a545e" strokeWidth={5} />
      <circle cx={-30} cy={-194} r={7} fill={Math.sin(p.t * 4) > 0.85 ? '#ffffff' : '#ff6a4a'} />
      <rect x={-80} y={-182} width={40} height={14} rx={4} fill="#ffb63a" />
      {/* esfera de presión de titanio con miradores */}
      <circle cx={250} cy={30} r={86} fill={`url(#${id}-ti)`} stroke="#2a323a" strokeWidth={3} />
      <circle cx={250} cy={30} r={86} fill="none" stroke="#c8d2da" strokeWidth={2} strokeDasharray="4 10" opacity={0.6} />
      <circle cx={298} cy={34} r={26} fill={`url(#${id}-port)`} stroke="#1a2228" strokeWidth={4} />
      <circle cx={250} cy={82} r={16} fill={`url(#${id}-port)`} stroke="#1a2228" strokeWidth={3} />
      <circle cx={290} cy={-16} r={12} fill={`url(#${id}-port)`} stroke="#1a2228" strokeWidth={3} />
      <circle cx={292} cy={26} r={6} fill="#ffffff" opacity={0.7} />
      {/* luz interior cálida en la mirilla */}
      <circle cx={298} cy={34} r={16} fill="#ffd890" opacity={0.25 + 0.35 * dark} />
      {/* barra de focos y cámaras */}
      <rect x={316} y={-58} width={30} height={100} rx={8} fill="#2a3038" stroke="#0e1216" strokeWidth={2} />
      {[-44, -14, 16].map((y) => <circle key={y} cx={340} cy={y + 2} r={8} fill={L > 0.05 ? '#ffffff' : '#7a8690'} />)}
      <rect x={210} y={98} width={46} height={24} rx={6} fill="#2a3038" />
      <circle cx={252} cy={110} r={7} fill={L > 0.05 ? '#ffffff' : '#7a8690'} />
      <rect x={-70} y={100} width={40} height={22} rx={6} fill="#2a3038" />
      <circle cx={-36} cy={112} r={6} fill={L > 0.05 ? '#ffffff' : '#7a8690'} />
      {/* cámara 4K en carcasa y sensores (CTD) */}
      <rect x={300} y={-104} width={54} height={30} rx={8} fill="#1e2428" />
      <circle cx={354} cy={-89} r={10} fill="#0a1a26" stroke="#5a6470" strokeWidth={3} />
      <circle cx={356} cy={-92} r={3} fill="#9fe0ff" />
      <path d="M-230 96L-230 130M-210 96L-210 124" stroke="#c8ccd0" strokeWidth={6} strokeLinecap="round" />
      <rect x={-244} y={124} width={50} height={12} rx={5} fill="#3ab0c8" />
      {/* brazo manipulador */}
      <path d={`M${sh.x} ${sh.y}L${f1(el.x)} ${f1(el.y)}L${f1(wr.x)} ${f1(wr.y)}`} stroke="#7a8690" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={`M${sh.x} ${sh.y}L${f1(el.x)} ${f1(el.y)}L${f1(wr.x)} ${f1(wr.y)}`} stroke="#c8d0d6" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.7} />
      {[el, sh].map((q, i) => <circle key={i} cx={f1(q.x)} cy={f1(q.y)} r={11} fill="#3a424a" stroke="#c8d0d6" strokeWidth={2} />)}
      {[-1, 1].map((sg) => <path key={sg} d={`M${f1(wr.x)} ${f1(wr.y)}l${f1(Math.cos(a2 + sg * grip) * 30)} ${f1(Math.sin(a2 + sg * grip) * 30)}l${f1(Math.cos(a2 - sg * 0.6) * 14)} ${f1(Math.sin(a2 - sg * 0.6) * 14)}`} stroke="#5a6470" strokeWidth={7} fill="none" strokeLinecap="round" />)}
      {/* láser de escaneo (SCANNING) */}
      {(p.scan ?? 0) > 0.01 && <path d={`M346 40L${f1(900)} ${f1(220 + Math.sin(p.t * 1.5) * 160)}`} stroke="#5aff9a" strokeWidth={2} opacity={0.6 * (p.scan ?? 0)} />}
      {/* oscurecimiento por profundidad (sin luz solar) */}
      <path d="M-300 -70C-300 -112 -250 -120 -180 -120L210 -120C290 -120 330 -90 340 -40L344 40C340 82 300 96 240 96L-230 96C-290 96 -300 70 -300 40Z" fill="#02060c" opacity={0.55 * dark} />
      <circle cx={250} cy={30} r={86} fill="#02060c" opacity={0.45 * dark} />
      {/* halos de los LED (se dibujan al final, delante) */}
      {L > 0.05 && [-44, -14, 16].map((y) => <circle key={`h${y}`} cx={342} cy={y + 2} r={26} fill={`url(#${id}-led)`} opacity={L} />)}
      {L > 0.05 && [{x: 252, y: 110}, {x: -36, y: 112}].map((q, i) => <circle key={`hh${i}`} cx={q.x} cy={q.y} r={20} fill={`url(#${id}-led)`} opacity={L} />)}
    </g>
  );
};
