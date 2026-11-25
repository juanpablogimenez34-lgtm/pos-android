// VISTAS DE LA HOJA DE MODELO: el mismo modelo, la misma pose de referencia y la misma escala en todas las vistas.
import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useVideoConfig} from 'remotion';
import {IniaDolphin} from '../characters/inia/IniaDolphin';
import {IniaPose, L, restPose} from '../characters/inia/model';
import {StudioBackdrop, StudioLights} from '../environments/Studio';

export type SheetViewName = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom' | 'threeQuarter' | 'head' | 'eye' | 'mouth' | 'flipper' | 'skin' | 'juvenile';
const SNOUT = 0.42 * L; // la raíz del esqueleto (s = 0,42) está en el origen
const CX = SNOUT - 0.5 * L; // centro del cuerpo
const HX = SNOUT - 0.17 * L; // cabeza (ojo/melón)
type Cam = {pos: [number, number, number]; target: [number, number, number]; fov: number};
export const VIEWS: Record<SheetViewName, Cam> = {
  left: {pos: [CX, 0.08, 4.1], target: [CX, 0, 0], fov: 34},
  right: {pos: [CX, 0.08, -4.1], target: [CX, 0, 0], fov: 34},
  front: {pos: [SNOUT + 1.9, 0.12, 0.0001], target: [HX, 0, 0], fov: 24},
  back: {pos: [CX - 3.6, 0.2, 0.0001], target: [CX, 0, 0], fov: 22},
  top: {pos: [CX, 4.2, 0.0001], target: [CX, 0, 0], fov: 34},
  bottom: {pos: [CX, -4.2, 0.0001], target: [CX, 0, 0], fov: 34},
  threeQuarter: {pos: [SNOUT + 0.9, 1.0, 2.6], target: [CX + 0.15, -0.02, 0], fov: 40},
  head: {pos: [SNOUT + 0.15, 0.16, 0.85], target: [HX + 0.12, 0.0, 0], fov: 30},
  eye: {pos: [HX + 0.09, 0.07, 0.36], target: [HX - 0.005, 0.012, 0.09], fov: 22},
  mouth: {pos: [SNOUT + 0.05, 0.02, 0.62], target: [HX + 0.18, -0.04, 0], fov: 32},
  flipper: {pos: [HX - 0.3, -0.62, 0.95], target: [HX - 0.32, -0.2, 0.22], fov: 32},
  skin: {pos: [CX + 0.3, 0.4, 0.6], target: [CX + 0.25, 0.12, 0.14], fov: 22},
  juvenile: {pos: [SNOUT + 0.3, 0.75, 2.4], target: [CX * 0.6, 0, 0], fov: 38},
};

export const sheetPose = (view: SheetViewName): IniaPose => ({...restPose(), amp: 0, phase: 0, jaw: view === 'mouth' ? 0.85 : 0, headYaw: 0, flipL: view === 'flipper' ? [0.35, -0.1, 0.2] : [0, 0, 0], flipR: [0, 0, 0], age: view === 'juvenile' ? 0 : 1});

export const SheetView: React.FC<{view: SheetViewName}> = ({view}) => {
  const {width, height} = useVideoConfig();
  const c = VIEWS[view];
  const pose = sheetPose(view);
  return (
    <ThreeCanvas width={width} height={height} shadows gl={{antialias: true}} camera={{fov: c.fov, position: c.pos, near: 0.01, far: 100}} onCreated={({camera, gl}) => {camera.lookAt(...c.target); gl.toneMapping = 7; gl.toneMappingExposure = 1.0;}}>
      <StudioBackdrop floorY={['top', 'bottom', 'head', 'eye', 'mouth', 'skin', 'flipper'].includes(view) ? -5 : -0.42} />
      <StudioLights />
      <IniaDolphin pose={pose} scale={view === 'juvenile' ? 0.62 : 1} position={view === 'juvenile' ? [SNOUT * 0.38 * 0, 0, 0] : [0, 0, 0]} />
    </ThreeCanvas>
  );
};
