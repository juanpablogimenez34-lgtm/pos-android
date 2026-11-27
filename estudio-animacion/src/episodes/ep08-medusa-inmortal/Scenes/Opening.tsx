// ESCENA 1 (0–8 s) — IMPACTO INMEDIATO: oscuridad, la medusa luminosa sube desde la profundidad,
// la cámara se acerca rápido mientras nada, título "¿PUEDE REJUVENECER?" y la medusa empieza a
// transformarse (adelanto: recoge los tentáculos, la campana empieza a replegarse, aparecen células).
// ESCENA 2 (8–25 s) — PRESENTACIÓN: la cámara sigue a la medusa por un arrecife lleno de vida
// (peces, corales, rayos de sol, partículas); nombre científico con escala de tamaño; plano macro
// del estómago rojo visible a través de la campana.
import React from 'react';
import {clamp, easeInOut, lerp, smoothstep} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {alarmed, jellyPose, swim} from '../Animation/jellyMotion';
import {Cam, camAt, drift, layerT, toScreen} from '../Camera/cam';
import {ImmortalJellyfish} from '../Characters/ImmortalJellyfish';
import {reversalMorph} from '../Characters/LifeCycleTransformation';
import {OceanParticles} from '../Environments/OceanParticles';
import {Reef, WaterBack} from '../Environments/UnderwaterEnvironment';
import {CinematicLighting} from '../Lighting/CinematicLighting';
import {EV} from '../Timeline/timeline';

const win = (t: number, a: number, b: number, r = 0.5) => smoothstep(a, a + r, t) * (1 - smoothstep(b - r, b, t));

export type SceneOut = {svg: React.ReactNode; overlay: React.ReactNode};

// ---------------------------------------------------------------- escena 1
export function scene1(t: number): SceneOut {
  // sube desde abajo: nado tranquilo vertical
  const base = swim(t, {x0: 0, y0: 760, dir: 0.05, step: 52, current: 0.1, glow: 0.4 + 0.6 * smoothstep(0, 3, t)});
  const u = clamp((t - EV.tease) / 2.4) * 0.34; // primeras fases de la reversión
  const m = reversalMorph(u);
  const p = {...alarmed(base, 0), retract: m.retract, y: base.y + m.sink * 40, contract: base.contract * (1 - m.retract * 0.6)};
  const camK: Cam = camAt(
    [
      [0, 0, 120, 0.5],
      [1.2, 0, 140, 0.62],
      [4.2, p.x * 0.6, 520, 1.9],
      [8, p.x * 0.8, 470, 2.35],
    ],
    t,
  );
  const cam = drift({...camK, y: lerp(camK.y, p.y - 120, smoothstep(2.5, 4.5, t))}, t, 0.6);
  const s = toScreen(cam, p.x, p.y - 60);
  const dark = 1 - smoothstep(0.0, 1.0, t);
  return {
    svg: (
      <g>
        <WaterBack cam={cam} t={t} tone={1} rays={0} />
        <OceanParticles cam={cam} t={t} current={0.15} density={0.8} glow={1} tint="#bfe6ff" />
        <g transform={layerT(cam, 1)}>
          <ImmortalJellyfish uid="j1" p={p} morph={{evert: m.evert, blob: m.blob, tissue: m.tissue, cells: m.cells}} />
        </g>
      </g>
    ),
    overlay: (
      <>
        <CinematicLighting subject={{x: s.x, y: s.y, r: 520 * cam.zoom * 0.5, k: 0.9}} grade={0.7} violet={0.7} dark={dark} vignette={1} />
        <BigQuestion t={t} />
      </>
    ),
  };
}

