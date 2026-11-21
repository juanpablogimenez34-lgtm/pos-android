// ESCENA 2 · REVELACIÓN DEL PEZ REMO (15–30 s · f 450–899). Travelling lateral de la cabeza a la cola:
// cabeza, ojo, boca, cuerpo plateado, aleta dorsal rojiza; al final, el animal completo.
import {breathe, Callouts, cam, Caption, clamp, Grade, lerp, Oarfish, OceanEnvironment, oarPoint, oarPose, OS, PaletteGrade, SceneOut, shot, toScreen, win} from './common';

export function scene02(t: number): SceneOut {
  const x = 1500 + (t - 15) * 40;
  const p = oarPose({t, x, y: 0, scale: OS, light: 0.9, sCurve: 34, mouth: 0.25 * Math.max(0, Math.sin((t - 15) * 0.9))});
  const head = oarPoint(p, 0.0, 0);
  const tail = oarPoint(p, 0.92, 0);
  let c = shot(t, 15, 18.5, cam(head.x - 40, head.y - 20, 2.6), cam(head.x - 120, head.y - 10, 2.2), 'cine');
  if (t > 18.5) c = shot(t, 18.5, 25.5, cam(head.x - 120, head.y - 10, 2.2), cam(lerp(head.x, tail.x, 0.75), 0, 1.25), 'cine');
  if (t > 25.5) c = shot(t, 25.5, 30, cam(lerp(head.x, tail.x, 0.75), 0, 1.25), cam((head.x + tail.x) / 2, 20, 0.52), 'cine');
  c = breathe(c, t, 0.5);
  const P = (u: number, v: number) => {
    const w = oarPoint(p, u, v);
    return toScreen(c, w.x, w.y);
  };
  // punto del cuerpo más cercano al centro de la pantalla (para etiquetar lo que se ve)
  let uc = 0;
  let best = 1e9;
  for (let k = 0; k <= 50; k++) {
    const d = Math.abs(P(k / 50, 0).x - 560);
    if (d < best) {
      best = d;
      uc = k / 50;
    }
  }
  return {
    svg: (
      <OceanEnvironment cam={c} t={t} depth={0.55} fish={0.6}>
        <Oarfish uid="s2" p={p} />
      </OceanEnvironment>
    ),
    overlay: (
      <>
        <PaletteGrade depth={0.55} />
        <Grade depth={0.5} vignette={0.8} />
        <Caption text="Pez remo gigante" sub="Regalecus glesne" k={win(t, 15.4, 21.2, 0.5)} top={190} />
        <Callouts
          items={[
            {p: P(0.0, -0.1), label: 'ojo', lx: 760, ly: 470, k: win(t, 16.6, 19.4)},
            {p: P(-0.012, 0.25), label: 'boca', lx: 780, ly: 1230, k: win(t, 17.2, 19.4)},
            {p: P(uc, -1.5), label: 'aleta dorsal rojiza', lx: 540, ly: 420, k: win(t, 20.2, 24.6)},
            {p: P(Math.min(1, uc + 0.02), 0.3), label: 'cuerpo plateado', lx: 420, ly: 1240, k: win(t, 20.8, 24.6)},
          ]}
        />
        <Caption text="un cuerpo extremadamente alargado" k={win(t, 26.0, 29.6, 0.4) * clamp(1)} top={190} size={36} />
      </>
    ),
  };
}
