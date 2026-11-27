// PRUEBA DE MOVIMIENTO (15 s) antes de producir el documental:
//  0–5 s   CAMINAR de perfil (cámara casi fija: se ve que las almohadillas no deslizan; marcas en el suelo)
//  5–8 s   la cámara orbita a TRES CUARTOS mientras camina; frena
//  8–9 s   ALERTA: mira la roca
//  9–11,6  SALTO en 10 fases sobre la roca
//  11,8–15 CORRER (trote → galope con flexión de columna y suspensión) sobre la roca
import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {Puma} from '../character/Puma';
import {ADULT, solve} from '../character/rig';
import {blendPose, idle, jumpPose, locoPose, makeLocomotion} from '../character/motion';
import {proj, v3, View} from '../character/space';

const ROCK_X0 = 2.1;
const ROCK_Y = 0.42;
const groundA = () => 0;
const groundB = () => ROCK_Y;

function useSetup() {
  return useMemo(() => {
    const sp = ADULT;
    const locoA = makeLocomotion(sp, 0, 8.8, (t) => 0.95 * smoothstep(0.3, 1.3, t) * (1 - smoothstep(7.2, 8.3, t)), () => 'walk', -3.2, groundA);
    const end = locoA.at(8.8);
    const fromX = -3.2 + end.D;
    const J = {t0: 8.8, fromX, toX: fromX + 2.0, fromY: 0, toY: ROCK_Y, apex: 0.55, tLook: 0.5, tPrep: 1.0, tAir: 0.55, tLand: 0.75};
    const tEnd = J.t0 + J.tLook + J.tPrep + J.tAir + J.tLand;
    const locoB = makeLocomotion(sp, tEnd, 15.5, (t) => 6.5 * smoothstep(tEnd + 0.3, tEnd + 2.4, t), (t) => (t < tEnd + 0.9 ? 'walk' : t < tEnd + 1.6 ? 'trot' : 'gallop'), J.toX, groundB);
    return {sp, locoA, locoB, J, tEnd, end};
  }, []);
}

