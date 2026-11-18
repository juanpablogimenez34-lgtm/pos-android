import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createRng, fbm2 } from '../math/noise';
import { patchMaterial } from '../shaders/underwaterMaterial';
import { Seabed } from './seabed';

export type BoulderSpec = {
  x: number;
  z: number;
  scale: [number, number, number];
  rotY: number;
  variant: number;
};

/** Genera una geometría de roca orgánica (icosaedro desplazado con ruido). */
const makeRockGeometry = (seed: number) => {
  const g = new THREE.IcosahedronGeometry(1, 5);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  const dark = new THREE.Color('#34332d');
  const light = new THREE.Color('#6c665a');
  const algae = new THREE.Color('#46522c');
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n =
      fbm2(v.x * 1.4 + seed, v.z * 1.4 + v.y * 0.7, 4, seed) * 0.55 +
      fbm2(v.y * 3.5 + seed * 2, v.x * 3.5 - v.z, 3, seed + 1) * 0.18;
    // Aplana la base para que "asiente" en la arena.
    const flat = v.y < -0.2 ? 0.6 : 1;
    v.multiplyScalar(1 + n);
    v.y *= flat;
    pos.setXYZ(i, v.x, v.y, v.z);
    c.copy(dark).lerp(light, Math.min(1, Math.max(0, 0.5 + fbm2(v.x * 4 + seed, v.y * 4 + v.z, 3, seed + 5) * 2)));
    const top = Math.max(0, v.y) * (0.5 + fbm2(v.x * 3, v.z * 3, 2, seed + 8) * 2);
    c.lerp(algae, Math.min(0.8, top));
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
};

export const createRockMaterial = () =>
  patchMaterial(
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 }),
    [
      {
        key: 'rock',
        fragmentColor: /* glsl */ `
          float pores = uwFbm(vUwWorldPos * 18.0);
          diffuseColor.rgb *= 0.72 + 0.56 * pores;
        `,
        fragmentNormal: /* glsl */ `
          normal = uwBump(-vViewPosition, normal, uwFbm(vUwWorldPos * 9.0) * 0.06 + uwNoise(vUwWorldPos * 40.0) * 0.008);
        `,
      },
    ],
    { caustics: 1.2 },
  );

/** Grandes rocas decorativas que dan profundidad al arrecife. */
export const Boulders: React.FC<{ seabed: Seabed; boulders: BoulderSpec[] }> = ({ seabed, boulders }) => {
  const geometries = useMemo(() => [0, 1, 2, 3].map((s) => makeRockGeometry(s * 13 + 7)), []);
  const material = useMemo(createRockMaterial, []);
  return (
    <group>
      {boulders.map((b, i) => (
        <mesh
          key={i}
          geometry={geometries[b.variant % geometries.length]}
          material={material}
          position={[b.x, seabed.height(b.x, b.z) - b.scale[1] * 0.25, b.z]}
          rotation={[0, b.rotY, 0]}
          scale={b.scale}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
};

/** Piedrecitas y conchas sobre la arena. */
export const Pebbles: React.FC<{
  seabed: Seabed;
  count: number;
  center: [number, number];
  radius: number;
  seed: number;
}> = ({ seabed, count, center, radius, seed }) => {
  const mesh = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const mat = patchMaterial(new THREE.MeshStandardMaterial({ roughness: 0.8 }), [{ key: 'pebble' }], {
      caustics: 1.0,
    });
    const inst = new THREE.InstancedMesh(geo, mat, count);
    const rng = createRng(seed);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const col = new THREE.Color();
    const palette = ['#d8cdb4', '#8e8775', '#b9a98c', '#5f5a50', '#e6dccb'];
    let placed = 0;
    for (let tries = 0; tries < count * 6 && placed < count; tries++) {
      const a = rng.next() * Math.PI * 2;
      const r = Math.sqrt(rng.next()) * radius;
      const x = center[0] + Math.cos(a) * r;
      const z = center[1] + Math.sin(a) * r;
      if (seabed.rockMask(x, z) > 0.2) continue;
      const s = rng.range(0.008, 0.035);
      e.set(rng.next() * 3, rng.next() * 3, rng.next() * 3);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(x, seabed.height(x, z) + s * 0.2, z), q, new THREE.Vector3(s * 1.3, s * 0.6, s));
      inst.setMatrixAt(placed, m);
      inst.setColorAt(placed, col.set(rng.pick(palette)));
      placed++;
    }
    inst.count = placed;
    inst.castShadow = true;
    inst.receiveShadow = true;
    return inst;
  }, [seabed, count, center, radius, seed]);
  return <primitive object={mesh} />;
};
