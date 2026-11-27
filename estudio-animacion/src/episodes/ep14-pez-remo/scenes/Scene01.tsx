// ESCENA 1 · EL DRAGÓN EXISTE (0–15 s · f 0–449). Casi negro; una silueta enorme cruza el encuadre;
// destello que revela escamas plateadas; aparece la cresta roja; la cámara retrocede y el cuerpo
// sigue fuera del encuadre; después lo seguimos hacia una zona más iluminada.
import {breathe, cam, clamp, Grade, lerp, Oarfish, OceanEnvironment, oarPoint, oarPose, OS, PaletteGrade, PunchWord, SceneOut, shot, SubjectLight, toScreen, win} from './common';

export function scene01(t: number): SceneOut {
  const x = -300 + t * 120; // el pez avanza hacia la derecha
  const flash = t > 2.9 && t < 3.6 ? Math.sin(((t - 2.9) / 0.7) * Math.PI) : 0;
  const light = clamp(0.28 + (t > 2.9 ? 0.55 : 0) * clamp((t - 2.9) / 0.4) + 0.25 * clamp((t - 9) / 5) + flash * 0.3);
  const depth = lerp(0.97, 0.7, clamp((t - 9) / 6));
  const p = oarPose({t, x, y: 0, scale: OS, light, persp: lerp(0, 0.9, clamp((t - 6) / 3)), fade: lerp(0.2, 0.85, clamp((t - 6) / 3)), sCurve: 50});
  const mid = oarPoint(p, 0.35);
  const head = oarPoint(p, 0.01, -1);
  let c = shot(t, 0, 3.2, cam(mid.x - 40, -10, 2.1), cam(mid.x + 120, -20, 2.0), 'linear');
  if (t >= 3.2) c = shot(t, 3.2, 6.2, cam(mid.x + 120, -20, 2.0), cam(head.x - 60, head.y - 30, 2.3), 'cine');
  if (t >= 6.2) c = shot(t, 6.2, 10, cam(head.x - 60, head.y - 30, 2.3), cam(head.x - 520, 40, 0.62), 'cine');
  if (t >= 10) c = shot(t, 10, 15, cam(head.x - 520, 40, 0.62), cam(head.x - 300, -60, 0.8), 'linear');
  c = breathe(c, t, 0.5);
  const hs = toScreen(c, head.x, head.y);
  return {
    svg: (
      <OceanEnvironment cam={c} t={t} depth={depth} fish={0.2 + 0.4 * clamp((t - 9) / 4)}>
        <Oarfish uid="s1" p={p} />
      </OceanEnvironment>
    ),
    overlay: (
      <>
        <SubjectLight x={hs.x} y={hs.y} r={620} k={0.25 + 0.5 * clamp((t - 4) / 2)} color="rgba(214,56,71,0.18)" />
        <PaletteGrade depth={depth} />
        <Grade depth={0.85} vignette={0.95} />
        {flash > 0 && <SubjectLight x={toScreen(c, mid.x, mid.y).x} y={toScreen(c, mid.x, mid.y).y} r={700} k={flash} color="rgba(230,245,255,0.55)" />}
        <SubjectLight x={toScreen(c, mid.x, mid.y).x} y={toScreen(c, mid.x, mid.y).y - 40} r={520} k={0.5 * (1 - clamp((t - 3) / 2))} color="rgba(23,137,183,0.35)" />
        <PunchWord text="¿UN DRAGÓN REAL?" k={win(t, 0.5, 3.4, 0.2)} size={84} top={250} color="#e8b86d" />
      </>
    ),
  };
}
