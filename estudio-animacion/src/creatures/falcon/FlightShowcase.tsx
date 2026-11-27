import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {FONT_FAMILY, ensureFonts} from '../../engine/fonts';
import {useTime} from '../../engine/useTime';
import {Bird, PEREGRINE, PIGEON} from './Bird';
import {FLIGHT_PRESETS, FlightState, flapAngle} from './flight';

const VIEWS: {s: FlightState; yaw: number; pitch: number; roll: number}[] = [
  {s: 'PERCHED', yaw: 0, pitch: 0, roll: 0},
  {s: 'TAKEOFF', yaw: 0.2, pitch: 0, roll: 0},
  {s: 'SOARING', yaw: 0, pitch: Math.PI / 2, roll: Math.PI / 2},
  {s: 'FLAPPING', yaw: 0, pitch: 0, roll: 0.25},
  {s: 'GLIDING', yaw: -0.3, pitch: 0, roll: 0.5},
  {s: 'STOOP_PREPARATION', yaw: 0, pitch: -0.5, roll: 0.2},
  {s: 'HIGH_SPEED_DIVE', yaw: 0, pitch: -1.3, roll: 0},
  {s: 'PURSUIT', yaw: Math.PI / 2, pitch: -0.1, roll: 0},
  {s: 'BRAKING', yaw: 0, pitch: 0, roll: 0},
  {s: 'LANDING', yaw: 0, pitch: 0, roll: 0},
];

/** Hoja de control: los 10 estados de vuelo con distintas vistas del mismo rig + la paloma. */
export const FlightShowcase: React.FC = () => {
  ensureFonts();
  const t = useTime();
  const {width, height} = useVideoConfig();
  const cw = width / 2;
  const ch = height / 6;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#5f97d0, #cfe3f2)'}}>
      <svg width={width} height={height}>
        {VIEWS.map((v, i) => {
          const p = FLIGHT_PRESETS[v.s];
          const flap = flapAngle(p, t * p.flapFreq);
          return (
            <g key={v.s}>
              <Bird
                id={`b${i}`}
                spec={PEREGRINE}
                params={{t, x: cw * (i % 2) + cw / 2, y: ch * Math.floor(i / 2) + ch * 0.58, scale: 0.95, yaw: v.yaw, pitch: v.pitch + p.bodyPitch, roll: v.roll, flap, fold: p.fold, sweep: p.sweep, tail: p.tail, tailPitch: p.tailPitch, legs: p.legs, headYaw: 0, headPitch: -p.bodyPitch * 0.7, nict: p.nict * 0.5, silhouette: 0, rim: '#ffffff'}}
              />
              <text x={cw * (i % 2) + 16} y={ch * Math.floor(i / 2) + 36} fontFamily={FONT_FAMILY} fontWeight={800} fontSize={26} fill="#0d2238">
                {v.s}
              </text>
            </g>
          );
        })}
        <Bird id="pg" spec={PIGEON} params={{t, x: cw, y: ch * 5 + ch * 0.55, scale: 0.9, yaw: 0, pitch: 0, roll: 0.2, flap: flapAngle(FLIGHT_PRESETS.FLAPPING, t * 6), fold: 0, sweep: 0.1, tail: 0.4, tailPitch: 0, legs: 0, headYaw: 0, headPitch: 0, nict: 0, silhouette: 0, rim: '#ffffff'}} />
        <text x={cw - 80} y={ch * 5 + 36} fontFamily={FONT_FAMILY} fontWeight={800} fontSize={26} fill="#0d2238">PALOMA</text>
      </svg>
    </AbsoluteFill>
  );
};
