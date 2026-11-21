// Tripulación 2.0 y vistas por la ventana:
//  · CrewInWindow: los tres (con casco) en miniatura dentro de la ventana del cohete exterior.
//  · CockpitCrew: los tres en la cabina, en sus asientos o flotando (gravedad cero), con modos
//    de actuación (pilotar, aceleración, cantar, asombro, señalar, foto, saludar, bailar).
//  · WinView: lo que se ve por la ventana de la cabina (estrellas en movimiento, nubes, Luna,
//    Tierra, nave de Zumi).
import React from 'react';
import {clamp, hash1, lerp} from '../../../../engine/math';
import {Earth, ZumiShip} from '../../Environments/Space';
import {beatPhase} from '../../MusicSync/songMap';
import {bip2, bipDance, cheer, ex, hold, L, luna2, lunaDance, nico2, nicoDance, PK, pointAt, waveArm, zumi2, zumiDance} from '../Animation/acting';
import {Bip2} from '../Characters/Bip2';
import {Luna2} from '../Characters/Luna2';
import {Nico2} from '../Characters/Nico2';
import {Zumi2} from '../Characters/Zumi2';
import {CheeseMoon2} from './Space2';

export type CrewMode = 'pilot' | 'press' | 'sing' | 'wow' | 'point' | 'photo' | 'wave' | 'cheer' | 'float' | 'dance' | 'helmet';

