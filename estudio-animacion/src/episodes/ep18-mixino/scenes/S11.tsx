// ESCENA 11 (150–165 s) · EL SECRETO DE SU SUPERVIVENCIA: el mixino se abre paso entre rocas,
// pasando por delante de unas y por detrás de otras; primer plano de las barbillas que tantean.
import {breathe, cam, Cam, SceneOut, shot} from '../../../studio2';
import {Hagfish} from '../character/Hagfish';
import {Callout, Vignette, win} from '../components/common';
import {DeepBack, DeepFront, Rock} from '../environment/Deep';
import {crawl, headOf, pathOf} from './rig';
import {toScreen} from '../../../studio2';

const P = pathOf([{x: -1500, y: 340}, {x: -1100, y: 330}, {x: -700, y: 360}, {x: -450, y: 388}, {x: -150, y: 330}, {x: 100, y: 298}, {x: 380, y: 350}, {x: 650, y: 394}, {x: 950, y: 345}, {x: 1200, y: 316}, {x: 1500, y: 340}, {x: 1900, y: 330}]);

export function scene11(t: number): SceneOut {
  const sp = crawl(P, 1150 + (t - 150) * 110, t, 20, 1.6, 1.5);
  const h = headOf(sp);
  let c: Cam = cam(h.x - 60, h.y - 120, 1.5);
  if (t >= 157.5) c = shot(t, 157.5, 159, cam(h.x - 60, h.y - 120, 1.5), cam(h.x + 30, h.y - 10, 3.0), 'cine');
  if (t >= 159) c = cam(h.x + 30, h.y - 10, 3.0);
  if (t >= 161.5) c = shot(t, 161.5, 163.5, cam(h.x + 30, h.y - 10, 3.0), cam(h.x - 80, h.y - 120, 1.4), 'cine');
  c = breathe(c, t, 0.3);
  const hs = toScreen(c, h.x + Math.cos(h.ang) * 30, h.y + Math.sin(h.ang) * 30);
  return {
    svg: (
      <DeepBack cam={c} t={t}>
        <Rock x={-450} y={262} w={300} h={170} seed={71} c="#1c2e2e" />
        <Rock x={650} y={262} w={340} h={190} seed={73} c="#1a2c2c" />
        <Hagfish uid="h11" spine={sp} look={{t, shadow: 12, barbels: 1.2, slimeCoat: 0.3}} />
        <Rock x={100} y={440} w={330} h={150} seed={75} c="#172626" hi={0.3} />
        <Rock x={1200} y={450} w={360} h={160} seed={77} c="#162424" hi={0.3} />
        <Rock x={-1100} y={460} w={300} h={140} seed={79} c="#152424" hi={0.3} />
      </DeepBack>
    ),
    overlay: (
      <>
        <DeepFront cam={c} t={t} />
        <Vignette />
        <Callout k={win(t, 159.2, 161.4)} x={hs.x} y={hs.y} tx={620} ty={520} text="barbillas sensoriales" />
      </>
    ),
  };
}
