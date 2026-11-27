// INSECTOS (presas) y HOJA-POSADERO.
// Insecto: mosca, escarabajo o grillo pequeños (tamaño coherente con el pez). Estados: posado (patas
// apoyadas, alas plegadas, pequeños movimientos), golpeado (sacudida), cayendo (gira, patas y alas
// desordenadas), en el agua (patalea, ondas) y volando (alas en batido rápido).
// Hoja: cuelga de su pecíolo; oscila con el viento y, al recibir el chorro, con una oscilación
// amortiguada. `perchPoint` devuelve dónde está el insecto sobre la hoja en cada instante.
import React from 'react';
import {clamp} from '../../../engine/math';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
type V = {x: number; y: number};

export type InsectKind = 'fly' | 'beetle' | 'cricket';
export type InsectState = 'perched' | 'hit' | 'falling' | 'water' | 'flying';

export const Insect: React.FC<{x: number; y: number; ang?: number; s?: number; t: number; kind?: InsectKind; state?: InsectState; opacity?: number}> = ({x, y, ang = 0, s = 1, t, kind = 'fly', state = 'perched', opacity = 1}) => {
  const flail = state === 'falling' || state === 'water' || state === 'hit' ? 1 : state === 'perched' ? 0.08 : 0.3;
  const legs = [-1, 0, 1].map((i) =>
    [1, -1].map((side) => {
      const ph = t * (state === 'falling' ? 22 : state === 'water' ? 16 : 4) + i * 1.3 + (side > 0 ? 0 : Math.PI);
      const sw = Math.sin(ph) * 5 * flail;
      return `M${i * 4},2 l${f1(i * 4 + sw)},${f1(6 + Math.cos(ph) * 2 * flail)} l${f1(i * 3 + sw * 0.5)},${f1(5)}`;
    }),
  ).flat();
  const wingOpen = state === 'flying' ? 0.5 + 0.5 * Math.sin(t * 90) : state === 'falling' ? 0.6 + 0.4 * Math.sin(t * 30) : state === 'hit' ? 0.7 : 0.05;
  const body = kind === 'beetle' ? '#3a5a2a' : kind === 'cricket' ? '#6a5a2a' : '#2a2a2a';
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((ang * 180) / Math.PI)}) scale(${f1(s)})`} opacity={opacity}>
      {/* alas (traslúcidas) */}
      {kind !== 'beetle' && [0, 1].map((k) => (
        <ellipse key={k} cx={-4} cy={-6 - wingOpen * 6} rx={kind === 'cricket' ? 14 : 11} ry={4 + wingOpen * 3} transform={`rotate(${f1((k ? -1 : 1) * (10 + wingOpen * 45))} -2 -2)`} fill="#dff4ff" opacity={state === 'flying' ? 0.35 : 0.55} stroke="#8aa8b8" strokeWidth={0.6} />
      ))}
      {kind === 'beetle' && wingOpen > 0.3 && <ellipse cx={-2} cy={-9} rx={12} ry={4} fill="#dff4ff" opacity={0.45} />}
      {legs.map((d, i) => <path key={i} d={d} stroke="#1a1410" strokeWidth={1.2} fill="none" strokeLinecap="round" />)}
      {kind === 'cricket' && <path d={`M-8,0 l-10,${f1(-8 + Math.sin(t * 6) * flail * 4)} l-4,12`} stroke="#4a3a1a" strokeWidth={2} fill="none" />}
      <ellipse cx={-6} cy={0} rx={kind === 'beetle' ? 9 : 8} ry={kind === 'beetle' ? 7 : 4.5} fill={body} />
      {kind === 'beetle' && <path d="M-15,0 L3,0" stroke="#1a2a12" strokeWidth={1} />}
      {kind === 'beetle' && <ellipse cx={-8} cy={-3} rx={5} ry={2} fill="#9ac878" opacity={0.5} />}
      <ellipse cx={4} cy={0} rx={4.5} ry={4} fill={body} />
      <circle cx={8} cy={-1} r={kind === 'fly' ? 3.2 : 2.2} fill={kind === 'fly' ? '#8a2a1a' : '#1a1410'} />
      <path d={`M9,-2 q6,-6 ${f1(10 + Math.sin(t * 5) * 2)},-6 M9,-1 q6,-3 ${f1(11 + Math.cos(t * 5) * 2)},-1`} stroke="#1a1410" strokeWidth={0.8} fill="none" />
    </g>
  );
};

export type Perch = {pivot: V; len: number; base: number; seed: number; hitAt?: number; hitAmp?: number};

/** Ángulo de la hoja (viento + oscilación amortiguada tras el impacto). */
export function leafAngle(p: Perch, t: number) {
  const wind = Math.sin(t * 1.1 + p.seed) * 0.05 + Math.sin(t * 2.7 + p.seed * 2) * 0.02;
  let hit = 0;
  if (p.hitAt !== undefined && t > p.hitAt) {
    const a = t - p.hitAt;
    hit = (p.hitAmp ?? 0.5) * Math.exp(-a * 2.6) * Math.sin(a * 13);
  }
  return p.base + wind + hit;
}

/** Punto del haz de la hoja (fracción u del nervio central) donde se posa el insecto. */
export function perchPoint(p: Perch, t: number, u = 0.58) {
  const a = leafAngle(p, t);
  const c = {x: p.pivot.x + Math.cos(a) * p.len * u, y: p.pivot.y + Math.sin(a) * p.len * u};
  const n = Math.cos(a) >= 0 ? {x: Math.sin(a), y: -Math.cos(a)} : {x: -Math.sin(a), y: Math.cos(a)}; // normal hacia arriba del haz
  return {x: c.x + n.x * 6, y: c.y + n.y * 6, ang: a};
}

export const PerchLeaf: React.FC<{p: Perch; t: number; c?: string; wet?: number}> = ({p, t, c = '#3a8a3a', wet = 0}) => {
  const a = leafAngle(p, t);
  const L = p.len;
  const W = L * 0.32;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const Q = (u: number, v: number) => ({x: p.pivot.x + ca * L * u - sa * v, y: p.pivot.y + sa * L * u + ca * v});
  const tip = Q(1, 0);
  const l1 = Q(0.45, -W);
  const l2 = Q(0.45, W);
  const s0 = Q(0.08, 0);
  const veins = [0.25, 0.4, 0.55, 0.7, 0.85].flatMap((u) => [[Q(u, 0), Q(u + 0.12, -W * 0.7 * Math.sin(Math.PI * u))], [Q(u, 0), Q(u + 0.12, W * 0.7 * Math.sin(Math.PI * u))]]);
  return (
    <g>
      <path d={`M${f1(p.pivot.x)},${f1(p.pivot.y)} L${f1(s0.x)},${f1(s0.y)}`} stroke="#4a3a1a" strokeWidth={3} />
      <path d={`M${f1(s0.x)},${f1(s0.y)} Q${f1(l1.x)},${f1(l1.y)} ${f1(tip.x)},${f1(tip.y)} Q${f1(l2.x)},${f1(l2.y)} ${f1(s0.x)},${f1(s0.y)}Z`} fill={c} stroke="#1e4a1e" strokeWidth={1.2} />
      <path d={`M${f1(s0.x)},${f1(s0.y)} L${f1(tip.x)},${f1(tip.y)}`} stroke="#9ad878" strokeWidth={1.4} opacity={0.7} />
      {veins.map(([u, v], i) => <path key={i} d={`M${f1(u.x)},${f1(u.y)} L${f1(v.x)},${f1(v.y)}`} stroke="#7ac060" strokeWidth={0.8} opacity={0.5} />)}
      {/* gotas sobre la hoja (más tras el impacto) */}
      {[0.3, 0.5, 0.72].map((u, i) => {
        const q = Q(u, (i % 2 ? 1 : -1) * W * 0.3);
        return <circle key={`g${i}`} cx={q.x} cy={q.y} r={2 + clamp(wet) * 2} fill="#eafcff" opacity={0.5 + 0.4 * clamp(wet)} />;
      })}
    </g>
  );
};

/** Ondas concéntricas en la superficie (y = 0). */
export const Ripples: React.FC<{x: number; t: number; t0: number; n?: number; big?: number}> = ({x, t, t0, n = 3, big = 1}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const a = t - t0 - i * 0.35;
      if (a < 0 || a > 2.4) return null;
      return <ellipse key={i} cx={x} cy={0} rx={(14 + a * 120) * big} ry={(3 + a * 9) * big} fill="none" stroke="#f4ffff" strokeWidth={2} opacity={0.8 * (1 - a / 2.4)} />;
    })}
  </g>
);
