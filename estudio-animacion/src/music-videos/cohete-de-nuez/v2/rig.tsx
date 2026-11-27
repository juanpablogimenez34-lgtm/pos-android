// RIG 2D REUTILIZABLE — versión 2.0 (sobre las piezas de la v1, que no se modifican).
// Añade: manos con dedos que AGARRAN (los objetos se dibujan en el marco de la mano y la siguen),
// ojos con modos (normal, feliz, muy abiertos, cerrados), cejas independientes, más bocas,
// sombreado con luz de contorno y oclusión, y una pose base ampliada.
import React from 'react';
import {mixColor} from '../../../engine/math';
import {BasePose, basePose, Expression, f1, Limb, NEUTRAL_EXPR, seg, Vec2} from '../Characters/parts';

export type EyeMode = 'normal' | 'happy' | 'wide' | 'closed' | 'squint';
export type MouthKind = Expression['mouth'] | 'laugh' | 'worried' | 'ee' | 'tongue';
export type PropKind = 'none' | 'scissors' | 'tape' | 'tapeStrip' | 'cardboard' | 'fin' | 'window' | 'wrench' | 'camera' | 'colander' | 'star' | 'box' | 'paper' | 'cone' | 'ship';
export type Hold = {kind: PropKind; rot?: number; s?: number; c?: string};

export type Expr2 = Omit<Expression, 'mouth'> & {mouth: MouthKind; eyes: EyeMode; browL: number; browR: number};
export const EXPR2: Expr2 = {...NEUTRAL_EXPR, mouth: 'smile', eyes: 'normal', browL: 0, browR: 0};

export type Pose2 = Omit<BasePose, 'expr'> & {
  expr: Expr2;
  gripL: number; // 0 mano abierta · 1 puño / agarre
  gripR: number;
  holdL: Hold;
  holdR: Hold;
  twist: number; // −1…1 giro del torso (desplaza brazos y rasgos)
  spin: number; // giro sobre sí mismo (rad): escala horizontal cos(spin)
  rimColor: string; // color de la luz de contorno (iluminación de la escena)
  rimK: number; // intensidad de la luz de contorno
};

export const pose2 = (o: Partial<Pose2> = {}): Pose2 => ({
  ...(basePose() as unknown as Omit<BasePose, 'expr'>),
  expr: EXPR2,
  gripL: 0.3,
  gripR: 0.3,
  holdL: {kind: 'none'},
  holdR: {kind: 'none'},
  twist: 0,
  spin: 0,
  rimColor: '#ffffff',
  rimK: 0.35,
  ...o,
});

/** Extremo de una extremidad (posición y ángulo) para colocar manos y objetos. */
export const limbEnd = (o: Vec2, l: Limb, l1: number, l2: number) => {
  const k = seg(o, l.a, l1);
  const a2 = l.a + l.b;
  return {p: seg(k, a2, l2), a: a2, knee: k};
};

