// EFECTOS REUTILIZABLES: rayos volumétricos, nieve marina con profundidad de campo, plancton bioluminiscente,
// burbujas, brillos, ecolocalización ilustrativa, distorsión óptica y gradación de color.
// Todo es determinista (semillas fijas) y depende solo del tiempo: cada fotograma se puede renderizar aislado.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Cam, layerT, visible, VP} from '../camera/camera';
import {useView} from '../utils/context';
import {clamp, hash1, lerp} from '../utils/math';
import {f1} from '../utils/spline';

type V = {x: number; y: number};
const wrap = (v: number, a: number, span: number) => a + ((((v - a) % span) + span) % span);

/** Rayos de sol volumétricos (espacio de pantalla), con balanceo lento por el oleaje. */
export const GodRays: React.FC<{t: number; k: number; cam: Cam; color?: string}> = ({t, k, cam, color = '#d8f4ff'}) => {
  const {w, h, q} = useView();
  if (k <= 0.01 || !q.rays) return null;
  const n = 9;
  return (
    <g opacity={k} style={{mixBlendMode: 'screen'}}>
      <defs>
        <linearGradient id="grRay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={0.55} />
          <stop offset="0.7" stopColor={color} stopOpacity={0.06} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
        <filter id="grBlur" x="-30%" y="-10%" width="160%" height="120%"><feGaussianBlur stdDeviation={22 * q.blur + 4} /></filter>
      </defs>
      <g filter="url(#grBlur)">
        {Array.from({length: n}, (_, i) => {
          const x = (i / (n - 1)) * w * 1.3 - w * 0.15 + Math.sin(t * 0.21 + i * 1.9) * w * 0.03 - (cam.x * 0.04) % (w * 0.2);
          const ww = w * (0.025 + hash1(i * 3) * 0.05);
          const lean = w * 0.18;
          const fl = 0.45 + 0.35 * Math.sin(t * (0.5 + hash1(i) * 0.4) + i * 2.3);
          return <path key={i} d={`M${f1(x)},${-h * 0.05} L${f1(x + ww)},${-h * 0.05} L${f1(x + ww * 3 + lean)},${f1(h * 1.05)} L${f1(x + lean)},${f1(h * 1.05)}Z`} fill="url(#grRay)" opacity={fl} />;
        })}
      </g>
    </g>
  );
};

/** Nieve marina: partículas orgánicas que caen despacio. Tres capas (lejana, media, cercana desenfocada). */
export const MarineSnow: React.FC<{cam: Cam; t: number; density?: number; current?: number; color?: string; seed?: number}> = ({cam, t, density = 1, current = 6, color = '#dfeef4', seed = 1}) => {
  const {w, h, q} = useView();
  const vp: VP = {w, h};
  const layers = [
    {d: 0.45, n: 70, r: 1.3, op: 0.35, blur: 0},
    {d: 1, n: 55, r: 1.8, op: 0.55, blur: 0},
    {d: 1.6, n: 16, r: 4.5, op: 0.4, blur: 3},
  ];
  return (
    <g>
      <defs>
        <filter id="snB" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={2.5 * q.blur} /></filter>
      </defs>
      {layers.map((L, li) => {
        const box = visible(cam, vp, L.d, 60);
        const sw = box.x1 - box.x0;
        const sh = box.y1 - box.y0;
        const z = Math.pow(cam.zoom, L.d);
        const n = Math.round(L.n * density * q.particles * (w * h) / (1920 * 1080));
        return (
          <g key={li} transform={layerT(cam, vp, L.d)} filter={L.blur && q.blur > 0.6 ? 'url(#snB)' : undefined} opacity={L.op}>
            {Array.from({length: n}, (_, i) => {
              const s = seed * 101 + li * 997 + i * 13;
              const x = wrap(hash1(s) * 6000 + t * current * (0.5 + hash1(s + 1)) + Math.sin(t * 0.5 + i) * 6, box.x0, sw);
              const y = wrap(hash1(s + 2) * 6000 + t * (8 + hash1(s + 3) * 10), box.y0, sh);
              const r = (L.r * (0.6 + hash1(s + 4) * 0.9)) / Math.pow(z, 0.75);
              return <ellipse key={i} cx={f1(x)} cy={f1(y)} rx={f1(r)} ry={f1(r * 0.8)} fill={color} />;
            })}
          </g>
        );
      })}
    </g>
  );
};

