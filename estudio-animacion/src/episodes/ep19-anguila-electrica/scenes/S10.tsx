// ESCENA 10 (135–150 s) · LA DEFENSA ELÉCTRICA: un pez grande se acerca; la anguila se gira hacia él y
// adopta una postura defensiva (cuerpo curvado, cabeza alzada hacia la amenaza); emite una descarga
// (visualización) y el intruso se sobresalta y se aleja. No se inventa un ataque imposible.
import {lerp} from '../../../engine/math';
import {breathe, cam, Cam, SceneOut, shot} from '../../../studio2';
import {Predator} from '../../ep18-mixino/character/Predator';
import {bodyOnPath, makePath, P3, smoothPts} from '../../ep18-mixino/motion/path';
import {ElectricEel} from '../character/ElectricEel';
import {paramsAt, Track} from '../character/states';
import {Brand, seg, Vignette, win} from '../components/common';
import {EEL, EV} from '../data/timeline';
import {PulseFronts, VisualTag} from '../effects/Electric';
import {RiverBack, RiverFront, Trunk, Weed} from '../environment/River';

// trayectoria relajada (horizontal) y defensiva (curvada, cabeza alzada hacia la derecha)
const CALM: P3[] = [{x: -1100, y: 380}, {x: -800, y: 360}, {x: -500, y: 380}, {x: -200, y: 360}, {x: 100, y: 370}, {x: 380, y: 350}];
const DEF: P3[] = [{x: -900, y: 470}, {x: -700, y: 330}, {x: -420, y: 440}, {x: -180, y: 300}, {x: 40, y: 250}, {x: 260, y: 160}];
const TRACK: Track = [[135, 'IDLE_HOVER'], [139.2, 'DEFENSIVE_DISPLAY'], [EV.defense, 'HIGH_VOLTAGE_ATTACK'], [143.6, 'DEFENSIVE_DISPLAY'], [146.5, 'RETREAT'], [148.5, 'IDLE_HOVER']];

export function scene10(t: number): SceneOut {
  const p = paramsAt(TRACK, t);
  const arch = seg(t, 138.8, 140.6) * (1 - seg(t, 146, 148.5));
  const ctrl = CALM.map((a, i) => ({x: lerp(a.x, DEF[i].x, arch), y: lerp(a.y, DEF[i].y, arch)}));
  const path = makePath(smoothPts(ctrl, 16));
  const back = Math.max(0, t - 146.5) * 30;
  const sp = bodyOnPath(path, path.total + 40 - back, EEL.len, EEL.n, {amp: p.bodyAmp, waves: 1.1, phase: t * 3});
  const head = sp[0];
  // amenaza: entra por la derecha (mira a la izquierda), se acerca, se sobresalta y se va
  const app = seg(t, 135, EV.defense);
  const flee = seg(t, EV.defense + 0.4, 149);
  const thx = lerp(1500, 760, app) + flee * 900;
  const thy = lerp(-150, 120, app) - flee * 420;
  const fin = t * p.fin * Math.PI * 2;
  let c: Cam = shot(t, 135, 139, cam(500, 120, 0.85), cam(250, 200, 1.05), 'inOut');
  if (t >= 139) c = shot(t, 139, EV.defense, cam(250, 200, 1.05), cam(head.x + 140, head.y - 60, 1.45), 'cine');
  if (t >= EV.defense) c = shot(t, EV.defense, 150, cam(head.x + 140, head.y - 60, 1.45), cam(head.x + 260, head.y - 140, 1.1), 'cine');
  c = breathe(c, t, 0.3);
  const target = {x: thx - 200, y: thy + 30};
  return {
    svg: (
      <RiverBack cam={c} t={t} murk={0.45}>
        <Trunk x={-1300} y={560} len={800} ang={-0.35} w={80} c="#241e14" />
        <Weed x={600} base={560} h={360} t={t} seed={51} c="#2e5a2a" />
        <ElectricEel uid="e10" spine={sp} look={{t, finPhase: fin, finAmp: p.finAmp, mouth: p.mouth, volt: p.volt * win(t, EV.defense, EV.defense + 1, 0.1), eye: 1}} />
        <Predator uid="th" p={{x: thx, y: thy, scale: 2.1, dir: -1, angle: lerp(0.1, -0.15, flee), t, beat: 1 + flee, mouth: 0.15 + 0.4 * win(t, EV.defense, EV.defense + 1.5, 0.2), gill: 0.4, shake: win(t, EV.defense + 0.1, EV.defense + 1.8, 0.2)}} />
        <PulseFronts spine={sp} t={t} t0={EV.defense} dur={1.0} rate={16} aim={target} reach={620} />
      </RiverBack>
    ),
    overlay: (
      <>
        <RiverFront cam={c} t={t} murk={0.45} />
        <Vignette />
        <VisualTag k={win(t, EV.defense, EV.defense + 2.2, 0.3)} text="VISUALIZACIÓN CIENTÍFICA · DESCARGA DEFENSIVA" />
        <Brand />
      </>
    ),
  };
}
