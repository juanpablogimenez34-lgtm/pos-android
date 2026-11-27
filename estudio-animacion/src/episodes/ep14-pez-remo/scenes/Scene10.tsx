// ESCENA 10 · UN ENCUENTRO CASI IMPOSIBLE (135–150 s · f 4050–4499). Un ROV avanza en la oscuridad; sus
// focos descubren poco a poco un pez remo que nada casi en vertical (reconstrucción visual).
import {ROV} from '../components/Exploration';
import {breathe, cam, clamp, Grade, lerp, Oarfish, OceanEnvironment, oarPose, OS, PaletteGrade, SceneOut, shot, SubjectLight, Tag, toScreen, win} from './common';

export function scene10(t: number): SceneOut {
  const rx = lerp(-900, -380, clamp((t - 135) / 10));
  const beam = clamp((t - 136) / 1.2);
  const fishX = 160;
  const fishY = 240 - (t - 135) * 6;
  const lit = clamp((t - 139) / 3);
  const p = oarPose({t, x: fishX, y: fishY - 520, scale: OS * 0.62, angle: -Math.PI / 2 + 0.08, light: 0.08 + 0.75 * lit, sCurve: 14, bodyWave: 4, finSpeed: 3.6, fade: 0.55, tint: '#fffbe8'});
  let c = shot(t, 135, 140, cam(rx + 200, 60, 1.0), cam(rx + 420, 0, 0.9), 'cine');
  if (t > 140) c = shot(t, 140, 150, cam(rx + 420, 0, 0.9), cam(fishX - 40, -60, 1.25), 'cine');
  c = breathe(c, t, 0.6);
  const fs = toScreen(c, fishX, fishY - 520);
  return {
    svg: (
      <OceanEnvironment cam={c} t={t} depth={0.97} fish={0} lights={1.4}>
        <Oarfish uid="s10" p={p} />
        <ROV x={rx} y={40} s={0.9} t={t} beam={beam} />
      </OceanEnvironment>
    ),
    overlay: (
      <>
        <SubjectLight x={fs.x} y={fs.y} r={560} k={lit * 0.5} color="rgba(255,251,232,0.18)" />
        <PaletteGrade depth={0.95} />
        <Grade depth={0.9} vignette={0.95} />
        <Tag text="RECONSTRUCCIÓN VISUAL" k={win(t, 135.6, 140.4, 0.5)} color="#3bcbd6" />
      </>
    ),
  };
}
