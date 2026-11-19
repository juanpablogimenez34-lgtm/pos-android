// PRUEBA DE 20 s (fase 3): bosque de mañana con los primeros 20 s de la canción real.
// T1 el bosque despierta (pájaro canta, mariposa) · T2 Lobi se despierta tras un arbusto: se estira,
// bosteza, mueve las orejas, sonríe · T3 camina (contactos reales) y huele una flor · T4 corre
// (galope) con Mila y Toto saltando detrás · T5 salta el tronco caído (vista lateral) · T6 gira
// (perfil → frente → espalda → perfil) · T7 primer plano: ríe y mueve la cola · T8 primer paso
// del baile con Mila y Toto. Cada corte cae en un pulso medido.
import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {clamp, easeInOut, lerp} from '../../../engine/math';
import {ensureFonts} from '../../../engine/fonts';
import {useTime} from '../../../engine/useTime';
import {bHop, milaDance, totoDance} from '../Animations/bunnyStates';
import {advance, dance8, face, idle, jump, laugh, playBow, run, RUN, spin, walk, WALK, yawn} from '../Animations/lobiStates';
import {Cam, camAt, CamKey} from '../Camera/cam';
import {Bunny, bunnyPose, MILA, TOTO} from '../Characters/Bunny';
import {Lobi, lobiPose, LobiPose} from '../Characters/Lobi';
import {dayNight} from '../DayNight/dayNight';
import {Bird, Butterfly, ForestBack, ForestFront, ForestGround, LOG_X} from '../Forest/Forest';
import {beatsSince, snap} from '../MusicSync/songMap';
import {furCircle, V} from '../Rigging/core';

const S = {T1: 0, T2: snap(3.18), T3: snap(6.25), T4: snap(9.8), T5: snap(12.35), T6: snap(14.9), T7: snap(16.9), T8: snap(18.95), END: 20};
const RUN_END = LOG_X - 560;
const RUN_START = RUN_END - (advance(RUN) / RUN.period) * (S.T5 - S.T4);
const WALK_END = RUN_START;
const WALK_START = WALK_END - (advance(WALK) / WALK.period) * (S.T4 - S.T3);
const WAKE_X = WALK_START;
const JUMP_T = {a: S.T5 + 0.45, d: 1.1};
const JUMP_FROM = RUN_END + (advance(RUN) / RUN.period) * 0.45;
const JUMP_TO = JUMP_FROM + 560;
const SPIN_X = JUMP_TO + 170;

/** Bloque de bosque completo con los personajes dentro. */
const Stage: React.FC<{t: number; cam: Cam; children: React.ReactNode; front?: React.ReactNode; fg?: number}> = ({t, cam, children, front, fg = 1}) => {
  const dn = dayNight(0.12 + t * 0.006);
  return (
    <g>
      <ForestBack cam={cam} dn={dn} t={t} />
      <ForestGround cam={cam} dn={dn} t={t}>
        <g transform={`translate(${WAKE_X - 90} 0)`}>
          {[[-60, -50, 70], [30, -80, 90], [110, -50, 64]].map(([cx, cy, r], i) => (
            <path key={i} d={furCircle(V(cx, cy), r, 20, 0.08, i)} fill={['#3f9a52', '#55b45e', '#2f7d48'][i]} />
          ))}
        </g>
        {children}
        {front}
      </ForestGround>
      <ForestFront cam={cam} dn={dn} t={t} fg={fg} />
    </g>
  );
};

/** Pose de Lobi en cada instante de la prueba (continuidad de posición entre planos). */
function lobiAt(t: number): LobiPose {
  const base = {t, y: 40, scale: 1};
  if (t < S.T2) return lobiPose({...base, x: WAKE_X, opacity: 0});
  if (t < S.T3) {
    const lt = t - S.T2;
    // se despierta: sale del arbusto, se estira (postura juguetona), bosteza, orejas, sonríe
    const out = easeInOut(clamp(lt / 0.8));
    let st = idle(t, {mode: lt < 0.6 ? 'half' : 'normal', smile: 0.8});
    if (lt > 0.7 && lt < 1.5) st = {...st, ...playBow(t, Math.sin(((lt - 0.7) / 0.8) * Math.PI))};
    if (lt >= 1.5 && lt < 2.4) st = {...st, ...yawn(t, (lt - 1.5) / 0.9)};
    if (lt >= 2.4) st = {...idle(t, {smile: 1, cheeks: 0.8, sparkle: 0.5}), ears: {near: {a: -0.2 + 0.25 * Math.sin(t * 9), fold: 0}, far: {a: -0.15 + 0.25 * Math.sin(t * 9 + 1), fold: 0}}};
    return lobiPose({...base, ...st, x: WAKE_X - 120 * (1 - out)});
  }
  if (t < S.T4) {
    const cyc = (t - S.T3) / WALK.period;
    const st = walk(t, cyc);
    const sniff = clamp(1 - Math.abs(t - (S.T3 + 2.3)) / 0.5);
    return lobiPose({...base, ...st, x: WALK_START + cyc * advance(WALK), head: {pitch: (st.head?.pitch ?? 0) + 0.45 * sniff, tilt: 0, turn: 0.1}, face: face(t, sniff > 0.3 ? {mode: 'closed', smile: 0.9} : {smile: 0.9})});
  }
  if (t < JUMP_T.a) {
    const cyc = (t - S.T4) / RUN.period;
    return lobiPose({...base, ...run(t, cyc), x: RUN_START + cyc * advance(RUN)});
  }
  if (t < JUMP_T.a + JUMP_T.d) {
    const u = (t - JUMP_T.a) / JUMP_T.d;
    const st = jump(t, u, 150);
    return lobiPose({...base, ...st, x: lerp(JUMP_FROM, JUMP_TO, st.travel)});
  }
  if (t < S.T6) {
    // recupera y avanza al paso hasta el punto del giro
    const lt = t - (JUMP_T.a + JUMP_T.d);
    const cyc = lt / WALK.period;
    const x = Math.min(SPIN_X, JUMP_TO + cyc * advance(WALK) * 1.2);
    return lobiPose({...base, ...(x < SPIN_X ? walk(t, cyc) : idle(t, {smile: 1})), x});
  }
  if (t < S.T7) return lobiPose({...base, ...spin(t, clamp((t - S.T6 - 0.2) / 1.4)), x: SPIN_X});
  if (t < S.T8) return lobiPose({...base, ...laugh(t, 1), yaw: Math.PI / 2, x: SPIN_X});
  return lobiPose({...base, ...dance8(t, beatsSince(S.T8, t)), x: SPIN_X});
}

