import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {AudioTracks} from '../../engine/AudioTracks';
import {CameraProvider, ParallaxLayer, worldToScreen} from '../../engine/camera';
import {ensureFonts, FONT_FAMILY} from '../../engine/fonts';
import {clamp, easeOut, smoothstep} from '../../engine/math';
import {Callout, ChapterTag, Dip, Fade, FinalCard} from '../../engine/Overlays';
import {QualityName, QualityProvider} from '../../engine/quality';
import {StyleProvider} from '../../engine/style';
import {Subtitles} from '../../engine/Subtitles';
import {TitleCard} from '../../engine/TitleCard';
import {AudioMix} from '../../engine/types';
import {useTime} from '../../engine/useTime';
import {Bird, birdPolys, PEREGRINE, PIGEON} from '../../creatures/falcon/Bird';
import {skyPalette} from '../../environments/sky/Sky';
import {ANCHOR, cameraFor} from './cameras';
import {BodyTrails, FlowPanel, FocusRing, RushClouds, SpeedLines, WingPanel} from './effects';
import {ForegroundClouds, Landscape} from './scenes/Landscape';
import {CUES, SPEECH} from './subtitles';
import {animTime, currents, falconParams, focusBlur, panel, pigeonParams, pigeonVisible, SCENES, speedIntensity, tod, wingStretch} from './timeline';

export type Ep04FullProps = {quality: QualityName; showSubtitles: boolean; audio: AudioMix};

const Badge: React.FC<{y: number; k: number; title: string; sub: string; color?: string}> = ({y, k, title, sub, color = '#ffd27a'}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: easeOut(k), transform: `translateY(${(1 - easeOut(k)) * 16}px)`, fontFamily: FONT_FAMILY}}>
      <div style={{padding: '16px 30px', borderRadius: 24, background: 'rgba(6,14,28,0.72)', border: `2px solid ${color}88`, textAlign: 'center', maxWidth: 920}}>
        <div style={{fontWeight: 900, fontSize: 46, color, letterSpacing: 1}}>{title}</div>
        <div style={{fontWeight: 600, fontSize: 26, color: '#eafffb', marginTop: 4}}>{sub}</div>
      </div>
    </div>
  ) : null;

const win = (t: number, a: number, b: number, r = 0.5) => smoothstep(a, a + r, t) * (1 - smoothstep(b - r, b, t));

