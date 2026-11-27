// ESCENAS 1–4.
//  1 (0–5)   GANCHO: primerísimo plano de la pinza abierta y la presa → se cierra → chorro, burbuja, onda de choque
//            → la presa reacciona → la cámara se aleja y revela al camarón. «¡DISPARA SIN BALAS!»
//  2 (5–12)  EL CAMARÓN PISTOLA: camina sobre la arena; seguimiento de las patas; comparación de las dos pinzas.
//  3 (12–20) EL MECANISMO: llega una presa, las antenas reaccionan, el cuerpo se orienta, la pinza se abre;
//            primer plano anatómico (dáctilo, émbolo, cavidad) y chasquido a velocidad real.
//  4 (20–30) CAVITACIÓN: reconstrucción en cámara ultralenta del chorro, la caída de presión, la burbuja, su
//            crecimiento y su colapso, y la onda de choque.
import {clamp, lerp} from '../../../engine/math';
import {breathe, cam, Cam, PunchWord, SceneOut, shot, toScreen} from '../../../studio2';
import {Shrimp, ShrimpPose} from '../character/Shrimp';
import {BigTitle, Brand, Callout, Label, poseFrom, SciTag, seg, snapOpen, STrack, Vignette, win} from '../components/common';
import {EV} from '../data/timeline';
import {BubbleFX, clawPt, clawTip, FlashFX, JetFX, LowPressure, PreyFish, Reef, ShockFX, StirFX} from '../environment/Reef';

type V = {x: number; y: number};
export const FLOOR = 500;
export const FEET = 96;
/** Encuadre del gancho (fotograma 0) — el final de la escena 8 vuelve exactamente aquí (bucle). */
export const HOOK_CAM: Cam = cam(285, 432, 2.6);
export const HOOK_FISH: V = {x: 425, y: 446};
export const HOOK_TRACK: STrack = [[-1, 'CLAW_OPEN'], [EV.hookSnap, 'SNAPPING'], [2.6, 'TARGETING'], [3.6, 'IDLE']];

/** Chasquido a velocidad (casi) real: chorro, burbuja que vive una fracción, colapso, destello mínimo y onda. */
export function snapFX(t: number, at: number, tip: V, dir: 1 | -1, scale: number, slow = 1, R = 520) {
  const jet = (t - at) / (0.14 * slow);
  const bu = (t - at - 0.03 * slow) / (0.38 * slow);
  const rMax = 32 * scale;
  const r = bu > 0 && bu < 1 ? rMax * Math.pow(Math.sin(Math.PI * Math.pow(bu, 0.75)), 0.7) : 0;
  const col = at + 0.03 * slow + 0.38 * slow;
  const shock = (t - col) / (0.65 * slow);
  const flash = clamp(1 - Math.abs(t - col) / 0.045);
  const c = {x: tip.x + dir * 24 * scale, y: tip.y};
  return (
    <g>
      <JetFX o={tip} dir={dir} u={jet} len={200 * scale} />
      <BubbleFX c={c} r={r} id={`b${Math.round(at * 10)}`} />
      <ShockFX c={c} u={shock} R={R} />
      <StirFX c={c} u={shock * 0.8} R={140 * scale} />
      <FlashFX c={c} k={flash} size={5 * scale} />
    </g>
  );
}
/** Sacudida/pulso de cámara breve en el colapso (motivado por la onda). */
export function shake(c: Cam, t: number, at: number, amp = 1): Cam {
  const u = (t - at) / 0.35;
  if (u < 0 || u > 1) return c;
  const d = (1 - u) * amp;
  return {...c, x: c.x + (Math.sin(t * 90) * 6 * d) / c.zoom, y: c.y + (Math.cos(t * 77) * 5 * d) / c.zoom, zoom: c.zoom * (1 + 0.035 * d * Math.sin(u * Math.PI))};
}
const blurAt = (t: number, at: number) => (t > at - 0.04 && t < at + 0.14 ? 1 - Math.abs(t - at - 0.03) / 0.12 : 0);

