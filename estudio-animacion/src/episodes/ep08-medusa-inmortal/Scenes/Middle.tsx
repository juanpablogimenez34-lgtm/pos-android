// ESCENAS 3–5 (25–96 s): el secreto · la transformación · un nuevo comienzo.
// Tiempos alineados con la locución medida (Script/narration-timing.json).
import React from 'react';
import {clamp, easeInOut, hash1, lerp, smoothstep} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {jellyPose, swim} from '../Animation/jellyMotion';
import {Cam, camAt, drift, layerT, toScreen} from '../Camera/cam';
import {ImmortalJellyfish} from '../Characters/ImmortalJellyfish';
import {Cyst, LifeCycleWheel, Polyp, reversalMorph, Stolon} from '../Characters/LifeCycleTransformation';
import {OceanParticles} from '../Environments/OceanParticles';
import {Reef, water, WaterBack} from '../Environments/UnderwaterEnvironment';
import {CinematicLighting} from '../Lighting/CinematicLighting';
import {SceneOut} from './Opening';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
export const win = (t: number, a: number, b: number, r = 0.5) => smoothstep(a, a + r, t) * (1 - smoothstep(b - r, b, t));
const seg = (t: number, a: number, b: number) => easeInOut(clamp((t - a) / (b - a)));

/** Plancton: copépodos diminutos que derivan; los que pasan por la zona de los tentáculos son capturados. */
export const Plankton: React.FC<{t: number; n: number; cx: number; cy: number; spread: number; catchX?: number; catchY?: number; seed?: number}> = ({t, n, cx, cy, spread, catchX, catchY, seed = 0}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const per = 7 + hash1(i * 3 + seed) * 5;
      const ph = ((t / per + hash1(i * 7 + seed)) % 1 + 1) % 1;
      let x = cx + (hash1(i * 11 + seed) - 0.5) * spread + Math.sin(t * 0.8 + i) * 30;
      let y = cy + (ph - 0.5) * spread * 1.4;
      let op = Math.sin(ph * Math.PI);
      if (catchX !== undefined && catchY !== undefined && i % 3 === 0) {
        // atraído hacia los tentáculos y absorbido (sin violencia: se desvanece con un destello)
        const k = smoothstep(0.55, 0.85, ph);
        x = lerp(x, catchX + (hash1(i) - 0.5) * 80, k);
        y = lerp(y, catchY + hash1(i * 2) * 60, k);
        op *= 1 - smoothstep(0.82, 0.92, ph);
      }
      return (
        <g key={i} transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(t * 40 + i * 30)})`} opacity={op}>
          <ellipse rx={6} ry={3} fill="#ffe7b0" opacity={0.85} />
          <path d="M-6,0 l-6,-4 M-6,0 l-6,4" stroke="#ffe7b0" strokeWidth={1} opacity={0.7} />
        </g>
      );
    })}
  </g>
);

const Chip: React.FC<{text: string; icon: string; k: number; y: number}> = ({text, icon, k, y}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateX(${(1 - k) * -40}px)`}}>
    <span style={{display: 'inline-block', background: 'rgba(6,16,40,0.72)', border: '2px solid rgba(143,233,255,0.6)', borderRadius: 40, padding: '14px 30px', color: '#e8fbff', fontSize: 40, fontWeight: 800}}>
      <span style={{display: 'inline-block', width: 22, height: 22, borderRadius: 11, background: icon, marginRight: 16, verticalAlign: 'middle'}} />
      {text}
    </span>
  </div>
);

