// ESCENAS 1–4 (0–54 s · fotogramas 0–1619).
import {AbsoluteFill} from 'remotion';
import {clamp, lerp} from '../../../engine/math';
import {Grade, SubjectLight} from '../../ep10-camaron-mantis/lighting/Lighting';
import {Callouts, Caption} from '../../ep10-camaron-mantis/sequences/common';
import {Question} from '../../ep11-dragon-azul/scenes/common';
import {breathe, Cam, cam, PunchWord, SceneOut, shot, toScreen} from '../../../studio2';
import {glide, strike, swim} from '../animation/JawMotion';
import {DeepFish} from '../character/DeepPrey';
import {GoblinShark, sharkPoint, sharkPose, SharkPose} from '../character/GoblinShark';
import {EV, SS} from '../config/episode';
import {LightSweep, RevealFlash, Shockwave, WaterBurst} from '../effects/Effects';
import {DeepSea} from '../environment/DeepSea';
import {DepthScale, ElectroField, RecreationTag} from '../science/Science';

const win = (t: number, a: number, b: number, r = 0.4) => clamp((t - a) / r) * clamp((b - t) / r);
const P = (c: Cam, p: SharkPose, lx: number, ly: number) => {
  const w = sharkPoint(p, lx, ly);
  return toScreen(c, w.x, w.y);
};

/** ESCENA 1 · GANCHO: LA BOCA IMPOSIBLE (0–8 s · f 0–239). Oscuridad, pulso grave, aparece el ojo; una
 *  luz azul revela la cabeza; las mandíbulas se proyectan sobre un pez (congelación en la extensión
 *  máxima, destello, partículas desplazadas); corte rápido a negro; silueta completa que se desliza. */
export function scene01(t: number): SceneOut {
  // tiempo efectivo con congelación breve en la máxima extensión
  const te = t < EV.freeze[0] ? t : t < EV.freeze[1] ? EV.freeze[0] : t - (EV.freeze[1] - EV.freeze[0]);
  const close = t < EV.hookCut[1];
  if (close) {
    const s = strike(te, EV.hookStrike, 1);
    const p = sharkPose({...swim(te, 0.6), x: 0, y: 0, scale: SS, jaw: s.jaw, open: s.open, exposure: clamp(0.06 + te * 0.95), rim: 0.9, light: '#8adfff'});
    const eye = sharkPoint(p, 164, -14);
    const mouth = sharkPoint(p, 268, 32);
    const fishX = 300 + te * 18;
    const caught = te > EV.hookStrike + 0.06;
    let c = shot(t, 0, 0.85, cam(eye.x + 10, eye.y + 20, 3.4), cam(eye.x + 40, eye.y + 40, 3.0), 'out');
    if (t >= 0.85) c = shot(t, 0.85, 1.0, c, cam(225, 30, 2.15), 'inOut');
    if (t >= 1.0) c = shot(t, 1.0, 2.4, cam(225, 30, 2.15), cam(205, 25, 2.25), 'linear');
    const kick = t > 0.9 && t < 1.25 ? Math.sin(((t - 0.9) / 0.35) * Math.PI) : 0;
    c = breathe({...c, x: c.x + Math.sin(t * 70) * 6 * kick, y: c.y + Math.cos(t * 60) * 5 * kick}, t, 0.4);
    const es = toScreen(c, eye.x, eye.y);
    const u = t - EV.hookStrike;
    return {
      svg: (
        <DeepSea cam={c} t={t} d={0.97} fish={0} lights={0.6}>
          {!caught && <DeepFish x={fishX} y={42} s={1.3} t={te} dir={1} c="#9ab6d8" />}
          <GoblinShark uid="h1" p={p} />
          <WaterBurst x={mouth.x} y={mouth.y} u={u} s={1.2} />
          <Shockwave x={mouth.x} y={mouth.y} u={u} s={0.8} />
        </DeepSea>
      ),
      overlay: (
        <>
          <LightSweep x={lerp(es.x - 300, es.x + 120, clamp(t / 0.9))} y={es.y} k={clamp(t * 3)} />
          <Grade depth={0.9} vignette={1} />
          <RevealFlash u={u} />
          <PunchWord text="¡DISPARA SU MANDÍBULA!" k={win(t, 1.0, 2.42, 0.12)} size={78} top={250} />
          {t > EV.hookCut[0] && <AbsoluteFill style={{background: '#000003'}} />}
        </>
      ),
    };
  }
  // 2,62–8 s: silueta completa que se desliza en la oscuridad; la cámara se retira despacio
  const x = glide(t, 2.62, 8.2, -260, 120);
  const p = sharkPose({...swim(t), x, y: 0, scale: SS, exposure: 0.55 + 0.25 * Math.sin(t * 0.8), rim: 0.8, yaw: 0.25 - 0.1 * (t - 2.6) / 5});
  const c = breathe(shot(t, 2.62, 8, cam(x + 60, -20, 1.55), cam(x + 40, 10, 1.25), 'cine'), t, 0.6);
  const head = P(c, p, 200, -10);
  return {
    svg: <DeepSea cam={c} t={t} d={0.95} fish={0.3}>{<GoblinShark uid="h2" p={p} />}</DeepSea>,
    overlay: (
      <>
        <LightSweep x={head.x} y={head.y} k={0.8} />
        <Grade depth={0.85} vignette={0.95} />
        <PunchWord text="¡DISPARA SU MANDÍBULA!" k={win(t, 2.62, 4.0, 0.3) * 0.0} size={70} top={250} />
        {t < 2.9 && <AbsoluteFill style={{background: '#000003', opacity: 1 - (t - 2.62) / 0.28}} />}
      </>
    ),
  };
}

