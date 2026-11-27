// PIEL PROCEDURAL de Inia geoffrensis (determinista): color, relieve (mapa de normales) y rugosidad.
// La textura se indexa por (s, φ) — u a lo largo del cuerpo, v alrededor de la sección — de modo que el moteado y las
// cicatrices quedan adheridos a la anatomía en cualquier pose (no se deslizan sobre la piel).
// Contenido: degradado dorsal (gris rosado) → flancos rosados → vientre rosa pálido; rostro y melón más rosados;
// rubor vascular en los flancos; moteado gris; cicatrices lineales en grupos paralelos (marcas de dientes de
// congéneres) más densas en cabeza y dorso; poros finos; arrugas transversales en el cuello.
import * as THREE from 'three';
import {clamp, fbm2, hash, lerp, noise2, smooth} from '../../lib/noise';
import {ALPHA} from './model';

const W = 2048;
const H = 1024;
type RGB = [number, number, number];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** Paleta según la edad: cría gris → adulto rosado (sin rosa saturado). */
function palette(age: number) {
  const g = {dorsal: hex('#6f777e'), flank: hex('#9ca3a9'), belly: hex('#c6cacd'), head: hex('#8e969c'), mottle: hex('#5e666c'), scar: hex('#c9cfd2'), flush: hex('#a9a3a6')};
  const p = {dorsal: hex('#8f7a80'), flank: hex('#d39698'), belly: hex('#ecc0b6'), head: hex('#dca0a1'), mottle: hex('#776a6f'), scar: hex('#f0d2ca'), flush: hex('#dc8689')};
  const k = clamp(age);
  const m = (a: RGB, b: RGB) => mix(a, b, k);
  return {dorsal: m(g.dorsal, p.dorsal), flank: m(g.flank, p.flank), belly: m(g.belly, p.belly), head: m(g.head, p.head), mottle: m(g.mottle, p.mottle), scar: m(g.scar, p.scar), flush: m(g.flush, p.flush), scars: 0.15 + 0.85 * k};
}

type Maps = {map: THREE.DataTexture; normalMap: THREE.DataTexture; roughnessMap: THREE.DataTexture};
const CACHE = new Map<string, Maps>();

