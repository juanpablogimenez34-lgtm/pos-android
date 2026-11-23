// ESCENA 2 (15–30 s) · LA CRIATURA MISTERIOSA: primer plano del mixino deslizándose sobre el sedimento;
// la cámara pasa de la cabeza (barbillas que tantean, orificio nasal) al cuerpo que ondula.
import {breathe, cam, Cam, SceneOut, shot} from '../../../studio2';
import {Hagfish} from '../character/Hagfish';
import {seg, Vignette} from '../components/common';
import {DeepBack, DeepFront, Rock} from '../environment/Deep';
import {crawl, headOf, pathOf} from './rig';

const PATH = pathOf([{x: -1400, y: 300}, {x: -1000, y: 380}, {x: -650, y: 280}, {x: -300, y: 360}, {x: 50, y: 270}, {x: 380, y: 350}, {x: 720, y: 280}, {x: 1100, y: 330}, {x: 1500, y: 290}]);

export function scene02(t: number): SceneOut {
  const s = 1300 + (t - 15) * 55;
  const sp = crawl(PATH, s, t, 22, 1.5, 1.25);
  const h = headOf(sp);
  const mid = sp[30];
  let c: Cam = shot(t, 15, 18, cam(h.x - 200, h.y - 60, 1.3), cam(h.x + 10, h.y - 10, 3.2), 'cine');
  if (t >= 18) c = cam(h.x + 10, h.y - 10, 3.2);
  if (t >= 23) c = shot(t, 23, 26.5, cam(h.x + 10, h.y - 10, 3.2), cam(mid.x, mid.y - 30, 1.7), 'cine');
  if (t >= 26.5) c = cam(mid.x + (t - 26.5) * 8, mid.y - 30, 1.7 - (t - 26.5) * 0.05);
  c = breathe(c, t, 0.3);
  return {
    svg: (
      <DeepBack cam={c} t={t}>
        <Rock x={-200} y={420} w={300} h={130} seed={5} c="#1c2c2c" />
        <Rock x={1250} y={380} w={260} h={110} seed={8} c="#1a2a2a" />
        <Hagfish uid="h2" spine={sp} look={{t, shadow: 14, barbels: 0.9 + 0.3 * Math.sin(t), mouth: 0.15 * seg(t, 19, 20) * (1 - seg(t, 21, 22))}} />
      </DeepBack>
    ),
    overlay: (
      <>
        <DeepFront cam={c} t={t} />
        <Vignette />
      </>
    ),
  };
}
