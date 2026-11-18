import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {FONT_FAMILY, ensureFonts} from '../../engine/fonts';
import {QualityName, QualityProvider, QUALITY} from '../../engine/quality';
import {useTime} from '../../engine/useTime';
import {InkCloud} from './Ink';
import {Octopus} from './Octopus';
import {computeOctopusPose} from './pose';
import {OCTOPUS_VULGARIS} from './rig';
import {OctopusStateName, STATE_PRESETS} from './states';

const NAMES: OctopusStateName[] = ['RESTING', 'CRAWLING', 'EXPLORING', 'SWIMMING', 'CAMOUFLAGING', 'THREATENED', 'INK_ESCAPE', 'HIDING'];

/** Hoja de control: los 8 estados animados a la vez (verificación visual del rig). */
export const StatesShowcase: React.FC<{quality: QualityName}> = ({quality}) => {
  ensureFonts();
  const t = useTime();
  const {width, height} = useVideoConfig();
  const cw = width / 2;
  const ch = height / 4;
  return (
    <QualityProvider quality={quality}>
      <AbsoluteFill style={{background: 'linear-gradient(#0b5d7f, #071c3a)'}}>
        <svg width={width} height={height}>
          {NAMES.map((name, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const gy = ch * row + ch * 0.82;
            const swim = name === 'SWIMMING' || name === 'INK_ESCAPE';
            const cx0 = cw * col + cw / 2;
            const s = STATE_PRESETS[name];
            const motion = (tt: number) => ({
              x: cx0 + (name === 'CRAWLING' ? ((tt * 40) % 160) - 80 : 0),
              y: gy - s.hover * 0.62 - (swim ? 60 : 0),
              rot: swim ? -0.9 : 0,
              scale: 0.62,
              facing: 1,
            });
            const pose = computeOctopusPose({
              t,
              rig: OCTOPUS_VULGARIS,
              state: s,
              motion,
              ground: swim ? undefined : () => gy,
              segments: QUALITY[quality].armSegments,
              seed: i + 1,
            });
            const sp = pose.toWorld({x: pose.siphon.x, y: pose.siphon.y});
            return (
              <g key={name}>
                <rect x={cw * col} y={gy} width={cw} height={ch * 0.18} fill="#33525e" />
                {name === 'INK_ESCAPE' && <InkCloud id={`ink${i}`} events={[{t: 0.3, x: sp.x, y: sp.y, dirX: 1, dirY: 0.6}]} />}
                <Octopus id={`o${i}`} pose={pose} skin={OCTOPUS_VULGARIS.skin} groundY={swim ? undefined : gy} />
                <text x={cw * col + 24} y={ch * row + 52} fill="#eafffb" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={34}>
                  {name}
                </text>
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
    </QualityProvider>
  );
};
