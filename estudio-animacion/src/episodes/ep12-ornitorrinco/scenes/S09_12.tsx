// ESCENAS 9–12.
//  9  (120–135) UN CAZADOR SIN DIENTES: explora el fondo con el pico (sedimento) → detecta y recoge larvas → sube
//               a la superficie → visualización de abazones y placas córneas trituradoras.
//  10 (135–150) EL MAMÍFERO VENENOSO: macho adulto → primer plano de la pata trasera → espolón y glándula (esquema)
//               → regreso al protagonista.
//  11 (150–165) UN SUPERVIVIENTE EXTRAORDINARIO: nada por el río → los grupos de mamíferos → monotremas: ornitorrinco
//               y equidnas → regreso al bosque.
//  12 (165–180) LA NATURALEZA SUPERA LA IMAGINACIÓN: orilla al atardecer → entra al río → montaje breve → la cámara
//               se aleja mientras nada.
import {clamp, hash1, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {Egg, Platypus, PL} from '../character/Platypus';
import {BigTitle, Brand, Callout, Note, poseFrom, PTrack, seg, Vignette, Wash, win} from '../components/common';
import {EV} from '../data/timeline';
import {BurrowCutaway, ForestScene, RiverWorld, SciPanel} from '../environment/World';

const FEET = 110;
const Tag: React.FC<{k: number; text: string}> = ({k, text}) =>
  k > 0.01 ? <div style={{position: 'absolute', right: 54, top: 70, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 20, letterSpacing: 3, color: '#9ff0ff', opacity: 0.85 * k}}>{text}</div> : null;
const T: React.FC<{x: number; y: number; s: number; c?: string; children: React.ReactNode; o?: number}> = ({x, y, s, c = '#eaf6ff', children, o = 1}) => (
  <text x={x} y={y} textAnchor="middle" fill={c} fontSize={s} fontWeight={800} fontFamily={FONT_FAMILY} opacity={o} style={{paintOrder: 'stroke'}} stroke="rgba(0,0,0,0.6)" strokeWidth={s * 0.12}>{children}</text>
);

// ---------------- ESCENA 9 ----------------
export function scene09(t: number): SceneOut {
  const s = 0.95;
  const floor = 760;
  const up = seg(t, 128.2, EV.surface9);
  const TR: PTrack = [[120, 'FORAGING'], [128.2, 'SURFACING'], [EV.surface9, 'FEEDING']];
  const pose = poseFrom(TR, t);
  const x = -300 + (t - 120) * 40;
  const y = lerp(floor - 120, 60, up);
  const ang = t < 128.2 ? 0.28 + Math.sin(t * 1.6) * 0.05 : lerp(-0.5, 0, seg(t, 129.5, EV.surface9));
  let c: Cam = cam(x + 120, floor - 150, 1.3);
  if (t >= 128.2) c = shot(t, 128.2, EV.surface9, cam(x + 120, floor - 150, 1.3), cam(x + 40, 10, 1.3), 'cine');
  if (t >= EV.surface9) c = cam(x + 40, 10, 1.3);
  c = breathe(c, t, 0.12);
  const picks = EV.feedPick;
  const sediment = [120.6, 121.8, 123.0, 124.4, 125.4, 126.6, 127.8].map((t0) => ({x: x + 0.24 * PL * s * 0.9 + (t0 - 120) * 40 - (t - 120) * 40 + (t0 - 120) * 40, t0}));
  const bubbles = Array.from({length: 4}, (_, i) => ({x: x + 60 - i * 30, y: y - 60 - ((t * 70 + i * 40) % 220)}));
  const plates = win(t, 132.2, 134.9, 0.3);
  return {
    svg: (
      <RiverWorld cam={c} t={t} floorY={floor} sediment={sediment} bubbles={t < 131 ? bubbles : []} ripples={[{x: x + 60, t0: EV.surface9, s: 0.8}]}>
        {picks.map((p, i) => <path key={i} d={`M${x + 260 + i * 60 - 16},${floor - 8} q8,-6 16,0 q8,6 16,0`} stroke="#d8b878" strokeWidth={7} fill="none" strokeLinecap="round" opacity={1 - seg(t, p, p + 0.3)} />)}
        <Platypus uid="s9" pose={pose} x={x} y={y} scale={s} angle={ang} />
      </RiverWorld>
    ),
    overlay: (
      <>
        <Vignette k={0.55} />
        <Callout k={win(t, 125.2, 128.0)} x={toScreen(c, x + 0.05 * PL * s, y + 20).x} y={toScreen(c, x + 0.05 * PL * s, y + 20).y} tx={140} ty={560} text="guarda las presas en sus abazones" />
        {plates > 0.01 && (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: plates}}>
            <circle cx={760} cy={620} r={210} fill="rgba(6,20,26,0.88)" stroke="#ffd870" strokeWidth={3} />
            <path d="M600,600 Q760,520 920,600 L920,640 Q760,690 600,640Z" fill="#5a5450" />
            {[0, 1].map((i) => <rect key={i} x={640 + i * 150} y={600 + Math.sin(t * 8) * 3} width={110} height={26} rx={10} fill="#d8ccb0" stroke="#8a7a5a" strokeWidth={2} />)}
            <T x={760} y={880} s={26} c="#ffd870">placas córneas trituradoras (esquema)</T>
          </svg>
        )}
        <Note k={win(t, 120.4, 124.8, 0.3)} text="Inmersiones de unos 30 a 140 segundos (Australian Museum)" top={1290} />
        <Brand />
      </>
    ),
  };
}

