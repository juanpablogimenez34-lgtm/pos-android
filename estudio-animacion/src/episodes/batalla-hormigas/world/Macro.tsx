// MICROMUNDO ILUSTRADO (escala de hormiga: 1 mm = 60 px). Capas con parallax: cielo cálido difuminado, hierbas
// gigantes lejanas y desenfocadas, hojas, piedra-montaña, gota de agua transparente, hongos, raíz, ramita, musgo,
// suelo con granos de arena memorizados, polvo en suspensión, rayos de sol y elementos desenfocados en primer plano.
// También: nido de hormigas carpinteras en madera, montículo y túneles de hormigas de fuego con cámaras de cría,
// y el terreno visto desde arriba con la fuente de alimento y los rastros químicos.
import React from 'react';
import {clamp, hash1, lerp, mixColor, smoothPath} from '../../../engine/math';
import {Cam, layerT, toScreen} from '../../../studio2';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);
const memo = new Map<string, string>();
const cached = (k: string, fn: () => string) => {
  let v = memo.get(k);
  if (v === undefined) {
    v = fn();
    memo.set(k, v);
  }
  return v;
};

// ------------------------------------------------------------------ terreno (vista lateral)
export const BASE = 1400; // nivel del suelo en el mundo
export const PEBBLE = {x: 2300, r: 520, h: 430};
/** Altura del suelo en x (incluye la piedra-montaña): los pies de las hormigas se apoyan aquí. */
export function groundY(x: number) {
  let y = BASE + Math.sin(x * 0.004) * 14 + Math.sin(x * 0.011 + 1) * 6;
  const dx = (x - PEBBLE.x) / PEBBLE.r;
  if (Math.abs(dx) < 1) y -= PEBBLE.h * Math.sqrt(1 - dx * dx) * (1 - 0.15 * dx * dx);
  return y;
}
/** Posición del cuerpo sobre el terreno: altura media bajo las patas y cabeceo según la pendiente. */
export function onGround(x: number, facing: number, scale: number, groundLocal: number, ground = groundY) {
  const fx = facing >= 0 ? 1 : -1;
  const front = x + 380 * scale * fx;
  const back = x - 360 * scale * fx;
  const gf = ground(front);
  const gb = ground(back);
  // la pendiente se mide siempre de izquierda a derecha: con facing −1 el escalado espeja el cuerpo
  const xl = Math.min(front, back);
  const xr = Math.max(front, back);
  return {y: (gf + gb) / 2 - groundLocal * scale, angle: Math.atan2(ground(xr) - ground(xl), xr - xl)};
}

