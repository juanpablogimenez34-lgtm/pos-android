// ESCENA 8 · EL MISTERIO DE LOS TERREMOTOS (105–120 s · f 3150–3599). Costa estilizada en estilo de
// grabado; un pez remo junto a la superficie y ondas sísmicas simbólicas. «LEYENDA POPULAR».
import {JapanCoast} from '../components/Legends';
import {clamp, Fade, SceneOut, Tag, win} from './common';

export function scene08(t: number): SceneOut {
  const z = 1.08 - 0.08 * clamp((t - 105) / 15);
  return {
    svg: (
      <g transform={`translate(${540 - 540 * z} ${960 - 960 * z}) scale(${z})`}>
        <JapanCoast t={t} quake={win(t, 110.6, 119.4, 0.8)} />
      </g>
    ),
    overlay: (
      <>
        <Tag text="LEYENDA POPULAR" k={win(t, 105.6, 119.6, 0.6)} color="#ffd27a" top={240} />
        <Fade k={1 - clamp((t - 105) / 0.8)} color="#efe3c6" />
      </>
    ),
  };
}
