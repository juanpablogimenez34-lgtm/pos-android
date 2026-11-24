// ESCENA 07 — EL CALAMAR COLOSAL (415–500 s), Mesonychoteuthis hamiltoni, aguas profundas antárticas.
//  415–425 bajo los témpanos del océano Austral; la cámara desciende hacia la oscuridad fría.
//  425–441 revelación del calamar colosal (robusto) + rótulo; ≈ 500 kg (ejemplar de 2007).
//  441–448 manto ancho y ojo enorme con fotóforos.
//  448–454 ganchos giratorios en brazos y tentáculos (macro).
//  454–462 presas probables (merluza negra) y depredador (cachalote).
//  462–471 comparación visual con el calamar gigante (largo y esbelto vs. corto y pesado).
//  471–488 un misterio: hipótesis de cazador al acecho; primer registro de un juvenil vivo (2025, ilustración).
//  488–500 se pierde en la oscuridad.
import {ColossalSquid, ColossalPose} from '../animals/ColossalSquid';
import {GiantSquid} from '../animals/GiantSquid';
import {SpermWhale} from '../animals/SpermWhale';
import {breathe, cam, Cam, shot, toScreen} from '../camera/camera';
import {Label, Notice, SpeciesCard, Title, win} from '../components/UI';
import {Glow} from '../effects/Effects';
import {Ocean} from '../environment/Ocean';
import {FONT} from '../utils/fonts';
import {clamp, lerp} from '../utils/math';
import {closedSpline, f1} from '../utils/spline';
import {cuts, SceneFn} from './common';

const VP = {w: 1920, h: 1080};
const ICE = '#7ad8e8';
const DEPTH = 1600;

function pose(t: number, extra: Partial<ColossalPose> = {}): ColossalPose {
  return {t, pulse: 0.5 + 0.5 * Math.sin(t * 0.7), spread: 0.35 + 0.1 * Math.sin(t * 0.3), drift: 0.6, hooks: 0.4, rim: 0.45, tone: 0.1, look: {x: 400, y: Math.sin(t * 0.4) * 80}, ...extra};
}

