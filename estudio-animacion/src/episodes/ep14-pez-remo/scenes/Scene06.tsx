// ESCENA 6 · UN CAZADOR DE ORGANISMOS PEQUEÑOS (75–90 s · f 2250–2699). Enjambre de kril; el pez se
// acerca despacio, protrae la boca y los crustáceos cercanos desaparecen en ella (reconstrucción).
import {KrillSwarm} from '../components/OceanParticles';
import {breathe, cam, Caption, clamp, Grade, Oarfish, OceanEnvironment, oarPoint, oarPose, OS, PaletteGrade, SceneOut, shot, Tag, win} from './common';

export function scene06(t: number): SceneOut {
  const x = -600 + Math.min(t - 75, 9) * 70 + Math.max(0, t - 84) * 15;
  const mouth = clamp((t - 80.6) / 0.6) * (0.6 + 0.4 * Math.abs(Math.sin((t - 80.6) * 2.4)));
  const p = oarPose({t, x, y: 30, scale: OS, light: 0.75, sCurve: 18, mouth});
  const mo = oarPoint(p, -0.018, 0.3);
  let c = shot(t, 75, 80, cam(160, 0, 1.0), cam(mo.x + 40, mo.y, 1.9), 'cine');
  if (t > 80) c = shot(t, 80, 90, cam(mo.x + 40, mo.y, 1.9), cam(mo.x + 10, mo.y, 2.4), 'linear');
  c = breathe(c, t, 0.4);
  return {
    svg: (
      <OceanEnvironment cam={c} t={t} depth={0.7} fish={0.2}>
        <KrillSwarm t={t} cx={260} cy={20} w={900} h={520} n={80} mouth={{x: mo.x, y: mo.y, r: 150, since: 80.6}} />
        <Oarfish uid="s6" p={p} />
      </OceanEnvironment>
    ),
    overlay: (
      <>
        <PaletteGrade depth={0.7} />
        <Grade depth={0.6} vignette={0.85} />
        <Caption text="Kril y otros crustáceos" k={win(t, 81.8, 87.4, 0.4)} top={190} />
        <Tag text="RECONSTRUCCIÓN VISUAL" k={win(t, 76.0, 80.4, 0.5)} color="#3bcbd6" />
      </>
    ),
  };
}
