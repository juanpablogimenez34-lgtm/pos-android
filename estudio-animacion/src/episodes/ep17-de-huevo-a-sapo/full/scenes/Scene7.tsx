// ESCENA 7 (150–180 s) · EL SAPO ADULTO
//  150–158 transición temporal (años): pasan las estaciones (luz, hojarasca que cae) y el sapo crece.
//  158–165 el adulto se desplaza a pie por el bosque húmedo.
//  165–173 primeros planos: ojo (iris cobrizo, pupila horizontal, parpadeo), piel con verrugas y
//          glándula parotoide, garganta que late con la respiración.
//  173–180 la cámara se aleja; pregunta final.
import React from 'react';
import {clamp, lerp} from '../../../../engine/math';
import {FONT_FAMILY} from '../../../../engine/fonts';
import {growthAt, stageAt} from '../../../../lifecycle/stages';
import {TimeLapse} from '../../../../lifecycle/TimeLapse';
import {breathe, cam, Cam, SceneOut, shot} from '../../../../studio2';
import {Toad, toadPose} from '../../character/Toad';
import {ForestBack, ForestFront} from '../../environment/Forest';
import {BUFO_STAGES} from '../../species/bufoBufo';
import {seg, StageChip, Vignette, Wash, win} from '../components/shared';
import {EV, GROWTH} from '../data/timeline';

const GROUND = -6;
const X0 = 760;
const WALK_A = 158.4;
const WALK_B = 164.6;
const X1 = 1400;

const EndText: React.FC<{t: number}> = ({t}) => {
  const k = clamp((t - EV.endText) / 0.7) * (1 - seg(t, EV.fadeOut, 180));
  if (k <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 300, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${((1 - clamp((t - EV.endText) / 0.7)) * 16).toFixed(1)}px)`}}>
      <div style={{fontWeight: 900, fontSize: 76, lineHeight: 1.1, color: '#fff4d8', textShadow: '0 0 26px rgba(255,200,110,0.4), 0 6px 18px rgba(0,0,0,0.85)'}}>¿QUÉ OTRO ANIMAL TE GUSTARÍA VER CRECER?</div>
    </div>
  );
};

export function scene7(t: number): SceneOut {
  const g = growthAt(GROWTH, t);
  const st = stageAt(BUFO_STAGES, g);
  const sz = st.size;
  const walkU = clamp((t - WALK_A) / (WALK_B - WALK_A));
  const x = lerp(X0, X1, walkU);
  const walk = 0.75 * clamp((t - WALK_A) / 0.3) * clamp((WALK_B - t) / 0.3);
  const phase = ((x - X0) / 70) * Math.PI * 2;
  const y = GROUND - 46 * sz - 4 * Math.abs(Math.sin(phase)) * walk;
  const lapse = win(t, 150.5, 158.2, 0.5);
  const cyc = (t - 150.5) / 2.5;
  const light = 1 - lapse * (0.32 * (0.5 - 0.5 * Math.cos(2 * Math.PI * cyc)));
  const season = lapse * (0.5 - 0.5 * Math.cos(2 * Math.PI * cyc * 0.67));
  const breathK = t > 168.6 && t < 173.5 ? 1 : 0.6;
  const blink = Math.max(win(t, 155.0, 155.2, 0.08), win(t, 167.3, 167.55, 0.1), win(t, 176.2, 176.4, 0.08));
  const pose = toadPose({x, y, t, swimAmp: 0, fold: 1, breath: 0.5 + 0.5 * Math.sin(t * 3.6) * breathK, blink, inWater: false, walk, walkPhase: phase, look: t > 165 && t < 168.6 ? Math.sin((t - 165) * 1.4) * 0.7 : 0.2});
  const eye = {x: x + 62 * sz, y: y - 40 * sz};
  const parot = {x: x + 50 * sz, y: y - 56 * sz};
  const throat = {x: x + 62 * sz, y: y + 22 * sz};
  let c: Cam = shot(t, 150, 158, cam(820, -50, 3.0), cam(X0 + 40, -95, 2.0), 'inOut');
  if (t >= 158) c = shot(t, 158, 159.5, cam(X0 + 40, -95, 2.0), cam(x + 120, -90, 1.8), 'cine');
  if (t >= 159.5) c = cam(x + 120, -90, 1.8);
  if (t >= 164.4) c = shot(t, 164.4, 166, cam(x + 120, -90, 1.8), cam(eye.x, eye.y, 7.2), 'cine');
  if (t >= 166) c = cam(eye.x + (t - 166) * 1.5, eye.y, 7.2 + (t - 166) * 0.05);
  if (t >= 168.4) c = shot(t, 168.4, 170.2, cam(eye.x + 3.6, eye.y, 7.3), cam(parot.x, parot.y, 5.0), 'cine');
  if (t >= 170.2) c = shot(t, 170.2, 172.6, cam(parot.x, parot.y, 5.0), cam(throat.x, throat.y, 4.6), 'inOut');
  if (t >= 172.6) c = shot(t, 172.6, 178.4, cam(throat.x, throat.y, 4.6), cam(x - 60, -330, 0.95), 'cine');
  c = breathe(c, t, t > 165 && t < 172.6 ? 0.15 : 0.3);
  return {
    svg: (
      <ForestBack cam={c} t={t} wide light={light} season={season} fall={lapse}>
        <ellipse cx={x + 6 * sz} cy={GROUND - 2} rx={70 * sz} ry={8 * sz} fill="#000" opacity={0.3} />
        <Toad uid="ad7" s={st} p={pose} />
      </ForestBack>
    ),
    overlay: (
      <>
        <ForestFront cam={c} t={t} />
        <Vignette kind="forest" />
        <TimeLapse k={lapse} label="años · tiempo condensado" spin={(t - 150.5) * 5} />
        <StageChip text={g < 0.985 ? 'sapo joven → sapo adulto' : 'sapo adulto · Bufo bufo'} k={win(t, 150.8, 164.2, 0.4)} />
        <EndText t={t} />
        <Wash k={seg(t, EV.fadeOut, 180)} color="#000" />
      </>
    ),
  };
}
