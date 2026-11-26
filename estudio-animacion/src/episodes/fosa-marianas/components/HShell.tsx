// CARCASA HORIZONTAL 1920×1080 sobre el motor original del pulpo: cámara 2.5D con parallax real
// (engine/camera: CameraProvider + ParallaxLayer, independiente del tamaño del cuadro), calidad, estilo,
// subtítulos premium (Subtitles2 se adapta al tamaño con useVideoConfig) y mezcla de audio con ducking.
// Cada escena devuelve sus capas; la carcasa las apila, funde las escenas sin pantallas negras y añade el HUD.
import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {AudioTracks} from '../../../engine/AudioTracks';
import {Camera, CameraProvider} from '../../../engine/camera';
import {ensureFonts} from '../../../engine/fonts';
import {QualityName, QualityProvider} from '../../../engine/quality';
import {StyleProvider} from '../../../engine/style';
import {AudioMix, DuckInterval, SubtitleCue} from '../../../engine/types';
import {useTime} from '../../../engine/useTime';
import {Darkness, Light, MarineSnow} from '../../../environments/deepsea/DeepSea';
import {Subtitles2} from '../../../studio2/Subtitles2';

export const VW = 1920;
export const VH = 1080;
export const VIEW = {width: VW, height: VH};
export const ANCHOR = {x: 0, y: 0};

export type Frame = {
  cam: Camera;
  /** capas del mundo (dentro de un único <svg>, la escena usa ParallaxLayer) */
  world: React.ReactNode;
  /** nieve marina: densidad 0–1 y desplazamiento vertical acumulado (descenso) */
  snow?: {density: number; climb: number; ambient?: number};
  /** oscuridad con "agujero" de luz (pantalla) */
  dark?: {amount: number; light?: Light};
  /** capa luminosa por encima de la oscuridad (bioluminiscencia, focos) */
  glow?: React.ReactNode;
  /** rótulos de la escena (HTML en pantalla) */
  overlay?: React.ReactNode;
};
export type SceneDef = {start: number; end: number; render: (t: number) => Frame};

const Stack: React.FC<{f: Frame}> = ({f}) => (
  <CameraProvider camera={f.cam} viewport={VIEW} anchor={ANCHOR}>
    <AbsoluteFill>
      <svg width={VW} height={VH} style={{position: 'absolute'}}>{f.world}</svg>
    </AbsoluteFill>
    {f.snow && f.snow.density > 0.01 && <MarineSnow density={f.snow.density} climb={f.snow.climb} light={f.dark?.light} ambient={f.snow.ambient ?? 0.25} />}
    {f.dark && f.dark.amount > 0.005 && <Darkness amount={f.dark.amount} light={f.dark.light} />}
    {f.glow && (
      <AbsoluteFill>
        <svg width={VW} height={VH} style={{position: 'absolute'}}>{f.glow}</svg>
      </AbsoluteFill>
    )}
    {f.overlay}
  </CameraProvider>
);

export const HShell: React.FC<{
  quality: QualityName; showSubtitles: boolean; audio: AudioMix; scenes: SceneDef[]; cues: SubtitleCue[]; speech: DuckInterval[];
  hud?: (t: number) => React.ReactNode; extraAudio?: {src: string; volume: number}[]; xfade?: number; background?: string;
}> = ({quality, showSubtitles, audio, scenes, cues, speech, hud, extraAudio = [], xfade = 0.9, background = '#020812'}) => {
  ensureFonts();
  return (
    <QualityProvider quality={quality}>
      <StyleProvider refined>
        <Inner {...{showSubtitles, audio, scenes, cues, speech, hud, extraAudio, xfade, background}} />
      </StyleProvider>
    </QualityProvider>
  );
};

const Inner: React.FC<{showSubtitles: boolean; audio: AudioMix; scenes: SceneDef[]; cues: SubtitleCue[]; speech: DuckInterval[]; hud?: (t: number) => React.ReactNode; extraAudio: {src: string; volume: number}[]; xfade: number; background: string}> = ({showSubtitles, audio, scenes, cues, speech, hud, extraAudio, xfade, background}) => {
  const t = useTime();
  const i = Math.max(0, scenes.findIndex((s) => t >= s.start && t < s.end));
  const sc = scenes[i] ?? scenes[scenes.length - 1];
  const cur = sc.render(t);
  // fundido encadenado con la escena anterior (sin negro intermedio)
  const u = i > 0 ? (t - sc.start) / xfade : 1;
  const prev = u < 1 ? scenes[i - 1].render(t) : null;
  const e = u * u * (3 - 2 * u);
  const mix: AudioMix = {
    ...audio,
    music: audio.music ? {...audio.music, duck: speech} : undefined,
    ambience: audio.ambience ? {...audio.ambience, duck: speech, duckTo: 0.7} : undefined,
  };
  return (
    <AbsoluteFill style={{backgroundColor: background}}>
      {prev ? (
        <>
          <AbsoluteFill><Stack f={prev} /></AbsoluteFill>
          <AbsoluteFill style={{opacity: e}}><Stack f={cur} /></AbsoluteFill>
        </>
      ) : (
        <Stack f={cur} />
      )}
      {hud?.(t)}
      {showSubtitles && <Subtitles2 cues={cues} centerY={0.875} altY={0.875} fontSize={44} />}
      <AudioTracks mix={mix} />
      {audio.narration && extraAudio.map((a) => <Audio key={a.src} src={staticFile(a.src)} volume={a.volume} />)}
    </AbsoluteFill>
  );
};
