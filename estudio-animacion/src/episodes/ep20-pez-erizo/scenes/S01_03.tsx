// ESCENAS 1–3.
//  1 (0–15)  LA TRANSFORMACIÓN IMPOSIBLE: un depredador se lanza; el pez se infla en pantalla (0,8–4 s),
//            las espinas se despliegan; el depredador duda y retrocede; la cámara revela la esfera.
//  2 (15–30) CONOCE AL PEZ ERIZO: nada en estado normal; ojos y cabeza; recorrido por manchas y espinas.
//  3 (30–45) EL PRIMER SECRETO: primer plano de la boca; bombea agua (comienza a hincharse) y transición
//            al corte anatómico.
import {clamp, lerp} from '../../../engine/math';
import {breathe, cam, Cam, SceneOut, shot} from '../../../studio2';
import {Predator} from '../../ep18-mixino/character/Predator';
import {PorcupineFish} from '../character/PorcupineFish';
import {BigTitle, Brand, Callout, fishState, FTrack, inflateCurve, seg, Vignette, win} from '../components/common';
import {EV} from '../data/timeline';
import {ReefBack, ReefFront, ReefSet} from '../environment/Reef';
import {toScreen} from '../../../studio2';

const T1: FTrack = [[0, 'ALERT'], [0.7, 'INFLATING'], [4.0, 'FULLY_INFLATED'], [8, 'DEFENSIVE_FLOAT']];

export function scene01(t: number): SceneOut {
  const st = fishState(T1, t);
  const inf = inflateCurve(t, EV.hookInflate[0], EV.hookInflate[1], 4);
  const fx = 40 + Math.sin(t * 0.6) * 10;
  const fy = 180 + Math.sin(t * 1.1) * st.bob;
  // depredador: embiste (0–2,6), frena al ver la esfera, duda y retrocede
  const atk = seg(t, 0, 2.6);
  const back = seg(t, 4.2, 11);
  const px = lerp(-1500, -520, Math.pow(atk, 0.7)) - back * 1000;
  const py = lerp(-60, 120, atk) - back * 260;
  let c: Cam = cam(fx + 70, fy - 20, 3.2);
  if (t >= 0.9) c = shot(t, 0.9, 3.0, cam(fx + 70, fy - 20, 3.2), cam(fx - 200, fy - 40, 1.45), 'out');
  if (t >= 3.0) c = shot(t, 3.0, 5.0, cam(fx - 200, fy - 40, 1.45), cam(fx - 80, fy - 30, 1.6), 'inOut');
  if (t >= 5.0) c = shot(t, 5.0, 10, cam(fx - 80, fy - 30, 1.6), cam(fx - 260, fy - 80, 1.05), 'inOut');
  if (t >= 10) c = shot(t, 10, 15, cam(fx - 260, fy - 80, 1.05), cam(fx + 10, fy - 10, 2.0, 0.03), 'cine');
  const kick = win(t, 2.4, 3.0, 0.15) * 5;
  c = {...breathe(c, t, 0.3), x: c.x + Math.sin(t * 38) * kick};
  return {
    svg: (
      <ReefBack cam={c} t={t}>
        <ReefSet t={t} />
        <Predator uid="p1" p={{x: px, y: py, scale: 2.4, angle: lerp(0.12, -0.15, back), t, beat: 1.2 + atk - back * 0.4, mouth: win(t, 1.6, 4.6, 0.5) * 0.8, gill: 0.3, shake: win(t, 3.4, 4.6, 0.3) * 0.5}} />
        <PorcupineFish uid="f1" x={fx} y={fy} scale={1} look={{inflation: inf, t, swim: st.swim, finFreq: st.finFreq, mouth: st.mouth, eye: st.eye}} />
      </ReefBack>
    ),
    overlay: (
      <>
        <ReefFront cam={c} t={t} />
        <Vignette />
        <BigTitle k={win(t, EV.hookText, 7.6, 0.4)} lines={['¡SE CONVIERTE EN', 'UNA BOLA', 'DE ESPINAS!']} top={270} size={86} />
        <Brand k={clamp((t - 8) / 1)} />
      </>
    ),
  };
}

const T2: FTrack = [[15, 'NORMAL_SWIM'], [19, 'CURIOUS'], [23, 'NORMAL_SWIM'], [27, 'RELAXED_SWIM']];

