import { useThree } from '@react-three/fiber';
import React, { useLayoutEffect } from 'react';
import * as THREE from 'three';
import { Seabed } from '../environment/seabed';
import { easeInOutCubic, easeOutCubic, progress } from '../math/easing';
import { lerp, noise1 } from '../math/noise';
import { Shot, ShotFrame } from './shots';

export type Subject = {
  poseAt: (t: number) => { position: THREE.Vector3; yaw: number };
};

const DEG = Math.PI / 180;

export const activeShot = (shots: Shot[], t: number) =>
  shots.find((s) => t >= s.start && t < s.end) ?? shots[shots.length - 1];

const mixFrame = (a: ShotFrame, b: ShotFrame, k: number): Required<ShotFrame> => {
  const ta = a.target ?? [0, 0, 0];
  const tb = b.target ?? [0, 0, 0];
  return {
    azimuth: lerp(a.azimuth, b.azimuth, k),
    elevation: lerp(a.elevation, b.elevation, k),
    distance: lerp(a.distance, b.distance, k),
    fov: lerp(a.fov, b.fov, k),
    target: [lerp(ta[0], tb[0], k), lerp(ta[1], tb[1], k), lerp(ta[2], tb[2], k)],
    roll: lerp(a.roll ?? 0, b.roll ?? 0, k),
  };
};

/**
 * Seguimiento suavizado sin estado: promedio de la pose del sujeto
 * en una ventana de tiempo pasada (equivale a una cámara con inercia).
 */
const smoothedSubject = (subject: Subject, t: number, lag: number) => {
  const pos = new THREE.Vector3();
  let sx = 0;
  let cz = 0;
  const N = 12;
  let wsum = 0;
  for (let i = 0; i < N; i++) {
    const w = 1 - i / N;
    const p = subject.poseAt(Math.max(0, t - (i / (N - 1)) * lag));
    pos.addScaledVector(p.position, w);
    sx += Math.sin(p.yaw) * w;
    cz += Math.cos(p.yaw) * w;
    wsum += w;
  }
  pos.multiplyScalar(1 / wsum);
  return { pos, yaw: Math.atan2(sx, cz) };
};

export const computeCamera = (shots: Shot[], subject: Subject, seabed: Seabed, t: number) => {
  const shot = activeShot(shots, t);
  const raw = progress(t, shot.start, shot.end);
  const k = shot.ease === 'linear' ? raw : shot.ease === 'out' ? easeOutCubic(raw) : easeInOutCubic(raw);
  const f = mixFrame(shot.from, shot.to, k);
  const { pos, yaw } = smoothedSubject(subject, t, shot.lag ?? 0.8);

  const fwd = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const left = new THREE.Vector3(fwd.z, 0, -fwd.x);
  const target = pos
    .clone()
    .addScaledVector(left, f.target[0])
    .addScaledVector(fwd, f.target[2]);
  target.y += f.target[1];

  const az = yaw + f.azimuth * DEG;
  const el = f.elevation * DEG;
  const camPos = new THREE.Vector3(
    target.x + Math.sin(az) * Math.cos(el) * f.distance,
    target.y + Math.sin(el) * f.distance,
    target.z + Math.cos(az) * Math.cos(el) * f.distance,
  );

  // Cámara en mano: ruido orgánico de baja frecuencia.
  const hh = shot.handheld ?? 0.3;
  camPos.x += noise1(t * 0.7, 101) * 0.012 * hh;
  camPos.y += noise1(t * 0.9, 102) * 0.01 * hh;
  camPos.z += noise1(t * 0.6, 103) * 0.012 * hh;
  target.x += noise1(t * 1.1, 104) * 0.006 * hh;
  target.y += noise1(t * 1.3, 105) * 0.005 * hh;

  // Nunca atravesar el fondo ni las rocas.
  const floor = seabed.height(camPos.x, camPos.z) + 0.1;
  if (camPos.y < floor) camPos.y = floor;

  return { position: camPos, target, fov: f.fov, roll: f.roll * DEG + noise1(t * 0.5, 106) * 0.004 * hh, shot };
};

/** Aplica la cámara calculada a la cámara activa de R3F. */
export const CinematicCamera: React.FC<{
  shots: Shot[];
  subject: Subject;
  seabed: Seabed;
  time: number;
}> = ({ shots, subject, seabed, time }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    const c = computeCamera(shots, subject, seabed, time);
    camera.position.copy(c.position);
    camera.up.set(0, 1, 0);
    camera.lookAt(c.target);
    camera.rotateZ(c.roll);
    camera.fov = c.fov;
    camera.near = 0.02;
    camera.far = 200;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }, [camera, shots, subject, seabed, time]);
  return null;
};
