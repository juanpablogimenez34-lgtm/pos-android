// DEMOSTRACIÓN DEL PERSONAJE PREMIUM (15 s exactos · 450 fotogramas · 1080×1920 · 30 fps).
//  0–3 s   EL MISTERIO: oscuridad, una silueta enorme se desplaza; la cámara se acerca.
//  3–6 s   LA REVELACIÓN: la luz ilumina la cabeza, aparecen la cresta roja y las escamas plateadas.
//  6–10 s  MOVIMIENTO REAL: plano lateral; ondulación de la aleta dorsal y deformación del cuerpo;
//          breve alimentación (boca y presas diminutas).
//  10–13 s GIRO CINEMATOGRÁFICO: gira hacia cámara y asciende; la cabeza cambia de orientación y
//          el cuerpo sigue su trayectoria.
//  13–15 s PLANO ÉPICO: la cámara se aleja y el animal desaparece en el océano profundo.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, hash1} from '../../engine/math';
import {ensureFonts} from '../../engine/fonts';
import {Krill} from '../ep14-pez-remo/components/OceanParticles';
import {toScreen} from '../../studio2';
import {demoCamera} from './CinematicCamera';
import {defaultLook, OarfishCharacter} from './OarfishCharacter';
import {DEMO_KEYS, demoFin, demoLook, feedingMouth} from './OarfishMotion';
import {buildRig, pathAt, project, rigParams, vadd, vmul} from './OarfishRig';
import {UnderwaterBack, UnderwaterFront} from './UnderwaterEnvironment';

export const OarfishDemo: React.FC = () => {
  ensureFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const head3 = pathAt(DEMO_KEYS, t);
  const {cam, proj} = demoCamera(t, head3);
  const rig = buildRig(rigParams({t, keys: DEMO_KEYS}));
  const lk = demoLook(t);
  const look = defaultLook({...lk, mouth: feedingMouth(t), fin: demoFin(t)});
  const depth = clamp(0.6 + head3.y / 1400);
  const hf = rig.frames[0];
  const headScreen = (() => {
    const p = project(vadd(hf.p, vmul(hf.h, 80)), proj);
    return toScreen(cam, p.x, p.y);
  })();
  // presas diminutas (kril) delante de la boca durante la alimentación
  const krill = t > 7.2 && t < 10.2 ? Array.from({length: 22}, (_, i) => {
    const base = vadd(hf.p, vmul(hf.h, 190 + hash1(i * 3) * 260));
    const q = vadd(vadd(base, vmul(hf.d, (hash1(i * 7) - 0.5) * 160)), {x: Math.sin(t + i) * 8, y: Math.cos(t * 1.3 + i) * 8, z: 0});
    const eaten = hash1(i * 11) < 0.35 && t > 8.0 + hash1(i) * 1.6;
    return {p: project(q, proj), op: eaten ? 0 : clamp((t - 7.2) / 0.6) * clamp((10.2 - t) / 0.5), i};
  }) : [];
  return (
    <AbsoluteFill style={{background: '#061427'}}>
      <svg width={1080} height={1920}>
        <UnderwaterBack cam={cam} t={t} depth={depth}>
          {krill.map((k) => (k.op > 0.01 ? <Krill key={k.i} x={k.p.x} y={k.p.y} s={0.9 * k.p.k} t={t + k.i} a={-15 + hash1(k.i) * 30} op={k.op} /> : null))}
          <OarfishCharacter rig={rig} pr={proj} look={look} uid="hero" />
        </UnderwaterBack>
      </svg>
      <UnderwaterFront t={t} beamX={toScreen(cam, head3.x - 700, -800).x} beamK={0.4 + 0.35 * clamp((t - 6) / 2)} subject={{x: headScreen.x, y: headScreen.y, k: 0.25 + 0.4 * lk.exposure}} depth={depth} />
    </AbsoluteFill>
  );
};
