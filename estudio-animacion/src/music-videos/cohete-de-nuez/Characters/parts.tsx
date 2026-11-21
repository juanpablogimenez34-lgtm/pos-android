// Piezas compartidas de los personajes infantiles (2.5D ilustrado en SVG):
// extremidades de dos segmentos con volumen, ojos con brillo y parpadeo, bocas expresivas,
// sombras suaves. Todo es determinista y depende solo de la pose recibida.
import React from 'react';
import {mixColor} from '../../../engine/math';

export type Vec2 = {x: number; y: number};
export const f1 = (n: number) => n.toFixed(1);

/** Pose común de un personaje (coordenadas locales: origen entre los pies, y hacia arriba = negativo). */
export type Limb = {a: number; b: number}; // ángulo del primer segmento y flexión del segundo (rad, 0 = hacia abajo)
export type Expression = {
  blink: number; // 0 abiertos · 1 cerrados
  look: Vec2; // dirección de la mirada (−1…1)
  mouth: 'smile' | 'grin' | 'open' | 'o' | 'flat';
  mouthOpen: number; // 0–1 (cantar)
  brow: number; // −1 enfado · 0 neutro · 1 sorpresa
  cheeks: number; // 0–1 rubor
};
export type BasePose = {
  x: number;
  y: number;
  scale: number;
  facing: 1 | -1; // 1 mira a la derecha (vista 3/4), −1 a la izquierda
  lean: number; // inclinación del cuerpo (rad)
  bob: number; // rebote vertical del cuerpo
  squash: number; // −0.2 estirado … 0.2 aplastado (anticipación / aterrizaje)
  headTilt: number;
  headTurn: number; // −1…1 giro de la cabeza (desplaza rasgos)
  armL: Limb;
  armR: Limb;
  legL: Limb;
  legR: Limb;
  expr: Expression;
  helmet: number; // 0–1 casco espacial visible
  opacity: number;
  t: number;
};

export const NEUTRAL_EXPR: Expression = {blink: 0, look: {x: 0, y: 0}, mouth: 'smile', mouthOpen: 0, brow: 0, cheeks: 0.5};

export const basePose = (o: Partial<BasePose> = {}): BasePose => ({
  x: 0,
  y: 0,
  scale: 1,
  facing: 1,
  lean: 0,
  bob: 0,
  squash: 0,
  headTilt: 0,
  headTurn: 0.25,
  armL: {a: 0.25, b: -0.3},
  armR: {a: -0.25, b: 0.3},
  legL: {a: 0.06, b: 0},
  legR: {a: -0.06, b: 0},
  expr: NEUTRAL_EXPR,
  helmet: 0,
  opacity: 1,
  t: 0,
  ...o,
});

/** Punto al final de un segmento que parte de `o` con ángulo `a` (0 = hacia abajo). */
export const seg = (o: Vec2, a: number, len: number): Vec2 => ({x: o.x + Math.sin(a) * len, y: o.y + Math.cos(a) * len});

/** Extremidad con volumen: dos cápsulas con contorno, sombra interior y mano/pie al final. */
export const LimbShape: React.FC<{
  o: Vec2;
  limb: Limb;
  l1: number;
  l2: number;
  w1: number;
  w2: number;
  color: string;
  outline: string;
  end?: (p: Vec2, a: number) => React.ReactNode;
  sleeve?: {color: string; len: number};
}> = ({o, limb, l1, l2, w1, w2, color, outline, end, sleeve}) => {
  const k = seg(o, limb.a, l1);
  const a2 = limb.a + limb.b;
  const e = seg(k, a2, l2);
  const cap = (p: Vec2, q: Vec2, w: number, c: string) => (
    <>
      <path d={`M${f1(p.x)},${f1(p.y)}L${f1(q.x)},${f1(q.y)}`} stroke={outline} strokeWidth={w + 5} strokeLinecap="round" />
      <path d={`M${f1(p.x)},${f1(p.y)}L${f1(q.x)},${f1(q.y)}`} stroke={c} strokeWidth={w} strokeLinecap="round" />
      <path d={`M${f1(p.x - w * 0.18)},${f1(p.y)}L${f1(q.x - w * 0.18)},${f1(q.y)}`} stroke="#ffffff" strokeOpacity={0.22} strokeWidth={w * 0.25} strokeLinecap="round" />
    </>
  );
  return (
    <g>
      {cap(o, k, w1, color)}
      {cap(k, e, w2, color)}
      {sleeve && cap(o, seg(o, limb.a, Math.min(l1, sleeve.len)), w1 + 6, sleeve.color)}
      {end && end(e, a2)}
    </g>
  );
};

