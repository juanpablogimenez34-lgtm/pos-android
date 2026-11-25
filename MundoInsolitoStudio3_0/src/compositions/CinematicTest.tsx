// PRUEBA CINEMATOGRÁFICA (15 s): personaje completo + bosque inundado + luz + sombras + partículas + cámara.
//  0–4 s   plano general: el delfín avanza entre dos troncos bajo los haces de luz; la cámara retrocede (travelling).
//  4–8 s   órbita: se detiene a explorar una raíz; el cuello flexible gira la cabeza, las aletas maniobran.
//  8–11 s  contrapicado: detecta el cardumen y acelera junto a la cámara; los peces se dispersan.
//  11–15 s plano heroico: asciende hacia la luz de la superficie (ventana de Snell), contraluz dorado.
import React from 'react';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {IniaDolphin} from '../characters/inia/IniaDolphin';
import {IniaPose, L, restPose} from '../characters/inia/model';
import {River, RootSpec, SURF, TreeSpec} from '../environments/River';
import {clamp, smooth} from '../lib/noise';

type V3 = [number, number, number];
const cr = (p0: number, p1: number, p2: number, p3: number, u: number) => 0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
function spline(keys: [number, ...V3][], t: number): V3 {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2], keys[0][3]];
  const n = keys.length;
  if (t >= keys[n - 1][0]) return [keys[n - 1][1], keys[n - 1][2], keys[n - 1][3]];
  let i = 0;
  while (i < n - 2 && t > keys[i + 1][0]) i++;
  const k0 = keys[Math.max(0, i - 1)];
  const k1 = keys[i];
  const k2 = keys[i + 1];
  const k3 = keys[Math.min(n - 1, i + 2)];
  const u = clamp((t - k1[0]) / (k2[0] - k1[0]));
  return [1, 2, 3].map((j) => cr(k0[j], k1[j], k2[j], k3[j], u)) as V3;
}
// trayectoria del cuerpo (raíz del esqueleto) — avanza hacia la cámara, se detiene en la raíz, acelera y asciende
const PATH: [number, ...V3][] = [
  [0, -0.8, -0.2, -9.0], [2, -0.4, -0.35, -6.3], [4, 0.25, -0.45, -3.9], [5.5, 0.55, -0.5, -3.3], [8, 0.7, -0.45, -3.0], [9.5, 1.6, -0.3, -1.4], [11, 2.0, 0.2, 0.4], [13, 1.6, 1.4, 1.2], [15, 1.1, 2.6, 1.6],
];
// cámara: posición y objetivo
// dos planos: travelling + órbita (0–8,5 s) y, tras un corte motivado por la aceleración, contrapicado → plano heroico
const CAM_A: [number, ...V3][] = [[0, 0.6, 0.35, -1.6], [4, 0.6, 0.25, -0.8], [5.5, -0.7, 0.1, -1.7], [8, -0.9, -0.05, -4.3], [8.5, -0.95, -0.08, -4.6]];
const CAM_B: [number, ...V3][] = [[8.5, 3.0, -0.85, -0.9], [11, 3.1, -0.9, 2.4], [13, 2.6, -0.9, 3.8], [15, 2.3, -0.8, 4.2]];

const TREES: TreeSpec[] = [
  {x: -1.6, z: -5.2, r: 0.34, seed: 3}, {x: 1.5, z: -5.8, r: 0.42, seed: 7}, {x: -3.4, z: -9.5, r: 0.5, seed: 11}, {x: 3.4, z: -10, r: 0.46, seed: 13},
  {x: 1.6, z: -2.4, r: 0.3, seed: 5}, {x: -2.6, z: -1.2, r: 0.38, seed: 17}, {x: 4.2, z: -3.6, r: 0.36, seed: 19}, {x: -0.6, z: -13, r: 0.6, seed: 23}, {x: 5.4, z: 3.6, r: 0.32, seed: 29},
];
const ROOTS: RootSpec[] = [
  {pts: [[1.6, -1.2, -2.0], [1.2, -0.55, -2.7], [0.6, -0.75, -3.4], [0.1, -1.25, -3.9]], r: 0.075},
  {pts: [[-1.6, -1.2, -4.8], [-0.9, -0.5, -4.4], [-0.1, -0.85, -4.6], [0.5, -1.25, -4.3]], r: 0.06},
  {pts: [[2.6, -1.3, 0.2], [2.0, -0.7, -0.4], [1.3, -0.95, -0.7], [0.9, -1.32, -0.9]], r: 0.05},
];

