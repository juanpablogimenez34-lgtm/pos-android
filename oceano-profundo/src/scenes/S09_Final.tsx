// ESCENA 09 — FINAL CINEMATOGRÁFICO (570–600 s).
//  570–585 montaje fluido de los protagonistas (pescador, víbora, calamar gigante, cachalote, calamar colosal).
//  585–600 la cámara asciende hacia aguas iluminadas; composición limpia con espacio para la pantalla final
//          de YouTube (zona central y laterales libres durante los últimos 15 s).
import {anglerPose, Anglerfish, AnglerGlow} from '../animals/Anglerfish';
import {ColossalSquid} from '../animals/ColossalSquid';
import {GiantSquid} from '../animals/GiantSquid';
import {SpermWhale} from '../animals/SpermWhale';
import {Viperfish} from '../animals/Viperfish';
import {breathe, cam, shot} from '../camera/camera';
import {Title, win} from '../components/UI';
import {Glow} from '../effects/Effects';
import {Ocean} from '../environment/Ocean';
import {clamp, lerp} from '../utils/math';
import {cuts, SceneFn} from './common';

const angler: SceneFn = (t) => {
  const p = anglerPose({t, x: 0, y: 0, scale: 1.5, facing: 1, pitch: 0, yaw: 0, jaw: 0.2, lureSway: 1, lureJig: 0.2, glow: 1, finRate: 1.3, gulp: 0});
  const c = breathe(shot(t, 569, 573.6, cam(140, -40, 1.6), cam(60, -20, 1.3), 'linear'), t, 0.3);
  return {svg: <Ocean cam={c} t={t} depth={1500} snow={0.7}><Glow id="f9a" x={60} y={-120} r={420} color="#3a7ab8" k={0.45} /><Anglerfish id="f9a" pose={p} light={0.9} /><AnglerGlow id="f9a" pose={p} zoom={c.zoom} /></Ocean>, grade: {vignette: 0.85}};
};
const viper: SceneFn = (t) => {
  const c = breathe(shot(t, 573, 576.6, cam(-100, 0, 1.2), cam(150, 0, 1.2), 'linear'), t, 0.3);
  return {svg: <Ocean cam={c} t={t} depth={1100} snow={0.8}><Glow id="f9v" x={0} y={-100} r={600} color="#2a6aa8" k={0.35} /><Viperfish uid="f9v" pose={{t, phase: t * 7, amp: 0.9, glow: 0.9, rim: 0.5}} x={lerp(-100, 300, (t - 573) / 4)} y={0} scale={1.2} /></Ocean>, grade: {vignette: 0.85}};
};
const giant: SceneFn = (t) => {
  const c = breathe(shot(t, 576, 579.6, cam(0, -10, 0.9), cam(-60, -20, 1.2), 'linear'), t, 0.3);
  return {svg: <Ocean cam={c} t={t} depth={700} snow={0.9}><Glow id="f9g" x={0} y={-200} r={800} color="#2a6aa8" k={0.35} /><GiantSquid uid="f9g" pose={{t, pulse: 0.2 + 0.2 * Math.sin(t * 2), spread: 0.3, wave: 0.7, rim: 0.5}} x={lerp(100, -100, (t - 576) / 4)} y={0} scale={0.9} /></Ocean>, grade: {vignette: 0.85}};
};
const whale: SceneFn = (t) => {
  const c = breathe(cam(-200, 0, 0.6), t, 0.3);
  return {svg: <Ocean cam={c} t={t} depth={500} snow={1}><SpermWhale uid="f9w" pose={{t, phase: t * 1.4, amp: 0.8, rim: 0.6, tone: 0.2}} x={lerp(-200, 500, (t - 579) / 4)} y={0} scale={0.8} /></Ocean>, grade: {vignette: 0.8}};
};
const colossal: SceneFn = (t) => {
  const c = breathe(shot(t, 582, 585.6, cam(60, 0, 1.0), cam(0, 0, 0.8), 'linear'), t, 0.3);
  return {svg: <Ocean cam={c} t={t} depth={1600} snow={1} tint="#7ad8e8" tintK={0.3}><Glow id="f9c" x={-100} y={-200} r={800} color="#3a8ab8" k={0.4} /><ColossalSquid uid="f9c" pose={{t, spread: 0.45, drift: 0.6, rim: 0.5}} x={0} y={0} scale={0.95} /></Ocean>, grade: {vignette: 0.85}};
};
/** Ascenso hacia la luz: el agua se aclara, los rayos aparecen; silueta lejana del cachalote cerca de la superficie. */
const ascent: SceneFn = (t) => {
  const u = clamp((t - 585) / 12);
  const depth = lerp(600, 25, u * (2 - u));
  const c = breathe(cam(0, lerp(1200, -150, u * (2 - u)), 0.7), t, 0.4);
  return {
    depth,
    svg: (
      <Ocean cam={c} t={t} depth={depth} surfaceY={-760} snow={0.8} schools={u} warp={u}>
        <g opacity={0.55 * u}>
          <SpermWhale uid="f9s" pose={{t, phase: t * 1.0, amp: 0.6, tone: 0.85}} x={lerp(-2400, -900, u)} y={-560} scale={0.6} />
        </g>
      </Ocean>
    ),
    overlay: <Title k={win(t, 586.2, 592.2, 0.8)} lines={['¿QUÉ OTRAS CRIATURAS', 'ESPERAN SER DESCUBIERTAS?']} size={64} top={150} />,
    grade: {vignette: 0.55},
  };
};

export const scene09: SceneFn = cuts([
  [569, angler],
  [573, viper],
  [576, giant],
  [579, whale],
  [582, colossal],
  [585, ascent],
], 0.7);
