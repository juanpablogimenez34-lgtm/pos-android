// ESCENA 03 — EL PEZ PESCADOR ABISAL (80–155 s), hembra de Linophryne arborifera.
//  80–90   solo una luz que se balancea; un pez linterna se acerca («parece una presa fácil… pero es una trampa»).
//  90–98   revelación del pez pescador (luz de relleno suave) + rótulo de especie.
//  98–104  macro del señuelo (esca) con bacterias simbiontes luminosas.
//  104–108 caza: la presa toca la luz, la boca se abre y la succiona (sin contenido gráfico).
//  108–124 dientes curvados hacia adentro, boca enorme; estómago que se distiende.
//  124–139 reproducción: un macho diminuto se adhiere a la hembra y queda fusionado.
//  139–155 escala: cabe en la palma de una mano; se aleja hacia la oscuridad.
import {anglerPose, Anglerfish, AnglerGlow} from '../animals/Anglerfish';
import {AttachedMale, Lanternfish, MaleAngler} from '../animals/SmallFish';
import {breathe, cam, Cam, jolt, shot, toScreen} from '../camera/camera';
import {Label, SpeciesCard, Title, win} from '../components/UI';
import {Glow} from '../effects/Effects';
import {Ocean} from '../environment/Ocean';
import {clamp, hash1, lerp} from '../utils/math';
import {along} from '../utils/motion';
import {f1} from '../utils/spline';
import {cuts, SceneFn} from './common';

const VP = {w: 1920, h: 1080};
const S = 1.6;
const STRIKE = 106.6;
const DEPTH = 1500;

function fish(t: number, extra: Partial<Parameters<typeof anglerPose>[0]> = {}) {
  const drift = {x: Math.sin(t * 0.21) * 30 - (t > 145 ? (t - 145) * 60 : 0), y: Math.sin(t * 0.33) * 18 + (t > 145 ? (t - 145) * 18 : 0)};
  const jawK = t >= STRIKE && t < STRIKE + 0.7 ? Math.sin(clamp((t - STRIKE) / 0.7) * Math.PI) : 0;
  const display = win(t, 109.2, 114.2, 0.8) * 0.55;
  const gulp = clamp((t - STRIKE - 0.6) / 1.2) * (t < 125 ? 1 : 1 - clamp((t - 125) / 4) * 0.6) + win(t, 116, 123.5, 1) * 0.5;
  return anglerPose({t, x: drift.x, y: drift.y, scale: S, facing: 1, pitch: Math.sin(t * 0.25) * 0.05, yaw: 0, jaw: Math.max(0.08, jawK, display), lureSway: 1, lureJig: t > 101 && t < STRIKE ? 0.9 : 0.3, glow: 1, finRate: 1.4, gulp: clamp(gulp), ...extra});
}
/** Iluminación de relleno (revela al pez sin destruir la oscuridad). */
const fill = (t: number) => clamp((t - 90.2) / 2.5) * (1 - clamp((t - 146) / 6));

/** Presa: pez linterna que se acerca a la luz y es succionado en el ataque. */
function prey(t: number, esca: {x: number; y: number}, mouth: {x: number; y: number}) {
  const m = along([[84, 900, -260], [92, 560, -120], [100, esca.x + 220, esca.y - 30], [STRIKE - 0.2, esca.x + 30, esca.y + 6]], t);
  if (t < STRIKE) return {x: m.x, y: m.y, a: Math.atan2(m.vy, m.vx), vis: 1};
  const u = clamp((t - STRIKE) / 0.18);
  return {x: lerp(m.x, mouth.x, u), y: lerp(m.y, mouth.y, u), a: Math.PI, vis: 1 - clamp((t - STRIKE - 0.12) / 0.08)};
}

const Hand: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.85}>
    <path d="M-120,200 L-130,40 Q-140,-20 -110,-30 Q-90,-30 -88,10 L-80,-150 Q-78,-190 -52,-190 Q-28,-188 -30,-150 L-26,-40 L-12,-190 Q-8,-228 18,-226 Q42,-222 40,-186 L30,-40 L52,-170 Q58,-204 84,-200 Q108,-194 102,-160 L80,-30 L110,-120 Q122,-150 146,-142 Q166,-132 158,-104 L120,60 Q100,160 60,200Z" fill="#e8c8a8" stroke="#a88868" strokeWidth={4} />
  </g>
);

