// ESCENA 9 · ¿PUEDE PREDECIR TERREMOTOS? (120–135 s · f 3600–4049). Mito frente a evidencia, con un
// gráfico ilustrativo sin datos reales; «NO HAY EVIDENCIA SÓLIDA». Tono educativo.
import {AbsoluteFill} from 'remotion';
import {MythVsEvidence} from '../components/Legends';
import {breathe, cam, clamp, DocTitle, Fade, Grade, Oarfish, OceanEnvironment, oarPose, OS, PaletteGrade, SceneOut, win} from './common';

export function scene09(t: number): SceneOut {
  const c = breathe(cam(0, 0, 0.7), t, 0.6);
  const p = oarPose({t, x: -900 + (t - 120) * 90, y: 900, scale: OS * 0.6, light: 0.35, fade: 0.5, persp: 0.4});
  return {
    svg: (
      <OceanEnvironment cam={c} t={t} depth={0.75} fish={0.3}>
        <Oarfish uid="s9" p={p} />
      </OceanEnvironment>
    ),
    overlay: (
      <>
        <PaletteGrade depth={0.75} />
        <Grade depth={0.7} vignette={0.85} />
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <MythVsEvidence t={t} u={clamp((t - 121) / 6)} k={win(t, 120.4, 134.6, 0.6)} />
          </svg>
        </AbsoluteFill>
        <DocTitle text="NO HAY EVIDENCIA SÓLIDA" k={win(t, 126.6, 134.4, 0.5)} top={200} color="#3bcbd6" size={56} />
        <Fade k={1 - clamp((t - 120) / 0.6)} color="#efe3c6" />
      </>
    ),
  };
}
