// ESCENAS 1–4.
//  1 (0–15)   EL TIBURÓN DE CUATRO SIGLOS: ojo → revelación del cuerpo → disolución por reflejo hacia un barco de
//             madera con «¿400 AÑOS VIVO?» → la cámara baja desde el casco hasta el tiburón (mismo mundo).
//  2 (15–30)  EL GIGANTE DE LAS AGUAS HELADAS: Ártico con hielo y témpanos → la cámara atraviesa la superficie
//             → bajo el hielo → plano lateral completo con escala.
//  3 (30–45)  EL COMIENZO DE UNA VIDA EXTRAORDINARIA (reconstrucción ilustrativa): cría entre peces → juvenil.
//  4 (45–60)  LOS SIGLOS PASAN: barcos del s. XVII, XVIII y XIX → la cámara baja al tiburón, ya mayor.
import {clamp, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {DeepOcean, OceanFront, SurfaceWorld} from '../../ep23-cachalote/environment/Ocean';
import {GreenlandShark, SL} from '../character/GreenlandShark';
import {BigTitle, Callout, Diver, Note, poseFrom, seg, STrack, Tag, toWorld, Vignette, win} from '../components/common';
import {EV} from '../data/timeline';
import {Brig18, Galleon17, Steamer19} from '../environment/Ships';
import {ColdFish, IceCeiling, IceFloes, Icebergs} from '../environment/World';

const EYE = {x: -48, y: -20}; // ojo en coordenadas locales (aprox.)
const Ripple: React.FC<{k: number; t: number}> = ({k, t}) =>
  k > 0.01 && k < 0.99 ? (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 6}, (_, i) => {
        const r = ((t * 500 + i * 180) % 1100) + 40;
        return <ellipse key={i} cx={540} cy={960} rx={r} ry={r * 0.35} fill="none" stroke="#dff4ff" strokeWidth={4} opacity={0.5 * Math.sin(Math.PI * k) * (1 - r / 1140)} />;
      })}
    </svg>
  ) : null;

// ---------------- ESCENA 1 ----------------
const TR1: STrack = [[0, 'SLOW_SWIM']];
const TR1b: STrack = [[10, 'SLOW_SWIM'], [13, 'DEEP_DESCENT']];
export function scene01(t: number): SceneOut {
  const s = 0.95;
  const deepShot = () => {
    const P = {x: -200 + t * 30, y: 60, a: -0.03};
    const pose = poseFrom(TR1, t, {age: 0.95, tone: 0.3, rim: 0.7}, 0.6);
    const eye = toWorld(EYE, P.x, P.y, P.a, s);
    const mid = toWorld({x: -0.45 * SL, y: 0}, P.x, P.y, P.a, s);
    let c: Cam = cam(eye.x, eye.y, 6.5);
    if (t >= 0.9) c = shot(t, 0.9, 3.0, cam(eye.x, eye.y, 6.5), cam(mid.x, mid.y + 40, 0.82), 'cine');
    c = breathe(c, t, 0.2);
    return (
      <DeepOcean cam={c} t={t} depth={0.85} glow={0.2}>
        <GreenlandShark uid="s1" pose={pose} x={P.x} y={P.y} angle={P.a} scale={s} />
      </DeepOcean>
    );
  };
  // mundo superficie + profundidad: el barco en la superficie, el tiburón 1.700 u más abajo
  const shipX = -300 + t * 34;
  const P2 = {x: 300 + (t - 10) * 40, y: 1700, a: 0.03};
  const pose2 = poseFrom(TR1b, Math.max(t, 10), {age: 0.95, rim: 0.6}, 1.4);
  let c2: Cam = cam(shipX + 60, -300, 0.58);
  if (t >= EV.backDown) c2 = shot(t, EV.backDown, 13.4, cam(shipX + 60, -300, 0.58), cam(P2.x - 380, P2.y + 30, 0.66), 'cine');
  c2 = breathe(c2, t, 0.2);
  const surface = (
    <SurfaceWorld cam={c2} t={t}>
      <Galleon17 x={shipX} t={t} s={0.75} wind={1.1} />
      <GreenlandShark uid="s1b" pose={pose2} x={P2.x} y={P2.y} angle={P2.a} scale={s} />
    </SurfaceWorld>
  );
  const mixK = clamp((t - EV.hookShip) / 0.8);
  return {
    svg: (
      <g>
        {mixK < 1 && deepShot()}
        {mixK > 0 && <g opacity={mixK}>{surface}</g>}
      </g>
    ),
    overlay: (
      <>
        {mixK > 0.3 && t < 13 && <OceanFront cam={c2} t={t} />}
        <Vignette k={0.7} />
        <Ripple k={mixK} t={t} />
        <BigTitle k={win(t, EV.hookShip, 8.6, 0.3)} lines={['¿400 AÑOS', 'VIVO?']} top={260} size={110} />
        <Note k={win(t, 4.2, 9.8, 0.4)} text="Barco del siglo XVII (ilustración) · comparación hipotética" top={1290} />
      </>
    ),
  };
}