// ---------------------------------------------------------------- escena 3
export function scene3(t: number): SceneOut {
  const p = swim(t, {x0: 0, y0: 200, dir: 0.18, step: 40, current: 0.2, glow: 0.7, t0: 25.4});
  const wheel = smoothstep(32.6, 33.4, t);
  const cam: Cam = drift({x: p.x + 20, y: lerp(p.y - 60, p.y - 330, wheel), zoom: lerp(2.0, 1.25, seg(t, 32, 34)), roll: 0}, t, 1);
  const s = toScreen(cam, p.x, p.y - 60);
  const catchP = {x: p.x + Math.sin(p.rot) * 120, y: p.y + 160};
  return {
    svg: (
      <g>
        <WaterBack cam={cam} t={t} tone={0.3} rays={0.8} floorY={1400} />
        <Reef cam={cam} t={t} tone={0.32} floorY={1400} reef={0.8} fish={0.6}>
          <OceanParticles cam={cam} t={t} current={0.25} density={0.7} />
        </Reef>
        <g transform={layerT(cam, 1)}>
          <Plankton t={t} n={26} cx={p.x} cy={p.y + 100} spread={700} catchX={catchP.x} catchY={catchP.y} seed={3} />
          <ImmortalJellyfish uid="j3" p={p} />
        </g>
      </g>
    ),
    overlay: (
      <>
        <CinematicLighting subject={{x: s.x, y: s.y, r: 460, k: 0.55}} grade={0.55} violet={0.4} vignette={0.85} />
        {wheel > 0.01 && (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            <LifeCycleWheel cx={540} cy={470} r={230} u={seg(t, 33.4, 38.4)} reverse={seg(t, 40.0, 42.5)} appear={win(t, 32.6, 44.9, 0.6)} labels={['larva', 'pólipo', 'medusa']} />
          </svg>
        )}
        {t > 40 && t < 45 && (
          <div style={{position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: win(t, 40.4, 44.9, 0.4)}}>
            <span style={{color: '#ff9ad5', fontSize: 40, fontWeight: 800, textShadow: '0 0 18px rgba(255,120,200,0.6)'}}>medusa → fase de pólipo</span>
          </div>
        )}
      </>
    ),
  };
}

// ---------------------------------------------------------------- escena 4
const ROCK_Y = 420;
export function jellyReversalAt(t: number) {
  const u = seg(t, 51.4, 64.5);
  const m = reversalMorph(u);
  const pre = swim(t, {x0: 40, y0: -40, dir: 0.0, step: 14, period: 2.4, current: 0.1, glow: 0.5, t0: 45.2});
  const startY = pre.y;
  const landY = ROCK_Y - 2; // la masa descansa sobre la roca
  const y = lerp(startY, landY, m.sink);
  return {p: {...pre, y, x: lerp(pre.x, 40, m.sink), rot: pre.rot * (1 - m.sink), retract: m.retract, contract: pre.contract * (1 - m.sink), glow: 0.5 + 0.3 * m.cells}, m, u};
}

const Seabed: React.FC<{t: number; tone: number}> = ({tone}) => {
  const w = water(tone);
  return (
    <g>
      <path d={`M-900,${ROCK_Y + 4} Q-500,${ROCK_Y - 40} -100,${ROCK_Y - 6} Q300,${ROCK_Y + 20} 800,${ROCK_Y - 10} L1400,${ROCK_Y + 10} L1400,1400 L-1400,1400 L-1400,${ROCK_Y + 20}Z`} fill={`url(#e8rock)`} />
      <defs>
        <linearGradient id="e8rock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={lerpCol('#6a7a88', w.fog, 0.3)} />
          <stop offset="1" stopColor={lerpCol('#2a3040', w.fog, 0.5)} />
        </linearGradient>
      </defs>
      {Array.from({length: 26}, (_, i) => (
        <ellipse key={i} cx={-1100 + i * 90 + hash1(i) * 40} cy={ROCK_Y + 30 + hash1(i * 3) * 60} rx={20 + hash1(i * 5) * 30} ry={6 + hash1(i * 7) * 6} fill="#ffffff" opacity={0.05 + 0.05 * hash1(i)} />
      ))}
    </g>
  );
};
const lerpCol = (a: string, b: string, k: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const c = [16, 8, 0].map((sh) => Math.round(lerp((pa >> sh) & 255, (pb >> sh) & 255, k)));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

/** Diagrama de transdiferenciación: una célula especializada cambia a otro tipo celular. */
const TransDiagram: React.FC<{t: number; k: number}> = ({t, k}) => {
  const u = (Math.sin(t * 1.4) + 1) / 2;
  const cell = (x: number, kind: number, label: string) => {
    const rx = lerp(40, 22, kind);
    const ry = lerp(40, 58, kind);
    return (
      <g transform={`translate(${x} 0)`}>
        <ellipse rx={rx} ry={ry} fill={kind > 0.5 ? '#ff9a7a' : '#8fe9ff'} opacity={0.85} stroke="#ffffff" strokeWidth={3} />
        <circle r={12} fill="#2a1a4a" opacity={0.7} />
        <text y={ry + 46} textAnchor="middle" fontFamily="Montserrat" fontWeight={700} fontSize={26} fill="#e8fbff">
          {label}
        </text>
      </g>
    );
  };
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}} opacity={k}>
      <g transform="translate(540 430)">
        <rect x={-460} y={-170} width={920} height={330} rx={30} fill="rgba(6,16,40,0.72)" stroke="rgba(143,233,255,0.5)" strokeWidth={2} />
        <text y={-110} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={50} fill="#ffffff">
          Transdiferenciación
        </text>
        {cell(-280, 1, 'célula especializada')}
        <path d="M-160,0 L-60,0" stroke="#ffd27a" strokeWidth={6} markerEnd="url(#e8ar2)" />
        {cell(0, lerp(1, 0, u), 'cambia')}
        <path d="M60,0 L160,0" stroke="#ffd27a" strokeWidth={6} markerEnd="url(#e8ar2)" />
        {cell(280, 0, 'otro tipo celular')}
        <defs>
          <marker id="e8ar2" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10Z" fill="#ffd27a" />
          </marker>
        </defs>
      </g>
    </svg>
  );
};

