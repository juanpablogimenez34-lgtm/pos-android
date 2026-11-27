// ESCENA 12 (165–180 s) · FINAL: regresa el depredador; el mixino vuelve a liberar mucosidad, el
// atacante retrocede y el mixino se aleja nadando. La cámara se eleva lentamente. Texto final.
import {clamp, lerp} from '../../../engine/math';
import {breathe, cam, Cam, SceneOut, shot} from '../../../studio2';
import {Hagfish} from '../character/Hagfish';
import {FishPose, Predator, predMouth} from '../character/Predator';
import {SlimeBurst, SlimeCloud, SlimeDefs} from '../character/Slime';
import {BigTitle, seg, Vignette, Wash, win} from '../components/common';
import {EV} from '../data/timeline';
import {DeepBack, DeepFront, Rock} from '../environment/Deep';
import {crawl, pathOf, poresAt} from './rig';

const P = pathOf([{x: -1300, y: 380}, {x: -900, y: 330}, {x: -500, y: 370}, {x: -150, y: 320}, {x: 200, y: 360}, {x: 450, y: 250}, {x: 650, y: 60}, {x: 800, y: -250}, {x: 1000, y: -600}, {x: 1250, y: -1000}]);
const S0 = 1350;
const PS = 1.7;

const hag = (t: number) => {
  const go = Math.max(0, t - 170);
  return crawl(P, S0 + (t - 165) * 20 + go * 90 + go * go * 6, t, t > EV.finalSlime ? 30 : 14, 1.6, t > EV.finalSlime ? 2.2 : 1.1);
};
const SP_S = hag(EV.finalSlime);
const BITE = SP_S[Math.round(0.4 * (SP_S.length - 1))];
const BURSTS: SlimeBurst[] = [
  {t0: EV.finalSlime, sources: poresAt(SP_S, [0.25, 0.35, 0.45, 0.55]), dir: -0.8, spread: 1.6, size: 380, seed: 51, drift: {x: 8, y: -10}, life: 10},
  {t0: EV.finalSlime + 0.6, sources: poresAt(SP_S, [0.3, 0.5, 0.65, 0.8]), dir: -1.3, spread: 2.0, size: 480, seed: 53, drift: {x: 2, y: -12}, life: 10},
];

function pred(t: number): FishPose {
  const atkA = -0.4;
  const m = predMouth({x: 0, y: 0, scale: PS, angle: atkA, t, dir: -1});
  const strike = {x: BITE.x - m.x, y: BITE.y - 10 - m.y};
  if (t < EV.finalLunge) {
    const u = Math.pow(seg(t, 165, EV.finalLunge), 1.8);
    return {x: lerp(1400, strike.x, u), y: lerp(-420, strike.y, u), angle: lerp(-0.1, atkA, u), t, scale: PS, dir: -1, beat: 1 + u, mouth: seg(t, EV.finalLunge - 0.7, EV.finalLunge)};
  }
  const u = seg(t, EV.finalSlime + 0.4, 176);
  return {x: lerp(strike.x, strike.x + 900, u), y: lerp(strike.y, strike.y - 520, u), angle: lerp(atkA, 0.25, u), t, scale: PS, dir: -1, beat: 1.8, mouth: 0.5 + 0.5 * Math.abs(Math.sin(t * 5)) * (1 - u), slimed: clamp((t - EV.finalSlime) / 1.5), gill: 0.6 + 0.4 * Math.sin(t * 6), shake: win(t, EV.finalSlime + 0.3, 173.5, 0.4)};
}

export function scene12(t: number): SceneOut {
  const sp = hag(t);
  const p = pred(t);
  const m = predMouth(p);
  let c: Cam = shot(t, 165, EV.finalLunge, cam(300, 80, 1.05), cam(BITE.x + 80, BITE.y - 150, 1.45), 'inOut');
  if (t >= EV.finalLunge) c = shot(t, EV.finalLunge, 172, cam(BITE.x + 80, BITE.y - 150, 1.45), cam(BITE.x + 100, BITE.y - 220, 1.15), 'out');
  if (t >= 172) c = shot(t, 172, 179.5, cam(BITE.x + 100, BITE.y - 220, 1.15), cam(BITE.x + 300, -900, 0.75), 'cine');
  const kick = win(t, EV.finalSlime - 0.05, EV.finalSlime + 0.35, 0.1) * 6;
  c = {...breathe(c, t, 0.3), x: c.x + Math.sin(t * 40) * kick};
  return {
    svg: (
      <DeepBack cam={c} t={t}>
        <SlimeDefs />
        <Rock x={-600} y={500} w={340} h={150} seed={81} c="#1a2a2a" />
        <ellipse cx={p.x - 40} cy={Math.max(p.y + 300, 330)} rx={230} ry={34} fill="#000" opacity={0.15} />
        <Hagfish uid="h12" spine={sp} look={{t, shadow: Math.max(0, 14 - Math.max(0, t - 172) * 4), pores: win(t, EV.finalSlime - 0.1, EV.finalSlime + 2.4, 0.2), barbels: 1, slimeCoat: clamp((t - EV.finalSlime) / 3)}} />
        {BURSTS.map((b, i) => <SlimeCloud key={i} t={t} b={{...b, pull: {x: m.x, y: m.y, k: 0.4 * seg(t, EV.finalSlime, EV.finalSlime + 1) * (1 - seg(t, 171, 174))}}} />)}
        <Predator uid="p12" p={p} />
      </DeepBack>
    ),
    overlay: (
      <>
        <DeepFront cam={c} t={t} />
        <Vignette />
        <BigTitle k={clamp((t - EV.endText) / 0.6) * (1 - seg(t, EV.fadeOut, 180))} lines={['¿CONOCÍAS', 'AL MIXINO?']} top={330} size={110} />
        <Wash k={seg(t, EV.fadeOut, 180)} />
      </>
    ),
  };
}
