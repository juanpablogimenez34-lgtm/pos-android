// Estados del camarón pistola (8) con mezcla suave de parámetros, y piezas compartidas de la interfaz.
import React from 'react';
import {clamp, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {ShrimpPose} from '../character/Shrimp';
import {SCENES} from '../data/timeline';

export {seg, win, Callout, Wash, BigTitle} from '../../ep18-mixino/components/common';
export {Vignette, Brand, Note} from '../../ep23-cachalote/components/common';

export type SState = 'IDLE' | 'WALKING' | 'EXPLORING' | 'TARGETING' | 'CLAW_OPEN' | 'SNAPPING' | 'HUNTING' | 'RETREATING';
type SP = {open: number; alert: number; antenna: number; flex: number; fan: number; walkRate: number; swim: number; minor: number; aim: number};
const ST: Record<SState, SP> = {
  IDLE: {open: 0.05, alert: 0.2, antenna: -0.3, flex: 0.25, fan: 0.55, walkRate: 0, swim: 1.2, minor: 0.15, aim: 0},
  WALKING: {open: 0.08, alert: 0.25, antenna: -0.25, flex: 0.22, fan: 0.5, walkRate: 85, swim: 1.6, minor: 0.1, aim: 0.03},
  EXPLORING: {open: 0.15, alert: 0.45, antenna: -0.45, flex: 0.25, fan: 0.6, walkRate: 40, swim: 1.6, minor: 0.5, aim: 0.05},
  TARGETING: {open: 0.2, alert: 0.9, antenna: -0.18, flex: 0.3, fan: 0.8, walkRate: 0, swim: 2.2, minor: 0.2, aim: -0.08},
  CLAW_OPEN: {open: 1, alert: 1, antenna: -0.15, flex: 0.35, fan: 0.95, walkRate: 0, swim: 2.4, minor: 0.1, aim: -0.12},
  SNAPPING: {open: 0, alert: 1, antenna: -0.2, flex: 0.45, fan: 1, walkRate: 0, swim: 3, minor: 0.1, aim: -0.04},
  HUNTING: {open: 0.3, alert: 0.7, antenna: -0.2, flex: 0.25, fan: 0.6, walkRate: 70, swim: 2, minor: 0.7, aim: 0.02},
  RETREATING: {open: 0.05, alert: 0.4, antenna: -0.5, flex: 0.6, fan: 0.4, walkRate: -60, swim: 2, minor: 0.1, aim: 0.1},
};
export type STrack = [number, SState][];
const BLEND = 0.35;
function mix(track: STrack, t: number): SP {
  let i = 0;
  while (i + 1 < track.length && t >= track[i + 1][0]) i++;
  const cur = ST[track[i][1]];
  if (i === 0) return cur;
  const prev = ST[track[i - 1][1]];
  const u = clamp((t - track[i][0]) / BLEND);
  const e = u * u * (3 - 2 * u);
  const o = {} as SP;
  (Object.keys(cur) as (keyof SP)[]).forEach((k) => (o[k] = lerp(prev[k], cur[k], e)));
  return o;
}
/** Distancia recorrida (integra la velocidad de marcha de los estados). */
function walkDist(track: STrack, t: number, t0: number) {
  let d = 0;
  const dt = 1 / 30;
  for (let x = t0; x < t; x += dt) d += mix(track, x).walkRate * Math.min(dt, t - x);
  return d;
}
export function stateAt(track: STrack, t: number): SState {
  let i = 0;
  while (i + 1 < track.length && t >= track[i + 1][0]) i++;
  return track[i][1];
}
export function poseFrom(track: STrack, t: number, extra: Partial<ShrimpPose> = {}): ShrimpPose & {dist: number} {
  const s = mix(track, t);
  const dist = walkDist(track, t, track[0][0]);
  return {t, walkDist: Math.abs(dist), open: s.open, alert: s.alert, antenna: s.antenna, flex: s.flex, fan: s.fan, swim: s.swim, minor: s.minor, aim: s.aim, dist, ...extra};
}

/** Apertura de la pinza mayor alrededor de un chasquido (armado lento, cierre en ~1 fotograma). */
export function snapOpen(t: number, snap: number, armAt: number, base = 0.08) {
  if (t >= snap) return lerp(0, base, clamp((t - snap - 0.6) / 0.8));
  const u = clamp((t - armAt) / 0.5);
  return lerp(base, 1, u * u * (3 - 2 * u));
}

/** Etiqueta de visualización científica (esquina). */
export const SciTag: React.FC<{k: number; text?: string}> = ({k, text = 'VISUALIZACIÓN CIENTÍFICA · CÁMARA ULTRALENTA'}) =>
  k > 0.01 ? <div style={{position: 'absolute', right: 44, top: 70, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 20, letterSpacing: 2.5, color: '#9ff4ff', opacity: 0.85 * k, textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>{text}</div> : null;

/** Título breve de escena (sin la palabra «escena», para no frenar el ritmo). */
export const SceneTag: React.FC<{t: number}> = ({t}) => {
  const s = SCENES.find((x) => t >= x.start && t < x.end);
  if (!s || s.n === 1 || s.n === 8 || s.n === 4 || s.n === 5) return null;
  const k = clamp((t - s.start - 0.2) / 0.4) * clamp((s.start + 2.6 - t) / 0.4);
  if (k <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${((1 - k) * -10).toFixed(1)}px)`}}>
      <div style={{color: '#ffb070', fontWeight: 900, fontSize: 40, letterSpacing: 2, textShadow: '0 3px 12px rgba(0,0,0,0.85)'}}>{s.title.toUpperCase()}</div>
    </div>
  );
};

/** Texto informativo legible (aclaraciones científicas). */
export const Info: React.FC<{k: number; text: string; top?: number; size?: number; color?: string}> = ({k, text, top = 420, size = 36, color = '#eaffff'}) =>
  k > 0.01 ? <div style={{position: 'absolute', left: 70, right: 70, top, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: size, lineHeight: 1.25, color, opacity: k, background: 'rgba(3,18,26,0.55)', padding: '14px 22px', borderRadius: 18, textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>{text}</div> : null;

/** Rótulo con flecha discreta en coordenadas de pantalla. */
export const Label: React.FC<{x: number; y: number; tx: number; ty: number; text: string; k: number; color?: string; size?: number}> = ({x, y, tx, ty, text, k, color = '#eaffff', size = 38}) =>
  k > 0.01 ? (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: k, overflow: 'visible'}}>
      <defs>
        <marker id={`ar${Math.round(x)}${Math.round(y)}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10z" fill={color} />
        </marker>
      </defs>
      <path d={`M${tx.toFixed(1)},${ty.toFixed(1)} L${lerp(tx, x, k).toFixed(1)},${lerp(ty, y, k).toFixed(1)}`} stroke={color} strokeWidth={3} markerEnd={`url(#ar${Math.round(x)}${Math.round(y)})`} opacity={0.9} />
      <text x={tx} y={ty + (ty < y ? -12 : 34)} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={size} fill={color} stroke="rgba(0,0,0,0.75)" strokeWidth={5} paintOrder="stroke">{text}</text>
    </svg>
  ) : null;
