// ESTUDIO 2.0 · CÁMARA CINEMATOGRÁFICA. Reutiliza la cámara 2D con parallax del estudio (sin
// modificarla) y añade: curvas de suavizado con nombre, seguimiento suave de un objetivo,
// revelación de escala (dolly hacia atrás) y respiración de cámara en mano muy leve.
import {clamp, lerp} from '../engine/math';
import {Cam, CamKey, camAt, drift, layerT, toScreen, W, H} from '../episodes/ep10-camaron-mantis/camera/CameraSystem';

export type {Cam, CamKey};
export {camAt, drift, layerT, toScreen, W, H};

export const ease = {
  linear: (u: number) => u,
  inOut: (u: number) => u * u * (3 - 2 * u),
  out: (u: number) => 1 - Math.pow(1 - u, 3),
  in: (u: number) => u * u * u,
  /** "cine": arranque y frenada muy suaves (quintic) */
  cine: (u: number) => u * u * u * (u * (u * 6 - 15) + 10),
};

/** Tramo de cámara entre dos encuadres con una curva con nombre. */
export function shot(t: number, a: number, b: number, from: Cam, to: Cam, curve: keyof typeof ease = 'cine'): Cam {
  const u = ease[curve](clamp((t - a) / (b - a)));
  return {x: lerp(from.x, to.x, u), y: lerp(from.y, to.y, u), zoom: Math.exp(lerp(Math.log(from.zoom), Math.log(to.zoom), u)), roll: lerp(from.roll, to.roll, u)};
}

/** Seguimiento: la cámara persigue un objetivo con retraso (no se "pega" al animal). */
export function follow(target: {x: number; y: number}, prevTarget: {x: number; y: number}, base: Cam, lag = 0.35): Cam {
  return {...base, x: lerp(target.x, prevTarget.x, lag), y: lerp(target.y, prevTarget.y, lag)};
}

/** Cámara en mano muy leve (motivada, nunca temblor). */
export const breathe = (c: Cam, t: number, k = 1): Cam => drift(c, t, k);

export const cam = (x: number, y: number, zoom: number, roll = 0): Cam => ({x, y, zoom, roll});