/** Ojo grande expresivo: blanco, iris, pupila, dos brillos y párpado que baja al parpadear. */
export const Eye: React.FC<{c: Vec2; r: number; iris: string; look: Vec2; blink: number; lid: string; outline: string; brow?: number; side: 1 | -1}> = ({c, r, iris, look, blink, lid, outline, brow = 0, side}) => {
  const ix = c.x + look.x * r * 0.32;
  const iy = c.y + look.y * r * 0.28;
  const id = `e${f1(c.x)}${f1(c.y)}`.replace(/[.-]/g, '_');
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <ellipse cx={c.x} cy={c.y} rx={r * 0.86} ry={r} />
        </clipPath>
      </defs>
      <ellipse cx={c.x} cy={c.y} rx={r * 0.86} ry={r} fill="#ffffff" stroke={outline} strokeWidth={3} />
      <g clipPath={`url(#${id})`}>
        <circle cx={ix} cy={iy} r={r * 0.62} fill={iris} />
        <circle cx={ix} cy={iy} r={r * 0.62} fill="url(#irisShade)" />
        <circle cx={ix} cy={iy} r={r * 0.3} fill="#1a1020" />
        <circle cx={ix - r * 0.22} cy={iy - r * 0.26} r={r * 0.17} fill="#ffffff" />
        <circle cx={ix + r * 0.2} cy={iy + r * 0.18} r={r * 0.08} fill="#ffffff" opacity={0.85} />
        {/* párpado */}
        <rect x={c.x - r} y={c.y - r * 1.1} width={r * 2} height={r * 2.2 * blink} fill={lid} />
      </g>
      {blink > 0.6 && <path d={`M${f1(c.x - r * 0.8)},${f1(c.y + r * (2.2 * blink - 1.1))} q${f1(r * 0.8)},${f1(r * 0.35)} ${f1(r * 1.6)},0`} stroke={outline} strokeWidth={3} fill="none" strokeLinecap="round" />}
      {/* ceja */}
      <path d={`M${f1(c.x - r * 0.6)},${f1(c.y - r * (1.35 + 0.25 * brow) + side * r * 0.1 * Math.min(0, brow))} q${f1(r * 0.6)},${f1(-r * (0.25 + 0.15 * brow))} ${f1(r * 1.2)},0`} stroke={outline} strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
};

