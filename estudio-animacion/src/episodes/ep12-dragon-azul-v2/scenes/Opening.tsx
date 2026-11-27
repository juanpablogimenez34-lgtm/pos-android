// SEGMENTOS 1–2 (0–20 s · fotogramas 0–599) — GANCHO Y MISTERIO, Estudio 2.0.
//  0,0–3,1 s  ACCIÓN: el dragón azul muerde un tentáculo de carabela; los nematocistos del tentáculo
//             se disparan al contacto; la cámara empuja con dos "golpes" en los mordiscos.
//  3,1–5,2 s  PROMESA: barrido siguiendo el cuerpo hasta las ceratas; cápsulas que fluyen hacia las
//             puntas. «¿Cómo?»
//  5,0–5,8 s  cortina de burbujas (transición motivada).
//  5,4–9,4 s  ESCALA: la cámara se retira; 3 cm junto a una moneda de referencia.
//  9,4–15,5 s PERSPECTIVA: plano partido; flota boca abajo; una carabela a la deriva al fondo.
// 15,5–20 s  ACCIÓN: la carabela se acerca; la cámara empuja hacia el encuentro.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, hash1, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {Grade, ScreenRays, SubjectLight} from '../../ep10-camaron-mantis/lighting/Lighting';
import {BlueDragon, dragonPoint, dragonPose, DragonPose} from '../../ep11-dragon-azul/character/BlueDragon';
import {ManOWarSide} from '../../ep11-dragon-azul/character/Organisms';
import {DAY, mixPal, NIGHT, SurfaceSplit, TopOcean, waveY} from '../../ep11-dragon-azul/environment/Ocean';
import {float, onWave} from '../../ep11-dragon-azul/animation/DragonMotion';
import {Bokeh, BubbleCurtain, Cam, cam, layerT, Motes, punch, PunchWord, SceneOut, shot, toScreen, breathe} from '../../../studio2';
import {DS} from '../config/plan';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
const win = (t: number, a: number, b: number, r = 0.3) => clamp((t - a) / r) * clamp((b - t) / r);
const scr = (c: Cam, p: {x: number; y: number}) => toScreen(c, p.x, p.y);

/** Tentáculo de carabela que entra en la boca: se desliza hacia ella (engullido) y sus baterías
 *  de nematocistos se disparan al contacto (hilos que salen y se retraen). */
