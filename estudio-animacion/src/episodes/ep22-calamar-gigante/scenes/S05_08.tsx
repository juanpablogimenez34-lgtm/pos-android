// ESCENAS 5–8.
//  5 (60–75)   OCHO BRAZOS Y DOS TENTÁCULOS: brazos numerados; tentáculos resaltados; maza y ventosa con anillo dentado.
//  6 (75–90)   LA CAZA EN LA OSCURIDAD (recreación): un pez se acerca; el calamar se orienta; tentáculos y captura.
//  7 (90–105)  EL PICO ESCONDIDO: los brazos acercan la presa; corona vista de frente; pico y rádula.
//  8 (105–120) EL PODER DE SU PROPULSIÓN: el manto se contrae, el sifón expulsa agua y el animal se desplaza y gira.
import {AbsoluteFill} from 'remotion';
import {clamp, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {armTips, GiantSquid} from '../character/GiantSquid';
import {DeepFish, FrontCrown} from '../character/Others';
import {Brand, Callout, poseFrom, RecTag, seg, SqTrack, strike, toLocal, toWorld, Vignette, win} from '../components/common';
import {EV} from '../data/timeline';
import {OceanBack, OceanFront} from '../environment/OpenOcean';

const f1 = (n: number) => n.toFixed(1);

// ---------------- ESCENA 5 ----------------
const TR5: SqTrack = [[60, 'EXPLORING'], [64, 'DEEP_IDLE'], [69, 'EXPLORING']];
export function scene05(t: number): SceneOut {
  const P = {x: -120, y: 260, a: 0.02, s: 0.62};
  const pose = poseFrom(TR5, t, {spread: 0.55, tone: 0.2, rim: 0.6});
  const tips = armTips(pose);
  const club = toWorld({x: 660, y: 0}, P.x, P.y, P.a, P.s);
  let c: Cam = cam(P.x + 260, P.y, 1.3);
  if (t >= 69) c = shot(t, 69, 70.5, cam(P.x + 260, P.y, 1.3), cam(club.x, club.y, 3.0), 'cine');
  if (t >= 70.5) c = cam(club.x, club.y, 3.0);
  c = breathe(c, t, 0.2);
  const tipsS = tips.map((p) => {
    const w = toWorld(p, P.x, P.y, P.a, P.s);
    return toScreen(c, w.x, w.y);
  });
  const nk = win(t, 60.4, 64.6, 0.4);
  const tk = win(t, 64.4, 69.2, 0.4);
  const ck = win(t, 70.8, 74.8, 0.4);
  const tentS = [toScreen(c, ...xy(toWorld({x: 640, y: 26}, P.x, P.y, P.a, P.s))), toScreen(c, ...xy(toWorld({x: 640, y: -26}, P.x, P.y, P.a, P.s)))];
  return {
    svg: (
      <OceanBack cam={c} t={t} depth={0.85}>
        <GiantSquid uid="s5" x={P.x} y={P.y} angle={P.a} scale={P.s} pose={pose} />
      </OceanBack>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette />
        {nk > 0.01 && (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: nk}}>
            {tipsS.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={20} fill="rgba(6,16,30,0.75)" stroke="#ffd8a8" strokeWidth={2} />
                <text x={p.x} y={p.y + 8} textAnchor="middle" fill="#ffd8a8" fontSize={22} fontWeight={900} fontFamily={FONT_FAMILY}>{i + 1}</text>
              </g>
            ))}
          </svg>
        )}
        {tk > 0.01 && (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: tk}}>
            {tentS.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={40} fill="none" stroke="#7ae8ff" strokeWidth={4} strokeDasharray="10 6" />)}
          </svg>
        )}
        <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 40, color: '#ffd8a8', opacity: nk}}>8 BRAZOS</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 40, color: '#7ae8ff', opacity: tk}}>2 TENTÁCULOS DE ALIMENTACIÓN</div>
        {ck > 0.01 && (
          <AbsoluteFill style={{pointerEvents: 'none', opacity: ck}}>
            <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
              <circle cx={540} cy={560} r={170} fill="rgba(6,16,30,0.85)" stroke="#ffd8a8" strokeWidth={3} />
              <circle cx={540} cy={560} r={120} fill="#f0c0b0" stroke="#8a4a3a" strokeWidth={4} />
              <circle cx={540} cy={560} r={70} fill="#c8786a" />
              {Array.from({length: 28}, (_, i) => {
                const a = (i / 28) * Math.PI * 2;
                return <path key={i} d={`M${f1(540 + Math.cos(a) * 96)},${f1(560 + Math.sin(a) * 96)} L${f1(540 + Math.cos(a + 0.06) * 78)},${f1(560 + Math.sin(a + 0.06) * 78)} L${f1(540 + Math.cos(a + 0.12) * 96)},${f1(560 + Math.sin(a + 0.12) * 96)}`} fill="#f4ead8" stroke="#6a4a3a" strokeWidth={1.5} />;
              })}
            </svg>
            <div style={{position: 'absolute', left: 0, right: 0, top: 750, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 30, color: '#ffd8a8'}}>ventosa con anillo córneo dentado (esquema)</div>
          </AbsoluteFill>
        )}
        <Brand />
      </>
    ),
  };
}
const xy = (p: {x: number; y: number}): [number, number] => [p.x, p.y];

