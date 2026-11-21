// Escenas en la habitación: 01 introducción, 02 construcción del cohete (estrofa 1) y
// 08 regreso a casa con el final instrumental. Tiempos tomados del mapa de la canción.
import React from 'react';
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {bipP, lunaP, nicoP} from '../Animation/cast';
import {clap, crouch, dance, expr, hop, L, point, walk, wave} from '../Animation/moves';
import {Cam, camAt, CamKey, layerT, pulsed} from '../Camera/cam2d';
import {Bip} from '../Characters/Bip';
import {Luna} from '../Characters/Luna';
import {Nico} from '../Characters/Nico';
import {BasePose} from '../Characters/parts';
import {Burst} from '../Effects/Fx';
import {RoomBack, RoomFloor} from '../Environments/Room';
import {BEATS, beatPhase} from '../MusicSync/songMap';
import {NutRocket, RocketBuild} from '../Rocket/NutRocket';
import {BUILD, SEC} from '../Timeline/timeline';
import {RocketCrew} from './crew';

const R = (t: number, a: number, d: number) => smoothstep(a, a + d, t);
const ROCKET_X = -230;

const BUILD_KEYS: CamKey[] = [
  [0, -420, -1150, 1.6],
  [1.4, -420, -1000, 1.4],
  [3.0, 300, -420, 1.25],
  [4.4, 200, -440, 1.1],
  [5.4, -60, -480, 0.8],
  [5.7, -60, -480, 0.8],
  [8.5, 120, -330, 1.6],
  [12.6, 120, -330, 1.7],
  [13.8, -200, -430, 1.05],
  [16.4, -230, -450, 1.05],
  [19.7, -250, -500, 0.95],
  [23.0, -230, -560, 1.2],
  [25.0, -60, -360, 1.6],
  [27.0, -230, -560, 1.1],
  [30.0, -150, -500, 0.9],
  [31.2, -150, -500, 0.95],
];
const HOME_KEYS: CamKey[] = [
  [SEC.v3.start, -230, -700, 0.75],
  [SEC.v3.start + 2.0, -230, -500, 0.8],
  [SEC.v3.start + 4.8, -100, -420, 1.0],
  [SEC.v3.start + 6.8, -40, -400, 1.15],
  [SEC.v3.start + 10.8, 150, -420, 1.0],
  [SEC.v3.start + 13.4, -100, -480, 0.9],
  [SEC.outro.start + 3.0, -420, -760, 1.0],
  [SEC.outro.start + 6.2, -420, -820, 1.15],
  [SEC.outro.end, -150, -600, 0.68],
];

/** Saltos de Nico al entrar: uno por pulso a partir de 1 s (pulsos reales de la canción). */
const ENTRY_BEATS = BEATS.filter((b) => b >= 1.0).slice(0, 5);

export function buildState(t: number): RocketBuild {
  return {
    shell: R(t, BUILD.walnut, 0.8),
    fins: [R(t, BUILD.fin1, 0.6), R(t, BUILD.fin2, 0.6), R(t, BUILD.fin3, 0.6)],
    windowK: R(t, BUILD.window, 0.6),
    nose: R(t, BUILD.nose, 0.6),
    tape: R(t, BUILD.tape, 1.2),
    lights: R(t, BUILD.lights, 0.4),
    stars: R(t, BUILD.stars, 0.8),
  };
}