/** Merluza negra (Dissostichus): pez grande, oscuro, de cabeza ancha. */
const Toothfish: React.FC<{x: number; y: number; s: number; t: number; dir?: 1 | -1}> = ({x, y, s, t, dir = 1}) => {
  const w = Math.sin(t * 3) * 0.12;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s * dir)} ${f1(s)})`}>
      <path d={`M-150,0 L-196,${f1(-34 + w * 40)} L-188,0 L-196,${f1(34 + w * 40)}Z`} fill="#3a4450" />
      <path d={closedSpline([{x: 60, y: -6}, {x: 30, y: -34}, {x: -40, y: -40}, {x: -120, y: -20}, {x: -158, y: 0}, {x: -120, y: 18}, {x: -40, y: 36}, {x: 30, y: 30}, {x: 62, y: 10}], 0.9)} fill="#4a5662" stroke="#1a2026" strokeWidth={2} />
      <path d="M-20,-38 q-40,-26 -90,-14 l10,14z M-60,34 q-30,20 -70,10 l10,-12z" fill="#3a4450" />
      <circle cx={34} cy={-10} r={6} fill="#0a0c10" stroke="#c8d0d8" strokeWidth={1.2} />
      <path d="M60,4 q-14,6 -30,4" stroke="#1a2026" strokeWidth={2} fill="none" />
    </g>
  );
};

const under: SceneFn = (t) => {
  const u = clamp((t - 415) / 10);
  const depth = lerp(20, DEPTH, u * u);
  const c = breathe(cam(0, lerp(-300, 600, u), 0.7), t, 0.5);
  return {
    depth,
    svg: (
      <Ocean cam={c} t={t} depth={depth} surfaceY={-700} ice snow={1.1} tint={ICE} tintK={0.35} />
    ),
    overlay: <Title k={win(t, 416.4, 424.6, 0.6)} lines={['OCÉANO AUSTRAL · ANTÁRTIDA']} size={56} top={150} color="#dff6ff" />,
    grade: {vignette: 0.7, tint: '#2a6a7a', tintK: 0.25},
  };
};

const main = (a: number, b: number, from: Cam, to: Cam, mode: 'reveal' | 'eye' | 'hooks' | 'prey' | 'mystery'): SceneFn => (t) => {
  const reveal = clamp((t - 425.6) / 3);
  const extra: Partial<ColossalPose> = mode === 'hooks' ? {hooks: 0.5 + 0.5 * Math.sin(t * 1.6), spread: 0.55} : mode === 'mystery' ? {spread: 0.75, drift: 0.25, pulse: 0.3} : {};
  const p = pose(t, extra);
  const c = breathe(shot(t, a, b, from, to, 'cine'), t, mode === 'hooks' ? 0.15 : 0.4);
  const sc = (x: number, y: number) => toScreen(c, VP, x, y);
  const mantle = sc(-260, -60);
  const eye = sc(-30, -20);
  const hook = sc(180, 40);
  const fishX = lerp(1250, 780, clamp((t - 454.6) / 7));
  return {
    depth: DEPTH,
    svg: (
      <Ocean cam={c} t={t} depth={DEPTH} snow={1} specks={0.5} tint={ICE} tintK={0.3}>
        <Glow id={`cs${mode}`} x={-100} y={-250} r={900} color="#3a8ab8" k={0.4 * (mode === 'reveal' ? reveal : 1)} />
        {mode === 'prey' && <Toothfish x={fishX} y={60} s={1.6} t={t} dir={-1} />}
        {mode === 'prey' && <g opacity={0.5}><SpermWhale uid="csW" pose={{t, phase: t * 1.1, amp: 0.7, tone: 0.95}} x={lerp(-2600, 600, clamp((t - 457.6) / 5))} y={-760} scale={0.9} /></g>}
        <g opacity={mode === 'reveal' ? 0.15 + 0.85 * reveal : 1}>
          <ColossalSquid uid={`cs${mode}`} pose={{...p, tone: mode === 'reveal' ? 0.7 - reveal * 0.6 : p.tone}} x={0} y={0} scale={1} />
        </g>
      </Ocean>
    ),
    overlay: (
      <>
        {mode === 'reveal' && (
          <>
            <SpeciesCard k={win(t, 426.2, 432, 0.6)} name="Calamar colosal" sci="Mesonychoteuthis hamiltoni" info="Aguas profundas antárticas" />
            <Title k={win(t, 431.2, 440.6, 0.5)} lines={['≈ 500 kg']} size={84} top={100} color="#ffd76a" />
            <Title k={win(t, 432.4, 440.6, 0.5)} lines={['EL INVERTEBRADO MÁS PESADO CONOCIDO']} size={34} top={200} />
          </>
        )}
        {mode === 'eye' && (
          <>
            <Label x={mantle.x} y={mantle.y} tx={mantle.x - 120} ty={mantle.y - 250} text="Manto ancho y voluminoso" k={win(t, 441.4, 447.4, 0.4)} />
            <Label x={eye.x} y={eye.y + 30} tx={eye.x + 260} ty={eye.y + 260} text="Ojo enorme, con fotóforos" k={win(t, 443, 447.6, 0.4)} color="#ffd76a" />
          </>
        )}
        {mode === 'hooks' && <Label x={hook.x} y={hook.y} tx={hook.x - 240} ty={hook.y - 240} text="Ganchos afilados (algunos giran)" k={win(t, 448.2, 454.2, 0.4)} color="#ffd76a" />}
        {mode === 'prey' && (
          <>
            <Label x={sc(fishX - 40, 30).x} y={sc(fishX - 40, 30).y} tx={sc(fishX - 40, 30).x - 140} ty={sc(fishX, 30).y + 260} text="Merluza negra (presa probable)" k={win(t, 455.2, 462, 0.4)} />
            <Label x={sc(lerp(-2600, 600, clamp((t - 457.6) / 5)) - 400, -760).x} y={sc(0, -760).y} tx={sc(0, -760).x - 300} ty={sc(0, -760).y + 140} text="Cachalote (depredador)" k={win(t, 458.6, 462, 0.4)} color="#ffd76a" />
          </>
        )}
        {mode === 'mystery' && (
          <>
            <Notice k={win(t, 471.8, 481.8, 0.4)} text="HIPÓTESIS · POCAS OBSERVACIONES" />
            <Title k={win(t, 472.4, 481.6, 0.5)} lines={['¿CAZADOR AL ACECHO?']} size={56} top={110} />
          </>
        )}
      </>
    ),
    grade: {vignette: 0.8, tint: '#2a6a7a', tintK: 0.2},
  };
};

/** Comparación: calamar gigante (largo, esbelto) frente a calamar colosal (corto, pesado). */
const compare: SceneFn = (t) => {
  const c = breathe(cam(60, 20, 0.68), t, 0.3);
  const k = win(t, 462.6, 471, 0.6);
  return {
    depth: DEPTH,
    svg: (
      <Ocean cam={c} t={t} depth={DEPTH} snow={0.8} tint={ICE} tintK={0.2}>
        <Glow id="cmpG" x={0} y={0} r={1300} color="#3a7ab0" k={0.4} />
        <GiantSquid uid="cmpGi" pose={{t, pulse: 0.1, spread: 0.05, wave: 0.25, curl: 0.1, tentacles: [{tip: {x: 700, y: 6}, ext: 1}, {tip: {x: 700, y: -6}, ext: 1}], rim: 0.4}} x={-40} y={-300} scale={0.95} />
        <ColossalSquid uid="cmpCo" pose={pose(t, {spread: 0.2, drift: 0.3, tentacles: [{tip: {x: 380, y: 30}, ext: 0.3}, {tip: {x: 380, y: -30}, ext: 0.3}]})} x={-60} y={330} scale={1.0} />
      </Ocean>
    ),
    overlay: (
      <>
        <div style={{position: 'absolute', left: 90, top: 70, opacity: k, fontFamily: FONT, textAlign: 'left', textShadow: '0 2px 8px rgba(0,0,0,0.85)'}}>
          <div style={{fontSize: 40, fontWeight: 900, color: '#ffb08a'}}>CALAMAR GIGANTE</div>
          <div style={{fontSize: 28, fontWeight: 700, color: '#eaf6ff'}}>más largo y esbelto · tentáculos larguísimos</div>
        </div>
        <div style={{position: 'absolute', right: 90, bottom: 230, textAlign: 'right', opacity: win(t, 466, 471, 0.6), fontFamily: FONT, textShadow: '0 2px 8px rgba(0,0,0,0.85)'}}>
          <div style={{fontSize: 40, fontWeight: 900, color: '#ffd76a'}}>CALAMAR COLOSAL</div>
          <div style={{fontSize: 28, fontWeight: 700, color: '#eaf6ff'}}>más corto y mucho más pesado · ganchos</div>
        </div>
      </>
    ),
    grade: {vignette: 0.75},
  };
};

/** Primer registro de un juvenil vivo (2025) — ilustración, no imagen real. */
const juvenile: SceneFn = (t) => {
  const c = breathe(shot(t, 481.8, 500, cam(0, 0, 2.6), cam(-60, 20, 1.6), 'inOut'), t, 0.2);
  const fade = clamp((t - 492) / 7);
  return {
    depth: 600,
    svg: (
      <Ocean cam={c} t={t} depth={600} snow={0.9} tint={ICE} tintK={0.2}>
        <Glow id="juvG" x={0} y={0} r={400} color="#bfe8ff" k={0.5 * (1 - fade)} />
        <g opacity={0.75 * (1 - fade)}>
          <ColossalSquid uid="juv" pose={pose(t, {spread: 0.6, tone: 0, rim: 0.8})} x={0} y={0} scale={0.22} />
        </g>
      </Ocean>
    ),
    overlay: (
      <>
        <Notice k={win(t, 482.2, 489.4, 0.4)} text="ILUSTRACIÓN · NO ES LA GRABACIÓN ORIGINAL" />
        <Title k={win(t, 482.6, 489.2, 0.5)} lines={['2025: PRIMER VIDEO DE UN JUVENIL VIVO', 'EN SU HÁBITAT']} size={42} top={110} color="#dff6ff" />
      </>
    ),
    grade: {vignette: 0.85},
  };
};

export const scene07: SceneFn = cuts([
  [415, under],
  [425.2, main(425.2, 441.2, cam(300, 0, 0.55), cam(80, 0, 0.75), 'reveal')],
  [441.2, main(441.2, 447.8, cam(-160, -30, 1.2), cam(-80, -20, 1.6), 'eye')],
  [447.8, main(447.8, 454.4, cam(160, 40, 2.4), cam(190, 30, 3.0), 'hooks')],
  [454.4, main(454.4, 462.2, cam(300, -150, 0.6), cam(380, -180, 0.62), 'prey')],
  [462.2, compare],
  [471.4, main(471.4, 481.8, cam(100, 0, 0.7), cam(60, 0, 0.95), 'mystery')],
  [481.8, juvenile],
], 0.6);
