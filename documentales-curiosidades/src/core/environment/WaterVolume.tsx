import { useThree } from '@react-three/fiber';
import React, { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { GLSL_NOISE } from '../shaders/chunks';
import { waterUniforms } from '../shaders/underwaterMaterial';

export type WaterLook = {
  /** Color del agua a distancia (niebla). */
  fogColor: string;
  fogDensity: number;
  /** Color cerca de la superficie (mirando hacia arriba). */
  surfaceColor: string;
  /** Color del abismo (mirando hacia abajo). */
  deepColor: string;
  exposure: number;
};

/**
 * Volumen de agua: niebla exponencial, cúpula con degradado y la superficie
 * ondulante vista desde abajo (ventana de Snell), y el tono de la imagen.
 */
export const WaterVolume: React.FC<{ look: WaterLook; time: number; center: [number, number, number] }> = ({
  look,
  time,
  center,
}) => {
  const { scene, gl } = useThree();

  useLayoutEffect(() => {
    scene.fog = new THREE.FogExp2(look.fogColor, look.fogDensity);
    scene.background = new THREE.Color(look.fogColor);
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = look.exposure;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [scene, gl, look]);

  // Reloj global del agua (cáusticas, algas, partículas).
  useLayoutEffect(() => {
    waterUniforms.uTime.value = time;
  }, [time]);

  const dome = useMemo(() => {
    const geo = new THREE.SphereGeometry(80, 64, 32);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uTime: waterUniforms.uTime,
        uFog: { value: new THREE.Color(look.fogColor) },
        uSurface: { value: new THREE.Color(look.surfaceColor) },
        uDeep: { value: new THREE.Color(look.deepColor) },
      },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_Position = p.xyww;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uFog;
        uniform vec3 uSurface;
        uniform vec3 uDeep;
        varying vec3 vDir;
        ${GLSL_NOISE}
        void main() {
          float y = vDir.y;
          vec3 col = mix(uFog, uDeep, smoothstep(0.0, -0.6, y));
          col = mix(col, uSurface, smoothstep(0.05, 0.9, y));
          // Ventana de Snell: superficie brillante y ondulante sobre nuestras cabezas.
          vec2 sp = vDir.xz / max(y, 0.05) * 3.0;
          float waves = uwFbm(vec3(sp, uTime * 0.25));
          float snell = smoothstep(0.55, 0.85, y);
          col += snell * (0.25 + 0.6 * pow(waves, 3.0)) * vec3(0.7, 0.95, 1.0);
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    });
    const m = new THREE.Mesh(geo, mat);
    m.frustumCulled = false;
    m.renderOrder = -1;
    return m;
  }, [look]);

  // Cúpula enorme (80 m) centrada en la escena: la cámara apenas se mueve unos metros.
  return <primitive object={dome} position={center} />;
};
