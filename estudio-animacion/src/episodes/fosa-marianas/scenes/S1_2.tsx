// ESCENA 1 (0–60)   EL COMIENZO DE LA EXPEDICIÓN · 0–200 m: superficie del Pacífico, la cámara atraviesa el agua
//                   ("CASI 11.000 METROS BAJO EL MAR"), Everest frente a la fosa, mapa, el sumergible entra en el
//                   agua entre delfines, atunes, un banco de peces y un tiburón; el banco huye; descenso y colores.
// ESCENA 2 (60–120) LOS ÚLTIMOS RAYOS DEL SOL · 200–1.000 m: bancos pequeños, peces linterna (primeros planos de los
//                   fotóforos, migración vertical), pez de cabeza transparente (ojos tubulares, anatomía), medusas
//                   corona con destellos y desaparición de la luz solar.
import React from 'react';
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {ParallaxLayer} from '../../../engine/camera';
import {depthAt} from '../data/depth';
import {Surface} from '../environment/Ocean';
import {Dolphin} from '../characters/Dolphin';
import {Fish, fishWorld} from '../characters/FishRig';
import {BARRELEYE, barreleyeDetail, LANTERN, SHARK, sharkDetail, TUNA, tunaDetail} from '../characters/Fishes';
import {Atolla, FishSchool} from '../characters/Creatures';
import {SubPose} from '../characters/Submersible';
import {EverestCompare, LightColors, Panel, PacificMap, T} from '../components/DiagramsA';
import {BigText, Chapter, SpeciesCard} from '../hud/HUD';
import {Frame} from '../components/HShell';
import {bc, cam, darkOf, Env, focusLight, seg, shot, SP, Sub, snowOf, climbAt, win} from './common';

const f1 = (n: number) => Math.round(n * 10) / 10;

