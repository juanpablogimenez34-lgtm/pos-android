// 03 · Cuenta regresiva: la tripulación entra en el cohete, Nico a los controles, Luna ajusta el
// casco y Bip muestra los números. Cada número cae en un pulso real de la canción (los cinco
// pulsos anteriores al estribillo); la cámara alterna pantalla de Bip, manos, caras, exterior y
// luces del motor. En el "cero": vibración, resplandor mágico y despegue de fantasía.
import React from 'react';
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {bipP, lunaP, nicoP} from '../Animation/cast';
import {expr, L} from '../Animation/moves';
import {Cam, layerT} from '../Camera/cam2d';
import {Bip} from '../Characters/Bip';
import {Luna} from '../Characters/Luna';
import {Nico} from '../Characters/Nico';
import {Burst} from '../Effects/Fx';
import {CockpitBack, CockpitPanel} from '../Environments/Cockpit';
import {RoomBack, RoomFloor} from '../Environments/Room';
import {Clouds, SpaceBack} from '../Environments/Space';
import {BUILT, NutRocket} from '../Rocket/NutRocket';
import {COUNT_TIMES, LIFTOFF} from '../Timeline/timeline';
import {RocketCrew} from './crew';

const ROCKET_X = -230;

/** Número vigente (5…1, 0 tras el despegue) y tiempo desde que apareció. */
export function countAt(t: number) {
  let n = 6;
  let since = 0;
  COUNT_TIMES.forEach((ct, i) => {
    if (t >= ct) {
      n = 5 - i;
      since = t - ct;
    }
  });
  if (t >= LIFTOFF) {
    n = 0;
    since = t - LIFTOFF;
  }
  return {n, since};
}

