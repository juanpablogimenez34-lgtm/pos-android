// CÁMARA CINEMATOGRÁFICA de la demostración: planos encadenados con curvas suaves (Estudio 2.0),
// objetivos que siguen al personaje y una respiración de cámara mínima. Devuelve la cámara 2D y el
// centro de proyección para la perspectiva del rig.
import {breathe, Cam, cam, shot} from '../../studio2';
import {Proj, V3} from './OarfishRig';

export function demoCamera(t: number, head: V3): {cam: Cam; proj: Proj} {
  const A = cam(head.x - 520, head.y + 10, 0.86); // 0–3: silueta lejana
  const B = cam(head.x - 120, head.y + 6, 1.08);
  const C = cam(head.x + 40, head.y - 30, 1.65); // 3–6: la cabeza emerge de la oscuridad
  const D = cam(head.x - 360, head.y + 10, 0.78); // 6–10: lateral, gran parte del cuerpo
  const E = cam(head.x - 160, head.y + 60, 0.9); // 10–13: acompaña el giro y el ascenso
  const F = cam(head.x - 300, head.y + 160, 0.4); // 13–15: plano épico
  let c: Cam;
  if (t < 3) c = shot(t, 0, 3, A, B, 'linear');
  else if (t < 6) c = shot(t, 3, 6, B, C, 'cine');
  else if (t < 10) c = shot(t, 6, 7.4, C, D, 'cine');
  else if (t < 13) c = shot(t, 10, 11.4, D, E, 'cine');
  else c = shot(t, 13, 15, E, F, 'cine');
  c = breathe(c, t, 0.5);
  return {cam: c, proj: {cx: c.x, cy: c.y, f: 1400}};
}
