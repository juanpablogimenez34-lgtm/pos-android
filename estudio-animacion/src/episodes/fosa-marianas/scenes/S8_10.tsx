// ESCENA 8 (420–480)  LOS ÚLTIMOS PECES · 7.000–8.200 m: sedimentos y pequeños crustáceos; pez caracol de las Marianas
//                     (anatomía, piel translúcida, adaptaciones a la presión); captura por succión de un anfípodo;
//                     el límite de los peces (récord en otra fosa). No hay peces en el fondo del abismo Challenger.
// ESCENA 9 (480–540)  MÁS ALLÁ DEL LÍMITE DE LOS PECES · 8.200–10.000 m: sin peces; Hirondellea gigas sobre restos
//                     vegetales; microorganismos piezófilos (membranas y proteínas); comparación de presión.
// ESCENA 10 (540–600) EL ABISMO CHALLENGER: aproximación y aterrizaje, medición aproximada (con sus variantes),
//                     presión final, expediciones humanas y alejamiento hasta ver toda la columna oceánica.
import React from 'react';
import {clamp, hash1, lerp, smoothstep} from '../../../engine/math';
import {ParallaxLayer} from '../../../engine/camera';
import {depthAt} from '../data/depth';
import {Cliff, SedimentPuff, Seabed} from '../environment/Ocean';
import {Amphipod} from '../characters/Creatures';
import {SNAILFISH, snailDetail} from '../characters/Fishes';
import {Fish, fishWorld} from '../characters/FishRig';
import {SubPose} from '../characters/Submersible';
import {Panel, T} from '../components/DiagramsA';
import {Expeditions, FinalColumn, MicrobeCard, PressureColumn, SnailCard} from '../components/DiagramsB';
import {Badge, BigText, Chapter, SpeciesCard} from '../hud/HUD';
import {Frame} from '../components/HShell';
import {bc, cam, climbAt, darkOf, Env, focusLight, seg, shot, SP, Sub, SubBeams, subLight, win} from './common';

const f1 = (n: number) => Math.round(n * 10) / 10;

/** Restos vegetales hundidos (madera y hojas) sobre el sedimento. */
const Debris: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <path d={`M${x - 140} ${y}L${x + 120} ${y - 26}L${x + 130} ${y - 4}L${x - 130} ${y + 18}Z`} fill="#5a4030" stroke="#3a2818" strokeWidth={2} />
    {[0, 1, 2, 3].map((i) => <path key={i} d={`M${x - 110 + i * 60} ${y + 6 - i * 6}l50 -6`} stroke="#7a5a40" strokeWidth={2} />)}
    <path d={`M${x + 160} ${y + 10}q30 -26 60 -4q-30 20 -60 4Z`} fill="#4a5a30" opacity={0.8} />
    <path d={`M${x - 220} ${y + 14}q24 -20 50 -2q-26 14 -50 2Z`} fill="#5a5030" opacity={0.7} />
  </g>
);

/** Límite de profundidad de los peces (datos publicados). */
const FishLimit: React.FC<{k: number}> = ({k}) => {
  const y = (m: number) => 250 + ((m - 6000) / 5000) * 480;
  return (
    <Panel k={k} x={150} y={120} w={980} h={690} title="EL LÍMITE DE LOS PECES" sub="Registros publicados (aprox.)">
      <rect x={240} y={250} width={60} height={480} rx={10} fill="#0a1424" stroke="#7ad8ff" strokeOpacity={0.4} />
      <rect x={244} y={y(6900)} width={52} height={y(8000) - y(6900)} fill="#f0c4bc" opacity={0.8} />
      {[[6000, '6.000 m'], [7000, '7.000 m'], [8000, '8.000 m'], [9000, '9.000 m'], [10000, '10.000 m'], [10935, '≈ 10.935 m']].map(([m, l]) => (
        <g key={m as number}><line x1={300} y1={y(m as number)} x2={320} y2={y(m as number)} stroke="#9fd8f0" strokeWidth={2} /><T x={326} y={y(m as number) + 7} s={18} c="#9fd8f0">{l}</T></g>
      ))}
      <T x={460} y={y(7200)} s={22} c="#f0c4bc">pez caracol de las Marianas</T>
      <T x={460} y={y(7200) + 28} s={18} c="#e8d8d0">capturado entre ≈ 6.900 y 7.966 m</T>
      <line x1={300} y1={y(8178)} x2={450} y2={y(8178)} stroke="#f0c4bc" strokeWidth={2} strokeDasharray="6 5" />
      <T x={460} y={y(8178) + 7} s={18} c="#f0c4bc">filmado a ≈ 8.178 m (Marianas)</T>
      <line x1={300} y1={y(8336)} x2={450} y2={y(8336)} stroke="#ffd23f" strokeWidth={3} />
      <T x={460} y={y(8336) + 30} s={20} c="#ffd23f">récord: ≈ 8.336 m · otro pez caracol (Pseudoliparis sp.)</T>
      <T x={460} y={y(8336) + 56} s={18} c="#ffe8a0">fosa de Izu-Ogasawara, Japón (2022)</T>
      <T x={460} y={y(9800)} s={22} c="#bfe8ff">más abajo: ningún pez observado</T>
      <T x={460} y={y(9800) + 28} s={18} c="#9fd8f0">sí invertebrados y microorganismos</T>
    </Panel>
  );
};

