// ESCENA 05 — EL CALAMAR GIGANTE (225–320 s), Architeuthis dux.
//  225–236 emerge de la oscuridad propulsándose a chorro (manto por delante) + rótulo.
//  236–243 la leyenda del kraken (grabado sepia) y vuelta a la realidad.
//  243–253 corona: 8 brazos con movimiento independiente, 2 tentáculos que se disparan; macro de ventosas.
//  253–260 propulsión: sifón y chorro, aletas estabilizadoras.
//  260–270 cuerpo blando sin esqueleto: el pico (visualización de rayos X).
//  270–291 el ojo: acercamiento, ≈ 27 cm de diámetro (comparación) e hipótesis de detección de depredadores.
//  291–313 escala con una persona: medidas documentadas frente a cifras difíciles de verificar.
//  313–320 se aleja hacia la oscuridad.
import {GiantSquid, SquidPose} from '../animals/GiantSquid';
import {Human} from '../animals/Machines';
import {Lanternfish} from '../animals/SmallFish';
import {SpermWhale} from '../animals/SpermWhale';
import {breathe, cam, Cam, shot, toScreen} from '../camera/camera';
import {Label, Notice, SizeBar, SpeciesCard, Title, win} from '../components/UI';
import {Glow} from '../effects/Effects';
import {Ocean} from '../environment/Ocean';
import {FONT} from '../utils/fonts';
import {clamp, lerp} from '../utils/math';
import {f1} from '../utils/spline';
import {cuts, SceneFn} from './common';

const VP = {w: 1920, h: 1080};
const DEPTH = 700;
/** Posición: avanza con el manto por delante (hacia −x) en pulsos de chorro. */
function squidX(t: number) {
  let x = 1400;
  for (let s = 225; s < t; s += 1 / 30) {
    const ph = (s * 0.55) % 1;
    x -= (40 + (ph < 0.3 ? 300 * Math.sin((ph / 0.3) * Math.PI) : 0)) / 30;
  }
  return x;
}
function basePose(t: number, extra: Partial<SquidPose> = {}): SquidPose {
  const ph = (t * 0.55) % 1;
  const pulse = ph < 0.3 ? Math.sin((ph / 0.3) * Math.PI) : 0;
  return {t, pulse, jet: pulse * 0.9, siphon: 1, spread: 0.12, wave: 0.55, curl: 0.35, fin: t * 2.0, finAmp: 0.6, rim: 0.4, tone: 0.1, look: {x: -400, y: 0}, ...extra};
}

const cruise = (camF: (t: number, x: number) => Cam, opts: {card?: boolean; sepia?: boolean; jetLabels?: boolean} = {}): SceneFn => (t) => {
  const x = squidX(t);
  const y = Math.sin(t * 0.3) * 40;
  const pose = basePose(t);
  const c = camF(t, x);
  const siph = toScreen(c, VP, x + 30, y + 58);
  const finS = toScreen(c, VP, x - 470, y + 60);
  return {
    depth: DEPTH,
    svg: (
      <Ocean cam={c} t={t} depth={DEPTH} snow={1} specks={0.3} schools={0.2}>
        <Glow id={`gsq${opts.card ? 1 : 0}`} x={x - 200} y={y - 300} r={900} color="#2a6aa8" k={0.3} />
        <GiantSquid uid={opts.sepia ? 'gsS' : opts.card ? 'gsA' : 'gsJ'} pose={pose} x={x} y={y} scale={1} />
      </Ocean>
    ),
    overlay: (
      <>
        {opts.card && <SpeciesCard k={win(t, 228, 235, 0.6)} name="Calamar gigante" sci="Architeuthis dux" info="Cientos de metros de profundidad" />}
        {opts.sepia && (
          <>
            <div style={{position: 'absolute', inset: 30, border: '6px double rgba(90,60,20,0.85)', borderRadius: 8, opacity: win(t, 236.4, 240.6, 0.4), boxShadow: 'inset 0 0 160px rgba(60,35,10,0.9)'}} />
            <Title k={win(t, 236.6, 240.4, 0.4)} lines={['LA LEYENDA DEL KRAKEN']} size={60} top={90} color="#f2dfb8" />
            <Title k={win(t, 240.8, 242.9, 0.3)} lines={['UN ANIMAL REAL']} size={56} top={90} />
          </>
        )}
        {opts.jetLabels && (
          <>
            <Label x={siph.x} y={siph.y} tx={siph.x + 220} ty={siph.y + 180} text="Sifón: chorro de agua" k={win(t, 254.2, 259.6, 0.4)} />
            <Label x={finS.x} y={finS.y} tx={finS.x - 140} ty={finS.y + 200} text="Aletas estabilizadoras" k={win(t, 255.6, 259.6, 0.4)} color="#ffd76a" />
          </>
        )}
      </>
    ),
    grade: opts.sepia ? {vignette: 0.9, tint: '#6a4418', tintK: 0.9 * win(t, 236.4, 240.6, 0.5)} : {vignette: 0.8},
  };
};