export function iniaSkin(age = 1): Maps {
  const key = `b${age.toFixed(2)}`;
  const hit = CACHE.get(key);
  if (hit) return hit;
  const pal = palette(age);
  const height = new Float32Array(W * H);
  const col = new Float32Array(W * H * 3);
  const rough = new Float32Array(W * H);
  for (let j = 0; j < H; j++) {
    const v = j / H;
    const phi = v * Math.PI * 2 - ALPHA;
    const d = Math.sin(phi); // +1 dorso, −1 vientre
    for (let i = 0; i < W; i++) {
      const s = i / W;
      const o = j * W + i;
      // base: dorso → flanco → vientre, cabeza más rosada
      let c: RGB = d > 0 ? mix(pal.flank, pal.dorsal, smooth(0.15, 0.95, d)) : mix(pal.flank, pal.belly, smooth(0.05, 0.75, -d));
      c = mix(c, pal.head, (1 - smooth(0.12, 0.24, s)) * 0.55 * (0.6 + 0.4 * (1 - Math.abs(d))));
      // rubor vascular en flancos (manchas grandes y suaves)
      const fl = fbm2(s * 9, v * 9, 3, 11, 9);
      c = mix(c, pal.flush, smooth(0.5, 0.75, fl) * 0.35 * (1 - Math.abs(d)) * age);
      // moteado gris (más en el dorso), dos escalas
      const mt = fbm2(s * 38, v * 24, 4, 23, 24);
      const mt2 = fbm2(s * 90, v * 60, 3, 29, 60);
      c = mix(c, pal.mottle, smooth(0.56, 0.72, mt) * (0.25 + 0.45 * Math.max(0, d)) + smooth(0.62, 0.75, mt2) * 0.15);
      // poros y grano fino
      const pore = noise2(s * 420, v * 240, 41); // por debajo del límite de Nyquist de la textura (sin moaré)
      const grain = fbm2(s * 260, v * 160, 2, 43, 160);
      // arrugas transversales del cuello y de la inserción de la aleta
      const neck = smooth(0.195, 0.212, s) * (1 - smooth(0.228, 0.245, s));
      const wr = neck * Math.sin(s * W * 0.9 + noise2(s * 60, v * 30, 47) * 4) * 0.5;
      const finIns = Math.exp(-(((s - 0.27) / 0.02) ** 2) - ((Math.abs(d + 0.55) / 0.12) ** 2));
      const wr2 = finIns * Math.sin(v * H * 0.6 + s * 400) * 0.4;
      height[o] = (pore - 0.5) * 0.16 + (grain - 0.5) * 0.35 + wr + wr2 + (mt - 0.5) * 0.15;
      // línea de la boca (comisura): surco oscuro a lo largo del rostro
      if (s < 0.168) {
        const dv = Math.min(Math.abs(v - 0), Math.abs(v - 1), Math.abs(v - (Math.PI + 2 * ALPHA) / (Math.PI * 2)));
        const k = Math.exp(-(((dv * H) / 2.2) ** 2)) * (1 - smooth(0.15, 0.168, s));
        c = mix(c, [70, 40, 44], k * 0.85);
        height[o] -= k * 0.8;
      }
      const shade = 0.94 + 0.08 * grain;
      col[o * 3] = c[0] * shade;
      col[o * 3 + 1] = c[1] * shade;
      col[o * 3 + 2] = c[2] * shade;
      rough[o] = 0.52 + 0.12 * (grain - 0.5) - 0.06 * (1 - smooth(0.1, 0.22, s));
    }
  }
  // cicatrices: grupos de 2–4 líneas paralelas (marcas de dientes), más densas en cabeza y dorso
  const nScars = Math.round(85 * pal.scars);
  for (let k = 0; k < nScars; k++) {
    const s0 = Math.pow(hash(k * 3.1), 1.3) * 0.85 + 0.02;
    const v0 = (0.317 + (hash(k * 5.7) - 0.5) * (hash(k * 2.3) < 0.7 ? 0.5 : 1)) % 1;
    const ang = (hash(k * 7.9) - 0.5) * Math.PI;
    const len = (0.012 + hash(k * 1.3) * 0.04) * W;
    const lines = 1 + Math.floor(hash(k * 9.1) * hash(k * 2.9) * 4);
    const gap = 6 + hash(k * 4.4) * 6;
    const wdt = 0.8 + hash(k * 6.6) * 1.0;
    for (let l = 0; l < lines; l++) {
      const off = (l - (lines - 1) / 2) * gap;
      const cx = s0 * W - Math.sin(ang) * off;
      const cy = (v0 * H + Math.cos(ang) * off + H) % H;
      for (let t = -len / 2; t < len / 2; t += 0.5) {
        const fade = Math.sin(((t + len / 2) / len) * Math.PI);
        const x = cx + Math.cos(ang) * t;
        const y = cy + Math.sin(ang) * t;
        for (let dy = -2; dy <= 2; dy++)
          for (let dx = -2; dx <= 2; dx++) {
            const px = Math.round(x + dx);
            const py = ((Math.round(y + dy) % H) + H) % H;
            if (px < 0 || px >= W) continue;
            const r = Math.hypot(dx, dy);
            if (r > wdt * 1.6) continue;
            const kk = clamp(1 - r / (wdt * 1.6)) * fade;
            const o = py * W + px;
            col[o * 3] = lerp(col[o * 3], pal.scar[0], kk * 0.6);
            col[o * 3 + 1] = lerp(col[o * 3 + 1], pal.scar[1], kk * 0.6);
            col[o * 3 + 2] = lerp(col[o * 3 + 2], pal.scar[2], kk * 0.6);
            height[o] -= kk * 0.3;
            rough[o] = lerp(rough[o], 0.38, kk);
          }
      }
    }
  }
  // mapa de normales (Sobel sobre la altura), con envoltura en v
  const nrm = new Uint8Array(W * H * 4);
  const strength = 3.2;
  for (let j = 0; j < H; j++)
    for (let i = 0; i < W; i++) {
      const h = (x: number, y: number) => height[(((y % H) + H) % H) * W + Math.min(W - 1, Math.max(0, x))];
      const dx = (h(i + 1, j - 1) + 2 * h(i + 1, j) + h(i + 1, j + 1) - h(i - 1, j - 1) - 2 * h(i - 1, j) - h(i - 1, j + 1)) / 8;
      const dy = (h(i - 1, j + 1) + 2 * h(i, j + 1) + h(i + 1, j + 1) - h(i - 1, j - 1) - 2 * h(i, j - 1) - h(i + 1, j - 1)) / 8;
      let nx = -dx * strength;
      let ny = -dy * strength;
      let nz = 1;
      const l = Math.hypot(nx, ny, nz);
      nx /= l;
      ny /= l;
      nz /= l;
      const o = (j * W + i) * 4;
      nrm[o] = (nx * 0.5 + 0.5) * 255;
      nrm[o + 1] = (ny * 0.5 + 0.5) * 255;
      nrm[o + 2] = (nz * 0.5 + 0.5) * 255;
      nrm[o + 3] = 255;
    }
  const albedo = new Uint8Array(W * H * 4);
  const rmap = new Uint8Array(W * H * 4);
  for (let o = 0; o < W * H; o++) {
    albedo[o * 4] = clamp(col[o * 3] / 255) * 255;
    albedo[o * 4 + 1] = clamp(col[o * 3 + 1] / 255) * 255;
    albedo[o * 4 + 2] = clamp(col[o * 3 + 2] / 255) * 255;
    albedo[o * 4 + 3] = 255;
    const r = clamp(rough[o]) * 255;
    rmap[o * 4] = r;
    rmap[o * 4 + 1] = r;
    rmap[o * 4 + 2] = r;
    rmap[o * 4 + 3] = 255;
  }
  const mk = (data: Uint8Array, srgb: boolean) => {
    const t = new THREE.DataTexture(data, W, H, THREE.RGBAFormat);
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  };
  const maps = {map: mk(albedo, true), normalMap: mk(nrm, false), roughnessMap: mk(rmap, false)};
  CACHE.set(key, maps);
  return maps;
}