/** Objeto sujeto: se dibuja en el marco de la mano (sigue su posición y su ángulo). */
export const PropInHand: React.FC<{h: Hold}> = ({h}) => {
  const s = h.s ?? 1;
  const r = ((h.rot ?? 0) * 180) / Math.PI;
  const out = '#3e2412';
  const body = (() => {
    switch (h.kind) {
      case 'scissors':
        return (
          <g>
            <circle cx={-7} cy={0} r={7} fill="none" stroke="#e8463c" strokeWidth={4.5} />
            <circle cx={7} cy={0} r={7} fill="none" stroke="#e8463c" strokeWidth={4.5} />
            <path d="M-3,6 L7,40 M3,6 L-3,40" stroke="#b8c4d0" strokeWidth={5} strokeLinecap="round" />
            <circle cx={2} cy={24} r={8} fill="#b8c4d0" />
          </g>
        );
      case 'tape':
        return (
          <g>
            <circle cx={0} cy={10} r={15} fill="#f2e2a8" stroke={out} strokeWidth={3} />
            <circle cx={0} cy={10} r={7} fill="#ffffff" stroke={out} strokeWidth={2} />
          </g>
        );
      case 'tapeStrip':
        return <rect x={-8} y={0} width={16} height={60} rx={2} fill="#f6ecc4" opacity={0.85} stroke="#d8c48a" strokeWidth={1.5} />;
      case 'cardboard':
        return (
          <g>
            <rect x={-40} y={0} width={80} height={60} rx={4} fill="#c79a5e" stroke="#7a5428" strokeWidth={3.5} />
            {[12, 24, 36, 48].map((y) => (
              <line key={y} x1={-36} x2={36} y1={y} y2={y} stroke="#a87a42" strokeWidth={2} opacity={0.6} />
            ))}
          </g>
        );
      case 'fin':
        return (
          <g>
            <path d="M-20,0 Q40,20 50,90 L10,90 Q0,40 -24,24Z" fill={h.c ?? '#e8463c'} stroke={out} strokeWidth={4} strokeLinejoin="round" />
            <path d="M14,86 L46,86" stroke="#a82a22" strokeWidth={6} strokeDasharray="3 3" />
            <path d="M-6,14 Q30,30 38,70" stroke="#ffffff" strokeWidth={4} fill="none" opacity={0.35} />
          </g>
        );
      case 'window':
        return (
          <g transform="translate(0 40)">
            <circle r={40} fill="#c79a5e" stroke={out} strokeWidth={4} />
            <circle r={31} fill="#bfe6ff" stroke={out} strokeWidth={3} />
            <path d="M-18,-16 A24,24 0 0 1 4,-26" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" fill="none" />
          </g>
        );
      case 'wrench':
        return <path d="M-4,0 L4,0 L4,40 L10,48 L5,56 L0,48 L-5,56 L-10,48 L-4,40Z" fill="#9fb4d8" stroke="#2a2440" strokeWidth={2.5} />;
      case 'camera':
        return (
          <g transform="translate(0 16)">
            <rect x={-24} y={-16} width={48} height={32} rx={7} fill="#e8463c" stroke="#2a2440" strokeWidth={3} />
            <circle r={11} fill="#2a2440" stroke="#ffffff" strokeWidth={3} />
            <rect x={10} y={-22} width={10} height={6} rx={2} fill="#2a2440" />
          </g>
        );
      case 'colander':
        return (
          <g transform="translate(0 26)">
            <path d="M-46,-6 A46,40 0 0 0 46,-6Z" fill="#c8d2dc" stroke="#5a6470" strokeWidth={4} />
            {Array.from({length: 10}, (_, i) => (
              <circle key={i} cx={-30 + (i % 5) * 15} cy={4 + Math.floor(i / 5) * 12} r={2.8} fill="#5a6470" />
            ))}
            <rect x={-62} y={-10} width={18} height={8} rx={4} fill="#8a94a0" />
          </g>
        );
      case 'star':
        return <path transform="translate(0 12) scale(0.9)" d="M0,-18 L5,-5 L19,-5 L8,3 L12,17 L0,9 L-12,17 L-8,3 L-19,-5 L-5,-5Z" fill="#ffd23f" stroke="#c98a1a" strokeWidth={2.5} />;
      case 'box':
        return (
          <g>
            <rect x={-34} y={0} width={68} height={50} rx={4} fill="#c79a5e" stroke="#7a5428" strokeWidth={3.5} />
            <path d="M-34,12 L34,12" stroke="#7a5428" strokeWidth={3} />
            <rect x={-18} y={-12} width={10} height={14} fill="#ff9ad5" />
            <rect x={2} y={-16} width={10} height={18} fill="#7ec8ff" />
          </g>
        );
      case 'cone':
        return (
          <g>
            <path d="M-30,0 L30,0 L0,-70Z" fill="#ff9ad5" stroke={out} strokeWidth={3.5} strokeLinejoin="round" />
            <path d="M-20,-14 L20,-14" stroke="#ffffff" strokeWidth={5} />
            <path d="M-12,-34 L12,-34" stroke="#ffd23f" strokeWidth={5} />
            <circle cx={0} cy={-72} r={6} fill="#ffd23f" stroke={out} strokeWidth={2} />
          </g>
        );
      case 'ship':
        return (
          <g transform="translate(0 16)">
            <path d="M-12,-30 Q0,-46 12,-30 L12,10 L-12,10Z" fill="#a8743e" stroke={out} strokeWidth={2.5} />
            <path d="M-12,4 L-20,14 L-12,10 M12,4 L20,14 L12,10" fill="#e8463c" stroke={out} strokeWidth={2} />
          </g>
        );
      case 'paper':
        return <rect x={-26} y={0} width={52} height={62} fill="#ff9ad5" stroke="#b0457e" strokeWidth={3} />;
      default:
        return null;
    }
  })();
  return body ? <g transform={`rotate(${r.toFixed(1)}) scale(${s})`}>{body}</g> : null;
};

