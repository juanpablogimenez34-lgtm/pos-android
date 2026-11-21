// ESCENA 4 · EL OCÉANO PROFUNDO (45–60 s · f 1350–1799). Descenso vertical continuo: la luz disminuye,
// aparecen nieve marina y bioluminiscencia; el pez pasa como una silueta y se pierde en la oscuridad.
import {breathe, cam, clamp, Grade, lerp, Oarfish, OceanEnvironment, oarPose, OS, PaletteGrade, SceneOut, Tag, win} from './common';

export function scene04(t: number): SceneOut {
  const u = clamp((t - 45) / 15);
  const depth = lerp(0.35, 0.95, u * u * (3 - 2 * u));
  const camY = lerp(-2400, 2400, u);
  const c = breathe(cam(0, camY, 0.9), t, 0.8);
  const fx = lerp(-1200, 1600, clamp((t - 49) / 9));
  const p = oarPose({t, x: fx, y: camY + 260, scale: OS * 0.7, light: lerp(0.6, 0.15, u), persp: 0.6, fade: 0.6, sCurve: 60});
  return {
    svg: (
      <OceanEnvironment cam={c} t={t} depth={depth} fish={1 - depth * 0.7} lights={1.2}>
        <Oarfish uid="s4" p={p} />
      </OceanEnvironment>
    ),
    overlay: (
      <>
        <PaletteGrade depth={depth} />
        <Grade depth={0.3 + 0.6 * depth} vignette={0.75 + 0.2 * depth} />
        <Tag text="LA LUZ DISMINUYE" k={win(t, 49.0, 54.0, 0.5)} color="#3bcbd6" />
      </>
    ),
  };
}
