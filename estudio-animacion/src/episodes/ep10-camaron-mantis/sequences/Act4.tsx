// ACTO 4 · LA CIENCIA (secuencias 13–16, 108–144 s, fotogramas 3240–4319).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {Cam} from '../camera/CameraSystem';
import {EV} from '../config/sequences';
import {CurrentSweep} from '../effects/Effects';
import {ReefStage} from '../environment/ReefStage';
import {Dim, Grade} from '../lighting/Lighting';
import {ForegroundSnow} from '../particles/Particles';
import {ClubOrbit, ClubSection, Lab} from '../science/Science';
import {Caption, SceneOut, seg, win} from './common';
import {ReefShot} from './ReefShot';
import {mantisAt, reefCam} from './world';

/** Fondo del estudio submarino: arrecife lejano fuera de foco (atenuado). */
const StudioBack: React.FC<{t: number}> = ({t}) => {
  const cam: Cam = {x: 200 + Math.sin(t * 0.1) * 60, y: -520, zoom: 0.62, roll: 0};
  return <ReefStage cam={cam} t={t} tone={0.6} fish={0.4} />;
};

/** 13 · EL ARMA NATURAL (108–117 s · f 3240–3509). El mazo dactilar en rotación 3D simulada
 *  (sombreado y manchas que giran con el ángulo), con el espolón y una etiqueta. */
export function seq13(t: number): SceneOut {
  const fromReef = t < 109 ? 1 - clamp((t - 108.2) / 0.8) : 0;
  const m = mantisAt(t);
  return {
    svg: (
      <g>
        <StudioBack t={t} />
        {fromReef > 0 && <g opacity={fromReef}><ReefShot t={t} cam={reefCam(t, m)} snail /></g>}
      </g>
    ),
    overlay: (
      <>
        <Dim k={0.75 * (1 - fromReef)} />
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <ClubOrbit t={t - 108} k={clamp((t - 108.4) / 0.8)} cx={540} cy={820} />
          </svg>
        </AbsoluteFill>
        <Caption text="El mazo" sub="miles de impactos sin romperse" k={win(t, 109.4, 116.6, 0.5)} top={250} />
        <Grade depth={0.6} vignette={0.9} />
      </>
    ),
  };
}

/** 14 · ESTRUCTURA INTERNA (117–126 s · f 3510–3779). Corte por capas: región de impacto
 *  mineralizada, fibras helicoidales que desvían la grieta y región estriada. */
export function seq14(t: number): SceneOut {
  return {
    svg: <StudioBack t={t} />,
    overlay: (
      <>
        <Dim k={0.8} />
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <ClubOrbit t={t - 108} k={1 - clamp((t - 117) / 0.8)} cx={540} cy={820} />
            <ClubSection t={t - 117} k={win(t, 117.4, 126.2, 0.7)} crack={seg(t, 119.5, 124.2)} />
          </svg>
        </AbsoluteFill>
        <Grade depth={0.6} vignette={0.9} />
      </>
    ),
  };
}

/** 15 · INSPIRACIÓN CIENTÍFICA (126–135 s · f 3780–4049). Laboratorio estilizado: probeta de
 *  compuesto helicoidal en un ensayo de impacto. Rotulado como investigación en desarrollo. */
export function seq15(t: number): SceneOut {
  const k = clamp((t - 125.8) / 0.9);
  return {
    svg: <StudioBack t={t} />,
    overlay: (
      <>
        <Dim k={0.8} />
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <Lab t={t - 126} k={k} hit={seg(t, 128.4, 130.4)} />
          </svg>
        </AbsoluteFill>
        <Caption text="Materiales bioinspirados" sub="estudios aún en desarrollo" k={win(t, 127.2, 134.4, 0.5)} top={170} size={38} />
        <Grade depth={0.3} vignette={0.75} warm={0.3} />
      </>
    ),
  };
}

/** 16 · REGRESO AL ARRECIFE (135–144 s · f 4050–4319). Una corriente barre el laboratorio y nos
 *  devuelve al arrecife; el camarón mantis reaparece junto a los restos de la concha y sale a patrullar. */
export function seq16(t: number): SceneOut {
  const m = mantisAt(t);
  const cam = reefCam(t, m);
  const u = (t - EV.current[0]) / (EV.current[1] - EV.current[0]);
  const lab = t < 136.2;
  return {
    svg: lab ? <StudioBack t={t} /> : <ReefShot t={t} cam={cam} bits />,
    overlay: (
      <>
        {lab && (
          <>
            <Dim k={0.8} />
            <AbsoluteFill style={{pointerEvents: 'none'}}>
              <svg width={1080} height={1920}>
                <Lab t={t - 126} k={1} hit={1} />
              </svg>
            </AbsoluteFill>
          </>
        )}
        {!lab && <Grade depth={0.4} vignette={0.8} />}
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <ForegroundSnow t={t} k={lab ? 0 : 1} />
          </svg>
        </AbsoluteFill>
        <CurrentSweep u={u} t={t} />
        <Caption text="Millones de años de evolución" k={win(t, 138.4, 143.6, 0.5)} top={250} size={38} />
        <div style={{display: 'none', fontFamily: FONT_FAMILY}} />
      </>
    ),
  };
}
