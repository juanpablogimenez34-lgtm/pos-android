// RIG FACIAL: ojos con párpados superior e inferior, iris con anillo y dos brillos, cejas,
// modos (normal, feliz, muy abiertos, entrecerrados, cerrados) y bocas de animal (hocico en
// "w", boca abierta con mandíbula, risa, bostezo, "o").
import React from 'react';
import {clamp, mixColor} from '../../../engine/math';
import {f1, Vec} from './core';

export type EyeMode = 'normal' | 'happy' | 'wide' | 'half' | 'closed';
export type Face = {
  blink: number; // 0–1
  look: Vec; // −1…1
  mode: EyeMode;
  browL: number; // −1 enfado · 0 · 1 sorpresa
  browR: number;
  jaw: number; // 0 cerrada · 1 muy abierta
  smile: number; // −1 triste · 0 · 1 sonrisa
  cheeks: number;
  sparkle: number; // brillo extra en los ojos (0–1)
};
export const FACE: Face = {blink: 0, look: {x: 0, y: 0}, mode: 'normal', browL: 0, browR: 0, jaw: 0, smile: 0.6, cheeks: 0.3, sparkle: 0};

export const Eye: React.FC<{c: Vec; rx: number; ry: number; iris: string; f: Face; brow: number; lid: string; outline: string; side: 1 | -1; uid: string; tilt?: number}> = ({c, rx, ry, iris, f, brow, lid, outline, side, uid, tilt = 0}) => {
  const mode = f.mode;
  const by = c.y - ry * (1.32 + 0.3 * brow);
  const inner = side > 0 ? -1 : 1; // lado interior (hacia el hocico)
  const browPath = `M${f1(c.x - rx * 0.8)},${f1(by + (brow < 0 ? -inner * brow * ry * 0.35 : 0))} Q${f1(c.x)},${f1(by - ry * (0.28 + 0.15 * brow))} ${f1(c.x + rx * 0.8)},${f1(by + (brow < 0 ? inner * brow * ry * 0.35 : 0))}`;
  const Brow = <path d={browPath} stroke={outline} strokeWidth={Math.max(2.5, ry * 0.2)} fill="none" strokeLinecap="round" />;
  const closed = mode === 'closed' || mode === 'happy' || f.blink > 0.93;
  if (closed) {
    const up = mode === 'happy';
    return (
      <g transform={`rotate(${f1(tilt)} ${f1(c.x)} ${f1(c.y)})`}>
        <path d={`M${f1(c.x - rx * 0.85)},${f1(c.y + (up ? ry * 0.2 : 0))} Q${f1(c.x)},${f1(c.y + (up ? -ry * 0.75 : ry * 0.4))} ${f1(c.x + rx * 0.85)},${f1(c.y + (up ? ry * 0.2 : 0))}`} stroke={outline} strokeWidth={Math.max(3, ry * 0.2)} fill="none" strokeLinecap="round" />
        {Brow}
      </g>
    );
  }
  const k = mode === 'wide' ? 1.12 : 1;
  const RX = rx * k;
  const RY = ry * k;
  const ir = Math.min(RX, RY) * (mode === 'wide' ? 0.6 : 0.7);
  const ix = c.x + f.look.x * RX * 0.32;
  const iy = c.y + f.look.y * RY * 0.3;
  const top = Math.max(f.blink, mode === 'half' ? 0.5 : 0);
  const id = `eye${uid}${side}`;
  return (
    <g transform={`rotate(${f1(tilt)} ${f1(c.x)} ${f1(c.y)})`}>
      <defs>
        <clipPath id={id}>
          <ellipse cx={c.x} cy={c.y} rx={RX} ry={RY} />
        </clipPath>
        <radialGradient id={`${id}i`} cx="0.5" cy="0.32" r="0.65">
          <stop offset="0" stopColor={mixColor(iris, '#ffffff', 0.35)} />
          <stop offset="0.6" stopColor={iris} />
          <stop offset="1" stopColor={mixColor(iris, '#2a1408', 0.5)} />
        </radialGradient>
      </defs>
      <ellipse cx={c.x} cy={c.y} rx={RX} ry={RY} fill="#ffffff" stroke={outline} strokeWidth={Math.max(2.5, RY * 0.14)} />
      <g clipPath={`url(#${id})`}>
        <ellipse cx={c.x} cy={c.y + RY * 0.6} rx={RX} ry={RY * 0.5} fill="#e6e0f0" />
        <circle cx={ix} cy={iy} r={ir} fill={`url(#${id}i)`} />
        <circle cx={ix} cy={iy} r={ir * 0.94} fill="none" stroke={mixColor(iris, '#2a1408', 0.6)} strokeWidth={ir * 0.1} />
        <circle cx={ix} cy={iy} r={ir * 0.48} fill="#140a0a" />
        <circle cx={ix - ir * 0.36} cy={iy - ir * 0.4} r={ir * (0.3 + 0.08 * f.sparkle)} fill="#ffffff" />
        <circle cx={ix + ir * 0.34} cy={iy + ir * 0.3} r={ir * 0.13} fill="#ffffff" opacity={0.9} />
        {f.sparkle > 0.05 && <path transform={`translate(${f1(ix + ir * 0.1)} ${f1(iy - ir * 0.15)}) scale(${f1(ir * 0.03 * f.sparkle)})`} d="M0,-10 L2,-2 L10,0 L2,2 L0,10 L-2,2 L-10,0 L-2,-2Z" fill="#ffffff" />}
        {/* párpado superior y línea */}
        <rect x={c.x - RX * 1.3} y={c.y - RY * 1.3} width={RX * 2.6} height={RY * 2.6 * top} fill={lid} />
        {top > 0.03 && <path d={`M${f1(c.x - RX * 1.1)},${f1(c.y - RY * 1.3 + RY * 2.6 * top)} L${f1(c.x + RX * 1.1)},${f1(c.y - RY * 1.3 + RY * 2.6 * top)}`} stroke={outline} strokeWidth={3} />}
        {/* párpado inferior al sonreír (ojos que sonríen) */}
        {f.smile > 0.7 && <ellipse cx={c.x} cy={c.y + RY * 1.35} rx={RX * 1.2} ry={RY * 0.6 * clamp((f.smile - 0.7) / 0.3)} fill={lid} />}
      </g>
      {Brow}
    </g>
  );
};

