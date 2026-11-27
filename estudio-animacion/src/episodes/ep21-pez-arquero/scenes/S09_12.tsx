// ESCENAS 9–12.
//  9  (120–135) ¿SIEMPRE ACIERTA?: hoja más alta; el chorro pasa junto al insecto y cae como lluvia; el pez
//               se recoloca (fallo natural, sin torpeza).
//  10 (135–150) APRENDER A APUNTAR: observa otro objetivo, ajusta posición y ángulo, nuevo disparo certero.
//  11 (150–165) EL SECRETO DE SU SUPERVIVENCIA: plano general del manglar; nada entre raíces; observa insectos.
//  12 (165–180) EL ÚLTIMO DISPARO: insecto iluminado por el sol, disparo final y captura; la cámara se aleja.
import {clamp, hash1, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, Cam, SceneOut, shot} from '../../../studio2';
import {ArcherFish} from '../character/ArcherFish';
import {Insect, PerchLeaf, perchPoint, Ripples} from '../character/Insects';
import {BigTitle, Brand, seg, Vignette, Wash} from '../components/common';
import {Hunt, huntAt, remap} from '../components/hunt';
import {huntLayers} from '../components/HuntView';
import {EV} from '../data/timeline';
import {Branch, MangroveBack, MangroveFront} from '../environment/Mangrove';

/** Plano partido aire/agua: la superficie queda en y ≈ 780 de pantalla (el pez y la boca, por encima de
 *  la franja de subtítulos; el insecto, en la parte alta). `_surfaceAt` se conserva por compatibilidad. */
const zoomSplit = (cx: number, z: number, _surfaceAt = 780): Cam => {
  const zz = z * 0.76;
  return cam(cx, (960 - 780) / zz, zz);
};

// ---------------- ESCENA 9 ----------------
const H9: Hunt = {perch: {pivot: {x: 140, y: -640}, len: 150, base: 0.35, seed: 14}, insect: 'beetle', insectScale: 2.0, from: {x: -300, y: 240}, approach: [121, 124.5], aimMouth: {x: -20, y: 8}, aimAngle: -1.0, tShot: EV.shots[3].t, hit: false, missBy: {x: 70, y: -40}, after: {x: 120, y: 120}, seed: 13};

export function scene09(t: number): SceneOut {
  const hf = huntAt(H9, t);
  const L = huntLayers(hf, t, 'a9');
  // el agua del disparo fallido vuelve a caer: gotas y pequeñas ondas en la superficie
  const fallT = hf.shot.t0 + 0.34 + 0.45;
  let c: Cam = zoomSplit(40, 1.25, 1150);
  if (t >= 130) c = shot(t, 130, 135, zoomSplit(40, 1.25, 1150), cam(hf.fish.x + 60, hf.fish.y - 60, 2.0), 'cine');
  c = breathe(c, t, 0.2);
  return {
    svg: (
      <MangroveBack cam={c} t={t} trees={[-700, 900]} above={<><Branch x={-300} y={-790} len={640} ang={0.12} t={t} seed={31} />{L.above}</>} free={<>{L.free}{[0, 1, 2, 3].map((i) => <Ripples key={i} x={hf.shot.target.x - 40 + i * 30} t={t} t0={fallT + i * 0.08} n={1} big={0.5} />)}</>}>
        {L.below}
      </MangroveBack>
    ),
    overlay: (
      <>
        <MangroveFront cam={c} t={t} />
        <Vignette />
        <Brand />
      </>
    ),
  };
}

// ---------------- ESCENA 10 ----------------
const H10: Hunt = {perch: {pivot: {x: -40, y: -520}, len: 150, base: 2.8, seed: 18}, insect: 'beetle', insectScale: 2.0, dir: -1, from: {x: 420, y: 200}, approach: [140, 144.6], aimMouth: {x: -150, y: 8}, aimAngle: 0.9, tShot: EV.shots[4].t, knock: {x: -80, y: -130}, captureDelay: 1.0, after: {x: -500, y: 260}, seed: 17};

export function scene10(t: number): SceneOut {
  const hf = huntAt(H10, t);
  const L = huntLayers(hf, t, 'a10');
  const f = hf.fish;
  let c: Cam = zoomSplit(80, 1.4, 1120);
  if (t >= 140) c = shot(t, 140, 144, zoomSplit(80, 1.4, 1120), zoomSplit(-60, 1.6, 1060), 'inOut');
  if (t >= 144) c = zoomSplit(-60, 1.6, 1060);
  if (t >= 147.2) c = shot(t, 147.2, 150, zoomSplit(-60, 1.6, 1060), cam(f.x - 60, f.y - 50, 2.0), 'cine');
  c = breathe(c, t, 0.2);
  return {
    svg: (
      <MangroveBack cam={c} t={t} trees={[-1000, 700]} above={<><Branch x={500} y={-680} len={640} ang={Math.PI - 0.2} t={t} seed={35} />{L.above}</>} free={L.free}>
        {L.below}
      </MangroveBack>
    ),
    overlay: (
      <>
        <MangroveFront cam={c} t={t} />
        <Vignette />
        <Brand />
      </>
    ),
  };
}

