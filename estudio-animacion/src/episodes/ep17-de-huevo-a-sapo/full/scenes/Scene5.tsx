// ESCENA 5 (95–120 s) · EL ADIÓS A LA COLA
//  95–101  renacuajo con cuatro patas: nada combinando cola y patadas.
//  101–107 transición temporal (días): descansa sobre una piedra mientras la cola se reabsorbe.
//  107–113 aguas poco profundas (toma partida agua/aire): se acerca nadando a la orilla.
//  113–120 trepa por la pendiente, rompe la superficie y sale a la orilla como sapo juvenil.
import {clamp, lerp} from '../../../../engine/math';
import {growthAt, stageAt} from '../../../../lifecycle/stages';
import {TimeLapse} from '../../../../lifecycle/TimeLapse';
import {BubbleCurtain, breathe, cam, Cam, SceneOut, shot} from '../../../../studio2';
import {Toad, toadPose} from '../../character/Toad';
import {Elodea, PondBack, PondFront, Stone} from '../../environment/Pond';
import {edgeGround, edgeSlope, ShallowsBack, ShallowsFront} from '../../environment/Shallows';
import {swimAt} from '../../motion/swim';
import {BUFO_STAGES} from '../../species/bufoBufo';
import {seg, StageChip, Vignette, win} from '../components/shared';
import {EV, GROWTH} from '../data/timeline';

const X0 = 3311;
const STONE = {x: 3990, top: 200};
const CRAWL0 = 111.5;
const CX0 = 230;
const SPEED = 67;

export function scene5(t: number): SceneOut {
  const g = growthAt(GROWTH, t);
  const st = stageAt(BUFO_STAGES, g);
  const sz = st.size;
  if (t < EV.edge) {
    let x: number;
    let y: number;
    let angle = 0;
    let effort = 0.45;
    let fold = 0.2 + 0.6 * Math.max(0, Math.sin(t * 2.6)) ** 2; // patadas alternas con la cola
    if (t < 99.8) {
      x = X0 + (t - 95) * 95;
      y = 40 + Math.sin((t - 95) * 1.1) * 20;
      angle = Math.cos((t - 95) * 1.1) * 0.05;
    } else if (t < 101.4) {
      const u = seg(t, 99.8, 101.4);
      x = lerp(X0 + 4.8 * 95, STONE.x - 20, u);
      y = lerp(40 + Math.sin(4.8 * 1.1) * 20, STONE.top - 40 * sz, u);
      angle = 0.1 * Math.sin(u * Math.PI);
      effort = lerp(0.45, 0.1, u);
      fold = lerp(fold, 0.8, u);
    } else {
      x = STONE.x - 20;
      y = STONE.top - 40 * sz + Math.sin(t * 1.3) * 1.5;
      effort = 0.08;
      fold = 0.85;
    }
    const sw = swimAt(t, effort);
    const pose = toadPose({x, y, angle: angle + sw.bodyYaw * 0.5, t, swimPhase: sw.phase, swimAmp: sw.amp, fold, armReach: 0.1, breath: t > 101.4 ? 0.5 + 0.5 * Math.sin(t * 3) : 0, inWater: t < 101.4, look: t > 103 ? Math.sin(t * 0.6) * 0.6 : 0});
    let c: Cam = cam(x + 60, y - 30, 2.2);
    if (t >= 99.8) c = shot(t, 99.8, 102.5, cam(X0 + 4.8 * 95 + 60, 10, 2.2), cam(STONE.x, STONE.top - 40, 2.9), 'cine');
    if (t >= 102.5) c = cam(STONE.x + (t - 102.5) * 3, STONE.top - 40, 2.9 + (t - 102.5) * 0.04);
    c = breathe(c, t, 0.35);
    return {
      svg: (
        <PondBack cam={c} t={t}>
          {[3400, 3720, 4300, 4600].map((ex, i) => <Elodea key={ex} x={ex} base={300} h={600 + (i % 2) * 180} t={t} seed={i * 5.1 + 51} c={i % 2 ? '#2f6e3a' : '#3c8240'} />)}
          <Stone x={STONE.x} y={306} w={300} h={110} seed={53} c="#566656" moss={0.7} />
          <Toad uid="tad5" s={st} p={pose} />
        </PondBack>
      ),
      overlay: (
        <>
          <PondFront cam={c} t={t} />
          <Vignette kind="water" />
          <TimeLapse k={win(t, 101.2, 107)} label="días · tiempo condensado" spin={(t - 101) * 4} />
          <StageChip text={st.stage} k={win(t, 95.4, 107.2, 0.4)} />
          <BubbleCurtain u={(t - 106.4) / 1.2} />
        </>
      ),
    };
  }
  // ---- toma partida en la orilla
  let x: number;
  let y: number;
  let angle = 0;
  let pose;
  if (t < CRAWL0) {
    const u = seg(t, 107, CRAWL0);
    x = lerp(-560, CX0, u);
    y = lerp(330, edgeGround(CX0) - 46 * sz, u);
    angle = lerp(-0.1, edgeSlope(CX0), seg(t, CRAWL0 - 1.2, CRAWL0));
    const kick = Math.max(0, Math.sin((t - 107) * 3.2));
    pose = toadPose({x, y, angle, t, swimPhase: t * 8, swimAmp: 0.3, fold: lerp(0.9, 0.05, kick ** 0.7), armReach: 0.5 * kick, inWater: true});
  } else {
    const gx = CX0 + (t - CRAWL0) * SPEED;
    const a = edgeSlope(gx);
    const fo = 46 * sz;
    const phase = ((gx - CX0) / (70 * sz)) * Math.PI * 2;
    x = gx + Math.sin(a) * fo;
    y = edgeGround(gx) - Math.cos(a) * fo - 3 * Math.abs(Math.sin(phase)) * sz;
    angle = a;
    pose = toadPose({x, y, angle, t, swimAmp: 0, fold: 0.95, walk: 0.8, walkPhase: phase, breath: 0.4 + 0.3 * Math.sin(t * 4), inWater: false, look: 0.4});
  }
  const camY = clamp(y - 40, -140, 260);
  let c: Cam = shot(t, 107, 109, cam(-420, 260, 1.5), cam(x + 80, camY, 1.9), 'cine');
  if (t >= 109) c = cam(x + 80, camY, lerp(1.9, 2.4, seg(t, 109, 113)));
  c = breathe(c, t, 0.3);
  return {
    svg: (
      <ShallowsBack cam={c} t={t} ripple={{x: 560, t0: 115.6}}>
        <Toad uid="tad5e" s={st} p={pose} />
      </ShallowsBack>
    ),
    overlay: (
      <>
        <ShallowsFront cam={c} t={t} />
        <Vignette kind="forest" k={0.85} />
        <BubbleCurtain u={(t - 106.4) / 1.2} />
        <StageChip text={t < 115.8 ? 'cola casi reabsorbida' : 'sapo joven'} k={win(t, 108, 119.6, 0.4)} />
      </>
    ),
  };
}
