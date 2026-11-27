// ESCENA 1 (0–20)    EL GRAN DEPREDADOR: amanecer; un lobo marino nada en la superficie; una sombra sube desde la
//                    oscuridad y el tiburón sale del agua (cámara lenta); la presa escapa. Título.
// ESCENA 2 (20–46.5) UNA MÁQUINA PERFECTA: tamaño (> 6 m), contrasombreado, cuerpo en torpedo, dientes que se reemplazan.
// ESCENA 3 (46.5–70) SENTIDOS: ampollas de Lorenzini (campo eléctrico de una presa enterrada), línea lateral
//                    (vibraciones), olfato y ojo con capa reflectante.
// ESCENA 4 (70–97.6) SANGRE CALIENTE Y GRANDES VIAJES: endotermia regional (mapa de calor), intercambiador de calor,
//                    viaje Sudáfrica–Australia y el «café» del Pacífico.
import React from 'react';
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {cam, Cam, SceneOut, shot} from '../../../studio2';
import {Bubbles, Sea, Splash} from '../../orca-reina-oceanos/environment/Sea';
import {FurSeal, sharkPoint, SharkPose, WhiteShark} from '../character/WhiteShark';
import {breach, Key, sharkSwim} from '../character/motion';
import {BigTitle, Brand, Tag, win} from '../components/common';
import {CafeMap, HeatCard, MigrationMap, ShadeCard, SizeCard, TeethCard} from '../components/Cards';

export const bc = (c: Cam, t: number, k = 1): Cam => ({...c, x: c.x + Math.sin(t * 0.37) * 6 * k, y: c.y + Math.sin(t * 0.29 + 1) * 5 * k, roll: c.roll + Math.sin(t * 0.21) * 0.003 * k});

/** Emboscada completa: lobo marino en superficie, salto del tiburón, la presa escapa. */
export function ambush(t: number, tExit: number, slow: number, sealX0: number) {
  const sealV = 70;
  const sx = sealX0 + (t - (tExit - 8)) * sealV;
  const x0 = sealX0 + 8 * sealV + 20;
  const b = breach(t, tExit, x0, {scale: 0.6, slow});
  const dodge = smoothstep(tExit - 0.3, tExit + 0.5 * slow, t);
  const seal = {x: sx + dodge * 260, y: 30 - dodge * 40 + Math.sin(t * 2) * 4 + smoothstep(tExit + 0.5 * slow, tExit + 1.6 * slow, t) * 90, angle: -0.1 + dodge * 0.6 * (1 - smoothstep(tExit + slow, tExit + 2 * slow, t)), flip: 1 + dodge * 1.4};
  const pose: SharkPose = {x: b.x, y: b.y, angle: b.angle, scale: 0.6, facing: 1, t, phase: t * (b.stage === 'rise' ? 7 : 2), amp: b.stage === 'rise' ? 1.3 : 0.5, jaw: b.air ? smoothstep(tExit - 0.2, tExit + 0.2, t) * (1 - smoothstep(tExit + b.tAir * slow * 0.55, tExit + b.tAir * slow * 0.85, t)) : 0, protrude: b.air ? 0.9 : 0, under: b.air ? 0 : 1, tone: b.stage === 'rise' ? lerp(0.6, 0, b.k) : 0, rim: 0.4};
  return {seal, pose, b, x0};
}