// ---------------------------------------------------------------- ESCENA 1
const PX1 = 6; // px por metro en la escena 1
export function scene1(t: number): Frame {
  const d = depthAt(t);
  // A · superficie e inmersión de la cámara (0–8 s)
  if (t < 8) {
    const c = bc(shot(t, 0, 7.8, cam(0, -330, 0.55), cam(80, 1500, 0.62)), t, 0.6);
    return {
      cam: c,
      world: (
        <g>
          <Env d={60} t={t} far={false} />
          <ParallaxLayer depth={1}>
            <Surface t={t} cam={c} />
            <defs>
              <linearGradient id="abyss1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0d5f94" stopOpacity={0} />
                <stop offset="1" stopColor="#020814" stopOpacity={1} />
              </linearGradient>
            </defs>
            <rect x={-3000} y={150} width={6000} height={1800} fill="url(#abyss1)" />
          </ParallaxLayer>
        </g>
      ),
      snow: {density: smoothstep(3.5, 6, t) * 0.35, climb: t * 40, ambient: 0.4},
      overlay: <BigText k={win(t, 4.6, 8.4, 0.6)} lines={['CASI 11.000 METROS', 'BAJO EL MAR']} top={360} size={96} />,
    };
  }
  // B · comparación con el Everest y mapa (8–30 s) sobre el agua azul que se hunde hacia la oscuridad
  if (t < 30) {
    const c = bc(cam(Math.sin(t * 0.05) * 120, 300 + (t - 8) * 6, 0.7), t, 0.6);
    return {
      cam: c,
      world: <Env d={90 + (t - 8) * 3} t={t} lift={0.4} />,
      snow: {density: 0.3, climb: 300 + t * 20, ambient: 0.4},
      overlay: (
        <>
          <EverestCompare k={win(t, 8.4, 17.8, 0.6)} t={t} />
          <PacificMap k={win(t, 18.3, 29.6, 0.6)} t={t} />
        </>
      ),
    };
  }
  // C · el sumergible entra en el agua; delfines, atunes, banco de peces y tiburón (30–60 s)
  const sy = d * PX1;
  const enter = smoothstep(30, 33.6, t);
  const sub: SubPose = {x: lerp(-260, 120, seg(t, 30, 60)), y: lerp(-70, sy + 20, enter), s: 0.6, t, tilt: lerp(0, 0.12, smoothstep(33, 36, t)) - 0.12 * smoothstep(52, 58, t) + 0.06, lights: 0, thrustH: 0.4, thrustV: smoothstep(33, 35, t) * 0.6, dark: 0};
  // delfines (34–44): cruzan cerca de la superficie, con batido vertical
  const dol = [0, 1, 2].map((i) => {
    const tt = t - 34 - i * 0.6;
    const x = -1500 + tt * 330 + i * 160;
    const y = 160 + i * 110 + Math.sin(tt * 1.4 + i) * 40;
    const vy = Math.cos(tt * 1.4 + i) * 56;
    return {x, y, angle: Math.atan2(vy, 330) * 0.8, scale: 0.55 - i * 0.05, facing: 1 as const, t, phase: t * 5.2 + i, amp: 0.9, flipN: Math.sin(t + i) * 0.2, tone: 0};
  });
  // atunes (40–49) de derecha a izquierda
  const tunas = [0, 1, 2].map((i) => ({x: 1700 - (t - 40) * 300 - i * 140, y: 470 + i * 70 + Math.sin(t * 1.3 + i) * 14, scale: 0.6 - i * 0.06, facing: -1 as const, t, phase: t * 10 + i, angle: Math.sin(t * 0.8 + i) * 0.05}));
  // tiburón (45–55) atraviesa el banco y este huye
  const shark = {x: -1300 + (t - 45) * 260, y: 560 + Math.sin(t * 0.6) * 30, scale: 0.6, facing: 1 as const, t, phase: t * 3.4, angle: Math.sin(t * 0.6) * 0.04, jaw: 0.15 + 0.1 * Math.sin(t)};
  const schoolC = {x: 250 + Math.sin(t * 0.3) * 120 - (t - 38) * 25, y: 640};
  const head = fishWorld(SHARK, shark, 0.05, 0);
  const flee = smoothstep(46.5, 48.5, t) * (1 - smoothstep(53, 56, t));
  let c = cam(sub.x + 200, 130, 0.72);
  if (t > 33.5) c = shot(t, 33.5, 36, c, cam(-150, 320, 0.66));
  if (t > 36) c = cam(dol[0].x * 0.35 + 50, 330, 0.66);
  if (t > 41) c = shot(t, 41, 44, cam(dol[0].x * 0.35 + 50, 330, 0.66), cam(260, 560, 0.62));
  if (t > 44) c = cam(260 + (t - 44) * 12, 560, 0.62);
  if (t > 51) c = shot(t, 51, 56, cam(260 + (t - 44) * 12, 560, 0.62), cam(sub.x + 260, sy - 40, 0.68));
  if (t > 56) c = cam(sub.x + 260, sy - 40, 0.68);
  c = bc(c, t, 0.6);
  const splash = t > 32.6 && t < 36 ? (
    <g opacity={1 - seg(t, 33.2, 36)}>
      {Array.from({length: 16}, (_, i) => <circle key={i} cx={sub.x - 200 + i * 28} cy={f1(-10 + Math.sin(i * 2) * 10 + (t - 33) * (40 + i * 6))} r={6 + (i % 4) * 3} fill="#e8fbff" opacity={0.6} />)}
    </g>
  ) : null;
  return {
    cam: c,
    world: (
      <g>
        <Env d={Math.max(5, d)} t={t} />
        <ParallaxLayer depth={1}>
          {c.y < 700 && <Surface t={t} cam={c} />}
          <FishSchool c={schoolC} t={t} n={46} r={170} seed={3} dir={-1} threat={head} flee={flee} s={1.1} col="#3a6a9a" />
          {t > 39 && t < 50 && tunas.map((p, i) => <Fish key={i} spec={TUNA} uid={`tu${i}`} pose={p} detail={tunaDetail} />)}
          {t > 44.5 && t < 56 && <Fish spec={SHARK} uid="sh1" pose={shark} detail={sharkDetail} />}
          {t > 33.5 && t < 45 && dol.map((p, i) => <Dolphin key={i} uid={`d${i}`} p={p} />)}
          {splash}
        </ParallaxLayer>
        <Sub p={sub} />
      </g>
    ),
    snow: {density: 0.3, climb: climbAt(t) + 900, ambient: 0.45},
    overlay: (
      <>
        <Chapter n={1} title="El comienzo de la expedición" range="0–200 m" k={win(t, 30.4, 34.6, 0.5)} />
        <SpeciesCard s={SP.dolphin} k={win(t, 36, 40.6, 0.5)} />
        <SpeciesCard s={SP.tuna} k={win(t, 41.4, 45.8, 0.5)} />
        <SpeciesCard s={SP.shark} k={win(t, 46.6, 51.2, 0.5)} />
        <LightColors k={win(t, 51.6, 59, 0.6)} />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 2
const DVMPanel: React.FC<{k: number; t: number}> = ({k, t}) => {
  const night = 0.5 + 0.5 * Math.sin(t * 0.9);
  return (
    <Panel k={k} x={130} y={150} w={700} h={560} title="MIGRACIÓN VERTICAL DIARIA" sub="Esquema: muchos peces linterna suben de noche">
      <rect x={180} y={260} width={600} height={400} rx={14} fill="#062a4a" />
      <circle cx={260} cy={300} r={22} fill={night > 0.5 ? '#e8eef8' : '#ffd890'} />
      <T x={300} y={308} s={20}>{night > 0.5 ? 'noche: suben a alimentarse' : 'día: bajan a la penumbra'}</T>
      {Array.from({length: 9}, (_, i) => {
        const y = lerp(600, 340, night) + Math.sin(t * 2 + i) * 10 + (i % 3) * 18;
        const x = 260 + i * 55;
        return <g key={i}><path d={`M${x} ${f1(y)}l-18 -5l0 10Z`} fill="#6a8aa8" />{[0, 1, 2].map((q) => <circle key={q} cx={x - 4 - q * 4} cy={f1(y + 3)} r={1.6} fill="#bff8ff" />)}</g>;
      })}
      <path d={`M740 ${f1(lerp(560, 380, night))}l0 ${night > 0.5 ? -40 : 40}`} stroke="#ffd23f" strokeWidth={5} />
      <T x={200} y={690} s={16} c="#9fd8f0">superficie ↑ · profundidad ↓</T>
    </Panel>
  );
};
export function scene2(t: number): Frame {
  const d = depthAt(t);
  const sy = 300 + (t - 60) * 10;
  const sub: SubPose = {x: -100 + Math.sin(t * 0.2) * 80 - smoothstep(84, 88, t) * 520 * (1 - smoothstep(107, 112, t)), y: sy, s: 0.6, t, tilt: 0.1 + Math.sin(t * 0.3) * 0.03, lights: 0, thrustV: 0.4, thrustH: 0.2, dark: smoothstep(400, 1000, d) * 0.7};
  // peces linterna (69–88)
  const lan = Array.from({length: 7}, (_, i) => ({x: 520 + i * 70 - (t - 69) * 18 + Math.sin(t * 0.7 + i) * 30, y: sy + 120 + (i % 3) * 70 + Math.cos(t * 0.9 + i) * 20, scale: 1.2 - (i % 3) * 0.15, facing: -1 as const, t, phase: t * 9 + i * 1.3, angle: Math.sin(t * 0.5 + i) * 0.08, glow: 0.6 + 0.4 * Math.sin(t * 2 + i), tone: 0.35}));
  const hero = lan[2];
  // pez de cabeza transparente (88–108): casi inmóvil, ojos que giran
  const bar = {x: 560, y: sy + 80 + Math.sin(t * 0.5) * 8, scale: 1.8, facing: 1 as const, t, phase: t * 1.8, amp: 0.4, angle: -0.05 + Math.sin(t * 0.3) * 0.03, tone: 0.2};
  const eyeRot = smoothstep(95.5, 98, t) * (1 - smoothstep(104, 106, t));
  // medusas (107–120)
  const jel = [0, 1, 2].map((i) => ({x: 200 + i * 360 + Math.sin(t * 0.2 + i) * 30, y: sy + 60 + i * 60 - (t - 107) * (6 + i * 2)}));
  let c = cam(sub.x + 250, sy + 40, 0.7);
  if (t > 69.5) c = shot(t, 69.5, 72, cam(sub.x + 250, sy + 40, 0.7), cam(hero.x - 40, hero.y, 1.7));
  if (t > 72) c = cam(hero.x - 40, hero.y, lerp(1.7, 2.3, smoothstep(72, 79, t)));
  if (t > 79) c = shot(t, 79, 81, cam(hero.x - 40, hero.y, 2.3), cam(lan[3].x + 380, sy + 140, 1.0));
  if (t > 81) c = cam(lan[3].x + 380, sy + 140, 1.0);
  if (t > 88.4) c = shot(t, 88.4, 91, c, cam(bar.x - 120, bar.y - 20, 2.2));
  if (t > 91) c = cam(bar.x - 120 + Math.sin(t * 0.3) * 20, bar.y - 20, lerp(2.2, 2.5, smoothstep(91, 100, t)));
  if (t > 106.5) c = shot(t, 106.5, 109, cam(bar.x - 120, bar.y - 20, 2.5), cam(jel[1].x, jel[1].y, 1.25));
  if (t > 109) c = cam(jel[1].x - 60, jel[1].y + 20, 1.25);
  c = bc(c, t, 0.5);
  const dk = darkOf(d);
  const lightP = t < 88 ? hero : t < 107 ? bar : {x: jel[1].x, y: jel[1].y};
  return {
    cam: c,
    world: (
      <g>
        <Env d={d} t={t} />
        <ParallaxLayer depth={1}>
          {t < 74 && <FishSchool c={{x: 400 - (t - 60) * 30, y: sy + 60}} t={t} n={36} r={150} seed={7} dir={-1} s={0.8} col="#2a5a8a" tone={smoothstep(200, 600, d)} threat={{x: sub.x + 120, y: sub.y}} flee={0.5} />}
          {t > 68 && t < 90 && lan.map((p, i) => <Fish key={i} spec={LANTERN} uid={`ln${i}`} pose={p} />)}
          {t > 86 && t < 109 && <Fish spec={BARRELEYE} uid="bar" pose={bar} detail={barreleyeDetail(eyeRot, win(t, 96.4, 107.4, 0.6))} />}
          {t > 105 && jel.map((j, i) => <Atolla key={i} x={j.x} y={j.y} s={0.9 - i * 0.15} t={t} phase={i * 0.9} glow={i === 1 ? win(t, 113, 117.5, 0.4) : 0} />)}
        </ParallaxLayer>
        <Sub p={sub} />
      </g>
    ),
    snow: {density: snowOf(d), climb: climbAt(t), ambient: lerp(0.4, 0.15, smoothstep(300, 1000, d))},
    dark: {amount: dk, light: focusLight(c, lightP, 640, 0.75)},
    glow: (
      <ParallaxLayer depth={1}>
        {t > 68 && t < 90 && lan.map((p, i) => [0.18, 0.31, 0.44, 0.57, 0.7].map((u, k) => {
          const q = fishWorld(LANTERN, p, u, -0.78);
          return <circle key={`${i}-${k}`} cx={q.x} cy={q.y} r={6 * p.scale} fill="#9ff6ff" opacity={0.35 * p.glow} />;
        }))}
        {t > 105 && jel.map((j, i) => i === 1 && win(t, 113, 117.5, 0.4) > 0.01 ? <circle key={i} cx={j.x} cy={j.y} r={130} fill="#4ab8ff" opacity={0.12 * win(t, 113, 117.5, 0.4)} /> : null)}
      </ParallaxLayer>
    ),
    overlay: (
      <>
        <Chapter n={2} title="Los últimos rayos del sol" range="200–1.000 m" k={win(t, 60.5, 65.5, 0.5)} />
        <SpeciesCard s={SP.lantern} k={win(t, 70.4, 77, 0.5)} />
        <DVMPanel k={win(t, 78.2, 87.8, 0.6)} t={t} />
        <SpeciesCard s={SP.barreleye} k={win(t, 89, 95.4, 0.5)} />
        <SpeciesCard s={SP.atolla} k={win(t, 109, 116, 0.5)} />
      </>
    ),
  };
}
export const _k = {clamp};
