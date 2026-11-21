// ACTO 3 · EL GOLPE (secuencias 08–12, 63–108 s, fotogramas 1890–3239).
import {AbsoluteFill} from 'remotion';
import {clamp} from '../../../engine/math';
import {toScreen} from '../camera/CameraSystem';
import {EV} from '../config/sequences';
import {SlowMoFrame} from '../effects/Effects';
import {Grade, SubjectLight} from '../lighting/Lighting';
import {SpeedCard, SpringDiagram} from '../science/Science';
import {Caption, SceneOut, seg, win} from './common';
import {ReefShot} from './ReefShot';
import {CONTACT, mantisAt, reefCam} from './world';

/** 08 · ENCUENTRO CON LA PRESA (63–72 s · f 1890–2159). Plano general: avanza hacia un caracol,
 *  retrocede un paso con cautela, vuelve a avanzar y se detiene en posición de acecho. */
export function seq08(t: number): SceneOut {
  const m = mantisAt(t);
  const cam = reefCam(t, m);
  return {
    svg: <ReefShot t={t} cam={cam} snail />,
    overlay: (
      <>
        <Grade depth={0.42} vignette={0.82} />
        <Caption text="Presa de caparazón duro" k={win(t, 64.4, 70.2, 0.5)} />
      </>
    ),
  };
}

/** 09 · PREPARACIÓN DEL GOLPE (72–81 s · f 2160–2429). Acercamiento lento: el apéndice se pliega
 *  y queda cargado (anticipación). Gráfico del resorte en silla de montar y del cierre. */
export function seq09(t: number): SceneOut {
  const m = mantisAt(t);
  const cam = reefCam(t, m);
  const c = toScreen(cam, CONTACT.x, CONTACT.y);
  return {
    svg: <ReefShot t={t} cam={cam} snail />,
    overlay: (
      <>
        <SubjectLight x={c.x - 120} y={c.y} r={460} k={seg(t, 74, 78) * 0.8} color="rgba(255,120,120,0.16)" />
        <Grade depth={0.5} vignette={0.95} />
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <SpringDiagram t={t} k={win(t, 73.6, 80.8, 0.6)} load={seg(t, EV.cock[0], EV.cock[1] + 1)} release={0} />
          </svg>
        </AbsoluteFill>
      </>
    ),
  };
}

/** 10 · EL IMPACTO (81–90 s · f 2430–2699). Golpe a velocidad real (≈3 fotogramas), reacción y
 *  recuperación; después, repetición a cámara lenta con la tarjeta de velocidad. */
export function seq10(t: number): SceneOut {
  const m = mantisAt(t);
  const cam = reefCam(t, m);
  const slow = win(t, EV.slow[0], EV.slow[1] + 0.9, 0.25);
  const flash = t >= EV.strike && t < EV.strike + 0.12 ? 1 - (t - EV.strike) / 0.12 : 0;
  return {
    svg: <ReefShot t={t} cam={cam} snail />,
    overlay: (
      <>
        <Grade depth={0.5} vignette={0.9} />
        {flash > 0 && <AbsoluteFill style={{background: '#dff8ff', opacity: 0.35 * flash}} />}
        <Caption text="Velocidad real" k={win(t, 81.6, 84.6, 0.4)} top={250} size={36} color="#bff6ff" />
        <SlowMoFrame k={slow} label="REPETICIÓN · CÁMARA LENTA" />
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <SpeedCard k={win(t, 87.2, 89.9, 0.4)} u={seg(t, 87.4, 88.2)} />
          </svg>
        </AbsoluteFill>
      </>
    ),
  };
}

/** 11 · BURBUJAS DE CAVITACIÓN (90–99 s · f 2700–2969). Macro a cámara lenta: el mazo llega a la
 *  concha; burbujas diminutas crecen y colapsan generando anillos de presión (sin explosiones). */
export function seq11(t: number): SceneOut {
  const m = mantisAt(t);
  const cam = reefCam(t, m);
  const c = toScreen(cam, CONTACT.x, CONTACT.y);
  return {
    svg: <ReefShot t={t} cam={cam} snail />,
    overlay: (
      <>
        <SubjectLight x={c.x} y={c.y} r={500} k={0.6} />
        <Grade depth={0.5} vignette={0.95} />
        <SlowMoFrame k={win(t, 89.5, 98.6, 0.4)} label="CÁMARA LENTA" />
        <Caption text="Burbujas de cavitación" sub="al colapsar, otra onda de presión" k={win(t, 91.2, 98.2, 0.5)} top={300} />
      </>
    ),
  };
}

/** 12 · LA PRESA (99–108 s · f 2970–3239). Golpes repetidos a velocidad real, la concha se agrieta,
 *  el sedimento se levanta y el depredador manipula la presa con los apéndices. */
export function seq12(t: number): SceneOut {
  const m = mantisAt(t);
  const cam = reefCam(t, m);
  const out = clamp((t - 107.7) / 0.8);
  return {
    svg: <ReefShot t={t} cam={cam} snail />,
    overlay: (
      <>
        <Grade depth={0.45} vignette={0.85} />
        <Caption text="Caracoles · cangrejos · almejas" k={win(t, 104.2, 107.6, 0.5)} top={250} size={38} />
        {out > 0 && <AbsoluteFill style={{background: '#e8566a', opacity: 0.25 * out}} />}
      </>
    ),
  };
}
