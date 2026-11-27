// ESCENAS 5–8 (60–120 s · fotogramas 1800–3599).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';
import {Cam, camAt, drift as camDrift, toScreen} from '../../ep10-camaron-mantis/camera/CameraSystem';
import {Dim, Grade, SubjectLight} from '../../ep10-camaron-mantis/lighting/Lighting';
import {feeding, float, onWave} from '../animation/DragonMotion';
import {BlueDragon, dragonPoint, dragonPose, DragonPose} from '../character/BlueDragon';
import {ManOWarSide, ManOWarTop, VelellaTop} from '../character/Organisms';
import {Beach, DAY, mixPal, NIGHT, SurfaceSplit, TopOcean, waveY} from '../environment/Ocean';
import {StingerPipeline, WarningCard} from '../science/Science';
import {Callouts, Caption, Question, SceneOut, seg, win} from './common';

const pt = (cam: Cam, p: DragonPose, lx: number, ly: number) => {
  const w = dragonPoint(p, lx, ly);
  return toScreen(cam, w.x, w.y);
};
const f1 = (n: number) => n.toFixed(1);
const MOW_X = 320;

/** ESCENA 5 · UNA PRESA PELIGROSA (60–75 s · f 1800–2249). La carabela portuguesa: la cámara
 *  recorre el flotador y baja por los tentáculos; el dragón azul se aproxima bajo la superficie. */
export function scene05(t: number): SceneOut {
  const cam = camDrift(
    camAt(
      [
        [60, MOW_X, -40, 1.45],
        [62.5, MOW_X + 10, 60, 1.3],
        [65.5, MOW_X + 30, 520, 1.05],
        [68.5, 60, 160, 1.15],
        [75, 120, 140, 1.25],
      ],
      t,
    ),
    t,
    0.8,
  );
  const x = -520 + (t - 60) * 30;
  const p = dragonPose({...float(t), ...onWave(t, x, 30), roll: Math.PI, tilt: 0.34});
  const mY = waveY(MOW_X, t) - 4;
  return {
    svg: (
      <SurfaceSplit cam={cam} t={t} pal={DAY}>
        <ManOWarSide x={MOW_X} y={mY} s={1.15} t={t} uid="m5" tentLen={1100} />
        <BlueDragon uid="d5" p={p} />
      </SurfaceSplit>
    ),
    overlay: (
      <>
        <Grade depth={0.35} vignette={0.75} />
        <Question text="¿Quién se atreve con ella?" k={win(t, 60.2, 62.8, 0.4)} top={250} />
        <Caption text="Carabela portuguesa" sub="un organismo colonial · picaduras dolorosas" k={win(t, 63.0, 68.6, 0.5)} top={190} />
        <Caption text="Para el dragón azul: alimento" k={win(t, 69.4, 74.4, 0.5)} top={190} color="#9ff4ff" />
      </>
    ),
  };
}

