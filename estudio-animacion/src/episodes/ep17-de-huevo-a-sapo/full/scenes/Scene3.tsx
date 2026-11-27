// ESCENA 3 (45–70 s) · EL PEQUEÑO NADADOR
//  45–52 eclosión: se abre la cápsula; el renacuajo se desenrolla y queda adherido a la gelatina.
//  52–58 primeros movimientos: impulsos cortos con pausas.
//  58–65 nada entre plantas acuáticas (travelling con parallax y hermanos al fondo).
//  65–70 plano macro de la cola: onda progresiva con 14 puntos de control.
import {lerp} from '../../../../engine/math';
import {growthAt, stageAt} from '../../../../lifecycle/stages';
import {breathe, cam, Cam, SceneOut, shot} from '../../../../studio2';
import {EmbryoEgg} from '../../character/Embryo';
import {Toad, toadPose} from '../../character/Toad';
import {Elodea, PondBack, PondFront} from '../../environment/Pond';
import {swimAt} from '../../motion/swim';
import {BUFO_STAGES} from '../../species/bufoBufo';
import {seg, StageChip, stair, Vignette, win} from '../components/shared';
import {GROWTH} from '../data/timeline';
import {EGG_F, EggBed} from './eggs';

/** Posición del renacuajo protagonista en las escenas 3 (también la usa la 4 al empezar). */
export function tadpole3(t: number) {
  const hx = EGG_F.x + 40;
  const hy = EGG_F.y + 14;
  if (t < 48) {
    const u = seg(t, 46.2, 48);
    return {x: lerp(EGG_F.x, hx, u), y: lerp(EGG_F.y, hy, u), angle: lerp(0, -1.2, u), effort: 0.25 + 0.5 * u, curl: 1 - seg(t, 46.2, 47.6)};
  }
  if (t < 52) {
    // adherido a la gelatina, cabeza arriba, con sacudidas breves
    const jerk = Math.max(0, Math.sin(t * 2.3)) ** 6;
    return {x: hx + Math.sin(t * 0.8) * 3, y: hy, angle: -1.2 + Math.sin(t * 0.9) * 0.08, effort: 0.1 + 0.8 * jerk, curl: 0};
  }
  if (t < 58) {
    const u = (t - 52) / 6;
    const d = stair(u, 3);
    const pulse = (1 - Math.cos(2 * Math.PI * 3 * u)) / 2;
    return {x: hx + d * 380, y: hy + Math.sin(u * 5) * 20 - d * 30, angle: lerp(-1.2, 0, seg(t, 52, 53.4)) + Math.cos(u * 5) * 0.06, effort: 0.15 + 0.8 * pulse, curl: 0};
  }
  if (t < 65) {
    const x0 = hx + 380;
    return {x: x0 + (t - 58) * 150, y: hy - 30 + Math.sin((t - 58) * 1.3) * 50, angle: Math.cos((t - 58) * 1.3) * 0.12, effort: 0.8, curl: 0};
  }
  const x0 = hx + 380 + 7 * 150;
  return {x: x0 + (t - 65) * 35, y: hy - 30 + Math.sin(7 * 1.3) * 50, angle: 0, effort: 0.95, curl: 0};
}

export function scene3(t: number): SceneOut {
  const g = growthAt(GROWTH, t);
  const st = stageAt(BUFO_STAGES, g);
  const tp = tadpole3(t);
  const sw = swimAt(t, tp.effort);
  const pose = toadPose({x: tp.x, y: tp.y, angle: tp.angle + sw.bodyYaw, t, swimPhase: sw.phase, swimAmp: sw.amp, curl: tp.curl, fold: 0.12, inWater: true});
  // cámara
  let c: Cam = shot(t, 45, 48, cam(EGG_F.x + 2, EGG_F.y, 5.8), cam(EGG_F.x + 30, EGG_F.y, 4.4), 'inOut');
  if (t >= 48) c = shot(t, 48, 52, cam(EGG_F.x + 30, EGG_F.y, 4.4), cam(tadpole3(52).x + 20, tadpole3(52).y - 10, 3.6), 'cine');
  if (t >= 52) c = cam(tp.x + 40, tp.y - 10, lerp(3.6, 2.4, seg(t, 52, 58)));
  if (t >= 58) c = cam(tp.x + lerp(40, 120, seg(t, 58, 59.5)), tp.y - 10, lerp(2.4, 1.9, seg(t, 58, 62)));
  if (t >= 64.4) {
    // macro de la cola: centro en la mitad de la cola
    const tail = {x: tp.x - 120 * st.size, y: tp.y + 2};
    c = shot(t, 64.4, 66, cam(tp.x + 120, tp.y - 10, 1.9), cam(tail.x, tail.y, 5.2), 'cine');
  }
  c = breathe(c, t, 0.35);
  const sib = (i: number) => {
    const s2 = swimAt(t, 0.7, i * 2);
    return toadPose({x: tp.x - 260 - i * 220 + Math.sin(t * 0.7 + i) * 40, y: tp.y + 120 - i * 210, scale: 0.9, angle: Math.sin(t * 0.5 + i) * 0.1 + s2.bodyYaw, t, swimPhase: s2.phase, swimAmp: s2.amp, fold: 0.12, inWater: true});
  };
  return {
    svg: (
      <PondBack cam={c} t={t}>
        <EggBed t={t} skipR={10} />
        {t < 46.35 && <EmbryoEgg x={EGG_F.x} y={EGG_F.y} r={22} e={1} t={t} open={seg(t, 46, 46.3)} uid="e3" refined />}
        {[2700, 2950, 3200].map((x, i) => <Elodea key={x} x={x} base={300} h={600 + i * 120} t={t} seed={i * 4.3 + 21} c={i % 2 ? '#2f6e3a' : '#3c8240'} />)}
        {t > 54 && [1, 2].map((i) => <Toad key={i} uid={`sib${i}`} s={stageAt(BUFO_STAGES, g)} p={sib(i)} />)}
        {t >= 46 && <Toad uid="tad3" s={st} p={pose} />}
      </PondBack>
    ),
    overlay: (
      <>
        <PondFront cam={c} t={t} />
        <Vignette kind="water" />
        <StageChip text={t < 52 ? 'renacuajo recién eclosionado' : t < 64.4 ? st.stage : 'cola: músculo y aleta'} k={win(t, 47, 69.6, 0.4)} />
      </>
    ),
  };
}
