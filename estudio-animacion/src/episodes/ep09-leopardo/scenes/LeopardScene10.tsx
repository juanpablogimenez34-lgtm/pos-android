// ESCENA 10 (135–150 s) — MAESTRO DE LA ADAPTACIÓN. El leopardo camina sin pausa mientras el paisaje
// cambia con barridos continuos: selva tropical → sabana → montaña → región árida.
import {lerp} from '../../../engine/math';
import {advance, walk, WALK} from '../animation/LeopardMotion';
import {Cam, drift, layerT} from '../animation/CameraSystem';
import {leopardPose} from '../animation/LeopardRig';
import {Dust} from '../animation/ParticleSystem';
import {Leopard} from '../characters/Leopard';
import {JungleBack, JungleGround} from '../environments/Jungle';
import {Arid, Mountains} from '../environments/Landscapes';
import {Grass, SavannahBack} from '../environments/Savannah';
import {Caption, Grade, SceneOut, seg, win} from './common';

const CUTS = [139.4, 143.0, 146.6];
const GROUND = ['#4a5a2a', '#b88a50', '#7a7a66', '#d8a070'];

export function scene10(t: number): SceneOut {
  const cyc = (t - 135) / WALK.period;
  const x = cyc * advance(WALK);
  const p = leopardPose({x, y: 40, scale: 1.1, t, ...walk(t, cyc, 10)});
  const cam: Cam = drift({x: x + 60, y: -200, zoom: 1.5, roll: 0}, t, 1);
  const bg = (i: number) => {
    if (i === 0) return <JungleBack cam={cam} t={t} night={0} />;
    if (i === 1) return <SavannahBack cam={cam} t={t} hour={0.4} />;
    if (i === 2) return <Mountains cam={cam} t={t} />;
    return <Arid cam={cam} t={t} />;
  };
  const idx = t < CUTS[0] ? 0 : t < CUTS[1] ? 1 : t < CUTS[2] ? 2 : 3;
  // barrido: el siguiente paisaje entra desde la derecha durante 0,8 s alrededor de cada corte
  const next = Math.min(3, idx + 1);
  const wipe = idx < 3 ? seg(t, CUTS[idx] - 0.8, CUTS[idx]) : 0;
  const wx = lerp(1080, 0, wipe);
  return {
    svg: (
      <g>
        <defs>
          <clipPath id="w10">
            <rect x={wx} y={0} width={1080} height={1920} />
          </clipPath>
        </defs>
        {bg(idx)}
        {wipe > 0.001 && <g clipPath="url(#w10)">{bg(next)}</g>}
        <g transform={layerT(cam, 1)}>
          <rect x={-4000} y={-4} width={8000} height={1600} fill={GROUND[idx]} />
        </g>
        {idx === 0 && <JungleGround cam={cam} t={t} night={0} />}
        {idx === 1 && <Grass cam={cam} t={t} hour={0.4} d={1} y={0} n={150} h={80} partX={p.x} partK={0.8} seed={14} />}
        <g transform={layerT(cam, 1)}>
          <Leopard uid="l10" p={p} />
        </g>
        <Dust cam={cam} t={t} n={28} color="#fff4d8" />
        {wipe > 0.001 && <rect x={wx - 6} y={0} width={12} height={1920} fill="#fff6dc" opacity={0.5} />}
      </g>
    ),
    overlay: (
      <>
        <Grade warm={0.6} vignette={0.85} />
        <Caption text={['Selva tropical', 'Sabana', 'Montaña', 'Región árida'][idx]} sub="África · Asia" k={win(t, idx === 0 ? 135.4 : CUTS[idx - 1], idx < 3 ? CUTS[idx] - 0.4 : 149.8, 0.3)} top={250} />
      </>
    ),
  };
}
