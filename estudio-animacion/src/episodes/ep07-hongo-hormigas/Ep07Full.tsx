import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {AudioTracks} from '../../engine/AudioTracks';
import {CameraProvider, worldToScreen} from '../../engine/camera';
import {ensureFonts, FONT_FAMILY} from '../../engine/fonts';
import {smoothstep, Vec} from '../../engine/math';
import {Callout, ChapterTag, Fade, FinalCard} from '../../engine/Overlays';
import {QualityName, QualityProvider, useQuality} from '../../engine/quality';
import {StyleProvider} from '../../engine/style';
import {Subtitles} from '../../engine/Subtitles';
import {TitleCard} from '../../engine/TitleCard';
import {AudioMix} from '../../engine/types';
import {useTime} from '../../engine/useTime';
import {heroPose} from './Animation/heroAnt';
import {add, lerp3, project, scl, V3} from './Animation/proj';
import {Item} from './Animation/render';
import {ANCHOR, cameraAt, Targets, viewAt} from './Camera/cameras';
import {antItems} from './Characters/Ant';
import {HERO} from './Characters/antSpec';
import {colonyPoses, colonyVisible} from './Colony/colony';
import {Forest} from './Environments/ForestLayer';
import {Atmosphere, ForegroundLeaves, Jungle} from './Environments/Jungle';
import {AcceleratedTag, DaysCard, FungusStage, InternalView, SporeView} from './Fungus/MicroViews';
import {SPORE_COUNT, sporeAt} from './Fungus/spores';
import {CUES, SPEECH} from './Subtitles/subtitles';
import {animT, EV, SCENES} from './Timeline/timeline';

export type Ep07FullProps = {quality: QualityName; showSubtitles: boolean; audio: AudioMix};

const win = (t: number, a: number, b: number, r = 0.5) => smoothstep(a, a + r, t) * (1 - smoothstep(b - r, b, t));

