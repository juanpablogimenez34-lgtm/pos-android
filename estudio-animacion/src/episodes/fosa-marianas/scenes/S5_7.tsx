// ESCENA 5 (240–300) UN MUNDO SIN LUZ · 3.000–4.000 m: oscuridad y nieve marina (esquema científico), pez pelícano
//                    abriendo su mandíbula, pulpo dumbo (profundidad compatible con el género), ahorro de energía.
// ESCENA 6 (300–360) LA LLANURA ABISAL · 4.000–6.000 m: los focos revelan los sedimentos; pepinos de mar reptando y
//                    alimentándose; xenofióforos con ampliación científica (unicelulares); huellas; pendiente hacia la fosa.
// ESCENA 7 (360–420) ENTRAMOS EN LA FOSA · 6.000–7.000 m: descenso junto a la gran pared, subducción, presión
//                    (≈ 1 atm cada 10 m), anfípodos hadales que exploran el fondo y encuentran alimento.
import React from 'react';
import {clamp, hash1, lerp, smoothPath, smoothstep} from '../../../engine/math';
import {ParallaxLayer} from '../../../engine/camera';
import {depthAt} from '../data/depth';
import {Cliff, SedimentPuff, Seabed} from '../environment/Ocean';
import {Amphipod, Dumbo, Gulper, SeaCucumber} from '../characters/Creatures';
import {SMALLFISH} from '../characters/Fishes';
import {Fish} from '../characters/FishRig';
import {SubPose} from '../characters/Submersible';
import {SnowDiagram} from '../components/DiagramsA';
import {PressureColumn, Subduction, XenoCard} from '../components/DiagramsB';
import {Badge, Chapter, SpeciesCard} from '../hud/HUD';
import {Frame} from '../components/HShell';
import {bc, cam, climbAt, darkOf, Env, focusLight, seg, shot, SP, Sub, SubBeams, subLight, win} from './common';

const f1 = (n: number) => Math.round(n * 10) / 10;

