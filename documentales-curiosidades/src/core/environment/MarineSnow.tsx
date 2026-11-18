import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createRng } from '../math/noise';
import { waterUniforms } from '../shaders/underwaterMaterial';

/**
 * "Nieve marina": partículas orgánicas en suspensión que delatan el volumen
 * del agua. Su movimiento se calcula en el shader como función del tiempo,
 * así que es 100 % determinista.
 */
export const MarineSnow: React.FC<{
  count: number;
  boxMin: [number, number, number];
  boxSize: [number, number, number];
  seed: number;
  viewportHeight: number;
}> = ({ count, boxMin, boxSize, seed, viewportHeight }) => {
  const points = useMemo(() => {
    const rng = createRng(seed);
    const pos = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = rng.next();
      pos[i * 3 + 1] = rng.next();
      pos[i * 3 + 2] = rng.next();
      seeds[i] = rng.next();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: waterUniforms.uTime,
        uBoxMin: { value: new THREE.Vector3(...boxMin) },
        uBoxSize: { value: new THREE.Vector3(...boxSize) },
        uScale: { value: viewportHeight * 1.4 },
      },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        uniform float uTime;
        uniform vec3 uBoxMin;
        uniform vec3 uBoxSize;
        uniform float uScale;
        varying float vAlpha;
        void main() {
          vec3 drift = vec3(0.006, -0.010 * (0.4 + aSeed), 0.004) * uTime;
          vec3 p = fract(position + drift / uBoxSize);
          vec3 wp = uBoxMin + p * uBoxSize;
          wp.x += sin(uTime * 0.5 + aSeed * 40.0) * 0.03;
          wp.y += sin(uTime * 0.37 + aSeed * 23.0) * 0.02;
          vec4 mv = viewMatrix * vec4(wp, 1.0);
          float dist = -mv.z;
          float worldSize = mix(0.0025, 0.009, aSeed * aSeed);
          gl_PointSize = clamp(uScale * worldSize / max(dist, 0.05), 1.0, 46.0);
          vec3 e = min(p, 1.0 - p);
          float edge = smoothstep(0.0, 0.06, min(min(e.x, e.y), e.z));
          float fog = exp(-dist * 0.22);
          float nearFade = smoothstep(0.08, 0.5, dist);
          // Las partículas muy grandes (desenfocadas) son más tenues: efecto bokeh.
          float bokeh = 1.0 / (1.0 + gl_PointSize * 0.06);
          vAlpha = edge * fog * nearFade * bokeh * (0.55 + 0.45 * aSeed);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vAlpha;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(vec3(0.75, 0.9, 0.95) * a * vAlpha * 0.9, 1.0);
        }
      `,
    });
    const p = new THREE.Points(g, m);
    p.frustumCulled = false;
    return p;
  }, [count, boxMin, boxSize, seed, viewportHeight]);
  return <primitive object={points} />;
};
