import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {AudioTracks} from '../../engine/AudioTracks';
import {CameraProvider, ParallaxLayer, worldToScreen} from '../../engine/camera';
import {ensureFonts, FONT_FAMILY} from '../../engine/fonts';
import {smoothstep, Vec} from '../../engine/math';
import {Callout, ChapterTag, Fade, FinalCard} from '../../engine/Overlays';
import {QualityName, QualityProvider, useQuality} from '../../engine/quality';
import {StyleProvider} from '../../engine/style';
import {Subtitles} from '../../engine/Subtitles';
import {TitleCard} from '../../engine/TitleCard';
import {AudioMix} from '../../engine/types';
import {pulse} from '../../engine/timeline';
import {useTime} from '../../engine/useTime';
import {pinkAt, pinkVisible, twigAt, wildAt} from './Animation/axolotlStates';
import {daphniaAt, daphniaVisible} from './Animation/daphniaStates';
import {add, lerp3, project, scl, V3} from './Animation/proj';
import {Item, sortItems} from './Animation/render';
import {ANCHOR, cameraAt, Targets, viewAt} from './Camera/cameras';
import {axolotlItems, spineOf} from './Characters/Axolotl';
import {daphniaItems} from './Characters/Daphnia';
import {bottomItems} from './Environments/Bottom';
import {AboveWater, Suspended, SURF, UnderWater} from './Environments/Water';
import {CellPanel, RegenLoupe, SciTransition} from './Regeneration/RegenViews';
import {CUES, SPEECH} from './Subtitles/subtitles';
import {EV, SCENES, sciK} from './Timeline/timeline';

export type Ep06FullProps = {quality: QualityName; showSubtitles: boolean; audio: AudioMix};

const win = (t: number, a: number, b: number, r = 0.5) => smoothstep(a, a + r, t) * (1 - smoothstep(b - r, b, t));

