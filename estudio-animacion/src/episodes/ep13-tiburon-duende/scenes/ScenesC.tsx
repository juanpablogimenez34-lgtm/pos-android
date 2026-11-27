// ESCENAS 9–12 (120–180 s · fotogramas 3600–5399).
import {AbsoluteFill} from 'remotion';
import {clamp, lerp} from '../../../engine/math';
import {Grade, ScreenRays, SubjectLight} from '../../ep10-camaron-mantis/lighting/Lighting';
import {Caption} from '../../ep10-camaron-mantis/sequences/common';
import {Question} from '../../ep11-dragon-azul/scenes/common';
import {breathe, cam, Dim0, SceneOut, shot, toScreen} from './shared';
import {glide, swim} from '../animation/JawMotion';
import {GoblinShark, sharkPoint, sharkPose} from '../character/GoblinShark';
import {ChannelEnd} from '../credits/Credits';
import {EV, SS} from '../config/episode';
import {DeepSea} from '../environment/DeepSea';
import {Lineage, SizeChart} from '../science/Science';

const win = (t: number, a: number, b: number, r = 0.4) => clamp((t - a) / r) * clamp((b - t) / r);

/** ESCENA 9 · ¿ES PELIGROSO PARA LOS HUMANOS? (120–136 s). Primer plano de los dientes; la cámara
 *  retrocede y revela el animal entero; comparación de tamaño con una persona. */
export function scene09(t: number): SceneOut {
  const p = sharkPose({...swim(t, 0.6), x: glide(t, 120, 136, -60, 140), y: 0, scale: SS, open: 0.32 * clamp((126 - t) / 1.2), exposure: 0.85, rim: 0.8});
  const teeth = sharkPoint(p, 196, 28);
  let c = shot(t, 120, 124.6, cam(teeth.x, teeth.y, 4.2), cam(teeth.x - 10, teeth.y, 4.4), 'linear');
  if (t > 124.6) c = shot(t, 124.6, 129.6, cam(teeth.x - 10, teeth.y, 4.4), cam(p.x - 20, -60, 1.25), 'cine');
  if (t > 129.6) c = shot(t, 129.6, 136, cam(p.x - 20, -60, 1.25), cam(p.x - 10, -200, 1.0), 'linear');
  c = breathe(c, t, 0.5);
  const chart = win(t, 129.8, 135.6, 0.6);
  return {
    svg: <DeepSea cam={c} t={t} d={0.85} fish={0.3}>{<GoblinShark uid="s9" p={p} />}</DeepSea>,
    overlay: (
      <>
        <SubjectLight x={toScreen(c, teeth.x, teeth.y).x} y={toScreen(c, teeth.x, teeth.y).y} r={600} k={0.5} color="rgba(255,200,215,0.2)" />
        <Grade depth={0.75} vignette={0.9} />
        <Question text="¿Es peligroso?" k={win(t, 120.2, 123.4, 0.4)} top={250} />
        <Caption text="No es una amenaza habitual para las personas" k={win(t, 124.0, 129.4, 0.4)} top={190} size={34} />
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <SizeChart k={chart} t={t} />
          </svg>
        </AbsoluteFill>
      </>
    ),
  };
}

/** ESCENA 10 · UN LINAJE ANTIGUO (136–152 s). El tiburón nada al fondo, atenuado; línea temporal con
 *  siluetas de parientes antiguos y la aclaración de que la especie actual no es idéntica. */
export function scene10(t: number): SceneOut {
  const p = sharkPose({...swim(t, 0.7), x: glide(t, 136, 152, -600, 500), y: -260, scale: SS * 0.9, exposure: 0.5, rim: 0.6});
  const c = breathe(cam(0, -120, 0.85), t, 0.6);
  const k = win(t, 136.5, 151.6, 0.7);
  return {
    svg: <DeepSea cam={c} t={t} d={0.88} fish={0.3}>{<GoblinShark uid="s10" p={p} />}</DeepSea>,
    overlay: (
      <>
        <Grade depth={0.8} vignette={0.85} />
        <Dim0 k={k * 0.4} />
        <Question text="¿Viene de otros tiempos?" k={win(t, 136.2, 139.4, 0.4)} top={250} />
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <Lineage u={clamp((t - 137.2) / 11)} t={t} k={k} />
          </svg>
        </AbsoluteFill>
      </>
    ),
  };
}

/** ESCENA 11 · EL MISTERIO CONTINÚA (152–168 s). Nada hacia la oscuridad; la cámara lo sigue despacio;
 *  luz lejana y partículas. */
export function scene11(t: number): SceneOut {
  const x = glide(t, 152, 168, -300, 900);
  const p = sharkPose({...swim(t, 0.7), x, y: lerp(0, 140, clamp((t - 152) / 16)), scale: SS * lerp(1, 0.8, clamp((t - 152) / 16)), exposure: lerp(0.85, 0.35, clamp((t - 152) / 16)), rim: 0.7, yaw: lerp(0.1, 0.55, clamp((t - 152) / 16))});
  const c = breathe(shot(t, 152, 168, cam(x - 150, 0, 1.35), cam(x - 260, 60, 1.05), 'linear'), t, 0.6);
  const lightK = clamp((t - 158) / 3);
  const ls = toScreen(c, x + 700, -220);
  return {
    svg: <DeepSea cam={c} t={t} d={0.95} fish={0.2} lights={1.2}>{<GoblinShark uid="s11" p={p} />}</DeepSea>,
    overlay: (
      <>
        <SubjectLight x={ls.x} y={ls.y} r={520} k={lightK * 0.8} color="rgba(120,220,255,0.35)" />
        <Grade depth={0.9} vignette={0.9} />
      </>
    ),
  };
}

/** ESCENA 12 · FINAL CINEMATOGRÁFICO (168–180 s). El tiburón se aleja y desaparece en la oscuridad;
 *  queda la silueta del océano; logotipo y lema. */
export function scene12(t: number): SceneOut {
  const u = clamp((t - 168) / 6.5);
  const p = sharkPose({...swim(t, 0.6), x: lerp(200, 520, u), y: lerp(120, 40, u), scale: SS * lerp(0.8, 0.22, u), exposure: lerp(0.4, 0.0, u), rim: lerp(0.6, 0, u), opacity: 1 - clamp((t - 173.2) / 1.2)});
  const c = breathe(shot(t, 168, 180, cam(260, 40, 1.05), cam(300, -900, 0.6), 'cine'), t, 0.5);
  const logo = clamp((t - EV.logo) / 0.8);
  const tag = clamp((t - EV.tagline) / 0.6);
  const fade = clamp((t - EV.fade[0]) / (EV.fade[1] - EV.fade[0]));
  return {
    svg: <DeepSea cam={c} t={t} d={lerp(0.95, 0.6, clamp((t - 172) / 8))} fish={0.3}>{<GoblinShark uid="s12" p={p} />}</DeepSea>,
    overlay: (
      <>
        <ScreenRays t={t} k={clamp((t - 172) / 4) * 0.5} />
        <Grade depth={0.7} vignette={0.85} dark={logo * 0.45 + fade} />
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <ChannelEnd k={logo * (1 - fade)} t={t} tagline={tag} />
          </svg>
        </AbsoluteFill>
      </>
    ),
  };
}
