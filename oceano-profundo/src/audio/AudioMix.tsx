// MEZCLA DE AUDIO: voz + música con reducción automática (ducking) durante la voz + ambiente y efectos.
// El volumen de la música se calcula por fotograma a partir de los intervalos REALES de la locución.
import React from 'react';
import {Audio, staticFile} from 'remotion';
import {CONFIG} from '../config';

export type Track = {src: string; volume: number};
export const AudioMix: React.FC<{narration: string; music: string; speech: [number, number][]; others: Track[]; musicVolume?: number}> = ({narration, music, speech, others, musicVolume = CONFIG.audio.music}) => {
  const {musicDuck, duckAttack, duckRelease, fps} = {...CONFIG.audio, fps: CONFIG.fps};
  const duck = (f: number) => {
    const t = f / fps;
    let k = 0;
    for (const [a, b] of speech) {
      if (t < a - duckAttack || t > b + duckRelease) continue;
      const v = t < a ? (t - (a - duckAttack)) / duckAttack : t > b ? 1 - (t - b) / duckRelease : 1;
      k = Math.max(k, v);
    }
    return musicVolume * (1 - k * (1 - musicDuck));
  };
  return (
    <>
      <Audio src={staticFile(narration)} volume={CONFIG.audio.narration} />
      <Audio src={staticFile(music)} volume={duck} />
      {others.map((o) => <Audio key={o.src} src={staticFile(o.src)} volume={o.volume} />)}
    </>
  );
};
