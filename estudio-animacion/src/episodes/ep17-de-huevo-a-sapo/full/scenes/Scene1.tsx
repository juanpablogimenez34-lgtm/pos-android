// ESCENA 1 (0–20 s) · EL NACIMIENTO DE UNA CRIATURA EXTRAORDINARIA
//  0–2,6  gancho: el renacuajo nada hacia la luz y se transforma de forma continua (semanas
//         condensadas) hasta atravesar la superficie.
//  2,6–8,4 el sapo adulto en la orilla; la cámara retrocede y descubre el estanque. Título.
//  8,4–14 la cámara entra en el agua: primer plano de los cordones de huevos.
//  14–20  se distingue un embrión dentro de uno de ellos.
import React from 'react';
import {clamp, lerp} from '../../../../engine/math';
import {FONT_FAMILY} from '../../../../engine/fonts';
import {GrowthTrack, growthAt, stageAt} from '../../../../lifecycle/stages';
import {TimeLapse} from '../../../../lifecycle/TimeLapse';
import {breathe, cam, Cam, DepthDive, SceneOut, shot} from '../../../../studio2';
import {EmbryoEgg} from '../../character/Embryo';
import {Toad, toadPose} from '../../character/Toad';
import {ForestBack, ForestFront} from '../../environment/Forest';
import {Elodea, PondBack, PondFront} from '../../environment/Pond';
import {swimAt} from '../../motion/swim';
import {BUFO_STAGES} from '../../species/bufoBufo';
import {seg, StageChip, Vignette, Wash, win} from '../components/shared';
import {EGG_F, EggBed} from './eggs';

const HOOK: GrowthTrack = [
  [0.1, 0.12],
  [0.7, 0.4],
  [1.3, 0.62],
  [1.8, 0.8],
  [2.3, 0.94],
];

const Title: React.FC<{t: number}> = ({t}) => {
  const k = win(t, 3.4, 7.9, 0.6);
  if (k <= 0.01) return null;
  const s = 0.94 + 0.06 * clamp((t - 3.4) / 0.8);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `scale(${s.toFixed(3)})`}}>
      <div style={{fontWeight: 900, fontSize: 108, letterSpacing: 4, color: '#fff4d8', lineHeight: 1.02, textShadow: '0 0 30px rgba(255,200,110,0.45), 0 6px 18px rgba(0,0,0,0.85)'}}>DE HUEVO<br />A SAPO</div>
      <div style={{marginTop: 18, fontWeight: 800, fontSize: 38, letterSpacing: 5, color: '#ffd890', textShadow: '0 3px 12px rgba(0,0,0,0.85)', opacity: clamp((t - 4.0) / 0.6)}}>UNA TRANSFORMACIÓN INCREÍBLE</div>
    </div>
  );
};

