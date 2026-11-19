// Hoja de control del Ep. 05: la planta en varios estados y vistas (mismo rig del episodio).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONT_FAMILY} from '../../../engine/fonts';
import {OPEN_STATE, trapGeo, TrapState} from '../anatomy/flytrap';
import {makeView, project} from '../anatomy/proj';
import {sortItems} from '../anatomy/render';
import {TRAPS} from '../scenes/plantLayout';
import {flytrapItems} from './VenusFlytrap';
import {FlyDefs, flyItems, FlyPose} from './Fly';
import {SPIDER_LEGS, spiderItems} from './Spider';
import {V3} from '../anatomy/proj';

const REST: [number, number][] = [[24, 15], [24, -15], [5, 22], [5, -22], [-17, 18], [-17, -18]];
const flyStand = (yaw: number, extra: Partial<FlyPose> = {}): FlyPose => {
  const f: V3 = [Math.cos(yaw), 0, Math.sin(yaw)];
  const sd: V3 = [-Math.sin(yaw), 0, Math.cos(yaw)];
  return {pos: [0, 12, 0], fwd: f, up: [0, 1, 0], scale: 1, feet: REST.map(([a, b]) => [f[0] * a + sd[0] * -b, 0, f[2] * a + sd[2] * -b] as V3), legExtend: 0, wingBuzz: 0, wingSpread: 0.2, headYaw: 0, headPitch: 0, proboscis: 0, dry: 0, opacity: 1, t: 1, ...extra};
};
const FLY_PANELS: {title: string; pitch: number; pose: FlyPose}[] = [
  {title: 'MOSCA · PERFIL', pitch: 0.12, pose: flyStand(0, {proboscis: 0.8})},
  {title: 'MOSCA · DORSAL', pitch: 1.35, pose: flyStand(-0.4)},
  {title: 'VUELO (alas desenfocadas)', pitch: 0.3, pose: {...flyStand(0.3), pos: [0, 30, 0], feet: [null, null, null, null, null, null], wingBuzz: 1, legExtend: 0.2}},
  {title: 'ATERRIZAJE', pitch: 0.25, pose: {...flyStand(-0.3), pos: [0, 30, 0], feet: [null, null, null, null, null, null], wingBuzz: 1, legExtend: 1}},
  {title: 'RESTOS SECOS', pitch: 0.7, pose: flyStand(0.6, {dry: 1, wingSpread: 0.8})},
];

const st = (o: Partial<TrapState>): TrapState => ({...OPEN_STATE, ...o});
const PANELS: {title: string; pitch: number; yaw: number; state: TrapState; zoom: number; hero: boolean}[] = [
  {title: 'ROSETA', pitch: 0.5, yaw: 0, state: OPEN_STATE, zoom: 0.4, hero: false},
  {title: 'ABIERTA (OPEN_IDLE)', pitch: 0.75, yaw: 0, state: OPEN_STATE, zoom: 1.4, hero: true},
  {title: 'CERRADA (INITIAL_CLOSED)', pitch: 0.3, yaw: 0, state: st({open: 0.06, curv: 1, cilia: -1}), zoom: 1.4, hero: true},
  {title: 'SELLADA', pitch: 0.3, yaw: 0, state: st({open: 0.0, curv: 1, cilia: 0.8, seal: 1}), zoom: 1.4, hero: true},
];

export const Ep05Characters: React.FC = () => (
  <AbsoluteFill style={{background: '#20301c'}}>
    <svg width={0} height={0} style={{position: 'absolute'}}>
      <FlyDefs />
    </svg>
    {PANELS.map((p, i) => {
      const view = makeView(p.yaw, p.pitch);
      const states = Object.fromEntries(TRAPS.map((t) => [t.id, t.id === 'T1' ? p.state : OPEN_STATE]));
      const {items} = flytrapItems({view, specs: TRAPS, states, t: 2, uid: `sc${i}`, light: '#fff4d0'});
      const hg = trapGeo(TRAPS[4], p.state, 2);
      const hc = project(view, hg.C);
      const cx = p.hero ? hc.x : 0;
      const cy = p.hero ? hc.y : -60;
      const x = (i % 2) * 540;
      const y = Math.floor(i / 2) * 960;
      return (
        <div key={i} style={{position: 'absolute', left: x, top: y, width: 540, height: 960, overflow: 'hidden', borderRight: '2px solid #000', borderBottom: '2px solid #000'}}>
          <svg width={540} height={960}>
            <g transform={`translate(270 520) scale(${p.zoom}) translate(${-cx} ${-cy})`}>{sortItems(items).map((it) => it.node)}</g>
          </svg>
          <div style={{position: 'absolute', top: 20, left: 0, right: 0, textAlign: 'center', color: '#fff', fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 26}}>{p.title}</div>
        </div>
      );
    })}
  </AbsoluteFill>
);

export const Ep05Creatures: React.FC = () => (
  <AbsoluteFill style={{background: '#33402c'}}>
    <svg width={0} height={0} style={{position: 'absolute'}}>
      <FlyDefs />
    </svg>
    {FLY_PANELS.map((p, i) => {
      const view = makeView(0, p.pitch);
      const items = flyItems(view, p.pose, `fp${i}`);
      const x = (i % 2) * 540;
      const y = Math.floor(i / 2) * 640;
      return (
        <div key={i} style={{position: 'absolute', left: x, top: y, width: 540, height: 640, overflow: 'hidden', border: '1px solid #000'}}>
          <svg width={540} height={640}>
            <ellipse cx={270} cy={360 + 12 * 5.5 * Math.cos(p.pitch) * 0} rx={260} ry={260 * Math.sin(p.pitch) + 4} fill="#5d6b3e" opacity={0.6} />
            <g transform="translate(270 360) scale(5.5)">{sortItems(items).map((it) => it.node)}</g>
          </svg>
          <div style={{position: 'absolute', top: 16, left: 0, right: 0, textAlign: 'center', color: '#fff', fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 26}}>{p.title}</div>
        </div>
      );
    })}
    {(() => {
      const view = makeView(0, 0.55);
      const feet = SPIDER_LEGS.map((l) => [l.fwd, 0, -l.side] as V3);
      const items = spiderItems(view, {pos: [0, 9, 0], fwd: [1, 0, 0], up: [0, 1, 0], scale: 1, feet, frontRaise: 0.6, opacity: 1}, 'sp');
      return (
        <div style={{position: 'absolute', left: 540, top: 1280, width: 540, height: 640, overflow: 'hidden', border: '1px solid #000'}}>
          <svg width={540} height={640}>
            <g transform="translate(270 340) scale(6)">{sortItems(items).map((it) => it.node)}</g>
          </svg>
          <div style={{position: 'absolute', top: 16, left: 0, right: 0, textAlign: 'center', color: '#fff', fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 26}}>ARAÑA · REACCIÓN</div>
        </div>
      );
    })()}
  </AbsoluteFill>
);
