// ESCENAS 7–9.
//  7 (90–105)   EL INCREÍBLE CAMBIO DE TAMAÑO: vista lateral fija; inflado progresivo y diagrama que
//               superpone la silueta normal y la inflada (del propio modelo, sin cifras inventadas).
//  8 (105–120)  UNA DEFENSA QUE CUESTA ENERGÍA: flota inflado; la amenaza se aleja; empieza a desinflarse.
//  9 (120–135)  REGRESAR A LA NORMALIDAD: el cuerpo se desinfla, expulsa agua por la boca, las espinas se
//               pliegan y vuelve a nadar.
import {AbsoluteFill} from 'remotion';
import {clamp, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {Predator} from '../../ep18-mixino/character/Predator';
import {outline} from '../character/inflation';
import {PorcupineFish} from '../character/PorcupineFish';
import {Brand, fishState, FTrack, inflateCurve, seg, Vignette, win} from '../components/common';
import {EV} from '../data/timeline';
import {ReefBack, ReefFront, ReefSet} from '../environment/Reef';

const f1 = (n: number) => n.toFixed(1);
const T7: FTrack = [[90, 'RELAXED_SWIM'], [93, 'THREATENED'], [EV.sizeInflate[0], 'INFLATING'], [EV.sizeInflate[1], 'FULLY_INFLATED']];

export function scene07(t: number): SceneOut {
  const st = fishState(T7, t);
  const fx = t < 92.5 ? lerp(-260, 0, seg(t, 90, 92.5)) : 0;
  const fy = 200 + Math.sin(t * 0.8) * 3;
  const inf = inflateCurve(t, EV.sizeInflate[0], EV.sizeInflate[1], 6);
  const c: Cam = breathe(cam(0, 190, 1.75), t, 0.1);
  const dk = win(t, EV.diagram, 104.7, 0.5);
  const toS = (pts: {x: number; y: number}[]) => pts.map((p) => toScreen(c, fx + p.x, fy + p.y));
  const o0 = toS(outline(0, 64));
  const o1 = toS(outline(1, 64));
  const path = (pts: {x: number; y: number}[]) => `M${pts.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')}Z`;
  return {
    svg: (
      <ReefBack cam={c} t={t}>
        <ReefSet t={t} xs={[-800, 750]} />
        <PorcupineFish uid="f7" x={fx} y={fy} look={{inflation: inf, t, swim: st.swim, finFreq: st.finFreq, mouth: st.mouth, eye: st.eye}} />
      </ReefBack>
    ),
    overlay: (
      <>
        <ReefFront cam={c} t={t} />
        <Vignette />
        {dk > 0.01 && (
          <AbsoluteFill style={{pointerEvents: 'none', opacity: dk}}>
            <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
              <path d={path(o1)} fill="rgba(255,210,122,0.08)" stroke="#ffd27a" strokeWidth={4} strokeDasharray="14 8" />
              <path d={path(o0)} fill="rgba(122,224,255,0.12)" stroke="#7ae0ff" strokeWidth={4} />
            </svg>
            <div style={{position: 'absolute', left: 90, top: 1240, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 32, color: '#7ae0ff'}}>— silueta normal</div>
            <div style={{position: 'absolute', left: 90, top: 1290, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 32, color: '#ffd27a'}}>- - silueta inflada (mismo individuo)</div>
          </AbsoluteFill>
        )}
        <Brand />
      </>
    ),
  };
}

const T8: FTrack = [[105, 'FULLY_INFLATED'], [107, 'DEFENSIVE_FLOAT'], [EV.deflate[0], 'DEFLATING']];
export const infDeflate = (t: number) => 1 - inflateCurve(t, EV.deflate[0], EV.deflate[1], 4);

export function scene08(t: number): SceneOut {
  const st = fishState(T8, t);
  const fx = 40 + (t - 105) * 6;
  const fy = 170 + Math.sin(t * 0.6) * st.bob;
  const inf = infDeflate(t);
  const leave = seg(t, 105, EV.holdThreatGone + 2);
  let c: Cam = shot(t, 105, 110, cam(fx - 260, fy - 60, 1.1), cam(fx, fy - 20, 1.6), 'inOut');
  if (t >= 110) c = cam(fx, fy - 20, lerp(1.6, 2.1, seg(t, 113, 120)));
  c = breathe(c, t, 0.3);
  return {
    svg: (
      <ReefBack cam={c} t={t}>
        <ReefSet t={t} xs={[-900, -200, 600]} />
        <g opacity={0.55 * (1 - seg(t, 111, 113))}>
          <Predator uid="p8" p={{x: -700 - leave * 1200, y: -40 - leave * 120, scale: 2.2, dir: -1, t, beat: 1, mouth: 0.1, gill: 0.2}} />
        </g>
        <PorcupineFish uid="f8" x={fx} y={fy} look={{inflation: inf, t, swim: st.swim, finFreq: st.finFreq, mouth: st.mouth, eye: st.eye, blink: win(t, 112, 112.25, 0.08)}} />
      </ReefBack>
    ),
    overlay: (
      <>
        <ReefFront cam={c} t={t} />
        <Vignette />
        <Brand />
      </>
    ),
  };
}

const T9: FTrack = [[120, 'DEFLATING'], [127.5, 'RECOVERING'], [EV.swimAgain, 'RELAXED_SWIM']];

export function scene09(t: number): SceneOut {
  const st = fishState(T9, t);
  const fx = 130 + Math.max(0, t - 129) * 60;
  const fy = 170 + Math.sin(t * 0.7) * st.bob;
  const inf = infDeflate(t);
  let c: Cam = cam(fx, fy - 20, 2.1);
  if (t >= 128) c = shot(t, 128, 132, cam(fx, fy - 20, 2.1), cam(fx + 120, fy - 50, 1.3), 'cine');
  if (t >= 132) c = cam(fx + 120, fy - 50, 1.3);
  c = breathe(c, t, 0.25);
  const out = win(t, 120, 127, 0.5) * clamp((inf - 0.02) * 4);
  const mouth = {x: fx + 128 * lerp(1, 1.12, inf), y: fy + 4};
  return {
    svg: (
      <ReefBack cam={c} t={t}>
        <ReefSet t={t} xs={[-600, 200, 900, 1600]} />
        <PorcupineFish uid="f9" x={fx} y={fy} look={{inflation: inf, t, swim: st.swim, finFreq: st.finFreq, mouth: Math.max(st.mouth, out * 0.6), eye: st.eye}} />
        {out > 0.01 && Array.from({length: 12}, (_, i) => {
          const u = ((t * 1.6 + i / 12) % 1);
          return <circle key={i} cx={mouth.x + u * 160} cy={mouth.y + Math.sin(i * 2.3) * u * 50} r={2 + u * 2} fill="#eaffff" opacity={out * (1 - u) * 0.85} />;
        })}
      </ReefBack>
    ),
    overlay: (
      <>
        <ReefFront cam={c} t={t} />
        <Vignette />
        <Brand />
      </>
    ),
  };
}
