// ESCENAS 4–6.
//  4 (45–60)  QUÉ OCURRE DENTRO: corte anatómico ilustrado (boca → esófago → estómago muy expansible);
//             el agua entra, el estómago se dilata y la silueta cambia de forma progresiva.
//  5 (60–75)  LA ARMADURA DE ESPINAS: primerísimo plano de espinas plegadas; inflado lento: cada espina
//             gira sobre su anclaje hasta quedar erguida.
//  6 (75–90)  EL DEPREDADOR: aparece entre rocas; el pez lo detecta, se infla mientras se acerca y el
//             depredador se aleja.
import {clamp, lerp} from '../../../engine/math';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {Predator} from '../../ep18-mixino/character/Predator';
import {deform} from '../character/inflation';
import {PorcupineFish} from '../character/PorcupineFish';
import {Brand, Callout, fishState, FTrack, inflateCurve, seg, Vignette, win} from '../components/common';
import {EV} from '../data/timeline';
import {Rock, ReefBack, ReefFront, ReefSet, SAND} from '../environment/Reef';

const T4: FTrack = [[45, 'RECOVERING'], [EV.anatomyInflate[0], 'INFLATING'], [EV.anatomyInflate[1], 'FULLY_INFLATED']];

export function scene04(t: number): SceneOut {
  const st = fishState(T4, t);
  const fx = 0;
  const fy = 230 + Math.sin(t * 0.8) * 4;
  const inf = inflateCurve(t, EV.anatomyInflate[0], EV.anatomyInflate[1], 6);
  const c = breathe(cam(fx - 10, fy - 20, lerp(2.0, 1.55, seg(t, 50, 57))), t, 0.15);
  const anat = 1 - 0.55 * seg(t, 57, 59.4);
  const P = (x: number, y: number) => {
    const d = deform({x, y}, inf);
    return toScreen(c, fx + d.x, fy + d.y);
  };
  const mouth = P(122, 4);
  const eso = P(80, 16);
  const sto = P(-8, 30 + 30 * inf);
  return {
    svg: (
      <ReefBack cam={c} t={t} light={0.9}>
        <ReefSet t={t} xs={[-800, 700]} />
        <PorcupineFish uid="f4" x={fx} y={fy} look={{inflation: inf, t, swim: st.swim, finFreq: st.finFreq, mouth: st.mouth, eye: st.eye, anatomy: anat, water: win(t, EV.anatomyInflate[0] - 0.3, EV.anatomyInflate[1], 0.4)}} />
      </ReefBack>
    ),
    overlay: (
      <>
        <ReefFront cam={c} t={t} />
        <Vignette />
        <Callout k={win(t, 45.8, 59.4)} x={mouth.x} y={mouth.y} tx={760} ty={560} text="boca" align="right" />
        <Callout k={win(t, 46.8, 59.4)} x={eso.x} y={eso.y} tx={160} ty={560} text="esófago" />
        <Callout k={win(t, 47.8, 59.4)} x={sto.x} y={sto.y} tx={150} ty={1300} text="estómago muy expansible" />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1660, textAlign: 'center', color: '#cfefff', fontSize: 22, fontWeight: 700, letterSpacing: 2, opacity: 0.8 * win(t, 45.4, 59.6)}}>ILUSTRACIÓN ANATÓMICA SIMPLIFICADA · EL PEZ SE INFLA CON AGUA</div>
        <Brand />
      </>
    ),
  };
}

const T5: FTrack = [[60, 'CURIOUS'], [63.4, 'THREATENED'], [EV.spineInflate[0], 'INFLATING'], [EV.spineInflate[1], 'FULLY_INFLATED']];