// ---------------- ESCENA 6 (caza) y 7 (pico) ----------------
const P6 = {x: -260, y: 360, s: 0.9};
const TR67: SqTrack = [[75, 'EXPLORING'], [80, 'TARGET_DETECTION'], [85.6, 'TENTACLE_EXTEND'], [86.3, 'PREY_GRAB'], [86.7, 'TENTACLE_RETRACT'], [89, 'ARM_MANIPULATION'], [95, 'BEAK_FEEDING']];
const angle6 = (t: number) => lerp(0.35, -0.12, seg(t, 80, 84.5));
const fishPath = (t: number) => {
  const u = seg(t, 75, 84);
  return {x: lerp(1500, 760, u) + Math.sin(t * 1.3) * 12, y: lerp(-260, 120, u) + Math.sin(t * 1.7) * 8};
};
const FISH_AT_STRIKE = fishPath(EV.huntStrike);
const TGT6 = toLocal(FISH_AT_STRIKE, P6.x, P6.y, angle6(EV.huntStrike), P6.s);

function hunt(t: number) {
  const a = angle6(t);
  const st = strike(t, EV.huntStrike, TGT6, {x: 320, y: 4}, 0.4, 2.2);
  const pose = poseFrom(TR67, t, {look: toLocal(fishPath(Math.min(t, EV.huntStrike)), P6.x, P6.y, a, P6.s), tentacles: [{tip: st.tip, ext: st.ext}, {tip: {x: st.tip.x, y: st.tip.y - 20}, ext: st.ext}], tone: 0.25, rim: 0.7});
  let fish = fishPath(t);
  let flail = 0;
  if (t >= EV.huntStrike + 0.32) {
    const local = st.carrying ? st.tip : {x: 320, y: 4};
    fish = toWorld(local, P6.x, P6.y, a, P6.s);
    flail = clamp(1 - (t - EV.huntStrike - 0.3) / 4);
  }
  return {a, st, pose, fish, flail};
}

export function scene06(t: number): SceneOut {
  const h = hunt(t);
  const head = toWorld({x: 0, y: 0}, P6.x, P6.y, h.a, P6.s);
  let c: Cam = cam(h.fish.x - 100, h.fish.y, 1.4);
  if (t >= 80) c = shot(t, 80, 84.5, cam(fishPath(80).x - 100, fishPath(80).y, 1.4), cam((head.x + h.fish.x) / 2 - 80, (head.y + h.fish.y) / 2, 0.72), 'cine');
  if (t >= 84.5) {
    const h0 = toWorld({x: 0, y: 0}, P6.x, P6.y, angle6(84.5), P6.s);
    c = cam(lerp((h0.x + FISH_AT_STRIKE.x) / 2 - 80, head.x + 260, seg(t, 86.6, 89)), lerp((h0.y + FISH_AT_STRIKE.y) / 2, head.y, seg(t, 86.6, 89)), lerp(0.72, 1.1, seg(t, 86.6, 89.5)));
  }
  c = breathe(c, t, 0.25);
  return {
    svg: (
      <OceanBack cam={c} t={t} depth={0.9}>
        <GiantSquid uid="s6" x={P6.x} y={P6.y} angle={h.a} scale={P6.s} pose={h.pose} />
        <DeepFish x={h.fish.x} y={h.fish.y} t={t} s={1.2} dir={-1} angle={t > EV.huntStrike ? h.a : 0} flail={h.flail} />
      </OceanBack>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette />
        <RecTag k={win(t, 75.3, 89.8, 0.4)} text="RECREACIÓN ANIMADA" />
        <Brand />
      </>
    ),
  };
}

