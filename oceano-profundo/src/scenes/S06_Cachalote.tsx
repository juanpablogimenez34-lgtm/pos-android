// ESCENA 06 — EL CACHALOTE (320–415 s), Physeter macrocephalus.
//  320–325 una sombra enorme pasa sobre el calamar gigante.
//  325–342 en la superficie: respira (soplo), rótulo; la cabeza ≈ 1/3 del cuerpo y el órgano del espermaceti (corte).
//  342–352 inmersión: arquea el cuerpo, la aleta caudal se eleva y desciende con potentes golpes.
//  352–368 ecolocalización ILUSTRATIVA: clics regulares → zumbido al acercarse a la presa.
//  368–377 evidencias: picos de calamar en estómagos, cicatrices circulares de ventosas.
//  377–415 RECONSTRUCCIÓN de un encuentro (aviso permanente): el cachalote guiado por sus ecos; el calamar huye.
import {GiantSquid} from '../animals/GiantSquid';
import {SpermWhale, WhalePose} from '../animals/SpermWhale';
import {breathe, cam, Cam, shot, toScreen} from '../camera/camera';
import {Label, Notice, SpeciesCard, Title, win} from '../components/UI';
import {EchoWaves, Glow} from '../effects/Effects';
import {Ocean} from '../environment/Ocean';
import {FONT} from '../utils/fonts';
import {clamp, lerp} from '../utils/math';
import {along, phase} from '../utils/motion';
import {f1} from '../utils/spline';
import {cuts, SceneFn} from './common';

const VP = {w: 1920, h: 1080};
const WS = 0.8; // escala del cachalote (L = 1.600 u → 1.280 u)

const shadow: SceneFn = (t) => {
  const c = breathe(cam(0, 0, 0.6), t, 0.5);
  const wx = lerp(-2600, 2600, clamp((t - 319) / 7));
  return {
    depth: 700,
    svg: (
      <Ocean cam={c} t={t} depth={700} snow={1}>
        <GiantSquid uid="w6sq" pose={{t, pulse: 0.15, spread: 0.5, wave: 0.7, look: {x: 0, y: -600}, tone: 0.2, rim: 0.3}} x={200} y={200} scale={0.7} />
        <SpermWhale uid="w6sh" pose={{t, phase: t * 1.2, amp: 0.7, tone: 1}} x={wx} y={-430} scale={1.2} />
      </Ocean>
    ),
    grade: {vignette: 0.85},
  };
};

/** Superficie: soplo, rótulo, corte anatómico de la cabeza. */
const surface = (a: number, b: number, from: Cam, to: Cam, cut: boolean): SceneFn => (t) => {
  const x = lerp(-300, 500, clamp((t - 325) / 17));
  const y = -470;
  const pose: WhalePose = {t, phase: phase(t, () => 0.35, 320), amp: 0.5, flip: 0.4, blow: clamp((t - 326.6) / 2.6) * (t < 329.4 ? 1 : 0), rim: 0.6, cut: cut ? win(t, 333.4, 341.2, 0.8) : 0, fv: 0};
  const c = breathe(shot(t, a, b, from, to, 'cine'), t, 0.4);
  const headS = toScreen(c, VP, x - 300 * WS, y - 30);
  const head0 = toScreen(c, VP, x, y + 150 * WS);
  const head1 = toScreen(c, VP, x - 1600 * 0.33 * WS, y + 150 * WS);
  return {
    depth: 12,
    svg: (
      <Ocean cam={c} t={t} depth={12} surfaceY={-560} snow={0.6} warp={1} schools={0.3}>
        <SpermWhale uid={cut ? 'w6c' : 'w6s'} pose={pose} x={x} y={y} scale={WS} />
      </Ocean>
    ),
    overlay: cut ? (
      <>
        <Label x={headS.x} y={headS.y} tx={headS.x - 80} ty={headS.y + 300} text="Órgano del espermaceti" k={win(t, 334, 341.2, 0.5)} color="#ffd76a" />
        {win(t, 333.2, 341.2, 0.4) > 0.01 && (
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: win(t, 333.2, 341.2, 0.4)}}>
            <path d={`M${f1(head1.x)},${f1(head0.y + 40)} L${f1(head0.x)},${f1(head0.y + 40)} M${f1(head1.x)},${f1(head0.y + 28)} l0,24 M${f1(head0.x)},${f1(head0.y + 28)} l0,24`} stroke="#9ff0ff" strokeWidth={4} />
            <text x={(head0.x + head1.x) / 2} y={head0.y + 84} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#9ff0ff" stroke="rgba(0,0,0,0.7)" strokeWidth={5} paintOrder="stroke">Cabeza ≈ 1/3 del cuerpo</text>
          </svg>
        )}
      </>
    ) : (
      <SpeciesCard k={win(t, 326.4, 332.6, 0.6)} name="Cachalote" sci="Physeter macrocephalus" info="Machos adultos: más de 15 m" />
    ),
    grade: {vignette: 0.6},
  };
};

