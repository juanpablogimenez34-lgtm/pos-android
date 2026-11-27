// ESCENA 3 · UN CUERPO EXTRAORDINARIO (30–45 s · f 900–1349). Comparación de escala con una persona
// (ejemplar ilustrativo de 5 m a la misma escala) y recorrido de cámara a lo largo del cuerpo.
import {AbsoluteFill} from 'remotion';
import {ScaleCompare} from '../components/Exploration';
import {breathe, cam, DocTitle, Grade, Oarfish, OceanEnvironment, oarPoint, oarPose, OS, PaletteGrade, SceneOut, shot, win} from './common';

export function scene03(t: number): SceneOut {
  const x = 2100 + (t - 30) * 40;
  const p = oarPose({t, x, y: -280, scale: OS, light: 0.85, sCurve: 24});
  const a = oarPoint(p, 0.15);
  const b = oarPoint(p, 0.85);
  let c = shot(t, 30, 37.6, cam((a.x + b.x) / 2, -60, 0.5), cam((a.x + b.x) / 2 + 80, -60, 0.52), 'linear');
  if (t > 37.6) c = shot(t, 37.6, 45, cam(a.x, a.y, 1.5), cam(b.x, b.y, 1.6), 'cine');
  c = breathe(c, t, 0.5);
  return {
    svg: (
      <OceanEnvironment cam={c} t={t} depth={0.55} fish={0.5}>
        <Oarfish uid="s3" p={p} />
      </OceanEnvironment>
    ),
    overlay: (
      <>
        <PaletteGrade depth={0.55} />
        <Grade depth={0.5} vignette={0.8} />
        <DocTitle text="UN GIGANTE EN FORMA DE CINTA" k={win(t, 34.4, 40.4, 0.5)} top={240} size={58} />
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <ScaleCompare t={t} k={win(t, 30.6, 37.4, 0.6)} />
          </svg>
        </AbsoluteFill>
      </>
    ),
  };
}