/** Corona de brazos: los tentáculos se disparan hacia una presa; macro de ventosas; pico (rayos X). */
const crown = (a: number, b: number, from: Cam, to: Cam, mode: 'arms' | 'beak'): SceneFn => (t) => {
  const strike = mode === 'arms' ? clamp((t - 246.4) / 0.35) * (1 - clamp((t - 248.6) / 1.5)) : 0;
  const prey = {x: 820, y: -40 + Math.sin(t) * 10};
  const pose = basePose(t, {pulse: 0.1, jet: 0, spread: mode === 'beak' ? 0.95 : 0.35, wave: mode === 'beak' ? 0.3 : 0.8, armSpeed: 1.2, tentacles: [{tip: prey, ext: strike}, {tip: {x: prey.x, y: prey.y - 30}, ext: strike * 0.95}], look: prey});
  const c = breathe(shot(t, a, b, from, to, 'cine'), t, 0.3);
  const arm = toScreen(c, VP, 230, 60);
  const tent = toScreen(c, VP, lerp(500, prey.x, strike), lerp(30, prey.y, strike));
  const suck = toScreen(c, VP, 160, 30);
  const beak = toScreen(c, VP, 40, 4);
  const xray = mode === 'beak' ? win(t, 260.4, 269, 0.6) : 0;
  return {
    depth: DEPTH,
    svg: (
      <Ocean cam={c} t={t} depth={DEPTH} snow={0.8} specks={0.3}>
        <Glow id={`gcr${mode}`} x={100} y={-200} r={800} color="#2a6aa8" k={0.35} />
        {mode === 'arms' && t < 247 && <Lanternfish x={prey.x} y={prey.y} scale={2} angle={Math.PI} t={t} />}
        <GiantSquid uid={`gc${mode}`} pose={pose} x={0} y={0} scale={1} />
        {xray > 0.01 && (
          <g opacity={xray}>
            <circle cx={40} cy={4} r={46} fill="#06142a" opacity={0.6} />
            <path d="M14,-6 Q40,-34 66,-10 Q56,-2 44,0 Q56,8 66,16 Q40,40 14,16 Q24,4 14,-6Z" fill="#2a1a10" stroke="#7ae8ff" strokeWidth={2.5} />
            <path d="M44,0 L66,-10 M44,0 L66,16" stroke="#7ae8ff" strokeWidth={1.5} />
          </g>
        )}
      </Ocean>
    ),
    overlay:
      mode === 'arms' ? (
        <>
          <Label x={arm.x} y={arm.y} tx={arm.x + 120} ty={arm.y + 230} text="8 brazos" k={win(t, 243.6, 249, 0.4)} />
          <Label x={tent.x} y={tent.y} tx={tent.x - 80} ty={tent.y - 220} text="2 tentáculos de alimentación" k={win(t, 245.2, 250.4, 0.4)} color="#ffd76a" />
          <Label x={suck.x} y={suck.y} tx={suck.x - 260} ty={suck.y + 200} text="Ventosas con anillos dentados" k={win(t, 249.6, 253.4, 0.4)} />
        </>
      ) : (
        <>
          <Label x={beak.x} y={beak.y} tx={beak.x + 260} ty={beak.y - 210} text="Pico: su parte más dura" k={xray} color="#9ff0ff" />
          <Title k={win(t, 260.4, 264.6, 0.4)} lines={['SIN ESQUELETO']} size={48} top={110} />
        </>
      ),
    grade: {vignette: 0.8},
  };
};

