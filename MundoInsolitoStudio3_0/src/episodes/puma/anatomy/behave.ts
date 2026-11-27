// COMPORTAMIENTO: convierte la locomoción precalculada y los estados en una pose completa del puma.
// Estados: REPOSO, RESPIRACIÓN, ALERTA, CAMINAR, TROTAR, CORRER, ESPRINTAR, ACECHAR, AGAZAPARSE, PREPARAR SALTO,
// SALTAR, ATERRIZAR, TREPAR, MIRAR, BEBER, ASEO, CAZAR, JUEGO DE CACHORRO.
// La animación secundaria (respiración, parpadeo, orejas, mirada, cola y ajustes de postura) se añade siempre.
import * as THREE from 'three';
import {clamp, hash, lerp, noise2, smooth} from '../../../lib/noise';
import {basePose, Gait, LEGS, Locomotion, Pose, Species} from './rig';

export type PumaState =
  | 'RESTING' | 'BREATHING' | 'ALERT' | 'WALKING' | 'TROTTING' | 'RUNNING' | 'SPRINTING' | 'STALKING' | 'CROUCHING'
  | 'JUMP_PREPARATION' | 'JUMPING' | 'LANDING' | 'CLIMBING' | 'LOOKING_AROUND' | 'DRINKING' | 'GROOMING' | 'HUNTING' | 'CUB_PLAYING';

/** Parpadeo natural: cada 2,5–5,5 s (determinista por semilla), cierre de ≈ 0,22 s. */
export function blinkAt(t: number, seed = 1) {
  let acc = 0.7 + hash(seed) * 1.5;
  let i = 0;
  while (acc < t + 1) {
    const d = t - acc;
    if (d >= 0 && d < 0.22) return Math.sin((d / 0.22) * Math.PI);
    acc += 2.5 + hash(seed * 13 + i++) * 3;
  }
  return 0;
}
/** Respiración (0…1): periodo según el esfuerzo. */
export const breathAt = (t: number, period = 3.2) => 0.5 + 0.5 * Math.sin((t / period) * Math.PI * 2);
/** Movimiento de orejas: pequeñas rotaciones con giros rápidos ocasionales (escucha). */
export function earsAt(t: number, alert: number, seed = 3) {
  const twitch = (s: number) => {
    const n = noise2(t * 0.7, s);
    return n > 0.72 ? -smooth(0.72, 0.8, n) * 0.6 : 0;
  };
  return {earL: lerp(0.2, 0.9, alert) + (noise2(t * 0.5, seed) - 0.5) * 0.25 + twitch(seed + 10), earR: lerp(0.2, 0.9, alert) + (noise2(t * 0.5, seed + 4) - 0.5) * 0.25 + twitch(seed + 20)};
}

export type LocoOpts = {
  sp: Species;
  loco: Locomotion;
  t: number;
  crouch?: number; // acecho: cuerpo bajo
  alert?: number;
  look?: number; // giro de cabeza adicional (rad)
  lookPitch?: number;
  ground?: (x: number, z: number) => number;
  seed?: number;
  breathPeriod?: number;
  tailMood?: number; // 0 tranquila … 1 tensa (acecho: punta que se agita)
};

