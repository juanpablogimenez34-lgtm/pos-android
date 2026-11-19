// Fichas de personaje del Ep. 06 (mismo rig que el episodio): ajolote rosado (protagonista),
// ajolote silvestre, Daphnia y la secuencia de regeneración de la extremidad anterior izquierda.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONT_FAMILY} from '../../../engine/fonts';
import {buildPose, MotionParams} from '../Animation/axolotlMotion';
import {makeView, project, V3} from '../Animation/proj';
import {sortItems} from '../Animation/render';
import {axolotlItems} from './Axolotl';
import {AxolotlSpec, PINK, WILD} from './axolotlSpec';
import {daphniaItems} from './Daphnia';

const M = (o: Partial<MotionParams>): MotionParams => ({root: [0, 0, 0], heading: Math.PI, walkK: 0, walkPhase: 0, swimK: 0, swimPhase: 0, swimAmp: 0.18, headTurn: 0, tailCurl: 0, idle: 1, elev: 0, pitch: 0, startle: 0, t: 1, ...o});

const Panel: React.FC<{x: number; y: number; w: number; h: number; title: string; sub?: string; children: React.ReactNode}> = ({x, y, w, h, title, sub, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', border: '2px solid #0b1a14'}}>
    <svg width={w} height={h}>{children}</svg>
    <div style={{position: 'absolute', top: 14, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_FAMILY, color: '#fff'}}>
      <div style={{fontWeight: 900, fontSize: 28}}>{title}</div>
      {sub && <div style={{fontWeight: 600, fontSize: 20, color: '#bfe9dd'}}>{sub}</div>}
    </div>
  </div>
);

const Axo: React.FC<{spec: AxolotlSpec; pitch: number; yaw?: number; m: MotionParams; zoom: number; cx: number; cy: number; uid: string; regen?: number; focus?: 'lf'}> = ({spec, pitch, yaw = 0, m, zoom, cx, cy, uid, regen, focus}) => {
  const view = makeView(yaw, pitch);
  const pose = buildPose(spec, m, null, regen !== undefined ? {regen: {r: regen, size: 0.75 + 0.25 * Math.max(0, regen - 5)}} : {});
  const {items, lfElbow, lfTip} = axolotlItems(view, spec, pose, uid);
  const fp = lfElbow && lfTip ? ([(lfElbow[0] + lfTip[0]) / 2, (lfElbow[1] + lfTip[1]) / 2, (lfElbow[2] + lfTip[2]) / 2] as V3) : lfElbow;
  const c = focus && fp ? project(view, fp) : project(view, [m.root[0], 120, m.root[2]] as V3);
  return <g transform={`translate(${cx} ${cy}) scale(${zoom}) translate(${-c.x} ${-c.y})`}>{sortItems(items).map((i) => i.node)}</g>;
};

export const Ep06Characters: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg, #3d5a48 0%, #22352b 100%)'}}>
    <Panel x={0} y={0} w={1080} h={560} title="AJOLOTE ROSADO · protagonista" sub="leucístico · 3 pares de branquias · 4 dedos delante, 5 detrás · regenera la pata anterior IZQUIERDA">
      <Axo spec={PINK} pitch={0.42} m={M({})} zoom={0.82} cx={540} cy={330} uid="a" />
    </Panel>
    <Panel x={0} y={560} w={540} h={520} title="VISTA DORSAL">
      <Axo spec={PINK} pitch={1.45} m={M({})} zoom={0.42} cx={270} cy={300} uid="b" />
    </Panel>
    <Panel x={540} y={560} w={540} h={520} title="AJOLOTE SILVESTRE" sub="misma anatomía · color oscuro moteado">
      <Axo spec={WILD} pitch={0.25} yaw={0.3} m={M({swimK: 1, swimPhase: 1.3, elev: 120})} zoom={0.48} cx={270} cy={300} uid="c" />
    </Panel>
    <Panel x={0} y={1080} w={1080} h={480} title="REGENERACIÓN · STAGE 0 → 6" sub="extremidad anterior izquierda (misma geometría en todo el episodio)">
      {[0, 1, 2, 3, 4, 5, 6].map((r, i) => (
        <g key={r}>
          <svg x={4 + i * 152} y={90} width={148} height={310} overflow="hidden">
            <rect width={148} height={310} fill="#1d2e25" />
            <Axo spec={PINK} pitch={1.05} m={M({})} zoom={1.05} cx={74} cy={130} uid={`r${i}`} regen={r} focus="lf" />
          </svg>
          <text x={80 + i * 152} y={440} textAnchor="middle" fill="#fff" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={24}>
            {`STAGE ${r}`}
          </text>
        </g>
      ))}
    </Panel>
    <Panel x={0} y={1560} w={540} h={360} title="DAPHNIA" sub="presa · caparazón translúcido, ojo, antenas">
      <g transform="translate(270 220) scale(5)">{daphniaItems(makeView(0, 0), {pos: [0, 0, 0], angle: 0.1, stroke: 0.6, size: 1, opacity: 1}, 'd')[0].node}</g>
    </Panel>
    <Panel x={540} y={1560} w={540} h={360} title="NADO" sub="onda lateral de la cola, patas pegadas">
      <Axo spec={PINK} pitch={1.3} m={M({swimK: 1, swimPhase: 2.2, swimAmp: 0.22, elev: 150})} zoom={0.3} cx={270} cy={220} uid="e" />
    </Panel>
  </AbsoluteFill>
);
