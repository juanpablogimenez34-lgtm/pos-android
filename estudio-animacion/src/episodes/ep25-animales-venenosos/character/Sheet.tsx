// Ficha de personajes: los 20 animales (motores por familia + especies) para revisar anatomía y diseño.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Centipede, Scorpion, Spider} from './Arthropods';
import {BlueRingedOctopus} from './BlueRinged';
import {GilaMonster, Platypus} from './Land';
import {BoxJelly, ConeSnail, Lionfish, Stingray, Stonefish} from './Marine';
import {Snake} from './Snake';
import * as S from './species';

export const VenomSheet: React.FC = () => {
  const t = useCurrentFrame() / 30 + 1;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#5a6a5a,#1a2a2a)'}}>
      <svg width={1080} height={1920}>
        <Snake uid="a" spec={S.KING_COBRA} pose={{t, travel: t * 2, raise: 1, hood: 1, tongue: 0.6}} x={230} y={330} scale={0.32} />
        <Snake uid="b" spec={S.BLACK_MAMBA} pose={{t, travel: t * 2, raise: 0.7, jaw: 1}} x={560} y={330} scale={0.32} />
        <Snake uid="c" spec={S.INLAND_TAIPAN} pose={{t, travel: t * 2, tongue: 1}} x={980} y={260} scale={0.32} />
        <Snake uid="d" spec={S.GABOON_VIPER} pose={{t, travel: t, coil: 0.8, amp: 0.3, jaw: 1}} x={250} y={560} scale={0.4} />
        <Snake uid="e" spec={S.WD_RATTLESNAKE} pose={{t, travel: t, coil: 1, raise: 0.5, rattle: 1}} x={640} y={590} scale={0.45} />
        <Scorpion spec={S.DEATHSTALKER} pose={{t, walk: t, tail: 0.8, clawL: 0.7, clawR: 0.2}} x={180} y={800} scale={1} />
        <Scorpion spec={S.FAT_TAIL} pose={{t, walk: t, tail: 0.9}} x={530} y={800} scale={1} />
        <Scorpion spec={S.BARK_SCORPION} pose={{t, walk: t, tail: 0.5}} x={880} y={800} scale={1} />
        <Spider spec={S.BLACK_WIDOW} pose={{t, walk: t, ventral: true}} x={200} y={1050} scale={1} />
        <Spider spec={S.FUNNEL_WEB} pose={{t, walk: t, rear: 1}} x={540} y={1050} scale={1} />
        <Spider spec={S.WANDERING} pose={{t, walk: t, rear: 0.7}} x={880} y={1050} scale={1} />
        <BoxJelly x={160} y={1250} t={t} s={0.45} pulse={t * 0.8} />
        <BlueRingedOctopus t={t} id="o" timeline={[{t: 0, state: 'THREATENED'}]} motion={() => ({x: 520, y: 1300, rot: 0, scale: 0.6, facing: 1})} rings={1} />
        <Stonefish x={880} y={1300} t={t} s={0.55} spines={1} />
        <ConeSnail x={200} y={1530} t={t} s={0.6} proboscis={1} />
        <Lionfish x={560} y={1520} t={t} s={0.6} />
        <Stingray x={900} y={1540} t={t} s={0.5} />
        <GilaMonster x={260} y={1760} t={t} walk={t} s={0.45} tongue={1} />
        <Platypus x={640} y={1760} t={t} s={0.6} mode="swim" spur={1} />
        <Centipede spec={S.GIANT_CENTIPEDE} pose={{t, gait: t * 1.5, path: (s) => ({x: 1040 - s * 0.6, y: 1700 + Math.sin(s * 0.012 + t) * 40})}} />
      </svg>
    </AbsoluteFill>
  );
};
