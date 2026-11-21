// FICHAS 2.0: los cuatro protagonistas con el rig nuevo. Fila 1: neutros. Fila 2: expresiones.
// Fila 3: manos que agarran objetos (tijeras, cinta, aleta, ventana, cámara, llave).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ensureFonts} from '../../../../engine/fonts';
import {useTime} from '../../../../engine/useTime';
import {SharedDefs} from '../../Characters/parts';
import {bip2, ex, hold, L, luna2, nico2, zumi2} from '../Animation/acting';
import {Bip2} from './Bip2';
import {Luna2} from './Luna2';
import {Nico2} from './Nico2';
import {Zumi2} from './Zumi2';

const Label: React.FC<{x: number; y: number; s: string}> = ({x, y, s}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={26} fill="#4a3050">
    {s}
  </text>
);

export const CoheteFichasV2: React.FC = () => {
  ensureFonts();
  const t = useTime() + 0.4;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#fff3dc, #ffd9ec)'}}>
      <svg width={1080} height={1920}>
        <SharedDefs />
        <text x={540} y={70} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={44} fill="#4a3050">
          Fichas 2.0 · rig con manos que agarran
        </text>
        {/* fila 1: neutros */}
        <Nico2 id="fn1" p={nico2(t, {x: 150, y: 560, scale: 1.25, expr: ex(t, 1, {mouth: 'grin'})}, {belt: 1})} />
        <Luna2 id="fl1" p={luna2(t, {x: 410, y: 560, scale: 1.25, facing: -1, expr: ex(t, 4, {mouth: 'smile'})})} />
        <Bip2 id="fb1" p={bip2(t, {x: 670, y: 560, scale: 1.25})} />
        <Zumi2 id="fz1" p={zumi2(t, {x: 920, y: 560, scale: 1.3, expr: ex(t, 9, {mouth: 'grin'})})} />
        <Label x={150} y={610} s="Nico" />
        <Label x={410} y={610} s="Luna" />
        <Label x={670} y={610} s="Bip" />
        <Label x={920} y={610} s="Zumi" />
        {/* fila 2: expresiones */}
        {(
          [
            ['alegría', {eyes: 'happy', mouth: 'laugh', cheeks: 1}],
            ['sorpresa', {eyes: 'wide', mouth: 'o', brow: 1}],
            ['concentrado', {eyes: 'squint', mouth: 'flat', browL: -0.8, browR: -0.4, look: {x: 0.5, y: 0.4}}],
            ['preocupado', {mouth: 'worried', browL: 0.8, browR: 0.8, look: {x: -0.4, y: -0.3}}],
          ] as const
        ).map(([name, e], i) => (
          <g key={name}>
            <defs>
              <clipPath id={`fc${i}`}>
                <rect x={20 + i * 262} y={700} width={250} height={330} rx={30} />
              </clipPath>
            </defs>
            <rect x={20 + i * 262} y={700} width={250} height={330} rx={30} fill="#ffffff" opacity={0.6} />
            <g clipPath={`url(#fc${i})`}>
              <g transform={`translate(${145 + i * 262} 1250) scale(1.9)`}>
                {i % 2 === 0 ? <Nico2 id={`fe${i}`} p={nico2(t, {expr: ex(t, 1, e)})} /> : <Luna2 id={`fe${i}`} p={luna2(t, {expr: ex(t, 4, e), facing: -1}, i === 1 ? 1 : 0)} />}
              </g>
            </g>
            <Label x={145 + i * 262} y={1070} s={name} />
          </g>
        ))}
        {/* fila 3: manos con objetos */}
        <Nico2 id="fh1" p={nico2(t, {x: 150, y: 1780, scale: 1.15, armR: L(-1.2, 0.5), gripR: 1, holdR: hold('fin', 2.4), armL: L(0.9, -1.2), gripL: 1, holdL: hold('scissors', 3.0), expr: ex(t, 1, {mouth: 'grin'})}, {belt: 1})} />
        <Luna2 id="fh2" p={luna2(t, {x: 410, y: 1780, scale: 1.15, armR: L(-1.0, 0.9), armL: L(1.0, -0.9), gripR: 1, holdR: hold('window', 2.6), gripL: 1, holdL: hold('tape', 0), expr: ex(t, 4, {mouth: 'grin'})})} />
        <Bip2 id="fh3" p={bip2(t, {x: 670, y: 1780, scale: 1.15, armR: L(-1.3, 1.2), gripR: 1, holdR: hold('camera', 3.1), armL: L(0.6, -0.4), gripL: 1, holdL: hold('wrench', 0)}, {mode: 'camera'})} />
        <Zumi2 id="fh4" p={zumi2(t, {x: 920, y: 1780, scale: 1.3, armR: L(-2.7 + Math.sin(t * 10) * 0.3, -0.5), gripR: 0, armL: L(0.8, -0.6), gripL: 1, holdL: hold('star', 0), expr: ex(t, 9, {eyes: 'happy', mouth: 'grin', cheeks: 1})})} />
      </svg>
    </AbsoluteFill>
  );
};