/** ESCENA 2 · EL MUNDO DE LAS PROFUNDIDADES (8–22 s · f 240–659). Descenso continuo: los rayos de sol
 *  se apagan, el agua pasa de turquesa a azul abisal, aparecen nieve marina, peces lejanos y destellos;
 *  escala de profundidad ilustrativa. Al final, una silueta lejana del tiburón. */
export function scene02(t: number): SceneOut {
  const u = clamp((t - 8) / 13.5);
  const d = u * u * (3 - 2 * u) * 0.92;
  const c = breathe(cam(0, -3000 + u * 6000, 1, 0), t, 0.8);
  const m = lerp(0, 1000, d / 0.92);
  const far = clamp((t - 18.8) / 1.5);
  return {
    svg: (
      <DeepSea cam={c} t={t} d={d} fish={1 - d * 0.6} lights={1}>
        {far > 0.01 && (
          <g opacity={far * 0.5}>
            <GoblinShark uid="s2" p={sharkPose({...swim(t), x: lerp(-900, -300, clamp((t - 18.8) / 3.2)), y: c.y + 260, scale: 0.55, exposure: 0.15, rim: 0.3})} />
          </g>
        )}
      </DeepSea>
    ),
    overlay: (
      <>
        <Grade depth={0.3 + 0.6 * d} vignette={0.75 + 0.2 * d} />
        {t < 8.35 && <AbsoluteFill style={{background: '#000003', opacity: 1 - (t - 8) / 0.35}} />}
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <DepthScale m={m} k={win(t, 9.0, 21.6, 0.6)} />
          </svg>
        </AbsoluteFill>
        <Caption text="Tiburón duende" sub="Mitsukurina owstoni" k={win(t, 8.6, 13.4, 0.5)} top={190} />
      </>
    ),
  };
}

/** ESCENA 3 · UNA APARIENCIA EXTRAORDINARIA (22–38 s · f 660–1139). Entra desde la oscuridad; la
 *  cámara lo rodea (parallax y giro 2.5D); primeros planos del hocico, la piel y los dientes. */
export function scene03(t: number): SceneOut {
  const x = glide(t, 22, 29, -880, 0);
  const yaw = lerp(0.65, -0.15, clamp((t - 22) / 8)) + 0.15 * Math.sin((t - 22) * 0.3);
  const s = t > 33 ? strike(t, 999, 1) : {jaw: 0, open: 0};
  const p = sharkPose({...swim(t, 0.8), x, y: 0, scale: SS, yaw, exposure: clamp(0.25 + (t - 22) * 0.12), rim: 0.85, open: t > 33.2 ? 0.28 * clamp((t - 33.2) / 0.8) * clamp((37.6 - t) / 0.6) : s.open});
  const snout = sharkPoint(p, 280, -32);
  const teeth = sharkPoint(p, 190, 30);
  let c = shot(t, 22, 28, cam(-500, -10, 0.95, 0.03), cam(-40, 0, 1.25, -0.02), 'cine');
  if (t > 28.5) c = shot(t, 28.5, 30, c, cam(snout.x - 30, snout.y + 40, 2.9, 0.04), 'cine');
  if (t > 30) c = shot(t, 30, 33, cam(snout.x - 30, snout.y + 40, 2.9, 0.04), cam(snout.x - 120, snout.y + 60, 3.2, -0.02), 'linear');
  if (t > 33) c = shot(t, 33, 34.2, cam(snout.x - 120, snout.y + 60, 3.2, -0.02), cam(teeth.x - 10, teeth.y - 10, 3.6, 0), 'cine');
  if (t > 36.3) c = shot(t, 36.3, 38, cam(teeth.x - 10, teeth.y - 10, 3.6, 0), cam(x + 20, 0, 1.4, 0), 'cine');
  c = breathe(c, t, 0.6);
  const ls = toScreen(c, snout.x - 60, snout.y);
  return {
    svg: <DeepSea cam={c} t={t} d={0.85} fish={0.4}>{<GoblinShark uid="s3" p={p} />}</DeepSea>,
    overlay: (
      <>
        <LightSweep x={ls.x} y={ls.y} k={0.6 + 0.3 * Math.sin(t * 0.7)} />
        <SubjectLight x={ls.x} y={ls.y} r={700} k={0.4} color="rgba(255,190,210,0.18)" />
        <Grade depth={0.75} vignette={0.9} />
        <Callouts
          items={[
            {p: P(c, p, 300, -32), label: 'hocico largo y aplanado', lx: 540, ly: 420, k: win(t, 30.0, 33.0, 0.4)},
            {p: P(c, p, 120, -10), label: 'piel gris rosada', lx: 330, ly: 560, k: win(t, 31.0, 33.0, 0.4)},
            {p: P(c, p, 200, 30), label: 'dientes largos y finos', lx: 560, ly: 470, k: win(t, 34.2, 36.4, 0.4)},
          ]}
        />
      </>
    ),
  };
}

