// ESCENAS 1–4.
//  1 (0–15)   EL ANIMAL IMPOSIBLE: gancho (pico que emerge → rostro húmedo → huevo que se abre → nada con los ojos
//             cerrados → espolón) · sale del río y camina sobre piedras · «órbita»: pico, membranas, pelaje, cola.
//  2 (15–30)  SU EXTRAORDINARIO HOGAR: bosque australiano → la cámara baja al río → nada en superficie (tres
//             «jorobas») → se acerca a la orilla.
//  3 (30–45)  UN MAMÍFERO QUE PONE HUEVOS: la hembra entra en la madriguera → corte del terreno → huevos → la madre
//             se enrosca alrededor de ellos.
//  4 (45–60)  EL NACIMIENTO: huevo → la cáscara blanda se rasga → cría diminuta → la madre cerca.
import {clamp, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {Egg, Platypus, PL} from '../character/Platypus';
import {BigTitle, Brand, Callout, Note, poseFrom, PTrack, seg, Vignette, win} from '../components/common';
import {EV} from '../data/timeline';
import {BurrowCutaway, ForestScene, RiverWorld} from '../environment/World';

const FEET = 110; // de la línea del cuello a la planta (u locales, adulto)

// ---------------- ESCENA 1 ----------------
export function scene01(t: number): SceneOut {
  // 0–2: pico que emerge (vista frontal) y rostro húmedo
  if (t < 2) {
    const rise = seg(t, 0, 1.0);
    const c = breathe(t < 1 ? cam(0, -10, 3.0) : shot(t, 1, 2, cam(0, -10, 3.0), cam(0, 20, 1.9), 'cine'), t, 0.1);
    return {
      svg: (
        <RiverWorld cam={c} t={t} floorY={1400} ripples={[{x: 0, t0: 0.05, s: 0.6}, {x: 0, t0: 0.6, s: 0.5}]} tint={0.3}>
          <Platypus uid="h1" pose={{t, mode: 'rest', wet: 1, eyes: 1}} x={0} y={lerp(70, -6, rise)} scale={0.62} view="front" />
        </RiverWorld>
      ),
      overlay: (
        <>
          <Vignette k={0.6} />
          <BigTitle k={win(t, EV.hookTitle, 4.9, 0.3)} lines={['EL ANIMAL QUE', 'PARECE IMPOSIBLE']} top={290} size={84} />
        </>
      ),
    };
  }
  // 2–3: huevo que se abre (madriguera)
  if (t < 3) {
    const c = breathe(cam(0, 40, 3.4), t, 0.1);
    return {
      svg: (
        <BurrowCutaway cam={c} t={t}>
          <Egg x={0} y={90} s={1} t={t} hatch={seg(t, 2.1, 2.9)} wobble={1} />
        </BurrowCutaway>
      ),
      overlay: <BigTitle k={win(t, EV.hookTitle, 4.9, 0.3)} lines={['EL ANIMAL QUE', 'PARECE IMPOSIBLE']} top={290} size={84} />,
    };
  }
  // 3–4: nada bajo el agua con los ojos cerrados
  if (t < 4) {
    const c = breathe(cam(-120 + (t - 3) * 120, 420, 1.15), t, 0.15);
    return {
      svg: (
        <RiverWorld cam={c} t={t} floorY={760}>
          <Platypus uid="h3" pose={{...poseFrom([[0, 'UNDERWATER_SWIMMING']], t), eyes: 0}} x={-160 + (t - 3) * 160} y={420} scale={0.95} />
        </RiverWorld>
      ),
      overlay: <BigTitle k={win(t, EV.hookTitle, 4.9, 0.3)} lines={['EL ANIMAL QUE', 'PARECE IMPOSIBLE']} top={290} size={84} />,
    };
  }
  // 4–5: espolón (primer plano ilustrativo)
  if (t < 5) {
    const c = breathe(cam(-PL * 0.6 * 0.82 * 1.3 + 30, 20, 2.3), t, 0.1);
    return {
      svg: (
        <ForestScene cam={c} t={t} warm={0.4}>
          <Platypus uid="h4" pose={{...poseFrom([[0, 'ADULT_RESTING']], t), male: true, spurHi: 1}} x={0} y={-FEET * 1.3} scale={1.3} />
        </ForestScene>
      ),
      overlay: (
        <>
          <BigTitle k={win(t, EV.hookTitle, 4.9, 0.3)} lines={['EL ANIMAL QUE', 'PARECE IMPOSIBLE']} top={290} size={84} />
          <Note k={win(t, 4.05, 4.95, 0.15)} text="Espolón del macho (ilustración)" top={1290} />
        </>
      ),
    };
  }
  // 5–15: sale del río y camina sobre piedras; después la cámara «orbita» con planos de detalle
  const TR: PTrack = [[5, 'SURFACE_SWIMMING'], [EV.exitWater + 0.9, 'WALKING'], [9.6, 'ADULT_RESTING']];
  const pose = poseFrom(TR, t, {male: true});
  const exitK = seg(t, 5.4, 7.0);
  const s = 0.9;
  const x = -420 + (pose.walkDist ?? 0) * s + (t < 6.3 ? (t - 5) * 80 : 104);
  const y = lerp(60, -70 - FEET * s, exitK);
  let c: Cam = cam(x - 40, -60, 0.95);
  if (t >= 10) c = shot(t, 10, 11, cam(x - 40, -60, 0.95), cam(x + PL * 0.2 * s, y - 10, 2.6), 'cine');
  if (t >= 11.8) c = shot(t, 11.8, 12.6, cam(x + PL * 0.2 * s, y - 10, 2.6), cam(x - PL * 0.15 * s, y + 90, 2.4), 'cine');
  if (t >= 13.4) c = shot(t, 13.4, 14.2, cam(x - PL * 0.15 * s, y + 90, 2.4), cam(x - PL * 0.7 * s, y + 10, 1.6), 'cine');
  c = breathe(c, t, 0.15);
  const C = (lx: number, ly: number) => toScreen(c, x + lx * s, y + ly * s);
  const bill = C(PL * 0.22, -10);
  const foot = C(-PL * 0.1, 120);
  const tail = C(-PL * 0.72, 0);
  return {
    svg: (
      <RiverWorld cam={c} t={t} floorY={900} bank={{x0: -380, x1: 2400}} ripples={[{x: -360, t0: 5.6}, {x: -330, t0: 6.6, s: 0.6}]}>
        <Platypus uid="s1" pose={{...pose, wet: lerp(1, 0.6, seg(t, 7, 15))}} x={x} y={y} scale={s} angle={-0.12 * (1 - exitK) + (exitK > 0 && exitK < 1 ? -0.1 : 0)} />
      </RiverWorld>
    ),
    overlay: (
      <>
        <Vignette k={0.55} />
        <Callout k={win(t, 10.8, 11.8)} x={bill.x} y={bill.y} tx={140} ty={560} text="pico ancho, blando y sensible" />
        <Callout k={win(t, 12.4, 13.4)} x={foot.x} y={foot.y} tx={140} ty={560} text="patas palmeadas con garras" />
        <Callout k={win(t, 14.0, 14.9)} x={tail.x} y={tail.y} tx={140} ty={560} text="cola ancha, plana y peluda" />
        <Brand />
      </>
    ),
  };
}

// ---------------- ESCENA 2 ----------------
export function scene02(t: number): SceneOut {
  if (t >= 18.6 && t < 19.4) {
    const k = (t - 18.6) / 0.8;
    const a = scene02(18.59);
    const b = scene02(19.4);
    return {svg: <g><g opacity={1 - k}>{scene02Forest(t)}</g><g opacity={k}>{b.svg}</g></g>, overlay: a.overlay};
  }
  if (t < 19) {
    const c = breathe(cam(-300 + (t - 15) * 60, -700, 0.5), t, 0.15);
    return {
      svg: <ForestScene cam={c} t={t} warm={0.8} />,
      overlay: (
        <>
          <Vignette k={0.5} />
          <Note k={win(t, 15.5, 18.8, 0.4)} text="Bosque de ribera del este de Australia" top={1290} />
          <Brand />
        </>
      ),
    };
  }
  const TR: PTrack = [[19, 'SURFACE_SWIMMING']];
  const pose = poseFrom(TR, t);
  const s = 0.8;
  const x = -500 + (t - 19) * 70;
  const y = 64 * s;
  let c: Cam = shot(t, 19, 23, cam(0, -900, 0.55), cam(x - 120, -40, 0.85), 'cine');
  if (t >= 23) c = cam(x - 120 + (t - 23) * 20, -40, 0.85 + (t - 23) * 0.04);
  c = breathe(c, t, 0.15);
  const wake = Array.from({length: 4}, (_, i) => ({x: x - 60 - i * 70, t0: 19 + i * 0.8 + Math.floor((t - 19) / 3.2) * 3.2}));
  return {
    svg: (
      <RiverWorld cam={c} t={t} floorY={900} bank={{x0: 600, x1: 3000}} ripples={[...wake, {x: x + 120, t0: 23.5, s: 0.5}, {x: x + 160, t0: 26.0, s: 0.5}]}>
        <Platypus uid="s2" pose={pose} x={x} y={y} scale={s} />
      </RiverWorld>
    ),
    overlay: (
      <>
        <Vignette k={0.5} />
        <Callout k={win(t, 25.4, 29.6)} x={toScreen(c, x - PL * 0.3 * s, -10).x} y={toScreen(c, x - PL * 0.3 * s, -10).y} tx={140} ty={560} text="asoman cabeza, espalda y cola" />
        <Brand />
      </>
    ),
  };
}

const scene02Forest = (t: number) => <ForestScene cam={breathe(cam(-300 + (t - 15) * 60, -700, 0.5), t, 0.15)} t={t} warm={0.8} />;

// ---------------- ESCENA 3 ----------------
export function scene03(t: number): SceneOut {
  if (t < 34) {
    const TR: PTrack = [[30, 'WALKING'], [33, 'BURROW_DIGGING']];
    const pose = poseFrom(TR, t);
    const s = 0.85;
    const x = -200 + (pose.walkDist ?? 0) * s;
    const c = breathe(cam(120, -160, 0.95), t, 0.15);
    const hole = {x: 420, y: -200};
    return {
      svg: (
        <RiverWorld cam={c} t={t} floorY={900} bank={{x0: -900, x1: 3000}}>
          <path d={`M${hole.x - 300},-90 Q${hole.x},-420 ${hole.x + 700},-380 L${hole.x + 700},0 L${hole.x - 300},0Z`} fill="#5a4630" />
          <ellipse cx={hole.x + 40} cy={hole.y + 60} rx={90} ry={60} fill="#1e140a" />
          <Platypus uid="s3a" pose={pose} x={Math.min(x, hole.x)} y={-70 - FEET * s - seg(t, 32.6, 34) * 40} scale={s} opacity={1 - seg(t, 33.2, 34)} />
        </RiverWorld>
      ),
      overlay: (
        <>
          <Vignette k={0.5} />
          <Note k={win(t, 30.4, 33.8, 0.3)} text="Hembra entrando en su madriguera de la orilla" top={1290} />
          <Brand />
        </>
      ),
    };
  }
  const travel = seg(t, 34, 38);
  const cx = lerp(-1500, 0, travel);
  const cy = lerp(-1100, 60, travel);
  let c: Cam = cam(cx, cy, lerp(0.45, 1.3, travel));
  if (t >= 38) c = shot(t, 38, 40, cam(0, 60, 1.3), cam(20, 90, 2.4), 'cine');
  if (t >= 42) c = shot(t, 42, 43.6, cam(20, 90, 2.4), cam(0, 40, 1.5), 'cine');
  c = breathe(c, t, 0.1);
  const momIn = seg(t, 41.8, 44.2);
  const mom = poseFrom([[34, 'WALKING'], [41.8, 'EGG_HATCHING']], t);
  return {
    svg: (
      <BurrowCutaway cam={c} t={t}>
        <Egg x={-10} y={98} s={0.7} t={t} />
        <Egg x={36} y={102} s={0.7} t={t + 1} />
        {momIn > 0 && <Platypus uid="s3b" pose={{...mom, curl: lerp(0, 0.85, momIn)}} x={lerp(-420, 160, momIn)} y={lerp(-60, 30, momIn)} scale={0.62} />}
      </BurrowCutaway>
    ),
    overlay: (
      <>
        <Vignette k={0.6} />
        <div style={{position: 'absolute', right: 54, top: 70, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 20, letterSpacing: 3, color: '#ffd8a8', opacity: 0.8 * win(t, 34.3, 44.8, 0.4)}}>CORTE ILUSTRATIVO DEL TERRENO</div>
        <Note k={win(t, 38.8, 41.8, 0.3)} text="Normalmente 1 o 2 huevos pequeños, de cáscara blanda" top={1290} />
        <Brand />
      </>
    ),
  };
}

// ---------------- ESCENA 4 ----------------
export function scene04(t: number): SceneOut {
  const h = seg(t, EV.hatchCrack, 53.5);
  const out = seg(t, 53, 56);
  let c: Cam = cam(0, 60, 3.0);
  if (t >= 57) c = shot(t, 57, 58.6, cam(0, 60, 3.0), cam(60, 40, 1.4), 'cine');
  if (t >= 58.6) c = cam(60 + (t - 58.6) * 40, 40 - (t - 58.6) * 14, 1.4 + (t - 58.6) * 0.12);
  c = breathe(c, t, 0.08);
  const mom = poseFrom([[45, 'EGG_HATCHING']], t);
  return {
    svg: (
      <BurrowCutaway cam={c} t={t} glow={1.1}>
        <Platypus uid="s4m" pose={{...mom, curl: 0.85}} x={190} y={30} scale={0.62} />
        <Egg x={36} y={102} s={0.7} t={t + 1} hatch={seg(t, 50.5, 55)} wobble={win(t, 50, 55, 0.5)} />
        <Egg x={-10} y={98} s={0.7} t={t} hatch={h} wobble={win(t, 46.5, 53.5, 0.6)} />
        {out > 0.01 && <Platypus uid="s4b" pose={{t, mode: 'rest', baby: 1, curl: lerp(0.9, 0.5, out), eyes: 0}} x={-10 + out * 30} y={88 - out * 6} scale={0.16 * (0.7 + 0.3 * out)} />}
      </BurrowCutaway>
    ),
    overlay: (
      <>
        <Vignette k={0.6} />
        <Note k={win(t, 53.6, 57, 0.3)} text="Cría recién nacida: diminuta, sin pelaje y con los ojos cerrados" top={1290} />
        <Brand />
      </>
    ),
  };
}

export const _c = clamp;
