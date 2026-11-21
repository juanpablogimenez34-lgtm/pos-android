// ESCENARIO OCEÁNICO del episodio: reutiliza (sin modificarlo) el océano por capas del episodio del
// tiburón duende — gradiente de profundidad, rayos que se apagan, talud lejano, siluetas, nieve marina
// en dos capas con parallax, bioluminiscencia — y añade la paleta del pez remo como velo de color.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {DeepSea} from '../../ep13-tiburon-duende/environment/DeepSea';
import {Cam} from '../../../studio2';

export const PALETTE = {abyss: '#061427', ocean: '#0B3458', bright: '#1789B7', teal: '#3BCBD6', silver: '#DCE7EC', red: '#D63847', gold: '#E8B86D'};

export const OceanEnvironment: React.FC<{cam: Cam; t: number; depth: number; floor?: boolean; floorY?: number; fish?: number; lights?: number; children?: React.ReactNode; front?: React.ReactNode}> = ({cam, t, depth, floor, floorY, fish = 0.5, lights = 1, children, front}) => (
  <DeepSea cam={cam} t={t} d={depth} floor={floor} floorY={floorY} fish={fish} lights={lights} front={front}>
    {children}
  </DeepSea>
);

/** Velo de color de la paleta (más turquesa arriba, más abisal abajo). */
export const PaletteGrade: React.FC<{depth: number}> = ({depth}) => (
  <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'soft-light', background: `linear-gradient(180deg, rgba(59,203,214,${(0.18 * (1 - depth)).toFixed(3)}) 0%, rgba(11,52,88,0.15) 50%, rgba(6,20,39,${(0.35 * depth).toFixed(3)}) 100%)`}} />
);
