import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createRng } from '../math/noise';
import { patchMaterial } from '../shaders/underwaterMaterial';
import { Seabed } from './seabed';

/** Hoja de alga: tira estrecha que se afina, base en y=0, altura 1. */
const makeBladeGeometry = (widthRatio: number, segments: number, ruffle: number) => {
  const g = new THREE.PlaneGeometry(1, 1, 4, segments);
  g.translate(0, 0.5, 0);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const taper = Math.sin(Math.min(1, y * 1.15) * Math.PI * 0.5 + 0.35) * (1 - y * 0.75);
    const w = x * widthRatio * taper;
    // Ondulado del borde y ligera curvatura (las algas no son planas).
    const z = Math.sin(y * 18) * ruffle * Math.abs(x) + Math.pow(y, 2) * 0.08;
    pos.setXYZ(i, w, y, z);
  }
  g.computeVertexNormals();
  return g;
};

const swayPatch = (amp: number, key: string) => ({
  key,
  uniforms: { uSwayAmp: { value: amp } },
  vertexHeader: 'uniform float uSwayAmp;',
  vertexBeginExtra: /* glsl */ `
    {
      float hN = position.y;
      vec3 ip = vec3(0.0);
      #ifdef USE_INSTANCING
        ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
      #endif
      float ph = ip.x * 1.7 + ip.z * 1.3;
      // Oleaje de fondo: vaivén lento + turbulencia más rápida.
      float surge = sin(uTime * 0.75 + ip.x * 0.35) * 0.7;
      float sway = surge + sin(uTime * 1.6 + ph + hN * 3.0) * 0.3;
      float k = hN * hN * uSwayAmp;
      transformed.x += sway * k;
      transformed.z += (cos(uTime * 0.6 + ph) * 0.35 + 0.2) * k;
      transformed.y -= abs(sway) * k * 0.25;
    }
  `,
  fragmentColor: /* glsl */ `
    diffuseColor.rgb *= 0.8 + 0.4 * uwNoise(vUwWorldPos * vec3(30.0, 6.0, 30.0));
  `,
});

type VegetationProps = {
  seabed: Seabed;
  center: [number, number];
  radius: number;
  seed: number;
  /** Devuelve true si en (x,z) NO debe crecer nada (p. ej. el camino del pulpo). */
  exclude: (x: number, z: number, margin: number) => boolean;
  kelpCount: number;
  grassCount: number;
  spongeCount: number;
};

