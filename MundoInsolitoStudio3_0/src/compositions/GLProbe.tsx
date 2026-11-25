// Prueba de viabilidad: WebGL por software dentro de Remotion (luces, sombras, material PBR).
import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame, useVideoConfig} from 'remotion';

export const GLProbe: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows camera={{fov: 35, position: [0, 0.6, 4]}} style={{background: '#203040'}}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 5, 2]} intensity={2.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <mesh castShadow rotation={[0, f * 0.05, 0]} position={[0, 0.2, 0]}>
        <torusKnotGeometry args={[0.6, 0.22, 256, 48]} />
        <meshPhysicalMaterial color="#d79ea0" roughness={0.45} clearcoat={0.4} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#556644" />
      </mesh>
    </ThreeCanvas>
  );
};
