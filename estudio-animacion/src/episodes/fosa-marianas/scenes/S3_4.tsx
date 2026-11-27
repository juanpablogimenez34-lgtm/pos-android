// ESCENA 3 (120–180) LAS CRIATURAS DE LA OSCURIDAD · 1.000–2.000 m: el sumergible enciende sus focos; esquema de la
//                    bioluminiscencia; rape abisal con señuelo y captura sin violencia gráfica; pez dragón con dientes,
//                    mandíbula y fotóforos; una medusa atraviesa lentamente el campo de visión.
// ESCENA 4 (180–240) LOS GIGANTES DE LAS PROFUNDIDADES · 2.000–3.000 m: calamar gigante (reconstrucción, con su rango
//                    documentado), comparación ilustrada con un ser humano, cachalote buceando con ecolocalización y un
//                    posible encuentro (no observado en la fosa): el calamar escapa con su sifón.
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {ParallaxLayer} from '../../../engine/camera';
import {Anglerfish, AnglerGlow, anglerPose} from '../../../creatures/anglerfish/Anglerfish';
import {DeepLife} from '../../../environments/deepsea/DeepSea';
import {GiantSquid} from '../../ep22-calamar-gigante/character/GiantSquid';
import {SpermWhale} from '../../ep23-cachalote/character/SpermWhale';
import {ClickFlash, ClickWaves} from '../../ep23-cachalote/environment/Ocean';
import {depthAt} from '../data/depth';
import {Fish, fishBody, fishWorld} from '../characters/FishRig';
import {DRAGON, dragonBulb, dragonDetail, SMALLFISH} from '../characters/Fishes';
import {Atolla} from '../characters/Creatures';
import {SubPose} from '../characters/Submersible';
import {Biolum, SizeCompare} from '../components/DiagramsA';
import {Badge, Chapter, SpeciesCard} from '../hud/HUD';
import {Frame} from '../components/HShell';
import {bc, cam, climbAt, darkOf, Env, focusLight, seg, shot, snowOf, SP, Sub, SubBeams, subLight, win} from './common';

