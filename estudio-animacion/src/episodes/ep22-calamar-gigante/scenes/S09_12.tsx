// ESCENAS 9–12.
//  9  (120–135) EL ENEMIGO GIGANTE (recreación): ambiente grave; silueta de un cachalote; el calamar reacciona.
//  10 (135–150) EL ENCUENTRO EN LA OSCURIDAD (recreación): el cachalote se acerca; brazos desplegados; la cámara
//               se aleja y ambos se pierden en la oscuridad (sin pelea inventada).
//  11 (150–165) EL DESCUBRIMIENTO CIENTÍFICO: cámara suspendida con cebo y destellos (como en 2004); el calamar
//               aparece y sus tentáculos se enredan en el cebo.
//  12 (165–180) EL ÚLTIMO MISTERIO: nada en aguas abiertas, la cámara muestra su escala y desaparece en la oscuridad.
import {clamp, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, Cam, SceneOut, shot} from '../../../studio2';
import {GiantSquid} from '../character/GiantSquid';
import {CameraRig, SpermWhale} from '../character/Others';
import {BigTitle, poseFrom, RecTag, seg, SqTrack, strike, toLocal, Vignette, Wash, win} from '../components/common';
import {EV} from '../data/timeline';
import {OceanBack, OceanFront} from '../environment/OpenOcean';

// ---------------- ESCENA 9 ----------------
const TR9: SqTrack = [[120, 'DEEP_IDLE'], [127, 'TARGET_DETECTION'], [EV.threat, 'THREAT_RESPONSE']];
export function scene09(t: number): SceneOut {
  const P = {x: 0, y: 420, a: -0.6};
  const wx = lerp(-1700, 3600, seg(t, EV.whaleIn - 1, 138));
  const pose = poseFrom(TR9, t, {look: {x: -200, y: -600}, tone: 0.35, rim: 0.8});
  let c: Cam = cam(0, 250, 0.7);
  if (t >= 125) c = shot(t, 125, 129, cam(0, 250, 0.7), cam(0, 0, 0.42), 'cine');
  if (t >= 130) c = shot(t, 130, 133, cam(0, 0, 0.42), cam(60, 300, 0.8), 'cine');
  c = breathe(c, t, 0.25);
  return {
    svg: (
      <OceanBack cam={c} t={t} depth={0.95}>
        <SpermWhale x={wx} y={-560} t={t} scale={0.9} dir={1} tone={0.5} />
        <GiantSquid uid="s9" x={P.x} y={P.y} angle={P.a} scale={0.8} pose={pose} />
      </OceanBack>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette />
        <RecTag k={win(t, 120.4, 134.8, 0.4)} text="RECREACIÓN CINEMATOGRÁFICA" />
      </>
    ),
  };
}

// ---------------- ESCENA 10 ----------------
const TR10: SqTrack = [[135, 'THREAT_RESPONSE'], [146, 'DEEP_RETREAT']];
export function scene10(t: number): SceneOut {
  const wx = lerp(1500, 380, seg(t, 135, 144)) + seg(t, 145, 150) * 900;
  const wy = lerp(-500, -260, seg(t, 135, 143)) - seg(t, 144, 150) * 300;
  const back = seg(t, 146, 150);
  const P = {x: -60 - back * 300, y: 520 + back * 500, a: lerp(-0.25, 0.6, back)};
  const pose = poseFrom(TR10, t, {look: {x: 800, y: -300}, tone: lerp(0.3, 0.85, seg(t, 145, 150)), rim: 0.8});
  let c: Cam = cam(400, 100, 0.48);
  if (t >= 140) c = cam(lerp(400, 300, seg(t, 140, 145)), 120, lerp(0.48, 0.62, seg(t, 140, 144)));
  if (t >= 145) c = shot(t, 145, 150, cam(300, 120, 0.62), cam(300, 160, 0.3), 'cine');
  c = breathe(c, t, 0.25);
  return {
    svg: (
      <OceanBack cam={c} t={t} depth={0.97}>
        <SpermWhale x={wx} y={wy} t={t} scale={1.0} dir={-1} tone={lerp(0.42, 0.9, seg(t, 145, 150))} angle={lerp(0, -0.15, seg(t, 143, 149))} />
        <GiantSquid uid="s10" x={P.x} y={P.y} angle={P.a} scale={0.8} pose={pose} />
      </OceanBack>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette />
        <Wash k={0.5 * seg(t, 146.5, 150)} />
        <RecTag k={win(t, 135.3, 149.8, 0.4)} text="RECREACIÓN CINEMATOGRÁFICA" />
      </>
    ),
  };
}