/** Boca de lobo/conejo vista de 3/4. `c` = base del hocico; `w` = ancho. */
export const AnimalMouth: React.FC<{c: Vec; w: number; f: Face; outline: string; tongue?: string; teeth?: boolean}> = ({c, w, f, outline, tongue = '#ff7a96', teeth = true}) => {
  const j = clamp(f.jaw);
  const sm = f.smile;
  if (j < 0.06) {
    const up = sm * w * 0.25;
    return <path d={`M${f1(c.x - w * 0.5)},${f1(c.y - up)} Q${f1(c.x - w * 0.25)},${f1(c.y + w * 0.22)} ${f1(c.x)},${f1(c.y)} Q${f1(c.x + w * 0.25)},${f1(c.y + w * 0.22)} ${f1(c.x + w * 0.5)},${f1(c.y - up)}`} stroke={outline} strokeWidth={Math.max(2.5, w * 0.1)} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  }
  const h = w * (0.2 + 0.75 * j);
  const ww = w * (0.48 + 0.1 * sm);
  return (
    <g>
      <path d={`M${f1(c.x - ww)},${f1(c.y - sm * w * 0.15)} Q${f1(c.x)},${f1(c.y + w * 0.08)} ${f1(c.x + ww)},${f1(c.y - sm * w * 0.15)} Q${f1(c.x + ww * 0.8)},${f1(c.y + h)} ${f1(c.x)},${f1(c.y + h)} Q${f1(c.x - ww * 0.8)},${f1(c.y + h)} ${f1(c.x - ww)},${f1(c.y - sm * w * 0.15)}Z`} fill="#6a1e30" stroke={outline} strokeWidth={Math.max(2.5, w * 0.09)} strokeLinejoin="round" />
      <ellipse cx={c.x} cy={c.y + h * 0.72} rx={ww * 0.5} ry={h * 0.3} fill={tongue} />
      {teeth && <path d={`M${f1(c.x - ww * 0.55)},${f1(c.y + 1)} l${f1(w * 0.08)},${f1(w * 0.1)} l${f1(w * 0.08)},${f1(-w * 0.1)} M${f1(c.x + ww * 0.55)},${f1(c.y + 1)} l${f1(-w * 0.08)},${f1(w * 0.1)} l${f1(-w * 0.08)},${f1(-w * 0.1)}`} fill="#ffffff" stroke="#ffffff" strokeWidth={1.5} />}
    </g>
  );
};
