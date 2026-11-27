// DE HUEVO A SAPO — DEMOSTRACIÓN DE 15 s (450 fotogramas · 1080×1920 · 30 fps).
//  0–3 s   cordones de huevos bajo el agua; la cámara avanza hacia un embrión.
//  3–6 s   transición temporal (≈ días): el embrión se desarrolla; eclosiona el renacuajo y su cola ondula.
//  6–10 s  el renacuajo nada entre plantas; transición temporal (semanas): crece, aparecen las patas
//          posteriores, después las anteriores, y la cola empieza a reabsorberse. Asciende a la superficie.
//  10–13 s el sapo joven en la orilla húmeda: respira, parpadea y da un pequeño salto articulado.
//  13–15 s transición temporal (años) al sapo adulto; primer plano y título.
// Un único individuo representativo: el mismo rig, interpolado por grado de desarrollo.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, lerp} from '../../engine/math';
import {ensureFonts, FONT_FAMILY} from '../../engine/fonts';
import {GrowthTrack, growthAt, stageAt} from '../../lifecycle/stages';
import {TimeLapse} from '../../lifecycle/TimeLapse';
import {breathe, cam, Cam, DepthDive, shot, toScreen} from '../../studio2';
import {EggString, EmbryoEgg} from './character/Embryo';
import {Toad, toadPose} from './character/Toad';
import {ForestBack, ForestFront} from './environment/Forest';
import {Elodea, PondBack, PondFront} from './environment/Pond';
import {jumpAt} from './motion/jump';
import {swimAt} from './motion/swim';
import {BUFO_STAGES} from './species/bufoBufo';

