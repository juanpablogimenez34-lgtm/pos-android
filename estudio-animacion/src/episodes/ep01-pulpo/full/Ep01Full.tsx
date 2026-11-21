import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {AudioTracks} from '../../../engine/AudioTracks';
import {cameraAt, CameraProvider, ParallaxLayer, worldToScreen} from '../../../engine/camera';
import {cuesFromTiming, speechIntervals, TimedLine} from '../../../engine/cues';
import {ensureFonts, FONT_FAMILY} from '../../../engine/fonts';
import {easeOut, lerp, smoothstep, Vec} from '../../../engine/math';
import {Callout, ChapterTag, CutWipe, Dim, Fade, FinalCard} from '../../../engine/Overlays';
import {QualityName, QualityProvider, QUALITY} from '../../../engine/quality';
import {StyleProvider} from '../../../engine/style';
import {Subtitles} from '../../../engine/Subtitles';
import {TitleCard} from '../../../engine/TitleCard';
import {AudioMix} from '../../../engine/types';
import {useTime} from '../../../engine/useTime';
import {CirculatoryOverlay, mantlePoint, NervousOverlay, organSites} from '../../../creatures/octopus/Anatomy';
import {MacroArm} from '../../../creatures/octopus/MacroArm';
import {EyeShine, Octopus} from '../../../creatures/octopus/Octopus';
import {computeOctopusPose} from '../../../creatures/octopus/pose';
import {OCTOPUS_VULGARIS} from '../../../creatures/octopus/rig';
import {Moray, morayPose} from '../../../creatures/moray/Moray';
import {Grade} from '../../../environments/underwater/Grade';
import {UW} from '../../../environments/underwater/palette';
import {BoulderField, CreviceBack, CreviceLip, InkCloud2, Scallop, WaterJet} from '../../../environments/underwater/Props';
import {caveDarknessAt} from '../../../environments/underwater/Rocks';
import {CAVE_REEF, CaveReefStage, groundY} from '../../../environments/underwater/sets/CaveReefSet';
import narration from '../narration-timing.json';
import {HeartLens} from './HeartLens';
import {
  anatomyDim,
  anatomyReveal,
  BLINKS,
  brainReveal,
  CAMERA,
  CUTS,
  INK_BURSTS,
  jetEmitter,
  MORAY_WINDOW,
  morayState,
  nervousReveal,
  octoClouds,
  octoGaze,
  octoMotion,
  octoReach,
  octoState,
  SCENES,
  SHELL_DROP,
  SHELL_REST,
  shellAttach,
  shellSpin,
  xrayAmount,
} from './timeline';

export type Ep01FullProps = {
  quality: QualityName;
  showSubtitles: boolean;
  audio: AudioMix;
};

const TIMING = (narration as {timing: TimedLine[]}).timing;
const CUES = cuesFromTiming(TIMING);
const SPEECH = speechIntervals(TIMING);

export const EP01_DEFAULT_AUDIO: AudioMix = {
  narration: {src: 'audio/ep01/narracion.m4a', volume: 1},
  music: {src: 'audio/ep01/musica.m4a', volume: 0.34, duckTo: 0.4},
  ambience: {src: 'audio/ep01/ambiente.m4a', volume: 0.42},
  movement: {src: 'audio/ep01/movimiento.m4a', volume: 0.75},
  tension: {src: 'audio/ep01/tension.m4a', volume: 0.7},
  transitions: {src: 'audio/ep01/transiciones.m4a', volume: 0.55},
};

const Badge: React.FC<{y: number; appear: number; title: string; sub: string; color?: string}> = ({y, appear, title, sub, color = '#5fb0ff'}) => {
  if (appear <= 0.001) return null;
  const k = easeOut(appear);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: k, transform: `translateY(${(1 - k) * 18}px)`, fontFamily: FONT_FAMILY}}>
      <div style={{padding: '18px 34px', borderRadius: 26, background: 'rgba(3,14,30,0.78)', border: `2px solid ${color}88`, textAlign: 'center'}}>
        <div style={{fontWeight: 900, fontSize: 52, letterSpacing: 2, color, textShadow: `0 0 24px ${color}66`}}>{title}</div>
        <div style={{fontWeight: 600, fontSize: 30, color: '#eafffb', marginTop: 4}}>{sub}</div>
      </div>
    </div>
  );
};

