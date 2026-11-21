// ESCENA 7 · LA SERPIENTE DE LAS LEYENDAS (90–105 s · f 2700–3149). Antiguo velero de noche; los
// marineros observan una larga silueta ondulante. Rotulado como representación de una leyenda.
import {AbsoluteFill} from 'remotion';
import {LegendNight} from '../components/Legends';
import {clamp, Fade, Grade, SceneOut, Tag, win} from './common';

export function scene07(t: number): SceneOut {
  const z = 1 + 0.12 * clamp((t - 90) / 15);
  const ox = (t - 90) * 4;
  return {
    svg: (
      <g transform={`translate(${540 - 540 * z + ox} ${960 - 960 * z})`}>
        <g transform={`scale(${z})`}>
          <LegendNight t={t} />
        </g>
      </g>
    ),
    overlay: (
      <>
        <Grade depth={0.6} vignette={0.95} warm={0.15} />
        <Tag text="REPRESENTACIÓN DE UNA LEYENDA" k={win(t, 90.6, 104.4, 0.6)} />
        <Fade k={1 - clamp((t - 90) / 0.8)} />
        <AbsoluteFill />
      </>
    ),
  };
}
