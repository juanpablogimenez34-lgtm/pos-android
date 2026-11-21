// ESCENAS 9–12 (120–180 s · fotogramas 3600–5399).
import {AbsoluteFill} from 'remotion';
import {clamp, lerp} from '../../../engine/math';
import {camAt, drift as camDrift, toScreen} from '../../ep10-camaron-mantis/camera/CameraSystem';
import {Dim, Grade, ScreenRays, SubjectLight} from '../../ep10-camaron-mantis/lighting/Lighting';
import {depart, float, onWave, pair} from '../animation/DragonMotion';
import {BlueDragon, dragonPoint, dragonPose} from '../character/BlueDragon';
import {EggString} from '../character/Organisms';
import {DAY, mixPal, SUNSET, SurfaceSplit, TopOcean, waveY} from '../environment/Ocean';
import {CerataCutaway, ChannelLogo} from '../science/Science';
import {EV} from '../config/episode';
import {BigTitle, Caption, Question, SceneOut, seg, win} from './common';


/** ESCENA 9 · UNA ANATOMÍA EXTRAORDINARIA (120–135 s · f 3600–4049). Primerísimo plano de un abanico
 *  de ceratas con rotación de cámara; corte anatómico: rama digestiva y cnidosaco. */
export function scene09(t: number): SceneOut {
  const p = dragonPose({...float(t), heading: 0.3, shine: 0.9});
  const c = dragonPoint(p, 70, 110);
  const cam = camDrift(camAt([[120, c.x - 120, c.y - 60, 2.2, -0.3], [125, c.x, c.y, 4.6, 0.15], [135, c.x + 10, c.y + 10, 5.0, 0.3]], t), t, 0.4);
  const sci = win(t, 125.2, 134.7, 0.6);
  return {
    svg: (
      <TopOcean cam={cam} t={t} pal={DAY} foam={0.3}>
        <BlueDragon uid="d9" p={p} />
      </TopOcean>
    ),
    overlay: (
      <>
        <Grade depth={0.35} vignette={0.85} />
        <Question text="¿Alas para volar?" k={win(t, 120.2, 123.8, 0.4)} top={250} />
        <Dim k={sci * 0.7} />
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <CerataCutaway t={t} k={sci} u={seg(t, 125.4, 131.8)} />
          </svg>
        </AbsoluteFill>
      </>
    ),
  };
}

/** ESCENA 10 · LA VIDA EN MINIATURA (135–150 s · f 4050–4499). Dos dragones azules se acercan, se
 *  alinean costado con costado y, después, aparecen cadenas de huevos a la deriva. */
export function scene10(t: number): SceneOut {
  const a = pair(t, 135.2, 142.5, -1);
  const b = pair(t, 135.2, 142.5, 1);
  const p1 = dragonPose({...float(t), ...a});
  const p2 = dragonPose({...float(t, 2.1), ...b});
  const meet = win(t, 142.4, 147, 0.8);
  const cam = camDrift(camAt([[135, 0, 0, 0.8, 0], [142.5, 0, -10, 1.3, -0.1], [150, 30, 40, 1.15, -0.15]], t), t, 0.5);
  const eggs = seg(t, 145.2, 149.4);
  const c = toScreen(cam, 0, -40);
  return {
    svg: (
      <TopOcean cam={cam} t={t} pal={DAY} foam={0.5}>
        <BlueDragon uid="d10a" p={p1} />
        <BlueDragon uid="d10b" p={p2} />
        {eggs > 0.01 && [0, 1, 2, 3].map((i) => <EggString key={i} x={-260 + i * 170} y={110 + (i % 2) * 60 + (t - 145) * 6} s={1.2} t={t} seed={i + 1} k={eggs} />)}
      </TopOcean>
    ),
    overlay: (
      <>
        <SubjectLight x={c.x} y={c.y} r={480} k={meet * 0.6} color="rgba(160,200,255,0.3)" />
        <Grade depth={0.3} vignette={0.75} />
        <Question text="¿Macho o hembra?" k={win(t, 135.2, 138.0, 0.4)} top={250} />
        <Caption text="Hermafroditas" sub="órganos masculinos y femeninos en cada individuo" k={win(t, 138.2, 142.0, 0.4)} top={190} />
        <Caption text="Aun así, necesitan aparearse" sub="y después ponen cadenas de huevos" k={win(t, 142.6, 148.2, 0.4)} top={190} />
      </>
    ),
  };
}

