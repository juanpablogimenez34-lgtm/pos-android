// ESCENA 7 (90–105 s) · EL ATAQUE: la anguila llega junto al escondite con sigilo, emite una ráfaga
// de alto voltaje (visualización) y el pez sufre una contracción muscular involuntaria (rígido, vibra,
// aletas extendidas); a cámara lenta narrativa, la anguila se lanza y lo succiona.
import {clamp, lerp} from '../../../engine/math';
import {breathe, cam, Cam, SceneOut, shot} from '../../../studio2';
import {ElectricEel} from '../character/ElectricEel';
import {Prey} from '../character/Prey';
import {Brand, headPoint, seg, Vignette, win} from '../components/common';
import {EV} from '../data/timeline';
import {PulseFronts, VisualTag} from '../effects/Electric';
import {RiverBack, RiverFront} from '../environment/River';
import {eel56, HIDE, HideSet, tm} from './S05';

export function scene07(t: number): SceneOut {
  const T = tm(t);
  const e = eel56(t);
  const sp = e.spine;
  const hd = headPoint(sp);
  const stun = T < EV.attack + 0.05 ? 0 : clamp(1 - (T - tm(EV.capture)) * 3);
  const capT = tm(EV.capture);
  const cap = seg(T, capT - 0.35, capT);
  const px = lerp(HIDE.x, hd.x, cap);
  const py = lerp(HIDE.y - 10 * stun, hd.y, cap);
  let c: Cam = shot(t, 90, 95, cam(hd.x - 120, hd.y - 60, 1.4), cam((hd.x + HIDE.x) / 2, (hd.y + HIDE.y) / 2 - 30, 2.1), 'inOut');
  if (t >= 95) c = cam((hd.x + HIDE.x) / 2, (hd.y + HIDE.y) / 2 - 30, lerp(2.1, 2.5, seg(t, 95, 98)));
  if (t >= 100.5) c = shot(t, 100.5, 105, cam((hd.x + HIDE.x) / 2, (hd.y + HIDE.y) / 2 - 30, 2.5), cam(hd.x + 100, hd.y - 80, 1.4), 'cine');
  c = breathe(c, t, 0.25);
  return {
    svg: (
      <RiverBack cam={c} t={t} murk={0.9} light={0.8}>
        <HideSet t={T} />
        {cap < 1 && <Prey uid="p7" p={{x: px, y: py, t: T, s: 1.7, dir: -1, swim: 0.15, hide: T < EV.attack ? 1 : 0, stun, hue: 'red', opacity: 1 - seg(T, capT - 0.08, capT)}} />}
        <ElectricEel uid="e7" spine={sp} look={{t: T, finPhase: e.finPhase, finAmp: e.p.finAmp, mouth: e.p.mouth, volt: e.p.volt * win(T, EV.attack, EV.attack + 0.9, 0.1), eye: 1}} />
        <PulseFronts spine={sp} t={T} t0={EV.attack} dur={0.75} rate={20} aim={HIDE} reach={520} />
      </RiverBack>
    ),
    overlay: (
      <>
        <RiverFront cam={c} t={T} murk={0.9} />
        <Vignette />
        <VisualTag k={win(t, EV.attack, EV.attack + 3.2, 0.3)} text="VISUALIZACIÓN CIENTÍFICA · DESCARGA DE ALTO VOLTAJE (CÁMARA LENTA)" />
        <Brand />
      </>
    ),
  };
}