// ---------------- ESCENA 10 ----------------
export function scene10(t: number): SceneOut {
  const s = 1.1;
  const sci = t >= 143 && t < 147;
  if (sci) {
    const k = seg(t, 143, 143.6);
    return {
      svg: (
        <g>
          <SciPanel t={t} />
          <g opacity={k}>
            <path d="M260,820 Q420,700 640,760 Q760,800 820,940 L780,1080 Q600,1140 420,1080 Q280,1000 260,820Z" fill="#4e3220" stroke="#2e1c10" strokeWidth={4} />
            <ellipse cx={470} cy={860} rx={70} ry={46} fill="#e8b860" stroke="#a8782a" strokeWidth={3} />
            <path d="M520,880 C620,940 700,1000 760,1080" stroke="#ffd870" strokeWidth={6} strokeDasharray="14 10" fill="none" />
            <path d={`M760,1080 L840,${1000 - Math.sin(t * 3) * 4} L812,1100Z`} fill="#e8dcc0" stroke="#8a7a5a" strokeWidth={3} />
            <path d="M700,1120 l120,30 M720,1140 l100,40 M740,1160 l80,46" stroke="#2e1c10" strokeWidth={10} strokeLinecap="round" />
          </g>
        </g>
      ),
      overlay: (
        <>
          <Vignette k={0.5} />
          <Tag k={win(t, 143.2, 146.8, 0.3)} text="ESQUEMA SIMPLIFICADO" />
          <Callout k={win(t, 143.4, 146.8)} x={470} y={860} tx={110} ty={560} text="glándula de veneno (muslo)" />
          <Callout k={win(t, 143.8, 146.8)} x={826} y={1040} tx={600} ty={1240} text="espolón córneo (~12 mm) del tobillo" align="right" />
        </>
      ),
    };
  }
  const pose = poseFrom([[135, 'WALKING'], [138.4, 'DEFENSIVE_POSTURE'], [147, 'ADULT_RESTING']], t, {male: true, spurHi: win(t, 139.6, 142.8, 0.3)});
  const x = -260 + Math.min(pose.walkDist ?? 0, 260) * s;
  const y = -FEET * s;
  let c: Cam = cam(x - 60, -60, 0.9);
  if (t >= 139) c = shot(t, 139, 140.2, cam(x - 60, -60, 0.9), cam(x - 0.5 * PL * s, y + 100 * s, 2.4), 'cine');
  if (t >= 147) c = shot(t, 147, 148.4, cam(x - 0.5 * PL * s, y + 100 * s, 2.4), cam(x - 60, -60, 1.0), 'cine');
  c = breathe(c, t, 0.12);
  return {
    svg: (
      <ForestScene cam={c} t={t} warm={0.6}>
        <Platypus uid="s10" pose={pose} x={x} y={y} scale={s} />
      </ForestScene>
    ),
    overlay: (
      <>
        <Vignette k={0.55} />
        <Note k={win(t, 135.4, 138.8, 0.3)} text="Macho adulto" top={1290} />
        <Note k={win(t, 139.6, 142.8, 0.3)} text="El espolón está en las patas TRASERAS, solo en los machos" top={1290} />
        <Note k={win(t, 147.2, 149.8, 0.3)} text="Dolor intenso en humanos; su veneno se produce sobre todo en la época de cría" top={1290} />
        <Brand />
      </>
    ),
  };
}