/** Mano con pulgar y dedos redondeados; `grip` los cierra. El objeto va DENTRO del puño. */
export const Hand: React.FC<{p: Vec2; a: number; grip: number; color: string; outline: string; hold: Hold; side: 1 | -1; fingers?: 3 | 4; r?: number}> = ({p, a, grip, color, outline, hold, side, fingers = 4, r = 11}) => {
  const deg = (-a * 180) / Math.PI;
  const open = 1 - grip;
  const fs = Array.from({length: fingers - 1}, (_, i) => i);
  return (
    <g transform={`translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(deg)})`}>
      {/* objeto detrás de los dedos: queda "agarrado" */}
      <g transform={`translate(0 ${f1(r * 0.6)})`}>
        <PropInHand h={hold} />
      </g>
      <ellipse cx={0} cy={r * 0.25} rx={r * 1.05} ry={r} fill={color} stroke={outline} strokeWidth={3} />
      {fs.map((i) => {
        const x = (-0.55 + (1.1 * i) / Math.max(1, fs.length - 1)) * r;
        const len = r * (0.55 + 0.45 * open);
        return <ellipse key={i} cx={x} cy={r * 0.75 + len * 0.45} rx={r * 0.32} ry={len * 0.55} fill={color} stroke={outline} strokeWidth={2.5} />;
      })}
      {/* pulgar */}
      <ellipse cx={side * r * (0.8 + 0.25 * open)} cy={r * 0.15} rx={r * 0.32} ry={r * 0.55} fill={color} stroke={outline} strokeWidth={2.5} transform={`rotate(${f1(side * (35 - 30 * grip))} ${f1(side * r * 0.9)} ${f1(r * 0.15)})`} />
      <ellipse cx={-r * 0.3} cy={-r * 0.1} rx={r * 0.35} ry={r * 0.2} fill="#ffffff" opacity={0.25} />
    </g>
  );
};

