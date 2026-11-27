// PEZ REMO GIGANTE — PERSONAJE PRINCIPAL (ensamblado modular y reutilizable).
// Orden de capas (de atrás hacia delante):
//   pectoral lejana → pélvicas → aleta dorsal → cuerpo (piel, escamas, manchas, brillos) →
//   cabeza (mandíbula, cráneo, opérculo, ojo) → cresta → pectoral cercana.
// La cabeza se articula en el extremo de la columna y sigue su ángulo; la cresta y las pectorales
// van ancladas a la cabeza; la dorsal, la piel y las pélvicas siguen la columna.
// `layers` permite dibujar capas sueltas (hoja de despiece).
import React from 'react';
import {BodySkin} from './BodySkin';
import {DorsalFin} from './DorsalFin';
import {Crest, Head} from './Head';
import {Pectoral, Pelvic} from './PairedFins';
import {defaultRig, f1, headAngle, OarRig, spine} from './rig';

export type HeroPose = {x: number; y: number; scale: number; facing: 1 | -1; angle: number; light: number; opacity: number; rig: Partial<OarRig>};
export type LayerName = 'pectoralFar' | 'pelvic' | 'dorsal' | 'body' | 'head' | 'crest' | 'pectoral';
const ALL: LayerName[] = ['pectoralFar', 'pelvic', 'dorsal', 'body', 'head', 'crest', 'pectoral'];

export const OarfishHero: React.FC<{p: Partial<HeroPose>; uid: string; layers?: LayerName[]}> = ({p, uid, layers = ALL}) => {
  const r = defaultRig(p.rig);
  const s = spine(r);
  const ha = headAngle(s, r);
  const head0 = s.pts[0];
  const light = p.light ?? 1;
  const on = (l: LayerName) => layers.includes(l);
  const T = `translate(${f1(p.x ?? 0)} ${f1(p.y ?? 0)}) rotate(${f1(((p.angle ?? 0) * 180) / Math.PI)}) scale(${((p.scale ?? 1) * (p.facing ?? 1)).toFixed(4)} ${(p.scale ?? 1).toFixed(4)})`;
  const H = `translate(${f1(head0.x - 26)} ${f1(head0.y)}) rotate(${f1((ha * 180) / Math.PI)}) scale(1.22)`;
  return (
    <g opacity={p.opacity ?? 1} transform={T}>
      {on('pectoralFar') && (
        <g transform={H}>
          <Pectoral t={r.t} far />
        </g>
      )}
      {on('pelvic') && (
        <g transform={H}>
          <Pelvic t={r.t} />
        </g>
      )}
      {on('dorsal') && <DorsalFin s={s} r={r} uid={uid} light={light} />}
      {on('body') && <BodySkin s={s} t={r.t} uid={uid} light={light} length={r.length} />}
      {on('head') && (
        <g transform={H}>
          <Head t={r.t} mouth={r.mouth} uid={uid} light={light} />
        </g>
      )}
      {on('crest') && (
        <g transform={H}>
          <Crest t={r.t} uid={uid} light={light} />
        </g>
      )}
      {on('pectoral') && (
        <g transform={H}>
          <Pectoral t={r.t} />
        </g>
      )}
    </g>
  );
};
