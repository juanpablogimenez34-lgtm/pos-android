import { ThreeCanvas } from '@remotion/three';
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { CinematicCamera } from '../../core/camera/CinematicCamera';
import { Boulders, Pebbles } from '../../core/environment/Boulders';
import { FishSchool } from '../../core/environment/FishSchool';
import { GodRays } from '../../core/environment/GodRays';
import { MarineSnow } from '../../core/environment/MarineSnow';
import { SunLight } from '../../core/environment/SunLight';
import { Terrain } from '../../core/environment/Terrain';
import { Vegetation } from '../../core/environment/Vegetation';
import { WaterVolume } from '../../core/environment/WaterVolume';
import { Shot } from '../../core/camera/shots';
import { Octopus } from '../../creatures/octopus/Octopus';
import { octopusBehavior } from './direction';
import {
  boulders,
  octopusGait,
  octopusMotion,
  SCENE_CENTER,
  seabed,
  SUN_DIR,
  vegetationExclude,
  WATER_LOOK,
} from './layout';

const BOX_MIN: [number, number, number] = [SCENE_CENTER[0] - 5, -0.3, SCENE_CENTER[1] - 4.5];
const BOX_SIZE: [number, number, number] = [10, 4, 9];
const FISH_CENTER: [number, number, number] = [1.2, 1.5, -2.8];
const FISH_RADIUS: [number, number] = [2.6, 1.3];

/** Escena 3D completa del episodio 1. `time` en segundos. */
export const Scene3D: React.FC<{ shots: Shot[] }> = ({ shots }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const time = frame / fps;
  const focus = octopusMotion.poseAt(time).position;

  return (
    <ThreeCanvas
      width={width}
      height={height}
      dpr={1}
      shadows={{ type: THREE.PCFSoftShadowMap }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 30, near: 0.02, far: 200, position: [0, 1, 3] }}
    >
      <WaterVolume look={WATER_LOOK} time={time} center={[SCENE_CENTER[0], 0, SCENE_CENTER[1]]} />
      <SunLight focus={focus} sunDir={SUN_DIR} intensity={2.6} shadowSize={2.2} />
      <CinematicCamera shots={shots} subject={octopusMotion} seabed={seabed} time={time} />

      <Terrain seabed={seabed} center={SCENE_CENTER} size={26} segments={420} />
      <Boulders seabed={seabed} boulders={boulders} />
      <Pebbles seabed={seabed} count={420} center={SCENE_CENTER} radius={4} seed={5} />
      <Vegetation
        seabed={seabed}
        center={SCENE_CENTER}
        radius={7}
        seed={12}
        exclude={vegetationExclude}
        kelpCount={260}
        grassCount={2600}
        spongeCount={70}
      />
      <GodRays count={7} center={SCENE_CENTER} spread={3} topY={8} seed={3} sunDir={SUN_DIR} />
      <FishSchool
        count={45}
        center={FISH_CENTER}
        radius={FISH_RADIUS}
        speed={0.12}
        fishLength={0.07}
        seed={8}
        time={time}
      />
      <MarineSnow count={7000} boxMin={BOX_MIN} boxSize={BOX_SIZE} seed={21} viewportHeight={height} />

      <Octopus seabed={seabed} motion={octopusMotion} gait={octopusGait} behavior={octopusBehavior} time={time} />
    </ThreeCanvas>
  );
};