export const RoomScene: React.FC<{t: number; home: boolean}> = ({t, home}) => {
  const cam: Cam = pulsed(camAt(home ? HOME_KEYS : BUILD_KEYS, t), t, 0.3);
  const night = home ? smoothstep(SEC.outro.start - 1, SEC.outro.start + 3, t) : 0;
  const v3 = SEC.v3.start;
  const materials = home ? 1 - R(t, v3 + 7, 4) : R(t, 1.2, 2.8);
  const room = {night, materials, nutOnTable: home ? 0 : 1 - R(t, BUILD.walnut - 0.6, 0.4), t, tidy: 0, zumiStar: home ? smoothstep(SEC.outro.start + 2.5, SEC.outro.start + 4, t) * (1 - smoothstep(SEC.outro.start + 7, SEC.outro.start + 8.2, t)) : 0};
  // ---------------- cohete
  let build = home ? {shell: 1, fins: [1, 1, 1] as [number, number, number], windowK: 1, nose: 1, tape: 1, stars: 1, lights: 1 - R(t, v3 + 11.2, 1.0)} : buildState(t);
  let rocketY = 0;
  let engine = 0;
  let vibr = 0;
  if (home) {
    const u = clamp((t - v3) / 2.0);
    rocketY = lerp(-2300, 0, 1 - Math.pow(1 - u, 3));
    engine = 1 - smoothstep(v3 + 1.6, v3 + 2.4, t);
    vibr = Math.max(0, 1 - Math.abs(t - (v3 + 2.0)) * 3);
    build = {...build};
  }
  // ---------------- NICO
  let nx = -1000;
  let nPose: Partial<BasePose> = {};
  let nExtra: Record<string, unknown> = {};
  let nVis = true;
  if (!home) {
    // entra saltando, un salto por pulso
    let k = 0;
    ENTRY_BEATS.forEach((b, i) => {
      if (t >= b) k = i;
    });
    const b0 = ENTRY_BEATS[k];
    const b1 = ENTRY_BEATS[Math.min(ENTRY_BEATS.length - 1, k + 1)];
    const h = hop(t, b0, Math.max(0.3, b1 - b0), 70);
    nx = t < ENTRY_BEATS[0] ? -1000 : lerp(-1000 + k * 110, -1000 + (k + 1) * 110, clamp((t - b0) / Math.max(0.3, b1 - b0)));
    nx = Math.min(nx, -560);
    nPose = {...h, y: h.dy};
    if (t > 4.8) nPose = {...point(1), expr: expr(t, 1, {mouth: 'grin'})};
    if (t > 6.0) {
      const u = clamp((t - 6.0) / 2.2);
      nx = lerp(-560, 150, u);
      nPose = u < 1 ? walk((t - 6) * 1.8) : {};
    }
    if (t > 8.2 && t < 16) {
      // recorta cartón con tijeras de punta redonda (un corte por pulso)
      const {ph} = beatPhase(t);
      nPose = {...crouch(0.35), armR: L(-1.3 + 0.25 * Math.sin(ph * Math.PI), 0.9), armL: L(0.9, -1.0), expr: expr(t, 1, {mouth: 'smile', look: {x: 0.4, y: 0.6}, brow: 0.3}), headTilt: 0.12, facing: 1};
      nExtra = {prop: 'scissors', belt: 1};
    }
    if (t >= 16) {
      const u = clamp((t - 16) / 1.4);
      nx = lerp(150, -40, u);
      nPose = u < 1 ? walk((t - 16) * 2) : {armR: L(-2.3 + 0.2 * Math.sin(t * 6), -0.4), armL: L(2.0, 0.3), expr: expr(t, 1, {mouth: 'grin'})};
      nExtra = {prop: t < 26 ? 'cardboard' : 'star', belt: 1};
      if (t > 23 && t < 25.2) nPose = {...nPose, ...dance(t, 'bounce', 0.5)};
      if (t >= BUILD.helmet - 0.6 && t < BUILD.helmet + 1.2) nPose = {armR: L(-2.8, -0.2), armL: L(2.8, 0.2), expr: expr(t, 1, {mouth: 'o', brow: 1})};
      if (t >= 29.5) nPose = {...hop(t, 29.6, 0.9, 60), expr: expr(t, 1, {mouth: 'grin'})};
    }
  } else {
    nVis = t > v3 + 2.2;
    const u = clamp((t - (v3 + 2.4)) / 1.0);
    nx = lerp(ROCKET_X, -620, u);
    nPose = u < 1 ? hop(t, v3 + 2.4, 1.0, 120) : dance(t, 'sway', 0.3);
    if (t > v3 + 4.6 && t < v3 + 6.6) nPose = {armR: L(-2.7, -0.3), armL: L(2.7, 0.3), expr: expr(t, 1, {mouth: 'grin'})};
    if (t > v3 + 7 && t < v3 + 11) {
      const w = clamp((t - (v3 + 7)) / 2);
      nx = lerp(-620, 120, w);
      nPose = w < 1 ? walk((t - v3 - 7) * 1.8) : {armR: L(-1.4, 0.6)};
      nExtra = {prop: w < 1 ? 'scissors' : 'none'};
    }
    if (t > SEC.outro.start) {
      const w = clamp((t - SEC.outro.start) / 2.4);
      nx = lerp(120, -540, w);
      nPose = w < 1 ? walk((t - SEC.outro.start) * 1.6) : {headTurn: -0.7, expr: expr(t, 1, {look: {x: -0.6, y: -1}, mouth: 'smile'}), armL: L(0.3, -0.2)};
      if (t > SEC.outro.start + 4.4 && t < SEC.outro.start + 6.4) nPose = {...nPose, ...wave(t, 1)};
    }
  }
  const nHelmet = home ? 1 - R(t, v3 + 4.8, 1.0) : R(t, BUILD.helmet, 0.5);
  const nico = nicoP(t, {x: nx, scale: 1, facing: nx < -100 || home ? 1 : -1, expr: expr(t, 1, {mouth: 'smile'}, 0), ...nPose, helmet: nHelmet}, nExtra as never, 0.7);
  if (home && t > SEC.outro.start + 2.4) nico.facing = -1;
  // ---------------- LUNA
  let lx = 280;
  let lPose: Partial<BasePose> = {};
  let lProp: 'none' | 'paper' | 'tape' | 'star' | 'tool' = 'none';
  let lSurprise = 0;
  if (!home) {
    if (t < 4.6) {
      const {ph} = beatPhase(t);
      lPose = {armR: L(-1.2 - 0.3 * Math.sin(ph * Math.PI), 0.5), headTilt: 0.06, expr: expr(t, 4, {look: {x: 0.5, y: 0.5}})};
      lProp = t > 1.2 ? 'paper' : 'none';
    } else if (t < 7) {
      lPose = wave(t, -1);
    } else if (t < 8.6) {
      const u = clamp((t - 7) / 1.6);
      lx = lerp(280, -470, u);
      lPose = walk((t - 7) * 1.9);
    } else {
      lx = -470;
      const {ph} = beatPhase(t);
      lPose = {armR: L(-1.6 + 0.35 * Math.sin(ph * Math.PI * 2), 0.4), armL: L(1.4, -0.4), expr: expr(t, 4, {mouth: 'grin', look: {x: 0.7, y: -0.2}})};
      lProp = t > 25.5 && t < 27 ? 'paper' : t > 26.5 ? 'star' : 'tape';
      if (t > 29.2) lPose = {...clap(t), expr: expr(t, 4, {mouth: 'grin'})};
    }
  } else {
    const u = clamp((t - (v3 + 2.9)) / 1.0);
    lx = lerp(ROCKET_X, 40, u);
    lPose = u < 1 ? hop(t, v3 + 2.9, 1.0, 110) : dance(t, 'sway', 0.3);
    lSurprise = t < v3 + 4 ? 1 : 0;
    if (t > v3 + 4.8 && t < v3 + 6.6) lPose = {armR: L(-2.7, -0.3), armL: L(2.7, 0.3)};
    if (t > v3 + 7.4 && t < v3 + 11) {
      const w = clamp((t - (v3 + 7.4)) / 2);
      lx = lerp(40, 300, w);
      lPose = w < 1 ? walk((t - v3 - 7.4) * 1.8) : {armR: L(-1.3, 0.5)};
      lProp = w < 1 ? 'paper' : 'none';
    }
    if (t > SEC.outro.start) {
      const w = clamp((t - SEC.outro.start - 0.4) / 2.6);
      lx = lerp(300, -320, w);
      lPose = w < 1 ? walk((t - SEC.outro.start) * 1.6) : {headTurn: -0.6, expr: expr(t, 4, {look: {x: -0.5, y: -1}, mouth: 'smile'}), armR: L(-0.3, 0.2)};
      if (t > SEC.outro.start + 5.2) lPose = {...lPose, armL: L(0.6, -1.4)}; // abraza a Nico
    }
  }
  const lHelmet = home ? 1 - R(t, v3 + 5.0, 1.0) : R(t, 29.0, 0.5);
  const luna = lunaP(t, {x: lx, facing: lx > 0 || (home && t < SEC.outro.start + 2) ? -1 : 1, expr: expr(t, 4, {mouth: 'smile'}), ...lPose, helmet: lHelmet}, {prop: lProp}, lSurprise);
  if (home && t > SEC.outro.start + 2.8) luna.facing = -1;
  // ---------------- BIP
  let bx = 620;
  let bPose: Partial<BasePose> = {};
  let screen: {mode: 'face' | 'number' | 'text' | 'heart'; value: string; face: 'happy' | 'wow' | 'wink' | 'love' | 'focus' | 'oops'} = {mode: 'face', value: '', face: 'happy'};
  let bLights = 1;
  let bProp: 'none' | 'box' | 'tape' | 'camera' | 'wrench' = 'none';
  if (!home) {
    if (t < 3.0) {
      screen = {mode: 'text', value: '', face: 'happy'};
      bLights = 0;
      bPose = {headTilt: -0.15, armL: L(0.1, 0), armR: L(-0.1, 0)};
    } else if (t < 4.3) {
      screen = {mode: 'text', value: 'HOLA', face: 'happy'};
      bLights = R(t, 3.0, 0.8);
      bPose = wave(t, 1);
    } else if (t < 6.2) {
      bPose = dance(t, 'robot', 0.6);
    } else if (t < 19.7) {
      // organiza materiales: lleva la caja de la mesa al cohete (ida y vuelta)
      const cyc = ((t - 6.2) / 6.75) % 1;
      const go = cyc < 0.5;
      const u = go ? cyc * 2 : (cyc - 0.5) * 2;
      bx = go ? lerp(600, 120, smoothstep(0.1, 0.9, u)) : lerp(120, 600, smoothstep(0.1, 0.9, u));
      bPose = {...walk((t - 6.2) * 2.4, 0.7), armL: L(1.3, -0.6), armR: L(-1.3, 0.6)};
      bProp = go ? 'box' : 'none';
      screen = {mode: 'face', value: '', face: 'focus'};
    } else {
      bx = 260;
      bPose = {armR: L(-1.5 + 0.2 * Math.sin(t * 5), 0.3)};
      bProp = t < 24 ? 'wrench' : 'none';
      screen = {mode: 'face', value: '', face: t > BUILD.window && t < BUILD.window + 2 ? 'love' : t > BUILD.lights - 0.6 ? 'wow' : 'happy'};
      if (t > BUILD.lights - 0.8 && t < BUILD.lights + 0.6) bPose = {armR: L(-1.7, 0.1), armL: L(1.7, -0.1)};
    }
  } else {
    const u = clamp((t - (v3 + 3.2)) / 1.4);
    bx = lerp(ROCKET_X, 380, u);
    bPose = u < 1 ? walk((t - v3 - 3.2) * 2.5, 0.7) : dance(t, 'robot', 0.4);
    if (t > v3 + 7.6 && t < v3 + 10.6) {
      bProp = 'box';
      bPose = {...walk((t - v3) * 2.4, 0.6), armL: L(1.3, -0.6), armR: L(-1.3, 0.6)};
      bx = lerp(380, 560, smoothstep(v3 + 7.6, v3 + 10.6, t));
    }
    if (t > v3 + 10.8 && t < SEC.outro.start + 1) {
      bx = lerp(560, -40, smoothstep(v3 + 10.8, v3 + 12, t));
      bPose = t < v3 + 12 ? walk((t - v3) * 2.4, 0.6) : {armR: L(-1.7, 0.2)};
      screen = {mode: 'face', value: '', face: t > v3 + 12.4 ? 'wink' : 'focus'};
    }
    if (t > SEC.outro.start + 1) {
      bx = -40;
      bPose = {...dance(t, 'sway', 0.25), headTurn: -0.5};
      screen = {mode: 'heart', value: '', face: 'love'};
    }
  }
  const bHelmet = home ? 1 - R(t, v3 + 5.2, 1.0) : R(t, 29.4, 0.5);
  const bip = bipP(t, {x: bx, facing: bx > 200 ? -1 : 1, ...bPose, helmet: bHelmet}, screen, {lights: bLights, prop: bProp});
  // ---------------- dibujo
  const bursts: [number, number, number][] = home
    ? [[v3 + 2.0, ROCKET_X, -200]]
    : [
        [BUILD.walnut, ROCKET_X, -250],
        [BUILD.fin1, ROCKET_X - 160, -80],
        [BUILD.fin2, ROCKET_X + 160, -80],
        [BUILD.fin3, ROCKET_X, -60],
        [BUILD.window, ROCKET_X, -280],
        [BUILD.nose, ROCKET_X, -520],
        [BUILD.helmet, -40, -230],
        [BUILD.stars, ROCKET_X, -330],
        [BUILD.lights, ROCKET_X, -180],
        [29.0, -470, -230],
        [29.4, 260, -190],
      ];
  return (
    <g>
      <RoomBack cam={cam} s={room} />
      <RoomFloor cam={cam} s={room} />
      <g transform={layerT(cam, 1)}>
        <NutRocket id="room-r" p={{x: ROCKET_X, y: rocketY, scale: 1, rot: home ? Math.sin(t * 3) * 0.04 * engine : 0, build, vibrate: vibr, engine, glow: engine * 0.4, t}} windowContent={home && t < v3 + 2.4 ? <RocketCrew t={t} mood="wave" uid="rc" /> : undefined} />
        {nVis && <Bip id="rb" p={bip} />}
        {(!home || t > v3 + 2.6) && <Luna id="rl" p={luna} />}
        {nVis && <Nico id="rn" p={nico} />}
        {bursts.map(([tb, x, y], i) => (
          <Burst key={i} x={x} y={y} u={(t - tb) / 0.9} r={200} />
        ))}
        {/* colador que se convierte en casco de juego (con chispas) */}
        {!home && t > BUILD.helmet - 1.6 && t < BUILD.helmet + 0.3 && (
          <g transform={`translate(${nx + (nico.facing === 1 ? 0 : 0)} ${-300 + (t < BUILD.helmet - 0.6 ? 0 : 0)})`} opacity={1 - smoothstep(BUILD.helmet - 0.1, BUILD.helmet + 0.3, t)}>
            <path d="M-70,-10 A70,60 0 0 1 70,-10Z" fill="#c8d2dc" stroke="#5a6470" strokeWidth={5} />
            {Array.from({length: 12}, (_, i) => (
              <circle key={i} cx={-48 + (i % 6) * 19} cy={-34 + Math.floor(i / 6) * 16} r={3.5} fill="#5a6470" />
            ))}
            <rect x={70} y={-18} width={60} height={12} rx={6} fill="#8a94a0" />
          </g>
        )}
      </g>
    </g>
  );
};