export const Ep04Full: React.FC<Ep04FullProps> = ({quality, showSubtitles, audio}) => {
  ensureFonts();
  const t = useTime();
  const {width, height} = useVideoConfig();
  const td = tod(t);
  const pal = skyPalette(td);
  const fp = falconParams(t, pal.light);
  const ws = wingStretch(t);
  if (t > 34 && t < 40.2) {
    fp.fold = ws.fold;
    fp.flap = fp.flap + ws.flapAdd;
  }
  const geo = birdPolys(PEREGRINE, fp);
  const pg = pigeonVisible(t) ? pigeonParams(t, pal.light) : null;
  const camera = cameraFor(t, {x: fp.x, y: fp.y}, geo.head, pg ? {x: pg.x, y: pg.y} : null);
  const ctx = {camera, viewport: {width, height}, anchor: ANCHOR};
  const mix: AudioMix = {...audio, music: audio.music ? {...audio.music, duck: SPEECH} : undefined};
  const speed = speedIntensity(t);
  const fwd = geo.forward;
  const panels = panel(t);
  const eyeS = geo.eye ? worldToScreen(ctx, 1, geo.eye) : null;
  const pgS = pg ? worldToScreen(ctx, 1, {x: pg.x, y: pg.y}) : null;
  const tau = animTime(t);
  // desenfoque de movimiento del fondo cercano en la picada, según la dirección de vuelo
  const fl = Math.hypot(fwd.x, fwd.y) || 1;
  const motion = {x: (Math.abs(fwd.x) / fl) * 18 * speed, y: (Math.abs(fwd.y) / fl) * 18 * speed};
  return (
    <QualityProvider quality={quality}>
      <StyleProvider refined>
        <CameraProvider {...ctx}>
          <AbsoluteFill style={{backgroundColor: pal.top}}>
            <Landscape pal={pal} tod={td} currents={currents(t)} blur={focusBlur(t)} motion={motion} />
            <RushClouds intensity={speed} dir={fwd} tau={tau} pal={pal} />
            <AbsoluteFill>
              <svg width={width} height={height}>
                <ParallaxLayer depth={1}>
                  <BodyTrails intensity={speed} x={fp.x} y={fp.y} dir={fwd} scale={fp.scale} tau={tau} />
                  {pg && <Bird id="pigeon" spec={PIGEON} params={pg} />}
                  <Bird id="falcon" spec={PEREGRINE} params={fp} />
                </ParallaxLayer>
              </svg>
            </AbsoluteFill>
            <ForegroundClouds pal={pal} zoom={camera.zoom} />
            <RushClouds intensity={speed} dir={fwd} tau={tau} pal={pal} front />
            <SpeedLines intensity={speed} dir={fwd} tau={tau} />
            {/* túnel de velocidad: bordes más oscuros en el pico de la picada */}
            {speed > 0.05 && <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 60% at 50% 42%, rgba(0,0,0,0) 55%, rgba(6,14,30,0.5) 100%)', opacity: speed}} />}
            {/* luz cálida del atardecer */}
            <AbsoluteFill style={{background: `radial-gradient(ellipse at 20% 30%, ${pal.light}22 0%, rgba(0,0,0,0) 60%)`, mixBlendMode: 'screen', opacity: clamp(td - 1)}} />
            <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 65% at 50% 45%, rgba(0,0,0,0) 60%, rgba(4,8,20,0.45) 100%)'}} />

            <WingPanel k={panels.wing} base={fp} />
            <FlowPanel k={panels.flow} base={fp} />

            {pgS && <FocusRing x={pgS.x} y={pgS.y} k={win(t, 80.8, 83.4, 0.4)} />}
            {pgS && t > 80.8 && t < 83.4 && <Callout x={pgS.x} y={pgS.y} side="right" dy={-180} text="Paloma" sub="presa a gran distancia" appear={win(t, 81, 83.4, 0.4)} width={300} color="#ffd27a" />}
            {eyeS && t > 112.4 && t < 116.8 && <Callout x={eyeS.x} y={eyeS.y} side="left" dy={-200} text="Membrana nictitante" sub="protege el ojo" appear={win(t, 112.6, 116.6, 0.4)} width={330} color="#7fd0ff" />}
            <Badge y={250} k={win(t, 96, 101.5)} title="MÁS DE 300 KM/H" sub="en picadas de caza" />
            <Badge y={250} k={win(t, 101.8, 106.8)} title="MÁS DE 380 KM/H" sub="registrados con halcones entrenados" />
            <Badge y={250} k={win(t, 116.8, 120)} title="VUELO HORIZONTAL" sub="mucho más lento que en picada" color="#7fd0ff" />
            <Badge y={250} k={win(t, 151, 162.4)} title="DDT" sub="lo hizo desaparecer de muchas regiones · recuperado tras su prohibición" color="#c9f27a" />
            {t > 107 && t < 114 && (
              <div style={{position: 'absolute', left: 0, right: 0, top: 1700, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 600, fontSize: 22, color: '#ffffff', opacity: 0.6 * win(t, 107, 114)}}>
                líneas de velocidad estilizadas · no es una medición
              </div>
            )}
            {t > 114.2 && t < 119.6 && (
              <div style={{position: 'absolute', left: 60, top: 170, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: '#ffffff', opacity: 0.75 * win(t, 114.2, 119.6, 0.4)}}>● CÁMARA LENTA</div>
            )}

            <TitleCard start={16.0} end={20.0} kicker="EL AVE QUE SUPERA" title="LOS 300 KM/H" centerY={0.14} accent="#ffd27a" />
            {SCENES.slice(1).map((s) => (
              <ChapterTag key={s.n} start={s.start + 0.5} num={`0${s.n}`} label={s.title} />
            ))}
            <FinalCard start={174.8} question="¿QUÉ ANIMAL SUPERA ESTA VELOCIDAD?" accent={/VELOCIDAD/} accentColor="#ffd27a" footer="EN PICADA, NINGÚN ANIMAL CONOCIDO LO SUPERA · EPISODIO 04" />

            <Dip at={20} down={0.5} up={0.6} />
            <Fade from={0} to={0.8} inverse />
            {showSubtitles && <Subtitles cues={CUES} centerY={0.76} />}
            <AudioTracks mix={mix} />
          </AbsoluteFill>
        </CameraProvider>
      </StyleProvider>
    </QualityProvider>
  );
};
