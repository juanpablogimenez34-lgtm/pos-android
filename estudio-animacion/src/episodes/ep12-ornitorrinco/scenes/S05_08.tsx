// ESCENAS 5–8.
//  5 (60–75)   LECHE SIN PEZONES: madre con las crías → visualización anatómica (dos zonas de secreción en el
//              vientre, cubiertas de pelo) → gotas de leche sobre la piel → vuelta al nido.
//  6 (75–90)   EL CRECIMIENTO: crías en la madriguera → transición temporal (pelaje, ojos, patas) → el juvenil
//              explora el túnel → sale a la orilla.
//  7 (90–105)  SU PRIMERA GRAN INMERSIÓN: camina hacia el agua → mete las patas delanteras (ondas) → se sumerge
//              con el lomo arqueado (anillo) → la cámara lo sigue bajo el agua (remadas alternas).
//  8 (105–120) EL SEXTO SENTIDO: primer plano del pico → cierra ojos, oídos y narinas → invertebrados ocultos →
//              visualización de los campos eléctricos débiles que detecta el pico.
import {clamp, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {Platypus, PL} from '../character/Platypus';
import {Brand, Callout, Note, poseFrom, PTrack, seg, Vignette, win} from '../components/common';
import {EV} from '../data/timeline';
import {BurrowCutaway, RiverWorld, SciPanel} from '../environment/World';

const FEET = 110;
const Tag: React.FC<{k: number; text: string}> = ({k, text}) =>
  k > 0.01 ? <div style={{position: 'absolute', right: 54, top: 70, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 20, letterSpacing: 3, color: '#9ff0ff', opacity: 0.85 * k}}>{text}</div> : null;

// ---------------- ESCENA 5 ----------------
export function scene05(t: number): SceneOut {
  const sci = t >= 64 && t < 72;
  if (sci) {
    // visualización anatómica: vista ventral simplificada de la hembra y las dos zonas de leche
    const k = seg(t, 64, 65);
    const drip = seg(t, EV.milk, 71.5);
    return {
      svg: (
        <g>
          <SciPanel t={t} />
          <g transform="translate(540 900) rotate(-90) scale(1.25)" opacity={k}>
            <Platypus uid="s5v" pose={{t, mode: 'swim', swimPhase: 0.2 + Math.sin(t) * 0.02, eyes: 0.6}} x={0} y={0} scale={1} view="top" />
          </g>
          {[-1, 1].map((sd) => (
            <g key={sd} opacity={k}>
              <ellipse cx={540 + sd * 52} cy={1060} rx={34} ry={46} fill="none" stroke="#ffd870" strokeWidth={4} strokeDasharray="10 8" />
              {Array.from({length: 6}, (_, i) => {
                const yy = 1040 + (i % 3) * 18;
                const xx = 540 + sd * (40 + (i % 2) * 22);
                return <ellipse key={i} cx={xx} cy={yy + drip * 18 * ((i % 3) + 1)} rx={5} ry={7} fill="#fff8ec" opacity={drip * (1 - (i % 3) * 0.2)} />;
              })}
            </g>
          ))}
        </g>
      ),
      overlay: (
        <>
          <Vignette k={0.5} />
          <Tag k={win(t, 64.2, 71.8, 0.3)} text="VISUALIZACIÓN ANATÓMICA SIMPLIFICADA" />
          <Callout k={win(t, 65.2, 71.6)} x={592} y={1040} tx={600} ty={600} text="dos zonas de secreción de leche (sin pezones)" align="right" />
          <Note k={win(t, 68.4, 71.8, 0.3)} text="La leche brota sobre el pelo del vientre y las crías la toman de la piel" top={1290} />
        </>
      ),
    };
  }
  const nurse = poseFrom([[60, 'NURSING']], t);
  let c: Cam = cam(80 + Math.sin(t * 0.4) * 30, 50, 1.6 + (t - 60) * 0.05);
  if (t >= 72) c = shot(t, 72, 73.5, cam(40, 60, 2.2), cam(80, 50, 1.6), 'cine');
  if (t >= 73.5) c = cam(80 - (t - 73.5) * 50, 50 + (t - 73.5) * 10, 1.6 + (t - 73.5) * 0.15);
  c = breathe(c, t, 0.1);
  return {
    svg: (
      <BurrowCutaway cam={c} t={t} glow={1.1}>
        <Platypus uid="s5m" pose={{...nurse, curl: 0.55}} x={190} y={30} scale={0.62} />
        {[0, 1].map((i) => <Platypus key={i} uid={`s5b${i}`} pose={{t: t + i, mode: 'rest', baby: 0.92, curl: 0.4, bill: 0.6, head: Math.sin(t * 2 + i) * 0.1}} x={70 + i * 50} y={82 + i * 6} scale={0.2} />)}
      </BurrowCutaway>
    ),
    overlay: (
      <>
        <Vignette k={0.6} />
        <Brand />
      </>
    ),
  };
}

// ---------------- ESCENA 6 ----------------
export function scene06(t: number): SceneOut {
  if (t >= 86.6 && t < 87.4) {
    const k = (t - 86.6) / 0.8;
    const a = scene06Inner(86.59);
    const b = scene06Inner(87.4);
    return {svg: <g><g opacity={1 - k}>{a.svg}</g><g opacity={k}>{b.svg}</g></g>, overlay: k < 0.5 ? a.overlay : b.overlay};
  }
  return scene06Inner(t);
}
function scene06Inner(t: number): SceneOut {
  const g = seg(t, EV.growth[0], EV.growth[1]);
  if (t < 87) {
    const baby = lerp(0.95, 0.3, g);
    const TR: PTrack = [[75, 'NEWBORN_RESTING'], [EV.growth[0], 'JUVENILE_CRAWLING'], [83, 'JUVENILE_EXPLORING']];
    const pose = poseFrom(TR, t, {baby});
    const s = lerp(0.2, 0.42, g);
    const exploring = seg(t, 83, 87);
    const x = lerp(60, -520, exploring);
    const y = lerp(80, -240, exploring);
    const c = breathe(cam(lerp(60, x + 60, exploring), lerp(70, y, exploring), lerp(2.0, 1.4, g)), t, 0.1);
    return {
      svg: (
        <BurrowCutaway cam={c} t={t} glow={1}>
          <Platypus uid="s6" pose={{...pose, mode: t < EV.growth[0] ? 'rest' : 'walk'}} x={x} y={y} scale={s} dir={exploring > 0 ? -1 : 1} angle={exploring > 0 ? 0.55 : 0} />
          {t < 83 && <Platypus uid="s6b" pose={{...pose, t: t + 1, mode: 'rest', curl: 0.4}} x={110} y={86} scale={s * 0.95} />}
        </BurrowCutaway>
      ),
      overlay: (
        <>
          <Vignette k={0.6} />
          {g > 0.01 && g < 0.99 && (
            <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
              {Array.from({length: 4}, (_, i) => <circle key={i} cx={540} cy={960} r={180 + ((g * 3 + i / 4) % 1) * 700} fill="none" stroke="#ffe8b0" strokeWidth={3} opacity={0.35 * Math.sin(Math.PI * g)} />)}
            </svg>
          )}
          <Note k={win(t, EV.growth[0], 86.8, 0.4)} text="3–4 meses de lactancia: crece el pelaje, se abren los ojos (transición ilustrativa)" top={1290} />
          <Brand />
        </>
      ),
    };
  }
  const pose = poseFrom([[87, 'JUVENILE_EXPLORING']], t, {baby: 0.3});
  const s = 0.55;
  const x = -60 + (pose.walkDist ?? 0) * s;
  const c = breathe(cam(x + 60, -120, 1.1), t, 0.12);
  return {
    svg: (
      <RiverWorld cam={c} t={t} floorY={900} bank={{x0: -1600, x1: 3000}}>
        <ellipse cx={-150} cy={-110} rx={80} ry={50} fill="#1e140a" />
        <Platypus uid="s6c" pose={pose} x={x} y={-70 - FEET * s * 0.8} scale={s} />
      </RiverWorld>
    ),
    overlay: (
      <>
        <Vignette k={0.5} />
        <Note k={win(t, 87.2, 89.8, 0.3)} text="Al final del verano, el juvenil sale de la madriguera" top={1290} />
        <Brand />
      </>
    ),
  };
}

// ---------------- ESCENA 7 ----------------
export function scene07(t: number): SceneOut {
  const s = 0.6;
  const TR: PTrack = [[90, 'JUVENILE_EXPLORING'], [94, 'ENTERING_WATER'], [EV.dive, 'DIVING'], [100.2, 'UNDERWATER_SWIMMING']];
  const pose = poseFrom(TR, t, {baby: 0.25});
  const walkX = -380 + (pose.walkDist ?? 0) * s;
  const edge = -40;
  const dive = seg(t, EV.dive, 100.4);
  const x = t < EV.dive ? Math.min(walkX, edge) : edge + (t - EV.dive) * 170;
  const y = t < 94 ? -70 - FEET * s * 0.8 : t < EV.dive ? lerp(-70 - FEET * s * 0.8, 20, seg(t, 94, EV.dive)) : lerp(20, 420, dive);
  const ang = t < 94 ? 0 : t < EV.dive ? 0.25 * seg(t, 94, 96) : lerp(0.45, 0, seg(t, 99.6, 101.5));
  let c: Cam = cam(walkX - 40, -120, 1.0);
  if (t >= 93) c = shot(t, 93, 95, cam(walkX - 40, -120, 1.0), cam(edge + 60, -20, 1.6), 'cine');
  if (t >= 98.2) c = shot(t, 98.2, 100, cam(edge + 60, -20, 1.6), cam(x + 80, y, 1.0), 'cine');
  if (t >= 100) c = cam(x + 80, y, 1.0);
  c = breathe(c, t, 0.15);
  const pawRip = t > EV.pawsIn ? [{x: edge + 80, t0: EV.pawsIn, s: 0.4}, {x: edge + 80, t0: EV.pawsIn + 1.2, s: 0.4}] : [];
  const bubbles = t > EV.dive ? Array.from({length: 6}, (_, i) => ({x: x - 60 - i * 40, y: y - 40 - ((t - EV.dive) * 90 + i * 30) % 260})) : [];
  return {
    svg: (
      <RiverWorld cam={c} t={t} floorY={900} bank={{x0: -1800, x1: -60}} ripples={[...pawRip, {x: edge + 60, t0: EV.dive, s: 1}, {x: edge + 60, t0: EV.dive + 0.4, s: 0.8}]} bubbles={bubbles}>
        <Platypus uid="s7" pose={{...pose, wet: t > 94 ? 1 : 0.2}} x={x} y={y} scale={s} angle={ang} />
      </RiverWorld>
    ),
    overlay: (
      <>
        <Vignette k={0.5} />
        <Callout k={win(t, 101.2, 104.8)} x={toScreen(c, x - 0.12 * PL * s, y + 40).x} y={toScreen(c, x - 0.12 * PL * s, y + 40).y} tx={140} ty={560} text="remadas alternas con las patas delanteras" />
        <Brand />
      </>
    ),
  };
}

// ---------------- ESCENA 8 ----------------
export function scene08(t: number): SceneOut {
  const s = 1.0;
  const floor = 760;
  const TR: PTrack = [[105, 'UNDERWATER_SWIMMING'], [EV.eyesClose, 'ELECTRORECEPTION']];
  const pose = poseFrom(TR, t, {eyes: lerp(1, 0, seg(t, EV.eyesClose, EV.eyesClose + 0.6))});
  const x = -200 + (t - 105) * 30;
  const y = floor - 210;
  const bill = {x: x + PL * 0.24 * s, y: y - 10};
  const prey = [{x: x + 420, y: floor - 10}, {x: x + 560, y: floor - 4}, {x: x + 330, y: floor - 2}];
  let c: Cam = cam(bill.x, bill.y, 3.0);
  if (t >= 109) c = shot(t, 109, 110, cam(bill.x, bill.y, 3.0), cam(x + 30, y - 10, 2.6), 'cine');
  if (t >= 113) c = shot(t, 113, 114.5, cam(x + 30, y - 10, 2.6), cam(x + 260, floor - 160, 1.2), 'cine');
  if (t >= 114.5) c = cam(x + 260, floor - 160, 1.2);
  c = breathe(c, t, 0.12);
  const field = seg(t, EV.efield, 118);
  const eye = toScreen(c, x + 0.03 * PL * s, y - 0.17 * 0.6 * PL * s * 0.26 - 20);
  return {
    svg: (
      <RiverWorld cam={c} t={t} floorY={floor}>
        {/* larvas ocultas en el sedimento (se revelan) */}
        {prey.map((p, i) => (
          <g key={i} opacity={seg(t, 113.5 + i * 0.4, 114.5 + i * 0.4)}>
            <path d={`M${p.x - 16},${p.y} q8,${-6 + Math.sin(t * 4 + i) * 4} 16,0 q8,6 16,0`} stroke="#d8b878" strokeWidth={7} fill="none" strokeLinecap="round" />
            {field > 0.01 && Array.from({length: 4}, (_, k) => {
              const r = 30 + ((t * 60 + k * 40) % 160);
              return <circle key={k} cx={p.x} cy={p.y} r={r} fill="none" stroke="#9ff0ff" strokeWidth={2.5} opacity={field * 0.6 * (1 - r / 190)} />;
            })}
          </g>
        ))}
        <Platypus uid="s8" pose={pose} x={x} y={y} scale={s} />
        {field > 0.01 && Array.from({length: 7}, (_, i) => <circle key={`r${i}`} cx={bill.x + 20 + i * 14} cy={bill.y - 6 + (i % 2) * 8} r={3} fill="#9ff0ff" opacity={field * (0.5 + 0.5 * Math.sin(t * 8 + i))} />)}
      </RiverWorld>
    ),
    overlay: (
      <>
        <Vignette k={0.55} />
        <Callout k={win(t, 110.2, 112.8)} x={eye.x} y={eye.y} tx={140} ty={560} text="cierra ojos, oídos y narinas" />
        <Note k={win(t, EV.efield, 119.9, 0.3)} text="Visualización: el pico detecta campos eléctricos débiles de las presas; el ornitorrinco no produce electricidad" top={1290} />
        <Tag k={win(t, EV.efield, 119.9, 0.3)} text="VISUALIZACIÓN CIENTÍFICA" />
        <Brand />
      </>
    ),
  };
}

export const _c = clamp;
