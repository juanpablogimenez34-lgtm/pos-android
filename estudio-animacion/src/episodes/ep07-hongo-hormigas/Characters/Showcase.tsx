// Fichas de continuidad del Ep. 07 (mismo rig que el episodio): Camponotus rufipes en vistas
// lateral y dorsal, mandíbulas abiertas y cerradas, limpieza, y las etapas visibles del hongo.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONT_FAMILY} from '../../../engine/fonts';
import {makeView, project, V3} from '../Animation/proj';
import {sortItems} from '../Animation/render';
import {AntPose, antItems} from './Ant';
import {ANT_BODY_H, ANT_LEGS, HERO} from './antSpec';

const base = (o: Partial<AntPose> = {}): AntPose => {
  const feet = ANT_LEGS.map((l) => [l.fwd, 0, l.side] as V3);
  return {pos: [0, ANT_BODY_H, 0], fwd: [1, 0, 0], up: [0, 1, 0], feet, antenna: [{yaw: 0.4, pitch: 0.3, elbow: 0.6}, {yaw: 0.5, pitch: 0.25, elbow: 0.7}], mandible: 0.15, headYaw: 0, headPitch: 0, gasterPitch: 0, dead: 0, hyphae: 0, stalk: 0, ascoma: 0, stalkDir: [0, 1, 0], opacity: 1, t: 1, ...o};
};

const Panel: React.FC<{x: number; y: number; w: number; h: number; title: string; sub?: string; pose: AntPose; pitch: number; yaw?: number; zoom: number; cy?: number}> = ({x, y, w, h, title, sub, pose, pitch, yaw = 0, zoom, cy = 0.6}) => {
  const view = makeView(yaw, pitch);
  const {items} = antItems(view, HERO, pose, `p${x}${y}`);
  const c = project(view, pose.pos);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', border: '2px solid #0b140c'}}>
      <svg width={w} height={h}>
        <rect width={w} height={h} fill="#2b3f2c" />
        <ellipse cx={w / 2} cy={h * cy + 14 * zoom} rx={w * 0.42} ry={Math.max(4, w * 0.42 * Math.sin(pitch))} fill="#6a4a2a" opacity={0.5} />
        <g transform={`translate(${w / 2} ${h * cy}) scale(${zoom}) translate(${-c.x} ${-c.y})`}>{sortItems(items).map((i) => i.node)}</g>
      </svg>
      <div style={{position: 'absolute', top: 14, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_FAMILY, color: '#fff'}}>
        <div style={{fontWeight: 900, fontSize: 28}}>{title}</div>
        {sub && <div style={{fontWeight: 600, fontSize: 19, color: '#d8efc0'}}>{sub}</div>}
      </div>
    </div>
  );
};

export const Ep07Characters: React.FC = () => (
  <AbsoluteFill style={{background: '#1a2a1b'}}>
    <Panel x={0} y={0} w={1080} h={560} title="CAMPONOTUS RUFIPES · obrera protagonista" sub="6 patas · antenas acodadas · mandíbulas · mesosoma, pecíolo y gáster · sin alas · patas pardo-rojizas" pose={base()} pitch={0.22} zoom={7} />
    <Panel x={0} y={560} w={540} h={480} title="VISTA DORSAL" pose={base()} pitch={1.45} zoom={4} cy={0.55} />
    <Panel x={540} y={560} w={540} h={480} title="MANDÍBULAS ABIERTAS" pose={base({mandible: 1, headPitch: -0.1})} pitch={0.9} yaw={-0.6} zoom={6} />
    <Panel x={0} y={1040} w={540} h={440} title="FILAMENTOS DEL HONGO" sub="tras la muerte (acelerado)" pose={base({dead: 1, hyphae: 1, stalkDir: [0, 1, 0]})} pitch={0.3} zoom={5} />
    <Panel x={540} y={1040} w={540} h={440} title="TALLO + ESTRUCTURA FÉRTIL" sub="sale de detrás de la cabeza" pose={base({dead: 1, hyphae: 1, stalk: 1, ascoma: 1, stalkDir: [0.2, 1, 0]})} pitch={0.15} zoom={2.2} cy={0.82} />
    <Panel x={0} y={1480} w={1080} h={440} title="ANTENA (CLOSE-UP)" sub="escapo largo + funículo segmentado" pose={base({antenna: [{yaw: 0.2, pitch: 0.5, elbow: 0.9}, {yaw: 0.6, pitch: 0.2, elbow: 0.4}]})} pitch={0.35} yaw={0.5} zoom={9} cy={0.75} />
  </AbsoluteFill>
);