const eye: SceneFn = (t) => {
  const pose = basePose(t, {pulse: 0.15, jet: 0, look: {x: 400 + Math.sin(t * 0.5) * 300, y: -100 + Math.sin(t * 0.7) * 80}, wave: 0.4});
  const c = breathe(shot(t, 270, 279.5, cam(100, -10, 1.3), cam(-6, -18, 5.2), 'cine'), t, 0.12);
  const k = win(t, 273.6, 280.4, 0.5);
  return {
    depth: DEPTH,
    svg: (
      <Ocean cam={c} t={t} depth={DEPTH} snow={0.6}>
        <Glow id="geye" x={-26} y={-18} r={300} color="#4a8ad8" k={0.35} />
        <GiantSquid uid="gEye" pose={pose} x={0} y={0} scale={1} />
        {/* comparación: balón de fútbol (≈ 22 cm) junto al ojo (≈ 27 cm) */}
        {k > 0.01 && (
          <g opacity={k} transform="translate(-130 50)">
            <circle r={28 * (22 / 27)} fill="#f4f4f0" stroke="#2a2a2a" strokeWidth={1.2} />
            {[0, 1, 2, 3, 4].map((i) => {
              const a = (i / 5) * Math.PI * 2;
              return <circle key={i} cx={Math.cos(a) * 14} cy={Math.sin(a) * 14} r={4.5} fill="#2a2a2a" />;
            })}
            <circle r={6} fill="#2a2a2a" />
          </g>
        )}
      </Ocean>
    ),
    overlay: (
      <>
        <Title k={k} lines={['≈ 27 cm DE DIÁMETRO']} size={60} top={110} color="#ffd76a" />
        <Label x={toScreen(c, VP, -130, 50).x} y={toScreen(c, VP, -130, 50).y} tx={toScreen(c, VP, -130, 50).x - 120} ty={toScreen(c, VP, -130, 50).y + 220} text="Balón de fútbol ≈ 22 cm" k={k} />
      </>
    ),
    grade: {vignette: 0.9},
  };
};

/** Hipótesis: un gran depredador agita plancton luminoso; el ojo del calamar detectaría ese brillo a distancia. */
const hypothesis: SceneFn = (t) => {
  const c = breathe(cam(300, 0, 0.36), t, 0.6);
  const wx = lerp(2400, 1200, clamp((t - 280.6) / 10.5));
  const head = {x: wx - 40, y: -60};
  const pose = basePose(t, {jet: 0, pulse: 0.1, look: head});
  const sq = toScreen(c, VP, -1100, 0);
  const wh = toScreen(c, VP, wx - 600, -60);
  return {
    depth: 900,
    svg: (
      <Ocean cam={c} t={t} depth={900} snow={1} specks={2.2} stir={[head, {x: wx - 400, y: -40}, {x: wx - 900, y: -20}]} stirR={420}>
        <GiantSquid uid="gHyp" pose={pose} x={-1100} y={0} scale={0.8} />
        <SpermWhale uid="hypW" pose={{t, phase: t * 1.3, amp: 0.8, tone: 0.9, rim: 0.3}} x={wx} y={-60} scale={0.9} dir={-1} />
        <path d={`M-700,0 L${f1(wx - 1500)},-40`} stroke="#ffd76a" strokeWidth={6} strokeDasharray="20 18" opacity={0.6 * win(t, 283, 291, 0.5)} />
      </Ocean>
    ),
    overlay: (
      <>
        <Notice k={win(t, 280.8, 291.2, 0.4)} text="HIPÓTESIS CIENTÍFICA · ILUSTRACIÓN" />
        <Label x={wh.x} y={wh.y} tx={wh.x - 60} ty={wh.y - 260} text="Plancton luminoso agitado" k={win(t, 282.5, 291, 0.4)} color="#9ff0ff" />
        <Label x={sq.x} y={sq.y} tx={sq.x + 60} ty={sq.y + 280} text="El calamar detecta el brillo" k={win(t, 285, 291, 0.4)} color="#ffd76a" />
      </>
    ),
    grade: {vignette: 0.85},
  };
};

