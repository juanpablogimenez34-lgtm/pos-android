// Ficha de control del personaje: reptando, nudo formado, nudo a medio deslizar, mucosidad y depredador.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {cam} from '../../../studio2';
import {DeepBack} from '../environment/Deep';
import {bodyOnPath, knotPath, makePath, smoothPts} from '../motion/path';
import {Hagfish} from './Hagfish';
import {Predator} from './Predator';
import {SlimeCloud, SlimeDefs} from './Slime';

export const MixinoSheet: React.FC = () => {
  const t = useCurrentFrame() / 30 + 3;
  const crawl = makePath(smoothPts([{x: -500, y: -300}, {x: -250, y: -330}, {x: 0, y: -290}, {x: 250, y: -320}]));
  const sp1 = bodyOnPath(crawl, crawl.total, 520, 64, {amp: 22, waves: 1.3, phase: t * 6});
  const k = knotPath(-60, 80, 30, 1, 0.3, 900, 1.6);
  const sp2 = bodyOnPath(k.path, k.a + 1100 - 40, 1100, 96);
  const k2 = knotPath(-60, 560, 30, 1, 0.3, 900, 1.6);
  const sp3 = bodyOnPath(k2.path, k2.b + 100, 1100, 96);
  return (
    <AbsoluteFill style={{background: '#04141c'}}>
      <svg width={1080} height={1920}>
        <DeepBack cam={cam(0, 0, 1)} t={t}>
          <SlimeDefs />
          <Hagfish uid="a" spine={sp1} look={{t, width: 34, shadow: 14}} />
          <Hagfish uid="b" spine={sp2} look={{t, width: 38}} />
          <Hagfish uid="c" spine={sp3} look={{t, width: 38, pores: 0.6}} />
          <SlimeCloud t={t} b={{t0: 1.5, sources: [{x: 200, y: 780}], dir: 0.2, size: 220, seed: 3}} />
          <Predator uid="f" p={{x: 220, y: -700, t, mouth: 0.6, gill: 0.7, slimed: 0.8, scale: 1}} />
        </DeepBack>
      </svg>
    </AbsoluteFill>
  );
};