/** Pose de cada tripulante según el modo. `lt` = tiempo local del plano. */
export function crewPoses(t: number, mode: CrewMode, lt = 0, rim = '#ffffff') {
  const seatY = 330;
  const fl = mode === 'float' || mode === 'dance';
  const bob = (s: number) => (fl ? Math.sin(t * 1.3 + s) * 16 : 0);
  const base = {helmet: 1, rimColor: rim, rimK: 0.45};
  const look = (x: number, y: number) => ({x, y});
  // NICO (centro)
  let n: PK = {x: 0, y: seatY, scale: 1.7, ...base, armL: L(-0.75, 1.25), armR: L(0.75, -1.25), gripL: 1, gripR: 1, expr: ex(t, 1, {mouth: 'grin', brow: 0.3}, 0.6)};
  let l: PK = {x: 380, y: seatY - 10, scale: 1.3, facing: -1, ...base, armL: L(-0.6, 1.0), armR: L(0.6, -1.0), expr: ex(t, 4, {mouth: 'grin'}, 0.5)};
  let b: PK = {x: -380, y: seatY - 10, scale: 1.3, ...base, armL: L(-0.5, 0.8), armR: L(0.5, -0.8)};
  let bFace: 'happy' | 'wow' | 'focus' | 'laugh' | 'love' | 'stars' = 'happy';
  let bScreen: 'face' | 'camera' | 'photo' = 'face';
  let lSurprise = 0;
  switch (mode) {
    case 'pilot':
      n = {...n, lean: Math.sin(t * 1.5) * 0.05, expr: ex(t, 1, {mouth: 'grin', eyes: 'squint', browL: -0.4, browR: -0.4})};
      bFace = 'focus';
      break;
    case 'press': {
      const g = Math.exp(-lt * 0.6);
      const sh = Math.sin(t * 50) * 3 * g;
      n = {...n, squash: 0.12 * g, dx: sh, expr: ex(t, 1, {mouth: 'ee', eyes: 'squint', cheeks: 1, browL: -0.6, browR: -0.6})};
      l = {...l, squash: 0.12 * g, dx: -sh, expr: ex(t, 4, {mouth: 'laugh', eyes: 'happy', cheeks: 1})};
      b = {...b, squash: 0.1 * g, dx: sh};
      bFace = 'stars';
      break;
    }
    case 'sing':
      n = {...n, lean: Math.sin(t * 3.4) * 0.08, headTilt: Math.sin(t * 3.4 + 1) * 0.1, expr: ex(t, 1, {mouth: 'grin'}, 1)};
      l = {...l, headTilt: Math.sin(t * 3.4) * 0.1, expr: ex(t, 4, {mouth: 'grin'}, 0.9)};
      b = {...b, headTilt: Math.sin(t * 3.4 + 2) * 0.12};
      break;
    case 'wow':
      n = {...n, armL: L(-1.0, 2.0), armR: L(1.0, -2.0), expr: ex(t, 1, {mouth: 'o', eyes: 'wide', brow: 1, look: look(0, -1)})};
      l = {...l, armL: L(-0.6, 2.2), armR: L(0.6, -2.2), headTurn: 0.4, expr: ex(t, 4, {mouth: 'o', eyes: 'wide', brow: 1, look: look(-0.3, -1)})};
      bFace = 'wow';
      lSurprise = 1;
      break;
    case 'point':
      n = {...n, ...pointAt(1, 1.2), headTurn: 0.5, expr: ex(t, 1, {mouth: 'open', eyes: 'wide', brow: 0.6, look: look(0.6, -0.9)})};
      l = {...l, headTurn: 0.6, expr: ex(t, 4, {mouth: 'o', look: look(-0.4, -1), brow: 1})};
      bFace = 'focus';
      break;
    case 'photo':
      b = {...b, armR: L(2.5, 1.4), armL: L(-2.4, -1.4), gripR: 1, gripL: 1, holdR: hold('camera', Math.PI, 1.4)};
      bScreen = lt > 0.6 && lt < 1.6 ? 'photo' : 'camera';
      n = {...n, ...cheer(t), expr: ex(t, 1, {mouth: 'grin', eyes: 'happy', cheeks: 1})};
      l = {...l, armR: L(2.6, 0.6), armL: L(-1.0, 1.6), gripR: 0.3, expr: ex(t, 4, {mouth: 'grin', eyes: 'happy', cheeks: 1})};
      break;
    case 'wave':
      n = {...n, ...waveArm(t, 1), expr: ex(t, 1, {mouth: 'laugh', eyes: 'happy', cheeks: 1})};
      l = {...l, ...waveArm(t + 0.3, 1, 11), expr: ex(t, 4, {mouth: 'laugh', eyes: 'happy', cheeks: 1})};
      b = {...b, ...waveArm(t + 0.6, 1, 12)};
      bFace = 'love';
      break;
    case 'cheer':
      n = {...n, ...cheer(t), expr: ex(t, 1, {mouth: 'laugh', eyes: 'happy', cheeks: 1})};
      l = {...l, ...cheer(t + 0.2), expr: ex(t, 4, {mouth: 'laugh', eyes: 'happy', cheeks: 1})};
      b = {...b, ...cheer(t + 0.4)};
      bFace = 'laugh';
      break;
    case 'float':
      n = {...n, y: 210 + bob(0), lean: Math.sin(t * 0.9) * 0.15, armL: L(-1.3, 0.4), armR: L(1.3, -0.4), legL: L(0.4, -0.6), legR: L(-0.3, 0.4), expr: ex(t, 1, {mouth: 'laugh', eyes: 'happy', cheeks: 1})};
      l = {...l, y: 190 + bob(2), lean: Math.sin(t * 0.8 + 1) * 0.2, spin: t * 0.6, armL: L(-1.6, 0.3), armR: L(1.6, -0.3), expr: ex(t, 4, {mouth: 'laugh', eyes: 'happy', cheeks: 1})};
      b = {...b, y: 200 + bob(4), lean: t * 0.5};
      break;
    case 'dance': {
      const nd = nicoDance(t, 1);
      const ld = lunaDance(t, 0.8);
      const bd = bipDance(t, 0.8);
      n = {...n, ...nd, y: 230 + bob(0), expr: ex(t, 1, {mouth: 'grin'}, 1)};
      l = {...l, ...ld, y: 220 + bob(2), expr: ex(t, 4, {mouth: 'grin', eyes: beatPhase(t).i % 4 === 0 ? 'happy' : 'normal'}, 0.9)};
      b = {...b, ...bd, y: 230 + bob(4)};
      bFace = beatPhase(t).i % 2 ? 'happy' : 'laugh';
      break;
    }
    case 'helmet': {
      const k = clamp(lt / 0.5);
      l = {...l, helmet: k, armL: L(-2.4, -1.0), armR: L(2.4, 1.0), gripL: 1, gripR: 1, headTilt: 0.08 * Math.sin(t * 8), expr: ex(t, 4, {mouth: 'grin', eyes: k < 1 ? 'squint' : 'happy'})};
      b = {...b, helmet: k};
      break;
    }
  }
  return {
    nico: nico2(t, n, {}, 0.7),
    luna: luna2(t, l, lSurprise),
    bip: bip2(t, b, {face: bFace, mode: bScreen}),
  };
}

export const CockpitCrew: React.FC<{t: number; mode: CrewMode; lt?: number; uid: string; rim?: string}> = ({t, mode, lt = 0, uid, rim}) => {
  const c = crewPoses(t, mode, lt, rim);
  return (
    <g>
      <Bip2 id={`${uid}b`} p={c.bip} />
      <Luna2 id={`${uid}l`} p={c.luna} />
      <Nico2 id={`${uid}n`} p={c.nico} />
    </g>
  );
};

