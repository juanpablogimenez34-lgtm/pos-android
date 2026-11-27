// ESCENA 1 (0–20)  EL UNICORNIO DEL OCÉANO: vista aérea del Ártico entre témpanos; un narval cerca de la superficie
//                  detecta un bacalao, gira la cabeza y lo golpea de lado con el colmillo, y lo captura; la cámara
//                  desciende bajo el agua y revela el cuerpo completo.
// ESCENA 2 (20–45) EL NACIMIENTO: nacimiento representado de forma educativa (la cría aparece junto a la madre,
//                  sin detalles gráficos); primera respiración; nado junto a la madre; con los años la piel pasa de
//                  gris azulado a moteado y, en el macho, el diente izquierdo empieza a crecer hacia delante.
import React from 'react';
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {cam, Cam, SceneOut, shot} from '../../../studio2';
import {Narwhal, narwhalPoint, NarwhalPose, tuskTip} from '../character/Narwhal';
import {Key, nswim, STRIKE_NAMES} from '../character/motion';
import {BigTitle, Brand, PhaseTag, Tag, Wash, win} from '../components/common';
import {AerialSea, CodTop} from '../environment/Aerial';
import {Blow, Bubbles, IceFloe, Sea} from '../../orca-reina-oceanos/environment/Sea';
import {aerialStrike} from './strike';

export const bc = (c: Cam, t: number, k = 1): Cam => ({...c, x: c.x + Math.sin(t * 0.37) * 6 * k, y: c.y + Math.sin(t * 0.29 + 1) * 5 * k, roll: c.roll + Math.sin(t * 0.21) * 0.003 * k});
/** Témpanos en la superficie (vista lateral). */
export const Floes: React.FC<{t: number; xs: number[]; w?: number}> = ({t, xs, w = 420}) => (
  <g>{xs.map((x, i) => <IceFloe key={i} x={x} w={w * (0.7 + ((i * 37) % 10) / 15)} t={t} seed={i * 7 + 2} tilt={Math.sin(t * 0.6 + i) * 0.02} />)}</g>
);
export const FLOES_TOP = [
  {x: -380, y: -900, r: 260, seed: 3}, {x: 820, y: -1250, r: 190, seed: 5}, {x: 1300, y: -300, r: 300, seed: 8}, {x: -600, y: 300, r: 220, seed: 11},
  {x: 1120, y: 620, r: 170, seed: 13}, {x: 200, y: 1150, r: 280, seed: 17}, {x: -200, y: -1700, r: 210, seed: 19}, {x: 1500, y: -1700, r: 240, seed: 23},
];

