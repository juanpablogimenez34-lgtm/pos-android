// CABEZA DEL PEZ REMO: vista lateral (reutiliza sin modificar la cabeza aprobada de la prueba anterior:
// cráneo, opérculo, ojo natural, boca protráctil y cresta con retardo) y una VISTA FRONTAL nueva para
// los instantes en que el animal mira a cámara durante el giro. Ambas se colocan con una matriz afín
// obtenida de la proyección 3D del marco de la cabeza (avance / dorso / lateral), así que escorzan y
// giran con el cuerpo en lugar de reflejarse como una imagen plana.
import React from 'react';
import {Crest, Head} from '../ep15-pez-remo-personaje/character/Head';
import {Pectoral} from '../ep15-pez-remo-personaje/character/PairedFins';
import {f1, Frame, Proj, project, V3, vadd, vmul} from './OarfishRig';

/** Matriz afín local→pantalla para los ejes (ex, ey) en 3D, con origen O. Unidades locales = 1 u. */
export function affine(O: V3, ex: V3, ey: V3, pr: Proj, scale: number): string {
  const S = 50;
  const o = project(O, pr);
  const a = project(vadd(O, vmul(ex, S)), pr);
  const b = project(vadd(O, vmul(ey, S)), pr);
  const k = scale / S;
  return `matrix(${((a.x - o.x) * k).toFixed(5)} ${((a.y - o.y) * k).toFixed(5)} ${((b.x - o.x) * k).toFixed(5)} ${((b.y - o.y) * k).toFixed(5)} ${f1(o.x)} ${f1(o.y)})`;
}

/** Vista frontal (ancho = eje lateral, alto = dorso): cráneo estrecho, ojos a ambos lados, boca, cresta. */
export const HeadFront: React.FC<{t: number; mouth: number}> = ({t, mouth}) => (
  <g>
    {Array.from({length: 11}, (_, i) => {
      const a = -Math.PI / 2 + (i - 5) * 0.07 + Math.sin(t * 1.5 - i * 0.4) * 0.05;
      const L = 220 + 120 * Math.sin((Math.PI * (i + 1)) / 12);
      return <path key={i} d={`M${f1((i - 5) * 2.4)},-62 Q${f1(Math.cos(a) * L * 0.5 + (i - 5) * 6)},${f1(-62 + Math.sin(a) * L * 0.5)} ${f1(Math.cos(a - 0.2) * L + (i - 5) * 10)},${f1(-62 + Math.sin(a) * L)}`} stroke="#e5293b" strokeWidth={4.5 - Math.abs(i - 5) * 0.3} fill="none" strokeLinecap="round" />;
    })}
    <path d="M0,-66 C26,-64 32,-20 30,10 C28,40 16,62 0,66 C-16,62 -28,40 -30,10 C-32,-20 -26,-64 0,-66Z" fill="#c9d4e6" stroke="#0a1430" strokeWidth={2} />
    <path d="M0,-66 C14,-64 18,-30 16,0" stroke="#ffffff" strokeWidth={6} fill="none" opacity={0.35} />
    {[-1, 1].map((s) => (
      <g key={s} transform={`translate(${s * 27} -20)`}>
        <ellipse rx={8} ry={14} fill="#0a1430" />
        <ellipse rx={5} ry={10} fill="#03060c" />
        <circle cx={-2 * s} cy={-4} r={2} fill="#ffffff" />
      </g>
    ))}
    <ellipse cx={0} cy={44 + 6 * mouth} rx={12} ry={4 + 10 * mouth} fill="#4a0e1a" stroke="#f08a98" strokeWidth={3} />
  </g>
);

export type HeadPlacement = {side: string; front: string; frontK: number};

/** Calcula las matrices de colocación de la cabeza para el marco 0 del rig. */
export function headPlacement(f: Frame, pr: Proj): HeadPlacement {
  const O = vadd(f.p, vmul(f.h, -26)); // la cabeza solapa la unión con el cuerpo
  const side = affine(O, f.h, vmul(f.d, -1), pr, 1.22);
  const frontO = vadd(f.p, vmul(f.h, 60));
  const front = affine(frontO, f.l, vmul(f.d, -1), pr, 1.0);
  const sideness = Math.hypot(f.h.x, f.h.y); // 1 de perfil, 0 mirando a cámara
  const frontK = f.h.z < 0 ? Math.max(0, Math.min(1, (0.42 - sideness) / 0.22)) : 0;
  return {side, front, frontK};
}

export const OarfishHead: React.FC<{hp: HeadPlacement; t: number; mouth: number; uid: string; light: number; crestK: number; part: 'back' | 'front'}> = ({hp, t, mouth, uid, light, crestK, part}) => {
  const sideK = 1 - hp.frontK;
  if (part === 'back')
    return sideK > 0.01 ? (
      <g transform={hp.side} opacity={sideK}>
        <Pectoral t={t} far />
      </g>
    ) : null;
  return (
    <g>
      {sideK > 0.01 && (
        <g transform={hp.side} opacity={sideK}>
          <Head t={t} mouth={mouth} uid={uid} light={light} />
          <g opacity={crestK}>
            <Crest t={t} uid={uid} light={light} />
          </g>
          <Pectoral t={t} />
        </g>
      )}
      {hp.frontK > 0.01 && (
        <g transform={hp.front} opacity={hp.frontK}>
          <HeadFront t={t} mouth={mouth} />
        </g>
      )}
    </g>
  );
};
