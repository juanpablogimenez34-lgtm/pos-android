// ESCENA 5 (97.6–121) LA EMBOSCADA: desde abajo, contra la luz; acelera y sale del agua; mandíbula superior hacia
//                     delante (cámara lenta, sin heridas ni sangre); muchos intentos fracasan y la presa escapa.
// ESCENA 6 (121–150)  EL DEPREDADOR DEL DEPREDADOR: aparecen orcas a distancia y el tiburón abandona la zona
//                     (sin ataque en pantalla); el hígado como reserva de energía.
// ESCENA 7 (150–180)  UN GIGANTE VULNERABLE: crecimiento lento, estado de conservación, mordiscos muy poco
//                     frecuentes, equilibrio del océano y cierre.
import React from 'react';
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {cam, SceneOut, shot} from '../../../studio2';
import {Orca} from '../../orca-reina-oceanos/character/Orca';
import {swim} from '../../orca-reina-oceanos/character/motion';
import {Bubbles, Sea, Splash} from '../../orca-reina-oceanos/environment/Sea';
import {FurSeal, sharkPoint, WhiteShark} from '../character/WhiteShark';
import {Key, sharkSwim} from '../character/motion';
import {Brand, Tag, Wash, win} from '../components/common';
import {LiverCard, StatusCard} from '../components/Cards';
import {ambush, bc} from './S1_4';

