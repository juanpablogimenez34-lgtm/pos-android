import React, { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { createRng, noise1 } from '../math/noise';
import { patchMaterial } from '../shaders/underwaterMaterial';

/** Geometría de pez pequeño: cuerpo fusiforme + aleta caudal. Eje +Z = cabeza. */
const makeFishGeometry = () => {
  const g = new THREE.SphereGeometry(1, 14, 10);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const top = new THREE.Color('#2e4a5a');
  const belly = new THREE.Color('#d9e6ea');
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i) * 0.16;
    let y = pos.getY(i) * 0.3;
    let z = pos.getZ(i);
    if (z < -0.55) {
      // Pedúnculo estrecho y aleta caudal en forma de horquilla.
      const k = (-z - 0.55) / 0.45;
      x *= 1 - k * 0.85;
      y *= 1 + k * 1.6 * (0.6 + 0.4 * Math.cos(y * 20));
      z -= k * 0.35;
    }
    pos.setXYZ(i, x, y, z);
    c.copy(belly).lerp(top, THREE.MathUtils.smoothstep(pos.getY(i), -0.1, 0.25));
    colors.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
};

export const FishSchool: React.FC<{
  count: number;
  center: [number, number, number];
  radius: [number, number];
  /** Velocidad angular de la órbita (rad/s). */
  speed: number;
  fishLength: number;
  seed: number;
  time: number;
}> = ({ count, center, radius, speed, fishLength, seed, time }) => {
  const { mesh, offsets } = useMemo(() => {
    const mat = patchMaterial(
      new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.55, roughness: 0.32 }),
      [
        {
          key: 'fish',
          vertexBeginExtra: /* glsl */ `
            {
              float ph = 0.0;
              #ifdef USE_INSTANCING
                ph = instanceMatrix[3][0] * 7.0 + instanceMatrix[3][2] * 5.0;
              #endif
              float tail = pow(max(0.0, 0.3 - position.z), 1.6);
              transformed.x += sin(uTime * 13.0 + ph - position.z * 3.0) * 0.22 * tail;
            }
          `,
        },
      ],
      { caustics: 0.5 },
    );
    const inst = new THREE.InstancedMesh(makeFishGeometry(), mat, count);
    inst.frustumCulled = false;
    const rng = createRng(seed);
    const offs = Array.from({ length: count }, () => ({
      o: new THREE.Vector3(rng.range(-1, 1) * 0.9, rng.range(-1, 1) * 0.35, rng.range(-1, 1) * 0.7),
      s: rng.range(0.8, 1.2),
      p: rng.next() * 100,
    }));
    return { mesh: inst, offsets: offs };
  }, [count, seed]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const look = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const next = new THREE.Vector3();
    const schoolAt = (t: number, target: THREE.Vector3) => {
      const a = t * speed;
      return target.set(
        center[0] + Math.cos(a) * radius[0],
        center[1] + Math.sin(a * 1.7) * 0.3,
        center[2] + Math.sin(a) * radius[1],
      );
    };
    offsets.forEach((f, i) => {
      const lag = f.o.x * 0.15;
      const wob = (tt: number, target: THREE.Vector3) => {
        schoolAt(tt - lag, target);
        target.x += f.o.x + noise1(tt * 0.4 + f.p, 1) * 0.25;
        target.y += f.o.y + noise1(tt * 0.5 + f.p, 2) * 0.12;
        target.z += f.o.z + noise1(tt * 0.4 + f.p, 3) * 0.25;
        return target;
      };
      wob(time, pos);
      wob(time + 0.05, next);
      look.lookAt(next, pos, up);
      q.setFromRotationMatrix(look);
      const s = fishLength * f.s;
      m.compose(pos, q, new THREE.Vector3(s, s, s));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [time, mesh, offsets, center, radius, speed, fishLength]);

  return <primitive object={mesh} />;
};