export function scene1(t: number): SceneOut {
  if (t < 2.6) {
    // ---- gancho: metamorfosis continua mientras nada hacia la superficie
    const g = growthAt(HOOK, t);
    const st = stageAt(BUFO_STAGES, g);
    const x = -260 + t * 210;
    const y = 120 - t * t * 70;
    const sw = swimAt(t, lerp(0.9, 0.5, g));
    const pose = toadPose({x, y, angle: -0.35 + sw.bodyYaw, t, swimPhase: sw.phase, swimAmp: sw.amp, fold: 0.1 + 0.3 * Math.max(0, Math.sin(t * 7)), armReach: 0.3 * g, inWater: true});
    const c = breathe(cam(x + 40, y - 30, lerp(2.5, 1.9, seg(t, 0, 2.6))), t, 0.4);
    return {
      svg: (
        <PondBack cam={c} t={t}>
          {[-300, -40, 240, 520].map((ex, i) => <Elodea key={ex} x={ex} base={300} h={620 + i * 90} t={t} seed={i * 2.7 + 3} c={i % 2 ? '#2f6e3a' : '#3c8240'} />)}
          <Toad uid="h1" s={st} p={pose} />
        </PondBack>
      ),
      overlay: (
        <>
          <PondFront cam={c} t={t} />
          <Vignette kind="water" />
          <TimeLapse k={win(t, 0.05, 2.3, 0.2)} label="semanas · tiempo condensado" spin={t * 9} />
          <StageChip text={st.stage} k={win(t, 0.1, 2.25, 0.2)} />
          <DepthDive u={(t - 1.95) / 0.7} />
          <Wash k={0.45 * seg(t, 2.2, 2.6)} />
        </>
      ),
    };
  }
  if (t < 8.9) {
    // ---- el sapo adulto en la orilla; la cámara retrocede hasta mostrar el estanque
    const st = stageAt(BUFO_STAGES, 1);
    const sz = st.size;
    const x = -10;
    const y = -54 - 46 * sz;
    const breath = 0.5 + 0.5 * Math.sin(t * 4.6);
    const blink = win(t, 5.2, 5.4, 0.08);
    const pose = toadPose({x, y, t, swimAmp: 0, breath, blink, inWater: false, look: Math.sin(t * 0.7) * 0.5});
    const head = {x: x + 70 * sz, y: y - 30 * sz};
    let c: Cam = shot(t, 2.6, 3.4, cam(head.x + 10, head.y + 4, 3.6), cam(head.x, head.y + 10, 3.3), 'out');
    if (t >= 3.4) c = shot(t, 3.4, 8.0, cam(head.x, head.y + 10, 3.3), cam(-330, -250, 1.35), 'cine');
    if (t >= 8.0) c = shot(t, 8.0, 8.9, cam(-330, -250, 1.35), cam(-900, 80, 1.6), 'in');
    c = breathe(c, t, 0.3);
    return {
      svg: (
        <ForestBack cam={c} t={t}>
          <ellipse cx={x + 6 * sz} cy={-56} rx={70 * sz} ry={8 * sz} fill="#000" opacity={0.3} />
          <Toad uid="a1" s={st} p={pose} />
        </ForestBack>
      ),
      overlay: (
        <>
          <ForestFront cam={c} t={t} />
          <Vignette kind="forest" />
          <Wash k={0.45 * (1 - seg(t, 2.6, 3.2))} />
          <Title t={t} />
          <DepthDive u={1 - (t - 8.25) / 0.7} />
          <Wash k={0.4 * seg(t, 8.5, 8.9)} color="#cff4e8" />
        </>
      ),
    };
  }
  // ---- bajo el agua: los cordones de huevos y un embrión
  const e = lerp(0.04, 0.16, seg(t, 14, 20));
  let c: Cam = shot(t, 8.9, 14, cam(-320, -240, 1.25), cam(EGG_F.x - 60, EGG_F.y - 10, 2.6), 'cine');
  if (t >= 14) c = shot(t, 14, 18.5, cam(EGG_F.x - 60, EGG_F.y - 10, 2.6), cam(EGG_F.x, EGG_F.y, 4.7), 'cine');
  if (t >= 18.5) c = cam(EGG_F.x + (t - 18.5) * 2, EGG_F.y, 4.7 + (t - 18.5) * 0.05);
  c = breathe(c, t, 0.4);
  return {
    svg: (
      <PondBack cam={c} t={t}>
        <EggBed t={t} />
        <EmbryoEgg x={EGG_F.x} y={EGG_F.y} r={22} e={e} t={t} open={0} uid="e1" refined />
      </PondBack>
    ),
    overlay: (
      <>
        <PondFront cam={c} t={t} />
        <Vignette kind="water" />
        <Wash k={0.4 * (1 - seg(t, 8.9, 9.5))} color="#cff4e8" />
        <StageChip text="huevo · embrión temprano" k={win(t, 15.5, 19.8, 0.5)} />
      </>
    ),
  };
}
