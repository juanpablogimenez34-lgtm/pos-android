// ESCENA 5 (95–121)  BAJO EL HIELO: seguimiento lateral bajo una gran plataforma de hielo; descenso con la luz
//                    disminuyendo; bacalaos, fletán negro y calamar; ecolocalización (VISUALIZACIÓN: el sonido no es
//                    visible); captura por succión de un calamar; vías respiratorias (espiráculo → tráquea → pulmones,
//                    SIN branquias); ascenso hasta el agua abierta para respirar. No se indican profundidades.
// ESCENA 6 (121–150) LA VIDA ENTRE EL HIELO: grupo bajo el hielo; suben a respirar por una abertura; una orca pasa a
//                    distancia (sin ataque) y los narvales se alejan hacia el agua cubierta de hielo; vista aérea del
//                    hielo marino que cambia.
// ESCENA 7 (150–180) LA FAMILIA DEL ÁRTICO: grupo al atardecer; cría junto a su madre; dos machos cruzan los colmillos
//                    en una interacción social; un adulto sube a respirar; vista aérea y se pierde entre el agua turquesa
//                    y los témpanos; primer plano final del colmillo al sol; cierre.
import React from 'react';
import {clamp, lerp, smoothPath, smoothstep} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {ClickFlash, ClickWaves} from '../../ep23-cachalote/environment/Ocean';
import {Orca} from '../../orca-reina-oceanos/character/Orca';
import {swim} from '../../orca-reina-oceanos/character/motion';
import {Blow, Bubbles, MOOD, Sea} from '../../orca-reina-oceanos/environment/Sea';
import {Narwhal, narwhalPoint, NarwhalPose, tuskTip} from '../character/Narwhal';
import {Key, nswim} from '../character/motion';
import {Brand, Tag, Wash, win} from '../components/common';
import {AerialSea, NarwhalTop} from '../environment/Aerial';
import {Cod, Halibut, Squid} from '../environment/Critters';
import {IceShelf, Seabed} from '../environment/Ice';
import {bc, Floes, FLOES_TOP} from './S1_2';


/** Vías respiratorias dibujadas sobre el cuerpo (se deforman con él). */
const Airway: React.FC<{P: NarwhalPose; k: number}> = ({P, k}) => {
  if (k <= 0.01) return null;
  const pt = (u: number, v: number) => narwhalPoint(P, u, v);
  const w = 7 * P.scale + 2;
  const tube = smoothPath([pt(0.1, 1), pt(0.11, 0.6), pt(0.14, 0.25), pt(0.2, 0.08), pt(0.25, 0.12)]);
  const lungTop: {x: number; y: number}[] = [];
  const lungBot: {x: number; y: number}[] = [];
  for (let i = 0; i <= 8; i++) {
    const u = 0.23 + i * 0.026;
    const h = Math.sin((i / 8) * Math.PI);
    lungTop.push(pt(u, 0.2 + 0.42 * h));
    lungBot.push(pt(u, 0.18 - 0.3 * h));
  }
  const lung = smoothPath([...lungTop, ...lungBot.reverse()], true);
  const bh = pt(0.1, 1);
  return (
    <g opacity={k}>
      <path d={lung} fill="#ff9aa8" opacity={0.75} stroke="#fff0f2" strokeWidth={3} />
      <path d={tube} stroke="#ffffff" strokeWidth={w + 6} fill="none" opacity={0.6} strokeLinecap="round" />
      <path d={tube} stroke="#ff6a80" strokeWidth={w} fill="none" strokeLinecap="round" />
      <circle cx={bh.x} cy={bh.y} r={w * 1.4} fill="#ffd23f" />
    </g>
  );
};

// La carcasa del mar (episodio de la orca) cubre ~2.400 px bajo la superficie; en tomas muy profundas se completa
// aquí la parte inferior con el mismo color y el mismo velo, sin tocar el componente original.
const DeepFill: React.FC<{c: Cam; depthDark: number}> = ({c, depthDark}) => {
  const sy = toScreen(c, c.x, 0).y;
  const camDepth = clamp((c.y - 400) / 2600) * depthDark;
  const y0 = sy + 2360;
  const dark = 0.3 * clamp((c.y - 1100) / 1900);
  return (
    <g>
      {y0 < 1920 && <rect x={-40} y={y0 - 1} width={1160} height={1960 - y0} fill={MOOD.polar.tint} opacity={0.32 + camDepth * 0.25} />}
      {dark > 0.01 && <rect x={-40} y={-40} width={1160} height={2000} fill="#020a12" opacity={dark} />}
    </g>
  );
};