export const Vegetation: React.FC<VegetationProps> = ({
  seabed,
  center,
  radius,
  seed,
  exclude,
  kelpCount,
  grassCount,
  spongeCount,
}) => {
  const objects = useMemo(() => {
    const rng = createRng(seed);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const col = new THREE.Color();
    const randomPoint = (r: number) => {
      const a = rng.next() * Math.PI * 2;
      const d = Math.sqrt(rng.next()) * r;
      return [center[0] + Math.cos(a) * d, center[1] + Math.sin(a) * d] as const;
    };

    // --- Algas pardas altas (en grupos) ---
    const kelpGeo = makeBladeGeometry(0.09, 28, 0.05);
    const kelpMat = patchMaterial(
      new THREE.MeshStandardMaterial({ roughness: 0.6, side: THREE.DoubleSide }),
      [swayPatch(0.35, 'kelp')],
      { caustics: 0.8 },
    );
    const kelp = new THREE.InstancedMesh(kelpGeo, kelpMat, kelpCount);
    let k = 0;
    let kGuard = 0;
    while (k < kelpCount && kGuard++ < kelpCount * 20) {
      const [cx, cz] = randomPoint(radius);
      if (exclude(cx, cz, 0.8)) continue;
      const clump = 4 + Math.floor(rng.next() * 7);
      for (let j = 0; j < clump && k < kelpCount; j++) {
        const x = cx + rng.range(-0.25, 0.25);
        const z = cz + rng.range(-0.25, 0.25);
        const h = rng.range(0.5, 1.7);
        e.set(rng.range(-0.15, 0.15), rng.next() * Math.PI * 2, rng.range(-0.15, 0.15));
        q.setFromEuler(e);
        m.compose(new THREE.Vector3(x, seabed.height(x, z) - 0.02, z), q, new THREE.Vector3(h, h, h));
        kelp.setMatrixAt(k, m);
        kelp.setColorAt(k, col.setHSL(rng.range(0.13, 0.2), rng.range(0.35, 0.55), rng.range(0.2, 0.3)));
        k++;
      }
    }
    kelp.count = k;
    // Sin castShadow: el mapa de sombras no conoce el vaivén del vertex shader.
    kelp.receiveShadow = true;

    // --- Pradera de pasto marino corto ---
    const grassGeo = makeBladeGeometry(0.035, 6, 0.0);
    const grassMat = patchMaterial(
      new THREE.MeshStandardMaterial({ roughness: 0.7, side: THREE.DoubleSide }),
      [swayPatch(0.22, 'grass')],
      { caustics: 0.9 },
    );
    const grass = new THREE.InstancedMesh(grassGeo, grassMat, grassCount);
    let gI = 0;
    let guard = 0;
    while (gI < grassCount && guard++ < grassCount * 20) {
      const [cx, cz] = randomPoint(radius);
      if (exclude(cx, cz, 0.35) || seabed.rockMask(cx, cz) > 0.3) continue;
      const clump = 10 + Math.floor(rng.next() * 25);
      for (let j = 0; j < clump && gI < grassCount; j++) {
        const x = cx + rng.range(-0.18, 0.18);
        const z = cz + rng.range(-0.18, 0.18);
        if (exclude(x, z, 0.3)) continue;
        const h = rng.range(0.08, 0.28);
        e.set(rng.range(-0.3, 0.3), rng.next() * Math.PI * 2, rng.range(-0.3, 0.3));
        q.setFromEuler(e);
        m.compose(new THREE.Vector3(x, seabed.height(x, z) - 0.005, z), q, new THREE.Vector3(h, h, h));
        grass.setMatrixAt(gI, m);
        grass.setColorAt(gI, col.setHSL(rng.range(0.17, 0.26), rng.range(0.35, 0.55), rng.range(0.22, 0.34)));
        gI++;
      }
    }
    grass.count = gI;
    grass.receiveShadow = true;

    // --- Esponjas y corales blandos sobre la roca (toques de color) ---
    // Esponja tubular: cilindro abierto deformado (bultos orgánicos, boca más ancha).
    const spongeGeo = new THREE.CylinderGeometry(0.55, 0.7, 1, 18, 8, true);
    spongeGeo.translate(0, 0.5, 0);
    {
      const sp = spongeGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < sp.count; i++) {
        const x = sp.getX(i);
        const y = sp.getY(i);
        const z = sp.getZ(i);
        const a = Math.atan2(z, x);
        const bump = 1 + 0.12 * Math.sin(a * 3 + y * 5) + 0.08 * Math.sin(a * 7 - y * 9) + 0.15 * y * y;
        sp.setXYZ(i, x * bump, y, z * bump);
      }
      spongeGeo.computeVertexNormals();
    }
    const spongeMat = patchMaterial(
      new THREE.MeshStandardMaterial({ roughness: 0.9, side: THREE.DoubleSide }),
      [
        {
          key: 'sponge',
          fragmentNormal: 'normal = uwBump(-vViewPosition, normal, uwNoise(vUwWorldPos * 90.0) * 0.004);',
        },
      ],
      { caustics: 0.9 },
    );
    const sponges = new THREE.InstancedMesh(spongeGeo, spongeMat, spongeCount);
    const blobGeo = new THREE.IcosahedronGeometry(1, 3);
    {
      const bp = blobGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < bp.count; i++) {
        const x = bp.getX(i);
        const y = bp.getY(i);
        const z = bp.getZ(i);
        const n = 1 + 0.18 * Math.sin(x * 6 + z * 4) * Math.cos(z * 5 - y * 3);
        bp.setXYZ(i, x * n, y * n, z * n);
      }
      blobGeo.computeVertexNormals();
    }
    const blobs = new THREE.InstancedMesh(blobGeo, spongeMat, spongeCount);
    const palette = ['#c4552d', '#d8893a', '#7d3b6e', '#b8a23c', '#c96f7a'];
    let sI = 0;
    let bI = 0;
    guard = 0;
    while ((sI < spongeCount || bI < spongeCount) && guard++ < spongeCount * 60) {
      const [x, z] = randomPoint(radius);
      if (exclude(x, z, 0.35) || seabed.rockMask(x, z) < 0.9) continue;
      const y = seabed.height(x, z);
      if (rng.next() < 0.5 && sI < spongeCount) {
        const s = rng.range(0.025, 0.06);
        const h = rng.range(0.05, 0.16);
        e.set(rng.range(-0.2, 0.2), 0, rng.range(-0.2, 0.2));
        q.setFromEuler(e);
        m.compose(new THREE.Vector3(x, y - 0.01, z), q, new THREE.Vector3(s, h, s));
        sponges.setMatrixAt(sI, m);
        sponges.setColorAt(sI, col.set(rng.pick(palette)));
        sI++;
      } else if (bI < spongeCount) {
        const s = rng.range(0.02, 0.07);
        m.compose(new THREE.Vector3(x, y - s * 0.15, z), q.identity(), new THREE.Vector3(s, s * 0.35, s * 0.8));
        blobs.setMatrixAt(bI, m);
        blobs.setColorAt(bI, col.set(rng.pick(palette)).multiplyScalar(0.8));
        bI++;
      }
    }
    sponges.count = sI;
    blobs.count = bI;
    for (const o of [sponges, blobs]) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
    return [kelp, grass, sponges, blobs];
  }, [seabed, center, radius, seed, exclude, kelpCount, grassCount, spongeCount]);

  return (
    <group>
      {objects.map((o, i) => (
        <primitive key={i} object={o} />
      ))}
    </group>
  );
};
