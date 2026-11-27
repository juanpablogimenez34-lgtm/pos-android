// ESCENA 1 (0–15 s) · EL DEPREDADOR ELÉCTRICO (gancho).
//  0–1  casi a oscuras: la anguila asoma entre raíces; empujón de cámara hacia la cabeza.
//  1–3  detecta un pez (campo débil) y emite una descarga (visualización): el pez se contrae.
//  3–5  primerísimo plano de la cabeza + «¡HASTA 860 VOLTIOS!».
//  5–15 la anguila avanza hacia el pez aturdido, lo succiona y sigue nadando.
import {clamp, lerp} from '../../../engine/math';
import {breathe, cam, Cam, SceneOut, shot} from '../../../studio2';
import {ElectricEel} from '../character/ElectricEel';
import {Prey} from '../character/Prey';
import {Track} from '../character/states';
import {BigTitle, Brand, eelAt, headPoint, pathOf, seg, Vignette, Wash, win} from '../components/common';
import {EV} from '../data/timeline';
import {FieldLines, PulseFronts, VisualTag} from '../effects/Electric';
import {HangingRoots, RiverBack, RiverFront, Weed} from '../environment/River';

const PATH = pathOf([{x: -1700, y: 60}, {x: -1200, y: 140}, {x: -700, y: 80}, {x: -250, y: 200}, {x: 150, y: 170}, {x: 550, y: 250}, {x: 1000, y: 210}, {x: 1600, y: 280}, {x: 2300, y: 240}]);
const S0 = 1250;
const TRACK: Track = [[0, 'SLOW_SWIM'], [EV.hookDetect, 'ELECTROLOCATION'], [EV.hookShock, 'HIGH_VOLTAGE_ATTACK'], [3.0, 'STALKING'], [7.8, 'PREY_CAPTURE'], [9.6, 'SLOW_SWIM']];
const eel = (t: number) => eelAt(PATH, S0, TRACK, 0, t);
const H9 = headPoint(eel(EV.hookCapture).spine);
const PREY0 = {x: H9.x + 40, y: H9.y - 10};

export function scene01(t: number): SceneOut {
  const e = eel(t);
  const sp = e.spine;
  const hd = headPoint(sp);
  const stun = t < EV.hookShock ? 0 : clamp(1 - (t - EV.hookShock - 2.5) / 3.5);
  const cap = seg(t, EV.hookCapture - 0.45, EV.hookCapture);
  const preyX = lerp(PREY0.x + Math.sin(t * 0.8) * 20 * (1 - stun), hd.x, cap);
  const preyY = lerp(PREY0.y + (t > EV.hookShock ? Math.min(30, (t - EV.hookShock) * 6) : Math.sin(t * 1.2) * 8), hd.y, cap);
  let c: Cam = shot(t, 0, 1, cam(-700, 60, 1.0), cam(hd.x - 60, hd.y - 30, 2.4), 'in');
  if (t >= 1) c = shot(t, 1, 1.6, cam(hd.x - 60, hd.y - 30, 2.4), cam((hd.x + PREY0.x) / 2, (hd.y + PREY0.y) / 2 - 40, 1.7), 'out');
  if (t >= 1.6) c = cam((hd.x + PREY0.x) / 2, (hd.y + PREY0.y) / 2 - 40, 1.7);
  if (t >= 3) c = shot(t, 3, 3.5, cam((hd.x + PREY0.x) / 2, (hd.y + PREY0.y) / 2 - 40, 1.7), cam(hd.x - 40, hd.y + 10, 4.2), 'cine');
  if (t >= 3.5) c = cam(hd.x - 40, hd.y + 10, 4.2);
  if (t >= 5.2) c = shot(t, 5.2, 7, cam(hd.x - 40, hd.y + 10, 4.2), cam(hd.x + 60, hd.y - 40, 1.9), 'cine');
  if (t >= 7) c = cam(hd.x + 60, hd.y - 40, lerp(1.9, 1.35, seg(t, 9.5, 14)));
  c = breathe(c, t, 0.3);
  const light = lerp(0.25, 1, seg(t, 0, 1.2));
  return {
    svg: (
      <RiverBack cam={c} t={t} light={light} murk={0.4}>
        <HangingRoots x={-900} top={-1300} len={1500} t={t} seed={3} c="#1a2a1e" w={2.4} />
        <HangingRoots x={-500} top={-1300} len={1300} t={t} seed={7} c="#1e3020" w={2} />
        <Weed x={300} base={560} h={360} t={t} seed={2} c="#2e5a2a" />
        <Weed x={1300} base={560} h={420} t={t} seed={5} c="#2a5226" />
        <ElectricEel uid="e1" spine={sp} look={{t, finPhase: e.finPhase, finAmp: e.p.finAmp, mouth: e.p.mouth, volt: e.p.volt * win(t, EV.hookShock, 2.8, 0.1), eye: 1}} />
        {cap < 1 && <Prey uid="p1" p={{x: preyX, y: preyY, t, s: 1.5, dir: -1, swim: t < EV.hookShock ? 1 : 0, stun, opacity: 1 - seg(t, EV.hookCapture - 0.1, EV.hookCapture)}} />}
        <FieldLines spine={sp} k={win(t, EV.hookDetect, EV.hookShock + 0.1, 0.25) * 0.9} t={t} target={PREY0} pull={0.7} />
        <PulseFronts spine={sp} t={t} t0={EV.hookShock} dur={0.8} rate={16} aim={PREY0} reach={600} />
      </RiverBack>
    ),
    overlay: (
      <>
        <RiverFront cam={c} t={t} murk={0.4} />
        <Vignette />
        <VisualTag k={win(t, EV.hookShock, 3.0, 0.2)} />
        <BigTitle k={win(t, EV.hookText, 7.6, 0.4)} lines={['¡HASTA', '860 VOLTIOS!']} top={300} size={112} />
        <Brand />
        <Wash k={0.85 * (1 - seg(t, 0, 0.9))} />
      </>
    ),
  };
}