const shotDark: SceneFn = (t) => {
  const p = fish(t);
  const e = p.escaWorld;
  const c = breathe(shot(t, 80, 90, cam(e.x + 40, e.y, 2.4), cam(e.x + 200, e.y, 1.25), 'inOut'), t, 0.4);
  const pr = prey(t, e, p.mouthWorld);
  return {
    depth: DEPTH,
    svg: (
      <Ocean cam={c} t={t} depth={DEPTH} snow={0.7} specks={0.5}>
        <g opacity={0.12}>
          <Anglerfish id="s3a" pose={p} light={0.1} />
        </g>
        <Lanternfish x={pr.x} y={pr.y} scale={1.3} angle={pr.a} t={t} />
        <AnglerGlow id="s3a" pose={p} zoom={c.zoom} />
      </Ocean>
    ),
    grade: {vignette: 0.95},
  };
};

const main = (from: Cam, to: Cam, a: number, b: number, opts: {labels?: boolean; card?: boolean} = {}): SceneFn => (t) => {
  const p = fish(t);
  const e = p.escaWorld;
  let c = breathe(shot(t, a, b, from, to, 'cine'), t, 0.4);
  c = jolt(c, t, STRIKE, 1.2, 0.5);
  const pr = prey(t, e, p.mouthWorld);
  const F = fill(t);
  const sc = (q: {x: number; y: number}) => toScreen(c, VP, q.x, q.y);
  const mouthS = sc(p.toWorld({x: 110, y: -6}));
  const toothS = sc(p.toWorld({x: 90, y: 6}));
  const bellyS = sc(p.toWorld({x: -10, y: 60}));
  return {
    depth: DEPTH,
    svg: (
      <Ocean cam={c} t={t} depth={DEPTH} snow={0.7} specks={0.4} spot={{x: 0, y: 0, r: 520, k: F}}>
        <Glow id="s3fill" x={p.p.x + 60} y={p.p.y - 140} r={480} color="#3a7ab8" k={F * 0.45} />
        <Anglerfish id="s3b" pose={p} light={0.25 + F * 0.85} />
        {pr.vis > 0.01 && t < STRIKE + 0.3 && <g opacity={pr.vis}><Lanternfish x={pr.x} y={pr.y} scale={1.3} angle={pr.a} t={t} /></g>}
        <AnglerGlow id="s3b" pose={p} zoom={c.zoom} />
      </Ocean>
    ),
    overlay: (
      <>
        {opts.card && <SpeciesCard k={win(t, 91, 97.5, 0.6)} name="Pez pescador abisal" sci="Linophryne arborifera" info="Hembra · zona de medianoche" />}
        {opts.labels && (
          <>
            <Label x={mouthS.x} y={mouthS.y} tx={mouthS.x + 160} ty={mouthS.y - 170} text="Boca enorme" k={win(t, 108.6, 114.4, 0.4)} />
            <Label x={toothS.x} y={toothS.y} tx={toothS.x + 210} ty={toothS.y + 150} text="Dientes curvados hacia adentro" k={win(t, 110.3, 114.6, 0.4)} color="#ffd76a" />
            <Label x={bellyS.x} y={bellyS.y} tx={bellyS.x - 260} ty={bellyS.y + 160} text="Estómago expandible" k={win(t, 116.4, 123.8, 0.4)} />
          </>
        )}
      </>
    ),
    grade: {vignette: 0.85},
  };
};

const macro: SceneFn = (t) => {
  const p = fish(t);
  const e = p.escaWorld;
  const c = breathe(shot(t, 97.4, 103.8, cam(e.x, e.y, 4.2), cam(e.x + 4, e.y + 2, 6.2), 'inOut'), t, 0.15);
  const es = toScreen(c, VP, e.x, e.y);
  return {
    depth: DEPTH,
    svg: (
      <Ocean cam={c} t={t} depth={DEPTH} snow={0.4}>
        <Anglerfish id="s3m" pose={p} light={0.6} />
        <AnglerGlow id="s3m" pose={p} zoom={c.zoom} />
        {/* bacterias simbiontes (visualización): puntos que titilan dentro de la esca */}
        <g style={{mixBlendMode: 'screen'}}>
          {Array.from({length: 40}, (_, i) => {
            const a = hash1(i * 3) * Math.PI * 2;
            const r = Math.sqrt(hash1(i * 7)) * 9 * S * 0.6;
            return <ellipse key={i} cx={f1(e.x + Math.cos(a + t * 0.3) * r)} cy={f1(e.y + Math.sin(a + t * 0.3) * r)} rx={0.9} ry={0.5} fill="#eaffff" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 3 + i))} />;
          })}
        </g>
      </Ocean>
    ),
    overlay: <Label x={es.x} y={es.y} tx={es.x + 300} ty={es.y - 230} text="Bacterias bioluminiscentes (simbiontes)" k={win(t, 98.4, 103.6, 0.5)} />,
    grade: {vignette: 0.85},
  };
};

