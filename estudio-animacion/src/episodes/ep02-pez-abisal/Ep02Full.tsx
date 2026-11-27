import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {AudioTracks} from '../../engine/AudioTracks';
import {cameraAt, CameraProvider, ParallaxLayer, worldToScreen} from '../../engine/camera';
import {cuesFromTiming, speechIntervals, TimedLine} from '../../engine/cues';
import {ensureFonts, FONT_FAMILY} from '../../engine/fonts';
import {clamp, easeOut, smoothPath, smoothstep, Vec} from '../../engine/math';
import {Callout, ChapterTag, Dim, Dip, Fade, FinalCard} from '../../engine/Overlays';
import {QualityName, QualityProvider} from '../../engine/quality';
import {StyleProvider} from '../../engine/style';
import {Subtitles} from '../../engine/Subtitles';
import {TitleCard} from '../../engine/TitleCard';
import {AudioMix} from '../../engine/types';
import {useTime} from '../../engine/useTime';
import {Anglerfish, AnglerGlow, anglerPose} from '../../creatures/anglerfish/Anglerfish';
import {AttachedMale, Lanternfish, LanternfishGlow, MaleAngler} from '../../creatures/anglerfish/SmallFish';
import {DeepBackground, DeepLife, DepthGauge, DescentLayers, lightMask, MarineSnow, PhotophoreSchool} from '../../environments/deepsea/DeepSea';
import narration from './narration-timing.json';
import {
  CAMERA,
  darkness,
  deepLife,
  descentDepth,
  descentMeters,
  femaleParams,
  fusionMix,
  illustrationDim,
  lightRadius,
  MALE_FREE_WINDOW,
  maleAttached,
  maleFuse,
  maleState,
  panelMix,
  PREY_WINDOW,
  preyState,
  SCENES,
  shake,
  snowClimb,
  stageMix,
} from './timeline';

export type Ep02FullProps = {quality: QualityName; showSubtitles: boolean; audio: AudioMix};

const TIMING = (narration as {timing: TimedLine[]}).timing;
const CUES = cuesFromTiming(TIMING);
const SPEECH = speechIntervals(TIMING);
const ANCHOR = {x: 0, y: 0};

export const EP02_DEFAULT_AUDIO: AudioMix = {
  narration: {src: 'audio/ep02/narracion.m4a', volume: 1},
  music: {src: 'audio/ep02/musica.m4a', volume: 0.36, duckTo: 0.4},
  ambience: {src: 'audio/ep02/ambiente.m4a', volume: 0.5},
  movement: {src: 'audio/ep02/movimiento.m4a', volume: 0.8},
  tension: {src: 'audio/ep02/tension.m4a', volume: 0.75},
  transitions: {src: 'audio/ep02/transiciones.m4a', volume: 0.55},
};

/** Panel científico: comparación de tamaño (proporción aproximada). */
const SizePanel: React.FC<{t: number; mix: number}> = ({t, mix}) => {
  const {width} = useVideoConfig();
  if (mix <= 0.01) return null;
  const female = anglerPose({t, x: 0, y: 0, scale: 1, facing: 1, pitch: 0, yaw: 0, jaw: 0.05, lureSway: 1, lureJig: 0, glow: 1, finRate: 0.4, gulp: 0});
  const k = easeOut(mix);
  const maleIn = easeOut(clamp((t - 122.2) / 0.8));
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 300, height: 980, opacity: k, transform: `translateY(${(1 - k) * 30}px)`, fontFamily: FONT_FAMILY}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 40, background: 'rgba(4,14,28,0.86)', border: '2px solid rgba(127,240,255,0.4)'}} />
      <div style={{position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', color: '#eafffb', fontWeight: 900, fontSize: 40, letterSpacing: 3}}>HEMBRA Y MACHO</div>
      <div style={{position: 'absolute', top: 94, left: 0, right: 0, textAlign: 'center', color: '#7ff0ff', fontWeight: 600, fontSize: 26, fontStyle: 'italic'}}>Linophryne arborifera · proporción aproximada</div>
      <svg width={width - 120} height={980} style={{position: 'absolute', left: 0, top: 0}}>
        <g transform={`translate(${(width - 120) / 2 - 20} 420) scale(1.5)`}>
          <Anglerfish id="panel-f" pose={female} light={1} />
          <circle cx={female.esca.x} cy={female.esca.y} r={14} fill="#bff8ff" opacity={0.6} />
        </g>
        {/* barra de escala de la hembra */}
        <g transform="translate(0 700)">
          <line x1={(width - 120) / 2 - 20 - 130 * 1.5} y1={0} x2={(width - 120) / 2 - 20 + 122 * 1.5} y2={0} stroke="#7ff0ff" strokeWidth={3} />
          <line x1={(width - 120) / 2 - 20 - 130 * 1.5} y1={-12} x2={(width - 120) / 2 - 20 - 130 * 1.5} y2={12} stroke="#7ff0ff" strokeWidth={3} />
          <line x1={(width - 120) / 2 - 20 + 122 * 1.5} y1={-12} x2={(width - 120) / 2 - 20 + 122 * 1.5} y2={12} stroke="#7ff0ff" strokeWidth={3} />
        </g>
        <g opacity={maleIn} transform={`translate(${(width - 120) / 2 + 40} 830)`}>
          <MaleAngler x={0} y={0} scale={0.85 * 1.5} angle={0} t={t} />
          <line x1={-44 * 1.27} y1={44} x2={36 * 1.27} y2={44} stroke="#ffd27a" strokeWidth={3} />
        </g>
      </svg>
      <div style={{position: 'absolute', top: 728, left: 0, right: 0, textAlign: 'center', color: '#eafffb', fontWeight: 800, fontSize: 34}}>
        HEMBRA <span style={{color: '#7ff0ff', fontWeight: 600}}>· hasta unos 8 cm</span>
      </div>
      <div style={{position: 'absolute', top: 890, left: 0, right: 0, textAlign: 'center', color: '#eafffb', fontWeight: 800, fontSize: 34, opacity: maleIn}}>
        MACHO <span style={{color: '#ffd27a', fontWeight: 600}}>· mucho más pequeño, sin señuelo</span>
      </div>
    </div>
  );
};