// ---------------- ESCENA 2 ----------------
const TR2: STrack = [[15, 'UNDER_ICE_SWIM'], [27, 'SLOW_SWIM']];
export function scene02(t: number): SceneOut {
  const s = 0.9;
  if (t < 23) {
    let c: Cam = cam(0, -260, 0.42);
    if (t >= EV.arcticDive) c = shot(t, EV.arcticDive, 22.8, cam(0, -260, 0.42), cam(200, 1100, 0.55), 'cine');
    c = breathe(c, t, 0.2);
    const P = {x: -600 + (t - 15) * 60, y: 1250, a: 0.02};
    const pose = poseFrom(TR2, t, {age: 0.9, rim: 0.6}, 2.1);
    return {
      svg: (
        <SurfaceWorld cam={c} t={t} light={0.8}>
          <Icebergs t={t} x={-900} y={0} s={0.9} />
          <Icebergs t={t} x={1400} y={0} s={0.6} />
          <IceFloes t={t} x0={-1400} x1={1800} n={11} />
          <GreenlandShark uid="s2a" pose={pose} x={P.x} y={P.y} angle={P.a} scale={s} />
        </SurfaceWorld>
      ),
      overlay: (
        <>
          <Vignette k={0.5} />
          <Note k={win(t, 15.5, 19, 0.4)} text="Ártico y Atlántico Norte" top={1290} />
        </>
      ),
    };
  }
  const P = {x: -500 + (t - 23) * 55, y: 520 + Math.sin(t * 0.3) * 20, a: 0.02};
  const pose = poseFrom(TR2, t, {age: 0.9, tone: 0.15, rim: 0.85}, 2.1);
  const mid = toWorld({x: -0.45 * SL, y: 0}, P.x, P.y, P.a, s);
  let c: Cam = cam(mid.x + 80, 300, 0.8);
  if (t >= 27) c = shot(t, 27, 28.5, cam(mid.x + 80, 300, 0.8), cam(mid.x, mid.y + 60, 0.62), 'cine');
  c = breathe(c, t, 0.2);
  const sk = win(t, 27.6, 29.9, 0.3);
  const diver = toWorld({x: -0.45 * SL, y: 0.32 * SL}, P.x, P.y, 0, s);
  const nose = toScreen(c, ...xy(toWorld({x: 0, y: 0}, P.x, P.y, P.a, s)));
  const tail = toScreen(c, ...xy(toWorld({x: -1.05 * SL, y: 0}, P.x, P.y, P.a, s)));
  return {
    svg: (
      <DeepOcean cam={c} t={t} depth={0.32} glow={0} violet={0.1}>
        <IceCeiling t={t} x0={-2400} x1={2400} />
        <ColdFish t={t} cx={600} cy={260} n={10} s={0.6} />
        {t > 27 && <g opacity={sk}><Diver x={diver.x} y={diver.y} h={180 * 2 * s} t={t} /></g>}
        <GreenlandShark uid="s2b" pose={pose} x={P.x} y={P.y} angle={P.a} scale={s} />
      </DeepOcean>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette k={0.6} />
        {sk > 0.01 && (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: sk}}>
            <line x1={tail.x} y1={nose.y - 170} x2={nose.x} y2={nose.y - 170} stroke="#ffd870" strokeWidth={4} />
            <text x={(tail.x + nose.x) / 2} y={nose.y - 190} textAnchor="middle" fill="#ffd870" fontSize={30} fontWeight={900} fontFamily={FONT_FAMILY}>puede superar los 5 m</text>
          </svg>
        )}
        <Note k={sk} text="Escala aproximada · persona de 1,8 m" top={1290} />
      </>
    ),
  };
}
const xy = (p: {x: number; y: number}): [number, number] => [p.x, p.y];

