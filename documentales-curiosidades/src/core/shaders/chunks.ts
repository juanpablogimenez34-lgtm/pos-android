/** Fragmentos GLSL reutilizables (ruido, cáusticas). */

export const GLSL_NOISE = /* glsl */ `
float uwHash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float uwNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(uwHash(i + vec3(0,0,0)), uwHash(i + vec3(1,0,0)), f.x),
        mix(uwHash(i + vec3(0,1,0)), uwHash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(uwHash(i + vec3(0,0,1)), uwHash(i + vec3(1,0,1)), f.x),
        mix(uwHash(i + vec3(0,1,1)), uwHash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float uwFbm(vec3 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * uwNoise(p);
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    a *= 0.5;
  }
  return s;
}
`;

/**
 * Cáusticas: la luz del sol enfocada por las olas de la superficie
 * dibuja una red brillante y móvil sobre el fondo.
 */
export const GLSL_CAUSTICS = /* glsl */ `
float uwCausticLayer(vec2 p, float t) {
  float n = uwNoise(vec3(p, t));
  return pow(1.0 - abs(n * 2.0 - 1.0), 7.0);
}
float uwCaustics(vec3 wp, float t) {
  vec2 p = wp.xz * 2.2;
  float a = uwCausticLayer(p + vec2(t * 0.11, t * 0.07), t * 0.55);
  float b = uwCausticLayer(p * 1.37 + vec2(-t * 0.09, t * 0.05) + 3.1, t * 0.47 + 7.0);
  return min(a, b) * 2.0 + a * b * 1.5;
}
`;

/**
 * Relieve procedural (bump) a partir de una altura escalar evaluada por píxel.
 * Técnica de Mikkelsen (la misma que usa Three.js para bumpMap), sin texturas.
 */
export const GLSL_BUMP = /* glsl */ `
vec3 uwBump(vec3 surfPos, vec3 surfNorm, float h) {
  vec3 sx = dFdx(surfPos);
  vec3 sy = dFdy(surfPos);
  vec3 r1 = cross(sy, surfNorm);
  vec3 r2 = cross(surfNorm, sx);
  float det = dot(sx, r1);
  vec3 grad = sign(det) * (dFdx(h) * r1 + dFdy(h) * r2);
  return normalize(abs(det) * surfNorm - grad);
}
`;
