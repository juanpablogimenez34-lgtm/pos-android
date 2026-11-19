// Ave con rig "3D ligero" proyectado ortográficamente a 2D (sin Three.js).
// Marco del cuerpo: x hacia delante, y arriba, z a la derecha del ave.
// Mundo: X derecha, Y arriba, Z hacia la cámara. Pantalla = (X, −Y).
// Volúmenes: elipsoides (cuerpo, cuello) y esfera (cabeza) con silueta exacta;
// alas: planos articulados (húmero, antebrazo, mano) con primarias, secundarias y
// coberteras; cola en abanico; marcas (capucha, bigote, ojo, barreado) sobre la superficie.
// Todo es función pura de los parámetros.

import React from 'react';
import {clamp, lerp, mixColor, smoothPath, Vec} from '../../engine/math';

export type V3 = [number, number, number];
type M3 = [V3, V3, V3]; // filas

const mul = (m: M3, v: V3): V3 => [m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2], m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2], m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]];
const mm = (a: M3, b: M3): M3 => [0, 1, 2].map((i) => [0, 1, 2].map((j) => a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j])) as M3;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sc = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const Ry = (a: number): M3 => [[Math.cos(a), 0, Math.sin(a)], [0, 1, 0], [-Math.sin(a), 0, Math.cos(a)]];
const Rz = (a: number): M3 => [[Math.cos(a), -Math.sin(a), 0], [Math.sin(a), Math.cos(a), 0], [0, 0, 1]];
/** Envolvente convexa (cadena monótona). */
function hull(pts: Vec[]): Vec[] {
  const p = [...pts].sort((a, b) => a.x - b.x || a.y - b.y);
  const cr = (o: Vec, a: Vec, b: Vec) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lo: Vec[] = [];
  for (const q of p) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  const hi: Vec[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop();
    hi.push(q);
  }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}
const Rx = (a: number): M3 => [[1, 0, 0], [0, Math.cos(a), -Math.sin(a)], [0, Math.sin(a), Math.cos(a)]];

export type BirdSpec = {
  body: {a: number; b: number; c: number; x: number};
  neck: {a: number; b: number; c: number; x: number; y: number};
  head: {r: number; x: number; y: number};
  beak: number; // longitud relativa
  tail: {x: number; len: number; n: number; spreadMin: number; spreadMax: number; w: number};
  wing: {shoulder: V3; L1: number; L2: number; L3: number; sec: number; nSec: number; prim: number[]};
  colors: {
    back: string;
    belly: string;
    bar: string;
    hood: string;
    cheek: string;
    feather: string;
    featherTip: string;
    under: string;
    underBar: string;
    beak: string;
    cere: string;
    eyeRing: string;
    leg: string;
    talon: string;
    neckSheen?: string;
  };
  malar: boolean; // "bigote" característico del peregrino
  wingBars?: boolean; // barras alares negras (paloma)
};

/** Halcón peregrino adulto (Falco peregrinus): dorso gris pizarra, capucha y bigote negros,
 * mejillas y garganta blancas, pecho claro con barreado oscuro, cere y anillo ocular amarillos. */
export const PEREGRINE: BirdSpec = {
  body: {a: 46, b: 23, c: 21, x: 0},
  neck: {a: 18, b: 16, c: 15, x: 34, y: 8},
  head: {r: 18, x: 50, y: 12},
  beak: 1,
  tail: {x: -38, len: 62, n: 8, spreadMin: 0.22, spreadMax: 1.25, w: 11},
  wing: {shoulder: [16, 12, 15], L1: 32, L2: 46, L3: 42, sec: 42, nSec: 9, prim: [58, 66, 74, 82, 90, 96, 99, 98, 92, 82]},
  colors: {
    back: '#4f5f74',
    belly: '#f1ead8',
    bar: '#3a4250',
    hood: '#1f2530',
    cheek: '#f6f1e4',
    feather: '#465569',
    featherTip: '#232a35',
    under: '#d9d4c6',
    underBar: '#6a6f78',
    beak: '#3a4452',
    cere: '#f2c53d',
    eyeRing: '#f2c53d',
    leg: '#f2c53d',
    talon: '#14161a',
  },
  malar: true,
};

/** Paloma bravía (Columba livia): gris con cuello iridiscente y dos barras alares negras. */
export const PIGEON: BirdSpec = {
  body: {a: 40, b: 25, c: 23, x: 0},
  neck: {a: 17, b: 17, c: 15, x: 30, y: 12},
  head: {r: 14, x: 44, y: 18},
  beak: 0.55,
  tail: {x: -34, len: 50, n: 8, spreadMin: 0.3, spreadMax: 1.0, w: 9},
  wing: {shoulder: [14, 12, 15], L1: 26, L2: 36, L3: 34, sec: 38, nSec: 9, prim: [48, 54, 60, 64, 68, 70, 70, 66, 60, 52]},
  colors: {
    back: '#8d95a3',
    belly: '#9aa1ad',
    bar: '#2a2d33',
    hood: '#6a7280',
    cheek: '#8a92a0',
    feather: '#848c9a',
    featherTip: '#3a3f48',
    under: '#c9ced6',
    underBar: '#9aa1ad',
    beak: '#2a2a2a',
    cere: '#efe9e0',
    eyeRing: '#e46a3a',
    leg: '#d46a6a',
    talon: '#2a2a2a',
    neckSheen: '#5fa07a',
  },
  malar: false,
  wingBars: true,
};

export type BirdParams = {
  t: number;
  x: number;
  y: number; // pantalla/mundo (y hacia abajo)
  scale: number;
  yaw: number;
  pitch: number;
  roll: number;
  flap: number; // ángulo de las alas (rad, + arriba)
  fold: number; // 0 extendidas … 1 plegadas en reposo
  sweep: number; // 0 … 1 barridas hacia atrás (picada)
  tail: number; // 0 cerrada … 1 abierta
  tailPitch: number;
  legs: number; // 0 recogidas … 1 posadas/extendidas
  headYaw: number;
  headPitch: number;
  nict: number; // membrana nictitante 0–1
  silhouette: number; // 0 iluminado … 1 contraluz
  rim: string; // color de la luz de contorno
};

