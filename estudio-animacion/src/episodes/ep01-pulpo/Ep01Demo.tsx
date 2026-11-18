import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {AudioTracks} from '../../engine/AudioTracks';
import {cameraAt, CameraProvider} from '../../engine/camera';
import {ensureFonts} from '../../engine/fonts';
import {smoothstep} from '../../engine/math';
import {QualityName, QualityProvider, QUALITY} from '../../engine/quality';
import {Subtitles} from '../../engine/Subtitles';
import {TitleCard} from '../../engine/TitleCard';
import {AudioMix} from '../../engine/types';
import {useTime} from '../../engine/useTime';
import {EyeShine, Octopus} from '../../creatures/octopus/Octopus';
import {computeOctopusPose} from '../../creatures/octopus/pose';
import {OCTOPUS_VULGARIS} from '../../creatures/octopus/rig';
import {Grade} from '../../environments/underwater/Grade';
import {UW} from '../../environments/underwater/palette';
import {caveDarknessAt} from '../../environments/underwater/Rocks';
import {CAVE_REEF, CaveReefStage, groundY} from '../../environments/underwater/sets/CaveReefSet';
import {DEMO_BLINKS, DEMO_CAMERA, DEMO_CUES, demoGaze, demoMotion, demoState} from './demo.config';

export type Ep01DemoProps = {
  quality: QualityName;
  showSubtitles: boolean;
  audio: AudioMix;
};

export const Ep01Demo: React.FC<Ep01DemoProps> = ({quality, showSubtitles, audio}) => {
  ensureFonts();
  const t = useTime();
  const {width, height} = useVideoConfig();
  const camera = cameraAt(DEMO_CAMERA, t);
  const pose = computeOctopusPose({
    t,
    rig: OCTOPUS_VULGARIS,
    state: demoState(t),
    motion: demoMotion,
    ground: groundY,
    gaze: demoGaze(t),
    blinks: DEMO_BLINKS,
    segments: QUALITY[quality].armSegments,
  });
  const eyeWorld = pose.toWorld(pose.eyes[0].local);
  const shine = caveDarknessAt(CAVE_REEF.caveMouth, eyeWorld) * smoothstep(2.7, 3.6, t);

  return (
    <QualityProvider quality={quality}>
      <CameraProvider camera={camera} viewport={{width, height}} anchor={CAVE_REEF.anchor}>
        <AbsoluteFill style={{backgroundColor: UW.abyss}}>
          <CaveReefStage
            hero={<Octopus id="octo" pose={pose} skin={OCTOPUS_VULGARIS.skin} groundY={groundY(pose.body.x)} />}
            heroOverlay={<EyeShine pose={pose} strength={shine} />}
          />
          <Grade />
          <TitleCard start={13.0} kicker="EL ANIMAL CON" title="TRES CORAZONES" centerY={0.17} icons={3} />
          {showSubtitles && <Subtitles cues={DEMO_CUES} centerY={0.75} />}
          <AudioTracks mix={audio} />
        </AbsoluteFill>
      </CameraProvider>
    </QualityProvider>
  );
};
