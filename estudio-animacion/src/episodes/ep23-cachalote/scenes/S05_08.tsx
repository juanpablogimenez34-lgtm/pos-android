// ESCENAS 5–8.
//  5 (60–75)   SU SONAR NATURAL: cabeza → recorrido de los clics → ecos que regresan (cardumen y calamar).
//  6 (75–90)   LA PRESA EN LA OSCURIDAD (recreación): un calamar nada; el cachalote se acerca; los clics se
//              aceleran hasta un zumbido (medidor de ritmo).
//  7 (90–105)  EL ENCUENTRO CON EL CALAMAR GIGANTE (reconstrucción): brazos y tentáculos; ambos en el encuadre.
//  8 (105–120) UNA CAZA ENORME (reconstrucción): marcas circulares; el cachalote cambia de orientación; las
//              siluetas se pierden en la oscuridad. Sin batalla inventada.
import {clamp, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {GiantSquid} from '../../ep22-calamar-gigante/character/GiantSquid';
import {DeepFish} from '../../ep22-calamar-gigante/character/Others';
import {poseFrom as squidPose, SqTrack} from '../../ep22-calamar-gigante/components/common';
import {L, SOUND_ORIGIN, SpermWhale} from '../character/SpermWhale';
import {Brand, Callout, Note, poseFrom, RecTag, seg, toWorld, Vignette, Wash, win, WTrack} from '../components/common';
import {EV} from '../data/timeline';
import {ClickFlash, ClickWaves, DeepOcean, OceanFront} from '../environment/Ocean';

const xy = (p: {x: number; y: number}): [number, number] => [p.x, p.y];
const clicksEvery = (a: number, b: number, dt: number) => Array.from({length: Math.max(0, Math.floor((b - a) / dt) + 1)}, (_, i) => a + i * dt);

const School: React.FC<{cx: number; cy: number; t: number; n?: number; tone?: number}> = ({cx, cy, t, n = 14, tone = 0.4}) => (
  <g opacity={1 - tone * 0.5}>
    {Array.from({length: n}, (_, i) => {
      const a = i * 2.39996;
      const r = 40 + (i % 5) * 34;
      return <DeepFish key={i} x={cx + Math.cos(a + t * 0.25) * r * 1.6 - t * 6} y={cy + Math.sin(a + t * 0.25) * r * 0.7} t={t + i} s={0.7 + (i % 3) * 0.12} dir={-1} />;
    })}
  </g>
);

// ---------------- ESCENA 5 ----------------
const TR5: WTrack = [[60, 'SLOW_SWIM'], [62.5, 'ECHOLOCATION']];
const CL5 = [...clicksEvery(63.3, 68.5, 0.62), ...clicksEvery(69.4, 74.6, 0.75)];
export function scene05(t: number): SceneOut {
  const s = 0.55;
  const P = {x: -600 + (t - 60) * 60, y: 200, a: -0.05};
  const pose = poseFrom(TR5, t, {tone: 0.3, rim: 0.7}, 2.2);
  const W = (lx: number, ly = 0) => toWorld({x: lx, y: ly}, P.x, P.y, P.a, s);
  const head = W(-0.14 * L);
  const so = W(SOUND_ORIGIN.x, SOUND_ORIGIN.y);
  const school = {x: 1200, y: -40};
  const squid = {x: 1500, y: 560};
  let c: Cam = cam(head.x + 40, head.y, 1.6);
  if (t >= 64) c = shot(t, 64, 67.5, cam(head.x + 40, head.y, 1.6), cam(so.x + 380, 260, 0.4), 'cine');
  if (t >= 67.5) c = cam(so.x + 380, 260, 0.4 - (t - 67.5) * 0.003);
  c = breathe(c, t, 0.2);
  const sp = squidPose([[0, 'SLOW_SWIM']], t, {tone: 0.55, rim: 0.3});
  const soS = toScreen(c, so.x, so.y);
  const schS = toScreen(c, school.x, school.y);
  return {
    svg: (
      <DeepOcean cam={c} t={t} depth={0.88}>
        <School cx={school.x} cy={school.y} t={t} />
        <GiantSquid uid="s5sq" pose={sp} x={squid.x} y={squid.y} scale={0.32} dir={-1} />
        <ClickWaves t={t} origin={so} dir={0.05} spread={0.5} clicks={CL5} targets={[school, {x: squid.x - 60, y: squid.y}]} speed={1500} maxR={2700} />
        <SpermWhale uid="w5" pose={pose} x={P.x} y={P.y} angle={P.a} scale={s} />
        <ClickFlash t={t} origin={so} clicks={CL5} />
      </DeepOcean>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette />
        <Callout k={win(t, 63.6, 67.4)} x={soS.x} y={soS.y} tx={160} ty={560} text="clics: se producen en la cabeza" />
        <Callout k={win(t, 69.8, 74.6)} x={schS.x} y={schS.y} tx={560} ty={560} text="ecos que regresan" align="right" />
        <Note k={win(t, 63.4, 74.8, 0.4)} text="Visualización educativa del sonido · los ecos (ámbar) vuelven al cachalote" />
        <Brand />
      </>
    ),
  };
}

// ---------------- ESCENA 6 ----------------
const TR6: WTrack = [[75, 'SLOW_SWIM'], [80, 'PREY_DETECTION'], [EV.buzzStart, 'HUNTING']];
// clics que se aceleran: intervalo de 0,7 s a 0,05 s (zumbido)
const CL6 = (() => {
  const out: number[] = [];
  let tc = 80.2;
  while (tc < EV.buzzEnd) {
    out.push(tc);
    const u = clamp((tc - 80.2) / (EV.buzzEnd - 80.2));
    tc += lerp(0.7, 0.05, Math.pow(u, 1.6));
  }
  return out;
})();
export const CLICKS_S6 = CL6;
export function scene06(t: number): SceneOut {
  const s = 0.55;
  const squid = {x: 700 + (t - 75) * 25, y: 80 + Math.sin(t * 0.5) * 30};
  const u = seg(t, 79, 89.5);
  const P = {x: lerp(-1500, squid.x - 260, u), y: lerp(-260, squid.y + 20, u), a: lerp(0.18, 0.02, u)};
  const pose = poseFrom(TR6, t, {tone: 0.35, rim: 0.7, jaw: win(t, 88.6, 90, 0.4) * 0.35}, 0.9);
  const W = (lx: number, ly = 0) => toWorld({x: lx, y: ly}, P.x, P.y, P.a, s);
  const so = W(SOUND_ORIGIN.x, SOUND_ORIGIN.y);
  let c: Cam = cam(squid.x, squid.y, 1.3);
  if (t >= 80) c = shot(t, 80, 84, cam(squid.x, squid.y, 1.3), cam((so.x + squid.x) / 2 - 380, squid.y - 60, 0.46), 'cine');
  if (t >= 84) c = cam(lerp((so.x + squid.x) / 2 - 380, squid.x - 560, seg(t, 84, 89.5)), squid.y - 40, lerp(0.46, 0.66, seg(t, 84, 89.5)));
  c = breathe(c, t, 0.22);
  const sp = squidPose([[75, 'SLOW_SWIM'], [86, 'TARGET_DETECTION']], t, {tone: 0.45, rim: 0.4});
  // medidor de ritmo de clics (últimos 2,5 s)
  const recent = CL6.filter((x) => x <= t && x > t - 2.5);
  return {
    svg: (
      <DeepOcean cam={c} t={t} depth={0.9}>
        <GiantSquid uid="s6sq" pose={sp} x={squid.x} y={squid.y} scale={0.3} dir={-1} angle={0.05} />
        <ClickWaves t={t} origin={so} dir={Math.atan2(squid.y - so.y, squid.x - so.x)} spread={0.35} clicks={CL6} targets={[squid]} speed={1500} maxR={1800} k={0.8} />
        <SpermWhale uid="w6" pose={pose} x={P.x} y={P.y} angle={P.a} scale={s} />
        <ClickFlash t={t} origin={so} clicks={CL6} />
      </DeepOcean>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette />
        {t > 80.4 && (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: win(t, 80.4, 89.8, 0.4)}}>
            <rect x={140} y={1230} width={800} height={70} rx={14} fill="rgba(4,14,28,0.7)" stroke="#9ff0ff" strokeWidth={2} />
            {recent.map((x, i) => (
              <line key={i} x1={140 + 800 * (1 - (t - x) / 2.5)} y1={1242} x2={140 + 800 * (1 - (t - x) / 2.5)} y2={1288} stroke="#9ff0ff" strokeWidth={3} />
            ))}
            <text x={540} y={1222} textAnchor="middle" fill="#9ff0ff" fontSize={24} fontWeight={800} fontFamily={FONT_FAMILY}>{t > EV.buzzStart ? 'ZUMBIDO: clics muy rápidos' : 'ritmo de clics'}</text>
          </svg>
        )}
        <RecTag k={win(t, 75.3, 89.8, 0.4)} text="RECREACIÓN ANIMADA" />
        <Brand />
      </>
    ),
  };
}

