// CAZA CON EL COLMILLO — geometría de las 10 fases en las dos vistas (aérea tipo dron y lateral submarina).
// El pez nada ligeramente A UN LADO del colmillo; la cabeza gira hacia fuera (preparación) y barre de lado
// a través del pez: el contacto lo aturde (gira, deja de nadar), el narval se reorienta, acerca la boca y lo
// captura por succión. Sin heridas ni sangre; el colmillo nunca atraviesa al pez.
import React from 'react';
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {NarwhalPose, narwhalPoint, tuskTip} from '../character/Narwhal';
import {strikeChoreo} from '../character/motion';
import {CodTop, NarwhalTop, TopPose, topTuskTip} from '../environment/Aerial';
import {Cod, Contact} from '../environment/Critters';

type V = {x: number; y: number};
const angDiff = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

/** Vista aérea: el narval avanza con rumbo `heading` desde `start`; el pez nada delante. */
export function aerialStrike(t: number, o: {t0: number; slow: number; fish0: V; heading: number; scale: number; tusk?: number; fishV?: V}) {
  const C = strikeChoreo(t, o.t0, o.slow);
  const tl = (o.tusk ?? 0.55) * 1000 * o.scale;
  const fv = o.fishV ?? {x: Math.cos(o.heading) * 26, y: Math.sin(o.heading) * 26};
  const tc = C.contactT;
  const tt = Math.min(t, tc);
  let F = {x: o.fish0.x + fv.x * (tt - o.t0), y: o.fish0.y + fv.y * (tt - o.t0)};
  // pez aturdido: deriva lenta, girando
  const drift = Math.max(0, t - tc);
  if (drift > 0) F = {x: F.x + fv.x * 0.8 * (1 - Math.exp(-drift * 1.6)) + 30 * (1 - Math.exp(-drift)), y: F.y + fv.y * 0.8 * (1 - Math.exp(-drift * 1.6))};
  const off = 0.03; // el pez está apenas a un lado de la línea del colmillo
  const reach = tl * 0.72 + 560 * clamp((C.dist - 0.45) / 0.55);
  const Htrack = {x: F.x - Math.cos(o.heading + off) * reach, y: F.y - Math.sin(o.heading + off) * reach};
  // reorientación hacia el pez y acercamiento de la boca
  const reo = smoothstep(C.ps(7), C.ps(8), t);
  const aim = Math.atan2(F.y - Htrack.y, F.x - Htrack.x);
  let heading = o.heading + angDiff(aim, o.heading) * reo + C.yaw;
  const m = smoothstep(C.ps(8), C.ps(9) + 0.2 * o.slow, t);
  const H = {x: lerp(Htrack.x, F.x - Math.cos(heading) * 14 * o.scale, m), y: lerp(Htrack.y, F.y - Math.sin(heading) * 14 * o.scale, m)};
  if (m > 0) heading = lerp(heading, Math.atan2(F.y - Htrack.y, F.x - Htrack.x), m * 0.5);
  const pose: TopPose = {x: H.x, y: H.y, heading, scale: o.scale, phase: t * (C.P.i >= 4 && C.P.i < 10 ? 2.4 / o.slow : 4.2), amp: 0.9, headYaw: C.yaw, tusk: o.tusk ?? 0.55, depth: 0.12, turn: -C.yaw * 0.3, jaw: C.jaw};
  const tip = topTuskTip(pose);
  const spin = C.stun * drift * 4;
  const fishS = 1.5 * (1 - C.suck * 0.85);
  const fishOp = C.eaten ? 0 : 1;
  const svg = (
    <g>
      <NarwhalTop uid={`as${o.t0}`} p={pose} />
      {fishOp > 0 && <CodTop x={lerp(F.x, H.x, C.suck * 0.9)} y={lerp(F.y, H.y, C.suck * 0.9)} a={o.heading + (drift > 0 ? spin : 0)} t={t} s={fishS} spin={C.stun} />}
      <Contact x={F.x} y={F.y} k={C.flash} s={0.8} />
      {C.suck > 0 && C.suck < 1 && <circle cx={H.x} cy={H.y} r={30 + C.suck * 40} fill="none" stroke="#e8fcff" strokeWidth={3} opacity={0.6 * (1 - C.suck)} />}
    </g>
  );
  // centro de encuadre: entre el centro del cuerpo y el pez
  const bodyC = {x: H.x - Math.cos(heading) * 0.42 * 1000 * o.scale, y: H.y - Math.sin(heading) * 0.42 * 1000 * o.scale};
  const focus = {x: bodyC.x * 0.6 + F.x * 0.4, y: bodyC.y * 0.6 + F.y * 0.4};
  return {svg, C, F, H, tip, pose, focus};
}