const FeedingTentacle: React.FC<{t: number; mouth: {x: number; y: number}; dir: number}> = ({t, mouth, dir}) => {
  const n = 22;
  const slide = (t * 26) % 30;
  const pts = Array.from({length: n}, (_, i) => {
    const d = i * 30 - slide;
    const a = dir + Math.sin(t * 1.3 + i * 0.35) * 0.25 * (i / n);
    const tw = i < 5 ? Math.sin(t * 11 + i) * 5 : 0;
    return {x: mouth.x + Math.cos(a) * d - Math.sin(a) * tw, y: mouth.y + Math.sin(a) * d + Math.cos(a) * tw + Math.sin(i * 0.5 + t) * 8 * (i / n)};
  });
  const d = pts.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y)}`).join(' ');
  return (
    <g>
      <path d={d} stroke="#1a2a8a" strokeWidth={15} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#4a6aff" strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#a8b8ff" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.6} />
      {pts.map((q, i) =>
        i % 2 === 1 ? (
          <g key={i}>
            <circle cx={q.x} cy={q.y} r={9} fill="#7a5aff" stroke="#2a1a7a" strokeWidth={2} />
            {i < 9 &&
              Array.from({length: 5}, (_, k) => {
                const ph = ((t * 3.2 + hash1(i * 7 + k)) % 1 + 1) % 1;
                const a = (k / 5) * Math.PI * 2 + i;
                const L = 10 + 34 * Math.sin(ph * Math.PI);
                return <path key={k} d={`M${f1(q.x)},${f1(q.y)} l${f1(Math.cos(a) * L)},${f1(Math.sin(a) * L)}`} stroke="#f4f0ff" strokeWidth={1.8} opacity={0.8 * Math.sin(ph * Math.PI)} />;
              })}
          </g>
        ) : null,
      )}
    </g>
  );
};

/** Cápsulas (nematocistos) que fluyen desde el cuerpo hacia los abanicos de ceratas. */
const CapsuleFlow: React.FC<{t: number; p: DragonPose; k: number}> = ({t, p, k}) =>
  k > 0.01 ? (
    <g opacity={k}>
      {[1, -1].flatMap((sd) =>
        [40, 75, 110].flatMap((lx, ci) =>
          Array.from({length: 5}, (_, i) => {
            const u = ((t * 0.55 + i / 5 + ci * 0.13) % 1 + 1) % 1;
            const a = dragonPoint(p, lx, sd * 22);
            const b = dragonPoint(p, lx - 30 + 20 * Math.sin(i), sd * (120 + 20 * hash1(i + ci)));
            const x = lerp(a.x, b.x, u);
            const y = lerp(a.y, b.y, u);
            return <ellipse key={`${sd}${ci}${i}`} cx={x} cy={y} rx={6} ry={3.6} fill="#ffe08a" stroke="#8a5a1a" strokeWidth={1.2} opacity={Math.sin(u * Math.PI)} transform={`rotate(${f1((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI)} ${f1(x)} ${f1(y)})`} />;
          }),
        ),
      )}
    </g>
  ) : null;

/** Moneda de referencia (genérica, sin diseño real) para la comparación de tamaño. */
const RefCoin: React.FC<{x: number; y: number; r: number; k: number}> = ({x, y, r, k}) =>
  k > 0.01 ? (
    <g opacity={k}>
      <circle cx={x} cy={y} r={r} fill="#d8dde6" stroke="#8a93a6" strokeWidth={6} opacity={0.85} />
      <circle cx={x} cy={y} r={r * 0.82} fill="none" stroke="#a8b0c0" strokeWidth={4} />
      <circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.25} fill="#ffffff" opacity={0.35} />
    </g>
  ) : null;

const Label: React.FC<{x: number; y: number; text: string; k: number; size?: number; color?: string}> = ({x, y, text, k, size = 40, color = '#ffd23f'}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: x - 300, width: 600, top: y, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: size, color, opacity: k, textShadow: '0 3px 12px rgba(0,0,0,0.85)'}}>{text}</div>
  ) : null;

const hookPose = (t: number) =>
  dragonPose({...float(t), heading: -0.42 + 0.04 * Math.sin(t * 0.8), feed: 1, bite: t * 1.45, spread: 0.8, bend: 1.5, shine: 1, scale: DS});

/** 0–5,2 s · GANCHO. */
export function hook(t: number): SceneOut {
  const p = hookPose(t);
  const mouth = dragonPoint(p, 212, 0);
  const tipC = dragonPoint(p, 70, 150);
  const A = cam(mouth.x - 190, mouth.y + 90, 1.85, -0.1);
  const B = cam(mouth.x - 120, mouth.y + 50, 2.35, 0.02);
  const C = cam(tipC.x, tipC.y, 5.2, 0.22);
  let c = t < 3.0 ? shot(t, 0, 3.0, A, B, 'out') : shot(t, 3.0, 3.35, B, C, 'inOut');
  if (t > 3.35) c = shot(t, 3.35, 5.3, C, {...C, zoom: 5.8, roll: 0.3}, 'linear');
  const pz = punch(t, 0.35, 0.07, 0.45) * punch(t, 1.75, 0.06, 0.45);
  c = breathe({...c, zoom: c.zoom * pz}, t, 0.5);
  const whip = t > 2.95 && t < 3.4 ? Math.sin(((t - 2.95) / 0.45) * Math.PI) : 0;
  const pal = mixPal(DAY, NIGHT, 0.28);
  const ms = scr(c, mouth);
  return {
    svg: (
      <g>
        <TopOcean cam={c} t={t} pal={pal} foam={0.5}>
          <ellipse cx={p.x - 30} cy={p.y + 40} rx={330} ry={150} fill="#00102a" opacity={0.18} />
          <FeedingTentacle t={t} mouth={mouth} dir={-0.42 - 0.35} />
          <BlueDragon uid="h1" p={p} />
          <CapsuleFlow t={t} p={p} k={clamp((t - 3.1) / 0.4)} />
        </TopOcean>
        <Bokeh t={t} n={8} k={0.9} />
      </g>
    ),
    overlay: (
      <>
        <SubjectLight x={ms.x} y={ms.y} r={620} k={t < 3.1 ? 0.7 : 0.3} color="rgba(140,200,255,0.3)" />
        <Grade depth={0.45} vignette={0.85} />
        {whip > 0 && (
          <AbsoluteFill style={{pointerEvents: 'none'}}>
            <svg width={1080} height={1920}>
              {Array.from({length: 26}, (_, i) => (
                <path key={i} d={`M${f1(hash1(i) * 1080 - 200)},${f1(hash1(i * 3) * 1920)} l${f1(400 + hash1(i * 5) * 300)},${f1(-120)}`} stroke="#dff8ff" strokeWidth={3 + hash1(i * 7) * 8} opacity={0.35 * whip} strokeLinecap="round" />
              ))}
            </svg>
          </AbsoluteFill>
        )}
        <PunchWord text="¡SE COME UNA CARABELA!" k={win(t, 0.9, 3.0, 0.2)} size={66} top={220} color="#ffffff" />
        <PunchWord text="¿CÓMO?" k={win(t, 3.45, 5.25, 0.2)} size={120} top={210} />
      </>
    ),
  };
}

/** 5,0–20 s · EL MISTERIO. */
export function mystery(t: number): SceneOut {
  const curtain = (t - 4.95) / 0.9;
  if (t < 5.4) {
    const h = hook(t);
    return {svg: h.svg, overlay: <>{h.overlay}<BubbleCurtain u={curtain} /></>};
  }
  // --- 5,4–9,4 · revelación de escala (vista cenital)
  if (t < 9.4) {
    const p = dragonPose({...float(t), heading: -0.25, scale: DS, shine: 0.9});
    const c = breathe(shot(t, 5.4, 8.6, cam(0, 0, 2.9, 0.1), cam(190, 40, 0.95, 0), 'cine'), t, 0.5);
    const coin = {x: 480, y: -30};
    const k = win(t, 6.4, 9.3, 0.4);
    const a = scr(c, dragonPoint(p, 205, 0));
    const b = scr(c, dragonPoint(p, -200, 0));
    const cs = scr(c, coin);
    return {
      svg: (
        <g>
          <TopOcean cam={c} t={t} pal={DAY} foam={0.8}>
            <RefCoin x={coin.x} y={coin.y} r={208} k={k * 0.9} />
            <BlueDragon uid="m1" p={p} />
          </TopOcean>
          <Bokeh t={t} n={6} k={0.7} />
        </g>
      ),
      overlay: (
        <>
          <Grade depth={0.25} vignette={0.7} />
          <AbsoluteFill style={{pointerEvents: 'none'}}>
            <svg width={1080} height={1920}>
              <g opacity={k}>
                <path d={`M${f1(a.x)},${f1(a.y - 150)} L${f1(b.x)},${f1(b.y - 150)}`} stroke="#ffd23f" strokeWidth={6} />
                <path d={`M${f1(a.x)},${f1(a.y - 165)} l0,30 M${f1(b.x)},${f1(b.y - 165)} l0,30`} stroke="#ffd23f" strokeWidth={6} />
              </g>
            </svg>
          </AbsoluteFill>
          <Label x={(a.x + b.x) / 2} y={Math.min(a.y, b.y) - 250} text="≈ 3 cm" k={k} size={64} />
          <Label x={cs.x} y={cs.y + 130} text="moneda de referencia" k={k} size={30} color="#ffffff" />
          <BubbleCurtain u={curtain} />
        </>
      ),
    };
  }
  // --- 9,4–20 · plano partido: boca abajo bajo la superficie; la carabela se acerca
  const x = lerp(-80, 60, clamp((t - 9.4) / 10.6));
  const w = onWave(t, x, 30);
  const p = dragonPose({...float(t), ...w, roll: Math.PI, tilt: 0.46, scale: DS, shine: 0.9});
  const mowX = lerp(820, 430, clamp((t - 9.4) / 10.6));
  const c0 = cam(x + 60, 150, 1.85);
  const c1 = cam((x + mowX) / 2 + 20, 170, 1.12);
  const c2 = cam((x + mowX) / 2, 190, 1.05);
  const c3 = cam((x + mowX) / 2 - 20, 150, 1.35);
  let c = t < 15.5 ? shot(t, 9.4, 15.5, c0, c1, 'cine') : t < 17.5 ? shot(t, 15.5, 17.5, c1, c2, 'cine') : shot(t, 17.5, 20, c2, c3, 'cine');
  c = breathe(c, t, 0.8);
  const enter = clamp((t - 9.4) / 0.6);
  const ds = scr(c, {x: w.x, y: w.y});
  return {
    svg: (
      <g>
        <SurfaceSplit cam={c} t={t} pal={DAY}>
          <ManOWarSide x={mowX} y={waveY(mowX, t) - 4} s={1.0} t={t} uid="mw" tentLen={1000} reach={-0.4} />
          <BlueDragon uid="m2" p={p} />
        </SurfaceSplit>
        <g transform={layerT(c, 1.6)} opacity={0.6}>
          <Motes t={t} n={30} />
        </g>
        <Bokeh t={t} n={7} k={0.8} />
      </g>
    ),
    overlay: (
      <>
        <SubjectLight x={ds.x} y={ds.y} r={460} k={0.5} />
        <ScreenRays t={t} k={0.35} />
        <Grade depth={0.3} vignette={0.75} />
        {enter < 1 && <AbsoluteFill style={{background: '#e8fbff', opacity: 0.5 * (1 - enter)}} />}
        <PunchWord text="¿CÓMO LO CONSIGUE?" k={win(t, 15.7, 19.6, 0.3)} size={64} top={220} color="#9ff4ff" />
      </>
    ),
  };
}
