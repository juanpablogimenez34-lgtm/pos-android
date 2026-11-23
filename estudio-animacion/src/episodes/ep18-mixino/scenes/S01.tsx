// ESCENA 1 (0–15 s) · GANCHO: un depredador se acerca y ataca; el mixino libera mucosidad, la nube
// se expande en segundos, alcanza la boca del atacante y este retrocede. Título.
import {clamp, lerp} from '../../../engine/math';
import {breathe, cam, Cam, SceneOut, shot} from '../../../studio2';
import {Hagfish} from '../character/Hagfish';
import {Predator} from '../character/Predator';
import {SlimeBurst, SlimeCloud, SlimeDefs} from '../character/Slime';
import {BigTitle, seg, Vignette, win} from '../components/common';
import {EV} from '../data/timeline';
import {DeepBack, DeepFront} from '../environment/Deep';
import {crawl, pathOf, poresAt} from './rig';

const PATH = pathOf([{x: -900, y: 420}, {x: -560, y: 330}, {x: -260, y: 380}, {x: 20, y: 290}, {x: 300, y: 340}, {x: 560, y: 270}, {x: 900, y: 300}, {x: 1300, y: 260}]);
const S0 = 1500;

const hag = (t: number) => {
  const s = S0 + Math.max(0, t - 4.2) * 45 + (t > 2.9 && t < 4.2 ? (t - 2.9) * 30 : t >= 4.2 ? 39 : 0);
  return crawl(PATH, s, t, t > 2.9 ? 20 : 9, 1.4, t > 2.9 ? 1.8 : 0.8);
};
const SP_SLIME = hag(EV.hookSlime);
const BURSTS: SlimeBurst[] = [
  {t0: EV.hookSlime, sources: poresAt(SP_SLIME, [0.2, 0.32, 0.44, 0.56]), dir: -2.3, spread: 1.4, size: 330, seed: 3, drift: {x: -10, y: -8}, life: 9},
  {t0: EV.hookSlime2, sources: poresAt(SP_SLIME, [0.28, 0.4, 0.5, 0.62, 0.7]), dir: -1.7, spread: 1.9, size: 460, seed: 7, drift: {x: 4, y: -10}, life: 10},
];

export function predHook(t: number) {
  if (t < EV.hookLunge) {
    const u = seg(t, 0, EV.hookLunge);
    return {x: lerp(-1050, -230, u), y: lerp(-260, 60, u), angle: lerp(0.15, 0.32, u), mouth: seg(t, 1.8, 2.6), beat: 1, slimed: 0, shake: 0, gill: 0.2};
  }
  if (t < EV.hookSlime + 0.3) {
    const u = seg(t, EV.hookLunge, EV.hookSlime + 0.3);
    return {x: lerp(-230, -150, u), y: lerp(60, 110, u), angle: 0.32, mouth: 1, beat: 1.4, slimed: u * 0.4, shake: 0, gill: 0.3};
  }
  const u = seg(t, EV.hookSlime + 0.3, 9.5);
  return {x: lerp(-150, -900, u), y: lerp(110, -420, u), angle: lerp(0.32, -0.25, u), mouth: 0.6 + 0.4 * Math.abs(Math.sin(t * 5)) * (1 - u), beat: 1.6, slimed: clamp(0.4 + (t - 3.2) * 0.8), shake: win(t, 3.2, 7.2, 0.4), gill: 0.6 + 0.4 * Math.sin(t * 6)};
}

export function scene01(t: number): SceneOut {
  const sp = hag(t);
  const pr = predHook(t);
  let c: Cam = shot(t, 0, EV.hookLunge, cam(-120, 120, 1.15), cam(-40, 170, 1.45), 'inOut');
  if (t >= EV.hookLunge) c = shot(t, EV.hookLunge, 5, cam(-40, 170, 1.45), cam(-120, 80, 1.05), 'out');
  if (t >= 5) c = shot(t, 5, 15, cam(-120, 80, 1.05), cam(320, 200, 1.25), 'inOut');
  const kick = win(t, EV.hookSlime - 0.05, EV.hookSlime + 0.4, 0.1) * 6;
  c = {...breathe(c, t, 0.35), x: c.x + Math.sin(t * 40) * kick};
  const mouthW = {x: pr.x + 172 * 1.6 * Math.cos(pr.angle), y: pr.y + 172 * 1.6 * Math.sin(pr.angle) + 30};
  return {
    svg: (
      <DeepBack cam={c} t={t}>
        <SlimeDefs />
        <ellipse cx={pr.x + 60} cy={pr.y + 260} rx={260} ry={40} fill="#000" opacity={0.16} />
        <Hagfish uid="h1" spine={sp} look={{t, pores: win(t, EV.hookSlime - 0.1, 4.6, 0.2), shadow: 16, barbels: t > 2.9 ? 1 : 0.4, slimeCoat: clamp((t - 3) / 2)}} />
        {BURSTS.map((b, i) => <SlimeCloud key={i} t={t} b={i === 0 ? {...b, pull: {x: mouthW.x, y: mouthW.y, k: 0.35 * seg(t, EV.hookSlime, EV.hookSlime + 0.7) * (1 - seg(t, 4.5, 7))}} : b} />)}
        <Predator uid="p1" p={{x: pr.x, y: pr.y, scale: 1.6, angle: pr.angle, t, beat: pr.beat, mouth: pr.mouth, gill: pr.gill, slimed: pr.slimed, shake: pr.shake}} />
      </DeepBack>
    ),
    overlay: (
      <>
        <DeepFront cam={c} t={t} />
        <Vignette />
        <BigTitle k={win(t, EV.title, 14.7, 0.6)} lines={['EL ANIMAL QUE', 'CONVIERTE EL AGUA', 'EN MOCO']} top={250} size={86} />
      </>
    ),
  };
}
