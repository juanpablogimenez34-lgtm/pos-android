import React from 'react';
import {Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {clamp} from './math';
import {AudioMix, AudioTrackSpec, DuckInterval} from './types';

/** Ganancia de ducking en el instante t: ataque 0,25 s antes de la voz, liberación 0,6 s. */
export function duckGain(t: number, intervals: DuckInterval[], duckTo: number, attack = 0.25, release = 0.6) {
  let k = 0;
  for (const iv of intervals) {
    if (t < iv.start - attack || t > iv.end + release) continue;
    const a = clamp((t - (iv.start - attack)) / attack);
    const r = clamp(1 - (t - iv.end) / release);
    k = Math.max(k, Math.min(a, r));
  }
  return 1 - (1 - duckTo) * k;
}

/**
 * Pistas de audio independientes. Cada pista sólo se monta si su `src` apunta a
 * un archivo real en /public. La música admite ducking automático bajo la voz.
 */
const Track: React.FC<{spec?: AudioTrackSpec}> = ({spec}) => {
  const {fps} = useVideoConfig();
  if (!spec?.src) return null;
  const at = spec.at ?? 0;
  const base = spec.volume ?? 1;
  const duck = spec.duck;
  return (
    <Sequence from={Math.round(at * fps)} layout="none">
      <Audio
        src={staticFile(spec.src)}
        volume={duck ? (f) => base * duckGain(at + f / fps, duck, spec.duckTo ?? 0.35) : base}
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
