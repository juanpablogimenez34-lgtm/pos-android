// ESCENA 1 (0–20)  LA REINA DEL OCÉANO: amanecer sobre el mar; la cámara se sumerge; entre los rayos de luz
//                  aparece la aleta dorsal, luego la cabeza y el cuerpo entero; la orca acelera hacia la superficie
//                  y salta (cámara lenta: ruptura, flexión en el aire, salpicaduras y gotas suspendidas).
// ESCENA 2 (20–45) EL NACIMIENTO: grupo familiar; nacimiento representado de forma educativa (la cría aparece junto a
//                  su madre, sin detalles gráficos); la cría sube a respirar acompañada; nada pegada a la madre;
//                  paso del tiempo hasta la etapa juvenil.
import React from 'react';
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {cam, Cam, SceneOut, shot} from '../../../studio2';
import {Orca, orcaPoint, OrcaPose} from '../character/Orca';
import {breach, Key, swim} from '../character/motion';
import {BigTitle, Brand, Tag, win} from '../components/common';
import {Blow, Bubbles, Sea, Splash} from '../environment/Sea';

const bc = (c: Cam, t: number, k = 1): Cam => ({...c, x: c.x + Math.sin(t * 0.37) * 6 * k, y: c.y + Math.sin(t * 0.29 + 1) * 5 * k, roll: c.roll + Math.sin(t * 0.21) * 0.003 * k});

