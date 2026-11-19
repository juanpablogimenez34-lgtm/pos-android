import React from 'react';
import {useVideoConfig} from 'remotion';
import {cameraAt, CameraProvider} from '../../../engine/camera';
import {useTime} from '../../../engine/useTime';
import {Forest} from '../../../environments/moss/Moss';
import {FOREST_ANCHOR, FOREST_CAM} from '../cameras';

/** Entornos A y G: bosque húmedo con su propia cámara. */
export const ForestScene: React.FC = () => {
  const t = useTime();
  const {width, height} = useVideoConfig();
  return (
    <CameraProvider camera={cameraAt(FOREST_CAM, t)} viewport={{width, height}} anchor={FOREST_ANCHOR}>
      <Forest />
    </CameraProvider>
  );
};