/** Ojo 2.0: blanco con volumen, iris con anillo, dos brillos, párpados y modos expresivos. */
export const Eye2: React.FC<{c: Vec2; r: number; iris: string; look: Vec2; blink: number; lid: string; outline: string; brow: number; mode: EyeMode; side: 1 | -1}> = ({c, r, iris, look, blink, lid, outline, brow, mode, side}) => {
  const browY = c.y - r * (1.35 + 0.28 * brow);
  const browTilt = brow < 0 ? side * brow * r * 0.35 : -side * brow * r * 0.08;
  const BrowEl = <path d={`M${f1(c.x - r * 0.65)},${f1(browY + browTilt)} Q${f1(c.x)},${f1(browY - r * (0.28 + 0.12 * brow))} ${f1(c.x + r * 0.65)},${f1(browY - browTilt)}`} stroke={outline} strokeWidth={r * 0.22} fill="none" strokeLinecap="round" />;
  if (mode === 'happy' || mode === 'closed' || blink > 0.92) {
    const up = mode === 'happy';
    return (
      <g>
        <path d={`M${f1(c.x - r * 0.75)},${f1(c.y + (up ? r * 0.25 : 0))} Q${f1(c.x)},${f1(c.y + (up ? -r * 0.75 : r * 0.45))} ${f1(c.x + r * 0.75)},${f1(c.y + (up ? r * 0.25 : 0))}`} stroke={outline} strokeWidth={r * 0.22} fill="none" strokeLinecap="round" />
        {BrowEl}
      </g>
    );
  }
  const sc = mode === 'wide' ? 1.15 : mode === 'squint' ? 0.85 : 1;
  const ry = r * sc;
  const rx = r * 0.86 * sc;
  const ix = c.x + look.x * rx * 0.34;
  const iy = c.y + look.y * ry * 0.3;
  const ir = r * (mode === 'wide' ? 0.52 : 0.62);
  const id = `e2${f1(c.x)}${f1(c.y)}${side}`.replace(/[.-]/g, '_');
  const lidK = Math.max(blink, mode === 'squint' ? 0.35 : 0);
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <ellipse cx={c.x} cy={c.y} rx={rx} ry={ry} />
        </clipPath>
      </defs>
      <ellipse cx={c.x} cy={c.y} rx={rx} ry={ry} fill="#ffffff" stroke={outline} strokeWidth={r * 0.14} />
      <g clipPath={`url(#${id})`}>
        <ellipse cx={c.x} cy={c.y + ry * 0.55} rx={rx} ry={ry * 0.5} fill="#e9e4f4" />
        <circle cx={ix} cy={iy} r={ir} fill={iris} />
        <circle cx={ix} cy={iy} r={ir} fill="url(#irisShade)" />
        <circle cx={ix} cy={iy} r={ir * 0.92} fill="none" stroke={mixColor(iris, '#000000', 0.35)} strokeWidth={r * 0.06} />
        <circle cx={ix} cy={iy} r={ir * 0.48} fill="#160c1c" />
        <circle cx={ix - ir * 0.38} cy={iy - ir * 0.42} r={ir * 0.3} fill="#ffffff" />
        <circle cx={ix + ir * 0.32} cy={iy + ir * 0.3} r={ir * 0.13} fill="#ffffff" opacity={0.9} />
        <rect x={c.x - r * 1.2} y={c.y - ry * 1.2} width={r * 2.4} height={ry * 2.4 * lidK} fill={lid} />
        <rect x={c.x - r * 1.2} y={c.y - ry * 1.2 + ry * 2.4 * lidK - 2} width={r * 2.4} height={3} fill={outline} opacity={lidK > 0.02 ? 0.6 : 0} />
      </g>
      {BrowEl}
    </g>
  );
};

