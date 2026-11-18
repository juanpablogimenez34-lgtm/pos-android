import {useCurrentFrame, useVideoConfig} from 'remotion';

/** Tiempo en segundos del fotograma actual (todo el motor anima en función de esto). */
export const useTime = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame / fps;
};