export const Ep02Full: React.FC<Ep02FullProps> = ({quality, showSubtitles, audio}) => {
  ensureFonts();
  const t = useTime();
  const {width, height} = useVideoConfig();
  const descent = t < 21;
  const main = t >= 19.2;

  // ---- hembra
  const fp = femaleParams(t);
  const female = anglerPose(fp);
  const camKeys = cameraAt(CAMERA, t, {amp: 5, rollAmp: 0.002, speed: 0.12});
  const sh = shake(t);
  const camera = {...camKeys, x: camKeys.x + sh.x, y: camKeys.y + sh.y};
  const ctx = {camera, viewport: {width, height}, anchor: ANCHOR};
  const esca = worldToScreen(ctx, 1, female.escaWorld);
  const light = {x: esca.x, y: esca.y, r: lightRadius(t) * camera.zoom, k: clamp(fp.glow) * 0.92};

  // ---- presa y macho
  const prey = t >= PREY_WINDOW[0] && t <= PREY_WINDOW[1] ? preyState(t, female.mouthWorld) : null;
  const male = t >= MALE_FREE_WINDOW[0] && t < MALE_FREE_WINDOW[1] ? maleState(t) : null;
  const attached = maleAttached(t);
  const fuse = maleFuse(t);
  const fusion = fusionMix(t);

  const toScreen = (local: Vec) => worldToScreen(ctx, 1, female.toWorld(local));
  const mix: AudioMix = {...audio, music: audio.music ? {...audio.music, duck: SPEECH} : undefined};
  const tfFemale = `translate(${fp.x.toFixed(2)} ${fp.y.toFixed(2)}) rotate(${((fp.pitch * 180) / Math.PI).toFixed(2)}) scale(${(fp.scale * (1 - 0.55 * clamp(fp.yaw))).toFixed(4)} ${fp.scale.toFixed(4)})`;

  return (
    <QualityProvider quality={quality}>
      <StyleProvider refined>
        <CameraProvider {...ctx}>
          <AbsoluteFill style={{backgroundColor: '#010308'}}>
            {/* ============ ESCENA 1: DESCENSO ============ */}
            {descent && (
              <AbsoluteFill style={{opacity: 1 - stageMix(t)}}>
                <DeepBackground depth={descentDepth(t)} />
                <DescentLayers start={0} />
                <CameraProvider camera={{x: 0, y: 0, zoom: 1, roll: 0}} viewport={{width, height}} anchor={ANCHOR}>
                  <MarineSnow density={smoothstep(9.5, 15, t)} climb={snowClimb(t)} ambient={0.55 * (1 - descentDepth(t)) + 0.2} />
                </CameraProvider>
                {/* el primer destello lejano */}
                <AbsoluteFill style={{mixBlendMode: 'screen'}}>
                  <svg width={width} height={height}>
                    <defs>
                      <radialGradient id="far-glow" cx="0.5" cy="0.5" r="0.5">
                        <stop offset="0" stopColor="#d8fbff" stopOpacity={1} />
                        <stop offset="0.3" stopColor="#5fe6ff" stopOpacity={0.35} />
                        <stop offset="1" stopColor="#2a8cc8" stopOpacity={0} />
                      </radialGradient>
                    </defs>
                    <circle cx={width / 2} cy={height / 2} r={(12 + 40 * smoothstep(15.5, 20, t)) * smoothstep(15.2, 16.4, t) * (0.85 + 0.15 * Math.sin(t * 3.1))} fill="url(#far-glow)" />
                  </svg>
                </AbsoluteFill>
                <DepthGauge meters={descentMeters(t)} opacity={smoothstep(0.5, 1.5, t) * (1 - smoothstep(18.8, 20, t))} />
              </AbsoluteFill>
            )}

            {/* ============ ESCENARIO PROFUNDO ============ */}
            {main && (
              <AbsoluteFill style={{opacity: stageMix(t)}}>
                <DeepBackground depth={1} />
                {/* vida luminosa lejana: detrás de los animales */}
                <AbsoluteFill style={{mixBlendMode: 'screen'}}>
                  <svg width={width} height={height}>
                    <ParallaxLayer depth={0.35}>
                      <DeepLife intensity={deepLife(t)} />
                    </ParallaxLayer>
                    <ParallaxLayer depth={0.55}>
                      <PhotophoreSchool x={-900} y={-500} t={t - 48} opacity={smoothstep(48, 51, t) * (1 - smoothstep(64, 68, t))} />
                      <PhotophoreSchool x={-300} y={400} t={t - 150} opacity={smoothstep(150, 153, t) * (1 - smoothstep(166, 170, t))} speed={45} />
                    </ParallaxLayer>
                  </svg>
                </AbsoluteFill>
                {/* animales: visibles sólo donde llega la luz */}
                <AbsoluteFill style={lightMask(light, darkness(t))}>
                  <svg width={width} height={height}>
                    <ParallaxLayer depth={1}>
                      <Anglerfish id="fem" pose={female} />
                      {attached && (
                        <g transform={tfFemale}>
                          <AttachedMale t={t} fuse={fuse} />
                        </g>
                      )}
                      {male && <MaleAngler x={male.x} y={male.y} scale={male.scale} angle={male.angle} t={t} opacity={male.opacity} />}
                      {prey && <Lanternfish {...prey} t={t} />}
                    </ParallaxLayer>
                  </svg>
                </AbsoluteFill>
                <MarineSnow density={0.85} climb={snowClimb(t)} light={light} ambient={0.12} />
                {/* luz biológica del pez y de la presa (aditiva, por encima) */}
                <AbsoluteFill style={{mixBlendMode: 'screen'}}>
                  <svg width={width} height={height}>
                    <ParallaxLayer depth={1}>
                      <AnglerGlow id="fem" pose={female} zoom={camera.zoom} />
                      {prey && <LanternfishGlow {...prey} t={t} />}
                    </ParallaxLayer>
                  </svg>
                </AbsoluteFill>

                {/* ilustración científica de la fusión (coordenadas locales de la hembra) */}
                {fusion > 0.01 && (
                  <AbsoluteFill>
                    <svg width={width} height={height}>
                      <ParallaxLayer depth={1}>
                        <g transform={tfFemale} opacity={fusion}>
                          {(() => {
                            const a = (118 * Math.PI) / 180;
                            const along = (d: number, off: number): Vec => ({x: 10 + Math.cos(a) * d - Math.sin(a) * off, y: 98 + Math.sin(a) * d + Math.cos(a) * off});
                            const art = [{x: -40, y: 40}, {x: -10, y: 80}, {x: 10, y: 98}, along(20, -3), along(42, -3)];
                            const vein = [along(44, 4), along(20, 4), {x: 16, y: 96}, {x: 0, y: 70}, {x: -30, y: 30}];
                            const flow = (pts: Vec[], color: string, ph: number) =>
                              [0, 1, 2, 3, 4].map((i) => {
                                const f = ((t * 0.35 + i / 5 + ph) % 1 + 1) % 1;
                                const seg = f * (pts.length - 1);
                                const j = Math.min(pts.length - 2, Math.floor(seg));
                                const kk = seg - j;
                                return <circle key={i} cx={pts[j].x + (pts[j + 1].x - pts[j].x) * kk} cy={pts[j].y + (pts[j + 1].y - pts[j].y) * kk} r={3} fill={color} />;
                              });
                            return (
                              <>
                                <ellipse cx={8} cy={100} rx={22} ry={16} fill="none" stroke="#ffd27a" strokeWidth={2} strokeDasharray="4 4" />
                                <path d={smoothPath([along(0, -12), along(30, -14), along(56, -8), along(64, 0), along(56, 8), along(30, 14), along(0, 12)], true)} fill="none" stroke="#ffd27a" strokeOpacity={0.8} strokeWidth={1.6} strokeDasharray="5 4" />
                                <path d={smoothPath(art)} stroke="#ff5a6a" strokeWidth={4} fill="none" strokeLinecap="round" />
                                <path d={smoothPath(vein)} stroke="#a83a52" strokeWidth={4} fill="none" strokeLinecap="round" />
                                {flow(art, '#ffd0d6', 0)}
                                {flow(vein, '#ffd0d6', 0.5)}
                              </>
                            );
                          })()}
                        </g>
                      </ParallaxLayer>
                    </svg>
                  </AbsoluteFill>
                )}
              </AbsoluteFill>
            )}

            {/* viñeta */}
            <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 65% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,4,0.65) 100%)'}} />
            <Dim amount={illustrationDim(t)} color="1,6,16" />

            {/* ============ RÓTULOS CIENTÍFICOS ============ */}
            {t > 54 && t < 59.5 && (() => {
              const p = toScreen({x: 96, y: -8});
              return <Callout x={p.x} y={p.y} side="left" dy={-170} text="Dientes curvados" sub="inclinados hacia el interior" appear={smoothstep(54.4, 55.2, t) * (1 - smoothstep(58.8, 59.4, t))} width={330} />;
            })()}
            {t > 65 && t < 70.6 && (() => {
              const m = female.illicium[2];
              const p1 = toScreen(m);
              const p2 = toScreen(female.esca);
              return (
                <>
                  <Callout x={p1.x} y={p1.y} side="left" dy={-60} text="Illicio (caña)" sub="radio de la aleta dorsal modificado" appear={smoothstep(65.6, 66.4, t) * (1 - smoothstep(70, 70.5, t))} width={340} />
                  <Callout x={p2.x} y={p2.y} side="right" dy={-120} text="Esca" sub="luz de bacterias simbióticas" appear={smoothstep(67.2, 68, t) * (1 - smoothstep(70, 70.5, t))} width={300} />
                </>
              );
            })()}
            {t > 100 && t < 105.4 && (() => {
              const tip = female.barbel.tips[Math.floor(female.barbel.tips.length / 2)];
              const p = toScreen(tip);
              return <Callout x={p.x} y={p.y} side="right" dy={-320} text="Barbilla ramificada" sub="con puntos luminosos" appear={smoothstep(100.4, 101.2, t) * (1 - smoothstep(104.8, 105.4, t))} width={330} />;
            })()}
            {fusion > 0.01 && (() => {
              const a = toScreen({x: 8, y: 100});
              const b = toScreen({x: 10 + Math.cos(2.06) * 40, y: 98 + Math.sin(2.06) * 40});
              return (
                <>
                  <Callout x={a.x} y={a.y} side="right" dy={-140} text="Tejidos fusionados" sub="unión permanente" appear={smoothstep(140.4, 141.2, t) * (1 - smoothstep(149.2, 149.8, t))} width={320} color="#ffd27a" />
                  <Callout x={b.x} y={b.y} side="left" dy={-230} text="Circulación compartida" sub="la sangre de la hembra nutre al macho" appear={smoothstep(142, 142.8, t) * (1 - smoothstep(149.2, 149.8, t))} width={340} color="#ff8a96" />
                </>
              );
            })()}
            {(() => {
              const k2 = easeOut(smoothstep(145.6, 146.4, t) * (1 - smoothstep(149.4, 150, t)));
              return k2 > 0.01 ? (
                <div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center', opacity: k2, transform: `translateY(${(1 - k2) * 16}px)`, fontFamily: FONT_FAMILY}}>
                  <div style={{padding: '18px 34px', borderRadius: 26, background: 'rgba(3,14,30,0.8)', border: '2px solid #ffd27a88', textAlign: 'center'}}>
                    <div style={{fontWeight: 900, fontSize: 48, letterSpacing: 2, color: '#ffd27a'}}>PARASITISMO SEXUAL</div>
                    <div style={{fontWeight: 600, fontSize: 28, color: '#eafffb', marginTop: 4}}>solo en algunas especies de rape abisal</div>
                  </div>
                </div>
              ) : null;
            })()}
            <SizePanel t={t} mix={panelMix(t)} />

            <TitleCard start={41.8} end={45.6} kicker="EL MONSTRUO QUE VIVE" title="EN LA OSCURIDAD" centerY={0.15} accent="#8ff4ff" titleSize={86} />
            {SCENES.slice(1).map((s) => (
              <ChapterTag key={s.n} start={s.start + 0.5} num={`0${s.n}`} label={s.title} />
            ))}
            <FinalCard start={176.3} question="¿QUÉ MÁS SE ESCONDE EN LAS PROFUNDIDADES?" accent={/PROFUNDIDADES/} accentColor="#8ff4ff" footer="EPISODIO 02 · EL MONSTRUO QUE VIVE EN LA OSCURIDAD" />

            <Fade from={0} to={0.8} inverse />
            <Dip at={120} down={0.6} up={0.7} />
            {showSubtitles && <Subtitles cues={CUES} centerY={0.76} />}
            <AudioTracks mix={mix} />
          </AbsoluteFill>
        </CameraProvider>
      </StyleProvider>
    </QualityProvider>
  );
};
