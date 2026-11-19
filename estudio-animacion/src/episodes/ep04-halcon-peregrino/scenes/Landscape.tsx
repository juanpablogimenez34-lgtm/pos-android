import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ParallaxLayer} from '../../../engine/camera';
import {AirCurrents, Cliff, CloudLayer, Mountains, SkyDome, SkyPal, Valley} from '../../../environments/sky/Sky';

/** Paisaje de montaña en capas (parallax). `blur`: desenfoque estilizado de fondo en primeros planos. */
export const Landscape: React.FC<{pal: SkyPal; tod: number; currents: number; blur: number}> = ({pal, tod, currents, blur}) => {
  const {width, height} = useVideoConfig();
  const sun = tod < 1 ? {x: 900 - tod * 500, y: 300 - tod * 900} : {x: 400 - (tod - 1) * 1100, y: -600 + (tod - 1) * 900};
  return (
    <>
      <SkyDome pal={pal} />
      <AbsoluteFill style={blur > 0.2 ? {filter: `blur(${blur.toFixed(1)}px)`} : undefined}>
        <svg width={width} height={height}>
          <defs>
            <radialGradient id="ls-sun" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={pal.sun} stopOpacity={1} />
              <stop offset="0.25" stopColor={pal.sun} stopOpacity={0.6} />
              <stop offset="1" stopColor={pal.light} stopOpacity={0} />
            </radialGradient>
          </defs>
          <ParallaxLayer depth={0.02}>
            <circle cx={sun.x} cy={sun.y} r={420} fill="url(#ls-sun)" opacity={0.65} />
            <circle cx={sun.x} cy={sun.y} r={70} fill={pal.sun} />
          </ParallaxLayer>
          <ParallaxLayer depth={0.05}>
            <Mountains seed={3} y={420} amp={270} color={pal.far} snow="#f4f6fa" haze={pal.hor} hazeK={0.45} />
          </ParallaxLayer>
          <CloudLayer depth={0.08} seed={11} cell={900} density={0.35} scale={1.1} pal={pal} drift={4} op={0.8} yMin={-1400} yMax={500} />
          <ParallaxLayer depth={0.11}>
            <Mountains seed={7} y={640} amp={210} color={pal.mid2} snow="#e8ecf2" haze={pal.hor} hazeK={0.25} />
          </ParallaxLayer>
          <ParallaxLayer depth={0.2}>
            <Mountains seed={13} y={860} amp={170} color={pal.near} haze={pal.hor} hazeK={0.12} />
          </ParallaxLayer>
          <CloudLayer depth={0.3} seed={21} cell={800} density={0.3} scale={1.0} pal={pal} drift={8} yMin={-3000} yMax={700} />
          <ParallaxLayer depth={0.42}>
            <Valley y={1000} pal={pal} hazeK={0.3} />
          </ParallaxLayer>
          <ParallaxLayer depth={0.62}>
            <Mountains seed={19} y={1250} amp={120} color={pal.ground} haze={pal.hor} hazeK={0.15} />
          </ParallaxLayer>
          <CloudLayer depth={0.7} seed={31} cell={1000} density={0.28} scale={1.2} pal={pal} drift={14} yMin={-3200} yMax={900} />
          <ParallaxLayer depth={1}>
            <Cliff pal={pal} />
          </ParallaxLayer>
          <AirCurrents intensity={currents} color={pal.light} />
        </svg>
      </AbsoluteFill>
    </>
  );
};

/** Nubes de primer plano que pasan rápido (sensación de velocidad y altura). */
export const ForegroundClouds: React.FC<{pal: SkyPal; zoom: number}> = ({pal, zoom}) => {
  const {width, height} = useVideoConfig();
  // en primeros planos (zoom alto) las nubes cercanas serían gigantes: se ocultan
  const k = 1 - Math.min(1, Math.max(0, (zoom - 1.8) / 0.8));
  if (k <= 0.01) return null;
  return (
    <AbsoluteFill style={{opacity: k}}>
      <svg width={width} height={height}>
        <CloudLayer depth={1.5} seed={41} cell={1400} density={0.22} scale={1.8} pal={pal} drift={20} op={0.55} yMin={-3400} yMax={600} />
      </svg>
    </AbsoluteFill>
  );
};
