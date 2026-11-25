// PRUEBA A — HOJA ANATÓMICA del puma: el MISMO modelo 3D visto desde todos los ángulos, más etapas de edad.
import React from 'react';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {Puma} from '../characters/Puma';
import {growPuma} from '../anatomy/rig';
import {standPose} from '../anatomy/poses';
import {StudioBackdrop} from '../../../environments/Studio';

export type PumaView = 'left' | 'right' | 'front' | 'back' | 'threeQuarter' | 'top' | 'low' | 'head' | 'headSide' | 'paw' | 'cub' | 'newborn' | 'juvenile' | 'tail';
type V3 = [number, number, number];

const VIEWS: Record<PumaView, {cam: V3; look: V3; fov: number; age?: number; jaw?: number; blink?: number; liftPaw?: boolean}> = {
  left: {cam: [0.12, 0.5, 3.4], look: [0.12, 0.42, 0], fov: 38},
  right: {cam: [0.12, 0.5, -3.4], look: [0.12, 0.42, 0], fov: 38},
  front: {cam: [3.0, 0.62, 0.0], look: [0.4, 0.42, 0], fov: 30},
  back: {cam: [-3.0, 0.75, 0.0], look: [0.2, 0.42, 0], fov: 30},
  threeQuarter: {cam: [2.2, 0.95, 2.3], look: [0.25, 0.42, 0], fov: 34},
  top: {cam: [0.15, 3.6, 0.01], look: [0.15, 0.3, 0], fov: 36},
  low: {cam: [1.6, 0.12, 1.5], look: [0.3, 0.5, 0], fov: 40},
  head: {cam: [1.6, 0.74, 0.35], look: [0.92, 0.68, 0], fov: 22, jaw: 0},
  headSide: {cam: [0.92, 0.7, 0.75], look: [0.9, 0.67, 0], fov: 24, jaw: 0.6},
  paw: {cam: [0.95, 0.12, 0.55], look: [0.72, 0.06, 0.05], fov: 26, liftPaw: true},
  tail: {cam: [-0.55, 0.6, 1.7], look: [-0.45, 0.35, 0], fov: 34},
  cub: {cam: [0.9, 0.38, 1.15], look: [0.1, 0.16, 0], fov: 30, age: 0.35},
  juvenile: {cam: [1.5, 0.65, 2.0], look: [0.2, 0.32, 0], fov: 32, age: 0.65},
  newborn: {cam: [0.45, 0.22, 0.55], look: [0.05, 0.06, 0], fov: 30, age: 0.0, blink: 1},
};

export const PumaSheet: React.FC<{view: PumaView}> = ({view}) => {
  const {width, height} = useVideoConfig();
  const V = VIEWS[view];
  const age = V.age ?? 1;
  const sp = growPuma(age);
  const pose = standPose(sp, 0, 0, 0, 0);
  pose.jaw = V.jaw ?? 0;
  pose.blink = V.blink ?? 0;
  pose.headYaw = view === 'head' ? 0.0 : 0;
  pose.tailBase = -1.15;
  pose.tailCurl = 1.5;
  if (V.liftPaw) {
    // mano izquierda levantada mostrando las almohadillas
    const t = pose.legs.LF.target;
    pose.legs.LF = {target: t.clone().add(new THREE.Vector3(0.02, 0.16, 0)), lift: 0.16, pawPitch: -2.0, contact: 0};
  }
  return (
    <AbsoluteFill style={{background: '#30363c'}}>
      <ThreeCanvas width={width} height={height} shadows gl={{antialias: true}} camera={{fov: V.fov, position: V.cam, near: 0.02, far: 100}} onCreated={({gl}) => {gl.toneMapping = 7; gl.toneMappingExposure = 1.05;}}>
        <Aim pos={V.cam} target={V.look} fov={V.fov} />
        <PumaStudioLights />
        <StudioBackdrop top="#b4b8b0" bottom="#4c4a44" floorY={0} />
        <Puma pose={pose} age={age} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

const Aim: React.FC<{pos: V3; target: V3; fov: number}> = ({pos, target, fov}) => {
  const {camera} = useThree();
  camera.position.set(...pos);
  camera.lookAt(...target);
  (camera as THREE.PerspectiveCamera).fov = fov;
  camera.updateProjectionMatrix();
  return null;
};

/** Luces de estudio del puma: clave cálida con sombra (sesgo normal contra el acné de sombra), relleno frío y contraluz. */
export const PumaStudioLights: React.FC = () => (
  <>
    <hemisphereLight args={['#eef0f2', '#51463a', 0.7]} />
    <directionalLight position={[2.2, 4, 3]} intensity={3.2} color="#fff0de" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-1.6} shadow-camera-right={1.6} shadow-camera-top={1.6} shadow-camera-bottom={-1.6} shadow-bias={-0.0005} shadow-normalBias={0.025} />
    <directionalLight position={[-3, 1.5, 2]} intensity={0.9} color="#c8d8f0" />
    <directionalLight position={[-1, 3, -4]} intensity={2.0} color="#ffe2c8" />
  </>
);