// ---------------- ESCENA 3 ----------------
const TR3: STrack = [[30, 'NEWBORN_SWIM'], [EV.ageMorph[0], 'AGE_TRANSITION'], [EV.ageMorph[1], 'JUVENILE_EXPLORATION']];
export function scene03(t: number): SceneOut {
  const g = seg(t, EV.ageMorph[0], EV.ageMorph[1]);
  const age = lerp(0, 0.32, g);
  const s = lerp(0.12, 0.36, g);
  const P = {x: -200 + (t - 30) * lerp(16, 30, g), y: 220 + Math.sin(t * 0.5) * 30, a: Math.sin(t * 0.4) * 0.06};
  const pose = poseFrom(TR3, t, {age, tone: 0.1, rim: 0.8}, 0.2);
  const mid = toWorld({x: -0.4 * SL, y: 0}, P.x, P.y, P.a, s);
  const c = breathe(cam(mid.x + 30, mid.y, lerp(2.8, 1.25, g)), t, 0.2);
  return {
    svg: (
      <DeepOcean cam={c} t={t} depth={0.55} glow={0.2} violet={0.12}>
        <ColdFish t={t} cx={P.x + 60} cy={P.y - 120} n={9} spread={160} s={0.32} />
        <ColdFish t={t + 3} cx={P.x - 260} cy={P.y + 140} n={7} spread={140} s={0.28} dir={-1} />
        <GreenlandShark uid="s3" pose={pose} x={P.x} y={P.y} angle={P.a} scale={s} />
      </DeepOcean>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette k={0.6} />
        {g > 0.01 && g < 0.99 && (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            {Array.from({length: 4}, (_, i) => <circle key={i} cx={540} cy={960} r={200 + ((g * 3 + i / 4) % 1) * 700} fill="none" stroke="#bff4ff" strokeWidth={3} opacity={0.35 * Math.sin(Math.PI * g)} />)}
          </svg>
        )}
        <Tag k={win(t, 30.3, 44.8, 0.4)} text="RECONSTRUCCIÓN ILUSTRATIVA" />
        <Note k={win(t, EV.ageMorph[0], EV.ageMorph[1] + 0.2, 0.4)} text="El tiempo pasa… (transición ilustrativa, sin escala temporal exacta)" top={1290} />
      </>
    ),
  };
}

// ---------------- ESCENA 4 ----------------
const TR4: STrack = [[57, 'SLOW_SWIM']];
export function scene04(t: number): SceneOut {
  const [a, b, c3, d] = EV.ships;
  const k1 = 1 - seg(t, b - 0.6, b + 0.4);
  const k2 = seg(t, b - 0.6, b + 0.4) * (1 - seg(t, c3 - 0.6, c3 + 0.4));
  const k3 = seg(t, c3 - 0.6, c3 + 0.4);
  const P = {x: 500 + (t - 57) * 40, y: 1700, a: 0.02};
  const pose = poseFrom(TR4, Math.max(t, 57), {age: 0.68, rim: 0.6}, 0.9);
  const base = cam(80 + (t - a) * 18, -330, 0.5);
  let c: Cam = base;
  if (t >= d) c = shot(t, d, 59.6, base, cam(P.x - 330, P.y + 20, 0.68), 'cine');
  c = breathe(c, t, 0.2);
  const era = t < b ? 'siglo XVII' : t < c3 ? 'siglo XVIII' : 'siglo XIX';
  return {
    svg: (
      <SurfaceWorld cam={c} t={t} light={lerp(1, 0.85, seg(t, 45, 57))}>
        {k1 > 0.01 && <Galleon17 x={-200 + (t - a) * 40} t={t} s={0.72} k={k1} />}
        {k2 > 0.01 && <Brig18 x={-260 + (t - b) * 50} t={t} s={0.75} k={k2} wind={1.2} />}
        {k3 > 0.01 && <Steamer19 x={-300 + (t - c3) * 60} t={t} s={0.68} k={k3} />}
        <GreenlandShark uid="s4" pose={pose} x={P.x} y={P.y} angle={P.a} scale={0.88} />
      </SurfaceWorld>
    ),
    overlay: (
      <>
        <Vignette k={0.55} />
        <Ripple k={seg(t, b - 0.6, b + 0.4)} t={t} />
        <Ripple k={seg(t, c3 - 0.6, c3 + 0.4)} t={t} />
        <Tag k={win(t, 45.3, 57.5, 0.4)} text="COMPARACIÓN HISTÓRICA HIPOTÉTICA" />
        <Note k={win(t, 45.6, 57.2, 0.3)} text={`Embarcación del ${era} (ilustración)`} top={1290} />
        <Callout k={win(t, 58.2, 59.9)} x={toScreen(c, P.x - 0.4 * SL * 0.88, P.y).x} y={toScreen(c, P.x - 0.4 * SL * 0.88, P.y).y} tx={140} ty={560} text="el mismo tiburón imaginario, más grande" />
      </>
    ),
  };
}