// ---------------- ESCENAS 7 y 8 (reconstrucción del encuentro) ----------------
const SQ = {x: 300, y: 260, s: 0.52};
const SQT: SqTrack = [[90, 'DEEP_IDLE'], [94, 'EXPLORING'], [99, 'TARGET_DETECTION'], [103, 'THREAT_RESPONSE'], [112, 'DEEP_RETREAT']];
const TRW: WTrack = [[90, 'SLOW_SWIM'], [96, 'SQUID_ENCOUNTER'], [110, 'SLOW_SWIM'], [115, 'FINAL_RETREAT']];
function encounter(t: number) {
  const s = 0.62;
  const u = seg(t, 91, 101);
  const turn = seg(t, 110, 116);
  const P = {x: lerp(-1700, -320, u) + turn * 300, y: lerp(-500, -140, u) - turn * 500, a: lerp(0.22, 0.06, u) - turn * 0.55};
  const pose = poseFrom(TRW, t, {tone: lerp(0.4, 0.25, u) + seg(t, 114, 120) * 0.5, rim: 0.7, jaw: win(t, 101, 109, 1) * 0.3}, 2.9);
  const sqx = SQ.x + seg(t, 112, 120) * 380;
  const sqy = SQ.y + seg(t, 112, 120) * 300 + Math.sin(t * 0.5) * 16;
  const sp = squidPose(SQT, t, {tone: 0.35 + seg(t, 114, 120) * 0.5, rim: 0.5, look: {x: -900, y: -300}});
  return {s, P, pose, sp, sqx, sqy};
}
export function scene07(t: number): SceneOut {
  const e = encounter(t);
  let c: Cam = cam(e.sqx + 220, e.sqy, 1.1);
  if (t >= 95) c = shot(t, 95, 100, cam(e.sqx + 220, e.sqy, 1.1), cam(-500, 20, 0.48), 'cine');
  if (t >= 100) c = shot(t, 100, 104.5, cam(-500, 20, 0.48), cam(-470, 60, 0.52), 'cine');
  c = breathe(c, t, 0.25);
  return {
    svg: (
      <DeepOcean cam={c} t={t} depth={0.95}>
        <GiantSquid uid="s7sq" pose={e.sp} x={e.sqx} y={e.sqy} scale={SQ.s} dir={-1} angle={-0.08} />
        <SpermWhale uid="w7" pose={e.pose} x={e.P.x} y={e.P.y} angle={e.P.a} scale={e.s} />
      </DeepOcean>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette />
        <Callout k={win(t, 92.0, 95.8)} x={toScreen(c, e.sqx + 120, e.sqy).x} y={toScreen(c, e.sqx + 120, e.sqy).y} tx={160} ty={560} text="calamar gigante (Architeuthis dux)" />
        <RecTag k={win(t, 90.3, 104.8, 0.4)} />
        <Brand />
      </>
    ),
  };
}
export function scene08(t: number): SceneOut {
  const e = encounter(t);
  const W = (lx: number, ly = 0) => toWorld({x: lx, y: ly}, e.P.x, e.P.y, e.P.a, e.s);
  const head = W(-0.12 * L, -0.02 * L);
  let c: Cam = cam(head.x, head.y, 2.2);
  if (t >= 109.6) c = shot(t, 109.6, 112, cam(head.x, head.y, 2.2), cam(0, 0, 0.45), 'cine');
  if (t >= 112) c = cam(lerp(0, 120, seg(t, 112, 120)), lerp(0, -100, seg(t, 112, 120)), lerp(0.45, 0.36, seg(t, 112, 120)));
  c = breathe(c, t, 0.25);
  const rings = [0, 1, 2, 3, 4].map((i) => toScreen(c, ...xy(W(-(0.08 + i * 0.035) * L, -0.02 * L))));
  const rk = win(t, 105.8, 109.4, 0.4);
  return {
    svg: (
      <DeepOcean cam={c} t={t} depth={0.96}>
        <GiantSquid uid="s8sq" pose={e.sp} x={e.sqx} y={e.sqy} scale={SQ.s} dir={-1} angle={-0.08} />
        <SpermWhale uid="w8" pose={e.pose} x={e.P.x} y={e.P.y} angle={e.P.a} scale={e.s} />
      </DeepOcean>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette />
        {rk > 0.01 && (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: rk}}>
            {rings.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={34} fill="none" stroke="#ffd8a8" strokeWidth={3} strokeDasharray="8 6" />)}
          </svg>
        )}
        <Callout k={rk} x={rings[2].x} y={rings[2].y - 30} tx={140} ty={560} text="marcas circulares atribuidas a ventosas" />
        <Wash k={0.45 * seg(t, 116, 120)} />
        <RecTag k={win(t, 105.3, 119.8, 0.4)} />
        <Brand />
      </>
    ),
  };
}
