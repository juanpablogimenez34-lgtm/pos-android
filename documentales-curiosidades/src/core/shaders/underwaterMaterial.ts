import * as THREE from 'three';
import { GLSL_BUMP, GLSL_CAUSTICS, GLSL_NOISE } from './chunks';

/**
 * Uniforms globales del "agua", compartidos por todos los materiales.
 * Se actualizan una vez por fotograma desde <UnderwaterWorld/>.
 */
export const waterUniforms = {
  uTime: { value: 0 },
  uCausticStrength: { value: 1.0 },
  uCausticColor: { value: new THREE.Color('#bfeeff') },
};

type Shader = THREE.WebGLProgramParametersWithUniforms;

export type ShaderPatch = {
  key: string;
  uniforms?: Record<string, THREE.IUniform>;
  vertexHeader?: string;
  vertexBeginExtra?: string; // tras #include <begin_vertex>
  fragmentHeader?: string;
  fragmentColor?: string; // tras #include <color_fragment>  (modifica diffuseColor)
  fragmentEnd?: string; // antes de #include <fog_fragment> (modifica gl_FragColor)
  /** Sustituye #include <normal_fragment_maps> para perturbar la normal. */
  fragmentNormal?: string;
};

/**
 * Inyecta código en un material estándar de Three.js sin perder
 * iluminación PBR, sombras ni niebla.
 * Siempre añade la posición en mundo (vUwWorldPos) y cáusticas opcionales.
 */
export const patchMaterial = <T extends THREE.Material>(
  material: T,
  patches: ShaderPatch[],
  opts: { caustics?: number } = {},
): T => {
  const causticAmount = opts.caustics ?? 0;
  const keys = patches.map((p) => p.key).join('|') + `|c${causticAmount}`;

  material.onBeforeCompile = (shader: Shader) => {
    shader.uniforms.uTime = waterUniforms.uTime;
    shader.uniforms.uCausticStrength = waterUniforms.uCausticStrength;
    shader.uniforms.uCausticColor = waterUniforms.uCausticColor;
    for (const p of patches) Object.assign(shader.uniforms, p.uniforms ?? {});

    const vHead = patches.map((p) => p.vertexHeader ?? '').join('\n');
    const vBegin = patches.map((p) => p.vertexBeginExtra ?? '').join('\n');
    const fHead = patches.map((p) => p.fragmentHeader ?? '').join('\n');
    const fColor = patches.map((p) => p.fragmentColor ?? '').join('\n');
    const fEnd = patches.map((p) => p.fragmentEnd ?? '').join('\n');
    const fNormal = patches.map((p) => p.fragmentNormal ?? '').join('\n');

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uTime;
varying vec3 vUwWorldPos;
${GLSL_NOISE}
${vHead}`,
      )
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${vBegin}`)
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
{
  vec4 uwp = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    uwp = instanceMatrix * uwp;
  #endif
  vUwWorldPos = (modelMatrix * uwp).xyz;
}`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uTime;
uniform float uCausticStrength;
uniform vec3 uCausticColor;
varying vec3 vUwWorldPos;
${GLSL_NOISE}
${GLSL_CAUSTICS}
${GLSL_BUMP}
${fHead}`,
      )
      .replace('#include <color_fragment>', `#include <color_fragment>\n${fColor}`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>\n${fNormal}`)
      .replace(
        '#include <fog_fragment>',
        `${fEnd}
${
  causticAmount > 0
    ? `{
  // Las cáusticas modulan SOLO la luz directa del sol (ya incluye sombras y N·L):
  // bajo el cuerpo del pulpo no hay cáusticas, igual que en la realidad.
  float cst = uwCaustics(vUwWorldPos, uTime);
  gl_FragColor.rgb += reflectedLight.directDiffuse * uCausticColor * cst * uCausticStrength * ${causticAmount.toFixed(3)};
}`
    : ''
}
#include <fog_fragment>`,
      );
  };
  material.customProgramCacheKey = () => keys;
  return material;
};