export function scene4(t: number): SceneOut {
  const {p, m, u} = jellyReversalAt(t);
  const tone = lerp(0.4, 0.55, seg(t, 45, 50));
  const cam0 = camAt(
    [
      [45, 40, -160, 1.7],
      [51.4, 40, -120, 1.9],
      [58, 40, 160, 2.3],
      [64, 40, ROCK_Y - 70, 3.2],
      [71, 40, ROCK_Y - 70, 3.6],
    ],
    t,
  );
  const cam = drift({...cam0, x: lerp(cam0.x, p.x, 0.5), y: lerp(p.y - 90, ROCK_Y - 70, seg(t, 62, 64.5))}, t, 0.7);
  const s = toScreen(cam, p.x, p.y - 50);
  return {
    svg: (
      <g>
        <WaterBack cam={cam} t={t} tone={tone} rays={0.4} floorY={1200} />
        <OceanParticles cam={cam} t={t} current={0.12} density={0.6} />
        <g transform={layerT(cam, 1)}>
          <Seabed t={t} tone={tone} />
          <Plankton t={t} n={Math.round(lerp(10, 2, seg(t, 45, 49)))} cx={p.x} cy={p.y} spread={700} seed={9} />
          <ImmortalJellyfish uid="j4" p={jellyPose({...p})} morph={{evert: m.evert, blob: m.blob, tissue: m.tissue, cells: m.cells}} period={2.4} />
        </g>
      </g>
    ),
    overlay: (
      <>
        <CinematicLighting subject={{x: s.x, y: s.y, r: 420, k: 0.6, color: u > 0.5 ? 'rgba(255,190,150,0.3)' : undefined}} grade={0.6} violet={0.6} vignette={0.95} />
        <Chip icon="#ffd27a" text="hambre" k={win(t, 46.2, 51.3, 0.4)} y={300} />
        <Chip icon="#ff7a8a" text="daño físico" k={win(t, 47.9, 51.3, 0.4)} y={400} />
        <Chip icon="#8fe9ff" text="cambio brusco de temperatura" k={win(t, 49.4, 51.3, 0.4)} y={500} />
        {t > 52 && t < 66 && <StageLabel t={t} u={u} />}
        <TransDiagram t={t} k={win(t, 66.6, 70.9, 0.5)} />
      </>
    ),
  };
}

