// PULPO DE ANILLOS AZULES (Hapalochlaena lunulata) sobre el MOTOR DE PULPO APROBADO (src/creatures/octopus),
// usado sin modificarlo: se define un rig propio (más pequeño y compacto, brazos relativamente cortos) y una
// piel amarillenta/parda clara. Encima se dibujan los ANILLOS AZULES, colocados sobre la geometría de los
// brazos y del manto en cada fotograma; su intensidad (`rings`) sube cuando el animal se siente amenazado.
// Son pigmento iridiscente con borde oscuro: no se dibujan como luces ni descargas.
import React from 'react';
import {clamp, mixColor} from '../../../engine/math';
import {Octopus} from '../../../creatures/octopus/Octopus';
import {computeOctopusPose, MotionSample} from '../../../creatures/octopus/pose';
import {OCTOPUS_VULGARIS, OctopusRig} from '../../../creatures/octopus/rig';
import {stateAt, StateKey} from '../../../creatures/octopus/states';

export const HAPALOCHLAENA: OctopusRig = {
  ...OCTOPUS_VULGARIS,
  armLength: 250,
  armBaseWidth: 15,
  mantleLength: 120,
  mantleWidth: 50,
  headW: 50,
  headH: 40,
  eyeRadius: 15,
  gaitPeriod: 1.0,
  skin: {
    ...OCTOPUS_VULGARIS.skin,
    base: '#c8a868',
    shadow: '#6a5230',
    highlight: '#ecd49a',
    spotDark: '#7a5a2a',
    spotLight: '#f2e0b0',
    underside: '#e8d6a8',
    sucker: '#f2e6c8',
    suckerRim: '#a88a58',
    camoBase: '#9a8458',
    camoShadow: '#4a3a22',
    camoHighlight: '#c8b488',
    camoSpotDark: '#4a3a22',
    camoSpotLight: '#d8c8a0',
    pale: '#f0e2c0',
    dark: '#5a3a1a',
    iris: '#d8b860',
    irisEdge: '#6a4a1a',
  },
};

export const BlueRingedOctopus: React.FC<{t: number; id: string; timeline: StateKey[]; motion: (t: number) => MotionSample; ground?: (x: number) => number; rings: number; segments?: number}> = ({t, id, timeline, motion, ground, rings, segments = 22}) => {
  const state = stateAt(timeline, t);
  const pose = computeOctopusPose({t, rig: HAPALOCHLAENA, state, motion, ground, segments, seed: 5});
  const k = clamp(rings);
  const ringC = mixColor('#5a8ab0', '#2ea8ff', k);
  const items: React.ReactNode[] = [];
  pose.arms.forEach((arm) => {
    const n = arm.pts.length;
    for (let j = 2; j < n - 3; j += 3) {
      const p = arm.pts[j];
      const w = arm.widths[j];
      items.push(
        <g key={`${arm.index}-${j}`} opacity={0.35 + 0.65 * k}>
          <circle cx={p.x} cy={p.y} r={w * 0.62} fill="none" stroke="#1a140c" strokeWidth={w * 0.32} />
          <circle cx={p.x} cy={p.y} r={w * 0.62} fill="none" stroke={ringC} strokeWidth={w * 0.2} />
        </g>,
      );
    }
  });
  const m = pose.mantle;
  for (let j = 2; j < m.axis.length - 1; j += 2) {
    for (const side of [-0.55, 0.55]) {
      const a = m.axis[j];
      const hw = m.halfW[j];
      const q = pose.toWorld({x: a.x + Math.cos(m.dir + Math.PI / 2) * hw * side, y: a.y + Math.sin(m.dir + Math.PI / 2) * hw * side});
      const r = hw * 0.22 * pose.body.scale;
      items.push(
        <g key={`m${j}${side}`} opacity={0.35 + 0.65 * k}>
          <circle cx={q.x} cy={q.y} r={r} fill="none" stroke="#1a140c" strokeWidth={r * 0.55} />
          <circle cx={q.x} cy={q.y} r={r} fill="none" stroke={ringC} strokeWidth={r * 0.34} />
        </g>,
      );
    }
  }
  return (
    <g>
      <Octopus id={id} pose={pose} skin={HAPALOCHLAENA.skin} groundY={ground ? ground(pose.body.x) : undefined} />
      {items}
    </g>
  );
};
