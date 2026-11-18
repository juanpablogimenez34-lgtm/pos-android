import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createRng } from '../math/noise';
import { waterUniforms } from '../shaders/underwaterMaterial';

/** Haces de luz volumétricos que bajan desde la superficie. */
export const GodRays: React.FC<{
  count: number;
  center: [number, number];
  spread: number;
  topY: number;
  seed: number;
  sunDir: [number, number, number];
}> = ({ count, center, spread, topY, seed, sunDir }) => {
  const group = useMemo(() => {
    const rng = createRng(seed);
    const g = new THREE.Group();
    const dir = new THREE.Vector3(...sunDir).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    for (let i = 0; i < count; i++) {
      const length = topY + 2;
      const geo = new THREE.CylinderGeometry(rng.range(0.15, 0.4), rng.range(0.7, 1.6), length, 24, 1, true);
      geo.translate(0, -length / 2, 0);
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: waterUniforms.uTime,
          uPhase: { value: rng.next() * 10 },
          uIntensity: { value: rng.range(0.05, 0.12) },
        },
        vertexShader: /* glsl */ `
          varying float vV;
          varying vec3 vN;
          varying vec3 vView;
          void main() {
            vV = uv.y;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vView = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform float uPhase;
          uniform float uIntensity;
          varying float vV;
          varying vec3 vN;
          varying vec3 vView;
          void main() {
            float facing = pow(abs(dot(vN, vView)), 2.5);
            float along = smoothstep(0.0, 0.55, vV) * smoothstep(1.0, 0.85, vV);
            float flicker = 0.65 + 0.35 * sin(uTime * 0.9 + uPhase) * sin(uTime * 0.37 + uPhase * 2.0);
            float a = facing * along * flicker * uIntensity;
            gl_FragColor = vec4(vec3(0.7, 0.92, 1.0) * a, 1.0);
          }
        `,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        center[0] + rng.range(-spread, spread) + dir.x * topY,
        topY,
        center[1] + rng.range(-spread, spread) + dir.z * topY,
      );
      mesh.quaternion.copy(quat);
      mesh.renderOrder = 10;
      mesh.frustumCulled = false;
      g.add(mesh);
    }
    return g;
  }, [count, center, spread, topY, seed, sunDir]);
  return <primitive object={group} />;
};
