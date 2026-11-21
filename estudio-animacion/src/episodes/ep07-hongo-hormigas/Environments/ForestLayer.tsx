// Capa principal del mundo: elementos del sotobosque + personajes ordenados por profundidad.
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ParallaxLayer} from '../../../engine/camera';
import {View} from '../Animation/proj';
import {Item, sortItems} from '../Animation/render';
import {forestItems} from './Forest';

export const Forest: React.FC<{view: View; t: number; detail: number; dark: number; extra: Item[]}> = ({view, t, detail, dark, extra}) => {
  const {width, height} = useVideoConfig();
  const items = sortItems([...forestItems(view, t, detail, dark), ...extra]);
  return (
    <AbsoluteFill>
      <svg width={width} height={height}>
        <ParallaxLayer depth={1}>{items.map((it) => it.node)}</ParallaxLayer>
      </svg>
    </AbsoluteFill>
  );
};
