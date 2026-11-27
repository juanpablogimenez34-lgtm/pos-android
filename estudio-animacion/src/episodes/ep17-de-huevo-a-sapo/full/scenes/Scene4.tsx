// ESCENA 4 (70–95 s) · COMIENZA LA TRANSFORMACIÓN
//  70–76 transición temporal (semanas): el renacuajo crece mientras raspa algas del sedimento.
//  76–84 aparecen progresivamente las patas posteriores (encuadre en la cadera).
//  84–90 se desarrollan y emergen las patas anteriores (encuadre en el hombro).
//  90–95 la anatomía cambia: cabeza más ancha, boca y ojos de sapo; la cámara se abre.
import {hash1, lerp} from '../../../../engine/math';
import {growthAt, stageAt} from '../../../../lifecycle/stages';
import {TimeLapse} from '../../../../lifecycle/TimeLapse';
import {breathe, cam, Cam, SceneOut, shot} from '../../../../studio2';
import {Toad, toadPose} from '../../character/Toad';
import {Elodea, PondBack, PondFront, Stone} from '../../environment/Pond';
import {swimAt} from '../../motion/swim';
import {BUFO_STAGES} from '../../species/bufoBufo';
import {seg, StageChip, Vignette, win} from '../components/shared';
import {GROWTH} from '../data/timeline';

const X0 = 1675;
const Y0 = -40;

export function tadpole4(t: number, size: number) {
  const floorY = 300 - 30 * size;
  if (t < 71.6) {
    const u = seg(t, 70, 71.6);
    return {x: X0 + (t - 70) * 60, y: lerp(Y0, floorY, u), angle: 0.55 * u, effort: 0.6, graze: 0};
  }
  if (t < 76) {
    const peck = Math.max(0, Math.sin((t - 71.6) * 4.2)) ** 3;
    return {x: X0 + 96 + (t - 71.6) * 28, y: floorY + peck * 4, angle: 0.5 + peck * 0.08, effort: 0.25 + 0.2 * peck, graze: peck};
  }
  const xs = X0 + 96 + 4.4 * 28;
  if (t < 77.6) {
    const u = seg(t, 76, 77.6);
    return {x: xs + (t - 76) * 70, y: lerp(floorY, 40, u), angle: lerp(0.5, -0.15, u), effort: 0.65, graze: 0};
  }
  const x1 = xs + 1.6 * 70;
  return {x: x1 + (t - 77.6) * 75, y: 40 + Math.sin((t - 77.6) * 0.9) * 30, angle: Math.cos((t - 77.6) * 0.9) * 0.06, effort: lerp(0.55, 0.4, seg(t, 84, 95)), graze: 0};
}

export function scene4(t: number): SceneOut {
  const g = growthAt(GROWTH, t);
  const st = stageAt(BUFO_STAGES, g);
  const tp = tadpole4(t, st.size);
  const sw = swimAt(t, tp.effort);
  const kickLegs = g > 0.55 ? 0.25 + 0.25 * Math.max(0, Math.sin(t * 3)) : 0.12;
  const pose = toadPose({x: tp.x, y: tp.y, angle: tp.angle + sw.bodyYaw, t, swimPhase: sw.phase, swimAmp: sw.amp, fold: kickLegs, armReach: 0.15, inWater: true});
  const hip = {x: tp.x - 45 * st.size, y: tp.y + 14 * st.size};
  const sh = {x: tp.x + 40 * st.size, y: tp.y + 18 * st.size};
  let c: Cam = shot(t, 70, 72, cam(X0 + 60, Y0, 2.0), cam(tp.x + 30, tp.y - 110, 2.3), 'cine');
  if (t >= 72) c = cam(tp.x + 30, tp.y - 110, 2.3);
  if (t >= 76) c = shot(t, 76, 78.5, cam(tadpole4(76, st.size).x + 30, tadpole4(76, st.size).y - 110, 2.3), cam(hip.x, hip.y, 3.4), 'cine');
  if (t >= 78.5) c = cam(hip.x, hip.y, 3.4);
  if (t >= 83.4) c = shot(t, 83.4, 85.2, cam(hip.x, hip.y, 3.4), cam(sh.x, sh.y, 3.6), 'cine');
  if (t >= 85.2) c = cam(sh.x, sh.y, 3.6);
  if (t >= 89.6) c = shot(t, 89.6, 93, cam(sh.x, sh.y, 3.6), cam(tp.x + 10, tp.y - 30, 2.0), 'cine');
  c = breathe(c, t, 0.35);
  // nubecillas de sedimento al raspar
  const puffs = t > 71.6 && t < 76.6
    ? Array.from({length: 6}, (_, i) => {
        const a = ((t - 71.6) * 4.2 / Math.PI + i / 6) % 1;
        return {x: tp.x + 60 * st.size + (hash1(i) - 0.5) * 30 + a * 20, y: 300 - a * 40, r: 3 + a * 12, o: 0.35 * (1 - a)};
      })
    : [];
  return {
    svg: (
      <PondBack cam={c} t={t}>
        {[1500, 1820, 2150, 2480, 2820, 3150].map((x, i) => <Elodea key={x} x={x} base={300} h={560 + (i % 3) * 150} t={t} seed={i * 3.7 + 31} c={i % 2 ? '#2f6e3a' : '#3c8240'} />)}
        <Stone x={1980} y={306} w={220} h={80} seed={41} c="#526252" />
        <Stone x={2600} y={306} w={280} h={100} seed={43} />
        {puffs.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#c8b888" opacity={p.o} />)}
        <Toad uid="tad4" s={st} p={pose} />
      </PondBack>
    ),
    overlay: (
      <>
        <PondFront cam={c} t={t} />
        <Vignette kind="water" />
        <TimeLapse k={win(t, 70.3, 94.6)} label="semanas · tiempo condensado" spin={(t - 70) * 2.5} />
        <StageChip text={t < 76 ? 'renacuajo en crecimiento' : st.stage} k={win(t, 70.6, 94.8, 0.4)} />
      </>
    ),
  };
}
