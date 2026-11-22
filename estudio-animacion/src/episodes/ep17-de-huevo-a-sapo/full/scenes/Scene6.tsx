// ESCENA 6 (120–150 s) · EL PRIMER MUNDO TERRESTRE
//  120–127 el sapo juvenil sobre una piedra húmeda: respira, parpadea, mira alrededor.
//  127–135 primeros desplazamientos: camina hasta el borde y baja con un saltito articulado.
//  135–142 explora hojas y musgo (camina, se detiene, olfatea).
//  142–150 encuentra una hormiga pequeña: la observa, se orienta y la atrapa con la lengua.
import {clamp, lerp} from '../../../../engine/math';
import {stageAt} from '../../../../lifecycle/stages';
import {breathe, cam, Cam, SceneOut, shot} from '../../../../studio2';
import {Ant} from '../../character/Ant';
import {Toad, toadPose} from '../../character/Toad';
import {ForestBack, ForestFront} from '../../environment/Forest';
import {jumpAt} from '../../motion/jump';
import {BUFO_STAGES} from '../../species/bufoBufo';
import {seg, StageChip, Vignette, win} from '../components/shared';
import {EV} from '../data/timeline';

const STONE_TOP = -54;
const GROUND = -6;
const HOP_T0 = 129.95;
const HOP_DIST = 150;

/** Recorrido: [t, x] de los tramos a pie (velocidad constante en cada tramo). */
const WALK: [number, number, number, number][] = [
  [127.2, 129.8, -10, 100],
  [131.6, 135.0, 250, 400],
  [135.2, 137.6, 400, 520],
  [139.2, 141.8, 520, 760],
];

export function juvenile6(t: number, sz: number) {
  const fo = 46 * sz;
  let x = -10;
  let walk = 0;
  let phase = 0;
  for (const [a, b, x0, x1] of WALK) {
    if (t >= b) x = x1;
    else if (t >= a) {
      x = lerp(x0, x1, (t - a) / (b - a));
      walk = 0.85 * clamp((t - a) / 0.25) * clamp((b - t) / 0.25);
    }
  }
  phase = (x / (70 * sz)) * Math.PI * 2;
  const J = jumpAt(t, HOP_T0, HOP_DIST, 70);
  const inHop = t >= HOP_T0 && t < 131.6;
  if (inHop) x = 100 + J.dx;
  const land = clamp(J.dx / HOP_DIST);
  const base = t < HOP_T0 ? STONE_TOP : inHop ? lerp(STONE_TOP, GROUND, land) : GROUND;
  const y = base - fo + (inHop ? J.dy + J.crouch * 4 * sz : 0) - 3 * Math.abs(Math.sin(phase)) * walk * sz;
  return {x, y, base, walk, phase, J, inHop};
}

export function scene6(t: number): SceneOut {
  const st = stageAt(BUFO_STAGES, 0.95);
  const sz = st.size;
  const m = juvenile6(t, sz);
  // hormiga: entra por la derecha, se detiene a tantear y es atrapada
  const antX = t < 144.5 ? 1050 - (t - EV.antIn) * 40 : 1050 - 3 * 40 + Math.sin(t * 3) * 1.5;
  const antY = GROUND - 9;
  const mouth = {x: m.x + 86 * sz, y: m.y + 9 * sz};
  const reach = Math.hypot(antX - mouth.x, antY - mouth.y) / sz;
  const ang = Math.atan2(antY - mouth.y, antX - mouth.x);
  const out = seg(t, EV.strike, EV.strike + 0.07);
  const back = seg(t, EV.strike + 0.09, EV.strike + 0.26);
  const tongue = out * (1 - back);
  const caught = t >= EV.strike + 0.07;
  const tip = {x: mouth.x + Math.cos(ang) * reach * sz * tongue, y: mouth.y + Math.sin(ang) * reach * sz * tongue};
  const watch = seg(t, 142.4, 143.2);
  const crouch = t > 143 && t < EV.strike + 0.6 ? 0.35 * seg(t, 143, 144.5) * (1 - seg(t, EV.strike + 0.2, EV.strike + 0.6)) : m.inHop ? m.J.crouch : 0;
  const blink = Math.max(win(t, 122.4, 122.6, 0.08), win(t, 125.8, 126.0, 0.08), win(t, 137.9, 138.1, 0.08), win(t, EV.strike + 0.45, EV.strike + 0.95, 0.12));
  const sniff = win(t, 137.7, 139.0, 0.3) * 0.12;
  const look = t < 127 ? Math.sin((t - 120) * 0.9) * 0.8 : t > 142.4 ? watch : 0.3;
  const pose = toadPose({
    x: m.x, y: m.y, angle: (m.inHop ? m.J.tilt : 0) + sniff, t, swimAmp: 0,
    fold: m.inHop ? m.J.fold : 1, armReach: m.inHop ? m.J.armReach : 0, crouch,
    breath: 0.5 + 0.5 * Math.sin(t * (t > EV.strike ? 6 : 4.8)), blink, inWater: false,
    walk: m.walk, walkPhase: m.phase, tongue, tongueLen: reach, tongueAng: ang, look,
  });
  let c: Cam = shot(t, 120, 127, cam(50, -120, 2.3), cam(40, -100, 2.9), 'inOut');
  if (t >= 127) c = shot(t, 127, 128.5, cam(40, -100, 2.9), cam(m.x + 70, -80, 2.5), 'cine');
  if (t >= 128.5) c = cam(m.x + 70, lerp(-80, -70, seg(t, 129, 132)), 2.5);
  if (t >= 135) c = shot(t, 135, 136.5, cam(juvenile6(135, sz).x + 70, -70, 2.5), cam(m.x + 60, -50, 2.8), 'cine');
  if (t >= 136.5) c = cam(m.x + 60, -50, 2.8);
  if (t >= 141.6) c = shot(t, 141.6, 143.6, cam(m.x + 60, -50, 2.8), cam(840, -40, 3.1), 'cine');
  if (t >= 143.6) c = shot(t, 143.6, 146, cam(840, -40, 3.1), cam(830, -36, 3.5), 'in');
  if (t >= 146) c = shot(t, 146, 150, cam(830, -36, 3.5), cam(800, -50, 3.0), 'cine');
  c = breathe(c, t, 0.3);
  return {
    svg: (
      <ForestBack cam={c} t={t} wide>
        <ellipse cx={m.x + 6 * sz} cy={m.base - 2} rx={70 * sz * (1 - 0.4 * clamp(-m.J.dy / 70))} ry={8 * sz} fill="#000" opacity={0.3} />
        {!caught && t > EV.antIn - 0.5 && <Ant x={antX} y={antY} t={t} s={0.55} dir={-1} walking={t < 144.5 ? 1 : 0.15} />}
        <Toad uid="juv6" s={st} p={pose} />
        {caught && tongue > 0.02 && <Ant x={tip.x} y={tip.y} t={t} s={0.55} dir={-1} walking={0} />}
      </ForestBack>
    ),
    overlay: (
      <>
        <ForestFront cam={c} t={t} />
        <Vignette kind="forest" />
        <StageChip text="sapo joven" k={win(t, 120.6, 127, 0.4)} />
      </>
    ),
  };
}
