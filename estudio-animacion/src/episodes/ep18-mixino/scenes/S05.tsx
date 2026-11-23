// ESCENA 5 (60–75 s) · EL DEPREDADOR: un pez patrulla sobre el fondo, detecta al mixino, gira, se
// lanza y lo muerde; en ese instante los poros liberan mucosidad que empieza a llenarle la boca.
// ESCENA 6 (75–90 s, misma acción, ver S06) usa las mismas trayectorias para la continuidad.
import React from 'react';
import {clamp, lerp} from '../../../engine/math';
import {breathe, cam, Cam, SceneOut, shot} from '../../../studio2';
import {Hagfish} from '../character/Hagfish';
import {FishPose, Predator, predMouth} from '../character/Predator';
import {SlimeBurst, SlimeCloud, SlimeDefs} from '../character/Slime';
import {seg, Vignette, Wash, win} from '../components/common';
import {EV} from '../data/timeline';
import {DeepBack, DeepFront, Rock} from '../environment/Deep';
import {crawl, pathOf, poresAt} from './rig';

export const PATH56 = pathOf([{x: -1300, y: 380}, {x: -900, y: 320}, {x: -500, y: 370}, {x: -150, y: 310}, {x: 200, y: 360}, {x: 550, y: 300}, {x: 900, y: 350}, {x: 1300, y: 300}, {x: 1800, y: 340}, {x: 2400, y: 300}]);
export const PS = 1.7;

/** Mixino: repta; mordido a los 71,4 s se retuerce; a los 83 s escapa. */
export function hag56(t: number) {
  const base = 1700 + (Math.min(t, EV.predBite) - 60) * 30;
  const held = t > EV.predBite && t < EV.hagEscape;
  const esc = Math.max(0, t - EV.hagEscape);
  const s = base + (held ? Math.sin((t - EV.predBite) * 5) * 14 : 0) + esc * 150 + esc * esc * 10;
  const amp = held ? 34 : t > EV.hagEscape ? 30 : 14;
  return crawl(PATH56, s, t, amp, 1.6, held ? 2.6 : t > EV.hagEscape ? 2.2 : 1.1);
}
const SP_BITE = hag56(EV.predBite);
export const BITE = SP_BITE[Math.round(0.36 * (SP_BITE.length - 1))];

/** Depredador: patrulla → gira → ataque → muerde → (escena 6) se atraganta, sacude y se aleja. */
export function pred56(t: number): FishPose {
  const atk = (ang: number) => {
    const m = predMouth({x: 0, y: 0, scale: PS, angle: ang, t, dir: 1});
    return {x: BITE.x - m.x, y: BITE.y - 10 - m.y};
  };
  const strike = atk(0.42);
  if (t < EV.predTurn) {
    const u = (t - 60) / (EV.predTurn - 60);
    return {x: lerp(-1300, -520, u), y: lerp(-380, -330, u) + Math.sin(t * 0.9) * 12, angle: 0.02, t, scale: PS, beat: 0.8, mouth: 0};
  }
  if (t < EV.predBite) {
    const u = seg(t, EV.predTurn, EV.predBite);
    const v = Math.pow(u, 2.2);
    return {x: lerp(-520, strike.x, v), y: lerp(-330, strike.y, v), angle: lerp(0.02, 0.42, seg(t, EV.predTurn, EV.predTurn + 2)), t, scale: PS, beat: 0.8 + 1.2 * u, mouth: seg(t, EV.predBite - 0.7, EV.predBite)};
  }
  if (t < EV.predShake) {
    // muerde y tironea; la mucosidad le llena la boca y las branquias
    return {x: strike.x + Math.sin(t * 7) * 10, y: strike.y + Math.cos(t * 6) * 6, angle: 0.42 + Math.sin(t * 7) * 0.05, t, scale: PS, beat: 1.4, mouth: 0.55 + 0.25 * Math.sin(t * 4), slimed: clamp((t - EV.predSlime) / 4), gill: 0.4 + 0.5 * Math.abs(Math.sin(t * 3)), shake: 0};
  }
  // suelta, sacude la cabeza, "tose" y se aleja hacia arriba a la izquierda
  const u = seg(t, EV.predShake + 1.2, 89.5);
  return {x: lerp(strike.x, strike.x - 900, u), y: lerp(strike.y, strike.y - 520, u), angle: lerp(0.42, -0.2, seg(t, EV.predShake, EV.predShake + 2)), t, scale: PS, beat: 1.8, mouth: 0.4 + 0.6 * Math.abs(Math.sin(t * 4.5)) * (1 - u * 0.6), slimed: 1 - 0.4 * u, gill: 0.7 + 0.3 * Math.sin(t * 7), shake: win(t, EV.predShake, EV.predShake + 4, 0.4)};
}

export const BURSTS56: SlimeBurst[] = [
  {t0: EV.predSlime, sources: poresAt(SP_BITE, [0.26, 0.34, 0.42, 0.5]), dir: -2.2, spread: 1.5, size: 300, seed: 21, drift: {x: -6, y: -6}, life: 14},
  {t0: EV.predSlime + 0.7, sources: poresAt(SP_BITE, [0.3, 0.46, 0.6]), dir: -1.5, spread: 2.0, size: 420, seed: 23, drift: {x: 4, y: -8}, life: 14},
];

export const World56: React.FC<{t: number; c: Cam}> = ({t, c}) => {
  const sp = hag56(t);
  const p = pred56(t);
  const m = predMouth(p);
  const pull = {x: m.x, y: m.y, k: 0.45 * seg(t, EV.predSlime, EV.predSlime + 1.5) * (1 - seg(t, EV.predShake + 1, EV.predShake + 4))};
  return (
    <DeepBack cam={c} t={t}>
      <SlimeDefs />
      <Rock x={-700} y={520} w={320} h={140} seed={31} c="#1a2a2a" />
      <Rock x={1100} y={240} w={260} h={120} seed={33} c="#182828" />
      <ellipse cx={p.x + 40} cy={Math.max(p.y + 300, 330)} rx={230} ry={34} fill="#000" opacity={0.15} />
      <Hagfish uid="h56" spine={sp} look={{t, shadow: 14, pores: win(t, EV.predSlime - 0.1, EV.predSlime + 2.5, 0.2), barbels: t > EV.predBite ? 1 : 0.5, slimeCoat: clamp((t - EV.predSlime) / 3)}} />
      {BURSTS56.map((b, i) => <SlimeCloud key={i} t={t} b={{...b, pull}} />)}
      <Predator uid="p56" p={p} />
    </DeepBack>
  );
};

export function scene05(t: number): SceneOut {
  const p = pred56(t);
  let c: Cam = cam(p.x + 300, -60, 1.0);
  if (t >= EV.predTurn) c = shot(t, EV.predTurn, EV.predBite, cam(pred56(EV.predTurn).x + 300, -60, 1.0), cam(BITE.x - 180, BITE.y - 160, 1.6), 'inOut');
  if (t >= EV.predBite) c = shot(t, EV.predBite, 75, cam(BITE.x - 180, BITE.y - 160, 1.6), cam(BITE.x - 220, BITE.y - 170, 1.9), 'out');
  const kick = win(t, EV.predBite - 0.05, EV.predBite + 0.35, 0.1) * 7;
  c = {...breathe(c, t, 0.3), x: c.x + Math.sin(t * 40) * kick};
  return {
    svg: <World56 t={t} c={c} />,
    overlay: (
      <>
        <DeepFront cam={c} t={t} />
        <Vignette />
        <Wash k={0.9 * (1 - seg(t, 60, 60.5))} color="#010708" />
      </>
    ),
  };
}