/** Los tres en miniatura (con casco) dentro de la ventana del cohete exterior (centro 0,−280). */
export const CrewInWindow: React.FC<{t: number; mode: 'pilot' | 'wave' | 'wow' | 'dance' | 'cheer'; uid: string}> = ({t, mode, uid}) => {
  const ph = beatPhase(t).ph;
  const d = mode === 'dance' ? -8 * Math.sin(ph * Math.PI) : 0;
  const ex1 = (s: number) => ex(t, s, mode === 'wow' ? {mouth: 'o', eyes: 'wide', brow: 1} : {mouth: 'laugh', eyes: mode === 'pilot' ? 'normal' : 'happy', cheeks: 1});
  const arms = (s: number): PK => (mode === 'wave' ? waveArm(t + s, 1) : mode === 'cheer' || mode === 'dance' ? cheer(t + s) : {});
  return (
    <g transform="translate(0 -250)">
      <rect x={-70} y={-80} width={140} height={110} fill="#2a2a6a" />
      <Bip2 id={`${uid}b`} p={bip2(t, {x: -40, y: 30 + d, scale: 0.27, helmet: 1, ...arms(0.4)}, {face: mode === 'wow' ? 'wow' : 'happy'})} />
      <Luna2 id={`${uid}l`} p={luna2(t, {x: 38, y: 32 + d, scale: 0.26, helmet: 1, facing: -1, ...arms(0.2), expr: ex1(4)})} />
      <Nico2 id={`${uid}n`} p={nico2(t, {x: 0, y: 40 + d, scale: 0.3, helmet: 1, ...arms(0), expr: ex1(1)})} />
    </g>
  );
};

/** Vista por la ventana de la cabina (coordenadas de la capa de la cabina; ventana en 0,−560). */
export type WinKind = 'stars' | 'clouds' | 'moon' | 'earth' | 'zumi' | 'sky' | 'nebula';
export const WinView: React.FC<{t: number; kind: WinKind; local: number; speed?: number; zumiWave?: number}> = ({t, kind, local, speed = 1, zumiWave = 0}) => {
  const skyTop = kind === 'sky' || kind === 'clouds' ? '#5db8ff' : kind === 'nebula' ? '#3a1a6a' : '#1a1050';
  const skyBot = kind === 'sky' || kind === 'clouds' ? '#bfe6ff' : kind === 'nebula' ? '#8a2a7a' : '#2a2a8a';
  return (
    <g>
      <defs>
        <linearGradient id={`wv${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBot} />
        </linearGradient>
      </defs>
      <rect x={-400} y={-900} width={800} height={700} fill={`url(#wv${kind})`} />
      {kind !== 'sky' && kind !== 'clouds' &&
        Array.from({length: 60}, (_, i) => {
          const z = 0.3 + hash1(i * 3) * 0.7;
          const y = -900 + ((hash1(i * 7) * 700 + t * 160 * speed * z) % 700);
          return <circle key={i} cx={-380 + hash1(i) * 760} cy={y} r={1.5 + z * 3} fill="#ffffff" opacity={0.4 + 0.5 * z} />;
        })}
      {kind === 'nebula' && <ellipse cx={0} cy={-560} rx={300} ry={160} fill="#ff7ab0" opacity={0.25} />}
      {(kind === 'clouds' || kind === 'sky') &&
        Array.from({length: 10}, (_, i) => {
          const y = -980 + ((hash1(i * 5) * 900 + t * 900 * speed) % 900);
          const x = -380 + hash1(i * 9) * 760;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${0.8 + hash1(i) * 0.8})`}>
              <ellipse rx={120} ry={46} fill="#ffffff" opacity={0.9} />
              <ellipse cx={-40} cy={-24} rx={70} ry={46} fill="#ffffff" opacity={0.9} />
              <ellipse cx={46} cy={-18} rx={60} ry={40} fill="#ffffff" opacity={0.9} />
            </g>
          );
        })}
      {kind === 'moon' && <CheeseMoon2 x={lerp(60, -20, clamp(local / 3))} y={-540} r={lerp(220, 260, clamp(local / 3))} t={t} />}
      {kind === 'earth' && <Earth x={0} y={-500} r={200} t={t} />}
      {kind === 'zumi' && (
        <ZumiShip x={lerp(320, 30, clamp(local / 1.2))} y={-560 + Math.sin(t * 2) * 12} s={1.15} rot={Math.sin(t * 1.5) * 0.08} t={t} inside={<g transform="translate(0 -10)"><Zumi2 id="wvz" p={zumi2(t, {y: 40, scale: 0.55, ...(zumiWave > 0 ? waveArm(t, 1) : {}), expr: ex(t, 9, {mouth: 'grin', eyes: zumiWave > 0 ? 'happy' : 'normal'})})} /></g>} />
      )}
    </g>
  );
};

/** Zumi bailando (para los planos de coreografía). */
export const zumiDancing = (t: number, o: PK = {}) => zumi2(t, {...zumiDance(t, 1), ...o, expr: ex(t, 9, {mouth: 'grin', eyes: beatPhase(t).i % 4 === 3 ? 'happy' : 'normal'}, 0.7)});
