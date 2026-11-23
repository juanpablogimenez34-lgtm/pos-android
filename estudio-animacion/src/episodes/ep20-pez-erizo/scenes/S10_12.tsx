// ESCENAS 10–12.
//  10 (135–150) SU VIDA CUANDO NO ESTÁ EN PELIGRO: explora el arrecife, busca entre rocas e investiga un
//               caracol (invertebrado de concha dura) con su pico.
//  11 (150–165) MÁS QUE UNA SIMPLE BOLA: piel y espinas en primer plano; esquema de la espina (escama
//               modificada que se pliega o se yergue); el pez nadando.
//  12 (165–180) FINAL: nada entre corales iluminados, último primer plano y la cámara se aleja. Texto final.
import {AbsoluteFill} from 'remotion';
import {clamp, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {PorcupineFish} from '../character/PorcupineFish';
import {BigTitle, Brand, Callout, fishState, FTrack, seg, Vignette, Wash, win} from '../components/common';
import {EV} from '../data/timeline';
import {Rock, ReefBack, ReefFront, ReefSet, SAND} from '../environment/Reef';

const f1 = (n: number) => n.toFixed(1);
const SNAIL = {x: 520, y: SAND - 96};

const Snail: React.FC<{t: number; bitten: number}> = ({t, bitten}) => (
  <g transform={`translate(${SNAIL.x} ${SNAIL.y})`}>
    <path d={`M-30,6 Q-10,${f1(2 + Math.sin(t * 2) * 1)} 22,6 L26,10 L-34,10Z`} fill="#c8a888" />
    <circle cx={22} cy={2} r={2} fill="#3a2a1a" />
    <g opacity={1 - bitten * 0.5}>
      <circle cx={-6} cy={-8} r={18} fill="#a86a3a" stroke="#4a2a12" strokeWidth={2} />
      <path d="M-6,-8 m-12,0 a12,12 0 1,1 12,12 a8,8 0 1,1 -6,-10 a4,4 0 1,1 4,2" stroke="#4a2a12" strokeWidth={2} fill="none" />
    </g>
    {bitten > 0.2 && <path d="M2,-22 l5,8 l-6,4 l6,7" stroke="#2a1a0a" strokeWidth={2} fill="none" opacity={bitten} />}
  </g>
);

const T10: FTrack = [[135, 'RELAXED_SWIM'], [140, 'CURIOUS'], [145, 'CURIOUS']];

export function scene10(t: number): SceneOut {
  const st = fishState(T10, t);
  const fx = t < 140 ? lerp(-500, 120, seg(t, 135, 140)) : t < 144.5 ? lerp(120, 300, seg(t, 140, 144.5)) : 300 + Math.sin((t - 144.5) * 2) * 6;
  const fy = t < 140 ? 200 + Math.sin(t) * 30 : lerp(220, SNAIL.y - 30, seg(t, 140, 145));
  const angle = t < 140 ? 0 : lerp(0, 0.28, seg(t, 140, 145));
  const bite = win(t, 146, 149.5, 0.3);
  const mouth = bite * (0.5 + 0.5 * Math.sin(t * 9)) + 0.05;
  let c: Cam = shot(t, 135, 140, cam(-300, 120, 0.95), cam(fx + 60, fy - 40, 1.5), 'inOut');
  if (t >= 140) c = cam(fx + 80, fy - 20, lerp(1.5, 2.2, seg(t, 140, 144)));
  if (t >= 144.5) c = shot(t, 144.5, 146, cam(fx + 80, fy - 20, 2.2), cam((fx + 130 + SNAIL.x) / 2, (fy + SNAIL.y) / 2, 3.8), 'cine');
  c = breathe(c, t, 0.25);
  const ss = toScreen(c, SNAIL.x, SNAIL.y - 6);
  return {
    svg: (
      <ReefBack cam={c} t={t}>
        <ReefSet t={t} xs={[-1000, -300, 1100]} />
        <Rock x={560} y={SAND + 10} w={340} h={110} seed={81} c="#3a4a5a" />
        <Snail t={t} bitten={seg(t, 147.5, 149)} />
        <PorcupineFish uid="f10" x={fx} y={fy} angle={angle} look={{inflation: 0, t, swim: st.swim, finFreq: st.finFreq, mouth, eye: 0.8}} />
      </ReefBack>
    ),
    overlay: (
      <>
        <ReefFront cam={c} t={t} />
        <Vignette />
        <Callout k={win(t, 145.6, 149.6)} x={ss.x} y={ss.y} tx={160} ty={560} text="caracol (concha dura)" />
        <Brand />
      </>
    ),
  };
}

const T11: FTrack = [[150, 'RELAXED_SWIM'], [160, 'NORMAL_SWIM']];

export function scene11(t: number): SceneOut {
  const st = fishState(T11, t);
  const fx = t < 160 ? Math.sin(t * 0.3) * 20 : (t - 160) * 90;
  const fy = 200 + Math.sin(t * 0.8) * 6;
  let c: Cam = cam(fx - 20, fy - 30, 5.0);
  if (t >= 154.5) c = shot(t, 154.5, 156, cam(fx - 20, fy - 30, 5.0), cam(fx, fy - 40, 1.8), 'cine');
  if (t >= 156) c = cam(fx, fy - 40, 1.8);
  if (t >= 160) c = shot(t, 160, 165, cam(fx, fy - 40, 1.8), cam(fx + 80, fy - 60, 1.3), 'inOut');
  c = breathe(c, t, 0.2);
  // esquema de la espina: piel que se estira y espina que pivota sobre su base
  const dk = win(t, 155.6, 160.4, 0.5);
  const piv = (t - 155.6) / 4.8;
  const ang = lerp(-2.7, -1.57, clamp(Math.sin(piv * Math.PI)));
  return {
    svg: (
      <ReefBack cam={c} t={t}>
        <ReefSet t={t} xs={[-700, 700, 1500]} />
        <PorcupineFish uid="f11" x={fx} y={fy} look={{inflation: 0, t, swim: st.swim, finFreq: st.finFreq, mouth: st.mouth, eye: st.eye}} />
      </ReefBack>
    ),
    overlay: (
      <>
        <ReefFront cam={c} t={t} />
        <Vignette />
        <Callout k={win(t, 150.8, 154.4)} x={540} y={980} tx={160} ty={560} text="piel con manchas y espinas plegadas" />
        {dk > 0.01 && (
          <AbsoluteFill style={{pointerEvents: 'none', opacity: dk}}>
            <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
              <rect x={140} y={300} width={800} height={420} rx={30} fill="rgba(4,26,46,0.78)" stroke="#7ae0ff" strokeWidth={2} strokeOpacity={0.5} />
              <path d={`M200,${f1(560 - Math.sin(piv * Math.PI) * 30)} Q540,${f1(520 - Math.sin(piv * Math.PI) * 70)} 880,${f1(560 - Math.sin(piv * Math.PI) * 30)}`} stroke="#d8b878" strokeWidth={26} fill="none" strokeLinecap="round" />
              <circle cx={540} cy={f1(525 - Math.sin(piv * Math.PI) * 62)} r={14} fill="#c8a868" />
              <path d={`M540,${f1(525 - Math.sin(piv * Math.PI) * 62)} l${f1(Math.cos(ang) * 190)},${f1(Math.sin(ang) * 190)}`} stroke="#e8dcc0" strokeWidth={14} strokeLinecap="round" />
              <path d={`M${f1(540 + Math.cos(ang) * 100)},${f1(525 - Math.sin(piv * Math.PI) * 62 + Math.sin(ang) * 100)} l${f1(Math.cos(ang) * 90)},${f1(Math.sin(ang) * 90)}`} stroke="#5a4220" strokeWidth={9} strokeLinecap="round" />
            </svg>
            <div style={{position: 'absolute', left: 170, right: 170, top: 610, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 28, color: '#eaffff', textAlign: 'center'}}>Las espinas son escamas modificadas: plegadas en reposo, se yerguen cuando la piel se estira al inflarse</div>
          </AbsoluteFill>
        )}
        <Brand />
      </>
    ),
  };
}

const T12: FTrack = [[165, 'RELAXED_SWIM'], [170, 'CURIOUS'], [175, 'RELAXED_SWIM']];

export function scene12(t: number): SceneOut {
  const st = fishState(T12, t);
  const fx = t < 170 ? lerp(-400, 100, seg(t, 165, 170)) : t < 175 ? 100 + (t - 170) * 6 : 130 + (t - 175) * 70;
  const fy = 180 + Math.sin(t * 0.8) * 20;
  let c: Cam = cam(fx + 40, fy - 60, 1.3);
  if (t >= 169.6) c = shot(t, 169.6, 171, cam(fx + 40, fy - 60, 1.3), cam(fx + 70, fy - 20, 3.6), 'cine');
  if (t >= 171) c = cam(fx + 70, fy - 20, 3.6);
  if (t >= 174.6) c = shot(t, 174.6, 179.5, cam(fx + 70, fy - 20, 3.6), cam(fx - 100, fy - 300, 0.8), 'cine');
  c = breathe(c, t, 0.2);
  return {
    svg: (
      <ReefBack cam={c} t={t} light={1.15}>
        <ReefSet t={t} xs={[-1200, -600, 0, 700, 1400]} />
        <PorcupineFish uid="f12" x={fx} y={fy} look={{inflation: 0, t, swim: st.swim, finFreq: st.finFreq, mouth: st.mouth, eye: st.eye, blink: win(t, 172.6, 172.85, 0.08)}} />
      </ReefBack>
    ),
    overlay: (
      <>
        <ReefFront cam={c} t={t} />
        <Vignette />
        <BigTitle k={clamp((t - EV.endText) / 0.6) * (1 - seg(t, EV.fadeOut, 180))} lines={['¿QUÉ OTRO ANIMAL', 'DEBERÍAMOS', 'DESCUBRIR?']} top={300} size={84} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1660, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 30, letterSpacing: 6, color: '#f2fdff', opacity: 0.8 * clamp((t - EV.endText - 0.6) / 0.6) * (1 - seg(t, EV.fadeOut, 180))}}>MUNDO INSÓLITO DOCUMENTALES</div>
        <Wash k={seg(t, EV.fadeOut, 180)} />
      </>
    ),
  };
}