/** Textura de aletas: tono algo más rosado hacia los bordes, moteado fino y cicatrices pequeñas. */
export function finSkin(age = 1): Maps {
  const key = `f${age.toFixed(2)}`;
  const hit = CACHE.get(key);
  if (hit) return hit;
  const pal = palette(age);
  const S = 512;
  const albedo = new Uint8Array(S * S * 4);
  const height = new Float32Array(S * S);
  for (let j = 0; j < S; j++)
    for (let i = 0; i < S; i++) {
      const xc = i / S; // a lo largo de la cuerda
      const r = j / S; // envergadura
      const edge = Math.max(smooth(0.7, 1, xc), smooth(0.85, 1, Math.abs(r * 2 - 1)));
      let c = mix(pal.dorsal, pal.flank, 0.15 + 0.35 * edge);
      c = [c[0] * 0.93, c[1] * 0.93, c[2] * 0.93];
      const mt = fbm2(xc * 12, r * 12, 4, 61);
      c = mix(c, pal.mottle, smooth(0.58, 0.72, mt) * 0.35);
      const o = j * S + i;
      height[o] = (noise2(xc * 300, r * 300, 63) - 0.5) * 0.3 + (mt - 0.5) * 0.2;
      albedo[o * 4] = c[0];
      albedo[o * 4 + 1] = c[1];
      albedo[o * 4 + 2] = c[2];
      albedo[o * 4 + 3] = 255;
    }
  const nrm = new Uint8Array(S * S * 4);
  const rough = new Uint8Array(S * S * 4);
  for (let j = 0; j < S; j++)
    for (let i = 0; i < S; i++) {
      const h = (x: number, y: number) => height[Math.min(S - 1, Math.max(0, y)) * S + Math.min(S - 1, Math.max(0, x))];
      const nx = -(h(i + 1, j) - h(i - 1, j)) * 2.5;
      const ny = -(h(i, j + 1) - h(i, j - 1)) * 2.5;
      const l = Math.hypot(nx, ny, 1);
      const o = (j * S + i) * 4;
      nrm[o] = (nx / l * 0.5 + 0.5) * 255;
      nrm[o + 1] = (ny / l * 0.5 + 0.5) * 255;
      nrm[o + 2] = (1 / l * 0.5 + 0.5) * 255;
      nrm[o + 3] = 255;
      rough[o] = rough[o + 1] = rough[o + 2] = 128;
      rough[o + 3] = 255;
    }
  const mk = (data: Uint8Array, srgb: boolean) => {
    const t = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  };
  const maps = {map: mk(albedo, true), normalMap: mk(nrm, false), roughnessMap: mk(rough, false)};
  CACHE.set(key, maps);
  return maps;
}