const Grass: React.FC<{x: number; y: number; h: number; t: number; seed: number; col: string; w?: number}> = ({x, y, h, t, seed, col, w = 40}) => {
  const sway = Math.sin(t * 0.8 + seed) * 0.08 + Math.sin(t * 2.1 + seed * 2) * 0.02;
  const lean = (hash1(seed) - 0.5) * 0.3 + sway;
  const tip = {x: x + Math.sin(lean) * h, y: y - Math.cos(lean) * h};
  const c1 = {x: x + Math.sin(lean * 0.4) * h * 0.5, y: y - h * 0.5};
  return <path d={`M${f1(x - w / 2)} ${f1(y)}Q${f1(c1.x - w * 0.3)} ${f1(c1.y)} ${f1(tip.x)} ${f1(tip.y)}Q${f1(c1.x + w * 0.3)} ${f1(c1.y)} ${f1(x + w / 2)} ${f1(y)}Z`} fill={col} />;
};
const Pebble: React.FC<{x: number; y: number; r: number; h: number; seed: number}> = ({x, y, r, h, seed}) => {
  const d = cached(`peb-${seed}-${r}`, () => {
    const pts: V[] = [];
    for (let i = 0; i <= 16; i++) {
      const a = Math.PI + (i / 16) * Math.PI;
      const k = 0.85 + hash1(seed + i) * 0.2;
      pts.push({x: Math.cos(a) * r * k, y: Math.sin(a) * h * k * (1 - 0.15 * Math.cos(a) ** 2)});
    }
    return smoothPath([...pts, {x: r, y: 30}, {x: -r, y: 30}], true);
  });
  return (
    <g transform={`translate(${f1(x)} ${f1(y)})`}>
      <defs>
        <radialGradient id={`peb${seed}`} cx="0.35" cy="0.25" r="0.85">
          <stop offset="0" stopColor="#c8b8a0" />
          <stop offset="0.55" stopColor="#8a7a68" />
          <stop offset="1" stopColor="#3a3028" />
        </radialGradient>
      </defs>
      <path d={d} fill={`url(#peb${seed})`} stroke="#2a2018" strokeWidth={3} />
      {Array.from({length: 14}, (_, i) => <ellipse key={i} cx={f1((hash1(seed + i * 3) - 0.5) * r * 1.4)} cy={f1(-hash1(seed + i * 5) * h * 0.8)} rx={10 + hash1(i) * 26} ry={5 + hash1(i * 2) * 10} fill={i % 2 ? '#e8dcc8' : '#4a3e32'} opacity={0.25} />)}
      <path d={`M${-r * 0.5} ${-h * 0.75}Q0 ${-h * 1.02} ${r * 0.45} ${-h * 0.8}`} stroke="#ffffff" strokeWidth={14} fill="none" opacity={0.25} strokeLinecap="round" />
    </g>
  );
};
/** Gota de agua gigante: refracción invertida del fondo, reflejo y cáustica. */
export const Droplet: React.FC<{x: number; y: number; r: number; t: number}> = ({x, y, r, t}) => (
  <g transform={`translate(${f1(x)} ${f1(y)})`}>
    <defs>
      <radialGradient id="drop-g" cx="0.5" cy="0.62" r="0.6">
        <stop offset="0" stopColor="#e8f8ff" stopOpacity={0.35} />
        <stop offset="0.7" stopColor="#a8d8e8" stopOpacity={0.22} />
        <stop offset="1" stopColor="#3a6a7a" stopOpacity={0.55} />
      </radialGradient>
      <linearGradient id="drop-ref" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#ffe0a0" stopOpacity={0.55} />
        <stop offset="1" stopColor="#6a9a4a" stopOpacity={0.35} />
      </linearGradient>
    </defs>
    <ellipse cx={0} cy={6} rx={r * 1.1} ry={r * 0.18} fill="#2a1a08" opacity={0.25} />
    <path d={`M${-r} 0C${-r} ${-r * 1.2} ${r} ${-r * 1.2} ${r} 0C${r * 0.6} ${r * 0.08} ${-r * 0.6} ${r * 0.08} ${-r} 0Z`} fill="url(#drop-g)" stroke="#e8f8ff" strokeWidth={4} strokeOpacity={0.6} />
    <path d={`M${-r * 0.7} ${-r * 0.15}C${-r * 0.6} ${-r * 0.65} ${r * 0.6} ${-r * 0.65} ${r * 0.7} ${-r * 0.15}Z`} fill="url(#drop-ref)" />
    <ellipse cx={-r * 0.35} cy={-r * 0.62} rx={r * 0.22} ry={r * 0.1} fill="#ffffff" opacity={0.85} transform={`rotate(-25 ${-r * 0.35} ${-r * 0.62})`} />
    <circle cx={r * 0.45} cy={-r * 0.35} r={r * 0.05} fill="#ffffff" opacity={0.7} />
    <ellipse cx={r * 0.1} cy={r * 0.02} rx={r * 0.5} ry={r * 0.05} fill="#fff4c8" opacity={0.3 + 0.15 * Math.sin(t * 2)} />
  </g>
);
const Mushroom: React.FC<{x: number; y: number; s: number; seed: number}> = ({x, y, s, seed}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) scale(${s})`}>
    <path d="M-18 0L-12 -150L12 -150L18 0Z" fill="#e8d8c0" />
    <path d="M-120 -140C-110 -230 110 -230 120 -140C60 -120 -60 -120 -120 -140Z" fill={seed % 2 ? '#c86a3a' : '#a8784a'} stroke="#5a3018" strokeWidth={3} />
    {Array.from({length: 7}, (_, i) => <path key={i} d={`M${-90 + i * 30} -132l${f1((i - 3) * 4)} 14`} stroke="#8a5a3a" strokeWidth={3} />)}
    <ellipse cx={-30} cy={-195} rx={40} ry={12} fill="#ffffff" opacity={0.3} />
  </g>
);
const Leaf: React.FC<{x: number; y: number; w: number; h: number; rot: number; col: string; t: number; seed: number}> = ({x, y, w, h, rot, col, t, seed}) => {
  const sway = Math.sin(t * 0.7 + seed) * 2.5;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(rot + sway)})`}>
      <path d={`M0 0C${w * 0.3} ${-h} ${w * 0.75} ${-h * 0.9} ${w} 0C${w * 0.7} ${h * 0.7} ${w * 0.3} ${h * 0.75} 0 0Z`} fill={col} stroke={mixColor(col, '#000', 0.4)} strokeWidth={4} />
      <path d={`M0 0Q${w * 0.5} ${-h * 0.05} ${w} 0`} stroke={mixColor(col, '#ffffff', 0.3)} strokeWidth={6} fill="none" />
      {Array.from({length: 6}, (_, i) => <path key={i} d={`M${w * (0.15 + i * 0.13)} ${-h * 0.02}l${w * 0.1} ${-h * 0.45}M${w * (0.15 + i * 0.13)} ${h * 0.02}l${w * 0.1} ${h * 0.4}`} stroke={mixColor(col, '#ffffff', 0.2)} strokeWidth={3} opacity={0.7} />)}
    </g>
  );
};

