// AMBIENTE SUBMARINO CINEMATOGRÁFICO: océano por capas reutilizado (gradiente de profundidad, rayos,
// talud lejano, siluetas, nieve marina en dos capas con parallax, bioluminiscencia) + bandas de niebla
// con parallax, haz de luz volumétrico, bokeh de primer plano, rayos en pantalla, luz de sujeto y
// etalonaje azul petróleo con viñeta. La profundidad (d) oscurece y enfría la escena.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {hash1} from '../../engine/math';
import {Grade, ScreenRays, SubjectLight} from '../ep10-camaron-mantis/lighting/Lighting';
import {DeepSea} from '../ep13-tiburon-duende/environment/DeepSea';
import {LightBeam} from '../ep14-pez-remo/components/VolumetricLight';
import {Bokeh, Cam, layerT} from '../../studio2';

export const FogBands: React.FC<{cam: Cam; t: number; k: number}> = ({cam, t, k}) => (
  <g transform={layerT(cam, 0.7)} opacity={k}>
    {Array.from({length: 6}, (_, i) => (
      <ellipse key={i} cx={cam.x * 0.7 + ((i * 700 + t * 18) % 4200) - 2100} cy={cam.y * 0.7 - 600 + i * 260 + hash1(i) * 120} rx={900 + hash1(i * 3) * 600} ry={90 + hash1(i * 5) * 60} fill="#2a5a7a" opacity={0.12} />
    ))}
  </g>
);

/** Fondo (detrás del personaje). */
export const UnderwaterBack: React.FC<{cam: Cam; t: number; depth: number; children?: React.ReactNode}> = ({cam, t, depth, children}) => (
  <DeepSea cam={cam} t={t} d={depth} fish={0.3} lights={0.7} front={<FogBands cam={cam} t={t} k={0.9} />}>
    {children}
  </DeepSea>
);

/** Capas de luz delante del personaje (pantalla). */
export const UnderwaterFront: React.FC<{t: number; beamX: number; beamK: number; subject: {x: number; y: number; k: number}; depth: number}> = ({t, beamX, beamK, subject, depth}) => (
  <>
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1080} height={1920}>
        <Bokeh t={t} n={9} k={0.8} />
      </svg>
    </AbsoluteFill>
    <LightBeam x={beamX} w={170} t={t} k={beamK} />
    <ScreenRays t={t} k={0.45 * (1 - depth * 0.5)} />
    <SubjectLight x={subject.x} y={subject.y} r={640} k={subject.k} color="rgba(110,200,255,0.3)" />
    <Grade depth={0.3 + 0.5 * depth} vignette={0.88} />
  </>
);
