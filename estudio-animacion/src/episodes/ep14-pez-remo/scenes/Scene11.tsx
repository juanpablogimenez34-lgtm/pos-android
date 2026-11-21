// ESCENA 11 · EL VERDADERO MISTERIO (150–165 s · f 4500–4949). Plano majestuoso en aguas azules; la cámara
// se aleja progresivamente mientras el pez se desliza con su aleta ondulante.
import {breathe, cam, Grade, Oarfish, OceanEnvironment, oarPoint, oarPose, OS, PaletteGrade, SceneOut, ScreenRays, shot} from './common';

export function scene11(t: number): SceneOut {
  const x = -200 + (t - 150) * 70;
  const p = oarPose({t, x, y: 0, scale: OS, light: 0.95, sCurve: 70, sPhase: 0.6, persp: 0.3, fade: 0.2});
  const m = oarPoint(p, 0.25);
  const c = breathe(shot(t, 150, 165, cam(m.x + 60, m.y - 20, 1.3), cam(m.x - 300, -100, 0.42), 'cine'), t, 0.6);
  return {
    svg: (
      <OceanEnvironment cam={c} t={t} depth={0.42} fish={0.7}>
        <Oarfish uid="s11" p={p} />
      </OceanEnvironment>
    ),
    overlay: (
      <>
        <ScreenRays t={t} k={0.45} />
        <PaletteGrade depth={0.42} />
        <Grade depth={0.35} vignette={0.75} />
      </>
    ),
  };
}
