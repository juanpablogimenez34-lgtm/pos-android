// ESCENAS 1–4 (0–60 s · fotogramas 0–1799).
import {AbsoluteFill} from 'remotion';
import {clamp, lerp} from '../../../engine/math';
import {Cam, camAt, drift as camDrift, layerT, toScreen} from '../../ep10-camaron-mantis/camera/CameraSystem';
import {Grade, ScreenRays, SubjectLight} from '../../ep10-camaron-mantis/lighting/Lighting';
import {float, onWave, turn} from '../animation/DragonMotion';
import {BlueDragon, dragonPoint, dragonPose, DragonPose} from '../character/BlueDragon';
import {ManOWarTop} from '../character/Organisms';
import {DAY, mixPal, NIGHT, SurfaceSplit, TopOcean, UnderSurface} from '../environment/Ocean';
import {OrientationInset} from '../science/Science';
import {Callouts, Caption, HookText, Question, SceneOut, seg, win} from './common';

const pt = (cam: Cam, p: DragonPose, lx: number, ly: number) => {
  const w = dragonPoint(p, lx, ly);
  return toScreen(cam, w.x, w.y);
};

/** ESCENA 1 · UN DRAGÓN REAL (0–15 s · f 0–449). Gancho: océano casi negro, dragón luminoso en el
 *  primer fotograma, acercamiento rápido, giro que revela las ceratas, aparece una carabela;
 *  barrido de luz hacia el día. */
export function scene01(t: number): SceneOut {
  const day = seg(t, 7.9, 9.3);
  const pal = mixPal(NIGHT, DAY, day);
  const cam = camDrift(
    camAt(
      [
        [0, 0, 0, 1.0, -0.25],
        [1.6, 10, 0, 2.0, -0.12],
        [4.9, 20, 0, 1.75, 0],
        [7.6, 90, -40, 1.1, 0.04],
        [8.6, 60, -20, 1.25, 0.02],
        [15, 120, 0, 1.4, 0.08],
      ],
      t,
    ),
    t,
    0.6,
  );
  const p = dragonPose({
    ...float(t),
    ...turn(t, 1.8, 5.0, 0.75, 0),
    x: t < 8.6 ? 0 : (t - 8.6) * 14,
    heading: lerp(-0.7, 0.25, seg(t, 1.6, 5.2)) + 0.05 * Math.sin(t * 0.4),
    spread: lerp(0.6, 1, seg(t, 1.8, 4.6)),
    glow: 1 - day * 0.85,
    shine: 0.9,
    light: day > 0.5 ? '#ffffff' : '#a8d8ff',
  });
  const mow = t > 4.6 ? lerp(900, 360, seg(t, 4.7, 7.2)) : 900;
  const ring = clamp((t - 7.95) / 0.9);
  const head = pt(cam, p, 0, 0);
  return {
    svg: (
      <TopOcean cam={cam} t={t} pal={pal} foam={day}>
        {t > 4.6 && <ManOWarTop x={mow} y={-150} s={1.15} t={t} rot={200} op={clamp((t - 4.7) / 0.5)} />}
        <BlueDragon uid="d1" p={p} />
      </TopOcean>
    ),
    overlay: (
      <>
        <SubjectLight x={head.x} y={head.y} r={560} k={(1 - day) * 0.9} color="rgba(80,150,255,0.35)" />
        <Grade depth={0.6 - 0.4 * day} vignette={0.95 - 0.2 * day} />
        {ring > 0 && ring < 1 && (
          <AbsoluteFill style={{pointerEvents: 'none'}}>
            <svg width={1080} height={1920}>
              <circle cx={head.x} cy={head.y} r={60 + ring * 1500} fill="none" stroke="#e8fbff" strokeWidth={60 * (1 - ring)} opacity={0.8 * (1 - ring)} />
              <rect width={1080} height={1920} fill="#7ff0ff" opacity={0.22 * Math.sin(ring * Math.PI)} />
            </svg>
          </AbsoluteFill>
        )}
        <HookText lines={['¡NO ES UN DRAGÓN', 'DE FANTASÍA!']} k={t < 2.05 ? 1 : win(t, 0.0, 2.3, 0.25)} top={260} />
        {t > 2.3 && t < 4.9 && (
          <AbsoluteFill style={{pointerEvents: 'none'}}>
            <svg width={1080} height={1920}>
              {(() => {
                const a = pt(cam, p, 200, 150);
                const b = pt(cam, p, -200, 150);
                const k = win(t, 2.35, 4.85, 0.3);
                return (
                  <g opacity={k}>
                    <path d={`M${a.x.toFixed(1)},${a.y.toFixed(1)} L${b.x.toFixed(1)},${b.y.toFixed(1)}`} stroke="#ffd23f" strokeWidth={6} />
                    <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 + 60} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={52} fill="#ffd23f">≈ 3 cm</text>
                  </g>
                );
              })()}
            </svg>
          </AbsoluteFill>
        )}
        <HookText lines={['¡ARMAS', 'URTICANTES!']} k={win(t, 5.1, 7.9, 0.25)} top={300} size={96} color="#ff7ad8" />
        <Caption text="Glaucus atlanticus · el dragón azul" k={win(t, 9.4, 14.6, 0.5)} top={250} />
      </>
    ),
  };
}

