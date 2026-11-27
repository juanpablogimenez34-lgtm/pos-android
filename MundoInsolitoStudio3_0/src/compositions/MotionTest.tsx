// PRUEBA DE MOVIMIENTO (10 s). Cámara FIJA de 0 a 7,5 s (el movimiento es del animal, no de la cámara), después
// seguimiento suave. Fases: 0–2 lento · 2–4 normal · 4–5,3 aceleración · 5,3–6,9 giro (con alabeo, curvatura del
// tronco, cabeza que anticipa y aletas que reaccionan) · 6,9–8 frenado (aletas desplegadas) · 8–10 cambio de dirección.
// Reacción al entorno: gira antes de un tronco y el cardumen se dispersa a su paso.
import React from 'react';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {IniaDolphin} from '../characters/inia/IniaDolphin';
import {IniaPose, L, restPose} from '../characters/inia/model';
import {River, TreeSpec} from '../environments/River';
import {clamp, smooth} from '../lib/noise';

/** Programa de locomoción: velocidad (m/s), frecuencia del batido (Hz), amplitud y rumbo objetivo (rad). */
function program(t: number) {
  const k = (a: number, b: number) => smooth(a, b, t);
  const speed = 0.32 + 0.4 * k(1.6, 2.6) + 0.62 * k(4.0, 5.0) - 0.45 * k(5.6, 6.6) - 0.6 * k(6.9, 7.8) + 0.55 * k(8.2, 9.2);
  const rate = 0.55 + 0.5 * k(1.6, 2.6) + 0.75 * k(4.0, 5.0) - 0.6 * k(5.6, 6.6) - 0.7 * k(6.9, 7.6) + 0.55 * k(8.1, 8.8);
  const amp = 0.35 + 0.35 * k(1.6, 2.6) + 0.45 * k(4.0, 5.0) - 0.3 * k(5.6, 6.6) - 0.5 * k(6.9, 7.6) + 0.45 * k(8.1, 8.8);
  // rumbo: se aleja de la cámara (−z) → gira 180° rodeando el tronco → vuelve frenando → cambia de dirección (−x)
  const heading = -Math.PI / 2 + Math.PI * k(5.3, 6.9) + (Math.PI / 2) * k(8.0, 9.4);
  return {speed: Math.max(0.12, speed), rate: Math.max(0.12, rate), amp: Math.max(0.06, amp), heading};
}
/** Integración determinista de la trayectoria (posición, fase del batido, velocidad de giro). */
function integrate(t: number) {
  let x = -0.75;
  let z = 0.35;
  let ph = 0;
  const dt = 1 / 60;
  for (let s = 0; s < t; s += dt) {
    const p = program(s);
    const h = dt * Math.min(1, (t - s) / dt);
    x += Math.cos(p.heading) * p.speed * h;
    z += Math.sin(p.heading) * p.speed * h;
    ph += p.rate * Math.PI * 2 * h;
  }
  const p = program(t);
  const turn = (program(t + 0.05).heading - program(t - 0.05).heading) / 0.1; // rad/s
  return {x, z, ph, p, turn};
}

const PHASE = (t: number) => (t < 2 ? 'NATACIÓN LENTA' : t < 4 ? 'NATACIÓN NORMAL' : t < 5.3 ? 'ACELERACIÓN' : t < 6.9 ? 'GIRO' : t < 8 ? 'FRENADO' : 'CAMBIO DE DIRECCIÓN');
const TREES: TreeSpec[] = [{x: 0.25, z: -3.7, r: 0.34, seed: 3}, {x: -3.2, z: -2.0, r: 0.42, seed: 7}, {x: 2.6, z: -5.6, r: 0.5, seed: 11}, {x: 3.2, z: 0.4, r: 0.3, seed: 5}, {x: -2.4, z: -6.5, r: 0.55, seed: 13}];