const StageLabel: React.FC<{t: number; u: number}> = ({t, u}) => {
  const label = u < 0.3 ? 'reabsorbe los tentáculos' : u < 0.55 ? 'la campana se repliega' : u < 0.8 ? 'se forma una masa de tejido' : 'las células se reorganizan';
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: win(t, 52, 66, 0.5)}}>
      <span style={{background: 'rgba(6,16,40,0.66)', borderRadius: 16, padding: '10px 24px', color: '#ffd2b0', fontSize: 38, fontWeight: 800}}>{label}</span>
    </div>
  );
};

// ---------------------------------------------------------------- escena 5
const POLYPS = [
  {x: 170, h: 150, t0: 77.4},
  {x: 330, h: 190, t0: 78.4},
  {x: 480, h: 160, t0: 79.4},
];
export function scene5(t: number): SceneOut {
  const attach = seg(t, 71, 73);
  const stolon = seg(t, 72.4, 77.2);
  const buds = seg(t, 83, 86);
  const release = seg(t, 86, 89.4);
  const young = [0, 1, 2].map((i) => {
    const t0 = 87.2 + i * 0.6;
    if (t < t0) return null;
    const base = POLYPS[i];
    const g = seg(t, 89.6, 96);
    const sw = swim(t, {x0: base.x + (i - 1) * 40, y0: ROCK_Y - base.h - 120, dir: -0.3 + i * 0.3, step: 22 + 10 * g, period: 1.2, t0, current: 0.1, glow: 0.7});
    return {...sw, young: 1 - 0.5 * g, opacity: 1};
  });
  const loop = smoothstep(89.6, 90.4, t);
  const cam0 = camAt(
    [
      [71, 40, ROCK_Y - 60, 3.4],
      [74, 160, ROCK_Y - 60, 2.6],
      [77.4, 300, ROCK_Y - 120, 2.0],
      [83, 320, ROCK_Y - 170, 2.1],
      [89, 330, ROCK_Y - 330, 1.6],
      [96, 360, ROCK_Y - 560, 1.4],
    ],
    t,
  );
  const cam = drift(cam0, t, 0.7);
  return {
    svg: (
      <g>
        <WaterBack cam={cam} t={t} tone={0.4} rays={0.6} floorY={1200} />
        <OceanParticles cam={cam} t={t} current={0.15} density={0.6} />
        <g transform={layerT(cam, 1)}>
          <Seabed t={t} tone={0.4} />
          <Stolon x0={60} y={ROCK_Y - 6} len={520} k={stolon} t={t} />
          <Cyst x={40} y={ROCK_Y} r={46} attach={attach} t={t} />
          <Plankton t={t} n={18} cx={330} cy={ROCK_Y - 260} spread={600} catchX={330} catchY={ROCK_Y - 200} seed={5} />
          {POLYPS.map((pp, i) => (
            <Polyp key={i} x={pp.x} y={ROCK_Y - 8} h={pp.h} grow={seg(t, pp.t0, pp.t0 + 3.2)} t={t} seed={i * 2} feed={0.5 + 0.5 * Math.sin(t * 1.5 + i)} buds={buds} budRelease={release} />
          ))}
          {young.map((y, i) => (y ? <ImmortalJellyfish key={i} uid={`y${i}`} p={y} period={1.2} /> : null))}
        </g>
      </g>
    ),
    overlay: (
      <>
        <CinematicLighting grade={0.55} violet={0.45} vignette={0.9} />
        {t < 89 && (
          <div style={{position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: win(t, 71.3, 88.8, 0.5)}}>
            <span style={{background: 'rgba(6,16,40,0.66)', borderRadius: 16, padding: '10px 24px', color: '#e8fbff', fontSize: 38, fontWeight: 800}}>
              {t < 77.4 ? 'se adhiere y forma un estolón' : t < 83 ? 'brotan nuevos pólipos' : 'los pólipos liberan medusas jóvenes'}
            </span>
          </div>
        )}
        {loop > 0.01 && (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            <LifeCycleWheel cx={540} cy={520} r={230} u={((t - 89.6) / 3.2) % 1} reverse={0} appear={win(t, 89.6, 95.9, 0.6)} labels={['medusa', 'masa de tejido', 'pólipo', 'medusa joven']} />
          </svg>
        )}
      </>
    ),
  };
}