/** Boca: sonrisa, sonrisa abierta, abierta (cantando), "o" de sorpresa o recta. */
export const Mouth: React.FC<{c: Vec2; w: number; kind: Expression['mouth']; open: number; outline: string; inside?: string}> = ({c, w, kind, open, outline, inside = '#7a2a3a'}) => {
  const o = Math.max(open, kind === 'open' ? 0.45 : kind === 'o' ? 0.7 : kind === 'grin' ? 0.35 : 0);
  if (kind === 'flat' && o < 0.05) return <path d={`M${f1(c.x - w * 0.4)},${f1(c.y)}L${f1(c.x + w * 0.4)},${f1(c.y)}`} stroke={outline} strokeWidth={4} strokeLinecap="round" />;
  if (o < 0.05) return <path d={`M${f1(c.x - w * 0.5)},${f1(c.y - w * 0.08)} Q${f1(c.x)},${f1(c.y + w * 0.4)} ${f1(c.x + w * 0.5)},${f1(c.y - w * 0.08)}`} stroke={outline} strokeWidth={4} fill="none" strokeLinecap="round" />;
  const ww = kind === 'o' ? w * 0.38 : w * 0.5;
  const hh = w * (0.15 + 0.5 * o);
  const top = kind === 'o' ? c.y - hh * 0.5 : c.y - w * 0.06;
  return (
    <g>
      <path d={kind === 'o' ? `M${f1(c.x - ww)},${f1(c.y)} Q${f1(c.x - ww)},${f1(top - hh * 0.2)} ${f1(c.x)},${f1(top - hh * 0.2)} Q${f1(c.x + ww)},${f1(top - hh * 0.2)} ${f1(c.x + ww)},${f1(c.y)} Q${f1(c.x + ww)},${f1(c.y + hh)} ${f1(c.x)},${f1(c.y + hh)} Q${f1(c.x - ww)},${f1(c.y + hh)} ${f1(c.x - ww)},${f1(c.y)}Z` : `M${f1(c.x - ww)},${f1(top)} Q${f1(c.x)},${f1(top + w * 0.12)} ${f1(c.x + ww)},${f1(top)} Q${f1(c.x + ww * 0.7)},${f1(c.y + hh)} ${f1(c.x)},${f1(c.y + hh)} Q${f1(c.x - ww * 0.7)},${f1(c.y + hh)} ${f1(c.x - ww)},${f1(top)}Z`} fill={inside} stroke={outline} strokeWidth={3.5} strokeLinejoin="round" />
      <ellipse cx={c.x} cy={c.y + hh * 0.7} rx={ww * 0.45} ry={hh * 0.28} fill="#ff8fa3" />
      {kind !== 'o' && <path d={`M${f1(c.x - ww * 0.7)},${f1(top + 2)} L${f1(c.x + ww * 0.7)},${f1(top + 2)}`} stroke="#ffffff" strokeWidth={Math.max(2, hh * 0.18)} strokeLinecap="round" />}
    </g>
  );
};

/** Degradado esférico (volumen suave) reutilizable: id único por personaje. */
export const SoftShade: React.FC<{id: string; base: string; light?: number; dark?: number}> = ({id, base, light = 0.35, dark = 0.25}) => (
  <radialGradient id={id} cx="0.38" cy="0.32" r="0.75">
    <stop offset="0" stopColor={mixColor(base, '#ffffff', light)} />
    <stop offset="0.55" stopColor={base} />
    <stop offset="1" stopColor={mixColor(base, '#2a1630', dark)} />
  </radialGradient>
);

/** Definiciones globales (una vez por SVG). */
export const SharedDefs: React.FC = () => (
  <defs>
    <radialGradient id="irisShade" cx="0.5" cy="0.35" r="0.6">
      <stop offset="0" stopColor="#ffffff" stopOpacity={0.25} />
      <stop offset="1" stopColor="#000000" stopOpacity={0.35} />
    </radialGradient>
    <radialGradient id="helmetGlass" cx="0.35" cy="0.3" r="0.75">
      <stop offset="0" stopColor="#ffffff" stopOpacity={0.45} />
      <stop offset="0.6" stopColor="#cfe9ff" stopOpacity={0.12} />
      <stop offset="1" stopColor="#9fd0ff" stopOpacity={0.3} />
    </radialGradient>
  </defs>
);

/** Sombra de contacto en el suelo. */
export const GroundShadow: React.FC<{w: number; k?: number}> = ({w, k = 1}) => <ellipse cx={0} cy={4} rx={w} ry={w * 0.18} fill="#1a0f2a" opacity={0.22 * k} />;

/** Casco espacial transparente (burbuja) con aro y reflejos. */
export const Helmet: React.FC<{c: Vec2; r: number; ring: string; k: number}> = ({c, r, ring, k}) =>
  k > 0.01 ? (
    <g opacity={k}>
      <circle cx={c.x} cy={c.y} r={r} fill="url(#helmetGlass)" stroke="#e8f6ff" strokeWidth={4} />
      <path d={`M${f1(c.x - r * 0.62)},${f1(c.y - r * 0.45)} A${f1(r * 0.75)},${f1(r * 0.75)} 0 0 1 ${f1(c.x + r * 0.1)},${f1(c.y - r * 0.78)}`} stroke="#ffffff" strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.7} />
      <path d={`M${f1(c.x - r * 0.62)},${f1(c.y + r * 0.8)} Q${f1(c.x)},${f1(c.y + r * 1.02)} ${f1(c.x + r * 0.62)},${f1(c.y + r * 0.8)}`} stroke={ring} strokeWidth={16} strokeLinecap="round" fill="none" />
    </g>
  ) : null;
