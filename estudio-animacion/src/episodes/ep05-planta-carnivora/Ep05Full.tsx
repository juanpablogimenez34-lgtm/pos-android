import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {AudioTracks} from '../../engine/AudioTracks';
import {CameraProvider, ParallaxLayer, worldToScreen} from '../../engine/camera';
import {ensureFonts} from '../../engine/fonts';
import {clamp, smoothstep, Vec} from '../../engine/math';
import {Callout, ChapterTag, Dip, Fade, FinalCard} from '../../engine/Overlays';
import {QualityName, QualityProvider, useQuality} from '../../engine/quality';
import {StyleProvider} from '../../engine/style';
import {Subtitles} from '../../engine/Subtitles';
import {TitleCard} from '../../engine/TitleCard';
import {AudioMix} from '../../engine/types';
import {useTime} from '../../engine/useTime';
import {hairTip, petioleGeo, trapGeo, TrapGeo, TrapState} from './anatomy/flytrap';
import {add, lerp3, project, scl, V3, View} from './anatomy/proj';
import {Item, sortItems} from './anatomy/render';
import {heroFly, secondFly, WALK_S} from './animation/flyStates';
import {spiderPose, spiderVisible} from './animation/spiderStates';
import {HAIR1, heroTrap, otherTrap} from './animation/trapStates';
import {ANCHOR, cameraAt, Targets, viewAt} from './cameras';
import {FlyDefs, flyItems} from './characters/Fly';
import {spiderItems} from './characters/Spider';
import {flytrapItems} from './characters/VenusFlytrap';
import {groundItems} from './scenes/Ground';
import {HERO, TRAPS} from './scenes/plantLayout';
import {DaysCard, DigestionPanel, nightAt, ReplayOverlay, SignalPanel, StimulusCounter} from './scenes/Science';
import {soilItems} from './scenes/Soil';
import {ForegroundBlur, lightAt, Particles, SunRays, Wetland} from './scenes/Wetland';
import {CUES, SPEECH} from './subtitles';
import {EV, SCENES, storyT} from './timeline';

export type Ep05FullProps = {quality: QualityName; showSubtitles: boolean; audio: AudioMix};

const T1 = TRAPS.find((s) => s.id === HERO)!;
const T2 = TRAPS.find((s) => s.id === 'T2')!;
const win = (t: number, a: number, b: number, r = 0.5) => smoothstep(a, a + r, t) * (1 - smoothstep(b - r, b, t));

function statesAt(t: number): Record<string, TrapState> {
  return Object.fromEntries(TRAPS.map((s) => [s.id, s.id === HERO ? heroTrap(t) : otherTrap(s.id, t)]));
}
const heroGeo = (t: number) => trapGeo(T1, heroTrap(t), storyT(t));

/** Flujo de nutrientes (137–145 s): partículas desde la presa por el pecíolo hasta la roseta. */
function absorptionItems(view: View, g: TrapGeo, t: number, k: number): Item[] {
  if (k <= 0.01) return [];
  const pg = petioleGeo(T1, g);
  const path = [g.C, ...[...pg.mid].reverse()];
  const at = (u: number): V3 => {
    const f = u * (path.length - 1);
    const i = Math.min(path.length - 2, Math.floor(f));
    return lerp3(path[i], path[i + 1], f - i);
  };
  const dots = Array.from({length: 16}, (_, i) => {
    const u = ((t * 0.22 + i / 16) % 1 + 1) % 1;
    const q = project(view, add(at(u), [0, 6, 0]));
    return <circle key={i} cx={q.x} cy={q.y} r={7} fill={i % 2 ? '#7fd0ff' : '#ffb86b'} opacity={k * Math.sin(Math.PI * u)} />;
  });
  return [{z: 1e5, key: 'abs', node: <g key="abs">{dots}</g>}];
}

