// ESCENAS 1–4.
//  1 (0–15)   EL GIGANTE INVISIBLE: primerísimo plano del ojo + clic → retroceso a la cabeza, clics que
//             revelan un calamar → plano general con texto → nada en la oscuridad; silueta del calamar.
//  2 (15–30)  EL GIGANTE CON DIENTES: plano completo, recorrido del cuerpo, cabeza y mandíbula, escala.
//  3 (30–45)  EL CEREBRO MÁS PESADO: cabeza → ilustración anatómica (espermaceti, «junk», cerebro).
//  4 (45–60)  EL DESCENSO: soplos en superficie, arqueo, la cola emerge, descenso vertical.
import {clamp, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {GiantSquid} from '../../ep22-calamar-gigante/character/GiantSquid';
import {poseFrom as squidPose} from '../../ep22-calamar-gigante/components/common';
import {L, SOUND_ORIGIN, SpermWhale} from '../character/SpermWhale';
import {BigTitle, Brand, Callout, Diver, Note, poseFrom, seg, toWorld, Vignette, win, WTrack} from '../components/common';
import {EV} from '../data/timeline';
import {ClickFlash, ClickWaves, DeepOcean, OceanFront, SurfaceWorld} from '../environment/Ocean';

const clicksEvery = (a: number, b: number, dt: number) => Array.from({length: Math.max(0, Math.floor((b - a) / dt) + 1)}, (_, i) => a + i * dt);
const blowAt = (t: number, list: number[]) => list.reduce((acc, b) => (t >= b && t < b + 2.6 ? (t - b) / 2.6 : acc), 0);

// ---------------- ESCENA 1 ----------------
const TR1: WTrack = [[0, 'ECHOLOCATION'], [5, 'SLOW_SWIM'], [9.5, 'ECHOLOCATION'], [12.5, 'PREY_DETECTION']];
const CL1 = [EV.hookClick, ...clicksEvery(1.2, 4.6, 0.55), ...clicksEvery(6.0, 9.4, 0.7), ...clicksEvery(10.0, 14.8, 0.45)];
export function scene01(t: number): SceneOut {
  const s = 0.7;
  const P = {x: -560 + t * 40, y: 120 + t * 26 + Math.sin(t * 0.3) * 30, a: 0.45};
  const pose = poseFrom(TR1, t, {tone: 0.35, rim: 0.7});
  const W = (lx: number, ly = 0) => toWorld({x: lx, y: ly}, P.x, P.y, P.a, s);
  const eye = W(-0.305 * L, 0.055 * L);
  const head = W(-0.15 * L, -0.01 * L);
  const so = W(SOUND_ORIGIN.x, SOUND_ORIGIN.y);
  const squid = {x: 340 + t * 10, y: 1120 + Math.sin(t * 0.4) * 20};
  let c: Cam = cam(eye.x, eye.y, 5.2);
  if (t >= 0.9) c = shot(t, 0.9, 2.9, cam(eye.x, eye.y, 5.2), cam(head.x + 120, head.y, 1.45), 'cine');
  const tailW = W(-1.2 * L);
  const wide = cam((tailW.x + squid.x + 200) / 2, (tailW.y + squid.y) / 2 + 380, 0.46);
  if (t >= EV.hookText) c = wide;
  if (t >= 5) c = shot(t, 5, 10, wide, cam(W(-0.35 * L).x + 200, W(-0.35 * L).y + 60, 0.78), 'inOut');
  if (t >= 10) c = shot(t, 10, 14.5, cam(W(-0.35 * L).x + 200, W(-0.35 * L).y + 60, 0.78), cam((head.x + squid.x) / 2, (head.y + squid.y) / 2, 0.62), 'cine');
  c = breathe(c, t, 0.25);
  const reveal = clamp((t - 1.6) / 1.4) * 0.35 + seg(t, 10.5, 14) * 0.6;
  const sp = squidPose([[0, 'SLOW_SWIM']], t, {tone: lerp(0.95, 0.55, reveal), rim: 0.3});
  return {
    svg: (
      <DeepOcean cam={c} t={t} depth={0.92}>
        <g opacity={clamp(reveal * 1.6)}>
          <GiantSquid uid="s1sq" pose={sp} x={squid.x} y={squid.y} scale={0.45} dir={-1} angle={0.05} />
        </g>
        <ClickWaves t={t} origin={so} dir={Math.atan2(squid.y - so.y, squid.x - so.x)} clicks={CL1} targets={[{x: squid.x - 120, y: squid.y}]} speed={1700} maxR={2600} />
        <SpermWhale uid="w1" pose={pose} x={P.x} y={P.y} angle={P.a} scale={s} />
        <ClickFlash t={t} origin={so} clicks={CL1} />
      </DeepOcean>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette />
        <BigTitle k={win(t, EV.hookText, 7.2, 0.35)} lines={['¡EL GIGANTE QUE', 'CAZA CON SONIDO!']} top={300} size={84} />
        <Note k={win(t, 1.4, 14.6, 0.4)} text="Visualización educativa: el sonido no se ve" top={1700} />
      </>
    ),
  };
}

// ---------------- ESCENA 2 ----------------
const TR2: WTrack = [[15, 'SLOW_SWIM'], [23, 'SQUID_ENCOUNTER'], [27, 'SLOW_SWIM']];
export function scene02(t: number): SceneOut {
  const s = 0.62;
  const P = {x: -100 + (t - 15) * 70, y: 160 + Math.sin(t * 0.35) * 24, a: -0.06 + Math.sin(t * 0.2) * 0.03};
  const jaw = win(t, 23.8, 26.8, 0.6) * 0.75;
  const pose = poseFrom(TR2, t, {tone: 0.12, rim: 0.85, jaw}, 1.7);
  const W = (lx: number, ly = 0) => toWorld({x: lx, y: ly}, P.x, P.y, P.a, s);
  const mid = W(-0.5 * L);
  const tail = W(-0.9 * L);
  const head = W(-0.12 * L, 0.03 * L);
  let c: Cam = cam(mid.x, mid.y, 0.95);
  if (t >= 19) c = shot(t, 19, 20, cam(mid.x, mid.y, 0.95), cam(tail.x, tail.y, 1.7), 'cine');
  if (t >= 20) c = cam(lerp(tail.x, head.x, seg(t, 20, 23)), lerp(tail.y, head.y, seg(t, 20, 23)), 1.7);
  if (t >= 23) c = cam(head.x - 40, head.y + 30, lerp(1.7, 2.1, seg(t, 23, 24)));
  if (t >= 27) c = shot(t, 27, 28.2, cam(head.x - 40, head.y + 30, 2.1), cam(mid.x, mid.y + 120, 0.6), 'cine');
  c = breathe(c, t, 0.22);
  const sk = win(t, 27.8, 29.9, 0.35);
  const diverW = W(-0.5 * L, 0.34 * L);
  const jawS = toScreen(c, ...xy(W(-0.13 * L, 0.115 * L)));
  const bar = (len: number) => len * s * c.zoom;
  const tailS = toScreen(c, ...xy(W(-L)));
  const noseS = toScreen(c, ...xy(W(0)));
  return {
    svg: (
      <DeepOcean cam={c} t={t} depth={0.45} glow={0}>
        {t > 27 && <g opacity={sk}><Diver x={diverW.x} y={diverW.y} h={180 * s} t={t} /></g>}
        <SpermWhale uid="w2" pose={pose} x={P.x} y={P.y} angle={P.a} scale={s} />
      </DeepOcean>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette />
        <Callout k={win(t, 24.0, 26.8)} x={jawS.x} y={jawS.y} tx={140} ty={1180} text="mandíbula estrecha · 20–26 dientes por lado (NOAA)" />
        {sk > 0.01 && (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: sk}}>
            <line x1={tailS.x} y1={noseS.y - 220} x2={noseS.x} y2={noseS.y - 220} stroke="#ffd8a8" strokeWidth={4} />
            <line x1={noseS.x - bar(1200)} y1={noseS.y - 180} x2={noseS.x} y2={noseS.y - 180} stroke="#9ff0ff" strokeWidth={4} />
            <text x={540} y={noseS.y - 236} textAnchor="middle" fill="#ffd8a8" fontSize={26} fontWeight={800} fontFamily={FONT_FAMILY}>macho adulto: hasta unos 16 m</text>
            <text x={540} y={noseS.y - 150} textAnchor="middle" fill="#9ff0ff" fontSize={24} fontWeight={800} fontFamily={FONT_FAMILY}>hembra: unos 12 m</text>
          </svg>
        )}
        <Note k={sk} text="Escala aproximada · persona de 1,8 m · medidas: NOAA Fisheries" top={1180} />
        <Brand />
      </>
    ),
  };
}
const xy = (p: {x: number; y: number}): [number, number] => [p.x, p.y];

