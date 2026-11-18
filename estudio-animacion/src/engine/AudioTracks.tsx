import React from 'react';
import {Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {AudioMix, AudioTrackSpec} from './types';

/**
 * Pistas de audio independientes. No incluye audio generado: cada pista sólo se
 * monta si su `src` apunta a un archivo real en /public. Ver public/audio/README.md.
 */
const Track: React.FC<{spec?: AudioTrackSpec}> = ({spec}) => {
  const {fps} = useVideoConfig();
  if (!spec?.src) return null;
  return (
    <Sequence from={Math.round((spec.at ?? 0) * fps)} layout="none">
      <Audio
        src={staticFile(spec.src)}
        volume={spec.volume ?? 1}
        startFrom={Math.round((spec.startFrom ?? 0) * fps)}
      />
    </Sequence>
  );
};

export const AudioTracks: React.FC<{mix: AudioMix}> = ({mix}) => (
  <>
    <Track spec={mix.ambience} />
    <Track spec={mix.music} />
    <Track spec={mix.movement} />
    <Track spec={mix.tension} />
    <Track spec={mix.transitions} />
    <Track spec={mix.narration} />
  </>
);