const male: SceneFn = (t) => {
  const p = fish(t);
  const fuse = clamp((t - 133.2) / 5);
  const attach = t >= 133.2;
  const belly = p.toWorld({x: 10, y: 98});
  const m = along([[126, belly.x + 700, belly.y + 260], [130.5, belly.x + 220, belly.y + 90], [133.2, belly.x + 30, belly.y + 26]], t);
  const c = breathe(shot(t, 124.3, 133, cam(p.p.x + 180, p.p.y + 90, 1.1), cam(p.p.x + 40, p.p.y + 110, 2.0), 'cine'), t, 0.3);
  const ms = toScreen(c, VP, belly.x, belly.y);
  const sx = S * p.p.facing;
  return {
    depth: DEPTH,
    svg: (
      <Ocean cam={c} t={t} depth={DEPTH} snow={0.7} specks={0.4} spot={{x: 0, y: 40, r: 520, k: fill(t)}}>
        <Glow id="s3mf" x={p.p.x} y={p.p.y - 100} r={480} color="#3a7ab8" k={0.4} />
        <Anglerfish id="s3c" pose={p} light={1} />
        {attach ? (
          <g transform={`translate(${f1(p.p.x)} ${f1(p.p.y)}) rotate(${f1((p.p.pitch * 180) / Math.PI)}) scale(${f1(sx)} ${f1(S)})`}>
            <AttachedMale t={t} fuse={fuse} />
          </g>
        ) : (
          <MaleAngler x={m.x} y={m.y} scale={1.6} angle={Math.atan2(m.vy, m.vx)} t={t} />
        )}
        <AnglerGlow id="s3c" pose={p} zoom={c.zoom} />
      </Ocean>
    ),
    overlay: (
      <>
        <Label x={ms.x} y={ms.y} tx={ms.x + 260} ty={ms.y + 120} text={attach ? 'Macho fusionado a la hembra' : 'Macho diminuto'} k={win(t, 127.6, 139, 0.5)} />
        <Title k={win(t, 134.5, 139.0, 0.5)} lines={['COMPARTEN LA CIRCULACIÓN SANGUÍNEA']} size={40} top={110} color="#ffd76a" />
      </>
    ),
    grade: {vignette: 0.85},
  };
};

const scale: SceneFn = (t) => {
  const p = fish(t, {x: 40, y: -60, scale: 0.9});
  const c = breathe(shot(t, 139.4, 155, cam(0, 40, 1.0), cam(-120, 20, 0.85), 'inOut'), t, 0.3);
  const k = win(t, 139.8, 147.5, 0.8);
  return {
    depth: DEPTH,
    svg: (
      <Ocean cam={c} t={t} depth={DEPTH} snow={0.7} specks={0.4}>
        <g opacity={k}><Hand x={20} y={120} s={1.5} /></g>
        <Glow id="s3sc" x={40} y={-60} r={300} color="#3a7ab8" k={0.5 * (1 - clamp((t - 147) / 6))} />
        <g opacity={1 - clamp((t - 148) / 5)}>
          <Anglerfish id="s3d" pose={p} light={0.9} />
        </g>
        <AnglerGlow id="s3d" pose={p} zoom={c.zoom} />
      </Ocean>
    ),
    overlay: <Title k={k} lines={['MUCHAS ESPECIES MIDEN', 'APENAS UNOS CENTÍMETROS']} size={50} top={110} />,
    grade: {vignette: 0.9},
  };
};

export const scene03: SceneFn = cuts([
  [80, shotDark],
  [90.2, main(cam(260, -40, 1.25), cam(80, 0, 1.0), 90.2, 97.6, {card: true})],
  [97.6, macro],
  [103.8, main(cam(170, -60, 1.35), cam(160, -40, 1.5), 103.8, 108, {})],
  [108.2, main(cam(120, 0, 1.9), cam(60, 20, 1.55), 108.2, 124.2, {labels: true})],
  [124.2, male],
  [139.4, scale],
], 0.6);