export const MotionTest: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const {width, height} = useVideoConfig();
  const m = integrate(t);
  const turnK = clamp(m.turn / 2.2, -1, 1);
  const brake = smooth(6.9, 7.3, t) * (1 - smooth(7.8, 8.3, t));
  const pose: IniaPose = {
    ...restPose(),
    phase: m.ph,
    amp: m.p.amp,
    headYaw: turnK * 0.55 + (t > 8 ? Math.sin((t - 8) * 3) * 0.15 * (1 - smooth(9, 10, t)) : 0), // la cabeza anticipa el giro
    bend: turnK * 0.55,
    roll: -turnK * 0.35,
    arch: brake * 0.12,
    // aletas: en el giro la exterior se extiende y la interior se recoge; al frenar ambas se despliegan hacia delante
    flipL: [0.25 * turnK + brake * 0.55, -brake * 0.55 - 0.15 * turnK, brake * 0.9 + Math.sin(m.ph * 0.5) * 0.06],
    flipR: [-0.25 * turnK + brake * 0.55, -brake * 0.55 + 0.15 * turnK, brake * 0.9 + Math.sin(m.ph * 0.5 + 1) * 0.06],
    eyeYaw: turnK,
  };
  // cámara: fija hasta 7,5 s; luego sigue con suavidad
  // cámara elevada en tres cuartos: el recorrido completo cabe en el cuadro vertical
  const fixed: [number, number, number] = [0.15, 2.6, 5.4];
  const aim0: [number, number, number] = [0.15, -0.6, -1.4];
  const follow = smooth(7.5, 8.8, t) * 0.55;
  const camPos: [number, number, number] = [fixed[0] + (m.x - fixed[0]) * follow, fixed[1] - 1.2 * follow, fixed[2] + (m.z + 4.2 - fixed[2]) * follow];
  const target: [number, number, number] = [aim0[0] + (m.x - aim0[0]) * follow, aim0[1], aim0[2] + (m.z - aim0[2]) * follow];
  // posición del cuerpo: la raíz del esqueleto (s = 0,42) sigue la trayectoria
  const head = [m.x + Math.cos(m.p.heading) * 0.42 * L, m.z + Math.sin(m.p.heading) * 0.42 * L];
  return (
    <AbsoluteFill style={{background: '#101408'}}>
      <ThreeCanvas width={width} height={height} shadows gl={{antialias: true}} camera={{fov: 41, position: camPos, near: 0.05, far: 120}} onCreated={({gl}) => {gl.toneMapping = 7; gl.toneMappingExposure = 1.05;}}>
        <Aim pos={camPos} target={target} />
        <River t={t} trees={TREES} roots={[{pts: [[0.6, -1.2, -3.4], [1.3, -0.5, -2.9], [2.1, -0.8, -2.0], [2.6, -1.25, -1.2]], r: 0.08}, {pts: [[-0.2, -1.2, -3.9], [-0.9, -0.6, -3.3], [-1.8, -1.0, -3.0], [-2.4, -1.25, -2.4]], r: 0.06}]} fish={[{n: 24, center: [1.5, -0.45, -1.0], radius: 0.55, scare: smooth(5.8, 6.8, t), threat: [head[0], 0, head[1]]}]} murk={0.2} />
        <IniaDolphin pose={pose} position={[m.x, -0.25, m.z]} rotation={[0, -m.p.heading, 0]} wet={0.5} />
      </ThreeCanvas>
      <div style={{position: 'absolute', left: 60, top: 70, fontFamily: 'sans-serif', color: '#f2eedc', textShadow: '0 2px 6px #000'}}>
        <div style={{fontSize: 34, fontWeight: 800, letterSpacing: 3}}>PRUEBA DE MOVIMIENTO</div>
        <div style={{fontSize: 30, marginTop: 8}}>{PHASE(t)}</div>
        <div style={{fontSize: 24, opacity: 0.75, marginTop: 6}}>{t < 7.5 ? 'CÁMARA FIJA' : 'CÁMARA EN SEGUIMIENTO'} · {m.p.speed.toFixed(2)} m/s · batido {m.p.rate.toFixed(2)} Hz</div>
      </div>
    </AbsoluteFill>
  );
};

const Aim: React.FC<{pos: [number, number, number]; target: [number, number, number]}> = ({pos, target}) => {
  const {camera} = useThree();
  camera.position.set(...pos);
  camera.lookAt(...target);
  return null;
};