// ---------------------------------------------------------------- ESCENA 5
export function scene5(t: number): SceneOut {
  const A = ambush(t, 106.4, 2.4, -300);
  const {seal, b, x0} = A;
  // fase de acecho: patrulla en profundidad antes del ascenso (silueta contra la luz)
  const stalk = sharkSwim([[96, x0 - 900, 1250], [101, x0 - 600, 1200], [104.2, x0 - 400, 1150]], Math.min(t, 104.2), 0.6, {tone: 0.55}, 5, 0.2);
  const pose = t < 104.2 ? {...stalk, t} : A.pose;
  // primer plano de la mordida (110–114): mandíbula y protrusión en cámara lenta, la presa ya ha escapado
  const jawK = win(t, 110.2, 114, 0.5);
  if (t > 109.6 && t < 114.6) {
    pose.jaw = 0.6 + 0.4 * Math.sin((t - 110) * 1.2);
    pose.protrude = 0.5 + 0.5 * Math.sin((t - 110) * 1.2);
  }
  let c = cam(x0 - 400, 700, 0.55);
  if (t > 103.8) c = shot(t, 103.8, 106.4, c, cam(x0 + 100, -40, 0.62));
  if (t > 106.4) c = cam(x0 + 100 + (t - 106.4) * 10, -40, 0.62);
  if (t > 109.6) c = shot(t, 109.6, 110.6, c, cam(sharkPoint(pose, 0.06, 0).x - 40, sharkPoint(pose, 0.06, 0).y, 1.6));
  if (t > 114.6) c = shot(t, 114.6, 116.2, cam(x0 + 200, 100, 1.4), cam(seal.x - 200, 120, 0.7));
  if (t > 116.2) c = cam(seal.x - 200, 120, 0.7);
  c = bc(c, t, 0.4);
  return {
    svg: (
      <Sea cam={c} t={t} mood="dawn" coast floor={2200} rocks schools={[]} front={<g><Splash x={x0} t={t} t0={106.4} size={1.3} slow={2} /><Splash x={x0 + 300} t={t} t0={b.tEntry} size={1.5} slow={1.8} /></g>}>
        <FurSeal x={seal.x} y={seal.y} s={0.8} t={t} angle={seal.angle} flip={seal.flip} />
        <WhiteShark uid="s5" p={pose} />
        {t > b.tEntry && <Bubbles t={t} src={{x: pose.x - 150, y: Math.max(40, pose.y - 60)}} n={14} seed={6} k={1 - smoothstep(b.tEntry + 1, b.tEntry + 3, t)} s={1.3} />}
      </Sea>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={win(t, 98, 103.8, 0.4)} text="ATACA DESDE ABAJO" color="#ffe2a0" />
        <Tag k={win(t, 98.4, 103.8, 0.4)} text="la presa se recorta contra la luz" top={376} color="#bfeaff" />
        <Tag k={win(t, 106, 109.4, 0.3)} text="◉ CÁMARA LENTA" top={250} color="#ffc890" />
        <Tag k={jawK} text="LA MANDÍBULA SUPERIOR AVANZA" color="#ffd23f" />
        <Tag k={win(t, 115.8, 120.6, 0.4)} text="MUCHOS INTENTOS FRACASAN" color="#bfeaff" />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 6
const P6: Key[] = [[120, -900, 1100], [127, 200, 1060], [132, 650, 1080], [135, 300, 1150], [140, -900, 1200], [151, -2600, 1250]];
export function scene6(t: number): SceneOut {
  const sh = sharkSwim(P6, t, 0.62, {rim: 0.4}, 6, 0.3);
  const pod = [0, 1, 2].map((i) => swim([[124, 2400 + i * 260, 700 + i * 160], [136, 1300 + i * 200, 760 + i * 150], [151, -200 + i * 220, 820 + i * 140]], t, {kind: i === 1 ? 'male' : 'female', scale: 0.55 - i * 0.04, seed: 20 + i}));
  const mid = sharkPoint(sh, 0.4, 0);
  let c = cam(mid.x + 100, 1100, 0.62);
  if (t > 125.6) c = shot(t, 125.6, 129, c, cam((mid.x + pod[0].x) / 2, 950, 0.42));
  if (t > 129) c = cam((mid.x + pod[0].x) / 2, 950, 0.42);
  if (t > 133) c = shot(t, 133, 135.5, c, cam(mid.x - 150, 1120, 0.7));
  if (t > 135.5) c = cam(mid.x - 150, 1120, 0.7);
  if (t > 140.4) c = shot(t, 140.4, 143, c, cam(400, 950, 0.45));
  if (t > 143) c = cam(400 - (t - 143) * 30, 950, 0.45);
  c = bc(c, t, 0.4);
  return {
    svg: (
      <g>
        <Sea cam={c} t={t} mood="day" floor={1900} rocks kelp>
          {t > 124 && pod.map((o, i) => <g key={i} opacity={smoothstep(124, 127, t)}><Orca pose={o} uid={`o6${i}`} /></g>)}
          <WhiteShark uid="s6" p={{...sh, amp: sh.amp * (t > 133 ? 1.3 : 1)}} />
          {t > 134 && t < 141 && <Bubbles t={t} src={sharkPoint(sh, 0.98, 0)} n={8} seed={7} />}
        </Sea>
        <LiverCard k={win(t, 140.9, 146, 0.5)} />
      </g>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={win(t, 126.4, 132.2, 0.4)} text="ORCAS A LA VISTA" color="#ffc8b0" />
        <Tag k={win(t, 126.8, 132.2, 0.4)} text="documentado en Sudáfrica y California" top={376} color="#d8f6ff" />
        <Tag k={win(t, 133.6, 139.6, 0.4)} text="EL TIBURÓN ABANDONA LA ZONA" color="#ffe2a0" />
        <Tag k={win(t, 146.4, 149.6, 0.4)} text="PUEDEN TARDAR MESES EN VOLVER" color="#bfeaff" />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 7
const P7: Key[] = [[149, -1400, 520], [160, -300, 480], [170, 500, 460], [181, 1500, 470]];
export function scene7(t: number): SceneOut {
  const sh = sharkSwim(P7, t, 0.78, {rim: 0.9}, 7, 0.2);
  const head = sharkPoint(sh, 0.1, 0);
  let c = cam(head.x - 300, 560, 0.55);
  if (t > 168.6) c = shot(t, 168.6, 172, c, cam(head.x - 120, 500, 1.0));
  if (t > 172) c = cam(head.x - 120, 500, 1.0);
  c = bc(c, t, 0.4);
  const end = smoothstep(174.6, 175.8, t);
  return {
    svg: (
      <g>
        <Sea cam={c} t={t} mood="sunset" floor={1800} rocks schools={[{c: {x: 200, y: 900}, n: 22, r: 150, seed: 15, dir: 1}]}>
          <WhiteShark uid="s7" p={sh} />
        </Sea>
        <StatusCard k={win(t, 150.6, 162, 0.5)} />
      </g>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={win(t, 162.8, 168.4, 0.4)} text="LOS MORDISCOS A PERSONAS SON MUY POCO FRECUENTES" color="#ffe2b8" />
        <Tag k={win(t, 169.2, 172.4, 0.4)} text="CLAVE PARA EL EQUILIBRIO DEL OCÉANO" color="#ffe2b8" />
        <Wash k={end * 0.5} color="#120804" />
        {end > 0.01 && (
          <div style={{position: 'absolute', left: 40, right: 40, top: 560, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: end, transform: `scale(${(0.95 + 0.05 * end).toFixed(3)})`}}>
            <div style={{fontWeight: 900, fontSize: 96, lineHeight: 1.05, color: '#ffffff', letterSpacing: 2, textShadow: '0 0 30px rgba(60,20,0,0.6), 0 6px 18px rgba(0,0,0,0.9)'}}>EL TIBURÓN<br />BLANCO.</div>
            <div style={{marginTop: 40, fontWeight: 900, fontSize: 46, letterSpacing: 10, color: '#ffd23f', textShadow: '0 4px 14px rgba(0,0,0,0.9)'}}>MUNDO INSÓLITO.</div>
          </div>
        )}
      </>
    ),
  };
}
export const _k = {clamp, lerp, React};
