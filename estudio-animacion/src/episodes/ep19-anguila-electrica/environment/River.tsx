// ESCENARIO — RÍO AMAZÓNICO DE AGUA TURBIA (bosque inundado). Cinco planos de profundidad:
//  1) fondo lejano del río (gradiente esmeralda → petróleo → marrón) con haces de luz desde arriba;
//  2) siluetas de raíces colgantes y vegetación (parallax 0,35, desenfocadas);
//  3) troncos y piedras del plano medio (0,65) con un cardumen de peces pequeños;
//  4) plano del animal: lecho de limo y hojarasca, raíces cercanas, plantas acuáticas que ondean;
//  5) (RiverFront) partículas en suspensión y vegetación desenfocada del primer plano.
// La superficie está en y = SURF (vista desde abajo: espejo ondulado y franja de aire con selva).
// Turbidez: velo marrón verdoso (parámetro murk). Todo determinista.
import React from 'react';
import {clamp, hash1} from '../../../engine/math';
import {Cam, layerT, toScreen} from '../../../studio2';
/** Desenfoque en coordenadas de PANTALLA (se aplica a un grupo sin transformar que envuelve la capa):
 *  región fija del tamaño del encuadre, sin recortes ni regiones gigantes al hacer zoom. */
const SoftFilter: React.FC<{id: string; radius: number}> = ({id, radius}) => (
  <filter id={id} filterUnits="userSpaceOnUse" x={-200} y={-200} width={1480} height={2320}>
    <feGaussianBlur stdDeviation={radius} />
  </filter>
);

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
export const FLOOR = 560;
export const SURF = -1500;

export const HangingRoots: React.FC<{x: number; top: number; len: number; t: number; seed: number; c: string; w?: number}> = ({x, top, len, t, seed, c, w = 1}) => (
  <g>
    {Array.from({length: 5}, (_, i) => {
      const x0 = x + (hash1(seed + i * 3) - 0.5) * 90 * w;
      const L = len * (0.6 + 0.4 * hash1(seed * 7 + i));
      const sway = Math.sin(t * 0.5 + seed + i) * 12;
      return <path key={i} d={`M${f1(x0)},${top} C${f1(x0 + 20 * w)},${f1(top + L * 0.35)} ${f1(x0 - 25 * w + sway * 0.5)},${f1(top + L * 0.7)} ${f1(x0 + sway)},${f1(top + L)}`} stroke={c} strokeWidth={(10 - i * 1.4) * w} fill="none" strokeLinecap="round" />;
    })}
  </g>
);

export const Weed: React.FC<{x: number; base: number; h: number; t: number; seed: number; c: string}> = ({x, base, h, t, seed, c}) => (
  <g>
    {Array.from({length: 4}, (_, i) => {
      const x0 = x + (i - 1.5) * 10;
      const sw = Math.sin(t * 0.9 + seed + i * 0.7) * 26;
      const hh = h * (0.7 + 0.3 * hash1(seed + i));
      return <path key={i} d={`M${f1(x0)},${base} Q${f1(x0 + sw * 0.4)},${f1(base - hh * 0.5)} ${f1(x0 + sw)},${f1(base - hh)}`} stroke={c} strokeWidth={9 - i} fill="none" strokeLinecap="round" opacity={0.9} />;
    })}
  </g>
);

