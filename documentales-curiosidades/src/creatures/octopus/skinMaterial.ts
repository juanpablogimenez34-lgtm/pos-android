import * as THREE from 'three';
import { patchMaterial } from '../../core/shaders/underwaterMaterial';

/**
 * Piel del pulpo con cromatóforos procedurales.
 * Controles (uniforms) que la dirección de escena anima:
 *   uCamo    0 = coloración de alerta (pardo rojizo), 1 = camuflaje de roca
 *   uPapillae relieve de las papilas (el pulpo eriza la piel para camuflarse)
 *   uWave    "nubes pasajeras": ondas oscuras que recorren el cuerpo
 */
export const createSkinUniforms = () => ({
  uCamo: { value: 0 },
  uPapillae: { value: 0.3 },
  uWave: { value: 0 },
  uBase: { value: new THREE.Color('#9a4a2c') },
  uDark: { value: new THREE.Color('#4a1d12') },
  uCamoA: { value: new THREE.Color('#5c5540') },
  uCamoB: { value: new THREE.Color('#211e15') },
  uVentralCol: { value: new THREE.Color('#e7cfc0') },
});

export type SkinUniforms = ReturnType<typeof createSkinUniforms>;

export const createSkinMaterial = (uniforms: SkinUniforms, opts: { side?: THREE.Side } = {}) => {
  const mat = new THREE.MeshPhysicalMaterial({
    roughness: 0.52,
    metalness: 0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.5,
    sheen: 0.12,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color('#ffb9a0'),
    side: opts.side ?? THREE.FrontSide,
  });
  return patchMaterial(
    mat,
    [
      {
        key: 'octopus-skin',
        uniforms: uniforms as unknown as Record<string, THREE.IUniform>,
        vertexHeader: /* glsl */ `
          attribute vec3 aSkin;
          attribute float aVentral;
          varying vec3 vSkin;
          varying float vVentral;
        `,
        vertexBeginExtra: 'vSkin = aSkin; vVentral = aVentral;',
        fragmentHeader: /* glsl */ `
          uniform float uCamo;
          uniform float uPapillae;
          uniform float uWave;
          uniform vec3 uBase;
          uniform vec3 uDark;
          uniform vec3 uCamoA;
          uniform vec3 uCamoB;
          uniform vec3 uVentralCol;
          varying vec3 vSkin;
          varying float vVentral;
          float skinSpots(vec3 p) { return smoothstep(0.6, 0.72, uwNoise(p * 42.0)); }
        `,
        fragmentColor: /* glsl */ `
          {
            vec3 sc = vSkin;
            float mott = uwFbm(sc * 14.0 + vec3(0.0, uTime * 0.12, 0.0));
            float fine = uwFbm(sc * 60.0);
            float spots = skinSpots(sc);
            float blotch = smoothstep(0.52, 0.6, uwFbm(sc * 9.0 + 11.0));
            // Retículo oscuro alrededor de las papilas (patrón "moteado" del camuflaje).
            float cells = abs(uwNoise(sc * 28.0) - 0.5) * 2.0;
            float reticle = 1.0 - smoothstep(0.0, 0.18, cells);
            float wave = smoothstep(0.2, 0.9, sin(sc.z * 30.0 + sc.y * 25.0 - uTime * 5.0)) * uWave;

            vec3 alert = mix(uBase, uDark, clamp(mott * 1.5 - 0.35, 0.0, 1.0));
            alert = mix(alert, uDark * 0.7, spots * 0.55);
            vec3 camo = mix(uCamoA, uCamoB, smoothstep(0.42, 0.55, mott));
            // Nota: los colores literales en GLSL están en espacio LINEAL.
            camo = mix(camo, vec3(0.16, 0.14, 0.09), blotch * 0.5);
            camo = mix(camo, camo * 0.55, reticle * 0.3);
            camo = mix(camo, vec3(0.2, 0.07, 0.05), spots * 0.35);
            vec3 col = mix(alert, camo, uCamo);
            col *= (1.0 - wave * 0.6) * (0.85 + 0.3 * fine);
            col = mix(col, uVentralCol, vVentral * (0.75 - uCamo * 0.35));
            diffuseColor.rgb = col;
          }
        `,
        fragmentNormal: /* glsl */ `
          {
            vec3 sc = vSkin;
            float pap = pow(uwNoise(sc * 48.0), 3.0);
            // Alturas en metros: la pendiente resultante (≈ amplitud × frecuencia) debe ser moderada.
            float h = uwNoise(sc * 110.0) * 0.00015
                    + uwFbm(sc * 35.0) * 0.0004
                    + skinSpots(sc) * 0.0003
                    + pap * 0.0011 * uPapillae
                    + uwFbm(sc * 14.0) * 0.0012 * uPapillae;
            normal = uwBump(-vViewPosition, normal, h * (1.0 - vVentral * 0.6));
          }
        `,
      },
    ],
    { caustics: 0.9 },
  );
};