export function scene05(t: number): SceneOut {
  const st = fishState(T5, t);
  const fx = 0;
  const fy = 220;
  const inf = inflateCurve(t, EV.spineInflate[0], EV.spineInflate[1], 7);
  const focus = deform({x: -30, y: -50}, inf);
  let c: Cam = cam(fx + focus.x, fy + focus.y + 10, 4.6);
  if (t >= EV.spineInflate[0]) c = cam(fx + focus.x * lerp(1, 0.4, seg(t, 66, 72)), fy + focus.y * lerp(1, 0.4, seg(t, 66, 72)) + 10, lerp(4.6, 2.2, seg(t, 65, 72.5)));
  c = breathe(c, t, 0.15);
  const a = deform({x: -30, y: -52}, inf);
  const as = toScreen(c, fx + a.x, fy + a.y);
  return {
    svg: (
      <ReefBack cam={c} t={t}>
        <ReefSet t={t} xs={[-700, 600]} />
        <PorcupineFish uid="f5" x={fx} y={fy} look={{inflation: inf, t, swim: st.swim, finFreq: st.finFreq, mouth: st.mouth, eye: st.eye}} />
      </ReefBack>
    ),
    overlay: (
      <>
        <ReefFront cam={c} t={t} />
        <Vignette />
        <Callout k={win(t, 60.6, 64.6)} x={as.x} y={as.y} tx={160} ty={560} text="espinas plegadas" />
        <Callout k={win(t, 66.5, 71.0)} x={as.x} y={as.y} tx={160} ty={560} text="cada espina gira sobre su base" />
        <Callout k={win(t, 72.0, 74.8)} x={as.x} y={as.y} tx={160} ty={560} text="espinas erguidas" />
        <Brand />
      </>
    ),
  };
}

const T6: FTrack = [[75, 'NORMAL_SWIM'], [79, 'ALERT'], [81.5, 'THREATENED'], [EV.predInflate[0], 'INFLATING'], [EV.predInflate[1], 'FULLY_INFLATED']];

export function scene06(t: number): SceneOut {
  const st = fishState(T6, t);
  const fx = -150 + (t < 79 ? (t - 75) * 30 : 120) + Math.sin(t * 0.7) * 6;
  const fy = 200 + Math.sin(t * 1.0) * st.bob;
  const inf = inflateCurve(t, EV.predInflate[0], EV.predInflate[1], 4);
  // depredador: sale de entre las rocas (derecha), se acerca, duda y se aleja
  const app = seg(t, 75, EV.predInflate[1]);
  const leave = seg(t, EV.predLeave, 90.5);
  const px = lerp(1350, 640, app) + leave * 900;
  const py = lerp(380, 160, app) - leave * 200;
  let c: Cam = shot(t, 75, 79, cam(1250, 300, 1.4), cam(1000, 220, 1.6), 'inOut');
  if (t >= 79) c = cam(fx + 30, fy - 20, 2.6);
  if (t >= 81.5) c = shot(t, 81.5, 84, cam(fx + 30, fy - 20, 2.6), cam((fx + px) / 2, (fy + py) / 2 - 40, 1.05), 'cine');
  if (t >= 84) c = cam(lerp((fx + px) / 2, fx + 90, seg(t, 84, 88)), lerp((fy + py) / 2 - 40, fy - 30, seg(t, 84, 88)), lerp(1.05, 1.7, seg(t, 85.5, 89.5)));
  c = breathe(c, t, 0.3);
  return {
    svg: (
      <ReefBack cam={c} t={t}>
        <ReefSet t={t} xs={[-900, -300, 400]} />
        <Predator uid="p6" p={{x: px, y: py, scale: 2.6, dir: -1, angle: lerp(0, 0.2, leave), t, beat: 1 + leave, mouth: 0.2 + 0.3 * win(t, 84, 87, 0.5), gill: 0.3}} />
        <Rock x={1150} y={SAND + 10} w={420} h={200} seed={71} c="#33425a" />
        <PorcupineFish uid="f6" x={fx} y={fy} look={{inflation: inf, t, swim: st.swim, finFreq: st.finFreq, mouth: st.mouth, eye: st.eye}} />
      </ReefBack>
    ),
    overlay: (
      <>
        <ReefFront cam={c} t={t} />
        <Vignette />
        <Brand k={clamp(1 - 0 * t)} />
      </>
    ),
  };
}
