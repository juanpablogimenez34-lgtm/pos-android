// Ficha de control: el MISMO rig en cada grado de desarrollo (continuidad de diseño).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ensureFonts, FONT_FAMILY} from '../../../engine/fonts';
import {useTime} from '../../../engine/useTime';
import {stageAt} from '../../../lifecycle/stages';
import {BUFO_STAGES} from '../species/bufoBufo';
import {Toad, toadPose} from './Toad';

const GS = [0, 0.15, 0.4, 0.55, 0.66, 0.76, 0.88, 0.95, 1];

export const StageSheet: React.FC = () => {
  ensureFonts();
  const t = useTime() + 0.4;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#1d5a4a, #0a2a2a)'}}>
      <svg width={1080} height={1920}>
        {GS.map((g, i) => {
          const s = stageAt(BUFO_STAGES, g);
          const water = g < 0.9;
          const x = 300 + (i % 2) * 460;
          const y = 220 + Math.floor(i / 2) * 380;
          return (
            <g key={g}>
              <Toad uid={`st${i}`} s={s} p={toadPose({x, y, scale: g === 1 ? 1.1 : 1.8, t, swimPhase: t * 14, swimAmp: water ? 0.7 : 0, fold: water ? 0.1 : 1, inWater: water})} />
              <text x={x} y={y + 130} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={700} fontSize={22} fill="#e8f4d8">{`g ${g.toFixed(2)} · ${s.stage}`}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
