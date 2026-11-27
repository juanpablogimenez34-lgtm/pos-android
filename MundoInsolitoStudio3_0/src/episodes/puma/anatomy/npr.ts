// SISTEMA DE MATERIALES NPR (no fotorrealista, pictórico) — Studio 3.2.
// · Sombreado en bandas suaves (rampa de 6 tonos con filtrado lineal: transiciones de pincel, no escalones duros).
// · Luz de borde cálida (fresnel) para recortar la silueta como en la ilustración.
// · Contorno por «casco invertido»: la misma geometría, dibujada por detrás y ensanchada sobre la normal.
// · Texturas de pelaje pintadas: color anatómico por región + trazos cortos orientados según la dirección del pelo.
import * as THREE from 'three';
import {clamp, fbm2, noise2} from '../../../lib/noise';

let ramp: THREE.DataTexture | null = null;
/** Rampa de tonos: sombra cálida y profunda → medios tonos → luz (sin negro puro: estilo pictórico). */
export function toonRamp() {
  if (ramp) return ramp;
  const v = [70, 104, 140, 182, 222, 255];
  const d = new Uint8Array(v.length * 4);
  v.forEach((x, i) => d.set([x, x, x, 255], i * 4));
  ramp = new THREE.DataTexture(d, v.length, 1, THREE.RGBAFormat);
  ramp.minFilter = THREE.LinearFilter;
  ramp.magFilter = THREE.LinearFilter;
  ramp.needsUpdate = true;
  return ramp;
}

/** Material de pelaje pintado: toon con rampa suave, mapa de color + relieve de trazos y luz de borde. */
export function furMaterial(map: THREE.Texture, normalMap: THREE.Texture | null, rim = '#ffd9a0', rimK = 0.55, nScale = 0.6) {
  const m = new THREE.MeshToonMaterial({map, gradientMap: toonRamp(), normalMap: normalMap ?? undefined, normalScale: new THREE.Vector2(nScale, nScale)});
  const rimC = new THREE.Color(rim);
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uRim = {value: rimC};
    sh.uniforms.uRimK = {value: rimK};
    sh.fragmentShader = sh.fragmentShader
      .replace('void main() {', 'uniform vec3 uRim; uniform float uRimK;\nvoid main() {')
      .replace(
        '#include <opaque_fragment>',
        `float fr = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 3.0);
outgoingLight += uRim * fr * uRimK * diffuseColor.rgb;
#include <opaque_fragment>`,
      );
  };
  m.customProgramCacheKey = () => `fur-${rim}-${rimK}`;
  return m;
}

/** Material liso (nariz, almohadillas, interior de la boca): toon sin textura. */
export function flatToon(color: string, rimK = 0.25) {
  const m = new THREE.MeshToonMaterial({color, gradientMap: toonRamp()});
  void rimK;
  return m;
}

const outlineCache = new Map<string, THREE.ShaderMaterial>();
/** Contorno de casco invertido (grosor en metros, constante en el mundo). */
export function outlineMaterial(width: number, color = '#2e1d10') {
  const key = `${width}-${color}`;
  const hit = outlineCache.get(key);
  if (hit) return hit;
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {w: {value: width}, c: {value: new THREE.Color(color)}},
    vertexShader: `uniform float w; void main(){ vec3 p = position + normal * w; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
    fragmentShader: `uniform vec3 c; void main(){ gl_FragColor = vec4(c, 1.0); }`,
  });
  outlineCache.set(key, m);
  return m;
}

export type RGB = [number, number, number];
export const hex = (h: string): RGB => {
  const c = new THREE.Color(h);
  return [c.r, c.g, c.b];
};
export const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/**
 * Pinta una textura de pelaje en coordenadas (u, v) de la malla: u a lo largo del pelo, v alrededor (periódica).
 * fn(u, v) da el color anatómico; encima se aplican trazos cortos alargados en u (dirección coherente del pelo),
 * mechones de baja frecuencia y una variación de tono. Devuelve el mapa de color (sRGB) y el de normales.
 * Las frecuencias se mantienen por debajo de Nyquist (≤ 0,35 ciclos/píxel) para evitar el muaré.
 */
export function paintFur(W: number, H: number, fn: (u: number, v: number) => RGB, o: {su: number; sv: number; seed: number; k?: number; periodicV?: boolean}) {
  const k = o.k ?? 1;
  const su = Math.min(o.su, W * 0.33);
  const sv = Math.min(o.sv, H * 0.33);
  const col = new Uint8Array(W * H * 4);
  const hgt = new Float32Array(W * H);
  const per = o.periodicV !== false;
  for (let y = 0; y < H; y++) {
    const v = (y + 0.5) / H;
    for (let x = 0; x < W; x++) {
      const u = (x + 0.5) / W;
      const c = fn(u, v);
      // trazos: ruido estirado a lo largo del pelo (baja frecuencia en u, alta en v)
      const s1 = per ? fbm2(u * su, v * sv, 2, o.seed, sv) : fbm2(u * su, v * sv, 2, o.seed);
      const s2 = noise2(u * su * 2.1 + 5.3, v * sv * 1.7, o.seed + 9);
      const clump = per ? fbm2(u * 9, v * 6, 3, o.seed + 3, 6) : fbm2(u * 9, v * 6, 3, o.seed + 3);
      const stroke = s1 * 0.7 + s2 * 0.3;
      const tint = 1 + (stroke - 0.5) * 0.34 * k + (clump - 0.5) * 0.16 * k;
      const warm = (clump - 0.5) * 0.05 * k;
      const i = (y * W + x) * 4;
      col[i] = Math.pow(clamp(c[0] * tint + warm), 1 / 2.2) * 255;
      col[i + 1] = Math.pow(clamp(c[1] * tint), 1 / 2.2) * 255;
      col[i + 2] = Math.pow(clamp(c[2] * tint - warm), 1 / 2.2) * 255;
      col[i + 3] = 255;
      hgt[y * W + x] = stroke;
    }
  }
  const nrm = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const at = (xx: number, yy: number) => hgt[((yy + H) % H) * W + ((xx + W) % W)];
      const dx = (at(x + 1, y) - at(x - 1, y)) * 2.2;
      const dy = (at(x, y + 1) - at(x, y - 1)) * 2.2;
      const l = Math.hypot(dx, dy, 1);
      const i = (y * W + x) * 4;
      nrm[i] = ((-dx / l) * 0.5 + 0.5) * 255;
      nrm[i + 1] = ((-dy / l) * 0.5 + 0.5) * 255;
      nrm[i + 2] = ((1 / l) * 0.5 + 0.5) * 255;
      nrm[i + 3] = 255;
    }
  }
  const map = new THREE.DataTexture(col, W, H, THREE.RGBAFormat);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.ClampToEdgeWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.magFilter = THREE.LinearFilter;
  map.minFilter = THREE.LinearMipmapLinearFilter;
  map.generateMipmaps = true;
  map.anisotropy = 4;
  map.needsUpdate = true;
  const nmap = new THREE.DataTexture(nrm, W, H, THREE.RGBAFormat);
  nmap.wrapS = THREE.ClampToEdgeWrapping;
  nmap.wrapT = THREE.RepeatWrapping;
  nmap.magFilter = THREE.LinearFilter;
  nmap.minFilter = THREE.LinearMipmapLinearFilter;
  nmap.generateMipmaps = true;
  nmap.needsUpdate = true;
  return {map, normalMap: nmap};
}
