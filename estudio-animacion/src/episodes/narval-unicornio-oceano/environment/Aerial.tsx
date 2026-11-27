// VISTA AÉREA (tipo dron) del Ártico: agua turquesa con red de cáusticas, témpanos vistos desde arriba con su
// faldón sumergido turquesa, bacalaos árticos, ondas y salpicaduras; y el NARVAL VISTO DESDE ARRIBA: cuerpo
// fusiforme moteado, aletas pectorales a cada lado, caudal horizontal (su batido vertical se ve como un escorzo
// de los lóbulos), giro lateral de la cabeza con el colmillo saliendo del LADO IZQUIERDO del hocico.
// RECONSTRUCCIÓN ANIMADA: no es una grabación real de dron.
import React from 'react';
import {clamp, hash1, lerp, mixColor, smoothPath} from '../../../engine/math';
import {Cam, layerT} from '../../../studio2';
import {SPOTS} from '../character/Narwhal';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);
const memo = new Map<string, string>();

export type TopPose = {x: number; y: number; heading: number; scale: number; phase: number; amp: number; turn?: number; headYaw?: number; tusk?: number; depth?: number; age?: number; jaw?: number};
const W: [number, number][] = [[0, 0.02], [0.04, 0.06], [0.12, 0.098], [0.25, 0.122], [0.4, 0.124], [0.55, 0.1], [0.7, 0.066], [0.82, 0.038], [0.92, 0.022], [1, 0.016]];
const wAt = (u: number) => {
  let i = 0;
  while (i < W.length - 2 && u > W[i + 1][0]) i++;
  const k = clamp((u - W[i][0]) / (W[i + 1][0] - W[i][0]));
  return lerp(W[i][1], W[i + 1][1], k * k * (3 - 2 * k));
};
/** Columna vista desde arriba: curvatura lateral de giro y giro de la cabeza (no hay propulsión lateral). */
export function topSpine(P: TopPose) {
  const L = 1000;
  const n = 30;
  const pts: V[] = [];
  const dirs: number[] = [];
  let a = P.heading + Math.PI; // de la cabeza hacia la cola
  let p = {x: 0, y: 0};
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    pts.push({...p});
    dirs.push(a);
    const headBend = u < 0.15 ? -(P.headYaw ?? 0) * 1.2 / (0.15 * n) : 0;
    a += (P.turn ?? 0) * 1.6 / n + headBend;
    p = {x: p.x + Math.cos(a) * (L / n), y: p.y + Math.sin(a) * (L / n)};
  }
  // recolocar para que la cabeza quede en (x, y)
  return {pts: pts.map((q) => ({x: P.x + q.x * P.scale, y: P.y + q.y * P.scale})), dirs, L};
}
export const NarwhalTop: React.FC<{p: TopPose; uid: string}> = ({p, uid}) => {
  const S = topSpine(p);
  const age = clamp(p.age ?? 1);
  const at = (u: number, v: number) => {
    const f = clamp(u) * 30;
    const i = Math.min(29, Math.floor(f));
    const k = f - i;
    const q = {x: lerp(S.pts[i].x, S.pts[i + 1].x, k), y: lerp(S.pts[i].y, S.pts[i + 1].y, k)};
    const a = lerp(S.dirs[i], S.dirs[i + 1], k) + Math.PI / 2;
    // el pedúnculo se acorta en escorzo al subir/bajar la cola
    const w = wAt(u) * S.L * p.scale * v;
    return {x: q.x + Math.cos(a) * w, y: q.y + Math.sin(a) * w};
  };
  const L: V[] = [];
  const R: V[] = [];
  for (let i = 0; i <= 30; i++) {
    L.push(at(i / 30, 1));
    R.push(at(i / 30, -1));
  }
  const body = smoothPath([...L, ...R.reverse()], true);
  const d = p.depth ?? 0.3;
  const base = mixColor(mixColor('#5e6e7c', '#9aa6ac', age), '#3a8aa0', 0.25 + d * 0.5);
  const spot = mixColor('#2a343a', '#2a6a80', d * 0.6);
  // caudal: lóbulos perpendiculares a la cola; la carrera vertical cambia la cuerda aparente
  const te = S.pts[30];
  const ta = S.dirs[30];
  const stroke = Math.sin(p.phase - 3.2) * p.amp;
  const chord = 0.09 * S.L * p.scale * (0.55 + 0.45 * Math.abs(Math.cos(stroke)));
  const span = 0.15 * S.L * p.scale;
    // local: x hacia atrás (cola), y lateral
  const ang = (ta * 180) / Math.PI;
  const fl = `translate(${f1(te.x)} ${f1(te.y)}) rotate(${f1(ang)})`;
  const flD = `M-6 0C${f1(chord * 0.2)} ${f1(span * 0.35)} ${f1(chord * 0.7)} ${f1(span * 0.85)} ${f1(chord * 1.25)} ${f1(span)}C${f1(chord * 1.05)} ${f1(span * 0.55)} ${f1(chord * 0.95)} ${f1(span * 0.2)} ${f1(chord * 0.62)} 0C${f1(chord * 0.95)} ${f1(-span * 0.2)} ${f1(chord * 1.05)} ${f1(-span * 0.55)} ${f1(chord * 1.25)} ${f1(-span)}C${f1(chord * 0.7)} ${f1(-span * 0.85)} ${f1(chord * 0.2)} ${f1(-span * 0.35)} -6 0Z`;
  const pecL = 0.1 * S.L * p.scale;
  const pec = (side: number) => {
    const b = at(0.19, side * 0.9);
    const sw = Math.sin(p.phase * 0.5 + side) * 8;
    return {tr: `translate(${f1(b.x)} ${f1(b.y)}) rotate(${f1((S.dirs[6] * 180) / Math.PI + side * (38 + sw))})`, d: `M0 0C${f1(pecL * 0.3)} ${f1(side * pecL * 0.22)} ${f1(pecL * 0.8)} ${f1(side * pecL * 0.2)} ${f1(pecL)} ${f1(side * pecL * 0.1)}C${f1(pecL * 0.7)} ${f1(-side * pecL * 0.02)} ${f1(pecL * 0.3)} ${f1(-side * pecL * 0.06)} 0 ${f1(-side * pecL * 0.12)}Z`};
  };
  // colmillo: sale del lado izquierdo del hocico (para un animal que avanza hacia `heading`, su izquierda)
  let tusk: React.ReactNode = null;
  const tl = (p.tusk ?? 0) * S.L * p.scale;
  if (tl > 4) {
    const hd = S.dirs[0] + Math.PI; // dirección de avance de la cabeza
    const left = {x: Math.cos(hd - Math.PI / 2), y: Math.sin(hd - Math.PI / 2)};
    const b = {x: S.pts[0].x + left.x * 0.025 * S.L * p.scale, y: S.pts[0].y + left.y * 0.025 * S.L * p.scale};
    const dd = {x: Math.cos(hd), y: Math.sin(hd)};
    const r0 = 0.013 * S.L * p.scale;
    const tip = {x: b.x + dd.x * tl, y: b.y + dd.y * tl};
    const ng = Math.max(4, Math.round(tl / (32 * p.scale)));
    const grooves = Array.from({length: ng}, (_, k) => {
      const s = (k + 0.3) / ng;
      const c = {x: b.x + dd.x * tl * s, y: b.y + dd.y * tl * s};
      const r = lerp(r0, r0 * 0.25, s);
      return `M${f1(c.x - left.x * r)} ${f1(c.y - left.y * r)}L${f1(c.x + left.x * r + dd.x * r * 1.6)} ${f1(c.y + left.y * r + dd.y * r * 1.6)}`;
    }).join('');
    tusk = (
      <g>
        <path d={`M${f1(b.x + left.x * r0)} ${f1(b.y + left.y * r0)}L${f1(tip.x)} ${f1(tip.y)}L${f1(b.x - left.x * r0)} ${f1(b.y - left.y * r0)}Z`} fill="#efe4c8" stroke="#6a5e48" strokeWidth={1.4} />
        <path d={grooves} stroke="#a89a78" strokeWidth={1.6} />
        <path d={`M${f1(b.x + left.x * r0 * 0.4)} ${f1(b.y + left.y * r0 * 0.4)}L${f1(tip.x)} ${f1(tip.y)}`} stroke="#fff" strokeWidth={1.4} opacity={0.6} />
      </g>
    );
  }
  const id = `nt-${uid}`;
  return (
    <g opacity={1 - d * 0.35}>
      <defs>
        <clipPath id={`${id}-c`}>
          <path d={body} />
        </clipPath>
      </defs>
      {/* sombra difusa sobre el agua más profunda */}
      <path d={body} fill="#0a3a48" opacity={0.25} transform={`translate(${f1(30 * p.scale)} ${f1(40 * p.scale)})`} />
      {[1, -1].map((sd) => <path key={sd} d={pec(sd).d} transform={pec(sd).tr} fill={mixColor(base, '#000', 0.25)} stroke="#1a2a30" strokeWidth={1.5} />)}
      <path d={flD} transform={fl} fill={mixColor(base, '#000', 0.2)} stroke="#1a2a30" strokeWidth={1.5} />
      <path d={body} fill={base} stroke="#1a2a30" strokeWidth={2} />
      <g clipPath={`url(#${id}-c)`}>
        {age > 0.3 && SPOTS.map((s, i) => {
          const q = at(s.u, (hash1(i * 9.7) - 0.5) * 1.8);
          const r = s.s * S.L * p.scale * 0.9;
          return <ellipse key={i} cx={f1(q.x)} cy={f1(q.y)} rx={f1(r)} ry={f1(r * s.e)} transform={`rotate(${f1(s.a)} ${f1(q.x)} ${f1(q.y)})`} fill={spot} opacity={0.7 * clamp((age - 0.3) / 0.6)} />;
        })}
        <path d={smoothPath(Array.from({length: 16}, (_, i) => at(0.04 + i * 0.055, 0.55)))} stroke="#e8f8ff" strokeWidth={10 * p.scale} fill="none" opacity={0.15} />
      </g>
      {tusk}
      {/* espiráculo */}
      <ellipse cx={f1(at(0.1, 0).x)} cy={f1(at(0.1, 0).y)} rx={4 * p.scale + 1} ry={2.5 * p.scale + 1} fill="#1a2024" />
      {/* velo de agua según la profundidad */}
      <path d={body} fill="#2aa0b8" opacity={d * 0.45} />
    </g>
  );
};
/** Punta del colmillo (vista aérea). */
export function topTuskTip(p: TopPose): V {
  const S = topSpine(p);
  const hd = S.dirs[0] + Math.PI;
  const left = {x: Math.cos(hd - Math.PI / 2), y: Math.sin(hd - Math.PI / 2)};
  const tl = (p.tusk ?? 0) * S.L * p.scale;
  return {x: S.pts[0].x + left.x * 0.025 * S.L * p.scale + Math.cos(hd) * tl, y: S.pts[0].y + left.y * 0.025 * S.L * p.scale + Math.sin(hd) * tl};
}