/** Boca 2.0: añade risa, preocupación, "iii" y lengua. */
export const Mouth2: React.FC<{c: Vec2; w: number; kind: MouthKind; open: number; outline: string}> = ({c, w, kind, open, outline}) => {
  const inside = '#7a2a3a';
  if (kind === 'worried') return <path d={`M${f1(c.x - w * 0.45)},${f1(c.y + w * 0.12)} Q${f1(c.x)},${f1(c.y - w * 0.18)} ${f1(c.x + w * 0.45)},${f1(c.y + w * 0.12)}`} stroke={outline} strokeWidth={w * 0.13} fill="none" strokeLinecap="round" />;
  if (kind === 'ee')
    return (
      <g>
        <path d={`M${f1(c.x - w * 0.5)},${f1(c.y - w * 0.05)} Q${f1(c.x)},${f1(c.y + w * 0.35)} ${f1(c.x + w * 0.5)},${f1(c.y - w * 0.05)}Z`} fill="#ffffff" stroke={outline} strokeWidth={w * 0.11} strokeLinejoin="round" />
        <path d={`M${f1(c.x - w * 0.42)},${f1(c.y + w * 0.06)} L${f1(c.x + w * 0.42)},${f1(c.y + w * 0.06)}`} stroke={outline} strokeWidth={2} opacity={0.4} />
      </g>
    );
  const o = Math.max(open, kind === 'laugh' ? 0.75 : kind === 'open' ? 0.45 : kind === 'o' ? 0.7 : kind === 'grin' ? 0.35 : kind === 'tongue' ? 0.5 : 0);
  if (o < 0.05 && kind !== 'o') return <path d={`M${f1(c.x - w * 0.5)},${f1(c.y - w * 0.08)} Q${f1(c.x)},${f1(c.y + w * 0.4)} ${f1(c.x + w * 0.5)},${f1(c.y - w * 0.08)}`} stroke={outline} strokeWidth={w * 0.13} fill="none" strokeLinecap="round" />;
  if (kind === 'o') {
    const rr = w * (0.2 + 0.18 * o);
    return (
      <g>
        <ellipse cx={c.x} cy={c.y + rr * 0.5} rx={rr * 0.85} ry={rr} fill={inside} stroke={outline} strokeWidth={w * 0.11} />
        <ellipse cx={c.x} cy={c.y + rr * 1.05} rx={rr * 0.45} ry={rr * 0.3} fill="#ff8fa3" />
      </g>
    );
  }
  const ww = w * (kind === 'laugh' ? 0.6 : 0.5);
  const hh = w * (0.15 + 0.5 * o);
  const top = c.y - w * 0.06;
  return (
    <g>
      <path d={`M${f1(c.x - ww)},${f1(top)} Q${f1(c.x)},${f1(top + w * 0.14)} ${f1(c.x + ww)},${f1(top)} Q${f1(c.x + ww * 0.75)},${f1(c.y + hh)} ${f1(c.x)},${f1(c.y + hh)} Q${f1(c.x - ww * 0.75)},${f1(c.y + hh)} ${f1(c.x - ww)},${f1(top)}Z`} fill={inside} stroke={outline} strokeWidth={w * 0.11} strokeLinejoin="round" />
      <ellipse cx={c.x} cy={c.y + hh * 0.72} rx={ww * 0.48} ry={hh * 0.3} fill={kind === 'tongue' ? '#ff6b8a' : '#ff8fa3'} />
      <path d={`M${f1(c.x - ww * 0.72)},${f1(top + 2)} L${f1(c.x + ww * 0.72)},${f1(top + 2)}`} stroke="#ffffff" strokeWidth={Math.max(2, hh * 0.18)} strokeLinecap="round" />
    </g>
  );
};

/** Luz de contorno (borde iluminado) para dar volumen a una forma circular. */
export const Rim: React.FC<{c: Vec2; r: number; k?: number; color?: string; from?: number; to?: number}> = ({c, r, k = 0.5, color = '#ffffff', from = -2.4, to = -0.9}) => (
  <path d={`M${f1(c.x + Math.cos(from) * r * 0.9)},${f1(c.y + Math.sin(from) * r * 0.9)} A${f1(r * 0.9)},${f1(r * 0.9)} 0 0 1 ${f1(c.x + Math.cos(to) * r * 0.9)},${f1(c.y + Math.sin(to) * r * 0.9)}`} stroke={color} strokeWidth={r * 0.1} strokeLinecap="round" fill="none" opacity={k} />
);

/** Mechones de pelaje alrededor de una cabeza circular (textura sin filtros). */
export const FurTufts: React.FC<{c: Vec2; r: number; color: string; n?: number; from?: number; to?: number}> = ({c, r, color, n = 9, from = 0.3, to = 2.8}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const a = from + ((to - from) * i) / (n - 1);
      const x = c.x + Math.cos(a) * r;
      const y = c.y + Math.sin(a) * r;
      return <path key={i} d={`M${f1(x - Math.sin(a) * 6)},${f1(y + Math.cos(a) * 6)} q${f1(Math.cos(a) * 9)},${f1(Math.sin(a) * 9)} ${f1(Math.sin(a) * 12)},${f1(-Math.cos(a) * 12)}`} fill={color} />;
    })}
  </g>
);

export {basePose};