export const Trunk: React.FC<{x: number; y: number; len: number; ang: number; w: number; c?: string}> = ({x, y, len, ang, w, c = '#2a2418'}) => {
  // tronco sumergido: silueta irregular que se afina, corteza, muñones de ramas y musgo
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  const P = (u: number, o: number) => ({x: x + ca * len * u - sa * o, y: y + sa * len * u + ca * o});
  const N = 9;
  const top = Array.from({length: N + 1}, (_, i) => {
    const u = i / N;
    return P(u, -(w / 2) * (1 - 0.45 * u) * (0.9 + 0.2 * hash1(x + i * 3)));
  });
  const bot = Array.from({length: N + 1}, (_, i) => {
    const u = i / N;
    return P(u, (w / 2) * (1 - 0.45 * u) * (0.9 + 0.2 * hash1(y + i * 5)));
  });
  const d = `M${top.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')} L${bot.reverse().map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')}Z`;
  const br = [0.35, 0.62, 0.85].map((u, i) => {
    const b0 = P(u, (i % 2 ? 1 : -1) * w * 0.3);
    const a2 = ang + (i % 2 ? 0.9 : -0.9);
    const L = w * (1.6 - i * 0.3);
    return `M${f1(b0.x)},${f1(b0.y)} l${f1(Math.cos(a2) * L)},${f1(Math.sin(a2) * L)}`;
  });
  return (
    <g>
      <path d={br.join(' ')} stroke={c} strokeWidth={w * 0.22} strokeLinecap="round" />
      <path d={d} fill={c} />
      {Array.from({length: 7}, (_, i) => {
        const a0 = P((i + 0.5) / 7, -w * 0.15);
        const a1 = P((i + 0.5) / 7 + 0.06, -w * 0.05);
        return <path key={i} d={`M${f1(a0.x)},${f1(a0.y)} L${f1(a1.x)},${f1(a1.y)}`} stroke="#4a4030" strokeWidth={2} opacity={0.6} />;
      })}
      <path d={`M${top.slice(0, N).map((p) => `${f1(p.x)},${f1(p.y + 3)}`).join(' L')}`} stroke="#7a7050" strokeWidth={w * 0.06} fill="none" opacity={0.35} />
      {Array.from({length: 5}, (_, i) => {
        const m = P((i + 0.4) / 5, -w * 0.42);
        return <ellipse key={`m${i}`} cx={m.x} cy={m.y} rx={w * 0.35} ry={w * 0.12} fill="#3a5a2a" opacity={0.55} />;
      })}
    </g>
  );
};

export type RiverOpts = {murk?: number; light?: number; extent?: [number, number]; school?: boolean};

