// ESCENA 01 — EL GANCHO (0–30 s).
//  0–12   bajo el agua, una silueta enorme aparece detrás de la nieve marina; la cámara se acerca y la criatura se
//         hunde en la oscuridad (cachalote en contraluz, sin revelar todavía).
//  12–15  «ojos gigantescos»: primerísimo plano del ojo del calamar gigante.
//  15–18  «producen su propia luz»: el señuelo del pez pescador en la negrura.
//  18–23  «enfrentarse a los mayores depredadores»: siluetas del cachalote y el calamar, con clics ilustrativos.
//  23–30  cerca de la superficie: título del documental y comienzo del descenso.
import {anglerPose, Anglerfish, AnglerGlow} from '../animals/Anglerfish';
import {GiantSquid} from '../animals/GiantSquid';
import {Jellyfish} from '../animals/Fauna';
import {SpermWhale} from '../animals/SpermWhale';
import {breathe, cam, shot, track} from '../camera/camera';
import {Title, win} from '../components/UI';
import {EchoWaves, Glow} from '../effects/Effects';
import {Ocean} from '../environment/Ocean';
import {clamp, lerp} from '../utils/math';
import {along} from '../utils/motion';
import {cuts, SceneFn} from './common';

const silhouette: SceneFn = (t) => {
  const m = along([[0, -700, 140], [7, 200, 60], [11.5, 1000, 380]], t);
  const ang = Math.atan2(m.vy, m.vx) * 0.6;
  const c = breathe(shot(t, 0, 12, cam(-420, 80, 0.6), cam(260, 200, 0.95), 'inOut'), t, 0.6);
  const fade = clamp((t - 8.5) / 3);
  return {
    depth: 450,
    svg: (
      <Ocean cam={c} t={t} depth={450} snow={1.8} current={10} schools={0.4}>
        {/* claridad lejana detrás de la silueta (contraluz) */}
        <Glow id="s1bk" x={0} y={-700} r={2600} color="#2a6a9a" k={0.45} />
        <g opacity={1 - fade * 0.85}>
          <SpermWhale uid="s1w" pose={{t, phase: t * 1.1, amp: 0.7, tone: 0.92, flip: 0.3, rim: 0.35}} x={m.x} y={m.y} scale={1.0} angle={ang} />
        </g>
      </Ocean>
    ),
    grade: {vignette: 0.85},
  };
};

const eye: SceneFn = (t) => {
  const c = shot(t, 11.8, 15.6, cam(-40, -18, 3.6), cam(-30, -20, 5.2), 'linear');
  return {
    depth: 600,
    svg: (
      <Ocean cam={c} t={t} depth={600} snow={0.9}>
        <Glow id="s1eg" x={-26} y={-18} r={260} color="#4a8ad8" k={0.35} />
        <GiantSquid uid="s1e" pose={{t, pulse: 0.2 + 0.1 * Math.sin(t), wave: 0.4, look: {x: 300 + Math.sin(t * 0.8) * 200, y: -60}, rim: 0.4, tone: 0.15}} x={0} y={0} scale={1} />
      </Ocean>
    ),
    grade: {vignette: 0.9},
  };
};

const lure: SceneFn = (t) => {
  const p = anglerPose({t, x: 0, y: 0, scale: 1.4, facing: -1, pitch: 0.05, yaw: 0, jaw: 0.15, lureSway: 1.2, lureJig: 0.4, glow: 1, finRate: 1.2, gulp: 0});
  const e = p.escaWorld;
  const c = shot(t, 15, 18.2, cam(e.x + 30, e.y + 10, 2.6), cam(e.x + 60, e.y + 40, 1.9), 'cine');
  return {
    depth: 1500,
    svg: (
      <Ocean cam={c} t={t} depth={1500} snow={0.6}>
        <g opacity={0.55}>
          <Anglerfish id="s1a" pose={p} light={0.25} />
        </g>
        <AnglerGlow id="s1a" pose={p} zoom={c.zoom} />
      </Ocean>
    ),
    grade: {vignette: 0.95},
  };
};

const predators: SceneFn = (t) => {
  const w = along([[17.5, -900, -160], [23.5, 500, 60]], t);
  const sq = along([[17.5, 500, 100], [20.5, 560, 110], [23.5, 1500, 260]], t);
  const flee = clamp((t - 20.3) / 0.8);
  const c = breathe(shot(t, 17.5, 23.5, cam(-150, 20, 0.6), cam(350, 80, 0.66), 'inOut'), t, 1);
  const head = {x: w.x, y: w.y - 40};
  return {
    depth: 900,
    svg: (
      <Ocean cam={c} t={t} depth={900} snow={1.3} specks={0.8} stir={[head]} stirR={500}>
        <SpermWhale uid="s1p" pose={{t, phase: t * 1.6, amp: 0.9, tone: 0.75, rim: 0.4, jaw: 0.1}} x={w.x} y={w.y} scale={0.9} />
        <EchoWaves t={t} origin={head} dir={1} clicks={[18.0, 18.6, 19.1, 19.5, 19.85, 20.1, 20.3, 20.45, 20.6]} target={sq} speed={1800} maxR={2200} k={0.8} />
        <GiantSquid uid="s1q" pose={{t, pulse: flee * (0.5 + 0.5 * Math.sin(t * 6)), spread: 0.6 - flee * 0.5, wave: 0.8, jet: flee, siphon: 1, tone: 0.55, rim: 0.4}} x={sq.x} y={sq.y} scale={0.75} dir={-1} />
      </Ocean>
    ),
    grade: {vignette: 0.85},
  };
};

const title: SceneFn = (t) => {
  const c = breathe(shot(t, 22.6, 30, cam(0, -220, 0.9), cam(40, 260, 1.0), 'inOut'), t, 0.6);
  return {
    depth: lerp(8, 45, clamp((t - 23) / 7)),
    svg: (
      <Ocean cam={c} t={t} depth={lerp(8, 45, clamp((t - 23) / 7))} surfaceY={-640} snow={0.7} schools={0.8} warp={0.8}>
        <Jellyfish x={-520} y={120 - (t - 23) * 6} s={0.9} t={t} hue="#cfe0ff" glow={0.2} seed={2} />
        <Jellyfish x={560} y={380 - (t - 23) * 4} s={0.6} t={t + 1} hue="#e0d0ff" glow={0.2} seed={5} />
      </Ocean>
    ),
    overlay: (
      <>
        <Title k={win(t, 24.2, 29.6, 0.6)} lines={['LOS MONSTRUOS REALES', 'DE LAS PROFUNDIDADES']} top={330} size={92} />
        <Title k={win(t, 25.0, 29.6, 0.6) * 0.9} lines={['DEL OCÉANO']} top={555} size={46} color="#9fe0ff" />
      </>
    ),
    grade: {vignette: 0.6},
  };
};

export const scene01: SceneFn = cuts([
  [0, silhouette],
  [12.4, eye],
  [15.4, lure],
  [18.0, predators],
  [23.2, title],
], 0.5);
export const _track = track;