/** Tentáculo de carabela en primer plano (para la alimentación). */
const Tentacle: React.FC<{t: number; x: number; y: number; eaten: number}> = ({t, x, y, eaten}) => {
  const pts = Array.from({length: 12}, (_, i) => ({x: x + 150 - i * 14 + Math.sin(t * 1.2 + i * 0.6) * 14, y: y + 150 - i * 15 + Math.cos(t * 0.9 + i * 0.5) * 10 - (i > 8 ? (i - 8) * 4 : 0)}));
  const cut = Math.round(eaten * 3);
  const vis = pts.slice(0, pts.length - cut);
  return (
    <g>
      <path d={vis.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y)}`).join(' ')} stroke="#3a6aff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.9} />
      {vis.filter((_, i) => i % 2).map((q, i) => (
        <circle key={i} cx={q.x} cy={q.y} r={5} fill="#7a5aff" opacity={0.9} />
      ))}
    </g>
  );
};

/** ESCENA 6 · ROBAR LAS ARMAS (75–90 s · f 2250–2699). Primer plano: la cabeza se adelanta y muerde
 *  el tentáculo (alimentación plausible); después, animación científica del almacenamiento. */
export function scene06(t: number): SceneOut {
  const x = -60;
  const w = onWave(t, x, 30);
  const p = dragonPose({...float(t), ...w, roll: Math.PI, tilt: 0.42, ...feeding(t, 78.2, 88.4), heading: (w.heading ?? 0) - 0.1});
  const head = dragonPoint(p, 205, 0);
  const cam = camDrift(camAt([[75, x + 60, 120, 1.5], [78, head.x - 40, head.y + 30, 2.7], [90, head.x - 20, head.y + 40, 2.9]], t), t, 0.6);
  const sci = win(t, 81.0, 89.7, 0.6);
  const hs = toScreen(cam, head.x, head.y);
  return {
    svg: (
      <SurfaceSplit cam={cam} t={t} pal={DAY} rays={0.8}>
        <Tentacle t={t} x={head.x + 6} y={head.y + 20} eaten={seg(t, 79.4, 86)} />
        <BlueDragon uid="d6" p={p} />
      </SurfaceSplit>
    ),
    overlay: (
      <>
        <SubjectLight x={hs.x} y={hs.y} r={520} k={0.6} />
        <Grade depth={0.4} vignette={0.85} />
        <Question text="¿Cómo roba sus armas?" k={win(t, 75.2, 78.4, 0.4)} top={250} />
        <Dim k={sci * 0.8} />
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <StingerPipeline t={t} k={sci} u={seg(t, 81.4, 88.6)} />
          </svg>
        </AbsoluteFill>
        <Caption text="No es magia: es biología" k={win(t, 86.2, 89.6, 0.4)} top={1160} size={36} color="#ffd23f" />
      </>
    ),
  };
}

/** ESCENA 7 · PEQUEÑO, PERO NO INOFENSIVO (90–105 s · f 2700–3149). Macro de las puntas de las
 *  ceratas con luz dramática y advertencia; después, en la playa: observar sin tocar. */
export function scene07(t: number): SceneOut {
  const beach = seg(t, 96.0, 96.9);
  const cam = camDrift(camAt([[90, 60, 90, 3.6, 0.2], [96, 90, 120, 4.4, 0.05]], t), t, 0.4);
  const p = dragonPose({...float(t), heading: -0.4, shine: 1, light: '#bfe8ff'});
  const bp = dragonPose({...float(t * 0.3), scale: 0.8, x: 540, y: 1020, heading: -0.6, spread: 0.45, bend: 0.25, sway: 0.25, shine: 0.9});
  const tip = pt(cam, p, 110, 130);
  return {
    svg: (
      <g>
        <g opacity={1 - beach}>
          <TopOcean cam={cam} t={t} pal={mixPal(DAY, NIGHT, 0.55)} foam={0.3}>
            <BlueDragon uid="d7" p={p} />
          </TopOcean>
        </g>
        {beach > 0.01 && (
          <g opacity={beach}>
            <Beach t={t} />
            <ellipse cx={540} cy={1040} rx={250} ry={90} fill="#8a7a5a" opacity={0.25} />
            <BlueDragon uid="d7b" p={bp} />
          </g>
        )}
      </g>
    ),
    overlay: (
      <>
        <SubjectLight x={tip.x} y={tip.y} r={600} k={(1 - beach) * 0.7} color="rgba(120,180,255,0.3)" />
        <Grade depth={0.5 * (1 - beach)} vignette={0.9 - 0.3 * beach} warm={beach * 0.4} />
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <WarningCard k={win(t, 91.0, 95.9, 0.5)} mode="sting" />
            <WarningCard k={win(t, 97.2, 104.6, 0.5)} mode="beach" />
          </svg>
        </AbsoluteFill>
      </>
    ),
  };
}

/** ESCENA 8 · UN VIAJERO DEL OCÉANO (105–120 s · f 3150–3599). Océano abierto desde muy arriba:
 *  corrientes luminosas, el dragón y otros organismos de la superficie derivan juntos. */
export function scene08(t: number): SceneOut {
  const cam = camDrift(camAt([[105, -60, 0, 1.0, 0], [111, 200, -40, 0.34, 0.16], [120, 320, -60, 0.3, 0.26]], t), t, 0.5);
  const dx = (t - 105) * 38;
  const p = dragonPose({...float(t), x: -200 + dx, y: 0, heading: 0.12});
  const others = Array.from({length: 6}, (_, i) => dragonPose({...float(t, i * 3), x: -1400 + hash1(i * 3) * 2800 + dx * (0.8 + 0.3 * hash1(i)), y: -1500 + hash1(i * 7) * 3000, heading: 0.1 + hash1(i) * 0.5, scale: 0.9 + 0.3 * hash1(i * 5)}));
  const vel = Array.from({length: 7}, (_, i) => ({x: -1600 + hash1(i * 11) * 3400 + dx * 1.1, y: -1700 + hash1(i * 13) * 3200, r: hash1(i) * 80}));
  const mow = Array.from({length: 3}, (_, i) => ({x: -900 + i * 1100 + dx * 0.9, y: -900 + hash1(i * 17) * 1900, r: 180 + hash1(i) * 40}));
  const lab = win(t, 110.6, 116.6, 0.5);
  return {
    svg: (
      <TopOcean cam={cam} t={t} pal={DAY} current={seg(t, 105.5, 108)} foam={0.6}>
        {vel.map((v, i) => (
          <VelellaTop key={i} x={v.x} y={v.y} s={1.4} t={t + i} rot={v.r} />
        ))}
        {mow.map((m, i) => (
          <ManOWarTop key={i} x={m.x} y={m.y} s={1.6} t={t + i} rot={m.r} />
        ))}
        {others.map((o, i) => (
          <BlueDragon key={i} uid={`o8${i}`} p={o} />
        ))}
        <BlueDragon uid="d8" p={p} />
      </TopOcean>
    ),
    overlay: (
      <>
        <Grade depth={0.3} vignette={0.7} />
        <Question text="¿Hasta dónde puede llegar?" k={win(t, 105.2, 108.6, 0.4)} top={250} />
        <Callouts
          items={[
            ...[
              {p: pt(cam, p, 0, 0), label: 'dragón azul'},
              {p: toScreen(cam, vel[3].x, vel[3].y), label: 'velela'},
              {p: toScreen(cam, mow[1].x, mow[1].y), label: 'carabela'},
            ].map((o) => ({...o, lx: clamp(o.p.x, 230, 850), ly: clamp(o.p.y - 150, 330, 1250), k: lab * (o.p.x > 40 && o.p.x < 1040 && o.p.y > 300 && o.p.y < 1350 ? 1 : 0)})),
          ]}
        />
        <Caption text="a merced del viento y las corrientes" k={win(t, 105.8, 109.6, 0.4)} top={1160} size={34} color={mixColor('#ffffff', '#9ff4ff', 0.5)} />
      </>
    ),
  };
}

export const _c = clamp;
export const _l = lerp;
