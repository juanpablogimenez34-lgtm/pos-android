import React, {createContext, useContext} from 'react';
import {fbm1} from './math';
import {Key, track} from './timeline';

/**
 * Cámara 2.5D.
 * x, y : punto del mundo (plano de profundidad 1) que queda en el centro de la pantalla.
 * zoom : escala del plano principal. Los planos lejanos escalan menos (zoom^depth),
 *        los cercanos más, lo que produce parallax real también en los acercamientos.
 */
export type Camera = {x: number; y: number; zoom: number; roll: number};

export type CameraTrack = {x: Key[]; y: Key[]; zoom: Key[]; roll?: Key[]};

export type Viewport = {width: number; height: number};

/** Deriva sutil tipo cámara submarina flotando (determinista). */
export const DEFAULT_FLOAT = {amp: 6, rollAmp: 0.0035, speed: 0.16};

export function cameraAt(trackDef: CameraTrack, t: number, float = DEFAULT_FLOAT): Camera {
  const x = track(trackDef.x, t) + fbm1(t * float.speed, 11) * float.amp;
  const y = track(trackDef.y, t) + fbm1(t * float.speed, 23) * float.amp * 0.8;
  const zoom = track(trackDef.zoom, t);
  const roll = (trackDef.roll ? track(trackDef.roll, t) : 0) + fbm1(t * float.speed * 0.7, 41) * float.rollAmp;
  return {x, y, zoom, roll};
}

type CameraCtx = {camera: Camera; viewport: Viewport; anchor: {x: number; y: number}};

const Ctx = createContext<CameraCtx>({
  camera: {x: 0, y: 0, zoom: 1, roll: 0},
  viewport: {width: 1080, height: 1920},
  anchor: {x: 0, y: 0},
});

export const CameraProvider: React.FC<CameraCtx & {children: React.ReactNode}> = ({children, ...value}) => (
  <Ctx.Provider value={value}>{children}</Ctx.Provider>
);

export const useCamera = () => useContext(Ctx);

/** Transformación de un plano con profundidad `depth` (1 = plano del protagonista). */
export function layerTransform(ctx: CameraCtx, depth: number) {
  const {camera, viewport, anchor} = ctx;
  const z = Math.pow(camera.zoom, depth);
  const lx = anchor.x + (camera.x - anchor.x) * depth;
  const ly = anchor.y + (camera.y - anchor.y) * depth;
  return {z, lx, ly, cx: viewport.width / 2, cy: viewport.height / 2};
}

export function worldToScreen(ctx: CameraCtx, depth: number, p: {x: number; y: number}) {
  const {z, lx, ly, cx, cy} = layerTransform(ctx, depth);
  return {x: cx + (p.x - lx) * z, y: cy + (p.y - ly) * z, scale: z};
}

export function screenToWorld(ctx: CameraCtx, depth: number, s: {x: number; y: number}) {
  const {z, lx, ly, cx, cy} = layerTransform(ctx, depth);
  return {x: lx + (s.x - cx) / z, y: ly + (s.y - cy) / z};
}

/** Grupo SVG que coloca a sus hijos (en coordenadas de mundo) según la cámara. */
export const ParallaxLayer: React.FC<{depth: number; children: React.ReactNode; opacity?: number}> = ({
  depth,
  children,
  opacity,
}) => {
  const ctx = useCamera();
  const {z, lx, ly, cx, cy} = layerTransform(ctx, depth);
  const rollDeg = (ctx.camera.roll * 180) / Math.PI;
  return (
    <g
      opacity={opacity}
      transform={`translate(${cx} ${cy}) rotate(${rollDeg.toFixed(3)}) scale(${z.toFixed(5)}) translate(${(-lx).toFixed(
        2,
      )} ${(-ly).toFixed(2)})`}
    >
      {children}
    </g>
  );
};
