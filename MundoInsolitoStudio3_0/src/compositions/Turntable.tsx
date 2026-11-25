// PRUEBA DE GIRO (10 s): la cámara orbita alrededor del modelo 3D con las luces fijas en el mundo, así que la
// iluminación responde al ángulo. Secuencia: 0–2 s lateral · 2–4 s → tres cuartos · 4–6 s frontal → lado contrario ·
// 6–8 s posterior · 8–10 s regreso a la lateral. Leve movimiento de reposo (respiración de aletas y cola) para
// comprobar que las partes articuladas permanecen unidas.
import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {IniaDolphin} from '../characters/inia/IniaDolphin';
import {L, restPose} from '../characters/inia/model';
import {StudioBackdrop, StudioLights} from '../environments/Studio';
import {clamp} from '../lib/noise';

const CX = 0.42 * L - 0.5 * L;
const KEYS: [number, number][] = [[0, 0], [2, 0], [4, 45], [5, 90], [6, 180], [7, 270], [8, 270], [10, 360]];
const ease = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);
function azimuth(t: number) {
  for (let i = 1; i < KEYS.length; i++)
    if (t <= KEYS[i][0]) {
      const [t0, a0] = KEYS[i - 1];
      const [t1, a1] = KEYS[i];
      return a0 + (a1 - a0) * ease(clamp((t - t0) / (t1 - t0)));
    }
  return 360;
}
const LABEL = (a: number) => (a < 20 ? 'LATERAL IZQUIERDA' : a < 70 ? 'TRES CUARTOS' : a < 115 ? 'FRONTAL' : a < 200 ? 'LATERAL DERECHA' : a < 300 ? 'POSTERIOR' : 'LATERAL IZQUIERDA');

export const Turntable: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const {width, height} = useVideoConfig();
  const az = azimuth(t);
  const r = (az * Math.PI) / 180;
  // la cámara se aleja en las vistas laterales (cuerpo completo en 9:16) y se acerca en frontal/posterior
  const D = 5.2 + 3.6 * Math.abs(Math.cos(r));
  const pos: [number, number, number] = [CX + Math.sin(r) * D, 0.62, Math.cos(r) * D];
  const pose = {...restPose(), phase: t * 1.2, amp: 0.12, flipL: [Math.sin(t * 1.3) * 0.08, 0, Math.sin(t) * 0.1] as [number, number, number], flipR: [Math.sin(t * 1.3 + 0.5) * 0.08, 0, Math.sin(t + 0.4) * 0.1] as [number, number, number], eyeYaw: Math.sin(t * 0.7) * 0.5};
  return (
    <AbsoluteFill style={{background: '#14181c'}}>
      <ThreeCanvas width={width} height={height} shadows gl={{antialias: true}} camera={{fov: 30, position: pos, near: 0.01, far: 100}} onCreated={({gl}) => {gl.toneMapping = 7; gl.toneMappingExposure = 1.0;}}>
        <CameraAim target={[CX, -0.02, 0]} pos={pos} />
        <StudioBackdrop floorY={-0.45} />
        <StudioLights />
        <IniaDolphin pose={pose} />
        {/* plataforma de referencia (rejilla) para hacer evidente el giro 3D */}
        <gridHelper args={[4, 16, '#6a7680', '#3a444c']} position={[CX, -0.449, 0]} />
      </ThreeCanvas>
      <div style={{position: 'absolute', left: 60, top: 70, fontFamily: 'sans-serif', color: '#e8eef2', textShadow: '0 2px 6px #000'}}>
        <div style={{fontSize: 34, fontWeight: 800, letterSpacing: 3}}>PRUEBA DE GIRO 3D</div>
        <div style={{fontSize: 28, opacity: 0.85, marginTop: 8}}>{LABEL(az)} · {Math.round(az % 360)}°</div>
        <div style={{fontSize: 22, opacity: 0.6, marginTop: 6}}>Inia geoffrensis · Mundo Insólito Studio 3.0 · t = {t.toFixed(2)} s</div>
      </div>
    </AbsoluteFill>
  );
};

/** Apunta la cámara al objetivo en cada fotograma (la posición viene de la prop del lienzo). */
import {useThree} from '@react-three/fiber';
const CameraAim: React.FC<{target: [number, number, number]; pos: [number, number, number]}> = ({target, pos}) => {
  const {camera} = useThree();
  camera.position.set(...pos);
  camera.lookAt(...target);
  camera.updateProjectionMatrix();
  return null;
};