/** Xenofióforo sobre el sedimento (testa aglutinada, forma de abanico o esfera). */
export const Xeno: React.FC<{x: number; y: number; s?: number; seed: number; tone?: number}> = ({x, y, s = 1, seed, tone = 0}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) scale(${s})`} opacity={1 - tone * 0.3}>
    {Array.from({length: 26}, (_, i) => {
      const fan = seed % 2 === 0;
      const a = hash1(seed + i) * Math.PI;
      const r = 8 + hash1(seed + i * 3) * 34;
      const px = fan ? Math.cos(a + Math.PI) * r * 0.9 : Math.cos(a + Math.PI) * r * 0.7;
      const py = fan ? -Math.sin(a) * r * 1.2 : -Math.sin(a) * r * 0.7 - 10;
      return <circle key={i} cx={f1(px)} cy={f1(py)} r={3 + hash1(seed + i * 5) * 6} fill={i % 3 ? '#c8b89a' : '#a8987a'} stroke="#6a5a48" strokeWidth={0.6} />;
    })}
  </g>
);
/** Huellas y madrigueras en el sedimento. */
const Traces: React.FC<{x: number; y: number; t: number}> = ({x, y}) => (
  <g opacity={0.55}>
    <path d={smoothPath(Array.from({length: 12}, (_, i) => ({x: x + i * 60, y: y + Math.sin(i * 0.8) * 14})))} stroke="#8a8278" strokeWidth={10} fill="none" strokeDasharray="12 6" />
    <path d={smoothPath(Array.from({length: 9}, (_, i) => ({x: x + 120 + i * 50, y: y + 40 + Math.cos(i * 0.9) * 20})))} stroke="#7a7268" strokeWidth={6} fill="none" />
    {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={x + 80 + i * 130} cy={y + 70 + (i % 2) * 14} rx={14} ry={5} fill="#141010" />)}
    {[0, 1, 2].map((i) => <path key={`s${i}`} d={`M${x + 400 + i * 90} ${y + 10}a30 30 0 0 1 40 0a20 20 0 0 1 -30 10`} stroke="#8a8278" strokeWidth={4} fill="none" />)}
  </g>
);

// ---------------------------------------------------------------- ESCENA 5
export function scene5(t: number): Frame {
  const d = depthAt(t);
  const sy = (t - 240) * 6;
  const sub: SubPose = {x: -420 + (t - 240) * 3, y: sy, s: 0.6, t, tilt: 0.14, lights: 1, thrustV: 0.3, thrustH: 0.15, dark: 1};
  const g = {x: 620 - (t - 263) * 14, y: sy + 90 + Math.sin(t * 0.6) * 20};
  const open = smoothstep(268, 269.5, t) * (1 - smoothstep(271, 272.5, t));
  const dumbo = {x: 520 + Math.sin(t * 0.25) * 60 - (t - 274) * 6, y: sy + 120 + Math.sin(t * 0.5) * 25};
  const floorY = sy + 1500 - smoothstep(292, 300, t) * 700;
  let c = cam(sub.x + 300, sy + 40, 0.6);
  if (t > 258.6) c = shot(t, 258.6, 261, c, cam(sub.x + 700, sy + 160, 1.5));
  if (t > 261) c = cam(sub.x + 700, sy + 160, 1.5);
  if (t > 263.6) c = shot(t, 263.6, 266, c, cam(g.x - 220, g.y, 1.05));
  if (t > 266) c = cam(g.x - 220, g.y, 1.05);
  if (t > 274) c = shot(t, 274, 277, c, cam(dumbo.x, dumbo.y, 1.6));
  if (t > 277) c = cam(dumbo.x - 40, dumbo.y + 10, lerp(1.6, 1.9, smoothstep(277, 289, t)));
  if (t > 289.5) c = shot(t, 289.5, 293, c, cam(sub.x + 380, sy + 260, 0.55));
  if (t > 293) c = cam(sub.x + 380, sy + 260, 0.55);
  c = bc(c, t, 0.5);
  const lp = t < 263 ? subLight(c, sub, 0.85) : t < 274 ? focusLight(c, {x: g.x + 250, y: g.y}, 900, 0.9) : t < 289.5 ? focusLight(c, dumbo, 520, 0.85) : subLight(c, sub, 0.85, 500, 700);
  return {
    cam: c,
    world: (
      <g>
        <Env d={d} t={t} />
        <ParallaxLayer depth={1}>
          {t > 262 && <Gulper x={g.x} y={g.y} s={0.8} t={t} open={open} dir={-1} glow={0.8} />}
          {t > 266 && t < 272 && open < 0.9 && [0, 1, 2, 3, 4].map((i) => {
            const k = smoothstep(268.5, 270.5, t);
            return <circle key={i} cx={lerp(g.x - 250 - i * 20, g.x - 120, k)} cy={lerp(g.y + 30 + i * 12, g.y + 20, k)} r={3} fill="#e8a080" opacity={1 - k * 0.8} />;
          })}
          {t > 272 && <Dumbo x={dumbo.x} y={dumbo.y} s={1.1} t={t} swim={0.7} angle={Math.sin(t * 0.4) * 0.12} tone={0.1} />}
          {t > 290 && <Seabed y={floorY} x0={-3000} x1={4000} t={t} seed={5} col="#3a3644" />}
        </ParallaxLayer>
        <Sub p={sub} />
      </g>
    ),
    snow: {density: 0.95, climb: climbAt(t), ambient: 0.12},
    dark: {amount: darkOf(d), light: lp},
    glow: (
      <g>
        <SubBeams p={sub} k={t < 263 || t > 289 ? 1 : 0.45} />
        <ParallaxLayer depth={1}>
          {t > 262 && (() => {
            // halo del órgano caudal del pez pelícano
            const tail = {x: g.x + 680 * 0.8, y: g.y + Math.sin(t * 2.4 - 6) * 52 * 0.8};
            return <circle cx={tail.x} cy={tail.y} r={22} fill="#ff6a8a" opacity={0.25} />;
          })()}
        </ParallaxLayer>
      </g>
    ),
    overlay: (
      <>
        <Chapter n={5} title="Un mundo sin luz" range="3.000–4.000 m" k={win(t, 240.5, 245.5, 0.5)} />
        <SnowDiagram k={win(t, 246.8, 258.6, 0.6)} t={t} />
        <SpeciesCard s={SP.gulper} k={win(t, 265, 272.4, 0.5)} />
        <Badge k={win(t, 265, 273.5, 0.5)} text="RECONSTRUCCIÓN · EJEMPLO DE ZONA BATIPELÁGICA" x={64} y={22} />
        <SpeciesCard s={SP.dumbo} k={win(t, 275.4, 283, 0.5)} />
        <Badge k={win(t, 290.5, 299, 0.5)} text="AHORRAR ENERGÍA: MOVERSE POCO, APROVECHAR CADA PRESA" color="#bff4ff" />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 6
const FLOOR = 420;
export function scene6(t: number): Frame {
  const d = depthAt(t);
  const slopeK = smoothstep(352, 360, t);
  const sx = -700 + (t - 300) * 38;
  const subY = lerp(220, 210, seg(t, 300, 352)) + slopeK * 360;
  const sub: SubPose = {x: sx, y: subY, s: 0.55, t, tilt: 0.12 + slopeK * 0.35, lights: 1, thrustH: 0.5, thrustV: -0.1, dark: 1, scan: win(t, 303, 312, 0.6)};
  const cukes = [0, 1, 2].map((i) => ({x: 560 + i * 260 + (t - 300) * (3 + i), y: FLOOR + 16 + i * 6, s: 0.9 - i * 0.12}));
  const xenos = Array.from({length: 7}, (_, i) => ({x: 1250 + i * 70 + hash1(i * 3) * 30, y: FLOOR + 14 + hash1(i) * 10, s: 0.8 + hash1(i * 5) * 0.6, seed: i + 2}));
  let c = cam(sx + 300, 260, 0.62);
  if (t > 318.6) c = shot(t, 318.6, 321, c, cam(cukes[1].x, FLOOR - 40, 1.3));
  if (t > 321) c = cam(cukes[1].x - 40, FLOOR - 40, 1.3);
  if (t > 326.6) c = shot(t, 326.6, 329, c, cam(1450, FLOOR - 60, 1.15));
  if (t > 329) c = cam(1450, FLOOR - 60, 1.15);
  if (t > 345.6) c = shot(t, 345.6, 348, c, cam(sx + 350, FLOOR - 20, 1.1));
  if (t > 348) c = cam(sx + 350, FLOOR - 20, 1.1);
  if (t > 352.4) c = shot(t, 352.4, 356, c, cam(sx + 380, subY + 120, 0.6));
  if (t > 356) c = cam(sx + 380, subY + 120, 0.6);
  c = bc(c, t, 0.4);
  const lp = t > 318.6 && t < 326.6 ? focusLight(c, {x: cukes[1].x, y: FLOOR}, 620, 0.85) : t > 326.6 && t < 345.6 ? focusLight(c, {x: 1450, y: FLOOR - 20}, 620, 0.85) : subLight(c, sub, 0.85, 380, 760);
  return {
    cam: c,
    world: (
      <g>
        <Env d={d} t={t} far={false} />
        <ParallaxLayer depth={0.6}>
          <Seabed y={FLOOR - 160} x0={-3000} x1={5000} t={t} seed={8} col="#1e1c26" mounds={false} />
        </ParallaxLayer>
        <ParallaxLayer depth={1}>
          <Seabed y={FLOOR} x0={-3000} x1={1700} t={t} seed={6} col="#4a4552" />
          <Seabed y={FLOOR} x0={1690} x1={5200} t={t} seed={7} col="#4a4552" slope={0.42} />
          <Traces x={sx + 260} y={FLOOR + 30} t={t} />
          {xenos.map((x, i) => <Xeno key={i} {...x} />)}
          {cukes.map((q, i) => <SeaCucumber key={i} x={q.x} y={q.y} s={q.s} t={t + i} crawl={0.6} feed={0.8} />)}
          <SedimentPuff x={sx - 150} y={FLOOR + 10} t={t} t0={305} s={1.6} />
          <SedimentPuff x={sx - 100} y={FLOOR + 10} t={t} t0={341} s={1.3} />
        </ParallaxLayer>
        <Sub p={sub} />
      </g>
    ),
    snow: {density: 0.8, climb: climbAt(t), ambient: 0.1},
    dark: {amount: darkOf(d) * 0.86, light: lp},
    glow: <SubBeams p={sub} k={0.9} len={1000} />,
    overlay: (
      <>
        <Chapter n={6} title="La llanura abisal" range="4.000–6.000 m" k={win(t, 300.5, 305.5, 0.5)} />
        <Badge k={win(t, 303, 312, 0.5)} text="ESCANEO DEL FONDO · SENSORES DEL SUMERGIBLE" color="#5aff9a" />
        <SpeciesCard s={SP.cucumber} k={win(t, 319.4, 326.4, 0.5)} />
        <XenoCard k={win(t, 330, 345.2, 0.6)} t={t} />
        <SpeciesCard s={SP.xeno} k={win(t, 327.2, 330.2, 0.4)} />
        <Badge k={win(t, 346.6, 352, 0.5)} text="HUELLAS Y MADRIGUERAS EN EL SEDIMENTO" color="#e8d8c0" />
        <Badge k={win(t, 353.5, 359.6, 0.5)} text="EL FONDO DESCIENDE HACIA LA FOSA" color="#ffb8a0" />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 7
export function scene7(t: number): Frame {
  const d = depthAt(t);
  const sy = (t - 360) * 10;
  const sub: SubPose = {x: 80 + Math.sin(t * 0.2) * 30, y: sy, s: 0.55, t, tilt: 0.25 - 0.1 * smoothstep(400, 404, t), lights: 1, thrustV: 0.5, dark: 1};
  const climb = climbAt(t) * 1.2;
  // repisa con alimento (cadáver entero de un pez, sin heridas) y anfípodos que llegan
  const ledgeY = sy + 330;
  const food = {x: 380, y: ledgeY - 8};
  const amps = Array.from({length: 12}, (_, i) => {
    const arrive = smoothstep(408 + i * 0.5, 413 + i * 0.6, t);
    const sx0 = 380 + (hash1(i) - 0.5) * 1400;
    const sy0 = ledgeY - 200 - hash1(i * 3) * 300;
    const tx = food.x + (hash1(i * 7) - 0.5) * 160;
    const ty = ledgeY - 4 - hash1(i * 9) * 10;
    return {x: lerp(sx0, tx, arrive) + Math.sin(t * 2 + i) * 4, y: lerp(sy0, ty, arrive), dir: (tx > sx0 ? 1 : -1) as 1 | -1, swim: 1 - arrive, walk: arrive * 0.6, seed: i};
  });
  let c = cam(sub.x + 260, sy + 40, 0.6);
  if (t > 366) c = cam(sub.x + 200, sy + 60, 0.62);
  if (t > 400.6) c = shot(t, 400.6, 403, c, cam(260, ledgeY - 60, 1.4));
  if (t > 403) c = cam(270 + Math.sin(t * 0.3) * 30, ledgeY - 60, lerp(1.4, 1.2, smoothstep(408, 414, t)));
  c = bc(c, t, 0.5);
  const lp = t < 400.6 ? subLight(c, sub, 0.85, 300, 680) : focusLight(c, food, 640, 0.85);
  return {
    cam: c,
    world: (
      <g>
        <Env d={d} t={t} far={false} />
        {/* pared lejana (derecha) en silueta y pared cercana (izquierda) iluminada por los focos */}
        <Cliff side={1} edge={1500} climb={climb * 0.45} tone="#1a1624" seed={21} detail={false} />
        <Cliff side={-1} edge={360} climb={climb} tone="#4a4352" seed={13} light={1} />
        <ParallaxLayer depth={1}>
          {t > 398 && (
            <g>
              <path d={`M-900 ${ledgeY}L700 ${ledgeY - 10}Q760 ${ledgeY + 30} 700 ${ledgeY + 90}L-900 ${ledgeY + 120}Z`} fill="#3a3640" />
              <path d={`M-900 ${ledgeY}L700 ${ledgeY - 10}`} stroke="#6a6470" strokeWidth={4} />
              <Fish spec={SMALLFISH} uid="food" pose={{x: food.x, y: food.y, scale: 2.2, facing: 1, t: 0, phase: 0, amp: 0, angle: 0.05, tone: 0.3}} />
              {amps.map((a, i) => <Amphipod key={i} x={a.x} y={a.y} s={0.9} t={t} dir={a.dir} walk={a.walk} swim={a.swim} feed={1 - a.swim} seed={a.seed} />)}
            </g>
          )}
        </ParallaxLayer>
        <Sub p={sub} />
      </g>
    ),
    snow: {density: 0.7, climb: climbAt(t), ambient: 0.1},
    dark: {amount: darkOf(d) * 0.72, light: lp},
    glow: <SubBeams p={sub} k={0.9} len={1000} />,
    overlay: (
      <>
        <Chapter n={7} title="Entramos en la fosa" range="6.000–7.000 m" k={win(t, 360.5, 365.5, 0.5)} />
        <Badge k={win(t, 366, 379, 0.5)} text="ZONA HADAL · PAREDES DE LA FOSA" color="#ffb8a0" />
        <Subduction k={win(t, 379.8, 390.4, 0.6)} t={t} />
        <PressureColumn k={win(t, 391, 400.6, 0.6)} t={t} d={d} />
        <Badge k={win(t, 401.4, 410, 0.5)} text="CUERPOS LLENOS DE AGUA · SIN CAVIDADES DE AIRE" color="#bff4ff" />
        <SpeciesCard s={SP.amphipod} k={win(t, 411.4, 418.4, 0.5)} />
      </>
    ),
  };
}
export const _k = {clamp};