// ---------------- ESCENA 1 (0–5) ----------------
export function scene1(t: number): SceneOut {
  const sx = 0;
  const sy = FLOOR - FEET;
  const pose: ShrimpPose = {...poseFrom(HOOK_TRACK, t), open: snapOpen(t, EV.hookSnap, -1), blur: blurAt(t, EV.hookSnap)};
  const tip = clawTip(sx, sy, 1, 1, pose.aim ?? 0);
  const col = EV.hookSnap + 0.03 * 1.15 + 0.38 * 1.15;
  // la presa: se acerca, se sobresalta con la onda y queda aturdida, derivando
  const stun = seg(t, col + 0.15, col + 1.2);
  const fish = {x: HOOK_FISH.x + Math.sin(t * 1.4) * 6 * (1 - stun) + stun * 60, y: HOOK_FISH.y + Math.sin(t * 2.1) * 4 + stun * stun * 34};
  let c: Cam = t < 3 ? HOOK_CAM : shot(t, 3, 5, HOOK_CAM, cam(-50, 395, 1.42), 'cine');
  c = shake(breathe(c, t, 0.35), t, col, 1.2);
  return {
    svg: (
      <Reef cam={c} t={t} floorY={FLOOR}>
        <PreyFish x={fish.x} y={fish.y} t={t} scale={0.55} dir={-1} stun={stun} flinch={seg(t, col + 0.05, col + 0.25) * (1 - stun)} />
        <Shrimp pose={pose} x={sx} y={sy} />
        {snapFX(t, EV.hookSnap, tip, 1, 1, 1.15, 560)}
      </Reef>
    ),
    overlay: (
      <>
        <Vignette k={0.55} />
        <PunchWord text="¡DISPARA SIN BALAS!" k={win(t, col - 0.05, 4.85, 0.25)} top={250} size={88} />
        <SciTag k={win(t, 0.6, 2.6, 0.2)} text="CÁMARA LENTA" />
      </>
    ),
  };
}

// ---------------- ESCENA 2 (5–12) ----------------
const TRACK2: STrack = [[5, 'WALKING'], [8.6, 'IDLE'], [10.4, 'EXPLORING'], [11.4, 'IDLE']];
export function scene2(t: number): SceneOut {
  const p = poseFrom(TRACK2, t);
  const sx = -430 + p.dist;
  const sy = FLOOR - FEET;
  const wide = cam(sx + 20, 380, 1.45);
  const legs = cam(sx - 50, 455, 2.25);
  const claws = cam(sx + 175, 430, 1.85);
  let c: Cam;
  if (t < 6.8) c = wide;
  else if (t < 8.8) c = shot(t, 6.8, 7.4, wide, legs, 'inOut');
  else c = shot(t, 8.8, 9.6, cam(sx - 50, 455, 2.25), claws, 'cine');
  c = breathe(c, t, 0.4);
  const big = toScreen(c, ...xy(clawPt(sx, sy, 1, 1, p.aim ?? 0, 60, -6)));
  const small = toScreen(c, sx + (34 + 62 + 40) * 1, sy + 34 + 18);
  const kc = win(t, 9.4, 11.9, 0.3);
  return {
    svg: (
      <Reef cam={c} t={t} floorY={FLOOR}>
        <Shrimp pose={p} x={sx} y={sy} />
      </Reef>
    ),
    overlay: (
      <>
        <Vignette k={0.5} />
        <Brand k={win(t, 5.2, 8.5)} />
        <Label x={toScreen(c, sx - 40, FLOOR - 20).x} y={toScreen(c, sx - 40, FLOOR - 20).y} tx={330} ty={500} text="5 PARES DE PATAS" k={win(t, 7.3, 8.8, 0.25)} color="#ffe0b0" />
        <Callout x={big.x} y={big.y} tx={big.x - 60} ty={big.y - 300} text="PINZA MAYOR" k={kc} />
        <Callout x={small.x} y={small.y} tx={small.x - 120} ty={small.y + 240} text="PINZA MENOR" k={win(t, 9.9, 11.9, 0.3)} />
      </>
    ),
  };
}
const xy = (v: V): [number, number] => [v.x, v.y];

