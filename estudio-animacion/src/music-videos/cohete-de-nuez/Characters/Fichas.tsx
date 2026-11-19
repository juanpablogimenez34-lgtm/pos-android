// Fichas visuales del videoclip: los cuatro protagonistas en varias poses y expresiones, y el
// cohete de nuez en sus etapas de construcción. Animadas (parpadeo, cola, orejas, antenas,
// pantalla, luces) para comprobar la animación secundaria con el mismo rig del videoclip.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONT_FAMILY} from '../../../engine/fonts';
import {useTime} from '../../../engine/useTime';
import {BUILT, NutRocket, RocketBuild} from '../Rocket/NutRocket';
import {Bip, BipPose} from './Bip';
import {Luna, LunaPose} from './Luna';
import {Nico, NicoPose} from './Nico';
import {basePose, NEUTRAL_EXPR, SharedDefs} from './parts';
import {Zumi, ZumiPose} from './Zumi';

const blinkAt = (t: number, off: number) => {
  const ph = (t + off) % 3.4;
  return ph < 0.12 ? Math.sin((ph / 0.12) * Math.PI) : 0;
};

const Label: React.FC<{x: number; y: number; title: string; sub: string}> = ({x, y, title, sub}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 540, textAlign: 'center', fontFamily: FONT_FAMILY}}>
    <div style={{fontWeight: 900, fontSize: 34, color: '#ffffff'}}>{title}</div>
    <div style={{fontWeight: 600, fontSize: 19, color: '#ffe9a8', padding: '0 20px'}}>{sub}</div>
  </div>
);

