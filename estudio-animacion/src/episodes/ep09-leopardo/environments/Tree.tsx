// ÁRBOL GIGANTE: tronco vertical con corteza (grietas, nudos, musgo), una rama horizontal gruesa
// para descansar y copas de hojas que se mecen. Coordenadas: base del tronco en (x, 0); rama a la
// altura `branchY` (negativa) que sale hacia la derecha. Opcional: marcas de arañazos.
import React from 'react';
import {clamp, hash1, mixColor} from '../../../engine/math';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export const TRUNK_W = 150;

export const GiantTree: React.FC<{x: number; t: number; branchY: number; tint?: number; scratches?: number; leafK?: number; color?: string; flip?: boolean}> = ({x, t, branchY, tint = 0, scratches = 0, leafK = 1, color = '#6a4a2e', flip = false}) => {
  const bark = mixColor(color, '#0a1430', tint * 0.7);
  const dark = mixColor(bark, '#000000', 0.35);
  const light = mixColor(bark, '#ffffff', 0.12);
  const leaf = ['#3f7a34', '#2f6a2c', '#4a8a3c'].map((c) => mixColor(c, '#0a1430', tint * 0.7));
  const H = 2600;
  return (
    <g transform={`translate(${f1(x)} 0) scale(${flip ? -1 : 1} 1)`}>
      {/* raíces */}
      <path d={`M${-TRUNK_W / 2 - 80},10 Q${-TRUNK_W / 2},-40 ${-TRUNK_W / 2},-160 L${TRUNK_W / 2},-160 Q${TRUNK_W / 2},-40 ${TRUNK_W / 2 + 90},10Z`} fill={bark} />
      {/* tronco */}
      <path d={`M${-TRUNK_W / 2},0 L${-TRUNK_W / 2 + 12},${-H} L${TRUNK_W / 2 - 12},${-H} L${TRUNK_W / 2},0Z`} fill={bark} />
      <path d={`M${TRUNK_W / 2 - 30},0 L${TRUNK_W / 2 - 36},${-H} L${TRUNK_W / 2 - 12},${-H} L${TRUNK_W / 2},0Z`} fill={dark} opacity={0.6} />
      <path d={`M${-TRUNK_W / 2 + 14},0 L${-TRUNK_W / 2 + 22},${-H}`} stroke={light} strokeWidth={10} opacity={0.4} />
      {/* grietas de la corteza */}
      {Array.from({length: 46}, (_, i) => {
        const yy = -40 - hash1(i * 3.1) * (H - 100);
        const xx = -TRUNK_W / 2 + 18 + hash1(i * 7.3) * (TRUNK_W - 36);
        const l = 40 + hash1(i * 2) * 90;
        return <path key={i} d={`M${f1(xx)},${f1(yy)} q${f1(6 - hash1(i) * 12)},${f1(-l / 2)} ${f1(2 - hash1(i * 5) * 4)},${f1(-l)}`} stroke={dark} strokeWidth={3 + hash1(i * 9) * 2} fill="none" opacity={0.7} />;
      })}
      {Array.from({length: 6}, (_, i) => (
        <ellipse key={`k${i}`} cx={-20 + hash1(i * 4) * 40} cy={-300 - i * 380} rx={14} ry={20} fill={dark} stroke={light} strokeWidth={2} opacity={0.8} />
      ))}
      {Array.from({length: 10}, (_, i) => (
        <ellipse key={`m${i}`} cx={-TRUNK_W / 2 + 10} cy={-200 - i * 240} rx={14} ry={50} fill={leaf[i % 3]} opacity={0.5} />
      ))}
      {/* marcas de arañazos (territorio) */}
      {scratches > 0.01 &&
        [0, 1, 2, 3].map((i) => (
          <path key={`s${i}`} d={`M${-30 + i * 16},-330 l${8 + i * 2},${f1(110 * clamp(scratches * 1.3 - i * 0.1))}`} stroke="#f4e0c0" strokeWidth={5} strokeLinecap="round" opacity={0.9} />
        ))}
      {/* rama horizontal */}
      <path d={`M${TRUNK_W / 2 - 20},${branchY - 30} Q${TRUNK_W / 2 + 300},${branchY - 50} ${TRUNK_W / 2 + 760},${branchY - 20} L${TRUNK_W / 2 + 760},${branchY + 12} Q${TRUNK_W / 2 + 300},${branchY + 20} ${TRUNK_W / 2 - 20},${branchY + 40}Z`} fill={bark} />
      <path d={`M${TRUNK_W / 2},${branchY - 26} Q${TRUNK_W / 2 + 300},${branchY - 46} ${TRUNK_W / 2 + 740},${branchY - 18}`} stroke={light} strokeWidth={5} fill="none" opacity={0.4} />
      <path d={`M${TRUNK_W / 2 + 200},${branchY - 40} Q${TRUNK_W / 2 + 320},${branchY - 200} ${TRUNK_W / 2 + 460},${branchY - 300}`} stroke={bark} strokeWidth={26} fill="none" strokeLinecap="round" />
      {/* copas */}
      {leafK > 0.01 &&
        Array.from({length: 26}, (_, i) => {
          const cx = -500 + hash1(i * 3) * 1500 + Math.sin(t * 0.6 + i) * 8;
          const cy = branchY - 360 - hash1(i * 5) * 900;
          return <circle key={`c${i}`} cx={cx} cy={cy} r={150 + hash1(i * 7) * 110} fill={leaf[i % 3]} opacity={leafK} />;
        })}
    </g>
  );
};