// ---------------- ESCENA 11 ----------------
export function scene11(t: number): SceneOut {
  const u = (t - 150) / 15;
  const fx = lerp(-900, 500, u);
  const fy = 300 + Math.sin(t * 0.8) * 60 - 140 * seg(t, 160, 163);
  const angle = Math.cos(t * 0.8) * 0.08 - 0.3 * seg(t, 160, 163);
  let c: Cam = zoomSplit(0, 0.62, 1150);
  if (t >= 155) c = shot(t, 155, 157, zoomSplit(0, 0.62, 1150), cam(fx + 80, fy - 20, 1.7), 'cine');
  if (t >= 157) c = cam(fx + 80, fy - 20, 1.7);
  if (t >= 160) c = shot(t, 160, 162.5, cam(fx + 80, fy - 20, 1.7), zoomSplit(fx + 160, 1.3, 1150), 'cine');
  c = breathe(c, t, 0.25);
  const flyer = {x: 300 + Math.sin(t * 0.9) * 260, y: -620 + Math.sin(t * 2.3) * 60};
  const perches = [{pivot: {x: -1100, y: -520}, len: 140, base: 0.3, seed: 41}, {pivot: {x: 700, y: -560}, len: 150, base: 2.9, seed: 43}, {pivot: {x: 180, y: -480}, len: 130, base: 0.45, seed: 45}];
  return {
    svg: (
      <MangroveBack cam={c} t={t} trees={[-1500, -600, 300, 1200]} above={<><Branch x={-1500} y={-700} len={800} ang={0.15} t={t} seed={51} /><Branch x={1400} y={-760} len={900} ang={Math.PI - 0.1} t={t} seed={53} />{perches.map((p, i) => <PerchLeaf key={i} p={p} t={t} />)}</>} free={<><Insect x={flyer.x} y={flyer.y} s={2} t={t} kind="fly" state="flying" />{perches.map((p, i) => {
        const q = perchPoint(p, t);
        return <Insect key={i} x={q.x} y={q.y} ang={q.ang} s={1.9} t={t + i} kind={(['beetle', 'cricket', 'fly'] as const)[i]} />;
      })}</>}>
        <ArcherFish uid="a11" x={fx} y={fy} angle={angle} look={{t, swim: 0.8, freq: 2.2, lookAt: {x: 200, y: -300}}} />
        {Array.from({length: 3}, (_, i) => <ArcherFish key={i} uid={`a11b${i}`} x={-400 + i * 500 + Math.sin(t * 0.4 + i) * 100} y={560 + i * 60} scale={0.7} look={{t: t + i * 2, swim: 0.7, tone: 0.6, hue: 1}} dir={i % 2 ? -1 : 1} />)}
      </MangroveBack>
    ),
    overlay: (
      <>
        <MangroveFront cam={c} t={t} />
        <Vignette />
        <Brand />
      </>
    ),
  };
}

// ---------------- ESCENA 12 ----------------
const R12 = remap([[165, 165], [170.6, 170.6], [172.4, 171.0], [190, 188.6]]);
const H12: Hunt = {perch: {pivot: {x: 80, y: -500}, len: 160, base: 0.3, seed: 22}, insect: 'fly', insectScale: 2.1, from: {x: -380, y: 240}, approach: [166, 169.5], aimMouth: {x: 20, y: 8}, aimAngle: -0.92, tShot: EV.shots[5].t, knock: {x: 80, y: -140}, captureDelay: 0.8, after: {x: -200, y: 380}, seed: 21};

export function scene12(t: number): SceneOut {
  const T = R12(t);
  const hf = huntAt(H12, T);
  const L = huntLayers(hf, T, 'a12');
  const f = hf.fish;
  const ip = {x: H12.perch.pivot.x + 90, y: H12.perch.pivot.y + 30};
  let c: Cam = cam(ip.x, ip.y, 3.0);
  if (t >= 168.6) c = shot(t, 168.6, 170.4, cam(ip.x, ip.y, 3.0), zoomSplit(60, 1.7, 1080), 'cine');
  if (t >= 170.4) c = zoomSplit(60, 1.7, 1080);
  if (t >= 174.4) c = shot(t, 174.4, 179.6, zoomSplit(60, 1.7, 1080), zoomSplit(f.x, 0.75, 1250), 'cine');
  c = breathe(c, t, 0.2);
  const sun = seg(t, 165, 168);
  return {
    svg: (
      <MangroveBack cam={c} t={T} light={1 + 0.35 * sun} trees={[-900, 800, 1700]} above={<><Branch x={-400} y={-670} len={620} ang={0.18} t={T} seed={61} />{L.above}<circle cx={ip.x} cy={ip.y} r={120} fill="#fff4b0" opacity={0.12 * sun * (1 - seg(t, 172, 175))} /></>} free={L.free}>
        {L.below}
        {Array.from({length: 4}, (_, i) => <ArcherFish key={i} uid={`a12b${i}`} x={-600 + i * 400 + hash1(i) * 60 + Math.sin(T * 0.3 + i) * 60} y={520 + i * 40} scale={0.7} look={{t: T + i, swim: 0.7, tone: 0.65, hue: 1}} dir={i % 2 ? -1 : 1} />)}
      </MangroveBack>
    ),
    overlay: (
      <>
        <MangroveFront cam={c} t={T} />
        <Vignette />
        <BigTitle k={clamp((t - EV.endText) / 0.6) * (1 - seg(t, EV.fadeOut, 180))} lines={['¿QUÉ OTRO ANIMAL', 'TE SORPRENDERÍA?']} top={300} size={84} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1660, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 30, letterSpacing: 6, color: '#f6fff4', opacity: 0.8 * clamp((t - EV.endText - 0.6) / 0.6) * (1 - seg(t, EV.fadeOut, 180))}}>MUNDO INSÓLITO DOCUMENTALES</div>
        <Wash k={seg(t, EV.fadeOut, 180)} />
      </>
    ),
  };
}
