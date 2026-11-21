// ACTO 5 · EL REGRESO (secuencias 17–20, 144–180 s, fotogramas 4320–5399).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp} from '../../../engine/math';
import {EV} from '../config/sequences';
import {Grade, ScreenRays} from '../lighting/Lighting';
import {ForegroundSnow} from '../particles/Particles';
import {BigTitle, Caption, SceneOut, win} from './common';
import {ReefShot} from './ReefShot';
import {mantisAt, reefCam} from './world';

const Snow: React.FC<{t: number; k?: number}> = ({t, k = 1}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <svg width={1080} height={1920}>
      <ForegroundSnow t={t} k={k} />
    </svg>
  </AbsoluteFill>
);

/** 17 · LA VIDA DE UN CAZADOR (144–153 s · f 4320–4589). Patrulla su territorio, gira el cuerpo,
 *  un pez intruso se acerca y el camarón mantis lo disuade abriendo apéndices y abanico; regresa. */
export function seq17(t: number): SceneOut {
  const m = mantisAt(t);
  const cam = reefCam(t, m);
  return {
    svg: <ReefShot t={t} cam={cam} bits />,
    overlay: (
      <>
        <Grade depth={0.4} vignette={0.8} />
        <Snow t={t} />
        <Caption text="Defiende su territorio" k={win(t, 147.2, 151.4, 0.5)} top={250} />
      </>
    ),
  };
}

/** 18 · EL REFUGIO (153–162 s · f 4590–4859). Vuelve a la grieta, gira y entra de espaldas,
 *  parcialmente; la cámara se queda fuera y los ojos siguen vigilando. */
export function seq18(t: number): SceneOut {
  const m = mantisAt(t);
  const cam = reefCam(t, m);
  return {
    svg: <ReefShot t={t} cam={cam} bits />,
    overlay: (
      <>
        <Grade depth={0.45} vignette={0.88} />
        <Snow t={t} />
      </>
    ),
  };
}

/** 19 · UN PEQUEÑO GIGANTE (162–171 s · f 4860–5129). La cámara se aleja: el arrecife crece, el
 *  animal se vuelve diminuto y grandes siluetas cruzan el océano. */
export function seq19(t: number): SceneOut {
  const m = mantisAt(t);
  const cam = reefCam(t, m);
  return {
    svg: <ReefShot t={t} cam={cam} bits />,
    overlay: (
      <>
        <ScreenRays t={t} k={clamp((t - 164) / 5) * 0.6} />
        <Grade depth={0.4 - 0.15 * clamp((t - 162) / 9)} vignette={0.8} />
      </>
    ),
  };
}

/** 20 · CIERRE (171–180 s · f 5130–5399). La cámara asciende hacia la luz; título final y
 *  fundido a negro. */
export function seq20(t: number): SceneOut {
  const m = mantisAt(t);
  const cam = reefCam(t, m);
  const fade = clamp((t - EV.fade[0]) / (EV.fade[1] - EV.fade[0] - 0.3));
  return {
    svg: <ReefShot t={t} cam={cam} bits tone={0.32 - 0.12 * clamp((t - 171) / 6)} />,
    overlay: (
      <>
        <ScreenRays t={t} k={0.6 + 0.4 * clamp((t - 171) / 4)} />
        <Grade depth={0.15} vignette={0.7} dark={fade} />
        <BigTitle lines={['', 'LA NATURALEZA NUNCA DEJA DE SORPRENDERNOS']} k={win(t, EV.endTitle, 178.6, 0.8) * (1 - fade * 0.4)} top={360} size={76} color="#ffffff" />
      </>
    ),
  };
}