/** Inmersión: la cola se eleva y el animal desciende; la profundidad aumenta. */
const dive: SceneFn = (t) => {
  const u = clamp((t - 341.8) / 10.4);
  const ang = lerp(0.05, 1.15, clamp(u * 2.2)) - clamp((u - 0.7) / 0.3) * 0.5;
  const p = along([[341.8, 0, -400], [344, 300, -200], [352.2, 900, 1600]], t);
  const depth = lerp(15, 1000, u * u);
  const c = breathe(cam(p.x - 100, p.y - 100, 0.5), t, 0.5);
  return {
    depth,
    svg: (
      <Ocean cam={c} t={t} depth={depth} surfaceY={-700} snow={1}>
        <SpermWhale uid="w6d" pose={{t, phase: phase(t, () => 0.65, 341.8), amp: 1.1, arch: -0.4 + u * 0.4, fv: clamp(1 - Math.abs(u - 0.25) * 4), rim: 0.5, tone: u * 0.6}} x={p.x} y={p.y} scale={WS} angle={ang} />
      </Ocean>
    ),
    overlay: <Title k={win(t, 344, 351.4, 0.5)} lines={['MÁS DE 1.000 m · UNA HORA O MÁS']} size={44} top={110} />,
    grade: {vignette: 0.75},
  };
};

/** Clics: intervalo regular y luego zumbido (intervalos cada vez más cortos). */
function clickTimes(a: number, buzz: number, b: number) {
  const out: number[] = [];
  let x = a;
  while (x < buzz) {
    out.push(x);
    x += 0.7;
  }
  let dt = 0.3;
  while (x < b) {
    out.push(x);
    x += dt;
    dt = Math.max(0.045, dt * 0.85);
  }
  return out;
}
const CLICKS = clickTimes(353, 363.2, 368.1);

const echo: SceneFn = (t) => {
  const x = lerp(-900, 300, clamp((t - 352) / 16));
  const y = 0;
  const target = {x: lerp(1500, 1050, clamp((t - 352) / 16)), y: -40 + Math.sin(t * 0.6) * 30};
  const c = breathe(shot(t, 352, 368.4, cam(x + 300, 0, 0.6), cam(x + 600, 0, 0.55), 'inOut'), t, 0.4);
  const mouth = {x: x + 4 * WS, y: y - 40 * WS};
  return {
    depth: 1000,
    svg: (
      <Ocean cam={c} t={t} depth={1000} snow={0.9} specks={0.5}>
        <SpermWhale uid="w6e" pose={{t, phase: phase(t, () => 0.5, 352), amp: 0.8, rim: 0.55, tone: 0.3}} x={x} y={y} scale={WS} />
        <EchoWaves t={t} origin={mouth} dir={1} clicks={CLICKS} target={target} speed={1600} maxR={1900} />
        <g opacity={0.35}>
          <GiantSquid uid="w6t" pose={{t, pulse: 0.2, spread: 0.3, wave: 0.6, tone: 0.75}} x={target.x} y={target.y} scale={0.45} dir={-1} />
        </g>
      </Ocean>
    ),
    overlay: (
      <>
        <Notice k={win(t, 352.8, 368.2, 0.4)} text="ONDAS SONORAS: REPRESENTACIÓN ILUSTRATIVA" />
        <Title k={win(t, 358.6, 362.8, 0.4)} lines={['ECOLOCALIZACIÓN']} size={60} top={110} color="#9fe8ff" />
        <Title k={win(t, 363.3, 368.2, 0.4)} lines={['CLICS CADA VEZ MÁS RÁPIDOS: «ZUMBIDO»']} size={46} top={110} color="#ffd890" />
      </>
    ),
    grade: {vignette: 0.85},
  };
};

/** Evidencias: cicatrices circulares en la piel y picos de calamar. */
const evidence: SceneFn = (t) => {
  const c = breathe(shot(t, 368.4, 377.4, cam(-260, -20, 1.5), cam(-360, -10, 1.8), 'inOut'), t, 0.2);
  const scars = [[-220, -70, 16], [-300, -40, 11], [-260, -100, 9], [-380, -60, 13], [-340, -110, 8], [-450, -80, 10]];
  return {
    depth: 1000,
    svg: (
      <Ocean cam={c} t={t} depth={1000} snow={0.6}>
        <Glow id="w6ev" x={-300} y={-200} r={600} color="#4a7ab0" k={0.45} />
        <SpermWhale uid="w6v" pose={{t, phase: t * 0.6, amp: 0.3, rim: 0.7}} x={0} y={0} scale={WS} />
        <g opacity={win(t, 369, 377, 0.6)}>
          {scars.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="none" stroke="#c8ccd2" strokeWidth={2.5} opacity={0.75} />)}
        </g>
      </Ocean>
    ),
    overlay: (
      <>
        <Label x={toScreen(c, VP, -300, -60).x} y={toScreen(c, VP, -300, -60).y} tx={toScreen(c, VP, -300, -60).x + 240} ty={toScreen(c, VP, -300, -60).y - 230} text="Cicatrices de ventosas" k={win(t, 370, 377, 0.4)} color="#ffd76a" />
        {/* pico de calamar (ilustración) */}
        {win(t, 369, 377, 0.5) > 0.01 && (
          <div style={{position: 'absolute', left: 120, top: 640, opacity: win(t, 369, 377, 0.5), fontFamily: FONT, color: '#eaf6ff', background: 'rgba(3,14,24,0.65)', borderRadius: 16, padding: '18px 24px', width: 520}}>
            <svg width={120} height={110} style={{float: 'left', marginRight: 16}}>
              <path d="M20,30 Q60,-10 104,30 Q80,44 62,48 Q80,56 104,70 Q60,112 20,70 Q36,50 20,30Z" fill="#2a1a10" stroke="#c8a888" strokeWidth={3} />
            </svg>
            <div style={{fontWeight: 900, fontSize: 30}}>Picos de calamar</div>
            <div style={{fontWeight: 600, fontSize: 24, color: '#bcd4e2'}}>hallados en estómagos de cachalotes</div>
          </div>
        )}
      </>
    ),
    grade: {vignette: 0.85},
  };
};

