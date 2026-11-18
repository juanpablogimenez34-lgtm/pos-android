import React, { useMemo } from 'react';
import * as THREE from 'three';
import { clamp, fbm2 } from '../math/noise';
import { patchMaterial } from '../shaders/underwaterMaterial';
import { Seabed } from './seabed';

type Props = {
  seabed: Seabed;
  center: [number, number];
  size: number;
  segments: number;
};

const SAND_A = new THREE.Color('#b29c74');
const SAND_B = new THREE.Color('#8a7856');
const ROCK_A = new THREE.Color('#5e5a4f');
const ROCK_B = new THREE.Color('#3b3a34');
const ALGAE = new THREE.Color('#4f5a33');

/**
 * Malla del fondo marino desplazada con la función de altura.
 * Color por vértice (arena / roca / costra de algas) + detalle fino por píxel.
 */
export const Terrain: React.FC<Props> = ({ seabed, center, size, segments }) => {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, segments, segments);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const rockAttr = new Float32Array(pos.count);
    const c = new THREE.Color();
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + center[0];
      const z = pos.getZ(i) + center[1];
      const rockH = seabed.rock(x, z);
      const y = seabed.sand(x, z) + rockH;
      pos.setXYZ(i, x, y, z);
      const rock = seabed.rockMask(x, z);
      rockAttr[i] = rock;
      // Arena con manchas
      c.copy(SAND_A).lerp(SAND_B, clamp(0.5 + fbm2(x * 1.3, z * 1.3, 3, 21) * 1.6, 0, 1));
      // Roca con vetas y costras de algas en la parte alta
      tmp.copy(ROCK_A).lerp(ROCK_B, clamp(0.5 + fbm2(x * 3.1, z * 3.1, 3, 33) * 2.0, 0, 1));
      const algae = Math.max(0, fbm2(x * 2.0, z * 2.0, 3, 44) * 2.4) * Math.min(1, rockH * 6);
      tmp.lerp(ALGAE, Math.min(0.85, algae));
      c.lerp(tmp, rock);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.setAttribute('aRock', new THREE.BufferAttribute(rockAttr, 1));
    g.computeVertexNormals();
    return g;
  }, [seabed, center, size, segments]);

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 });
    return patchMaterial(
      m,
      [
        {
          key: 'terrain',
          vertexHeader: 'attribute float aRock; varying float vRock;',
          vertexBeginExtra: 'vRock = aRock;',
          fragmentHeader: 'varying float vRock;',
          fragmentColor: /* glsl */ `
            float grain = uwNoise(vUwWorldPos * 55.0);
            float speck = step(0.93, uwNoise(vUwWorldPos * 140.0));
            vec3 sandCol = diffuseColor.rgb * (0.88 + 0.24 * grain) + speck * 0.04;
            float pores = uwFbm(vUwWorldPos * 22.0);
            float lichen = smoothstep(0.68, 0.76, uwNoise(vUwWorldPos * 40.0 + 4.0));
            vec3 rockCol = diffuseColor.rgb * (0.7 + 0.6 * pores);
            rockCol = mix(rockCol, vec3(0.25, 0.08, 0.07), lichen * 0.2);
            diffuseColor.rgb = mix(sandCol, rockCol, vRock);
          `,
          fragmentNormal: /* glsl */ `
            float hSand = uwNoise(vUwWorldPos * 60.0) * 0.0015;
            float hRock = (uwFbm(vUwWorldPos * 14.0) * 0.022 + uwNoise(vUwWorldPos * 48.0) * 0.003);
            normal = uwBump(-vViewPosition, normal, mix(hSand, hRock, vRock));
          `,
        },
      ],
      { caustics: 1.1 },
    );
  }, []);

  return <mesh geometry={geometry} material={material} receiveShadow castShadow />;
};
