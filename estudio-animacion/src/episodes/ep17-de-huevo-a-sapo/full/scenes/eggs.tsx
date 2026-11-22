// Puesta compartida por las escenas 1–3: cordones dobles de huevos enredados entre tallos
// sumergidos (como los deposita el sapo común), con el huevo protagonista en EGG_F.
import React from 'react';
import {Pt} from '../../../../lifecycle/stages';
import {EggString} from '../../character/Embryo';
import {Elodea} from '../../environment/Pond';

export const EGG_F: Pt = {x: 30, y: -40};

const MAIN: Pt[] = [
  {x: -260, y: -320},
  {x: -170, y: -230},
  {x: -60, y: -150},
  {x: 30, y: -40},
  {x: 120, y: 40},
  {x: 210, y: 150},
  {x: 260, y: 250},
];
const STRINGS: {pts: Pt[]; seed: number}[] = [
  {pts: MAIN.map((p, i) => ({x: p.x - 90 + Math.sin(i) * 20, y: p.y - 40 + i * 6})), seed: 2},
  {pts: Array.from({length: 8}, (_, i) => ({x: -620 + i * 110, y: -420 + Math.sin(i * 0.9) * 60 + i * 30})), seed: 4},
  {pts: Array.from({length: 7}, (_, i) => ({x: 300 + i * 90, y: -260 + Math.cos(i * 1.1) * 50 + i * 40})), seed: 6},
  {pts: Array.from({length: 7}, (_, i) => ({x: -520 + i * 100, y: 40 + Math.sin(i * 1.3) * 40 + i * 20})), seed: 8},
];

export const EggBed: React.FC<{t: number; hide?: boolean; skipR?: number}> = ({t, skipR = 16}) => (
  <g>
    <Elodea x={-20} base={300} h={820} t={t} seed={5} c="#3a7a3a" />
    <Elodea x={-430} base={300} h={760} t={t} seed={7} c="#357236" />
    <Elodea x={420} base={300} h={700} t={t} seed={9} c="#3c8240" />
    {STRINGS.map((s, i) => <EggString key={i} pts={s.pts} t={t} uid={`b${i}`} seed={s.seed} />)}
    <EggString pts={MAIN} t={t} uid="bm" skipNear={EGG_F} skipR={skipR} />
    {[260, 520, 760, 980, 1240, 1480, 1760, 2050].map((x, i) => (
      <Elodea key={x} x={x + 300} base={300} h={560 + (i % 3) * 140} t={t} seed={i * 3.1 + 9} c={i % 2 ? '#2f6e3a' : '#3c8240'} />
    ))}
  </g>
);