/** Escenario lateral completo (suelo, piedra, gota, hierbas, hojas, hongos, raíz, ramita, musgo, polvo, rayos). */
export const SideWorld: React.FC<{cam: Cam; t: number; children?: React.ReactNode; front?: React.ReactNode; warm?: number; food?: V; leafGround?: boolean}> = ({cam, t, children, front, warm = 1, food, leafGround}) => {
  const x0 = cam.x - 900 / cam.zoom;
  const x1 = cam.x + 900 / cam.zoom;
  const ground: V[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = lerp(x0 - 200, x1 + 200, i / 60);
    ground.push({x, y: groundY(x)});
  }
  const groundPath = `M${f1(ground[0].x)} ${f1(ground[0].y)}${ground.map((p) => `L${f1(p.x)} ${f1(p.y)}`).join('')}L${f1(x1 + 200)} ${BASE + 3000}L${f1(x0 - 200)} ${BASE + 3000}Z`;
  const sy = toScreen(cam, cam.x, BASE).y;
  return (
    <g>
      <defs>
        <linearGradient id="mw-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mixColor('#6a8a5a', '#d8b870', warm * 0.5)} />
          <stop offset="0.6" stopColor={mixColor('#a8b878', '#f0d898', warm * 0.6)} />
          <stop offset="1" stopColor={mixColor('#d8c898', '#ffe8b0', warm * 0.5)} />
        </linearGradient>
        <linearGradient id="mw-soil" x1="0" y1={BASE - 400} x2="0" y2={BASE + 1400} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7a5634" />
          <stop offset="0.25" stopColor="#5a3a20" />
          <stop offset="1" stopColor="#2a1a0c" />
        </linearGradient>
        <linearGradient id="mw-ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2c0" stopOpacity={0.45} />
          <stop offset="1" stopColor="#fff2c0" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#mw-sky)" />
      {/* hierbas gigantes lejanas, desenfocadas (claras y con poco contraste) */}
      <g transform={layerT(cam, 0.25)}>
        {Array.from({length: 26}, (_, i) => <Grass key={i} x={cam.x * 0.25 - 2600 + i * 210 + hash1(i) * 80} y={BASE * 0.25 + 900} h={1600 + hash1(i * 3) * 1400} t={t} seed={i} col={mixColor('#8aa868', '#e8e0b0', 0.55)} w={70} />)}
      </g>
      <g transform={layerT(cam, 0.5)}>
        {Array.from({length: 16}, (_, i) => <Grass key={i} x={cam.x * 0.5 - 2400 + i * 320 + hash1(i * 7) * 120} y={BASE * 0.5 + 700} h={1400 + hash1(i * 5) * 1200} t={t} seed={i + 40} col={mixColor('#4a7a3a', '#c8d098', 0.3)} w={90} />)}
        <Leaf x={cam.x * 0.5 - 900} y={BASE * 0.5 + 300} w={1400} h={380} rot={-12} col="#5a8a3a" t={t} seed={3} />
      </g>
      {/* rayos de sol */}
      <g opacity={0.55 * warm}>
        {Array.from({length: 5}, (_, i) => {
          const x = 120 + i * 230 + Math.sin(t * 0.2 + i) * 30;
          return <path key={i} d={`M${f1(x)} -20L${f1(x + 90)} -20L${f1(x - 220)} 1920L${f1(x - 420)} 1920Z`} fill="url(#mw-ray)" opacity={0.3 + 0.3 * Math.sin(t * 0.5 + i * 1.7) ** 2} />;
        })}
      </g>
      <g transform={layerT(cam, 1)}>
        {/* ramita, raíz y hongos del plano medio */}
        <path d={`M${f1(cam.x - 2200)} ${BASE - 40}L${f1(cam.x - 900)} ${BASE - 120}`} stroke="#5a3a1a" strokeWidth={70} strokeLinecap="round" opacity={0.0} />
        <path d={`M-4200 ${BASE - 10}C-3900 ${BASE - 160} -3500 ${BASE - 60} -3100 ${BASE - 30}`} stroke="#6a4424" strokeWidth={64} fill="none" strokeLinecap="round" />
        <path d={`M-4200 ${BASE - 18}C-3900 ${BASE - 170} -3500 ${BASE - 70} -3100 ${BASE - 40}`} stroke="#9a6a3a" strokeWidth={14} fill="none" opacity={0.6} />
        <Mushroom x={3300} y={BASE} s={2.4} seed={1} />
        <Mushroom x={3600} y={BASE} s={1.5} seed={2} />
        <Leaf x={-2600} y={BASE - 40} w={1500} h={320} rot={-4} col="#6a9a3a" t={t} seed={7} />
        <path d={groundPath} fill="url(#mw-soil)" />
        {leafGround && <path d={`M${f1(x0 - 200)} ${BASE - 6}L${f1(x1 + 200)} ${BASE - 6}L${f1(x1 + 200)} ${BASE + 60}L${f1(x0 - 200)} ${BASE + 60}Z`} fill="#4a8a2a" />}
        {/* granos de arena y musgo (memorizados por bloque) */}
        {[Math.floor(x0 / 600), Math.floor(x0 / 600) + 1, Math.floor(x0 / 600) + 2, Math.floor(x0 / 600) + 3, Math.floor(x0 / 600) + 4].map((blk) => (
          <g key={blk}>
            {Array.from({length: 18}, (_, i) => {
              const gx = blk * 600 + hash1(blk * 31 + i) * 600;
              const gy = groundY(gx) + 4 + hash1(blk * 17 + i) * 40;
              const r = 6 + hash1(blk * 13 + i) * 22;
              return <ellipse key={i} cx={f1(gx)} cy={f1(gy)} rx={f1(r)} ry={f1(r * 0.7)} fill={i % 3 ? '#a8885a' : '#d8c8a0'} stroke="#3a2610" strokeWidth={1.5} opacity={0.9} />;
            })}
            {Array.from({length: 4}, (_, i) => {
              const gx = blk * 600 + hash1(blk * 7 + i * 3) * 600;
              return <path key={`m${i}`} d={`M${f1(gx - 60)} ${f1(groundY(gx) + 4)}q20 -40 40 -6q14 -46 40 -4q22 -36 40 6Z`} fill="#4a7a2a" opacity={0.85} />;
            })}
          </g>
        ))}
        {/* hierbas del plano medio (detrás de las hormigas) */}
        {Array.from({length: 10}, (_, i) => <Grass key={`g${i}`} x={-3000 + i * 700 + hash1(i * 11) * 200} y={BASE + 10} h={900 + hash1(i * 9) * 900} t={t} seed={i + 80} col="#3a6a2a" w={60} />)}
        <Pebble x={PEBBLE.x} y={BASE + 20} r={PEBBLE.r} h={PEBBLE.h + 20} seed={5} />
        <Droplet x={-2500} y={BASE - 4} r={360} t={t} />
        <Droplet x={4300} y={BASE - 2} r={180} t={t + 1} />
        {food && (
          <g>
            <ellipse cx={food.x} cy={groundY(food.x) - 50} rx={100} ry={62} fill="#e8b860" stroke="#8a5a20" strokeWidth={4} />
            <ellipse cx={food.x - 30} cy={groundY(food.x) - 80} rx={40} ry={14} fill="#fff4d0" opacity={0.5} />
            {Array.from({length: 6}, (_, i) => <circle key={i} cx={food.x - 60 + i * 24} cy={groundY(food.x) - 30 - (i % 3) * 20} r={5} fill="#c8902a" opacity={0.7} />)}
          </g>
        )}
        {children}
      </g>
      {/* polvo en suspensión */}
      {Array.from({length: 28}, (_, i) => {
        const px = ((hash1(i * 3) * 1200 + t * (6 + hash1(i) * 10)) % 1200) - 60;
        const py = ((hash1(i * 7) * 1920 - t * (4 + hash1(i * 2) * 6)) % 1920 + 1920) % 1920;
        return <circle key={`d${i}`} cx={f1(px)} cy={f1(py)} r={1.5 + hash1(i * 5) * 3} fill="#fff4d0" opacity={0.25 + 0.3 * Math.abs(Math.sin(t + i))} />;
      })}
      {/* primer plano desenfocado */}
      <g transform={layerT(cam, 1.6)}>
        {front}
        {[0, 3].map((i) => <Grass key={i} x={cam.x * 1.6 - 1500 + i * 1050} y={BASE * 1.6 + 600} h={1500} t={t} seed={i + 120} col="#1e3a14" w={150} />)}
      </g>
      {sy > 1920 ? null : null}
    </g>
  );
};