// ---------------- ESCENA 3 ----------------
const TR3: WTrack = [[30, 'SLOW_SWIM'], [34, 'SURFACE_REST']];
export function scene03(t: number): SceneOut {
  const s = 0.62;
  const P = {x: 900 + (t - 30) * lerp(60, 10, seg(t, 32, 35)), y: 200, a: -0.03};
  const cut = seg(t, 35.2, 37.6);
  const pose = poseFrom(TR3, t, {tone: lerp(0.2, 0.05, cut), rim: 0.8, cut}, 0.6);
  const W = (lx: number, ly = 0) => toWorld({x: lx, y: ly}, P.x, P.y, P.a, s);
  const head = W(-0.16 * L, -0.01 * L);
  let c: Cam = cam(head.x - 60, head.y + 40, 1.75);
  c = breathe(c, t, 0.15);
  const S = (lx: number, ly: number) => toScreen(c, ...xy(W(lx * L, ly * L)));
  const sp = S(-0.12, -0.065);
  const jk = S(-0.1, 0.012);
  const br = S(-0.3, 0);
  return {
    svg: (
      <DeepOcean cam={c} t={t} depth={0.55} glow={0}>
        <SpermWhale uid="w3" pose={pose} x={P.x} y={P.y} angle={P.a} scale={s} />
      </DeepOcean>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette />
        <Callout k={win(t, 38.4, 44.8)} x={br.x} y={br.y} tx={110} ty={1150} text="cerebro (el más pesado conocido)" />
        <Callout k={win(t, 39.4, 44.8)} x={sp.x} y={sp.y} tx={560} ty={560} text="órgano del espermaceti (aceite)" align="right" />
        <Callout k={win(t, 40.4, 44.8)} x={jk.x} y={jk.y} tx={560} ty={1290} text="«junk»: tejido que conduce el sonido" align="right" />
        <Note k={win(t, 35.6, 44.8)} text="Ilustración anatómica simplificada (no a escala exacta)" top={1700} />
        <Brand />
      </>
    ),
  };
}

