// PLATÓ DE ESTUDIO para fichas y prueba de giro: fondo degradado, iluminación de tres puntos y sombra de contacto.
import React, {useMemo} from 'react';
import * as THREE from 'three';

export const StudioLights: React.FC<{keyDir?: [number, number, number]}> = ({keyDir = [2.5, 4, 3]}) => (
  <>
    <hemisphereLight args={['#eef4f8', '#4a4038', 0.55]} />
    {/* luz principal cálida con sombras suaves */}
    <directionalLight position={keyDir} intensity={3.6} color="#fff2e6" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-2} shadow-camera-right={2} shadow-camera-top={2} shadow-camera-bottom={-2} shadow-bias={-0.0004} shadow-radius={4} />
    {/* relleno frío */}
    <directionalLight position={[-3, 1.5, 2]} intensity={1.1} color="#c8dcff" />
    {/* contraluz (recorte de silueta) */}
    <directionalLight position={[-1, 3, -4]} intensity={2.2} color="#ffe6d8" />
  </>
);

/** Fondo de estudio: esfera con degradado vertical y suelo que recibe la sombra de contacto. */
export const StudioBackdrop: React.FC<{top?: string; bottom?: string; floorY?: number}> = ({top = '#9aa8b2', bottom = '#3a4048', floorY = -0.42}) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {top: {value: new THREE.Color(top)}, bottom: {value: new THREE.Color(bottom)}},
        vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float t = smoothstep(-0.4, 0.8, vP.y); gl_FragColor = vec4(mix(bottom, top, t), 1.0); }',
      }),
    [top, bottom],
  );
  return (
    <>
      <mesh material={mat}>
        <sphereGeometry args={[30, 32, 16]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial opacity={0.35} />
      </mesh>
    </>
  );
};