export const PumaMotionTest: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const {sp, locoA, locoB, J, tEnd, end} = useSetup();
  let pose;
  let label = '';
  if (t < 8.8) {
    pose = locoPose(sp, locoA, t, {alert: smoothstep(7.6, 8.6, t), look: -0.0, seed: 2}, -3.2, groundA);
    label = t < 7.4 ? 'CAMINAR (WALKING)' : 'ALERTA (ALERT)';
    if (t > 7.6) pose = idle(pose, t, {alert: smoothstep(7.6, 8.6, t)});
  } else if (t < tEnd) {
    const r = jumpPose(sp, J, t, end.legs ? Object.fromEntries(Object.entries(end.legs).map(([k, v]) => [k, v.target])) as never : undefined);
    pose = r.pose;
    pose.blink = 0;
    const names = ['', 'observa el objetivo', 'baja el cuerpo', 'flexiona las traseras', 'acumula impulso', 'extiende', 'despega', 'columna en vuelo', 'prepara las manos', 'aterriza', 'absorbe el impacto'];
    label = `SALTO ${r.phase}/10 · ${names[r.phase]}`;
    // transición suave desde la alerta
    if (t < 8.95) pose = blendPose(locoPose(sp, locoA, 8.8, {alert: 1}, -3.2, groundA), pose, (t - 8.8) / 0.15);
  } else {
    pose = locoPose(sp, locoB, t, {seed: 4}, J.toX, groundB);
    const g = locoB.at(t).gait;
    label = g === 'gallop' ? 'CORRER (RUNNING) · galope' : g === 'trot' ? 'trote' : 'CAMINAR';
    if (t < tEnd + 0.25) pose = blendPose(jumpPose(sp, J, tEnd - 0.001).pose, pose, (t - tEnd) / 0.25);
  }
  const sk = solve(sp, pose);
  // cámara: orbita de perfil a 3/4 (5–8 s) y vuelve a perfil para el salto y la carrera
  const yaw = lerp(0, 0.62, smoothstep(5, 7.6, t)) * (1 - smoothstep(9.2, 10.4, t)) + 0.12 * smoothstep(9.2, 10.4, t);
  const S = lerp(330, 290, smoothstep(11, 13, t));
  const follow = clamp(t < 4.5 ? -1.6 + t * 0.55 : 1, -10, 100);
  const targetX = t < 4.5 ? lerp(-1.6, pose.root.x + 0.4, smoothstep(2.5, 4.5, t)) : pose.root.x + 0.35;
  void follow;
  const w0: View = {yaw, elev: 0.14, S, ox: 0, oy: 0};
  const tp = proj(v3(targetX, 0.35, 0), w0);
  const view: View = {...w0, ox: 540 - tp.x, oy: 1180 - tp.y};
  // suelo y marcas de referencia (para comprobar que no hay deslizamiento)
  const P = (x: number, y: number, z: number) => proj(v3(x, y, z), view);
  const quad = (pts: {x: number; y: number}[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('') + 'Z';
  const ground = quad([P(-20, 0, -8), P(40, 0, -8), P(40, 0, 8), P(-20, 0, 8)]);
  const rockTop = quad([P(ROCK_X0, ROCK_Y, -1.2), P(40, ROCK_Y, -1.2), P(40, ROCK_Y, 1.2), P(ROCK_X0, ROCK_Y, 1.2)]);
  const rockFront = quad([P(ROCK_X0, 0, 1.2), P(40, 0, 1.2), P(40, ROCK_Y, 1.2), P(ROCK_X0, ROCK_Y, 1.2)]);
  const rockSide = quad([P(ROCK_X0, 0, -1.2), P(ROCK_X0, 0, 1.2), P(ROCK_X0, ROCK_Y, 1.2), P(ROCK_X0, ROCK_Y, -1.2)]);
  const marks: React.ReactNode[] = [];
  for (let i = -20; i < 40; i++) {
    const y = i >= ROCK_X0 * 2 ? ROCK_Y : 0;
    for (const z of [-0.6, 0.6]) {
      const q = P(i * 0.5, y, z);
      marks.push(<ellipse key={`${i}${z}`} cx={q.x} cy={q.y} rx={7} ry={2.5} fill="#5a4a30" opacity={0.6} />);
    }
  }
  // sombra de contacto bajo el cuerpo
  const sh = P(pose.root.x + 0.3, pose.root.x > ROCK_X0 - 0.2 && t > 10.3 ? ROCK_Y : 0, 0);
  const lift = clamp((pose.root.y - (t > 10.3 ? ROCK_Y : 0) - sp.hipH) / 0.6, 0, 1);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#e9c896, #c79a62 55%, #6d6a44)'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <path d={ground} fill="#77703f" />
        {marks}
        <path d={rockSide} fill="#6b6152" stroke="#2e2618" strokeWidth={2} />
        <path d={rockFront} fill="#7d7262" stroke="#2e2618" strokeWidth={2} />
        <path d={rockTop} fill="#a39886" stroke="#2e2618" strokeWidth={2} />
        <ellipse cx={sh.x} cy={sh.y + 4} rx={S * 0.55 * (1 - lift * 0.5)} ry={S * 0.05 * (1 - lift * 0.5)} fill="#1e1a0e" opacity={0.35 * (1 - lift * 0.6)} />
        <Puma sk={sk} view={view} uid="mt" look={{detail: 1}} />
      </svg>
      <div style={{position: 'absolute', top: 90, left: 0, right: 0, textAlign: 'center', fontFamily: 'sans-serif', color: '#2a1c0c'}}>
        <div style={{fontSize: 40, fontWeight: 800}}>PRUEBA DE MOVIMIENTO · PUMA 2.5D</div>
        <div style={{fontSize: 34, marginTop: 10}}>{label}</div>
        <div style={{fontSize: 26, marginTop: 6, opacity: 0.7}}>{t.toFixed(2)} s</div>
      </div>
    </AbsoluteFill>
  );
};
