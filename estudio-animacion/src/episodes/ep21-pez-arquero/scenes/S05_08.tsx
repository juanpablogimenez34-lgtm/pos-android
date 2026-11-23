// ESCENAS 5–8.
//  5 (60–75)   LA BOCA QUE DISPARA: primerísimo plano de la boca; esquema anatómico simplificado (lengua +
//              ranura del paladar = tubo; los opérculos se cierran) y salida real del chorro.
//  6–8 (75–120) UNA SOLA CAZA en tres actos con cámara lenta narrativa: nueva presa (grillo), alineación,
//              disparo lento con el agua concentrándose en la punta (6); la hoja recibe el golpe, el grillo
//              pierde el apoyo y cae (7); carrera contra otro pez y captura (8).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {ArcherFish, archerMouth} from '../character/ArcherFish';
import {Brand, Callout, seg, Vignette, win} from '../components/common';
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

// ---------------- ESCENA 5 ----------------
const H5: Hunt = {perch: {pivot: {x: 60, y: -430}, len: 140, base: 0.4, seed: 8}, insect: 'fly', insectScale: 1.9, from: {x: -150, y: 120}, approach: [60, 61], aimMouth: {x: -10, y: 8}, aimAngle: -1.05, tShot: EV.shots[1].t, knock: {x: 60, y: -120}, captureDelay: 0.8, after: {x: 300, y: 260}, seed: 5};

export function scene05(t: number): SceneOut {
  const hf = huntAt(H5, t);
  const L = huntLayers(hf, t, 'a5');
  const f = hf.fish;
  const m = archerMouth(f.x, f.y, f.angle, f.scale, f.dir);
  let c: Cam = cam(m.x - 30, m.y + 30, 5.0);
  if (t >= 69.4) c = shot(t, 69.4, 71.3, cam(m.x - 30, m.y + 30, 5.0), zoomSplit(10, 1.75, 1080), 'cine');
  if (t >= 71.3) c = zoomSplit(10, 1.75, 1080);
  c = breathe(c, t, 0.15);
  const ms = toScreen(c, m.x, m.y);
  const dk = win(t, 64.8, 69.6, 0.5);
  const pulse = (Math.sin(t * 4) + 1) / 2;
  return {
    svg: (
      <MangroveBack cam={c} t={t} trees={[-800, 900]} above={<><Branch x={-400} y={-560} len={600} ang={0.08} t={t} seed={17} />{L.above}</>} free={L.free}>
        {L.below}
      </MangroveBack>
    ),
    overlay: (
      <>
        <MangroveFront cam={c} t={t} />
        <Vignette />
        <Callout k={win(t, 60.6, 64.4)} x={ms.x} y={ms.y} tx={160} ty={560} text="boca dirigida hacia arriba" />
        {dk > 0.01 && (
          <AbsoluteFill style={{pointerEvents: 'none', opacity: dk}}>
            <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
              <rect x={120} y={280} width={840} height={560} rx={30} fill="rgba(6,30,24,0.82)" stroke="#9ff4c8" strokeWidth={2} strokeOpacity={0.5} />
              {/* paladar con ranura */}
              <path d="M200,420 Q540,360 880,420" stroke="#e8a898" strokeWidth={34} fill="none" strokeLinecap="round" />
              <path d="M260,430 Q540,380 820,430" stroke="#5a1a14" strokeWidth={10} fill="none" />
              {/* lengua que se eleva y cierra el tubo */}
              <path d={`M220,${f1(560 - pulse * 60)} Q540,${f1(500 - pulse * 90)} 860,${f1(560 - pulse * 60)}`} stroke="#d87a7a" strokeWidth={40} fill="none" strokeLinecap="round" />
              {/* agua que sale por el tubo */}
              {Array.from({length: 6}, (_, i) => {
                const u = ((t * 1.6 + i / 6) % 1);
                return <circle key={i} cx={260 + u * 640} cy={432 - u * 6} r={7} fill="#7ae8ff" opacity={pulse * Math.sin(u * Math.PI)} />;
              })}
              {/* opérculos que se cierran */}
              <path d={`M210,${f1(700)} q${f1(-40 + pulse * 30)},-60 0,-120`} stroke="#9ff4c8" strokeWidth={6} fill="none" />
              <path d={`M180,${f1(640)} l${f1(30 + pulse * 20)},0`} stroke="#ffe27a" strokeWidth={5} markerEnd="" />
            </svg>
            <div style={{position: 'absolute', left: 160, right: 160, top: 740, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 28, color: '#eafff4'}}>Esquema: la lengua contra una ranura del paladar forma un tubo; los opérculos se cierran y empujan el agua</div>
          </AbsoluteFill>
        )}
        <Brand />
      </>
    ),
  };
}