export const RiverBack: React.FC<{cam: Cam; t: number; children?: React.ReactNode} & RiverOpts> = ({cam, t, children, murk = 0.35, light = 1, extent = [-3000, 5000], school = true}) => {
  const sy = toScreen(cam, 0, SURF).y;
  return (
    <g>
      <defs>
        <linearGradient id="rvWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a7a62" />
          <stop offset="0.4" stopColor="#1c4a42" />
          <stop offset="0.75" stopColor="#14302a" />
          <stop offset="1" stopColor="#1c1a10" />
        </linearGradient>
        <radialGradient id="rvGlow" cx="0.55" cy="0.0" r="0.9">
          <stop offset="0" stopColor="#e8d890" stopOpacity={0.45} />
          <stop offset="0.5" stopColor="#8ab878" stopOpacity={0.1} />
          <stop offset="1" stopColor="#8ab878" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="rvRay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0e8a8" stopOpacity={0.4} />
          <stop offset="1" stopColor="#f0e8a8" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="rvBed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a4a2c" />
          <stop offset="0.3" stopColor="#3a3020" />
          <stop offset="1" stopColor="#14100a" />
        </linearGradient>
        <SoftFilter id="rvFar" radius={9} />
        <SoftFilter id="rvRays" radius={24} />
      </defs>
      <rect width={1080} height={1920} fill="url(#rvWater)" />
      <rect width={1080} height={1920} fill="url(#rvGlow)" opacity={light} />
      {/* 1 · haces de luz y fondo lejano */}
      <g filter="url(#rvRays)"><g transform={layerT(cam, 0.15)} opacity={0.7 * light}>
        {Array.from({length: 6}, (_, i) => {
          const x = cam.x * 0.15 - 600 + i * 240 + Math.sin(t * 0.25 + i) * 30;
          return <path key={i} d={`M${f1(x + 240)},${SURF * 0.15 - 200} L${f1(x + 330)},${SURF * 0.15 - 200} L${f1(x - 60)},900 L${f1(x - 230)},900Z`} fill="url(#rvRay)" opacity={0.35 + 0.25 * Math.sin(t * 0.5 + i * 1.7)} />;
        })}
      </g></g>
      {/* 2 · raíces colgantes y vegetación en silueta */}
      <g filter="url(#rvFar)"><g transform={layerT(cam, 0.35)} opacity={0.6}>
        {Array.from({length: 9}, (_, i) => (
          <HangingRoots key={i} x={cam.x * 0.35 - 1400 + i * 330 + hash1(i) * 80} top={SURF * 0.35 - 100} len={900 + hash1(i * 3) * 500} t={t} seed={i * 5} c="#16302a" w={1.6} />
        ))}
        <rect x={cam.x * 0.35 - 2600} y={FLOOR * 0.35 + 180} width={5200} height={1600} fill="#14261e" />
      </g></g>
      {/* 3 · troncos y piedras del plano medio + cardumen */}
      <g transform={layerT(cam, 0.65)} opacity={0.85}>
        <rect x={cam.x * 0.65 - 2600} y={FLOOR * 0.65 + 90} width={5200} height={1600} fill="#2a281a" />
        {Array.from({length: 7}, (_, i) => (
          <Trunk key={`t${i}`} x={cam.x * 0.65 - 1500 + i * 480 + hash1(i * 2) * 120} y={FLOOR * 0.65 + 80 - hash1(i * 4) * 160} len={420 + hash1(i * 6) * 300} ang={-0.5 - hash1(i * 8) * 0.9} w={34 + hash1(i) * 26} c="#22201a" />
        ))}
        {Array.from({length: 9}, (_, i) => (
          <ellipse key={`s${i}`} cx={cam.x * 0.65 - 1500 + i * 360 + hash1(i * 9) * 100} cy={FLOOR * 0.65 + 96} rx={70 + hash1(i * 3) * 80} ry={30 + hash1(i * 5) * 30} fill="#2e2c20" />
        ))}
        {school &&
          Array.from({length: 14}, (_, i) => {
            const px = cam.x * 0.65 + ((hash1(i * 3) * 1600 + t * 40) % 1600) - 800;
            const py = cam.y * 0.65 - 200 + hash1(i * 7) * 220 + Math.sin(t * 1.3 + i) * 12;
            return <path key={`f${i}`} d={`M${f1(px)},${f1(py)} q-8,-5 -16,0 q8,5 16,0 M${f1(px - 16)},${f1(py)} l-6,${f1(-4 + Math.sin(t * 12 + i) * 2)} l0,8z`} fill="#8aa898" opacity={0.55} />;
          })}
      </g>
      {/* superficie vista desde abajo (solo visible cerca de ella) */}
      {sy > -200 && (
        <g>
          <rect x={0} y={0} width={1080} height={clamp(sy, 0, 1920)} fill="#2a4a2a" />
          <rect x={0} y={0} width={1080} height={clamp(sy, 0, 1920)} fill="url(#rvGlow)" />
          {Array.from({length: 7}, (_, i) => <rect key={`tr${i}`} x={((i * 170 + cam.x * 0.2) % 1200) - 60} y={clamp(sy - 900, -900, 1920)} width={30 + (i % 3) * 20} height={900} fill="#16261a" opacity={0.7} />)}
        </g>
      )}
      {/* 4 · plano del animal */}
      <g transform={layerT(cam, 1)}>
        {sy > -200 && (
          <g>
            <rect x={extent[0]} y={SURF - 6} width={extent[1] - extent[0]} height={60} fill="#cfe8d0" opacity={0.18} />
            <path d={`M${extent[0]},${SURF} ${Array.from({length: Math.ceil((extent[1] - extent[0]) / 100)}, (_, i) => `Q${extent[0] + i * 100 + 50},${f1(SURF - 4 + Math.sin(t * 2 + i) * 4)} ${extent[0] + (i + 1) * 100},${SURF}`).join(' ')}`} stroke="#e8fff0" strokeWidth={3} fill="none" opacity={0.7} />
            {Array.from({length: 14}, (_, i) => <path key={`cw${i}`} d={`M${extent[0] + 200 + i * 520 + Math.sin(t + i) * 40},${SURF + 30 + (i % 3) * 18} q40,8 80,0`} stroke="#e8f8d0" strokeWidth={2} fill="none" opacity={0.25} />)}
          </g>
        )}
        <path d={`M${extent[0]},${FLOOR} ${Array.from({length: Math.ceil((extent[1] - extent[0]) / 200)}, (_, i) => `Q${extent[0] + i * 200 + 100},${FLOOR - 12 + Math.sin(i * 1.7) * 10} ${extent[0] + (i + 1) * 200},${FLOOR}`).join(' ')} L${extent[1]},2600 L${extent[0]},2600Z`} fill="url(#rvBed)" />
        {Array.from({length: 90}, (_, i) => {
          const x = extent[0] + hash1(i * 6.7) * (extent[1] - extent[0]);
          const y = FLOOR + 10 + Math.pow(hash1(i * 3.9), 0.8) * 500;
          const s = 0.6 + hash1(i * 2.1) * 0.9;
          return <path key={`lf${i}`} d={`M${f1(x)},${f1(y)} q${f1(14 * s)},${f1(-9 * s)} ${f1(30 * s)},0 q${f1(-14 * s)},${f1(9 * s)} ${f1(-30 * s)},0Z`} fill={['#6a4a24', '#5a3a1a', '#7a5a2a', '#4a3a1e'][i % 4]} opacity={0.85} />;
        })}
        {Array.from({length: 40}, (_, i) => (
          <ellipse key={`pb${i}`} cx={extent[0] + hash1(i * 9.3) * (extent[1] - extent[0])} cy={FLOOR + 14 + hash1(i * 4.4) * 420} rx={4 + hash1(i) * 9} ry={3 + hash1(i * 2) * 5} fill={['#4a4434', '#3a3428', '#5e5644'][i % 3]} />
        ))}
        {children}
      </g>
      {/* turbidez */}
      <rect width={1080} height={1920} fill="#4a4a26" opacity={0.18 * murk} />
    </g>
  );
};

