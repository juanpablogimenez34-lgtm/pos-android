// PERSONAJE — PEZ ARQUERO (Toxotes jaculatrix), ilustración original en vista lateral.
// Cuerpo alto y comprimido lateralmente, perfil dorsal casi recto desde el hocico puntiagudo hasta la
// aleta dorsal (retrasada), boca grande y oblicua orientada hacia arriba con la mandíbula inferior
// prominente, ojo grande situado alto (mira hacia la superficie), coloración plateada con dorso
// amarillento y cuatro o cinco bandas oscuras en cuña en los costados; aletas dorsal y anal con borde
// oscuro, caudal truncada, pectorales móviles. Escamas como textura de arcos.
//
// Movimiento: oscilación sutil del cuerpo (curvatura), aleta caudal que bate en escorzo (en vista
// lateral la cola se mueve hacia y desde la cámara), pectorales que aletean, aletas dorsal/anal con
// onda, mirada que sigue un objetivo, boca que se prepara y "anticipación" (compresión) antes del disparo.
import React from 'react';
import {clamp, lerp} from '../../../engine/math';
import {closedSpline} from '../../../lifecycle/stages';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export type ArcherLook = {
  t: number;
  swim?: number; // 0…1 intensidad de natación
  freq?: number; // Hz del batido
  mouth?: number; // 0…1 apertura (preparación / disparo)
  lookAt?: {x: number; y: number}; // objetivo en coordenadas LOCALES del pez (para la pupila)
  squeeze?: number; // 0…1 compresión de opérculos (anticipación del disparo)
  tone?: number; // 0 normal … 1 apagado (pez secundario lejano)
  hue?: number; // variación de color (pez competidor)
};

// perfil dorsal y ventral (x de hocico a pedúnculo), en unidades locales; longitud ≈ 230
const TOP = [{x: 112, y: -5}, {x: 84, y: -20}, {x: 48, y: -40}, {x: 8, y: -58}, {x: -30, y: -62}, {x: -62, y: -50}, {x: -88, y: -28}, {x: -100, y: -15}];
const BOT = [{x: 104, y: 8}, {x: 82, y: 24}, {x: 48, y: 44}, {x: 8, y: 58}, {x: -30, y: 56}, {x: -62, y: 42}, {x: -88, y: 24}, {x: -100, y: 13}];
const BANDS = [{x: 52, w: 14, top: -40, h: 0.55}, {x: 14, w: 18, top: -56, h: 0.6}, {x: -24, w: 18, top: -62, h: 0.55}, {x: -60, w: 16, top: -50, h: 0.62}, {x: -92, w: 9, top: -22, h: 0.75}];
const SCALES = Array.from({length: 120}, (_, i) => ({x: -95 + (i % 15) * 13 + (Math.floor(i / 15) % 2) * 6.5, y: -48 + Math.floor(i / 15) * 13}));