/** ESCENA 11 · BELLEZA Y PELIGRO (150–165 s · f 4500–4949). Atardecer: una ola grande pasa sobre el
 *  dragón, que sube y baja con ella; la cámara se inclina con la ola. */
export function scene11(t: number): SceneOut {
  const big = {c: -1500 + (t - 150) * 210, w: 420, h: 230};
  const w = onWave(t, 40, 30, big);
  const slope = (waveY(60, t, big) - waveY(20, t, big)) / 40;
  const cam = camDrift({x: 60, y: 120 + (w.y - 30) * 0.6, zoom: lerp(1.15, 1.4, seg(t, 150, 158)) - 0.15 * seg(t, 160, 165), roll: -slope * 0.25}, t, 1);
  const p = dragonPose({...float(t), ...w, roll: Math.PI, tilt: 0.36, shine: 1, light: '#ffd8a0'});
  const s = toScreen(cam, w.x, w.y);
  return {
    svg: (
      <SurfaceSplit cam={cam} t={t} pal={SUNSET} big={big} rays={1.2}>
        <BlueDragon uid="d11" p={p} />
      </SurfaceSplit>
    ),
    overlay: (
      <>
        <SubjectLight x={s.x} y={s.y} r={520} k={0.7} color="rgba(255,190,120,0.3)" />
        <ScreenRays t={t} k={0.5} />
        <Grade depth={0.3} vignette={0.8} warm={0.6} />
        <Caption text="Camuflaje · flotación · defensas" k={win(t, 155.0, 162.4, 0.5)} top={190} color="#ffe2a0" />
      </>
    ),
  };
}

/** ESCENA 12 · EL ÚLTIMO DRAGÓN (165–180 s · f 4950–5399). Primer plano al atardecer bajo la
 *  superficie; la cámara se aleja y asciende mientras el animal se va; pregunta y logotipo. */
export function scene12(t: number): SceneOut {
  const x = (t - 165) * 22;
  const w = onWave(t, x, 30);
  const cam = camDrift(camAt([[165, x - 20, 70, 3.0], [171, 40, 60, 1.6], [177, 120, -40, 0.75], [180, 140, -140, 0.62]], t), t, 0.6);
  const p = dragonPose({...float(t), ...w, ...depart(t, 165), roll: Math.PI, tilt: 0.36, shine: 1, light: '#ffd0a0'});
  const s = toScreen(cam, w.x, w.y);
  const logo = clamp((t - EV.logo) / 0.6);
  const fade = clamp((t - EV.fade[0]) / (EV.fade[1] - EV.fade[0]));
  return {
    svg: (
      <SurfaceSplit cam={cam} t={t} pal={mixPal(SUNSET, DAY, 0.15)} rays={1}>
        <BlueDragon uid="d12" p={p} />
      </SurfaceSplit>
    ),
    overlay: (
      <>
        <SubjectLight x={s.x} y={s.y} r={600} k={0.6 * (1 - logo)} color="rgba(255,190,120,0.3)" />
        <ScreenRays t={t} k={0.6} />
        <Grade depth={0.3} vignette={0.8} warm={0.7} dark={logo * 0.55 + fade} />
        <BigTitle lines={['', 'LA NATURALEZA SIGUE SUPERANDO A LA FANTASÍA']} k={win(t, 170.4, 173.3, 0.4)} top={250} size={70} color="#ffffff" />
        <BigTitle lines={['', '¿TE ATREVERÍAS A ACERCARTE?']} k={win(t, 173.4, 177.0, 0.4)} top={250} size={82} color="#ffd23f" />
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <ChannelLogo k={logo * (1 - fade)} t={t} />
          </svg>
        </AbsoluteFill>
      </>
    ),
  };
}