export function scene07(t: number): SceneOut {
  const h = hunt(t);
  const crownW = toWorld({x: 240, y: 0}, P6.x, P6.y, h.a, P6.s);
  const front = t >= 95;
  let c: Cam = cam(crownW.x, crownW.y, 1.6);
  c = breathe(c, t, 0.2);
  const zoomBeak = seg(t, 100, 101.5);
  const crownScale = lerp(1.15, 2.8, zoomBeak);
  const eat = 1 - seg(t, 95.5, 100);
  return {
    svg: front ? (
      <OceanBack cam={cam(0, 0, 1)} t={t} depth={0.9}>
        <g transform="translate(0 -60)">
          <FrontCrown x={0} y={0} t={t} s={crownScale} open={0.5 + 0.2 * Math.sin(t * 0.8)} beak={0.5 + 0.5 * Math.sin(t * 4)} prey={eat} />
        </g>
      </OceanBack>
    ) : (
      <OceanBack cam={c} t={t} depth={0.9}>
        <GiantSquid uid="s7" x={P6.x} y={P6.y} angle={h.a} scale={P6.s} pose={h.pose} />
        <DeepFish x={h.fish.x} y={h.fish.y} t={t} s={1.2} dir={-1} angle={h.a} flail={h.flail} />
      </OceanBack>
    ),
    overlay: (
      <>
        {!front && <OceanFront cam={c} t={t} />}
        <Vignette />
        <Callout k={win(t, 96.0, 99.8)} x={540} y={900} tx={160} ty={420} text="corona de brazos (vista frontal)" />
        <Callout k={win(t, 101.6, 104.8)} x={540} y={830} tx={140} ty={420} text="pico córneo" />
        <Callout k={win(t, 102.4, 104.8)} x={560} y={950} tx={760} ty={1260} text="rádula: lengua dentada" align="right" />
        <RecTag k={win(t, 90.2, 94.8, 0.4)} text="RECREACIÓN ANIMADA" />
        <Brand />
      </>
    ),
  };
}

// ---------------- ESCENA 8 ----------------
const TR8: SqTrack = [[105, 'MANTLE_PULSE'], [110, 'JET_ESCAPE'], [115, 'DEEP_RETREAT'], [119, 'SLOW_SWIM']];
const burst = (t: number) => EV.jets.reduce((acc, tj) => acc + clamp((t - tj) / 0.7) ** 0.6, 0);

export function scene08(t: number): SceneOut {
  const a = lerp(0, -1.1, seg(t, 115, 119));
  const b = burst(t);
  // retrocede con el manto por delante (cada impulso del sifón empuja ≈ 120 unidades)
  const dist = b * 120;
  const px = 200 - dist * Math.cos(a * 0.5);
  const py = 300 - dist * Math.sin(a * 0.5) * 0.6;
  const pulseBoost = EV.jets.reduce((acc, tj) => Math.max(acc, clamp(1 - Math.abs(t - tj - 0.15) / 0.35)), 0);
  const pose = poseFrom(TR8, t, {pulse: lerp(0.15, 0.95, pulseBoost), jet: pulseBoost, siphon: t < 115 ? 1 : lerp(1, -0.2, seg(t, 115, 117)), tone: 0.2, rim: 0.7});
  const siphonW = toWorld({x: 40, y: 56}, px, py, a, 0.85);
  let c: Cam = cam(px - 120, py, 0.9);
  if (t >= 110) c = shot(t, 110, 111.5, cam(px - 120, py, 0.9), cam(siphonW.x, siphonW.y, 2.0), 'cine');
  if (t >= 111.5) c = cam(siphonW.x, siphonW.y, 2.0);
  if (t >= 114.5) c = shot(t, 114.5, 116.5, cam(siphonW.x, siphonW.y, 2.0), cam(px - 100, py - 100, 0.75), 'cine');
  if (t >= 116.5) c = cam(px - 100, py - 100, 0.75);
  c = breathe(c, t, 0.25);
  const ss = toScreen(c, siphonW.x, siphonW.y);
  return {
    svg: (
      <OceanBack cam={c} t={t} depth={0.85}>
        <GiantSquid uid="s8" x={px} y={py} angle={a} scale={0.85} pose={pose} />
      </OceanBack>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette />
        <Callout k={win(t, 105.8, 109.6)} x={540} y={960} tx={160} ty={560} text="el manto se contrae" />
        <Callout k={win(t, 111.6, 114.4)} x={ss.x} y={ss.y} tx={160} ty={560} text="sifón: expulsa el agua" />
        <Brand />
      </>
    ),
  };
}