// ---------------- ESCENA 11 ----------------
const Echidna: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={130} ry={70} fill="#4a3a2a" />
    {Array.from({length: 46}, (_, i) => {
      const a = Math.PI + (i / 45) * Math.PI;
      const r = 60 + (i % 3) * 8;
      return <path key={i} d={`M${Math.cos(a) * r * 1.6},${Math.sin(a) * r * 0.9 + 10} l${Math.cos(a) * 34},${Math.sin(a) * 34}`} stroke={i % 2 ? '#e8dcc0' : '#c8b898'} strokeWidth={5} strokeLinecap="round" />;
    })}
    <path d={`M120,10 Q200,${20 + Math.sin(t * 2) * 3} 250,30`} stroke="#3a2a1e" strokeWidth={14} strokeLinecap="round" />
    <circle cx={140} cy={0} r={5} fill="#0a0806" />
    {[-60, 60].map((lx, i) => <path key={i} d={`M${lx},50 l-10,30`} stroke="#3a2a1e" strokeWidth={14} strokeLinecap="round" />)}
  </g>
);
export function scene11(t: number): SceneOut {
  if (t < 154 || t >= 162) {
    const swimming = t < 154;
    const pose = poseFrom([[150, 'UNDERWATER_SWIMMING']], t);
    const x = -300 + (t - 150) * 130;
    const c = swimming ? breathe(cam(x + 60, 380, 1.0), t, 0.12) : breathe(cam(200 + (t - 162) * 110, -600 + (t - 162) * 40, 0.5 + (t - 162) * 0.05), t, 0.12);
    return {
      svg: swimming ? (
        <RiverWorld cam={c} t={t} floorY={800} bubbles={Array.from({length: 4}, (_, i) => ({x: x - 50 - i * 40, y: 360 - ((t * 80 + i * 50) % 300)}))}>
          <Platypus uid="s11" pose={pose} x={x} y={400} scale={0.9} />
        </RiverWorld>
      ) : (
        <ForestScene cam={c} t={t} warm={0.8} />
      ),
      overlay: (
        <>
          <Vignette k={0.5} />
          <Brand />
        </>
      ),
    };
  }
  const k1 = seg(t, 154, 154.8);
  const k2 = seg(t, 158, 158.8);
  return {
    svg: (
      <g>
        <SciPanel t={t} />
        <g opacity={k1 * (1 - k2 * 0.85)}>
          <path d="M540,520 L540,640 M240,640 L840,640 M240,640 L240,720 M540,640 L540,720 M840,640 L840,720" stroke="#9ff0ff" strokeWidth={4} fill="none" />
          <T x={540} y={500} s={34}>MAMÍFEROS</T>
          <T x={240} y={770} s={28} c="#ffd870">Monotremas</T>
          <T x={240} y={806} s={22}>ponen huevos</T>
          <T x={540} y={770} s={28}>Marsupiales</T>
          <T x={840} y={770} s={28}>Placentarios</T>
          <circle cx={240} cy={720} r={10} fill="#ffd870" />
        </g>
        <g opacity={k2}>
          <T x={540} y={520} s={36} c="#ffd870">MONOTREMAS</T>
          <g transform="translate(560 860)">
            <Platypus uid="s11p" pose={{t, mode: 'rest'}} x={0} y={0} scale={0.75} />
          </g>
          <T x={420} y={1000} s={26}>ornitorrinco</T>
          <Echidna x={500} y={1200} s={0.9} t={t} />
          <T x={520} y={1330} s={26}>equidnas</T>
        </g>
      </g>
    ),
    overlay: (
      <>
        <Vignette k={0.5} />
        <Tag k={win(t, 154.2, 161.8, 0.3)} text="VISUALIZACIÓN" />
        <Note k={win(t, 158.6, 161.8, 0.3)} text="Un linaje antiguo y único, no una «mezcla» de animales" top={1660} />
      </>
    ),
  };
}