// ---------------- ESCENA 11 ----------------
const TR11: SqTrack = [[150, 'DEEP_IDLE'], [155, 'EXPLORING'], [159.5, 'TARGET_DETECTION'], [EV.baitStrike - 0.4, 'TENTACLE_EXTEND'], [EV.baitStrike + 0.4, 'PREY_GRAB']];
export function scene11(t: number): SceneOut {
  const rigY = lerp(-1600, -260, seg(t, 150, 155));
  const rig = {x: 260, y: rigY};
  const bait = {x: rig.x + 150, y: rig.y + 260};
  const P = {x: lerp(-1500, -420, seg(t, 154, 160)), y: lerp(900, 480, seg(t, 154, 160)), a: -0.45, s: 0.75};
  const tgt = toLocal(bait, P.x, P.y, P.a, P.s);
  // las mazas se enredan alrededor del cebo y lo sujetan (sin retracción)
  const st = strike(t, EV.baitStrike, tgt, tgt, 6, 1);
  const pose = poseFrom(TR11, t, {look: tgt, tentacles: [{tip: st.tip, ext: st.ext}, {tip: {x: st.tip.x - 10, y: st.tip.y + 16}, ext: st.ext}], tone: lerp(0.9, 0.2, seg(t, 156, 159)), rim: 0.4});
  const strobe = EV.strobes.reduce((a, s) => Math.max(a, clamp(1 - Math.abs(t - s) / 0.12)), 0);
  let c: Cam = cam(rig.x, rig.y + 200, 0.9);
  if (t >= 155) c = shot(t, 155, 158, cam(rig.x, rig.y + 200, 0.9), cam(-100, 200, 0.62), 'cine');
  if (t >= 160) c = shot(t, 160, 163, cam(-100, 200, 0.62), cam(bait.x - 380, bait.y + 160, 0.78), 'cine');
  c = breathe(c, t, 0.2);
  return {
    svg: (
      <OceanBack cam={c} t={t} depth={0.97} spot={{x: rig.x, y: rig.y + 200, r: 900, k: 0.7 + strobe * 0.3}}>
        <CameraRig x={rig.x} y={rig.y} t={t} strobe={strobe} s={1.2} />
        <GiantSquid uid="s11" x={P.x} y={P.y} angle={P.a} scale={P.s} pose={pose} />
      </OceanBack>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette />
        <RecTag k={win(t, 150.3, 164.8, 0.4)} text="RECREACIÓN ILUSTRADA · OBSERVACIÓN DE 2004" />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1700, textAlign: 'center', fontFamily: FONT_FAMILY, color: '#cfe8ff', fontSize: 22, fontWeight: 700, letterSpacing: 1, opacity: 0.8 * win(t, 157, 164.8, 0.4)}}>Kubodera y Mori (2005): primeras imágenes de un calamar gigante vivo, a 900 m</div>
      </>
    ),
  };
}

// ---------------- ESCENA 12 ----------------
const TR12: SqTrack = [[165, 'SLOW_SWIM'], [170, 'CINEMATIC_REVEAL'], [175, 'DEEP_RETREAT']];
export function scene12(t: number): SceneOut {
  const P = {x: -200 + (t - 165) * 30, y: 300 + (t - 165) * 18, a: -0.3};
  const pose = poseFrom(TR12, t, {tone: lerp(0.3, 0.95, seg(t, 174.5, 179)), rim: lerp(0.8, 0.2, seg(t, 174, 179))});
  let c: Cam = cam(P.x + 100, P.y, 0.8);
  if (t >= 170) c = shot(t, 170, 176, cam(P.x + 100, P.y, 0.8), cam(P.x, P.y - 200, 0.32), 'cine');
  if (t >= 176) c = cam(P.x, P.y - 200, 0.32 - (t - 176) * 0.01);
  c = breathe(c, t, 0.2);
  return {
    svg: (
      <OceanBack cam={c} t={t} depth={lerp(0.85, 1, seg(t, 172, 179))}>
        <GiantSquid uid="s12" x={P.x} y={P.y} angle={P.a} pose={pose} />
      </OceanBack>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette />
        <Wash k={0.45 * seg(t, 174, 178)} />
        <BigTitle k={clamp((t - EV.endText) / 0.6) * (1 - seg(t, EV.fadeOut, 180))} lines={['¿QUÉ OTRO MONSTRUO', 'REAL ESCONDE', 'EL OCÉANO?']} top={300} size={80} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1660, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 30, letterSpacing: 6, color: '#eaf4ff', opacity: 0.8 * clamp((t - EV.endText - 0.6) / 0.6) * (1 - seg(t, EV.fadeOut, 180))}}>MUNDO INSÓLITO DOCUMENTALES</div>
        <Wash k={seg(t, EV.fadeOut, 180)} />
      </>
    ),
  };
}