// ---------------- ESCENA 3 (12–20) ----------------
const TRACK3: STrack = [[12, 'IDLE'], [12.7, 'TARGETING'], [EV.clawOpen3, 'CLAW_OPEN'], [EV.snap3, 'SNAPPING'], [19.2, 'TARGETING']];
export function scene3(t: number): SceneOut {
  const sx = 0;
  const sy = FLOOR - FEET;
  const base = poseFrom(TRACK3, t);
  // el cuerpo se orienta hacia la presa (giro leve) y las antenas la siguen
  const turn = -0.06 * seg(t, 12.8, 13.8);
  const pose: ShrimpPose = {...base, open: t < EV.snap3 ? Math.max(base.open ?? 0, snapOpen(t, EV.snap3, EV.clawOpen3)) : snapOpen(t, EV.snap3, EV.clawOpen3), blur: blurAt(t, EV.snap3), antenna: lerp(-0.3, -0.12, seg(t, 12.6, 13.6)) + Math.sin(t * 2.2) * 0.05};
  const fx = lerp(980, 470, seg(t, 12, 14.6)) + Math.sin(t * 1.3) * 8;
  const fy = 420 + Math.sin(t * 1.7) * 10 + seg(t, EV.snap3 + 0.15, EV.snap3 + 0.6) * -90;
  const flee = seg(t, EV.snap3 + 0.2, 19.6);
  const tip = clawTip(sx, sy, 1, 1, pose.aim ?? 0, turn);
  const med = cam(170, 390, 1.4);
  const front = cam(200, 400, 1.75);
  const anat = cam(205, 420, 3.1);
  let c: Cam;
  if (t < 14.2) c = shot(t, 12, 14.2, cam(170, 380, 1.3), med, 'inOut');
  else if (t < 16.1) c = shot(t, 14.2, 15.0, med, front, 'cine');
  else c = shot(t, 16.1, 16.8, front, anat, 'cine');
  const col = EV.snap3 + 0.03 * 0.7 + 0.38 * 0.7;
  c = shake(breathe(c, t, 0.35), t, col, 1);
  const P = (px: number, py: number) => toScreen(c, ...xy(clawPt(sx, sy, 1, 1, pose.aim ?? 0, px, py, turn)));
  const dact = P(118, -46);
  const plunger = P(128, -26);
  const socket = P(128, 4);
  const kA = win(t, 16.7, EV.snap3 - 0.1, 0.3);
  return {
    svg: (
      <Reef cam={c} t={t} floorY={FLOOR}>
        <PreyFish x={fx + flee * 500} y={fy} t={t} scale={0.55} dir={-1} flinch={seg(t, EV.snap3 + 0.1, EV.snap3 + 0.3)} />
        <Shrimp pose={pose} x={sx} y={sy} angle={turn} />
        {snapFX(t, EV.snap3, tip, 1, 1, 0.7, 420)}
      </Reef>
    ),
    overlay: (
      <>
        <Vignette k={0.5} />
        <Label x={toScreen(c, 60, 300).x} y={toScreen(c, 60, 300).y} tx={300} ty={560} text="LAS ANTENAS DETECTAN" k={win(t, 12.9, 14.4, 0.25)} color="#ffe0b0" />
        <Label x={dact.x} y={dact.y} tx={dact.x - 160} ty={dact.y - 260} text="DEDO MÓVIL" k={kA} />
        <Label x={plunger.x} y={plunger.y} tx={plunger.x + 150} ty={plunger.y - 380} text="ÉMBOLO" k={win(t, 17.0, EV.snap3 - 0.1, 0.3)} color="#ffe0b0" />
        <Label x={socket.x} y={socket.y} tx={socket.x + 60} ty={socket.y + 260} text="CAVIDAD" k={win(t, 17.3, EV.snap3 - 0.1, 0.3)} />
        <BigTitle k={win(t, EV.snap3 + 0.15, 19.9, 0.2)} lines={['¡CHORRO DE AGUA!']} top={330} size={70} />
      </>
    ),
  };
}