export const CoheteFichas: React.FC = () => {
  const t = useTime();
  const e = (off: number, o: Partial<typeof NEUTRAL_EXPR> = {}) => ({...NEUTRAL_EXPR, blink: blinkAt(t, off), ...o});
  const nico = (o: Partial<NicoPose>): NicoPose => ({...basePose({t}), tail: {sway: Math.sin(t * 2.1), curl: 0.4 + 0.3 * Math.sin(t * 1.3)}, belt: 0, prop: 'none', ...o});
  const luna = (o: Partial<LunaPose>): LunaPose => ({...basePose({t}), earL: {a: -0.18 + 0.08 * Math.sin(t * 2.3), bend: -0.25 + 0.2 * Math.sin(t * 1.7)}, earR: {a: 0.2 + 0.06 * Math.sin(t * 2.9 + 1), bend: 0.5 + 0.25 * Math.sin(t * 2.1)}, prop: 'none', ...o});
  const bip = (o: Partial<BipPose>): BipPose => ({...basePose({t}), screen: {mode: 'face', value: '', face: 'happy'}, lights: 1, antenna: 0.5 + 0.5 * Math.sin(t * 4), prop: 'none', ...o});
  const zumi = (o: Partial<ZumiPose>): ZumiPose => ({...basePose({t}), antL: {a: -0.35 + 0.15 * Math.sin(t * 3), bend: -0.4 * Math.sin(t * 2.2)}, antR: {a: 0.35 + 0.15 * Math.sin(t * 3 + 1.2), bend: 0.4 * Math.sin(t * 2.6)}, ...o});
  const stage = (k: number): RocketBuild => ({shell: Math.min(1, k * 4), fins: [Math.min(1, Math.max(0, k * 4 - 1)), Math.min(1, Math.max(0, k * 4 - 1.3)), Math.min(1, Math.max(0, k * 4 - 1.6))], windowK: Math.min(1, Math.max(0, k * 4 - 2)), nose: Math.min(1, Math.max(0, k * 4 - 2.4)), tape: Math.min(1, Math.max(0, k * 4 - 2.8)), lights: Math.min(1, Math.max(0, k * 4 - 3.2)), stars: Math.min(1, Math.max(0, k * 4 - 3.5))});
  const bob = Math.sin(t * 4) * 4;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #3a2a7a 0%, #6a4ab0 50%, #2a1a5a 100%)'}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <SharedDefs />
        {[...Array(5)].map((_, i) => (
          <line key={i} x1={0} x2={1080} y1={i * 384} y2={i * 384} stroke="#ffffff" strokeOpacity={0.15} strokeWidth={2} />
        ))}
        <line x1={540} x2={540} y1={0} y2={1536} stroke="#ffffff" strokeOpacity={0.15} strokeWidth={2} />
        {/* NICO */}
        <Nico id="n1" p={nico({x: 130, y: 360, scale: 0.95, bob, expr: e(0)})} />
        <Nico id="n2" p={nico({x: 300, y: 360, scale: 0.95, belt: 1, prop: 'scissors', armR: {a: -1.2, b: 0.6}, expr: e(1, {mouth: 'grin', brow: 0.3}), headTurn: 0.5})} />
        <Nico id="n3" p={nico({x: 450, y: 330, scale: 0.85, helmet: 1, armL: {a: 2.2, b: 0.4}, armR: {a: -2.2, b: -0.4}, legL: {a: 0.5, b: -0.6}, legR: {a: -0.4, b: 0.5}, expr: e(2, {mouth: 'open', mouthOpen: 0.6}), lean: Math.sin(t) * 0.1, bob: Math.sin(t * 2) * 10})} />
        {/* LUNA */}
        <Luna id="l1" p={luna({x: 670, y: 360, scale: 0.95, facing: -1, expr: e(0.7)})} />
        <Luna id="l2" p={luna({x: 830, y: 360, scale: 0.95, prop: 'tape', armR: {a: -1.4, b: 0.3}, expr: e(1.7, {mouth: 'grin'})})} />
        <Luna id="l3" p={luna({x: 980, y: 330, scale: 0.85, helmet: 1, earL: {a: -0.9, bend: -0.8}, earR: {a: 0.9, bend: 0.8}, armL: {a: 2.6, b: 0.2}, armR: {a: -2.6, b: -0.2}, expr: e(2.5, {mouth: 'o', brow: 1})})} />
        {/* BIP */}
        <Bip id="b1" p={bip({x: 120, y: 740, scale: 1, bob})} />
        <Bip id="b2" p={bip({x: 290, y: 740, scale: 1, screen: {mode: 'number', value: String(3 - (Math.floor(t) % 4)), face: 'happy'}, armR: {a: -2.0, b: -0.3}})} />
        <Bip id="b3" p={bip({x: 450, y: 740, scale: 1, screen: {mode: 'face', value: '', face: 'wow'}, prop: 'camera', armR: {a: -1.6, b: 0.4}, armL: {a: 1.6, b: -0.4}})} />
        {/* ZUMI */}
        <Zumi id="z1" p={zumi({x: 660, y: 740, scale: 1.1, expr: e(0.3)})} />
        <Zumi id="z2" p={zumi({x: 830, y: 740, scale: 1.1, armR: {a: -2.6 + Math.sin(t * 6) * 0.35, b: -0.3}, expr: e(1.3, {mouth: 'grin'}), headTilt: 0.12})} />
        <Zumi id="z3" p={zumi({x: 980, y: 720, scale: 1.0, armL: {a: 1.9, b: 0.6}, armR: {a: -1.9, b: -0.6}, legL: {a: 0.35, b: -0.4}, expr: e(2.3, {mouth: 'open', mouthOpen: 0.5}), bob: Math.sin(t * 5) * 8})} />
        {/* COHETE: etapas de construcción */}
        {[0.25, 0.5, 0.75, 1].map((k, i) => (
          <NutRocket key={i} id={`r${i}`} p={{x: 140 + i * 160, y: 1440, scale: 0.36, rot: 0, build: stage(k), vibrate: 0, engine: 0, glow: 0, t}} />
        ))}
        <NutRocket id="rf" p={{x: 860, y: 1300 + Math.sin(t * 1.5) * 10, scale: 0.62, rot: 0.06 * Math.sin(t), build: BUILT, vibrate: 0, engine: 1, glow: 0.3, t}} />
      </svg>
      <Label x={0} y={386} title="NICO" sub="ardilla inventora · cola con movimiento propio · cinturón y casco" />
      <Label x={540} y={386} title="LUNA" sub="conejita exploradora · orejas independientes · casco lila" />
      <Label x={0} y={770} title="BIP" sub="robot · pantalla con expresiones y números · luces" />
      <Label x={540} y={770} title="ZUMI" sub="extraterrestre amigable · antenas flexibles · 3 dedos" />
      <Label x={0} y={1550} title="COHETE DE NUEZ" sub="construcción por piezas: nuez · aletas · ventana · punta · cinta · luces · estrellas" />
      <Label x={540} y={1550} title="EN LA FANTASÍA" sub="motor imaginario de chispas mágicas (no es un cohete real)" />
    </AbsoluteFill>
  );
};
