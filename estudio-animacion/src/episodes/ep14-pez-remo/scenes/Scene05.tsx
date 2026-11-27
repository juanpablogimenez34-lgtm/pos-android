// ESCENA 5 · SU FORMA DE NADAR (60–75 s · f 1800–2249). Vista lateral, primer plano de la aleta con las
// ondas que avanzan de la cabeza a la cola (flecha de propagación) y toma amplia: el cuerpo recto.
import {AbsoluteFill} from 'remotion';
import {breathe, cam, Caption, Grade, Oarfish, OceanEnvironment, oarPoint, oarPose, OS, PaletteGrade, SceneOut, shot, Tag, toScreen, win} from './common';

export function scene05(t: number): SceneOut {
  const x = 600 + (t - 60) * 55;
  const p = oarPose({t, x, y: 0, scale: OS, light: 0.8, sCurve: 8, bodyWave: 3, finSpeed: 4.2, finAmp: 0.5});
  const m = oarPoint(p, 0.3, -1);
  let c = shot(t, 60, 63.4, cam(m.x - 200, 40, 0.75), cam(m.x, m.y - 10, 2.6), 'cine');
  if (t > 63.4) c = shot(t, 63.4, 68.4, cam(m.x, m.y - 10, 2.6), cam(m.x - 60, m.y - 20, 2.8), 'linear');
  if (t > 68.4) c = shot(t, 68.4, 75, cam(m.x - 60, m.y - 20, 2.8), cam(oarPoint(p, 0.45).x, 0, 0.58), 'cine');
  c = breathe(c, t, 0.4);
  const a = toScreen(c, oarPoint(p, 0.22, -1.8).x, oarPoint(p, 0.22, -1.8).y);
  const b = toScreen(c, oarPoint(p, 0.38, -1.8).x, oarPoint(p, 0.38, -1.8).y);
  const arrowK = win(t, 64.0, 68.6, 0.4);
  return {
    svg: (
      <OceanEnvironment cam={c} t={t} depth={0.6} fish={0.4}>
        <Oarfish uid="s5" p={p} />
      </OceanEnvironment>
    ),
    overlay: (
      <>
        <PaletteGrade depth={0.6} />
        <Grade depth={0.55} vignette={0.82} />
        {arrowK > 0.01 && (
          <AbsoluteFill style={{pointerEvents: 'none'}}>
            <svg width={1080} height={1920}>
              <defs>
                <marker id="ep14arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M0,0 L10,5 L0,10Z" fill="#3bcbd6" />
                </marker>
              </defs>
              <path d={`M${a.x.toFixed(1)},${(a.y - 60).toFixed(1)} L${b.x.toFixed(1)},${(b.y - 60).toFixed(1)}`} stroke="#3bcbd6" strokeWidth={6} markerEnd="url(#ep14arr)" opacity={arrowK} />
            </svg>
          </AbsoluteFill>
        )}
        <Caption text="Ondas de la aleta dorsal" sub="avanzan de la cabeza hacia la cola" k={win(t, 64.0, 68.8, 0.4)} top={190} size={38} />
        <Tag text="RECREACIÓN DEL MOVIMIENTO" k={win(t, 69.0, 74.6, 0.5)} color="#3bcbd6" />
      </>
    ),
  };
}