/** Plancton bioluminiscente: destellos azules que parpadean (y se avivan cerca de `stir`, p. ej. un animal que pasa). */
export const BioSpecks: React.FC<{cam: Cam; t: number; n?: number; color?: string; seed?: number; stir?: V[]; stirR?: number; k?: number}> = ({cam, t, n = 40, color = '#5ad8ff', seed = 7, stir = [], stirR = 300, k = 1}) => {
  const {w, h, q} = useView();
  const vp: VP = {w, h};
  if (k <= 0.01) return null;
  const box = visible(cam, vp, 1, 80);
  const sw = box.x1 - box.x0;
  const sh = box.y1 - box.y0;
  const N = Math.round(n * q.particles);
  return (
    <g transform={layerT(cam, vp, 1)} style={{mixBlendMode: 'screen'}} opacity={k}>
      {Array.from({length: N}, (_, i) => {
        const s = seed * 37 + i * 17;
        const x = wrap(hash1(s) * 5000 + Math.sin(t * 0.3 + i) * 20, box.x0, sw);
        const y = wrap(hash1(s + 1) * 5000 + Math.cos(t * 0.25 + i) * 16, box.y0, sh);
        let b = Math.max(0, Math.sin(t * (0.7 + hash1(s + 2) * 1.3) + hash1(s + 3) * 20)) ** 3;
        for (const p of stir) {
          const dd = Math.hypot(p.x - x, p.y - y);
          if (dd < stirR) b = Math.max(b, (1 - dd / stirR) * (0.6 + 0.4 * Math.sin(t * 9 + i)));
        }
        if (b < 0.05) return null;
        const r = (2 + hash1(s + 4) * 2.5) / Math.pow(cam.zoom, 0.6);
        return (
          <g key={i} opacity={b}>
            <circle cx={f1(x)} cy={f1(y)} r={f1(r * 4)} fill={color} opacity={0.18} />
            <circle cx={f1(x)} cy={f1(y)} r={f1(r)} fill="#eaffff" />
          </g>
        );
      })}
    </g>
  );
};

/** Burbujas que ascienden con bamboleo (fuentes en coordenadas del mundo). */
export const Bubbles: React.FC<{cam: Cam; t: number; sources: {x: number; y: number; rate?: number; t0?: number; t1?: number}[]; rise?: number}> = ({cam, t, sources, rise = 120}) => {
  const {w, h} = useView();
  return (
    <g transform={layerT(cam, {w, h}, 1)}>
      {sources.map((s, si) => {
        const rate = s.rate ?? 6;
        const out: React.ReactNode[] = [];
        const life = 4;
        for (let k = 0; k < rate * life; k++) {
          const born = Math.floor((t - life) * rate) / rate + k / rate;
          if (born < (s.t0 ?? -1e9) || born > (s.t1 ?? 1e9) || born > t) continue;
          const age = t - born;
          const id = Math.round(born * rate) + si * 1000;
          const r = 2 + hash1(id) * 6;
          const y = s.y - age * rise * (0.7 + hash1(id + 1) * 0.6) * (1 + r / 10);
          const x = s.x + Math.sin(age * 4 + id) * (4 + r) + (hash1(id + 2) - 0.5) * 30;
          out.push(
            <g key={`${si}-${k}`} opacity={clamp(1 - age / life) * 0.9}>
              <circle cx={f1(x)} cy={f1(y)} r={f1(r)} fill="#bfefff" fillOpacity={0.15} stroke="#e8fbff" strokeWidth={0.9} />
              <circle cx={f1(x - r * 0.35)} cy={f1(y - r * 0.35)} r={f1(r * 0.25)} fill="#ffffff" opacity={0.8} />
            </g>,
          );
        }
        return <g key={si}>{out}</g>;
      })}
    </g>
  );
};

/** Halo luminoso (bioluminiscencia, focos). */
export const Glow: React.FC<{x: number; y: number; r: number; color?: string; k?: number; id: string}> = ({x, y, r, color = '#7ae8ff', k = 1, id}) =>
  k > 0.01 ? (
    <g style={{mixBlendMode: 'screen'}} opacity={k}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.9} />
          <stop offset="0.15" stopColor={color} stopOpacity={0.7} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={f1(x)} cy={f1(y)} r={f1(r)} fill={`url(#${id})`} />
    </g>
  ) : null;