/** ESCENA 2 · ¿QUÉ ES REALMENTE? (15–30 s · f 450–899). Lámina anatómica viva: el animal en
 *  vertical, con etiquetas que se trazan sobre cabeza, rinóforos, ceratas, pie y cola. */
export function scene02(t: number): SceneOut {
  const cam = camDrift(camAt([[15, 0, 30, 1.4, 0.1], [17.5, 0, 25, 1.8, 0], [30, 0, 25, 1.85, -0.03]], t), t, 0.4);
  const p = dragonPose({...float(t), heading: -Math.PI / 2 + 0.06 * Math.sin(t * 0.5), bend: 0.7, shine: 0.8});
  const L = (lx: number, ly: number, label: string, x: number, y: number, a: number) => ({p: pt(cam, p, lx, ly), label, lx: x, ly: y, k: win(t, a, 29.6, 0.5)});
  return {
    svg: (
      <TopOcean cam={cam} t={t} pal={DAY} foam={0.4}>
        <BlueDragon uid="d2" p={p} />
      </TopOcean>
    ),
    overlay: (
      <>
        <Grade depth={0.3} vignette={0.75} />
        <AbsoluteFill style={{pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(200,240,255,0.06) 2px, transparent 2px), linear-gradient(90deg, rgba(200,240,255,0.06) 2px, transparent 2px)', backgroundSize: '90px 90px', opacity: win(t, 15.2, 29.8, 0.6)}} />
        <Question text="¿Qué es realmente?" k={win(t, 15.1, 18.4, 0.4)} top={250} />
        <Caption text="Glaucus atlanticus" sub="babosa marina · molusco gasterópodo" k={win(t, 18.6, 28.4, 0.5)} top={190} />
        <Callouts
          items={[
            L(200, -16, 'rinóforos', 820, 400, 20.4),
            L(70, 110, 'ceratas', 250, 620, 21.6),
            L(40, 0, 'pie (cara azul)', 830, 1000, 22.8),
            L(-190, 0, 'cola', 300, 1220, 24.0),
            L(-30, -120, 'ceratas', 830, 760, 25.2),
          ]}
        />
      </>
    ),
  };
}

/** ESCENA 3 · EL MUNDO AL REVÉS (30–45 s · f 900–1349). Plano partido en la superficie: flota boca
 *  abajo pegado a la película superficial, sube y baja con las olas; rayos X de la burbuja de aire;
 *  el viento lo empuja. */
export function scene03(t: number): SceneOut {
  const x = lerp(-140, 260, seg(t, 30, 45));
  const w = onWave(t, x, 30);
  const cam = camDrift({x: x + 40, y: 150, zoom: lerp(1.5, 1.95, seg(t, 30, 36)) - 0.15 * seg(t, 41, 45), roll: 0}, t, 1);
  const p = dragonPose({...float(t), ...w, roll: Math.PI, tilt: 0.46, xray: win(t, 34.2, 42.6, 0.6), shine: 0.8});
  const wind = win(t, 38.2, 43.5, 0.5);
  return {
    svg: (
      <SurfaceSplit cam={cam} t={t} pal={DAY}>
        <BlueDragon uid="d3" p={p} />
      </SurfaceSplit>
    ),
    overlay: (
      <>
        <Grade depth={0.3} vignette={0.7} />
        <Question text="¿Por qué flota boca abajo?" k={win(t, 30.2, 33.8, 0.4)} top={250} />
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <OrientationInset t={t} k={win(t, 34.0, 41.6, 0.5)} bubble={seg(t, 34.6, 35.6)} />
            {wind > 0.01 &&
              [0, 1, 2].map((i) => {
                const u = ((t * 0.6 + i / 3) % 1);
                const y = 330 + i * 90;
                return (
                  <g key={i} opacity={wind * Math.sin(u * Math.PI)}>
                    <path d={`M${(60 + u * 500).toFixed(1)},${y} q120,-26 240,0 q60,14 110,-6`} stroke="#ffffff" strokeWidth={8} fill="none" strokeLinecap="round" />
                  </g>
                );
              })}
          </svg>
        </AbsoluteFill>
        <Caption text="viento y corrientes" k={wind} top={590} size={36} />
      </>
    ),
  };
}

/** ESCENA 4 · EL SECRETO DE SUS COLORES (45–60 s · f 1350–1799). Vista desde arriba (el azul se
 *  funde con el mar), rotación lenta del animal y de la cámara, vista desde abajo (el plateado se
 *  funde con la claridad de la superficie). */
export function scene04(t: number): SceneOut {
  const below = seg(t, 51.6, 52.8);
  const cam = camDrift(camAt([[45, 0, 0, 1.0, 0], [50.6, 0, 0, 1.35, 0.1], [52.8, 0, 0, 1.6, Math.PI * 0.35], [60, 0, 0, 1.45, Math.PI * 0.42]], t), t, 0.5);
  const p = dragonPose({...float(t), ...turn(t, 50.6, 53.0, 0, Math.PI), heading: -Math.PI / 2 + 0.2 + 0.1 * Math.sin(t * 0.3), shine: 0.6, glow: 0});
  const ring = (k: number) => {
    const c = pt(cam, p, 0, 0);
    return k > 0.01 ? <circle cx={c.x} cy={c.y} r={430} fill="none" stroke="#ffffff" strokeWidth={4} strokeDasharray="18 16" opacity={0.7 * k} /> : null;
  };
  return {
    svg: (
      <g>
        <g opacity={1 - below}>
          <TopOcean cam={cam} t={t} pal={DAY} foam={0.8}>
            <BlueDragon uid="d4" p={{...p, opacity: below > 0.5 ? 0 : 0.88}} />
          </TopOcean>
        </g>
        {below > 0.01 && (
          <g opacity={below}>
            <UnderSurface t={t} pal={DAY} />
            <g transform={layerT(cam, 1)}>
              <BlueDragon uid="d4b" p={{...p, opacity: 0.92}} />
            </g>
          </g>
        )}
      </g>
    ),
    overlay: (
      <>
        <Grade depth={0.25} vignette={0.7} />
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            {ring(win(t, 48.2, 51.2, 0.4))}
            {ring(win(t, 54.6, 57.8, 0.4))}
          </svg>
        </AbsoluteFill>
        <Question text="¿Lo ves?" k={win(t, 45.3, 47.8, 0.4)} top={250} />
        <Caption text="Visto desde arriba" sub="el azul se confunde con el océano" k={win(t, 48.0, 51.4, 0.4)} top={190} />
        <Caption text="Visto desde abajo" sub="el plateado se mezcla con la luz" k={win(t, 53.4, 59.4, 0.5)} top={190} />
        <ScreenRays t={t} k={below * 0.5} />
      </>
    ),
  };
}