// ---------------------------------------------------------------- ESCENA 1
const ST1 = {t0: 0.8, slow: 1.15, fish0: {x: 620, y: -420}, heading: -Math.PI / 2 + 0.25, scale: 0.5};
const P1: Key[] = [[10, -1500, 620], [14, -500, 560], [18, 400, 520], [21, 1100, 520]];
export function scene1(t: number): SceneOut {
  const down = 11.3; // la cámara atraviesa la superficie
  if (t < down) {
    const A = aerialStrike(t, ST1);
    const mid = A.focus;
    // dron: plano general alto que desciende hacia la acción, con leve giro
    let c = shot(t, 0, 3.6, cam(mid.x + 150, mid.y + 300, 0.5, 0.06), cam(mid.x, mid.y + 40, 0.95, 0.02));
    if (t > 3.6) c = cam(mid.x, mid.y + 40, lerp(0.95, 1.3, smoothstep(3.6, 8, t)), 0.02 - 0.02 * smoothstep(3.6, 8, t));
    if (t > 9.8) c = {...c, zoom: lerp(c.zoom, 2.0, smoothstep(9.8, down, t))};
    const others = [0, 1, 2, 3].map((i) => ({x: A.F.x + 260 + i * 70 + Math.sin(t + i) * 20, y: A.F.y - 200 - i * 50 - t * 30, a: ST1.heading + 0.4}));
    return {
      svg: (
        <AerialSea cam={c} t={t} floes={FLOES_TOP} ripples={[{x: A.F.x, y: A.F.y, t0: A.C.contactT}]}>
          {others.map((f, i) => <CodTop key={i} x={f.x} y={f.y} a={f.a} t={t + i} s={1.2} />)}
          {A.svg}
        </AerialSea>
      ),
      overlay: (
        <>
          <Brand />
          <Tag k={win(t, 0.6, 3.8, 0.5)} text="ÁRTICO · VISTA AÉREA (RECONSTRUCCIÓN)" top={250} color="#e8fbff" />
          <PhaseTag i={A.C.P.i} k={win(t, 1.0, 10.7, 0.4)} names={STRIKE_NAMES} top={300} />
          <Wash k={smoothstep(10.4, down, t)} color="#d8f4ff" />
        </>
      ),
    };
  }
  const pose = nswim(P1, t, {kind: 'male', scale: 0.72, seed: 2, tusk: 0.56, maxPitch: 0.3});
  pose.eye = {x: 0.7, y: 0.1};
  const head = narwhalPoint(pose, 0.05, 0);
  const tip = tuskTip(pose);
  const mid = narwhalPoint(pose, 0.42, 0);
  const ht = {x: (head.x + tip.x) / 2, y: (head.y + tip.y) / 2};
  let c = shot(t, down, 13.4, cam(ht.x + 100, 100, 1.0), cam(ht.x, ht.y - 40, 1.0));
  if (t > 13.4) c = shot(t, 13.4, 15.6, cam(ht.x, ht.y - 40, 1.0), cam(head.x, head.y, 1.15));
  if (t > 15.6) c = shot(t, 15.6, 18, cam(head.x, head.y, 1.15), cam(mid.x + 120, mid.y - 120, 0.62));
  c = bc(c, t, 0.5);
  return {
    svg: (
      <Sea cam={c} t={t} mood="polar" ice floor={2100} rocks schools={[{c: {x: 700, y: 1100}, n: 22, r: 150, seed: 4, dir: -1}]} front={<Floes t={t} xs={[-1300, -500, 300, 1200, 1900]} />}>
        <Bubbles t={t} src={{x: c.x - 200, y: 120}} n={26} seed={3} k={1 - smoothstep(down, down + 1.5, t)} s={1.6} />
        <Narwhal pose={pose} uid="n1" />
      </Sea>
    ),
    overlay: (
      <>
        <Brand />
        <Wash k={1 - smoothstep(down, down + 0.6, t)} color="#d8f4ff" />
        <BigTitle k={win(t, 16.2, 19.7, 0.5)} lines={['MONODON MONOCEROS', 'EL NARVAL']} top={300} size={110} />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 2
const MOM: Key[] = [[19, -1000, 720], [25, -300, 560], [29.5, 60, 200], [33, 380, 420], [40, 1000, 560], [46, 1700, 600]];
const AUNT: Key[] = [[19, -1500, 1050], [30, -450, 980], [46, 1250, 1020]];
export function scene2(t: number): SceneOut {
  const mom = nswim(MOM, t, {kind: 'female', scale: 0.66, seed: 1, maxPitch: 0.45});
  const aunt = nswim(AUNT, t, {kind: 'female', scale: 0.64, seed: 2, extra: {tusk: 0}});
  const momBelly = narwhalPoint(mom, 0.5, -1.3);
  const momSide = narwhalPoint(mom, 0.36, -0.2);
  // la cría crece: gris azulado → oscuro → moteado; tamaño y, al final, el colmillo del macho
  const grow = smoothstep(31.2, 40.5, t);
  const age = grow;
  const tusk = smoothstep(37.2, 43.8, t) * 0.42;
  const born = smoothstep(21.8, 24.2, t);
  const sc = lerp(0.34, 0.6, grow);
  // posición: junto al vientre al nacer → junto al costado (nado en "escalón") → algo por delante al crecer
  let cx = lerp(momBelly.x - 40, momSide.x + 40, smoothstep(24.4, 26.4, t));
  let cy = lerp(momBelly.y + 60, momSide.y + 80, smoothstep(24.4, 26.4, t));
  const up = smoothstep(26.6, 29.2, t) * (1 - smoothstep(30.6, 32.4, t));
  cy = lerp(cy, -10, up);
  cx = lerp(cx, momSide.x + 120, up);
  cx += grow * 280;
  cy += grow * 150;
  const calfK: Key[] = [[t - 0.5, cx - 34, cy + 2], [t, cx, cy], [t + 0.5, cx + 34, cy - 2]];
  const calf: NarwhalPose = nswim(calfK, t, {kind: age < 0.55 ? 'calf' : 'male', scale: sc, seed: 4, under: up > 0.9 ? 0.3 : 1, age, tusk});
  calf.phase = t * lerp(5, 4, grow);
  calf.amp = 0.85;
  calf.angle = lerp(calf.angle, -0.22, up * (1 - smoothstep(29.2, 30, t))) + Math.sin(t * 1.3) * 0.04;
  calf.blow = win(t, 29.4, 30.8, 0.3);
  mom.blow = win(t, 29.8, 31.0, 0.3);
  const blowAt = narwhalPoint(calf, 0.1, 1);
  const momBlow = narwhalPoint(mom, 0.1, 1);
  mom.eye = {x: 0.6, y: 0.5};
  let c = shot(t, 20, 25, cam(-600, 760, 0.7), cam(momBelly.x + 40, 660, 0.95));
  if (t > 25) c = shot(t, 25, 29, cam(momBelly.x + 40, 660, 0.95), cam(cx, 120, 0.95));
  if (t > 31) c = shot(t, 31, 34.5, cam(cx, 120, 0.95), cam(cx - 120, cy + 40, 0.9));
  if (t > 34.5) c = cam(cx - 120 + (t - 34.5) * 8, cy + 40, 0.9);
  if (t > 37) c = shot(t, 37, 39.5, cam(cx - 92, cy + 40, 0.9), cam(cx - 110, cy - 20, 1.05));
  if (t > 39.5) c = cam(cx - 110, cy - 20, 1.05);
  c = bc(c, t, 0.5);
  return {
    svg: (
      <Sea cam={c} t={t} mood="polar" ice floor={1900} rocks schools={[{c: {x: 600, y: 1200}, n: 18, r: 140, seed: 7, dir: -1}]} front={<Floes t={t} xs={[-1200, -350, 700, 1500]} />}>
        <Narwhal pose={aunt} uid="a2" />
        <Narwhal pose={mom} uid="m2" />
        {born > 0.01 && (
          <g opacity={born}>
            {born < 1 && <circle cx={cx} cy={cy} r={160 * (1 - born) + 40} fill="#dff4ff" opacity={0.25 * (1 - born)} />}
            <Narwhal pose={calf} uid="c2" />
          </g>
        )}
        <Blow x={blowAt.x} y={blowAt.y} t={t} t0={29.6} s={0.5} />
        <Blow x={momBlow.x} y={momBlow.y} t={t} t0={30.0} s={0.75} />
      </Sea>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={win(t, 22, 25.8, 0.5)} text="NACIMIENTO · ILUSTRACIÓN EDUCATIVA" color="#bfeaff" />
        <Tag k={win(t, 27, 31.4, 0.5)} text="PRIMERA RESPIRACIÓN JUNTO A SU MADRE" color="#ffe2a0" />
        <Tag k={win(t, 31.8, 36.4, 0.5)} text="◷ PASAN LOS AÑOS · LA PIEL SE VUELVE MOTEADA" color="#bfeaff" />
        <Tag k={win(t, 37.4, 44.4, 0.5)} text="EN EL MACHO, UN DIENTE CRECE HACIA DELANTE" color="#ffe2a0" />
      </>
    ),
  };
}
export const _k = {clamp, React};