type Poly = {pts: Vec[]; fill: string; stroke?: string; sw?: number; z: number; op?: number};

export function birdPolys(spec: BirdSpec, p: BirdParams): {polys: Poly[]; head: Vec; headR: number; eye: Vec | null; forward: Vec} {
  const S = p.scale;
  const M = mm(mm(Ry(p.yaw), Rz(p.pitch)), Rx(p.roll));
  const W = (v: V3): V3 => mul(M, sc(v, S));
  const scr = (v: V3): Vec => {
    const w = W(v);
    return {x: p.x + w[0], y: p.y - w[1]};
  };
  const depth = (v: V3) => W(v)[2];
  const C = spec.colors;
  const sil = clamp(p.silhouette);
  const dark = '#17121c';
  const col = (c: string) => (sil > 0 ? mixColor(c, dark, sil * 0.92) : c);
  const polys: Poly[] = [];

  // ---------- elipsoides (silueta exacta por complemento de Schur) ----------
  const ellipsoid = (cx: number, cy: number, a: number, b: number, c: number, fillTop: string, fillBot: string, z: number, op?: number) => {
    const A = [0, 1, 2].map((i) => [0, 1, 2].map((j) => M[i][0] * M[j][0] / (a * a * S * S) + M[i][1] * M[j][1] / (b * b * S * S) + M[i][2] * M[j][2] / (c * c * S * S)));
    const b11 = A[0][0] - (A[0][2] * A[0][2]) / A[2][2];
    const b12 = A[0][1] - (A[0][2] * A[1][2]) / A[2][2];
    const b22 = A[1][1] - (A[1][2] * A[1][2]) / A[2][2];
    const tr = b11 + b22;
    const disc = Math.sqrt(Math.max(0, (b11 - b22) ** 2 + 4 * b12 * b12));
    const l1 = (tr - disc) / 2; // eje mayor
    const l2 = (tr + disc) / 2;
    const ang = Math.abs(b12) > 1e-9 ? Math.atan2(l1 - b11, b12) : b11 <= b22 ? 0 : Math.PI / 2;
    const r1 = 1 / Math.sqrt(Math.max(1e-9, l1));
    const r2 = 1 / Math.sqrt(Math.max(1e-9, l2));
    const ctr = scr([cx, cy, 0]);
    const pts: Vec[] = [];
    for (let k = 0; k < 28; k++) {
      const u = (k / 28) * Math.PI * 2;
      const ex = Math.cos(u) * r1;
      const ey = Math.sin(u) * r2;
      // en coordenadas de mundo (Y arriba) → pantalla
      const X = ex * Math.cos(ang) - ey * Math.sin(ang);
      const Y = ex * Math.sin(ang) + ey * Math.cos(ang);
      pts.push({x: ctr.x + X, y: ctr.y - Y});
    }
    polys.push({pts, fill: `grad:${col(fillTop)}:${col(fillBot)}`, z, stroke: col(mixColor(fillTop, '#000000', 0.16)), sw: 0.8, op});
  };
  const up = mul(M, [0, 1, 0]);
  // vista: si el dorso mira a la cámara todo es gris; si el vientre mira, todo claro
  const topC = mixColor(C.back, C.belly, clamp(-up[2] * 1.4));
  const botC = mixColor(C.belly, C.back, clamp(up[2] * 1.4));
  const bodyZ = depth([spec.body.x, 0, 0]);
  ellipsoid(spec.body.x, 0, spec.body.a, spec.body.b, spec.body.c, topC, botC, bodyZ);
  ellipsoid(spec.neck.x, spec.neck.y, spec.neck.a, spec.neck.b, spec.neck.c, topC, mixColor(botC, C.cheek, 0.5), bodyZ + 0.01);
  const gradDir: Vec = {x: up[0], y: -up[1]};
  // brillo suave del dorso (luz cenital)
  if (up[2] > -0.3) {
    const sheen = mixColor(topC, '#ffffff', 0.22);
    ellipsoid(spec.body.x + 4, spec.body.b * 0.45, spec.body.a * 0.72, spec.body.b * 0.38, spec.body.c * 0.66, sheen, topC, bodyZ + 0.015, 0.35);
  }

  // ---------- marcas del plumaje: "V" suaves en el pecho, festones en el dorso ----------
  for (let i = 0; i < 54; i++) {
    const row = Math.floor(i / 9);
    const s = -0.58 + (i % 9) * 0.13 + (row % 2) * 0.065;
    const phi = -Math.PI / 2 + ((row - 2.5) / 2.5) * 0.95;
    const k = Math.sqrt(Math.max(0, 1 - s * s));
    const pt: V3 = [spec.body.x + spec.body.a * s, spec.body.b * k * Math.sin(phi), spec.body.c * k * Math.cos(phi)];
    const n = mul(M, [pt[0] / spec.body.a ** 2, pt[1] / spec.body.b ** 2, pt[2] / spec.body.c ** 2]);
    const nl = Math.hypot(n[0], n[1], n[2]) || 1;
    const vis = n[2] / nl;
    if (vis < 0.2 || spec.wingBars) continue;
    const tg: V3 = [0, Math.cos(phi) * 3.2, -Math.sin(phi) * 3.2];
    const fw: V3 = [2.2, 0, 0];
    polys.push({pts: [scr(add(add(pt, tg), sc(fw, -1))), scr(pt), scr(add(add(pt, sc(tg, -1)), sc(fw, -1)))], fill: 'none', stroke: col(C.bar), sw: 1.25 * S, z: bodyZ + 0.02, op: 0.38 * vis * (0.6 + 0.4 * k)});
  }
  for (let i = 0; i < 24; i++) {
    const s = -0.55 + (i % 8) * 0.13;
    const phi = Math.PI / 2 + (Math.floor(i / 8) - 1) * 0.45;
    const k = Math.sqrt(Math.max(0, 1 - s * s));
    const pt: V3 = [spec.body.x + spec.body.a * s, spec.body.b * k * Math.sin(phi), spec.body.c * k * Math.cos(phi)];
    const n = mul(M, [pt[0] / spec.body.a ** 2, pt[1] / spec.body.b ** 2, pt[2] / spec.body.c ** 2]);
    const vis = n[2] / (Math.hypot(n[0], n[1], n[2]) || 1);
    if (vis < 0.15) continue;
    const tg: V3 = [0, Math.cos(phi) * 4, -Math.sin(phi) * 4];
    polys.push({pts: [scr(add(pt, tg)), scr(add(pt, [-3, 0, 0])), scr(add(pt, sc(tg, -1)))], fill: 'none', stroke: col(mixColor(C.back, '#ffffff', 0.25)), sw: 1 * S, z: bodyZ + 0.02, op: 0.3 * vis});
  }

  // ---------- cola: abanico redondeado con bandas y punta clara ----------
  const spread = lerp(spec.tail.spreadMin, spec.tail.spreadMax, clamp(p.tail));
  const tp = p.tailPitch;
  {
    const n = spec.tail.n;
    const base: V3 = [spec.tail.x, 4, 0];
    const dirs: V3[] = [];
    const lens: number[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / (n - 1) - 0.5) * spread;
      dirs.push([-Math.cos(a) * Math.cos(tp), -Math.sin(tp) * Math.cos(a), Math.sin(a)]);
      lens.push(spec.tail.len * (1 - Math.abs(i / (n - 1) - 0.5) * 0.12));
    }
    const vert = (i: number) => (i / (n - 1) - 0.5) * 16; // grosor visible de perfil (cuña)
    const at = (i: number, f: number): V3 => add(add(base, sc(dirs[i], lens[i] * f)), [0, vert(i) * f, 0]);
    const w = spec.tail.w;
    const sideA: V3 = add(base, [0, 7, -w * 0.5]);
    const sideB: V3 = add(base, [0, -6, w * 0.5]);
    const outline: Vec[] = [scr(sideA)];
    for (let i = 0; i < n; i++) {
      outline.push(scr(at(i, 1)));
      if (i < n - 1) {
        const m = add(sc(add(at(i, 1), at(i + 1, 1)), 0.5), sc(add(dirs[i], dirs[i + 1]), -lens[i] * 0.03));
        outline.push(scr(m));
      }
    }
    outline.push(scr(sideB));
    const tz = depth(at(Math.floor(n / 2), 0.5)) - 0.5;
    const tailUp = mul(M, [Math.sin(tp), Math.cos(tp), 0]);
    // de perfil la cola se ve gris (cara superior); sólo desde abajo se ve la cara clara
    const upper = tailUp[2] >= -0.35;
    const b0 = scr(base);
    const tipC = scr(at(Math.floor(n / 2), 1));
    const c1 = upper ? mixColor(C.feather, '#ffffff', 0.08) : C.under;
    const c2 = upper ? mixColor(C.feather, C.featherTip, 0.45) : mixColor(C.under, C.underBar, 0.3);
    polys.push({pts: outline, fill: `slin:${col(c1)}:${col(c2)}:${b0.x.toFixed(1)},${b0.y.toFixed(1)},${tipC.x.toFixed(1)},${tipC.y.toFixed(1)}`, stroke: col(mixColor(c2, '#000000', 0.2)), sw: 0.8, z: tz});
    for (const f of [0.32, 0.52, 0.72]) {
      polys.push({pts: Array.from({length: n}, (_, i) => scr(at(i, f))), fill: 'open', stroke: col(upper ? C.featherTip : C.underBar), sw: 2 * S, z: tz + 0.001, op: 0.28});
    }
    polys.push({pts: Array.from({length: n}, (_, i) => scr(at(i, 0.95))), fill: 'open', stroke: col('#efe9dc'), sw: 2.4 * S, z: tz + 0.002, op: 0.55});
    for (let i = 1; i < n - 1; i++) polys.push({pts: [scr(at(i, 0.15)), scr(at(i, 0.97))], fill: 'none', stroke: col(C.featherTip), sw: 0.7 * S, z: tz + 0.003, op: 0.15});
  }

  // ---------- alas: silueta orgánica única por ala ----------
  const ext = {a1: 0.12, a2: 0.08, a3: 0.28};
  const swp = {a1: 0.55, a2: 0.95, a3: 1.15};
  const fld = {a1: 1.45, a2: -1.35, a3: 1.55};
  const sw = clamp(p.sweep);
  const fo = clamp(p.fold);
  const ang = (k: 'a1' | 'a2' | 'a3') => lerp(lerp(ext[k], swp[k], sw), fld[k], fo);
  const wingInfo: {z: number; polys: Poly[]}[] = [];
  for (const s of [1, -1]) {
    const flap = p.flap * (1 - fo) + (-0.18 * fo);
    const span: V3 = [0, Math.sin(flap), s * Math.cos(flap)];
    const back: V3 = [-1, 0, 0];
    const sh: V3 = [spec.wing.shoulder[0], spec.wing.shoulder[1], spec.wing.shoulder[2] * s];
    const P = (u: number, v: number): V3 => add(add(sh, sc(span, u)), sc(back, v));
    const Q = (q: {u: number; v: number}) => scr(P(q.u, q.v));
    const a1 = ang('a1');
    const a2 = ang('a2');
    const a3 = ang('a3');
    const e = {u: spec.wing.L1 * Math.cos(a1), v: spec.wing.L1 * Math.sin(a1)};
    const wr = {u: e.u + spec.wing.L2 * Math.cos(a2), v: e.v + spec.wing.L2 * Math.sin(a2)};
    const tip = {u: wr.u + spec.wing.L3 * Math.cos(a3), v: wr.v + spec.wing.L3 * Math.sin(a3)};
    const nUp = sc(cross(back, span), s);
    const upper = mul(M, nUp)[2] >= 0;
    // plumas en coordenadas del plano del ala
    type F = {b: {u: number; v: number}; d: {u: number; v: number}; L: number; t: {u: number; v: number}};
    const prim: F[] = [];
    const nP = spec.wing.prim.length;
    for (let i = 0; i < nP; i++) {
      const f = i / (nP - 1);
      const b = {u: wr.u + (tip.u - wr.u) * f * 0.92, v: wr.v + (tip.v - wr.v) * f * 0.92};
      const fan = lerp(a3 + Math.PI / 2 - 0.25, a3 + 0.06, f);
      const da = lerp(fan, a3 + 0.12, fo) + Math.sin(p.t * 3 + i) * 0.025 * (1 - fo);
      const L = spec.wing.prim[i] * lerp(1, 0.85, fo);
      const d = {u: Math.cos(da), v: Math.sin(da)};
      prim.push({b, d, L, t: {u: b.u + d.u * L, v: b.v + d.v * L}});
    }
    const secs: F[] = [];
    for (let j = 0; j < spec.wing.nSec; j++) {
      const f = 0.05 + (j / (spec.wing.nSec - 1)) * 0.95;
      const b = {u: e.u + (wr.u - e.u) * f, v: e.v + (wr.v - e.v) * f};
      const da = lerp(a2 + Math.PI / 2 - 0.12, Math.PI / 2 + 0.1, fo);
      const d = {u: Math.cos(da), v: Math.sin(da)};
      const L = spec.wing.sec * (0.92 + 0.08 * Math.sin(j * 1.7));
      secs.push({b, d, L, t: {u: b.u + d.u * L, v: b.v + d.v * L}});
    }
    const mid = (a: {u: number; v: number}, b: {u: number; v: number}, pull: number, dirr: {u: number; v: number}, L: number) => ({u: (a.u + b.u) / 2 - dirr.u * L * pull, v: (a.v + b.v) / 2 - dirr.v * L * pull});
    // contorno: borde de ataque → puntas de primarias (con "dedos") → secundarias → terciarias
    const sil: {u: number; v: number}[] = [{u: 0, v: -4}, {u: e.u, v: e.v - 7}, {u: wr.u, v: wr.v - 7}, {u: wr.u + (tip.u - wr.u) * 0.6, v: wr.v + (tip.v - wr.v) * 0.6 - 4}];
    for (let i = nP - 1; i >= 0; i--) {
      sil.push(prim[i].t);
      if (i > 0) sil.push(mid(prim[i].t, prim[i - 1].t, i >= nP - 5 ? 0.16 : 0.05, prim[i].d, prim[i].L));
    }
    for (let j = spec.wing.nSec - 1; j >= 0; j--) sil.push(secs[j].t);
    sil.push({u: 3, v: 22});
    const silS = sil.map(Q);
    const lead = Q({u: wr.u * 0.5, v: -6});
    const trail = Q(secs[Math.floor(spec.wing.nSec / 2)].t);
    const wp: Poly[] = [];
    const cA = upper ? mixColor(C.back, '#ffffff', 0.1) : mixColor(C.under, '#ffffff', 0.1);
    const cB = upper ? mixColor(C.feather, C.featherTip, 0.5) : mixColor(C.under, C.underBar, 0.35);
    wp.push({pts: silS, fill: `slin:${col(cA)}:${col(cB)}:${lead.x.toFixed(1)},${lead.y.toFixed(1)},${trail.x.toFixed(1)},${trail.y.toFixed(1)}`, stroke: col(mixColor(cB, '#000000', 0.25)), sw: 0.9, z: 0});
    // puntas de las primarias más oscuras
    if (upper) {
      for (let i = 0; i < nP; i++) {
        const F0 = prim[i];
        const q = (k: number, off: number) => Q({u: F0.b.u + F0.d.u * F0.L * k - F0.d.v * off, v: F0.b.v + F0.d.v * F0.L * k + F0.d.u * off});
        wp.push({pts: [q(0.62, -4), q(1, -1.5), q(1, 1.5), q(0.62, 4)], fill: `smooth:${col(C.featherTip)}`, z: 0.001, op: 0.45});
      }
    }
    // separaciones entre plumas
    prim.forEach((F0) => wp.push({pts: [Q({u: F0.b.u + F0.d.u * F0.L * 0.3, v: F0.b.v + F0.d.v * F0.L * 0.3}), Q({u: F0.b.u + F0.d.u * F0.L * 0.96, v: F0.b.v + F0.d.v * F0.L * 0.96})], fill: 'none', stroke: col(upper ? C.featherTip : C.underBar), sw: 1.0 * S, z: 0.002, op: upper ? 0.45 : 0.3}));
    secs.forEach((F0) => wp.push({pts: [Q({u: F0.b.u + F0.d.u * F0.L * 0.35, v: F0.b.v + F0.d.v * F0.L * 0.35}), Q({u: F0.b.u + F0.d.u * F0.L * 0.95, v: F0.b.v + F0.d.v * F0.L * 0.95})], fill: 'none', stroke: col(upper ? C.featherTip : C.underBar), sw: 0.9 * S, z: 0.002, op: upper ? 0.3 : 0.25}));
    // barreado de la cara inferior (fino y suave)
    if (!upper) {
      [...prim, ...secs].forEach((F0) => {
        for (const f of [0.35, 0.52, 0.69, 0.86]) {
          const c0 = {u: F0.b.u + F0.d.u * F0.L * f, v: F0.b.v + F0.d.v * F0.L * f};
          wp.push({pts: [Q({u: c0.u - F0.d.v * 3.5, v: c0.v + F0.d.u * 3.5}), Q({u: c0.u + F0.d.v * 3.5, v: c0.v - F0.d.u * 3.5})], fill: 'none', stroke: col(C.underBar), sw: 1.3 * S, z: 0.003, op: 0.35});
        }
      });
    }
    // banda de coberteras con borde festoneado
    const cov: {u: number; v: number}[] = [{u: 0, v: -4}, {u: e.u, v: e.v - 7}, {u: wr.u, v: wr.v - 7}, {u: wr.u + (tip.u - wr.u) * 0.5, v: wr.v + (tip.v - wr.v) * 0.5 - 3}];
    for (let i = 4; i >= 0; i--) cov.push({u: prim[i].b.u + prim[i].d.u * prim[i].L * 0.28, v: prim[i].b.v + prim[i].d.v * prim[i].L * 0.28});
    for (let j = spec.wing.nSec - 1; j >= 0; j--) {
      const F0 = secs[j];
      cov.push({u: F0.b.u + F0.d.u * F0.L * 0.42, v: F0.b.v + F0.d.v * F0.L * 0.42});
      if (j > 0) cov.push({u: (F0.b.u + secs[j - 1].b.u) / 2 + F0.d.u * F0.L * 0.36, v: (F0.b.v + secs[j - 1].b.v) / 2 + F0.d.v * F0.L * 0.36});
    }
    cov.push({u: 3, v: 16});
    const covCol = upper ? mixColor(C.back, '#ffffff', 0.06) : mixColor(C.under, '#ffffff', 0.15);
    wp.push({pts: cov.map(Q), fill: `smooth:${col(covCol)}`, stroke: col(mixColor(covCol, '#000000', 0.18)), sw: 0.8, z: 0.004});
    // festones (coberteras menores) y motas de la cara inferior
    for (let r2 = 0; r2 < 2; r2++) {
      for (let j = 0; j < spec.wing.nSec; j += 1) {
        const F0 = secs[j];
        const c0 = {u: F0.b.u + F0.d.u * F0.L * (0.12 + r2 * 0.14), v: F0.b.v + F0.d.v * F0.L * (0.12 + r2 * 0.14)};
        const a0 = Q({u: c0.u - F0.d.v * 3, v: c0.v + F0.d.u * 3});
        const a1b = Q({u: c0.u + F0.d.u * 2.5, v: c0.v + F0.d.v * 2.5});
        const a2b = Q({u: c0.u + F0.d.v * 3, v: c0.v - F0.d.u * 3});
        wp.push({pts: [a0, a1b, a2b], fill: 'open', stroke: col(upper ? mixColor(C.featherTip, C.back, 0.4) : C.underBar), sw: 0.9 * S, z: 0.005, op: upper ? 0.35 : 0.3});
      }
    }
    if (spec.wingBars && upper) {
      for (const kk of [0.35, 0.6]) wp.push({pts: [Q({u: e.u * 0.6, v: e.v + 24 * kk + 6}), Q({u: wr.u, v: wr.v + 22 * kk + 8})], fill: 'none', stroke: col(C.bar), sw: 4 * S, z: 0.006});
    }
    // borde de ataque iluminado
    wp.push({pts: [Q({u: 0, v: -4}), Q({u: e.u, v: e.v - 7}), Q({u: wr.u, v: wr.v - 7}), Q(tip)], fill: 'open', stroke: p.rim, sw: 1.6 * S, z: 0.007, op: upper ? 0.5 : 0.22});
    const wz = depth(P(wr.u, wr.v));
    wingInfo.push({z: wz, polys: wp.map((q) => ({...q, z: wz}))});
  }

  // ---------- patas ----------
  const legPolys: Poly[] = [];
  if (p.legs > 0.02) {
    for (const s of [1, -1]) {
      const hip: V3 = [-4, -spec.body.b * 0.75, 7 * s];
      const hipW = scr(hip);
      const tuck = scr([-30, -spec.body.b * 0.6, 6 * s]);
      const L = 30 * S;
      const foot = {x: lerp(tuck.x, hipW.x + 2 * S, p.legs), y: lerp(tuck.y, hipW.y + L, p.legs)};
      const z = depth(hip) + (s > 0 ? 1 : -1);
      legPolys.push({pts: [hipW, foot], fill: 'none', stroke: col(C.leg), sw: 5 * S, z});
      if (p.legs > 0.4) {
        for (const dx of [-8, 0, 9, -11]) {
          const toe = {x: foot.x + dx * S, y: foot.y + 3 * S};
          legPolys.push({pts: [foot, toe], fill: 'none', stroke: col(C.leg), sw: 3 * S, z: z + 0.01});
          legPolys.push({pts: [toe, {x: toe.x + Math.sign(dx || 1) * 3 * S, y: toe.y + 4 * S}], fill: 'none', stroke: col(C.talon), sw: 2 * S, z: z + 0.02});
        }
      }
      // muslo emplumado ("pantalón")
      legPolys.push({pts: [hipW, {x: (hipW.x + foot.x) / 2, y: (hipW.y + foot.y) / 2}], fill: 'none', stroke: col(mixColor(C.belly, C.bar, 0.2)), sw: 10 * S * p.legs, z: z + 0.005});
    }
  }

  // ---------- cabeza ----------
  const Mh = mm(Ry(p.headYaw), Rz(p.headPitch));
  const hc: V3 = [spec.head.x, spec.head.y, 0];
  const hp = (lat: number, lon: number, rr = 1): V3 => {
    const d = mul(Mh, [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)]);
    return add(hc, sc(d, spec.head.r * rr));
  };
  const facing = (lat: number, lon: number) => {
    const d = mul(M, mul(Mh, [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)]));
    return d[2];
  };
  const headC = scr(hc);
  const hz = depth(hc);
  const headPolys: Poly[] = [];
  const deg = Math.PI / 180;
  // pico (en el marco de la cabeza): mandíbula superior ganchuda
  const bk = (x: number, y: number, z = 0): V3 => add(hc, sc(mul(Mh, [x, y, z]), spec.head.r));
  const B = spec.beak;
  const beakPts = [bk(0.78, 0.25), bk(0.95 + 0.35 * B, 0.18), bk(1.05 + 0.45 * B, -0.1), bk(0.98 + 0.4 * B, -0.32), bk(0.9 + 0.3 * B, -0.18), bk(0.8, -0.3)].map(scr);
  const beakZ = depth(bk(1.1, 0));
  headPolys.push({pts: beakPts, fill: `smooth:${col(C.beak)}`, stroke: col('#14161a'), sw: 0.8, z: beakZ > hz ? 3 : -3});
  headPolys.push({pts: [scr(bk(0.82, 0.3)), scr(bk(0.92, 0.12)), scr(bk(0.82, -0.05))], fill: col(C.cere), z: beakZ > hz ? 3.1 : -2.9});
  // esfera de la cabeza (base clara: mejilla/garganta)
  const hr = spec.head.r * S;
  const circ: Vec[] = Array.from({length: 24}, (_, k) => ({x: headC.x + Math.cos((k / 24) * Math.PI * 2) * hr, y: headC.y + Math.sin((k / 24) * Math.PI * 2) * hr}));
  headPolys.push({pts: circ, fill: `grad:${col(spec.wingBars ? C.hood : mixColor(C.cheek, C.hood, clamp(up[2])))}:${col(C.cheek)}`, stroke: col(mixColor(C.hood, '#000000', 0.2)), sw: 1, z: 0});
  // capucha (corona y nuca) — visible según orientación
  const crownVis = clamp(0.9 + facing(70 * deg, 180 * deg) * 1.4);
  const capPts: Vec[] = [];
  for (const lat of [8, 30, 55, 80]) for (let k = 0; k < 16; k++) capPts.push(scr(hp(lat * deg, (k / 16) * 2 * Math.PI)));
  const cap = hull(capPts);
  headPolys.push({pts: cap, fill: col(C.hood), z: 0.1, op: crownVis, stroke: 'clip'});
  // bigote malar y ojos, a cada lado
  let eyeVis: Vec | null = null;
  for (const s of [1, -1]) {
    const f = facing(10 * deg, s * 50 * deg);
    if (f <= 0.05) continue;
    if (spec.malar) {
      const mal = [hp(14 * deg, s * 28 * deg), hp(16 * deg, s * 60 * deg), hp(-20 * deg, s * 52 * deg), hp(-55 * deg, s * 42 * deg), hp(-52 * deg, s * 28 * deg), hp(-18 * deg, s * 30 * deg)].map(scr);
      headPolys.push({pts: mal, fill: `smooth:${col(C.hood)}`, z: 0.2, op: clamp(f * 2), stroke: 'clip'});
      // mejilla blanca detrás del bigote
      const ck = [hp(-8 * deg, s * 70 * deg), hp(-12 * deg, s * 100 * deg), hp(-45 * deg, s * 95 * deg), hp(-50 * deg, s * 65 * deg)].map(scr);
      headPolys.push({pts: ck, fill: `smooth:${col(C.cheek)}`, z: 0.15, op: clamp(f * 2), stroke: 'clip'});
    } else if (C.neckSheen) {
      const sh = [hp(-35 * deg, s * 60 * deg), hp(-35 * deg, s * 150 * deg), hp(-80 * deg, s * 150 * deg), hp(-80 * deg, s * 40 * deg)].map(scr);
      headPolys.push({pts: sh, fill: `smooth:${col(C.neckSheen)}`, z: 0.15, op: 0.6 * clamp(f * 2), stroke: 'clip'});
    }
    const e = scr(hp(16 * deg, s * 42 * deg));
    const r = 0.27 * hr * (0.45 + 0.55 * f);
    const ring: Vec[] = Array.from({length: 14}, (_, k) => ({x: e.x + Math.cos((k / 14) * Math.PI * 2) * r * 1.25, y: e.y + Math.sin((k / 14) * Math.PI * 2) * r * 1.25}));
    const eye: Vec[] = Array.from({length: 14}, (_, k) => ({x: e.x + Math.cos((k / 14) * Math.PI * 2) * r, y: e.y + Math.sin((k / 14) * Math.PI * 2) * r}));
    headPolys.push({pts: ring, fill: col(C.eyeRing), z: 0.3, op: clamp(f * 2)});
    headPolys.push({pts: eye, fill: col('#120c08'), z: 0.31, op: clamp(f * 2)});
    headPolys.push({pts: [{x: e.x - r * 0.35, y: e.y - r * 0.35}], fill: '#ffffff', z: 0.32, op: clamp(f * 2) * (1 - sil), stroke: `dot:${(r * 0.32).toFixed(2)}`});
    if (p.nict > 0.01) headPolys.push({pts: eye, fill: '#dfe8f0', z: 0.33, op: 0.55 * p.nict * clamp(f * 2)});
    if (!eyeVis || f > 0.5) eyeVis = e;
  }
  // contorno de luz de la cabeza
  headPolys.push({pts: circ.slice(14, 23), fill: 'none', stroke: p.rim, sw: 1.6 * S, z: 0.4, op: 0.6});

  // ---------- cabeza de perfil ilustrada (vistas laterales) ----------
  const hzAxis = mul(M, mul(Mh, [0, 0, 1]));
  const sideK = Math.abs(hzAxis[2]);
  if (sideK > 0.55) {
    const hx = mul(M, mul(Mh, [1, 0, 0]));
    const hy = mul(M, mul(Mh, [0, 1, 0]));
    const R = spec.head.r * S;
    const A = (u: number, v: number): Vec => ({x: headC.x + (hx[0] * u + hy[0] * v) * R, y: headC.y - (hx[1] * u + hy[1] * v) * R});
    const P = (l: [number, number][]) => l.map(([u, v]) => A(u, v));
    const fk = clamp((sideK - 0.55) / 0.2);
    const pr: Poly[] = [];
    const isFal = spec.malar;
    // contorno de la cabeza con frente inclinada hacia el pico
    const gTop = A(0, 1);
    const gBot = A(0, -1);
    pr.push({pts: P([[0.78, 0.38], [0.55, 0.85], [0.1, 1.02], [-0.45, 0.92], [-0.92, 0.45], [-1.02, -0.1], [-0.8, -0.65], [-0.2, -0.95], [0.4, -0.85], [0.75, -0.35], [0.85, 0.05]]), fill: `slin:${col('#ffffff')}:${col(mixColor(C.cheek, '#9aa0aa', 0.25))}:${gTop.x.toFixed(1)},${gTop.y.toFixed(1)},${gBot.x.toFixed(1)},${gBot.y.toFixed(1)}`, stroke: col(mixColor(C.cheek, '#5a6270', 0.5)), sw: 0.7, z: 0});
    if (isFal) {
      // capucha + bigote malar: una sola mancha oscura característica
      pr.push({pts: P([[0.76, 0.36], [0.55, 0.86], [0.1, 1.03], [-0.45, 0.93], [-0.93, 0.45], [-1.0, -0.05], [-0.62, -0.02], [-0.32, -0.26], [-0.08, -0.16], [-0.02, -0.5], [0.08, -0.82], [0.32, -0.78], [0.36, -0.3], [0.52, -0.02], [0.74, 0.12]]), fill: `slin:${col('#11151c')}:${col(mixColor(C.hood, C.back, 0.25))}:${gTop.x.toFixed(1)},${gTop.y.toFixed(1)},${gBot.x.toFixed(1)},${gBot.y.toFixed(1)}`, z: 0.1});
      // plumas finas en el borde del bigote (transición suave)
      pr.push({pts: P([[0.36, -0.3], [0.32, -0.78], [0.08, -0.82]]), fill: 'open', stroke: col(mixColor(C.hood, C.cheek, 0.5)), sw: 1.2 * S, z: 0.105, op: 0.5});
    } else {
      pr.push({pts: P([[0.76, 0.36], [0.5, 0.86], [-0.5, 0.92], [-1.0, 0.1], [-0.8, -0.65], [0.3, -0.9], [0.8, -0.2]]), fill: `smooth:${col(C.hood)}`, z: 0.1});
      if (C.neckSheen) pr.push({pts: P([[-0.9, -0.2], [-0.2, -0.6], [0.2, -0.95], [-0.7, -0.95]]), fill: `smooth:${col(C.neckSheen)}`, z: 0.12, op: 0.7});
    }
    // ojo con anillo amarillo, iris oscuro y brillo; membrana nictitante
    const e0 = A(0.36, 0.2);
    const er = 0.2 * R;
    const circle = (c: Vec, r: number) => Array.from({length: 18}, (_, k) => ({x: c.x + Math.cos((k / 18) * Math.PI * 2) * r, y: c.y + Math.sin((k / 18) * Math.PI * 2) * r}));
    pr.push({pts: circle(e0, er * 1.22), fill: col(C.eyeRing), z: 0.3});
    pr.push({pts: circle(e0, er), fill: col('#3a2414'), z: 0.31});
    pr.push({pts: circle(e0, er * 0.72), fill: col('#0c0806'), z: 0.311});
    pr.push({pts: [{x: e0.x - er * 0.35, y: e0.y - er * 0.38}], fill: '#ffffff', z: 0.32, op: 1 - sil, stroke: `dot:${(er * 0.3).toFixed(2)}`});
    pr.push({pts: [{x: e0.x + er * 0.3, y: e0.y + er * 0.3}], fill: '#ffffff', z: 0.321, op: 0.5 * (1 - sil), stroke: `dot:${(er * 0.12).toFixed(2)}`});
    if (p.nict > 0.01) pr.push({pts: circle(e0, er * 1.02), fill: '#dce6ee', z: 0.33, op: 0.6 * p.nict});
    // pico ganchudo (cere amarilla), mandíbula inferior
    const bL = 0.24 * B + 0.12;
    pr.push({pts: P([[0.74, 0.34], [0.9 + bL * 0.4, 0.33], [0.98 + bL * 0.8, 0.12], [1.0 + bL, -0.14], [0.94 + bL * 0.85, -0.3], [0.9 + bL * 0.7, -0.08], [0.82, -0.02]]), fill: `slin:${col(mixColor(C.beak, '#9fb0c4', 0.35))}:${col('#15181d')}:${A(0.8, 0.2).x.toFixed(1)},${A(0.8, 0.2).y.toFixed(1)},${A(1.1, -0.2).x.toFixed(1)},${A(1.1, -0.2).y.toFixed(1)}`, stroke: col('#101216'), sw: 0.6, z: 0.4});
    pr.push({pts: P([[0.8, -0.04], [0.9 + bL * 0.6, -0.1], [0.82 + bL * 0.4, -0.24], [0.76, -0.2]]), fill: `smooth:${col(mixColor(C.beak, '#ffffff', 0.15))}`, z: 0.39});
    pr.push({pts: P([[0.72, 0.38], [0.9, 0.36], [0.9, 0.08], [0.76, 0.06]]), fill: `smooth:${col(C.cere)}`, z: 0.41});
    pr.push({pts: [A(0.86, 0.22)], fill: '#1a1208', z: 0.42, op: 0.9, stroke: `dot:${(0.04 * R).toFixed(2)}`});
    // luz de contorno en la corona/nuca
    pr.push({pts: P([[0.55, 0.85], [0.1, 1.02], [-0.45, 0.92], [-0.92, 0.45]]), fill: 'none', stroke: p.rim, sw: 1.6 * S, z: 0.5, op: 0.65});
    // mezcla suave con el método 3D en el límite de la vista lateral
    const keep = headPolys.filter((q) => q.z === 0);
    headPolys.length = 0;
    if (fk < 1) headPolys.push(...keep.map((q) => ({...q, op: (q.op ?? 1) * (1 - fk)})));
    headPolys.push(...pr.map((q) => (q.pts.length === 2 ? q : {...q, op: (q.op ?? 1) * (fk < 1 ? 0.4 + 0.6 * fk : 1)})));
  }

  // ---------- ala plegada (silueta sobre el costado visible) ----------
  const foldPolys: Poly[] = [];
  if (fo > 0.3) {
    const sideZ = mul(M, [0, 0, 1])[2] >= 0 ? 1 : -1;
    const zc = spec.body.c * 0.95 * sideZ;
    const F = (x: number, y: number) => scr([x, y, zc]);
    const k = clamp((fo - 0.3) / 0.5);
    foldPolys.push({pts: [F(20, 16), F(26, 2), F(10, -14), F(-24, -14), F(-60, -8), F(-74, -3), F(-58, 6), F(-24, 14), F(0, 19)], fill: `smooth:${col(C.feather)}`, stroke: col(C.featherTip), sw: 1, z: 1, op: k});
    for (const [x0, y0, x1, y1] of [[14, 6, -40, -4], [8, -4, -58, -6], [18, 12, -30, 8], [-20, -12, -70, -4]]) {
      foldPolys.push({pts: [F(x0, y0), F(x1, y1)], fill: 'none', stroke: col(C.featherTip), sw: 1.4 * S, z: 1.01, op: 0.6 * k});
    }
    foldPolys.push({pts: [F(20, 16), F(0, 19), F(-24, 14)], fill: 'none', stroke: p.rim, sw: 1.4 * S, z: 1.02, op: 0.5 * k});
  }

  // ---------- orden de pintado ----------
  const out: Poly[] = [];
  const farWing = wingInfo.filter((w) => w.z < bodyZ);
  const nearWing = wingInfo.filter((w) => w.z >= bodyZ);
  const tailPolys = polys.filter((q) => q.z < bodyZ - 0.1);
  const bodyPolys = polys.filter((q) => q.z >= bodyZ - 0.1);
  farWing.forEach((w) => out.push(...w.polys));
  out.push(...legPolys.filter((q) => q.z < bodyZ));
  out.push(...tailPolys.sort((a, b) => a.z - b.z));
  const headBehind = hz < bodyZ - 2;
  headPolys.sort((a, b) => a.z - b.z);
  const headBlock = headPolys.map((q) => ({...q, z: hz}));
  if (headBehind) out.push(...headBlock);
  out.push(...bodyPolys);
  out.push({pts: [], fill: `__grad__${gradDir.x.toFixed(4)},${gradDir.y.toFixed(4)}`, z: 0});
  out.push(...legPolys.filter((q) => q.z >= bodyZ));
  nearWing.forEach((w) => out.push(...w.polys.map((q) => (fo > 0.3 ? {...q, op: (q.op ?? 1) * (1 - clamp((fo - 0.3) / 0.5))} : q))));
  out.push(...foldPolys);
  if (!headBehind) out.push(...headBlock);
  const fwd = mul(M, [1, 0, 0]);
  return {polys: out, head: headC, headR: hr, eye: eyeVis, forward: {x: fwd[0], y: -fwd[1]}};
}