export const RiverFront: React.FC<{cam: Cam; t: number; murk?: number}> = ({cam, t, murk = 0.35}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <defs>
      <SoftFilter id="rvFg" radius={10} />
    </defs>
    <g transform={layerT(cam, 1.15)}>
      {Array.from({length: Math.round(24 + 30 * murk)}, (_, i) => (
        <circle key={i} cx={cam.x * 1.15 + ((hash1(i * 11) * 1800 + t * (18 + hash1(i) * 14)) % 1800) - 900} cy={cam.y * 1.15 + ((hash1(i * 13) * 2400 + Math.sin(t * 0.6 + i) * 30) % 2400) - 1200} r={1.2 + hash1(i * 5) * 2.6} fill="#e8e0b8" opacity={0.45} />
      ))}
    </g>
    <g filter="url(#rvFg)"><g transform={layerT(cam, 1.5)} opacity={Math.max(0, Math.min(1, (2.8 - cam.zoom) / 0.9)) * 0.85}>
      <HangingRoots x={cam.x * 1.5 - 560} top={cam.y * 1.5 - 1300} len={1100} t={t} seed={91} c="#0a140e" w={2.2} />
      <Weed x={cam.x * 1.5 + 560} base={cam.y * 1.5 + 1150} h={700} t={t} seed={93} c="#0c1a0e" />
    </g></g>
  </svg>
);