/** Bacalao ártico visto desde arriba; `spin` > 0 lo hace girar aturdido. */
export const CodTop: React.FC<{x: number; y: number; a: number; s?: number; spin?: number; t: number}> = ({x, y, a, s = 1, spin = 0, t}) => {
  const wig = Math.sin(t * 14) * 0.15 * (1 - spin);
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(((a + wig + spin * t * 6) * 180) / Math.PI)}) scale(${s})`}>
      <path d="M22 0C14 -7 -10 -7 -18 0C-10 7 14 7 22 0Z" fill="#9aa8a0" stroke="#3a4a44" strokeWidth={1} />
      <path d={`M-18 0L-30 ${f1(-7 + wig * 20)}L-28 0L-30 ${f1(7 + wig * 20)}Z`} fill="#8a9890" />
      <path d="M18 -1C8 -3 -6 -3 -14 -1" stroke="#d8e4dc" strokeWidth={1.4} opacity={0.6} />
    </g>
  );
};

/** Témpano visto desde arriba (forma memorizada), con faldón sumergido turquesa. */
export const FloeTop: React.FC<{x: number; y: number; r: number; seed: number; rot?: number}> = ({x, y, r, seed, rot = 0}) => {
  const key = `ft-${seed}`;
  let d = memo.get(key);
  if (!d) {
    const pts: V[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const rr = 0.7 + hash1(seed + i * 3.7) * 0.45;
      pts.push({x: Math.cos(a) * rr, y: Math.sin(a) * rr * (0.7 + hash1(seed) * 0.4)});
    }
    d = smoothPath(pts, true);
    memo.set(key, d);
  }
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${f1(r)})`}>
      <path d={d} fill="#5ad2d8" opacity={0.5} transform="scale(1.18)" />
      <path d={d} fill="#e8f6fa" stroke="#a8d0dc" strokeWidth={2 / r} />
      <path d={d} fill="#ffffff" transform="translate(-0.06 -0.08) scale(0.8)" />
      <path d={d} fill="#c8e4ec" opacity={0.5} transform="translate(0.08 0.1) scale(0.55)" />
    </g>
  );
};

