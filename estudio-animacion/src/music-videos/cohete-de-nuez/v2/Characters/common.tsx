// Piezas comunes de los personajes 2.0: brazo con mano que agarra (el objeto sigue a la mano),
// envoltorio de transformación (posición, escala, orientación, giro sobre sí mismo, rebote,
// inclinación, aplastamiento) y sombra de contacto que se encoge al saltar.
import React from 'react';
import {f1, Limb, LimbShape, Vec2} from '../../Characters/parts';
import {Hand, Hold, limbEnd, Pose2} from '../rig';

export const Arm: React.FC<{
  o: Vec2;
  limb: Limb;
  l1: number;
  l2: number;
  w1: number;
  w2: number;
  color: string;
  outline: string;
  sleeve?: {color: string; len: number};
  grip: number;
  hold: Hold;
  side: 1 | -1;
  fingers?: 3 | 4;
  handR?: number;
  handColor?: string;
}> = ({o, limb, l1, l2, w1, w2, color, outline, sleeve, grip, hold, side, fingers, handR, handColor}) => {
  const e = limbEnd(o, limb, l1, l2);
  return (
    <g>
      <LimbShape o={o} limb={limb} l1={l1} l2={l2} w1={w1} w2={w2} color={color} outline={outline} sleeve={sleeve} />
      <Hand p={e.p} a={e.a} grip={grip} color={handColor ?? color} outline={outline} hold={hold} side={side} fingers={fingers} r={handR} />
    </g>
  );
};

/** Transformación exterior común. `pivot` = altura de la cadera (para inclinar). */
export const Body: React.FC<{p: Pose2; pivot: number; shadowW: number; children: React.ReactNode}> = ({p, pivot, shadowW, children}) => {
  const spinK = Math.cos(p.spin);
  const sxk = Math.abs(spinK) < 0.06 ? 0.06 * Math.sign(spinK || 1) : spinK;
  const sx = 1 + p.squash;
  const sy = 1 - p.squash;
  const air = Math.max(0, -p.bob);
  return (
    <g transform={`translate(${f1(p.x)} ${f1(p.y)}) scale(${(p.scale * p.facing * sxk).toFixed(3)} ${p.scale.toFixed(3)})`} opacity={p.opacity}>
      <ellipse cx={0} cy={4} rx={shadowW * (1 - Math.min(0.5, air / 260))} ry={shadowW * 0.17 * (1 - Math.min(0.5, air / 260))} fill="#1a0f2a" opacity={0.24 * (1 - Math.min(0.6, air / 200))} />
      <g transform={`translate(0 ${f1(p.bob)}) rotate(${f1((p.lean * 180) / Math.PI)} 0 ${pivot}) scale(${f1(sx)} ${f1(sy)})`}>{children}</g>
    </g>
  );
};

/** Oclusión suave bajo la cabeza (da volumen al cuello). */
export const NeckShade: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => <ellipse cx={x} cy={y} rx={w} ry={w * 0.32} fill="#2a1630" opacity={0.18} />;
