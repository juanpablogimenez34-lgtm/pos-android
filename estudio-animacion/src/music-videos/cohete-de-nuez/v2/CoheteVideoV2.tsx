// "Nuestro cohete de nuez" — REMASTERIZACIÓN 2.0. Misma canción (MP3 original sin cambios),
// misma duración (4.278 fotogramas a 30 fps), mismos personajes y cohete. La puesta en escena es
// una lista de planos cortados en pulsos medidos (Shots/shot.ts). La v1 (CoheteVideo) no se toca.
import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {ensureFonts} from '../../../engine/fonts';
import {useTime} from '../../../engine/useTime';
import {SharedDefs} from '../Characters/parts';
import {Vignette} from '../Effects/Fx';
import {ALL_SHOTS, shotAt} from './Shots/list';

export const CoheteVideoV2: React.FC<{withAudio?: boolean; offset?: number}> = ({withAudio = true, offset = 0}) => {
  ensureFonts();
  const t = useTime() + offset;
  const {shot, lt, dur} = shotAt(t);
  return (
    <AbsoluteFill style={{background: '#2a1a5a', overflow: 'hidden'}}>
      <svg width={1080} height={1920}>
        <SharedDefs />
        {shot.r(t, lt, dur)}
      </svg>
      <Vignette k={0.7} />
      {withAudio && <Audio src={staticFile('music/nuestro_cohete_de_nuez.mp3')} startFrom={Math.round(offset * 30)} />}
    </AbsoluteFill>
  );
};
export {ALL_SHOTS};
