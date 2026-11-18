import React, { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';

/**
 * Iluminación submarina:
 *  - Sol filtrado por el agua (direccional con sombras suaves que sigue al sujeto).
 *  - Luz hemisférica: azul desde arriba, rebote cálido de la arena desde abajo.
 */
export const SunLight: React.FC<{
  focus: THREE.Vector3;
  sunDir: [number, number, number];
  intensity: number;
  shadowSize: number;
}> = ({ focus, sunDir, intensity, shadowSize }) => {
  const light = useMemo(() => {
    const l = new THREE.DirectionalLight('#e3f6ff', intensity);
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    l.shadow.camera.near = 0.5;
    l.shadow.camera.far = 30;
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.015;
    l.shadow.radius = 4;
    return l;
  }, [intensity]);

  useLayoutEffect(() => {
    const cam = light.shadow.camera;
    cam.left = -shadowSize;
    cam.right = shadowSize;
    cam.top = shadowSize;
    cam.bottom = -shadowSize;
    cam.updateProjectionMatrix();
  }, [light, shadowSize]);

  useLayoutEffect(() => {
    const d = new THREE.Vector3(...sunDir).normalize().multiplyScalar(12);
    light.position.copy(focus).add(d);
    light.target.position.copy(focus);
    light.target.updateMatrixWorld();
  });

  return (
    <>
      <primitive object={light} />
      <primitive object={light.target} />
      <hemisphereLight args={['#5aa8d8', '#5e5238', 0.85]} />
      <ambientLight color="#1d4a5e" intensity={0.25} />
    </>
  );
};
