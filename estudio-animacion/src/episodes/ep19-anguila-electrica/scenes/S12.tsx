// ESCENA 12 (165–180 s) · EL FINAL: la anguila se retira despacio entre raíces; la cámara se aleja y la
// luz baja; último primer plano de la cabeza, que retrocede hacia la oscuridad. Texto final y marca.
import {FONT_FAMILY} from '../../../engine/fonts';
import {clamp, lerp} from '../../../engine/math';
import {breathe, cam, Cam, SceneOut, shot} from '../../../studio2';
import {ElectricEel} from '../character/ElectricEel';
import {Track} from '../character/states';
import {BigTitle, eelAt, headPoint, pathOf, seg, Vignette, Wash} from '../components/common';
import {EV} from '../data/timeline';
import {HangingRoots, RiverBack, RiverFront} from '../environment/River';

// la anguila viene de la derecha y se interna hacia la izquierda, entre raíces
const PATH = pathOf([{x: 2200, y: 260}, {x: 1600, y: 300}, {x: 1000, y: 250}, {x: 400, y: 320}, {x: -100, y: 280}, {x: -500, y: 330}, {x: -900, y: 300}, {x: -1500, y: 320}]);
const TRACK: Track = [[165, 'SLOW_SWIM'], [170.5, 'IDLE_HOVER'], [172.2, 'RESTING'], [174.2, 'RETREAT'], [179, 'RETREAT']];

export function scene12(t: number): SceneOut {
  const e = eelAt(PATH, 1700, TRACK, 165, t, {SLOW_SWIM: {speed: 110}, RETREAT: {speed: -45}});
  const sp = e.spine;
  const hd = headPoint(sp);
  let c: Cam = shot(t, 165, 170.5, cam(sp[6].x + 80, sp[6].y - 60, 1.4), cam(sp[8].x - 40, sp[8].y - 120, 0.85), 'inOut');
  if (t >= 170.5) c = shot(t, 170.5, 172.2, cam(sp[8].x - 40, sp[8].y - 120, 0.85), cam(hd.x + 20, hd.y + 10, 3.0), 'cine');
  if (t >= 172.2) c = cam(hd.x + 20 + (t - 172.2) * 6, hd.y + 10, 3.0 - (t - 172.2) * 0.12);
  c = breathe(c, t, 0.2);
  const light = lerp(1, 0.25, seg(t, 165, 176));
  const tone = clamp((t - 174.5) / 3.5);
  return {
    svg: (
      <RiverBack cam={c} t={t} light={light} murk={0.6}>
        {[-1400, -1000, -650, -300, 50].map((x, i) => <HangingRoots key={x} x={x} top={-1400} len={1700 + (i % 2) * 200} t={t} seed={60 + i * 3} c="#142218" w={2.2} />)}
        <ElectricEel uid="e12" spine={sp} look={{t, finPhase: e.finPhase, finAmp: e.p.finAmp, mouth: e.p.mouth, tone, eye: -0.5}} />
        {[-1200, -800, -450, -120].map((x, i) => <HangingRoots key={`f${x}`} x={x + 80} top={-1400} len={1800} t={t} seed={80 + i * 3} c="#0c160e" w={2.6} />)}
      </RiverBack>
    ),
    overlay: (
      <>
        <RiverFront cam={c} t={t} murk={0.6} />
        <Vignette />
        <Wash k={0.55 * seg(t, 168, 177)} />
        <BigTitle k={clamp((t - EV.endText) / 0.6) * (1 - seg(t, EV.fadeOut, 180))} lines={['¿QUÉ OTRO ANIMAL', 'DEBERÍAMOS', 'INVESTIGAR?']} top={300} size={84} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1660, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 30, letterSpacing: 6, color: '#eafff6', opacity: 0.8 * clamp((t - EV.endText - 0.6) / 0.6) * (1 - seg(t, EV.fadeOut, 180))}}>MUNDO INSÓLITO DOCUMENTALES</div>
        <Wash k={seg(t, EV.fadeOut, 180)} />
      </>
    ),
  };
}
