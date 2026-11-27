// Estados de movimiento del delfín rosado con mezcla suave; la fase del batido se integra (sin saltos).
import {clamp, lerp} from '../../../engine/math';
import {DolphinPose} from '../character/PinkDolphin';

export {seg, win, Callout, BigTitle} from '../../ep18-mixino/components/common';
export {Vignette, Brand, Note} from '../../ep23-cachalote/components/common';
export {Label, Info, SciTag} from '../../camaron-pistola/components/common';

export type DState = 'SLOW' | 'FAST' | 'ASCEND' | 'DESCEND' | 'HEAD_TURN' | 'BODY_TURN' | 'EXPLORE' | 'CATCH' | 'SURFACE' | 'BREATHE' | 'ROOTS';
type SP = {rate: number; amp: number; flipper: number; headPitch: number};
const ST: Record<DState, SP> = {
  SLOW: {rate: 0.55, amp: 0.55, flipper: 0, headPitch: 0},
  FAST: {rate: 1.3, amp: 1.15, flipper: -0.3, headPitch: 0},
  ASCEND: {rate: 0.9, amp: 0.9, flipper: -0.2, headPitch: -0.12},
  DESCEND: {rate: 0.8, amp: 0.8, flipper: 0.2, headPitch: 0.14},
  HEAD_TURN: {rate: 0.25, amp: 0.25, flipper: 0.4, headPitch: 0},
  BODY_TURN: {rate: 0.9, amp: 0.8, flipper: 0.9, headPitch: 0},
  EXPLORE: {rate: 0.4, amp: 0.4, flipper: 0.3, headPitch: 0.08},
  CATCH: {rate: 1.4, amp: 1.0, flipper: -0.2, headPitch: 0.05},
  SURFACE: {rate: 0.7, amp: 0.6, flipper: 0, headPitch: -0.18},
  BREATHE: {rate: 0.15, amp: 0.15, flipper: 0.1, headPitch: -0.05},
  ROOTS: {rate: 0.5, amp: 0.45, flipper: 0.8, headPitch: 0.04},
};
export type DTrack = [number, DState][];
const BLEND = 0.5;
function mix(track: DTrack, t: number): SP {
  let i = 0;
  while (i + 1 < track.length && t >= track[i + 1][0]) i++;
  const cur = ST[track[i][1]];
  if (i === 0) return cur;
  const prev = ST[track[i - 1][1]];
  const u = clamp((t - track[i][0]) / BLEND);
  const e = u * u * (3 - 2 * u);
  return {rate: lerp(prev.rate, cur.rate, e), amp: lerp(prev.amp, cur.amp, e), flipper: lerp(prev.flipper, cur.flipper, e), headPitch: lerp(prev.headPitch, cur.headPitch, e)};
}
export function poseFrom(track: DTrack, t: number, extra: Partial<DolphinPose> = {}, phase0 = 0): DolphinPose {
  const s = mix(track, t);
  let ph = phase0;
  const dt = 1 / 30;
  for (let x = track[0][0]; x < t; x += dt) ph += mix(track, x).rate * Math.PI * 2 * Math.min(dt, t - x);
  return {t, phase: ph, amp: s.amp, flipper: s.flipper, headPitch: s.headPitch, pink: 1, ...extra};
}