export const CinematicTest: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const {width, height} = useVideoConfig();
  const p = spline(PATH, t);
  const p2 = spline(PATH, t + 1 / 30);
  const v = [(p2[0] - p[0]) * 30, (p2[1] - p[1]) * 30, (p2[2] - p[2]) * 30];
  const speed = Math.hypot(v[0], v[1], v[2]);
  const heading = Math.atan2(v[2], v[0]);
  const pitch = Math.atan2(v[1], Math.hypot(v[0], v[2]) + 0.05);
  // rumbo suavizado (evita giros bruscos cuando la velocidad es casi nula durante la exploración)
  const hPrev = (() => {
    const a = spline(PATH, t - 0.25);
    const b = spline(PATH, t - 0.25 + 1 / 30);
    return Math.atan2(b[2] - a[2], b[0] - a[0]);
  })();
  const turn = Math.atan2(Math.sin(heading - hPrev), Math.cos(heading - hPrev)) / 0.25;
  const explore = smooth(4.6, 5.4, t) * (1 - smooth(7.6, 8.4, t));
  const rate = 0.35 + speed * 0.75;
  const pose: IniaPose = {
    ...restPose(),
    phase: phaseInt(t),
    amp: clamp(0.25 + speed * 0.55, 0.15, 1.3) * (1 - explore * 0.6),
    headYaw: explore * Math.sin((t - 4.6) * 1.6) * 0.95 + clamp(turn * 0.2, -0.5, 0.5),
    headPitch: explore * 0.22,
    bend: clamp(turn * 0.25, -0.6, 0.6),
    roll: -clamp(turn * 0.15, -0.4, 0.4),
    jaw: explore * smooth(6.2, 6.6, t) * (1 - smooth(6.9, 7.3, t)) * 0.35,
    flipL: [0.2 * explore + Math.sin(t * 2.1) * 0.1 * explore, -0.2 * explore, 0.5 * explore],
    flipR: [0.2 * explore + Math.sin(t * 2.1 + 1) * 0.1 * explore, -0.2 * explore, 0.5 * explore],
    eyeYaw: explore * Math.sin((t - 4.6) * 1.6),
  };
  void rate;
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -heading, pitch, 'YZX'));
  const cpos = t < 8.5 ? spline(CAM_A, t) : spline(CAM_B, t);
  const look: V3 = [p[0] + Math.cos(heading) * 0.42 * L * 0.6, p[1] + 0.05, p[2] + Math.sin(heading) * 0.42 * L * 0.6];
  return (
    <AbsoluteFill style={{background: '#101408'}}>
      <ThreeCanvas width={width} height={height} shadows gl={{antialias: true}} camera={{fov: 42, position: cpos, near: 0.05, far: 300}} onCreated={({gl}) => {gl.toneMapping = 7; gl.toneMappingExposure = 1.1;}}>
        <Aim pos={cpos} target={look} fov={42 + smooth(9.5, 13, t) * 8} />
        <River t={t} trees={TREES} roots={ROOTS} murk={0.18} fish={[{n: 34, center: [1.3, -0.35, -2.1], radius: 0.6, scare: smooth(9.2, 10.2, t), threat: [p[0], p[1], p[2]]}, {n: 18, center: [-1.8, 0.6, -6.5], radius: 0.8}]} />
        <group position={p} quaternion={q}>
          <IniaDolphin pose={pose} wet={0.5} />
        </group>
      </ThreeCanvas>
      {/* gradación: viñeta y calidez del plano heroico */}
      <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse 90% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(4,8,2,0.75) 100%)'}} />
      <AbsoluteFill style={{pointerEvents: 'none', background: 'linear-gradient(rgba(255,210,120,0.0), rgba(255,200,110,0.16))', opacity: smooth(11, 13, t), mixBlendMode: 'soft-light'}} />
      <div style={{position: 'absolute', left: 60, top: 70, fontFamily: 'sans-serif', color: '#f6f0dc', textShadow: '0 2px 6px #000', opacity: 0.8}}>
        <div style={{fontSize: 30, fontWeight: 800, letterSpacing: 3}}>PRUEBA CINEMATOGRÁFICA</div>
        <div style={{fontSize: 22, opacity: 0.8, marginTop: 6}}>Inia geoffrensis · bosque inundado · Studio 3.0</div>
      </div>
    </AbsoluteFill>
  );
};

/** Fase del batido integrada (la frecuencia sigue a la velocidad). */
function phaseInt(t: number) {
  let ph = 0;
  const dt = 1 / 60;
  for (let s = 0; s < t; s += dt) {
    const a = spline(PATH, s);
    const b = spline(PATH, s + dt);
    const sp = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / dt;
    ph += (0.35 + sp * 0.75) * Math.PI * 2 * Math.min(dt, t - s);
  }
  return ph;
}

const Aim: React.FC<{pos: V3; target: V3; fov: number}> = ({pos, target, fov}) => {
  const {camera} = useThree();
  camera.position.set(...pos);
  camera.lookAt(...target);
  (camera as THREE.PerspectiveCamera).fov = fov;
  camera.updateProjectionMatrix();
  return null;
};
export const _surf = SURF;