/** Vista lateral submarina (cámara lenta). El narval mira hacia +x; el pez nada a su lado, más cerca de la cámara. */
export function sideStrike(t: number, o: {t0: number; slow: number; fish0: V; scale: number; tusk?: number; fishVx?: number; kind?: NarwhalPose['kind']}) {
  const C = strikeChoreo(t, o.t0, o.slow);
  const fvx = o.fishVx ?? 34;
  const tc = C.contactT;
  const tt = Math.min(t, tc);
  let F = {x: o.fish0.x + fvx * (tt - o.t0), y: o.fish0.y + Math.sin(tt * 1.3) * 10};
  const drift = Math.max(0, t - tc);
  if (drift > 0) F = {x: F.x + 70 * (1 - Math.exp(-drift * 1.2)), y: F.y + 26 * drift * (1 - Math.exp(-drift * 0.8)) + 60 * (1 - Math.exp(-drift * 2))};
  const tuskF = o.tusk ?? 0.55;
  const base: NarwhalPose = {x: 0, y: 0, angle: 0, scale: o.scale, facing: 1, kind: o.kind ?? 'male', t, phase: 0, amp: 0.6, under: 1, age: 1, tusk: tuskF};
  const tipV = tuskTip(base); // vector cabeza→punta con el colmillo de frente
  const reach = 0.72 + 1.1 * clamp((C.dist - 0.45) / 0.55);
  const Htrack = {x: F.x - tipV.x * reach, y: F.y - tipV.y * reach};
  // reorientación (cabeceo hacia el pez que cae) y boca sobre el pez
  const reo = smoothstep(C.ps(7), C.ps(8), t);
  const mouth0 = narwhalPoint({...base, angle: 0}, 0.012, -0.32);
  const aimAng = clamp(Math.atan2(F.y - (Htrack.y + mouth0.y), F.x - Htrack.x) * 0.8, -0.2, 0.55);
  const angle = aimAng * reo + Math.sin(t * 0.7) * 0.02;
  const m = smoothstep(C.ps(8), C.ps(9) + 0.25 * o.slow, t);
  const mouthA = narwhalPoint({...base, angle}, 0.012, -0.32);
  const H = {x: lerp(Htrack.x, F.x - mouthA.x, m), y: lerp(Htrack.y, F.y - mouthA.y, m)};
  const slowP = C.P.i >= 4 && C.P.i < 10;
  const pose: NarwhalPose = {
    ...base, x: H.x, y: H.y, angle,
    phase: slowP ? C.ps(4) * 4.5 + (t - C.ps(4)) * (4.5 / o.slow) : t * 4.5, amp: C.P.i < 2 ? 0.9 : 0.55,
    headYaw: C.yaw, jaw: C.jaw, eye: {x: 0.8, y: clamp((F.y - H.y) / 200, -0.6, 0.8)},
    flipN: -C.yaw * 0.6, flipF: C.yaw * 0.4,
  };
  const tip = tuskTip(pose);
  const spin = drift * 220 * C.stun;
  const mouthW = narwhalPoint(pose, 0.012, -0.32);
  const fishPos = {x: lerp(F.x, mouthW.x, C.suck), y: lerp(F.y, mouthW.y, C.suck)};
  const fishS = 2.3 * o.scale * (1 - C.suck * 0.7);
  return {
    C, F, H, tip, pose,
    fish: C.eaten ? null : <Cod x={fishPos.x} y={fishPos.y} t={t} s={fishS} stun={C.stun} spin={spin} alert={C.P.i >= 2 && C.P.i < 5 ? 0.5 : 0} />,
    fx: <Contact x={F.x} y={F.y} k={C.flash} s={o.scale * 1.6} />,
  };
}
export const _k = {React};