/** Render SVG del ave. */
export const Bird: React.FC<{id: string; spec: BirdSpec; params: BirdParams}> = ({id, spec, params}) => {
  const {polys, head, headR} = birdPolys(spec, params);
  let gx = 0;
  let gy = -1;
  const marker = polys.find((q) => q.fill.startsWith('__grad__'));
  if (marker) {
    const [a, b] = marker.fill.slice(8).split(',').map(Number);
    const l = Math.hypot(a, b) || 1;
    gx = a / l;
    gy = b / l;
  }
  const grads: React.ReactNode[] = [];
  let gi = 0;
  const els: React.ReactNode[] = [];
  polys.forEach((q, i) => {
    if (q.fill.startsWith('__grad__') || q.pts.length === 0) return;
    if (q.stroke && q.stroke.startsWith('dot:')) {
      els.push(<circle key={i} cx={q.pts[0].x} cy={q.pts[0].y} r={Number(q.stroke.slice(4))} fill={q.fill} opacity={q.op} />);
      return;
    }
    const clip = q.stroke === 'clip';
    let fill = q.fill;
    let d: string;
    let open = false;
    if (fill === 'open' || (fill === 'none' && q.pts.length > 2)) {
      open = true;
      d = smoothPath(q.pts, false);
    } else if (fill.startsWith('slin:')) {
      // silueta suave con degradado lineal explícito: slin:c1:c2:x1,y1,x2,y2
      const [, c1, c2, coords] = fill.split(':');
      const [x1, y1, x2, y2] = coords.split(',').map(Number);
      const gid = `${id}-l${gi++}`;
      grads.push(
        <linearGradient key={gid} id={gid} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>,
      );
      fill = `url(#${gid})`;
      d = smoothPath(q.pts, true, 0.85);
    } else if (fill.startsWith('smooth:')) {
      fill = fill.slice(7);
      d = smoothPath(q.pts, true);
    } else if (q.pts.length === 2) {
      d = `M${q.pts[0].x.toFixed(1)},${q.pts[0].y.toFixed(1)} L${q.pts[1].x.toFixed(1)},${q.pts[1].y.toFixed(1)}`;
    } else {
      d = 'M' + q.pts.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' L') + 'Z';
    }
    if (fill.startsWith('grad:')) {
      const [, top, bot] = fill.split(':');
      const xs = q.pts.map((pt) => pt.x);
      const ys = q.pts.map((pt) => pt.y);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
      const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const R = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2;
      const gid = `${id}-g${gi++}`;
      grads.push(
        <linearGradient key={gid} id={gid} gradientUnits="userSpaceOnUse" x1={cx + gx * R} y1={cy + gy * R} x2={cx - gx * R} y2={cy - gy * R}>
          <stop offset="0" stopColor={mixColor(top, '#ffffff', 0.08)} />
          <stop offset="0.38" stopColor={top} />
          <stop offset="0.72" stopColor={bot} />
          <stop offset="1" stopColor={mixColor(bot, '#000000', 0.1)} />
        </linearGradient>,
      );
      fill = `url(#${gid})`;
    }
    els.push(
      <path
        key={i}
        d={d}
        fill={q.pts.length === 2 || open ? 'none' : fill}
        stroke={q.pts.length === 2 || open ? q.stroke : clip ? undefined : q.stroke}
        strokeWidth={q.sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={q.op}
        clipPath={clip ? `url(#${id}-head)` : undefined}
      />,
    );
  });
  return (
    <g>
      <defs>
        {grads}
        <clipPath id={`${id}-head`}>
          <circle cx={head.x} cy={head.y} r={headR} />
        </clipPath>
      </defs>
      {els}
    </g>
  );
};