/** ESCENA 4 · EL HOCICO QUE DETECTA PRESAS (38–54 s · f 1140–1619). Cerca del fondo: primer plano de los
 *  poros del hocico (ampollas de Lorenzini) y visualización educativa del campo eléctrico débil de
 *  un pez pequeño; el tiburón orienta la cabeza hacia él. */
export function scene04(t: number): SceneOut {
  const floorY = 300;
  const x = glide(t, 38, 54, -420, -120);
  const pitch = t > 46 ? 0.08 * clamp((t - 46) / 2) : 0;
  const p = sharkPose({...swim(t, 0.7), x, y: 130, scale: SS, exposure: 0.9, rim: 0.7, pitch});
  const snout = sharkPoint(p, 280, -30);
  const fish = {x: snout.x + 300 + Math.sin(t * 0.6) * 30, y: floorY - 40 + Math.sin(t * 1.3) * 8};
  let c = shot(t, 38, 40, cam(snout.x - 60, snout.y + 10, 2.0), cam(snout.x - 30, snout.y + 6, 3.0), 'cine');
  if (t > 43.4) c = shot(t, 43.4, 46.5, cam(snout.x - 30, snout.y + 6, 3.0), cam((snout.x + fish.x) / 2, (snout.y + fish.y) / 2 + 20, 1.55), 'cine');
  if (t > 46.5) c = shot(t, 46.5, 54, cam((snout.x + fish.x) / 2, (snout.y + fish.y) / 2 + 20, 1.55), cam((snout.x + fish.x) / 2 + 30, (snout.y + fish.y) / 2 + 10, 1.75), 'linear');
  c = breathe(c, t, 0.5);
  const pores = win(t, 39.0, 46.0, 0.6);
  const fieldK = win(t, 44.4, 53.6, 0.8);
  return {
    svg: (
      <DeepSea cam={c} t={t} d={0.8} floor floorY={floorY} fish={0.3}>
        <DeepFish x={fish.x} y={fish.y} s={1.1} t={t} dir={1} c="#8ab0c8" />
        <ElectroField x={fish.x} y={fish.y} t={t} k={fieldK} r={0.9} />
        <GoblinShark uid="s4" p={p} />
        {pores > 0.01 &&
          Array.from({length: 18}, (_, i) => {
            const q = sharkPoint(p, 196 + (i % 9) * 14, -36 + Math.floor(i / 9) * 9);
            return <circle key={i} cx={q.x} cy={q.y} r={3.2 + 1.5 * Math.sin(t * 4 + i)} fill="none" stroke="#7ff3ff" strokeWidth={1.6} opacity={pores * 0.9} />;
          })}
      </DeepSea>
    ),
    overlay: (
      <>
        <Grade depth={0.6} vignette={0.85} />
        <Question text="¿Cómo encuentra presas en la oscuridad?" k={win(t, 38.2, 41.4, 0.4)} top={250} />
        <Callouts items={[{p: P(c, p, 240, -32), label: 'ampollas de Lorenzini', lx: 560, ly: 470, k: win(t, 41.6, 46.0, 0.4)}]} />
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <RecreationTag k={fieldK} text="Visualización educativa: el campo eléctrico no es visible" y={420} />
          </svg>
        </AbsoluteFill>
      </>
    ),
  };
}