/** Ecolocalización ILUSTRATIVA: arcos que salen del emisor (clics) y ecos que vuelven del blanco. */
export const EchoWaves: React.FC<{t: number; origin: V; dir: number; clicks: number[]; target?: V; speed?: number; maxR?: number; spread?: number; k?: number}> = ({t, origin, dir, clicks, target, speed = 1400, maxR = 1700, spread = 0.42, k = 1}) => {
  const arcs: React.ReactNode[] = [];
  clicks.forEach((c, i) => {
    const age = t - c;
    if (age < 0) return;
    const r = age * speed;
    if (r < maxR) {
      const a0 = (dir > 0 ? 0 : Math.PI) - spread;
      const a1 = (dir > 0 ? 0 : Math.PI) + spread;
      const p0 = {x: origin.x + Math.cos(a0) * r, y: origin.y + Math.sin(a0) * r};
      const p1 = {x: origin.x + Math.cos(a1) * r, y: origin.y + Math.sin(a1) * r};
      const op = (1 - r / maxR) * k;
      arcs.push(<path key={`c${i}`} d={`M${f1(p0.x)},${f1(p0.y)} A${f1(r)},${f1(r)} 0 0 1 ${f1(p1.x)},${f1(p1.y)}`} stroke="#9fe8ff" strokeWidth={5} fill="none" opacity={op} strokeLinecap="round" />);
    }
    if (target) {
      const dist = Math.hypot(target.x - origin.x, target.y - origin.y);
      const hit = dist / speed;
      const back = age - hit;
      if (back > 0 && back * speed < dist) {
        const rr = back * speed;
        const ang = Math.atan2(origin.y - target.y, origin.x - target.x);
        const q0 = {x: target.x + Math.cos(ang - 0.35) * rr, y: target.y + Math.sin(ang - 0.35) * rr};
        const q1 = {x: target.x + Math.cos(ang + 0.35) * rr, y: target.y + Math.sin(ang + 0.35) * rr};
        arcs.push(<path key={`e${i}`} d={`M${f1(q0.x)},${f1(q0.y)} A${f1(rr)},${f1(rr)} 0 0 1 ${f1(q1.x)},${f1(q1.y)}`} stroke="#ffd890" strokeWidth={3.5} fill="none" opacity={(1 - back * speed / dist) * 0.9 * k} strokeDasharray="10 8" />);
      }
    }
  });
  return <g style={{mixBlendMode: 'screen'}}>{arcs}</g>;
};

/** Distorsión óptica acuática (ondulación de refracción) para un grupo; solo en calidad premium. */
export const AquaWarp: React.FC<{t: number; k?: number; id: string; children: React.ReactNode}> = ({t, k = 1, id, children}) => {
  const {q} = useView();
  if (!q.warp || k <= 0.01) return <>{children}</>;
  return (
    <g>
      <defs>
        <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency={`${(0.006 + Math.sin(t * 0.4) * 0.0008).toFixed(5)} ${(0.012 + Math.cos(t * 0.33) * 0.001).toFixed(5)}`} numOctaves={2} seed={3} />
          <feDisplacementMap in="SourceGraphic" scale={(10 * k).toFixed(1)} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>{children}</g>
    </g>
  );
};

/** Gradación cinematográfica: viñeta, tinte de sombras/luces y grano fino. */
export const Grade: React.FC<{t: number; vignette?: number; tint?: string; tintK?: number; warm?: number}> = ({t, vignette = 0.7, tint = '#0a2a4a', tintK = 0.18, warm = 0}) => {
  const {q, w, h} = useView();
  const frame = Math.round(t * 30);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: tint, opacity: tintK, mixBlendMode: 'soft-light'}} />
      {warm > 0.01 && <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255,190,120,0.5), rgba(0,0,0,0) 70%)', opacity: warm, mixBlendMode: 'soft-light'}} />}
      <AbsoluteFill style={{background: `radial-gradient(ellipse ${w > h ? '75% 85%' : '90% 70%'} at 50% 48%, rgba(0,0,0,0) 52%, rgba(0,3,10,0.85) 100%)`, opacity: vignette}} />
      {q.grain && (
        <svg width={w} height={h} style={{position: 'absolute', inset: 0, opacity: 0.06, mixBlendMode: 'overlay'}}>
          <defs>
            <pattern id="grain" width={96} height={96} patternUnits="userSpaceOnUse" patternTransform={`translate(${(frame * 37) % 96} ${(frame * 53) % 96})`}>
              {Array.from({length: 70}, (_, i) => <rect key={i} x={hash1(i * 3) * 96} y={hash1(i * 7) * 96} width={1.5} height={1.5} fill={i % 2 ? '#fff' : '#000'} />)}
            </pattern>
          </defs>
          <rect width={w} height={h} fill="url(#grain)" />
        </svg>
      )}
    </AbsoluteFill>
  );
};

/** Fundido «orgánico»: velo de partículas/agua que cubre un cambio de plano. u: −1…1 (0 = cubierto). */
export const WaterVeil: React.FC<{u: number; color?: string; max?: number}> = ({u, color = '#02070f', max = 0.92}) => {
  const {w, h} = useView();
  if (u <= -1 || u >= 1) return null;
  const k = 1 - Math.abs(u);
  const e = k * k * (3 - 2 * k);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: color, opacity: e * max}} />
      <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 60}, (_, i) => {
          const x = hash1(i * 5) * w;
          const y = (hash1(i * 9) * h - u * h * 0.6 * (0.5 + hash1(i))) % h;
          return <circle key={i} cx={x} cy={(y + h) % h} r={2 + hash1(i) * 6} fill="#bfefff" opacity={e * 0.5} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const lerpV = (a: V, b: V, u: number): V => ({x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u)});