export const LobitoPrueba: React.FC<{withAudio?: boolean}> = ({withAudio = true}) => {
  ensureFonts();
  const t = useTime();
  const L = lobiAt(t);
  const shot = t < S.T2 ? 1 : t < S.T3 ? 2 : t < S.T4 ? 3 : t < S.T5 ? 4 : t < S.T6 ? 5 : t < S.T7 ? 6 : t < S.T8 ? 7 : 8;
  let cam: Cam;
  let extra: React.ReactNode = null;
  let bunnies: React.ReactNode = null;
  const lt = (a: number) => t - a;
  switch (shot) {
    case 1: {
      // travelling entre los árboles hasta el arbusto; pájaro en primer término
      const keys: CamKey[] = [[0, WAKE_X - 760, -560, 1.35], [1.6, WAKE_X - 470, -380, 2.2], [S.T2, WAKE_X - 160, -230, 2.6]];
      cam = camAt(keys, t);
      const dn = dayNight(0.12);
      extra = (
        <g>
          <Bird x={WAKE_X - 520} y={-330} s={1.6} t={t} seed={1} fly={0} sing={1} dn={dn} />
          <Bird x={WAKE_X - 360} y={-330} s={1.3} t={t} seed={3} fly={t > 1.8 ? 1 : 0} sing={0.5} c="#ffb03a" facing={-1} dn={dn} />
          <rect x={WAKE_X - 700} y={-336} width={520} height={14} rx={7} fill="#7a5234" />
          <Butterfly x={lerp(WAKE_X - 900, WAKE_X - 100, t / 3.2)} y={-420 + Math.sin(t * 3) * 60} s={2.6} t={t} seed={2} />
        </g>
      );
      break;
    }
    case 2:
      cam = {x: WAKE_X - 10, y: -150, zoom: 3.2 + lt(S.T2) * 0.08, roll: 0};
      break;
    case 3:
      cam = {x: L.x + 40, y: -130, zoom: 3.1, roll: 0};
      break;
    case 4: {
      cam = {x: L.x - 70, y: -150, zoom: 2.2, roll: 0};
      const mp = (lt(S.T4) * 2.2) % 1;
      const tp = (lt(S.T4) * 2.9) % 1;
      bunnies = (
        <>
          <Bunny uid="pm" L={MILA} p={bunnyPose({t, x: L.x - 300, y: 30, scale: 0.95, ...bHop(t, mp, 60, 4)})} />
          <Bunny uid="pt" L={TOTO} p={bunnyPose({t, x: L.x - 460, y: 50, scale: 0.85, ...bHop(t, tp, 42, 7)})} />
        </>
      );
      break;
    }
    case 5:
      cam = {x: lerp(JUMP_FROM - 60, JUMP_TO - 40, easeInOut(clamp(lt(S.T5) / 2.2))), y: -170, zoom: 2.05, roll: 0};
      break;
    case 6:
      cam = {x: SPIN_X + 20, y: -130, zoom: 3.4, roll: 0};
      break;
    case 7:
      cam = {x: SPIN_X, y: -160, zoom: 3.7 + lt(S.T7) * 0.25, roll: 0};
      break;
    default: {
      cam = {x: SPIN_X + 200, y: -170, zoom: 1.6, roll: 0};
      const b = beatsSince(S.T8, t);
      bunnies = (
        <>
          <Bunny uid="dm" L={MILA} p={bunnyPose({t, ...milaDance(t, b), x: SPIN_X + 380 + (milaDance(t, b).dx ?? 0), y: 10, scale: 0.95, facing: -1})} />
          <Bunny uid="dt" L={TOTO} p={bunnyPose({t, ...totoDance(t, b), x: SPIN_X + 500 + (totoDance(t, b).dx ?? 0), y: 70, scale: 0.85, facing: -1})} />
        </>
      );
      break;
    }
  }
  return (
    <AbsoluteFill style={{background: '#8fd0ff'}}>
      <svg width={1080} height={1920}>
        <Stage t={t} cam={cam} fg={shot === 7 ? 0 : 1}>
          {bunnies}
          <Lobi uid="lb" p={{...L, x: L.x + ((L as LobiPose & {dx?: number}).dx ?? 0)}} />
          {extra}
        </Stage>
      </svg>
      {withAudio && <Audio src={staticFile('music/el_baile_del_lobito.mp3')} />}
    </AbsoluteFill>
  );
};