const Scene: React.FC<{showSubtitles: boolean; audio: AudioMix}> = ({showSubtitles, audio}) => {
  const t = useTime();
  const q = useQuality();
  const {width, height} = useVideoConfig();
  const detail = q.name === 'final' ? 1 : 0.55;
  const s = storyT(t);
  const view = viewAt(t);
  const light = lightAt(nightAt(t));
  const states = statesAt(t);
  const g = heroGeo(t);
  const fly = heroFly(t, g);
  const sp = spiderVisible(t) ? spiderPose(t) : null;
  // objetivos de cámara (la mosca se suaviza para que la cámara no tiemble con su vuelo)
  const flyAvg = (() => {
    const ps = [-0.25, 0, 0.25].map((d) => heroFly(t + d, heroGeo(t + d))?.pose.pos).filter(Boolean) as V3[];
    if (!ps.length) return null;
    return scl(ps.reduce((a, p) => add(a, p), [0, 0, 0] as V3), 1 / ps.length);
  })();
  const hairs = [0, 1, 2].map((k) => hairTip(g, WALK_S === 1 ? k : k + 3).base);
  const hairsC = scl(hairs.reduce((a, p) => add(a, p), [0, 0, 0] as V3), 1 / 3);
  const g2 = trapGeo(T2, states.T2, s);
  const T1C = g.C;
  const targets: Targets = {
    O: [0, 60, 0],
    high: [0, 260, 0],
    spider: sp ? sp.pos : [-830, 20, 480],
    T1C,
    T1rim: g.point(g.normal(1)[2] > g.normal(-1)[2] ? 1 : -1, 0.15, 1),
    hairs: hairsC,
    fly: flyAvg ?? T1C,
    flyPlant: flyAvg ? lerp3(flyAvg, [0, 120, 0], 0.5) : [0, 120, 0],
    flyT1: flyAvg ? lerp3(flyAvg, T1C, 0.45) : T1C,
    flyHair: flyAvg ? lerp3(flyAvg, hairTip(g, HAIR1).tip, 0.5) : hairsC,
    soil: [0, -380, 0],
    T1T2: lerp3(T1C, g2.C, 0.5),
    T1base: lerp3([0, 40, 0], T1C, 0.5),
  };
  const camera = cameraAt(t, view, targets);
  const ctx = {camera, viewport: {width, height}, anchor: ANCHOR};
  const toScreen = (p: V3): Vec => worldToScreen(ctx, 1, project(view, p));
  // ---------------- lista de dibujo
  const soilK = win(t, 119.6, 149.4, 1.2);
  const items: Item[] = [];
  items.push(...groundItems(view, t, light, detail, soilK));
  items.push(...soilItems(view, t, soilK, win(t, 127.6, 137.2, 0.8)));
  const plant = flytrapItems({view, specs: TRAPS, states, t: s, uid: 'pl', light: light.sun, detail: {glands: Math.round(60 * detail), veins: 7, cilia: 17}});
  items.push(...plant.items);
  if (fly) {
    const m = plant.meta[HERO];
    const farZ = m.back.s === WALK_S ? m.back.z : m.front.z;
    const zMap = fly.where === 'lobe' || fly.where === 'inside' || fly.where === 'husk' ? (z: number) => farZ + 0.5 + (z - project(view, fly.pose.pos).z) * 0.001 : undefined;
    const fi = flyItems(view, fly.pose, 'fly', zMap);
    items.push(...(fly.blur > 0.3 ? fi.map((it) => ({...it, node: <g key={it.key} style={{filter: `blur(${fly.blur.toFixed(1)}px)`}}>{it.node}</g>})) : fi));
    // presa retenida: su silueta se adivina a contraluz a través del tejido del lóbulo
    if (fly.where === 'inside' && s < 112) {
      const sil = flyItems(view, fly.pose, 'flysil', (z) => m.front.z + 0.004 + (z - project(view, fly.pose.pos).z) * 1e-6);
      const ko = 0.42 * (1 - smoothstep(106, 112, s));
      items.push({z: m.front.z + 0.004, key: 'flysil', node: <g key="flysil" opacity={ko} style={{filter: 'brightness(0.18) blur(1.2px)'}}>{sortItems(sil).map((it) => it.node)}</g>});
    }
  }
  const f2 = secondFly(t);
  if (f2) items.push(...flyItems(view, f2.pose, 'fly2').map((it) => ({...it, node: <g key={it.key} style={{filter: `blur(${f2.blur}px)`}}>{it.node}</g>})));
  if (sp) items.push(...spiderItems(view, sp, 'sp'));
  items.push(...absorptionItems(view, g, t, win(t, 137.4, 145, 0.8)));
  const sorted = sortItems(items);
  // ---------------- rótulos anclados a la escena
  const rim = toScreen(targets.T1rim as V3);
  const hairS = toScreen(hairs[1]);
  const flyS = fly ? toScreen(fly.pose.pos) : null;
  const rzS = toScreen([0, -95, 0]);
  const rootS = toScreen([160, -420, 0]);
  const mix: AudioMix = {...audio, music: audio.music ? {...audio.music, duck: SPEECH} : undefined};
  return (
    <CameraProvider {...ctx}>
      <AbsoluteFill style={{backgroundColor: light.top}}>
        <Wetland light={light} zoom={camera.zoom} />
        <AbsoluteFill>
          <svg width={width} height={height}>
            <FlyDefs />
            <ParallaxLayer depth={1}>{sorted.map((it) => it.node)}</ParallaxLayer>
          </svg>
        </AbsoluteFill>
        <ForegroundBlur zoom={camera.zoom} light={light} />
        <SunRays light={light} k={1 - 0.7 * clamp((camera.zoom - 2) / 3)} />
        <Particles n={q.name === 'final' ? 40 : 20} light={light} />
        {/* viñeta cinematográfica */}
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 65% at 50% 45%, rgba(0,0,0,0) 58%, rgba(8,14,6,0.5) 100%)'}} />
        {/* salto temporal: luz de día y noche */}
        <AbsoluteFill style={{background: '#0a1430', opacity: nightAt(t) * 0.55}} />

        {flyS && t > 25.6 && t < 29.6 && <Callout x={flyS.x} y={flyS.y} side="right" dy={-170} text="Mosca doméstica" sub="Musca domestica" appear={win(t, 25.8, 29.4, 0.4)} width={340} color="#ffd27a" />}
        {flyS && t > 36 && t < 39.6 && <Callout x={flyS.x} y={flyS.y} side="left" dy={-220} text="Limpieza" sub="patas delanteras" appear={win(t, 36.2, 39.4, 0.4)} width={300} color="#ffd27a" />}
        {t > 16.6 && t < 20 && <Callout x={rim.x} y={rim.y} side="left" dy={-260} text="Dientes marginales" sub="cilios del borde de la trampa" appear={win(t, 16.8, 19.8, 0.4)} width={380} />}
        {t > 52.4 && t < 57.6 && <Callout x={hairS.x} y={hairS.y} side="right" dy={-240} text="Pelos sensitivos" sub="suele haber 3 por lóbulo" appear={win(t, 52.6, 57.4, 0.4)} width={360} />}
        {t > 46.4 && t < 51.2 && <Callout x={toScreen(g.point(WALK_S, -0.3, 0.45)).x} y={toScreen(g.point(WALK_S, -0.3, 0.45)).y} side="left" dy={-260} text="Cara interna" sub="pigmento rojizo y glándulas" appear={win(t, 46.6, 51, 0.4)} width={360} />}
        {t > 122.4 && t < 136.8 && <Callout x={rzS.x} y={rzS.y} side="right" dy={-120} text="Rizoma" sub="tallo subterráneo" appear={win(t, 122.6, 136.6, 0.5)} width={300} color="#c9f27a" />}
        {t > 123.4 && t < 136.8 && <Callout x={rootS.x} y={rootS.y} side="right" dy={120} text="Raíces" appear={win(t, 123.6, 136.6, 0.5)} width={240} color="#c9f27a" />}
        {t > 128.4 && t < 137 && (
          <div style={{position: 'absolute', left: 60, right: 60, top: 230, textAlign: 'center', fontFamily: 'Montserrat', opacity: win(t, 128.4, 137, 0.5)}}>
            <span style={{background: 'rgba(6,18,24,0.75)', borderRadius: 18, padding: '12px 24px', color: '#ffffff', fontWeight: 800, fontSize: 32}}>
              Suelo pobre: <span style={{color: '#7fd0ff'}}>N</span> nitrógeno · <span style={{color: '#ffb86b'}}>P</span> fósforo
            </span>
          </div>
        )}
        {t > 137.6 && t < 145.4 && (
          <div style={{position: 'absolute', left: 60, right: 60, top: 230, textAlign: 'center', fontFamily: 'Montserrat', opacity: win(t, 137.6, 145.4, 0.5)}}>
            <div style={{display: 'inline-block', background: 'rgba(6,18,24,0.75)', borderRadius: 18, padding: '14px 26px', color: '#ffffff', fontWeight: 800, fontSize: 30, lineHeight: 1.35}}>
              <span style={{color: '#ffe08a'}}>☀ Luz solar → fotosíntesis</span>
              <br />
              <span style={{color: '#c9f27a'}}>Presas → nitrógeno y fósforo</span>
              <div style={{fontSize: 22, fontWeight: 600, color: '#bfe6ef', marginTop: 4}}>representación esquemática</div>
            </div>
          </div>
        )}

        <StimulusCounter />
        <SignalPanel />
        <ReplayOverlay />
        <DigestionPanel />
        <DaysCard />

        <TitleCard start={15.6} end={20.2} kicker="LA PLANTA QUE" title="CAZA ANIMALES" centerY={0.14} accent="#c9f27a" titleSize={96} />
        {SCENES.slice(1).map((sc) => (
          <ChapterTag key={sc.n} start={sc.start + 0.5} num={`0${sc.n}`} label={sc.title} />
        ))}
        <FinalCard start={EV.final} question="¿SABÍAS QUE UNA PLANTA PODÍA HACER ESTO?" accent={/PLANTA/} accentColor="#c9f27a" footer="VENUS ATRAPAMOSCAS · Dionaea muscipula · EPISODIO 05" />

        <Dip at={120.6} down={0.5} up={0.6} />
        <Fade from={0} to={0.8} inverse />
        {showSubtitles && <Subtitles cues={CUES} centerY={0.78} />}
        <AudioTracks mix={mix} />
      </AbsoluteFill>
    </CameraProvider>
  );
};

export const Ep05Full: React.FC<Ep05FullProps> = ({quality, showSubtitles, audio}) => {
  ensureFonts();
  return (
    <QualityProvider quality={quality}>
      <StyleProvider refined>
        <Scene showSubtitles={showSubtitles} audio={audio} />
      </StyleProvider>
    </QualityProvider>
  );
};