// ---------------- ESCENA 12 ----------------
export function scene12(t: number): SceneOut {
  const montage = t >= 174 && t < 177;
  if (montage) {
    const i = t < 175 ? 0 : t < 176 ? 1 : 2;
    const c = breathe(cam(0, 60, 2.4), t, 0.1);
    return {
      svg:
        i === 0 ? (
          <BurrowCutaway cam={c} t={t}>
            <Egg x={0} y={90} s={1} t={t} hatch={seg(t, 174, 175)} wobble={0.6} />
          </BurrowCutaway>
        ) : i === 1 ? (
          <BurrowCutaway cam={cam(0, 60, 1.6)} t={t}>
            <Platypus uid="m2" pose={{t, mode: 'walk', walkDist: (t - 175) * 60, baby: lerp(0.9, 0.3, t - 175)}} x={-60} y={60} scale={0.35} />
          </BurrowCutaway>
        ) : (
          <RiverWorld cam={cam(140, 600, 1.3)} t={t} floorY={760}>
            <Platypus uid="m3" pose={{...poseFrom([[0, 'ELECTRORECEPTION']], t), eyes: 0}} x={0} y={560} scale={0.9} />
            {Array.from({length: 3}, (_, k) => <circle key={k} cx={330} cy={752} r={30 + ((t * 70 + k * 40) % 120)} fill="none" stroke="#9ff0ff" strokeWidth={2.5} opacity={0.5} />)}
          </RiverWorld>
        ),
      overlay: <Vignette k={0.5} />,
    };
  }
  const s = 0.9;
  const TR: PTrack = [[165, 'WALKING'], [170.2, 'ENTERING_WATER'], [EV.enter12, 'SURFACE_SWIMMING'], [177, 'FINAL_RETREAT']];
  const pose = poseFrom(TR, t, {male: true});
  const walkX = -700 + (pose.walkDist ?? 0) * s;
  const edge = -60;
  const inW = t >= EV.enter12;
  const x = inW ? edge + (t - EV.enter12) * 70 : Math.min(walkX, edge);
  const y = inW ? 64 * s : lerp(-70 - FEET * s, 64 * s, seg(t, 170.2, EV.enter12));
  let c: Cam = cam(walkX - 80, -140, 1.0);
  if (t >= 170) c = cam(edge + 40, -60, 1.0);
  if (t >= 177) c = shot(t, 177, 180, cam(x + 40, -60, 1.0), cam(x + 200, -200, 0.45), 'inOut');
  c = breathe(c, t, 0.12);
  return {
    svg: (
      <RiverWorld cam={c} t={t} floorY={900} sunset={1} bank={{x0: -2200, x1: -80}} ripples={[{x: edge + 40, t0: EV.enter12, s: 0.9}, {x: x - 40, t0: 177.4, s: 0.6}, {x: x - 80, t0: 178.6, s: 0.6}]}>
        <Platypus uid="s12" pose={pose} x={x} y={y} scale={s} angle={inW ? 0 : 0.12 * seg(t, 170.2, EV.enter12)} />
      </RiverWorld>
    ),
    overlay: (
      <>
        <Vignette k={0.6} />
        <Wash k={0.35 * seg(t, 177, 179)} />
        <BigTitle k={clamp((t - EV.endText) / 0.6) * (1 - seg(t, EV.fadeOut, 180))} lines={['¿CUÁL DE SUS PODERES', 'TE SORPRENDIÓ MÁS?']} top={320} size={74} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1660, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 30, letterSpacing: 6, color: '#fff4e0', textShadow: '0 2px 8px rgba(0,0,0,0.7)', opacity: 0.85 * clamp((t - EV.endText - 0.5) / 0.6) * (1 - seg(t, EV.fadeOut, 180))}}>MUNDO INSÓLITO DOCUMENTALES</div>
        <Wash k={seg(t, EV.fadeOut, 180)} />
      </>
    ),
  };
}

export const _h = hash1;
