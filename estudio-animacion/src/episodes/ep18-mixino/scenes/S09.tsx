// ESCENA 9 (120–135 s) · EL LIMPIADOR DEL OCÉANO: varios mixinos se alimentan de un pez muerto sobre
// el fondo; empujan y tiran con la cabeza mientras raspan con sus placas dentales (boca que se abre
// y cierra); se desprenden partículas orgánicas.
import {hash1} from '../../../engine/math';
import {breathe, cam, Cam, SceneOut, shot} from '../../../studio2';
import {Hagfish} from '../character/Hagfish';
import {Predator} from '../character/Predator';
import {Vignette} from '../components/common';
import {DeepBack, DeepFront} from '../environment/Deep';
import {crawl, pathOf} from './rig';

const CARCASS = {x: 40, y: 330, s: 1.9, angle: 0.06};
// trayectorias que terminan en el flanco del cadáver (la cabeza llega al final de cada una)
const P1 = pathOf([{x: 1300, y: 520}, {x: 900, y: 470}, {x: 560, y: 420}, {x: 300, y: 380}, {x: 140, y: 350}]);
const P2 = pathOf([{x: -1200, y: 200}, {x: -800, y: 260}, {x: -460, y: 300}, {x: -200, y: 330}, {x: -60, y: 345}]);
const P3 = pathOf([{x: 1100, y: 120}, {x: 800, y: 170}, {x: 520, y: 240}, {x: 330, y: 290}, {x: 260, y: 315}]);

export function scene09(t: number): SceneOut {
  const tug = (k: number) => Math.sin(t * (2.4 + k * 0.4) + k * 2) * 18 - 10;
  const sp1 = crawl(P1, P1.total + tug(1), t, 16, 1.6, 1.6);
  const sp2 = crawl(P2, P2.total + tug(2), t, 18, 1.5, 1.4);
  const sp3 = crawl(P3, P3.total + tug(3), t, 14, 1.4, 1.5);
  let c: Cam = shot(t, 120, 127, cam(60, 220, 1.0), cam(110, 300, 1.6), 'inOut');
  if (t >= 127) c = shot(t, 127, 135, cam(110, 300, 1.6), cam(170, 330, 2.1), 'inOut');
  c = breathe(c, t, 0.3);
  const mouth = (k: number) => 0.5 + 0.5 * Math.sin(t * 5 + k);
  return {
    svg: (
      <DeepBack cam={c} t={t}>
        <ellipse cx={CARCASS.x} cy={CARCASS.y + 50} rx={380} ry={50} fill="#000" opacity={0.25} />
        <Hagfish uid="f3" spine={sp3} look={{t, tone: 0.35, shadow: 10, mouth: mouth(3), barbels: 1}} />
        <Predator uid="carc" p={{x: CARCASS.x, y: CARCASS.y, scale: CARCASS.s, angle: CARCASS.angle, t, dead: true, mouth: 0.3}} />
        {/* heridas abiertas donde se alimentan */}
        <ellipse cx={150} cy={345} rx={34} ry={20} fill="#6a2a2a" opacity={0.7} />
        <ellipse cx={-60} cy={352} rx={30} ry={18} fill="#6a2a2a" opacity={0.7} />
        <Hagfish uid="f2" spine={sp2} look={{t, tone: 0.1, shadow: 12, mouth: mouth(2), barbels: 1}} />
        <Hagfish uid="f1" spine={sp1} look={{t, shadow: 14, mouth: mouth(1), barbels: 1}} />
        {/* partículas orgánicas que se desprenden */}
        {Array.from({length: 26}, (_, i) => {
          const per = 3 + hash1(i) * 3;
          const ph = (((t / per) + hash1(i * 3)) % 1 + 1) % 1;
          const x0 = i % 2 ? 150 : -60;
          return <circle key={i} cx={x0 + (hash1(i * 5) - 0.5) * 80 + ph * (hash1(i * 7) - 0.3) * 220} cy={340 - ph * 260 + Math.sin(t + i) * 6} r={1.5 + hash1(i * 2) * 3} fill={i % 3 ? '#d8b8a0' : '#f0e8d8'} opacity={0.7 * (1 - ph)} />;
        })}
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
