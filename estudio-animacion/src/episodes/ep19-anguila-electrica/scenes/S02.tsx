// ESCENA 2 (15–30 s) · LA REVELACIÓN: la anguila completa nadando; la cámara la acompaña de lado,
// se acerca a la aleta anal en acción y se abre para mostrar su silueta de pez cuchillo.
import {lerp} from '../../../engine/math';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {ElectricEel} from '../character/ElectricEel';
import {Track} from '../character/states';
import {Brand, Callout, eelAt, pathOf, seg, Vignette, win} from '../components/common';
import {RiverBack, RiverFront, Trunk, Weed} from '../environment/River';

const PATH = pathOf([{x: -2400, y: 220}, {x: -1700, y: 120}, {x: -1000, y: 240}, {x: -300, y: 140}, {x: 400, y: 260}, {x: 1100, y: 150}, {x: 1800, y: 250}, {x: 2600, y: 170}, {x: 3400, y: 240}]);
const TRACK: Track = [[15, 'SLOW_SWIM'], [21.5, 'FAST_SWIM'], [24.5, 'SLOW_SWIM']];

export function scene02(t: number): SceneOut {
  const e = eelAt(PATH, 1400, TRACK, 15, t);
  const sp = e.spine;
  const mid = sp[12];
  const fin = sp[16];
  let c: Cam = shot(t, 15, 17, cam(mid.x - 150, mid.y - 60, 0.95), cam(mid.x, mid.y - 40, 0.95), 'inOut');
  if (t >= 17) c = cam(mid.x, mid.y - 40, 0.95);
  if (t >= 18.5) c = shot(t, 18.5, 20, cam(mid.x, mid.y - 40, 0.95), cam(fin.x, fin.y + 30, 2.3), 'cine');
  if (t >= 20) c = cam(fin.x, fin.y + 30, 2.3);
  if (t >= 23.4) c = shot(t, 23.4, 25.5, cam(fin.x, fin.y + 30, 2.3), cam(mid.x + 80, mid.y - 60, 1.0), 'cine');
  if (t >= 25.5) c = cam(mid.x + 80, mid.y - 60, lerp(1.0, 0.9, seg(t, 25.5, 30)));
  c = breathe(c, t, 0.3);
  const fs = toScreen(c, fin.x, fin.y + 50);
  const hs = toScreen(c, sp[0].x, sp[0].y);
  return {
    svg: (
      <RiverBack cam={c} t={t}>
        <Trunk x={-600} y={560} len={700} ang={-0.6} w={70} c="#2a2418" />
        <Weed x={900} base={560} h={380} t={t} seed={11} c="#2e5a2a" />
        <Weed x={2200} base={560} h={420} t={t} seed={13} c="#2a5226" />
        <ElectricEel uid="e2" spine={sp} look={{t, finPhase: e.finPhase, finAmp: e.p.finAmp, mouth: e.p.mouth}} />
      </RiverBack>
    ),
    overlay: (
      <>
        <RiverFront cam={c} t={t} />
        <Vignette />
        <Callout k={win(t, 20.2, 23.3)} x={fs.x} y={fs.y} tx={140} ty={560} text="aleta anal: ondas que la impulsan" />
        <Callout k={win(t, 25.8, 29.6)} x={hs.x} y={hs.y} tx={Math.min(760, hs.x)} ty={hs.y - 220} text="pez cuchillo · Gymnotiformes" align="right" />
        <Brand />
      </>
    ),
  };
}