const Scene: React.FC<{showSubtitles: boolean; audio: AudioMix}> = ({showSubtitles, audio}) => {
  const t = useTime();
  const q = useQuality();
  const {width, height} = useVideoConfig();
  const detail = q.name === 'final' ? 1 : 0.6;
  const view = viewAt(t);
  const ta = animT(t); // tiempo de animación (cámara lenta puntual en la mordida)
  const hero = heroPose(ta);
  const colony = colonyVisible(t) ? colonyPoses(t) : [];
  // objetivo suavizado de la protagonista
  const heroAvg = scl([-0.25, 0, 0.25].map((d) => heroPose(animT(t + d)).pos).reduce((a, p) => add(a, p), [0, 0, 0] as V3), 1 / 3);
  const hero3 = antItems(view, HERO, hero, 'hero');
  const colC = colony.length ? scl(colony.reduce((a, c) => add(a, c.pose.pos), heroAvg), 1 / (colony.length + 1)) : heroAvg;
  const src = hero3.ascoma ?? hero3.stalkTop ?? hero.pos;
  const spores: V3[] = [];
  for (let i = 0; i < SPORE_COUNT; i++) {
    const p = sporeAt(i, t, src);
    if (p) spores.push(p);
  }
  const sporeC = spores.length ? scl(spores.reduce((a, p) => add(a, p), [0, 0, 0] as V3), 1 / spores.length) : src;
  const targets: Targets = {
    jungle: [-700, 1100, 0],
    branchDown: [-1700, 320, 0],
    colony: colC,
    hero: heroAvg,
    heroHead: hero3.headFront,
    leaf2: [1900, 1460, 100],
    grip: lerp3(hero3.headFront, hero.pos, 0.35),
    stalk: hero3.stalkTop ? lerp3(hero.pos, hero3.stalkTop, 0.5) : hero.pos,
    ascoma: hero3.ascoma ?? hero3.stalkTop ?? hero.pos,
    spores: sporeC,
    colonyFinal: colC,
  };
  const camera = cameraAt(t, view, targets);
  const ctx = {camera, viewport: {width, height}, anchor: ANCHOR};
  const toScreen = (p: V3): Vec => worldToScreen(ctx, 1, project(view, p));
  // salto temporal: ciclos de día y noche acelerados
  const dark = t > EV.days && t < 128.6 ? 0.55 * Math.pow(Math.max(0, Math.sin(((t - EV.days) / 2.05) * Math.PI)), 2) : 0;
  // ---------------- lista de dibujo
  const items: Item[] = [];
  items.push(...hero3.items);
  colony.forEach((c, i) => items.push(...antItems(view, c.spec, c.pose, `col${i}`).items));
  if (spores.length)
    items.push({
      z: 1e5,
      key: 'spores',
      node: (
        <g key="spores">
          {spores.map((p, i) => {
            const s = project(view, p);
            return <ellipse key={i} cx={s.x} cy={s.y} rx={4.5} ry={1.6} transform={`rotate(${(i * 37) % 180} ${s.x} ${s.y})`} fill="#f4ecd0" opacity={0.85} />;
          })}
        </g>
      ),
    });
  const mix: AudioMix = {...audio, music: audio.music ? {...audio.music, duck: SPEECH} : undefined};
  const headS = toScreen(hero3.headFront);
  const heroS = toScreen(hero.pos);
  const stalkS = hero3.stalkTop ? toScreen(lerp3(hero.pos, hero3.stalkTop, 0.7)) : null;
  const ascS = hero3.ascoma ? toScreen(hero3.ascoma) : null;
  const slow = win(t, 104.8, 106.8, 0.15);
  return (
    <CameraProvider {...ctx}>
      <AbsoluteFill style={{backgroundColor: '#1f3a26'}}>
        <Jungle zoom={camera.zoom} dark={dark} />
        <Forest view={view} t={t} detail={detail} dark={dark} extra={items} />
        <ForegroundLeaves zoom={camera.zoom} />
        <Atmosphere n={q.name === 'final' ? 60 : 30} drops={t < 22 || t > 170 ? 6 : 3} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 65% at 50% 45%, rgba(0,0,0,0) 55%, rgba(4,10,5,0.6) 100%)'}} />
        <AbsoluteFill style={{background: '#050a14', opacity: dark * 0.6}} />

        {t > 15.6 && t < 19.6 && <Callout x={heroS.x} y={heroS.y} side="right" dy={-220} text="Camponotus rufipes" sub="obrera · cuerpo negro, patas pardo-rojizas" appear={win(t, 15.8, 19.4, 0.4)} width={400} color="#ffd27a" />}
        {t > 23 && t < 26.2 && <Callout x={headS.x} y={headS.y} side="left" dy={-240} text="Antenas acodadas" sub="exploran el entorno" appear={win(t, 23.2, 26, 0.4)} width={340} />}
        {t > 104.2 && t < 109.6 && <Callout x={headS.x} y={headS.y} side="right" dy={-240} text="Mandíbulas" sub="sujetas a la nervadura del envés" appear={win(t, 104.4, 109.4, 0.4)} width={380} color="#c9f27a" />}
        {stalkS && t > 134 && t < 140 && <Callout x={stalkS.x} y={stalkS.y} side="right" dy={-200} text="Tallo del hongo" sub="emerge de detrás de la cabeza" appear={win(t, 134.2, 139.8, 0.4)} width={380} color="#f4ecd0" />}
        {ascS && t > 141 && t < 149.6 && <Callout x={ascS.x} y={ascS.y} side="left" dy={-220} text="Estructura fértil" sub="en un lado del tallo: produce esporas" appear={win(t, 141.2, 149.4, 0.4)} width={400} color="#f4ecd0" />}
        {t > 33.4 && t < 38.8 && (
          <div style={{position: 'absolute', left: 60, right: 60, top: 1290, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: win(t, 33.4, 38.8, 0.4)}}>
            <span style={{background: 'rgba(4,14,18,0.8)', borderRadius: 14, padding: '10px 20px', color: '#ffffff', fontWeight: 800, fontSize: 28}}>
              <i>Ophiocordyceps camponoti-rufipedis</i>
            </span>
            <div style={{color: '#bff3ff', fontWeight: 600, fontSize: 22, marginTop: 10}}>complejo O. unilateralis · descrito en Brasil (2011)</div>
          </div>
        )}
        {slow > 0.01 && <div style={{position: 'absolute', left: 60, top: 170, fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 30, letterSpacing: 4, color: '#ffffff', opacity: slow}}>● CÁMARA LENTA</div>}

        <SporeView />
        <InternalView />
        <FungusStage />
        <DaysCard />
        <AcceleratedTag />

        <TitleCard start={16.0} end={20.4} kicker="EL HONGO QUE CONTROLA" title="A LAS HORMIGAS" centerY={0.14} accent="#f4ecd0" titleSize={84} />
        {SCENES.slice(1).map((sc) => (
          <ChapterTag key={sc.n} start={sc.start + 0.5} num={`0${sc.n}`} label={sc.title} />
        ))}
        <FinalCard start={EV.final} question="¿CONOCÍAS ESTE HONGO?" accent={/HONGO/} accentColor="#f4ecd0" footer="Ophiocordyceps · Camponotus rufipes · EPISODIO 07" />

        <Fade from={0} to={0.8} inverse />
        {showSubtitles && <Subtitles cues={CUES} centerY={0.8} />}
        <AudioTracks mix={mix} />
      </AbsoluteFill>
    </CameraProvider>
  );
};

export const Ep07Full: React.FC<Ep07FullProps> = ({quality, showSubtitles, audio}) => {
  ensureFonts();
  return (
    <QualityProvider quality={quality}>
      <StyleProvider refined>
        <Scene showSubtitles={showSubtitles} audio={audio} />
      </StyleProvider>
    </QualityProvider>
  );
};