// ---------------- ESCENA 4 ----------------
const TR4: WTrack = [[45, 'SURFACE_BREATHING'], [49.4, 'DIVE_PREPARATION'], [EV.flukeUp - 0.4, 'TAIL_LIFT'], [55, 'DEEP_DESCENT']];
export function scene04(t: number): SceneOut {
  const s = 0.5;
  if (t < 55) {
    // superficie: soplos → arqueo → la cola emerge
    const dive = seg(t, 49.8, 54.8);
    const a = lerp(-0.02, 1.32, Math.pow(dive, 1.3));
    const P = {x: 150 + (t - 45) * 30 + dive * 220, y: lerp(0.098 * L * s - 6, 0.82 * L * s, Math.pow(dive, 1.15)), a};
    const pose = poseFrom(TR4, t, {blow: blowAt(t, EV.blows), fv: lerp(0.3, 0.95, seg(t, 50.6, 53.5)), rim: 0.9, tone: 0}, 0.4);
    const mid = toWorld({x: -0.5 * L, y: 0}, 150 + (t - 45) * 30, 0, 0, s);
    let c: Cam = cam(mid.x + 120, -120, 0.7);
    if (t >= 49.5) c = shot(t, 49.5, 52.5, cam(mid.x + 120, -120, 0.7), cam(P.x - 200, -180, 0.56), 'cine');
    c = breathe(c, t, 0.2);
    return {
      svg: (
        <SurfaceWorld cam={c} t={t}>
          <SpermWhale uid="w4" pose={pose} x={P.x} y={P.y} angle={P.a} scale={s} />
        </SurfaceWorld>
      ),
      overlay: (
        <>
          <Vignette k={0.5} />
          <Callout k={win(t, 45.8, 48.6)} x={toScreen(c, P.x - 0.03 * L * s, -0.1 * L * s).x} y={toScreen(c, P.x - 0.03 * L * s, -0.1 * L * s).y} tx={120} ty={560} text="soplo: exhala por el espiráculo" />
          <Brand />
        </>
      ),
    };
  }
  // descenso vertical: la cámara baja con el animal
  const u = seg(t, 55, 60);
  const depthM = lerp(40, 620, u);
  const P = {x: 0, y: depthM * 10, a: 1.25 + Math.sin(t * 0.4) * 0.04};
  const pose = poseFrom(TR4, t, {tone: lerp(0.1, 0.7, u), rim: lerp(0.8, 0.3, u)}, 0.4);
  const mid = toWorld({x: -0.4 * L, y: 0}, P.x, P.y, P.a, s);
  let c: Cam = cam(mid.x + 60, mid.y + 120, 0.62);
  c = breathe(c, t, 0.2);
  return {
    svg: (
      <DeepOcean cam={c} t={t} depth={lerp(0.25, 0.85, u)} glow={0.4}>
        <SpermWhale uid="w4d" pose={pose} x={P.x} y={P.y} angle={P.a} scale={s} />
      </DeepOcean>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette />
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: win(t, 55.3, 59.9, 0.4)}}>
          <line x1={960} y1={360} x2={960} y2={1260} stroke="#cfe8ff" strokeWidth={4} opacity={0.6} />
          {[0, 200, 400, 600, 800].map((m) => (
            <g key={m}>
              <line x1={944} y1={360 + m * 1.125} x2={976} y2={360 + m * 1.125} stroke="#cfe8ff" strokeWidth={3} />
              <text x={930} y={368 + m * 1.125} textAnchor="end" fill="#cfe8ff" fontSize={24} fontWeight={700} fontFamily={FONT_FAMILY}>{m} m</text>
            </g>
          ))}
          <circle cx={960} cy={360 + depthM * 1.125} r={12} fill="#7ae8ff" />
        </svg>
        <div style={{position: 'absolute', right: 60, top: 1290, width: 520, textAlign: 'right', fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 24, color: '#ffd8a8', opacity: win(t, 56, 59.9, 0.4)}}>inmersión habitual: unos 600 m y hasta 45 min (NOAA) · cada inmersión varía</div>
        <Brand />
      </>
    ),
  };
}
