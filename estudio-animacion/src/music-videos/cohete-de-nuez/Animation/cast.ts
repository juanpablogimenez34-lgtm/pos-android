// Constructores de pose de cada protagonista: completan la pose con su animación secundaria
// (cola, orejas, antenas, pantalla) y el parpadeo propio, para que nunca se muevan igual.
import {BipPose, BipScreen} from '../Characters/Bip';
import {LunaPose} from '../Characters/Luna';
import {NicoPose} from '../Characters/Nico';
import {basePose, BasePose} from '../Characters/parts';
import {ZumiPose} from '../Characters/Zumi';
import {antennaeFor, blink, earsFor, tailFor} from './moves';

type Extra<T> = Partial<Omit<T, keyof BasePose>>;

export function nicoP(t: number, o: Partial<BasePose> = {}, x: Extra<NicoPose> = {}, energy = 0.5): NicoPose {
  const b = basePose({t, ...o, expr: {...basePose().expr, blink: blink(t, 1), ...(o.expr ?? {})}});
  return {...b, tail: tailFor(t, energy, b.lean), belt: 0, prop: 'none', ...x};
}
export function lunaP(t: number, o: Partial<BasePose> = {}, x: Extra<LunaPose> = {}, surprise = 0): LunaPose {
  const b = basePose({t, ...o, expr: {...basePose().expr, blink: blink(t, 4), ...(o.expr ?? {})}});
  return {...b, ...earsFor(t, b.bob, surprise), prop: 'none', ...x};
}
export function bipP(t: number, o: Partial<BasePose> = {}, screen: Partial<BipScreen> = {}, x: Extra<BipPose> = {}): BipPose {
  const b = basePose({t, ...o, expr: {...basePose().expr, blink: blink(t, 6), ...(o.expr ?? {})}});
  return {...b, screen: {mode: 'face', value: '', face: 'happy', ...screen}, lights: 1, antenna: 0.5 + 0.5 * Math.sin(t * 4), prop: 'none', ...x};
}
export function zumiP(t: number, o: Partial<BasePose> = {}, x: Extra<ZumiPose> = {}): ZumiPose {
  const b = basePose({t, ...o, expr: {...basePose().expr, blink: blink(t, 9), ...(o.expr ?? {})}});
  return {...b, ...antennaeFor(t, b.bob), ...x};
}
