// HOJA DE DESPIECE POR CAPAS (para aprobación): cada capa móvil dibujada por separado y el
// personaje ensamblado, con el mismo rig y el mismo instante de animación.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ensureFonts, FONT_FAMILY} from '../../../engine/fonts';
import {useTime} from '../../../engine/useTime';
import {LayerName, OarfishHero} from '../character/OarfishHero';

const ROWS: [string, LayerName[], number, number][] = [
  ['Aleta dorsal (segmentada)', ['dorsal'], 330, 0.5],
  ['Cuerpo: piel, escamas, manchas y reflejos', ['body'], 560, 0.5],
  ['Cabeza con boca animable', ['head'], 760, 1.5],
  ['Cresta (radios con retardo)', ['crest'], 1270, 1.1],
  ['Aletas pectorales y pélvicas', ['pectoralFar', 'pelvic', 'pectoral'], 1430, 0.9],
];

export const LayerSheet: React.FC = () => {
  ensureFonts();
  const t = useTime() + 1.2;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0b2a4a, #061427)'}}>
      <svg width={1080} height={1920}>
        <text x={540} y={110} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={900} fontSize={46} fill="#ffffff">Pez remo gigante · despiece por capas</text>
        {ROWS.map(([name, layers, y, s], i) => {
          const isHead = layers[0] === 'head' || layers[0] === 'crest';
          const x = layers[0] === 'crest' ? 560 : isHead ? 330 : layers[0] === 'pectoralFar' ? 520 : 1000;
          return (
            <g key={name}>
              <OarfishHero uid={`l${i}`} layers={layers} p={{x, y, scale: s, rig: {t, mouth: 0.6, curve: 10}}} />
              <text x={isHead ? 620 : 60} y={y - (isHead ? 0 : 90)} fontFamily={FONT_FAMILY} fontWeight={800} fontSize={28} fill="#9fe8ff">{name}</text>
            </g>
          );
        })}
        <text x={60} y={1560} fontFamily={FONT_FAMILY} fontWeight={800} fontSize={28} fill="#e8b86d">Ensamblado</text>
        <OarfishHero uid="all" p={{x: 960, y: 1720, scale: 0.48, rig: {t, mouth: 0.3}}} />
      </svg>
    </AbsoluteFill>
  );
};
