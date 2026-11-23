// ESCENAS 1–4.
//  1 (0–15)  EL FRANCOTIRADOR: mosca en una hoja y la silueta del pez debajo; disparo, la cámara sigue el
//            chorro, impacto, caída en cámara lenta, carrera y captura; primer plano del pez.
//  2 (15–30) CONOCE AL PEZ ARQUERO: nada entre raíces; vista lateral de sus bandas; la cámara sube a la superficie.
//  3 (30–45) LOS OJOS DEL CAZADOR: primer plano del ojo; un escarabajo camina por una rama; línea de observación.
//  4 (45–60) EL ENGAÑO DE LA LUZ: trayectoria real de la luz (se quiebra en la superficie) y posición aparente.
import {AbsoluteFill} from 'remotion';
import {clamp, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {ArcherFish} from '../character/ArcherFish';
import {Insect, PerchLeaf} from '../character/Insects';
import {BigTitle, Brand, Callout, refraction, seg, Vignette, win} from '../components/common';
import {Hunt, huntAt, remap} from '../components/hunt';
import {huntLayers} from '../components/HuntView';
import {EV} from '../data/timeline';
import {Branch, MangroveBack, MangroveFront} from '../environment/Mangrove';

const f1 = (n: number) => n.toFixed(1);
/** Plano partido aire/agua: la superficie queda en y ≈ 780 de pantalla (el pez y la boca, por encima de
 *  la franja de subtítulos; el insecto, en la parte alta). `_surfaceAt` se conserva por compatibilidad. */
const zoomSplit = (cx: number, z: number, _surfaceAt = 780): Cam => {
  const zz = z * 0.76;
  return cam(cx, (960 - 780) / zz, zz);
};

// ---------------- ESCENA 1 ----------------
const H1: Hunt = {perch: {pivot: {x: 120, y: -470}, len: 150, base: 0.32, seed: 2}, insect: 'fly', insectScale: 2.0, from: {x: -260, y: 220}, approach: [0, 0.7], aimMouth: {x: 30, y: 10}, aimAngle: -0.95, tShot: EV.shots[0].t, knock: {x: 70, y: -140}, captureDelay: 0.9, after: {x: 420, y: 260}, seed: 3};
const R1 = remap([[0, 0], [1.6, 1.6], [4.6, 2.6], [20, 18]]);

export function scene01(t: number): SceneOut {
  const T = R1(t);
  const hf = huntAt(H1, T);
  const L = huntLayers(hf, T, 'a1');
  const f = hf.fish;
  let c: Cam = zoomSplit(60, 1.75, 1080);
  if (t >= 4.6) c = shot(t, 4.6, 6.5, zoomSplit(60, 1.75, 1080), cam(f.x + 60, f.y - 40, 2.2), 'cine');
  if (t >= 6.5) c = cam(f.x + 60, f.y - 40, lerp(2.2, 2.0, seg(t, 7, 11)));
  if (t >= 11) c = shot(t, 11, 12.5, cam(f.x + 60, f.y - 40, 2.0), cam(f.x + 40, f.y - 10, 3.2), 'cine');
  if (t >= 12.5) c = cam(f.x + 40, f.y - 10, 3.2);
  c = breathe(c, t, 0.25);
  return {
    svg: (
      <MangroveBack cam={c} t={T} trees={[-700, 800, 1900]} above={<><Branch x={-200} y={-640} len={520} ang={0.25} t={T} seed={3} />{L.above}</>} free={L.free}>
        {L.below}
      </MangroveBack>
    ),
    overlay: (
      <>
        <MangroveFront cam={c} t={T} />
        <Vignette />
        <BigTitle k={win(t, EV.hookText, 7.2, 0.4)} lines={['¡UN PEZ', 'FRANCOTIRADOR!']} top={1150} size={90} />
        <Brand k={clamp((t - 8) / 1)} />
      </>
    ),
  };
}

// ---------------- ESCENA 2 ----------------
export function scene02(t: number): SceneOut {
  const u = (t - 15) / 15;
  const fx = lerp(-700, 600, u);
  const fy = 380 - 220 * seg(t, 24, 29) + Math.sin(t * 0.9) * 20;
  const angle = Math.cos(t * 0.9) * 0.05 - 0.15 * win(t, 24, 29.5, 1);
  let c: Cam = cam(fx + 60, fy, 1.6);
  if (t >= 19.5) c = shot(t, 19.5, 21, cam(fx + 60, fy, 1.6), cam(fx, fy, 2.7), 'cine');
  if (t >= 21) c = cam(fx, fy, 2.7);
  if (t >= 25) c = shot(t, 25, 29.5, cam(fx, fy, 2.7), zoomSplit(fx + 80, 1.3, 1100), 'cine');
  c = breathe(c, t, 0.3);
  return {
    svg: (
      <MangroveBack cam={c} t={t} trees={[-900, -100, 700, 1500]} above={<Branch x={200} y={-600} len={600} ang={-0.1} t={t} seed={7} />}>
        <ArcherFish uid="a2" x={fx} y={fy} angle={angle} look={{t, swim: 0.9, freq: 2.4}} />
        <ArcherFish uid="a2b" x={fx - 500} y={fy + 260} scale={0.8} look={{t: t + 3, swim: 0.8, tone: 0.6, hue: 1}} />
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

// ---------------- ESCENA 3 ----------------
const BEETLE = (t: number) => {
  const u = seg(t, 35.2, 39.5);
  return {x: lerp(-60, 170, u), y: -560 + Math.sin(u * Math.PI) * 4 - u * 12, walking: u > 0 && u < 1};
};

export function scene03(t: number): SceneOut {
  const fx = 40;
  const fy = 160;
  const angle = -0.35 - 0.15 * seg(t, 35, 40);
  const eye = {x: fx + Math.cos(angle) * 66 - Math.sin(angle) * -22, y: fy + Math.sin(angle) * 66 + Math.cos(angle) * -22};
  const b = BEETLE(t);
  const lookLocal = (() => {
    const dx = b.x - fx;
    const dy = b.y - fy;
    return {x: dx * Math.cos(-angle) - dy * Math.sin(-angle), y: dx * Math.sin(-angle) + dy * Math.cos(-angle)};
  })();
  let c: Cam = cam(eye.x, eye.y, 5.2);
  if (t >= 34.6) c = shot(t, 34.6, 36.4, cam(eye.x, eye.y, 5.2), zoomSplit(60, 1.45, 1150), 'cine');
  if (t >= 36.4) c = zoomSplit(60 + (t - 36.4) * 4, 1.45, 1150);
  c = breathe(c, t, 0.2);
  const rf = refraction({x: b.x, y: b.y}, eye);
  const es = toScreen(c, eye.x, eye.y);
  const ps = toScreen(c, rf.P.x, 0);
  const bs = toScreen(c, b.x, b.y);
  const k = win(t, 40, 44.8, 0.5);
  return {
    svg: (
      <MangroveBack cam={c} t={t} trees={[-800, 900]} above={<Branch x={-450} y={-540} len={760} ang={-0.02} t={t} seed={11} n={11} />} free={<Insect x={b.x} y={b.y - 8} s={2.2} t={t} kind="beetle" state={b.walking ? 'flying' : 'perched'} />}>
        <ArcherFish uid="a3" x={fx} y={fy} angle={angle} look={{t, swim: 0.3, freq: 1.8, lookAt: lookLocal}} />
      </MangroveBack>
    ),
    overlay: (
      <>
        <MangroveFront cam={c} t={t} />
        <Vignette />
        {k > 0.01 && (
          <AbsoluteFill style={{pointerEvents: 'none', opacity: k}}>
            <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
              <path d={`M${f1(es.x)},${f1(es.y)} L${f1(ps.x)},${f1(ps.y)} L${f1(bs.x)},${f1(bs.y)}`} stroke="#ffe27a" strokeWidth={3} strokeDasharray="12 9" fill="none" />
              <circle cx={bs.x} cy={bs.y} r={26} fill="none" stroke="#ffe27a" strokeWidth={3} />
            </svg>
          </AbsoluteFill>
        )}
        <Callout k={win(t, 30.6, 34.4)} x={540} y={960} tx={160} ty={560} text="ojo grande, orientado hacia arriba" />
        <Brand />
      </>
    ),
  };
}

// ---------------- ESCENA 4 ----------------
export function scene04(t: number): SceneOut {
  const fxA = -120;
  const fxB = 20;
  const fx = lerp(fxA, fxB, seg(t, 55, 59));
  const fy = 170 - 40 * seg(t, 55, 59);
  const angle = lerp(-0.45, -0.8, seg(t, 55, 59));
  const perch = {pivot: {x: 170, y: -500}, len: 150, base: 0.3, seed: 5};
  const eye = {x: fx + Math.cos(angle) * 66 + Math.sin(angle) * 22, y: fy + Math.sin(angle) * 66 - Math.cos(angle) * 22};
  const ins = {x: 240, y: -470};
  const rf = refraction(ins, eye);
  const c = breathe(zoomSplit(60, 1.45, 1120), t, 0.15);
  const S = (p: {x: number; y: number}) => toScreen(c, p.x, p.y);
  const es = S(eye);
  const ps = S(rf.P);
  const is = S(ins);
  const as = S(rf.apparent);
  const k1 = win(t, 50, 59.6, 0.5);
  const k2 = win(t, 51.6, 59.6, 0.5);
  return {
    svg: (
      <MangroveBack cam={c} t={t} trees={[-800, 900]} above={<><Branch x={-300} y={-620} len={600} ang={0.1} t={t} seed={13} /><PerchLeaf p={perch} t={t} /></>} free={<><Insect x={ins.x} y={ins.y} s={2.1} t={t} kind="cricket" />{k2 > 0.01 && <Insect x={rf.apparent.x} y={rf.apparent.y} s={2.1} t={t} kind="cricket" opacity={0.35 * k2} />}</>}>
        <ArcherFish uid="a4" x={fx} y={fy} angle={angle} look={{t, swim: 0.4, freq: 2, lookAt: {x: 200, y: -200}}} />
      </MangroveBack>
    ),
    overlay: (
      <>
        <MangroveFront cam={c} t={t} />
        <Vignette />
        {k1 > 0.01 && (
          <AbsoluteFill style={{pointerEvents: 'none'}}>
            <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
              <g opacity={k1}>
                <path d={`M${f1(is.x)},${f1(is.y)} L${f1(ps.x)},${f1(ps.y)} L${f1(es.x)},${f1(es.y)}`} stroke="#ffe27a" strokeWidth={5} fill="none" />
                <circle cx={ps.x} cy={ps.y} r={8} fill="#ffe27a" />
              </g>
              <g opacity={k2}>
                <path d={`M${f1(ps.x)},${f1(ps.y)} L${f1(as.x)},${f1(as.y)}`} stroke="#7ae8ff" strokeWidth={4} strokeDasharray="14 10" fill="none" />
                <circle cx={as.x} cy={as.y} r={28} fill="none" stroke="#7ae8ff" strokeWidth={3} strokeDasharray="8 6" />
              </g>
            </svg>
            <div style={{position: 'absolute', left: Math.min(760, is.x + 40), top: is.y + 30, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 30, color: '#ffe27a', opacity: k1, textShadow: '0 2px 8px rgba(0,0,0,0.7)'}}>posición real</div>
            <div style={{position: 'absolute', left: Math.min(740, as.x + 40), top: as.y - 50, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 30, color: '#7ae8ff', opacity: k2, textShadow: '0 2px 8px rgba(0,0,0,0.7)'}}>posición aparente</div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 1700, textAlign: 'center', color: '#e8fff4', fontSize: 22, fontWeight: 700, letterSpacing: 2, opacity: 0.8 * k1}}>ESQUEMA DE LA REFRACCIÓN · LA LUZ SE DESVÍA AL PASAR DEL AIRE AL AGUA</div>
          </AbsoluteFill>
        )}
        <Brand />
      </>
    ),
  };
}
