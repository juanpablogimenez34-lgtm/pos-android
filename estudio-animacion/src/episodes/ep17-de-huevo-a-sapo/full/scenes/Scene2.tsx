// ESCENA 2 (20–45 s) · LA VIDA DENTRO DEL HUEVO
//  20–26 primer plano cinematográfico de la puesta: travelling lateral a lo largo de los cordones.
//  26–33 la cámara se acerca al embrión.
//  33–39 transición temporal (días): el embrión se alarga, aparecen cabeza, ojo y cola.
//  39–45 preparación para la eclosión: el embrión, ya formado, se agita dentro de la cápsula.
import {lerp} from '../../../../engine/math';
import {TimeLapse} from '../../../../lifecycle/TimeLapse';
import {breathe, cam, Cam, SceneOut, shot} from '../../../../studio2';
import {EmbryoEgg} from '../../character/Embryo';
import {PondBack, PondFront} from '../../environment/Pond';
import {seg, StageChip, Vignette, win} from '../components/shared';
import {EGG_F, EggBed} from './eggs';

export function scene2(t: number): SceneOut {
  const e = t < 33 ? 0.16 : t < 39 ? lerp(0.16, 0.8, seg(t, 33, 39)) : lerp(0.8, 1, seg(t, 39, 42));
  let c: Cam = shot(t, 20, 26, cam(-560, -330, 2.4, -0.02), cam(-120, -170, 2.6, 0.01), 'inOut');
  if (t >= 26) c = shot(t, 26, 33, cam(-120, -170, 2.6, 0.01), cam(EGG_F.x, EGG_F.y, 4.9), 'cine');
  if (t >= 33) c = shot(t, 33, 39, cam(EGG_F.x, EGG_F.y, 4.9), cam(EGG_F.x + 4, EGG_F.y - 2, 5.3), 'linear');
  if (t >= 39) c = shot(t, 39, 45, cam(EGG_F.x + 4, EGG_F.y - 2, 5.3), cam(EGG_F.x + 2, EGG_F.y, 5.8, 0.02), 'inOut');
  c = breathe(c, t, 0.35);
  return {
    svg: (
      <PondBack cam={c} t={t}>
        <EggBed t={t} />
        <EmbryoEgg x={EGG_F.x} y={EGG_F.y} r={22} e={e} t={t} open={0} uid="e2" refined />
      </PondBack>
    ),
    overlay: (
      <>
        <PondFront cam={c} t={t} />
        <Vignette kind="water" />
        <TimeLapse k={win(t, 33, 39.2)} label="días · tiempo condensado" spin={(t - 33) * 3} />
        <StageChip text={t < 39 ? 'embrión en desarrollo' : 'embrión listo para eclosionar'} k={win(t, 33.2, 44.6, 0.4)} />
      </>
    ),
  };
}