// ---------------- ESCENA 4 (20–30) · CÁMARA ULTRALENTA ----------------
export function scene4(t: number): SceneOut {
  const sx = 0;
  const sy = FLOOR - FEET;
  const [c0, c1] = EV.slowClose;
  const closeU = clamp((t - c0) / (c1 - c0));
  const pose: ShrimpPose = {...poseFrom([[20, 'CLAW_OPEN']], t), open: 1 - closeU * closeU, blur: t > c0 + 0.6 && t < c1 + 0.3 ? 0.6 * win(t, c0 + 0.6, c1 + 0.3, 0.3) : 0, alert: 1, swim: 0.4};
  const tip = clawTip(sx, sy, 1, 1, pose.aim ?? 0);
  const bc = {x: tip.x + 48, y: tip.y};
  const rMax = 40;
  const grow = seg(t, EV.bubbleForm, EV.bubbleMax);
  const coll = clamp((t - (EV.collapse4 - 0.6)) / 0.6);
  const r = t < EV.bubbleForm ? 0 : t < EV.collapse4 - 0.6 ? rMax * Math.pow(grow, 0.6) * (1 + Math.sin(t * 5) * 0.02 * grow) : rMax * Math.pow(1 - coll, 0.45);
  const jetU = t < EV.collapse4 ? clamp((t - EV.jet) / 1.2) : 1 + (t - EV.collapse4) / 1.2;
  const shockU = (t - EV.collapse4) / 2.4;
  const flash = clamp(1 - Math.abs(t - EV.collapse4) / 0.06);
  let c: Cam;
  if (t < 22.2) c = shot(t, 20, 22.2, cam(200, 420, 2.8), cam(225, 430, 3.0), 'inOut');
  else if (t < EV.collapse4) c = shot(t, 22.2, 24.6, cam(225, 430, 3.0), cam(bc.x - 30, bc.y - 10, 3.9), 'cine');
  else c = shot(t, EV.collapse4 + 0.2, 29.2, cam(bc.x - 30, bc.y - 10, 3.9), cam(bc.x - 60, bc.y - 40, 1.35), 'cine');
  c = shake(breathe(c, t, 0.25), t, EV.collapse4, 0.8);
  const S = (v: V) => toScreen(c, v.x, v.y);
  const bS = S(bc);
  const rS = r * c.zoom;
  return {
    svg: (
      <Reef cam={c} t={t} floorY={FLOOR} dim={0.55} front={false}>
        {/* retícula técnica discreta */}
        <g opacity={0.12}>
          {Array.from({length: 14}, (_, i) => <path key={i} d={`M${-200 + i * 50},250 L${-200 + i * 50},560`} stroke="#9ff4ff" strokeWidth={0.6} />)}
          {Array.from({length: 7}, (_, i) => <path key={`h${i}`} d={`M-200,${250 + i * 50} L500,${250 + i * 50}`} stroke="#9ff4ff" strokeWidth={0.6} />)}
        </g>
        <Shrimp pose={pose} x={sx} y={sy} />
        <JetFX o={tip} dir={1} u={jetU} len={170} />
        <LowPressure c={bc} r={46} k={win(t, EV.jet + 0.4, EV.bubbleMax, 0.5) * 0.9} />
        <BubbleFX c={bc} r={r} id="b4" squash={coll * 0.4} />
        <ShockFX c={bc} u={shockU} R={900} sw={2.4 / c.zoom} />
        <StirFX c={bc} u={shockU * 1.2} R={180} n={26} pr={2.2 / c.zoom} />
        <FlashFX c={bc} k={flash * 0.8} size={3} />
      </Reef>
    ),
    overlay: (
      <>
        <Vignette k={0.6} />
        <SciTag k={win(t, 20.1, 29.8, 0.3)} />
        <Label x={S(clawPt(sx, sy, 1, 1, pose.aim ?? 0, 130, -40)).x} y={S(clawPt(sx, sy, 1, 1, pose.aim ?? 0, 130, -40)).y} tx={420} ty={560} text="LA PINZA SE CIERRA" k={win(t, 20.4, 22.2, 0.3)} color="#ffe0b0" />
        <Label x={S({x: tip.x + 60, y: tip.y + 14}).x} y={S({x: tip.x + 60, y: tip.y + 14}).y} tx={760} ty={1290} text="CHORRO DE AGUA" k={win(t, 22.2, 23.6, 0.3)} />
        <Label x={bS.x} y={bS.y + 30} tx={300} ty={1290} text="BAJA PRESIÓN" k={win(t, 23.0, 24.4, 0.3)} color="#a8c0ff" />
        <BigTitle k={win(t, 23.6, 26.2, 0.3)} lines={['CAVITACIÓN']} top={300} size={92} />
        <Label x={bS.x + rS * 0.7} y={bS.y - rS * 0.7} tx={850} ty={620} text="BURBUJA" k={win(t, 24.2, EV.collapse4 - 0.4, 0.3)} />
        <BigTitle k={win(t, EV.collapse4 - 0.5, EV.collapse4 + 0.7, 0.2)} lines={['COLAPSA']} top={1240} size={64} />
        <BigTitle k={win(t, EV.collapse4 + 0.5, 29.8, 0.3)} lines={['ONDA DE CHOQUE']} top={300} size={80} />
      </>
    ),
  };
}