/** Mar visto desde arriba: degradado turquesa, cáusticas, témpanos a la deriva, ondas. */
export const AerialSea: React.FC<{cam: Cam; t: number; children?: React.ReactNode; above?: React.ReactNode; floes?: {x: number; y: number; r: number; seed: number}[]; ripples?: {x: number; y: number; t0: number}[]; tint?: string; tintK?: number}> = ({cam, t, children, above, floes = [], ripples = [], tint = '#ff9a50', tintK = 0}) => (
  <g>
    <defs>
      <radialGradient id="aer-sea" cx="0.5" cy="0.45" r="0.8">
        <stop offset="0" stopColor="#3ac0c8" />
        <stop offset="0.6" stopColor="#1a8aa4" />
        <stop offset="1" stopColor="#0c5a78" />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#aer-sea)" />
    <g transform={layerT(cam, 1)}>
      {/* lecho lejano: manchas más oscuras de agua profunda */}
      {Array.from({length: 10}, (_, i) => <ellipse key={i} cx={cam.x + (hash1(i * 3) - 0.5) * 2400} cy={cam.y + (hash1(i * 5) - 0.5) * 3600} rx={300 + hash1(i) * 400} ry={200 + hash1(i * 2) * 300} fill="#0a5070" opacity={0.25} />)}
      {children}
      {/* cáusticas sobre todo lo que está bajo la superficie */}
      <g opacity={0.35}>
        {Array.from({length: 40}, (_, i) => {
          const x = cam.x - 900 + ((hash1(i * 7) * 1800 + Math.sin(t * 0.5 + i) * 30) % 1800);
          const y = cam.y - 1600 + ((hash1(i * 11) * 3200 + t * 6) % 3200);
          return <path key={i} d={`M${f1(x)} ${f1(y)}q30 ${f1(-10 + Math.sin(t * 2 + i) * 8)} 60 0t60 0q-10 30 -40 40`} stroke="#c8fbff" strokeWidth={2.5} fill="none" />;
        })}
      </g>
      {ripples.map((r, i) => {
        const dt = t - r.t0;
        if (dt < 0 || dt > 2.5) return null;
        return [0, 0.4, 0.8].map((o, k) => (dt - o > 0 ? <circle key={`${i}-${k}`} cx={r.x} cy={r.y} r={(dt - o) * 120} fill="none" stroke="#ffffff" strokeWidth={3} opacity={0.6 * (1 - (dt - o) / 2.5)} /> : null));
      })}
      {floes.map((f, i) => <FloeTop key={i} x={f.x + Math.sin(t * 0.15 + i) * 18} y={f.y + Math.cos(t * 0.12 + i) * 14} r={f.r} seed={f.seed} rot={Math.sin(t * 0.05 + i) * 6} />)}
      {above}
    </g>
    <rect width={1080} height={1920} fill="#ffffff" opacity={0.04} />
    {tintK > 0 && <rect width={1080} height={1920} fill={tint} opacity={tintK} />}
  </g>
);
export const _k = {clamp};