// ---------------------------------------------------------------- ESCENA 1
const P1: Key[] = [[0, -1400, 980], [4, -700, 960], [8, 60, 920], [11.4, 600, 900], [12, 700, 900]];
const BR1 = 12.0;
export function scene1(t: number): SceneOut {
  const S = 0.9;
  let pose: OrcaPose;
  const b = breach(t, BR1, 1250, {scale: S, kind: 'male', slow: 2.2});
  if (t < BR1) pose = swim(P1, t, {kind: 'male', scale: S, seed: 0});
  else {
    const p0 = swim(P1, BR1, {kind: 'male', scale: S, seed: 0});
    pose = {...p0, x: b.x, y: b.y, angle: b.angle, facing: b.facing as 1 | -1, amp: b.amp, arch: b.arch, phase: p0.phase + (t - BR1) * (b.air ? 0.6 : 6), under: b.air ? 0 : 1, flipN: b.air ? -0.5 : 0.1, flipF: b.air ? -0.4 : 0.2};
  }
  pose.t = t;
  const dorsal = orcaPoint(pose, 0.44, 1.6);
  const head = orcaPoint(pose, 0.12, 0);
  const mid = orcaPoint(pose, 0.45, 0);
  // cámara: superficie al amanecer → inmersión → aleta dorsal → cabeza → cuerpo → salto
  let c: Cam;
  if (t < 4.6) c = shot(t, 0, 4.6, cam(0, -380, 0.75), cam(-300, 700, 0.8));
  else if (t < 7.2) c = shot(t, 4.6, 6.6, cam(-300, 700, 0.8), cam(dorsal.x, dorsal.y + 40, 1.35));
  else if (t < 9.4) c = shot(t, 7.2, 9.2, cam(dorsal.x, dorsal.y + 40, 1.35), cam(head.x, head.y, 1.5));
  else if (t < 12.6) c = shot(t, 9.4, 11.6, cam(head.x, head.y, 1.5), cam(mid.x, mid.y, 0.72));
  else c = shot(t, 12.6, 14.2, cam(mid.x, mid.y, 0.72), cam(1500, -60, 0.52));
  if (t > 14.2) c = cam(lerp(1500, 1650, smoothstep(14.2, 19, t)), -60, 0.52);
  c = bc(c, t, 0.5);
  const tail = orcaPoint(pose, 0.98, 0);
  const slow = win(t, b.tExit - 0.2, b.tEntry + 0.6, 0.3);
  return {
    svg: (
      <Sea cam={c} t={t} mood="dawn" coast floor={2300} rocks kelp schools={[{c: {x: 300, y: 1500}, n: 26, r: 160, seed: 3, dir: 1}]}
        front={<g><Splash x={1250} t={t} t0={b.tExit} size={1.2} slow={1.6} /><Splash x={b.xEntry} t={t} t0={b.tEntry} size={1.5} slow={1.6} /></g>}>
        {(pose.under ?? 1) > 0.5 && <Bubbles t={t} src={tail} n={12} seed={2} k={smoothstep(10.5, 12.5, t) * (1 - smoothstep(14.2, 14.6, t))} />}
        <Orca pose={pose} uid="o1" />
      </Sea>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={slow} text="◉ CÁMARA LENTA" top={250} color="#ffc890" />
        <BigTitle k={win(t, 15.4, 19.7, 0.5)} lines={['ORCINUS ORCA', 'LA ORCA']} top={310} size={110} />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 2
const MOM: Key[] = [[19, -900, 760], [26, -200, 640], [31, 60, 300], [35, 400, 560], [41, 900, 640], [46, 1500, 660]];
const AUNT: Key[] = [[19, -1300, 1050], [30, -350, 980], [46, 1150, 1000]];
const BULL: Key[] = [[19, -1700, 1300], [32, -500, 1260], [46, 900, 1250]];
export function scene2(t: number): SceneOut {
  const mom = swim(MOM, t, {kind: 'female', scale: 0.72, seed: 1, maxPitch: 0.5});
  const aunt = swim(AUNT, t, {kind: 'female', scale: 0.68, seed: 2});
  const bull = swim(BULL, t, {kind: 'male', scale: 0.78, seed: 3});
  // la cría: aparece junto a la madre (nacimiento educativo), sube a respirar y luego nada a su lado
  const momBelly = orcaPoint(mom, 0.55, -1.3);
  const grow = smoothstep(39.5, 44.5, t);
  const calfScale = lerp(0.3, 0.46, grow);
  const born = smoothstep(22.2, 24.4, t);
  let cx = momBelly.x - 30;
  let cy = momBelly.y + 70;
  // subida a la superficie (26,8–31) junto a la madre
  const up = smoothstep(26.6, 29.6, t) * (1 - smoothstep(31.4, 33.6, t));
  cy = lerp(cy, -12, up);
  cx = lerp(cx, momBelly.x + 60, up);
  const calfKeys: Key[] = [[t - 0.5, cx - 30, cy + 4], [t, cx, cy], [t + 0.5, cx + 30, cy - 2]];
  const calf = swim(calfKeys, t, {kind: 'calf', scale: calfScale, seed: 4, under: up > 0.9 ? 0.3 : 1, extra: {age: grow}});
  calf.phase = t * 4.4;
  calf.amp = 0.8;
  calf.angle = lerp(calf.angle, -0.25, up * (1 - smoothstep(29.6, 30.4, t))) + Math.sin(t * 1.3) * 0.04;
  calf.blow = win(t, 29.8, 31.2, 0.3);
  const blowAt = orcaPoint(calf, 0.13, 1);
  mom.eye = {x: -0.6, y: 0.6};
  const c = bc(t < 26 ? shot(t, 20, 26, cam(-500, 780, 0.75), cam(momBelly.x, 720, 1.0)) : t < 33 ? shot(t, 26, 29.6, cam(momBelly.x, 720, 1.0), cam(cx, 160, 0.9)) : shot(t, 33, 38, cam(cx, 160, 0.9), cam(mom.x - 300, 680, 0.85)), t, 0.5);
  return {
    svg: (
      <Sea cam={c} t={t} mood="day" floor={1900} kelp rocks schools={[{c: {x: 600, y: 1300}, n: 20, r: 140, seed: 7, dir: -1}]}>
        <Orca pose={bull} uid="b2" />
        <Orca pose={aunt} uid="a2" />
        <Orca pose={mom} uid="m2" />
        {born > 0.01 && (
          <g opacity={born}>
            {born < 1 && <circle cx={cx} cy={cy} r={160 * (1 - born) + 40} fill="#dff4ff" opacity={0.25 * (1 - born)} />}
            <Orca pose={calf} uid="c2" />
          </g>
        )}
        <Blow x={blowAt.x} y={blowAt.y} t={t} t0={30.0} s={0.6} />
      </Sea>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={win(t, 22.4, 26.4, 0.5)} text="NACIMIENTO · ILUSTRACIÓN EDUCATIVA" color="#bfeaff" />
        <Tag k={win(t, 27.6, 32.6, 0.5)} text="PRIMERA RESPIRACIÓN EN LA SUPERFICIE" color="#ffe2a0" />
        <Tag k={win(t, 34, 38.6, 0.5)} text="NADA PEGADA A SU MADRE" color="#bfeaff" />
        <Tag k={win(t, 40, 44.6, 0.5)} text="◷ PASAN LOS MESES" color="#ffe2a0" />
      </>
    ),
  };
}
export const _k = {clamp, React};