/** Texto grande "¿PUEDE REJUVENECER?" que aparece letra a letra con brillo. */
const BigQuestion: React.FC<{t: number}> = ({t}) => {
  const k = win(t, EV.title, 7.85, 0.35);
  if (k <= 0) return null;
  const words = ['¿PUEDE', 'REJUVENECER?'];
  const lt = t - EV.title;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k}}>
      {words.map((w, i) => (
        <div key={i} style={{fontWeight: 900, fontSize: i ? 100 : 84, letterSpacing: lerp(10, 3, easeInOut(clamp(lt / 1.2))), color: '#e8fbff', textShadow: '0 0 24px rgba(127,233,255,0.9), 0 0 60px rgba(150,110,255,0.6)', transform: `translateY(${(1 - easeInOut(clamp((lt - i * 0.18) / 0.5))) * 40}px)`, opacity: clamp((lt - i * 0.18) / 0.4), lineHeight: 1.05}}>
          {w}
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- escena 2
export function scene2(t: number): SceneOut {
  const lt = t - 8;
  const p = swim(t, {x0: -260, y0: -60, dir: 1.05, step: 46, current: 0.35, glow: 0.65});
  const macro = smoothstep(21.0, 22.6, t);
  const cam0: Cam = camAt(
    [
      [8, p.x - 40, -120, 1.15],
      [12, p.x, -200, 1.5],
      [15.4, p.x + 20, -230, 1.65],
      [21, p.x, -230, 1.75],
    ],
    t,
  );
  const follow: Cam = {...cam0, x: lerp(cam0.x, p.x + 40, 0.85)};
  const macroCam: Cam = {x: p.x + Math.sin(p.rot) * 40, y: p.y - 80, zoom: 4.2, roll: p.rot * 0.25};
  const cam = drift({x: lerp(follow.x, macroCam.x, macro), y: lerp(follow.y, macroCam.y, macro), zoom: Math.exp(lerp(Math.log(follow.zoom), Math.log(macroCam.zoom), macro)), roll: lerp(0, macroCam.roll, macro)}, t, 1);
  const s = toScreen(cam, p.x, p.y - 60);
  const stomach = toScreen(cam, p.x + Math.sin(p.rot) * 30, p.y - 40 - Math.cos(p.rot) * 10);
  const bloom = 1 - smoothstep(8, 8.9, t);
  return {
    svg: (
      <g>
        <WaterBack cam={cam} t={t} tone={0.18 + 0.1 * macro} rays={1} floorY={900} />
        <Reef cam={cam} t={t} tone={0.18} floorY={900} reef={1} fish={1}>
          <OceanParticles cam={cam} t={t} current={0.35} density={0.7} />
        </Reef>
        <g transform={layerT(cam, 1)}>
          <ImmortalJellyfish uid="j2" p={p} />
          {/* escala de tamaño junto al nombre */}
          {t > EV.name && t < 21 && <ScaleBar x={p.x + 150} y={p.y - 40} k={win(t, EV.name + 0.2, 20.8, 0.4)} />}
        </g>
      </g>
    ),
    overlay: (
      <>
        <CinematicLighting subject={{x: s.x, y: s.y, r: 420, k: 0.55}} grade={0.5} violet={0.35} vignette={0.85} />
        {bloom > 0.01 && <div style={{position: 'absolute', inset: 0, background: '#bff6ff', opacity: bloom * 0.6, mixBlendMode: 'screen'}} />}
        <NameCard t={t} />
        {t > EV.stomach && t < 25 && <MacroLabel x={stomach.x} y={stomach.y} k={win(t, EV.stomach + 0.9, 24.9, 0.4)} />}
        {lt < 0 && null}
      </>
    ),
  };
}

const ScaleBar: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) => (
  <g transform={`translate(${x} ${y})`} opacity={k}>
    <path d="M0,-115 L0,115 M-14,-115 L14,-115 M-14,115 L14,115" stroke="#e8fbff" strokeWidth={3} />
    <text x={22} y={10} fontFamily="Montserrat" fontWeight={800} fontSize={30} fill="#e8fbff">
      ≈ 5 mm
    </text>
  </g>
);

const NameCard: React.FC<{t: number}> = ({t}) => {
  const k = win(t, EV.name, 21.0, 0.5);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 200, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${(1 - k) * 20}px)`}}>
      <div style={{fontSize: 30, fontWeight: 700, color: '#bff6ff', letterSpacing: 6}}>MEDUSA HIDROZOO</div>
      <div style={{fontSize: 82, fontWeight: 800, fontStyle: 'italic', color: '#ffffff', textShadow: '0 0 30px rgba(127,233,255,0.7)'}}>Turritopsis dohrnii</div>
      <div style={{marginTop: 8, fontSize: 28, fontWeight: 600, color: '#e8fbff', opacity: 0.9}}>campana de unos 4–5 mm · aguas templadas y tropicales</div>
    </div>
  );
};

const MacroLabel: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}} opacity={k}>
    <path d={`M${x},${y} L${x - 120},${y - 300} L${x - 160},${y - 300}`} stroke="#ffd2c8" strokeWidth={3} fill="none" />
    <circle cx={x} cy={y} r={9} fill="#ffd2c8" />
    <text x={540} y={y - 360} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={44} fill="#ffffff">
      Manubrio (estómago)
    </text>
    <text x={540} y={y - 316} textAnchor="middle" fontFamily="Montserrat" fontWeight={600} fontSize={30} fill="#ffd2c8">
      visible a través de la campana transparente
    </text>
  </svg>
);

export const placeholderPose = jellyPose;