// ---------------- ESCENAS 6–8: una caza con cámara lenta ----------------
// tiempo real → tiempo de acción: normal hasta 86 s; disparo muy lento (86–91); el grillo resiste y se
// suelta (91–99); caída (99–105); carrera a cámara lenta (105–117); normal después.
const R678 = remap([[75, 75], [86, 86], [91, 86.34], [99, 89.4], [105, 90.2], [117, 93.2], [120, 96.2]]);
const H678: Hunt = {perch: {pivot: {x: 260, y: -470}, len: 160, base: 0.22, seed: 12}, insect: 'cricket', insectScale: 2.2, from: {x: -380, y: 260}, approach: [80, 84.5], aimMouth: {x: 40, y: 8}, aimAngle: -0.85, tShot: 86.0, tau: 0.34, grip: 3.0, knock: {x: 160, y: -160}, captureDelay: 3.0, chaseAngle: -0.3, after: {x: 760, y: 300}, seed: 9};
const rivalAt = (T: number, landX: number, captureT: number) => {
  const u = clamp((T - (captureT - 3.2)) / 3.4);
  const x = lerp(1250, landX + 90, u * u * (3 - 2 * u)) + Math.max(0, T - captureT) * 160;
  const y = lerp(320, 70, u) + Math.max(0, T - captureT) * 80;
  return {x, y, angle: lerp(0, 0.3, u) - Math.max(0, T - captureT) * 0.2};
};

function world678(t: number, c: Cam, extraOverlay?: React.ReactNode): SceneOut {
  const T = R678(t);
  const hf = huntAt(H678, T);
  const L = huntLayers(hf, T, 'a6');
  const rv = rivalAt(T, hf.landX, hf.captureT);
  return {
    svg: (
      <MangroveBack cam={c} t={T} trees={[-900, 1100]} above={<><Branch x={-100} y={-640} len={620} ang={0.18} t={T} seed={21} />{L.above}</>} free={L.free}>
        {t >= 105 && <ArcherFish uid="rv" x={rv.x} y={rv.y} angle={rv.angle} dir={-1} scale={0.85} look={{t: T + 2, swim: 1, freq: 4, hue: 1, tone: 0.15}} />}
        {L.below}
      </MangroveBack>
    ),
    overlay: (
      <>
        <MangroveFront cam={c} t={T} />
        <Vignette />
        {extraOverlay}
        <Brand />
      </>
    ),
  };
}

export function scene06(t: number): SceneOut {
  const T = R678(t);
  const hf = huntAt(H678, T);
  const f = hf.fish;
  let c: Cam = zoomSplit(80, 1.5, 1100);
  if (t >= 80) c = shot(t, 80, 84.5, zoomSplit(80, 1.5, 1100), cam(f.x + 40, f.y - 40, 2.4), 'cine');
  if (t >= 84.5) c = cam(f.x + 40, f.y - 40, 2.4);
  if (t >= 85.8) {
    // seguimiento del chorro a cámara lenta
    const u = clamp((T - 86) / 0.34);
    const p = {x: lerp(hf.shot.mouth.x, hf.shot.target.x, u), y: lerp(hf.shot.mouth.y, hf.shot.target.y, u)};
    c = shot(t, 85.8, 86.6, cam(f.x + 40, f.y - 40, 2.4), cam(p.x, p.y, 2.6), 'cine');
    if (t >= 86.6) c = cam(p.x, p.y, 2.6);
  }
  c = breathe(c, t, 0.2);
  const ts = toScreen(c, hf.shot.target.x, hf.shot.target.y);
  return world678(t, c, (
    <>
      <Callout k={win(t, 87.0, 89.8, 0.4)} x={ts.x} y={ts.y + 60} tx={160} ty={1180} text="el agua se concentra en la punta" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1700, textAlign: 'center', color: '#e8fff4', fontSize: 22, fontWeight: 700, letterSpacing: 2, opacity: 0.8 * win(t, 86, 90, 0.4)}}>CÁMARA LENTA</div>
    </>
  ));
}

export function scene07(t: number): SceneOut {
  const T = R678(t);
  const hf = huntAt(H678, T);
  const leafC = {x: H678.perch.pivot.x + 80, y: H678.perch.pivot.y + 30};
  let c: Cam = cam(leafC.x, leafC.y, 2.8);
  if (t >= 98.6) c = shot(t, 98.6, 101.5, cam(leafC.x, leafC.y, 2.8), zoomSplit(hf.landX - 60, 1.55, 1050), 'cine');
  if (t >= 101.5) c = zoomSplit(hf.landX - 60, 1.55, 1050);
  c = breathe(c, t, 0.2);
  return world678(t, c);
}

export function scene08(t: number): SceneOut {
  const T = R678(t);
  const hf = huntAt(H678, T);
  const f = hf.fish;
  const rv = rivalAt(T, hf.landX, hf.captureT);
  let c: Cam = cam((f.x + hf.landX) / 2, 120, 1.5);
  if (t >= 110) c = shot(t, 110, 113, cam((f.x + hf.landX) / 2, 120, 1.5), cam((f.x + rv.x) / 2, 140, 1.2), 'inOut');
  if (t >= 113) c = cam((f.x + rv.x) / 2, 140, lerp(1.2, 1.7, seg(t, 114, 117)));
  c = breathe(c, t, 0.25);
  return world678(t, c, <div style={{position: 'absolute', left: 0, right: 0, top: 1700, textAlign: 'center', color: '#e8fff4', fontSize: 22, fontWeight: 700, letterSpacing: 2, opacity: 0.7 * win(t, 105.3, 117.4, 0.4)}}>CÁMARA LENTA</div>);
}