export const ArcherFish: React.FC<{look: ArcherLook; uid: string; x: number; y: number; scale?: number; dir?: 1 | -1; angle?: number}> = ({look, uid, x, y, scale = 1, dir = 1, angle = 0}) => {
  const t = look.t;
  const swim = look.swim ?? 0.6;
  const fq = look.freq ?? 2.4;
  const ph = t * fq * Math.PI * 2;
  const sq = clamp(look.squeeze ?? 0);
  const mo = clamp(look.mouth ?? 0);
  const tone = look.tone ?? 0;
  // curvatura sutil del cuerpo: desplaza los puntos traseros en vertical (onda de natación vista de lado)
  const bend = (px: number) => Math.sin(ph - (112 - px) / 90) * 3.5 * swim * Math.pow(clamp((112 - px) / 212), 1.5);
  const P = (p: {x: number; y: number}, k: number) => ({x: p.x, y: p.y * k + bend(p.x)});
  const kTop = 1 - 0.06 * sq;
  const kBot = 1 - 0.1 * sq;
  const top = TOP.map((p) => P(p, kTop));
  const bot = BOT.map((p) => P(p, kBot));
  // boca: mandíbula inferior que baja al abrirse
  const jaw = {x: 106 - mo * 4, y: 10 + mo * 12};
  const body = closedSpline([{x: 116, y: -2}, ...top, ...[...bot].reverse(), jaw], 1);
  const ped = {x: -100, y: bend(-100)};
  // aleta caudal en escorzo: el ancho aparente oscila con el batido
  const tw = 0.55 + 0.45 * Math.abs(Math.cos(ph * 0.5));
  const tb = Math.sin(ph * 0.5) * 5 * swim;
  const tail = `M${f1(ped.x + 4)},${f1(ped.y - 14)} L${f1(ped.x - 44 * tw)},${f1(ped.y - 40 + tb)} Q${f1(ped.x - 36 * tw)},${f1(ped.y + tb)} ${f1(ped.x - 44 * tw)},${f1(ped.y + 40 + tb)} L${f1(ped.x + 4)},${f1(ped.y + 14)}Z`;
  const dw = (k: number) => Math.sin(ph * 1.2 + k) * 4 * swim;
  const dorsal = `M-22,${f1(top[4].y + 2)} Q-40,${f1(-92 + dw(0))} -66,${f1(-82 + dw(1))} Q-86,${f1(-62 + dw(2))} -92,${f1(top[6].y + 4)}Z`;
  const anal = `M-18,${f1(bot[4].y - 2)} Q-36,${f1(92 + dw(1))} -64,${f1(84 + dw(2))} Q-86,${f1(62 + dw(3))} -92,${f1(bot[6].y - 4)}Z`;
  const pf = Math.sin(ph * 1.5) * 0.5 * (0.4 + swim);
  const pect = (s: number) => `M50,8 Q${f1(34 - Math.cos(pf) * 14 * s)},${f1(18 + Math.sin(pf) * 14)} ${f1(24 - 6 * s)},${f1(26 + Math.sin(pf) * 18)} Q34,20 50,14Z`;
  const eye = {x: 66, y: -22};
  const L = look.lookAt ? Math.atan2(look.lookAt.y - eye.y, look.lookAt.x - eye.x) : 0;
  const pup = look.lookAt ? {x: Math.cos(L) * 4.5, y: Math.sin(L) * 4.5} : {x: 2, y: 0};
  const back = lerp(0, 1, tone);
  const yellow = look.hue ? '#a8b070' : '#c8b45a';
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((angle * 180) / Math.PI)}) scale(${f1(scale * dir)} ${f1(scale)})`} opacity={1 - 0.35 * back}>
      <defs>
        <linearGradient id={`af-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={yellow} />
          <stop offset="0.3" stopColor="#d8d8b8" />
          <stop offset="0.55" stopColor="#e8eee8" />
          <stop offset="1" stopColor="#fafcf4" />
        </linearGradient>
        <radialGradient id={`afv-${uid}`} cx="0.45" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.35} />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="0.9" stopColor="#202818" stopOpacity={0.18} />
          <stop offset="1" stopColor="#202818" stopOpacity={0.45} />
        </radialGradient>
        <clipPath id={`afc-${uid}`}>
          <path d={body} />
        </clipPath>
      </defs>
      <path d={tail} fill="#c8c08a" opacity={0.9} stroke="#5a5430" strokeWidth={1.4} />
      {[-2, -1, 0, 1, 2].map((k) => <path key={`tr${k}`} d={`M${f1(ped.x)},${f1(ped.y + k * 5)} L${f1(ped.x - 42 * tw)},${f1(ped.y + k * 16 + tb)}`} stroke="#7a7240" strokeWidth={1} opacity={0.5} />)}
      <path d={dorsal} fill="#c8b870" stroke="#2a2614" strokeWidth={1.4} />
      <path d={`M-40,${f1(-90 + dw(0))} Q-60,${f1(-86 + dw(1))} -70,${f1(-80 + dw(1))}`} stroke="#1a1a10" strokeWidth={4} fill="none" opacity={0.7} />
      <path d={anal} fill="#d8c880" stroke="#2a2614" strokeWidth={1.4} />
      <path d={`M-38,${f1(88 + dw(1))} Q-58,${f1(86 + dw(2))} -70,${f1(80 + dw(2))}`} stroke="#1a1a10" strokeWidth={4} fill="none" opacity={0.7} />
      <path d={pect(0.7)} fill="#d8d0a0" opacity={0.5} />
      <path d={body} fill={`url(#af-${uid})`} />
      <g clipPath={`url(#afc-${uid})`}>
        {SCALES.map((s, i) => <path key={`s${i}`} d={`M${f1(s.x - 5)},${f1(s.y + bend(s.x))} q5,5 10,0`} stroke="#7a8070" strokeWidth={0.9} fill="none" opacity={0.35} />)}
        {BANDS.map((b, i) => (
          <path key={`b${i}`} d={`M${f1(b.x - b.w / 2)},${f1(b.top - 10 + bend(b.x))} L${f1(b.x + b.w / 2)},${f1(b.top - 10 + bend(b.x))} L${f1(b.x + b.w * 0.15)},${f1(b.top + (-b.top + 40) * b.h + bend(b.x))} L${f1(b.x - b.w * 0.25)},${f1(b.top + (-b.top + 40) * b.h + bend(b.x))}Z`} fill="#141410" opacity={0.85 - 0.3 * tone} />
        ))}
        {Array.from({length: 7}, (_, i) => <path key={`lt${i}`} d={`M${f1(100 - i * 28)},${f1(-4 + bend(100 - i * 28) - i * 1.5)} l-20,-1`} stroke="#ffffff" strokeWidth={2} opacity={0.35} />)}
        <path d={`M100,${f1(10 + bend(100))} C60,${f1(30)} 0,${f1(36)} -90,${f1(16)}`} stroke="#ffffff" strokeWidth={6} opacity={0.18} fill="none" />
        <path d={body} fill={`url(#afv-${uid})`} />
      </g>
      <path d={body} fill="none" stroke="#2a2a1a" strokeWidth={1.8} />
      {/* opérculo (se comprime en la anticipación) */}
      <path d={`M${f1(44 - sq * 4)},-28 Q${f1(30 - sq * 6)},4 ${f1(44 - sq * 4)},34`} stroke="#5a5a40" strokeWidth={2} fill="none" />
      {/* boca grande y oblicua con mandíbula prominente */}
      <path d={`M116,-2 L${f1(jaw.x)},${f1(jaw.y)} L${f1(88 - mo * 4)},${f1(12 + mo * 4)}`} stroke="#2a2014" strokeWidth={2.4} fill="none" strokeLinejoin="round" />
      {mo > 0.05 && <path d={`M115,-1 L${f1(jaw.x - 1)},${f1(jaw.y - 1)} L${f1(96 - mo * 6)},${f1(6 + mo * 4)}Z`} fill="#3a1a14" opacity={0.85} />}
      {/* ojo grande, alto; la pupila sigue el objetivo */}
      <circle cx={eye.x} cy={eye.y} r={14} fill="#e8d878" stroke="#2a2a1a" strokeWidth={1.6} />
      <circle cx={eye.x + pup.x} cy={eye.y + pup.y} r={8} fill="#060806" />
      <circle cx={eye.x - 4} cy={eye.y - 5} r={3} fill="#ffffff" opacity={0.9} />
      <path d={pect(1)} fill="#e0d8a8" opacity={0.85} stroke="#5a5430" strokeWidth={1} />
    </g>
  );
};

/** Punto de la boca (salida del chorro) en coordenadas de mundo, para una pose dada. */
export function archerMouth(x: number, y: number, angle: number, scale = 1, dir: 1 | -1 = 1) {
  const lx = 116 * scale * dir;
  const ly = -2 * scale;
  return {x: x + Math.cos(angle) * lx - Math.sin(angle) * ly, y: y + Math.sin(angle) * lx + Math.cos(angle) * ly};
}