export function scene02(t: number): SceneOut {
  const st = fishState(T2, t);
  const u = (t - 15) / 15;
  const fx = lerp(-650, 700, u) - (t > 19 && t < 23 ? 0 : 0);
  const fy = 200 + Math.sin(t * 0.9) * 40;
  const angle = Math.cos(t * 0.9) * 0.08;
  let c: Cam = cam(fx + 40, fy - 30, 1.5);
  if (t >= 18.6) c = shot(t, 18.6, 19.6, cam(fx + 40, fy - 30, 1.5), cam(fx + 70, fy - 20, 3.4), 'cine');
  if (t >= 19.6) c = cam(fx + 70, fy - 20, 3.4);
  if (t >= 23) c = cam(lerp(fx + 70, fx - 80, seg(t, 23, 27)), fy - 10, lerp(3.4, 2.7, seg(t, 23, 24.5)));
  if (t >= 27) c = shot(t, 27, 30, cam(fx - 80, fy - 10, 2.7), cam(fx + 20, fy - 60, 1.2), 'cine');
  c = breathe(c, t, 0.3);
  return {
    svg: (
      <ReefBack cam={c} t={t}>
        <ReefSet t={t} xs={[-1100, -500, 200, 800, 1400]} />
        <PorcupineFish uid="f2" x={fx} y={fy} angle={angle} look={{inflation: 0, t, swim: st.swim, finFreq: st.finFreq, mouth: st.mouth, eye: st.eye, blink: win(t, 21.2, 21.45, 0.08)}} />
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

const T3: FTrack = [[30, 'CURIOUS'], [EV.pump[0], 'THREATENED'], [EV.pump[1], 'INFLATING'], [41.5, 'DEFLATING'], [44, 'RECOVERING']];

export function scene03(t: number): SceneOut {
  const st = fishState(T3, t);
  const fx = 0;
  const fy = 220 + Math.sin(t * 0.8) * 4;
  const inf = t < EV.pump[0] ? 0 : t < 41.5 ? 0.3 * inflateCurve(t, EV.pump[0], EV.pump[1], 5) : 0.3 * (1 - seg(t, 41.5, 44.6));
  const mouthW = {x: fx + 128, y: fy + 4};
  let c: Cam = cam(mouthW.x - 20, mouthW.y - 10, 4.4);
  if (t >= 39.5) c = shot(t, 39.5, 42, cam(mouthW.x - 20, mouthW.y - 10, 4.4), cam(fx, fy - 30, 2.0), 'cine');
  if (t >= 42) c = cam(fx, fy - 30, 2.0);
  c = breathe(c, t, 0.2);
  const anat = seg(t, 41.8, 44.4);
  const ms = toScreen(c, mouthW.x, mouthW.y);
  // agua que entra por la boca durante el bombeo (partículas que se dirigen a la boca)
  const flow = win(t, EV.pump[0], EV.pump[1] + 0.5, 0.4);
  return {
    svg: (
      <ReefBack cam={c} t={t}>
        <ReefSet t={t} xs={[-700, 600]} />
        <PorcupineFish uid="f3" x={fx} y={fy} look={{inflation: inf, t, swim: st.swim, finFreq: st.finFreq, mouth: st.mouth, eye: st.eye, anatomy: anat, water: anat}} />
        {flow > 0.01 && Array.from({length: 10}, (_, i) => {
          const u = ((t * 1.3 + i / 10) % 1);
          const sx = mouthW.x + 120 - u * 120 + Math.sin(i * 2) * (1 - u) * 30;
          const sy = mouthW.y + Math.cos(i * 3) * (1 - u) * 40;
          return <circle key={i} cx={sx} cy={sy} r={2.2} fill="#eaffff" opacity={flow * Math.sin(u * Math.PI) * 0.9} />;
        })}
      </ReefBack>
    ),
    overlay: (
      <>
        <ReefFront cam={c} t={t} />
        <Vignette />
        <Callout k={win(t, 31, 34.8)} x={ms.x} y={ms.y} tx={160} ty={600} text="pico de dientes fusionados" />
        <Callout k={win(t, EV.pump[0] + 0.4, 39.4)} x={ms.x} y={ms.y} tx={160} ty={600} text="bombea agua" />
        <Brand />
      </>
    ),
  };
}