const F = {x: 30, y: -40}; // huevo enfocado
const STRING = [
  {x: -260, y: -320},
  {x: -170, y: -230},
  {x: -60, y: -150},
  {x: 30, y: -40},
  {x: 120, y: 40},
  {x: 210, y: 150},
  {x: 260, y: 250},
];
const STRING2 = STRING.map((p, i) => ({x: p.x - 90 + Math.sin(i) * 20, y: p.y - 40 + i * 6}));
const GROWTH: GrowthTrack = [
  [5.0, 0],
  [6.2, 0.04],
  [7.0, 0.32],
  [7.9, 0.55],
  [8.6, 0.68],
  [9.3, 0.78],
  [9.9, 0.86],
  [10.0, 0.95],
  [12.95, 0.95],
  [13.9, 1],
];
const win = (t: number, a: number, b: number, r = 0.35) => clamp((t - a) / r) * clamp((b - t) / r);
const seg = (t: number, a: number, b: number) => {
  const u = clamp((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const StageChip: React.FC<{text: string; k: number}> = ({text, k}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1480, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k}}>
      <span style={{display: 'inline-block', padding: '8px 22px', borderRadius: 30, background: 'rgba(6,24,20,0.55)', color: '#f4ecd0', fontWeight: 700, fontSize: 30, letterSpacing: 1}}>{text}</span>
    </div>
  ) : null;

export const SapoDemo: React.FC = () => {
  ensureFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const g = growthAt(GROWTH, t);
  const st = stageAt(BUFO_STAGES, g);
  const underwater = t < 10.1;

  if (underwater) {
    // ---- trayectoria del renacuajo (sale del huevo y nada entre las plantas)
    const hatch = seg(t, 5.0, 6.0);
    const swimX = t < 6 ? lerp(F.x, F.x + 90, hatch) : F.x + 90 + (t - 6) * 290 - Math.max(0, t - 9.4) * 120;
    const swimY = t < 6 ? F.y : F.y + Math.sin((t - 6) * 1.6) * 40 + (t > 9.3 ? -(t - 9.3) * (t - 9.3) * 700 : 0);
    const effort = t < 5 ? 0 : t < 6 ? 0.3 + 0.5 * hatch : lerp(0.85, 0.45, clamp((g - 0.6) / 0.35));
    const sw = swimAt(t, effort);
    const pitch = t > 9.3 ? -0.5 * seg(t, 9.3, 10) : Math.cos((t - 6) * 1.6) * 0.08 * (t > 6 ? 1 : 0);
    const tad = toadPose({x: swimX, y: swimY, scale: 1, angle: pitch + sw.bodyYaw, t, swimPhase: sw.phase, swimAmp: sw.amp, curl: 1 - seg(t, 5.0, 5.7), fold: 0.12, inWater: true});
    // ---- cámara
    let c: Cam = shot(t, 0, 3, cam(-40, -80, 1.25), cam(F.x, F.y, 4.6), 'cine');
    if (t >= 3) c = shot(t, 3, 5, cam(F.x, F.y, 4.6), cam(F.x + 4, F.y, 4.9), 'linear');
    if (t >= 5) c = shot(t, 5, 6.2, cam(F.x + 4, F.y, 4.9), cam(swimX + 30, swimY, 2.8), 'cine');
    if (t >= 6.2) c = cam(lerp(swimX + 30, swimX + 120, seg(t, 6.2, 7)), lerp(swimY, swimY - 20, 0.5), lerp(2.8, 1.75, seg(t, 6.2, 9.2)));
    if (t >= 9.2) c = shot(t, 9.2, 10.1, cam(swimX + 120, swimY - 10, 1.75), cam(swimX + 80, swimY - 260, 1.5), 'in');
    c = breathe(c, t, 0.4);
    const showEmbryo = t < 5.25;
    const embryoE = seg(t, 3.0, 5.0);
    return (
      <AbsoluteFill style={{background: '#06282e'}}>
        <svg width={1080} height={1920}>
          <PondBack cam={c} t={t}>
            <Elodea x={-20} base={300} h={820} t={t} seed={5} c="#3a7a3a" />
            <EggString pts={STRING2} t={t} uid="s2" seed={2} />
            <EggString pts={STRING} t={t} uid="s1" skipNear={F} skipR={showEmbryo ? 16 : 10} />
            {[260, 520, 760, 980, 1240, 1480].map((x, i) => (
              <Elodea key={x} x={x} base={300} h={560 + (i % 3) * 140} t={t} seed={i * 3.1 + 9} c={i % 2 ? '#2f6e3a' : '#3c8240'} />
            ))}
            {showEmbryo && <EmbryoEgg x={F.x} y={F.y} r={22} e={embryoE} t={t} open={seg(t, 5.0, 5.25)} uid="emb" />}
            {t >= 4.95 && t < 5.3 && <EmbryoEgg x={F.x} y={F.y} r={22} e={1} t={t} open={1} uid="emb2" />}
            {t >= 5.0 && <Toad uid="tad" s={st} p={tad} />}
          </PondBack>
        </svg>
        <PondFront cam={c} t={t} />
        <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(2,16,14,0.7) 100%)'}} />
        <TimeLapse k={win(t, 3.0, 5.2)} label="≈ 10 días · tiempo condensado" spin={(t - 3) * 3} />
        <TimeLapse k={win(t, 6.3, 9.9)} label="semanas · tiempo condensado" spin={(t - 6.3) * 4} />
        <StageChip text={st.stage} k={win(t, 5.4, 9.8)} />
        <DepthDive u={(t - 9.75) / 0.75} />
        {t > 9.8 && <AbsoluteFill style={{background: '#e8fff0', opacity: 0.5 * seg(t, 9.8, 10.1)}} />}
      </AbsoluteFill>
    );
  }

  // ---- orilla y bosque: sapo joven, salto y crecimiento hasta adulto
  const T0 = 11.25;
  const J = jumpAt(t, T0, 250, 120);
  const sz = st.size;
  const stoneTop = -54;
  const ground = -6;
  const footOff = 46 * sz; // distancia del centro del cuerpo a los pies en reposo
  const landK = clamp((J.dx - 0) / 250);
  const baseY = lerp(stoneTop, ground, landK);
  const toadX = -10 + J.dx + Math.max(0, t - 13) * 18;
  const toadY = baseY - footOff + J.dy + J.crouch * 4 * sz;
  const breath = 0.5 + 0.5 * Math.sin(t * 5.2);
  const blink = Math.max(win(t, 10.75, 10.95, 0.08), win(t, 14.25, 14.45, 0.08));
  const pose = toadPose({x: toadX, y: toadY, scale: 1, angle: J.tilt, t, swimAmp: 0, fold: J.fold, armReach: J.armReach, crouch: J.crouch, breath, blink, inWater: false});
  const headX = toadX + 70 * sz;
  const headY = toadY - 30 * sz;
  let c: Cam = shot(t, 10.1, 10.8, cam(toadX + 40, toadY - 120, 2.2), cam(toadX + 60, toadY - 30, 3.0), 'cine');
  if (t >= 10.8) c = shot(t, 10.8, 12.9, cam(toadX + 60, toadY - 30, 3.0), cam(toadX + 40, toadY - 40, 2.6), 'cine');
  if (t >= 12.9) c = shot(t, 12.9, 14.4, cam(toadX + 40, toadY - 40, 2.6), cam(headX + 10, headY + 6, 3.5), 'cine');
  if (t >= 14.4) c = cam(headX + 10 + (t - 14.4) * 6, headY + 6, 3.5 + (t - 14.4) * 0.08);
  c = breathe(c, t, 0.35);
  const hs = toScreen(c, headX, headY);
  return (
    <AbsoluteFill style={{background: '#121c10'}}>
      <svg width={1080} height={1920}>
        <ForestBack cam={c} t={t}>
          <ellipse cx={toadX + 6 * sz} cy={baseY - 2} rx={70 * sz * (1 - 0.4 * clamp(-J.dy / 120))} ry={8 * sz} fill="#000" opacity={0.3 * (1 - 0.5 * clamp(-J.dy / 120))} />
          <Toad uid="toad" s={st} p={pose} />
        </ForestBack>
      </svg>
      <ForestFront cam={c} t={t} />
      <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(circle 520px at ${Math.round(hs.x)}px ${Math.round(hs.y)}px, rgba(255,214,140,0.22), rgba(0,0,0,0) 100%)`, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(8,10,4,0.72) 100%)'}} />
      {t < 10.7 && <AbsoluteFill style={{background: '#e8fff0', opacity: 0.66 * (1 - (t - 10.1) / 0.6)}} />}
      <TimeLapse k={win(t, 12.85, 14.1)} label="años · tiempo condensado" spin={(t - 12.85) * 5} />
      <StageChip text={st.stage} k={win(t, 10.3, 12.8)} />
      {t > 13.5 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: clamp((t - 13.5) / 0.6)}}>
          <div style={{fontWeight: 900, fontSize: 104, letterSpacing: 4, color: '#fff4d8', textShadow: '0 0 30px rgba(255,200,110,0.45), 0 6px 18px rgba(0,0,0,0.85)', transform: `scale(${(0.94 + 0.06 * clamp((t - 13.5) / 0.6)).toFixed(3)})`}}>DE HUEVO A SAPO</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