const Scene: React.FC<{showSubtitles: boolean; audio: AudioMix}> = ({showSubtitles, audio}) => {
  const t = useTime();
  const q = useQuality();
  const {width, height} = useVideoConfig();
  const detail = q.name === 'final' ? 1 : 0.6;
  const view = viewAt(t);
  const pink = pinkAt(t);
  const wild = wildAt(t);
  // objetivo suavizado del rosado (la cámara no tiembla con la ondulación)
  const pinkRoot = [-0.3, 0, 0.3].map((d) => pinkAt(t + d).pose.root).reduce((a, p) => add(a, p), [0, 0, 0] as V3);
  const pr = scl(pinkRoot, 1 / 3);
  const psp = spineOf(pink.spec, pink.pose);
  const wsp = wild ? spineOf(wild.spec, wild.pose) : null;
  const head = psp.pts[3];
  const gills = psp.pts[Math.round(0.13 * 40)];
  const wildRoot = wild ? wild.pose.root : ([1500, 54, -400] as V3);
  const targets: Targets = {
    canal: [-300, SURF + 700, 0],
    descend: [-200, SURF - 1500, 0],
    wild: [wildRoot[0], 140, wildRoot[2]],
    wildPink: lerp3([wildRoot[0], 140, wildRoot[2]], [pr[0], 140, pr[2]], 0.5),
    pink: [pr[0], Math.max(120, pr[1]), pr[2]],
    pinkHead: add(head, [-60, 60, 0]),
    pinkGills: add(gills, [0, 60, 0]),
    feed: add(psp.pts[0], [80, 40, 0]),
    surfaceView: [-5200, SURF - 700, 0],
  };
  // pata LF (posición real del rig)
  const axo = axolotlItems(view, pink.spec, pink.pose, 'pk');
  const lfElbow = axo.lfElbow ?? head;
  const lfTip = axo.lfTip ?? head;
  targets.pinkLF = lerp3(lfElbow, lfTip, 0.5);
  const camera = cameraAt(t, view, targets);
  const ctx = {camera, viewport: {width, height}, anchor: ANCHOR};
  const toScreen = (p: V3): Vec => worldToScreen(ctx, 1, project(view, p));
  const dim = 0.35 * sciK(t) * (1 - win(t, 70, 120, 1) * 0.3);
  // ---------------- lista de dibujo
  const items: Item[] = [];
  const current = 0.4 + 0.3 * Math.sin(t * 0.15);
  items.push(...bottomItems(view, t, detail, dim, current));
  if (pinkVisible(t)) items.push(...axo.items);
  if (wild) items.push(...axolotlItems(view, wild.spec, wild.pose, 'wd').items);
  if (daphniaVisible(t)) daphniaAt(t, psp.pts[0]).forEach((d, i) => items.push(...daphniaItems(view, d, `dp${i}`)));
  const tw = twigAt(t);
  if (tw) {
    const a = project(view, tw);
    items.push({z: a.z, key: 'twig', node: <path key="twig" d={`M${a.x - 40},${a.y - 6} L${a.x + 40},${a.y + 6}`} stroke="#5a4428" strokeWidth={8} strokeLinecap="round" />});
  }
  const sorted = sortItems(items);
  const mix: AudioMix = {...audio, music: audio.music ? {...audio.music, duck: SPEECH} : undefined};
  const wildS = wild && wsp ? toScreen(wsp.pts[4]) : null;
  const gillS = toScreen(add(gills, [0, 90, 0]));
  const tailS = toScreen(psp.pts[32]);
  const lfS = toScreen(lfTip);
  const dp0 = daphniaVisible(t) ? toScreen(daphniaAt(t, psp.pts[0])[0].pos) : null;
  return (
    <CameraProvider {...ctx}>
      <AbsoluteFill style={{backgroundColor: '#1d2e24'}}>
        <UnderWater zoom={camera.zoom} dim={dim} />
        <AboveWater k={1} />
        <AbsoluteFill>
          <svg width={width} height={height}>
            <ParallaxLayer depth={1}>{sorted.map((it) => it.node)}</ParallaxLayer>
          </svg>
        </AbsoluteFill>
        <Suspended n={q.name === 'final' ? 70 : 36} />
        {/* turbidez y viñeta */}
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 45%, rgba(40,70,50,0) 55%, rgba(6,16,10,0.55) 100%)'}} />

        {wildS && t > 11 && t < 15 && <Callout x={wildS.x} y={wildS.y} side="right" dy={-200} text="Ajolote silvestre" sub="coloración oscura y moteada" appear={win(t, 11.2, 14.8, 0.4)} width={360} color="#c9f27a" />}
        {t > 22.8 && t < 28.4 && (
          <div style={{position: 'absolute', left: 60, right: 60, top: 240, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: win(t, 22.8, 28.4, 0.5)}}>
            <span style={{background: 'rgba(6,20,16,0.72)', borderRadius: 16, padding: '10px 20px', color: '#ffe0dc', fontWeight: 700, fontSize: 26}}>variedad leucística (ilustrativa) · en la naturaleza predomina la coloración oscura</span>
          </div>
        )}
        {t > 28.4 && t < 33.6 && <Callout x={gillS.x} y={gillS.y} side="right" dy={-200} text="Branquias externas" sub="3 pares · filamentos plumosos" appear={win(t, 28.6, 33.4, 0.4)} width={380} color="#ff9aa8" />}
        {t > 41.2 && t < 44.8 && <Callout x={tailS.x} y={tailS.y} side="left" dy={-200} text="Cola comprimida" sub="aleta caudal continua" appear={win(t, 41.4, 44.6, 0.4)} width={340} />}
        {dp0 && t > 46.6 && t < 49.6 && <Callout x={dp0.x} y={dp0.y} side="right" dy={-170} text="Daphnia" sub="pequeño crustáceo · presa" appear={win(t, 46.8, 49.4, 0.4)} width={320} color="#ffd27a" />}
        {t > 62.8 && t < 69.6 && <Callout x={lfS.x} y={lfS.y} side="right" dy={-260} text="Extremidad anterior izquierda" sub="zona de la lesión · representación no gráfica" appear={win(t, 63, 69.4, 0.5)} width={420} color="#7ff3ff" />}
        {t > 151 && t < 156.4 && <Callout x={lfS.x} y={lfS.y} side="right" dy={-220} text="Pata regenerada" sub="vuelve a usarla poco a poco" appear={win(t, 151.2, 156.2, 0.5)} width={360} color="#c9f27a" />}

        <SciTransition k={win(t, EV.sciIn, 70.4, 1.0)} lesionFlash={pulse(t, EV.lesion - 0.35, EV.lesion + 0.35, 0.3)} />
        <RegenLoupe tipX={lfS.x} tipY={lfS.y} />
        <CellPanel />

        <TitleCard start={15.8} end={20.4} kicker="EL ANIMAL QUE" title="RECONSTRUYE SU CUERPO" centerY={0.14} accent="#ffb3bd" titleSize={62} />
        {SCENES.slice(1).map((sc) => (
          <ChapterTag key={sc.n} start={sc.start + 0.5} num={`0${sc.n}`} label={sc.title} />
        ))}
        <FinalCard start={EV.final} question="UN ANIMAL EXTRAORDINARIO QUE NECESITA PROTECCIÓN" accent={/PROTECCIÓN/} accentColor="#ffb3bd" footer="AJOLOTE MEXICANO · Ambystoma mexicanum · EN PELIGRO CRÍTICO · EPISODIO 06" />

        <Fade from={0} to={0.8} inverse />
        {showSubtitles && <Subtitles cues={CUES} centerY={0.8} />}
        <AudioTracks mix={mix} />
      </AbsoluteFill>
    </CameraProvider>
  );
};

export const Ep06Full: React.FC<Ep06FullProps> = ({quality, showSubtitles, audio}) => {
  ensureFonts();
  return (
    <QualityProvider quality={quality}>
      <StyleProvider refined>
        <Scene showSubtitles={showSubtitles} audio={audio} />
      </StyleProvider>
    </QualityProvider>
  );
};