export const Ep01Full: React.FC<Ep01FullProps> = ({quality, showSubtitles, audio}) => {
  ensureFonts();
  const t = useTime();
  const {width, height} = useVideoConfig();
  const macro = t >= 120 && t < 127;

  // ---- morena (sólo se monta en su ventana)
  const moray = t >= MORAY_WINDOW[0] && t <= MORAY_WINDOW[1] ? morayState(t) : null;
  const morayHead = moray ? morayPose({id: 'moray', t, ...moray}).head : undefined;

  // ---- pulpo
  const pose = computeOctopusPose({
    t,
    rig: OCTOPUS_VULGARIS,
    state: octoState(t),
    motion: octoMotion,
    ground: groundY,
    gaze: octoGaze(t, morayHead, SHELL_REST),
    blinks: BLINKS,
    segments: QUALITY[quality].armSegments,
    reach: octoReach(t),
    cuts: CUTS,
  });
  const eyeWorld = pose.toWorld(pose.eyes[0].local);
  // cámara: en el primer plano final sigue al ojo REAL del personaje
  const camKeys = cameraAt(CAMERA, t);
  const eyeTrack = smoothstep(158.4, 159.8, t) * (1 - smoothstep(164.6, 166.2, t));
  const camera = {...camKeys, x: lerp(camKeys.x, eyeWorld.x, eyeTrack), y: lerp(camKeys.y, eyeWorld.y + 6, eyeTrack)};
  const ctx = {camera, viewport: {width, height}, anchor: CAVE_REEF.anchor};
  const shineWindow = t < 20 ? smoothstep(2.7, 3.6, t) : t >= 150 ? 1 : 0;
  const shine = caveDarknessAt(CAVE_REEF.caveMouth, eyeWorld) * shineWindow;

  // ---- concha
  const showShell = t >= 127 && t < 150;
  const tip = pose.arms[0].pts[pose.arms[0].pts.length - 1];
  const attach = shellAttach(t);
  const rest = t < 135 ? SHELL_REST : SHELL_DROP;
  const shellPos: Vec = {x: lerp(rest.x, tip.x, attach), y: lerp(rest.y, tip.y - 6, attach)};

  const toScreen = (local: Vec) => worldToScreen(ctx, 1, pose.toWorld(local));
  const anat = anatomyReveal(t);
  const nerv = nervousReveal(t);
  const brain = brainReveal(t);
  const sites = organSites(pose);
  const anatOn = 1 - smoothstep(44.4, 44.8, t);
  const nervOn = 1 - smoothstep(149.4, 149.8, t);

  const mix: AudioMix = {...audio, music: audio.music ? {...audio.music, duck: SPEECH} : undefined};

  return (
    <QualityProvider quality={quality}>
      <StyleProvider refined>
        <CameraProvider {...ctx}>
          <AbsoluteFill style={{backgroundColor: UW.abyss}}>
            {macro ? (
              <MacroArm start={120} skin={OCTOPUS_VULGARIS.skin} />
            ) : (
              <CaveReefStage
                backProps={
                  <>
                    <CreviceBack />
                    <BoulderField />
                  </>
                }
                hero={
                  <>
                    <Octopus id="octo" pose={pose} skin={OCTOPUS_VULGARIS.skin} groundY={groundY(pose.body.x)} xray={xrayAmount(t)} clouds={octoClouds(t)} />
                    {moray && <Moray id="moray" t={t} {...moray} />}
                    <CreviceLip />
                    {showShell && <Scallop x={shellPos.x} y={shellPos.y} rot={shellSpin(t)} scale={1.5} />}
                  </>
                }
                heroOverlay={
                  <>
                    <EyeShine pose={pose} strength={shine} />
                    {((t > 57.5 && t < 67.5) || (t > 108.8 && t < 118.5)) && <WaterJet t={t} emitter={jetEmitter} />}
                    {t >= 109 && t < 121 && <InkCloud2 id="ink" t={t} bursts={INK_BURSTS} />}
                  </>
                }
              />
            )}
            <Grade />
            <Dim amount={macro ? 0 : anatomyDim(t)} />

            {/* vistas científicas sobre el mismo rig */}
            {!macro && (anat.outline > 0.01 || nerv > 0.01) && (
              <AbsoluteFill>
                <svg width={width} height={height}>
                  <ParallaxLayer depth={1}>
                    <CirculatoryOverlay pose={pose} reveal={nerv > 0.01 ? {outline: nerv, gills: 0, branchial: 0, venous: 0, systemic: 0, arterial: 0} : anat} />
                    <NervousOverlay pose={pose} reveal={nerv} brain={brain} />
                  </ParallaxLayer>
                </svg>
              </AbsoluteFill>
            )}

            {/* rótulos científicos */}
            {anat.gills > 0.01 && (() => {
              const g = toScreen(sites.gillL);
              const b = toScreen(sites.branchialR);
              const s = toScreen(sites.systemic);
              return (
                <>
                  <Callout x={g.x} y={g.y} side="left" dy={-130} text="Branquias" sub="aquí la sangre se oxigena" appear={smoothstep(30.8, 31.8, t) * (1 - smoothstep(41, 41.6, t))} width={320} />
                  <Callout x={b.x} y={b.y} side="right" dy={130} text="2 corazones branquiales" sub="impulsan la sangre a las branquias" appear={smoothstep(32.4, 33.4, t) * (1 - smoothstep(41, 41.6, t))} width={330} color="#c7a8ff" />
                  <Callout x={s.x} y={s.y} side="right" dy={-120} text="Corazón sistémico" sub="la reparte por el cuerpo" appear={smoothstep(38.2, 39.2, t) * anatOn} width={330} color="#ff9ab8" />
                </>
              );
            })()}
            <Badge y={1150} appear={smoothstep(41.6, 42.4, t) * anatOn} title="SANGRE AZUL" sub="hemocianina: proteína con cobre (Cu)" />

            {t > 56.8 && t < 61.5 && pose.siphon.visible > 0.3 && (() => {
              const sp = toScreen({x: pose.siphon.x, y: pose.siphon.y});
              return <Callout x={sp.x} y={sp.y} side={pose.facing < 0 ? 'left' : 'right'} dy={-110} text="Sifón" sub="expulsa el agua a presión" appear={smoothstep(56.9, 57.6, t) * (1 - smoothstep(60.8, 61.4, t))} width={300} />;
            })()}

            {t > 77 && t < 90.5 && (() => {
              const c = toScreen(mantlePoint(pose, 0.5, 0.55));
              const p = toScreen(mantlePoint(pose, 0.78, -0.9));
              return (
                <>
                  <Callout x={c.x} y={c.y} side="right" dy={-120} text="Cromatóforos" sub="células de pigmento" appear={smoothstep(77.6, 78.6, t) * (1 - smoothstep(83.2, 83.8, t))} width={300} color="#ffd27a" />
                  <Callout x={p.x} y={p.y} side="left" dy={-110} text="Papilas" sub="cambian la textura" appear={smoothstep(84.8, 85.8, t) * (1 - smoothstep(89.8, 90.4, t))} width={300} color="#ffd27a" />
                </>
              );
            })()}

            {nerv > 0.01 && (() => {
              const br = toScreen({x: pose.head.cx, y: pose.head.cy});
              const arm = pose.arms[0];
              const ap = worldToScreen(ctx, 1, arm.pts[Math.round(arm.pts.length * 0.55)]);
              return (
                <>
                  <Callout x={br.x} y={br.y} side="left" dy={-150} text="Cerebro" sub="rodea el esófago" appear={smoothstep(143.4, 144.4, t) * nervOn} width={300} color="#ffd27a" />
                  <Callout x={ap.x} y={ap.y} side="right" dy={-140} text="Cordones nerviosos" sub="unos 2/3 de sus neuronas" appear={smoothstep(144.6, 145.6, t) * nervOn} width={300} color="#7ff7ff" />
                </>
              );
            })()}
            <Badge y={250} appear={smoothstep(142.6, 143.6, t) * nervOn} title="≈ 500 MILLONES" sub="de neuronas" color="#7ff7ff" />

            <HeartLens />

            <TitleCard start={15.3} end={19.9} kicker="EL ANIMAL CON" title="TRES CORAZONES" centerY={0.17} icons={3} />
            {SCENES.slice(1).map((s) => (
              <ChapterTag key={s.n} start={s.start + 0.4} num={`0${s.n}`} label={s.title} />
            ))}
            <FinalCard start={175.2} question="¿QUÉ OTRA CRIATURA TE GUSTARÍA DESCUBRIR?" footer="EPISODIO 01 · EL ANIMAL CON TRES CORAZONES" />

            {CUTS.map((c, i) => (
              <CutWipe key={c} at={c} dir={i % 2 ? -1 : 1} />
            ))}
            <Fade from={0} to={0.8} inverse />
            {showSubtitles && <Subtitles cues={CUES} centerY={0.75} />}
            <AudioTracks mix={mix} />
          </AbsoluteFill>
        </CameraProvider>
      </StyleProvider>
    </QualityProvider>
  );
};