// ---------------------------------------------------------------- ESCENA 1
export function scene1(t: number): SceneOut {
  const A = ambush(t, 10.4, 2.6, -500);
  const {seal, pose, b, x0} = A;
  let c = shot(t, 0, 5, cam(seal.x + 20, 160, 1.5), cam(seal.x - 40, 300, 1.0));
  if (t > 5) c = shot(t, 5, 8.6, cam(seal.x - 40, 300, 1.0), cam(x0 - 60, 520, 0.6));
  if (t > 8.6) c = shot(t, 8.6, 10.6, cam(x0 - 60, 520, 0.6), cam(x0 + 120, -60, 0.62));
  if (t > 10.6) c = cam(x0 + 120 + (t - 10.6) * 10, -60, 0.62);
  if (t > 14) c = shot(t, 14, 17, cam(x0 + 156, -60, 0.62), cam(x0 + 300, 300, 0.5));
  if (t > 17) c = cam(x0 + 300, 300, 0.5);
  c = bc(c, t, 0.5);
  const slowK = win(t, 10.2, b.tEntry + 0.4, 0.3);
  return {
    svg: (
      <Sea cam={c} t={t} mood="dawn" coast floor={2200} rocks kelp schools={[{c: {x: -300, y: 1300}, n: 22, r: 160, seed: 4, dir: 1}]}
        front={<g><Splash x={x0} t={t} t0={10.4} size={1.3} slow={2} /><Splash x={x0 + 300} t={t} t0={b.tEntry} size={1.5} slow={1.8} /></g>}>
        <FurSeal x={seal.x} y={seal.y} s={0.8} t={t} angle={seal.angle} flip={seal.flip} />
        {pose.y < 1050 && <WhiteShark uid="s1" p={pose} />}
        {b.stage === 'dive' && <Bubbles t={t} src={{x: pose.x - 200, y: pose.y - 60}} n={16} seed={3} k={1 - smoothstep(b.tEntry + 1, b.tEntry + 3, t)} s={1.4} />}
      </Sea>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={slowK} text="◉ CÁMARA LENTA" top={250} color="#ffc890" />
        <BigTitle k={win(t, 14.6, 19.6, 0.5)} lines={['CARCHARODON CARCHARIAS', 'EL TIBURÓN BLANCO']} top={300} size={96} />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 2
const P2: Key[] = [[19, -1300, 760], [27, -400, 720], [33.5, 200, 760], [36.5, 900, 700], [40, 1500, 760], [47, 2400, 740]];
export function scene2(t: number): SceneOut {
  const sh = sharkSwim(P2, t, 0.75, {rim: 0.5}, 2, 0.3);
  const head = sharkPoint(sh, 0.1, 0);
  let c = cam(head.x - 260, 760, 0.62);
  if (t > 33.5) c = shot(t, 33.5, 35.5, c, cam(head.x - 150, 760, 0.85));
  if (t > 35.5) c = cam(head.x - 150, 760, 0.85);
  if (t > 39.3) c = shot(t, 39.3, 41.3, c, cam(head.x - 320, 760, 0.6));
  if (t > 41.3) c = cam(head.x - 320, 760, 0.6);
  c = bc(c, t, 0.5);
  return {
    svg: (
      <g>
        <Sea cam={c} t={t} mood="day" floor={2000} rocks kelp schools={[{c: {x: 600, y: 1200}, n: 20, r: 150, seed: 7, dir: -1}]}>
          <WhiteShark uid="s2" p={{...sh, jaw: win(t, 42, 45.5, 0.5) * 0.7, protrude: win(t, 42, 45.5, 0.5) * 0.5}} />
          <Bubbles t={t} src={sharkPoint(sh, 0.98, 0)} n={6} seed={5} k={win(t, 34, 39, 0.5)} />
        </Sea>
        <SizeCard k={win(t, 21, 26.3, 0.5)} t={t} />
        <ShadeCard k={win(t, 26.8, 33.4, 0.5)} t={t} />
        <TeethCard k={win(t, 39.6, 46.2, 0.5)} t={t} />
      </g>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={win(t, 34, 39.2, 0.4)} text="CUERPO EN FORMA DE TORPEDO" color="#ffe2a0" />
        <Tag k={win(t, 34.6, 39.2, 0.4)} text="COLA POTENTE · PROPULSIÓN LATERAL" top={376} color="#bfeaff" />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 3
const P3: Key[] = [[46, -1200, 1500], [52, -350, 1520], [58, 200, 1480], [64, 600, 1450], [71, 1300, 1460]];
export function scene3(t: number): SceneOut {
  const sh = sharkSwim(P3, t, 0.8, {rim: 0.4}, 3, 0.25);
  const head = sharkPoint(sh, 0.02, 0);
  const eye = sharkPoint(sh, 0.085, 0.3);
  const prey = {x: -60, y: 1690};
  const sense = win(t, 49, 63, 0.6);
  let c = cam(head.x - 300, 1500, 0.62);
  if (t > 48.6) c = shot(t, 48.6, 51, c, cam(head.x + 40, 1580, 1.6));
  if (t > 51) c = cam(head.x + 40, 1580, 1.6);
  if (t > 57.4) c = shot(t, 57.4, 59.5, c, cam(head.x - 380, 1520, 0.6));
  if (t > 59.5) c = cam(head.x - 380, 1520, 0.6);
  if (t > 63.8) c = shot(t, 63.8, 66, c, cam(eye.x, eye.y, 2.4));
  if (t > 66) c = cam(eye.x, eye.y, 2.4);
  c = bc(c, t, 0.4);
  const rings = Array.from({length: 4}, (_, i) => {
    const ph = ((t * 0.7 + i / 4) % 1);
    return <circle key={i} cx={prey.x} cy={prey.y} r={30 + ph * 260} fill="none" stroke="#7ff0ff" strokeWidth={4} opacity={(1 - ph) * win(t, 49.2, 56.6, 0.5)} />;
  });
  const vib = Array.from({length: 5}, (_, i) => {
    const ph = ((t * 0.9 + i / 5) % 1);
    return <circle key={i} cx={760} cy={1250} r={40 + ph * 520} fill="none" stroke="#ffd23f" strokeWidth={3} opacity={(1 - ph) * 0.8 * win(t, 57.8, 63.2, 0.5)} />;
  });
  return {
    svg: (
      <Sea cam={c} t={t} mood="day" floor={1720} rocks kelp schools={[{c: {x: 760, y: 1250}, n: 24, r: 130, seed: 11, dir: -1, scatter: win(t, 58, 63, 0.5) * 0.6}]}>
        {/* presa enterrada en la arena (raya) */}
        <ellipse cx={prey.x} cy={prey.y} rx={70} ry={12} fill="#c8b890" opacity={0.9} />
        <ellipse cx={prey.x + 20} cy={prey.y - 6} rx={4} ry={3} fill="#2a2a2a" />
        {rings}
        {vib}
        <WhiteShark uid="s3" p={{...sh, sense, look: t > 64 ? {x: 0.4, y: 0.6} : sh.look}} />
        {t > 64 && <circle cx={eye.x} cy={eye.y} r={10 + 3 * Math.sin(t * 2)} fill="#9fe0ff" opacity={0.35 * win(t, 64.5, 69.5, 0.5)} />}
      </Sea>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={win(t, 49.4, 56.6, 0.4)} text="AMPOLLAS DE LORENZINI" color="#7ff0ff" />
        <Tag k={win(t, 50, 56.6, 0.4)} text="detectan campos eléctricos débiles" top={376} color="#d8f6ff" />
        <Tag k={win(t, 58, 63.2, 0.4)} text="LÍNEA LATERAL · VIBRACIONES" color="#ffd23f" />
        <Tag k={win(t, 64.4, 69.6, 0.4)} text="CAPA REFLECTANTE EN LOS OJOS" color="#bfeaff" />
        <Tag k={win(t, 49.4, 63.2, 0.4)} text="VISUALIZACIÓN: LAS SEÑALES NO SON VISIBLES" top={1380} color="#9fd8f0" />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 4
const P4: Key[] = [[69, -1400, 900], [78, -200, 860], [88, 800, 900], [98, 1900, 870]];
export function scene4(t: number): SceneOut {
  const sh = sharkSwim(P4, t, 0.8, {rim: 0.6, tone: 0.05}, 4, 0.2);
  const mid = sharkPoint(sh, 0.4, 0);
  let c = cam(mid.x + 120, 900, 0.6);
  if (t > 70.4) c = shot(t, 70.4, 72.4, c, cam(mid.x + 60, 880, 0.85));
  if (t > 72.4) c = cam(mid.x + 60, 880, 0.85);
  if (t > 77.2) c = shot(t, 77.2, 79, c, cam(mid.x + 120, 980, 0.5));
  if (t > 79) c = cam(mid.x + 120, 980, 0.5);
  c = bc(c, t, 0.4);
  return {
    svg: (
      <g>
        <Sea cam={c} t={t} mood="deep" schools={[{c: {x: 300, y: 1300}, n: 18, r: 140, seed: 13, dir: 1}]}>
          <WhiteShark uid="s4" p={{...sh, heat: win(t, 70.6, 77.4, 0.6)}} />
        </Sea>
        <HeatCard k={win(t, 77.6, 81.8, 0.5)} t={t} />
        <MigrationMap k={win(t, 82, 90.2, 0.5)} t={t} />
        <CafeMap k={win(t, 90.6, 97.4, 0.5)} t={t} />
      </g>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={win(t, 70.8, 77.2, 0.4)} text="ENDOTERMIA REGIONAL" color="#ffb08a" />
        <Tag k={win(t, 71.2, 77.2, 0.4)} text="músculos más calientes que el agua (esquema)" top={376} color="#ffe2c8" />
      </>
    ),
  };
}
export const _k = {clamp, React};