// ---------------------------------------------------------------- ESCENA 5
const P5: Key[] = [[94, -1300, 230], [98.5, -200, 300], [102, 400, 1300], [105.5, 800, 2700], [108.5, 1150, 3150], [111.5, 1450, 3050], [115, 1750, 2000], [118.5, 2050, 700], [121.5, 2250, 120]];
const SQUID0 = {x: 1330, y: 3150};
const FLOOR5 = 3700;
export function scene5(t: number): SceneOut {
  const pose = nswim(P5, t, {kind: 'male', scale: 0.78, seed: 5, tusk: 0.55, maxPitch: 0.75});
  const suck = smoothstep(108.9, 109.7, t);
  pose.jaw = win(t, 108.6, 110.1, 0.35);
  pose.eye = {x: 0.7, y: 0.3};
  if (t > 120.6) pose.blow = win(t, 120.6, 121.6, 0.2);
  const mid = narwhalPoint(pose, 0.38, 0);
  const head = narwhalPoint(pose, 0.05, 0);
  const melon = narwhalPoint(pose, 0.04, 0.55);
  const mouth = narwhalPoint(pose, 0.012, -0.32);
  const sq = {x: lerp(SQUID0.x + Math.sin(t * 0.7) * 30, mouth.x, suck), y: lerp(SQUID0.y, mouth.y, suck)};
  let c = shot(t, 95, 98.6, cam(mid.x - 150, 420, 0.7), cam(mid.x, 480, 0.75));
  if (t > 98.6) c = cam(mid.x + 80, lerp(480, mid.y, smoothstep(98.6, 103, t)), lerp(0.75, 0.68, smoothstep(98.6, 103, t)));
  if (t > 104) c = shot(t, 104, 106, cam(mid.x + 80, mid.y, 0.68), cam((head.x + SQUID0.x) / 2, (head.y + SQUID0.y) / 2, 0.85));
  if (t > 106) c = cam((head.x * 0.6 + SQUID0.x * 0.4), (head.y + SQUID0.y) / 2, 0.85);
  if (t > 110.2) c = shot(t, 110.2, 111.6, cam(head.x * 0.6 + SQUID0.x * 0.4, (head.y + SQUID0.y) / 2, 0.85), cam(mid.x, mid.y, 0.95));
  if (t > 111.6) c = cam(mid.x, mid.y, 0.95);
  if (t > 116) c = shot(t, 116, 119, cam(mid.x, mid.y, 0.95), cam(head.x - 150, Math.max(260, head.y), 0.8));
  if (t > 119) c = cam(head.x - 150, Math.max(260, head.y), 0.8);
  c = bc(c, t, 0.4);
  const clicks = Array.from({length: 16}, (_, i) => 104.9 + i * 0.32);
  const dirA = Math.atan2(SQUID0.y - melon.y, SQUID0.x - melon.x);
  const echo = win(t, 104.6, 110.2, 0.4);
  const tail = narwhalPoint(pose, 0.97, 0);
  return {
    svg: (
      <g>
      <rect width={1080} height={1920} fill={MOOD.polar.sea2} />
      <Sea cam={c} t={t} mood="polar" depthDark={1.3} schools={[{c: {x: -400, y: 1100}, n: 16, r: 140, seed: 21, dir: 1}, {c: {x: 900, y: 2500}, n: 18, r: 150, seed: 23, dir: -1}]}
        front={<g><IceShelf t={t} x0={-3000} x1={1500} seed={3} thick={1.3} /><Floes t={t} xs={[2400, 3200]} /></g>}>
        <Seabed x={c.x} y={FLOOR5} />
        <Halibut x={700 + (t - 95) * 14} y={FLOOR5 - 110} t={t} s={1.3} />
        <Halibut x={1700 - (t - 95) * 10} y={FLOOR5 - 60} t={t + 1} s={1.1} dir={-1} />
        {[0, 1, 2].map((i) => <Cod key={i} x={1500 + i * 80 - (t - 95) * 18} y={2900 + i * 50} t={t + i} s={0.9} dir={-1} />)}
        <Squid x={1600 + Math.sin(t * 0.5) * 40} y={3350} t={t + 2} s={0.9} dir={-1} />
        {suck < 0.98 && <Squid x={sq.x} y={sq.y} t={t} s={1.1 * (1 - suck * 0.7)} dir={-1} op={1 - suck * 0.6} />}
        <Bubbles t={t} src={tail} n={10} seed={8} k={0.7} />
        <Narwhal pose={pose} uid="n5" />
        <ClickWaves t={t} origin={melon} dir={dirA} clicks={clicks} speed={1100} maxR={900} targets={[SQUID0]} spread={0.4} k={echo} />
        <ClickFlash t={t} origin={melon} clicks={clicks} k={echo} />
        <Airway P={pose} k={win(t, 110.6, 116.2, 0.5)} />
        <Blow x={narwhalPoint(pose, 0.1, 1).x} y={-4} t={t} t0={120.7} s={0.8} />
      </Sea>
      <DeepFill c={c} depthDark={1.3} />
      </g>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={win(t, 95.6, 99, 0.4)} text="BAJO UNA PLATAFORMA DE HIELO" color="#bfeaff" />
        <Tag k={win(t, 99.4, 104, 0.4)} text="DESCIENDE · LA LUZ DESAPARECE" color="#bfeaff" />
        <Tag k={echo} text="ECOLOCALIZACIÓN · VISUALIZACIÓN CIENTÍFICA" color="#9ff0ff" />
        <Tag k={echo} text="(EL SONIDO NO ES VISIBLE)" top={376} color="#9ff0ff" />
        <Tag k={win(t, 110.6, 116.2, 0.4)} text="RESPIRA AIRE · NO TIENE BRANQUIAS" color="#ffd0d8" />
        <Tag k={win(t, 111.2, 116.2, 0.4)} text="ESPIRÁCULO → TRÁQUEA → PULMONES" top={376} color="#ffe2a0" />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 6
const GAP = {a: -250, b: 350};
const GROUP: {dx: number; dy: number; kind: NarwhalPose['kind']; s: number; tusk: number}[] = [
  {dx: 0, dy: 0, kind: 'male', s: 0.62, tusk: 0.55}, {dx: -260, dy: 150, kind: 'female', s: 0.58, tusk: 0}, {dx: -470, dy: -40, kind: 'male', s: 0.6, tusk: 0.48}, {dx: -380, dy: 260, kind: 'calf', s: 0.32, tusk: 0},
];
const LEAD6: Key[] = [[120, -1500, 520], [124, -500, 420], [127, 0, 40], [129.4, 260, 30], [131.5, 650, 210], [134, 1350, 260], [137.5, 2300, 240]];
export function scene6(t: number): SceneOut {
  if (t < 137.6) {
    const members = GROUP.map((m, i) => {
      const k: Key[] = LEAD6.map(([tt, x, y]) => [tt + i * 0.25, x + m.dx * (y < 100 ? 0.45 : 1), Math.max(y < 100 ? 10 + i * 6 : 120, y + m.dy * (y < 100 ? 0.1 : 1))]);
      const p = nswim(k, t, {kind: m.kind, scale: m.s, seed: 30 + i, tusk: m.tusk, maxPitch: 0.3, age: m.kind === 'calf' ? 0.1 : 1});
      const atSurf = win(t, 127 + i * 0.25, 129.8 + i * 0.25, 0.4);
      p.under = 1 - atSurf * 0.6;
      p.blow = win(t, 127.6 + i * 0.4, 128.6 + i * 0.4, 0.2);
      return p;
    });
    const orca = swim([[128, -2000, 780], [138, -1100, 840]], t, {kind: 'male', scale: 0.62, seed: 4});
    const lead = members[0];
    const fp = {x: members.reduce((a, m) => a + m.x, 0) / 4 - 150, y: members.reduce((a, m) => a + m.y, 0) / 4};
    let c = cam(fp.x, Math.max(180, fp.y + 80), 0.62);
    if (t > 125 && t < 130.5) c = shot(t, 125, 127, cam(fp.x, Math.max(180, fp.y + 80), 0.62), cam(GAP.a + 200, 120, 0.85));
    if (t >= 130.5) c = shot(t, 130.5, 132.5, cam(GAP.a + 200, 120, 0.85), cam(lerp(fp.x, orca.x, 0.4), 520, 0.5));
    c = bc(c, t, 0.4);
    const retreat = smoothstep(131, 133, t);
    return {
      svg: (
        <Sea cam={c} t={t} mood="polar" floor={2300} rocks schools={[{c: {x: 400, y: 1400}, n: 18, r: 140, seed: 31, dir: -1}]}
          front={<g><IceShelf t={t} x0={-3200} x1={GAP.a} seed={5} /><IceShelf t={t + 3} x0={GAP.b} x1={3400} seed={7} /></g>}>
          {t > 128 && <g opacity={0.55 * smoothstep(128.5, 130.5, t)}><Orca pose={orca} uid="o6" /></g>}
          {members.map((m, i) => <Narwhal key={i} pose={m} uid={`g6${i}`} />)}
          {members.map((m, i) => <Blow key={`b${i}`} x={narwhalPoint(m, 0.1, 1).x} y={-4} t={t} t0={127.7 + i * 0.4} s={0.6} />)}
          <Bubbles t={t} src={narwhalPoint(lead, 0.97, 0)} n={8} seed={9} k={retreat} />
        </Sea>
      ),
      overlay: (
        <>
          <Brand />
          <Tag k={win(t, 125.2, 130.2, 0.4)} text="ABERTURA EN EL HIELO · SUBEN A RESPIRAR" color="#ffe2a0" />
          <Tag k={win(t, 130.8, 136.6, 0.4)} text="UNA ORCA A DISTANCIA" color="#ffc8b0" />
          <Tag k={win(t, 131.6, 136.6, 0.4)} text="SE REFUGIAN CERCA DEL HIELO" top={376} color="#bfeaff" />
        </>
      ),
    };
  }
  // vista aérea: el hielo marino cambia (los témpanos se reducen y se separan)
  const shrink = smoothstep(138.5, 148, t);
  const floes = FLOES_TOP.concat([{x: 400, y: -500, r: 320, seed: 29}, {x: -100, y: 600, r: 260, seed: 31}]).map((f, i) => ({...f, r: f.r * lerp(1.35, 0.7 + (i % 3) * 0.08, shrink), x: f.x * lerp(0.85, 1.1, shrink), y: f.y * lerp(0.85, 1.1, shrink)}));
  const pods = [0, 1, 2, 3].map((i) => ({x: 300 + i * 120 - (t - 137.6) * 40 + Math.sin(i) * 60, y: 200 + i * 130 + (t - 137.6) * 22, heading: Math.PI * 0.82, scale: i === 3 ? 0.22 : 0.38, phase: t * 4 + i, amp: 0.9, tusk: i === 0 || i === 2 ? 0.55 : 0, depth: 0.25, age: i === 3 ? 0.1 : 1}));
  const c = cam(lerp(300, 0, smoothstep(137.6, 150, t)), lerp(300, 500, smoothstep(137.6, 150, t)), lerp(0.62, 0.42, smoothstep(137.6, 150, t)), 0.04);
  return {
    svg: (
      <AerialSea cam={c} t={t} floes={floes}>
        {pods.map((p, i) => <NarwhalTop key={i} uid={`p6${i}`} p={p} />)}
      </AerialSea>
    ),
    overlay: (
      <>
        <Brand />
        <Wash k={1 - smoothstep(137.6, 138.3, t)} color="#d8f4ff" />
        <Tag k={win(t, 138.4, 142.4, 0.4)} text="EL HIELO MARINO ESTÁ CAMBIANDO" color="#ffffff" />
        <Tag k={win(t, 143, 149.4, 0.4)} text="ESTUDIARLOS AYUDA A ENTENDER EL ÁRTICO" color="#ffffff" />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 7
const MOM7: Key[] = [[149, -1300, 640], [157, 100, 600], [165, 1300, 620]];
export function scene7(t: number): SceneOut {
  if (t < 167.8) {
    const mom = nswim(MOM7, t, {kind: 'female', scale: 0.6, seed: 40, extra: {rim: '#ffcf9a', rimK: 0.7}});
    const calfK: Key[] = MOM7.map(([tt, x, y]) => [tt, x + 60, y + 110]);
    const calf = nswim(calfK, t, {kind: 'calf', scale: 0.3, seed: 41, age: 0.1, extra: {rim: '#ffcf9a', rimK: 0.7}});
    calf.phase = t * 5;
    const others = [0, 1].map((i) => nswim(MOM7.map(([tt, x, y]) => [tt, x - 500 - i * 300, y - 180 + i * 360] as Key), t, {kind: 'female', scale: 0.56, seed: 44 + i, extra: {rim: '#ffcf9a', rimK: 0.6}}));
    // dos machos cruzan los colmillos (interacción social) junto a la superficie
    const soc = smoothstep(156.4, 158.4, t);
    const rub = Math.sin(t * 1.6) * 0.035;
    const mA: NarwhalPose = {x: 1950 - 30 * soc, y: 210, angle: -0.42 + rub, scale: 0.6, facing: 1, kind: 'male', t, phase: t * 2.6, amp: 0.45, tusk: 0.55, age: 1, under: 1, rim: '#ffcf9a', rimK: 0.8, eye: {x: 0.8, y: -0.4}};
    const mB: NarwhalPose = {x: 2550 + 30 * soc, y: 220, angle: 0.4 - rub, scale: 0.62, facing: -1, kind: 'male', t, phase: t * 2.6 + 1.3, amp: 0.45, tusk: 0.53, age: 1, under: 1, rim: '#ffcf9a', rimK: 0.8, eye: {x: 0.8, y: -0.4}};
    // un adulto asciende a respirar
    const asc: Key[] = [[163, 2050, 700], [165.6, 2350, 260], [167, 2550, 10], [168, 2700, -6]];
    const up = nswim(asc, t, {kind: 'male', scale: 0.62, seed: 47, tusk: 0.55, maxPitch: 0.7, extra: {rim: '#ffcf9a', rimK: 0.8}});
    up.blow = win(t, 166.8, 167.8, 0.2);
    const cross = {x: (tuskTip(mA).x + tuskTip(mB).x) / 2, y: (tuskTip(mA).y + tuskTip(mB).y) / 2};
    let c = shot(t, 150, 155, cam(-700, 560, 0.55), cam(mom.x - 150, 600, 0.7));
    if (t > 155.5) c = shot(t, 155.5, 157.5, cam(mom.x - 150, 600, 0.7), cam(2250, 160, 0.72));
    if (t > 157.5) c = cam(lerp(2250, cross.x, 0.5), lerp(160, cross.y + 120, 0.5), lerp(0.72, 0.85, smoothstep(157.5, 162, t)));
    if (t > 163) c = shot(t, 163, 165.5, c, cam(2450, 160, 0.75));
    c = bc(c, t, 0.4);
    return {
      svg: (
        <Sea cam={c} t={t} mood="sunset" floor={2000} rocks front={<Floes t={t} xs={[-1100, -200, 900, 1600, 3100]} />}>
          {others.map((o, i) => <Narwhal key={i} pose={o} uid={`o7${i}`} />)}
          <Narwhal pose={mom} uid="m7" />
          <Narwhal pose={calf} uid="c7" />
          {t > 155 && t < 165 && <g><Narwhal pose={mA} uid="a7" /><Narwhal pose={mB} uid="b7" /></g>}
          {t > 162.8 && <Narwhal pose={up} uid="u7" />}
          <Blow x={narwhalPoint(up, 0.1, 1).x} y={-4} t={t} t0={167} s={0.85} />
        </Sea>
      ),
      overlay: (
        <>
          <Brand />
          <Tag k={win(t, 151, 155.4, 0.4)} text="LA CRÍA NADA JUNTO A SU MADRE" color="#ffe2b8" />
          <Tag k={win(t, 158, 163.6, 0.4)} text="INTERACCIÓN SOCIAL ENTRE MACHOS" color="#ffe2b8" />
          <Wash k={smoothstep(167.2, 167.8, t)} color="#ffe8d0" />
        </>
      ),
    };
  }
  if (t < 172.4) {
    const k = smoothstep(168, 172.2, t);
    const p = {x: 200 - (t - 167.8) * 60, y: 300 - (t - 167.8) * 90, heading: -Math.PI / 2 - 0.4, scale: 0.42, phase: t * 3.5, amp: 0.9, tusk: 0.55, depth: lerp(0.1, 0.95, smoothstep(169.5, 172.2, t)), age: 1};
    const c = cam(lerp(150, 60, k), lerp(200, 0, k), lerp(0.95, 0.55, k), 0.03);
    return {
      svg: (
        <g>
          <AerialSea cam={c} t={t} floes={FLOES_TOP} tint="#ff9a50" tintK={0.18} ripples={[{x: 200, y: 300, t0: 167.9}]}>
            <g opacity={1 - smoothstep(170.8, 172.2, t)}><NarwhalTop uid="f7" p={p} /></g>
          </AerialSea>
        </g>
      ),
      overlay: (
        <>
          <Brand />
          <Wash k={1 - smoothstep(167.8, 168.4, t)} color="#ffe8d0" />
          <Wash k={smoothstep(171.8, 172.4, t)} color="#2a1408" />
        </>
      ),
    };
  }
  // primer plano final del colmillo al sol y cierre
  const hero: NarwhalPose = {x: 520 + (t - 172.4) * 30, y: 380, angle: -0.08, scale: 1.0, facing: 1, kind: 'male', t, phase: t * 2.2, amp: 0.4, tusk: 0.56, age: 1, under: 1, rim: '#ffd59a', rimK: 1, eye: {x: 0.8, y: -0.2}};
  const base = narwhalPoint(hero, 0.008, -0.12);
  const tip = tuskTip(hero);
  const glint = (t * 0.35) % 1;
  const gp = {x: lerp(base.x, tip.x, glint), y: lerp(base.y, tip.y, glint)};
  const c = cam(lerp(base.x + 120, (base.x + tip.x) / 2, smoothstep(172.4, 176, t)), 320, lerp(1.6, 1.05, smoothstep(172.4, 176.5, t)));
  const end = smoothstep(175.2, 176.4, t);
  return {
    svg: (
      <Sea cam={c} t={t} mood="sunset" floor={2000} front={<Floes t={t} xs={[-200, 1500]} />}>
        <Narwhal pose={hero} uid="h7" />
        <g opacity={0.85 * Math.sin(glint * Math.PI)}>
          <path d={`M${gp.x - 34} ${gp.y}L${gp.x + 34} ${gp.y}M${gp.x} ${gp.y - 34}L${gp.x} ${gp.y + 34}`} stroke="#fff8e0" strokeWidth={2.5} strokeLinecap="round" />
          <path d={`M${gp.x - 14} ${gp.y - 14}L${gp.x + 14} ${gp.y + 14}M${gp.x - 14} ${gp.y + 14}L${gp.x + 14} ${gp.y - 14}`} stroke="#fff8e0" strokeWidth={1.5} strokeLinecap="round" opacity={0.7} />
        </g>
      </Sea>
    ),
    overlay: (
      <>
        <Wash k={1 - smoothstep(172.4, 173, t)} color="#2a1408" />
        <Wash k={end * 0.55} color="#120804" />
        {end > 0.01 && (
          <div style={{position: 'absolute', left: 40, right: 40, top: 560, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: end, transform: `scale(${(0.95 + 0.05 * end).toFixed(3)})`}}>
            <div style={{fontWeight: 900, fontSize: 92, lineHeight: 1.05, color: '#ffffff', letterSpacing: 2, textShadow: '0 0 30px rgba(60,20,0,0.6), 0 6px 18px rgba(0,0,0,0.9)'}}>EL UNICORNIO<br />DEL OCÉANO.</div>
            <div style={{marginTop: 40, fontWeight: 900, fontSize: 46, letterSpacing: 10, color: '#ffd23f', textShadow: '0 4px 14px rgba(0,0,0,0.9)'}}>MUNDO INSÓLITO.</div>
          </div>
        )}
      </>
    ),
  };
}
export const _k = {clamp, React};