/** Escala: animal extendido junto a una persona; medidas documentadas vs. cifras citadas. */
const UPM = 99; // unidades por metro en este plano (longitud total ≈ 1.240 u ↔ 12,5 m)
const scaleShot: SceneFn = (t) => {
  const pose = basePose(t, {jet: 0, pulse: 0.05, spread: 0.02, wave: 0.15, curl: 0.05, tentacles: [{tip: {x: 700, y: 6}, ext: 1}, {tip: {x: 700, y: -6}, ext: 1}]});
  const c = breathe(shot(t, 291.6, 313, cam(80, 0, 0.82), cam(240, 0, 0.62), 'inOut'), t, 0.3);
  const tail = toScreen(c, VP, -540, 140);
  const tip = toScreen(c, VP, 700, 140);
  const ext = toScreen(c, VP, -540 + 17 * UPM, 140);
  const kB = win(t, 293.2, 312.8, 0.6);
  const kE = win(t, 300.2, 312.8, 0.6);
  return {
    depth: DEPTH,
    svg: (
      <Ocean cam={c} t={t} depth={DEPTH} snow={0.8}>
        <Glow id="gsc" x={0} y={-200} r={1200} color="#2a6aa8" k={0.35} />
        <GiantSquid uid="gSc" pose={pose} x={0} y={0} scale={1} />
        <Human x={-200} y={330} h={1.75 * UPM} t={t} label="1,75 m" />
      </Ocean>
    ),
    overlay: (
      <>
        <SizeBar k={kB} x={tail.x} y={tail.y + 20} len={tip.x - tail.x} text="≈ 12–13 m · ejemplares mejor medidos" />
        {kE > 0.01 && (
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: kE}}>
            <path d={`M${f1(tip.x)},${f1(tail.y + 90)} L${f1(Math.min(1900, ext.x))},${f1(tail.y + 90)}`} stroke="#ff9a6a" strokeWidth={4} strokeDasharray="14 10" />
            <text x={Math.min(1880, ext.x)} y={tail.y + 140} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={28} fill="#ff9a6a" stroke="rgba(0,0,0,0.7)" strokeWidth={4} paintOrder="stroke">≈ 17 m · cifras citadas, difíciles de verificar</text>
          </svg>
        )}
      </>
    ),
    grade: {vignette: 0.75},
  };
};

export const scene05: SceneFn = cuts([
  [225, cruise((t, x) => breathe(shot(t, 225, 236.2, cam(x + 600, 40, 0.5), cam(x + 260, 0, 0.72), 'inOut'), t, 0.5), {card: true})],
  [236.2, cruise((t, x) => breathe(cam(x + 200, 0, 0.62), t, 0.5), {sepia: true})],
  [243.2, crown(243.2, 253.6, cam(420, 0, 0.95), cam(240, 20, 1.45), 'arms')],
  [253.6, cruise((t, x) => breathe(cam(x - 120, 20, 0.8), t, 0.4), {jetLabels: true})],
  [259.8, crown(259.8, 270, cam(160, 0, 1.4), cam(60, 0, 2.6), 'beak')],
  [270, eye],
  [280.6, hypothesis],
  [291.6, scaleShot],
  [313, cruise((t, x) => breathe(shot(t, 313, 320, cam(x + 200, 0, 0.7), cam(x + 700, 80, 0.45), 'inOut'), t, 0.5))],
], 0.6);
