// LA MEDUSA INMORTAL (Turritopsis dohrnii): campana + tentáculos con el orden de dibujo correcto
// (tentáculos traseros → pared trasera → tentáculos delanteros → cuerpo translúcido y órganos).
// La pose controla nado, contracción, corriente, peligro y las fases de la transformación.
import React from 'react';
import {clamp} from '../../../engine/math';
import {JellyPose, PULSE_PERIOD} from '../Animation/jellyMotion';
import {BellBack, BellFront, bellShape} from './JellyfishBell';
import {Tentacles} from './JellyfishTentacles';

export type JellyMorph = {evert: number; blob: number; tissue: number; cells: number};
export const NO_MORPH: JellyMorph = {evert: 0, blob: 0, tissue: 0, cells: 0};

export const ImmortalJellyfish: React.FC<{p: JellyPose; uid: string; morph?: JellyMorph; period?: number}> = ({p, uid, morph = NO_MORPH, period = PULSE_PERIOD}) => {
  const s = bellShape(p.contract * (1 - morph.blob), morph.evert, morph.blob, p.t);
  // velocidad en coordenadas locales (la medusa puede ir inclinada)
  const co = Math.cos(-p.rot);
  const si = Math.sin(-p.rot);
  const vLocal = {x: p.vx * co - p.vy * si, y: p.vx * si + p.vy * co};
  const young = p.young ?? 0;
  const tp = {
    t: p.t,
    n: p.tentacles ?? Math.round(40 - 28 * young),
    len: 240 * (1 - 0.35 * young),
    retract: clamp(Math.max(p.retract, morph.evert * 0.9, morph.blob)),
    vLocal,
    current: p.current,
    alarm: p.alarm,
    pulsePhaseT: p.t,
    period,
    glow: p.glow,
    tissue: morph.tissue,
  };
  const showT = tp.retract < 0.99;
  return (
    <g transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${((p.rot * 180) / Math.PI).toFixed(2)}) scale(${(p.scale * (1 - 0.3 * young)).toFixed(3)})`}>
      {showT && <Tentacles s={s} p={tp} front={false} />}
      <BellBack s={s} uid={uid} glow={p.glow} tissue={morph.tissue} />
      {showT && <Tentacles s={s} p={tp} front />}
      <BellFront s={s} uid={uid} t={p.t} glow={p.glow} tissue={morph.tissue} c={p.contract} cells={morph.cells} />
    </g>
  );
};
