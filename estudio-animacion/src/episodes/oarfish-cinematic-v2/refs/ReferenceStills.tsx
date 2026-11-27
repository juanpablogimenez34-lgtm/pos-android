// ETAPA A — TRES IMÁGENES DE REFERENCIA del personaje cinematográfico v2 (para aprobación):
//  1. Primer plano de la cabeza emergiendo de la oscuridad (1080×1920).
//  2. Vista lateral del cuerpo completo (1920×1080, para ver toda la longitud).
//  3. Plano general dentro del océano, con perspectiva (1080×1920).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ensureFonts} from '../../../engine/fonts';
import {cam} from '../../../studio2';
import {buildRig, Key, pathAt, rigParams} from '../../ep16-pez-remo-premium/OarfishRig';
import {lookV2, OarfishV2} from '../character/OarfishV2';
import {OceanV2Back, OceanV2Front} from '../environment/OceanV2';

const STRAIGHT: Key[] = [
  [-40, -3000, 0, 0],
  [0, 0, 0, 0],
  [10, 600, 0, 0],
];
const T0 = 2.35;

export const RefHead: React.FC = () => {
  ensureFonts();
  const rig = buildRig(rigParams({t: T0, keys: STRAIGHT, undulation: 4, lateral: 2}));
  const h = pathAt(STRAIGHT, T0);
  const c = cam(h.x + 10, h.y - 95, 3.1, -0.04);
  return (
    <AbsoluteFill style={{background: '#030b18'}}>
      <svg width={1080} height={1920}>
        <OceanV2Back cam={c} t={T0} depth={0.75}>
          <OarfishV2 rig={rig} pr={{cx: c.x, cy: c.y, f: 1400}} look={lookV2({sweep: 0.42, exposure: 1, mouth: 0.18})} uid="r1" />
        </OceanV2Back>
      </svg>
      <OceanV2Front cam={c} t={T0} depth={0.75} />
    </AbsoluteFill>
  );
};

export const RefSide: React.FC = () => {
  ensureFonts();
  const rig = buildRig(rigParams({t: T0, keys: STRAIGHT, undulation: 6, lateral: 3}));
  const h = pathAt(STRAIGHT, T0);
  const c = cam(h.x - 830, h.y - 40, 0.93);
  return (
    <AbsoluteFill style={{background: '#030b18'}}>
      <svg width={1920} height={1080}>
        <g transform="translate(420 -420)">
          <OceanV2Back cam={c} t={T0} depth={0.45} frame={{x: -420, y: 420, w: 1920, h: 1080}}>
            <OarfishV2 rig={rig} pr={{cx: c.x, cy: c.y, f: 1400}} look={lookV2({mouth: 0.15})} uid="r2" />
          </OceanV2Back>
        </g>
      </svg>
      <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse 85% 80% at 50% 45%, rgba(0,0,0,0) 55%, rgba(1,5,14,0.7) 100%)'}} />
    </AbsoluteFill>
  );
};

const DIAG: Key[] = [
  [-30, -900, -1500, 2400],
  [-14, -620, -760, 1300],
  [-6, -160, -260, 520],
  [0, 180, 220, -60],
  [10, 560, 520, -400],
];

export const RefWide: React.FC = () => {
  ensureFonts();
  const rig = buildRig(rigParams({t: T0, keys: DIAG, undulation: 6, lateral: 4}));
  const h = pathAt(DIAG, T0);
  const c = cam(h.x - 260, h.y - 300, 0.86);
  return (
    <AbsoluteFill style={{background: '#030b18'}}>
      <svg width={1080} height={1920}>
        <OceanV2Back cam={c} t={T0} depth={0.55}>
          <OarfishV2 rig={rig} pr={{cx: c.x, cy: c.y, f: 1400}} look={lookV2({mouth: 0.15, fog: 0.05})} uid="r3" />
        </OceanV2Back>
      </svg>
      <OceanV2Front cam={c} t={T0} depth={0.55} />
    </AbsoluteFill>
  );
};