/** Reconstrucción del encuentro. */
const encounter: SceneFn = (t) => {
  const flee = clamp((t - 389.5) / 1.2);
  const w = along([[377, -2600, 100], [386, -1300, 40], [392, -300, -20], [402, 1500, -100], [415, 3200, -200]], t);
  const sq = along([[377, 500, 40], [389.5, 420, 30], [392, 1100, -80], [402, 2600, -260], [415, 4000, -400]], t);
  const head = {x: w.x + 10, y: w.y - 40};
  const midAt = (tt: number) => {
    const a = along([[377, -2600, 100], [386, -1300, 40], [392, -300, -20], [402, 1500, -100], [415, 3200, -200]], tt);
    const b = along([[377, 500, 40], [389.5, 420, 30], [392, 1100, -80], [402, 2600, -260], [415, 4000, -400]], tt);
    return {x: (a.x + 300 + b.x) / 2, y: (a.y + b.y) / 2};
  };
  // hasta 400 s la cámara acompaña el encuentro; después se queda atrás y empuja despacio: los animales cruzan
  // el cuadro y se pierden en la oscuridad
  const m0 = midAt(Math.min(t, 400));
  const mid = t <= 400 ? m0 : {x: m0.x + (midAt(t).x - m0.x) * 0.3, y: m0.y + (midAt(t).y - m0.y) * 0.3};
  const c = breathe(cam(mid.x, mid.y, t <= 400 ? lerp(0.5, 0.44, clamp((t - 395) / 5)) : lerp(0.44, 0.56, clamp((t - 400) / 15))), t, 0.6);
  const clicks = CLICKS.map((x) => x + 30).filter((x) => x < 395);
  const jetPulse = flee * (0.5 + 0.5 * Math.sin(t * 7));
  return {
    depth: 900,
    svg: (
      <Ocean cam={c} t={t} depth={900} snow={1.1} specks={2} stir={[head, {x: w.x - 400, y: w.y}, {x: sq.x, y: sq.y}]} stirR={380}>
        <EchoWaves t={t} origin={head} dir={1} clicks={clicks} target={sq} speed={1700} maxR={1700} k={0.6} />
        <GiantSquid uid="w6q" pose={{t, pulse: Math.max(jetPulse, 0.15), jet: flee * 0.9, siphon: 1, spread: lerp(0.9, 0.05, flee), curl: 0.6 - flee * 0.4, wave: 0.9, armSpeed: 1.6, look: head, tone: 0.25, rim: 0.5}} x={sq.x} y={sq.y} scale={0.7} dir={-1} />
        <SpermWhale uid="w6x" pose={{t, phase: phase(t, (x) => (x > 389 ? 0.85 : 0.5), 377), amp: t > 389 ? 1.1 : 0.8, jaw: win(t, 391, 396, 0.8) * 0.35, rim: 0.5, tone: 0.3}} x={w.x} y={w.y} scale={WS} angle={Math.atan2(w.vy, w.vx) * 0.5} />
      </Ocean>
    ),
    overlay: (
      <>
        <Notice k={win(t, 377.6, 414.6, 0.6)} text="RECONSTRUCCIÓN BASADA EN EVIDENCIAS CIENTÍFICAS · NO ES UNA GRABACIÓN" />
        <Title k={win(t, 395.2, 400.4, 0.5)} lines={['LOS CALAMARES: PARTE FUNDAMENTAL', 'DE SU DIETA']} size={42} top={110} />
      </>
    ),
    grade: {vignette: 0.85},
  };
};

export const scene06: SceneFn = cuts([
  [320, shadow],
  [325, surface(325, 333.2, cam(-600, -420, 0.62), cam(-100, -440, 0.7), false)],
  [333.2, surface(333.2, 341.8, cam(100, -460, 0.9), cam(200, -460, 1.0), true)],
  [341.8, dive],
  [352.2, echo],
  [368.4, evidence],
  [377.4, encounter],
], 0.6);
