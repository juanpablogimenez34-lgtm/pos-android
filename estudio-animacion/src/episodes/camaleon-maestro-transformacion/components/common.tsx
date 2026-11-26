// Utilidades del episodio: escenario por capas, rótulos y ayudas de tiempo.
import React from 'react';
import {clamp, hash1} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {Cam, DepthStage, Layer, Motes} from '../../../studio2';
import {SCENES} from '../data/timeline';
import {CanopyFar, Fern, Grade, Liana, LeafCluster, Light, LightRays, Ravenala, SkyBack, SKY, Trunk} from '../environment/Forest';

export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const win = (t: number, a: number, b: number, r = 0.4) => clamp((t - a) / r) * clamp((b - t) / r);
export const ease = (u: number) => u * u * (3 - 2 * u);

/** Disposición del bosque (datos): troncos, palmas, lianas, helechos y hojas en distintas profundidades. */
export type ForestLayout = {seed: number; span: [number, number]; groundY?: number};
export const Forest: React.FC<{cam: Cam; t: number; light: Light; L: ForestLayout; main: React.ReactNode; front?: boolean; rays?: number; motes?: number; extraBack?: React.ReactNode}> = ({cam, t, light, L, main, front = true, rays = 1, motes = 40, extraBack}) => {
  const P = SKY[light];
  const [a, b] = L.span;
  const s = L.seed;
  const n = (k: number, step: number) => Array.from({length: Math.ceil((b - a) / step)}, (_, i) => ({x: a + i * step + (hash1(i * k + s) - 0.5) * step * 0.6, h: hash1(i * k * 1.7 + s)}));
  const layers: Layer[] = [
    {depth: 0.12, node: <CanopyFar light={light} y={980} seed={s} k={0.75} />, fog: 0},
    {depth: 0.25, node: <g>{n(3.1, 520).map((p, i) => <Ravenala key={i} x={p.x} y={1250} h={380 + p.h * 160} t={t} light={light} k={0.6} />)}<CanopyFar light={light} y={1180} seed={s + 2} k={0.55} /></g>, fog: 0.05},
    {depth: 0.45, node: <g>{n(5.3, 380).map((p, i) => <Trunk key={i} x={p.x} top={-1400} bottom={2400} w={60 + p.h * 70} light={light} seed={s * 10 + i} tone={0.35} moss={false} />)}{n(7.1, 300).map((p, i) => <Liana key={i} x={p.x} y={-200} len={700 + p.h * 700} t={t} light={light} seed={i + s} />)}</g>, fog: 0.04},
    {depth: 0.7, node: <g>{n(2.3, 640).map((p, i) => <Trunk key={i} x={p.x + 200} top={-1600} bottom={2600} w={110 + p.h * 90} light={light} seed={s * 20 + i} tone={0.15} />)}{n(4.9, 330).map((p, i) => <LeafCluster key={i} x={p.x} y={300 + p.h * 1300} t={t} light={light} n={5} size={150} seed={i + s * 3} dark={0.25} spread={2.6} base={-Math.PI / 2 + (p.h - 0.5) * 1.2} />)}{n(6.7, 420).map((p, i) => <Fern key={i} x={p.x} y={1500 + p.h * 500} size={190} t={t} light={light} seed={i} dark={0.3} />)}</g>, fog: 0.02},
    {depth: 1, node: main, fog: 0},
  ];
  return (
    <g>
      <SkyBack light={light} t={t} />
      {extraBack}
      <DepthStage cam={cam} layers={layers} fogColor={P.fog} />
      <LightRays light={light} t={t} k={rays} />
      {front && (
        <DepthStage cam={cam} fogColor={P.fog} layers={[{depth: 1.5, fog: 0, node: <g>{n(9.7, 700).map((p, i) => <LeafCluster key={i} x={p.x} y={(i % 2 ? 2520 : 420) + p.h * 120} t={t} light={light} n={4} size={330} seed={i + 40} dark={0.55} spread={2} base={i % 2 ? -Math.PI / 2 : Math.PI / 2} />)}</g>}]} />
      )}
      <Motes t={t} n={motes} color={light === 'dusk' ? '#cfe4ff' : '#fff6c8'} k={0.7} />
      <Grade light={light} />
    </g>
  );
};

export const SceneTag: React.FC<{t: number}> = ({t}) => {
  const s = SCENES.find((x) => t >= x.start && t < x.end);
  if (!s || s.n === 1) return null;
  const k = clamp((t - s.start - 0.5) / 0.5) * clamp((s.start + 4 - t) / 0.5);
  if (k <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${((1 - k) * -12).toFixed(1)}px)`}}>
      <div style={{color: '#8ff0c0', fontWeight: 800, fontSize: 26, letterSpacing: 7}}>ESCENA {s.n}</div>
      <div style={{color: '#fffbea', fontWeight: 900, fontSize: 48, letterSpacing: 1, textShadow: '0 3px 14px rgba(0,0,0,0.85)'}}>{s.title.toUpperCase()}</div>
    </div>
  );
};
export const BigTitle: React.FC<{k: number; lines: string[]; top?: number; size?: number; color?: string}> = ({k, lines, top = 330, size = 88, color = '#ffd23f'}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `scale(${(0.94 + 0.06 * k).toFixed(3)})`}}>
      {lines.map((l, i) => (
        <div key={i} style={{fontWeight: 900, fontSize: i === 0 ? size * 0.55 : size, lineHeight: 1.05, letterSpacing: 2, color: i === 0 ? '#e8fff4' : color, textShadow: '0 0 30px rgba(0,0,0,0.45), 0 6px 18px rgba(0,0,0,0.9)'}}>{l}</div>
      ))}
    </div>
  ) : null;
export const Brand: React.FC = () => (
  <div style={{position: 'absolute', left: 54, top: 70, fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 22, letterSpacing: 4, color: '#f4ffee', opacity: 0.45, textShadow: '0 2px 6px rgba(0,0,0,0.6)'}}>MUNDO INSÓLITO</div>
);
export const Tag: React.FC<{k: number; text: string; top?: number; color?: string}> = ({k, text, top = 1560, color = '#ffd23f'}) =>
  k > 0.01 ? <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 30, letterSpacing: 3, color, opacity: k, textShadow: '0 2px 10px rgba(0,0,0,0.85)'}}>{text}</div> : null;
export const Wash: React.FC<{k: number; color?: string}> = ({k, color = '#000'}) => (k > 0.002 ? <div style={{position: 'absolute', inset: 0, background: color, opacity: k}} /> : null);
/** Etiqueta con línea (SVG, pantalla). */
export const Label: React.FC<{x: number; y: number; tx: number; ty: number; text: string; k: number}> = ({x, y, tx, ty, text, k}) =>
  k > 0.01 ? (
    <g opacity={k}>
      <path d={`M${x} ${y}L${tx} ${ty}`} stroke="#ffffff" strokeWidth={2.5} />
      <circle cx={x} cy={y} r={7} fill="#ffd23f" stroke="#000" strokeWidth={1.5} />
      <text x={tx} y={ty - 10} fontFamily={FONT_FAMILY} fontWeight={800} fontSize={32} fill="#fffbea" textAnchor={tx > x ? 'start' : 'end'} style={{paintOrder: 'stroke'}} stroke="#06140f" strokeWidth={6} strokeLinejoin="round">{text}</text>
    </g>
  ) : null;
