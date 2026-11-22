// MATERIALES DEL PEZ REMO: paleta inspirada en la maqueta (azul marino dorsal → azul acero → plata →
// lavanda → vientre perlado), rampa de bandas de piel (se dibujan como polígonos entre curvas
// desplazadas, así el sombreado se DEFORMA con el cuerpo), irisación deslizante y utilidades de
// iluminación (exposición y niebla) aplicadas como degradados a lo largo del cuerpo.
import React from 'react';
import {mixColor} from '../../engine/math';
import {f1, V2} from './OarfishRig';

export const MAT = {
  navy: '#16234a',
  steel: '#5d74b8',
  silver: '#dbe4ee',
  pearl: '#f3f7fb',
  red: '#e5293b',
  redDeep: '#7a0c1c',
  rim: '#9fe8ff',
  spot: '#1c2442',
  water: '#061a30',
};

/** Rampa dorso → vientre (10 bandas). */
export const SKIN_RAMP = ['#121d40', '#22337a', '#3d55a6', '#6f86c8', '#a9bbe8', '#d6e0ee', '#e2e8f2', '#cfcdee', '#e4e6f6', '#f4f8fb'];

/** Color de banda con exposición (0 oscuro … 1 iluminado). */
export const shade = (c: string, exposure: number) => mixColor('#030812', c, 0.1 + 0.9 * Math.max(0, Math.min(1, exposure)));

/** Degradado a lo largo del cuerpo (cabeza → cola) en espacio de usuario. */
export const AlongGradient: React.FC<{id: string; from: V2; to: V2; stops: [number, string, number][]}> = ({id, from, to, stops}) => (
  <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={f1(from.x)} y1={f1(from.y)} x2={f1(to.x)} y2={f1(to.y)}>
    {stops.map(([o, c, a], i) => (
      <stop key={i} offset={o.toFixed(3)} stopColor={c} stopOpacity={a.toFixed(3)} />
    ))}
  </linearGradient>
);

/** Irisación azul-violeta que se desliza. */
export const IridescentGradient: React.FC<{id: string; shift: number}> = ({id, shift}) => (
  <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="-620" y2="0" spreadMethod="repeat" gradientTransform={`translate(${shift.toFixed(1)} 0)`}>
    <stop offset="0" stopColor="#7fa8ff" stopOpacity={0} />
    <stop offset="0.25" stopColor="#8f7cff" stopOpacity={0.55} />
    <stop offset="0.5" stopColor="#7fe8ff" stopOpacity={0.15} />
    <stop offset="0.75" stopColor="#c89cff" stopOpacity={0.5} />
    <stop offset="1" stopColor="#7fa8ff" stopOpacity={0} />
  </linearGradient>
);