// ---------------------------------------------------------------- ESCENA 8
const FL8 = 420;
export function scene8(t: number): Frame {
  const d = depthAt(t);
  const leave = smoothstep(464, 474, t);
  const sub: SubPose = {x: -560 + (t - 420) * 2, y: 140 + leave * 900, s: 0.55, t, tilt: 0.18 + leave * 0.3, lights: 1, thrustV: 0.2 + leave * 0.6, dark: 1};
  // anfípodo que será capturado
  const prey = {x: 640, y: FL8 + 10};
  const sf0 = {x: -200 + (t - 428) * 34, y: FL8 - 90 + Math.sin(t * 0.6) * 12};
  const hunt = smoothstep(456.5, 460.5, t);
  const sfx = lerp(sf0.x, prey.x - 100, hunt);
  const sfy = lerp(sf0.y, prey.y - 30, hunt);
  const sfx2 = t > 456.5 ? sfx : Math.min(sfx, 540);
  const jaw = win(t, 460.2, 461.4, 0.25);
  const sucked = smoothstep(460.4, 461, t);
  const snail = {x: sfx2, y: sfy, scale: 1.2, facing: 1 as const, t, phase: t * 3.2, amp: 0.8, jaw, angle: Math.sin(t * 0.4) * 0.05 + hunt * 0.15 * (1 - sucked), tone: 0.05};
  const mouth = fishWorld(SNAILFISH, snail, 0.01, -0.2);
  const preyAt = {x: lerp(prey.x, mouth.x, sucked), y: lerp(prey.y, mouth.y, sucked)};
  const smalls = Array.from({length: 6}, (_, i) => ({x: 100 + i * 170 + Math.sin(t * 0.3 + i) * 20, y: FL8 + 8 + (i % 2) * 6, dir: (i % 2 ? 1 : -1) as 1 | -1}));
  let c = cam(0, FL8 - 120, 0.75);
  if (t > 428.6) c = shot(t, 428.6, 431, c, cam(snail.x + 60, snail.y, 1.2));
  if (t > 431) c = cam(snail.x + 60, snail.y, lerp(1.2, 1.9, smoothstep(437, 440, t)));
  if (t > 446.4) c = cam(snail.x + 60, snail.y, 1.2);
  if (t > 456) c = shot(t, 456, 458.5, cam(snail.x + 60, snail.y, 1.2), cam(prey.x - 60, prey.y - 30, 1.7));
  if (t > 458.5) c = cam(prey.x - 60, prey.y - 30, 1.7);
  if (t > 463.5) c = shot(t, 463.5, 468, c, cam(sub.x + 320, sub.y + 60, 0.62));
  if (t > 468) c = cam(sub.x + 320, sub.y + 60, 0.62);
  c = bc(c, t, 0.4);
  const lp = t < 428.6 ? subLight(c, sub, 0.85, 380, 760) : t < 463.5 ? focusLight(c, {x: snail.x - 60, y: snail.y}, 640, 0.9) : subLight(c, sub, 0.85, 380, 760);
  return {
    cam: c,
    world: (
      <g>
        <Env d={d} t={t} far={false} />
        <ParallaxLayer depth={1}>
          <Seabed y={FL8} x0={-2600} x1={3000} t={t} seed={11} col="#4a4450" />
          {smalls.map((q, i) => <Amphipod key={i} x={q.x} y={q.y} s={0.7} t={t + i} dir={q.dir} walk={0.5} seed={i} />)}
          {sucked < 0.98 && <Amphipod x={preyAt.x} y={preyAt.y} s={0.8 * (1 - sucked * 0.6)} t={t} dir={-1} walk={0.3} feed={1} seed={9} />}
          {t > 427 && <Fish spec={SNAILFISH} uid="snail" pose={snail} detail={snailDetail(win(t, 439.8, 446.2, 0.5))} />}
          <SedimentPuff x={prey.x} y={FL8 + 6} t={t} t0={460.3} s={0.8} />
        </ParallaxLayer>
        <Sub p={sub} />
      </g>
    ),
    snow: {density: 0.6, climb: climbAt(t), ambient: 0.1},
    dark: {amount: darkOf(d) * 0.84, light: lp},
    glow: <SubBeams p={sub} k={0.9} len={1000} />,
    overlay: (
      <>
        <Chapter n={8} title="Los últimos peces" range="7.000–8.200 m" k={win(t, 420.5, 425.5, 0.5)} />
        <SpeciesCard s={SP.snail} k={win(t, 429.4, 437, 0.5)} />
        <Badge k={win(t, 429.4, 437, 0.5)} text="DOCUMENTADO EN LA FOSA DE LAS MARIANAS" x={64} y={22} color="#f0c4bc" />
        <SnailCard k={win(t, 447.2, 456.2, 0.6)} t={t} />
        <FishLimit k={win(t, 464.6, 476.4, 0.6)} />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 9
const FL9 = 700;
export function scene9(t: number): Frame {
  const d = depthAt(t);
  const onFloor = smoothstep(486, 489, t) * (1 - smoothstep(499, 502, t));
  const sy = lerp((t - 480) * 14 - 300, FL9 - 260, onFloor);
  const sub: SubPose = {x: -500, y: sy, s: 0.55, t, tilt: 0.2, lights: 1, thrustV: 0.4, dark: 1};
  const amps = Array.from({length: 5}, (_, i) => ({x: 120 + i * 110 + Math.sin(t * 0.4 + i) * 30, y: FL9 + 8 - (i === 2 ? 26 : 0), dir: (i % 2 ? 1 : -1) as 1 | -1, seed: i + 3}));
  let c = cam(sub.x + 300, sy + 40, 0.6);
  if (t > 487.6) c = shot(t, 487.6, 490, c, cam(330, FL9 - 50, 1.5));
  if (t > 490) c = cam(330 + Math.sin(t * 0.2) * 40, FL9 - 50, 1.5);
  if (t > 500.5) c = shot(t, 500.5, 503, c, cam(200, FL9 - 200, 0.8));
  if (t > 503) c = cam(200, FL9 - 200 + (t - 503) * 4, 0.8);
  c = bc(c, t, 0.4);
  const lp = t > 487.6 && t < 500.5 ? focusLight(c, {x: 330, y: FL9}, 620, 0.9) : subLight(c, sub, 0.85, 380, 760);
  const climb = climbAt(t) * 1.2;
  return {
    cam: c,
    world: (
      <g>
        <Env d={d} t={t} far={false} />
        <Cliff side={1} edge={1560} climb={climb * 0.5} tone="#1a1624" seed={31} detail={false} />
        <Cliff side={-1} edge={180} climb={climb} tone="#3e3846" seed={17} light={1} />
        <ParallaxLayer depth={1}>
          {t > 484 && (
            <g>
              <Seabed y={FL9} x0={-1500} x1={2400} t={t} seed={12} col="#463f4a" />
              <Debris x={330} y={FL9 + 4} />
              {amps.map((a, i) => <Amphipod key={i} x={a.x} y={a.y} s={1} t={t + i * 0.7} dir={a.dir} walk={0.4} feed={1} seed={a.seed} />)}
            </g>
          )}
        </ParallaxLayer>
        <Sub p={sub} />
      </g>
    ),
    snow: {density: 0.55, climb: climbAt(t), ambient: 0.1},
    dark: {amount: darkOf(d) * 0.78, light: lp},
    glow: <SubBeams p={sub} k={0.9} len={1000} />,
    overlay: (
      <>
        <Chapter n={9} title="Más allá del límite de los peces" range="8.200–10.000 m" k={win(t, 480.5, 485.5, 0.5)} />
        <Badge k={win(t, 481, 487.6, 0.5)} text="MÁS ALLÁ DE ≈ 8.300 m NO SE HAN OBSERVADO PECES" color="#ffb8a0" />
        <SpeciesCard s={SP.amphipod} k={win(t, 489, 497.5, 0.5)} />
        <MicrobeCard k={win(t, 501, 530.2, 0.6)} t={t} part={seg(t, 504, 530)} />
        <PressureColumn k={win(t, 531, 539.6, 0.6)} t={t} d={d} />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 10
const FL10 = 900;
export function scene10(t: number): Frame {
  const d = depthAt(t);
  const land = smoothstep(552, 564, t);
  const subY = lerp(200 + (t - 540) * 24, FL10 - 112, land);
  const sub: SubPose = {x: 0, y: subY, s: 0.6, t, tilt: lerp(0.2, 0, land), lights: 1, thrustV: lerp(0.5, -0.3, land) * (1 - smoothstep(564, 566, t)), thrustH: 0.1, dark: 1, arm: smoothstep(566, 570, t) * (1 - smoothstep(584, 588, t)), scan: win(t, 555, 562, 0.6)};
  const amps = Array.from({length: 7}, (_, i) => ({x: -300 + i * 140 + Math.sin(t * 0.3 + i) * 30, y: FL10 + 8 + (i % 2) * 6, dir: (i % 2 ? 1 : -1) as 1 | -1, seed: i + 11}));
  const pull = smoothstep(587, 597, t);
  let c = cam(0, subY + 80, 0.7);
  if (t > 556) c = shot(t, 556, 560, c, cam(60, FL10 - 120, 0.9));
  if (t > 560) c = cam(60, FL10 - 120, 0.9);
  if (t > 566) c = cam(120, FL10 - 140, lerp(0.9, 1.05, smoothstep(566, 586, t)));
  if (t > 587) c = cam(lerp(120, 0, pull), lerp(FL10 - 140, FL10 - 600, pull), Math.exp(lerp(Math.log(1.05), Math.log(0.12), pull)));
  c = bc(c, t, 0.4 * (1 - pull));
  const floorVis = smoothstep(544, 554, t);
  return {
    cam: c,
    world: (
      <g>
        <Env d={d} t={t} far={false} />
        <Cliff side={1} edge={lerp(1650, 1300, pull)} climb={climbAt(t) * 0.6} tone="#141020" seed={41} detail={false} />
        <Cliff side={-1} edge={lerp(260, 620, pull)} climb={climbAt(t) * 0.6} tone="#141020" seed={43} detail={false} />
        <ParallaxLayer depth={1}>
          <g opacity={floorVis}>
            <Seabed y={FL10} x0={-6000} x1={6000} t={t} seed={14} col="#4e4652" />
            {amps.map((a, i) => <Amphipod key={i} x={a.x} y={a.y} s={0.8} t={t + i} dir={a.dir} walk={0.35} feed={0.6} seed={a.seed} />)}
          </g>
          <SedimentPuff x={-60} y={FL10 + 4} t={t} t0={563.6} s={2.2} col="#a8a098" />
        </ParallaxLayer>
        <Sub p={sub} />
      </g>
    ),
    snow: {density: 0.5, climb: climbAt(t), ambient: 0.1},
    dark: {amount: darkOf(d) * lerp(0.82, 0.95, pull), light: subLight(c, sub, 0.9, 340, 760)},
    glow: <SubBeams p={sub} k={0.95} len={1000} />,
    overlay: (
      <>
        <Chapter n={10} title="El abismo Challenger" range="10.000–≈10.935 m" k={win(t, 540.5, 545.5, 0.5)} />
        <Badge k={win(t, 553, 566, 0.5)} text="APROXIMACIÓN CONTROLADA AL FONDO" color="#5aff9a" />
        <BigText k={win(t, 548, 557.6, 0.6)} lines={['≈ 10.935 m']} top={200} size={110} sub="MEDICIÓN DE 2021 (±6 m) · OTRAS: ≈ 10.924 – 10.984 m" />
        <PressureColumn k={win(t, 559.8, 571.4, 0.6)} t={t} d={d} final />
        <Expeditions k={win(t, 572.8, 587.2, 0.6)} t={t} />
        <FinalColumn k={win(t, 589, 595.6, 0.6)} t={t} />
        <BigText k={smoothstep(595, 596.2, t)} lines={['CASI 11.000 METROS.', 'Y TODAVÍA QUEDA', 'MUCHO POR DESCUBRIR.']} top={250} size={78} sub="MUNDO INSÓLITO." />
      </>
    ),
  };
}
export const _k = {clamp, hash1, f1};
