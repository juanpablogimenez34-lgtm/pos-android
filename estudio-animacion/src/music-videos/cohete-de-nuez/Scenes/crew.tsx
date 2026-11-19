// Tripulación vista por la ventana del cohete en los planos exteriores (mismos personajes, en
// miniatura y con casco), para no perder la continuidad: siempre van dentro de la nave.
import React from 'react';
import {Bip} from '../Characters/Bip';
import {Luna} from '../Characters/Luna';
import {Nico} from '../Characters/Nico';
import {bipP, lunaP, nicoP} from '../Animation/cast';
import {dance, expr, float, L} from '../Animation/moves';

export type CrewMood = 'pilot' | 'dance' | 'look' | 'wave' | 'wow' | 'float';

export const RocketCrew: React.FC<{t: number; mood: CrewMood; uid: string}> = ({t, mood, uid}) => {
  const d = mood === 'dance' ? 1 : 0;
  const wave = mood === 'wave';
  const wow = mood === 'wow';
  const fl = mood === 'float' ? float(t, 1) : {};
  const ex = (seed: number) => expr(t, seed, wow ? {mouth: 'o', brow: 1} : {mouth: 'grin'}, mood === 'dance' ? 0.8 : 0);
  return (
    <g transform="translate(0 -250)">
      <Bip id={`${uid}b`} p={bipP(t, {x: -36, y: 40, scale: 0.19, helmet: 1, ...(d ? dance(t, 'robot') : {}), ...(wave ? {armR: L(-2.6 + Math.sin(t * 10) * 0.3, -0.4)} : {})}, {face: wow ? 'wow' : 'happy'})} />
      <Luna id={`${uid}l`} p={lunaP(t, {x: 34, y: 46, scale: 0.18, helmet: 1, facing: -1, expr: ex(4), ...(d ? dance(t, 'sway') : {}), ...fl, ...(wave ? {armR: L(-2.7 + Math.sin(t * 11) * 0.3, -0.5)} : {})}, {}, wow ? 1 : 0)} />
      <Nico id={`${uid}n`} p={nicoP(t, {x: 0, y: 58, scale: 0.2, helmet: 1, expr: ex(1), ...(d ? dance(t, 'bounce') : {}), ...(wave ? {armR: L(-2.7 + Math.sin(t * 9) * 0.3, -0.5)} : {}), ...(mood === 'pilot' ? {armL: L(0.9, -1.2), armR: L(-0.9, 1.2)} : {})})} />
    </g>
  );
};