// ---------------------------------------------------------------- ESCENA 3
export function scene3(t: number): Frame {
  const d = depthAt(t);
  const sy = (t - 120) * 8;
  const flick = t < 126 && t > 121.5 ? (Math.sin(t * 40) > -0.2 ? 1 : 0.3) : 1;
  const lights = smoothstep(121.5, 126, t) * flick;
  const sub: SubPose = {x: -300 + (t - 120) * 4, y: sy, s: 0.6, t, tilt: 0.12, lights, thrustV: 0.4, thrustH: 0.2, dark: 1};
  // rape abisal (146–163) y presa que se acerca al señuelo
  const A = {x: 520, y: sy + 140};
  const gulpT = 159.6;
  const jaw = t < gulpT - 0.25 ? 0.05 + 0.04 * Math.sin(t * 1.2) : t < gulpT + 0.35 ? 1 : lerp(1, 0.05, smoothstep(gulpT + 0.35, gulpT + 1.4, t));
  const ap = anglerPose({t, x: A.x, y: A.y + Math.sin(t * 0.5) * 8, scale: 1.25, facing: -1, pitch: -0.05, yaw: 0, jaw, lureSway: 1, lureJig: smoothstep(151, 153, t) * (1 - smoothstep(gulpT, gulpT + 0.5, t)), glow: 1, finRate: 1.4, gulp: smoothstep(gulpT, gulpT + 1.5, t)});
  const preyStart = {x: A.x - 700, y: A.y - 160};
  const approach = smoothstep(152.5, gulpT - 0.2, t);
  const sucked = smoothstep(gulpT - 0.25, gulpT + 0.25, t);
  const lure = ap.escaWorld;
  const preyAt = {x: lerp(lerp(preyStart.x, lure.x - 50, approach), ap.mouthWorld.x, sucked), y: lerp(lerp(preyStart.y, lure.y + 10, approach), ap.mouthWorld.y, sucked) + Math.sin(t * 2) * 6 * (1 - approach)};
  const prey = {x: preyAt.x, y: preyAt.y, scale: 1.3 * (1 - sucked * 0.6), facing: 1 as const, t, phase: t * 9, angle: Math.sin(t) * 0.1, look: {x: 1, y: 0.2}};
  // pez dragón (163–173)
  const dr = {x: 1400 - (t - 163) * 150, y: sy + 120 + Math.sin(t * 0.8) * 40, scale: 1.35, facing: -1 as const, t, phase: t * 4, angle: Math.sin(t * 0.8) * 0.06, jaw: 0.5 + 0.5 * Math.sin(t * 1.6), glow: 0.7 + 0.3 * Math.sin(t * 3), tone: 0.1};
  // medusa (172–180)
  const jel = {x: 900 - (t - 172) * 40, y: sy + 40 + (t - 172) * 6};
  let c = cam(sub.x + 150, sy + 30, 0.62);
  if (t > 128) c = shot(t, 128, 131, cam(sub.x + 150, sy + 30, 0.62), cam(sub.x + 420, sy + 80, 0.55));
  if (t > 131) c = cam(sub.x + 420, sy + 80, 0.55);
  if (t > 145.5) c = shot(t, 145.5, 148.5, c, cam(A.x - 120, A.y, 1.35));
  if (t > 148.5) c = cam(A.x - 120 - (t - 148.5) * 6, A.y, lerp(1.35, 1.6, smoothstep(152, 160, t)));
  if (t > 162.6) c = shot(t, 162.6, 165, c, cam(dr.x - 200, dr.y, 1.0));
  if (t > 165) c = cam(dr.x - 220, dr.y, 1.0);
  if (t > 171.5) c = shot(t, 171.5, 174, c, cam(jel.x, jel.y + 60, 1.1));
  if (t > 174) c = cam(jel.x, jel.y + 60, 1.1);
  c = bc(c, t, 0.5);
  const lp = t < 146 ? subLight(c, sub, lights * 0.85) : t < 163 ? focusLight(c, {x: A.x - 100, y: A.y}, 560, 0.75) : t < 172 ? focusLight(c, {x: dr.x + 380, y: dr.y}, 1000, 0.9) : focusLight(c, jel, 520, 0.7);
  const B = fishBody(DRAGON, dr);
  const bulb = dragonBulb(B, dr, t);
  const bw = {x: dr.x + bulb.x * dr.facing * dr.scale, y: dr.y + bulb.y * dr.scale};
  return {
    cam: c,
    world: (
      <g>
        <Env d={d} t={t} />
        <ParallaxLayer depth={1}>
          {t > 144 && t < 164 && <Anglerfish id="ang" pose={ap} light={0.8} />}
          {t > 150 && sucked < 0.97 && <Fish spec={SMALLFISH} uid="prey" pose={prey} />}
          {t > 161 && t < 175 && <Fish spec={DRAGON} uid="dr" pose={dr} detail={dragonDetail(dr.glow, t)} />}
          {t > 170 && <Atolla x={jel.x} y={jel.y} s={1.1} t={t} glow={win(t, 176, 179, 0.4) * 0.6} />}
        </ParallaxLayer>
        <Sub p={sub} />
      </g>
    ),
    snow: {density: snowOf(d), climb: climbAt(t), ambient: 0.1},
    dark: {amount: darkOf(d), light: lp},
    glow: (
      <g>
        <ParallaxLayer depth={0.5}><DeepLife intensity={0.8} /></ParallaxLayer>
        <SubBeams p={sub} k={lights * (t < 146 ? 1 : 0.5)} />
        <ParallaxLayer depth={1}>
          {t > 144 && t < 164 && <AnglerGlow id="ang" pose={ap} zoom={c.zoom} />}
          {t > 161 && t < 175 && Array.from({length: 13}, (_, i) => {
            const q = fishWorld(DRAGON, dr, 0.08 + i * 0.066, -0.75);
            return <circle key={i} cx={q.x} cy={q.y} r={5} fill="#9ff6ff" opacity={0.35 * dr.glow} />;
          })}
          {t > 161 && t < 175 && <circle cx={bw.x} cy={bw.y} r={18} fill="#bff8ff" opacity={0.35 * dr.glow} />}
        </ParallaxLayer>
      </g>
    ),
    overlay: (
      <>
        <Chapter n={3} title="Las criaturas de la oscuridad" range="1.000–2.000 m" k={win(t, 120.5, 125.5, 0.5)} />
        <Badge k={win(t, 122, 128, 0.5)} text="FOCOS DEL SUMERGIBLE ENCENDIDOS" color="#bff4ff" />
        <Biolum k={win(t, 130, 145.4, 0.6)} t={t} />
        <SpeciesCard s={SP.angler} k={win(t, 147, 153.6, 0.5)} />
        <SpeciesCard s={SP.dragon} k={win(t, 164.2, 170.6, 0.5)} />
        <SpeciesCard s={SP.atolla} k={win(t, 174, 179.4, 0.5)} />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 4
const CLICKS = Array.from({length: 22}, (_, i) => 219.6 + i * 0.42);
export function scene4(t: number): Frame {
  const d = depthAt(t);
  const sub: SubPose = {x: -900, y: 260 + (t - 180) * 3, s: 0.55, t, tilt: 0.08, lights: 1, thrustV: 0.3, dark: 1};
  // calamar gigante (reconstrucción)
  const sq = {x: 360 + Math.sin(t * 0.3) * 30 - smoothstep(231, 236, t) * 900, y: 240 + Math.sin(t * 0.4) * 20 - smoothstep(231, 236, t) * 260};
  const escape = smoothstep(230.5, 232, t);
  const pulse = escape > 0 ? 0.5 + 0.5 * Math.sin(t * 9) : 0.5 + 0.5 * Math.sin(t * 1.4);
  const tentReach = smoothstep(190, 194, t) * (1 - smoothstep(196, 198, t));
  const squidPose = {t, pulse, fin: t * 2.2, finAmp: 0.6, spread: 0.25 + 0.3 * smoothstep(228, 231, t) * (1 - escape), curl: 0.35, wave: 0.6, armSpeed: 1, tone: 0.15, rim: 0.5, siphon: -1, jet: escape, look: {x: -400, y: 60}, tentacles: [{tip: {x: 600 + tentReach * 300, y: -30 + Math.sin(t) * 20}, ext: 0.4 + tentReach * 0.6}, {tip: {x: 600 + tentReach * 280, y: 40}, ext: 0.4 + tentReach * 0.55}]};
  // cachalote (211–240): desciende en diagonal
  const wx = 1500 - (t - 210) * 70;
  const wy = -200 + (t - 210) * 22;
  const whale = {t, phase: t * 2.2, amp: 0.7, arch: 0.15, flip: 0.5 + 0.5 * Math.sin(t * 0.8), jaw: 0.08, fv: 0.2, tone: 0.05, rim: 0.8};
  const head = {x: wx - 0.06 * 1600 * 0.55, y: wy + 20};
  let c = cam(sq.x - 260, sq.y + 30, 0.55);
  if (t > 184) c = shot(t, 184, 188, cam(sq.x - 260, sq.y + 30, 0.55), cam(sq.x - 120, sq.y, 0.9));
  if (t > 188) c = cam(sq.x - 120 + Math.sin(t * 0.2) * 40, sq.y, lerp(0.9, 1.05, smoothstep(188, 198, t)));
  if (t > 209.5) c = shot(t, 209.5, 213, c, cam(wx - 300, wy + 80, 0.5));
  if (t > 213) c = cam(wx - 300, wy + 80, 0.5);
  if (t > 228) c = shot(t, 228, 231, cam(wx - 300, wy + 80, 0.5), cam(lerp(wx, sq.x, 0.5) - 100, lerp(wy, sq.y, 0.5), 0.42));
  if (t > 231) c = cam(lerp(wx, sq.x, 0.5) - 100, lerp(wy, sq.y, 0.5), 0.42);
  c = bc(c, t, 0.5);
  const focus = t < 210 ? {x: sq.x - 100, y: sq.y} : t < 228 ? {x: wx + 280, y: wy + 60} : {x: lerp(wx + 200, sq.x, 0.5), y: lerp(wy, sq.y, 0.5)};
  return {
    cam: c,
    world: (
      <g>
        <Env d={d} t={t} />
        <ParallaxLayer depth={1}>
          {(t < 211 || t > 222) && <GiantSquid pose={squidPose} uid="gs" x={sq.x} y={sq.y} scale={t > 222 ? 0.6 : 0.75} dir={-1} angle={escape * 0.4} />}
          {t > 205 && <SpermWhale pose={whale} uid="cw" x={wx} y={wy} scale={0.55} dir={-1} angle={-0.28} />}
        </ParallaxLayer>
        {t > 225 && <Sub p={sub} />}
      </g>
    ),
    snow: {density: snowOf(d), climb: climbAt(t), ambient: 0.1},
    dark: {amount: darkOf(d) * (t < 209 ? 0.9 : 0.62), light: focusLight(c, focus, t < 210 ? 760 : 1200, 0.85)},
    glow: (
      <ParallaxLayer depth={1}>
        <ClickWaves t={t} origin={head} dir={Math.atan2(sq.y - head.y, sq.x - head.x)} clicks={CLICKS} speed={1500} maxR={1400} targets={[sq]} spread={0.35} k={win(t, 219.4, 229.8, 0.4)} />
        <ClickFlash t={t} origin={head} clicks={CLICKS} k={win(t, 219.4, 229.8, 0.4)} />
      </ParallaxLayer>
    ),
    overlay: (
      <>
        <Chapter n={4} title="Los gigantes de las profundidades" range="2.000–3.000 m" k={win(t, 180.5, 185.5, 0.5)} />
        <Badge k={win(t, 181, 199.4, 0.5)} text="RECONSTRUCCIÓN · PROFUNDIDAD DOCUMENTADA ≈ 300–1.000 m" />
        <SpeciesCard s={SP.squid} k={win(t, 188.4, 196, 0.5)} />
        <SizeCompare k={win(t, 199.8, 209.6, 0.6)} t={t} />
        <Badge k={win(t, 210, 240, 0.5)} text="RECONSTRUCCIÓN · CACHALOTE: HABITUALMENTE 400–1.200 m" />
        <SpeciesCard s={SP.whale} k={win(t, 211, 218, 0.5)} />
        <Badge k={win(t, 219.6, 229.8, 0.5)} text="VISUALIZACIÓN CIENTÍFICA: EL SONIDO NO ES VISIBLE" x={64} y={64} color="#9ff0ff" />
        <Badge k={win(t, 231, 239.5, 0.5)} text="ENCUENTRO POSIBLE · NO OBSERVADO EN LA FOSA" x={64} y={64} color="#ffb8a0" />
      </>
    ),
  };
}
export const _k = {clamp, seg};