const Cockpit: React.FC<{t: number; cam: Cam; shake: number; outside: 'room' | 'sky'}> = ({t, cam, shake, outside}) => {
  const {n} = countAt(t);
  const lift = t >= LIFTOFF;
  const view =
    outside === 'room' ? (
      <g>
        <rect x={-400} y={-900} width={800} height={700} fill="#ffe9c9" />
        <rect x={-180} y={-780} width={260} height={300} rx={20} fill="#7ec8ff" stroke="#ffffff" strokeWidth={16} />
      </g>
    ) : (
      <g>
        <rect x={-400} y={-900} width={800} height={700} fill="#7ec8ff" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${-180 + i * 160} ${-800 + (((t - LIFTOFF) * 700 + i * 260) % 900)})`}>
            <ellipse rx={90} ry={34} fill="#ffffff" />
            <ellipse cx={-30} cy={-18} rx={50} ry={32} fill="#ffffff" />
          </g>
        ))}
      </g>
    );
  const react = lift ? smoothstep(LIFTOFF, LIFTOFF + 0.3, t) : 0;
  return (
    <g>
      <CockpitBack cam={cam} t={t} view={view} shake={shake} />
      <g transform={layerT({...cam, x: cam.x + shake * Math.sin(t * 61) * 4}, 1.0)}>
        <Bip id="cb" p={bipP(t, {x: -360, y: 320, scale: 1.55, helmet: 1, armR: L(-1.4, 0.4), ...(react ? {armL: L(2.6, 0.3), armR: L(-2.6, -0.3)} : {})}, n >= 1 && n <= 5 ? {mode: 'number', value: String(n)} : {mode: 'face', face: lift ? 'wow' : 'focus'})} />
        <Luna id="cl" p={lunaP(t, {x: 360, y: 320, scale: 1.55, helmet: smoothstep(31.2, 31.9, t), facing: -1, expr: expr(t, 4, react ? {mouth: 'o', brow: 1} : {mouth: 'grin'}), armL: t < COUNT_TIMES[0] ? L(2.9, 0.5) : L(0.9, -1.2), armR: t < COUNT_TIMES[0] ? L(-2.9, -0.5) : L(-0.6, 0.8)}, {}, react)} />
        <Nico id="cn" p={nicoP(t, {x: 0, y: 330, scale: 1.7, helmet: 1, expr: expr(t, 1, react ? {mouth: 'open', mouthOpen: 0.8, brow: 1} : {mouth: 'grin', brow: 0.4}), armL: L(0.75, -1.25), armR: L(-0.75, 1.25), lean: react ? -0.12 : 0})} />
      </g>
      <CockpitPanel cam={cam} t={t} lever={clamp((t - COUNT_TIMES[3]) / 0.6)} wheel={lift ? Math.sin(t * 3) * 0.4 : 0} shake={shake} />
    </g>
  );
};

export const CountdownScene: React.FC<{t: number}> = ({t}) => {
  const {n, since} = countAt(t);
  const lift = t >= LIFTOFF;
  const shake = lift ? Math.max(0, 1 - (t - LIFTOFF) / 1.2) : smoothstep(COUNT_TIMES[3], LIFTOFF, t) * 0.5;
  // --- plano 0: la tripulación sube al cohete (exterior, habitación)
  if (t < COUNT_TIMES[0] - 0.45) {
    const cam: Cam = {x: -180, y: -480, zoom: 0.95, roll: 0};
    const u = clamp((t - 31.0) / 0.9);
    const room = {night: 0, materials: 1, nutOnTable: 0, t, tidy: 0, zumiStar: 0};
    return (
      <g>
        <RoomBack cam={cam} s={room} />
        <RoomFloor cam={cam} s={room} />
        <g transform={layerT(cam, 1)}>
          <NutRocket id="cd-r" p={{x: ROCKET_X, y: 0, scale: 1, rot: 0, build: BUILT, vibrate: 0, engine: 0, glow: 0, t}} windowContent={u > 0.6 ? <RocketCrew t={t} mood="look" uid="c0" /> : undefined} />
          <g opacity={1 - smoothstep(0.55, 0.75, u)}>
            <Nico id="c0n" p={nicoP(t, {x: lerp(-40, ROCKET_X, u), y: -Math.sin(u * Math.PI) * 160, scale: 1 - 0.5 * u, helmet: 1, armL: L(2.6, 0.3), armR: L(-2.6, -0.3)})} />
            <Luna id="c0l" p={lunaP(t, {x: lerp(-470, ROCKET_X, u), y: -Math.sin(u * Math.PI) * 140, scale: 1 - 0.5 * u, helmet: 1, armL: L(2.6, 0.3), armR: L(-2.6, -0.3)})} />
            <Bip id="c0b" p={bipP(t, {x: lerp(260, ROCKET_X, u), y: -Math.sin(u * Math.PI) * 120, scale: 1 - 0.5 * u, helmet: 1})} />
          </g>
        </g>
      </g>
    );
  }
  // --- plano general de cabina antes del primer número
  if (t < COUNT_TIMES[0]) return <Cockpit t={t} cam={{x: 0, y: 0, zoom: 0.62, roll: 0}} shake={0} outside="room" />;
  // --- cortes por número (pulsos reales)
  if (!lift) {
    const shots: Cam[] = [
      {x: -360, y: 340, zoom: 2.1, roll: 0}, // 5: pantalla de Bip
      {x: -60, y: 640, zoom: 1.7, roll: 0}, // 4: manos sobre los controles
      {x: 120, y: 280, zoom: 1.4, roll: 0}, // 3: caras emocionadas
      {x: 0, y: 0, zoom: 1, roll: 0}, // 2: exterior (se dibuja aparte)
      {x: -360, y: 340, zoom: 2.4, roll: 0}, // 1: pantalla de Bip
    ];
    const i = 5 - n;
    const pop = 1 + 0.06 * Math.exp(-since * 6);
    if (i === 3) {
      const cam: Cam = {x: -230, y: -330, zoom: 1.0 * pop, roll: 0};
      const room = {night: 0, materials: 1, nutOnTable: 0, t, tidy: 0, zumiStar: 0};
      return (
        <g>
          <RoomBack cam={cam} s={room} />
          <RoomFloor cam={cam} s={room} />
          <g transform={layerT(cam, 1)}>
            <NutRocket id="cd-x" p={{x: ROCKET_X, y: 0, scale: 1, rot: 0, build: BUILT, vibrate: shake, engine: 0.35, glow: 0.2, t}} windowContent={<RocketCrew t={t} mood="pilot" uid="c2" />} />
          </g>
          <BigNumber n={n} since={since} />
        </g>
      );
    }
    return (
      <g>
        <Cockpit t={t} cam={{...shots[i], zoom: shots[i].zoom * pop}} shake={shake} outside="room" />
        {i !== 0 && i !== 4 && <BigNumber n={n} since={since} />}
      </g>
    );
  }
  // --- ¡cero! vibración, resplandor mágico, reacción y despegue de fantasía
  const lt = t - LIFTOFF;
  if (lt < 0.45 || (lt > 1.4 && lt < 2.1)) return <Cockpit t={t} cam={{x: 0, y: 200, zoom: 0.85 * (1 + 0.04 * Math.sin(t * 40) * shake), roll: 0}} shake={shake * 1.5} outside={lt > 1.4 ? 'sky' : 'room'} />;
  const sky = smoothstep(0.6, 2.6, lt);
  const cam: Cam = {x: -230, y: lerp(-400, -1400, smoothstep(0.5, 3.6, lt)), zoom: lerp(0.95, 0.7, smoothstep(0.5, 3, lt)), roll: 0};
  const room = {night: 0, materials: 1, nutOnTable: 0, t, tidy: 0, zumiStar: 0};
  const ry = -smoothstep(0.7, 3.7, lt) * 1700;
  return (
    <g>
      {sky < 1 && (
        <g opacity={1 - sky}>
          <RoomBack cam={cam} s={room} />
          <RoomFloor cam={cam} s={room} />
        </g>
      )}
      <g opacity={sky}>
        <SpaceBack cam={cam} t={t} sky={1} />
        <Clouds cam={cam} t={t} scroll={lt * 900} op={sky} />
      </g>
      <g transform={layerT(cam, 1)}>
        <NutRocket id="cd-l" p={{x: ROCKET_X, y: ry, scale: 1, rot: Math.sin(t * 5) * 0.03, build: BUILT, vibrate: shake, engine: smoothstep(0, 0.4, lt), glow: Math.max(0, 1 - lt / 1.6), t}} windowContent={<RocketCrew t={t} mood="wow" uid="c3" />} />
        <Burst x={ROCKET_X} y={ry - 200} u={lt / 1.2} r={420} />
      </g>
    </g>
  );
};

const BigNumber: React.FC<{n: number; since: number}> = ({n, since}) => {
  if (n < 1 || n > 5) return null;
  const k = Math.exp(-since * 3);
  return (
    <g transform={`translate(540 ${(760 - 40 * (1 - k)).toFixed(1)}) scale(${(1 + 0.4 * k).toFixed(3)})`} opacity={Math.min(1, 1.6 - since)}>
      <circle r={150} fill="#2a1a5a" opacity={0.35} />
      <text y={90} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={280} fill="#ffd23f" stroke="#7a3a8a" strokeWidth={14} paintOrder="stroke">
        {n}
      </text>
    </g>
  );
};