/** Pose completa a partir de la locomoción (caminar, acechar, trotar, galopar) con animación secundaria. */
export function locoPose(o: LocoOpts): Pose {
  const {sp, loco, t} = o;
  const st = loco.at(t);
  const P = basePose();
  const crouch = o.crouch ?? 0;
  const gnd = o.ground ?? (() => 0);
  const g: Gait = (Object.keys(st.gaitBlend) as Gait[]).find((k) => st.gaitBlend[k] > 0.5) ?? 'walk';
  const ph = st.phase;
  const sc = sp.hipH / 0.58;
  // raíz: punto del recorrido a la distancia D; altura = terreno medio bajo los pies + altura de cadera
  const legs = st.legs;
  let gy = 0;
  for (const id of LEGS) gy += legs[id].contact > 0.5 ? legs[id].target.y : gnd(legs[id].target.x, legs[id].target.z);
  gy /= 4;
  const hindY = (legs.LH.target.y + legs.RH.target.y) * 0.5;
  const foreY = (legs.LF.target.y + legs.RF.target.y) * 0.5;
  // ondulación vertical y flexión de columna según la marcha
  let flex = 0;
  let pitch = 0;
  let bob = st.bob;
  let roll = 0;
  if (g === 'gallop') {
    flex = Math.cos(Math.PI * 2 * (ph - 0.95)) * 0.85 * smooth(1.0, 3.0, st.speed);
    pitch = Math.sin(Math.PI * 2 * (ph - 0.2)) * 0.09;
    bob = (Math.cos(Math.PI * 2 * (ph - 0.45)) * 0.5 + 0.5) * 0.06 * sc - 0.03 * sc;
  } else if (g === 'trot') {
    flex = Math.sin(Math.PI * 4 * ph) * 0.08;
    roll = Math.sin(Math.PI * 2 * ph) * 0.03;
  } else {
    // caminar/acechar: la cadera rueda y la columna se curva levemente con cada paso
    roll = Math.sin(Math.PI * 2 * ph) * 0.035 * smooth(0, 0.5, st.speed);
    flex = Math.sin(Math.PI * 4 * ph + 0.6) * 0.05 * smooth(0, 0.5, st.speed);
  }
  // cabeceo del cuerpo por desnivel (pies delanteros más altos → morro arriba)
  pitch += Math.atan2(foreY - hindY, sp.torso) * 0.9;
  const hipH = sp.hipH * (1 - crouch * 0.42);
  const pos = new THREE.Vector3();
  {
    // la raíz sigue el recorrido; se toma de la propia locomoción a través del objetivo medio de las patas traseras
    const mid = legs.LH.target.clone().add(legs.RH.target).multiplyScalar(0.5);
    void mid;
  }
  P.heading = st.heading;
  const fwd = new THREE.Vector3(Math.cos(st.heading), 0, -Math.sin(st.heading));
  void fwd;
  pos.set(0, 0, 0);
  P.root = pos; // se completa abajo con el recorrido
  P.pitch = pitch;
  P.roll = roll;
  P.flex = flex + crouch * 0.15;
  P.crouch = crouch;
  P.legs = legs;
  // cuello y cabeza: estabilización (la cabeza contrarresta el cabeceo) + mirada
  const alert = o.alert ?? 0;
  P.neckPitch = -crouch * 0.25 + alert * 0.12 - (g === 'gallop' ? 0.15 : 0) + Math.sin(Math.PI * 4 * ph) * (g === 'walk' ? 0.03 : 0.01);
  P.headPitch = -pitch * 0.8 - P.neckPitch * 0.4 + (o.lookPitch ?? 0) + crouch * 0.18;
  P.headYaw = (o.look ?? 0) * 0.55;
  P.neckYaw = (o.look ?? 0) * 0.45;
  P.eyeYaw = (o.look ?? 0) * 0.4;
  P.blink = blinkAt(t, o.seed ?? 1) * (1 - alert * 0.5);
  const ears = earsAt(t, Math.max(alert, crouch), o.seed ?? 3);
  P.earL = ears.earL;
  P.earR = ears.earR;
  P.breathe = breathAt(t, o.breathPeriod ?? (g === 'gallop' ? 0.7 : g === 'trot' ? 1.4 : 2.6));
  // cola: baja y curvada al caminar; horizontal y contrapeso al correr; punta que se agita al acechar
  const mood = o.tailMood ?? crouch;
  if (g === 'gallop') {
    P.tailBase = -0.25 + Math.sin(Math.PI * 2 * ph) * 0.15;
    P.tailCurl = 0.35 + Math.sin(Math.PI * 2 * (ph - 0.3)) * 0.3;
    P.tailAmp = 0.12;
  } else {
    P.tailBase = lerp(-1.0, -0.55, mood) + Math.sin(Math.PI * 2 * ph) * 0.05;
    P.tailCurl = lerp(1.25, 0.6, mood);
    P.tailAmp = 0.12 + mood * 0.1;
  }
  P.tailWave = t * (1.6 + mood * 3) + ph * Math.PI * 2 * 0.5;
  return Object.assign(P, {_y: gy + hipH + bob, _D: st.D});
}

/** Completa la raíz de una pose de locomoción con el recorrido (path) usado por la locomoción. */
export function placeOnPath(P: Pose & {_y?: number; _D?: number}, path: (D: number) => {x: number; z: number; heading: number}) {
  const w = path(P._D ?? 0);
  P.root = new THREE.Vector3(w.x, P._y ?? 0, w.z);
  return P;
}

/** Mezcla de dos poses (estados): interpola raíz, ángulos y objetivos de las patas. */
export function blendPose(A: Pose, B: Pose, k: number): Pose {
  const u = clamp(k);
  if (u <= 0) return A;
  if (u >= 1) return B;
  const P = basePose();
  const keys = ['heading', 'pitch', 'roll', 'flex', 'bend', 'breathe', 'neckPitch', 'neckYaw', 'headPitch', 'headYaw', 'headRoll', 'jaw', 'blink', 'eyeYaw', 'earL', 'earR', 'tailBase', 'tailCurl', 'tailWave', 'tailAmp', 'crouch'] as const;
  for (const key of keys) {
    let a = A[key];
    const b = B[key];
    if (key === 'heading') {
      let d = b - a;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      a = a + d * u;
      P[key] = a;
      continue;
    }
    P[key] = lerp(a, b, u);
  }
  P.root = A.root.clone().lerp(B.root, u);
  for (const id of LEGS) {
    const la = A.legs[id];
    const lb = B.legs[id];
    P.legs[id] = {target: la.target.clone().lerp(lb.target, u), lift: lerp(la.lift, lb.lift, u), pawPitch: lerp(la.pawPitch, lb.pawPitch, u), contact: lerp(la.contact, lb.contact, u)};
  }
  return P;
}

/** Secundarios sobre una pose estática (reposo, alerta, mirar alrededor). */
export function idleSecondary(P: Pose, t: number, o: {alert?: number; look?: number; seed?: number; breath?: number} = {}) {
  const alert = o.alert ?? 0;
  P.breathe = breathAt(t, o.breath ?? 3.2);
  P.blink = blinkAt(t, o.seed ?? 1) * (1 - alert * 0.4);
  const e = earsAt(t, alert, o.seed ?? 3);
  P.earL = e.earL;
  P.earR = e.earR;
  // micro-ajustes de postura (peso que se desplaza) y respiración que eleva levemente el lomo
  P.root = P.root.clone().add(new THREE.Vector3(0, (P.breathe - 0.5) * 0.004, 0));
  P.roll += (noise2(t * 0.3, 7) - 0.5) * 0.03;
  P.headYaw += (o.look ?? 0) + (noise2(t * 0.4, 9) - 0.5) * 0.12;
  P.headPitch += (noise2(t * 0.35, 11) - 0.5) * 0.06;
  P.eyeYaw = (o.look ?? 0) * 0.8;
  P.tailWave = t * 1.3;
  P.tailAmp = 0.12 + alert * 0.08;
  return P;
}