// ------------------------------------------------------------------ nidos en corte
/** Nido de hormigas carpinteras en madera: galerías lisas siguiendo la veta y serrín (frass) en la entrada. */
export const WoodNest: React.FC<{cam: Cam; t: number; children?: React.ReactNode}> = ({cam, t, children}) => (
  <g>
    <rect width={1080} height={1920} fill="#2a1a0c" />
    <g transform={layerT(cam, 1)}>
      <defs>
        <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b8864a" />
          <stop offset="1" stopColor="#7a5226" />
        </linearGradient>
      </defs>
      <rect x={-3000} y={200} width={7000} height={2400} fill="url(#wood)" />
      {Array.from({length: 30}, (_, i) => <path key={i} d={`M-3000 ${260 + i * 80 + Math.sin(i) * 20}C-1000 ${240 + i * 80} 1000 ${300 + i * 80} 4000 ${250 + i * 80}`} stroke="#8a5a2a" strokeWidth={3 + (i % 3) * 2} fill="none" opacity={0.45} />)}
      {/* galerías (fondo oscuro) */}
      {[[700, -2400, 2600, 160], [1150, -2000, 3000, 170], [1600, -2600, 2200, 150]].map(([y, a, b, h], i) => (
        <path key={i} d={`M${a} ${y - h / 2}C${a + 800} ${y - h / 2 - 40} ${b - 800} ${y - h / 2 + 40} ${b} ${y - h / 2}L${b} ${y + h / 2}C${b - 800} ${y + h / 2 + 40} ${a + 800} ${y + h / 2 - 40} ${a} ${y + h / 2}Z`} fill="#3a2410" stroke="#d8a868" strokeWidth={4} strokeOpacity={0.4} />
      ))}
      <path d="M-200 700L-120 1150M900 1150L980 1600M1800 700L1850 1150" stroke="#3a2410" strokeWidth={150} strokeLinecap="round" />
      {/* entrada y serrín (frass) */}
      <path d="M2500 620L2700 620L2700 780L2500 780Z" fill="#1a0e04" />
      {Array.from({length: 60}, (_, i) => <ellipse key={`f${i}`} cx={2620 + (hash1(i) - 0.5) * 500} cy={2100 - hash1(i * 3) * 120 * (1 - Math.abs(hash1(i) - 0.5))} rx={8 + hash1(i * 5) * 10} ry={4} fill={i % 4 ? '#d8b878' : '#3a2a1a'} />)}
      <rect x={-3000} y={2060} width={7000} height={600} fill="#4a3018" />
      {children}
    </g>
  </g>
);
/** Montículo de hormigas de fuego y túneles con cámaras (almacén y cría). */
/** Superficie del montículo (los pies de las hormigas se apoyan aquí). */
export const MOUND = (x: number) => {
  const u = clamp(Math.abs(x) / 2100);
  return 260 + 740 * u * u * (3 - 2 * u);
};
const moundPath = `M-4000 ${MOUND(-4000)}${Array.from({length: 81}, (_, i) => `L${-4000 + i * 100} ${f1(MOUND(-4000 + i * 100))}`).join('')}L4000 6000L-4000 6000Z`;
export const FireMound: React.FC<{cam: Cam; t: number; children?: React.ReactNode; brood?: React.ReactNode}> = ({cam, t, children, brood}) => (
  <g>
    <defs>
      <linearGradient id="fm-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c8b878" /><stop offset="1" stopColor="#f0d8a0" /></linearGradient>
      <linearGradient id="fm-soil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8a5a34" /><stop offset="1" stopColor="#3a2010" /></linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#fm-sky)" />
    <g transform={layerT(cam, 1)}>
      <path d={moundPath} fill="url(#fm-soil)" />
      {Array.from({length: 80}, (_, i) => {
        const x = (hash1(i * 3) - 0.5) * 3600;
        const top = MOUND(x);
        return <ellipse key={i} cx={f1(x)} cy={f1(top + 20 + hash1(i * 7) * 40)} rx={10 + hash1(i) * 14} ry={7} fill={i % 3 ? '#a8784a' : '#5a3a20'} />;
      })}
      {/* túneles */}
      {[[0, 300, 0, 900], [0, 900, -700, 1500], [0, 900, 800, 1400], [-700, 1500, -200, 2100], [800, 1400, 300, 2000]].map(([ax, ay, bx, by], i) => <path key={i} d={`M${ax} ${ay}Q${(ax + bx) / 2 + 200} ${(ay + by) / 2} ${bx} ${by}`} stroke="#2a1608" strokeWidth={170} strokeLinecap="round" fill="none" />)}
      {/* cámaras */}
      {[[-700, 1500, 380, 200], [800, 1400, 360, 190], [-200, 2100, 460, 230], [300, 2000, 300, 170]].map(([x, y, rx, ry], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#2a1608" stroke="#8a5a34" strokeWidth={6} />)}
      {brood}
      {children}
    </g>
  </g>
);

// ------------------------------------------------------------------ terreno visto desde arriba
export const TopWorld: React.FC<{cam: Cam; t: number; children?: React.ReactNode; trails?: {pts: V[]; col: string; k: number}[]; food?: V}> = ({cam, t, children, trails = [], food}) => (
  <g>
    <rect width={1080} height={1920} fill="#6a4a2a" />
    <g transform={layerT(cam, 1)}>
      <rect x={-6000} y={-6000} width={12000} height={12000} fill="#7a5634" />
      {Array.from({length: 220}, (_, i) => {
        const x = (hash1(i * 3) - 0.5) * 7000;
        const y = (hash1(i * 7) - 0.5) * 7000;
        const r = 10 + hash1(i * 5) * 40;
        return <ellipse key={i} cx={f1(x)} cy={f1(y)} rx={f1(r)} ry={f1(r * 0.8)} fill={i % 4 ? '#a8885a' : '#4a3018'} opacity={0.75} />;
      })}
      {[[-1400, -900, 260, 7], [1500, 700, 330, 9], [-600, 1600, 220, 11], [1200, -1700, 280, 13]].map(([x, y, r, s], i) => (
        <g key={`p${i}`}>
          <ellipse cx={x + 30} cy={y + 30} rx={r} ry={r * 0.8} fill="#2a1a0a" opacity={0.35} />
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.8} fill="#9a8a78" stroke="#3a3028" strokeWidth={4} />
          <ellipse cx={x - r * 0.3} cy={y - r * 0.3} rx={r * 0.4} ry={r * 0.25} fill="#e8dcc8" opacity={0.4} />
        </g>
      ))}
      {[[-1800, 400, 900, 30], [1700, -500, 800, -50], [200, -2200, 1000, 70]].map(([x, y, w, r], i) => (
        <g key={`l${i}`} transform={`translate(${x} ${y}) rotate(${r + Math.sin(t * 0.3 + i) * 1.5})`}>
          <path d={`M0 0C${w * 0.3} ${-w * 0.3} ${w * 0.75} ${-w * 0.28} ${w} 0C${w * 0.7} ${w * 0.25} ${w * 0.3} ${w * 0.28} 0 0Z`} fill={i % 2 ? '#8a6a2a' : '#6a7a2a'} stroke="#3a2a0a" strokeWidth={5} />
          <path d={`M0 0L${w} 0`} stroke="#c8a860" strokeWidth={6} />
        </g>
      ))}
      {trails.map((tr, i) => tr.k > 0.01 ? <path key={`t${i}`} d={smoothPath(tr.pts)} stroke={tr.col} strokeWidth={60} fill="none" strokeLinecap="round" opacity={0.28 * tr.k} strokeDasharray="10 30" /> : null)}
      {food && (
        <g>
          <ellipse cx={food.x + 40} cy={food.y + 40} rx={260} ry={200} fill="#2a1a0a" opacity={0.35} />
          <path d={smoothPath(Array.from({length: 10}, (_, i) => ({x: food.x + Math.cos((i / 10) * 6.28) * (220 + hash1(i) * 60), y: food.y + Math.sin((i / 10) * 6.28) * (170 + hash1(i * 2) * 50)})), true)} fill="#e8b860" stroke="#8a5a20" strokeWidth={6} />
          <ellipse cx={food.x - 50} cy={food.y - 50} rx={90} ry={40} fill="#fff4d0" opacity={0.45} />
        </g>
      )}
      {children}
    </g>
    <rect width={1080} height={1920} fill="#ffd890" opacity={0.08} />
  </g>
);
export const _k = {clamp};
